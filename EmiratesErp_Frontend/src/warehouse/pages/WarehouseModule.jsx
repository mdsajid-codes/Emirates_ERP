import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { logout } from '../../utils/logout';
import {
    LayoutDashboard,
    Package,
    ArrowDownLeft,
    ArrowUpRight,
    Settings,
    LogOut,
    Menu,
    ArrowLeft,
    Cylinder,
    Boxes,
    Warehouse,
    PanelLeftOpen,
    PanelLeftClose
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTenant } from '../../context/TenantContext';

const warehouseNavLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/warehouse-dashboard/dashboard', iconBg: 'bg-blue-500/35 text-blue-300' },
    { name: 'Inventory', icon: Package, href: '/warehouse-dashboard/inventory', iconBg: 'bg-emerald-500/35 text-emerald-300' },
    { name: 'FG Stock', icon: Boxes, href: '/warehouse-dashboard/fg-stock', iconBg: 'bg-indigo-500/35 text-indigo-300', module: 'HANGER_MANUFACTURING' },
    { name: 'Coil Stock', icon: Cylinder, href: '/warehouse-dashboard/coil-stock', iconBg: 'bg-amber-500/35 text-amber-300', module: 'HANGER_MANUFACTURING' },
    { name: 'Stock In', icon: ArrowDownLeft, href: '/warehouse-dashboard/stock-in', iconBg: 'bg-cyan-500/35 text-cyan-300' },
    { name: 'Stock Out', icon: ArrowUpRight, href: '/warehouse-dashboard/stock-out', iconBg: 'bg-rose-500/35 text-rose-300' },
];

const SidebarContent = ({ onLinkClick, isCollapsedMode = false, isDesktopCollapsed = true, setIsDesktopCollapsed }) => {
    const navigate = useNavigate();
    const { hasModule } = useTenant();

    const filteredNavLinks = warehouseNavLinks.filter(link => !link.module || hasModule(link.module));

    const handleLogout = () => logout(navigate);

    const NavItem = ({ item }) => (
        <NavLink
            to={item.href}
            onClick={onLinkClick}
            end={item.href === '/warehouse-dashboard/dashboard'}
            title={isCollapsedMode ? item.name : undefined}
            className={({ isActive }) => `
                flex items-center ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sm font-bold rounded-xl transition-all duration-200 mb-1 group 
                ${isActive
                    ? 'bg-sidebar-active/20 text-sidebar-text shadow-sm'
                    : 'text-sidebar-text/80 hover:text-sidebar-text hover:bg-sidebar-hover'
                }
            `}
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

    return (
        <div className="flex flex-col h-full bg-sidebar-bg text-sidebar-text select-none">
            {/* Header section with pin toggle button matching POS position */}
            <div className={`flex items-center py-3 px-3.5 border-b border-white/10 ${isCollapsedMode ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Warehouse className="h-4 w-4 text-white fill-current" />
                    </div>
                    {!isCollapsedMode && (
                        <span className="text-sm font-extrabold text-white tracking-tight truncate">Warehouse Hub</span>
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

                {filteredNavLinks.map((item) => <NavItem key={item.name} item={item} />)}
            </nav>

            <div className="p-3 border-t border-sidebar-text/10 space-y-1">
                <button
                    title={isCollapsedMode ? "Settings" : undefined}
                    className={`flex items-center ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sidebar-text/80 hover:text-sidebar-text text-sm font-bold rounded-xl hover:bg-sidebar-hover transition group w-full text-left`}
                >
                    <div className="p-1.5 rounded-full bg-slate-500/35 text-slate-300 flex items-center justify-center flex-shrink-0">
                        <Settings className="h-4 w-4 stroke-[2.5]" />
                    </div>
                    {!isCollapsedMode && <span className="ml-2.5 truncate">Settings</span>}
                </button>
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

const WarehouseLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const isExpanded = !isDesktopCollapsed || isHovered;

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
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
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 h-full w-72 z-50 bg-white shadow-xl"
                        >
                            <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden min-w-0">
                <header className="lg:hidden sticky top-0 z-30 flex-shrink-0 flex h-16 bg-white shadow-sm items-center px-4 border-b border-gray-200">
                    <button type="button" className="text-gray-500 hover:text-gray-700 focus:outline-none" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex-1 flex justify-center items-center">
                        <span className="font-bold text-lg text-gray-800">Warehouse Module</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="h-full w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

const WarehouseModule = () => {
    return (
        <WarehouseLayout>
            <Outlet />
        </WarehouseLayout>
    );
}

export default WarehouseModule;
