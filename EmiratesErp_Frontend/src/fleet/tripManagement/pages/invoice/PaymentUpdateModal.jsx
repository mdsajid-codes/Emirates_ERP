import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import AppButton from "../../components/dashboard/AppButton";

const PaymentUpdateModal = ({ invoice, onClose, onSuccess }) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Record Payment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><FiX size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl mb-4">
            <p className="text-xs text-blue-600 uppercase font-bold tracking-wider mb-1">Invoice Amount</p>
            <p className="text-2xl font-black text-blue-900">AED {invoice.grandTotal?.toFixed(2)}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Payment Date</label>
            <input 
              type="date" 
              name="paymentReceivedDate"
              value={form.paymentReceivedDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Payment Method</label>
            <select 
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHEQUE">Cheque</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>

          {form.paymentMethod === 'CHEQUE' ? (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Cheque Number</label>
              <input 
                type="text" 
                name="chequeNumber"
                placeholder="Enter cheque number"
                value={form.chequeNumber}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Other Reference (UTR/Ref)</label>
              <input 
                type="text" 
                name="otherReference"
                placeholder="Transaction ID / Reference"
                value={form.otherReference}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Internal Notes</label>
            <textarea 
              name="notes"
              placeholder="Add payment notes..."
              value={form.notes}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-20"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <AppButton 
              type="submit" 
              disabled={loading}
              className="flex-[2] py-3 rounded-xl font-bold"
            >
              {loading ? "Recording..." : "Confirm Payment"}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentUpdateModal;
