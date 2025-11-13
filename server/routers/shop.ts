import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { coinPackages, purchases, balances, transactions } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createCheckoutSession } from "../services/stripeService";
import { ENV } from "../_core/env";

export const shopRouter = router({
  /**
   * Get all active coin packages
   */
  getPackages: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }
    
    const packages = await db
      .select()
      .from(coinPackages)
      .where(eq(coinPackages.active, true))
      .orderBy(coinPackages.displayOrder);
    
    return { packages };
  }),

  /**
   * Create Stripe checkout session for real payment
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        packageId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      const userId = ctx.user.id;

      // Get package details
      const [pkg] = await db
        .select()
        .from(coinPackages)
        .where(and(eq(coinPackages.id, input.packageId), eq(coinPackages.active, true)))
        .limit(1);

      if (!pkg) {
        throw new Error("Package not found or inactive");
      }

      // Create pending purchase record
      const purchaseId = nanoid();

      try {
        // Create Stripe checkout session
        const session = await createCheckoutSession({
          userId,
          packageId: pkg.id,
          packageName: pkg.name,
          coins: pkg.coins,
          bonusCoins: pkg.bonusCoins,
          priceInCents: pkg.price,
          successUrl: `${process.env.VITE_APP_URL || 'http://localhost:5000'}/shop?success=true`,
          cancelUrl: `${process.env.VITE_APP_URL || 'http://localhost:5000'}/shop?canceled=true`,
        });

        // Save purchase record with pending status
        await db.insert(purchases).values({
          id: purchaseId,
          userId,
          packageId: pkg.id,
          stripeSessionId: session.id,
          amount: pkg.price,
          coins: pkg.coins,
          bonusCoins: pkg.bonusCoins,
          status: "pending",
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error: any) {
        console.error("[Shop] Failed to create checkout session:", error);
        throw new Error("Failed to create checkout session: " + error.message);
      }
    }),

  /**
   * Simulate purchase (for demo - no real Stripe integration)
   */
  simulatePurchase: protectedProcedure
    .input(
      z.object({
        packageId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      const userId = ctx.user.id;

      // Get package details
      const [pkg] = await db
        .select()
        .from(coinPackages)
        .where(and(eq(coinPackages.id, input.packageId), eq(coinPackages.active, true)))
        .limit(1);

      if (!pkg) {
        throw new Error("Package not found or inactive");
      }

      // Create purchase record
      const purchaseId = nanoid();
      const sessionId = `demo_${nanoid()}`;

      await db.insert(purchases).values({
        id: purchaseId,
        userId,
        packageId: pkg.id,
        stripeSessionId: sessionId,
        amount: pkg.price,
        coins: pkg.coins,
        bonusCoins: pkg.bonusCoins,
        status: "completed",
        completedAt: new Date(),
      });

      // Add coins to user balance
      const totalCoins = pkg.coins + pkg.bonusCoins;
      
      const [currentBalance] = await db
        .select()
        .from(balances)
        .where(eq(balances.userId, userId))
        .limit(1);

      const newBalance = (currentBalance?.coins || 0) + totalCoins;

      await db
        .update(balances)
        .set({
          coins: newBalance,
          totalDeposited: (currentBalance?.totalDeposited || 0) + totalCoins,
          updatedAt: new Date(),
        })
        .where(eq(balances.userId, userId));

      // Record transaction
      await db.insert(transactions).values({
        id: nanoid(),
        userId,
        type: "deposit",
        amount: totalCoins,
        balanceBefore: currentBalance?.coins || 0,
        balanceAfter: newBalance,
        metadata: JSON.stringify({
          purchaseId,
          packageId: pkg.id,
          demo: true,
        }),
      });

      return {
        success: true,
        coins: totalCoins,
        newBalance,
      };
    }),

  /**
   * Get user's purchase history
   */
  getPurchaseHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }

    const userId = ctx.user.id;

    const userPurchases = await db
      .select({
        id: purchases.id,
        packageName: coinPackages.name,
        coins: purchases.coins,
        bonusCoins: purchases.bonusCoins,
        amount: purchases.amount,
        status: purchases.status,
        createdAt: purchases.createdAt,
        completedAt: purchases.completedAt,
      })
      .from(purchases)
      .leftJoin(coinPackages, eq(purchases.packageId, coinPackages.id))
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.createdAt))
      .limit(50);

    return { purchases: userPurchases };
  }),
});
