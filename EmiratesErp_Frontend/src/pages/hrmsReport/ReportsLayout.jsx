import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Users, CalendarClock, Calendar, DollarSign, ShieldCheck, Menu, X, PanelLeftClose, PanelLeftOpen, BarChart3, Search } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const reportCategories = [
    { id: 'employee', name: 'Employee Reports', href: '/reports/employee', icon: Users },
    { id: 'attendance', name: 'Attendance Reports', href: '/reports/attendance', icon: CalendarClock },
    { id: 'leave', name: 'Leave Reports', href: '/reports/leave', icon: Calendar },
    { id: 'payroll', name: 'Payroll Reports', href: '/reports/payroll', icon: DollarSign },
    { id: 'eos', name: 'End of Service', href: '/reports/eos', icon: Users },
    { id: 'compliance', name: 'HR Compliance', href: '/reports/compliance', icon: ShieldCheck },
];

const ReportsLayout = () => {
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('reports_sidebar_collapsed') === 'true';
    });

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
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                            <BarChart3 className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-sm">Reports Hub</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 rounded-lg border border-border bg-background text-foreground hover:bg-background-muted"
                    >
                        {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>

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
                                        Reports Hub
                                    </h2>
                                )}
                                <button
                                    onClick={toggleCollapsed}
                                    className="hidden lg:flex p-1 rounded-md text-sidebar-text/70 hover:text-sidebar-text hover:bg-sidebar-hover transition-colors"
                                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                                >
                                    {isCollapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                        </div>

                        {/* Category Navigation Links */}
                        <nav className="flex-1 space-y-0.5 overflow-y-auto">
                            {reportCategories.map((category) => {
                                const isActive = location.pathname.startsWith(category.href);
                                return (
                                    <NavLink
                                        key={category.id}
                                        to={category.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        title={isCollapsed ? category.name : undefined}
                                        className={`
                                            flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors
                                            ${isActive
                                                ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                                                : 'text-sidebar-text/80 hover:bg-sidebar-hover hover:text-sidebar-text'}
                                            ${isCollapsed ? 'justify-center px-0' : ''}
                                        `}
                                    >
                                        <category.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-sidebar-text/70'}`} />
                                        {!isCollapsed && <span className="truncate">{category.name}</span>}
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
