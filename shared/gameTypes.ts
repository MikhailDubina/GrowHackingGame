// Difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard';

// Cell types in the grid
export type CellType = 'safe' | 'treasure' | 'bomb' | 'multiplier';

// Cell state
export type CellState = 'hidden' | 'revealed';

// Power-up types
export type PowerUpType = 'reveal' | 'shield' | 'multiplier' | 'second_chance';

// Cell structure
export interface Cell {
  id: string;
  type: CellType;
  state: CellState;
  value?: number;
  multiplier?: number;
}

// Power-up effect
export interface PowerUpEffect {
  type: PowerUpType;
  active: boolean;
  usesRemaining?: number;
}

// Game state
export interface GameState {
  id: string;
  userId: string;
  difficulty: Difficulty;
  betAmount: number;
  grid: Cell[][];
  revealedCells: number;
  currentMultiplier: number;
  totalWin: number;
  powerUps: PowerUpEffect[];
  status: 'active' | 'won' | 'lost' | 'cashed_out';
  seed: string;
  createdAt: Date;
}

// Move result
export interface MoveResult {
  cell: Cell;
  gameState: GameState;
  win: number;
  gameOver: boolean;
  message: string;
}

// Quick play result
export interface QuickPlayResult {
  result: 'win' | 'loss';
  winAmount: number;
  multiplier: number;
  revealedCells: number;
  totalCells: number;
}

// Outcome configuration
export interface OutcomeConfig {
  type: 'win' | 'loss';
  probability: number;
  treasureCount: number;
  bombCount: number;
  multiplierCount: number;
  minMultiplier: number;
  maxMultiplier: number;
}

// Difficulty configuration
export interface DifficultyConfig {
  gridSize: number;
  basePayout: number;
  outcomes: OutcomeConfig[];
}

// Game configuration
export const GAME_CONFIG = {
  difficulties: {
    easy: {
      gridSize: 16, // 4x4 grid
      basePayout: 1.5,
      outcomes: [
        {
          type: 'win' as const,
          probability: 0.6,
          treasureCount: 8,
          bombCount: 4,
          multiplierCount: 2,
          minMultiplier: 1.2,
          maxMultiplier: 2.0,
        },
        {
          type: 'loss' as const,
          probability: 0.4,
          treasureCount: 4,
          bombCount: 8,
          multiplierCount: 1,
          minMultiplier: 1.1,
          maxMultiplier: 1.5,
        },
      ],
    },
    medium: {
      gridSize: 25, // 5x5 grid
      basePayout: 2.0,
      outcomes: [
        {
          type: 'win' as const,
          probability: 0.5,
          treasureCount: 12,
          bombCount: 8,
          multiplierCount: 3,
          minMultiplier: 1.5,
          maxMultiplier: 3.0,
        },
        {
          type: 'loss' as const,
          probability: 0.5,
          treasureCount: 6,
          bombCount: 14,
          multiplierCount: 2,
          minMultiplier: 1.2,
          maxMultiplier: 2.0,
        },
      ],
    },
    hard: {
      gridSize: 36, // 6x6 grid
      basePayout: 3.0,
      outcomes: [
        {
          type: 'win' as const,
          probability: 0.4,
          treasureCount: 16,
          bombCount: 14,
          multiplierCount: 4,
          minMultiplier: 2.0,
          maxMultiplier: 5.0,
        },
        {
          type: 'loss' as const,
          probability: 0.6,
          treasureCount: 8,
          bombCount: 22,
          multiplierCount: 2,
          minMultiplier: 1.3,
          maxMultiplier: 2.5,
        },
      ],
    },
  },
  powerUps: {
    reveal: {
      cost: 100,
      description: 'Reveal a safe cell',
    },
    shield: {
      cost: 200,
      description: 'Protect from one bomb',
    },
    multiplier: {
      cost: 150,
      description: 'Double your next win',
    },
    second_chance: {
      cost: 300,
      description: 'Continue after hitting a bomb',
    },
  },
};
