import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { playerStats, users, balances, gameRounds } from "../../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

export const leaderboardRouter = router({
  /**
   * Get global leaderboard
   */
  getLeaderboard: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        sortBy: z.enum(["totalProfit", "totalWins", "longestWinStreak"]).default("totalProfit"),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      const sortColumn = 
        input.sortBy === "totalProfit" ? playerStats.totalProfit :
        input.sortBy === "totalWins" ? playerStats.totalWins :
        playerStats.longestWinStreak;

      const leaderboardData = await db
        .select({
          userId: playerStats.userId,
          userName: users.name,
          totalProfit: playerStats.totalProfit,
          totalWins: playerStats.totalWins,
          totalGamesPlayed: playerStats.totalGamesPlayed,
          longestWinStreak: playerStats.longestWinStreak,
          balance: balances.coins,
        })
        .from(playerStats)
        .leftJoin(users, eq(playerStats.userId, users.id))
        .leftJoin(balances, eq(playerStats.userId, balances.userId))
        .orderBy(desc(sortColumn))
        .limit(input.limit);

      // Add rank to each player
      const leaderboard = leaderboardData.map((player, index) => ({
        ...player,
        rank: index + 1,
      }));

      return { leaderboard };
    }),

  /**
   * Get current user's rank
   */
  getMyRank: protectedProcedure
    .input(
      z.object({
        sortBy: z.enum(["totalProfit", "totalWins", "longestWinStreak"]).default("totalProfit"),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      const userId = ctx.user.id;

      // Get user's stats
      const [userStats] = await db
        .select()
        .from(playerStats)
        .where(eq(playerStats.userId, userId))
        .limit(1);

      if (!userStats) {
        return { rank: null, totalPlayers: 0 };
      }

      const sortColumn = 
        input.sortBy === "totalProfit" ? playerStats.totalProfit :
        input.sortBy === "totalWins" ? playerStats.totalWins :
        playerStats.longestWinStreak;

      const userValue = 
        input.sortBy === "totalProfit" ? userStats.totalProfit :
        input.sortBy === "totalWins" ? userStats.totalWins :
        userStats.longestWinStreak;

      // Count how many players have better stats
      const [rankResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(playerStats)
        .where(sql`${sortColumn} > ${userValue}`);

      const rank = (rankResult?.count || 0) + 1;

      // Get total number of players
      const [totalResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(playerStats);

      const totalPlayers = totalResult?.count || 0;

      return { rank, totalPlayers, userStats };
    }),

  /**
   * Get user profile with detailed stats
   */
  getProfile: protectedProcedure
    .input(
      z.object({
        userId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      const targetUserId = input.userId || ctx.user.id;

      // Get user info
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, targetUserId))
        .limit(1);

      if (!user) {
        throw new Error("User not found");
      }

      // Get user stats
      const [stats] = await db
        .select()
        .from(playerStats)
        .where(eq(playerStats.userId, targetUserId))
        .limit(1);

      // Get user balance
      const [balance] = await db
        .select()
        .from(balances)
        .where(eq(balances.userId, targetUserId))
        .limit(1);

      // Get recent game history (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentGames = await db
        .select({
          date: sql<string>`DATE(${gameRounds.createdAt})`,
          totalProfit: sql<number>`SUM(${gameRounds.profitLoss})`,
          gamesPlayed: sql<number>`COUNT(*)`,
          wins: sql<number>`SUM(CASE WHEN ${gameRounds.result} = 'win' THEN 1 ELSE 0 END)`,
        })
        .from(gameRounds)
        .where(
          sql`${gameRounds.userId} = ${targetUserId} AND ${gameRounds.createdAt} >= ${thirtyDaysAgo}`
        )
        .groupBy(sql`DATE(${gameRounds.createdAt})`)
        .orderBy(sql`DATE(${gameRounds.createdAt})`);

      return {
        user,
        stats,
        balance,
        recentGames,
      };
    }),
});
