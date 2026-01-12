import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
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
        <nav className="flex items-center justify-between p-8 md:p-12">
          <div className="flex items-center gap-4 animate-slide-down">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center">
              <img 
                src="/logo-white.png" 
                alt="Idyll Productions" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <div>
              <span className="text-xl font-semibold text-white">Idyll Productions</span>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 animate-slide-down animate-delay-100">
            <button 
              onClick={() => setShowAbout(true)} 
              className="text-slate-400 hover:text-white transition-all duration-300 font-medium"
            >
              About Us
            </button>
            <button 
              onClick={() => window.open('https://idyllproductions.com/', '_blank')} 
              className="text-slate-400 hover:text-white transition-all duration-300 font-medium"
            >
              Portfolio
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[75vh] px-8 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Main Headline */}
            <div className="mb-12 animate-slide-up animate-delay-100">
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
                Welcome to
                <span className="block text-white animate-gentle-float">
                  Idyll Productions
                </span>
                <span className="block text-4xl md:text-5xl font-semibold text-slate-300 mt-4">
                  Workspace
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 mb-6 max-w-4xl mx-auto leading-relaxed font-light">
                Streamline your video production workflow with our comprehensive editor management platform.
              </p>
              <p className="text-lg text-slate-500 max-w-3xl mx-auto font-light">
                Manage tasks, track progress, handle payouts, and collaborate seamlessly with your editing team.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up animate-delay-300">
              <button 
                onClick={() => onNavigate('login')}
                className="group px-10 py-5 btn-gradient text-white font-semibold text-lg flex items-center justify-center gap-3 min-w-[280px] rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <LogIn size={22} className="group-hover:rotate-12 transition-transform duration-300" /> 
                Login to Dashboard
              </button>
              <button 
                onClick={() => onNavigate('create-account')}
                className="group px-10 py-5 btn-outline text-white font-semibold text-lg flex items-center justify-center gap-3 min-w-[280px] rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <UserPlus size={22} className="group-hover:scale-110 transition-transform duration-300" /> 
                Create New Account
              </button>
            </div>

            {/* Secondary Action */}
            <div className="animate-slide-up animate-delay-500">
              <button 
                onClick={() => onNavigate('apply')}
                className="group px-10 py-5 surface-card text-white font-semibold text-lg flex items-center justify-center gap-3 min-w-[280px] rounded-2xl transition-all duration-300 hover:scale-105 border border-slate-600/50 hover:border-blue-500/30"
              >
                <UserPlus size={22} className="text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
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