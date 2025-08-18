# Supabase Authentication Setup

This project has been configured with Supabase authentication. Follow these steps to complete the setup:

## 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration (already exists)
OPENAI_API_KEY=your_openai_api_key
```

## 2. Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to Settings > API in your Supabase dashboard
3. Copy the Project URL and anon/public key
4. Paste them in your `.env.local` file

## 3. Configure Authentication

In your Supabase dashboard:

1. Go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3000` for development)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

## 4. Enable Google OAuth (Optional)

1. Go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials (Client ID and Secret)

## 5. Database Setup

### Step 1: Run your existing schema
You already have the correct database schema. Make sure all your tables are created.

### Step 2: Create user signup trigger
**IMPORTANT**: Run this SQL in your Supabase SQL Editor to fix the 500 signup error:

```sql
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default user settings for new user
  INSERT INTO public.user_settings (user_id, tz, deliver_hour)
  VALUES (NEW.id, 'Asia/Kolkata', 8);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user settings on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_settings TO anon, authenticated;
GRANT ALL ON public.sources TO anon, authenticated;
GRANT ALL ON public.style_samples TO anon, authenticated;
GRANT ALL ON public.trend_items TO anon, authenticated;
GRANT ALL ON public.drafts TO anon, authenticated;
GRANT ALL ON public.feedback TO anon, authenticated;
```

### Step 3: Verify email settings (IMPORTANT)
In your Supabase dashboard:
1. Go to Authentication > Settings
2. **Disable** "Confirm email" if you want to test without email verification
3. Or set up proper email templates if you want email verification

## 6. Features Implemented

- ✅ Email/password authentication
- ✅ Google OAuth authentication
- ✅ Protected routes
- ✅ Authentication context
- ✅ Login form with Supabase integration
- ✅ Signup form with Supabase integration
- ✅ Auth callback handling
- ✅ Toast notifications for auth feedback

## 7. Database Trigger Setup

The database trigger automatically creates user data when a new user signs up. This eliminates the need for manual profile creation and prevents the "Error creating user profile: {}" issue.

**Important**: The complete SQL script in `supabase_complete_setup.sql` includes this trigger setup. The trigger will:

1. ✅ Automatically create `user_settings` with default timezone and delivery hour
2. ✅ Automatically create `user_profile` with the user's full name from signup
3. ✅ Automatically create `notification_preferences` with sensible defaults
4. ✅ Handle errors gracefully with detailed logging

**How it works**:
- When a user signs up, Supabase creates an entry in `auth.users`
- The trigger `on_auth_user_created` fires automatically
- The trigger function `handle_new_user()` creates all necessary profile data
- No manual intervention required - everything happens automatically

**Benefits**:
- 🚫 No more "Error creating user profile: {}" errors
- ✅ Consistent user data creation for all new users
- 🔒 RLS policies are satisfied automatically
- 📝 Detailed error logging if something goes wrong

## 8. Usage

The authentication system is now fully integrated:

- Users can sign up with email/password or Google
- Users can sign in with email/password or Google
- Protected routes automatically redirect to login
- Authentication state is managed globally
- Toast notifications provide user feedback
- **Automatic profile creation** via database trigger

## 9. Testing

1. **Setup Database**:
   - Run the complete SQL script from `supabase_complete_setup.sql` in Supabase SQL Editor
   - Verify all tables and triggers are created successfully

2. **Test Signup Process**:
   - Start your development server: `npm run dev`
   - Navigate to `/signup` to create an account
   - The database trigger should automatically create profile data
   - Check browser console for success messages

3. **Test Authentication**:
   - Navigate to `/login` to sign in
   - Try accessing `/dashboard` (should redirect to login if not authenticated)
   - Test Google OAuth if configured

4. **Debug if Needed**:
   - Run `testSignup()` in browser console to test database connection
   - Run `debugDatabase()` to check table existence and permissions

## 10. Troubleshooting

### **Common Issues**

1. **"Error creating user profile: {}"** ✅ **FIXED**
   - This error has been eliminated by using database triggers
   - The trigger automatically creates profile data when users sign up
   - No manual profile creation needed
   - If you still see this error, run the complete SQL script from `supabase_complete_setup.sql`

2. **"Table doesn't exist" errors**
   - Run the complete SQL script above
   - Check table names match exactly
   - Verify RLS policies are created

3. **RLS Policy errors**
   - Verify all policies are created
   - Check user authentication status
   - Ensure proper permissions are granted

4. **Data not loading**
   - Check browser console for errors
   - Verify user is authenticated
   - Check Supabase logs

5. **Updates not saving**
   - Verify RLS policies allow updates
   - Check user permissions
   - Verify table structure matches types

### **Debug Steps**

1. **Run the debug script** in your browser console:
   ```javascript
   // Copy and paste the contents of debug_database.js
   // Then run:
   debugDatabase()
   ```

2. **Check Supabase Dashboard**:
   - Go to Table Editor
   - Verify these tables exist:
     - `user_settings`
     - `user_profiles` 
     - `notification_preferences`

3. **Check RLS Policies**:
   - Go to Authentication → Policies
   - Verify policies exist for all tables

4. **Check Logs**:
   - Go to Logs → Database
   - Look for any error messages

### **Quick Fix Commands**

If you're still having issues, run these commands in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_settings', 'user_profiles', 'notification_preferences');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('user_settings', 'user_profiles', 'notification_preferences');
```
