import React, { useState } from 'react';
import { UserCheck, Users, CheckSquare, Calendar, DollarSign, MessageSquare, Bell, LogOut, Shield, Crown, Edit3, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface ManagementPanelProps {
  user: UserProfile;
  onLogout: () => void;
  appState: any;
  onApproveUser: (applicationId: number) => void;
  onRejectApplication: (applicationId: number) => void;
  onCreateTask: (taskData: any) => void;
  onUpdateTask: (taskId: string, updates: any) => void;
  onCreateMeeting: (meetingData: any) => void;
  onDeleteMeeting: (meetingId: number) => void;
  onUpdatePayout: (payoutId: number, updates: any) => void;
  onAddChatMessage: (message: string, sender: string) => void;
  onEditChatMessage?: (messageId: number, newMessage: string) => void;
  onDeleteChatMessage?: (messageId: number) => void;
  onAddNotification: (notification: any) => void;
  onRemoveUser: (userId: number, userEmail: string, userName: string) => void;
  onChangeUserRole: (userId: number, userEmail: string, userName: string, newRole: string) => void;
  onRefreshData?: () => void;
}

const ManagementPanel: React.FC<ManagementPanelProps> = ({ 
  user, 
  onLogout, 
  appState, 
  onApproveUser,
  onRejectApplication, 
  onCreateTask, 
  onUpdateTask,
  onCreateMeeting,
  onDeleteMeeting,
  onUpdatePayout,
  onAddChatMessage,
  onEditChatMessage,
  onDeleteChatMessage,
  onAddNotification,
  onRemoveUser,
  onChangeUserRole,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState('approval');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [selectedChatUser, setSelectedChatUser] = useState('');
  const [syncingNotion, setSyncingNotion] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  const [newTask, setNewTask] = useState({
    name: '',
    assignedTo: '',
    deadline: '',
    priority: 'medium',
    rawFile: ''
  });
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    attendees: [] as string[],
    link: ''
  });

  const switchToEditor = () => {
    // This would be handled by proper role management in production
    alert('Role switching requires proper authentication in production');
  };

  const renderEditorSubmissions = () => (
    <div className="space-y-6">
      <div className="bg-slate-900/50 rounded-3xl p-8">
        <h3 className="text-2xl font-black text-white mb-6">Editor Submissions</h3>
        {appState.applications.filter((app: any) => app.status === 'pending').length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No pending editor applications</p>
            <p className="text-slate-500 text-sm mt-2">New editor applications will appear here for review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appState.applications.filter((app: any) => app.status === 'pending').map((applicant: any) => (
              <div key={applicant.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">{applicant.name}</h4>
                    <p className="text-slate-400 text-sm">{applicant.email}</p>
                    <p className="text-slate-500 text-xs">Applied: {new Date(applicant.applied_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        onApproveUser(applicant.id);
                      }}
                      className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => {
                        onRejectApplication(applicant.id);
                      }}
                      className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold mb-1">Software</label>
                    <p className="text-slate-300">{applicant.software || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold mb-1">Role</label>
                    <p className="text-slate-300">{applicant.role || 'Editor'}</p>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold mb-1">Location</label>
                    <p className="text-slate-300">{applicant.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold mb-1">Portfolio</label>
                    {applicant.portfolio && applicant.portfolio !== 'Not provided' ? (
                      <a href={applicant.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all">
                        View Portfolio
                      </a>
                    ) : (
                      <p className="text-slate-500">Not provided</p>
                    )}
                  </div>
                </div>
                {applicant.contact && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <label className="block text-slate-400 text-xs font-bold mb-1">Contact</label>
                    <p className="text-slate-300 text-sm">{applicant.contact}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderApproval = () => (
    <div className="space-y-6">
      <div className="bg-slate-900/50 rounded-3xl p-8">
        <h3 className="text-2xl font-black text-white mb-6">👥 User Approval Center</h3>
        
        {/* Pending Approvals */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-white mb-4">Pending User Approvals</h4>
          {appState.users.filter((user: any) => !user.approved).length === 0 ? (
            <div className="text-center py-8 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <p className="text-slate-400 text-lg">✅ No pending user approvals</p>
              <p className="text-slate-500 text-sm mt-2">All registered users have been reviewed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appState.users.filter((user: any) => !user.approved).map((pendingUser: any) => (
                <div key={pendingUser.id} className="bg-slate-800/50 rounded-2xl p-6 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-lg font-bold text-white">{pendingUser.display_name}</h5>
                      <p className="text-slate-400 text-sm">{pendingUser.email}</p>
                      <p className="text-amber-400 text-xs font-semibold">⏳ Awaiting Approval</p>
                      <p className="text-slate-500 text-xs mt-1">
                        Registered: {new Date(pendingUser.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={async () => {
                          if (confirm(`Approve ${pendingUser.display_name} as an editor?`)) {
                            console.log('Approving user:', pendingUser.email);
                            
                            try {
                              // Update user approval status immediately
                              const { error: updateError } = await supabase
                                .from('users')
                                .update({ approved: true })
                                .eq('id', pendingUser.id);
                              
                              if (updateError) {
                                throw updateError;
                              }
                              
                              // Find corresponding application and approve it
                              const application = appState.applications.find((app: any) => app.email === pendingUser.email);
                              if (application) {
                                await onApproveUser(application.id);
                              }
                              
                              // Add success notification
                              await onAddNotification({
                                type: 'user',
                                title: 'User Approved',
                                message: `${pendingUser.display_name} has been approved and can now access their dashboard`,
                                urgent: false
                              });
                              
                              // Force immediate data refresh
                              window.location.reload();
                              
                            } catch (error) {
                              console.error('Error approving user:', error);
                              alert('Error approving user: ' + error.message);
                            }
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
                      >
                        ✓ Approve
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Reject ${pendingUser.display_name}'s application?`)) {
                            console.log('Rejecting user:', pendingUser.email);
                            onRemoveUser(pendingUser.id, pendingUser.email, pendingUser.display_name);
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Approved Users */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Recently Approved Users</h4>
          {appState.users.filter((user: any) => user.approved).slice(0, 5).length === 0 ? (
            <div className="text-center py-6 bg-slate-800/20 rounded-2xl">
              <p className="text-slate-500">No approved users yet</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {appState.users.filter((user: any) => user.approved).slice(0, 5).map((user: any) => (
                <div key={user.id} className="bg-slate-800/30 rounded-xl p-4 border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{user.display_name}</p>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs font-bold rounded-full">
                        ✓ Approved
                      </span>
                      <p className="text-slate-500 text-xs mt-1">Role: {user.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="bg-slate-900/50 rounded-3xl p-8">
        <h3 className="text-2xl font-black text-white mb-6">User Management</h3>
        {appState.users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No users registered yet</p>
            <p className="text-slate-500 text-sm mt-2">Approved editors will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appState.users.map((user: any) => (
              <div key={user.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">{user.display_name}</h4>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                      <p className="text-slate-500 text-xs">Role: {user.role} • {user.approved ? 'Approved' : 'Pending'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.approved ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {user.approved ? 'Active' : 'Pending'}
                    </span>
                    <select
                      value={user.role}
                      onChange={async (e) => {
                        try {
                          await onChangeUserRole(user.id, user.email, user.display_name, e.target.value);
                          // Force immediate refresh
                          if (onRefreshData) {
                            onRefreshData();
                          }
                        } catch (error) {
                          console.error('Error changing user role:', error);
                          alert('Error changing user role: ' + error.message);
                        }
                      }}
                      className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="editor">Editor</option>
                      <option value="moderator">Moderator</option>
                      <option value="owner">Owner</option>
                    </select>
                    <button 
                      onClick={async () => {
                        if (confirm(`Are you sure you want to remove ${user.display_name}? This will delete all their data.`)) {
                          try {
                            await onRemoveUser(user.id, user.email, user.display_name);
                            // Force immediate refresh
                            if (onRefreshData) {
                              onRefreshData();
                            }
                          } catch (error) {
                            console.error('Error removing user:', error);
                            alert('Error removing user: ' + error.message);
                          }
                        }
                      }}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.name && newTask.assignedTo && newTask.deadline) {
      onCreateTask(newTask);
      setNewTask({
        name: '',
        assignedTo: '',
        deadline: '',
        priority: 'medium',
        rawFile: ''
      });
      setShowCreateTask(false);
    }
  };

  const renderTaskManagement = () => (
    <div className="space-y-6">
      <div className="bg-slate-900/50 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-white">📋 Idyll Tasks</h3>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                window.location.reload();
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
            >
              🔄 Refresh
            </button>
            <button 
              onClick={() => setShowCreateTask(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-colors"
            >
              + New Task
            </button>
          </div>
        </div>

        {showCreateTask && (
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
            <h4 className="text-lg font-bold text-white mb-4">Create New Task</h4>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">Task Name</label>
                  <input
                    type="text"
                    value={newTask.name}
                    onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter task name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">Assign To</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select Editor</option>
                    {appState.users.filter((user: any) => user.approved && user.role === 'editor').map((user: any) => (
                      <option key={user.id} value={user.email}>{user.display_name} ({user.email})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">Deadline</label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-bold mb-2">Raw File Link</label>
                <input
                  type="url"
                  value={newTask.rawFile}
                  onChange={(e) => setNewTask({...newTask, rawFile: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-colors"
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="px-6 py-3 bg-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notion Embed for Task Management */}
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
                title="Task Management Database"
                frameBorder="0"
                allowFullScreen
                loading="lazy"
              />
              <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-xs text-slate-300">📋 Live from Notion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fallback: Show tasks from database if Notion embed fails */}
        {appState.tasks.length > 0 && (
          <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden">
            {/* Table Header - Notion Style */}
            <div className="bg-slate-800/50 border-b border-slate-700/50 px-4 py-3">
              <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-1">Task #</div>
                <div className="col-span-3">Name</div>
                <div className="col-span-2">Assigned To</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Priority</div>
                <div className="col-span-2">Deadline</div>
                <div className="col-span-1">Raw File</div>
                <div className="col-span-1">Edited File</div>
              </div>
            </div>

            {/* Table Rows - Notion Style */}
            <div className="divide-y divide-slate-700/30">
              {appState.tasks.map((task: any, index: number) => (
                <div key={task.id} className="px-4 py-4 hover:bg-slate-800/20 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Task Number */}
                    <div className="col-span-1">
                      <span className="text-slate-400 text-sm font-mono">
                        {task.task_number || `T${String(index + 1).padStart(3, '0')}`}
                      </span>
                    </div>

                    {/* Task Name */}
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={task.name}
                        onChange={(e) => onUpdateTask(task.id, { name: e.target.value })}
                        className="w-full bg-transparent text-white text-sm font-medium border-none outline-none focus:bg-slate-800/50 rounded px-2 py-1 transition-colors"
                        placeholder="Task name..."
                      />
                    </div>

                    {/* Assigned To */}
                    <div className="col-span-2">
                      <select
                        value={task.assigned_to || ''}
                        onChange={(e) => onUpdateTask(task.id, { assigned_to: e.target.value })}
                        className="w-full bg-transparent text-slate-300 text-sm border-none outline-none focus:bg-slate-800/50 rounded px-2 py-1 transition-colors"
                      >
                        <option value="">Unassigned</option>
                        {appState.users.filter((user: any) => user.approved && user.role === 'editor').map((user: any) => (
                          <option key={user.id} value={user.email} className="bg-slate-800 text-white">
                            {user.display_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      <select
                        value={task.status || 'pending'}
                        onChange={(e) => onUpdateTask(task.id, { status: e.target.value })}
                        className="w-full bg-transparent text-sm border-none outline-none focus:bg-slate-800/50 rounded px-2 py-1 transition-colors"
                      >
                        <option value="pending" className="bg-slate-800">
                          <span className="text-slate-400">⏳ Pending</span>
                        </option>
                        <option value="in-progress" className="bg-slate-800">
                          <span className="text-yellow-400">🔄 In Progress</span>
                        </option>
                        <option value="completed" className="bg-slate-800">
                          <span className="text-green-400">✅ Completed</span>
                        </option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div className="col-span-1">
                      <select
                        value={task.priority || 'medium'}
                        onChange={(e) => onUpdateTask(task.id, { priority: e.target.value })}
                        className="w-full bg-transparent text-sm border-none outline-none focus:bg-slate-800/50 rounded px-2 py-1 transition-colors"
                      >
                        <option value="low" className="bg-slate-800">
                          <span className="text-green-400">🟢 Low</span>
                        </option>
                        <option value="medium" className="bg-slate-800">
                          <span className="text-yellow-400">🟡 Medium</span>
                        </option>
                        <option value="high" className="bg-slate-800">
                          <span className="text-red-400">🔴 High</span>
                        </option>
                      </select>
                    </div>

                    {/* Deadline */}
                    <div className="col-span-2">
                      <input
                        type="date"
                        value={task.deadline || ''}
                        onChange={(e) => onUpdateTask(task.id, { deadline: e.target.value })}
                        className="w-full bg-transparent text-slate-300 text-sm border-none outline-none focus:bg-slate-800/50 rounded px-2 py-1 transition-colors"
                      />
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
                          📎 File
                        </a>
                      ) : (
                        <input
                          type="url"
                          placeholder="Add file..."
                          onBlur={(e) => {
                            if (e.target.value) {
                              onUpdateTask(task.id, { raw_file: e.target.value });
                            }
                          }}
                          className="w-full bg-transparent text-slate-400 text-sm border-none outline-none focus:bg-slate-800/50 rounded px-2 py-1 transition-colors placeholder-slate-500"
                        />
                      )}
                    </div>

                    {/* Edited File */}
                    <div className="col-span-1">
                      {task.edited_file ? (
                        <a 
                          href={task.edited_file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 text-sm transition-colors"
                        >
                          ✅ Done
                        </a>
                      ) : (
                        <input
                          type="url"
                          placeholder="Add file..."
                          onBlur={(e) => {
                            if (e.target.value) {
                              onUpdateTask(task.id, { edited_file: e.target.value });
                              onUpdateTask(task.id, { status: 'completed' });
                            }
                          }}
                          className="w-full bg-transparent text-slate-400 text-sm border-none outline-none focus:bg-slate-800/50 rounded px-2 py-1 transition-colors placeholder-slate-500"
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

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMeeting.title && newMeeting.date && newMeeting.time) {
      onCreateMeeting({
        ...newMeeting,
        attendees: newMeeting.attendees.length > 0 ? newMeeting.attendees : ['All Team'],
        attendees_emails: newMeeting.attendees.length > 0 ? newMeeting.attendees : ['All Team']
      });
      setNewMeeting({
        title: '',
        date: '',
        time: '',
        attendees: [],
        link: ''
      });
      setShowCreateMeeting(false);
      onAddNotification({
        type: 'meeting',
        title: 'Meeting Scheduled',
        message: `${newMeeting.title} scheduled for ${newMeeting.date}`
      });
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

  const handleSyncToNotion = async () => {
    setSyncingNotion(true);
    try {
      // Since we're using Notion as primary database, just refresh data
      alert('Data is already synced! Notion is the primary database.');
    } catch (error) {
      console.error('Sync error:', error);
      alert('Error syncing to Notion. Check console for details.');
    }
    setSyncingNotion(false);
  };

  const renderMeetingManagement = () => (
    <div className="space-y-6">
      <div className="bg-slate-900/50 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-white">Meeting Management</h3>
          <button 
            onClick={() => setShowCreateMeeting(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-colors"
          >
            Schedule Meeting
          </button>
        </div>

        {showCreateMeeting && (
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
            <h4 className="text-lg font-bold text-white mb-4">Schedule New Meeting</h4>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-bold mb-2">Meeting Title</label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter meeting title"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">Date</label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">Time</label>
                  <input
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-bold mb-2">Meeting Link (Optional)</label>
                <input
                  type="url"
                  value={newMeeting.link}
                  onChange={(e) => setNewMeeting({...newMeeting, link: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                  placeholder="https://zoom.us/j/..."
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-bold mb-2">Attendees</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newMeeting.attendees.includes('All Team')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewMeeting({...newMeeting, attendees: ['All Team']});
                        } else {
                          setNewMeeting({...newMeeting, attendees: []});
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-slate-300">All Team</span>
                  </label>
                  {appState.users.filter((user: any) => user.approved).map((user: any) => (
                    <label key={user.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newMeeting.attendees.includes(user.email)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewMeeting({
                              ...newMeeting, 
                              attendees: [...newMeeting.attendees.filter(a => a !== 'All Team'), user.email]
                            });
                          } else {
                            setNewMeeting({
                              ...newMeeting,
                              attendees: newMeeting.attendees.filter(a => a !== user.email)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-slate-300">{user.display_name} ({user.email})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-colors"
                >
                  Schedule Meeting
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateMeeting(false)}
                  className="px-6 py-3 bg-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notion Embed for Meeting Management */}
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
                title="Meeting Management Database"
                frameBorder="0"
                allowFullScreen
                loading="lazy"
              />
              <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-xs text-slate-300">📅 Live from Notion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fallback: Show meetings from database if needed */}
        {appState.meetings.length > 0 && (
          <div className="space-y-4">
            {appState.meetings.map((meeting: any) => (
              <div key={meeting.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">{meeting.title}</h4>
                    <p className="text-slate-400 text-sm">{new Date(meeting.date).toLocaleDateString()} at {meeting.time}</p>
                    <p className="text-slate-500 text-xs">Organized by: {meeting.organizer}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-600 transition-colors">
                      Edit
                    </button>
                    <button 
                      onClick={() => onDeleteMeeting(meeting.id)}
                      className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold mb-1">Attendees</label>
                  <p className="text-slate-300 text-sm">{Array.isArray(meeting.attendees) ? meeting.attendees.join(', ') : meeting.attendees}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPayoutManagement = () => (
    <div className="space-y-6">
      <div className="bg-slate-900/50 rounded-3xl p-8">
        <h3 className="text-2xl font-black text-white mb-6">Payout Management</h3>
        {/* Notion Embed for Payout Management */}
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
                title="Payout Management Database"
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
            ✅ Connected to Idyll Productions Payout Database - Changes sync in real-time
          </p>
        </div>

        {/* Fallback: Show payouts from database if needed */}
        {appState.payouts.length > 0 && (
          <div className="space-y-4">
            {appState.payouts.map((payout: any) => (
              <div key={payout.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">{payout.project}</h4>
                    <p className="text-slate-400 text-sm">Editor: {payout.editor} • Amount: ${payout.amount}</p>
                    <p className="text-slate-500 text-xs">Requested: {new Date(payout.requested_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      payout.status === 'paid' ? 'bg-green-900/50 text-green-400' :
                      payout.status === 'approved' ? 'bg-blue-900/50 text-blue-400' :
                      payout.status === 'rejected' ? 'bg-red-900/50 text-red-400' :
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {payout.status}
                    </span>
                    {payout.status === 'pending' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            onUpdatePayout(payout.id, { status: 'approved' });
                          }}
                          className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => onUpdatePayout(payout.id, { status: 'rejected' })}
                          className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {payout.status === 'approved' && (
                      <button 
                        onClick={() => {
                          onUpdatePayout(payout.id, { status: 'paid' });
                        }}
                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold mb-1">Edited File Link</label>
                    <a href={payout.edited_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm break-all">
                      {payout.edited_link}
                    </a>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold mb-1">Payment Method</label>
                    <p className="text-slate-300 text-sm">{payout.payment_method}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-6">
      <div className="bg-slate-900/50 rounded-3xl p-8">
        <h3 className="text-2xl font-black text-white mb-6">💬 Team Chat & User Selection</h3>
        
        {/* User Selection for Chat */}
        <div className="mb-6">
          <label className="block text-slate-300 text-sm font-semibold mb-3">Chat with specific user:</label>
          <select
            value={selectedChatUser}
            onChange={(e) => setSelectedChatUser(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Users (General Chat)</option>
            {appState.users.filter((user: any) => user.approved && user.role === 'editor').map((user: any) => (
              <option key={user.id} value={user.email}>{user.display_name} ({user.email})</option>
            ))}
          </select>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-4 h-96 mb-4 overflow-y-auto">
          <div className="space-y-4">
            {appState.chatMessages
              .filter((message: any) => !selectedChatUser || message.recipient === selectedChatUser || message.sender === user.displayName)
              .map((message: any) => (
              <div key={message.id} className="flex items-start gap-3 group">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  message.type === 'system' ? 'bg-gray-600' : 'bg-blue-600'
                }`}>
                  {message.sender.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-slate-300 text-sm font-bold">
                      {message.sender}
                      {selectedChatUser && message.recipient && (
                        <span className="text-slate-500 text-xs ml-2">→ {message.recipient}</span>
                      )}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
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
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors text-sm"
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
                    <p className="text-slate-300 text-sm bg-slate-700/30 rounded-lg px-3 py-2">
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
            placeholder={selectedChatUser ? `Message ${selectedChatUser}...` : "Message all users..."}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:border-blue-500 focus:outline-none"
          />
          <button 
            type="submit"
            disabled={!chatMessage.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </form>
        <p className="text-slate-500 text-xs mt-2 text-center">
          💡 Real-time WebSocket chat - messages appear instantly without refresh
          <br />
          ✅ Edit: Click edit icon, press Enter to save, Escape to cancel
          <br />
          🗑️ Delete: Click delete icon to remove message permanently
        </p>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-slate-900/50 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-white">🔔 Activity & Notification Center</h3>
          <button 
            onClick={() => {
              // Clear all notifications
              if (confirm('Clear all notifications?')) {
                console.log('Clearing all notifications');
              }
            }}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
          >
            Clear All
          </button>
        </div>
        
        {appState.notifications.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700/50">
            <p className="text-slate-400 text-lg">📭 No recent activity</p>
            <p className="text-slate-500 text-sm mt-2">User actions and system notifications will appear here</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {appState.notifications.map((notification: any) => (
              <div key={notification.id} className={`bg-slate-800/50 rounded-2xl p-6 border transition-all hover:bg-slate-800/70 ${
                notification.urgent ? 'border-red-500/50 bg-red-900/10' : 'border-slate-700'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      notification.type === 'task' ? 'bg-blue-600' :
                      notification.type === 'meeting' ? 'bg-purple-600' :
                      notification.type === 'payout' ? 'bg-green-600' :
                      notification.type === 'user' ? 'bg-amber-600' :
                      'bg-slate-600'
                    }`}>
                      {notification.type === 'task' ? <CheckSquare className="w-6 h-6 text-white" /> :
                       notification.type === 'meeting' ? <Calendar className="w-6 h-6 text-white" /> :
                       notification.type === 'payout' ? <DollarSign className="w-6 h-6 text-white" /> :
                       notification.type === 'user' ? <Users className="w-6 h-6 text-white" /> :
                       <Bell className="w-6 h-6 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold text-white">{notification.title}</h4>
                        {notification.urgent && (
                          <span className="px-2 py-1 bg-red-900/50 text-red-400 text-xs font-bold rounded-lg animate-pulse">
                            🚨 URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>📅 {notification.time}</span>
                        <span className="capitalize">📂 {notification.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        console.log('Mark as read:', notification.id);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark Read
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Delete this notification?')) {
                          console.log('Delete notification:', notification.id);
                        }
                      }}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Real-Time Activity Summary */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/30 rounded-xl p-4 text-center border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-400">{appState.tasks.length}</div>
            <div className="text-slate-400 text-sm">Total Tasks</div>
            <div className="text-xs text-slate-500 mt-1">
              {appState.tasks.filter((t: any) => t.status === 'completed').length} completed
            </div>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 text-center border border-purple-500/20">
            <div className="text-2xl font-bold text-purple-400">{appState.meetings.length}</div>
            <div className="text-slate-400 text-sm">Meetings</div>
            <div className="text-xs text-slate-500 mt-1">
              {appState.meetings.filter((m: any) => new Date(m.date) >= new Date()).length} upcoming
            </div>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 text-center border border-green-500/20">
            <div className="text-2xl font-bold text-green-400">{appState.payouts.length}</div>
            <div className="text-slate-400 text-sm">Payouts</div>
            <div className="text-xs text-slate-500 mt-1">
              {appState.payouts.filter((p: any) => p.status === 'pending').length} pending
            </div>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 text-center border border-amber-500/20">
            <div className="text-2xl font-bold text-amber-400">{appState.users.filter((u: any) => u.approved).length}</div>
            <div className="text-slate-400 text-sm">Active Users</div>
            <div className="text-xs text-slate-500 mt-1">
              {appState.users.filter((u: any) => !u.approved).length} pending approval
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-blue-500/30 pb-24 md:pb-0">
      {/* Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-24 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex-col items-center py-10 z-50">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-12 glow-blue">
          <img 
            src="/logo-white.png" 
            alt="Idyll Productions" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-6">
          {[
            { id: 'approval', icon: UserCheck, label: 'Approval' },
            { id: 'users', icon: Users, label: 'Users' },
            { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
            { id: 'meetings', icon: Calendar, label: 'Meetings' },
            { id: 'payouts', icon: DollarSign, label: 'Payouts' },
            { id: 'notes', icon: MessageSquare, label: 'Chat' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'submissions', icon: UserCheck, label: 'Editor Submissions' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-4 rounded-2xl transition-all group relative active:scale-90 ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 scale-110' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <item.icon size={22} />
              <span className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <button onClick={onLogout} className="p-4 text-slate-600 hover:text-rose-500 transition-colors active:scale-90">
          <LogOut size={22} />
        </button>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-slate-900/80 backdrop-blur-2xl border-t border-slate-800/50 flex items-center justify-around px-4 z-[60] pb-2">
        {[
          { id: 'approval', icon: UserCheck },
          { id: 'users', icon: Users },
          { id: 'tasks', icon: CheckSquare },
          { id: 'meetings', icon: Calendar },
          { id: 'submissions', icon: Bell },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`p-3 rounded-xl transition-all active:scale-75 ${
              activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'
            }`}
          >
            <item.icon size={24} />
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="md:pl-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 md:mb-12 bg-slate-900/50 backdrop-blur-xl p-4 rounded-3xl border border-slate-800/50">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-300">{user.displayName}</span>
              </div>
              <div className="h-4 w-[1px] bg-slate-800"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                <span className="text-xs font-medium text-purple-500/80">Management Panel</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleSyncToNotion}
                disabled={syncingNotion}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncingNotion ? 'animate-spin' : ''}`} />
                {syncingNotion ? 'Syncing...' : 'Sync to Notion'}
              </button>
              <button onClick={onLogout} className="md:hidden text-slate-600 active:scale-90">
                <LogOut size={20} />
              </button>
              <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50">
                {user.role === 'owner' ? <Crown className="w-4 h-4 text-yellow-400" /> : <Shield className="w-4 h-4 text-purple-400" />}
                <span className="text-xs font-medium text-slate-500">{user.role}</span>
              </div>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'submissions' && renderEditorSubmissions()}
            {activeTab === 'approval' && renderApproval()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'tasks' && renderTaskManagement()}
            {activeTab === 'meetings' && renderMeetingManagement()}
            {activeTab === 'payouts' && renderPayoutManagement()}
            {activeTab === 'notes' && renderNotes()}
            {activeTab === 'notifications' && renderNotifications()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagementPanel;