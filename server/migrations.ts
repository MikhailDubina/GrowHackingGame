import { readFileSync, readdirSync } from 'fs';
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
    // Create migrations tracking table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Get list of all migration files
    const migrationsDir = join(process.cwd(), 'drizzle');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations run in order

    console.log(`📋 Found ${migrationFiles.length} migration file(s)`);

    // Get already applied migrations
    const appliedMigrations = await pool.query(
      'SELECT name FROM _migrations ORDER BY id'
    );
    const appliedNames = new Set(appliedMigrations.rows.map(row => row.name));

    // Run pending migrations
    let appliedCount = 0;
    for (const file of migrationFiles) {
      if (appliedNames.has(file)) {
        console.log(`⏭️  Skipping ${file} (already applied)`);
        continue;
      }

      console.log(`▶️  Applying migration: ${file}`);
      
      // Read migration file
      const migrationPath = join(migrationsDir, file);
      const sql = readFileSync(migrationPath, 'utf8');
      
      // Split by statement breakpoint and execute
      const statements = sql.split('--> statement-breakpoint');
      
      for (const statement of statements) {
        const trimmed = statement.trim();
        if (trimmed) {
          await pool.query(trimmed);
        }
      }

      // Mark migration as applied
      await pool.query(
        'INSERT INTO _migrations (name) VALUES ($1)',
        [file]
      );

      console.log(`✅ Applied migration: ${file}`);
      appliedCount++;
    }
    
    if (appliedCount === 0) {
      console.log('✅ Database is up to date (no new migrations)');
    } else {
      console.log(`✅ Successfully applied ${appliedCount} migration(s)`);
    }
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    await pool.end();
  }
}
