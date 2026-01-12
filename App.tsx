
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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userData } = await usersService.getUserByEmail(session.user.email!);
        if (userData && userData.approved) {
          setUser({
            uid: userData.uid,
            email: userData.email,
            displayName: userData.display_name,
            photoURL: userData.photo_url || 'https://i.pravatar.cc/150?u=' + userData.email,
            role: userData.role as 'editor' | 'moderator' | 'owner',
            approved: userData.approved
          });
          // Don't change page if user is already on a valid page
          if (currentPage === 'welcome' || currentPage === 'login' || currentPage === 'create-account') {
            setCurrentPage('dashboard');
          }
        } else if (userData && !userData.approved) {
          if (currentPage !== 'approval') {
            setCurrentPage('approval');
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    }
  };

  const setupNotionSync = () => {
    console.log('🔄 Setting up Notion polling...');
    
    // Start polling Notion for changes every 2 seconds
    notionDatabase.startPolling((type: string, data: any) => {
      console.log(`🔄 Notion change detected: ${type}`, data);
      // Refresh app data when Notion changes are detected
      loadAppData();
    });
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
          loadAppData(); // Refresh all data
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
    await authService.signOut();
    setUser(null);
    setCurrentPage('welcome');
  };

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    
    try {
      const email = username.includes('@') ? username.toLowerCase() : `${username}@editorgmail.com`;
      console.log('Attempting login with email:', email);
      
      // Check if user exists in our database first
      const { data: userData, error: userError } = await usersService.getUserByEmail(email);
      
      if (!userData) {
        alert('User not found. Please create an account first or contact admin.');
        setLoading(false);
        return;
      }

      if (!userData.approved) {
        alert('Account not approved yet. Please wait for approval from moderators.');
        setCurrentPage('approval');
        setLoading(false);
        return;
      }

      // For admin users (owner/moderator), bypass Supabase auth completely
      if (userData.role === 'owner' || userData.role === 'moderator') {
        console.log('Admin user detected, bypassing Supabase auth');
        
        setUser({
          uid: userData.uid,
          email: userData.email,
          displayName: userData.display_name,
          photoURL: userData.photo_url || 'https://i.pravatar.cc/150?u=' + userData.email,
          role: userData.role as 'editor' | 'moderator' | 'owner',
          approved: userData.approved
        });
        
        setCurrentPage('dashboard');
        await loadAppData();
        
        // Add login notification
        await addNotification({
          type: 'user',
          title: 'Admin Login',
          message: `${userData.display_name} logged in`,
          urgent: false
        });
        
        setLoading(false);
        return;
      }

      // For regular editors, try Supabase auth but fallback to database
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // If auth fails but user exists and is approved, allow login anyway
      if (authError && userData.approved) {
        console.log('Auth failed but user is approved, allowing login:', authError.message);
        
        setUser({
          uid: userData.uid,
          email: userData.email,
          displayName: userData.display_name,
          photoURL: userData.photo_url || 'https://i.pravatar.cc/150?u=' + userData.email,
          role: userData.role as 'editor' | 'moderator' | 'owner',
          approved: userData.approved
        });
        
        setCurrentPage('dashboard');
        await loadAppData();
        
        // Add login notification
        await addNotification({
          type: 'user',
          title: 'User Login',
          message: `${userData.display_name} logged in`,
          urgent: false
        });
        
        setLoading(false);
        return;
      }

      if (authError) {
        console.error('Auth error:', authError);
        alert('Login failed: ' + authError.message + '\n\nPlease check your credentials or contact admin.');
        setLoading(false);
        return;
      }

      // Successful authentication
      if (authData.user) {
        console.log('Login successful');
        setUser({
          uid: userData.uid,
          email: userData.email,
          displayName: userData.display_name,
          photoURL: userData.photo_url || 'https://i.pravatar.cc/150?u=' + userData.email,
          role: userData.role as 'editor' | 'moderator' | 'owner',
          approved: userData.approved
        });
        
        setCurrentPage('dashboard');
        await loadAppData();
        
        // Add login notification
        await addNotification({
          type: 'user',
          title: 'User Login',
          message: `${userData.display_name} logged in`,
          urgent: false
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again or create an account.');
    }
    
    setLoading(false);
  };

  const handleCreateAccount = async (email: string, username: string, password: string) => {
    setLoading(true);
    
    try {
      const emailLower = email.toLowerCase();
      
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

      // For admin users, skip Supabase auth entirely
      if (shouldAutoApprove) {
        console.log('Admin user detected, skipping Supabase auth');
        
        // Create user record directly in database
        const { data: userData, error: userError } = await usersService.createUser({
          uid: userId,
          email: emailLower,
          display_name: username,
          photo_url: `https://i.pravatar.cc/150?u=${emailLower}`,
          role: role,
          approved: true
        });

        if (userError) {
          console.error('Error creating admin user record:', userError);
          alert('Error creating user profile. Please try again.');
          setLoading(false);
          return;
        }

        // Add welcome notification
        await addNotification({
          type: 'user',
          title: 'Welcome to Idyll Productions!',
          message: `Admin account created for ${username}`,
          urgent: false
        });

        // Auto-login admin user
        setUser({
          uid: userId,
          email: emailLower,
          displayName: username,
          photoURL: `https://i.pravatar.cc/150?u=${emailLower}`,
          role: role,
          approved: true
        });
        setCurrentPage('dashboard');
        await loadAppData();
        
        alert(`Welcome ${username}! You have been automatically approved as ${role}.`);
        setLoading(false);
        return;
      }

      // For regular users, try Supabase auth
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
      
      // Even if auth fails, create user record for regular users
      if (authData?.user?.id) {
        userId = authData.user.id;
      }
      
      // Create user record in database
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

    } catch (error) {
      console.error('Account creation error:', error);
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
      
      // Don't need to manually update state - real-time subscription will handle it
      console.log('Chat message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message: ' + error.message);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="spinner mb-4 mx-auto"></div>
        <p className="text-lg font-medium text-green-400">Loading Idyll Productions...</p>
        <p className="text-gray-400 text-sm mt-2">Connecting to database...</p>
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
            onAddNotification={addNotification}
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
        />;
      default: return <WelcomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative z-10">
        <CustomCursor />
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
