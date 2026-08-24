import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { 
  X, 
  Save, 
  Wrench, 
  Calendar, 
  MapPin, 
  CircleDollarSign, 
  FileText, 
  AlertCircle, 
  Upload,
  Truck
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const MaintenanceFormPage = () => {
  const navigate = useNavigate();
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const id = pathId || searchParams.get('id');
  const vehicleIdParam = searchParams.get('vehicleId');
  const isEditing = Boolean(id);
  
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [invoiceFile, setInvoiceFile] = useState(null);

  const [formData, setFormData] = useState({
    vehicleId: vehicleIdParam || '',
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

  useEffect(() => {
    fetchVehicles();
    if (isEditing && id) {
      fetchMaintenanceData(id);
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (formData.vehicleId) {
      fetchTripsForVehicle(formData.vehicleId);
    }
  }, [formData.vehicleId]);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/vehicles/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setVehicles(response.data?.content || response.data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchTripsForVehicle = async (vId) => {
    try {
      const response = await axios.get(`${API_URL}/fleet/trips`, {
        params: { vehicleId: vId, status: 'IN_PROGRESS' },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setTrips(response.data?.content || response.data || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  const fetchMaintenanceData = async (mId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fleet/maintenance/${mId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.data) {
        setFormData({
          vehicleId: response.data.vehicleId || response.data.vehicle?.id || '',
          maintenanceType: response.data.maintenanceType || 'PREVENTIVE',
          serviceCategory: response.data.serviceCategory || 'OIL_CHANGE',
          requestedDate: response.data.requestedDate || new Date().toISOString().split('T')[0],
          scheduledDate: response.data.scheduledDate || '',
          garage: response.data.garage || '',
          odometerAtService: response.data.odometerAtService || '',
          estimatedCost: response.data.estimatedCost || '',
          serviceNotes: response.data.serviceNotes || '',
          spareParts: response.data.spareParts || '',
          tripId: response.data.tripId || ''
        });
      }
    } catch (error) {
      console.error("Error fetching maintenance details:", error);
      toast.error("Failed to load maintenance record details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      toast.warn("Please select a Vehicle");
      return;
    }

    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const payload = {
        ...formData,
        vehicleId: Number(formData.vehicleId),
        tripId: formData.tripId ? Number(formData.tripId) : null,
        odometerAtService: formData.odometerAtService ? Number(formData.odometerAtService) : null,
        estimatedCost: formData.estimatedCost ? Number(formData.estimatedCost) : null,
        scheduledDate: formData.scheduledDate || null,
        serviceNotes: formData.serviceNotes || null,
        garage: formData.garage || null
      };

      let recordId = id;
      if (isEditing) {
        await axios.put(`${API_URL}/fleet/maintenance/${id}`, payload, { headers });
        toast.success("Maintenance record updated successfully");
      } else {
        const response = await axios.post(`${API_URL}/fleet/maintenance`, payload, { headers });
        recordId = response.data.id;
        toast.success("Maintenance request created successfully");
      }

      // Upload invoice file if provided
      if (invoiceFile && recordId) {
        const fileData = new FormData();
        fileData.append('file', invoiceFile);
        await axios.post(`${API_URL}/fleet/maintenance/${recordId}/upload-invoice`, fileData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      navigate('/fleet-dashboard/maintenance');
    } catch (error) {
      console.error("Error saving maintenance record:", error);
      toast.error(error.response?.data?.message || "Failed to save maintenance record");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل نموذج الصيانة...' : 'Loading maintenance form...'}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-tight">
            {isEditing ? (t('fleet.maintenanceForm.editTitle') || 'Edit Maintenance Record') : (t('fleet.maintenanceForm.addTitle') || 'New Maintenance Request')}
          </h1>
          <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-0.5">
            {t('fleet.maintenanceForm.subtitle') || 'Log vehicle service requirements, garage specs, and estimated costs'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/fleet-dashboard/maintenance')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <X className="w-4 h-4 text-[var(--color-foreground,#102A43)]" />
          <span>{t('fleet.driverForm.cancel') || 'Cancel'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Row 1: Section 1 & Section 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          {/* Section 1: Vehicle & Schedule */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Vehicle & Schedule Identification</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Target Vehicle *</label>
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

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Maintenance Type</label>
                <select
                  name="maintenanceType"
                  value={formData.maintenanceType}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="PREVENTIVE">PREVENTIVE</option>
                  <option value="CORRECTIVE">CORRECTIVE</option>
                  <option value="EMERGENCY">EMERGENCY</option>
                  <option value="INSPECTION">INSPECTION</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Requested Date *</label>
                <input
                  type="date"
                  name="requestedDate"
                  required
                  value={formData.requestedDate}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Scheduled Date</label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Category & Garage Specs */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Service Category & Workshop Specs</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Service Category</label>
                <select
                  name="serviceCategory"
                  value={formData.serviceCategory}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="OIL_CHANGE">OIL CHANGE & FILTER</option>
                  <option value="TIRE_REPLACEMENT">TIRE REPLACEMENT / ROTATION</option>
                  <option value="BRAKE_SERVICE">BRAKE SYSTEM SERVICE</option>
                  <option value="ENGINE_REPAIR">ENGINE & TRANSMISSION</option>
                  <option value="ELECTRICAL">ELECTRICAL & BATTERY</option>
                  <option value="AC_SERVICE">AC & COOLING SYSTEM</option>
                  <option value="BODY_WORK">BODY REPAIR & PAINT</option>
                  <option value="OTHER">OTHER GENERAL REPAIRS</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Garage / Workshop Name</label>
                <input
                  type="text"
                  name="garage"
                  placeholder="e.g. Al Quoz Central Workshop"
                  value={formData.garage}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              {trips.length > 0 && (
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Link to Active Trip (Optional)</label>
                  <select
                    name="tripId"
                    value={formData.tripId}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                  >
                    <option value="">No Active Trip Linked</option>
                    {trips.map(t => (
                      <option key={t.id} value={t.id}>TRIP #{t.tripNo} - {t.fromLocation} → {t.toLocation}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Row 2: Section 3 & Section 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          {/* Section 3: Cost & Odometer */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Odometer & Cost Estimates (AED)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Odometer at Service (KM)</label>
                <input
                  type="number"
                  name="odometerAtService"
                  placeholder="e.g. 124500"
                  value={formData.odometerAtService}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Estimated Cost (AED)</label>
                <input
                  type="number"
                  name="estimatedCost"
                  placeholder="e.g. 1500"
                  value={formData.estimatedCost}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] font-mono outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Attach Maintenance Invoice / Receipt</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setInvoiceFile(e.target.files[0])}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-[var(--color-primary,#0178BC)]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Notes & Spare Parts */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                4
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Service Notes & Replaced Spare Parts</h2>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Replaced Spare Parts</label>
                <input
                  type="text"
                  name="spareParts"
                  placeholder="e.g. Synthetic Oil 5W40, Oil Filter, Air Filter"
                  value={formData.spareParts}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Service Notes / Remarks</label>
                <textarea
                  rows={2}
                  name="serviceNotes"
                  placeholder="Detailed inspection findings and mechanic remarks..."
                  value={formData.serviceNotes}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none resize-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => navigate('/fleet-dashboard/maintenance')}
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
            <span>{submitting ? (t('fleet.driverForm.saving') || 'Saving...') : (isEditing ? 'Update Record' : 'Create Request')}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default MaintenanceFormPage;
