import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader, AlertCircle, Save, ArrowLeft } from 'lucide-react';

const AttendanceCapturingPolicy = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
    const [editingPolicy, setEditingPolicy] = useState(null);

    const initialFormState = {
        policyName: '',
        graceTimeMinutes: 0,
        halfDayThresholdMinutes: 0,
        allowMultiplePunches: false,
        lateMarkRules: '',
    };
    const [formData, setFormData] = useState(initialFormState);

    const API_URL = `${import.meta.env.VITE_API_BASE_URL}/attendance-capturing-policies`;

    const fetchPolicies = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(API_URL, { headers: { "Authorization": `Bearer ${token}` } });
            setPolicies(response.data);
        } catch (err) {
            setError('Failed to fetch policies.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPolicies(); }, []);

    const handleAdd = () => {
        setEditingPolicy(null);
        setFormData(initialFormState);
        setViewMode('form');
    };

    const handleEdit = (policy) => {
        setEditingPolicy(policy);
        setFormData({
            policyName: policy.policyName || '',
            graceTimeMinutes: policy.graceTimeMinutes || 0,
            halfDayThresholdMinutes: policy.halfDayThresholdMinutes || 0,
            allowMultiplePunches: policy.allowMultiplePunches || false,
            lateMarkRules: policy.lateMarkRules || '',
        });
        setViewMode('form');
    };

    const handleDelete = async (policyId, policyName) => {
        if (window.confirm(`Are you sure you want to delete the policy "${policyName}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/${policyId}`, { headers: { "Authorization": `Bearer ${token}` } });
                setPolicies(policies.filter(p => p.id !== policyId));
            } catch (err) {
                console.error('Failed to delete policy:', err);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.policyName.trim()) {
            setError('Policy Name is required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (editingPolicy) {
                await axios.put(`${API_URL}/${editingPolicy.id}`, formData, { headers: { "Authorization": `Bearer ${token}` } });
            } else {
                await axios.post(API_URL, formData, { headers: { "Authorization": `Bearer ${token}` } });
            }
            setViewMode('list');
            fetchPolicies();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save policy.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4 text-foreground bg-background min-h-full w-full pb-8">
            {viewMode === 'list' ? (
                <>
                    <div className="flex justify-between items-center pb-2 border-b border-border/60">
                        <h2 className="text-xs font-bold text-foreground">Attendance Capturing Policies</h2>
                        <button 
                            onClick={handleAdd} 
                            className="px-3 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-all shadow-2xs flex items-center gap-1.5"
                        >
                            <Plus className="h-3.5 w-3.5" /> New Policy
                        </button>
                    </div>

                    {error && (
                        <div className="bg-error/10 border border-error/20 text-error px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 font-medium">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="bg-card rounded-2xl shadow-xs border border-border overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center h-48">
                                <Loader className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-background-muted/70 border-b border-border text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                                        <tr>
                                            <th className="px-4 py-2.5">Policy Name</th>
                                            <th className="px-4 py-2.5 text-center">Grace Time</th>
                                            <th className="px-4 py-2.5 text-center">Multiple Punches</th>
                                            <th className="px-4 py-2.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {policies.length > 0 ? (
                                            policies.map(p => (
                                                <tr key={p.id} className="hover:bg-background-muted/50 transition-colors">
                                                    <td className="px-4 py-2.5 font-bold text-foreground">{p.policyName}</td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-md text-[11px] font-mono font-bold">
                                                            {p.graceTimeMinutes} min
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${p.allowMultiplePunches ? 'bg-primary/10 text-primary border-primary/20' : 'bg-background-muted text-foreground-muted border-border'}`}>
                                                            {p.allowMultiplePunches ? 'YES' : 'NO'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button 
                                                                onClick={() => handleEdit(p)} 
                                                                className="p-1 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-lg transition-colors" 
                                                                title="Edit Policy"
                                                            >
                                                                <Edit className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(p.id, p.policyName)} 
                                                                className="p-1 text-foreground-muted hover:text-red-600 hover:bg-background-muted rounded-lg transition-colors" 
                                                                title="Delete Policy"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-10 text-foreground-muted">
                                                    <AlertCircle className="mx-auto h-8 w-8 text-foreground-muted/40 mb-2" />
                                                    <h3 className="text-xs font-bold text-foreground">No capturing policies found</h3>
                                                    <p className="mt-1 text-[11px] text-foreground-muted max-w-xs mx-auto">Define how punches are detected, grace periods for late arrivals, and thresholds.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* In-Page Form View */
                <form onSubmit={handleSave} className="w-full space-y-4">
                    {/* Header bar with Back button */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                        <div className="flex items-center gap-2.5">
                            <button 
                                type="button"
                                onClick={() => setViewMode('list')} 
                                className="p-1.5 hover:bg-background-muted rounded-lg border border-border flex items-center gap-1.5 text-xs font-semibold transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Back to Capturing Policies</span>
                            </button>
                            <h2 className="text-xs font-bold text-foreground">
                                {editingPolicy ? 'Edit Capturing Policy' : 'Create Capturing Policy'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                type="button" 
                                onClick={() => setViewMode('list')} 
                                className="px-3 py-1 text-xs font-semibold text-foreground-muted hover:bg-background-muted border border-border rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="px-3.5 py-1 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {saving ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                                {saving ? 'Saving...' : 'Save Policy'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-error/10 border border-error/20 text-error px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 font-medium">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Policy Configuration Card */}
                    <div className="bg-card p-3.5 rounded-xl shadow-xs border border-border space-y-3">
                        <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5">Policy Configuration</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            <div className="sm:col-span-2 lg:col-span-1">
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Policy Name</label>
                                <input 
                                    type="text" 
                                    name="policyName" 
                                    value={formData.policyName} 
                                    onChange={e => setFormData(p => ({ ...p, policyName: e.target.value }))} 
                                    required 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all" 
                                    placeholder="e.g. Standard Biometric Capturing" 
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Grace Time (Minutes)</label>
                                <input 
                                    type="number" 
                                    name="graceTimeMinutes" 
                                    value={formData.graceTimeMinutes} 
                                    onChange={e => setFormData(p => ({ ...p, graceTimeMinutes: parseInt(e.target.value || 0) }))} 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all font-mono" 
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Half-Day Threshold (Minutes)</label>
                                <input 
                                    type="number" 
                                    name="halfDayThresholdMinutes" 
                                    value={formData.halfDayThresholdMinutes} 
                                    onChange={e => setFormData(p => ({ ...p, halfDayThresholdMinutes: parseInt(e.target.value || 0) }))} 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all font-mono" 
                                />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3">
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Late Mark Rules</label>
                                <input 
                                    type="text" 
                                    name="lateMarkRules" 
                                    value={formData.lateMarkRules} 
                                    onChange={e => setFormData(p => ({ ...p, lateMarkRules: e.target.value }))} 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all" 
                                    placeholder="e.g., 3 lates = 1 half-day deduction" 
                                />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3 pt-1">
                                <label className="inline-flex items-center cursor-pointer gap-2">
                                    <input 
                                        type="checkbox" 
                                        name="allowMultiplePunches" 
                                        checked={formData.allowMultiplePunches} 
                                        onChange={e => setFormData(p => ({ ...p, allowMultiplePunches: e.target.checked }))} 
                                        className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary accent-primary" 
                                    />
                                    <span className="text-xs text-foreground font-semibold">Allow Multiple Punches Per Day</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AttendanceCapturingPolicy;