'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { GradientButton } from '@/components/ui/gradient-button';
import { Bell, Mail, Smartphone, Globe, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/lib/settings';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationSettings {
  [key: string]: boolean;
}

export function NotificationsSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    // Product Updates
    productUpdates: true,
    newFeatures: true,
    platformAnnouncements: false,
    
    // Weekly Reports
    weeklyReports: true,
    performanceSummary: true,
    trendingTopics: false,
    
    // Account Alerts
    securityAlerts: true,
    billingNotifications: true,
    paymentFailures: true,
    
    // AI & Content
    aiDraftsReady: true,
    contentAnalysis: false,
    styleProfileUpdates: true,
    
    // Email Preferences
    emailDigest: true,
    marketingEmails: false,
    
    // Push Notifications
    pushNotifications: true,
    browserNotifications: false
  });
  
  const { user } = useAuth();
  const { getNotificationPreferences, updateNotificationPreferences } = useSettings();

  // Load notification preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (user) {
        const prefs = await getNotificationPreferences();
        if (prefs) {
          setNotifications({
            productUpdates: prefs.product_updates,
            newFeatures: prefs.new_features,
            platformAnnouncements: prefs.platform_announcements,
            weeklyReports: prefs.weekly_reports,
            performanceSummary: prefs.performance_summary,
            trendingTopics: prefs.trending_topics,
            securityAlerts: prefs.security_alerts,
            billingNotifications: prefs.billing_notifications,
            paymentFailures: prefs.payment_failures,
            aiDraftsReady: prefs.ai_drafts_ready,
            contentAnalysis: prefs.content_analysis,
            styleProfileUpdates: prefs.style_profile_updates,
            emailDigest: prefs.email_digest,
            marketingEmails: prefs.marketing_emails,
            pushNotifications: prefs.push_notifications,
            browserNotifications: prefs.browser_notifications
          });
        }
      }
    };
    
    loadPreferences();
  }, [user, getNotificationPreferences]);

  const handleToggle = async (key: string) => {
    if (!user) return;
    
    const newValue = !notifications[key];
    setNotifications(prev => ({ ...prev, [key]: newValue }));
    
    // Map the frontend key to database column name
    const dbKeyMap: Record<string, string> = {
      productUpdates: 'product_updates',
      newFeatures: 'new_features',
      platformAnnouncements: 'platform_announcements',
      weeklyReports: 'weekly_reports',
      performanceSummary: 'performance_summary',
      trendingTopics: 'trending_topics',
      securityAlerts: 'security_alerts',
      billingNotifications: 'billing_notifications',
      paymentFailures: 'payment_failures',
      aiDraftsReady: 'ai_drafts_ready',
      contentAnalysis: 'content_analysis',
      styleProfileUpdates: 'style_profile_updates',
      emailDigest: 'email_digest',
      marketingEmails: 'marketing_emails',
      pushNotifications: 'push_notifications',
      browserNotifications: 'browser_notifications'
    };
    
    const dbKey = dbKeyMap[key];
    if (dbKey) {
      try {
        await updateNotificationPreferences({ [dbKey]: newValue });
      } catch (error) {
        console.error('Error updating notification preference:', error);
        // Revert the change if update fails
        setNotifications(prev => ({ ...prev, [key]: !newValue }));
      }
    }
  };

  const handleSaveAll = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const dbUpdates: Record<string, boolean> = {};
      Object.entries(notifications).forEach(([key, value]) => {
        const dbKeyMap: Record<string, string> = {
          productUpdates: 'product_updates',
          newFeatures: 'new_features',
          platformAnnouncements: 'platform_announcements',
          weeklyReports: 'weekly_reports',
          performanceSummary: 'performance_summary',
          trendingTopics: 'trending_topics',
          securityAlerts: 'security_alerts',
          billingNotifications: 'billing_notifications',
          paymentFailures: 'payment_failures',
          aiDraftsReady: 'ai_drafts_ready',
          contentAnalysis: 'content_analysis',
          styleProfileUpdates: 'style_profile_updates',
          emailDigest: 'email_digest',
          marketingEmails: 'marketing_emails',
          pushNotifications: 'push_notifications',
          browserNotifications: 'browser_notifications'
        };
        
        const dbKey = dbKeyMap[key];
        if (dbKey) {
          dbUpdates[dbKey] = value;
        }
      });
      
      const success = await updateNotificationPreferences(dbUpdates);
      if (success) {
        toast.success('Notification preferences updated successfully!');
      } else {
        toast.error('Failed to update notification preferences. Please try again.');
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const NotificationToggle = ({ 
    id, 
    title, 
    description, 
    icon 
  }: { 
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-neutral-800 last:border-b-0">
      <div className="flex items-start space-x-3 flex-1">
        <div className="text-purple-400 mt-0.5">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium">{title}</p>
          <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
        </div>
      </div>
      <Switch
        checked={notifications[id]}
        onCheckedChange={() => handleToggle(id)}
        className="data-[state=checked]:bg-purple-500"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Notifications</h2>
        <p className="text-gray-400">Control how and when we communicate with you</p>
      </div>

      {/* Product Updates */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-purple-400" />
            Product Updates
          </CardTitle>
          <CardDescription>Stay informed about new features and platform announcements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <NotificationToggle
            id="productUpdates"
            title="Product Updates"
            description="Get notified about new features, improvements, and platform changes"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <NotificationToggle
            id="newFeatures"
            title="New Features"
            description="Be the first to know when we launch new AI capabilities and tools"
            icon={<Bell className="h-4 w-4" />}
          />
          <NotificationToggle
            id="platformAnnouncements"
            title="Platform Announcements"
            description="Important announcements about service updates and maintenance"
            icon={<Globe className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      {/* Weekly Reports */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            Weekly Reports
          </CardTitle>
          <CardDescription>Receive summaries of your performance and insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <NotificationToggle
            id="weeklyReports"
            title="Weekly Summary"
            description="Get a comprehensive overview of your content performance every week"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <NotificationToggle
            id="performanceSummary"
            title="Performance Insights"
            description="Detailed analytics and recommendations based on your content"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <NotificationToggle
            id="trendingTopics"
            title="Trending Topics"
            description="Weekly digest of trending topics and content opportunities"
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      {/* Account Alerts */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-purple-400" />
            Account Alerts
          </CardTitle>
          <CardDescription>Important security and billing notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <NotificationToggle
            id="securityAlerts"
            title="Security Alerts"
            description="Notifications about login attempts, password changes, and security events"
            icon={<AlertTriangle className="h-4 w-4" />}
          />
          <NotificationToggle
            id="billingNotifications"
            title="Billing Notifications"
            description="Updates about your subscription, renewals, and payment confirmations"
            icon={<Bell className="h-4 w-4" />}
          />
          <NotificationToggle
            id="paymentFailures"
            title="Payment Failures"
            description="Immediate alerts if there are issues with your payment method"
            icon={<AlertTriangle className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      {/* AI & Content */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            AI & Content
          </CardTitle>
          <CardDescription>Notifications about your AI-generated content and style profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <NotificationToggle
            id="aiDraftsReady"
            title="AI Drafts Ready"
            description="Get notified when new AI-generated drafts are ready for review"
            icon={<Bell className="h-4 w-4" />}
          />
          <NotificationToggle
            id="contentAnalysis"
            title="Content Analysis Complete"
            description="Notifications when your content analysis and style profiling is finished"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <NotificationToggle
            id="styleProfileUpdates"
            title="Style Profile Updates"
            description="Updates when your AI writing style profile has been improved"
            icon={<Users className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple-400" />
            Communication Preferences
          </CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <NotificationToggle
            id="emailDigest"
            title="Email Digest"
            description="Receive a daily digest of all your notifications via email"
            icon={<Mail className="h-4 w-4" />}
          />
          <NotificationToggle
            id="marketingEmails"
            title="Marketing Emails"
            description="Receive emails about tips, best practices, and CreatorPulse news"
            icon={<Mail className="h-4 w-4" />}
          />
          <NotificationToggle
            id="pushNotifications"
            title="Push Notifications"
            description="Receive push notifications on your mobile device"
            icon={<Smartphone className="h-4 w-4" />}
          />
          <NotificationToggle
            id="browserNotifications"
            title="Browser Notifications"
            description="Show notifications in your web browser when using CreatorPulse"
            icon={<Globe className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <GradientButton 
          onClick={handleSaveAll}
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
        >
          {isLoading ? 'Saving...' : 'Save All Preferences'}
        </GradientButton>
      </div>
    </div>
  );
}
