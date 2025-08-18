import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_settings: {
        Row: {
          user_id: string
          tz: string
          deliver_hour: number
          created_at: string
        }
        Insert: {
          user_id: string
          tz?: string
          deliver_hour?: number
          created_at?: string
        }
        Update: {
          user_id?: string
          tz?: string
          deliver_hour?: number
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          user_id: string
          full_name: string
          username: string
          location: string
          website: string
          bio: string
          avatar_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name: string
          username: string
          location?: string
          website?: string
          bio?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          full_name?: string
          username?: string
          location?: string
          website?: string
          bio?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      notification_preferences: {
        Row: {
          user_id: string
          product_updates: boolean
          new_features: boolean
          platform_announcements: boolean
          weekly_reports: boolean
          performance_summary: boolean
          trending_topics: boolean
          security_alerts: boolean
          billing_notifications: boolean
          payment_failures: boolean
          ai_drafts_ready: boolean
          content_analysis: boolean
          style_profile_updates: boolean
          email_digest: boolean
          marketing_emails: boolean
          push_notifications: boolean
          browser_notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          product_updates?: boolean
          new_features?: boolean
          platform_announcements?: boolean
          weekly_reports?: boolean
          performance_summary?: boolean
          trending_topics?: boolean
          security_alerts?: boolean
          billing_notifications?: boolean
          payment_failures?: boolean
          ai_drafts_ready?: boolean
          content_analysis?: boolean
          style_profile_updates?: boolean
          email_digest?: boolean
          marketing_emails?: boolean
          push_notifications?: boolean
          browser_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          product_updates?: boolean
          new_features?: boolean
          platform_announcements?: boolean
          weekly_reports?: boolean
          performance_summary?: boolean
          trending_topics?: boolean
          security_alerts?: boolean
          billing_notifications?: boolean
          payment_failures?: boolean
          ai_drafts_ready?: boolean
          content_analysis?: boolean
          style_profile_updates?: boolean
          email_digest?: boolean
          marketing_emails?: boolean
          push_notifications?: boolean
          browser_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sources: {
        Row: {
          id: number
          user_id: string
          type: 'x' | 'youtube' | 'rss' | 'blog'
          handle: string | null
          url: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          type: 'x' | 'youtube' | 'rss' | 'blog'
          handle?: string | null
          url?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          type?: 'x' | 'youtube' | 'rss' | 'blog'
          handle?: string | null
          url?: string | null
          active?: boolean
          created_at?: string
        }
      }
      style_samples: {
        Row: {
          id: number
          user_id: string
          platform: 'x' | 'linkedin' | 'instagram'
          raw_text: string
          embedding: number[] | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          platform: 'x' | 'linkedin' | 'instagram'
          raw_text: string
          embedding?: number[] | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          platform?: 'x' | 'linkedin' | 'instagram'
          raw_text?: string
          embedding?: number[] | null
          created_at?: string
        }
      }
      trend_items: {
        Row: {
          id: number
          user_id: string
          source_type: string | null
          source_ref: string | null
          title: string | null
          summary: string | null
          published_at: string | null
          score: number
          meta: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          source_type?: string | null
          source_ref?: string | null
          title?: string | null
          summary?: string | null
          published_at?: string | null
          score?: number
          meta?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          source_type?: string | null
          source_ref?: string | null
          title?: string | null
          summary?: string | null
          published_at?: string | null
          score?: number
          meta?: Record<string, unknown> | null
          created_at?: string
        }
      }
      drafts: {
        Row: {
          id: number
          user_id: string
          platform: 'x' | 'linkedin' | 'instagram'
          content: string
          based_on: number | null
          status: 'generated' | 'reviewed' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          platform: 'x' | 'linkedin' | 'instagram'
          content: string
          based_on?: number | null
          status?: 'generated' | 'reviewed' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          platform?: 'x' | 'linkedin' | 'instagram'
          content?: string
          based_on?: number | null
          status?: 'generated' | 'reviewed' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      feedback: {
        Row: {
          id: number
          user_id: string
          draft_id: number
          verdict: 'up' | 'down'
          edit_diff: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          draft_id: number
          verdict: 'up' | 'down'
          edit_diff?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          draft_id?: number
          verdict?: 'up' | 'down'
          edit_diff?: string | null
          created_at?: string
        }
      }
    }
  }
}
