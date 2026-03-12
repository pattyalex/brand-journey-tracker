#!/usr/bin/env node

/**
 * Direct Supabase Migration Runner
 * Uses Supabase JS client to execute SQL
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('🚀 Supabase Migration Runner\n');
console.log('📡 URL:', supabaseUrl);
console.log('🔑 Using:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role Key' : 'Anon Key');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Migration SQL
const migrationSQL = `
-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Quick Notes
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
CREATE POLICY "Users can manage their own quick notes" ON public.quick_notes FOR ALL USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_quick_notes_updated_at ON public.quick_notes;
CREATE TRIGGER update_quick_notes_updated_at BEFORE UPDATE ON public.quick_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vision Board
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
CREATE POLICY "Users can manage their own vision board items" ON public.vision_board_items FOR ALL USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_vision_board_items_updated_at ON public.vision_board_items;
CREATE TRIGGER update_vision_board_items_updated_at BEFORE UPDATE ON public.vision_board_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Research Items
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
ALTER TABLE public.research_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own research items" ON public.research_items;
CREATE POLICY "Users can manage their own research items" ON public.research_items FOR ALL USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_research_items_updated_at ON public.research_items;
CREATE TRIGGER update_research_items_updated_at BEFORE UPDATE ON public.research_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function runMigration() {
  try {
    console.log('\n📝 Executing migration SQL...\n');

    // Try using rpc
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('❌ Error:', error.message);
      console.log('\n💡 The anon key cannot run DDL commands.');
      console.log('   You need the SERVICE ROLE key from Supabase Dashboard.');
      console.log('\n📍 Get it here:');
      console.log('   Supabase → Settings → API → service_role (secret)');
      console.log('\n📝 Then add to .env:');
      console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_key_here');
      process.exit(1);
    }

    console.log('✅ SUCCESS! Migration completed\n');
    console.log('Created tables:');
    console.log('  ✓ quick_notes');
    console.log('  ✓ vision_board_items');
    console.log('  ✓ research_items\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n📋 Manual option: Run SIMPLE_MIGRATION.sql in Supabase SQL Editor');
  }
}

runMigration();
