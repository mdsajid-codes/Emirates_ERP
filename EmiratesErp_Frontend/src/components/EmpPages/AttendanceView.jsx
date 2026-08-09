import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    LogIn, 
    LogOut, 
    UserCheck, 
    UserX, 
    AlertTriangle, 
    ChevronsLeft, 
    ChevronsRight, 
    Loader, 
    Clock, 
    CalendarOff, 
    UserMinus, 
    Plane, 
    HelpCircle, 
    Eye, 
    BookOpen,
    Calendar,
    Plus
} from 'lucide-react';
import MissingAttendanceRequestModal from './MissingAttendanceRequestModal';
import MyMissingRequestsTab from './MyMissingRequestsTab';

const formatTime = (timeString) => {
    if (!timeString) return '-';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-';
    try {
        const start = new Date(`1970-01-01T${checkIn}`);
        const end = new Date(`1970-01-01T${checkOut}`);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return '-';
        
        let diff = end.getTime() - start.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);
        const mins = Math.floor(diff / (1000 * 60));
        
        return `${hours}h ${mins}m`;
    } catch (e) {
        return '-';
    }
};

const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-card text-card-foreground p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
            <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">{title}</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{value}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const statusStyles = {
        PRESENT: { label: 'Present', style: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' },
        ABSENT: { label: 'Absent', style: 'bg-red-500/10 text-red-600 border border-red-500/20' },
        ON_LEAVE: { label: 'On Leave', style: 'bg-amber-500/10 text-amber-600 border border-amber-500/20' },
        HALF_DAY: { label: 'Half Day', style: 'bg-orange-500/10 text-orange-600 border border-orange-500/20' },
        HOLIDAY: { label: 'Holiday', style: 'bg-purple-500/10 text-purple-600 border border-purple-500/20' },
        WEEKLY_OFF: { label: 'Weekly Off', style: 'bg-sky-500/10 text-sky-600 border border-sky-500/20' },
    };
    const { label, style } = statusStyles[status] || { label: status, style: 'bg-background-muted text-foreground-muted' };
    return <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${style}`}>{label}</span>;
};

const AttendanceView = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [todaysRecord, setTodaysRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('Log');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const employeeCode = localStorage.getItem('employeeCode');

    useEffect(() => {
        if (!employeeCode) {
            setError('Employee code not found. Please log in again.');
            setLoading(false);
            return;
        }

        const fetchInitialDetails = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };
                const [timeRes, jobRes] = await Promise.all([
                    axios.get(`${API_URL}/time-attendence/${employeeCode}`, { headers }).catch(() => ({ data: null })),
                    axios.get(`${API_URL}/job-details/${employeeCode}`, { headers }).catch(() => ({ data: null }))
                ]);
                setEmployeeDetails({
                    ...timeRes.data,
                    jobDetails: jobRes.data
                });
            } catch (err) {
                console.error("Failed to fetch employee details", err);
                setError('Could not load employee profile information.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialDetails();
    }, [employeeCode, API_URL]);

    useEffect(() => {
        if (!employeeCode) return;

        const fetchMonthlyAttendance = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                
                const response = await axios.get(
                    `${API_URL}/attendance-records/employee/${employeeCode}/monthly?year=${year}&month=${month}`, 
                    { headers }
                );
                setAttendanceData(response.data || []);

                const todayStr = new Date().toISOString().split('T')[0];
                const todayRec = (response.data || []).find(r => r.attendanceDate === todayStr);
                setTodaysRecord(todayRec || null);
            } catch (err) {
                console.error("Failed to fetch monthly attendance records", err);
                setError("Could not load attendance logs for the selected month.");
            } finally {
                setLoading(false);
            }
        };

        fetchMonthlyAttendance();
    }, [currentDate, employeeCode, API_URL]);

    const stats = useMemo(() => {
        const counts = { present: 0, absent: 0, onLeave: 0, halfDay: 0, late: 0, overtimeMinutes: 0 };
        attendanceData.forEach(rec => {
            if (rec.status === 'PRESENT') counts.present++;
            if (rec.status === 'ABSENT') counts.absent++;
            if (rec.status === 'ON_LEAVE') counts.onLeave++;
            if (rec.status === 'HALF_DAY') counts.halfDay++;
            if (rec.isLate) counts.late++;
            if (rec.overtimeMinutes) counts.overtimeMinutes += rec.overtimeMinutes;
        });
        const otHours = Math.floor(counts.overtimeMinutes / 60);
        const otMins = counts.overtimeMinutes % 60;
        counts.overtimeFormatted = `${otHours}h ${otMins}m`;
        return counts;
    }, [attendanceData]);

    const changeMonth = (offset) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    if (loading && !attendanceData.length) {
        return (
            <div className="p-8 flex justify-center items-center h-full bg-background-muted">
                <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6 bg-background-muted max-w-7xl mx-auto">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold text-foreground tracking-tight">My Attendance Log</h1>
                    <p className="text-xs text-foreground-muted mt-0.5">Track your daily check-in, check-out, and overtime hours</p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                    <button 
                        onClick={() => setIsRequestModalOpen(true)}
                        className="px-3.5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-sm hover:bg-primary/90 transition-all flex items-center gap-1.5"
                    >
                        <Plus className="h-4 w-4" />
                        Request Regularization
                    </button>

                    <div className="flex items-center bg-background-muted p-1 rounded-xl border border-border">
                        <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-card rounded-lg text-foreground-muted hover:text-foreground transition-colors">
                            <ChevronsLeft className="h-4 w-4" />
                        </button>
                        <span className="px-3 text-xs font-bold text-foreground">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-card rounded-lg text-foreground-muted hover:text-foreground transition-colors">
                            <ChevronsRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Compact Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard icon={UserCheck} title="Present" value={stats.present} color="bg-emerald-500" />
                <StatCard icon={UserX} title="Half Days" value={stats.halfDay} color="bg-orange-500" />
                <StatCard icon={Plane} title="On Leave" value={stats.onLeave} color="bg-amber-500" />
                <StatCard icon={UserMinus} title="Absent" value={stats.absent} color="bg-red-500" />
                <StatCard icon={AlertTriangle} title="Late Comings" value={stats.late} color="bg-amber-600" />
                <StatCard icon={Clock} title="Overtime" value={stats.overtimeFormatted} color="bg-sky-500" />
            </div>

            {/* Navigation Tabs */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="border-b border-border px-4 flex gap-4 bg-background-muted/50">
                    <button
                        onClick={() => setActiveTab('Log')}
                        className={`py-3 px-3 text-xs font-bold border-b-2 transition-all ${
                            activeTab === 'Log'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-foreground-muted hover:text-foreground'
                        }`}
                    >
                        Attendance Log
                    </button>
                    <button
                        onClick={() => setActiveTab('Requests')}
                        className={`py-3 px-3 text-xs font-bold border-b-2 transition-all ${
                            activeTab === 'Requests'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-foreground-muted hover:text-foreground'
                        }`}
                    >
                        Regularization Requests
                    </button>
                </div>

                {activeTab === 'Log' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-background-muted text-foreground-muted uppercase tracking-wider font-semibold border-b border-border">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Check In</th>
                                    <th className="px-4 py-3">Check Out</th>
                                    <th className="px-4 py-3">Work Hours</th>
                                    <th className="px-4 py-3">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {attendanceData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-foreground-muted">
                                            No attendance records found for {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}.
                                        </td>
                                    </tr>
                                ) : (
                                    attendanceData.map((record) => (
                                        <tr key={record.id || record.attendanceDate} className="hover:bg-background-muted/40 transition-colors">
                                            <td className="px-4 py-3 font-mono font-semibold text-foreground">{record.attendanceDate}</td>
                                            <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
                                            <td className="px-4 py-3 font-mono text-foreground">{formatTime(record.checkInTime)}</td>
                                            <td className="px-4 py-3 font-mono text-foreground">{formatTime(record.checkOutTime)}</td>
                                            <td className="px-4 py-3 font-mono font-bold text-primary">{calculateDuration(record.checkInTime, record.checkOutTime)}</td>
                                            <td className="px-4 py-3 text-foreground-muted truncate max-w-xs">{record.remarks || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <MyMissingRequestsTab employeeCode={employeeCode} />
                )}
            </div>

            {isRequestModalOpen && (
                <MissingAttendanceRequestModal 
                    isOpen={isRequestModalOpen} 
                    onClose={() => setIsRequestModalOpen(false)}
                    employeeCode={employeeCode}
                />
            )}
        </div>
    );
};

export default AttendanceView;
