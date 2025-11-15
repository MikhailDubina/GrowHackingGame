import { Pool } from 'pg';

export class GlobalStatsService {
  private async getConnection() {
    try {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL!,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      });
      return pool;
    } catch (error) {
      console.error('[GlobalStats] Connection error:', error);
      return null;
    }
  }

  async getGlobalStats() {
    let pool = null;
    try {
      pool = await this.getConnection();
      
      if (!pool) {
        console.error('[GlobalStats] No database connection');
        return {
          totalPlayers: 0,
          totalGames: 0,
          totalPayouts: 0,
          activePlayers: 0,
          biggestWin: 0,
        };
      }
      
      // Get total players
      const playersResult = await pool.query(
        'SELECT COUNT(DISTINCT id) as total FROM users'
      );
      const totalPlayers = Number(playersResult.rows[0]?.total) || 0;
      
      // Get total games
      const gamesResult = await pool.query(
        'SELECT COUNT(*) as total FROM game_rounds'
      );
      const totalGames = Number(gamesResult.rows[0]?.total) || 0;
      
      // Get total payouts
      const payoutsResult = await pool.query(
        'SELECT COALESCE(SUM(win_amount), 0) as total FROM game_rounds WHERE result IN ($1, $2)',
        ['win', 'cashout']
      );
      const totalPayouts = Number(payoutsResult.rows[0]?.total) || 0;
      
      // Get active players (last 24h)
      const activeResult = await pool.query(
        'SELECT COUNT(DISTINCT user_id) as total FROM game_rounds WHERE created_at >= NOW() - INTERVAL \'24 hours\''
      );
      const activePlayers = Number(activeResult.rows[0]?.total) || 0;
      
      // Get biggest win
      const winResult = await pool.query(
        'SELECT COALESCE(MAX(win_amount), 0) as biggest FROM game_rounds WHERE result IN ($1, $2)',
        ['win', 'cashout']
      );
      const biggestWin = Number(winResult.rows[0]?.biggest) || 0;
      
      await pool.end();
      
      console.log('[GlobalStats] Success:', { 
        totalPlayers, 
        totalGames, 
        totalPayouts, 
        activePlayers, 
        biggestWin 
      });
      
      return {
        totalPlayers,
        totalGames,
        totalPayouts,
        activePlayers,
        biggestWin,
      };
    } catch (error) {
      console.error('[GlobalStats] Query error:', error);
      if (pool) {
        try {
          await pool.end();
        } catch (e) {
          // Ignore close errors
        }
      }
      return {
        totalPlayers: 0,
        totalGames: 0,
        totalPayouts: 0,
        activePlayers: 0,
        biggestWin: 0,
      };
    }
  }
}

export const globalStatsService = new GlobalStatsService();
