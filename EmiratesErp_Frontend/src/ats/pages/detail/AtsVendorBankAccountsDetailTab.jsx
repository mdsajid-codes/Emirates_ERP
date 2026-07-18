import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Landmark, Download, Plus, X, Edit, Trash2, Upload, Loader2 } from 'lucide-react';
import { useAtsGeo } from '../../hooks/useAtsGeo';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsVendorBankAccountsDetailTab = ({ vendorId }) => {
    const {
        countries,
        states,
        setSelectedCountryName
    } = useAtsGeo();

    const [bankAccounts, setBankAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    const emptyAccountForm = {
        beneficiaryName: '',
        bankName: '',
        accountType: '',
        ifscRouting: '',
        accountNumber: '',
        depositAmount: '',
        priority: '',
        comments: '',
        addressLine1: '',
        addressLine2: '',
        countryId: '',
        stateId: '',
        city: '',
        zipCode: '',
        cancelledChequePath: '',
        cancelledChequeName: '',
        rawCancelledChequeFile: null,
        recordStatus: 'Active',
        attachmentPath: '',
        attachmentName: '',
        rawAttachmentFile: null
    };

    const [accountForm, setAccountForm] = useState(emptyAccountForm);

    const fetchBankAccounts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`${API_URL}/ats/vendors/${vendorId}/bank-accounts`, { headers });
            setBankAccounts(res.data || []);
        } catch (err) {
            console.error("Error fetching vendor bank accounts:", err);
            toast.error("Failed to load bank account details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (vendorId) {
            fetchBankAccounts();
        }
    }, [vendorId]);

    const handleOpenForm = (acc = null) => {
        if (acc) {
            setEditingAccount(acc);
            setAccountForm({
                beneficiaryName: acc.beneficiaryName || '',
                bankName: acc.bankName || '',
                accountType: acc.accountType || '',
                ifscRouting: acc.ifscRouting || '',
                accountNumber: acc.accountNumber || '',
                depositAmount: acc.depositAmount || '',
                priority: acc.priority || '',
                comments: acc.comments || '',
                addressLine1: acc.addressLine1 || '',
                addressLine2: acc.addressLine2 || '',
                countryId: acc.countryId || '',
                stateId: acc.stateId || '',
                city: acc.city || '',
                zipCode: acc.zipCode || '',
                cancelledChequePath: acc.cancelledChequePath || '',
                cancelledChequeName: acc.cancelledChequeName || '',
                rawCancelledChequeFile: null,
                recordStatus: acc.recordStatus || 'Active',
                attachmentPath: acc.attachmentPath || '',
                attachmentName: acc.attachmentName || '',
                rawAttachmentFile: null
            });
            const cCountry = countries.find(c => String(c.id) === String(acc.countryId));
            setSelectedCountryName(cCountry ? cCountry.name : '');
        } else {
            setEditingAccount(null);
            setAccountForm(emptyAccountForm);
            setSelectedCountryName('');
        }
        setShowForm(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            let cancelledChequePath = accountForm.cancelledChequePath;
            let cancelledChequeName = accountForm.cancelledChequeName;
            if (accountForm.rawCancelledChequeFile) {
                const fileFormData = new FormData();
                fileFormData.append("file", accountForm.rawCancelledChequeFile);
                const uploadRes = await axios.post(`${API_URL}/ats/vendors/${vendorId}/bank-accounts/upload`, fileFormData, {
                    headers: {
                        ...headers,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                cancelledChequePath = uploadRes.data.filePath;
                cancelledChequeName = accountForm.rawCancelledChequeFile.name;
            }

            let attachmentPath = accountForm.attachmentPath;
            let attachmentName = accountForm.attachmentName;
            if (accountForm.rawAttachmentFile) {
                const fileFormData = new FormData();
                fileFormData.append("file", accountForm.rawAttachmentFile);
                const uploadRes = await axios.post(`${API_URL}/ats/vendors/${vendorId}/bank-accounts/upload`, fileFormData, {
                    headers: {
                        ...headers,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                attachmentPath = uploadRes.data.filePath;
                attachmentName = accountForm.rawAttachmentFile.name;
            }

            const baPayload = {
                beneficiaryName: accountForm.beneficiaryName,
                bankName: accountForm.bankName,
                accountType: accountForm.accountType,
                ifscRouting: accountForm.ifscRouting,
                accountNumber: accountForm.accountNumber,
                depositAmount: accountForm.depositAmount,
                priority: accountForm.priority,
                comments: accountForm.comments,
                addressLine1: accountForm.addressLine1,
                addressLine2: accountForm.addressLine2,
                countryId: accountForm.countryId ? parseInt(accountForm.countryId) : null,
                stateId: accountForm.stateId ? parseInt(accountForm.stateId) : null,
                city: accountForm.city,
                zipCode: accountForm.zipCode,
                cancelledChequePath,
                cancelledChequeName,
                recordStatus: accountForm.recordStatus,
                attachmentPath,
                attachmentName
            };

            if (editingAccount) {
                await axios.put(`${API_URL}/ats/vendors/${vendorId}/bank-accounts/${editingAccount.id}`, baPayload, { headers });
                toast.success("Bank account updated.");
            } else {
                await axios.post(`${API_URL}/ats/vendors/${vendorId}/bank-accounts`, baPayload, { headers });
                toast.success("Bank account created.");
            }

            setShowForm(false);
            setEditingAccount(null);
            fetchBankAccounts();
        } catch (err) {
            console.error("Failed to save bank account details:", err);
            toast.error(err.response?.data?.message || "Failed to save bank account details.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (baId) => {
        if (!window.confirm("Delete this bank account permanently?")) return;
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            await axios.delete(`${API_URL}/ats/vendors/${vendorId}/bank-accounts/${baId}`, { headers });
            toast.success("Bank account deleted.");
            fetchBankAccounts();
        } catch (err) {
            toast.error("Failed to delete bank account.");
        }
    };

    const handleFieldChange = (field, value) => {
        if (field === 'countryId') {
            const matched = countries.find(c => String(c.id) === String(value));
            setSelectedCountryName(matched ? matched.name : '');
            setAccountForm(prev => ({ ...prev, countryId: value, stateId: '' }));
        } else {
            setAccountForm(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleFileChange = (fieldName, e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (fieldName === 'cancelledCheque') {
            setAccountForm(prev => ({
                ...prev,
                rawCancelledChequeFile: file,
                cancelledChequeName: file.name
            }));
        } else if (fieldName === 'attachment') {
            setAccountForm(prev => ({
                ...prev,
                rawAttachmentFile: file,
                attachmentName: file.name
            }));
        }
    };

    const handleDownloadCheque = async (baId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios({
                url: `${API_URL}/ats/vendors/${vendorId}/bank-accounts/${baId}/cancelled-cheque/download`,
                method: 'GET',
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'cancelled_cheque.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error("Cancelled cheque download is not available or failed.");
        }
    };

    const handleDownloadAttachment = async (baId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios({
                url: `${API_URL}/ats/vendors/${vendorId}/bank-accounts/${baId}/attachment/download`,
                method: 'GET',
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'attachment.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error("Attachment download is not available or failed.");
        }
    };

    if (loading) {
        return <div className="text-center py-6 text-foreground-muted text-sm font-semibold">Loading bank accounts...</div>;
    }

    return (
        <div className="space-y-4 font-sans text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">Bank Account Information</h3>
                {!showForm && (
                    <button
                        onClick={() => handleOpenForm(null)}
                        className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-theme hover:bg-primary/90 shadow-sm transition-all"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Bank Account
                    </button>
                )}
            </div>

            {/* INLINE FORM */}
            {showForm && (
                <div className="bg-background-muted/50 border border-border rounded-theme p-5 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-foreground">
                            {editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
                        </h4>
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setEditingAccount(null); }}
                            className="p-1.5 rounded-full hover:bg-background-muted text-foreground-muted hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Beneficiary Name */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    Beneficiary Name <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={accountForm.beneficiaryName}
                                    onChange={(e) => handleFieldChange('beneficiaryName', e.target.value)}
                                    placeholder="Beneficiary Name"
                                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground focus:border-primary"
                                />
                            </div>

                            {/* Bank Name */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    Bank Name
                                </label>
                                <input
                                    type="text"
                                    value={accountForm.bankName}
                                    onChange={(e) => handleFieldChange('bankName', e.target.value)}
                                    placeholder="Bank Name"
                                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground focus:border-primary"
                                />
                            </div>

                            {/* Account Type */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    Account Type
                                </label>
                                <select
                                    value={accountForm.accountType}
                                    onChange={(e) => handleFieldChange('accountType', e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground cursor-pointer focus:border-primary"
                                >
                                    <option value="">Select</option>
                                    <option value="Savings">Savings Account</option>
                                    <option value="Current">Current Account</option>
                                    <option value="Checking">Checking Account</option>
                                </select>
                            </div>

                            {/* IFSC Code/Routing Number */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    IFSC Code/Routing Number
                                </label>
                                <input
                                    type="text"
                                    value={accountForm.ifscRouting}
                                    onChange={(e) => handleFieldChange('ifscRouting', e.target.value)}
                                    placeholder="IFSC Code/Routing Number"
                                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground focus:border-primary"
                                />
                            </div>

                            {/* Account Number */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    value={accountForm.accountNumber}
                                    onChange={(e) => handleFieldChange('accountNumber', e.target.value)}
                                    placeholder="Account Number"
                                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground focus:border-primary"
                                />
                            </div>

                            {/* Deposit Amount */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    Deposit Amount
                                </label>
                                <select
                                    value={accountForm.depositAmount}
                                    onChange={(e) => handleFieldChange('depositAmount', e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground cursor-pointer focus:border-primary"
                                >
                                    <option value="">Select</option>
                                    <option value="Full Amount">Full Amount</option>
                                    <option value="Fixed Amount">Fixed Amount</option>
                                    <option value="Percentage">Percentage</option>
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    Priority
                                </label>
                                <select
                                    value={accountForm.priority}
                                    onChange={(e) => handleFieldChange('priority', e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground cursor-pointer focus:border-primary"
                                >
                                    <option value="">Select</option>
                                    <option value="Primary">Primary</option>
                                    <option value="Secondary">Secondary</option>
                                    <option value="Tertiary">Tertiary</option>
                                </select>
                            </div>

                            {/* Comments */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    Comments
                                </label>
                                <input
                                    type="text"
                                    value={accountForm.comments}
                                    onChange={(e) => handleFieldChange('comments', e.target.value)}
                                    placeholder="Comments"
                                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground focus:border-primary"
                                />
                            </div>

                            {/* Address Line 1 */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    Address Line 1
                                </label>
                                <input
                                    type="text"
                                    value={accountForm.addressLine1}
                                    onChange={(e) => handleFieldChange('addressLine1', e.target.value)}
                                    placeholder="Address Line 1"
                                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground focus:border-primary"
                                />
                            </div>

                            {/* Address Line 2 */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    Address Line 2
                                </label>
                                <input
                                    type="text"
                                    value={accountForm.addressLine2}
                                    onChange={(e) => handleFieldChange('addressLine2', e.target.value)}
                                    placeholder="Address Line 2"
                                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground focus:border-primary"
                                />
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    Country
                                </label>
                                <select
                                    value={accountForm.countryId}
                                    onChange={(e) => handleFieldChange('countryId', e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground cursor-pointer focus:border-primary"
                                >
                                    <option value="">Select Country</option>
                                    {countries.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* State */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    State
                                </label>
                                <select
                                    value={accountForm.stateId}
                                    onChange={(e) => handleFieldChange('stateId', e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground cursor-pointer focus:border-primary"
                                >
                                    <option value="">Select State</option>
                                    {states.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={accountForm.city}
                                    onChange={(e) => handleFieldChange('city', e.target.value)}
                                    placeholder="City"
                                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground focus:border-primary"
                                />
                            </div>

                            {/* Zip Code */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    Zip Code
                                </label>
                                <input
                                    type="text"
                                    value={accountForm.zipCode}
                                    onChange={(e) => handleFieldChange('zipCode', e.target.value)}
                                    placeholder="Zip Code"
                                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground focus:border-primary"
                                />
                            </div>

                            {/* Record Status */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    Record Status
                                </label>
                                <select
                                    value={accountForm.recordStatus}
                                    onChange={(e) => handleFieldChange('recordStatus', e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground cursor-pointer focus:border-primary"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Cancelled Cheque */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    Cancelled Cheque
                                </label>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-theme text-xs font-semibold cursor-pointer transition-colors shadow">
                                        <Upload className="h-3.5 w-3.5" />
                                        <span>Select File</span>
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileChange('cancelledCheque', e)}
                                            className="hidden"
                                        />
                                    </label>
                                    {(accountForm.cancelledChequeName || accountForm.cancelledChequePath) && (
                                        <span className="text-xs text-foreground font-medium truncate max-w-[150px]" title={accountForm.cancelledChequeName || accountForm.cancelledChequePath}>
                                            {accountForm.cancelledChequeName || accountForm.cancelledChequePath.split('/').pop()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Attachment */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                    Attachment
                                </label>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-theme text-xs font-semibold cursor-pointer transition-colors shadow">
                                        <Upload className="h-3.5 w-3.5" />
                                        <span>Select File</span>
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileChange('attachment', e)}
                                            className="hidden"
                                        />
                                    </label>
                                    {(accountForm.attachmentName || accountForm.attachmentPath) && (
                                        <span className="text-xs text-foreground font-medium truncate max-w-[150px]" title={accountForm.attachmentName || accountForm.attachmentPath}>
                                            {accountForm.attachmentName || accountForm.attachmentPath.split('/').pop()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form Submit & Cancel Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setEditingAccount(null); }}
                                className="px-4 py-2 border border-border rounded-theme text-sm font-semibold text-foreground-muted hover:bg-background-muted bg-background transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-theme hover:bg-primary/90 transition-colors shadow shadow-primary/10 flex items-center gap-2"
                            >
                                {submitting && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                                <span>Save Bank Details</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* BANK ACCOUNTS TABLE */}
            {bankAccounts.length === 0 && !showForm ? (
                <div className="text-center py-10 text-foreground-muted text-sm">
                    No bank accounts registered. Click <span className="font-bold text-foreground">+ Add Bank Account</span> to set one up.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-theme border border-border">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-background-muted/80 text-foreground-muted border-b border-border text-xs uppercase font-bold">
                                <th className="p-3">Beneficiary Name</th>
                                <th className="p-3">Bank Name</th>
                                <th className="p-3">Account Number</th>
                                <th className="p-3">IFSC/Routing</th>
                                <th className="p-3">Account Type</th>
                                <th className="p-3">Priority</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-foreground">
                            {bankAccounts.map((ba) => (
                                <tr key={ba.id} className="hover:bg-background-muted/30 transition-colors">
                                    <td className="p-3 font-semibold">{ba.beneficiaryName || '-'}</td>
                                    <td className="p-3 font-medium">{ba.bankName || '-'}</td>
                                    <td className="p-3 font-mono">{ba.accountNumber || '-'}</td>
                                    <td className="p-3 font-mono">{ba.ifscCode || '-'}</td>
                                    <td className="p-3 capitalize">{ba.accountType || '-'}</td>
                                    <td className="p-3">{ba.priority || '-'}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded-theme text-xs font-bold ${
                                            ba.recordStatus === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-background border border-border text-foreground-muted'
                                        }`}>
                                            {ba.recordStatus || 'Active'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {ba.cancelledChequePath && (
                                                <button
                                                    onClick={() => handleDownloadCheque(ba.id)}
                                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-primary border border-border hover:bg-background-muted px-2 py-1 rounded-theme transition-all"
                                                    title="Download Cancelled Cheque"
                                                >
                                                    Cheque
                                                </button>
                                            )}
                                            {ba.attachmentPath && (
                                                <button
                                                    onClick={() => handleDownloadAttachment(ba.id)}
                                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-primary border border-border hover:bg-background-muted px-2 py-1 rounded-theme transition-all"
                                                    title="Download Custom Attachment"
                                                >
                                                    Doc
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleOpenForm(ba)}
                                                className="p-1.5 hover:bg-background-muted border border-border text-foreground-muted hover:text-primary rounded-theme transition-all"
                                                title="Edit"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ba.id)}
                                                className="p-1.5 hover:bg-background-muted border border-border text-foreground-muted hover:text-destructive rounded-theme transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
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

export default AtsVendorBankAccountsDetailTab;
