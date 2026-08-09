import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Clock,
    Calendar,
    DollarSign,
    LogOut,
    Sparkles,
    Menu,
    Loader,
    AlertCircle,
    ChevronDown,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
    User
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardView from '../components/EmpPages/DashboardView';
import PayrollView from '../components/EmpPages/PayrollView';
import axios from 'axios';
import RecruitmentView from '../components/EmpPages/RecruitmentView';
import AttendanceView from '../components/EmpPages/AttendanceView';
import Leaves from '../components/EmpPages/Leaves';
import { useTenant } from '../context/TenantContext';
import NotificationBell from '../components/notifications/NotificationBell';

const navLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, Component: DashboardView, module: 'HRMS_CORE', color: 'text-sky-400' },
    { name: 'Attendance', icon: Clock, Component: AttendanceView, module: 'HRMS_ATTENDANCE', color: 'text-amber-400' },
    { name: 'Leaves', icon: Calendar, Component: Leaves, module: 'HRMS_LEAVE', color: 'text-emerald-400' },
    { name: 'Payroll', icon: DollarSign, Component: PayrollView, module: 'HRMS_PAYROLL', color: 'text-indigo-400' },
    { name: 'Recruitment', icon: DollarSign, Component: RecruitmentView, module: 'HRMS_RECRUITMENT', color: 'text-purple-400' }
];

const NavItem = ({ item, isActive, onClick, isCollapsed }) => (
    <button
        onClick={onClick}
        title={isCollapsed ? item.name : ''}
        className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 text-sm font-medium rounded-xl transition-all duration-200 w-full text-left mb-1 group ${
            isActive
                ? 'bg-sidebar-active/20 text-white shadow-sm font-semibold border-l-4 border-primary'
                : 'text-sidebar-text/80 hover:bg-sidebar-hover hover:text-sidebar-text'
        }`}
    >
        <item.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${item.color} ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'} ${isCollapsed ? '' : 'mr-3'}`} />
        {!isCollapsed && <span className="truncate">{item.name}</span>}
    </button>
);

const SidebarContent = ({ activeItem, setActiveItem, onLinkClick, accessibleNavLinks, isCollapsed }) => {
    return (
        <div className="flex flex-col h-full bg-sidebar-bg text-sidebar-text shrink-0">
            {/* Header */}
            <div className="h-14 flex items-center px-4 shrink-0 border-b border-white/10 justify-between">
                <Link to="/employee-dashboard" className="flex items-center gap-2 overflow-hidden">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-md shrink-0">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-base tracking-tight truncate text-white">Employee Portal</span>
                            <span className="text-[10px] text-white/60 -mt-1 uppercase tracking-wider">EmiratesERP</span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
                {accessibleNavLinks.map((item) => (
                    <NavItem 
                        key={item.name} 
                        item={item} 
                        isActive={activeItem === item.name}
                        isCollapsed={isCollapsed}
                        onClick={() => {
                            setActiveItem(item.name);
                            if (onLinkClick) onLinkClick();
                        }} 
                    />
                ))}
            </nav>
        </div>
    );
};

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(() => {
        return localStorage.getItem('emp_sidebar_collapsed') === 'true';
    });

    const toggleDesktopSidebar = () => {
        setIsDesktopSidebarCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('emp_sidebar_collapsed', String(next));
            return next;
        });
    };

    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const username = localStorage.getItem('username') || 'Employee';
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const { hasModule } = useTenant();
    const roles = useMemo(() => JSON.parse(localStorage.getItem('roles') || '[]'), []);

    useEffect(() => {
        const checkCrmAccess = async () => {
            if (roles.includes('MANAGER') || roles.includes('EMPLOYEE')) {
                try {
                    const token = localStorage.getItem('token');
                    if (token) {
                        const permRes = await axios.get(`${API_URL}/crm/roles/my-permissions`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const perms = permRes.data?.permissions;
                        if (perms && Object.keys(perms).length > 0) {
                            navigate('/crm-dashboard/home');
                        }
                    }
                } catch (permErr) {
                    console.error("Failed to check CRM roles on dashboard mount:", permErr);
                }
            }
        };
        checkCrmAccess();
    }, [API_URL, navigate, roles]);

    const accessibleNavLinks = useMemo(() => {
        const hasAllAccessPlan =
            hasModule('HRMS_CORE') &&
            hasModule('HRMS_ATTENDANCE') &&
            hasModule('HRMS_LEAVE') &&
            hasModule('HRMS_PAYROLL') &&
            hasModule('POS');

        if (hasAllAccessPlan) {
            return navLinks;
        }

        return navLinks.filter(link => !link.module || hasModule(link.module));
    }, [hasModule]);

    const [activeItem, setActiveItem] = useState('Dashboard');

    useEffect(() => {
        const isCurrentActiveItemAccessible = accessibleNavLinks.some(link => link.name === activeItem);
        if (!isCurrentActiveItemAccessible) setActiveItem('Dashboard');
    }, [accessibleNavLinks, activeItem]);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!username) {
                    setError("No user found. Please log in again.");
                    setLoading(false);
                    return;
                }
                const response = await axios.get(`${API_URL}/employees/by-user-email/${username}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                localStorage.setItem('employeeCode', response.data.employeeCode);

                const employeeData = {
                    attendance: {
                        today: { checkIn: '09:30 AM', status: 'PRESENT' },
                        workHours: '4h 30m'
                    },
                    leaveBalance: { sick: 5, casual: 10, earned: 8 },
                    ...response.data,
                    leaves: response.data.leaves || [],
                };
                setEmployee(employeeData);
            } catch (err) {
                console.error("Error fetching employee data:", err);
                if (err.response?.status === 404) {
                    setError('Your employee profile could not be found. Please contact HR.');
                } else {
                    setError('Could not load your dashboard data. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeData();
    }, [username, API_URL]);

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
    };

    const renderContent = () => {
        const activeLink = accessibleNavLinks.find(link => link.name === activeItem) || accessibleNavLinks[0];
        
        if (!activeLink) {
            return <div className="p-8 text-center text-foreground-muted">No modules are accessible for your account. Please contact support.</div>;
        }

        const Component = activeLink.Component;
        return <Component setActiveItem={setActiveItem} employee={employee} key={activeItem} />;
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex lg:flex-col lg:flex-shrink-0 ${isDesktopSidebarCollapsed ? 'w-[75px]' : 'w-[220px]'} bg-sidebar-bg text-sidebar-text z-40 shadow-xl transition-all duration-300 ease-in-out border-r border-white/10`}>
                <SidebarContent 
                    activeItem={activeItem} 
                    setActiveItem={setActiveItem} 
                    accessibleNavLinks={accessibleNavLinks} 
                    isCollapsed={isDesktopSidebarCollapsed}
                />
                
                {/* Desktop Footer Toggle */}
                <div className="p-3 border-t border-white/10 flex items-center justify-center shrink-0 mt-auto">
                    <button onClick={toggleDesktopSidebar} className="text-sidebar-text/70 hover:text-sidebar-text hover:bg-white/10 p-2 rounded-xl transition-colors w-full flex justify-center items-center">
                        {isDesktopSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header Navigation Bar */}
                <header className="flex-shrink-0 h-14 bg-header-bg text-header-text shadow-sm border-b border-border flex items-center justify-between px-4 lg:px-6 z-30 relative">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            type="button"
                            className="text-foreground-muted hover:text-foreground hover:bg-background-muted p-2 rounded-lg lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="hidden md:flex relative w-full max-w-md items-center">
                            <Search className="absolute left-3 h-4 w-4 text-foreground-muted" />
                            <input
                                type="text"
                                placeholder="Search leaves, payslips, attendance logs..."
                                className="w-full pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                            />
                        </div>
                    </div>

                    {/* Right side header tools */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        {/* Notification Bell Component */}
                        <NotificationBell />

                        <div className="w-px h-6 bg-border hidden sm:block"></div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 cursor-pointer hover:bg-black/5 p-1 rounded-lg transition-colors border border-transparent">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0 border border-primary/20">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-xs font-bold text-foreground leading-tight">{employee?.firstName ? `${employee.firstName} ${employee.lastName || ''}` : username}</span>
                                <span className="text-[10px] text-foreground-muted font-medium">{employee?.jobDetails?.designation || 'Software Developer'}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="text-foreground-muted hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors ml-1"
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                {/* Scrollable View Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background-muted no-scrollbar">
                    {loading ? (
                        <div className="p-8 flex justify-center items-center h-full">
                            <Loader className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="p-8 flex justify-center items-center h-full">
                            <div className="text-center text-red-600">
                                <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                                <h3 className="mt-2 text-lg font-medium">Something went wrong</h3>
                                <p className="mt-1 text-sm">{error}</p>
                            </div>
                        </div>
                    ) : employee ? (
                        renderContent()
                    ) : (
                        <div className="p-8 bg-background-muted text-foreground-muted">No employee data found.</div>
                    )}
                </main>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 h-full w-[230px] z-50 bg-sidebar-bg text-sidebar-text shadow-2xl flex flex-col"
                        >
                            <SidebarContent 
                                activeItem={activeItem} 
                                setActiveItem={setActiveItem} 
                                accessibleNavLinks={accessibleNavLinks}
                                onLinkClick={() => setSidebarOpen(false)}
                                isCollapsed={false}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeeDashboard;
