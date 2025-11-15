import { getRawDb } from '../db';
import { randomUUID } from 'crypto';

export interface Division {
  id: string;
  name: string;
  tier: number;
  monthlySpendRequired: number;
  icon: string;
  color: string;
  benefits: {
    dailyBonusCoins: number;
    challengeRewardBonus: number;
    shopDiscount: number;
    exclusiveGames: boolean;
    prioritySupport: boolean;
  };
}

export class DivisionsService {
  async getUserDivision(userId: string) {
    const pool = await getRawDb();
    if (!pool) throw new Error('Database not available');
    
    // Get user's current division
    const userDivision = await pool.query(
      `SELECT 
        ud.*,
        d.name,
        d.tier,
        d."monthlySpendRequired",
        d.icon,
        d.color,
        d.benefits
      FROM "userDivisions" ud
      JOIN divisions d ON ud."divisionId" = d.id
      WHERE ud."userId" = $1
      ORDER BY ud."assignedAt" DESC
      LIMIT 1`,
      [userId]
    );
    
    if (userDivision.rows.length === 0) {
      // Assign bronze division by default
      const divisionId = 'bronze';
      const id = randomUUID();
      
      await pool.query(
        'INSERT INTO "userDivisions" (id, "userId", "divisionId", "monthlySpend") VALUES ($1, $2, $3, $4)',
        [id, userId, divisionId, 0]
      );
      
      // Get bronze division
      const bronze = await pool.query(
        'SELECT * FROM divisions WHERE id = $1',
        [divisionId]
      );
      
      return bronze.rows[0];
    }
    
    return userDivision.rows[0];
  }
  
  async getAllDivisions() {
    const pool = await getRawDb();
    if (!pool) throw new Error('Database not available');
    
    const result = await pool.query(
      'SELECT * FROM divisions ORDER BY tier ASC'
    );
    
    return result.rows as Division[];
  }
  
  async updateMonthlySpend(userId: string, amount: number) {
    const pool = await getRawDb();
    if (!pool) throw new Error('Database not available');
    
    // Get current user division
    const userDivision = await this.getUserDivision(userId);
    const newMonthlySpend = (userDivision.monthlySpend || 0) + amount;
    
    // Update monthly spend
    await pool.query(
      'UPDATE "userDivisions" SET "monthlySpend" = $1 WHERE "userId" = $2 AND "divisionId" = $3',
      [newMonthlySpend, userId, userDivision.divisionId || userDivision.id]
    );
    
    // Check if user qualifies for higher division
    const divisions = await this.getAllDivisions();
    let newDivision = divisions[0]; // Bronze by default
    
    for (const division of divisions) {
      if (newMonthlySpend >= division.monthlySpendRequired) {
        newDivision = division;
      }
    }
    
    // If division changed, update
    if (newDivision.id !== (userDivision.divisionId || userDivision.id)) {
      const id = randomUUID();
      await pool.query(
        'INSERT INTO "userDivisions" (id, "userId", "divisionId", "monthlySpend") VALUES ($1, $2, $3, $4)',
        [id, userId, newDivision.id, newMonthlySpend]
      );
      
      return { upgraded: true, newDivision };
    }
    
    return { upgraded: false, newDivision: userDivision };
  }
  
  async resetMonthlySpends() {
    const pool = await getRawDb();
    if (!pool) throw new Error('Database not available');
    
    // Reset all monthly spends at the end of month
    await pool.query(
      'UPDATE "userDivisions" SET "monthlySpend" = 0'
    );
  }
}

export const divisionsService = new DivisionsService();
