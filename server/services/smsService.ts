import crypto from 'crypto';

// SMS Service with Telegram Bot integration
export class SMSService {
  private static TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  private static TELEGRAM_API_URL = `https://api.telegram.org/bot${SMSService.TELEGRAM_BOT_TOKEN}`;

  // Генерация 6-значного кода
  static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Отправка через Telegram Bot
  static async sendTelegram(chatId: string, message: string): Promise<boolean> {
    try {
      if (!this.TELEGRAM_BOT_TOKEN) {
        console.error('❌ TELEGRAM_BOT_TOKEN not configured');
        return false;
      }

      const response = await fetch(`${this.TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      
      if (data.ok) {
        console.log(`✅ Telegram message sent to ${chatId}`);
        return true;
      } else {
        console.error('❌ Telegram API error:', data);
        return false;
      }
    } catch (error) {
      console.error('❌ Telegram sending error:', error);
      return false;
    }
  }

  // Получить Chat ID по username
  static async getChatIdByUsername(username: string): Promise<string | null> {
    // Telegram Bot API не предоставляет прямого способа получить chat_id по username
    // Пользователь должен сначала написать боту /start
    // Возвращаем null, чтобы использовать fallback
    return null;
  }

  // Отправка SMS кода
  static async sendSMS(phone: string, code: string, telegramChatId?: string): Promise<boolean> {
    try {
      const message = `🎮 <b>GrowHackingGame</b>\n\n` +
                     `Ваш код верификации: <code>${code}</code>\n\n` +
                     `Код действителен 10 минут.\n` +
                     `Не сообщайте его никому!`;

      // Попытка отправить через Telegram
      if (telegramChatId) {
        const telegramSent = await this.sendTelegram(telegramChatId, message);
        if (telegramSent) {
          return true;
        }
      }

      // Fallback: вывод в консоль для разработки
      console.log(`📱 SMS to ${phone}: Your verification code is ${code}`);
      console.log(`💡 Telegram Chat ID: ${telegramChatId || 'not provided'}`);
      console.log(`📝 To receive codes via Telegram:`);
      console.log(`   1. Start chat with bot: https://t.me/YourBotUsername`);
      console.log(`   2. Send /start command`);
      console.log(`   3. Use your Chat ID during registration`);
      
      return true;
    } catch (error) {
      console.error('SMS sending error:', error);
      return false;
    }
  }

  // Валидация номера телефона
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+[1-9]\d{10,14}$/;
    return phoneRegex.test(phone);
  }

  // Форматирование номера телефона
  static formatPhone(phone: string): string {
    return phone.replace(/[^\d+]/g, '');
  }

  // Валидация Telegram Chat ID
  static validateTelegramChatId(chatId: string): boolean {
    // Chat ID может быть числом или строкой вида "@username"
    return /^-?\d+$/.test(chatId) || /^@[a-zA-Z0-9_]{5,32}$/.test(chatId);
  }
}
