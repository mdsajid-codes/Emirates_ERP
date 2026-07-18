import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Play, CheckCircle2, XCircle,
    Layers, Box, Cpu, Palette, Calendar,
    Clock, AlertTriangle, ShieldCheck, Truck,
    ChevronRight, Info, AlertCircle, Settings,
    History, Calculator, RefreshCw, Trash2, FileText
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import BendingSection from './BendingSection';
import CoatingSection from './CoatingSection';
import QcInspectionSection from './QcInspectionSection';
import PackingSection from './PackingSection';
import WireCuttingSection from './WireCuttingSection';
import ReworkSection from './ReworkSection';
import DowntimeLogSection from './DowntimeLogSection';
import ScrapSection from './ScrapSection';
import { LayoutList } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const STAGES = [
    { id: 'WIRE_CUTTING', label: 'Wire Cutting', icon: <Layers className="w-5 h-5" /> },
    { id: 'BENDING', label: 'Bending', icon: <Cpu className="w-5 h-5" /> },
    { id: 'COATING', label: 'Coating', icon: <Palette className="w-5 h-5" /> },
    { id: 'QC', label: 'Quality Control', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'SCRAP', label: 'Scrap Logs', icon: <Trash2 className="w-5 h-5" /> },
    { id: 'PACKING', label: 'Packing', icon: <Box className="w-5 h-5" /> },
    { id: 'DONE', label: 'Finished', icon: <CheckCircle2 className="w-5 h-5" /> }
];

const BatchDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('production');
    const [editingField, setEditingField] = useState(null); // 'actualQty' or 'wireUsed'
    const [editValue, setEditValue] = useState('');
    const [timeline, setTimeline] = useState([]);
    const [timelineLoading, setTimelineLoading] = useState(false);

    useEffect(() => {
        fetchBatch();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'timeline') {
            fetchTimeline();
        }
    }, [activeTab]);

    const fetchTimeline = async () => {
        setTimelineLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/hanger/batches/${id}/timeline`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTimeline(response.data.events || []);
        } catch (error) {
            console.error('Error fetching timeline:', error);
            toast.error('Failed to load timeline');
        } finally {
            setTimelineLoading(false);
        }
    };

    const fetchBatch = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/hanger/batches/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBatch(response.data);
        } catch (error) {
            console.error('Error fetching batch:', error);
            toast.error('Failed to load batch details');
        } finally {
            setLoading(false);
        }
    };

    const handleAdvanceStage = async () => {
        if (!window.confirm('Are you sure you want to complete the current stage and move to the next?')) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(`${API_URL}/hanger/batches/${id}/advance-stage`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updatedBatch = response.data;
            toast.success('Stage advanced successfully');

            if (updatedBatch.status === 'COMPLETED' && updatedBatch.salesOrderId) {
                toast.info('Redirecting to create Delivery Order...');
                navigate(`/sales/delivery-orders/new?salesOrderId=${updatedBatch.salesOrderId}`);
            } else {
                fetchBatch();
            }
        } catch (error) {
            console.error('Error advancing stage:', error);
            toast.error('Failed to advance stage');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevertStage = async () => {
        if (!window.confirm('Are you sure you want to go back to the previous production stage?')) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/hanger/batches/${id}/revert-stage`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Stage reverted successfully');
            fetchBatch();
        } catch (error) {
            console.error('Error reverting stage:', error);
            toast.error('Failed to revert stage');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this production batch? This action cannot be undone.')) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/hanger/batches/${id}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Batch cancelled');
            fetchBatch();
        } catch (error) {
            console.error('Error cancelling batch:', error);
            toast.error('Failed to cancel batch');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateProductionFields = async () => {
        try {
            const token = localStorage.getItem('token');
            const data = {};
            if (editingField === 'actualQty') data.actualQty = parseInt(editValue);
            if (editingField === 'wireUsed') data.actualWireUsedKg = parseFloat(editValue);

            await axios.patch(`${API_URL}/hanger/batches/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Batch updated successfully');
            setEditingField(null);
            fetchBatch();
        } catch (error) {
            console.error('Error updating batch fields:', error);
            toast.error('Failed to update fields');
        }
    };

    const handleDownloadReport = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/hanger/batches/${id}/report-pdf`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `BatchReport_${batch.batchNo}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading batch report:', error);
            toast.error('Failed to download batch report');
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-slate-400">Loading batch details...</div>;
    }
    if (!batch) return <div className="p-12 text-center text-red-500">Batch not found</div>;

    const currentStageIndex = STAGES.findIndex(s => s.id === batch.currentStage);

    return (
        <div className="p-6 space-y-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/production-dashboard/hanger/batches')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Batches
                </button>
                <div className="flex items-center gap-3">
                    {batch.status !== 'COMPLETED' && batch.status !== 'CANCELLED' && (
                        <>
                            <button
                                onClick={handleCancel}
                                disabled={actionLoading}
                                className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                            >
                                Cancel Batch
                            </button>
                        </>
                    )}
                    {currentStageIndex > 0 && (
                        <button
                            onClick={handleRevertStage}
                            disabled={actionLoading}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                        >
                            Back to Previous Stage
                        </button>
                    )}
                    <button
                        onClick={handleDownloadReport}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
                    >
                        <FileText className="w-4 h-4" />
                        Download Report
                    </button>
                    <button
                        onClick={() => navigate(`/production-dashboard/hanger/batches/${id}/cost-sheet`)}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        <Calculator className="w-4 h-4" />
                        Cost Sheet
                    </button>
                    {batch.status !== 'COMPLETED' && batch.status !== 'CANCELLED' && (
                        <button
                            onClick={handleAdvanceStage}
                            disabled={actionLoading}
                            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {actionLoading ? 'Updating...' : (
                                <>
                                    <Play className="w-4 h-4" />
                                    Next Stage: {STAGES[currentStageIndex + 1]?.label || 'Finish'}
                                </>
                            )}
                        </button>
                    )}
                    {batch.status === 'COMPLETED' && batch.salesOrderId && (
                        <button
                            onClick={() => navigate(`/sales/delivery-orders/new?salesOrderId=${batch.salesOrderId}`)}
                            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all shadow-lg shadow-green/20"
                        >
                            <Truck className="w-4 h-4" />
                            Create Delivery Order
                        </button>
                    )}
                </div>
            </div>

            {/* Title & Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-900">{batch.batchNo}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${batch.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            batch.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700 animate-pulse'
                            }`}>
                            {batch.status.replace('_', ' ')}
                        </span>
                    </div>
                    <p className="text-slate-500 flex items-center gap-2">
                        <Box className="w-4 h-4" />
                        Manufacturing Order: <span className="font-semibold text-slate-700">{batch.moNumber}</span>
                    </p>
                </div>

                <div className="flex gap-8 items-center border-l border-slate-100 pl-8">
                    <div className="text-center group relative cursor-pointer" onClick={() => {
                        if (batch.status !== 'CANCELLED') {
                            setEditingField('actualQty');
                            setEditValue(batch.actualQty || batch.plannedQty);
                        }
                    }}>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 flex items-center justify-center gap-1">
                            Actual / Planned
                            <Settings className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                        {editingField === 'actualQty' ? (
                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <input
                                    type="number"
                                    className="w-24 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-primary outline-none"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleUpdateProductionFields()}
                                />
                                <button onClick={handleUpdateProductionFields} className="bg-primary text-white p-1 rounded hover:bg-primary-dark">
                                    <CheckCircle2 className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-xl font-bold text-slate-900">
                                    {batch.actualQty?.toLocaleString() || '---'}
                                    <span className="text-slate-400 font-medium ml-1">/ {batch.plannedQty.toLocaleString()}</span>
                                </p>
                                {batch.actualQty && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${batch.actualQty >= batch.plannedQty ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {(((batch.actualQty - batch.plannedQty) / batch.plannedQty) * 100).toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Hanger Type</p>
                        <p className="text-xl font-bold text-slate-900">{batch.hangerTypeName}</p>
                    </div>
                </div>
            </div>

            {/* Stage Progress Stepper */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Production Progress</h2>

                <div className="relative flex justify-between">
                    {/* Background Progress Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-700 ease-in-out"
                            style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
                        />
                    </div>

                    {STAGES.map((stage, idx) => {
                        const isCompleted = idx < currentStageIndex;
                        const isCurrent = idx === currentStageIndex;
                        const isPending = idx > currentStageIndex;

                        return (
                            <div key={stage.id} className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${isCompleted ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30' :
                                    isCurrent ? 'bg-white border-primary text-primary scale-125 shadow-xl ring-4 ring-primary/10' :
                                        'bg-white border-slate-100 text-slate-300'
                                    }`}>
                                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : stage.icon}
                                </div>
                                <div className="text-center">
                                    <p className={`text-xs font-bold transition-colors ${isCurrent ? 'text-primary' : isCompleted ? 'text-slate-700' : 'text-slate-300'
                                        }`}>
                                        {stage.label}
                                    </p>
                                    {isCurrent && (
                                        <div className="mt-1 flex items-center justify-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                                            <span className="text-[10px] text-primary font-bold uppercase tracking-tighter">Active</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-primary" />
                        Raw Material Detail
                    </h3>
                    <div className="space-y-4">
                        <div className="group cursor-pointer" onClick={() => {
                            if (batch.status !== 'CANCELLED') {
                                setEditingField('wireUsed');
                                setEditValue(batch.actualWireUsedKg || '');
                            }
                        }}>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                                Wire Consumed (kg)
                                <Settings className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            {editingField === 'wireUsed' ? (
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-primary outline-none"
                                        value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        autoFocus
                                        onKeyDown={e => e.key === 'Enter' && handleUpdateProductionFields()}
                                    />
                                    <button onClick={handleUpdateProductionFields} className="bg-primary text-white p-1 rounded hover:bg-primary-dark">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm font-semibold text-slate-700">
                                    {batch.actualWireUsedKg ? `${batch.actualWireUsedKg} kg` : 'Not recorded'}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Coil Reference</p>
                            <p className="text-sm font-semibold text-slate-700">{batch.coilNo || 'Not Assigned'}</p>
                        </div>
                        {batch.coilNo && (
                            <button
                                onClick={() => navigate(`/warehouse-dashboard/coil-stock?search=${batch.coilNo}`)}
                                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                            >
                                View Coil Inventory
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-primary" />
                        Production Settings
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Shift</p>
                            <p className="text-sm font-semibold text-slate-700">{batch.shift || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Work Station</p>
                            <p className="text-sm font-semibold text-slate-700">{batch.workStationName || 'Not Assigned'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Color</p>
                            <p className="text-sm font-semibold text-slate-700">{batch.color || 'Standard'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        Traceability & History
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-medium">Created On</span>
                            <span className="text-slate-600 font-semibold">{new Date(batch.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-medium">Last Updated</span>
                            <span className="text-slate-600 font-semibold">{new Date(batch.updatedAt).toLocaleString()}</span>
                        </div>
                        {batch.completedAt && (
                            <div className="flex justify-between items-center text-xs text-green-600">
                                <span className="font-medium">Completed At</span>
                                <span className="font-bold">{new Date(batch.completedAt).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="pt-2 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Remarks</p>
                            <p className="text-xs text-slate-600 italic">"{batch.remarks || 'No remarks provided'}"</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Header */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('production')}
                    className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'production'
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <LayoutList className="w-4 h-4" />
                    Production Operation
                </button>
                <button
                    onClick={() => setActiveTab('rework')}
                    className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'rework'
                        ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <RefreshCw className="w-4 h-4" />
                    Rework History
                </button>
                <button
                    onClick={() => setActiveTab('downtime')}
                    className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'downtime'
                        ? 'border-rose-500 text-rose-600 bg-rose-50/50'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <AlertTriangle className="w-4 h-4" />
                    Machine Downtime
                </button>
                <button
                    onClick={() => setActiveTab('timeline')}
                    className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'timeline'
                        ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <History className="w-4 h-4" />
                    Event Timeline
                </button>
            </div>

            {/* Stage Specific Content */}
            {activeTab === 'production' && (
                <div className="space-y-6">
                    {batch.currentStage === 'WIRE_CUTTING' && (
                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                <h2 className="text-xl font-bold text-slate-900">Wire Cutting Operations</h2>
                            </div>
                            <WireCuttingSection batch={batch} onActionSuccess={fetchBatch} />
                        </div>
                    )}

                    {batch.currentStage === 'BENDING' && (
                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                <h2 className="text-xl font-bold text-slate-900">Bending / Forming Operations</h2>
                            </div>
                            <BendingSection batch={batch} onActionSuccess={fetchBatch} />
                        </div>
                    )}

                    {batch.currentStage === 'COATING' && (
                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                <h2 className="text-xl font-bold text-slate-900">Coating / Painting Operations</h2>
                            </div>
                            <CoatingSection batch={batch} onActionSuccess={fetchBatch} />
                        </div>
                    )}

                    {batch.currentStage === 'QC' && (
                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                <h2 className="text-xl font-bold text-slate-900">Quality Control Inspection</h2>
                            </div>
                            <QcInspectionSection batch={batch} onUpdate={fetchBatch} />
                        </div>
                    )}

                    {batch.currentStage === 'SCRAP' && (
                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                <h2 className="text-xl font-bold text-slate-900">Scrap Management</h2>
                            </div>
                            <ScrapSection batch={batch} onUpdate={fetchBatch} />
                        </div>
                    )}

                    {batch.currentStage === 'PACKING' && (
                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                <h2 className="text-xl font-bold text-slate-900">Packing & Finished Goods</h2>
                            </div>
                            <PackingSection batchId={batch.id} batchData={batch} onRefresh={fetchBatch} />
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'rework' && (
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                        <h2 className="text-xl font-bold text-slate-900">Rework Management</h2>
                    </div>
                    <ReworkSection batch={batch} onUpdate={fetchBatch} />
                </div>
            )}

            {activeTab === 'downtime' && (
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                        <h2 className="text-xl font-bold text-slate-900">Machine Downtime Analysis</h2>
                    </div>
                    <DowntimeLogSection batch={batch} onUpdate={fetchBatch} />
                </div>
            )}

            {activeTab === 'timeline' && (
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                        <h2 className="text-xl font-bold text-slate-900">Batch Event Timeline</h2>
                    </div>

                    {timelineLoading ? (
                        <div className="p-12 text-center text-slate-400">Loading timeline...</div>
                    ) : timeline.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 italic bg-white rounded-2xl border border-dashed border-slate-200">
                            No events recorded yet for this batch.
                        </div>
                    ) : (
                        <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            {timeline.map((event, idx) => (
                                <div key={idx} className="relative">
                                    {/* Timeline Node */}
                                    <div className={`absolute -left-[37px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 
                                        ${event.color === 'green' ? 'bg-green-500' :
                                            event.color === 'red' ? 'bg-red-500' :
                                                event.color === 'orange' ? 'bg-orange-500' :
                                                    event.color === 'amber' ? 'bg-amber-500' :
                                                        event.color === 'rose' ? 'bg-rose-500' :
                                                            event.color === 'indigo' ? 'bg-indigo-500' : 'bg-primary'}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 hover:border-primary/20 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                                                <p className="text-xs text-slate-500">{event.description}</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded">
                                                {new Date(event.timestamp).toLocaleString()}
                                            </span>
                                        </div>

                                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                                            <div className="pt-2 mt-2 border-t border-slate-50 flex gap-4">
                                                {Object.entries(event.metadata).map(([key, val]) => (
                                                    <div key={key}>
                                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{key}: </span>
                                                        <span className="text-[10px] text-slate-700 font-bold">{val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Warning for Cancelled/Completed */}
            {(batch.status === 'CANCELLED' || batch.status === 'COMPLETED') && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${batch.status === 'CANCELLED' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'
                    }`}>
                    {batch.status === 'CANCELLED' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    <div className="text-sm font-medium">
                        {batch.status === 'CANCELLED'
                            ? 'This batch has been cancelled. No further production activities can be recorded.'
                            : 'This batch has been successfully completed. Traceability data is locked.'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchDetailPage;
