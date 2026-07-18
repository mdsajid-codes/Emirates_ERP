import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsVendorAccountsTab = ({
    account = {},
    onChange
}) => {
    const [paymentTermsList, setPaymentTermsList] = useState([]);

    useEffect(() => {
        const fetchPaymentTerms = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get(`${API_URL}/ats/payment-terms/active`, { headers });
                setPaymentTermsList(res.data || []);
            } catch (e) {
                console.error("Failed to fetch payment terms list", e);
            }
        };
        fetchPaymentTerms();
    }, []);

    const handleSelectChange = (e) => {
        const val = e.target.value;
        const ptId = val ? parseInt(val) : null;
        const matched = paymentTermsList.find(t => t.id === ptId);
        onChange({
            ...account,
            paymentTermId: ptId,
            paymentTerms: matched ? matched.name : ''
        });
    };

    const handleAccountFieldChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...account, [name]: value });
    };

    return (
        <div className="space-y-6">
            {/* Row 1: Contact Person | Mobile Number | Office Number + Extension */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Contact Person</label>
                    <input
                        type="text"
                        name="contactPerson"
                        value={account.contactPerson || ''}
                        onChange={handleAccountFieldChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Mobile Number</label>
                    <input
                        type="text"
                        name="mobileNumber"
                        value={account.mobileNumber || ''}
                        onChange={handleAccountFieldChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Office Number</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="officeNumber"
                            value={account.officeNumber || ''}
                            onChange={handleAccountFieldChange}
                            className="px-3 py-2 flex-1 text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <div className="relative">
                            <input
                                type="text"
                                name="officeExtension"
                                value={account.officeExtension || ''}
                                onChange={handleAccountFieldChange}
                                placeholder="Ext"
                                className="px-3 py-2 w-20 text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Email ID | Designation | Payment Terms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Email ID</label>
                    <input
                        type="email"
                        name="emailId"
                        value={account.emailId || ''}
                        onChange={handleAccountFieldChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Designation</label>
                    <input
                        type="text"
                        name="designation"
                        value={account.designation || ''}
                        onChange={handleAccountFieldChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Payment Terms</label>
                    <select
                        name="paymentTermId"
                        value={account.paymentTermId || ''}
                        onChange={handleSelectChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="">Select</option>
                        {paymentTermsList.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.days} Days)</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default AtsVendorAccountsTab;
