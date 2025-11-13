import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { constructWebhookEvent } from "../services/stripeService";
import { getDb } from "../db";
import { purchases, balances, transactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type Stripe from "stripe";

export const webhookRouter = router({
  /**
   * Handle Stripe webhook events
   */
  handleStripeWebhook: publicProcedure
    .input(
      z.object({
        payload: z.string(),
        signature: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      try {
        // Verify webhook signature and construct event
        const event = await constructWebhookEvent(input.payload, input.signature);

        // Handle the event
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            
            // Get metadata from session
            const userId = session.metadata?.userId;
            const packageId = session.metadata?.packageId;
            const coins = parseInt(session.metadata?.coins || "0");
            const bonusCoins = parseInt(session.metadata?.bonusCoins || "0");

            if (!userId || !packageId) {
              console.error("[Webhook] Missing metadata in session:", session.id);
              return { received: false, error: "Missing metadata" };
            }

            // Find the pending purchase
            const [purchase] = await db
              .select()
              .from(purchases)
              .where(eq(purchases.stripeSessionId, session.id))
              .limit(1);

            if (!purchase) {
              console.error("[Webhook] Purchase not found for session:", session.id);
              return { received: false, error: "Purchase not found" };
            }

            // Update purchase status
            await db
              .update(purchases)
              .set({
                status: "completed",
                stripePaymentIntentId: session.payment_intent as string,
                completedAt: new Date(),
              })
              .where(eq(purchases.id, purchase.id));

            // Add coins to user balance
            const totalCoins = coins + bonusCoins;
            
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
                purchaseId: purchase.id,
                packageId,
                stripeSessionId: session.id,
                stripePaymentIntentId: session.payment_intent,
              }),
            });

            console.log(`[Webhook] Successfully processed payment for user ${userId}: +${totalCoins} coins`);
            break;
          }

          case "checkout.session.expired":
          case "payment_intent.payment_failed": {
            const session = event.data.object as Stripe.Checkout.Session;
            
            // Update purchase status to failed
            await db
              .update(purchases)
              .set({
                status: "failed",
              })
              .where(eq(purchases.stripeSessionId, session.id));

            console.log(`[Webhook] Payment failed or expired for session: ${session.id}`);
            break;
          }

          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }

        return { received: true };
      } catch (error: any) {
        console.error("[Webhook] Error processing webhook:", error);
        throw new Error("Webhook processing failed: " + error.message);
      }
    }),
});
