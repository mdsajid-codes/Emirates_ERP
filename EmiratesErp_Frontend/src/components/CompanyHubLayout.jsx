import React, { useState, useMemo, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Users, ShoppingCart, LogOut, Bell, Settings, Menu, Building, DollarSign, Landmark, Package, Archive, Sparkles, Truck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTenant } from '../context/TenantContext';
import { logout } from '../utils/logout';

// ── NavItem defined at MODULE LEVEL (outside SidebarContent) ─────────────────
// Defining it here means React sees the same component reference on every render,
// so it diffs and updates links in-place instead of unmounting/remounting them.
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

const NavItem = ({ item, onLinkClick }) => (
    <NavLink
        to={item.href}
        onClick={onLinkClick}
        className={({ isActive }) =>
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-theme transition-colors group ${isActive ? 'bg-sidebar-active text-sidebar-text font-bold' : 'text-sidebar-text hover:bg-sidebar-hover opacity-80 hover:opacity-100'
            }`
        }
    >
        {({ isActive }) => (
            <>
                <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${isActive ? 'text-sidebar-text' : item.color}`} />
                <span>{item.name}</span>
            </>
        )}
    </NavLink>
);

const ALL_NAV_LINKS = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/company-dashboard', color: 'text-indigo-500' },
    { name: 'HRMS', icon: Users, href: '/hrdashboard', module: 'HRMS_CORE', color: 'text-blue-500' },
    { name: 'ATS', icon: Users, href: '/ats-dashboard', module: 'ATS', color: 'text-sky-500' },
    { name: 'POS', icon: ShoppingCart, href: '/pos-dashboard', module: 'POS', color: 'text-green-500' },
    { name: 'Sales', icon: DollarSign, href: '/sales-dashboard', module: 'SALES', color: 'text-emerald-500' },
    { name: 'Purchases', icon: ShoppingCart, href: '/purchase-dashboard', module: 'PURCHASE', color: 'text-orange-500' },
    { name: 'CRM', icon: Users, href: '/crm-dashboard', module: 'CRM', color: 'text-rose-500' },
    { name: 'Account', icon: Landmark, href: '/account-dashboard', module: 'ACCOUNTS', color: 'text-amber-500' },
    { name: 'Fixed Assets', icon: LayoutDashboard, href: '/fixed-asset-dashboard', module: 'FIXED_ASSETS', color: 'text-indigo-500' },
    { name: 'Production', icon: Building, href: '/production-dashboard', module: 'PRODUCTION', color: 'text-cyan-500' },
    { name: 'Material', icon: Package, href: '/material-dashboard', module: 'MATERIAL', color: 'text-purple-500' },
    { name: 'Warehouse', icon: Archive, href: '/warehouse-dashboard', module: 'WAREHOUSE', color: 'text-teal-500' },
    { name: 'Notification', icon: Bell, href: '/notification-dashboard', module: 'NOTIFICATION', color: 'text-indigo-600' },
    { name: 'Fleet Management', icon: Truck, href: '/fleet-dashboard', module: 'TRIP_MANAGEMENT', color: 'text-sky-500' },
    { name: 'Settings', icon: Settings, href: '/company-settings', color: 'text-slate-500' },

];

const SidebarContent = ({ onLinkClick }) => {
    const username = localStorage.getItem('username') || 'Admin';
    const navigate = useNavigate();
    const { hasModule } = useTenant();

    const handleLogout = () => logout(navigate);

    const navLinks = useMemo(
        () => ALL_NAV_LINKS.filter(link => !link.module || hasModule(link.module)),
        [hasModule]
    );

    return (
        <div className="flex flex-col h-full">
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {navLinks.map((item) => (
                    <NavItem key={item.name} item={item} onLinkClick={onLinkClick} />
                ))}
            </nav>
            <div className="p-4 border-t border-black/10 flex-shrink-0 bg-sidebar-bg text-sidebar-text">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white flex-shrink-0 border border-white/10 shadow-sm">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-semibold truncate">{username}</span>
                        <span className="text-[10px] opacity-60 uppercase tracking-widest font-bold">Administrator</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CompanyHubLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [companyInfo, setCompanyInfo] = useState({ name: 'Company Hub', logoPath: null, logoBlob: null });
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const cachedName = sessionStorage.getItem('company_name');
        const cachedLogo = sessionStorage.getItem('company_logo');

        // Only use cache if it's not the generic fallback
        if (cachedName && cachedName !== 'Company Hub') {
            setCompanyInfo({ name: cachedName, logoPath: null, logoBlob: cachedLogo || null });
            return;
        }

        const fetchCompanyInfo = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get(`${API_URL}/company-info`, { headers });
                
                const realName = res.data.companyName;
                const companyName = realName || 'Company Hub';
                
                // Only cache if we got a real name from the API
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
                    } catch (imgErr) { 
                        console.error('Failed to fetch company logo blob', imgErr); 
                    }
                }
                setCompanyInfo({ name: companyName, logoPath: rawLogoUrl, logoBlob: null });
            } catch (err) { 
                console.error('Failed to fetch company info for layout', err); 
            }
        };
        fetchCompanyInfo();
    }, [API_URL]);

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Full Width Top Navbar */}
            <header className="flex-shrink-0 h-16 bg-header-bg text-header-text border-b border-border shadow-sm flex items-center justify-between px-4 lg:px-6 z-30 relative">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="opacity-70 hover:opacity-100 hover:bg-black/5 p-2 rounded-theme lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex items-center gap-3">
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
                            <span className="ml-2 px-2 py-0.5 text-xs bg-black/10 rounded-full font-medium tracking-wide">Hub</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-semibold">{localStorage.getItem('username') || 'Admin'}</span>
                            <span className="text-xs opacity-80">Administrator</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center font-bold text-primary flex-shrink-0 border border-[var(--color-primary)]/10 shadow-sm">
                            {(localStorage.getItem('username') || 'A').charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="w-px h-8 bg-black/10"></div>
                    <button
                        onClick={() => logout(navigate)}
                        className="opacity-70 hover:opacity-100 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-black/5"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {/* Main Layout Area */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 flex-col bg-sidebar-bg text-sidebar-text border-r border-border">
                    <SidebarContent />
                </aside>

                {/* Mobile Sidebar (Drawer) */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                                onClick={() => setSidebarOpen(false)}
                            />
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="fixed top-0 left-0 h-full w-64 z-50 bg-white shadow-2xl lg:hidden"
                            >
                                <div className="h-full flex flex-col bg-sidebar-bg text-sidebar-text border-r border-border">
                                    {/* Mobile Menu Header for close button or branding */}
                                    <div className="p-4 border-b border-black/10 flex items-center justify-between">
                                        <span className="font-bold text-lg">Menu</span>
                                        <button onClick={() => setSidebarOpen(false)} className="p-2 opacity-70 hover:opacity-100 hover:bg-black/5 rounded-full">
                                            <Menu className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-background p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default CompanyHubLayout;