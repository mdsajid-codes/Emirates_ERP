import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Download, Loader, FileBadge, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';

const LaborCardReport = () => {
    const { searchTerm: headerSearchTerm = '' } = useOutletContext() || {};
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/compliance/labor-card`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setReportData(response.data || []);
            setFilteredData(response.data || []);
        } catch (err) {
            console.error("Error fetching Labor Card report:", err);
            setError('Failed to load labor card report.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!headerSearchTerm) {
            setFilteredData(reportData);
        } else {
            const lowerSearch = headerSearchTerm.toLowerCase().trim();
            const filtered = reportData.filter(item =>
                (item.employeeName && item.employeeName.toLowerCase().includes(lowerSearch)) ||
                (item.employeeCode && item.employeeCode.toLowerCase().includes(lowerSearch)) ||
                (item.laborCardNumber && item.laborCardNumber.toLowerCase().includes(lowerSearch)) ||
                (item.status && item.status.toLowerCase().includes(lowerSearch))
            );
            setFilteredData(filtered);
        }
    }, [headerSearchTerm, reportData]);

    const handleDownloadExcel = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/compliance/labor-card/export`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Labor-Card-Report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error exporting Labor Card report:", err);
            alert("Failed to export Labor Card report.");
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-xs font-bold text-foreground">Labor Card Status</h2>
                    <p className="text-[11px] text-foreground-muted">Track labor card validity and expiry dates</p>
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
                        <AlertTriangle size={14} />
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
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Employee</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Labor Card No</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Expiry Date</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Days to Expiry</th>
                                <th className="px-3 py-2 text-center text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.employeeId} className="hover:bg-background-muted/40 transition-colors">
                                        <td className="px-3 py-2 text-xs whitespace-nowrap">
                                            <div className="font-semibold text-foreground">{item.employeeName}</div>
                                            <div className="text-[10px] text-foreground-muted">{item.employeeCode}</div>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-foreground-muted whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <FileBadge size={13} className="text-foreground-muted/70" />
                                                <span>{item.laborCardNumber || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-foreground-muted whitespace-nowrap">{item.expiryDate}</td>
                                        <td className="px-3 py-2 text-xs text-right whitespace-nowrap">
                                            <span className={item.daysToExpiry <= 30 ? 'text-rose-500 font-bold' : 'text-foreground'}>
                                                {item.daysToExpiry}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-center whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                item.status === 'ACTIVE'
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                    : item.status === 'EXPIRING_SOON'
                                                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                            }`}>
                                                {item.status === 'ACTIVE' ? 'Active' : item.status === 'EXPIRING_SOON' ? 'Expiring Soon' : 'Expired'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-foreground-muted text-xs">
                                        <FileText className="mx-auto h-7 w-7 text-foreground-muted/40 mb-1" />
                                        <h3 className="text-xs font-bold text-foreground">No labor card records found</h3>
                                        <p className="text-[11px] text-foreground-muted">No records match your search criteria.</p>
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

export default LaborCardReport;
