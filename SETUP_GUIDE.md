# Brand Journey Tracker - Setup Complete!

## ✅ What's Been Done

### 1. Environment Configuration
- ✅ Created `.env` file with your new Supabase credentials
- ✅ Added `.env` to `.gitignore` to protect your secrets
- ✅ Removed all hardcoded credentials from source code

### 2. Code Cleanup
- ✅ Consolidated duplicate Supabase client files
- ✅ Updated all imports to use `@/lib/supabase`
- ✅ Configured server to use environment variables for Stripe

### 3. Database Schema
- ✅ Designed complete database schema
- ✅ Created migration file at `supabase/migrations/001_initial_schema.sql`

## 🚀 Next Steps

### Step 1: Run the Database Migration

You need to apply the database schema to your Supabase instance:

**Option A: Using Supabase Dashboard (Easiest)**
1. Go to your Supabase project: https://supabase.com/dashboard/project/cedxvrosmnsvfnnvkprr
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
5. Click **Run** (or press Cmd+Enter)
6. Wait for "Success. No rows returned" message

**Option B: Using Supabase CLI**
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref cedxvrosmnsvfnnvkprr

# Run migrations
supabase db push
```

### Step 2: Configure Stripe (Optional - for payments)

If you want to enable payment features:

1. Get your Stripe keys from: https://dashboard.stripe.com/apikeys
2. Update `.env` file with:
   ```
   STRIPE_SECRET_KEY=sk_test_your_actual_key_here
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   ```
3. Restart the dev server

### Step 3: Test the Application

Your dev server should already be running. If not:

```bash
npm run dev
```

Then visit http://localhost:5000

### Step 4: Test Database Connection

Once the app loads:
1. Click the "Test DB" button on the landing page
2. Check the browser console for connection status
3. Try creating an account

## 📊 Database Tables Created

Your new database includes:

- **profiles** - User profiles with trial/subscription info
- **content_pillars** - Content themes/categories
- **content_items** - Main content management (ideas, drafts, published)
- **calendar_events** - Scheduling and calendar
- **collaborations** - Brand partnerships tracking
- **tasks** - Task management
- **notes** - Quick notes and brain dumps
- **analytics** - Performance metrics
- **social_accounts** - Connected social media accounts
- **settings** - User preferences and API keys

All tables have:
- ✅ Row Level Security (RLS) enabled
- ✅ User-specific access policies
- ✅ Automatic timestamps
- ✅ Proper foreign key relationships

## 🔒 Security Notes

- Your Supabase credentials are now in `.env` (not committed to Git)
- All old hardcoded credentials have been removed
- **IMPORTANT:** Your old Supabase keys were exposed in GitHub history
  - Consider rotating them if this was a production app
  - For this project, the new keys are safe since we just created them

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists in the project root
- Restart your dev server after creating/modifying `.env`

### Database connection errors
- Verify you ran the migration SQL in Supabase dashboard
- Check that your Supabase project is active (not paused)
- Verify the credentials in `.env` match your Supabase dashboard

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and run `npm install` again if issues persist

## 📝 What Changed from localStorage

Before: Everything was stored in browser localStorage (not persistent, no sync)
Now: Data will be stored in Supabase PostgreSQL database (persistent, synced, secure)

You'll need to migrate the existing hooks and components to use Supabase instead of localStorage. This will be the next phase of work.

## 🎯 Recommended Next Steps

1. **Run the migration** (most important!)
2. **Test authentication** - Try signing up with a real email
3. **Start migrating localStorage** - Begin with one feature at a time:
   - Content items
   - Tasks
   - Notes
   - Calendar events

Need help with any of these steps? Just ask!
