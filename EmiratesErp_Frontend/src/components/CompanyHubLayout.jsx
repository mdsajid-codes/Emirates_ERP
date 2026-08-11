import React, { useState, useMemo, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard, Briefcase, UserPlus, Store, TrendingUp, ShoppingBag, Headset, Landmark,
    Monitor, Factory, Boxes, Warehouse, Bell, Truck, Settings, Search, ChevronDown, LogOut, HelpCircle, Menu
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTenant } from '../context/TenantContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationBell from './notifications/NotificationBell';
import { logout } from '../utils/logout';

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

const ALL_NAV_LINKS = [
    { nameKey: 'nav.dashboard', defaultName: 'Dashboard', icon: LayoutDashboard, href: '/company-dashboard' },
    { nameKey: 'nav.hrms', defaultName: 'HRMS', icon: Briefcase, href: '/hrdashboard', module: 'HRMS_CORE' },
    { nameKey: 'nav.ats', defaultName: 'ATS', icon: UserPlus, href: '/ats-dashboard', module: 'ATS' },
    { nameKey: 'nav.pos', defaultName: 'POS', icon: Store, href: '/pos-dashboard', module: 'POS' },
    { nameKey: 'nav.sales', defaultName: 'Sales', icon: TrendingUp, href: '/sales-dashboard', module: 'SALES' },
    { nameKey: 'nav.purchases', defaultName: 'Purchases', icon: ShoppingBag, href: '/purchase-dashboard', module: 'PURCHASE' },
    { nameKey: 'nav.crm', defaultName: 'CRM', icon: Headset, href: '/crm-dashboard', module: 'CRM' },
    { nameKey: 'nav.account', defaultName: 'Account', icon: Landmark, href: '/account-dashboard', module: 'ACCOUNTS' },
    { nameKey: 'nav.fixedAssets', defaultName: 'Fixed Assets', icon: Monitor, href: '/fixed-asset-dashboard', module: 'FIXED_ASSETS' },
    { nameKey: 'nav.production', defaultName: 'Production', icon: Factory, href: '/production-dashboard', module: 'PRODUCTION' },
    { nameKey: 'nav.material', defaultName: 'Material', icon: Boxes, href: '/material-dashboard', module: 'MATERIAL' },
    { nameKey: 'nav.warehouse', defaultName: 'Warehouse', icon: Warehouse, href: '/warehouse-dashboard', module: 'WAREHOUSE' },
    { nameKey: 'nav.notification', defaultName: 'Notification', icon: Bell, href: '/notification-dashboard', module: 'NOTIFICATION' },
    { nameKey: 'nav.fleet', defaultName: 'Fleet Management', icon: Truck, href: '/fleet-dashboard', module: 'TRIP_MANAGEMENT' },
    { nameKey: 'nav.settings', defaultName: 'Settings', icon: Settings, href: '/company-settings' },
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
    const { hasModule } = useTenant();

    const accessibleNavLinks = useMemo(
        () => ALL_NAV_LINKS.filter(link => !link.module || hasModule(link.module)),
        [hasModule]
    );

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
            </nav>

            {/* Bottom Support Section */}
            <div className="py-4 border-t border-white/20 flex flex-col items-center gap-1 shrink-0">
                <button className="flex flex-col items-center justify-center text-[#F2F5FA] hover:text-white transition-colors group cursor-pointer">
                    <HelpCircle className="h-[18px] w-[18px] text-[#F2F5FA] group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] leading-[14px] font-normal text-[#F2F5FA] mt-1">Support</span>
                </button>
            </div>
        </div>
    );
};

const CompanyHubLayout = ({ children, hideHeaderSearch = false }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const { language, setLanguage, t, isRTL } = useLanguage();
    const navigate = useNavigate();

    const handleLogout = () => logout(navigate);
    const username = localStorage.getItem('username') || 'Admin';

    const [companyInfo, setCompanyInfo] = useState({ name: 'Company Hub', logoPath: null, logoBlob: null });
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const cachedName = sessionStorage.getItem('company_name');
        const cachedLogo = sessionStorage.getItem('company_logo');

        if (cachedName && cachedName !== 'Company Hub') {
            setCompanyInfo({ name: cachedName, logoPath: null, logoBlob: cachedLogo || null });
        }

        const fetchCompanyInfo = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get(`${API_URL}/company-info`, { headers });
                const realName = res.data.companyName || 'Company Hub';
                sessionStorage.setItem('company_name', realName);

                if (res.data.logoPath) {
                    setCompanyInfo({ name: realName, logoPath: res.data.logoPath, logoBlob: cachedLogo || null });
                } else {
                    setCompanyInfo({ name: realName, logoPath: null, logoBlob: null });
                }
            } catch (err) {
                console.error('Failed to fetch company info', err);
            }
        };
        fetchCompanyInfo();
    }, [API_URL]);

    const displayLogo = companyInfo.logoBlob || constructImageUrl(companyInfo.logoPath) || '/icon.svg';

    return (
        <div className="min-h-screen bg-[#F7FAFF] flex flex-col font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* Header */}
            <header className={`h-[64px] bg-white border-b border-[#DBE5F3] fixed top-0 ${isRTL ? 'right-0 lg:right-[80px] left-0' : 'left-0 lg:left-[80px] right-0'} z-30 flex items-center justify-between px-4 lg:px-6`}>
                
                {/* Left/Right Side: Mobile Menu Button & Search Bar */}
                <div className="flex items-center gap-3 flex-1 max-w-xl">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 rounded-lg text-[#18233B] hover:bg-slate-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {!hideHeaderSearch && (
                        <div className="relative w-full max-w-[260px]">
                            <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-[#607089]`}>
                                <Search className="h-4.5 w-4.5" />
                            </div>
                            <input
                                type="text"
                                placeholder={t('search.placeholder') || "Search anything..."}
                                className={`w-full h-[44px] ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-xs bg-white border border-[#E2E8F0] rounded-[8px] text-[#18233B] placeholder-[#94A3B8] focus:outline-none focus:border-[#00A9A8] transition-colors`}
                            />
                        </div>
                    )}
                </div>

                {/* Tools & User Profile */}
                <div className="flex items-center gap-3 shrink-0">
                    
                    {/* Language Switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#18233B] hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            <span>{language === 'ar' ? 'العربية' : 'English'}</span>
                            <ChevronDown className="h-3.5 w-3.5 text-[#607089]" />
                        </button>

                        <AnimatePresence>
                            {langDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-1 w-32 bg-white rounded-lg shadow-lg border border-[#E2E8F0] py-1 z-50 overflow-hidden`}
                                >
                                    <button
                                        onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-between ${language === 'en' ? 'text-[#00A9A8] bg-[#00A9A8]/10' : 'text-[#18233B]'}`}
                                    >
                                        <span>English</span>
                                        {language === 'en' && <span className="text-[10px] font-bold">✓</span>}
                                    </button>
                                    <button
                                        onClick={() => { setLanguage('ar'); setLangDropdownOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-between ${language === 'ar' ? 'text-[#00A9A8] bg-[#00A9A8]/10' : 'text-[#18233B]'}`}
                                    >
                                        <span>العربية</span>
                                        {language === 'ar' && <span className="text-[10px] font-bold">✓</span>}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <NotificationBell />

                    {/* Divider */}
                    <div className="h-6 w-[1px] bg-[#E2E8F0] hidden sm:block"></div>

                    {/* User Profile Info */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#EAF8FF] text-[#00A9A8] border border-[#00A9A8]/20 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden sm:flex flex-col text-left">
                            <span className="text-xs font-bold text-[#18233B] leading-tight truncate max-w-[120px]">{username}</span>
                            <span className="text-[10px] text-[#607089] leading-tight">{t('profile.role') || "Administrator"}</span>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        title={t('header.logout') || "Logout"}
                        className="p-2 text-[#607089] hover:text-[#FF3B3B] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                        <LogOut className="h-4.5 w-4.5" />
                    </button>
                </div>
            </header>

            {/* Layout Main Container */}
            <div className="flex flex-1 pt-[64px]">
                
                {/* Desktop Permanent Vertical Sidebar (Fixed 80px) */}
                <aside className={`hidden lg:block fixed ${isRTL ? 'right-0' : 'left-0'} top-0 bottom-0 w-[80px] z-40`}>
                    <SidebarContent companyLogo={displayLogo} />
                </aside>

                {/* Mobile Drawer Sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSidebarOpen(false)}
                                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            />
                            <motion.aside
                                initial={{ x: isRTL ? '100%' : '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: isRTL ? '100%' : '-100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} bottom-0 w-[80px] z-50 lg:hidden bg-[#003E5B]`}
                            >
                                <SidebarContent companyLogo={displayLogo} onLinkClick={() => setSidebarOpen(false)} />
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* Page Content */}
                <main className={`flex-1 ${isRTL ? 'lg:mr-[80px]' : 'lg:ml-[80px]'} min-w-0 bg-[#F7FAFF] h-[calc(100vh-64px)] overflow-y-auto`}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default CompanyHubLayout;