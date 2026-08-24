import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  ArrowRight,
  Edit, 
  Trash2, 
  Wrench, 
  User, 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  CircleDollarSign,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import CompleteMaintenanceModal from './CompleteMaintenanceModal';

const MaintenanceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const fetchRecord = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const response = await axios.get(`${API_URL}/fleet/maintenance/${id}`, { headers });
      setRecord(response.data);
    } catch (error) {
      console.error('Error fetching maintenance details:', error);
      toast.error('Failed to load maintenance details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this maintenance record?")) return;
    try {
      await axios.delete(`${API_URL}/fleet/maintenance/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Maintenance record deleted successfully");
      navigate('/fleet-dashboard/maintenance');
    } catch (error) {
      console.error("Error deleting maintenance record:", error);
      toast.error("Failed to delete maintenance record");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-[#E3F8EE] text-[#01A958] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#01A958]"></span>
            COMPLETED
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-amber-50 text-amber-600 border border-amber-200 inline-flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            IN PROGRESS
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-blue-50 text-[#0178BC] border border-blue-200 inline-flex items-center gap-1.5">
            SCHEDULED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-slate-100 text-slate-700 inline-flex items-center gap-1.5">
            {status || 'REQUESTED'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل تفاصيل الصيانة...' : 'Loading maintenance details...'}
      </div>
    );
  }

  if (!record) {
    return (
      <div className="w-full p-8 text-center text-xs text-rose-500 font-bold">
        Maintenance record not found.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-card,#ffffff)] p-3 sm:p-4 rounded-xl border border-[var(--color-border,#D7E3EE)] shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/fleet-dashboard/maintenance')}
            className="w-8 h-8 rounded-lg border border-[var(--color-border,#D7E3EE)] flex items-center justify-center text-[var(--color-foreground,#102A43)] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5 stroke-[2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-none font-mono">
                {record.serviceNumber || `SVC-${record.id}`}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-purple-50 text-purple-700 border border-purple-200">
                {record.maintenanceType || 'PREVENTIVE'}
              </span>
              {getStatusBadge(record.status)}
            </div>
            <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-1">
              Vehicle: <span className="font-semibold text-[var(--color-foreground,#102A43)] font-mono">{record.vehiclePlateNumber || record.vehicle?.plateNumber || '–'}</span> • Garage: <span className="font-semibold text-[var(--color-foreground,#102A43)]">{record.garage || 'Central Workshop'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {record.status !== 'COMPLETED' && (
            <button
              onClick={() => setIsCompleteModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('fleet.maintenanceDetails.complete') || 'Complete Service'}</span>
            </button>
          )}

          <button
            onClick={() => navigate(`/fleet-dashboard/maintenance/maintenance-form/${record.id}`)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Edit className="w-3.5 h-3.5 text-[var(--color-foreground,#102A43)]" />
            <span>{t('fleet.maintenanceDetails.editRecord') || 'Edit Record'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Vehicle & Plate */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">VEHICLE & PLATE</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 font-mono truncate">{record.vehiclePlateNumber || record.vehicle?.plateNumber || 'N/A'}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">{record.vehicleMakeModel || record.vehicle?.makeModel || 'Fleet Asset'}</p>
          </div>
        </div>

        {/* Category & Type */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">CATEGORY & TYPE</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 truncate">{record.serviceCategory || 'OIL_CHANGE'}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)]">{record.maintenanceType || 'PREVENTIVE'}</p>
          </div>
        </div>

        {/* Date & Garage */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">SCHEDULED & GARAGE</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 truncate">{record.scheduledDate || record.requestedDate}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">{record.garage || 'Central Workshop'}</p>
          </div>
        </div>

        {/* Cost AED */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CircleDollarSign className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">MAINTENANCE COST</p>
            <p className="text-xs font-extrabold text-emerald-600 leading-tight my-0.5 font-mono truncate">
              {record.actualCost ? `${record.actualCost} AED` : (record.estimatedCost ? `${record.estimatedCost} AED (Est.)` : '0 AED')}
            </p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] font-mono">{record.odometerAtService ? `${record.odometerAtService} KM` : '–'}</p>
          </div>
        </div>

      </div>

      {/* Main Specifications Section */}
      <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-4 shadow-2xs space-y-4">
        <div className="border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
          <h2 className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] tracking-wider uppercase">SERVICE SPECIFICATIONS & NOTES</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Garage Workshop</p>
            <p className="font-bold text-[var(--color-foreground,#102A43)] mt-1">{record.garage || 'Central Workshop'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Replaced Spare Parts</p>
            <p className="font-bold text-[var(--color-foreground,#102A43)] mt-1">{record.spareParts || '–'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Service Notes / Remarks</p>
            <p className="font-bold text-[var(--color-foreground,#102A43)] mt-1">{record.serviceNotes || '–'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Completed Date</p>
            <p className="font-bold text-[var(--color-foreground,#102A43)] mt-1">{record.completedDate || '–'}</p>
          </div>
        </div>
      </div>

      {/* Actions Bottom Bar */}
      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--color-border,#D7E3EE)]">
        <button 
          onClick={handleDelete}
          className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Record
        </button>
      </div>

      {/* Complete Maintenance Modal */}
      <CompleteMaintenanceModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        record={record}
        onSuccess={() => { fetchRecord(); setIsCompleteModalOpen(false); }}
      />

    </div>
  );
};

export default MaintenanceDetailsPage;
