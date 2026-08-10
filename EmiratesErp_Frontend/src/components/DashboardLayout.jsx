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
    PanelLeftOpen,
    Settings,
    HelpCircle
} from 'lucide-react';
import { AnimatePresence, motion } from "framer-motion";
import { useTenant } from "../context/TenantContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import NotificationBell from './notifications/NotificationBell';
import { logout } from '../utils/logout';

const navLinks = [
    { nameKey: 'nav.dashboard', defaultName: 'Dashboard', icon: LayoutDashboard, href: '/hrdashboard', module: 'HRMS_CORE' },
    { nameKey: 'nav.employees', defaultName: 'Employees', icon: Users, href: '/employees', module: 'HRMS_CORE' },
    { nameKey: 'nav.attendance', defaultName: 'Attendance', icon: CalendarClock, href: '/attendance', module: 'HRMS_ATTENDANCE' },
    { nameKey: 'nav.leave', defaultName: 'Leave', icon: CalendarClock, href: '/leave', module: 'HRMS_LEAVE' },
    { nameKey: 'nav.payroll', defaultName: 'Payroll', icon: DollarSign, href: '/payroll-management', module: 'HRMS_PAYROLL' },
    { nameKey: 'nav.users', defaultName: 'Users', icon: ShieldCheck, href: '/users-details' },
    { nameKey: 'nav.reports', defaultName: 'Reports', icon: BarChart2, href: '/reports' },
    { nameKey: 'nav.settings', defaultName: 'Settings', icon: Settings, href: '/hrms-settings' },
];

const NavItem = ({ item, onClick }) => {
    const { t } = useLanguage();
    const displayName = t(item.nameKey) || item.defaultName;

    return (
        <NavLink
            to={item.href}
            onClick={onClick}
            title={displayName}
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
                        {displayName}
                    </span>
                </>
            )}
        </NavLink>
    );
};

const SidebarContent = ({ onLinkClick, companyLogo }) => {
    const roles = useMemo(() => JSON.parse(localStorage.getItem('roles') || '[]'), []);
    const isSuperAdmin = useMemo(() => roles.includes('SUPER_ADMIN'), [roles]);
    const { hasModule } = useTenant();
    const { t } = useLanguage();

    const accessibleNavLinks = useMemo(() => {
        return navLinks.filter(link => !link.module || hasModule(link.module));
    }, [hasModule]);

    return (
        <div className="flex flex-col h-full bg-[#003E5B] text-[#F2F5FA] w-[80px]">
            {/* Top Logo Container (Exact Figma Spec: 80px x 64px, bg white, border right #F2F5FA) */}
            <div className="w-[80px] h-[64px] bg-white border-r border-[#F2F5FA] flex items-center justify-center shrink-0">
                <Link to="/company-dashboard" className="flex items-center justify-center">
                    <img 
                        src={companyLogo || "/icon.svg"} 
                        alt="Logo" 
                        className="w-[31px] h-[38px] object-contain"
                        onError={(e) => { e.target.onerror = null; e.target.src = "/icon.svg"; }}
                    />
                </Link>
            </div>

            {/* Navigation Items (Vertical Stack) */}
            <nav className="flex-1 py-4 flex flex-col items-center gap-2 overflow-y-auto no-scrollbar">
                {accessibleNavLinks.map((item) => (
                    <NavItem key={item.nameKey} item={item} onClick={onLinkClick} />
                ))}
                {isSuperAdmin && (
                    <NavItem item={{ nameKey: 'nav.company', defaultName: 'Company', icon: Home, href: '/company-dashboard' }} onClick={onLinkClick} />
                )}
            </nav>

            {/* Bottom Support Section */}
            <div className="py-4 border-t border-white/20 flex flex-col items-center gap-1 shrink-0">
                <button className="flex flex-col items-center justify-center text-[#F2F5FA] hover:text-white transition-colors group">
                    <HelpCircle className="h-[18px] w-[18px] text-[#F2F5FA] group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] leading-[14px] font-normal text-[#F2F5FA] mt-1">{t('nav.support')}</span>
                </button>
            </div>
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
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const { language, setLanguage, t, isRTL } = useLanguage();
    const navigate = useNavigate();

    const handleLogout = () => logout(navigate);
    const username = localStorage.getItem('username') || 'Admin';

    const [companyInfo, setCompanyInfo] = useState({ name: 'Emirates ERP Solutions LLC', logoPath: null, logoBlob: null });
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
                const companyName = realName || 'Emirates ERP Solutions LLC';

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

            {/* Desktop Sidebar (Fixed 80px Narrow Layout) */}
            {!hideSidebar && (
                <aside className="hidden lg:flex lg:flex-col lg:flex-shrink-0 w-[80px] bg-[#003E5B] z-40 shadow-md">
                    <SidebarContent companyLogo={companyInfo.logoBlob} />
                </aside>
            )}

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Header */}
                <header className="flex-shrink-0 h-16 bg-white text-[#0F172A] shadow-xs border-b border-[#DBE5F3] flex items-center justify-between px-4 lg:px-6 z-30 relative">

                    {/* Left side of header (Mobile Menu + Universal Search Bar) */}
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
                                <div className="flex items-center gap-2 flex-1 max-w-md">
                                    {headerSearch}
                                </div>
                            ) : (
                                <div className="relative w-full max-w-md flex items-center">
                                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} h-4 w-4 text-[#607089]`} />
                                    <input
                                        type="text"
                                        placeholder={t('search.placeholder')}
                                        className={`w-full ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00A9A8]/20 focus:border-[#00A9A8] transition-all text-[#0F172A]`}
                                    />
                                </div>
                            )
                        )}
                    </div>

                    {/* Right side of header (Language, Notification, Settings, Profile) */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        {headerExtra}

                        {/* Interactive Language Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
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

                        {/* Notification Bell (Using component) */}
                        <NotificationBell />

                        {/* Settings Icon */}
                        <button 
                            onClick={() => navigate('/hrms-settings')} 
                            className="p-2 text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="HRMS Settings"
                        >
                            <span className="w-5 h-5 text-[#0F172A] flex items-center justify-center text-base">⚙️</span>
                        </button>

                        <div className="w-px h-6 bg-[#E2E8F0] hidden sm:block"></div>

                        {/* User Profile */}
                        <div className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                            <div className="w-8 h-8 rounded-full bg-[#01B8BD] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-xs font-semibold text-[#0F172A] leading-tight">{username} User</span>
                                <span className="text-[11px] text-[#526580]">{t('profile.role')}</span>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-[#0F172A] hidden sm:block ml-0.5" />
                        </div>

                        <button
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut className="h-4.5 w-4.5" />
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
                                <SidebarContent onLinkClick={() => setSidebarOpen(false)} companyLogo={companyInfo.logoBlob} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardLayout;