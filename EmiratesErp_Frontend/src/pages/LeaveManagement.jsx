import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LeaveBalancesSection, AllLeaveRequests } from '../components/leaveComponents/AllLeaveRequests';
import DashboardLayout from '../components/DashboardLayout';
import SickLeaveManagement from './hrms/SickLeaveManagement';
import LeaveType from '../components/base/LeaveType';
import {
    FileClock,
    UserCheck,
    HeartPulse,
    BookCopy,
    ArrowLeft,
    Menu,
    X,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
    RefreshCw
} from 'lucide-react';

const leaveNavLinks = [
    { id: 'requests', name: 'Leave Requests', icon: FileClock, color: 'text-amber-500', component: AllLeaveRequests },
    { id: 'balances', name: 'Leave Balances', icon: UserCheck, color: 'text-green-500', component: LeaveBalancesSection },
    { id: 'sick-leave', name: 'Sick Leave', icon: HeartPulse, color: 'text-rose-500', component: (props) => <SickLeaveManagement embedded {...props} /> },
    { id: 'types', name: 'Leave Types', icon: BookCopy, color: 'text-purple-500', component: (props) => <LeaveType embedded {...props} /> },
];

const LeaveManagement = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const pathParts = location.pathname.split('/').filter(Boolean);
    const queryParams = new URLSearchParams(location.search);
    const pathTab = pathParts.length > 1 ? pathParts[1].toLowerCase() : null;
    const queryTab = queryParams.get('tab')?.toLowerCase();

    const activeTabKey = pathTab || queryTab || 'requests';

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('leave_sidebar_collapsed') === 'true';
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isSyncingBalances, setIsSyncingBalances] = useState(false);

    const syncBalancesRef = useRef(null);

    const toggleCollapsed = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('leave_sidebar_collapsed', String(next));
            return next;
        });
    };

    const activeNavLink = leaveNavLinks.find(link =>
        link.id === activeTabKey || link.name.toLowerCase() === activeTabKey
    ) || leaveNavLinks[0];

    const ActiveComponent = activeNavLink.component;

    const showHeaderSearch = activeNavLink.id === 'requests' || activeNavLink.id === 'balances';

    const headerSearchElement = showHeaderSearch ? (
        <div className="flex items-center gap-2 w-full max-w-md">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search by employee..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
            </div>
            {activeNavLink.id === 'balances' && (
                <button
                    type="button"
                    onClick={() => syncBalancesRef.current?.()}
                    disabled={isSyncingBalances}
                    title="Sync All Balances"
                    className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0 disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${isSyncingBalances ? 'animate-spin' : ''}`} />
                </button>
            )}
        </div>
    ) : null;

    return (
        <DashboardLayout hideSidebar={true} headerSearch={headerSearchElement} hideHeaderSearch={!showHeaderSearch}>
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
                                        Leave Hub
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
                            {leaveNavLinks.map((link) => (
                                <button
                                    key={link.id}
                                    onClick={() => {
                                        navigate(`/leave/${link.id}`);
                                        setIsSidebarOpen(false);
                                    }}
                                    title={isCollapsed ? link.name : undefined}
                                    className={`
                                        w-full flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-2 px-2'} py-1.5 rounded-lg text-[11px] font-medium transition-colors group
                                        ${activeNavLink.id === link.id
                                            ? 'bg-sidebar-active text-sidebar-text font-bold shadow-2xs'
                                            : 'text-sidebar-text hover:bg-sidebar-hover opacity-80 hover:opacity-100'
                                        }
                                    `}
                                >
                                    <link.icon className={`h-3.5 w-3.5 flex-shrink-0 transition-colors group-hover:scale-105 ${activeNavLink.id === link.id ? 'text-sidebar-text' : link.color}`} />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">{link.name}</span>}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-background">
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
                            <ActiveComponent searchTerm={searchTerm} syncRef={syncBalancesRef} setIsSyncing={setIsSyncingBalances} />
                        </div>
                    </div>
                </main>
            </div>
        </DashboardLayout>
    );
};

export default LeaveManagement;