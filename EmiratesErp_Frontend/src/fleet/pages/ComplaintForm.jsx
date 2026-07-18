import React, { useState, useEffect } from 'react';
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

export default function ComplaintForm({ isOpen, onClose, onSave, initialData }) {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [users, setUsers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
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
    if (initialData) {
      setFormData({
        ...initialData,
        reportedDate: initialData.reportedDate ? new Date(initialData.reportedDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        tripId: initialData.tripId || '',
        vehicleId: initialData.vehicleId || '',
        driverId: initialData.driverId || '',
        assignedToId: initialData.assignedToId || '',
        reportedById: initialData.reportedById || ''
      });
    } else {
      setFormData({
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
    }
  }, [initialData, isOpen]);

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
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (id, file) => {
    setIsUploading(true);
    try {
      await complaintApi.uploadAttachment(id, file);
      toast.success('Attachment uploaded successfully');
      onSave();
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast.error('Failed to upload attachment');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: Require resolution notes if status is RESOLVED
    if (formData.status === 'RESOLVED' && (!formData.resolutionNotes || formData.resolutionNotes.trim().length < 5)) {
      toast.warning('Please provide detailed resolution notes before marking as Resolved');
      return;
    }

    try {
      const payload = {
        ...formData,
        tripId: formData.tripId ? Number(formData.tripId) : null,
        vehicleId: formData.vehicleId ? Number(formData.vehicleId) : null,
        driverId: formData.driverId ? Number(formData.driverId) : null,
        assignedToId: formData.assignedToId ? Number(formData.assignedToId) : null,
        reportedById: formData.reportedById ? Number(formData.reportedById) : 1 // Default to 1 for system/admin if empty
      };

      if (initialData?.id) {
        await complaintApi.updateComplaint(initialData.id, payload);
        toast.success('Complaint updated');
      } else {
        await complaintApi.createComplaint(payload);
        toast.success('Complaint reported successfully');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving complaint:', error);
      toast.error(error.response?.data?.message || 'Failed to save complaint');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-theme shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-theme text-primary">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {initialData ? `Edit Record: ${initialData.complaintCode || 'Draft'}` : 'New Incident Report'}
              </h2>
              <p className="text-xs text-foreground-muted">Record behavior, damage, or logistical issues</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-theme transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Professional Code Field */}
          <div className="bg-primary/5 border border-primary/10 p-4 rounded-theme flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <FileText size={20} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Incident Reference</p>
                  <p className="text-lg font-black text-primary font-mono tracking-tight">
                    {initialData?.complaintCode || "AUTO-GENERATED"}
                  </p>
               </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
               formData.riskLevel === 'CRITICAL' ? 'bg-error text-error-foreground' :
               formData.riskLevel === 'HIGH' ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'
            }`}>
               {formData.riskLevel} RISK
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reported Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Calendar size={12} /> Date & Time
              </label>
              <input
                type="datetime-local"
                name="reportedDate"
                value={formData.reportedDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            {/* Risk Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <AlertCircle size={12} /> Risk Level
              </label>
              <select
                name="riskLevel"
                value={formData.riskLevel}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none font-bold"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="COMPLAINT">Complaint</option>
                <option value="INCIDENT">Incident</option>
                <option value="ACCIDENT">Accident</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="DELAY">Delay</option>
                <option value="DAMAGE">Damage</option>
                <option value="BEHAVIOR">Behavior</option>
                <option value="ACCIDENT">Accident</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Link Trip */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Briefcase size={12} /> Related Trip
              </label>
              <select
                name="tripId"
                value={formData.tripId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">No Trip Linked</option>
                {trips.map(t => (
                  <option key={t.id} value={t.id}>Trip #{t.tripNo} - {t.customer?.name || 'N/A'}</option>
                ))}
              </select>
            </div>

            {/* Link Vehicle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Truck size={12} /> Related Vehicle
              </label>
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">No Vehicle Linked</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plateNumber} ({v.make} {v.model})</option>
                ))}
              </select>
            </div>

            {/* Link Driver */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <User size={12} /> Related Driver
              </label>
              <select
                name="driverId"
                value={formData.driverId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">No Driver Linked</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Assigned To */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <UserCheck size={12} /> Assign To
              </label>
              <select
                name="assignedToId"
                value={formData.assignedToId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reported By (Simplified for now) */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground-muted uppercase ml-1">Reported By Type</label>
                <select
                  name="reportedByType"
                  value={formData.reportedByType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="STAFF">Staff</option>
                  <option value="DRIVER">Driver</option>
                  <option value="CUSTOMER">Customer</option>
                </select>
             </div>
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground-muted uppercase ml-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="ESCALATED">Escalated</option>
                </select>
             </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
              <FileText size={12} /> Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Detailed description of what happened..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm"
            ></textarea>
          </div>

          {/* Resolution Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
              <CheckCircle2 size={12} /> Resolution Notes
            </label>
            <textarea
              name="resolutionNotes"
              value={formData.resolutionNotes}
              onChange={handleChange}
              rows="2"
              placeholder="How was this issue resolved?"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm"
            ></textarea>
          </div>

          {/* Attachment Upload */}
          {initialData?.id && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Upload size={12} /> Evidence Attachment
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(initialData.id, e.target.files[0])}
                  className="hidden"
                  id="attachment-upload"
                />
                <label
                  htmlFor="attachment-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-muted border border-border border-dashed rounded-theme text-sm cursor-pointer hover:bg-muted/60 transition-colors"
                >
                  {isUploading ? <AlertCircle size={16} className="animate-spin" /> : <Upload size={16} />}
                  {initialData.attachmentPath ? 'Replace Evidence' : 'Upload Evidence (Photo/Doc)'}
                </label>
                {initialData.attachmentPath && (
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <CheckCircle2 size={14} />
                    Attached
                  </div>
                )}
              </div>
            </div>
          )}
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
            {initialData ? 'Update Record' : 'Save Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
