import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { balances, matchThreeRounds, playerStats, transactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { performSpin } from "../services/matchThreeEngine";
import { MIN_REELS } from "../../shared/matchThreeTypes";
import { contributeToJackpot, getCurrentJackpot, awardJackpot, shouldAwardJackpot } from "../services/jackpotService";
import { shouldTriggerFreeSpins, getFreeSpinsConfig, applyFreeSpinsMultiplier } from "../services/freeSpinsService";

export const matchThreeRouter = router({
  /**
   * Start a new Match Three game round
   */
  startRound: protectedProcedure
    .input(
      z.object({
        betAmount: z.number().min(10).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      const userId = ctx.user.id;

      // Check user balance
      const [userBalance] = await db
        .select()
        .from(balances)
        .where(eq(balances.userId, userId))
        .limit(1);

      if (!userBalance || userBalance.coins < input.betAmount) {
        throw new Error("Insufficient balance");
      }

      // Deduct bet amount
      const newBalance = userBalance.coins - input.betAmount;
      await db
        .update(balances)
        .set({ coins: newBalance, updatedAt: new Date() })
        .where(eq(balances.userId, userId));

      // Contribute 1% to progressive jackpot
      await contributeToJackpot(input.betAmount);

      // Create game round in database
      const roundId = nanoid();
      
      await db.insert(matchThreeRounds).values({
        id: roundId,
        userId,
        betAmount: input.betAmount,
        activeReels: MIN_REELS, // Start with 3 reels
        currentWin: 0,
        spinsRemaining: 1,
        freeSpinsRemaining: 0,
        freeSpinsMultiplier: 1,
        inFreeSpins: false,
        gameOver: false,
      });

      return {
        roundId,
        betAmount: input.betAmount,
        activeReels: MIN_REELS,
        balance: newBalance,
      };
    }),

  /**
   * Perform a spin
   */
  spin: protectedProcedure
    .input(
      z.object({
        roundId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      const userId = ctx.user.id;

      // Retrieve game state from database
      const [round] = await db
        .select()
        .from(matchThreeRounds)
        .where(eq(matchThreeRounds.id, input.roundId))
        .limit(1);

      if (!round) {
        throw new Error("Round not found");
      }

      if (round.userId !== userId) {
        throw new Error("Unauthorized");
      }

      if (round.gameOver) {
        throw new Error("Game already over");
      }

      if (round.spinsRemaining <= 0) {
        throw new Error("No spins remaining");
      }

      // Perform spin with stored state
      const spinResult = performSpin(round.activeReels, round.betAmount);

      // Check for jackpot win (6 Bar symbols)
      let jackpotWon = 0;
      if (shouldAwardJackpot(spinResult.reels, round.activeReels)) {
        const jackpotResult = await awardJackpot(userId, input.roundId);
        if (jackpotResult.success) {
          jackpotWon = jackpotResult.amount;
          console.log(`[Match Three] JACKPOT WON! User ${userId} won ${jackpotWon} coins`);
        }
      }

      // Check for free spins trigger (3+ Wilds)
      let freeSpinsTriggered = false;
      let newFreeSpinsRemaining = round.freeSpinsRemaining;
      let newFreeSpinsMultiplier = round.freeSpinsMultiplier;
      let inFreeSpins = round.inFreeSpins;

      if (!round.inFreeSpins && shouldTriggerFreeSpins(spinResult.reels, round.activeReels)) {
        const config = getFreeSpinsConfig();
        freeSpinsTriggered = true;
        newFreeSpinsRemaining = config.count;
        newFreeSpinsMultiplier = config.multiplier;
        inFreeSpins = true;
        console.log(`[Match Three] FREE SPINS TRIGGERED! User ${userId} got ${config.count} free spins with ${config.multiplier}x multiplier`);
      }

      // Apply free spins multiplier to wins
      let actualWin = spinResult.totalWin;
      if (round.inFreeSpins && round.freeSpinsMultiplier > 1) {
        actualWin = applyFreeSpinsMultiplier(spinResult.totalWin, round.freeSpinsMultiplier);
      }

      // Update balance if there's a win
      if (actualWin > 0) {
        const [userBalance] = await db
          .select()
          .from(balances)
          .where(eq(balances.userId, userId))
          .limit(1);

        const newBalance = (userBalance?.coins || 0) + actualWin;

        await db
          .update(balances)
          .set({ coins: newBalance, updatedAt: new Date() })
          .where(eq(balances.userId, userId));

        // Record transaction
        await db.insert(transactions).values({
          id: nanoid(),
          userId,
          type: "game_win",
          amount: actualWin,
          balanceBefore: userBalance?.coins || 0,
          balanceAfter: newBalance,
          metadata: JSON.stringify({
            roundId: input.roundId,
            game: "matchThree",
            winningLines: spinResult.winningLines.length,
            freeSpins: round.inFreeSpins,
            multiplier: round.freeSpinsMultiplier,
          }),
        });
      }

      // Update round state
      const newActiveReels = spinResult.newActiveReels || round.activeReels;
      
      // Handle free spins
      let newSpinsRemaining = round.spinsRemaining;
      if (freeSpinsTriggered) {
        // Free spins triggered - don't modify spinsRemaining
        // Free spins are tracked separately in freeSpinsRemaining
        console.log(`[Match Three] Free spins triggered, ${newFreeSpinsRemaining} free spins available`);
      } else if (inFreeSpins && newFreeSpinsRemaining > 0) {
        // Consume one free spin
        newFreeSpinsRemaining--;
        if (newFreeSpinsRemaining === 0) {
          inFreeSpins = false;
          newFreeSpinsMultiplier = 1;
          console.log(`[Match Three] Free spins ended`);
        }
      } else {
        // Regular spin - consume one spin
        newSpinsRemaining--;
      }
      
      const isGameOver = newSpinsRemaining <= 0 && newFreeSpinsRemaining <= 0;

      await db
        .update(matchThreeRounds)
        .set({
          activeReels: newActiveReels,
          currentWin: round.currentWin + actualWin,
          spinsRemaining: newSpinsRemaining,
          freeSpinsRemaining: newFreeSpinsRemaining,
          freeSpinsMultiplier: newFreeSpinsMultiplier,
          inFreeSpins,
          gameOver: isGameOver,
        })
        .where(eq(matchThreeRounds.id, input.roundId));

      // Update player stats if game is over
      if (isGameOver) {
        const totalWin = round.currentWin + actualWin;
        const profit = totalWin - round.betAmount;
        const won = profit > 0;

        const [stats] = await db
          .select()
          .from(playerStats)
          .where(eq(playerStats.userId, userId))
          .limit(1);

        if (stats) {
          await db
            .update(playerStats)
            .set({
              totalGamesPlayed: stats.totalGamesPlayed + 1,
              totalWins: won ? stats.totalWins + 1 : stats.totalWins,
              totalLosses: won ? stats.totalLosses : stats.totalLosses + 1,
              currentWinStreak: won ? stats.currentWinStreak + 1 : 0,
              longestWinStreak: won
                ? Math.max(stats.longestWinStreak, stats.currentWinStreak + 1)
                : stats.longestWinStreak,
              totalProfit: stats.totalProfit + profit,
              updatedAt: new Date(),
            })
            .where(eq(playerStats.userId, userId));
        }
      }

      // Get current jackpot amount for display
      const currentJackpot = await getCurrentJackpot();

      return {
        ...spinResult,
        totalWin: actualWin, // Return actual win with multiplier applied
        roundId: input.roundId,
        spinsRemaining: newSpinsRemaining,
        freeSpinsRemaining: newFreeSpinsRemaining,
        freeSpinsTriggered,
        inFreeSpins,
        freeSpinsMultiplier: newFreeSpinsMultiplier,
        gameOver: isGameOver,
        jackpotWon,
        currentJackpot,
      };
    }),

  /**
   * Get current game state
   */
  getGameState: protectedProcedure
    .input(
      z.object({
        roundId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      const userId = ctx.user.id;

      const [round] = await db
        .select()
        .from(matchThreeRounds)
        .where(eq(matchThreeRounds.id, input.roundId))
        .limit(1);

      if (!round) {
        throw new Error("Round not found");
      }

      if (round.userId !== userId) {
        throw new Error("Unauthorized");
      }

      return {
        roundId: round.id,
        betAmount: round.betAmount,
        activeReels: round.activeReels,
        currentWin: round.currentWin,
        spinsRemaining: round.spinsRemaining,
        gameOver: round.gameOver,
      };
    }),
});
