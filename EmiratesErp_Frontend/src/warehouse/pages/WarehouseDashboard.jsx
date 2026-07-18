import React, { useState, useEffect } from 'react';
import {
    Package,
    Truck,
    Clock,
    ArrowRight,
    Layers,
    AlertCircle,
    CheckCircle2,
    TrendingUp,
    FileText,
    Boxes,
    ChevronRight,
    Loader2
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const WarehouseDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalFgStock: 0,
        cartonsPackedToday: 0,
        activeProductionBatches: 0,
        pendingDeliveries: 0
    });
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, logsRes] = await Promise.all([
                axios.get(`${API_URL}/hanger/packing/warehouse-stats`, { headers }),
                axios.get(`${API_URL}/hanger/packing/recent`, { headers })
            ]);

            setStats(statsRes.data);
            setRecentLogs(logsRes.data);
        } catch (error) {
            console.error('Error fetching warehouse data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">Loading Warehouse Ecosystem...</p>
        </div>
    );

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Boxes className="w-8 h-8 text-blue-600" />
                        Warehouse Control Center
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Real-time finished goods stock and dispatch operations
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/warehouse-dashboard/fg-stock')}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 group"
                    >
                        View FG Stock
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total FG Stock"
                    value={stats.totalFgStock.toLocaleString()}
                    unit="PCS"
                    icon={Package}
                    color="blue"
                    description="Verified finished goods in storage"
                />
                <StatCard
                    title="Packed Today"
                    value={stats.cartonsPackedToday}
                    unit="CARTONS"
                    icon={CheckCircle2}
                    color="emerald"
                    description="Inventory moved to warehouse today"
                />
                <StatCard
                    title="Active Production"
                    value={stats.activeProductionBatches}
                    unit="BATCHES"
                    icon={Layers}
                    color="purple"
                    description="Batches currently being processed"
                    onClick={() => navigate('/production-dashboard/hanger/batches')}
                />
                <StatCard
                    title="Pending Deliveries"
                    value={stats.pendingDeliveries}
                    unit="DOs"
                    icon={Truck}
                    color="amber"
                    description="Waiting to be dispatched"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            Recent Packing Activity
                        </h3>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Packing No</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch Reference</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty Packed</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentLogs.length > 0 ? recentLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => navigate(`/production-dashboard/hanger/batches/${log.batchId}`)}>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">{log.packingBatchNo}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[10px] font-bold text-slate-500 uppercase">{log.batchNo}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-xs font-black text-slate-700">{log.packedQty.toLocaleString()} pcs</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${log.status === 'PACKED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold text-slate-400">{new Date(log.createdAt).toLocaleDateString()}</span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">No recent packing logs detected</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions & Links */}
                <div className="space-y-6">
                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest px-2">Warehouse Analytics</h3>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl group hover:bg-blue-100 transition-colors cursor-pointer" onClick={() => navigate('/warehouse-dashboard/fg-stock')}>
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-slate-900">Inventory Health</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">View stock across all models</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl group hover:bg-purple-100 transition-colors cursor-pointer" onClick={() => navigate('/production-dashboard/hanger/batches/wip')}>
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <Layers className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-slate-900">Production WIP</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Monitor floor bottlenecking</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl group hover:bg-emerald-100 transition-colors cursor-pointer">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <FileText className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-slate-900">Packing Lists</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Access historical packing PDFs</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                        <div className="relative z-10">
                            <h3 className="text-lg font-black tracking-tight mb-2">Automated Dispatch</h3>
                            <p className="text-slate-400 font-medium text-xs leading-relaxed mb-6">
                                The system auto-generates Delivery Orders (DO) upon packing confirmation for seamless sales integration.
                            </p>
                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">
                                Review Sales DO Queue <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Truck className="w-32 h-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, unit, icon: Icon, color, description, onClick }) => {
    const colorClasses = {
        blue: 'bg-blue-600 shadow-blue-200',
        emerald: 'bg-emerald-600 shadow-emerald-200',
        purple: 'bg-purple-600 shadow-purple-200',
        amber: 'bg-amber-600 shadow-amber-200'
    };

    return (
        <div
            onClick={onClick}
            className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden transition-all group ${onClick ? 'cursor-pointer hover:border-slate-300 active:scale-95' : ''}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${colorClasses[color]} text-white shadow-lg`}>
                    <Icon className="w-5 h-5" />
                </div>
                {onClick && <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-all group-hover:translate-x-1" />}
            </div>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h2>
                <span className="text-[10px] font-black text-slate-300 uppercase">{unit}</span>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-4 tracking-tight">{description}</p>

            <div className={`absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity ${color === 'blue' ? 'bg-blue-600' : color === 'emerald' ? 'bg-emerald-600' : color === 'purple' ? 'bg-purple-600' : 'bg-amber-600'
                }`} />
        </div>
    );
};

export default WarehouseDashboard;
