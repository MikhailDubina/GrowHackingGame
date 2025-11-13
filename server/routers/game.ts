import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { gameRounds, balances, playerStats, transactions, dailyAttempts, powerUpPurchases } from '../../drizzle/schema';
import { GameEngine } from '../services/gameEngine';
import { updateChallengeProgress, CHALLENGE_TYPES } from '../services/dailyChallengesService';
import { achievementService } from '../services/achievementService';
import { GAME_CONFIG } from '@shared/gameTypes';
import { eq, and, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const activeGames = new Map<string, any>();

export const gameRouter = router({
  getAttempts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const today = new Date().toISOString().split('T')[0];
    const records = await db.select().from(dailyAttempts).where(and(eq(dailyAttempts.userId, ctx.user.id), eq(dailyAttempts.date, today))).limit(1);
    let record = records[0];
    if (!record) {
      const id = randomUUID();
      await db.insert(dailyAttempts).values({ id, userId: ctx.user.id, date: today, attemptsUsed: 0, attemptsPurchased: 0, attemptsRemaining: GAME_CONFIG.attempts.dailyFree, accumulatedAttempts: 0 });
      record = { id, userId: ctx.user.id, date: today, attemptsUsed: 0, attemptsPurchased: 0, attemptsRemaining: GAME_CONFIG.attempts.dailyFree, accumulatedAttempts: 0, createdAt: new Date(), updatedAt: new Date() };
    }
    const totalAvailable = record.attemptsRemaining + record.accumulatedAttempts;
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const resetIn = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
    return { date: today, attemptsRemaining: record.attemptsRemaining, attemptsUsed: record.attemptsUsed, attemptsPurchased: record.attemptsPurchased, accumulatedAttempts: record.accumulatedAttempts, totalAvailable, resetIn };
  }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const statsRecords = await db.select().from(playerStats).where(eq(playerStats.userId, ctx.user.id)).limit(1);
    const stats = statsRecords[0];
    const balanceRecords = await db.select().from(balances).where(eq(balances.userId, ctx.user.id)).limit(1);
    const balance = balanceRecords[0];
    return { stats: stats || { totalGamesPlayed: 0, totalWins: 0, totalLosses: 0, currentWinStreak: 0, longestWinStreak: 0, totalProfit: 0 }, balance: balance?.coins || 0 };
  }),

  startRound: protectedProcedure.input(z.object({ difficulty: z.enum(['easy', 'medium', 'hard']), betAmount: z.number().min(0).max(10000) })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const balanceRecords = await db.select().from(balances).where(eq(balances.userId, ctx.user.id)).limit(1);
    const balance = balanceRecords[0];
    const affordCheck = GameEngine.canAffordGame(balance?.coins || 0, input.betAmount, input.difficulty);
    if (!affordCheck.canAfford) throw new Error(affordCheck.message);
    const newBalance = (balance?.coins || 0) - affordCheck.required;
    await db.update(balances).set({ coins: newBalance, updatedAt: new Date() }).where(eq(balances.userId, ctx.user.id));
    const gameState = GameEngine.initializeGame(ctx.user.id, input.difficulty, input.betAmount);
    activeGames.set(gameState.roundId, gameState);
    await db.insert(transactions).values({ id: randomUUID(), userId: ctx.user.id, type: 'game_bet', amount: -affordCheck.required, balanceBefore: balance?.coins || 0, balanceAfter: newBalance, metadata: JSON.stringify({ roundId: gameState.roundId, difficulty: input.difficulty, betAmount: input.betAmount }) });
    return { roundId: gameState.roundId, difficulty: gameState.difficulty, betAmount: gameState.betAmount, entryCost: gameState.entryCost, maxMoves: gameState.maxMoves, gridSize: gameState.grid.length, newBalance };
  }),

  makeMove: protectedProcedure.input(z.object({ roundId: z.string(), x: z.number().min(0).max(4), y: z.number().min(0).max(4) })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const gameState = activeGames.get(input.roundId);
    if (!gameState || gameState.userId !== ctx.user.id) throw new Error('Game not found');
    const result = GameEngine.makeMove(gameState, input.x, input.y);
    if (result.gameOver) {
      const isWin = gameState.status === 'won' || gameState.status === 'cashout';
      const coinsEarned = gameState.payout - gameState.betAmount;
      
      await db.insert(gameRounds).values({ id: gameState.roundId, userId: ctx.user.id, gameType: 'treasure_hunt', difficulty: gameState.difficulty, betAmount: gameState.betAmount, result: isWin ? 'win' : 'loss', payout: gameState.payout, profitLoss: gameState.profitLoss, metadata: JSON.stringify({ totalMoves: gameState.totalMoves, seed: gameState.seed }) });
      
      // Update daily challenges
      await updateChallengeProgress(ctx.user.id, CHALLENGE_TYPES.PLAY_GAMES, 1);
      if (isWin) {
        await updateChallengeProgress(ctx.user.id, CHALLENGE_TYPES.WIN_GAMES, 1);
      }
      if (coinsEarned > 0) {
      
      // Update achievements
      await achievementService.trackProgress(ctx.user.id, 'games_played', 1);
      if (isWin) {
        await achievementService.trackProgress(ctx.user.id, 'wins', 1);
      }
      if (coinsEarned > 0) {
        await achievementService.trackProgress(ctx.user.id, 'earnings', coinsEarned);
      }
        await updateChallengeProgress(ctx.user.id, CHALLENGE_TYPES.EARN_COINS, coinsEarned);
      }
      if (gameState.payout > 0) {
        const balanceRecords = await db.select().from(balances).where(eq(balances.userId, ctx.user.id)).limit(1);
        const balance = balanceRecords[0];
        const newBalance = (balance?.coins || 0) + gameState.payout;
        await db.update(balances).set({ coins: newBalance, updatedAt: new Date() }).where(eq(balances.userId, ctx.user.id));
        await db.insert(transactions).values({ id: randomUUID(), userId: ctx.user.id, type: 'game_win', amount: gameState.payout, balanceBefore: balance?.coins || 0, balanceAfter: newBalance, metadata: JSON.stringify({ roundId: gameState.roundId }) });
      }
      activeGames.delete(input.roundId);
    } else {
      activeGames.set(input.roundId, gameState);
    }
    return { success: result.success, cell: result.cell, message: result.message, gameOver: result.gameOver, payout: result.payout, currentPayout: gameState.payout, movesRemaining: gameState.maxMoves - gameState.totalMoves, status: gameState.status };
  }),

  cashOut: protectedProcedure.input(z.object({ roundId: z.string() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const gameState = activeGames.get(input.roundId);
    if (!gameState || gameState.userId !== ctx.user.id) throw new Error('Game not found');
    const result = GameEngine.cashOut(gameState);
    await db.insert(gameRounds).values({ id: gameState.roundId, userId: ctx.user.id, gameType: 'treasure_hunt', difficulty: gameState.difficulty, betAmount: gameState.betAmount, result: 'cashout', payout: gameState.payout, profitLoss: gameState.profitLoss, metadata: JSON.stringify({ totalMoves: gameState.totalMoves, seed: gameState.seed }) });
    if (gameState.payout > 0) {
      const balanceRecords = await db.select().from(balances).where(eq(balances.userId, ctx.user.id)).limit(1);
      const balance = balanceRecords[0];
      const newBalance = (balance?.coins || 0) + gameState.payout;
      await db.update(balances).set({ coins: newBalance, updatedAt: new Date() }).where(eq(balances.userId, ctx.user.id));
      await db.insert(transactions).values({ id: randomUUID(), userId: ctx.user.id, type: 'game_win', amount: gameState.payout, balanceBefore: balance?.coins || 0, balanceAfter: newBalance, metadata: JSON.stringify({ roundId: gameState.roundId }) });
    }
    activeGames.delete(input.roundId);
    return { success: true, payout: gameState.payout, profitLoss: gameState.profitLoss, message: result.message };
  }),

  usePowerUp: protectedProcedure.input(z.object({ roundId: z.string(), powerUpType: z.enum(['metal_detector', 'treasure_map', 'magic_compass']) })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const gameState = activeGames.get(input.roundId);
    if (!gameState || gameState.userId !== ctx.user.id) throw new Error('Game not found');
    if (gameState.status !== 'active') throw new Error('Game is not active');
    if (gameState.powerUpsUsed.includes(input.powerUpType)) throw new Error('Power-up already used');
    const cost = GAME_CONFIG.powerUps[input.powerUpType].cost;
    const balanceRecords = await db.select().from(balances).where(eq(balances.userId, ctx.user.id)).limit(1);
    const balance = balanceRecords[0];
    if (!balance || balance.coins < cost) throw new Error('Insufficient balance');
    const newBalance = balance.coins - cost;
    await db.update(balances).set({ coins: newBalance, updatedAt: new Date() }).where(eq(balances.userId, ctx.user.id));
    const effect = GameEngine.applyPowerUp(gameState, input.powerUpType);
    await db.insert(powerUpPurchases).values({ id: randomUUID(), userId: ctx.user.id, gameRoundId: gameState.roundId, powerUpType: input.powerUpType, cost });
    await db.insert(transactions).values({ id: randomUUID(), userId: ctx.user.id, type: 'power_up_purchase', amount: -cost, balanceBefore: balance.coins, balanceAfter: newBalance, metadata: JSON.stringify({ roundId: gameState.roundId, powerUpType: input.powerUpType }) });
    activeGames.set(input.roundId, gameState);
    return { success: true, effect, newBalance, currentPayout: gameState.payout, grid: gameState.grid };
  }),
});
