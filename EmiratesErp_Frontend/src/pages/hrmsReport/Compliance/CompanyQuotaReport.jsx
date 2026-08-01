import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Loader, Briefcase, AlertCircle } from 'lucide-react';

const CompanyQuotaReport = () => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
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
            const response = await axios.get(`${API_URL}/reports/compliance/company-quota`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setReportData(response.data);
        } catch (err) {
            console.error("Error fetching Company Quota report:", err);
            setError('Failed to load company quota report.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadExcel = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/compliance/company-quota/export`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Company-Quota-Report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error exporting Company Quota report:", err);
            alert("Failed to export Company Quota report.");
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xs font-bold text-foreground">Company Visa Quota</h2>
                    <p className="text-[11px] text-foreground-muted">Utilization of allocated company visa quota</p>
                </div>
                <button
                    onClick={handleDownloadExcel}
                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-2xs h-7"
                >
                    <Download size={13} />
                    <span>Export Excel</span>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center p-8 bg-card border border-border rounded-lg">
                    <Loader className="animate-spin h-5 w-5 text-primary" />
                </div>
            ) : error ? (
                <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-md border border-rose-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                    </div>
                    <button onClick={fetchReport} className="text-xs underline hover:opacity-80">Try Again</button>
                </div>
            ) : reportData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Quota Summary Card */}
                    <div className="p-4 bg-card border border-border rounded-lg text-foreground space-y-3">
                        <div className="flex items-center gap-2 border-b border-border pb-2">
                            <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                                <Briefcase size={16} />
                            </div>
                            <div>
                                <span className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold">Company Name</span>
                                <h3 className="text-sm font-bold text-foreground leading-none mt-0.5">{reportData.companyName || 'N/A'}</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="p-3 bg-background border border-border rounded-md">
                                <span className="text-[10px] font-bold text-foreground-muted uppercase">Total Quota</span>
                                <div className="text-xl font-extrabold text-foreground mt-0.5">{reportData.totalVisaQuota}</div>
                            </div>
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase">Available</span>
                                <div className="text-xl font-extrabold text-emerald-600 mt-0.5">{reportData.availableVisaQuota}</div>
                            </div>
                        </div>
                    </div>

                    {/* Utilization Progress Card */}
                    <div className="p-4 bg-card border border-border rounded-lg text-foreground flex flex-col justify-between">
                        <div className="flex justify-between items-center pb-2 border-b border-border">
                            <span className="text-xs font-bold text-foreground">Quota Utilization</span>
                            <span className="text-sm font-extrabold text-primary">{reportData.utilizationPercentage}%</span>
                        </div>

                        <div className="space-y-2 py-3">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-foreground-muted">Used Visas</span>
                                <span className="text-foreground font-bold">{reportData.usedVisaQuota} / {reportData.totalVisaQuota}</span>
                            </div>
                            <div className="w-full bg-background border border-border rounded-full h-2.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${reportData.utilizationPercentage > 90 ? 'bg-rose-500' : 'bg-primary'}`}
                                    style={{ width: `${Math.min(reportData.utilizationPercentage, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="text-[11px] text-foreground-muted">
                            {reportData.availableVisaQuota} visa{reportData.availableVisaQuota !== 1 ? 's' : ''} remaining for allocation.
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-8 text-center text-foreground-muted text-xs bg-card rounded-lg border border-border">
                    No company quota information available.
                </div>
            )}
        </div>
    );
};

export default CompanyQuotaReport;
