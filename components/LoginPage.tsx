import React, { useState } from 'react';
import { ArrowLeft, User, Lock, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      
      <div className="max-w-lg w-full relative z-10 animate-slide-up">
        <button
          onClick={() => onNavigate('welcome')}
          className="flex items-center gap-3 text-slate-400 hover:text-white transition-all duration-300 mb-12 btn-focus rounded-2xl p-3 -m-3 hover:bg-slate-800/30"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="font-medium">Back to Home</span>
        </button>

        <div className="text-center mb-12">
          <div className="w-24 h-24 glass-card rounded-3xl flex items-center justify-center mx-auto mb-8 glow-blue animate-fade-scale animate-delay-100">
            <img 
              src="/logo-white.png" 
              alt="Idyll Productions" 
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full mb-6 animate-fade-scale animate-delay-200">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">Secure Access Portal</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Welcome Back</h2>
          <p className="text-slate-400 font-light text-lg">Sign in to your Idyll Productions workspace</p>
        </div>

        <div className="glass-card rounded-3xl p-10 animate-slide-up animate-delay-300">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="animate-slide-up animate-delay-400">
              <label className="block text-slate-300 text-sm font-semibold mb-4">Username or Email</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full pl-14 pr-5 py-5 input-premium rounded-2xl text-white placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium"
                  placeholder="Enter your username or email"
                  required
                />
              </div>
            </div>

            <div className="animate-slide-up animate-delay-500">
              <label className="block text-slate-300 text-sm font-semibold mb-4">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-14 pr-14 py-5 input-premium rounded-2xl text-white placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium"
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between animate-slide-up animate-delay-600">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="sr-only" />
                  <div className="w-6 h-6 glass-panel border border-slate-600 rounded-lg flex items-center justify-center group-hover:border-blue-500/50 transition-all duration-300">
                    <div className="w-3 h-3 bg-blue-600 rounded opacity-0 transition-opacity duration-300"></div>
                  </div>
                </div>
                <span className="ml-3 text-slate-400 text-sm font-medium group-hover:text-slate-300 transition-colors duration-300">Remember me</span>
              </label>
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors duration-300 px-2 py-1 rounded-lg hover:bg-blue-500/10"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={externalLoading}
              className="w-full py-5 btn-gradient text-white font-semibold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up animate-delay-700 transition-all duration-300 hover:scale-105"
            >
              {externalLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <LogIn size={20} />
                  Sign In to Dashboard
                </div>
              )}
            </button>
          </form>
        </div>

        <div className="mt-10 text-center animate-slide-up animate-delay-800">
          <p className="text-slate-400 text-sm font-light mb-6">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('create-account')}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300 px-2 py-1 rounded-lg hover:bg-blue-500/10"
            >
              Create one here
            </button>
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-xs text-slate-500 font-medium">Secure Login Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;