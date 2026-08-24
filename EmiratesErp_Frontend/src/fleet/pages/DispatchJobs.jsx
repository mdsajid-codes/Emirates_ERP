import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ClipboardList,
  Plus,
  Filter,
  Search,
  Truck,
  User,
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  Camera,
  Eye,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  Columns
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import DispatchAssignModal from './DispatchAssignModal';
import PodUploadModal from './PodUploadModal';

export default function DispatchJobs() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Pagination & Debouncing states
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchJobs = async (p = page, s = size, searchVal = debouncedSearch, status = statusFilter) => {
    try {
      setLoading(true);
      const params = {
        page: p - 1, // backend is 0-indexed
        size: s,
        search: searchVal || undefined,
        status: status || undefined
      };
      const response = await axios.get(`${API_URL}/fleet/dispatch/jobs`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setJobs(response.data.content || []);
      setTotalElements(response.data.totalElements || 0);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching dispatch jobs:', error);
      toast.error('Failed to load dispatch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchJobs(1, size, debouncedSearch, statusFilter);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchJobs(page, size, debouncedSearch, statusFilter);
  }, [page, size]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dispatch job?")) return;
    try {
      await axios.delete(`${API_URL}/fleet/dispatch/jobs/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success("Dispatch job deleted successfully");
      fetchJobs(page, size);
    } catch (error) {
      console.error("Error deleting dispatch job:", error);
      toast.error("Failed to delete dispatch job");
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
      case 'URGENT': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'NORMAL': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'DISPATCHED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_TRANSIT': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center justify-center text-[var(--color-primary,#0178BC)]">
            <ClipboardList className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#0F172A)] tracking-tight leading-tight">
              {t('fleet.dispatch.title') || 'Dispatch & Scheduling'}
            </h1>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-0.5">
              {t('fleet.dispatch.subtitle') || 'Manage active jobs, assign resources, and track deliveries'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/fleet-dashboard/dispatch/job-form')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00A9A8] text-white text-xs font-semibold hover:opacity-90 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('fleet.dispatch.createJob') || 'Create Dispatch Job'}</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Pending Assignment */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.dispatch.pendingAssignment') || 'Pending Assignment'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{jobs.filter(j => j.deliveryStatus === 'PENDING').length}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">Awaiting Driver & Vehicle</p>
          </div>
        </div>

        {/* Active Dispatches */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.dispatch.activeDispatches') || 'Active Dispatches'}</p>
            <p className="text-xl font-extrabold text-[var(--color-primary,#0178BC)] leading-none my-0.5">{jobs.filter(j => j.deliveryStatus === 'DISPATCHED' || j.deliveryStatus === 'IN_TRANSIT').length}</p>
            <p className="text-[10px] font-semibold text-emerald-600 truncate">On Road Deliveries</p>
          </div>
        </div>

        {/* Urgent/Critical */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.dispatch.urgentCritical') || 'Urgent/Critical'}</p>
            <p className="text-xl font-extrabold text-amber-600 leading-none my-0.5">{jobs.filter(j => j.priority === 'URGENT' || j.priority === 'CRITICAL').length}</p>
            <p className="text-[10px] text-amber-600 font-semibold truncate">High Priority Jobs</p>
          </div>
        </div>

        {/* Delivered Today */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.dispatch.deliveredToday') || 'Delivered Today'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{jobs.filter(j => j.deliveryStatus === 'DELIVERED').length}</p>
            <p className="text-[10px] text-emerald-600 font-semibold truncate">Successfully Completed</p>
          </div>
        </div>

      </div>

      {/* Main Table Section Card */}
      <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] shadow-xs overflow-hidden">
        
        {/* Table Controls Top Bar */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[var(--color-border,#D9DADD)]">
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-foreground-muted,#656873)] w-4 h-4" />
              <input
                type="text"
                placeholder={t('fleet.dispatch.searchPlaceholder') || "Search Job #, Customer, or Location..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] rounded-xl text-xs text-[var(--color-foreground,#0F172A)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-[var(--color-border,#D9DADD)] rounded-xl text-xs font-semibold text-[var(--color-foreground,#0F172A)] bg-[var(--color-card,#ffffff)] outline-none cursor-pointer"
            >
              <option value="">{t('fleet.drivers.allStatuses') || 'All Statuses'}</option>
              <option value="PENDING">PENDING</option>
              <option value="DISPATCHED">DISPATCHED</option>
              <option value="IN_TRANSIT">IN TRANSIT</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 justify-end w-full sm:w-auto">
            <button className="w-9 h-9 bg-[var(--color-primary,#0178BC)] text-white rounded-xl flex items-center justify-center shadow-xs cursor-pointer">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 border border-[var(--color-border,#D9DADD)] text-[var(--color-foreground,#0F172A)] rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer">
              <List className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 border border-[var(--color-border,#D9DADD)] text-[var(--color-border,#D9DADD)] rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer">
              <Columns className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Data Table Container */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'جاري تحميل قائمة الإرساليات...' : 'Loading dispatch board...'}
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'لا توجد بيانات متاحة للمعايير المحددة' : 'No active dispatch jobs found'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead className="bg-slate-50 border-b border-[var(--color-border,#D9DADD)]">
                <tr>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">JOB DETAILS</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">CUSTOMER</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">ROUTE (PICKUP → DROP)</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">ASSIGNED RESOURCES</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">PRIORITY & STATUS</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)] text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border,#D9DADD)] text-xs text-[var(--color-foreground,#0F172A)]">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td 
                      onClick={() => navigate(`/fleet-dashboard/dispatch/job-details/${job.id}`)}
                      className="p-3.5 cursor-pointer font-mono"
                    >
                      <span className="font-bold text-[var(--color-primary,#0178BC)] hover:underline block">{job.jobNo}</span>
                      <span className="text-[11px] text-[var(--color-foreground-muted,#656873)] font-sans">{job.jobDate}</span>
                    </td>

                    <td className="p-3.5 font-bold text-purple-700">{job.customerName}</td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-xs max-w-[220px]">
                        <MapPin size={14} className="text-[var(--color-primary,#0178BC)] shrink-0" />
                        <span className="truncate">{job.pickupLocation} → {job.dropLocation}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      {job.assignedVehiclePlate ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[var(--color-foreground,#0F172A)] flex items-center gap-1">
                            <Truck size={12} className="text-[var(--color-primary,#0178BC)]" />
                            {job.assignedVehiclePlate}
                          </span>
                          <span className="text-[11px] text-[var(--color-foreground-muted,#656873)]">{job.assignedDriverName}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityStyles(job.priority)}`}>
                          {job.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(job.deliveryStatus)}`}>
                          {job.deliveryStatus}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/fleet-dashboard/dispatch/job-details/${job.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#0178BC)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 stroke-[1.8]" />
                        </button>

                        {job.deliveryStatus === 'PENDING' && (
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              setIsAssignModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 text-[var(--color-primary,#0178BC)] border border-sky-200 text-xs font-bold hover:bg-[var(--color-primary,#0178BC)] hover:text-white transition-all cursor-pointer"
                          >
                            Assign
                          </button>
                        )}

                        {(job.deliveryStatus === 'DISPATCHED' || job.deliveryStatus === 'IN_TRANSIT') && (
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              setIsPodModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Camera size={12} /> POD
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/fleet-dashboard/dispatch/job-form/${job.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#0178BC)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Edit Job"
                        >
                          <Edit2 className="w-4 h-4 stroke-[1.8]" />
                        </button>

                        <button
                          onClick={() => handleDelete(job.id)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[#D6282F] hover:bg-rose-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.8]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Pagination Bar */}
        <div className="p-4 flex items-center justify-between border-t border-[var(--color-border,#D9DADD)] text-xs text-[var(--color-foreground-muted,#656873)]">
          <div>
            Showing page <span className="font-bold text-[var(--color-foreground,#0F172A)]">{page}</span> of <span className="font-bold text-[var(--color-foreground,#0F172A)]">{totalPages || 1}</span> ({totalElements} records)
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              className="px-2.5 py-1.5 border border-[var(--color-border,#D9DADD)] rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              &lt;
            </button>
            <button className="px-3 py-1.5 bg-[var(--color-primary,#0178BC)] text-white font-bold rounded-lg cursor-pointer">
              {page}
            </button>
            <button 
              disabled={page >= totalPages}
              onClick={() => setPage(prev => prev + 1)}
              className="px-2.5 py-1.5 border border-[var(--color-border,#D9DADD)] rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              &gt;
            </button>
          </div>
        </div>

      </div>

      {/* Modals */}
      <DispatchAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSave={() => { fetchJobs(page, size); setIsAssignModalOpen(false); }}
        job={selectedJob}
      />

      <PodUploadModal
        isOpen={isPodModalOpen}
        onClose={() => setIsPodModalOpen(false)}
        onSave={() => { fetchJobs(page, size); setIsPodModalOpen(false); }}
        job={selectedJob}
      />

    </div>
  );
}
