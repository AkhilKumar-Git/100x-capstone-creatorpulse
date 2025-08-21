-- Complete Supabase Setup for CreatorPulse
-- Run this entire script in your Supabase SQL Editor

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  location TEXT DEFAULT '',
  website TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTamptz DEFAULT NOW(),
  updated_at TIMESTamptz DEFAULT NOW()
);

-- 2. Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Product Updates
  product_updates BOOLEAN DEFAULT true,
  new_features BOOLEAN DEFAULT true,
  platform_announcements BOOLEAN DEFAULT false,
  
  -- Weekly Reports
  weekly_reports BOOLEAN DEFAULT true,
  performance_summary BOOLEAN DEFAULT true,
  trending_topics BOOLEAN DEFAULT false,
  
  -- Account Alerts
  security_alerts BOOLEAN DEFAULT true,
  billing_notifications BOOLEAN DEFAULT true,
  payment_failures BOOLEAN DEFAULT true,
  
  -- AI & Content
  ai_drafts_ready BOOLEAN DEFAULT true,
  content_analysis BOOLEAN DEFAULT false,
  style_profile_updates BOOLEAN DEFAULT true,
  
  -- Email Preferences
  email_digest BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  
  -- Push Notifications
  push_notifications BOOLEAN DEFAULT true,
  browser_notifications BOOLEAN DEFAULT false,
  
  created_at TIMESTamptz DEFAULT NOW(),
  updated_at TIMESTamptz DEFAULT NOW()
);

-- 3. Enable Row Level Security on all tables
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Create RLS policies for notification_preferences
CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_settings TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT ALL ON public.notification_preferences TO anon, authenticated;
GRANT ALL ON public.sources TO anon, authenticated;
GRANT ALL ON public.style_samples TO anon, authenticated;
GRANT ALL ON public.trend_items TO anon, authenticated;
GRANT ALL ON public.drafts TO anon, authenticated;
GRANT ALL ON public.feedback TO anon, authenticated;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- 8. Create or replace the user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
  user_username TEXT;
BEGIN
  -- Get the full name from user metadata or use a default
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User');
  
  -- Generate a unique username
  user_username := LOWER(REPLACE(user_full_name, ' ', '_'));
  
  -- Insert default user settings for new user
  BEGIN
    INSERT INTO public.user_settings (user_id, tz, deliver_hour)
    VALUES (NEW.id, 'Asia/Kolkata', 8);
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating user settings for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Insert default user profile
  BEGIN
    INSERT INTO public.user_profiles (user_id, full_name, username, location, website, bio, avatar_url)
    VALUES (NEW.id, user_full_name, user_username, '', '', '', '');
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating user profile for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Insert default notification preferences
  BEGIN
    INSERT INTO public.notification_preferences (
      user_id, product_updates, new_features, platform_announcements,
      weekly_reports, performance_summary, trending_topics,
      security_alerts, billing_notifications, payment_failures,
      ai_drafts_ready, content_analysis, style_profile_updates,
      email_digest, marketing_emails, push_notifications, browser_notifications
    ) VALUES (
      NEW.id, true, true, false, true, true, false,
      true, true, true, true, false, true, true, false, true, false
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating notification preferences for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Verify the setup
SELECT 'Setup complete! The following tables exist:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_settings', 'user_profiles', 'notification_preferences', 'sources', 'style_samples', 'trend_items', 'drafts', 'feedback');
