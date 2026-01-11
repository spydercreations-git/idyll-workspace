import React from 'react';
import { Clock, CheckCircle, Mail, ArrowLeft } from 'lucide-react';

interface ApprovalPageProps {
  onNavigate: (page: string) => void;
}

const ApprovalPage: React.FC<ApprovalPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full glass-card rounded-2xl p-8 text-center">
        <button
          onClick={() => onNavigate('welcome')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 btn-focus rounded-lg p-2 -m-2"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
          Back to Welcome
        </button>

        <div className="w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center text-white mx-auto mb-6 glow-blue">
          <Clock size={32} strokeWidth={1.5} />
        </div>
        
        <h2 className="text-2xl font-semibold text-white mb-4">Account Under Review</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Thank you for creating your account! Your application is currently being reviewed by our management team. 
          You'll receive an email notification once your account has been approved.
        </p>

        <div className="glass-panel rounded-xl p-6 mb-8">
          <h3 className="text-lg font-medium text-white mb-4">What happens next?</h3>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium mt-0.5">1</div>
              <div>
                <p className="text-white font-medium">Review Process</p>
                <p className="text-slate-400 text-sm">Our team reviews your application and credentials</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium mt-0.5">2</div>
              <div>
                <p className="text-white font-medium">Email Notification</p>
                <p className="text-slate-400 text-sm">You'll receive approval status via email</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium mt-0.5">3</div>
              <div>
                <p className="text-white font-medium">Dashboard Access</p>
                <p className="text-slate-400 text-sm">Once approved, you can access your editor dashboard</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="glass-panel rounded-xl p-4 border-green-500/20">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-green-400 font-medium text-sm">Account Created</p>
            <p className="text-green-300/80 text-xs">Successfully registered</p>
          </div>
          <div className="glass-panel rounded-xl p-4 border-amber-500/20">
            <Clock className="w-6 h-6 text-amber-400 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-amber-400 font-medium text-sm">Under Review</p>
            <p className="text-amber-300/80 text-xs">Pending approval</p>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 mb-6">
          <Mail className="w-5 h-5 text-blue-400 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-slate-300 text-sm">
            <span className="font-medium">Check your email regularly</span> for updates on your application status
          </p>
        </div>

        <button
          onClick={() => onNavigate('login')}
          className="w-full py-3 bg-slate-800/50 text-slate-300 font-medium rounded-xl hover:bg-slate-700/50 transition-colors btn-focus"
        >
          Try Login (if already approved)
        </button>

        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
          <span className="text-xs text-slate-500 font-medium">Review in Progress</span>
        </div>
      </div>
    </div>
  );
};

export default ApprovalPage;