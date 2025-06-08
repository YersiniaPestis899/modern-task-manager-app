-- Modern Task Manager Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE theme_type AS ENUM ('light', 'dark', 'system');

-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#3b82f6', -- Hex color code
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    due_date DATE,
    due_time TIME,
    priority task_priority DEFAULT 'medium',
    status task_status DEFAULT 'pending',
    category VARCHAR(255),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reminder_minutes INTEGER,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern VARCHAR(255), -- For future recurring task implementation
    completed_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}', -- Array of tags
    
    -- Constraints
    CONSTRAINT valid_reminder_minutes CHECK (reminder_minutes IS NULL OR reminder_minutes > 0),
    CONSTRAINT valid_recurring_pattern CHECK (
        (is_recurring = FALSE AND recurring_pattern IS NULL) OR
        (is_recurring = TRUE AND recurring_pattern IS NOT NULL)
    )
);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    theme theme_type DEFAULT 'system',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    default_reminder_minutes INTEGER DEFAULT 15,
    work_hours_start TIME DEFAULT '09:00:00',
    work_hours_end TIME DEFAULT '17:00:00',
    timezone VARCHAR(100) DEFAULT 'Asia/Tokyo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_default_reminder CHECK (default_reminder_minutes > 0),
    CONSTRAINT valid_work_hours CHECK (work_hours_start < work_hours_end)
);

-- Indexes for better performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date) WHERE due_date IS NOT NULL;

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Full-text search index for tasks
CREATE INDEX idx_tasks_search ON tasks USING gin(to_tsvector('japanese', title || ' ' || COALESCE(description, '')));

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "Users can view their own tasks" 
    ON tasks FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" 
    ON tasks FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
    ON tasks FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
    ON tasks FOR DELETE 
    USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Users can view their own categories" 
    ON categories FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" 
    ON categories FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
    ON categories FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
    ON categories FOR DELETE 
    USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" 
    ON user_preferences FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
    ON user_preferences FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
    ON user_preferences FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" 
    ON user_preferences FOR DELETE 
    USING (auth.uid() = user_id);

-- Functions for common operations

-- Function to get task statistics for a user
CREATE OR REPLACE FUNCTION get_task_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'completed', COUNT(*) FILTER (WHERE status = 'completed'),
        'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'overdue', COUNT(*) FILTER (WHERE 
            status != 'completed' 
            AND due_date IS NOT NULL 
            AND (due_date < CURRENT_DATE OR 
                (due_date = CURRENT_DATE AND due_time IS NOT NULL AND due_time < CURRENT_TIME))
        ),
        'due_today', COUNT(*) FILTER (WHERE 
            status != 'completed' 
            AND due_date = CURRENT_DATE
        ),
        'by_priority', json_build_object(
            'urgent', COUNT(*) FILTER (WHERE priority = 'urgent'),
            'high', COUNT(*) FILTER (WHERE priority = 'high'),
            'medium', COUNT(*) FILTER (WHERE priority = 'medium'),
            'low', COUNT(*) FILTER (WHERE priority = 'low')
        )
    ) INTO result
    FROM tasks
    WHERE user_id = user_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default user preferences
CREATE OR REPLACE FUNCTION create_default_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default preferences for new users
CREATE TRIGGER create_user_preferences_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_user_preferences();

-- Sample data (optional - remove in production)
-- INSERT INTO categories (name, color, user_id) VALUES 
--     ('Work', '#ef4444', auth.uid()),
--     ('Personal', '#22c55e', auth.uid()),
--     ('Health', '#3b82f6', auth.uid()),
--     ('Learning', '#f59e0b', auth.uid());

-- Views for easier querying

-- View for tasks with category information
CREATE VIEW tasks_with_categories AS
SELECT 
    t.*,
    c.name as category_name,
    c.color as category_color
FROM tasks t
LEFT JOIN categories c ON t.category = c.name AND t.user_id = c.user_id;

-- View for overdue tasks
CREATE VIEW overdue_tasks AS
SELECT *
FROM tasks
WHERE status != 'completed'
    AND due_date IS NOT NULL
    AND (
        due_date < CURRENT_DATE OR 
        (due_date = CURRENT_DATE AND due_time IS NOT NULL AND due_time < CURRENT_TIME)
    );

-- View for today's tasks
CREATE VIEW today_tasks AS
SELECT *
FROM tasks
WHERE status != 'completed'
    AND due_date = CURRENT_DATE;

-- Comments for documentation
COMMENT ON TABLE tasks IS 'Main tasks table storing all user tasks with comprehensive metadata';
COMMENT ON TABLE categories IS 'User-defined categories for organizing tasks';
COMMENT ON TABLE user_preferences IS 'User-specific application preferences and settings';

COMMENT ON COLUMN tasks.tags IS 'Array of string tags for flexible task categorization';
COMMENT ON COLUMN tasks.recurring_pattern IS 'Future use: stores recurring pattern (e.g., "daily", "weekly", "monthly")';
COMMENT ON COLUMN tasks.reminder_minutes IS 'Minutes before due time to send reminder notification';

-- Grant permissions (if needed for specific roles)
-- GRANT ALL ON tasks TO authenticated;
-- GRANT ALL ON categories TO authenticated;
-- GRANT ALL ON user_preferences TO authenticated;

-- Refresh materialized views (if any were created)
-- REFRESH MATERIALIZED VIEW task_summary;

-- Enable realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE user_preferences;

-- Final verification queries (uncomment to test)
/*
SELECT 'Schema created successfully!' as status;
SELECT table_name, is_insertable_into 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('tasks', 'categories', 'user_preferences');
*/
