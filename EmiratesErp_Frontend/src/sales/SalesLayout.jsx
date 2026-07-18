import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, FileText, Settings, Menu, X, ArrowLeft, ClipboardList, Package, TrendingUp, ChevronDown, ChevronRight, Sparkles, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { logout } from '../utils/logout';
import { useNavigate } from 'react-router-dom';

const salesNavLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/sales-dashboard', color: 'text-sky-500' },
    { name: 'Quotations', icon: ClipboardList, href: '/sales-dashboard/quotations', color: 'text-yellow-500' },
    { name: 'Rental Quotations', icon: Package, href: '/sales-dashboard/rental-quotations', color: 'text-orange-500' },
    { name: 'Rental Recieved Item', icon: ClipboardList, href: '/sales-dashboard/rental-item-received', color: 'text-green-500' },
    { name: 'Rental Sales Order', icon: ClipboardList, href: '/sales-dashboard/rental-sales-orders', color: 'text-teal-500' },
    { name: 'Orders', icon: ShoppingCart, href: '/sales-dashboard/orders', color: 'text-blue-500' },
    { name: 'Delivery Orders', icon: Package, href: '/sales-dashboard/delivery-orders', color: 'text-pink-500' },
    { name: 'Proforma Invoice', icon: FileText, href: '/sales-dashboard/proforma-invoices', color: 'text-cyan-500' },
    { name: 'Rental Invoices', icon: FileText, href: '/sales-dashboard/rental-invoices', color: 'text-indigo-500' },
    { name: 'Invoices', icon: FileText, href: '/sales-dashboard/invoices', color: 'text-purple-500' },
    { name: 'Received Amount', icon: FileText, href: '/sales-dashboard/recieved-amounts', color: 'text-emerald-600' },
    { name: 'Credit Notes', icon: FileText, href: '/sales-dashboard/credit-notes', color: 'text-rose-500' },
    { name: 'Additional Expenses', icon: TrendingUp, href: '/sales-dashboard/additional-expenses', color: 'text-emerald-500' },
    { name: 'Settings', icon: Settings, href: '/sales-dashboard/settings', color: 'text-gray-500' },
];

const SidebarContent = ({ onLinkClick }) => {
    const location = useLocation();
    const [reportsOpen, setReportsOpen] = useState(false);

    // Filter out 'Reports' related links from the main loop if we want to handle them separately, 
    // or just render the main links and then the reports section manually like PurchaseModule.
    // Based on PurchaseModule, it renders navLinks and THEN the reports section manually.
    // So we should remove 'Sales Order By Item' from salesNavLinks and render it inside the Reports dropdown.

    return (
        <div className="flex flex-col h-full bg-sidebar-bg text-sidebar-text">
            <div className="p-4 border-b border-border flex-shrink-0">
                <NavLink to="/company-dashboard" className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition-opacity">
                    <ArrowLeft size={16} /> Back to Company Hub
                </NavLink>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {salesNavLinks.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={onLinkClick}
                        end={item.href === '/sales-dashboard'}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2.5 text-sm font-medium rounded-theme transition-colors group ${isActive ? 'bg-sidebar-active text-sidebar-active-foreground font-bold' : 'text-sidebar-text hover:bg-sidebar-hover opacity-80 hover:opacity-100'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 ${isActive ? '' : item.color}`} />
                                <span>{item.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}

                <div className="pt-2">
                    <button 
                        onClick={() => setReportsOpen(!reportsOpen)}
                        className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-theme text-sidebar-text opacity-80 hover:opacity-100 hover:bg-sidebar-hover group transition-all"
                    >
                        <FileText className="h-5 w-5 mr-3 flex-shrink-0 text-fuchsia-600" />
                        <span className="flex-1 text-left">Reports</span>
                        {reportsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    {reportsOpen && (
                        <div className="pl-4 mt-1 space-y-1">
                            <NavLink 
                                to="/sales-dashboard/reports/sales-order-by-item" 
                                onClick={onLinkClick}
                                className={({ isActive }) => `flex items-center px-4 py-2 text-sm font-medium rounded-theme transition-colors ${ isActive ? 'bg-sidebar-active text-sidebar-text' : 'text-sidebar-text opacity-70 hover:opacity-100 hover:bg-sidebar-hover' }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-600 mr-3" />
                                Sales Order By Item
                            </NavLink>
                            <NavLink 
                                to="/sales-dashboard/reports/sales-order-by-customer" 
                                onClick={onLinkClick}
                                className={({ isActive }) => `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${ isActive ? 'bg-primary/10 text-primary' : 'text-foreground-muted hover:bg-background-muted' }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 mr-3" />
                                Sales Order By Customer
                            </NavLink>
                            <NavLink 
                                to="/sales-dashboard/reports/due-bills" 
                                onClick={onLinkClick}
                                className={({ isActive }) => `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${ isActive ? 'bg-primary/10 text-primary' : 'text-foreground-muted hover:bg-background-muted' }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-3" />
                                List of Due Bills
                            </NavLink>
                            <NavLink 
                                to="/sales-dashboard/reports/due-invoices" 
                                onClick={onLinkClick}
                                className={({ isActive }) => `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${ isActive ? 'bg-primary/10 text-primary' : 'text-foreground-muted hover:bg-background-muted' }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mr-3" />
                                List of Due Invoices
                            </NavLink>
                            <NavLink 
                                to="/sales-dashboard/reports/sales-by-salesperson" 
                                onClick={onLinkClick}
                                className={({ isActive }) => `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${ isActive ? 'bg-primary/10 text-primary' : 'text-foreground-muted hover:bg-background-muted' }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 mr-3" />
                                Sales by Salesperson
                            </NavLink>
                            <NavLink 
                                to="/sales-dashboard/reports/sales-by-item" 
                                onClick={onLinkClick}
                                className={({ isActive }) => `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${ isActive ? 'bg-primary/10 text-primary' : 'text-foreground-muted hover:bg-background-muted' }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-pink-600 mr-3" />
                                Sales by Item
                            </NavLink>
                            <NavLink 
                                to="/sales-dashboard/reports/sales-by-customer" 
                                onClick={onLinkClick}
                                className={({ isActive }) => `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${ isActive ? 'bg-primary/10 text-primary' : 'text-foreground-muted hover:bg-background-muted' }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-3" />
                                Sales by Customer
                            </NavLink>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
};

const SalesLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
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
                <aside className="hidden lg:flex lg:flex-shrink-0 w-64 border-r border-border bg-sidebar-bg text-sidebar-text print:hidden">
                    <SidebarContent />
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