import React, { useState } from 'react';
import { UserCheck, Users, CheckSquare, Calendar, DollarSign, MessageSquare, Bell, LogOut, Shield, Crown, Edit3, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';

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
  onAddNotification: (notification: any) => void;
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
  onAddNotification
}) => {
  const [activeTab, setActiveTab] = useState('approval');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [syncingNotion, setSyncingNotion] = useState(false);
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
    <div className="space-y-6 bounce-in">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">Editor Applications</h2>
        {appState.applications.filter((app: any) => app.status === 'pending').length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No pending applications</p>
            <p className="text-gray-500 text-sm mt-2">New editor applications will appear here for review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appState.applications.filter((app: any) => app.status === 'pending').map((applicant: any) => (
              <div key={applicant.id} className="card p-6 hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-white">{applicant.name}</h4>
                    <p className="text-gray-400 text-sm">{applicant.email}</p>
                    <p className="text-gray-500 text-xs">Applied: {new Date(applicant.applied_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        onApproveUser(applicant.id);
                      }}
                      className="btn-success"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => {
                        onRejectApplication(applicant.id);
                      }}
                      className="btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1">Software</label>
                    <p className="text-gray-300">{applicant.software || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1">Role</label>
                    <p className="text-gray-300">{applicant.role || 'Editor'}</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1">Location</label>
                    <p className="text-gray-300">{applicant.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1">Portfolio</label>
                    {applicant.portfolio && applicant.portfolio !== 'Not provided' ? (
                      <a href={applicant.portfolio} target="_blank" rel="noopener noreferrer" className="accent-blue hover:underline break-all">
                        View Portfolio
                      </a>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )}
                  </div>
                </div>
                {applicant.contact && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <label className="block text-gray-400 text-xs font-medium mb-1">Contact</label>
                    <p className="text-gray-300 text-sm">{applicant.contact}</p>
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
    <div className="space-y-6 bounce-in">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">User Approval</h2>
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No pending approvals</p>
          <p className="text-gray-500 text-sm mt-2">General user approvals will appear here</p>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6 bounce-in">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">User Management</h2>
        {appState.users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No users registered yet</p>
            <p className="text-gray-500 text-sm mt-2">Approved editors will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appState.users.map((user: any) => (
              <div key={user.id} className="card p-6 hover-lift">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src={user.photo_url || `https://i.pravatar.cc/150?u=${user.email}`} 
                        alt={user.display_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${user.email}`;
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-white">{user.display_name}</h4>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      <p className="text-gray-500 text-xs">Role: {user.role} • {user.approved ? 'Approved' : 'Pending'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.approved ? 'status-completed' : 'status-pending'
                    }`}>
                      {user.approved ? 'Active' : 'Pending'}
                    </span>
                    <select
                      value={user.role}
                      onChange={(e) => {
                        // Handle role change
                        console.log(`Changing role for ${user.email} to ${e.target.value}`);
                      }}
                      className="input text-xs"
                    >
                      <option value="editor">Editor</option>
                      <option value="moderator">Moderator</option>
                      <option value="owner">Owner</option>
                    </select>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to remove ${user.display_name}?`)) {
                          console.log(`Removing user: ${user.email}`);
                        }
                      }}
                      className="btn-danger text-xs"
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
    <div className="space-y-6 bounce-in">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <div className="flex gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Refresh
            </button>
            <button 
              onClick={() => setShowCreateTask(true)}
              className="btn-primary"
            >
              + New Task
            </button>
          </div>
        </div>

        {showCreateTask && (
          <div className="card p-6 mb-6 border border-blue-500">
            <h3 className="text-lg font-medium mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Task Name</label>
                  <input
                    type="text"
                    value={newTask.name}
                    onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                    className="w-full input"
                    placeholder="Enter task name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Assign To</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    className="w-full input"
                    required
                  >
                    <option value="">Select Editor</option>
                    {appState.users.filter((user: any) => user.approved && user.role === 'editor').map((user: any) => (
                      <option key={user.id} value={user.email}>{user.display_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Deadline</label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                    className="w-full input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Raw File Link</label>
                <input
                  type="url"
                  value={newTask.rawFile}
                  onChange={(e) => setNewTask({...newTask, rawFile: e.target.value})}
                  className="w-full input"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Task Table */}
        {appState.tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No tasks yet</p>
            <p className="text-gray-500 text-sm mt-2">Create your first task to get started</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            {/* Table Header */}
            <div className="table-header grid grid-cols-12 gap-4">
              <div className="col-span-1">ID</div>
              <div className="col-span-3">Task Name</div>
              <div className="col-span-2">Assigned To</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-2">Deadline</div>
              <div className="col-span-1">Raw File</div>
              <div className="col-span-1">Edited File</div>
            </div>

            {/* Table Rows */}
            {appState.tasks.map((task: any, index: number) => (
              <div key={task.id} className="table-row grid grid-cols-12 gap-4 items-center">
                {/* Task ID */}
                <div className="col-span-1">
                  <span className="text-gray-400 text-sm font-mono">
                    #{String(index + 1).padStart(3, '0')}
                  </span>
                </div>

                {/* Task Name */}
                <div className="col-span-3">
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => onUpdateTask(task.id, { name: e.target.value })}
                    className="w-full bg-transparent text-white font-medium border-none outline-none focus:bg-gray-700 rounded px-2 py-1"
                  />
                </div>

                {/* Assigned To */}
                <div className="col-span-2">
                  <select
                    value={task.assigned_to || ''}
                    onChange={(e) => onUpdateTask(task.id, { assigned_to: e.target.value })}
                    className="w-full bg-transparent text-sm border-none outline-none focus:bg-gray-700 rounded px-2 py-1"
                  >
                    <option value="" className="bg-gray-800">Unassigned</option>
                    {appState.users.filter((user: any) => user.approved && user.role === 'editor').map((user: any) => (
                      <option key={user.id} value={user.email} className="bg-gray-800">
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
                    className="w-full bg-transparent text-sm border-none outline-none focus:bg-gray-700 rounded px-2 py-1"
                  >
                    <option value="pending" className="bg-gray-800">Pending</option>
                    <option value="in-progress" className="bg-gray-800">In Progress</option>
                    <option value="completed" className="bg-gray-800">Completed</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="col-span-1">
                  <span className={`priority-${task.priority || 'medium'}`}>
                    {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)}
                  </span>
                </div>

                {/* Deadline */}
                <div className="col-span-2">
                  <input
                    type="date"
                    value={task.deadline || ''}
                    onChange={(e) => onUpdateTask(task.id, { deadline: e.target.value })}
                    className="w-full bg-transparent text-sm border-none outline-none focus:bg-gray-700 rounded px-2 py-1"
                  />
                </div>

                {/* Raw File */}
                <div className="col-span-1">
                  {task.raw_file ? (
                    <a 
                      href={task.raw_file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
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
                      className="w-full bg-transparent text-gray-400 text-sm border-none outline-none focus:bg-gray-700 rounded px-2 py-1 placeholder-gray-500"
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
                      className="text-green-400 hover:text-green-300 text-sm"
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
                      className="w-full bg-transparent text-gray-400 text-sm border-none outline-none focus:bg-gray-700 rounded px-2 py-1 placeholder-gray-500"
                    />
                  )}
                </div>
              </div>
            ))}
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
    <div className="space-y-6 bounce-in">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Meeting Management</h2>
          <button 
            onClick={() => setShowCreateMeeting(true)}
            className="btn-primary"
          >
            Schedule Meeting
          </button>
        </div>

        {showCreateMeeting && (
          <div className="card p-6 mb-6 border border-blue-500">
            <h4 className="text-lg font-medium mb-4">Schedule New Meeting</h4>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Meeting Title</label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                  className="w-full input"
                  placeholder="Enter meeting title"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                    className="w-full input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                    className="w-full input"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meeting Link (Optional)</label>
                <input
                  type="url"
                  value={newMeeting.link}
                  onChange={(e) => setNewMeeting({...newMeeting, link: e.target.value})}
                  className="w-full input"
                  placeholder="https://zoom.us/j/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Attendees</label>
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
                    <span className="text-gray-300">All Team</span>
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
                      <span className="text-gray-300">{user.display_name} ({user.email})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Schedule Meeting
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateMeeting(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {appState.meetings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No meetings scheduled</p>
            <p className="text-gray-500 text-sm mt-2">Schedule meetings with your editing team</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appState.meetings.map((meeting: any) => (
              <div key={meeting.id} className="card p-6 hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-white">{meeting.title}</h4>
                    <p className="text-gray-400 text-sm">{new Date(meeting.date).toLocaleDateString()} at {meeting.time}</p>
                    <p className="text-gray-500 text-xs">Organized by: {meeting.organizer}</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="btn-secondary">
                      Edit
                    </button>
                    <button 
                      onClick={() => onDeleteMeeting(meeting.id)}
                      className="btn-danger"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">Attendees</label>
                  <p className="text-gray-300 text-sm">{Array.isArray(meeting.attendees) ? meeting.attendees.join(', ') : meeting.attendees}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPayoutManagement = () => (
    <div className="space-y-6 bounce-in">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">Payout Management</h2>
        {appState.payouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No payout requests</p>
            <p className="text-gray-500 text-sm mt-2">Editor payout requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appState.payouts.map((payout: any) => (
              <div key={payout.id} className="card p-6 hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-white">{payout.project}</h4>
                    <p className="text-gray-400 text-sm">Editor: {payout.editor} • Amount: ${payout.amount}</p>
                    <p className="text-gray-500 text-xs">Requested: {new Date(payout.requested_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      payout.status === 'paid' ? 'status-completed' :
                      payout.status === 'approved' ? 'status-progress' :
                      payout.status === 'rejected' ? 'bg-red-900/50 text-red-400' :
                      'status-pending'
                    }`}>
                      {payout.status}
                    </span>
                    {payout.status === 'pending' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            onUpdatePayout(payout.id, { status: 'approved' });
                          }}
                          className="btn-success"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => onUpdatePayout(payout.id, { status: 'rejected' })}
                          className="btn-danger"
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
                        className="btn-primary"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1">Edited File Link</label>
                    <a href={payout.edited_link} target="_blank" rel="noopener noreferrer" className="accent-blue hover:underline text-sm break-all">
                      {payout.edited_link}
                    </a>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1">Payment Method</label>
                    <p className="text-gray-300 text-sm">{payout.payment_method}</p>
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
    <div className="space-y-6 bounce-in">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">Team Chat</h2>
        <div className="card p-4 h-96 mb-4 overflow-y-auto">
          <div className="space-y-4">
            {appState.chatMessages.map((message: any) => (
              <div key={message.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                  message.type === 'system' ? 'bg-gray-600' : 'bg-blue-600'
                }`}>
                  {message.sender.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-gray-300 text-sm">
                    <span className="font-medium">{message.sender}:</span> {message.message}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 input"
          />
          <button 
            type="submit"
            className="btn-primary"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6 bounce-in">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">Notification Center</h2>
        {appState.notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No notifications</p>
            <p className="text-gray-500 text-sm mt-2">System notifications will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appState.notifications.map((notification: any) => (
              <div key={notification.id} className={`card p-6 hover-lift ${notification.urgent ? 'border border-red-500' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      notification.type === 'task' ? 'bg-blue-600' :
                      notification.type === 'meeting' ? 'bg-purple-600' :
                      notification.type === 'payout' ? 'bg-green-600' :
                      'bg-yellow-600'
                    }`}>
                      {notification.type === 'task' ? <CheckSquare className="w-6 h-6 text-white" /> :
                       notification.type === 'meeting' ? <Calendar className="w-6 h-6 text-white" /> :
                       notification.type === 'payout' ? <DollarSign className="w-6 h-6 text-white" /> :
                       <Users className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-white">{notification.title}</h4>
                      <p className="text-gray-400 text-sm">{notification.message}</p>
                      <p className="text-gray-500 text-xs">{notification.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {notification.urgent && (
                      <span className="px-2 py-1 bg-red-900/50 text-red-400 text-xs font-medium rounded-lg">
                        Urgent
                      </span>
                    )}
                    <button className="btn-secondary">
                      View
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

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 md:pb-0">
      {/* Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 sidebar flex-col py-6 z-50">
        <div className="flex items-center gap-3 px-6 mb-8">
          <img 
            src="/logo-white.png" 
            alt="Idyll Productions" 
            className="w-8 h-8 object-contain"
          />
          <span className="font-semibold text-lg">Idyll Productions</span>
        </div>
        
        <div className="flex-1">
          {[
            { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
            { id: 'users', icon: Users, label: 'Users' },
            { id: 'meetings', icon: Calendar, label: 'Meetings' },
            { id: 'payouts', icon: DollarSign, label: 'Payouts' },
            { id: 'notes', icon: MessageSquare, label: 'Chat' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'submissions', icon: UserCheck, label: 'Applications' },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="px-6 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <img src={user.photoURL} alt="profile" className="w-8 h-8 rounded-full" />
            <div>
              <div className="font-medium text-sm">{user.displayName}</div>
              <div className="text-xs text-gray-400 capitalize">{user.role}</div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full btn-secondary text-left flex items-center gap-2">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-around px-4 z-50">
        {[
          { id: 'tasks', icon: CheckSquare },
          { id: 'users', icon: Users },
          { id: 'meetings', icon: Calendar },
          { id: 'payouts', icon: DollarSign },
          { id: 'notes', icon: MessageSquare },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`p-3 rounded-lg transition-all ${
              activeTab === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <item.icon size={20} />
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="md:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 card p-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold">Management Panel</h1>
              <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                {user.role}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleSyncToNotion}
                disabled={syncingNotion}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncingNotion ? 'animate-spin' : ''}`} />
                {syncingNotion ? 'Syncing...' : 'Sync'}
              </button>
            </div>
          </div>

          <div className="bounce-in">
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