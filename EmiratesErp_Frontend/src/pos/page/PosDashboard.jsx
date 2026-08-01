import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    Sliders,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';
import PosDashboardView from './PosDashboardView';
import ProductsView from './ProductsView';
import SalesView from './SalesView';
import InventoryView from './InventoryView';
import CustomersView from './CustomersView';
import ReportsView from './ReportsView';
import PosSettingsView from './PosSettingsView';
import { usePosTheme } from './usePosTheme';

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
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
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

    const isExpanded = !isDesktopCollapsed || isHovered;

    const renderContent = () => {
        const allLinks = [...navLinksOverview, ...navLinksOther];
        const activeLink = allLinks.find(link => link.name === activeItem) || navLinksOverview[0];
        const Component = activeLink.Component;
        return <Component key={activeItem} setActiveItem={setActiveItem} posTheme={posTheme} />;
    };

    const SidebarNav = ({ isCollapsedMode = false }) => (
        <div
            className={`flex flex-col h-full text-white p-3.5 sm:p-4 justify-between select-none transition-all duration-300 ${isCollapsedMode ? 'items-center px-2' : ''}`}
            style={{ backgroundColor: posTheme.sidebarBg, color: posTheme.sidebarText }}
        >
            <div>
                {/* Logo & Toggle Section */}
                <div className={`flex items-center mb-6 py-2 px-1 ${isCollapsedMode ? 'justify-center flex-col gap-2' : 'justify-between gap-2'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div
                            className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs flex-shrink-0 cursor-pointer"
                            onClick={() => setIsDesktopCollapsed(prev => !prev)}
                            style={{ backgroundColor: posTheme.sidebarActive, color: posTheme.sidebarActiveFg }}
                            title={isDesktopCollapsed ? "Click to toggle sidebar" : undefined}
                        >
                            <Sparkles className="h-5 w-5 fill-current" />
                        </div>
                        {!isCollapsedMode && (
                            <div className="min-w-0 flex-1">
                                <span className="text-xl font-extrabold tracking-tight truncate block" style={{ color: posTheme.sidebarText }}>{tenantName}</span>
                                <p className="text-[9px] uppercase font-bold tracking-widest -mt-0.5 opacity-90 truncate" style={{ color: posTheme.sidebarActive }}>PROFILES ELASTOMERES</p>
                            </div>
                        )}
                    </div>
                    {/* Toggle button for desktop */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsDesktopCollapsed(prev => !prev);
                        }}
                        className="hidden lg:flex items-center justify-center p-1.5 rounded-xl opacity-80 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer"
                        title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isDesktopCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                    </button>
                </div>

                {/* Overview Section */}
                <div className="mb-6">
                    {!isCollapsedMode ? (
                        <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2.5 opacity-70" style={{ color: posTheme.sidebarText }}>Overview</p>
                    ) : (
                        <div className="h-px bg-white/10 mb-3 mx-2" />
                    )}
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
                                    title={isCollapsedMode ? item.name : undefined}
                                    className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                                        isCollapsedMode ? 'justify-center px-0' : ''
                                    } ${isActive ? 'shadow-md font-bold' : 'opacity-80 hover:opacity-100'}`}
                                    style={{
                                        backgroundColor: isActive ? posTheme.sidebarActive : 'transparent',
                                        color: isActive ? posTheme.sidebarActiveFg : posTheme.sidebarText,
                                    }}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" style={{ color: isActive ? posTheme.sidebarActiveFg : posTheme.sidebarText }} />
                                    {!isCollapsedMode && <span className="truncate">{item.name}</span>}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Other Section */}
                <div>
                    {!isCollapsedMode ? (
                        <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2.5 opacity-70" style={{ color: posTheme.sidebarText }}>Other</p>
                    ) : (
                        <div className="h-px bg-white/10 mb-3 mx-2" />
                    )}
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
                                    title={isCollapsedMode ? item.name : undefined}
                                    className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                                        isCollapsedMode ? 'justify-center px-0' : ''
                                    } ${isActive ? 'shadow-md font-bold' : 'opacity-80 hover:opacity-100'}`}
                                    style={{
                                        backgroundColor: isActive ? posTheme.sidebarActive : 'transparent',
                                        color: isActive ? posTheme.sidebarActiveFg : posTheme.sidebarText,
                                    }}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" style={{ color: isActive ? posTheme.sidebarActiveFg : posTheme.sidebarText }} />
                                    {!isCollapsedMode && <span className="truncate">{item.name}</span>}
                                </button>
                            );
                        })}

                        {isSuperAdmin && (
                            <NavLink
                                to="/company-dashboard"
                                title={isCollapsedMode ? "Company Hub" : undefined}
                                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-sm font-semibold opacity-80 hover:opacity-100 transition-all ${
                                    isCollapsedMode ? 'justify-center px-0' : ''
                                }`}
                                style={{ color: posTheme.sidebarText }}
                            >
                                <Home className="h-5 w-5 flex-shrink-0" style={{ color: posTheme.sidebarText }} />
                                {!isCollapsedMode && <span className="truncate">Company Hub</span>}
                            </NavLink>
                        )}
                    </nav>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex font-sans">
            {/* Desktop Fixed Dark Sidebar with Collapsible / Hover Expand behavior */}
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`hidden lg:block flex-shrink-0 p-3 transition-all duration-300 ease-in-out ${
                    isExpanded ? 'w-64 xl:w-72' : 'w-20'
                }`}
            >
                <div className="h-[calc(100vh-24px)] sticky top-3 rounded-[32px] overflow-hidden shadow-xl">
                    <SidebarNav isCollapsedMode={!isExpanded} />
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
                        {/* <div>
                            <AnimatedWelcomeText key={username} text={`Welcome back, ${username}!`} />
                        </div> */}
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


