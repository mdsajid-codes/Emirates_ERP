import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Filter, ChevronRight,
    Layers, Settings, Play, CheckCircle2,
    Clock, XCircle, AlertCircle, LayoutGrid, Gauge, FileBarChart
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const STAGE_COLORS = {
    WIRE_CUTTING: 'bg-blue-100 text-blue-700 border-blue-200',
    BENDING: 'bg-orange-100 text-orange-700 border-orange-200',
    COATING: 'bg-purple-100 text-purple-700 border-purple-200',
    QC: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    PACKING: 'bg-green-100 text-green-700 border-green-200',
    DONE: 'bg-teal-100 text-teal-700 border-teal-200'
};

const STATUS_ICONS = {
    PENDING: <Clock className="w-4 h-4 text-slate-400" />,
    IN_PROGRESS: <Play className="w-4 h-4 text-blue-500 animate-pulse" />,
    COMPLETED: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    CANCELLED: <XCircle className="w-4 h-4 text-red-500" />
};

const BatchListPage = () => {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/hanger/batches`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBatches(Array.isArray(response.data.content) ? response.data.content : []);
        } catch (error) {
            console.error('Error fetching batches:', error);
            toast.error('Failed to load production batches');
        } finally {
            setLoading(false);
        }
    };

    const safeBatches = Array.isArray(batches) ? batches : [];
    const filteredBatches = safeBatches.filter(b =>
        (b.batchNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.moNumber || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-primary" />
                        Production Batches
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Track and manage hanger production runs across all stages
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/production-dashboard/hanger/batches/wip')}
                        className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium"
                    >
                        <LayoutGrid className="w-4 h-4 text-primary" />
                        WIP Tracking
                    </button>
                    <button
                        onClick={() => navigate('/production-dashboard/hanger/batches/reports')}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        <FileBarChart className="w-4 h-4" />
                        Reports
                    </button>
                    <button
                        onClick={() => navigate('/production-dashboard/hanger/batches/oee')}
                        className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium"
                    >
                        <Gauge className="w-4 h-4 text-rose-500" />
                        OEE Analytics
                    </button>
                    <button
                        onClick={() => navigate('/production-dashboard/hanger/batches/new')}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        New Batch
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Batch No or MO No..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm text-slate-600">
                    <Filter className="w-4 h-4" />
                    Filters
                </button>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Batch Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Order Reference</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Product Specs</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Current Stage</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Planned Qty</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="px-6 py-4">
                                            <div className="h-10 bg-slate-100 rounded"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredBatches.length > 0 ? (
                                filteredBatches.map((batch) => (
                                    <tr
                                        key={batch.id}
                                        onClick={() => navigate(`/production-dashboard/hanger/batches/${batch.id}`)}
                                        className="hover:bg-slate-50 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 group-hover:text-primary transition-colors">
                                                {batch.batchNo}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                Created {new Date(batch.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 font-medium">{batch.moNumber}</div>
                                            <div className="text-xs text-slate-400">Coil: {batch.coilNo || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600">{batch.hangerTypeName}</div>
                                            <div className="text-xs text-slate-400">Color: {batch.color || 'Standard'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STAGE_COLORS[batch.currentStage] || 'bg-slate-100 text-slate-600'}`}>
                                                {batch.currentStage.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {STATUS_ICONS[batch.status]}
                                                <span className="text-sm text-slate-600">{batch.status.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-slate-700">
                                                {batch.plannedQty.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle className="w-8 h-8 text-slate-200" />
                                            <p className="text-slate-500 font-medium">No production batches found</p>
                                            <p className="text-slate-400 text-xs">Try adjusting your filters or search term</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BatchListPage;
