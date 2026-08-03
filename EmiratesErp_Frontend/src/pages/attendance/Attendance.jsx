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
    { id: 'log', name: 'Attendance Log', icon: BookOpen, iconBg: 'bg-sky-500/35 text-sky-300', component: AttendanceLog },
    { id: 'roster', name: 'Shift Roster', icon: Users, iconBg: 'bg-blue-500/35 text-blue-300', component: () => <EmployeeShiftRoster embedded /> },
    { id: 'schedules', name: 'Work Schedules', icon: Clock, iconBg: 'bg-indigo-500/35 text-indigo-300', component: () => <WorkScheduleManagement embedded /> },
    { id: 'calendar', name: 'Work Calendar', icon: CalendarIcon, iconBg: 'bg-emerald-500/35 text-emerald-300', component: () => <WorkCalendarManagement embedded /> },
    { id: 'policies', name: 'Attendance Policies', icon: Target, iconBg: 'bg-orange-500/35 text-orange-300', component: AttendencePolicy },
    { id: 'biometric', name: 'Biometric Devices', icon: Fingerprint, iconBg: 'bg-amber-500/35 text-amber-300', component: BiometricDevices },
    { id: 'agents', name: 'Sync Agents', icon: Server, iconBg: 'bg-purple-500/35 text-purple-300', component: BiometricAgents },
    { id: 'requests', name: 'Missing Requests', icon: HelpCircle, iconBg: 'bg-rose-500/35 text-rose-300', component: MissingAttendanceRequests },
    { id: 'mappings', name: 'Employee Mappings', icon: Link2, iconBg: 'bg-teal-500/35 text-teal-300', component: EmployeeMappings },
    { id: 'settings', name: 'General Settings', icon: Settings, iconBg: 'bg-slate-500/35 text-slate-300', component: AttendanceSettings },
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
        const stored = localStorage.getItem('attendance_sidebar_collapsed');
        return stored === null ? true : stored === 'true';
    });
    const [isHovered, setIsHovered] = useState(false);

    const isExpanded = !isCollapsed || isHovered;

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
                <aside
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`
                        shrink-0 border-r border-border bg-sidebar-bg text-sidebar-text z-20 transition-all duration-300
                        sticky top-0 lg:h-[calc(100vh-3.5rem)] self-start
                        ${isSidebarOpen ? 'fixed inset-0 lg:relative' : 'hidden lg:flex lg:flex-col'}
                        ${isExpanded ? 'lg:w-56' : 'lg:w-[64px]'}
                    `}
                >
                    <div className="h-full flex flex-col p-2">
                        {/* Sidebar Header with Pin Button */}
                        <div className={`flex items-center py-2 px-2.5 border-b border-border mb-2.5 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                            {isExpanded && (
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="p-1.5 bg-orange-500/35 text-orange-300 rounded-full flex-shrink-0">
                                        <Clock className="h-4 w-4 stroke-[2.5]" />
                                    </div>
                                    <span className="font-extrabold text-sm truncate">Attendance Hub</span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={toggleCollapsed}
                                className="hidden lg:flex items-center justify-center p-1.5 rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-muted/60 transition-colors flex-shrink-0 cursor-pointer"
                                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                            >
                                {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                            </button>
                        </div>

                        {isExpanded && (
                            <button
                                type="button"
                                onClick={() => navigate('/hrdashboard')}
                                className="flex items-center gap-2 text-xs font-bold text-sidebar-text/80 hover:text-sidebar-text hover:bg-white/10 px-2.5 py-1.5 rounded-xl transition-all mb-2 cursor-pointer"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
                            </button>
                        )}

                        <nav className="space-y-1.5 flex-1 overflow-y-auto no-scrollbar px-1">
                            {attendanceNavLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = activeTab === link.id;
                                return (
                                    <button
                                        key={link.id}
                                        onClick={() => {
                                            navigate(`/attendance/${link.id}`);
                                            setIsSidebarOpen(false);
                                        }}
                                        title={!isExpanded ? link.name : undefined}
                                        className={`
                                            w-full flex items-center gap-3 py-2 rounded-xl text-xs font-bold transition-all text-left group
                                            ${isActive
                                                ? 'bg-primary text-primary-foreground shadow-2xs font-extrabold'
                                                : 'text-foreground-muted hover:text-foreground hover:bg-background-muted/60'
                                            }
                                            ${!isExpanded ? 'justify-center px-0' : 'px-2.5'}
                                        `}
                                    >
                                        <div className={`p-1.5 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : (link.iconBg || 'bg-slate-500/35 text-slate-300')}`}>
                                            <Icon className="h-4 w-4 stroke-[2.5]" />
                                        </div>
                                        {isExpanded && <span className="truncate flex-1 font-bold">{link.name}</span>}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="pt-2 border-t border-border mt-2">
                            <button
                                onClick={handleRunAutoAbsentTask}
                                disabled={isSyncing}
                                title={!isExpanded ? "Auto-Mark Absent Task" : undefined}
                                className={`w-full flex items-center justify-center ${!isExpanded ? 'px-1' : 'gap-2 px-2.5'} py-2 rounded-xl bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 transition-colors font-bold text-xs`}
                            >
                                {isSyncing ? <Loader className="animate-spin h-4 w-4 shrink-0" /> : <RefreshCw className="h-4 w-4 stroke-[2.5] shrink-0" />}
                                {isExpanded && <span className="truncate font-bold">{isSyncing ? 'Processing...' : 'Auto-Absent Task'}</span>}
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

