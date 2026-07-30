import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams, NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    ClipboardList,
    Users,
    BarChart,
    Settings,
    LogOut,
    Menu,
    ChevronDown,
    Home,
    Sparkles,
    Search,
    Bell,
    Rocket,
    CreditCard,
    ArrowRightLeft,
    Shield,
    Sliders
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePosTheme } from './usePosTheme';
import PosSettingsView from './PosSettingsView';
import CustomersView from './CustomersView';
import ProductsView from './ProductsView';
import SalesView from './SalesView';
import InventoryView from './InventoryView';
import PosDashboardView from './PosDashboardView';
import ReportsView from './ReportsView';

const navLinksOverview = [
    { name: 'Dashboard', icon: LayoutDashboard, Component: PosDashboardView },
    { name: 'Products', icon: Package, Component: ProductsView },
    { name: 'Sales', icon: ShoppingCart, Component: SalesView },
    { name: 'Inventory', icon: ClipboardList, Component: InventoryView },
    { name: 'Customers', icon: Users, Component: CustomersView },
];

const navLinksOther = [
    { name: 'Reports', icon: BarChart, Component: ReportsView },
    { name: 'Settings', icon: Settings, Component: PosSettingsView },
];

const PosDashboard = () => {
    const { posTheme } = usePosTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeItem = searchParams.get('view') || 'Dashboard';
    const navigate = useNavigate();

    const username = localStorage.getItem('username') || 'Josie';
    const [tenantName, setTenantName] = useState('POS');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const roles = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('roles') || '[]');
        } catch { return []; }
    }, []);
    const isSuperAdmin = roles.includes('SUPER_ADMIN');

    const setActiveItem = (itemName) => {
        setSearchParams({ view: itemName });
    };

    useEffect(() => {
        if (!searchParams.get('view')) {
            setSearchParams({ view: 'Dashboard' }, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get(`${API_URL}/company-info`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data && res.data.companyName) {
                    setTenantName(res.data.companyName);
                }
            } catch (e) {
                // Keep default
            }
        };
        fetchCompany();
    }, [API_URL]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const renderContent = () => {
        const allLinks = [...navLinksOverview, ...navLinksOther];
        const activeLink = allLinks.find(link => link.name === activeItem) || navLinksOverview[0];
        const Component = activeLink.Component;
        return <Component key={activeItem} setActiveItem={setActiveItem} posTheme={posTheme} />;
    };

    const SidebarNav = () => (
        <div 
            className="flex flex-col h-full text-white p-5 justify-between select-none transition-colors duration-300"
            style={{ backgroundColor: posTheme.sidebarBg, color: posTheme.sidebarText }}
        >
            <div>
                {/* Logo Section */}
                <div className="flex items-center gap-3 px-2 py-3 mb-6">
                    <div 
                        className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: posTheme.sidebarActive, color: posTheme.sidebarActiveFg }}
                    >
                        <Sparkles className="h-5 w-5 fill-current" />
                    </div>
                    <div>
                        <span className="text-2xl font-extrabold tracking-tight" style={{ color: posTheme.sidebarText }}>{tenantName}</span>
                        <p className="text-[9px] uppercase font-bold tracking-widest -mt-1 opacity-90" style={{ color: posTheme.sidebarActive }}>PROFILES ELASTOMERES</p>
                    </div>
                </div>

                {/* Overview Section */}
                <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-3 opacity-70" style={{ color: posTheme.sidebarText }}>Overview</p>
                    <nav className="space-y-1.5">
                        {navLinksOverview.map((item) => {
                            const isActive = activeItem === item.name;
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        setActiveItem(item.name);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                                        isActive ? 'shadow-md font-bold' : 'opacity-80 hover:opacity-100'
                                    }`}
                                    style={{
                                        backgroundColor: isActive ? posTheme.sidebarActive : 'transparent',
                                        color: isActive ? posTheme.sidebarActiveFg : posTheme.sidebarText,
                                    }}
                                >
                                    <Icon className="h-5 w-5" style={{ color: isActive ? posTheme.sidebarActiveFg : posTheme.sidebarText }} />
                                    <span>{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Other Section */}
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-3 opacity-70" style={{ color: posTheme.sidebarText }}>Other</p>
                    <nav className="space-y-1.5">
                        {navLinksOther.map((item) => {
                            const isActive = activeItem === item.name;
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        setActiveItem(item.name);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                                        isActive ? 'shadow-md font-bold' : 'opacity-80 hover:opacity-100'
                                    }`}
                                    style={{
                                        backgroundColor: isActive ? posTheme.sidebarActive : 'transparent',
                                        color: isActive ? posTheme.sidebarActiveFg : posTheme.sidebarText,
                                    }}
                                >
                                    <Icon className="h-5 w-5" style={{ color: isActive ? posTheme.sidebarActiveFg : posTheme.sidebarText }} />
                                    <span>{item.name}</span>
                                </button>
                            );
                        })}

                        {isSuperAdmin && (
                            <NavLink
                                to="/company-dashboard"
                                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold opacity-80 hover:opacity-100 transition-all"
                                style={{ color: posTheme.sidebarText }}
                            >
                                <Home className="h-5 w-5" style={{ color: posTheme.sidebarText }} />
                                <span>Company Hub</span>
                            </NavLink>
                        )}
                    </nav>
                </div>
            </div>

            {/* Bottom Rocket Card */}
            <div className="mt-8 relative pt-8">
                <div 
                    className="rounded-3xl p-5 pt-8 text-center relative shadow-lg"
                    style={{ backgroundColor: posTheme.accent, color: posTheme.accentFg }}
                >
                    {/* Rocket Icon floating at top */}
                    <div 
                        className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-md"
                        style={{ backgroundColor: posTheme.sidebarBg, borderColor: posTheme.sidebarBg }}
                    >
                        <Rocket className="h-7 w-7 text-rose-500 fill-amber-400" />
                    </div>

                    <h4 className="text-sm font-extrabold leading-tight mt-1" style={{ color: posTheme.accentFg }}>
                        New update available
                    </h4>
                    <p className="text-xs font-medium mt-0.5 mb-3 opacity-80" style={{ color: posTheme.accentFg }}>
                        click to update
                    </p>

                    <button
                        onClick={() => alert('App updated successfully!')}
                        className="w-full text-xs font-bold py-2.5 px-4 rounded-full transition-colors shadow-md hover:opacity-90"
                        style={{ backgroundColor: posTheme.sidebarBg, color: posTheme.sidebarText }}
                    >
                        Update!
                    </button>
                </div>
            </div>
        </div>
    );

// Helper: Character-by-character letter animation with proper word wrapping
function AnimatedWelcomeText({ text }) {
    const words = text.split(' ');
    let globalCharIndex = 0;

    return (
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex flex-wrap">
            {words.map((word, wordIndex) => (
                <span key={wordIndex} className="inline-flex whitespace-nowrap mr-2 last:mr-0">
                    {word.split('').map((char, charIndex) => {
                        const i = globalCharIndex++;
                        return (
                            <motion.span
                                key={charIndex}
                                initial={{ opacity: 0, filter: 'blur(5px)', y: 10 }}
                                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                                transition={{ delay: 0.04 * i, duration: 0.25, ease: 'easeOut' }}
                                style={{ display: 'inline-block' }}
                            >
                                {char}
                            </motion.span>
                        );
                    })}
                </span>
            ))}
        </h1>
    );
}

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex font-sans">
            {/* Desktop Fixed Dark Sidebar (Matching Reference Image) */}
            <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 p-3">
                <div className="h-[calc(100vh-24px)] sticky top-3 rounded-[32px] overflow-hidden shadow-xl">
                    <SidebarNav />
                </div>
            </aside>

            {/* Main Content & Top Bar */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Main Top Header */}
                <header className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 border-b border-slate-200/40">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-700 bg-white rounded-xl shadow-xs"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div>
                            <AnimatedWelcomeText key={username} text={`Welcome back, ${username}!`} />
                        </div>
                    </div>

                    {/* Right side search & user avatar */}
                    <div className="flex items-center gap-3">
                        <div className="relative hidden sm:block w-64 lg:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search...."
                                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full text-sm border-0 shadow-xs outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 transition-all"
                            />
                        </div>

                        <button className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-full shadow-xs transition-colors relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full" />
                        </button>

                        <div className="flex items-center gap-2 pl-2 group relative cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-amber-200 border-2 border-white overflow-hidden shadow-xs flex items-center justify-center text-amber-900 font-bold text-base">
                                {username.charAt(0).toUpperCase()}
                            </div>

                            {/* Dropdown Menu on hover */}
                            <div className="absolute right-0 top-full pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-30">
                                <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-2 w-48">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Drawer */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                                onClick={() => setSidebarOpen(false)}
                            />
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="fixed top-0 left-0 h-full w-72 z-50 overflow-y-auto"
                            >
                                <SidebarNav />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Content View */}
                <main className="flex-1 pb-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default PosDashboard;


