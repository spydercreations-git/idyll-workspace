import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

// Authentication Functions
export const authService = {
  async signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        }
      }
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
};

// Users Functions
export const usersService = {
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createUser(user: Tables['users']['Insert']) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    return { data, error };
  },

  async updateUser(id: number, updates: Tables['users']['Update']) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    return { data, error };
  }
};

// Applications Functions
export const applicationsService = {
  async getApplications() {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('applied_at', { ascending: false });
    return { data, error };
  },

  async createApplication(application: Tables['applications']['Insert']) {
    const { data, error } = await supabase
      .from('applications')
      .insert(application)
      .select()
      .single();
    return { data, error };
  },

  async updateApplication(id: number, updates: Tables['applications']['Update']) {
    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deleteApplication(id: number) {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// Tasks Functions
export const tasksService = {
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createTask(task: Tables['tasks']['Insert']) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    return { data, error };
  },

  async updateTask(id: number, updates: Tables['tasks']['Update']) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async getTasksByUser(assignedTo: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', assignedTo)
      .order('created_at', { ascending: false });
    return { data, error };
  }
};

// Meetings Functions
export const meetingsService = {
  async getMeetings() {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: true });
    return { data, error };
  },

  async createMeeting(meeting: Tables['meetings']['Insert']) {
    const { data, error } = await supabase
      .from('meetings')
      .insert(meeting)
      .select()
      .single();
    return { data, error };
  },

  async deleteMeeting(id: number) {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// Payouts Functions
export const payoutsService = {
  async getPayouts() {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .order('requested_at', { ascending: false });
    return { data, error };
  },

  async createPayout(payout: Tables['payouts']['Insert']) {
    const { data, error } = await supabase
      .from('payouts')
      .insert(payout)
      .select()
      .single();
    return { data, error };
  },

  async updatePayout(id: number, updates: Tables['payouts']['Update']) {
    const { data, error } = await supabase
      .from('payouts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async getPayoutsByUser(editor: string) {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('editor', editor)
      .order('requested_at', { ascending: false });
    return { data, error };
  }
};

// Chat Functions
export const chatService = {
  async getMessages() {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('timestamp', { ascending: true });
    return { data, error };
  },

  async sendMessage(message: Tables['chat_messages']['Insert']) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();
    return { data, error };
  },

  // Real-time subscription for chat
  subscribeToMessages(callback: (message: any) => void) {
    return supabase
      .channel('chat_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        callback
      )
      .subscribe();
  }
};

// Notifications Functions
export const notificationsService = {
  async getNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createNotification(notification: Tables['notifications']['Insert']) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    return { data, error };
  },

  async markAsRead(id: number) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
};