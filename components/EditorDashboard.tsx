import React, { useState, useEffect } from 'react';
import { User, CheckSquare, Calendar, MessageSquare, DollarSign, LogOut, Edit, Trash2 } from 'lucide-react';
import { UserProfile } from '../types';
import { useTiltEffect } from '../hooks/useTiltEffect';
import { supabase } from '../lib/supabase';

interface EditorDashboardProps {
  user: UserProfile;
  onLogout: () => void;
  tasks: any[];
  meetings: any[];
  payouts: any[];
  chatMessages: any[];
  onUpdateTask: (taskId: string, updates: any) => void;
  onCreatePayout: (payoutData: any) => void;
  onAddChatMessage: (message: string, sender: string) => void;
  onEditChatMessage?: (messageId: number, newMessage: string) => void;
  onDeleteChatMessage?: (messageId: number) => void;
  onRefreshData?: () => void;
}

const EditorDashboard: React.FC<EditorDashboardProps> = ({ 
  user, 
  onLogout, 
  tasks, 
  meetings, 
  payouts, 
  chatMessages, 
  onUpdateTask, 
  onCreatePayout, 
  onAddChatMessage,
  onEditChatMessage,
  onDeleteChatMessage,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  const [newPayout, setNewPayout] = useState({
    project: '',
    editedLink: '',
    amount: '',
    paymentMethod: ''
  });
  const [profileData, setProfileData] = useState({
    username: user.displayName,
    email: user.email,
    newPassword: '',
    confirmPassword: '',
    notionDatabaseId: localStorage.getItem(`notion_db_${user.email}`) || ''
  });

  // Save Notion database ID to localStorage when it changes
  useEffect(() => {
    if (profileData.notionDatabaseId) {
      localStorage.setItem(`notion_db_${user.email}`, profileData.notionDatabaseId);
    }
  }, [profileData.notionDatabaseId, user.email]);

  // Set up real-time chat subscription
  useEffect(() => {
    console.log('🔄 Setting up real-time chat subscription...');
    
    const subscription = supabase
      .channel('chat-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_messages' },
        (payload) => {
          console.log('💬 Real-time chat update:', payload);
          // Force immediate refresh of chat data
          if (onRefreshData) {
            onRefreshData();
          }
        }
      )
      .subscribe((status) => {
        console.log('Chat subscription status:', status);
      });

    return () => {
      console.log('🔄 Cleaning up chat subscription');
      subscription.unsubscribe();
    };
  }, [onRefreshData]);

  const switchToManagement = () => {
    // This would be handled by proper role management in production
    alert('Role switching requires proper authentication in production');
  };

  const profileCardTiltRef = useTiltEffect({ maxTilt: 4, scale: 1.01 });
  const taskCard1TiltRef = useTiltEffect({ maxTilt: 3, scale: 1.01 });
  const taskCard2TiltRef = useTiltEffect({ maxTilt: 3, scale: 1.01 });
  const taskCard3TiltRef = useTiltEffect({ maxTilt: 3, scale: 1.01 });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    // Save Notion database ID
    if (profileData.notionDatabaseId) {
      localStorage.setItem(`notion_db_${user.email}`, profileData.notionDatabaseId);
      alert('Profile updated successfully! Your personal Notion database has been connected.');
    } else {
      alert('Profile updated successfully!');
    }
    
    setProfileData({
      ...profileData,
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleCreatePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayout.project && newPayout.editedLink && newPayout.amount && newPayout.paymentMethod) {
      onCreatePayout({
        ...newPayout,
        editor: user.displayName,
        amount: parseFloat(newPayout.amount)
      });
      setNewPayout({
        project: '',
        editedLink: '',
        amount: '',
        paymentMethod: ''
      });
      setShowPayoutForm(false);
      alert('Payout request submitted successfully!');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      onAddChatMessage(chatMessage, user.displayName);
      setChatMessage('');
    }
  };

  const handleEditMessage = (messageId: number, currentMessage: string) => {
    setEditingMessageId(messageId);
    setEditingMessageText(currentMessage);
  };

  const handleSaveEdit = () => {
    if (editingMessageId && editingMessageText.trim() && onEditChatMessage) {
      onEditChatMessage(editingMessageId, editingMessageText);
      setEditingMessageId(null);
      setEditingMessageText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingMessageText('');
  };

  const handleDeleteMessage = (messageId: number) => {
    if (confirm('Delete this message?') && onDeleteChatMessage) {
      onDeleteChatMessage(messageId);
    }
  };

  const renderProfile = () => (
    <div className="space-y-6 animate-slide-up">
      <div 
        ref={profileCardTiltRef as any}
        className="glass-card rounded-2xl p-8 tilt-card animate-fade-scale animate-delay-100"
      >
        <h3 className="text-2xl font-semibold text-white mb-6">Profile Settings</h3>
        <form onSubmit={handleProfileUpdate}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors btn-focus"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors btn-focus"
                disabled
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={profileData.newPassword}
                onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                placeholder="Leave blank to keep current"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors btn-focus"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={profileData.confirmPassword}
                onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors btn-focus"
              />
            </div>
          </div>
          
          {/* Add Notion Database Section */}
          <div className="mt-8 pt-8 border-t border-slate-700/50">
            <h4 className="text-lg font-semibold text-white mb-4">Personal Notion Database</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Notion Database ID</label>
                <input
                  type="text"
                  value={profileData.notionDatabaseId || ''}
                  onChange={(e) => setProfileData({...profileData, notionDatabaseId: e.target.value})}
                  placeholder="Enter your personal Notion database ID"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors btn-focus"
                />
                <p className="text-slate-500 text-xs mt-2">
                  This will give you access to your personal tasks, meetings, notes, and payouts from your own Notion workspace.
                </p>
              </div>
              {profileData.notionDatabaseId && (
                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                  <p className="text-blue-400 text-sm font-medium">✓ Personal Notion Database Connected</p>
                  <p className="text-blue-300/80 text-xs mt-1">You now have access to your personal workspace data.</p>
                </div>
              )}
            </div>
          </div>
          
          <button 
            type="submit"
            className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-colors btn-focus"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );

  const handleTaskUpdate = (taskId: string, field: string, value: string) => {
    onUpdateTask(taskId, { [field]: value });
  };

  const renderTasks = () => (
    <div className="space-y-6 animate-slide-up">
      <div className="glass-card rounded-2xl p-8 animate-fade-scale">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-white">📋 My Tasks</h3>
          <button 
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              window.location.reload();
            }}
            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-xl transition-colors btn-focus"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Notion Embed for Personal Tasks */}
        <div className="mb-6">
          <div className="border-2 border-blue-500/30 rounded-2xl overflow-hidden bg-slate-900/50">
            <div className="relative">
              <iframe 
                src="https://idyllproductionsevo.notion.site/ebd//2cc28c5fb67380b6b9eadeea94981afb?v=2cc28c5fb67380e481ef000c6254bab6"
                width="100%" 
                height="600px"
                style={{
                  border: 'none',
                  background: 'transparent'
                }}
                className="notion-embed"
                title="My Tasks Database"
                frameBorder="0"
                allowFullScreen
                loading="lazy"
              />
              <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-xs text-slate-300">📋 Live from Notion</span>
              </div>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-2 text-center">
            ✅ Your personal tasks from Notion - Changes sync in real-time
          </p>
        </div>

        {/* Fallback: Show tasks from database if Notion embed fails */}
        {tasks.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/20 rounded-2xl">
            <p className="text-slate-400 text-lg">No tasks assigned yet</p>
            <p className="text-slate-500 text-sm mt-2">Your assigned tasks will appear in the Notion embed above</p>
          </div>
        ) : (
          <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden">
            {/* Notion-Style Header */}
            <div className="bg-slate-800/50 border-b border-slate-700/50 px-4 py-3">
              <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-1">Task #</div>
                <div className="col-span-4">Name</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Deadline</div>
                <div className="col-span-1">Raw File</div>
                <div className="col-span-2">Edited File</div>
              </div>
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-slate-700/30">
              {tasks.map((task: any, index: number) => (
                <div key={task.id} className={`px-4 py-4 hover:bg-slate-800/20 transition-colors tilt-card animate-slide-up animate-delay-${(index + 1) * 100}`}>
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Task Number */}
                    <div className="col-span-1">
                      <span className="text-slate-400 text-sm font-mono">
                        {task.task_number || `T${String(index + 1).padStart(3, '0')}`}
                      </span>
                    </div>

                    {/* Task Name */}
                    <div className="col-span-4">
                      <div className="text-white text-sm font-medium">
                        {task.name}
                      </div>
                      <div className="text-slate-400 text-xs mt-1">
                        Priority: <span className={`${
                          task.priority === 'high' ? 'text-red-400' :
                          task.priority === 'medium' ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {task.priority === 'high' ? '🔴 High' : 
                           task.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <select
                        value={task.status || 'pending'}
                        onChange={(e) => handleTaskUpdate(task.id.toString(), 'status', e.target.value)}
                        className="w-full bg-transparent text-sm border-none outline-none focus:bg-slate-800/50 rounded px-2 py-1 transition-colors btn-focus"
                      >
                        <option value="pending" className="bg-slate-800">⏳ Pending</option>
                        <option value="in-progress" className="bg-slate-800">🔄 In Progress</option>
                        <option value="completed" className="bg-slate-800">✅ Completed</option>
                      </select>
                    </div>

                    {/* Deadline */}
                    <div className="col-span-2">
                      <div className="text-slate-300 text-sm">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                      </div>
                      <div className={`text-xs mt-1 ${
                        task.deadline && new Date(task.deadline) < new Date() ? 'text-red-400' : 'text-slate-500'
                      }`}>
                        {task.deadline && new Date(task.deadline) < new Date() ? '⚠️ Overdue' : ''}
                      </div>
                    </div>

                    {/* Raw File */}
                    <div className="col-span-1">
                      {task.raw_file ? (
                        <a 
                          href={task.raw_file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                          📎 View
                        </a>
                      ) : (
                        <span className="text-slate-500 text-sm">No file</span>
                      )}
                    </div>

                    {/* Edited File */}
                    <div className="col-span-2">
                      {task.edited_file ? (
                        <a 
                          href={task.edited_file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 text-sm transition-colors"
                        >
                          ✅ Completed
                        </a>
                      ) : (
                        <input
                          type="url"
                          placeholder="Upload edited file..."
                          className="w-full bg-transparent text-slate-400 text-sm border-none outline-none focus:bg-slate-800/50 rounded px-2 py-1 transition-colors btn-focus placeholder-slate-500"
                          onBlur={(e) => {
                            if (e.target.value) {
                              handleTaskUpdate(task.id.toString(), 'edited_file', e.target.value);
                              handleTaskUpdate(task.id.toString(), 'status', 'completed');
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMeetings = () => (
    <div className="space-y-6 animate-slide-up">
      <div className="glass-card rounded-2xl p-8 animate-fade-scale">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-white">📅 Meeting Calendar</h3>
          <button 
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              window.location.reload();
            }}
            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-xl transition-colors btn-focus"
          >
            🔄 Refresh
          </button>
        </div>
        
        {/* Notion Embed for Meetings */}
        <div className="mb-6">
          <div className="border-2 border-blue-500/30 rounded-2xl overflow-hidden bg-slate-900/50">
            <div className="relative">
              <iframe 
                src="https://idyllproductionsevo.notion.site/ebd//2e628c5fb67380e58d64eef87105515d?v=2e628c5fb67380a8ad7f000c8e26beea"
                width="100%" 
                height="500px"
                style={{
                  border: 'none',
                  background: 'transparent'
                }}
                className="notion-embed"
                title="Meeting Calendar"
                frameBorder="0"
                allowFullScreen
                loading="lazy"
              />
              <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-xs text-slate-300">📅 Live from Notion</span>
              </div>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-2 text-center">
            ✅ Your meetings from Notion - Changes sync in real-time
          </p>
        </div>

        {/* Personal Notion Database Option */}
        {profileData.notionDatabaseId && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-4">📋 Personal Meeting Calendar</h4>
            <div className="border-2 border-green-500/30 rounded-2xl overflow-hidden bg-slate-900/50">
              <div className="relative">
                <iframe 
                  src={`https://www.notion.so/embed/${profileData.notionDatabaseId}?embed=true&v=table`}
                  width="100%" 
                  height="400px"
                  style={{
                    border: 'none',
                    background: 'transparent'
                  }}
                  className="notion-embed"
                  title="Personal Meeting Calendar"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
                <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="text-xs text-slate-300">📋 Personal Workspace</span>
                </div>
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-2 text-center">
              ✅ Connected to your personal Notion workspace
            </p>
          </div>
        )}

        {/* Fallback: Show meetings from database if Notion embed fails */}
        {meetings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No meetings scheduled</p>
            <p className="text-slate-500 text-sm mt-2">Your scheduled meetings will appear above in the Notion embed</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">Upcoming Meetings</h4>
            {meetings.map((meeting: any, index: number) => (
              <div key={meeting.id} className={`glass-panel rounded-xl p-6 border border-slate-700/50 animate-slide-up animate-delay-${(index + 1) * 100}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-white">{meeting.title}</h4>
                    <p className="text-slate-400 text-sm">{new Date(meeting.date).toLocaleDateString()} at {meeting.time}</p>
                    <p className="text-slate-500 text-xs">Attendees: {Array.isArray(meeting.attendees) ? meeting.attendees.join(', ') : meeting.attendees}</p>
                  </div>
                  {meeting.link && (
                    <button 
                      onClick={() => window.open(meeting.link, '_blank')}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors btn-focus"
                    >
                      Join Meeting
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-6 animate-slide-up">
      <div className="glass-card rounded-2xl p-8 animate-fade-scale">
        <h3 className="text-2xl font-semibold text-white mb-6">💬 Live Chat with Management</h3>
        <div className="glass-panel rounded-xl p-4 h-96 mb-4 overflow-y-auto">
          <div className="space-y-4">
            {chatMessages.map((message: any) => (
              <div key={message.id} className="flex items-start gap-3 animate-slide-up animate-delay-100 group">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                  message.type === 'system' ? 'bg-gray-600' : 
                  message.sender === user.displayName ? 'bg-slate-600' : 'bg-blue-600'
                }`}>
                  {message.sender.charAt(0).toUpperCase()}
                </div>
                <div className={`flex-1 ${message.sender === user.displayName ? 'ml-auto text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-slate-300 text-sm font-medium">
                      {message.sender === user.displayName ? 'You' : message.sender}
                    </p>
                    <p className="text-slate-500 text-xs">{new Date(message.timestamp).toLocaleTimeString()}</p>
                    {message.sender === user.displayName && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button 
                          onClick={() => handleEditMessage(message.id, message.message)}
                          className="text-blue-400 hover:text-blue-300 text-xs p-1 rounded"
                          title="Edit message"
                        >
                          <Edit size={12} />
                        </button>
                        <button 
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-red-400 hover:text-red-300 text-xs p-1 rounded"
                          title="Delete message"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  {editingMessageId === message.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingMessageText}
                        onChange={(e) => setEditingMessageText(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors btn-focus text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={handleSaveEdit}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-500 transition-colors"
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-500 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-300 text-sm bg-slate-800/30 rounded-lg px-3 py-2 inline-block">
                      {message.message}
                      {message.is_edited && <span className="text-slate-500 text-xs ml-2">(edited)</span>}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type your message to management..."
            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors btn-focus"
          />
          <button 
            type="submit"
            disabled={!chatMessage.trim()}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-colors btn-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
        <p className="text-slate-500 text-xs mt-2 text-center">
          💡 Messages are delivered instantly via WebSocket connection
        </p>
      </div>
    </div>
  );

  const renderPayout = () => (
    <div className="space-y-6 animate-slide-up">
      <div className="glass-card rounded-2xl p-8 animate-fade-scale">
        <h3 className="text-2xl font-semibold text-white mb-6">Payout Management</h3>
        
        {showPayoutForm && (
          <div className="glass-panel rounded-xl p-6 border border-slate-700/50 mb-6">
            <h4 className="text-lg font-medium text-white mb-4">Request New Payout</h4>
            <form onSubmit={handleCreatePayout} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Project Name</label>
                  <input
                    type="text"
                    value={newPayout.project}
                    onChange={(e) => setNewPayout({...newPayout, project: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors btn-focus"
                    placeholder="Enter project name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Amount ($)</label>
                  <input
                    type="number"
                    value={newPayout.amount}
                    onChange={(e) => setNewPayout({...newPayout, amount: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors btn-focus"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Edited File Link</label>
                <input
                  type="url"
                  value={newPayout.editedLink}
                  onChange={(e) => setNewPayout({...newPayout, editedLink: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors btn-focus"
                  placeholder="https://drive.google.com/..."
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Payment Method</label>
                <input
                  type="text"
                  value={newPayout.paymentMethod}
                  onChange={(e) => setNewPayout({...newPayout, paymentMethod: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors btn-focus"
                  placeholder="PayPal - your@email.com"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-500 transition-colors btn-focus"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayoutForm(false)}
                  className="px-6 py-3 bg-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-600 transition-colors btn-focus"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notion Embed for Personal Payouts */}
        <div className="mb-6">
          <div className="border-2 border-blue-500/30 rounded-2xl overflow-hidden bg-slate-900/50">
            <div className="relative">
              <iframe 
                src="https://idyllproductionsevo.notion.site/ebd//2e628c5fb67380568bd2ef6a1eb05965?v=2e628c5fb673801bb2ae000c1b309c09"
                width="100%" 
                height="500px"
                style={{
                  border: 'none',
                  background: 'transparent'
                }}
                className="notion-embed"
                title="My Payouts Database"
                frameBorder="0"
                allowFullScreen
                loading="lazy"
              />
              <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-xs text-slate-300">💰 Live from Notion</span>
              </div>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-2 text-center">
            ✅ Your personal payouts from Notion - Changes sync in real-time
          </p>
        </div>

        {/* Fallback: Show payouts from database if Notion embed fails */}
        {payouts.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/20 rounded-2xl">
            <p className="text-slate-400 text-lg">No payout requests yet</p>
            <p className="text-slate-500 text-sm mt-2">Your payout requests will appear in the Notion embed above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payouts.map((payout: any, index: number) => (
              <div key={payout.id} className={`glass-panel rounded-xl p-6 border border-slate-700/50 animate-slide-up animate-delay-${(index + 1) * 100}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-white">{payout.project}</h4>
                    <p className="text-slate-400 text-sm">Amount: ${payout.amount}</p>
                    <p className="text-slate-500 text-xs">Requested: {new Date(payout.requested_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    payout.status === 'paid' ? 'bg-green-900/50 text-green-400' :
                    payout.status === 'approved' ? 'bg-blue-900/50 text-blue-400' :
                    payout.status === 'rejected' ? 'bg-red-900/50 text-red-400' :
                    'bg-amber-900/50 text-amber-400'
                  }`}>
                    {payout.status}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1">Edited File Link</label>
                    <a href={payout.edited_link} className="text-blue-400 hover:text-blue-300 text-sm break-all transition-colors">
                      {payout.edited_link}
                    </a>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1">Payment Method</label>
                    <p className="text-slate-300 text-sm">{payout.payment_method}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button 
          onClick={() => setShowPayoutForm(true)}
          className="mt-6 px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-500 transition-colors btn-focus"
        >
          Request New Payout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-blue-500/20 pb-24 md:pb-0">
      {/* Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-24 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex-col items-center py-10 z-50 animate-slide-down">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-12 glow-blue animate-fade-scale animate-delay-100">
          <img 
            src="/logo-white.png" 
            alt="Idyll Productions" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-6">
          {[
            { id: 'profile', icon: User, label: 'Profile' },
            { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
            { id: 'meetings', icon: Calendar, label: 'Meetings' },
            { id: 'notes', icon: MessageSquare, label: 'Notes' },
            { id: 'payout', icon: DollarSign, label: 'Payout' },
          ].map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-4 rounded-xl transition-all group relative btn-focus animate-slide-down animate-delay-${(index + 2) * 100} ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white glow-blue scale-110' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <item.icon size={22} strokeWidth={1.5} />
              <span className="absolute left-full ml-4 px-3 py-1 glass-panel text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <button onClick={onLogout} className="p-4 text-slate-600 hover:text-rose-500 transition-colors btn-focus rounded-xl animate-slide-down animate-delay-700">
          <LogOut size={22} strokeWidth={1.5} />
        </button>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-slate-900/80 backdrop-blur-2xl border-t border-slate-800/50 flex items-center justify-around px-4 z-[60] pb-2">
        {[
          { id: 'profile', icon: User },
          { id: 'tasks', icon: CheckSquare },
          { id: 'meetings', icon: Calendar },
          { id: 'notes', icon: MessageSquare },
          { id: 'payout', icon: DollarSign },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`p-3 rounded-xl transition-all btn-focus ${
              activeTab === item.id ? 'bg-blue-600 text-white glow-blue' : 'text-slate-500'
            }`}
          >
            <item.icon size={24} strokeWidth={1.5} />
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="md:pl-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 md:mb-12 glass-panel p-4 rounded-2xl animate-slide-down">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-300">{user.displayName}</span>
              </div>
              <div className="h-4 w-px bg-slate-800"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-xs font-medium text-blue-500/80">Editor Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={onLogout} className="md:hidden text-slate-600 btn-focus rounded-lg p-2">
                <LogOut size={20} strokeWidth={1.5} />
              </button>
              <div className="hidden md:block px-4 py-1.5 glass-panel rounded-full">
                <span className="text-xs font-medium text-slate-500">Idyll Productions</span>
              </div>
            </div>
          </div>

          <div>
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'tasks' && renderTasks()}
            {activeTab === 'meetings' && renderMeetings()}
            {activeTab === 'notes' && renderNotes()}
            {activeTab === 'payout' && renderPayout()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditorDashboard;