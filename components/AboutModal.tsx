import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useTiltEffect } from '../hooks/useTiltEffect';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const modalTiltRef = useTiltEffect({ maxTilt: 3, scale: 1.01 });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-scale">
      <div 
        ref={modalTiltRef as any}
        className="max-w-2xl w-full glass-card rounded-2xl p-8 relative tilt-card animate-slide-up"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors btn-focus rounded-lg p-2"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        <div className="text-center mb-8 animate-slide-down animate-delay-100">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 glow-blue animate-fade-scale animate-delay-200">
            <img 
              src="/logo-white.png" 
              alt="Idyll Productions" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">About Idyll Productions</h2>
          <a 
            href="https://idyllproductions.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            idyllproductions.com
            <ExternalLink size={14} strokeWidth={1.5} />
          </a>
        </div>

        <div className="space-y-6 text-slate-300 leading-relaxed animate-slide-up animate-delay-200">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Idyll Productions Workspace</h3>
            <p>
              Idyll Productions Workspace is the internal production system built to keep creative work sharp, fast, and accountable. 
              This is where editors, moderators, and management collaborate without chaos.
            </p>
          </div>

          <p>
            Every task, file, meeting, note, and payout lives in one place—clear, trackable, and secure. 
            No scattered chats. No lost links. No confusion about what's done and what's pending.
          </p>

          <p>
            We designed this workspace for real production workflows, not theory. It's built to support editors who take their craft seriously 
            and teams that value speed, clarity, and quality.
          </p>

          <div className="glass-panel rounded-xl p-6 border-blue-500/20 animate-fade-scale animate-delay-300">
            <p className="text-white font-medium">
              If you're inside this workspace, you're part of the production engine behind Idyll Productions. 
              Do the work. Keep it clean. Ship excellence.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center animate-slide-up animate-delay-400">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-colors btn-focus"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;