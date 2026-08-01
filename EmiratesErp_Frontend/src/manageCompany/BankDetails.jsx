import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Trash2, PlusCircle, Loader, ArrowLeft, Save } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No authentication token found.");
    return { "Authorization": `Bearer ${token}` };
};

const api = {
    getBankAccounts: async () => {
        const response = await axios.get(`${API_URL}/company-bank-accounts`, { headers: getAuthHeaders() });
        return response.data;
    },
    createBankAccount: async (data) => {
        const response = await axios.post(`${API_URL}/company-bank-accounts`, data, { headers: getAuthHeaders() });
        return response.data;
    },
    updateBankAccount: async (id, data) => {
        const response = await axios.put(`${API_URL}/company-bank-accounts/${id}`, data, { headers: getAuthHeaders() });
        return response.data;
    },
    deleteBankAccount: async (id) => {
        await axios.delete(`${API_URL}/company-bank-accounts/${id}`, { headers: getAuthHeaders() });
    },
};

const InputField = ({ label, id, ...props }) => (
    <div>
        {label && <label htmlFor={id} className="block text-[11px] font-medium text-foreground-muted mb-0.5">{label}</label>}
        <input
            id={id}
            {...props}
            className="w-full px-2.5 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors h-7"
        />
    </div>
);

const BankAccountFormView = ({ item, onSave, onCancel, saving }) => {
    const [formData, setFormData] = useState(item || { bankName: '', accountNumber: '', ifscCode: '', accountHolderName: '', branchName: '', primary: false });
    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };

    return (
        <div className="p-3.5 bg-card border border-border rounded-lg text-foreground space-y-3 max-w-lg">
            <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-xs font-bold text-foreground">
                    {item ? 'Edit Bank Account' : 'Add Bank Account'}
                </h3>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-2 py-1 text-xs font-semibold rounded-md border border-border bg-background hover:bg-background-muted text-foreground transition-colors flex items-center gap-1"
                >
                    <ArrowLeft size={13} /> Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <InputField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} required />
                <InputField label="Account Holder Name" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} required />
                <InputField label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required />
                <InputField label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} required />
                <InputField label="Branch Name" name="branchName" value={formData.branchName} onChange={handleChange} />
                
                <div className="flex items-center gap-2 pt-1">
                    <input type="checkbox" id="primary" name="primary" checked={formData.primary} onChange={handleChange} className="h-3.5 w-3.5 rounded border-border text-primary" />
                    <label htmlFor="primary" className="text-xs font-medium text-foreground">Set as primary account</label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                    <button type="button" onClick={onCancel} className="px-3 py-1 text-xs font-semibold text-foreground-muted hover:bg-background-muted rounded-md transition-colors border border-border" disabled={saving}>Cancel</button>
                    <button type="submit" className="px-3.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs h-7" disabled={saving}>
                        {saving ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Save size={13} />} Save Account
                    </button>
                </div>
            </form>
        </div>
    );
};

const BankDetails = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
    const [editingAccount, setEditingAccount] = useState(null);

    const fetchAccounts = useCallback(() => {
        setLoading(true);
        api.getBankAccounts()
            .then(data => setAccounts(data))
            .catch(() => setError('Failed to load bank accounts.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const handleAdd = () => { setEditingAccount(null); setViewMode('form'); };
    const handleEdit = (account) => { setEditingAccount(account); setViewMode('form'); };
    const handleCloseForm = () => { setViewMode('list'); setEditingAccount(null); };

    const handleSave = async (data) => {
        setSaving(true);
        try {
            if (data.id) {
                await api.updateBankAccount(data.id, data);
            } else {
                await api.createBankAccount(data);
            }
            fetchAccounts();
            handleCloseForm();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save account.'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this bank account?')) {
            try {
                await api.deleteBankAccount(id);
                fetchAccounts();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete account.'}`);
            }
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader className="animate-spin h-5 w-5 text-primary" /></div>;
    if (error) return <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-md border border-rose-500/20">{error}</div>;

    if (viewMode === 'form') {
        return <BankAccountFormView item={editingAccount} onSave={handleSave} onCancel={handleCloseForm} saving={saving} />;
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-foreground">Bank Accounts</h3>
                <button onClick={handleAdd} className="px-2.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs">
                    <PlusCircle size={13} /> Add Account
                </button>
            </div>

            {accounts.length === 0 ? (
                <div className="p-6 text-center border border-border rounded-lg bg-card text-foreground">
                    <p className="text-xs text-foreground-muted">No bank accounts found for this company.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="min-w-full bg-card text-foreground divide-y divide-border">
                        <thead className="bg-background-muted/60">
                            <tr>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Bank Name</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Account Number</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">IFSC</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Primary</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {accounts.map(acc => (
                                <tr key={acc.id} className="hover:bg-background-muted/40 transition-colors">
                                    <td className="px-3 py-2 text-xs font-semibold text-foreground">{acc.bankName}</td>
                                    <td className="px-3 py-2 text-xs font-medium text-foreground">{acc.accountNumber}</td>
                                    <td className="px-3 py-2 text-xs text-foreground-muted">{acc.ifscCode}</td>
                                    <td className="px-3 py-2 text-xs">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${acc.primary ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-background-muted text-foreground-muted border-border'}`}>
                                            {acc.primary ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-xs text-right whitespace-nowrap space-x-1">
                                        <button onClick={() => handleEdit(acc)} className="p-1 text-primary hover:bg-primary/10 rounded-md transition-colors border border-border bg-background" title="Edit"><Edit size={13} /></button>
                                        <button onClick={() => handleDelete(acc.id)} className="p-1 text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors border border-border bg-background" title="Delete"><Trash2 size={13} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BankDetails;
