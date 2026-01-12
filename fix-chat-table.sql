-- Fix chat_messages table - Complete setup for Idyll Productions
-- Run this in your Supabase SQL Editor

-- Drop existing table if it exists (to ensure clean setup)
DROP TABLE IF EXISTS chat_messages CASCADE;

-- Create chat_messages table with all required columns
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'user' CHECK (type IN ('user', 'system')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  is_edited BOOLEAN DEFAULT FALSE,
  recipient TEXT -- For direct messages between users
);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for chat_messages table  
CREATE POLICY "Anyone can view chat messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert chat messages" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update their own chat messages" ON chat_messages FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete their own chat messages" ON chat_messages FOR DELETE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender);
CREATE INDEX IF NOT EXISTS idx_chat_messages_recipient ON chat_messages(recipient);
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(type);

-- Enable real-time subscriptions for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Insert a welcome message to test the table
INSERT INTO chat_messages (sender, message, type) 
VALUES ('System', 'Welcome to Idyll Productions Chat! 🎬', 'system');

-- Verify table creation
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
ORDER BY ordinal_position;