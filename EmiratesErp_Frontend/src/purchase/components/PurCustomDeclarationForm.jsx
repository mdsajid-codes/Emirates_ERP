import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    Plus, 
    Trash2, 
    Save, 
    Loader, 
    ArrowLeft, 
    PlusCircle, 
    X, 
    Calculator, 
    ChevronDown,
    DollarSign,
    ClipboardCheck,
    FileSearch,
    Truck,
    User,
    CheckCircle2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const Input = ({ label, ...props }) => (
    <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-semibold text-foreground/70 mb-1.5">{label}</label>
        <input {...props} className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
    </div>
);

const Select = ({ label, children, ...props }) => (
    <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-semibold text-foreground/70 mb-1.5">{label}</label>
        <select {...props} className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white transition-all appearance-none cursor-pointer">
            {children}
        </select>
    </div>
);

const Checkbox = ({ label, checked, onChange, name }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
        <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${checked ? 'bg-primary border-primary' : 'bg-card border-border group-hover:border-primary/50'}`}>
            {checked && <CheckCircle2 size={14} className="text-white" />}
        </div>
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="hidden" />
        <span className="text-sm font-medium text-foreground/80">{label}</span>
    </label>
);

const TabButton = ({ active, children, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${
            active 
            ? 'border-primary text-primary bg-primary/5' 
            : 'border-transparent text-foreground-muted hover:text-foreground hover:bg-background-muted'
        }`}
    >
        {children}
    </button>
);

const PurCustomDeclarationForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [activeTab, setActiveTab] = useState('main');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showInvoicePicker, setShowInvoicePicker] = useState(false);

    const [form, setForm] = useState({
        declarationNumber: '',
        isThirdPartyClearance: false,
        companyName: '',
        taxIsDue: 'USE_IN_TAX_RETURN',
        serviceCharge: 0,
        isApplyCustomPenalty: false,
        customPenaltyAmount: 0,
        expenseAccountId: '',
        departmentId: '',
        expenseItemId: '',
        businessActivity: '',
        entityName: '',
        isGroupByHSCode: false,
        isIncludeServiceCharge: false,
        responsiblePersonId: '',
        status: 'Draft',
        lines: []
    });

    // Masters
    const [accounts, setAccounts] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [expenseItems, setExpenseItems] = useState([]);
    const [users, setUsers] = useState([]);
    const [items, setItems] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);

    useEffect(() => {
        const loadMasters = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                
                const results = await Promise.allSettled([
                    axios.get(`${API_URL}/accounts/chart-of-accounts`, { headers }),
                    axios.get(`${API_URL}/departments`, { headers }),
                    axios.get(`${API_URL}/accounts/expense-items`, { headers }),
                    axios.get(`${API_URL}/users`, { headers }),
                    axios.get(`${API_URL}/production/raw-materials`, { headers }),
                    axios.get(`${API_URL}/purchases/invoices`, { headers, params: { size: 1000 } })
                ]);
                
                const [accRes, deptRes, expRes, userRes, itemRes, invRes] = results.map(r => r.status === 'fulfilled' ? r.value : { data: [] });

                setAccounts(accRes.data || []);
                setDepartments(deptRes.data || []);
                setExpenseItems(expRes.data || []);
                setUsers(userRes.data || []);
                setItems(itemRes.data.content || itemRes.data || []);
                setInvoices(invRes.data.content || invRes.data || []);

                if (isEditing) {
                    const res = await axios.get(`${API_URL}/purchases/custom-declarations/${id}`, { headers });
                    setForm(res.data);
                }
            } catch (err) {
                console.error('Failed to load masters', err);
                setError('Failed to load required data.');
            } finally {
                setLoading(false);
            }
        };
        loadMasters();
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleLineChange = (idx, field, value) => {
        setForm(prev => {
            const lines = [...prev.lines];
            const line = { ...lines[idx], [field]: value };
            
            // Recalculate CIF National
            if (field === 'cifForeignValue' || field === 'exchangeRate') {
                const foreign = Number(line.cifForeignValue) || 0;
                const rate = Number(line.exchangeRate) || 1;
                line.cifNationalValue = foreign * rate;
            }

            // Recalculate Duty Amount
            if (field === 'dutyRate' || field === 'cifForeignValue' || field === 'exchangeRate') {
                const national = Number(line.cifNationalValue) || 0;
                const dRate = Number(line.dutyRate) || 0;
                line.dutyAmount = (national * dRate) / 100;
            }
            
            lines[idx] = line;
            return { ...prev, lines };
        });
    };

    const addLine = () => {
        setForm(prev => ({
            ...prev,
            lines: [
                ...prev.lines,
                { 
                    lineNumber: prev.lines.length + 1, 
                    itemId: '', 
                    hsCode: '', 
                    origin: '', 
                    cifForeignValue: 0, 
                    exchangeRate: 1, 
                    cifNationalValue: 0,
                    dutyRate: 0,
                    dutyAmount: 0,
                    vatRate: 5,
                    vatAmount: 0
                }
            ]
        }));
    };

    const removeLine = (idx) => {
        setForm(prev => ({
            ...prev,
            lines: prev.lines.filter((_, i) => i !== idx)
        }));
    };

    const handlePickInvoices = async () => {
        if (selectedInvoiceIds.length === 0) {
            setShowInvoicePicker(false);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/purchases/custom-declarations/generate-from-invoices`, selectedInvoiceIds, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setForm(prev => ({
                ...prev,
                lines: [...prev.lines, ...res.data.lines]
            }));
            setShowInvoicePicker(false);
        } catch (err) {
            console.error('Failed to generate from invoices', err);
            setError('Failed to generate declaration from selected invoices.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            // Clean up empty strings to null for ID fields
            const submissionData = {
                ...form,
                expenseAccountId: form.expenseAccountId || null,
                departmentId: form.departmentId || null,
                expenseItemId: form.expenseItemId || null,
                responsiblePersonId: form.responsiblePersonId || null,
                lines: form.lines.map(line => ({
                    ...line,
                    itemId: line.itemId || null,
                    purchaseInvoiceId: line.purchaseInvoiceId || null
                }))
            };

            if (isEditing) {
                await axios.put(`${API_URL}/purchases/custom-declarations/${id}`, submissionData, { headers });
            } else {
                await axios.post(`${API_URL}/purchases/custom-declarations`, submissionData, { headers });
            }
            navigate('/purchase-dashboard/custom-declarations');
        } catch (err) {
            console.error('Failed to save', err);
            setError(err.response?.data?.message || 'Failed to save custom declaration.');
        } finally {
            setLoading(false);
        }
    };

    const totals = useMemo(() => {
        const cifForeign = form.lines.reduce((sum, l) => sum + (Number(l.cifForeignValue) || 0), 0);
        const cifNational = form.lines.reduce((sum, l) => sum + (Number(l.cifNationalValue) || 0), 0);
        const vatTotal = form.lines.reduce((sum, l) => sum + (Number(l.vatAmount) || 0), 0);
        const dutyTotal = form.lines.reduce((sum, l) => sum + (Number(l.dutyAmount) || 0), 0);
        const totalDue = dutyTotal + (Number(form.serviceCharge) || 0) + (Number(form.customPenaltyAmount) || 0);

        return { cifForeign, cifNational, vatTotal, totalDue };
    }, [form.lines, form.serviceCharge, form.customPenaltyAmount]);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/purchase-dashboard/custom-declarations')} className="p-2 hover:bg-background-muted rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {isEditing ? `Edit Custom Declaration: ${form.declarationNumber}` : 'Create Custom Declaration'}
                        </h1>
                        <nav className="text-sm text-foreground-muted">
                            <Link to="/purchase-dashboard" className="hover:text-primary">Purchase</Link> / 
                            <Link to="/purchase-dashboard/custom-declarations" className="ml-1 hover:text-primary">Custom Declarations</Link> / 
                            <span className="ml-1 font-medium text-foreground">{isEditing ? 'Edit' : 'New'}</span>
                        </nav>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        type="button" 
                        onClick={handleSubmit}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Declaration
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 shadow-sm">
                    <X className="h-4 w-4" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
                <div className="flex border-b border-border bg-background-muted/30">
                    <TabButton active={activeTab === 'main'} onClick={() => setActiveTab('main')}>Main</TabButton>
                    <TabButton active={activeTab === 'lines'} onClick={() => setActiveTab('lines')}>Lines ({form.lines.length})</TabButton>
                    <TabButton active={activeTab === 'additional'} onClick={() => setActiveTab('additional')}>Additional Info</TabButton>
                </div>

                <div className="p-8">
                    {activeTab === 'main' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-6">
                                <Input label="Declaration Number" name="declarationNumber" value={form.declarationNumber} onChange={handleChange} placeholder="Enter number..." />
                                <div className="p-4 bg-background-muted/50 rounded-xl border border-border space-y-4">
                                    <Checkbox 
                                        label="Custom Clearance by Third Party" 
                                        name="isThirdPartyClearance" 
                                        checked={form.isThirdPartyClearance} 
                                        onChange={handleChange} 
                                    />
                                    <Input 
                                        label={form.isThirdPartyClearance ? "Custom Agent Name" : "Custom Office Name"} 
                                        name="companyName" 
                                        value={form.companyName} 
                                        onChange={handleChange} 
                                        placeholder="Name..." 
                                    />
                                </div>
                                <Select label="Tax Payment Mode" name="taxIsDue" value={form.taxIsDue} onChange={handleChange}>
                                    <option value="USE_IN_TAX_RETURN">Use in Tax Return</option>
                                    <option value="ON_THE_SUPPLY">On the Supply</option>
                                </Select>
                            </div>
                            
                            <div className="space-y-6">
                                <Input label="Service Charge" type="number" name="serviceCharge" value={form.serviceCharge} onChange={handleChange} />
                                <div className="p-4 bg-background-muted/50 rounded-xl border border-border space-y-4">
                                    <Checkbox 
                                        label="Apply Custom Penalty" 
                                        name="isApplyCustomPenalty" 
                                        checked={form.isApplyCustomPenalty} 
                                        onChange={handleChange} 
                                    />
                                    {form.isApplyCustomPenalty && (
                                        <Input label="Penalty Amount" type="number" name="customPenaltyAmount" value={form.customPenaltyAmount} onChange={handleChange} />
                                    )}
                                </div>
                                <Select label="Penalty Expense Account" name="expenseAccountId" value={form.expenseAccountId} onChange={handleChange}>
                                    <option value="">Select Account</option>
                                    {accounts.map(acc => <option key={acc.accountId} value={acc.accountId}>{acc.description} ({acc.accountCode})</option>)}
                                </Select>
                            </div>

                            <div className="space-y-6">
                                <Select label="Department" name="departmentId" value={form.departmentId} onChange={handleChange}>
                                    <option value="">Select Department</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </Select>
                                <Select label="Expense Item" name="expenseItemId" value={form.expenseItemId} onChange={handleChange}>
                                    <option value="">Select Expense Item</option>
                                    {expenseItems.map(ei => <option key={ei.expenseItemId} value={ei.expenseItemId}>{ei.description}</option>)}
                                </Select>
                                <Input label="Business Activity" name="businessActivity" value={form.businessActivity} onChange={handleChange} />
                                <Input label="Entity Name" name="entityName" value={form.entityName} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'lines' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-background-muted p-4 rounded-xl border border-border">
                                <div className="flex items-center gap-4">
                                    <button type="button" onClick={addLine} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all">
                                        <PlusCircle size={16} /> Add Line
                                    </button>
                                    <button type="button" onClick={() => setShowInvoicePicker(true)} className="px-4 py-2 bg-white border border-border text-foreground rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-background-muted shadow-sm transition-all shadow-sm active:scale-95">
                                        <FileSearch size={16} /> Pick Invoices
                                    </button>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <Checkbox label="Group by HS Code" name="isGroupByHSCode" checked={form.isGroupByHSCode} onChange={handleChange} />
                                    <Checkbox label="Include Service Charge in VAT" name="isIncludeServiceCharge" checked={form.isIncludeServiceCharge} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="overflow-x-auto border rounded-2xl shadow-sm">
                                <table className="min-w-full divide-y divide-border text-sm">
                                    <thead className="bg-background-muted text-xs uppercase font-black text-foreground-muted">
                                        <tr>
                                            <th className="px-4 py-4 text-left">#</th>
                                            <th className="px-4 py-4 text-left">Item / Invoice</th>
                                            <th className="px-4 py-4 text-left">HS Code / Origin</th>
                                            <th className="px-4 py-4 text-right">CIF Foreign</th>
                                            <th className="px-4 py-4 text-right">Rate</th>
                                            <th className="px-4 py-4 text-right">CIF National</th>
                                            <th className="px-4 py-4 text-right">Duty %</th>
                                            <th className="px-4 py-4 text-right">Duty Amt</th>
                                            <th className="px-4 py-4 text-right">VAT %</th>
                                            <th className="px-4 py-4 text-right">VAT Amt</th>
                                            <th className="px-4 py-4 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border bg-card">
                                        {form.lines.map((line, idx) => (
                                            <tr key={idx} className="hover:bg-background-muted transition-colors">
                                                <td className="px-4 py-4 text-xs font-bold text-foreground-muted">{idx + 1}</td>
                                                <td className="px-4 py-4 min-w-[200px]">
                                                    <select 
                                                        value={line.itemId} 
                                                        onChange={(e) => handleLineChange(idx, 'itemId', e.target.value)}
                                                        className="w-full p-1.5 border border-border rounded bg-card text-xs mb-1 font-bold"
                                                    >
                                                        <option value="">Select Item</option>
                                                        {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                                    </select>
                                                    <select 
                                                        value={line.purchaseInvoiceId} 
                                                        onChange={(e) => handleLineChange(idx, 'purchaseInvoiceId', e.target.value)}
                                                        className="w-full p-1.5 border border-border rounded bg-card text-[10px] text-foreground-muted"
                                                    >
                                                        <option value="">No Invoice</option>
                                                        {invoices.map(inv => <option key={inv.id} value={inv.id}>{inv.billNumber || `INV-${inv.id}`}</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-4 w-32">
                                                    <input type="text" value={line.hsCode} onChange={(e) => handleLineChange(idx, 'hsCode', e.target.value)} className="w-full p-1.5 border border-border rounded text-xs mb-1" placeholder="HS Code" />
                                                    <input type="text" value={line.origin} onChange={(e) => handleLineChange(idx, 'origin', e.target.value)} className="w-full p-1.5 border border-border rounded text-xs" placeholder="Origin" />
                                                </td>
                                                <td className="px-4 py-4 w-24">
                                                    <input type="number" value={line.cifForeignValue} onChange={(e) => handleLineChange(idx, 'cifForeignValue', e.target.value)} className="w-full p-1.5 border border-border rounded text-right text-xs font-mono" />
                                                </td>
                                                <td className="px-4 py-4 w-20">
                                                    <input type="number" value={line.exchangeRate} onChange={(e) => handleLineChange(idx, 'exchangeRate', e.target.value)} className="w-full p-1.5 border border-border rounded text-right text-xs font-mono" step="0.0001" />
                                                </td>
                                                <td className="px-4 py-4 w-28 text-right font-bold text-xs">
                                                    {(line.cifNationalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-4 w-20">
                                                    <input type="number" value={line.dutyRate} onChange={(e) => handleLineChange(idx, 'dutyRate', e.target.value)} className="w-full p-1.5 border border-border rounded text-right text-xs font-mono" />
                                                </td>
                                                <td className="px-4 py-4 w-28 text-right font-bold text-xs text-primary">
                                                    {(line.dutyAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-4 w-20">
                                                    <input type="number" value={line.vatRate} onChange={(e) => handleLineChange(idx, 'vatRate', e.target.value)} className="w-full p-1.5 border border-border rounded text-right text-xs font-mono" />
                                                </td>
                                                <td className="px-4 py-4 w-28 text-right font-bold text-xs text-emerald-600">
                                                    {(line.vatAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <button type="button" onClick={() => removeLine(idx)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'additional' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <Select label="Responsible Person" name="responsiblePersonId" value={form.responsiblePersonId} onChange={handleChange}>
                                    <option value="">Select User</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.username})</option>)}
                                </Select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Summary */}
                <div className="bg-background-muted/50 p-8 border-t border-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
                        <span className="text-xs font-black text-foreground-muted uppercase tracking-wider">CIF Foreign Total</span>
                        <div className="text-xl font-black text-foreground">{totals.cifForeign.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
                        <span className="text-xs font-black text-foreground-muted uppercase tracking-wider">CIF National Total</span>
                        <div className="text-xl font-black text-foreground">{totals.cifNational.toLocaleString(undefined, { minimumFractionDigits: 2 })} AED</div>
                    </div>
                    <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">VAT (Reverse Charge)</span>
                        <div className="text-xl font-black text-emerald-600">{totals.vatTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} AED</div>
                    </div>
                    <div className="p-4 bg-primary text-primary-foreground rounded-xl shadow-lg">
                        <span className="text-xs font-black uppercase tracking-wider opacity-80">Total Due (Customs)</span>
                        <div className="text-2xl font-black">{totals.totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })} AED</div>
                    </div>
                </div>
            </div>

            {/* Invoice Picker Modal */}
            {showInvoicePicker && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-4xl rounded-2xl shadow-2xl border border-border overflow-hidden">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-background-muted/50">
                            <div>
                                <h3 className="text-lg font-bold">Pick Purchase Invoices</h3>
                                <p className="text-sm text-foreground-muted">Select invoices to generate declaration lines.</p>
                            </div>
                            <button onClick={() => setShowInvoicePicker(false)} className="p-2 hover:bg-border rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-background-muted">
                                    <tr>
                                        <th className="px-4 py-3 text-left w-10"></th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Invoice No.</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Supplier</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {invoices.map(inv => (
                                        <tr key={inv.id} className="hover:bg-background-muted transition-colors cursor-pointer" onClick={() => {
                                            setSelectedInvoiceIds(prev => prev.includes(inv.id) ? prev.filter(id => id !== inv.id) : [...prev, inv.id]);
                                        }}>
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedInvoiceIds.includes(inv.id)} 
                                                    onChange={() => {}} // Handled by tr onClick
                                                    className="rounded border-border text-primary focus:ring-primary h-4 w-4" 
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm font-bold text-primary">{inv.billNumber || `INV-${inv.id}`}</td>
                                            <td className="px-4 py-3 text-sm">{inv.billDate ? new Date(inv.billDate).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm">{inv.supplierName || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold">{(inv.netTotal || 0).toLocaleString()} AED</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 bg-background-muted border-t border-border flex justify-end gap-3">
                            <button onClick={() => setShowInvoicePicker(false)} className="px-6 py-2 rounded-lg font-bold hover:bg-border transition-all">Cancel</button>
                            <button onClick={handlePickInvoices} className="px-8 py-2 bg-primary text-primary-foreground rounded-lg font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2">
                                <ClipboardCheck size={18} />
                                Add Selected ({selectedInvoiceIds.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurCustomDeclarationForm;
