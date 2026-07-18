import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader, AlertCircle, X, RefreshCw, Search } from 'lucide-react';
import SyncPolicyModal from './SyncPolicyModal';

const PolicyModal = ({ isOpen, onClose, onSave, policy, loading }) => {
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
    const [modalError, setModalError] = useState('');
    const [dropdowns, setDropdowns] = useState({ shifts: [], capturing: [] });

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };
                const API_URL = import.meta.env.VITE_API_BASE_URL;
                const [shiftsRes, capturingRes] = await Promise.all([
                    axios.get(`${API_URL}/shift-policies`, { headers }),
                    axios.get(`${API_URL}/attendance-capturing-policies`, { headers }),
                ]);
                setDropdowns({ shifts: shiftsRes.data, capturing: capturingRes.data });
            } catch (err) {
                setModalError('Failed to load required policy options.');
                console.error(err);
            }
        };

        if (isOpen) {
            fetchDropdowns();
            if (policy) {
                setFormData({
                    policyName: policy.policyName || '',
                    isDefault: policy.isDefault || false,
                    effectiveFrom: policy.effectiveFrom ? new Date(policy.effectiveFrom).toISOString().slice(0, 10) : '',
                    shiftPolicyId: policy.shiftPolicy?.id || '',
                    capturingPolicyId: policy.capturingPolicy?.id || '',
                    leaveDeductionConfig: policy.leaveDeductionConfig || initialFormState.leaveDeductionConfig,
                });
            } else {
                setFormData(initialFormState);
            }
            setModalError('');
        }
    }, [policy, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleDeductionChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            leaveDeductionConfig: { ...prev.leaveDeductionConfig, [name]: checked }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.policyName.trim() || !formData.shiftPolicyId || !formData.capturingPolicyId) {
            setModalError('Policy Name, Shift Policy, and Capturing Policy are required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all">
            <div className="bg-card rounded-theme shadow-2xl w-full max-w-2xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center bg-background-muted">
                    <h2 className="text-xl font-bold text-foreground">{policy ? 'Edit' : 'Add'} Attendance Tracking Policy</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-foreground-muted hover:bg-background-muted transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label htmlFor="policyName" className="block text-sm font-medium text-foreground-muted mb-1">Policy Name</label><input id="policyName" name="policyName" value={formData.policyName} onChange={handleChange} required className="input bg-background border-border rounded-theme text-foreground focus:ring-primary focus:border-primary" /></div>
                            <div><label htmlFor="effectiveFrom" className="block text-sm font-medium text-foreground-muted mb-1">Effective From</label><input id="effectiveFrom" name="effectiveFrom" type="date" value={formData.effectiveFrom} onChange={handleChange} required className="input bg-background border-border rounded-theme text-foreground focus:ring-primary focus:border-primary" /></div>
                            <div><label htmlFor="shiftPolicyId" className="block text-sm font-medium text-foreground-muted mb-1">Shift Policy</label><select id="shiftPolicyId" name="shiftPolicyId" value={formData.shiftPolicyId} onChange={handleChange} required className="input bg-background border-border rounded-theme text-foreground focus:ring-primary focus:border-primary"><option value="">Select Shift Policy</option>{dropdowns.shifts.map(p => <option key={p.id} value={p.id}>{p.policyName}</option>)}</select></div>
                            <div><label htmlFor="capturingPolicyId" className="block text-sm font-medium text-foreground-muted mb-1">Capturing Policy</label><select id="capturingPolicyId" name="capturingPolicyId" value={formData.capturingPolicyId} onChange={handleChange} required className="input bg-background border-border rounded-theme text-foreground focus:ring-primary focus:border-primary"><option value="">Select Capturing Policy</option>{dropdowns.capturing.map(p => <option key={p.id} value={p.id}>{p.policyName}</option>)}</select></div>
                        </div>
                        <div className="pt-2"><label className="inline-flex items-center cursor-pointer"><input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} className="h-4 w-4 rounded-theme border-border text-primary focus:ring-primary" /><span className="ml-2 text-sm text-foreground font-medium">Set as Default Policy</span></label></div>
                        <fieldset className="border-t border-border pt-4 mt-4">
                            <legend className="text-md font-bold text-foreground mb-4 bg-background px-3 py-1 rounded-full border border-border inline-block">Leave Deduction Rules</legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                                {Object.keys(formData.leaveDeductionConfig).map(key => (
                                    <label key={key} className="inline-flex items-center cursor-pointer p-2 hover:bg-background-muted rounded-theme transition-colors border border-transparent hover:border-border"><input type="checkbox" name={key} checked={formData.leaveDeductionConfig[key]} onChange={handleDeductionChange} className="h-4 w-4 rounded-theme border-border text-primary focus:ring-primary" /><span className="ml-2 text-sm text-foreground-muted capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span></label>
                                ))}
                            </div>
                        </fieldset>
                        {modalError && <p className="text-error text-sm font-medium flex items-center gap-1 mt-4"><AlertCircle size={14} /> {modalError}</p>}
                    </div>
                    <div className="p-4 border-t border-border bg-background-muted flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary rounded-theme" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center rounded-theme shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 px-6" disabled={loading}>{loading && <Loader className="animate-spin h-4 w-4 mr-2" />} {policy ? 'Update' : 'Create'} Policy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AttendanceTracking = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [syncingPolicy, setSyncingPolicy] = useState(null);
    const [editingPolicy, setEditingPolicy] = useState(null);

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

    useEffect(() => { fetchPolicies(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAdd = () => { setEditingPolicy(null); setIsModalOpen(true); };
    const handleEdit = (policy) => { setEditingPolicy(policy); setIsModalOpen(true); };

    const handleDelete = async (policyId, policyName) => {
        if (window.confirm(`Are you sure you want to delete the policy "${policyName}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/${policyId}`, { headers: { "Authorization": `Bearer ${token}` } });
                setPolicies(policies.filter(p => p.id !== policyId));
            } catch (err) {
                setError('Failed to delete policy.');
                console.error(err);
            }
        }
    };

    const handleSave = async (policyData) => {
        setModalLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (editingPolicy) {
                await axios.put(`${API_URL}/${editingPolicy.id}`, policyData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            } else {
                await axios.post(API_URL, policyData, { headers: { "Authorization": `Bearer ${token}` } });
            }
            setIsModalOpen(false);
            fetchPolicies();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save policy.');
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleOpenSyncModal = (policy) => {
        setSyncingPolicy(policy);
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
            setError('An unexpected error occurred during the sync process.');
        } 
    };

    return (
        <>
            <div className="p-4 sm:p-6 bg-background">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={handleAdd} className="btn-primary flex items-center ml-auto rounded-theme shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"><Plus className="h-5 w-5 mr-1" /> New Policy</button>
                </div>
                {error && <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-theme mb-6 flex items-center gap-2 font-medium" role="alert"><AlertCircle className="h-5 w-5" />{error}</div>}
                <div className="bg-card rounded-theme shadow-sm overflow-hidden border border-border">
                    {loading ? (
                        <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-background-muted">
                                    <tr>
                                        <th className="th-cell text-[10px] text-foreground-muted uppercase tracking-widest font-black">Policy Name</th>
                                        <th className="th-cell text-[10px] text-foreground-muted uppercase tracking-widest font-black">Shift Policy</th>
                                        <th className="th-cell text-[10px] text-foreground-muted uppercase tracking-widest font-black">Capturing Policy</th>
                                        <th className="th-cell text-[10px] text-foreground-muted uppercase tracking-widest font-black text-center">Default</th>
                                        <th className="th-cell text-[10px] text-foreground-muted uppercase tracking-widest font-black text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-foreground divide-y divide-border">
                                    {policies.length > 0 ? (
                                        policies.map(p => (
                                            <tr key={p.id} className="hover:bg-background-muted transition-colors">
                                                <td className="td-cell font-bold text-foreground">{p.policyName}</td>
                                                <td className="td-cell text-sm">{p.shiftPolicy?.policyName || <span className="text-foreground-muted italic opacity-50">N/A</span>}</td>
                                                <td className="td-cell text-sm">{p.capturingPolicy?.policyName || <span className="text-foreground-muted italic opacity-50">N/A</span>}</td>
                                                <td className="td-cell text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${p.isDefault ? 'bg-success/10 text-success border border-success/20' : 'bg-foreground-muted/10 text-foreground-muted opacity-50'}`}>
                                                        {p.isDefault ? 'PRIMARY' : 'SECONDARY'}
                                                    </span>
                                                </td>
                                                <td className="td-cell text-right">
                                                    <div className="flex items-center justify-end gap-1"> 
                                                        <button onClick={() => handleOpenSyncModal(p)} className="p-2 text-foreground-muted hover:text-success hover:bg-success/10 rounded-full transition-all" title="Sync to employees" disabled={!!syncingPolicy}>
                                                            {syncingPolicy?.id === p.id
                                                                ? <Loader className="h-4 w-4 animate-spin" />
                                                                : <RefreshCw className="h-4 w-4" />}
                                                        </button>
                                                        <button onClick={() => handleEdit(p)} className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-full transition-all" title="Edit"><Edit className="h-4 w-4" /></button>
                                                        <button onClick={() => handleDelete(p.id, p.policyName)} className="p-2 text-foreground-muted hover:text-error hover:bg-error/10 rounded-full transition-all" title="Delete" disabled={!!syncingPolicy}><Trash2 className="h-4 w-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="text-center py-24 text-foreground-muted"><AlertCircle className="mx-auto h-16 w-16 text-foreground-muted opacity-10 mb-4" /><h3 className="text-xl font-bold text-foreground">No tracking policies found</h3><p className="mt-2 text-sm max-w-xs mx-auto">Establish how attendance is captured and calculated across different departments or branches.</p></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <PolicyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} policy={editingPolicy} loading={modalLoading} />
            <SyncPolicyModal 
                isOpen={!!syncingPolicy} 
                onClose={() => setSyncingPolicy(null)} 
                policy={syncingPolicy}
                onSync={handleConfirmSync}
            />
        </>
    );
}

export default AttendanceTracking;
