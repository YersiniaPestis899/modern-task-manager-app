export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          due_time: string | null
          id: string
          is_recurring: boolean | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          recurring_pattern: string | null
          reminder_minutes: number | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          is_recurring?: boolean | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          recurring_pattern?: string | null
          reminder_minutes?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          is_recurring?: boolean | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          recurring_pattern?: string | null
          reminder_minutes?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          default_reminder_minutes: number | null
          id: string
          notifications_enabled: boolean | null
          theme: Database["public"]["Enums"]["theme_type"] | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          work_hours_end: string | null
          work_hours_start: string | null
        }
        Insert: {
          created_at?: string | null
          default_reminder_minutes?: number | null
          id?: string
          notifications_enabled?: boolean | null
          theme?: Database["public"]["Enums"]["theme_type"] | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          work_hours_end?: string | null
          work_hours_start?: string | null
        }
        Update: {
          created_at?: string | null
          default_reminder_minutes?: number | null
          id?: string
          notifications_enabled?: boolean | null
          theme?: Database["public"]["Enums"]["theme_type"] | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          work_hours_end?: string | null
          work_hours_start?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_task_stats: {
        Args: { user_uuid: string }
        Returns: Json
      }
    }
    Enums: {
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      theme_type: "light" | "dark" | "system"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
