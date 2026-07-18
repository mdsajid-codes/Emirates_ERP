import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  X,
  Save,
  Fuel,
  Calendar,
  MapPin,
  CircleDollarSign,
  FileText,
  AlertCircle,
  Truck,
  User,
  Activity,
  Upload,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function FuelEntryForm({ isOpen, onClose, onSave, initialData }) {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    fuelDate: new Date().toISOString().split('T')[0],
    fuelStation: '',
    fuelType: 'DIESEL',
    quantityLiters: '',
    amountAed: '',
    odometerReading: '',
    tripId: '',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        vehicleId: initialData.vehicleId || '',
        driverId: initialData.driverId || '',
        fuelDate: initialData.fuelDate || new Date().toISOString().split('T')[0],
        quantityLiters: initialData.quantityLiters || '',
        amountAed: initialData.amountAed || '',
        odometerReading: initialData.odometerReading || '',
        tripId: initialData.tripId || ''
      });
    } else {
      setFormData({
        vehicleId: '',
        driverId: '',
        fuelDate: new Date().toISOString().split('T')[0],
        fuelStation: '',
        fuelType: 'DIESEL',
        quantityLiters: '',
        amountAed: '',
        odometerReading: '',
        tripId: '',
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
        const [vRes, dRes] = await Promise.all([
          axios.get(`${API_URL}/fleet/vehicles`, { headers }),
          axios.get(`${API_URL}/fleet/drivers`, { headers })
        ]);
        setVehicles(vRes.data.content || []);
        setDrivers(dRes.data.content || []);
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!formData.vehicleId) {
        setTrips([]);
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/fleet/trips`, {
          params: { 
            status: 'IN_PROGRESS', 
            driverId: formData.driverId || undefined
          },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setTrips(response.data.content || []);
      } catch (error) {
        console.error('Error fetching trips:', error);
      }
    };
    if (isOpen) fetchTrips();
  }, [formData.vehicleId, formData.driverId, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (id, file) => {
    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);
    try {
      await axios.post(`${API_URL}/fleet/fuel/${id}/receipt`, uploadData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Receipt uploaded successfully');
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast.error('Failed to upload receipt');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const payload = {
        ...formData,
        vehicleId: Number(formData.vehicleId),
        driverId: formData.driverId ? Number(formData.driverId) : null,
        quantityLiters: Number(formData.quantityLiters),
        amountAed: Number(formData.amountAed),
        odometerReading: Number(formData.odometerReading),
        tripId: formData.tripId ? Number(formData.tripId) : null
      };

      let response;
      if (initialData?.id) {
        response = await axios.put(`${API_URL}/fleet/fuel/${initialData.id}`, payload, { headers });
        toast.success('Fuel entry updated');
      } else {
        response = await axios.post(`${API_URL}/fleet/fuel`, payload, { headers });
        toast.success('Fuel entry recorded');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving fuel entry:', error);
      toast.error(error.response?.data?.message || 'Failed to save entry');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-theme shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-theme text-primary">
              <Fuel size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {initialData ? 'Edit Fuel Entry' : 'New Fuel Entry'}
              </h2>
              <p className="text-xs text-foreground-muted">Record fuel purchase details for fleet vehicles</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-theme transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Truck size={12} /> Vehicle
              </label>
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plateNumber} - {v.make} {v.model}</option>
                ))}
              </select>
            </div>

            {/* Driver Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <User size={12} /> Driver (Optional)
              </label>
              <select
                name="driverId"
                value={formData.driverId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Select Driver</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Fuel Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Calendar size={12} /> Fuel Date
              </label>
              <input
                type="date"
                name="fuelDate"
                value={formData.fuelDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            {/* Fuel Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Activity size={12} /> Fuel Type
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="CNG">CNG</option>
              </select>
            </div>

            {/* Trip Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                Link to Trip (Optional)
              </label>
              <select
                name="tripId"
                value={formData.tripId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">No Trip Link</option>
                {trips.map(t => (
                  <option key={t.id} value={t.id}>{t.tripNo} | {t.fromLocation} → {t.toLocation}</option>
                ))}
              </select>
            </div>

            {/* Fuel Station */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <MapPin size={12} /> Fuel Station
              </label>
              <input
                type="text"
                name="fuelStation"
                value={formData.fuelStation}
                onChange={handleChange}
                placeholder="Station name/location"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            {/* Odometer */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                Odometer Reading (KM)
              </label>
              <input
                type="number"
                name="odometerReading"
                value={formData.odometerReading}
                onChange={handleChange}
                required
                placeholder="Current odometer"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                Quantity (Liters)
              </label>
              <input
                type="number"
                step="0.01"
                name="quantityLiters"
                value={formData.quantityLiters}
                onChange={handleChange}
                required
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            {/* Cost */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <CircleDollarSign size={12} /> Total Amount (AED)
              </label>
              <input
                type="number"
                step="0.01"
                name="amountAed"
                value={formData.amountAed}
                onChange={handleChange}
                required
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none font-bold text-primary"
              />
            </div>
          </div>

          {/* Receipt Upload */}
          {initialData?.id && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Upload size={12} /> Receipt Upload
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(initialData.id, e.target.files[0])}
                  className="hidden"
                  id="receipt-upload"
                  accept="image/*,application/pdf"
                />
                <label
                  htmlFor="receipt-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-muted border border-border border-dashed rounded-theme text-sm cursor-pointer hover:bg-muted/60 transition-colors"
                >
                  {isUploading ? <Activity size={16} className="animate-spin" /> : <Upload size={16} />}
                  {initialData.receiptPath ? 'Replace Receipt' : 'Upload Receipt'}
                </label>
                {initialData.receiptPath && (
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <CheckCircle2 size={14} />
                    Uploaded
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
              <FileText size={12} /> Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Any additional details..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm"
            ></textarea>
          </div>

          {/* Info Box */}
          <div className="bg-primary/5 border border-primary/10 p-3 rounded-theme flex gap-3 text-primary">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Updating the odometer here will automatically update the <span className="font-bold">Current Odometer</span> on the vehicle's master record.
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
            {initialData ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}
