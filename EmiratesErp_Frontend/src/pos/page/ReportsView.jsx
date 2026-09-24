import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Loader, AlertCircle, Calendar, ArrowUpRight, TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';
import { POS_FALLBACK_THEME } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const formatPrice = (cents) => `AED ${(cents / 100).toFixed(2)}`;

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-slate-200/60 flex items-center justify-between">
        <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{title}</p>
            <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${bgClass} ${colorClass}`}>
            <Icon size={18} />
        </div>
    </div>
);

const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#6366f1'];

const ReportsView = ({ posTheme: propPosTheme }) => {
    const posTheme = propPosTheme || POS_FALLBACK_THEME;
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        const fetchSales = async () => {
            if (!dateRange.start || !dateRange.end) return;

            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/pos/sales`, {
                    headers: { "Authorization": `Bearer ${token}` },
                    params: {
                        startDate: dateRange.start,
                        endDate: dateRange.end,
                    }
                });
                setSales(response.data);
            } catch (err) {
                setError('Failed to load sales analytics data.');
                toast.error("Failed to load sales report data.");
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, [dateRange]);

    const filteredData = useMemo(() => {
        const filteredSales = sales;
        if (!filteredSales.length) return { filteredSales: [], salesByDay: [], topProducts: [] };

        const salesByDay = filteredSales.reduce((acc, sale) => {
            const day = new Date(sale.invoiceDate).toLocaleDateString('en-CA');
            if (!acc[day]) {
                acc[day] = { date: day, revenue: 0 };
            }
            acc[day].revenue += sale.totalCents / 100;
            return acc;
        }, {});

        const productSales = filteredSales.flatMap(s => s.items).reduce((acc, item) => {
            acc[item.productName] = (acc[item.productName] || 0) + item.quantity;
            return acc;
        }, {});

        const topProducts = Object.entries(productSales)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        return {
            filteredSales,
            salesByDay: Object.values(salesByDay).sort((a, b) => new Date(a.date) - new Date(b.date)),
            topProducts,
        };
    }, [sales]);

    const stats = useMemo(() => {
        const totalRevenue = filteredData.filteredSales.reduce((sum, sale) => sum + sale.totalCents, 0);
        const totalTransactions = filteredData.filteredSales.length;
        const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        return { totalRevenue, totalTransactions, avgTransactionValue };
    }, [filteredData.filteredSales]);

    const dateTickFormatter = (tick) => {
        const date = new Date(tick);
        if (date.getDate() === 1) {
            return date.toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric' });
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) return <div className="p-12 flex justify-center items-center h-full"><Loader className="h-6 w-6 animate-spin text-slate-900" /></div>;
    if (error) return <div className="p-6 text-center text-rose-600 font-semibold bg-rose-50 rounded-2xl text-xs">{error}</div>;

    return (
        <div className="p-4 sm:p-5 font-sans space-y-3.5">
            {/* Header & Date Range Picker */}
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">POS Reports & Analytics</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Track revenue performance, top items, and financial trends.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-xs border border-slate-200/60 text-xs font-semibold text-slate-700">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="bg-transparent outline-none font-medium cursor-pointer" />
                    <span className="text-slate-400 font-bold">to</span>
                    <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="bg-transparent outline-none font-medium cursor-pointer" />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <StatCard title="Total Revenue" value={formatPrice(stats.totalRevenue)} icon={DollarSign} colorClass="text-emerald-700" bgClass="bg-emerald-50" />
                <StatCard title="Total Transactions" value={stats.totalTransactions.toLocaleString()} icon={ShoppingBag} colorClass="text-blue-700" bgClass="bg-blue-50" />
                <StatCard title="Avg. Sale Value" value={formatPrice(stats.avgTransactionValue)} icon={TrendingUp} colorClass="text-amber-700" bgClass="bg-amber-50" />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5">
                <div className="lg:col-span-3 bg-white p-4 rounded-2xl shadow-xs border border-slate-200/60">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Revenue Trend Over Time</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={filteredData.salesByDay}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} tickFormatter={dateTickFormatter} stroke="#64748b" />
                            <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `AED ${value}`} stroke="#64748b" />
                            <Tooltip formatter={(value) => formatPrice(value * 100)} contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }} />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                            <Line type="monotone" dataKey="revenue" stroke={posTheme?.primary || '#0f172a'} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white p-4 rounded-2xl shadow-xs border border-slate-200/60">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Top 5 Selling Items</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={filteredData.topProducts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} fill="#8884d8" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                {filteredData.topProducts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} units sold`} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Reports Catalog */}
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/60">
                <h2 className="text-xs font-bold text-slate-900 mb-2.5 border-b border-slate-100 pb-2 uppercase tracking-wider text-slate-500">Available Report Sheets</h2>
                <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            title: "Business Summary",
                            path: "/pos-reports/business-summary",
                            description: "Comprehensive summary of gross sales, net sales, returns, discounts, and VAT across all store channels.",
                        },
                        {
                            title: "Abstract Brand Report",
                            description: "Evaluates total sales figures across different company brands for clear comparative performance analysis.",
                        },
                        {
                            title: "Weekly Sales Analysis",
                            description: "Tracks sales trends over time on a weekly basis, highlighting growth between current and prior weeks.",
                        },
                        {
                            title: "Daily Sales Report",
                            description: "Concise overview of daily transactions serving as an end-of-day revenue summary.",
                        },
                        {
                            title: "Total Daily Sales Report",
                            description: "Aggregated financial breakdown for each selected business date.",
                        },
                        {
                            title: "Closing Report",
                            path: "/pos-reports/closing",
                            description: "End-of-day register summary enabling register audits, payment channel balance checks, and cashier review.",
                        },
                        {
                            title: "GL Journal Entries",
                            path: "/pos-financial-reports/gl-journal-entries",
                            description: "Detailed General Ledger posting breakdown for POS sales, refunds, COGS, card settlements, and shift closes.",
                        },
                        {
                            title: "POS Trial Balance",
                            path: "/pos-financial-reports/trial-balance",
                            description: "Aggregated debit, credit, and net balances by account for POS accounting transactions.",
                        },
                        {
                            title: "Card Settlement Report",
                            path: "/pos-financial-reports/card-settlement",
                            description: "Bank acquirer settlements, merchant transaction fees, and net deposited amounts.",
                        },
                        {
                            title: "POS VAT Output Report",
                            path: "/pos-financial-reports/vat-output",
                            description: "Daily gross sales revenue and UAE FTA Output VAT (5%) audit ledger.",
                        },
                        {
                            title: "Cash Variance Report",
                            path: "/pos-financial-reports/cash-variance",
                            description: "Shift close cash audit overages and shortages ledger.",
                        },


                    ].map((report, index) => (
                        <div key={index} onClick={() => report.path && navigate(report.path)} className="group cursor-pointer bg-slate-50/70 hover:bg-slate-100/80 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all duration-200 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between gap-1 mb-1">
                                    <h3 className="text-[11px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {report.title}
                                    </h3>
                                    <ArrowUpRight size={13} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                </div>
                                <p className="text-[10px] text-slate-500 leading-normal">
                                    {report.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ReportsView;
