import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { paymentApi } from '../api/paymentApi';
import { toast } from 'react-toastify';
import { CheckCircle2 } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export const PaymentRegister = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentApi.getRegister();
      setPayments(res.data || []);
    } catch (err) {
      toast.error('Failed to load payments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e, id) => {
    e.stopPropagation();
    try {
      await paymentApi.post(id);
      toast.success('Payment posted successfully!');
      fetchPayments(); // Refresh list to get updated status and journal entry
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post payment');
      console.error(err);
    }
  };

  const filteredPayments = payments.filter(p => 
    (p.partnerName && p.partnerName.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (p.paymentNumber && p.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 bg-background min-h-screen text-foreground">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments Register</h1>
          <p className="text-foreground-muted mt-1">Manage AP/AR Payments & Prepayments</p>
        </div>
        <button 
          onClick={() => navigate('/account-dashboard/payments/new')}
          className="bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-theme flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus size={20} />
          <span>New Payment</span>
        </button>
      </div>

      <div className="bg-card rounded-theme shadow-sm border border-border p-4 mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={20} />
          <input 
            type="text"
            placeholder="Search by Partner or Payment No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background-muted border border-border rounded-theme focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-background-muted hover:bg-hover rounded-theme text-foreground-muted transition-all border border-border">
          <Filter size={20} />
          <span>Filters</span>
        </button>
      </div>

      <div className="bg-card rounded-theme shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background-muted border-b border-border">
              <th className="py-4 px-6 text-sm font-semibold text-foreground-muted">Payment No</th>
              <th className="py-4 px-6 text-sm font-semibold text-foreground-muted">Date</th>
              <th className="py-4 px-6 text-sm font-semibold text-foreground-muted">Type</th>
              <th className="py-4 px-6 text-sm font-semibold text-foreground-muted">Partner</th>
              <th className="py-4 px-6 text-sm font-semibold text-foreground-muted">Amount</th>
              <th className="py-4 px-6 text-sm font-semibold text-foreground-muted">Status</th>
              <th className="py-4 px-6 text-sm font-semibold text-foreground-muted"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-foreground-muted">Loading payments...</td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-foreground-muted">No payments found.</td>
              </tr>
            ) : (
              filteredPayments.map((payment, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={payment.id} 
                  className="border-b border-border hover:bg-hover transition-colors group cursor-pointer"
                >
                  <td className="py-4 px-6 font-medium text-foreground">{payment.paymentNumber}</td>
                  <td className="py-4 px-6 text-foreground-muted">{payment.paymentDate}</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 text-xs rounded-full font-medium bg-background-muted text-foreground">
                      {payment.paymentType?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-foreground-muted">{payment.partnerName}</td>
                  <td className="py-4 px-6 font-semibold text-foreground">AED {payment.amount?.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      {payment.status === 'DRAFT' && (
                        <button 
                          onClick={(e) => handlePost(e, payment.id)}
                          className="bg-primary hover:opacity-90 text-primary-foreground px-3 py-1 rounded-theme text-sm font-medium transition-all flex items-center gap-1 shadow-sm opacity-0 group-hover:opacity-100"
                          title="Post Payment to General Ledger"
                        >
                          <CheckCircle2 size={16} /> Post
                        </button>
                      )}
                      <button className="text-foreground-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-all p-1">
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
