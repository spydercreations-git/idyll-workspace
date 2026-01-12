-- Database cleanup and fixes
-- Run this in Supabase SQL Editor

-- Remove unwanted email from all tables
DELETE FROM users WHERE email = 'contactspydercreations@gmail.com';
DELETE FROM applications WHERE email = 'contactspydercreations@gmail.com';
DELETE FROM auth.users WHERE email = 'contactspydercreations@gmail.com';

-- Disable email confirmation requirement
UPDATE auth.config 
SET email_confirm = false 
WHERE id = 1;

-- Alternative: Update specific settings
INSERT INTO auth.config (email_confirm) 
VALUES (false) 
ON CONFLICT (id) 
DO UPDATE SET email_confirm = false;

-- Ensure admin users are properly set up
INSERT INTO users (uid, email, display_name, photo_url, role, approved) 
VALUES 
  ('owner-uid', 'idyllproductionsofficial@gmail.com', 'Idyll Owner', 'https://i.pravatar.cc/150?u=idyllproductionsofficial@gmail.com', 'owner', true),
  ('mod1-uid', 'harshpawar7711@gmail.com', 'Harsh Pawar', 'https://i.pravatar.cc/150?u=harshpawar7711@gmail.com', 'moderator', true),
  ('mod2-uid', 'rohitidyllproductions@gmail.com', 'Rohit Idyll', 'https://i.pravatar.cc/150?u=rohitidyllproductions@gmail.com', 'moderator', true)
ON CONFLICT (email) 
DO UPDATE SET 
  role = EXCLUDED.role,
  approved = EXCLUDED.approved;