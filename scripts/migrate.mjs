import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_HOST = 'aws-0-ap-southeast-2.pooler.supabase.com';
const DB_USER = 'postgres.zhmmwztavxglltomkgdy';
const DB_PASS = '*J@9wvK/36^HAEt';
const DB_NAME = 'postgres';
const DB_PORT = 6543;

async function runMigration() {
  console.log('[Migration] Connecting to Supabase PostgreSQL...');

  // Try direct host first, or pooler if direct IPv6 fails
  let client;
  try {
    client = new Client({
      host: DIRECT_HOST,
      port: 5432,
      user: 'postgres',
      password: DB_PASS,
      database: DB_NAME,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    console.log('[Migration] Connected to direct Supabase PostgreSQL host.');
  } catch (errDirect) {
    console.log('[Migration] Direct connection failed, trying Supabase transaction pooler...', errDirect.message);
    client = new Client({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    console.log('[Migration] Connected to Supabase Pooler.');
  }

  try {
    // 1. Read and apply schema DDL
    const schemaSqlPath = path.join(__dirname, '../supabase/migrations/20260827_initial_schema.sql');
    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
    console.log('[Migration] Executing initial_schema.sql...');
    await client.query(schemaSql);
    console.log('[Migration] ✓ Successfully created all database tables and indexes!');

    // 2. Read and apply seed data
    const seedSqlPath = path.join(__dirname, '../supabase/seed.sql');
    const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
    console.log('[Migration] Executing seed.sql...');
    await client.query(seedSql);
    console.log('[Migration] ✓ Successfully populated seed data!');

    // 3. Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n[Migration Summary] Active tables in public schema:');
    res.rows.forEach(r => console.log(' • ' + r.table_name));

  } catch (err) {
    console.error('[Migration Error]', err);
  } finally {
    await client.end();
  }
}

runMigration();
