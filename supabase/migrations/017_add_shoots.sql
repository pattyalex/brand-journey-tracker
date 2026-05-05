-- Create shoots table
CREATE TABLE IF NOT EXISTS shoots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Planned'
    CHECK (status IN ('Planned', 'In Progress', 'Complete', 'Archived')),
  locations JSONB NOT NULL DEFAULT '[]'::jsonb,
  start_location TEXT,
  end_location TEXT,
  outfits TEXT[] NOT NULL DEFAULT '{}',
  gear TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT NOT NULL DEFAULT '',
  optimized_route_order TEXT[] NOT NULL DEFAULT '{}',
  ai_plan JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add shoot_id column to content_items (maps to Posts)
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS shoot_id UUID REFERENCES shoots(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE shoots ENABLE ROW LEVEL SECURITY;

-- RLS policies for shoots
CREATE POLICY "Users can view own shoots"
  ON shoots FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shoots"
  ON shoots FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shoots"
  ON shoots FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shoots"
  ON shoots FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shoots_user_id ON shoots(user_id);
CREATE INDEX IF NOT EXISTS idx_shoots_date ON shoots(date);
CREATE INDEX IF NOT EXISTS idx_content_items_shoot_id ON content_items(shoot_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_shoots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shoots_updated_at
  BEFORE UPDATE ON shoots
  FOR EACH ROW
  EXECUTE FUNCTION update_shoots_updated_at();
