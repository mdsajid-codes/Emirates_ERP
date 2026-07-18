import React, { useState, useEffect } from 'react';
import {
    FileBarChart, Filter, Download, Search,
    Calendar, ChevronRight, FileText, ArrowUpDown
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ProductionReportsPage = () => {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        status: '',
        stage: '',
        hangerType: '',
        search: ''
    });

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Using existing list endpoint but we can filter on frontend for now
            // or we could add a dedicated report endpoint if needed.
            // For now, let's fetch a larger page to show data.
            const response = await axios.get(`${API_URL}/hanger/batches?size=100&sort=createdAt,desc`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBatches(response.data.content || []);
        } catch (error) {
            console.error('Error fetching batches for report:', error);
            toast.error('Failed to load production data');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        setExporting(true);
        try {
            const filtered = getFilteredBatches();
            if (filtered.length === 0) {
                toast.warning('No data to export');
                return;
            }

            const headers = ['Batch No', 'MO', 'Hanger Type', 'Status', 'Current Stage', 'Planned Qty', 'Actual Qty', 'Scrap (kg)', 'Created At'];
            const rows = filtered.map(b => [
                b.batchNo,
                b.moNumber,
                b.hangerTypeName,
                b.status,
                b.currentStage,
                b.plannedQty,
                b.actualQty || 0,
                b.actualWireUsedKg || 0,
                new Date(b.createdAt).toLocaleDateString()
            ]);

            const csvContent = "data:text/csv;charset=utf-8,"
                + headers.join(",") + "\n"
                + rows.map(e => e.join(",")).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Production_Report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Report exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export CSV');
        } finally {
            setExporting(false);
        }
    };

    const handleDownloadPdf = async (batchId, batchNo) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/hanger/batches/${batchId}/report-pdf`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `BatchReport_${batchNo}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Failed to download PDF report');
        }
    };

    const getFilteredBatches = () => {
        return batches.filter(b => {
            const matchStatus = !filters.status || b.status === filters.status;
            const matchStage = !filters.stage || b.currentStage === filters.stage;
            const matchSearch = !filters.search ||
                b.batchNo.toLowerCase().includes(filters.search.toLowerCase()) ||
                b.moNumber.toLowerCase().includes(filters.search.toLowerCase());
            return matchStatus && matchStage && matchSearch;
        });
    };

    const filteredBatches = getFilteredBatches();

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileBarChart className="text-primary w-7 h-7" />
                        Production Reports
                    </h1>
                    <p className="text-slate-500 text-sm">Analyze production batch performance and export history.</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    disabled={exporting || loading}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                >
                    <Download className="w-4 h-4" />
                    {exporting ? 'Exporting...' : 'Export CSV'}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Batch No or MO..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>

                <select
                    className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value="">All Statuses</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>

                <select
                    className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={filters.stage}
                    onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
                >
                    <option value="">All Stages</option>
                    <option value="WIRE_CUTTING">Wire Cutting</option>
                    <option value="BENDING">Bending</option>
                    <option value="COATING">Coating</option>
                    <option value="QC">QC</option>
                    <option value="PACKING">Packing</option>
                    <option value="DONE">Finished</option>
                </select>

                <button
                    onClick={() => setFilters({ status: '', stage: '', hangerType: '', search: '' })}
                    className="text-xs font-bold text-primary hover:underline px-2"
                >
                    Reset
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Batch Details</th>
                                <th className="px-6 py-4">MO / Coil</th>
                                <th className="px-6 py-4 text-center">Qty (Actual/Plan)</th>
                                <th className="px-6 py-4 text-center">Status / Stage</th>
                                <th className="px-6 py-4">Efficiency</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading production data...</td></tr>
                            ) : filteredBatches.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">No batches found matching filters</td></tr>
                            ) : filteredBatches.map(batch => (
                                <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{batch.batchNo}</div>
                                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{batch.hangerTypeName}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        <div className="font-medium text-slate-700">MO: {batch.moNumber}</div>
                                        <div className="text-slate-400">Coil: {batch.coilNo || '---'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="font-bold text-slate-900">{batch.actualQty || 0}</div>
                                        <div className="text-[10px] text-slate-400">Planned: {batch.plannedQty}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${batch.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {batch.status}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">{batch.currentStage}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                                            <div
                                                className={`h-full rounded-full ${batch.actualQty >= batch.plannedQty ? 'bg-green-500' : 'bg-primary'}`}
                                                style={{ width: `${Math.min((batch.actualQty / batch.plannedQty) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-500">
                                            {Math.round((batch.actualQty / batch.plannedQty) * 100) || 0}% Achievement
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleDownloadPdf(batch.id, batch.batchNo)}
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                title="Download PDF"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/production-dashboard/hanger/batches/${batch.id}`)}
                                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">Showing {filteredBatches.length} batches</span>
                    <span className="text-xs text-slate-400 italic">Sorted by newest first</span>
                </div>
            </div>
        </div>
    );
};

export default ProductionReportsPage;
