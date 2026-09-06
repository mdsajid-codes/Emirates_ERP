import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    DollarSign, Building2, Users, Briefcase, ClipboardList,
    RefreshCw, ArrowUpRight, ChevronDown, XCircle, TrendingUp, Rocket
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const API_URL = import.meta.env.VITE_API_BASE_URL;

/* ── helpers ──────────────────────────────────── */
const formatRevenue = (v) => {
    if (!v || v === 0) return 'AED 0';
    if (v >= 1_000_000) return `AED ${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `AED ${(v / 1_000).toFixed(1)}k`;
    return `AED ${Number(v).toFixed(2)}`;
};

const formatTimeAgo = (ts) => {
    if (!ts) return '';
    const d = new Date(ts), now = new Date();
    const s = Math.floor((now - d) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24); if (days < 30) return `${days}d ago`;
    return d.toLocaleDateString();
};

/* ── Filter button ────────────────────────────── */
const FilterBtn = ({ label }) => (
    <button className="flex items-center gap-1 px-2.5 py-1 border border-[#E4EBF3] rounded-lg text-[11px] text-[#0F2342] bg-white hover:bg-slate-50 transition-colors">
        {label} <ChevronDown className="w-3 h-3" />
    </button>
);

/* ── KPI Card — HRMS compact style ───────────── */
const KpiCard = ({ title, value, iconBg, icon, trend, trendColor }) => (
    <div className="bg-white border border-[#E4EBF3] rounded-[12px] p-2.5 shadow-[0px_1px_3px_rgba(0,0,0,0.06)] flex items-center gap-2.5">
        <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
            {icon}
        </div>
        <div className="flex flex-col min-w-0">
            <span className="text-[10.5px] font-semibold text-[#0F2342] truncate leading-tight">{title}</span>
            <span className="text-[18px] font-bold text-[#0F2342] leading-tight">{value}</span>
            <span className="text-[9.5px] leading-[14px] truncate" style={{ color: trendColor || '#5E7090' }}>{trend}</span>
        </div>
    </div>
);

/* ── Activity row ─────────────────────────────── */
const ActivityRow = ({ action, target, timestamp }) => (
    <div className="flex items-start gap-2 py-2 border-b border-[#F0F4FA] last:border-0">
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#DCF7F5] flex items-center justify-center mt-0.5">
            <div className="w-2 h-2 rounded-full bg-[#00828B]" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[#0F2342] leading-snug">{action}</p>
            <p className="text-[10px] text-[#5E7090] truncate">{target}</p>
        </div>
        <span className="text-[10px] text-[#5E7090] whitespace-nowrap flex-shrink-0">{formatTimeAgo(timestamp)}</span>
    </div>
);

/* ── Pipeline sidebar stat ────────────────────── */
const PipelineStat = ({ label, value, trend, trendColor }) => (
    <div className="flex flex-col gap-0.5">
        <span className="text-[10.5px] text-[#5E7090] leading-tight">{label}</span>
        <span className="text-[15px] font-bold text-[#0F2342] leading-tight">{value}</span>
        <span className="text-[9.5px] font-semibold leading-tight" style={{ color: trendColor || '#5E7090' }}>{trend}</span>
    </div>
);

/* ── Velocity stat ────────────────────────────── */
const VelocityStat = ({ label, value, trend, trendColor }) => (
    <div className="flex flex-col gap-0.5 flex-1">
        <span className="text-[10.5px] text-[#5E7090] leading-tight">{label}</span>
        <span className="text-[15px] font-bold text-[#0F2342] leading-tight">{value}</span>
        <span className="text-[9.5px] leading-tight" style={{ color: trendColor || '#5E7090' }}>{trend}</span>
    </div>
);

/* ── Donut legend row ─────────────────────────── */
const LegendRow = ({ color, label, count, pct }) => (
    <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="text-[10px] text-[#5E7090]">{label}&nbsp;&nbsp;{count} ({pct}%)</span>
    </div>
);

/* ── Main dashboard ───────────────────────────── */
const CrmDashboard = () => {
    const [data, setData] = useState({
        stats: { totalCompanies: 0, totalContacts: 0, openDeals: 0, totalRevenue: 0, pendingTasks: 0 },
        recentActivities: [],
        pipeline: { totalValue: 0, wonRevenue: 0, conversionRate: 0 },
        velocity: { avgDealSize: 0, salesCycleDays: 0, dealsClosed: 0 },
        leadSources: [],
        chartData: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const authHeaders = useMemo(() => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }), []);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/crm/dashboard/summary`, { headers: authHeaders });
                setData(prev => ({ ...prev, ...res.data }));
                setError(null);
            } catch {
                setError('Failed to synchronize with CRM cloud.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [authHeaders]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="animate-spin rounded-full h-9 w-9 border-4 border-[#00828B] border-t-transparent" />
                <p className="text-[10px] font-bold text-[#00828B] animate-pulse tracking-widest uppercase">Initializing CRM Engine…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-red-500">
                <XCircle className="h-10 w-10" />
                <p className="font-bold text-sm">{error}</p>
                <button onClick={() => window.location.reload()} className="px-3 py-1.5 bg-[#00828B] text-white rounded-lg text-xs font-bold">Retry</button>
            </div>
        );
    }

    const { stats, recentActivities, pipeline = {}, velocity = {}, leadSources = [], chartData = [] } = data;

    /* chart fallback */
    const lineData = chartData.length ? chartData : [
        { month: 'May 1',  won: 0,   pipeline: 0 },
        { month: 'May 8',  won: 0,   pipeline: 0 },
        { month: 'May 15', won: 500, pipeline: 800 },
        { month: 'May 22', won: 2000, pipeline: 3500 },
        { month: 'May 29', won: Number(stats.totalRevenue) || 9500, pipeline: Number(pipeline.totalValue) || 0 },
    ];

    const donutData = leadSources.length ? leadSources : [
        { name: 'Website',  value: 0, color: '#00A5AD' },
        { name: 'Referral', value: 0, color: '#3067FA' },
        { name: 'Campaign', value: 0, color: '#FE9500' },
        { name: 'Partner',  value: 0, color: '#FF4A4A' },
        { name: 'Other',    value: 0, color: '#E4EBF3' },
    ];
    const totalLeads = donutData.reduce((s, d) => s + d.value, 0);
    const donutDisplay = totalLeads === 0 ? [{ name: 'Empty', value: 1, color: '#E4EBF3' }] : donutData;

    const kpiCards = [
        { title: 'Revenue (Won)',  value: formatRevenue(stats.totalRevenue), iconBg: '#DCF7F5', icon: <span className="font-bold text-[11px] text-[#00828B]">AED</span>, trend: `▲ ${pipeline.revenueGrowth ?? 12.5}% vs last 30 days`, trendColor: '#00828B' },
        { title: 'Companies',     value: stats.totalCompanies,              iconBg: 'rgba(48,103,250,0.15)', icon: <Building2   className="w-4.5 h-4.5" style={{ color: '#3067FA' }} />, trend: '— 0% vs last 30 days', trendColor: '#5E7090' },
        { title: 'Contacts',      value: stats.totalContacts,               iconBg: '#DCF7F5', icon: <Users       className="w-4.5 h-4.5" style={{ color: '#00828B' }} />, trend: '▲ 100% vs last 30 days', trendColor: '#00828B' },
        { title: 'Open Deals',    value: stats.openDeals,                   iconBg: 'rgba(254,149,0,0.15)', icon: <Briefcase   className="w-4.5 h-4.5" style={{ color: '#FE9500' }} />, trend: '— 0% vs last 30 days', trendColor: '#5E7090' },
        { title: 'Pending Tasks', value: stats.pendingTasks,                iconBg: 'rgba(255,74,74,0.16)', icon: <ClipboardList className="w-4.5 h-4.5" style={{ color: '#FF4A4A' }} />, trend: '— 0% vs last 30 days', trendColor: '#5E7090' },
    ];

    return (
        <div className="min-h-full bg-[#F7FAFF] flex flex-col gap-3 p-0 font-sans text-[#0F2342]">

            {/* ── Page header ─────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[21px] font-bold text-[#0F2342] leading-tight">CRM Overview</h1>
                    <p className="text-[11px] text-[#5E7090] mt-0.5">Real-time insights into your pipeline and business performance.</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E4EBF3] rounded-full text-[10px] flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#DCF7F5]" />
                    <span className="font-bold text-[#00828B]">LIVE SYNC</span>
                    <span className="text-[#5E7090]">Last synced just now</span>
                    <RefreshCw className="w-2.5 h-2.5 text-[#5E7090]" />
                </div>
            </div>

            {/* ── KPI cards ───────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {kpiCards.map((c) => <KpiCard key={c.title} {...c} />)}
            </div>

            {/* ── Main 2-col layout ───────────────── */}
            <div className="flex gap-3 flex-1 min-h-0">

                {/* Left column */}
                <div className="flex flex-col gap-3 flex-1 min-w-0">

                    {/* Pipeline Performance */}
                    <div className="bg-white border border-[#E4EBF3] rounded-[12px] p-3 shadow-[0px_1px_3px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[14px] font-semibold text-[#0F2342]">Pipeline Performance</h2>
                            <div className="flex gap-2">
                                <FilterBtn label="This Month" />
                                <FilterBtn label="Revenue" />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {/* Stats sidebar */}
                            <div className="flex flex-col gap-3 bg-[#F7F9FC] rounded-xl p-3 flex-shrink-0 w-[160px]">
                                <PipelineStat label="Total Pipeline Value" value={formatRevenue(pipeline.totalValue ?? 0)} trend="— 0% vs last month" trendColor="#5E7090" />
                                <PipelineStat label="Won Revenue" value={formatRevenue(stats.totalRevenue)} trend={`▲ ${pipeline.revenueGrowth ?? 12.5}% vs last month`} trendColor="#00853A" />
                                <PipelineStat label="Conversion Rate" value={`${pipeline.conversionRate ?? 0}%`} trend="— 0% vs last month" trendColor="#5E7090" />
                            </div>

                            {/* Chart */}
                            <div className="flex-1 min-w-0">
                                <ResponsiveContainer width="100%" height={180}>
                                    <LineChart data={lineData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E4EBF3" vertical={false} />
                                        <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#5E7090' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 9, fill: '#5E7090' }} axisLine={false} tickLine={false} width={36} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 8, border: '1px solid #E4EBF3', fontSize: 10, padding: '4px 8px' }}
                                            formatter={(v, n) => [formatRevenue(v), n === 'won' ? 'Won Revenue' : 'Pipeline Value']}
                                        />
                                        <Line type="monotone" dataKey="won" stroke="#00A5AD" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="pipeline" stroke="#00A5AD" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                                <div className="flex items-center justify-center gap-6 mt-1">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-4 h-[2px] rounded-full bg-[#00A5AD]" />
                                        <span className="text-[9px] text-[#5E7090]">Won Revenue (AED)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-4 border-t-[2px] border-dashed border-[#00A5AD]" />
                                        <span className="text-[9px] text-[#5E7090]">Pipeline Value (AED)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom row: Lead Source + Sales Velocity */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Lead Source Distribution */}
                        <div className="bg-white border border-[#E4EBF3] rounded-[12px] p-3 shadow-[0px_1px_3px_rgba(0,0,0,0.06)]">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[13px] font-semibold text-[#0F2342]">Lead Source Distribution</h3>
                                <FilterBtn label="This Month" />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                    <ResponsiveContainer width={110} height={110}>
                                        <PieChart>
                                            <Pie data={donutDisplay} innerRadius={38} outerRadius={52} dataKey="value" strokeWidth={0}>
                                                {donutDisplay.map((e, i) => <Cell key={i} fill={e.color} />)}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-[16px] font-bold text-[#0F2342]">{totalLeads}</span>
                                        <span className="text-[8px] text-[#5E7090]">Total Leads</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    {donutData.map((s) => (
                                        <LegendRow key={s.name} color={s.color} label={s.name} count={s.value}
                                            pct={totalLeads ? Math.round((s.value / totalLeads) * 100) : 0} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sales Velocity */}
                        <div className="bg-white border border-[#E4EBF3] rounded-[12px] p-3 shadow-[0px_1px_3px_rgba(0,0,0,0.06)]">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[13px] font-semibold text-[#0F2342]">Sales Velocity</h3>
                                <FilterBtn label="This Month" />
                            </div>
                            <div className="flex gap-3 mb-3">
                                <VelocityStat label="Avg. Deal Size" value={formatRevenue(velocity.avgDealSize ?? 0)} trend="— 0% vs last month" trendColor="#5E7090" />
                                <VelocityStat label="Sales Cycle" value={`${velocity.salesCycleDays ?? 0} days`} trend="— 0% vs last month" trendColor="#5E7090" />
                                <VelocityStat label="Deals Closed" value={velocity.dealsClosed ?? 1} trend="▲ 100% vs last month" trendColor="#00828B" />
                            </div>
                            <div className="flex items-start gap-1.5 bg-[#F7F9FC] rounded-lg p-2">
                                <span className="text-sm">🌟</span>
                                <p className="text-[10px] text-[#5E7090] leading-relaxed">
                                    {velocity.message || 'Nice! You closed more deals this month. Keep up the momentum.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-3 w-[260px] flex-shrink-0">

                    {/* Recent Activity */}
                    <div className="bg-white border border-[#E4EBF3] rounded-[12px] p-3 shadow-[0px_1px_3px_rgba(0,0,0,0.06)] flex flex-col gap-2 flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[13px] font-semibold text-[#0F2342]">Recent Activity</h3>
                            <button className="text-[10px] text-[#00828B] font-semibold hover:underline flex items-center gap-0.5">
                                View All <ArrowUpRight className="w-2.5 h-2.5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            {recentActivities && recentActivities.length > 0
                                ? recentActivities.map((a, i) => <ActivityRow key={i} action={a.action} target={a.target} timestamp={a.timestamp} />)
                                : (
                                    <div className="flex flex-col items-center justify-center py-6 text-[#5E7090] gap-1.5">
                                        <TrendingUp className="w-6 h-6 opacity-30" />
                                        <p className="text-[10px]">No recent activity</p>
                                    </div>
                                )
                            }
                        </div>
                        <button className="w-full py-2 border border-[#E4EBF3] rounded-lg text-[10px] font-semibold text-[#0F2342] hover:bg-[#F7F9FC] transition-colors flex items-center justify-center gap-1">
                            View Full Audit Log <ArrowUpRight className="w-2.5 h-2.5" />
                        </button>
                    </div>

                    {/* Deal Acceleration */}
                    <div className="bg-white border border-[#E4EBF3] rounded-[12px] p-3 shadow-[0px_1px_3px_rgba(0,0,0,0.06)] flex flex-col gap-2">
                        <div className="flex items-center gap-1.5">
                            <Rocket className="w-4 h-4 text-[#00828B]" />
                            <h3 className="text-[12px] font-semibold text-[#0F2342]">Deal Acceleration</h3>
                        </div>
                        <p className="text-[10px] text-[#5E7090] leading-relaxed">
                            AI-powered insights to help you identify deals that need attention and close faster.
                        </p>
                        <button className="w-full py-2.5 bg-[#00828B] text-white rounded-lg text-[11px] font-semibold hover:bg-[#006E77] transition-colors flex items-center justify-center gap-1">
                            Launch Follow-up Campaign <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrmDashboard;
