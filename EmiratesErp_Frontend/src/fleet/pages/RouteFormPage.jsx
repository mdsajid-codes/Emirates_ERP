import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { 
  X, 
  Save, 
  Navigation, 
  Calendar, 
  User, 
  Truck, 
  MapPin, 
  Clock, 
  Plus, 
  Trash2,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const RouteFormPage = () => {
  const navigate = useNavigate();
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const id = pathId || searchParams.get('id');
  const isEditing = Boolean(id);
  
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [formData, setFormData] = useState({
    routeName: "",
    driverId: "",
    vehicleId: "",
    routeDate: new Date().toISOString().split('T')[0],
    totalDistanceKm: "",
    estimatedDurationMins: "",
    stops: [
      { stopName: "", address: "", sequence: 1 }
    ]
  });

  useEffect(() => {
    fetchResources();
    if (isEditing && id) {
      fetchRouteData(id);
    }
  }, [id, isEditing]);

  const fetchResources = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const [dRes, vRes] = await Promise.all([
        axios.get(`${API_URL}/fleet/drivers/all`, { headers }),
        axios.get(`${API_URL}/fleet/vehicles/all`, { headers })
      ]);
      setDrivers(dRes.data?.content || dRes.data || []);
      setVehicles(vRes.data?.content || vRes.data || []);
    } catch (error) {
      console.error("Error fetching resources for route:", error);
    }
  };

  const fetchRouteData = async (routeId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fleet/routes/${routeId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.data) {
        setFormData({
          routeName: response.data.routeName || "",
          driverId: response.data.driver ? response.data.driver.id : (response.data.driverId || ""),
          vehicleId: response.data.vehicle ? response.data.vehicle.id : (response.data.vehicleId || ""),
          routeDate: response.data.routeDate || new Date().toISOString().split('T')[0],
          totalDistanceKm: response.data.totalDistanceKm || "",
          estimatedDurationMins: response.data.estimatedDurationMins || "",
          stops: response.data.stops && response.data.stops.length > 0 
            ? response.data.stops.map((s, idx) => ({ ...s, sequence: idx + 1 }))
            : [{ stopName: "", address: "", sequence: 1 }]
        });
      }
    } catch (error) {
      console.error("Error fetching route details:", error);
      toast.error("Failed to load route details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStopChange = (index, field, value) => {
    const newStops = [...formData.stops];
    newStops[index][field] = value;
    setFormData((prev) => ({ ...prev, stops: newStops }));
  };

  const addStop = () => {
    setFormData((prev) => ({
      ...prev,
      stops: [...prev.stops, { stopName: "", address: "", sequence: prev.stops.length + 1 }]
    }));
  };

  const removeStop = (index) => {
    if (formData.stops.length <= 1) return;
    const newStops = formData.stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, sequence: i + 1 }));
    setFormData((prev) => ({ ...prev, stops: newStops }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.routeName || !formData.driverId || !formData.vehicleId) {
      toast.warn("Please fill in Route Name, Driver, and Vehicle");
      return;
    }

    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const payload = {
        ...formData,
        driverId: Number(formData.driverId),
        vehicleId: Number(formData.vehicleId),
        totalDistanceKm: formData.totalDistanceKm ? Number(formData.totalDistanceKm) : null,
        estimatedDurationMins: formData.estimatedDurationMins ? Number(formData.estimatedDurationMins) : null
      };

      if (isEditing) {
        await axios.put(`${API_URL}/fleet/routes/${id}`, payload, { headers });
        toast.success("Route updated successfully");
      } else {
        await axios.post(`${API_URL}/fleet/routes`, payload, { headers });
        toast.success("Route created successfully");
      }

      navigate('/fleet-dashboard/routes');
    } catch (error) {
      console.error("Error saving route:", error);
      toast.error(error.response?.data?.message || "Failed to save route");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل نموذج المسار...' : 'Loading route form...'}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-tight">
            {isEditing ? (t('fleet.routeForm.editTitle') || 'Edit Operational Route') : (t('fleet.routeForm.addTitle') || 'Plan New Operational Route')}
          </h1>
          <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-0.5">
            {t('fleet.routeForm.subtitle') || 'Define multi-stop waypoints, driver assignment, and route schedules'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/fleet-dashboard/routes')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <X className="w-4 h-4 text-[var(--color-foreground,#102A43)]" />
          <span>{t('fleet.driverForm.cancel') || 'Cancel'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Row 1: Section 1 & Section 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          {/* Section 1: Route Header & Schedule */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Route Identification & Schedule</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Route Name *</label>
                <input
                  type="text"
                  name="routeName"
                  required
                  placeholder="e.g. Dubai - Abu Dhabi Logistics Corridor"
                  value={formData.routeName}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Route Date *</label>
                <input
                  type="date"
                  name="routeDate"
                  required
                  value={formData.routeDate}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Total Distance (KM)</label>
                <input
                  type="number"
                  name="totalDistanceKm"
                  placeholder="e.g. 145"
                  value={formData.totalDistanceKm}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Asset & Personnel Allocation */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Asset & Driver Allocation</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Assigned Driver *</label>
                <select
                  name="driverId"
                  required
                  value={formData.driverId}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="">Select Driver</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.employeeId || 'EM-01'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Assigned Vehicle *</label>
                <select
                  name="vehicleId"
                  required
                  value={formData.vehicleId}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plateNumber} ({v.makeModel || v.make || ''})</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Estimated Duration (Mins)</label>
                <input
                  type="number"
                  name="estimatedDurationMins"
                  placeholder="e.g. 180"
                  value={formData.estimatedDurationMins}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Row 2: Section 3 - Multi-Stop Waypoints */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Multi-Stop Journey Waypoints</h2>
            </div>
            
            <button
              type="button"
              onClick={addStop}
              className="inline-flex items-center gap-1 px-3 py-1 bg-sky-50 text-[var(--color-primary,#0178BC)] border border-sky-200 rounded-lg text-xs font-bold hover:bg-[var(--color-primary,#0178BC)] hover:text-white transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stop Point</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {formData.stops.map((stop, index) => (
              <div key={index} className="p-3 bg-slate-50 rounded-xl border border-[var(--color-border,#D7E3EE)] flex flex-col sm:flex-row items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[var(--color-primary,#0178BC)] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {index + 1}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Stop Name / Checkpoint"
                    value={stop.stopName}
                    onChange={(e) => handleStopChange(index, "stopName", e.target.value)}
                    required
                    className="px-2.5 py-1.5 bg-white border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Address / Location Details"
                    value={stop.address}
                    onChange={(e) => handleStopChange(index, "address", e.target.value)}
                    required
                    className="px-2.5 py-1.5 bg-white border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                  />
                </div>

                {formData.stops.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStop(index)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => navigate('/fleet-dashboard/routes')}
            className="px-5 py-2 border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] rounded-xl text-xs font-bold text-[var(--color-foreground,#102A43)] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            {t('fleet.driverForm.cancel') || 'Cancel'}
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#00A9A8] hover:bg-[#009190] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{submitting ? (t('fleet.driverForm.saving') || 'Saving...') : (isEditing ? 'Update Route' : 'Plan Route')}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default RouteFormPage;
