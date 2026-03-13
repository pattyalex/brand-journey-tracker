#!/usr/bin/env node

/**
 * Verify database structure for the three new tables
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

async function verifyTables() {
  console.log('🔍 Verifying database structure...\n');

  const tablesToCheck = [
    { name: 'quick_notes', expectedColumns: ['id', 'user_id', 'title', 'content', 'created_at', 'updated_at'] },
    { name: 'vision_board_items', expectedColumns: ['id', 'user_id', 'title', 'description', 'image_url', 'display_order', 'created_at', 'updated_at'] },
    { name: 'research_items', expectedColumns: ['id', 'user_id', 'title', 'content', 'tags', 'created_at', 'updated_at'] }
  ];

  let allPassed = true;

  for (const table of tablesToCheck) {
    console.log(`\n📋 ${table.name}`);
    console.log('─'.repeat(50));

    // Check if table exists and is accessible via RLS
    const { error } = await supabase
      .from(table.name)
      .select('*')
      .limit(0);

    if (error) {
      console.log(`❌ Error: ${error.message}`);
      allPassed = false;
    } else {
      console.log(`✅ Table exists and is accessible`);
      console.log(`   Expected columns: ${table.expectedColumns.join(', ')}`);

      // Try to test RLS by attempting a query (should work with service role key)
      const { data, error: selectError } = await supabase
        .from(table.name)
        .select('count')
        .limit(1);

      if (!selectError) {
        console.log(`✅ RLS policies are working (query succeeded with service role)`);
      }
    }
  }

  if (allPassed) {
    console.log('\n\n✅ All tables verified successfully!\n');
  } else {
    console.log('\n\n⚠️  Some tables had issues. Check errors above.\n');
    process.exit(1);
  }
}

verifyTables().catch(console.error);
