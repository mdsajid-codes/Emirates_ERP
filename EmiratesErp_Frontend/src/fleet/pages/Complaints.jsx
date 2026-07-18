import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Plus,
  Filter,
  Search,
  Edit2,
  Trash2,
  Calendar,
  FileText,
  User,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { toast } from 'react-toastify';
import { complaintApi } from '../services/complaintApi';
import ComplaintForm from './ComplaintForm';

const STATUS_COLORS = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  ESCALATED: 'bg-red-100 text-red-700'
};

const RISK_COLORS = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-orange-100 text-orange-700',
  HIGH: 'bg-red-100 text-red-700',
  CRITICAL: 'bg-purple-100 text-purple-700 shadow-sm animate-pulse'
};

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

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

  const fetchComplaints = async (p = page, s = size, searchVal = debouncedSearch, statusVal = statusFilter, riskVal = riskFilter) => {
    try {
      setLoading(true);
      const params = {
        page: p - 1, // backend is 0-indexed
        size: s,
        search: searchVal || undefined,
        status: statusVal || undefined,
        riskLevel: riskVal || undefined
      };
      
      const data = await complaintApi.getAllComplaints(params);
      setComplaints(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await complaintApi.deleteComplaint(id);
      toast.success('Complaint deleted');
      fetchComplaints();
    } catch (error) {
      console.error('Error deleting complaint:', error);
      toast.error('Failed to delete complaint');
    }
  };

  useEffect(() => {
    setPage(1);
    fetchComplaints(1, size, debouncedSearch, statusFilter, riskFilter);
  }, [debouncedSearch, statusFilter, riskFilter]);

  useEffect(() => {
    fetchComplaints(page, size, debouncedSearch, statusFilter, riskFilter);
  }, [page, size]);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="text-primary" />
            Complaint & Incident Management
          </h1>
          <p className="text-sm text-foreground-muted">Track and resolve fleet-related issues, accidents, and driver behavior</p>
        </div>
        <button
          onClick={() => {
            setSelectedComplaint(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-theme font-medium hover:opacity-90 transition-all shadow-md shadow-primary/20"
        >
          <Plus size={18} />
          Report Incident
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-theme p-4 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={18} />
          <input
            type="text"
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-foreground"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-foreground-muted" />
            <select
              className="bg-background border border-border rounded-theme px-3 py-2 text-sm focus:outline-none text-foreground"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="ESCALATED">Escalated</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-foreground-muted" />
            <select
              className="bg-background border border-border rounded-theme px-3 py-2 text-sm focus:outline-none text-foreground"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="">All Risks</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Complaint ID</th>
                <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Issue & Date</th>
                <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Related To</th>
                <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-foreground-muted">Loading complaints...</p>
                    </div>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <AlertCircle size={48} />
                      <p className="text-lg font-medium">No complaints found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded border border-primary/10">
                        {complaint.complaintCode || 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground line-clamp-1">{complaint.type}: {complaint.category}</span>
                        <span className="text-xs text-foreground-muted flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(complaint.reportedDate).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {complaint.tripNo && (
                          <span className="text-xs font-medium flex items-center gap-1 text-primary">
                            <FileText size={12} />
                            Trip #{complaint.tripNo}
                          </span>
                        )}
                        {complaint.vehiclePlateNumber && (
                          <span className="text-xs flex items-center gap-1 text-foreground-muted">
                            <Truck size={12} />
                            {complaint.vehiclePlateNumber}
                          </span>
                        )}
                        {complaint.driverName && (
                          <span className="text-xs flex items-center gap-1 text-foreground-muted">
                            <User size={12} />
                            {complaint.driverName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${RISK_COLORS[complaint.riskLevel]}`}>
                        {complaint.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[complaint.status]}`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-muted">
                      {complaint.assignedToName || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {complaint.attachmentPath && (
                          <button
                            onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/files/${complaint.attachmentPath}`, '_blank')}
                            className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-theme transition-colors"
                            title="View Evidence"
                          >
                            <FileText size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 hover:bg-primary/10 text-foreground-muted hover:text-primary rounded-theme transition-colors"
                          title="Edit Complaint"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(complaint.id)}
                          className="p-1.5 hover:bg-red-50 text-foreground-muted hover:text-red-500 rounded-theme transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
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

      <ComplaintForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={fetchComplaints}
        initialData={selectedComplaint}
      />
    </div>
  );
}
