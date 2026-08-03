import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../../utils/logout';
import {
    LayoutDashboard,
    Home,
    Phone,
    Users,
    Building,
    Contact,
    Activity,
    Handshake,
    ListTodo,
    Settings,
    LogOut,
    Menu,
    ArrowLeft,
    Package,
    Table,
    Sparkles,
    CalendarDays,
    PanelLeftOpen,
    PanelLeftClose,
    Headset
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import CrmReminderPoller from '../components/CrmReminderPoller';

import { useCrmPermissions } from '../context/CrmPermissionsContext';

const crmNavLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/crm-dashboard/dashboard', iconBg: 'bg-indigo-500/35 text-indigo-300', module: 'DASHBOARD' },
    { name: 'Home', icon: Home, href: '/crm-dashboard/home', iconBg: 'bg-emerald-500/35 text-emerald-300' },
    { name: 'Calling Data', icon: Phone, href: '/crm-dashboard/calling-data', iconBg: 'bg-amber-500/35 text-amber-300', module: 'CALL_LOG' },
    { name: 'Leads', icon: Users, href: '/crm-dashboard/leads', iconBg: 'bg-purple-500/35 text-purple-300', module: 'LEAD' },
    { name: 'Companies', icon: Building, href: '/crm-dashboard/companies', iconBg: 'bg-blue-500/35 text-blue-300', module: 'COMPANY' },
    { name: 'Contacts', icon: Contact, href: '/crm-dashboard/contacts', iconBg: 'bg-rose-500/35 text-rose-300', module: 'CONTACT' },
    { name: 'Products', icon: Package, href: '/crm-dashboard/products', iconBg: 'bg-teal-500/35 text-teal-300', module: 'PRODUCT' },
    { name: 'Deals', icon: Handshake, href: '/crm-dashboard/deals', iconBg: 'bg-orange-500/35 text-orange-300', module: 'DEAL' },
    { name: 'Tasks', icon: ListTodo, href: '/crm-dashboard/tasks', iconBg: 'bg-cyan-500/35 text-cyan-300', module: 'TASK' },
    { name: 'Calendar', icon: CalendarDays, href: '/crm-dashboard/calendar', iconBg: 'bg-pink-500/35 text-pink-300', module: 'EVENT' },
    { name: 'Operations', icon: Activity, href: '/crm-dashboard/operations', iconBg: 'bg-lime-500/35 text-lime-300', module: 'TODO' },
];

const SidebarContent = ({ onLinkClick, isCollapsedMode = false, isDesktopCollapsed = true, setIsDesktopCollapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { permissions, hasPermission } = useCrmPermissions();

    const handleLogout = () => logout(navigate);

    const NavItem = ({ item }) => {
        if (item.module && !hasPermission(item.module, 'view')) {
            return null;
        }

        return (
            <NavLink
                to={item.href}
                onClick={onLinkClick}
                end={item.href === '/crm-dashboard/dashboard' || item.href === '/crm-dashboard/home'}
                title={isCollapsedMode ? item.name : undefined}
                className={({ isActive }) =>
                    `flex items-center ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sm font-bold rounded-xl transition-all duration-200 mb-1 group ${
                        isActive ? 'bg-sidebar-active/20 text-sidebar-text shadow-sm' : 'text-sidebar-text/80 hover:text-sidebar-text hover:bg-sidebar-hover'
                    }`
                }
            >
                {({ isActive }) => (
                    <>
                        <div className={`p-1.5 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconBg || 'bg-slate-500/35 text-slate-300'}`}>
                            <item.icon className="h-4 w-4 stroke-[2.5] transition-transform group-hover:scale-110" />
                        </div>
                        {!isCollapsedMode && <span className={`ml-2.5 truncate ${isActive ? 'font-bold text-sidebar-text' : ''}`}>{item.name}</span>}
                    </>
                )}
            </NavLink>
        );
    };

    return (
        <div className="flex flex-col h-full bg-sidebar-bg text-sidebar-text select-none">
            {/* Header section with pin toggle button matching POS position */}
            <div className={`flex items-center py-3 px-3.5 border-b border-white/10 ${isCollapsedMode ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Headset className="h-4 w-4 text-white fill-current" />
                    </div>
                    {!isCollapsedMode && (
                        <span className="text-sm font-extrabold text-white tracking-tight truncate">CRM Hub</span>
                    )}
                </div>
                {setIsDesktopCollapsed && (
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
                )}
            </div>

            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto no-scrollbar">
                {/* Back to Hub */}
                <button
                    onClick={() => navigate('/company-dashboard')}
                    title={isCollapsedMode ? "Back to Company Hub" : undefined}
                    className={`w-full flex items-center ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sm font-bold rounded-xl transition-all duration-200 mb-2 group text-sidebar-text/80 hover:text-sidebar-text hover:bg-white/10 text-left`}
                >
                    <div className="p-1.5 rounded-full bg-slate-500/35 text-slate-300 flex items-center justify-center flex-shrink-0">
                        <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
                    </div>
                    {!isCollapsedMode && <span className="ml-2.5 truncate">Back to Hub</span>}
                </button>

                {crmNavLinks.map((item) => <NavItem key={item.name} item={item} />)}
            </nav>

            {hasPermission('SETTINGS', 'view') && (
                <div className="p-3 border-t border-sidebar-text/10 space-y-1">
                    <NavLink
                        to="/crm-settings"
                        onClick={onLinkClick}
                        title={isCollapsedMode ? "Settings" : undefined}
                        className={`flex items-center ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sidebar-text/80 hover:text-sidebar-text text-sm font-bold rounded-xl hover:bg-sidebar-hover transition group`}
                    >
                        <div className="p-1.5 rounded-full bg-slate-500/35 text-slate-300 flex items-center justify-center flex-shrink-0">
                            <Settings className="h-4 w-4 stroke-[2.5]" />
                        </div>
                        {!isCollapsedMode && <span className="ml-2.5 truncate">Settings</span>}
                    </NavLink>
                </div>
            )}
        </div>
    );
};

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

const CrmLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const isExpanded = !isDesktopCollapsed || isHovered;

    const navigate = useNavigate();
    const handleLogout = () => logout(navigate);
    const username = localStorage.getItem('username') || 'Admin';

    const [companyInfo, setCompanyInfo] = useState({ name: 'Enterprise CRM', logoPath: null, logoBlob: null });
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const cachedName = sessionStorage.getItem('company_name');
        const cachedLogo = sessionStorage.getItem('company_logo');

        if (cachedName && cachedName !== 'Enterprise CRM') {
            setCompanyInfo({ name: cachedName, logoPath: null, logoBlob: cachedLogo || null });
            return;
        }

        const fetchCompanyInfo = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get(`${API_URL}/company-info`, { headers });

                const realName = res.data.companyName;
                const companyName = realName || 'Enterprise CRM';

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
        <div className="flex flex-col h-screen bg-background text-foreground font-sans">
            {/* Permanent Fixed Header */}
            <header className="flex-shrink-0 h-16 bg-header-bg text-header-text shadow-sm border-b border-border flex items-center justify-between px-4 lg:px-6 z-30 relative">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="opacity-70 hover:opacity-100 hover:bg-black/5 p-2 rounded-theme lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <Link to="/company-dashboard" className="flex items-center gap-3">
                        {companyInfo.logoPath || companyInfo.logoBlob ? (
                            <img
                                src={companyInfo.logoBlob || constructImageUrl(companyInfo.logoPath)}
                                alt={companyInfo.name}
                                className="h-10 w-10 object-contain rounded-theme bg-white border border-border"
                            />
                        ) : (
                            <div className="h-10 w-10 bg-primary/10 rounded-theme flex items-center justify-center text-primary font-bold border border-primary/20">
                                <Sparkles className="h-6 w-6" />
                            </div>
                        )}
                        <div className="hidden md:block">
                            <span className="font-bold text-lg">{companyInfo.name}</span>
                            <span className="ml-2 px-2 py-0.5 text-xs bg-black/10 rounded-full font-medium tracking-wide">CRM</span>
                        </div>
                    </Link>
                </div>

                {/* Right Side: Profile & Logout */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-semibold">{username}</span>
                            <span className="text-xs opacity-80">Administrator</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center font-bold text-primary flex-shrink-0 border border-[var(--color-primary)]/10 shadow-sm">
                            {username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="w-px h-8 bg-black/10"></div>
                    <button
                        onClick={handleLogout}
                        className="opacity-70 hover:opacity-100 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-black/5"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Static sidebar for desktop */}
                <aside
                    className={`hidden lg:flex lg:flex-col lg:flex-shrink-0 border-r border-border bg-sidebar-bg text-sidebar-text transition-all duration-300 ${isExpanded ? 'w-[220px]' : 'w-[68px]'}`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <SidebarContent
                        isCollapsedMode={!isExpanded}
                        isDesktopCollapsed={isDesktopCollapsed}
                        setIsDesktopCollapsed={setIsDesktopCollapsed}
                    />
                </aside>

                {/* Main content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto min-w-0 p-4">
                    {children}
                </main>

                <CrmReminderPoller />

                {/* Mobile menu overlay */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                                onClick={() => setSidebarOpen(false)}
                            />
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="fixed top-0 left-0 h-full w-64 z-50 bg-sidebar-bg text-sidebar-text shadow-2xl flex flex-col"
                            >
                                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                    <span className="font-bold text-lg">Menu</span>
                                    <button onClick={() => setSidebarOpen(false)} className="p-2 opacity-70 hover:opacity-100 hover:bg-white/10 rounded-full">
                                        <Menu className="h-5 w-5" />
                                    </button>
                                </div>
                                <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const CrmModule = () => {
    const { refreshPermissions } = useCrmPermissions();

    useEffect(() => {
        refreshPermissions();
    }, [refreshPermissions]);

    return (
        <CrmLayout>
            <Outlet />
        </CrmLayout>
    );
}

export default CrmModule;
