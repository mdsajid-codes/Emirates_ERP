import React, { useState, useEffect } from 'react';
import {
    Activity, TrendingUp, CheckCircle2, XCircle,
    Clock, Layers, ArrowLeft, RefreshCw, BarChart3,
    AlertCircle, Loader2, Zap, Gauge, Percent, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const OeeDashboardPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOeeData();
    }, []);

    const fetchOeeData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/hanger/job-cards/oee-summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching OEE data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-slate-500 font-bold tracking-widest text-xs uppercase text-center">Analysing Overall Equipment Effectiveness...</p>
        </div>
    );

    const getOeeColor = (val) => {
        if (!val) return 'text-slate-400 bg-slate-100';
        if (val >= 85) return 'text-emerald-700 bg-emerald-100 ring-emerald-200';
        if (val >= 60) return 'text-amber-700 bg-amber-100 ring-amber-200';
        return 'text-rose-700 bg-rose-100 ring-rose-200';
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/production-dashboard/hanger/batches')}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Gauge className="w-8 h-8 text-primary" />
                            Production OEE Dashboard
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-wider">
                            Real-time efficiency analytics for shop floor
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchOeeData}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all shadow-sm group"
                >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    Refresh Analytics
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <OeeStatCard
                    title="Overall OEE"
                    value={data?.avgOee || 0}
                    icon={Gauge}
                    color="primary"
                    description="Aggregate efficiency score"
                />
                <OeeStatCard
                    title="Availability"
                    value={data?.avgAvailability || 0}
                    icon={Clock}
                    color="blue"
                    description="Uptime vs Planned time"
                />
                <OeeStatCard
                    title="Performance"
                    value={data?.avgPerformance || 0}
                    icon={Zap}
                    color="purple"
                    description="Actual vs Theoretical output"
                />
                <OeeStatCard
                    title="Quality Index"
                    value={data?.avgQuality || 0}
                    icon={ShieldCheck}
                    color="emerald"
                    description="Good units vs Total produced"
                />
            </div>

            {/* Sub Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            Batch Performance Log
                        </h3>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Card / Batch</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Avail %</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Perf %</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qual %</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">OEE %</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Yield</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data?.batches?.length > 0 ? data.batches.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/production-dashboard/hanger/batches/${item.batchId}`)}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-900 group-hover:text-primary transition-colors">{item.jobCardNo}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.batchNo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold text-slate-600">{item.availability || '0'}%</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold text-slate-600">{item.performance || '0'}%</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold text-slate-600">{item.quality || '0'}%</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ring-1 ${getOeeColor(item.oee)}`}>
                                                {item.oee || '0'}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-black text-slate-700">{item.producedQty - (item.rejectedQty || 0)} pcs</span>
                                                <span className="text-[10px] font-bold text-rose-500">-{item.rejectedQty || 0} rej</span>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No production data available for analysis</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest px-2">Volume Summary</h3>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Produced</p>
                                    <h4 className="text-2xl font-black text-slate-900">{data?.totalProducedQty?.toLocaleString() || 0}</h4>
                                </div>
                                <Activity className="w-8 h-8 text-primary/20" />
                            </div>

                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-1000"
                                    style={{ width: `${data?.totalProducedQty > 0 ? (100 - (data.totalRejectedQty / data.totalProducedQty * 100)) : 100}%` }}
                                />
                            </div>

                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-emerald-600">Good: {((data?.totalProducedQty - data?.totalRejectedQty) || 0).toLocaleString()}</span>
                                <span className="text-rose-600">Rejected: {data?.totalRejectedQty?.toLocaleString() || 0}</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quality Yield</p>
                                <p className="text-lg font-black text-emerald-600">{data?.avgQuality || 0}%</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Records</p>
                                <p className="text-lg font-black text-slate-900">{data?.totalJobCards || 0} JC</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10">
                            <h3 className="text-lg font-black tracking-tight mb-2">Efficiency Targets</h3>
                            <p className="text-slate-400 font-medium text-xs leading-relaxed mb-6 italic">
                                "The World Class OEE benchmark is 85%. Aim for continuous improvement across all production cells."
                            </p>
                            <div className="flex gap-2">
                                <div className="px-2 py-1 bg-white/10 rounded text-[9px] font-bold border border-white/10">AVAIL: 90%</div>
                                <div className="px-2 py-1 bg-white/10 rounded text-[9px] font-bold border border-white/10">PERF: 95%</div>
                                <div className="px-2 py-1 bg-white/10 rounded text-[9px] font-bold border border-white/10">QUAL: 99%</div>
                            </div>
                        </div>
                        <Percent className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 -rotate-12" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const OeeStatCard = ({ title, value, icon: Icon, color, description }) => {
    const getColor = () => {
        if (value >= 85) return 'bg-emerald-600 text-white shadow-emerald-200 ring-4 ring-emerald-50';
        if (value >= 60) return 'bg-amber-500 text-white shadow-amber-200 ring-4 ring-amber-50';
        return 'bg-rose-600 text-white shadow-rose-200 ring-4 ring-rose-50';
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group transition-all hover:scale-[1.02] active:scale-95">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-2xl transition-all ${getColor()}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
                    <h2 className="text-3xl font-black text-slate-900 group-hover:text-primary transition-colors">{value}%</h2>
                </div>
            </div>

            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-4 flex items-center gap-1.5 border-t border-slate-50 pt-4">
                <AlertCircle className="w-3 h-3 text-slate-300" />
                {description}
            </p>

            <div className={`absolute bottom-0 left-0 w-full h-1 bg-transparent group-hover:bg-primary transition-colors`} />
        </div>
    );
};

export default OeeDashboardPage;
