import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

async function runMigration() {
  if (!dbUrl) {
    console.log('No DATABASE_URL found in environment.');
    console.log('Please paste the migration SQL into your Supabase Dashboard SQL Editor at:');
    console.log('https://supabase.com/dashboard/project/bjejovuayqtxqhevvvuu/sql/new');
    return;
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('[MIGRATE] Connected to Supabase PostgreSQL database successfully.');

    const sqlPath = path.join(process.cwd(), 'supabase/migrations/01_create_tracked_profiles.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('[MIGRATE] Executing schema migration and seeding 6 peer members...');
    await client.query(sql);
    console.log('[MIGRATE] Successfully created public.tracked_profiles table and seeded records!');

    const res = await client.query('SELECT username, name, total_solved, total_stars, total_points, last_sync_status FROM public.tracked_profiles ORDER BY total_solved DESC;');
    console.log('\n[MIGRATE] Verified live table contents:');
    res.rows.forEach(r => {
      console.log(`  - @${r.username.padEnd(16)} | Solved: ${String(r.total_solved).padEnd(4)} | Stars: ${String(r.total_stars).padEnd(3)} | Points: ${String(r.total_points).padEnd(6)} | Status: ${r.last_sync_status}`);
    });

    await client.end();
  } catch (err) {
    console.error('[MIGRATE] Error running migration:', err.message);
  }
}

runMigration();
