import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  X,
  Save,
  Wrench,
  Calendar,
  MapPin,
  CircleDollarSign,
  FileText,
  AlertCircle,
  Upload
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function VehicleMaintenanceForm({ isOpen, onClose, onSave, vehicleId, initialData }) {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehicleId: vehicleId || '',
    maintenanceType: 'PREVENTIVE',
    serviceCategory: 'OIL_CHANGE',
    requestedDate: new Date().toISOString().split('T')[0],
    scheduledDate: '',
    garage: '',
    odometerAtService: '',
    estimatedCost: '',
    serviceNotes: '',
    spareParts: '',
    tripId: ''
  });
  const [trips, setTrips] = useState([]);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (vehicleId) {
      setFormData(prev => ({ ...prev, vehicleId, tripId: initialData?.tripId || '' }));
    }
  }, [initialData, vehicleId]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(`${API_URL}/fleet/vehicles/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = Array.isArray(response.data) ? response.data : (response.data?.content || []);
        setVehicles(data);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setVehicles([]);
      }
    };
    if (isOpen) {
      fetchVehicles();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!formData.vehicleId) {
        setTrips([]);
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/fleet/trips`, {
          params: { vehicleId: formData.vehicleId, status: 'IN_PROGRESS' },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setTrips(response.data.content || []);
      } catch (error) {
        console.error('Error fetching trips:', error);
      }
    };
    if (isOpen) fetchTrips();
  }, [formData.vehicleId, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

      // Sanitize data: convert empty strings to null and ensure numbers are numbers
      const payload = {
        ...formData,
        vehicleId: formData.vehicleId ? Number(formData.vehicleId) : null,
        tripId: formData.tripId ? Number(formData.tripId) : null,
        odometerAtService: formData.odometerAtService ? Number(formData.odometerAtService) : null,
        estimatedCost: formData.estimatedCost ? Number(formData.estimatedCost) : null,
        scheduledDate: formData.scheduledDate || null,
        serviceNotes: formData.serviceNotes || null,
        garage: formData.garage || null
      };

      if (initialData?.id) {
        await axios.put(`${API_URL}/fleet/maintenance/${initialData.id}`, payload, { headers });
        toast.success('Maintenance updated successfully');
      } else {
        await axios.post(`${API_URL}/fleet/maintenance`, payload, { headers });
        toast.success('Maintenance request created');
      }

      // Upload invoice if selected
      if (invoiceFile && (initialData?.id || response?.data?.id)) {
        const id = initialData?.id || response.data.id;
        const uploadData = new FormData();
        uploadData.append('file', invoiceFile);
        await axios.post(`${API_URL}/fleet/maintenance/${id}/invoice`, uploadData, {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving maintenance:', error);
      toast.error(error.response?.data?.message || 'Failed to save maintenance');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-theme shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-theme text-primary">
              <Wrench size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {initialData ? 'Edit Maintenance' : 'New Maintenance Request'}
              </h2>
              <p className="text-xs text-foreground-muted">Fill in the details for vehicle service</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-theme transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle Selection */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1">Vehicle</label>
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              >
                <option value="">Select a vehicle</option>
                {Array.isArray(vehicles) && vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plateNumber} - {v.make} {v.model}</option>
                ))}
              </select>
            </div>

            {/* Trip Selection */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1">Related Trip (Optional)</label>
              <select
                name="tripId"
                value={formData.tripId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="">No specific trip link</option>
                {trips.map(t => (
                  <option key={t.id} value={t.id}>{t.tripNo} | {t.fromLocation} → {t.toLocation}</option>
                ))}
              </select>
              <p className="text-[10px] text-foreground-muted ml-1 opacity-60 italic">Links this maintenance to an active trip (e.g. roadside repair)</p>
            </div>

            {/* Type & Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1">Maintenance Type</label>
              <select
                name="maintenanceType"
                value={formData.maintenanceType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="PREVENTIVE">Preventive</option>
                <option value="REPAIR">Repair</option>
                <option value="BREAKDOWN">Breakdown</option>
                <option value="INSPECTION">Inspection</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1">Service Category</label>
              <select
                name="serviceCategory"
                value={formData.serviceCategory}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="OIL_CHANGE">Oil Change</option>
                <option value="TYRE_REPLACEMENT">Tyre Replacement</option>
                <option value="BRAKE_SERVICE">Brake Service</option>
                <option value="ENGINE_REPAIR">Engine Repair</option>
                <option value="BODY_WORK">Body Work</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Dates */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Calendar size={12} /> Requested Date
              </label>
              <input
                type="date"
                name="requestedDate"
                value={formData.requestedDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Calendar size={12} /> Scheduled Date (Optional)
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            {/* Garage & Odometer */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <MapPin size={12} /> Garage / Service Center
              </label>
              <input
                type="text"
                name="garage"
                value={formData.garage}
                onChange={handleChange}
                placeholder="Name of the garage"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                Odometer Reading
              </label>
              <input
                type="number"
                name="odometerAtService"
                value={formData.odometerAtService}
                onChange={handleChange}
                placeholder="Current KM"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            {/* Cost */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <CircleDollarSign size={12} /> Estimated Cost (AED)
              </label>
              <input
                type="number"
                step="0.01"
                name="estimatedCost"
                value={formData.estimatedCost}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
              <FileText size={12} /> Service Notes
            </label>
            <textarea
              name="serviceNotes"
              value={formData.serviceNotes}
              onChange={handleChange}
              rows="3"
              placeholder="Provide details about the service required or performed..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm"
            ></textarea>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground-muted uppercase ml-1">Spare Parts Used</label>
            <input
              type="text"
              name="spareParts"
              value={formData.spareParts}
              onChange={handleChange}
              placeholder="e.g. Oil Filter, Brake Pads..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground-muted uppercase ml-1">Maintenance Invoice (PDF/Image)</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                onChange={(e) => setInvoiceFile(e.target.files[0])}
                className="hidden"
                id="maintenance-invoice-upload"
                accept="image/*,application/pdf"
              />
              <label
                htmlFor="maintenance-invoice-upload"
                className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-background border border-border border-dashed rounded-theme text-sm cursor-pointer hover:bg-muted/60 transition-colors truncate"
              >
                <Upload size={16} className="text-foreground-muted" />
                {invoiceFile ? invoiceFile.name : 'Select Invoice File'}
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-primary/5 border border-primary/10 p-3 rounded-theme flex gap-3 text-primary">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Submitting a maintenance request for an <span className="font-bold">ACTIVE</span> vehicle will automatically update its status to <span className="font-bold underline">UNDER MAINTENANCE</span> once scheduled.
            </p>
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
            Save Maintenance
          </button>
        </div>
      </div>
    </div>
  );
}
