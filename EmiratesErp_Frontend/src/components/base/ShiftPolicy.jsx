import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLayout';
import { Plus, Edit, Trash2, Loader, AlertCircle, Save, ArrowLeft, RefreshCw } from 'lucide-react';
import axios from 'axios';
import SyncPolicyView from '../attendance/SyncPolicyView';

const ShiftPolicy = ({ embedded = false }) => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'form' | 'sync'
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [syncingPolicy, setSyncingPolicy] = useState(null);

    const [formData, setFormData] = useState({
        policyName: '',
        shiftStartTime: '09:30',
        shiftEndTime: '18:30',
        isDefault: false,
        description: ''
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchPolicies = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/shift-policies`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setPolicies(response.data);
        } catch (err) {
            setError('Failed to fetch shift policies. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, [API_URL]);

    const handleAdd = () => {
        setEditingPolicy(null);
        setFormData({
            policyName: '',
            shiftStartTime: '09:30',
            shiftEndTime: '18:30',
            isDefault: false,
            description: ''
        });
        setViewMode('form');
    };

    const handleEdit = (policy) => {
        setEditingPolicy(policy);
        setFormData({
            policyName: policy.policyName || '',
            shiftStartTime: policy.shiftStartTime || '09:30',
            shiftEndTime: policy.shiftEndTime || '18:30',
            isDefault: policy.isDefault || false,
            description: policy.description || ''
        });
        setViewMode('form');
    };

    const handleDelete = async (policyId, policyName) => {
        if (window.confirm(`Are you sure you want to delete the policy "${policyName}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/shift-policies/${policyId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
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
                await axios.put(`${API_URL}/shift-policies/${editingPolicy.id}`, formData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/shift-policies`, formData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            }
            setViewMode('list');
            fetchPolicies();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save policy. The name might already exist.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleOpenSyncModal = (policy) => {
        setSyncingPolicy(policy);
        setViewMode('sync');
    };

    const handleConfirmSync = async (policy, selectedEmployeeCodes) => {
        if (selectedEmployeeCodes.length === 0) {
            alert("No employees selected.");
            return;
        }

        setError('');
        let successCount = 0;
        let errorCount = 0;

        try {
            const token = localStorage.getItem('token');
            const BASE_URL = import.meta.env.VITE_API_BASE_URL;

            const attendancePoliciesRes = await axios.get(`${BASE_URL}/attendance-policies`, { headers: { "Authorization": `Bearer ${token}` } });
            const attendancePolicyToSync = attendancePoliciesRes.data.find(p => p.shiftPolicy?.id === policy.id && p.isDefault) 
                                          || attendancePoliciesRes.data.find(p => p.shiftPolicy?.id === policy.id);

            if (!attendancePolicyToSync) {
                alert(`No Attendance Policy is configured to use the shift policy "${policy.policyName}". Please create or update an Attendance Policy first.`);
                return;
            }

            for (const employeeCode of selectedEmployeeCodes) {
                try {
                    const payload = { attendancePolicyId: attendancePolicyToSync.id };
                    await axios.put(`${BASE_URL}/time-attendence/${employeeCode}`, payload, { headers: { "Authorization": `Bearer ${token}` } });
                    successCount++;
                } catch (updateErr) {
                    console.error(`Failed to update policy for ${employeeCode}:`, updateErr);
                    errorCount++;
                }
            }
            alert(`Sync complete using Attendance Policy "${attendancePolicyToSync.policyName}"!\n- ${successCount} employees updated successfully.\n- ${errorCount} updates failed.`);
        } catch (err) {
            console.error('An unexpected error occurred during the sync process:', err);
        }
    };

    const content = (
        <div className={`${embedded ? '' : 'p-4 md:p-6'} space-y-4 text-foreground bg-background min-h-full w-full pb-8`}>
            {viewMode === 'list' ? (
                <>
                    {!embedded && (
                        <div className="flex justify-between items-center pb-2 border-b border-border/60">
                            <h2 className="text-xs font-bold text-foreground">Shift Policies</h2>
                            <button
                                onClick={handleAdd}
                                className="px-3 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-all shadow-2xs flex items-center gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" /> New Policy
                            </button>
                        </div>
                    )}

                    {embedded && (
                        <div className="flex justify-between items-center pb-2 border-b border-border/60">
                            <h2 className="text-xs font-bold text-foreground">Shift Policies</h2>
                            <button
                                onClick={handleAdd}
                                className="px-3 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-all shadow-2xs flex items-center gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" /> New Policy
                            </button>
                        </div>
                    )}

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
                                            <th className="px-4 py-2.5">Shift Time</th>
                                            <th className="px-4 py-2.5">Default</th>
                                            <th className="px-4 py-2.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {policies.length > 0 ? (
                                            policies.map(p => (
                                                <tr key={p.id} className="hover:bg-background-muted/50 transition-colors">
                                                    <td className="px-4 py-2.5 font-bold text-foreground">{p.policyName}</td>
                                                    <td className="px-4 py-2.5">
                                                        <span className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-[11px] font-mono font-bold">
                                                            {p.shiftStartTime} - {p.shiftEndTime}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${p.isDefault ? 'bg-primary/10 text-primary border-primary/20' : 'bg-background-muted text-foreground-muted border-border'}`}>
                                                            {p.isDefault ? 'PRIMARY' : 'SECONDARY'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right">
                                                        <div className="flex items-center justify-end gap-1"> 
                                                            <button 
                                                                onClick={() => handleOpenSyncModal(p)} 
                                                                className="p-1 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-lg transition-colors" 
                                                                title="Sync to employees" 
                                                            >
                                                                <RefreshCw className="h-3.5 w-3.5" />
                                                            </button>
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
                                                    <h3 className="text-xs font-bold text-foreground">No shift policies found</h3>
                                                    <p className="mt-1 text-[11px] text-foreground-muted max-w-xs mx-auto">Configure your first shift policy to begin tracking employee attendance cycles.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            ) : viewMode === 'form' ? (
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
                                <span>Back to Shift Policies</span>
                            </button>
                            <h2 className="text-xs font-bold text-foreground">
                                {editingPolicy ? 'Edit Shift Policy' : 'Create Shift Policy'}
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

                    {/* Policy Details Card */}
                    <div className="bg-card p-3.5 rounded-xl shadow-xs border border-border space-y-3">
                        <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5">Policy Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            <div className="sm:col-span-2 lg:col-span-1">
                                <label htmlFor="policyName" className="block text-[11px] font-semibold text-foreground-muted mb-1">Policy Name</label>
                                <input 
                                    id="policyName" 
                                    name="policyName" 
                                    value={formData.policyName} 
                                    onChange={(e) => setFormData(p => ({ ...p, policyName: e.target.value }))} 
                                    required 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all" 
                                    placeholder="e.g. Standard Morning Shift" 
                                />
                            </div>
                            <div>
                                <label htmlFor="shiftStartTime" className="block text-[11px] font-semibold text-foreground-muted mb-1">Shift Start Time</label>
                                <input 
                                    id="shiftStartTime" 
                                    name="shiftStartTime" 
                                    type="time" 
                                    value={formData.shiftStartTime} 
                                    onChange={(e) => setFormData(p => ({ ...p, shiftStartTime: e.target.value }))} 
                                    required 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all font-mono" 
                                />
                            </div>
                            <div>
                                <label htmlFor="shiftEndTime" className="block text-[11px] font-semibold text-foreground-muted mb-1">Shift End Time</label>
                                <input 
                                    id="shiftEndTime" 
                                    name="shiftEndTime" 
                                    type="time" 
                                    value={formData.shiftEndTime} 
                                    onChange={(e) => setFormData(p => ({ ...p, shiftEndTime: e.target.value }))} 
                                    required 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all font-mono" 
                                />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3 pt-1">
                                <label className="inline-flex items-center cursor-pointer gap-2">
                                    <input
                                        type="checkbox"
                                        name="isDefault"
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData(p => ({ ...p, isDefault: e.target.checked }))}
                                        className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary accent-primary"
                                    />
                                    <span className="text-xs text-foreground font-semibold">Set as Default Policy</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="bg-card p-3.5 rounded-xl shadow-xs border border-border space-y-3">
                        <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5">Description</h3>
                        <textarea 
                            id="description" 
                            name="description" 
                            value={formData.description} 
                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} 
                            rows="3" 
                            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all resize-none" 
                            placeholder="Optional shift notes or details..."
                        />
                    </div>
                </form>
            ) : (
                /* In-Page Sync View */
                <SyncPolicyView 
                    policy={syncingPolicy} 
                    onBack={() => setViewMode('list')} 
                    onSync={handleConfirmSync} 
                />
            )}
        </div>
    );

    if (embedded) {
        return content;
    }

    return (
        <DashboardLayout>{content}</DashboardLayout>
    );
};

export default ShiftPolicy;
