import React, { useState } from 'react';
import { LogIn, UserPlus, Play, ArrowRight, CheckCircle } from 'lucide-react';
import AboutModal from './AboutModal';

interface WelcomePageProps {
  onNavigate: (page: string) => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onNavigate }) => {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6 md:p-8">
          <div className="flex items-center gap-3 animate-slide-down">
            <img 
              src="/logo-white.png" 
              alt="Idyll Productions" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-semibold text-white">Idyll Productions</span>
          </div>
          
          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm animate-slide-down animate-delay-100">
            <button onClick={() => setShowAbout(true)} className="text-slate-400 hover:text-white transition-colors">About</button>
            <button onClick={() => window.open('https://idyllproductions.com/', '_blank')} className="text-slate-400 hover:text-white transition-colors">Portfolio</button>
            <button onClick={() => onNavigate('login')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
              Sign In
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Main Headline */}
            <div className="mb-12 animate-slide-up">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Welcome to Idyll Productions
                <span className="block bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Workspace
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 mb-4 max-w-3xl mx-auto leading-relaxed">
                Streamline your video production workflow with our comprehensive editor management platform.
              </p>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Manage tasks, track progress, handle payouts, and collaborate seamlessly with your editing team.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up animate-delay-200">
              <button 
                onClick={() => onNavigate('login')}
                className="px-8 py-4 btn-gradient text-white font-semibold text-lg flex items-center justify-center gap-2 min-w-[240px] rounded-xl"
              >
                <LogIn size={20} /> Login
              </button>
              <button 
                onClick={() => onNavigate('create-account')}
                className="px-8 py-4 btn-outline text-white font-semibold text-lg flex items-center justify-center gap-2 min-w-[240px] rounded-xl"
              >
                <UserPlus size={20} /> Create New Account
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-wrap justify-center gap-4 mb-16 animate-slide-up animate-delay-300">
              <button 
                onClick={() => onNavigate('apply')}
                className="px-8 py-4 btn-gradient text-white font-semibold text-lg flex items-center justify-center gap-2 min-w-[240px] rounded-xl"
              >
                <UserPlus size={20} />
                Apply to be an Editor
              </button>
            </div>
          </div>
        </div>
      </div>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
};

export default WelcomePage;