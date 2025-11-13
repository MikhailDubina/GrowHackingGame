import mysql from 'mysql2/promise';

export class GlobalStatsService {
  private async getConnection() {
    try {
      const connection = await mysql.createConnection(process.env.DATABASE_URL!);
      return connection;
    } catch (error) {
      console.error('[GlobalStats] Connection error:', error);
      return null;
    }
  }

  async getGlobalStats() {
    let connection = null;
    try {
      connection = await this.getConnection();
      
      if (!connection) {
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
      const [playersRows] = await connection.execute(
        'SELECT COUNT(DISTINCT id) as total FROM users'
      );
      const totalPlayers = Number((playersRows as any)[0]?.total) || 0;
      
      // Get total games
      const [gamesRows] = await connection.execute(
        'SELECT COUNT(*) as total FROM gameRounds'
      );
      const totalGames = Number((gamesRows as any)[0]?.total) || 0;
      
      // Get total payouts
      const [payoutsRows] = await connection.execute(
        'SELECT COALESCE(SUM(payout), 0) as total FROM gameRounds WHERE result IN ("win", "cashout")'
      );
      const totalPayouts = Number((payoutsRows as any)[0]?.total) || 0;
      
      // Get active players (last 24h)
      const [activeRows] = await connection.execute(
        'SELECT COUNT(DISTINCT userId) as total FROM gameRounds WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)'
      );
      const activePlayers = Number((activeRows as any)[0]?.total) || 0;
      
      // Get biggest win
      const [winRows] = await connection.execute(
        'SELECT COALESCE(MAX(payout), 0) as biggest FROM gameRounds WHERE result IN ("win", "cashout")'
      );
      const biggestWin = Number((winRows as any)[0]?.biggest) || 0;
      
      await connection.end();
      
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
      if (connection) {
        try {
          await connection.end();
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
