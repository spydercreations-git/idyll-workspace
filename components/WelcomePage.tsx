import React, { useState } from 'react';
import { LogIn, UserPlus, Play, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
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
            <div className="w-10 h-10 rounded-2xl glass-panel flex items-center justify-center glow-blue">
              <img 
                src="/logo-white.png" 
                alt="Idyll Productions" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <div>
              <span className="text-xl font-semibold text-white">Idyll Productions</span>
              <div className="text-xs text-slate-400 font-medium">Editor Management System</div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 animate-slide-down animate-delay-100">
            <button 
              onClick={() => setShowAbout(true)} 
              className="text-slate-400 hover:text-white transition-all duration-300 font-medium"
            >
              About
            </button>
            <button 
              onClick={() => window.open('https://idyllproductions.com/', '_blank')} 
              className="text-slate-400 hover:text-white transition-all duration-300 font-medium"
            >
              Portfolio
            </button>
            <button 
              onClick={() => onNavigate('login')} 
              className="px-6 py-3 btn-gradient text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
            >
              Sign In
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[75vh] px-8 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full mb-8 animate-fade-scale">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">Professional Video Production Workflow</span>
            </div>

            {/* Main Headline */}
            <div className="mb-12 animate-slide-up animate-delay-100">
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
                Welcome to
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-gentle-float">
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
                <Sparkles size={22} className="text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
                Apply to be an Editor
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-20 animate-slide-up animate-delay-600">
              {[
                { icon: CheckCircle, title: 'Task Management', desc: 'Assign and track editing tasks' },
                { icon: UserPlus, title: 'Team Collaboration', desc: 'Seamless editor coordination' },
                { icon: Play, title: 'Workflow Automation', desc: 'Streamlined production process' }
              ].map((feature, index) => (
                <div key={index} className={`glass-panel p-8 rounded-3xl text-center hover:scale-105 transition-all duration-300 animate-fade-scale animate-delay-${700 + index * 100}`}>
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl glass-card flex items-center justify-center glow-blue">
                    <feature.icon size={28} className="text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 font-light">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
};

export default WelcomePage;