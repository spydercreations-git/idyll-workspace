import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pjfncblnarmjefsgscms.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZm5jYmxuYXJtamVmc2dzY21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNjUzMDIsImV4cCI6MjA4Mzc0MTMwMn0.oSKmFXl05JiO5tHnRrhCD3I4qsTi3Set0NSamVTogUU';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          uid: string;
          email: string;
          display_name: string;
          photo_url: string | null;
          role: 'editor' | 'moderator' | 'owner';
          approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          uid: string;
          email: string;
          display_name: string;
          photo_url?: string | null;
          role?: 'editor' | 'moderator' | 'owner';
          approved?: boolean;
        };
        Update: {
          display_name?: string;
          photo_url?: string | null;
          role?: 'editor' | 'moderator' | 'owner';
          approved?: boolean;
        };
      };
      chat_messages: {
        Row: {
          id: number;
          sender: string;
          message: string;
          timestamp: string;
          type: 'user' | 'system';
        };
        Insert: {
          sender: string;
          message: string;
          type?: 'user' | 'system';
        };
        Update: {
          message?: string;
        };
      };
    };
  };
}