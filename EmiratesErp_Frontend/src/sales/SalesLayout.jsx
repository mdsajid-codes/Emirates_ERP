import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, FileText, Settings, Menu, X, ArrowLeft, ClipboardList, Package, TrendingUp, ChevronDown, ChevronRight, Sparkles, LogOut, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { logout } from '../utils/logout';
import { useNavigate } from 'react-router-dom';

const salesNavLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/sales-dashboard', iconBg: 'bg-emerald-500/35 text-emerald-300' },
    { name: 'Quotations', icon: ClipboardList, href: '/sales-dashboard/quotations', iconBg: 'bg-yellow-500/35 text-yellow-300' },
    { name: 'Rental Quotations', icon: Package, href: '/sales-dashboard/rental-quotations', iconBg: 'bg-orange-500/35 text-orange-300' },
    { name: 'Rental Recieved Item', icon: ClipboardList, href: '/sales-dashboard/rental-item-received', iconBg: 'bg-green-500/35 text-green-300' },
    { name: 'Rental Sales Order', icon: ClipboardList, href: '/sales-dashboard/rental-sales-orders', iconBg: 'bg-teal-500/35 text-teal-300' },
    { name: 'Orders', icon: ShoppingCart, href: '/sales-dashboard/orders', iconBg: 'bg-blue-500/35 text-blue-300' },
    { name: 'Delivery Orders', icon: Package, href: '/sales-dashboard/delivery-orders', iconBg: 'bg-pink-500/35 text-pink-300' },
    { name: 'Proforma Invoice', icon: FileText, href: '/sales-dashboard/proforma-invoices', iconBg: 'bg-cyan-500/35 text-cyan-300' },
    { name: 'Rental Invoices', icon: FileText, href: '/sales-dashboard/rental-invoices', iconBg: 'bg-indigo-500/35 text-indigo-300' },
    { name: 'Invoices', icon: FileText, href: '/sales-dashboard/invoices', iconBg: 'bg-purple-500/35 text-purple-300' },
    { name: 'Received Amount', icon: FileText, href: '/sales-dashboard/recieved-amounts', iconBg: 'bg-emerald-600/35 text-emerald-300' },
    { name: 'Credit Notes', icon: FileText, href: '/sales-dashboard/credit-notes', iconBg: 'bg-rose-500/35 text-rose-300' },
    { name: 'Additional Expenses', icon: TrendingUp, href: '/sales-dashboard/additional-expenses', iconBg: 'bg-emerald-500/35 text-emerald-300' },
    { name: 'Settings', icon: Settings, href: '/sales-dashboard/settings', iconBg: 'bg-slate-500/35 text-slate-300' },
];

const SidebarContent = ({ onLinkClick, isCollapsedMode = false, isDesktopCollapsed = true, setIsDesktopCollapsed }) => {
    const location = useLocation();
    const [reportsOpen, setReportsOpen] = useState(false);

    return (
        <div className="flex flex-col h-full bg-sidebar-bg text-sidebar-text select-none">
            {/* Header section with pin toggle button matching POS position */}
            <div className={`flex items-center py-3 px-3.5 border-b border-white/10 ${isCollapsedMode ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <TrendingUp className="h-4 w-4 text-white fill-current" />
                    </div>
                    {!isCollapsedMode && (
                        <span className="text-sm font-extrabold text-white tracking-tight truncate">Sales Hub</span>
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
                <NavLink
                    to="/company-dashboard"
                    onClick={onLinkClick}
                    title={isCollapsedMode ? "Back to Company Hub" : undefined}
                    className={`flex items-center ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sm font-bold rounded-xl transition-all duration-200 mb-2 group text-sidebar-text/80 hover:text-sidebar-text hover:bg-white/10`}
                >
                    <div className="p-1.5 rounded-full bg-slate-500/35 text-slate-300 flex items-center justify-center flex-shrink-0">
                        <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
                    </div>
                    {!isCollapsedMode && <span className="ml-2.5 truncate">Back to Hub</span>}
                </NavLink>

                {salesNavLinks.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={onLinkClick}
                        end={item.href === '/sales-dashboard'}
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
                ))}

                <div className="pt-1">
                    <button
                        onClick={() => setReportsOpen(!reportsOpen)}
                        title={isCollapsedMode ? "Reports" : undefined}
                        className={`flex items-center w-full ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sm font-bold rounded-xl text-sidebar-text/80 hover:text-sidebar-text hover:bg-sidebar-hover transition-all group`}
                    >
                        <div className="p-1.5 rounded-full bg-fuchsia-500/35 text-fuchsia-300 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 stroke-[2.5]" />
                        </div>
                        {!isCollapsedMode && (
                            <>
                                <span className="flex-1 text-left ml-2.5 truncate">Reports</span>
                                {reportsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </>
                        )}
                    </button>
                    {reportsOpen && !isCollapsedMode && (
                        <div className="pl-4 mt-1 space-y-1">
                            {[
                                { name: 'Sales Order By Item', to: '/sales-dashboard/reports/sales-order-by-item' },
                                { name: 'Sales Order By Customer', to: '/sales-dashboard/reports/sales-order-by-customer' },
                                { name: 'List of Due Bills', to: '/sales-dashboard/reports/due-bills' },
                                { name: 'List of Due Invoices', to: '/sales-dashboard/reports/due-invoices' },
                                { name: 'Sales by Salesperson', to: '/sales-dashboard/reports/sales-by-salesperson' },
                                { name: 'Sales by Item', to: '/sales-dashboard/reports/sales-by-item' },
                                { name: 'Sales by Customer', to: '/sales-dashboard/reports/sales-by-customer' },
                            ].map((rep) => (
                                <NavLink
                                    key={rep.name}
                                    to={rep.to}
                                    onClick={onLinkClick}
                                    className={({ isActive }) => `flex items-center px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${isActive ? 'bg-sidebar-active/30 text-sidebar-text' : 'text-sidebar-text/70 hover:text-sidebar-text hover:bg-sidebar-hover'}`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 mr-2.5 flex-shrink-0" />
                                    <span className="truncate">{rep.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
};

const SalesLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const isExpanded = !isDesktopCollapsed || isHovered;

    const navigate = useNavigate();
    const [companyInfo, setCompanyInfo] = useState({ name: 'Enterprise Sales', logoPath: null, logoBlob: null });
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const username = localStorage.getItem('username') || 'Admin';

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
                
                const realName = res.data.companyName;
                const companyName = realName || 'Enterprise Sales';
                
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

    const handleLogout = () => logout(navigate);

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

    return (
        <div className="flex flex-col h-screen bg-background text-foreground print:h-auto print:overflow-visible">
            {/* Unified Top Header */}
            <header className="flex-shrink-0 h-16 bg-header-bg text-header-text shadow-sm border-b border-border flex items-center justify-between px-4 lg:px-6 z-30 relative print:hidden">
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
                        <div className="hidden md:block text-header-text">
                            <span className="font-bold text-lg">{companyInfo.name}</span>
                            <span className="ml-2 px-2 py-0.5 text-xs bg-black/10 rounded-full font-medium tracking-wide">Sales</span>
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
                    <div className="w-px h-8 bg-black/10 mx-2"></div>
                    <button
                        onClick={handleLogout}
                        className="opacity-70 hover:opacity-100 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-black/5"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative print:h-auto print:overflow-visible">
                {/* Static sidebar for desktop */}
                <aside
                    className={`hidden lg:flex lg:flex-col lg:flex-shrink-0 border-r border-border bg-sidebar-bg text-sidebar-text print:hidden transition-all duration-300 ${isExpanded ? 'w-[220px]' : 'w-[68px]'}`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <SidebarContent
                        isCollapsedMode={!isExpanded}
                        isDesktopCollapsed={isDesktopCollapsed}
                        setIsDesktopCollapsed={setIsDesktopCollapsed}
                    />
                </aside>

                <main className="flex-1 flex flex-col overflow-hidden print:overflow-visible print:h-auto">
                    {/* Mobile title bar - only if needed, but we have the header now */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 print:p-0 print:overflow-visible">
                        <Outlet />
                    </div>
                </main>

                {/* Mobile sidebar drawer */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden print:hidden" onClick={() => setSidebarOpen(false)} />
                            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 left-0 h-full w-64 z-50 bg-sidebar-bg text-sidebar-text shadow-2xl print:hidden">
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

export default SalesLayout;