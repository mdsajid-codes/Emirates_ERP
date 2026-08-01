import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download, Loader, AlertCircle, CheckCircle, XCircle, Clock, PieChart, FileText } from 'lucide-react';
import axios from 'axios';

const WpsComplianceReport = () => {
    const { searchTerm: headerSearchTerm = '' } = useOutletContext() || {};
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');

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
        handleGenerateReport();
    }, [selectedYear, selectedMonth]);

    const handleGenerateReport = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/payroll/wps/compliance`, {
                params: { year: selectedYear, month: selectedMonth },
                headers: { "Authorization": `Bearer ${token}` }
            });
            setReportData(response.data);
        } catch (err) {
            console.error("Error generating compliance report:", err);
            setError('Failed to generate compliance report.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportReport = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/payroll/wps/compliance/export`, {
                params: { year: selectedYear, month: selectedMonth },
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `WPS-Compliance-${selectedMonth}-${selectedYear}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error exporting compliance report:", err);
            alert('Failed to export compliance report.');
        }
    };

    const filteredDetails = useMemo(() => {
        if (!reportData || !reportData.details) return [];
        if (!headerSearchTerm) return reportData.details;
        const term = headerSearchTerm.toLowerCase().trim();
        return reportData.details.filter(row =>
            (row.employeeName && row.employeeName.toLowerCase().includes(term)) ||
            (row.employeeCode && row.employeeCode.toLowerCase().includes(term)) ||
            (row.status && row.status.toLowerCase().includes(term)) ||
            (row.remarks && row.remarks.toLowerCase().includes(term))
        );
    }, [reportData, headerSearchTerm]);

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-xs font-bold text-foreground">WPS Compliance Report</h2>
                    <p className="text-[11px] text-foreground-muted">Monitor salary payments and delay tracking for WPS compliance</p>
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
                        onClick={handleExportReport}
                        disabled={loading || !reportData}
                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-2xs h-7 disabled:opacity-70"
                    >
                        <Download size={13} />
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
                    <button onClick={handleGenerateReport} className="text-xs underline hover:opacity-80">Try Again</button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center p-8 bg-card border border-border rounded-lg">
                    <Loader className="animate-spin h-5 w-5 text-primary" />
                </div>
            ) : reportData && (
                <div className="space-y-3">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3 bg-card border border-border rounded-lg text-foreground flex items-center gap-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-md">
                                <PieChart size={18} />
                            </div>
                            <div>
                                <p className="text-[11px] text-foreground-muted font-medium">Compliance Rate</p>
                                <h3 className="text-base font-bold text-foreground leading-tight">{reportData.compliantPercentage}%</h3>
                            </div>
                        </div>

                        <div className="p-3 bg-card border border-border rounded-lg text-foreground flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-md">
                                <CheckCircle size={18} />
                            </div>
                            <div>
                                <p className="text-[11px] text-foreground-muted font-medium">Paid Employees</p>
                                <h3 className="text-base font-bold text-foreground leading-tight">{reportData.paidEmployees}</h3>
                            </div>
                        </div>

                        <div className="p-3 bg-card border border-border rounded-lg text-foreground flex items-center gap-3">
                            <div className="p-2 bg-rose-500/10 text-rose-600 rounded-md">
                                <XCircle size={18} />
                            </div>
                            <div>
                                <p className="text-[11px] text-foreground-muted font-medium">Unpaid Employees</p>
                                <h3 className="text-base font-bold text-foreground leading-tight">{reportData.unpaidEmployees}</h3>
                            </div>
                        </div>

                        <div className="p-3 bg-card border border-border rounded-lg text-foreground flex items-center gap-3">
                            <div className="p-2 bg-background-muted text-foreground-muted rounded-md border border-border">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="text-[11px] text-foreground-muted font-medium">Total Employees</p>
                                <h3 className="text-base font-bold text-foreground leading-tight">{reportData.totalEmployees}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Details Table */}
                    <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="min-w-full bg-card text-foreground divide-y divide-border">
                            <thead className="bg-background-muted/60">
                                <tr>
                                    <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Employee</th>
                                    <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                                    <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Pay Date</th>
                                    <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Delay (Days)</th>
                                    <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {filteredDetails.length > 0 ? (
                                    filteredDetails.map((row, index) => (
                                        <tr key={index} className="hover:bg-background-muted/40 transition-colors">
                                            <td className="px-3 py-2 text-xs font-semibold text-foreground whitespace-nowrap">
                                                <div>{row.employeeName}</div>
                                                <div className="text-[10px] text-foreground-muted">{row.employeeCode}</div>
                                            </td>
                                            <td className="px-3 py-2 text-xs whitespace-nowrap">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                    row.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                                }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-xs text-foreground-muted whitespace-nowrap">{row.payDate || '-'}</td>
                                            <td className={`px-3 py-2 text-xs font-semibold whitespace-nowrap ${row.delayDays > 0 ? 'text-rose-500' : 'text-foreground-muted'}`}>
                                                {row.delayDays}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-foreground-muted">{row.remarks || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-foreground-muted text-xs">
                                            <FileText className="mx-auto h-7 w-7 text-foreground-muted/40 mb-1" />
                                            <h3 className="text-xs font-bold text-foreground">No records found</h3>
                                            <p className="text-[11px] text-foreground-muted">No employee compliance records match your search.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="text-[11px] text-foreground-muted text-right pr-1">
                        Showing {filteredDetails.length} records
                    </div>
                </div>
            )}
        </div>
    );
};

export default WpsComplianceReport;
