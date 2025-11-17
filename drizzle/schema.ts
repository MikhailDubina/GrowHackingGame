import { pgTable, text, integer, timestamp, boolean, real, json, varchar, serial, bigint } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("login_method"),
  role: text("role").default("user"),
  lastSignedIn: timestamp("last_signed_in").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

// Balances table
export const balances = pgTable("balances", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  coins: integer("coins").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Balance = InferSelectModel<typeof balances>;
export type InsertBalance = InferInsertModel<typeof balances>;

// Player stats table
export const playerStats = pgTable("player_stats", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  totalGamesPlayed: integer("total_games_played").default(0).notNull(),
  totalWins: integer("total_wins").default(0).notNull(),
  totalLosses: integer("total_losses").default(0).notNull(),
  currentWinStreak: integer("current_win_streak").default(0).notNull(),
  longestWinStreak: integer("longest_win_streak").default(0).notNull(),
  totalProfit: integer("total_profit").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PlayerStat = InferSelectModel<typeof playerStats>;
export type InsertPlayerStat = InferInsertModel<typeof playerStats>;

// Game rounds table
export const gameRounds = pgTable("game_rounds", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  gameType: text("game_type").notNull(),
  betAmount: integer("bet_amount").notNull(),
  winAmount: integer("win_amount").default(0).notNull(),
  result: text("result").notNull(),
  gameData: json("game_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type GameRound = InferSelectModel<typeof gameRounds>;
export type InsertGameRound = InferInsertModel<typeof gameRounds>;

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Transaction = InferSelectModel<typeof transactions>;
export type InsertTransaction = InferInsertModel<typeof transactions>;

// Coin packages table
export const coinPackages = pgTable("coin_packages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  coins: integer("coins").notNull(),
  price: integer("price").notNull(),
  bonus: integer("bonus").default(0).notNull(),
  popular: boolean("popular").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CoinPackage = InferSelectModel<typeof coinPackages>;
export type InsertCoinPackage = InferInsertModel<typeof coinPackages>;

// Purchases table
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  packageId: text("package_id").notNull().references(() => coinPackages.id),
  amount: integer("amount").notNull(),
  coins: integer("coins").notNull(),
  status: text("status").default("pending").notNull(),
  paymentIntentId: text("payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Purchase = InferSelectModel<typeof purchases>;
export type InsertPurchase = InferInsertModel<typeof purchases>;

// Match three rounds table
export const matchThreeRounds = pgTable("match_three_rounds", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  betAmount: integer("bet_amount").notNull(),
  winAmount: integer("win_amount").default(0).notNull(),
  moves: integer("moves").notNull(),
  score: integer("score").notNull(),
  result: text("result").notNull(),
  boardState: json("board_state"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MatchThreeRound = InferSelectModel<typeof matchThreeRounds>;
export type InsertMatchThreeRound = InferInsertModel<typeof matchThreeRounds>;

// Power-up purchases table
export const powerUpPurchases = pgTable("power_up_purchases", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  powerUpType: text("power_up_type").notNull(),
  cost: integer("cost").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PowerUpPurchase = InferSelectModel<typeof powerUpPurchases>;
export type InsertPowerUpPurchase = InferInsertModel<typeof powerUpPurchases>;

// Daily attempts table
export const dailyAttempts = pgTable("daily_attempts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  gameType: text("game_type").notNull(),
  attemptsUsed: integer("attempts_used").default(0).notNull(),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DailyAttempt = InferSelectModel<typeof dailyAttempts>;
export type InsertDailyAttempt = InferInsertModel<typeof dailyAttempts>;

// Promo codes table
export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  coins: integer("coins").notNull(),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").default(0).notNull(),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PromoCode = InferSelectModel<typeof promoCodes>;
export type InsertPromoCode = InferInsertModel<typeof promoCodes>;

// Promo redemptions table
export const promoRedemptions = pgTable("promo_redemptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  promoCodeId: integer("promo_code_id").notNull().references(() => promoCodes.id),
  coins: integer("coins").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PromoRedemption = InferSelectModel<typeof promoRedemptions>;
export type InsertPromoRedemption = InferInsertModel<typeof promoRedemptions>;

// Progressive jackpot table
export const progressiveJackpot = pgTable("progressive_jackpot", {
  id: serial("id").primaryKey(),
  currentAmount: integer("current_amount").default(0).notNull(),
  lastWinnerId: text("last_winner_id").references(() => users.id),
  lastWonAt: timestamp("last_won_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ProgressiveJackpot = InferSelectModel<typeof progressiveJackpot>;
export type InsertProgressiveJackpot = InferInsertModel<typeof progressiveJackpot>;

// Jackpot wins table
export const jackpotWins = pgTable("jackpot_wins", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type JackpotWin = InferSelectModel<typeof jackpotWins>;
export type InsertJackpotWin = InferInsertModel<typeof jackpotWins>;

// Daily challenges table
export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  target: integer("target").notNull(),
  reward: integer("reward").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DailyChallenge = InferSelectModel<typeof dailyChallenges>;
export type InsertDailyChallenge = InferInsertModel<typeof dailyChallenges>;

// User challenge progress table
export const userChallengeProgress = pgTable("user_challenge_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  challengeId: integer("challenge_id").notNull().references(() => dailyChallenges.id),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  claimed: boolean("claimed").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserChallengeProgress = InferSelectModel<typeof userChallengeProgress>;
export type InsertUserChallengeProgress = InferInsertModel<typeof userChallengeProgress>;

// Reviews table
export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  isApproved: boolean("isApproved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Review = InferSelectModel<typeof reviews>;
export type InsertReview = InferInsertModel<typeof reviews>;
