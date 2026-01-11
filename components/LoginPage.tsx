import React, { useState } from 'react';
import { ArrowLeft, User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: (username: string, password: string) => void;
  loading: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLogin, loading: externalLoading }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(formData.username, formData.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      
      <div className="max-w-md w-full relative z-10 animate-slide-up">
        <button
          onClick={() => onNavigate('welcome')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 btn-focus rounded-lg p-2 -m-2"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
          Back to Home
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 animate-fade-scale animate-delay-100">
            <img 
              src="/logo-white.png" 
              alt="Idyll Productions" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400">Sign in to your Idyll Productions account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="animate-slide-up animate-delay-200">
            <label className="block text-slate-300 text-sm font-semibold mb-3">Username or Email</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors btn-focus"
                placeholder="Enter your username or email"
                required
              />
            </div>
          </div>

          <div className="animate-slide-up animate-delay-300">
            <label className="block text-slate-300 text-sm font-semibold mb-3">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-12 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors btn-focus"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between animate-slide-up animate-delay-400">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only" />
              <div className="w-5 h-5 bg-slate-800/50 border border-slate-600 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-600 rounded opacity-0 transition-opacity"></div>
              </div>
              <span className="ml-3 text-slate-400 text-sm">Remember me</span>
            </label>
            <button
              type="button"
              className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={externalLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up animate-delay-500 transition-all"
          >
            {externalLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center animate-slide-up animate-delay-600">
          <p className="text-slate-400 text-sm mb-6">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('create-account')}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Create one here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;