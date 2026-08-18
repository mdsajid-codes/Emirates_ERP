import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    Plus, Trash2, Save, Loader, ArrowLeft, X, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { loadThemeFromStorage, applyTheme } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const InputGroup = ({ label, required, children }) => (
  <div className="space-y-1">
    <label className="text-[12px] font-medium text-[#102A5B] flex items-center gap-1">
      <span>{label}</span>
      {required && <span className="text-rose-500 font-bold">*</span>}
    </label>
    {children}
  </div>
);

const PurAdditionalExpenseForm = () => {
    const { isRTL, t } = useLanguage();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;
    const location = useLocation();

    const [activeTab, setActiveTab] = useState('main');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

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
        const theme = loadThemeFromStorage();
        if (theme) applyTheme(theme);
    }, []);

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
                setError(isRTL ? 'فشل تحميل البيانات الأساسية' : 'Failed to load required data.');
            } finally {
                setLoading(false);
            }
        };
        loadMasters();
    }, [id, isEditing]);

    const addExpenseLine = () => {
        setForm(prev => ({
            ...prev,
            expenseLines: [
                ...prev.expenseLines,
                { productId: '', costType: '', amount: 0, taxId: '', taxValue: 0, totalAmount: 0 }
            ]
        }));
    };

    const updateExpenseLine = (index, field, value) => {
        setForm(prev => {
            const lines = [...prev.expenseLines];
            lines[index] = { ...lines[index], [field]: value };
            
            if (field === 'amount' || field === 'taxId') {
                const amt = Number(lines[index].amount) || 0;
                let taxRate = 0;
                if (lines[index].taxId) {
                    const taxObj = taxes.find(t => t.id == lines[index].taxId);
                    if (taxObj) taxRate = taxObj.rate || 0;
                }
                lines[index].taxValue = (amt * taxRate) / 100;
                lines[index].totalAmount = amt + lines[index].taxValue;
            }
            return { ...prev, expenseLines: lines };
        });
    };

    const removeExpenseLine = (index) => {
        setForm(prev => ({
            ...prev,
            expenseLines: prev.expenseLines.filter((_, i) => i !== index)
        }));
    };

    const addInventoryItem = () => {
        setForm(prev => ({
            ...prev,
            inventoryItems: [
                ...prev.inventoryItems,
                { documentType: 'Purchase Order', documentId: '', productId: '', batch: '', quantity: 1, unitId: '', price: 0, factor: 1, expenseAmount: 0 }
            ]
        }));
    };

    const updateInventoryItem = (index, field, value) => {
        setForm(prev => {
            const items = [...prev.inventoryItems];
            items[index] = { ...items[index], [field]: value };
            return { ...prev, inventoryItems: items };
        });
    };

    const removeInventoryItem = (index) => {
        setForm(prev => ({
            ...prev,
            inventoryItems: prev.inventoryItems.filter((_, i) => i !== index)
        }));
    };

    const totalExpenseAmount = useMemo(() => {
        return form.expenseLines.reduce((sum, l) => sum + (Number(l.totalAmount) || 0), 0);
    }, [form.expenseLines]);

    useEffect(() => {
        if (!form.inventoryItems.length || totalExpenseAmount <= 0) return;
        const totalFactor = form.inventoryItems.reduce((sum, i) => sum + (Number(i.factor) || 1), 0);
        if (totalFactor <= 0) return;

        setForm(prev => ({
            ...prev,
            inventoryItems: prev.inventoryItems.map(item => {
                const factor = Number(item.factor) || 1;
                const allocated = (totalExpenseAmount * factor) / totalFactor;
                return { ...item, expenseAmount: allocated };
            })
        }));
    }, [totalExpenseAmount, form.inventoryItems.length]);

    const handleSubmit = async (statusOverride) => {
        setSubmitting(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const payload = {
                ...form,
                status: statusOverride || form.status,
                totalAmount: totalExpenseAmount
            };

            if (isEditing) {
                await axios.put(`${API_URL}/purchases/additional-expenses/${id}`, payload, { headers });
            } else {
                await axios.post(`${API_URL}/purchases/additional-expenses`, payload, { headers });
            }

            navigate('/purchase-dashboard/additional-expenses');
        } catch (err) {
            console.error('Failed to save additional expense', err);
            setError(err.response?.data?.message || err.message || (isRTL ? 'فشل حفظ المصروف الإضافي' : 'Failed to save additional expense.'));
            window.scrollTo(0, 0);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center">
                <Loader className="h-10 w-10 animate-spin text-[var(--color-primary,#00A9A8)]" />
                <p className="mt-3 text-xs font-bold text-[#102A5B] uppercase tracking-wider">
                    {isRTL ? 'جاري تحميل المصروف الإضافي...' : 'Initializing Additional Expense Workspace...'}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] p-2 sm:p-3 lg:p-4 font-sans text-[#18233B]" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-full space-y-3">
                {/* Header Area matching PurchaseOrderForm Spec */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                        <h1 className="text-[24px] sm:text-[28px] font-bold text-[#102A5B] leading-tight tracking-tight">
                            {isEditing
                                ? (t('additionalExpense.editExpense') || (isRTL ? 'تعديل المصروف الإضافي' : 'Edit Additional Expense'))
                                : (t('additionalExpense.newExpense') || (isRTL ? 'إنشاء مصروف إضافي جديد' : 'Create Additional Expense'))}
                        </h1>
                        <p className="text-[12px] font-normal text-[#5F6F91]">
                            {isRTL ? 'تخصيص وتوثيق التكاليف الإضافية على سندات الشراء' : 'Track and allocate additional landed costs to your purchases'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleSubmit('Posted')}
                            disabled={submitting}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-primary,#00A9A8)] text-[var(--color-primary-foreground,#ffffff)] rounded-[var(--theme-border-radius,11px)] text-xs font-bold hover:opacity-95 shadow-xs cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                        >
                            <Save size={16} className="text-white" />
                            <span>{isEditing ? (isRTL ? 'تحديث وتطبيق' : 'Post & Update') : (isRTL ? 'اعتماد وإغلاق' : 'Post and Close')}</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-3 text-rose-600 shadow-xs text-xs font-semibold"
                    >
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-rose-100 rounded-full transition-colors">
                            <X size={14} />
                        </button>
                    </motion.div>
                )}

                <div className="space-y-3 pb-16">
                    {/* SECTION 1: PRIMARY EXPENSE DETAILS */}
                    <div className="bg-white border border-[#DCE5F3] rounded-[11.86px] p-3 space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-[22px] h-[22px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[11px] font-bold flex items-center justify-center">
                                    1
                                </div>
                                <h2 className="text-[14px] font-bold text-[#102A5B]">
                                    {isRTL ? 'معلومات المصروف الإضافي الرئيسية' : 'Primary Additional Expense Details'}
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Supplier */}
                            <InputGroup label={t('additionalExpense.supplier') || (isRTL ? 'المورد / الشركة' : 'Supplier')} required>
                                <select
                                    value={form.supplierId}
                                    onChange={e => setForm({ ...form, supplierId: e.target.value })}
                                    required
                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                                >
                                    <option value="">{isRTL ? 'اختر المورد...' : 'Select Supplier...'}</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.companyName || c.name}</option>
                                    ))}
                                </select>
                            </InputGroup>

                            {/* Expense Number */}
                            <InputGroup label={t('additionalExpense.number') || (isRTL ? 'رقم السند' : 'Expense Number')}>
                                <input
                                    type="text"
                                    value={form.number}
                                    onChange={e => setForm({ ...form, number: e.target.value })}
                                    placeholder="<Auto>"
                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs font-semibold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                                />
                            </InputGroup>

                            {/* Date */}
                            <InputGroup label={isRTL ? 'التاريخ' : 'Date'} required>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                    required
                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                                />
                            </InputGroup>

                            {/* Transaction Type */}
                            <InputGroup label={t('additionalExpense.transactionType') || (isRTL ? 'نوع المعاملة' : 'Transaction Type')}>
                                <select
                                    value={form.transactionType}
                                    onChange={e => setForm({ ...form, transactionType: e.target.value })}
                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                                >
                                    <option value="For Purchase">{isRTL ? 'للمشتريات (For Purchase)' : 'For Purchase'}</option>
                                    <option value="For Import">{isRTL ? 'للاستيراد (For Import)' : 'For Import'}</option>
                                </select>
                            </InputGroup>

                            {/* Purchase Order */}
                            <InputGroup label={t('additionalExpense.purchaseOrder') || (isRTL ? 'أمر الشراء المرتبط' : 'Purchase Order')}>
                                <select
                                    value={form.purchaseOrderId}
                                    onChange={e => setForm({ ...form, purchaseOrderId: e.target.value })}
                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                                >
                                    <option value="">{isRTL ? 'اختر أمر الشراء...' : 'Select Purchase Order...'}</option>
                                    {purchaseOrders.map(po => (
                                        <option key={po.id} value={po.id}>{po.poNumber || `PO-${po.id}`}</option>
                                    ))}
                                </select>
                            </InputGroup>

                            {/* Currency */}
                            <InputGroup label={t('additionalExpense.currency') || (isRTL ? 'العملة' : 'Currency')}>
                                <div className="flex gap-1">
                                    <select
                                        value={form.currency}
                                        onChange={e => setForm({ ...form, currency: e.target.value })}
                                        className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                                    >
                                        <option value="AED">AED (AED = 1 AED)</option>
                                        {currencies.map(c => (
                                            <option key={c.id} value={c.currencyCode}>{c.currencyCode}</option>
                                        ))}
                                    </select>
                                </div>
                            </InputGroup>

                            {/* Comment */}
                            <InputGroup label={t('additionalExpense.comment') || (isRTL ? 'البيان / ملاحظات' : 'Internal Comment')}>
                                <input
                                    type="text"
                                    value={form.comment}
                                    onChange={e => setForm({ ...form, comment: e.target.value })}
                                    placeholder={isRTL ? 'أدخل تفاصيل وملاحظات المصروف...' : 'Add internal notes...'}
                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                                />
                            </InputGroup>
                        </div>
                    </div>

                    {/* SECTION 2: EXPENSES LINES & ALLOCATION TABS */}
                    <div className="bg-white border border-[#DCE5F3] rounded-[11.86px] p-3 space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-[22px] h-[22px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[11px] font-bold flex items-center justify-center">
                                    2
                                </div>
                                <h2 className="text-[14px] font-bold text-[#102A5B]">
                                    {isRTL ? 'سطور المصاريف وتوزيع التكلفة' : 'Expense Lines & Allocation Breakdown'}
                                </h2>
                            </div>

                            <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#DCE5F3] p-0.5 rounded-lg text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('main')}
                                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${activeTab === 'main' ? 'bg-[var(--color-primary,#00A9A8)] text-white font-bold' : 'text-[#5F6F91] hover:text-[#102A5B]'}`}
                                >
                                    {isRTL ? `المصاريف (${form.expenseLines.length})` : `Expenses (${form.expenseLines.length})`}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('inventory')}
                                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${activeTab === 'inventory' ? 'bg-[var(--color-primary,#00A9A8)] text-white font-bold' : 'text-[#5F6F91] hover:text-[#102A5B]'}`}
                                >
                                    {isRTL ? `المخزون والمنتجات (${form.inventoryItems.length})` : `Inventory (${form.inventoryItems.length})`}
                                </button>
                            </div>
                        </div>

                        {activeTab === 'main' && (
                            <div className="space-y-3">
                                <div className="overflow-x-auto border border-[#DBE5F3] rounded-[11.09px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#EEF5FF] border-b border-[#DBE5F3] text-[#102A5B] font-semibold text-[12px] h-[38.39px]">
                                                <th className="py-2.5 px-3 min-w-[200px]">{isRTL ? 'المنتج / خدمة المصروف' : 'Expense Product / Service'}</th>
                                                <th className="py-2.5 px-3 min-w-[150px]">{isRTL ? 'نوع التكلفة' : 'Cost Type'}</th>
                                                <th className="py-2.5 px-3 text-right min-w-[120px]">{isRTL ? 'المبلغ (AED)' : 'Amount (AED)'}</th>
                                                <th className="py-2.5 px-3 text-center min-w-[120px]">{isRTL ? 'نسبة الضريبة' : 'VAT Rate'}</th>
                                                <th className="py-2.5 px-3 text-right min-w-[120px]">{isRTL ? 'إجمالي السطر (AED)' : 'Total (AED)'}</th>
                                                <th className="py-2.5 px-3 text-center w-12">{isRTL ? 'حذف' : 'Delete'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#DBE5F3]">
                                            {form.expenseLines.map((l, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors text-xs">
                                                    <td className="p-2">
                                                        <select
                                                            className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                            value={l.productId}
                                                            onChange={e => updateExpenseLine(idx, 'productId', e.target.value)}
                                                        >
                                                            <option value="">{isRTL ? 'اختر خدمة/مصروف...' : 'Select Expense Item...'}</option>
                                                            {products.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name || p.itemCode}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Freight, Duty, Clearance..."
                                                            className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                            value={l.costType}
                                                            onChange={e => updateExpenseLine(idx, 'costType', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-right text-xs font-bold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                            value={l.amount}
                                                            onChange={e => updateExpenseLine(idx, 'amount', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <select
                                                            className="w-full bg-white border border-[#D8E2F1] rounded px-1 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                            value={l.taxId}
                                                            onChange={e => updateExpenseLine(idx, 'taxId', e.target.value)}
                                                        >
                                                            <option value="">0% VAT</option>
                                                            {taxes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="p-2 text-right font-bold text-[#102A5B]">
                                                        AED {Number(l.totalAmount).toFixed(2)}
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <button type="button" onClick={() => removeExpenseLine(idx)} className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="p-2 bg-[#F8FAFC] border-t border-[#DBE5F3]">
                                        <button type="button" onClick={addExpenseLine} className="text-[var(--color-primary,#00A9A8)] text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer">
                                            <Plus size={14} /> {isRTL ? 'إضافة سطر مصروف' : 'Add Expense Line'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'inventory' && (
                            <div className="space-y-3">
                                <div className="overflow-x-auto border border-[#DBE5F3] rounded-[11.09px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#EEF5FF] border-b border-[#DBE5F3] text-[#102A5B] font-semibold text-[12px] h-[38.39px]">
                                                <th className="py-2.5 px-3 min-w-[140px]">{isRTL ? 'نوع المستند' : 'Document Type'}</th>
                                                <th className="py-2.5 px-3 min-w-[180px]">{isRTL ? 'المنتج / الصنف' : 'Product'}</th>
                                                <th className="py-2.5 px-3 text-right min-w-[80px]">{isRTL ? 'الكمية' : 'Qty'}</th>
                                                <th className="py-2.5 px-3 text-right min-w-[100px]">{isRTL ? 'السعر' : 'Price'}</th>
                                                <th className="py-2.5 px-3 text-right min-w-[80px]">{isRTL ? 'معامل التوزيع' : 'Factor'}</th>
                                                <th className="py-2.5 px-3 text-right min-w-[120px]">{isRTL ? 'المبلغ الموزع (AED)' : 'Allocated Expense'}</th>
                                                <th className="py-2.5 px-3 text-center w-12">{isRTL ? 'حذف' : 'Delete'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#DBE5F3]">
                                            {form.inventoryItems.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors text-xs">
                                                    <td className="p-2">
                                                        <select 
                                                            value={item.documentType} 
                                                            onChange={(e) => updateInventoryItem(idx, 'documentType', e.target.value)}
                                                            className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                        >
                                                            <option value="Purchase Invoice">Purchase Invoice</option>
                                                            <option value="GRN">GRN</option>
                                                            <option value="Purchase Order">Purchase Order</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-2">
                                                        <select 
                                                            value={item.productId} 
                                                            onChange={(e) => updateInventoryItem(idx, 'productId', e.target.value)}
                                                            className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                        >
                                                            <option value="">Select Product</option>
                                                            {products.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name || p.itemCode}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" value={item.quantity} onChange={(e) => updateInventoryItem(idx, 'quantity', e.target.value)} className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-right text-xs font-bold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" value={item.price} onChange={(e) => updateInventoryItem(idx, 'price', e.target.value)} className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-right text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" value={item.factor} onChange={(e) => updateInventoryItem(idx, 'factor', e.target.value)} className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-right text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]" step="0.01" />
                                                    </td>
                                                    <td className="p-2 text-right font-bold text-[var(--color-primary,#00A9A8)]">
                                                        AED {Number(item.expenseAmount).toFixed(2)}
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <button type="button" onClick={() => removeInventoryItem(idx)} className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="p-2 bg-[#F8FAFC] border-t border-[#DBE5F3]">
                                        <button type="button" onClick={addInventoryItem} className="text-[var(--color-primary,#00A9A8)] text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer">
                                            <Plus size={14} /> {isRTL ? 'إضافة صنف مخزون' : 'Add Inventory Line'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Financial Summary Card */}
                        <div className="flex justify-end pt-2">
                            <div className="w-full sm:w-80 bg-[#F8FAFC] border border-[#DFE7F4] rounded-xl p-3 space-y-2 text-xs">
                                <div className="flex justify-between items-center text-[#5F6F91]">
                                    <span>{isRTL ? 'إجمالي سطور المصروفات:' : 'Total Expense Lines:'}</span>
                                    <span className="font-bold text-[#102A5B]">{form.expenseLines.length}</span>
                                </div>
                                <div className="border-t border-[#DFE7F4] pt-2 flex justify-between items-center font-bold text-sm text-[var(--color-primary,#00A9A8)]">
                                    <span>{isRTL ? 'إجمالي المصاريف الموزعة:' : 'Total Additional Expense:'}</span>
                                    <span>AED {totalExpenseAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Submit Buttons matching PurchaseOrderForm */}
                    <div className="flex justify-end items-center gap-2 pt-2 border-t border-[#DCE5F3]">
                        <Link
                            to="/purchase-dashboard/additional-expenses"
                            className="px-4 py-1.5 bg-white border border-[#DCE5F3] text-[#102A5B] hover:bg-slate-50 text-xs font-semibold rounded-[5.29px] transition-all"
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </Link>
                        <button
                            type="button"
                            onClick={() => handleSubmit('Draft')}
                            disabled={submitting}
                            className="px-4 py-1.5 bg-white border border-[var(--color-primary,#00A9A8)] text-[var(--color-primary,#00A9A8)] hover:bg-teal-50 text-xs font-semibold rounded-[5.29px] transition-all"
                        >
                            {isRTL ? 'حفظ كمسودة' : 'Save as Draft'}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSubmit('Posted')}
                            disabled={submitting}
                            className="px-5 py-1.5 bg-[var(--color-primary,#00A9A8)] text-[var(--color-primary-foreground,#ffffff)] text-xs font-bold rounded-[var(--theme-border-radius,11px)] shadow-xs flex items-center gap-1.5 transition-all hover:opacity-95 disabled:opacity-50 cursor-pointer"
                        >
                            <Save size={16} />
                            <span>{isEditing ? (isRTL ? 'تحديث وتطبيق' : 'Update Expense') : (isRTL ? 'اعتماد المصروف' : 'Post & Save')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurAdditionalExpenseForm;
