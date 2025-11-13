import { getDb } from '../db';
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
    const db = getDb();
    
    // Get user's current division
    const userDivision = await db.execute(
      `SELECT 
        ud.*,
        d.name,
        d.tier,
        d.monthlySpendRequired,
        d.icon,
        d.color,
        d.benefits
      FROM userDivisions ud
      JOIN divisions d ON ud.divisionId = d.id
      WHERE ud.userId = ?
      ORDER BY ud.assignedAt DESC
      LIMIT 1`,
      [userId]
    );
    
    if (userDivision.rows.length === 0) {
      // Assign bronze division by default
      const divisionId = 'bronze';
      const id = randomUUID();
      
      await db.execute(
        'INSERT INTO userDivisions (id, userId, divisionId, monthlySpend) VALUES (?, ?, ?, ?)',
        [id, userId, divisionId, 0]
      );
      
      // Get bronze division
      const bronze = await db.execute(
        'SELECT * FROM divisions WHERE id = ?',
        [divisionId]
      );
      
      return bronze.rows[0] as any;
    }
    
    return userDivision.rows[0] as any;
  }
  
  async getAllDivisions() {
    const db = getDb();
    
    const result = await db.execute(
      'SELECT * FROM divisions ORDER BY tier ASC'
    );
    
    return result.rows as Division[];
  }
  
  async updateMonthlySpend(userId: string, amount: number) {
    const db = getDb();
    
    // Get current user division
    const userDivision = await this.getUserDivision(userId);
    const newMonthlySpend = (userDivision.monthlySpend || 0) + amount;
    
    // Update monthly spend
    await db.execute(
      'UPDATE userDivisions SET monthlySpend = ? WHERE userId = ? AND divisionId = ?',
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
      await db.execute(
        'INSERT INTO userDivisions (id, userId, divisionId, monthlySpend) VALUES (?, ?, ?, ?)',
        [id, userId, newDivision.id, newMonthlySpend]
      );
      
      return { upgraded: true, newDivision };
    }
    
    return { upgraded: false, newDivision: userDivision };
  }
  
  async resetMonthlySpends() {
    const db = getDb();
    
    // Reset all monthly spends at the end of month
    await db.execute(
      'UPDATE userDivisions SET monthlySpend = 0'
    );
  }
}

export const divisionsService = new DivisionsService();
