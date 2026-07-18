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
    Boxes
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTenant } from '../../context/TenantContext';

// Define navigation items
const warehouseNavLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/warehouse-dashboard/dashboard', color: 'text-blue-600' },
    { name: 'Inventory', icon: Package, href: '/warehouse-dashboard/inventory', color: 'text-emerald-600' },
    { name: 'FG Stock', icon: Boxes, href: '/warehouse-dashboard/fg-stock', color: 'text-blue-500', module: 'HANGER_MANUFACTURING' },
    { name: 'Coil Stock', icon: Cylinder, href: '/warehouse-dashboard/coil-stock', color: 'text-amber-600', module: 'HANGER_MANUFACTURING' },
    { name: 'Stock In', icon: ArrowDownLeft, href: '/warehouse-dashboard/stock-in', color: 'text-indigo-600' },
    { name: 'Stock Out', icon: ArrowUpRight, href: '/warehouse-dashboard/stock-out', color: 'text-rose-600' },
];

const SidebarContent = ({ onLinkClick }) => {
    const navigate = useNavigate();
    const { hasModule } = useTenant();

    const filteredNavLinks = warehouseNavLinks.filter(link => !link.module || hasModule(link.module));

    const handleLogout = () => logout(navigate);

    const NavItem = ({ item }) => (
        <NavLink
            to={item.href}
            onClick={onLinkClick}
            className={({ isActive }) => `
                flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors group 
                ${isActive
                    ? 'bg-purple-50 text-purple-600 shadow-sm border-l-4 border-purple-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
            `}
        >
            <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 ${item.color}`} />
            <span className="truncate">{item.name}</span>
        </NavLink>
    );

    return (
        <div className="flex flex-col h-full bg-white text-gray-800 border-r border-gray-200">
            <div className="p-4 border-b border-gray-100 flex-shrink-0">
                <button onClick={() => navigate('/company-dashboard')} className="flex items-center gap-3 w-full text-left group">
                    <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <ArrowLeft className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                        <span className="block font-bold text-gray-800 text-lg">Company Hub</span>
                        <span className="text-xs text-gray-500">Back to Dashboard</span>
                    </div>
                </button>
            </div>

            <div className="px-4 py-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Warehouse Management</p>
                <nav className="space-y-1">
                    {filteredNavLinks.map((item) => <NavItem key={item.name} item={item} />)}
                </nav>
            </div>

            <div className="mt-auto p-4 border-t border-gray-100 space-y-2">
                <button className="flex items-center px-4 py-2.5 text-sm font-medium className='text-gray-600 hover:bg-gray-50 rounded-lg w-full text-left transition-colors">
                    <Settings className="h-5 w-5 mr-3 text-gray-400" />
                    <span>Settings</span>
                </button>
                <button onClick={handleLogout} className="flex items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg w-full text-left transition-colors">
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

const WarehouseLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-72">
                    <SidebarContent />
                </div>
            </div>

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
