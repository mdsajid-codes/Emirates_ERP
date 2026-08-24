import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  ArrowRight,
  Edit, 
  Trash2, 
  ClipboardList, 
  User, 
  Truck, 
  MapPin, 
  Calendar, 
  Weight, 
  Package, 
  AlertTriangle,
  Camera,
  CheckCircle2,
  FileText,
  UserPlus
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import DispatchAssignModal from './DispatchAssignModal';
import PodUploadModal from './PodUploadModal';

const DispatchDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const response = await axios.get(`${API_URL}/fleet/dispatch/jobs/${id}`, { headers });
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching dispatch job details:', error);
      toast.error('Failed to load dispatch job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this dispatch job?")) return;
    try {
      await axios.delete(`${API_URL}/fleet/dispatch/jobs/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Dispatch job deleted successfully");
      navigate('/fleet-dashboard/dispatch');
    } catch (error) {
      console.error("Error deleting dispatch job:", error);
      toast.error("Failed to delete dispatch job");
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-rose-50 text-rose-600 border border-rose-200">CRITICAL</span>;
      case 'URGENT':
        return <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-amber-50 text-amber-600 border border-amber-200">URGENT</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-sky-50 text-[var(--color-primary,#0178BC)] border border-sky-200">NORMAL</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-[#E3F8EE] text-[#01A958] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#01A958]"></span>
            DELIVERED
          </span>
        );
      case 'IN_TRANSIT':
      case 'DISPATCHED':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-blue-50 text-[#0178BC] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0178BC]"></span>
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-slate-100 text-slate-700 inline-flex items-center gap-1.5">
            {status || 'PENDING'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل تفاصيل المهمة...' : 'Loading dispatch job details...'}
      </div>
    );
  }

  if (!job) {
    return (
      <div className="w-full p-8 text-center text-xs text-rose-500 font-bold">
        Dispatch job not found.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-card,#ffffff)] p-3 sm:p-4 rounded-xl border border-[var(--color-border,#D7E3EE)] shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/fleet-dashboard/dispatch')}
            className="w-8 h-8 rounded-lg border border-[var(--color-border,#D7E3EE)] flex items-center justify-center text-[var(--color-foreground,#102A43)] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5 stroke-[2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-none font-mono">
                {job.jobNo || `JOB-${job.id}`}
              </h1>
              {getPriorityBadge(job.priority)}
              {getStatusBadge(job.deliveryStatus)}
            </div>
            <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-1">
              Customer: <span className="font-semibold text-[var(--color-foreground,#102A43)]">{job.customerName || 'Corporate Client'}</span> • Date: <span className="font-semibold text-[var(--color-foreground,#102A43)]">{job.jobDate || '–'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {job.deliveryStatus === 'PENDING' && (
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-primary,#0178BC)] text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('fleet.dispatchDetails.assign') || 'Assign Resources'}</span>
            </button>
          )}

          {(job.deliveryStatus === 'DISPATCHED' || job.deliveryStatus === 'IN_TRANSIT') && (
            <button
              onClick={() => setIsPodModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t('fleet.dispatchDetails.pod') || 'Upload POD'}</span>
            </button>
          )}

          <button
            onClick={() => navigate(`/fleet-dashboard/dispatch/job-form/${job.id}`)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Edit className="w-3.5 h-3.5 text-[var(--color-foreground,#102A43)]" />
            <span>{t('fleet.dispatchDetails.editJob') || 'Edit Job'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Customer & Date */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">CUSTOMER & DATE</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 truncate">{job.customerName}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)]">{job.jobDate}</p>
          </div>
        </div>

        {/* Assigned Vehicle & Driver */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">ASSIGNED RESOURCES</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 truncate">
              {job.assignedVehiclePlate || 'Unassigned Vehicle'}
            </p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">{job.assignedDriverName || 'No Driver Assigned'}</p>
          </div>
        </div>

        {/* Pickup -> Drop Location */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">ROUTE (PICKUP → DROP)</p>
            <p className="text-[11px] font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 truncate">{job.pickupLocation} → {job.dropLocation}</p>
          </div>
        </div>

        {/* Cargo & Load Weight */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">CARGO & LOAD WEIGHT</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 truncate">{job.cargoDetails || 'General Cargo'}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] font-mono">{job.loadWeight ? `${job.loadWeight} Kg` : '–'}</p>
          </div>
        </div>

      </div>

      {/* Main Specifications Section */}
      <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-4 shadow-2xs space-y-4">
        <div className="border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
          <h2 className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] tracking-wider uppercase">DISPATCH JOB SPECIFICATIONS</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Pickup Location</p>
            <p className="font-bold text-[var(--color-foreground,#102A43)] mt-1">{job.pickupLocation}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Drop Location</p>
            <p className="font-bold text-[var(--color-foreground,#102A43)] mt-1">{job.dropLocation}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Cargo Description</p>
            <p className="font-bold text-[var(--color-foreground,#102A43)] mt-1">{job.cargoDetails || '–'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Remarks / Instructions</p>
            <p className="font-bold text-[var(--color-foreground,#102A43)] mt-1">{job.remarks || '–'}</p>
          </div>
        </div>
      </div>

      {/* POD Documents Panel if available */}
      {job.podDocumentPath && (
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-4 shadow-2xs space-y-3">
          <div className="border-b border-[var(--color-border,#E4EAF4)] pb-2">
            <h2 className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] tracking-wider uppercase">PROOF OF DELIVERY (POD)</h2>
          </div>
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-[var(--color-foreground,#102A43)]">POD Uploaded</p>
              <p className="text-[10px] text-emerald-700">{job.podRemarks || 'Document verified on delivery'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions Bottom Bar */}
      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--color-border,#D7E3EE)]">
        <button 
          onClick={handleDelete}
          className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Job
        </button>
      </div>

      {/* Modals */}
      <DispatchAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSave={() => { fetchJob(); setIsAssignModalOpen(false); }}
        job={job}
      />

      <PodUploadModal
        isOpen={isPodModalOpen}
        onClose={() => setIsPodModalOpen(false)}
        onSave={() => { fetchJob(); setIsPodModalOpen(false); }}
        job={job}
      />

    </div>
  );
};

export default DispatchDetailsPage;
