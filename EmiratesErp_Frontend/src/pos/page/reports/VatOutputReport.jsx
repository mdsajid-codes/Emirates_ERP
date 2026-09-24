import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Receipt, Printer, Calendar, Loader, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const formatPrice = (value) => {
    if (value === undefined || value === null) return '0.00';
    return new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const VatOutputReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0]
    });

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/pos/reports/vat-output`, {
                headers: { "Authorization": `Bearer ${token}` },
                params: {
                    fromDate: dateRange.fromDate,
                    toDate: dateRange.toDate
                }
            });
            setData(response.data || []);
        } catch (error) {
            console.error("Error fetching VAT output report:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totals = data.reduce((acc, item) => {
        acc.grossSales += item.grossSales || 0;
        acc.vatAmount += item.vatAmount || 0;
        return acc;
    }, { grossSales: 0, vatAmount: 0 });

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Receipt className="w-7 h-7 text-amber-600" />
                        POS VAT Output Report
                    </h1>
                    <p className="text-sm text-slate-500">Daily gross sales revenue and UAE FTA Output VAT (5%) audit ledger</p>
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

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    Date Range:
                </div>
                <input
                    type="date"
                    name="fromDate"
                    value={dateRange.fromDate}
                    onChange={handleDateChange}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <span className="text-slate-400">to</span>
                <input
                    type="date"
                    name="toDate"
                    value={dateRange.toDate}
                    onChange={handleDateChange}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <button
                    onClick={fetchData}
                    className="px-4 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium transition"
                >
                    Apply Filter
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-slate-500 gap-3">
                        <Loader className="w-6 h-6 animate-spin text-amber-600" />
                        <span>Loading VAT output data...</span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="py-16 text-center text-slate-500">
                        No VAT output records found for the selected date range.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100/75 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4 text-right">Gross Sales Revenue (AED)</th>
                                    <th className="py-3 px-4 text-right">VAT Output (5%) (AED)</th>
                                    <th className="py-3 px-4 text-right">Cumulative VAT Output (AED)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {data.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-50/80 transition">
                                        <td className="py-3 px-4 font-mono text-xs font-medium text-slate-800">{item.date}</td>
                                        <td className="py-3 px-4 text-right font-mono text-slate-900">{formatPrice(item.grossSales)}</td>
                                        <td className="py-3 px-4 text-right font-mono font-semibold text-amber-700">{formatPrice(item.vatAmount)}</td>
                                        <td className="py-3 px-4 text-right font-mono text-slate-600">{formatPrice(item.cumulativeVat)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-sm">
                                    <td className="py-3.5 px-4 text-right">Totals:</td>
                                    <td className="py-3.5 px-4 text-right font-mono">AED {formatPrice(totals.grossSales)}</td>
                                    <td className="py-3.5 px-4 text-right font-mono text-amber-700">AED {formatPrice(totals.vatAmount)}</td>
                                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">-</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VatOutputReport;
