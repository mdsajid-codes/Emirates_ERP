import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, Save, ArrowLeft } from 'lucide-react';

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

const EmployeeBenefitProvisionForm = ({ initialData, onSave, onCancel, employeeCode }) => {
    const [formData, setFormData] = useState(initialData || {
        benefitTypeId: '',
        cycleStartDate: '',
        cycleEndDate: '',
    });
    const [benefitTypes, setBenefitTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchBenefitTypes = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/benefit-types`, { headers: { "Authorization": `Bearer ${token}` } });
                setBenefitTypes(response.data.filter(bt => bt.active));
            } catch (error) {
                console.error("Failed to fetch benefit types:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBenefitTypes();
    }, [API_URL]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, employeeCode });
    };

    if (loading) return <div className="flex justify-center items-center p-6"><Loader className="animate-spin h-5 w-5 text-primary" /></div>;

    return (
        <div className="p-3 border border-border rounded-lg bg-card text-foreground space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-xs font-bold text-foreground">
                    {initialData ? 'Edit Benefit Provision' : 'Add Benefit Provision'}
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
                <SelectField label="Benefit Type" name="benefitTypeId" value={formData.benefitTypeId} onChange={handleChange} required>
                    <option value="">Select a benefit</option>
                    {benefitTypes.map(bt => (
                        <option key={bt.id} value={bt.id}>{bt.name}</option>
                    ))}
                </SelectField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <InputField label="Cycle Start Date" name="cycleStartDate" type="date" value={formData.cycleStartDate} onChange={handleChange} required />
                    <InputField label="Cycle End Date" name="cycleEndDate" type="date" value={formData.cycleEndDate} onChange={handleChange} required />
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
                        className="px-3.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs h-7"
                    >
                        <Save size={13} /> Save Provision
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmployeeBenefitProvisionForm;