import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, Save, Upload, Loader2, Paperclip } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ProformaInvoiceForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isRTL, t } = useLanguage();
    const [searchParams] = useSearchParams();
    const quotationId = searchParams.get('quotationId');
    const salesOrderId = searchParams.get('salesOrderId');
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectData, setSelectData] = useState({ allItems: [], subCategoryCache: {} });
    const [error, setError] = useState(null);

    // Items state
    const [items, setItems] = useState([
        {
            crmProductId: '', itemCode: '', itemName: '', description: '',
            categoryId: '', subcategoryId: '', availableSubcategories: [],
            quantity: 1, rate: 0, amount: 0,
            taxPercentage: 0, taxValue: 0, isTaxExempt: false
        }
    ]);

    // Attachments
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);

    const [formData, setFormData] = useState({
        invoiceLedger: 'Sales',
        invoiceDate: new Date().toISOString().split('T')[0],
        customerId: '',
        invoiceNumber: '', // Backend generates, but might be shown if editing
        reference: '', // Order Number in screenshot?
        dueDate: '',
        dateOfSupply: '',
        salespersonId: '',
        poNumber: '',

        subTotal: 0,
        totalDiscount: 0,
        grossTotal: 0,
        totalTax: 0,
        otherCharges: 0,
        netTotal: 0,

        termsAndConditions: '',
        notes: '',
        bankDetails: '',
        template: 'Standard',
        emailTo: '',
        status: 'DRAFT'
    });

    // Address state (display only based on customer selection)
    const [billingAddress, setBillingAddress] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');

    useEffect(() => {
        const loadDependencies = async () => {
            setFetchingData(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [custRes, prodRes, rmRes, sfRes, fgRes, empRes, catRes] = await Promise.all([
                    axios.get(`${API_URL}/parties`, { headers }),
                    axios.get(`${API_URL}/crm/sales-products`, { headers, params: { size: 1000 } }),
                    axios.get(`${API_URL}/production/raw-materials`, { headers, params: { size: 1000 } }),
                    axios.get(`${API_URL}/production/semi-finished`, { headers, params: { size: 1000 } }),
                    axios.get(`${API_URL}/production/finished-goods`, { headers, params: { size: 1000 } }),
                    axios.get(`${API_URL}/employees/all`, { headers }),
                    axios.get(`${API_URL}/production/categories`, { headers })
                ]);

                setCustomers(custRes.data.content || custRes.data || []);
                setEmployees(empRes.data || []);
                setCategories(catRes.data || []);

                const getList = (res) => Array.isArray(res.data) ? res.data : (res.data.content || []);

                const products = getList(prodRes).map(p => ({ ...p, type: 'PRODUCT', uniqueId: `PRODUCT-${p.id}`, label: `${p.name} (${p.itemCode}) - Product` }));
                const rawMaterials = getList(rmRes).map(r => ({ ...r, type: 'RAW_MATERIAL', uniqueId: `RM-${r.id}`, salesPrice: r.salesPrice || 0, label: `${r.name} (${r.itemCode}) - Raw Material` }));
                const semiFinished = getList(sfRes).map(s => ({ ...s, type: 'SEMI_FINISHED', uniqueId: `SF-${s.id}`, salesPrice: s.salesPrice || 0, label: `${s.name} (${s.itemCode}) - Semi-Finished` }));
                const finishedGoods = getList(fgRes).map(f => ({ ...f, type: 'FINISHED_GOOD', uniqueId: `FG-${f.id}`, salesPrice: f.salesPrice || 0, label: `${f.name} (${f.itemCode}) - Finished Good` }));

                const compiledItems = [...products, ...rawMaterials, ...semiFinished, ...finishedGoods];

                setSelectData(prev => ({ ...prev, allItems: compiledItems }));

                if (isEditMode) {
                    const res = await axios.get(`${API_URL}/sales/proforma-invoices/${id}`, { headers });
                    const data = res.data;

                    setFormData({
                        ...data,
                        invoiceLedger: data.invoiceLedger || 'Sales',
                        invoiceDate: data.invoiceDate ? new Date(data.invoiceDate).toISOString().split('T')[0] : '',
                        customerId: data.customerId || '',
                        reference: data.reference || '',
                        dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
                        dateOfSupply: data.dateOfSupply ? new Date(data.dateOfSupply).toISOString().split('T')[0] : '',
                        salespersonId: data.salespersonId || '',
                        poNumber: data.poNumber || '',
                        termsAndConditions: data.termsAndConditions || '',
                        notes: data.notes || '',
                        bankDetails: data.bankDetails || '',
                        template: data.template || 'Standard',
                        emailTo: data.emailTo || '',
                        status: data.status || 'DRAFT'
                    });

                    // Set addresses
                    const cust = (custRes.data.content || custRes.data || []).find(c => c.id === data.customerId);
                    if (cust) {
                        setBillingAddress(formatAddress(cust.billingAddress));
                        setShippingAddress(formatAddress(cust.shippingAddress));
                    }

                    let subCategoryMap = {};
                    if (data.items && data.items.length > 0) {
                        const mappedItems = await Promise.all(data.items.map(async (item) => {
                            let availableSubcategories = [];
                            if (item.categoryId) {
                                if (!subCategoryMap[item.categoryId]) {
                                    try {
                                        const subRes = await axios.get(`${API_URL}/production/sub-categories?categoryId=${item.categoryId}`, { headers });
                                        subCategoryMap[item.categoryId] = subRes.data || [];
                                    } catch (e) { console.error("Failed to load subcats", e); }
                                }
                                availableSubcategories = subCategoryMap[item.categoryId] || [];
                            }

                            let uniqueId = '';
                            if (item.crmProductId) uniqueId = `PRODUCT-${item.crmProductId}`;
                            else if (item.rawMaterialId) uniqueId = `RM-${item.rawMaterialId}`;
                            else if (item.semiFinishedId) uniqueId = `SF-${item.semiFinishedId}`;
                            else if (item.finishedGoodId) uniqueId = `FG-${item.finishedGoodId}`;

                            return {
                                ...item,
                                itemId: uniqueId,
                                searchInput: item.itemName || '',
                                isDropdownOpen: false,
                                crmProductId: item.crmProductId || '',
                                categoryId: item.categoryId || '',
                                subcategoryId: item.subcategoryId || '',
                                availableSubcategories,
                                isTaxExempt: item.isTaxExempt || false
                            };
                        }));
                        setItems(mappedItems);
                        setSelectData(prev => ({ ...prev, subCategoryCache: { ...prev.subCategoryCache, ...subCategoryMap } }));
                    } else {
                        setItems([]);
                    }
                    setExistingAttachments(data.attachments || []);
                    setExistingAttachments(data.attachments || []);
                } else if (quotationId) {
                    // Populate from Quotation
                    const quotRes = await axios.get(`${API_URL}/sales/quotations/${quotationId}`, { headers });
                    const data = quotRes.data;

                    setFormData(prev => ({
                        ...prev,
                        customerId: data.customerId || '',
                        poNumber: '',
                        reference: data.quotationNumber, // Use Qtn No as reference
                        salespersonId: data.salespersonId || '',
                        termsAndConditions: data.termsAndConditions || '',
                        notes: data.notes || '',
                        totalDiscount: data.totalDiscount || 0,
                        otherCharges: data.otherCharges || 0
                    }));

                    // Set addresses
                    const cust = (custRes.data.content || custRes.data || []).find(c => c.id === data.customerId);
                    if (cust) {
                        setBillingAddress(formatAddress(cust.billingAddress));
                        setShippingAddress(formatAddress(cust.shippingAddress));
                    }

                    if (data.items) {
                        const mappedItems = data.items.map(item => ({
                            crmProductId: item.crmProductId || '',
                            itemCode: item.itemCode || '',
                            itemName: item.itemName || '',
                            description: item.description || '',
                            categoryId: item.categoryId || '',
                            subcategoryId: item.subcategoryId || '',
                            availableSubcategories: [],
                            quantity: item.quantity || 1,
                            rate: item.rate || 0,
                            amount: item.amount || 0,
                            taxPercentage: item.taxPercentage || 0,
                            taxValue: item.taxValue || 0,
                            isTaxExempt: item.isTaxExempt || false
                        }));
                        setItems(mappedItems);
                    }
                } else if (salesOrderId) {
                    // Populate from Sales Order
                    const orderRes = await axios.get(`${API_URL}/sales/orders/${salesOrderId}`, { headers });
                    const data = orderRes.data;

                    setFormData(prev => ({
                        ...prev,
                        customerId: data.customerId || '',
                        poNumber: data.poNumber || '', // Check if SO has PO number
                        reference: data.salesOrderNumber, // Use SO No as reference
                        salespersonId: data.salespersonId || '',
                        termsAndConditions: data.termsAndConditions || '',
                        notes: data.notes || '',
                        totalDiscount: data.totalDiscount || 0,
                        otherCharges: data.otherCharges || 0
                    }));

                    // Set addresses
                    const cust = (custRes.data.content || custRes.data || []).find(c => c.id === data.customerId);
                    if (cust) {
                        setBillingAddress(formatAddress(cust.billingAddress));
                        setShippingAddress(formatAddress(cust.shippingAddress));
                    }

                    if (data.items) {
                        const mappedItems = data.items.map(item => ({
                            crmProductId: item.crmProductId || '',
                            itemCode: item.itemCode || '',
                            itemName: item.itemName || '',
                            description: item.description || '',
                            categoryId: item.categoryId || '',
                            subcategoryId: item.subcategoryId || '',
                            availableSubcategories: [],
                            quantity: item.quantity || 1,
                            rate: item.rate || 0,
                            amount: item.amount || 0,
                            taxPercentage: item.taxPercentage || 0,
                            taxValue: item.taxValue || 0,
                            isTaxExempt: item.isTaxExempt || false
                        }));
                        setItems(mappedItems);
                    }
                }
            } catch (err) {
                console.error("Failed to load data", err);
                setError("Failed to load initial data");
            } finally {
                setFetchingData(false);
            }
        };
        loadDependencies();
    }, [id, isEditMode, quotationId, salesOrderId]);

    const formatAddress = (addr) => {
        if (!addr) return '';
        if (typeof addr === 'string') return addr;
        return [addr.addressLine, addr.city, addr.country].filter(Boolean).join(', ');
    };

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'customerId') {
            const cust = customers.find(c => c.id.toString() === value);
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
        const newItems = [...items];

        if (name === 'searchInput') {
            const selectedItem = selectData.allItems.find(item => item.label === value);
            newItems[index].searchInput = value;

            newItems[index].crmProductId = null;
            newItems[index].rawMaterialId = null;
            newItems[index].semiFinishedId = null;
            newItems[index].finishedGoodId = null;
            newItems[index].itemId = '';

            if (selectedItem) {
                newItems[index].itemId = selectedItem.uniqueId;
                newItems[index].itemName = selectedItem.name;
                newItems[index].itemCode = selectedItem.itemCode;
                newItems[index].rate = selectedItem.salesPrice;
                newItems[index].description = selectedItem.description || '';
                newItems[index].taxPercentage = selectedItem.taxRate || 0; // Use product tax rate if any? DTO usually uses manual

                if (selectedItem.type === 'PRODUCT') newItems[index].crmProductId = selectedItem.id;
                else if (selectedItem.type === 'RAW_MATERIAL') newItems[index].rawMaterialId = selectedItem.id;
                else if (selectedItem.type === 'SEMI_FINISHED') newItems[index].semiFinishedId = selectedItem.id;
                else if (selectedItem.type === 'FINISHED_GOOD') newItems[index].finishedGoodId = selectedItem.id;
            }
        } else if (name === 'categoryId') {
            newItems[index].categoryId = value;
            newItems[index].subcategoryId = '';

            if (value) {
                if (selectData.subCategoryCache && selectData.subCategoryCache[value]) {
                    newItems[index].availableSubcategories = selectData.subCategoryCache[value];
                    setItems([...newItems]);
                } else {
                    newItems[index].availableSubcategories = [];
                    setItems([...newItems]);

                    const token = `Bearer ${localStorage.getItem('token')}`;
                    axios.get(`${API_URL}/production/sub-categories?categoryId=${value}`, { headers: { Authorization: token } })
                        .then(res => {
                            const fetchedSubCats = res.data || [];
                            setSelectData(prev => ({
                                ...prev,
                                subCategoryCache: { ...prev.subCategoryCache, [value]: fetchedSubCats }
                            }));
                            setItems(currentItems => {
                                const updatedItems = currentItems.map((it, i) => {
                                    if (i === index) {
                                        return { ...it, availableSubcategories: fetchedSubCats };
                                    }
                                    return it;
                                });
                                return updatedItems;
                            });
                        }).catch(err => console.error("Failed to fetch subcategories", err));
                    return; // exit early because we called setItems asynchronously
                }
            } else {
                newItems[index].availableSubcategories = [];
            }
        } else if (type === 'checkbox') {
            newItems[index][name] = checked;
        } else {
            newItems[index][name] = value;
        }

        // Recalculate row
        const qty = Number(newItems[index].quantity) || 0;
        const rate = Number(newItems[index].rate) || 0;
        const amount = qty * rate;
        newItems[index].amount = amount;

        let tax = 0;
        if (!newItems[index].isTaxExempt) {
            const taxPct = Number(newItems[index].taxPercentage) || 0;
            tax = (amount * taxPct) / 100;
            newItems[index].taxPercentage = taxPct;
        } else {
            newItems[index].taxPercentage = 0;
        }
        newItems[index].taxValue = tax;

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { searchInput: '', itemId: '', crmProductId: '', rawMaterialId: '', semiFinishedId: '', finishedGoodId: '', itemCode: '', itemName: '', description: '', categoryId: '', subcategoryId: '', availableSubcategories: [], quantity: 1, rate: 0, amount: 0, taxPercentage: 5, taxValue: 0, isTaxExempt: false, isDropdownOpen: false }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setAttachmentFiles([...attachmentFiles, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index) => {
        setAttachmentFiles(attachmentFiles.filter((_, i) => i !== index));
    };

    // Calculate totals
    useEffect(() => {
        let sub = 0;
        let tax = 0;
        items.forEach(item => {
            sub += Number(item.amount) || 0;
            tax += Number(item.taxValue) || 0;
        });

        const discount = Number(formData.totalDiscount) || 0;
        const other = Number(formData.otherCharges) || 0;
        const gross = sub - discount;
        const net = gross + tax + other;

        setFormData(prev => ({
            ...prev,
            subTotal: sub,
            totalTax: tax,
            grossTotal: gross,
            netTotal: net
        }));
    }, [items, formData.totalDiscount, formData.otherCharges]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const dataToSubmit = {
                ...formData,
                items: items.map(item => ({
                    crmProductId: item.crmProductId ? Number(item.crmProductId) : null,
                    rawMaterialId: item.rawMaterialId ? Number(item.rawMaterialId) : null,
                    semiFinishedId: item.semiFinishedId ? Number(item.semiFinishedId) : null,
                    finishedGoodId: item.finishedGoodId ? Number(item.finishedGoodId) : null,
                    itemCode: item.itemCode,
                    itemName: item.itemName,
                    description: item.description,
                    categoryId: item.categoryId ? Number(item.categoryId) : null,
                    subcategoryId: item.subcategoryId ? Number(item.subcategoryId) : null,
                    quantity: Number(item.quantity),
                    rate: Number(item.rate),
                    taxValue: Number(item.taxValue),
                    isTaxExempt: item.isTaxExempt,
                    taxPercentage: Number(item.taxPercentage)
                }))
            };

            const payload = new FormData();
            payload.append('proformaInvoice', new Blob([JSON.stringify(dataToSubmit)], { type: 'application/json' }));
            attachmentFiles.forEach(file => payload.append('files', file));

            const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };

            if (isEditMode) {
                await axios.put(`${API_URL}/sales/proforma-invoices/${id}`, payload, config);
            } else {
                await axios.post(`${API_URL}/sales/proforma-invoices`, payload, config);

                // Update Quotation status if created from Quotation
                if (quotationId) {
                    try {
                        await axios.patch(`${API_URL}/sales/quotations/${quotationId}/status`, null, {
                            params: {
                                status: 'PROFORMA_INVOICED'
                            },
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        console.log("Quotation status updated automatically");
                    } catch (statusErr) {
                        console.warn("Failed to update quotation status automatically", statusErr);
                    }
                }

                // Update Sales Order status if created from Sales Order
                if (salesOrderId) {
                    try {
                        await axios.patch(`${API_URL}/sales/orders/${salesOrderId}/status`, null, {
                            params: {
                                status: 'PROFORMA_INVOICED'
                            },
                            headers: { Authorization: `Bearer ${token}` }
                        });
                    } catch (statusErr) {
                        console.warn("Failed to update sales order status automatically", statusErr);
                    }
                }
            }
            navigate('/sales-dashboard/proforma-invoices');
        } catch (err) {
            console.error("Submit error", err);
            alert("Failed to save proforma invoice");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div className="space-y-2 bg-background min-h-screen text-foreground font-sans w-full p-2" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Action Bar matching QuotationForm.jsx */}
            <div className="flex justify-between items-center bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/sales-dashboard/proforma-invoices')}
                        className="p-1 rounded-md hover:bg-hover text-foreground-muted hover:text-foreground transition-colors"
                        title={isRTL ? 'رجوع' : 'Back'}
                    >
                        <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
                    </button>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">
                            {isEditMode ? (isRTL ? 'تعديل الفاتورة الأولية' : 'Edit Proforma Invoice') : (isRTL ? 'إنشاء فاتورة أولية' : 'Create Proforma Invoice')}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none mt-0.5">
                            {isRTL ? 'الرئيسية > المبيعات > الفواتير الأولية' : 'Home > Sales > Proforma Invoices'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => navigate('/sales-dashboard/proforma-invoices')}
                        className="px-2.5 py-1 border border-border bg-card hover:bg-hover text-foreground rounded text-[11px] font-semibold transition-colors"
                    >
                        {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded text-xs font-medium">
                    {error}
                </div>
            )}

            <form id="pf-form" onSubmit={handleSubmit} className="space-y-2">
                {/* Header Details Card matching QuotationForm */}
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'دفتر الفواتير *' : 'Invoice Ledgers *'}</label>
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
                                {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
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
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.salesperson')}</label>
                            <select
                                name="salespersonId"
                                value={formData.salespersonId}
                                onChange={handleHeaderChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            >
                                <option value="">{t('qform.selectSalesperson')}</option>
                                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
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
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'رقم امر الشراء' : 'PO #'}</label>
                            <input
                                type="text"
                                name="poNumber"
                                placeholder="PO Number"
                                value={formData.poNumber}
                                onChange={handleHeaderChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'تاريخ الشحن' : 'Date Of Supply'}</label>
                            <input
                                type="date"
                                name="dateOfSupply"
                                value={formData.dateOfSupply}
                                onChange={handleHeaderChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
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

                {/* Items Table Card matching QuotationForm */}
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                    <div className="rounded border border-border">
                        <table className="w-full text-[11px] text-start border-collapse">
                            <thead>
                                <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                    <th className="px-2 py-1.5 border-r border-border w-8 text-center">{isRTL ? 'م' : 'S.No.'}</th>
                                    <th className="px-2 py-1.5 border-r border-border min-w-[130px]">{t('qform.category')}</th>
                                    <th className="px-2 py-1.5 border-r border-border min-w-[130px]">{t('qform.subcategory')}</th>
                                    <th className="px-2 py-1.5 border-r border-border min-w-[160px]">{t('qform.item')}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-16 text-center">{t('qform.quantity')}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-24 text-end">{t('qform.rate')} (AED)</th>
                                    <th className="px-2 py-1.5 border-r border-border w-24 text-end">{isRTL ? 'قيمة الضريبة' : 'Tax Amt'}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-28 text-end">{t('qform.amount')} (AED)</th>
                                    <th className="px-2 py-1.5 text-center w-10">{isRTL ? 'إجراء' : 'Action'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {items.map((item, index) => (
                                    <tr key={index} className="hover:bg-hover transition-colors">
                                        <td className="px-2 py-1 border-r border-border text-center text-foreground-muted">{index + 1}</td>
                                        <td className="px-2 py-1 border-r border-border">
                                            <select
                                                name="categoryId"
                                                value={item.categoryId}
                                                onChange={(e) => handleItemChange(index, e)}
                                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary"
                                            >
                                                <option value="">{t('qform.selectCategory')}</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-2 py-1 border-r border-border">
                                            <select
                                                name="subcategoryId"
                                                value={item.subcategoryId}
                                                onChange={(e) => handleItemChange(index, e)}
                                                disabled={!item.categoryId}
                                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary disabled:opacity-50"
                                            >
                                                <option value="">{t('qform.selectSubcategory')}</option>
                                                {item.availableSubcategories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-2 py-1 border-r border-border">
                                            <input
                                                type="text"
                                                name="crmProductId"
                                                list={`items-list-${index}`}
                                                value={item.itemName || ''}
                                                onChange={(e) => handleItemChange(index, e)}
                                                placeholder={t('qform.typeToSearch')}
                                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                            />
                                            <datalist id={`items-list-${index}`}>
                                                {selectData.allItems.map(i => <option key={i.uniqueId} value={i.label} />)}
                                            </datalist>
                                        </td>
                                        <td className="px-2 py-1 border-r border-border">
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={item.quantity}
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

                {/* Bottom Cards matching QuotationForm */}
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
                                placeholder="Delivery, Payment terms, Validity etc."
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
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProformaInvoiceForm;
