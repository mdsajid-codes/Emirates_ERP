import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { paymentApi } from '../api/paymentApi';
import { subLedgerApi } from '../api/subLedgerApi';
import { bankApi } from '../api/bankApi';
import { toast } from 'react-toastify';
import axios from 'axios';

export const PaymentForm = () => {
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState('AR_RECEIPT');
  const [partnerType, setPartnerType] = useState('CUSTOMER');
  const [partnerId, setPartnerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [invoices, setInvoices] = useState([]);
  const [parties, setParties] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);

  React.useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/parties?size=1000`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = response.data?.content || response.data || [];
        console.log("Fetched Parties:", data);
        setParties(data);
      } catch (err) {
        console.error("Failed to fetch parties", err);
      }
    };
    const fetchBanks = async () => {
      try {
        const res = await bankApi.getAllBankAccounts();
        setBankAccounts(res.data || []);
      } catch (err) {
        console.error("Failed to fetch bank accounts", err);
      }
    };
    fetchParties();
    fetchBanks();
  }, []);

  React.useEffect(() => {
    if (!partnerId) {
      setInvoices([]);
      return;
    }

    const fetchInvoices = async () => {
      try {
        let response;
        if (partnerType === 'CUSTOMER') {
          response = await subLedgerApi.getArStatement(partnerId);
        } else {
          response = await subLedgerApi.getApStatement(partnerId);
        }

        const rows = response.data?.data?.rows || response.data?.rows || [];
        
        // Filter rows that represent invoices (debit for AR, credit for AP)
        const mappedInvoices = rows
          .filter(row => partnerType === 'CUSTOMER' ? row.debitAmount > 0 : row.creditAmount > 0)
          .map(row => ({
            id: row.journalEntryId || Math.random(), // fallback if ID is missing
            invoiceNo: row.entryNumber || row.referenceNumber || `DOC-${row.journalEntryId || 'NEW'}`,
            date: row.entryDate || '',
            balance: partnerType === 'CUSTOMER' ? row.debitAmount : row.creditAmount,
            allocated: 0
          }));

        setInvoices(mappedInvoices);
      } catch (err) {
        console.error("Failed to load statement", err);
        toast.error("Failed to fetch invoices for this partner");
      }
    };

    fetchInvoices();
  }, [partnerId, partnerType]);

  const totalAllocated = invoices.reduce((sum, inv) => sum + (Number(inv.allocated) || 0), 0);
  const unallocated = Number(amount) - totalAllocated;

  const handleAllocationChange = (id, val) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, allocated: val } : inv));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!amount || !partnerId || !paymentDate) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        paymentType,
        partnerType,
        partnerId: Number(partnerId),
        paymentMethod,
        bankAccountId: bankAccountId ? Number(bankAccountId) : null,
        paymentDate,
        amount: Number(amount),
        status: 'DRAFT',
        allocations: invoices.filter(inv => Number(inv.allocated) > 0).map(inv => ({
          invoiceId: inv.id,
          allocatedAmount: Number(inv.allocated)
        }))
      };
      await paymentApi.create(payload);
      toast.success('Payment created successfully!');
      navigate('/account-dashboard/payments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-background min-h-screen text-foreground">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-card rounded-full shadow-sm hover:bg-hover transition-colors border border-border">
          <ArrowLeft size={20} className="text-foreground-muted" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Payment</h1>
          <p className="text-foreground-muted mt-1">Record a new receipt, payment, or prepayment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="col-span-1">
          <div className="bg-card rounded-theme shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-primary" /> Payment Details
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">Payment Type</label>
                <select 
                  className="w-full px-4 py-2 bg-background-muted border border-border rounded-theme focus:ring-2 focus:ring-primary outline-none"
                  value={paymentType}
                  onChange={(e) => {
                    setPaymentType(e.target.value);
                    setPartnerType(e.target.value.startsWith('AR') || e.target.value === 'PREPAYMENT_IN' ? 'CUSTOMER' : 'SUPPLIER');
                  }}
                >
                  <option value="AR_RECEIPT">AR Receipt</option>
                  <option value="AP_PAYMENT">AP Payment</option>
                  <option value="PREPAYMENT_IN">Prepayment In</option>
                  <option value="PREPAYMENT_OUT">Prepayment Out</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">Partner</label>
                <select 
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                  className="w-full px-4 py-2 bg-background-muted border border-border rounded-theme focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Select Partner...</option>
                  {parties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.companyName || p.primaryContactPersonFull || 'Unnamed Partner'} 
                      {p.partyType ? ` (${p.partyType})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">Payment Method</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 bg-background-muted border border-border rounded-theme focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="BANK">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="PDC">Post Dated Cheque (PDC)</option>
                </select>
              </div>

              {(paymentMethod === 'BANK' || paymentMethod === 'PDC') && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-sm font-medium text-foreground-muted mb-1">Bank Account</label>
                  <select 
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full px-4 py-2 bg-background-muted border border-border rounded-theme focus:ring-2 focus:ring-primary outline-none"
                    required
                  >
                    <option value="">Select Bank Account...</option>
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.accountName} - {b.accountNumber}
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">Payment Date</label>
                <input 
                  type="date" 
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-4 py-2 bg-background-muted border border-border rounded-theme focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">Amount</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-background-muted border border-border rounded-theme focus:ring-2 focus:ring-primary outline-none font-semibold text-lg"
                />
              </div>

              <div className="pt-4 border-t border-border mt-6">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:opacity-90 text-primary-foreground px-5 py-3 rounded-theme flex items-center justify-center gap-2 shadow-sm transition-all font-medium disabled:opacity-50"
                >
                  <Save size={20} />
                  <span>{loading ? 'Saving...' : 'Create Draft'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Allocation Table */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-theme shadow-sm border border-border p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 size={20} className="text-success" /> Invoice Allocation
              </h2>
              <div className="flex gap-4">
                <div className="text-sm bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium border border-primary/20">
                  Payment: AED {Number(amount).toLocaleString()}
                </div>
                <div className={`text-sm px-4 py-2 rounded-lg font-medium border ${unallocated < 0 ? 'bg-error/10 text-error border-error/20' : 'bg-success/10 text-success border-success/20'}`}>
                  Unallocated: AED {unallocated.toLocaleString()}
                </div>
              </div>
            </div>

            {unallocated > 0 && Number(amount) > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 p-3 bg-warning/10 border border-warning/20 text-warning text-sm rounded-theme">
                The unallocated amount of <strong>AED {unallocated.toLocaleString()}</strong> will automatically be recorded as an Advance / Prepayment upon posting.
              </motion.div>
            )}

            <div className="flex-1 border border-border rounded-theme overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-background-muted">
                  <tr>
                    <th className="py-3 px-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Invoice No</th>
                    <th className="py-3 px-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider text-right">Balance</th>
                    <th className="py-3 px-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider text-right">Allocate</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-border">
                      <td className="py-3 px-4 text-foreground font-medium">{inv.invoiceNo}</td>
                      <td className="py-3 px-4 text-foreground-muted">{inv.date}</td>
                      <td className="py-3 px-4 text-right text-foreground font-medium">AED {inv.balance.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <input 
                          type="number" 
                          max={inv.balance}
                          value={inv.allocated || ''}
                          onChange={(e) => handleAllocationChange(inv.id, e.target.value)}
                          className="w-28 px-3 py-1.5 bg-background-muted border border-border rounded-theme text-right focus:ring-2 focus:ring-primary outline-none text-foreground"
                          placeholder="0.00"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
