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
        <DashboardLayout headerSearch={headerSearchElement} hideHeaderSearch={!showHeaderSearch}>
            <div className="flex flex-col lg:flex-row min-h-full flex-1 w-full bg-background text-foreground">

                {/* Sub-Sidebar (Matching #003E5B Navy Theme) */}
                <aside
                    className={`
                        shrink-0 border-r border-[#002D42] bg-[#003E5B] text-[#F2F5FA] z-20 transition-all duration-300
                        sticky top-0 lg:h-[calc(100vh-3.5rem)] self-start
                        ${isSidebarOpen ? 'fixed inset-0 lg:relative' : 'hidden lg:flex lg:flex-col'}
                        ${isExpanded ? 'lg:w-56' : 'lg:w-[80px]'}
                    `}
                >
                    <div className="h-full flex flex-col p-2">
                        {/* Sidebar Header */}
                        <div className={`flex items-center py-2 px-2.5 border-b border-white/10 mb-2.5 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                            {isExpanded ? (
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="p-1.5 bg-[#00A9A8] text-white rounded-full flex-shrink-0">
                                        <FileClock className="h-4 w-4 stroke-[2.5]" />
                                    </div>
                                    <span className="font-extrabold text-sm text-white truncate">Leave Hub</span>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={toggleCollapsed}
                                    className="p-1.5 rounded-xl text-[#F2F5FA]/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                    title="Expand Sidebar"
                                >
                                    <PanelLeftOpen className="h-5 w-5 text-white" />
                                </button>
                            )}
                            {isExpanded && (
                                <button
                                    type="button"
                                    onClick={toggleCollapsed}
                                    className="p-1.5 rounded-xl text-[#F2F5FA]/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                    title="Collapse Sidebar"
                                >
                                    <PanelLeftClose className="h-5 w-5 text-white" />
                                </button>
                            )}
                        </div>

                        {isExpanded && (
                            <button
                                type="button"
                                onClick={() => navigate('/hrdashboard')}
                                className="flex items-center gap-2 text-xs font-bold text-[#F2F5FA]/80 hover:text-white hover:bg-white/10 px-2.5 py-1.5 rounded-xl transition-all mb-2 cursor-pointer"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
                            </button>
                        )}

                        <nav className={`space-y-2 flex-1 overflow-y-auto no-scrollbar ${!isExpanded ? 'flex flex-col items-center' : 'px-1'}`}>
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
                                            transition-all duration-200 group cursor-pointer
                                            ${!isExpanded
                                                ? `flex flex-col items-center justify-center py-2 px-1 rounded-[8px] w-[64px] h-[51.75px] ${isActive ? 'bg-[#00A9A8] text-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)] font-semibold' : 'text-[#F2F5FA] hover:bg-white/10 opacity-90'}`
                                                : `w-full flex items-center gap-3 py-2.5 px-3 rounded-[8px] text-xs font-semibold ${isActive ? 'bg-[#00A9A8] text-white shadow-xs' : 'text-[#F2F5FA] hover:bg-white/10'}`
                                            }
                                        `}
                                    >
                                        <Icon className={`h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#F2F5FA]'}`} />
                                        {isExpanded ? (
                                            <span className="truncate flex-1 text-left font-medium">{link.name}</span>
                                        ) : (
                                            <span className={`text-[9px] leading-[14px] font-normal tracking-tight text-center mt-1 truncate max-w-full ${isActive ? 'text-white font-medium' : 'text-[#F2F5FA]'}`}>
                                                {link.name.split(' ')[0]}
                                            </span>
                                        )}
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