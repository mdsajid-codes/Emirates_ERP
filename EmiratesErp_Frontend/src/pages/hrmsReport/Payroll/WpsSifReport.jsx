import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download, Loader, AlertCircle, FileText } from 'lucide-react';
import axios from 'axios';

const WpsSifReport = () => {
    const { searchTerm: headerSearchTerm = '' } = useOutletContext() || {};
    const [downloading, setDownloading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [error, setError] = useState('');
    const [payrollRun, setPayrollRun] = useState(null);
    const [checkingRun, setCheckingRun] = useState(false);

    const [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [tableHeaders, setTableHeaders] = useState([]);

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
        const findAndFetch = async () => {
            setCheckingRun(true);
            setPayrollRun(null);
            setError('');
            setTableData([]);
            setFilteredData([]);
            setTableHeaders([]);

            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/payroll-runs`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const runs = response.data || [];
                const match = runs.find(r => r.year === selectedYear && r.month === selectedMonth);

                if (match) {
                    if (match.status === 'COMPLETED' || match.status === 'PAID' || match.status === 'GENERATED') {
                        setPayrollRun(match);
                        fetchPreview(match.id);
                    } else {
                        setError(`Payroll run exists but is in '${match.status}' status. SIF file is only available for completed runs.`);
                    }
                }
            } catch (err) {
                console.error("Failed to check payroll runs:", err);
            } finally {
                setCheckingRun(false);
            }
        };

        findAndFetch();
    }, [selectedYear, selectedMonth, API_URL]);

    useEffect(() => {
        if (!headerSearchTerm) {
            setFilteredData(tableData);
        } else {
            const lowerTerm = headerSearchTerm.toLowerCase().trim();
            const filtered = tableData.filter(row =>
                row.some(cell => String(cell).toLowerCase().includes(lowerTerm))
            );
            setFilteredData(filtered);
        }
    }, [headerSearchTerm, tableData]);

    const fetchPreview = async (runId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/payroll/wps/${runId}/sif`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'text',
            });

            const content = response.data;
            if (!content) return;

            const lines = content.split('\n').filter(line => line.trim() !== '');
            if (lines.length > 0) {
                const firstLine = lines[0];
                const delimiter = firstLine.includes(',') ? ',' : '|';
                const parsedData = lines.map(line => line.split(delimiter).map(cell => cell.trim()));
                const hasHeaders = parsedData[0].some(cell => isNaN(cell) && cell.length > 0);

                if (hasHeaders) {
                    setTableHeaders(parsedData[0]);
                    setTableData(parsedData.slice(1));
                    setFilteredData(parsedData.slice(1));
                } else {
                    const maxCols = Math.max(...parsedData.map(r => r.length));
                    setTableHeaders(Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`));
                    setTableData(parsedData);
                    setFilteredData(parsedData);
                }
            }
        } catch (err) {
            console.error("Preview load failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!payrollRun) return;

        setDownloading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/payroll/wps/${payrollRun.id}/sif`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let fileName = `WPS_SIF_${selectedMonth}_${selectedYear}.txt`;
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (fileNameMatch && fileNameMatch.length === 2)
                    fileName = fileNameMatch[1];
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
            setError("Failed to download SIF file.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-xs font-bold text-foreground">WPS Salary Transfer Report (SIF)</h2>
                    <p className="text-[11px] text-foreground-muted">Generate and preview SIF file for bank salary transfers</p>
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
                        onClick={handleDownload}
                        disabled={downloading || !payrollRun}
                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-2xs h-7 disabled:opacity-70"
                    >
                        {downloading ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Download size={13} />}
                        <span>Download SIF File</span>
                    </button>
                </div>
            </div>

            {checkingRun && (
                <div className="p-3 bg-card border border-border rounded-md text-xs text-foreground-muted flex items-center gap-2">
                    <Loader className="animate-spin h-3.5 w-3.5 text-primary" />
                    <span>Checking payroll status...</span>
                </div>
            )}

            {!checkingRun && !payrollRun && !error && (
                <div className="p-3 bg-amber-500/10 text-amber-600 text-xs rounded-md border border-amber-500/20 flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>No completed payroll run found for this period.</span>
                </div>
            )}

            {error && (
                <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-md border border-rose-500/20 flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{error}</span>
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
                                {tableHeaders.map((header, i) => (
                                    <th key={i} className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filteredData.length > 0 ? (
                                filteredData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-background-muted/40 transition-colors">
                                        {row.map((cell, i) => (
                                            <td key={i} className="px-3 py-2 text-xs font-medium text-foreground whitespace-nowrap">
                                                {cell}
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
                                            {tableData.length === 0 ? "No SIF records found for this period." : "No records match your search."}
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

export default WpsSifReport;
