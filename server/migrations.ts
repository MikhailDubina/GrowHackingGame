import { readFileSync } from 'fs';
import { join } from 'path';
import pg from 'pg';
const { Pool } = pg;

export async function runMigrations() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not set, skipping migrations');
    return;
  }

  console.log('🔄 Running database migrations...');
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Check if migrations have already been run
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('✅ Database already migrated');
      return;
    }

    // Read migration file
    const migrationPath = join(process.cwd(), 'drizzle', '0000_typical_sugar_man.sql');
    const sql = readFileSync(migrationPath, 'utf8');
    
    // Split by statement breakpoint and execute
    const statements = sql.split('--> statement-breakpoint');
    
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        await pool.query(trimmed);
      }
    }
    
    console.log('✅ Database migrations completed successfully!');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}
