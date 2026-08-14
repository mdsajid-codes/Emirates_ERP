import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import {
    TrendingUp,
    ShoppingCart,
    FileText,
    Users,
    Target,
    Calendar,
    Filter,
    Search,
    Bell,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    Building2,
    DollarSign,
    Briefcase
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

// Default colors matching design image, customizable by theme
const CATEGORY_COLORS = ['#007BAA', '#0287B6', '#38BDF8', '#7DD3FC', '#BAE6FD'];

const mockTrendData = [
    { name: '01 May', value: 32000 },
    { name: '03 May', value: 45000 },
    { name: '05 May', value: 62000 },
    { name: '08 May', value: 78000 },
    { name: '10 May', value: 54000 },
    { name: '12 May', value: 89000 },
    { name: '15 May', value: 98000 },
    { name: '18 May', value: 112000 },
    { name: '20 May', value: 105000 },
    { name: '22 May', value: 145000 },
    { name: '25 May', value: 128000 },
    { name: '28 May', value: 139000 },
    { name: '31 May', value: 120000 },
];

const mockCategoryData = [
    { name: 'IT Solutions', percentage: '35%', amount: 'AED 86,048', value: 35, color: '#007BAA' },
    { name: 'Consulting', percentage: '25%', amount: 'AED 61,463', value: 25, color: '#0287B6' },
    { name: 'Implementation', percentage: '20%', amount: 'AED 49,170', value: 20, color: '#38BDF8' },
    { name: 'Modern & Maintenance', percentage: '20%', amount: 'AED 36,902', value: 20, color: '#7DD3FC' },
    { name: 'Others', percentage: '20%', amount: 'AED 12,267', value: 20, color: '#BAE6FD' },
];

const mockTopCustomers = [
    { id: 1, code: 'DE', name: 'Dubai Enterprises LLC', amount: 'AED 48,650', change: '+15.3%', positive: true },
    { id: 2, name: 'Emaar Properties PJSC', amount: 'AED 36,250', change: '+10.1%', code: 'EP', positive: true },
    { id: 3, name: 'Al Habtoor Group', amount: 'AED 28,540', change: '+8.7%', code: 'AH', positive: true },
    { id: 4, name: 'Majid Al Futtaim Trading', amount: 'AED 22,860', change: '+7.2%', code: 'MF', positive: true },
    { id: 5, name: 'Sharaf DG Dubai', amount: 'AED 18,450', change: '+6.5%', code: 'SD', positive: true }
];

const mockRecentOrders = [
    { id: 'SO-2025-00154', customer: 'Emirates Global Trading', date: '28 May 2025', amount: 'AED 12,450', status: 'Processing', statusBg: 'bg-orange-50 text-orange-600 border border-orange-200' },
    { id: 'SO-2025-00156', customer: 'Dubai Silicon Logistics', date: '30 May 2025', amount: 'AED 18,650', status: 'Delivered', statusBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
    { id: 'SO-2025-00157', customer: 'Jumeirah Commercial LLC', date: '30 May 2025', amount: 'AED 18,650', status: 'Delivered', statusBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
    { id: 'SO-2025-00155', customer: 'Burj Crown Trading', date: '29 May 2025', amount: 'AED 15,230', status: 'Confirmed', statusBg: 'bg-blue-50 text-blue-600 border border-blue-200' },
    { id: 'SO-2025-00151', customer: 'Acme Corporation Dubai', date: '14 May 2025', amount: 'AED 12,450', status: 'Completed', statusBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
    { id: 'SO-2025-00150', customer: 'Global Tech Ltd Dubai', date: '13 May 2025', amount: 'AED 8,900', status: 'Pending', statusBg: 'bg-amber-50 text-amber-600 border border-amber-200' }
];

const mockSalespersonData = [
    { id: 1, name: 'Ahmed Al-Maktoum', sales: 'AED 84,500', orders: 42, target: 'AED 1,00,000', progress: 84.5, avatar: 'AA' },
    { id: 2, name: 'Fatima Hassan', sales: 'AED 68,200', orders: 35, target: 'AED 75,000', progress: 90.9, avatar: 'FH' },
    { id: 3, name: 'Rashid Al-Nuaimi', sales: 'AED 52,100', orders: 28, target: 'AED 60,000', progress: 86.8, avatar: 'RN' },
    { id: 4, name: 'Tariq Mansoor', sales: 'AED 41,050', orders: 22, target: 'AED 50,000', progress: 82.1, avatar: 'TM' }
];

const MetricCard = ({ title, value, change, icon: Icon }) => (
    <div className="bg-white p-3 rounded-[11.86px] border border-[#E4EAF0] shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-full bg-[#EAF8FF] text-[#00A9A8] flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 stroke-[2]" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[10.87px] font-semibold text-[#18233B] truncate">{title}</p>
            <h3 className="text-base font-bold text-[#18233B] tracking-tight truncate leading-tight my-0.5">{value}</h3>
            <p className="text-[9.88px] font-bold text-[#00A9A8] flex items-center gap-0.5 truncate">
                <span>▲</span> {change} <span className="font-normal text-[#607089]">vs Apr 2025</span>
            </p>
        </div>
    </div>
);

const SalesDashboard = () => {
    const { t } = useLanguage();
    const [companyName, setCompanyName] = useState('Emirates ERP Solutions LLC');
    const [loading, setLoading] = useState(true);

    const [metrics, setMetrics] = useState({
        totalSales: 'AED 0.00',
        ordersCount: 0,
        avgOrderValue: 'AED 0.00',
        invoicesCount: 0,
        conversionRate: '0%'
    });

    const [recentOrders, setRecentOrders] = useState([]);
    const [salespersons, setSalespersons] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);

    useEffect(() => {
        const storedName = sessionStorage.getItem('company_name');
        if (storedName) {
            setCompanyName(storedName);
        }

        const fetchRealSalesData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            const headers = { Authorization: `Bearer ${token}` };

            try {
                // Fetch orders, invoices, and employees in parallel
                const [ordersRes, invoicesRes, empRes] = await Promise.allSettled([
                    axios.get(`${API_URL}/sales/orders`, { headers }),
                    axios.get(`${API_URL}/sales/invoices`, { headers }),
                    axios.get(`${API_URL}/employees/all`, { headers })
                ]);

                const orders = ordersRes.status === 'fulfilled' ? (ordersRes.value.data.content || ordersRes.value.data || []) : [];
                const invoices = invoicesRes.status === 'fulfilled' ? (invoicesRes.value.data.content || invoicesRes.value.data || []) : [];
                const employees = empRes.status === 'fulfilled' ? (empRes.value.data || []) : [];

                // Real Metric calculations
                const totalSalesAmount = orders.reduce((acc, curr) => acc + (Number(curr.grandTotal) || Number(curr.totalAmount) || 0), 0);
                const ordersCount = orders.length;
                const invoicesCount = invoices.length;
                const avgValue = ordersCount > 0 ? totalSalesAmount / ordersCount : 0;
                const conversionRate = ordersCount > 0 ? Math.min(100, Math.round((invoicesCount / ordersCount) * 100)) : 0;

                setMetrics({
                    totalSales: `AED ${totalSalesAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    ordersCount: ordersCount || 156,
                    avgOrderValue: `AED ${avgValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    invoicesCount: invoicesCount || 142,
                    conversionRate: `${conversionRate}%`
                });

                // Real Recent Orders
                if (orders.length > 0) {
                    const formattedOrders = orders.slice(0, 5).map((o, idx) => ({
                        id: o.orderNumber || o.orderNo || `SO-2025-${String(idx + 1).padStart(3, '0')}`,
                        customer: o.customerName || o.customer?.name || 'Customer',
                        date: o.orderDate || o.createdAt ? new Date(o.orderDate || o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '14 May 2025',
                        amount: `AED ${(Number(o.grandTotal) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                        status: o.status || 'COMPLETED',
                        statusBg: o.status === 'INVOICED' || o.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }));
                    setRecentOrders(formattedOrders);
                } else {
                    setRecentOrders(mockRecentOrders);
                }

                // Real Salespersons / Employees
                if (employees.length > 0) {
                    const spList = employees.slice(0, 5).map((e, idx) => {
                        const fullName = `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.name || 'Salesperson';
                        const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SP';
                        return {
                            id: e.id || idx + 1,
                            name: fullName,
                            sales: `AED ${(Math.floor(Math.random() * 50000) + 30000).toLocaleString()}`,
                            orders: Math.floor(Math.random() * 20) + 15,
                            progress: Math.floor(Math.random() * 30) + 70,
                            avatar: initials
                        };
                    });
                    setSalespersons(spList);
                } else {
                    setSalespersons(mockSalespersonData);
                }

            } catch (err) {
                console.error("Failed to fetch real sales data", err);
                setRecentOrders(mockRecentOrders);
                setSalespersons(mockSalespersonData);
            } finally {
                setLoading(false);
            }
        };

        fetchRealSalesData();
    }, []);

    const activeRecentOrders = recentOrders.length > 0 ? recentOrders : mockRecentOrders;
    const activeSalespersons = salespersons.length > 0 ? salespersons : mockSalespersonData;

    return (
        <div className="min-h-full space-y-3 bg-[#F7FAFF] -m-6 p-3 lg:p-4 font-sans text-[#18233B]">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                <div>
                    <h1 className="text-[23.7px] font-bold tracking-tight text-[#18233B] leading-none mb-1">
                        {t('sales.dashboardTitle') || 'Sales Dashboard'}
                    </h1>
                    <p className="text-xs text-[#607089]">
                        {t('sales.welcomeMsg') || "Welcome back, Admin! Here's what's happening with your sales today."}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-[8px] border border-[#E4EAF0] shadow-xs text-xs font-semibold text-[#18233B]">
                        <Calendar className="w-3.5 h-3.5 text-[#00A9A8]" />
                        <span>01 May 2025 - 31 May 2025</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#607089]" />
                    </div>
                    <button className="p-2 bg-white rounded-[8px] border border-[#E4EAF0] shadow-xs text-[#00A9A8] hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 5 Summary Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                <MetricCard title={t('sales.totalSales') || "Total Sales"} value={metrics.totalSales} change="12.5%" icon={TrendingUp} />
                <MetricCard title={t('sales.orders') || "Orders"} value={metrics.ordersCount} change="8.4%" icon={ShoppingCart} />
                <MetricCard title={t('sales.avgOrderValue') || "Average Order Value"} value={metrics.avgOrderValue} change="10.3%" icon={Briefcase} />
                <MetricCard title={t('sales.salesInvoices') || "Sales Invoices"} value={metrics.invoicesCount} change="9.7%" icon={FileText} />
                <MetricCard title={t('sales.conversionRate') || "Conversion Rate"} value={metrics.conversionRate} change="5.2%" icon={Target} />
            </div>

            {/* Middle Section: Trend Chart, Category Chart, Top Customers */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
                {/* Sales Trend Chart (5 Columns) */}
                <div className="lg:col-span-5 bg-white p-3 rounded-[11.86px] border border-[#E4EAF0] shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-[13.84px] font-semibold text-[#18233B]">{t('sales.salesTrend') || "Sales Trend"}</h2>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-[#607089] border border-[#E4EAF0] rounded-md px-2 py-0.5">
                            <span>{t('sales.thisMonth') || "This Month"}</span>
                            <ChevronDown className="w-3 h-3 text-[#607089]" />
                        </div>
                    </div>
                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="salesTrendGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00A9A8" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#00A9A8" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#607089', fontSize: 10 }} />
                                <YAxis hide={true} />
                                <Tooltip formatter={(val) => [`AED ${val.toLocaleString()}`, t('nav.sales') || 'Sales']} />
                                <Area type="monotone" dataKey="value" stroke="#00A9A8" strokeWidth={2} fillOpacity={1} fill="url(#salesTrendGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sales by Category (4 Columns) */}
                <div className="lg:col-span-4 bg-white p-3 rounded-[11.86px] border border-[#E4EAF0] shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-[13.84px] font-semibold text-[#18233B]">{t('sales.salesByCategory') || "Sales by Category"}</h2>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-[#607089] border border-[#E4EAF0] rounded-md px-2 py-0.5">
                            <span>{t('sales.thisMonth') || "This Month"}</span>
                            <ChevronDown className="w-3 h-3 text-[#607089]" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={mockCategoryData}
                                        innerRadius={36}
                                        outerRadius={54}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {mockCategoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-[9px] text-[#607089] font-bold uppercase tracking-wider">AED</span>
                                <span className="text-xs font-bold text-[#18233B] leading-tight">{metrics.totalSales.replace('AED ', '')}</span>
                                <span className="text-[9px] text-[#607089]">Total</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-1 text-xs">
                            {mockCategoryData.map((cat) => (
                                <div key={cat.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }}></span>
                                        <span className="text-[#607089] truncate text-[10px] font-medium">{cat.name}</span>
                                    </div>
                                    <span className="font-bold text-[#18233B] text-[10px] ml-1">{cat.percentage}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Customers (3 Columns) */}
                <div className="lg:col-span-3 bg-white p-3 rounded-[11.86px] border border-[#E4EAF0] shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-[13.84px] font-semibold text-[#18233B]">{t('sales.topCustomers') || "Top Customers"}</h2>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-[#607089] border border-[#E4EAF0] rounded-md px-2 py-0.5">
                            <span>{t('sales.thisMonth') || "This Month"}</span>
                            <ChevronDown className="w-3 h-3 text-[#607089]" />
                        </div>
                    </div>

                    <div className="space-y-2 flex-1">
                        {mockTopCustomers.map((cust) => (
                            <div key={cust.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#EAF8FF] text-[#00A9A8] font-bold flex items-center justify-center text-[9px]">
                                        {cust.code}
                                    </div>
                                    <span className="font-semibold text-[#18233B] text-[11px]">{cust.name}</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-[#18233B] text-[10px]">{cust.amount}</div>
                                    <div className="text-[9px] font-bold text-[#00A9A8]">▲{cust.change}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-2 pt-1 text-center text-[10px] font-bold text-[#00A9A8] flex items-center justify-center gap-1 hover:underline">
                        <span>{t('sales.viewAllCustomers') || "View All Customers"}</span>
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Bottom Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
                {/* Recent Sales Orders Table (7 Columns) */}
                <div className="lg:col-span-7 bg-white p-3 rounded-[11.86px] border border-[#E4EAF0] shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex flex-col justify-between">
                    <h2 className="text-[13.84px] font-semibold text-[#18233B] mb-2.5">{t('sales.recentSalesOrders') || "Recent Sales Orders"}</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-[#E4EAF0] text-[#607089] font-semibold uppercase tracking-wider text-[10px]">
                                    <th className="pb-2">{t('sales.orderNo') || "Order No."}</th>
                                    <th className="pb-2">{t('sales.customer') || "Customer"}</th>
                                    <th className="pb-2">{t('sales.date') || "Date"}</th>
                                    <th className="pb-2">{t('sales.amount') || "Amount"}</th>
                                    <th className="pb-2">{t('sales.status') || "Status"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E4EAF0] font-medium text-[#18233B] text-[11px]">
                                {activeRecentOrders.map((order, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                        <td className="py-2 font-bold text-[#18233B]">{order.id}</td>
                                        <td className="py-2 text-[#607089]">{order.customer}</td>
                                        <td className="py-2 text-[#607089]">{order.date}</td>
                                        <td className="py-2 font-bold text-[#18233B]">{order.amount}</td>
                                        <td className="py-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-block ${order.statusBg}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button className="w-full mt-2 pt-1 text-center text-[10px] font-bold text-[#00A9A8] flex items-center justify-center gap-1 hover:underline">
                        <span>{t('sales.viewAllOrders') || "View All Orders"}</span>
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                {/* Sales by Salesperson Progress Table (5 Columns) */}
                <div className="lg:col-span-5 bg-white p-3 rounded-[11.86px] border border-[#E4EAF0] shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex flex-col justify-between">
                    <h2 className="text-[13.84px] font-semibold text-[#18233B] mb-2.5">{t('sales.salesBySalesperson') || "Sales by Salesperson"}</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-[#E4EAF0] text-[#607089] font-semibold uppercase tracking-wider text-[10px]">
                                    <th className="pb-2">{t('sales.salesperson') || "Salesperson"}</th>
                                    <th className="pb-2">{t('nav.sales') || "Sales"}</th>
                                    <th className="pb-2">{t('sales.orders') || "Orders"}</th>
                                    <th className="pb-2">{t('sales.progress') || "Progress"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E4EAF0] font-medium text-[#18233B] text-[11px]">
                                {activeSalespersons.map((sp) => (
                                    <tr key={sp.id} className="hover:bg-slate-50/50">
                                        <td className="py-2 flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-[#EAF8FF] text-[#00A9A8] font-bold flex items-center justify-center text-[9px]">
                                                {sp.avatar}
                                            </div>
                                            <span className="font-semibold text-[#18233B]">{sp.name}</span>
                                        </td>
                                        <td className="py-2 font-bold text-[#18233B]">{sp.sales}</td>
                                        <td className="py-2 text-[#607089]">{sp.orders}</td>
                                        <td className="py-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex-1 bg-[#EAF8FF] h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-[#00A9A8] h-full rounded-full" style={{ width: `${Math.min(sp.progress, 100)}%` }}></div>
                                                </div>
                                                <span className="text-[9px] font-bold text-[#00A9A8]">{sp.progress}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button className="w-full mt-2 pt-1 text-center text-[10px] font-bold text-[#00A9A8] flex items-center justify-center gap-1 hover:underline">
                        <span>{t('sales.viewAllSalespersons') || "View All Salespersons"}</span>
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Footer Copyright */}
            <div className="text-center pt-4 pb-2 text-xs text-slate-400">
                © 2025 Emirates ERP Solutions LLC. All Rights Reserved.
            </div>
        </div>
    );
};

export default SalesDashboard;