import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    User, 
    Calendar, 
    Clock, 
    ArrowRight, 
    Loader, 
    AlertCircle, 
    DollarSign, 
    FileText, 
    Bell, 
    CheckCircle2, 
    Sparkles, 
    CalendarDays, 
    Briefcase, 
    TrendingUp,
    ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, title, value, subtitle, onClick, linkText, iconBgColor = 'bg-primary/10', iconTextColor = 'text-primary', index = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.08 }}
        className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
    >
        <div>
            <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-foreground-muted tracking-wide uppercase">{title}</p>
                <div className={`p-2.5 rounded-xl ${iconBgColor} ${iconTextColor} shadow-sm`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <p className="text-2xl font-extrabold text-foreground mt-3 tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-foreground-muted mt-1">{subtitle}</p>}
        </div>
        {onClick && (
            <button onClick={onClick} className="mt-4 pt-3 border-t border-border/50 text-xs font-bold text-primary hover:text-primary/80 flex items-center justify-between w-full transition-colors group">
                <span>{linkText}</span> 
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
        )}
    </motion.div>
);

const ActivityItem = ({ icon: Icon, iconBg, title, subtitle, time, index = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, delay: index * 0.05 }}
        className="flex items-center justify-between p-3 rounded-xl hover:bg-background-muted transition-colors border border-transparent hover:border-border/60"
    >
        <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-xl ${iconBg} shrink-0`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{title}</p>
                <p className="text-[11px] text-foreground-muted truncate">{subtitle}</p>
            </div>
        </div>
        {time && <span className="text-[11px] font-medium text-foreground-muted shrink-0 ml-2">{time}</span>}
    </motion.div>
);

const DashboardView = ({ setActiveItem }) => {
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const username = localStorage.getItem('username') || 'Employee';
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!username) {
                    setError("No user found. Please log in again.");
                    setLoading(false);
                    return;
                }
                const headers = { "Authorization": `Bearer ${token}` };

                const employeeRes = await axios.get(`${API_URL}/employees/by-user-email/${username}`, { headers });
                const baseEmployeeData = employeeRes.data;
                const employeeCode = baseEmployeeData.employeeCode;
                localStorage.setItem('employeeCode', employeeCode);

                const jobDetailsRes = await axios.get(`${API_URL}/job-details/${employeeCode}`, { headers })
                    .catch(() => ({ data: null }));

                const leavesRes = await axios.get(`${API_URL}/leave-requests`, { headers })
                    .catch(() => ({ data: [] }));

                const userLeaves = leavesRes.data.filter(l => l.employeeCode === employeeCode);

                const fullEmployeeData = {
                    attendance: {
                        today: { checkIn: '09:30 AM', status: 'PRESENT' },
                        workHours: '4h 30m'
                    },
                    leaveBalance: { sick: 5, casual: 10, earned: 8 },
                    ...baseEmployeeData,
                    jobDetails: jobDetailsRes.data,
                    leaves: userLeaves.length > 0 ? userLeaves : (baseEmployeeData.leaves || []),
                };
                setEmployee(fullEmployeeData);
            } catch (err) {
                console.error("Error fetching employee data:", err);
                if (err.response?.status === 404) {
                    setError('Your employee profile could not be found. Please contact HR.');
                } else {
                    setError('Could not load your dashboard data. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeData();
    }, [username, API_URL]);

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center h-full bg-background-muted">
                <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 flex justify-center items-center h-full bg-background-muted">
                <div className="text-center text-red-600 bg-card p-6 rounded-2xl border border-red-200 shadow-sm max-w-md">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-3 text-lg font-bold text-foreground">Employee Profile Notice</h3>
                    <p className="mt-1 text-xs text-foreground-muted">{error}</p>
                </div>
            </div>
        );
    }

    if (!employee) {
        return <div className="p-8 bg-background-muted text-foreground-muted">No employee data found.</div>;
    }

    const pendingLeaves = employee.leaves?.filter(l => l.status === 'SUBMITTED' || l.status === 'PENDING').length || 0;
    const approvedLeaves = employee.leaves?.filter(l => l.status === 'APPROVED').length || 0;

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-background-muted max-w-7xl mx-auto">
            {/* Header Greeting Banner */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                        <Sparkles className="h-4 w-4" />
                        <span>Employee Self Service Portal</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                        Welcome back, {employee.firstName}! 👋
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-foreground-muted">
                        {employee.jobDetails?.designation || 'Team Member'} • {employee.jobDetails?.department || 'Operations'} • Code: <span className="font-mono text-foreground font-bold">{employee.employeeCode}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button 
                        onClick={() => setActiveItem('Leaves')} 
                        className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-sm hover:bg-primary/90 transition-all flex items-center gap-2"
                    >
                        <Calendar className="h-4 w-4" />
                        Request Leave
                    </button>
                    <button 
                        onClick={() => setActiveItem('Payroll')} 
                        className="px-4 py-2 bg-background border border-border text-foreground text-xs font-bold rounded-xl hover:bg-background-muted transition-all flex items-center gap-2"
                    >
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                        View Payslips
                    </button>
                </div>
            </motion.div>

            {/* High-Density 4-Column Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    index={0}
                    icon={Clock} 
                    title="Today's Attendance" 
                    value={employee.attendance.today.checkIn}
                    subtitle="Checked-In • Standard Shift"
                    onClick={() => setActiveItem('Attendance')}
                    linkText="View Attendance Log"
                    iconBgColor="bg-emerald-500/10"
                    iconTextColor="text-emerald-600"
                />

                <StatCard 
                    index={1}
                    icon={CalendarDays} 
                    title="Leave Balance" 
                    value={`${employee.leaveBalance.casual + employee.leaveBalance.sick + employee.leaveBalance.earned} Days`}
                    subtitle={`Annual: ${employee.leaveBalance.earned}d | Sick: ${employee.leaveBalance.sick}d`}
                    onClick={() => setActiveItem('Leaves')}
                    linkText="View Leave Quota"
                    iconBgColor="bg-amber-500/10"
                    iconTextColor="text-amber-600"
                />

                <StatCard 
                    index={2}
                    icon={FileText} 
                    title="Pending Requests" 
                    value={pendingLeaves}
                    subtitle={`${approvedLeaves} Approved leave requests`}
                    onClick={() => setActiveItem('Leaves')}
                    linkText="Track Approval Status"
                    iconBgColor="bg-sky-500/10"
                    iconTextColor="text-sky-600"
                />

                <StatCard 
                    index={3}
                    icon={DollarSign} 
                    title="Recent Salary Slip" 
                    value="AED 12,500.00"
                    subtitle="Paid out via Bank Transfer"
                    onClick={() => setActiveItem('Payroll')}
                    linkText="Download Latest Slip"
                    iconBgColor="bg-indigo-500/10"
                    iconTextColor="text-indigo-600"
                />
            </div>

            {/* Leave Balances Breakdown & Quick Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Leave Quota Progress Bars */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Leave Balance Breakdown
                            </h2>
                            <button onClick={() => setActiveItem('Leaves')} className="text-xs font-semibold text-primary hover:underline">
                                View Details
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                    <span className="text-foreground-muted">Sick Leave</span>
                                    <span className="text-foreground font-bold">{employee.leaveBalance.sick} / 10 Days</span>
                                </div>
                                <div className="w-full h-2 bg-background-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(employee.leaveBalance.sick / 10) * 100}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                    <span className="text-foreground-muted">Casual Leave</span>
                                    <span className="text-foreground font-bold">{employee.leaveBalance.casual} / 12 Days</span>
                                </div>
                                <div className="w-full h-2 bg-background-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(employee.leaveBalance.casual / 12) * 100}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                    <span className="text-foreground-muted">Annual / Earned Leave</span>
                                    <span className="text-foreground font-bold">{employee.leaveBalance.earned} / 30 Days</span>
                                </div>
                                <div className="w-full h-2 bg-background-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(employee.leaveBalance.earned / 30) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Today's Attendance Timeline Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 }}
                    className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                <Clock className="h-5 w-5 text-emerald-500" />
                                Today's Attendance Summary
                            </h2>
                            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/10 text-emerald-600 rounded-full">
                                PRESENT
                            </span>
                        </div>
                        <div className="bg-background-muted p-4 rounded-xl space-y-3 mb-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-foreground-muted">Check In Time:</span>
                                <span className="font-mono font-bold text-foreground">09:30 AM</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-foreground-muted">Shift Timing:</span>
                                <span className="font-mono text-foreground font-medium">09:00 AM - 06:00 PM</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-foreground-muted">Logged Work Hours:</span>
                                <span className="font-mono font-bold text-primary">4h 30m</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setActiveItem('Attendance')} 
                        className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all text-center"
                    >
                        Go to Attendance Log
                    </button>
                </motion.div>

                {/* Quick Self-Service Actions */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between"
                >
                    <div>
                        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-sky-500" />
                            Quick Actions
                        </h2>
                        <div className="space-y-2.5">
                            <ActivityItem 
                                icon={Calendar}
                                iconBg="bg-amber-500/10 text-amber-600"
                                title="Request Leave / Time Off"
                                subtitle="Submit leave application for approval"
                                time="Apply →"
                            />
                            <ActivityItem 
                                icon={Clock}
                                iconBg="bg-emerald-500/10 text-emerald-600"
                                title="Request Missing Attendance"
                                subtitle="Submit check-in regularization"
                                time="Regularize →"
                            />
                            <ActivityItem 
                                icon={DollarSign}
                                iconBg="bg-indigo-500/10 text-indigo-600"
                                title="Claim Expense / Loan"
                                subtitle="Submit travel reimbursement claim"
                                time="Submit →"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardView;