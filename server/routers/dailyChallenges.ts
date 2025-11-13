import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  generateDailyChallenges,
  getActiveChallenges,
  getUserChallengeProgress,
  claimChallengeReward,
} from "../services/dailyChallengesService";
import { getDb } from "../db";
import { balances, transactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const dailyChallengesRouter = router({
  /**
   * Get active daily challenges with user progress
   */
  getChallenges: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Ensure challenges are generated for today
    await generateDailyChallenges();

    // Get active challenges
    const challenges = await getActiveChallenges();

    // Get user progress
    const progressMap = await getUserChallengeProgress(userId);

    // Combine challenges with progress
    const challengesWithProgress = challenges.map((challenge) => {
      const progress = progressMap.get(challenge.id) || {
        challengeId: challenge.id,
        currentProgress: 0,
        completed: false,
        claimedReward: false,
      };

      return {
        ...challenge,
        progress: progress.currentProgress,
        targetValue: challenge.targetValue,
        completed: progress.completed,
        claimedReward: progress.claimedReward,
        progressPercentage: Math.min(100, (progress.currentProgress / challenge.targetValue) * 100),
      };
    });

    return {
      challenges: challengesWithProgress,
      totalChallenges: challenges.length,
      completedChallenges: challengesWithProgress.filter((c) => c.completed).length,
    };
  }),

  /**
   * Claim challenge reward
   */
  claimReward: protectedProcedure
    .input(
      z.object({
        challengeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Claim reward
      const result = await claimChallengeReward(userId, input.challengeId);

      if (!result.success) {
        throw new Error("Failed to claim reward");
      }

      // Add coins to balance
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const [userBalance] = await db
        .select()
        .from(balances)
        .where(eq(balances.userId, userId))
        .limit(1);

      const newBalance = (userBalance?.coins || 0) + result.reward;

      await db
        .update(balances)
        .set({ coins: newBalance, updatedAt: new Date() })
        .where(eq(balances.userId, userId));

      // Record transaction
      await db.insert(transactions).values({
        id: nanoid(),
        userId,
        type: "challenge_reward",
        amount: result.reward,
        balanceBefore: userBalance?.coins || 0,
        balanceAfter: newBalance,
        metadata: JSON.stringify({
          challengeId: input.challengeId,
          source: "daily_challenge",
        }),
      });

      return {
        success: true,
        reward: result.reward,
        newBalance,
      };
    }),
});
