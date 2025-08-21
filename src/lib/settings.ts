import { sbClient } from './supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Types for user settings
export interface UserSettings {
  user_id: string;
  tz: string;
  deliver_hour: number;
  created_at: string;
}

// Types for user profile
export interface UserProfile {
  user_id: string;
  full_name: string;
  username: string;
  location: string;
  website: string;
  bio: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

// Types for notification preferences
export interface NotificationPreferences {
  user_id: string;
  // Product Updates
  product_updates: boolean;
  new_features: boolean;
  platform_announcements: boolean;
  
  // Weekly Reports
  weekly_reports: boolean;
  performance_summary: boolean;
  trending_topics: boolean;
  
  // Account Alerts
  security_alerts: boolean;
  billing_notifications: boolean;
  payment_failures: boolean;
  
  // AI & Content
  ai_drafts_ready: boolean;
  content_analysis: boolean;
  style_profile_updates: boolean;
  
  // Email Preferences
  email_digest: boolean;
  marketing_emails: boolean;
  
  // Push Notifications
  push_notifications: boolean;
  browser_notifications: boolean;
  
  created_at: string;
  updated_at: string;
}

// Settings Service Class
export class SettingsService {
  // User Settings
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    const supabase = sbClient();
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
    
    return data;
  }

  static async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<boolean> {
    const supabase = sbClient();
    const { error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating user settings:', error);
      return false;
    }
    
    return true;
  }

  // User Profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = sbClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  }

  static async createUserProfile(profile: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      console.log('Creating user profile with data:', profile);
      
      const supabase = sbClient();
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          ...profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (error) {
        console.error('Error creating user profile:', error);
        console.error('Profile data attempted:', profile);
        return false;
      }
      
      console.log('User profile created successfully');
      return true;
    } catch (err) {
      console.error('Exception creating user profile:', err);
      console.error('Profile data attempted:', profile);
      return false;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    const supabase = sbClient();
    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
    
    return true;
  }

  // Notification Preferences
  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    const supabase = sbClient();
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
    
    return data;
  }

  static async createNotificationPreferences(preferences: Omit<NotificationPreferences, 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const supabase = sbClient();
      const { error } = await supabase
        .from('notification_preferences')
        .insert({
          ...preferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (error) {
        console.error('Error creating notification preferences:', error);
        console.error('Preferences data attempted:', preferences);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Exception creating notification preferences:', err);
      console.error('Preferences data attempted:', preferences);
      return false;
    }
  }

  static async updateNotificationPreferences(userId: string, updates: Partial<NotificationPreferences>): Promise<boolean> {
    const supabase = sbClient();
    const { error } = await supabase
      .from('notification_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
    
    return true;
  }

  // Check if required tables exist
  static async checkTablesExist(): Promise<{ user_profiles: boolean; notification_preferences: boolean }> {
    try {
      const supabase = sbClient();
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .limit(1);
      
      const { data: notifData, error: notifError } = await supabase
        .from('notification_preferences')
        .select('user_id')
        .limit(1);
      
      return {
        user_profiles: !profilesError,
        notification_preferences: !notifError
      };
    } catch (error) {
      console.error('Error checking tables:', error);
      return {
        user_profiles: false,
        notification_preferences: false
      };
    }
  }

  // Initialize user data (called after signup)
  static async initializeUserData(userId: string, fullName: string): Promise<boolean> {
    try {
      console.log('🚀 Starting user data initialization...');
      console.log('User ID:', userId);
      console.log('Full Name:', fullName);
      
      // First check if tables exist
      const tablesExist = await this.checkTablesExist();
      console.log('Tables exist check:', tablesExist);
      
      if (!tablesExist.user_profiles || !tablesExist.notification_preferences) {
        console.error('Required tables do not exist:', tablesExist);
        return false;
      }

      // Prepare profile data
      const profileData = {
        user_id: userId,
        full_name: fullName,
        username: fullName.toLowerCase().replace(/\s+/g, '_'),
        location: '',
        website: '',
        bio: '',
        avatar_url: '',
      };
      
      console.log('Profile data to create:', profileData);

      // Create user profile
      const profileCreated = await this.createUserProfile(profileData);

      if (!profileCreated) {
        console.error('Failed to create user profile');
        return false;
      }

      // Prepare notification preferences data
      const prefsData = {
        user_id: userId,
        product_updates: true,
        new_features: true,
        platform_announcements: false,
        weekly_reports: true,
        performance_summary: true,
        trending_topics: false,
        security_alerts: true,
        billing_notifications: true,
        payment_failures: true,
        ai_drafts_ready: true,
        content_analysis: false,
        style_profile_updates: true,
        email_digest: true,
        marketing_emails: false,
        push_notifications: true,
        browser_notifications: false,
      };
      
      console.log('Notification preferences data to create:', prefsData);

      // Create default notification preferences
      const prefsCreated = await this.createNotificationPreferences(prefsData);

      if (!prefsCreated) {
        console.error('Failed to create notification preferences');
        return false;
      }

      console.log('✅ User data initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing user data:', error);
      return false;
    }
  }
}

// React Hook for using settings
export const useSettings = () => {
  const { user } = useAuth();

  const getUserSettings = async () => {
    if (!user) return null;
    return await SettingsService.getUserSettings(user.id);
  };

  const updateUserSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return false;
    return await SettingsService.updateUserSettings(user.id, updates);
  };

  const getUserProfile = async () => {
    if (!user) return null;
    return await SettingsService.getUserProfile(user.id);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return false;
    return await SettingsService.updateUserProfile(user.id, updates);
  };

  const getNotificationPreferences = async () => {
    if (!user) return null;
    return await SettingsService.getNotificationPreferences(user.id);
  };

  const updateNotificationPreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user) return false;
    return await SettingsService.updateNotificationPreferences(user.id, updates);
  };

  return {
    getUserSettings,
    updateUserSettings,
    getUserProfile,
    updateUserProfile,
    getNotificationPreferences,
    updateNotificationPreferences,
  };
};
