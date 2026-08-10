import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Building, Users, SlidersHorizontal, HandCoins, Receipt, Hand, Play, Menu, X, PanelLeftClose, PanelLeftOpen, ArrowLeft, Search } from 'lucide-react';
import CompanyInfo from '../components/payrollComponent/CompanyInfo';
import PayrollSettings from '../components/payrollComponent/PayrollSettings';
import EmployeePayroll from '../components/payrollComponent/EmployeePayroll';
import EmployeeDetails from '../components/payrollComponent/EmployeeDetails';
import PayrollRun from '../components/payrollComponent/PayrollRun';
import { useTenant } from '../context/TenantContext';
import AllLoanRequests from '../components/payrollComponent/AllLoanRequests';
import AllExpenseRequests from '../components/payrollComponent/AllExpenseRequests';

const allNavLinks = [
    { id: 'employee', name: 'Manage Employee Payroll', icon: HandCoins, component: EmployeePayroll, module: 'HRMS_PAYROLL', iconBg: 'bg-emerald-500/35 text-emerald-300' },
    { id: 'run', name: 'Payroll Run', icon: Play, component: PayrollRun, module: 'HRMS_PAYROLL', iconBg: 'bg-blue-500/35 text-blue-300' },
    { id: 'employee-details', name: 'Employee Details', icon: Users, component: EmployeeDetails, module: 'HRMS_CORE', iconBg: 'bg-sky-500/35 text-sky-300' },
    { id: 'loans', name: 'Loan Requests', icon: Hand, component: AllLoanRequests, module: 'HRMS_PAYROLL', iconBg: 'bg-amber-500/35 text-amber-300' },
    { id: 'expenses', name: 'Expense Requests', icon: Receipt, component: AllExpenseRequests, module: 'HRMS_PAYROLL', iconBg: 'bg-orange-500/35 text-orange-300' },
    { id: 'company-info', name: 'Company Info', icon: Building, component: CompanyInfo, iconBg: 'bg-indigo-500/35 text-indigo-300' },
    { id: 'settings', name: 'Settings', icon: SlidersHorizontal, component: PayrollSettings, iconBg: 'bg-slate-500/35 text-slate-300' },
];

const PayrollManagement = () => {
    const { hasModule } = useTenant();
    const location = useLocation();
    const navigate = useNavigate();

    const navLinks = useMemo(() => {
        return allNavLinks.filter(link => !link.module || hasModule(link.module));
    }, [hasModule]);

    const [searchTerm, setSearchTerm] = useState('');

    // Determine active tab from URL path (e.g. /payroll/run or /payroll-management/run) or query param
    const pathParts = location.pathname.split('/').filter(Boolean);
    const queryParams = new URLSearchParams(location.search);
    const pathTab = pathParts.length > 1 ? pathParts[1].toLowerCase() : null;
    const queryTab = queryParams.get('tab')?.toLowerCase();

    const activeTabKey = pathTab || queryTab || 'employee';

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const stored = localStorage.getItem('payroll_sidebar_collapsed');
        return stored === null ? true : stored === 'true';
    });
    const [isHovered, setIsHovered] = useState(false);

    const isExpanded = !isCollapsed || isHovered;

    const toggleCollapsed = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('payroll_sidebar_collapsed', String(next));
            return next;
        });
    };

    const activeNavLink = navLinks.find(link =>
        link.id === activeTabKey || link.name.toLowerCase() === activeTabKey
    ) || navLinks[0];

    const ActiveComponent = activeNavLink.component;

    const handleTabClick = (linkId) => {
        const basePath = location.pathname.startsWith('/payroll-management') ? '/payroll-management' : '/payroll';
        navigate(`${basePath}/${linkId}`);
        setIsSidebarOpen(false);
    };

    const isSearchableTab = activeNavLink.id === 'employee' || activeNavLink.id === 'employee-details' || activeNavLink.id === 'loans' || activeNavLink.id === 'expenses';

    const headerSearchElement = isSearchableTab ? (
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
                type="text"
                placeholder="Search by name or employee code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
            />
        </div>
    ) : null;

    return (
        <DashboardLayout hideSidebar={true} headerSearch={headerSearchElement} hideHeaderSearch={!isSearchableTab}>
            <div className="flex flex-col lg:flex-row min-h-full flex-1 w-full bg-background text-foreground">

                {/* Mobile menu header */}
                <div className="lg:hidden flex items-center justify-between p-3 border-b border-border bg-sidebar-bg text-sidebar-text">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-500/35 text-emerald-300 rounded-full">
                            <HandCoins className="h-4 w-4 stroke-[2.5]" />
                        </div>
                        <span className="font-bold text-sm">Payroll Hub</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 rounded-lg border border-border bg-background text-foreground hover:bg-background-muted"
                    >
                        {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>

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
                                        <HandCoins className="h-4 w-4 stroke-[2.5]" />
                                    </div>
                                    <span className="font-extrabold text-sm text-white truncate">Payroll Hub</span>
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
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = link.id === activeNavLink.id;
                                return (
                                    <button
                                        key={link.id}
                                        onClick={() => handleTabClick(link.id)}
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
                <main className="flex-1 p-3 lg:p-4 overflow-y-auto min-w-0 bg-background">
                    {ActiveComponent && <ActiveComponent searchTerm={searchTerm} />}
                </main>
            </div>
        </DashboardLayout>
    );
};

export default PayrollManagement;

