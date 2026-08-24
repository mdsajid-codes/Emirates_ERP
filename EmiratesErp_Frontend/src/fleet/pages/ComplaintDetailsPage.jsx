import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  ArrowRight,
  AlertTriangle, 
  CheckCircle2, 
  Edit2, 
  Calendar, 
  User, 
  Truck, 
  FileText,
  AlertCircle,
  Clock,
  Upload,
  Info
} from 'lucide-react';
import { complaintApi } from '../services/complaintApi';
import { useLanguage } from '../../context/LanguageContext';

const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchComplaintDetails = async () => {
    setLoading(true);
    try {
      const res = await complaintApi.getComplaintById(id);
      setComplaint(res);
    } catch (err) {
      console.error(err);
      toast.error('Error fetching complaint details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const handleMarkResolved = async () => {
    try {
      await complaintApi.updateComplaintStatus(id, 'RESOLVED');
      toast.success('Complaint status updated to RESOLVED');
      fetchComplaintDetails();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-[#E3F8EE] text-[#01A958]">RESOLVED</span>;
      case 'ESCALATED':
        return <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-rose-50 text-rose-600 border border-rose-200">ESCALATED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-amber-50 text-amber-600 border border-amber-200">IN PROGRESS</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-sky-50 text-[var(--color-primary,#0178BC)] border border-sky-200">OPEN</span>;
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-700 animate-pulse uppercase">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-700 uppercase">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-700 uppercase">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 uppercase">LOW</span>;
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل تفاصيل الشكوى...' : 'Loading complaint details...'}
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="w-full p-8 text-center text-xs text-rose-500 font-bold">
        Complaint details not found.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-card,#ffffff)] p-3 sm:p-4 rounded-xl border border-[var(--color-border,#D7E3EE)] shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/fleet-dashboard/complaints')}
            className="w-8 h-8 rounded-lg border border-[var(--color-border,#D7E3EE)] flex items-center justify-center text-[var(--color-foreground,#102A43)] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-none font-mono">
                CMP-{complaint.id}
              </h1>
              {getStatusBadge(complaint.status)}
              {getRiskBadge(complaint.riskLevel)}
            </div>
            <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-1">
              Category: <span className="font-semibold text-[var(--color-foreground,#102A43)]">{complaint.category || 'GENERAL'}</span> • Type: <span className="font-semibold text-[var(--color-foreground,#102A43)]">{complaint.type}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {complaint.status !== 'RESOLVED' && (
            <button
              onClick={handleMarkResolved}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('fleet.complaintDetails.markResolved') || 'Mark Resolved'}</span>
            </button>
          )}

          <button
            onClick={() => navigate(`/fleet-dashboard/complaints/complaint-form/${id}`)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{t('fleet.complaintDetails.editRecord') || 'Edit Incident'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Category & Type */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">CATEGORY & TYPE</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 truncate">{complaint.type} ({complaint.category})</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">Incident Classification</p>
          </div>
        </div>

        {/* Reported By & Date */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">REPORTED DATE</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 font-mono truncate">{complaint.reportedDate ? new Date(complaint.reportedDate).toLocaleDateString() : 'N/A'}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">By: {complaint.reportedByName || complaint.reportedByType || 'Staff'}</p>
          </div>
        </div>

        {/* Vehicle / Driver */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">RELATED ASSET</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 truncate">{complaint.vehiclePlateNumber || 'No Vehicle'}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">Driver: {complaint.driverName || 'N/A'}</p>
          </div>
        </div>

        {/* Assigned Admin */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">ASSIGNED ADMIN</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 truncate">{complaint.assignedToName || 'Unassigned'}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">Compliance Desk</p>
          </div>
        </div>

      </div>

      {/* Incident Description & Resolution Card */}
      <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-4 shadow-2xs space-y-4">
        <div className="border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
          <h2 className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] tracking-wider uppercase">INCIDENT DETAILS & RESOLUTION LOG</h2>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Description & Reported Incident Notes</p>
            <p className="font-semibold text-[var(--color-foreground,#102A43)] mt-1 bg-slate-50 p-3 rounded-lg border border-slate-200">{complaint.description || 'No description provided.'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Resolution Notes & Admin Action Taken</p>
            <p className="font-semibold text-[var(--color-foreground,#102A43)] mt-1 bg-slate-50 p-3 rounded-lg border border-slate-200">{complaint.resolutionNotes || 'Resolution notes pending.'}</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ComplaintDetailsPage;
