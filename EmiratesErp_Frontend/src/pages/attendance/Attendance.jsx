import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    BookOpen, Users, Clock, Calendar as CalendarIcon,
    Target, Fingerprint, Server, HelpCircle, Link2, Settings,
    RefreshCw, Loader, ChevronRight, Menu, X, PanelLeftClose, PanelLeftOpen, ArrowLeft
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
    const navigate = useNavigate();

    // Determine active tab from URL path (e.g. /attendance/roster) or query param (?tab=roster)
    const pathParts = location.pathname.split('/').filter(Boolean);
    const queryParams = new URLSearchParams(location.search);
    const pathTab = pathParts.length > 1 ? pathParts[1].toLowerCase() : null;
    const queryTab = queryParams.get('tab')?.toLowerCase();

    const activeTab = pathTab || queryTab || 'log';

    const [isSyncing, setIsSyncing] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('attendance_sidebar_collapsed') === 'true';
    });

    const toggleCollapsed = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('attendance_sidebar_collapsed', String(next));
            return next;
        });
    };

    const activeNavLink = attendanceNavLinks.find(link => link.id === activeTab) || attendanceNavLinks[0];
    const ActiveComponent = activeNavLink.component;

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

    return (
        <DashboardLayout hideSidebar={true} hideHeaderSearch={true}>
            <div className="flex flex-col lg:flex-row min-h-full flex-1 w-full bg-background text-foreground">

                {/* Module Sidebar */}
                <aside className={`
                    shrink-0 border-r border-border bg-sidebar-bg text-sidebar-text z-20 transition-all duration-300
                    sticky top-0 lg:h-[calc(100vh-3.5rem)] self-start
                    ${isSidebarOpen ? 'fixed inset-0 lg:relative' : 'hidden lg:block'}
                    ${isCollapsed ? 'lg:w-[56px]' : 'lg:w-48'}
                `}>
                    <div className="h-full flex flex-col p-2">
                        <div className="flex flex-col gap-1.5 mb-2 px-1 border-b border-border pb-2">
                            <div className="flex items-center justify-between">
                                {!isCollapsed && (
                                    <h2 className="text-xs font-bold tracking-tight truncate">
                                        Attendance Hub
                                    </h2>
                                )}
                                <div className={`flex items-center gap-1 ${isCollapsed ? 'mx-auto' : ''}`}>
                                    <button
                                        onClick={toggleCollapsed}
                                        className="hidden lg:flex p-1 hover:bg-sidebar-hover rounded-md text-sidebar-text/70 hover:text-sidebar-text transition-colors"
                                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                                    >
                                        {isCollapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
                                    </button>
                                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded-lg text-foreground-muted">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/hrdashboard')}
                                title="Back to Dashboard"
                                className={`flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-1.5 px-2'} text-[11px] font-semibold hover:bg-sidebar-hover py-1 rounded-lg transition-colors opacity-80 hover:opacity-100`}
                            >
                                <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
                                {!isCollapsed && <span className="truncate">Back to Dashboard</span>}
                            </button>
                        </div>

                        <nav className="space-y-0.5 flex-1 overflow-y-auto custom-scrollbar">
                            {attendanceNavLinks.map((link) => (
                                <button
                                    key={link.id}
                                    onClick={() => {
                                        navigate(`/attendance/${link.id}`);
                                        setIsSidebarOpen(false);
                                    }}
                                    title={isCollapsed ? link.name : undefined}
                                    className={`
                                        w-full flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-2 px-2'} py-1.5 rounded-lg text-[11px] font-medium transition-colors group
                                        ${activeTab === link.id
                                            ? 'bg-sidebar-active text-sidebar-text font-bold shadow-2xs'
                                            : 'text-sidebar-text hover:bg-sidebar-hover opacity-80 hover:opacity-100'
                                        }
                                    `}
                                >
                                    <link.icon className={`h-3.5 w-3.5 flex-shrink-0 transition-colors group-hover:scale-105 ${activeTab === link.id ? 'text-sidebar-text' : 'text-orange-500'}`} />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">{link.name}</span>}
                                </button>
                            ))}
                        </nav>

                        <div className="pt-2 border-t border-border mt-2">
                            <button
                                onClick={handleRunAutoAbsentTask}
                                disabled={isSyncing}
                                title={isCollapsed ? "Auto-Mark Absent Task" : undefined}
                                className={`w-full flex items-center justify-center ${isCollapsed ? 'px-1' : 'gap-1.5 px-2'} py-1.5 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-colors font-semibold text-[11px]`}
                            >
                                {isSyncing ? <Loader className="animate-spin h-3.5 w-3.5 shrink-0" /> : <RefreshCw className="h-3.5 w-3.5 shrink-0" />}
                                {!isCollapsed && <span className="truncate">{isSyncing ? 'Processing...' : 'Auto-Absent Task'}</span>}
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-background">
                    {/* Content */}
                    <div className="flex-1 p-3 md:p-4 bg-background">
                        <div className="lg:hidden mb-2">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-1.5 hover:bg-background-muted rounded-lg border border-border flex items-center gap-2 text-xs font-semibold"
                            >
                                <Menu className="h-4 w-4" />
                                <span>Menu</span>
                            </button>
                        </div>
                        <div className="w-full mx-auto animate-in fade-in duration-300">
                            <ActiveComponent />
                        </div>
                    </div>
                </main>
            </div>
        </DashboardLayout>
    );
};

export default Attendance;

