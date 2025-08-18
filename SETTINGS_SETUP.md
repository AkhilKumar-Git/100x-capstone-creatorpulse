# Settings System Setup Guide

This guide explains how to set up the complete settings system that connects all `/settings` routes to Supabase tables.

## 🗄️ **Database Tables Required**

### **1. Run the Complete Database Setup**

Execute this SQL in your Supabase SQL Editor:

```sql
-- Create user_profiles table
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

-- Create notification_preferences table
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

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for notification_preferences
CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT ALL ON public.notification_preferences TO anon, authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- Update the existing user trigger to also create profiles and notification preferences
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default user settings for new user
  INSERT INTO public.user_settings (user_id, tz, deliver_hour)
  VALUES (NEW.id, 'Asia/Kolkata', 8);
  
  -- Insert default user profile
  INSERT INTO public.user_profiles (user_id, full_name, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'), 
          COALESCE(NEW.raw_user_meta_data->>'full_name', 'new_user'));
  
  -- Insert default notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🔧 **What's Been Implemented**

### **1. Settings Service (`src/lib/settings.ts`)**
- ✅ **UserSettings**: Timezone and delivery hour preferences
- ✅ **UserProfile**: Full name, username, location, website, bio, avatar
- ✅ **NotificationPreferences**: All notification toggles with database mapping
- ✅ **CRUD Operations**: Create, read, update for all settings
- ✅ **Automatic Initialization**: Creates default data on user signup

### **2. Updated Components**

#### **ProfileSection.tsx**
- ✅ **Real-time Loading**: Fetches user profile from Supabase on mount
- ✅ **Live Updates**: Saves changes directly to database
- ✅ **Error Handling**: Toast notifications for success/failure
- ✅ **Data Sync**: Form state always matches database

#### **NotificationsSection.tsx**
- ✅ **Real-time Loading**: Fetches notification preferences from Supabase
- ✅ **Instant Updates**: Individual toggles update database immediately
- ✅ **Bulk Save**: Save all preferences at once
- ✅ **Data Mapping**: Frontend keys properly mapped to database columns

### **3. Authentication Integration**
- ✅ **User Context**: All settings tied to authenticated user
- ✅ **Automatic Setup**: New users get default settings on signup
- ✅ **Protected Routes**: Settings only accessible to authenticated users

## 🚀 **How It Works**

### **1. User Signup Flow**
```
User Signs Up → AuthContext → SettingsService.initializeUserData() → Creates:
├── user_settings (timezone, delivery hour)
├── user_profiles (name, username, etc.)
└── notification_preferences (all toggles)
```

### **2. Settings Loading Flow**
```
Component Mount → useSettings() → Supabase Query → Update Local State → Render Form
```

### **3. Settings Update Flow**
```
User Changes → handleInputChange() → Local State Update → Supabase Update → Success/Error Toast
```

## 📊 **Database Schema Overview**

```
auth.users (Supabase Auth)
├── user_settings (timezone, delivery preferences)
├── user_profiles (personal information)
├── notification_preferences (all notification toggles)
├── sources (content sources)
├── style_samples (AI training data)
├── trend_items (trending content)
├── drafts (AI-generated content)
└── feedback (user feedback on drafts)
```

## 🧪 **Testing the System**

### **1. Test User Signup**
- Sign up a new user
- Verify all tables are created automatically
- Check default values are set correctly

### **2. Test Profile Updates**
- Go to `/settings` → Profile
- Change any field and save
- Verify changes persist in database
- Check toast notifications work

### **3. Test Notification Preferences**
- Go to `/settings` → Notifications
- Toggle individual switches
- Verify changes save immediately
- Test bulk save functionality

### **4. Test Data Persistence**
- Log out and log back in
- Verify all settings are restored
- Check data consistency across sessions

## 🔍 **Troubleshooting**

### **Common Issues**

1. **"Table doesn't exist" errors**
   - Run the complete SQL script above
   - Check table names match exactly

2. **RLS Policy errors**
   - Verify all policies are created
   - Check user authentication status

3. **Data not loading**
   - Check browser console for errors
   - Verify user is authenticated
   - Check Supabase logs

4. **Updates not saving**
   - Verify RLS policies allow updates
   - Check user permissions
   - Verify table structure matches types

### **Debug Commands**

```javascript
// In browser console
import { supabase } from './src/lib/supabase.ts';

// Test connection
supabase.auth.getSession().then(console.log);

// Test settings query
supabase.from('user_settings').select('*').then(console.log);
```

## ✅ **What's Now Working**

- 🔐 **Complete Authentication Flow**: Signup → Auto-initialization → Settings access
- 📝 **Real-time Profile Management**: Load, edit, save profile information
- 🔔 **Live Notification Preferences**: Toggle switches with instant database updates
- 🗄️ **Full Data Persistence**: All changes saved to Supabase
- 🔄 **Automatic Sync**: UI always reflects current database state
- 🛡️ **Security**: RLS policies ensure users only access their own data

The settings system is now fully connected to Supabase with real-time read/write operations, automatic user initialization, and comprehensive error handling!
