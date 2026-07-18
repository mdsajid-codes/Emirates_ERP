import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calculator, ArrowLeft, Printer, Download,
    TrendingUp, TrendingDown, DollarSign, Package,
    Clock, Cpu, ShieldCheck, RefreshCw, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CostSheetPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [costData, setCostData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCostSheet();
    }, [id]);

    const fetchCostSheet = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/hanger/cost-rates/batch/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCostData(res.data);
        } catch (error) {
            console.error('Error fetching cost sheet:', error);
            toast.error('Failed to calculate production costs');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-24 gap-4 animate-pulse">
            <Calculator className="w-12 h-12 text-primary animate-bounce" />
            <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">Computing Financial Data...</p>
        </div>
    );

    if (!costData) return (
        <div className="p-12 text-center text-slate-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">Batch data not found for costing</p>
        </div>
    );

    return (
        <div className="p-6 w-full space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 py-4 -mx-6 px-6">
                <div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </button>
                        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                            Production Cost Sheet
                        </h1>
                    </div>
                    <p className="text-slate-500 text-xs font-bold mt-1 ml-12 uppercase tracking-widest">
                        Batch: <span className="text-primary">{costData.batchNo}</span> • Real-time Estimation
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        <Printer className="w-4 h-4" />
                        PDF Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign className="w-12 h-12" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Estimated Cost</p>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">AED {costData.totalEstimatedCost?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-black">ACTIVE ESTIMATE</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Package className="w-12 h-12 text-primary" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Labor & Utilites</p>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">AED {costData.laborCost?.toLocaleString()}</h2>
                    <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase">Direct Production Expense</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="w-12 h-12 text-indigo-500" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Material Value</p>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">AED {costData.materialCost?.toLocaleString()}</h2>
                    <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase">Raw Material Consumption</p>
                </div>
            </div>

            {/* Breakdown Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-primary" />
                        Detailed Breakdown
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Rate</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty / Hours</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {costData.breakdown.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.category === 'Raw Material' ? 'bg-indigo-400' :
                                                item.category === 'Wire Cutting' ? 'bg-blue-400' :
                                                    item.category === 'Bending' ? 'bg-orange-400' :
                                                        item.category === 'Coating' ? 'bg-purple-400' :
                                                            item.category === 'Recovery' ? 'bg-emerald-400' : 'bg-slate-300'
                                                }`} />
                                            <span className="text-xs font-bold text-slate-700">{item.category}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{item.description}</td>
                                    <td className="px-6 py-4 text-xs font-black text-slate-700 text-right">
                                        {item.rate ? `AED ${item.rate.toLocaleString()}` : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-black text-slate-700 text-right">
                                        {item.quantity ? item.quantity.toLocaleString() : '—'}
                                    </td>
                                    <td className={`px-6 py-4 text-xs font-black text-right ${item.subtotal < 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        AED {item.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-50 font-black">
                                <td colSpan="4" className="px-6 py-6 text-sm text-slate-900 text-right uppercase tracking-widest border-t-2 border-slate-200">Total Batch Estimation</td>
                                <td className="px-6 py-6 text-xl text-primary text-right border-t-2 border-slate-200 tracking-tighter">
                                    AED {costData.totalEstimatedCost?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Action Card */}
            <div className="bg-indigo-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-200">
                <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight">Financial Accuracy Disclaimer</h3>
                    <p className="text-indigo-100 text-sm max-w-lg leading-relaxed font-medium">
                        These costs are estimated based on recorded labor hours, consumption logs, and configured rates. Actual overheads might vary based on factory utility invoices.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/production-dashboard/hanger/settings/cost-rate')}
                    className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-lg"
                >
                    <RefreshCw className="w-4 h-4" />
                    Configure Rates
                </button>
            </div>
        </div>
    );
};

export default CostSheetPage;
