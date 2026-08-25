import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiX, FiCheckCircle, FiDollarSign, FiCalendar, FiCreditCard, FiFileText } from "react-icons/fi";

const PaymentUpdateModal = ({ invoice, onClose, onSuccess }) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    status: "PAID",
    paymentReceivedDate: new Date().toISOString().split('T')[0],
    paymentMethod: "BANK_TRANSFER",
    chequeNumber: "",
    otherReference: "",
    notes: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.patch(`${API_URL}/fleet/trip-invoices/${invoice.id}/payment`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Payment recorded successfully");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Error recording payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200 relative"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <FiDollarSign size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Record Payment</h2>
              <p className="text-xs text-foreground-muted uppercase tracking-wider font-semibold">
                Invoice: {invoice?.invoiceNumber || `#${invoice?.id}`}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            className="p-2 hover:bg-muted text-foreground-muted hover:text-foreground rounded-full transition-colors cursor-pointer"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Invoice Summary Banner */}
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/15 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-primary/70 uppercase tracking-wider">Invoice Amount</p>
              <p className="text-2xl font-black text-primary">AED {invoice?.grandTotal ? Number(invoice.grandTotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
                READY TO PAY
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase flex items-center gap-1.5">
                <FiCalendar size={13} /> Payment Date
              </label>
              <input 
                type="date" 
                name="paymentReceivedDate"
                value={form.paymentReceivedDate}
                onChange={handleChange}
                required
                className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase flex items-center gap-1.5">
                <FiCreditCard size={13} /> Payment Method
              </label>
              <select 
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>
          </div>

          {/* Conditional Field: Cheque Number vs Reference */}
          {form.paymentMethod === 'CHEQUE' ? (
            <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-150">
              <label className="text-xs font-bold text-foreground-muted uppercase flex items-center gap-1.5">
                <FiFileText size={13} /> Cheque Number
              </label>
              <input 
                type="text" 
                name="chequeNumber"
                placeholder="Enter cheque number"
                value={form.chequeNumber}
                onChange={handleChange}
                required
                className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          ) : (
            <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-150">
              <label className="text-xs font-bold text-foreground-muted uppercase flex items-center gap-1.5">
                <FiFileText size={13} /> Other Reference (UTR / Ref No)
              </label>
              <input 
                type="text" 
                name="otherReference"
                placeholder="Transaction ID / Reference"
                value={form.otherReference}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          )}

          {/* Internal Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground-muted uppercase flex items-center gap-1.5">
              <FiFileText size={13} /> Internal Notes
            </label>
            <textarea 
              name="notes"
              placeholder="Add optional payment notes..."
              value={form.notes}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none h-20 resize-none transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border rounded-xl text-sm font-bold text-foreground-muted hover:bg-muted hover:text-foreground transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] py-3 bg-primary text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              <FiCheckCircle size={16} />
              {loading ? "Recording..." : "Confirm Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentUpdateModal;
