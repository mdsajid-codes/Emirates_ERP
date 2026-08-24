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
  CheckCircle,
  Eye,
  CircleDollarSign,
  Truck,
  LayoutGrid,
  List,
  Columns
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import CompleteMaintenanceModal from './CompleteMaintenanceModal';

export default function VehicleMaintenance() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
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

  useEffect(() => {
    setPage(1);
    fetchMaintenance(1, size, debouncedSearch, statusFilter);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchMaintenance(page, size, debouncedSearch, statusFilter);
  }, [page, size]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this maintenance record?")) return;
    try {
      await axios.delete(`${API_URL}/fleet/maintenance/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success("Maintenance record deleted successfully");
      fetchMaintenance(page, size);
    } catch (error) {
      console.error("Error deleting maintenance record:", error);
      toast.error("Failed to delete maintenance record");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REQUESTED': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'COMPLETED': return 'bg-[#E3F8EE] text-[#01A958] border-[#A3EBC7]';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const totalCostSum = maintenance.reduce((acc, curr) => acc + (curr.actualCost || curr.estimatedCost || 0), 0);

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center justify-center text-[var(--color-primary,#0178BC)]">
            <Wrench className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#0F172A)] tracking-tight leading-tight">
              {t('fleet.maintenance.title') || 'Vehicle Maintenance'}
            </h1>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-0.5">
              {t('fleet.maintenance.subtitle') || 'Track and manage fleet service schedules and costs'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/fleet-dashboard/maintenance/maintenance-form')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00A9A8] text-white text-xs font-semibold hover:opacity-90 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('fleet.maintenance.newRequest') || 'New Request'}</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Total Maintenance */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.maintenance.totalMaintenance') || 'Total Maintenance'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{totalElements}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">Service Tickets</p>
          </div>
        </div>

        {/* In Service / Progress */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.maintenance.inService') || 'In Service / Progress'}</p>
            <p className="text-xl font-extrabold text-amber-600 leading-none my-0.5">{maintenance.filter(m => m.status === 'IN_PROGRESS').length}</p>
            <p className="text-[10px] text-amber-600 font-semibold truncate">Active Workshop Jobs</p>
          </div>
        </div>

        {/* Scheduled Requests */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.maintenance.scheduledRequests') || 'Scheduled Requests'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{maintenance.filter(m => m.status === 'SCHEDULED' || m.status === 'REQUESTED').length}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">Upcoming Maintenance</p>
          </div>
        </div>

        {/* Total Cost (AED) */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CircleDollarSign className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.maintenance.totalCost') || 'Total Cost (AED)'}</p>
            <p className="text-xl font-extrabold text-emerald-600 leading-none my-0.5 font-mono">{totalCostSum} AED</p>
            <p className="text-[10px] text-emerald-600 font-semibold truncate">Page Total Expense</p>
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
                placeholder={t('fleet.maintenance.searchPlaceholder') || "Search by plate number or garage..."}
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
              <option value="REQUESTED">REQUESTED</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
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
              {isRTL ? 'جاري تحميل سجلات الصيانة...' : 'Loading maintenance records...'}
            </div>
          ) : maintenance.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'لا توجد سجلات صيانة متاحة' : 'No maintenance records found'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead className="bg-slate-50 border-b border-[var(--color-border,#D9DADD)]">
                <tr>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">VEHICLE</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">TYPE / CATEGORY</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">SCHEDULED DATE</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">GARAGE</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">COST (AED)</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">STATUS</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)] text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border,#D9DADD)] text-xs text-[var(--color-foreground,#0F172A)]">
                {maintenance.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td 
                      onClick={() => navigate(`/fleet-dashboard/maintenance/maintenance-details/${row.id}`)}
                      className="p-3.5 cursor-pointer font-bold text-[var(--color-primary,#0178BC)] hover:underline font-mono"
                    >
                      <span className="flex items-center gap-1.5">
                        <Truck size={13} className="text-[var(--color-primary,#0178BC)]" />
                        {row.vehiclePlateNumber || row.vehicle?.plateNumber || 'N/A'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[var(--color-foreground,#0F172A)]">{row.serviceCategory || 'OIL_CHANGE'}</span>
                        <span className="text-[10px] text-[var(--color-foreground-muted,#656873)]">{row.maintenanceType || 'PREVENTIVE'}</span>
                      </div>
                    </td>

                    <td className="p-3.5 font-semibold text-[var(--color-foreground-muted,#656873)]">
                      {row.scheduledDate || row.requestedDate || '–'}
                    </td>

                    <td className="p-3.5 font-bold text-[var(--color-foreground,#0F172A)]">{row.garage || 'Central Workshop'}</td>

                    <td className="p-3.5 font-bold font-mono text-emerald-600">
                      {row.actualCost ? `${row.actualCost} AED` : (row.estimatedCost ? `${row.estimatedCost} AED (Est.)` : '0 AED')}
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(row.status)}`}>
                        {row.status || 'REQUESTED'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/fleet-dashboard/maintenance/maintenance-details/${row.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#0178BC)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 stroke-[1.8]" />
                        </button>

                        {row.status !== 'COMPLETED' && (
                          <button
                            onClick={() => {
                              setSelectedRecord(row);
                              setIsCompleteModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <CheckCircle size={12} /> Complete
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/fleet-dashboard/maintenance/maintenance-form/${row.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#0178BC)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Edit Record"
                        >
                          <Edit2 className="w-4 h-4 stroke-[1.8]" />
                        </button>

                        <button
                          onClick={() => handleDelete(row.id)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[#D6282F] hover:bg-rose-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Delete Record"
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

      {/* Complete Maintenance Modal */}
      <CompleteMaintenanceModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        record={selectedRecord}
        onSuccess={() => { fetchMaintenance(page, size); setIsCompleteModalOpen(false); }}
      />

    </div>
  );
}
