import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader, X, Plus, Save, Trash2, ArrowLeft, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const QuickAddModal = ({ isOpen, onClose, title, fields, onSubmit }) => {
    const [modalData, setModalData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await onSubmit(modalData);
            setModalData({});
            onClose();
        } catch (err) {
            console.error("Quick add submit error", err);
            setError(err.response?.data?.message || 'Failed to save record.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[70] p-4" onClick={onClose}>
            <div className="bg-white text-[#102A43] rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-[#D7E3EE] flex justify-between items-center bg-[#F8FAFC]">
                    <h3 className="text-base font-bold text-[#102A43]">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full text-[#60738E] hover:bg-slate-200 transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3 max-h-[75vh] overflow-y-auto">
                    {error && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-600 font-medium">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {fields.map(field => (
                            <div key={field.name} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                {field.type === 'select' ? (
                                    <select
                                        required={field.required}
                                        value={modalData[field.name] || ''}
                                        onChange={e => setModalData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                    >
                                        <option value="">-- Select {field.label} --</option>
                                        {field.options?.map(opt => (
                                            <option key={opt.value || opt.id} value={opt.value || opt.id}>
                                                {opt.label || opt.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type || 'text'}
                                        required={field.required}
                                        value={modalData[field.name] || ''}
                                        onChange={e => setModalData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                        placeholder="Type here..."
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-[#D7E3EE]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 text-xs font-bold text-[#60738E] bg-[#F8FAFC] border border-[#C9D8E5] rounded hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0178BC] rounded hover:bg-[#005A8C] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                            {submitting && <Loader className="animate-spin h-3 w-3" />} Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ValidationModal = ({ isOpen, onClose, errors }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[80] p-4" onClick={onClose}>
            <div className="bg-white text-[#102A43] rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-[#D7E3EE] flex justify-between items-center bg-red-50">
                    <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                        <AlertTriangle size={18} />
                        <span>Form Validation Error</span>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[#60738E] hover:bg-red-100 transition-colors"><X size={18} /></button>
                </div>
                <div className="p-4 flex flex-col gap-3">
                    <p className="text-xs text-[#60738E]">
                        Please resolve the following required fields before saving the deal:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-red-600 font-medium max-h-48 overflow-y-auto">
                        {errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                        ))}
                    </ul>
                    <div className="flex justify-end mt-2 pt-3 border-t border-[#D7E3EE]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                        >
                            Review Form
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CrmDealFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        customerId: '',
        salespersonId: '',
        quotationDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        reference: '',
        status: 'DRAFT',
        quotationType: 'STANDARD',
        notes: '',
        termsAndConditions: '',
        totalDiscount: 0,
        otherCharges: 0,
        items: []
    });

    const [selectData, setSelectData] = useState({
        customers: [],
        salespersons: [],
        products: []
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [validationErrorList, setValidationErrorList] = useState([]);
    const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);

    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

    const authHeaders = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [custRes, empRes, prodRes, rmRes, sfRes, fgRes] = await Promise.all([
                axios.get(`${API_URL}/parties?type=CUSTOMER&size=1000`, { headers: authHeaders }),
                axios.get(`${API_URL}/employees/all`, { headers: authHeaders }),
                axios.get(`${API_URL}/crm/sales-products?size=1000`, { headers: authHeaders }),
                axios.get(`${API_URL}/production/raw-materials?size=1000`, { headers: authHeaders }),
                axios.get(`${API_URL}/production/semi-finished?size=1000`, { headers: authHeaders }),
                axios.get(`${API_URL}/production/finished-goods?size=1000`, { headers: authHeaders })
            ]);

            const getList = (res) => Array.isArray(res.data) ? res.data : (res.data?.content || []);

            const customersList = getList(custRes);
            const employeesList = getList(empRes);

            const products = getList(prodRes).map(p => ({ ...p, type: 'PRODUCT', uniqueId: `PRODUCT-${p.id}`, label: `${p.name} (${p.itemCode || 'PROD'}) - CRM Product` }));
            const rawMaterials = getList(rmRes).map(r => ({ ...r, type: 'RAW_MATERIAL', uniqueId: `RM-${r.id}`, salesPrice: r.salesPrice || 0, label: `${r.name} (${r.itemCode || 'RM'}) - Raw Material` }));
            const semiFinished = getList(sfRes).map(s => ({ ...s, type: 'SEMI_FINISHED', uniqueId: `SF-${s.id}`, salesPrice: s.salesPrice || 0, label: `${s.name} (${s.itemCode || 'SF'}) - Semi-Finished` }));
            const finishedGoods = getList(fgRes).map(f => ({ ...f, type: 'FINISHED_GOOD', uniqueId: `FG-${f.id}`, salesPrice: f.salesPrice || 0, label: `${f.name} (${f.itemCode || 'FG'}) - Finished Good` }));

            const compiledItems = [...products, ...rawMaterials, ...semiFinished, ...finishedGoods];

            setSelectData({
                customers: customersList,
                salespersons: employeesList,
                products: compiledItems
            });

            if (isEdit) {
                const dealRes = await axios.get(`${API_URL}/sales/quotations/${id}`, { headers: authHeaders });
                const item = dealRes.data;
                setFormData({
                    customerId: item.customerId || item.party?.id || '',
                    salespersonId: item.salespersonId || item.salesperson?.id || '',
                    quotationDate: item.quotationDate || new Date().toISOString().split('T')[0],
                    expiryDate: item.expiryDate || new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
                    reference: item.reference || '',
                    status: item.status || 'DRAFT',
                    quotationType: item.quotationType || 'STANDARD',
                    notes: item.notes || '',
                    termsAndConditions: item.termsAndConditions || '',
                    totalDiscount: item.totalDiscount || 0,
                    otherCharges: item.otherCharges || 0,
                    items: (item.items || []).map(line => {
                        let uniqueId = '';
                        if (line.crmProductId) uniqueId = `PRODUCT-${line.crmProductId}`;
                        else if (line.rawMaterialId) uniqueId = `RM-${line.rawMaterialId}`;
                        else if (line.semiFinishedId) uniqueId = `SF-${line.semiFinishedId}`;
                        else if (line.finishedGoodId) uniqueId = `FG-${line.finishedGoodId}`;

                        return {
                            selectedUniqueId: uniqueId,
                            crmProductId: line.crmProductId || null,
                            rawMaterialId: line.rawMaterialId || null,
                            semiFinishedId: line.semiFinishedId || null,
                            finishedGoodId: line.finishedGoodId || null,
                            quantity: line.quantity || 1,
                            rate: line.rate || 0,
                            taxPercentage: line.taxPercentage || 0,
                            taxExempt: line.taxExempt || false,
                            taxValue: line.taxValue || 0
                        };
                    })
                });
            }
        } catch (error) {
            console.error("Failed to load deal form data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const validateField = (name, value) => {
        let err = '';
        if (name === 'customerId' && !value) err = 'Customer selection is required.';
        if (name === 'status' && !value) err = 'Deal Status is required.';
        if (name === 'quotationDate' && !value) err = 'Date is required.';

        setFieldErrors(prev => {
            const next = { ...prev };
            if (err) next[name] = err;
            else delete next[name];
            return next;
        });

        return err;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                selectedUniqueId: '',
                crmProductId: null,
                rawMaterialId: null,
                semiFinishedId: null,
                finishedGoodId: null,
                quantity: 1,
                rate: 0,
                taxPercentage: 0,
                taxExempt: false,
                taxValue: 0
            }]
        }));
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems.splice(index, 1);
            return { ...prev, items: newItems };
        });
    };

    const handleItemChange = (index, field, value) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            const item = { ...newItems[index] };

            if (field === 'selectedUniqueId') {
                const product = selectData.products.find(p => p.uniqueId === value);
                item.selectedUniqueId = value;

                if (product) {
                    item.rate = product.salesPrice || 0;
                    item.taxPercentage = product.taxRate || 0;

                    item.crmProductId = product.type === 'PRODUCT' ? product.id : null;
                    item.rawMaterialId = product.type === 'RAW_MATERIAL' ? product.id : null;
                    item.semiFinishedId = product.type === 'SEMI_FINISHED' ? product.id : null;
                    item.finishedGoodId = product.type === 'FINISHED_GOOD' ? product.id : null;
                } else {
                    item.crmProductId = null;
                    item.rawMaterialId = null;
                    item.semiFinishedId = null;
                    item.finishedGoodId = null;
                }
            } else {
                item[field] = value;
            }

            if (!item.taxExempt && item.rate && item.quantity && item.taxPercentage) {
                const amt = parseFloat(item.rate) * parseFloat(item.quantity);
                item.taxValue = (amt * parseFloat(item.taxPercentage)) / 100;
            } else {
                item.taxValue = 0;
            }

            newItems[index] = item;
            return { ...prev, items: newItems };
        });
    };

    const calculateSubtotal = () => {
        return formData.items.reduce((acc, item) => {
            return acc + (parseFloat(item.rate || 0) * parseFloat(item.quantity || 0));
        }, 0);
    };

    const calculateTotalTax = () => {
        return formData.items.reduce((acc, item) => {
            if (item.taxExempt) return acc;
            const amt = parseFloat(item.rate || 0) * parseFloat(item.quantity || 0);
            return acc + ((amt * parseFloat(item.taxPercentage || 0)) / 100);
        }, 0);
    };

    const calculateNetTotal = () => {
        const subtotal = calculateSubtotal();
        const tax = calculateTotalTax();
        const discount = parseFloat(formData.totalDiscount || 0);
        const charges = parseFloat(formData.otherCharges || 0);
        return subtotal + tax - discount + charges;
    };

    const handleQuickAddCustomer = async (data) => {
        const res = await axios.post(`${API_URL}/parties`, {
            companyName: data.companyName,
            email: data.email || '',
            phone: data.phone || '',
            type: 'CUSTOMER'
        }, { headers: authHeaders });

        const newCustomer = res.data;
        setSelectData(prev => ({ ...prev, customers: [newCustomer, ...prev.customers] }));
        setFormData(prev => ({ ...prev, customerId: newCustomer.id }));
        validateField('customerId', newCustomer.id);
    };

    const handleQuickAddEmployee = async (data) => {
        const res = await axios.post(`${API_URL}/employees`, {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email
        }, { headers: authHeaders });

        const newEmployee = res.data;
        setSelectData(prev => ({ ...prev, salespersons: [newEmployee, ...prev.salespersons] }));
        setFormData(prev => ({ ...prev, salespersonId: newEmployee.id }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = [];

        const cErr = validateField('customerId', formData.customerId);
        if (cErr) errors.push(cErr);
        const sErr = validateField('status', formData.status);
        if (sErr) errors.push(sErr);
        const dErr = validateField('quotationDate', formData.quotationDate);
        if (dErr) errors.push(dErr);

        if (formData.items.length === 0) {
            errors.push('At least one line item is required to submit a deal.');
        }

        formData.items.forEach((item, idx) => {
            if (!item.selectedUniqueId) {
                errors.push(`Item line #${idx + 1} requires product/item selection.`);
            }
            if (!item.quantity || parseFloat(item.quantity) <= 0) {
                errors.push(`Item line #${idx + 1} requires valid quantity.`);
            }
        });

        if (errors.length > 0) {
            setValidationErrorList(errors);
            setIsValidationModalOpen(true);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                customerId: parseInt(formData.customerId),
                salespersonId: formData.salespersonId ? parseInt(formData.salespersonId) : null,
                totalDiscount: parseFloat(formData.totalDiscount || 0),
                otherCharges: parseFloat(formData.otherCharges || 0),
                items: formData.items.map(item => ({
                    crmProductId: item.crmProductId ? parseInt(item.crmProductId) : null,
                    rawMaterialId: item.rawMaterialId ? parseInt(item.rawMaterialId) : null,
                    semiFinishedId: item.semiFinishedId ? parseInt(item.semiFinishedId) : null,
                    finishedGoodId: item.finishedGoodId ? parseInt(item.finishedGoodId) : null,
                    quantity: parseFloat(item.quantity || 1),
                    rate: parseFloat(item.rate || 0),
                    taxPercentage: parseFloat(item.taxPercentage || 0),
                    taxExempt: Boolean(item.taxExempt),
                    taxValue: parseFloat(item.taxValue || 0)
                }))
            };

            const data = new FormData();
            data.append('quotation', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

            if (isEdit) {
                await axios.put(`${API_URL}/sales/quotations/${id}`, data, {
                    headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post(`${API_URL}/sales/quotations`, data, {
                    headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' }
                });
            }

            navigate('/crm-dashboard/deals');
        } catch (err) {
            console.error("Save deal error", err);
            const apiMsg = err.response?.data?.message || 'Failed to save deal record.';
            setValidationErrorList([apiMsg]);
            setIsValidationModalOpen(true);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#F8FAFC]">
                <Loader className="animate-spin h-8 w-8 text-[#0178BC]" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full bg-[#F8FAFC] text-[#102A43] p-0 overflow-hidden font-sans">
            {/* Unified Form Container */}
            <form onSubmit={handleSubmit} className="bg-white border-none rounded-none shadow-none overflow-hidden flex flex-col h-full min-h-0 w-full">
                {/* Header Bar */}
                <div className="bg-white border-b border-[#D7E3EE] px-4 py-3 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/crm-dashboard/deals')}
                            className="p-1.5 rounded-lg text-[#60738E] hover:bg-[#F8FAFC] hover:text-[#102A43] border border-[#D7E3EE] transition-all cursor-pointer"
                            title="Back to Deal Pipeline"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-[#102A43] tracking-tight">
                                {isEdit ? 'Edit Deal Opportunity' : 'Create New Deal Opportunity'}
                            </h1>
                            <p className="text-xs text-[#60738E] mt-0.5">
                                Configure deal details, line items pricing, terms, and track pipeline status
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/crm-dashboard/deals')}
                            className="px-3.5 py-1.5 text-xs font-bold text-[#60738E] bg-[#F8FAFC] border border-[#C9D8E5] rounded-md hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-[#0178BC] rounded-md hover:bg-[#005A8C] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            {submitting ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Save size={14} />}
                            {isEdit ? 'Update Deal' : 'Confirm & Save Deal'}
                        </button>
                    </div>
                </div>

                {/* Form Sections Container */}
                <div className="p-2 sm:p-3 flex flex-col gap-2.5 sm:gap-3 bg-[#F8FAFC] flex-1 overflow-y-auto w-full">
                    {Object.keys(fieldErrors).length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600 font-medium shrink-0">
                            <AlertTriangle size={16} className="shrink-0" />
                            <span>Some fields require your attention before saving. Please fix the highlighted errors.</span>
                        </div>
                    )}

                    {/* Section 1: Customer & Deal Identification */}
                    <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5 border-t-2 border-t-[#0178BC]">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                1
                            </div>
                            <h2 className="text-sm font-bold text-[#102A43]">Customer & Pipeline Information</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-[#102A43]">
                                        Customer <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCustomerModalOpen(true)}
                                        className="text-[11px] font-medium text-[#0178BC] hover:underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                        <Plus size={12} /> Add Customer
                                    </button>
                                </div>
                                <select
                                    name="customerId"
                                    value={formData.customerId}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.customerId ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer`}
                                >
                                    <option value="">-- Select Customer --</option>
                                    {selectData.customers.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.companyName || c.name}
                                        </option>
                                    ))}
                                </select>
                                {fieldErrors.customerId && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.customerId}</p>}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-[#102A43]">
                                        Sales Representative
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsEmployeeModalOpen(true)}
                                        className="text-[11px] font-medium text-[#0178BC] hover:underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                        <Plus size={12} /> Add Employee
                                    </button>
                                </div>
                                <select
                                    name="salespersonId"
                                    value={formData.salespersonId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                >
                                    <option value="">-- Unassigned --</option>
                                    {selectData.salespersons.map(e => (
                                        <option key={e.id} value={e.id}>
                                            {e.firstName} {e.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">
                                    Pipeline Stage / Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                >
                                    <option value="DRAFT">Draft Proposal</option>
                                    <option value="SENT">Negotiation / Sent</option>
                                    <option value="ACCEPTED">Won Matrix (Accepted)</option>
                                    <option value="REJECTED">Lost Protocol (Rejected)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">
                                    Reference No. / LPO
                                </label>
                                <input
                                    type="text"
                                    name="reference"
                                    value={formData.reference}
                                    onChange={handleChange}
                                    placeholder="e.g. REF-9902"
                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">
                                    Quotation Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="quotationDate"
                                    value={formData.quotationDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">
                                    Expiration Date
                                </label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Product Line Items Table */}
                    <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5 border-t-2 border-t-[#0178BC]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                    2
                                </div>
                                <h2 className="text-sm font-bold text-[#102A43]">Products & Commercial Line Items</h2>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="px-3 py-1 bg-[#0178BC] hover:bg-[#005A8C] text-white font-bold text-xs rounded transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <Plus size={14} /> Add Line Item
                            </button>
                        </div>

                        <div className="border border-[#D7E3EE] rounded-lg overflow-hidden mt-1">
                            <table className="w-full text-left text-xs text-[#102A43] border-collapse">
                                <thead className="bg-[#F8FAFC] border-b border-[#D7E3EE] font-bold text-[#60738E]">
                                    <tr>
                                        <th className="p-2.5 w-12 text-center">#</th>
                                        <th className="p-2.5">Product / Item</th>
                                        <th className="p-2.5 w-24 text-right">Qty</th>
                                        <th className="p-2.5 w-28 text-right">Rate (AED)</th>
                                        <th className="p-2.5 w-24 text-right">Tax (%)</th>
                                        <th className="p-2.5 w-32 text-right">Amount (AED)</th>
                                        <th className="p-2.5 w-12 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E8EEF7]">
                                    {formData.items.map((item, idx) => {
                                        const lineAmount = (parseFloat(item.rate || 0) * parseFloat(item.quantity || 0));
                                        const taxValue = item.taxExempt ? 0 : (lineAmount * parseFloat(item.taxPercentage || 0)) / 100;
                                        const totalLine = lineAmount + taxValue;

                                        return (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-2.5 text-center font-bold text-[#60738E]">{idx + 1}</td>
                                                <td className="p-2.5">
                                                    <select
                                                        value={item.selectedUniqueId || ''}
                                                        onChange={(e) => handleItemChange(idx, 'selectedUniqueId', e.target.value)}
                                                        className="w-full px-2.5 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-[#102A43] focus:border-[#0178BC] outline-none h-8 cursor-pointer"
                                                    >
                                                        <option value="">-- Select Product / Item --</option>
                                                        {selectData.products.map(p => (
                                                            <option key={p.uniqueId} value={p.uniqueId}>
                                                                {p.label} - AED {p.salesPrice || 0}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2.5">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                        className="w-full px-2.5 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-right font-medium text-[#102A43] focus:border-[#0178BC] outline-none h-8"
                                                    />
                                                </td>
                                                <td className="p-2.5">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.rate}
                                                        onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                                                        className="w-full px-2.5 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-right font-medium text-[#102A43] focus:border-[#0178BC] outline-none h-8"
                                                    />
                                                </td>
                                                <td className="p-2.5">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.1"
                                                        value={item.taxPercentage}
                                                        onChange={(e) => handleItemChange(idx, 'taxPercentage', e.target.value)}
                                                        className="w-full px-2.5 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-right font-medium text-[#102A43] focus:border-[#0178BC] outline-none h-8"
                                                    />
                                                </td>
                                                <td className="p-2.5 text-right font-bold text-[#102A43]">
                                                    AED {totalLine.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-2.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(idx)}
                                                        className="p-1 text-[#60738E] hover:text-red-600 rounded transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {formData.items.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="p-6 text-center text-xs text-[#60738E]">
                                                No line items added yet. Click <strong>Add Line Item</strong> above to select products for this deal.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Calculation Summary Footer */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-2">
                            <div className="w-full sm:w-1/2 grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">Total Discount (AED)</label>
                                    <input
                                        type="number"
                                        name="totalDiscount"
                                        min="0"
                                        step="0.01"
                                        value={formData.totalDiscount}
                                        onChange={handleChange}
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] outline-none h-8"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">Other Charges (AED)</label>
                                    <input
                                        type="number"
                                        name="otherCharges"
                                        min="0"
                                        step="0.01"
                                        value={formData.otherCharges}
                                        onChange={handleChange}
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] outline-none h-8"
                                    />
                                </div>
                            </div>

                            <div className="w-full sm:w-72 bg-[#F8FAFC] border border-[#D7E3EE] rounded-lg p-3 flex flex-col gap-1.5 text-xs">
                                <div className="flex justify-between text-[#60738E]">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold text-[#102A43]">AED {calculateSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-[#60738E]">
                                    <span>Tax Total:</span>
                                    <span className="font-semibold text-[#102A43]">AED {calculateTotalTax().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-[#60738E]">
                                    <span>Discount:</span>
                                    <span className="font-semibold text-red-600">- AED {parseFloat(formData.totalDiscount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-[#60738E]">
                                    <span>Other Charges:</span>
                                    <span className="font-semibold text-[#102A43]">AED {parseFloat(formData.otherCharges || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between pt-1.5 border-t border-[#D7E3EE] font-bold text-sm text-[#0178BC]">
                                    <span>Estimated Net Total:</span>
                                    <span>AED {calculateNetTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Notes & Terms */}
                    <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5 border-t-2 border-t-[#0178BC]">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                3
                            </div>
                            <h2 className="text-sm font-bold text-[#102A43]">Internal Notes & Terms</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">Internal Notes</label>
                                <textarea
                                    name="notes"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Optional internal remarks for the sales team..."
                                    className="w-full p-2.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">Terms & Conditions</label>
                                <textarea
                                    name="termsAndConditions"
                                    rows={3}
                                    value={formData.termsAndConditions}
                                    onChange={handleChange}
                                    placeholder="Commercial payment terms, warranty, or delivery conditions..."
                                    className="w-full p-2.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Quick Add Modals */}
            <QuickAddModal
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
                title="Quick Add Customer"
                fields={[
                    { name: 'companyName', label: 'Company / Customer Name', required: true, fullWidth: true },
                    { name: 'email', label: 'Email Address', type: 'email' },
                    { name: 'phone', label: 'Phone Number', type: 'tel' }
                ]}
                onSubmit={handleQuickAddCustomer}
            />

            <QuickAddModal
                isOpen={isEmployeeModalOpen}
                onClose={() => setIsEmployeeModalOpen(false)}
                title="Quick Add Employee Representative"
                fields={[
                    { name: 'firstName', label: 'First Name', required: true },
                    { name: 'lastName', label: 'Last Name', required: true },
                    { name: 'email', label: 'Work Email', type: 'email', required: true }
                ]}
                onSubmit={handleQuickAddEmployee}
            />

            <ValidationModal
                isOpen={isValidationModalOpen}
                onClose={() => setIsValidationModalOpen(false)}
                errors={validationErrorList}
            />
        </div>
    );
};

export default CrmDealFormPage;
