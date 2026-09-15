import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../../utils/logout';
import {
    Activity,
    Factory,
    List,
    Calendar,
    User,
    Layers,
    Gauge,
    FileBarChart,
    Settings,
    LogOut,
    Menu,
    Search,
    ChevronDown,
    HelpCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTenant } from '../../context/TenantContext';
import { useLanguage } from '../../context/LanguageContext';
import NotificationBell from '../../components/notifications/NotificationBell';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const productionNavLinks = [
    { nameKey: 'prod.nav.dashboard', defaultName: 'Dashboard', icon: Activity, href: '/production-dashboard/overview' },
    { nameKey: 'prod.nav.manageMO', defaultName: 'Manage Manufacturing Order', icon: Factory, href: '/production-dashboard/manage-manufacturing-order' },
    { nameKey: 'prod.nav.viewMO', defaultName: 'View Manufacturing Order', icon: List, href: '/production-dashboard/view-manufacturing-order' },
    { nameKey: 'prod.nav.schedule', defaultName: 'Production Schedule', icon: Calendar, href: '/production-dashboard/production-schedule' },
    { nameKey: 'prod.nav.operation', defaultName: 'Production Operation', icon: Activity, href: '/production-dashboard/production-operation' },
    { nameKey: 'prod.nav.myProduction', defaultName: 'My Production', icon: User, href: '/production-dashboard/my-production' },
];

const hangerNavLinks = [
    { nameKey: 'prod.nav.hangerBatches', defaultName: 'Hanger Batches', icon: Layers, href: '/production-dashboard/hanger/batches' },
    { nameKey: 'prod.nav.oee', defaultName: 'OEE Analytics', icon: Gauge, href: '/production-dashboard/hanger/batches/oee' },
    { nameKey: 'prod.nav.reports', defaultName: 'Reports', icon: FileBarChart, href: '/production-dashboard/hanger/batches/reports' },
];

/* ─── Narrow icon+label nav item (exactly like CRM / DashboardLayout) ─── */
const NavItem = ({ item, onClick }) => {
    const { t } = useLanguage();
    const translated = item.nameKey ? t(item.nameKey) : null;
    const label = (translated && translated !== item.nameKey) ? translated : item.defaultName;

    return (
        <NavLink
            to={item.href}
            onClick={onClick}
            end={item.href !== '/production-dashboard/manage-manufacturing-order'}
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

/* ─── Sidebar: dark teal (#003E5B), 80px, icon+label vertical stack ─── */
const SidebarContent = ({ onLinkClick, companyLogo }) => {
    const { t } = useLanguage();
    const { hasModule } = useTenant();
    const isHangerTenant = hasModule('HANGER_MANUFACTURING');

    return (
        <div className="flex flex-col h-full bg-[#003E5B] text-[#F2F5FA] w-[80px] shrink-0 select-none">
            {/* Logo block */}
            <div className="w-[80px] h-[64px] bg-white border-r border-[#F2F5FA] flex items-center justify-center shrink-0">
                <Link to="/company-dashboard" className="flex items-center justify-center" title="Company Hub">
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
                {productionNavLinks.map((item) => (
                    <NavItem key={item.defaultName} item={item} onClick={onLinkClick} />
                ))}

                {isHangerTenant && (
                    <>
                        <div className="w-10 h-px bg-white/20 my-1" />
                        <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest text-center px-1">
                            Hanger
                        </span>
                        {hangerNavLinks.map((item) => (
                            <NavItem key={item.defaultName} item={item} onClick={onLinkClick} />
                        ))}
                    </>
                )}

                {/* Settings */}
                <NavLink
                    to="/production-settings"
                    onClick={onLinkClick}
                    title={t('nav.settings') || 'Settings'}
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
                                {t('nav.settings') || 'Settings'}
                            </span>
                        </>
                    )}
                </NavLink>
            </nav>

            {/* Support */}
            <div className="py-4 border-t border-white/20 flex flex-col items-center gap-1 shrink-0">
                <button className="flex flex-col items-center justify-center text-[#F2F5FA] hover:text-white transition-colors group">
                    <HelpCircle className="h-[18px] w-[18px] text-[#F2F5FA] group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] leading-[14px] font-normal text-[#F2F5FA] mt-1">{t('nav.support') || 'Support'}</span>
                </button>
            </div>
        </div>
    );
};

/* ─── Production Main Layout (Matching CRM Module Layout) ─── */
const ProductionLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const { language, setLanguage, t, isRTL } = useLanguage();
    const navigate = useNavigate();
    const handleLogout = () => logout(navigate);
    const username = localStorage.getItem('username') || 'Admin';

    const [companyInfo, setCompanyInfo] = useState({ name: 'Emirates ERP', logoPath: null, logoBlob: null });

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
            } catch (err) { console.error('Failed to fetch company info for Production layout', err); }
        };
        fetchCompanyInfo();
    }, []);

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

            {/* Desktop Sidebar — 80px narrow, matching CRM & HRMS */}
            <aside className="hidden lg:flex lg:flex-col lg:flex-shrink-0 w-[80px] bg-[#003E5B] z-40 shadow-sm border-r border-[#002f45]">
                <SidebarContent companyLogo={companyInfo.logoBlob} />
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Header — white, exactly like CRM Header */}
                <header className="flex-shrink-0 h-16 bg-white text-[#0F172A] shadow-2xs border-b border-[#DBE5F3] flex items-center justify-between px-4 lg:px-6 z-30">

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
                            onClick={() => navigate('/production-settings')}
                            className="p-2 text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Production Settings"
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
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] no-scrollbar">
                    {children}
                </main>
            </div>

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

const Production = () => {
    return (
        <ProductionLayout>
            <Outlet />
        </ProductionLayout>
    );
};

export default Production;

