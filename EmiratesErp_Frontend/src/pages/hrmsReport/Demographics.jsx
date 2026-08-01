import React, { useState, useEffect } from 'react';
import { Download, Loader, User, BarChart } from 'lucide-react';
import axios from 'axios';

const Demographics = () => {
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        byGender: {},
        byMaritalStatus: {},
        byAgeGroup: {}
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };

                const employeesRes = await axios.get(`${API_URL}/employees/all`, { headers });
                const employees = employeesRes.data || [];

                let dataToProcess = employees;
                if (employees.length > 0 && !employees[0].dob) {
                    const employeesWithDetails = await Promise.all(
                        employees.map(async (emp) => {
                            try {
                                const fullEmpRes = await axios.get(`${API_URL}/employees/${emp.employeeCode}`, { headers });
                                return fullEmpRes.data;
                            } catch (err) {
                                return emp;
                            }
                        })
                    );
                    dataToProcess = employeesWithDetails;
                }

                setStats(processStats(dataToProcess));
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [API_URL]);

    const calculateAge = (dobString) => {
        if (!dobString) return -1;
        const dob = new Date(dobString);
        const diff_ms = Date.now() - dob.getTime();
        const age_dt = new Date(diff_ms);
        return Math.abs(age_dt.getUTCFullYear() - 1970);
    };

    const processStats = (data) => {
        const newStats = {
            total: data.length,
            byGender: {},
            byMaritalStatus: {},
            byAgeGroup: {
                'Under 20': 0,
                '20-29': 0,
                '30-39': 0,
                '40-49': 0,
                '50-59': 0,
                '60+': 0,
                'Unknown': 0
            }
        };

        data.forEach(emp => {
            const gender = emp.gender || 'Unspecified';
            newStats.byGender[gender] = (newStats.byGender[gender] || 0) + 1;

            const marital = emp.martialsStatus || emp.maritalStatus || 'Unspecified';
            newStats.byMaritalStatus[marital] = (newStats.byMaritalStatus[marital] || 0) + 1;

            const age = calculateAge(emp.dob);
            if (age === -1) {
                newStats.byAgeGroup['Unknown']++;
            } else if (age < 20) {
                newStats.byAgeGroup['Under 20']++;
            } else if (age < 30) {
                newStats.byAgeGroup['20-29']++;
            } else if (age < 40) {
                newStats.byAgeGroup['30-39']++;
            } else if (age < 50) {
                newStats.byAgeGroup['40-49']++;
            } else if (age < 60) {
                newStats.byAgeGroup['50-59']++;
            } else {
                newStats.byAgeGroup['60+']++;
            }
        });

        return newStats;
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/demographics`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Demographic_Report.xlsx');
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
                <p className="text-xs text-foreground-muted">Loading demographic data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xs font-bold text-foreground">Demographic Analysis</h2>
                    <p className="text-[11px] text-foreground-muted">Age, Gender, and Marital Status Distribution</p>
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
                {/* Gender Table */}
                <div className="rounded-lg border border-border overflow-hidden bg-card text-foreground">
                    <div className="p-2.5 border-b border-border bg-background-muted/60 flex items-center gap-2">
                        <User size={14} className="text-primary" />
                        <h3 className="text-xs font-bold text-foreground">Gender Distribution</h3>
                    </div>
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-background-muted/40">
                            <tr>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Gender</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Count</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {Object.entries(stats.byGender).map(([key, val]) => (
                                <tr key={key} className="hover:bg-background-muted/40 transition-colors">
                                    <td className="px-3 py-2 text-xs font-semibold text-foreground capitalize">{key.toLowerCase()}</td>
                                    <td className="px-3 py-2 text-xs text-right font-medium text-foreground">{val}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Marital Status Table */}
                <div className="rounded-lg border border-border overflow-hidden bg-card text-foreground">
                    <div className="p-2.5 border-b border-border bg-background-muted/60 flex items-center gap-2">
                        <User size={14} className="text-primary" />
                        <h3 className="text-xs font-bold text-foreground">Marital Status</h3>
                    </div>
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-background-muted/40">
                            <tr>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Count</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {Object.entries(stats.byMaritalStatus).map(([key, val]) => (
                                <tr key={key} className="hover:bg-background-muted/40 transition-colors">
                                    <td className="px-3 py-2 text-xs font-semibold text-foreground capitalize">{key.toLowerCase().replace('_', ' ')}</td>
                                    <td className="px-3 py-2 text-xs text-right font-medium text-foreground">{val}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Age Group Table */}
                <div className="rounded-lg border border-border overflow-hidden bg-card text-foreground">
                    <div className="p-2.5 border-b border-border bg-background-muted/60 flex items-center gap-2">
                        <BarChart size={14} className="text-primary" />
                        <h3 className="text-xs font-bold text-foreground">Age Groups</h3>
                    </div>
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-background-muted/40">
                            <tr>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Age Range</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Count</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {Object.entries(stats.byAgeGroup).map(([range, count]) => (
                                <tr key={range} className="hover:bg-background-muted/40 transition-colors">
                                    <td className="px-3 py-2 text-xs font-semibold text-foreground">{range}</td>
                                    <td className="px-3 py-2 text-xs text-right font-medium text-foreground">{count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Demographics;
