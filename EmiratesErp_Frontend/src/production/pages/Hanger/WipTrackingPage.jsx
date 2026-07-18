import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layers, LayoutGrid, List, RefreshCcw,
    ChevronRight, ArrowLeft, Loader2, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const STAGES = [
    { id: 'WIRE_CUTTING', label: 'Wire Cutting', color: 'blue' },
    { id: 'BENDING', label: 'Bending', color: 'orange' },
    { id: 'COATING', label: 'Coating', color: 'purple' },
    { id: 'QC', label: 'Quality Control', color: 'yellow' },
    { id: 'PACKING', label: 'Packing', color: 'green' }
];

const WipTrackingPage = () => {
    const navigate = useNavigate();
    const [wipData, setWipData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWipSummary();
    }, []);

    const fetchWipSummary = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/hanger/batches/wip-summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWipData(res.data || {});
        } catch (error) {
            console.error('Error fetching WIP summary:', error);
            toast.error('Failed to load production floor tracking');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-slate-500 font-medium tracking-wide">Analysing production flow...</p>
        </div>
    );

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/production-dashboard/hanger/batches')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </button>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <LayoutGrid className="w-6 h-6 text-primary" />
                            Production WIP Tracking
                        </h1>
                    </div>
                    <p className="text-slate-500 text-sm mt-1 ml-12">
                        Real-time visualization of batches across the production floor
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                        onClick={() => navigate('/production-dashboard/hanger/batches')}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700 transition-all"
                    >
                        <List className="w-3.5 h-3.5" />
                        Table View
                    </button>
                    <button className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-lg text-xs font-bold text-primary shadow-sm transition-all">
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Kanban Flow
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 min-h-[700px]">
                {STAGES.map(stage => (
                    <div key={stage.id} className="flex flex-col gap-4 bg-slate-50/50 rounded-2xl border border-slate-200/60 p-4 h-full">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-6 rounded-full ${stage.color === 'blue' ? 'bg-blue-500' :
                                    stage.color === 'orange' ? 'bg-orange-500' :
                                        stage.color === 'purple' ? 'bg-purple-500' :
                                            stage.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                                    }`} />
                                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">{stage.label}</h3>
                            </div>
                            <span className="bg-white border border-slate-200 text-[10px] font-black text-slate-500 px-2 py-0.5 rounded flex items-center justify-center min-w-[24px]">
                                {wipData[stage.id]?.length || 0}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200 max-h-[75vh]">
                            {wipData[stage.id]?.length > 0 ? (
                                wipData[stage.id].map(batch => (
                                    <BatchCard key={batch.id} batch={batch} stageColor={stage.color} onClick={() => navigate(`/production-dashboard/hanger/batches/${batch.id}`)} />
                                ))
                            ) : (
                                <div className="h-40 flex flex-col items-center justify-center text-center p-8 opacity-40 grayscale">
                                    <div className="p-3 rounded-full bg-slate-100 mb-2">
                                        <Layers className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No Active Batches</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BatchCard = ({ batch, stageColor, onClick }) => (
    <div
        onClick={onClick}
        className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer relative overflow-hidden"
    >
        <div className="flex justify-between items-start mb-3">
            <div>
                <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight">{batch.batchNo}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{batch.moNumber}</p>
            </div>
            {batch.status === 'IN_PROGRESS' && (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 p-2 rounded-lg">
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-tighter">Planned Qty</p>
                <p className="text-sm font-black text-slate-800">{batch.plannedQty.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg">
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-tighter">Shift / Station</p>
                <p className="text-[10px] font-bold text-slate-700 truncate">{batch.shift || 'N/A'} - {batch.workStationName || 'TBD'}</p>
            </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">{batch.hangerTypeName}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>

        {/* Subtle color bar matching stage */}
        <div className={`absolute bottom-0 left-0 w-full h-1 ${stageColor === 'blue' ? 'bg-blue-500' :
            stageColor === 'orange' ? 'bg-orange-500' :
                stageColor === 'purple' ? 'bg-purple-500' :
                    stageColor === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
            } opacity-10 group-hover:opacity-100 transition-opacity`} />
    </div>
);

export default WipTrackingPage;
