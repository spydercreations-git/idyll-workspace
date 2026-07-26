import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, RefreshCw, ChevronDown } from 'lucide-react';
import logoImg from '../assets/logo.png';
import idyllTrackLogo from '../assets/IdyllTrackLogo.svg';

const RenderField = ({ isExporting, value, type = "text", onChange, placeholder, style, isTextarea, maxLength }) => {
  if (isExporting) {
    return <div style={{ overflowWrap: 'break-word', wordBreak: 'normal', whiteSpace: 'pre-wrap', minHeight: '1.5rem', ...style }}>{value}</div>;
  }
  if (isTextarea) {
    return <textarea rows="3" placeholder={placeholder} value={value} onChange={onChange} style={style} maxLength={maxLength} onInput={e => {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    }} />;
  }
  return <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={style} maxLength={maxLength} />;
};

const Invoice = ({ role, currency, isExporting }) => {
  const [items, setItems] = useState([{ id: 1, description: '', quantity: 1, rate: 0 }]);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [payroll, setPayroll] = useState([{ id: 1, role: '', amount: 0 }]);
  
  // Uncontrolled states converted to controlled
  const [invoiceNo, setInvoiceNo] = useState('1');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromPhone, setFromPhone] = useState('');
  const [billToName, setBillToName] = useState('Idyll Productions Pvt. Ltd.');
  const [billToEmail, setBillToEmail] = useState('');
  const [billToPhone, setBillToPhone] = useState('');
  const [shipTo, setShipTo] = useState('');
  const [date, setDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invoiceType, setInvoiceType] = useState('100% Invoice');
  const [isInvoiceTypeDropdownOpen, setIsInvoiceTypeDropdownOpen] = useState(false);
  const invoiceTypeRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (invoiceTypeRef.current && !invoiceTypeRef.current.contains(event.target)) {
        setIsInvoiceTypeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isEditor = role === 'editor';

  const calculateSubtotal = () => {
    if (isEditor) {
      return items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    } else {
      return payroll.reduce((sum, item) => sum + Number(item.amount), 0);
    }
  };

  const subtotal = calculateSubtotal();

  const addItem = () => {
    if (items.length < 4) {
      setItems([...items, { id: Date.now(), description: '', quantity: 1, rate: 0 }]);
    } else {
      alert('Maximum 4 items allowed to ensure the invoice fits on a single A4 page.');
    }
  };
  const removeItem = (id) => setItems(items.filter(i => i.id !== id));
  const updateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addPayroll = () => {
    if (payroll.length < 4) {
      setPayroll([...payroll, { id: Date.now(), role: '', amount: 0 }]);
    } else {
      alert('Maximum 4 items allowed to ensure the invoice fits on a single A4 page.');
    }
  };
  const removePayroll = (id) => setPayroll(payroll.filter(i => i.id !== id));
  const updatePayroll = (id, field, value) => {
    setPayroll(payroll.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <div className="card" id="invoice-content">
      <div className="flex justify-between items-center invoice-header">
        <div className="flex gap-4 items-center">
          <img src={logoImg} alt="Idyll Productions Logo" style={{ width: '150px', objectFit: 'contain' }} />
        </div>
        <div className="flex-col" style={{ alignItems: 'flex-end', gap: '0.5rem' }}>
          <h1 className="title" style={{ fontSize: '3rem', color: 'var(--black)' }}>INVOICE</h1>
          <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end' }}>
            <span style={{ fontWeight: '600', color: 'var(--gray-400)' }}>#</span>
            {isExporting ? (
              <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{invoiceNo}</span>
            ) : (
              <RenderField isExporting={false} value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} style={{ width: '80px', textAlign: 'right' }} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="flex-col gap-8">
          <div className="flex-col gap-4">
            <label style={{ fontSize: '1.2rem', color: 'var(--black)', display: 'block', fontWeight: 'bold' }}>FROM</label>
            <div className="flex items-center gap-4">
              <label style={{ margin: 0, whiteSpace: 'nowrap', minWidth: '130px' }}>NAME</label>
              <RenderField isExporting={isExporting} value={fromName} onChange={e => setFromName(e.target.value)} placeholder="Required Name" style={{ flex: 1 }} maxLength={50} />
            </div>
            <div className="flex items-center gap-4">
              <label style={{ margin: 0, whiteSpace: 'nowrap', minWidth: '130px' }}>EMAIL ID</label>
              <RenderField isExporting={isExporting} type="email" value={fromEmail} onChange={e => setFromEmail(e.target.value)} placeholder="Required Email ID" style={{ flex: 1 }} maxLength={50} />
            </div>
            <div className="flex items-center gap-4">
              <label style={{ margin: 0, whiteSpace: 'nowrap', minWidth: '130px' }}>PHONE NUMBER</label>
              <RenderField isExporting={isExporting} type="tel" value={fromPhone} onChange={e => setFromPhone(e.target.value)} placeholder="Required Phone Number" style={{ flex: 1 }} maxLength={20} />
            </div>
          </div>
          
          <div className="flex-col gap-4">
            <label style={{ fontSize: '1.2rem', color: 'var(--black)', display: 'block', fontWeight: 'bold' }}>BILL TO</label>
            <div className="flex items-center gap-4">
              <label style={{ margin: 0, whiteSpace: 'nowrap', minWidth: '130px' }}>NAME</label>
              <RenderField isExporting={isExporting} value={billToName} onChange={e => setBillToName(e.target.value)} placeholder="Required Name" style={{ flex: 1 }} maxLength={50} />
            </div>
            <div className="flex items-center gap-4">
              <label style={{ margin: 0, whiteSpace: 'nowrap', minWidth: '130px' }}>EMAIL ID</label>
              <RenderField isExporting={isExporting} type="email" value={billToEmail} onChange={e => setBillToEmail(e.target.value)} placeholder="Required Email ID" style={{ flex: 1 }} maxLength={50} />
            </div>
            <div className="flex items-center gap-4">
              <label style={{ margin: 0, whiteSpace: 'nowrap', minWidth: '130px' }}>PHONE NUMBER</label>
              <RenderField isExporting={isExporting} type="tel" value={billToPhone} onChange={e => setBillToPhone(e.target.value)} placeholder="Required Phone Number" style={{ flex: 1 }} maxLength={20} />
            </div>
          </div>
        </div>
        
        <div className="flex-col gap-6 right-column" style={{ width: '90%', marginLeft: 'auto' }}>
          <div className="flex items-center gap-4">
            <label style={{ margin: 0, whiteSpace: 'nowrap', minWidth: '130px' }}>DATE</label>
            <RenderField isExporting={isExporting} type="date" value={date} onChange={e => setDate(e.target.value)} style={{ flex: 1 }} />
          </div>
          <div className="flex items-center gap-4">
            <label style={{ margin: 0, whiteSpace: 'nowrap', minWidth: '130px' }}>PAYMENT METHOD</label>
            <RenderField isExporting={isExporting} value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} style={{ flex: 1 }} maxLength={30} />
          </div>
          <div className="flex items-center gap-4">
            <label style={{ margin: 0, whiteSpace: 'nowrap', minWidth: '130px' }}>DUE DATE</label>
            <RenderField isExporting={isExporting} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ flex: 1 }} />
          </div>
          {isEditor && (
            <div className="flex items-center gap-4">
              <label style={{ margin: 0, whiteSpace: 'nowrap', minWidth: '130px' }}>INVOICE TYPE</label>
              {isExporting ? (
                <div style={{ flex: 1, padding: '0.2rem 0', minHeight: '1.5rem', wordBreak: 'break-word' }}>{invoiceType}</div>
              ) : (
                <div className="relative" ref={invoiceTypeRef} style={{ flex: 1, position: 'relative' }}>
                  <div 
                    onClick={() => setIsInvoiceTypeDropdownOpen(!isInvoiceTypeDropdownOpen)}
                    style={{ 
                      width: '100%', 
                      padding: '0.85rem', 
                      border: '1px solid var(--gray-200)', 
                      borderRadius: 'var(--border-radius)', 
                      backgroundColor: 'var(--bg-light)', 
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{invoiceType}</span>
                    <ChevronDown size={16} style={{ transition: 'transform 0.2s ease', transform: isInvoiceTypeDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </div>
                  
                  {isInvoiceTypeDropdownOpen && (
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
                      {['100% Invoice', '50% Invoice', '25% Invoice'].map(option => (
                        <div 
                          key={option}
                          style={{ padding: '0.75rem 1rem', cursor: 'pointer', transition: 'background 0.2s ease', color: 'var(--black)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 115, 0, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          onClick={() => { setInvoiceType(option); setIsInvoiceTypeDropdownOpen(false); }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isEditor ? (
        <>
          <div className="invoice-table-wrapper">
            <table className="invoice-table">
              <thead>
              <tr>
                <th style={{ width: '50%' }}>Item</th>
                <th style={{ width: '15%' }}>Quantity</th>
                <th style={{ width: '15%' }}>Rate</th>
                <th style={{ width: '15%' }}>Amount</th>
                <th style={{ width: '5%' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><RenderField isExporting={isExporting} value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="Description of item/service..." /></td>
                  <td><RenderField isExporting={isExporting} type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} /></td>
                  <td><RenderField isExporting={isExporting} type="number" value={item.rate} onChange={e => updateItem(item.id, 'rate', Number(e.target.value))} /></td>
                  <td style={{ verticalAlign: 'middle', fontWeight: '500' }}>{currency}{(item.quantity * item.rate).toFixed(2)}</td>
                  <td className="no-print">
                    <button className="btn btn-icon" onClick={() => removeItem(item.id)}><Trash2 size={16} color="var(--gray-400)" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            <button className="btn btn-primary no-print" onClick={addItem}>Add Item</button>
          </div>
        </>
      ) : (
        <>
          <div className="invoice-table-wrapper">
            <table className="invoice-table">
              <thead>
              <tr>
                <th style={{ width: '50%' }}>Role</th>
                <th style={{ width: '45%' }}>Amount</th>
                <th style={{ width: '5%' }}></th>
              </tr>
            </thead>
            <tbody>
              {payroll.map(item => (
                <tr key={item.id}>
                  <td><RenderField isExporting={isExporting} value={item.role} onChange={e => updatePayroll(item.id, 'role', e.target.value)} placeholder="What is your role?" /></td>
                  <td><RenderField isExporting={isExporting} type="number" value={item.amount} onChange={e => updatePayroll(item.id, 'amount', e.target.value)} placeholder="Payroll amount" /></td>
                  <td className="no-print">
                    <button className="btn btn-icon" onClick={() => removePayroll(item.id)}><Trash2 size={16} color="var(--gray-400)" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            <button className="btn btn-primary no-print" onClick={addPayroll}>Add Payroll</button>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-8" style={{ marginTop: '4rem' }}>
        <div className="flex-col gap-4">
          <div>
            <label>Payment Details and Notes</label>
            <RenderField isExporting={isExporting} isTextarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Payment Details and Notes - any relevant information not already covered" maxLength={250} />
          </div>
        </div>
        
        <div className="flex-col gap-4">
          <div className="flex justify-between items-center pb-4">
            <span style={{ fontWeight: '700', fontSize: '1.4rem' }}>Total</span>
            <span style={{ fontWeight: '700', fontSize: '1.4rem' }}>{currency}{subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-12 pt-4" style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
        <span>Powered by <strong>Idyll Tracks Payments</strong></span>
        <img src={idyllTrackLogo} alt="Idyll Tracks Logo" style={{ height: '24px' }} />
      </div>
    </div>
  );
};

export default Invoice;
