import React, { useState } from 'react';
import axios from 'axios';
import { 
  X, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  RotateCcw,
  Banknote
} from 'lucide-react';
import { toast } from 'react-toastify';

const RecordPaymentModal = ({ isOpen, onClose, onSave, trip }) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: 'PAID',
    paymentReceivedDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    chequeNumber: '',
    otherReference: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.patch(`${API_URL}/fleet/trip-invoices/${trip.invoiceId}/payment`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Payment recorded successfully');
      onSave();
      onClose();
    } catch (error) {
      toast.error('Failed to record payment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-theme shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-theme text-primary">
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Record Payment</h2>
              <p className="text-xs text-foreground-muted uppercase tracking-widest font-black">Invoice: {trip.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-theme transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="grid grid-cols-2 gap-4">
            {/* Payment Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted flex items-center gap-1.5">
                <Calendar size={12} /> Payment Date
              </label>
              <input
                type="date"
                required
                className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.paymentReceivedDate}
                onChange={(e) => setFormData({...formData, paymentReceivedDate: e.target.value})}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted flex items-center gap-1.5">
                <Banknote size={12} /> Method
              </label>
              <select
                className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              >
                <option value="CASH">CASH</option>
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="ONLINE">ONLINE</option>
              </select>
            </div>
          </div>

          {formData.paymentMethod === 'CHEQUE' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted flex items-center gap-1.5">
                <CreditCard size={12} /> Cheque Number
              </label>
              <input
                type="text"
                required
                placeholder="Enter cheque number"
                className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.chequeNumber}
                onChange={(e) => setFormData({...formData, chequeNumber: e.target.value})}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted flex items-center gap-1.5">
              <FileText size={12} /> Reference Number
            </label>
            <input
              type="text"
              placeholder="Transaction ID, Receipt No, etc."
              className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={formData.otherReference}
              onChange={(e) => setFormData({...formData, otherReference: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted flex items-center gap-1.5">
              <FileText size={12} /> Internal Notes
            </label>
            <textarea
              className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows="3"
              placeholder="Optional payment notes..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            ></textarea>
          </div>

          <div className="bg-primary/5 p-4 rounded-theme border border-primary/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest">Grand Total</p>
              <p className="text-xl font-black text-primary">AED {trip.totalAmount?.toLocaleString() || '0.00'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-foreground-muted tracking-widest">Status</p>
              <span className="text-[10px] font-black bg-success/10 text-success px-2 py-0.5 rounded-full border border-success/20">PAID</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-black uppercase tracking-widest text-foreground-muted hover:bg-muted rounded-theme transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-theme text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {loading ? (
                <RotateCcw className="animate-spin" size={14} />
              ) : (
                <CheckCircle2 size={14} />
              )}
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
