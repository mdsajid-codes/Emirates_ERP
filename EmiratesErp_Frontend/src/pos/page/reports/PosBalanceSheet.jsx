import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Landmark, Printer, Calendar, Loader, RefreshCw, FileSpreadsheet, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const formatPrice = (value) => {
    if (value === undefined || value === null) return '0.00';
    return new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const PosBalanceSheet = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/pos/reports/balance-sheet`, {
                headers: { "Authorization": `Bearer ${token}` },
                params: { toDate }
            });
            setData(response.data || null);
        } catch (error) {
            console.error("Error fetching POS Balance Sheet:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (format) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/accounts/reports/balance-sheet/export/${format}`, {
                headers: { "Authorization": `Bearer ${token}` },
                params: { toDate },
                responseType: 'blob'
            });
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `balance_sheet_as_of_${toDate}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
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

    // Map backend sections[] by sectionName
    const getSection = (name) => (data?.sections || []).find(s => s.sectionName === name) || { accounts: [], totalAmount: 0 };

    const assetsSection      = getSection('ASSETS');
    const liabSection        = getSection('LIABILITIES');
    const equitySection      = getSection('EQUITY');

    const totalAssets              = data?.totalAssets || assetsSection.totalAmount || 0;
    const totalLiabilitiesAndEquity = data?.totalLiabilitiesAndEquity || ((liabSection.totalAmount || 0) + (equitySection.totalAmount || 0));
    const isBalanced               = data?.isBalanced ?? (Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01);

    const SectionTable = ({ section, colorClass }) => (
        <table className="w-full text-sm">
            <tbody>
                {(section.accounts || []).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                        <td className="py-2 px-3 font-mono text-slate-400 w-28 text-xs">{row.accountCode}</td>
                        <td className="py-2 px-3 text-slate-700">{row.description}</td>
                        <td className={`py-2 px-3 text-right font-mono font-semibold ${colorClass || 'text-slate-900'}`}>
                            AED {formatPrice(row.balance)}
                        </td>
                    </tr>
                ))}
                {(!section.accounts || section.accounts.length === 0) && (
                    <tr>
                        <td colSpan={3} className="py-3 px-3 text-slate-400 text-sm italic text-center">
                            No records in this period
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
                        <Landmark className="w-7 h-7 text-indigo-600" />
                        Balance Sheet Statement
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Financial position snapshot (Assets, Liabilities &amp; Equity) as of selected date</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Assets</span>
                    <p className="text-xl font-bold text-slate-900 font-mono mt-1">AED {formatPrice(totalAssets)}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Liabilities</span>
                    <p className="text-xl font-bold text-amber-700 font-mono mt-1">AED {formatPrice(liabSection.totalAmount || 0)}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Equity</span>
                    <p className="text-xl font-bold text-indigo-700 font-mono mt-1">AED {formatPrice(equitySection.totalAmount || 0)}</p>
                </div>
            </div>

            {/* Filter & Balance Check Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        As of Date:
                    </div>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                        onClick={fetchData}
                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition"
                    >
                        Apply Filter
                    </button>
                </div>
                {data && (
                    <div>
                        {isBalanced ? (
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Balance Verified (Assets = Liabilities + Equity)
                            </span>
                        ) : (
                            <span className="text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium">
                                <AlertTriangle className="w-4 h-4 text-rose-600" />
                                Imbalance Detected
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Balance Sheet Tables */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-slate-500 gap-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <Loader className="w-6 h-6 animate-spin text-indigo-600" />
                    <span>Generating Balance Sheet...</span>
                </div>
            ) : !data ? (
                <div className="py-20 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
                    No balance sheet data available for the selected date.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT: ASSETS */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-5">
                        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex justify-between items-center">
                            <span>ASSETS</span>
                            <span className="font-mono text-indigo-700">AED {formatPrice(totalAssets)}</span>
                        </h2>

                        <SectionTable section={assetsSection} colorClass="text-indigo-700" />

                        <div className="bg-slate-900 text-white p-4 rounded-lg flex items-center justify-between font-bold text-sm">
                            <span>TOTAL ASSETS</span>
                            <span className="font-mono text-lg text-emerald-400">AED {formatPrice(totalAssets)}</span>
                        </div>
                    </div>

                    {/* RIGHT: LIABILITIES & EQUITY */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-5">
                        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex justify-between items-center">
                            <span>LIABILITIES &amp; EQUITY</span>
                            <span className="font-mono text-indigo-700">AED {formatPrice(totalLiabilitiesAndEquity)}</span>
                        </h2>

                        {/* Liabilities */}
                        {liabSection.accounts && liabSection.accounts.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 flex justify-between">
                                    <span>Liabilities</span>
                                    <span className="font-mono text-amber-700">AED {formatPrice(liabSection.totalAmount || 0)}</span>
                                </h3>
                                <SectionTable section={liabSection} colorClass="text-amber-700" />
                            </div>
                        )}

                        {/* Equity */}
                        {equitySection.accounts && equitySection.accounts.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 flex justify-between">
                                    <span>Owner's Equity &amp; Retained Earnings</span>
                                    <span className="font-mono text-indigo-700">AED {formatPrice(equitySection.totalAmount || 0)}</span>
                                </h3>
                                <SectionTable section={equitySection} colorClass="text-indigo-700" />
                            </div>
                        )}

                        {(!liabSection.accounts?.length && !equitySection.accounts?.length) && (
                            <div className="py-8 text-center text-slate-400 text-sm italic">
                                No liabilities or equity records for this period
                            </div>
                        )}

                        <div className="bg-slate-900 text-white p-4 rounded-lg flex items-center justify-between font-bold text-sm">
                            <span>TOTAL LIABILITIES &amp; EQUITY</span>
                            <span className="font-mono text-lg text-emerald-400">AED {formatPrice(totalLiabilitiesAndEquity)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PosBalanceSheet;
