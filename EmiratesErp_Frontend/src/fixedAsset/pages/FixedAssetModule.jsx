import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    List,
    Building2,
    CreditCard,
    PlusCircle,
    Settings,
    LogOut,
    Menu,
    ArrowLeft,
    PieChart,
    Calendar,
    TrendingUp,
    PanelLeftOpen,
    PanelLeftClose
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { logout } from '../../utils/logout';

const fixedAssetNavLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/fixed-asset-dashboard/dashboard', iconBg: 'bg-blue-500/35 text-blue-300' },
    { name: 'Assets List', icon: List, href: '/fixed-asset-dashboard/assets', iconBg: 'bg-emerald-500/35 text-emerald-300' },
    { name: 'Categories', icon: PieChart, href: '/fixed-asset-dashboard/categories', iconBg: 'bg-purple-500/35 text-purple-300' },
    { name: 'Maintenance', icon: Settings, href: '/fixed-asset-dashboard/maintenance', iconBg: 'bg-amber-500/35 text-amber-300' },
    { name: 'Depreciation', icon: Calendar, href: '/fixed-asset-dashboard/depreciation', iconBg: 'bg-indigo-500/35 text-indigo-300' },
];

const SidebarContent = ({ onLinkClick, isCollapsedMode = false, isDesktopCollapsed = true, setIsDesktopCollapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => logout(navigate);

    const NavItem = ({ item }) => {
        return (
            <NavLink
                to={item.href}
                onClick={onLinkClick}
                end={item.href === '/fixed-asset-dashboard/dashboard'}
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
        );
    };

    return (
        <div className="flex flex-col h-full bg-sidebar-bg text-sidebar-text select-none">
            {/* Header section with pin toggle button matching POS position */}
            <div className={`flex items-center py-3 px-3.5 border-b border-white/10 ${isCollapsedMode ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Building2 className="h-4 w-4 text-white fill-current" />
                    </div>
                    {!isCollapsedMode && (
                        <span className="text-sm font-extrabold text-white tracking-tight truncate">Fixed Assets</span>
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
                <button
                    onClick={() => navigate('/company-dashboard')}
                    title={isCollapsedMode ? "Back to Company Hub" : undefined}
                    className={`w-full flex items-center ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sm font-bold rounded-xl transition-all duration-200 mb-2 group text-sidebar-text/80 hover:text-sidebar-text hover:bg-white/10 text-left`}
                >
                    <div className="p-1.5 rounded-full bg-slate-500/35 text-slate-300 flex items-center justify-center flex-shrink-0">
                        <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
                    </div>
                    {!isCollapsedMode && <span className="ml-2.5 truncate">Back to Hub</span>}
                </button>

                {fixedAssetNavLinks.map((item) => (
                    <NavItem key={item.name} item={item} />
                ))}
            </nav>

            <div className="p-3 border-t border-sidebar-text/10 space-y-1">
                <button
                    onClick={handleLogout}
                    title={isCollapsedMode ? "Logout" : undefined}
                    className={`flex items-center ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sm font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl w-full text-left transition group`}
                >
                    <div className="p-1.5 rounded-full bg-rose-500/35 text-rose-300 flex items-center justify-center flex-shrink-0">
                        <LogOut className="h-4 w-4 stroke-[2.5]" />
                    </div>
                    {!isCollapsedMode && <span className="ml-2.5 truncate">Logout</span>}
                </button>
            </div>
        </div>
    );
};

const FixedAssetLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const isExpanded = !isDesktopCollapsed || isHovered;

    return (
        <div className="flex h-screen bg-background text-foreground font-sans">
            {/* Static sidebar for desktop */}
            <aside
                className={`hidden lg:flex lg:flex-col lg:flex-shrink-0 border-r border-border bg-sidebar-bg text-sidebar-text transition-all duration-300 ${isExpanded ? 'w-[220px]' : 'w-[68px]'}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <SidebarContent
                    isCollapsedMode={!isExpanded}
                    isDesktopCollapsed={isDesktopCollapsed}
                    setIsDesktopCollapsed={setIsDesktopCollapsed}
                />
            </aside>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 h-full w-64 z-30 bg-card text-card-foreground"
                        >
                            <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="lg:hidden sticky top-0 z-10 flex-shrink-0 flex h-16 bg-card shadow-sm items-center px-4">
                    <button type="button" className="text-foreground-muted" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex-1 flex justify-center items-center">
                        <span className="font-bold text-lg text-foreground">Fixed Assets</span>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-background-muted">
                    {children}
                </div>
            </main>
        </div>
    );
};

const FixedAssetModule = () => {
    return (
        <FixedAssetLayout>
            <Outlet />
        </FixedAssetLayout>
    );
};

export default FixedAssetModule;
