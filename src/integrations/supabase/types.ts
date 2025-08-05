export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ai_assistant_conversations: {
        Row: {
          content: string
          created_at: string
          id: string
          is_user: boolean
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_user: boolean
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_user?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          condition_type: string
          created_at: string | null
          description: string
          icon: string
          id: string
          threshold: number
          title: string
        }
        Insert: {
          condition_type: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          threshold: number
          title: string
        }
        Update: {
          condition_type?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          threshold?: number
          title?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          event_date: string
          event_time: string
          event_type: string
          id: string
          location: string | null
          routine_id: string | null
          title: string
          updated_at: string
          user_id: string
          visibility: string
          zoom_link: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes: number
          event_date: string
          event_time: string
          event_type: string
          id?: string
          location?: string | null
          routine_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          visibility?: string
          zoom_link?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          event_date?: string
          event_time?: string
          event_type?: string
          id?: string
          location?: string | null
          routine_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: string
          zoom_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      community_channels: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          order_index: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          order_index?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "community_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string
          id: string
          instructor: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          instructor: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          instructor?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          prompt_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          prompt_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          prompt_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "journal_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_prompts: {
        Row: {
          created_at: string
          description: string
          duration_minutes: number
          id: string
          prompt_text: string
          title: string
          type: Database["public"]["Enums"]["journal_prompt_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          duration_minutes: number
          id?: string
          prompt_text: string
          title: string
          type: Database["public"]["Enums"]["journal_prompt_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          duration_minutes?: number
          id?: string
          prompt_text?: string
          title?: string
          type?: Database["public"]["Enums"]["journal_prompt_type"]
          updated_at?: string
        }
        Relationships: []
      }
      journal_section_prompts: {
        Row: {
          created_at: string
          description: string
          id: string
          order_index: number
          prompt_text: string
          section: Database["public"]["Enums"]["journal_section_type"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          order_index: number
          prompt_text: string
          section: Database["public"]["Enums"]["journal_section_type"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          order_index?: number
          prompt_text?: string
          section?: Database["public"]["Enums"]["journal_section_type"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          course_id: string
          created_at: string
          id: string
          order_index: number
          pdf_url: string | null
          summary: string
          title: string
          video_url: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          order_index: number
          pdf_url?: string | null
          summary: string
          title: string
          video_url: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          order_index?: number
          pdf_url?: string | null
          summary?: string
          title?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      loop_trainer_sessions: {
        Row: {
          created_at: string
          end_time_sec: number
          id: string
          loop_count: number
          pitch_shift: number
          playback_speed: number
          session_notes: string | null
          start_time_sec: number
          total_practice_time: number
          updated_at: string
          user_id: string
          video_title: string | null
          youtube_url: string
        }
        Insert: {
          created_at?: string
          end_time_sec: number
          id?: string
          loop_count?: number
          pitch_shift?: number
          playback_speed?: number
          session_notes?: string | null
          start_time_sec?: number
          total_practice_time?: number
          updated_at?: string
          user_id: string
          video_title?: string | null
          youtube_url: string
        }
        Update: {
          created_at?: string
          end_time_sec?: number
          id?: string
          loop_count?: number
          pitch_shift?: number
          playback_speed?: number
          session_notes?: string | null
          start_time_sec?: number
          total_practice_time?: number
          updated_at?: string
          user_id?: string
          video_title?: string | null
          youtube_url?: string
        }
        Relationships: []
      }
      musical_journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          is_completed: boolean
          prompt_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_completed?: boolean
          prompt_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_completed?: boolean
          prompt_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "musical_journal_entries_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "journal_section_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price_at_purchase: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price_at_purchase: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price_at_purchase?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          status: string
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      practice_goals: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          progress: number
          target_date: string | null
          title: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          progress?: number
          target_date?: string | null
          title: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          progress?: number
          target_date?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      practice_recordings: {
        Row: {
          created_at: string
          duration_seconds: number
          id: string
          notes: string | null
          recording_url: string
          session_id: string | null
          tags: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number
          id?: string
          notes?: string | null
          recording_url: string
          session_id?: string | null
          tags?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          id?: string
          notes?: string | null
          recording_url?: string
          session_id?: string | null
          tags?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_recordings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_recordings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_reflections: {
        Row: {
          created_at: string
          id: string
          reflection_text: string
          routine_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reflection_text: string
          routine_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reflection_text?: string
          routine_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_reflections_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_sessions: {
        Row: {
          block_breakdown: Json | null
          completed_at: string
          id: string
          routine_id: string | null
          total_duration: number
          user_id: string
        }
        Insert: {
          block_breakdown?: Json | null
          completed_at?: string
          id?: string
          routine_id?: string | null
          total_duration: number
          user_id: string
        }
        Update: {
          block_breakdown?: Json | null
          completed_at?: string
          id?: string
          routine_id?: string | null
          total_duration?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_sessions_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          image_url: string
          name: string
          price: number
          stock_count: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          image_url: string
          name: string
          price: number
          stock_count?: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string
          name?: string
          price?: number
          stock_count?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      routine_blocks: {
        Row: {
          content: string | null
          created_at: string
          duration: number
          id: string
          instructions: string | null
          order_index: number
          routine_id: string
          type: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          duration?: number
          id?: string
          instructions?: string | null
          order_index: number
          routine_id: string
          type: string
        }
        Update: {
          content?: string | null
          created_at?: string
          duration?: number
          id?: string
          instructions?: string | null
          order_index?: number
          routine_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_blocks_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          ai_generated: boolean | null
          created_at: string
          created_by: string
          description: string | null
          duration: number
          generation_context: Json | null
          id: string
          is_template: boolean
          tags: string[] | null
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          ai_generated?: boolean | null
          created_at?: string
          created_by: string
          description?: string | null
          duration?: number
          generation_context?: Json | null
          id?: string
          is_template?: boolean
          tags?: string[] | null
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          ai_generated?: boolean | null
          created_at?: string
          created_by?: string
          description?: string | null
          duration?: number
          generation_context?: Json | null
          id?: string
          is_template?: boolean
          tags?: string[] | null
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "routines_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_practice_preferences: {
        Row: {
          created_at: string
          energy_patterns: Json | null
          focus_areas: string[] | null
          id: string
          preferred_practice_time: string | null
          primary_instrument: string | null
          skill_level: string | null
          typical_practice_duration: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          energy_patterns?: Json | null
          focus_areas?: string[] | null
          id?: string
          preferred_practice_time?: string | null
          primary_instrument?: string | null
          skill_level?: string | null
          typical_practice_duration?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          energy_patterns?: Json | null
          focus_areas?: string[] | null
          id?: string
          preferred_practice_time?: string | null
          primary_instrument?: string | null
          skill_level?: string | null
          typical_practice_duration?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wellness_goals: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          weekly_minutes_goal: number
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          weekly_minutes_goal?: number
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          weekly_minutes_goal?: number
        }
        Relationships: []
      }
      wellness_practices: {
        Row: {
          content: string
          created_at: string
          description: string
          duration_minutes: number
          id: string
          image_url: string | null
          title: string
          type: Database["public"]["Enums"]["wellness_practice_type"]
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          description: string
          duration_minutes: number
          id?: string
          image_url?: string | null
          title: string
          type: Database["public"]["Enums"]["wellness_practice_type"]
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          description?: string
          duration_minutes?: number
          id?: string
          image_url?: string | null
          title?: string
          type?: Database["public"]["Enums"]["wellness_practice_type"]
          updated_at?: string
        }
        Relationships: []
      }
      wellness_sessions: {
        Row: {
          completed_at: string
          duration_minutes: number
          id: string
          practice_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          duration_minutes: number
          id?: string
          practice_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          duration_minutes?: number
          id?: string
          practice_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wellness_sessions_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "wellness_practices"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_journal_progress: {
        Row: {
          completed_prompts: number | null
          section: Database["public"]["Enums"]["journal_section_type"] | null
          total_prompts: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_and_award_badges: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      check_and_award_wellness_badges: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      get_alltime_practice_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          username: string
          first_name: string
          last_name: string
          avatar_url: string
          total_minutes: number
        }[]
      }
      get_course_completion: {
        Args: { course_uuid: string; user_uuid: string }
        Returns: {
          course_id: string
          total_lessons: number
          completed_lessons: number
          completion_percentage: number
        }[]
      }
      get_featured_templates: {
        Args: { limit_count?: number }
        Returns: {
          id: string
          title: string
          description: string
          duration: number
          tags: string[]
          created_by: string
          is_template: boolean
          created_at: string
          updated_at: string
          visibility: string
          creator_name: string
          includes: string[]
          usage_count: number
        }[]
      }
      get_streak_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          username: string
          first_name: string
          last_name: string
          avatar_url: string
          current_streak: number
        }[]
      }
      get_user_courses_with_progress: {
        Args: { user_uuid: string }
        Returns: {
          id: string
          title: string
          description: string
          instructor: string
          thumbnail_url: string
          tags: string[]
          created_at: string
          total_lessons: number
          completed_lessons: number
          completion_percentage: number
          last_interaction: string
        }[]
      }
      get_weekly_practice_leaderboard: {
        Args: { week_start: string; week_end: string }
        Returns: {
          user_id: string
          username: string
          first_name: string
          last_name: string
          avatar_url: string
          total_minutes: number
        }[]
      }
      get_wellness_stats: {
        Args: { user_uuid: string }
        Returns: {
          total_sessions: number
          total_minutes: number
          current_streak: number
          total_journal_entries: number
          weekly_minutes_goal: number
        }[]
      }
    }
    Enums: {
      journal_prompt_type:
        | "self_composition"
        | "values"
        | "resistance"
        | "learning"
      journal_section_type: "past" | "present" | "future"
      user_role: "admin" | "team" | "user"
      wellness_practice_type: "meditation" | "breathwork" | "yoga_fitness"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      journal_prompt_type: [
        "self_composition",
        "values",
        "resistance",
        "learning",
      ],
      journal_section_type: ["past", "present", "future"],
      user_role: ["admin", "team", "user"],
      wellness_practice_type: ["meditation", "breathwork", "yoga_fitness"],
    },
  },
} as const
