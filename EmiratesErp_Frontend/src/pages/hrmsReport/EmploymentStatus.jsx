import React, { useState, useEffect } from 'react';
import { Download, Loader, Briefcase, CheckCircle } from 'lucide-react';
import axios from 'axios';

const EmploymentStatus = () => {
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        byStatus: {},
        byProbation: {
            'Confirmed': 0,
            'Probation': 0
        },
        byContractType: {}
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };

                const employeesRes = await axios.get(`${API_URL}/employees/all`, { headers });
                const employees = employeesRes.data || [];

                const employeesWithDetails = await Promise.all(
                    employees.map(async (emp) => {
                        try {
                            const jobDetailsRes = await axios.get(`${API_URL}/job-details/${emp.employeeCode}`, { headers });
                            return { ...emp, jobDetails: jobDetailsRes.data };
                        } catch (err) {
                            return { ...emp, jobDetails: null };
                        }
                    })
                );

                processStats(employeesWithDetails);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [API_URL]);

    const processStats = (data) => {
        const newStats = {
            total: data.length,
            byStatus: {},
            byProbation: {
                'Confirmed': 0,
                'Probation': 0
            },
            byContractType: {}
        };

        const today = new Date();

        data.forEach(emp => {
            const status = emp.status || 'Unknown';
            newStats.byStatus[status] = (newStats.byStatus[status] || 0) + 1;

            const contractType = emp.jobDetails?.contractType || 'Permanent';
            newStats.byContractType[contractType] = (newStats.byContractType[contractType] || 0) + 1;

            if (emp.jobDetails?.probationEndDate) {
                const probationEnd = new Date(emp.jobDetails.probationEndDate);
                if (probationEnd > today) {
                    newStats.byProbation['Probation']++;
                } else {
                    newStats.byProbation['Confirmed']++;
                }
            } else {
                newStats.byProbation['Confirmed']++;
            }
        });

        setStats(newStats);
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/employment-status`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Employment_Status_Report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error("Export failed:", err);
            alert("Failed to export report.");
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg border border-border">
                <Loader className="animate-spin h-6 w-6 text-primary mb-2" />
                <p className="text-xs text-foreground-muted">Loading employment status data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xs font-bold text-foreground">Employment Status</h2>
                    <p className="text-[11px] text-foreground-muted">Contract Types and Status Distribution</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="px-2.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs h-7 disabled:opacity-70"
                >
                    {exporting ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Download size={13} />}
                    <span>Export Excel</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Status Table */}
                <div className="rounded-lg border border-border overflow-hidden bg-card text-foreground">
                    <div className="p-2.5 border-b border-border bg-background-muted/60 flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-600" />
                        <h3 className="text-xs font-bold text-foreground">Current Status</h3>
                    </div>
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-background-muted/40">
                            <tr>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Count</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {Object.entries(stats.byStatus).map(([key, val]) => (
                                <tr key={key} className="hover:bg-background-muted/40 transition-colors">
                                    <td className="px-3 py-2 text-xs font-semibold">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                            key === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                        }`}>
                                            {key}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-xs text-right font-medium text-foreground">{val}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Contract Type Table */}
                <div className="rounded-lg border border-border overflow-hidden bg-card text-foreground">
                    <div className="p-2.5 border-b border-border bg-background-muted/60 flex items-center gap-2">
                        <Briefcase size={14} className="text-primary" />
                        <h3 className="text-xs font-bold text-foreground">Contract Types</h3>
                    </div>
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-background-muted/40">
                            <tr>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Type</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Count</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {Object.entries(stats.byContractType).map(([key, val]) => (
                                <tr key={key} className="hover:bg-background-muted/40 transition-colors">
                                    <td className="px-3 py-2 text-xs font-semibold text-foreground capitalize">{key.toLowerCase().replace('_', ' ')}</td>
                                    <td className="px-3 py-2 text-xs text-right font-medium text-foreground">{val}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Probation Table */}
                <div className="rounded-lg border border-border overflow-hidden bg-card text-foreground">
                    <div className="p-2.5 border-b border-border bg-background-muted/60 flex items-center gap-2">
                        <CheckCircle size={14} className="text-amber-600" />
                        <h3 className="text-xs font-bold text-foreground">Confirmation Status</h3>
                    </div>
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-background-muted/40">
                            <tr>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Count</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {Object.entries(stats.byProbation).map(([key, val]) => (
                                <tr key={key} className="hover:bg-background-muted/40 transition-colors">
                                    <td className="px-3 py-2 text-xs font-semibold text-foreground">{key}</td>
                                    <td className="px-3 py-2 text-xs text-right font-medium text-foreground">{val}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmploymentStatus;
