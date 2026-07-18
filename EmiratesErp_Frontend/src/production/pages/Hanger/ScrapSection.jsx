import React, { useState, useEffect } from 'react';
import {
    Trash2, Plus, History, X,
    AlertCircle, CheckCircle2, TrendingDown, DollarSign, Scale
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const STAGES = [
    { id: 'WIRE_CUTTING', label: 'Wire Cutting' },
    { id: 'BENDING', label: 'Bending' },
    { id: 'COATING', label: 'Coating' },
    { id: 'QC', label: 'Quality Control' }
];

const SCRAP_TYPES = [
    { id: 'RETURNABLE', label: 'Returnable' },
    { id: 'NON_RETURNABLE', label: 'Non-Returnable' },
    { id: 'REWORK', label: 'Rework Waste' }
];

const ScrapSection = ({ batch, onUpdate }) => {
    const [scraps, setScraps] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        stage: batch?.currentStage || 'WIRE_CUTTING',
        scrapType: 'NON_RETURNABLE',
        scrapWeightKg: '',
        ratePerKg: '',
        remarks: ''
    });

    useEffect(() => {
        if (batch?.id) {
            fetchData();
        }
    }, [batch?.id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [listRes, summaryRes] = await Promise.all([
                axios.get(`${API_URL}/hanger/scrap-entries/by-batch/${batch.id}`, { headers }),
                axios.get(`${API_URL}/hanger/scrap-entries/by-batch/${batch.id}/summary`, { headers })
            ]);

            setScraps(listRes.data);
            setSummary(summaryRes.data);
        } catch (error) {
            console.error('Error fetching scrap data:', error);
            toast.error('Failed to load scrap records');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            await axios.post(`${API_URL}/hanger/scrap-entries`, {
                ...form,
                batchId: batch.id,
                scrapWeightKg: parseFloat(form.scrapWeightKg),
                ratePerKg: parseFloat(form.ratePerKg || 0)
            }, { headers });

            toast.success('Scrap entry recorded');
            setShowForm(false);
            setForm({
                stage: batch.currentStage,
                scrapType: 'NON_RETURNABLE',
                scrapWeightKg: '',
                ratePerKg: '',
                remarks: ''
            });
            fetchData();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error submitting scrap:', error);
            toast.error('Failed to record scrap');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                        <Scale className="w-5 h-5 text-rose-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Scrap Weight</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl font-black text-slate-900">{summary?.totalScrapWeightKg || 0}</h2>
                        <span className="text-xs font-bold text-slate-400">KG</span>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Waste Value</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl font-black text-slate-900">₹{summary?.totalScrapValue?.toLocaleString() || 0}</h2>
                    </div>
                </div>

                <div className="flex items-center justify-end">
                    {!showForm ? (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Record Scrap
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowForm(false)}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* Entry Form */}
            {showForm && (
                <div className="bg-white p-8 rounded-3xl border-2 border-slate-900 shadow-xl animate-in fade-in zoom-in duration-200">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                        <Trash2 className="w-6 h-6 text-rose-600" />
                        New Scrap Entry
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Production Stage</label>
                            <select
                                required
                                value={form.stage}
                                onChange={(e) => setForm({ ...form, stage: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                            >
                                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Scrap Type</label>
                            <select
                                required
                                value={form.scrapType}
                                onChange={(e) => setForm({ ...form, scrapType: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                            >
                                {SCRAP_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Weight (KG)</label>
                            <input
                                type="number"
                                step="any"
                                required
                                value={form.scrapWeightKg}
                                onChange={(e) => setForm({ ...form, scrapWeightKg: e.target.value })}
                                placeholder="0.00"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Rate (per KG)</label>
                            <input
                                type="number"
                                step="any"
                                value={form.ratePerKg}
                                onChange={(e) => setForm({ ...form, ratePerKg: e.target.value })}
                                placeholder="Default is 0.00"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                            />
                        </div>

                        <div className="md:col-span-2 lg:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Remarks</label>
                            <input
                                type="text"
                                value={form.remarks}
                                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                                placeholder="Any details about the reason for scrap..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                            />
                        </div>

                        <div className="md:col-span-2 lg:col-span-1 flex items-end">
                            <button
                                type="submit"
                                className="w-full py-3 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg active:scale-95"
                            >
                                Save Scrap Entry
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* History Table */}
            <div className="space-y-4">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2 px-2">
                    <History className="w-4 h-4 text-slate-400" />
                    Scrap History
                </h3>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[200px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Weight</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Rate</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400 text-xs uppercase tracking-widest font-black">Loading...</td></tr>
                            ) : scraps.length > 0 ? scraps.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-tighter">
                                            {s.stage}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-700">
                                        {s.scrapType}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-xs font-black text-slate-900">{s.scrapWeightKg} KG</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-[11px] font-bold text-slate-400">₹{s.ratePerKg}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-xs font-bold text-emerald-600">₹{s.scrapValue?.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 font-medium italic">
                                        {s.remarks || '—'}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-300">
                                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No scrap records found for this batch</p>
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

export default ScrapSection;
