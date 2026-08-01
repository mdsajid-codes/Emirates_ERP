import React, { useState, useEffect } from 'react';
import { Pencil, Check, X, Download, FileText, Loader, PlusCircle, Search, ChevronDown } from 'lucide-react';
import axios from 'axios';

// --- Helper Components & Functions ---

const statusStyles = {
    PROCESSED: { bg: 'bg-green-100', text: 'text-green-800' },
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    FAILED: { bg: 'bg-red-100', text: 'text-red-800' },
};

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A';
const formatDateForInput = (dateString) => dateString ? dateString.split('T')[0] : '';

const formatCurrency = (amount, currency = 'AED') => {
    return `AED ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const InfoField = ({ label, value }) => (
    <div className="bg-background/60 border border-border/60 rounded-xl p-2.5 space-y-0.5 shadow-2xs">
        <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">{label}</p>
        <p className="text-xs font-semibold text-foreground truncate">{value || 'N/A'}</p>
    </div>
);

// Custom Container Dropdown Component
const CustomSelect = ({ value, options, onChange, placeholder = "Select..." }) => {
    const [open, setOpen] = useState(false);
    const selectedOption = options.find(o => String(o.value) === String(value));

    return (
        <div className="relative w-full">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full bg-background border border-border hover:border-primary/50 rounded-lg px-2.5 py-1.5 text-xs text-foreground flex items-center justify-between transition-all shadow-xs"
            >
                <span className="truncate font-medium">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-foreground-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl py-1.5 z-50 max-h-48 overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-100">
                        {options.length > 0 ? (
                            options.map((opt) => {
                                const isSelected = String(opt.value) === String(value);
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setOpen(false);
                                        }}
                                        className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between transition-colors ${
                                            isSelected 
                                                ? 'bg-primary/10 text-primary font-bold' 
                                                : 'text-foreground hover:bg-background-muted'
                                        }`}
                                    >
                                        <span className="truncate">{opt.label}</span>
                                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-3 py-2 text-xs text-foreground-muted text-center">No options available</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const EditField = ({ label, name, value, onChange, type = 'text', options = [] }) => {
    const commonProps = {
        id: name,
        name: name,
        value: value ?? '',
        onChange: onChange,
        className: "w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
    };

    return (
        <div className="space-y-1">
            <label htmlFor={name} className="block text-[11px] font-bold text-foreground-muted uppercase tracking-wider">{label}</label>
            {type === 'select' ? (
                <CustomSelect
                    value={value}
                    options={options}
                    onChange={(val) => {
                        onChange({
                            target: {
                                name: name,
                                value: val,
                            }
                        });
                    }}
                    placeholder="Select..."
                />
            ) : (
                <input {...commonProps} type={type} />
            )}
        </div>
    );
};

// --- PayrollCard Component ---

const PayrollCard = ({ payroll, isEditing, onEdit, onSave, onCancel, onChange, onDownload }) => {
    const { id, payPeriodStart, payPeriodEnd, status, grossSalary, netSalary, currency, payoutDate, basicSalary, allowances, deductions, taxAmount, remarks } = payroll;
    const displayStatus = status || 'PENDING';

    const statusOptions = [ { value: 'PENDING', label: 'Pending' }, { value: 'PROCESSED', label: 'Processed' }, { value: 'FAILED', label: 'Failed' } ];

    return (
        <div className="bg-card border border-border rounded-2xl p-3 shadow-xs space-y-2.5">
            <div className="flex justify-between items-center border-b border-border/60 pb-1.5">
                <h3 className="text-xs font-bold text-foreground tracking-tight">
                    {formatDate(payPeriodStart)} - {formatDate(payPeriodEnd)}
                </h3>
                <div className="flex items-center gap-1">
                    {isEditing ? (
                        <>
                            <button onClick={() => onSave(id)} className="p-1 rounded-lg hover:bg-green-500/10 text-green-600" title="Save"><Check className="h-4 w-4" /></button>
                            <button onClick={onCancel} className="p-1 rounded-lg hover:bg-red-500/10 text-red-600" title="Cancel"><X className="h-4 w-4" /></button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => onDownload(id)} className="p-1 rounded-lg hover:bg-background-muted text-foreground-muted hover:text-primary transition-colors" title="Download Payslip"><Download className="h-3.5 w-3.5" /></button>
                            <button onClick={() => onEdit(payroll)} className="p-1 rounded-lg hover:bg-background-muted text-foreground-muted hover:text-primary transition-colors" title="Edit Record"><Pencil className="h-3.5 w-3.5" /></button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {isEditing ? (
                    <>
                        <EditField label="Gross Salary" name="grossSalary" value={payroll.grossSalary} onChange={onChange} type="number" />
                        <EditField label="Net Salary" name="netSalary" value={payroll.netSalary} onChange={onChange} type="number" />
                        <EditField label="Basic Salary" name="basicSalary" value={payroll.basicSalary} onChange={onChange} type="number" />
                        <EditField label="Allowances" name="allowances" value={payroll.allowances} onChange={onChange} type="number" />
                        <EditField label="Deductions" name="deductions" value={payroll.deductions} onChange={onChange} type="number" />
                        <EditField label="Tax Amount" name="taxAmount" value={payroll.taxAmount} onChange={onChange} type="number" />
                        <EditField label="Payout Date" name="payoutDate" value={formatDateForInput(payroll.payoutDate)} onChange={onChange} type="date" />
                        <EditField label="Status" name="status" value={payroll.status} onChange={onChange} type="select" options={statusOptions} />
                        <div className="sm:col-span-2 md:col-span-3">
                            <EditField label="Remarks" name="remarks" value={payroll.remarks} onChange={onChange} />
                        </div>
                    </>
                ) : (
                    <>
                        <InfoField label="Gross Salary" value={formatCurrency(grossSalary, currency)} />
                        <InfoField label="Net Salary" value={formatCurrency(netSalary, currency)} />
                        <InfoField label="Payout Date" value={payoutDate ? new Date(payoutDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'} />
                        <InfoField label="Basic Salary" value={formatCurrency(basicSalary, currency)} />
                        <InfoField label="Allowances" value={formatCurrency(allowances, currency)} />
                        <InfoField label="Deductions" value={formatCurrency(deductions, currency)} />
                        <InfoField label="Tax" value={formatCurrency(taxAmount, currency)} />
                        <div className="bg-background/60 border border-border/60 rounded-xl p-2.5 space-y-0.5 shadow-2xs">
                            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Status</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                                displayStatus === 'PROCESSED' ? 'bg-green-500/10 text-green-700 dark:text-green-300' : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
                            }`}>
                                {displayStatus.toLowerCase()}
                            </span>
                        </div>
                        <div className="sm:col-span-2 md:col-span-3">
                            <InfoField label="Remarks" value={remarks} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Main Payroll Component ---

const Payroll = ({ employee }) => {
    const [payrolls, setPayrolls] = useState(employee?.payrolls || []);
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchDate, setSearchDate] = useState('');    const [newPayrollData, setNewPayrollData] = useState({ payPeriodStart: '', payPeriodEnd: '', payFrequency: 'MONTHLY', grossSalary: 0, netSalary: 0, basicSalary: 0, allowances: 0, deductions: 0, taxAmount: 0, currency: 'AED', status: 'PENDING', remarks: '' });
    const [editingPayrollId, setEditingPayrollId] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (employee?.payrolls) {
            setPayrolls(employee.payrolls);
        } else if (employee?.employeeCode) {
            const fetchPayrolls = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`${API_URL}/payrolls/${employee.employeeCode}`, {
                        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
                    });
                    setPayrolls(response.data || []);
                } catch (err) {
                    console.error("Error fetching payrolls:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchPayrolls();
        }
    }, [employee, API_URL]);

    const handleEdit = (payroll) => {
        setEditingPayrollId(payroll.id);
        setFormData(payroll);
    };

    const handleCancel = () => {
        setEditingPayrollId(null);
        setFormData({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (payrollId) => {
        setLoading(true);
        setError('');
        try {
            await axios.put(`${API_URL}/payrolls/${employee.employeeCode}/${payrollId}`, formData, {
                headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
            });
            
            // Optimistic update of local state
            const updatedPayrolls = payrolls.map(p => 
                p.id === payrollId ? { ...p, ...formData } : p
            );
            setPayrolls(updatedPayrolls);
            alert(`Payroll record updated successfully!`);
            setEditingPayrollId(null);
        } catch (err) {
            console.error("Error updating payroll:", err);
            setError('Failed to update payroll. Please try again.');
            alert('Failed to update payroll.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (payrollId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/payrolls/${employee.employeeCode}/${payrollId}/payslip`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payslip_${employee.employeeCode}_${payrollId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading payslip:", err);
            alert('Failed to download payslip. The record might not exist or an error occurred.');
        }
    };

    const handleGenerateChange = (e) => {
        const { name, value } = e.target;
        setNewPayrollData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post(`${API_URL}/payrolls/${employee.employeeCode}`, newPayrollData, {
                headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
            });

            const response = await axios.get(`${API_URL}/employees/${employee.employeeCode}`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
            });
            setPayrolls(response.data.payrolls || []);

            alert('Payroll generated successfully!');
            setIsGenerating(false);
            setNewPayrollData({ payPeriodStart: '', payPeriodEnd: '', payFrequency: 'MONTHLY', grossSalary: 0, netSalary: 0, basicSalary: 0, allowances: 0, deductions: 0, taxAmount: 0, currency: 'AED', status: 'PENDING', remarks: '' });
        } catch (err) {
            const errorMessage = err.response?.data || 'Failed to generate payroll. Please try again.';
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = [ { value: 'PENDING', label: 'Pending' }, { value: 'PROCESSED', label: 'Processed' }, { value: 'FAILED', label: 'Failed' } ];

    const filteredPayrolls = payrolls.filter(payroll => 
        !searchDate || (payroll.payPeriodStart && payroll.payPeriodStart.startsWith(searchDate))
    );

    return (
        <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <div className="w-full sm:w-56">
                    <input
                        id="searchDate"
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                    />
                </div>
                <button onClick={() => setIsGenerating(true)} className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs">
                    <PlusCircle className="h-3.5 w-3.5" />
                    Generate Payroll
                </button>
            </div>

            {loading && <div className="text-center p-8"><Loader className="animate-spin h-6 w-6 mx-auto text-primary" /></div>}
            {error && <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-semibold">{error}</div>}

            {isGenerating && (
                <div className="bg-card border border-border rounded-2xl p-3 shadow-xs space-y-2.5">
                    <h3 className="text-xs font-bold text-foreground border-b border-border/60 pb-1.5">New Payroll Record</h3>
                    <form onSubmit={handleGenerateSubmit} className="space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            <EditField label="Pay Period Start" name="payPeriodStart" value={newPayrollData.payPeriodStart} onChange={handleGenerateChange} type="date" required />
                            <EditField label="Pay Period End" name="payPeriodEnd" value={newPayrollData.payPeriodEnd} onChange={handleGenerateChange} type="date" required />
                            <EditField label="Gross Salary" name="grossSalary" value={newPayrollData.grossSalary} onChange={handleGenerateChange} type="number" />
                            <EditField label="Net Salary" name="netSalary" value={newPayrollData.netSalary} onChange={handleGenerateChange} type="number" />
                            <EditField label="Basic Salary" name="basicSalary" value={newPayrollData.basicSalary} onChange={handleGenerateChange} type="number" />
                            <EditField label="Allowances" name="allowances" value={newPayrollData.allowances} onChange={handleGenerateChange} type="number" />
                            <EditField label="Deductions" name="deductions" value={newPayrollData.deductions} onChange={handleGenerateChange} type="number" />
                            <EditField label="Tax Amount" name="taxAmount" value={newPayrollData.taxAmount} onChange={handleGenerateChange} type="number" />
                            <EditField label="Currency" name="currency" value={newPayrollData.currency} onChange={handleGenerateChange} />
                            <EditField label="Status" name="status" value={newPayrollData.status} onChange={handleGenerateChange} type="select" options={statusOptions} />
                            <div className="sm:col-span-2 md:col-span-3">
                                <EditField label="Remarks" name="remarks" value={newPayrollData.remarks} onChange={handleGenerateChange} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                            <button type="button" onClick={() => setIsGenerating(false)} className="px-3 py-1.5 rounded-lg border border-border hover:bg-background-muted text-xs font-semibold transition-colors">Cancel</button>
                            <button type="submit" className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-semibold transition-colors shadow-xs">Save</button>
                        </div>
                    </form>
                </div>
            )}

            {filteredPayrolls.length > 0 ? (
                filteredPayrolls.map(payroll => (
                    <PayrollCard
                        key={payroll.id}
                        payroll={editingPayrollId === payroll.id ? formData : payroll}
                        isEditing={editingPayrollId === payroll.id}
                        onEdit={handleEdit}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        onChange={handleChange}
                        onDownload={handleDownload}
                    />
                ))
            ) : (
                <div className="text-center text-foreground-muted py-10">
                    <FileText className="mx-auto h-12 w-12 text-foreground-muted/50" />
                    <h3 className="mt-2 text-sm font-semibold text-foreground">No Payroll Data</h3>
                    <p className="mt-1 text-sm text-foreground-muted">There is no payroll history available for this employee.</p>
                </div>
            )}
        </div>
    );
}

export default Payroll;
