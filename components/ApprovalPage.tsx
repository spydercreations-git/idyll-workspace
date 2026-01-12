import React from 'react';
import { Clock, CheckCircle, Mail, ArrowLeft } from 'lucide-react';

interface ApprovalPageProps {
  onNavigate: (page: string) => void;
}

const ApprovalPage: React.FC<ApprovalPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <button
          onClick={() => onNavigate('welcome')}
          className="flex items-center gap-3 text-slate-400 hover:text-white transition-all duration-300 mb-12 btn-focus rounded-2xl p-3 -m-3 hover:bg-slate-800/30"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="font-medium">Back to Welcome</span>
        </button>

        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center text-white mx-auto mb-8">
            <Clock size={40} strokeWidth={1.5} className="text-amber-400" />
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">Account Under Review</h2>
          <p className="text-slate-400 mb-12 leading-relaxed text-lg font-light">
            Thank you for creating your account! Your application is currently being reviewed by our management team. 
            You'll receive an email notification once your account has been approved.
          </p>

          <div className="space-y-8 mb-12">
            <h3 className="text-xl font-semibold text-white mb-8">What happens next?</h3>
            <div className="space-y-6 text-left max-w-lg mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-2xl flex items-center justify-center text-white text-sm font-semibold mt-1 bg-blue-600">1</div>
                <div>
                  <p className="text-white font-semibold text-lg">Review Process</p>
                  <p className="text-slate-400 font-light">Our team reviews your application and credentials</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-2xl flex items-center justify-center text-white text-sm font-semibold mt-1 bg-blue-600">2</div>
                <div>
                  <p className="text-white font-semibold text-lg">Email Notification</p>
                  <p className="text-slate-400 font-light">You'll receive approval status via email</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-2xl flex items-center justify-center text-white text-sm font-semibold mt-1 bg-blue-600">3</div>
                <div>
                  <p className="text-white font-semibold text-lg">Dashboard Access</p>
                  <p className="text-slate-400 font-light">Once approved, you can access your editor dashboard</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-12 max-w-lg mx-auto">
            <div className="p-6 border border-green-500/20 rounded-2xl">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-green-400 font-semibold">Account Created</p>
              <p className="text-green-300/80 text-sm font-light">Successfully registered</p>
            </div>
            <div className="p-6 border border-amber-500/20 rounded-2xl">
              <Clock className="w-8 h-8 text-amber-400 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-amber-400 font-semibold">Under Review</p>
              <p className="text-amber-300/80 text-sm font-light">Pending approval</p>
            </div>
          </div>

          <div className="p-6 mb-8 border border-blue-500/20 rounded-2xl max-w-lg mx-auto">
            <Mail className="w-6 h-6 text-blue-400 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-slate-300 font-light">
              <span className="font-semibold">Check your email regularly</span> for updates on your application status
            </p>
          </div>

          <button
            onClick={() => onNavigate('login')}
            className="w-full max-w-lg py-4 btn-outline text-slate-300 font-semibold rounded-2xl transition-all duration-300 btn-focus hover:scale-105"
          >
            Try Login (if already approved)
          </button>

          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-xs text-slate-500 font-medium">Review in Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalPage;