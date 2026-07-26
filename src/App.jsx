import React, { useState, useEffect, useRef } from 'react';
import Invoice from './components/Invoice';
import CurrencyConverter from './components/CurrencyConverter';
import Calculator from './components/Calculator';
import PercentageCalculator from './components/PercentageCalculator';
import { Download, Send, Settings, User, Play, ChevronDown } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import idyllTrackLogo from './assets/IdyllTrackLogo.svg';

function App() {
  const [role, setRole] = useState('editor'); // 'editor' or 'team_member'
  const [currency, setCurrency] = useState('$');
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCurrencyDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownload = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      const element = document.getElementById('invoice-content');
      element.classList.add('pdf-export');

      const opt = {
        margin:       0.3,
        filename:     'invoice.pdf',
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(element).save().then(() => {
        element.classList.remove('pdf-export');
        setIsExporting(false);
      });
    }, 200); // Give React time to render in export mode
  };

  return (
    <div className="container" style={{ padding: '2rem' }}>
      
      {/* Global Header */}
      <div className="flex justify-between items-center no-print" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        {/* Brand Area */}
          <div className="flex items-center" style={{ gap: '1.25rem' }}>
            <img src={idyllTrackLogo} alt="Idyll Tracks Logo" style={{ height: '36px' }} />
            <h1 style={{ fontSize: '1.6rem', fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 'bold', letterSpacing: '-0.02em', color: 'var(--black)', margin: 0 }}>
              Idyll Invoicing
            </h1>
          </div>

          <div className="flex items-center gap-8 header-actions">
            <div className="relative" ref={dropdownRef} style={{ position: 'relative' }}>
              <button 
                className="btn btn-outline" 
                style={{ minWidth: '120px', borderColor: 'var(--primary)', color: 'var(--primary)', justifyContent: 'space-between' }}
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
              >
                {currency === '$' ? 'USD ($)' : 'INR (₹)'}
                <ChevronDown size={18} style={{ transition: 'transform 0.2s ease', transform: isCurrencyDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>
              
              {isCurrencyDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '0.5rem',
                  width: '100%',
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--primary)',
                  borderRadius: 'var(--border-radius)',
                  boxShadow: '0 4px 12px rgba(255, 115, 0, 0.15)',
                  zIndex: 50,
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{ padding: '0.75rem 1rem', cursor: 'pointer', transition: 'background 0.2s ease', color: 'var(--black)', fontWeight: 500 }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 115, 0, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => { setCurrency('$'); setIsCurrencyDropdownOpen(false); }}
                  >
                    USD ($)
                  </div>
                  <div 
                    style={{ padding: '0.75rem 1rem', cursor: 'pointer', transition: 'background 0.2s ease', color: 'var(--black)', fontWeight: 500 }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 115, 0, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => { setCurrency('₹'); setIsCurrencyDropdownOpen(false); }}
                  >
                    INR (₹)
                  </div>
                </div>
              )}
            </div>
            <button className="btn btn-outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)', whiteSpace: 'nowrap' }} onClick={() => setRole(role === 'editor' ? 'team_member' : 'editor')}>
              <User size={18} /> Switch to {role === 'editor' ? 'Team Member' : 'Editor'}
            </button>
            <button className="btn btn-outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)', whiteSpace: 'nowrap' }} onClick={() => document.getElementById('tutorial-video')?.scrollIntoView({ behavior: 'smooth' })}>
              <Play size={18} fill="currentColor" /> Watch Tutorial
            </button>
            <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={handleDownload}>
              <Download size={18} /> Download PDF
            </button>
          </div>
      </div>

      <div className="no-print" style={{ backgroundColor: '#fff3f3', border: '1px solid #ffcccc', color: '#cc0000', padding: '1rem', borderRadius: 'var(--border-radius)', marginBottom: '2rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem' }}>
        Don't use this website without the permission of finance team of production and this website is will be closed in some days. This is a temporary website. We are shifting into new. idyll productions workspace
      </div>

      <div className="app-layout" style={{ display: 'flex', gap: '2rem' }}>
        {/* Main Invoice Area */}
        <div style={{ flex: '1', minWidth: 0 }}>
          <Invoice role={role} currency={currency} isExporting={isExporting} />
        
        {/* Company Policies & Info - OUTSIDE of PDF export */}
        <div className="card mt-8" style={{ marginTop: '2rem' }}>
          <div className="flex items-center justify-between" style={{ borderBottom: '2px solid var(--gray-200)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>About Idyll Tracks</h2>
              <p style={{ color: 'var(--gray-600)' }}>The official internal payment and invoice management platform for <strong>Idyll Productions</strong>.</p>
            </div>
            <img src={idyllTrackLogo} alt="Idyll Tracks Logo" style={{ height: '40px' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '1rem' }}>This platform allows team members, editors, and freelancers to create, manage, and submit invoices securely while keeping payment records organized in one place.</p>
            
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Invoice Submission</h3>
            <p style={{ marginBottom: '0.5rem' }}>Please send all completed invoices to: <strong><a href="mailto:idylltracks@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'none' }}>idylltracks@gmail.com</a></strong></p>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>To help us process payments efficiently, <strong>submit each invoice only once</strong>. If you need to make changes to an invoice after submission, please wait for our team to request a revised version instead of sending multiple copies.</p>
          </div>

          <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Privacy Policy</h3>
            <p style={{ marginBottom: '0.5rem' }}>This platform is intended exclusively for <strong>Idyll Productions team members, hired editors, and freelancers</strong>.</p>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>It is provided solely for work related to Idyll Productions, including invoice creation, payment management, and internal business operations. Personal or unauthorized use of this platform is not permitted.</p>
          </div>

          <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Support</h3>
            <p style={{ marginBottom: '0.5rem' }}>For payment inquiries, technical issues, or general assistance, contact:</p>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.25rem' }}>• <strong><a href="mailto:harshidyllproductions@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'none' }}>harshidyllproductions@gmail.com</a></strong></li>
              <li>• <strong><a href="mailto:rohitidyllproductions@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'none' }}>rohitidyllproductions@gmail.com</a></strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sidebar Area */}
      <div style={{ width: '300px' }} className="no-print sidebar-area">
        <div className="flex-col gap-4">

          <CurrencyConverter />
          <Calculator />
          <PercentageCalculator />

          {/* Video Embed - Moved to Sidebar */}
          <div id="tutorial-video" className="card no-print" style={{ border: '2px solid var(--primary)', padding: '1rem', marginTop: '0.5rem' }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '4px' }}>
              <iframe 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src="https://www.youtube.com/embed/Q1TZqnUKD4Q" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: '1.4' }}>
              <strong>Important:</strong> Watch this video before making an invoice for the first time. Watch it fully and follow the step-by-step guide. If you do not fill in your details according to it, your invoice will be rejected.
            </div>
          </div>

        </div>
      </div>

      </div>
    </div>
  );
}

export default App;
