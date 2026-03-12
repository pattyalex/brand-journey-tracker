# Supabase Migration Order

Run these migrations in Supabase SQL Editor **IN THIS EXACT ORDER**:

## Step 1: Run Migration 001 (Base Schema)
**File:** `supabase/migrations/001_initial_schema.sql`

This creates:
- Base tables (profiles, content_pillars, content_items, etc.)
- The `update_updated_at_column()` function
- RLS policies

**Copy the ENTIRE file contents and paste into Supabase SQL Editor, then click RUN**

---

## Step 2: Run Migration 002 (LocalStorage Tables)
**File:** `supabase/migrations/002_localstorage_migration.sql`

This creates:
- brand_deals
- user_strategy
- user_goals
- planner_items
- production_cards
- user_preferences
- collab_brands
- content_ideas

**Copy the ENTIRE file contents and paste into Supabase SQL Editor, then click RUN**

---

## Step 3: Run Migration 003 (New Features)
**File:** `supabase/migrations/003_add_missing_tables.sql`

This creates:
- quick_notes
- vision_board_items
- research_items
- Adds archive columns to production_cards

**Copy the ENTIRE file contents and paste into Supabase SQL Editor, then click RUN**

---

## ⚠️ IMPORTANT NOTES

1. **Run in order** - 001 → 002 → 003
2. **Wait for each to complete** before running the next
3. If you get errors, copy the error message and share it
4. After all migrations complete, your data will be ready to persist in Supabase!

---

## After Migrations Complete

Once all 3 migrations are done, we'll:
1. Update the hooks to use Supabase instead of Clerk
2. Create services for Quick Notes, Vision Board, and Research
3. Update the pages to save data to Supabase instead of localStorage
