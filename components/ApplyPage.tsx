import React, { useState } from 'react';
import { ArrowLeft, User, Mail, MapPin, Briefcase, Link, Phone, Send, Sparkles, UserPlus } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-3xl w-full animate-slide-up">
        <button
          onClick={() => onNavigate('welcome')}
          className="flex items-center gap-3 text-slate-400 hover:text-white transition-all duration-300 mb-12 btn-focus rounded-2xl p-3 -m-3 hover:bg-slate-800/30"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="font-medium">Back to Home</span>
        </button>

        <div className="text-center mb-12">
          <div className="w-24 h-24 glass-card rounded-3xl flex items-center justify-center mx-auto mb-8 glow-purple animate-fade-scale animate-delay-100">
            <UserPlus size={40} strokeWidth={1.5} className="text-purple-400" />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full mb-6 animate-fade-scale animate-delay-200">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-300">Editor Application</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Apply to be an Editor</h2>
          <p className="text-slate-400 font-light text-lg">Join our professional video editing team</p>
        </div>

        <div className="glass-card rounded-3xl p-10 animate-slide-up animate-delay-300">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="animate-slide-up animate-delay-400">
                <label className="block text-slate-300 text-sm font-semibold mb-4">Full Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full pl-14 pr-5 py-5 input-premium rounded-2xl text-white placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              <div className="animate-slide-up animate-delay-500">
                <label className="block text-slate-300 text-sm font-semibold mb-4">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-14 pr-5 py-5 input-premium rounded-2xl text-white placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="animate-slide-up animate-delay-600">
                <label className="block text-slate-300 text-sm font-semibold mb-4">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
                  <input
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full pl-14 pr-5 py-5 input-premium rounded-2xl text-white placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div className="animate-slide-up animate-delay-700">
                <label className="block text-slate-300 text-sm font-semibold mb-4">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full pl-14 pr-5 py-5 input-premium rounded-2xl text-white placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium"
                    placeholder="City, Country"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="animate-slide-up animate-delay-800">
              <label className="block text-slate-300 text-sm font-semibold mb-4">Software Expertise</label>
              <div className="relative">
                <Briefcase className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
                <select
                  value={formData.software}
                  onChange={(e) => setFormData({...formData, software: e.target.value})}
                  className="w-full pl-14 pr-5 py-5 input-premium rounded-2xl text-white focus:outline-none transition-all duration-300 font-medium appearance-none"
                  required
                >
                  <option value="" className="bg-slate-800 text-slate-300">Select your primary software</option>
                  <option value="Adobe Premiere Pro" className="bg-slate-800 text-white">Adobe Premiere Pro</option>
                  <option value="Final Cut Pro" className="bg-slate-800 text-white">Final Cut Pro</option>
                  <option value="DaVinci Resolve" className="bg-slate-800 text-white">DaVinci Resolve</option>
                  <option value="Adobe After Effects" className="bg-slate-800 text-white">Adobe After Effects</option>
                  <option value="Avid Media Composer" className="bg-slate-800 text-white">Avid Media Composer</option>
                  <option value="Other" className="bg-slate-800 text-white">Other</option>
                </select>
              </div>
            </div>

            <div className="animate-slide-up animate-delay-900">
              <label className="block text-slate-300 text-sm font-semibold mb-4">Role/Specialization</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full pl-14 pr-5 py-5 input-premium rounded-2xl text-white focus:outline-none transition-all duration-300 font-medium appearance-none"
                  required
                >
                  <option value="" className="bg-slate-800 text-slate-300">Select your specialization</option>
                  <option value="Video Editor" className="bg-slate-800 text-white">Video Editor</option>
                  <option value="Motion Graphics Designer" className="bg-slate-800 text-white">Motion Graphics Designer</option>
                  <option value="Color Grading Specialist" className="bg-slate-800 text-white">Color Grading Specialist</option>
                  <option value="Sound Designer" className="bg-slate-800 text-white">Sound Designer</option>
                  <option value="VFX Artist" className="bg-slate-800 text-white">VFX Artist</option>
                  <option value="Content Creator" className="bg-slate-800 text-white">Content Creator</option>
                </select>
              </div>
            </div>

            <div className="animate-slide-up animate-delay-900">
              <label className="block text-slate-300 text-sm font-semibold mb-4">Portfolio Link</label>
              <div className="relative">
                <Link className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} strokeWidth={1.5} />
                <input
                  type="url"
                  value={formData.portfolioLink}
                  onChange={(e) => setFormData({...formData, portfolioLink: e.target.value})}
                  className="w-full pl-14 pr-5 py-5 input-premium rounded-2xl text-white placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium"
                  placeholder="https://your-portfolio.com"
                  required
                />
              </div>
              <p className="text-slate-500 text-sm mt-3 font-light">Please provide a link to your portfolio, demo reel, or previous work</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 btn-gradient text-white font-semibold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up animate-delay-900 transition-all duration-300 hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting Application...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Send size={20} strokeWidth={1.5} />
                  Submit Application
                </div>
              )}
            </button>
          </form>
        </div>

        <div className="mt-10 text-center animate-slide-up animate-delay-900">
          <p className="text-slate-400 text-sm font-light">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300 px-2 py-1 rounded-lg hover:bg-blue-500/10"
            >
              Sign in here
            </button>
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
            <span className="text-xs text-slate-500 font-medium">Professional Application Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;