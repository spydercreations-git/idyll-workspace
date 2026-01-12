-- Hybrid Architecture: Supabase for Auth + Chat, Notion for Everything Else
-- Run this in Supabase SQL Editor

-- Clean up old tables except users and chat
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS payouts CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Keep users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  photo_url TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'moderator', 'owner')),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keep chat in Supabase for real-time WebSockets
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT DEFAULT 'user' CHECK (type IN ('user', 'system'))
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;

CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = uid);
CREATE POLICY "Admins can update any user" ON users FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE uid = auth.uid()::text 
    AND role IN ('moderator', 'owner')
  )
);

-- Chat policies
DROP POLICY IF EXISTS "Anyone can view chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can insert chat messages" ON chat_messages;

CREATE POLICY "Anyone can view chat messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert chat messages" ON chat_messages FOR INSERT WITH CHECK (true);

-- Insert admin users
INSERT INTO users (uid, email, display_name, photo_url, role, approved) 
VALUES 
  ('owner-uid-2026', 'idyllproductionsofficial@gmail.com', 'Idyll Owner', 'https://i.pravatar.cc/150?u=idyllproductionsofficial@gmail.com', 'owner', true),
  ('mod1-uid-2026', 'harshpawar7711@gmail.com', 'Harsh Pawar', 'https://i.pravatar.cc/150?u=harshpawar7711@gmail.com', 'moderator', true),
  ('mod2-uid-2026', 'rohitidyllproductions@gmail.com', 'Rohit Idyll', 'https://i.pravatar.cc/150?u=rohitidyllproductions@gmail.com', 'moderator', true)
ON CONFLICT (email) 
DO UPDATE SET 
  role = EXCLUDED.role,
  approved = EXCLUDED.approved;

-- Add welcome chat message
INSERT INTO chat_messages (sender, message, type) 
VALUES ('System', 'Welcome to Idyll Productions team chat! 🎬', 'system')
ON CONFLICT DO NOTHING;