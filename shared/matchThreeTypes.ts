// Symbol types for Match Three game
export type SymbolType = 
  | "cherry" 
  | "lemon" 
  | "orange" 
  | "plum" 
  | "grape" 
  | "watermelon" 
  | "seven" 
  | "bar" 
  | "wild";

// Reel symbol structure
export interface ReelSymbol {
  type: SymbolType;
  position: number;
}

// Winning line structure
export interface WinningLine {
  symbols: SymbolType[];
  positions: number[];
  payout: number;
}

// Spin result structure
export interface SpinResult {
  reels: ReelSymbol[][];
  winningLines: WinningLine[];
  totalWin: number;
  isJackpot: boolean;
  isFreeSpins: boolean;
  freeSpinsCount?: number;
}

// Game configuration constants
export const MIN_REELS = 3;
export const MAX_REELS = 5;
export const ROWS = 3;

// Wild expansion chance (percentage)
export const WILD_EXPANSION_CHANCE = 0.15; // 15%

// Symbol payouts (multipliers based on bet amount)
export const SYMBOL_PAYOUTS: Record<SymbolType, number[]> = {
  cherry: [2, 5, 10],      // 3, 4, 5 matches
  lemon: [2, 5, 10],
  orange: [3, 7, 15],
  plum: [3, 7, 15],
  grape: [5, 10, 25],
  watermelon: [5, 10, 25],
  seven: [10, 25, 100],
  bar: [10, 25, 100],
  wild: [20, 50, 200],     // Wild symbols have highest payout
};
