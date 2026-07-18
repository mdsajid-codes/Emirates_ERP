import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Download, RefreshCw, Calculator } from 'lucide-react';
import dayjs from 'dayjs';
import { vatApi } from '../api/vatApi';
import { toast } from 'react-toastify';

const VatReturnPage = () => {
    const [loading, setLoading] = useState(false);
    const [dateFrom, setDateFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [dateTo, setDateTo] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
    const [vatReturn, setVatReturn] = useState(null);

    const generateReturn = async () => {
        setLoading(true);
        try {
            const res = await vatApi.getReturn(dateFrom, dateTo);
            setVatReturn(res.data);
            toast.success('VAT Return generated successfully');
        } catch (error) {
            toast.error('Failed to generate VAT Return');
        } finally {
            setLoading(false);
        }
    };

    const getTableData = () => {
        if (!vatReturn || !vatReturn.boxes) return [];
        return Object.keys(vatReturn.boxes).map(key => ({
            key,
            boxNo: key,
            description: vatReturn.boxes[key].description,
            amount: vatReturn.boxes[key].amount,
            vatAmount: vatReturn.boxes[key].vatAmount
        })).sort((a, b) => a.boxNo.localeCompare(b.boxNo));
    };

    const handleExportCSV = () => {
        if (!vatReturn) return;
        const data = getTableData();
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Box No.,Description,Amount (AED),VAT Amount (AED)\n"
            + data.map(row => `${row.boxNo},"${row.description}",${row.amount},${row.vatAmount}`).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `VAT_Return_${vatReturn.fromDate}_to_${vatReturn.toDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const tableData = getTableData();

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
                        <span className="text-foreground-muted font-medium">VAT Return File</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">VAT Return (FTA Format)</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        disabled={!vatReturn}
                        className="flex items-center gap-2 border border-border bg-background hover:bg-background-muted text-foreground px-4 py-2 rounded-theme text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="h-4 w-4" />
                        Export to CSV
                    </button>
                    <button
                        onClick={generateReturn}
                        disabled={loading}
                        className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-theme text-sm font-semibold shadow transition-all"
                    >
                        <Calculator className="h-4 w-4" />
                        Generate Return
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

            <div className="flex-1 overflow-y-auto bg-card border border-border rounded-theme shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : vatReturn ? (
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="bg-background-muted text-foreground-muted border-b border-border text-xs uppercase font-semibold">
                                <th className="p-3 w-24">Box No.</th>
                                <th className="p-3">Description</th>
                                <th className="p-3 text-right">Amount (AED)</th>
                                <th className="p-3 text-right">VAT Amount (AED)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {tableData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-6 text-center text-foreground-muted">No return data found for this period.</td>
                                </tr>
                            ) : (
                                tableData.map((row, index) => (
                                    <tr key={row.key} className="hover:bg-background-muted/40 transition-colors">
                                        <td className="p-3 font-mono font-bold text-primary">{row.boxNo}</td>
                                        <td className="p-3 font-semibold">{row.description}</td>
                                        <td className="p-3 text-right font-mono font-medium">{row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-3 text-right font-mono font-medium">{row.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-foreground-muted">
                        <RefreshCw className="h-12 w-12 mb-4 opacity-20" />
                        <p>Select a date range and click Generate Return to calculate VAT boxes.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default VatReturnPage;
