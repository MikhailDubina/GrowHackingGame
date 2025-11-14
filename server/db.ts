import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InsertUser, users, balances, playerStats } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: Pool | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      });
      _db = drizzle(_pool);
      console.log("[Database] Connected to PostgreSQL");
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _pool = null;
    }
  }
  return _db;
}

// Get raw PostgreSQL connection pool for raw SQL queries
export async function getRawDb() {
  if (!_pool && process.env.DATABASE_URL) {
    await getDb(); // Initialize pool if not already done
  }
  return _pool;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // PostgreSQL upsert using onConflictDoUpdate
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.id,
      set: updateSet,
    });

    // Initialize balance and stats for new users
    await initializeUserBalance(user.id);
    await initializeUserStats(user.id);
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Initialize user balance with starting coins
export async function initializeUserBalance(userId: string, startingCoins: number = 5000): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const existing = await db.select().from(balances).where(eq(balances.userId, userId)).limit(1);
    if (existing.length === 0) {
      await db.insert(balances).values({
        userId,
        coins: startingCoins, // Starting balance (5000 for demo, 0 for real)
      });
      console.log(`[Database] Initialized balance for user ${userId} with ${startingCoins} coins`);
    }
  } catch (error) {
    console.error(`[Database] Failed to initialize balance for user ${userId}:`, error);
  }
}

// Initialize user stats
export async function initializeUserStats(userId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const existing = await db.select().from(playerStats).where(eq(playerStats.userId, userId)).limit(1);
    if (existing.length === 0) {
      await db.insert(playerStats).values({
        userId,
        totalGamesPlayed: 0,
        totalWins: 0,
        totalLosses: 0,
        currentWinStreak: 0,
        longestWinStreak: 0,
        totalProfit: 0,
      });
      console.log(`[Database] Initialized stats for user ${userId}`);
    }
  } catch (error) {
    console.error(`[Database] Failed to initialize stats for user ${userId}:`, error);
  }
}

// TODO: add feature queries here as your schema grows.
