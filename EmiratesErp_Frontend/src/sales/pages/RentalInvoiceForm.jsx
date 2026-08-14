import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Save, X, Plus, Trash2, Upload, FileText, ArrowLeft, Loader2, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RentalInvoiceForm = () => {
    const navigate = useNavigate();
    const { isRTL, t } = useLanguage();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    // Potential query params for conversion/cloning in future, but for now standard create/edit
    // const cloneId = searchParams.get('cloneId');

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dropdown Data
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        invoiceLedger: 'Rental Sales',
        invoiceDate: new Date().toISOString().split('T')[0],
        customerId: '',
        customerName: '', // For display or manual entry if needed
        invoiceNumber: '', // Backend generates if empty usually, but screenshot shows field
        doNumber: '',
        lpoNumber: '',
        requiredDate: '',
        dueDate: '',
        salespersonId: '',
        poNumber: '',
        reference: '',
        invoiceType: 'WITH_DISCOUNT_AT_INVOICE_LEVEL', // Default
        enableGrossNetWeight: false,
        items: [
            {
                crmProductId: '',
                categoryId: '',
                subcategoryId: '',
                itemName: '',
                description: '',
                quantity: 1,
                duration: 1,
                rentalValue: 0,
                amount: 0,
                taxPercentage: 0,
                taxValue: 0,
                isTaxExempt: false
            }
        ],
        subTotal: 0,
        totalDiscount: 0,
        grossTotal: 0,
        totalTax: 0,
        otherCharges: 0,
        netTotal: 0,
        status: 'OPEN', // Default status
        termsAndConditions: '',
        notes: '',
        template: 'Rental Invoice',
        emailTo: '',
        attachments: []
    });

    const token = localStorage.getItem('token');
    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

    // Data Fetching
    const loadDependencies = useCallback(async () => {
        try {
            const [custRes, empRes, prodRes, catRes] = await Promise.all([
                axios.get(`${API_URL}/parties`, authHeaders), // Assuming parties endpoint for customers
                axios.get(`${API_URL}/employees/all`, authHeaders),
                axios.get(`${API_URL}/crm/sales-products`, authHeaders),
                axios.get(`${API_URL}/production/categories`, authHeaders)
            ]);

            setCustomers(custRes.data.content || custRes.data || []);
            setEmployees(empRes.data || []);
            setProducts(prodRes.data.content || prodRes.data || []);
            setCategories(catRes.data || []);

            // If editing, fetch invoice data
            if (id) {
                const invoiceRes = await axios.get(`${API_URL}/sales/rental-invoices/${id}`, authHeaders);
                const data = invoiceRes.data;
                // Map response to form data
                setFormData(prev => ({
                    ...prev,
                    ...data,
                    customerId: data.customerId || '',
                    salespersonId: data.salespersonId || '',
                    items: data.items.map(item => ({
                        ...item,
                        crmProductId: item.crmProductId || '',
                        categoryId: item.categoryId || '',
                        subcategoryId: item.subcategoryId || ''
                    }))
                }));
            }
            // If creating new from quotation
            const quotationId = searchParams.get('quotationId');
            if (quotationId && !id) {
                const quoteRes = await axios.get(`${API_URL}/sales/rental-quotations/${quotationId}`, authHeaders);
                console.log("Fetched quotation for conversion:", quoteRes.data);
                const quote = quoteRes.data;

                // Fetch subcategories for all items
                const mappedItems = await Promise.all(quote.items.map(async (item) => {
                    let availableSubcategories = [];
                    if (item.categoryId) {
                        try {
                            const subRes = await axios.get(`${API_URL}/production/sub-categories?categoryId=${item.categoryId}`, authHeaders);
                            availableSubcategories = subRes.data || [];
                        } catch (e) {
                            console.error("Failed to fetch subcategories", e);
                        }
                    }
                    return {
                        ...item,
                        availableSubcategories
                    };
                }));

                // Map quotation to invoice
                setFormData(prev => ({
                    ...prev,
                    customerId: quote.customerId || '',
                    customerName: quote.customerName || '',
                    salespersonId: quote.salespersonId || '',
                    reference: quote.quotationNumber || '',
                    requiredDate: quote.fromDate || '',
                    dueDate: quote.toDate || '',
                    // invoiceType: quote.quotationType || 'WITH_DISCOUNT_AT_INVOICE_LEVEL',
                    items: mappedItems.map(item => ({
                        crmProductId: item.crmProductId || '',
                        categoryId: item.categoryId || '',
                        subcategoryId: item.subcategoryId || '',
                        itemName: item.itemName,
                        description: item.description,
                        quantity: item.quantity,
                        duration: quote.rentalDurationDays || 1, // Use quote duration
                        rentalValue: item.rentalValue,
                        amount: item.amount,
                        taxPercentage: item.taxPercentage,
                        taxValue: item.taxValue,
                        isTaxExempt: item.isTaxExempt || false,
                        discount: 0, // Reset discount
                        availableSubcategories: item.availableSubcategories || []
                    })),
                    termsAndConditions: quote.termsAndConditions || '',
                    notes: quote.notes || '',
                    subTotal: 0,
                    totalTax: 0,
                    grossTotal: 0,
                    netTotal: 0
                }));
                // Trigger recalculation after setting data
                setFormData(prev => calculateTotals(prev));
            }

            // If creating new from Rental Sales Order
            const orderId = searchParams.get('orderId');
            if (orderId && !id) {
                const orderRes = await axios.get(`${API_URL}/sales/rental-sales-orders/${orderId}`, authHeaders);
                console.log("Fetched order for conversion:", orderRes.data);
                const order = orderRes.data;

                // Fetch subcategories for all items
                const mappedItems = await Promise.all(order.items.map(async (item) => {
                    let availableSubcategories = [];
                    if (item.categoryId) {
                        try {
                            const subRes = await axios.get(`${API_URL}/production/sub-categories?categoryId=${item.categoryId}`, authHeaders);
                            availableSubcategories = subRes.data || [];
                        } catch (e) {
                            console.error("Failed to fetch subcategories", e);
                        }
                    }
                    return {
                        ...item,
                        availableSubcategories
                    };
                }));

                // Map order to invoice
                setFormData(prev => ({
                    ...prev,
                    customerId: order.customerId || '',
                    customerName: order.customerParty?.companyName || order.customerName || '',
                    salespersonId: order.salespersonId || '',
                    // reference: order.orderNumber || '', // Maybe keep original reference or use order number
                    doNumber: '', // Usually new
                    lpoNumber: order.lpoNumber || '',
                    requiredDate: order.shipmentDate || '', // Mapping shipment to required
                    dueDate: '',
                    invoiceType: 'WITH_DISCOUNT_AT_INVOICE_LEVEL', // Default or from order if exists
                    items: mappedItems.map(item => ({
                        crmProductId: item.crmProductId || '',
                        categoryId: item.categoryId || '',
                        subcategoryId: item.subcategoryId || '',
                        itemName: item.itemName,
                        description: item.description,
                        quantity: item.quantity,
                        duration: order.rentalDurationDays || 1,
                        rentalValue: item.rentalValue,
                        amount: item.amount,
                        taxPercentage: item.taxPercentage,
                        taxValue: item.taxValue,
                        isTaxExempt: item.isTaxExempt || false,
                        discount: 0,
                        availableSubcategories: item.availableSubcategories || []
                    })),
                    termsAndConditions: order.termsAndConditions || '',
                    notes: order.notes || '',
                    subTotal: 0,
                    totalTax: 0,
                    grossTotal: 0,
                    netTotal: 0
                }));
                // Trigger recalculation after setting data
                setFormData(prev => calculateTotals(prev));
            }

        } catch (err) {
            console.error("Failed to load dependencies", err);
            setError("Failed to load necessary data.");
        } finally {
            setInitialLoading(false);
        }
    }, [id, authHeaders]);

    useEffect(() => {
        loadDependencies();
    }, [loadDependencies]);

    // Handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-fill logic for Product selection
        if (field === 'crmProductId') {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                newItems[index].itemName = product.itemName;
                newItems[index].description = product.description;
                newItems[index].rentalValue = product.salesPrice || 0; // Assuming salesPrice as base rental value
                // Trigger subcategory fetch for this new category
                newItems[index].subcategoryId = '';
                if (product.categoryId) {
                    axios.get(`${API_URL}/production/sub-categories?categoryId=${product.categoryId}`, authHeaders)
                        .then(res => {
                            setFormData(current => {
                                const updatedItems = [...current.items];
                                updatedItems[index] = {
                                    ...updatedItems[index],
                                    availableSubcategories: res.data || []
                                };
                                return { ...current, items: updatedItems };
                            });
                        }).catch(err => console.error("Failed to fetch subcategories", err));
                } else {
                    newItems[index].availableSubcategories = [];
                }
            }
        }

        // Handle Category Change -> Fetch Subcategories
        if (field === 'categoryId') {
            newItems[index].subcategoryId = '';
            const categoryId = value;
            if (categoryId) {
                axios.get(`${API_URL}/production/sub-categories?categoryId=${categoryId}`, authHeaders)
                    .then(res => {
                        setFormData(current => {
                            const updatedItems = [...current.items];
                            updatedItems[index] = {
                                ...updatedItems[index],
                                availableSubcategories: res.data || []
                            };
                            return { ...current, items: updatedItems };
                        });
                    }).catch(err => console.error("Failed to fetch subcategories", err));
            } else {
                newItems[index].availableSubcategories = [];
            }
        }

        // Calculation Logic
        const quantity = parseFloat(newItems[index].quantity) || 0;
        const duration = parseFloat(newItems[index].duration) || 0;
        const rentalValue = parseFloat(newItems[index].rentalValue) || 0;
        const discount = parseFloat(newItems[index].discount) || 0;
        const taxPercentage = parseFloat(newItems[index].taxPercentage) || 0;

        // Base Amount
        let amount = quantity * duration * rentalValue;

        // Item Level Discount Logic
        if (formData.invoiceType === 'WITH_DISCOUNT_AT_ITEM_LEVEL') {
            amount = amount - discount;
        }

        newItems[index].amount = amount;

        if (!newItems[index].isTaxExempt) {
            newItems[index].taxValue = (amount * taxPercentage) / 100;
        } else {
            newItems[index].taxValue = 0;
        }

        setFormData(prev => {
            const updated = { ...prev, items: newItems };
            return calculateTotals(updated);
        });
    };

    const calculateTotals = (data) => {
        const subTotal = data.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const totalTax = data.items.reduce((sum, item) => sum + (parseFloat(item.taxValue) || 0), 0);

        let grossTotal = subTotal;
        let totalDiscount = 0;

        if (data.invoiceType === 'WITH_DISCOUNT_AT_INVOICE_LEVEL') {
            totalDiscount = parseFloat(data.totalDiscount) || 0;
        } else if (data.invoiceType === 'WITH_DISCOUNT_AT_ITEM_LEVEL') {
            // Total discount is sum of item discounts (just for display if needed, but 'totalDiscount' field usually represents invoice level discount)
            // If item level, usually we don't apply global discount on top, or it depends. 
            // Requirement implies EITHER item level OR invoice level.
            totalDiscount = 0; // We don't apply global discount
            // If we want to show sum of item discounts, we could calculate it, but usually 'totalDiscount' state is for the global field.
        } else {
            // WITHOUT_DISCOUNT
            totalDiscount = 0;
        }

        const otherCharges = parseFloat(data.otherCharges) || 0;

        const netTotal = subTotal + totalTax + otherCharges - totalDiscount;

        return {
            ...data,
            subTotal,
            totalTax,
            grossTotal,
            totalDiscount: data.invoiceType === 'WITH_DISCOUNT_AT_INVOICE_LEVEL' ? totalDiscount : 0,
            netTotal
        };
    };

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                crmProductId: '',
                categoryId: '',
                subcategoryId: '',
                itemName: '',
                description: '',
                quantity: 1,
                duration: 1,
                rentalValue: 0,
                amount: 0,
                discount: 0,
                taxPercentage: 0,
                taxValue: 0,
                isTaxExempt: false
            }]
        }));
    };

    const handleRemoveItem = (index) => {
        if (formData.items.length > 1) {
            setFormData(prev => {
                const newItems = prev.items.filter((_, i) => i !== index);
                return calculateTotals({ ...prev, items: newItems });
            });
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const dataToSend = new FormData();
        // Append JSON blob for the main object
        const jsonBlob = new Blob([JSON.stringify({
            ...formData,
            items: formData.items.map(item => ({
                ...item,
                // Ensure IDs are valid or null
                crmProductId: item.crmProductId || null,
                categoryId: item.categoryId || null,
                subcategoryId: item.subcategoryId || null
            })),
            customerId: formData.customerId || null,
            salespersonId: formData.salespersonId || null
        })], { type: 'application/json' });

        dataToSend.append('rentalInvoice', jsonBlob);

        // Append files
        if (formData.attachments && formData.attachments.length > 0) {
            formData.attachments.forEach(file => {
                // If it's a File object (new upload)
                if (file instanceof File) {
                    dataToSend.append('attachments', file);
                }
                // Existing URLs are handled by keeping them in entity/state, but this specific backend implementation
                // seems to take multipart 'attachments' only for NEW files. 
                // Creating/Updating logic might need to separate existing URLs from new Files.
                // The backend controller `updateRentalInvoice` accepts `MultipartFile[] attachments`.
                // It appends them. It doesn't seem to delete old ones or handle existing ones in that array.
                // So checking `file instanceof File` is correct for the `attachments` part.
            });
        }

        try {
            if (id) {
                await axios.put(`${API_URL}/sales/rental-invoices/${id}`, dataToSend, {
                    headers: {
                        ...authHeaders.headers,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post(`${API_URL}/sales/rental-invoices`, dataToSend, {
                    headers: {
                        ...authHeaders.headers,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // Update Quotation Status if quotationId is present
                const quotationId = searchParams.get('quotationId');
                if (quotationId) {
                    try {
                        await axios.patch(`${API_URL}/sales/rental-quotations/${quotationId}/status`, null, {
                            params: {
                                status: 'RENTAL_INVOICED'
                            },
                            headers: authHeaders.headers
                        });
                        console.log("Quotation status updated to INVOICED");
                    } catch (statusErr) {
                        console.error("Failed to update quotation status", statusErr);
                    }
                }

                // Update Rental Sales Order Status if orderId is present
                const orderId = searchParams.get('orderId');
                if (orderId) {
                    try {
                        await axios.patch(`${API_URL}/sales/rental-sales-orders/${orderId}/status`, null, {
                            params: {
                                status: 'RENTAL_INVOICED'
                            },
                            headers: authHeaders.headers
                        });
                        console.log("Order status updated to RENTAL_INVOICED");
                    } catch (statusErr) {
                        console.error("Failed to update order status", statusErr);
                    }
                }
            }
            navigate('/sales-dashboard/rental-invoices');
        } catch (err) {
            console.error("Failed to save rental invoice", err);
            setError("Failed to save rental invoice. Please check fields.");
} finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="flex justify-center items-center h-screen bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

    return (
        <div className="bg-background text-foreground font-sans space-y-2 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Top Bar Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/sales-dashboard/rental-invoices')}
                        className="p-1 rounded-md hover:bg-hover text-foreground-muted hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
                    </button>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">
                            {id ? (isRTL ? 'تعديل فاتورة الإيجار' : 'Edit Rental Invoice') : (isRTL ? 'إنشاء فاتورة إيجار' : 'Create Rental Invoice')}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none mt-0.5">
                            {isRTL ? 'الرئيسية > المبيعات > فواتير الإيجار' : 'Home > Sales > Rental Invoices'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                        type="button"
                        onClick={() => navigate('/sales-dashboard/rental-invoices')}
                        className="px-3 py-1 border border-border bg-card hover:bg-hover text-foreground rounded-md text-[11px] font-semibold transition-colors"
                    >
                        {t('qform.cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-3.5 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        {id ? t('qform.saveChanges') : (isRTL ? 'حفظ الفاتورة' : 'Save Invoice')}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 px-2.5 py-1.5 rounded-md text-[11px] font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2">
                {/* Header Details Card */}
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'دفتر الفواتير' : 'Invoice Ledgers'}</label>
                            <select
                                name="invoiceLedger"
                                value={formData.invoiceLedger}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            >
                                <option value="Rental Sales">Rental Sales</option>
                                <option value="General Sales">General Sales</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.customer')} *</label>
                            <select
                                name="customerId"
                                value={formData.customerId}
                                onChange={(e) => {
                                    const cust = customers.find(c => c.id === parseInt(e.target.value));
                                    setFormData(prev => ({
                                        ...prev,
                                        customerId: e.target.value,
                                        customerName: cust ? cust.companyName : ''
                                    }));
                                }}
                                required
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            >
                                <option value="">{t('qform.selectCustomer')}</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'تاريخ الفاتورة' : 'Invoice Date'}</label>
                            <input
                                type="date"
                                name="invoiceDate"
                                value={formData.invoiceDate}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'رقم أمر التسليم' : 'DO Number'}</label>
                            <input
                                type="text"
                                name="doNumber"
                                placeholder="DO Number"
                                value={formData.doNumber}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'رقم LPO' : 'LPO Number'}</label>
                            <input
                                type="text"
                                name="lpoNumber"
                                placeholder="LPO Number"
                                value={formData.lpoNumber}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.salesperson')}</label>
                            <select
                                name="salespersonId"
                                value={formData.salespersonId}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            >
                                <option value="">{t('qform.selectSalesperson')}</option>
                                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'تاريخ التوريد المطلوب' : 'Required Date'}</label>
                            <input
                                type="date"
                                name="requiredDate"
                                value={formData.requiredDate}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            />
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
                                    <th className="px-2 py-1.5 border-r border-border w-16 text-center">{t('qform.quantity')}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-16 text-center">{isRTL ? 'المدة' : 'Duration'}</th>
                                    <th className="px-2 py-1.5 border-r border-border w-24 text-end">{isRTL ? 'قيمة الإيجار' : 'Rental Val'} (AED)</th>
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
                                                value={item.categoryId}
                                                onChange={(e) => handleItemChange(index, 'categoryId', e.target.value)}
                                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary"
                                            >
                                                <option value="">{t('qform.selectCategory')}</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-2 py-1 border-r border-border">
                                            <select
                                                value={item.subcategoryId}
                                                onChange={(e) => handleItemChange(index, 'subcategoryId', e.target.value)}
                                                disabled={!item.categoryId}
                                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary disabled:opacity-50"
                                            >
                                                <option value="">{t('qform.selectSubcategory')}</option>
                                                {item.availableSubcategories?.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-2 py-1 border-r border-border relative">
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    value={item.itemName || ''}
                                                    onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                                                    placeholder={t('qform.typeToSearch')}
                                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 pr-5 text-foreground focus:outline-none focus:border-primary"
                                                    autoComplete="off"
                                                />
                                                <ChevronDown size={11} className="absolute right-1 top-2 text-foreground-muted pointer-events-none" />

                                                <div className="absolute left-0 right-0 top-full z-[100] bg-card border border-border rounded-md mt-0.5 shadow-xl hidden group-focus-within:block max-h-48 overflow-y-auto">
                                                    {products
                                                        .filter(p => {
                                                            const searchParam = (item.itemName || '').toLowerCase();
                                                            const matchSearch = (p.name || p.itemCode || '').toLowerCase().includes(searchParam);
                                                            const pCatId = p.categoryId || p.category?.id;
                                                            const pSubCatId = p.subcategoryId || p.subCategoryId || p.subCategory?.id || p.subcategory?.id;
                                                            const matchCat = item.categoryId ? String(pCatId) === String(item.categoryId) : true;
                                                            const matchSubCat = item.subcategoryId ? String(pSubCatId) === String(item.subcategoryId) : true;
                                                            return matchSearch && matchCat && matchSubCat;
                                                        })
                                                        .map(p => (
                                                            <div
                                                                key={p.id}
                                                                className="px-2 py-1.5 text-[11px] hover:bg-primary/10 cursor-pointer border-b last:border-b-0 border-border flex justify-between items-center text-foreground"
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    handleItemChange(index, 'itemName', p.name);
                                                                    handleItemChange(index, 'crmProductId', p.id);
                                                                    if (p.rentalRate) handleItemChange(index, 'rentalValue', p.rentalRate);
                                                                }}
                                                            >
                                                                <span className="font-medium">{p.name}</span>
                                                                <span className="text-[9px] text-foreground-muted bg-background px-1 py-0.5 rounded border border-border shrink-0 ml-1">
                                                                    {p.itemCode || 'PRODUCT'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1 border-r border-border">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                min="1"
                                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-center font-mono text-foreground focus:outline-none focus:border-primary"
                                            />
                                        </td>
                                        <td className="px-2 py-1 border-r border-border">
                                            <input
                                                type="number"
                                                value={item.duration}
                                                onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
                                                min="1"
                                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-1 text-center font-mono text-foreground focus:outline-none focus:border-primary"
                                            />
                                        </td>
                                        <td className="px-2 py-1 border-r border-border">
                                            <input
                                                type="number"
                                                value={item.rentalValue}
                                                onChange={(e) => handleItemChange(index, 'rentalValue', e.target.value)}
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
                                                onClick={() => handleRemoveItem(index)}
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
                        onClick={handleAddItem}
                        className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                        <Plus size={12} /> {t('qform.addItem')}
                    </button>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.attachFile')}</label>
                            <div className="flex items-center gap-2">
                                <label className="cursor-pointer px-2.5 py-1 border border-border bg-background hover:bg-hover text-foreground rounded text-[11px] font-medium flex items-center gap-1 transition-colors">
                                    <Upload size={12} /> {t('qform.browse')}
                                    <input type="file" multiple onChange={handleFileChange} className="hidden" />
                                </label>
                                <span className="text-[10px] text-foreground-muted">
                                    {formData.attachments.length > 0 ? `${formData.attachments.length} file(s)` : t('qform.noFile')}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.terms')}</label>
                            <textarea
                                name="termsAndConditions"
                                value={formData.termsAndConditions}
                                onChange={handleChange}
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
                                onChange={handleChange}
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
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setFormData(prev => calculateTotals({ ...prev, totalDiscount: val }));
                                }}
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
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setFormData(prev => calculateTotals({ ...prev, otherCharges: val }));
                                }}
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

export default RentalInvoiceForm;
