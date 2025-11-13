import crypto from 'crypto';
import { Difficulty, OutcomeConfig, GAME_CONFIG, CellType } from '@shared/gameTypes';

/**
 * Provably Fair Random Number Generator
 * Uses cryptographically secure random bytes for fairness
 */
export class ProbabilityEngine {
  /**
   * Generate a cryptographically secure random seed
   */
  static generateSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a random number between 0 and 1 using seed
   * This allows for provably fair verification
   */
  static seededRandom(seed: string, nonce: number): number {
    const hash = crypto
      .createHash('sha256')
      .update(`${seed}-${nonce}`)
      .digest('hex');
    
    // Convert first 8 bytes to number between 0 and 1
    const num = parseInt(hash.substring(0, 16), 16);
    const max = parseInt('ffffffffffffffff', 16);
    return num / max;
  }

  /**
   * Select outcome based on probability distribution
   */
  static selectOutcome(difficulty: Difficulty, seed: string, nonce: number): OutcomeConfig {
    const outcomes = GAME_CONFIG.difficulties[difficulty].outcomes;
    const random = this.seededRandom(seed, nonce);
    
    let cumulativeProbability = 0;
    for (const outcome of outcomes) {
      cumulativeProbability += outcome.probability;
      if (random <= cumulativeProbability) {
        return outcome;
      }
    }
    
    // Fallback to last outcome (should never reach here if probabilities sum to 1)
    return outcomes[outcomes.length - 1];
  }

  /**
   * Generate grid layout based on outcome
   */
  static generateGrid(
    outcome: OutcomeConfig,
    seed: string,
    nonce: number,
    gridSize: number = 5
  ): CellType[][] {
    const totalCells = gridSize * gridSize;
    const cells: CellType[] = [];
    
    // Add traps
    for (let i = 0; i < outcome.trapCount; i++) {
      cells.push('trap');
    }
    
    // Add treasures based on values
    outcome.treasureValues.forEach((value) => {
      if (value >= 1000) {
        cells.push('jackpot');
      } else if (value >= 500) {
        cells.push('big_treasure');
      } else if (value >= 100) {
        cells.push('medium_treasure');
      } else {
        cells.push('small_treasure');
      }
    });
    
    // Fill remaining with empty cells
    while (cells.length < totalCells) {
      cells.push('empty');
    }
    
    // Shuffle using seeded random
    const shuffled = this.shuffleArray(cells, seed, nonce);
    
    // Convert to 2D grid
    const grid: CellType[][] = [];
    for (let y = 0; y < gridSize; y++) {
      const row: CellType[] = [];
      for (let x = 0; x < gridSize; x++) {
        row.push(shuffled[y * gridSize + x]);
      }
      grid.push(row);
    }
    
    return grid;
  }

  /**
   * Shuffle array using seeded random (Fisher-Yates algorithm)
   */
  static shuffleArray<T>(array: T[], seed: string, nonce: number): T[] {
    const shuffled = [...array];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const random = this.seededRandom(seed, nonce + i);
      const j = Math.floor(random * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }

  /**
   * Get treasure value based on cell type
   */
  static getTreasureValue(cellType: CellType, betAmount: number): number {
    // Updated multipliers for balanced 94.5% RTP
    switch (cellType) {
      case 'jackpot':
        return betAmount * 7;  // Reduced from 10x
      case 'big_treasure':
        return betAmount * 2.5;  // Reduced from 3x
      case 'medium_treasure':
        return betAmount * 1.2;  // Reduced from 1.5x
      case 'small_treasure':
        return betAmount * 0.4;  // Reduced from 0.5x
      default:
        return 0;
    }
  }

  /**
   * Calculate payout for Quick Play mode
   */
  static calculateQuickPlayPayout(betAmount: number, seed: string): number {
    const rtp = GAME_CONFIG.quickPlay.rtp;
    const minReturn = GAME_CONFIG.quickPlay.minReturn;
    
    // Random multiplier between minReturn and (2 * rtp)
    const random = this.seededRandom(seed, 0);
    const maxMultiplier = 2 * rtp;
    const multiplier = minReturn + random * (maxMultiplier - minReturn);
    
    return Math.floor(betAmount * multiplier);
  }

  /**
   * Verify game fairness using seed
   * This allows players to verify that the outcome was predetermined
   */
  static verifyFairness(
    seed: string,
    difficulty: Difficulty,
    nonce: number,
    expectedOutcome: string
  ): boolean {
    const outcome = this.selectOutcome(difficulty, seed, nonce);
    return outcome.name === expectedOutcome;
  }

  /**
   * Get safe cells (not traps) for power-up effects
   */
  static getSafeCells(grid: CellType[][], count: number, seed: string, nonce: number): { x: number; y: number }[] {
    const safeCells: { x: number; y: number }[] = [];
    
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] !== 'trap') {
          safeCells.push({ x, y });
        }
      }
    }
    
    // Shuffle and take first 'count' cells
    const shuffled = this.shuffleArray(safeCells, seed, nonce + 1000);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Get cells with treasures for power-up effects
   */
  static getTreasureCells(grid: CellType[][]): { x: number; y: number; type: CellType }[] {
    const treasureCells: { x: number; y: number; type: CellType }[] = [];
    
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cellType = grid[y][x];
        if (cellType !== 'trap' && cellType !== 'empty') {
          treasureCells.push({ x, y, type: cellType });
        }
      }
    }
    
    return treasureCells;
  }

  /**
   * Find nearest treasure to a given position
   */
  static findNearestTreasure(
    grid: CellType[][],
    fromX: number,
    fromY: number
  ): { x: number; y: number; distance: number } | null {
    const treasures = this.getTreasureCells(grid);
    
    if (treasures.length === 0) return null;
    
    let nearest = treasures[0];
    let minDistance = this.manhattanDistance(fromX, fromY, nearest.x, nearest.y);
    
    for (const treasure of treasures.slice(1)) {
      const distance = this.manhattanDistance(fromX, fromY, treasure.x, treasure.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = treasure;
      }
    }
    
    return { x: nearest.x, y: nearest.y, distance: minDistance };
  }

  /**
   * Calculate Manhattan distance between two points
   */
  static manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  /**
   * Get direction hint (for magic compass power-up)
   */
  static getDirectionHint(fromX: number, fromY: number, toX: number, toY: number): string {
    const dx = toX - fromX;
    const dy = toY - fromY;
    
    const horizontal = dx > 0 ? 'right' : dx < 0 ? 'left' : '';
    const vertical = dy > 0 ? 'down' : dy < 0 ? 'up' : '';
    
    if (horizontal && vertical) {
      return `${vertical}-${horizontal}`;
    }
    return horizontal || vertical || 'here';
  }
}

