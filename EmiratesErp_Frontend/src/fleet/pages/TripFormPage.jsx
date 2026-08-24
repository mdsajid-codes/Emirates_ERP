import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { 
  X, 
  Save, 
  Navigation, 
  Truck, 
  User, 
  Calendar, 
  MapPin, 
  CreditCard, 
  FileText,
  Clock,
  Package,
  ShieldCheck,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const TripFormPage = () => {
  const navigate = useNavigate();
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const id = pathId || searchParams.get('id');
  const isEditing = Boolean(id);
  
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isOutsourced, setIsOutsourced] = useState(false);

  // Dropdown Options State
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [routes, setRoutes] = useState([]);

  const [formData, setFormData] = useState({
    tripDate: new Date().toISOString().split('T')[0],
    driverId: '',
    containerNumber: '',
    startTime: '',
    estimatedEndTime: '',
    cargoType: '',
    loadWeightKg: '',
    vehicleId: '',
    remarks: '',
    customerId: '',
    customerRefJobNo: '',
    contactPerson: '',
    customerType: 'company',
    amount: '',
    tokenAmount: '',
    otherCharges: '',
    otherChargeType: '',
    tokenPaymentMethod: '',
    chequeNumber: '',
    otherReference: '',
    receivedBy: '',
    vendorId: '',
    vendorAmount: '',
    fromLocation: '',
    toLocation: '',
    routeId: '',
    tripStatus: 'SCHEDULED'
  });

  useEffect(() => {
    fetchOptions();
    if (isEditing && id) {
      fetchTripData(id);
    }
  }, [id, isEditing]);

  const fetchOptions = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const [vRes, dRes, cRes, venRes, rRes] = await Promise.allSettled([
        axios.get(`${API_URL}/fleet/vehicles/all`, { headers }),
        axios.get(`${API_URL}/fleet/drivers/all`, { headers }),
        axios.get(`${API_URL}/fleet/trip-customers`, { headers }),
        axios.get(`${API_URL}/fleet/vendors`, { headers }),
        axios.get(`${API_URL}/fleet/routes`, { headers })
      ]);

      if (vRes.status === 'fulfilled' && vRes.value.data) setVehicles(vRes.value.data.content || vRes.value.data || []);
      if (dRes.status === 'fulfilled' && dRes.value.data) setDrivers(dRes.value.data.content || dRes.value.data || []);
      if (cRes.status === 'fulfilled' && cRes.value.data) setCustomers(cRes.value.data.content || cRes.value.data || []);
      if (venRes.status === 'fulfilled' && venRes.value.data) setVendors(venRes.value.data.content || venRes.value.data || []);
      if (rRes.status === 'fulfilled' && rRes.value.data) setRoutes(rRes.value.data.content || rRes.value.data || []);
    } catch (err) {
      console.error("Error fetching trip dropdown options:", err);
    }
  };

  const fetchTripData = async (tripId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fleet/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data) {
        const trip = response.data;
        setFormData({
          tripDate: trip.tripDate || new Date().toISOString().split('T')[0],
          driverId: trip.driverId || trip.driver?.id || '',
          containerNumber: trip.containerNumber || '',
          startTime: trip.startTime || '',
          estimatedEndTime: trip.estimatedEndTime || '',
          cargoType: trip.cargoType || '',
          loadWeightKg: trip.loadWeightKg || '',
          vehicleId: trip.vehicleId || trip.vehicle?.id || '',
          remarks: trip.remarks || '',
          customerId: trip.customerId || trip.customer?.id || '',
          customerRefJobNo: trip.customerRefJobNo || '',
          contactPerson: trip.contactPerson || '',
          customerType: trip.customerType || 'company',
          amount: trip.amount ?? '',
          tokenAmount: trip.tokenAmount ?? '',
          otherCharges: trip.otherCharges ?? '',
          otherChargeType: trip.otherChargeType || '',
          tokenPaymentMethod: trip.tokenPaymentMethod || '',
          chequeNumber: trip.chequeNumber || '',
          otherReference: trip.otherReference || '',
          receivedBy: trip.receivedBy || '',
          vendorId: trip.vendorId || trip.vendor?.id || '',
          vendorAmount: trip.vendorAmount ?? '',
          fromLocation: trip.fromLocation || '',
          toLocation: trip.toLocation || '',
          routeId: trip.routeId || trip.route?.id || '',
          tripStatus: trip.tripStatus || 'SCHEDULED'
        });
        setIsOutsourced(Boolean(trip.vendorId || trip.vendor?.id || trip.vendorAmount));
      }
    } catch (error) {
      console.error("Error fetching trip details:", error);
      toast.error("Failed to load trip manifest");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Route Template Auto-Fill logic
    if (name === "routeId" && value) {
      const selectedRoute = routes.find(r => r.id === Number(value));
      if (selectedRoute) {
        setFormData(prev => ({
          ...prev,
          routeId: value,
          fromLocation: selectedRoute.fromLocation || prev.fromLocation,
          toLocation: selectedRoute.toLocation || prev.toLocation
        }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      
      const payload = { ...formData };
      ["driverId", "vehicleId", "customerId", "routeId", "vendorId", "amount", "tokenAmount", "otherCharges", "vendorAmount", "loadWeightKg"].forEach(key => {
        if (payload[key] === "") payload[key] = null;
      });

      if (!isOutsourced) {
        payload.vendorId = null;
        payload.vendorAmount = null;
      }

      if (isEditing) {
        await axios.put(`${API_URL}/fleet/trips/${id}`, payload, { headers });
        toast.success("Trip manifest updated successfully");
      } else {
        await axios.post(`${API_URL}/fleet/trips`, payload, { headers });
        toast.success("Trip created successfully");
      }

      navigate('/fleet-dashboard/trips');
    } catch (error) {
      console.error("Error saving trip:", error);
      toast.error(error.response?.data?.message || "Failed to save trip manifest");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل نموذج الرحلة...' : 'Loading trip form...'}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-tight">
            {isEditing ? (t('fleet.tripForm.editTitle') || 'Edit Trip Manifest') : (t('fleet.tripForm.addTitle') || 'Create New Trip')}
          </h1>
          <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-0.5">
            {t('fleet.tripForm.subtitle') || 'Enter logistics, cargo, driver asset, and route specifications.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/fleet-dashboard/trips')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <X className="w-4 h-4 text-[var(--color-foreground,#102A43)]" />
          <span>{t('fleet.driverForm.cancel') || 'Cancel'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Row 1: Section 1 & Section 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          {/* Section 1: Trip Manifest & Logistics */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Trip Manifest & Logistics</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Trip Date *</label>
                <input
                  type="date"
                  name="tripDate"
                  required
                  value={formData.tripDate}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Pre-planned Route</label>
                <select
                  name="routeId"
                  value={formData.routeId}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="">Manual Entry (No Template)</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.routeName || `${r.fromLocation} → ${r.toLocation}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">From Location *</label>
                <input
                  type="text"
                  name="fromLocation"
                  required
                  placeholder="Origin Address / Port"
                  value={formData.fromLocation}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">To Location *</label>
                <input
                  type="text"
                  name="toLocation"
                  required
                  placeholder="Destination Address / Yard"
                  value={formData.toLocation}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Est. End Date & Time</label>
                <input
                  type="datetime-local"
                  name="estimatedEndTime"
                  value={formData.estimatedEndTime}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Cargo Type</label>
                <input
                  type="text"
                  name="cargoType"
                  placeholder="e.g. General Cargo"
                  value={formData.cargoType}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Load Weight (Kg)</label>
                <input
                  type="number"
                  name="loadWeightKg"
                  placeholder="e.g. 24000"
                  value={formData.loadWeightKg}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Container Number</label>
                <input
                  type="text"
                  name="containerNumber"
                  placeholder="e.g. MAEU-9876543"
                  value={formData.containerNumber}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Remarks</label>
                <input
                  type="text"
                  name="remarks"
                  placeholder="Additional delivery notes..."
                  value={formData.remarks}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Customer Information */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Customer Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Customer / Client</label>
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="">Select Corporate Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName || c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Customer Ref / Job No</label>
                <input
                  type="text"
                  name="customerRefJobNo"
                  placeholder="e.g. JOB-8877"
                  value={formData.customerRefJobNo}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  placeholder="Contact Person Name"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Customer Type</label>
                <div className="flex items-center gap-4 py-1">
                  {["company", "individual"].map(type => (
                    <label key={type} className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-foreground,#102A43)] cursor-pointer capitalize">
                      <input
                        type="radio"
                        name="customerType"
                        value={type}
                        checked={formData.customerType === type}
                        onChange={handleInputChange}
                        className="accent-[var(--color-primary,#0178BC)]"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Personnel & Vehicle Assignment inside Section 2 */}
            <div className="border-t border-[var(--color-border,#E4EAF4)] pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Assigned Driver</label>
                <select
                  name="driverId"
                  value={formData.driverId}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="">Select Transport Driver</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} {d.status ? `(${d.status})` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Assigned Vehicle</label>
                <select
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="">Select Fleet Truck</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plateNumber} ({v.make || 'Truck'})</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

        </div>

        {/* Row 2: Section 3 & Section 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          {/* Section 3: Financials & Payment */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Financials & Payment Specifications</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Base Amount (AED)</label>
                <input
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Toll / Advance (AED)</label>
                <input
                  type="number"
                  name="tokenAmount"
                  placeholder="0.00"
                  value={formData.tokenAmount}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Other Charges (AED)</label>
                <input
                  type="number"
                  name="otherCharges"
                  placeholder="0.00"
                  value={formData.otherCharges}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Charge Type</label>
                <select
                  name="otherChargeType"
                  value={formData.otherChargeType}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="">Select Charge Type</option>
                  {["INSPECTION", "WAITING", "COMMISSION", "TOKEN_CANCELLATION", "OTHER"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Payment Method</label>
                <select
                  name="tokenPaymentMethod"
                  value={formData.tokenPaymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="">Select Method</option>
                  {["CASH", "BANK_TRANSFER", "CHEQUE", "ONLINE"].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Cheque Number</label>
                <input
                  type="text"
                  name="chequeNumber"
                  placeholder="e.g. CHQ-998811"
                  value={formData.chequeNumber}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Reference ID</label>
                <input
                  type="text"
                  name="otherReference"
                  placeholder="Ref Number"
                  value={formData.otherReference}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Received By</label>
                <input
                  type="text"
                  name="receivedBy"
                  placeholder="Staff / Receiver Name"
                  value={formData.receivedBy}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Vendor Assignment */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                4
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Vendor Assignment</h2>
            </div>

            <div className="flex items-center justify-between p-3 bg-sky-50/60 rounded-xl border border-sky-100">
              <div>
                <p className="text-xs font-bold text-[var(--color-foreground,#102A43)]">Outsource trip to third-party vendor?</p>
                <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)]">Enable to assign this manifest to an external partner</p>
              </div>
              <input
                type="checkbox"
                checked={isOutsourced}
                onChange={() => setIsOutsourced(!isOutsourced)}
                className="w-5 h-5 accent-[var(--color-primary,#0178BC)] cursor-pointer"
              />
            </div>

            {isOutsourced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Select Vendor</label>
                  <select
                    name="vendorId"
                    value={formData.vendorId}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                  >
                    <option value="">Select External Vendor</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.companyName || v.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Vendor Amount (AED)</label>
                  <input
                    type="number"
                    name="vendorAmount"
                    placeholder="0.00"
                    value={formData.vendorAmount}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => navigate('/fleet-dashboard/trips')}
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
            <span>{submitting ? (t('fleet.driverForm.saving') || 'Saving...') : (isEditing ? 'Update Trip' : 'Create Trip')}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default TripFormPage;
