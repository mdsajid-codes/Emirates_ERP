import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Users, Phone, Mail, Calendar, ChevronRight, Plus,
    Activity, Target, UserCheck, BarChart2, Sparkles, Database
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useCrmPermissions } from '../context/CrmPermissionsContext';
import { PieChart, Pie } from 'recharts';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const formatTimeAgo = (ts) => {
    if (!ts) return '';
    const d = new Date(ts), now = new Date();
    const s = Math.floor((now - d) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24); return `${days}d ago`;
};

/* ── Status badge ───────────────────────────── */
const LeadBadge = ({ status }) => {
    const map = {
        NEW: { bg: 'bg-[#E8F5E9]', text: 'text-[#388E3C]', label: 'New' },
        ACTIVE: { bg: 'bg-[#E3F2FD]', text: 'text-[#1976D2]', label: 'Active' },
        CONTACTED: { bg: 'bg-[#E8EAF6]', text: 'text-[#3949AB]', label: 'Contacted' },
        QUALIFIED: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', label: 'Qualified' },
        CONVERTED: { bg: 'bg-[#F3E5F5]', text: 'text-[#7B1FA2]', label: 'Converted' },
        LOST: { bg: 'bg-[#FFEBEE]', text: 'text-[#C62828]', label: 'Lost' },
    };
    const s = map[status] || { bg: 'bg-[#F5F5F5]', text: 'text-[#757575]', label: status };
    return (
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
    );
};

/* ── Agenda task type badge ─────────────────── */
const TypeBadge = ({ type }) => {
    const map = {
        CALL: { bg: 'bg-[#E3F2FD]', text: 'text-[#1976D2]', label: 'Call' },
        EMAIL: { bg: 'bg-[#E8EAF6]', text: 'text-[#3949AB]', label: 'Email' },
        MEETING: { bg: 'bg-[#F3E5F5]', text: 'text-[#7B1FA2]', label: 'Meeting' },
        TASK: { bg: 'bg-[#E8F5E9]', text: 'text-[#388E3C]', label: 'Task' },
    };
    const s = map[type?.toUpperCase()] || { bg: 'bg-[#F5F5F5]', text: 'text-[#757575]', label: type || 'Task' };
    return (
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
    );
};

/* ── Initials avatar ────────────────────────── */
const Avatar = ({ name, size = 'sm' }) => {
    const colors = ['bg-[#00828B]', 'bg-[#3067FA]', 'bg-[#FE9500]', 'bg-[#FF4A4A]', 'bg-[#8B5CF6]'];
    const idx = name ? name.charCodeAt(0) % colors.length : 0;
    const initials = name ? name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() : '?';
    const sz = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-8 h-8 text-[11px]';
    return (
        <div className={`${sz} ${colors[idx]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
            {initials}
        </div>
    );
};

/* ── Main ───────────────────────────────────── */
const CrmHome = () => {
    const { hasPermission } = useCrmPermissions();
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'User';
    const [currentTime, setCurrentTime] = useState(new Date());
    const [recentLeads, setRecentLeads] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, new: 0, converted: 0, tasksDue: 0 });
    const [loading, setLoading] = useState(true);

    const authHeaders = useMemo(() => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }), []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [leadsRes, dashRes] = await Promise.allSettled([
                    axios.get(`${API_URL}/crm/leads?size=1000`, { headers: authHeaders }),
                    axios.get(`${API_URL}/crm/dashboard/summary`, { headers: authHeaders }),
                ]);

                if (leadsRes.status === 'fulfilled') {
                    const leads = leadsRes.value.data.content || [];
                    setRecentLeads([...leads].reverse().slice(0, 5));
                    const sc = leads.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {});
                    setStats(prev => ({
                        ...prev,
                        total: leads.length,
                        active: sc['ACTIVE'] || 0,
                        new: sc['NEW'] || 0,
                        converted: sc['CONVERTED'] || 0,
                    }));
                }

                if (dashRes.status === 'fulfilled') {
                    const d = dashRes.value.data;
                    if (d.recentActivities) setRecentActivities(d.recentActivities.slice(0, 6));
                    if (d.upcomingTasks) setUpcomingTasks(d.upcomingTasks.slice(0, 4));
                }
            } catch (e) {
                console.error('CRM Home fetch failed', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const t = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(t);
    }, [authHeaders]);

    const greeting = () => {
        const h = currentTime.getHours();
        if (h < 12) return 'Good Morning';
        if (h < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    /* bar chart data — 7-day labels */
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const barData = days.map(d => ({
        day: d,
        newLeads: Math.floor(Math.random() * 8),
        conversions: Math.floor(Math.random() * 4),
    }));

    /* conversion rate */
    const convRate = stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0;

    /* donut */
    const donutData = [
        { value: convRate || 1, color: '#009AA6' },
        { value: Math.max(0, 100 - (convRate || 1)), color: '#E7F2F4' },
    ];

    /* agenda placeholder */
    const agenda = upcomingTasks.length > 0 ? upcomingTasks : [
        { id: 1, time: '09:00 AM', title: 'Follow up with recent leads', sub: 'Priority: Medium', type: 'CALL' },
        { id: 2, time: '11:30 AM', title: 'Client Meeting', sub: 'Dubai Trading Co.', type: 'MEETING' },
        { id: 3, time: '02:00 PM', title: 'Send Proposal', sub: 'Dubai Enterprises', type: 'EMAIL' },
        { id: 4, time: '04:30 PM', title: 'Update CRM Records', sub: 'Internal', type: 'TASK' },
    ];

    /* activities placeholder */
    const activities = recentActivities.length > 0 ? recentActivities : [
        { action: 'Call with Dubai Enterprises', target: 'Ahmed Al Mansoori', timestamp: null, timeStr: '10:15 AM', type: 'CALL' },
        { action: 'Email opened', target: 'Proposal for ABC Trading Co.', timestamp: null, timeStr: '09:47 AM', type: 'EMAIL' },
        { action: 'Task completed', target: 'Follow up with Noor LLC', timestamp: null, timeStr: 'Yesterday', type: 'TASK' },
        { action: 'New lead created', target: 'Future Tech Solutions', timestamp: null, timeStr: 'Yesterday', type: 'LEAD' },
    ];

    /* quick action tasks */
    const taskItems = [
        { id: 1, title: 'Prepare proposal for ABC Trading Co.', time: 'Today, 12:00 PM' },
        { id: 2, title: 'Follow up with client', time: 'Today, 03:00 PM' },
        { id: 3, title: 'Follow up with client', time: 'Today, 03:00 PM' },
        { id: 4, title: 'Update opportunity stage', time: 'Tomorrow, 10:00 AM' },
    ];

    const [seedingLoading, setSeedingLoading] = useState(false);
    const [seedingSuccessMsg, setSeedingSuccessMsg] = useState('');
    const [seedingError, setSeedingError] = useState('');

    const handleInsertDummyData = async () => {
        if (seedingLoading) return;
        setSeedingLoading(true);
        setSeedingSuccessMsg('');
        setSeedingError('');
        try {
            const res = await axios.post(`${API_URL}/crm/seed/dummy-data`, {}, { headers: authHeaders });
            if (res.data && res.data.success) {
                const summary = res.data.counts
                    ? Object.entries(res.data.counts).map(([k, v]) => `${k}: ${v}`).join(', ')
                    : '';
                setSeedingSuccessMsg(`Dummy data inserted successfully! (${summary})`);
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (err) {
            console.error('Failed to insert dummy data', err);
            setSeedingError(err.response?.data?.message || err.message || 'Failed to insert dummy data');
        } finally {
            setSeedingLoading(false);
        }
    };

    return (
        <div className="min-h-full bg-[#F7FAFF] font-sans flex gap-3">

            {/* ── LEFT MAIN ─────────────────────────── */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">

                {/* Greeting & Action */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[20px] font-bold text-[#011D41] leading-tight">
                            {greeting()}, {username}! 👋
                        </h1>
                        <p className="text-[13px] text-[#024B5E] mt-0.5">Here's what's happening with your CRM today.</p>
                    </div>

                    <button
                        onClick={handleInsertDummyData}
                        disabled={seedingLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-[#00828B] hover:bg-[#006B73] text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 flex-shrink-0 cursor-pointer"
                    >
                        <Sparkles className={`w-4 h-4 ${seedingLoading ? 'animate-spin' : ''}`} />
                        {seedingLoading ? 'Inserting 50+ Data...' : 'Insert Dummy Data'}
                    </button>
                </div>

                {seedingSuccessMsg && (
                    <div className="bg-[#E8F5E9] border border-[#388E3C] text-[#2E7D32] px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between">
                        <span>{seedingSuccessMsg}</span>
                        <span className="text-[10px] text-[#388E3C]">Reloading page...</span>
                    </div>
                )}

                {seedingError && (
                    <div className="bg-[#FFEBEE] border border-[#EF5350] text-[#C62828] px-4 py-2.5 rounded-lg text-xs font-medium">
                        {seedingError}
                    </div>
                )}

                {/* Teal Stats Banner */}
                <div className="relative rounded-xl overflow-hidden"
                    style={{ background: 'linear-gradient(90.6deg, #008291 0.62%, #00A2A4 100%)', boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)' }}>
                    {/* decorative bg circles */}
                    <div className="absolute right-4 -bottom-2 w-16 opacity-20 select-none pointer-events-none">
                        <div className="w-16 h-16 rounded-full border-4 border-white" />
                        <div className="w-10 h-10 rounded-full border-4 border-white ml-3 -mt-3" />
                    </div>

                    <div className="flex items-center justify-center gap-0 px-8 py-4 relative z-10">
                        {/* Stat 1 */}
                        <div
                            onClick={() => navigate('/crm-dashboard/leads/all?status=NEW')}
                            className="flex items-center gap-3 px-6 cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-all"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#013E5B] flex items-center justify-center flex-shrink-0">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[20px] font-bold text-[#FCFCFD] leading-tight">{stats.new}</span>
                                <span className="text-[12px] text-[#FCFCFD]">New Leads</span>
                                <span className="text-[10px] text-[#FCFCFD] mt-1">↑ Today</span>
                            </div>
                        </div>

                        <div className="w-px h-16 bg-[#E7F2F4] opacity-30 mx-2" />

                        {/* Stat 2 */}
                        <div
                            onClick={() => navigate('/crm-dashboard/leads/all?status=ACTIVE')}
                            className="flex items-center gap-3 px-6 cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-all"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#013E5B] flex items-center justify-center flex-shrink-0">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[20px] font-bold text-[#FCFCFD] leading-tight">{stats.active}</span>
                                <span className="text-[12px] text-[#FCFCFD]">Active Leads</span>
                                <span className="text-[10px] text-[#FCFCFD] mt-1">↑ Today</span>
                            </div>
                        </div>

                        <div className="w-px h-16 bg-[#E7F2F4] opacity-30 mx-2" />

                        {/* Stat 3 */}
                        <div
                            onClick={() => navigate('/crm-dashboard/tasks')}
                            className="flex items-center gap-3 px-6 cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-all"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#013E5B] flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[20px] font-bold text-[#FCFCFD] leading-tight">{stats.tasksDue}</span>
                                <span className="text-[12px] text-[#FCFCFD]">Tasks Due</span>
                                <span className="text-[10px] text-[#FCFCFD] mt-1">↑ Today</span>
                            </div>
                        </div>

                        <div className="w-px h-16 bg-[#E7F2F4] opacity-30 mx-2" />

                        {/* Day */}
                        <div className="flex items-center gap-3 px-6">
                            <div className="w-12 h-12 rounded-full bg-[#013E5B] flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-[#FCFCFD] leading-tight">{dayName}</span>
                                <span className="text-[12px] text-[#FCFCFD]">{dateStr}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lead Performance + bottom row */}
                <div className="flex gap-3 flex-1">

                    {/* Left side: chart + 4 mini stats */}
                    <div className="flex flex-col gap-3 flex-1 min-w-0">

                        {/* Lead Performance bar chart */}
                        <div className="bg-[#FCFCFD] border border-[#E7F2F4] rounded-xl p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3">
                                    <BarChart2 className="w-6 h-6 text-[#00818D] mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-[16px] font-bold text-[#111111] leading-6">Lead Performance</h3>
                                        <p className="text-[11px] text-[#5B7177] leading-4">Overview of your leads and conversions</p>
                                    </div>
                                </div>
                                <button className="text-[12px] text-[#5B7177] border border-[#E7F2F4] px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                                    This Week ⌄
                                </button>
                            </div>

                            <ResponsiveContainer width="100%" height={210}>
                                <BarChart data={barData} margin={{ top: 10, right: 10, bottom: 0, left: -25 }} barSize={52}>
                                    <defs>
                                        <linearGradient id="leadBarGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#00719B" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#102A5C" stopOpacity={0.95} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="0" stroke="#E7F2F4" vertical={false} />
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fontSize: 10, fill: '#5B7177', fontFamily: 'Inter' }}
                                        axisLine={{ stroke: '#E7F2F4' }}
                                        tickLine={false}
                                        dy={6}
                                    />
                                    <YAxis
                                        domain={[0, 5]}
                                        ticks={[0, 1, 2, 3, 4, 5]}
                                        tick={{ fontSize: 10, fill: '#5B7177', fontFamily: 'Inter' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#FCFCFD',
                                            borderRadius: '8px',
                                            border: '1px solid #E7F2F4',
                                            fontSize: '11px',
                                            color: '#111111'
                                        }}
                                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    />
                                    <Bar dataKey="newLeads" name="New Leads" radius={[4, 4, 0, 0]} fill="url(#leadBarGrad)" />
                                </BarChart>
                            </ResponsiveContainer>

                            {/* Legend matching Figma */}
                            <div className="flex items-center gap-5 mt-3 pt-2 border-t border-[#E7F2F4]">
                                <div className="flex items-center gap-1.5">
                                    <div
                                        className="w-[10px] h-[10px] rounded-full"
                                        style={{ background: 'linear-gradient(180deg, #029CC4 0%, #014B5E 100%)' }}
                                    />
                                    <span className="text-[10px] text-[#5B7177]">New Leads</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div
                                        className="w-[10px] h-[10px] rounded-full"
                                        style={{ background: '#00A9A8' }}
                                    />
                                    <span className="text-[10px] text-[#5B7177]">Conversions</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom: 4 stat cards + conversion rate */}
                        <div className="flex gap-3">
                            {/* 4 stat cards in 2x2 grid */}
                            <div className="grid grid-cols-2 gap-2 flex-1">
                                {[
                                    { label: 'Total Leads', value: stats.total, icon: Users, bg: '#F3F9F7', iconBg: '#E1F3EA', iconColor: '#00818D', trend: '↑ 100% vs last week', route: '/crm-dashboard/leads/all' },
                                    { label: 'New Leads', value: stats.new, icon: Plus, bg: '#F2F7FD', iconBg: '#E5EFFC', iconColor: '#0367FD', trend: '— 0% vs last week', route: '/crm-dashboard/leads/all?status=NEW' },
                                    { label: 'Active Leads', value: stats.active, icon: Activity, bg: '#EEF8F8', iconBg: '#DEF2EF', iconColor: '#0B968E', trend: '— 0% vs last week', route: '/crm-dashboard/leads/all?status=ACTIVE' },
                                    { label: 'Converted', value: stats.converted, icon: UserCheck, bg: '#FCF8F5', iconBg: '#FCE1D2', iconColor: '#F54A00', trend: '— 0% vs last week', route: '/crm-dashboard/leads/all?status=CONVERTED' },
                                ].map((s) => (
                                    <div
                                        key={s.label}
                                        onClick={() => navigate(s.route)}
                                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:opacity-90 hover:shadow-sm transition-all"
                                        style={{ background: s.bg }}
                                    >
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: s.iconBg }}>
                                            <s.icon className="w-4 h-4" style={{ color: s.iconColor }} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[20px] font-bold text-[#111] leading-tight">{s.value}</span>
                                            <span className="text-[11px] text-[#111] leading-tight">{s.label}</span>
                                            <span className="text-[10px] font-semibold text-[#00853A] leading-tight">{s.trend}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Conversion Rate donut */}
                            <div className="bg-[#FCFCFD] border border-[#E7F2F4] rounded-xl p-3 shadow-[0px_1px_3px_rgba(0,0,0,0.1)] flex flex-col gap-3 w-[210px] flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-[#00818D]" />
                                        <span className="text-[13px] font-bold text-[#111]">Conversion Rate</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="relative flex-shrink-0">
                                        <ResponsiveContainer width={110} height={110}>
                                            <PieChart>
                                                <Pie data={donutData} innerRadius={40} outerRadius={52} dataKey="value" strokeWidth={0} startAngle={90} endAngle={-270}>
                                                    {donutData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-[17px] font-bold text-[#111]">{convRate}%</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 text-[10px] text-[#00818D] font-bold leading-tight">
                                        <span>↑ {convRate}% vs last</span>
                                        <span>week</span>
                                    </div>
                                </div>

                                {/* Bottom stats */}
                                <div className="flex border-t border-[#E7F2F4] pt-2 gap-0">
                                    {[
                                        { label: 'Total Leads', value: stats.total },
                                        { label: 'Converted', value: stats.converted },
                                        { label: 'Avg. Deal Value', value: 'AED 0' },
                                    ].map((s, i) => (
                                        <div key={s.label} className={`flex flex-col gap-0.5 flex-1 ${i > 0 ? 'border-l border-[#E7F2F4] pl-1.5' : ''}`}>
                                            <span className="text-[8.5px] text-[#5B7177]">{s.label}</span>
                                            <span className="text-[13px] font-bold text-[#111]">{s.value}</span>
                                            <span className="text-[8.5px] font-semibold text-[#00853A]">↑ 8%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT SIDEBAR ─────────────────────── */}
            <div className="flex flex-col gap-3 w-[270px] flex-shrink-0">

                {/* Today's Agenda */}
                <div className="bg-[#FCFCFD] border border-[#E7F2F4] rounded-xl p-3 shadow-[0px_1px_3px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#00818D]" />
                            <span className="text-[13px] font-bold text-[#111]">Today's Agenda</span>
                        </div>
                        <button onClick={() => navigate('/crm-dashboard/calendar')}
                            className="text-[10px] text-[#00818D] font-semibold hover:underline flex items-center gap-0.5">
                            View Calendar <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-0">
                        {agenda.map((item) => (
                            <div key={item.id} className="flex items-start gap-2 py-2 border-b border-[#E7F2F4] last:border-0">
                                <span className="text-[10px] text-[#5B7177] w-14 flex-shrink-0 mt-0.5">{item.time || item.timeStr}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-[#111] leading-snug truncate">{item.title}</p>
                                    <p className="text-[10px] text-[#5B7177] truncate">{item.sub || item.target}</p>
                                </div>
                                <TypeBadge type={item.type} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-[#FCFCFD] border border-[#E7F2F4] rounded-xl p-3 shadow-[0px_1px_3px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-[#00818D]" />
                            <span className="text-[13px] font-bold text-[#111]">Recent Activity</span>
                        </div>
                        <button
                            onClick={() => navigate('/crm-dashboard/recent-activities')}
                            className="text-[10px] text-[#00818D] font-semibold hover:underline flex items-center gap-0.5"
                        >
                            View All <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="flex flex-col">
                        {activities.map((a, i) => (
                            <div key={i} className="flex items-start gap-2 py-1.5 border-b border-[#E7F2F4] last:border-0">
                                <div className="w-5 h-5 rounded-full bg-[#E7F2F4] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {a.type === 'CALL' && <Phone className="w-2.5 h-2.5 text-[#00818D]" />}
                                    {a.type === 'EMAIL' && <Mail className="w-2.5 h-2.5 text-[#00818D]" />}
                                    {(!a.type || a.type === 'TASK' || a.type === 'LEAD') && <Activity className="w-2.5 h-2.5 text-[#00818D]" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-[#111] leading-snug">{a.action}</p>
                                    <p className="text-[10px] text-[#5B7177] truncate">{a.target}</p>
                                </div>
                                <span className="text-[9px] text-[#5B7177] flex-shrink-0 whitespace-nowrap">
                                    {a.timeStr || formatTimeAgo(a.timestamp)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Leads */}
                <div className="bg-[#FCFCFD] border border-[#E7F2F4] rounded-xl p-3 shadow-[0px_1px_3px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-[#00818D]" />
                            <span className="text-[13px] font-bold text-[#111]">Recent Leads</span>
                        </div>
                        <button onClick={() => navigate('/crm-dashboard/leads/all')}
                            className="text-[10px] text-[#00818D] font-semibold hover:underline flex items-center gap-0.5">
                            View All <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-0">
                        {loading ? (
                            <p className="text-[10px] text-[#5B7177] py-2">Loading leads…</p>
                        ) : recentLeads.length > 0 ? recentLeads.map((lead) => (
                            <div
                                key={lead.id}
                                onClick={() => navigate(`/crm-dashboard/leads/${lead.id}`)}
                                className="flex items-center gap-2 py-2 border-b border-[#E7F2F4] last:border-0 cursor-pointer hover:bg-slate-50/80 px-1 rounded-lg transition-all"
                            >
                                <Avatar name={`${lead.firstName || ''} ${lead.lastName || ''}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-[#111] truncate">
                                        {lead.firstName} {lead.lastName}
                                    </p>
                                    <p className="text-[10px] text-[#5B7177] truncate">{lead.email || lead.phone || '-'}</p>
                                </div>
                                <LeadBadge status={lead.status} />
                            </div>
                        )) : (
                            <p className="text-[10px] text-[#5B7177] py-2">No leads found.</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#FCFCFD] border border-[#E7F2F4] rounded-xl p-3 shadow-[0px_1px_3px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[13px] font-bold text-[#111]">⚡ Quick Actions</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { label: 'Add Lead', icon: Users, color: 'text-[#00818D]', bg: 'bg-[#E7F2F4]', action: () => navigate('/crm-dashboard/leads/new'), perm: 'LEAD' },
                            { label: 'Log Call', icon: Phone, color: 'text-[#1976D2]', bg: 'bg-[#E3F2FD]', action: () => navigate('/crm-dashboard/calling-data'), perm: 'CALL_LOG' },
                            { label: 'Send Email', icon: Mail, color: 'text-[#3949AB]', bg: 'bg-[#E8EAF6]', action: () => navigate('/crm-dashboard/calling-data'), perm: null },
                            { label: 'Schedule Meeting', icon: Calendar, color: 'text-[#7B1FA2]', bg: 'bg-[#F3E5F5]', action: () => navigate('/crm-dashboard/calendar'), perm: 'EVENT' },
                        ].map((a) => (
                            <button key={a.label} onClick={a.action}
                                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className={`w-9 h-9 rounded-full ${a.bg} flex items-center justify-center`}>
                                    <a.icon className={`w-4 h-4 ${a.color}`} />
                                </div>
                                <span className="text-[8.5px] text-[#5B7177] text-center leading-tight">{a.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Upcoming Tasks */}
                <div className="bg-[#FCFCFD] border border-[#E7F2F4] rounded-xl p-3 shadow-[0px_1px_3px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#00818D]" />
                            <span className="text-[13px] font-bold text-[#111]">Upcoming Tasks</span>
                        </div>
                        <button onClick={() => navigate('/crm-dashboard/tasks')}
                            className="text-[10px] text-[#00818D] font-semibold hover:underline flex items-center gap-0.5">
                            Add Task <Plus className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-0">
                        {taskItems.map((task) => (
                            <div key={task.id} className="flex items-center gap-2 py-2 border-b border-[#E7F2F4] last:border-0 group cursor-pointer hover:bg-slate-50 rounded-lg px-1 -mx-1">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-[#111] leading-snug">{task.title}</p>
                                    <p className="text-[10px] text-[#5B7177]">{task.time}</p>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-[#5B7177] flex-shrink-0" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrmHome;
