import React, { useState, useEffect } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { useAtsGeo } from '../hooks/useAtsGeo';

const AtsVendorFormBankAccountTab = ({ bankAccounts = [], onChange }) => {
    const {
        countries,
        states,
        setSelectedCountryName
    } = useAtsGeo();

    const handleAddBankAccount = () => {
        const newAcc = {
            id: null,
            isNew: true,
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
            recordStatus: '',
            attachmentPath: '',
            attachmentName: '',
            rawAttachmentFile: null
        };
        onChange([...bankAccounts, newAcc]);
    };

    const handleRemoveBankAccount = (index) => {
        const updated = [...bankAccounts];
        updated.splice(index, 1);
        onChange(updated);
    };

    const handleFieldChange = (index, field, value) => {
        const updated = [...bankAccounts];
        if (field === 'countryId') {
            const matched = countries.find(c => String(c.id) === String(value));
            setSelectedCountryName(matched ? matched.name : '');
            updated[index] = { ...updated[index], countryId: value, stateId: '' };
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        onChange(updated);
    };

    const handleFileChange = (index, fieldName, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const updated = [...bankAccounts];
        if (fieldName === 'cancelledCheque') {
            updated[index] = {
                ...updated[index],
                rawCancelledChequeFile: file,
                cancelledChequeName: file.name
            };
        } else if (fieldName === 'attachment') {
            updated[index] = {
                ...updated[index],
                rawAttachmentFile: file,
                attachmentName: file.name
            };
        }
        onChange(updated);
    };

    return (
        <div className="space-y-6">
            {/* Header section matching screenshot */}
            <div className="flex justify-between items-center border-b border-border pb-4">
                <h3 className="text-base font-bold text-foreground font-sans">Bank Account Details</h3>
                <button
                    type="button"
                    onClick={handleAddBankAccount}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-theme shadow hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                </button>
            </div>

            {bankAccounts.length === 0 ? (
                <div className="text-center py-8 text-foreground-muted italic text-xs font-sans">
                    No bank accounts added yet. Click "Add" to configure bank details.
                </div>
            ) : (
                <div className="space-y-8">
                    {bankAccounts.map((acc, idx) => (
                        <div key={idx} className="border border-border rounded-theme overflow-hidden bg-background font-sans">
                            {/* Inner header banner */}
                            <div className="bg-background-muted px-4 py-2 border-b border-border flex justify-between items-center">
                                <span className="text-xs font-bold text-primary">Add Bank Account</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveBankAccount(idx)}
                                    className="text-destructive hover:text-destructive/80 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Form fields layout */}
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Beneficiary Name */}
                                    <div>
                                        <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                            Beneficiary Name <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={acc.beneficiaryName || ''}
                                            onChange={(e) => handleFieldChange(idx, 'beneficiaryName', e.target.value)}
                                            placeholder="Beneficiary Name"
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                        />
                                    </div>

                                    {/* Bank Name */}
                                    <div>
                                        <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                            Bank Name
                                        </label>
                                        <input
                                            type="text"
                                            value={acc.bankName || ''}
                                            onChange={(e) => handleFieldChange(idx, 'bankName', e.target.value)}
                                            placeholder="Bank Name"
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                        />
                                    </div>

                                    {/* Account Type */}
                                    <div>
                                        <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                            Account Type
                                        </label>
                                        <select
                                            value={acc.accountType || ''}
                                            onChange={(e) => handleFieldChange(idx, 'accountType', e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground cursor-pointer"
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
                                            value={acc.ifscRouting || ''}
                                            onChange={(e) => handleFieldChange(idx, 'ifscRouting', e.target.value)}
                                            placeholder="IFSC Code/Routing Number"
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                        />
                                    </div>

                                    {/* Account Number */}
                                    <div>
                                        <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                            Account Number
                                        </label>
                                        <input
                                            type="text"
                                            value={acc.accountNumber || ''}
                                            onChange={(e) => handleFieldChange(idx, 'accountNumber', e.target.value)}
                                            placeholder="Account Number"
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                        />
                                    </div>

                                    {/* Deposit Amount */}
                                    <div>
                                        <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                            Deposit Amount
                                        </label>
                                        <select
                                            value={acc.depositAmount || ''}
                                            onChange={(e) => handleFieldChange(idx, 'depositAmount', e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground cursor-pointer"
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
                                            value={acc.priority || ''}
                                            onChange={(e) => handleFieldChange(idx, 'priority', e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground cursor-pointer"
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
                                            value={acc.comments || ''}
                                            onChange={(e) => handleFieldChange(idx, 'comments', e.target.value)}
                                            placeholder="Comments"
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                        />
                                    </div>

                                    {/* Address Line 1 */}
                                    <div>
                                        <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                            Address Line 1
                                        </label>
                                        <input
                                            type="text"
                                            value={acc.addressLine1 || ''}
                                            onChange={(e) => handleFieldChange(idx, 'addressLine1', e.target.value)}
                                            placeholder="Address Line 1"
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                        />
                                    </div>

                                    {/* Address Line 2 */}
                                    <div>
                                        <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                            Address Line 2
                                        </label>
                                        <input
                                            type="text"
                                            value={acc.addressLine2 || ''}
                                            onChange={(e) => handleFieldChange(idx, 'addressLine2', e.target.value)}
                                            placeholder="Address Line 2"
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                        />
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                            Country
                                        </label>
                                        <select
                                            value={acc.countryId || ''}
                                            onChange={(e) => handleFieldChange(idx, 'countryId', e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground cursor-pointer"
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
                                            value={acc.stateId || ''}
                                            onChange={(e) => handleFieldChange(idx, 'stateId', e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground cursor-pointer"
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
                                            value={acc.city || ''}
                                            onChange={(e) => handleFieldChange(idx, 'city', e.target.value)}
                                            placeholder="City"
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                        />
                                    </div>

                                    {/* Zip Code1 */}
                                    <div>
                                        <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                            Zip Code1
                                        </label>
                                        <input
                                            type="text"
                                            value={acc.zipCode || ''}
                                            onChange={(e) => handleFieldChange(idx, 'zipCode', e.target.value)}
                                            placeholder="Zip Code"
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                        />
                                    </div>

                                    {/* Record Status */}
                                    <div>
                                        <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                            Record Status
                                        </label>
                                        <select
                                            value={acc.recordStatus || ''}
                                            onChange={(e) => handleFieldChange(idx, 'recordStatus', e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground cursor-pointer"
                                        >
                                            <option value="">Select</option>
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
                                                    onChange={(e) => handleFileChange(idx, 'cancelledCheque', e)}
                                                    className="hidden"
                                                />
                                            </label>
                                            {(acc.cancelledChequeName || acc.cancelledChequePath) && (
                                                <span className="text-xs text-foreground font-medium truncate max-w-[150px]" title={acc.cancelledChequeName || acc.cancelledChequePath}>
                                                    {acc.cancelledChequeName || acc.cancelledChequePath.split('/').pop()}
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
                                                    onChange={(e) => handleFileChange(idx, 'attachment', e)}
                                                    className="hidden"
                                                />
                                            </label>
                                            {(acc.attachmentName || acc.attachmentPath) && (
                                                <span className="text-xs text-foreground font-medium truncate max-w-[150px]" title={acc.attachmentName || acc.attachmentPath}>
                                                    {acc.attachmentName || acc.attachmentPath.split('/').pop()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AtsVendorFormBankAccountTab;
