import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Plus, Trash2, Save, Loader, ArrowLeft, Paperclip, Upload,
    Package, ChevronRight, X, User, Calendar, Search, ChevronDown, Box, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const PurchaseInvoiceForm = () => {
    const { isRTL, t } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = Boolean(id);
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Master Data
    const [suppliers, setSuppliers] = useState([]);
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({});
    const [units, setUnits] = useState([]);
    const [taxes, setTaxes] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        billLedger: 'Purchase',
        supplierId: '',
        billNumber: '',
        orderNumber: '',
        billDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date().toISOString().slice(0, 10),
        billType: 'Without Discount',
        grossNetEnabled: false,
        notes: '',
        otherCharges: 0,
        template: 'Standard'
    });

    const [lines, setLines] = useState([
        {
            lineNumber: 1,
            categoryId: '',
            subCategoryId: '',
            itemId: '',
            description: '',
            quantityGross: 0,
            quantityNet: 0,
            unitId: '',
            rate: 0,
            amount: 0,
            taxId: '',
            taxPercent: 0,
            lineDiscount: 0,
            discountPercent: 0
        }
    ]);

    const [attachments, setAttachments] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);

    // Totals
    const [totals, setTotals] = useState({
        subTotal: 0,
        totalDiscount: 0,
        grossTotal: 0,
        totalTax: 0,
        netTotal: 0
    });

    useEffect(() => {
        fetchMasterData();
        if (isEdit) {
            loadInvoice();
        } else if (location.state?.fromPo && items.length > 0 && suppliers.length > 0) {
            const po = location.state.fromPo;
            setFormData(prev => ({
                ...prev,
                supplierId: po.supplierId || '',
                orderNumber: po.poNumber || '',
                notes: po.notes || po.remark || '',
                template: po.template || 'Standard'
            }));

            if (po.items && po.items.length > 0) {
                setLines(po.items.map((it, idx) => ({
                    lineNumber: idx + 1,
                    categoryId: it.categoryId || '',
                    subCategoryId: it.subCategoryId || '',
                    itemId: it.itemId || '',
                    description: it.description || '',
                    quantityGross: it.quantity || 0,
                    quantityNet: it.quantity || 0,
                    unitId: it.unitId || '',
                    rate: it.rate || 0,
                    amount: it.amount || 0,
                    taxId: it.taxId || '',
                    taxPercent: it.taxPercent || 0,
                    lineDiscount: it.lineDiscount || 0,
                    discountPercent: it.discountPercent || 0
                })));

                const catIds = Array.from(new Set(po.items.map(i => i.categoryId).filter(Boolean)));
                catIds.forEach(cid => fetchSubCategoriesForCategory(cid));
            }
        }
    }, [id, location.state, items.length, suppliers.length]);

    useEffect(() => {
        calculateTotals();
    }, [lines, formData.otherCharges, formData.grossNetEnabled]);

    const fetchMasterData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [suppRes, itemRes, catRes, unitRes, taxRes] = await Promise.all([
                axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } }),
                axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 1000 } }),
                axios.get(`${API_URL}/production/categories`, { headers, params: { page: 0, size: 500 } }),
                axios.get(`${API_URL}/production/units`, { headers, params: { page: 0, size: 500 } }),
                axios.get(`${API_URL}/production/taxes`, { headers, params: { page: 0, size: 100 } })
            ]);

            setSuppliers(suppRes.data.content || suppRes.data || []);
            setItems(itemRes.data.content || itemRes.data || []);
            setCategories(catRes.data.content || catRes.data || []);
            setUnits(unitRes.data.content || unitRes.data || []);
            setTaxes(taxRes.data.content || taxRes.data || []);
        } catch (err) {
            console.error('Failed to load master data', err);
        }
    };

    const fetchSubCategoriesForCategory = async (categoryId) => {
        if (!categoryId) return;
        if (subCategoriesByCategory[categoryId]) return;
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`${API_URL}/production/sub-categories`, { headers, params: { categoryId, page: 0, size: 500 } });
            setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: res.data.content || res.data || [] }));
        } catch (err) {
            console.error(err);
        }
    };

    const loadInvoice = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/purchases/invoices/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const inv = res.data;

            setFormData({
                billLedger: inv.billLedger || 'Purchase',
                supplierId: inv.supplierId || '',
                billNumber: inv.billNumber || '',
                orderNumber: inv.orderNumber || '',
                billDate: inv.billDate ? new Date(inv.billDate).toISOString().slice(0, 10) : '',
                dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0, 10) : '',
                billType: inv.billType || 'Without Discount',
                grossNetEnabled: inv.grossNetEnabled || false,
                notes: inv.notes || '',
                otherCharges: inv.otherCharges || 0,
                template: inv.template || 'Standard'
            });

            if (inv.lines) {
                setLines(inv.lines.map(l => ({
                    ...l,
                    quantityGross: l.quantityGross || 0,
                    quantityNet: l.quantityNet || 0,
                    rate: l.rate || 0,
                    amount: l.amount || 0,
                    taxPercent: l.taxPercent || 0,
                    lineDiscount: l.lineDiscount || 0
                })));

                const catIds = Array.from(new Set(inv.lines.map(l => l.categoryId).filter(Boolean)));
                catIds.forEach(cid => fetchSubCategoriesForCategory(cid));
            }

            if (inv.attachments) {
                setExistingAttachments(inv.attachments);
            }
        } catch (err) {
            console.error('Failed to load Invoice', err);
            setError(t ? t('bill.viewTitle') + ' error' : 'Failed to load invoice.');
        } finally {
            setLoading(false);
        }
    };

    const handleLineChange = (index, field, value) => {
        const updated = [...lines];
        const line = { ...updated[index], [field]: value };

        if (field === 'categoryId') {
            line.subCategoryId = '';
            line.itemId = '';
            fetchSubCategoriesForCategory(value);
        }

        if (field === 'itemId' && value) {
            const selectedItem = items.find(i => String(i.id) === String(value));
            if (selectedItem) {
                line.description = line.description || selectedItem.name;
                line.unitId = line.unitId || selectedItem.unitId || selectedItem.uom || '';
                line.rate = line.rate || selectedItem.purchasePrice || selectedItem.costPrice || selectedItem.price || 0;
            }
        }

        if (field === 'taxId') {
            const tObj = taxes.find(tx => String(tx.id) === String(value));
            line.taxPercent = tObj ? tObj.rate || tObj.percent || 0 : 0;
        }

        if (field === 'discountPercent') {
            const qty = formData.grossNetEnabled && line.quantityNet > 0 ? line.quantityNet : line.quantityGross;
            const base = qty * line.rate;
            line.lineDiscount = (base * (Number(value) || 0)) / 100;
        }

        const qty = formData.grossNetEnabled && line.quantityNet > 0 ? line.quantityNet : line.quantityGross;
        line.amount = qty * line.rate;

        updated[index] = line;
        setLines(updated);
    };

    const addLine = () => {
        setLines([
            ...lines,
            {
                lineNumber: lines.length + 1,
                categoryId: '',
                subCategoryId: '',
                itemId: '',
                description: '',
                quantityGross: 0,
                quantityNet: 0,
                unitId: '',
                rate: 0,
                amount: 0,
                taxId: '',
                taxPercent: 0,
                lineDiscount: 0,
                discountPercent: 0
            }
        ]);
    };

    const removeLine = (index) => {
        if (lines.length === 1) return;
        const updated = lines.filter((_, i) => i !== index).map((l, i) => ({ ...l, lineNumber: i + 1 }));
        setLines(updated);
    };

    const calculateTotals = () => {
        let sub = 0;
        let disc = 0;
        let tax = 0;

        lines.forEach(l => {
            const qty = formData.grossNetEnabled && l.quantityNet > 0 ? l.quantityNet : l.quantityGross;
            const base = qty * l.rate;
            const lineDisc = Number(l.lineDiscount) || 0;
            const effectiveBase = base - lineDisc;
            const lineTax = (effectiveBase * (Number(l.taxPercent) || 0)) / 100;

            sub += base;
            disc += lineDisc;
            tax += lineTax;
        });

        const other = Number(formData.otherCharges) || 0;

        setTotals({
            subTotal: sub,
            totalDiscount: disc,
            totalTax: tax,
            grossTotal: sub - disc + tax,
            netTotal: sub - disc + tax + other
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setAttachments([...attachments, ...Array.from(e.target.files)]);
        }
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const removeExistingAttachment = (attId) => {
        setExistingAttachments(existingAttachments.filter(a => a.id !== attId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');

            const requestData = {
                ...formData,
                lines: lines.map(l => ({
                    ...l,
                    quantityGross: Number(l.quantityGross),
                    quantityNet: Number(l.quantityNet),
                    rate: Number(l.rate),
                    amount: (formData.grossNetEnabled && l.quantityNet > 0 ? l.quantityNet : l.quantityGross) * l.rate,
                    lineDiscount: Number(l.lineDiscount),
                    taxPercent: Number(l.taxPercent)
                })),
                attachments: existingAttachments.map(a => ({
                    fileName: a.fileName,
                    filePath: a.filePath,
                    uploadedAt: a.uploadedAt,
                    uploadedBy: a.uploadedBy
                }))
            };

            const payload = new FormData();
            payload.append('request', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));

            attachments.forEach(file => {
                payload.append('attachments', file);
            });

            if (isEdit) {
                await axios.put(`${API_URL}/purchases/invoices/${id}`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post(`${API_URL}/purchases/invoices`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            navigate('/purchase-dashboard/bills');
        } catch (err) {
            console.error('Submit failed', err);
            setError(err.response?.data?.message || err.message || 'Failed to save invoice');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center">
                <Loader className="h-12 w-12 animate-spin text-[var(--color-primary,#00A9A8)]" />
                <p className="mt-4 font-bold text-[#102A5B] text-xs">
                    {isRTL ? 'جاري تحميل فاتورة الشراء...' : 'Loading Purchase Invoice Workspace...'}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] p-2 sm:p-3 lg:p-4 font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-full space-y-3">
                {/* Header Area styled after PurchaseOrderForm */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                        <h1 className="text-[24px] sm:text-[28px] font-bold text-[#102A5B] leading-tight tracking-tight">
                            {isEdit ? (t ? t('bill.editTitle') : 'Edit Purchase Invoice') : (t ? t('bill.createTitle') : 'Create Purchase Invoice')}
                        </h1>
                        <p className="text-[12px] font-normal text-[#5F6F91]">
                            {isRTL ? 'إدارة وتوثيق فواتير المشتريات الخاصة بالموردين' : 'Create and manage vendor purchase invoices and payments'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                        <button
                            type="button"
                            onClick={() => navigate('/purchase-dashboard/bills')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DCE5F3] rounded-[5.29px] text-[12px] font-semibold text-[#102A5B] hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                        >
                            <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
                            <span>{t ? t('bill.cancel') : 'Cancel'}</span>
                        </button>
                        <button
                            type="submit"
                            form="invoiceForm"
                            disabled={submitting}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-primary,#00A9A8)] text-white rounded-[5.29px] text-[12px] font-bold hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                        >
                            {submitting ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                            <span>{isEdit ? (t ? t('bill.update') : 'Update Bill') : (t ? t('bill.save') : 'Save Bill')}</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-3 text-rose-600 shadow-xs text-xs font-semibold">
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                        <button onClick={() => setError('')} className="ml-auto p-1 hover:bg-rose-100 rounded-full transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                )}

                <form id="invoiceForm" onSubmit={handleSubmit} className="space-y-3 pb-16">
                    {/* SECTION 1: INVOICE HEADER DETAILS */}
                    <div className="bg-white border border-[#DCE5F3] rounded-[11.86px] p-3 space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-[22px] h-[22px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[11px] font-bold flex items-center justify-center">
                                    1
                                </div>
                                <h2 className="text-[18px] font-semibold text-[#102A5B]">
                                    {isRTL ? 'بيانات الفاتورة والمورد' : 'Vendor & Invoice Protocol Details'}
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3.5">
                            {/* Bill Ledger */}
                            <div className="space-y-1">
                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                    {t ? t('bill.ledger') : 'Bill Ledger'} <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formData.billLedger}
                                    onChange={e => setFormData({ ...formData, billLedger: e.target.value })}
                                    className="w-full h-[31.72px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-semibold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                >
                                    <option value="Purchase">{isRTL ? 'مشتريات محلي' : 'Purchase (Local)'}</option>
                                    <option value="Purchase Import">{isRTL ? 'مشتريات استيراد' : 'Purchase (Import)'}</option>
                                </select>
                            </div>

                            {/* Supplier Name */}
                            <div className="space-y-1">
                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                    {t ? t('bill.supplier') : 'Supplier Name'} <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex gap-1.5">
                                    <select
                                        value={formData.supplierId}
                                        onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                                        className="w-full h-[31.72px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-bold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                        required
                                    >
                                        <option value="">{isRTL ? '-- اختر المورد --' : '-- Select Supplier --'}</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name || s.companyName}</option>
                                        ))}
                                    </select>
                                    <div className="h-[31.72px] px-3 bg-[var(--color-primary,#00A9A8)] text-white font-bold rounded-[5.29px] text-xs flex items-center justify-center shrink-0">
                                        AED
                                    </div>
                                </div>
                            </div>

                            {/* Bill Number */}
                            <div className="space-y-1">
                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                    {t ? t('bill.number') : 'Bill Number'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.billNumber}
                                    onChange={e => setFormData({ ...formData, billNumber: e.target.value })}
                                    placeholder={isRTL ? 'رقم الفاتورة' : 'Bill Number'}
                                    className="w-full h-[32.39px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-normal text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                />
                            </div>

                            {/* Order Number */}
                            <div className="space-y-1">
                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                    {t ? t('bill.orderNumber') : 'Order Number'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.orderNumber}
                                    onChange={e => setFormData({ ...formData, orderNumber: e.target.value })}
                                    placeholder="PO-XXXX"
                                    className="w-full h-[32.39px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-normal text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                />
                            </div>

                            {/* Bill Date */}
                            <div className="space-y-1">
                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                    {t ? t('bill.date') : 'Bill Date'} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.billDate}
                                    onChange={e => setFormData({ ...formData, billDate: e.target.value })}
                                    className="w-full h-[32.39px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-normal text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                    required
                                />
                            </div>

                            {/* Due Date */}
                            <div className="space-y-1">
                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                    {t ? t('bill.dueDate') : 'Due Date'}
                                </label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full h-[32.39px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-normal text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                />
                            </div>

                            {/* Bill Type */}
                            <div className="space-y-1">
                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                    {t ? t('bill.type') : 'Bill Type'}
                                </label>
                                <select
                                    value={formData.billType}
                                    onChange={e => setFormData({ ...formData, billType: e.target.value })}
                                    className="w-full h-[32.39px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-semibold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                >
                                    <option value="Without Discount">{isRTL ? 'بدون خصم' : 'Without Discount'}</option>
                                    <option value="With Item Level Discount">{isRTL ? 'خصم على مستوى الصنف' : 'With Item Level Discount'}</option>
                                </select>
                            </div>

                            {/* Template */}
                            <div className="space-y-1">
                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                    {t ? t('bill.template') : 'Template'}
                                </label>
                                <select
                                    value={formData.template}
                                    onChange={e => setFormData({ ...formData, template: e.target.value })}
                                    className="w-full h-[32.39px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-semibold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                >
                                    <option value="Standard">{isRTL ? 'قالب قياسي' : 'Standard'}</option>
                                    <option value="Tax Invoice">{isRTL ? 'فاتورة ضريبية' : 'Tax Invoice'}</option>
                                </select>
                            </div>
                        </div>

                        {/* Gross/Net Weight Toggle */}
                        <div className="pt-2 border-t border-[#E4EAF0] flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="grossNetToggle"
                                checked={formData.grossNetEnabled}
                                onChange={e => setFormData({ ...formData, grossNetEnabled: e.target.checked })}
                                className="w-4 h-4 text-[var(--color-primary,#00A9A8)] rounded border-[#D8E2F1] focus:ring-[var(--color-primary,#00A9A8)] cursor-pointer"
                            />
                            <label htmlFor="grossNetToggle" className="text-[13px] font-semibold text-[#102A5B] cursor-pointer">
                                {t ? t('bill.grossNet') : 'Enable Gross & Net Quantity Billing'}
                            </label>
                        </div>
                    </div>

                    {/* SECTION 2: LINE ITEMS GRID */}
                    <div className="bg-white border border-[#DCE5F3] rounded-[11.86px] p-3 space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-[22px] h-[22px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[11px] font-bold flex items-center justify-center">
                                    2
                                </div>
                                <h2 className="text-[18px] font-semibold text-[#102A5B]">
                                    {t ? t('bill.items') : 'Bill Line Items Specification'}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={addLine}
                                className="flex items-center gap-1 px-3 py-1 bg-[#00A9A8]/10 text-[var(--color-primary,#00A9A8)] rounded-[5.29px] text-xs font-bold hover:bg-[#00A9A8]/20 transition-all cursor-pointer"
                            >
                                <Plus size={14} />
                                <span>{isRTL ? 'إضافة صنف' : 'Add Row'}</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left rtl:text-right border-collapse min-w-[950px]">
                                <thead>
                                    <tr className="bg-[#F8FAFC] border-b border-[#DCE5F3] text-[11px] font-bold text-[#5F6F91] uppercase">
                                        <th className="py-2 px-2 text-center w-10">#</th>
                                        <th className="py-2 px-2 w-44">{isRTL ? 'الفئة' : 'Category'}</th>
                                        <th className="py-2 px-2 w-52">{isRTL ? 'اسم الصنف' : 'Item Name'}</th>
                                        <th className="py-2 px-2">{isRTL ? 'البيان' : 'Description'}</th>
                                        <th className="py-2 px-2 text-center w-24">{isRTL ? 'الكمية' : 'Qty'}</th>
                                        <th className="py-2 px-2 text-center w-28">{isRTL ? 'السعر (AED)' : 'Rate (AED)'}</th>
                                        <th className="py-2 px-2 text-center w-24">{isRTL ? 'الخصم' : 'Disc.'}</th>
                                        <th className="py-2 px-2 text-center w-24">{isRTL ? 'الضريبة %' : 'Tax %'}</th>
                                        <th className="py-2 px-2 text-right rtl:text-left w-32">{isRTL ? 'المبلغ (AED)' : 'Amount (AED)'}</th>
                                        <th className="py-2 px-2 text-center w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E4EAF0] text-xs font-semibold text-[#102A5B]">
                                    {lines.map((line, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/70">
                                            <td className="py-2 px-2 text-center font-bold">{idx + 1}</td>
                                            <td className="py-2 px-2">
                                                <select
                                                    value={line.categoryId}
                                                    onChange={e => handleLineChange(idx, 'categoryId', e.target.value)}
                                                    className="w-full h-[30px] px-2 bg-white border border-[#D8E2F1] rounded text-xs font-semibold outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                >
                                                    <option value="">{isRTL ? '-- اختر --' : '-- Category --'}</option>
                                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-2 px-2">
                                                <select
                                                    value={line.itemId}
                                                    onChange={e => handleLineChange(idx, 'itemId', e.target.value)}
                                                    className="w-full h-[30px] px-2 bg-white border border-[#D8E2F1] rounded text-xs font-bold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                >
                                                    <option value="">{isRTL ? '-- اختر الصنف --' : '-- Select Item --'}</option>
                                                    {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-2 px-2">
                                                <input
                                                    type="text"
                                                    value={line.description}
                                                    onChange={e => handleLineChange(idx, 'description', e.target.value)}
                                                    placeholder="Details..."
                                                    className="w-full h-[30px] px-2 bg-white border border-[#D8E2F1] rounded text-xs font-medium outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                />
                                            </td>
                                            <td className="py-2 px-2 text-center">
                                                <input
                                                    type="number" min="0" step="any"
                                                    value={line.quantityGross}
                                                    onChange={e => handleLineChange(idx, 'quantityGross', e.target.value)}
                                                    className="w-20 h-[30px] px-2 bg-white border border-[#D8E2F1] rounded text-xs font-bold text-center mx-auto block outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                />
                                            </td>
                                            <td className="py-2 px-2 text-center">
                                                <input
                                                    type="number" min="0" step="any"
                                                    value={line.rate}
                                                    onChange={e => handleLineChange(idx, 'rate', e.target.value)}
                                                    className="w-24 h-[30px] px-2 bg-white border border-[#D8E2F1] rounded text-xs font-bold text-center mx-auto block outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                />
                                            </td>
                                            <td className="py-2 px-2 text-center">
                                                <input
                                                    type="number" min="0" step="any"
                                                    value={line.lineDiscount}
                                                    onChange={e => handleLineChange(idx, 'lineDiscount', e.target.value)}
                                                    className="w-20 h-[30px] px-2 bg-white border border-[#D8E2F1] rounded text-xs font-semibold text-center mx-auto block outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                />
                                            </td>
                                            <td className="py-2 px-2 text-center">
                                                <select
                                                    value={line.taxId}
                                                    onChange={e => handleLineChange(idx, 'taxId', e.target.value)}
                                                    className="w-20 h-[30px] px-1 bg-white border border-[#D8E2F1] rounded text-xs font-semibold mx-auto block outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                >
                                                    <option value="">0%</option>
                                                    {taxes.map(tx => <option key={tx.id} value={tx.id}>{tx.rate || tx.percent}%</option>)}
                                                </select>
                                            </td>
                                            <td className="py-2 px-2 text-right rtl:text-left font-bold font-mono">
                                                {(line.amount || 0).toFixed(2)}
                                            </td>
                                            <td className="py-2 px-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeLine(idx)}
                                                    disabled={lines.length === 1}
                                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors disabled:opacity-30 cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECTION 3: NOTES, ATTACHMENTS & TOTALS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="lg:col-span-2 bg-white border border-[#DCE5F3] rounded-[11.86px] p-3 space-y-3">
                            <div className="flex items-center gap-2 border-b border-[#E4EAF0] pb-2">
                                <div className="w-[22px] h-[22px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[11px] font-bold flex items-center justify-center">
                                    3
                                </div>
                                <h2 className="text-[18px] font-semibold text-[#102A5B]">
                                    {isRTL ? 'الملاحظات والمرفقات' : 'Remarks & Attachments'}
                                </h2>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[13.22px] font-semibold text-[#102A5B] block mb-1">
                                        {isRTL ? 'الملاحظات' : 'Notes'}
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder={isRTL ? 'ملاحظات الفاتورة...' : 'Notes or remarks for the invoice...'}
                                        className="w-full p-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-xs font-medium text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                    />
                                </div>

                                <div>
                                    <label className="text-[13.22px] font-semibold text-[#102A5B] block mb-1">
                                        {isRTL ? 'المرفقات' : 'Attachments'}
                                    </label>
                                    <div className="h-[50px] bg-[#F8FBFE] border border-dashed border-[#CBD5E1] rounded-[10.06px] px-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Upload size={18} className="text-[var(--color-primary,#00A9A8)]" />
                                            <span className="text-[12px] text-[#334155]">{isRTL ? 'تحميل ملفات الفاتورة' : 'Upload invoice files'}</span>
                                        </div>
                                        <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" id="bill-files" />
                                        <label htmlFor="bill-files" className="px-3 py-1 bg-white border border-[#CBD5E1] rounded-[10.06px] text-xs text-[#0F172A] cursor-pointer hover:bg-slate-50">
                                            {isRTL ? 'تحديد الملفات' : 'Select Files'}
                                        </label>
                                    </div>

                                    {attachments.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {attachments.map((f, i) => (
                                                <div key={i} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded border border-[#D8E2F1]">
                                                    <span className="font-semibold text-[#102A5B] truncate">{f.name}</span>
                                                    <button type="button" onClick={() => removeAttachment(i)} className="text-rose-500 font-bold ml-2">×</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary Box */}
                        <div className="bg-white border border-[#DCE5F3] rounded-[11.86px] p-3 space-y-2">
                            <h3 className="text-xs font-bold text-[#102A5B] uppercase tracking-wider border-b border-[#E4EAF0] pb-2">
                                {isRTL ? 'ملخص الإجمالي' : 'Financial Net Totals'}
                            </h3>

                            <div className="space-y-2 text-xs font-semibold text-[#5F6F91]">
                                <div className="flex justify-between">
                                    <span>{t ? t('bill.subTotal') : 'Subtotal'}</span>
                                    <span className="font-bold text-[#102A5B] font-mono">{totals.subTotal.toFixed(2)} AED</span>
                                </div>
                                <div className="flex justify-between text-rose-600">
                                    <span>{t ? t('bill.totalDiscount') : 'Total Discount'}</span>
                                    <span className="font-bold font-mono">-{totals.totalDiscount.toFixed(2)} AED</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t ? t('bill.totalTax') : 'Total Tax'}</span>
                                    <span className="font-bold text-[#102A5B] font-mono">+{totals.totalTax.toFixed(2)} AED</span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-[#E4EAF0]">
                                    <span>{t ? t('bill.otherCharges') : 'Other Charges'}</span>
                                    <input
                                        type="number" min="0" step="any"
                                        value={formData.otherCharges}
                                        onChange={e => setFormData({ ...formData, otherCharges: e.target.value })}
                                        className="w-24 h-[28px] px-2 bg-white border border-[#D8E2F1] rounded text-right font-bold text-[#102A5B]"
                                    />
                                </div>
                                <div className="flex justify-between text-base font-black text-[#102A5B] pt-3 border-t-2 border-[#102A5B]">
                                    <span>{t ? t('bill.netTotal') : 'Net Total'}</span>
                                    <span className="text-[var(--color-primary,#00A9A8)] font-mono">{totals.netTotal.toFixed(2)} AED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PurchaseInvoiceForm;
