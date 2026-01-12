-- Idyll Productions Database Schema
-- Notion-First Architecture: Minimal Supabase + Primary Notion

-- =============================================
-- SUPABASE TABLES (Essential Data Only)
-- =============================================

-- Users table (Authentication + Core User Data)
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

-- Chat Messages table (Real-time WebSocket functionality)
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'user' CHECK (type IN ('user', 'system')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- NOTION DATABASES (Primary Data Storage)
-- =============================================

-- All other data is stored in Notion:
-- 1. Tasks Database (ID: 2cc28c5fb67380b6b9eadeea94981afb)
--    - Task Number (Number)
--    - Name (Text)
--    - Assigned To (Email) <- Email-based filtering
--    - Status (Select): Pending, In Progress, Completed
--    - Priority (Select): Low, Medium, High
--    - Deadline (Date)
--    - Raw File (URL)
--    - Edited File (URL)
--    - Idyll Approval (Select): Reviewing, Need Changes, Approved

-- 2. Meetings Database (ID: 2e628c5fb67380e58d64eef87105515d)
--    - Title (Text)
--    - Date (Date)
--    - Time (Text)
--    - Attendees Emails (Multi-select) <- Email-based filtering
--    - Attendees Names (Multi-select)
--    - Organizer (Text)
--    - Link (URL)

-- 3. Payouts Database (ID: 2e628c5fb67380568bd2ef6a1eb05965)
--    - Project (Text)
--    - Editor Email (Email) <- Email-based filtering
--    - Editor Name (Text)
--    - Amount (Number)
--    - Status (Select): Pending, Approved, Paid, Rejected
--    - Edited Link (URL)
--    - Payment Method (Text)
--    - Requested Date (Date)

-- 4. Applications Database (ID: 2e628c5fb6738005950fdadb6dcd2ba3)
--    - Name (Text)
--    - Email (Email)
--    - Status (Select): Pending, Approved, Rejected
--    - Software (Text)
--    - Role (Text)
--    - Portfolio (URL)
--    - Location (Text)
--    - Contact (Text)
--    - Applied Date (Date)

-- 5. Notifications Database (ID: 2e628c5fb673807fbf92f7fbd55fa913)
--    - Title (Text)
--    - Message (Text)
--    - Type (Select): task, meeting, payout, user, info
--    - Urgent (Checkbox)
--    - Time (Text)

-- =============================================
-- REAL-TIME FUNCTIONALITY
-- =============================================

-- Supabase: Real-time WebSocket subscriptions for chat_messages and users
-- Notion: Polling every 2 seconds for tasks, meetings, payouts, applications, notifications

-- =============================================
-- EMAIL-BASED FILTERING
-- =============================================

-- All Notion databases use email-based filtering:
-- - Tasks filtered by "Assigned To" email
-- - Meetings filtered by "Attendees Emails" multi-select
-- - Payouts filtered by "Editor Email"
-- - Applications filtered by "Email"
-- - Notifications are global (no filtering needed)

-- =============================================
-- ROLE ASSIGNMENTS
-- =============================================

-- Email-based role assignments:
-- idyllproductionsofficial@gmail.com → Owner
-- harshpawar7711@gmail.com → Moderator  
-- rohitidyllproductions@gmail.com → Moderator
-- All others → Editor (requires approval)

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true);

-- Create policies for chat_messages table  
CREATE POLICY "Anyone can view chat messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert chat messages" ON chat_messages FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_approved ON users(approved);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();