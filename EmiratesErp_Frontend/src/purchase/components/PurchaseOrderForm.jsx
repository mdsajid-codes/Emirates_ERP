import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Plus, Trash2, Save, Loader, ArrowLeft, Paperclip, Upload,
    ShoppingCart, Info, CheckCircle, AlertTriangle, Package,
    Truck, FileText, ChevronRight, X, MapPin,
    User,
    Calendar, Search, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LocationModal from '../../components/base/LocationModal';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const SearchableItemSelect = ({ items, value, onChange, placeholder = "Select Item" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    const selectedItem = useMemo(() => {
        return items.find(i => String(i.id) === String(value));
    }, [items, value]);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        const lower = searchTerm.toLowerCase();
        return items.filter(i =>
            (i.label && i.label.toLowerCase().includes(lower)) ||
            (i.name && i.name.toLowerCase().includes(lower)) ||
            (i.itemCode && i.itemCode.toLowerCase().includes(lower))
        );
    }, [items, searchTerm]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] flex items-center justify-between outline-none focus:border-[var(--color-primary,#00A9A8)] cursor-pointer min-h-[30px]"
            >
                <span className="truncate pr-1">
                    {selectedItem ? (selectedItem.label || selectedItem.name || selectedItem.itemCode) : placeholder}
                </span>
                <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 left-0 min-w-[280px] mt-1 bg-white border border-[#D8E2F1] rounded-md shadow-xl max-h-60 overflow-y-auto">
                    <div className="p-1.5 sticky top-0 bg-white border-b border-[#E4EAF0] z-10">
                        <div className="relative flex items-center">
                            <Search size={13} className="absolute left-2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search item code/name..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-7 pr-2 py-1 bg-slate-50 border border-[#D8E2F1] rounded text-xs outline-none focus:border-[var(--color-primary,#00A9A8)]"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="py-1">
                        {filteredItems.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-slate-400 text-center">No matching items</div>
                        ) : (
                            filteredItems.map(item => {
                                const isSelected = String(item.id) === String(value);
                                return (
                                    <div
                                        key={`${item.type}-${item.id}`}
                                        onClick={() => {
                                            onChange({ target: { name: 'itemId', value: item.id } });
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                        className={`px-2.5 py-1.5 text-xs cursor-pointer flex items-center justify-between transition-colors ${isSelected ? 'bg-indigo-50 font-semibold text-[var(--color-primary,#00A9A8)]' : 'hover:bg-slate-50 text-[#102A5B]'
                                            }`}
                                    >
                                        <span className="truncate">{item.label || item.name || item.itemCode}</span>
                                        {isSelected && <CheckCircle size={12} className="text-[var(--color-primary,#00A9A8)] shrink-0 ml-1.5" />}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

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
    const { isRTL } = useLanguage();
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
        discountMode: 'Without Discount', // Without Discount | Item Level | Order Level
        orderDiscountPercentage: 0,
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

    // Location Modal state
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [locationModalLoading, setLocationModalLoading] = useState(false);

    const handleSaveLocation = async (locationData) => {
        setLocationModalLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/locations`, locationData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newLoc = res.data;
            setLocations(prev => [...prev, newLoc]);
            setForm(prev => ({
                ...prev,
                deliverToId: newLoc.id,
                deliverToAddress: [newLoc.address, newLoc.city, newLoc.state, newLoc.country].filter(Boolean).join(', ')
            }));
            setIsLocationModalOpen(false);
        } catch (err) {
            console.error('Failed to create location:', err);
            setError('Failed to create location.');
        } finally {
            setLocationModalLoading(false);
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [
                    rawRes, sfRes, fgRes, prodRes, unitRes, taxRes, catRes, supRes, locRes, custRes
                ] = await Promise.all([
                    axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/production/semi-finished`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/production/finished-goods`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/crm/sales-products`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/production/units`, { headers, params: { page: 0, size: 500 } }),
                    axios.get(`${API_URL}/production/taxes`, { headers, params: { page: 0, size: 100 } }),
                    axios.get(`${API_URL}/production/categories`, { headers, params: { page: 0, size: 500 } }),
                    axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } }),
                    axios.get(`${API_URL}/locations`, { headers }),
                    axios.get(`${API_URL}/parties`, { headers, params: { type: 'CUSTOMER', page: 0, size: 500 } })
                ]);

                const getList = (res) => Array.isArray(res.data) ? res.data : (res.data.content || []);

                const products = getList(prodRes).map(p => ({ ...p, type: 'PRODUCT', label: `${p.name} (${p.itemCode || 'PRD'}) - CRM Product` }));
                const rawMaterials = getList(rawRes).map(r => ({ ...r, type: 'RAW_MATERIAL', label: `${r.name} (${r.itemCode || 'RM'}) - Raw Material` }));
                const semiFinished = getList(sfRes).map(s => ({ ...s, type: 'SEMI_FINISHED', label: `${s.name} (${s.itemCode || 'SF'}) - Semi-Finished` }));
                const finishedGoods = getList(fgRes).map(f => ({ ...f, type: 'FINISHED_GOOD', label: `${f.name} (${f.itemCode || 'FG'}) - Finished Good` }));

                const compiledItems = [...products, ...rawMaterials, ...semiFinished, ...finishedGoods];

                setRawMaterials(compiledItems);
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
            const currentItem = { ...items[idx] };

            if (name === 'itemId') {
                const itemIdVal = value ? (type === 'number' ? Number(value) : value) : '';
                currentItem.itemId = itemIdVal;

                // Auto-fill item description, rate, and unit if selected
                const mat = rawMaterials.find(m => String(m.id) === String(itemIdVal));
                if (mat) {
                    currentItem.description = mat.description || mat.name || '';

                    // Extract rate / unit price from various potential properties
                    const extractedRate = mat.unitPrice ?? mat.purchaseRate ?? mat.price ?? mat.costPrice ?? mat.salesPrice ?? mat.rate ?? 0;
                    currentItem.rate = Number(extractedRate) || 0;

                    // Extract unitId or match by unit name/code in units master
                    const uId = mat.unitId || mat.unit?.id;
                    if (uId) {
                        currentItem.unitId = uId;
                    } else if (mat.unit || mat.uom || mat.unitName) {
                        const targetUomName = String(mat.unit || mat.uom || mat.unitName).toLowerCase();
                        const matchedUnit = units.find(u =>
                            String(u.name || u.code || '').toLowerCase() === targetUomName
                        );
                        if (matchedUnit) {
                            currentItem.unitId = matchedUnit.id;
                        }
                    }
                }
            } else {
                currentItem[name] = type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value);
            }

            items[idx] = currentItem;
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
        let itemDiscounts = 0;
        let totalTax = 0;

        (form.items || []).forEach(it => {
            const qty = Number(it.quantity) || 0;
            const rate = Number(it.rate) || 0;
            const amount = qty * rate;
            subTotal += amount;

            let lineDiscountVal = 0;
            if (form.discountMode === 'Item Level') {
                const discPercent = Number(it.lineDiscount) || 0;
                lineDiscountVal = amount * (discPercent / 100);
            }
            itemDiscounts += lineDiscountVal;

            const taxableAmount = Math.max(0, amount - lineDiscountVal);
            const taxMaster = taxes.find(t => String(t.id) === String(it.taxId));
            const taxRate = Number(it.taxPercent !== '' && it.taxPercent !== undefined ? it.taxPercent : (taxMaster ? taxMaster.rate : 0)) || 0;

            if (!it.taxExempt && taxRate > 0) {
                totalTax += taxableAmount * (taxRate / 100);
            }
        });

        let totalDiscount = 0;
        if (form.discountMode === 'Item Level') {
            totalDiscount = itemDiscounts;
        } else if (form.discountMode === 'Order Level') {
            const orderDiscPercent = Number(form.orderDiscountPercentage) || 0;
            totalDiscount = subTotal * (orderDiscPercent / 100);
        }

        const otherCharges = Number(form.otherCharges) || 0;
        const totalAmount = Math.max(0, subTotal - totalDiscount) + totalTax + otherCharges;
        return { subTotal, totalDiscount, totalTax, otherCharges, totalAmount };
    }, [form.items, form.discountMode, form.orderDiscountPercentage, form.otherCharges, taxes]);

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
                items: form.items.map(it => {
                    const selMat = rawMaterials.find(m => String(m.id) === String(it.itemId));
                    const type = selMat?.type;
                    const numId = it.itemId ? Number(it.itemId) : null;

                    return {
                        ...it,
                        categoryId: it.categoryId || null,
                        subCategoryId: it.subCategoryId || null,
                        itemId: numId,
                        crmProductId: type === 'PRODUCT' ? numId : null,
                        rawMaterialId: type === 'RAW_MATERIAL' ? numId : null,
                        semiFinishedId: type === 'SEMI_FINISHED' ? numId : null,
                        finishedGoodId: type === 'FINISHED_GOOD' ? numId : null,
                        description: it.description || null,
                        taxId: it.taxId || null,
                        taxPercent: it.taxPercent !== '' ? Number(it.taxPercent) : null,
                        lineDiscount: Number(it.lineDiscount) || 0
                    };
                }),
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
        <div className="w-full min-h-screen bg-[#f8fafc] p-2 sm:p-3 lg:p-4 font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-full space-y-3">
                {/* Header Area based on Figma Spec */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                        <h1 className="text-[24px] sm:text-[28px] font-bold text-[#102A5B] leading-tight tracking-tight">
                            {isEditing ? (isRTL ? 'تعديل أمر الشراء' : 'Edit Purchase Order') : (isRTL ? 'إنشاء أمر شراء' : 'Create Purchase Order')}
                        </h1>
                        <p className="text-[12px] font-normal text-[#5F6F91]">
                            {isRTL ? 'إنشاء وإدارة أوامر الشراء الخاصة بك' : 'Create and manage your procurement orders'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={(e) => { setForm(prev => ({ ...prev, status: 'Draft' })); handleSubmit(e); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DCE5F3] rounded-[5.29px] text-[12px] font-semibold text-[#102A5B] hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                    >
                        <Save size={16} className="text-[#102A5B]" />
                        <span>{isRTL ? 'حفظ كمسودة' : 'Save as Draft'}</span>
                    </button>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-3 text-rose-600 shadow-xs text-xs font-semibold"
                    >
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-rose-100 rounded-full transition-colors">
                            <X size={14} />
                        </button>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3 pb-16">
                    {/* SECTION 1: PO DETAILS */}
                    <div className="bg-white border border-[#DCE5F3] rounded-[11.86px] p-3 space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-[22px] h-[22px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[11px] font-bold flex items-center justify-center">
                                    1
                                </div>
                                <h2 className="text-[18px] font-semibold text-[#102A5B]">
                                    {isRTL ? 'تفاصيل أمر الشراء' : 'PO Details'}
                                </h2>
                            </div>
                            <button type="button" className="flex items-center gap-1 text-[12px] font-semibold text-[#102A5B] hover:opacity-80">
                                <span>{isRTL ? 'طَي' : 'Collapse'}</span>
                                <ChevronRight size={12} className={`rotate-90 ${isRTL ? '-rotate-90' : ''}`} />
                            </button>
                        </div>

                        {/* PO Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3.5">
                            {/* Operating Location */}
                            <div className="space-y-1">
                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                    {isRTL ? 'موقع التشغيل' : 'Operating Location'} <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="locationId"
                                    value={form.locationId}
                                    onChange={handleChange}
                                    className="w-full h-[31.72px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-semibold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                    required
                                >
                                    <option value="">{isRTL ? 'حدد الموقع' : 'Select Location'}</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>

                            {/* Purchasing Group / Order Category */}
                            <div className="space-y-1">
                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                    {isRTL ? 'فئة الطلب' : 'Order Category'} <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="orderCategory"
                                    value={form.orderCategory}
                                    onChange={handleChange}
                                    className="w-full h-[31.72px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-semibold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                >
                                    <option value="Domestic">{isRTL ? 'محلي' : 'Domestic'}</option>
                                    <option value="Imported">{isRTL ? 'مستورد' : 'Imported'}</option>
                                </select>
                            </div>

                            {/* PO Number */}
                            <div className="space-y-1">
                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                    {isRTL ? 'رقم أمر الشراء' : 'PO Number'}
                                </label>
                                <input
                                    type="text"
                                    name="poNumber"
                                    value={form.poNumber}
                                    onChange={handleChange}
                                    placeholder={isRTL ? 'توليد تلقائي' : 'Auto-generated'}
                                    className="w-full h-[32.39px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-normal text-[#5F6F91] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                />
                            </div>

                            {/* PO Date */}
                            <div className="space-y-1">
                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                    {isRTL ? 'تاريخ أمر الشراء' : 'PO Date'} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    className="w-full h-[32.39px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-normal text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                    required
                                />
                            </div>

                            {/* Currency */}
                            <div className="space-y-1">
                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                    {isRTL ? 'العملة' : 'Currency'} <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="currency"
                                    value={form.currency}
                                    onChange={handleChange}
                                    className="w-full h-[32.39px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-semibold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                >
                                    <option value="AED">{isRTL ? 'درهم إماراتي - AED' : 'AED - UAE Dirham'}</option>
                                </select>
                            </div>

                            {/* Discount Mode */}
                            <div className="space-y-1">
                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                    {isRTL ? 'وضع الخصم' : 'Discount Mode'}
                                </label>
                                <select
                                    name="discountMode"
                                    value={form.discountMode}
                                    onChange={handleChange}
                                    className="w-full h-[32.39px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-semibold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                >
                                    <option value="Without Discount">{isRTL ? 'بدون خصم' : 'Without Discount'}</option>
                                    <option value="Item Level">{isRTL ? 'على مستوى الصنف' : 'Item Level'}</option>
                                    <option value="Order Level">{isRTL ? 'على مستوى الطلب' : 'Order Level'}</option>
                                </select>
                            </div>

                            {/* Document Template */}
                            <div className="space-y-1">
                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                    {isRTL ? 'القالب' : 'Template'}
                                </label>
                                <select
                                    name="template"
                                    value={form.template}
                                    onChange={handleChange}
                                    className="w-full h-[32.39px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-semibold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                >
                                    <option value="Standard">{isRTL ? 'قالب قياسي' : 'Standard Template'}</option>
                                    <option value="Detailed">{isRTL ? 'قالب مفصل' : 'Detailed Template'}</option>
                                </select>
                            </div>
                        </div>

                        {/* Bottom row of Section 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
                            {/* Attachments Upload Box */}
                            <div className="space-y-1">
                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">{isRTL ? 'المرفقات' : 'Attachments'}</label>
                                <div className="h-[50px] bg-[#F8FBFE] border border-dashed border-[#CBD5E1] rounded-[10.06px] px-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Upload size={18} className="text-[var(--color-primary,#00A9A8)]" />
                                        <div>
                                            <p className="text-[12px] font-normal text-[#334155]">{isRTL ? 'اسحب وإسقاط الملفات هنا أو' : 'Drag & drop files here or'}</p>
                                            <p className="text-[10px] text-[var(--color-primary,#00A9A8)]">{isRTL ? 'يدعم: PDF, JPG, PNG (بحد أقصى 10MB)' : 'Supports: PDF, JPG, PNG (Max. 10MB each)'}</p>
                                        </div>
                                    </div>
                                    <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" id="attachments-input" />
                                    <label htmlFor="attachments-input" className="px-3 py-1 bg-white border border-[#CBD5E1] rounded-[10.06px] text-[12px] text-[#0F172A] font-normal cursor-pointer hover:bg-slate-50">
                                        {isRTL ? 'تحديد الملفات' : 'Select Files'}
                                    </label>
                                </div>
                            </div>

                            {/* Reference / Remarks */}
                            <div className="space-y-1 lg:col-span-1">
                                <div className="flex justify-between items-center">
                                    <label className="text-[13.22px] font-semibold text-[#102A5B]">{isRTL ? 'المرجع / الملاحظات' : 'Reference / Remarks'}</label>
                                    <span className="text-[12px] text-[#5F6F91]">0/250</span>
                                </div>
                                <input
                                    type="text"
                                    name="reference"
                                    value={form.reference}
                                    onChange={handleChange}
                                    placeholder={isRTL ? 'أدخل المرجع أو الملاحظات' : 'Enter reference or remarks'}
                                    className="w-full h-[52.87px] px-3 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-normal text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                />
                            </div>

                            {/* Internal Notes */}
                            <div className="space-y-1 lg:col-span-1">
                                <div className="flex justify-between items-center">
                                    <label className="text-[13.22px] font-semibold text-[#102A5B]">{isRTL ? 'ملاحظات داخلية' : 'Internal Notes'}</label>
                                    <span className="text-[12px] text-[#5F6F91]">0/250</span>
                                </div>
                                <input
                                    type="text"
                                    name="remark"
                                    value={form.remark}
                                    onChange={handleChange}
                                    placeholder={isRTL ? 'أدخل ملاحظات داخلية (اختياري)' : 'Enter internal notes (optional)'}
                                    className="w-full h-[52.87px] px-3 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-normal text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* TWO-COLUMN LAYOUT FOR SECTION 2 & 3 + SUMMARY */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* LEFT: SECTION 2 VENDOR DETAILS */}
                        <div className="lg:col-span-3 bg-white border border-[#DCE5F3] rounded-[15.86px] p-4 space-y-4">
                            <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-[26.44px] h-[26.44px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[13.22px] font-bold flex items-center justify-center">
                                        2
                                    </div>
                                    <h2 className="text-[23.79px] font-semibold text-[#102A5B] leading-[37px]">
                                        {isRTL ? 'تفاصيل المورد' : 'Vendor Details'}
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/company-settings/party-type/new', { state: { partyType: 'SUPPLIER' } })}
                                    className="text-[13.22px] font-semibold text-[var(--color-sidebar-bg,#013E5B)] hover:underline cursor-pointer"
                                >
                                    {isRTL ? '+ إضافة مورد جديد' : '+ Add New Vendor'}
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Vendor Select */}
                                <div className="space-y-1">
                                    <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                        {isRTL ? 'المورد' : 'Vendor'} <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        name="supplierId"
                                        value={form.supplierId}
                                        onChange={handleChange}
                                        className="w-full h-[34px] px-3 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-normal text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                        required
                                    >
                                        <option value="">{isRTL ? 'اختر المورد / البائع' : 'Select Vendor / Supplier'}</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName || s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || `Vendor #${s.id}`}</option>)}
                                    </select>
                                </div>

                                {(() => {
                                    const selectedVendor = suppliers.find(s => String(s.id) === String(form.supplierId));

                                    // Helper function to extract text address safely from string or object
                                    const formatAddress = (addr, city, region, country) => {
                                        let street = '';
                                        if (typeof addr === 'string') {
                                            street = addr;
                                        } else if (addr && typeof addr === 'object') {
                                            street = [addr.addressLine1, addr.addressLine2, addr.street, addr.building].filter(Boolean).join(', ');
                                            city = city || addr.city;
                                            country = country || addr.country;
                                        }
                                        return [street, city, region, country].filter(Boolean).join(', ');
                                    };

                                    const vendorAddress = selectedVendor
                                        ? (formatAddress(
                                            selectedVendor.address || selectedVendor.billingAddress,
                                            selectedVendor.city,
                                            selectedVendor.region,
                                            selectedVendor.country
                                        ) || 'N/A')
                                        : '';

                                    const contactPerson = selectedVendor
                                        ? (selectedVendor.primaryContactPerson ||
                                            (selectedVendor.primaryFirstName ? `${selectedVendor.primaryFirstName} ${selectedVendor.primaryLastName || ''}`.trim() : '') ||
                                            selectedVendor.contactPerson ||
                                            selectedVendor.name ||
                                            `${selectedVendor.firstName || ''} ${selectedVendor.lastName || ''}`.trim() ||
                                            'N/A')
                                        : '';

                                    const contactNumber = selectedVendor
                                        ? (selectedVendor.contactPhone || selectedVendor.mobile || selectedVendor.workPhone || selectedVendor.phone || selectedVendor.contactNumber || 'N/A')
                                        : '';

                                    const email = selectedVendor
                                        ? (selectedVendor.contactEmail || selectedVendor.email || 'N/A')
                                        : '';

                                    const trn = selectedVendor
                                        ? (selectedVendor.vatTrnNumber || selectedVendor.vatNumber || selectedVendor.trn || selectedVendor.taxRegistrationNo || selectedVendor.vatNo || selectedVendor.gstNo || 'N/A')
                                        : '';

                                    return (
                                        <>
                                            {/* Vendor Address */}
                                            <div className="space-y-1">
                                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                                    {isRTL ? 'عنوان المورد' : 'Vendor Address'}
                                                </label>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={vendorAddress}
                                                    placeholder={isRTL ? 'حدد المورد لتعبئة العنوان تلقائياً' : 'Select vendor to auto-populate address'}
                                                    className="w-full h-[34px] px-3 bg-slate-50 border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-normal text-[#102A5B] outline-none"
                                                />
                                            </div>

                                            {/* Contact Person & Contact Number */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[13.22px] font-semibold text-[#102A5B] block">{isRTL ? 'الشخص المسئول' : 'Contact Person'}</label>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={contactPerson}
                                                        placeholder="N/A"
                                                        className="w-full h-[32.39px] px-2.5 bg-slate-50 border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-normal text-[#102A5B]"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[13.22px] font-semibold text-[#102A5B] block">{isRTL ? 'رقم التواصل' : 'Contact Number'}</label>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={contactNumber}
                                                        placeholder="N/A"
                                                        className="w-full h-[32.39px] px-2.5 bg-slate-50 border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-normal text-[#102A5B]"
                                                    />
                                                </div>
                                            </div>

                                            {/* Email & Tax Registration No */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[13.22px] font-semibold text-[#102A5B] block">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                                                    <input
                                                        type="email"
                                                        readOnly
                                                        value={email}
                                                        placeholder="N/A"
                                                        className="w-full h-[32.39px] px-2.5 bg-slate-50 border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-normal text-[#102A5B]"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[13.22px] font-semibold text-[#102A5B] block">{isRTL ? 'رقم التسجيل الضريبي' : 'Tax Registration No.'}</label>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={trn}
                                                        placeholder="N/A"
                                                        className="w-full h-[32.39px] px-2.5 bg-slate-50 border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-normal text-[#102A5B]"
                                                    />
                                                </div>
                                            </div>

                                            {/* Vendor VAT No */}
                                            <div className="space-y-1">
                                                <label className="text-[13.22px] font-semibold text-[#102A5B] block">
                                                    {isRTL ? 'الرقم الضريبي للمورد' : 'Vendor VAT No.'}
                                                </label>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={trn}
                                                    placeholder="N/A"
                                                    className="w-full h-[32.39px] px-2.5 bg-slate-50 border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-normal text-[#102A5B]"
                                                />
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* RIGHT: SECTION 3 PROCUREMENT ITEMS */}
                        <div className="lg:col-span-9 bg-white border border-[#DCE5F3] rounded-[15.86px] p-4 flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                                {/* Header bar of items section */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4EAF0] pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-[26.44px] h-[26.44px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[13.22px] font-bold flex items-center justify-center">
                                            3
                                        </div>
                                        <h2 className="text-[23.79px] font-semibold text-[#102A5B] leading-[37px]">
                                            {isRTL ? 'أصناف المشتريات' : 'Procurement Items'}
                                        </h2>
                                        <span className="px-2.5 py-0.5 bg-[#EEF3FB] rounded-[5.29px] text-[13.22px] font-semibold text-[#102A5B]">
                                            {form.items.length > 0 ? (isRTL ? `${form.items.length} أصناف` : `${form.items.length} Items`) : (isRTL ? '24 أصناف' : '24 Items')}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="px-3.5 py-1.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[13.22px] font-semibold text-[#102A5B] hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <span>{isRTL ? '▣ استيراد من إكسل' : '▣ Import from Excel'}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="px-4 py-1.5 bg-[var(--color-primary,#00A9A8)] text-white rounded-[5.29px] text-[13.22px] font-semibold hover:opacity-95 flex items-center gap-1 cursor-pointer"
                                        >
                                            <Plus size={16} />
                                            <span>{isRTL ? 'إضافة صنف' : 'Add Item'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Items Table Container */}
                                <div className="overflow-x-visible min-h-[220px] border border-[#E4EAF0] rounded-lg">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-[#EEF5FF] border-b border-[#E4EAF0] text-[#102A5B] font-semibold">
                                                <th className="py-2 px-2.5">#</th>
                                                <th className="py-2 px-2.5">{isRTL ? 'رمز الصنف' : 'Item Code'}</th>
                                                <th className="py-2 px-2.5">{isRTL ? 'وصف الصنف' : 'Item Description'}</th>
                                                <th className="py-2 px-2.5">{isRTL ? 'وحدة القياس' : 'UOM'}</th>
                                                <th className="py-2 px-2.5 text-center">{isRTL ? 'الكمية' : 'Qty'}</th>
                                                <th className="py-2 px-2.5 text-right">{isRTL ? 'سعر الوحدة (درهم)' : 'Unit Price (AED)'}</th>
                                                <th className="py-2 px-2.5 text-center">{isRTL ? 'الضريبة (%)' : 'Tax (%)'}</th>
                                                <th className="py-2 px-2.5 text-center">{isRTL ? 'الخصم (%)' : 'Discount (%)'}</th>
                                                <th className="py-2 px-2.5 text-right">{isRTL ? 'المبلغ (درهم)' : 'Amount (AED)'}</th>
                                                <th className="py-2 px-2.5 text-center">{isRTL ? 'الإجراء' : 'Action'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E4EAF0] text-[#102A5B]">
                                            {form.items.map((it, idx) => {
                                                const qty = Number(it.quantity) || 0;
                                                const rate = Number(it.rate) || 0;
                                                const discount = Number(it.lineDiscount) || 0;
                                                const amount = Math.max(0, (qty * rate) - discount);
                                                const rawMat = rawMaterials.find(m => String(m.id) === String(it.itemId));
                                                const unitObj = units.find(u => String(u.id) === String(it.unitId));

                                                return (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="py-2 px-2 text-center">{idx + 1}</td>
                                                        <td className="py-2 px-2 font-semibold min-w-[200px]">
                                                            <SearchableItemSelect
                                                                items={rawMaterials}
                                                                value={it.itemId}
                                                                onChange={e => handleItemChange(idx, e)}
                                                                placeholder="Select Item"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <input
                                                                type="text"
                                                                name="description"
                                                                value={it.description || ''}
                                                                onChange={e => handleItemChange(idx, e)}
                                                                placeholder="Item description..."
                                                                className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <select
                                                                name="unitId"
                                                                value={it.unitId}
                                                                onChange={e => handleItemChange(idx, e)}
                                                                className="w-full bg-white border border-[#D8E2F1] rounded px-1 py-1 text-xs outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                            >
                                                                <option value="">UOM</option>
                                                                {units.map(u => <option key={u.id} value={u.id}>{u.name || u.code}</option>)}
                                                            </select>
                                                        </td>
                                                        <td className="py-2 px-2 text-center">
                                                            <input
                                                                type="number"
                                                                name="quantity"
                                                                min="0"
                                                                value={it.quantity}
                                                                onChange={e => handleItemChange(idx, e)}
                                                                className="w-16 bg-white border border-[#D8E2F1] rounded text-center py-1 text-xs outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2 text-right">
                                                            <input
                                                                type="number"
                                                                name="rate"
                                                                min="0"
                                                                value={it.rate}
                                                                onChange={e => handleItemChange(idx, e)}
                                                                className="w-20 bg-white border border-[#D8E2F1] rounded text-right py-1 text-xs outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2 text-center">
                                                            <select
                                                                name="taxId"
                                                                value={it.taxId}
                                                                onChange={e => handleItemChange(idx, e)}
                                                                className="w-16 bg-white border border-[#D8E2F1] rounded text-center py-1 text-xs outline-none"
                                                            >
                                                                <option value="">0%</option>
                                                                {taxes.map(t => <option key={t.id} value={t.id}>{t.rate}%</option>)}
                                                            </select>
                                                        </td>
                                                        <td className="py-2 px-2 text-center">
                                                            <input
                                                                type="number"
                                                                name="lineDiscount"
                                                                min="0"
                                                                disabled={form.discountMode !== 'Item Level'}
                                                                value={form.discountMode === 'Item Level' ? it.lineDiscount : 0}
                                                                onChange={e => handleItemChange(idx, e)}
                                                                placeholder="0"
                                                                className={`w-16 rounded text-center py-1 text-xs outline-none ${form.discountMode === 'Item Level'
                                                                        ? 'bg-white border border-[#D8E2F1] focus:border-[var(--color-primary,#00A9A8)]'
                                                                        : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                                                                    }`}
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2 text-right font-bold">
                                                            {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="py-2 px-2 text-center">
                                                            <button type="button" onClick={() => removeItem(idx)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Summary Totals Row inside Section 3 */}
                            <div className="grid grid-cols-5 gap-2 pt-3 border-t border-[#E4EAF0] text-center">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <span className="text-[10px] text-[#5F6F91] block">{isRTL ? 'إجمالي الأصناف' : 'Total Items'}</span>
                                    <span className="text-[16px] font-bold text-[var(--color-primary,#00A9A8)]">{form.items.length}</span>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <span className="text-[10px] text-[#5F6F91] block">{isRTL ? 'المجموع الفرعي (درهم)' : 'Sub Total (AED)'}</span>
                                    <span className="text-[15px] font-bold text-[var(--color-primary,#00A9A8)]">{totals.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <span className="text-[10px] text-[#5F6F91] block">{isRTL ? 'إجمالي الضريبة (درهم)' : 'Total Tax (AED)'}</span>
                                    <span className="text-[15px] font-bold text-[var(--color-primary,#00A9A8)]">{totals.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-lg flex flex-col justify-center items-center">
                                    <span className="text-[10px] text-[#5F6F91] block">{isRTL ? 'إجمالي الخصم (درهم)' : 'Total Discount (AED)'}</span>
                                    {form.discountMode === 'Order Level' ? (
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <input
                                                type="number"
                                                name="orderDiscountPercentage"
                                                min="0"
                                                max="100"
                                                value={form.orderDiscountPercentage}
                                                onChange={handleChange}
                                                className="w-12 h-6 text-center text-xs bg-white border border-[#D8E2F1] rounded font-bold text-[var(--color-primary,#00A9A8)] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                placeholder="%"
                                            />
                                            <span className="text-xs font-bold text-[#5F6F91]">%</span>
                                            <span className="text-[11px] font-bold text-[var(--color-primary,#00A9A8)] ml-1">
                                                ({totals.totalDiscount.toFixed(2)})
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-[15px] font-bold text-[var(--color-primary,#00A9A8)]">
                                            {totals.totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    )}
                                </div>
                                <div className="p-2 bg-[var(--color-primary,#00A9A8)] text-white rounded-lg flex flex-col justify-center">
                                    <span className="text-[10px] opacity-90 block">{isRTL ? 'المجموع الكلي (درهم)' : 'Grand Total (AED)'}</span>
                                    <span className="text-[16px] font-bold">{totals.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4, 5, 6 THREE-COLUMN GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* SECTION 4: DELIVERY DETAILS */}
                        <div className="bg-white border border-[#DCE5F3] rounded-[15.86px] p-4 space-y-3">
                            <div className="flex items-center gap-2 border-b border-[#E4EAF0] pb-2.5">
                                <div className="w-[26.44px] h-[26.44px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[13.22px] font-bold flex items-center justify-center">
                                    4
                                </div>
                                <h2 className="text-[20px] font-semibold text-[#102A5B]">{isRTL ? 'تفاصيل التسليم' : 'Delivery Details'}</h2>
                            </div>

                            <div className="space-y-2.5">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[12px] font-semibold text-[#102A5B] block">
                                            {isRTL ? 'عنوان التسليم' : 'Delivery Address'} <span className="text-rose-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsLocationModalOpen(true)}
                                            className="text-[11px] font-semibold text-[var(--color-primary,#00A9A8)] hover:underline cursor-pointer"
                                        >
                                            {isRTL ? '+ إضافة موقع' : '+ Add Location'}
                                        </button>
                                    </div>
                                    <select
                                        name="deliverToId"
                                        value={form.deliverToId}
                                        onChange={handleDeliverToIdChange}
                                        className="w-full h-[32px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[12px] text-[#102A5B] outline-none"
                                    >
                                        <option value="">{isRTL ? 'حدد الموقع' : 'Select Location'}</option>
                                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[12px] font-semibold text-[#102A5B] block">{isRTL ? 'عناية' : 'Attention To'}</label>
                                        <input
                                            type="text"
                                            name="attentionTo"
                                            value={form.attentionTo || ''}
                                            onChange={handleChange}
                                            placeholder={isRTL ? 'اسم جهة الاتصال...' : 'Contact name...'}
                                            className="w-full h-[32px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[12px] text-[#102A5B] outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[12px] font-semibold text-[#102A5B] block">{isRTL ? 'رقم التواصل' : 'Contact Number'}</label>
                                        <input
                                            type="text"
                                            name="deliveryContactNumber"
                                            value={form.deliveryContactNumber || ''}
                                            onChange={handleChange}
                                            placeholder={isRTL ? 'رقم الهاتف...' : 'Phone number...'}
                                            className="w-full h-[32px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[12px] text-[#102A5B] outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[12px] font-semibold text-[#102A5B]">{isRTL ? 'تعليمات التسليم' : 'Delivery Instructions'}</label>
                                        <span className="text-[10px] text-[#5F6F91]">0/250</span>
                                    </div>
                                    <textarea
                                        rows={2}
                                        name="deliverToAddress"
                                        value={form.deliverToAddress}
                                        onChange={handleChange}
                                        placeholder={isRTL ? 'التسليم بين 8 صباحاً - 5 مساءً في أيام العمل.' : 'Deliver between 8 AM - 5 PM on working days.'}
                                        className="w-full p-2 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[12px] text-[#102A5B] outline-none"
                                    />
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer pt-1">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                const selectedVendor = suppliers.find(s => String(s.id) === String(form.supplierId));
                                                if (selectedVendor) {
                                                    const street = typeof selectedVendor.address === 'string' ? selectedVendor.address : '';
                                                    const fullAddr = [street, selectedVendor.city, selectedVendor.country].filter(Boolean).join(', ');
                                                    setForm(prev => ({ ...prev, deliverToAddress: fullAddr }));
                                                }
                                            }
                                        }}
                                        className="rounded border-[#D8E2F1] text-[var(--color-primary,#00A9A8)]"
                                    />
                                    <span className="text-[12px] text-[#102A5B]">{isRTL ? 'نفس عنوان المورد' : 'Same as Vendor Address'}</span>
                                </label>
                            </div>
                        </div>

                        {/* SECTION 5: ADDITIONAL INFORMATION */}
                        <div className="bg-white border border-[#DCE5F3] rounded-[15.86px] p-4 space-y-3">
                            <div className="flex items-center gap-2 border-b border-[#E4EAF0] pb-2.5">
                                <div className="w-[26.44px] h-[26.44px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[13.22px] font-bold flex items-center justify-center">
                                    5
                                </div>
                                <h2 className="text-[20px] font-semibold text-[#102A5B]">{isRTL ? 'معلومات إضافية' : 'Additional Information'}</h2>
                            </div>

                            <div className="space-y-2.5">
                                <div className="space-y-1">
                                    <label className="text-[12px] font-semibold text-[#102A5B] block">{isRTL ? 'المشروع' : 'Project'}</label>
                                    <input
                                        type="text"
                                        name="projectNumber"
                                        value={form.projectNumber}
                                        onChange={handleChange}
                                        placeholder={isRTL ? 'رمز / اسم المشروع...' : 'Project code / name...'}
                                        className="w-full h-[32px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[12px] text-[#102A5B] outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[12px] font-semibold text-[#102A5B] block">{isRTL ? 'حساب دفتر الاستاد العام' : 'GL Account'}</label>
                                        <input
                                            type="text"
                                            name="glAccount"
                                            value={form.glAccount || ''}
                                            onChange={handleChange}
                                            placeholder="5200 - Raw Materials"
                                            className="w-full h-[32px] px-2 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[11px] text-[#102A5B] outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[12px] font-semibold text-[#102A5B] block">{isRTL ? 'مركز التكلفة' : 'Cost Center'}</label>
                                        <input
                                            type="text"
                                            name="costCenter"
                                            value={form.costCenter || ''}
                                            onChange={handleChange}
                                            placeholder="CC-1001 Production"
                                            className="w-full h-[32px] px-2 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[11px] text-[#102A5B] outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[12px] font-semibold text-[#102A5B]">{isRTL ? 'الشروط والأحكام' : 'Terms & Conditions'}</label>
                                        <span className="text-[10px] text-[#5F6F91]">0/500</span>
                                    </div>
                                    <textarea
                                        rows={2}
                                        value={form.termsAndConditions}
                                        onChange={handleChange}
                                        name="termsAndConditions"
                                        placeholder={isRTL ? 'الدفع خلال 30 يوماً من تاريخ استلام البضائع.' : 'Payment within 30 days from the date of goods receipt.'}
                                        className="w-full p-2 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[12px] text-[#102A5B] outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 6: APPROVALS */}
                        <div className="bg-white border border-[#DCE5F3] rounded-[15.86px] p-4 space-y-3 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 border-b border-[#E4EAF0] pb-2.5">
                                    <div className="w-[26.44px] h-[26.44px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[13.22px] font-bold flex items-center justify-center">
                                        6
                                    </div>
                                    <h2 className="text-[20px] font-semibold text-[#102A5B]">{isRTL ? 'الموافقات' : 'Approvals'}</h2>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="space-y-1">
                                        <label className="text-[12px] font-semibold text-[#102A5B] block">{isRTL ? 'مسار عمل الموافقة' : 'Approval Workflow'}</label>
                                        <select
                                            name="approvalWorkflow"
                                            value={form.approvalWorkflow || 'Standard Approval'}
                                            onChange={handleChange}
                                            className="w-full h-[32px] px-2.5 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[12px] text-[#102A5B] outline-none"
                                        >
                                            <option value="Standard Approval">{isRTL ? 'مسار موافقة الشراء' : 'Purchase Approval Workflow'}</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[12px] font-semibold text-[#102A5B]">{isRTL ? 'ملاحظة للمعتمد' : 'Note to Approver'}</label>
                                            <span className="text-[10px] text-[#5F6F91]">0/250</span>
                                        </div>
                                        <textarea
                                            rows={2}
                                            name="notes"
                                            value={form.notes}
                                            onChange={handleChange}
                                            placeholder={isRTL ? 'يرجى مراجعة واعتماد أمر الشراء هذا.' : 'Please review and approve this PO.'}
                                            className="w-full p-2 bg-white border border-[#D8E2F1] rounded-[5.29px] text-[12px] text-[#102A5B] outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-3 border-t border-[#E4EAF0]">
                                <button
                                    type="button"
                                    onClick={() => navigate('/purchase-dashboard/purchase-orders')}
                                    className="flex-1 py-2 bg-white border border-[#DCE5F3] rounded-[5.29px] text-[12px] font-semibold text-[#102A5B] hover:bg-slate-50 cursor-pointer"
                                >
                                    {isRTL ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { setForm(prev => ({ ...prev, status: 'Draft' })); handleSubmit(e); }}
                                    className="flex-1 py-2 bg-white border border-[#DCE5F3] rounded-[5.29px] text-[12px] font-semibold text-[#102A5B] hover:bg-slate-50 cursor-pointer"
                                >
                                    {isRTL ? 'حفظ كمسودة' : 'Save as Draft'}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-[var(--color-sidebar-bg,#013E5B)] text-white rounded-[5.29px] text-[12px] font-semibold hover:opacity-95 cursor-pointer shadow-xs"
                                >
                                    {isRTL ? 'تقديم للموافقة' : 'Submit for Approval'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Add Location Modal */}
                <LocationModal
                    isOpen={isLocationModalOpen}
                    onClose={() => setIsLocationModalOpen(false)}
                    onSave={handleSaveLocation}
                    loading={locationModalLoading}
                />
            </div>
        </div>
    );
};

export default PurchaseOrderForm;
