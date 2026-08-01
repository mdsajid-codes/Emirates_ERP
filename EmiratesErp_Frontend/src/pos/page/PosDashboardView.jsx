import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
    Search, 
    Upload, 
    Download, 
    TrendingUp, 
    TrendingDown, 
    Store, 
    MoreHorizontal, 
    ArrowUpRight,
    ArrowRight,
    ChevronDown,
    Loader,
    AlertCircle,
    Watch
} from 'lucide-react';
import { POS_FALLBACK_THEME } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0.00';
    return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const PosDashboardView = ({ setActiveItem, posTheme: propPosTheme }) => {
    const posTheme = propPosTheme || POS_FALLBACK_THEME;

    const [stats, setStats] = useState({
        todayRevenue: 500324,
        totalSalesCount: 202324,
        totalProducts: 123726,
        totalCustomers: 3440031,
    });
    const [recentSales, setRecentSales] = useState([]);
    const [topProduct, setTopProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { headers: { "Authorization": `Bearer ${token}` } } : {};

                const [salesRes, productsRes, customersRes] = await Promise.allSettled([
                    axios.get(`${API_URL}/pos/sales`, headers),
                    axios.get(`${API_URL}/pos/products`, headers),
                    axios.get(`${API_URL}/pos/customers`, headers),
                ]);

                let salesData = salesRes.status === 'fulfilled' && Array.isArray(salesRes.value?.data) ? salesRes.value.data : [];
                let productsData = productsRes.status === 'fulfilled' && Array.isArray(productsRes.value?.data) ? productsRes.value.data : [];
                let customersData = customersRes.status === 'fulfilled' && Array.isArray(customersRes.value?.data) ? customersRes.value.data : [];

                const totalRevCents = salesData.reduce((sum, s) => sum + (s.totalCents || 0), 0);
                const computedRev = totalRevCents > 0 ? totalRevCents / 100 : 500324;

                setStats({
                    todayRevenue: computedRev,
                    totalSalesCount: salesData.length > 0 ? salesData.length : 202324,
                    totalProducts: productsData.length > 0 ? productsData.length : 123726,
                    totalCustomers: customersData.length > 0 ? customersData.length : 3440031,
                });

                if (salesData.length > 0) {
                    const mappedSales = salesData.slice(0, 4).map((sale, index) => {
                        const defaultNames = ['Airpods Pro Max', 'Summer Clothes', 'Nike Shoes', 'Front Table CSS'];
                        const defaultPayments = ['Mastercard', 'Paypal', 'Mastercard', 'Visa'];
                        const defaultStatuses = ['In Progress', 'Complete', 'Waiting', 'In Progress'];
                        const defaultDates = ['28 Mar 2025', '27 Mar 2025', '26 Mar 2025', '25 Mar 2025'];
                        const defaultAmounts = [1230.00, 3112.00, 1211.00, 42121.00];

                        let itemName = sale.items?.[0]?.productName || sale.productName || defaultNames[index % 4];
                        let itemDate = sale.invoiceDate ? new Date(sale.invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : defaultDates[index % 4];

                        return {
                            id: sale.id ? `#${sale.id}` : `#20252${3 - index}`,
                            productName: itemName,
                            date: itemDate,
                            payment: sale.paymentMethod || defaultPayments[index % 4],
                            amount: sale.totalCents ? sale.totalCents / 100 : defaultAmounts[index % 4],
                            status: sale.status || defaultStatuses[index % 4],
                            iconBg: ['bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600', 'bg-cyan-100 text-cyan-600', 'bg-slate-100 text-slate-600'][index % 4]
                        };
                    });
                    setRecentSales(mappedSales);
                } else {
                    setRecentSales(defaultRecentOrders);
                }

                if (productsData.length > 0) {
                    setTopProduct(productsData[0]);
                }
            } catch (err) {
                console.error("Error fetching POS dashboard data:", err);
                setRecentSales(defaultRecentOrders);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const defaultRecentOrders = [
        {
            id: '#202523',
            productName: 'Airpods Pro Max',
            date: '28 Mar 2025',
            payment: 'Mastercard',
            amount: 1230.00,
            status: 'In Progress',
            iconBg: 'bg-emerald-100 text-emerald-600',
            img: '🎧'
        },
        {
            id: '#202522',
            productName: 'Summer Clothes',
            date: '27 Mar 2025',
            payment: 'Paypal',
            amount: 3112.00,
            status: 'Complete',
            iconBg: 'bg-amber-100 text-amber-600',
            img: '👕'
        },
        {
            id: '#202521',
            productName: 'Nike Shoes',
            date: '26 Mar 2025',
            payment: 'Mastercard',
            amount: 1211.00,
            status: 'Waiting',
            iconBg: 'bg-cyan-100 text-cyan-600',
            img: '👟'
        },
        {
            id: '#202520',
            productName: 'Front Table CSS',
            date: '25 Mar 2025',
            payment: 'Visa',
            amount: 42121.00,
            status: 'In Progress',
            iconBg: 'bg-slate-100 text-slate-600',
            img: '🪑'
        }
    ];

    const displayOrders = recentSales.length > 0 ? recentSales : defaultRecentOrders;

    const filteredOrders = searchQuery
        ? displayOrders.filter(o => 
            o.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
            o.id.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : displayOrders;

    const barChartData = [
        { month: 'Jan', revenue: 3400, max: 7000, profitHeight: '65%' },
        { month: 'Feb', revenue: 2800, max: 6200, profitHeight: '75%' },
        { month: 'Mar', revenue: 4000, max: 5500, profitHeight: '40%' },
        { month: 'May', revenue: 2500, max: 5000, profitHeight: '55%' },
        { month: 'Apr', revenue: 4500, max: 6800, profitHeight: '45%' },
    ];

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'complete':
            case 'completed':
                return { backgroundColor: posTheme.success || '#dcfce7', color: posTheme.successFg || '#15803d' };
            case 'waiting':
            case 'pending':
                return { backgroundColor: posTheme.error || '#fee2e2', color: posTheme.errorFg || '#dc2626' };
            case 'in progress':
            default:
                return { backgroundColor: posTheme.info || '#dbeafe', color: posTheme.infoFg || '#1d4ed8' };
        }
    };

    return (
        <div 
            className="p-3.5 sm:p-4 lg:p-5 space-y-4 font-sans transition-colors duration-300"
            style={{ backgroundColor: posTheme.pageBg, color: posTheme.text }}
        >
            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: posTheme.text }}>Dashboard</h1>
                
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-60">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 rounded-full text-xs border-0 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 transition-all"
                            style={{ backgroundColor: posTheme.cardBg, color: posTheme.text }}
                        />
                    </div>

                    {/* Export CSV Button */}
                    <button 
                        onClick={() => alert('Exporting CSV...')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm hover:opacity-90 transition-all border border-slate-200"
                        style={{ backgroundColor: posTheme.cardBg, color: posTheme.text }}
                    >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Export CSV</span>
                    </button>

                    {/* Download Report Button */}
                    <button 
                        onClick={() => alert('Downloading Report...')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:opacity-90 transition-all border"
                        style={{ backgroundColor: posTheme.primary, color: '#ffffff', borderColor: posTheme.primary }}
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Report</span>
                    </button>
                </div>
            </div>

            {/* Top 3 Column Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                
                {/* Left Column: 2 Vertically Stacked KPI Cards */}
                <div className="lg:col-span-3 flex flex-col gap-3.5">
                    {/* Card 1: Total Products Sales */}
                    <div 
                        className="pos-card-animated p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between flex-1 transition-all duration-300"
                        style={{ backgroundColor: posTheme.cardBg, color: posTheme.text }}
                    >
                        <div>
                            <div className="flex justify-between items-start">
                                <p className="text-xs font-medium opacity-70">Total Products Sales</p>
                                <div className="p-2 rounded-xl opacity-80" style={{ backgroundColor: posTheme.pageBg }}>
                                    <TrendingUp className="h-4 w-4" style={{ color: posTheme.text }} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 mt-2">
                                <span className="text-2xl font-extrabold tracking-tight">
                                    {stats.totalSalesCount ? stats.totalSalesCount.toLocaleString() : '202,324'}
                                </span>
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#bbf7d0] text-[#15803d]">
                                    +10%
                                    <TrendingUp className="h-3 w-3" />
                                </span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200/50 mt-4">
                            <button 
                                onClick={() => setActiveItem && setActiveItem('Sales')} 
                                className="w-full flex items-center justify-between text-xs font-bold hover:opacity-80 transition-colors"
                                style={{ color: posTheme.text }}
                            >
                                <span>View Sales Details</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Card 2: Total Volume Of Products */}
                    <div 
                        className="pos-card-animated p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between flex-1 transition-all duration-300"
                        style={{ backgroundColor: posTheme.cardBg, color: posTheme.text }}
                    >
                        <div>
                            <div className="flex justify-between items-start">
                                <p className="text-xs font-medium opacity-70">Total Volume Of Products</p>
                                <div className="p-2 rounded-xl opacity-80" style={{ backgroundColor: posTheme.pageBg }}>
                                    <Store className="h-4 w-4" style={{ color: posTheme.text }} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 mt-2">
                                <span className="text-2xl font-extrabold tracking-tight">
                                    {stats.totalProducts ? stats.totalProducts.toLocaleString() : '123,726'}
                                </span>
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fecaca] text-[#dc2626]">
                                    -12%
                                    <TrendingDown className="h-3 w-3" />
                                </span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200/50 mt-4">
                            <button 
                                onClick={() => setActiveItem && setActiveItem('Products')}
                                className="w-full flex items-center justify-between text-xs font-bold hover:opacity-80 transition-colors"
                                style={{ color: posTheme.text }}
                            >
                                <span>View All Products</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Middle Column: Total Products Sales Main Bar Chart */}
                <div 
                    className="lg:col-span-5 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between transition-all duration-300"
                    style={{ backgroundColor: posTheme.cardAlt, color: posTheme.text }}
                >
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium opacity-70">Total Products Sales</p>
                                <div className="flex items-center gap-2.5 mt-0.5">
                                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: posTheme.text }}>
                                        {formatCurrency(stats.todayRevenue)}
                                    </h2>
                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#bbf7d0] text-[#15803d]">
                                        +45%
                                        <TrendingUp className="h-3 w-3" />
                                    </span>
                                </div>
                            </div>
                            
                            <button className="opacity-60 hover:opacity-100 p-1 rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Chart Legend */}
                        <div className="flex items-center justify-end gap-4 mt-2 text-[11px] font-medium opacity-80">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: posTheme.barRevenue }}></span>
                                <span>Total Revenue</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full border border-dashed" style={{ backgroundColor: posTheme.barProfit, borderColor: posTheme.text }}></span>
                                <span>Total Profit</span>
                            </div>
                        </div>
                    </div>

                    {/* Stacked Custom Bar Chart Visual */}
                    <div className="mt-3">
                        <div className="grid grid-cols-6 items-end gap-2 sm:gap-3 h-44 pt-2">
                            {/* Y-Axis Labels Column */}
                            <div className="flex flex-col justify-between h-full text-[10px] font-semibold opacity-60 pb-6 pr-1">
                                <span>7000</span>
                                <span>6000</span>
                                <span>5000</span>
                                <span>4000</span>
                                <span>3000</span>
                                <span>2000</span>
                                <span>1000</span>
                            </div>

                            {/* Bar Columns */}
                            {barChartData.map((bar) => (
                                <div key={bar.month} className="flex flex-col items-center h-full justify-end group">
                                    <div className="w-full max-w-[40px] flex flex-col items-center justify-end h-full relative">
                                        
                                        {/* Top Striped Pattern (Profit) */}
                                        <div 
                                            className="w-full rounded-t-lg relative overflow-hidden transition-all border-t border-x border-slate-300/40"
                                            style={{ 
                                                height: bar.profitHeight,
                                                backgroundColor: posTheme.barProfit,
                                                backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.08) 0, rgba(0,0,0,0.08) 4px, transparent 0, transparent 8px)'
                                            }}
                                        >
                                            <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: posTheme.text }}>
                                                {bar.max}
                                            </span>
                                        </div>

                                        {/* Bottom Solid Bar (Revenue) */}
                                        <div 
                                            className="w-full rounded-b-lg flex items-center justify-center transition-all"
                                            style={{ height: `${(bar.revenue / 7000) * 100}%`, backgroundColor: posTheme.barRevenue }}
                                        >
                                            <span className="text-[9px] font-bold text-white tracking-tighter">
                                                {bar.revenue}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Month Pill Badge */}
                                    <span 
                                        className="mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold shadow-xs"
                                        style={{ backgroundColor: posTheme.barLabelBg, color: posTheme.barLabelFg }}
                                    >
                                        {bar.month}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Total Sales Statistics Donut Chart Card */}
                <div 
                    className="lg:col-span-4 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between transition-all duration-300"
                    style={{ backgroundColor: posTheme.cardBg, color: posTheme.text }}
                >
                    <div>
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold" style={{ color: posTheme.text }}>Total Sales Statistics</h3>
                            <button className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors opacity-80" style={{ backgroundColor: posTheme.pageBg }}>
                                <span>Monthly</span>
                                <ChevronDown className="h-3 w-3" />
                            </button>
                        </div>

                        {/* Donut Chart with Category Overlay */}
                        <div className="relative my-3 flex items-center justify-center">
                            
                            {/* Donut Visual */}
                            <div 
                                className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-full flex items-center justify-center border-[14px] shadow-inner transition-all duration-300"
                                style={{
                                    borderColor: posTheme.donutSeg1,
                                    borderTopColor: posTheme.donutSeg2,
                                    borderRightColor: posTheme.donutSeg3,
                                    borderBottomColor: posTheme.donutSeg4,
                                }}
                            >
                                <div className="text-center">
                                    <p className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: posTheme.donutCenter }}>23,324</p>
                                    <span className="inline-flex items-center gap-0.5 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#bbf7d0] text-[#15803d]">
                                        +45%
                                        <TrendingUp className="h-3 w-3" />
                                    </span>
                                </div>
                            </div>

                            {/* Category Pointer Callouts */}
                            <div className="absolute top-1 left-0 text-left">
                                <p className="text-[11px] font-medium flex items-center gap-1 opacity-70">
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: posTheme.donutSeg2 }}></span> Furniture
                                </p>
                                <p className="text-[11px] font-extrabold" style={{ color: posTheme.text }}>89.532</p>
                            </div>

                            <div className="absolute top-1 right-0 text-right">
                                <p className="text-[11px] font-medium flex items-center justify-end gap-1 opacity-70">
                                    Shoes <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: posTheme.donutSeg1 }}></span>
                                </p>
                                <p className="text-[11px] font-extrabold" style={{ color: posTheme.text }}>1.88.500</p>
                            </div>

                            <div className="absolute bottom-1 left-0 text-left">
                                <p className="text-[11px] font-medium flex items-center gap-1 opacity-70">
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: posTheme.donutSeg3 }}></span> Electronics
                                </p>
                                <p className="text-[11px] font-extrabold" style={{ color: posTheme.text }}>90,231</p>
                            </div>

                            <div className="absolute bottom-1 right-0 text-right">
                                <p className="text-[11px] font-medium flex items-center justify-end gap-1 opacity-70">
                                    Clothes <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: posTheme.donutSeg4 }}></span>
                                </p>
                                <p className="text-[11px] font-extrabold" style={{ color: posTheme.text }}>88.865</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Summary */}
                    <div className="pt-2.5 border-t border-slate-200/40 text-center">
                        <p className="text-[11px] font-semibold opacity-70">Total Number of Sales</p>
                        <p className="text-xl font-extrabold tracking-tight mt-0.5" style={{ color: posTheme.text }}>
                            {stats.totalCustomers ? stats.totalCustomers.toLocaleString() : '3,44,0031'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom 2 Column Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                
                {/* Left Column: Recent Orders Table */}
                <div 
                    className="lg:col-span-8 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between transition-all duration-300"
                    style={{ backgroundColor: posTheme.cardBg, color: posTheme.text }}
                >
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h2 className="text-base font-bold" style={{ color: posTheme.text }}>Recent Orders</h2>
                                <p className="text-[11px] font-medium opacity-70 mt-0.5">Keep track of recent order data and other information.</p>
                            </div>

                            <button 
                                onClick={() => setActiveItem && setActiveItem('Sales')}
                                className="flex items-center gap-1 px-3 py-1 border border-slate-200 rounded-full text-[11px] font-semibold hover:opacity-80 transition-colors shadow-sm"
                                style={{ backgroundColor: posTheme.pageBg, color: posTheme.text }}
                            >
                                <span>View All</span>
                                <ArrowRight className="h-3 w-3" />
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[11px] font-medium border-b border-slate-200/50 opacity-70">
                                        <th className="pb-2 font-medium">Order Id</th>
                                        <th className="pb-2 font-medium">Product Name</th>
                                        <th className="pb-2 font-medium">Date</th>
                                        <th className="pb-2 font-medium">Payment</th>
                                        <th className="pb-2 font-medium">Amount</th>
                                        <th className="pb-2 font-medium">Status</th>
                                        <th className="pb-2 font-medium text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/40 text-xs">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:opacity-90 transition-colors">
                                            <td className="py-2.5 font-bold" style={{ color: posTheme.text }}>{order.id}</td>
                                            <td className="py-2.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm ${order.iconBg || 'bg-slate-100 text-slate-600'}`}>
                                                        {order.img || '📦'}
                                                    </div>
                                                    <span className="font-bold" style={{ color: posTheme.text }}>{order.productName}</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 font-medium opacity-80">{order.date}</td>
                                            <td className="py-2.5 font-medium opacity-80">{order.payment}</td>
                                            <td className="py-2.5 font-bold" style={{ color: posTheme.text }}>{formatCurrency(order.amount)}</td>
                                            <td className="py-2.5">
                                                <span 
                                                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold inline-block"
                                                    style={getStatusStyle(order.status)}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-2.5 text-center">
                                                <button className="opacity-60 hover:opacity-100 p-0.5">
                                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Top Selling Products Card */}
                <div 
                    className="lg:col-span-4 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between transition-all duration-300"
                    style={{ backgroundColor: posTheme.cardBg, color: posTheme.text }}
                >
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold" style={{ color: posTheme.text }}>Top Selling Products</h3>
                            <button className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors opacity-80" style={{ backgroundColor: posTheme.pageBg }}>
                                <span>Monthly</span>
                                <ChevronDown className="h-3 w-3" />
                            </button>
                        </div>

                        {/* Highlighted Product Card */}
                        <div className="p-3 rounded-xl border border-slate-200/50 flex items-center justify-between gap-2.5" style={{ backgroundColor: posTheme.pageBg }}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-lg bg-white p-1.5 shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0">
                                    <Watch className="h-6 w-6 text-slate-800" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold leading-tight" style={{ color: posTheme.text }}>
                                        {topProduct ? topProduct.name : 'Apple Watch Series 10 46mm GPS'}
                                    </h4>
                                    <p className="text-[10px] font-medium opacity-70 mt-0.5">
                                        Brand: {topProduct ? topProduct.brand || 'Apple' : 'Apple'} <span className="mx-1">•</span> 10.2k Stock Available
                                    </p>
                                    <p className="text-xs font-extrabold mt-0.5" style={{ color: posTheme.text }}>
                                        {topProduct ? formatCurrency(topProduct.priceCents ? topProduct.priceCents/100 : 799) : '$799.00'}
                                    </p>
                                </div>
                            </div>

                            {/* Vertical Pagination Dots */}
                            <div className="flex flex-col gap-1 items-center pl-1">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: posTheme.primary }}></span>
                                <span className="h-1 w-1 rounded-full opacity-40" style={{ backgroundColor: posTheme.text }}></span>
                                <span className="h-1 w-1 rounded-full opacity-40" style={{ backgroundColor: posTheme.text }}></span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Day of Week Sales Bar Chart */}
                    <div className="mt-4 pt-2">
                        <div className="grid grid-cols-4 items-end gap-2.5 h-24">
                            {[
                                { day: 'Tue', val: 840, height: '30%' },
                                { day: 'Wed', val: 2000, height: '55%' },
                                { day: 'Thu', val: 6000, height: '90%' },
                                { day: 'Fri', val: 1200, height: '40%' }
                            ].map((item) => (
                                <div key={item.day} className="flex flex-col items-center h-full justify-end">
                                    <span className="text-[10px] font-bold opacity-70 mb-1">{item.val}</span>
                                    <div 
                                        className="w-full max-w-[36px] rounded-full transition-all"
                                        style={{ height: item.height, backgroundColor: posTheme.dayBar }}
                                    ></div>
                                    <span className="text-[11px] font-semibold opacity-80 mt-2">{item.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PosDashboardView; 