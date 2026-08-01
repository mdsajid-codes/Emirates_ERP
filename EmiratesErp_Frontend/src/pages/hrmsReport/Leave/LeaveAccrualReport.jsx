import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download, Loader, Calendar, FileText, AlertCircle } from 'lucide-react';
import axios from 'axios';

const LeaveAccrualReport = () => {
    const { searchTerm: headerSearchTerm = '' } = useOutletContext() || {};
    const [exporting, setExporting] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (selectedDate) {
            fetchReport();
        }
    }, [selectedDate]);

    useEffect(() => {
        if (!headerSearchTerm) {
            setFilteredData(tableData);
        } else {
            const lowerTerm = headerSearchTerm.toLowerCase().trim();
            const filtered = tableData.filter(row =>
                (row.employeeCode && row.employeeCode.toLowerCase().includes(lowerTerm)) ||
                (row.employeeName && row.employeeName.toLowerCase().includes(lowerTerm)) ||
                (row.department && row.department.toLowerCase().includes(lowerTerm)) ||
                (row.designation && row.designation.toLowerCase().includes(lowerTerm)) ||
                (row.leaveType && row.leaveType.toLowerCase().includes(lowerTerm))
            );
            setFilteredData(filtered);
        }
    }, [headerSearchTerm, tableData]);

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        setTableData([]);
        setFilteredData([]);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/leave/accrual`, {
                params: { asOfDate: selectedDate },
                headers: { "Authorization": `Bearer ${token}` }
            });

            setTableData(response.data || []);
            setFilteredData(response.data || []);
        } catch (err) {
            console.error("Failed to load report data:", err);
            setError('Could not load leave accrual data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!selectedDate) {
            alert("Please select a date.");
            return;
        }

        setExporting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/leave/accrual/export`, {
                params: { asOfDate: selectedDate },
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `LeaveAccrualReport_${selectedDate}.xlsx`);
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
                    <h2 className="text-xs font-bold text-foreground">Leave Accrual Report</h2>
                    <p className="text-[11px] text-foreground-muted">View employee leave accruals, taken leaves, and balances</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted pointer-events-none" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="pl-8 pr-2.5 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-7"
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting || !selectedDate}
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
                    <button onClick={fetchReport} className="text-xs underline hover:opacity-80">Try Again</button>
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
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Employee Code</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Employee Name</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Department</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Designation</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Joining Date</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Leave Type</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Accrued</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Taken</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filteredData.length > 0 ? (
                                filteredData.map((row, index) => (
                                    <tr key={`${row.employeeCode}-${index}`} className="hover:bg-background-muted/40 transition-colors">
                                        <td className="px-3 py-2 text-xs font-semibold text-foreground whitespace-nowrap">{row.employeeCode}</td>
                                        <td className="px-3 py-2 text-xs font-medium text-foreground whitespace-nowrap">{row.employeeName}</td>
                                        <td className="px-3 py-2 text-xs text-foreground-muted whitespace-nowrap">{row.department}</td>
                                        <td className="px-3 py-2 text-xs text-foreground-muted whitespace-nowrap">{row.designation}</td>
                                        <td className="px-3 py-2 text-xs text-foreground-muted whitespace-nowrap">{row.joiningDate}</td>
                                        <td className="px-3 py-2 text-xs text-foreground font-medium whitespace-nowrap">{row.leaveType}</td>
                                        <td className="px-3 py-2 text-xs text-right font-medium text-foreground whitespace-nowrap">{row.accruedDays}</td>
                                        <td className="px-3 py-2 text-xs text-right font-medium text-rose-500 whitespace-nowrap">{row.takenDays}</td>
                                        <td className="px-3 py-2 text-xs text-right font-bold text-emerald-600 whitespace-nowrap">{row.balanceDays}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center py-8 text-foreground-muted text-xs">
                                        <FileText className="mx-auto h-7 w-7 text-foreground-muted/40 mb-1" />
                                        <h3 className="text-xs font-bold text-foreground">No records found</h3>
                                        <p className="text-[11px] text-foreground-muted">
                                            {tableData.length === 0 ? `No records found for ${selectedDate}.` : "No records match your search."}
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

export default LeaveAccrualReport;
