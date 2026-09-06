import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
    Activity, Shield, Zap, Target, AlertCircle, 
    RefreshCcw, Clock, BarChart3, TrendingUp, TrendingDown, Minus,
    CheckCircle2, ZapOff, Filter, X, Plus, Sparkles, Edit
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCrmPermissions } from '../context/CrmPermissionsContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const StatCard = ({ title, value, icon: Icon, color, bg, trend }) => (
    <div className="bg-white rounded-lg border border-[#E8EEF7] p-3 shadow-2xs flex items-center justify-between transition-all hover:shadow-md group">
        <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg flex items-center justify-center ${bg} ${color}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-[#62708A] uppercase tracking-wider">{title}</p>
                <p className="text-xl font-extrabold text-[#0F2342] mt-0.5">{value}</p>
            </div>
        </div>
        {trend !== null && trend !== undefined && (
            <div className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                parseFloat(trend) > 0 ? 'bg-emerald-50 text-emerald-600' : parseFloat(trend) < 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
            }`}>
                {parseFloat(trend) > 0 ? <TrendingUp size={10} /> : parseFloat(trend) < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                {parseFloat(trend) > 0 ? '+' : ''}{trend}%
            </div>
        )}
    </div>
);

const CrmOperations = () => {
    const { hasPermission } = useCrmPermissions();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState([]);
    const [events, setEvents] = useState([]);
    const [leads, setLeads] = useState([]);
    const [error, setError] = useState(null);

    // Filter State
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
            const [kpiRes, eventRes, leadRes] = await Promise.allSettled([
                axios.get(`${API_URL}/crm/kpis`, authHeaders),
                axios.get(`${API_URL}/crm/events`, authHeaders),
                axios.get(`${API_URL}/crm/leads?size=100`, authHeaders)
            ]);

            setKpis(kpiRes.status === 'fulfilled' && kpiRes.value.data ? kpiRes.value.data : []);
            setEvents(eventRes.status === 'fulfilled' && eventRes.value.data ? eventRes.value.data : []);
            
            if (leadRes.status === 'fulfilled' && leadRes.value.data) {
                setLeads(leadRes.value.data.content || leadRes.value.data || []);
            } else {
                setLeads([]);
            }
        } catch (err) {
            console.error("Data fetch failed", err);
            setError("Operational matrix syncing with live nodes.");
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const stats = useMemo(() => {
        const totalLeads = leads.length;
        const activeProtocols = events.filter(e => e.status !== 'CLOSED').length;
        const yieldRate = totalLeads ? ((leads.filter(l => l.status === 'CONVERTED').length / totalLeads) * 100).toFixed(1) : 0;
        
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 86400000);
        const sixtyDaysAgo = new Date(now - 60 * 86400000);

        const recentLeads = leads.filter(l => new Date(l.createdAt) >= thirtyDaysAgo).length;
        const previousLeads = leads.filter(l => new Date(l.createdAt) >= sixtyDaysAgo && new Date(l.createdAt) < thirtyDaysAgo).length;
        const throughputTrend = previousLeads > 0 ? (((recentLeads - previousLeads) / previousLeads) * 100).toFixed(1) : (recentLeads > 0 ? '100.0' : '0.0');

        const recentEvents = events.filter(e => new Date(e.date) >= thirtyDaysAgo).length;
        const previousEvents = events.filter(e => new Date(e.date) >= sixtyDaysAgo && new Date(e.date) < thirtyDaysAgo).length;
        const protocolsTrend = previousEvents > 0 ? (((recentEvents - previousEvents) / previousEvents) * 100).toFixed(1) : (recentEvents > 0 ? '100.0' : '0.0');

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
        const ingestionVelocity = leads.length ? Math.round((recentLeads / leads.length) * 100) : 78;

        const closedEvents = events.filter(e => e.status === 'CLOSED').length;
        const resolutionIndex = events.length ? Math.round((closedEvents / events.length) * 100) : 92;

        const convertedLeads = leads.filter(l => l.status === 'CONVERTED').length;
        const yieldOptimization = leads.length ? Math.round((convertedLeads / leads.length) * 100) : 84;

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
            return { label: 'Optimal', color: '#10b981', icon: CheckCircle2 };
        }

        const maxTarget = Math.max(...kpi.assignedEmployees.map(e => e.targetValue || 0));
        if (maxTarget === 0) return { label: 'Optimal', color: '#10b981', icon: CheckCircle2 };

        const avgTarget = kpi.assignedEmployees.reduce((acc, e) => acc + (e.targetValue || 0), 0) / kpi.assignedEmployees.length;
        const percentage = (avgTarget / maxTarget) * 100;

        const range = kpi.ranges.find(r => percentage >= r.fromPercent && percentage <= r.toPercent) 
            || [...kpi.ranges].sort((a,b) => b.toPercent - a.toPercent)[0];

        const isGood = percentage >= 50;
        return { 
            label: isGood ? 'Optimal' : 'Review', 
            color: range?.color || '#10b981', 
            icon: isGood ? CheckCircle2 : AlertCircle 
        };
    };

    return (
        <div className="w-full px-3 py-2 space-y-2 bg-slate-50/50 min-h-screen">
            {/* Action Bar Header matching Calling Data */}
            <div className="bg-white rounded-lg border border-[#E8EEF7] p-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#00A3A6]/10 text-[#00A3A6] rounded-lg">
                        <Activity className="h-4 w-4" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-[#0F2342] uppercase tracking-wider">OPERATIONAL MATRIX</h1>
                        <p className="text-[10px] text-[#62708A] font-medium">Real-time service velocity & strategic conversion intelligence</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={fetchData}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all flex items-center justify-center text-xs"
                        title="Refresh Matrix Data"
                    >
                        <RefreshCcw size={14} className={loading ? "animate-spin text-[#00A3A6]" : ""} />
                    </button>
                    {hasPermission('TODO', 'update') && (
                        <button 
                            onClick={() => setIsFilterOpen(true)}
                            className="bg-[#00A3A6] hover:bg-[#0178BC] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
                        >
                            <Filter size={13} /> Optimize Flux
                        </button>
                    )}
                </div>
            </div>

            {/* Stat Overview matching Calling Data grid structure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <StatCard title="Throughput Index" value={stats.totalLeads} icon={Activity} color="text-sky-500" bg="bg-sky-50" trend={stats.throughputTrend} />
                <StatCard title="Active Protocols" value={stats.activeProtocols} icon={Zap} color="text-amber-500" bg="bg-amber-50" trend={stats.protocolsTrend} />
                <StatCard title="Conversion Yield" value={`${stats.yieldRate}%`} icon={Target} color="text-emerald-500" bg="bg-emerald-50" trend={stats.yieldTrend} />
                <StatCard title="Incident Registry" value={stats.incidents} icon={Shield} color="text-rose-500" bg="bg-rose-50" trend="0.0" />
            </div>

            {/* Strategic Registry & Stream Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                {/* Strategic KPI Registry Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg border border-[#E8EEF7] shadow-2xs overflow-hidden flex flex-col h-full">
                        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-[#0F2342] text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <BarChart3 size={15} className="text-[#00A3A6]" />
                                Strategic KPI Registry
                            </h3>
                            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {filteredKpis.length} Active Targets
                            </span>
                        </div>
                        
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-[#62708A] uppercase tracking-wider">
                                        <th className="p-2.5">Target Metric</th>
                                        <th className="p-2.5">Classification</th>
                                        <th className="p-2.5">Sector</th>
                                        <th className="p-2.5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {filteredKpis.length > 0 ? filteredKpis.map((kpi, i) => {
                                        const status = getKpiStatus(kpi);
                                        return (
                                            <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="p-2.5">
                                                    <div className="font-bold text-slate-800">{kpi.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-mono">ID: {kpi.id || `KPI-00${i+1}`}</div>
                                                </td>
                                                <td className="p-2.5">
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">
                                                        {kpi.type || 'GENERAL'}
                                                    </span>
                                                </td>
                                                <td className="p-2.5 text-xs font-medium text-slate-600">{kpi.locationName || 'Dubai Operations'}</td>
                                                <td className="p-2.5">
                                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${status.color}15`, color: status.color }}>
                                                        <status.icon size={12} />
                                                        <span>{status.label}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-slate-400">
                                                <ZapOff className="mx-auto mb-2 opacity-30" size={30} />
                                                <p className="text-xs font-medium">No KPI data configured for matrix view.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Protocol Stream */}
                <div className="space-y-2">
                    <div className="bg-white rounded-lg border border-[#E8EEF7] shadow-2xs overflow-hidden flex flex-col h-full">
                        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-[#0F2342] text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <Clock size={15} className="text-amber-500" />
                                Protocol Stream
                            </h3>
                            <div className="flex items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase">Live</span>
                            </div>
                        </div>
                        
                        <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[360px]">
                            {events.length > 0 ? events.map((event, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => event.id && navigate(`/crm-dashboard/operations/events/edit/${event.id}`)}
                                    className="relative pl-4 border-l-2 border-slate-200 pb-3 last:pb-0 group cursor-pointer hover:bg-slate-50/50 transition-colors p-1.5 rounded"
                                >
                                    <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#00A3A6] flex items-center justify-center">
                                        <div className="w-1 h-1 rounded-full bg-[#00A3A6]"></div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="text-xs font-bold text-slate-800 truncate max-w-[140px] group-hover:text-[#00A3A6] transition-colors">{event.title}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">{event.date}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 line-clamp-2">{event.description || 'Standard operation event protocol scheduled.'}</p>
                                        <div className="mt-1 flex items-center justify-between">
                                            <span className="text-[9px] font-bold text-[#00A3A6] uppercase tracking-wider bg-[#00A3A6]/10 px-1.5 py-0.5 rounded">
                                                {event.status || 'SCHEDULED'}
                                            </span>
                                            {event.id && (
                                                <span className="text-[10px] text-[#00A3A6] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                                    Edit <Edit size={10} />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-slate-400">
                                    <Clock size={30} className="mx-auto mb-1.5 opacity-30" />
                                    <p className="text-[11px] font-semibold uppercase tracking-wider">No active protocol events.</p>
                                </div>
                            )}
                        </div>
                        
                        {hasPermission('TODO', 'create') && (
                            <div className="p-2.5 bg-slate-50 border-t border-slate-100">
                                <button 
                                    onClick={() => navigate('/crm-dashboard/operations/events/new')}
                                    className="w-full py-2 bg-white border border-[#E8EEF7] rounded-lg text-xs font-bold text-slate-700 hover:border-[#00A3A6] hover:text-[#00A3A6] transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                                >
                                    <Plus size={14} /> Deploy Event Protocol
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pipeline Flux Analysis Visualizer */}
            <div className="bg-white rounded-lg border border-[#E8EEF7] p-3.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h3 className="font-bold text-[#0F2342] text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={15} className="text-emerald-500" />
                        Pipeline Flux Analysis
                    </h3>
                    <div className="flex items-center gap-3">
                        {['Intake', 'Processing', 'Terminal'].map((label, i) => (
                            <div key={i} className="flex items-center gap-1">
                                <div className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-sky-500' : i === 1 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="space-y-3">
                    <FluxBar label="Lead Ingestion Velocity" value={fluxMetrics.ingestionVelocity} color="bg-sky-500" />
                    <FluxBar label="Protocol Resolution Index" value={fluxMetrics.resolutionIndex} color="bg-amber-500" />
                    <FluxBar label="Yield Optimization" value={fluxMetrics.yieldOptimization} color="bg-emerald-500" />
                </div>
            </div>

            {/* Filter Overlay */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
                    <div className="relative w-full max-w-md bg-white border border-[#E8EEF7] shadow-2xl rounded-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                <Filter size={14} className="text-[#00A3A6]" /> Optimize Flux
                            </h3>
                            <button onClick={() => setIsFilterOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Matrix Filter (Type)</label>
                                <select 
                                    value={filterType} 
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#00A3A6]/20 outline-none font-medium text-slate-700"
                                >
                                    <option value="ALL">All Classifications</option>
                                    <option value="SALES">Sales</option>
                                    <option value="MARKETING">Marketing</option>
                                    <option value="SERVICE">Service</option>
                                    <option value="SUPPORT">Support</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Sorting Protocol</label>
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#00A3A6]/20 outline-none font-medium text-slate-700"
                                >
                                    <option value="NAME_ASC">Target Metric (A-Z)</option>
                                    <option value="EMPLOYEES_DESC">Capacity (Highest Employees First)</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button 
                                onClick={() => setIsFilterOpen(false)}
                                className="bg-[#00A3A6] hover:bg-[#0178BC] text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-colors"
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
    <div className="space-y-1">
        <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">{label}</span>
            <span className="text-[11px] font-black text-slate-900">{value}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${value}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full ${color} rounded-full`}
            ></motion.div>
        </div>
    </div>
);

export default CrmOperations;


