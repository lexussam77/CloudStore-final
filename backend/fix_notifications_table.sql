-- Fix notifications table by updating null values in is_read column
UPDATE notifications SET is_read = false WHERE is_read IS NULL;

-- Add NOT NULL constraint to is_read column
ALTER TABLE notifications ALTER COLUMN is_read SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN is_read SET DEFAULT false; 