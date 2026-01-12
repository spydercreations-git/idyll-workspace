import React, { useState } from 'react';
import { User, CheckSquare, Calendar, MessageSquare, DollarSign, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

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
  onAddChatMessage 
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
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
    confirmPassword: ''
  });

  const switchToManagement = () => {
    // This would be handled by proper role management in production
    alert('Role switching requires proper authentication in production');
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    alert('Profile updated successfully!');
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

  const renderProfile = () => (
    <div className="space-y-6 bounce-in">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
        <form onSubmit={handleProfileUpdate}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                className="w-full input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className="w-full input"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={profileData.newPassword}
                onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                placeholder="Leave blank to keep current"
                className="w-full input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={profileData.confirmPassword}
                onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                placeholder="Confirm new password"
                className="w-full input"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="mt-6 btn-primary"
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
    <div className="space-y-6 bounce-in">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">Task Management</h2>
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No tasks assigned yet</p>
            <p className="text-gray-500 text-sm mt-2">Your assigned tasks will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task: any, index: number) => (
              <div 
                key={task.id} 
                className="card p-6 hover-lift"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-white">{task.name}</h4>
                    <p className="text-gray-400 text-sm">Task #{task.task_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 text-sm">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed' ? 'status-completed' :
                      task.status === 'in-progress' ? 'status-progress' :
                      'status-pending'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1">Raw File</label>
                    {task.raw_file ? (
                      <a href={task.raw_file} className="accent-blue hover:underline text-sm break-all">
                        {task.raw_file}
                      </a>
                    ) : (
                      <p className="text-gray-500 text-sm">No raw file provided</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1">Edited File</label>
                    {task.edited_file ? (
                      <a href={task.edited_file} className="accent-green hover:underline text-sm break-all">
                        {task.edited_file}
                      </a>
                    ) : (
                      <input
                        type="url"
                        placeholder="Upload edited file link"
                        className="w-full input text-sm"
                        onBlur={(e) => {
                          if (e.target.value) {
                            handleTaskUpdate(task.id.toString(), 'edited_file', e.target.value);
                            handleTaskUpdate(task.id.toString(), 'status', 'completed');
                          }
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1">Status</label>
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskUpdate(task.id.toString(), 'status', e.target.value)}
                      className="w-full input text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderMeetings = () => (
    <div className="space-y-6 bounce-in">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">Meeting Calendar</h2>
        {meetings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No meetings scheduled</p>
            <p className="text-gray-500 text-sm mt-2">Your scheduled meetings will appear here</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {meetings.map((meeting: any, index: number) => (
              <div key={meeting.id} className="card p-6 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-white">{meeting.title}</h4>
                    <p className="text-gray-400 text-sm">{new Date(meeting.date).toLocaleDateString()} at {meeting.time}</p>
                    <p className="text-gray-500 text-xs">Attendees: {Array.isArray(meeting.attendees) ? meeting.attendees.join(', ') : meeting.attendees}</p>
                  </div>
                  <button className="btn-primary">
                    Join
                  </button>
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
        <h2 className="text-xl font-semibold mb-6">Live Chat with Moderators</h2>
        <div className="card p-4 h-96 mb-4 overflow-y-auto">
          <div className="space-y-4">
            {chatMessages.map((message: any) => (
              <div key={message.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                  message.type === 'system' ? 'bg-gray-600' : 
                  message.sender === user.displayName ? 'bg-gray-600' : 'bg-blue-600'
                }`}>
                  {message.sender.charAt(0).toUpperCase()}
                </div>
                <div className={message.sender === user.displayName ? 'ml-auto text-right' : ''}>
                  <p className="text-gray-300 text-sm">
                    <span className="font-medium">{message.sender === user.displayName ? 'You' : message.sender}:</span> {message.message}
                  </p>
                  <p className="text-gray-500 text-xs">{new Date(message.timestamp).toLocaleTimeString()}</p>
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

  const renderPayout = () => (
    <div className="space-y-6 bounce-in">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">Payout Management</h2>
        
        {showPayoutForm && (
          <div className="card p-6 mb-6 border border-blue-500">
            <h4 className="text-lg font-medium mb-4">Request New Payout</h4>
            <form onSubmit={handleCreatePayout} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Name</label>
                  <input
                    type="text"
                    value={newPayout.project}
                    onChange={(e) => setNewPayout({...newPayout, project: e.target.value})}
                    className="w-full input"
                    placeholder="Enter project name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amount ($)</label>
                  <input
                    type="number"
                    value={newPayout.amount}
                    onChange={(e) => setNewPayout({...newPayout, amount: e.target.value})}
                    className="w-full input"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Edited File Link</label>
                <input
                  type="url"
                  value={newPayout.editedLink}
                  onChange={(e) => setNewPayout({...newPayout, editedLink: e.target.value})}
                  className="w-full input"
                  placeholder="https://drive.google.com/..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <input
                  type="text"
                  value={newPayout.paymentMethod}
                  onChange={(e) => setNewPayout({...newPayout, paymentMethod: e.target.value})}
                  className="w-full input"
                  placeholder="PayPal - your@email.com"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-success"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayoutForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {payouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No payout requests yet</p>
            <p className="text-gray-500 text-sm mt-2">Complete tasks to request payouts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payouts.map((payout: any, index: number) => (
              <div key={payout.id} className="card p-6 hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-white">{payout.project}</h4>
                    <p className="text-gray-400 text-sm">Amount: ${payout.amount}</p>
                    <p className="text-gray-500 text-xs">Requested: {new Date(payout.requested_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    payout.status === 'paid' ? 'status-completed' :
                    payout.status === 'approved' ? 'status-progress' :
                    payout.status === 'rejected' ? 'bg-red-900/50 text-red-400' :
                    'status-pending'
                  }`}>
                    {payout.status}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1">Edited File Link</label>
                    <a href={payout.edited_link} className="accent-blue hover:underline text-sm break-all">
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
        
        <button 
          onClick={() => setShowPayoutForm(true)}
          className="mt-6 btn-success"
        >
          Request New Payout
        </button>
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
            { id: 'profile', icon: User, label: 'Profile' },
            { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
            { id: 'meetings', icon: Calendar, label: 'Meetings' },
            { id: 'notes', icon: MessageSquare, label: 'Notes' },
            { id: 'payout', icon: DollarSign, label: 'Payout' },
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
          { id: 'profile', icon: User },
          { id: 'tasks', icon: CheckSquare },
          { id: 'meetings', icon: Calendar },
          { id: 'notes', icon: MessageSquare },
          { id: 'payout', icon: DollarSign },
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
              <h1 className="text-2xl font-semibold">Editor Dashboard</h1>
              <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                {user.role}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-400">Online</span>
              </div>
            </div>
          </div>

          <div className="bounce-in">
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