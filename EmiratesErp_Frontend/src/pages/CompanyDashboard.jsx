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
    Truck
} from 'lucide-react';
import CompanyHubLayout from '../components/CompanyHubLayout';
import { useTenant } from '../context/TenantContext';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line
} from 'recharts';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const StatCard = ({ title, value, subtext, icon: Icon }) => (
    <div className="bg-card text-card-foreground p-6 rounded-theme shadow-sm border border-border flex flex-col justify-between h-40 relative overflow-hidden group hover:border-primary transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-foreground-muted">{title}</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{value}</h3>
            </div>
            <div className="p-3 rounded-theme bg-primary/10 text-primary">
                <Icon size={24} />
            </div>
        </div>
        <p className="text-sm text-foreground-muted mt-4">{subtext}</p>
    </div>
);

const QuickActionCard = ({ title, desc, icon: Icon, to, active }) => {
    if (!active) return null;
    return (
        <Link to={to} className="bg-card text-card-foreground p-5 rounded-theme shadow-sm border border-border flex items-center gap-4 hover:border-primary transition-all duration-300 group hover:-translate-y-1 hover:shadow-md">
            <div className="p-3 rounded-theme bg-background-muted text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Icon size={24} />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{title}</h4>
                <p className="text-xs text-foreground-muted mt-0.5">{desc}</p>
            </div>
            <ArrowRight className="text-foreground-muted opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300 h-5 w-5" />
        </Link>
    );
};

const CompanyDashboard = () => {
    const tenantId = localStorage.getItem('tenantId');
    const { hasModule } = useTenant();
    const token = localStorage.getItem('token');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        revenue: "$0.00",
        employees: 0,
        activeOrders: 0,
        dailySales: "$0.00"
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
                            // Mock logic: aggregating finished quantity for valid dates
                            const dayTotal = orders
                                .filter(o => (o.actualFinish || o.updatedAt || '').startsWith(date))
                                .reduce((acc, curr) => acc + (curr.finishedQuantity || 0), 0);
                            return {
                                name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                                output: dayTotal,
                                target: 50 // arbitrary target line
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
                    revenue: revenueVal.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                    employees: empCount,
                    activeOrders: activeOrdersCount,
                    dailySales: dailySalesVal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                });

                // Fallback for empty graph if production module not active or empty
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
            <div className="font-sans text-foreground pb-12 w-full">
                {/* Header Section */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-3xl font-bold text-foreground">Company Hub</h1>
                    <p className="text-foreground-muted mt-1">
                        Welcome back! Here's what's happening in <span className="font-bold text-primary">{tenantId}</span> today.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="animate-fade-in-up animation-delay-200"><StatCard title="Total Revenue" value={stats.revenue} subtext="Lifetime sales" icon={CreditCard} /></div>
                    <div className="animate-fade-in-up animation-delay-400"><StatCard title="Total Employees" value={stats.employees} subtext="Active in directory" icon={Users} /></div>
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}><StatCard title="Active Orders" value={stats.activeOrders} subtext="Production lines busy" icon={Activity} /></div>
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}><StatCard title="Daily Sales" value={stats.dailySales} subtext="Today's revenue" icon={ShoppingCart} /></div>
                </div>

                {/* Production Analytics Section */}
                <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-foreground mb-1">Production Analytics</h2>
                            <p className="text-sm text-foreground-muted">Real-time insights into manufacturing operations</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Chart */}
                        <div className="lg:col-span-2 bg-card p-6 rounded-theme shadow-sm border border-border">
                            <h3 className="font-semibold text-foreground mb-6">Production Output (Last 7 Days)</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={productionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.15} />
                                                <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.border} opacity={0.5} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartColors.muted, fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: chartColors.muted, fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-card-foreground)', borderRadius: 'var(--theme-border-radius)', borderColor: 'var(--color-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ stroke: chartColors.border, strokeWidth: 1, strokeDasharray: '4 4' }}
                                            itemStyle={{ color: chartColors.primary }}
                                        />
                                        <Line type="monotone" dataKey="target" stroke={chartColors.border} strokeDasharray="5 5" strokeWidth={2} dot={false} activeDot={false} />
                                        <Area type="monotone" dataKey="output" stroke={chartColors.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorOutput)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Side Widgets */}
                        <div className="space-y-6">
                            {/* Efficiency Card */}
                            <div className="bg-card p-6 rounded-theme shadow-sm border border-border">
                                <h3 className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2">Efficiency Rate</h3>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-4xl font-bold text-foreground">94%</span>
                                    <span className="text-sm font-medium text-success">+2.4%</span>
                                </div>
                                <div className="w-full bg-background-muted rounded-full h-2 mb-3 overflow-hidden">
                                    <div className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '94%' }}></div>
                                </div>
                                <p className="text-xs text-foreground-muted">Target: 92% efficiency across all lines</p>
                            </div>

                            {/* Production Status Card */}
                            <div className="bg-card p-6 rounded-theme shadow-sm border border-border">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-primary/10 text-primary rounded-theme">
                                        <Box size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground-muted">Production Status</p>
                                        <h4 className="font-bold text-foreground">Active</h4>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm bg-background p-3 rounded-theme mb-2 border border-border/50">
                                    <span className="text-foreground-muted">Pending Orders:</span>
                                    <span className="font-semibold text-success">{stats.activeOrders}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm bg-background p-3 rounded-theme border border-border/50">
                                    <span className="text-foreground-muted">System:</span>
                                    <span className="font-semibold text-warning">Online</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Quick Actions Array */}
                <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-foreground mb-1">Module Shortcuts</h2>
                        <p className="text-sm text-foreground-muted">Quick access to your active operational modules</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <QuickActionCard active={hasModule('HRMS_CORE')} to="/hrdashboard" title="HRMS" desc="Manage employees & records" icon={Users} />
                        <QuickActionCard active={hasModule('ATS') || hasModule('HRMS_CORE')} to="/ats-dashboard" title="ATS" desc="Recruitment & candidates" icon={Users} />
                        <QuickActionCard active={hasModule('POS')} to="/pos-dashboard" title="POS" desc="Process walk-in transactions" icon={ShoppingCart} />
                        <QuickActionCard active={hasModule('SALES')} to="/sales-dashboard" title="Sales" desc="Track orders & invoices" icon={DollarSign} />
                        <QuickActionCard active={hasModule('PRODUCTION')} to="/production-dashboard" title="Production" desc="Monitor assembly pipelines" icon={Building} />
                        <QuickActionCard active={hasModule('MATERIAL')} to="/material-dashboard" title="Material" desc="Manage BOMs & stock levels" icon={Package} />
                        <QuickActionCard active={hasModule('WAREHOUSE')} to="/warehouse-dashboard" title="Warehouse" desc="Logistics and storage racks" icon={Archive} />
                        <QuickActionCard active={hasModule('ACCOUNTS')} to="/account-dashboard" title="Accounting" desc="Ledgers, bills & journals" icon={Landmark} />
                        <QuickActionCard active={hasModule('FIXED_ASSETS')} to="/fixed-asset-dashboard" title="Fixed Assets" desc="Manage assets & depreciation" icon={LayoutDashboard} />
                        <QuickActionCard active={hasModule('CRM')} to="/crm-dashboard" title="CRM" desc="Leads & customer pipelines" icon={TrendingUp} />
                        <QuickActionCard active={hasModule('NOTIFICATION')} to="/notification-dashboard" title="Notification" desc="Manage email, SMS & alerts" icon={Bell} />
                        <QuickActionCard active={hasModule('TRIP_MANAGEMENT')} to="/fleet-dashboard" title="Fleet Management" desc="Manage trips, vehicles & drivers" icon={Truck} />

                    </div>

                </div>

                {hasModule('HRMS_CORE') && (
                    <div className="mt-10 pt-8 border-t border-border animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                        <h2 className="text-lg font-bold text-foreground mb-4">HR & Workforce Overview</h2>
                        <p className="text-sm text-foreground-muted">Workforce distribution details</p>
                    </div>
                )}
            </div>
        </CompanyHubLayout>
    );
};
export default CompanyDashboard;
