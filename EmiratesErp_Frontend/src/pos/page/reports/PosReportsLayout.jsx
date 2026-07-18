import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, FileText, ChevronLeft, Menu, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useEffect } from 'react';

const PosReportsLayout = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [companyInfo, setCompanyInfo] = useState({ name: 'Enterprise POS', logoPath: null, logoBlob: null });
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const cachedName = sessionStorage.getItem('company_name');
        const cachedLogo = sessionStorage.getItem('company_logo');

        if (cachedName && cachedName !== 'Enterprise POS') {
            setCompanyInfo({ name: cachedName, logoPath: null, logoBlob: cachedLogo || null });
            return;
        }

        const fetchCompanyInfo = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get(`${API_URL}/company-info`, { headers });
                
                const realName = res.data.companyName;
                const companyName = realName || 'Enterprise POS';
                
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

    const reportSections = [
        {
            title: "Reports",
            items: [
                { name: 'Business Summary', path: 'business-summary' },
                { name: 'Sales Support Report', path: 'sales-support' },
                { name: 'Sales Payment Report', path: 'sales-payment' },
                { name: 'Sales Source Inquiry', path: 'sales-source' },
                { name: 'Total Sales Report', path: 'total-sales' },
                { name: 'Sales Status Report', path: 'sales-status' },
                { name: 'Abstract Report', path: 'abstract' },
                { name: 'Weekly Sales Analysis', path: 'weekly-sales' },
                { name: 'Daily Sales Report', path: 'daily-sales' },
                { name: 'Closing Report', path: 'closing' },
                { name: 'Delivery Driver Report', path: 'delivery-driver-report' },
                { name: 'Sales Forecasting Report', path: 'sales-forecasting-report' },
                { name: 'Payment Change Report', path: 'payment-change-report' },
                { name: 'Sales Discount Report', path: '/pos-reports/sales-discount-report' },
                { name: 'Cancellation Report', path: '/pos-reports/cancellation-report' },
                { name: 'Void Report', path: '/pos-reports/void-report' },
                { name: 'Item Movement Report', path: '/pos-reports/item-movement-report' },
            { name: 'Slow Selling Report', path: '/pos-reports/slow-selling-report' },
            { name: 'Best Selling Report', path: '/pos-reports/best-selling-report' },
                { name: 'Item Sales Report', path: '/pos-reports/item-sales-report' },

            ]
        },
        {
            title: "Support Activities",
            items: [
                { name: 'User Transfer', path: 'user-transfer' },
            ]
        }
    ];

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar */}
            <div className={`bg-sidebar-bg border-r border-border text-sidebar-text flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} print:hidden`}>
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <span className="font-bold text-lg">POS Reports</span>
                </div>
                <nav className="p-2 space-y-6 overflow-y-auto h-[calc(100vh-60px)]">
                    {reportSections.map((section, idx) => (
                        <div key={idx}>
                            <h3 className="px-4 text-xs font-semibold opacity-50 uppercase tracking-wider mb-2">
                                {section.title}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((report) => (
                                    <NavLink
                                        key={report.path}
                                        to={report.path}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 mx-2 rounded-theme transition-colors ${isActive
                                                ? 'bg-sidebar-active text-sidebar-text font-medium'
                                                : 'text-sidebar-text opacity-70 hover:bg-sidebar-hover hover:opacity-100'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <FileText size={20} className={isActive ? '' : 'opacity-50'} />
                                                <span className="truncate">{report.name}</span>
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-border/50">
                    <button
                        onClick={() => navigate('/pos-dashboard')}
                        className={`w-full flex items-center gap-2 opacity-70 hover:opacity-100 transition-colors p-2 rounded-theme hover:bg-sidebar-hover`}
                    >
                        <ChevronLeft size={20} />
                        <span>Back to POS</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden print:w-full print:h-auto print:overflow-visible">
                {/* Header */}
                <header className="bg-header-bg text-header-text border-b border-border p-4 flex items-center justify-between flex-shrink-0 print:hidden shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-black/5 rounded-theme">
                            <Menu size={20} />
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
                                <span className="ml-2 px-2 py-0.5 text-xs bg-black/10 rounded-full font-medium tracking-wide">Reports</span>
                            </div>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-xs font-semibold">{localStorage.getItem('username') || 'Admin'}</span>
                            <span className="text-[10px] opacity-70">Report Viewer</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs border border-primary/10">
                            {(localStorage.getItem('username') || 'A').charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Report Content */}
                <main className="flex-1 overflow-auto bg-background p-6 print:bg-white print:p-0 print:overflow-visible">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PosReportsLayout;
