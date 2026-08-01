import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Loader, CheckCircle, AlertTriangle } from 'lucide-react';

const EmiratizationReport = () => {
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
            const response = await axios.get(`${API_URL}/reports/compliance/emiratization`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setReportData(response.data);
        } catch (err) {
            console.error("Error fetching Emiratization report:", err);
            setError('Failed to load emiratization report.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadExcel = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/compliance/emiratization/export`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Emiratization-Report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error exporting Emiratization report:", err);
            alert("Failed to export Emiratization report.");
        }
    };

    const isCompliant = reportData?.status === 'COMPLIANT';

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xs font-bold text-foreground">Emiratization Compliance</h2>
                    <p className="text-[11px] text-foreground-muted">Tracking nationalization targets and workforce ratios</p>
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
                        <AlertTriangle size={14} />
                        <span>{error}</span>
                    </div>
                    <button onClick={fetchReport} className="text-xs underline hover:opacity-80">Try Again</button>
                </div>
            ) : reportData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Compliance Status Card */}
                    <div className={`md:col-span-1 rounded-lg border p-4 flex flex-col items-center justify-center text-center ${
                        isCompliant ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                    }`}>
                        {isCompliant ? (
                            <CheckCircle size={40} className="mb-2" />
                        ) : (
                            <AlertTriangle size={40} className="mb-2" />
                        )}
                        <h4 className="text-sm font-bold uppercase tracking-wider mb-0.5">
                            {reportData.status}
                        </h4>
                        <p className="text-[11px] font-medium opacity-80">
                            Current Emiratization Status
                        </p>
                    </div>

                    {/* Stats & Ratios Card */}
                    <div className="md:col-span-2 bg-card border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <span className="text-xs font-bold text-foreground">Emiratization Rate</span>
                            <span className="text-lg font-extrabold text-emerald-600">{reportData.emiratizationPercentage}%</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="p-2.5 bg-background border border-border rounded-md text-center">
                                <span className="text-[10px] text-foreground-muted uppercase font-semibold block">Total</span>
                                <span className="text-base font-extrabold text-foreground">{reportData.totalEmployees}</span>
                            </div>
                            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-center">
                                <span className="text-[10px] text-emerald-600 uppercase font-semibold block">UAE Nationals</span>
                                <span className="text-base font-extrabold text-emerald-600">{reportData.totalNationals}</span>
                            </div>
                            <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-md text-center">
                                <span className="text-[10px] text-primary uppercase font-semibold block">Expats</span>
                                <span className="text-base font-extrabold text-primary">{reportData.totalExpats}</span>
                            </div>
                            <div className="p-2.5 bg-background-muted border border-border rounded-md text-center">
                                <span className="text-[10px] text-foreground-muted uppercase font-semibold block">Target</span>
                                <span className="text-base font-bold text-foreground-muted">2.0%</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-8 text-center text-foreground-muted text-xs bg-card rounded-lg border border-border">
                    No emiratization data available.
                </div>
            )}
        </div>
    );
};

export default EmiratizationReport;
