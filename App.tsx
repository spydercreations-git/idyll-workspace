
import React, { useState, useEffect } from 'react';
import WelcomePage from './components/WelcomePage';
import CreateAccountPage from './components/CreateAccountPage';
import LoginPage from './components/LoginPage';
import ApplyPage from './components/ApplyPage';
import ApprovalPage from './components/ApprovalPage';
import EditorDashboard from './components/EditorDashboard';
import ManagementPanel from './components/ManagementPanel';
import CustomCursor from './components/CustomCursor';
import AnimatedLiquidBackground from './components/AnimatedLiquidBackground';
import { UserProfile } from './types';
import { authService, usersService, chatService } from './services/database';
import { notionDatabase } from './services/notionDatabase';
import { supabase } from './lib/supabase';

// Global state for demo purposes
interface AppState {
  users: any[];
  tasks: any[];
  applications: any[];
  meetings: any[];
  payouts: any[];
  notifications: any[];
  chatMessages: any[];
}

const initialState: AppState = {
  users: [],
  tasks: [],
  applications: [],
  meetings: [],
  payouts: [],
  notifications: [],
  chatMessages: []
};

// Idyll Productions - Production Ready with Supabase
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [appState, setAppState] = useState<AppState>(initialState);

  // Load data from Supabase on app start
  useEffect(() => {
    initializeApp();
  }, []);

  // Save current page to localStorage (only for authenticated pages)
  useEffect(() => {
    if (user && (currentPage === 'dashboard' || currentPage === 'management')) {
      localStorage.setItem('currentPage', currentPage);
      console.log('💾 Saved current page:', currentPage);
    } else if (!user && ['welcome', 'login', 'create-account', 'apply'].includes(currentPage)) {
      localStorage.setItem('currentPage', currentPage);
      console.log('💾 Saved current page:', currentPage);
    }
  }, [currentPage, user]);

  const initializeApp = async () => {
    setLoading(true);
    try {
      // Check if user is already logged in
      await checkAuthState();
      // Load all app data
      await loadAppData();
      // Set up real-time subscriptions
      setupRealtimeSubscriptions();
      // Set up Notion sync
      setupNotionSync();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
    setLoading(false);
  };

  const checkAuthState = async () => {
    try {
      console.log('🔍 Checking authentication state...');
      
      // First check if we have a saved user session in localStorage
      const savedUser = localStorage.getItem('idyll_user');
      const savedPage = localStorage.getItem('currentPage');
      
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('📱 Found saved user session:', userData.email);
          
          // Verify user still exists and is approved in database
          const { data: dbUser } = await usersService.getUserByEmail(userData.email);
          if (dbUser && dbUser.approved) {
            setUser({
              uid: dbUser.uid,
              email: dbUser.email,
              displayName: dbUser.display_name,
              photoURL: dbUser.photo_url || 'https://i.pravatar.cc/150?u=' + dbUser.email,
              role: dbUser.role as 'editor' | 'moderator' | 'owner',
              approved: dbUser.approved
            });
            
            // Restore the exact page they were on
            if (savedPage && (savedPage === 'dashboard' || savedPage === 'management')) {
              console.log('🔄 Restoring saved page:', savedPage);
              setCurrentPage(savedPage);
            } else {
              // Default page based on role
              if (dbUser.role === 'editor') {
                setCurrentPage('dashboard');
              } else if (dbUser.role === 'moderator' || dbUser.role === 'owner') {
                setCurrentPage('management');
              } else {
                setCurrentPage('dashboard');
              }
            }
            return;
          } else {
            // User no longer exists or not approved, clear saved session
            localStorage.removeItem('idyll_user');
            localStorage.removeItem('currentPage');
          }
        } catch (e) {
          console.error('Error parsing saved user:', e);
          localStorage.removeItem('idyll_user');
        }
      }
      
      // Check Supabase session as fallback
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userData } = await usersService.getUserByEmail(session.user.email!);
        if (userData && userData.approved) {
          const userProfile = {
            uid: userData.uid,
            email: userData.email,
            displayName: userData.display_name,
            photoURL: userData.photo_url || 'https://i.pravatar.cc/150?u=' + userData.email,
            role: userData.role as 'editor' | 'moderator' | 'owner',
            approved: userData.approved
          };
          
          setUser(userProfile);
          
          // Save user session to localStorage
          localStorage.setItem('idyll_user', JSON.stringify(userProfile));
          
          // Restore saved page or default based on role
          if (savedPage && (savedPage === 'dashboard' || savedPage === 'management')) {
            setCurrentPage(savedPage);
          } else {
            if (userData.role === 'editor') {
              setCurrentPage('dashboard');
            } else if (userData.role === 'moderator' || userData.role === 'owner') {
              setCurrentPage('management');
            } else {
              setCurrentPage('dashboard');
            }
          }
        } else if (userData && !userData.approved) {
          setCurrentPage('approval');
        }
      } else {
        // No session, check for saved page but only allow non-auth pages
        if (savedPage && ['welcome', 'login', 'create-account', 'apply', 'approval'].includes(savedPage)) {
          setCurrentPage(savedPage);
        } else {
          setCurrentPage('welcome');
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setCurrentPage('welcome');
    }
  };

  const setupNotionSync = () => {
    console.log('🔄 Setting up Notion polling...');
    
    // Start polling Notion for changes every 1 second for better real-time feel
    notionDatabase.startPolling((type: string, data: any) => {
      console.log(`🔄 Notion change detected: ${type}`, data);
      // Refresh app data when Notion changes are detected
      loadAppData();
    }, 1000); // Poll every 1 second instead of 3
  };

  const setupRealtimeSubscriptions = () => {
    console.log('Setting up real-time subscriptions...');
    
    // Subscribe to Supabase tables only (users + chat_messages)
    const subscription = supabase
      .channel('supabase-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_messages' },
        (payload) => {
          console.log('💬 Chat message change:', payload);
          loadAppData(); // Refresh all data including chat
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('👤 User change:', payload);
          loadAppData(); // Refresh all data
        }
      )
      .subscribe((status) => {
        console.log('Supabase subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from real-time updates');
      subscription.unsubscribe();
    };
  };

  const loadAppData = async () => {
    try {
      console.log('Loading app data...');
      const [users, tasks, applications, meetings, payouts, notifications, chatMessages] = await Promise.all([
        usersService.getUsers(),
        notionDatabase.getTasks(),
        notionDatabase.getApplications(),
        notionDatabase.getMeetings(),
        notionDatabase.getPayouts(),
        notionDatabase.getNotifications(),
        chatService.getMessages()
      ]);

      console.log('Loaded data:', {
        users: users.data?.length || 0,
        tasks: tasks.data?.length || 0,
        applications: applications.data?.length || 0,
        meetings: meetings.data?.length || 0,
        payouts: payouts.data?.length || 0,
        notifications: notifications.data?.length || 0,
        chatMessages: chatMessages.data?.length || 0
      });

      setAppState({
        users: users.data || [],
        tasks: tasks.data || [],
        applications: applications.data || [],
        meetings: meetings.data || [],
        payouts: payouts.data || [],
        notifications: notifications.data || [],
        chatMessages: chatMessages.data || []
      });
    } catch (error) {
      console.error('Error loading app data:', error);
      alert('Error loading data. Please refresh the page.');
    }
  };

  const handleLogout = async () => {
    console.log('🚪 Logging out user...');
    await authService.signOut();
    setUser(null);
    localStorage.removeItem('currentPage');
    localStorage.removeItem('idyll_user'); // Clear saved user session
    setCurrentPage('welcome');
  };

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    
    try {
      const email = username.includes('@') ? username.toLowerCase() : `${username}@editorgmail.com`;
      console.log('🔐 Attempting login with email:', email);
      
      // Check if user exists in our database first
      const { data: userData, error: userError } = await usersService.getUserByEmail(email);
      
      console.log('🔍 Database query result:', { userData, userError });
      
      if (!userData) {
        // If it's an admin email, create the user automatically
        if (email === 'idyllproductionsofficial@gmail.com' || 
            email === 'harshpawar7711@gmail.com' || 
            email === 'rohitidyllproductions@gmail.com') {
          
          console.log('👑 Admin email detected, creating admin user...');
          
          let role: 'owner' | 'moderator' = 'moderator';
          if (email === 'idyllproductionsofficial@gmail.com') {
            role = 'owner';
          }
          
          const newUser = {
            uid: `admin-${Date.now()}`,
            email: email,
            display_name: username || email.split('@')[0],
            photo_url: `https://i.pravatar.cc/150?u=${email}`,
            role: role,
            approved: true
          };
          
          const { data: createdUser, error: createError } = await usersService.createUser(newUser);
          
          if (createError) {
            console.error('❌ Error creating admin user:', createError);
            alert('Error creating admin user. Please try again.');
            setLoading(false);
            return;
          }
          
          console.log('✅ Admin user created:', createdUser);
          
          // Use the created user data
          const userProfile = {
            uid: createdUser.uid,
            email: createdUser.email,
            displayName: createdUser.display_name,
            photoURL: createdUser.photo_url || 'https://i.pravatar.cc/150?u=' + createdUser.email,
            role: createdUser.role as 'editor' | 'moderator' | 'owner',
            approved: createdUser.approved
          };

          setUser(userProfile);
          localStorage.setItem('idyll_user', JSON.stringify(userProfile));
          
          if (role === 'owner' || role === 'moderator') {
            setCurrentPage('management');
          } else {
            setCurrentPage('dashboard');
          }
          
          await loadAppData();
          
          alert(`Welcome! Admin account created and logged in as ${role}.`);
          setLoading(false);
          return;
        }
        
        alert('User not found. Please create an account first or contact admin.');
        setLoading(false);
        return;
      }

      console.log('👤 Found user:', userData);

      if (!userData.approved) {
        alert('Account not approved yet. Please wait for approval from moderators.');
        setCurrentPage('approval');
        setLoading(false);
        return;
      }

      // Create user profile object
      const userProfile = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.display_name,
        photoURL: userData.photo_url || 'https://i.pravatar.cc/150?u=' + userData.email,
        role: userData.role as 'editor' | 'moderator' | 'owner',
        approved: userData.approved
      };

      console.log('👤 Setting user profile:', userProfile);

      // Set user
      setUser(userProfile);
      
      // Save user session to localStorage
      localStorage.setItem('idyll_user', JSON.stringify(userProfile));
      console.log('💾 Saved user to localStorage');
      
      // Navigate to appropriate page based on role
      let targetPage = 'dashboard';
      if (userData.role === 'editor') {
        targetPage = 'dashboard';
      } else if (userData.role === 'moderator' || userData.role === 'owner') {
        targetPage = 'management';
      }
      
      console.log('🎯 Navigating to page:', targetPage);
      setCurrentPage(targetPage);
      
      console.log('📊 Loading app data...');
      await loadAppData();
      
      // Try to add notification but don't fail if it doesn't work
      try {
        await addNotification({
          type: 'user',
          title: 'User Login',
          message: `${userData.display_name} logged in`,
          urgent: false
        });
      } catch (notifError) {
        console.log('⚠️ Notification failed but continuing:', notifError);
      }

      console.log('✅ Login successful for:', userData.display_name);
      
    } catch (error) {
      console.error('❌ Login error:', error);
      alert('Login failed. Error: ' + error.message);
    }
    
    setLoading(false);
  };

  const handleCreateAccount = async (email: string, username: string, password: string) => {
    setLoading(true);
    
    try {
      const emailLower = email.toLowerCase();
      console.log('📝 Creating account for:', emailLower);
      
      // Check if user already exists
      const { data: existingUser } = await usersService.getUserByEmail(emailLower);
      if (existingUser) {
        alert('User with this email already exists. Please try logging in instead.');
        setCurrentPage('login');
        setLoading(false);
        return;
      }

      // Check if this is a special role email
      let role: 'editor' | 'moderator' | 'owner' = 'editor';
      let shouldAutoApprove = false;
      
      if (emailLower === 'idyllproductionsofficial@gmail.com') {
        role = 'owner';
        shouldAutoApprove = true;
      } else if (emailLower === 'harshpawar7711@gmail.com' || emailLower === 'rohitidyllproductions@gmail.com') {
        role = 'moderator';
        shouldAutoApprove = true;
      }

      let userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create user profile object
      const userProfile = {
        uid: userId,
        email: emailLower,
        displayName: username,
        photoURL: `https://i.pravatar.cc/150?u=${emailLower}`,
        role: role,
        approved: shouldAutoApprove
      };

      // For admin users, skip Supabase auth entirely and auto-approve
      if (shouldAutoApprove) {
        console.log('👑 Admin user detected, auto-approving');
        
        // Create user record directly in database
        const { data: userData, error: userError } = await usersService.createUser(userProfile);

        if (userError) {
          console.error('Error creating admin user record:', userError);
          alert('Error creating user profile. Please try again.');
          setLoading(false);
          return;
        }

        // Auto-login admin user
        setUser({
          uid: userId,
          email: emailLower,
          displayName: username,
          photoURL: `https://i.pravatar.cc/150?u=${emailLower}`,
          role: role,
          approved: true
        });
        
        // Save user session to localStorage
        localStorage.setItem('idyll_user', JSON.stringify({
          uid: userId,
          email: emailLower,
          displayName: username,
          photoURL: `https://i.pravatar.cc/150?u=${emailLower}`,
          role: role,
          approved: true
        }));
        
        // Navigate to appropriate page
        if (role === 'owner' || role === 'moderator') {
          setCurrentPage('management');
        } else {
          setCurrentPage('dashboard');
        }
        
        await loadAppData();
        
        // Add welcome notification
        await addNotification({
          type: 'user',
          title: 'Welcome to Idyll Productions!',
          message: `Admin account created for ${username}`,
          urgent: false
        });
        
        alert(`Welcome ${username}! You have been automatically approved as ${role}.`);
        setLoading(false);
        return;
      }

      // For regular users, try Supabase auth but continue even if it fails
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: emailLower,
          password,
          options: {
            data: {
              display_name: username,
            },
            emailRedirectTo: undefined // Disable email confirmation
          }
        });
        
        if (authData?.user?.id) {
          userId = authData.user.id;
        }
      } catch (authError) {
        console.log('⚠️ Supabase auth failed, but continuing with account creation');
      }
      
      // Create user record in database (not approved for regular users)
      const { data: userData, error: userError } = await usersService.createUser({
        uid: userId,
        email: emailLower,
        display_name: username,
        photo_url: `https://i.pravatar.cc/150?u=${emailLower}`,
        role: role,
        approved: false // Regular users need approval
      });

      if (userError) {
        console.error('Error creating user record:', userError);
        alert('Error creating user profile. Please try again.');
        setLoading(false);
        return;
      }

      // Add welcome notification
      await addNotification({
        type: 'user',
        title: 'Welcome to Idyll Productions!',
        message: `Account created for ${username}`,
        urgent: false
      });

      // Show success message and redirect to login
      alert('Account created successfully! You can now login while waiting for approval.');
      setCurrentPage('login');
      
      // Create an application record for moderator review
      await notionDatabase.createApplication({
        name: username,
        email: emailLower,
        software: 'Not specified',
        role: 'Editor',
        portfolio: 'Not provided',
        location: 'Not specified'
      });

      await addNotification({
        type: 'user',
        title: 'New User Registration',
        message: `${username} registered and needs approval`,
        urgent: true
      });

      console.log('✅ Account created successfully for:', username);

    } catch (error) {
      console.error('❌ Account creation error:', error);
      alert('Account creation failed. Please try again.');
    }
    
    setLoading(false);
  };

  // Functions to update app state with Supabase
  const approveUser = async (applicationId: number) => {
    try {
      console.log('Approving user with application ID:', applicationId);
      const application = appState.applications.find(app => app.id === applicationId);
      if (!application) {
        alert('Application not found');
        return;
      }

      // Check if user already exists in users table
      const { data: existingUser } = await usersService.getUserByEmail(application.email);
      
      if (existingUser) {
        // User exists, just approve them
        console.log('User exists, approving...');
        const { error: updateError } = await usersService.updateUser(existingUser.id, { approved: true });
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new user
        console.log('Creating new user...');
        const { error: createError } = await usersService.createUser({
          uid: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          email: application.email,
          display_name: application.name,
          photo_url: `https://i.pravatar.cc/150?u=${application.email}`,
          role: 'editor',
          approved: true
        });
        if (createError) {
          throw createError;
        }
      }

      // Update application status
      console.log('Updating application status...');
      const { error: appError } = await notionDatabase.updateApplication(applicationId, { status: 'approved' });
      if (appError) {
        throw appError;
      }

      // Add notification
      await addNotification({
        type: 'user',
        title: 'Editor Approved',
        message: `${application.name} has been approved as an editor`,
        urgent: false
      });

      // Force refresh data
      await loadAppData();
      
      alert(`${application.name} has been approved successfully! They can now login.`);
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error approving user: ' + (error as any).message);
    }
  };

  const rejectApplication = async (applicationId: number) => {
    try {
      console.log('Rejecting application ID:', applicationId);
      const application = appState.applications.find(app => app.id === applicationId);
      
      await notionDatabase.updateApplication(applicationId, { status: 'rejected' });
      
      // Add notification
      if (application) {
        await addNotification({
          type: 'user',
          title: 'Application Rejected',
          message: `Application from ${application.name} was rejected`,
          urgent: false
        });
      }
      
      await loadAppData();
      alert('Application rejected successfully');
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Error rejecting application: ' + error.message);
    }
  };

  const createTask = async (taskData: any) => {
    try {
      console.log('Creating task:', taskData);
      const newTask = {
        task_number: `T${String(appState.tasks.length + 1).padStart(3, '0')}`,
        name: taskData.name,
        assigned_to: taskData.assignedTo,
        deadline: taskData.deadline,
        priority: taskData.priority || 'medium',
        raw_file: taskData.rawFile || null
      };
      
      const { data, error } = await notionDatabase.createTask(newTask);
      if (error) {
        throw error;
      }
      
      // Add notification for task assignment
      await addNotification({
        type: 'task',
        title: 'New Task Assigned',
        message: `Task "${newTask.name}" assigned to ${newTask.assigned_to}`,
        urgent: true
      });
      
      // Immediately refresh data to show the new task
      console.log('🔄 Refreshing data after task creation...');
      await loadAppData();
      
      alert('Task created successfully and synced to Notion!');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task: ' + error.message);
    }
  };

  const updateTask = async (taskId: string, updates: any) => {
    try {
      console.log('Updating task:', taskId, updates);
      // Find task by task_number or id
      const task = appState.tasks.find(t => t.task_number === taskId || t.id.toString() === taskId);
      if (task) {
        const { data, error } = await notionDatabase.updateTask(task.id, updates);
        if (error) {
          throw error;
        }
        
        // Add notification for task updates
        if (updates.status) {
          await addNotification({
            type: 'task',
            title: 'Task Updated',
            message: `Task "${task.name}" status changed to ${updates.status}`,
            urgent: false
          });
        }
        
        // Immediately refresh data to show the updates
        console.log('🔄 Refreshing data after task update...');
        await loadAppData();
        
        console.log('Task updated successfully');
      } else {
        throw new Error('Task not found');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task: ' + error.message);
    }
  };

  const createMeeting = async (meetingData: any) => {
    try {
      console.log('Creating meeting:', meetingData);
      const newMeeting = {
        title: meetingData.title,
        date: meetingData.date,
        time: meetingData.time,
        attendees: meetingData.attendees,
        organizer: user?.displayName || 'System',
        link: meetingData.link || null
      };
      
      const { data, error } = await notionDatabase.createMeeting(newMeeting);
      if (error) {
        throw error;
      }
      
      // Add notification for meeting
      await addNotification({
        type: 'meeting',
        title: 'Meeting Scheduled',
        message: `${newMeeting.title} scheduled for ${newMeeting.date}`,
        urgent: false
      });
      
      await loadAppData();
      alert('Meeting scheduled successfully and synced to Notion!');
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Error creating meeting: ' + error.message);
    }
  };

  const deleteMeeting = async (meetingId: number) => {
    try {
      console.log('Deleting meeting:', meetingId);
      const { error } = await notionDatabase.deleteMeeting(meetingId);
      if (error) {
        throw error;
      }
      
      await loadAppData();
      alert('Meeting cancelled successfully!');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('Error deleting meeting: ' + error.message);
    }
  };

  const createPayout = async (payoutData: any) => {
    try {
      console.log('Creating payout:', payoutData);
      const newPayout = {
        editor: payoutData.editor,
        editor_email: user?.email || payoutData.editor_email,
        project: payoutData.project,
        amount: payoutData.amount,
        edited_link: payoutData.editedLink,
        payment_method: payoutData.paymentMethod
      };
      
      const { data, error } = await notionDatabase.createPayout(newPayout);
      if (error) {
        throw error;
      }
      
      // Add notification for payout request
      await addNotification({
        type: 'payout',
        title: 'Payout Requested',
        message: `${newPayout.editor} requested payout for ${newPayout.project}`,
        urgent: true
      });
      
      await loadAppData();
      alert('Payout request submitted successfully!');
    } catch (error) {
      console.error('Error creating payout:', error);
      alert('Error creating payout: ' + error.message);
    }
  };

  const updatePayout = async (payoutId: number, updates: any) => {
    try {
      console.log('Updating payout:', payoutId, updates);
      const { data, error } = await notionDatabase.updatePayout(payoutId, updates);
      if (error) {
        throw error;
      }
      
      // Add notification for payout update
      if (updates.status) {
        const payout = appState.payouts.find(p => p.id === payoutId);
        if (payout) {
          await addNotification({
            type: 'payout',
            title: 'Payout Updated',
            message: `Payout for ${payout.project} status: ${updates.status}`,
            urgent: updates.status === 'approved' || updates.status === 'paid'
          });
        }
      }
      
      await loadAppData();
      alert('Payout updated successfully!');
    } catch (error) {
      console.error('Error updating payout:', error);
      alert('Error updating payout: ' + error.message);
    }
  };

  const addChatMessage = async (message: string, sender: string) => {
    try {
      console.log('Sending chat message:', { message, sender });
      const { data, error } = await chatService.sendMessage({
        sender,
        message,
        type: 'user'
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Chat message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message: ' + error.message);
    }
  };

  const editChatMessage = async (messageId: number, newMessage: string) => {
    try {
      console.log('Editing chat message:', messageId, newMessage);
      const { data, error } = await chatService.editMessage(messageId, newMessage);
      
      if (error) {
        throw error;
      }
      
      console.log('Chat message edited successfully');
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Error editing message: ' + error.message);
    }
  };

  const deleteChatMessage = async (messageId: number) => {
    try {
      console.log('Deleting chat message:', messageId);
      const { error } = await chatService.deleteMessage(messageId);
      
      if (error) {
        throw error;
      }
      
      console.log('Chat message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message: ' + error.message);
    }
  };

  const addNotification = async (notification: any) => {
    try {
      console.log('Adding notification:', notification);
      const { data, error } = await notionDatabase.createNotification({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        urgent: notification.urgent || false,
        time: 'Just now'
      });
      
      if (error) {
        throw error;
      }
      
      // Don't need to manually update state - real-time subscription will handle it
      console.log('Notification added successfully');
    } catch (error) {
      console.error('Error creating notification:', error);
      // Don't show alert for notification errors as they're not critical
    }
  };

  const removeUser = async (userId: number, userEmail: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName}? This will delete all their data from tasks, meetings, payouts, and applications.`)) {
      return;
    }

    try {
      console.log('Removing user and all related data:', userEmail);
      
      // 1. Remove user from Supabase
      const { error: userError } = await usersService.deleteUser(userId);
      if (userError) {
        console.error('Error removing user from Supabase:', userError);
      }

      // 2. Remove all tasks assigned to this user from Notion
      const userTasks = appState.tasks.filter(task => task.assigned_to === userEmail);
      for (const task of userTasks) {
        try {
          await notionDatabase.deleteTask(task.id);
        } catch (error) {
          console.error('Error removing task:', error);
        }
      }

      // 3. Remove all meetings where user is attendee from Notion
      const userMeetings = appState.meetings.filter(meeting => 
        (Array.isArray(meeting.attendees_emails) ? meeting.attendees_emails : [meeting.attendees_emails]).includes(userEmail)
      );
      for (const meeting of userMeetings) {
        try {
          await notionDatabase.deleteMeeting(meeting.id);
        } catch (error) {
          console.error('Error removing meeting:', error);
        }
      }

      // 4. Remove all payouts for this user from Notion
      const userPayouts = appState.payouts.filter(payout => payout.editor_email === userEmail);
      for (const payout of userPayouts) {
        try {
          await notionDatabase.deletePayout(payout.id);
        } catch (error) {
          console.error('Error removing payout:', error);
        }
      }

      // 5. Remove all applications for this user from Notion
      const userApplications = appState.applications.filter(app => app.email === userEmail);
      for (const application of userApplications) {
        try {
          await notionDatabase.deleteApplication(application.id);
        } catch (error) {
          console.error('Error removing application:', error);
        }
      }

      // 6. Add notification about user removal
      await addNotification({
        type: 'user',
        title: 'User Removed',
        message: `${userName} and all their data has been removed from the system`,
        urgent: true
      });

      // 7. Refresh all data
      await loadAppData();
      
      alert(`${userName} and all their related data has been successfully removed from the system.`);
    } catch (error) {
      console.error('Error removing user:', error);
      alert('Error removing user: ' + error.message);
    }
  };

  const changeUserRole = async (userId: number, userEmail: string, userName: string, newRole: string) => {
    try {
      console.log('Changing user role:', userEmail, 'to', newRole);
      
      // Update user role in Supabase
      const { error } = await usersService.updateUser(userId, { role: newRole as 'editor' | 'moderator' | 'owner' });
      if (error) {
        throw error;
      }

      // Add notification about role change
      await addNotification({
        type: 'user',
        title: 'Role Changed',
        message: `${userName}'s role has been changed to ${newRole}`,
        urgent: false
      });

      // If current user's role was changed, update their session
      if (user && user.email === userEmail) {
        setUser({
          ...user,
          role: newRole as 'editor' | 'moderator' | 'owner'
        });
        
        // Refresh the page to update interface
        window.location.reload();
      }

      // Refresh all data
      await loadAppData();
      
      alert(`${userName}'s role has been successfully changed to ${newRole}.`);
    } catch (error) {
      console.error('Error changing user role:', error);
      alert('Error changing user role: ' + error.message);
    }
  };

  const handleApplySubmission = async (applicationData: any) => {
    try {
      await notionDatabase.createApplication({
        name: applicationData.name,
        email: applicationData.email,
        contact: applicationData.contact,
        location: applicationData.location,
        software: applicationData.software,
        role: applicationData.role,
        portfolio: applicationData.portfolioLink
      });

      // Add notification for moderators
      await addNotification({
        type: 'user',
        title: 'New Editor Application',
        message: `${applicationData.name} applied to join as an editor`,
        urgent: true
      });

      await loadAppData();
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-slate-100 font-sans selection:bg-blue-500/20 relative">
      <AnimatedLiquidBackground />
      <div className="relative z-10 text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
        <p className="text-blue-400 font-medium text-lg animate-pulse">Loading Idyll Productions...</p>
        <p className="text-slate-400 text-sm mt-2">Connecting to database...</p>
      </div>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome': return <WelcomePage onNavigate={setCurrentPage} />;
      case 'create-account': return <CreateAccountPage onNavigate={setCurrentPage} onCreateAccount={handleCreateAccount} loading={loading} />;
      case 'login': return <LoginPage onNavigate={setCurrentPage} onLogin={handleLogin} loading={loading} />;
      case 'apply': return <ApplyPage onNavigate={setCurrentPage} onSubmitApplication={handleApplySubmission} />;
      case 'approval': return <ApprovalPage onNavigate={setCurrentPage} />;
      case 'dashboard': 
        if (!user) return <WelcomePage onNavigate={setCurrentPage} />;
        if (user.role === 'moderator' || user.role === 'owner') {
          return <ManagementPanel 
            user={user} 
            onLogout={handleLogout} 
            appState={appState}
            onApproveUser={approveUser}
            onRejectApplication={rejectApplication}
            onCreateTask={createTask}
            onUpdateTask={updateTask}
            onCreateMeeting={createMeeting}
            onDeleteMeeting={deleteMeeting}
            onUpdatePayout={updatePayout}
            onAddChatMessage={addChatMessage}
            onEditChatMessage={editChatMessage}
            onDeleteChatMessage={deleteChatMessage}
            onAddNotification={addNotification}
            onRemoveUser={removeUser}
            onChangeUserRole={changeUserRole}
            onRefreshData={loadAppData}
          />;
        }
        return <EditorDashboard 
          user={user} 
          onLogout={handleLogout} 
          tasks={appState.tasks.filter(task => task.assigned_to === user.email)}
          meetings={appState.meetings.filter(meeting => 
            (Array.isArray(meeting.attendees_emails) ? meeting.attendees_emails : [meeting.attendees_emails]).includes(user.email) || 
            (Array.isArray(meeting.attendees) ? meeting.attendees : [meeting.attendees]).includes('All Team')
          )}
          payouts={appState.payouts.filter(payout => payout.editor_email === user.email)}
          chatMessages={appState.chatMessages}
          onUpdateTask={updateTask}
          onCreatePayout={createPayout}
          onAddChatMessage={addChatMessage}
          onEditChatMessage={editChatMessage}
          onDeleteChatMessage={deleteChatMessage}
          onRefreshData={loadAppData}
        />;
      default: return <WelcomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-blue-500/20 relative">
      <AnimatedLiquidBackground />
      <div className="relative z-10">
        <CustomCursor />
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
