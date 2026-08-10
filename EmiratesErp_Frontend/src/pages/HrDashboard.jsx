import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarClock, Briefcase, UserPlus, HandCoins, Receipt, ChevronDown, Calendar, ArrowUpRight, Plane, UserCheck, UserX, BarChart2, Inbox, MoreVertical } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { useLanguage } from '../context/LanguageContext';

const HrDashboard = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const today = new Date().toISOString().split('T')[0];

            const [employeesRes, leavesRes, attendanceRes, loansRes, expensesRes] = await Promise.all([
                axios.get(`${API_URL}/employees/all`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/leave-requests`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/attendance-records?date=${today}`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/employee-loans`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/expenses`, { headers }).catch(() => ({ data: [] })),
            ]);

            const activeEmployees = employeesRes.data.filter(e => e.status === 'ACTIVE');
            const pendingLeaves = leavesRes.data.filter(l => l.status === 'SUBMITTED');

            const employeesOnLeaveToday = new Set(
                leavesRes.data
                    .filter(l => l.status === 'APPROVED' && new Date(l.fromDate) <= new Date(today) && new Date(l.toDate) >= new Date(today))
                    .map(l => l.employee?.employeeCode || l.employeeCode)
            );

            const todaysAttendance = attendanceRes.data || [];
            const pendingLoans = loansRes.data.filter(l => l.status === 'SUBMITTED');
            const pendingExpenses = expensesRes.data.filter(e => e.status === 'SUBMITTED');

            setDashboardData({
                totalEmployees: activeEmployees.length,
                pendingLeaves: pendingLeaves.length,
                todaysAttendance,
                onLeaveCount: employeesOnLeaveToday.size,
                pendingLoans: pendingLoans.length,
                pendingExpenses: pendingExpenses.length,
            });
        } catch (err) {
            setError('Failed to fetch dashboard metrics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [API_URL]);

    const attendanceStats = dashboardData ? {
        present: dashboardData.todaysAttendance.filter(a => a.status === 'PRESENT' || a.status === 'HALF_DAY').length,
        absent: dashboardData.todaysAttendance.filter(a => a.status === 'ABSENT').length,
        onLeave: dashboardData.onLeaveCount,
    } : { present: 0, absent: 0, onLeave: 0 };

    const attendanceData = [
        { name: t('attendance.present'), value: attendanceStats.present || 14, color: '#02888D' },
        { name: t('attendance.onLeave'), value: attendanceStats.onLeave || 2, color: '#FFA713' },
        { name: t('attendance.absent'), value: attendanceStats.absent || 2, color: '#FF3B3B' }
    ];

    const departmentData = [
        { name: t('dept.engineering'), value: 35, color: '#02888D' },
        { name: t('dept.sales'), value: 25, color: '#00A9A8' },
        { name: t('dept.marketing'), value: 15, color: '#FFA713' },
        { name: t('dept.hr'), value: 15, color: '#3B82F6' },
        { name: t('dept.finance'), value: 10, color: '#FF3B3B' },
    ];

    const growthData = [
        { month: t('months.nov'), count: 270 },
        { month: t('months.dec'), count: 220 },
        { month: t('months.jan'), count: 165 },
        { month: t('months.feb'), count: 238 },
        { month: t('months.mar'), count: 152 },
        { month: t('months.apr'), count: 225 },
        { month: t('months.may'), count: 270 },
    ];

    const sparklineOrange = [{ v: 3 }, { v: 5 }, { v: 4 }, { v: 6 }, { v: 5 }, { v: 7 }];
    const sparklineTeal = [{ v: 20 }, { v: 22 }, { v: 25 }, { v: 24 }, { v: 28 }, { v: 30 }];
    const sparklineRed = [{ v: 2 }, { v: 1 }, { v: 3 }, { v: 2 }, { v: 4 }, { v: 2 }];

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[#F7FAFF] p-3 lg:p-4 space-y-3 font-sans text-[#18233B]">
                
                {/* Header Row: Title & Date Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <div>
                        <h1 className="text-[23.7px] font-bold tracking-tight text-[#18233B] leading-none mb-1">{t('dashboard.title')}</h1>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="font-medium text-[#008366] cursor-pointer hover:underline">{t('dashboard.breadcrumb.home')}</span>
                            <span className="text-[#617198]">/</span>
                            <span className="font-medium text-[#617198]">{t('dashboard.breadcrumb.hrms')}</span>
                        </div>
                    </div>

                    <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-[#E4EAF0] rounded-[11px] shadow-sm text-xs font-semibold text-[#18233B] hover:bg-slate-50 transition-colors">
                        <Calendar className="h-4 w-4 text-[#18233B]" />
                        <span>May 20, 2025</span>
                        <ChevronDown className="h-3.5 w-3.5 text-[#18233B] ml-1" />
                    </button>
                </div>

                {/* 6 Top KPI Cards Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {/* 1. Total Employees */}
                    <div 
                        onClick={() => navigate('/employees')} 
                        className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-2.5 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-2.5 cursor-pointer hover:shadow-md transition-all"
                    >
                        <div className="h-10 w-10 rounded-full bg-[#EAF8FF] flex items-center justify-center shrink-0">
                            <Users className="h-4.5 w-4.5 text-[#00A9A8]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10.87px] font-semibold text-[#18233B] truncate">{t('kpi.totalEmployees')}</p>
                            <p className="text-[18px] font-bold text-[#18233B] leading-tight">{dashboardData?.totalEmployees || 0}</p>
                            <p className="text-[9.88px] font-semibold text-[#00A9A8] flex items-center gap-0.5 truncate">
                                <span>↑ 12 {t('kpi.thisMonth')}</span>
                            </p>
                        </div>
                    </div>

                    {/* 2. Pending Leaves */}
                    <div 
                        onClick={() => navigate('/leave')} 
                        className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-2.5 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-2.5 cursor-pointer hover:shadow-md transition-all"
                    >
                        <div className="h-10 w-10 rounded-full bg-[#EAF8FF] flex items-center justify-center shrink-0">
                            <CalendarClock className="h-4.5 w-4.5 text-[#00A9A8]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10.87px] font-semibold text-[#18233B] truncate">{t('kpi.pendingLeaves')}</p>
                            <p className="text-[18px] font-bold text-[#18233B] leading-tight">{dashboardData?.pendingLeaves || 0}</p>
                            <p className="text-[9.88px] font-normal text-[#607089] truncate">2.1% {t('kpi.ofEmployees')}</p>
                        </div>
                    </div>

                    {/* 3. Pending Loans */}
                    <div 
                        onClick={() => navigate('/payroll-management')} 
                        className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-2.5 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-2.5 cursor-pointer hover:shadow-md transition-all"
                    >
                        <div className="h-10 w-10 rounded-full bg-[#EAF8FF] flex items-center justify-center shrink-0">
                            <HandCoins className="h-4.5 w-4.5 text-[#00A9A8]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10.87px] font-semibold text-[#18233B] truncate">{t('kpi.pendingLoans')}</p>
                            <p className="text-[18px] font-bold text-[#18233B] leading-tight">{dashboardData?.pendingLoans || 0}</p>
                            <p className="text-[9.88px] font-normal text-[#607089] truncate">{t('kpi.requests')}</p>
                        </div>
                    </div>

                    {/* 4. Pending Expenses */}
                    <div 
                        onClick={() => navigate('/payroll-management')} 
                        className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-2.5 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-2.5 cursor-pointer hover:shadow-md transition-all"
                    >
                        <div className="h-10 w-10 rounded-full bg-[#EAF8FF] flex items-center justify-center shrink-0">
                            <Receipt className="h-4.5 w-4.5 text-[#00A9A8]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10.87px] font-semibold text-[#18233B] truncate">{t('kpi.pendingExpenses')}</p>
                            <p className="text-[18px] font-bold text-[#18233B] leading-tight">{dashboardData?.pendingExpenses || 0}</p>
                            <p className="text-[9.88px] font-normal text-[#607089] truncate">{t('kpi.requests')}</p>
                        </div>
                    </div>

                    {/* 5. Open Positions */}
                    <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-2.5 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-2.5 cursor-pointer hover:shadow-md transition-all">
                        <div className="h-10 w-10 rounded-full bg-[#EAF8FF] flex items-center justify-center shrink-0">
                            <Briefcase className="h-4.5 w-4.5 text-[#00A9A8]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10.87px] font-semibold text-[#18233B] truncate">{t('kpi.openPositions')}</p>
                            <p className="text-[18px] font-bold text-[#18233B] leading-tight">12</p>
                            <p className="text-[9.88px] font-normal text-[#607089] truncate">{t('kpi.active')}</p>
                        </div>
                    </div>

                    {/* 6. New Hires */}
                    <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-2.5 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-2.5 cursor-pointer hover:shadow-md transition-all">
                        <div className="h-10 w-10 rounded-full bg-[#EAF8FF] flex items-center justify-center shrink-0">
                            <UserPlus className="h-4.5 w-4.5 text-[#00A9A8]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10.87px] font-semibold text-[#18233B] truncate">{t('kpi.newHires')}</p>
                            <p className="text-[18px] font-bold text-[#18233B] leading-tight">{dashboardData?.newHiresThisMonth || 0}</p>
                            <p className="text-[9.88px] font-normal text-[#607089] truncate">{t('growth.thisMonth')}</p>
                        </div>
                    </div>
                </div>

                {/* Middle 3-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
                    
                    {/* Left Col (4 cols): Today's Attendance Summary Donut */}
                    <div className="lg:col-span-4 bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-[13.84px] font-semibold text-[#18233B]">{t('attendance.title')}</h2>
                            <MoreVertical className="h-4 w-4 text-[#18233B] cursor-pointer" />
                        </div>

                        {/* Donut Chart & Legend */}
                        <div className="flex items-center justify-around my-1">
                            <div className="w-[135px] h-[135px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={attendanceData}
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {attendanceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Legend matching Figma labels */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#02888D]"></span>
                                    <span className="text-xs font-bold text-[#8991A1]">{t('attendance.success')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B3B]"></span>
                                    <span className="text-xs font-bold text-[#8991A1]">{t('attendance.warning')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFA713]"></span>
                                    <span className="text-xs font-bold text-[#8991A1]">{t('attendance.error')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Attendance Rate Border Section */}
                        <div className="pt-2 border-t border-[#E4EAF0] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-[#008180]" />
                                <span className="text-[11.86px] font-semibold text-[#18233B]">{t('attendance.rate')}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[18px] font-bold text-[#18233B] leading-none">88.6%</p>
                                <p className="text-[9.88px] font-semibold text-[#008180] flex items-center justify-end gap-0.5 mt-0.5">
                                    <span>↑ 3.2% {t('attendance.vsLastMonth')}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Middle Col (4 cols): Recent Check-ins */}
                    <div className="lg:col-span-4 bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[13.84px] font-semibold text-[#18233B]">{t('checkins.title')}</h2>
                            <button className="text-[11.86px] font-semibold text-[#008180] hover:underline">{t('checkins.viewAll')}</button>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center py-4">
                            {dashboardData?.todaysAttendance?.filter(a => a.status === 'PRESENT' || a.status === 'HALF_DAY').length > 0 ? (
                                <div className="w-full space-y-2.5">
                                    {dashboardData.todaysAttendance.filter(a => a.status === 'PRESENT' || a.status === 'HALF_DAY').slice(0, 4).map((att) => (
                                        <div key={att.id} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6.5 h-6.5 rounded-full bg-[#EAF8FF] text-[#00A9A8] flex items-center justify-center font-bold text-xs">
                                                    {att.employeeName ? att.employeeName.charAt(0) : 'E'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[#18233B]">{att.employeeName}</p>
                                                    <p className="text-[10px] text-[#607089]">{att.employeeCode}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-[#18233B]">{att.checkIn || '09:00 AM'}</p>
                                                <span className="text-[9px] font-semibold text-[#008180]">{t('checkins.onTime')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="w-[68px] h-[54px] bg-[#EEF3F7] rounded-[11.86px] flex items-center justify-center mb-2">
                                        <Users className="h-7 w-7 text-[#607089]" />
                                    </div>
                                    <p className="text-[11.86px] font-semibold text-[#607089]">{t('checkins.empty')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Col (4 cols): 3 Sparkline Cards Stacked */}
                    <div className="lg:col-span-4 flex flex-col gap-2 justify-between h-full">
                        {/* 1. On Leave Today */}
                        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-2.5 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center justify-between flex-1">
                            <div className="flex items-center gap-2.5">
                                <div className="h-10 w-10 rounded-full bg-[#FFF4E0] flex items-center justify-center shrink-0">
                                    <Plane className="h-4.5 w-4.5 text-[#FFA713]" />
                                </div>
                                <div>
                                    <p className="text-[11.86px] font-semibold text-[#18233B]">{t('sparkline.onLeave')}</p>
                                    <p className="text-[18px] font-bold text-[#18233B] leading-none my-0.5">{attendanceStats.onLeave}</p>
                                    <p className="text-[9.88px] font-normal text-[#607089]">12% {t('sparkline.ofWorkforce')}</p>
                                </div>
                            </div>
                            <div className="h-8 w-18">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={sparklineOrange}>
                                        <Line type="monotone" dataKey="v" stroke="#FFA713" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 2. Present Today */}
                        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-2.5 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center justify-between flex-1">
                            <div className="flex items-center gap-2.5">
                                <div className="h-10 w-10 rounded-full bg-[#E8F8F7] flex items-center justify-center shrink-0">
                                    <UserCheck className="h-4.5 w-4.5 text-[#00A9A8]" />
                                </div>
                                <div>
                                    <p className="text-[11.86px] font-semibold text-[#18233B]">{t('sparkline.present')}</p>
                                    <p className="text-[18px] font-bold text-[#18233B] leading-none my-0.5">{attendanceStats.present}</p>
                                    <p className="text-[9.88px] font-normal text-[#607089]">75% {t('sparkline.ofWorkforce')}</p>
                                </div>
                            </div>
                            <div className="h-8 w-18">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={sparklineTeal}>
                                        <Line type="monotone" dataKey="v" stroke="#00A9A8" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 3. Absent Today */}
                        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-2.5 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center justify-between flex-1">
                            <div className="flex items-center gap-2.5">
                                <div className="h-10 w-10 rounded-full bg-[rgba(227,41,41,0.1)] flex items-center justify-center shrink-0">
                                    <UserX className="h-4.5 w-4.5 text-[#E02426]" />
                                </div>
                                <div>
                                    <p className="text-[11.86px] font-semibold text-[#18233B]">{t('sparkline.absent')}</p>
                                    <p className="text-[18px] font-bold text-[#18233B] leading-none my-0.5">{attendanceStats.absent}</p>
                                    <p className="text-[9.88px] font-normal text-[#607089]">13% {t('sparkline.ofWorkforce')}</p>
                                </div>
                            </div>
                            <div className="h-8 w-18">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={sparklineRed}>
                                        <Line type="monotone" dataKey="v" stroke="#E02426" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Recent HR Activity | Department Split | Upcoming Birthdays */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
                    
                    {/* Recent HR Activity (4 cols) */}
                    <div className="lg:col-span-4 bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex flex-col justify-between min-h-[190px]">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[13.84px] font-semibold text-[#18233B]">{t('section.hrActivity')}</h2>
                            <button className="text-[11.86px] font-semibold text-[#008180] hover:underline">{t('checkins.viewAll')}</button>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center py-2">
                            {dashboardData?.recentLeaveRequests?.length > 0 ? (
                                <div className="w-full space-y-2">
                                    {dashboardData.recentLeaveRequests.slice(0, 3).map((req) => (
                                        <div key={req.id} className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-[#18233B]">{req.employeeName}</span>
                                            <span className="text-[#607089]">{req.leaveType}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Inbox className="h-7 w-7 text-[#607089] mx-auto mb-1.5" />
                                    <p className="text-[11.86px] font-semibold text-[#607089]">{t('section.noActivity')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Department Split (4 cols) */}
                    <div className="lg:col-span-4 bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex flex-col justify-between min-h-[190px]">
                        <h2 className="text-[13.84px] font-semibold text-[#18233B] mb-1.5">{t('section.deptSplit')}</h2>
                        <div className="flex items-center justify-around flex-1">
                            <div className="w-[100px] h-[100px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={departmentData} innerRadius={30} outerRadius={46} paddingAngle={2} dataKey="value">
                                            {departmentData.map((e, i) => <Cell key={`dept-${i}`} fill={e.color} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-1 text-[11px]">
                                {departmentData.map((d) => (
                                    <div key={d.name} className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                                        <span className="font-medium text-[#18233B]">{d.name}</span>
                                        <span className="text-[#607089]">({d.value}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Birthdays (4 cols) */}
                    <div className="lg:col-span-4 bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex flex-col justify-between min-h-[190px]">
                        <h2 className="text-[13.84px] font-semibold text-[#18233B] mb-2">{t('section.birthdays')}</h2>
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-[#EAF8FF] text-[#00A9A8] flex items-center justify-center font-bold text-xs">
                                        AM
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#18233B]">Ahmed Al Mansouri</p>
                                        <p className="text-[10px] text-[#607089]">{t('dept.operationsDept')}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-[#008180]">May 23</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-[#EAF8FF] text-[#00A9A8] flex items-center justify-center font-bold text-xs">
                                        SH
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#18233B]">Sara Al Hashimi</p>
                                        <p className="text-[10px] text-[#607089]">{t('dept.hrDept')}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-[#008180]">May 25</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-[#EAF8FF] text-[#00A9A8] flex items-center justify-center font-bold text-xs">
                                        OK
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#18233B]">Omar Khalid</p>
                                        <p className="text-[10px] text-[#607089]">{t('dept.financeDept')}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-[#008180]">May 29</span>
                            </div>
                        </div>
                        <button className="text-[11.86px] font-semibold text-[#008180] hover:underline mt-1 text-left">+ 3 {t('birthdays.moreUpcoming')}</button>
                    </div>
                </div>

                {/* Workforce Growth Bar Chart (Exact Figma Spec: Left Stats Column + Right 0-300 Bar Chart Grid) */}
                <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-4 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex flex-col md:flex-row items-center gap-6">
                    {/* Left Column: Heading & Key Metrics */}
                    <div className="flex flex-col gap-1 w-full md:w-[160px] shrink-0 border-b md:border-b-0 md:border-r border-[#E4EAF0] pb-3 md:pb-0 md:pr-4">
                        <h2 className="text-[13.84px] font-semibold text-[#18233B]">{t('growth.title')}</h2>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-[23.72px] font-bold text-[#18233B] leading-none">256</span>
                        </div>
                        <span className="text-[11.86px] font-semibold text-[#008180] mt-1">↑ 12 {t('growth.thisMonth')}</span>
                    </div>

                    {/* Right Column: Bar Chart with 0-300 YAxis & Gridlines */}
                    <div className="h-[150px] flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(137, 145, 161, 0.25)" />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={true} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: '#000000', fontWeight: 500 }} 
                                />
                                <YAxis 
                                    domain={[0, 300]} 
                                    ticks={[0, 100, 200, 300]} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: '#000000', fontWeight: 500 }} 
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#18233B', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                                    cursor={{ fill: 'rgba(0, 113, 155, 0.05)' }}
                                />
                                <Bar dataKey="count" fill="#00719B" radius={[4, 4, 0, 0]} maxBarSize={44} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default HrDashboard;
