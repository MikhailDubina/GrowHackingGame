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
    const db = await getRawDb();
    if (!db) throw new Error('Database not available');
    
    // Проверка существования пользователя
    const [existingUsers]: any = await db.execute(
      'SELECT id FROM users WHERE username = ? OR phone = ?',
      [username, phone]
    );
    
    if (existingUsers.length > 0) {
      throw new Error('Username or phone already exists');
    }
    
    // Создание пользователя
    const userId = `user_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const passwordHash = hashPassword(password);
    
    await db.execute(
      `INSERT INTO users (id, username, phone, passwordHash, accountType, phoneVerified, isActive, createdAt) 
       VALUES (?, ?, ?, ?, 'real', FALSE, TRUE, NOW())`,
      [userId, username, phone, passwordHash]
    );
    
    // Создание баланса
    await db.execute(
      'INSERT INTO balances (userId, coins) VALUES (?, 1000)',
      [userId]
    );
    
    return { userId, username, phone };
  }
  
  // Отправка SMS-кода
  static async sendVerificationCode(phone: string) {
    const db = await getRawDb();
    if (!db) throw new Error('Database not available');
    
    // Генерация кода
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeId = `sms_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // Сохранение кода с expiresAt через SQL DATE_ADD
    await db.execute(
      `INSERT INTO smsVerificationCodes (id, phone, code, expiresAt, verified, attempts) 
       VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), FALSE, 0)`,
      [codeId, phone, code]
    );
    
    // Отправка SMS (в консоль для разработки)
    console.log(`📱 SMS to ${phone}: Your verification code is ${code}`);
    
    return { codeId };
  }
  
  // Проверка SMS-кода
  static async verifyCode(phone: string, code: string) {
    const db = await getRawDb();
    if (!db) throw new Error('Database not available');
    
    // Поиск кода
    const [codes]: any = await db.execute(
      `SELECT * FROM smsVerificationCodes 
       WHERE phone = ? AND code = ? AND verified = FALSE AND expiresAt > NOW()
       ORDER BY createdAt DESC LIMIT 1`,
      [phone, code]
    );
    
    if (codes.length === 0) {
      // Увеличиваем счетчик попыток
      await db.execute(
        'UPDATE smsVerificationCodes SET attempts = attempts + 1 WHERE phone = ? AND verified = FALSE',
        [phone]
      );
      throw new Error('Invalid or expired code');
    }
    
    const verificationCode = codes[0];
    
    // Проверка количества попыток
    if (verificationCode.attempts >= 3) {
      throw new Error('Too many attempts. Please request a new code.');
    }
    
    // Отметка кода как использованного
    await db.execute(
      'UPDATE smsVerificationCodes SET verified = TRUE WHERE id = ?',
      [verificationCode.id]
    );
    
    // Обновление статуса верификации телефона
    await db.execute(
      'UPDATE users SET phoneVerified = TRUE WHERE phone = ?',
      [phone]
    );
    
    return true;
  }
  
  // Вход по телефону и паролю
  static async login(phone: string, password: string) {
    const db = await getRawDb();
    if (!db) throw new Error('Database not available');
    
    // Поиск пользователя
    const [users]: any = await db.execute(
      'SELECT * FROM users WHERE phone = ? AND isActive = TRUE',
      [phone]
    );
    
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    const user = users[0];
    
    // Проверка пароля
    if (!verifyPassword(password, user.passwordHash)) {
      throw new Error('Invalid password');
    }
    
    // Генерация токена
    const token = generateToken(user.id);
    const sessionId = `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней
    
    // Сохранение сессии
    await db.execute(
      'INSERT INTO sessions (id, userId, token, expiresAt) VALUES (?, ?, ?, ?)',
      [sessionId, user.id, token, expiresAt]
    );
    
    // Обновление времени входа
    await db.execute(
      'UPDATE users SET lastSignedIn = NOW() WHERE id = ?',
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
    const db = await getRawDb();
    if (!db) throw new Error('Database not available');
    
    // Проверка кода
    await this.verifyCode(phone, code);
    
    // Поиск пользователя
    const [users]: any = await db.execute(
      'SELECT * FROM users WHERE phone = ? AND isActive = TRUE',
      [phone]
    );
    
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    const user = users[0];
    
    // Генерация токена
    const token = generateToken(user.id);
    const sessionId = `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // Сохранение сессии
    await db.execute(
      'INSERT INTO sessions (id, userId, token, expiresAt) VALUES (?, ?, ?, ?)',
      [sessionId, user.id, token, expiresAt]
    );
    
    // Обновление времени входа
    await db.execute(
      'UPDATE users SET lastSignedIn = NOW() WHERE id = ?',
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
    const db = await getRawDb();
    if (!db) throw new Error('Database not available');
    
    const [sessions]: any = await db.execute(
      'SELECT * FROM sessions WHERE token = ? AND expiresAt > NOW()',
      [token]
    );
    
    if (sessions.length === 0) {
      throw new Error('Invalid or expired token');
    }
    
    const session = sessions[0];
    
    // Получение пользователя
    const [users]: any = await db.execute(
      'SELECT * FROM users WHERE id = ? AND isActive = TRUE',
      [session.userId]
    );
    
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    return users[0];
  }
  
  // Выход
  static async logout(token: string) {
    const db = await getRawDb();
    if (!db) throw new Error('Database not available');
    
    await db.execute(
      'DELETE FROM sessions WHERE token = ?',
      [token]
    );
    
    return true;
  }
  // Get user by phone number
  static async getUserByPhone(phone: string) {
    const db = await getRawDb();
    if (!db) throw new Error('Database not available');
    
    const [users]: any = await db.execute(
      'SELECT id, username, phone, accountType, phoneVerified FROM users WHERE phone = ? LIMIT 1',
      [phone]
    );
    
    if (users.length === 0) {
      return null;
    }
    
    return users[0];
  }
}
