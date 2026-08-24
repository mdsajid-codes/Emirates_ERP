import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Plus,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  AlertCircle,
  BarChart3,
  ChevronRight,
  User,
  Zap,
  Target,
  Fuel,
  Eye,
  Edit2,
  LayoutGrid,
  List,
  Columns
} from 'lucide-react';
import { toast } from 'react-toastify';
import { driverPerformanceApi } from '../services/driverPerformanceApi';
import { useLanguage } from '../../context/LanguageContext';

export default function DriverPerformances() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');

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

  const fetchPerformances = async (p = page, s = size, searchVal = debouncedSearch, periodVal = periodFilter, driverVal = driverFilter) => {
    try {
      setLoading(true);
      const params = {
        page: p - 1, // backend is 0-indexed
        size: s,
        search: searchVal || undefined,
        period: periodVal || undefined,
        driverId: driverVal || undefined
      };
      
      const data = await driverPerformanceApi.getAllPerformances(params);
      setPerformances(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching performances:', error);
      toast.error('Failed to load performance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchPerformances(1, size, debouncedSearch, periodFilter, driverFilter);
  }, [debouncedSearch, periodFilter, driverFilter]);

  useEffect(() => {
    fetchPerformances(page, size, debouncedSearch, periodFilter, driverFilter);
  }, [page, size]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(val || 0);

  const totalIncentivesSum = performances.reduce((acc, curr) => acc + (curr.incentiveAmount || 0), 0);
  const totalIncidentsCount = performances.reduce((acc, curr) => acc + (curr.incidentsCount || 0), 0);
  const topPerformerName = performances.length > 0 ? (performances[0].driverName || 'Verified Driver') : 'John Doe';

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center justify-center text-amber-500">
            <Trophy className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#0F172A)] tracking-tight leading-tight">
              {t('fleet.performance.title') || 'Driver Performance & Incentives'}
            </h1>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-0.5">
              {t('fleet.performance.subtitle') || 'Monthly performance evaluation, metrics calculation, and bonus management'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/fleet-dashboard/performance/performance-form')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00A9A8] text-white text-xs font-semibold hover:opacity-90 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('fleet.performance.evaluatePerformance') || 'Evaluate Performance'}</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Avg Rating */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.performance.avgRating') || 'Avg Rating'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5 font-mono">4.2 / 5.0</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">Fleet Average Score</p>
          </div>
        </div>

        {/* Total Incentives */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.performance.totalIncentives') || 'Total Incentives (AED)'}</p>
            <p className="text-xl font-extrabold text-emerald-600 leading-none my-0.5 font-mono truncate">{formatCurrency(totalIncentivesSum)}</p>
            <p className="text-[10px] text-emerald-600 font-semibold truncate">Monthly Bonus Sum</p>
          </div>
        </div>

        {/* Top Performer */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.performance.topPerformer') || 'Top Performer'}</p>
            <p className="text-sm font-extrabold text-[var(--color-foreground,#0F172A)] leading-tight my-0.5 truncate">{topPerformerName}</p>
            <p className="text-[10px] text-purple-600 font-semibold truncate">Highest Efficiency Score</p>
          </div>
        </div>

        {/* Incidents Logged */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.performance.incidentsLogged') || 'Incidents Logged'}</p>
            <p className="text-xl font-extrabold text-rose-600 leading-none my-0.5 font-mono">{totalIncidentsCount}</p>
            <p className="text-[10px] text-rose-600 font-semibold truncate">Driver Violations</p>
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
                placeholder={t('fleet.performance.searchPlaceholder') || "Search driver performance..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] rounded-xl text-xs text-[var(--color-foreground,#0F172A)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
              />
            </div>

            {/* Period Filter */}
            <input
              type="month"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-3 py-2 border border-[var(--color-border,#D9DADD)] rounded-xl text-xs font-semibold text-[var(--color-foreground,#0F172A)] bg-[var(--color-card,#ffffff)] outline-none cursor-pointer"
            />
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
              {isRTL ? 'جاري تحميل سجلات أداء السائقين...' : 'Loading driver performance records...'}
            </div>
          ) : performances.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'لا توجد سجلات أداء متاحة' : 'No performance records found'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead className="bg-slate-50 border-b border-[var(--color-border,#D9DADD)]">
                <tr>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">DRIVER</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">MONTH</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">TRIPS</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">INCIDENTS</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">FUEL SCORE</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">INCENTIVE</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)] text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border,#D9DADD)] text-xs text-[var(--color-foreground,#0F172A)]">
                {performances.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td 
                      onClick={() => navigate(`/fleet-dashboard/performance/performance-details/${row.id}`)}
                      className="p-3.5 cursor-pointer font-bold text-[var(--color-primary,#0178BC)] hover:underline"
                    >
                      {row.driverName || `Driver #${row.driverId}`}
                    </td>

                    <td className="p-3.5 font-semibold text-[var(--color-foreground-muted,#656873)] font-mono">{row.evaluationPeriod}</td>

                    <td className="p-3.5 font-bold font-mono">{row.tripsCompleted || 0} Trips</td>

                    <td className="p-3.5 font-bold font-mono">
                      <span className={row.incidentsCount > 0 ? "text-rose-600 font-extrabold" : "text-slate-600"}>
                        {row.incidentsCount || 0}
                      </span>
                    </td>

                    <td className="p-3.5 font-bold font-mono text-[var(--color-primary,#0178BC)]">
                      {row.fuelEfficiencyScore || 0} / 5.0
                    </td>

                    <td className="p-3.5 font-bold font-mono text-emerald-600">
                      {formatCurrency(row.incentiveAmount)}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/fleet-dashboard/performance/performance-details/${row.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#0178BC)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 stroke-[1.8]" />
                        </button>

                        <button
                          onClick={() => navigate(`/fleet-dashboard/performance/performance-form/${row.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#0178BC)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Edit Assessment"
                        >
                          <Edit2 className="w-4 h-4 stroke-[1.8]" />
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
