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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-theme shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-theme text-primary">
              <Truck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Assign Resources</h2>
              <p className="text-xs text-foreground-muted">Dispatch Job: <span className="font-bold text-primary">{job?.jobNo}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-theme transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            {/* Vehicle Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Truck size={12} /> Available Vehicle
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plateNumber} ({v.makeModel})</option>
                ))}
              </select>
              {vehicles.length === 0 && (
                <p className="text-[10px] text-red-500 font-medium ml-1 flex items-center gap-1">
                  <AlertCircle size={10} /> No active vehicles available
                </p>
              )}
            </div>

            {/* Driver Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <User size={12} /> Available Driver
              </label>
              <select
                value={formData.driverId}
                onChange={(e) => setFormData(prev => ({ ...prev, driverId: e.target.value }))}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Select Driver</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.employeeCode})</option>
                ))}
              </select>
              {drivers.length === 0 && (
                <p className="text-[10px] text-red-500 font-medium ml-1 flex items-center gap-1">
                  <AlertCircle size={10} /> No available drivers found
                </p>
              )}
            </div>

            {/* Trip Linking (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Calendar size={12} /> Link to Existing Trip (Optional)
              </label>
              <select
                value={formData.tripId}
                onChange={(e) => setFormData(prev => ({ ...prev, tripId: e.target.value }))}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              >
                <option value="">Select Trip (Optional)</option>
                {trips.map(t => (
                  <option key={t.id} value={t.id}>{t.tripNo} - {t.date}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 p-3 rounded-theme flex gap-3 text-primary">
            <Check size={18} className="flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Assigning resources will move this job to <span className="font-bold">DISPATCHED</span> status and lock the vehicle/driver for this duration.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-theme transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || vehicles.length === 0 || drivers.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-theme font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={18} />
              )}
              Confirm Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
