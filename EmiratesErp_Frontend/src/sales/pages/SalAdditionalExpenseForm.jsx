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
    FileText
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const SalAdditionalExpenseForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isRTL, t } = useLanguage();
    const isEditing = !!id;

    const [activeTab, setActiveTab] = useState('main');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        number: '',
        date: new Date().toISOString().split('T')[0],
        companyId: '',
        contract: '',
        transactionType: 'For Sales',
        salesOrderId: '',
        currency: 'AED',
        exchangeRate: 1.0,
        comment: '',
        status: 'Draft',
        expenseLines: [],
        inventoryItems: []
    });

    // Masters
    const [companies, setCompanies] = useState([]);
    const [salesOrders, setSalesOrders] = useState([]);
    const [serviceProducts, setServiceProducts] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const [products, setProducts] = useState([]);
    const [units, setUnits] = useState([]);

    useEffect(() => {
        const loadMasters = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                
                const [compRes, soRes, spRes, taxRes, prodRes, unitRes] = await Promise.all([
                    axios.get(`${API_URL}/parties`, { headers, params: { type: 'CUSTOMER', size: 1000 } }),
                    axios.get(`${API_URL}/sales/orders`, { headers, params: { size: 1000 } }),
                    axios.get(`${API_URL}/sales/additional-expenses/service-products`, { headers }),
                    axios.get(`${API_URL}/production/taxes`, { headers }),
                    axios.get(`${API_URL}/production/raw-materials`, { headers, params: { size: 1000 } }),
                    axios.get(`${API_URL}/production/units`, { headers })
                ]);

                setCompanies(compRes.data.content || compRes.data || []);
                setSalesOrders(soRes.data.content || soRes.data || []);
                setServiceProducts(spRes.data.content || spRes.data || []);
                setTaxes(taxRes.data.content || taxRes.data || []);
                setProducts(prodRes.data.content || prodRes.data || []);
                setUnits(unitRes.data.content || unitRes.data || []);

                if (isEditing) {
                    const res = await axios.get(`${API_URL}/sales/additional-expenses/${id}`, { headers });
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
        const { name, value } = e.target;
        setForm(prev => {
            const newForm = { ...prev, [name]: value };
            if (name === 'companyId') {
                newForm.salesOrderId = '';
            }
            
            if (name === 'salesOrderId' && value) {
                const selectedSo = salesOrders.find(so => String(so.id) === String(value));
                if (selectedSo && selectedSo.items && selectedSo.items.length > 0) {
                    newForm.inventoryItems = selectedSo.items.map(soItem => ({
                        documentType: 'Sales Order',
                        documentId: selectedSo.salesOrderNumber || selectedSo.number || selectedSo.id,
                        productId: soItem.rawMaterialId || soItem.finishedGoodId || soItem.semiFinishedId || soItem.crmProductId || '',
                        batch: '',
                        quantity: soItem.quantity || 1,
                        unitId: soItem.unitId || soItem.unit?.id || '',
                        price: soItem.rate || 0,
                        amount: soItem.amount || ((soItem.quantity || 1) * (soItem.rate || 0)),
                        factor: 1,
                        expenseAmount: 0
                    }));
                }
            }
            
            return newForm;
        });
    };

    const filteredSalesOrders = useMemo(() => {
        if (!form.companyId) return salesOrders;
        return salesOrders.filter(so => 
            String(so.customerId || so.companyId || so.customer?.id) === String(form.companyId)
        );
    }, [salesOrders, form.companyId]);

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

    const addInventoryItem = () => {
        setForm(prev => ({
            ...prev,
            inventoryItems: [
                ...prev.inventoryItems,
                { documentType: '', documentId: '', productId: '', batch: '', quantity: 1, unitId: '', price: 0, amount: 0, factor: 1, expenseAmount: 0 }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const payload = {
                ...form,
                companyId: form.companyId ? Number(form.companyId) : null,
                salesOrderId: form.salesOrderId ? Number(form.salesOrderId) : null,
                exchangeRate: Number(form.exchangeRate) || 1.0,
                expenseLines: form.expenseLines.map(l => ({
                    ...l,
                    productId: l.productId ? Number(l.productId) : null,
                    unitId: l.unitId ? Number(l.unitId) : null,
                    taxId: l.taxId ? Number(l.taxId) : null,
                    amount: Number(l.amount) || 0,
                    taxAmount: Number(l.taxAmount) || 0,
                    totalAmount: Number(l.totalAmount) || 0
                })),
                inventoryItems: form.inventoryItems.map(i => ({
                    ...i,
                    productId: i.productId ? Number(i.productId) : null,
                    unitId: i.unitId ? Number(i.unitId) : null,
                    quantity: Number(i.quantity) || 0,
                    price: Number(i.price) || 0,
                    amount: Number(i.amount) || 0,
                    factor: Number(i.factor) || 1,
                    expenseAmount: Number(i.expenseAmount) || 0
                }))
            };

            if (isEditing) {
                await axios.put(`${API_URL}/sales/additional-expenses/${id}`, payload, { headers });
            } else {
                await axios.post(`${API_URL}/sales/additional-expenses`, payload, { headers });
            }
            navigate('/sales-dashboard/additional-expenses');
        } catch (err) {
            console.error('Submit failed', err);
            setError(err.response?.data?.message || 'Failed to save additional expense.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) {
        return (
            <div className="flex justify-center items-center h-64 bg-background">
                <Loader className="animate-spin text-primary w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground font-sans space-y-2 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Action Header Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <FileText size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">
                            {isEditing
                                ? (isRTL ? 'تعديل المصروف الإضافي' : 'Edit Additional Expense')
                                : (isRTL ? 'مصروف إضافي جديد' : 'New Additional Expense')}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none">
                            {isRTL ? 'أنشئ أو عدل مصروف إضافي لعملائك' : 'Create or edit an additional expense for your customer'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                        type="button"
                        onClick={() => navigate('/sales-dashboard/additional-expenses')}
                        className="px-3 py-1 border border-border bg-card hover:bg-hover text-foreground rounded-md text-[11px] font-semibold transition-colors"
                    >
                        {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        form="add-expense-form"
                        disabled={loading}
                        className="px-3.5 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs disabled:opacity-50"
                    >
                        {loading ? <Loader size={13} className="animate-spin" /> : <Save size={13} />}
                        {isEditing ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'حفظ' : 'Save')}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-2 rounded text-xs">
                    {error}
                </div>
            )}

            {/* Main Expense Form */}
            <form id="add-expense-form" onSubmit={handleSubmit} className="space-y-2">
                {/* Header Information Card */}
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-border">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <FileText size={13} />
                        </div>
                        <h2 className="text-xs font-bold text-foreground">
                            {isRTL ? 'تفاصيل المصروف الأساسية' : 'Expense Details'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'الرقم' : 'Number'}
                            </label>
                            <input
                                type="text"
                                name="number"
                                value={form.number}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary font-mono"
                                placeholder="Auto / EXP-001"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {t('qform.quotationDate')} *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {t('qform.customer')} *
                            </label>
                            <select
                                name="companyId"
                                value={form.companyId}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                required
                            >
                                <option value="">{t('qform.selectCustomer')}</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.companyName || c.primaryContactPerson}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'أمر المبيعات' : 'Sales Order'}
                            </label>
                            <select
                                name="salesOrderId"
                                value={form.salesOrderId}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            >
                                <option value="">{isRTL ? 'اختر أمر المبيعات' : 'Select Sales Order'}</option>
                                {filteredSalesOrders.map(so => (
                                    <option key={so.id} value={so.id}>{so.salesOrderNumber || so.number || `SO-#${so.id}`}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'نوع المعاملة' : 'Transaction Type'}
                            </label>
                            <select
                                name="transactionType"
                                value={form.transactionType}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            >
                                <option value="For Sales">{isRTL ? 'للمبيعات' : 'For Sales'}</option>
                                <option value="For Purchase">{isRTL ? 'للمشتريات' : 'For Purchase'}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'العقد' : 'Contract'}
                            </label>
                            <input
                                type="text"
                                name="contract"
                                value={form.contract}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {t('qform.status')}
                            </label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            >
                                <option value="Draft">{isRTL ? 'مسودة' : 'Draft'}</option>
                                <option value="Posted">{isRTL ? 'رحلت' : 'Posted'}</option>
                                <option value="Cancelled">{isRTL ? 'ملغاة' : 'Cancelled'}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'العملة' : 'Currency'}
                            </label>
                            <input
                                type="text"
                                name="currency"
                                value="AED"
                                readOnly
                                className="w-full h-7 text-[11px] border border-border bg-background-muted rounded px-2 text-foreground font-mono font-bold"
                            />
                        </div>
                    </div>
                </div>

                {/* Service Items Section Card */}
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-border">
                        <h2 className="text-xs font-bold text-foreground">
                            {isRTL ? 'عناصر الخدمات / المصاريف' : 'Service & Expense Lines'}
                        </h2>
                        <button
                            type="button"
                            onClick={addExpenseLine}
                            className="px-2 py-0.5 bg-primary/10 text-primary hover:bg-primary/20 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                            <Plus size={12} /> {isRTL ? 'إضافة خدمة' : 'Add Line'}
                        </button>
                    </div>

                    <div className="rounded border border-border overflow-x-auto">
                        <table className="w-full text-[11px] text-start border-collapse">
                            <thead>
                                <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                    <th className="px-2 py-1.5 border-r border-border min-w-[180px]">{isRTL ? 'منتج الخدمة' : 'Service Product'}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-28 text-end">{isRTL ? 'المبلغ' : 'Amount'} (AED)</th>
                                    <th className="px-2 py-1.5 border-r border-border min-w-[140px]">{isRTL ? 'الضريبة' : 'Tax'}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-28 text-end">{isRTL ? 'مبلغ الضريبة' : 'Tax Amount'}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-28 text-end">{isRTL ? 'الإجمالي' : 'Total'} (AED)</th>
                                    <th className="px-2 py-1.5 text-center w-10">#</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {form.expenseLines.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-foreground-muted">
                                            {isRTL ? 'لا توجد خدمات مضافة' : 'No expense lines added yet.'}
                                        </td>
                                    </tr>
                                ) : (
                                    form.expenseLines.map((line, idx) => (
                                        <tr key={idx} className="hover:bg-hover">
                                            <td className="p-1 border-r border-border">
                                                <select
                                                    value={line.productId}
                                                    onChange={(e) => updateExpenseLine(idx, 'productId', e.target.value)}
                                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-foreground"
                                                >
                                                    <option value="">{isRTL ? 'اختر الخدمة' : 'Select Service'}</option>
                                                    {serviceProducts.map(sp => (
                                                        <option key={sp.id} value={sp.id}>{sp.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-1 border-r border-border">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={line.amount}
                                                    onChange={(e) => updateExpenseLine(idx, 'amount', e.target.value)}
                                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-end font-mono font-bold text-foreground"
                                                />
                                            </td>
                                            <td className="p-1 border-r border-border">
                                                <select
                                                    value={line.taxId}
                                                    onChange={(e) => updateExpenseLine(idx, 'taxId', e.target.value)}
                                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-foreground"
                                                >
                                                    <option value="">{isRTL ? 'بدون ضريبة' : 'No Tax'}</option>
                                                    {taxes.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-1 border-r border-border text-end font-mono text-foreground-muted pr-2">
                                                {(line.taxAmount || 0).toFixed(2)}
                                            </td>
                                            <td className="p-1 border-r border-border text-end font-mono font-bold text-primary pr-2">
                                                {(line.totalAmount || 0).toFixed(2)}
                                            </td>
                                            <td className="p-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeExpenseLine(idx)}
                                                    className="text-rose-500 hover:bg-rose-50 p-1 rounded"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Inventory Allocation Card */}
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 pb-1 border-b border-border">
                        <h2 className="text-xs font-bold text-foreground">
                            {isRTL ? 'توزيع المصاريف على المخزون' : 'Inventory Cost Allocation'}
                        </h2>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => distributeExpenses('By Quantity')}
                                className="px-2 py-0.5 bg-background border border-border hover:bg-hover rounded text-[10px] font-semibold text-foreground"
                            >
                                {isRTL ? 'حسب الكمية' : 'Distribute By Quantity'}
                            </button>
                            <button
                                type="button"
                                onClick={() => distributeExpenses('By Amount')}
                                className="px-2 py-0.5 bg-background border border-border hover:bg-hover rounded text-[10px] font-semibold text-foreground"
                            >
                                {isRTL ? 'حسب القيمة' : 'Distribute By Amount'}
                            </button>
                            <button
                                type="button"
                                onClick={addInventoryItem}
                                className="px-2 py-0.5 bg-primary/10 text-primary hover:bg-primary/20 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                                <Plus size={12} /> {isRTL ? 'إضافة صنف' : 'Add Item'}
                            </button>
                        </div>
                    </div>

                    <div className="rounded border border-border overflow-x-auto">
                        <table className="w-full text-[11px] text-start border-collapse">
                            <thead>
                                <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                    <th className="px-2 py-1.5 border-r border-border min-w-[160px]">{isRTL ? 'المنتج' : 'Product'}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-24">{isRTL ? 'الدفعة' : 'Batch'}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-20 text-end">{isRTL ? 'الكمية' : 'Qty'}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-24 text-end">{isRTL ? 'السعر' : 'Price'}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-28 text-end">{isRTL ? 'الإجمالي' : 'Amount'}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-28 text-end">{isRTL ? 'المصروف الموزع' : 'Allocated Expense'}</th>
                                    <th className="px-2 py-1.5 text-center w-10">#</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {form.inventoryItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-foreground-muted">
                                            {isRTL ? 'لا توجد أصناف مخزون مضافة' : 'No inventory items allocated.'}
                                        </td>
                                    </tr>
                                ) : (
                                    form.inventoryItems.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-hover">
                                            <td className="p-1 border-r border-border">
                                                <select
                                                    value={item.productId}
                                                    onChange={(e) => updateInventoryItem(idx, 'productId', e.target.value)}
                                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-foreground"
                                                >
                                                    <option value="">{isRTL ? 'اختر المنتج' : 'Select Product'}</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-1 border-r border-border">
                                                <input
                                                    type="text"
                                                    value={item.batch}
                                                    onChange={(e) => updateInventoryItem(idx, 'batch', e.target.value)}
                                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-foreground"
                                                />
                                            </td>
                                            <td className="p-1 border-r border-border">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateInventoryItem(idx, 'quantity', e.target.value)}
                                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-end font-mono"
                                                />
                                            </td>
                                            <td className="p-1 border-r border-border">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.price}
                                                    onChange={(e) => updateInventoryItem(idx, 'price', e.target.value)}
                                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-end font-mono"
                                                />
                                            </td>
                                            <td className="p-1 border-r border-border text-end font-mono text-foreground-muted pr-2">
                                                {(item.amount || 0).toFixed(2)}
                                            </td>
                                            <td className="p-1 border-r border-border">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.expenseAmount}
                                                    onChange={(e) => updateInventoryItem(idx, 'expenseAmount', e.target.value)}
                                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-end font-mono font-bold text-emerald-600"
                                                />
                                            </td>
                                            <td className="p-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeInventoryItem(idx)}
                                                    className="text-rose-500 hover:bg-rose-50 p-1 rounded"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Comment Section Card */}
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-1">
                    <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                        {t('qform.notes')}
                    </label>
                    <textarea
                        name="comment"
                        rows="2"
                        value={form.comment}
                        onChange={handleChange}
                        className="w-full text-[11px] border border-border bg-background rounded p-2 text-foreground focus:outline-none focus:border-primary"
                        placeholder={isRTL ? 'أدخل أي ملاحظات إضافية...' : 'Enter any additional comments...'}
                    />
                </div>
            </form>
        </div>
    );
};

export default SalAdditionalExpenseForm;
