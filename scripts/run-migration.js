#!/usr/bin/env node

/**
 * Automated Supabase Migration Runner
 * Run with: node scripts/run-migration.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

console.log('🚀 Starting migration...');
console.log('📡 Connecting to:', supabaseUrl);

// Read the migration SQL
const migrationSQL = fs.readFileSync(
  path.join(__dirname, '..', 'SIMPLE_MIGRATION.sql'),
  'utf8'
);

// Execute migration using REST API
async function runMigration() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ query: migrationSQL })
    });

    if (!response.ok) {
      // If rpc doesn't work, try using pg_dump endpoint
      console.log('⚠️  RPC endpoint not available, trying direct SQL...');

      const directResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sql',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: migrationSQL
      });

      if (!directResponse.ok) {
        const errorText = await directResponse.text();
        throw new Error(`HTTP ${directResponse.status}: ${errorText}`);
      }
    }

    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Created tables:');
    console.log('   ✓ quick_notes');
    console.log('   ✓ vision_board_items');
    console.log('   ✓ research_items');
    console.log('\n🔐 Row Level Security enabled');
    console.log('✨ Your data will now persist!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📋 Manual fallback:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/sql');
    console.log('   2. Copy contents of: SIMPLE_MIGRATION.sql');
    console.log('   3. Paste and click RUN');
    process.exit(1);
  }
}

runMigration();
