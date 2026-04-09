import { readFileSync } from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const { Pool } = pg;

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL_STATEFUL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const sql = readFileSync('./db/migrations/001_initial_schema.sql', 'utf-8');
    
    console.log('🚀 Running migration: 001_initial_schema.sql');
    await pool.query(sql);
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
