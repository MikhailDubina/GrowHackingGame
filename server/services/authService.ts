import crypto from 'crypto';
import { getRawDb } from '../db';

// Простое хеширование пароля (в production использовать bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Генерация JWT токена (упрощенная версия)
function generateToken(userId: string): string {
  const payload = {
    userId,
    timestamp: Date.now(),
    random: crypto.randomBytes(16).toString('hex')
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export class AuthService {
  // Регистрация нового пользователя
  static async register(username: string, phone: string, password: string) {
    const pool = await getRawDb();
    if (!pool) throw new Error('Database not available');
    
    // Проверка существования пользователя
    const existingUsers = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR phone = $2',
      [username, phone]
    );
    
    if (existingUsers.rows.length > 0) {
      throw new Error('Username or phone already exists');
    }
    
    // Создание пользователя
    const userId = `user_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const passwordHash = hashPassword(password);
    
    await pool.query(
      `INSERT INTO users (id, username, phone, "passwordHash", "accountType", "phoneVerified", "isActive", "createdAt") 
       VALUES ($1, $2, $3, $4, 'real', FALSE, TRUE, NOW())`,
      [userId, username, phone, passwordHash]
    );
    
    // Создание баланса
    await pool.query(
      'INSERT INTO balances ("userId", coins) VALUES ($1, 1000)',
      [userId]
    );
    
    return { userId, username, phone };
  }
  
  // Отправка SMS-кода
  static async sendVerificationCode(phone: string) {
    const pool = await getRawDb();
    if (!pool) throw new Error('Database not available');
    
    // Генерация кода
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeId = `sms_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // Сохранение кода с expiresAt через PostgreSQL INTERVAL
    await pool.query(
      `INSERT INTO "smsVerificationCodes" (id, phone, code, "expiresAt", verified, attempts) 
       VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes', FALSE, 0)`,
      [codeId, phone, code]
    );
    
    // Отправка SMS (в консоль для разработки)
    console.log(`📱 SMS to ${phone}: Your verification code is ${code}`);
    
    return { codeId };
  }
  
  // Проверка SMS-кода
  static async verifyCode(phone: string, code: string) {
    const pool = await getRawDb();
    if (!pool) throw new Error('Database not available');
    
    // Поиск кода
    const codes = await pool.query(
      `SELECT * FROM "smsVerificationCodes" 
       WHERE phone = $1 AND code = $2 AND verified = FALSE AND "expiresAt" > NOW()
       ORDER BY "createdAt" DESC LIMIT 1`,
      [phone, code]
    );
    
    if (codes.rows.length === 0) {
      // Увеличиваем счетчик попыток
      await pool.query(
        'UPDATE "smsVerificationCodes" SET attempts = attempts + 1 WHERE phone = $1 AND verified = FALSE',
        [phone]
      );
      throw new Error('Invalid or expired code');
    }
    
    const verificationCode = codes.rows[0];
    
    // Проверка количества попыток
    if (verificationCode.attempts >= 3) {
      throw new Error('Too many attempts. Please request a new code.');
    }
    
    // Отметка кода как использованного
    await pool.query(
      'UPDATE "smsVerificationCodes" SET verified = TRUE WHERE id = $1',
      [verificationCode.id]
    );
    
    // Обновление статуса верификации телефона
    await pool.query(
      'UPDATE users SET "phoneVerified" = TRUE WHERE phone = $1',
      [phone]
    );
    
    return true;
  }
  
  // Вход по телефону и паролю
  static async login(phone: string, password: string) {
    const pool = await getRawDb();
    if (!pool) throw new Error('Database not available');
    
    // Поиск пользователя
    const users = await pool.query(
      'SELECT * FROM users WHERE phone = $1 AND "isActive" = TRUE',
      [phone]
    );
    
    if (users.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = users.rows[0];
    
    // Проверка пароля
    if (!verifyPassword(password, user.passwordHash)) {
      throw new Error('Invalid password');
    }
    
    // Генерация токена
    const token = generateToken(user.id);
    const sessionId = `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней
    
    // Сохранение сессии
    await pool.query(
      'INSERT INTO sessions (id, "userId", token, "expiresAt") VALUES ($1, $2, $3, $4)',
      [sessionId, user.id, token, expiresAt]
    );
    
    // Обновление времени входа
    await pool.query(
      'UPDATE users SET "lastSignedIn" = NOW() WHERE id = $1',
      [user.id]
    );
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        accountType: user.accountType
      }
    };
  }
  
  // Вход по SMS-коду (без пароля)
  static async loginWithSMS(phone: string, code: string) {
    const pool = await getRawDb();
    if (!pool) throw new Error('Database not available');
    
    // Проверка кода
    await this.verifyCode(phone, code);
    
    // Поиск пользователя
    const users = await pool.query(
      'SELECT * FROM users WHERE phone = $1 AND "isActive" = TRUE',
      [phone]
    );
    
    if (users.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = users.rows[0];
    
    // Генерация токена
    const token = generateToken(user.id);
    const sessionId = `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // Сохранение сессии
    await pool.query(
      'INSERT INTO sessions (id, "userId", token, "expiresAt") VALUES ($1, $2, $3, $4)',
      [sessionId, user.id, token, expiresAt]
    );
    
    // Обновление времени входа
    await pool.query(
      'UPDATE users SET "lastSignedIn" = NOW() WHERE id = $1',
      [user.id]
    );
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        accountType: user.accountType
      }
    };
  }
  
  // Проверка токена
  static async verifyToken(token: string) {
    const pool = await getRawDb();
    if (!pool) throw new Error('Database not available');
    
    const sessions = await pool.query(
      'SELECT * FROM sessions WHERE token = $1 AND "expiresAt" > NOW()',
      [token]
    );
    
    if (sessions.rows.length === 0) {
      throw new Error('Invalid or expired token');
    }
    
    const session = sessions.rows[0];
    
    // Получение пользователя
    const users = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND "isActive" = TRUE',
      [session.userId]
    );
    
    if (users.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return users.rows[0];
  }
  
  // Выход
  static async logout(token: string) {
    const pool = await getRawDb();
    if (!pool) throw new Error('Database not available');
    
    await pool.query(
      'DELETE FROM sessions WHERE token = $1',
      [token]
    );
    
    return true;
  }
  
  // Get user by phone number
  static async getUserByPhone(phone: string) {
    const pool = await getRawDb();
    if (!pool) throw new Error('Database not available');
    
    const users = await pool.query(
      'SELECT id, username, phone, "accountType", "phoneVerified" FROM users WHERE phone = $1 LIMIT 1',
      [phone]
    );
    
    if (users.rows.length === 0) {
      return null;
    }
    
    return users.rows[0];
  }
}
