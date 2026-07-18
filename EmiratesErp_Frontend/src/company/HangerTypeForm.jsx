import React, { useState, useEffect } from 'react';
import { Settings, Check, X, Shield, ArrowLeft, Save } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import CompanyHubLayout from '../components/CompanyHubLayout';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const HangerTypeForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(isEditMode);
    const [formData, setFormData] = useState({
        typeName: 'ADULT',
        unitWeightGrams: 50.0,
        standardWidthCm: 42.0,
        standardHookCm: 4.5,
        toleranceMm: 1.0,
        maxDefectPct: 2.0,
        minQcSampleSize: 300,
        defaultBundleSize: 100,
        minLoadTestKg: 3.0,
        standardWireGaugeMm: 1.6,
        description: '',
        standardCycleTimeSec: 2.5,
        shoulderWidthToleranceMm: 2.0,
        hookSizeToleranceMm: 1.0,
        finishedGoodId: null
    });
    const [finishedGoods, setFinishedGoods] = useState([]);

    useEffect(() => {
        fetchFinishedGoods();
        if (isEditMode) {
            fetchHangerType();
        }
    }, [id]);

    const fetchFinishedGoods = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/production/finished-goods`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFinishedGoods(res.data || []);
        } catch (err) {
            console.error('Failed to load finished goods', err);
        }
    };

    const fetchHangerType = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/hanger/types/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData(response.data);
        } catch (error) {
            console.error("Error fetching hanger type", error);
            toast.error("Failed to load hanger type details");
            navigate('/hanger-settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (isEditMode) {
                await axios.put(`${API_URL}/hanger/types/${id}`, formData, config);
                toast.success("Hanger type updated successfully");
            } else {
                await axios.post(`${API_URL}/hanger/types`, formData, config);
                toast.success("Hanger type created successfully");
            }
            navigate('/hanger-settings');
        } catch (error) {
            console.error("Error saving hanger type", error);
            toast.error(error.response?.data?.message || "Failed to save hanger type");
        }
    };

    if (loading) {
        return (
            <CompanyHubLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </CompanyHubLayout>
        );
    }

    return (
        <CompanyHubLayout>
            <div className="flex flex-col h-full bg-background text-foreground">
                <header className="bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/hanger-settings')} className="p-2 hover:bg-background-muted rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold">{isEditMode ? 'Edit Hanger Specification' : 'New Hanger Master Record'}</h1>
                            <p className="text-xs text-foreground-muted">Configure technical standards for hanger manufacturing</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-slate-50/30">
                    <form onSubmit={handleSubmit} className="w-full space-y-6">
                        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-border bg-background-muted/30">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                                    <Settings className="h-4 w-4" /> Basic Information
                                </h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 uppercase tracking-wide opacity-70">Type Name</label>
                                    <select
                                        value={formData.typeName}
                                        onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50"
                                        disabled={isEditMode}
                                    >
                                        <option value="ADULT">ADULT</option>
                                        <option value="CHILD">CHILD</option>
                                        <option value="HEAVY_DUTY">HEAVY_DUTY</option>
                                    </select>
                                    {isEditMode && <p className="text-[10px] text-foreground-muted mt-1 uppercase">Standard type cannot be changed after creation</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 uppercase tracking-wide opacity-70">Linked Finished Good</label>
                                    <select
                                        value={formData.finishedGoodId ?? ''}
                                        onChange={(e) => setFormData({ ...formData, finishedGoodId: e.target.value ? Number(e.target.value) : null })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="">-- Select Finished Good (Optional) --</option>
                                        {finishedGoods.map(fg => (
                                            <option key={fg.id} value={fg.id}>
                                                [{fg.itemCode}] {fg.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-foreground-muted mt-1">Links this hanger type to FG stock tracking</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 uppercase tracking-wide opacity-70">Unit Weight (grams)</label>
                                    <input
                                        type="number" step="0.01" required
                                        value={formData.unitWeightGrams}
                                        onChange={(e) => setFormData({ ...formData, unitWeightGrams: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 uppercase tracking-wide opacity-70">Standard Width (cm)</label>
                                    <input
                                        type="number" step="0.1" required
                                        value={formData.standardWidthCm}
                                        onChange={(e) => setFormData({ ...formData, standardWidthCm: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 uppercase tracking-wide opacity-70">Standard Hook (cm)</label>
                                    <input
                                        type="number" step="0.1" required
                                        value={formData.standardHookCm}
                                        onChange={(e) => setFormData({ ...formData, standardHookCm: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 uppercase tracking-wide opacity-70">Wire Gauge (mm)</label>
                                    <input
                                        type="number" step="0.1"
                                        value={formData.standardWireGaugeMm}
                                        onChange={(e) => setFormData({ ...formData, standardWireGaugeMm: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 uppercase tracking-wide opacity-70">Default Bundle Size</label>
                                    <input
                                        type="number"
                                        value={formData.defaultBundleSize}
                                        onChange={(e) => setFormData({ ...formData, defaultBundleSize: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-border bg-primary/5">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                                    <Shield className="h-4 w-4" /> Qualty Control & Performance
                                </h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 uppercase tracking-wide opacity-70">Tolerance (mm)</label>
                                    <input type="number" step="0.1" value={formData.toleranceMm} onChange={(e) => setFormData({ ...formData, toleranceMm: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 uppercase tracking-wide opacity-70">Max Defect %</label>
                                    <input type="number" step="0.1" value={formData.maxDefectPct} onChange={(e) => setFormData({ ...formData, maxDefectPct: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 uppercase tracking-wide opacity-70">Min Load (kg)</label>
                                    <input type="number" step="0.1" value={formData.minLoadTestKg} onChange={(e) => setFormData({ ...formData, minLoadTestKg: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 uppercase tracking-wide opacity-70">Std Cycle Time (s)</label>
                                    <input type="number" step="0.01" value={formData.standardCycleTimeSec} onChange={(e) => setFormData({ ...formData, standardCycleTimeSec: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 uppercase tracking-wide opacity-70">Shoulder Tol. (mm)</label>
                                    <input type="number" step="0.1" value={formData.shoulderWidthToleranceMm} onChange={(e) => setFormData({ ...formData, shoulderWidthToleranceMm: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 uppercase tracking-wide opacity-70">Hook Tol. (mm)</label>
                                    <input type="number" step="0.1" value={formData.hookSizeToleranceMm} onChange={(e) => setFormData({ ...formData, hookSizeToleranceMm: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-border bg-background-muted/30">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Additional Details</h2>
                            </div>
                            <div className="p-6">
                                <label className="block text-sm font-semibold mb-1.5 uppercase tracking-wide opacity-70">Internal Description</label>
                                <textarea
                                    rows="4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 placeholder:opacity-50"
                                    placeholder="Add any specific manufacturing requirements or quality notes here..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pb-8">
                            <button type="button" onClick={() => navigate('/hanger-settings')} className="px-8 py-3 font-bold text-foreground-muted hover:text-foreground transition-colors uppercase text-xs tracking-widest bg-card border border-border rounded-xl">
                                Cancel
                            </button>
                            <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all uppercase text-xs tracking-widest flex items-center gap-2">
                                <Save className="h-4 w-4" /> {isEditMode ? 'Update Record' : 'Create Record'}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </CompanyHubLayout>
    );
};

export default HangerTypeForm;
