import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getRawDb } from '../db';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Telegram Stars packages
const STARS_PACKAGES = [
  { id: 'pack_100', stars: 10, coins: 100, title: '100 монет', description: 'Стартовый пакет' },
  { id: 'pack_500', stars: 45, coins: 500, title: '500 монет', description: 'Популярный выбор' },
  { id: 'pack_1000', stars: 85, coins: 1000, title: '1000 монет', description: 'Выгодное предложение' },
  { id: 'pack_2500', stars: 200, coins: 2500, title: '2500 монет', description: 'Лучшая цена' },
  { id: 'pack_5000', stars: 380, coins: 5000, title: '5000 монет', description: 'VIP пакет' },
];

// Create invoice for Telegram Stars payment
async function createStarsInvoice(chatId: number, packageId: string) {
  const pkg = STARS_PACKAGES.find(p => p.id === packageId);
  if (!pkg) throw new Error('Package not found');

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendInvoice`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      title: pkg.title,
      description: pkg.description,
      payload: JSON.stringify({ packageId, coins: pkg.coins }),
      currency: 'XTR', // Telegram Stars currency code
      prices: [{ label: pkg.title, amount: pkg.stars }]
    })
  });

  return response.json();
}

export const telegramStarsRouter = router({
  // Get available packages
  getPackages: publicProcedure
    .query(() => {
      return STARS_PACKAGES;
    }),

  // Create payment invoice
  createInvoice: publicProcedure
    .input(z.object({
      packageId: z.string(),
      telegramChatId: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error('Not authenticated');
      }

      const db = getRawDb();
      
      // Get user's Telegram Chat ID
      let chatId = input.telegramChatId;
      if (!chatId) {
        const [users]: any = await db.execute(
          'SELECT telegramChatId FROM users WHERE id = ?',
          [ctx.user.id]
        );
        
        if (users.length === 0 || !users[0].telegramChatId) {
          throw new Error('Telegram account not linked. Please link your Telegram first.');
        }
        
        chatId = users[0].telegramChatId;
      }

      // Create invoice
      const result = await createStarsInvoice(parseInt(chatId), input.packageId);
      
      if (!result.ok) {
        throw new Error('Failed to create invoice');
      }

      // Save pending payment
      const pkg = STARS_PACKAGES.find(p => p.id === input.packageId);
      await db.execute(
        'INSERT INTO telegramStarsPayments (userId, packageId, stars, coins, status) VALUES (?, ?, ?, ?, ?)',
        [ctx.user.id, input.packageId, pkg!.stars, pkg!.coins, 'pending']
      );

      return { success: true, invoice: result.result };
    }),

  // Handle successful payment (webhook from Telegram)
  handlePayment: publicProcedure
    .input(z.object({
      update_id: z.number(),
      pre_checkout_query: z.object({
        id: z.string(),
        from: z.object({
          id: z.number()
        }),
        currency: z.string(),
        total_amount: z.number(),
        invoice_payload: z.string()
      }).optional(),
      message: z.object({
        successful_payment: z.object({
          currency: z.string(),
          total_amount: z.number(),
          invoice_payload: z.string(),
          telegram_payment_charge_id: z.string()
        }).optional(),
        from: z.object({
          id: z.number()
        })
      }).optional()
    }))
    .mutation(async ({ input }) => {
      const db = getRawDb();

      // Handle pre-checkout query (answer OK to proceed)
      if (input.pre_checkout_query) {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerPreCheckoutQuery`;
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pre_checkout_query_id: input.pre_checkout_query.id,
            ok: true
          })
        });
        return { success: true };
      }

      // Handle successful payment
      if (input.message?.successful_payment) {
        const payment = input.message.successful_payment;
        const payload = JSON.parse(payment.invoice_payload);
        const telegramUserId = input.message.from.id;

        // Find user by Telegram ID
        const [users]: any = await db.execute(
          'SELECT id FROM users WHERE telegramChatId = ?',
          [telegramUserId.toString()]
        );

        if (users.length === 0) {
          console.error('[TelegramStars] User not found for Telegram ID:', telegramUserId);
          return { success: false, error: 'User not found' };
        }

        const userId = users[0].id;

        // Add coins to user balance
        await db.execute(
          'UPDATE balances SET coins = coins + ? WHERE userId = ?',
          [payload.coins, userId]
        );

        // Update payment status
        await db.execute(
          'UPDATE telegramStarsPayments SET status = ?, telegramPaymentId = ?, completedAt = NOW() WHERE userId = ? AND packageId = ? AND status = ?',
          ['completed', payment.telegram_payment_charge_id, userId, payload.packageId, 'pending']
        );

        // Send confirmation message
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramUserId,
            text: `✅ <b>Оплата успешна!</b>\n\n` +
                  `Вам начислено <b>${payload.coins} монет</b>.\n\n` +
                  `Приятной игры! 🎮`,
            parse_mode: 'HTML'
          })
        });

        console.log('[TelegramStars] Payment completed:', {
          userId,
          coins: payload.coins,
          stars: payment.total_amount
        });

        return { success: true };
      }

      return { success: false };
    }),

  // Get user's payment history
  getPaymentHistory: publicProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new Error('Not authenticated');
      }

      const db = getRawDb();
      const [payments]: any = await db.execute(
        'SELECT packageId, stars, coins, status, createdAt, completedAt FROM telegramStarsPayments WHERE userId = ? ORDER BY createdAt DESC LIMIT 20',
        [ctx.user.id]
      );

      return payments;
    })
});
