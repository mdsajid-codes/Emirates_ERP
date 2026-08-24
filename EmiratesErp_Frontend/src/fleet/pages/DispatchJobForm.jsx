import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  X,
  Save,
  ClipboardList,
  Calendar,
  MapPin,
  Package,
  Weight,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function DispatchJobForm({ isOpen, onClose, onSave, initialData, prefilledTripId, prefilledData }) {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    jobDate: new Date().toISOString().split('T')[0],
    customerId: '',
    pickupLocation: '',
    dropLocation: '',
    cargoDetails: '',
    loadWeight: '',
    priority: 'NORMAL',
    remarks: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (prefilledData && isOpen) {
      setFormData(prev => ({
        ...prev,
        ...prefilledData,
        jobDate: prefilledData.jobDate || prev.jobDate // keep current date if not provided
      }));
    } else if (isOpen) {
      // Reset form for new job if no prefilled data
      setFormData({
        jobDate: new Date().toISOString().split('T')[0],
        customerId: '',
        pickupLocation: '',
        dropLocation: '',
        cargoDetails: '',
        loadWeight: '',
        priority: 'NORMAL',
        remarks: ''
      });
    }
  }, [initialData, prefilledData, isOpen]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
      const response = await axios.get(`${API_URL}/fleet/trip-customers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setCustomers(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    if (isOpen) fetchCustomers();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const payload = {
        ...formData,
        linkedTripId: prefilledTripId || formData.linkedTripId
      };

      if (initialData?.id) {
        // Update logic (if needed)
        await axios.put(`${API_URL}/fleet/dispatch/jobs/${initialData.id}`, payload, { headers });
        toast.success('Job updated successfully');
      } else {
        await axios.post(`${API_URL}/fleet/dispatch/jobs`, payload, { headers });
        toast.success('Dispatch job created successfully');
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving dispatch job:', error);
      toast.error(error.response?.data?.message || 'Failed to save dispatch job');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs select-none">
      <div className="bg-[var(--color-card,#ffffff)] w-full max-w-xl rounded-xl shadow-2xl border border-[var(--color-border,#D7E3EE)] overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-3.5 border-b border-[var(--color-border,#E4EAF4)] flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center">
              <ClipboardList size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-foreground,#102A43)] leading-tight">
                {initialData ? 'Edit Dispatch Job' : 'Create Dispatch Job'}
              </h2>
              <p className="text-[11px] text-[var(--color-foreground-muted,#60738E)]">Register a new transport requirement</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-lg border border-[var(--color-border,#D7E3EE)] flex items-center justify-center text-[var(--color-foreground-muted,#60738E)] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            
            {/* Date & Customer */}
            <div>
              <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1 flex items-center gap-1">
                <Calendar size={12} className="text-[var(--color-primary,#0178BC)]" /> Job Date *
              </label>
              <input
                type="date"
                name="jobDate"
                value={formData.jobDate}
                onChange={handleChange}
                required
                className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1 flex items-center gap-1">
                Customer *
              </label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                required
                className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.companyName || c.name}</option>
                ))}
              </select>
            </div>

            {/* Route */}
            <div>
              <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-[var(--color-primary,#0178BC)]" /> Pickup Location *
              </label>
              <input
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                placeholder="Origin address"
                required
                className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-emerald-600" /> Drop Location *
              </label>
              <input
                type="text"
                name="dropLocation"
                value={formData.dropLocation}
                onChange={handleChange}
                placeholder="Destination address"
                required
                className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
              />
            </div>

            {/* Cargo Details */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1 flex items-center gap-1">
                <Package size={12} className="text-[var(--color-primary,#0178BC)]" /> Cargo Description
              </label>
              <input
                type="text"
                name="cargoDetails"
                value={formData.cargoDetails}
                onChange={handleChange}
                placeholder="e.g. 50 Cartons of electronics, 20 Pallets"
                className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1 flex items-center gap-1">
                <Weight size={12} className="text-slate-500" /> Load Weight (Tons/KG)
              </label>
              <input
                type="number"
                step="0.1"
                name="loadWeight"
                value={formData.loadWeight}
                onChange={handleChange}
                placeholder="0.0"
                className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1 flex items-center gap-1">
                <AlertTriangle size={12} className="text-amber-500" /> Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="URGENT">URGENT</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1 flex items-center gap-1">
              <FileText size={12} className="text-slate-500" /> Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="2"
              placeholder="Any special instructions..."
              className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none resize-none"
            ></textarea>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[var(--color-border,#E4EAF4)] bg-slate-50/50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-[var(--color-foreground,#102A43)] border border-[var(--color-border,#D7E3EE)] bg-white hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 px-5 py-1.5 bg-[#00A9A8] hover:bg-[#009190] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Save size={14} />
            {initialData ? 'Update Job' : 'Create Job'}
          </button>
        </div>

      </div>
    </div>
  );
}
