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
  Camera
} from 'lucide-react';
import { toast } from 'react-toastify';
import DispatchJobForm from './DispatchJobForm';
import DispatchAssignModal from './DispatchAssignModal';
import PodUploadModal from './PodUploadModal';

export default function DispatchJobs() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-100 ring-red-500/20';
      case 'URGENT': return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20';
      case 'NORMAL': return 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/20';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
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
    <>
      <div className="p-6 space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dispatch & Scheduling</h1>
            <p className="text-sm text-foreground-muted">Manage active jobs, assign resources, and track deliveries</p>
          </div>
          <button
            onClick={() => {
              setSelectedJob(null);
              setIsFormOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-theme font-medium hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            <Plus size={18} />
            Create Dispatch Job
          </button>
        </div>

        {/* Stats Quick View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Pending Assignment', count: jobs.filter(j => j.deliveryStatus === 'PENDING').length, icon: Clock, color: 'text-gray-500', bg: 'bg-gray-500/10' },
            { label: 'Active Dispatches', count: jobs.filter(j => j.deliveryStatus === 'DISPATCHED' || j.deliveryStatus === 'IN_TRANSIT').length, icon: Truck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Urgent/Critical', count: jobs.filter(j => j.priority === 'URGENT' || j.priority === 'CRITICAL').length, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Delivered Today', count: jobs.filter(j => j.deliveryStatus === 'DELIVERED').length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-border p-4 rounded-theme shadow-sm flex items-center gap-4">
              <div className={`${stat.bg} ${stat.color} p-2 rounded-theme`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-foreground-muted font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-foreground">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-card border border-border rounded-theme p-4 flex flex-wrap items-center gap-4 shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={18} />
            <input
              type="text"
              placeholder="Search Job #, Customer, or Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-foreground"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-foreground-muted" />
            <select
              className="bg-background border border-border rounded-theme px-3 py-2 text-sm focus:outline-none text-foreground"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Job Cards / Table */}
        <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Job Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Route (Pickup → Drop)</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Assigned Resources</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Priority & Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-foreground-muted">Loading dispatch board...</p>
                      </div>
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <ClipboardList size={48} />
                        <p className="text-lg font-medium">No active dispatch jobs found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-primary flex items-center gap-1">
                            {job.jobNo}
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                          <span className="text-xs text-foreground-muted">{job.jobDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-foreground">{job.customerName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-foreground-muted max-w-[200px]">
                          <MapPin size={14} className="text-primary flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="truncate" title={job.pickupLocation}>{job.pickupLocation}</span>
                            <span className="font-bold text-[10px] text-primary/50">TO</span>
                            <span className="truncate" title={job.dropLocation}>{job.dropLocation}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {job.assignedVehiclePlate ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Truck size={12} className="text-foreground-muted" />
                              <span className="font-medium">{job.assignedVehiclePlate}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <User size={12} className="text-foreground-muted" />
                              <span>{job.assignedDriverName}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 inline-block font-medium italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ring-1 ${getPriorityStyles(job.priority)}`}>
                            {job.priority}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(job.deliveryStatus)}`}>
                            {job.deliveryStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {job.deliveryStatus === 'PENDING' && (
                            <button
                              onClick={() => {
                                setSelectedJob(job);
                                setIsAssignModalOpen(true);
                              }}
                              className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-theme font-bold hover:bg-primary hover:text-white transition-all"
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
                              className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-theme font-bold hover:bg-green-600 hover:text-white transition-all flex items-center gap-1.5 border border-green-100"
                            >
                              <Camera size={14} />
                              POD
                            </button>
                          )}
                          <button className="p-2 hover:bg-muted rounded-theme text-foreground-muted transition-colors">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Premium Pagination Footer */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/20">
            <div className="text-sm text-foreground-muted font-bold">
              Showing page <span className="text-foreground">{page}</span> of{' '}
              <span className="text-foreground">{totalPages || 1}</span> ({totalElements} records)
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground-muted font-bold">Rows per page:</span>
                <select
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-background border border-border rounded-theme text-xs px-2 py-1 outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex gap-1.5">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 bg-background border border-border hover:bg-muted text-foreground rounded-theme text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 bg-background border border-border hover:bg-muted text-foreground rounded-theme text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DispatchJobForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={fetchJobs}
        initialData={selectedJob}
      />

      <DispatchAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSave={fetchJobs}
        job={selectedJob}
      />

      <PodUploadModal
        isOpen={isPodModalOpen}
        onClose={() => setIsPodModalOpen(false)}
        onSave={fetchJobs}
        job={selectedJob}
      />
    </>
  );
}
