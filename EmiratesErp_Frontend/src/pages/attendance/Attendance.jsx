import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
    BookOpen, Users, Clock, Calendar as CalendarIcon, 
    Target, Fingerprint, Server, HelpCircle, Link2, Settings, 
    RefreshCw, Loader, ChevronRight, Menu, X
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import AttendanceLog from './components/AttendanceLog';
import AttendencePolicy from './components/AttendencePolicy';
import BiometricDevices from './components/BiometricDevices';
import BiometricAgents from './components/BiometricAgents';
import EmployeeMappings from './components/EmployeeMappings';
import MissingAttendanceRequests from './components/MissingAttendanceRequests';
import EmployeeShiftRoster from './components/EmployeeShiftRoster';
import WorkScheduleManagement from './components/WorkScheduleManagement';
import WorkCalendarManagement from './components/WorkCalendarManagement';
import AttendanceSettings from './components/AttendanceSettings';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const attendanceNavLinks = [
    { id: 'log', name: 'Attendance Log', icon: BookOpen, component: AttendanceLog },
    { id: 'roster', name: 'Shift Roster', icon: Users, component: () => <EmployeeShiftRoster embedded /> },
    { id: 'schedules', name: 'Work Schedules', icon: Clock, component: () => <WorkScheduleManagement embedded /> },
    { id: 'calendar', name: 'Work Calendar', icon: CalendarIcon, component: () => <WorkCalendarManagement embedded /> },
    { id: 'policies', name: 'Attendance Policies', icon: Target, component: AttendencePolicy },
    { id: 'biometric', name: 'Biometric Devices', icon: Fingerprint, component: BiometricDevices },
    { id: 'agents', name: 'Sync Agents', icon: Server, component: BiometricAgents },
    { id: 'requests', name: 'Missing Requests', icon: HelpCircle, component: MissingAttendanceRequests },
    { id: 'mappings', name: 'Employee Mappings', icon: Link2, component: EmployeeMappings },
    { id: 'settings', name: 'General Settings', icon: Settings, component: AttendanceSettings },
];

const Attendance = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTabId = queryParams.get('tab')?.toLowerCase() || 'log';

    const [activeTab, setActiveTab] = useState(initialTabId);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const tab = queryParams.get('tab')?.toLowerCase();
        if (tab && attendanceNavLinks.some(link => link.id === tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    const handleRunAutoAbsentTask = async () => {
        if (!window.confirm("Run 'Auto-Mark Absent' task? This will mark employees who haven't checked in as absent.")) {
            return;
        }
        setIsSyncing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/time-attendence/auto-mark-absent`, {}, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            alert(response.data || 'Task executed successfully.');
        } catch (err) {
            console.error("Error running auto-absent task:", err);
            alert(err.response?.data?.message || 'Failed to execute the task.');
        } finally {
            setIsSyncing(false);
        }
    };

    const activeLink = attendanceNavLinks.find(link => link.id === activeTab) || attendanceNavLinks[0];
    const ActiveComponent = activeLink.component;

    return (
        <DashboardLayout hideSidebar={true}>
            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-theme(spacing.16))] bg-background">
                
                {/* Module Sidebar */}
                <aside className={`
                    lg:w-64 border-r border-border bg-sidebar-bg text-sidebar-text z-20 transition-all duration-300
                    ${isSidebarOpen ? 'fixed inset-0 lg:relative' : 'hidden lg:block'}
                `}>
                    <div className="h-full flex flex-col p-4">
                        <div className="flex flex-col gap-4 mb-6 px-2 border-b border-white/10 pb-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">
                                    Attendance Hub
                                </h2>
                                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-white/10 rounded-theme text-foreground-muted">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <button 
                                onClick={() => window.location.href = '/hrdashboard'} 
                                className="flex items-center gap-2 text-sm font-medium hover:bg-sidebar-hover p-2 -ml-2 rounded-theme transition-colors opacity-80 hover:opacity-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                                Back to Dashboard
                            </button>
                        </div>

                        <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                            {attendanceNavLinks.map((link) => (
                                <button
                                    key={link.id}
                                    onClick={() => {
                                        setActiveTab(link.id);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-2.5 rounded-theme text-sm font-medium transition-colors group
                                        ${activeTab === link.id 
                                            ? 'bg-sidebar-active text-sidebar-text font-bold' 
                                            : 'text-sidebar-text hover:bg-sidebar-hover opacity-80 hover:opacity-100'
                                        }
                                    `}
                                >
                                    <link.icon className={`h-5 w-5 flex-shrink-0 transition-colors group-hover:scale-110 ${activeTab === link.id ? 'text-sidebar-text' : 'text-orange-500'}`} />
                                    <span className="flex-1 text-left">{link.name}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="pt-4 border-t border-border mt-4">
                            <button 
                                onClick={handleRunAutoAbsentTask}
                                disabled={isSyncing}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-theme bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-colors font-semibold text-sm"
                            >
                                {isSyncing ? <Loader className="animate-spin h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                                {isSyncing ? 'Processing...' : 'Auto-Absent Task'}
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-background/50">
                    {/* Header/Breadcrumbs */}
                    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-background-muted rounded-theme border border-border"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <nav className="flex items-center justify-center h-full">
                                <span className="font-bold text-foreground text-xl tracking-tight">{activeLink.name}</span>
                            </nav>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                        <div className="w-full mx-auto animate-in fade-in duration-500">
                             <ActiveComponent />
                        </div>
                    </div>
                </main>
            </div>
        </DashboardLayout>
    );
};

export default Attendance;
