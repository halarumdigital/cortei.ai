-- Add color column to tasks table if it doesn't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3b82f6';