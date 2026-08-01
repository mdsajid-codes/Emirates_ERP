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
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line
} from 'recharts';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const StatCard = ({ title, value, subtext, icon: Icon }) => (
    <div className="bg-card text-card-foreground p-2.5 rounded-xl shadow-sm border border-border flex items-center gap-2 relative overflow-hidden group hover:border-primary transition-colors duration-300">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out"></div>
        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-foreground-muted mb-0.5 truncate">{title}</p>
            <div className="flex items-baseline gap-2">
                <p className="text-xl font-extrabold text-foreground truncate">{value}</p>
                <span className="text-[10px] text-foreground-muted truncate hidden sm:inline">{subtext}</span>
            </div>
        </div>
    </div>
);

const QuickActionCard = ({ title, desc, icon: Icon, to, active }) => {
    if (!active) return null;
    return (
        <Link to={to} className="bg-card text-card-foreground p-2.5 rounded-xl shadow-sm border border-border flex items-center gap-2 hover:border-primary transition-all duration-300 group hover:-translate-y-1 hover:shadow-md">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors duration-300">
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">{title}</h4>
                <p className="text-[10px] text-foreground-muted mt-0.5 truncate">{desc}</p>
            </div>
            <ArrowRight className="text-foreground-muted opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300 h-4 w-4 shrink-0" />
        </Link>
    );
};

const CompanyDashboard = () => {
    const tenantId = localStorage.getItem('tenantId');
    const { hasModule } = useTenant();
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
        primary: '#1a237e',
        muted: '#94a3b8',
        border: '#cbd5e1'
    });

    useEffect(() => {
        // Read active CSS variables attached to document root
        const rootStyles = getComputedStyle(document.documentElement);
        setChartColors({
            primary: rootStyles.getPropertyValue('--color-primary').trim() || '#1a237e',
            muted: rootStyles.getPropertyValue('--color-foreground-muted').trim() || '#94a3b8',
            border: rootStyles.getPropertyValue('--color-border').trim() || '#e2e8f0'
        });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch basic data
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

                        // Calculate last 7 days output
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
                                name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
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
                    revenue: revenueVal.toLocaleString('en-US', { style: 'currency', currency: 'AED' }),
                    employees: empCount,
                    activeOrders: activeOrdersCount,
                    dailySales: dailySalesVal.toLocaleString('en-US', { style: 'currency', currency: 'AED' })
                });

                if (prodGraph.length === 0) {
                    prodGraph = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => ({ name: d, output: 0, target: 45 }));
                }
                setProductionData(prodGraph);

            } catch (error) {
                console.error("Dashboard data load failed", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchData();
    }, [hasModule, token]);

    return (
        <CompanyHubLayout>
            <div className="p-2 space-y-2 max-w-[1600px] mx-auto font-sans bg-transparent text-foreground w-full pb-12">
                
                {/* Header Section */}
                <div className="bg-card rounded-xl p-3 border border-border shadow-sm flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-foreground">Company Hub</h1>
                        <p className="text-xs text-foreground-muted mt-0.5">
                            Welcome back! Here's what's happening in <span className="font-bold text-primary">{tenantId}</span> today.
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    <StatCard title="Total Revenue" value={stats.revenue} subtext="Lifetime sales" icon={CreditCard} />
                    <StatCard title="Total Employees" value={stats.employees} subtext="Active in directory" icon={Users} />
                    <StatCard title="Active Orders" value={stats.activeOrders} subtext="Production lines busy" icon={Activity} />
                    <StatCard title="Daily Sales" value={stats.dailySales} subtext="Today's revenue" icon={ShoppingCart} />
                </div>

                {/* Production Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch">
                    {/* Main Chart */}
                    <div className="lg:col-span-8 bg-card p-2.5 rounded-xl shadow-sm border border-border flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h2 className="text-sm font-bold text-foreground mb-0.5">Production Analytics</h2>
                                <p className="text-[10px] text-foreground-muted">Output (Last 7 Days)</p>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[220px] w-full">
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
                                        contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-card-foreground)', borderRadius: 'var(--theme-border-radius)', borderColor: 'var(--color-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
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
                    <div className="lg:col-span-4 flex flex-col gap-2">
                        {/* Efficiency Card */}
                        <div className="bg-card p-2.5 rounded-xl shadow-sm border border-border flex-1 flex flex-col justify-center">
                            <h3 className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Efficiency Rate</h3>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-2xl font-bold text-foreground">94%</span>
                                <span className="text-xs font-medium text-success">+2.4%</span>
                            </div>
                            <div className="w-full bg-background-muted rounded-full h-1.5 mb-1.5 overflow-hidden">
                                <div className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: '94%' }}></div>
                            </div>
                            <p className="text-[9px] text-foreground-muted">Target: 92% efficiency across all lines</p>
                        </div>

                        {/* Production Status Card */}
                        <div className="bg-card p-2.5 rounded-xl shadow-sm border border-border flex-1 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                                    <Box size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-foreground-muted leading-tight">Production Status</p>
                                    <h4 className="font-bold text-xs text-foreground leading-tight">Active</h4>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between text-[11px] bg-background p-1.5 rounded-md border border-border/50">
                                    <span className="text-foreground-muted">Pending Orders:</span>
                                    <span className="font-semibold text-success">{stats.activeOrders}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] bg-background p-1.5 rounded-md border border-border/50">
                                    <span className="text-foreground-muted">System:</span>
                                    <span className="font-semibold text-warning">Online</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Quick Actions Array */}
                <div className="bg-card p-3 rounded-xl shadow-sm border border-border mt-2">
                    <div className="mb-3">
                        <h2 className="text-sm font-bold text-foreground mb-0.5">Module Shortcuts</h2>
                        <p className="text-[10px] text-foreground-muted">Quick access to your active operational modules</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                        <QuickActionCard active={hasModule('HRMS_CORE')} to="/hrdashboard" title="HRMS" desc="Manage employees" icon={Briefcase} />
                        <QuickActionCard active={hasModule('ATS') || hasModule('HRMS_CORE')} to="/ats-dashboard" title="ATS" desc="Recruitment & candidates" icon={UserPlus} />
                        <QuickActionCard active={hasModule('POS')} to="/pos-dashboard" title="POS" desc="Walk-in transactions" icon={Store} />
                        <QuickActionCard active={hasModule('SALES')} to="/sales-dashboard" title="Sales" desc="Track orders & invoices" icon={TrendingUp} />
                        <QuickActionCard active={hasModule('PRODUCTION')} to="/production-dashboard" title="Production" desc="Monitor assembly lines" icon={Factory} />
                        <QuickActionCard active={hasModule('MATERIAL')} to="/material-dashboard" title="Material" desc="Manage BOMs & stock" icon={Boxes} />
                        <QuickActionCard active={hasModule('WAREHOUSE')} to="/warehouse-dashboard" title="Warehouse" desc="Logistics and storage" icon={Warehouse} />
                        <QuickActionCard active={hasModule('ACCOUNTS')} to="/account-dashboard" title="Accounting" desc="Ledgers, bills & journals" icon={Landmark} />
                        <QuickActionCard active={hasModule('FIXED_ASSETS')} to="/fixed-asset-dashboard" title="Fixed Assets" desc="Manage assets" icon={Monitor} />
                        <QuickActionCard active={hasModule('CRM')} to="/crm-dashboard" title="CRM" desc="Leads & pipelines" icon={Headset} />
                        <QuickActionCard active={hasModule('NOTIFICATION')} to="/notification-dashboard" title="Notification" desc="Emails, SMS & alerts" icon={Bell} />
                        <QuickActionCard active={hasModule('TRIP_MANAGEMENT')} to="/fleet-dashboard" title="Fleet Mgmt" desc="Trips & vehicles" icon={Truck} />
                    </div>
                </div>

            </div>
        </CompanyHubLayout>
    );
};
export default CompanyDashboard;
