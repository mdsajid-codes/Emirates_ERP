import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Users, CalendarClock, Calendar, DollarSign, ShieldCheck, Menu, X, PanelLeftClose, PanelLeftOpen, BarChart3, Search, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const reportCategories = [
    { id: 'employee', name: 'Employee Reports', href: '/reports/employee', icon: Users, iconBg: 'bg-sky-500/35 text-sky-300' },
    { id: 'attendance', name: 'Attendance Reports', href: '/reports/attendance', icon: CalendarClock, iconBg: 'bg-orange-500/35 text-orange-300' },
    { id: 'leave', name: 'Leave Reports', href: '/reports/leave', icon: Calendar, iconBg: 'bg-amber-500/35 text-amber-300' },
    { id: 'payroll', name: 'Payroll Reports', href: '/reports/payroll', icon: DollarSign, iconBg: 'bg-emerald-500/35 text-emerald-300' },
    { id: 'eos', name: 'End of Service', href: '/reports/eos', icon: Users, iconBg: 'bg-rose-500/35 text-rose-300' },
    { id: 'compliance', name: 'HR Compliance', href: '/reports/compliance', icon: ShieldCheck, iconBg: 'bg-purple-500/35 text-purple-300' },
];

const ReportsLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const stored = localStorage.getItem('reports_sidebar_collapsed');
        return stored === null ? true : stored === 'true';
    });
    const [isHovered, setIsHovered] = useState(false);

    const isExpanded = !isCollapsed || isHovered;

    const toggleCollapsed = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('reports_sidebar_collapsed', String(next));
            return next;
        });
    };

    const headerSearchElement = (
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
            <input
                type="text"
                placeholder="Search reports by employee, code, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
            />
        </div>
    );

    return (
        <DashboardLayout hideSidebar={true} headerSearch={headerSearchElement}>
            <div className="flex flex-col lg:flex-row min-h-full flex-1 w-full bg-background text-foreground">

                {/* Mobile menu header */}
                <div className="lg:hidden flex items-center justify-between p-3 border-b border-border bg-sidebar-bg text-sidebar-text">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-rose-500/35 text-rose-300 rounded-full">
                            <BarChart3 className="h-4 w-4 stroke-[2.5]" />
                        </div>
                        <span className="font-bold text-sm">Reports Hub</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 rounded-lg border border-border bg-background text-foreground hover:bg-backgroundmuted"
                    >
                        {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>

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
                        {/* Sidebar Header with Pin Toggle Button */}
                        <div className={`flex items-center py-2 px-2.5 border-b border-border mb-2.5 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                            {isExpanded && (
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="p-1.5 bg-rose-500/35 text-rose-300 rounded-full flex-shrink-0">
                                        <BarChart3 className="h-4 w-4 stroke-[2.5]" />
                                    </div>
                                    <span className="font-extrabold text-sm truncate">Reports Hub</span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={toggleCollapsed}
                                className="hidden lg:flex items-center justify-center p-1.5 rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-muted/60 transition-colors flex-shrink-0 cursor-pointer"
                                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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

                        {/* Category Navigation Links */}
                        <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar px-1">
                            {reportCategories.map((category) => {
                                const isActive = location.pathname.startsWith(category.href);
                                const Icon = category.icon;
                                return (
                                    <NavLink
                                        key={category.id}
                                        to={category.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        title={!isExpanded ? category.name : undefined}
                                        className={`
                                            flex items-center gap-3 py-2 rounded-xl text-xs font-bold transition-all group
                                            ${isActive
                                                ? 'bg-primary text-primary-foreground shadow-2xs font-extrabold'
                                                : 'text-foreground-muted hover:text-foreground hover:bg-background-muted/60'}
                                            ${!isExpanded ? 'justify-center px-0' : 'px-2.5'}
                                        `}
                                    >
                                        <div className={`p-1.5 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : (category.iconBg || 'bg-slate-500/35 text-slate-300')}`}>
                                            <Icon className="h-4 w-4 stroke-[2.5]" />
                                        </div>
                                        {isExpanded && <span className="truncate font-bold">{category.name}</span>}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 p-3 lg:p-4 bg-background overflow-y-auto">
                    <Outlet context={{ searchTerm }} />
                </main>
            </div>
        </DashboardLayout>
    );
};

export default ReportsLayout;
