import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download, Loader, Calendar, FileText, AlertCircle } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const MonthlyAttendanceReport = () => {
    const { searchTerm: headerSearchTerm = '' } = useOutletContext() || {};
    const [exporting, setExporting] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (selectedMonth) {
            fetchAndParseReport();
        }
    }, [selectedMonth]);

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

    const fetchAndParseReport = async () => {
        setLoading(true);
        setError('');
        setTableData([]);
        setFilteredData([]);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/attendance/monthly`, {
                params: { month: selectedMonth },
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'arraybuffer',
            });

            const workbook = XLSX.read(response.data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);

            setTableData(data);
            setFilteredData(data);
        } catch (err) {
            console.error("Failed to load report data:", err);
            setError('Could not load attendance summary. You can still try to download the file.');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!selectedMonth) {
            alert("Please select a month.");
            return;
        }

        setExporting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/attendance/monthly`, {
                params: { month: selectedMonth },
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Monthly_Attendance_Summary_${selectedMonth}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed:", err);
            alert("Failed to export report. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-xs font-bold text-foreground">Monthly Attendance Summary</h2>
                    <p className="text-[11px] text-foreground-muted">View and export aggregated monthly attendance data</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted pointer-events-none" />
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="pl-8 pr-2.5 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-7"
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting || !selectedMonth}
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
                    <button onClick={fetchAndParseReport} className="text-xs underline hover:opacity-80">Try Again</button>
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
                                {tableData.length > 0 && Object.keys(tableData[0]).map((key) => (
                                    <th key={key} className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filteredData.length > 0 ? (
                                filteredData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-background-muted/40 transition-colors">
                                        {Object.values(row).map((val, i) => (
                                            <td key={i} className="px-3 py-2 text-xs font-medium text-foreground whitespace-nowrap">
                                                {val}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={tableData.length > 0 ? Object.keys(tableData[0]).length : 1} className="text-center py-8 text-foreground-muted text-xs">
                                        <FileText className="mx-auto h-7 w-7 text-foreground-muted/40 mb-1" />
                                        <h3 className="text-xs font-bold text-foreground">No records found</h3>
                                        <p className="text-[11px] text-foreground-muted">
                                            {tableData.length === 0 ? `No records found for ${selectedMonth}.` : "No records match your search."}
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

export default MonthlyAttendanceReport;
