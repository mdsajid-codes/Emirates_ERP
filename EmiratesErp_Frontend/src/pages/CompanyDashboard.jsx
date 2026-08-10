import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    Users,
    ShoppingCart,
    CreditCard,
    Activity,
    Box,
    CheckCircle,
    TrendingUp,
    Building,
    DollarSign,
    Package,
    Archive,
    Landmark,
    LayoutDashboard,
    ArrowRight,
    Bell,
    Navigation,
    Truck,
    Briefcase,
    UserPlus,
    Store,
    ShoppingBag,
    Headset,
    Monitor,
    Factory,
    Boxes,
    Warehouse
} from 'lucide-react';
import CompanyHubLayout from '../components/CompanyHubLayout';
import { useTenant } from '../context/TenantContext';
import { useLanguage } from '../context/LanguageContext';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line
} from 'recharts';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const StatCard = ({ title, value, subtext, icon: Icon }) => (
    <div className="bg-white border border-[#E4EAF0] text-[#18233B] p-2.5 rounded-[11.86px] shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-2.5 relative overflow-hidden group hover:border-[#00A9A8] transition-colors duration-300">
        <div className="h-10 w-10 rounded-full bg-[#EAF8FF] text-[#00A9A8] flex items-center justify-center shrink-0">
            <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1 overflow-hidden">
            <p className="text-[10.87px] font-semibold text-[#18233B] mb-0.5 truncate">{title}</p>
            <div className="flex items-baseline gap-2">
                <p className="text-[18px] font-bold text-[#18233B] leading-tight truncate">{value}</p>
                <span className="text-[9.88px] text-[#607089] truncate hidden sm:inline">{subtext}</span>
            </div>
        </div>
    </div>
);

const QuickActionCard = ({ title, desc, icon: Icon, to, active }) => {
    const { isRTL } = useLanguage();
    if (!active) return null;
    return (
        <Link to={to} className="bg-white text-[#18233B] p-2.5 rounded-[11.86px] shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] border border-[#E4EAF0] flex items-center gap-2 hover:border-[#00A9A8] transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-md">
            <div className="h-8 w-8 rounded-full bg-[#EAF8FF] text-[#00A9A8] group-hover:bg-[#00A9A8] group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-300">
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-xs text-[#18233B] group-hover:text-[#00A9A8] transition-colors truncate">{title}</h4>
                <p className="text-[10px] text-[#607089] mt-0.5 truncate">{desc}</p>
            </div>
            <ArrowRight className={`text-[#607089] opacity-0 group-hover:opacity-100 transform ${isRTL ? 'rotate-180 translate-x-2 group-hover:translate-x-0' : '-translate-x-2 group-hover:translate-x-0'} transition-all duration-300 h-4 w-4 shrink-0`} />
        </Link>
    );
};

const CompanyDashboard = () => {
    const tenantId = localStorage.getItem('tenantId');
    const { hasModule } = useTenant();
    const { t, language } = useLanguage();
    const token = localStorage.getItem('token');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        revenue: "AED 0.00",
        employees: 0,
        activeOrders: 0,
        dailySales: "AED 0.00"
    });
    const [productionData, setProductionData] = useState([]);
    
    // Extracted live CSS Variables for Recharts injection
    const [chartColors, setChartColors] = useState({
        primary: '#00A9A8',
        muted: '#607089',
        border: '#E4EAF0'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };

                let empCount = 0;
                let activeOrdersCount = 0;
                let revenueVal = 0;
                let dailySalesVal = 0;
                let prodGraph = [];

                if (hasModule('HRMS_CORE')) {
                    try {
                        const empRes = await axios.get(`${API_URL}/employees/all`, { headers });
                        empCount = empRes.data.length || 0;
                    } catch (e) { console.error(e); }
                }

                if (hasModule('PRODUCTION')) {
                    try {
                        const prodRes = await axios.get(`${API_URL}/production/manufacturing-orders`, { headers });
                        const orders = prodRes.data.content || prodRes.data || [];
                        activeOrdersCount = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;

                        const last7Days = [...Array(7)].map((_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() - (6 - i));
                            return d.toISOString().split('T')[0];
                        });

                        prodGraph = last7Days.map(date => {
                            const dayTotal = orders
                                .filter(o => (o.actualFinish || o.updatedAt || '').startsWith(date))
                                .reduce((acc, curr) => acc + (curr.finishedQuantity || 0), 0);
                            return {
                                name: new Date(date).toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US', { weekday: 'short' }),
                                output: dayTotal,
                                target: 50
                            };
                        });
                    } catch (e) { console.error(e); }
                }

                if (hasModule('POS')) {
                    try {
                        const salesRes = await axios.get(`${API_URL}/sales/orders`, { headers });
                        const sales = salesRes.data.content || salesRes.data || [];
                        revenueVal = sales.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);

                        const today = new Date().toISOString().split('T')[0];
                        dailySalesVal = sales
                            .filter(s => (s.orderDate || s.createdAt || '').startsWith(today))
                            .reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);
                    } catch (e) { console.error(e); }
                }

                setStats({
                    revenue: `AED ${revenueVal.toFixed(2)}`,
                    employees: empCount,
                    activeOrders: activeOrdersCount,
                    dailySales: `AED ${dailySalesVal.toFixed(2)}`
                });

                if (prodGraph.length === 0) {
                    const sampleDays = language === 'ar' 
                        ? ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد']
                        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    prodGraph = sampleDays.map(d => ({ name: d, output: 0, target: 45 }));
                }
                setProductionData(prodGraph);

            } catch (error) {
                console.error("Dashboard data load failed", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchData();
    }, [hasModule, token, language]);

    return (
        <CompanyHubLayout>
            <div className="min-h-screen bg-[#F7FAFF] p-3 lg:p-4 space-y-3 font-sans text-[#18233B]">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <div>
                        <h1 className="text-[23.7px] font-bold tracking-tight text-[#18233B] leading-none mb-1">{t('companyHub.title')}</h1>
                        <p className="text-xs text-[#607089]">
                            {t('companyHub.welcome')} <span className="font-bold text-[#00A9A8]">{tenantId}</span> {t('companyHub.today')}
                        </p>
                    </div>
                </div>

                {/* 4 Stats Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <StatCard title={t('hub.totalRevenue')} value={stats.revenue} subtext={t('hub.lifetimeSales')} icon={CreditCard} />
                    <StatCard title={t('hub.totalEmployees')} value={stats.employees} subtext={t('hub.activeDirectory')} icon={Users} />
                    <StatCard title={t('hub.activeOrders')} value={stats.activeOrders} subtext={t('hub.productionBusy')} icon={Activity} />
                    <StatCard title={t('hub.dailySales')} value={stats.dailySales} subtext={t('hub.todayRevenue')} icon={ShoppingCart} />
                </div>

                {/* Production Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
                    {/* Main Chart */}
                    <div className="lg:col-span-8 bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h2 className="text-[13.84px] font-semibold text-[#18233B]">{t('hub.productionAnalytics')}</h2>
                                <p className="text-[10px] text-[#607089]">{t('hub.outputLast7Days')}</p>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[210px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={productionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.15} />
                                            <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.border} opacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartColors.muted, fontSize: 10 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: chartColors.muted, fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#ffffff', color: '#18233B', borderRadius: '11px', borderColor: '#E4EAF0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                        cursor={{ stroke: chartColors.border, strokeWidth: 1, strokeDasharray: '4 4' }}
                                        itemStyle={{ color: chartColors.primary }}
                                    />
                                    <Line type="monotone" dataKey="target" stroke={chartColors.border} strokeDasharray="5 5" strokeWidth={2} dot={false} activeDot={false} />
                                    <Area type="monotone" dataKey="output" stroke={chartColors.primary} strokeWidth={2} fillOpacity={1} fill="url(#colorOutput)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Side Widgets */}
                    <div className="lg:col-span-4 flex flex-col gap-2.5 justify-between h-full">
                        {/* Efficiency Card */}
                        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex-1 flex flex-col justify-center">
                            <h3 className="text-[10px] font-bold text-[#607089] uppercase tracking-wider mb-1">{t('hub.efficiencyRate')}</h3>
                            <div className="flex items-baseline gap-2 mb-1.5">
                                <span className="text-[20px] font-bold text-[#18233B]">94%</span>
                                <span className="text-xs font-semibold text-[#00A9A8]">+2.4%</span>
                            </div>
                            <div className="w-full bg-[#EAF8FF] rounded-full h-1.5 mb-1.5 overflow-hidden">
                                <div className="bg-[#00A9A8] h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: '94%' }}></div>
                            </div>
                            <p className="text-[9px] font-medium text-[#607089]">{t('hub.efficiencyTarget')}</p>
                        </div>

                        {/* Production Status Card */}
                        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex-1 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-[#EAF8FF] text-[#00A9A8] rounded-md">
                                    <Box size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#607089] leading-tight">{t('hub.productionStatus')}</p>
                                    <h4 className="font-bold text-xs text-[#18233B] leading-tight">{t('hub.statusActive')}</h4>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between text-[11px] bg-[#F7FAFF] p-1.5 rounded-md border border-[#E4EAF0]">
                                    <span className="text-[#607089]">{t('hub.pendingOrders')}</span>
                                    <span className="font-semibold text-[#00A9A8]">{stats.activeOrders}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] bg-[#F7FAFF] p-1.5 rounded-md border border-[#E4EAF0]">
                                    <span className="text-[#607089]">{t('hub.system')}</span>
                                    <span className="font-semibold text-[#FFA713]">{t('hub.online')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Quick Actions Array */}
                <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] mt-1">
                    <div className="mb-2.5">
                        <h2 className="text-[13.84px] font-semibold text-[#18233B] mb-0.5">{t('hub.moduleShortcuts')}</h2>
                        <p className="text-[10px] text-[#607089]">{t('hub.quickAccess')}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                        <QuickActionCard active={hasModule('HRMS_CORE')} to="/hrdashboard" title={t('nav.hrms')} desc="Manage employees" icon={Briefcase} />
                        <QuickActionCard active={hasModule('ATS') || hasModule('HRMS_CORE')} to="/ats-dashboard" title={t('nav.ats')} desc="Recruitment & candidates" icon={UserPlus} />
                        <QuickActionCard active={hasModule('POS')} to="/pos-dashboard" title={t('nav.pos')} desc="Walk-in transactions" icon={Store} />
                        <QuickActionCard active={hasModule('SALES')} to="/sales-dashboard" title={t('nav.sales')} desc="Track orders & invoices" icon={TrendingUp} />
                        <QuickActionCard active={hasModule('PRODUCTION')} to="/production-dashboard" title={t('nav.production')} desc="Monitor assembly lines" icon={Factory} />
                        <QuickActionCard active={hasModule('MATERIAL')} to="/material-dashboard" title={t('nav.material')} desc="Manage BOMs & stock" icon={Boxes} />
                        <QuickActionCard active={hasModule('WAREHOUSE')} to="/warehouse-dashboard" title={t('nav.warehouse')} desc="Logistics and storage" icon={Warehouse} />
                        <QuickActionCard active={hasModule('ACCOUNTS')} to="/account-dashboard" title={t('nav.account')} desc="Ledgers, bills & journals" icon={Landmark} />
                        <QuickActionCard active={hasModule('FIXED_ASSETS')} to="/fixed-asset-dashboard" title={t('nav.fixedAssets')} desc="Manage assets" icon={Monitor} />
                        <QuickActionCard active={hasModule('CRM')} to="/crm-dashboard" title={t('nav.crm')} desc="Leads & pipelines" icon={Headset} />
                        <QuickActionCard active={hasModule('NOTIFICATION')} to="/notification-dashboard" title={t('nav.notification')} desc="Emails, SMS & alerts" icon={Bell} />
                        <QuickActionCard active={hasModule('TRIP_MANAGEMENT')} to="/fleet-dashboard" title={t('nav.fleet')} desc="Trips & vehicles" icon={Truck} />
                    </div>
                </div>

            </div>
        </CompanyHubLayout>
    );
};

export default CompanyDashboard;

