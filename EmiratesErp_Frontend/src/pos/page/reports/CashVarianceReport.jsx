import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Printer, Calendar, Search, Loader, RefreshCw, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const formatPrice = (value) => {
    if (value === undefined || value === null) return '0.00';
    return new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const CashVarianceReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0]
    });
    const [searchTerm, setSearchTerm] = useState('');

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/pos/reports/cash-variance`, {
                headers: { "Authorization": `Bearer ${token}` },
                params: {
                    fromDate: dateRange.fromDate,
                    toDate: dateRange.toDate
                }
            });
            setData(response.data || []);
        } catch (error) {
            console.error("Error fetching cash variance report:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredData = data.filter(item => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            item.entryNumber?.toLowerCase().includes(search) ||
            item.referenceNumber?.toLowerCase().includes(search) ||
            item.overOrShort?.toLowerCase().includes(search)
        );
    });

    const summary = filteredData.reduce((acc, item) => {
        if (item.overOrShort === 'SHORT') acc.short += item.varianceAmount || 0;
        if (item.overOrShort === 'OVER') acc.over += item.varianceAmount || 0;
        return acc;
    }, { short: 0, over: 0 });

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <AlertCircle className="w-7 h-7 text-rose-600" />
                        POS Cash Variance Report
                    </h1>
                    <p className="text-sm text-slate-500">Shift close cash audit overages and shortages ledger</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 shadow-sm text-sm font-medium transition"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 shadow-sm text-sm font-medium transition"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                </div>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Total Shortage (Deficit)</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">AED {formatPrice(summary.short)}</p>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Overage (Surplus)</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">AED {formatPrice(summary.over)}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                        <RefreshCw className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <Calendar className="w-4 h-4 text-rose-600" />
                    Date Filter:
                </div>
                <input
                    type="date"
                    name="fromDate"
                    value={dateRange.fromDate}
                    onChange={handleDateChange}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
                <span className="text-slate-400">to</span>
                <input
                    type="date"
                    name="toDate"
                    value={dateRange.toDate}
                    onChange={handleDateChange}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
                <button
                    onClick={fetchData}
                    className="px-4 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm font-medium transition"
                >
                    Apply Filter
                </button>

                <div className="ml-auto flex items-center gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search entry or shift..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-slate-500 gap-3">
                        <Loader className="w-6 h-6 animate-spin text-rose-600" />
                        <span>Loading cash variance data...</span>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="py-16 text-center text-slate-500">
                        No cash variance records found for the selected date range.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100/75 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Entry No</th>
                                    <th className="py-3 px-4">Shift Reference</th>
                                    <th className="py-3 px-4 text-right">Variance Amount (AED)</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {filteredData.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-50/80 transition">
                                        <td className="py-3 px-4 font-mono text-xs text-slate-600">{item.date}</td>
                                        <td className="py-3 px-4 font-semibold text-slate-900">{item.entryNumber}</td>
                                        <td className="py-3 px-4 text-slate-600">{item.referenceNumber || '-'}</td>
                                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                                            {formatPrice(item.varianceAmount)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {item.overOrShort === 'SHORT' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                                                    SHORT (Deficit)
                                                </span>
                                            )}
                                            {item.overOrShort === 'OVER' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    OVER (Surplus)
                                                </span>
                                            )}
                                            {item.overOrShort === 'BALANCED' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                    BALANCED
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashVarianceReport;
