import { getDb } from '../db';
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
    const db = getDb();
    
    // Get all achievements in this category
    const achievements = await db.execute(
      'SELECT * FROM achievements WHERE category = ?',
      [category]
    );
    
    for (const achievement of achievements.rows as any[]) {
      // Get or create user achievement
      const userAchievement = await db.execute(
        'SELECT * FROM userAchievements WHERE userId = ? AND achievementId = ?',
        [userId, achievement.id]
      );
      
      if (userAchievement.rows.length === 0) {
        // Create new progress
        await db.execute(
          'INSERT INTO userAchievements (id, userId, achievementId, progress, completed, claimedAt) VALUES (?, ?, ?, ?, ?, ?)',
          [randomUUID(), userId, achievement.id, increment, false, null]
        );
      } else {
        // Update existing progress
        const current = userAchievement.rows[0] as any;
        if (!current.completed) {
          const newProgress = current.progress + increment;
          const completed = newProgress >= achievement.requirement;
          
          await db.execute(
            'UPDATE userAchievements SET progress = ?, completed = ? WHERE userId = ? AND achievementId = ?',
            [newProgress, completed, userId, achievement.id]
          );
        }
      }
    }
  }
  
  async getUserAchievements(userId: string) {
    const db = getDb();
    
    const result = await db.execute(
      `SELECT 
        a.*,
        ua.progress,
        ua.completed,
        ua.claimedAt
      FROM achievements a
      LEFT JOIN userAchievements ua ON a.id = ua.achievementId AND ua.userId = ?
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
    const db = getDb();
    
    // Check if achievement is completed and not claimed
    const userAchievement = await db.execute(
      'SELECT * FROM userAchievements WHERE userId = ? AND achievementId = ? AND completed = ? AND claimedAt IS NULL',
      [userId, achievementId, true]
    );
    
    if (userAchievement.rows.length === 0) {
      throw new Error('Achievement not completed or already claimed');
    }
    
    // Get achievement reward
    const achievement = await db.execute(
      'SELECT reward FROM achievements WHERE id = ?',
      [achievementId]
    );
    
    if (achievement.rows.length === 0) {
      throw new Error('Achievement not found');
    }
    
    const reward = (achievement.rows[0] as any).rewardCoins;
    
    // Mark as claimed
    await db.execute(
      'UPDATE userAchievements SET claimedAt = NOW() WHERE userId = ? AND achievementId = ?',
      [userId, achievementId]
    );
    
    // Add reward to user balance
    await db.execute(
      'UPDATE users SET balance = balance + ? WHERE id = ?',
      [reward, userId]
    );
    
    return { reward };
  }
}

export const achievementService = new AchievementService();
