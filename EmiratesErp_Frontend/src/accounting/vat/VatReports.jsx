import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Download, RefreshCw, Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import { vatApi } from '../api/vatApi';
import { toast } from 'react-toastify';

const VatReports = () => {
    const [loading, setLoading] = useState(false);
    const [dateFrom, setDateFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [dateTo, setDateTo] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
    const [outputReport, setOutputReport] = useState([]);
    const [inputReport, setInputReport] = useState([]);
    const [activeTab, setActiveTab] = useState('output');
    const [reportsGenerated, setReportsGenerated] = useState(false);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const [outputRes, inputRes] = await Promise.all([
                vatApi.getOutputReport(dateFrom, dateTo),
                vatApi.getInputReport(dateFrom, dateTo)
            ]);
            setOutputReport(outputRes.data || []);
            setInputReport(inputRes.data || []);
            setReportsGenerated(true);
            toast.success('Reports generated successfully');
        } catch (error) {
            toast.error('Failed to generate reports');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = (data, type) => {
        if (!data || data.length === 0) return;
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Date,Journal Entry No,Document Type,GL Account,Description,Base Amount,VAT Amount\n"
            + data.map(row => `${row.entryDate},${row.journalEntryNumber},${row.documentType},"${row.glAccountName}","${row.description}",${row.amount},${row.vatAmount}`).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${type}_VAT_Report_${dateFrom}_to_${dateTo}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderTable = (data, type) => (
        <div className="flex-1 overflow-y-auto bg-card border border-border rounded-theme shadow-sm mt-4">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background-muted/50">
                <h3 className="font-semibold text-foreground">{type} VAT Details</h3>
                <button
                    onClick={() => handleExportCSV(data, type)}
                    disabled={data.length === 0}
                    className="flex items-center gap-2 border border-border bg-background hover:bg-background-muted text-foreground px-3 py-1.5 rounded-theme text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className="h-3 w-3" />
                    Export
                </button>
            </div>
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="bg-background-muted text-foreground-muted border-b border-border text-xs uppercase font-semibold">
                            <th className="p-3">Date</th>
                            <th className="p-3">JE No</th>
                            <th className="p-3">Doc Type</th>
                            <th className="p-3">GL Account</th>
                            <th className="p-3">Description</th>
                            <th className="p-3 text-right">Base Amount</th>
                            <th className="p-3 text-right">VAT Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-6 text-center text-foreground-muted">No records found.</td>
                            </tr>
                        ) : (
                            data.map((row) => (
                                <tr key={row.journalEntryId || Math.random()} className="hover:bg-background-muted/40 transition-colors">
                                    <td className="p-3 flex items-center gap-1.5 text-foreground-muted">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {row.entryDate}
                                    </td>
                                    <td className="p-3">
                                        <Link to={`/account-dashboard/journal-entries/${row.journalEntryId}`} className="text-primary hover:underline font-mono">
                                            {row.journalEntryNumber}
                                        </Link>
                                    </td>
                                    <td className="p-3 text-xs font-semibold uppercase">{row.documentType?.replace('_', ' ')}</td>
                                    <td className="p-3 font-medium">{row.glAccountName}</td>
                                    <td className="p-3 max-w-[200px] truncate" title={row.description}>{row.description}</td>
                                    <td className="p-3 text-right font-mono">{row.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="p-3 text-right font-mono font-medium text-primary">{row.vatAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col overflow-hidden p-6 bg-background text-foreground"
        >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
                        <Link to="/account-dashboard" className="hover:text-primary">Accounting</Link>
                        <span>&gt;</span>
                        <span className="text-foreground-muted font-medium">VAT Reports</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">VAT Detail Reports</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchReports}
                        disabled={loading}
                        className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-theme text-sm font-semibold shadow transition-all"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Generate Reports
                    </button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-theme p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-end shadow-sm max-w-2xl">
                <div>
                    <label className="block text-xs font-semibold text-foreground-muted mb-1.5 uppercase">Date From</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        className="w-full px-3 py-1.5 bg-background border border-border rounded-theme text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-foreground-muted mb-1.5 uppercase">Date To</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        className="w-full px-3 py-1.5 bg-background border border-border rounded-theme text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {reportsGenerated && (
                <>
                    <div className="flex border-b border-border mb-2">
                        {['output', 'input'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2.5 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
                                    activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-foreground-muted hover:text-foreground'
                                }`}
                            >
                                {tab === 'output' ? 'Output VAT Details' : 'Input VAT Details'}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'output' ? renderTable(outputReport, 'Output') : renderTable(inputReport, 'Input')}
                </>
            )}

            {!reportsGenerated && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center bg-card border border-border rounded-theme shadow-sm text-foreground-muted">
                    <RefreshCw className="h-12 w-12 mb-4 opacity-20" />
                    <p>Select a date range and click Generate Reports.</p>
                </div>
            )}
        </motion.div>
    );
};

export default VatReports;
