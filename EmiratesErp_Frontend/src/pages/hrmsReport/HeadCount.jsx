import React, { useState, useEffect } from 'react';
import { Download, Loader, Users, Building, Briefcase } from 'lucide-react';
import axios from 'axios';

const HeadCount = () => {
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        byDepartment: {},
        byDesignation: {}
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
            active: data.filter(e => e.status === 'ACTIVE').length,
            inactive: data.filter(e => e.status !== 'ACTIVE').length,
            byDepartment: {},
            byDesignation: {}
        };

        data.forEach(emp => {
            const dept = emp.jobDetails?.department || 'Unassigned';
            const desig = emp.jobDetails?.designation || 'Unassigned';

            newStats.byDepartment[dept] = (newStats.byDepartment[dept] || 0) + 1;
            newStats.byDesignation[desig] = (newStats.byDesignation[desig] || 0) + 1;
        });

        setStats(newStats);
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/headcount`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Headcount_Report.xlsx');
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
                <p className="text-xs text-foreground-muted">Loading headcount statistics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xs font-bold text-foreground">Headcount Overview</h2>
                    <p className="text-[11px] text-foreground-muted">Distribution by Department and Role</p>
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-card border border-border rounded-lg text-foreground flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-md">
                        <Users size={18} />
                    </div>
                    <div>
                        <p className="text-[11px] text-foreground-muted font-medium">Total Employees</p>
                        <h3 className="text-base font-bold text-foreground leading-tight">{stats.total}</h3>
                    </div>
                </div>
                <div className="p-3 bg-card border border-border rounded-lg text-foreground flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-md">
                        <Users size={18} />
                    </div>
                    <div>
                        <p className="text-[11px] text-foreground-muted font-medium">Active</p>
                        <h3 className="text-base font-bold text-foreground leading-tight">{stats.active}</h3>
                    </div>
                </div>
                <div className="p-3 bg-card border border-border rounded-lg text-foreground flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 text-rose-600 rounded-md">
                        <Users size={18} />
                    </div>
                    <div>
                        <p className="text-[11px] text-foreground-muted font-medium">Inactive/Terminated</p>
                        <h3 className="text-base font-bold text-foreground leading-tight">{stats.inactive}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Department Table */}
                <div className="rounded-lg border border-border overflow-hidden bg-card text-foreground">
                    <div className="p-2.5 border-b border-border bg-background-muted/60 flex items-center gap-2">
                        <Building size={14} className="text-foreground-muted" />
                        <h3 className="text-xs font-bold text-foreground">Department Wise</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-background-muted/40">
                                <tr>
                                    <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Department</th>
                                    <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Count</th>
                                    <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {Object.entries(stats.byDepartment).map(([dept, count]) => (
                                    <tr key={dept} className="hover:bg-background-muted/40 transition-colors">
                                        <td className="px-3 py-2 text-xs font-semibold text-foreground">{dept}</td>
                                        <td className="px-3 py-2 text-xs text-right font-medium text-foreground">{count}</td>
                                        <td className="px-3 py-2 text-xs text-right text-foreground-muted">
                                            {stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Designation Table */}
                <div className="rounded-lg border border-border overflow-hidden bg-card text-foreground">
                    <div className="p-2.5 border-b border-border bg-background-muted/60 flex items-center gap-2">
                        <Briefcase size={14} className="text-foreground-muted" />
                        <h3 className="text-xs font-bold text-foreground">Role Wise</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-background-muted/40">
                                <tr>
                                    <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Role / Designation</th>
                                    <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Count</th>
                                    <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {Object.entries(stats.byDesignation).map(([role, count]) => (
                                    <tr key={role} className="hover:bg-background-muted/40 transition-colors">
                                        <td className="px-3 py-2 text-xs font-semibold text-foreground">{role}</td>
                                        <td className="px-3 py-2 text-xs text-right font-medium text-foreground">{count}</td>
                                        <td className="px-3 py-2 text-xs text-right text-foreground-muted">
                                            {stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeadCount;
