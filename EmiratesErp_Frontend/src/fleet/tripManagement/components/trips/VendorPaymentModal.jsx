import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import AppButton from "../dashboard/AppButton";

const VendorPaymentModal = ({ trip, onClose, onSuccess }) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    vendorPaymentDate: new Date().toISOString().split('T')[0],
    vendorPaymentMethod: "BANK_TRANSFER",
    vendorChequeNumber: "",
    vendorOtherReference: "",
    vendorPaymentNotes: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.patch(`${API_URL}/fleet/trips/${trip.id}/vendor-payment`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Vendor payment recorded successfully");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Error recording vendor payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Vendor Payment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><FiX size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-orange-50 p-4 rounded-xl mb-4">
            <p className="text-xs text-orange-600 uppercase font-bold tracking-wider mb-1">Payable to Vendor</p>
            <p className="text-2xl font-black text-orange-900">AED {trip.vendorAmount?.toFixed(2)}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Payment Date</label>
            <input 
              type="date" 
              name="vendorPaymentDate"
              value={form.vendorPaymentDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Payment Method</label>
            <select 
              name="vendorPaymentMethod"
              value={form.vendorPaymentMethod}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
            >
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHEQUE">Cheque</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>

          {form.vendorPaymentMethod === 'CHEQUE' ? (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Cheque Number</label>
              <input 
                type="text" 
                name="vendorChequeNumber"
                placeholder="Enter cheque number"
                value={form.vendorChequeNumber}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Reference (UTR/Ref)</label>
              <input 
                type="text" 
                name="vendorOtherReference"
                placeholder="Transaction ID / Reference"
                value={form.vendorOtherReference}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Payment Notes</label>
            <textarea 
              name="vendorPaymentNotes"
              placeholder="Add payment notes..."
              value={form.vendorPaymentNotes}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none h-20"
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
              className="flex-[2] py-3 rounded-xl font-bold bg-orange-600 hover:bg-orange-700 border-none"
            >
              {loading ? "Recording..." : "Confirm Payment"}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorPaymentModal;
