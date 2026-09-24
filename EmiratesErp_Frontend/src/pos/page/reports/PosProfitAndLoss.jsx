import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Printer, Calendar, Loader, RefreshCw, Download, FileSpreadsheet, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const formatPrice = (value) => {
    if (value === undefined || value === null) return '0.00';
    return new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const PosProfitAndLoss = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        fromDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
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
            const response = await axios.get(`${API_URL}/pos/reports/income-statement`, {
                headers: { "Authorization": `Bearer ${token}` },
                params: {
                    fromDate: dateRange.fromDate,
                    toDate: dateRange.toDate
                }
            });
            setData(response.data || null);
        } catch (error) {
            console.error("Error fetching POS Profit & Loss:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (format) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/accounts/reports/income-statement/export/${format}`, {
                headers: { "Authorization": `Bearer ${token}` },
                params: { fromDate: dateRange.fromDate, toDate: dateRange.toDate },
                responseType: 'blob'
            });
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `profit_and_loss_${dateRange.fromDate}_to_${dateRange.toDate}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(`Failed to download ${format} report:`, err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Map backend sections[] to named sections
    const getSection = (name) => (data?.sections || []).find(s => s.sectionName === name) || { accounts: [], totalAmount: 0 };

    const revenueSection   = getSection('REVENUE');
    const cogsSection      = getSection('COGS');
    const expensesSection  = getSection('EXPENSES');

    const totalRevenue   = revenueSection.totalAmount || 0;
    const totalCogs      = cogsSection.totalAmount || 0;
    const totalExpenses  = expensesSection.totalAmount || 0;
    const grossProfit    = data?.grossProfit ?? (totalRevenue - totalCogs);
    const netProfit      = data?.netProfit ?? (grossProfit - totalExpenses);

    const SectionTable = ({ section, colorClass }) => (
        <table className="w-full text-sm">
            <tbody>
                {(section.accounts || []).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                        <td className="py-2 px-3 font-mono text-slate-400 w-32 text-xs">{row.accountCode}</td>
                        <td className="py-2 px-3 text-slate-700">{row.description}</td>
                        <td className={`py-2 px-3 text-right font-mono font-semibold ${colorClass || 'text-slate-900'}`}>
                            AED {formatPrice(row.balance)}
                        </td>
                    </tr>
                ))}
                {(!section.accounts || section.accounts.length === 0) && (
                    <tr>
                        <td colSpan={3} className="py-3 px-3 text-slate-400 text-sm italic text-center">
                            No transactions in this period
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-7 h-7 text-emerald-600" />
                        Profit &amp; Loss Statement
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Revenue, cost of sales, operating expenses, and net profit for POS</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 shadow-sm text-sm font-medium transition"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => handleDownload('excel')}
                        className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium transition"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Excel
                    </button>
                    <button
                        onClick={() => handleDownload('pdf')}
                        className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg text-sm font-medium transition"
                    >
                        <FileText className="w-4 h-4" />
                        PDF
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                    <p className="text-xl font-bold text-slate-900 font-mono mt-1">AED {formatPrice(totalRevenue)}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost of Sales (COGS)</span>
                    <p className="text-xl font-bold text-amber-700 font-mono mt-1">AED {formatPrice(totalCogs)}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Profit</span>
                    <p className={`text-xl font-bold font-mono mt-1 ${grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        AED {formatPrice(grossProfit)}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Profit</span>
                    <div className="flex items-center gap-1 mt-1">
                        {netProfit >= 0
                            ? <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                            : <ArrowDownRight className="w-5 h-5 text-rose-600" />}
                        <p className={`text-xl font-bold font-mono ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            AED {formatPrice(netProfit)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Period:
                </div>
                <input
                    type="date"
                    name="fromDate"
                    value={dateRange.fromDate}
                    onChange={handleDateChange}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="text-slate-400">to</span>
                <input
                    type="date"
                    name="toDate"
                    value={dateRange.toDate}
                    onChange={handleDateChange}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                    onClick={fetchData}
                    className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition"
                >
                    Apply Filter
                </button>
            </div>

            {/* Income Statement Detail */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-slate-500 gap-3">
                        <Loader className="w-6 h-6 animate-spin text-emerald-600" />
                        <span>Generating Profit &amp; Loss Statement...</span>
                    </div>
                ) : !data ? (
                    <div className="py-16 text-center text-slate-500">
                        No data available for the selected period.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* 1. Revenue */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3 flex justify-between">
                                <span>Sales Revenue</span>
                                <span className="font-mono text-emerald-700">AED {formatPrice(totalRevenue)}</span>
                            </h3>
                            <SectionTable section={revenueSection} colorClass="text-emerald-700" />
                        </div>

                        {/* 2. COGS */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3 flex justify-between">
                                <span>Cost of Sales (COGS)</span>
                                <span className="font-mono text-amber-700">AED {formatPrice(totalCogs)}</span>
                            </h3>
                            <SectionTable section={cogsSection} colorClass="text-amber-700" />
                        </div>

                        {/* Gross Profit Summary */}
                        <div className="bg-emerald-50/70 p-4 rounded-lg flex items-center justify-between border border-emerald-200/60">
                            <span className="font-bold text-slate-900 uppercase text-sm">Gross Profit</span>
                            <span className={`font-bold font-mono text-lg ${grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                AED {formatPrice(grossProfit)}
                            </span>
                        </div>

                        {/* 3. Operating Expenses */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3 flex justify-between">
                                <span>Operating &amp; Administrative Expenses</span>
                                <span className="font-mono text-rose-700">AED {formatPrice(totalExpenses)}</span>
                            </h3>
                            <SectionTable section={expensesSection} colorClass="text-rose-700" />
                        </div>

                        {/* Net Profit Banner */}
                        <div className="bg-slate-900 text-white p-5 rounded-xl flex items-center justify-between shadow-md">
                            <div>
                                <span className="font-bold uppercase tracking-wider text-sm text-slate-300">Net Profit / (Loss)</span>
                                <p className="text-xs text-slate-400 mt-0.5">Bottom-line earnings after all costs and expenses</p>
                            </div>
                            <span className={`font-bold font-mono text-2xl ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                AED {formatPrice(netProfit)}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PosProfitAndLoss;
