import type { Request, Response } from "express";
import { getDb } from "../db";
import { purchases, balances, transactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { constructWebhookEvent } from "../services/stripeService";

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    console.error("[Stripe Webhook] Missing signature");
    return res.status(400).send("Missing signature");
  }

  try {
    // Construct event from webhook payload
    const event = await constructWebhookEvent(req.body, signature as string);

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      const userId = session.metadata?.userId;
      const packageId = session.metadata?.packageId;
      const coins = parseInt(session.metadata?.coins || "0");
      const bonusCoins = parseInt(session.metadata?.bonusCoins || "0");

      if (!userId || !packageId) {
        console.error("[Stripe Webhook] Missing metadata in session");
        return res.status(400).send("Missing metadata");
      }

      const db = await getDb();
      if (!db) {
        console.error("[Stripe Webhook] Database connection failed");
        return res.status(500).send("Database error");
      }

      // Find the pending purchase
      const [purchase] = await db
        .select()
        .from(purchases)
        .where(eq(purchases.stripeSessionId, session.id))
        .limit(1);

      if (!purchase) {
        console.error(`[Stripe Webhook] Purchase not found for session: ${session.id}`);
        return res.status(404).send("Purchase not found");
      }

      // Check if already completed
      if (purchase.status === "completed") {
        console.log(`[Stripe Webhook] Purchase already completed: ${purchase.id}`);
        return res.status(200).send("Already processed");
      }

      // Update purchase status
      await db
        .update(purchases)
        .set({
          status: "completed",
          stripePaymentIntentId: session.payment_intent,
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

      console.log(
        `[Stripe Webhook] Successfully processed payment for user ${userId}: +${totalCoins} coins`
      );

      return res.status(200).send("Success");
    }

    // Handle payment_intent.payment_failed event
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as any;
      
      const db = await getDb();
      if (!db) {
        return res.status(500).send("Database error");
      }

      // Find purchase by payment intent
      const [purchase] = await db
        .select()
        .from(purchases)
        .where(eq(purchases.stripePaymentIntentId, paymentIntent.id))
        .limit(1);

      if (purchase) {
        await db
          .update(purchases)
          .set({ status: "failed" })
          .where(eq(purchases.id, purchase.id));

        console.log(`[Stripe Webhook] Payment failed for purchase: ${purchase.id}`);
      }

      return res.status(200).send("Failure recorded");
    }

    // Return success for other events
    return res.status(200).send("Event received");
  } catch (error: any) {
    console.error("[Stripe Webhook] Error processing webhook:", error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
}
