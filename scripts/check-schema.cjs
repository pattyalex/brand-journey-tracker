#!/usr/bin/env node

/**
 * Check database schema using information_schema
 */

const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const connectionString = `postgresql://postgres.cedxvrosmnsvfnnvkprr:${serviceRoleKey}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

async function checkSchema() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('🔍 Checking database schema...\n');

    // Check if tables exist
    const tableQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('quick_notes', 'vision_board_items', 'research_items')
      ORDER BY table_name;
    `;

    const { rows: tables } = await client.query(tableQuery);

    console.log('📋 Tables found:');
    tables.forEach(t => console.log(`   ✅ ${t.table_name}`));

    // Check columns for each table
    for (const table of tables) {
      console.log(`\n📝 Columns for ${table.table_name}:`);
      const columnQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = '${table.table_name}'
        ORDER BY ordinal_position;
      `;
      const { rows: columns } = await client.query(columnQuery);
      columns.forEach(c => {
        console.log(`      ${c.column_name} (${c.data_type})${c.is_nullable === 'YES' ? ' NULL' : ' NOT NULL'}`);
      });
    }

    // Check RLS policies
    console.log('\n🔒 RLS Policies:');
    const rlsQuery = `
      SELECT tablename, policyname
      FROM pg_policies
      WHERE tablename IN ('quick_notes', 'vision_board_items', 'research_items')
      ORDER BY tablename, policyname;
    `;
    const { rows: policies } = await client.query(rlsQuery);
    policies.forEach(p => console.log(`   ✅ ${p.tablename}: ${p.policyname}`));

    console.log('\n✅ Schema verification complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkSchema();
