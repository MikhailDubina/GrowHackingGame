import { nanoid } from "nanoid";
import { getDb } from "../db";
import { dailyChallenges, userChallengeProgress } from "../../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export interface DailyChallenge {
  id: string;
  challengeType: string;
  description: string;
  targetValue: number;
  rewardCoins: number;
  rewardType: string;
  difficulty: string;
  activeDate: Date;
  expiresAt: Date;
}

export interface ChallengeProgress {
  challengeId: string;
  currentProgress: number;
  completed: boolean;
  claimedReward: boolean;
}

/**
 * Challenge types for Treasure Hunt
 */
export const CHALLENGE_TYPES = {
  PLAY_GAMES: "play_games",
  WIN_GAMES: "win_games",
  EARN_COINS: "earn_coins",
  FIND_TREASURES: "find_treasures",
  AVOID_TRAPS: "avoid_traps",
  PLAY_DIFFICULTY: "play_difficulty", // Play X games on specific difficulty
  WIN_STREAK: "win_streak",
} as const;

/**
 * Generate daily challenges for today
 */
export async function generateDailyChallenges(): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  // Check if challenges already exist for today
  const existing = await db
    .select()
    .from(dailyChallenges)
    .where(eq(dailyChallenges.activeDate, today.toISOString().split('T')[0]))
    .limit(1);

  if (existing.length > 0) {
    console.log("[Daily Challenges] Challenges already exist for today");
    return;
  }

  // Generate 3 challenges per day (easy, medium, hard)
  const challenges = [
    {
      id: nanoid(),
      challengeType: CHALLENGE_TYPES.PLAY_GAMES,
      description: "Play 5 Treasure Hunt games",
      targetValue: 5,
      rewardCoins: 100,
      rewardType: "coins",
      difficulty: "easy",
      activeDate: today.toISOString().split('T')[0],
      expiresAt: tomorrow,
    },
    {
      id: nanoid(),
      challengeType: CHALLENGE_TYPES.WIN_GAMES,
      description: "Win 3 Treasure Hunt games",
      targetValue: 3,
      rewardCoins: 250,
      rewardType: "coins",
      difficulty: "medium",
      activeDate: today.toISOString().split('T')[0],
      expiresAt: tomorrow,
    },
    {
      id: nanoid(),
      challengeType: CHALLENGE_TYPES.EARN_COINS,
      description: "Earn 1000 coins in Treasure Hunt",
      targetValue: 1000,
      rewardCoins: 500,
      rewardType: "coins",
      difficulty: "hard",
      activeDate: today.toISOString().split('T')[0],
      expiresAt: tomorrow,
    },
  ];

  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(dailyChallenges).values(challenges);
  console.log(`[Daily Challenges] Generated ${challenges.length} challenges for ${today.toISOString().split('T')[0]}`);
}

/**
 * Get active challenges for today
 */
export async function getActiveChallenges(): Promise<DailyChallenge[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const challenges = await db
    .select()
    .from(dailyChallenges)
    .where(
      and(
        eq(dailyChallenges.activeDate, today.toISOString().split('T')[0]),
        gte(dailyChallenges.expiresAt, new Date())
      )
    );

  return challenges as DailyChallenge[];
}

/**
 * Get user's progress for active challenges
 */
export async function getUserChallengeProgress(userId: string): Promise<Map<string, ChallengeProgress>> {
  const activeChallenges = await getActiveChallenges();
  const challengeIds = activeChallenges.map(c => c.id);

  if (challengeIds.length === 0) {
    return new Map();
  }

  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const progress = await db
    .select()
    .from(userChallengeProgress)
    .where(
      and(
        eq(userChallengeProgress.userId, userId),
        // @ts-ignore
        eq(userChallengeProgress.challengeId, challengeIds)
      )
    );

  const progressMap = new Map<string, ChallengeProgress>();
  for (const p of progress) {
    progressMap.set(p.challengeId, {
      challengeId: p.challengeId,
      currentProgress: p.currentProgress,
      completed: p.completed,
      claimedReward: p.claimedReward,
    });
  }

  return progressMap;
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(
  userId: string,
  challengeType: string,
  incrementValue: number = 1
): Promise<void> {
  const activeChallenges = await getActiveChallenges();
  const relevantChallenges = activeChallenges.filter(c => c.challengeType === challengeType);

  for (const challenge of relevantChallenges) {
    // Get or create progress
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const [existing] = await db
      .select()
      .from(userChallengeProgress)
      .where(
        and(
          eq(userChallengeProgress.userId, userId),
          eq(userChallengeProgress.challengeId, challenge.id)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing progress
      const newProgress = existing.currentProgress + incrementValue;
      const isCompleted = newProgress >= challenge.targetValue;

      await db
        .update(userChallengeProgress)
        .set({
          currentProgress: newProgress,
          completed: isCompleted,
          completedAt: isCompleted && !existing.completed ? new Date() : existing.completedAt,
        })
        .where(eq(userChallengeProgress.id, existing.id));

      if (isCompleted && !existing.completed) {
        console.log(`[Daily Challenges] User ${userId} completed challenge: ${challenge.description}`);
      }
    } else {
      // Create new progress
      const newProgress = incrementValue;
      const isCompleted = newProgress >= challenge.targetValue;

      await db.insert(userChallengeProgress).values({
        id: nanoid(),
        userId,
        challengeId: challenge.id,
        currentProgress: newProgress,
        completed: isCompleted,
        claimedReward: false,
        completedAt: isCompleted ? new Date() : null,
      });

      if (isCompleted) {
        console.log(`[Daily Challenges] User ${userId} completed challenge: ${challenge.description}`);
      }
    }
  }
}

/**
 * Claim challenge reward
 */
export async function claimChallengeReward(userId: string, challengeId: string): Promise<{ success: boolean; reward: number }> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const [progress] = await db
    .select()
    .from(userChallengeProgress)
    .where(
      and(
        eq(userChallengeProgress.userId, userId),
        eq(userChallengeProgress.challengeId, challengeId)
      )
    )
    .limit(1);

  if (!progress) {
    throw new Error("Challenge progress not found");
  }

  if (!progress.completed) {
    throw new Error("Challenge not completed yet");
  }

  if (progress.claimedReward) {
    throw new Error("Reward already claimed");
  }

  // Get challenge details
  const [challenge] = await db
    .select()
    .from(dailyChallenges)
    .where(eq(dailyChallenges.id, challengeId))
    .limit(1);

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  // Mark as claimed
  await db
    .update(userChallengeProgress)
    .set({
      claimedReward: true,
      claimedAt: new Date(),
    })
    .where(eq(userChallengeProgress.id, progress.id));

  return {
    success: true,
    reward: challenge.rewardCoins,
  };
}
