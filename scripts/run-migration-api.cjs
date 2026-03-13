#!/usr/bin/env node

/**
 * Run migration using Supabase Management API
 */

require('dotenv').config();
const https = require('https');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Running migration via API...\n');

// The SQL to execute
const sql = `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
CREATE TRIGGER update_quick_notes_updated_at BEFORE UPDATE ON public.quick_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
CREATE TRIGGER update_vision_board_items_updated_at BEFORE UPDATE ON public.vision_board_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
CREATE TRIGGER update_research_items_updated_at BEFORE UPDATE ON public.research_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function runMigration() {
  try {
    // Use fetch to call PostgREST directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      console.log('\n📋 Please run the SQL manually in Supabase SQL Editor');
      console.log('👉 https://supabase.com/dashboard/project/cedxvrosmnsvfnnvkprr/sql');
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ Migration completed successfully!\n');
    console.log('Created tables:');
    console.log('  ✓ quick_notes');
    console.log('  ✓ vision_board_items');
    console.log('  ✓ research_items\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Manual option: Copy SIMPLE_MIGRATION.sql and paste into:');
    console.log('👉 https://supabase.com/dashboard/project/cedxvrosmnsvfnnvkprr/sql');
  }
}

runMigration();
