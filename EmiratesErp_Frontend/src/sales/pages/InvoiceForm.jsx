import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Paperclip, ChevronDown, Upload } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const InvoiceForm = () => {
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
            console.error("Failed to fetch dependencies", err);
            setError("Failed to load data.");
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

    if (loading && !formData.customerId) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>;

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            <header className="bg-white shadow-sm p-4 border-b flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/sales-dashboard/invoices')} className="p-2 rounded-full hover:bg-slate-100"><ArrowLeft className="h-5 w-5 text-slate-600" /></button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Sales Invoice' : 'New Sales Invoice'}</h1>
                        {isEditing && formData.status && (
                            <span className={`inline-block mt-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                                formData.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                formData.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700' :
                                formData.status === 'INVOICED' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-500'
                            }`}>{formData.status.replace('_', ' ')}</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isEditing && (formData.status === 'INVOICED' || formData.status === 'PARTIALLY_PAID') && (
                        <button type="button" onClick={() => { setPaymentForm(p => ({ ...p, amountPaid: formData.balanceDue || '' })); setShowPaymentModal(true); }}
                            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center gap-2 font-medium text-sm shadow-sm">
                            💰 Record Payment
                        </button>
                    )}
                    <button type="button" onClick={() => navigate('/sales-dashboard/invoices')} className="px-4 py-2 border rounded hover:bg-slate-50 text-sm font-medium">Cancel</button>
                    <button type="submit" form="inv-form" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 font-medium text-sm shadow-sm">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isEditing ? 'Update Invoice' : 'Save Invoice'}
                    </button>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto p-6">
                <form id="inv-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Header Details */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Ledger</label>
                                    <select name="invoiceLedger" value={formData.invoiceLedger} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded px-2 py-2 text-sm bg-slate-50">
                                        <option value="Sales">Sales</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                                    <select name="customerId" value={formData.customerId} onChange={handleHeaderChange} required className="w-full border border-slate-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-blue-500">
                                        <option value="">Select Customer</option>
                                        {selectData.customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Billing Address</label>
                                        <textarea readOnly value={billingAddress} rows="3" className="w-full border border-gray-200 rounded px-2 py-2 text-xs bg-gray-50 text-slate-500 resize-none"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Shipping Address</label>
                                        <textarea readOnly value={shippingAddress} rows="3" className="w-full border border-gray-200 rounded px-2 py-2 text-xs bg-gray-50 text-slate-500 resize-none"></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Number</label>
                                        <input type="text" value={formData.invoiceNumber || 'Auto-generated'} readOnly className="w-full border border-gray-200 rounded px-2 py-2 text-sm bg-gray-50 text-slate-400" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Date *</label>
                                        <input type="date" name="invoiceDate" value={formData.invoiceDate} onChange={handleHeaderChange} required className="w-full border border-slate-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                                        <input type="date" name="dueDate" value={formData.dueDate} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Date Of Supply</label>
                                        <input type="date" name="dateOfSupply" value={formData.dateOfSupply} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Salesperson</label>
                                    <select name="salespersonId" value={formData.salespersonId} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-blue-500">
                                        <option value="">Select Salesperson</option>
                                        {selectData.employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Customer PO No</label>
                                        <input type="text" name="customerPoNo" value={formData.customerPoNo} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Customer PO Date</label>
                                        <input type="date" name="customerPoDate" value={formData.customerPoDate} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Order Number</label>
                                        <input type="text" name="orderNumber" value={formData.orderNumber} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Reference</label>
                                        <input type="text" name="reference" value={formData.reference} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Sale Type</label>
                                        <select name="saleType" value={formData.saleType} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-blue-500">
                                            <option value="Local">Local</option>
                                            <option value="Export">Export</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                                        <select name="status" value={formData.status} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-blue-500">
                                            <option value="DRAFT">Draft</option>
                                            <option value="INVOICED">Invoiced (Post to Accounting)</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                            <input type="checkbox" name="enableGrossNetWeight" checked={formData.enableGrossNetWeight} onChange={handleHeaderChange} className="rounded text-blue-600 focus:ring-blue-500" id="grossNetCheck" />
                            <label htmlFor="grossNetCheck" className="text-sm text-slate-700 cursor-pointer select-none">Enable Gross Weight and Net Weight columns?</label>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
                        <table className="w-full text-sm min-w-[1200px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-left">
                                    <th className="p-3 font-semibold text-slate-700 w-64">Item Details</th>
                                    {formData.enableGrossNetWeight && <th className="p-3 font-semibold text-slate-700 w-24">Gross Qty</th>}
                                    {formData.enableGrossNetWeight && <th className="p-3 font-semibold text-slate-700 w-24">Net Qty</th>}
                                    <th className="p-3 font-semibold text-slate-700 w-24">Send Qty</th>
                                    <th className="p-3 font-semibold text-slate-700 w-24">Inv Qty</th>
                                    <th className="p-3 font-semibold text-slate-700 w-32">Rate</th>
                                    <th className="p-3 font-semibold text-slate-700 w-32">Amount</th>
                                    <th className="p-3 font-semibold text-slate-700 w-32">Tax</th>
                                    <th className="p-3 font-semibold text-slate-700 w-24">Packing</th>
                                    <th className="p-3 font-semibold text-slate-700 w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.items.map((item, index) => (
                                    <tr key={index} className="border-b border-slate-100 align-top">
                                        <td className="p-3 space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <select name="categoryId" value={item.categoryId} onChange={(e) => handleItemChange(index, e)} className="border border-slate-300 rounded px-2 py-1.5 w-full text-xs">
                                                    <option value="">Category</option>
                                                    {selectData.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                                <select name="subcategoryId" value={item.subcategoryId} onChange={(e) => handleItemChange(index, e)} disabled={!item.categoryId} className="border border-slate-300 rounded px-2 py-1.5 w-full text-xs">
                                                    <option value="">Sub Category</option>
                                                    {item.availableSubcategories?.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="relative group w-full">
                                                <input
                                                    type="text"
                                                    name="searchInput"
                                                    value={item.searchInput || ''}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    placeholder="Search Item..."
                                                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                                                    autoComplete="off"
                                                />
                                                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg hidden group-focus-within:block max-h-60 overflow-y-auto">
                                                    {selectData.allItems
                                                        .filter(i => {
                                                            const searchParam = (item.searchInput || '').toLowerCase();
                                                            const matchSearch = (i.label || '').toLowerCase().includes(searchParam);

                                                            const iCatId = i.categoryId || i.category?.id;
                                                            const iSubCatId = i.subcategoryId || i.subCategoryId || i.subCategory?.id || i.subcategory?.id;

                                                            const matchCat = item.categoryId ? String(iCatId) === String(item.categoryId) : true;
                                                            const matchSubCat = item.subcategoryId ? String(iSubCatId) === String(item.subcategoryId) : true;

                                                            return matchSearch && matchCat && matchSubCat;
                                                        })
                                                        .map(itm => (
                                                            <div
                                                                key={`${itm.uniqueId}-${index}`}
                                                                className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b last:border-b-0 border-gray-100 flex justify-between items-center text-gray-700"
                                                                onMouseDown={() => {
                                                                    const event = { target: { name: 'searchInput', value: itm.label } };
                                                                    handleItemChange(index, event);
                                                                }}
                                                            >
                                                                <span>{itm.name}</span>
                                                                <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{itm.type.replace('_', ' ')}</span>
                                                            </div>
                                                        ))}
                                                    {selectData.allItems.filter(i => {
                                                        const searchParam = (item.searchInput || '').toLowerCase();
                                                        const matchSearch = (i.label || '').toLowerCase().includes(searchParam);

                                                        const iCatId = i.categoryId || i.category?.id;
                                                        const iSubCatId = i.subcategoryId || i.subCategoryId || i.subCategory?.id || i.subcategory?.id;

                                                        const matchCat = item.categoryId ? String(iCatId) === String(item.categoryId) : true;
                                                        const matchSubCat = item.subcategoryId ? String(iSubCatId) === String(item.subcategoryId) : true;

                                                        return matchSearch && matchCat && matchSubCat;
                                                    }).length === 0 && (
                                                            <div className="px-3 py-2 text-sm text-gray-500 text-center">No items found</div>
                                                        )}
                                                </div>
                                            </div>
                                            <textarea name="description" value={item.description} onChange={(e) => handleItemChange(index, e)} rows="1" className="border border-slate-300 rounded px-2 py-1.5 w-full text-xs" placeholder="Description"></textarea>
                                        </td>
                                        {formData.enableGrossNetWeight && (
                                            <td className="p-3"><input type="number" name="quantityGross" value={item.quantityGross} onChange={(e) => handleItemChange(index, e)} className="border border-slate-300 rounded px-2 py-1.5 w-full text-sm" /></td>
                                        )}
                                        {formData.enableGrossNetWeight && (
                                            <td className="p-3"><input type="number" name="quantityNet" value={item.quantityNet} onChange={(e) => handleItemChange(index, e)} className="border border-slate-300 rounded px-2 py-1.5 w-full text-sm" /></td>
                                        )}
                                        <td className="p-3"><input type="number" name="sendQuantity" value={item.sendQuantity} onChange={(e) => handleItemChange(index, e)} className="border border-slate-300 rounded px-2 py-1.5 w-full text-sm" /></td>
                                        <td className="p-3"><input type="number" name="invoiceQuantity" value={item.invoiceQuantity} onChange={(e) => handleItemChange(index, e)} className="border border-slate-300 rounded px-2 py-1.5 w-full text-sm" min="1" /></td>
                                        <td className="p-3"><input type="number" name="rate" value={item.rate} onChange={(e) => handleItemChange(index, e)} className="border border-slate-300 rounded px-2 py-1.5 w-full text-sm" /></td>
                                        <td className="p-3"><input type="number" value={item.amount.toFixed(2)} readOnly className="border border-slate-200 rounded px-2 py-1.5 w-full text-sm bg-slate-50" /></td>
                                        <td className="p-3 space-y-1">
                                            <input type="number" value={item.taxValue.toFixed(2)} readOnly className="border border-slate-200 rounded px-2 py-1.5 w-full text-xs bg-slate-50" />
                                            <div className="flex items-center gap-1">
                                                <input type="checkbox" name="isTaxExempt" checked={item.isTaxExempt} onChange={(e) => handleItemChange(index, e)} className="rounded text-blue-600 focus:ring-blue-500" />
                                                <span className="text-[10px] text-slate-500 whitespace-nowrap">Exempt</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <input type="number" name="taxPercentage" value={item.taxPercentage || 0} onChange={(e) => handleItemChange(index, e)} className="border border-slate-300 rounded px-1 py-0.5 w-10 text-[10px]" disabled={item.isTaxExempt} />
                                                <span className="text-[10px] text-slate-500">%</span>
                                            </div>
                                        </td>
                                        <td className="p-3"><input type="text" name="packingType" value={item.packingType} onChange={(e) => handleItemChange(index, e)} className="border border-slate-300 rounded px-2 py-1.5 w-full text-sm" /></td>
                                        <td className="p-3 text-center">
                                            <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button type="button" onClick={addItem} className="mt-4 px-4 py-2 bg-slate-100 text-blue-600 font-medium text-sm rounded hover:bg-slate-200 flex items-center gap-2">
                            <Plus size={16} /> Add Item
                        </button>
                    </div>

                    {/* Totals & Footer */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                            <div className="w-full md:w-1/2 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Terms & Conditions</label>
                                    <textarea name="termsAndConditions" value={formData.termsAndConditions} onChange={handleHeaderChange} rows="3" className="w-full border border-slate-300 rounded px-2 py-2 text-sm" placeholder="Terms..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                                    <textarea name="notes" value={formData.notes} onChange={handleHeaderChange} rows="2" className="w-full border border-slate-300 rounded px-2 py-2 text-sm" placeholder="Notes..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Attachments</label>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-sm text-slate-700 flex items-center gap-2 border border-slate-300">
                                            <Paperclip size={14} /> Attach Files <input type="file" multiple onChange={handleFileChange} className="hidden" />
                                        </label>
                                        <span className="text-xs text-slate-400">{attachmentFiles.length} selected</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-1/3 space-y-3">
                                <div className="flex justify-between text-sm py-1 border-b border-dashed border-slate-200">
                                    <span className="text-slate-600">Sub Total</span>
                                    <span className="font-medium">AED {formData.subTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm py-1 border-b border-dashed border-slate-200 items-center">
                                    <span className="text-slate-600">Total Discount</span>
                                    <input type="number" name="totalDiscount" value={formData.totalDiscount} onChange={handleHeaderChange} className="w-24 text-right border border-slate-300 rounded px-1 py-1 text-sm" />
                                </div>
                                <div className="flex justify-between text-sm py-1 border-b border-dashed border-slate-200">
                                    <span className="text-slate-600">Gross Total</span>
                                    <span className="font-medium">AED {formData.grossTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm py-1 border-b border-dashed border-slate-200">
                                    <span className="text-slate-600">Total Tax</span>
                                    <span className="font-medium">AED {formData.totalTax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm py-1 border-b border-dashed border-slate-200 items-center">
                                    <span className="text-slate-600">Other Charges</span>
                                    <input type="number" name="otherCharges" value={formData.otherCharges} onChange={handleHeaderChange} className="w-24 text-right border border-slate-300 rounded px-1 py-1 text-sm" />
                                </div>
                                <div className="flex justify-between text-lg font-bold py-2 border-t border-slate-300">
                                    <span>Net Total</span>
                                    <span>AED {formData.netTotal.toFixed(2)}</span>
                                </div>

                                <div className="bg-slate-50 p-3 rounded border border-slate-100 mt-4">
                                    <div className="flex justify-between text-sm items-center mb-2">
                                        <span className="font-semibold text-slate-700">Amount Received</span>
                                        <input type="number" name="amountReceived" value={formData.amountReceived} onChange={handleHeaderChange} className="w-24 text-right border border-slate-300 rounded px-1 py-1 text-sm bg-white" />
                                    </div>
                                    <div className="flex justify-between text-base font-bold text-red-600 border-t border-slate-200 pt-2">
                                        <span>Balance Due</span>
                                        <span>AED {formData.balanceDue?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </main>

            {/* Record Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-white font-bold text-lg">💰 Record Customer Payment</h2>
                            <button onClick={() => setShowPaymentModal(false)} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800">
                                <div className="flex justify-between"><span>Invoice Total</span><span className="font-bold">AED {Number(formData.netTotal).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Already Received</span><span className="font-bold">AED {Number(formData.amountReceived).toFixed(2)}</span></div>
                                <div className="flex justify-between border-t border-emerald-200 mt-2 pt-2"><span className="font-bold">Balance Due</span><span className="font-bold text-red-600">AED {Number(formData.balanceDue).toFixed(2)}</span></div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Amount Received *</label>
                                <input type="number" step="0.01" min="0.01" value={paymentForm.amountPaid}
                                    onChange={e => setPaymentForm(p => ({ ...p, amountPaid: e.target.value }))}
                                    required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" placeholder="Enter amount received" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date *</label>
                                    <input type="date" value={paymentForm.paymentDate}
                                        onChange={e => setPaymentForm(p => ({ ...p, paymentDate: e.target.value }))}
                                        required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method *</label>
                                    <select value={paymentForm.paymentMethod}
                                        onChange={e => setPaymentForm(p => ({ ...p, paymentMethod: e.target.value }))}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                                        <option value="BANK">Bank Transfer</option>
                                        <option value="CASH">Cash</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Reference / Cheque No.</label>
                                <input type="text" value={paymentForm.referenceNumber}
                                    onChange={e => setPaymentForm(p => ({ ...p, referenceNumber: e.target.value }))}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" placeholder="Optional" />
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded p-3 text-xs text-blue-700">
                                <strong>Accounting Effect:</strong><br />
                                Dr. Bank / Cash Account<br />
                                &nbsp;&nbsp;&nbsp;Cr. Trade &amp; Other Receivables (Customer)
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded text-sm font-medium hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={paymentLoading}
                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700 flex items-center justify-center gap-2">
                                    {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    Post Payment to Accounting
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
