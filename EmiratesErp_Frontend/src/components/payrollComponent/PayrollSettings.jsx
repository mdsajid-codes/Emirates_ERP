import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Scale, Handshake, Loader, Edit, Trash2, PlusCircle, Layers, Gift, ToggleLeft, ToggleRight, FileText, ArrowLeft, Save } from 'lucide-react';
import axios from 'axios';

// --- Helper Components ---
const InputField = ({ label, id, type = 'text', children, className = '', ...props }) => (
    <div className={className}>
        {label && <label htmlFor={id} className="block text-[11px] font-medium text-foreground-muted mb-0.5">{label}</label>}
        {type === 'select' ? (
            <select
                id={id}
                {...props}
                className="w-full px-2.5 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors h-7"
            >
                {children}
            </select>
        ) : type === 'textarea' ? (
            <textarea
                id={id}
                {...props}
                className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
        ) : (
            <input
                id={id}
                type={type}
                {...props}
                className="w-full px-2.5 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors h-7"
            />
        )}
    </div>
);

const CheckboxField = ({ label, id, ...props }) => (
    <div className="flex items-center gap-2">
        <input id={id} type="checkbox" {...props} className="h-3.5 w-3.5 rounded border-border text-primary" />
        <label htmlFor={id} className="text-xs font-medium text-foreground">{label}</label>
    </div>
);

const InfoDisplay = ({ label, value }) => (
    <div>
        <p className="text-[11px] text-foreground-muted font-medium">{label}</p>
        <p className="text-xs font-semibold text-foreground">{value || <span className="text-foreground-muted/50">N/A</span>}</p>
    </div>
);

// --- General Settings Tab ---
const GeneralSettingsTab = () => {
    const [settings, setSettings] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);

    const initialFormData = {
        payFrequency: 'MONTHLY', payCycleDay: 1, payslipGenerationDay: 25,
        includeHolidaysInPayslip: false, includeLeaveBalanceInPayslip: false,
    };
    const [formData, setFormData] = useState(initialFormData);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchSettings = useCallback(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/payroll-settings`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(response => {
                if (response.data && response.data.payFrequency) {
                    setSettings(response.data);
                    setFormData(response.data);
                } else {
                    setSettings(null);
                    setFormData(initialFormData);
                }
            })
            .catch(error => console.error("Error fetching payroll settings:", error))
            .finally(() => setLoading(false));
    }, [API_URL]);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaveLoading(true);
        const token = localStorage.getItem('token');
        axios.post(`${API_URL}/payroll-settings`, formData, { headers: { "Authorization": `Bearer ${token}` } })
            .then(response => {
                setSettings(response.data);
                setFormData(response.data);
                setIsEditing(false);
                alert('Payroll settings saved successfully!');
            })
            .catch(error => {
                console.error("Error saving settings:", error);
                alert('Failed to save settings.');
            })
            .finally(() => setSaveLoading(false));
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-5 w-5 text-primary" /></div>;
    }

    if (isEditing || !settings) {
        return (
            <form onSubmit={handleSubmit} className="p-3.5 bg-card border border-border rounded-lg text-foreground space-y-4 max-w-2xl">
                {!settings && (
                    <div className="text-center py-4 border border-dashed border-border rounded-md bg-background-muted/40">
                        <h3 className="text-xs font-bold text-foreground">No Payroll Settings Found</h3>
                        <p className="text-[11px] text-foreground-muted">Configure your payroll settings for the first time.</p>
                    </div>
                )}

                <div className="flex items-center justify-between pb-2 border-b border-border">
                    <h3 className="text-xs font-bold text-foreground">General Payroll Settings</h3>
                    {settings && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-2 py-1 text-xs font-semibold rounded-md border border-border bg-background hover:bg-background-muted text-foreground transition-colors flex items-center gap-1"
                        >
                            <ArrowLeft size={13} /> Back
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <InputField label="Pay Frequency" type="select" name="payFrequency" value={formData.payFrequency} onChange={handleChange}>
                        <option value="MONTHLY">Monthly</option>
                        <option value="BI_WEEKLY">Bi-Weekly</option>
                        <option value="WEEKLY">Weekly</option>
                    </InputField>
                    <InputField label="Pay Cycle Day" name="payCycleDay" type="number" value={formData.payCycleDay} onChange={handleChange} min="1" max="31" />
                    <InputField label="Payslip Generation Day" name="payslipGenerationDay" type="number" value={formData.payslipGenerationDay} onChange={handleChange} min="1" max="31" />
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                    <CheckboxField label="Include holidays in payslip" name="includeHolidaysInPayslip" checked={formData.includeHolidaysInPayslip} onChange={handleChange} />
                    <CheckboxField label="Include leave balance in payslip" name="includeLeaveBalanceInPayslip" checked={formData.includeLeaveBalanceInPayslip} onChange={handleChange} />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                    {settings && (
                        <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs font-semibold text-foreground-muted hover:bg-background-muted rounded-md transition-colors border border-border" disabled={saveLoading}>
                            Cancel
                        </button>
                    )}
                    <button type="submit" className="px-3.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs h-7" disabled={saveLoading}>
                        {saveLoading ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Save size={13} />} Save Settings
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="space-y-3 max-w-2xl">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-foreground">General Payroll Settings</h3>
                <button onClick={() => setIsEditing(true)} className="px-2.5 py-1 text-xs font-semibold border border-border bg-background hover:bg-background-muted text-foreground rounded-md transition-colors flex items-center gap-1">
                    <Edit size={13} /> Edit
                </button>
            </div>
            <div className="p-3 bg-card border border-border rounded-lg text-foreground space-y-3">
                <div className="p-3 border border-border rounded-lg bg-background-muted/40">
                    <h4 className="text-[11px] font-bold mb-2 text-foreground-muted uppercase tracking-wider">Payroll Cycle</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <InfoDisplay label="Pay Frequency" value={settings.payFrequency} />
                        <InfoDisplay label="Pay Cycle Day" value={settings.payCycleDay} />
                        <InfoDisplay label="Payslip Generation Day" value={settings.payslipGenerationDay} />
                    </div>
                </div>
                <div className="p-3 border border-border rounded-lg bg-background-muted/40">
                    <h4 className="text-[11px] font-bold mb-2 text-foreground-muted uppercase tracking-wider">Payslip Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InfoDisplay label="Include Holidays" value={settings.includeHolidaysInPayslip ? 'Yes' : 'No'} />
                        <InfoDisplay label="Include Leave Balance" value={settings.includeLeaveBalanceInPayslip ? 'Yes' : 'No'} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CRUD Table Component ---
const CrudTable = ({ title, columns, data, onAdd, onEdit, onDelete, addLabel, onToggle, showToggle = false }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-foreground">{title}</h3>
            <button onClick={onAdd} className="px-2.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs">
                <PlusCircle size={13} /> {addLabel}
            </button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full bg-card text-foreground divide-y divide-border">
                <thead className="bg-background-muted/60">
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">{col.header}</th>
                        ))}
                        <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                    {data.length > 0 ? (
                        data.map(item => (
                            <tr key={item.id} className="hover:bg-background-muted/40 transition-colors">
                                {columns.map(col => (
                                    <td key={col.key} className="px-3 py-2 text-xs font-medium text-foreground">
                                        {typeof item[col.key] === 'boolean' ? (
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${item[col.key] ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-background-muted text-foreground-muted border-border'}`}>
                                                {item[col.key] ? 'Yes' : 'No'}
                                            </span>
                                        ) : item[col.key]}
                                    </td>
                                ))}
                                <td className="px-3 py-2 text-xs text-right whitespace-nowrap space-x-1">
                                    {showToggle && (
                                        <button onClick={() => onToggle(item.id, item.active)} className={`p-1 rounded-md transition-colors border border-border bg-background ${item.active ? 'text-emerald-600 hover:bg-emerald-500/10' : 'text-foreground-muted hover:bg-background-muted'}`} title={item.active ? 'Deactivate' : 'Activate'}>
                                            {item.active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                                        </button>
                                    )}
                                    <button onClick={() => onEdit(item)} className="p-1 text-primary hover:bg-primary/10 rounded-md transition-colors border border-border bg-background" title="Edit"><Edit size={13} /></button>
                                    {onDelete && <button onClick={() => onDelete(item.id)} className="p-1 text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors border border-border bg-background" title="Delete"><Trash2 size={13} /></button>}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length + 1} className="text-center py-6 text-foreground-muted text-xs">
                                No items found. Click {addLabel} to create one.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// --- Forms ---
const PayslipTemplateForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData || { name: '', templateContent: '', default: false });

    useEffect(() => {
        if (initialData) setFormData(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-3.5 bg-card border border-border rounded-lg text-foreground space-y-3 max-w-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-xs font-bold text-foreground">{initialData ? 'Edit Payslip Template' : 'Add Payslip Template'}</h3>
                <button type="button" onClick={onCancel} className="px-2 py-1 text-xs font-semibold rounded-md border border-border bg-background hover:bg-background-muted text-foreground transition-colors flex items-center gap-1">
                    <ArrowLeft size={13} /> Back
                </button>
            </div>
            <InputField label="Template Name" name="name" value={formData.name} onChange={handleChange} required />
            <InputField label="Template HTML" name="templateContent" type="textarea" rows="8" value={formData.templateContent} onChange={handleChange} required placeholder="Enter the HTML content for the payslip..." />
            <CheckboxField label="Set as default template" id="default" name="default" checked={formData.default} onChange={handleChange} />
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button type="button" onClick={onCancel} className="px-3 py-1 text-xs font-semibold text-foreground-muted hover:bg-background-muted rounded-md transition-colors border border-border">Cancel</button>
                <button type="submit" className="px-3.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs h-7">
                    <Save size={13} /> Save Template
                </button>
            </div>
        </form>
    );
};

const SalaryComponentForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(() => {
        if (initialData) {
            return {
                ...initialData,
                isWpsIncluded: initialData.isWpsIncluded ?? initialData.wpsIncluded ?? true,
                isVariable: initialData.isVariable ?? initialData.variable ?? false,
            };
        }
        return {
            name: '', code: '', type: 'EARNING', calculationType: 'FLAT_AMOUNT',
            formula: '', taxable: true, partOfGrossSalary: true, displayOrder: 0,
            isWpsIncluded: true, isVariable: false
        };
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-3.5 bg-card border border-border rounded-lg text-foreground space-y-3 max-w-xl">
            <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-xs font-bold text-foreground">{initialData ? 'Edit Salary Component' : 'Add Salary Component'}</h3>
                <button type="button" onClick={onCancel} className="px-2 py-1 text-xs font-semibold rounded-md border border-border bg-background hover:bg-background-muted text-foreground transition-colors flex items-center gap-1">
                    <ArrowLeft size={13} /> Back
                </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <InputField label="Component Name" name="name" value={formData.name} onChange={handleChange} required />
                <InputField label="Code" name="code" value={formData.code} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <InputField label="Type" name="type" type="select" value={formData.type} onChange={handleChange} required>
                    <option value="EARNING">Earning</option>
                    <option value="DEDUCTION">Deduction</option>
                </InputField>
                <InputField label="Calculation Type" name="calculationType" type="select" value={formData.calculationType} onChange={handleChange} required>
                    <option value="FLAT_AMOUNT">Flat Amount</option>
                    <option value="PERCENTAGE_OF_BASIC">Percentage of Basic</option>
                    <option value="PERCENTAGE_OF_GROSS">Percentage of Gross</option>
                    <option value="FORMULA_BASED">Formula Based</option>
                </InputField>
            </div>
            {formData.calculationType === 'FORMULA_BASED' && (
                <InputField label="Formula" name="formula" type="textarea" rows="2" value={formData.formula} onChange={handleChange} placeholder="e.g., (basic * 0.4)" />
            )}
            <InputField label="Display Order" name="displayOrder" type="number" value={formData.displayOrder} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-2 pt-1">
                <CheckboxField label="Taxable" id="taxable" name="taxable" checked={formData.taxable} onChange={handleChange} />
                <CheckboxField label="Part of Gross Salary" id="partOfGrossSalary" name="partOfGrossSalary" checked={formData.partOfGrossSalary} onChange={handleChange} />
                <CheckboxField label="WPS Included" id="isWpsIncluded" name="isWpsIncluded" checked={formData.isWpsIncluded} onChange={handleChange} />
                <CheckboxField label="Variable Component" id="isVariable" name="isVariable" checked={formData.isVariable} onChange={handleChange} />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button type="button" onClick={onCancel} className="px-3 py-1 text-xs font-semibold text-foreground-muted hover:bg-background-muted rounded-md transition-colors border border-border">Cancel</button>
                <button type="submit" className="px-3.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs h-7">
                    <Save size={13} /> Save Component
                </button>
            </div>
        </form>
    );
};

const StatutoryRuleForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData || { ruleName: '', description: '', employeeContributionRate: 0, employerContributionRate: 0, contributionCap: 0, taxSlabsJson: '', active: true });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit} className="p-3.5 bg-card border border-border rounded-lg text-foreground space-y-3 max-w-xl">
            <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-xs font-bold text-foreground">{initialData ? 'Edit Statutory Rule' : 'Add Statutory Rule'}</h3>
                <button type="button" onClick={onCancel} className="px-2 py-1 text-xs font-semibold rounded-md border border-border bg-background hover:bg-background-muted text-foreground transition-colors flex items-center gap-1">
                    <ArrowLeft size={13} /> Back
                </button>
            </div>
            <InputField label="Rule Name" name="ruleName" value={formData.ruleName} onChange={handleChange} required />
            <InputField label="Description" name="description" value={formData.description} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-3">
                <InputField label="Employee Rate (%)" name="employeeContributionRate" type="number" step="0.01" value={formData.employeeContributionRate} onChange={handleChange} />
                <InputField label="Employer Rate (%)" name="employerContributionRate" type="number" step="0.01" value={formData.employerContributionRate} onChange={handleChange} />
            </div>
            <InputField label="Contribution Cap" name="contributionCap" type="number" value={formData.contributionCap} onChange={handleChange} />
            <InputField label="Tax Slabs (JSON)" name="taxSlabsJson" type="textarea" rows="3" value={formData.taxSlabsJson} onChange={handleChange} />
            <CheckboxField label="Active" id="statutoryActive" name="active" checked={formData.active} onChange={handleChange} />
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button type="button" onClick={onCancel} className="px-3 py-1 text-xs font-semibold text-foreground-muted hover:bg-background-muted rounded-md transition-colors border border-border">Cancel</button>
                <button type="submit" className="px-3.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs h-7">
                    <Save size={13} /> Save Rule
                </button>
            </div>
        </form>
    );
};

const LoanProductForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData || { productName: '', description: '', interestRate: 0, maxInstallments: 0, maxLoanAmount: 0, active: true, availabilityStartDate: '', availabilityEndDate: '', deductFromSalary: true });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit} className="p-3.5 bg-card border border-border rounded-lg text-foreground space-y-3 max-w-xl">
            <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-xs font-bold text-foreground">{initialData ? 'Edit Loan Product' : 'Add Loan Product'}</h3>
                <button type="button" onClick={onCancel} className="px-2 py-1 text-xs font-semibold rounded-md border border-border bg-background hover:bg-background-muted text-foreground transition-colors flex items-center gap-1">
                    <ArrowLeft size={13} /> Back
                </button>
            </div>
            <InputField label="Product Name" name="productName" value={formData.productName} onChange={handleChange} required />
            <InputField label="Description" name="description" value={formData.description} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-3">
                <InputField label="Interest Rate (%)" name="interestRate" type="number" step="0.01" value={formData.interestRate} onChange={handleChange} />
                <InputField label="Max Installments" name="maxInstallments" type="number" value={formData.maxInstallments} onChange={handleChange} />
            </div>
            <InputField label="Max Loan Amount" name="maxLoanAmount" type="number" value={formData.maxLoanAmount} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-3">
                <InputField label="Availability Start Date" name="availabilityStartDate" type="date" value={formData.availabilityStartDate || ''} onChange={handleChange} />
                <InputField label="Availability End Date" name="availabilityEndDate" type="date" value={formData.availabilityEndDate || ''} onChange={handleChange} />
            </div>
            <div className="flex gap-4 pt-1">
                <CheckboxField label="Active" id="loanActive" name="active" checked={formData.active} onChange={handleChange} />
                <CheckboxField label="Deduct from Salary" id="deductFromSalary" name="deductFromSalary" checked={formData.deductFromSalary} onChange={handleChange} />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button type="button" onClick={onCancel} className="px-3 py-1 text-xs font-semibold text-foreground-muted hover:bg-background-muted rounded-md transition-colors border border-border">Cancel</button>
                <button type="submit" className="px-3.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs h-7">
                    <Save size={13} /> Save Product
                </button>
            </div>
        </form>
    );
};

const BenefitTypeForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData || { code: '', name: '', description: '', calculationType: 'FLAT_AMOUNT', valueForAccrual: 0 });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-3.5 bg-card border border-border rounded-lg text-foreground space-y-3 max-w-xl">
            <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-xs font-bold text-foreground">{initialData ? 'Edit Benefit Type' : 'Add Benefit Type'}</h3>
                <button type="button" onClick={onCancel} className="px-2 py-1 text-xs font-semibold rounded-md border border-border bg-background hover:bg-background-muted text-foreground transition-colors flex items-center gap-1">
                    <ArrowLeft size={13} /> Back
                </button>
            </div>
            <InputField label="Benefit Code" name="code" value={formData.code} onChange={handleChange} required maxLength="50" disabled={!!initialData} />
            <InputField label="Benefit Name" name="name" value={formData.name} onChange={handleChange} required />
            <InputField label="Description" name="description" type="textarea" rows="2" value={formData.description} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-3">
                <InputField label="Calculation Type" name="calculationType" type="select" value={formData.calculationType} onChange={handleChange} required>
                    <option value="FLAT_AMOUNT">Flat Amount</option>
                    <option value="PERCENTAGE_OF_BASIC">Percentage of Basic</option>
                </InputField>
                <InputField label="Value for Accrual" name="valueForAccrual" type="number" step="0.01" value={formData.valueForAccrual} onChange={handleChange} required />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button type="button" onClick={onCancel} className="px-3 py-1 text-xs font-semibold text-foreground-muted hover:bg-background-muted rounded-md transition-colors border border-border">Cancel</button>
                <button type="submit" className="px-3.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs h-7">
                    <Save size={13} /> Save Benefit
                </button>
            </div>
        </form>
    );
};

// --- CRUD Tab Factory (Inline View Mode without Modal) ---
const createCrudTab = (config, customLogic = {}) => () => {
    const [items, setItems] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchItems = useCallback(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}${config.endpoints.getAll}`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => setItems(res.data))
            .catch(err => console.error(`Error fetching ${config.name}:`, err))
            .finally(() => setLoading(false));
    }, [config.endpoints.getAll, config.name, API_URL]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const handleAdd = () => { setEditingItem(null); setViewMode('form'); };
    const handleEdit = (item) => { setEditingItem(item); setViewMode('form'); };
    const handleCloseForm = () => { setViewMode('list'); setEditingItem(null); };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete this ${config.singularName}?`)) {
            const token = localStorage.getItem('token');
            axios.delete(`${API_URL}${config.endpoints.delete}/${id}`, { headers: { "Authorization": `Bearer ${token}` } })
                .then(fetchItems)
                .catch(err => console.error(`Error deleting ${config.singularName}:`, err));
        }
    };

    const handleSave = (data) => {
        const token = localStorage.getItem('token');
        const request = data.id
            ? axios.put(`${API_URL}${config.endpoints.update}/${data.id}`, data, { headers: { "Authorization": `Bearer ${token}` } })
            : axios.post(`${API_URL}${config.endpoints.create}`, data, { headers: { "Authorization": `Bearer ${token}` } });

        request.then(() => {
            fetchItems();
            handleCloseForm();
        })
            .catch(err => { console.error(`Error saving ${config.singularName}:`, err); alert(`Failed to save ${config.singularName}.`); });
    };

    const handleSetDefault = (id) => {
        if (!config.endpoints.setDefault) return;
        const token = localStorage.getItem('token');
        axios.post(`${API_URL}${config.endpoints.setDefault}/${id}`, {}, { headers: { "Authorization": `Bearer ${token}` } })
            .then(fetchItems)
            .catch(err => alert(`Failed to set default: ${err.response?.data?.message || err.message}`));
    };

    const finalConfig = { ...config, ...customLogic, onSetDefault: handleSetDefault };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-5 w-5 text-primary" /></div>;
    }

    if (viewMode === 'form') {
        return <config.FormComponent initialData={editingItem} onSave={handleSave} onCancel={handleCloseForm} />;
    }

    return (
        <CrudTable
            title={config.title}
            columns={config.columns}
            data={items}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={finalConfig.onDelete || handleDelete}
            addLabel={config.addLabel}
            onToggle={finalConfig.onToggle}
            showToggle={!!finalConfig.onToggle}
        />
    );
};

const StatutoryRulesTab = createCrudTab({
    name: 'statutory rules', singularName: 'rule', title: 'Statutory Rules', addLabel: 'Add Rule',
    columns: [
        { header: 'Rule Name', key: 'ruleName' },
        { header: 'Employee Rate', key: 'employeeContributionRate' },
        { header: 'Employer Rate', key: 'employerContributionRate' },
        { header: 'Active', key: 'active' },
    ],
    endpoints: { getAll: '/statutory-rules', create: '/statutory-rules', update: '/statutory-rules', delete: '/statutory-rules' },
    FormComponent: StatutoryRuleForm,
});

const SalaryComponentsTab = createCrudTab({
    name: 'salary components',
    singularName: 'component',
    title: 'Salary Components',
    addLabel: 'Add Component',
    columns: [
        { header: 'Name', key: 'name' },
        { header: 'Code', key: 'code' },
        { header: 'Type', key: 'type' },
        { header: 'Calc Type', key: 'calculationType' },
        { header: 'Taxable', key: 'taxable' },
    ],
    endpoints: { getAll: '/salary-components', create: '/salary-components', update: '/salary-components', delete: '/salary-components' },
    FormComponent: SalaryComponentForm,
});

const BenefitTypesTab = createCrudTab({
    name: 'benefit types',
    singularName: 'Benefit Type',
    title: 'Benefit Types',
    addLabel: 'Add Benefit Type',
    columns: [
        { header: 'Code', key: 'code' },
        { header: 'Name', key: 'name' },
        { header: 'Description', key: 'description' },
        { header: 'Calc Type', key: 'calculationType' },
        { header: 'Accrual Value', key: 'valueForAccrual' },
        { header: 'Active', key: 'active' },
    ],
    endpoints: {
        getAll: '/benefit-types',
        create: '/benefit-types',
        update: '/benefit-types',
        toggle: '/benefit-types',
    },
    FormComponent: BenefitTypeForm,
}, {
    onDelete: null,
    onToggle: (id, fetchItems) => (itemId) => {
        const token = localStorage.getItem('token');
        axios.patch(`${import.meta.env.VITE_API_BASE_URL}/benefit-types/${itemId}/toggle-status`, {}, { headers: { "Authorization": `Bearer ${token}` } })
            .then(fetchItems)
            .catch(err => alert(`Failed to toggle status: ${err.response?.data?.message || err.message}`));
    }
});

const LoanProductsTab = createCrudTab({
    name: 'loan products', singularName: 'product', title: 'Loan Products', addLabel: 'Add Product',
    columns: [
        { header: 'Product Name', key: 'productName' },
        { header: 'Interest Rate', key: 'interestRate' },
        { header: 'Max Installments', key: 'maxInstallments' },
        { header: 'Active', key: 'active' },
    ],
    endpoints: { getAll: '/loan-products', create: '/loan-products', update: '/loan-products', delete: '/loan-products' },
    FormComponent: LoanProductForm,
});

const PayslipTemplatesTab = createCrudTab({
    name: 'payslip templates',
    singularName: 'Template',
    title: 'Payslip Templates',
    addLabel: 'Add Template',
    columns: [
        { header: 'Name', key: 'name' },
        { header: 'Default', key: 'default' },
        { header: 'Last Updated', key: 'updatedAt' },
    ],
    endpoints: { getAll: '/payslip-templates', create: '/payslip-templates', update: '/payslip-templates', delete: '/payslip-templates', setDefault: '/payslip-templates' },
    FormComponent: PayslipTemplateForm,
});

// --- Main Component ---
const PayrollSettings = () => {
    const [activeSubTab, setActiveSubTab] = useState('General');

    const subTabs = [
        { name: 'General', icon: Settings, component: GeneralSettingsTab },
        { name: 'Salary Components', icon: Layers, component: SalaryComponentsTab },
        { name: 'Statutory Rules', icon: Scale, component: StatutoryRulesTab },
        { name: 'Benefit Types', icon: Gift, component: BenefitTypesTab },
        { name: 'Loan Products', icon: Handshake, component: LoanProductsTab },
        { name: 'Payslip Templates', icon: FileText, component: PayslipTemplatesTab },
    ];

    const ActiveComponent = subTabs.find(tab => tab.name === activeSubTab)?.component;

    return (
        <div className="space-y-3">
            <div className="border-b border-border pb-0.5 mb-3">
                <nav className="-mb-px flex space-x-3 overflow-x-auto" aria-label="Sub-tabs">
                    {subTabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveSubTab(tab.name)}
                            className={`whitespace-nowrap flex items-center gap-1.5 py-1 px-0.5 border-b-2 font-medium text-[11px] transition-colors ${
                                activeSubTab === tab.name
                                    ? 'border-primary text-primary font-bold'
                                    : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
                            }`}
                        >
                            <tab.icon className="h-3.5 w-3.5" />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            <div>
                {ActiveComponent && <ActiveComponent />}
            </div>
        </div>
    );
};

export default PayrollSettings;
