import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
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
    Calculator as CalcIcon
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

const PurAdditionalExpenseForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;
    const location = useLocation();

    const [activeTab, setActiveTab] = useState('main');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [showGenerateMenu, setShowGenerateMenu] = useState(false);

    const [form, setForm] = useState({
        number: '',
        date: new Date().toISOString().split('T')[0],
        supplierId: '',
        contract: '',
        transactionType: 'For Purchase',
        purchaseOrderId: '',
        currency: 'AED',
        exchangeRate: 1.0,
        comment: '',
        status: 'Draft',
        expenseLines: [],
        inventoryItems: []
    });

    // Masters
    const [companies, setCompanies] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const [products, setProducts] = useState([]);
    const [units, setUnits] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [grns, setGrns] = useState([]);
    const [currencies, setCurrencies] = useState([]);

    useEffect(() => {
        const loadMasters = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                
                const results = await Promise.allSettled([
                    axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', size: 1000 } }),
                    axios.get(`${API_URL}/purchases/orders`, { headers, params: { size: 1000 } }),
                    axios.get(`${API_URL}/production/taxes`, { headers }),
                    axios.get(`${API_URL}/purchases/additional-expenses/service-products`, { headers }),
                    axios.get(`${API_URL}/production/units`, { headers }),
                    axios.get(`${API_URL}/purchases/additional-expenses/invoices`, { headers }),
                    axios.get(`${API_URL}/purchases/additional-expenses/grns`, { headers }),
                    axios.get(`${API_URL}/accounts/currencies`, { headers })
                ]);
                
                const [compRes, poRes, taxRes, prodRes, unitRes, invRes, grnRes, currRes] = results.map(r => r.status === 'fulfilled' ? r.value : { data: [] });

                setCompanies(compRes.data.content || compRes.data || []);
                setPurchaseOrders(poRes.data.content || poRes.data || []);
                setTaxes(taxRes.data.content || taxRes.data || []);
                setProducts(prodRes.data.content || prodRes.data || []);
                setUnits(unitRes.data.content || unitRes.data || []);
                setInvoices(invRes.data.content || invRes.data || []);
                setGrns(grnRes.data.content || grnRes.data || []);
                setCurrencies(currRes.data || []);

                if (isEditing) {
                    const res = await axios.get(`${API_URL}/purchases/additional-expenses/${id}`, { headers });
                    setForm(res.data);
                } else if (location.state?.fromPo) {
                    const po = location.state.fromPo;
                    const inventoryItems = (po.items || []).map(poItem => ({
                        documentType: 'Purchase Order',
                        documentId: po.poNumber || po.id,
                        productId: poItem.item?.id || poItem.itemId || '',
                        batch: '',
                        quantity: poItem.quantity || 1,
                        unitId: poItem.unit?.id || poItem.unitId || '',
                        price: poItem.rate || 0,
                        amount: poItem.amount || ((poItem.quantity || 1) * (poItem.rate || 0)),
                        factor: 1,
                        expenseAmount: 0
                    }));
                    setForm(prev => ({
                        ...prev,
                        supplierId: po.supplierId || po.supplier?.id || '',
                        purchaseOrderId: po.id,
                        currency: po.currency || prev.currency,
                        inventoryItems: inventoryItems
                    }));
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
        const { name, value } = e.target;
        setForm(prev => {
            const newForm = { ...prev, [name]: value };
            // Reset Purchase Order if Supplier changes
            if (name === 'supplierId') {
                newForm.purchaseOrderId = '';
            }
            
            // Auto-populate inventory items if purchase order is selected on the main tab
            if (name === 'purchaseOrderId' && value) {
                const selectedPo = purchaseOrders.find(po => String(po.id) === String(value));
                if (selectedPo && selectedPo.items && selectedPo.items.length > 0) {
                    newForm.inventoryItems = selectedPo.items.map(poItem => ({
                        documentType: 'Purchase Order',
                        documentId: selectedPo.poNumber || selectedPo.id,
                        productId: poItem.item?.id || '',
                        batch: '',
                        quantity: poItem.quantity || 1,
                        unitId: poItem.unit?.id || '',
                        price: poItem.rate || 0,
                        amount: poItem.amount || ((poItem.quantity || 1) * (poItem.rate || 0)),
                        factor: 1,
                        expenseAmount: 0
                    }));
                }
            }
            
            return newForm;
        });
    };

    // Filter POs by selected supplier
    const filteredPurchaseOrders = useMemo(() => {
        if (!form.supplierId) return purchaseOrders;
        return purchaseOrders.filter(po => String(po.supplierId) === String(form.supplierId));
    }, [purchaseOrders, form.supplierId]);

    // Expense Lines logic
    const addExpenseLine = () => {
        setForm(prev => ({
            ...prev,
            expenseLines: [
                ...prev.expenseLines,
                { productId: '', unitId: '', amount: 0, taxId: '', taxAmount: 0, totalAmount: 0 }
            ]
        }));
    };

    const updateExpenseLine = (idx, field, value) => {
        setForm(prev => {
            const lines = [...prev.expenseLines];
            const line = { ...lines[idx], [field]: value };
            
            // Recalculate tax if taxId or amount changes
            if (field === 'amount' || field === 'taxId') {
                const tax = taxes.find(t => t.id === Number(line.taxId));
                const amt = Number(line.amount) || 0;
                line.taxAmount = tax ? (amt * (tax.rate / 100)) : 0;
                line.totalAmount = amt + line.taxAmount;
            }
            
            lines[idx] = line;
            return { ...prev, expenseLines: lines };
        });
    };

    const removeExpenseLine = (idx) => {
        setForm(prev => ({
            ...prev,
            expenseLines: prev.expenseLines.filter((_, i) => i !== idx)
        }));
    };

    // Inventory Items logic
    const addInventoryItem = () => {
        setForm(prev => ({
            ...prev,
            inventoryItems: [
                ...prev.inventoryItems,
                { documentType: 'Purchase Invoice', documentId: '', productId: '', batch: '', quantity: 1, unitId: '', price: 0, amount: 0, factor: 1, expenseAmount: 0 }
            ]
        }));
    };

    const updateInventoryItem = (idx, field, value) => {
        setForm(prev => {
            const items = [...prev.inventoryItems];
            const item = { ...items[idx], [field]: value };
            
            if (field === 'quantity' || field === 'price') {
                item.amount = (Number(item.quantity) || 0) * (Number(item.price) || 0);
            }
            
            if (field === 'documentId' && value) {
                if (item.documentType === 'Purchase Invoice') {
                    const selectedInv = invoices.find(inv => String(inv.billNumber || inv.id) === String(value));
                    if (selectedInv && selectedInv.lines && selectedInv.lines.length > 0) {
                        const newItems = selectedInv.lines.map(line => ({
                            documentType: 'Purchase Invoice',
                            documentId: value,
                            productId: line.item?.id || '',
                            batch: '',
                            quantity: line.quantityNet || line.quantityGross || 1,
                            unitId: line.unit?.id || '',
                            price: line.rate || 0,
                            amount: line.amount || (line.rate * (line.quantityNet || line.quantityGross || 1)) || 0,
                            factor: 1,
                            expenseAmount: 0
                        }));
                        items.splice(idx, 1, ...newItems);
                        return { ...prev, inventoryItems: items };
                    }
                } else if (item.documentType === 'GRN') {
                    const selectedGrn = grns.find(g => String(g.grnNumber || g.id) === String(value));
                    if (selectedGrn && selectedGrn.items && selectedGrn.items.length > 0) {
                        const newItems = selectedGrn.items.map(line => ({
                            documentType: 'GRN',
                            documentId: value,
                            productId: line.purchaseOrderItem?.item?.id || line.item?.id || '',
                            batch: line.lotNo || line.batchNumber || '',
                            quantity: line.acceptedQuantity || line.receivedQuantity || 1,
                            unitId: line.unit?.id || line.purchaseOrderItem?.unit?.id || '',
                            price: line.rate || line.ratePerKg || 0,
                            amount: line.totalValue || ((line.acceptedQuantity || line.receivedQuantity || 1) * (line.rate || line.ratePerKg || 0)) || 0,
                            factor: 1,
                            expenseAmount: 0
                        }));
                        items.splice(idx, 1, ...newItems);
                        return { ...prev, inventoryItems: items };
                    }
                } else if (item.documentType === 'Purchase Order') {
                    const selectedPo = purchaseOrders.find(po => String(po.poNumber || po.id) === String(value));
                    if (selectedPo && selectedPo.items && selectedPo.items.length > 0) {
                        const newItems = selectedPo.items.map(line => ({
                            documentType: 'Purchase Order',
                            documentId: value,
                            productId: line.item?.id || '',
                            batch: '',
                            quantity: line.quantity || 1,
                            unitId: line.unit?.id || '',
                            price: line.rate || 0,
                            amount: line.amount || ((line.quantity || 1) * (line.rate || 0)),
                            factor: 1,
                            expenseAmount: 0
                        }));
                        items.splice(idx, 1, ...newItems);
                        return { ...prev, inventoryItems: items };
                    }
                }
            }
            
            items[idx] = item;
            return { ...prev, inventoryItems: items };
        });
    };

    const removeInventoryItem = (idx) => {
        setForm(prev => ({
            ...prev,
            inventoryItems: prev.inventoryItems.filter((_, i) => i !== idx)
        }));
    };

    // Distribution logic
    const distributeExpenses = (method) => {
        const totalExpense = form.expenseLines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
        if (totalExpense === 0 || form.inventoryItems.length === 0) return;

        setForm(prev => {
            const items = [...prev.inventoryItems];
            if (method === 'By Quantity') {
                const totalQty = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
                if (totalQty === 0) return prev;
                items.forEach(i => {
                    i.expenseAmount = (totalExpense * (Number(i.quantity) || 0)) / totalQty;
                });
            } else if (method === 'By Amount') {
                const totalAmt = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
                if (totalAmt === 0) return prev;
                items.forEach(i => {
                    i.expenseAmount = (totalExpense * (Number(i.amount) || 0)) / totalAmt;
                });
            }
            return { ...prev, inventoryItems: items };
        });
    };

    const totalExpenseAmount = useMemo(() => {
        return form.expenseLines.reduce((sum, l) => sum + (Number(l.totalAmount) || 0), 0);
    }, [form.expenseLines]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            if (isEditing) {
                await axios.put(`${API_URL}/purchases/additional-expenses/${id}`, form, { headers });
            } else {
                await axios.post(`${API_URL}/purchases/additional-expenses`, form, { headers });
            }
            navigate('/purchase-dashboard/additional-expenses');
        } catch (err) {
            console.error('Failed to save', err);
            setError(err.response?.data?.message || 'Failed to save additional expense.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateBankPayment = () => {
        if (!isEditing) return;
        navigate('/purchase-dashboard/payments/new', {
            state: {
                supplierId: form.supplierId,
                amount: totalExpenseAmount,
                basis: form.number,
                isAdditionalExpense: true,
                aeId: id
            }
        });
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/purchase-dashboard/additional-expenses')} className="p-2 hover:bg-background-muted rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {isEditing ? `Edit Additional Expense: ${form.number}` : 'Create Additional Expense'}
                        </h1>
                        <nav className="text-sm text-foreground-muted">
                            <Link to="/purchase-dashboard" className="hover:text-primary">Purchase</Link> / 
                            <Link to="/purchase-dashboard/additional-expenses" className="ml-1 hover:text-primary">Additional Expenses</Link> / 
                            <span className="ml-1 font-medium text-foreground">{isEditing ? 'Edit' : 'New'}</span>
                        </nav>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        type="button" 
                        onClick={async () => {
                            setForm(prev => ({ ...prev, status: 'Posted' }));
                            // We need to wait for state update or pass the status directly
                            const updatedForm = { ...form, status: 'Posted' };
                            setLoading(true);
                            try {
                                const token = localStorage.getItem('token');
                                const headers = { Authorization: `Bearer ${token}` };
                                if (isEditing) {
                                    await axios.put(`${API_URL}/purchases/additional-expenses/${id}`, updatedForm, { headers });
                                } else {
                                    await axios.post(`${API_URL}/purchases/additional-expenses`, updatedForm, { headers });
                                }
                                navigate('/purchase-dashboard/additional-expenses');
                            } catch (err) {
                                setError(err.response?.data?.message || 'Failed to post additional expense.');
                            } finally {
                                setLoading(false);
                            }
                        }}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                        Post and close
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSubmit}
                        className="px-6 py-2.5 bg-card border border-border text-foreground rounded-lg font-semibold hover:bg-background-muted transition-all"
                    >
                        Save
                    </button>

                    {isEditing && (
                        <div className="relative">
                            <button 
                                type="button" 
                                onClick={() => setShowGenerateMenu(!showGenerateMenu)}
                                className="px-4 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
                            >
                                Generate
                                <ChevronDown size={16} />
                            </button>
                            {showGenerateMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 py-2">
                                    <button 
                                        onClick={handleGenerateBankPayment}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-background-muted transition-colors flex items-center gap-2"
                                    >
                                        <DollarSign size={14} />
                                        Bank Payment
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
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
                    <TabButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')}>Expenses ({form.expenseLines.length})</TabButton>
                    <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>Inventory ({form.inventoryItems.length})</TabButton>
                    <TabButton active={activeTab === 'terms'} onClick={() => setActiveTab('terms')}>Payment Terms</TabButton>
                    <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')}>Additional Information</TabButton>
                </div>

                <div className="p-8">
                    {activeTab === 'main' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-6">
                                <Select label="Supplier" name="supplierId" value={form.supplierId} onChange={handleChange}>
                                    <option value="">Select Supplier</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.companyName || c.name}</option>)}
                                </Select>
                                <Select label="Contract" name="contract" value={form.contract} onChange={handleChange}>
                                    <option value="">Select Contract</option>
                                    <option value="Main Contract">Main Contract</option>
                                </Select>
                                <Select label="Purchase Order" name="purchaseOrderId" value={form.purchaseOrderId} onChange={handleChange}>
                                    <option value="">Select Purchase Order</option>
                                    {filteredPurchaseOrders.map(po => (
                                        <option key={po.id} value={po.id}>
                                            {po.poNumber || `PO-${po.id}`} {po.date ? `(${new Date(po.date).toLocaleDateString()})` : ''}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div className="space-y-6">
                                <Input label="Number" name="number" value={form.number} onChange={handleChange} placeholder="<Auto>" />
                                <Select label="Transaction Type" name="transactionType" value={form.transactionType} onChange={handleChange}>
                                    <option value="For Purchase">For Purchase</option>
                                    <option value="For Sales">For Sales</option>
                                </Select>
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Currency</label>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowCurrencyModal(true)}
                                            className="w-full px-4 py-2.5 bg-background-muted border border-border rounded-lg text-sm text-primary font-bold hover:bg-border transition-all flex items-center justify-between"
                                        >
                                            {form.currency} = {form.exchangeRate} AED
                                            <ChevronDown size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-2 lg:col-span-1">
                                <Input label="Date" type="date" name="date" value={form.date} onChange={handleChange} />
                                <div className="mt-6">
                                    <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Comment</label>
                                    <textarea 
                                        name="comment" 
                                        value={form.comment} 
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                                        placeholder="Add internal notes..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'expenses' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-background-muted p-4 rounded-xl border border-border">
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={addExpenseLine} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all">
                                        <PlusCircle size={16} /> Add Expense
                                    </button>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-foreground-muted">Total Expenses</span>
                                    <div className="text-2xl font-black text-primary">{totalExpenseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {form.currency}</div>
                                </div>
                            </div>

                            <div className="overflow-x-auto border rounded-2xl shadow-sm">
                                <table className="min-w-full divide-y divide-border">
                                    <thead className="bg-background-muted text-xs uppercase font-black text-foreground-muted">
                                        <tr>
                                            <th className="px-6 py-4 text-left">#</th>
                                            <th className="px-6 py-4 text-left">Service Item</th>
                                            <th className="px-6 py-4 text-left">UOM</th>
                                            <th className="px-6 py-4 text-right">Amount</th>
                                            <th className="px-6 py-4 text-left">Tax</th>
                                            <th className="px-6 py-4 text-right">Total</th>
                                            <th className="px-6 py-4 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border bg-card">
                                        {form.expenseLines.map((line, idx) => (
                                            <tr key={idx} className="hover:bg-background-muted transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium">{idx + 1}</td>
                                                <td className="px-6 py-4 min-w-[300px]">
                                                    <select 
                                                        value={line.productId} 
                                                        onChange={(e) => updateExpenseLine(idx, 'productId', e.target.value)}
                                                        className="w-full p-2 border border-border rounded-lg text-sm bg-card"
                                                    >
                                                        <option value="">Select Item</option>
                                                        {products.map(p => (
                                                            <option key={`${p.category}-${p.id}`} value={p.id}>
                                                                [{p.category}] {p.name} ({p.itemCode})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 w-32">
                                                    <select 
                                                        value={line.unitId} 
                                                        onChange={(e) => updateExpenseLine(idx, 'unitId', e.target.value)}
                                                        className="w-full p-2 border border-border rounded-lg text-sm bg-card"
                                                    >
                                                        <option value="">UOM</option>
                                                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 w-40">
                                                    <input 
                                                        type="number" 
                                                        value={line.amount} 
                                                        onChange={(e) => updateExpenseLine(idx, 'amount', e.target.value)}
                                                        className="w-full p-2 border border-border rounded-lg text-right text-sm bg-card font-mono"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 w-48">
                                                    <select 
                                                        value={line.taxId} 
                                                        onChange={(e) => updateExpenseLine(idx, 'taxId', e.target.value)}
                                                        className="w-full p-2 border border-border rounded-lg text-sm bg-card"
                                                    >
                                                        <option value="">No Tax</option>
                                                        {taxes.map(t => <option key={t.id} value={t.id}>{t.code || t.name} ({t.rate}%)</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-bold text-foreground">
                                                    {(line.totalAmount || 0).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button type="button" onClick={() => removeExpenseLine(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'inventory' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-background-muted p-4 rounded-xl border border-border">
                                <div className="flex items-center gap-4">
                                    <button type="button" onClick={addInventoryItem} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all">
                                        <PlusCircle size={16} /> Add Item
                                    </button>
                                    <div className="relative group">
                                        <button type="button" className="px-4 py-2 bg-white border border-border text-foreground rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-background-muted shadow-sm transition-all shadow-sm active:scale-95">
                                            Distribute Expenses <ChevronDown size={14} />
                                        </button>
                                        <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl hidden group-hover:block z-50 overflow-hidden">
                                            <button type="button" onClick={() => distributeExpenses('By Quantity')} className="w-full text-left px-4 py-3 text-sm hover:bg-background-muted flex items-center gap-2 transition-colors">
                                                <CalcIcon size={14} /> By Quantity
                                            </button>
                                            <button type="button" onClick={() => distributeExpenses('By Amount')} className="w-full text-left px-4 py-3 text-sm hover:bg-background-muted flex items-center gap-2 transition-colors">
                                                <DollarSign size={14} /> By Amount
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-8">
                                    <div className="text-right">
                                        <span className="text-xs text-foreground-muted uppercase font-bold tracking-wider">Line Items</span>
                                        <div className="text-xl font-black text-foreground">{form.inventoryItems.length}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-foreground-muted uppercase font-bold tracking-wider">Allocated Cost</span>
                                        <div className="text-xl font-black text-emerald-600">
                                            {form.inventoryItems.reduce((sum, i) => sum + (Number(i.expenseAmount) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} {form.currency}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto border rounded-2xl shadow-sm">
                                <table className="min-w-full divide-y divide-border text-sm">
                                    <thead className="bg-background-muted text-xs uppercase font-black text-foreground-muted">
                                        <tr>
                                            <th className="px-6 py-4 text-left">Document</th>
                                            <th className="px-6 py-4 text-left">Item</th>
                                            <th className="px-6 py-4 text-left">Batch</th>
                                            <th className="px-6 py-4 text-right">Qty</th>
                                            <th className="px-6 py-4 text-left">UOM</th>
                                            <th className="px-6 py-4 text-right">Price</th>
                                            <th className="px-6 py-4 text-right">Factor</th>
                                            <th className="px-6 py-4 text-right bg-primary/5 text-primary">Expense Amount</th>
                                            <th className="px-6 py-4 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border bg-card">
                                        {form.inventoryItems.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-background-muted transition-colors">
                                                <td className="px-6 py-4">
                                                    <select 
                                                        value={item.documentType} 
                                                        onChange={(e) => updateInventoryItem(idx, 'documentType', e.target.value)}
                                                        className="w-full p-1.5 border border-border rounded-lg bg-card text-xs mb-1 block"
                                                    >
                                                        <option value="Purchase Invoice">Purchase Invoice</option>
                                                        <option value="GRN">GRN</option>
                                                        <option value="Purchase Order">Purchase Order</option>
                                                    </select>
                                                    <select 
                                                        value={item.documentId} 
                                                        onChange={(e) => updateInventoryItem(idx, 'documentId', e.target.value)}
                                                        className="w-full p-1.5 border border-border rounded-lg bg-card text-xs font-bold"
                                                    >
                                                        <option value="">Select ID</option>
                                                        {item.documentType === 'Purchase Invoice' && invoices.map(inv => (
                                                            <option key={inv.id} value={inv.billNumber || inv.id}>
                                                                {inv.billNumber || `INV-${inv.id}`}
                                                            </option>
                                                        ))}
                                                        {item.documentType === 'GRN' && grns.map(g => (
                                                            <option key={g.id} value={g.grnNumber || g.id}>
                                                                {g.grnNumber || `GRN-${g.id}`}
                                                            </option>
                                                        ))}
                                                        {item.documentType === 'Purchase Order' && purchaseOrders.map(po => (
                                                            <option key={po.id} value={po.poNumber || po.id}>
                                                                {po.poNumber || `PO-${po.id}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 min-w-[200px]">
                                                    <select 
                                                        value={item.productId} 
                                                        onChange={(e) => updateInventoryItem(idx, 'productId', e.target.value)}
                                                        className="w-full p-2 border border-border rounded-lg text-sm bg-card font-semibold"
                                                    >
                                                        <option value="">Select Product</option>
                                                        {products.map(p => (
                                                            <option key={`${p.category}-${p.id}`} value={p.id}>
                                                                [{p.category}] {p.name} ({p.itemCode})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 w-32">
                                                    <input type="text" value={item.batch} onChange={(e) => updateInventoryItem(idx, 'batch', e.target.value)} className="w-full p-2 border border-border rounded-lg text-sm bg-card" placeholder="Batch" />
                                                </td>
                                                <td className="px-6 py-4 w-24">
                                                    <input type="number" value={item.quantity} onChange={(e) => updateInventoryItem(idx, 'quantity', e.target.value)} className="w-full p-2 border border-border rounded-lg text-right text-sm bg-card font-mono" />
                                                </td>
                                                <td className="px-6 py-4 w-32">
                                                    <select 
                                                        value={item.unitId} 
                                                        onChange={(e) => updateInventoryItem(idx, 'unitId', e.target.value)}
                                                        className="w-full p-2 border border-border rounded-lg text-sm bg-card"
                                                    >
                                                        <option value="">UOM</option>
                                                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 w-32">
                                                    <input type="number" value={item.price} onChange={(e) => updateInventoryItem(idx, 'price', e.target.value)} className="w-full p-2 border border-border rounded-lg text-right text-sm bg-card font-mono" />
                                                </td>
                                                <td className="px-6 py-4 w-20">
                                                    <input type="number" value={item.factor} onChange={(e) => updateInventoryItem(idx, 'factor', e.target.value)} className="w-full p-2 border border-border rounded-lg text-right text-sm bg-card font-mono" step="0.01" />
                                                </td>
                                                <td className="px-6 py-4 w-36 bg-primary/5">
                                                    <input 
                                                        type="number" 
                                                        value={item.expenseAmount} 
                                                        onChange={(e) => updateInventoryItem(idx, 'expenseAmount', e.target.value)}
                                                        className="w-full p-2 border-2 border-primary/20 rounded-lg text-right text-sm bg-card font-black text-primary shadow-inner"
                                                        readOnly
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button type="button" onClick={() => removeInventoryItem(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'terms' && (
                        <div className="flex flex-col items-center justify-center py-20 text-foreground-muted">
                            <Calculator size={48} className="opacity-20 mb-4" />
                            <h3 className="text-xl font-bold">Payment Terms</h3>
                            <p>This module section is coming soon.</p>
                        </div>
                    )}

                    {activeTab === 'info' && (
                        <div className="flex flex-col items-center justify-center py-20 text-foreground-muted">
                            <PlusCircle size={48} className="opacity-20 mb-4" />
                            <h3 className="text-xl font-bold">Additional Information</h3>
                            <p>Custom fields and metadata tracking coming soon.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Currency Modal (Simulated) */}
            {showCurrencyModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-background-muted/50">
                            <h3 className="text-lg font-bold">Prices and Currency</h3>
                            <button onClick={() => setShowCurrencyModal(false)} className="p-2 hover:bg-border rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-4">Document Currency</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <Select label="Currency" value={form.currency} onChange={(e) => setForm(prev => ({ ...prev, currency: e.target.value }))}>
                                        <option value="">Select</option>
                                        {currencies.map(c => <option key={c.id} value={c.currencyCode}>{c.currencyCode}</option>)}
                                    </Select>
                                    <Input label="Rate" type="number" value={form.exchangeRate} onChange={(e) => setForm(prev => ({ ...prev, exchangeRate: Number(e.target.value) }))} step="0.0001" />
                                </div>
                            </div>
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Accounting Currency</span>
                                    <span className="font-bold">USD (fixed)</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm font-medium">Rate to USD</span>
                                    <span className="font-mono text-primary font-bold">{ (1 / (form.exchangeRate || 1)).toFixed(6) }</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-background-muted border-t border-border flex justify-end gap-3">
                            <button onClick={() => setShowCurrencyModal(false)} className="px-6 py-2 rounded-lg font-bold hover:bg-border transition-all">Cancel</button>
                            <button onClick={() => setShowCurrencyModal(false)} className="px-8 py-2 bg-primary text-primary-foreground rounded-lg font-bold shadow-lg active:scale-95 transition-all">OK</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurAdditionalExpenseForm;
