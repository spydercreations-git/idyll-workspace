import React, { useState } from 'react';
import { ArrowLeft, User, Mail, MapPin, Briefcase, Link, Phone, Send } from 'lucide-react';

interface ApplyPageProps {
  onNavigate: (page: string) => void;
  onSubmitApplication?: (applicationData: any) => void;
}

const ApplyPage: React.FC<ApplyPageProps> = ({ onNavigate, onSubmitApplication }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contact: '',
    location: '',
    software: '',
    role: '',
    portfolioLink: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Create application data
    const applicationData = {
      name: formData.fullName,
      email: formData.email,
      contact: formData.contact,
      location: formData.location,
      software: formData.software,
      role: formData.role,
      portfolio: formData.portfolioLink,
      appliedAt: new Date().toISOString().split('T')[0]
    };
    
    // Submit application if callback provided
    if (onSubmitApplication) {
      onSubmitApplication(applicationData);
    }
    
    // Simulate application submission
    setTimeout(() => {
      setLoading(false);
      alert('Application submitted successfully! We will review your application and get back to you soon.');
      onNavigate('welcome');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full animate-slide-up">
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
              className="w-12 h-12 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Apply to be an Editor</h2>
          <p className="text-slate-400">Join our professional video editing team</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="animate-slide-up animate-delay-200">
              <label className="block text-slate-300 text-sm font-semibold mb-3">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors btn-focus"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            <div className="animate-slide-up animate-delay-300">
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
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="animate-slide-up animate-delay-400">
              <label className="block text-slate-300 text-sm font-semibold mb-3">Contact Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
                <input
                  type="tel"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors btn-focus"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>

            <div className="animate-slide-up animate-delay-500">
              <label className="block text-slate-300 text-sm font-semibold mb-3">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors btn-focus"
                  placeholder="City, Country"
                  required
                />
              </div>
            </div>
          </div>

          <div className="animate-slide-up animate-delay-600">
            <label className="block text-slate-300 text-sm font-semibold mb-3">Software Expertise</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
              <select
                value={formData.software}
                onChange={(e) => setFormData({...formData, software: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors btn-focus"
                required
              >
                <option value="">Select your primary software</option>
                <option value="Adobe Premiere Pro">Adobe Premiere Pro</option>
                <option value="Final Cut Pro">Final Cut Pro</option>
                <option value="DaVinci Resolve">DaVinci Resolve</option>
                <option value="Adobe After Effects">Adobe After Effects</option>
                <option value="Avid Media Composer">Avid Media Composer</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="animate-slide-up animate-delay-700">
            <label className="block text-slate-300 text-sm font-semibold mb-3">Role/Specialization</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors btn-focus"
                required
              >
                <option value="">Select your specialization</option>
                <option value="Video Editor">Video Editor</option>
                <option value="Motion Graphics Designer">Motion Graphics Designer</option>
                <option value="Color Grading Specialist">Color Grading Specialist</option>
                <option value="Sound Designer">Sound Designer</option>
                <option value="VFX Artist">VFX Artist</option>
                <option value="Content Creator">Content Creator</option>
              </select>
            </div>
          </div>

          <div className="animate-slide-up animate-delay-800">
            <label className="block text-slate-300 text-sm font-semibold mb-3">Portfolio Link</label>
            <div className="relative">
              <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
              <input
                type="url"
                value={formData.portfolioLink}
                onChange={(e) => setFormData({...formData, portfolioLink: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors btn-focus"
                placeholder="https://your-portfolio.com"
                required
              />
            </div>
            <p className="text-slate-500 text-xs mt-2">Please provide a link to your portfolio, demo reel, or previous work</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up animate-delay-900 transition-all transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting Application...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Send size={20} strokeWidth={1.5} />
                Submit Application
              </div>
            )}
          </button>
        </form>

        <div className="mt-8 text-center animate-slide-up animate-delay-900">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;