import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download, Loader, RefreshCw, AlertCircle, Users } from 'lucide-react';
import axios from 'axios';

const MasterEmployeeReport = () => {
    const { searchTerm: headerSearchTerm = '' } = useOutletContext() || {};
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchEmployees = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/employees/all`, { headers });
            setEmployees(response.data || []);
            setFilteredEmployees(response.data || []);
        } catch (err) {
            console.error("Error fetching employees:", err);
            setError("Failed to load employee list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        const lowercasedFilter = headerSearchTerm.toLowerCase().trim();
        const filtered = employees.filter(emp => {
            const matchesSearch = !lowercasedFilter || (
                (emp.firstName && emp.firstName.toLowerCase().includes(lowercasedFilter)) ||
                (emp.lastName && emp.lastName.toLowerCase().includes(lowercasedFilter)) ||
                (`${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase().includes(lowercasedFilter)) ||
                (emp.employeeCode && emp.employeeCode.toLowerCase().includes(lowercasedFilter)) ||
                (emp.emailWork && emp.emailWork.toLowerCase().includes(lowercasedFilter))
            );

            const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
        setFilteredEmployees(filtered);
    }, [headerSearchTerm, statusFilter, employees]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('token');
            const params = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
            const response = await axios.get(`${API_URL}/reports/employee-master${params}`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let filename = 'Employee_Master_Report.xlsx';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch && filenameMatch.length === 2)
                    filename = filenameMatch[1];
            }

            link.setAttribute('download', filename);
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
                    <h2 className="text-xs font-bold text-foreground">Employee Master Report</h2>
                    <p className="text-[11px] text-foreground-muted">View and export comprehensive employee master details</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-2 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-7"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="TERMINATED">Terminated</option>
                    </select>

                    <button
                        onClick={fetchEmployees}
                        className="p-1 text-foreground-muted hover:text-foreground border border-border rounded-md hover:bg-background-muted transition-colors bg-background"
                        title="Refresh List"
                    >
                        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                    </button>

                    <button
                        onClick={handleExport}
                        disabled={exporting || loading}
                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-2xs h-7 disabled:opacity-70"
                    >
                        {exporting ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Download size={13} />}
                        <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-md border border-rose-500/20 flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full bg-card text-foreground divide-y divide-border">
                    <thead className="bg-background-muted/60">
                        <tr>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Employee Code</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Name</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Email</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Phone</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Gender</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-8">
                                    <Loader className="animate-spin h-5 w-5 text-primary mx-auto" />
                                </td>
                            </tr>
                        ) : filteredEmployees.length > 0 ? (
                            filteredEmployees.map((emp) => (
                                <tr key={emp.id || emp.employeeCode} className="hover:bg-background-muted/40 transition-colors">
                                    <td className="px-3 py-2 text-xs font-semibold text-foreground">{emp.employeeCode}</td>
                                    <td className="px-3 py-2 text-xs font-medium text-foreground">{emp.firstName} {emp.lastName}</td>
                                    <td className="px-3 py-2 text-xs text-foreground-muted">{emp.emailWork || '-'}</td>
                                    <td className="px-3 py-2 text-xs text-foreground-muted">{emp.phonePrimary || '-'}</td>
                                    <td className="px-3 py-2 text-xs">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                                            emp.status === 'ACTIVE'
                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                        }`}>
                                            {emp.status?.toLowerCase()}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-xs text-foreground-muted capitalize">{emp.gender ? emp.gender.toLowerCase() : '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-foreground-muted text-xs">
                                    <Users className="mx-auto h-7 w-7 text-foreground-muted/40 mb-1" />
                                    <h3 className="text-xs font-bold text-foreground">No employees found</h3>
                                    <p className="text-[11px] text-foreground-muted">There are no employees matching your search criteria.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="text-[11px] text-foreground-muted text-right pr-1">
                Showing {filteredEmployees.length} of {employees.length} records
            </div>
        </div>
    );
};

export default MasterEmployeeReport;
