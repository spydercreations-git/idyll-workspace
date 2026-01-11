
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
import { 
  authService, 
  usersService, 
  applicationsService, 
  tasksService, 
  meetingsService, 
  payoutsService, 
  chatService, 
  notificationsService 
} from './services/database';
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
          setCurrentPage('dashboard');
        } else if (userData && !userData.approved) {
          setCurrentPage('approval');
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to chat messages
    const chatSubscription = supabase
      .channel('chat_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setAppState(prev => ({
            ...prev,
            chatMessages: [...prev.chatMessages, payload.new]
          }));
        }
      )
      .subscribe();

    // Subscribe to notifications
    const notificationSubscription = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setAppState(prev => ({
            ...prev,
            notifications: [payload.new, ...prev.notifications]
          }));
        }
      )
      .subscribe();

    // Subscribe to applications
    const applicationSubscription = supabase
      .channel('applications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'applications' },
        () => {
          loadAppData(); // Refresh all data when applications change
        }
      )
      .subscribe();

    // Subscribe to tasks
    const taskSubscription = supabase
      .channel('tasks')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          loadAppData(); // Refresh all data when tasks change
        }
      )
      .subscribe();

    return () => {
      chatSubscription.unsubscribe();
      notificationSubscription.unsubscribe();
      applicationSubscription.unsubscribe();
      taskSubscription.unsubscribe();
    };
  };

  const loadAppData = async () => {
    try {
      const [users, tasks, applications, meetings, payouts, notifications, chatMessages] = await Promise.all([
        usersService.getUsers(),
        tasksService.getTasks(),
        applicationsService.getApplications(),
        meetingsService.getMeetings(),
        payoutsService.getPayouts(),
        notificationsService.getNotifications(),
        chatService.getMessages()
      ]);

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
      const email = username.includes('@') ? username : `${username}@editorgmail.com`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        alert('Login failed: ' + error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        const { data: userData, error: userError } = await usersService.getUserByEmail(data.user.email!);
        
        if (userError || !userData) {
          alert('User profile not found. Please contact administrator.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        if (!userData.approved) {
          alert('Account not approved yet. Please wait for approval.');
          await supabase.auth.signOut();
          setCurrentPage('approval');
          setLoading(false);
          return;
        }

        // Successful login
        setUser({
          uid: userData.uid,
          email: userData.email,
          displayName: userData.display_name,
          photoURL: userData.photo_url || 'https://i.pravatar.cc/150?u=' + userData.email,
          role: userData.role as 'editor' | 'moderator' | 'owner',
          approved: userData.approved
        });
        
        setCurrentPage('dashboard');
        await loadAppData(); // Refresh data after login
        
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
      alert('Login failed. Please try again.');
    }
    
    setLoading(false);
  };

  const handleCreateAccount = async (email: string, username: string, password: string) => {
    setLoading(true);
    
    try {
      // Check if this is a special role email
      const emailLower = email.toLowerCase();
      let role: 'editor' | 'moderator' | 'owner' = 'editor';
      let shouldAutoApprove = false;
      
      if (emailLower === 'idyllproductionsofficial@gmail.com') {
        role = 'owner';
        shouldAutoApprove = true;
      } else if (emailLower === 'harshpawar7711@gmail.com' || emailLower === 'rohitidyllproductions@gmail.com') {
        role = 'moderator';
        shouldAutoApprove = true;
      }

      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: username,
          }
        }
      });
      
      if (authError) {
        alert('Account creation failed: ' + authError.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Create user record in database immediately
        const { data: userData, error: userError } = await usersService.createUser({
          uid: authData.user.id,
          email: email,
          display_name: username,
          photo_url: `https://i.pravatar.cc/150?u=${email}`,
          role: role,
          approved: shouldAutoApprove
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

        if (shouldAutoApprove) {
          // Auto-login for special roles
          setUser({
            uid: authData.user.id,
            email: email,
            displayName: username,
            photoURL: `https://i.pravatar.cc/150?u=${email}`,
            role: role,
            approved: true
          });
          setCurrentPage('dashboard');
          await loadAppData();
        } else {
          // Regular approval process - but user is registered in database
          setCurrentPage('approval');
          
          // Also create an application record for moderator review
          await applicationsService.createApplication({
            name: username,
            email: email,
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
        }
      }
    } catch (error) {
      console.error('Account creation error:', error);
      alert('Account creation failed. Please try again.');
    }
    
    setLoading(false);
  };

  // Functions to update app state with Supabase
  const approveUser = async (applicationId: number) => {
    try {
      const application = appState.applications.find(app => app.id === applicationId);
      if (!application) {
        alert('Application not found');
        return;
      }

      // Check if user already exists in users table
      const { data: existingUser } = await usersService.getUserByEmail(application.email);
      
      if (existingUser) {
        // User exists, just approve them
        await usersService.updateUser(existingUser.id, { approved: true });
      } else {
        // Create new user (shouldn't happen with new flow, but safety check)
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: application.email,
          password: 'TempPassword123!', // They'll need to reset
          email_confirm: true
        });

        if (authData.user) {
          await usersService.createUser({
            uid: authData.user.id,
            email: application.email,
            display_name: application.name,
            photo_url: `https://i.pravatar.cc/150?u=${application.email}`,
            role: 'editor',
            approved: true
          });
        }
      }

      // Update application status
      await applicationsService.updateApplication(applicationId, { status: 'approved' });

      // Add notification
      await addNotification({
        type: 'user',
        title: 'Editor Approved',
        message: `${application.name} has been approved as an editor`,
        urgent: false
      });

      // Refresh data
      await loadAppData();
      
      alert(`${application.name} has been approved successfully!`);
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error approving user. Please try again.');
    }
  };

  const rejectApplication = async (applicationId: number) => {
    try {
      await applicationsService.updateApplication(applicationId, { status: 'rejected' });
      await loadAppData();
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const createTask = async (taskData: any) => {
    try {
      const newTask = {
        task_number: `T${String(appState.tasks.length + 1).padStart(3, '0')}`,
        name: taskData.name,
        assigned_to: taskData.assignedTo,
        deadline: taskData.deadline,
        priority: taskData.priority || 'medium',
        raw_file: taskData.rawFile || null
      };
      
      await tasksService.createTask(newTask);
      await loadAppData();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTask = async (taskId: string, updates: any) => {
    try {
      // Find task by task_number or id
      const task = appState.tasks.find(t => t.task_number === taskId || t.id.toString() === taskId);
      if (task) {
        await tasksService.updateTask(task.id, updates);
        
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
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task. Please try again.');
    }
  };

  const createMeeting = async (meetingData: any) => {
    try {
      const newMeeting = {
        title: meetingData.title,
        date: meetingData.date,
        time: meetingData.time,
        attendees: meetingData.attendees,
        organizer: user?.displayName || 'System'
      };
      
      await meetingsService.createMeeting(newMeeting);
      await loadAppData();
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const deleteMeeting = async (meetingId: number) => {
    try {
      await meetingsService.deleteMeeting(meetingId);
      await loadAppData();
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  };

  const createPayout = async (payoutData: any) => {
    try {
      const newPayout = {
        editor: payoutData.editor,
        project: payoutData.project,
        amount: payoutData.amount,
        edited_link: payoutData.editedLink,
        payment_method: payoutData.paymentMethod
      };
      
      await payoutsService.createPayout(newPayout);
      await loadAppData();
    } catch (error) {
      console.error('Error creating payout:', error);
    }
  };

  const updatePayout = async (payoutId: number, updates: any) => {
    try {
      await payoutsService.updatePayout(payoutId, updates);
      await loadAppData();
    } catch (error) {
      console.error('Error updating payout:', error);
    }
  };

  const addChatMessage = async (message: string, sender: string) => {
    try {
      await chatService.sendMessage({
        sender,
        message,
        type: 'user'
      });
      await loadAppData();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const addNotification = async (notification: any) => {
    try {
      await notificationsService.createNotification({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        urgent: notification.urgent || false,
        time: 'Just now'
      });
      await loadAppData();
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleApplySubmission = async (applicationData: any) => {
    try {
      await applicationsService.createApplication({
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
            onAddNotification={addNotification}
          />;
        }
        return <EditorDashboard 
          user={user} 
          onLogout={handleLogout} 
          tasks={appState.tasks.filter(task => task.assigned_to === user.displayName)}
          meetings={appState.meetings.filter(meeting => 
            meeting.attendees.includes(user.displayName) || meeting.attendees.includes('All Team')
          )}
          payouts={appState.payouts.filter(payout => payout.editor === user.displayName)}
          chatMessages={appState.chatMessages}
          onUpdateTask={updateTask}
          onCreatePayout={createPayout}
          onAddChatMessage={addChatMessage}
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
