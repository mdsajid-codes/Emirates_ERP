import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Plus, Trash2, Save, Loader, ArrowLeft, Paperclip, Upload,
    ShoppingCart, Info, CheckCircle, AlertTriangle, Package,
    Truck, FileText, ChevronRight, X, MapPin,
    User,
    Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const Input = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
        <div className="relative group">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Icon size={16} />
                </div>
            )}
            <input
                {...props}
                className={`w-full ${Icon ? 'pl-10' : 'px-4'} py-3 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-300 placeholder:font-medium shadow-sm`}
            />
        </div>
    </div>
);

const Select = ({ label, children, icon: Icon, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
        <div className="relative group">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                    <Icon size={16} />
                </div>
            )}
            <select
                {...props}
                className={`w-full ${Icon ? 'pl-10' : 'px-4'} py-3 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none shadow-sm`}
            >
                {children}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                <ChevronRight size={16} className="rotate-90" />
            </div>
        </div>
    </div>
);

const TextArea = ({ label, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
        <textarea
            {...props}
            className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-300 placeholder:font-medium shadow-sm"
        />
    </div>
);

const PurchaseOrderForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const isEditing = !!id;
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        locationId: '',
        orderCategory: 'Domestic',
        supplierId: '',
        poNumber: '',
        reference: '',
        date: new Date().toISOString().split('T')[0],
        projectNumber: '',
        discountMode: 'Without Discount',
        currency: 'AED',
        remark: '',
        deliverToType: 'Organization',
        deliverToId: '',
        deliverToAddress: '',
        template: 'Standard',
        emailTo: '',
        status: 'Draft',
        createdBy: '',
        items: [],
        attachments: [],
        termsAndConditions: '',
        notes: '',
        otherCharges: 0
    });

    const [loading, setLoading] = useState(false);
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [error, setError] = useState(null);

    const [suppliers, setSuppliers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);
    const [units, setUnits] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({});

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [
                    rawRes, unitRes, taxRes, catRes, supRes, locRes, custRes
                ] = await Promise.all([
                    axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/production/units`, { headers, params: { page: 0, size: 500 } }),
                    axios.get(`${API_URL}/production/taxes`, { headers, params: { page: 0, size: 100 } }),
                    axios.get(`${API_URL}/production/categories`, { headers, params: { page: 0, size: 500 } }),
                    axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } }),
                    axios.get(`${API_URL}/locations`, { headers }),
                    axios.get(`${API_URL}/parties`, { headers, params: { type: 'CUSTOMER', page: 0, size: 500 } })
                ]);

                setRawMaterials(rawRes.data.content ?? rawRes.data ?? []);
                setUnits(unitRes.data.content ?? unitRes.data ?? []);
                setTaxes(taxRes.data.content ?? taxRes.data ?? []);
                setCategories(catRes.data.content ?? catRes.data ?? []);
                setSuppliers(supRes.data.content ?? supRes.data ?? []);
                setLocations(Array.isArray(locRes.data) ? locRes.data : (locRes.data.content ?? []));
                setCustomers(custRes.data.content ?? custRes.data ?? []);

                if (isEditing) {
                    const poRes = await axios.get(`${API_URL}/purchases/orders/${id}`, { headers });
                    const po = poRes.data;

                    const attachmentsWithUrl = (po.attachments ?? []).map(a => ({
                        ...a,
                        url: a.url || (a.filePath ? `${API_URL.replace(/\/$/, '')}/uploads/${a.filePath}` : null)
                    }));

                    setForm(prev => ({
                        ...prev,
                        ...po,
                        date: po.date ? new Date(po.date).toISOString().split('T')[0] : prev.date,
                        attachments: attachmentsWithUrl,
                        items: (po.items ?? []).map(it => ({
                            ...it,
                            taxExempt: !!it.taxExempt,
                            taxPercent: it.taxPercent ?? ''
                        }))
                    }));

                    const catIds = Array.from(new Set((po.items ?? []).map(it => it.categoryId).filter(Boolean)));
                    await Promise.all(catIds.map(cid => fetchSubCategoriesForCategory(cid)));
                }
            } catch (err) {
                console.error('Failed to load data', err);
                setError('System failed to synchronize with production databases. Please check connectivity.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, isEditing]);

    // State for indent ID if created from indent or requisition
    const [sourceIndentId, setSourceIndentId] = useState(null);
    const [sourceRequisitionId, setSourceRequisitionId] = useState(null);

    useEffect(() => {
        if (location.state?.indentData && !isEditing) {
            const { items, reference, remark, indentId } = location.state.indentData;
            if (indentId) setSourceIndentId(indentId);

            setForm(prev => ({
                ...prev,
                reference: reference || prev.reference,
                remark: remark || prev.remark,
                items: items.map((item, index) => ({
                    lineNumber: index + 1,
                    categoryId: '',
                    subCategoryId: '',
                    itemId: item.itemId,
                    description: item.description,
                    quantity: item.quantity,
                    unitId: item.unitId || '',
                    rate: item.rate || 0,
                    taxId: item.taxId || '',
                    taxExempt: false,
                    taxPercent: '',
                    lineDiscount: 0
                }))
            }));
        }

        if (location.state?.requisitionData && !isEditing) {
            const req = location.state.requisitionData;
            
            if (req.id) {
                setSourceRequisitionId(req.id);
            }

            const mappedItems = (req.items || []).map((item, index) => ({
                lineNumber: index + 1,
                categoryId: '', 
                subCategoryId: '',
                itemId: item.itemId || '',
                description: [item.itemName, item.content].filter(Boolean).join(' - ') || item.description || '',
                quantity: item.quantity || 1,
                unitId: item.uom || '', 
                rate: 0,
                taxId: '',
                taxExempt: false,
                taxPercent: '',
                lineDiscount: 0
            }));

            setForm(prev => ({
                ...prev,
                reference: req.basis || req.requisitionNumber || prev.reference,
                remark: req.comment || prev.remark,
                items: mappedItems
            }));
        }
    }, [location.state, isEditing]);

    const fetchSubCategoriesForCategory = async (categoryId) => {
        if (!categoryId) return [];
        if (subCategoriesByCategory[categoryId]) return subCategoriesByCategory[categoryId];
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/production/sub-categories`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { categoryId }
            });
            const arr = res.data.content ?? res.data ?? [];
            setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: arr }));
            return arr;
        } catch (err) {
            setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: [] }));
            return [];
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
    };

    const handleDeliverToIdChange = (e) => {
        const { value } = e.target;
        const idVal = value ? Number(value) : '';
        let address = '';

        if (form.deliverToType === 'Organization') {
            const loc = locations.find(l => l.id === idVal);
            if (loc) address = [loc.address, loc.city, loc.state, loc.country].filter(Boolean).join(', ');
        } else {
            const cust = customers.find(c => c.id === idVal);
            if (cust) address = [cust.billingAddress, cust.city, cust.country].filter(Boolean).join(', ');
        }
        setForm(prev => ({ ...prev, deliverToId: idVal, deliverToAddress: address }));
    };

    const toggleDeliverToType = (type) => {
        setForm(prev => ({ ...prev, deliverToType: type, deliverToId: '', deliverToAddress: '' }));
    };

    const handleItemChange = (idx, e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => {
            const items = [...prev.items];
            items[idx] = {
                ...items[idx],
                [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value)
            };
            return { ...prev, items };
        });
    };

    const addItem = () => {
        setForm(prev => ({
            ...prev,
            items: [...prev.items, {
                lineNumber: prev.items.length + 1,
                categoryId: '',
                subCategoryId: '',
                itemId: '',
                description: '',
                quantity: 1,
                unitId: '',
                rate: 0,
                taxId: '',
                taxExempt: false,
                taxPercent: '',
                lineDiscount: 0
            }]
        }));
    };

    const removeItem = (idx) => {
        setForm(prev => {
            const items = prev.items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, lineNumber: i + 1 }));
            return { ...prev, items };
        });
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files) setAttachmentFiles(prev => [...prev, ...Array.from(files)]);
    };

    const removeNewFile = (index) => setAttachmentFiles(prev => prev.filter((_, i) => i !== index));

    const removeExistingAttachment = async (attId) => {
        if (!window.confirm('Delete this attachment permanently?')) return;
        setForm(prev => ({ ...prev, attachments: prev.attachments.filter(a => a.id !== attId) }));
    };

    const totals = useMemo(() => {
        let subTotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;
        (form.items || []).forEach(it => {
            const qty = Number(it.quantity) || 0;
            const rate = Number(it.rate) || 0;
            const lineDiscount = Number(it.lineDiscount) || 0;
            const amount = qty * rate;
            const net = Math.max(0, amount - lineDiscount);

            subTotal += amount;
            totalDiscount += lineDiscount;

            const taxMaster = taxes.find(t => String(t.id) === String(it.taxId));
            const taxRate = Number(it.taxPercent !== '' ? it.taxPercent : (taxMaster ? taxMaster.rate : 0)) || 0;

            if (!it.taxExempt && taxRate > 0) totalTax += net * (taxRate / 100);
        });

        const otherCharges = Number(form.otherCharges) || 0;
        const totalAmount = (subTotal - totalDiscount) + totalTax + otherCharges;
        return { subTotal, totalDiscount, totalTax, otherCharges, totalAmount };
    }, [form.items, form.otherCharges, taxes]);

    const validate = () => {
        if (!form.locationId) return 'Operational location is required';
        if (!form.date) return 'Manifest date is required';
        if (form.items.length === 0) return 'Procurement manifest requires at least one item';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v = validate();
        if (v) { setError(v); window.scrollTo(0, 0); return; }

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

            const orderPayload = {
                ...form,
                items: form.items.map(it => ({
                    ...it,
                    categoryId: it.categoryId || null,
                    subCategoryId: it.subCategoryId || null,
                    itemId: it.itemId || null,
                    description: it.description || null,
                    taxId: it.taxId || null,
                    taxPercent: it.taxPercent !== '' ? Number(it.taxPercent) : null,
                    lineDiscount: Number(it.lineDiscount) || 0
                })),
                attachments: undefined,
                otherCharges: Number(form.otherCharges) || 0
            };

            let savedOrder;
            if (isEditing) {
                const response = await axios.put(`${API_URL}/purchases/orders/${id}`, orderPayload, { headers });
                savedOrder = response.data;
            } else {
                const response = await axios.post(`${API_URL}/purchases/orders`, orderPayload, { headers });
                savedOrder = response.data;
            }

            if (attachmentFiles.length > 0) {
                const attachmentPayload = new FormData();
                attachmentFiles.forEach(file => attachmentPayload.append('files', file));
                if (form.createdBy) attachmentPayload.append('uploadedBy', form.createdBy);

                await axios.post(`${API_URL}/purchases/orders/${savedOrder.id}/attachments`, attachmentPayload, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
                });
            }

            if (sourceIndentId && !isEditing) {
                try {
                    await axios.patch(`${API_URL}/material-indents/po-status/${sourceIndentId}`,
                        { createPoStatus: 'CREATED' },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                } catch (statusErr) {
                    console.error("Failed to update Indent PO status:", statusErr);
                }
            }

            // If created from Requisition, update Requisition Status
            if (sourceRequisitionId && !isEditing) {
                try {
                    await axios.patch(`${API_URL}/purchases/requisitions/${sourceRequisitionId}/status`, null, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { status: 'COMPLETED' }
                    });
                } catch (statusErr) {
                    console.error("Failed to update Requisition status:", statusErr);
                }
            }
            navigate('/purchase-dashboard/purchase-orders');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Fatal error during order processing.');
            window.scrollTo(0, 0);
        } finally { setLoading(false); }
    };

    if (loading && !isEditing) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center">
                <Loader className="h-12 w-12 animate-[spin_2s_linear_infinite] text-indigo-600" />
                <p className="mt-4 font-black text-indigo-900/40 uppercase tracking-widest text-xs animate-pulse">Initializing Procurement Workspace...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/purchase-dashboard/purchase-orders"
                            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                                {isEditing ? "Modify" : "Create"} <span className="text-indigo-600">Purchase</span> Order
                            </h1>
                            <p className="text-sm font-medium text-slate-400">
                                {isEditing ? `Synchronizing updates for manifest #${form.poNumber}` : "Drafting a new procurement request for approval"}
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-rose-50 border border-rose-100 p-4 rounded-3xl flex items-center gap-3 text-rose-600 shadow-sm"
                    >
                        <AlertTriangle size={20} />
                        <span className="text-sm font-bold">{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-rose-100 rounded-full transition-colors">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-12 pb-24">
                    {/* Section 1: Core Metadata */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-2xl shadow-indigo-900/5 p-8 md:p-12 space-y-10">
                        <div className="flex items-center gap-4 border-b border-indigo-50 pb-8">
                            <div className="p-4 bg-indigo-500/10 rounded-[1.25rem] text-indigo-600">
                                <Info size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Core Metadata</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Administrative Manifest Headers
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
                            <Select label="Operational Location" name="locationId" value={form.locationId} onChange={handleChange} icon={MapPin} required>
                                <option value="">Select Location</option>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </Select>

                            <Select label="Classification" name="orderCategory" value={form.orderCategory} onChange={handleChange} icon={Package}>
                                <option value="Domestic">Domestic Protocol</option>
                                <option value="Imported">Import Protocol</option>
                            </Select>

                            <Select label="Strategic Vendor" name="supplierId" value={form.supplierId} onChange={handleChange} icon={User}>
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName || s.name || `${s.firstName} ${s.lastName}`}</option>)}
                            </Select>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Settlement Currency</label>
                                <div className="px-6 py-4 bg-indigo-600 rounded-2xl text-sm font-black text-white shadow-xl shadow-indigo-500/20 flex items-center justify-between">
                                    <span className="opacity-60">United Arab Emirates</span>
                                    <span>{form.currency} (AED)</span>
                                </div>
                            </div>

                            <Input label="System Reference" name="poNumber" value={form.poNumber} onChange={handleChange} icon={FileText} placeholder="PENDING ALLOCATION" disabled={!isEditing && !form.poNumber} />
                            <Input label="External Reference" name="reference" value={form.reference} onChange={handleChange} icon={Truck} placeholder="Vendor Doc #" />
                            <Input label="Execution Date" name="date" type="date" value={form.date} onChange={handleChange} icon={Calendar} required />
                            <Input label="Project Attribution" name="projectNumber" value={form.projectNumber} onChange={handleChange} icon={FileText} placeholder="PRJ-XXXX" />
                            <Input label="Internal Note" name="remark" value={form.remark} onChange={handleChange} icon={Plus} placeholder="Context for auditors..." />
                        </div>
                    </div>

                    {/* Section 2: Line Items */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-2xl shadow-indigo-900/5 overflow-hidden">
                        <div className="p-8 md:p-12 space-y-8 pb-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-indigo-50 pb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-indigo-500/10 rounded-[1.25rem] text-indigo-600">
                                        <ShoppingCart size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Procurement Items</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Line Item Specifications
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <select
                                        name="discountMode"
                                        value={form.discountMode}
                                        onChange={handleChange}
                                        className="bg-slate-100/50 border-none outline-none px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-indigo-500 transition-all"
                                    >
                                        <option value="Without Discount">No Discounting</option>
                                        <option value="Item level">Item-Level Discount</option>
                                        <option value="Order level">Order-Level Discount</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/30 transition-all active:scale-95"
                                    >
                                        <Plus size={16} /> Add Position
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Material Specification</th>
                                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-48 text-center">Quantities</th>
                                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-48 text-center">Unit Price</th>
                                        {form.discountMode === 'Item level' && (
                                            <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-32 text-center">Incentive</th>
                                        )}
                                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-48 text-center">Tax Protocol</th>
                                        <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-48 text-right">Net Value</th>
                                        <th className="px-8 py-6 w-20"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/50">
                                    <AnimatePresence mode="popLayout">
                                        {form.items.map((it, idx) => {
                                            const qty = Number(it.quantity) || 0;
                                            const rate = Number(it.rate) || 0;
                                            const discount = Number(it.lineDiscount) || 0;
                                            const amount = Math.max(0, (qty * rate) - discount);

                                            return (
                                                <motion.tr
                                                    layout
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    key={idx}
                                                    className="group hover:bg-indigo-50/30 transition-colors"
                                                >
                                                    <td className="px-12 py-8 align-top">
                                                        <div className="space-y-4">
                                                            <div className="flex gap-3">
                                                                <select
                                                                    name="categoryId"
                                                                    value={it.categoryId}
                                                                    onChange={async (e) => {
                                                                        handleItemChange(idx, e);
                                                                        await fetchSubCategoriesForCategory(e.target.value);
                                                                    }}
                                                                    className="w-1/2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                                                                >
                                                                    <option value="">Category</option>
                                                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                                </select>
                                                                <select
                                                                    name="subCategoryId"
                                                                    value={it.subCategoryId}
                                                                    onChange={e => handleItemChange(idx, e)}
                                                                    className="w-1/2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                                                                >
                                                                    <option value="">Sub-Category</option>
                                                                    {(subCategoriesByCategory[it.categoryId] || []).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                                                                </select>
                                                            </div>
                                                            <select
                                                                name="itemId"
                                                                value={it.itemId}
                                                                onChange={e => handleItemChange(idx, e)}
                                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                                                            >
                                                                <option value="">Define Item Identifier</option>
                                                                {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                                            </select>
                                                            <input
                                                                name="description"
                                                                value={it.description}
                                                                onChange={e => handleItemChange(idx, e)}
                                                                placeholder="Detailed technical specifications..."
                                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-500 outline-none focus:bg-white focus:border-indigo-100 transition-all"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-8 align-top">
                                                        <div className="space-y-3">
                                                            <input
                                                                type="number"
                                                                name="quantity"
                                                                value={it.quantity}
                                                                onChange={e => handleItemChange(idx, e)}
                                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-center text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                                                min="0"
                                                            />
                                                            <select
                                                                name="unitId"
                                                                value={it.unitId}
                                                                onChange={e => handleItemChange(idx, e)}
                                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-center text-slate-400 outline-none focus:bg-white focus:border-indigo-100 transition-all"
                                                            >
                                                                <option value="">UOM</option>
                                                                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-8 align-top">
                                                        <div className="relative group/price">
                                                            <input
                                                                type="number"
                                                                name="rate"
                                                                value={it.rate}
                                                                onChange={e => handleItemChange(idx, e)}
                                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-center text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                                                min="0"
                                                            />
                                                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none opacity-20 text-xs font-black">
                                                                {form.currency}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {form.discountMode === 'Item level' && (
                                                        <td className="px-6 py-8 align-top">
                                                            <input
                                                                type="number"
                                                                name="lineDiscount"
                                                                value={it.lineDiscount}
                                                                onChange={e => handleItemChange(idx, e)}
                                                                className="w-full px-4 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-center text-sm font-black outline-none focus:ring-2 focus:ring-emerald-500"
                                                                min="0"
                                                            />
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-8 align-top">
                                                        <div className="space-y-3">
                                                            <select
                                                                name="taxId"
                                                                value={it.taxId}
                                                                onChange={e => handleItemChange(idx, e)}
                                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-center text-[10px] font-black text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                                            >
                                                                <option value="">No Levy</option>
                                                                {taxes.map(t => <option key={t.id} value={t.id}>{t.code} ({t.rate}%)</option>)}
                                                            </select>
                                                            <label className="flex items-center justify-center gap-2 cursor-pointer group/exempt">
                                                                <input
                                                                    type="checkbox"
                                                                    name="taxExempt"
                                                                    checked={it.taxExempt}
                                                                    onChange={e => handleItemChange(idx, e)}
                                                                    className="w-4 h-4 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                                                />
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/exempt:text-indigo-500 transition-colors">Exempt</span>
                                                            </label>
                                                        </div>
                                                    </td>
                                                    <td className="px-12 py-11 text-right align-top">
                                                        <span className="text-xl font-black text-slate-800 tabular-nums">
                                                            {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-10 text-center align-top">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(idx)}
                                                            className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-95"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                            {form.items.length === 0 && (
                                <div className="p-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                        <Package size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-xs">Awaiting Line Entry</p>
                                        <p className="text-sm font-bold text-slate-300">Click "Add Position" to populate the manifest</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Summary & Totals */}
                        <div className="p-12 bg-slate-50/50 border-t border-indigo-50 flex flex-col md:flex-row justify-between gap-12">
                            <div className="w-full md:w-1/2 space-y-6">
                                <div className="p-6 bg-white/50 rounded-[2rem] border border-white p-8 space-y-4 shadow-sm">
                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <Info size={14} className="text-indigo-500" /> Procurement Intelligence
                                    </h4>
                                    <p className="text-sm font-bold text-slate-500 leading-relaxed italic">
                                        "Automated tax calculations and discount protocols are applied based on your classification settings. Ensure vendor tax IDs are validated before manifest finalization."
                                    </p>
                                </div>
                            </div>
                            <div className="w-full md:w-1/3 space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                                        <span>Gross Manifest Value</span>
                                        <span className="text-slate-600 tabular-nums">{totals.subTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-xl">
                                        <span>Consolidated Discounts</span>
                                        <span className="tabular-nums">- {totals.totalDiscount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold text-amber-500">
                                        <span>Taxation Levies</span>
                                        <span className="tabular-nums">+ {totals.totalTax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-400">Additional Charges</span>
                                        <div className="relative w-32">
                                            <input
                                                type="number"
                                                name="otherCharges"
                                                value={form.otherCharges}
                                                onChange={handleChange}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-right text-sm font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                            />
                                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none opacity-20 text-[10px] font-black">
                                                FIXED
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6 border-t-2 border-dashed border-indigo-100 mt-6 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Manifest Value</p>
                                        <p className="text-4xl font-black text-indigo-600 tabular-nums tracking-tighter">
                                            {totals.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black rounded-lg shadow-lg shadow-indigo-500/20">
                                            {form.currency}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Strategic Logistics & Documentation */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Attachments */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-2xl shadow-indigo-900/5 p-8 md:p-12 space-y-8">
                            <div className="flex items-center gap-4 border-b border-indigo-50 pb-8">
                                <div className="p-4 bg-indigo-500/10 rounded-[1.25rem] text-indigo-600">
                                    <Paperclip size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Documentation</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Digital Artifacts
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-10 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
                                    <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
                                    <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                                        <div className="p-5 bg-white shadow-lg rounded-full text-indigo-500 group-hover:scale-110 transition-transform">
                                            <Upload size={32} />
                                        </div>
                                        <div className="mt-4 text-center">
                                            <p className="text-sm font-black text-slate-700">Select Procurement Docs</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">PDF, Image, or Zip</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <AnimatePresence>
                                        {form.attachments.map(att => (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                key={att.id}
                                                className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between group shadow-sm"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <FileText size={18} className="text-indigo-400 shrink-0" />
                                                    <span
                                                        className="text-xs font-bold text-slate-600 truncate cursor-pointer hover:text-indigo-600"
                                                        onClick={() => att.url && window.open(att.url, '_blank')}
                                                    >
                                                        {att.fileName}
                                                    </span>
                                                </div>
                                                <button type="button" onClick={() => removeExistingAttachment(att.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </motion.div>
                                        ))}
                                        {attachmentFiles.map((f, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={`new-${i}`}
                                                className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between group shadow-sm"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="relative">
                                                        <FileText size={18} className="text-indigo-600 shrink-0" />
                                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                                                    </div>
                                                    <span className="text-xs font-black text-indigo-700 truncate">{f.name}</span>
                                                </div>
                                                <button type="button" onClick={() => removeNewFile(i)} className="p-2 text-indigo-300 hover:text-rose-500 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Configuration */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-2xl shadow-indigo-900/5 p-8 md:p-12 space-y-8">
                            <div className="flex items-center gap-4 border-b border-indigo-50 pb-8">
                                <div className="p-4 bg-indigo-500/10 rounded-[1.25rem] text-indigo-600">
                                    <Truck size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Logistics Protocol</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Fulfillment Configuration
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-4 p-2 bg-slate-100/50 rounded-2xl">
                                    {['Organization', 'Customer'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => toggleDeliverToType(type)}
                                            className={`py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${form.deliverToType === type
                                                ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-500/10'
                                                : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                        >
                                            {type} Destination
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    <Select
                                        label="Strategic Destination"
                                        value={form.deliverToId}
                                        onChange={handleDeliverToIdChange}
                                        icon={MapPin}
                                    >
                                        <option value="">Select Endpoint</option>
                                        {form.deliverToType === 'Organization'
                                            ? locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)
                                            : customers.map(c => <option key={c.id} value={c.id}>{c.companyName || `${c.firstName} ${c.lastName}`}</option>)
                                        }
                                    </Select>

                                    <TextArea
                                        label="Precision Address"
                                        placeholder="Full geographic coordinates..."
                                        rows={3}
                                        value={form.deliverToAddress}
                                        onChange={(e) => setForm(prev => ({ ...prev, deliverToAddress: e.target.value }))}
                                        icon={Truck}
                                    />

                                    <Input label="Notification Email" name="emailTo" value={form.emailTo} onChange={handleChange} icon={Plus} placeholder="stakeholder@enterprise.com" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Terms & Notes */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-2xl shadow-indigo-900/5 p-8 md:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <TextArea
                                label="Compliance Terms & Conditions"
                                name="termsAndConditions"
                                value={form.termsAndConditions}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Legal framework for this procurement..."
                            />
                            <TextArea
                                label="Strategic Operational Notes"
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Displayed on public-facing manifest..."
                            />
                        </div>
                    </div>

                    {/* Form Submission Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-12 border-t border-slate-200">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Template</span>
                                <span className="text-sm font-black text-indigo-600 mt-1 flex items-center gap-2">
                                    <FileText size={16} /> Enterprise Standard V2.0
                                </span>
                            </div>
                            <div className="w-px h-10 bg-slate-200" />
                            <div className="flex flex-col text-slate-400">
                                <span className="text-[10px] font-black uppercase tracking-widest">Status</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-xs font-bold">Drafting Workspace</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => navigate('/purchase-dashboard/purchase-orders')}
                                className="flex-1 sm:flex-none px-10 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all active:scale-95"
                            >
                                Abort
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-12 py-4 bg-indigo-600 text-white rounded-[1.25rem] text-xs font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                            >
                                {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                {isEditing ? 'Commit Updates' : 'Authorize Manifest'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PurchaseOrderForm;
