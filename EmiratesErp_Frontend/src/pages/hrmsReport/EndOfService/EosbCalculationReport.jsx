import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Download, Loader, AlertCircle, FileText } from 'lucide-react';

const EosbCalculationReport = () => {
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
            const response = await axios.get(`${API_URL}/reports/eos/eosb`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setReportData(response.data || []);
            setFilteredData(response.data || []);
        } catch (err) {
            console.error("Error fetching EOSB report:", err);
            setError('Failed to load EOSB calculation report.');
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
                (item.calculationDetails && item.calculationDetails.toLowerCase().includes(lowerSearch))
            );
            setFilteredData(filtered);
        }
    }, [headerSearchTerm, reportData]);

    const handleDownloadExcel = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/eos/eosb/export`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'EOSB-Report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error exporting EOSB report:", err);
            alert("Failed to export EOSB report.");
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-xs font-bold text-foreground">EOSB Calculation Details</h2>
                    <p className="text-[11px] text-foreground-muted">Detailed breakdown of end of service gratuity calculations</p>
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
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Joining Date</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Last Working Day</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Service (Yrs)</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Last Basic (AED)</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Gratuity Amt (AED)</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Calculation Details</th>
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
                                        <td className="px-3 py-2 text-xs text-foreground-muted whitespace-nowrap">{item.joiningDate}</td>
                                        <td className="px-3 py-2 text-xs text-foreground-muted whitespace-nowrap">{item.lastWorkingDay}</td>
                                        <td className="px-3 py-2 text-xs text-right font-semibold text-primary whitespace-nowrap">{item.totalYearsOfService}</td>
                                        <td className="px-3 py-2 text-xs text-right text-foreground whitespace-nowrap">{item.lastBasicSalary?.toLocaleString()}</td>
                                        <td className="px-3 py-2 text-xs text-right font-bold text-emerald-600 whitespace-nowrap">{item.gratuityAmount?.toLocaleString()}</td>
                                        <td className="px-3 py-2 text-xs text-foreground-muted max-w-xs truncate" title={item.calculationDetails}>{item.calculationDetails}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-foreground-muted text-xs">
                                        <FileText className="mx-auto h-7 w-7 text-foreground-muted/40 mb-1" />
                                        <h3 className="text-xs font-bold text-foreground">No EOSB records found</h3>
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

export default EosbCalculationReport;
