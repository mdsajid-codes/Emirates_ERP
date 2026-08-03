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
    { id: 'requests', name: 'Leave Requests', icon: FileClock, iconBg: 'bg-amber-500/35 text-amber-300', component: AllLeaveRequests },
    { id: 'balances', name: 'Leave Balances', icon: UserCheck, iconBg: 'bg-emerald-500/35 text-emerald-300', component: LeaveBalancesSection },
    { id: 'sick-leave', name: 'Sick Leave', icon: HeartPulse, iconBg: 'bg-rose-500/35 text-rose-300', component: (props) => <SickLeaveManagement embedded {...props} /> },
    { id: 'types', name: 'Leave Types', icon: BookCopy, iconBg: 'bg-purple-500/35 text-purple-300', component: (props) => <LeaveType embedded {...props} /> },
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
        const stored = localStorage.getItem('leave_sidebar_collapsed');
        return stored === null ? true : stored === 'true';
    });
    const [isHovered, setIsHovered] = useState(false);

    const isExpanded = !isCollapsed || isHovered;

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
                                    <div className="p-1.5 bg-amber-500/35 text-amber-300 rounded-full flex-shrink-0">
                                        <FileClock className="h-4 w-4 stroke-[2.5]" />
                                    </div>
                                    <span className="font-extrabold text-sm truncate">Leave Hub</span>
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
                            {leaveNavLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = activeNavLink.id === link.id;
                                return (
                                    <button
                                        key={link.id}
                                        onClick={() => {
                                            navigate(`/leave/${link.id}`);
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