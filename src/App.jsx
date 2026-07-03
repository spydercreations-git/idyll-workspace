import React, { useState } from 'react';
import Invoice from './components/Invoice';
import CurrencyConverter from './components/CurrencyConverter';
import Calculator from './components/Calculator';
import PercentageCalculator from './components/PercentageCalculator';
import { Download, Send, Settings, User } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import idyllTrackLogo from './assets/IdyllTrackLogo.svg';

function App() {
  const [role, setRole] = useState('editor'); // 'editor' or 'team_member'
  const [currency, setCurrency] = useState('$');
  const [isExporting, setIsExporting] = useState(false);

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
    <div className="container app-layout" style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
      
      {/* Main Invoice Area */}
      <div style={{ flex: '1', minWidth: 0 }}>
        <div className="flex justify-end items-center no-print" style={{ marginBottom: '3rem' }}>
          <div className="flex items-center gap-8 header-actions">
            <select className="btn btn-outline" style={{ width: 'auto', borderColor: 'var(--primary)', color: 'var(--primary)', cursor: 'pointer', appearance: 'none', paddingRight: '2.5rem', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FF7300%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="$">USD ($)</option>
              <option value="₹">INR (₹)</option>
            </select>
            <button className="btn btn-outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)', whiteSpace: 'nowrap' }} onClick={() => setRole(role === 'editor' ? 'team_member' : 'editor')}>
              <User size={18} /> Switch to {role === 'editor' ? 'Team Member' : 'Editor'}
            </button>
            <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={handleDownload}>
              <Download size={18} /> Download PDF
            </button>
          </div>
        </div>

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

        </div>
      </div>
    </div>
  );
}

export default App;
