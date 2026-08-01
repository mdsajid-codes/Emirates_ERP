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
    { id: 'employee', name: 'Manage Employee Payroll', icon: HandCoins, component: EmployeePayroll, module: 'HRMS_PAYROLL' },
    { id: 'run', name: 'Payroll Run', icon: Play, component: PayrollRun, module: 'HRMS_PAYROLL' },
    { id: 'employee-details', name: 'Employee Details', icon: Users, component: EmployeeDetails, module: 'HRMS_CORE' },
    { id: 'loans', name: 'Loan Requests', icon: Hand, component: AllLoanRequests, module: 'HRMS_PAYROLL' },
    { id: 'expenses', name: 'Expense Requests', icon: Receipt, component: AllExpenseRequests, module: 'HRMS_PAYROLL' },
    { id: 'company-info', name: 'Company Info', icon: Building, component: CompanyInfo },
    { id: 'settings', name: 'Settings', icon: SlidersHorizontal, component: PayrollSettings },
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
        return localStorage.getItem('payroll_sidebar_collapsed') === 'true';
    });

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
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                            <HandCoins className="h-4 w-4" />
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
                                        Payroll Hub
                                    </h2>
                                )}
                                <button
                                    onClick={toggleCollapsed}
                                    className="hidden lg:flex p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-background-muted transition-colors ml-auto"
                                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                                >
                                    {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                                </button>
                            </div>
                            {!isCollapsed && (
                                <button
                                    onClick={() => navigate('/company-dashboard')}
                                    className="flex items-center gap-1 text-[11px] font-medium text-foreground-muted hover:text-primary transition-colors py-0.5"
                                >
                                    <ArrowLeft className="h-3 w-3" /> Back to Dashboard
                                </button>
                            )}
                        </div>

                        <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = link.id === activeNavLink.id;
                                return (
                                    <button
                                        key={link.id}
                                        onClick={() => handleTabClick(link.id)}
                                        title={isCollapsed ? link.name : undefined}
                                        className={`
                                            w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left
                                            ${isActive
                                                ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                                                : 'text-foreground-muted hover:text-foreground hover:bg-background-muted/60'
                                            }
                                            ${isCollapsed ? 'justify-center px-0' : ''}
                                        `}
                                    >
                                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-foreground-muted'}`} />
                                        {!isCollapsed && (
                                            <span className="truncate flex-1">{link.name}</span>
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
