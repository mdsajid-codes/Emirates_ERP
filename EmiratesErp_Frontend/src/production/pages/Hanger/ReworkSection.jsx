import React, { useState, useEffect } from 'react';
import {
    RefreshCcw, Plus, History, X,
    AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const STAGES = [
    { id: 'WIRE_CUTTING', label: 'Wire Cutting' },
    { id: 'BENDING', label: 'Bending' },
    { id: 'COATING', label: 'Coating' },
    { id: 'QC', label: 'Quality Control' },
    { id: 'PACKING', label: 'Packing' }
];

const ReworkSection = ({ batch, onUpdate }) => {
    const [reworks, setReworks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        sourceStage: batch.currentStage,
        targetStage: '',
        reworkQty: '',
        reason: '',
        remarks: ''
    });

    useEffect(() => {
        fetchReworks();
    }, [batch.id]);

    const fetchReworks = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/hanger/rework-entries/by-batch/${batch.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReworks(res.data || []);
        } catch (error) {
            console.error('Error fetching reworks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/hanger/rework-entries`, {
                ...formData,
                batchId: batch.id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Rework entry recorded');
            setShowForm(false);
            fetchReworks();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error recording rework:', error);
            toast.error(error.response?.data?.message || 'Failed to record rework');
        } finally {
            setSubmitting(false);
        }
    };

    const activeReworks = Array.isArray(reworks) ? reworks : [];
    const totalReworked = activeReworks.reduce((sum, r) => sum + r.reworkQty, 0);

    return (
        <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
                        <RefreshCcw className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total Reworked</p>
                        <p className="text-xl font-black text-slate-900">{totalReworked.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span></p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <History className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Rework Logs</p>
                        <p className="text-xl font-black text-slate-900">{activeReworks.length} <span className="text-xs font-normal text-slate-400">entries</span></p>
                    </div>
                </div>
            </div>

            {/* List and Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4 text-primary" />
                        Rework History
                    </h3>
                    {!showForm && batch.status !== 'COMPLETED' && batch.status !== 'CANCELLED' && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Record Rework
                        </button>
                    )}
                </div>

                {showForm ? (
                    <form onSubmit={handleSubmit} className="p-6 bg-slate-50/30 space-y-6">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-bold text-slate-700">Record Hanger Rework</h4>
                            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest px-0.5">Source Stage</label>
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.sourceStage}
                                    onChange={(e) => setFormData({ ...formData, sourceStage: e.target.value })}
                                    required
                                >
                                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest px-0.5">Target Stage (Back To)</label>
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.targetStage}
                                    onChange={(e) => setFormData({ ...formData, targetStage: e.target.value })}
                                    required
                                >
                                    <option value="">Select Target</option>
                                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest px-0.5">Rework Quantity</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.reworkQty}
                                    onChange={(e) => setFormData({ ...formData, reworkQty: e.target.value })}
                                    required
                                    min="1"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest px-0.5">Reason Code</label>
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    required
                                >
                                    <option value="">Select Reason</option>
                                    <option value="COATING_PEEL">Coating Peeling</option>
                                    <option value="COLOR_MISMATCH">Color Mismatch</option>
                                    <option value="BENDING_DEFECT">Bending Defect</option>
                                    <option value="DIRTY_SURFACE">Dirty Surface</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest px-0.5">Remarks</label>
                            <textarea
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px]"
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                placeholder="Details about the defect or instructions for rework..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-bold text-slate-500">Cancel</button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-primary text-white px-8 py-2 rounded-lg font-bold hover:bg-primary-dark transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                {submitting ? 'Recording...' : 'Record Rework'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-3">Rework No</th>
                                    <th className="px-6 py-3">Stage Movement</th>
                                    <th className="px-6 py-3">Quantity</th>
                                    <th className="px-6 py-3">Reason</th>
                                    <th className="px-6 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Loading rework history...</td></tr>
                                ) : activeReworks.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No rework recorded for this batch</td></tr>
                                ) : activeReworks.map(rwk => (
                                    <tr key={rwk.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-700">{rwk.reworkNo}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs font-medium">
                                                <span className="text-slate-600">{rwk.sourceStage.replace('_', ' ')}</span>
                                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                                <span className="text-primary font-bold">{rwk.targetStage.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{rwk.reworkQty.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-slate-700">{rwk.reason?.replace('_', ' ')}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">{rwk.remarks}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {new Date(rwk.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReworkSection;
