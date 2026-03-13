-- Create user_onboarding_responses table to store answers from onboarding questionnaire
CREATE TABLE IF NOT EXISTS user_onboarding_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Question 1: How often would you like to post?
  post_frequency TEXT,

  -- Question 2: How do you come up with content ideas?
  ideation_method TEXT,

  -- Question 3: Got any help with your content?
  team_structure TEXT,

  -- Question 4: What's your biggest dream as a creator?
  creator_dream TEXT,

  -- Question 5: What platforms do you post on? (multiple select)
  platforms TEXT[],

  -- Question 6: Where do you feel most stuck? (multiple select)
  stuck_areas TEXT[],
  other_stuck_area TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_user_onboarding_responses_user_id
ON user_onboarding_responses(user_id);

-- Create index for created_at for analytics queries
CREATE INDEX IF NOT EXISTS idx_user_onboarding_responses_created_at
ON user_onboarding_responses(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own responses
CREATE POLICY "Users can view own onboarding responses"
ON user_onboarding_responses
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own responses
CREATE POLICY "Users can insert own onboarding responses"
ON user_onboarding_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own responses
CREATE POLICY "Users can update own onboarding responses"
ON user_onboarding_responses
FOR UPDATE
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_onboarding_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_onboarding_responses_updated_at
BEFORE UPDATE ON user_onboarding_responses
FOR EACH ROW
EXECUTE FUNCTION update_user_onboarding_responses_updated_at();

-- Create a view for analytics (aggregate data, no personal info)
CREATE OR REPLACE VIEW onboarding_analytics AS
SELECT
  COUNT(*) as total_responses,

  -- Post frequency distribution
  COUNT(*) FILTER (WHERE post_frequency = 'several_times_a_day') as post_freq_several_times_day,
  COUNT(*) FILTER (WHERE post_frequency = 'daily') as post_freq_daily,
  COUNT(*) FILTER (WHERE post_frequency = 'few_times_a_week') as post_freq_few_times_week,
  COUNT(*) FILTER (WHERE post_frequency = 'occasionally') as post_freq_occasionally,

  -- Ideation method distribution
  COUNT(*) FILTER (WHERE ideation_method = 'plan_ahead') as ideation_plan_ahead,
  COUNT(*) FILTER (WHERE ideation_method = 'wing_it') as ideation_wing_it,
  COUNT(*) FILTER (WHERE ideation_method = 'follow_trends') as ideation_follow_trends,
  COUNT(*) FILTER (WHERE ideation_method = 'struggle') as ideation_struggle,

  -- Team structure distribution
  COUNT(*) FILTER (WHERE team_structure = 'solo') as team_solo,
  COUNT(*) FILTER (WHERE team_structure = 'solo_wants_help') as team_solo_wants_help,
  COUNT(*) FILTER (WHERE team_structure = 'has_assistant') as team_has_assistant,
  COUNT(*) FILTER (WHERE team_structure = 'team_agency') as team_agency,

  -- Creator dream distribution
  COUNT(*) FILTER (WHERE creator_dream = 'quit_job') as dream_quit_job,
  COUNT(*) FILTER (WHERE creator_dream = 'grow_followers') as dream_grow_followers,
  COUNT(*) FILTER (WHERE creator_dream = 'build_brand') as dream_build_brand,
  COUNT(*) FILTER (WHERE creator_dream = 'launch_products') as dream_launch_products,
  COUNT(*) FILTER (WHERE creator_dream = 'inspire_others') as dream_inspire_others,

  -- Platform usage (counting array contains)
  COUNT(*) FILTER (WHERE 'instagram' = ANY(platforms)) as platform_instagram,
  COUNT(*) FILTER (WHERE 'tiktok' = ANY(platforms)) as platform_tiktok,
  COUNT(*) FILTER (WHERE 'youtube' = ANY(platforms)) as platform_youtube,
  COUNT(*) FILTER (WHERE 'linkedin' = ANY(platforms)) as platform_linkedin,
  COUNT(*) FILTER (WHERE 'twitter' = ANY(platforms)) as platform_twitter,

  -- Stuck areas (counting array contains)
  COUNT(*) FILTER (WHERE 'consistency' = ANY(stuck_areas)) as stuck_consistency,
  COUNT(*) FILTER (WHERE 'overwhelmed' = ANY(stuck_areas)) as stuck_overwhelmed,
  COUNT(*) FILTER (WHERE 'ideas' = ANY(stuck_areas)) as stuck_ideas,
  COUNT(*) FILTER (WHERE 'partnerships' = ANY(stuck_areas)) as stuck_partnerships,
  COUNT(*) FILTER (WHERE 'analytics' = ANY(stuck_areas)) as stuck_analytics,
  COUNT(*) FILTER (WHERE 'organization' = ANY(stuck_areas)) as stuck_organization,
  COUNT(*) FILTER (WHERE 'other' = ANY(stuck_areas)) as stuck_other

FROM user_onboarding_responses;

-- Grant access to the view
GRANT SELECT ON onboarding_analytics TO authenticated;

COMMENT ON TABLE user_onboarding_responses IS 'Stores user responses from the onboarding questionnaire for marketing research and product insights';
COMMENT ON VIEW onboarding_analytics IS 'Aggregate analytics view of onboarding responses - no personal data, just counts for each answer option';
