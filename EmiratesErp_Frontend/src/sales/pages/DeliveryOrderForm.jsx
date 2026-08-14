import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Paperclip, ChevronDown, FileText, Edit } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const DeliveryOrderForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isRTL, t } = useLanguage();
    const [searchParams] = useSearchParams();
    const salesOrderId = searchParams.get('salesOrderId');
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        deliveryOrderDate: '',
        shipmentDate: '',
        customerId: '',
        salesOrderId: '',
        reference: '',
        poNumber: '',
        salespersonId: '',
        status: 'DRAFT',
        items: [],
        totalDiscount: 0,
        otherCharges: 0,
        termsAndConditions: '',
        notes: '',
        emailTo: '',
        template: 'Standard',
        // UI only
        totalDiscountPercentage: 0,
        otherChargesPercentage: 0
    });

    const [selectData, setSelectData] = useState({ customers: [], allItems: [], categories: [], employees: [], salesOrders: [], subCategoryCache: {} });
    const [loading, setLoading] = useState(true);
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [error, setError] = useState(null);

    const fetchDependencies = useCallback(async () => {
        setLoading(true);
        try {
            const token = `Bearer ${localStorage.getItem('token')}`;
            const [customersRes, productsRes, rmRes, sfRes, fgRes, categoriesRes, employeesRes, salesOrdersRes] = await Promise.all([
                axios.get(`${API_URL}/parties`, { headers: { Authorization: token } }),
                axios.get(`${API_URL}/crm/sales-products`, { headers: { Authorization: token }, params: { size: 1000 } }),
                axios.get(`${API_URL}/production/raw-materials`, { headers: { Authorization: token }, params: { size: 1000 } }),
                axios.get(`${API_URL}/production/semi-finished`, { headers: { Authorization: token }, params: { size: 1000 } }),
                axios.get(`${API_URL}/production/finished-goods`, { headers: { Authorization: token }, params: { size: 1000 } }),
                axios.get(`${API_URL}/production/categories`, { headers: { Authorization: token } }),
                axios.get(`${API_URL}/employees/all`, { headers: { Authorization: token } }),
                axios.get(`${API_URL}/sales/orders`, { headers: { Authorization: token } })
            ]);

            const getList = (res) => Array.isArray(res.data) ? res.data : (res.data.content || []);

            const products = getList(productsRes).map(p => ({ ...p, type: 'PRODUCT', uniqueId: `PRODUCT-${p.id}`, label: `${p.name} (${p.itemCode}) - Product` }));
            const rawMaterials = getList(rmRes).map(r => ({ ...r, type: 'RAW_MATERIAL', uniqueId: `RM-${r.id}`, salesPrice: r.salesPrice || 0, label: `${r.name} (${r.itemCode}) - Raw Material` }));
            const semiFinished = getList(sfRes).map(s => ({ ...s, type: 'SEMI_FINISHED', uniqueId: `SF-${s.id}`, salesPrice: s.salesPrice || 0, label: `${s.name} (${s.itemCode}) - Semi-Finished` }));
            const finishedGoods = getList(fgRes).map(f => ({ ...f, type: 'FINISHED_GOOD', uniqueId: `FG-${f.id}`, salesPrice: f.salesPrice || 0, label: `${f.name} (${f.itemCode}) - Finished Good` }));

            const compiledItems = [...products, ...rawMaterials, ...semiFinished, ...finishedGoods];

            setSelectData(prev => ({
                ...prev,
                customers: getList(customersRes),
                allItems: compiledItems,
                categories: categoriesRes.data || [],
                employees: employeesRes.data || [],
                salesOrders: getList(salesOrdersRes),
                subCategoryCache: {}
            }));

            if (isEditing) {
                const orderRes = await axios.get(`${API_URL}/sales/delivery-orders/${id}`, { headers: { Authorization: token } });
                const data = orderRes.data;
                const subTotal = data.subTotal || 0;
                const discountPercentage = subTotal > 0 ? ((data.totalDiscount || 0) / subTotal) * 100 : 0;
                const chargesPercentage = subTotal > 0 ? ((data.otherCharges || 0) / subTotal) * 100 : 0;

                const categoryIds = [...new Set(data.items.map(item => item.categoryId).filter(id => id))];
                let subCategoryMap = {};

                if (categoryIds.length > 0) {
                    await Promise.all(categoryIds.map(async (catId) => {
                        try {
                            const res = await axios.get(`${API_URL}/production/sub-categories?categoryId=${catId}`, { headers: { Authorization: token } });
                            subCategoryMap[catId] = res.data || [];
                        } catch (e) {
                            console.error(`Failed to load subcategories for category ${catId}`, e);
                        }
                    }));
                }

                setSelectData(prev => ({
                    ...prev,
                    subCategoryCache: { ...prev.subCategoryCache, ...subCategoryMap }
                }));

                setFormData({
                    ...data,
                    deliveryOrderDate: data.deliveryOrderDate ? new Date(data.deliveryOrderDate).toISOString().split('T')[0] : '',
                    shipmentDate: data.shipmentDate ? new Date(data.shipmentDate).toISOString().split('T')[0] : '',
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
                            taxPercentage: item.taxPercentage || 0,
                            availableSubcategories: subCategoryMap[item.categoryId] || []
                        };
                    }),
                    totalDiscountPercentage: discountPercentage.toFixed(2),
                    otherChargesPercentage: chargesPercentage.toFixed(2),
                });
            } else if (salesOrderId) {
                const soRes = await axios.get(`${API_URL}/sales/orders/${salesOrderId}`, { headers: { Authorization: token } });
                const data = soRes.data;
                const subTotal = data.subTotal || 0;
                const discountPercentage = subTotal > 0 ? ((data.totalDiscount || 0) / subTotal) * 100 : 0;
                const chargesPercentage = subTotal > 0 ? ((data.otherCharges || 0) / subTotal) * 100 : 0;

                const categoryIds = [...new Set(data.items.map(item => item.categoryId).filter(id => id))];
                let subCategoryMap = {};

                if (categoryIds.length > 0) {
                    await Promise.all(categoryIds.map(async (catId) => {
                        try {
                            const res = await axios.get(`${API_URL}/production/sub-categories?categoryId=${catId}`, { headers: { Authorization: token } });
                            subCategoryMap[catId] = res.data || [];
                        } catch (e) {
                            console.error(`Failed to load subcategories for category ${catId}`, e);
                        }
                    }));
                }

                setSelectData(prev => ({
                    ...prev,
                    subCategoryCache: { ...prev.subCategoryCache, ...subCategoryMap }
                }));

                setFormData(prev => ({
                    ...prev,
                    customerId: data.customerId,
                    salesOrderId: data.id,
                    reference: data.salesOrderNumber,
                    salespersonId: data.salespersonId || '',
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
                            taxPercentage: item.taxPercentage || 0,
                            availableSubcategories: subCategoryMap[item.categoryId] || []
                        };
                    }),
                    totalDiscountPercentage: discountPercentage.toFixed(2),
                    otherChargesPercentage: chargesPercentage.toFixed(2),
                }));
            }
        } catch (err) {
            setError('Failed to load data. Please try again.');
            console.error("Error fetching delivery order dependencies:", err);
        } finally {
            setLoading(false);
        }
    }, [id, isEditing, salesOrderId]);

    useEffect(() => {
        fetchDependencies();
    }, [fetchDependencies]);

    const handleHeaderChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleItemChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const newItems = [...formData.items];

        if (name === 'searchInput') {
            const selectedItem = selectData.allItems.find(item => item.label === value);
            newItems[index].searchInput = value;

            newItems[index].crmProductId = null;
            newItems[index].rawMaterialId = null;
            newItems[index].semiFinishedId = null;
            newItems[index].finishedGoodId = null;
            newItems[index].selectedUniqueId = '';

            if (selectedItem) {
                newItems[index].selectedUniqueId = selectedItem.uniqueId;
                newItems[index].itemName = selectedItem.name;
                newItems[index].itemCode = selectedItem.itemCode;
                newItems[index].rate = selectedItem.salesPrice;
                newItems[index].taxPercentage = selectedItem.taxRate || 0;

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
                    setFormData(prev => ({ ...prev, items: newItems }));
                } else {
                    newItems[index].availableSubcategories = [];
                    setFormData(prev => ({ ...prev, items: newItems }));

                    const token = `Bearer ${localStorage.getItem('token')}`;
                    axios.get(`${API_URL}/production/sub-categories?categoryId=${value}`, { headers: { Authorization: token } })
                        .then(res => {
                            const fetchedSubCats = res.data || [];
                            setSelectData(prev => ({
                                ...prev,
                                subCategoryCache: { ...prev.subCategoryCache, [value]: fetchedSubCats }
                            }));
                            setFormData(currentFormData => {
                                const updatedItems = currentFormData.items.map(it => {
                                    if (it.categoryId == value) {
                                        return { ...it, availableSubcategories: fetchedSubCats };
                                    }
                                    return it;
                                });
                                return { ...currentFormData, items: updatedItems };
                            });
                        }).catch(err => console.error("Failed to fetch subcategories", err));
                }
            } else {
                newItems[index].availableSubcategories = [];
                setFormData(prev => ({ ...prev, items: newItems }));
            }
        } else if (type === 'checkbox') {
            newItems[index][name] = checked;
        } else {
            newItems[index][name] = value;
        }

        if (name !== 'categoryId') {
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
                quantity: 1,
                rate: 0,
                taxPercentage: 0,
                taxValue: 0,
                isTaxExempt: false,
                categoryId: '',
                subcategoryId: '',
                availableSubcategories: []
            }]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setAttachmentFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index) => {
        setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getAttachmentUrl = (path) => `${API_URL}/sales/attachments/${path}`;

    const calculateTotals = () => {
        let subTotal = 0;
        let totalTax = 0;
        formData.items.forEach(item => {
            const amount = (item.quantity || 0) * (item.rate || 0);
            subTotal += amount;
            if (!item.isTaxExempt) {
                const taxRate = parseFloat(item.taxPercentage || 0);
                const taxValue = amount * (taxRate / 100);
                totalTax += taxValue;
            }
        });

        const discountPercentage = parseFloat(formData.totalDiscountPercentage) || 0;
        const chargesPercentage = parseFloat(formData.otherChargesPercentage) || 0;

        const discount = subTotal * (discountPercentage / 100);
        const charges = subTotal * (chargesPercentage / 100);

        const grossTotal = subTotal - discount;
        const netTotal = grossTotal + totalTax + charges;

        return { subTotal, totalTax, discount, charges, grossTotal, netTotal };
    };

    const totals = calculateTotals();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const token = `Bearer ${localStorage.getItem('token')}`;

            const orderData = {
                ...formData,
                items: formData.items.map(item => {
                    const amount = (item.quantity || 0) * (item.rate || 0);
                    const taxValue = !item.isTaxExempt ? amount * (parseFloat(item.taxPercentage || 0) / 100) : 0;
                    return {
                        ...item,
                        crmProductId: item.crmProductId ? parseInt(item.crmProductId, 10) : null,
                        rawMaterialId: item.rawMaterialId ? parseInt(item.rawMaterialId, 10) : null,
                        semiFinishedId: item.semiFinishedId ? parseInt(item.semiFinishedId, 10) : null,
                        finishedGoodId: item.finishedGoodId ? parseInt(item.finishedGoodId, 10) : null,
                        categoryId: item.categoryId ? parseInt(item.categoryId, 10) : null,
                        subcategoryId: item.subcategoryId ? parseInt(item.subcategoryId, 10) : null,
                        taxValue: taxValue.toFixed(2),
                        taxPercentage: parseFloat(item.taxPercentage || 0)
                    };
                }),
                totalDiscount: totals.discount.toFixed(2),
                otherCharges: totals.charges.toFixed(2),
                // Remove UI-only fields
                totalDiscountPercentage: undefined,
                otherChargesPercentage: undefined,
                availableSubcategories: undefined
            };

            const payload = new FormData();
            payload.append('data', new Blob([JSON.stringify(orderData)], { type: 'application/json' }));

            attachmentFiles.forEach(file => {
                payload.append('attachments', file);
            });

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: token,
                },
            };

            if (isEditing) {
                await axios.put(`${API_URL}/sales/delivery-orders/${id}`, payload, config);
            } else {
                await axios.post(`${API_URL}/sales/delivery-orders`, payload, config);
            }
            navigate('/sales-dashboard/delivery-orders');
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} delivery order.`);
            console.error("Error submitting delivery order:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.customerId) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans space-y-2.5 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header section matching QuotationForm.jsx */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/sales-dashboard/delivery-orders')}
                        className="p-1 rounded-md hover:bg-hover text-foreground-muted hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">
                            {isEditing ? 'Edit Delivery Order' : 'New Delivery Order'}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none">
                            {t('dashboard.breadcrumb.home')} &gt; {t('nav.sales')} &gt; {isEditing ? 'Edit' : 'Create'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                        type="button"
                        onClick={() => navigate('/sales-dashboard/delivery-orders')}
                        className="px-3 py-1 border border-border bg-card hover:bg-hover text-foreground rounded-md text-[11px] font-semibold transition-colors"
                    >
                        {t('qform.cancel')}
                    </button>
                    <button
                        type="submit"
                        form="do-form"
                        disabled={loading}
                        className="px-3.5 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                    >
                        {loading && <Loader2 size={13} className="animate-spin" />} <Save size={13} /> {isEditing ? t('so.updateBtn') : t('qform.saveDraft')}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <form id="do-form" onSubmit={handleSubmit} className="space-y-2">
                    {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 px-3 py-2 rounded text-xs font-medium">{error}</div>}

                    {/* Header Card */}
                    <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('rentalReceived.customerName')} <span className="text-rose-500">*</span></label>
                                <select
                                    name="customerId"
                                    value={formData.customerId}
                                    onChange={handleHeaderChange}
                                    required
                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                >
                                    <option value="">{t('qform.selectCustomer')}</option>
                                    {selectData.customers.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {typeof c.companyName === 'string' ? c.companyName : (typeof c.name === 'string' ? c.name : `Customer ${c.id}`)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-foreground mb-0.5">Delivery Order Date <span className="text-rose-500">*</span></label>
                                <input
                                    type="date"
                                    name="deliveryOrderDate"
                                    value={formData.deliveryOrderDate}
                                    onChange={handleHeaderChange}
                                    required
                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('rentalOrder.shipmentDate')}</label>
                                <input
                                    type="date"
                                    name="shipmentDate"
                                    value={formData.shipmentDate}
                                    onChange={handleHeaderChange}
                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.reference')}</label>
                                <input
                                    type="text"
                                    name="reference"
                                    value={formData.reference}
                                    onChange={handleHeaderChange}
                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('so.poNo')}</label>
                                <input
                                    type="text"
                                    name="poNumber"
                                    value={formData.poNumber}
                                    onChange={handleHeaderChange}
                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('so.orderNo')}</label>
                                <select
                                    name="salesOrderId"
                                    value={formData.salesOrderId}
                                    onChange={handleHeaderChange}
                                    className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                >
                                    <option value="">Select Sales Order</option>
                                    {selectData.salesOrders.map(so => (
                                        <option key={so.id} value={so.id}>{typeof so.salesOrderNumber === 'string' ? so.salesOrderNumber : `SO-${so.id}`}</option>
                                    ))}
                                </select>
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
                                    {selectData.employees.map(e => (
                                        <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                                    ))}
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
                                    <option value="OPEN">OPEN</option>
                                    <option value="DELIVERED">DELIVERED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Items Table Section */}
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
                                        <th className="px-2 py-1.5 border-r border-border w-20">{t('qform.rate')}</th>
                                        <th className="px-2 py-1.5 border-r border-border w-16">{t('qform.tax')}</th>
                                        <th className="px-2 py-1.5 border-r border-border w-24 text-right">{t('qform.amount')}</th>
                                        <th className="px-2 py-1.5 text-center w-8">{t('quotation.action')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {formData.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-hover transition-colors text-foreground">
                                            <td className="px-2 py-1 border-r border-border text-center text-foreground-muted">{index + 1}</td>
                                            <td className="px-1 py-1 border-r border-border">
                                                <select
                                                    name="categoryId"
                                                    value={item.categoryId || ''}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    className="w-full h-6 text-[10px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary"
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
                                                    className="w-full h-6 text-[10px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary"
                                                    disabled={!item.categoryId}
                                                >
                                                    <option value="">{t('qform.selectSubcategory')}</option>
                                                    {(item.availableSubcategories || []).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-1 py-1 border-r border-border relative">
                                                <input
                                                    type="text"
                                                    name="searchInput"
                                                    value={item.searchInput || ''}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    className="w-full h-6 text-[10px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary"
                                                    placeholder={t('qform.searchItem')}
                                                    required
                                                />
                                            </td>
                                            <td className="px-1 py-1 border-r border-border">
                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    className="w-full h-6 text-[10px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary text-center"
                                                    min="1"
                                                />
                                            </td>
                                            <td className="px-1 py-1 border-r border-border">
                                                <input
                                                    type="number"
                                                    name="rate"
                                                    value={item.rate}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    className="w-full h-6 text-[10px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary text-right"
                                                />
                                            </td>
                                            <td className="px-1 py-1 border-r border-border">
                                                <input
                                                    type="number"
                                                    name="taxPercentage"
                                                    value={item.taxPercentage || 0}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    className="w-full h-6 text-[10px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary text-center"
                                                />
                                            </td>
                                            <td className="px-2 py-1 border-r border-border text-right font-mono font-semibold">
                                                AED {((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
                                            </td>
                                            <td className="px-1 py-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                                >
                                                    <Trash2 size={12} />
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
                            className="px-2.5 py-1 border border-border bg-card hover:bg-hover text-foreground rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                            <Plus size={12} /> {t('qform.addItem')}
                        </button>
                    </div>

                    {/* Attachments & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {/* Attachments Card */}
                        <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground border-b border-border pb-1.5">
                                <Paperclip size={13} className="text-primary" />
                                <span>{t('qform.attachFile')}</span>
                            </div>
                            <input type="file" multiple onChange={handleFileChange} className="hidden" id="do-attachment-upload" />
                            <label htmlFor="do-attachment-upload" className="px-2.5 py-1 border border-border bg-background hover:bg-hover text-foreground rounded text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer transition-colors">
                                {t('qform.browse')}
                            </label>
                            <span className="text-[10px] text-foreground-muted block">{attachmentFiles.length > 0 ? `${attachmentFiles.length} file(s) selected` : t('qform.noFile')}</span>
                            {(attachmentFiles.length > 0 || (isEditing && formData.attachments?.length > 0)) && (
                                <div className="space-y-1 mt-1">
                                    {isEditing && formData.attachments?.map((att, index) => (
                                        <div key={index} className="text-[10px] flex items-center justify-between p-1 bg-background border border-border rounded">
                                            <a href={getAttachmentUrl(att)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{att.split('/').pop()}</a>
                                        </div>
                                    ))}
                                    {attachmentFiles.map((file, index) => (
                                        <div key={index} className="text-[10px] flex items-center justify-between p-1 bg-primary/5 border border-primary/20 rounded text-foreground">
                                            <span className="truncate">{file.name}</span>
                                            <button type="button" onClick={() => removeFile(index)} className="text-rose-500 hover:text-rose-700"><Trash2 size={11} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Terms & Conditions Card */}
                        <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground border-b border-border pb-1.5">
                                <FileText size={13} className="text-primary" />
                                <span>{t('qform.terms')}</span>
                            </div>
                            <textarea
                                name="termsAndConditions"
                                rows="3"
                                value={formData.termsAndConditions}
                                onChange={handleHeaderChange}
                                placeholder={t('qform.enterTerms')}
                                className="w-full text-[11px] border border-border bg-background rounded p-1.5 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary resize-none"
                            />
                        </div>

                        {/* Notes Card */}
                        <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground border-b border-border pb-1.5">
                                <Edit size={13} className="text-primary" />
                                <span>{t('qform.notes')}</span>
                            </div>
                            <textarea
                                name="notes"
                                rows="3"
                                value={formData.notes}
                                onChange={handleHeaderChange}
                                placeholder={t('qform.enterNotes')}
                                className="w-full text-[11px] border border-border bg-background rounded p-1.5 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary resize-none"
                            />
                        </div>
                    </div>

                    {/* Calculation Summary Card */}
                    <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-1.5 max-w-xs ms-auto text-[11px]">
                        <div className="flex justify-between items-center text-foreground-muted">
                            <span>{t('qform.subTotal')}</span>
                            <span className="font-mono font-semibold text-foreground">AED {totals.subTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-foreground-muted">
                            <span>{t('qform.totalTax')}</span>
                            <span className="font-mono font-semibold text-foreground">AED {totals.totalTax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-border pt-1.5 text-xs font-bold text-foreground">
                            <span>{t('qform.netTotal')}</span>
                            <span className="text-primary font-mono">AED {totals.netTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeliveryOrderForm;
