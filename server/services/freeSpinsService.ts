import { ReelSymbol } from "../../shared/matchThreeTypes";

const FREE_SPINS_COUNT = 10;
const FREE_SPINS_MULTIPLIER = 2;
const MIN_WILDS_FOR_FREE_SPINS = 3;

/**
 * Check if free spins should be triggered (3+ Wild symbols)
 */
export function shouldTriggerFreeSpins(reels: ReelSymbol[][], activeReels: number): boolean {
  let wildCount = 0;
  
  // Count all visible wild symbols
  for (let reel = 0; reel < activeReels && reel < reels.length; reel++) {
    for (const symbol of reels[reel]) {
      if (symbol.isWild) {
        wildCount++;
      }
    }
  }
  
  return wildCount >= MIN_WILDS_FOR_FREE_SPINS;
}

/**
 * Get free spins configuration
 */
export function getFreeSpinsConfig() {
  return {
    count: FREE_SPINS_COUNT,
    multiplier: FREE_SPINS_MULTIPLIER,
    minWilds: MIN_WILDS_FOR_FREE_SPINS,
  };
}

/**
 * Apply free spins multiplier to win amount
 */
export function applyFreeSpinsMultiplier(winAmount: number, multiplier: number): number {
  return winAmount * multiplier;
}
