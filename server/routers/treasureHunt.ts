import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { balances, gameRounds, powerUpPurchases, dailyAttempts } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

type Difficulty = "easy" | "medium" | "hard";
type CellType = "empty" | "trap" | "small_treasure" | "medium_treasure" | "big_treasure" | "jackpot";
type PowerUpType = "metal_detector" | "treasure_map" | "magic_compass";

interface Cell {
  x: number;
  y: number;
  type: CellType;
  value: number;
}

const DIFFICULTY_CONFIG = {
  easy: {
    entryCost: 0,
    gridSize: 5,
    maxMoves: 15,
    traps: 5,
    treasures: {
      small: { count: 8, value: 10 },
      medium: { count: 4, value: 25 },
      big: { count: 2, value: 50 },
      jackpot: { count: 1, value: 100 },
    },
  },
  medium: {
    entryCost: 5,
    gridSize: 6,
    maxMoves: 10,
    traps: 10,
    treasures: {
      small: { count: 10, value: 15 },
      medium: { count: 6, value: 40 },
      big: { count: 3, value: 80 },
      jackpot: { count: 1, value: 200 },
    },
  },
  hard: {
    entryCost: 10,
    gridSize: 7,
    maxMoves: 8,
    traps: 15,
    treasures: {
      small: { count: 12, value: 20 },
      medium: { count: 8, value: 60 },
      big: { count: 4, value: 120 },
      jackpot: { count: 2, value: 300 },
    },
  },
};

function generateBoard(difficulty: Difficulty): Cell[] {
  const config = DIFFICULTY_CONFIG[difficulty];
  const { gridSize, traps, treasures } = config;
  const totalCells = gridSize * gridSize;
  
  const cells: Cell[] = [];
  
  // Initialize all cells as empty
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      cells.push({ x, y, type: "empty", value: 0 });
    }
  }
  
  // Shuffle cells
  const shuffled = cells.sort(() => Math.random() - 0.5);
  let index = 0;
  
  // Place traps
  for (let i = 0; i < traps; i++) {
    shuffled[index].type = "trap";
    shuffled[index].value = 0;
    index++;
  }
  
  // Place treasures
  for (let i = 0; i < treasures.jackpot.count; i++) {
    shuffled[index].type = "jackpot";
    shuffled[index].value = treasures.jackpot.value;
    index++;
  }
  
  for (let i = 0; i < treasures.big.count; i++) {
    shuffled[index].type = "big_treasure";
    shuffled[index].value = treasures.big.value;
    index++;
  }
  
  for (let i = 0; i < treasures.medium.count; i++) {
    shuffled[index].type = "medium_treasure";
    shuffled[index].value = treasures.medium.value;
    index++;
  }
  
  for (let i = 0; i < treasures.small.count; i++) {
    shuffled[index].type = "small_treasure";
    shuffled[index].value = treasures.small.value;
    index++;
  }
  
  return cells;
}

export const treasureHuntRouter = router({
  startGame: publicProcedure
    .input(z.object({
      difficulty: z.enum(["easy", "medium", "hard"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to play",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const config = DIFFICULTY_CONFIG[input.difficulty];
      
      // Check balance
      const [balance] = await db
        .select()
        .from(balances)
        .where(eq(balances.userId, userId))
        .limit(1);

      if (!balance || balance.coins < config.entryCost) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient balance",
        });
      }

      // Deduct entry cost
      if (config.entryCost > 0) {
        await db
          .update(balances)
          .set({ coins: balance.coins - config.entryCost })
          .where(eq(balances.userId, userId));
      }

      // Generate board
      const board = generateBoard(input.difficulty);
      
      // Create game round
      const roundId = randomUUID();
      await db.insert(gameRounds).values({
        id: roundId,
        userId,
        gameType: "treasure_hunt",
        betAmount: config.entryCost,
        result: "pending",
        payout: 0,
        profitLoss: -config.entryCost,
      });

      return {
        roundId,
        board: board.map(cell => ({
          x: cell.x,
          y: cell.y,
          state: "hidden",
        })),
        maxMoves: config.maxMoves,
        movesLeft: config.maxMoves,
        totalWinnings: 0,
      };
    }),

  revealCell: publicProcedure
    .input(z.object({
      roundId: z.string(),
      x: z.number(),
      y: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Get game round
      const [round] = await db
        .select()
        .from(gameRounds)
        .where(and(
          eq(gameRounds.id, input.roundId),
          eq(gameRounds.userId, userId)
        ))
        .limit(1);

      if (!round) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game round not found",
        });
      }

      if (round.result !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Game already finished",
        });
      }

      // Regenerate board from seeds (in production, store board in DB)
      // For now, generate random cell
      const cellTypes: CellType[] = ["empty", "trap", "small_treasure", "medium_treasure", "big_treasure", "jackpot"];
      const weights = [40, 20, 20, 10, 7, 3]; // Probability weights
      
      const random = Math.random() * 100;
      let cumulative = 0;
      let cellType: CellType = "empty";
      
      for (let i = 0; i < cellTypes.length; i++) {
        cumulative += weights[i];
        if (random < cumulative) {
          cellType = cellTypes[i];
          break;
        }
      }

      const valueMap: Record<CellType, number> = {
        empty: 0,
        trap: 0,
        small_treasure: 10,
        medium_treasure: 25,
        big_treasure: 50,
        jackpot: 100,
      };

      const cellValue = valueMap[cellType];
      const isGameOver = cellType === "trap";

      if (isGameOver) {
        // Update game round as loss
        await db
          .update(gameRounds)
          .set({
            result: "loss",
            payout: 0,
          })
          .where(eq(gameRounds.id, input.roundId));

        return {
          cell: {
            x: input.x,
            y: input.y,
            type: cellType,
            value: cellValue,
          },
          isGameOver: true,
          totalWinnings: 0,
        };
      }

      // Add winnings
      const newPayout = (round.payout || 0) + cellValue;

      await db
        .update(gameRounds)
        .set({
          payout: newPayout,
        })
        .where(eq(gameRounds.id, input.roundId));

      // Update balance
      if (cellValue > 0) {
        const [balance] = await db
          .select()
          .from(balances)
          .where(eq(balances.userId, userId))
          .limit(1);

        if (balance) {
          await db
            .update(balances)
            .set({ coins: balance.coins + cellValue })
            .where(eq(balances.userId, userId));
        }
      }

      return {
        cell: {
          x: input.x,
          y: input.y,
          type: cellType,
          value: cellValue,
        },
        isGameOver: false,
        totalWinnings: newPayout,
      };
    }),

  cashOut: publicProcedure
    .input(z.object({
      roundId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Get game round
      const [round] = await db
        .select()
        .from(gameRounds)
        .where(and(
          eq(gameRounds.id, input.roundId),
          eq(gameRounds.userId, userId)
        ))
        .limit(1);

      if (!round) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game round not found",
        });
      }

      if (round.result !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Game already finished",
        });
      }

      // Mark game as win
      await db
        .update(gameRounds)
        .set({
          result: "win",
        })
        .where(eq(gameRounds.id, input.roundId));

      return {
        success: true,
        totalWinnings: round.payout || 0,
      };
    }),
});
