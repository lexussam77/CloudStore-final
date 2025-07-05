-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Update existing null values in is_read column
UPDATE notifications SET is_read = FALSE WHERE is_read IS NULL;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read); 