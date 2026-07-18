import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Loader2, Pencil, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsBusinessUnitsSettingsTab = () => {
    const [businessUnits, setBusinessUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [form, setForm] = useState({ name: '', code: '', description: '', isActive: true });
    const [editingBu, setEditingBu] = useState(null);

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchBusinessUnits = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/ats/business-units`, { headers });
            setBusinessUnits(res.data || []);
        } catch (e) {
            console.error("Failed to load business units", e);
            toast.error("Failed to load business units list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusinessUnits();
    }, []);

    const handleAddBusinessUnit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post(`${API_URL}/ats/business-units`, form, { headers });
            toast.success("Business Unit added.");
            setForm({ name: '', code: '', description: '', isActive: true });
            fetchBusinessUnits();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add business unit.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateBusinessUnit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.put(`${API_URL}/ats/business-units/${editingBu.id}`, editingBu, { headers });
            toast.success("Business Unit updated.");
            setEditingBu(null);
            fetchBusinessUnits();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update business unit.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteBusinessUnit = async (id) => {
        if (!window.confirm("Are you sure? This will hard delete the Business Unit.")) return;
        try {
            await axios.delete(`${API_URL}/ats/business-units/${id}`, { headers });
            toast.success("Business Unit deleted.");
            fetchBusinessUnits();
        } catch (e) {
            toast.error("Failed to delete business unit. It may be in use.");
        }
    };

    const handleToggleActiveBusinessUnit = async (id) => {
        try {
            await axios.patch(`${API_URL}/ats/business-units/${id}/toggle-active`, {}, { headers });
            toast.success("Business Unit status toggled.");
            fetchBusinessUnits();
        } catch (e) {
            toast.error("Failed to toggle business unit status.");
        }
    };

    if (loading && businessUnits.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="bg-card border border-border rounded-theme p-5 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-foreground">Add new Business Unit</h3>
                <form onSubmit={handleAddBusinessUnit} className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-foreground-muted">Business Unit Name *</label>
                        <input 
                            required
                            value={form.name}
                            onChange={(e) => setForm({...form, name: e.target.value})}
                            className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            placeholder="e.g. Engineering, Sales"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-foreground-muted">Code</label>
                        <input 
                            value={form.code}
                            onChange={(e) => setForm({...form, code: e.target.value})}
                            className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground font-mono"
                            placeholder="e.g. ENG, SLS"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-foreground-muted">Description</label>
                        <textarea 
                            value={form.description}
                            onChange={(e) => setForm({...form, description: e.target.value})}
                            className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            rows="3"
                            placeholder="Optional division details..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox"
                            id="isActive"
                            checked={form.isActive}
                            onChange={(e) => setForm({...form, isActive: e.target.checked})}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="isActive" className="text-xs font-bold text-foreground-muted cursor-pointer">Active by default</label>
                    </div>
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-theme hover:bg-primary/90 transition-colors shadow disabled:opacity-50"
                    >
                        {submitting && <Loader2 className="animate-spin h-3 w-3" />}
                        <Plus className="h-4 w-4" />
                        <span>Add Business Unit</span>
                    </button>
                </form>
            </div>

            {/* List/Display Section */}
            <div className="lg:col-span-2 bg-card border border-border rounded-theme p-5 shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
                <h3 className="text-lg font-bold text-foreground mb-4">Master list of Business Units</h3>
                <div className="overflow-y-auto flex-1 divide-y divide-border">
                    {businessUnits.length === 0 ? (
                        <p className="text-xs text-foreground-muted py-4">No business units recorded.</p>
                    ) : (
                        businessUnits.map(bu => (
                            <div key={bu.id} className="py-3 border-b border-border last:border-0">
                                {editingBu && editingBu.id === bu.id ? (
                                    <form onSubmit={handleUpdateBusinessUnit} className="space-y-3 bg-background-muted/40 p-3 rounded-theme border border-border">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-foreground-muted uppercase">Name *</label>
                                                <input 
                                                    required
                                                    value={editingBu.name}
                                                    onChange={(e) => setEditingBu({...editingBu, name: e.target.value})}
                                                    className="w-full mt-1 px-3 py-1.5 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-foreground-muted uppercase">Code</label>
                                                <input 
                                                    value={editingBu.code || ''}
                                                    onChange={(e) => setEditingBu({...editingBu, code: e.target.value})}
                                                    className="w-full mt-1 px-3 py-1.5 text-xs bg-background border border-border rounded-theme outline-none text-foreground font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-foreground-muted uppercase">Description</label>
                                            <textarea 
                                                value={editingBu.description || ''}
                                                onChange={(e) => setEditingBu({...editingBu, description: e.target.value})}
                                                className="w-full mt-1 px-3 py-1.5 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                                rows="2"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox"
                                                    id={`edit-active-${bu.id}`}
                                                    checked={editingBu.isActive}
                                                    onChange={(e) => setEditingBu({...editingBu, isActive: e.target.checked})}
                                                    className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <label htmlFor={`edit-active-${bu.id}`} className="text-[11px] font-bold text-foreground-muted cursor-pointer">Active</label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setEditingBu(null)}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold border border-border text-foreground hover:bg-background rounded-theme transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                    <span>Cancel</span>
                                                </button>
                                                <button 
                                                    type="submit" 
                                                    disabled={submitting}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold bg-primary text-primary-foreground rounded-theme hover:bg-primary/90 transition-colors shadow disabled:opacity-50"
                                                >
                                                    <Check className="h-3 w-3" />
                                                    <span>Save</span>
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-bold text-foreground text-sm">{bu.name}</h4>
                                                {bu.code && (
                                                    <span className="text-[10px] font-bold text-foreground-muted font-mono bg-background-muted px-2 py-0.5 rounded border border-border/60">{bu.code}</span>
                                                )}
                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${bu.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                                    {bu.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            {bu.description && (
                                                <p className="text-xs text-foreground-muted mt-1 max-w-lg leading-relaxed">{bu.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button 
                                                onClick={() => handleToggleActiveBusinessUnit(bu.id)}
                                                className={`px-2 py-1 text-[10px] font-extrabold rounded-theme transition-all border ${
                                                    bu.isActive 
                                                        ? 'bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 border-rose-500/20' 
                                                        : 'bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20'
                                                }`}
                                            >
                                                {bu.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button 
                                                onClick={() => setEditingBu({ ...bu })}
                                                className="p-1.5 hover:bg-background-muted border border-border text-foreground-muted hover:text-foreground rounded-theme transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteBusinessUnit(bu.id)}
                                                className="p-1.5 hover:bg-background-muted border border-border text-foreground-muted hover:text-destructive rounded-theme transition-colors"
                                                title="Hard Delete"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AtsBusinessUnitsSettingsTab;
