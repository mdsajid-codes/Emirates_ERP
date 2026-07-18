import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    DollarSign,
    ShoppingCart,
    Users,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    Activity,
    CreditCard,
    Truck,
    Receipt,
    Loader,
    AlertCircle,
    RefreshCcw
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
    Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-primary/20"
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
            <span className={`flex items-center font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {trend === 'up' ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                {trendValue}%
            </span>
            <span className="text-gray-400 ml-2 font-medium">vs last month</span>
        </div>
    </motion.div>
);

const PurchaseDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/purchases/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Loading dashboard insights...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                <div className="bg-rose-50 p-4 rounded-full mb-4">
                    <AlertCircle className="h-10 w-10 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
                <p className="text-gray-500 mb-6 max-w-md">{error}</p>
                <button 
                    onClick={fetchDashboardData}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Try Again
                </button>
            </div>
        );
    }

    // Mapping backend data to chart formats
    const trendChartData = data?.trendData?.map(item => ({
        name: item.month,
        orders: item.orders,
        bills: item.bills
    })) || [];

    const stats = data?.stats || {};

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-6 space-y-6 bg-slate-50 min-h-screen"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Purchase Dashboard</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Real-time procurement overview and spending analysis.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={fetchDashboardData}
                        className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                        title="Refresh Data"
                    >
                        <RefreshCcw className="h-5 w-5" />
                    </button>
                    <button className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95">
                        Download Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    index={0}
                    title="Outstanding Payment"
                    value={`${(stats.outstandingPayment || 0).toLocaleString()} AED`}
                    icon={DollarSign}
                    color="bg-blue-500"
                    trend="up"
                    trendValue={0}
                />
                <StatCard
                    index={1}
                    title="Total Orders"
                    value={stats.totalOrders || 0}
                    icon={ShoppingCart}
                    color="bg-indigo-500"
                    trend="up"
                    trendValue={0}
                />
                <StatCard
                    index={2}
                    title="Active Suppliers"
                    value={stats.activeSuppliers || 0}
                    icon={Users}
                    color="bg-emerald-500"
                    trend="up"
                    trendValue={0}
                />
                <StatCard
                    index={3}
                    title="Total Bills"
                    value={stats.totalBills || 0}
                    icon={Receipt}
                    color="bg-amber-500"
                    trend="up"
                    trendValue={0}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend Overview Chart */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Order & Bill Trend</h2>
                        <div className="flex gap-4 text-xs font-semibold">
                            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Orders</div>
                            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Bills</div>
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                                    dy={10} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                                />
                                <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="3 3" />
                                <Tooltip
                                    contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                                        padding: '12px'
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="orders" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorOrders)" 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="bills" 
                                    stroke="#6366f1" 
                                    strokeWidth={3} 
                                    fill="none" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Recent Activity Section */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Recent Activity</h2>
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                        {data?.recentActivity?.map((activity, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                                <div className={`p-2 rounded-lg ${activity.type === 'Order' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {activity.type === 'Order' ? <ShoppingCart size={18} /> : <Receipt size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">{activity.number}</p>
                                    <p className="text-xs text-gray-500 truncate">{activity.supplier}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-gray-900">{activity.amount?.toLocaleString()} AED</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{activity.status}</p>
                                </div>
                            </div>
                        ))}
                        {(!data?.recentActivity || data.recentActivity.length === 0) && (
                            <div className="text-center py-10">
                                <Activity className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">No recent activity</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-primary/5 border border-primary/10 p-4 rounded-xl flex items-start gap-3"
            >
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-800">Dashboard Insight</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Data is synced with the procurement module. Monthly spend is calculated based on approved purchase orders and pending bills.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PurchaseDashboard;
