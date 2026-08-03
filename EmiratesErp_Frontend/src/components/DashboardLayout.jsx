import React, { useState, useMemo, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Home,
    LayoutDashboard,
    Users,
    ShieldCheck,
    BarChart2,
    LogOut,
    Sparkles,
    Menu,
    CalendarClock,
    DollarSign,
    Search,
    Bell,
    ChevronDown,
    Building2,
    MapPin,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';
import { AnimatePresence, motion } from "framer-motion";
import { useTenant } from "../context/TenantContext.jsx";
import { logout } from '../utils/logout';

const navLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/hrdashboard', module: 'HRMS_CORE', iconBg: 'bg-sky-500/35 text-sky-300' },
    { name: 'Employees', icon: Users, href: '/employees', module: 'HRMS_CORE', iconBg: 'bg-blue-500/35 text-blue-300' },
    { name: 'Attendance', icon: CalendarClock, href: '/attendance', module: 'HRMS_ATTENDANCE', iconBg: 'bg-orange-500/35 text-orange-300' },
    { name: 'Leave', icon: CalendarClock, href: '/leave', module: 'HRMS_LEAVE', iconBg: 'bg-amber-500/35 text-amber-300' },
    { name: 'Payroll Management', icon: DollarSign, href: '/payroll-management', module: 'HRMS_PAYROLL', iconBg: 'bg-emerald-500/35 text-emerald-300' },
    { name: 'Users', icon: ShieldCheck, href: '/users-details', iconBg: 'bg-purple-500/35 text-purple-300' },
    { name: 'Reports', icon: BarChart2, href: '/reports', iconBg: 'bg-rose-500/35 text-rose-300' },
];

const NavItem = ({ item, onClick, isCollapsed }) => (
    <NavLink
        to={item.href}
        onClick={onClick}
        title={isCollapsed ? item.name : ''}
        className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2 text-sm font-medium rounded-xl transition-all duration-200 mb-1.5 group ${
                isActive ? 'bg-sidebar-active/20 shadow-2xs font-bold' : 'hover:bg-sidebar-hover'
            }`
        }
    >
        {({ isActive }) => (
            <>
                <div className={`p-1.5 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${item.iconBg || 'bg-slate-500/35 text-slate-300'} ${isCollapsed ? '' : 'mr-3'}`}>
                    <item.icon className="h-4.5 w-4.5 stroke-[2.5] transition-transform group-hover:scale-110" />
                </div>
                {!isCollapsed && <span className={`${isActive ? 'text-sidebar-text font-bold' : 'text-sidebar-text/80 group-hover:text-sidebar-text'}`}>{item.name}</span>}
            </>
        )}
    </NavLink>
);

const SidebarContent = ({ onLinkClick, isCollapsed }) => {
    const roles = useMemo(() => JSON.parse(localStorage.getItem('roles') || '[]'), []);
    const isSuperAdmin = useMemo(() => roles.includes('SUPER_ADMIN'), [roles]);
    const { hasModule } = useTenant();

    const accessibleNavLinks = useMemo(() => {
        return navLinks.filter(link => !link.module || hasModule(link.module));
    }, [hasModule]);

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-sidebar-bg text-sidebar-text">
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
                {accessibleNavLinks.map((item) => (
                    <NavItem key={item.name} item={item} onClick={onLinkClick} isCollapsed={isCollapsed} />
                ))}
                {isSuperAdmin && (
                    <div className="pt-4 mt-4 border-t border-white/10">
                        <NavItem item={{ name: 'Company Hub', icon: Home, href: '/company-dashboard', iconBg: 'bg-indigo-500/35 text-indigo-300' }} onClick={onLinkClick} isCollapsed={isCollapsed} />
                    </div>
                )}
            </nav>
        </div>
    );
};

// Extracted from CompanyHubLayout for logo fallback
const constructImageUrl = (relativeUrl) => {
    if (!relativeUrl) return '';
    if (relativeUrl.startsWith('data:') || relativeUrl.startsWith('http')) return relativeUrl;
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const cleanPath = relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl;
    if (cleanPath.startsWith('uploads/')) {
        return `${API_URL}/pos/uploads/view/${cleanPath.replace('uploads/', '')}`;
    }
    return `${API_URL}/pos/uploads/view/${cleanPath}`;
};

const DashboardLayout = ({ children, hideSidebar = false, headerSearch = null, headerExtra = null, hideHeaderSearch = false }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(() => {
        const stored = localStorage.getItem('sidebar_collapsed');
        return stored === null ? true : stored === 'true';
    });
    const [isHovered, setIsHovered] = useState(false);

    const isExpanded = !isDesktopSidebarCollapsed || isHovered;

    const toggleDesktopSidebar = (e) => {
        if (e) e.stopPropagation();
        setIsDesktopSidebarCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('sidebar_collapsed', String(next));
            return next;
        });
    };

    const navigate = useNavigate();
    const handleLogout = () => logout(navigate);
    const username = localStorage.getItem('username') || 'Admin';

    const [companyInfo, setCompanyInfo] = useState({ name: 'Enterprise HRMS', logoPath: null, logoBlob: null });
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const cachedName = sessionStorage.getItem('company_name');
        const cachedLogo = sessionStorage.getItem('company_logo');

        if (cachedName && cachedName !== 'Enterprise HRMS') {
            setCompanyInfo({ name: cachedName, logoPath: null, logoBlob: cachedLogo || null });
            return;
        }

        const fetchCompanyInfo = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get(`${API_URL}/company-info`, { headers });

                const realName = res.data.companyName;
                const companyName = realName || 'Enterprise HRMS';

                if (realName) {
                    sessionStorage.setItem('company_name', realName);
                }

                const rawLogoUrl = res.data.logoUrl;
                if (rawLogoUrl) {
                    if (rawLogoUrl.startsWith('http://') || rawLogoUrl.startsWith('https://')) {
                        sessionStorage.setItem('company_logo', rawLogoUrl);
                        setCompanyInfo({ name: companyName, logoPath: rawLogoUrl, logoBlob: rawLogoUrl });
                        return;
                    }
                    try {
                        const logoRes = await axios.get(`${API_URL}/company-info/logo`, { headers, responseType: 'blob' });
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const logoDataUrl = reader.result;
                            sessionStorage.setItem('company_logo', logoDataUrl);
                            setCompanyInfo({ name: companyName, logoPath: rawLogoUrl, logoBlob: logoDataUrl });
                        };
                        reader.readAsDataURL(logoRes.data);
                        return;
                    } catch (imgErr) { console.error('Failed to fetch company logo blob', imgErr); }
                }
                setCompanyInfo({ name: companyName, logoPath: rawLogoUrl, logoBlob: null });
            } catch (err) { console.error('Failed to fetch company info for layout', err); }
        };
        fetchCompanyInfo();
    }, [API_URL]);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Desktop Sidebar with Hover Expand */}
            {!hideSidebar && (
                <aside
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`hidden lg:flex lg:flex-col lg:flex-shrink-0 ${isExpanded ? 'w-[220px]' : 'w-[72px]'} bg-sidebar-bg text-sidebar-text z-40 shadow-xl transition-all duration-300 ease-in-out`}
                >
                    {/* Sidebar Header (Company Info & Pin Button) */}
                    <div className={`h-14 flex items-center px-4 shrink-0 border-b border-white/10 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                        <Link to="/company-dashboard" className="flex items-center gap-2 overflow-hidden">
                            <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold shadow-sm shrink-0">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            {isExpanded && (
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-extrabold text-sm truncate">Company Hub</span>
                                </div>
                            )}
                        </Link>
                        <button
                            type="button"
                            onClick={toggleDesktopSidebar}
                            className="hidden lg:flex items-center justify-center p-1.5 rounded-xl opacity-70 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer flex-shrink-0"
                            title={isDesktopSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {isDesktopSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <SidebarContent isCollapsed={!isExpanded} />
                </aside>
            )}

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Header (Right Side) */}
                <header className="flex-shrink-0 h-14 bg-header-bg text-header-text shadow-sm border-b border-border flex items-center justify-between px-4 lg:px-6 z-30 relative">

                    {/* Left side of header (Mobile Menu + Search) */}
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        {!hideHeaderSearch && (
                            headerSearch ? (
                                <div className="flex items-center gap-2 flex-1 max-w-xl">
                                    {headerSearch}
                                </div>
                            ) : (
                                <div className="hidden md:flex relative w-full max-w-md items-center">
                                    <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search anything..."
                                        className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                                    />
                                </div>
                            )
                        )}
                    </div>

                    {/* Right side of header (Dropdowns, Notification, User) */}
                    <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                        {headerExtra}

                        {/* Notification Bell */}
                        <button className="relative p-2 text-foreground-muted hover:text-foreground hover:bg-black/5 rounded-full transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="w-px h-6 bg-border hidden sm:block"></div>

                        {/* User Profile Dropdown */}
                        <div className="flex items-center gap-3 cursor-pointer hover:bg-black/5 p-1.5 rounded-lg transition-colors border border-transparent hover:border-border">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0 border border-primary/20">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-sm font-bold text-foreground leading-tight">{username}</span>
                                <span className="text-xs text-foreground-muted">Administrator</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-foreground-muted hidden sm:block" />
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

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background no-scrollbar">
                    {children}
                </main>

            </div>

            {/* Mobile menu overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 h-full w-[220px] z-50 bg-sidebar-bg text-sidebar-text shadow-2xl flex flex-col"
                        >
                            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center font-bold text-primary-foreground">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <span className="font-bold text-lg">{companyInfo.name}</span>
                                </div>
                                <button onClick={() => setSidebarOpen(false)} className="p-2 text-sidebar-text/70 hover:text-sidebar-text hover:bg-white/10 rounded-lg">
                                    <Menu className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardLayout;