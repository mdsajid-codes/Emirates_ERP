import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
    Activity, Shield, Zap, Target, AlertCircle, 
    RefreshCcw, Clock, BarChart3, TrendingUp, TrendingDown, Minus,
    ChevronRight, ArrowRight, CheckCircle2, Search, ZapOff, Filter, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCrmPermissions } from '../context/CrmPermissionsContext';
import CrmEventForm from '../components/CrmEventForm';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const StatCard = ({ title, value, icon: Icon, color, bg, trend }) => (
    <div className="bg-card border border-border p-5 rounded-theme text-center group hover:shadow-lg transition-all relative overflow-hidden">
        <div className={`inline-flex p-3 rounded-full ${bg} ${color} mb-3 group-hover:scale-110 transition-transform`}>
            <Icon className="h-5 w-5" />
        </div>
        <h4 className="text-xl font-bold text-foreground mb-1">{value}</h4>
        <p className="text-xs text-foreground-muted font-medium uppercase tracking-wider">{title}</p>
        {trend !== null && trend !== undefined && (
            <div className={`mt-2 flex items-center justify-center gap-1 text-[10px] font-bold ${parseFloat(trend) > 0 ? 'text-success' : parseFloat(trend) < 0 ? 'text-error' : 'text-foreground-muted'}`}>
                {parseFloat(trend) > 0 ? <TrendingUp size={10} /> : parseFloat(trend) < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                {parseFloat(trend) > 0 ? '+' : ''}{trend}%
            </div>
        )}
    </div>
);

const CrmOperations = () => {
    const { hasPermission } = useCrmPermissions();
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState([]);
    const [events, setEvents] = useState([]);
    const [leads, setLeads] = useState([]);
    const [error, setError] = useState(null);

    // Modal and Filter State
    const [isEventFormOpen, setIsEventFormOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterType, setFilterType] = useState('ALL');
    const [sortBy, setSortBy] = useState('NAME_ASC');

    const authHeaders = useMemo(() => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }), []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [kpiRes, eventRes, leadRes] = await Promise.all([
                axios.get(`${API_URL}/api/crm/kpis`, authHeaders),
                axios.get(`${API_URL}/api/crm/events`, authHeaders),
                axios.get(`${API_URL}/api/crm/leads?size=100`, authHeaders)
            ]);
            setKpis(kpiRes.data || []);
            setEvents(eventRes.data || []);
            setLeads(leadRes.data.content || []);
        } catch (err) {
            console.error("Data fetch failed", err);
            setError("Operational data sync failure.");
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEventSave = async (formData) => {
        try {
            await axios.post(`${API_URL}/api/crm/events`, formData, authHeaders);
            fetchData();
            setIsEventFormOpen(false);
        } catch (err) {
            console.error("Failed to save event", err);
            alert("Failed to save event protocol.");
        }
    };

    const stats = useMemo(() => {
        const totalLeads = leads.length;
        const activeProtocols = events.filter(e => e.status !== 'CLOSED').length;
        const yieldRate = totalLeads ? ((leads.filter(l => l.status === 'CONVERTED').length / totalLeads) * 100).toFixed(1) : 0;
        
        // Compute trends (Option A)
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 86400000);
        const sixtyDaysAgo = new Date(now - 60 * 86400000);

        // Throughput trend
        const recentLeads = leads.filter(l => new Date(l.createdAt) >= thirtyDaysAgo).length;
        const previousLeads = leads.filter(l => new Date(l.createdAt) >= sixtyDaysAgo && new Date(l.createdAt) < thirtyDaysAgo).length;
        const throughputTrend = previousLeads > 0 ? (((recentLeads - previousLeads) / previousLeads) * 100).toFixed(1) : (recentLeads > 0 ? '100.0' : '0.0');

        // Protocol trend
        const recentEvents = events.filter(e => new Date(e.date) >= thirtyDaysAgo).length;
        const previousEvents = events.filter(e => new Date(e.date) >= sixtyDaysAgo && new Date(e.date) < thirtyDaysAgo).length;
        const protocolsTrend = previousEvents > 0 ? (((recentEvents - previousEvents) / previousEvents) * 100).toFixed(1) : (recentEvents > 0 ? '100.0' : '0.0');

        // Yield trend
        const recentConverted = leads.filter(l => l.status === 'CONVERTED' && new Date(l.createdAt) >= thirtyDaysAgo).length;
        const previousConverted = leads.filter(l => l.status === 'CONVERTED' && new Date(l.createdAt) >= sixtyDaysAgo && new Date(l.createdAt) < thirtyDaysAgo).length;
        
        const recentYield = recentLeads ? (recentConverted / recentLeads) * 100 : 0;
        const previousYield = previousLeads ? (previousConverted / previousLeads) * 100 : 0;
        const yieldTrend = previousYield > 0 ? (((recentYield - previousYield) / previousYield) * 100).toFixed(1) : (recentYield > 0 ? '100.0' : '0.0');

        return { 
            totalLeads, activeProtocols, yieldRate, incidents: 0,
            throughputTrend, protocolsTrend, yieldTrend
        };
    }, [leads, events]);

    const fluxMetrics = useMemo(() => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const recentLeads = leads.filter(l => new Date(l.createdAt) >= monthStart).length;
        const ingestionVelocity = leads.length ? Math.round((recentLeads / leads.length) * 100) : 0;

        const closedEvents = events.filter(e => e.status === 'CLOSED').length;
        const resolutionIndex = events.length ? Math.round((closedEvents / events.length) * 100) : 0;

        const convertedLeads = leads.filter(l => l.status === 'CONVERTED').length;
        const yieldOptimization = leads.length ? Math.round((convertedLeads / leads.length) * 100) : 0;

        return { ingestionVelocity, resolutionIndex, yieldOptimization };
    }, [leads, events]);

    const filteredKpis = useMemo(() => {
        let filtered = [...kpis];
        
        if (filterType !== 'ALL') {
            filtered = filtered.filter(k => k.type === filterType);
        }

        if (sortBy === 'NAME_ASC') {
            filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } else if (sortBy === 'EMPLOYEES_DESC') {
            filtered.sort((a, b) => (b.assignedEmployees?.length || 0) - (a.assignedEmployees?.length || 0));
        }

        return filtered;
    }, [kpis, filterType, sortBy]);

    const getKpiStatus = (kpi) => {
        if (!kpi.assignedEmployees || kpi.assignedEmployees.length === 0 || !kpi.ranges || kpi.ranges.length === 0) {
            return { label: 'Optimal', color: '#10b981', icon: CheckCircle2 }; // default success
        }

        const maxTarget = Math.max(...kpi.assignedEmployees.map(e => e.targetValue || 0));
        if (maxTarget === 0) return { label: 'Optimal', color: '#10b981', icon: CheckCircle2 };

        const avgTarget = kpi.assignedEmployees.reduce((acc, e) => acc + (e.targetValue || 0), 0) / kpi.assignedEmployees.length;
        const percentage = (avgTarget / maxTarget) * 100;

        // Find applicable range
        const range = kpi.ranges.find(r => percentage >= r.fromPercent && percentage <= r.toPercent) 
            || [...kpi.ranges].sort((a,b) => b.toPercent - a.toPercent)[0]; // fallback to highest if exact not found

        const isGood = percentage >= 50;
        return { 
            label: isGood ? 'Optimal' : 'Review', 
            color: range?.color || '#10b981', 
            icon: isGood ? CheckCircle2 : AlertCircle 
        };
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Operational Header (Non-Gradient) */}
            <div className="bg-card border border-border rounded-theme p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.3)]"></div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tighter uppercase">Operational Matrix</h1>
                        <p className="text-[10px] text-foreground-muted mt-1.5 font-bold uppercase tracking-[0.3em] opacity-60">Real-time Service & Conversion Intelligence</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchData}
                        className="p-2.5 bg-background border border-border rounded-theme text-foreground-muted hover:text-primary transition-all shadow-sm"
                        title="Re-sync Registry"
                    >
                        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                    {hasPermission('TODO', 'update') && (
                        <button 
                            onClick={() => setIsFilterOpen(true)}
                            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-theme font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/25 hover:scale-[1.02] transition-all"
                        >
                            <Filter size={14} /> Optimize Flux
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-error/10 border border-error/20 p-4 rounded-theme flex items-center gap-3 text-error animate-bounce">
                    <AlertCircle size={20} />
                    <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
                </div>
            )}

            {/* Metric Registry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard title="Throughput Index" value={stats.totalLeads} icon={Activity} color="text-blue-500" bg="bg-blue-500/10" trend={stats.throughputTrend} />
                <StatCard title="Active Protocols" value={stats.activeProtocols} icon={Zap} color="text-orange-500" bg="bg-orange-500/10" trend={stats.protocolsTrend} />
                <StatCard title="Conversion Yield" value={`${stats.yieldRate}%`} icon={Target} color="text-emerald-500" bg="bg-emerald-500/10" trend={stats.yieldTrend} />
                <StatCard title="Incident Registry" value={stats.incidents} icon={Shield} color="text-red-500" bg="bg-red-500/10" trend="0.0" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Strategic KPI Registry */}
                <div className="lg:col-span-2">
                    <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <BarChart3 size={20} className="text-primary" />
                                Strategic KPI Registry
                            </h3>
                            <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">
                                Expand Intelligence
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-border">
                                        <th className="p-4 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Target Metric</th>
                                        <th className="p-4 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Classification</th>
                                        <th className="p-4 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Sector</th>
                                        <th className="p-4 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredKpis.length > 0 ? filteredKpis.map((kpi, i) => {
                                        const status = getKpiStatus(kpi);
                                        return (
                                            <tr key={i} className="border-b border-border/50 hover:bg-slate-50 transition-colors group">
                                                <td className="p-4">
                                                    <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{kpi.name}</div>
                                                    <div className="text-[10px] text-foreground-muted uppercase tracking-tighter">{kpi.id}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 bg-slate-100 text-[10px] font-bold text-foreground-muted rounded-full uppercase tracking-tighter">
                                                        {kpi.type}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-xs font-medium text-foreground-muted">{kpi.locationName || 'Global'}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5" style={{ color: status.color }}>
                                                        <status.icon size={14} />
                                                        <span className="text-[10px] font-bold uppercase">{status.label}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="4" className="p-12 text-center text-foreground-muted">
                                                <ZapOff className="mx-auto mb-3 opacity-20" size={40} />
                                                <p className="text-sm font-medium">No KPI data detected in matrix.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Protocol Stream */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <Clock size={20} className="text-orange-500" />
                                Protocol Stream
                            </h3>
                            <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                        </div>
                        
                        <div className="p-6 space-y-6 flex-1 overflow-auto max-h-[500px] custom-scrollbar">
                            {events.length > 0 ? events.map((event, i) => (
                                <div key={i} className="relative pl-6 border-l-2 border-border pb-6 last:pb-0">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-foreground truncate max-w-[150px]">{event.title}</span>
                                            <span className="text-[10px] text-foreground-muted font-medium">{event.date}</span>
                                        </div>
                                        <p className="text-[11px] text-foreground-muted line-clamp-2">{event.description}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[9px] font-bold text-primary uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded">
                                                {event.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 grayscale opacity-40">
                                    <Clock size={40} className="mx-auto mb-2" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">No active protocols detected.</p>
                                </div>
                            )}
                        </div>
                        
                        {hasPermission('TODO', 'create') && (
                            <div className="p-4 bg-slate-50/50 border-t border-border">
                                <button 
                                    onClick={() => setIsEventFormOpen(true)}
                                    className="w-full py-2.5 bg-white border border-border rounded-theme text-[10px] font-bold text-foreground-muted uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2"
                                >
                                    <Activity size={14} /> Deploy New Event
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pipeline Flux Analysis Visualizer */}
            <div className="bg-card border border-border rounded-theme p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <TrendingUp size={20} className="text-emerald-500" />
                        Pipeline Flux Analysis
                    </h3>
                    <div className="flex gap-4">
                        {['Intake', 'Processing', 'Terminal'].map((label, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <div className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-tighter">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="space-y-6">
                    <FluxBar label="Lead Ingestion Velocity" value={fluxMetrics.ingestionVelocity} color="bg-blue-500" />
                    <FluxBar label="Protocol Resolution Index" value={fluxMetrics.resolutionIndex} color="bg-orange-500" />
                    <FluxBar label="Yield Optimization" value={fluxMetrics.yieldOptimization} color="bg-emerald-500" />
                </div>
            </div>
            
            {loading && !isEventFormOpen && (
                <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-primary animate-pulse tracking-widest">Syncing Operational Matrix...</p>
                    </div>
                </div>
            )}

            {/* Overlays */}
            {isEventFormOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEventFormOpen(false)} />
                    <div className="relative w-full max-w-xl bg-background h-full shadow-2xl flex flex-col">
                        <CrmEventForm 
                            onSave={handleEventSave} 
                            onCancel={() => setIsEventFormOpen(false)} 
                        />
                    </div>
                </div>
            )}

            {isFilterOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
                    <div className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-theme overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-foreground uppercase tracking-widest text-sm flex items-center gap-2">
                                <Filter size={16} className="text-primary" /> Optimize Flux
                            </h3>
                            <button onClick={() => setIsFilterOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-2">Matrix Filter (Type)</label>
                                <select 
                                    value={filterType} 
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full bg-white border border-border rounded-theme px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    <option value="ALL">All Classifications</option>
                                    <option value="SALES">Sales</option>
                                    <option value="MARKETING">Marketing</option>
                                    <option value="SERVICE">Service</option>
                                    <option value="SUPPORT">Support</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-2">Sorting Protocol</label>
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full bg-white border border-border rounded-theme px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    <option value="NAME_ASC">Target Metric (A-Z)</option>
                                    <option value="EMPLOYEES_DESC">Capacity (Highest Employees First)</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-4 border-t border-border bg-slate-50 flex justify-end">
                            <button 
                                onClick={() => setIsFilterOpen(false)}
                                className="bg-primary text-primary-foreground px-6 py-2 rounded-theme font-bold text-[10px] uppercase tracking-widest shadow-md hover:opacity-90 transition-opacity"
                            >
                                Apply Optimization
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const FluxBar = ({ label, value, color }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">{label}</span>
            <span className="text-xs font-black text-foreground">{value}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${value}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${color} shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.3)]`}
            ></motion.div>
        </div>
    </div>
);

export default CrmOperations;
