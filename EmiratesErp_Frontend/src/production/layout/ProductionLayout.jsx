
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Settings, Factory, List, MapPin, Package, Layers,
    SlidersHorizontal, LayoutGrid, Box, ArrowLeft, Menu, X,
    LogOut,
    Plus,
    Activity, LayoutDashboard,
    Sparkles
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
    { name: 'Dashboard', icon: Activity, href: '/production-dashboard/overview', color: 'text-indigo-600' },
    { name: 'General', icon: Settings, color: 'text-cyan-500' },
    { name: 'Workgroup', icon: Factory, color: 'text-orange-500' },
    { name: 'Manage Process', icon: Layers, color: 'text-green-500' },
    { name: 'Parameter', icon: SlidersHorizontal, color: 'text-indigo-500' },
    { name: 'Categories', icon: LayoutGrid, color: 'text-rose-500' },
    { name: 'Raw Materials', icon: Package, color: 'text-amber-500' },
    { name: 'Semi Finished', icon: Box, color: 'text-teal-500' },
    { name: 'Finished Good', icon: Box, color: 'text-blue-600' },
    { name: 'BOM', icon: List, color: 'text-purple-500' },
];

const ProductionLayout = ({ children, activeTab, onTabChange, title = "Production Configuration", headerActions }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

    // Helper to handle navigation
    const handleNavClick = (linkName, href) => {
        setIsSidebarOpen(false);
        if (href) {
            navigate(href);
            return;
        }
        if (onTabChange) {
            onTabChange(linkName);
        } else {
            // Default behavior: Navigate to settings with tab param
            navigate(`/production-settings?tab=${encodeURIComponent(linkName)}`);
        }
    };

    const activeTabClass = 'bg-sidebar-active text-sidebar-text shadow-md rounded-theme';
    const inactiveTabClass = 'text-sidebar-text hover:bg-sidebar-hover opacity-80 hover:opacity-100 rounded-theme';

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
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
                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
                )}

                {/* Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar-bg text-sidebar-text border-r border-border p-4 md:p-6 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 rounded-full hover:bg-black/5 absolute top-2 right-2">
                        <X className="h-5 w-5" />
                    </button>

                    <nav className="flex flex-col space-y-2 flex-1">
                        {productionNavLinks.map(link => (
                            <button
                                key={link.name}
                                onClick={() => handleNavClick(link.name, link.href)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-theme text-sm font-medium transition-all ${activeTab === link.name ? activeTabClass : inactiveTabClass}`}
                            >
                                <link.icon className={`h-5 w-5 ${activeTab === link.name ? 'text-sidebar-text' : link.color}`} />
                                <span>{link.name}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto pt-4 border-t border-border/50">
                        <button 
                            onClick={() => navigate('/production-settings')} 
                            className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-theme text-sm font-medium transition-all ${activeTab === 'Settings' ? activeTabClass : inactiveTabClass}`}
                        >
                            <Settings className="h-5 w-5" />
                            <span>Settings</span>
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
