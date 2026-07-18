import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Wrench,
  Plus,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Search,
  Edit2,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import VehicleMaintenanceForm from './VehicleMaintenanceForm';
import CompleteMaintenanceModal from './CompleteMaintenanceModal';

export default function VehicleMaintenance() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

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

  const fetchMaintenance = async (p = page, s = size, searchVal = debouncedSearch, status = statusFilter) => {
    try {
      setLoading(true);
      const params = {
        page: p - 1, // backend is 0-indexed
        size: s,
        search: searchVal || undefined,
        status: status || undefined
      };
      const response = await axios.get(`${API_URL}/fleet/maintenance`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setMaintenance(response.data.content || []);
      setTotalElements(response.data.totalElements || 0);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching maintenance:', error);
      toast.error('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/fleet/maintenance/${id}/status?status=${status}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success(`Status updated to ${status}`);
      fetchMaintenance();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  useEffect(() => {
    setPage(1);
    fetchMaintenance(1, size, debouncedSearch, statusFilter);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchMaintenance(page, size, debouncedSearch, statusFilter);
  }, [page, size]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'REQUESTED': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'REQUESTED': return <Clock size={14} />;
      case 'SCHEDULED': return <Calendar size={14} />;
      case 'IN_PROGRESS': return <Wrench size={14} />;
      case 'COMPLETED': return <CheckCircle2 size={14} />;
      case 'CANCELLED': return <AlertCircle size={14} />;
      default: return null;
    }
  };

  return (
    <>
      <div className="p-6 space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vehicle Maintenance</h1>
            <p className="text-sm text-foreground-muted">Track and manage fleet service schedules and costs</p>
          </div>
          <button
            onClick={() => {
              setSelectedRecord(null);
              setIsFormOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-theme font-medium hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            <Plus size={18} />
            New Request
          </button>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-theme p-4 flex flex-wrap items-center gap-4 shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={18} />
            <input
              type="text"
              placeholder="Search by plate number or garage..."
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
              <option value="REQUESTED">Requested</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Type / Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Scheduled Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Garage</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-foreground-muted">Loading records...</p>
                      </div>
                    </td>
                  </tr>
                ) : maintenance.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <Wrench size={48} />
                        <p className="text-lg font-medium">No maintenance records found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  maintenance.map((record) => (
                    <tr key={record.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{record.vehiclePlateNumber}</span>
                          <span className="text-xs text-foreground-muted">{record.vehicleMakeModel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{record.maintenanceType}</span>
                          <span className="text-xs text-foreground-muted">{record.serviceCategory}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.scheduledDate || record.requestedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.garage || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                        {record.actualCost ? `AED ${record.actualCost}` : record.estimatedCost ? `AED ${record.estimatedCost}` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedRecord(record);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 hover:bg-primary/10 text-foreground-muted hover:text-primary rounded-theme transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 size={16} />
                          </button>
                          
                          {record.status === 'REQUESTED' && (
                            <button
                              onClick={() => handleStatusUpdate(record.id, 'SCHEDULED')}
                              className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-theme font-bold hover:bg-blue-600 hover:text-white transition-all border border-blue-100 flex items-center gap-1"
                            >
                              <Calendar size={12} />
                              Schedule
                            </button>
                          )}

                          {record.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handleStatusUpdate(record.id, 'IN_PROGRESS')}
                              className="text-[10px] bg-amber-50 text-amber-600 px-2 py-1 rounded-theme font-bold hover:bg-amber-600 hover:text-white transition-all border border-amber-100 flex items-center gap-1"
                            >
                              <Clock size={12} />
                              Start
                            </button>
                          )}

                          {(record.status === 'IN_PROGRESS' || record.status === 'SCHEDULED') && (
                            <button
                              onClick={() => {
                                setSelectedRecord(record);
                                setIsCompleteModalOpen(true);
                              }}
                              className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-theme font-bold hover:bg-green-600 hover:text-white transition-all border border-green-100 flex items-center gap-1"
                            >
                              <CheckCircle size={12} />
                              Complete
                            </button>
                          )}

                          <button 
                            className="p-1.5 hover:bg-red-50 text-foreground-muted hover:text-red-500 rounded-theme transition-colors"
                            title="Cancel Request"
                            onClick={() => {
                              if(window.confirm('Are you sure you want to cancel this request?')) {
                                handleStatusUpdate(record.id, 'CANCELLED');
                              }
                            }}
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
      </div>
      <VehicleMaintenanceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={fetchMaintenance}
        initialData={selectedRecord}
      />
      <CompleteMaintenanceModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onComplete={fetchMaintenance}
        recordId={selectedRecord?.id}
      />
    </>
  );
}
