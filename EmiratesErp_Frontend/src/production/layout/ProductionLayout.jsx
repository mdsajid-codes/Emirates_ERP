
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Settings, Factory, List, MapPin, Package, Layers,
    SlidersHorizontal, LayoutGrid, Box, ArrowLeft, Menu, X,
    LogOut,
    Plus,
    Activity, LayoutDashboard,
    Sparkles,
    PanelLeftOpen,
    PanelLeftClose
} from 'lucide-react';
import { logout } from '../../utils/logout';
import LocationModal from '../../components/base/LocationModal';

const API_URL = import.meta.env.VITE_API_BASE_URL;

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

export const productionNavLinks = [
    { name: 'Dashboard', icon: Activity, href: '/production-dashboard/overview', iconBg: 'bg-indigo-500/35 text-indigo-300' },
    { name: 'General', icon: Settings, iconBg: 'bg-cyan-500/35 text-cyan-300' },
    { name: 'Workgroup', icon: Factory, iconBg: 'bg-orange-500/35 text-orange-300' },
    { name: 'Manage Process', icon: Layers, iconBg: 'bg-green-500/35 text-green-300' },
    { name: 'Parameter', icon: SlidersHorizontal, iconBg: 'bg-indigo-500/35 text-indigo-300' },
    { name: 'Categories', icon: LayoutGrid, iconBg: 'bg-rose-500/35 text-rose-300' },
    { name: 'Raw Materials', icon: Package, iconBg: 'bg-amber-500/35 text-amber-300' },
    { name: 'Semi Finished', icon: Box, iconBg: 'bg-teal-500/35 text-teal-300' },
    { name: 'Finished Good', icon: Box, iconBg: 'bg-blue-500/35 text-blue-300' },
    { name: 'BOM', icon: List, iconBg: 'bg-purple-500/35 text-purple-300' },
];

const ProductionLayout = ({ children, activeTab, onTabChange, title = "Production Configuration", headerActions }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const isExpanded = !isDesktopCollapsed || isHovered;

    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalSaving, setModalSaving] = useState(false);
    const [companyInfo, setCompanyInfo] = useState({ name: 'Enterprise Production', logoPath: null, logoBlob: null });
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
                const companyName = realName || 'Enterprise Production';
                
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
    }, []);

    const handleLogout = () => logout(navigate);

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/locations`, { headers: { Authorization: `Bearer ${token}` } });
            setLocations(res.data);
            if (res.data.length > 0 && !selectedLocation) {
                setSelectedLocation('all');
            }
        } catch (err) {
            console.error("Failed to fetch locations:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleAddLocation = async (data) => {
        setModalSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/locations`, data, { headers: { Authorization: `Bearer ${token}` } });
            await fetchLocations();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to save location:", err);
            alert(err.response?.data || "Failed to save location.");
        } finally {
            setModalSaving(false);
        }
    };

    const handleNavClick = (linkName, href) => {
        setIsSidebarOpen(false);
        if (href) {
            navigate(href);
            return;
        }
        if (onTabChange) {
            onTabChange(linkName);
        } else {
            navigate(`/production-settings?tab=${encodeURIComponent(linkName)}`);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden select-none">
            {/* Header */}
            <header className="flex-shrink-0 h-16 bg-header-bg text-header-text shadow-sm border-b border-border flex items-center justify-between px-4 lg:px-6 z-30 relative">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="opacity-70 hover:opacity-100 hover:bg-black/5 p-2 rounded-theme md:hidden"
                        onClick={() => setIsSidebarOpen(true)}
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
                            <span className="ml-2 px-2 py-0.5 text-xs bg-black/10 rounded-full font-medium tracking-wide">Production</span>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {headerActions && <div className="hidden sm:block">{headerActions}</div>}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-theme hover:opacity-90 transition-colors text-sm font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Location</span>
                    </button>

                    <div className="w-px h-8 bg-black/10 mx-2"></div>

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

            <LocationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddLocation}
                loading={modalSaving}
            />

            <div className="flex-grow flex overflow-hidden">
                {/* Desktop Sidebar */}
                <aside
                    className={`hidden md:flex md:flex-col md:flex-shrink-0 bg-sidebar-bg text-sidebar-text border-r border-border transition-all duration-300 ${isExpanded ? 'w-[220px]' : 'w-[68px]'}`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Header section with pin toggle button matching POS position */}
                    <div className={`flex items-center py-3 px-3.5 border-b border-white/10 ${!isExpanded ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-xl bg-lime-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Factory className="h-4 w-4 text-white fill-current" />
                            </div>
                            {isExpanded && (
                                <span className="text-sm font-extrabold text-white tracking-tight truncate">Production Hub</span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDesktopCollapsed(prev => !prev);
                            }}
                            className="hidden md:flex items-center justify-center p-1.5 rounded-xl opacity-80 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer flex-shrink-0"
                            title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {isDesktopCollapsed ? <PanelLeftOpen className="h-5 w-5 text-gray-300" /> : <PanelLeftClose className="h-5 w-5 text-gray-300" />}
                        </button>
                    </div>

                    <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto no-scrollbar">
                        {/* Back to Hub */}
                        <button
                            onClick={() => navigate('/company-dashboard')}
                            title={!isExpanded ? "Back to Company Hub" : undefined}
                            className={`w-full flex items-center ${!isExpanded ? 'justify-center px-0' : 'px-2.5'} py-2 text-sm font-bold rounded-xl transition-all duration-200 mb-2 group text-sidebar-text/80 hover:text-sidebar-text hover:bg-white/10 text-left`}
                        >
                            <div className="p-1.5 rounded-full bg-slate-500/35 text-slate-300 flex items-center justify-center flex-shrink-0">
                                <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
                            </div>
                            {isExpanded && <span className="ml-2.5 truncate">Back to Hub</span>}
                        </button>

                        {productionNavLinks.map(link => (
                            <button
                                key={link.name}
                                onClick={() => handleNavClick(link.name, link.href)}
                                title={!isExpanded ? link.name : undefined}
                                className={`w-full flex items-center ${!isExpanded ? 'justify-center px-0' : 'px-2.5'} py-2 rounded-xl text-sm font-bold transition-all ${
                                    activeTab === link.name ? 'bg-sidebar-active/20 text-sidebar-text shadow-sm font-bold' : 'text-sidebar-text/80 hover:text-sidebar-text hover:bg-sidebar-hover'
                                }`}
                            >
                                <div className={`p-1.5 rounded-full flex items-center justify-center flex-shrink-0 ${link.iconBg || 'bg-slate-500/35 text-slate-300'}`}>
                                    <link.icon className="h-4 w-4 stroke-[2.5] transition-transform group-hover:scale-110" />
                                </div>
                                {isExpanded && <span className="ml-2.5 truncate">{link.name}</span>}
                            </button>
                        ))}
                    </nav>

                    <div className="p-3 border-t border-sidebar-text/10 space-y-1">
                        <button
                            onClick={() => navigate('/production-settings')}
                            title={!isExpanded ? "Settings" : undefined}
                            className={`w-full flex items-center ${!isExpanded ? 'justify-center px-0' : 'px-2.5'} py-2 text-sidebar-text/80 hover:text-sidebar-text text-sm font-bold rounded-xl hover:bg-sidebar-hover transition group`}
                        >
                            <div className="p-1.5 rounded-full bg-slate-500/35 text-slate-300 flex items-center justify-center flex-shrink-0">
                                <Settings className="h-4 w-4 stroke-[2.5]" />
                            </div>
                            {isExpanded && <span className="ml-2.5 truncate">Settings</span>}
                        </button>
                    </div>
                </aside>

                <main className="flex-grow p-6 md:p-8 w-full md:w-auto overflow-y-auto">
                    {/* Inject selectedLocation into children if possible, or context */}
                    {React.Children.map(children, child => {
                        if (React.isValidElement(child) && typeof child.type !== 'string') {
                            return React.cloneElement(child, { locationId: selectedLocation });
                        }
                        return child;
                    })}
                </main>
            </div>
        </div>
    );
};

export default ProductionLayout;
