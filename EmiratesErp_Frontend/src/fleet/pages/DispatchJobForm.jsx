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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-theme shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-theme text-primary">
              <ClipboardList size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {initialData ? 'Edit Dispatch Job' : 'Create Dispatch Job'}
              </h2>
              <p className="text-xs text-foreground-muted">Register a new transport requirement</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-theme transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date & Customer */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Calendar size={12} /> Job Date
              </label>
              <input
                type="date"
                name="jobDate"
                value={formData.jobDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1">Customer</label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </div>

            {/* Route */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <MapPin size={12} /> Pickup Location
              </label>
              <input
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                placeholder="Origin address"
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <MapPin size={12} /> Drop Location
              </label>
              <input
                type="text"
                name="dropLocation"
                value={formData.dropLocation}
                onChange={handleChange}
                placeholder="Destination address"
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            {/* Cargo Details */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Package size={12} /> Cargo Description
              </label>
              <input
                type="text"
                name="cargoDetails"
                value={formData.cargoDetails}
                onChange={handleChange}
                placeholder="e.g. 50 Cartons of electronics, 20 Pallets"
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Weight size={12} /> Load Weight (Tons/KG)
              </label>
              <input
                type="number"
                step="0.1"
                name="loadWeight"
                value={formData.loadWeight}
                onChange={handleChange}
                placeholder="0.0"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <AlertTriangle size={12} /> Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
              <FileText size={12} /> Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="2"
              placeholder="Any special instructions..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none resize-none"
            ></textarea>
          </div>
        </form>

        <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-theme transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-theme font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            <Save size={18} />
            Create Job
          </button>
        </div>
      </div>
    </div>
  );
}
