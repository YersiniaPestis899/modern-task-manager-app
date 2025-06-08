import { Database } from './database'

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
export type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert']
export type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update']

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type ThemeType = 'light' | 'dark' | 'system'

export interface TaskWithCategory extends Task {
  category_name?: string
  category_color?: string
}

export type TaskFormData = {
  title: string
  description?: string
  due_date?: Date | null
  due_time?: string
  priority: TaskPriority
  category?: string
  reminder_minutes?: number
  is_recurring?: boolean
  recurring_pattern?: string
  tags?: string[]
}

export type TaskFilter = {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  category?: string[]
  date_range?: {
    start: Date
    end: Date
  }
  search?: string
  tags?: string[]
}

export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  color: string
  task: Task
}

export interface NotificationSettings {
  enabled: boolean
  sound: boolean
  desktop: boolean
  reminder_minutes: number[]
}

export interface AppSettings {
  theme: ThemeType
  notifications: NotificationSettings
  work_hours: {
    start: string
    end: string
  }
  timezone: string
  default_reminder_minutes: number
}
