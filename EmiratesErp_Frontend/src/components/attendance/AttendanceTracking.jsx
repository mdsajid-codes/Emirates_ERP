import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader, AlertCircle, Save, ArrowLeft, RefreshCw } from 'lucide-react';
import SyncPolicyView from './SyncPolicyView';

const AttendanceTracking = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'form' | 'sync'
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [syncingPolicy, setSyncingPolicy] = useState(null);
    const [dropdowns, setDropdowns] = useState({ shifts: [], capturing: [] });

    const initialFormState = {
        policyName: '',
        isDefault: false,
        effectiveFrom: new Date().toISOString().slice(0, 10),
        shiftPolicyId: '',
        capturingPolicyId: '',
        leaveDeductionConfig: {
            deductForMissingSwipes: false,
            deductForWorkHoursShortage: false,
            deductMissingAttendance: false,
            penalizeEarlyGoing: false,
            penalizeLateArrival: false,
        },
    };
    const [formData, setFormData] = useState(initialFormState);

    const API_URL = `${import.meta.env.VITE_API_BASE_URL}/attendance-policies`;

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

    const fetchDropdowns = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const [shiftsRes, capturingRes] = await Promise.all([
                axios.get(`${BASE_URL}/shift-policies`, { headers }),
                axios.get(`${BASE_URL}/attendance-capturing-policies`, { headers }),
            ]);
            setDropdowns({ shifts: shiftsRes.data, capturing: capturingRes.data });
        } catch (err) {
            console.error('Failed to load required policy options:', err);
        }
    };

    useEffect(() => { fetchPolicies(); }, []);

    const handleAdd = () => {
        setEditingPolicy(null);
        setFormData(initialFormState);
        fetchDropdowns();
        setViewMode('form');
    };

    const handleEdit = (policy) => {
        setEditingPolicy(policy);
        setFormData({
            policyName: policy.policyName || '',
            isDefault: policy.isDefault || false,
            effectiveFrom: policy.effectiveFrom ? new Date(policy.effectiveFrom).toISOString().slice(0, 10) : '',
            shiftPolicyId: policy.shiftPolicy?.id || '',
            capturingPolicyId: policy.capturingPolicy?.id || '',
            leaveDeductionConfig: policy.leaveDeductionConfig || initialFormState.leaveDeductionConfig,
        });
        fetchDropdowns();
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
        if (!formData.policyName.trim() || !formData.shiftPolicyId || !formData.capturingPolicyId) {
            setError('Policy Name, Shift Policy, and Capturing Policy are required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (editingPolicy) {
                await axios.put(`${API_URL}/${editingPolicy.id}`, formData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
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

            for (const employeeCode of selectedEmployeeCodes) {
                try {
                    const payload = { attendancePolicyId: policy.id };
                    await axios.put(`${BASE_URL}/time-attendence/${employeeCode}`, payload, { headers: { "Authorization": `Bearer ${token}` } });
                    successCount++;
                } catch (updateErr) {
                    console.error(`Failed to update policy for ${employeeCode}:`, updateErr);
                    errorCount++;
                }
            }

            alert(`Sync complete!\n- ${successCount} employees updated successfully.\n- ${errorCount} updates failed.`);
        } catch (fetchErr) {
            console.error('An unexpected error occurred during the sync process:', fetchErr);
        } 
    };

    return (
        <div className="space-y-4 text-foreground bg-background min-h-full w-full pb-8">
            {viewMode === 'list' ? (
                <>
                    <div className="flex justify-between items-center pb-2 border-b border-border/60">
                        <h2 className="text-xs font-bold text-foreground">Attendance Tracking Policies</h2>
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
                                            <th className="px-4 py-2.5">Shift Policy</th>
                                            <th className="px-4 py-2.5">Capturing Policy</th>
                                            <th className="px-4 py-2.5 text-center">Default</th>
                                            <th className="px-4 py-2.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {policies.length > 0 ? (
                                            policies.map(p => (
                                                <tr key={p.id} className="hover:bg-background-muted/50 transition-colors">
                                                    <td className="px-4 py-2.5 font-bold text-foreground">{p.policyName}</td>
                                                    <td className="px-4 py-2.5 text-foreground-muted">{p.shiftPolicy?.policyName || 'N/A'}</td>
                                                    <td className="px-4 py-2.5 text-foreground-muted">{p.capturingPolicy?.policyName || 'N/A'}</td>
                                                    <td className="px-4 py-2.5 text-center">
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
                                                <td colSpan="5" className="text-center py-10 text-foreground-muted">
                                                    <AlertCircle className="mx-auto h-8 w-8 text-foreground-muted/40 mb-2" />
                                                    <h3 className="text-xs font-bold text-foreground">No tracking policies found</h3>
                                                    <p className="mt-1 text-[11px] text-foreground-muted max-w-xs mx-auto">Establish how attendance is captured and calculated across departments.</p>
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
                                <span>Back to Tracking Policies</span>
                            </button>
                            <h2 className="text-xs font-bold text-foreground">
                                {editingPolicy ? 'Edit Tracking Policy' : 'Create Tracking Policy'}
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
                        <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5">Policy Association</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Policy Name</label>
                                <input 
                                    type="text" 
                                    name="policyName" 
                                    value={formData.policyName} 
                                    onChange={e => setFormData(p => ({ ...p, policyName: e.target.value }))} 
                                    required 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all" 
                                    placeholder="e.g. Executive Tracking Policy" 
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Effective From</label>
                                <input 
                                    type="date" 
                                    name="effectiveFrom" 
                                    value={formData.effectiveFrom} 
                                    onChange={e => setFormData(p => ({ ...p, effectiveFrom: e.target.value }))} 
                                    required 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all font-mono" 
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Shift Policy</label>
                                <select 
                                    name="shiftPolicyId" 
                                    value={formData.shiftPolicyId} 
                                    onChange={e => setFormData(p => ({ ...p, shiftPolicyId: e.target.value }))} 
                                    required 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                                >
                                    <option value="">Select Shift Policy</option>
                                    {dropdowns.shifts.map(p => <option key={p.id} value={p.id}>{p.policyName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Capturing Policy</label>
                                <select 
                                    name="capturingPolicyId" 
                                    value={formData.capturingPolicyId} 
                                    onChange={e => setFormData(p => ({ ...p, capturingPolicyId: e.target.value }))} 
                                    required 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                                >
                                    <option value="">Select Capturing Policy</option>
                                    {dropdowns.capturing.map(p => <option key={p.id} value={p.id}>{p.policyName}</option>)}
                                </select>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-4 pt-1">
                                <label className="inline-flex items-center cursor-pointer gap-2">
                                    <input 
                                        type="checkbox" 
                                        name="isDefault" 
                                        checked={formData.isDefault} 
                                        onChange={e => setFormData(p => ({ ...p, isDefault: e.target.checked }))} 
                                        className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary accent-primary" 
                                    />
                                    <span className="text-xs text-foreground font-semibold">Set as Default Tracking Policy</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Leave Deduction Rules Card */}
                    <div className="bg-card p-3.5 rounded-xl shadow-xs border border-border space-y-3">
                        <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5">Leave Deduction Rules</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.keys(formData.leaveDeductionConfig).map(key => (
                                <label key={key} className="inline-flex items-center gap-2 cursor-pointer p-2 hover:bg-background-muted/50 rounded-lg border border-border/60 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        name={key} 
                                        checked={formData.leaveDeductionConfig[key]} 
                                        onChange={e => setFormData(p => ({ ...p, leaveDeductionConfig: { ...p.leaveDeductionConfig, [key]: e.target.checked } }))} 
                                        className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary accent-primary" 
                                    />
                                    <span className="text-xs text-foreground font-medium capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                </label>
                            ))}
                        </div>
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
};

export default AttendanceTracking;
