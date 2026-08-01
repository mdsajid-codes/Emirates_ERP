import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Search, ChevronDown, ChevronUp, UserCheck, UserX, Plane, Briefcase, Loader, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

// Helper to format time from "HH:mm:ss" to "HH:mm AM/PM"
const formatTime = (timeString) => {
    if (!timeString) return '-';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Helper to format a Date object to 'YYYY-MM-DD' string in local timezone
const toYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const getEmployeeName = (employee) => {
    if (!employee) return 'Unknown';
    return `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
};

const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-card p-2.5 rounded-xl shadow-2xs border border-border flex items-center gap-3 transition-all">
        <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">{title}</p>
            <p className="text-base font-bold text-foreground">{value}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const statusStyles = {
        PRESENT: { label: 'Present', style: 'bg-green-500/10 text-green-600 border border-green-500/20' },
        ABSENT: { label: 'Absent', style: 'bg-red-500/10 text-red-600 border border-red-500/20' },
        ON_LEAVE: { label: 'On Leave', style: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20' },
        HALF_DAY: { label: 'Half Day', style: 'bg-orange-500/10 text-orange-600 border border-orange-500/20' },
    };
    const { label, style } = statusStyles[status] || { label: status, style: 'bg-background-muted text-foreground-muted border border-border' };
    return (
        <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${style}`}>
            {label}
        </span>
    );
};

const AttendanceLog = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [attendanceData, setAttendanceData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchData = async () => {
            if (!date) return;
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };

                // Fetch both attendance records and all employees concurrently
                const [attendanceRes, employeesRes] = await Promise.all([
                    axios.get(`${API_URL}/attendance-records`, { params: { date }, headers }),
                    axios.get(`${API_URL}/employees/all`, { headers })
                ]);

                const employeesMap = new Map(employeesRes.data.map(emp => [emp.employeeCode, emp]));

                // Fetch job details for each employee in the attendance list
                const enrichedData = await Promise.all(attendanceRes.data.map(async (record) => {
                    const employee = employeesMap.get(record.employeeCode) || { employeeCode: record.employeeCode };
                    try {
                        const jobDetailsRes = await axios.get(`${API_URL}/job-details/${record.employeeCode}`, { headers });
                        employee.jobDetails = jobDetailsRes.data;
                    } catch (err) {
                        employee.jobDetails = null;
                    }
                    return { ...record, employee };
                }));

                setAttendanceData(enrichedData);
                setEmployees(employeesRes.data);
            } catch (err) {
                console.error("Failed to fetch attendance data", err);
                setError('Failed to load attendance data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [date, API_URL]);

    const currentDate = new Date(date + 'T00:00:00');

    const weekDays = useMemo(() => {
        const baseDate = new Date(date + 'T00:00:00');
        const startOfWeek = new Date(baseDate);
        startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());
        
        const week = [];
        for (let i = 0; i < 7; i++) {
            const dayInWeek = new Date(startOfWeek);
            dayInWeek.setDate(startOfWeek.getDate() + i);
            week.push(dayInWeek);
        }
        return week;
    }, [date]);

    const filteredData = useMemo(() => {
        return attendanceData.filter(item => {
            const employeeName = getEmployeeName(item.employee);
            const employeeCode = item.employee?.employeeCode || '';
            const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, attendanceData]);

    const stats = useMemo(() => ({
        present: attendanceData.filter(e => e.status === 'PRESENT' || e.status === 'HALF_DAY').length,
        absent: attendanceData.filter(e => e.status === 'ABSENT').length,
        onLeave: attendanceData.filter(e => e.status === 'ON_LEAVE').length,
        halfDay: attendanceData.filter(e => e.status === 'HALF_DAY').length,
    }), [attendanceData]);

    const handleDelete = async (recordId, employeeName) => {
        if (window.confirm(`Are you sure you want to delete the attendance record for ${employeeName}?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/attendance-records/${recordId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setAttendanceData(prevData => prevData.filter(record => record.id !== recordId));
            } catch (err) {
                console.error("Failed to delete attendance record", err);
                setError(err.response?.data?.message || 'Failed to delete the record.');
            }
        }
    };

    return (
        <div className="flex flex-col xl:flex-row items-start gap-3">
            {/* Main Content Area */}
            <div className="flex-1 min-w-0 space-y-3 w-full">
                <div className="flex flex-wrap justify-between items-center gap-2">
                    <h2 className="text-xs font-bold text-foreground">
                        Daily Attendance Log for {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <StatCard icon={UserCheck} title="Present" value={stats.present} color="bg-green-600" />
                    <StatCard icon={UserX} title="Absent" value={stats.absent} color="bg-red-600" /> 
                    <StatCard icon={Plane} title="On Leave / Half Day" value={stats.onLeave + stats.halfDay} color="bg-amber-500" />
                    <StatCard icon={Briefcase} title="Total Records" value={attendanceData.length} color="bg-primary" />
                </div>

                <div className="bg-card rounded-2xl shadow-xs border border-border overflow-hidden">
                    <div className="p-3 border-b border-border flex flex-wrap justify-between items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
                            <input 
                                type="text" 
                                placeholder="Search employee..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="pl-8 pr-2.5 py-1 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all w-48 sm:w-64" 
                            />
                        </div>
                        <div className="relative">
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)} 
                                className="pl-2.5 pr-8 py-1 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                            >
                                <option value="All">All Statuses</option>
                                <option value="PRESENT">Present</option>
                                <option value="ABSENT">Absent</option>
                                <option value="ON_LEAVE">On Leave</option>
                                <option value="HALF_DAY">Half Day</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted pointer-events-none" />
                        </div>
                    </div>

                    <div className="overflow-x-auto no-scrollbar">
                        {loading ? (
                            <div className="flex justify-center items-center h-48"><Loader className="animate-spin h-6 w-6 text-primary" /></div>
                        ) : error ? (
                            <div className="text-center py-6 text-xs text-red-500">{error}</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-background-muted/70 border-b border-border text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                                    <tr>
                                        <th scope="col" className="px-3.5 py-2">Employee</th>
                                        <th scope="col" className="px-3.5 py-2">Department</th>
                                        <th scope="col" className="px-3.5 py-2">Status</th>
                                        <th scope="col" className="px-3.5 py-2 text-center">Check In</th>
                                        <th scope="col" className="px-3.5 py-2 text-center">Check Out</th>
                                        <th scope="col" className="px-3.5 py-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50 text-xs text-foreground">
                                    {filteredData.length > 0 ? (
                                        filteredData.map((item) => (
                                            <tr key={item.id} className="hover:bg-background-muted/50 transition-colors">
                                                <td className="px-3.5 py-2 whitespace-nowrap">
                                                    <div className="font-bold text-foreground">{getEmployeeName(item.employee)}</div>
                                                    <div className="text-[10px] text-foreground-muted">{item.employee?.employeeCode || 'N/A'}</div>
                                                </td>
                                                <td className="px-3.5 py-2 text-foreground-muted">{item.employee?.jobDetails?.department || 'N/A'}</td>
                                                <td className="px-3.5 py-2"><StatusBadge status={item.status} /></td>
                                                <td className="px-3.5 py-2 text-center font-mono text-foreground">{formatTime(item.checkIn)}</td>
                                                <td className="px-3.5 py-2 text-center font-mono text-foreground">{formatTime(item.checkOut)}</td>
                                                <td className="px-3.5 py-2 text-right">
                                                    <button 
                                                        onClick={() => handleDelete(item.id, getEmployeeName(item.employee))} 
                                                        className="p-1 text-foreground-muted hover:text-red-600 hover:bg-background-muted rounded-lg transition-colors" 
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-6 text-foreground-muted text-xs">
                                                No attendance records found for this date.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side 7-Day Vertical Date Panel */}
            <aside className="w-full xl:w-52 shrink-0 bg-card p-3 rounded-2xl shadow-2xs border border-border flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        Select Date
                    </span>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => { 
                                const newDate = new Date(currentDate);
                                newDate.setDate(newDate.getDate() - 7);
                                setDate(toYYYYMMDD(newDate));
                            }} 
                            className="p-1 rounded-md hover:bg-background-muted border border-border bg-card text-foreground transition-colors"
                            title="Previous Week"
                        >
                            <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button 
                            onClick={() => { 
                                const newDate = new Date(currentDate);
                                newDate.setDate(newDate.getDate() + 7);
                                setDate(toYYYYMMDD(newDate));
                            }} 
                            className="p-1 rounded-md hover:bg-background-muted border border-border bg-card text-foreground transition-colors"
                            title="Next Week"
                        >
                            <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        className="w-full px-2.5 py-1 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary" 
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    {weekDays.map(day => {
                        const dayString = toYYYYMMDD(day);
                        const isSelected = dayString === date;
                        const isToday = toYYYYMMDD(new Date()) === dayString;
                        return (
                            <button 
                                key={dayString} 
                                onClick={() => setDate(dayString)} 
                                className={`flex items-center justify-between py-2 px-2.5 rounded-xl transition-all duration-150 text-left border ${
                                    isSelected 
                                        ? 'bg-primary text-primary-foreground font-bold shadow-xs border-primary' 
                                        : 'bg-background/40 hover:bg-primary/10 hover:text-primary border-border/50 text-foreground-muted'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-bold w-6">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                    <span className="text-xs font-semibold">{day.getDate()} {day.toLocaleDateString('en-US', { month: 'short' })}</span>
                                </div>
                                {isToday && (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold ${isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                                        Today
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </aside>
        </div>
    );
};

export default AttendanceLog;