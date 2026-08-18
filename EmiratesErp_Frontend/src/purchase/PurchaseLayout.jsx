import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    ClipboardList,
    ShoppingCart,
    Receipt,
    CreditCard,
    FileMinus,
    TrendingUp,
    FileCheck,
    Settings,
    BarChart3,
    HelpCircle,
    Search,
    ChevronDown,
    Bell,
    LogOut,
    Menu
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { logout } from '../utils/logout';
import { useLanguage } from '../context/LanguageContext';

const purchaseTabs = [
    { nameKey: 'nav.dashboard', defaultName: 'Dashboard', icon: LayoutDashboard, href: '/purchase-dashboard/dashboard' },
    { nameKey: 'nav.supplyTendering', defaultName: 'Supply Tendering', icon: FileText, href: '/purchase-dashboard/supplier-tendering' },
    { nameKey: 'nav.requisition', defaultName: 'Requisition', icon: ClipboardList, href: '/purchase-dashboard/requisitions' },
    { nameKey: 'nav.purchaseOrders', defaultName: 'Purchase Order', icon: ShoppingCart, href: '/purchase-dashboard/purchase-orders' },
    { nameKey: 'nav.invoices', defaultName: 'Invoice', icon: Receipt, href: '/purchase-dashboard/bills' },
    { nameKey: 'nav.payments', defaultName: 'Payments', icon: CreditCard, href: '/purchase-dashboard/payments' },
    { nameKey: 'nav.debitNotes', defaultName: 'Debit Notes', icon: FileMinus, href: '/purchase-dashboard/debit-notes' },
    { nameKey: 'nav.additionalExpenses', defaultName: 'Additional Expense', icon: TrendingUp, href: '/purchase-dashboard/additional-expenses' },
    { nameKey: 'nav.customDeclarations', defaultName: 'Custom Declaration', icon: FileCheck, href: '/purchase-dashboard/custom-declarations' },
    { nameKey: 'nav.settings', defaultName: 'Settings', icon: Settings, href: '/company-settings' },
    {
        nameKey: 'nav.reports',
        defaultName: 'Reports',
        icon: BarChart3,
        href: '/purchase-dashboard/reports',
        isDropdown: true,
        children: [
            { name: 'Supplier Balances', href: '/purchase-dashboard/reports/supplier-balance' },
            { name: 'Bill Details', href: '/purchase-dashboard/reports/bill-details' },
            { name: 'Payments Made', href: '/purchase-dashboard/reports/payments-made' },
            { name: 'Purchase Orders By Supplier', href: '/purchase-dashboard/reports/purchase-orders-by-supplier' },
            { name: 'Purchase Order Details', href: '/purchase-dashboard/reports/purchase-order-details' },
            { name: 'Supplier SOA', href: '/purchase-dashboard/reports/supplier-soa' },
            { name: 'Pending Purchase', href: '/purchase-dashboard/reports/pending-purchase' },
        ]
    },
];

const SidebarContent = ({ onLinkClick, companyLogo }) => {
    const { t, isRTL } = useLanguage();
    const [reportsOpen, setReportsOpen] = useState(false);

    return (
        <div className="flex flex-col h-full bg-[#003E5B] text-[#F2F5FA] w-[80px] shrink-0 select-none">
            {/* Top Logo Container */}
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

            {/* Navigation Items (Vertical Icon Stack) */}
            <nav className="flex-1 py-4 flex flex-col items-center gap-2 overflow-y-auto no-scrollbar relative">
                {purchaseTabs.map((item) => {
                    const label = t(item.nameKey) || item.defaultName;

                    if (item.isDropdown) {
                        return (
                            <div key={item.nameKey} className="relative group">
                                <button
                                    onClick={() => setReportsOpen(!reportsOpen)}
                                    title={label}
                                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-[8px] transition-all duration-200 w-[64px] h-[51.75px] cursor-pointer ${
                                        reportsOpen
                                            ? 'bg-[#00A9A8] text-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)] font-semibold'
                                            : 'text-[#F2F5FA] hover:bg-white/10 opacity-90'
                                    }`}
                                >
                                    <item.icon className="h-[18px] w-[18px] text-[#F2F5FA]" />
                                    <span className="text-[9px] leading-[14px] font-normal tracking-tight text-center mt-1 truncate max-w-full text-[#F2F5FA]">
                                        {label}
                                    </span>
                                </button>

                                {/* Reports Dropdown Menu */}
                                <AnimatePresence>
                                    {reportsOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, x: isRTL ? -10 : 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: isRTL ? -10 : 10 }}
                                            className={`fixed ${isRTL ? 'right-[90px]' : 'left-[90px]'} bottom-16 bg-[#002D42] border border-white/15 rounded-xl shadow-2xl py-2 w-56 z-50`}
                                        >
                                            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/50 border-b border-white/10 mb-1 flex items-center gap-1.5">
                                                <BarChart3 size={12} className="text-[#00A9A8]" />
                                                {isRTL ? 'تقارير المشتريات' : 'Purchase Reports'}
                                            </div>
                                            {item.children.map((subItem) => (
                                                <NavLink
                                                    key={subItem.href}
                                                    to={subItem.href}
                                                    onClick={() => {
                                                        setReportsOpen(false);
                                                        if (onLinkClick) onLinkClick();
                                                    }}
                                                    className={({ isActive }) =>
                                                        `flex items-center gap-2 px-3 py-2 text-[11px] transition-colors ${
                                                            isActive
                                                                ? 'bg-[#00A9A8] text-white font-semibold'
                                                                : 'text-[#F2F5FA] hover:bg-white/10'
                                                        }`
                                                    }
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A9A8] shrink-0" />
                                                    <span className="truncate">{subItem.name}</span>
                                                </NavLink>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.nameKey}
                            to={item.href}
                            onClick={onLinkClick}
                            end={item.href === '/purchase-dashboard/dashboard'}
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
                })}
            </nav>

            {/* Bottom Support Section */}
            <div className="py-4 border-t border-white/20 flex flex-col items-center gap-1 shrink-0">
                <button className="flex flex-col items-center justify-center text-[#F2F5FA] hover:text-white transition-colors group cursor-pointer">
                    <HelpCircle className="h-[18px] w-[18px] text-[#F2F5FA] group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] leading-[14px] font-normal text-[#F2F5FA] mt-1">{t('nav.support') || 'Support'}</span>
                </button>
            </div>
        </div>
    );
};

const PurchaseLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const { language, setLanguage, t, isRTL } = useLanguage();
    const navigate = useNavigate();

    const username = localStorage.getItem('username') || 'sajid@star.in';
    const [companyInfo, setCompanyInfo] = useState({ name: 'Company Hub', logoPath: null, logoBlob: null });
    const API_URL = import.meta.env.VITE_API_BASE_URL || '';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const cachedName = sessionStorage.getItem('company_name');
        const cachedLogo = sessionStorage.getItem('company_logo');

        if (cachedName) {
            setCompanyInfo({ name: cachedName, logoPath: null, logoBlob: cachedLogo || null });
            return;
        }

        const fetchCompanyInfo = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get(`${API_URL}/company-info`, { headers });
                const realName = res.data.companyName || 'Company Hub';
                sessionStorage.setItem('company_name', realName);

                if (res.data.logoPath) {
                    setCompanyInfo({ name: realName, logoPath: res.data.logoPath, logoBlob: cachedLogo || null });
                }
            } catch (err) {
                console.error('Failed to fetch company info', err);
            }
        };
        fetchCompanyInfo();
    }, [API_URL]);

    const handleLogout = () => logout(navigate);
    const displayLogo = companyInfo.logoBlob || '/icon.svg';

    return (
        <div className="h-screen bg-[#F7FAFF] flex flex-col font-sans overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Top Header */}
            <header className={`h-[64px] bg-white border-b border-[#DBE5F3] fixed top-0 ${isRTL ? 'right-0 lg:right-[80px] left-0' : 'left-0 lg:left-[80px] right-0'} z-30 flex items-center justify-between px-4 lg:px-6`}>
                
                {/* Left: Mobile menu button & Search input */}
                <div className="flex items-center gap-3 flex-1 max-w-xl">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 rounded-lg text-[#18233B] hover:bg-slate-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="relative w-full max-w-[260px]">
                        <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-[#607089]`}>
                            <Search className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('search.placeholder') || "Search anything..."}
                            className={`w-full h-[38px] ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-xs bg-white border border-[#E2E8F0] rounded-[8px] text-[#18233B] placeholder-[#94A3B8] focus:outline-none focus:border-[#00A9A8] transition-colors`}
                        />
                    </div>
                </div>

                {/* Right tools: Language dropdown, Notification bell, User avatar & text, Logout */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Language Switcher Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                            className="flex items-center gap-2 h-[38px] px-3 bg-white border border-[#E2E8F0] rounded-[8px] text-xs text-[#18233B] hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            <span className="w-4 h-4 rounded-full bg-[#00A9A8]/10 text-[#00A9A8] flex items-center justify-center font-bold text-[10px]">
                                {language === 'ar' ? 'ع' : 'EN'}
                            </span>
                            <span className="font-medium">{language === 'ar' ? 'العربية' : 'English'}</span>
                            <ChevronDown className="h-3.5 w-3.5 text-[#607089]" />
                        </button>

                        <AnimatePresence>
                            {langDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-1 w-36 bg-white border border-[#E2E8F0] rounded-[8px] shadow-lg py-1 z-50`}
                                >
                                    <button
                                        onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${language === 'en' ? 'text-[#00A9A8] font-bold' : 'text-[#18233B]'}`}
                                    >
                                        English {language === 'en' && '✓'}
                                    </button>
                                    <button
                                        onClick={() => { setLanguage('ar'); setLangDropdownOpen(false); }}
                                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${language === 'ar' ? 'text-[#00A9A8] font-bold' : 'text-[#18233B]'}`}
                                    >
                                        العربية {language === 'ar' && '✓'}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Notification Bell */}
                    <button className="relative p-2 text-[#607089] hover:text-[#18233B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" aria-label="Notifications">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full" />
                    </button>

                    {/* User Profile Card */}
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px]">
                        <div className="w-7 h-7 rounded-full bg-[#00A9A8] text-white flex items-center justify-center font-bold text-xs">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden sm:flex flex-col">
                            <span className="text-xs font-semibold text-[#18233B] truncate max-w-[120px]">{username}</span>
                            <span className="text-[10px] text-[#607089] leading-none">{t('profile.role') || 'Administrator'}</span>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="p-2 text-[#607089] hover:text-[#EF4444] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </header>

            {/* Sidebar and Page Body Container */}
            <div className="flex pt-[64px] h-screen overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className={`hidden lg:block fixed ${isRTL ? 'right-0' : 'left-0'} top-0 bottom-0 z-40 w-[80px]`}>
                    <SidebarContent companyLogo={displayLogo} />
                </aside>

                {/* Main Content Area */}
                <main className={`flex-1 ${isRTL ? 'lg:mr-[80px]' : 'lg:ml-[80px]'} p-3 lg:p-4 h-[calc(100vh-64px)] overflow-y-auto no-scrollbar bg-[#F7FAFF]`}>
                    {children || <Outlet />}
                </main>

                {/* Mobile sidebar drawer */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
                            <motion.div initial={{ x: isRTL ? '100%' : '-100%' }} animate={{ x: 0 }} exit={{ x: isRTL ? '100%' : '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-[80px] z-50 bg-[#003E5B] shadow-2xl lg:hidden`}>
                                <SidebarContent companyLogo={displayLogo} onLinkClick={() => setSidebarOpen(false)} />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PurchaseLayout;
