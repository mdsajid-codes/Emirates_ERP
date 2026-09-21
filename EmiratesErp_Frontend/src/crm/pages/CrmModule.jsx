import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
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
    Sparkles,
    CalendarDays,
    HelpCircle,
    ChevronDown,
    Search,
    Bell,
    Headset
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import CrmReminderPoller from '../components/CrmReminderPoller';
import { useCrmPermissions } from '../context/CrmPermissionsContext';
import { useLanguage } from '../../context/LanguageContext';
import NotificationBell from '../../components/notifications/NotificationBell';

const crmNavLinks = [
    { nameKey: 'crm.nav.dashboard', defaultName: 'Dashboard', icon: LayoutDashboard, href: '/crm-dashboard/dashboard', module: 'DASHBOARD' },
    { nameKey: 'crm.nav.home',      defaultName: 'Home',      icon: Home,            href: '/crm-dashboard/home' },
    { nameKey: 'crm.nav.callingData', defaultName: 'Calling Data', icon: Phone,       href: '/crm-dashboard/calling-data', module: 'CALL_LOG' },
    { nameKey: 'crm.nav.leads',     defaultName: 'Leads',     icon: Users,           href: '/crm-dashboard/leads', module: 'LEAD' },
    { nameKey: 'crm.nav.companies', defaultName: 'Companies', icon: Building,        href: '/crm-dashboard/companies', module: 'COMPANY' },
    { nameKey: 'crm.nav.contacts',  defaultName: 'Contacts',  icon: Contact,         href: '/crm-dashboard/contacts', module: 'CONTACT' },
    { nameKey: 'crm.nav.deals',     defaultName: 'Deals',     icon: Handshake,       href: '/crm-dashboard/deals', module: 'DEAL' },
    { nameKey: 'crm.nav.tasks',     defaultName: 'Tasks',     icon: ListTodo,        href: '/crm-dashboard/tasks', module: 'TASK' },
    { nameKey: 'crm.nav.calendar',  defaultName: 'Calendar',  icon: CalendarDays,    href: '/crm-dashboard/calendar', module: 'EVENT' },
    { nameKey: 'crm.nav.operations',defaultName: 'Operations',icon: Activity,        href: '/crm-dashboard/operations', module: 'TODO' },
];

/* ─── Narrow icon+label nav item (exactly like DashboardLayout) ─── */
const NavItem = ({ item, onClick }) => {
    const { t } = useLanguage();
    const { hasPermission } = useCrmPermissions();

    if (item.module && !hasPermission(item.module, 'view')) return null;

    const label = t(item.nameKey) || item.defaultName;

    return (
        <NavLink
            to={item.href}
            onClick={onClick}
            end={item.href === '/crm-dashboard/dashboard' || item.href === '/crm-dashboard/home'}
            title={label}
            className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-1 rounded-[8px] transition-all duration-200 w-[64px] h-[51.75px] group ${
                    isActive
                        ? 'bg-[#00A9A8] text-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)] font-semibold'
                        : 'text-[#F2F5FA] hover:bg-white/10 opacity-90'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <item.icon className={`h-[18px] w-[18px] transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#F2F5FA]'}`} />
                    <span className={`text-[9px] leading-[14px] font-normal tracking-tight text-center mt-1 truncate max-w-full ${isActive ? 'text-white font-medium' : 'text-[#F2F5FA]'}`}>
                        {label}
                    </span>
                </>
            )}
        </NavLink>
    );
};

/* ─── Sidebar: dark teal, 80px, icon+label vertical stack ─── */
const SidebarContent = ({ onLinkClick, companyLogo }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { hasPermission } = useCrmPermissions();

    return (
        <div className="flex flex-col h-full bg-[#003E5B] text-[#F2F5FA] w-[80px] shrink-0 select-none">
            {/* Logo block */}
            <div className="w-[80px] h-[64px] bg-white border-r border-[#F2F5FA] flex items-center justify-center shrink-0">
                <Link to="/company-dashboard" className="flex items-center justify-center">
                    <img
                        src={companyLogo || '/icon.svg'}
                        alt="Logo"
                        className="w-[31px] h-[38px] object-contain"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/icon.svg'; }}
                    />
                </Link>
            </div>

            {/* Nav items */}
            <nav className="flex-1 py-4 flex flex-col items-center gap-2 overflow-y-auto no-scrollbar">
                {crmNavLinks.map((item) => (
                    <NavItem key={item.nameKey} item={item} onClick={onLinkClick} />
                ))}

                {/* Settings */}
                {hasPermission('SETTINGS', 'view') && (
                    <NavLink
                        to="/crm-settings"
                        onClick={onLinkClick}
                        title={t('crm.nav.settings')}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center py-2 px-1 rounded-[8px] transition-all duration-200 w-[64px] h-[51.75px] group ${
                                isActive
                                    ? 'bg-[#00A9A8] text-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)] font-semibold'
                                    : 'text-[#F2F5FA] hover:bg-white/10 opacity-90'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Settings className={`h-[18px] w-[18px] transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#F2F5FA]'}`} />
                                <span className={`text-[9px] leading-[14px] font-normal tracking-tight text-center mt-1 truncate max-w-full ${isActive ? 'text-white font-medium' : 'text-[#F2F5FA]'}`}>
                                    {t('crm.nav.settings')}
                                </span>
                            </>
                        )}
                    </NavLink>
                )}
            </nav>

            {/* Support */}
            <div className="py-4 border-t border-white/20 flex flex-col items-center gap-1 shrink-0">
                <button className="flex flex-col items-center justify-center text-[#F2F5FA] hover:text-white transition-colors group">
                    <HelpCircle className="h-[18px] w-[18px] text-[#F2F5FA] group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] leading-[14px] font-normal text-[#F2F5FA] mt-1">{t('nav.support')}</span>
                </button>
            </div>
        </div>
    );
};

/* ─── Helper: build full image URL ─── */
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

/* ─── Main Layout ─── */
const CrmLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const { language, setLanguage, t, isRTL } = useLanguage();
    const navigate = useNavigate();
    const handleLogout = () => logout(navigate);
    const username = localStorage.getItem('username') || 'Admin';

    const [companyInfo, setCompanyInfo] = useState({ name: 'Emirates ERP', logoPath: null, logoBlob: null });
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const cachedName = sessionStorage.getItem('company_name');
        const cachedLogo = sessionStorage.getItem('company_logo');

        if (cachedName && cachedName !== 'Emirates ERP') {
            setCompanyInfo({ name: cachedName, logoPath: null, logoBlob: cachedLogo || null });
            return;
        }

        const fetchCompanyInfo = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get(`${API_URL}/company-info`, { headers });

                const realName = res.data.companyName;
                const companyName = realName || 'Emirates ERP';

                if (realName) sessionStorage.setItem('company_name', realName);

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
            } catch (err) { console.error('Failed to fetch company info for CRM layout', err); }
        };
        fetchCompanyInfo();
    }, [API_URL]);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans" dir={isRTL ? 'rtl' : 'ltr'}>

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

            {/* Desktop Sidebar — 80px narrow, matching HRMS exactly */}
            <aside className="hidden lg:flex lg:flex-col lg:flex-shrink-0 w-[80px] bg-[#003E5B] z-40 shadow-md">
                <SidebarContent companyLogo={companyInfo.logoBlob} />
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Header — white, exactly like HRMS DashboardLayout */}
                <header className="flex-shrink-0 h-16 bg-white text-[#0F172A] shadow-xs border-b border-[#DBE5F3] flex items-center justify-between px-4 lg:px-6 z-30 relative">

                    {/* Left: mobile menu + search */}
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        {/* Search bar */}
                        <div className="relative w-full max-w-md flex items-center">
                            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} h-4 w-4 text-[#607089]`} />
                            <input
                                type="text"
                                placeholder={t('search.placeholder') || 'Search…'}
                                className={`w-full ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00A9A8]/20 focus:border-[#00A9A8] transition-all text-[#0F172A]`}
                            />
                        </div>
                    </div>

                    {/* Right: language, notifications, settings, profile, logout */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">

                        {/* Language dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg shadow-xs text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                <span className="w-4 h-4 text-[#00A9A8] flex items-center justify-center font-bold text-[10px]">🌐</span>
                                <span>{language === 'ar' ? 'العربية' : 'English'}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-[#0F172A]" />
                            </button>

                            {langDropdownOpen && (
                                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-1 w-36 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-1 z-50`}>
                                    <button
                                        onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${language === 'en' ? 'font-bold text-[#00A9A8]' : 'text-[#0F172A]'}`}
                                    >
                                        <span>English</span>
                                        {language === 'en' && <span>✓</span>}
                                    </button>
                                    <button
                                        onClick={() => { setLanguage('ar'); setLangDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${language === 'ar' ? 'font-bold text-[#00A9A8]' : 'text-[#0F172A]'}`}
                                    >
                                        <span>العربية</span>
                                        {language === 'ar' && <span>✓</span>}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Notification bell */}
                        <NotificationBell />

                        {/* Settings icon */}
                        <button
                            onClick={() => navigate('/crm-settings')}
                            className="p-2 text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="CRM Settings"
                        >
                            <span className="w-5 h-5 text-[#0F172A] flex items-center justify-center text-base">⚙️</span>
                        </button>

                        <div className="w-px h-6 bg-[#E2E8F0] hidden sm:block" />

                        {/* User profile */}
                        <div className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                            <div className="w-8 h-8 rounded-full bg-[#01B8BD] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-xs font-semibold text-[#0F172A] leading-tight">{username}</span>
                                <span className="text-[11px] text-[#526580]">{t('common.administrator') || 'Administrator'}</span>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-[#0F172A] hidden sm:block ml-0.5" />
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </header>

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background no-scrollbar p-4">
                    {children}
                </main>
            </div>

            <CrmReminderPoller />

            {/* Mobile Drawer */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 h-full w-[80px] z-50 bg-[#003E5B] shadow-2xl flex flex-col"
                        >
                            <SidebarContent onLinkClick={() => setSidebarOpen(false)} companyLogo={companyInfo.logoBlob} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ─── Module wrapper ─── */
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
};

export default CrmModule;
