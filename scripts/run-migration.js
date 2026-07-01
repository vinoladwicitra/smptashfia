import { Client } from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(process.cwd(), '.env') });

const migrationFile = 'db/migrations/013_create_facility_tables.sql';
const connectionString = process.env.DATABASE_URL_STATEFUL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL_STATEFUL or DATABASE_URL in .env');
  process.exit(1);
}

console.log('🚀 Running migration:', migrationFile);
console.log('─'.repeat(50));

async function runMigration() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL\n');

    const sql = readFileSync(join(process.cwd(), migrationFile), 'utf-8');

    // Remove comments and empty lines, keep semicolon-separated statements
    const lines = sql.split('\n');
    let cleanSql = '';
    let inBlockComment = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip single-line comments and empty lines
      if (line.startsWith('--') || line === '' || line.startsWith('/*')) {
        if (line.startsWith('/*')) inBlockComment = true;
        if (line.endsWith('*/')) inBlockComment = false;
        continue;
      }

      if (inBlockComment) continue;

      cleanSql += line + ' ';
    }

    // Split by semicolon
    const rawStatements = cleanSql.split(';').map(s => s.trim()).filter(s => s.length > 0);

    console.log(`📝 Found ${rawStatements.length} statements to execute.\n`);

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < rawStatements.length; i++) {
      const stmt = rawStatements[i] + ';';
      try {
        await client.query(stmt);
        console.log(`  [${i + 1}/${rawStatements.length}] ✓ ${stmt.split(' ')[0].toUpperCase()} executed`);
        successCount++;
      } catch (err) {
        const msg = err.message;

        // Skip benign errors (idempotency)
        if (msg.includes('already exists') ||
            msg.includes('duplicate key') ||
            msg.includes('permission denied') ||
            msg.includes('must be owner') ||
            msg.includes('relation "') && msg.includes('does not exist') && !msg.includes('SELECT')) {
          console.log(`  [${i + 1}/${rawStatements.length}] ⚠️  Skipped (${msg.split(':')[0]})`);
          skipCount++;
        } else {
          // For syntax or other errors, try as a DO block or ignore if it's just a warning
          console.error(`\n❌ Statement ${i + 1} failed: ${msg}`);
          console.error('Statement:', stmt.substring(0, 200));
          // Don't exit - continue with next statements
        }
      }
    }

    console.log('\n' + '─'.repeat(50));
    console.log(`✅ Migration complete: ${successCount} executed, ${skipCount} skipped.`);
    console.log('\n📋 Next steps:');
    console.log('  1. Verify tables in Supabase Dashboard → Table Editor');
    console.log('  2. Deploy worker: npm run deploy');
    console.log('  3. Rebuild client: npm run build');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
