import { randomUUID } from 'crypto';
import {
  GameState,
  Cell,
  MoveResult,
  Difficulty,
  PowerUpType,
  PowerUpEffect,
  CellState,
  GAME_CONFIG,
  QuickPlayResult,
} from '@shared/gameTypes';
import { ProbabilityEngine } from './probabilityEngine';

/**
 * Core game engine for Treasure Hunt
 */
export class GameEngine {
  /**
   * Initialize a new game round
   */
  static initializeGame(
    userId: string,
    difficulty: Difficulty,
    betAmount: number
  ): GameState {
    const config = GAME_CONFIG.difficulties[difficulty];
    const seed = ProbabilityEngine.generateSeed();
    const outcome = ProbabilityEngine.selectOutcome(difficulty, seed, 0);
    const gridLayout = ProbabilityEngine.generateGrid(outcome, seed, 1, config.gridSize);

    // Create cell objects with state
    const grid: Cell[][] = [];
    for (let y = 0; y < config.gridSize; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < config.gridSize; x++) {
        const cellType = gridLayout[y][x];
        row.push({
          x,
          y,
          type: cellType,
          state: 'hidden',
          value: ProbabilityEngine.getTreasureValue(cellType, betAmount),
        });
      }
      grid.push(row);
    }

    return {
      roundId: randomUUID(),
      userId,
      difficulty,
      betAmount,
      entryCost: config.entryCost,
      grid,
      revealedCells: 0,
      totalMoves: 0,
      maxMoves: config.maxMoves,
      currentBalance: 0,
      powerUpsUsed: [],
      status: 'active',
      payout: 0,
      profitLoss: -(betAmount + config.entryCost),
      seed,
      createdAt: new Date(),
    };
  }

  /**
   * Process a player move (reveal a cell)
   */
  static makeMove(gameState: GameState, x: number, y: number): MoveResult {
    // Validate move
    if (gameState.status !== 'active') {
      return {
        success: false,
        cell: gameState.grid[y][x],
        gameState,
        message: 'Game is not active',
        gameOver: true,
        payout: gameState.payout,
      };
    }

    if (x < 0 || x >= gameState.grid[0].length || y < 0 || y >= gameState.grid.length) {
      return {
        success: false,
        cell: gameState.grid[0][0],
        gameState,
        message: 'Invalid cell coordinates',
        gameOver: false,
        payout: 0,
      };
    }

    const cell = gameState.grid[y][x];

    if (cell.state === 'revealed') {
      return {
        success: false,
        cell,
        gameState,
        message: 'Cell already revealed',
        gameOver: false,
        payout: 0,
      };
    }

    // Reveal the cell
    cell.state = 'revealed';
    gameState.revealedCells++;
    gameState.totalMoves++;

    // Check if trap
    if (cell.type === 'trap') {
      gameState.status = 'lost';
      gameState.payout = 0;
      gameState.profitLoss = -(gameState.betAmount + gameState.entryCost);

      return {
        success: true,
        cell,
        gameState,
        message: 'You hit a trap! Game over.',
        gameOver: true,
        payout: 0,
      };
    }

    // Add treasure value to payout
    if (cell.value > 0) {
      gameState.payout += cell.value;
      gameState.profitLoss = gameState.payout - (gameState.betAmount + gameState.entryCost);
    }

    // Check if max moves reached
    if (gameState.totalMoves >= gameState.maxMoves) {
      gameState.status = 'won';
      return {
        success: true,
        cell,
        gameState,
        message: `You survived all moves! Total payout: ${gameState.payout} coins`,
        gameOver: true,
        payout: gameState.payout,
      };
    }

    return {
      success: true,
      cell,
      gameState,
      message: cell.value > 0 ? `Found treasure worth ${cell.value} coins!` : 'Safe cell',
      gameOver: false,
      payout: gameState.payout,
    };
  }

  /**
   * Cash out early (end game and take current payout)
   */
  static cashOut(gameState: GameState): MoveResult {
    if (gameState.status !== 'active') {
      return {
        success: false,
        cell: gameState.grid[0][0],
        gameState,
        message: 'Game is not active',
        gameOver: true,
        payout: gameState.payout,
      };
    }

    gameState.status = 'cashout';
    
    return {
      success: true,
      cell: gameState.grid[0][0],
      gameState,
      message: `Cashed out with ${gameState.payout} coins`,
      gameOver: true,
      payout: gameState.payout,
    };
  }

  /**
   * Apply power-up effect
   */
  static applyPowerUp(
    gameState: GameState,
    powerUpType: PowerUpType
  ): PowerUpEffect {
    const gridSize = gameState.grid.length;
    const gridLayout = gameState.grid.map(row => row.map(cell => cell.type));

    switch (powerUpType) {
      case 'metal_detector': {
        // Reveal 3 safe cells (show hints)
        const safeCells = ProbabilityEngine.getSafeCells(
          gridLayout,
          3,
          gameState.seed,
          gameState.totalMoves + 100
        );

        safeCells.forEach(({ x, y }) => {
          if (gameState.grid[y][x].state === 'hidden') {
            gameState.grid[y][x].state = 'safe_hint';
          }
        });

        gameState.powerUpsUsed.push(powerUpType);

        return {
          type: powerUpType,
          affectedCells: safeCells,
          description: `Revealed ${safeCells.length} safe cells`,
        };
      }

      case 'treasure_map': {
        // Automatically open 2 safe cells
        const safeCells = ProbabilityEngine.getSafeCells(
          gridLayout,
          2,
          gameState.seed,
          gameState.totalMoves + 200
        );

        const affectedCells: { x: number; y: number }[] = [];

        safeCells.forEach(({ x, y }) => {
          if (gameState.grid[y][x].state === 'hidden') {
            const cell = gameState.grid[y][x];
            cell.state = 'revealed';
            gameState.revealedCells++;
            gameState.totalMoves++;

            if (cell.value > 0) {
              gameState.payout += cell.value;
              gameState.profitLoss = gameState.payout - (gameState.betAmount + gameState.entryCost);
            }

            affectedCells.push({ x, y });
          }
        });

        gameState.powerUpsUsed.push(powerUpType);

        return {
          type: powerUpType,
          affectedCells,
          description: `Automatically opened ${affectedCells.length} safe cells`,
        };
      }

      case 'magic_compass': {
        // Show direction to nearest treasure
        const treasures = ProbabilityEngine.getTreasureCells(gridLayout);
        const unrevealedTreasures = treasures.filter(
          ({ x, y }) => gameState.grid[y][x].state === 'hidden'
        );

        if (unrevealedTreasures.length === 0) {
          return {
            type: powerUpType,
            affectedCells: [],
            description: 'No hidden treasures remaining',
          };
        }

        // Find center of grid as reference point
        const centerX = Math.floor(gridSize / 2);
        const centerY = Math.floor(gridSize / 2);

        const nearest = ProbabilityEngine.findNearestTreasure(
          gridLayout,
          centerX,
          centerY
        );

        if (!nearest) {
          return {
            type: powerUpType,
            affectedCells: [],
            description: 'No treasures found',
          };
        }

        const direction = ProbabilityEngine.getDirectionHint(
          centerX,
          centerY,
          nearest.x,
          nearest.y
        );

        gameState.powerUpsUsed.push(powerUpType);

        return {
          type: powerUpType,
          affectedCells: [{ x: nearest.x, y: nearest.y }],
          description: `Treasure is ${direction} (distance: ${nearest.distance})`,
        };
      }

      default:
        return {
          type: powerUpType,
          affectedCells: [],
          description: 'Unknown power-up',
        };
    }
  }

  /**
   * Execute Quick Play mode (automated gameplay)
   */
  static executeQuickPlay(
    userId: string,
    difficulty: Difficulty,
    betAmount: number
  ): QuickPlayResult {
    const seed = ProbabilityEngine.generateSeed();
    const payout = ProbabilityEngine.calculateQuickPlayPayout(betAmount, seed);
    const entryCost = GAME_CONFIG.difficulties[difficulty].entryCost;
    const totalCost = betAmount + entryCost;
    const profitLoss = payout - totalCost;
    const outcome = payout > totalCost ? 'win' : 'loss';

    return {
      roundId: randomUUID(),
      totalMoves: GAME_CONFIG.quickPlay.autoMoves,
      outcome,
      payout,
      profitLoss,
      summary: `Quick Play completed: ${outcome === 'win' ? 'Won' : 'Lost'} ${Math.abs(profitLoss)} coins`,
    };
  }

  /**
   * Validate if player can afford the game
   */
  static canAffordGame(
    balance: number,
    betAmount: number,
    difficulty: Difficulty
  ): { canAfford: boolean; required: number; message: string } {
    const entryCost = GAME_CONFIG.difficulties[difficulty].entryCost;
    const required = betAmount + entryCost;

    if (balance < required) {
      return {
        canAfford: false,
        required,
        message: `Insufficient balance. Need ${required} coins (bet: ${betAmount} + entry: ${entryCost})`,
      };
    }

    return {
      canAfford: true,
      required,
      message: 'Sufficient balance',
    };
  }

  /**
   * Calculate game statistics
   */
  static calculateStats(gameState: GameState): {
    safetyRate: number;
    treasuresFound: number;
    totalTreasures: number;
    efficiency: number;
  } {
    let treasuresFound = 0;
    let totalTreasures = 0;

    gameState.grid.forEach(row => {
      row.forEach(cell => {
        if (cell.type !== 'trap' && cell.type !== 'empty') {
          totalTreasures++;
          if (cell.state === 'revealed') {
            treasuresFound++;
          }
        }
      });
    });

    const safetyRate = gameState.revealedCells > 0
      ? (gameState.revealedCells / gameState.totalMoves) * 100
      : 0;

    const efficiency = totalTreasures > 0
      ? (treasuresFound / totalTreasures) * 100
      : 0;

    return {
      safetyRate,
      treasuresFound,
      totalTreasures,
      efficiency,
    };
  }
}

