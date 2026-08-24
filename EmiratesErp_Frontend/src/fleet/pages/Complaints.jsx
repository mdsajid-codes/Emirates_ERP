import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Plus,
  Filter,
  Search,
  Calendar,
  FileText,
  User,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  LayoutGrid,
  List,
  Columns
} from 'lucide-react';
import { toast } from 'react-toastify';
import { complaintApi } from '../services/complaintApi';
import { useLanguage } from '../../context/LanguageContext';

export default function Complaints() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'RESOLVED': return 'bg-[#E3F8EE] text-[#01A958] border-[#A3EBC7]';
      case 'ESCALATED': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'IN_PROGRESS': return 'bg-amber-50 text-amber-600 border-amber-200';
      default: return 'bg-sky-50 text-[var(--color-primary,#0178BC)] border-sky-200';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-purple-100 text-purple-700 animate-pulse font-extrabold';
      case 'HIGH': return 'bg-rose-100 text-rose-700 font-extrabold';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700 font-extrabold';
      default: return 'bg-slate-100 text-slate-700 font-extrabold';
    }
  };

  const openCount = complaints.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
  const criticalCount = complaints.filter(c => c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#0F172A)] tracking-tight leading-tight">
              {t('fleet.complaints.title') || 'Complaint & Incident Management'}
            </h1>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-0.5">
              {t('fleet.complaints.subtitle') || 'Track and resolve fleet-related issues, accidents, and driver behavior'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/fleet-dashboard/complaints/complaint-form')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00A9A8] text-white text-xs font-semibold hover:opacity-90 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('fleet.complaints.reportIncident') || 'Report Incident'}</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Total Complaints */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.complaints.totalComplaints') || 'Total Complaints'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{totalElements}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">Logged Fleet Incidents</p>
          </div>
        </div>

        {/* Open / Pending */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.complaints.openPending') || 'Open / Pending'}</p>
            <p className="text-xl font-extrabold text-amber-600 leading-none my-0.5">{openCount}</p>
            <p className="text-[10px] text-amber-600 font-semibold truncate">Active Resolution Queue</p>
          </div>
        </div>

        {/* Critical / High Risk */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.complaints.criticalHigh') || 'Critical / High Risk'}</p>
            <p className="text-xl font-extrabold text-rose-600 leading-none my-0.5 font-mono">{criticalCount}</p>
            <p className="text-[10px] text-rose-600 font-semibold truncate">Urgent Escalations</p>
          </div>
        </div>

        {/* Resolved Incidents */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.complaints.resolvedIncidents') || 'Resolved Incidents'}</p>
            <p className="text-xl font-extrabold text-emerald-600 leading-none my-0.5 font-mono">{resolvedCount}</p>
            <p className="text-[10px] text-emerald-600 font-semibold truncate">Closed Case Log</p>
          </div>
        </div>

      </div>

      {/* Main Table Section Card */}
      <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] shadow-xs overflow-hidden">
        
        {/* Table Controls Top Bar */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[var(--color-border,#D9DADD)]">
          
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-foreground-muted,#656873)] w-4 h-4" />
              <input
                type="text"
                placeholder={t('fleet.complaints.searchPlaceholder') || "Search complaints by ID, description or reporter..."}
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
              <option value="">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="ESCALATED">ESCALATED</option>
            </select>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 border border-[var(--color-border,#D9DADD)] rounded-xl text-xs font-semibold text-[var(--color-foreground,#0F172A)] bg-[var(--color-card,#ffffff)] outline-none cursor-pointer"
            >
              <option value="">All Risks</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
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
              {isRTL ? 'جاري تحميل الشكاوى...' : 'Loading complaints log...'}
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'لا توجد شكاوى مسجلة' : 'No complaints found'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead className="bg-slate-50 border-b border-[var(--color-border,#D9DADD)]">
                <tr>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">COMPLAINT ID</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">ISSUE & DATE</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">RELATED TO</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">RISK LEVEL</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">STATUS</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">ASSIGNED TO</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)] text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border,#D9DADD)] text-xs text-[var(--color-foreground,#0F172A)]">
                {complaints.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td 
                      onClick={() => navigate(`/fleet-dashboard/complaints/complaint-details/${row.id}`)}
                      className="p-3.5 cursor-pointer font-bold text-[var(--color-primary,#0178BC)] hover:underline font-mono"
                    >
                      CMP-{row.id}
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <p className="font-bold text-[var(--color-foreground,#0F172A)] line-clamp-1">{row.description}</p>
                        <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] font-mono">
                          {row.type} ({row.category || 'General'}) • {row.reportedDate ? new Date(row.reportedDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-0.5 text-[11px]">
                        {row.vehiclePlateNumber && (
                          <p className="font-bold text-[var(--color-foreground,#0F172A)] font-mono flex items-center gap-1">
                            <Truck size={12} className="text-[var(--color-primary,#0178BC)]" /> {row.vehiclePlateNumber}
                          </p>
                        )}
                        {row.driverName && (
                          <p className="text-[var(--color-foreground-muted,#656873)] font-semibold flex items-center gap-1">
                            <User size={12} /> {row.driverName}
                          </p>
                        )}
                        {!row.vehiclePlateNumber && !row.driverName && (
                          <span className="text-slate-400 italic">General Incident</span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${getRiskColor(row.riskLevel)}`}>
                        {row.riskLevel || 'LOW'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(row.status)}`}>
                        {row.status || 'OPEN'}
                      </span>
                    </td>

                    <td className="p-3.5 font-semibold text-[var(--color-foreground-muted,#656873)]">
                      {row.assignedToName || 'Unassigned'}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/fleet-dashboard/complaints/complaint-details/${row.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#0178BC)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 stroke-[1.8]" />
                        </button>

                        <button
                          onClick={() => handleDelete(row.id)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Delete Complaint"
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

    </div>
  );
}
