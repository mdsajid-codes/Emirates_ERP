import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsVendorContractsTab = ({ vendorId }) => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showContractModal, setShowContractModal] = useState(false);
    const [editingContract, setEditingContract] = useState(null);
    const [contractForm, setContractForm] = useState({
        contractNumber: '', contractType: 'W2', contractStatus: 'DRAFT',
        startDate: '', endDate: '', signedDate: '', paymentTerms: '',
        billRate: '', payRate: '', currency: 'USD', markupPercent: '',
        autoRenew: false, documentUrl: '', contractNotes: ''
    });

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`${API_URL}/ats/vendors/${vendorId}/contracts`, { headers });
            setContracts(res.data || []);
        } catch (err) {
            console.error("Error fetching contracts:", err);
            toast.error("Failed to fetch agreements.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (vendorId) {
            fetchContracts();
        }
    }, [vendorId]);

    const handleContractSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const payload = {
                ...contractForm,
                billRate: contractForm.billRate ? parseFloat(contractForm.billRate) : null,
                payRate: contractForm.payRate ? parseFloat(contractForm.payRate) : null,
                markupPercent: contractForm.markupPercent ? parseFloat(contractForm.markupPercent) : null
            };
            if (editingContract) {
                await axios.put(`${API_URL}/ats/vendors/${vendorId}/contracts/${editingContract.id}`, payload, { headers });
                toast.success("Contract updated.");
            } else {
                await axios.post(`${API_URL}/ats/vendors/${vendorId}/contracts`, payload, { headers });
                toast.success("Contract created.");
            }
            setShowContractModal(false);
            setEditingContract(null);
            fetchContracts();
        } catch (err) {
            toast.error("Failed to save contract.");
        }
    };

    const handleDeleteContract = async (cId) => {
        if (!window.confirm("Permanently delete this contract?")) return;
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            await axios.delete(`${API_URL}/ats/vendors/${vendorId}/contracts/${cId}`, { headers });
            toast.success("Contract removed.");
            fetchContracts();
        } catch (err) {
            toast.error("Failed to delete contract.");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">Legal Agreements</h3>
                <button
                    onClick={() => {
                        setContractForm({
                            contractNumber: '', contractType: 'W2', contractStatus: 'DRAFT',
                            startDate: '', endDate: '', signedDate: '', paymentTerms: '',
                            billRate: '', payRate: '', currency: 'USD', markupPercent: '',
                            autoRenew: false, documentUrl: '', contractNotes: ''
                        });
                        setEditingContract(null);
                        setShowContractModal(true);
                    }}
                    className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-theme hover:bg-primary/90 shadow-sm"
                >
                    <Plus className="h-3.5 w-3.5" />
                    New Agreement
                </button>
            </div>

            {loading && (
                <div className="text-center py-6 text-foreground-muted text-sm font-semibold">
                    Loading agreements...
                </div>
            )}

            {!loading && contracts.length === 0 && (
                <div className="text-center py-10 text-foreground-muted text-sm">
                    No agreements registered. Click <span className="font-bold text-foreground">+ New Agreement</span> to register one.
                </div>
            )}

            {!loading && contracts.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-foreground">
                        <thead>
                            <tr className="bg-background text-xs font-semibold uppercase tracking-wider text-foreground-muted border-b border-border">
                                <th className="px-4 py-3">Contract #</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Dates</th>
                                <th className="px-4 py-3">Rates</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {contracts.map(c => (
                                <tr key={c.id} className="hover:bg-background/20">
                                    <td className="px-4 py-3 font-semibold text-foreground">{c.contractNumber || 'NO-NUMBER'}</td>
                                    <td className="px-4 py-3 font-medium">{c.contractType}</td>
                                    <td className="px-4 py-3 text-xs">
                                        <div>Start: {c.startDate || '-'}</div>
                                        <div>End: {c.endDate || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-semibold">
                                        <div>Bill: {c.billRate ? `${c.billRate} ${c.currency}` : '-'}</div>
                                        <div>Pay: {c.payRate ? `${c.payRate} ${c.currency}` : '-'}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-theme ${c.contractStatus === 'SIGNED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-background border border-border text-foreground-muted'}`}>
                                            {c.contractStatus}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                onClick={() => {
                                                    setEditingContract(c);
                                                    setContractForm({
                                                        contractNumber: c.contractNumber || '',
                                                        contractType: c.contractType || 'W2',
                                                        contractStatus: c.contractStatus || 'DRAFT',
                                                        startDate: c.startDate || '',
                                                        endDate: c.endDate || '',
                                                        signedDate: c.signedDate || '',
                                                        paymentTerms: c.paymentTerms || '',
                                                        billRate: c.billRate || '',
                                                        payRate: c.payRate || '',
                                                        currency: c.currency || 'USD',
                                                        markupPercent: c.markupPercent || '',
                                                        autoRenew: c.autoRenew || false,
                                                        documentUrl: c.documentUrl || '',
                                                        contractNotes: c.contractNotes || ''
                                                    });
                                                    setShowContractModal(true);
                                                }}
                                                className="p-1.5 hover:bg-background border border-border text-foreground-muted hover:text-primary rounded-theme transition-all"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteContract(c.id)}
                                                className="p-1.5 hover:bg-background border border-border text-foreground-muted hover:text-destructive rounded-theme transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- CONTRACT MODAL --- */}
            {showContractModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
                    <div className="bg-card rounded-theme p-6 max-w-lg w-full shadow-2xl border border-border text-foreground">
                        <h2 className="text-lg font-bold mb-4">{editingContract ? "Edit Agreement" : "New Agreement"}</h2>
                        <form onSubmit={handleContractSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1">Agreement Number</label>
                                    <input
                                        type="text"
                                        value={contractForm.contractNumber}
                                        onChange={(e) => setContractForm({ ...contractForm, contractNumber: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1">Contract Type</label>
                                    <select
                                        value={contractForm.contractType}
                                        onChange={(e) => setContractForm({ ...contractForm, contractType: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="W2">W2</option>
                                        <option value="C2C">Corp-to-Corp (C2C)</option>
                                        <option value="1099">1099</option>
                                        <option value="DIRECT_HIRE">Direct Hire</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={contractForm.startDate}
                                        onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={contractForm.endDate}
                                        onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1">Bill Rate</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={contractForm.billRate}
                                        onChange={(e) => setContractForm({ ...contractForm, billRate: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1">Pay Rate</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={contractForm.payRate}
                                        onChange={(e) => setContractForm({ ...contractForm, payRate: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1">Currency</label>
                                    <input
                                        type="text"
                                        value={contractForm.currency}
                                        onChange={(e) => setContractForm({ ...contractForm, currency: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1">Markup %</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={contractForm.markupPercent}
                                        onChange={(e) => setContractForm({ ...contractForm, markupPercent: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1">Signed Date</label>
                                    <input
                                        type="date"
                                        value={contractForm.signedDate}
                                        onChange={(e) => setContractForm({ ...contractForm, signedDate: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1">Payment Terms</label>
                                    <input
                                        type="text"
                                        value={contractForm.paymentTerms}
                                        onChange={(e) => setContractForm({ ...contractForm, paymentTerms: e.target.value })}
                                        placeholder="e.g. Net 30"
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1">Document URL</label>
                                    <input
                                        type="text"
                                        value={contractForm.documentUrl}
                                        onChange={(e) => setContractForm({ ...contractForm, documentUrl: e.target.value })}
                                        placeholder="e.g. https://storage.googleapi.com/..."
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                                        <input
                                            type="checkbox"
                                            checked={contractForm.autoRenew}
                                            onChange={(e) => setContractForm({ ...contractForm, autoRenew: e.target.checked })}
                                            className="h-4 w-4 rounded border-gray-300 text-primary"
                                        />
                                        <span className="text-xs font-semibold text-foreground-muted">Auto Renew Agreement</span>
                                    </label>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1">Agreement Notes</label>
                                    <textarea
                                        rows={3}
                                        value={contractForm.contractNotes}
                                        onChange={(e) => setContractForm({ ...contractForm, contractNotes: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1">Contract Status</label>
                                    <select
                                        value={contractForm.contractStatus}
                                        onChange={(e) => setContractForm({ ...contractForm, contractStatus: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="DRAFT">DRAFT</option>
                                        <option value="SIGNED">SIGNED</option>
                                        <option value="TERMINATED">TERMINATED</option>
                                        <option value="EXPIRED">EXPIRED</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => { setShowContractModal(false); setEditingContract(null); }}
                                    className="px-4 py-2 border border-border rounded-theme text-sm font-semibold text-foreground-muted hover:bg-background-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-theme hover:bg-primary/90 transition-colors shadow shadow-primary/10"
                                >
                                    {editingContract ? 'Update Agreement' : 'Save Agreement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AtsVendorContractsTab;
