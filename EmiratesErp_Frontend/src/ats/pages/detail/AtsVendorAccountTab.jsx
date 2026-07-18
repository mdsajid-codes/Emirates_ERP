import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsVendorAccountTab = ({ vendorId }) => {
    const [loading, setLoading] = useState(false);
    const [paymentTermsList, setPaymentTermsList] = useState([]);
    const [accountForm, setAccountForm] = useState({
        contactPerson: '', mobileNumber: '', officeNumber: '',
        officeExtension: '', emailId: '', designation: '', paymentTerms: '', paymentTermId: ''
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                
                // Fetch payment terms and vendor details
                const [termsRes, vendorRes] = await Promise.all([
                    axios.get(`${API_URL}/ats/payment-terms/active`, { headers }),
                    axios.get(`${API_URL}/ats/vendors/${vendorId}`, { headers })
                ]);

                setPaymentTermsList(termsRes.data || []);
                
                if (vendorRes.data && vendorRes.data.account) {
                    const acc = vendorRes.data.account;
                    setAccountForm({
                        ...acc,
                        paymentTermId: acc.paymentTerm ? acc.paymentTerm.id : (acc.paymentTermId || '')
                    });
                }
            } catch (err) {
                console.error("Error loading account data:", err);
                toast.error("Failed to load financial details.");
            } finally {
                setLoading(false);
            }
        };

        if (vendorId) {
            fetchInitialData();
        }
    }, [vendorId]);

    const handleAccountUpsert = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            await axios.put(`${API_URL}/ats/vendors/${vendorId}/account`, accountForm, { headers });
            toast.success("Finance accounts saved.");
        } catch (err) {
            toast.error("Failed to update finance account details.");
        }
    };

    if (loading) {
        return (
            <div className="text-center py-6 text-foreground-muted text-sm font-semibold">
                Loading financial details...
            </div>
        );
    }

    return (
        <form onSubmit={handleAccountUpsert} className="space-y-4">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-2">Financial Accounts</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Financial Contact Person</label>
                    <input
                        type="text"
                        value={accountForm.contactPerson || ''}
                        onChange={(e) => setAccountForm({ ...accountForm, contactPerson: e.target.value })}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Financial Contact Designation</label>
                    <input
                        type="text"
                        value={accountForm.designation || ''}
                        onChange={(e) => setAccountForm({ ...accountForm, designation: e.target.value })}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Email ID</label>
                    <input
                        type="email"
                        value={accountForm.emailId || ''}
                        onChange={(e) => setAccountForm({ ...accountForm, emailId: e.target.value })}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Mobile Number</label>
                    <input
                        type="text"
                        value={accountForm.mobileNumber || ''}
                        onChange={(e) => setAccountForm({ ...accountForm, mobileNumber: e.target.value })}
                        placeholder="e.g. +1 555-000-1234"
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Office Number</label>
                    <input
                        type="text"
                        value={accountForm.officeNumber || ''}
                        onChange={(e) => setAccountForm({ ...accountForm, officeNumber: e.target.value })}
                        placeholder="e.g. +1 555-100-2000"
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Office Extension</label>
                    <input
                        type="text"
                        value={accountForm.officeExtension || ''}
                        onChange={(e) => setAccountForm({ ...accountForm, officeExtension: e.target.value })}
                        placeholder="e.g. 204"
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Payment Terms</label>
                    <select
                        value={accountForm.paymentTermId || ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            const ptId = val ? parseInt(val) : null;
                            const matched = paymentTermsList.find(t => t.id === ptId);
                            setAccountForm({
                                ...accountForm,
                                paymentTermId: ptId,
                                paymentTerms: matched ? matched.name : ''
                            });
                        }}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                        <option value="">Select Payment Terms</option>
                        {paymentTermsList.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.days} Days)</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-theme hover:bg-primary/90 transition-all shadow shadow-primary/10"
                >
                    Save Financial Details
                </button>
            </div>
        </form>
    );
};

export default AtsVendorAccountTab;
