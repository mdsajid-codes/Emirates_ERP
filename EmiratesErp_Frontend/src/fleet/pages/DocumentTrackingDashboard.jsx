import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Search, 
  Filter, 
  Car, 
  User, 
  ArrowRight,
  CheckCircle2,
  FileText,
  Truck,
  LayoutGrid,
  List,
  Columns
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const DocumentTrackingDashboard = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination & Debouncing states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchDocumentTrackingData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fleet/compliance/expiring-documents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { status: statusFilter }
      });
      setDocuments(response.data || []);
    } catch (error) {
      console.error("Error fetching document tracking data:", error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, statusFilter]);

  useEffect(() => {
    fetchDocumentTrackingData();
  }, [fetchDocumentTrackingData]);

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const filteredDocs = documents.filter(doc => 
    doc.entityName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    doc.documentType?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Pagination slicing
  const totalRecords = filteredDocs.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pagedDocs = filteredDocs.slice(startIndex, startIndex + pageSize);

  const stats = {
    total: documents.length,
    expired: documents.filter(d => d.status === 'EXPIRED').length,
    expiringSoon: documents.filter(d => d.status === 'EXPIRING_SOON').length,
    valid: documents.filter(d => d.status === 'VALID').length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EXPIRED': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'EXPIRING_SOON': return 'bg-amber-50 text-amber-600 border-amber-200';
      default: return 'bg-[#E3F8EE] text-[#01A958] border-[#A3EBC7]';
    }
  };

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center justify-center text-[var(--color-primary,#0178BC)]">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#0F172A)] tracking-tight leading-tight">
              {t('fleet.docTrack.title') || 'Document Tracking'}
            </h1>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-0.5">
              {t('fleet.docTrack.subtitle') || 'Unified document tracker for fleet vehicles and drivers'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-foreground-muted,#656873)] bg-[var(--color-card,#ffffff)] px-3 py-1.5 rounded-xl border border-[var(--color-border,#D9DADD)] shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-[var(--color-primary,#0178BC)]" />
          <span>Last scan: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Total Documents */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.docTrack.totalDocs') || 'Total Documents'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{stats.total}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">Tracked Registrations & Cards</p>
          </div>
        </div>

        {/* Expired */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.docTrack.expired') || 'Expired'}</p>
            <p className="text-xl font-extrabold text-rose-600 leading-none my-0.5 font-mono">{stats.expired}</p>
            <p className="text-[10px] text-rose-600 font-semibold truncate">Requires Immediate Renewal</p>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.docTrack.expiringSoon') || 'Expiring Soon'}</p>
            <p className="text-xl font-extrabold text-amber-600 leading-none my-0.5 font-mono">{stats.expiringSoon}</p>
            <p className="text-[10px] text-amber-600 font-semibold truncate">Within 30 Days</p>
          </div>
        </div>

        {/* Valid Documents */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.docTrack.valid') || 'Valid Documents'}</p>
            <p className="text-xl font-extrabold text-emerald-600 leading-none my-0.5 font-mono">{stats.valid}</p>
            <p className="text-[10px] text-emerald-600 font-semibold truncate">Compliant Fleet Assets</p>
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
                placeholder={t('fleet.docTrack.searchPlaceholder') || "Search by plate, name or document type..."}
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
              <option value="EXPIRED">EXPIRED</option>
              <option value="EXPIRING_SOON">EXPIRING SOON</option>
              <option value="VALID">VALID</option>
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
              {isRTL ? 'جاري تحميل وثائق الأسطول...' : 'Loading fleet document logs...'}
            </div>
          ) : pagedDocs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'لا توجد وثائق متاحة' : 'No document records found'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead className="bg-slate-50 border-b border-[var(--color-border,#D9DADD)]">
                <tr>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">DOCUMENT</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">ENTITY NAME</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">EXPIRY DATE</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">DAYS LEFT</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">STATUS</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)] text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border,#D9DADD)] text-xs text-[var(--color-foreground,#0F172A)]">
                {pagedDocs.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${row.entityType === 'VEHICLE' ? 'bg-blue-50 text-[var(--color-primary,#0178BC)]' : 'bg-purple-50 text-purple-600'}`}>
                          {row.entityType === 'VEHICLE' ? <Truck size={14} /> : <User size={14} />}
                        </div>
                        <span className="font-bold uppercase tracking-wider text-[11px] text-[var(--color-foreground,#0F172A)] font-mono">
                          {row.documentType ? row.documentType.replace('_', ' ') : 'DOCUMENT'}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5 font-bold font-mono">{row.entityName}</td>

                    <td className="p-3.5 font-semibold text-[var(--color-foreground-muted,#656873)] font-mono">{row.expiryDate}</td>

                    <td className="p-3.5 font-mono">
                      <span className={`font-extrabold ${row.daysUntilExpiry < 0 ? 'text-rose-600' : row.daysUntilExpiry <= 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {row.daysUntilExpiry}d
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(row.status)}`}>
                        {row.status ? row.status.replace('_', ' ') : 'VALID'}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => navigate(row.entityType === 'VEHICLE' ? `/fleet-dashboard/vehicles/vehicle-form/${row.entityId}` : `/fleet-dashboard/drivers/driver-form/${row.entityId}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#0178BC)] hover:bg-blue-50 transition-colors rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                      >
                        <span>View</span>
                        <ArrowRight size={13} />
                      </button>
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
            Showing page <span className="font-bold text-[var(--color-foreground,#0F172A)]">{page}</span> of <span className="font-bold text-[var(--color-foreground,#0F172A)]">{totalPages || 1}</span> ({totalRecords} records)
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
};

export default DocumentTrackingDashboard;
