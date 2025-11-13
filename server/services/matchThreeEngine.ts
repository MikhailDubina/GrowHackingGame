import { 
  SymbolType, 
  ReelSymbol, 
  SpinResult, 
  WinningLine,
  SYMBOL_PAYOUTS,
  WILD_EXPANSION_CHANCE,
  MIN_REELS,
  MAX_REELS,
  ROWS
} from "../../shared/matchThreeTypes";

const SYMBOLS: SymbolType[] = [
  "cherry", "lemon", "orange", "plum", 
  "grape", "watermelon", "seven", "bar"
];

const WILD_SYMBOL: SymbolType = "wild";

/**
 * Generate a random symbol with weighted probabilities
 */
function generateSymbol(includeWild: boolean = true): SymbolType {
  const random = Math.random();
  
  // Wild has 8% chance if included (reduced for balance)
  if (includeWild && random < 0.08) {
    return WILD_SYMBOL;
  }
  
  // Adjusted probabilities for better RTP balance
  // Common symbols: 60% total
  if (random < 0.35) return "cherry";  // 35%
  if (random < 0.60) return "lemon";   // 25%
  
  // Medium symbols: 25% total
  if (random < 0.75) return "orange";  // 15%
  if (random < 0.85) return "plum";    // 10%
  
  // Rare symbols: 11% total
  if (random < 0.92) return "grape";   // 7%
  if (random < 0.96) return "watermelon"; // 4%
  
  // Very rare symbols: 4% total
  if (random < 0.98) return "seven";   // 2%
  return "bar";                        // 2%
}

/**
 * Generate a single reel with 3 symbols
 */
function generateReel(): ReelSymbol[] {
  const reel: ReelSymbol[] = [];
  for (let i = 0; i < ROWS; i++) {
    const symbolType = generateSymbol();
    reel.push({
      type: symbolType,
      position: i,
      isWild: symbolType === WILD_SYMBOL,
    });
  }
  return reel;
}

/**
 * Check for winning lines in the reels
 */
function checkWinningLines(reels: ReelSymbol[][], activeReels: number, betAmount: number): {
  winningLines: WinningLine[];
  totalWin: number;
} {
  const winningLines: WinningLine[] = [];
  let totalWin = 0;

  // Check each row for winning combinations
  for (let row = 0; row < ROWS; row++) {
    const line: SymbolType[] = [];
    
    // Collect symbols from active reels in this row
    for (let reel = 0; reel < activeReels; reel++) {
      if (reels[reel] && reels[reel][row]) {
        line.push(reels[reel][row].type);
      }
    }

    // Find matching symbols (considering wilds)
    if (line.length >= 3) {
      const result = findMatches(line);
      if (result) {
        const payoutMultiplier = SYMBOL_PAYOUTS[result.symbol][result.count - 3] || 0;
        const payout = betAmount * payoutMultiplier;
        
        if (payout > 0) {
          winningLines.push({
            symbols: result.symbol,
            count: result.count,
            positions: result.positions,
            payout,
          });
          totalWin += payout;
        }
      }
    }
  }

  return { winningLines, totalWin };
}

/**
 * Find matching symbols in a line (with wild substitution)
 */
function findMatches(line: SymbolType[]): {
  symbol: SymbolType;
  count: number;
  positions: number[];
} | null {
  if (line.length < 3) return null;

  // Count from left to right
  let firstNonWild: SymbolType | null = null;
  let count = 0;
  const positions: number[] = [];

  for (let i = 0; i < line.length; i++) {
    const symbol = line[i];
    
    if (symbol === WILD_SYMBOL) {
      count++;
      positions.push(i);
    } else if (firstNonWild === null) {
      firstNonWild = symbol;
      count++;
      positions.push(i);
    } else if (symbol === firstNonWild) {
      count++;
      positions.push(i);
    } else {
      break; // No more matches
    }
  }

  // Need at least 3 matching symbols
  if (count >= 3 && firstNonWild) {
    return {
      symbol: firstNonWild,
      count,
      positions,
    };
  }

  return null;
}

/**
 * Check if wild expansion should trigger
 */
function shouldExpandWild(activeReels: number): boolean {
  if (activeReels >= MAX_REELS) return false;
  // Reduced expansion chance to 10% for economic balance
  return Math.random() < 0.10;
}

/**
 * Perform a spin
 */
export function performSpin(activeReels: number, betAmount: number): SpinResult {
  // Generate reels
  const reels: ReelSymbol[][] = [];
  for (let i = 0; i < MAX_REELS; i++) {
    reels.push(generateReel());
  }

  // Check for wins on active reels
  const { winningLines, totalWin } = checkWinningLines(reels, activeReels, betAmount);

  // Check for wild expansion
  let wildTriggered = false;
  let newActiveReels = activeReels;

  // Wild expansion triggers if there's at least one wild symbol visible
  const hasWild = reels.slice(0, activeReels).some(reel => 
    reel.some(symbol => symbol.isWild)
  );

  if (hasWild && shouldExpandWild(activeReels)) {
    wildTriggered = true;
    newActiveReels = Math.min(activeReels + 1, MAX_REELS);
  }

  return {
    reels,
    activeReels,
    winningLines,
    totalWin,
    wildTriggered,
    newActiveReels: wildTriggered ? newActiveReels : undefined,
  };
}

/**
 * Calculate RTP for the game
 */
export function calculateRTP(activeReels: number): number {
  // Base RTP increases with more active reels
  const baseRTP = 0.94; // 94% base RTP
  const reelBonus = (activeReels - 1) * 0.005; // +0.5% per additional reel
  return Math.min(baseRTP + reelBonus, 0.97); // Cap at 97%
}
