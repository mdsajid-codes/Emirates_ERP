import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Paperclip, ChevronDown, FileText, Menu, Upload, Edit3, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const QuotationForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isRTL, t } = useLanguage();
    const { id } = useParams();
    const isRevise = location.pathname.includes('/revise');
    const [searchParams] = useSearchParams();
    const cloneId = searchParams.get('cloneId');
    const isEditing = !!id && !isRevise;

    const [formData, setFormData] = useState({
        quotationDate: new Date().toISOString().split('T')[0],
        customerId: '',
        reference: '',
        expiryDate: '',
        quotationType: 'WITHOUT_DISCOUNT',
        items: [],
        termsAndConditions: '',
        notes: '',
        emailTo: '',
        status: 'DRAFT',
        totalDiscountPercentage: 0,
        otherChargesPercentage: 0,
        salespersonId: '',
    });

    const [selectData, setSelectData] = useState({ customers: [], allItems: [], employees: [], categories: [], subCategoryCache: {} });
    const [loading, setLoading] = useState(true);
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [error, setError] = useState(null);

    const fetchDependencies = useCallback(async () => {
        setLoading(true);
        try {
            const token = `Bearer ${localStorage.getItem('token')}`;
            const [customersRes, productsRes, rmRes, sfRes, fgRes, categoriesRes, employeesRes] = await Promise.all([
                axios.get(`${API_URL}/parties`, { headers: { Authorization: token } }),
                axios.get(`${API_URL}/crm/sales-products`, { headers: { Authorization: token }, params: { size: 1000 } }),
                axios.get(`${API_URL}/production/raw-materials`, { headers: { Authorization: token }, params: { size: 1000 } }),
                axios.get(`${API_URL}/production/semi-finished`, { headers: { Authorization: token }, params: { size: 1000 } }),
                axios.get(`${API_URL}/production/finished-goods`, { headers: { Authorization: token }, params: { size: 1000 } }),
                axios.get(`${API_URL}/production/categories`, { headers: { Authorization: token } }),
                axios.get(`${API_URL}/employees/all`, { headers: { Authorization: token } }),
            ]);

            const getList = (res) => Array.isArray(res.data) ? res.data : (res.data.content || []);

            const products = getList(productsRes).map(p => ({ ...p, type: 'PRODUCT', uniqueId: `PRODUCT-${p.id}`, label: `${p.name} (${p.itemCode}) - Product` }));
            const rawMaterials = getList(rmRes).map(r => ({ ...r, type: 'RAW_MATERIAL', uniqueId: `RM-${r.id}`, salesPrice: r.salesPrice || 0, label: `${r.name} (${r.itemCode}) - Raw Material` }));
            const semiFinished = getList(sfRes).map(s => ({ ...s, type: 'SEMI_FINISHED', uniqueId: `SF-${s.id}`, salesPrice: s.salesPrice || 0, label: `${s.name} (${s.itemCode}) - Semi-Finished` }));
            const finishedGoods = getList(fgRes).map(f => ({ ...f, type: 'FINISHED_GOOD', uniqueId: `FG-${f.id}`, salesPrice: f.salesPrice || 0, label: `${f.name} (${f.itemCode}) - Finished Good` }));

            const compiledItems = [...products, ...rawMaterials, ...semiFinished, ...finishedGoods];

            setSelectData({
                customers: customersRes.data.content || [],
                allItems: compiledItems,
                categories: categoriesRes.data || [],
                employees: employeesRes.data || [],
                subCategoryCache: {}
            });

            if (id || cloneId) {
                const fetchId = id || cloneId;
                const quotationRes = await axios.get(`${API_URL}/sales/quotations/${fetchId}`, { headers: { Authorization: token } });
                const data = quotationRes.data;

                setFormData({
                    ...data,
                    id: (isRevise || cloneId) ? undefined : data.id,
                    quotationNumber: (isRevise || cloneId) ? '' : data.quotationNumber,
                    quotationDate: new Date().toISOString().split('T')[0],
                    expiryDate: '',
                    reference: isRevise ? `Revise of ${data.quotationNumber}` : (cloneId ? data.reference : data.reference),
                    items: data.items.map(item => {
                        let uniqueId = '';
                        if (item.crmProductId) uniqueId = `PRODUCT-${item.crmProductId}`;
                        else if (item.rawMaterialId) uniqueId = `RM-${item.rawMaterialId}`;
                        else if (item.semiFinishedId) uniqueId = `SF-${item.semiFinishedId}`;
                        else if (item.finishedGoodId) uniqueId = `FG-${item.finishedGoodId}`;

                        const foundItem = compiledItems.find(i => i.uniqueId === uniqueId);

                        return {
                            ...item,
                            id: undefined,
                            selectedUniqueId: uniqueId,
                            searchInput: foundItem ? foundItem.label : (item.itemName || ''),
                            taxRate: item.taxPercentage || 0,
                        };
                    }),
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch initial data.');
        } finally {
            setLoading(false);
        }
    }, [id, cloneId, isRevise]);

    useEffect(() => {
        fetchDependencies();
    }, [fetchDependencies]);

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = async (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        const currentItem = { ...newItems[index] };

        if (name === 'categoryId') {
            currentItem.categoryId = value;
            currentItem.subcategoryId = '';
            currentItem.availableSubcategories = [];

            if (value) {
                try {
                    const token = `Bearer ${localStorage.getItem('token')}`;
                    const res = await axios.get(`${API_URL}/production/categories/${value}/subcategories`, { headers: { Authorization: token } });
                    currentItem.availableSubcategories = res.data;
                } catch (err) {
                    console.error('Failed to fetch subcategories', err);
                }
            }
        } else if (name === 'searchInput') {
            currentItem.searchInput = value;
            const selected = selectData.allItems.find(i => i.label === value);
            if (selected) {
                currentItem.selectedUniqueId = selected.uniqueId;
                currentItem.rate = selected.salesPrice || 0;
                currentItem.itemName = selected.name;
                currentItem.itemCode = selected.itemCode;

                currentItem.crmProductId = selected.type === 'PRODUCT' ? selected.id : null;
                currentItem.rawMaterialId = selected.type === 'RAW_MATERIAL' ? selected.id : null;
                currentItem.semiFinishedId = selected.type === 'SEMI_FINISHED' ? selected.id : null;
                currentItem.finishedGoodId = selected.type === 'FINISHED_GOOD' ? selected.id : null;
            } else {
                currentItem.selectedUniqueId = '';
                currentItem.rate = 0;
                currentItem.itemName = '';
                currentItem.itemCode = '';
                currentItem.crmProductId = null;
                currentItem.rawMaterialId = null;
                currentItem.semiFinishedId = null;
                currentItem.finishedGoodId = null;
            }
        } else {
            currentItem[name] = value;
        }

        newItems[index] = currentItem;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                { categoryId: '', subcategoryId: '', availableSubcategories: [], searchInput: '', selectedUniqueId: '', quantity: 1, rate: 0, discountPercent: 0, taxRate: 0 }
            ]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleFileChange = (e) => {
        setAttachmentFiles(Array.from(e.target.files));
    };

    const removeFile = (index) => {
        setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        let subTotal = 0;
        let totalTax = 0;
        let itemDiscountTotal = 0;

        formData.items.forEach(item => {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rate) || 0;
            const itemBase = qty * rate;

            let itemDisc = 0;
            if (formData.quotationType === 'WITH_DISCOUNT_AT_ITEM_LEVEL') {
                const discPct = parseFloat(item.discountPercent) || 0;
                itemDisc = (itemBase * discPct) / 100;
            }
            const itemNet = itemBase - itemDisc;
            const taxPct = parseFloat(item.taxRate) || 0;
            const taxVal = (itemNet * taxPct) / 100;

            subTotal += itemBase;
            itemDiscountTotal += itemDisc;
            totalTax += taxVal;
        });

        let totalDiscount = 0;
        if (formData.quotationType === 'WITH_DISCOUNT_AT_ITEM_LEVEL') {
            totalDiscount = itemDiscountTotal;
        } else if (formData.quotationType === 'WITH_DISCOUNT_AT_ORDER_LEVEL') {
            const globalPct = parseFloat(formData.totalDiscountPercentage) || 0;
            totalDiscount = (subTotal * globalPct) / 100;
        }

        const otherChargesPct = parseFloat(formData.otherChargesPercentage) || 0;
        const otherChargesAmount = (subTotal * otherChargesPct) / 100;
        const netTotal = (subTotal - totalDiscount) + totalTax + otherChargesAmount;

        return { subTotal, totalTax, totalDiscount, otherChargesAmount, netTotal };
    };

    const totals = calculateTotals();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = `Bearer ${localStorage.getItem('token')}`;
            const discountAmount = totals.totalDiscount;
            const chargesAmount = totals.otherChargesAmount;

            const quotationData = {
                ...formData,
                items: formData.items.map(item => {
                    const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
                    const taxValue = amount * (parseFloat(item.taxRate) || 0) / 100;
                    return {
                        ...item,
                        crmProductId: item.crmProductId ? parseInt(item.crmProductId, 10) : null,
                        rawMaterialId: item.rawMaterialId ? parseInt(item.rawMaterialId, 10) : null,
                        semiFinishedId: item.semiFinishedId ? parseInt(item.semiFinishedId, 10) : null,
                        finishedGoodId: item.finishedGoodId ? parseInt(item.finishedGoodId, 10) : null,
                        categoryId: item.categoryId ? parseInt(item.categoryId, 10) : null,
                        subcategoryId: item.subcategoryId ? parseInt(item.subcategoryId, 10) : null,
                        taxValue: taxValue.toFixed(2),
                        quantity: parseFloat(item.quantity) || 0,
                        rate: parseFloat(item.rate) || 0,
                        taxPercentage: parseFloat(item.taxRate) || 0,
                    };
                }),
                totalDiscount: discountAmount.toFixed(2),
                otherCharges: chargesAmount.toFixed(2),
                salespersonId: formData.salespersonId ? parseInt(formData.salespersonId, 10) : null,
            };

            const payload = new FormData();
            payload.append('quotation', new Blob([JSON.stringify(quotationData)], { type: 'application/json' }));
            attachmentFiles.forEach(file => payload.append('attachments', file));

            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: token } };

            if (isEditing) {
                await axios.put(`${API_URL}/sales/quotations/${id}`, payload, config);
            } else {
                await axios.post(`${API_URL}/sales/quotations`, payload, config);
            }
            navigate('/sales-dashboard/quotations');
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} quotation.`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.customerId) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="bg-background text-foreground font-sans space-y-2 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <FileText size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">
                            {isEditing ? t('qform.editQuotation') : isRevise ? t('qform.reviseQuotation') : t('qform.newQuotation')}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none">
                            {t('qform.subTitle')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                        type="button"
                        onClick={() => navigate('/sales-dashboard/quotations')}
                        className="px-3 py-1 border border-border bg-card hover:bg-hover text-foreground rounded-md text-[11px] font-semibold transition-colors"
                    >
                        {t('qform.cancel')}
                    </button>
                    <button
                        type="submit"
                        form="quotation-form"
                        disabled={loading}
                        className="px-3.5 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                    >
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                        {isEditing ? t('qform.saveChanges') : t('qform.createBtn')}
                    </button>
                </div>
            </div>

            <form id="quotation-form" onSubmit={handleSubmit} className="space-y-2">
                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-600 px-2.5 py-1.5 rounded-md text-[11px] font-medium">{error}</div>}

                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-border">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <Menu size={13} />
                        </div>
                        <h2 className="text-xs font-bold text-foreground">{t('qform.detailsTitle')}</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.customer')} *</label>
                            <select
                                name="customerId"
                                value={formData.customerId}
                                onChange={handleHeaderChange}
                                required
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            >
                                <option value="">{t('qform.selectCustomer')}</option>
                                {selectData.customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.quotationDate')} *</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="quotationDate"
                                    value={formData.quotationDate}
                                    onChange={handleHeaderChange}
                                    required
                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary pr-6"
                                />
                                <Calendar size={12} className="absolute right-1.5 top-1.5 text-foreground-muted pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.expiryDate')}</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleHeaderChange}
                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary pr-6"
                                />
                                <Calendar size={12} className="absolute right-1.5 top-1.5 text-foreground-muted pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.salesperson')}</label>
                            <select
                                name="salespersonId"
                                value={formData.salespersonId}
                                onChange={handleHeaderChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            >
                                <option value="">{t('qform.selectSalesperson')}</option>
                                {selectData.employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.reference')}</label>
                            <input
                                type="text"
                                name="reference"
                                placeholder={t('qform.enterReference')}
                                value={formData.reference}
                                onChange={handleHeaderChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.quotationType')}</label>
                            <select
                                name="quotationType"
                                value={formData.quotationType}
                                onChange={handleHeaderChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            >
                                <option value="WITHOUT_DISCOUNT">{t('qform.withoutDiscount')}</option>
                                <option value="WITH_DISCOUNT_AT_ITEM_LEVEL">{t('qform.discountItem')}</option>
                                <option value="WITH_DISCOUNT_AT_ORDER_LEVEL">{t('qform.discountOrder')}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.status')}</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleHeaderChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            >
                                <option value="DRAFT">{t('qform.draft')}</option>
                                <option value="SENT">{t('qform.sent')}</option>
                                <option value="ACCEPTED">{t('qform.accepted')}</option>
                                <option value="REJECTED">{t('qform.rejected')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                    <div className="rounded border border-border">
                        <table className="w-full text-[11px] text-left border-collapse">
                            <thead>
                                <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                    <th className="px-2 py-1.5 border-r border-border w-8">{t('quotation.sno')}</th>
                                    <th className="px-2 py-1.5 border-r border-border min-w-[140px]">{t('qform.category')}</th>
                                    <th className="px-2 py-1.5 border-r border-border min-w-[140px]">{t('qform.subcategory')}</th>
                                    <th className="px-2 py-1.5 border-r border-border min-w-[170px]">{t('qform.item')}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-16">{t('qform.quantity')}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-20">{t('qform.rate')}</th>
                                    {formData.quotationType === 'WITH_DISCOUNT_AT_ITEM_LEVEL' && (
                                        <th className="px-2 py-1.5 border-r border-border w-16">{t('qform.disc')}</th>
                                    )}
                                    <th className="px-2 py-1.5 border-r border-border w-16">{t('qform.tax')}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-24">{t('qform.amount')}</th>
                                    <th className="px-1.5 py-1.5 text-center w-12">{t('quotation.action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {formData.items.map((item, index) => (
                                    <tr key={index} className="hover:bg-hover text-foreground relative z-10 hover:z-20">
                                        <td className="px-2 py-1 border-r border-border font-medium text-center">{index + 1}</td>

                                        <td className="px-1 py-1 border-r border-border">
                                            <select
                                                name="categoryId"
                                                value={item.categoryId || ''}
                                                onChange={(e) => handleItemChange(index, e)}
                                                className="w-full h-6 text-[11px] border border-border bg-background rounded px-1.5 text-foreground focus:outline-none focus:border-primary"
                                            >
                                                <option value="">{t('qform.selectCategory')}</option>
                                                {selectData.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </td>

                                        <td className="px-1 py-1 border-r border-border">
                                            <select
                                                name="subcategoryId"
                                                value={item.subcategoryId || ''}
                                                onChange={(e) => handleItemChange(index, e)}
                                                className="w-full h-6 text-[11px] border border-border bg-background rounded px-1.5 text-foreground focus:outline-none focus:border-primary disabled:opacity-50"
                                                disabled={!item.categoryId}
                                            >
                                                <option value="">{t('qform.selectSubcategory')}</option>
                                                {(item.availableSubcategories || []).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                                            </select>
                                        </td>

                                        <td className="px-1 py-1 border-r border-border relative">
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    name="searchInput"
                                                    value={item.searchInput || ''}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    className="w-full h-6 text-[11px] border border-border bg-background rounded px-1.5 pr-5 text-foreground focus:outline-none focus:border-primary"
                                                    placeholder={t('qform.searchItem')}
                                                    required
                                                    autoComplete="off"
                                                />
                                                <ChevronDown size={11} className="absolute right-1 top-1.5 text-foreground-muted pointer-events-none" />

                                                <div className="absolute left-0 right-0 top-full z-[100] bg-card border border-border rounded-md mt-0.5 shadow-xl hidden group-focus-within:block max-h-48 overflow-y-auto">
                                                    {selectData.allItems
                                                        .filter(i => {
                                                            if (item.categoryId && i.categoryId != item.categoryId) return false;
                                                            if (item.subcategoryId && i.subcategoryId != item.subcategoryId) return false;
                                                            return (i.label || '').toLowerCase().includes((item.searchInput || '').toLowerCase());
                                                        })
                                                        .map(itm => (
                                                            <div
                                                                key={itm.uniqueId}
                                                                className="px-2 py-1.5 text-[11px] hover:bg-primary/10 cursor-pointer border-b last:border-b-0 border-border flex justify-between items-center text-foreground"
                                                                onMouseDown={() => {
                                                                    const event = { target: { name: 'searchInput', value: itm.label } };
                                                                    handleItemChange(index, event);
                                                                }}
                                                            >
                                                                <span className="font-medium">{itm.name}</span>
                                                                <span className="text-[9px] text-foreground-muted bg-background px-1 py-0.5 rounded border border-border shrink-0 ml-1">{itm.type.replace('_', ' ')}</span>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-1 py-1 border-r border-border">
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, e)}
                                                className="w-full h-6 text-[11px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary"
                                                min="1"
                                            />
                                        </td>

                                        <td className="px-1 py-1 border-r border-border">
                                            <input
                                                type="number"
                                                name="rate"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(index, e)}
                                                className="w-full h-6 text-[11px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary"
                                            />
                                        </td>

                                        {formData.quotationType === 'WITH_DISCOUNT_AT_ITEM_LEVEL' && (
                                            <td className="px-1 py-1 border-r border-border">
                                                <input
                                                    type="number"
                                                    name="discountPercent"
                                                    value={item.discountPercent || ''}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    className="w-full h-6 text-[11px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary"
                                                />
                                            </td>
                                        )}

                                        <td className="px-1 py-1 border-r border-border">
                                            <input
                                                type="number"
                                                name="taxRate"
                                                value={item.taxRate}
                                                onChange={(e) => handleItemChange(index, e)}
                                                className="w-full h-6 text-[11px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary"
                                            />
                                        </td>

                                        <td className="px-2 py-1 border-r border-border font-bold text-foreground">
                                            AED {(((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)) - (formData.quotationType === 'WITH_DISCOUNT_AT_ITEM_LEVEL' ? ((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0) * ((parseFloat(item.discountPercent) || 0) / 100)) : 0)).toFixed(2)}
                                        </td>

                                        <td className="px-1 py-1 text-center">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="w-4 h-4 rounded border border-border flex items-center justify-center text-red-600 hover:bg-red-500/10"
                                                    title="Remove item"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                        <button
                            type="button"
                            onClick={addItem}
                            className="px-2.5 py-1 bg-card border border-border hover:bg-hover text-foreground rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                        >
                            <Plus size={12} /> {t('qform.addItem')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs flex flex-col justify-between space-y-1.5">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-border">
                            <Paperclip size={13} className="text-primary" />
                            <h3 className="text-xs font-bold text-foreground">{t('qform.attachments')}</h3>
                        </div>
                        <div className="border border-dashed border-border rounded-lg p-2 text-center bg-background/50 flex flex-col items-center justify-center space-y-1">
                            <Upload size={15} className="text-primary" />
                            <p className="text-[10px] text-foreground-muted">{t('qform.dragDrop')}</p>
                            <input type="file" multiple onChange={handleFileChange} className="hidden" id="attachment-upload" />
                            <label
                                htmlFor="attachment-upload"
                                className="px-2 py-0.5 bg-card border border-border text-foreground hover:bg-hover rounded text-[10px] font-semibold cursor-pointer shadow-2xs"
                            >
                                {t('qform.selectFiles')}
                            </label>
                            <p className="text-[8px] text-foreground-muted">{t('qform.supports')}</p>
                        </div>
                        {attachmentFiles.length > 0 && (
                            <div className="space-y-1 max-h-16 overflow-y-auto">
                                {attachmentFiles.map((file, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-[9px] p-1 bg-background rounded border border-border text-foreground">
                                        <span className="truncate">{file.name}</span>
                                        <button type="button" onClick={() => removeFile(idx)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-1">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-border">
                            <FileText size={13} className="text-primary" />
                            <h3 className="text-xs font-bold text-foreground">{t('qform.terms')}</h3>
                        </div>
                        <textarea
                            name="termsAndConditions"
                            placeholder={t('qform.enterTerms')}
                            value={formData.termsAndConditions}
                            onChange={handleHeaderChange}
                            rows="3"
                            className="w-full text-[11px] border border-border bg-background rounded p-1.5 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary resize-none"
                        ></textarea>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-1">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-border">
                            <Edit3 size={13} className="text-primary" />
                            <h3 className="text-xs font-bold text-foreground">{t('qform.notes')}</h3>
                        </div>
                        <textarea
                            name="notes"
                            placeholder={t('qform.enterNotes')}
                            value={formData.notes}
                            onChange={handleHeaderChange}
                            rows="3"
                            className="w-full text-[11px] border border-border bg-background rounded p-1.5 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary resize-none"
                        ></textarea>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs flex flex-col justify-between space-y-1.5">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-border">
                            <FileText size={13} className="text-primary" />
                            <h3 className="text-xs font-bold text-foreground">{t('qform.summary')}</h3>
                        </div>

                        <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between items-center text-foreground-muted">
                                <span>{t('qform.subTotal')}</span>
                                <span className="font-semibold text-foreground">AED {totals.subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-foreground-muted">
                                <span>{t('qform.totalTax')}</span>
                                <span className="font-semibold text-foreground">AED {totals.totalTax.toFixed(2)}</span>
                            </div>

                            {formData.quotationType === 'WITH_DISCOUNT_AT_ORDER_LEVEL' && (
                                <div className="flex justify-between items-center pt-0.5 border-t border-border">
                                    <span className="text-foreground-muted">{t('qform.discountPercent')}</span>
                                    <input
                                        type="number"
                                        name="totalDiscountPercentage"
                                        value={formData.totalDiscountPercentage}
                                        onChange={handleHeaderChange}
                                        className="w-12 h-5 text-[11px] border border-border bg-background rounded px-1 text-right text-foreground focus:outline-none focus:border-primary"
                                    />
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-0.5 border-t border-border">
                                <span className="text-foreground-muted">{t('qform.otherCharges')}</span>
                                <input
                                    type="number"
                                    name="otherChargesPercentage"
                                    value={formData.otherChargesPercentage}
                                    onChange={handleHeaderChange}
                                    className="w-12 h-5 text-[11px] border border-border bg-background rounded px-1 text-right text-foreground focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="bg-primary/10 p-2 rounded flex justify-between items-center text-foreground font-bold">
                            <span className="text-[11px]">{t('qform.netTotal')}</span>
                            <span className="text-xs text-primary">AED {totals.netTotal.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default QuotationForm;