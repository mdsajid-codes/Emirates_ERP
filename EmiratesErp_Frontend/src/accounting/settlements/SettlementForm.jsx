import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { settlementApi } from '../api/settlementApi';
import { subLedgerApi } from '../api/subLedgerApi';
import { toast } from 'react-toastify';
import axios from 'axios';

export const SettlementForm = () => {
  const navigate = useNavigate();
  const [partnerId, setPartnerId] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState([]);

  React.useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/parties?size=1000`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setParties(response.data?.content || response.data || []);
      } catch (err) {
        console.error("Failed to fetch parties", err);
      }
    };
    fetchParties();
  }, []);

  React.useEffect(() => {
    if (!partnerId) {
      setApInvoices([]);
      setArInvoices([]);
      return;
    }

    const fetchStatements = async () => {
      try {
        const [apRes, arRes] = await Promise.all([
          subLedgerApi.getApStatement(partnerId),
          subLedgerApi.getArStatement(partnerId)
        ]);

        const apRows = apRes.data?.data?.rows || apRes.data?.rows || [];
        const arRows = arRes.data?.data?.rows || arRes.data?.rows || [];

        const mappedAp = apRows.filter(r => r.creditAmount > 0).map(r => ({
          id: r.journalEntryId || Math.random(),
          invoiceNo: r.entryNumber || r.referenceNumber || `DOC-${r.journalEntryId || 'NEW'}`,
          date: r.entryDate || '',
          balance: r.creditAmount,
          allocated: 0
        }));

        const mappedAr = arRows.filter(r => r.debitAmount > 0).map(r => ({
          id: r.journalEntryId || Math.random(),
          invoiceNo: r.entryNumber || r.referenceNumber || `DOC-${r.journalEntryId || 'NEW'}`,
          date: r.entryDate || '',
          balance: r.debitAmount,
          allocated: 0
        }));

        setApInvoices(mappedAp);
        setArInvoices(mappedAr);
      } catch (err) {
        console.error("Failed to load statements", err);
        toast.error("Failed to fetch outstanding balances for this partner");
      }
    };

    fetchStatements();
  }, [partnerId]);

  const [apInvoices, setApInvoices] = useState([]);
  const [arInvoices, setArInvoices] = useState([]);

  const apTotal = apInvoices.reduce((sum, inv) => sum + (Number(inv.allocated) || 0), 0);
  const arTotal = arInvoices.reduce((sum, inv) => sum + (Number(inv.allocated) || 0), 0);
  const isBalanced = apTotal === arTotal && apTotal > 0;

  const handleApAllocation = (id, val) => {
    setApInvoices(apInvoices.map(inv => inv.id === id ? { ...inv, allocated: val } : inv));
  };

  const handleArAllocation = (id, val) => {
    setArInvoices(arInvoices.map(inv => inv.id === id ? { ...inv, allocated: val } : inv));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!partnerId || !date) {
      toast.error('Please select partner and date');
      return;
    }
    if (!isBalanced) {
      toast.error('AP and AR allocations must balance');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        partnerId: Number(partnerId),
        settlementDate: date,
        apAllocations: apInvoices.filter(inv => Number(inv.allocated) > 0).map(inv => ({
          invoiceId: inv.id,
          allocatedAmount: Number(inv.allocated)
        })),
        arAllocations: arInvoices.filter(inv => Number(inv.allocated) > 0).map(inv => ({
          invoiceId: inv.id,
          allocatedAmount: Number(inv.allocated)
        }))
      };
      
      await settlementApi.create(payload);
      toast.success('Mutual Settlement Draft Created!');
      navigate('/account-dashboard/settlements');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create settlement draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-background min-h-screen flex flex-col text-foreground">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-card rounded-full shadow-sm hover:bg-hover transition-colors border border-border">
          <ArrowLeft size={20} className="text-foreground-muted" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Mutual Settlement</h1>
          <p className="text-foreground-muted mt-1">Offset payables and receivables for a single partner</p>
        </div>
        
        <div className="ml-auto flex gap-4">
          <div className="bg-card px-6 py-2.5 rounded-theme shadow-sm border border-border flex items-center gap-3">
            <Scale size={20} className={isBalanced ? 'text-success' : 'text-foreground-muted'} />
            <span className="text-sm font-medium text-foreground-muted">AP: <span className="text-foreground">AED {apTotal.toLocaleString()}</span></span>
            <span className="text-border">|</span>
            <span className="text-sm font-medium text-foreground-muted">AR: <span className="text-foreground">AED {arTotal.toLocaleString()}</span></span>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={!isBalanced || loading}
            className={`px-5 py-2.5 rounded-theme flex items-center justify-center gap-2 shadow-sm transition-all font-medium ${
              isBalanced && !loading ? 'bg-primary hover:opacity-90 text-primary-foreground' : 'bg-background-muted text-foreground-muted cursor-not-allowed border border-border'
            }`}
          >
            <Save size={20} />
            <span>{loading ? 'Saving...' : 'Create Draft'}</span>
          </button>
        </div>
      </div>

      <div className="bg-card rounded-theme shadow-sm border border-border p-6 mb-6 flex gap-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground-muted mb-1">Partner</label>
          <select 
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            className="w-full px-4 py-2 bg-background-muted border border-border rounded-theme focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">Select Partner...</option>
            {parties.map(p => (
              <option key={p.id} value={p.id}>{p.companyName || p.primaryContactPersonFull || 'Unnamed Partner'}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground-muted mb-1">Settlement Date</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 bg-background-muted border border-border rounded-theme focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
        {/* AP Section */}
        <div className="bg-card rounded-theme shadow-sm border border-border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><ArrowRight size={18} className="text-warning"/> Accounts Payable (Vendor)</h3>
            <span className="text-sm bg-warning/10 text-warning border border-warning/20 px-3 py-1 rounded-lg">Allocated: AED {apTotal.toLocaleString()}</span>
          </div>
          <div className="flex-1 border border-border rounded-theme overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-background-muted">
                <tr>
                  <th className="py-3 px-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Invoice No</th>
                  <th className="py-3 px-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider text-right">Balance</th>
                  <th className="py-3 px-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider text-right">Allocate</th>
                </tr>
              </thead>
              <tbody>
                {apInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border">
                    <td className="py-3 px-4 font-medium">{inv.invoiceNo}</td>
                    <td className="py-3 px-4 text-right font-medium">AED {inv.balance.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <input 
                        type="number" 
                        max={inv.balance}
                        value={inv.allocated || ''}
                        onChange={(e) => handleApAllocation(inv.id, e.target.value)}
                        className="w-28 px-3 py-1.5 bg-background-muted border border-border rounded-lg text-right focus:ring-2 focus:ring-warning outline-none text-foreground"
                        placeholder="0.00"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AR Section */}
        <div className="bg-card rounded-theme shadow-sm border border-border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><ArrowLeft size={18} className="text-success"/> Accounts Receivable (Customer)</h3>
            <span className="text-sm bg-success/10 text-success border border-success/20 px-3 py-1 rounded-lg">Allocated: AED {arTotal.toLocaleString()}</span>
          </div>
          <div className="flex-1 border border-border rounded-theme overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-background-muted">
                <tr>
                  <th className="py-3 px-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Invoice No</th>
                  <th className="py-3 px-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider text-right">Balance</th>
                  <th className="py-3 px-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider text-right">Allocate</th>
                </tr>
              </thead>
              <tbody>
                {arInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border">
                    <td className="py-3 px-4 font-medium">{inv.invoiceNo}</td>
                    <td className="py-3 px-4 text-right font-medium">AED {inv.balance.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <input 
                        type="number" 
                        max={inv.balance}
                        value={inv.allocated || ''}
                        onChange={(e) => handleArAllocation(inv.id, e.target.value)}
                        className="w-28 px-3 py-1.5 bg-background-muted border border-border rounded-lg text-right focus:ring-2 focus:ring-success outline-none text-foreground"
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
  );
};
