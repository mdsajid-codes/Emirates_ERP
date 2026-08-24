import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  X,
  Save,
  AlertTriangle,
  Calendar,
  FileText,
  AlertCircle,
  Truck,
  User,
  Upload,
  CheckCircle2,
  Info,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import { complaintApi } from '../services/complaintApi';
import { useLanguage } from '../../context/LanguageContext';

const ComplaintFormPage = () => {
  const navigate = useNavigate();
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const id = pathId || searchParams.get('id');
  const isEditing = Boolean(id);

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [users, setUsers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    reportedDate: new Date().toISOString().slice(0, 16),
    reportedByType: 'STAFF',
    reportedById: '',
    type: 'COMPLAINT',
    category: 'BEHAVIOR',
    tripId: '',
    vehicleId: '',
    driverId: '',
    description: '',
    riskLevel: 'LOW',
    status: 'OPEN',
    assignedToId: '',
    resolutionNotes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
        const [vRes, dRes, tRes, uRes] = await Promise.all([
          axios.get(`${API_URL}/fleet/vehicles`, { headers }),
          axios.get(`${API_URL}/fleet/drivers`, { headers }),
          axios.get(`${API_URL}/fleet/trips`, { headers }),
          axios.get(`${API_URL}/users`, { headers })
        ]);
        setVehicles(vRes.data.content || []);
        setDrivers(dRes.data.content || []);
        setTrips(tRes.data.content || []);
        setUsers(uRes.data || []);

        if (id) {
          const comp = await complaintApi.getComplaintById(id);
          if (comp) {
            setFormData({
              ...comp,
              reportedDate: comp.reportedDate ? new Date(comp.reportedDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
              tripId: comp.tripId || '',
              vehicleId: comp.vehicleId || '',
              driverId: comp.driverId || '',
              assignedToId: comp.assignedToId || '',
              reportedById: comp.reportedById || ''
            });
          }
        }
      } catch (error) {
        console.error('Error fetching complaint form data:', error);
      }
    };
    fetchData();
  }, [id, API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (complaintId, file) => {
    try {
      setIsUploading(true);
      await complaintApi.uploadEvidence(complaintId, file);
      toast.success('Evidence file uploaded');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description) {
      toast.error('Please enter a description');
      return;
    }

    setSubmitting(true);
    try {
      let saved;
      if (isEditing) {
        saved = await complaintApi.updateComplaint(id, formData);
        toast.success('Complaint updated successfully');
      } else {
        saved = await complaintApi.createComplaint(formData);
        toast.success('Complaint reported successfully');
      }

      // If file selected
      const fileInput = document.getElementById('evidence-file-input');
      if (fileInput && fileInput.files[0] && saved.id) {
        await handleFileUpload(saved.id, fileInput.files[0]);
      }

      navigate('/fleet-dashboard/complaints');
    } catch (error) {
      console.error('Error saving complaint:', error);
      toast.error(error.response?.data?.message || 'Failed to save complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-tight">
            {isEditing ? (t('fleet.complaintForm.editTitle') || 'Edit Incident Record') : (t('fleet.complaintForm.addTitle') || 'Report Incident / Add Complaint')}
          </h1>
          <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-0.5">
            {t('fleet.complaintForm.subtitle') || 'Log fleet incidents, driver behavior complaints, risk levels, and resolution notes across UAE'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/fleet-dashboard/complaints')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <X className="w-4 h-4 text-[var(--color-foreground,#102A43)]" />
          <span>{t('fleet.driverForm.cancel') || 'Cancel'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Row 1: Section 1 & Section 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          {/* Section 1: Incident Classification */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Incident Classification & Reporter</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Incident Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="COMPLAINT">COMPLAINT</option>
                  <option value="ACCIDENT">ACCIDENT</option>
                  <option value="BREAKDOWN">BREAKDOWN</option>
                  <option value="VIOLATION">VIOLATION</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="BEHAVIOR">DRIVER BEHAVIOR</option>
                  <option value="DAMAGE">VEHICLE DAMAGE</option>
                  <option value="DELAY">TRIP DELAY</option>
                  <option value="SAFETY">SAFETY ISSUES</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Reported Date & Time *</label>
                <input
                  type="datetime-local"
                  name="reportedDate"
                  value={formData.reportedDate}
                  onChange={handleChange}
                  required
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Reporter Type</label>
                <select
                  name="reportedByType"
                  value={formData.reportedByType}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="STAFF">INTERNAL STAFF</option>
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="DRIVER">DRIVER</option>
                  <option value="PUBLIC">PUBLIC / OTHER</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Related Entity & Trip */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Related Vehicle, Driver & Trip</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Associated Vehicle</label>
                <select
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="">None / N/A</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.plateNumber} - {v.make} {v.model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Associated Driver</label>
                <select
                  name="driverId"
                  value={formData.driverId}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="">None / N/A</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.employeeId || 'ID'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Associated Trip</label>
                <select
                  name="tripId"
                  value={formData.tripId}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="">None / N/A</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>Trip #{t.tripNo} ({t.fromLocation} → {t.toLocation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Assigned Admin</label>
                <select
                  name="assignedToId"
                  value={formData.assignedToId}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.fullName || u.email}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Section 3: Risk Level, Status & Description */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
            <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Risk Severity & Incident Description</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Risk Severity *</label>
              <select
                name="riskLevel"
                value={formData.riskLevel}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="ESCALATED">ESCALATED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Detailed Description *</label>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the incident, damage details, or complaint specifics..."
              required
              className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Resolution / Action Taken Notes</label>
            <textarea
              rows={2}
              name="resolutionNotes"
              value={formData.resolutionNotes}
              onChange={handleChange}
              placeholder="Admin remarks or resolution steps taken..."
              className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none resize-none"
            />
          </div>
        </div>

        {/* Section 4: File Evidence Upload */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
            <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
              4
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Attach Evidence / Photo Upload</h2>
          </div>

          <div>
            <input
              id="evidence-file-input"
              type="file"
              className="w-full text-xs text-[var(--color-foreground-muted,#60738E)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-[var(--color-primary,#0178BC)] hover:file:bg-sky-100 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => navigate('/fleet-dashboard/complaints')}
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
            <span>{submitting ? 'Saving...' : 'Save Incident'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default ComplaintFormPage;
