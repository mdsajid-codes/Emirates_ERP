import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Plus, Loader, AlertCircle, Download,
    Users, UserCheck, TrendingUp, UserX, Briefcase,
    Clock, PhoneOff, UserCog, GitPullRequest, Copy, Calendar
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import CrmLeadForm from '../components/CrmLeadForm';
import { useCrmPermissions } from '../context/CrmPermissionsContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

/* ── Mock Data ────────────────────────────────────────────── */
const trendDataMock = [
    { month: 'Jan', leads: 80, sales: 40 },
    { month: 'Feb', leads: 95, sales: 55 },
    { month: 'Mar', leads: 75, sales: 60 },
    { month: 'Apr', leads: 110, sales: 70 },
    { month: 'May', leads: 90, sales: 65 },
    { month: 'Jun', leads: 130, sales: 85 },
    { month: 'Jul', leads: 115, sales: 90 },
    { month: 'Aug', leads: 140, sales: 100 },
    { month: 'Sep', leads: 125, sales: 95 },
    { month: 'Oct', leads: 160, sales: 110 },
    { month: 'Nov', leads: 145, sales: 120 },
    { month: 'Dec', leads: 180, sales: 135 },
];

const DONUT_COLORS = ['#0159A0', '#007FC8', '#0096AB', '#13AEA1', '#69C8C4', '#47BD68', '#FE8E2E', '#E5184F'];

const actIconBg = { add: ['#EEF9F0', '#05AE25', '+'], update: ['#EEF4FD', '#0355FD', '↑'], task: ['#FDF4ED', '#FE9514', '✓'], convert: ['#F3F1FF', '#571FFE', '★'] };

const Card = ({ children, className = '', onClick = null }) => (
    <div className={`bg-white border border-[#E2EAF1] rounded-[10px] ${onClick ? 'cursor-pointer hover:border-[#019CAA] transition-all' : ''} ${className}`}
        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
        onClick={onClick}>
        {children}
    </div>
);

const DonutLabel = ({ cx, cy, total, label }) => (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
        <tspan x={cx} dy="-7" fontSize="18" fontWeight="700" fill="#002341">{(total || 0).toLocaleString()}</tspan>
        <tspan x={cx} dy="16" fontSize="9" fill="#60738A">{label}</tspan>
    </text>
);

/* ── Main Component ──────────────────────────────────────────── */
const CrmLead = () => {
    const navigate = useNavigate();
    const { hasPermission } = useCrmPermissions();
    const [stats, setStats] = useState({ total: 0, active: 0, newLeads: 0, lost: 0, converted: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    // Dynamic state from backend
    const [trendData, setTrendData] = useState([]);
    const [pipelineStages, setPipelineStages] = useState([]);
    const [stageDonut, setStageDonut] = useState([]);
    const [sourceDonut, setSourceDonut] = useState([]);
    const [industryDonut, setIndustryDonut] = useState([]);
    const [lostByStage, setLostByStage] = useState([]);
    const [lostByReason, setLostByReason] = useState([]);
    const [recentActs, setRecentActs] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [kpi2Counts, setKpi2Counts] = useState({ pendingTasks: 0, notResponded: 0, unassigned: 0, transferred: 0, duplicates: 0 });

    // Header Filter & Dropdown States
    const [selectedPeriod, setSelectedPeriod] = useState('This Month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [isPeriodDropdownOpen, setPeriodDropdownOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterOwnerId, setFilterOwnerId] = useState('');
    const [isFilterModalOpen, setFilterModalOpen] = useState(false);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/employees/all`, { headers: { Authorization: `Bearer ${token}` } });
                setEmployees(res.data || []);
            } catch (e) {
                console.error("Failed to fetch employees", e);
            }
        };
        fetchEmployees();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true); setError('');
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            // 1. Fetch leads summary & stats
            const leadsRes = await axios.get(`${API_URL}/crm/leads?size=1000`, { headers });
            const allLeads = leadsRes.data.content || [];

            // Apply header filters if active (status, owner, date range/period)
            let leads = allLeads;

            // Date filtering helper
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            if (selectedPeriod === 'Today') {
                leads = leads.filter(l => {
                    const d = new Date(l.createdDate || l.createdAt || l.date);
                    return d >= startOfToday;
                });
            } else if (selectedPeriod === 'This Week') {
                const dayOfWeek = now.getDay();
                const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
                leads = leads.filter(l => {
                    const d = new Date(l.createdDate || l.createdAt || l.date);
                    return d >= startOfWeek;
                });
            } else if (selectedPeriod === 'This Month') {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                leads = leads.filter(l => {
                    const d = new Date(l.createdDate || l.createdAt || l.date);
                    return d >= startOfMonth;
                });
            } else if (selectedPeriod === 'This Quarter') {
                const currentQuarter = Math.floor(now.getMonth() / 3);
                const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
                leads = leads.filter(l => {
                    const d = new Date(l.createdDate || l.createdAt || l.date);
                    return d >= startOfQuarter;
                });
            } else if (selectedPeriod === 'This Year') {
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                leads = leads.filter(l => {
                    const d = new Date(l.createdDate || l.createdAt || l.date);
                    return d >= startOfYear;
                });
            } else if (selectedPeriod === 'Custom Range' && customStartDate && customEndDate) {
                const startCustom = new Date(customStartDate);
                const endCustom = new Date(customEndDate);
                endCustom.setHours(23, 59, 59, 999);
                leads = leads.filter(l => {
                    const d = new Date(l.createdDate || l.createdAt || l.date);
                    return d >= startCustom && d <= endCustom;
                });
            }

            if (filterStatus) {
                leads = leads.filter(l => l.status === filterStatus);
            }
            if (filterOwnerId) {
                leads = leads.filter(l => l.owner && String(l.owner.id || l.owner) === String(filterOwnerId));
            }

            let unassignedCount = 0;
            let notRespondedCount = 0;
            let transferredCount = 0;
            let duplicateCount = 0;

            const s = leads.reduce((a, l) => {
                a.total++;
                if (l.status === 'ACTIVE') a.active++;
                if (l.status === 'NEW') a.newLeads++;
                if (l.status === 'LOST') a.lost++;
                if (l.status === 'CONVERTED') a.converted++;
                if (!l.owner && !l.ownerName) unassignedCount++;
                if (l.status === 'NOT_RESPONDED' || l.status === 'NO_RESPONSE') notRespondedCount++;
                if (l.status === 'TRANSFERRED' || l.isTransferred) transferredCount++;
                if (l.status === 'DUPLICATE' || l.isDuplicate) duplicateCount++;
                return a;
            }, { total: 0, active: 0, newLeads: 0, lost: 0, converted: 0 });
            setStats(s);

            // Fetch tasks for pending tasks count
            let pendingTasksCount = 0;
            try {
                const tasksRes = await axios.get(`${API_URL}/crm/tasks?size=1000`, { headers });
                const tasks = tasksRes.data.content || tasksRes.data || [];
                pendingTasksCount = Array.isArray(tasks) ? tasks.filter(t => t.status === 'PENDING' || t.status === 'OPEN' || !t.completed).length : 0;
            } catch (tErr) {
                console.error('Failed to fetch tasks', tErr);
            }

            // 2. Fetch Lead Stages
            try {
                const stageRes = await axios.get(`${API_URL}/crm/reports/leads-by-stage`, { headers });
                const rawStages = stageRes.data || [];
                const totalStageLeads = rawStages.reduce((acc, curr) => acc + curr.count, 0) || 1;

                const formattedStages = rawStages.map((st, idx) => ({
                    label: st.label || 'Unassigned',
                    count: st.count,
                    pct: parseFloat(((st.count / totalStageLeads) * 100).toFixed(1)),
                    color: DONUT_COLORS[idx % DONUT_COLORS.length],
                    w: Math.max(30, Math.round((st.count / totalStageLeads) * 100))
                }));
                setPipelineStages(formattedStages);

                const formattedDonut = rawStages.map((st, idx) => ({
                    name: st.label || 'Unassigned',
                    value: st.count,
                    color: DONUT_COLORS[idx % DONUT_COLORS.length]
                }));
                setStageDonut(formattedDonut);
            } catch (e) { console.error('Stage report error', e); }

            // 3. Fetch Sources
            try {
                const sourceRes = await axios.get(`${API_URL}/crm/reports/leads-by-source`, { headers });
                const rawSources = sourceRes.data || [];
                setSourceDonut(rawSources.map((s, idx) => ({
                    name: s.label || 'Direct',
                    value: s.count,
                    color: DONUT_COLORS[idx % DONUT_COLORS.length]
                })));
            } catch (e) { console.error('Source report error', e); }

            // 4. Fetch Industries
            try {
                const indRes = await axios.get(`${API_URL}/crm/reports/leads-by-industry`, { headers });
                const rawInd = indRes.data || [];
                setIndustryDonut(rawInd.map((ind, idx) => ({
                    name: ind.label || 'Other',
                    value: ind.count,
                    color: DONUT_COLORS[idx % DONUT_COLORS.length]
                })));
            } catch (e) { console.error('Industry report error', e); }

            // 5. Fetch Lost by Stage
            try {
                const lostStageRes = await axios.get(`${API_URL}/crm/reports/lost-by-stage`, { headers });
                const rawLostStage = lostStageRes.data || [];
                setLostByStage(rawLostStage.map(ls => ({ stage: ls.label, lost: ls.count })));
            } catch (e) { console.error('Lost stage report error', e); }

            // 6. Fetch Lost by Reason
            try {
                const lostReasonRes = await axios.get(`${API_URL}/crm/reports/lost-by-reason`, { headers });
                const rawLostReason = lostReasonRes.data || [];
                const totalLost = rawLostReason.reduce((a, c) => a + c.count, 0) || 1;
                setLostByReason(rawLostReason.map(lr => ({
                    reason: lr.label,
                    count: lr.count,
                    pct: parseFloat(((lr.count / totalLost) * 100).toFixed(1))
                })));
            } catch (e) { console.error('Lost reason report error', e); }

            // 7. Fetch Trend Data with Period
            try {
                const periodMap = {
                    'Today': 'TODAY',
                    'This Week': 'WEEKLY',
                    'This Month': 'MONTHLY',
                    'This Quarter': 'QUARTERLY',
                    'This Year': 'YEARLY',
                    'All Time': 'ALL',
                    'Custom Range': 'CUSTOM'
                };
                const periodParam = periodMap[selectedPeriod] || 'MONTHLY';
                let queryStr = `period=${periodParam}`;
                if (selectedPeriod === 'Custom Range' && customStartDate && customEndDate) {
                    queryStr += `&startDate=${customStartDate}&endDate=${customEndDate}`;
                }
                const trendRes = await axios.get(`${API_URL}/crm/reports/lead-trend?${queryStr}`, { headers });
                setTrendData(trendRes.data || []);
            } catch (e) { console.error('Trend report error', e); }

            // 8. Fetch Top Performers
            try {
                const perfRes = await axios.get(`${API_URL}/crm/reports/top-performers`, { headers });
                setTopUsers((perfRes.data || []).map(p => ({
                    name: p.ownerName,
                    newLeads: p.newLeads,
                    converted: p.converted,
                    rate: `${p.rate}%`
                })));
            } catch (e) { console.error('Top performers report error', e); }

            // 9. Fetch Dashboard Recent Activities & Tasks
            try {
                const dashRes = await axios.get(`${API_URL}/crm/dashboard/summary`, { headers });
                if (dashRes.data?.recentActivities) {
                    setRecentActs(dashRes.data.recentActivities.map(act => ({
                        type: act.type || 'add',
                        text: act.action || 'Lead Action',
                        name: act.description || 'Activity logged',
                        time: act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
                        date: act.timestamp ? new Date(act.timestamp).toLocaleDateString() : ''
                    })));
                }
            } catch (e) { console.error('Dashboard summary error', e); }

            // 10. Set KPI Row 2 dynamically
            setKpi2Counts({
                pendingTasks: pendingTasksCount,
                notResponded: notRespondedCount,
                unassigned: unassignedCount,
                transferred: transferredCount,
                duplicates: duplicateCount
            });

        } catch (err) {
            setError('Failed to fetch lead dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, [selectedPeriod, customStartDate, customEndDate, filterStatus, filterOwnerId]);

    const handleSaveLead = async (leadData) => {
        setFormLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/crm/leads`, leadData, { headers: { Authorization: `Bearer ${token}` } });
            setSidebarOpen(false); fetchDashboardData();
        } catch (err) { alert(`Error: ${err.response?.data?.message || 'Failed to save lead.'}`); }
        finally { setFormLoading(false); }
    };

    const handleExportExcel = () => {
        // Build Excel Workbook with multiple sheets
        const summaryData = [
            { Metric: 'Total Lead', Value: stats.total },
            { Metric: 'Active Lead', Value: stats.active },
            { Metric: 'New Lead', Value: stats.newLeads },
            { Metric: 'Lost Lead', Value: stats.lost },
            { Metric: 'Lead to Operation (Converted)', Value: stats.converted },
            { Metric: 'Pending Tasks', Value: kpi2Counts.pendingTasks },
            { Metric: 'Not Responded Leads', Value: kpi2Counts.notResponded },
            { Metric: 'Unassigned Leads', Value: kpi2Counts.unassigned },
            { Metric: 'Transferred Leads', Value: kpi2Counts.transferred },
            { Metric: 'Duplicate Leads', Value: kpi2Counts.duplicates },
        ];

        const stagesData = pipelineStages.map(s => ({
            Stage: s.label,
            'Lead Count': s.count,
            'Percentage (%)': `${s.pct}%`
        }));

        const topPerformersData = topUsers.map(u => ({
            User: u.name,
            'New Leads': u.newLeads,
            'Converted Leads': u.converted,
            'Conversion Rate': u.rate
        }));

        const wb = XLSX.utils.book_new();

        const wsSummary = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.sheet_add_aoa(wsSummary, [['Metric', 'Value']], { origin: 'A1' });
        wsSummary['!cols'] = [{ wch: 30 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary Metrics');

        const wsStages = XLSX.utils.json_to_sheet(stagesData);
        wsStages['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsStages, 'Pipeline Stages');

        if (topPerformersData.length > 0) {
            const wsPerformers = XLSX.utils.json_to_sheet(topPerformersData);
            wsPerformers['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(wb, wsPerformers, 'Top Performers');
        }

        XLSX.writeFile(wb, `CRM_Lead_Dashboard_Report_${selectedPeriod.replace(/\s+/g, '_')}.xlsx`);
    };

    const kpi1 = [
        { label: 'Total Lead', value: stats.total, trend: '+12%', up: true, bg: '#ECFAFB', status: 'ALL', icon: <Users className="w-6 h-6" style={{ color: '#0695A5' }} /> },
        { label: 'Active Lead', value: stats.active, trend: '+8%', up: true, bg: '#EEFAEE', status: 'ACTIVE', icon: <UserCheck className="w-6 h-6" style={{ color: '#05AE25' }} /> },
        { label: 'New Lead', value: stats.newLeads, trend: '+15%', up: true, bg: '#EEF4FD', status: 'NEW', icon: <TrendingUp className="w-6 h-6" style={{ color: '#0355FD' }} /> },
        { label: 'Lost Lead', value: stats.lost, trend: '−10%', up: false, bg: '#FDEEED', status: 'LOST', icon: <UserX className="w-6 h-6" style={{ color: '#E5184F' }} /> },
        { label: 'Lead to Operation', value: stats.converted, trend: '+5%', up: true, bg: '#F3F1FF', status: 'CONVERTED', icon: <Briefcase className="w-6 h-6" style={{ color: '#571FFE' }} /> },
    ];

    const kpi2 = [
        { label: 'Lead Task Pending', value: kpi2Counts.pendingTasks, badge: 'Tasks', badgeClr: '#FE9514', bg: '#FDF4ED', route: '/crm-dashboard/tasks', icon: <Clock className="w-5 h-5" style={{ color: '#FE9514' }} /> },
        { label: 'Not Respond Leads', value: kpi2Counts.notResponded, badge: 'Leads', badgeClr: '#00818F', bg: '#F6F6F6', route: '/crm-dashboard/leads/all?status=NOT_RESPONDED', icon: <PhoneOff className="w-5 h-5" style={{ color: '#677188' }} /> },
        { label: 'Not Assigned Lead', value: kpi2Counts.unassigned, badge: 'Unassigned', badgeClr: '#FE8E2E', bg: '#FFF8F3', route: '/crm-dashboard/leads/all?unassigned=true', icon: <UserCog className="w-5 h-5" style={{ color: '#FE8E2E' }} /> },
        { label: 'Transfer Leads', value: kpi2Counts.transferred, badge: 'Transferred', badgeClr: '#6D26F8', bg: '#F0EAFB', route: '/crm-dashboard/leads/all?status=TRANSFERRED', icon: <GitPullRequest className="w-5 h-5" style={{ color: '#6D26F8' }} /> },
        { label: 'Duplicate Lead', value: kpi2Counts.duplicates, badge: 'Duplicates', badgeClr: '#E5184F', bg: '#FFF3F5', route: '/crm-dashboard/leads/all?status=DUPLICATE', icon: <Copy className="w-5 h-5" style={{ color: '#E5184F' }} /> },
    ];

    return (
        <div className="min-h-full font-[Inter,sans-serif]" style={{ background: '#FCFDFE' }}>

            {/* ── Header ──────────────────────────── */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h1
                        onClick={() => navigate('/crm-dashboard/leads/all')}
                        title="Click to view all leads"
                        style={{ fontSize: 22, fontWeight: 700, color: '#111111', lineHeight: '30px' }}
                        className="cursor-pointer hover:text-[#019CAA] transition-colors flex items-center gap-2 group"
                    >
                        <span>Lead Dashboard</span>
                        <span className="text-xs font-normal text-[#019CAA] underline opacity-0 group-hover:opacity-100 transition-opacity">View All Leads →</span>
                    </h1>
                    <p style={{ fontSize: 12, color: '#60738A', marginTop: 1 }}>Track and manage your leads with real-time insights.</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Period Dropdown */}
                    <div className="relative">
                        <button onClick={() => setPeriodDropdownOpen(!isPeriodDropdownOpen)}
                            className="flex items-center gap-1.5 bg-white border border-[#E2EAF1] rounded-[9px] px-3 py-2 hover:bg-slate-50 transition-colors cursor-pointer"
                            style={{ fontSize: 12, fontWeight: 600, color: '#002341' }}>
                            <Calendar className="w-3.5 h-3.5 text-[#002341]" />
                            {selectedPeriod}
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="#002341" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>

                        {isPeriodDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setPeriodDropdownOpen(false)} />
                                <div className="absolute right-0 mt-1 w-52 bg-white border border-[#E2EAF1] rounded-lg shadow-lg z-20 py-1 text-xs">
                                    {['Today', 'This Week', 'This Month', 'This Quarter', 'This Year', 'All Time', 'Custom Range'].map(p => (
                                        <button key={p}
                                            onClick={() => { setSelectedPeriod(p); if (p !== 'Custom Range') setPeriodDropdownOpen(false); }}
                                            className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${selectedPeriod === p ? 'font-bold text-[#019CAA]' : 'text-slate-700'}`}>
                                            {p}
                                            {selectedPeriod === p && <span>✓</span>}
                                        </button>
                                    ))}

                                    {selectedPeriod === 'Custom Range' && (
                                        <div className="p-2 border-t border-slate-100 flex flex-col gap-2 bg-slate-50 mt-1">
                                            <div>
                                                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Start Date</label>
                                                <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="w-full text-xs p-1 bg-white border border-slate-200 rounded" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">End Date</label>
                                                <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="w-full text-xs p-1 bg-white border border-slate-200 rounded" />
                                            </div>
                                            <button onClick={() => setPeriodDropdownOpen(false)} className="w-full bg-[#019CAA] text-white py-1 rounded text-xs font-semibold cursor-pointer">Apply Range</button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Filter Popover */}
                    <div className="relative">
                        <button onClick={() => setFilterModalOpen(!isFilterModalOpen)}
                            className={`flex items-center gap-1.5 bg-white border ${(filterStatus || filterOwnerId) ? 'border-[#019CAA] text-[#019CAA] bg-cyan-50/30' : 'border-[#E2EAF1] text-[#002341]'} rounded-[9px] px-3 py-2 hover:bg-slate-50 transition-colors cursor-pointer`}
                            style={{ fontSize: 12, fontWeight: 600 }}>
                            <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M2.25 4.5h13.5M4.5 9h9M6.75 13.5h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            Filters {(filterStatus || filterOwnerId) ? '•' : ''}
                        </button>

                        {isFilterModalOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setFilterModalOpen(false)} />
                                <div className="absolute right-0 mt-1 w-72 bg-white border border-[#E2EAF1] rounded-xl shadow-xl z-20 p-4 text-xs">
                                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                                        <h4 className="font-bold text-slate-800 text-sm">Dashboard Filters</h4>
                                        <button onClick={() => setFilterModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-slate-600 font-semibold mb-1">Status</label>
                                            <select value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#019CAA] outline-none">
                                                <option value="">All Statuses</option>
                                                <option value="NEW">New</option>
                                                <option value="ACTIVE">Active</option>
                                                <option value="LOST">Lost</option>
                                                <option value="CONVERTED">Converted</option>
                                                <option value="NOT_RESPONDED">Not Responded</option>
                                                <option value="TRANSFERRED">Transferred</option>
                                                <option value="DUPLICATE">Duplicate</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-slate-600 font-semibold mb-1">Lead Owner</label>
                                            <select value={filterOwnerId}
                                                onChange={(e) => setFilterOwnerId(e.target.value)}
                                                className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#019CAA] outline-none">
                                                <option value="">All Owners</option>
                                                {employees.map(emp => (
                                                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <button onClick={() => { setFilterStatus(''); setFilterOwnerId(''); }}
                                                className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer">
                                                Reset Filters
                                            </button>
                                            <button onClick={() => setFilterModalOpen(false)}
                                                className="bg-[#019CAA] text-white px-3 py-1.5 rounded-lg font-semibold hover:opacity-90 cursor-pointer">
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    {hasPermission('LEAD', 'create') && (
                        <button onClick={() => navigate('/crm-dashboard/leads/new')}
                            className="flex items-center gap-1.5 rounded-[9px] px-3.5 py-2 text-white hover:opacity-90 transition-opacity cursor-pointer"
                            style={{ background: '#019CAA', fontSize: 12, fontWeight: 500, boxShadow: '0 3px 6px -1px rgba(0,0,0,0.12)' }}>
                            <Plus className="w-4 h-4" />
                            Add New Lead
                        </button>
                    )}
                    <button
                        onClick={handleExportExcel}
                        title="Download Dashboard Report in Excel format"
                        className="flex items-center justify-center bg-white border border-[#E2EAF1] rounded-[9px] p-2 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        <Download className="w-4 h-4 text-[#002341]" />
                    </button>
                </div>
            </div>

            {/* ── KPI Row 1 — 5 big cards ─────────── */}
            {loading ? (
                <div className="flex justify-center items-center h-20 mb-2">
                    <Loader className="animate-spin h-6 w-6 text-[#019CAA]" />
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg flex items-center gap-2 mb-2 text-xs">
                    <AlertCircle className="h-4 w-4" /><p>{error}</p>
                </div>
            ) : (
                <div className="grid grid-cols-5 gap-3 mb-3">
                    {kpi1.map(k => (
                        <Card key={k.label}
                            onClick={() => navigate(k.status === 'ALL' ? '/crm-dashboard/leads/all' : `/crm-dashboard/leads/all?status=${k.status}`)}
                            className="flex items-center gap-3 p-3.5 hover:shadow-md transition-all">
                            <div className="flex-shrink-0 flex items-center justify-center rounded-full"
                                style={{ width: 52, height: 52, background: k.bg }}>
                                {k.icon}
                            </div>
                            <div className="min-w-0">
                                <p style={{ fontSize: 11.5, fontWeight: 600, color: '#002341', lineHeight: '18px' }}>{k.label}</p>
                                <p style={{ fontSize: 22, fontWeight: 700, color: '#002341', lineHeight: '28px' }}>
                                    {typeof k.value === 'number' ? k.value.toLocaleString() : (k.value || 0)}
                                </p>
                                <div className="flex items-center gap-1">
                                    <span style={{ fontSize: 10.5, fontWeight: 700, color: k.up ? '#00853A' : '#E5184F' }}>{k.trend}</span>
                                    <span style={{ fontSize: 10.5, color: '#60738A' }}>vs last month</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* ── KPI Row 2 — 5 compact cards ─────── */}
            <div className="grid grid-cols-5 gap-3 mb-3">
                {kpi2.map(k => (
                    <Card key={k.label}
                        onClick={() => navigate(k.route)}
                        className="flex items-center gap-3 p-3 hover:shadow-md transition-all">
                        <div className="flex-shrink-0 flex items-center justify-center rounded-full"
                            style={{ width: 42, height: 42, background: k.bg }}>
                            {k.icon}
                        </div>
                        <div className="min-w-0">
                            <p style={{ fontSize: 11, fontWeight: 600, color: '#002341', lineHeight: '16px' }}>{k.label}</p>
                            <div className="flex items-baseline gap-1.5">
                                <span style={{ fontSize: 19, fontWeight: 700, color: '#002341', lineHeight: '26px' }}>{k.value}</span>
                                <span style={{ fontSize: 10, fontWeight: 700, color: k.badgeClr }}>{k.badge}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* ── Charts Row 1: Pipeline | Trend | Stage ── */}
            <div className="grid grid-cols-3 gap-3 mb-3">

                {/* Lead Pipeline */}
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#002341' }}>Lead Pipeline</h3>
                        <button onClick={() => navigate('/crm-dashboard/leads')} style={{ fontSize: 11, color: '#007AC4' }} className="hover:underline">View Report</button>
                    </div>
                    <div className="flex gap-3">
                        {/* Funnel */}
                        <div className="flex flex-col items-start gap-0 flex-shrink-0">
                            {(pipelineStages.length > 0 ? pipelineStages : [
                                { label: 'New', count: 0, pct: 0, color: '#0159A0', w: 100 },
                                { label: 'Contacted', count: 0, pct: 0, color: '#007FC8', w: 80 }
                            ]).map(s => (
                                <div key={s.label}
                                    style={{ width: `${s.w * 1.7}px`, height: 27, background: s.color, border: '1px solid #fff' }} />
                            ))}
                        </div>
                        {/* Labels */}
                        <div className="flex flex-col gap-2 justify-center flex-1">
                            {(pipelineStages.length > 0 ? pipelineStages : []).map(s => (
                                <div key={s.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block', flexShrink: 0 }} />
                                        <span style={{ fontSize: 10, color: '#002341' }}>{s.label}</span>
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#002341' }}>{s.count} ({s.pct}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E2EAF1]">
                        <span style={{ fontSize: 10, color: '#60738A' }}>Conversion Rate</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#019CAA' }}>
                            {stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(1) : '0.0'}%
                        </span>
                    </div>
                </Card>

                {/* Lead Trend */}
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-1">
                        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#002341' }}>Lead Trend (Leads vs Sales)</h3>
                        <button onClick={() => navigate('/crm-dashboard/leads')} style={{ fontSize: 11, color: '#007AC4' }} className="hover:underline">View Report</button>
                    </div>
                    <ResponsiveContainer width="100%" height={170}>
                        <LineChart data={trendData.length > 0 ? trendData : [{ month: 'Jan', leads: 0, conversions: 0 }]} margin={{ top: 6, right: 6, bottom: 0, left: -28 }}>
                            <defs>
                                <linearGradient id="leadLine" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#007AC4" />
                                    <stop offset="100%" stopColor="#0096AB" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#E2EAF1" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 8, fill: '#60738A' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 8, fill: '#60738A' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6, border: '1px solid #E2EAF1' }} />
                            <Line type="monotone" dataKey="leads" stroke="url(#leadLine)" strokeWidth={2} dot={{ r: 2, fill: '#007AC4' }} name="Leads" />
                            <Line type="monotone" dataKey="conversions" stroke="#47BD68" strokeWidth={2} dot={{ r: 2, fill: '#47BD68' }} strokeDasharray="4 2" name="Sales" />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span style={{ color: '#60738A' }}>Total Leads <strong style={{ color: '#002341' }}>{stats.total}</strong></span>
                        <span style={{ color: '#60738A' }}>Total Sales <strong style={{ color: '#002341' }}>{stats.converted}</strong> <strong style={{ color: '#00853A' }}>↑ 9%</strong></span>
                    </div>
                </Card>

                {/* Lead by Stage */}
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-1">
                        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#002341' }}>Lead by Stage</h3>
                        <button onClick={() => navigate('/crm-dashboard/leads')} style={{ fontSize: 11, color: '#007AC4' }} className="hover:underline">View Report</button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div style={{ width: 130, height: 130, flexShrink: 0 }}>
                            <PieChart width={130} height={130}>
                                <Pie data={stageDonut.length > 0 ? stageDonut : [{ name: 'None', value: 1, color: '#E2EAF1' }]} cx={62} cy={62} innerRadius={38} outerRadius={60} dataKey="value" startAngle={90} endAngle={-270}>
                                    {(stageDonut.length > 0 ? stageDonut : [{ name: 'None', value: 1, color: '#E2EAF1' }]).map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                                </Pie>
                                <DonutLabel cx={62} cy={62} total={stats.total} label="Total Leads" />
                            </PieChart>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1">
                            {stageDonut.map(s => (
                                <div key={s.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                                        <span style={{ fontSize: 9.5, color: '#002341' }}>{s.name}</span>
                                    </div>
                                    <span style={{ fontSize: 9.5, fontWeight: 700, color: '#002341' }}>
                                        {s.value} ({stats.total > 0 ? ((s.value / stats.total) * 100).toFixed(1) : '0.0'}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* ── Charts Row 2: 4 columns ──────────── */}
            <div className="grid grid-cols-4 gap-3 mb-3">

                {/* Lead by Source */}
                <Card className="p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                        <h3 style={{ fontSize: 12, fontWeight: 600, color: '#002341' }}>Lead by Source</h3>
                        <button onClick={() => navigate('/crm-dashboard/leads')} style={{ fontSize: 10, color: '#007AC4' }} className="hover:underline">View Report</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div style={{ width: 100, height: 100, flexShrink: 0 }}>
                            <PieChart width={100} height={100}>
                                <Pie data={sourceDonut.length > 0 ? sourceDonut : [{ name: 'Direct', value: 1, color: '#E2EAF1' }]} cx={48} cy={48} innerRadius={30} outerRadius={47} dataKey="value" startAngle={90} endAngle={-270}>
                                    {(sourceDonut.length > 0 ? sourceDonut : [{ name: 'Direct', value: 1, color: '#E2EAF1' }]).map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                                </Pie>
                                <DonutLabel cx={48} cy={48} total={stats.total} label="Total" />
                            </PieChart>
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            {sourceDonut.map(s => (
                                <div key={s.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                                        <span style={{ fontSize: 8.5, color: '#002341' }}>{s.name}</span>
                                    </div>
                                    <span style={{ fontSize: 8.5, fontWeight: 700, color: '#002341' }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-[#E2EAF1] flex justify-between">
                        <span style={{ fontSize: 9, color: '#60738A' }}>Top Source</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#007AC4' }}>
                            {sourceDonut.length > 0 ? `${sourceDonut[0].name} (${((sourceDonut[0].value / (stats.total || 1)) * 100).toFixed(1)}%)` : 'Direct / Organic'}
                        </span>
                    </div>
                </Card>

                {/* Lead Lost by Stage */}
                <Card className="p-3.5">
                    <div className="flex items-center justify-between mb-1">
                        <h3 style={{ fontSize: 12, fontWeight: 600, color: '#002341' }}>Lead Lost by Stage</h3>
                        <button onClick={() => navigate('/crm-dashboard/leads')} style={{ fontSize: 10, color: '#007AC4' }} className="hover:underline">View Report</button>
                    </div>
                    <ResponsiveContainer width="100%" height={112}>
                        <BarChart data={lostByStage.length > 0 ? lostByStage : [{ stage: 'New', lost: 0 }]} margin={{ top: 4, right: 4, bottom: 0, left: -28 }} barSize={16}>
                            <defs>
                                <linearGradient id="lostGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#E5184F" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="#7D0020" stopOpacity={0.9} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#E2EAF1" vertical={false} />
                            <XAxis dataKey="stage" tick={{ fontSize: 7, fill: '#60738A' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 7, fill: '#60738A' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ fontSize: 9, borderRadius: 6, border: '1px solid #E2EAF1' }} />
                            <Bar dataKey="lost" fill="url(#lostGrad)" radius={[3, 3, 0, 0]} name="Lost Leads" />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between mt-1 pt-1.5 border-t border-[#E2EAF1]">
                        <span style={{ fontSize: 9, color: '#60738A' }}>Total Lost Leads</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#E5184F' }}>{stats.lost}</span>
                    </div>
                </Card>

                {/* Lead Lost by Reason */}
                <Card className="p-3.5">
                    <div className="flex items-center justify-between mb-2">
                        <h3 style={{ fontSize: 12, fontWeight: 600, color: '#002341' }}>Lead Lost by Reason</h3>
                        <button onClick={() => navigate('/crm-dashboard/leads')} style={{ fontSize: 10, color: '#007AC4' }} className="hover:underline">View Report</button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {lostByReason.map(r => (
                            <div key={r.reason}>
                                <div className="flex items-center justify-between mb-0.5">
                                    <div className="flex items-center gap-1">
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E5184F', display: 'inline-block' }} />
                                        <span style={{ fontSize: 9, color: '#002341' }}>{r.reason}</span>
                                    </div>
                                    <span style={{ fontSize: 9, fontWeight: 700, color: '#002341' }}>{r.count} ({r.pct}%)</span>
                                </div>
                                <div style={{ height: 3, background: '#F2F4F7', borderRadius: 2 }}>
                                    <div style={{ width: `${r.pct}%`, height: '100%', background: '#E5184F', borderRadius: 2 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 pt-1.5 border-t border-[#E2EAF1]">
                        <span style={{ fontSize: 9, color: '#60738A' }}>Total Lost Leads</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#E5184F' }}>{stats.lost}</span>
                    </div>
                </Card>

                {/* Lead by Industry */}
                <Card className="p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                        <h3 style={{ fontSize: 12, fontWeight: 600, color: '#002341' }}>Lead by Industry</h3>
                        <button onClick={() => navigate('/crm-dashboard/leads')} style={{ fontSize: 10, color: '#007AC4' }} className="hover:underline">View Report</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div style={{ width: 100, height: 100, flexShrink: 0 }}>
                            <PieChart width={100} height={100}>
                                <Pie data={industryDonut.length > 0 ? industryDonut : [{ name: 'Other', value: 1, color: '#E2EAF1' }]} cx={48} cy={48} innerRadius={30} outerRadius={47} dataKey="value" startAngle={90} endAngle={-270}>
                                    {(industryDonut.length > 0 ? industryDonut : [{ name: 'Other', value: 1, color: '#E2EAF1' }]).map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                                </Pie>
                                <DonutLabel cx={48} cy={48} total={stats.total} label="Total" />
                            </PieChart>
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            {industryDonut.map(s => (
                                <div key={s.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                                        <span style={{ fontSize: 8.5, color: '#002341' }}>{s.name}</span>
                                    </div>
                                    <span style={{ fontSize: 8.5, fontWeight: 700, color: '#002341' }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-[#E2EAF1] flex justify-between">
                        <span style={{ fontSize: 9, color: '#60738A' }}>Top Industry</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#007AC4' }}>
                            {industryDonut.length > 0 ? `${industryDonut[0].name} (${((industryDonut[0].value / (stats.total || 1)) * 100).toFixed(1)}%)` : 'Real Estate'}
                        </span>
                    </div>
                </Card>
            </div>

            {/* ── Bottom Row: Activity | Top Users ─── */}
            <div className="grid grid-cols-2 gap-3">

                {/* Recent Lead Activities */}
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#002341' }}>Recent Lead Activities</h3>
                        <button onClick={() => navigate('/crm-dashboard/leads')} style={{ fontSize: 11, color: '#007AC4' }} className="hover:underline">View All</button>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        {recentActs.map((a, i) => {
                            const [bg, clr, lbl] = actIconBg[a.type] || ['#F6F6F6', '#555', '•'];
                            return (
                                <div key={i} className="flex items-start gap-2.5">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ background: bg, fontSize: 12, color: clr }}>{lbl}</div>
                                    <div className="flex-1 min-w-0">
                                        <p style={{ fontSize: 11.5, fontWeight: 600, color: '#002341' }}>{a.text}</p>
                                        <p style={{ fontSize: 10.5, color: '#60738A' }}>{a.name}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p style={{ fontSize: 10, color: '#60738A' }}>{a.time}</p>
                                        <p style={{ fontSize: 9, color: '#a0aec0' }}>{a.date}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Top Performing Users */}
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#002341' }}>Top Performing Users</h3>
                        <button onClick={() => navigate('/crm-dashboard/leads')} style={{ fontSize: 11, color: '#007AC4' }} className="hover:underline">View All</button>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E2EAF1' }}>
                                {['User', 'New Leads', 'Converted Leads', 'Conversion Rate'].map(h => (
                                    <th key={h} className={`pb-2 ${h === 'User' ? 'text-left' : 'text-right'}`}
                                        style={{ fontSize: 10.5, fontWeight: 600, color: '#60738A' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {topUsers.map((u, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #F2F4F7' }}>
                                    <td className="py-2" style={{ fontSize: 11.5, color: '#002341' }}>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                                                style={{ fontSize: 9, background: '#019CAA' }}>{u.name ? u.name.charAt(0) : 'U'}</div>
                                            {u.name}
                                        </div>
                                    </td>
                                    <td className="py-2 text-right" style={{ fontSize: 11.5, fontWeight: 600, color: '#002341' }}>{u.newLeads}</td>
                                    <td className="py-2 text-right" style={{ fontSize: 11.5, fontWeight: 600, color: '#002341' }}>{u.converted}</td>
                                    <td className="py-2 text-right" style={{ fontSize: 11.5, fontWeight: 700, color: '#00853A' }}>{u.rate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* ── Add Lead Sidebar ─────────────────── */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50">
                            <CrmLeadForm onSave={handleSaveLead} onCancel={() => setSidebarOpen(false)} loading={formLoading} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CrmLead;