import { getRawDb } from '../db';
import { randomUUID } from 'crypto';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  icon: string;
  targetValue: number;
  reward: number;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  progress: number;
  completed: boolean;
  claimedAt: Date | null;
}

export class AchievementService {
  async trackProgress(userId: string, category: string, increment: number = 1) {
    const pool = await getRawDb();
    if (!pool) throw new Error('Database not available');
    
    // Get all achievements in this category
    const achievements = await pool.query(
      'SELECT * FROM achievements WHERE category = $1',
      [category]
    );
    
    for (const achievement of achievements.rows) {
      // Get or create user achievement
      const userAchievement = await pool.query(
        'SELECT * FROM "userAchievements" WHERE "userId" = $1 AND "achievementId" = $2',
        [userId, achievement.id]
      );
      
      if (userAchievement.rows.length === 0) {
        // Create new progress
        await pool.query(
          'INSERT INTO "userAchievements" (id, "userId", "achievementId", progress, completed, "claimedAt") VALUES ($1, $2, $3, $4, $5, $6)',
          [randomUUID(), userId, achievement.id, increment, false, null]
        );
      } else {
        // Update existing progress
        const current = userAchievement.rows[0];
        if (!current.completed) {
          const newProgress = current.progress + increment;
          const completed = newProgress >= achievement.requirement;
          
          await pool.query(
            'UPDATE "userAchievements" SET progress = $1, completed = $2 WHERE "userId" = $3 AND "achievementId" = $4',
            [newProgress, completed, userId, achievement.id]
          );
        }
      }
    }
  }
  
  async getUserAchievements(userId: string) {
    const pool = await getRawDb();
    if (!pool) throw new Error('Database not available');
    
    const result = await pool.query(
      `SELECT 
        a.*,
        ua.progress,
        ua.completed,
        ua."claimedAt"
      FROM achievements a
      LEFT JOIN "userAchievements" ua ON a.id = ua."achievementId" AND ua."userId" = $1
      ORDER BY a.rarity DESC, a.category`,
      [userId]
    );
    
    return result.rows.map((row: any) => ({
      ...row,
      progress: row.progress || 0,
      completed: row.completed || false,
      claimedAt: row.claimedAt || null,
    }));
  }
  
  async claimReward(userId: string, achievementId: string) {
    const pool = await getRawDb();
    if (!pool) throw new Error('Database not available');
    
    // Check if achievement is completed and not claimed
    const userAchievement = await pool.query(
      'SELECT * FROM "userAchievements" WHERE "userId" = $1 AND "achievementId" = $2 AND completed = $3 AND "claimedAt" IS NULL',
      [userId, achievementId, true]
    );
    
    if (userAchievement.rows.length === 0) {
      throw new Error('Achievement not completed or already claimed');
    }
    
    // Get achievement reward
    const achievement = await pool.query(
      'SELECT reward FROM achievements WHERE id = $1',
      [achievementId]
    );
    
    if (achievement.rows.length === 0) {
      throw new Error('Achievement not found');
    }
    
    const reward = achievement.rows[0].rewardCoins;
    
    // Mark as claimed
    await pool.query(
      'UPDATE "userAchievements" SET "claimedAt" = NOW() WHERE "userId" = $1 AND "achievementId" = $2',
      [userId, achievementId]
    );
    
    // Add reward to user balance
    await pool.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2',
      [reward, userId]
    );
    
    return { reward };
  }
}

export const achievementService = new AchievementService();
