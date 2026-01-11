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
      applications: {
        Row: {
          id: number;
          name: string;
          email: string;
          contact: string | null;
          location: string | null;
          software: string | null;
          role: string | null;
          portfolio: string | null;
          status: 'pending' | 'approved' | 'rejected';
          applied_at: string;
        };
        Insert: {
          name: string;
          email: string;
          contact?: string | null;
          location?: string | null;
          software?: string | null;
          role?: string | null;
          portfolio?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
        };
        Update: {
          status?: 'pending' | 'approved' | 'rejected';
        };
      };
      tasks: {
        Row: {
          id: number;
          task_number: string;
          name: string;
          assigned_to: string;
          deadline: string;
          priority: 'low' | 'medium' | 'high';
          status: 'pending' | 'in-progress' | 'completed';
          raw_file: string | null;
          edited_file: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          task_number: string;
          name: string;
          assigned_to: string;
          deadline: string;
          priority?: 'low' | 'medium' | 'high';
          status?: 'pending' | 'in-progress' | 'completed';
          raw_file?: string | null;
          edited_file?: string | null;
        };
        Update: {
          name?: string;
          assigned_to?: string;
          deadline?: string;
          priority?: 'low' | 'medium' | 'high';
          status?: 'pending' | 'in-progress' | 'completed';
          raw_file?: string | null;
          edited_file?: string | null;
        };
      };
      meetings: {
        Row: {
          id: number;
          title: string;
          date: string;
          time: string;
          attendees: string[];
          organizer: string;
          created_at: string;
        };
        Insert: {
          title: string;
          date: string;
          time: string;
          attendees: string[];
          organizer: string;
        };
        Update: {
          title?: string;
          date?: string;
          time?: string;
          attendees?: string[];
        };
      };
      payouts: {
        Row: {
          id: number;
          editor: string;
          project: string;
          amount: number;
          edited_link: string;
          payment_method: string;
          status: 'pending' | 'approved' | 'paid' | 'rejected';
          requested_at: string;
          updated_at: string;
        };
        Insert: {
          editor: string;
          project: string;
          amount: number;
          edited_link: string;
          payment_method: string;
          status?: 'pending' | 'approved' | 'paid' | 'rejected';
        };
        Update: {
          status?: 'pending' | 'approved' | 'paid' | 'rejected';
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
      notifications: {
        Row: {
          id: number;
          type: string;
          title: string;
          message: string;
          urgent: boolean;
          time: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          type: string;
          title: string;
          message: string;
          urgent?: boolean;
          time?: string;
        };
        Update: {
          read_at?: string | null;
        };
      };
    };
  };
}