import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Save, X, Plus, Trash2, ArrowLeft, Paperclip, Upload, Loader2, FileText, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RentalQuotationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isRTL, t } = useLanguage();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const cloneId = searchParams.get('cloneId');
    const isRevise = searchParams.get('revise') === 'true';

    const [fetchingData, setFetchingData] = useState(true);



    // Dropdown Data
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [categories, setCategories] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        quotationDate: new Date().toISOString().split('T')[0],
        customerId: '',
        quotationNumber: '', // Backend generates on create, but might need display
        reference: '',
        expiryDate: '',
        deliveryLead: '',
        validity: '',
        paymentTerms: '',
        priceBasis: '',
        dearSir: '',
        salespersonId: '',
        quotationType: 'WITH_DISCOUNT_AT_ORDER_LEVEL', // Default enum
        rentalDurationDays: 1, // Default 1 day
        totalDiscount: 0,
        otherCharges: 0,
        termsAndConditions: '',
        notes: '',
        manufacture: '',
        remarks: '',
        emailTo: '',
        status: 'DRAFT',
        template: 'Standard',
        contactNumber: ''
    });

    const [items, setItems] = useState([
        { crmProductId: '', itemCode: '', itemName: '', description: '', quantity: 1, rentalValue: 0, discount: 0, taxPercentage: 0, taxValue: 0, amount: 0, isTaxExempt: false }
    ]);

    const [attachments, setAttachments] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);

    // Calculated Totals
    const [totals, setTotals] = useState({
        subTotalPerDay: 0,
        totalTaxPerDay: 0,
        grossTotal: 0, // Per Day after discount
        totalRentalPrice: 0, // Gross * Days
        totalTax: 0, // Tax Per Day * Days
        netTotal: 0
    });

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

    // Fetch Dependencies
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mimic OrderForm.jsx endpoints
                const token = `Bearer ${localStorage.getItem('token')}`;
                const config = { headers: { Authorization: token } };

                const [custRes, prodRes, empRes, catRes] = await Promise.all([
                    axios.get(`${API_URL}/parties`, config),
                    axios.get(`${API_URL}/crm/sales-products`, { ...config, params: { size: 1000 } }),
                    axios.get(`${API_URL}/employees/all`, config),
                    axios.get(`${API_URL}/production/categories`, config)
                ]);

                setCustomers(custRes.data.content || []);
                setProducts(prodRes.data.content || []);
                setEmployees(empRes.data || []);
                setCategories(catRes.data || []);
            } catch (err) {
                console.error("Failed to fetch dependencies", err);
            } finally {
                setFetchingData(false);
            }
        };
        fetchData();
    }, []);

    // Fetch Data for Edit or Clone
    useEffect(() => {
        if ((isEditMode || cloneId) && !fetchingData) {
            const fetchQuotation = async () => {
                try {
                    const targetId = isEditMode ? id : cloneId;
                    const response = await axios.get(`${API_URL}/sales/rental-quotations/${targetId}`, authHeaders);
                    const data = response.data;

                    setFormData({
                        quotationDate: isEditMode ? data.quotationDate : new Date().toISOString().split('T')[0], // Reset date for clone
                        customerId: data.customerId,
                        quotationNumber: isEditMode ? data.quotationNumber : '', // Clear number for clone
                        reference: data.reference,
                        expiryDate: isEditMode ? data.expiryDate : '',
                        deliveryLead: data.deliveryLead,
                        validity: data.validity,
                        paymentTerms: data.paymentTerms,
                        priceBasis: data.priceBasis,
                        dearSir: data.dearSir,
                        salespersonId: data.salespersonId,
                        quotationType: data.quotationType || 'WITH_DISCOUNT_AT_ORDER_LEVEL',
                        rentalDurationDays: data.rentalDurationDays || 1,
                        totalDiscount: data.totalDiscount || 0,
                        otherCharges: data.otherCharges || 0,
                        termsAndConditions: data.termsAndConditions,
                        notes: data.notes,
                        manufacture: data.manufacture,
                        remarks: data.remarks,
                        emailTo: data.emailTo,
                        status: isEditMode ? data.status : 'DRAFT', // Reset status for clone
                        template: data.template
                    });

                    // Map items and fetch subcategories
                    const mappedItems = await Promise.all(data.items.map(async (item) => {
                        let availableSubcategories = [];
                        if (item.categoryId) {
                            try {
                                const token = `Bearer ${localStorage.getItem('token')}`;
                                const res = await axios.get(`${API_URL}/production/sub-categories?categoryId=${item.categoryId}`, { headers: { Authorization: token } });
                                availableSubcategories = res.data || [];
                            } catch (e) {
                                console.error(`Failed to fetch subcategories for category ${item.categoryId}`, e);
                            }
                        }
                        return {
                            ...item,
                            crmProductId: item.crmProductId || '',
                            itemCode: item.itemCode,
                            itemName: item.itemName,
                            description: item.description,
                            categoryId: item.categoryId || '',
                            subcategoryId: item.subcategoryId || '',
                            quantity: item.quantity,
                            rentalValue: item.rentalValue,
                            taxPercentage: item.taxPercentage,
                            taxValue: item.taxValue,
                            amount: item.amount,
                            isTaxExempt: item.isTaxExempt || false,
                            availableSubcategories
                        };
                    }));

                    setItems(mappedItems);

                    if (isEditMode && data.attachments) {
                        setExistingAttachments(data.attachments);
                    }
                    // For clone, we typically don't clone attachments unless requested, let's skip for now to avoid complexity or file reference issues

                } catch (err) {
                    console.error("Failed to fetch quotation details", err);
                    alert("Failed to load quotation details");
                }
            };
            fetchQuotation();
        }
    }, [id, cloneId, isEditMode, fetchingData, authHeaders]);


    // Calculations
    useEffect(() => {
        let subTotalPerDay = 0;
        let totalTaxPerDay = 0;

        const updatedItems = items.map(item => {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rentalValue) || 0;
            const disc = parseFloat(item.discount) || 0;

            let itemAmount = qty * rate;
            if (formData.quotationType === 'WITH_DISCOUNT_AT_ITEM_LEVEL') {
                itemAmount -= disc;
            }

            let taxVal = 0;
            if (!item.isTaxExempt) {
                const taxPct = parseFloat(item.taxPercentage) || 0;
                taxVal = (itemAmount * taxPct) / 100;
            }

            subTotalPerDay += itemAmount;
            totalTaxPerDay += taxVal;

            return { ...item, amount: itemAmount, taxValue: taxVal };
        });

        let grossTotal = subTotalPerDay;
        // Global Discount Logic
        let discount = 0;
        if (formData.quotationType === 'WITH_DISCOUNT_AT_ORDER_LEVEL') {
            discount = parseFloat(formData.totalDiscount) || 0;
            grossTotal = Math.max(0, subTotalPerDay - discount);
        } else if (formData.quotationType === 'WITH_DISCOUNT_AT_ITEM_LEVEL' || formData.quotationType === 'WITHOUT_DISCOUNT') {
            // For item level, discounts are already subtracted from item amounts (subTotalPerDay reflects net of item discounts)
            // So gross total is just subTotalPerDay (which is sum of item amounts)
            // We don't apply global discount.
            grossTotal = subTotalPerDay;
        }

        const days = parseFloat(formData.rentalDurationDays) || 1;

        const totalRentalPrice = grossTotal * days;
        const totalTax = totalTaxPerDay * days;
        const otherCharges = parseFloat(formData.otherCharges) || 0;

        const netTotal = totalRentalPrice + totalTax + otherCharges;

        setTotals({
            subTotalPerDay,
            totalTaxPerDay,
            grossTotal,
            totalRentalPrice,
            totalTax,
            netTotal
        });

    }, [items, formData.totalDiscount, formData.rentalDurationDays, formData.otherCharges, formData.quotationType]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updates = { ...prev, [name]: value };

            // Auto-fill customer details
            if (name === 'customerId') {
                const customer = customers.find(c => c.id === parseInt(value));
                if (customer) {
                    updates.paymentTerms = customer.paymentTerms || '';
                    updates.priceBasis = customer.priceCategory || '';
                    updates.dearSir = customer.primaryContactPerson || customer.primaryFirstName || '';
                    updates.contactNumber = customer.mobile || customer.contactPhone || '';
                }
            }

            // Reset discounts if type changes
            if (name === 'quotationType') {
                // If switching away from item level, reset item discounts
                if (value !== 'WITH_DISCOUNT_AT_ITEM_LEVEL') {
                    // We need to update items state, which is separate. 
                    // Since setItems is separate, we'll do it in a useEffect or handle it here by modifying items directly if we could, 
                    // but we can't inside setFormData updater.
                    // So we must handle it outside this callback or triggering a side effect.
                    // Better approach: Handle type change in a dedicated handler or effect, or just let the user manually clear it.
                    // But for good UX, let's auto-clear.
                }

                // If switching away from order level, reset global discount
                if (value !== 'WITH_DISCOUNT_AT_ORDER_LEVEL') {
                    updates.totalDiscount = 0;
                }
            }

            return updates;
        });

        // Handle Item Discount Reset Side Effect
        if (name === 'quotationType' && value !== 'WITH_DISCOUNT_AT_ITEM_LEVEL') {
            setItems(prevItems => prevItems.map(item => ({ ...item, discount: 0 })));
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Auto-fill product details
        if (field === 'crmProductId') {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                newItems[index].itemCode = product.itemCode || '';
                newItems[index].itemName = product.name || '';
                newItems[index].description = product.description || '';
                newItems[index].rentalValue = product.salesPrice || 0; // Assuming salesPrice as default rental rate? Or 0.
                // Reset tax if needed or set default
                newItems[index].taxPercentage = 5; // Default VAT usually 5% in regions like UAE
            }
        }

        // Handle Category Change -> Fetch Subcategories
        if (field === 'categoryId') {
            newItems[index].subcategoryId = '';
            const categoryId = value;
            if (categoryId) {
                const token = `Bearer ${localStorage.getItem('token')}`;
                axios.get(`${API_URL}/production/sub-categories?categoryId=${categoryId}`, { headers: { Authorization: token } })
                    .then(res => {
                        newItems[index].availableSubcategories = res.data || [];
                        setItems([...newItems]); // Trigger re-render with new subcats
                    }).catch(err => console.error("Failed to fetch subcategories", err));
            } else {
                newItems[index].availableSubcategories = [];
            }
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { crmProductId: '', itemCode: '', itemName: '', description: '', quantity: 1, rentalValue: 0, discount: 0, taxPercentage: 5, taxValue: 0, amount: 0, isTaxExempt: false, categoryId: '', subcategoryId: '', availableSubcategories: [] }]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setAttachments([...attachments, ...Array.from(e.target.files)]);
        }
    };

    const handleSubmit = async (e, statusToSet) => {
        e.preventDefault();
        if (!formData.customerId) {
            alert("Please select a customer.");
            return;
        }

        setLoading(true);
        const payloadData = {
            ...formData,
            status: statusToSet || formData.status,
            subTotal: totals.subTotalPerDay,
            grossTotal: totals.grossTotal,
            totalRentalPrice: totals.totalRentalPrice,
            totalTax: totals.totalTax,
            netTotal: totals.netTotal,
            items: items.map(item => {
                const qty = parseFloat(item.quantity) || 0;
                const rate = parseFloat(item.rentalValue) || 0;
                let amt = qty * rate;
                if (formData.quotationType === 'WITH_DISCOUNT_AT_ITEM_LEVEL') {
                    amt -= (parseFloat(item.discount) || 0);
                }
                amt = Math.max(0, amt);
                const taxPct = parseFloat(item.taxPercentage) || 0;
                const taxVal = !item.isTaxExempt ? (amt * taxPct) / 100 : 0;

                return {
                    ...item,
                    crmProductId: item.crmProductId ? parseInt(item.crmProductId) : null,
                    categoryId: item.categoryId ? parseInt(item.categoryId) : null,
                    subcategoryId: item.subcategoryId ? parseInt(item.subcategoryId) : null,
                    quantity: qty,
                    rentalValue: rate,
                    discount: parseFloat(item.discount) || 0,
                    amount: amt,
                    taxPercentage: taxPct,
                    taxValue: taxVal
                };
            })
        };

        const formDataObj = new FormData();
        formDataObj.append('quotation', new Blob([JSON.stringify(payloadData)], { type: 'application/json' }));

        attachments.forEach(file => {
            formDataObj.append('attachments', file);
        });

        const token = `Bearer ${localStorage.getItem('token')}`;
        const config = { headers: { Authorization: token, 'Content-Type': 'multipart/form-data' } };

        try {
            if (isEditMode) {
                await axios.put(`${API_URL}/sales/rental-quotations/${id}`, formDataObj, config);
            } else {
                await axios.post(`${API_URL}/sales/rental-quotations`, formDataObj, config);
            }
            navigate('/sales-dashboard/rental-quotations');
        } catch (err) {
            console.error("Failed to save rental quotation", err);
            alert("Failed to save quotation.");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) return <div className="flex justify-center items-center h-screen bg-background"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

    return (
        <div className="bg-background text-foreground font-sans space-y-2 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <FileText size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">
                            {isEditMode ? t('rental.editBtn') : isRevise ? t('rental.reviseBtn') : t('rental.newBtn')}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none">
                            {t('rental.detailsTitle')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                        type="button"
                        onClick={() => navigate('/sales-dashboard/rental-quotations')}
                        className="px-3 py-1 border border-border bg-card hover:bg-hover text-foreground rounded-md text-[11px] font-semibold transition-colors"
                    >
                        {t('qform.cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'DRAFT')}
                        className="px-3 py-1 border border-border bg-background hover:bg-hover text-foreground rounded-md text-[11px] font-semibold transition-colors"
                    >
                        {t('qform.saveDraft')}
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'SENT')}
                        className="px-3.5 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                    >
                        {loading ? <Loader2 className="animate-spin" size={13} /> : <Save size={13} />}
                        {isEditMode ? t('qform.updateBtn') : t('qform.createBtn')}
                    </button>
                </div>
            </div>

            {/* Basic Info Form Grid Card */}
            <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 pb-1 border-b border-border">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <FileText size={13} />
                    </div>
                    <h2 className="text-xs font-bold text-foreground">{t('qform.detailsTitle')}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.customer')} *</label>
                        <select
                            name="customerId"
                            value={formData.customerId}
                            onChange={handleInputChange}
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            required
                        >
                            <option value="">{t('qform.selectCustomer')}</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.companyName || c.primaryContactPerson}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.quotationDate')} *</label>
                        <input
                            type="date"
                            name="quotationDate"
                            value={formData.quotationDate}
                            onChange={handleInputChange}
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.expiryDate')}</label>
                        <input
                            type="date"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('rental.durationDays')}</label>
                        <input
                            type="number"
                            min="1"
                            name="rentalDurationDays"
                            value={formData.rentalDurationDays}
                            onChange={handleInputChange}
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary font-bold"
                        />
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
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.reference')}</label>
                        <input
                            type="text"
                            name="reference"
                            value={formData.reference}
                            onChange={handleInputChange}
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            placeholder={t('qform.refPlaceholder')}
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.quotationType')}</label>
                        <select
                            name="quotationType"
                            value={formData.quotationType}
                            onChange={handleInputChange}
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

            {/* Items Table Card */}
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
                                <th className="px-2 py-1.5 border-r border-border w-24">{t('rental.ratePerDay')}</th>
                                {formData.quotationType === 'WITH_DISCOUNT_AT_ITEM_LEVEL' && (
                                    <th className="px-2 py-1.5 border-r border-border w-16">{t('qform.disc')}</th>
                                )}
                                <th className="px-2 py-1.5 border-r border-border w-16">{t('qform.tax')}</th>
                                <th className="px-2 py-1.5 border-r border-border w-24">{t('qform.amount')}</th>
                                <th className="px-1.5 py-1.5 text-center w-12">{t('quotation.action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {items.map((item, index) => (
                                <tr key={index} className="hover:bg-hover text-foreground relative z-10 hover:z-20">
                                    <td className="px-2 py-1 border-r border-border font-medium text-center">{index + 1}</td>

                                    <td className="px-1 py-1 border-r border-border">
                                        <select
                                            value={item.categoryId || ''}
                                            onChange={(e) => handleItemChange(index, 'categoryId', e.target.value)}
                                            className="w-full h-6 text-[11px] border border-border bg-background rounded px-1.5 text-foreground focus:outline-none focus:border-primary"
                                        >
                                            <option value="">{t('qform.selectCategory')}</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </td>

                                    <td className="px-1 py-1 border-r border-border">
                                        <select
                                            value={item.subcategoryId || ''}
                                            onChange={(e) => handleItemChange(index, 'subcategoryId', e.target.value)}
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
                                                value={item.itemName || ''}
                                                onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                                                placeholder={t('qform.searchItem')}
                                                className="w-full h-6 text-[11px] border border-border bg-background rounded px-1.5 pr-5 text-foreground focus:outline-none focus:border-primary"
                                                autoComplete="off"
                                            />
                                            <ChevronDown size={11} className="absolute right-1 top-1.5 text-foreground-muted pointer-events-none" />

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

                                    <td className="px-1 py-1 border-r border-border">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            className="w-full h-6 text-[11px] border border-border bg-background rounded px-1.5 text-center text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </td>

                                    <td className="px-1 py-1 border-r border-border">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.rentalValue}
                                            onChange={(e) => handleItemChange(index, 'rentalValue', e.target.value)}
                                            className="w-full h-6 text-[11px] border border-border bg-background rounded px-1.5 text-right text-foreground focus:outline-none focus:border-primary font-mono"
                                        />
                                    </td>

                                    {formData.quotationType === 'WITH_DISCOUNT_AT_ITEM_LEVEL' && (
                                        <td className="px-1 py-1 border-r border-border">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.discount}
                                                onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                                                className="w-full h-6 text-[11px] border border-border bg-background rounded px-1.5 text-right text-foreground focus:outline-none focus:border-primary font-mono"
                                            />
                                        </td>
                                    )}

                                    <td className="px-1 py-1 border-r border-border">
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.taxPercentage}
                                            onChange={(e) => handleItemChange(index, 'taxPercentage', e.target.value)}
                                            className="w-full h-6 text-[11px] border border-border bg-background rounded px-1.5 text-right text-foreground focus:outline-none focus:border-primary font-mono"
                                        />
                                    </td>

                                    <td className="px-2 py-1 border-r border-border font-bold text-foreground">
                                        {(() => {
                                            let amt = (parseFloat(item.quantity) || 0) * (parseFloat(item.rentalValue) || 0);
                                            if (formData.quotationType === 'WITH_DISCOUNT_AT_ITEM_LEVEL') {
                                                amt -= (parseFloat(item.discount) || 0);
                                            }
                                            return `AED ${Math.max(0, amt).toFixed(2)}`;
                                        })()}
                                    </td>

                                    <td className="px-1 py-1 text-center">
                                        <div className="flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                disabled={items.length === 1}
                                                className="w-4 h-4 rounded border border-border flex items-center justify-center text-red-600 hover:bg-red-500/10 disabled:opacity-30"
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

            {/* Bottom 4-Card Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                {/* 1. Attachments Card */}
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs flex flex-col justify-between space-y-1.5">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-border">
                        <Paperclip size={13} className="text-primary" />
                        <h3 className="text-xs font-bold text-foreground">{t('qform.attachments')}</h3>
                    </div>
                    <div className="border border-dashed border-border rounded-lg p-2 text-center bg-background/50 flex flex-col items-center justify-center space-y-1">
                        <Upload size={15} className="text-primary" />
                        <p className="text-[10px] text-foreground-muted">{t('qform.dragDrop')}</p>
                        <input type="file" multiple onChange={handleFileChange} className="hidden" id="rental-file-upload" />
                        <label
                            htmlFor="rental-file-upload"
                            className="px-2 py-0.5 bg-card border border-border text-foreground hover:bg-hover rounded text-[10px] font-semibold cursor-pointer shadow-2xs"
                        >
                            {t('qform.selectFiles')}
                        </label>
                        <p className="text-[8px] text-foreground-muted">{t('qform.supports')}</p>
                    </div>
                    {attachments.length > 0 && (
                        <div className="space-y-1 max-h-16 overflow-y-auto">
                            {attachments.map((file, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[9px] p-1 bg-background rounded border border-border text-foreground">
                                    <span className="truncate max-w-[140px]">{file.name}</span>
                                    <button type="button" onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Terms & Conditions Card */}
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-border">
                        <FileText size={13} className="text-primary" />
                        <h3 className="text-xs font-bold text-foreground">{t('qform.terms')}</h3>
                    </div>
                    <textarea
                        name="termsAndConditions"
                        rows="3"
                        value={formData.termsAndConditions}
                        onChange={handleInputChange}
                        className="w-full text-[11px] border border-border bg-background rounded p-1.5 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary resize-none"
                        placeholder={t('qform.enterTerms')}
                    />
                </div>

                {/* 3. Notes Card */}
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-border">
                        <FileText size={13} className="text-primary" />
                        <h3 className="text-xs font-bold text-foreground">{t('qform.notes')}</h3>
                    </div>
                    <textarea
                        name="notes"
                        rows="3"
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="w-full text-[11px] border border-border bg-background rounded p-1.5 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary resize-none"
                        placeholder={t('qform.enterNotes')}
                    />
                </div>

                {/* 4. Rental Summary Card */}
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs flex flex-col justify-between space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-border">
                        <FileText size={13} className="text-primary" />
                        <h3 className="text-xs font-bold text-foreground">{t('qform.summary')}</h3>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-foreground-muted">
                            <span>{t('rental.subTotalPerDay')}</span>
                            <span className="font-semibold text-foreground font-mono">AED {totals.subTotalPerDay.toFixed(2)}</span>
                        </div>

                        {formData.quotationType === 'WITH_DISCOUNT_AT_ORDER_LEVEL' && (
                            <div className="flex justify-between items-center pt-0.5 border-t border-border">
                                <span className="text-foreground-muted">{t('qview.totalDiscount')}</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="totalDiscount"
                                    value={formData.totalDiscount}
                                    onChange={handleInputChange}
                                    className="w-16 h-5 text-right border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary font-mono text-[11px]"
                                />
                            </div>
                        )}

                        <div className="flex justify-between items-center text-foreground-muted">
                            <span>{t('rental.totalRentalPrice')} ({formData.rentalDurationDays} Days)</span>
                            <span className="font-semibold text-foreground font-mono">AED {totals.totalRentalPrice.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center text-foreground-muted">
                            <span>{t('qform.totalTax')}</span>
                            <span className="font-semibold text-foreground font-mono">AED {totals.totalTax.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center pt-0.5 border-t border-border">
                            <span className="text-foreground-muted">{t('qview.otherCharges')}</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                name="otherCharges"
                                value={formData.otherCharges}
                                onChange={handleInputChange}
                                className="w-16 h-5 text-right border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary font-mono text-[11px]"
                            />
                        </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-md p-2 flex justify-between items-center mt-2">
                        <span className="font-bold text-foreground text-xs">{t('qform.netTotal')}</span>
                        <span className="font-extrabold text-primary text-xs font-mono">
                            AED {totals.netTotal.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RentalQuotationForm;
