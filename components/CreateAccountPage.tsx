import React, { useState } from 'react';
import { ArrowLeft, Mail, User, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

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
  const [step, setStep] = useState(1); // 1: form, 2: email verification

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

  const handleVerifyEmail = () => {
    // Simulate email verification
    alert('Verification email sent! Check your inbox.');
    setTimeout(() => {
      onNavigate('approval');
    }, 1000);
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        
        <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center relative z-10 animate-slide-up">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 glow-purple animate-fade-scale">
            <Mail size={40} strokeWidth={1.5} />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">Check Your Email</h2>
          <p className="text-slate-400 mb-6">We've sent a verification link to:</p>
          <p className="text-indigo-400 font-semibold mb-8 break-all">{formData.email}</p>
          
          <button
            onClick={handleVerifyEmail}
            className="w-full py-4 btn-gradient text-white font-semibold rounded-xl mb-4"
          >
            I've Verified My Email
          </button>
          
          <button
            onClick={() => setStep(1)}
            className="text-slate-400 text-sm hover:text-white transition-colors"
          >
            Back to form
          </button>
        </div>
      </div>
    );
  }

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
            <User size={40} strokeWidth={1.5} className="text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Join Idyll Productions</h2>
          <p className="text-slate-400">Create your editor account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="animate-slide-up animate-delay-200">
            <label className="block text-slate-300 text-sm font-semibold mb-3">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors btn-focus"
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          <div className="animate-slide-up animate-delay-300">
            <label className="block text-slate-300 text-sm font-semibold mb-3">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors btn-focus"
                placeholder="Choose a username"
                required
              />
            </div>
          </div>

          <div className="animate-slide-up animate-delay-400">
            <label className="block text-slate-300 text-sm font-semibold mb-3">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-12 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors btn-focus"
                placeholder="Create a strong password"
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

          <div className="animate-slide-up animate-delay-500">
            <label className="block text-slate-300 text-sm font-semibold mb-3">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full pl-12 pr-12 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors btn-focus"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={externalLoading}
            className="w-full py-4 btn-gradient text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up animate-delay-600"
          >
            {externalLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center animate-slide-up animate-delay-600">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
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