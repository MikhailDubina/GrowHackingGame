import { getDb } from "../db";
import { progressiveJackpot, jackpotWins, balances, transactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const JACKPOT_CONTRIBUTION_RATE = 0.01; // 1% of each bet
const JACKPOT_ID = "global";

/**
 * Contribute to the progressive jackpot
 */
export async function contributeToJackpot(betAmount: number): Promise<void> {
  const contribution = Math.floor(betAmount * JACKPOT_CONTRIBUTION_RATE);
  
  if (contribution <= 0) return;

  const db = await getDb();
  if (!db) {
    console.error("[Jackpot] Database not available");
    return;
  }

  try {
    // Get current jackpot
    const [jackpot] = await db
      .select()
      .from(progressiveJackpot)
      .where(eq(progressiveJackpot.id, JACKPOT_ID))
      .limit(1);

    if (!jackpot) {
      // Initialize jackpot if it doesn't exist
      await db.insert(progressiveJackpot).values({
        id: JACKPOT_ID,
        currentAmount: contribution,
        totalContributions: contribution,
        updatedAt: new Date(),
      });
    } else {
      // Update jackpot
      await db
        .update(progressiveJackpot)
        .set({
          currentAmount: jackpot.currentAmount + contribution,
          totalContributions: jackpot.totalContributions + contribution,
          updatedAt: new Date(),
        })
        .where(eq(progressiveJackpot.id, JACKPOT_ID));
    }

    console.log(`[Jackpot] Contributed ${contribution} coins (from bet ${betAmount})`);
  } catch (error) {
    console.error("[Jackpot] Error contributing to jackpot:", error);
  }
}

/**
 * Get current jackpot amount
 */
export async function getCurrentJackpot(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const [jackpot] = await db
      .select()
      .from(progressiveJackpot)
      .where(eq(progressiveJackpot.id, JACKPOT_ID))
      .limit(1);

    return jackpot?.currentAmount || 0;
  } catch (error) {
    console.error("[Jackpot] Error getting current jackpot:", error);
    return 0;
  }
}

/**
 * Award jackpot to a player
 */
export async function awardJackpot(
  userId: string,
  roundId: string
): Promise<{ success: boolean; amount: number }> {
  const db = await getDb();
  if (!db) {
    return { success: false, amount: 0 };
  }

  try {
    // Get current jackpot
    const [jackpot] = await db
      .select()
      .from(progressiveJackpot)
      .where(eq(progressiveJackpot.id, JACKPOT_ID))
      .limit(1);

    if (!jackpot || jackpot.currentAmount <= 0) {
      console.log("[Jackpot] No jackpot to award");
      return { success: false, amount: 0 };
    }

    const amount = jackpot.currentAmount;

    // Record jackpot win
    await db.insert(jackpotWins).values({
      id: nanoid(),
      userId,
      roundId,
      amount,
      wonAt: new Date(),
    });

    // Reset jackpot to seed amount (10,000 coins)
    const seedAmount = 10000;
    await db
      .update(progressiveJackpot)
      .set({
        currentAmount: seedAmount,
        lastWinnerId: userId,
        lastWonAt: new Date(),
        totalPayouts: jackpot.totalPayouts + amount,
        updatedAt: new Date(),
      })
      .where(eq(progressiveJackpot.id, JACKPOT_ID));

    // Add jackpot to user balance
    const [currentBalance] = await db
      .select()
      .from(balances)
      .where(eq(balances.userId, userId))
      .limit(1);

    const newBalance = (currentBalance?.coins || 0) + amount;

    await db
      .update(balances)
      .set({
        coins: newBalance,
        totalWon: (currentBalance?.totalWon || 0) + amount,
        updatedAt: new Date(),
      })
      .where(eq(balances.userId, userId));

    // Record transaction
    await db.insert(transactions).values({
      id: nanoid(),
      userId,
      type: "jackpot_win",
      amount,
      balanceBefore: currentBalance?.coins || 0,
      balanceAfter: newBalance,
      metadata: JSON.stringify({
        roundId,
        jackpotAmount: amount,
      }),
    });

    console.log(`[Jackpot] Awarded ${amount} coins to user ${userId}`);

    return { success: true, amount };
  } catch (error) {
    console.error("[Jackpot] Error awarding jackpot:", error);
    return { success: false, amount: 0 };
  }
}

/**
 * Check if jackpot should be awarded (6 Bar symbols)
 */
export function shouldAwardJackpot(reels: any[][], activeReels: number): boolean {
  // Check each row for 6 Bar symbols
  for (let row = 0; row < 3; row++) {
    let barCount = 0;
    
    for (let reel = 0; reel < activeReels && reel < 6; reel++) {
      if (reels[reel] && reels[reel][row] && reels[reel][row].type === "bar") {
        barCount++;
      }
    }
    
    // Jackpot requires 6 Bar symbols in a row
    if (barCount === 6 && activeReels === 6) {
      return true;
    }
  }
  
  return false;
}
