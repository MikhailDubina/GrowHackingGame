import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getPool } from '../db';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Send message via Telegram Bot API
async function sendTelegramMessage(chatId: string | number, text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML'
    })
  });
  return response.json();
}

export const telegramRouter = router({
  // Webhook handler for Telegram Bot updates
  webhook: publicProcedure
    .input(z.object({
      update_id: z.number(),
      message: z.object({
        message_id: z.number(),
        from: z.object({
          id: z.number(),
          first_name: z.string(),
          username: z.string().optional()
        }),
        chat: z.object({
          id: z.number(),
          type: z.string()
        }),
        text: z.string()
      }).optional()
    }))
    .mutation(async ({ input }) => {
      if (!input.message) {
        return { success: false };
      }

      const { message } = input;
      const chatId = message.chat.id;
      const text = message.text;
      const userId = message.from.id;
      const username = message.from.username || message.from.first_name;

      // Handle /start command
      if (text === '/start') {
        const pool = await getPool();
        
        // Check if user exists with this Telegram ID
        const users = await pool.query(
          'SELECT id, username FROM users WHERE "telegramChatId" = $1',
          [chatId.toString()]
        );

        if (users.rows.length > 0) {
          // User already linked
          await sendTelegramMessage(chatId, 
            `✅ <b>Добро пожаловать, ${users.rows[0].username}!</b>\n\n` +
            `Ваш Telegram уже привязан к аккаунту.\n\n` +
            `Вы будете получать коды верификации здесь.`
          );
        } else {
          // New user - provide link code
          const linkCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          
          // Store link code temporarily (expires in 10 minutes)
          await pool.query(
            'INSERT INTO "telegramLinkCodes" (code, "telegramChatId", "telegramUsername", "expiresAt") VALUES ($1, $2, $3, NOW() + INTERVAL \'10 minutes\')',
            [linkCode, chatId.toString(), username]
          );

          await sendTelegramMessage(chatId,
            `👋 <b>Добро пожаловать в GrowHackingGame!</b>\n\n` +
            `Для привязки вашего Telegram к аккаунту:\n\n` +
            `1. Войдите на сайт\n` +
            `2. Перейдите в настройки профиля\n` +
            `3. Введите код: <code>${linkCode}</code>\n\n` +
            `Код действителен 10 минут.`
          );
        }

        return { success: true };
      }

      // Default response
      await sendTelegramMessage(chatId,
        `Используйте команду /start для начала работы.`
      );

      return { success: true };
    }),

  // Link Telegram account with user account
  linkAccount: publicProcedure
    .input(z.object({
      linkCode: z.string().length(6)
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error('Not authenticated');
      }

      const pool = await getPool();
      
      // Find link code
      const codes = await pool.query(
        'SELECT "telegramChatId", "telegramUsername" FROM "telegramLinkCodes" WHERE code = $1 AND "expiresAt" > NOW()',
        [input.linkCode]
      );

      if (codes.rows.length === 0) {
        throw new Error('Invalid or expired code');
      }

      const { telegramChatId, telegramUsername } = codes.rows[0];

      // Update user with Telegram info
      await pool.query(
        'UPDATE users SET "telegramChatId" = $1, "telegramUsername" = $2 WHERE id = $3',
        [telegramChatId, telegramUsername, ctx.user.id]
      );

      // Delete used code
      await pool.query(
        'DELETE FROM "telegramLinkCodes" WHERE code = $1',
        [input.linkCode]
      );

      // Send confirmation to Telegram
      await sendTelegramMessage(telegramChatId,
        `✅ <b>Аккаунт успешно привязан!</b>\n\n` +
        `Теперь вы будете получать коды верификации в этом чате.`
      );

      return { success: true, telegramUsername };
    }),

  // Send test message
  sendTestMessage: publicProcedure
    .input(z.object({
      chatId: z.string(),
      message: z.string()
    }))
    .mutation(async ({ input }) => {
      const result = await sendTelegramMessage(input.chatId, input.message);
      return result;
    })
});
