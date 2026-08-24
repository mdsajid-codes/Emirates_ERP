import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  X,
  Check,
  Truck,
  User,
  Search,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function DispatchAssignModal({ isOpen, onClose, onSave, job, tripContext }) {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    tripId: ''
  });

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
          
          // Fetch independently so one failure doesn't block others
          const fetchVehicles = axios.get(`${API_URL}/fleet/vehicles/all`, { headers }).catch(err => {
            console.error("Vehicles fetch failed:", err);
            return { data: [] };
          });
          const fetchDrivers = axios.get(`${API_URL}/fleet/drivers/all`, { headers }).catch(err => {
            console.error("Drivers fetch failed:", err);
            return { data: [] };
          });
          const fetchTrips = axios.get(`${API_URL}/fleet/trips/all`, { headers }).catch(err => {
            console.error("Trips fetch failed:", err);
            return { data: [] };
          });

          const [vRes, dRes, tRes] = await Promise.all([fetchVehicles, fetchDrivers, fetchTrips]);

          // Auto-select from tripContext if provided
          const initialVehicleId = tripContext?.vehicleId;
          const initialDriverId = tripContext?.driverId;
          const initialTripId = tripContext?.id || job?.linkedTripId || '';

          setFormData({
            vehicleId: initialVehicleId || '',
            driverId: initialDriverId || '',
            tripId: initialTripId
          });

          // Filter: Include anything that looks "active" or "available"
          // Handle potential Page vs List response structure
          const rawVehicles = Array.isArray(vRes.data) ? vRes.data : (vRes.data?.content || []);
          const rawDrivers = Array.isArray(dRes.data) ? dRes.data : (dRes.data?.content || []);

          // Using loose equality (==) for ID comparison and permissive status check
          const filteredVehicles = rawVehicles.filter(v => {
            const status = (v.vehicleStatus || v.status || '').toUpperCase();
            // Explicitly exclude UNDER_MAINTENANCE and INACTIVE
            return (status === 'ACTIVE' || status === 'AVAILABLE' || status === 'IN_USE' || v.id == initialVehicleId) 
                   && status !== 'UNDER_MAINTENANCE' && status !== 'INACTIVE';
          });
          
          const filteredDrivers = rawDrivers.filter(d => {
            const status = (d.status || d.driverStatus || '').toUpperCase();
            return status === 'AVAILABLE' || status === 'ACTIVE' || d.id == initialDriverId;
          });

          setVehicles(filteredVehicles);
          setDrivers(filteredDrivers);
          setTrips(Array.isArray(tRes.data) ? tRes.data : (tRes.data?.content || []));
        } catch (error) {
          console.error('Error fetching assignment data:', error);
        }
      };
      fetchData();
    }
  }, [isOpen, tripContext, job]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId || !formData.driverId) {
      toast.error('Please select both a vehicle and a driver');
      return;
    }
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      await axios.patch(`${API_URL}/fleet/dispatch/jobs/${job.id}/assign`, formData, { headers });
      toast.success('Resources assigned and job dispatched');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error assigning resources:', error);
      toast.error(error.response?.data?.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs select-none">
      <div className="bg-[var(--color-card,#ffffff)] w-full max-w-md rounded-xl shadow-2xl border border-[var(--color-border,#D7E3EE)] overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-3.5 border-b border-[var(--color-border,#E4EAF4)] flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center">
              <Truck size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-foreground,#102A43)] leading-tight">Assign Resources</h2>
              <p className="text-[11px] text-[var(--color-foreground-muted,#60738E)] font-mono">
                Dispatch Job: <span className="font-bold text-[var(--color-primary,#0178BC)]">{job?.jobNo}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-lg border border-[var(--color-border,#D7E3EE)] flex items-center justify-center text-[var(--color-foreground-muted,#60738E)] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Vehicle Selection */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1 flex items-center gap-1">
              <Truck size={12} className="text-[var(--color-primary,#0178BC)]" /> Available Vehicle *
            </label>
            <select
              value={formData.vehicleId}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
              required
              className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.plateNumber} ({v.makeModel || v.make || ''})</option>
              ))}
            </select>
            {vehicles.length === 0 && (
              <p className="text-[10px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={10} /> No active vehicles available
              </p>
            )}
          </div>

          {/* Driver Selection */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1 flex items-center gap-1">
              <User size={12} className="text-[var(--color-primary,#0178BC)]" /> Available Driver *
            </label>
            <select
              value={formData.driverId}
              onChange={(e) => setFormData(prev => ({ ...prev, driverId: e.target.value }))}
              required
              className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
            >
              <option value="">Select Driver</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.employeeId || 'EM-01'})</option>
              ))}
            </select>
            {drivers.length === 0 && (
              <p className="text-[10px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={10} /> No available drivers found
              </p>
            )}
          </div>

          {/* Trip Link Selection */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1 flex items-center gap-1">
              <Calendar size={12} className="text-slate-500" /> Link to Existing Trip (Optional)
            </label>
            <select
              value={formData.tripId}
              onChange={(e) => setFormData(prev => ({ ...prev, tripId: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
            >
              <option value="">No Linked Trip (Standalone Dispatch)</option>
              {trips.map(t => (
                <option key={t.id} value={t.id}>TRIP #{t.tripNo} - {t.fromLocation} → {t.toLocation}</option>
              ))}
            </select>
          </div>

          <div className="bg-sky-50 p-2.5 rounded-lg border border-sky-100 text-[11px] text-[var(--color-primary,#0178BC)] font-medium flex items-center gap-2">
            <Check size={14} className="shrink-0" />
            <span>Assigning resources will move this job to <strong className="font-bold">DISPATCHED</strong> status and lock the vehicle/driver.</span>
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--color-border,#E4EAF4)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-[var(--color-foreground,#102A43)] border border-[var(--color-border,#D7E3EE)] bg-white hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-1.5 bg-[#00A9A8] hover:bg-[#009190] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Check size={14} />
              {loading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
