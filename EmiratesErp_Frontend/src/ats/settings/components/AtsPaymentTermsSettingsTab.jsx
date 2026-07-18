import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Loader2, Pencil, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsPaymentTermsSettingsTab = () => {
    const [paymentTerms, setPaymentTerms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [form, setForm] = useState({ name: '', description: '', days: '', isActive: true });
    const [editingPt, setEditingPt] = useState(null);

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchPaymentTerms = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/ats/payment-terms`, { headers });
            setPaymentTerms(res.data || []);
        } catch (e) {
            console.error("Failed to load payment terms", e);
            toast.error("Failed to load payment terms list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentTerms();
    }, []);

    const handleAddPaymentTerm = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                days: form.days ? parseInt(form.days) : null
            };
            await axios.post(`${API_URL}/ats/payment-terms`, payload, { headers });
            toast.success("Payment Term added.");
            setForm({ name: '', description: '', days: '', isActive: true });
            fetchPaymentTerms();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add payment term.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdatePaymentTerm = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...editingPt,
                days: editingPt.days ? parseInt(editingPt.days) : null
            };
            await axios.put(`${API_URL}/ats/payment-terms/${editingPt.id}`, payload, { headers });
            toast.success("Payment Term updated.");
            setEditingPt(null);
            fetchPaymentTerms();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update payment term.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePaymentTerm = async (id) => {
        if (!window.confirm("Are you sure? This will hard delete the Payment Term.")) return;
        try {
            await axios.delete(`${API_URL}/ats/payment-terms/${id}`, { headers });
            toast.success("Payment Term deleted.");
            fetchPaymentTerms();
        } catch (e) {
            toast.error("Failed to delete payment term. It may be in use.");
        }
    };

    const handleToggleActivePaymentTerm = async (id) => {
        try {
            await axios.patch(`${API_URL}/ats/payment-terms/${id}/toggle-active`, {}, { headers });
            toast.success("Payment Term status toggled.");
            fetchPaymentTerms();
        } catch (e) {
            toast.error("Failed to toggle payment term status.");
        }
    };

    if (loading && paymentTerms.length === 0) {
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
                <h3 className="text-lg font-bold text-foreground">Add new Payment Term</h3>
                <form onSubmit={handleAddPaymentTerm} className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-foreground-muted">Payment Term Name *</label>
                        <input 
                            required
                            value={form.name}
                            onChange={(e) => setForm({...form, name: e.target.value})}
                            className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            placeholder="e.g. Net 30, Due on Receipt"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-foreground-muted">Days (Net Terms Count) *</label>
                        <input 
                            type="number"
                            required
                            value={form.days}
                            onChange={(e) => setForm({...form, days: e.target.value})}
                            className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            placeholder="e.g. 30"
                            min="0"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-foreground-muted">Description</label>
                        <textarea 
                            value={form.description}
                            onChange={(e) => setForm({...form, description: e.target.value})}
                            className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            rows="3"
                            placeholder="e.g. Payment due within 30 days of invoice date"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox"
                            id="ptIsActive"
                            checked={form.isActive}
                            onChange={(e) => setForm({...form, isActive: e.target.checked})}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="ptIsActive" className="text-xs font-bold text-foreground-muted cursor-pointer">Active by default</label>
                    </div>
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-theme hover:bg-primary/90 transition-colors shadow disabled:opacity-50"
                    >
                        {submitting && <Loader2 className="animate-spin h-3 w-3" />}
                        <Plus className="h-4 w-4" />
                        <span>Add Payment Term</span>
                    </button>
                </form>
            </div>

            {/* List/Display Section */}
            <div className="lg:col-span-2 bg-card border border-border rounded-theme p-5 shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
                <h3 className="text-lg font-bold text-foreground mb-4">Master list of Payment Terms</h3>
                <div className="overflow-y-auto flex-1 divide-y divide-border">
                    {paymentTerms.length === 0 ? (
                        <p className="text-xs text-foreground-muted py-4">No payment terms recorded.</p>
                    ) : (
                        paymentTerms.map(pt => (
                            <div key={pt.id} className="py-3 border-b border-border last:border-0">
                                {editingPt && editingPt.id === pt.id ? (
                                    <form onSubmit={handleUpdatePaymentTerm} className="space-y-3 bg-background-muted/40 p-3 rounded-theme border border-border">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-foreground-muted uppercase">Name *</label>
                                                <input 
                                                    required
                                                    value={editingPt.name}
                                                    onChange={(e) => setEditingPt({...editingPt, name: e.target.value})}
                                                    className="w-full mt-1 px-3 py-1.5 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-foreground-muted uppercase">Days *</label>
                                                <input 
                                                    type="number"
                                                    required
                                                    value={editingPt.days}
                                                    onChange={(e) => setEditingPt({...editingPt, days: e.target.value})}
                                                    className="w-full mt-1 px-3 py-1.5 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-foreground-muted uppercase">Description</label>
                                            <textarea 
                                                value={editingPt.description || ''}
                                                onChange={(e) => setEditingPt({...editingPt, description: e.target.value})}
                                                className="w-full mt-1 px-3 py-1.5 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                                rows="2"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox"
                                                    id={`edit-pt-active-${pt.id}`}
                                                    checked={editingPt.isActive}
                                                    onChange={(e) => setEditingPt({...editingPt, isActive: e.target.checked})}
                                                    className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <label htmlFor={`edit-pt-active-${pt.id}`} className="text-[11px] font-bold text-foreground-muted cursor-pointer">Active</label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setEditingPt(null)}
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
                                                <h4 className="font-bold text-foreground text-sm">{pt.name}</h4>
                                                <span className="text-[10px] font-bold text-foreground-muted font-mono bg-background-muted px-2 py-0.5 rounded border border-border/60">{pt.days} Days</span>
                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${pt.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                                    {pt.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            {pt.description && (
                                                <p className="text-xs text-foreground-muted mt-1 max-w-lg leading-relaxed">{pt.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button 
                                                onClick={() => handleToggleActivePaymentTerm(pt.id)}
                                                className={`px-2 py-1 text-[10px] font-extrabold rounded-theme transition-all border ${
                                                    pt.isActive 
                                                        ? 'bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 border-rose-500/20' 
                                                        : 'bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20'
                                                }`}
                                            >
                                                {pt.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button 
                                                onClick={() => setEditingPt({ ...pt })}
                                                className="p-1.5 hover:bg-background-muted border border-border text-foreground-muted hover:text-foreground rounded-theme transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeletePaymentTerm(pt.id)}
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

export default AtsPaymentTermsSettingsTab;
