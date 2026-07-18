import React, { useState, useEffect } from 'react';
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
  Fuel
} from 'lucide-react';
import { toast } from 'react-toastify';
import { driverPerformanceApi } from '../services/driverPerformanceApi';
import DriverPerformanceForm from './DriverPerformanceForm';

export default function DriverPerformances() {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPerformance, setSelectedPerformance] = useState(null);

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

  const getEfficiencyColor = (score) => {
    if (score >= 4.5) return 'text-green-500';
    if (score >= 3.0) return 'text-blue-500';
    return 'text-orange-500';
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Driver Performance & Incentives
          </h1>
          <p className="text-sm text-foreground-muted">Monthly performance evaluation, metrics calculation, and bonus management</p>
        </div>
        <button
          onClick={() => {
            setSelectedPerformance(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-theme font-medium hover:opacity-90 transition-all shadow-md shadow-primary/20"
        >
          <Plus size={18} />
          Evaluate Performance
        </button>
      </div>

      {/* Stats Overview (Static for now) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Rating', value: '4.2', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Total Incentives', value: 'AED 12,500', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Top Performer', value: 'John Doe', icon: Trophy, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Incidents', value: '08', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-theme border border-border bg-card flex items-center gap-4`}>
            <div className={`p-3 rounded-theme ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-xs text-foreground-muted font-bold uppercase">{stat.label}</p>
              <p className="text-xl font-black">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-theme p-4 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={18} />
          <input
            type="text"
            placeholder="Search driver performance..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-foreground"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-foreground-muted" />
            <input
              type="month"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="bg-background border border-border rounded-theme px-3 py-2 text-sm focus:outline-none text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Driver</th>
                <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Month</th>
                <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider text-center">Trips</th>
                <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider text-center">Incidents</th>
                <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider text-center">Fuel Score</th>
                <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider text-right">Incentive</th>
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
              ) : performances.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <BarChart3 size={48} />
                      <p className="text-lg font-medium">No performance records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                performances.map((perf) => (
                  <tr key={perf.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {perf.driverName?.charAt(0)}
                        </div>
                        <span className="font-bold text-foreground">{perf.driverName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium uppercase">
                      {perf.evaluationPeriod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-bold bg-muted px-2 py-1 rounded-theme">
                        {perf.tripsCompleted}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-bold px-2 py-1 rounded-theme ${perf.incidentsCount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {perf.incidentsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                       <div className="flex flex-col items-center">
                         <span className={`text-sm font-bold ${getEfficiencyColor(perf.fuelEfficiencyScore)}`}>
                           {perf.fuelEfficiencyScore}
                         </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-primary">AED {perf.incentiveAmount?.toLocaleString()}</span>
                        {perf.penaltyAmount > 0 && (
                          <span className="text-[10px] text-red-500 font-bold">-{perf.penaltyAmount} Penalty</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          setSelectedPerformance(perf);
                          setIsFormOpen(true);
                        }}
                        className="p-2 hover:bg-primary/10 text-foreground-muted hover:text-primary rounded-theme transition-all group"
                      >
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
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

      <DriverPerformanceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={fetchPerformances}
        initialData={selectedPerformance}
      />
    </div>
  );
}
