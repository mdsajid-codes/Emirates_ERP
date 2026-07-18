import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader, AlertCircle, X } from 'lucide-react';

const CapturingPolicyModal = ({ isOpen, onClose, onSave, policy, loading }) => {
    const initialFormState = {
        policyName: '',
        graceTimeMinutes: 0,
        halfDayThresholdMinutes: 0,
        allowMultiplePunches: false,
        lateMarkRules: '',
    };
    const [formData, setFormData] = useState(initialFormState);
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (policy) {
            setFormData({
                policyName: policy.policyName || '',
                graceTimeMinutes: policy.graceTimeMinutes || 0,
                halfDayThresholdMinutes: policy.halfDayThresholdMinutes || 0,
                allowMultiplePunches: policy.allowMultiplePunches || false,
                lateMarkRules: policy.lateMarkRules || '',
            });
        } else {
            setFormData(initialFormState);
        }
        setModalError('');
    }, [policy, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.policyName.trim()) {
            setModalError('Policy Name is required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all">
            <div className="bg-card rounded-theme shadow-2xl w-full max-w-lg border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center bg-background-muted">
                    <h2 className="text-xl font-bold text-foreground">{policy ? 'Edit' : 'Add'} Capturing Policy</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-foreground-muted hover:bg-background-muted transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        <div className="md:col-span-2"><label htmlFor="policyName" className="block text-sm font-medium text-foreground-muted mb-1">Policy Name</label><input id="policyName" name="policyName" value={formData.policyName} onChange={handleChange} required className="input bg-background border-border rounded-theme text-foreground focus:ring-primary focus:border-primary" /></div>
                        <div><label htmlFor="graceTimeMinutes" className="block text-sm font-medium text-foreground-muted mb-1">Grace Time (Minutes)</label><input id="graceTimeMinutes" name="graceTimeMinutes" type="number" value={formData.graceTimeMinutes} onChange={handleChange} className="input bg-background border-border rounded-theme text-foreground focus:ring-primary focus:border-primary" /></div>
                        <div><label htmlFor="halfDayThresholdMinutes" className="block text-sm font-medium text-foreground-muted mb-1">Half-Day Threshold (Minutes)</label><input id="halfDayThresholdMinutes" name="halfDayThresholdMinutes" type="number" value={formData.halfDayThresholdMinutes} onChange={handleChange} className="input bg-background border-border rounded-theme text-foreground focus:ring-primary focus:border-primary" /></div>
                        <div className="md:col-span-2"><label htmlFor="lateMarkRules" className="block text-sm font-medium text-foreground-muted mb-1">Late Mark Rules</label><input id="lateMarkRules" name="lateMarkRules" value={formData.lateMarkRules} onChange={handleChange} className="input bg-background border-border rounded-theme text-foreground focus:ring-primary focus:border-primary" placeholder="e.g., 3 lates = 1 half-day" /></div>
                        <div className="md:col-span-2 pt-2"><label className="inline-flex items-center cursor-pointer"><input type="checkbox" name="allowMultiplePunches" checked={formData.allowMultiplePunches} onChange={handleChange} className="h-4 w-4 rounded-theme border-border text-primary focus:ring-primary" /><span className="ml-2 text-sm text-foreground font-medium">Allow Multiple Punches</span></label></div>
                        {modalError && <p className="md:col-span-2 text-error text-sm font-medium flex items-center gap-1"><AlertCircle size={14} /> {modalError}</p>}
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

const AttendanceCapturingPolicy = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);

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
                await axios.put(`${API_URL}/${editingPolicy.id}`, policyData, { headers: { "Authorization": `Bearer ${token}` } });
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
                                        <th className="th-cell text-[10px] text-foreground-muted uppercase tracking-widest font-black text-center">Grace Time</th>
                                        <th className="th-cell text-[10px] text-foreground-muted uppercase tracking-widest font-black text-center">Multiple Punches</th>
                                        <th className="th-cell text-[10px] text-foreground-muted uppercase tracking-widest font-black text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-foreground divide-y divide-border">
                                    {policies.length > 0 ? (
                                        policies.map(p => (
                                            <tr key={p.id} className="hover:bg-background-muted transition-colors">
                                                <td className="td-cell font-bold text-foreground">{p.policyName}</td>
                                                <td className="td-cell text-center"><span className="px-2 py-0.5 bg-warning/10 text-warning border border-warning/20 rounded-full text-xs font-mono">{p.graceTimeMinutes} min</span></td>
                                                <td className="td-cell text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${p.allowMultiplePunches ? 'bg-success/10 text-success' : 'bg-foreground-muted/10 text-foreground-muted opacity-50'}`}>{p.allowMultiplePunches ? 'YES' : 'NO'}</span></td>
                                                <td className="td-cell text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => handleEdit(p)} className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-full transition-all" title="Edit"><Edit className="h-4 w-4" /></button>
                                                        <button onClick={() => handleDelete(p.id, p.policyName)} className="p-2 text-foreground-muted hover:text-error hover:bg-error/10 rounded-full transition-all" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="text-center py-24 text-foreground-muted"><AlertCircle className="mx-auto h-16 w-16 text-foreground-muted opacity-10 mb-4" /><h3 className="text-xl font-bold text-foreground">No capturing policies found</h3><p className="mt-2 text-sm max-w-xs mx-auto">Define how punches are detected, grace periods for late arrivals, and half-day thresholds.</p></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <CapturingPolicyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} policy={editingPolicy} loading={modalLoading} />
        </>
    );
}

export default AttendanceCapturingPolicy;