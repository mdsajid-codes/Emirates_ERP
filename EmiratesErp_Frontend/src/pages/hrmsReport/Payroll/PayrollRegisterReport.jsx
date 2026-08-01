import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download, Loader, AlertCircle, FileText } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const PayrollRegisterReport = () => {
    const { searchTerm: headerSearchTerm = '' } = useOutletContext() || {};
    const [exporting, setExporting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [error, setError] = useState('');

    const [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    useEffect(() => {
        fetchReportPreview();
    }, [selectedYear, selectedMonth]);

    useEffect(() => {
        if (!headerSearchTerm) {
            setFilteredData(tableData);
        } else {
            const lowerTerm = headerSearchTerm.toLowerCase().trim();
            const filtered = tableData.filter(row =>
                Object.values(row).some(val =>
                    String(val).toLowerCase().includes(lowerTerm)
                )
            );
            setFilteredData(filtered);
        }
    }, [headerSearchTerm, tableData]);

    const fetchReportPreview = async () => {
        setLoading(true);
        setError('');
        setTableData([]);
        setFilteredData([]);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/payroll/register/export`, {
                params: { year: selectedYear, month: selectedMonth },
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'arraybuffer',
            });

            const workbook = XLSX.read(response.data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            setTableData(data);
            setFilteredData(data);
        } catch (err) {
            console.error("Preview failed:", err);
            setError("Could not load report preview. Data might be missing for this period.");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/payroll/register/export`, {
                params: { year: selectedYear, month: selectedMonth },
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `PayrollRegister_${selectedMonth}_${selectedYear}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed:", err);
            alert("Failed to export report.");
        } finally {
            setExporting(false);
        }
    };

    const tableHeaders = tableData.length > 0 ? Object.keys(tableData[0]) : [];

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-xs font-bold text-foreground">Payroll Register Report</h2>
                    <p className="text-[11px] text-foreground-muted">View and export monthly payroll register</p>
                </div>

                <div className="flex items-center gap-2">
                    <div>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-2.5 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-7"
                        >
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="px-2.5 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-7"
                        >
                            {months.map(month => (
                                <option key={month.value} value={month.value}>{month.label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-2xs h-7 disabled:opacity-70"
                    >
                        {exporting ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Download size={13} />}
                        <span>Export Excel</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-md border border-rose-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                    </div>
                    <button onClick={fetchReportPreview} className="text-xs underline hover:opacity-80">Try Again</button>
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-border">
                {loading ? (
                    <div className="flex justify-center items-center p-8 bg-card">
                        <Loader className="animate-spin h-5 w-5 text-primary" />
                    </div>
                ) : (
                    <table className="min-w-full bg-card text-foreground divide-y divide-border">
                        <thead className="bg-background-muted/60">
                            <tr>
                                {tableHeaders.map((header) => (
                                    <th key={header} className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filteredData.length > 0 ? (
                                filteredData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-background-muted/40 transition-colors">
                                        {tableHeaders.map((header, i) => (
                                            <td key={i} className="px-3 py-2 text-xs font-medium text-foreground whitespace-nowrap">
                                                {row[header]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={tableHeaders.length || 1} className="text-center py-8 text-foreground-muted text-xs">
                                        <FileText className="mx-auto h-7 w-7 text-foreground-muted/40 mb-1" />
                                        <h3 className="text-xs font-bold text-foreground">No records found</h3>
                                        <p className="text-[11px] text-foreground-muted">
                                            {tableData.length === 0 ? "No payroll records found for this period." : "No records match your search."}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="text-[11px] text-foreground-muted text-right pr-1">
                Showing {filteredData.length} records
            </div>
        </div>
    );
};

export default PayrollRegisterReport;
