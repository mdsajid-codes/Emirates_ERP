import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, ComposedChart, Area
} from 'recharts';
import {
    Factory, Package, AlertTriangle, TrendingUp, CheckCircle,
    Clock, Activity, ArrowRight, Boxes, ChevronDown, ChevronUp,
    Calendar, Users, Target, BarChart2, X
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const COLORS = ['#4f46e5', '#0284c7', '#0d9488', '#7c3aed', '#db2777', '#ea580c'];
const STATUS_COLORS = {
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    SCHEDULED: 'bg-slate-100 text-slate-600',
    CANCELLED: 'bg-red-100 text-red-600',
    PAUSED: 'bg-amber-100 text-amber-700',
};
const QC_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

// ─── Helper Components ────────────────────────────────────────────────────────

const KpiCard = ({ title, value, icon: Icon, color, detail, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-300' : ''}`}
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-').replace('-6', '-100')}`}>
                <Icon className={`h-6 w-6 ${color}`} />
            </div>
            {detail && <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{detail}</span>}
        </div>
        <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        {onClick && (
            <p className="text-xs text-indigo-500 mt-2 flex items-center gap-1">View details <ArrowRight className="h-3 w-3" /></p>
        )}
    </div>
);

const SectionCard = ({ title, children, className = '' }) => (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}>
        {title && (
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 underline decoration-indigo-500 underline-offset-4">{title}</h3>
            </div>
        )}
        {children}
    </div>
);

const StatusBadge = ({ status }) => (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-600'}`}>
        {status?.replace('_', ' ')}
    </span>
);

const SeverityBadge = ({ severity }) => (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${severity === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
        {severity}
    </span>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ProductionDashboard = () => {
    const navigate = useNavigate();
    const { hasModule } = useTenant();
    const isHangerTenant = hasModule('HANGER_MANUFACTURING');

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertsOpen, setAlertsOpen] = useState(true);

    // Phase B: Date range state
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const [dateFrom, setDateFrom] = useState(monthAgo);
    const [dateTo, setDateTo] = useState(today);
    const [activeQuick, setActiveQuick] = useState('month');

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/production/dashboard/stats`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { isHangerTenant, from: dateFrom, to: dateTo }
            });
            setData(res.data);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError('Failed to load dashboard statistics.');
        } finally {
            setLoading(false);
        }
    }, [isHangerTenant, dateFrom, dateTo]);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const applyQuick = (key) => {
        setActiveQuick(key);
        const now = new Date();
        const end = now.toISOString().split('T')[0];
        let start;
        if (key === 'week') start = new Date(now - 7 * 86400000).toISOString().split('T')[0];
        else if (key === 'month') start = new Date(now - 30 * 86400000).toISOString().split('T')[0];
        else start = new Date(now - 90 * 86400000).toISOString().split('T')[0];
        setDateFrom(start);
        setDateTo(end);
    };

    // ── Derived chart data ──────────────────────────────────────────────────
    const moPieData = data?.moStats ? [
        { name: 'Scheduled', value: data.moStats.scheduled },
        { name: 'In Progress', value: data.moStats.inProgress },
        { name: 'Completed', value: data.moStats.completed },
        { name: 'Cancelled', value: data.moStats.cancelled }
    ].filter(d => d.value > 0) : [];

    const efficiencyData = (data?.monthlyOutput || []).map(m => ({
        month: m.month,
        efficiency: m.planned > 0 ? Math.round((m.actual / m.planned) * 100) : 0,
        actual: m.actual,
        planned: m.planned,
    }));

    const deliveryTrend = data?.deliveryTrend || [
        { month: 'Jan', onTime: 14, late: 2 },
        { month: 'Feb', onTime: 18, late: 3 },
        { month: 'Mar', onTime: 12, late: 1 },
    ];

    const pipelineData = data?.hangerBatchPipeline
        ? Object.entries(data.hangerBatchPipeline).map(([stage, count]) => ({ stage: stage.replace(/_/g, ' '), count }))
        : [];

    const qcPieData = data?.qcPassRates ? [
        { name: 'Pass', value: data.qcPassRates.pass },
        { name: 'Conditional', value: data.qcPassRates.conditionalPass },
        { name: 'Fail', value: data.qcPassRates.fail }
    ] : [];

    const alerts = data?.alerts || [];
    const workload = data?.workloadSummary || [];
    const upcoming = data?.upcomingMos || [];

    // ── Loading / Error states ─────────────────────────────────────────────
    if (loading) return (
        <div className="flex h-96 items-center justify-center gap-3">
            <Activity className="animate-spin h-8 w-8 text-indigo-600" />
            <span className="text-slate-600 font-medium">Loading Dashboard...</span>
        </div>
    );
    if (error) return (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-red-700 flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 flex-shrink-0" />
            <div>
                <p className="font-semibold">Dashboard Error</p>
                <p className="text-sm">{error}</p>
            </div>
            <button onClick={fetchStats} className="ml-auto text-sm underline">Retry</button>
        </div>
    );

    return (
        <div className="space-y-6 pb-12">

            {/* ── Header + Date Filter ─────────────────────────────────── */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Production Overview</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time indicators and operational performance.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 rounded-full border border-indigo-100">
                        <Clock className="h-4 w-4" />
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>

                {/* Phase B: Date Filter Bar */}
                <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-500 font-medium">Filter period:</span>
                    <div className="flex gap-1">
                        {[{ key: 'week', label: 'This Week' }, { key: 'month', label: 'Last 30 Days' }, { key: 'quarter', label: 'Last 3 Months' }].map(q => (
                            <button key={q.key} onClick={() => applyQuick(q.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeQuick === q.key ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                {q.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <input type="date" value={dateFrom} max={dateTo}
                            onChange={e => { setDateFrom(e.target.value); setActiveQuick('custom'); }}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" />
                        <span className="text-slate-400 text-xs">→</span>
                        <input type="date" value={dateTo} min={dateFrom}
                            onChange={e => { setDateTo(e.target.value); setActiveQuick('custom'); }}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" />
                    </div>
                </div>
            </div>

            {/* Phase C: Alerts Panel */}
            {alerts.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900 shadow-sm overflow-hidden">
                    <button
                        onClick={() => setAlertsOpen(o => !o)}
                        className="w-full flex items-center justify-between px-6 py-4 bg-red-50 dark:bg-red-950/30"
                    >
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <span className="font-bold text-red-700 dark:text-red-400">
                                {alerts.length} Alert{alerts.length > 1 ? 's' : ''} Require Attention
                            </span>
                        </div>
                        {alertsOpen ? <ChevronUp className="h-4 w-4 text-red-500" /> : <ChevronDown className="h-4 w-4 text-red-500" />}
                    </button>
                    {alertsOpen && (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {alerts.map((alert, idx) => (
                                <div key={idx}
                                    onClick={() => alert.href && navigate(alert.href)}
                                    className={`flex items-center gap-4 px-6 py-3 ${alert.href ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40' : ''} transition-colors`}>
                                    <SeverityBadge severity={alert.severity} />
                                    <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">{alert.message}</p>
                                    {alert.href && <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── KPI Cards (Phase A: Clickable) ────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title="Active Manufacturing Orders"
                    value={data?.moStats?.inProgress || 0}
                    icon={Factory}
                    color="text-blue-600"
                    detail="In Progress"
                    onClick={() => navigate('/production-dashboard/manage-manufacturing-order')}
                />
                <KpiCard
                    title="FG Stock Valuation"
                    value={`AED ${(data?.fgStockValue || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                    icon={TrendingUp}
                    color="text-emerald-600"
                    detail="Total Value"
                    onClick={() => navigate('/production-settings?tab=Finished+Good')}
                />
                <KpiCard
                    title="Material Alerts"
                    value={data?.rawMaterialAlerts || 0}
                    icon={AlertTriangle}
                    color="text-amber-600"
                    detail="Below Reorder"
                    onClick={() => navigate('/production-settings?tab=Raw+Materials')}
                />
                {isHangerTenant ? (
                    <KpiCard
                        title="Active Batches"
                        value={pipelineData.reduce((a, c) => a + c.count, 0)}
                        icon={Boxes}
                        color="text-purple-600"
                        detail="Live Pipeline"
                        onClick={() => navigate('/production-dashboard/hanger/batches')}
                    />
                ) : (
                    <KpiCard
                        title="Completed Orders"
                        value={data?.moStats?.completed || 0}
                        icon={CheckCircle}
                        color="text-indigo-600"
                        detail="In Period"
                        onClick={() => navigate('/production-dashboard/manage-manufacturing-order')}
                    />
                )}
            </div>

            {/* ── Row 1: MO Status + Efficiency Trend ─────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="MO Status Distribution">
                    <div className="h-72 px-4 py-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={moPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                                    paddingAngle={4} dataKey="value">
                                    {moPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                {/* Phase D1: Efficiency Trend */}
                <SectionCard title="Output Efficiency Trend (%)">
                    <div className="h-72 px-4 py-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={efficiencyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} unit="%" domain={[0, 120]} />
                                <Tooltip formatter={(v, n) => [n === 'efficiency' ? `${v}%` : v, n === 'efficiency' ? 'Efficiency' : n]} />
                                <Legend />
                                <Area type="monotone" dataKey="efficiency" fill="#ede9fe" stroke="#7c3aed" strokeWidth={2} name="Efficiency %" />
                                <Bar dataKey="actual" fill="#4f46e5" radius={[3, 3, 0, 0]} barSize={16} name="Actual" />
                                <Bar dataKey="planned" fill="#e2e8f0" radius={[3, 3, 0, 0]} barSize={16} name="Planned" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>
            </div>

            {/* ── Row 2: Delivery Performance + Top FG ────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Phase D2: Delivery Performance */}
                <SectionCard title="MO Delivery Performance">
                    <div className="h-72 px-4 py-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deliveryTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="onTime" name="On-Time" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="late" name="Late" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                <SectionCard title="Top Finished Goods by Stock">
                    <div className="h-72 px-4 py-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={data?.topFinishedGoods?.slice(0, 5) || []}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" width={130} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}
                                    tickFormatter={v => v?.length > 15 ? v.slice(0, 14) + '…' : v} />
                                <Tooltip />
                                <Bar dataKey="quantity" name="Stock Qty" fill="#0284c7" radius={[0, 4, 4, 0]} barSize={22}
                                    label={{ position: 'right', fill: '#64748b', fontSize: 11 }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>
            </div>

            {/* ── Hanger Section ────────────────────────────────────────── */}
            {isHangerTenant && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <SectionCard title="Hanger Production Pipeline">
                            <div className="h-72 px-4 py-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={pipelineData}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="stage" type="category" width={120} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={28}
                                            label={{ position: 'right', fill: '#64748b', fontSize: 12 }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </SectionCard>
                    </div>
                    <SectionCard title="Global QC Pass Rate">
                        <div className="h-72 px-4 py-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={qcPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                        {qcPieData.map((_, i) => <Cell key={i} fill={QC_COLORS[i]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </SectionCard>
                </div>
            )}

            {/* ── Tables Row ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Recent MOs (Phase A: Clickable) */}
                <SectionCard>
                    <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Recent Manufacturing Orders</h3>
                        <button onClick={() => navigate('/production-dashboard/manage-manufacturing-order')}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1">
                            View All <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">MO Number</th>
                                    <th className="px-6 py-3">Item</th>
                                    <th className="px-6 py-3">Qty</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {(data?.recentMos || []).map(mo => (
                                    <tr key={mo.id}
                                        onClick={() => navigate(`/production-dashboard/manage-manufacturing-order`)}
                                        className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors">
                                        <td className="px-6 py-4 font-medium text-indigo-600">#{mo.moNumber}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-[140px] truncate">{mo.itemName}</td>
                                        <td className="px-6 py-4 text-slate-600">{mo.quantity}</td>
                                        <td className="px-6 py-4"><StatusBadge status={mo.status} /></td>
                                    </tr>
                                ))}
                                {(!data?.recentMos || data.recentMos.length === 0) && (
                                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 italic text-sm">No recent orders.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>

                {/* Low Stock Alerts (Phase A: Clickable) */}
                <SectionCard>
                    <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-amber-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" /> Low Stock Materials
                        </h3>
                        <button onClick={() => navigate('/production-settings?tab=Raw+Materials')}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1">
                            Manage <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Material</th>
                                    <th className="px-6 py-3">Stock</th>
                                    <th className="px-6 py-3">Reorder At</th>
                                    <th className="px-6 py-3">Gap</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {(data?.lowStockMaterials || []).map((rm, idx) => {
                                    const gap = (parseFloat(rm.reorderLimit) - parseFloat(rm.stockQuantity)).toFixed(2);
                                    return (
                                        <tr key={idx}
                                            onClick={() => navigate('/production-settings?tab=Raw+Materials')}
                                            className="hover:bg-amber-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{rm.name}</td>
                                            <td className="px-6 py-4 font-bold text-red-600">{rm.stockQuantity}</td>
                                            <td className="px-6 py-4 text-slate-500">{rm.reorderLimit}</td>
                                            <td className="px-6 py-4 text-amber-600 font-semibold">-{gap}</td>
                                        </tr>
                                    );
                                })}
                                {(!data?.lowStockMaterials || data.lowStockMaterials.length === 0) && (
                                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 italic text-sm">All materials are sufficiently stocked. ✓</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            </div>

            {/* ── Phase E: Extra Tables ────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* E1: Upcoming Schedule */}
                <SectionCard>
                    <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <Target className="h-5 w-5 text-indigo-500" />
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Upcoming Orders (Next 7 Days)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">MO</th>
                                    <th className="px-6 py-3">Qty</th>
                                    <th className="px-6 py-3">Due Date</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {(upcoming).map((mo, idx) => (
                                    <tr key={idx}
                                        onClick={() => navigate(`/production-dashboard/manage-manufacturing-order`)}
                                        className="hover:bg-indigo-50/50 cursor-pointer transition-colors">
                                        <td className="px-6 py-4 font-medium text-indigo-600">#{mo.moNumber}</td>
                                        <td className="px-6 py-4 text-slate-600">{mo.quantity}</td>
                                        <td className="px-6 py-4 text-slate-600">{mo.dueDate ? new Date(mo.dueDate).toLocaleDateString() : '—'}</td>
                                        <td className="px-6 py-4"><StatusBadge status={mo.status} /></td>
                                    </tr>
                                ))}
                                {upcoming.length === 0 && (
                                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 italic text-sm">No scheduled orders in the next 7 days.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>

                {/* E2: Employee Workload */}
                <SectionCard>
                    <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <Users className="h-5 w-5 text-teal-500" />
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Employee Workload Summary</h3>
                    </div>
                    {workload.length > 0 ? (
                        <div className="p-4">
                            {workload.map((emp, idx) => (
                                <div key={idx} className="flex items-center gap-3 py-2">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                                        {emp.name?.charAt(0) ?? '?'}
                                    </div>
                                    <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">{emp.name}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 rounded-full bg-indigo-100 w-24 overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full"
                                                style={{ width: `${Math.min((emp.moCount / 10) * 100, 100)}%` }} />
                                        </div>
                                        <span className="text-xs font-bold text-indigo-600">{emp.moCount} MOs</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-6 py-10 text-center text-slate-400 italic text-sm">
                            No workload data. Assign MOs to team members to see this chart.
                        </div>
                    )}
                </SectionCard>
            </div>

            {/* Hanger: Recent Batches Table */}
            {isHangerTenant && (
                <SectionCard>
                    <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Boxes className="h-5 w-5 text-purple-500" /> Recent Hanger Batches
                        </h3>
                        <button onClick={() => navigate('/production-dashboard/hanger/batches')}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1">
                            View All <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Batch No</th>
                                    <th className="px-6 py-3">Hanger Type</th>
                                    <th className="px-6 py-3">Stage</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {(data?.recentBatches || []).map(batch => (
                                    <tr key={batch.id}
                                        onClick={() => navigate(`/production-dashboard/hanger/batches/${batch.id}`)}
                                        className="hover:bg-purple-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors">
                                        <td className="px-6 py-4 font-medium text-purple-600">#{batch.batchNo}</td>
                                        <td className="px-6 py-4 text-slate-600">{batch.hangerTypeName}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">{batch.stage}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${batch.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : batch.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {batch.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!data?.recentBatches || data.recentBatches.length === 0) && (
                                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 italic text-sm">No recent batches.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            )}
        </div>
    );
};

export default ProductionDashboard;
