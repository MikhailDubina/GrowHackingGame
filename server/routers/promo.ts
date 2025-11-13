import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { promoCodes, promoRedemptions, balances, transactions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export const promoRouter = router({
  /**
   * Redeem a promo code
   */
  redeemCode: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1).max(32),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      const userId = ctx.user.id;
      const codeUpper = input.code.toUpperCase();

      // Find promo code
      const [promoCode] = await db
        .select()
        .from(promoCodes)
        .where(eq(promoCodes.code, codeUpper))
        .limit(1);

      if (!promoCode) {
        throw new Error("Invalid promo code");
      }

      if (!promoCode.active) {
        throw new Error("This promo code is no longer active");
      }

      // Check if expired
      if (promoCode.validUntil && new Date() > promoCode.validUntil) {
        throw new Error("This promo code has expired");
      }

      // Check if max uses reached
      if (promoCode.maxUses > 0 && promoCode.currentUses >= promoCode.maxUses) {
        throw new Error("This promo code has reached its maximum number of uses");
      }

      // Check if user already redeemed this code
      const [existingRedemption] = await db
        .select()
        .from(promoRedemptions)
        .where(
          and(
            eq(promoRedemptions.userId, userId),
            eq(promoRedemptions.promoCodeId, promoCode.id)
          )
        )
        .limit(1);

      if (existingRedemption) {
        throw new Error("You have already redeemed this promo code");
      }

      // Get user balance
      const [userBalance] = await db
        .select()
        .from(balances)
        .where(eq(balances.userId, userId))
        .limit(1);

      if (!userBalance) {
        throw new Error("User balance not found");
      }

      const balanceBefore = userBalance.coins;
      const balanceAfter = balanceBefore + promoCode.bonusCoins;

      // Update balance
      await db
        .update(balances)
        .set({
          coins: balanceAfter,
          updatedAt: new Date(),
        })
        .where(eq(balances.userId, userId));

      // Create redemption record
      await db.insert(promoRedemptions).values({
        id: nanoid(),
        userId,
        promoCodeId: promoCode.id,
        bonusCoins: promoCode.bonusCoins,
        redeemedAt: new Date(),
      });

      // Update promo code usage count
      await db
        .update(promoCodes)
        .set({
          currentUses: promoCode.currentUses + 1,
        })
        .where(eq(promoCodes.id, promoCode.id));

      // Create transaction record
      await db.insert(transactions).values({
        id: nanoid(),
        userId,
        type: "promo_code",
        amount: promoCode.bonusCoins,
        balanceBefore,
        balanceAfter,
        metadata: JSON.stringify({
          promoCode: promoCode.code,
          description: promoCode.description,
        }),
        createdAt: new Date(),
      });

      return {
        success: true,
        bonusCoins: promoCode.bonusCoins,
        newBalance: balanceAfter,
        message: `Successfully redeemed! You received ${promoCode.bonusCoins} bonus coins!`,
      };
    }),

  /**
   * Get user's redeemed promo codes
   */
  getRedeemedCodes: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }

    const userId = ctx.user.id;

    const redemptions = await db
      .select({
        id: promoRedemptions.id,
        code: promoCodes.code,
        bonusCoins: promoRedemptions.bonusCoins,
        redeemedAt: promoRedemptions.redeemedAt,
        description: promoCodes.description,
      })
      .from(promoRedemptions)
      .innerJoin(promoCodes, eq(promoRedemptions.promoCodeId, promoCodes.id))
      .where(eq(promoRedemptions.userId, userId))
      .orderBy(promoRedemptions.redeemedAt);

    return redemptions;
  }),
});
