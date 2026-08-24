import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { 
  X, 
  Save, 
  ClipboardList, 
  Calendar, 
  MapPin, 
  Package, 
  Weight, 
  AlertTriangle, 
  FileText,
  User,
  Building2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const DispatchFormPage = () => {
  const navigate = useNavigate();
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const id = pathId || searchParams.get('id');
  const prefilledTripId = searchParams.get('tripId');
  const isEditing = Boolean(id);
  
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);

  const [formData, setFormData] = useState({
    jobDate: new Date().toISOString().split('T')[0],
    customerId: '',
    pickupLocation: '',
    dropLocation: '',
    cargoDetails: '',
    loadWeight: '',
    priority: 'NORMAL',
    remarks: '',
    linkedTripId: prefilledTripId || ''
  });

  useEffect(() => {
    fetchCustomers();
    if (isEditing && id) {
      fetchJobData(id);
    }
  }, [id, isEditing]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/trip-customers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setCustomers(response.data.content || response.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchJobData = async (jobId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fleet/dispatch/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.data) {
        setFormData({
          jobDate: response.data.jobDate || new Date().toISOString().split('T')[0],
          customerId: response.data.customerId || response.data.customer?.id || '',
          pickupLocation: response.data.pickupLocation || '',
          dropLocation: response.data.dropLocation || '',
          cargoDetails: response.data.cargoDetails || '',
          loadWeight: response.data.loadWeight || '',
          priority: response.data.priority || 'NORMAL',
          remarks: response.data.remarks || '',
          linkedTripId: response.data.linkedTripId || ''
        });
      }
    } catch (error) {
      console.error('Error fetching dispatch job details:', error);
      toast.error('Failed to load dispatch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pickupLocation || !formData.dropLocation || !formData.customerId) {
      toast.warn("Please select Customer, Pickup Location, and Drop Location");
      return;
    }

    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const payload = {
        ...formData,
        customerId: formData.customerId ? Number(formData.customerId) : null,
        loadWeight: formData.loadWeight ? Number(formData.loadWeight) : null
      };

      if (isEditing) {
        await axios.put(`${API_URL}/fleet/dispatch/jobs/${id}`, payload, { headers });
        toast.success('Dispatch job updated successfully');
      } else {
        await axios.post(`${API_URL}/fleet/dispatch/jobs`, payload, { headers });
        toast.success('Dispatch job created successfully');
      }

      navigate('/fleet-dashboard/dispatch');
    } catch (error) {
      console.error('Error saving dispatch job:', error);
      toast.error(error.response?.data?.message || 'Failed to save dispatch job');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل نموذج الإرسال...' : 'Loading dispatch form...'}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-tight">
            {isEditing ? (t('fleet.dispatchForm.editTitle') || 'Edit Dispatch Job') : (t('fleet.dispatchForm.addTitle') || 'Create Dispatch Job')}
          </h1>
          <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-0.5">
            {t('fleet.dispatchForm.subtitle') || 'Register and schedule transport requirements across UAE'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/fleet-dashboard/dispatch')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <X className="w-4 h-4 text-[var(--color-foreground,#102A43)]" />
          <span>{t('fleet.driverForm.cancel') || 'Cancel'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Row 1: Section 1 & Section 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          {/* Section 1: Job Identification & Customer */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Job Identification & Client</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Job Dispatch Date *</label>
                <input
                  type="date"
                  name="jobDate"
                  required
                  value={formData.jobDate}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Customer / Client *</label>
                <select
                  name="customerId"
                  required
                  value={formData.customerId}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName || c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Dispatch Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="URGENT">URGENT</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              {formData.linkedTripId && (
                <div>
                  <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Linked Trip ID</label>
                  <input
                    type="text"
                    readOnly
                    value={`TRIP #${formData.linkedTripId}`}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-sky-700 font-mono font-bold outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Route Origin & Destination */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Pickup & Drop Location Specs</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Pickup Location *</label>
                <input
                  type="text"
                  name="pickupLocation"
                  required
                  placeholder="Port / Warehouse Origin Address"
                  value={formData.pickupLocation}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Drop Location *</label>
                <input
                  type="text"
                  name="dropLocation"
                  required
                  placeholder="Delivery Yard / Destination Address"
                  value={formData.dropLocation}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Row 2: Section 3 & Section 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          {/* Section 3: Cargo & Weight */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Cargo & Load Weight Specifications</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Load Weight (Kg)</label>
                <input
                  type="number"
                  name="loadWeight"
                  placeholder="e.g. 18500"
                  value={formData.loadWeight}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Cargo Details</label>
                <input
                  type="text"
                  name="cargoDetails"
                  placeholder="e.g. Heavy Equipment / Spares"
                  value={formData.cargoDetails}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Remarks */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                4
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Special Instructions & Remarks</h2>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Remarks / Delivery Notes</label>
              <textarea
                rows={2}
                name="remarks"
                placeholder="Additional instructions for driver and dispatch team..."
                value={formData.remarks}
                onChange={handleInputChange}
                className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none resize-none"
              />
            </div>
          </div>

        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => navigate('/fleet-dashboard/dispatch')}
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
            <span>{submitting ? (t('fleet.driverForm.saving') || 'Saving...') : (isEditing ? 'Update Job' : 'Create Job')}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default DispatchFormPage;
