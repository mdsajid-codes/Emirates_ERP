import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Warehouse,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    ChevronDown,
    Search,
    Bell,
    Home,
} from 'lucide-react';
import PosDashboardView from './PosDashboardView';
import ProductsView from './ProductsView';
import SalesView from './SalesView';
import InventoryView from './InventoryView';
import CustomersView from './CustomersView';
import ReportsView from './ReportsView';
import PosSettingsView from './PosSettingsView';
import { usePosTheme } from './usePosTheme';
import NotificationBell from '../../components/notifications/NotificationBell';

/* ─── Navigation items ─────────────────────────────────────────────────────── */
const NAV_ITEMS = [
    { name: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, Component: PosDashboardView },
    { name: 'Sales',     label: 'Sales',     icon: ShoppingCart,    Component: SalesView },
    { name: 'Products',  label: 'Products',  icon: Package,         Component: ProductsView },
    { name: 'Inventory', label: 'Inventory', icon: Warehouse,       Component: InventoryView },
    { name: 'Customers', label: 'Customers', icon: Users,           Component: CustomersView },
    { name: 'Reports',   label: 'Reports',   icon: BarChart3,       Component: ReportsView },
    { name: 'Settings',  label: 'Settings',  icon: Settings,        Component: PosSettingsView },
];

/* ─── Sidebar link item ─────────────────────────────────────────────────────── */
const SidebarLink = ({ item, isActive, onClick }) => {
    const Icon = item.icon;
    return (
        <button
            onClick={() => onClick(item.name)}
            title={item.label}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-[8px] transition-all duration-200 w-[64px] h-[51.75px] shrink-0 cursor-pointer ${
                isActive
                    ? 'bg-[#00A9A8] text-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)] font-semibold'
                    : 'text-[#F2F5FA] hover:bg-white/10 opacity-90'
            }`}
        >
            <Icon className={`h-[18px] w-[18px] transition-transform ${isActive ? 'text-white' : 'text-[#F2F5FA]'}`} strokeWidth={1.5} />
            <span className={`text-[9px] leading-[14px] font-normal tracking-tight text-center mt-1 truncate max-w-full ${isActive ? 'text-white font-medium' : 'text-[#F2F5FA]'}`}>
                {item.label}
            </span>
        </button>
    );
};

/* ─── Main POS Dashboard shell ──────────────────────────────────────────────── */
const PosDashboard = () => {
    const { posTheme } = usePosTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
    const [language, setLanguage] = useState('en');
    const [searchParams, setSearchParams] = useSearchParams();
    const activeItem = searchParams.get('view') || 'Sales';
    const navigate = useNavigate();

    const username = localStorage.getItem('username') || 'Admin User';
    const [tenantName, setTenantName] = useState('Emirates ERP Solutions LLC');
    const [companyLogoBlob, setCompanyLogoBlob] = useState(null);
    const [selectedStore, setSelectedStore] = useState('Main Store');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const roles = useMemo(() => {
        try { return JSON.parse(localStorage.getItem('roles') || '[]'); }
        catch { return []; }
    }, []);
    const isSuperAdmin = roles.includes('SUPER_ADMIN');

    const setActiveItem = (itemName) => setSearchParams({ view: itemName });

    useEffect(() => {
        if (!searchParams.get('view')) {
            setSearchParams({ view: 'Sales' }, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    /* Fetch company info & logo */
    useEffect(() => {
        const fetchCompanyInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get(`${API_URL}/company-info`, { headers });
                const companyName = res.data?.companyName || 'Emirates ERP Solutions LLC';
                setTenantName(companyName);
                const rawLogoUrl = res.data?.logoPath;
                if (rawLogoUrl) {
                    try {
                        const logoRes = await axios.get(`${API_URL}/company-info/logo`, { headers, responseType: 'blob' });
                        const reader = new FileReader();
                        reader.onloadend = () => setCompanyLogoBlob(reader.result);
                        reader.readAsDataURL(logoRes.data);
                    } catch { /* silent */ }
                }
            } catch { /* silent */ }
        };
        fetchCompanyInfo();
    }, [API_URL]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    /* Render active view content */
    const renderContent = () => {
        const activeNav = NAV_ITEMS.find(n => n.name === activeItem) || NAV_ITEMS[1];
        if (!activeNav.Component) {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-[#607089]">
                    <activeNav.icon className="w-12 h-12 opacity-30" />
                    <p className="text-sm font-semibold">{activeNav.label} — Coming Soon</p>
                </div>
            );
        }
        const Component = activeNav.Component;
        return <Component key={activeItem} setActiveItem={setActiveItem} posTheme={posTheme} />;
    };

    /* ─── Sidebar content (shared desktop + mobile) ─────────────────────────── */
    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#003E5B] text-[#F2F5FA] w-[80px] select-none">
            {/* Top Logo Box (Exact Figma Spec: 80px x 64px, bg white, border right #F2F5FA) */}
            <div className="w-[80px] h-[64px] bg-white border-r border-b border-[#F2F5FA] flex items-center justify-center shrink-0">
                <img
                    src={companyLogoBlob || "/icon.svg"}
                    alt="Logo"
                    className="w-[31px] h-[38px] object-contain"
                    onError={(e) => { e.target.onerror = null; e.target.src = "/icon.svg"; }}
                />
            </div>

            {/* Nav links (Vertical Stack) */}
            <nav className="flex-1 py-3 flex flex-col items-center gap-1.5 overflow-y-auto no-scrollbar">
                {NAV_ITEMS.map(item => (
                    <SidebarLink
                        key={item.name}
                        item={item}
                        isActive={activeItem === item.name}
                        onClick={(name) => { setActiveItem(name); setSidebarOpen(false); }}
                    />
                ))}
            </nav>

            {/* Bottom Support / Actions Section */}
            <div className="py-3 border-t border-white/20 flex flex-col items-center gap-2 shrink-0">
                {isSuperAdmin && (
                    <button
                        onClick={() => navigate('/company-dashboard')}
                        title="Company Hub"
                        className="flex flex-col items-center justify-center py-1 text-[#F2F5FA] hover:text-white transition-colors cursor-pointer w-[64px]"
                    >
                        <Home className="h-[18px] w-[18px] text-[#F2F5FA]" strokeWidth={1.5} />
                        <span className="text-[9px] leading-[14px] font-normal text-[#F2F5FA] mt-0.5">Hub</span>
                    </button>
                )}
                <button
                    onClick={handleLogout}
                    title="Logout"
                    className="flex flex-col items-center justify-center py-1 text-[#F2F5FA] hover:text-white transition-colors cursor-pointer w-[64px]"
                >
                    <LogOut className="h-[18px] w-[18px] text-[#F2F5FA]" strokeWidth={1.5} />
                    <span className="text-[9px] leading-[14px] font-normal text-[#F2F5FA] mt-0.5">Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen font-sans" style={{ background: '#F7FAFF' }}>

            {/* ── Fixed 80px Sidebar (desktop) ──────────────────────────────────── */}
            <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-[80px] z-40">
                <SidebarContent />
            </aside>

            {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[80px] z-50 lg:hidden"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── Fixed Header ──────────────────────────────────────────────────── */}
            <header className="fixed top-0 left-0 lg:left-[80px] right-0 h-16 bg-white text-[#0F172A] border-b border-[#DBE5F3] flex items-center justify-between px-4 lg:px-6 z-30">
                {/* Left: Mobile menu + Company/Store Selector */}
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg lg:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Store / Company Selector Pill */}
                    <div className="relative">
                        <button
                            onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M2.25 6.75h13.5M2.25 6.75L4.5 2.25h9l2.25 4.5M2.25 6.75v9h13.5v-9" stroke="#00A9A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="truncate max-w-[200px]">{tenantName}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-[#0F172A] flex-shrink-0" />
                        </button>
                        {storeDropdownOpen && (
                            <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-1 z-50">
                                {['Main Store', 'Dubai Mall Branch', 'JBR Outlet'].map(store => (
                                    <button
                                        key={store}
                                        onClick={() => { setSelectedStore(store); setStoreDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${selectedStore === store ? 'font-bold text-[#00A9A8]' : 'text-[#0F172A]'}`}
                                    >
                                        <span>{store}</span>
                                        {selectedStore === store && <span>✓</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Language, Search, Notification, Settings, Profile */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    {/* Language Switcher */}
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
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-1 z-50">
                                {[{ code: 'en', label: 'English' }, { code: 'ar', label: 'العربية' }].map(l => (
                                    <button
                                        key={l.code}
                                        onClick={() => { setLanguage(l.code); setLangDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${language === l.code ? 'font-bold text-[#00A9A8]' : 'text-[#0F172A]'}`}
                                    >
                                        <span>{l.label}</span>
                                        {language === l.code && <span>✓</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <button className="p-2 text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                        <Search className="h-5 w-5" />
                    </button>

                    {/* Notification Bell */}
                    <NotificationBell />

                    {/* Settings */}
                    <button className="p-2 text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Settings">
                        <span className="w-5 h-5 text-[#0F172A] flex items-center justify-center text-base">⚙️</span>
                    </button>

                    {/* Divider */}
                    <div className="w-px h-6 bg-[#E2E8F0] hidden sm:block" />

                    {/* User Profile */}
                    <div className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                        <div className="w-8 h-8 rounded-full bg-[#01B8BD] text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden sm:flex flex-col text-left">
                            <span className="text-xs font-semibold text-[#0F172A] leading-tight truncate max-w-[140px]">{username}</span>
                            <span className="text-[11px] text-[#526580]">Administrator</span>
                        </div>
                        <ChevronDown className="h-3.5 w-3.5 text-[#0F172A] hidden sm:block ml-0.5" />
                    </div>
                </div>
            </header>

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:ml-[80px] pt-[64px] h-screen overflow-hidden">
                <main className="flex-1 overflow-y-auto h-full">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default PosDashboard;
