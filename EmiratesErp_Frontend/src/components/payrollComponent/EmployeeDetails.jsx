import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Banknote, HandCoins, Receipt, Loader, Edit, Check, X, ArrowLeft, Eye, Trash2 } from 'lucide-react';
import axios from 'axios';

// --- Helper Components ---
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

const InfoDisplay = ({ label, value }) => (
    <div>
        <p className="text-[11px] text-foreground-muted font-medium">{label}</p>
        <p className="text-xs font-semibold text-foreground">{value || <span className="text-foreground-muted/60">N/A</span>}</p>
    </div>
);

const statusStyles = {
    SUBMITTED: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    APPROVED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    REJECTED: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    ACTIVE: 'bg-primary/10 text-primary border-primary/20',
    COMPLETED: 'bg-foreground-muted/10 text-foreground-muted border-border',
};

// --- Bank Account Tab ---
const BankAccountTab = ({ employee }) => {
    const [account, setAccount] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const initialFormData = {
        bankName: '', accountNumber: '', ifscCode: '', iban: '', accountHolderName: '', routingCode: '', primary: true
    };
    const [formData, setFormData] = useState(initialFormData);

    const fetchAccount = useCallback(() => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/employee-bank-accounts/${employee.employeeCode}`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(response => {
                setAccount(response.data);
                setFormData(response.data);
            })
            .catch(err => {
                if (err.response && err.response.status === 404) {
                    setAccount(null);
                    setFormData(initialFormData);
                } else {
                    setError('Failed to load bank account details.');
                }
            })
            .finally(() => setLoading(false));
    }, [API_URL, employee.employeeCode]);

    useEffect(() => {
        fetchAccount();
    }, [fetchAccount]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaveLoading(true);
        const token = localStorage.getItem('token');
        axios.put(`${API_URL}/employee-bank-accounts/${employee.employeeCode}`, formData, { headers: { "Authorization": `Bearer ${token}` } })
            .then(response => {
                setAccount(response.data);
                setFormData(response.data);
                setIsEditing(false);
                alert('Bank account details saved successfully!');
            })
            .catch(err => {
                alert(err.response?.data?.message || 'Failed to save bank account details.');
            })
            .finally(() => setSaveLoading(false));
    };

    if (loading) {
        return <div className="flex justify-center items-center p-6"><Loader className="animate-spin h-5 w-5 text-primary" /></div>;
    }

    if (error) {
        return <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-md border border-rose-500/20">{error}</div>;
    }

    if (!isEditing && !account) {
        return (
            <div className="text-center py-6 border border-dashed border-border rounded-lg bg-card text-foreground">
                <h3 className="text-xs font-bold text-foreground">No Bank Account Found</h3>
                <p className="mt-0.5 text-[11px] text-foreground-muted">Add bank account details for this employee.</p>
                <div className="mt-3">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-2xs"
                    >
                        Add Account Details
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {!isEditing && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-2.5 py-1 text-xs font-semibold border border-border rounded-md bg-background hover:bg-background-muted text-foreground transition-colors flex items-center gap-1"
                    >
                        <Edit size={13} /> Edit
                    </button>
                </div>
            )}
            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-3 max-w-lg p-3 bg-card border border-border rounded-lg text-foreground">
                    <InputField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} required />
                    <InputField label="Account Holder Name" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} required />
                    <InputField label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required />
                    <InputField label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} required />
                    <InputField label="IBAN" name="iban" value={formData.iban} onChange={handleChange} />
                    <InputField label="Routing Code / Agent ID" name="routingCode" value={formData.routingCode} onChange={handleChange} />
                    <div className="flex items-center gap-2 pt-1">
                        <input type="checkbox" id="isPrimary" name="primary" checked={formData.primary} onChange={handleChange} className="h-3.5 w-3.5 rounded border-border text-primary" />
                        <label htmlFor="isPrimary" className="text-xs text-foreground font-medium">Set as primary account</label>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-border">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs font-semibold text-foreground-muted hover:bg-background-muted rounded-md transition-colors border border-border" disabled={saveLoading}>
                            Cancel
                        </button>
                        <button type="submit" className="px-3.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs h-7" disabled={saveLoading}>
                            {saveLoading && <Loader className="animate-spin h-3.5 w-3.5" />} Save
                        </button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-card border border-border rounded-lg text-foreground">
                    <InfoDisplay label="Bank Name" value={account.bankName} />
                    <InfoDisplay label="Account Holder Name" value={account.accountHolderName} />
                    <InfoDisplay label="Account Number" value={account.accountNumber} />
                    <InfoDisplay label="IFSC Code" value={account.ifscCode} />
                    <InfoDisplay label="IBAN" value={account.iban} />
                    <InfoDisplay label="Routing Code / Agent ID" value={account.routingCode} />
                    <InfoDisplay label="Primary Account" value={account.primary ? 'Yes' : 'No'} />
                </div>
            )}
        </div>
    );
};

// --- Loans Tab ---
const LoansTab = ({ employee }) => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchLoans = useCallback(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/employee-loans/employee/${employee.employeeCode}`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => setLoans(res.data))
            .catch(err => console.error("Error fetching loans:", err))
            .finally(() => setLoading(false));
    }, [API_URL, employee.employeeCode]);

    useEffect(() => { fetchLoans(); }, [fetchLoans]);

    const handleAction = async (loanId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this loan?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/employee-loans/${loanId}/${action}`, {}, { headers: { "Authorization": `Bearer ${token}` } });
            fetchLoans();
        } catch (err) {
            alert(`Failed to ${action} loan.`);
        }
    };

    if (loading) return <div className="flex justify-center items-center p-6"><Loader className="animate-spin h-5 w-5 text-primary" /></div>;

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-bold text-foreground">Loan History</h3>
            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full bg-card text-foreground divide-y divide-border">
                    <thead className="bg-background-muted/60">
                        <tr>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Product</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Amount</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">EMI</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Installments</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                            <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {loans.length > 0 ? loans.map(loan => (
                            <tr key={loan.id} className="hover:bg-background-muted/40 transition-colors">
                                <td className="px-3 py-2 text-xs font-semibold text-foreground">{loan.loanProductName}</td>
                                <td className="px-3 py-2 text-xs font-medium text-foreground">{loan.loanAmount}</td>
                                <td className="px-3 py-2 text-xs text-foreground-muted">{loan.emiAmount}</td>
                                <td className="px-3 py-2 text-xs text-foreground-muted">{loan.remainingInstallments}/{loan.totalInstallments}</td>
                                <td className="px-3 py-2 text-xs">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${statusStyles[loan.status] || 'bg-background-muted text-foreground-muted border-border'}`}>
                                        {loan.status?.toLowerCase()}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-xs text-right whitespace-nowrap">
                                    {loan.status === 'SUBMITTED' && (
                                        <div className="flex justify-end gap-1.5">
                                            <button onClick={() => handleAction(loan.id, 'approve')} className="px-2 py-0.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-md transition-colors">Approve</button>
                                            <button onClick={() => handleAction(loan.id, 'reject')} className="px-2 py-0.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 border border-rose-500/20 rounded-md transition-colors">Reject</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-center py-6 text-foreground-muted text-xs">No loan history found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Expenses Tab ---
const ExpensesTab = ({ employee }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingReceipt, setViewingReceipt] = useState(null);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchExpenses = useCallback(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/expenses/employee/${employee.employeeCode}`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => setExpenses(res.data))
            .catch(err => console.error("Error fetching expenses:", err))
            .finally(() => setLoading(false));
    }, [API_URL, employee.employeeCode]);

    useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

    const handleAction = async (expenseId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this expense?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/expenses/${expenseId}/${action}`, {}, { headers: { "Authorization": `Bearer ${token}` } });
            fetchExpenses();
        } catch (err) {
            alert(`Failed to ${action} expense.`);
        }
    };

    const handleDelete = async (expenseId) => {
        if (!window.confirm(`Are you sure you want to delete this expense claim? This action cannot be undone.`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/expenses/${expenseId}`, { headers: { "Authorization": `Bearer ${token}` } });
            fetchExpenses();
            alert('Expense claim deleted successfully.');
        } catch (err) {
            alert(`Failed to delete expense: ${err.response?.data?.message || 'Please try again.'}`);
        }
    };

    const handleViewReceipt = async (expense) => {
        if (!expense.receiptPath) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/expenses/${expense.id}/receipt`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob'
            });
            const file = new Blob([response.data], { type: response.headers['content-type'] });
            const fileURL = URL.createObjectURL(file);
            setViewingReceipt(fileURL);
        } catch (err) {
            console.error("Error fetching receipt:", err);
            alert("Could not load the receipt. It may have been deleted.");
        }
    };

    if (loading) return <div className="flex justify-center items-center p-6"><Loader className="animate-spin h-5 w-5 text-primary" /></div>;

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-bold text-foreground">Expense Claims</h3>
            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full bg-card text-foreground divide-y divide-border">
                    <thead className="bg-background-muted/60">
                        <tr>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Date</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Category</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Amount</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Receipt</th>
                            <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {expenses.length > 0 ? expenses.map(exp => (
                            <tr key={exp.id} className="hover:bg-background-muted/40 transition-colors">
                                <td className="px-3 py-2 text-xs font-semibold text-foreground">{new Date(exp.expenseDate).toLocaleDateString()}</td>
                                <td className="px-3 py-2 text-xs font-medium text-foreground">{exp.category}</td>
                                <td className="px-3 py-2 text-xs font-medium text-foreground">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'AED' }).format(exp.amount)}</td>
                                <td className="px-3 py-2 text-xs">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${statusStyles[exp.status] || 'bg-background-muted text-foreground-muted border-border'}`}>
                                        {exp.status?.toLowerCase()}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-xs text-foreground-muted">
                                    {exp.receiptPath && (
                                        <button onClick={() => handleViewReceipt(exp)} className="text-primary hover:underline text-[11px] flex items-center gap-1">
                                            <Eye size={13} /> View
                                        </button>
                                    )}
                                </td>
                                <td className="px-3 py-2 text-xs text-right whitespace-nowrap space-x-1">
                                    {exp.status === 'SUBMITTED' && (
                                        <>
                                            <button onClick={() => handleAction(exp.id, 'approve')} className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded-md transition-colors border border-border bg-background" title="Approve"><Check size={13} /></button>
                                            <button onClick={() => handleAction(exp.id, 'reject')} className="p-1 text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors border border-border bg-background" title="Reject"><X size={13} /></button>
                                        </>
                                    )}
                                    <button onClick={() => handleDelete(exp.id)} className="p-1 text-foreground-muted hover:text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors border border-border bg-background" title="Delete"><Trash2 size={13} /></button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-center py-6 text-foreground-muted text-xs">No expense claims found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {viewingReceipt && (
                <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4" onClick={() => setViewingReceipt(null)}>
                    <div className="bg-card p-2 rounded-lg max-w-4xl max-h-[90vh] border border-border" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end">
                            <button onClick={() => setViewingReceipt(null)} className="p-1.5 rounded-md hover:bg-background-muted text-foreground transition-colors mb-1">
                                <X size={16} />
                            </button>
                        </div>
                        <img src={viewingReceipt} alt="Expense Receipt" className="max-w-full max-h-[80vh] object-contain rounded-md" />
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Component ---
const EmployeeDetails = ({ searchTerm = "" }) => {
    const [allEmployees, setAllEmployees] = useState([]);
    const [employee, setEmployee] = useState(null);
    const [listLoading, setListLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeSubTab, setActiveSubTab] = useState('Bank Account');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchAllEmployees = async () => {
            setListLoading(true);
            setError("");
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/employees/all`, { headers: { "Authorization": `Bearer ${token}` } });
                setAllEmployees(response.data);
            } catch (err) {
                setError("Failed to fetch employee list.");
                console.error(err);
            } finally {
                setListLoading(false);
            }
        };
        fetchAllEmployees();
    }, [API_URL]);

    const filteredEmployees = useMemo(() => {
        if (!searchTerm) return allEmployees;
        const lowercasedFilter = searchTerm.toLowerCase().trim();
        return allEmployees.filter(emp =>
            (emp.firstName && emp.firstName.toLowerCase().includes(lowercasedFilter)) ||
            (emp.lastName && emp.lastName.toLowerCase().includes(lowercasedFilter)) ||
            (`${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase().includes(lowercasedFilter)) ||
            (emp.employeeCode && emp.employeeCode.toLowerCase().includes(lowercasedFilter))
        );
    }, [allEmployees, searchTerm]);

    const handleSelectEmployee = (emp) => {
        setEmployee(emp);
    };

    const handleBackToList = () => {
        setEmployee(null);
    };

    const subTabs = [
        { name: 'Bank Account', icon: Banknote, component: BankAccountTab },
        { name: 'Loans', icon: HandCoins, component: LoansTab },
        { name: 'Expenses', icon: Receipt, component: ExpensesTab },
    ];

    const ActiveSubComponent = subTabs.find(tab => tab.name === activeSubTab)?.component;

    return (
        <div className="space-y-3">
            {employee && (
                <div className="flex items-center gap-4 mb-3">
                    <button
                        onClick={handleBackToList}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-background-muted transition-colors flex items-center gap-1.5 text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Employee List
                    </button>
                </div>
            )}

            {error && (
                <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-lg border border-rose-500/20">
                    {error}
                </div>
            )}

            {!employee ? (
                listLoading ? (
                    <div className="flex justify-center items-center p-8 bg-card rounded-lg border border-border">
                        <Loader className="animate-spin h-6 w-6 text-primary" />
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="min-w-full bg-card text-foreground divide-y divide-border">
                            <thead className="bg-background-muted/60">
                                <tr>
                                    <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Name</th>
                                    <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Employee Code</th>
                                    <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Work Email</th>
                                    <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {filteredEmployees.length > 0 ? filteredEmployees.map(emp => (
                                    <tr key={emp.employeeCode || emp.id} onClick={() => handleSelectEmployee(emp)} className="cursor-pointer hover:bg-background-muted/40 transition-colors">
                                        <td className="px-3 py-2 text-xs font-semibold text-foreground">{emp.firstName} {emp.lastName}</td>
                                        <td className="px-3 py-2 text-xs text-foreground-muted font-medium">{emp.employeeCode}</td>
                                        <td className="px-3 py-2 text-xs text-foreground-muted">{emp.emailWork || '-'}</td>
                                        <td className="px-3 py-2 text-xs">
                                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${emp.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                                                {emp.status?.toLowerCase() || 'active'}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-foreground-muted text-xs">No employees found matching your search.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-2.5 p-2 bg-card border border-border rounded-lg">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs border border-primary/20 shrink-0">
                            {employee.firstName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-xs text-foreground leading-tight">{employee.firstName} {employee.lastName}</h3>
                            <p className="text-[10px] text-foreground-muted leading-tight">{employee.employeeCode}</p>
                        </div>
                    </div>

                    <div className="border-b border-border pb-0.5 mb-3">
                        <nav className="-mb-px flex space-x-3 overflow-x-auto" aria-label="Sub-tabs">
                            {subTabs.map((tab) => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveSubTab(tab.name)}
                                    className={`whitespace-nowrap flex items-center gap-1.5 py-1 px-0.5 border-b-2 font-medium text-[11px] transition-colors ${activeSubTab === tab.name
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
                        {ActiveSubComponent && <ActiveSubComponent employee={employee} />}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeDetails;