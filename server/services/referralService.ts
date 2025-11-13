import { getDb } from '../db';
import { randomUUID } from 'crypto';

/**
 * Unique Referral Reward Scheme:
 * 
 * 1. Instant Rewards:
 *    - Referrer gets 100 coins when referred user signs up
 *    - Referred user gets 50 coins welcome bonus
 * 
 * 2. Tiered Revenue Share (Lifetime):
 *    - Tier 1 (0-$50 spent): 10% of referred user's spending
 *    - Tier 2 ($50-$200 spent): 15% of referred user's spending
 *    - Tier 3 ($200+ spent): 20% of referred user's spending
 * 
 * 3. Milestone Bonuses:
 *    - 5 referrals: 500 coins bonus
 *    - 10 referrals: 1,500 coins bonus
 *    - 25 referrals: 5,000 coins bonus
 *    - 50 referrals: 15,000 coins bonus
 *    - 100 referrals: 50,000 coins bonus
 * 
 * 4. Monthly Top Referrer Contest:
 *    - 1st place: $100 + 10,000 coins
 *    - 2nd place: $50 + 5,000 coins
 *    - 3rd place: $25 + 2,500 coins
 */

export class ReferralService {
  async generateReferralCode(userId: string): Promise<string> {
    const db = getDb();
    
    // Check if user already has a referral code
    const existing = await db.execute(
      'SELECT code FROM referralCodes WHERE userId = ?',
      [userId]
    );
    
    if (existing.rows.length > 0) {
      return (existing.rows[0] as any).code;
    }
    
    // Generate unique code (6 characters)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const id = randomUUID();
    
    await db.execute(
      'INSERT INTO referralCodes (id, userId, code) VALUES (?, ?, ?)',
      [id, userId, code]
    );
    
    return code;
  }
  
  async applyReferralCode(referredUserId: string, code: string) {
    const db = getDb();
    
    // Get referral code
    const referralCode = await db.execute(
      'SELECT * FROM referralCodes WHERE code = ?',
      [code]
    );
    
    if (referralCode.rows.length === 0) {
      throw new Error('Invalid referral code');
    }
    
    const codeData = referralCode.rows[0] as any;
    const referrerId = codeData.userId;
    
    // Check if user is trying to refer themselves
    if (referrerId === referredUserId) {
      throw new Error('Cannot refer yourself');
    }
    
    // Check if referral already exists
    const existingReferral = await db.execute(
      'SELECT * FROM referrals WHERE referredUserId = ?',
      [referredUserId]
    );
    
    if (existingReferral.rows.length > 0) {
      throw new Error('User already referred');
    }
    
    // Create referral
    const referralId = randomUUID();
    await db.execute(
      'INSERT INTO referrals (id, referrerId, referredUserId, referralCodeId, status) VALUES (?, ?, ?, ?, ?)',
      [referralId, referrerId, referredUserId, codeData.id, 'active']
    );
    
    // Update referral code stats
    await db.execute(
      'UPDATE referralCodes SET totalReferrals = totalReferrals + 1 WHERE id = ?',
      [codeData.id]
    );
    
    // Give instant rewards
    // Referrer gets 100 coins
    await db.execute(
      'UPDATE users SET balance = balance + 100 WHERE id = ?',
      [referrerId]
    );
    
    // Referred user gets 50 coins
    await db.execute(
      'UPDATE users SET balance = balance + 50 WHERE id = ?',
      [referredUserId]
    );
    
    // Record rewards
    const rewardId1 = randomUUID();
    const rewardId2 = randomUUID();
    
    await db.execute(
      'INSERT INTO referralRewards (id, referralId, rewardType, amount, reason, claimedAt) VALUES (?, ?, ?, ?, ?, NOW())',
      [rewardId1, referralId, 'signup_bonus', 100, 'Referrer signup bonus']
    );
    
    await db.execute(
      'INSERT INTO referralRewards (id, referralId, rewardType, amount, reason, claimedAt) VALUES (?, ?, ?, ?, ?, NOW())',
      [rewardId2, referralId, 'welcome_bonus', 50, 'Referred user welcome bonus']
    );
    
    // Check milestone bonuses
    await this.checkMilestoneBonuses(referrerId);
    
    return { referralId, referrerReward: 100, referredReward: 50 };
  }
  
  async trackReferredUserSpending(referredUserId: string, amount: number) {
    const db = getDb();
    
    // Get referral
    const referral = await db.execute(
      'SELECT * FROM referrals WHERE referredUserId = ? AND status = ?',
      [referredUserId, 'active']
    );
    
    if (referral.rows.length === 0) {
      return; // No active referral
    }
    
    const referralData = referral.rows[0] as any;
    const newTotalSpent = referralData.totalSpent + amount;
    
    // Determine tier
    let tier = 1;
    let revenueSharePercent = 10;
    
    if (newTotalSpent >= 200) {
      tier = 3;
      revenueSharePercent = 20;
    } else if (newTotalSpent >= 50) {
      tier = 2;
      revenueSharePercent = 15;
    }
    
    // Calculate reward
    const reward = Math.floor((amount * revenueSharePercent) / 100);
    
    // Update referral
    await db.execute(
      'UPDATE referrals SET totalSpent = ?, totalEarned = totalEarned + ?, tier = ? WHERE id = ?',
      [newTotalSpent, reward, tier, referralData.id]
    );
    
    // Give reward to referrer
    await db.execute(
      'UPDATE users SET balance = balance + ? WHERE id = ?',
      [reward, referralData.referrerId]
    );
    
    // Update referral code earnings
    await db.execute(
      'UPDATE referralCodes SET totalEarnings = totalEarnings + ? WHERE id = ?',
      [reward, referralData.referralCodeId]
    );
    
    // Record reward
    const rewardId = randomUUID();
    await db.execute(
      'INSERT INTO referralRewards (id, referralId, rewardType, amount, reason, claimedAt) VALUES (?, ?, ?, ?, ?, NOW())',
      [rewardId, referralData.id, 'revenue_share', reward, `Tier ${tier} revenue share (${revenueSharePercent}%)`]
    );
  }
  
  async checkMilestoneBonuses(referrerId: string) {
    const db = getDb();
    
    // Get total referrals
    const result = await db.execute(
      'SELECT COUNT(*) as total FROM referrals WHERE referrerId = ?',
      [referrerId]
    );
    
    const totalReferrals = (result.rows[0] as any).total;
    
    const milestones = [
      { count: 5, reward: 500 },
      { count: 10, reward: 1500 },
      { count: 25, reward: 5000 },
      { count: 50, reward: 15000 },
      { count: 100, reward: 50000 },
    ];
    
    for (const milestone of milestones) {
      if (totalReferrals === milestone.count) {
        // Give milestone bonus
        await db.execute(
          'UPDATE users SET balance = balance + ? WHERE id = ?',
          [milestone.reward, referrerId]
        );
        
        // Record reward (create a dummy referral record for milestone)
        const rewardId = randomUUID();
        const referralId = randomUUID();
        
        await db.execute(
          'INSERT INTO referralRewards (id, referralId, rewardType, amount, reason, claimedAt) VALUES (?, ?, ?, ?, ?, NOW())',
          [rewardId, referralId, 'milestone', milestone.reward, `${milestone.count} referrals milestone`]
        );
      }
    }
  }
  
  async getReferralStats(userId: string) {
    const db = getDb();
    
    // Get referral code
    const code = await this.generateReferralCode(userId);
    
    // Get referral stats
    const stats = await db.execute(
      `SELECT 
        COUNT(*) as totalReferrals,
        SUM(totalEarned) as totalEarned,
        SUM(totalSpent) as totalSpent
      FROM referrals
      WHERE referrerId = ?`,
      [userId]
    );
    
    const statsData = stats.rows[0] as any;
    
    // Get referral list
    const referrals = await db.execute(
      `SELECT 
        r.*,
        u.name as referredUserName
      FROM referrals r
      JOIN users u ON r.referredUserId = u.id
      WHERE r.referrerId = ?
      ORDER BY r.createdAt DESC`,
      [userId]
    );
    
    return {
      code,
      totalReferrals: statsData.totalReferrals || 0,
      totalEarned: statsData.totalEarned || 0,
      totalSpent: statsData.totalSpent || 0,
      referrals: referrals.rows,
    };
  }
}

export const referralService = new ReferralService();
