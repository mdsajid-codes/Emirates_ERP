import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { 
  X, 
  Save, 
  Fuel, 
  Calendar, 
  MapPin, 
  CircleDollarSign, 
  FileText, 
  AlertCircle, 
  Upload,
  Truck,
  User,
  Activity
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const FuelFormPage = () => {
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
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [receiptFile, setReceiptFile] = useState(null);

  const [formData, setFormData] = useState({
    vehicleId: vehicleIdParam || '',
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
    fetchResources();
    if (isEditing && id) {
      fetchFuelData(id);
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (formData.vehicleId) {
      fetchTripsForVehicle(formData.vehicleId, formData.driverId);
    }
  }, [formData.vehicleId, formData.driverId]);

  const fetchResources = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const [vRes, dRes] = await Promise.all([
        axios.get(`${API_URL}/fleet/vehicles/all`, { headers }),
        axios.get(`${API_URL}/fleet/drivers/all`, { headers })
      ]);
      setVehicles(vRes.data?.content || vRes.data || []);
      setDrivers(dRes.data?.content || dRes.data || []);
    } catch (error) {
      console.error("Error fetching form resources:", error);
    }
  };

  const fetchTripsForVehicle = async (vId, dId) => {
    try {
      const response = await axios.get(`${API_URL}/fleet/trips`, {
        params: { 
          vehicleId: vId, 
          driverId: dId || undefined,
          status: 'IN_PROGRESS' 
        },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setTrips(response.data?.content || response.data || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  const fetchFuelData = async (fId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fleet/fuel/${fId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.data) {
        setFormData({
          vehicleId: response.data.vehicleId || response.data.vehicle?.id || '',
          driverId: response.data.driverId || response.data.driver?.id || '',
          fuelDate: response.data.fuelDate || new Date().toISOString().split('T')[0],
          fuelStation: response.data.fuelStation || '',
          fuelType: response.data.fuelType || 'DIESEL',
          quantityLiters: response.data.quantityLiters || '',
          amountAed: response.data.amountAed || '',
          odometerReading: response.data.odometerReading || '',
          tripId: response.data.tripId || '',
          notes: response.data.notes || ''
        });
      }
    } catch (error) {
      console.error("Error fetching fuel details:", error);
      toast.error("Failed to load fuel entry details");
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
    if (!formData.vehicleId || !formData.driverId || !formData.quantityLiters || !formData.amountAed) {
      toast.warn("Please fill in Vehicle, Driver, Quantity (L), and Amount (AED)");
      return;
    }

    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const payload = {
        ...formData,
        vehicleId: Number(formData.vehicleId),
        driverId: Number(formData.driverId),
        quantityLiters: Number(formData.quantityLiters),
        amountAed: Number(formData.amountAed),
        odometerReading: formData.odometerReading ? Number(formData.odometerReading) : null,
        tripId: formData.tripId ? Number(formData.tripId) : null,
        fuelStation: formData.fuelStation || null,
        notes: formData.notes || null
      };

      let entryId = id;
      if (isEditing) {
        await axios.put(`${API_URL}/fleet/fuel/${id}`, payload, { headers });
        toast.success("Fuel entry updated successfully");
      } else {
        const response = await axios.post(`${API_URL}/fleet/fuel`, payload, { headers });
        entryId = response.data.id;
        toast.success("Fuel entry logged successfully");
      }

      // Upload receipt file if provided
      if (receiptFile && entryId) {
        const fileData = new FormData();
        fileData.append('file', receiptFile);
        await axios.post(`${API_URL}/fleet/fuel/${entryId}/upload-receipt`, fileData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      navigate('/fleet-dashboard/fuel');
    } catch (error) {
      console.error("Error saving fuel entry:", error);
      toast.error(error.response?.data?.message || "Failed to save fuel entry");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل نموذج الوقود...' : 'Loading fuel form...'}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-tight">
            {isEditing ? (t('fleet.fuelForm.editTitle') || 'Edit Fuel Entry') : (t('fleet.fuelForm.addTitle') || 'New Fuel Entry')}
          </h1>
          <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-0.5">
            {t('fleet.fuelForm.subtitle') || 'Record fuel fills, station specs, odometer readings, and costs across UAE'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/fleet-dashboard/fuel')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <X className="w-4 h-4 text-[var(--color-foreground,#102A43)]" />
          <span>{t('fleet.driverForm.cancel') || 'Cancel'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Row 1: Section 1 & Section 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          {/* Section 1: Vehicle & Driver Selection */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Asset & Driver Allocation</h2>
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

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Fuel Date *</label>
                <input
                  type="date"
                  name="fuelDate"
                  required
                  value={formData.fuelDate}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Station Specs & Fuel Type */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Fuel Station & Product Specs</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="DIESEL">DIESEL</option>
                  <option value="PETROL_95">PETROL 95 (SPECIAL)</option>
                  <option value="PETROL_98">PETROL 98 (SUPER)</option>
                  <option value="ELECTRIC">ELECTRIC / EV CHARGING</option>
                  <option value="ADBLUE">ADBLUE / DEF</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Fuel Station Name</label>
                <input
                  type="text"
                  name="fuelStation"
                  placeholder="e.g. ADNOC Distribution - Sheikh Zayed Rd"
                  value={formData.fuelStation}
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
          
          {/* Section 3: Quantity & Financial Amount */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Volume & Financial Amount (AED)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Quantity (Liters) *</label>
                <input
                  type="number"
                  name="quantityLiters"
                  step="0.01"
                  required
                  placeholder="e.g. 120.5"
                  value={formData.quantityLiters}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Total Amount (AED) *</label>
                <input
                  type="number"
                  name="amountAed"
                  step="0.01"
                  required
                  placeholder="e.g. 385.60"
                  value={formData.amountAed}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] font-mono outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Attach Fuel Receipt Photo / Document</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-[var(--color-primary,#0178BC)]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Odometer & Additional Notes */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                4
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Odometer & Refueling Remarks</h2>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Odometer Reading (KM)</label>
                <input
                  type="number"
                  name="odometerReading"
                  placeholder="e.g. 148200"
                  value={formData.odometerReading}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Remarks / Fuel Card Notes</label>
                <textarea
                  rows={2}
                  name="notes"
                  placeholder="e.g. ADNOC Smart Pass Card fill #883..."
                  value={formData.notes}
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
            onClick={() => navigate('/fleet-dashboard/fuel')}
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
            <span>{submitting ? (t('fleet.driverForm.saving') || 'Saving...') : (isEditing ? 'Update Entry' : 'Log Fuel')}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default FuelFormPage;
