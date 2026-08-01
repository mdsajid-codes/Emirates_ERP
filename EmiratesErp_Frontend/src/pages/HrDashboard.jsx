import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarClock, Briefcase, UserPlus, HandCoins, Receipt, Search, UploadCloud, MapPin, Loader, UserCheck, UserX, Plane } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import AddEmployeeModal from './AddEmployeeModal';
import BulkAddEmployeesModal from './BulkAddEmployeesModal';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, BarChart2 } from 'lucide-react';

// A reusable card component for displaying stats
const StatCard = ({ icon: Icon, title, value, change, changeType, color = 'blue', onClick, index = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        onClick={onClick} 
        className={`bg-card text-card-foreground p-6 rounded-theme border border-border flex items-start justify-between shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/50 transition-all' : ''}`}
    >
        <div>
            <p className="text-sm font-medium text-foreground-muted">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className={`bg-primary/10 text-primary p-3 rounded-theme`}>
            <Icon className="h-6 w-6" />
        </div>
    </motion.div>
);

import { AnimatePresence, motion } from "framer-motion";

// A reusable component for activity items
const ActivityItem = ({ icon: Icon, iconColor, title, description, index = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="flex items-start space-x-4"
    >
        <div className={`p-2 rounded-full ${iconColor}`}>
            <Icon className="h-4 w-4 bg-transparent" />
        </div>
        <div>
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-sm text-foreground-muted">{description}</p>
        </div>
    </motion.div>
);
const HrDashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('all');
    const navigate = useNavigate();
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
            const [employeesRes, leavesRes, locationsRes, attendanceRes, loansRes, expensesRes] = await Promise.all([
                axios.get(`${API_URL}/employees/all`, { headers }),
                axios.get(`${API_URL}/leave-requests`, { headers }),
                axios.get(`${API_URL}/locations`, { headers }),
                axios.get(`${API_URL}/attendance-records?date=${today}`, { headers }),
                axios.get(`${API_URL}/employee-loans`, { headers }),
                axios.get(`${API_URL}/expenses`, { headers }),
            ]);

            const activeEmployees = employeesRes.data.filter(e => e.status === 'ACTIVE');
            const pendingLeaves = leavesRes.data.filter(l => l.status === 'SUBMITTED');

            // Calculate today's on-leave count accurately
            const employeesOnLeaveToday = new Set(
                leavesRes.data
                    .filter(l => l.status === 'APPROVED' && new Date(l.fromDate) <= new Date(today) && new Date(l.toDate) >= new Date(today))
                    .map(l => l.employeeCode)
            );
            
            const presentEmployeeCodes = new Set(attendanceRes.data.map(a => a.employeeCode));
            const onLeaveCount = Array.from(employeesOnLeaveToday).filter(code => !presentEmployeeCodes.has(code)).length;

            setDashboardData({
                totalEmployees: activeEmployees.length,
                pendingLeaves: pendingLeaves.length,
                pendingLoans: loansRes.data.filter(l => l.status === 'SUBMITTED').length,
                pendingExpenses: expensesRes.data.filter(e => e.status === 'SUBMITTED').length,
                newHiresThisMonth: activeEmployees.filter(e => new Date(e.createdAt) > new Date(new Date().setDate(1))).length,
                recentLeaveRequests: leavesRes.data.slice(0, 5),
                todaysAttendance: attendanceRes.data, // Keep this for recent check-ins
                onLeaveCount: onLeaveCount, // Use the new accurate count
            });
            setLocations(locationsRes.data);
        } catch (err) {
            setError('Failed to load dashboard data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [API_URL]);

    const stats = dashboardData ? [
        { title: 'Total Employees', value: dashboardData.totalEmployees, icon: Users, color: 'blue', onClick: () => navigate('/employees') },
        { title: 'Pending Leaves', value: dashboardData.pendingLeaves, icon: CalendarClock, color: 'orange', onClick: () => navigate('/leave') },
        { title: 'Pending Loans', value: dashboardData.pendingLoans, icon: HandCoins, color: 'indigo', onClick: () => navigate('/payroll-management') },
        { title: 'Pending Expenses', value: dashboardData.pendingExpenses, icon: Receipt, color: 'rose', onClick: () => navigate('/payroll-management') },
        // { title: 'Open Positions', value: '12', icon: Briefcase, color: 'purple' }, // Placeholder - no onClick yet
        // { title: 'New Hires (Month)', value: dashboardData.newHiresThisMonth, icon: UserPlus, color: 'green' },
    ] : [];

    const attendanceStats = dashboardData ? {
        present: dashboardData.todaysAttendance.filter(a => a.status === 'PRESENT' || a.status === 'HALF_DAY').length,
        absent: dashboardData.todaysAttendance.filter(a => a.status === 'ABSENT').length,
        onLeave: dashboardData.onLeaveCount, // Use the new accurate count
    } : { present: 0, absent: 0, onLeave: 0 };

    const attendanceCards = [
        { title: "Present", value: attendanceStats.present, icon: UserCheck, color: 'green', onClick: () => navigate('/attendance') },
        { title: "Absent", value: attendanceStats.absent, icon: UserX, color: 'red', onClick: () => navigate('/attendance') },
        { title: "On Leave", value: attendanceStats.onLeave, icon: Plane, color: 'orange', onClick: () => navigate('/leave') },
    ];


    const handleEmployeeAdded = () => {
        fetchDashboardData(); // Refresh data after adding an employee
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8 flex justify-center items-center h-full">
                    <Loader className="h-10 w-10 animate-spin text-blue-600" />
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center text-red-500">
                    <p>{error}</p>
                </div>
            </DashboardLayout>
        );
    }

    const attendanceData = [
        { name: 'Present', value: attendanceStats.present, color: '#10B981' },
        { name: 'Absent', value: attendanceStats.absent, color: '#EF4444' },
        { name: 'On Leave', value: attendanceStats.onLeave, color: '#F59E0B' }
    ];

    const totalAttendance = attendanceStats.present + attendanceStats.absent + attendanceStats.onLeave;

    const payrollData = [
        { name: 'Jan', amount: 4000 },
        { name: 'Feb', amount: 3000 },
        { name: 'Mar', amount: 2000 },
        { name: 'Apr', amount: 2780 },
        { name: 'May', amount: 1890 },
        { name: 'Jun', amount: 2390 },
        { name: 'Jul', amount: 3490 },
    ];

    const sparklineData1 = [{ v: 10 }, { v: 15 }, { v: 13 }, { v: 20 }, { v: 18 }, { v: 25 }, { v: 22 }];
    const sparklineData2 = [{ v: 20 }, { v: 18 }, { v: 24 }, { v: 22 }, { v: 28 }, { v: 26 }, { v: 30 }];
    const sparklineData3 = [{ v: 5 }, { v: 8 }, { v: 4 }, { v: 9 }, { v: 5 }, { v: 10 }, { v: 7 }];

    const departmentData = [
        { name: 'Engineering', value: 35, color: '#3b82f6' },
        { name: 'Sales', value: 20, color: '#10b981' },
        { name: 'Marketing', value: 15, color: '#8b5cf6' },
        { name: 'HR', value: 10, color: '#06b6d4' },
        { name: 'Finance', value: 10, color: '#f59e0b' },
        { name: 'Others', value: 10, color: '#64748b' },
    ];

    return (
        <DashboardLayout>
            <div className="p-2 space-y-2 max-w-[1600px] mx-auto font-sans bg-transparent text-foreground">
                
                {/* Top KPI Row */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
                    {/* Total Employees */}
                    <div className="bg-card rounded-xl p-2.5 border border-border shadow-sm flex items-center gap-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/employees')}>
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Users className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-foreground-muted mb-0.5">Total Employees</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-extrabold text-foreground">{dashboardData?.totalEmployees || 0}</p>
                                <div className="flex items-center text-success text-[10px] font-semibold">
                                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                                    <span>12 this month</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Pending Leaves */}
                    <div className="bg-card rounded-xl p-2.5 border border-border shadow-sm flex items-center gap-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/leave')}>
                        <div className="h-10 w-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                            <CalendarClock className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-foreground-muted mb-0.5">Pending Leaves</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-extrabold text-foreground">{dashboardData?.pendingLeaves || 0}</p>
                                <span className="text-[10px] text-foreground-muted">2.1% of employees</span>
                            </div>
                        </div>
                    </div>

                    {/* Pending Loans */}
                    <div className="bg-card rounded-xl p-2.5 border border-border shadow-sm flex items-center gap-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/payroll-management')}>
                        <div className="h-10 w-10 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                            <HandCoins className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-foreground-muted mb-0.5">Pending Loans</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-extrabold text-foreground">{dashboardData?.pendingLoans || 0}</p>
                                <span className="text-[10px] text-foreground-muted">Requests</span>
                            </div>
                        </div>
                    </div>

                    {/* Pending Expenses */}
                    <div className="bg-card rounded-xl p-2.5 border border-border shadow-sm flex items-center gap-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/payroll-management')}>
                        <div className="h-10 w-10 rounded-full bg-warning/10 text-warning flex items-center justify-center shrink-0">
                            <Receipt className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-foreground-muted mb-0.5">Pending Expenses</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-extrabold text-foreground">{dashboardData?.pendingExpenses || 0}</p>
                                <span className="text-[10px] text-foreground-muted">Requests</span>
                            </div>
                        </div>
                    </div>

                    {/* Open Positions */}
                    <div className="bg-card rounded-xl p-2.5 border border-border shadow-sm flex items-center gap-2 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-foreground-muted mb-0.5">Open Positions</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-extrabold text-foreground">12</p>
                                <span className="text-[10px] text-foreground-muted">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* New Hires */}
                    <div className="bg-card rounded-xl p-2.5 border border-border shadow-sm flex items-center gap-2 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="h-10 w-10 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                            <UserPlus className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-foreground-muted mb-0.5">New Hires</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-extrabold text-foreground">{dashboardData?.newHiresThisMonth || 0}</p>
                                <span className="text-[10px] text-foreground-muted">This month</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid (3 Columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch">
                    
                    {/* LEFT COLUMN: Donut Chart & Activity */}
                    <div className="lg:col-span-4 flex flex-col gap-2">
                        {/* Attendance Summary Donut */}
                        <div className="bg-card rounded-xl p-2.5 border border-border shadow-sm">
                            <h2 className="text-sm font-bold text-foreground mb-4">Today's Attendance Summary</h2>
                            <div className="flex items-center justify-between">
                                <div className="relative w-[140px] h-[140px] shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={attendanceData}
                                                innerRadius={45}
                                                outerRadius={65}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {attendanceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-xl font-extrabold text-foreground">{totalAttendance}</span>
                                        <span className="text-[10px] font-medium text-foreground-muted">Total</span>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-3">
                                    {attendanceData.map((item) => (
                                        <div key={item.name} className="flex flex-col">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                <span className="font-semibold text-xs text-foreground">{item.name}</span>
                                            </div>
                                            <span className="text-[10px] text-foreground-muted ml-3.5">
                                                {item.value} ({totalAttendance > 0 ? Math.round((item.value / totalAttendance) * 100) : 0}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-primary/10 rounded-md"><Users className="h-3 w-3 text-primary" /></div>
                                    <span className="text-xs font-semibold text-foreground-muted">Attendance rate</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-foreground">88.6%</p>
                                    <div className="flex items-center text-success text-[9px] font-semibold">
                                        <ArrowUpRight className="h-2 w-2 mr-0.5" />
                                        <span>3.2% vs last month</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent HR Activity */}
                        <div className="bg-card rounded-xl p-2.5 border border-border shadow-sm flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-sm font-bold text-foreground">Recent HR Activity</h2>
                                <button className="text-primary text-[11px] font-bold">View all</button>
                            </div>
                            <div className="space-y-4">
                                {dashboardData?.recentLeaveRequests?.length > 0 ? (
                                    dashboardData.recentLeaveRequests.slice(0, 4).map((req, idx) => (
                                        <div key={req.id} className="flex items-center justify-between gap-2 group">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                                                    {req.employeeName.charAt(0)}
                                                </div>
                                                <p className="text-xs text-foreground truncate">
                                                    <span className="font-semibold">{req.employeeName}</span> requested {req.leaveType}
                                                </p>
                                            </div>
                                            <span className="text-[10px] text-foreground-muted whitespace-nowrap">
                                                {new Date(req.createdAt || req.fromDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-foreground-muted text-center py-4">No activity yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE COLUMN: Recent Check-ins */}
                    <div className="lg:col-span-4 bg-card rounded-xl p-2.5 border border-border shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-bold text-foreground">Recent Check-ins</h2>
                            <button className="text-primary text-[11px] font-bold">View all</button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                            {dashboardData?.todaysAttendance?.filter(a => a.status === 'PRESENT' || a.status === 'HALF_DAY').length > 0 ? (
                                dashboardData.todaysAttendance.filter(a => a.status === 'PRESENT' || a.status === 'HALF_DAY').slice(0, 7).map((att) => (
                                    <div key={att.id} className="flex justify-between items-center group">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                {att.employeeName.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="font-bold text-xs text-foreground">{att.employeeName}</p>
                                                <p className="text-[10px] text-foreground-muted">{att.employeeCode}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-bold text-foreground">{att.checkIn}</span>
                                            <span className="text-[9px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded-sm mt-0.5">On Time</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-40 flex items-center justify-center">
                                    <p className="text-xs text-foreground-muted font-medium">No recent check-ins.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sparklines, Pie, Birthdays, Growth */}
                    <div className="lg:col-span-4 flex flex-col gap-2">
                        
                        {/* Sparkline Cards */}
                        <div className="grid grid-cols-1 gap-2">
                            <div className="bg-card rounded-xl p-2.5 border border-border shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-warning/10 text-warning rounded-md"><Plane className="h-4 w-4" /></div>
                                    <div>
                                        <p className="text-[11px] font-bold text-foreground">On Leave Today</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-extrabold text-foreground">{attendanceStats.onLeave}</span>
                                            <span className="text-[9px] text-foreground-muted">12% of workforce</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-8 w-16">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={sparklineData3}><Line type="monotone" dataKey="v" stroke="#F59E0B" strokeWidth={2} dot={false} /></LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-card rounded-xl p-2.5 border border-border shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-success/10 text-success rounded-md"><UserCheck className="h-4 w-4" /></div>
                                    <div>
                                        <p className="text-[11px] font-bold text-foreground">Present Today</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-extrabold text-foreground">{attendanceStats.present}</span>
                                            <span className="text-[9px] text-foreground-muted">75% of workforce</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-8 w-16">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={sparklineData2}><Line type="monotone" dataKey="v" stroke="#10B981" strokeWidth={2} dot={false} /></LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-card rounded-xl p-2.5 border border-border shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-destructive/10 text-destructive rounded-md"><UserX className="h-4 w-4" /></div>
                                    <div>
                                        <p className="text-[11px] font-bold text-foreground">Absent Today</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-extrabold text-foreground">{attendanceStats.absent}</span>
                                            <span className="text-[9px] text-foreground-muted">13% of workforce</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-8 w-16">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={sparklineData1}><Line type="monotone" dataKey="v" stroke="#EF4444" strokeWidth={2} dot={false} /></LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Department Split & Birthdays */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-card rounded-xl p-2.5 border border-border shadow-sm flex flex-col">
                                <h3 className="text-[11px] font-bold text-foreground mb-2">Department Split</h3>
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="w-[80px] h-[80px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={departmentData} innerRadius={25} outerRadius={35} paddingAngle={2} dataKey="value">
                                                    {departmentData.map((e, i) => <Cell key={`c-${i}`} fill={e.color} />)}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card rounded-xl p-2.5 border border-border shadow-sm flex flex-col justify-between">
                                <h3 className="text-[11px] font-bold text-foreground mb-1">Upcoming Birthdays</h3>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="font-semibold text-foreground">Ava Thompson</span>
                                        <span className="text-foreground-muted">May 23</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="font-semibold text-foreground">Noah Williams</span>
                                        <span className="text-foreground-muted">May 25</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="font-semibold text-foreground">Olivia Martinez</span>
                                        <span className="text-foreground-muted">May 29</span>
                                    </div>
                                </div>
                                <span className="text-[10px] text-primary font-bold mt-1 block cursor-pointer">+ 3 more</span>
                            </div>
                        </div>

                        {/* Workforce Growth */}
                        <div className="bg-card rounded-xl p-2.5 border border-border shadow-sm flex-1 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                    <BarChart2 className="h-3 w-3 text-primary" />
                                    <h3 className="text-[11px] font-bold text-foreground">Workforce Growth</h3>
                                </div>
                            </div>
                            <div className="flex items-end gap-3 h-[60px]">
                                <div className="mb-1">
                                    <span className="text-xl font-extrabold text-foreground">256</span>
                                    <div className="flex items-center text-success text-[9px] font-semibold">
                                        <ArrowUpRight className="h-2 w-2 mr-0.5" /><span>12 this month</span>
                                    </div>
                                </div>
                                <div className="flex-1 h-full pt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={payrollData}>
                                            <Bar dataKey="amount" fill="var(--primary)" radius={[2, 2, 0, 0]} maxBarSize={15} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}

export default HrDashboard;
