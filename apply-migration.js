import { readFileSync } from 'fs';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'dpg-d4av0m1r0fns73ej6vig-a.oregon-postgres.render.com',
  port: 5432,
  database: 'growhackinggame_db',
  user: 'growhackinggame_db_user',
  password: 'eU1T04qXLx1xcrlgVea2qXScEaBIJjrwwdpg-d4av0m1r0fns73ej6vig-a',
  ssl: { rejectUnauthorized: false }
});

async function applyMigration() {
  try {
    const sql = readFileSync('./drizzle/0000_typical_sugar_man.sql', 'utf8');
    
    // Split by statement breakpoint
    const statements = sql.split('--> statement-breakpoint');
    
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        console.log('Executing:', trimmed.substring(0, 60) + '...');
        await pool.query(trimmed);
      }
    }
    
    console.log('✅ Migration applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

applyMigration();
