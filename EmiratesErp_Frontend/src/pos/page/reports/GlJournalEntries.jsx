import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Printer, Filter, Calendar, Search, Loader, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const formatPrice = (value) => {
    if (value === undefined || value === null) return '0.00';
    return new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const GlJournalEntries = () => {
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
            const response = await axios.get(`${API_URL}/pos/reports/gl-journal-entries`, {
                headers: { "Authorization": `Bearer ${token}` },
                params: {
                    fromDate: dateRange.fromDate,
                    toDate: dateRange.toDate
                }
            });
            setData(response.data || []);
        } catch (error) {
            console.error("Error fetching GL journal entries:", error);
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
            item.accountCode?.toLowerCase().includes(search) ||
            item.accountName?.toLowerCase().includes(search) ||
            item.docType?.toLowerCase().includes(search)
        );
    });

    const totals = filteredData.reduce((acc, item) => {
        acc.debit += item.debitAmount || 0;
        acc.credit += item.creditAmount || 0;
        return acc;
    }, { debit: 0, credit: 0 });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">POS GL Journal Entries</h1>
                    <p className="text-sm text-slate-500">Detailed General Ledger posting breakdown for POS transactions</p>
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
                        onClick={handlePrint}
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
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Date Filter:
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

                <div className="ml-auto flex items-center gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search entry, ref, account..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-slate-500 gap-3">
                        <Loader className="w-6 h-6 animate-spin text-emerald-600" />
                        <span>Loading journal entries...</span>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="py-16 text-center text-slate-500">
                        No GL journal entries found for the selected date range.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100/75 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Entry No</th>
                                    <th className="py-3 px-4">Reference</th>
                                    <th className="py-3 px-4">Doc Type</th>
                                    <th className="py-3 px-4">Account Code</th>
                                    <th className="py-3 px-4">Account Name</th>
                                    <th className="py-3 px-4 text-right">Debit (AED)</th>
                                    <th className="py-3 px-4 text-right">Credit (AED)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {filteredData.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-50/80 transition">
                                        <td className="py-3 px-4 font-mono text-xs text-slate-600">{item.entryDate}</td>
                                        <td className="py-3 px-4 font-semibold text-slate-900">{item.entryNumber}</td>
                                        <td className="py-3 px-4 text-slate-600">{item.referenceNumber || '-'}</td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                {item.docType}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-mono font-medium text-slate-800">{item.accountCode}</td>
                                        <td className="py-3 px-4 font-medium text-slate-800">{item.accountName}</td>
                                        <td className="py-3 px-4 text-right font-mono text-slate-900">
                                            {item.debitAmount > 0 ? formatPrice(item.debitAmount) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-slate-900">
                                            {item.creditAmount > 0 ? formatPrice(item.creditAmount) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-sm">
                                    <td colSpan={6} className="py-3.5 px-4 text-right">Totals:</td>
                                    <td className="py-3.5 px-4 text-right font-mono text-emerald-700">AED {formatPrice(totals.debit)}</td>
                                    <td className="py-3.5 px-4 text-right font-mono text-emerald-700">AED {formatPrice(totals.credit)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlJournalEntries;
