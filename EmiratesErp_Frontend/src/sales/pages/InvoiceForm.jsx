import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Paperclip, ChevronDown, Upload } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const InvoiceForm = () => {
    const { isRTL, t } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const salesOrderId = searchParams.get('salesOrderId');
    const quotationId = searchParams.get('quotationId');
    const proformaInvoiceId = searchParams.get('proformaInvoiceId');
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        invoiceLedger: 'Sales',
        invoiceDate: new Date().toISOString().split('T')[0],
        customerId: '',
        invoiceNumber: '',
        reference: '',
        orderNumber: '',
        customerPoNo: '',
        customerPoDate: '',
        dueDate: '',
        dateOfSupply: '',
        salespersonId: '',
        saleType: 'Local', // Default or empty
        enableGrossNetWeight: false,
        delayReason: '',

        amountReceived: 0,
        balanceDue: 0,

        subTotal: 0,
        totalDiscount: 0,
        grossTotal: 0,
        totalTax: 0,
        otherCharges: 0,
        netTotal: 0,

        items: [],
        attachments: [],

        termsAndConditions: '',
        notes: '',
        template: 'Standard',
        emailTo: '',
        status: 'DRAFT'
    });

    const [selectData, setSelectData] = useState({ customers: [], allItems: [], categories: [], employees: [], subCategoryCache: {} });
    const [loading, setLoading] = useState(true);
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [error, setError] = useState(null);

    const [billingAddress, setBillingAddress] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');

    // Payment modal
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState({ amountPaid: '', paymentDate: new Date().toISOString().split('T')[0], paymentMethod: 'BANK', referenceNumber: '', notes: '' });
    const [paymentLoading, setPaymentLoading] = useState(false);

    const fetchDependencies = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [custRes, prodRes, rmRes, sfRes, fgRes, catRes, empRes] = await Promise.all([
                axios.get(`${API_URL}/parties`, { headers }),
                axios.get(`${API_URL}/crm/sales-products`, { headers, params: { size: 1000 } }),
                axios.get(`${API_URL}/production/raw-materials`, { headers, params: { size: 1000 } }),
                axios.get(`${API_URL}/production/semi-finished`, { headers, params: { size: 1000 } }),
                axios.get(`${API_URL}/production/finished-goods`, { headers, params: { size: 1000 } }),
                axios.get(`${API_URL}/production/categories`, { headers }),
                axios.get(`${API_URL}/employees/all`, { headers }),
            ]);

            const getList = (res) => Array.isArray(res.data) ? res.data : (res.data.content || []);

            const products = getList(prodRes).map(p => ({ ...p, type: 'PRODUCT', uniqueId: `PRODUCT-${p.id}`, label: `${p.name} (${p.itemCode}) - Product` }));
            const rawMaterials = getList(rmRes).map(r => ({ ...r, type: 'RAW_MATERIAL', uniqueId: `RM-${r.id}`, salesPrice: r.salesPrice || 0, label: `${r.name} (${r.itemCode}) - Raw Material` }));
            const semiFinished = getList(sfRes).map(s => ({ ...s, type: 'SEMI_FINISHED', uniqueId: `SF-${s.id}`, salesPrice: s.salesPrice || 0, label: `${s.name} (${s.itemCode}) - Semi-Finished` }));
            const finishedGoods = getList(fgRes).map(f => ({ ...f, type: 'FINISHED_GOOD', uniqueId: `FG-${f.id}`, salesPrice: f.salesPrice || 0, label: `${f.name} (${f.itemCode}) - Finished Good` }));

            const compiledItems = [...products, ...rawMaterials, ...semiFinished, ...finishedGoods];

            setSelectData({
                customers: getList(custRes),
                allItems: compiledItems,
                categories: catRes.data || [],
                employees: empRes.data || [],
                subCategoryCache: {}
            });

            // Handle edit or create from other doc
            if (isEditing) {
                const res = await axios.get(`${API_URL}/sales/sales-invoices/${id}`, { headers });
                const data = res.data;

                // Pre-fetch subcategories for existing items
                const categoryIds = [...new Set(data.items.map(item => item.categoryId).filter(id => id))];
                let subCategoryMap = {};

                if (categoryIds.length > 0) {
                    await Promise.all(categoryIds.map(async (catId) => {
                        try {
                            const res = await axios.get(`${API_URL}/production/sub-categories?categoryId=${catId}`, { headers });
                            subCategoryMap[catId] = res.data || [];
                        } catch (e) {
                            console.error(`Failed to load subcategories for category ${catId}`, e);
                        }
                    }));
                }

                setSelectData(prev => ({ ...prev, subCategoryCache: { ...prev.subCategoryCache, ...subCategoryMap } }));

                setFormData({
                    ...data,
                    invoiceDate: data.invoiceDate || '',
                    customerPoDate: data.customerPoDate || '',
                    dueDate: data.dueDate || '',
                    dateOfSupply: data.dateOfSupply || '',
                    items: data.items.map(item => {
                        let uniqueId = '';
                        if (item.crmProductId) uniqueId = `PRODUCT-${item.crmProductId}`;
                        else if (item.rawMaterialId) uniqueId = `RM-${item.rawMaterialId}`;
                        else if (item.semiFinishedId) uniqueId = `SF-${item.semiFinishedId}`;
                        else if (item.finishedGoodId) uniqueId = `FG-${item.finishedGoodId}`;

                        const foundItem = compiledItems.find(i => i.uniqueId === uniqueId);

                        return {
                            ...item,
                            selectedUniqueId: uniqueId,
                            searchInput: foundItem ? foundItem.label : (item.itemName || ''),
                            availableSubcategories: subCategoryMap[item.categoryId] || []
                        };
                    })
                });

                // Set Address
                const cust = getList(custRes).find(c => c.id === data.customerId);
                if (cust) {
                    setBillingAddress(formatAddress(cust.billingAddress));
                    setShippingAddress(formatAddress(cust.shippingAddress));
                }

            } else if (salesOrderId) {
                const res = await axios.get(`${API_URL}/sales/orders/${salesOrderId}`, { headers });
                const data = res.data;
                // Pre-fetch subcategories
                const categoryIds = [...new Set(data.items.map(item => item.categoryId).filter(id => id))];
                let subCategoryMap = {};
                if (categoryIds.length > 0) {
                    await Promise.all(categoryIds.map(async (catId) => {
                        try {
                            const scRes = await axios.get(`${API_URL}/production/sub-categories?categoryId=${catId}`, { headers });
                            subCategoryMap[catId] = scRes.data || [];
                        } catch (e) { }
                    }));
                }
                setSelectData(prev => ({ ...prev, subCategoryCache: { ...prev.subCategoryCache, ...subCategoryMap } }));

                setFormData(prev => ({
                    ...prev,
                    customerId: data.customerId,
                    orderNumber: data.salesOrderNumber,
                    salespersonId: data.salespersonId,
                    items: data.items.map(item => {
                        let uniqueId = '';
                        if (item.crmProductId) uniqueId = `PRODUCT-${item.crmProductId}`;
                        else if (item.rawMaterialId) uniqueId = `RM-${item.rawMaterialId}`;
                        else if (item.semiFinishedId) uniqueId = `SF-${item.semiFinishedId}`;
                        else if (item.finishedGoodId) uniqueId = `FG-${item.finishedGoodId}`;

                        const foundItem = compiledItems.find(i => i.uniqueId === uniqueId);

                        return {
                            ...item,
                            id: undefined, // Clear ID for new invoice item
                            selectedUniqueId: uniqueId,
                            searchInput: foundItem ? foundItem.label : (item.itemName || ''),
                            availableSubcategories: subCategoryMap[item.categoryId] || [],
                            invoiceQuantity: item.quantity, // Default inv qty to SO qty
                            sendQuantity: item.quantity,
                            items: undefined, // ensure clean
                        }
                    })
                }));
                const cust = getList(custRes).find(c => c.id === data.customerId);
                if (cust) {
                    setBillingAddress(formatAddress(cust.billingAddress));
                    setShippingAddress(formatAddress(cust.shippingAddress));
                }

            } else if (quotationId) {
                const res = await axios.get(`${API_URL}/sales/quotations/${quotationId}`, { headers });
                const data = res.data;
                const categoryIds = [...new Set(data.items.map(item => item.categoryId).filter(id => id))];
                let subCategoryMap = {};
                if (categoryIds.length > 0) {
                    await Promise.all(categoryIds.map(async (catId) => {
                        try {
                            const scRes = await axios.get(`${API_URL}/production/sub-categories?categoryId=${catId}`, { headers });
                            subCategoryMap[catId] = scRes.data || [];
                        } catch (e) { }
                    }));
                }
                setSelectData(prev => ({ ...prev, subCategoryCache: { ...prev.subCategoryCache, ...subCategoryMap } }));

                setFormData(prev => ({
                    ...prev,
                    customerId: data.customerId,
                    reference: data.quotationNumber,
                    salespersonId: data.salespersonId,
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
                            availableSubcategories: subCategoryMap[item.categoryId] || [],
                            invoiceQuantity: item.quantity,
                            sendQuantity: item.quantity
                        }
                    })
                }));
                const cust = getList(custRes).find(c => c.id === data.customerId);
                if (cust) {
                    setBillingAddress(formatAddress(cust.billingAddress));
                    setShippingAddress(formatAddress(cust.shippingAddress));
                }
            } else if (proformaInvoiceId) {
                // Similar logic if needed for Proforma
            }

        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} invoice.`);
            console.error('Submit error:', err);
        } finally {
            setLoading(false);
        }
    }, [id, isEditing, salesOrderId, quotationId, proformaInvoiceId]);

    useEffect(() => {
        fetchDependencies();
    }, [fetchDependencies]);

    const formatAddress = (addr) => {
        if (!addr) return '';
        if (typeof addr === 'string') return addr;
        return [addr.addressLine, addr.city, addr.country].filter(Boolean).join(', ');
    };

    const handleHeaderChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));

        if (name === 'customerId') {
            const cust = selectData.customers.find(c => c.id.toString() === value);
            if (cust) {
                setBillingAddress(formatAddress(cust.billingAddress));
                setShippingAddress(formatAddress(cust.shippingAddress));
            } else {
                setBillingAddress('');
                setShippingAddress('');
            }
        }
    };

    const handleItemChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const newItems = [...formData.items];

        if (name === 'searchInput') {
            const selectedItem = selectData.allItems.find(item => item.label === value);
            newItems[index].searchInput = value;

            // Clear IDs
            newItems[index].crmProductId = null;
            newItems[index].rawMaterialId = null;
            newItems[index].semiFinishedId = null;
            newItems[index].finishedGoodId = null;
            newItems[index].selectedUniqueId = '';

            if (selectedItem) {
                newItems[index].selectedUniqueId = selectedItem.uniqueId;
                newItems[index].itemName = selectedItem.name;
                newItems[index].itemCode = selectedItem.itemCode;
                newItems[index].description = selectedItem.description || '';
                newItems[index].rate = selectedItem.salesPrice;
                newItems[index].taxPercentage = selectedItem.taxRate || 5;

                if (selectedItem.type === 'PRODUCT') newItems[index].crmProductId = selectedItem.id;
                else if (selectedItem.type === 'RAW_MATERIAL') newItems[index].rawMaterialId = selectedItem.id;
                else if (selectedItem.type === 'SEMI_FINISHED') newItems[index].semiFinishedId = selectedItem.id;
                else if (selectedItem.type === 'FINISHED_GOOD') newItems[index].finishedGoodId = selectedItem.id;
            }
        } else if (name === 'categoryId') {
            newItems[index].categoryId = value;
            newItems[index].subcategoryId = '';

            if (value && selectData.subCategoryCache[value]) {
                newItems[index].availableSubcategories = selectData.subCategoryCache[value];
                setFormData(prev => ({ ...prev, items: newItems }));
            } else if (value) {
                newItems[index].availableSubcategories = [];
                setFormData(prev => ({ ...prev, items: newItems })); // update state first

                const token = localStorage.getItem('token');
                axios.get(`${API_URL}/production/sub-categories?categoryId=${value}`, { headers: { Authorization: `Bearer ${token}` } })
                    .then(res => {
                        const fetched = res.data || [];
                        setSelectData(prev => ({
                            ...prev,
                            subCategoryCache: { ...prev.subCategoryCache, [value]: fetched }
                        }));
                        setFormData(current => {
                            const updated = current.items.map(it => it.categoryId == value ? { ...it, availableSubcategories: fetched } : it);
                            return { ...current, items: updated };
                        });
                    });
            } else {
                newItems[index].availableSubcategories = [];
            }
        } else if (type === 'checkbox') {
            newItems[index][name] = checked;
        } else {
            newItems[index][name] = value;
        }

        if (name !== 'categoryId') {
            // Recalculate row amount and tax
            const qty = Number(newItems[index].invoiceQuantity) || 0;
            const rate = Number(newItems[index].rate) || 0;
            const amount = qty * rate;
            newItems[index].amount = amount;

            let tax = 0;
            if (!newItems[index].isTaxExempt) {
                const taxPct = Number(newItems[index].taxPercentage) || 0;
                tax = (amount * taxPct) / 100;
            }
            newItems[index].taxValue = tax;

            setFormData(prev => ({ ...prev, items: newItems }));
        }
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                selectedUniqueId: '',
                searchInput: '',
                crmProductId: null,
                rawMaterialId: null,
                semiFinishedId: null,
                finishedGoodId: null,
                categoryId: '',
                subcategoryId: '',
                description: '',
                quantityGross: 0,
                quantityNet: 0,
                sendQuantity: 0,
                invoiceQuantity: 1,
                packingType: '',
                rate: 0,
                amount: 0,
                taxPercentage: 5,
                taxValue: 0,
                isTaxExempt: false,
                availableSubcategories: []
            }]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setAttachmentFiles([...attachmentFiles, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index) => {
        setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Calculate Totals Effect
    useEffect(() => {
        let sub = 0;
        let tax = 0;
        formData.items.forEach(item => {
            sub += Number(item.amount) || 0;
            tax += Number(item.taxValue) || 0;
        });

        const discount = Number(formData.totalDiscount) || 0;
        const other = Number(formData.otherCharges) || 0;
        const gross = sub - discount;
        const net = gross + tax + other;

        const received = Number(formData.amountReceived) || 0;
        const balance = net - received;

        setFormData(prev => ({
            ...prev,
            subTotal: sub,
            totalTax: tax,
            grossTotal: gross,
            netTotal: net,
            balanceDue: balance
        }));
    }, [formData.items, formData.totalDiscount, formData.otherCharges, formData.amountReceived]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const dataToSubmit = {
                ...formData,
                items: formData.items.map(item => ({
                    crmProductId: item.crmProductId ? parseInt(item.crmProductId) : null,
                    rawMaterialId: item.rawMaterialId ? parseInt(item.rawMaterialId) : null,
                    semiFinishedId: item.semiFinishedId ? parseInt(item.semiFinishedId) : null,
                    finishedGoodId: item.finishedGoodId ? parseInt(item.finishedGoodId) : null,

                    itemCode: item.itemCode,
                    itemName: item.itemName,
                    description: item.description,

                    categoryId: item.categoryId ? parseInt(item.categoryId) : null,
                    subcategoryId: item.subcategoryId ? parseInt(item.subcategoryId) : null,

                    quantityGross: Number(item.quantityGross),
                    quantityNet: Number(item.quantityNet),
                    sendQuantity: Number(item.sendQuantity),
                    invoiceQuantity: Number(item.invoiceQuantity),
                    packingType: item.packingType,
                    rate: Number(item.rate),
                    amount: Number(item.amount),
                    taxValue: Number(item.taxValue),
                    isTaxExempt: item.isTaxExempt,
                    taxPercentage: Number(item.taxPercentage)
                })),
                // Ensure nulls for empty strings for date fields if backend requires
                customerPoDate: formData.customerPoDate || null,
                invoiceDate: formData.invoiceDate || null,
                dueDate: formData.dueDate || null,
                dateOfSupply: formData.dateOfSupply || null,
                // Remove UI fields
                attachments: undefined
            };

            const payload = new FormData();
            payload.append('data', new Blob([JSON.stringify(dataToSubmit)], { type: 'application/json' }));
            attachmentFiles.forEach(file => payload.append('files', file));

            const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };

            if (isEditing) {
                await axios.put(`${API_URL}/sales/sales-invoices/${id}`, payload, config);
            } else {
                await axios.post(`${API_URL}/sales/sales-invoices`, payload, config);
                // Status updates for prev documents
                if (quotationId) {
                    try {
                        await axios.patch(`${API_URL}/sales/quotations/${quotationId}/status`, null, {
                            params: { status: 'INVOICED' },
                            headers: { Authorization: `Bearer ${token}` }
                        });
                    } catch (e) { }
                }
                if (salesOrderId) {
                    try {
                        await axios.patch(`${API_URL}/sales/orders/${salesOrderId}/status`, null, {
                            params: { status: 'INVOICED' },
                            headers: { Authorization: `Bearer ${token}` }
                        });
                    } catch (e) { }
                }
            }
            navigate('/sales-dashboard/invoices');
        } catch (err) {
            console.error(err);
            alert("Failed to save invoice: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        if (!paymentForm.amountPaid || Number(paymentForm.amountPaid) <= 0) {
            alert('Please enter a valid payment amount.');
            return;
        }
        setPaymentLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/sales/sales-invoices/${id}/record-payment`, {
                amountPaid: Number(paymentForm.amountPaid),
                paymentDate: paymentForm.paymentDate,
                paymentMethod: paymentForm.paymentMethod,
                referenceNumber: paymentForm.referenceNumber || null,
                notes: paymentForm.notes || null,
            }, { headers: { Authorization: `Bearer ${token}` } });
            // Refresh the invoice data
            setFormData(prev => ({ ...prev, status: res.data.status, amountReceived: res.data.amountReceived, balanceDue: res.data.balanceDue }));
            setShowPaymentModal(false);
            alert('Payment recorded and posted to Accounting successfully!');
        } catch (err) {
            alert('Failed to record payment: ' + (err.response?.data?.message || err.message));
        } finally {
            setPaymentLoading(false);
        }
    };

    if (loading && !formData.customerId) return <div className="flex justify-center items-center h-screen bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

    return (
        <div className="bg-background text-foreground font-sans space-y-2 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Top Bar Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/sales-dashboard/invoices')}
                        className="p-1 rounded-md hover:bg-hover text-foreground-muted hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
                    </button>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight flex items-center gap-2">
                            {isEditing ? (isRTL ? 'تعديل فاتورة المبيعات' : 'Edit Sales Invoice') : (isRTL ? 'إنشاء فاتورة مبيعات' : 'Create Sales Invoice')}
                            {isEditing && formData.status && (
                                <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded uppercase ${
                                    formData.status === 'PAID' ? 'bg-emerald-600 text-white' :
                                    formData.status === 'PARTIALLY_PAID' ? 'bg-amber-600 text-white' :
                                    formData.status === 'INVOICED' ? 'bg-blue-600 text-white' :
                                    'bg-slate-500 text-white'
                                }`}>{formData.status.replace('_', ' ')}</span>
                            )}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none mt-0.5">
                            {isRTL ? 'الرئيسية > المبيعات > فواتير المبيعات' : 'Home > Sales > Sales Invoices'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    {isEditing && (formData.status === 'INVOICED' || formData.status === 'PARTIALLY_PAID') && (
                        <button
                            type="button"
                            onClick={() => { setPaymentForm(p => ({ ...p, amountPaid: formData.balanceDue || '' })); setShowPaymentModal(true); }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                        >
                            💰 {isRTL ? 'تسجيل دفعة' : 'Record Payment'}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => navigate('/sales-dashboard/invoices')}
                        className="px-3 py-1 border border-border bg-card hover:bg-hover text-foreground rounded-md text-[11px] font-semibold transition-colors"
                    >
                        {t('qform.cancel')}
                    </button>
                    <button
                        type="submit"
                        form="inv-form"
                        disabled={loading}
                        className="px-3.5 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        {isEditing ? t('qform.saveChanges') : (isRTL ? 'حفظ الفاتورة' : 'Save Invoice')}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 px-2.5 py-1.5 rounded-md text-[11px] font-medium">
                    {error}
                </div>
            )}

            <form id="inv-form" onSubmit={handleSubmit} className="space-y-2">
                {/* Header Details Card */}
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'دفتر الفواتير' : 'Invoice Ledger'}</label>
                            <select
                                name="invoiceLedger"
                                value={formData.invoiceLedger}
                                onChange={handleHeaderChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            >
                                <option value="Sales">Sales</option>
                            </select>
                        </div>

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
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'تاريخ الفاتورة *' : 'Invoice Date *'}</label>
                            <input
                                type="date"
                                name="invoiceDate"
                                value={formData.invoiceDate}
                                onChange={handleHeaderChange}
                                required
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleHeaderChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'رقم امر الشراء للميل' : 'Customer PO No'}</label>
                            <input
                                type="text"
                                name="customerPoNo"
                                placeholder="Customer PO No"
                                value={formData.customerPoNo}
                                onChange={handleHeaderChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'تاريخ امر الشراء' : 'Customer PO Date'}</label>
                            <input
                                type="date"
                                name="customerPoDate"
                                value={formData.customerPoDate}
                                onChange={handleHeaderChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            />
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-border">
                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'عنوان الفواتير' : 'Billing Address'}</label>
                            <textarea
                                readOnly
                                value={billingAddress}
                                rows="2"
                                className="w-full text-[11px] border border-border bg-card-muted/50 rounded p-1.5 text-foreground-muted focus:outline-none"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'عنوان الشحن' : 'Shipping Address'}</label>
                            <textarea
                                readOnly
                                value={shippingAddress}
                                rows="2"
                                className="w-full text-[11px] border border-border bg-card-muted/50 rounded p-1.5 text-foreground-muted focus:outline-none"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Items Table Card */}
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                    <div className="rounded border border-border">
                        <table className="w-full text-[11px] text-start border-collapse">
                            <thead>
                                <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                    <th className="px-2 py-1.5 border-r border-border w-8 text-center">{isRTL ? 'م' : 'S.No.'}</th>
                                    <th className="px-2 py-1.5 border-r border-border min-w-[130px]">{t('qform.category')}</th>
                                    <th className="px-2 py-1.5 border-r border-border min-w-[130px]">{t('qform.subcategory')}</th>
                                    <th className="px-2 py-1.5 border-r border-border min-w-[160px]">{t('qform.item')}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-16 text-center">{isRTL ? 'كمية الإرسال' : 'Send Qty'}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-16 text-center">{isRTL ? 'كمية الفاتورة' : 'Inv Qty'}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-24 text-end">{t('qform.rate')} (AED)</th>
                                    <th className="px-2 py-1.5 border-r border-border w-20 text-end">{isRTL ? 'الضريبة' : 'Tax Amt'}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-28 text-end">{t('qform.amount')} (AED)</th>
                                    <th className="px-2 py-1.5 text-center w-10">{isRTL ? 'إجراء' : 'Action'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {formData.items.map((item, index) => (
                                    <tr key={index} className="hover:bg-hover transition-colors">
                                        <td className="px-2 py-1 border-r border-border text-center text-foreground-muted">{index + 1}</td>
                                        <td className="px-2 py-1 border-r border-border">
                                            <select
                                                name="categoryId"
                                                value={item.categoryId || ''}
                                                onChange={(e) => handleItemChange(index, e)}
                                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary"
                                            >
                                                <option value="">{t('qform.selectCategory')}</option>
                                                {selectData.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-2 py-1 border-r border-border">
                                            <select
                                                name="subcategoryId"
                                                value={item.subcategoryId || ''}
                                                onChange={(e) => handleItemChange(index, e)}
                                                disabled={!item.categoryId}
                                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary disabled:opacity-50"
                                            >
                                                <option value="">{t('qform.selectSubcategory')}</option>
                                                {(item.availableSubcategories || []).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-2 py-1 border-r border-border relative">
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    name="searchInput"
                                                    value={item.searchInput || ''}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    placeholder={t('qform.typeToSearch')}
                                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 pr-5 text-foreground focus:outline-none focus:border-primary"
                                                    autoComplete="off"
                                                />
                                                <ChevronDown size={11} className="absolute right-1 top-2 text-foreground-muted pointer-events-none" />

                                                <div className="absolute left-0 right-0 top-full z-[100] bg-card border border-border rounded-md mt-0.5 shadow-xl hidden group-focus-within:block max-h-48 overflow-y-auto">
                                                    {selectData.allItems
                                                        .filter(i => {
                                                            const searchParam = (item.searchInput || '').toLowerCase();
                                                            const matchSearch = (i.label || i.name || '').toLowerCase().includes(searchParam);
                                                            const iCatId = i.categoryId || i.category?.id;
                                                            const iSubCatId = i.subcategoryId || i.subCategoryId || i.subCategory?.id || i.subcategory?.id;
                                                            const matchCat = item.categoryId ? String(iCatId) === String(item.categoryId) : true;
                                                            const matchSubCat = item.subcategoryId ? String(iSubCatId) === String(item.subcategoryId) : true;
                                                            return matchSearch && matchCat && matchSubCat;
                                                        })
                                                        .map(itm => (
                                                            <div
                                                                key={`${itm.uniqueId}-${index}`}
                                                                className="px-2 py-1.5 text-[11px] hover:bg-primary/10 cursor-pointer border-b last:border-b-0 border-border flex justify-between items-center text-foreground"
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    handleItemChange(index, { target: { name: 'searchInput', value: itm.label || itm.name } });
                                                                }}
                                                            >
                                                                <span className="font-medium">{itm.name}</span>
                                                                <span className="text-[9px] text-foreground-muted bg-background px-1 py-0.5 rounded border border-border shrink-0 ml-1">
                                                                    {(itm.type || 'ITEM').replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    {selectData.allItems.filter(i => {
                                                        const searchParam = (item.searchInput || '').toLowerCase();
                                                        const matchSearch = (i.label || i.name || '').toLowerCase().includes(searchParam);
                                                        const iCatId = i.categoryId || i.category?.id;
                                                        const iSubCatId = i.subcategoryId || i.subCategoryId || i.subCategory?.id || i.subcategory?.id;
                                                        const matchCat = item.categoryId ? String(iCatId) === String(item.categoryId) : true;
                                                        const matchSubCat = item.subcategoryId ? String(iSubCatId) === String(item.subcategoryId) : true;
                                                        return matchSearch && matchCat && matchSubCat;
                                                    }).length === 0 && (
                                                        <div className="px-2 py-2 text-[11px] text-foreground-muted text-center">
                                                            {isRTL ? 'لا توجد نتائج' : 'No items found'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1 border-r border-border">
                                            <input
                                                type="number"
                                                name="sendQuantity"
                                                value={item.sendQuantity}
                                                onChange={(e) => handleItemChange(index, e)}
                                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-center font-mono text-foreground focus:outline-none focus:border-primary"
                                            />
                                        </td>
                                        <td className="px-2 py-1 border-r border-border">
                                            <input
                                                type="number"
                                                name="invoiceQuantity"
                                                value={item.invoiceQuantity}
                                                onChange={(e) => handleItemChange(index, e)}
                                                min="1"
                                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-center font-mono text-foreground focus:outline-none focus:border-primary"
                                            />
                                        </td>
                                        <td className="px-2 py-1 border-r border-border">
                                            <input
                                                type="number"
                                                name="rate"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(index, e)}
                                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-end font-mono text-foreground focus:outline-none focus:border-primary"
                                            />
                                        </td>
                                        <td className="px-2 py-1 border-r border-border text-end font-mono text-foreground-muted">
                                            AED {Number(item.taxValue || 0).toFixed(2)}
                                        </td>
                                        <td className="px-2 py-1 border-r border-border text-end font-mono font-semibold text-foreground">
                                            AED {Number(item.amount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="w-5 h-5 rounded border border-border flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors mx-auto"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        type="button"
                        onClick={addItem}
                        className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                        <Plus size={12} /> {t('qform.addItem')}
                    </button>
                </div>

                {/* Bottom Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.attachFile')}</label>
                            <div className="flex items-center gap-2">
                                <label className="cursor-pointer px-2.5 py-1 border border-border bg-background hover:bg-hover text-foreground rounded text-[11px] font-medium flex items-center gap-1 transition-colors">
                                    <Paperclip size={12} /> {t('qform.browse')}
                                    <input type="file" multiple onChange={handleFileChange} className="hidden" />
                                </label>
                                <span className="text-[10px] text-foreground-muted">
                                    {attachmentFiles.length > 0 ? `${attachmentFiles.length} file(s)` : t('qform.noFile')}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.terms')}</label>
                            <textarea
                                name="termsAndConditions"
                                value={formData.termsAndConditions}
                                onChange={handleHeaderChange}
                                rows="2"
                                className="w-full text-[11px] border border-border bg-background rounded p-1.5 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                                placeholder="Terms & Conditions..."
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.notes')}</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleHeaderChange}
                                rows="2"
                                className="w-full text-[11px] border border-border bg-background rounded p-1.5 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                                placeholder="Will be displayed on invoice"
                            ></textarea>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-1.5 text-[11px] self-start">
                        <div className="flex justify-between text-foreground-muted">
                            <span>{t('qform.subTotal')}</span>
                            <span className="font-mono text-foreground font-semibold">AED {Number(formData.subTotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-foreground-muted">
                            <span>{t('qform.totalDiscount')}</span>
                            <input
                                type="number"
                                name="totalDiscount"
                                value={formData.totalDiscount}
                                onChange={handleHeaderChange}
                                className="w-20 h-6 text-[10px] border border-border bg-background rounded px-1 text-end font-mono text-foreground focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div className="flex justify-between text-foreground-muted">
                            <span>{t('qform.totalTax')}</span>
                            <span className="font-mono text-foreground">AED {Number(formData.totalTax || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-foreground-muted">
                            <span>{isRTL ? 'رسوم أخرى' : 'Other Charges'}</span>
                            <input
                                type="number"
                                name="otherCharges"
                                value={formData.otherCharges}
                                onChange={handleHeaderChange}
                                className="w-20 h-6 text-[10px] border border-border bg-background rounded px-1 text-end font-mono text-foreground focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div className="flex justify-between font-bold border-t border-border pt-1 text-xs text-foreground">
                            <span>{t('qform.netTotal')}</span>
                            <span className="text-primary font-mono">AED {Number(formData.netTotal || 0).toFixed(2)}</span>
                        </div>

                        <div className="bg-primary/5 p-2 rounded border border-border space-y-1 mt-2">
                            <div className="flex justify-between text-[11px] text-foreground-muted">
                                <span>{isRTL ? 'المبلغ المستلم' : 'Amount Received'}</span>
                                <input
                                    type="number"
                                    name="amountReceived"
                                    value={formData.amountReceived}
                                    onChange={handleHeaderChange}
                                    className="w-20 h-5 text-[10px] border border-border bg-background rounded px-1 text-end font-mono text-foreground focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-rose-500 pt-0.5 border-t border-border">
                                <span>{isRTL ? 'الرصيد المستحق' : 'Balance Due'}</span>
                                <span className="font-mono">AED {Number(formData.balanceDue || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Record Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-card rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-border">
                        <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-white font-bold text-lg">💰 Record Customer Payment</h2>
                            <button onClick={() => setShowPaymentModal(false)} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm text-foreground">
                                <div className="flex justify-between"><span>Invoice Total</span><span className="font-bold font-mono">AED {Number(formData.netTotal).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Already Received</span><span className="font-bold font-mono">AED {Number(formData.amountReceived).toFixed(2)}</span></div>
                                <div className="flex justify-between border-t border-border mt-2 pt-2"><span className="font-bold">Balance Due</span><span className="font-bold font-mono text-rose-500">AED {Number(formData.balanceDue).toFixed(2)}</span></div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-foreground mb-1">Amount Received *</label>
                                <input type="number" step="0.01" min="0.01" value={paymentForm.amountPaid}
                                    onChange={e => setPaymentForm(p => ({ ...p, amountPaid: e.target.value }))}
                                    required className="w-full border border-border bg-background rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="Enter amount received" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">Payment Date *</label>
                                    <input type="date" value={paymentForm.paymentDate}
                                        onChange={e => setPaymentForm(p => ({ ...p, paymentDate: e.target.value }))}
                                        required className="w-full border border-border bg-background rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">Payment Method *</label>
                                    <select value={paymentForm.paymentMethod}
                                        onChange={e => setPaymentForm(p => ({ ...p, paymentMethod: e.target.value }))}
                                        className="w-full border border-border bg-background rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                                        <option value="BANK">Bank Transfer</option>
                                        <option value="CASH">Cash</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-foreground mb-1">Reference / Cheque No.</label>
                                <input type="text" value={paymentForm.referenceNumber}
                                    onChange={e => setPaymentForm(p => ({ ...p, referenceNumber: e.target.value }))}
                                    className="w-full border border-border bg-background rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="Optional" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-4 py-2 border border-border rounded text-sm font-medium hover:bg-hover text-foreground">Cancel</button>
                                <button type="submit" disabled={paymentLoading}
                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700 flex items-center justify-center gap-2">
                                    {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    Post Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceForm;
