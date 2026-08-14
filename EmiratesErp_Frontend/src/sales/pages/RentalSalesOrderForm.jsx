import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, Save, Upload, Loader2, Link as LinkIcon, Download, Edit, ShoppingCart, Paperclip, Edit3, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RentalSalesOrderForm = () => {
    const { t, isRTL } = useLanguage();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const quotationId = searchParams.get('quotationId');
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [sourceQuotationNumber, setSourceQuotationNumber] = useState(null);

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [categories, setCategories] = useState([]);
    // Items state
    const [items, setItems] = useState([
        {
            crmProductId: '', itemCode: '', itemName: '', description: '',
            categoryId: '', subcategoryId: '', availableSubcategories: [],
            quantity: 1, rentalValue: 0, amount: 0,
            taxPercentage: 0, taxValue: 0, isTaxExempt: false
        }
    ]);

    // Attachments
    const [attachments, setAttachments] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);

    const [formData, setFormData] = useState({
        orderDate: new Date().toISOString().split('T')[0],
        customerId: '',
        salespersonId: '',
        reference: '',
        shipmentDate: '',
        fromDate: '',
        toDate: '',
        deliveryLead: '',
        validity: '',
        paymentTerms: '',
        priceBasis: '',
        dearSir: '',
        rentalDurationDays: 1,
        subTotalPerDay: 0,
        totalRentalPrice: 0,
        totalDiscount: 0,
        otherCharges: 0,
        grossTotal: 0,
        totalTax: 0,
        netTotal: 0,
        termsAndConditions: '',
        notes: '',
        manufacture: '',
        remarks: '',
        emailTo: '',
        status: 'DRAFT',
        template: 'Standard'
    });

    useEffect(() => {
        const loadDependencies = async () => {
            setFetchingData(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [custRes, prodRes, empRes, catRes] = await Promise.all([
                    axios.get(`${API_URL}/parties`, { headers }),
                    axios.get(`${API_URL}/crm/sales-products`, { headers }),
                    axios.get(`${API_URL}/employees/all`, { headers }),
                    axios.get(`${API_URL}/production/categories`, { headers })
                ]);

                setCustomers(custRes.data.content || custRes.data || []);
                setProducts(prodRes.data.content || prodRes.data || []);
                setEmployees(empRes.data || []);
                setCategories(catRes.data || []);

                if (isEditMode) {
                    const orderRes = await axios.get(`${API_URL}/sales/rental-sales-orders/${id}`, { headers });
                    const order = orderRes.data;

                    setFormData({
                        ...order,
                        customerId: order.customerId || '',
                        salespersonId: order.salespersonId || '',
                        orderDate: order.orderDate || '',
                        shipmentDate: order.shipmentDate || '',
                        fromDate: order.fromDate || '',
                        toDate: order.toDate || '',
                    });

                    if (order.items && order.items.length > 0) {
                        const mappedItems = await Promise.all(order.items.map(async (item) => {
                            let availableSubcategories = [];
                            if (item.categoryId) {
                                try {
                                    const subRes = await axios.get(`${API_URL}/production/sub-categories?categoryId=${item.categoryId}`, { headers });
                                    availableSubcategories = subRes.data;
                                } catch (e) { console.error("Failed to load subcats for item", e); }
                            }
                            return {
                                ...item,
                                crmProductId: item.crmProductId || '',
                                categoryId: item.categoryId || '',
                                subcategoryId: item.subcategoryId || '',
                                availableSubcategories
                            };
                        }));
                        setItems(mappedItems);
                    } else {
                        setItems([]);
                    }

                    setExistingAttachments(order.attachments || []);
                } else if (quotationId) {
                    const quoteRes = await axios.get(`${API_URL}/sales/rental-quotations/${quotationId}`, { headers });
                    const quote = quoteRes.data;

                    setSourceQuotationNumber(quote.quotationNumber);

                    setFormData(prev => ({
                        ...prev,
                        customerId: quote.customerId || '',
                        salespersonId: quote.salespersonId || '',
                        reference: quote.quotationNumber, // Use quotation number as reference
                        fromDate: quote.fromDate || '',
                        toDate: quote.toDate || '',
                        rentalDurationDays: quote.rentalDurationDays || 1,
                        termsAndConditions: quote.termsAndConditions || '',
                        notes: quote.notes || '',
                        dearSir: quote.dearSir || '',
                        // Map financial totals if needed or let them recalculate
                    }));

                    if (quote.items && quote.items.length > 0) {
                        const mappedItems = await Promise.all(quote.items.map(async (item) => {
                            let availableSubcategories = [];
                            if (item.categoryId) {
                                try {
                                    const subRes = await axios.get(`${API_URL}/production/sub-categories?categoryId=${item.categoryId}`, { headers });
                                    availableSubcategories = subRes.data;
                                } catch (e) { console.error("Failed to load subcats for item", e); }
                            }
                            return {
                                ...item,
                                id: undefined, // Clear ID
                                quantity: Number(item.quantity) || 1,
                                rentalValue: Number(item.rentalValue) || 0,
                                amount: Number(item.amount) || 0,
                                taxPercentage: Number(item.taxPercentage) || 0,
                                taxValue: Number(item.taxValue) || 0,
                                availableSubcategories,
                                isTaxExempt: false
                            };
                        }));
                        setItems(mappedItems);
                    }
                }
            } catch (err) {
                console.error("Failed to load data", err);
                alert("Failed to load initial data");
            } finally {
                setFetchingData(false);
            }
        };
        loadDependencies();
    }, [id, isEditMode, quotationId]);

    // Derived Logic for Duration
    useEffect(() => {
        if (formData.fromDate && formData.toDate) {
            const start = new Date(formData.fromDate);
            const end = new Date(formData.toDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
            if (diffDays > 0) {
                setFormData(prev => ({ ...prev, rentalDurationDays: diffDays }));
            }
        }
    }, [formData.fromDate, formData.toDate]);

    // Recalculate Totals whenever items or duration changes
    useEffect(() => {
        const duration = formData.rentalDurationDays || 1;
        let subTotalStart = 0; // Per day total
        let taxTotal = 0;

        const newItems = items.map(item => {
            const qty = Number(item.quantity) || 0;
            const rate = Number(item.rentalValue) || 0;
            const amount = qty * rate * duration;

            // Tax calculation
            let taxVal = 0;
            if (!item.isTaxExempt && item.taxPercentage > 0) {
                taxVal = (amount * item.taxPercentage) / 100;
            }

            subTotalStart += (qty * rate); // This is per day subtotal if rate is per day
            taxTotal += taxVal;

            return { ...item, amount, taxValue: taxVal };
        });

        // We don't want to cause infinite loop by updating items here if only calculation changed derived values
        // But for display we need these values. 
        // Let's just calculate totals for formData.

        const totalRentalPrice = subTotalStart * duration;
        const grossTotal = totalRentalPrice - (Number(formData.totalDiscount) || 0);
        const netTotal = grossTotal + taxTotal + (Number(formData.otherCharges) || 0);

        setFormData(prev => ({
            ...prev,
            subTotalPerDay: subTotalStart,
            totalRentalPrice,
            totalTax: taxTotal,
            grossTotal,
            netTotal
        }));

    }, [items, formData.rentalDurationDays, formData.totalDiscount, formData.otherCharges]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCustomerChange = (e) => {
        const customerId = e.target.value;
        const customer = customers.find(c => c.id == customerId);

        setFormData(prev => ({
            ...prev,
            customerId: customerId,
            paymentTerms: customer?.paymentTerms || '',
            // Mapping priceBasis from priceCategory as per previous logic
            priceBasis: customer?.priceCategory || '',
            dearSir: customer?.primaryContactPerson || customer?.primaryFirstName || '',
            // contactNumber: customer?.mobile || customer?.contactPhone || '' // If we had this field in DTO
        }));
    };

    // Item handlers
    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        if (field === 'crmProductId') {
            const product = products.find(p => p.id == value);
            console.log("Selected Product ID:", value);
            console.log("Found Product:", product);
            if (product) {
                // Populate defaults from product if available
                newItems[index].itemCode = product.itemCode || '';
                newItems[index].itemName = product.name || '';
                newItems[index].description = product.description || '';
                newItems[index].rentalValue = product.salesPrice || 0; // Assuming salesPrice as base rental
                console.log("Auto-filled Items:", newItems[index]);
                // Categories match?
            }
        }

        if (field === 'categoryId') {
            // Fetch subcategories
            const categoryId = value;
            newItems[index].subcategoryId = '';
            newItems[index].availableSubcategories = [];
            if (categoryId) {
                const token = localStorage.getItem('token');
                axios.get(`${API_URL}/production/sub-categories?categoryId=${categoryId}`, { headers: { Authorization: `Bearer ${token}` } })
                    .then(res => {
                        const updatedItems = [...items];
                        updatedItems[index].availableSubcategories = res.data;
                        // Need to update state again because closure capture stale state? 
                        // No, setItems call below will handle it if we do it right.
                        // Actually simpler to use setState functional update or just wait for re-render
                        // But here we are inside the handler.
                        // Let's just update the local variable and set it.
                        newItems[index].availableSubcategories = res.data;
                        setItems([...newItems]);
                    });
            }
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, {
            crmProductId: '', itemCode: '', itemName: '', description: '',
            categoryId: '', subcategoryId: '', availableSubcategories: [],
            quantity: 1, rentalValue: 0, amount: 0,
            taxPercentage: 0, taxValue: 0, isTaxExempt: false
        }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    // Attachments
    const handleFileChange = (e) => {
        setAttachments([...attachments, ...Array.from(e.target.files)]);
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = new FormData();

            // Construct the Order object matching Request DTO
            const orderPayload = {
                ...formData,
                items: items.map(item => ({
                    crmProductId: item.crmProductId || null,
                    itemCode: item.itemCode,
                    itemName: item.itemName,
                    description: item.description,
                    categoryId: item.categoryId || null,
                    subcategoryId: item.subcategoryId || null,
                    quantity: Number(item.quantity),
                    rentalValue: Number(item.rentalValue),
                    taxValue: Number(item.taxValue),
                    taxPercentage: Number(item.taxPercentage),
                    isTaxExempt: item.isTaxExempt
                }))
            };

            payload.append('order', new Blob([JSON.stringify(orderPayload)], { type: 'application/json' }));

            attachments.forEach(file => {
                payload.append('attachments', file);
            });

            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" };

            if (isEditMode) {
                await axios.put(`${API_URL}/sales/rental-sales-orders/${id}`, payload, { headers });
            } else {
                await axios.post(`${API_URL}/sales/rental-sales-orders`, payload, { headers });

                // If created from a quotation, update the quotation status to RENTAL_ORDER
                if (quotationId) {
                    try {
                        console.log(`Updating status for quotation: ${quotationId} to RENTAL_ORDER`);
                        await axios.patch(`${API_URL}/sales/rental-quotations/${quotationId}/status`, null, {
                            params: {
                                status: 'RENTAL_ORDER'
                            },
                            headers: {
                                Authorization: `Bearer ${token}`
                            } // Use headers defined above which includes Authorization
                        });
                        console.log("Quotation status updated successfully.");
                    } catch (statusErr) {
                        console.error("Failed to update quotation status", statusErr);
                        // Optionally warn the user, but don't block the success flow
                    }
                }
            }

            navigate('/sales-dashboard/rental-sales-orders');
        } catch (err) {
            console.error("Submission failed", err);
            alert(`Error: ${err.response?.data?.message || err.message || 'Failed to save order'}`);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary h-7 w-7" /></div>;

    return (
        <div className="bg-background text-foreground font-sans space-y-2 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <ShoppingCart size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">
                            {isEditMode ? t('rentalOrder.editBtn') : t('rentalOrder.newBtn')}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none">
                            Home &gt; Sales &gt; {isEditMode ? t('rentalOrder.editBtn') : t('rentalOrder.newBtn')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                        type="button"
                        onClick={() => navigate('/sales-dashboard/rental-sales-orders')}
                        className="px-2.5 py-1 bg-card border border-border text-foreground hover:bg-hover rounded text-xs font-semibold transition-colors"
                    >
                        {t('qform.cancelBtn')}
                    </button>
                    <button
                        form="order-form"
                        type="submit"
                        disabled={loading}
                        className="px-3 py-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                        {loading && <Loader2 size={13} className="animate-spin" />} <Save size={13} /> {isEditMode ? t('qform.updateBtn') : t('qform.saveDraft')}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <form id="order-form" onSubmit={handleSubmit} className="p-3 bg-card rounded-lg border border-border shadow-2xs space-y-3">
                    {/* Header Fields Card */}
                    <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('rentalReceived.customerName')}<span className="text-rose-500">*</span></label>
                                <select
                                    name="customerId"
                                    required
                                    value={formData.customerId}
                                    onChange={handleCustomerChange}
                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                >
                                    <option value="">{t('qform.selectCustomer')}</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.salesperson')}</label>
                                <select
                                    name="salespersonId"
                                    value={formData.salespersonId}
                                    onChange={handleInputChange}
                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                >
                                    <option value="">{t('qform.selectSalesperson')}</option>
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qview.quotationDate')} <span className="text-rose-500">*</span></label>
                                <input
                                    type="date"
                                    name="orderDate"
                                    required
                                    value={formData.orderDate}
                                    onChange={handleInputChange}
                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('rentalOrder.shipmentDate')}</label>
                                <input
                                    type="date"
                                    name="shipmentDate"
                                    value={formData.shipmentDate}
                                    onChange={handleInputChange}
                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('quotation.fromDate')}</label>
                                <input
                                    type="date"
                                    name="fromDate"
                                    value={formData.fromDate}
                                    onChange={handleInputChange}
                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('quotation.toDate')}</label>
                                <input
                                    type="date"
                                    name="toDate"
                                    value={formData.toDate}
                                    onChange={handleInputChange}
                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.reference')}</label>
                                <input
                                    type="text"
                                    name="reference"
                                    placeholder={t('qform.refPlaceholder')}
                                    value={formData.reference}
                                    onChange={handleInputChange}
                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.status')}</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
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

                    {/* Table Section */}
                    <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                        <div className="rounded border border-border overflow-x-auto">
                            <table className="w-full text-[11px] text-left border-collapse">
                                <thead>
                                    <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                        <th className="px-2 py-1.5 border-r border-border w-8">{t('quotation.sno')}</th>
                                        <th className="px-2 py-1.5 border-r border-border min-w-[140px]">{t('qform.category')}</th>
                                        <th className="px-2 py-1.5 border-r border-border min-w-[140px]">{t('qform.subcategory')}</th>
                                        <th className="px-2 py-1.5 border-r border-border min-w-[170px]">{t('qform.item')}</th>
                                        <th className="px-2 py-1.5 border-r border-border w-16">{t('qform.quantity')}</th>
                                        <th className="px-2 py-1.5 border-r border-border w-24">{t('rental.ratePerDay')}</th>
                                        <th className="px-2 py-1.5 border-r border-border w-16">{t('qform.tax')}</th>
                                        <th className="px-2 py-1.5 border-r border-border w-24 text-right">{t('qform.amount')}</th>
                                        <th className="px-2 py-1.5 text-center w-8">{t('quotation.action')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {items.map((item, index) => (
                                        <tr key={index} className="hover:bg-hover transition-colors text-foreground">
                                            <td className="px-2 py-1 border-r border-border text-center text-foreground-muted">{index + 1}</td>
                                            <td className="px-1 py-1 border-r border-border">
                                                <select
                                                    value={item.categoryId}
                                                    onChange={(e) => handleItemChange(index, 'categoryId', e.target.value)}
                                                    className="w-full h-6 text-[10px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary"
                                                >
                                                    <option value="">{t('qform.selectCategory')}</option>
                                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-1 py-1 border-r border-border">
                                                <select
                                                    value={item.subcategoryId}
                                                    onChange={(e) => handleItemChange(index, 'subcategoryId', e.target.value)}
                                                    className="w-full h-6 text-[10px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary"
                                                >
                                                    <option value="">{t('qform.selectSubcategory')}</option>
                                                    {item.availableSubcategories?.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-1 py-1 border-r border-border">
                                                <select
                                                    value={item.crmProductId}
                                                    onChange={(e) => handleItemChange(index, 'crmProductId', e.target.value)}
                                                    className="w-full h-6 text-[10px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary"
                                                >
                                                    <option value="">{t('qform.searchItem')}</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.itemCode})</option>)}
                                                </select>
                                            </td>
                                            <td className="px-1 py-1 border-r border-border">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    className="w-full h-6 text-[10px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary text-center"
                                                />
                                            </td>
                                            <td className="px-1 py-1 border-r border-border">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.rentalValue}
                                                    onChange={(e) => handleItemChange(index, 'rentalValue', e.target.value)}
                                                    className="w-full h-6 text-[10px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary text-right"
                                                />
                                            </td>
                                            <td className="px-1 py-1 border-r border-border">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.taxPercentage}
                                                    onChange={(e) => handleItemChange(index, 'taxPercentage', e.target.value)}
                                                    className="w-full h-6 text-[10px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary text-right"
                                                />
                                            </td>
                                            <td className="px-2 py-1 border-r border-border font-bold text-right font-mono">
                                                AED {item.amount?.toFixed(2) || '0.00'}
                                            </td>
                                            <td className="px-1 py-1 text-center">
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
                            className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                            <Plus size={12} /> {t('qform.addItem')}
                        </button>
                    </div>

                    {/* 4 Bottom Cards Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                        {/* Attachments Card */}
                        <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground border-b border-border pb-1.5">
                                <Paperclip size={13} className="text-primary" />
                                <span>{t('qform.attachments')}</span>
                            </div>
                            <div className="border border-dashed border-border rounded-md p-2 text-center hover:bg-hover transition-colors">
                                <input type="file" multiple onChange={handleFileChange} className="hidden" id="rental-order-file-upload" />
                                <label htmlFor="rental-order-file-upload" className="cursor-pointer flex flex-col items-center gap-1 text-foreground-muted">
                                    <Upload size={16} className="text-primary" />
                                    <span className="text-[10px] font-medium">{t('qform.dragDrop')}</span>
                                    <span className="text-[9px] text-primary underline">{t('qform.selectFiles')}</span>
                                </label>
                            </div>
                            <div className="space-y-1 max-h-24 overflow-y-auto text-[10px]">
                                {attachments.map((file, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-background px-2 py-0.5 rounded border border-border">
                                        <span className="truncate max-w-[120px] text-foreground">{file.name}</span>
                                        <button type="button" onClick={() => removeAttachment(idx)} className="text-rose-500 hover:text-rose-700">
                                            <Trash2 size={11} />
                                        </button>
                                    </div>
                                ))}
                                {existingAttachments.map((url, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-primary/5 px-2 py-0.5 rounded border border-primary/20">
                                        <span className="truncate max-w-[120px] text-primary">{url.split('/').pop()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Terms & Conditions Card */}
                        <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground border-b border-border pb-1.5">
                                <FileText size={13} className="text-primary" />
                                <span>{t('qform.terms')}</span>
                            </div>
                            <textarea
                                name="termsAndConditions"
                                rows="4"
                                value={formData.termsAndConditions}
                                onChange={handleInputChange}
                                placeholder={t('qform.enterTerms')}
                                className="w-full text-[11px] border border-border bg-background rounded p-1.5 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary resize-none"
                            />
                        </div>

                        {/* Notes Card */}
                        <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground border-b border-border pb-1.5">
                                <Edit3 size={13} className="text-primary" />
                                <span>{t('qform.notes')}</span>
                            </div>
                            <textarea
                                name="notes"
                                rows="4"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder={t('qform.enterNotes')}
                                className="w-full text-[11px] border border-border bg-background rounded p-1.5 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary resize-none"
                            />
                        </div>

                        {/* Summary Card */}
                        <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground border-b border-border pb-1.5">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                <span>{t('qform.summary')}</span>
                            </div>
                            <div className="space-y-1 text-[11px]">
                                <div className="flex justify-between items-center text-foreground-muted">
                                    <span>{t('rental.durationDays')}</span>
                                    <span className="font-semibold text-foreground font-mono">{formData.rentalDurationDays} Days</span>
                                </div>
                                <div className="flex justify-between items-center text-foreground-muted">
                                    <span>{t('rental.subTotalPerDay')}</span>
                                    <span className="font-semibold text-foreground font-mono">AED {formData.subTotalPerDay?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between items-center text-foreground-muted">
                                    <span>{t('rental.totalRentalPrice')}</span>
                                    <span className="font-semibold text-foreground font-mono">AED {formData.totalRentalPrice?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between items-center text-foreground-muted">
                                    <span>{t('qform.totalTax')}</span>
                                    <span className="font-semibold text-foreground font-mono">AED {formData.totalTax?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between items-center text-foreground-muted pt-1 border-t border-border">
                                    <span>{t('qform.discountPercent')}</span>
                                    <input
                                        type="number"
                                        name="totalDiscount"
                                        value={formData.totalDiscount}
                                        onChange={handleInputChange}
                                        className="w-16 h-5 text-[10px] border border-border bg-background rounded px-1 text-right text-foreground focus:outline-none focus:border-primary font-mono"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex justify-between items-center text-foreground-muted">
                                    <span>{t('qform.otherCharges')}</span>
                                    <input
                                        type="number"
                                        name="otherCharges"
                                        value={formData.otherCharges}
                                        onChange={handleInputChange}
                                        className="w-16 h-5 text-[10px] border border-border bg-background rounded px-1 text-right text-foreground focus:outline-none focus:border-primary font-mono"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex justify-between items-center pt-1.5 border-t border-border font-bold">
                                    <span className="text-foreground">{t('qform.netTotal')}</span>
                                    <span className="text-primary font-mono text-xs">AED {formData.netTotal?.toFixed(2) || '0.00'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RentalSalesOrderForm;
