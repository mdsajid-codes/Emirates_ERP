import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    CalendarOff,
    Banknote,
    Briefcase,
    Settings,
    LogOut,
    Menu,
    Home,
    Sparkles,
    Shield,
    BarChart,
    LogOut as LogOutIcon,
    Menu as MenuIcon,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHrmsTheme } from './useHrmsTheme';
import HrmsDashboardView from './HrmsDashboardView';

// Placeholders for other views
const EmployeesView = () => <div className="p-6">Employees View</div>;
const AttendanceView = () => <div className="p-6">Attendance View</div>;
const LeavesView = () => <div className="p-6">Leaves View</div>;
const PayrollView = () => <div className="p-6">Payroll Management View</div>;
const UsersView = () => <div className="p-6">Users View</div>;
const ReportsView = () => <div className="p-6">Reports View</div>;
const CompanyHubView = () => <div className="p-6">Company Hub View</div>;

const navLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, Component: HrmsDashboardView, iconBg: 'bg-sky-500/35 text-sky-300' },
    { name: 'Employees', icon: Users, Component: EmployeesView, iconBg: 'bg-blue-500/35 text-blue-300' },
    { name: 'Attendance', icon: CalendarCheck, Component: AttendanceView, iconBg: 'bg-orange-500/35 text-orange-300' },
    { name: 'Leave', icon: CalendarOff, Component: LeavesView, iconBg: 'bg-amber-500/35 text-amber-300' },
    { name: 'Payroll Management', icon: Banknote, Component: PayrollView, iconBg: 'bg-emerald-500/35 text-emerald-300' },
    { name: 'Users', icon: Shield, Component: UsersView, iconBg: 'bg-purple-500/35 text-purple-300' },
    { name: 'Reports', icon: BarChart, Component: ReportsView, iconBg: 'bg-rose-500/35 text-rose-300' },
];

const HrmsDashboard = () => {
    const { hrmsTheme } = useHrmsTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeItem = searchParams.get('view') || 'Dashboard';
    const navigate = useNavigate();

    const username = localStorage.getItem('username') || 'sajid@star.in';

    const roles = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('roles') || '[]');
        } catch { return []; }
    }, []);
    const isSuperAdmin = roles.includes('SUPER_ADMIN');

    const isExpanded = !isDesktopCollapsed || isHovered;

    const setActiveItem = (itemName) => {
        setSearchParams({ view: itemName });
        setSidebarOpen(false);
    };

    useEffect(() => {
        if (!searchParams.get('view')) {
            setSearchParams({ view: 'Dashboard' }, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const renderContent = () => {
        const allLinks = [...navLinks, { name: 'Company Hub', Component: CompanyHubView }];
        const activeLink = allLinks.find(link => link.name === activeItem) || navLinks[0];
        const Component = activeLink.Component;
        return <Component key={activeItem} setActiveItem={setActiveItem} />;
    };

    const SidebarNav = ({ isCollapsedMode = false }) => (
        <div className="flex flex-col h-full bg-[#1E293B] border-r border-[#0F172A] text-gray-300 font-sans select-none overflow-y-auto no-scrollbar">
            {/* Header section with pin toggle button matching POS position */}
            <div className={`flex items-center py-3 px-3.5 border-b border-slate-700/50 ${isCollapsedMode ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <Sparkles className="h-4 w-4 text-white fill-current" />
                    </div>
                    {!isCollapsedMode && (
                        <span className="text-sm font-extrabold text-white tracking-tight truncate">Enterprise HRMS</span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsDesktopCollapsed(prev => !prev);
                    }}
                    className="hidden lg:flex items-center justify-center p-1.5 rounded-xl opacity-80 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer flex-shrink-0"
                    title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isDesktopCollapsed ? <PanelLeftOpen className="h-5 w-5 text-gray-300" /> : <PanelLeftClose className="h-5 w-5 text-gray-300" />}
                </button>
            </div>

            <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto no-scrollbar">
                {navLinks.map((item) => {
                    const isActive = activeItem === item.name;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.name}
                            onClick={() => setActiveItem(item.name)}
                            title={isCollapsedMode ? item.name : undefined}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all group ${
                                isCollapsedMode ? 'justify-center px-0' : ''
                            } ${
                                isActive 
                                    ? 'bg-[#334155] text-white font-bold shadow-2xs' 
                                    : 'text-gray-300 hover:bg-[#334155]/50 hover:text-white'
                            }`}
                        >
                            <div className={`p-1.5 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${item.iconBg || 'bg-slate-500/35 text-slate-300'}`}>
                                <Icon className="h-4.5 w-4.5 stroke-[2.5]" />
                            </div>
                            {!isCollapsedMode && <span className="font-bold truncate">{item.name}</span>}
                        </button>
                    );
                })}

                <div className="pt-4 mt-4 border-t border-slate-700/50">
                    <button
                        onClick={() => setActiveItem('Company Hub')}
                        title={isCollapsedMode ? 'Company Hub' : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all group ${
                            isCollapsedMode ? 'justify-center px-0' : ''
                        } ${
                            activeItem === 'Company Hub'
                                ? 'bg-[#334155] text-white font-bold shadow-2xs' 
                                : 'text-gray-300 hover:bg-[#334155]/50 hover:text-white'
                        }`}
                    >
                        <div className="p-1.5 rounded-full flex items-center justify-center bg-indigo-500/35 text-indigo-300 flex-shrink-0">
                            <Home className="h-4.5 w-4.5 stroke-[2.5]" />
                        </div>
                        {!isCollapsedMode && <span className="font-bold truncate">Company Hub</span>}
                    </button>
                </div>
            </nav>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F3F4F6] font-sans flex flex-col">
            {/* Top Full-Width Header */}
            <header className="h-[64px] bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-20 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <MenuIcon className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-[#1E1B4B]" />
                        <span className="text-lg font-bold text-gray-900 tracking-tight">Enterprise HRMS</span>
                        <span className="hidden sm:inline-flex ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-md">
                            HRMS
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{username}</p>
                        <p className="text-[11px] font-medium text-gray-500">Administrator</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-900 font-bold text-sm shadow-sm">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        title="Sign Out"
                    >
                        <LogOutIcon className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Collapsible Sidebar with Hover Expand */}
                <aside
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`hidden lg:block flex-shrink-0 z-10 bg-[#1E293B] transition-all duration-300 ease-in-out ${
                        isExpanded ? 'w-64' : 'w-[68px]'
                    }`}
                >
                    <SidebarNav isCollapsedMode={!isExpanded} />
                </aside>

                {/* Mobile Drawer */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                                onClick={() => setSidebarOpen(false)}
                            />
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="fixed top-0 left-0 h-full w-64 z-50 overflow-hidden bg-[#1E293B]"
                            >
                                <div className="h-[64px] border-b border-slate-700/50 flex items-center px-6">
                                    <span className="text-lg font-bold text-white tracking-tight">Menu</span>
                                </div>
                                <div className="h-[calc(100%-64px)]">
                                    <SidebarNav isCollapsedMode={false} />
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default HrmsDashboard;

