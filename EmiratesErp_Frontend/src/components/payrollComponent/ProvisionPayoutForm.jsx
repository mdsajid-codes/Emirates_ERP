import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const InputField = ({ label, id, type = 'text', ...props }) => (
    <div>
        {label && <label htmlFor={id} className="block text-[11px] font-medium text-foreground-muted mb-0.5">{label}</label>}
        <input
            id={id}
            type={type}
            {...props}
            className="w-full px-2 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors h-7"
        />
    </div>
);

const SelectField = ({ label, id, children, ...props }) => (
    <div>
        {label && <label htmlFor={id} className="block text-[11px] font-medium text-foreground-muted mb-0.5">{label}</label>}
        <select
            id={id}
            {...props}
            className="w-full px-2 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors h-7"
        >
            {children}
        </select>
    </div>
);

const ProvisionPayoutForm = ({ provision, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        paidOutDate: new Date().toISOString().split('T')[0],
        paymentDetails: '',
        paymentMethod: 'BANK_TRANSFER',
        paidAmount: 0,
    });
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (provision) {
            setFormData(prev => ({ ...prev, paidAmount: provision.accruedAmount || 0 }));
        }
    }, [provision]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = new FormData();
        submissionData.append('payoutDetails', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
        if (file && file.length > 0) {
            for (let i = 0; i < file.length; i++) {
                submissionData.append('files', file[i]);
            }
        }
        onSave(submissionData);
    };

    return (
        <div className="p-3 border border-border rounded-lg bg-card text-foreground space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-xs font-bold text-foreground">
                    Pay Out: {provision?.benefitTypeName}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <InputField label="Paid Out Date" name="paidOutDate" type="date" value={formData.paidOutDate} onChange={handleChange} required />
                    <InputField label="Paid Amount" name="paidAmount" type="number" value={formData.paidAmount} onChange={handleChange} readOnly className="bg-background-muted text-foreground-muted" />
                </div>

                <SelectField label="Payment Method" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} required>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="IN_KIND">In Kind (e.g., Ticket)</option>
                </SelectField>

                <InputField label="Payment Details / Remarks" name="paymentDetails" value={formData.paymentDetails} onChange={handleChange} required placeholder="e.g., Ticket booked on Emirates EK201" />

                <div>
                    <label htmlFor="confirmationFile" className="block text-[11px] font-medium text-foreground-muted mb-0.5">
                        Confirmation File (Optional)
                    </label>
                    <input
                        id="confirmationFile"
                        name="file"
                        type="file"
                        onChange={handleFileChange}
                        multiple
                        className="w-full text-xs text-foreground-muted border border-border rounded-md bg-background px-2 py-1 file:mr-2 file:py-0.5 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-3 py-1 text-xs font-semibold text-foreground-muted hover:bg-background-muted rounded-md transition-colors border border-border"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-3.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-2xs h-7"
                    >
                        <CheckCircle2 size={13} /> Confirm Payout
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProvisionPayoutForm;