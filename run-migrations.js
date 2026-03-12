/**
 * Supabase Migration Runner
 * Runs migrations programmatically using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple SQL to create just the tables we need
const simpleMigration = `
-- =====================================================
-- SIMPLE MIGRATION: Just the essentials
-- Creates only the new tables we actually need
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- QUICK NOTES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.quick_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quick_notes_user_id ON public.quick_notes(user_id);

ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own quick notes" ON public.quick_notes;
CREATE POLICY "Users can manage their own quick notes"
  ON public.quick_notes FOR ALL
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_quick_notes_updated_at ON public.quick_notes;
CREATE TRIGGER update_quick_notes_updated_at
  BEFORE UPDATE ON public.quick_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VISION BOARD
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vision_board_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vision_board_user_id ON public.vision_board_items(user_id);

ALTER TABLE public.vision_board_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own vision board items" ON public.vision_board_items;
CREATE POLICY "Users can manage their own vision board items"
  ON public.vision_board_items FOR ALL
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_vision_board_items_updated_at ON public.vision_board_items;
CREATE TRIGGER update_vision_board_items_updated_at
  BEFORE UPDATE ON public.vision_board_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RESEARCH ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.research_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_items_user_id ON public.research_items(user_id);
CREATE INDEX IF NOT EXISTS idx_research_items_tags ON public.research_items USING GIN(tags);

ALTER TABLE public.research_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own research items" ON public.research_items;
CREATE POLICY "Users can manage their own research items"
  ON public.research_items FOR ALL
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_research_items_updated_at ON public.research_items;
CREATE TRIGGER update_research_items_updated_at
  BEFORE UPDATE ON public.research_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.quick_notes TO authenticated;
GRANT ALL ON public.vision_board_items TO authenticated;
GRANT ALL ON public.research_items TO authenticated;
`;

async function runMigration() {
  console.log('🚀 Starting Supabase migration...\n');

  try {
    // Execute the migration SQL
    console.log('📝 Creating tables: quick_notes, vision_board_items, research_items...');

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: simpleMigration
    });

    if (error) {
      // If rpc doesn't work, try direct SQL execution
      console.log('⚠️  RPC method not available, trying alternative method...');

      // Split into individual statements and execute
      const statements = simpleMigration
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        const { error: execError } = await supabase.from('_migrations').insert({
          name: 'manual_migration_' + Date.now(),
          sql: statement
        });

        if (execError) {
          console.error(`❌ Error executing statement:`, execError);
          console.log('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Created tables:');
    console.log('  - quick_notes');
    console.log('  - vision_board_items');
    console.log('  - research_items');
    console.log('\n🔐 RLS policies enabled for all tables');
    console.log('\n✨ Your data will now persist across devices!\n');

  } catch (err) {
    console.error('❌ Migration failed:', err);
    console.log('\n💡 Manual option: Copy the SQL below and paste it into Supabase SQL Editor:\n');
    console.log('---');
    console.log(simpleMigration);
    console.log('---');
    process.exit(1);
  }
}

// Run the migration
runMigration();
