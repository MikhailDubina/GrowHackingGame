import Stripe from 'stripe';
import { ENV } from '../_core/env';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance && ENV.stripeSecretKey) {
    stripeInstance = new Stripe(ENV.stripeSecretKey, {
      apiVersion: '2025-09-30.clover',
    });
  }
  
  if (!stripeInstance) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
  
  return stripeInstance;
}

export async function createCheckoutSession(params: {
  userId: string;
  packageId: string;
  packageName: string;
  coins: number;
  bonusCoins: number;
  priceInCents: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: params.packageName,
            description: `${params.coins} coins + ${params.bonusCoins} bonus coins`,
          },
          unit_amount: params.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId,
      packageId: params.packageId,
      coins: params.coins.toString(),
      bonusCoins: params.bonusCoins.toString(),
    },
  });
  
  return session;
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const stripe = getStripe();
  
  if (!ENV.stripeWebhookSecret) {
    throw new Error('Stripe webhook secret is not configured');
  }
  
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    ENV.stripeWebhookSecret
  );
}
