import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../utils/logout';
import {
    LayoutDashboard,
    Mail,
    MessageCircle,
    Smartphone,
    Send,
    Globe,
    Settings,
    LogOut,
    Menu,
    ArrowLeft,
    Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const notificationNavLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/notification-dashboard', color: 'text-blue-500' },
    { name: 'Email', icon: Mail, href: '/notification-dashboard/email', color: 'text-indigo-500' },
    { name: 'WhatsApp', icon: MessageCircle, href: '/notification-dashboard/whatsapp', color: 'text-green-500' },
    { name: 'SMS', icon: Smartphone, href: '/notification-dashboard/sms', color: 'text-yellow-500' },
    { name: 'Telegram', icon: Send, href: '/notification-dashboard/telegram', color: 'text-sky-500' },
    { name: 'Website Integration', icon: Globe, href: '/notification-dashboard/website', color: 'text-rose-500' },
    { name: 'Lead Capture', icon: Zap, href: '/notification-dashboard/lead-capture', color: 'text-orange-500' },
];

const SidebarContent = ({ onLinkClick }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => logout(navigate);

    const NavItem = ({ item }) => {
        const isActive = location.pathname === item.href;
        return (
            <NavLink 
                to={item.href} 
                onClick={onLinkClick} 
                end={item.href === '/notification-dashboard'} 
                className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm font-medium rounded-theme transition-colors group ${isActive ? 'bg-sidebar-active text-sidebar-text font-bold shadow-sm' : 'text-sidebar-text hover:bg-sidebar-hover opacity-80 hover:opacity-100'}`}
            >
                <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${isActive ? 'text-sidebar-text' : item.color}`} />
                <span>{item.name}</span>
            </NavLink>
        );
    };

    return (
        <div className="flex flex-col h-full bg-sidebar-bg text-sidebar-text">
            <div className="p-4 border-b border-black/10 flex-shrink-0">
                <button onClick={() => navigate('/company-dashboard')} className="flex items-center gap-3 w-full text-left">
                    <ArrowLeft className="h-6 w-6 text-sidebar-text" />
                    <span className="font-bold text-xl text-sidebar-text">Company Hub</span>
                </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {notificationNavLinks.map((item) => <NavItem key={item.name} item={item} />)}
            </nav>
            <div className="p-4 border-t border-black/10 flex-shrink-0 space-y-2">
                <NavLink to="/company-settings/notification" onClick={onLinkClick} className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm font-medium rounded-theme transition-colors group ${isActive ? 'bg-sidebar-active text-sidebar-text font-bold shadow-sm' : 'text-sidebar-text hover:bg-sidebar-hover opacity-80 hover:opacity-100'}`}>
                    <Settings className="h-5 w-5 mr-3" />
                    <span>Settings</span>
                </NavLink>
                <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-theme text-sidebar-text opacity-80 hover:opacity-100 hover:bg-sidebar-hover group" title="Logout">
                    <LogOut className="h-5 w-5 mr-3 group-hover:text-red-500" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

const NotificationLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64 border-r border-border">
                    <SidebarContent />
                </div>
            </div>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
                        <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 left-0 h-full w-64 z-30 bg-sidebar-bg text-sidebar-text">
                            <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="lg:hidden sticky top-0 z-10 flex-shrink-0 flex h-16 bg-header-bg text-header-text shadow-sm items-center px-4">
                    <button type="button" className="text-header-text opacity-70 hover:opacity-100" onClick={() => setSidebarOpen(true)}><Menu className="h-6 w-6" /></button>
                    <div className="flex-1 flex justify-center items-center"><span className="font-bold text-lg">Notification Module</span></div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-background-muted">{children}</div>
            </main>
        </div>
    );
};

const NotificationModule = () => {
    return (
        <NotificationLayout>
            <Outlet />
        </NotificationLayout>
    );
}

export default NotificationModule;
