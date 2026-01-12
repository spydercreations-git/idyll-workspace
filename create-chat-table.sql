-- Create chat_messages table for real-time messaging
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'user' CHECK (type IN ('user', 'system')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  is_edited BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_messages table  
CREATE POLICY "Anyone can view chat messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert chat messages" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update chat messages" ON chat_messages FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete chat messages" ON chat_messages FOR DELETE USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender);

-- Enable real-time for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;