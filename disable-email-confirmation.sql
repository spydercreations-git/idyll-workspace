-- Disable email confirmation requirement
-- Run this in Supabase SQL Editor

-- Update auth config to disable email confirmation
UPDATE auth.config 
SET email_confirm = false 
WHERE id = 1;

-- Alternative: Update specific settings
INSERT INTO auth.config (email_confirm) 
VALUES (false) 
ON CONFLICT (id) 
DO UPDATE SET email_confirm = false;