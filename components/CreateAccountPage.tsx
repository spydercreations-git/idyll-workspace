import React, { useState } from 'react';
import { ArrowLeft, Mail, User, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';

interface CreateAccountPageProps {
  onNavigate: (page: string) => void;
  onCreateAccount: (email: string, username: string, password: string) => void;
  loading: boolean;
}

const CreateAccountPage: React.FC<CreateAccountPageProps> = ({ onNavigate, onCreateAccount, loading: externalLoading }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    onCreateAccount(formData.email, formData.username, formData.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      
      <div className="max-w-lg w-full relative z-10">
        <button
          onClick={() => onNavigate('welcome')}
          className="flex items-center gap-3 text-slate-400 hover:text-white transition-all duration-300 mb-12 btn-focus rounded-2xl p-3 -m-3 hover:bg-slate-800/30"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="font-medium">Back to Home</span>
        </button>

        <div className="text-center mb-12">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-8">
            <UserPlus size={40} strokeWidth={1.5} className="text-blue-400" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Join Idyll Productions</h2>
          <p className="text-slate-400 font-light text-lg">Create your editor account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-4">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-14 pr-5 py-5 input-premium rounded-2xl text-white placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium"
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-4">Username</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full pl-14 pr-5 py-5 input-premium rounded-2xl text-white placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium"
                placeholder="Choose a username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-4">Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-14 pr-14 py-5 input-premium rounded-2xl text-white placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium"
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-300 p-1 rounded-lg hover:bg-slate-700/30"
              >
                {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-4">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full pl-14 pr-14 py-5 input-premium rounded-2xl text-white placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-300 p-1 rounded-lg hover:bg-slate-700/30"
              >
                {showConfirmPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={externalLoading}
            className="w-full py-5 btn-outline text-white font-semibold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
          >
            {externalLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <UserPlus size={20} />
                Create Account
              </div>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-400 text-sm font-light">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300 px-2 py-1 rounded-lg hover:bg-blue-500/10"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;