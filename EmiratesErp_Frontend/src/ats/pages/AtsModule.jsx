import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../../utils/logout';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Menu,
    ArrowLeft,
    Sparkles,
    Briefcase,
    Building,
    LayoutGrid,
    X,
    UserPlus,
    Ban,
    FileCheck,
    Download,
    Calendar,
    FolderOpen,
    FileText,
    Clock,
    StickyNote,
    Share2,
    Megaphone,
    MessageSquare,
    Scissors,
    CheckSquare,
    BellOff,
    Clipboard,
    PanelLeftOpen,
    PanelLeftClose
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';

const atsNavLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/ats-dashboard/dashboard', iconBg: 'bg-blue-500/35 text-blue-300' },
    { name: 'Applicants', icon: Users, href: '/ats-dashboard/applicants', iconBg: 'bg-purple-500/35 text-purple-300' },
    { name: 'Clients', icon: Building, href: '/ats-dashboard/clients', iconBg: 'bg-teal-500/35 text-teal-300' },
    { name: 'Vendors', icon: Briefcase, href: '/ats-dashboard/vendors', iconBg: 'bg-emerald-500/35 text-emerald-300' },
];

const quickLinks = [
    { name: 'AI Agents', icon: Sparkles, color: 'text-indigo-500 bg-indigo-50 border-indigo-100', path: '/ats-dashboard/ai-agents', isPlaceholder: true },
    { name: 'Add Interviewer', icon: UserPlus, color: 'text-blue-500 bg-blue-50 border-blue-100', path: '/ats-dashboard/interviewers' },
    { name: 'Blacklist', icon: Ban, color: 'text-rose-500 bg-rose-50 border-rose-100', path: '/ats-dashboard/blacklist' },
    { name: 'Consent Details', icon: FileCheck, color: 'text-emerald-500 bg-emerald-50 border-emerald-100', path: '/ats-dashboard/consent' },
    { name: 'Download Center', icon: Download, color: 'text-cyan-500 bg-cyan-50 border-cyan-100', path: '/ats-dashboard/downloads', isPlaceholder: true },
    { name: 'Event Calendar', icon: Calendar, color: 'text-amber-500 bg-amber-50 border-amber-100', path: '/ats-dashboard/calendar', isPlaceholder: true },
    { name: 'Files', icon: FolderOpen, color: 'text-amber-600 bg-amber-50 border-amber-100', path: '/ats-dashboard/clients' },
    { name: 'Form Templates', icon: FileText, color: 'text-indigo-600 bg-indigo-50 border-indigo-100', path: '/ats-dashboard/templates', isPlaceholder: true },
    { name: 'Groups', icon: Users, color: 'text-violet-500 bg-violet-50 border-violet-100', path: '/ats-dashboard/groups', isPlaceholder: true },
    { name: 'Interview Schedules', icon: Clock, color: 'text-teal-500 bg-teal-50 border-teal-100', path: '/ats-dashboard/interviews', isPlaceholder: true },
    { name: 'Notes List', icon: StickyNote, color: 'text-orange-500 bg-orange-50 border-orange-100', path: '/ats-dashboard/notes', isPlaceholder: true },
    { name: 'Published Jobs', icon: Briefcase, color: 'text-sky-500 bg-sky-50 border-sky-100', path: '/ats-dashboard/jobs', isPlaceholder: true },
    { name: 'Referral Employees', icon: Share2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', path: '/ats-dashboard/referrals', isPlaceholder: true },
    { name: 'Release Notes', icon: Megaphone, color: 'text-pink-500 bg-pink-50 border-pink-100', path: '/ats-dashboard/release-notes', isPlaceholder: true },
    { name: 'SMS Dashboard', icon: MessageSquare, color: 'text-indigo-500 bg-indigo-50 border-indigo-100', path: '/ats-dashboard/sms', isPlaceholder: true },
    { name: 'Snip List', icon: Scissors, color: 'text-rose-600 bg-rose-50 border-rose-100', path: '/ats-dashboard/snips', isPlaceholder: true },
    { name: 'Task Manager', icon: CheckSquare, color: 'text-blue-600 bg-blue-50 border-blue-100', path: '/ats-dashboard/applicants', badge: 2 },
    { name: 'Unsubscribe List', icon: BellOff, color: 'text-red-500 bg-red-50 border-red-100', path: '/ats-dashboard/unsubscribe', isPlaceholder: true },
    { name: 'View Clipboard', icon: Clipboard, color: 'text-slate-600 bg-slate-50 border-slate-100', path: '/ats-dashboard/clipboard', isPlaceholder: true },
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
                end={item.href === '/ats-dashboard/dashboard'}
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
                    <div className="w-8 h-8 rounded-xl bg-pink-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <UserPlus className="h-4 w-4 text-white fill-current" />
                    </div>
                    {!isCollapsedMode && (
                        <span className="text-sm font-extrabold text-white tracking-tight truncate">ATS Hub</span>
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

                {atsNavLinks.map((item) => <NavItem key={item.name} item={item} />)}
            </nav>

            <div className="p-3 border-t border-sidebar-text/10 space-y-1">
                <NavLink
                    to="/ats-settings"
                    onClick={onLinkClick}
                    title={isCollapsedMode ? "ATS Settings" : undefined}
                    className={`flex items-center ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sidebar-text/80 hover:text-sidebar-text text-sm font-bold rounded-xl hover:bg-sidebar-hover transition group`}
                >
                    <div className="p-1.5 rounded-full bg-cyan-500/35 text-cyan-300 flex items-center justify-center flex-shrink-0">
                        <Settings className="h-4 w-4 stroke-[2.5]" />
                    </div>
                    {!isCollapsedMode && <span className="ml-2.5 truncate">ATS Settings</span>}
                </NavLink>

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

const AtsLayout = ({ children, showQuickLinks, setShowQuickLinks }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const isExpanded = !isDesktopCollapsed || isHovered;

    const navigate = useNavigate();
    const handleLogout = () => logout(navigate);
    const username = localStorage.getItem('username') || 'Admin';

    const [companyInfo, setCompanyInfo] = useState({ name: 'Enterprise ATS', logoPath: null, logoBlob: null });
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const cachedName = sessionStorage.getItem('company_name');
        const cachedLogo = sessionStorage.getItem('company_logo');

        if (cachedName && cachedName !== 'Enterprise ATS') {
            setCompanyInfo({ name: cachedName, logoPath: null, logoBlob: cachedLogo || null });
            return;
        }

        const fetchCompanyInfo = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get(`${API_URL}/company-info`, { headers });

                const realName = res.data.companyName;
                const companyName = realName || 'Enterprise ATS';

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
                            setCompanyInfo({ name: companyName, logoPath: rawLogoUrl, logoBlob: rawLogoUrl });
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
        <div className="flex flex-col h-screen bg-background text-foreground font-sans">
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
                        {companyInfo.logoBlob || companyInfo.logoPath ? (
                            <img
                                src={companyInfo.logoBlob || companyInfo.logoPath}
                                alt={companyInfo.name}
                                className="h-10 w-10 object-contain rounded-theme bg-white border border-border"
                            />
                        ) : (
                            <div className="h-10 w-10 bg-primary/10 rounded-theme flex items-center justify-center text-primary font-bold border border-primary/20">
                                <Briefcase className="h-5 w-5" />
                            </div>
                        )}
                        <div className="hidden md:block">
                            <span className="font-bold text-lg">{companyInfo.name}</span>
                            <span className="ml-2 px-2 py-0.5 text-xs bg-black/10 rounded-full font-medium tracking-wide">ATS</span>
                        </div>
                    </Link>
                </div>

                {/* Right Side: Profile & Logout */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowQuickLinks(true)}
                        className="opacity-70 hover:opacity-100 hover:text-primary transition-colors p-2 rounded-full hover:bg-black/5 flex items-center justify-center"
                        title="Quick Links"
                    >
                        <LayoutGrid className="h-5 w-5" />
                    </button>
                    <div className="w-px h-8 bg-black/10"></div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-semibold">{username}</span>
                            <span className="text-xs opacity-80">ATS Manager</span>
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

                {/* Main content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto min-w-0 p-4 bg-background-muted">
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
                                className="fixed top-0 left-0 h-full w-64 z-50 bg-sidebar-bg text-sidebar-text shadow-2xl flex flex-col"
                            >
                                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                    <span className="font-bold text-sidebar-text text-lg">Menu</span>
                                    <button onClick={() => setSidebarOpen(false)} className="p-2 opacity-70 hover:opacity-100 hover:bg-white/10 rounded-full">
                                        <Menu className="h-5 w-5 text-sidebar-text" />
                                    </button>
                                </div>
                                <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Quick Links Modal */}
            {showQuickLinks && (
                <div className="fixed inset-0 bg-background/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative flex flex-col scale-in-animation">
                        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Quick Actions & Links</h2>
                                <p className="text-xs text-foreground-muted">Access important pages, tasks, and configurations directly.</p>
                            </div>
                            <button
                                onClick={() => setShowQuickLinks(false)}
                                className="p-1.5 rounded-full hover:bg-background-muted text-foreground-muted hover:text-foreground transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 py-2">
                            {quickLinks.map((link, idx) => {
                                const Icon = link.icon;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setShowQuickLinks(false);
                                            if (link.isPlaceholder) {
                                                toast.info(`${link.name} feature is coming soon!`);
                                            } else {
                                                navigate(link.path);
                                            }
                                        }}
                                        className="flex flex-col items-center justify-center p-4 rounded-theme border border-border hover:border-primary/50 hover:shadow bg-background/50 hover:bg-background/80 transition-all relative group"
                                    >
                                        <div className={`p-3 rounded-full mb-3 flex items-center justify-center ${link.color} transition-transform group-hover:scale-110`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-bold text-center text-foreground-muted group-hover:text-foreground transition-colors line-clamp-2">
                                            {link.name}
                                        </span>
                                        {link.badge && (
                                            <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none shadow-sm">
                                                {link.badge}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AtsModule = () => {
    const [showQuickLinks, setShowQuickLinks] = useState(false);
    return (
        <AtsLayout showQuickLinks={showQuickLinks} setShowQuickLinks={setShowQuickLinks}>
            <Outlet context={{ setShowQuickLinks }} />
        </AtsLayout>
    );
}

export default AtsModule;
