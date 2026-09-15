import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    RefreshCw, Download, Calendar, ArrowUpRight, ArrowDownRight,
    AlertTriangle, CheckCircle2, Info, ChevronDown, Search, Filter,
    MoreVertical, FileText
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to calculate percentage and color
const DONUT_COLORS = {
    Completed: '#00A9A8',
    'In Progress': '#098BFB',
    Planned: '#00719B',
    'On Hold': '#FC8E1D',
    Cancelled: '#F1343D',
};

const ProductionDashboard = () => {
    const navigate = useNavigate();
    const { hasModule } = useTenant();
    const isHangerTenant = hasModule('HANGER_MANUFACTURING');

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [timeframe, setTimeframe] = useState('Today');

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/production/dashboard/stats`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { isHangerTenant }
            });
            setData(res.data);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError('Failed to load dashboard statistics.');
        } finally {
            setLoading(false);
        }
    }, [isHangerTenant]);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    // Mock/Real mapped data structure matching design
    const kpiMetrics = [
        {
            title: 'Total Orders',
            value: data?.moStats?.total ?? 124,
            change: '↑ 18% vs yesterday',
            changeType: 'up',
            icon: FileText,
            bg: 'bg-[#E3F1FE]',
            iconColor: 'text-[#0073E1]'
        },
        {
            title: 'In Progress',
            value: data?.moStats?.inProgress ?? 46,
            change: '↑ 12% vs yesterday',
            changeType: 'up',
            icon: RefreshCw,
            bg: 'bg-[#E3F7F7]',
            iconColor: 'text-[#0CAEB3]'
        },
        {
            title: 'Completed Today',
            value: data?.moStats?.completed ?? 38,
            change: '↑ 22% vs yesterday',
            changeType: 'up',
            icon: CheckCircle2,
            bg: 'bg-[#E7F5E9]',
            iconColor: 'text-[#008731]'
        },
        {
            title: 'On Hold',
            value: data?.moStats?.onHold ?? 5,
            change: '↓ 10% vs yesterday',
            changeType: 'down',
            icon: AlertTriangle,
            bg: 'bg-[#FDEBE3]',
            iconColor: 'text-[#DD3035]'
        },
        {
            title: 'Overall Efficiency',
            value: data?.efficiency ? `${data.efficiency}%` : '78.6%',
            change: '↑ 5.4% vs yesterday',
            changeType: 'up',
            icon: RefreshCw,
            bg: 'bg-[#F2ECFC]',
            iconColor: 'text-[#985EE5]'
        },
        {
            title: 'Defect Rate',
            value: data?.defectRate ? `${data.defectRate}%` : '1.32%',
            change: '↓ 0.45% vs yesterday',
            changeType: 'up', // lower defect is good
            icon: AlertTriangle,
            bg: 'bg-[#FDEBE3]',
            iconColor: 'text-[#DD3035]'
        }
    ];

    const progressDonutData = [
        { name: 'Completed', value: 38, percent: '30.6%' },
        { name: 'In Progress', value: 46, percent: '37.1%' },
        { name: 'Planned', value: 30, percent: '24.2%' },
        { name: 'On Hold', value: 5, percent: '4.0%' },
        { name: 'Cancelled', value: 5, percent: '4.0%' }
    ];

    const workCenters = [
        { name: 'CNC Machining', value: 88.3, color: '#1680A0' },
        { name: 'Assembly Line 1', value: 76.4, color: '#57C1D2' },
        { name: 'Assembly Line 2', value: 74.1, color: '#3BADBE' },
        { name: 'Painting Booth', value: 69.2, color: '#B0E1E7' },
        { name: 'Quality Inspection', value: 93.5, color: '#1680A0' },
    ];

    const oeeTrend = [
        { day: '24 May', val: 72.1 },
        { day: '25 May', val: 74.3 },
        { day: '26 May', val: 76.9 },
        { day: '27 May', val: 75.2 },
        { day: '28 May', val: 77.9 },
        { day: '29 May', val: 79.1 },
        { day: '30 May', val: 79.6 },
    ];

    const alertsList = [
        {
            id: 1,
            type: 'warning',
            title: 'Machine Maintenance Due',
            desc: 'CNC Machine #07 is due for maintenance',
            time: 'Due in 2 days',
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50'
        },
        {
            id: 2,
            type: 'warning',
            title: 'Low Inventory Alert',
            desc: 'Raw material "Aluminum Sheet" is low',
            time: 'Due in 1 day',
            iconColor: 'text-amber-500',
            bgColor: 'bg-amber-50'
        },
        {
            id: 3,
            type: 'info',
            title: 'Quality Check Required',
            desc: '5 orders awaiting quality inspection',
            action: 'View Orders',
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50'
        },
        {
            id: 4,
            type: 'success',
            title: 'Production Order Completed',
            desc: 'Order PRO-2026-1245 completed',
            action: 'View Details',
            iconColor: 'text-emerald-500',
            bgColor: 'bg-emerald-50'
        }
    ];

    const ordersTable = [
        { id: 'PRO-2026-1245', product: 'Aluminum Frame', workCenter: 'CNC Machining', plan: 500, done: 500, progress: 100, status: 'Completed', start: '28 May', due: '30 May' },
        { id: 'PRO-2026-1244', product: 'Control Panel Box', workCenter: 'Assembly Line 1', plan: 300, done: 210, progress: 70, status: 'In Progress', start: '29 May', due: '31 May' },
        { id: 'PRO-2026-1243', product: 'Metal Enclosure', workCenter: 'CNC Machining', plan: 400, done: 160, progress: 40, status: 'In Progress', start: '29 May', due: '02 Jun' },
        { id: 'PRO-2026-1242', product: 'Cooling Unit Housing', workCenter: 'Painting Booth', plan: 250, done: 75, progress: 30, status: 'In Progress', start: '28 May', due: '01 Jun' },
        { id: 'PRO-2026-1241', product: 'Drive Module Housing', workCenter: 'Assembly Line 2', plan: 350, done: 0, progress: 0, status: 'Planned', start: '30 May', due: '03 Jun' },
        { id: 'PRO-2026-1240', product: 'Power Supply Unit', workCenter: 'Quality Inspection', plan: 200, done: 0, progress: 0, status: 'On Hold', start: '30 May', due: '02 Jun' },
        { id: 'PRO-2026-1239', product: 'Fan Assembly', workCenter: 'Assembly Line 1', plan: 150, done: 0, progress: 0, status: 'On Hold', start: '27 May', due: '31 May' },
        { id: 'PRO-2026-1238', product: 'Wiring Harness', workCenter: 'Assembly Line 1', plan: 500, done: 250, progress: 50, status: 'In Progress', start: '29 May', due: '02 Jun' },
        { id: 'PRO-2026-1237', product: 'Sheet Metal Panel', workCenter: 'CNC Machining', plan: 300, done: 0, progress: 0, status: 'Planned', start: '31 May', due: '04 Jun' },
        { id: 'PRO-2026-1235', product: 'Battery Housing', workCenter: 'Painting Booth', plan: 200, done: 0, progress: 0, status: 'On Hold', start: '28 May', due: '01 Jun' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'bg-[#E7F5E9] text-[#008731]';
            case 'In Progress': return 'bg-[#E3F1FE] text-[#0073E1]';
            case 'Planned': return 'bg-[#F2ECFC] text-[#985EE5]';
            case 'On Hold': return 'bg-[#FDEBE3] text-[#DD3035]';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="flex flex-col gap-3 p-1 max-w-[1600px] mx-auto text-[#111111] font-sans">
            
            {/* Header: Title + Subtitle + Action Buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-bold text-[#111111] tracking-tight">Production Dashboard</h1>
                    <p className="text-[11px] text-[#647288] mt-0.5 font-normal">Real-time overview of manufacturing operations</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchStats}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#01B8BD] text-[#01B8BD] rounded-lg text-xs font-semibold hover:bg-[#01B8BD]/5 transition-colors shadow-xs"
                    >
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => navigate('/production-dashboard/hanger/batches/reports')}
                        className="flex items-center gap-1.5 px-3.5 py-1 bg-[#01B8BD] text-white rounded-lg text-xs font-semibold hover:bg-[#00a3a7] transition-colors shadow-xs"
                    >
                        <span>Export Report</span>
                        <Download className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* 6 Top KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {kpiMetrics.map((kpi, idx) => (
                    <div key={idx} className="bg-white border border-[#E5EAF1] rounded-xl p-2.5 shadow-xs flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center shrink-0`}>
                            <kpi.icon className={`w-4 h-4 ${kpi.iconColor}`} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10.5px] font-semibold text-[#111111] leading-tight truncate">{kpi.title}</span>
                            <span className="text-lg font-bold text-[#111111] leading-tight my-0.5">{kpi.value}</span>
                            <span className={`text-[9.5px] font-normal leading-tight ${kpi.changeType === 'up' ? 'text-[#008731]' : 'text-[#DD3035]'}`}>
                                {kpi.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Section: 3 Columns (Production Progress | Production by Work Center | OEE Trend) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                
                {/* Donut Chart: Production Progress */}
                <div className="lg:col-span-4 bg-white border border-[#E5EAF1] rounded-xl p-3 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs font-bold text-[#111111]">Production Progress</h2>
                        <button className="flex items-center gap-1 text-[10.5px] text-[#111111] border border-[#E5EAF1] px-2 py-0.5 rounded-md bg-white">
                            <span>Today</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={progressDonutData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={34}
                                        outerRadius={50}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {progressDonutData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={DONUT_COLORS[entry.name]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute flex flex-col items-center justify-center text-center">
                                <span className="text-sm font-bold text-[#002341]">124</span>
                                <span className="text-[9px] text-[#002341]">Total Orders</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                            {progressDonutData.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[10px] pb-0.5 border-b border-[#E5EAF1] last:border-none">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[item.name] }} />
                                        <span className="text-[#111111] font-normal truncate">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-[#111111] shrink-0 ml-1">{item.value} ({item.percent})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Progress Bars: Production by Work Center */}
                <div className="lg:col-span-4 bg-white border border-[#E5EAF1] rounded-xl p-3 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs font-bold text-[#111111]">Production by Work Center</h2>
                        <button className="flex items-center gap-1 text-[10.5px] text-[#111111] border border-[#E5EAF1] px-2 py-0.5 rounded-md bg-white">
                            <span>Today</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        {workCenters.map((wc, idx) => (
                            <div key={idx} className="flex flex-col gap-0.5">
                                <div className="flex items-center justify-between text-[10.5px]">
                                    <span className="font-normal text-[#111111]">{wc.name}</span>
                                    <span className="font-bold text-[#111111]">{wc.value}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#F5F7FA] rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${wc.value}%`, backgroundColor: wc.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Line Chart: OEE Trend */}
                <div className="lg:col-span-4 bg-white border border-[#E5EAF1] rounded-xl p-3 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs font-bold text-[#111111]">OEE Trend</h2>
                        <button className="flex items-center gap-1 text-[10.5px] text-[#111111] border border-[#E5EAF1] px-2 py-0.5 rounded-md bg-white">
                            <span>Last 7 Days</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="h-36 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={oeeTrend} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAF1" />
                                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#647288' }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#647288' }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(val) => [`${val}%`, 'OEE']} />
                                <Line type="monotone" dataKey="val" stroke="#01B8BD" strokeWidth={2} dot={{ fill: '#01B8BD', r: 2.5 }} activeDot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Bottom Main Content Grid (Table on Left, Sidebar Widgets on Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                
                {/* Left Table Section: Production Orders */}
                <div className="lg:col-span-8 bg-white border border-[#E5EAF1] rounded-xl p-3 shadow-xs flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <h2 className="text-xs font-bold text-[#111111]">Production Orders</h2>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Search bar */}
                            <div className="relative flex items-center">
                                <Search className="absolute left-2.5 w-3 h-3 text-[#647288]" />
                                <input
                                    type="text"
                                    placeholder="Search Order ID, Product, or Status"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-7 pr-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[11px] w-56 focus:outline-none focus:ring-1 focus:ring-[#01B8BD]"
                                />
                            </div>

                            {/* Filter dropdown */}
                            <button className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[10.5px] font-semibold text-[#111111]">
                                <span>Status: All</span>
                                <ChevronDown className="w-3 h-3 text-[#647288]" />
                            </button>

                            <button className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[10.5px] font-semibold text-[#111111]">
                                <Filter className="w-3 h-3 text-[#647288]" />
                                <span>More Filters</span>
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                            <thead className="bg-[#F8FAFC] border-y border-[#E5EAF1] text-[#647288] font-semibold">
                                <tr>
                                    <th className="py-2 px-2.5">Order ID</th>
                                    <th className="py-2 px-2.5">Product</th>
                                    <th className="py-2 px-2.5">Work Center</th>
                                    <th className="py-2 px-2.5 text-right">Plan</th>
                                    <th className="py-2 px-2.5 text-right">Done</th>
                                    <th className="py-2 px-2.5">Progress</th>
                                    <th className="py-2 px-2.5">Status</th>
                                    <th className="py-2 px-2.5">Start</th>
                                    <th className="py-2 px-2.5">Due</th>
                                    <th className="py-2 px-2.5 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5EAF1]">
                                {ordersTable.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-2 px-2.5 font-semibold text-[#111111]">{row.id}</td>
                                        <td className="py-2 px-2.5 text-[#111111]">{row.product}</td>
                                        <td className="py-2 px-2.5 text-[#647288]">{row.workCenter}</td>
                                        <td className="py-2 px-2.5 text-right font-medium text-[#111111]">{row.plan}</td>
                                        <td className="py-2 px-2.5 text-right font-medium text-[#111111]">{row.done}</td>
                                        <td className="py-2 px-2.5">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-14 h-1.5 bg-[#F5F7FA] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#01B8BD] rounded-full" style={{ width: `${row.progress}%` }} />
                                                </div>
                                                <span className="text-[9.5px] font-bold text-[#111111]">{row.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-2.5">
                                            <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-semibold ${getStatusStyle(row.status)}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-2.5 text-[#647288]">{row.start}</td>
                                        <td className="py-2 px-2.5 text-[#647288]">{row.due}</td>
                                        <td className="py-2 px-2.5 text-center">
                                            <button className="text-[#647288] hover:text-[#111111]">
                                                <MoreVertical className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between text-[11px] pt-1 text-[#647288]">
                        <span>Showing 1 to 10 of 124 entries</span>
                        <div className="flex items-center gap-1">
                            <button className="px-2 py-0.5 border rounded text-[#647288] hover:bg-slate-50">‹</button>
                            <button className="px-2 py-0.5 bg-[#01B8BD] text-white font-bold rounded">1</button>
                            <button className="px-2 py-0.5 border rounded text-[#111111] hover:bg-slate-50">2</button>
                            <button className="px-2 py-0.5 border rounded text-[#111111] hover:bg-slate-50">3</button>
                            <button className="px-2 py-0.5 border rounded text-[#111111] hover:bg-slate-50">4</button>
                            <button className="px-2 py-0.5 border rounded text-[#111111] hover:bg-slate-50">5</button>
                            <span>...</span>
                            <button className="px-2 py-0.5 border rounded text-[#111111] hover:bg-slate-50">13</button>
                            <button className="px-2 py-0.5 border rounded text-[#647288] hover:bg-slate-50">›</button>
                        </div>
                    </div>
                </div>

                {/* Right Side Widgets (Alerts & Notifications | Production Summary | Top Products) */}
                <div className="lg:col-span-4 flex flex-col gap-3">
                    
                    {/* Alerts & Notifications */}
                    <div className="bg-white border border-[#E5EAF1] rounded-xl p-3 shadow-xs flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-bold text-[#111111]">Alerts & Notifications</h2>
                            <button className="text-[10.5px] font-semibold text-[#0073E1] hover:underline">View All</button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {alertsList.map((alert) => (
                                <div key={alert.id} className="flex items-start gap-2 text-[11px] pb-1.5 border-b border-[#E5EAF1] last:border-none">
                                    <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${alert.iconColor}`} />
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="font-semibold text-[#111111]">{alert.title}</span>
                                        <span className="text-[10px] text-[#647288] leading-tight">{alert.desc}</span>
                                        {alert.time && <span className="text-[9.5px] font-semibold text-[#DD3035] mt-0.5">{alert.time}</span>}
                                        {alert.action && <button className="text-[9.5px] font-semibold text-[#0073E1] hover:underline text-left mt-0.5">{alert.action}</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Production Summary Widget */}
                    <div className="bg-white border border-[#E5EAF1] rounded-xl p-3 shadow-xs flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-bold text-[#111111]">Production Summary</h2>
                            <button className="flex items-center gap-1 text-[10.5px] text-[#111111] border border-[#E5EAF1] px-1.5 py-0.5 rounded-md bg-white">
                                <span>Today</span>
                                <ChevronDown className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-1.5 text-[11px]">
                            <div className="flex items-center justify-between pb-1 border-b border-[#E5EAF1]">
                                <span className="text-[#647288]">Total Output</span>
                                <span className="font-bold text-[#111111]">2,458</span>
                            </div>
                            <div className="flex items-center justify-between pb-1 border-b border-[#E5EAF1]">
                                <span className="text-[#647288]">Good Output</span>
                                <span className="font-bold text-[#111111]">2,426</span>
                            </div>
                            <div className="flex items-center justify-between pb-1 border-b border-[#E5EAF1]">
                                <span className="text-[#647288]">Rejected Output</span>
                                <span className="font-bold text-[#DD3035]">32</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#647288]">Rework</span>
                                <span className="font-bold text-[#111111]">18</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white border border-[#E5EAF1] rounded-xl p-3 shadow-xs flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-bold text-[#111111]">Top Products</h2>
                            <button className="flex items-center gap-1 text-[10.5px] text-[#111111] border border-[#E5EAF1] px-1.5 py-0.5 rounded-md bg-white">
                                <span>By Output</span>
                                <ChevronDown className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 text-[11px]">
                            {[
                                { name: 'Aluminum Frame', val: 562, progress: 85 },
                                { name: 'Control Panel Box', val: 438, progress: 70 },
                                { name: 'Metal Enclosure', val: 386, progress: 60 },
                                { name: 'Cooling Unit Housing', val: 312, progress: 50 },
                                { name: 'Drive Module Housing', val: 298, progress: 45 },
                            ].map((prod, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-2">
                                    <span className="text-[#111111] font-medium truncate flex-1">{prod.name}</span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <div className="w-10 h-1.5 bg-[#F5F7FA] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#01B8BD] rounded-full" style={{ width: `${prod.progress}%` }} />
                                        </div>
                                        <span className="font-bold text-[#111111] w-7 text-right">{prod.val}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
};

export default ProductionDashboard;

