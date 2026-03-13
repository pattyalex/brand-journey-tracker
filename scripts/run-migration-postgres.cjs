#!/usr/bin/env node

/**
 * Run migration using direct PostgreSQL connection
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Use service role key as password for connection pooler
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const connectionString = `postgresql://postgres.cedxvrosmnsvfnnvkprr:${serviceRoleKey}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

// Read the migration SQL
const sql = fs.readFileSync(
  path.join(__dirname, '..', 'SIMPLE_MIGRATION.sql'),
  'utf8'
);

async function runMigration() {
  const client = new Client({ connectionString });

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!\n');

    console.log('📝 Executing migration SQL...\n');
    await client.query(sql);

    console.log('✅ SUCCESS! Migration completed\n');
    console.log('Created tables:');
    console.log('  ✓ quick_notes');
    console.log('  ✓ vision_board_items');
    console.log('  ✓ research_items\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 You need the database password from:');
    console.log('   Supabase → Settings → Database → Connection string');
  } finally {
    await client.end();
  }
}

runMigration();
