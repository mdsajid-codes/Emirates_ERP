import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Download, Loader, Flag, ChevronDown, ChevronUp, AlertCircle, FileText } from 'lucide-react';

const NationalityReport = () => {
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
            const response = await axios.get(`${API_URL}/reports/compliance/nationality`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setReportData(response.data || []);
        } catch (err) {
            console.error("Error fetching Nationality report:", err);
            setError('Failed to load nationality report.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadExcel = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/compliance/nationality/export`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Nationality-Report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error exporting Nationality report:", err);
            alert("Failed to export Nationality report.");
        }
    };

    const toggleRow = (nationality) => {
        setExpandedRows(prev => ({
            ...prev,
            [nationality]: !prev[nationality]
        }));
    };

    const filteredReportData = useMemo(() => {
        if (!headerSearchTerm) return reportData;
        const term = headerSearchTerm.toLowerCase().trim();
        return reportData.map(item => {
            const nationalityMatches = item.nationality && item.nationality.toLowerCase().includes(term);
            const matchingEmps = (item.employees || []).filter(emp =>
                (emp.employeeName && emp.employeeName.toLowerCase().includes(term)) ||
                (emp.employeeCode && emp.employeeCode.toLowerCase().includes(term)) ||
                (emp.designation && emp.designation.toLowerCase().includes(term))
            );
            if (nationalityMatches || matchingEmps.length > 0) {
                return {
                    ...item,
                    employees: nationalityMatches ? item.employees : matchingEmps,
                    employeeCount: nationalityMatches ? item.employeeCount : matchingEmps.length
                };
            }
            return null;
        }).filter(Boolean);
    }, [reportData, headerSearchTerm]);

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-xs font-bold text-foreground">Employee Nationality Distribution</h2>
                    <p className="text-[11px] text-foreground-muted">Demographic breakdown of workforce by nationality</p>
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
                            filteredReportData.map((item) => (
                                <div key={item.nationality} className="bg-card">
                                    <div
                                        className="px-3 py-2.5 flex justify-between items-center cursor-pointer hover:bg-background-muted/50 transition-colors"
                                        onClick={() => toggleRow(item.nationality)}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                                                <Flag size={15} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-foreground leading-tight">
                                                    {item.nationality || 'Unknown'}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-foreground-muted">
                                                        {item.employeeCount} Employee{item.employeeCount !== 1 ? 's' : ''}
                                                    </span>
                                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-background-muted text-foreground-muted border border-border">
                                                        {item.percentage}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {expandedRows[item.nationality] ?
                                            <ChevronUp size={16} className="text-foreground-muted" /> :
                                            <ChevronDown size={16} className="text-foreground-muted" />
                                        }
                                    </div>

                                    {expandedRows[item.nationality] && (
                                        <div className="bg-background-muted/40 px-3 py-2 border-t border-border">
                                            <table className="min-w-full text-xs">
                                                <thead>
                                                    <tr className="border-b border-border text-[11px] font-bold text-foreground-muted uppercase">
                                                        <th className="text-left py-1.5 w-24">Code</th>
                                                        <th className="text-left py-1.5">Name</th>
                                                        <th className="text-right py-1.5">Designation</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/30">
                                                    {item.employees && item.employees.map((emp, idx) => (
                                                        <tr key={idx}>
                                                            <td className="py-1.5 font-semibold text-foreground">{emp.employeeCode}</td>
                                                            <td className="py-1.5 text-foreground">{emp.employeeName}</td>
                                                            <td className="py-1.5 text-right text-foreground-muted">{emp.designation || '-'}</td>
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
                                <h3 className="text-xs font-bold text-foreground">No nationality data found</h3>
                                <p className="text-[11px] text-foreground-muted">No records match your search criteria.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NationalityReport;
