export interface Database {
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
          id: string
          user_id: string
          type: 'x' | 'youtube' | 'rss' | 'blog'
          handle: string | null
          url: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'x' | 'youtube' | 'rss' | 'blog'
          handle?: string | null
          url?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
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
          id: string
          user_id: string
          platform: 'x' | 'linkedin' | 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'blog'
          raw_text: string
          embedding: number[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'x' | 'linkedin' | 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'blog'
          raw_text: string
          embedding?: number[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'x' | 'linkedin' | 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'blog'
          raw_text?: string
          embedding?: number[] | null
          created_at?: string
        }
      }
      trend_items: {
        Row: {
          id: string
          user_id: string
          source_type: string | null
          source_ref: string | null
          title: string | null
          summary: string | null
          published_at: string | null
          score: number
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_type?: string | null
          source_ref?: string | null
          title?: string | null
          summary?: string | null
          published_at?: string | null
          score?: number
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_type?: string | null
          source_ref?: string | null
          title?: string | null
          summary?: string | null
          published_at?: string | null
          score?: number
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
      }
      drafts: {
        Row: {
          id: string
          user_id: string
          platform: 'x' | 'linkedin' | 'instagram'
          content: string
          draft_title: string | null
          based_on: number | null
          status: 'generated' | 'reviewed' | 'accepted' | 'rejected'
          metadata: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'x' | 'linkedin' | 'instagram'
          content: string
          draft_title?: string | null
          based_on?: number | null
          status?: 'generated' | 'reviewed' | 'accepted' | 'rejected'
          metadata?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'x' | 'linkedin' | 'instagram'
          content?: string
          draft_title?: string | null
          based_on?: number | null
          status?: 'generated' | 'reviewed' | 'accepted' | 'rejected'
          metadata?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          user_id: string
          draft_id: string
          verdict: 'up' | 'down'
          edit_diff: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          draft_id: string
          verdict: 'up' | 'down'
          edit_diff?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          draft_id?: string
          verdict?: 'up' | 'down'
          edit_diff?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      match_style_samples: {
        Args: {
          p_user_id: string
          p_platform: string
          p_query_embedding: number[]
          p_match_count: number
        }
        Returns: {
          id: string
          user_id: string
          platform: string
          raw_text: string
          embedding: number[] | null
          created_at: string
          similarity: number
        }[]
      }
    }
  }
}

// Type helpers for better developer experience
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type StyleSample = Tables<'style_samples'>
export type StyleSampleInsert = Inserts<'style_samples'>
export type StyleSampleUpdate = Updates<'style_samples'>

export type Source = Tables<'sources'>
export type SourceInsert = Inserts<'sources'>
export type SourceUpdate = Updates<'sources'>

export type Draft = Tables<'drafts'>
export type DraftInsert = Inserts<'drafts'>
export type DraftUpdate = Updates<'drafts'>
