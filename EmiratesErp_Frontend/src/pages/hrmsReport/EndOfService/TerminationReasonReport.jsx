import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Loader, UserMinus, ChevronDown, ChevronUp, AlertCircle, Download, FileText } from 'lucide-react';

const TerminationReasonReport = () => {
    const { searchTerm: headerSearchTerm = '' } = useOutletContext() || {};
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [error, setError] = useState('');
    const [expandedRows, setExpandedRows] = useState({});

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/eos/termination-reason`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setReportData(response.data || []);
        } catch (err) {
            console.error("Error fetching Termination Reason report:", err);
            setError('Failed to load termination reason report.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadExcel = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/eos/termination-reason/export`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Termination-Reason-Report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error exporting Termination Reason report:", err);
            alert("Failed to export Termination Reason report.");
        }
    };

    const toggleRow = (reason) => {
        setExpandedRows(prev => ({
            ...prev,
            [reason]: !prev[reason]
        }));
    };

    const filteredReportData = useMemo(() => {
        if (!headerSearchTerm) return reportData;
        const term = headerSearchTerm.toLowerCase().trim();
        return reportData.map(group => {
            const reasonMatches = group.reason && group.reason.toLowerCase().includes(term);
            const matchingEmps = (group.employees || []).filter(emp =>
                (emp.employeeName && emp.employeeName.toLowerCase().includes(term)) ||
                (emp.employeeCode && emp.employeeCode.toLowerCase().includes(term))
            );
            if (reasonMatches || matchingEmps.length > 0) {
                return {
                    ...group,
                    employees: reasonMatches ? group.employees : matchingEmps,
                    employeeCount: reasonMatches ? group.employeeCount : matchingEmps.length
                };
            }
            return null;
        }).filter(Boolean);
    }, [reportData, headerSearchTerm]);

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-xs font-bold text-foreground">Exits by Reason</h2>
                    <p className="text-[11px] text-foreground-muted">Breakdown of employee exits grouped by termination reason</p>
                </div>

                <button
                    onClick={handleDownloadExcel}
                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-2xs h-7"
                >
                    <Download size={13} />
                    <span>Export Excel</span>
                </button>
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

            <div className="rounded-lg border border-border overflow-hidden bg-card text-foreground">
                {loading ? (
                    <div className="flex justify-center items-center p-8 bg-card">
                        <Loader className="animate-spin h-5 w-5 text-primary" />
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {filteredReportData.length > 0 ? (
                            filteredReportData.map((group) => (
                                <div key={group.reason} className="bg-card">
                                    <div
                                        className="px-3 py-2.5 flex justify-between items-center cursor-pointer hover:bg-background-muted/50 transition-colors"
                                        onClick={() => toggleRow(group.reason)}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 bg-rose-500/10 text-rose-500 rounded-md">
                                                <UserMinus size={15} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-foreground capitalize leading-tight">
                                                    {group.reason ? group.reason.replace(/_/g, ' ') : 'Unknown'}
                                                </h4>
                                                <span className="text-[10px] text-foreground-muted">
                                                    {group.employeeCount} Employee{group.employeeCount !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>

                                        {expandedRows[group.reason] ?
                                            <ChevronUp size={16} className="text-foreground-muted" /> :
                                            <ChevronDown size={16} className="text-foreground-muted" />
                                        }
                                    </div>

                                    {expandedRows[group.reason] && (
                                        <div className="bg-background-muted/40 px-3 py-2 border-t border-border">
                                            <table className="min-w-full text-xs">
                                                <thead>
                                                    <tr className="border-b border-border text-[11px] font-bold text-foreground-muted uppercase">
                                                        <th className="text-left py-1.5">Code</th>
                                                        <th className="text-left py-1.5">Name</th>
                                                        <th className="text-right py-1.5">Last Working Day</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/30">
                                                    {group.employees.map((emp, idx) => (
                                                        <tr key={idx}>
                                                            <td className="py-1.5 font-semibold text-foreground">{emp.employeeCode}</td>
                                                            <td className="py-1.5 text-foreground">{emp.employeeName}</td>
                                                            <td className="py-1.5 text-right text-foreground-muted">{emp.lastWorkingDay}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-foreground-muted text-xs">
                                <FileText className="mx-auto h-7 w-7 text-foreground-muted/40 mb-1" />
                                <h3 className="text-xs font-bold text-foreground">No termination data found</h3>
                                <p className="text-[11px] text-foreground-muted">No records match your search criteria.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TerminationReasonReport;
