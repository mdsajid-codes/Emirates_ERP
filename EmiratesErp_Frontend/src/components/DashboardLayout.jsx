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
} from 'lucide-react';
import { AnimatePresence, motion } from "framer-motion";
import { useTenant } from "../context/TenantContext.jsx";
import { logout } from '../utils/logout';

const navLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/hrdashboard', module: 'HRMS_CORE', color: 'text-sky-500' },
    { name: 'Employees', icon: Users, href: '/employees', module: 'HRMS_CORE', color: 'text-blue-500' },
    { name: 'Attendance', icon: CalendarClock, href: '/attendance', module: 'HRMS_ATTENDANCE', color: 'text-orange-500' },
    { name: 'Leave', icon: CalendarClock, href: '/leave', module: 'HRMS_LEAVE', color: 'text-yellow-500' },
    { name: 'Payroll Management', icon: DollarSign, href: '/payroll-management', module: 'HRMS_PAYROLL', color: 'text-green-500' },
    { name: 'Users', icon: ShieldCheck, href: '/users-details', color: 'text-purple-500' },
    { name: 'Reports', icon: BarChart2, href: '/reports', color: 'text-rose-500' },
];

const NavItem = ({ item, onClick }) => (
    <NavLink
        to={item.href}
        onClick={onClick}
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

const SidebarContent = ({ onLinkClick }) => {
    const roles = useMemo(() => JSON.parse(localStorage.getItem('roles') || '[]'), []);
    const isSuperAdmin = useMemo(() => roles.includes('SUPER_ADMIN'), [roles]);
    const { hasModule } = useTenant();

    const accessibleNavLinks = useMemo(() => {
        return navLinks.filter(link => !link.module || hasModule(link.module));
    }, [hasModule]);

    return (
        <div className="flex flex-col h-full bg-sidebar-bg text-sidebar-text">
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {accessibleNavLinks.map((item) => (
                    <NavItem key={item.name} item={item} onClick={onLinkClick} />
                ))}
                {isSuperAdmin && (
                    <div className="pt-4 mt-4 border-t border-white/10">
                        <NavItem item={{ name: 'Company Hub', icon: Home, href: '/company-dashboard' }} onClick={onLinkClick} />
                    </div>
                )}
            </nav>
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

const DashboardLayout = ({ children, hideSidebar = false }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const handleLogout = () => logout(navigate);
    const username = localStorage.getItem('username') || 'Admin';

    const [companyInfo, setCompanyInfo] = useState({ name: 'Enterprise HRMS', logoPath: null, logoBlob: null });
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
                const companyName = realName || 'Enterprise HRMS';
                
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
        <div className="flex flex-col h-screen bg-background text-foreground">
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
                            <span className="ml-2 px-2 py-0.5 text-xs bg-black/10 rounded-full font-medium tracking-wide">HRMS</span>
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
                {!hideSidebar && (
                    <aside className="hidden lg:flex lg:flex-shrink-0 w-64 border-r border-border bg-sidebar-bg text-sidebar-text">
                        <SidebarContent />
                    </aside>
                )}

                {/* Main content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto min-w-0">
                    {children}
                </main>

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
                                className="fixed top-0 left-0 h-full w-64 z-50 bg-sidebar-bg text-sidebar-text shadow-2xl"
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

export default DashboardLayout;