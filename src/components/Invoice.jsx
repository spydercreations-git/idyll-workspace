import React, { useState } from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import logoImg from '../assets/logo.png';
import idyllTrackLogo from '../assets/IdyllTrackLogo.svg';

const RenderField = ({ isExporting, value, type = "text", onChange, placeholder, style, isTextarea }) => {
  if (isExporting) {
    return <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', minHeight: '1.5rem', ...style }}>{value}</div>;
  }
  if (isTextarea) {
    return <textarea rows="3" placeholder={placeholder} value={value} onChange={onChange} style={style} onInput={e => {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    }} />;
  }
  return <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={style} />;
};

const Invoice = ({ role, currency, isExporting }) => {
  const [items, setItems] = useState([{ id: 1, description: '', quantity: 1, rate: 0 }]);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [payroll, setPayroll] = useState([{ id: 1, role: '', amount: 0 }]);
  
  // Uncontrolled states converted to controlled
  const [invoiceNo, setInvoiceNo] = useState('1');
  const [from, setFrom] = useState('');
  const [billTo, setBillTo] = useState('Idyll Productions Pvt. Ltd.');
  const [shipTo, setShipTo] = useState('');
  const [date, setDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invoiceType, setInvoiceType] = useState('100% Invoice');

  const isEditor = role === 'editor';

  const calculateSubtotal = () => {
    if (isEditor) {
      return items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    } else {
      return payroll.reduce((sum, item) => sum + Number(item.amount), 0);
    }
  };

  const subtotal = calculateSubtotal();

  const addItem = () => setItems([...items, { id: Date.now(), description: '', quantity: 1, rate: 0 }]);
  const removeItem = (id) => setItems(items.filter(i => i.id !== id));
  const updateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addPayroll = () => setPayroll([...payroll, { id: Date.now(), role: '', amount: 0 }]);
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
          <div className="flex items-center gap-2">
            <span style={{ fontWeight: '600', color: 'var(--gray-400)' }}>#</span>
            <RenderField isExporting={isExporting} value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} style={{ width: '80px', textAlign: 'right' }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="flex-col gap-4">
          <RenderField isExporting={isExporting} value={from} onChange={e => setFrom(e.target.value)} placeholder="Who is this from?" style={{ padding: '1rem', fontSize: '1rem', backgroundColor: 'var(--bg-light)' }} />
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label>Bill To</label>
              <RenderField isExporting={isExporting} isTextarea value={billTo} onChange={e => setBillTo(e.target.value)} placeholder="Who is this to?" />
            </div>
            {isEditor && (
              <div>
                <label>Ship To</label>
                <RenderField isExporting={isExporting} isTextarea value={shipTo} onChange={e => setShipTo(e.target.value)} placeholder="(optional)" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-col gap-6" style={{ width: '90%', marginLeft: 'auto' }}>
          <div className="flex items-start gap-4">
            <label style={{ margin: 0, whiteSpace: 'nowrap', minWidth: '120px', paddingTop: isExporting ? '0.2rem' : '0.85rem' }}>Date</label>
            <RenderField isExporting={isExporting} type="date" value={date} onChange={e => setDate(e.target.value)} style={{ flex: 1 }} />
          </div>
          <div className="flex items-start gap-4">
            <label style={{ margin: 0, whiteSpace: 'nowrap', minWidth: '120px', paddingTop: isExporting ? '0.2rem' : '0.85rem' }}>Payment Terms</label>
            <RenderField isExporting={isExporting} value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} style={{ flex: 1 }} />
          </div>
          <div className="flex items-start gap-4">
            <label style={{ margin: 0, whiteSpace: 'nowrap', minWidth: '120px', paddingTop: isExporting ? '0.2rem' : '0.85rem' }}>Due Date</label>
            <RenderField isExporting={isExporting} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ flex: 1 }} />
          </div>
          {isEditor && (
            <div className="flex items-start gap-4">
              <label style={{ margin: 0, whiteSpace: 'nowrap', minWidth: '120px', paddingTop: isExporting ? '0.2rem' : '0.85rem' }}>Invoice Type</label>
              {isExporting ? (
                <div style={{ flex: 1, padding: '0.2rem 0', minHeight: '1.5rem', wordBreak: 'break-word' }}>{invoiceType}</div>
              ) : (
                <select style={{ flex: 1 }} value={invoiceType} onChange={e => setInvoiceType(e.target.value)}>
                  <option>100% Invoice</option>
                  <option>50% Invoice</option>
                  <option>Upfront Payment</option>
                </select>
              )}
            </div>
          )}
        </div>
      </div>

      {isEditor ? (
        <>
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
          <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            <button className="btn btn-primary no-print" onClick={addItem}>Add Item</button>
          </div>
        </>
      ) : (
        <>
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
          <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            <button className="btn btn-primary no-print" onClick={addPayroll}>Add Payroll</button>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-8 mt-8">
        <div className="flex-col gap-4 mt-8">
          <div>
            <label>Notes</label>
            <RenderField isExporting={isExporting} isTextarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes - any relevant information not already covered" />
          </div>
          <div>
            <label>Terms</label>
            <RenderField isExporting={isExporting} isTextarea value={terms} onChange={e => setTerms(e.target.value)} placeholder="Terms and conditions - late fees, payment methods, delivery schedule" />
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
