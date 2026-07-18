import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Save, FileText, ChevronDown, ChevronRight,
    Calculator, Loader, X, Layers, Info, Clipboard, Settings2, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTenant } from '../../context/TenantContext';
import ViewBomInformation from './ViewBomInformation';

const API_URL = import.meta.env.VITE_API_BASE_URL;

/* ── Reusable field wrapper ── */
const Field = ({ label, required, children, className = '' }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {children}
    </div>
);

const inputCls = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white placeholder:text-gray-300 transition-colors";
const readonlyCls = "w-full text-sm border border-gray-100 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-600 cursor-default";

/* ── Section card ── */
const SectionCard = ({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-[#112255]/[0.03]">
            <div className="w-7 h-7 rounded-lg bg-[#112255] flex items-center justify-center">
                <Icon size={14} className="text-white" />
            </div>
            <h3 className="text-sm font-bold text-[#112255]">{title}</h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

const ManufacturingOrderForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;
    const { hasModule } = useTenant();
    const isHangerTenant = hasModule('HANGER_MANUFACTURING');

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        productionHouseId: '',
        moNumber: '',
        salesOrderId: '',
        customerId: '',
        referenceNo: '',
        itemId: null,
        rawMaterialId: null,
        crmProductId: null,
        finishedGoodId: null,
        selectedUniqueId: '',
        searchInput: '',
        categoryId: '',
        subCategoryId: '',
        wastage: '',
        quantity: '',
        status: 'SCHEDULED',
        scheduleStart: '',
        scheduleFinish: '',
        dueDate: '',
        actualStart: '',
        actualFinish: '',
        assignToId: '',
        batchNo: '',
        samplingRequestStatus: '',
        bomId: '',
        bomFinishedGoodId: '',
        shift: '',
        productionDate: '',
        startTime: '',
        endTime: '',
        finishedQuantity: '',
        remarks: '',
        hangerTypeId: '',
        wireGaugeRequired: '',
        requiredWireKg: ''
    });

    const [existingFiles, setExistingFiles] = useState([]);
    const [file, setFile] = useState(null);

    const [locations, setLocations] = useState([]);
    const [salesOrders, setSalesOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [boms, setBoms] = useState([]);
    const [fgBoms, setFgBoms] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategoryCache, setSubCategoryCache] = useState({});
    const [availableSubcategories, setAvailableSubcategories] = useState([]);
    const [hangerTypes, setHangerTypes] = useState([]);
    const [moBatches, setMoBatches] = useState([]);

    const [showSOModal, setShowSOModal] = useState(false);
    const [showBOMModal, setShowBOMModal] = useState(false);
    const [selectedBOMData, setSelectedBOMData] = useState(null);

    const authHeaders = useMemo(() => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }), []);

    const fetchDependencies = useCallback(async () => {
        setLoading(true);
        try {
            const [locRes, custRes, sfRes, rmRes, fgRes, prodRes, empRes, bomRes, soRes, catRes, fgBomRes, hngRes] = await Promise.all([
                axios.get(`${API_URL}/locations`, authHeaders).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/parties`, { ...authHeaders, params: { type: 'CUSTOMER', size: 1000 } }).catch(() => ({ data: { content: [] } })),
                axios.get(`${API_URL}/production/semi-finished`, { ...authHeaders, params: { size: 1000 } }).catch(() => ({ data: { content: [] } })),
                axios.get(`${API_URL}/production/raw-materials`, { ...authHeaders, params: { size: 1000 } }).catch(() => ({ data: { content: [] } })),
                axios.get(`${API_URL}/production/finished-goods`, { ...authHeaders, params: { size: 1000 } }).catch(() => ({ data: { content: [] } })),
                axios.get(`${API_URL}/crm/sales-products`, { ...authHeaders, params: { size: 1000 } }).catch(() => ({ data: { content: [] } })),
                axios.get(`${API_URL}/employees/all`, authHeaders).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/production/bom-semi-finished`, { ...authHeaders, params: { size: 1000 } }).catch(() => ({ data: { content: [] } })),
                axios.get(`${API_URL}/sales/orders`, { ...authHeaders, params: { size: 1000 } }).catch(() => ({ data: { content: [] } })),
                axios.get(`${API_URL}/production/categories`, authHeaders).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/production/bom-finished-goods`, { ...authHeaders, params: { size: 1000 } }).catch(() => ({ data: { content: [] } })),
                axios.get(`${API_URL}/hanger/types`, authHeaders).catch(() => ({ data: [] }))
            ]);

            const getList = (res) => Array.isArray(res.data) ? res.data : (res.data.content || []);

            setLocations(locRes.data || []);
            setCustomers(custRes.data.content || custRes.data || []);
            setEmployees(empRes.data || []);
            setBoms(bomRes.data.content || []);
            setSalesOrders(soRes.data.content || []);
            setFgBoms(getList(fgBomRes) || []);
            setHangerTypes(getList(hngRes) || []);

            const fetchedCategories = getList(catRes);
            setCategories(fetchedCategories);

            const normalizeItem = (item, type, labelSuffix) => {
                let resolvedCategoryId = item.categoryId || item.category?.id || '';
                if (!resolvedCategoryId && item.categoryName) {
                    const foundCat = fetchedCategories.find(c => c.categoryName === item.categoryName || c.name === item.categoryName);
                    if (foundCat) resolvedCategoryId = foundCat.id;
                }
                return {
                    ...item, type,
                    uniqueId: `${type}-${item.id}`,
                    label: `${item.name} (${item.itemCode}) - ${labelSuffix}`,
                    categoryId: resolvedCategoryId,
                    categoryName: item.categoryName || item.category?.name || '',
                    subCategoryId: item.subCategoryId || item.subCategory?.id || '',
                    subCategoryName: item.subCategoryName || item.subCategory?.name || ''
                };
            };

            const products = getList(prodRes).map(p => normalizeItem(p, 'PRODUCT', 'Product'));
            const rawMaterials = getList(rmRes).map(r => normalizeItem(r, 'RAW_MATERIAL', 'Raw Material'));
            const semiFinished = getList(sfRes).map(s => normalizeItem(s, 'SEMI_FINISHED', 'Semi-Finished'));
            const finishedGoods = getList(fgRes).map(f => normalizeItem(f, 'FINISHED_GOOD', 'Finished Good'));
            const compiledItems = [...products, ...rawMaterials, ...semiFinished, ...finishedGoods];
            setAllItems(compiledItems);

            if (isEditing) {
                const response = await axios.get(`${API_URL}/production/manufacturing-orders/${id}`, authHeaders);
                const data = response.data;
                let uniqueId = '';
                if (data.crmProductId) uniqueId = `PRODUCT-${data.crmProductId}`;
                else if (data.rawMaterialId) uniqueId = `RAW_MATERIAL-${data.rawMaterialId}`;
                else if (data.finishedGoodId) uniqueId = `FINISHED_GOOD-${data.finishedGoodId}`;
                else if (data.itemId) uniqueId = `SEMI_FINISHED-${data.itemId}`;
                const foundItem = compiledItems.find(i => i.uniqueId === uniqueId);
                const searchInput = foundItem ? foundItem.label : (data.itemName || '');
                if (data.categoryId) {
                    axios.get(`${API_URL}/production/sub-categories?categoryId=${data.categoryId}`, authHeaders)
                        .then(res => setAvailableSubcategories(res.data || []))
                        .catch(e => console.error(e));
                }
                setFormData({
                    productionHouseId: data.productionHouseId || '',
                    moNumber: data.moNumber || '',
                    salesOrderId: data.salesOrderId || '',
                    customerId: data.customerId || '',
                    referenceNo: data.referenceNo || '',
                    itemId: data.itemId || null,
                    rawMaterialId: data.rawMaterialId || null,
                    crmProductId: data.crmProductId || null,
                    finishedGoodId: data.finishedGoodId || null,
                    selectedUniqueId: uniqueId,
                    searchInput,
                    categoryId: data.categoryId || '',
                    subCategoryId: data.subCategoryId || '',
                    wastage: data.wastage || '',
                    quantity: data.quantity || '',
                    status: data.status || 'SCHEDULED',
                    scheduleStart: data.scheduleStart ? data.scheduleStart.slice(0, 16) : '',
                    scheduleFinish: data.scheduleFinish ? data.scheduleFinish.slice(0, 16) : '',
                    dueDate: data.dueDate ? data.dueDate.slice(0, 16) : '',
                    actualStart: data.actualStart ? data.actualStart.slice(0, 16) : '',
                    actualFinish: data.actualFinish ? data.actualFinish.slice(0, 16) : '',
                    assignToId: data.assignToId || '',
                    batchNo: data.batchNo || '',
                    samplingRequestStatus: data.samplingRequestStatus || '',
                    bomId: data.bomId || '',
                    bomFinishedGoodId: data.bomFinishedGoodId || '',
                    shift: data.shift || '',
                    productionDate: data.productionDate || '',
                    startTime: data.startTime || '',
                    endTime: data.endTime || '',
                    finishedQuantity: data.finishedQuantity || '',
                    remarks: data.remarks || '',
                    hangerTypeId: data.hangerTypeId || '',
                    wireGaugeRequired: data.wireGaugeRequired || '',
                    requiredWireKg: data.requiredWireKg || '',
                });
                setExistingFiles(data.files || []);
                if (isHangerTenant) {
                    axios.get(`${API_URL}/hanger/batches/by-mo/${id}`, authHeaders)
                        .then(res => setMoBatches(res.data || []))
                        .catch(e => console.error(e));
                }
            } else {
                setFormData(prev => ({ ...prev, moNumber: `MO-${Date.now().toString().slice(-6)}` }));
            }
        } catch (err) {
            console.error('Failed to load dependencies', err);
        } finally {
            setLoading(false);
        }
    }, [isEditing, id, authHeaders, isHangerTenant]);

    useEffect(() => { fetchDependencies(); }, [fetchDependencies]);

    const handleCategoryChange = async (categoryId) => {
        setFormData(prev => ({ ...prev, categoryId, subCategoryId: '' }));
        if (categoryId) {
            if (subCategoryCache[categoryId]) {
                setAvailableSubcategories(subCategoryCache[categoryId]);
            } else {
                try {
                    const res = await axios.get(`${API_URL}/production/sub-categories?categoryId=${categoryId}`, authHeaders);
                    const data = res.data || [];
                    setSubCategoryCache(prev => ({ ...prev, [categoryId]: data }));
                    setAvailableSubcategories(data);
                } catch (e) { console.error(e); }
            }
        } else {
            setAvailableSubcategories([]);
        }
    };

    const handleChange = async (e) => {
        const { name, value } = e.target;

        if (name === 'searchInput') {
            const selectedItem = allItems.find(item => item.label === value);
            const updated = {
                ...formData, searchInput: value,
                itemId: null, rawMaterialId: null, crmProductId: null, finishedGoodId: null,
                selectedUniqueId: '', bomId: '', categoryId: '', subCategoryId: ''
            };
            if (selectedItem) {
                updated.selectedUniqueId = selectedItem.uniqueId;
                updated.categoryId = selectedItem.categoryId || '';
                updated.subCategoryId = selectedItem.subCategoryId || '';
                if (selectedItem.type === 'PRODUCT') updated.crmProductId = selectedItem.id;
                else if (selectedItem.type === 'RAW_MATERIAL') updated.rawMaterialId = selectedItem.id;
                else if (selectedItem.type === 'SEMI_FINISHED') {
                    updated.itemId = selectedItem.id;
                    const relatedBom = boms.find(b => b.itemId === selectedItem.id);
                    updated.bomId = relatedBom ? relatedBom.id : '';
                    updated.bomFinishedGoodId = null;
                } else if (selectedItem.type === 'FINISHED_GOOD') {
                    updated.finishedGoodId = selectedItem.id;
                    const relatedBom = fgBoms.find(b => b.finishedGoodId === selectedItem.id || b.itemId === selectedItem.id);
                    updated.bomFinishedGoodId = relatedBom ? relatedBom.id : '';
                    updated.bomId = null;
                }
                if (!updated.categoryId && selectedItem.categoryName) {
                    const foundCat = categories.find(c =>
                        (c.name || '').trim().toLowerCase() === (selectedItem.categoryName || '').trim().toLowerCase() ||
                        (c.categoryName || '').trim().toLowerCase() === (selectedItem.categoryName || '').trim().toLowerCase()
                    );
                    if (foundCat) updated.categoryId = foundCat.id;
                }
                if (updated.categoryId) {
                    let subCats = subCategoryCache[updated.categoryId];
                    if (!subCats) {
                        try {
                            const res = await axios.get(`${API_URL}/production/sub-categories?categoryId=${updated.categoryId}`, authHeaders);
                            subCats = res.data || [];
                            setSubCategoryCache(prev => ({ ...prev, [updated.categoryId]: subCats }));
                        } catch (e) { console.error(e); subCats = []; }
                    }
                    setAvailableSubcategories(subCats);
                    if (!updated.subCategoryId && selectedItem.subCategoryName) {
                        const foundSub = subCats.find(s => s.subCategoryName === selectedItem.subCategoryName || s.name === selectedItem.subCategoryName);
                        if (foundSub) updated.subCategoryId = foundSub.id;
                    }
                } else {
                    setAvailableSubcategories([]);
                }
            } else {
                setAvailableSubcategories([]);
            }
            setFormData(updated);
        } else if (name === 'categoryId') {
            handleCategoryChange(value);
        } else if (name === 'salesOrderId' && value) {
            const soSummary = salesOrders.find(s => s.id === parseInt(value));
            if (soSummary) {
                setFormData(prev => ({ ...prev, [name]: value, customerId: soSummary.customerId || '', referenceNo: soSummary.reference || '' }));
                try {
                    const res = await axios.get(`${API_URL}/sales/orders/${value}`, authHeaders);
                    const fullSo = res.data;
                    const items = fullSo.items || fullSo.lines || fullSo.salesOrderItems || [];
                    if (items && items.length > 0) {
                        const line = items[0];
                        let targetId = null, targetType = null;
                        if (line.finishedGoodId || line.finishedGood?.id) { targetId = line.finishedGoodId || line.finishedGood?.id; targetType = 'FINISHED_GOOD'; }
                        else if (line.crmProductId || line.product?.id) { targetId = line.crmProductId || line.product?.id; targetType = 'PRODUCT'; }
                        else if (line.rawMaterialId || line.rawMaterial?.id) { targetId = line.rawMaterialId || line.rawMaterial?.id; targetType = 'RAW_MATERIAL'; }
                        else if (line.semiFinishedId || line.semiFinished?.id) { targetId = line.semiFinishedId || line.semiFinished?.id; targetType = 'SEMI_FINISHED'; }
                        let foundItem = targetId && targetType ? allItems.find(i => i.type === targetType && i.id == targetId) : null;
                        if (foundItem) {
                            const itemUpdates = {
                                selectedUniqueId: foundItem.uniqueId, searchInput: foundItem.label,
                                finishedGoodId: foundItem.type === 'FINISHED_GOOD' ? foundItem.id : null,
                                crmProductId: foundItem.type === 'PRODUCT' ? foundItem.id : null,
                                rawMaterialId: foundItem.type === 'RAW_MATERIAL' ? foundItem.id : null,
                                itemId: foundItem.type === 'SEMI_FINISHED' ? foundItem.id : null,
                                categoryId: foundItem.categoryId || '', subCategoryId: foundItem.subCategoryId || '',
                                quantity: line.quantity || ''
                            };
                            if (foundItem.type === 'FINISHED_GOOD') {
                                const rb = fgBoms.find(b => b.finishedGoodId == foundItem.id);
                                itemUpdates.bomFinishedGoodId = rb ? rb.id : ''; itemUpdates.bomId = '';
                            } else if (foundItem.type === 'SEMI_FINISHED') {
                                const rb = boms.find(b => b.itemId == foundItem.id);
                                itemUpdates.bomId = rb ? rb.id : ''; itemUpdates.bomFinishedGoodId = '';
                            }
                            setFormData(prev => ({ ...prev, ...itemUpdates }));
                        }
                    }
                } catch (err) { console.error('Failed to fetch SO details', err); }
            } else {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else if (name === 'hangerTypeId') {
            const hType = hangerTypes.find(h => h.id === parseInt(value));
            const updated = { ...formData, hangerTypeId: value, wireGaugeRequired: hType ? hType.standardWireGaugeMm : '' };
            if (updated.quantity && hType) updated.requiredWireKg = ((parseFloat(updated.quantity) * hType.unitWeightGrams) / 1000).toFixed(4);
            setFormData(updated);
        } else if (name === 'quantity') {
            const updated = { ...formData, quantity: value };
            if (formData.hangerTypeId) {
                const hType = hangerTypes.find(h => h.id === parseInt(formData.hangerTypeId));
                if (hType) updated.requiredWireKg = ((parseFloat(value) * hType.unitWeightGrams) / 1000).toFixed(4);
            }
            setFormData(updated);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddFromSalesOrder = () => setShowSOModal(true);

    const selectSalesOrder = (so) => {
        setFormData(prev => ({ ...prev, salesOrderId: so.id, customerId: so.customerId || '', referenceNo: so.reference || '' }));
        setShowSOModal(false);
    };

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleViewFile = async (fileId) => {
        try {
            const response = await axios.get(`${API_URL}/production/manufacturing-orders/files/${fileId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, responseType: 'blob'
            });
            const fileURL = URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
            window.open(fileURL, '_blank');
        } catch (error) { alert('Failed to view file.'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                moNumber: formData.moNumber,
                productionHouseId: formData.productionHouseId ? parseInt(formData.productionHouseId) : null,
                salesOrderId: formData.salesOrderId ? parseInt(formData.salesOrderId) : null,
                customerId: formData.customerId ? parseInt(formData.customerId) : null,
                referenceNo: formData.referenceNo || null,
                itemId: formData.itemId ? parseInt(formData.itemId) : null,
                rawMaterialId: formData.rawMaterialId ? parseInt(formData.rawMaterialId) : null,
                crmProductId: formData.crmProductId ? parseInt(formData.crmProductId) : null,
                finishedGoodId: formData.finishedGoodId ? parseInt(formData.finishedGoodId) : null,
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
                subCategoryId: formData.subCategoryId ? parseInt(formData.subCategoryId) : null,
                bomId: formData.bomId ? parseInt(formData.bomId) : null,
                bomFinishedGoodId: formData.bomFinishedGoodId ? parseInt(formData.bomFinishedGoodId) : null,
                quantity: formData.quantity ? parseFloat(formData.quantity) : 0,
                wastage: formData.wastage ? parseFloat(formData.wastage) : 0,
                status: formData.status || 'SCHEDULED',
                scheduleStart: formData.scheduleStart ? new Date(formData.scheduleStart).toISOString() : null,
                scheduleFinish: formData.scheduleFinish ? new Date(formData.scheduleFinish).toISOString() : null,
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                actualStart: formData.actualStart ? new Date(formData.actualStart).toISOString() : null,
                actualFinish: formData.actualFinish ? new Date(formData.actualFinish).toISOString() : null,
                assignToId: formData.assignToId ? parseInt(formData.assignToId) : null,
                batchNo: formData.batchNo || null,
                samplingRequestStatus: formData.samplingRequestStatus || null,
                productionDate: formData.productionDate || null,
                shift: formData.shift || null,
                startTime: formData.startTime || null,
                endTime: formData.endTime || null,
                finishedQuantity: formData.finishedQuantity ? parseFloat(formData.finishedQuantity) : null,
                remarks: formData.remarks || null,
                // Hanger fields
                hangerTypeId: formData.hangerTypeId ? parseInt(formData.hangerTypeId) : null,
                wireGaugeRequired: formData.wireGaugeRequired ? parseFloat(formData.wireGaugeRequired) : null,
                requiredWireKg: formData.requiredWireKg ? parseFloat(formData.requiredWireKg) : null,
            };
            let response;
            if (isEditing) {
                response = await axios.put(`${API_URL}/production/manufacturing-orders/${id}`, payload, authHeaders);
            } else {
                response = await axios.post(`${API_URL}/production/manufacturing-orders`, payload, authHeaders);
            }
            const orderId = response.data.id;
            if (file && orderId) {
                const uploadData = new FormData();
                uploadData.append('file', file);
                await axios.post(`${API_URL}/production/manufacturing-orders/${orderId}/files`, uploadData, {
                    headers: { ...authHeaders.headers, 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/production-dashboard/manage-manufacturing-order');
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save manufacturing order.'}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="text-center">
                <Loader className="animate-spin h-8 w-8 text-primary mx-auto" />
                <p className="text-sm text-gray-500 mt-3">Loading form data...</p>
            </div>
        </div>
    );

    /* ── Filtered item dropdown ── */
    const filteredItems = formData.searchInput && !formData.selectedUniqueId
        ? allItems.filter(item => item.label.toLowerCase().includes(formData.searchInput.toLowerCase())).slice(0, 30)
        : [];

    /* ── Selected BOM lookup ── */
    const selectedBomId = formData.finishedGoodId ? formData.bomFinishedGoodId : formData.bomId;
    const selectedBom = (formData.finishedGoodId ? fgBoms : boms).find(b => b.id === parseInt(selectedBomId));

    return (
        <div className="flex flex-col h-screen bg-gray-50">

            {/* ── Top Header ── */}
            <header className="bg-[#112255] border-b border-[#1a307a] px-6 py-3.5 flex items-center justify-between z-10 shadow-md">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/production-dashboard/manage-manufacturing-order')}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-white">{isEditing ? 'Edit Manufacturing Order' : 'Add Manufacturing Order'}</h1>
                        <p className="text-[11px] text-blue-300">Production → Manufacturing Orders</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    {!isEditing && (
                        <button type="button" onClick={handleAddFromSalesOrder}
                            className="px-4 py-2 text-sm font-semibold text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-1.5">
                            + Add from Sales Order
                        </button>
                    )}
                    <button type="button" onClick={() => navigate('/production-dashboard/manage-manufacturing-order')}
                        className="px-4 py-2 text-sm font-medium text-white/80 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" form="mo-form" disabled={submitting}
                        className="px-5 py-2 text-sm font-bold bg-white text-[#112255] rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60">
                        {submitting ? <Loader className="animate-spin h-4 w-4" /> : <Save size={15} />}
                        {isEditing ? 'Update Order' : 'Create Order'}
                    </button>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto">
                <form id="mo-form" onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* ── Basic Details ── */}
                    <SectionCard icon={Info} title="Basic Details">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Field label="MO Number" required>
                                <input type="text" name="moNumber" required value={formData.moNumber} onChange={handleChange} className={inputCls} placeholder="MO-XXXXXX" />
                            </Field>
                            <Field label="Location">
                                <select name="productionHouseId" value={formData.productionHouseId} onChange={handleChange} className={inputCls}>
                                    <option value="">Select Location</option>
                                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name || loc.locationName}</option>)}
                                    {!locations.length && <option value="HO">HO</option>}
                                </select>
                            </Field>
                            <Field label="Sales Order">
                                <select name="salesOrderId" value={formData.salesOrderId} onChange={handleChange} className={inputCls}>
                                    <option value="">Select Sales Order</option>
                                    {salesOrders.map(so => <option key={so.id} value={so.id}>{so.salesOrderNumber} – {so.customerName}</option>)}
                                </select>
                            </Field>
                            <Field label="Customer">
                                <select name="customerId" value={formData.customerId} onChange={handleChange} className={inputCls}>
                                    <option value="">Select Customer</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.companyName || c.primaryContactPerson}</option>)}
                                </select>
                            </Field>
                            <Field label="Reference No">
                                <input type="text" name="referenceNo" value={formData.referenceNo} onChange={handleChange} className={inputCls} placeholder="REF-XXXX" />
                            </Field>
                            <Field label="Status">
                                <select name="status" value={formData.status} onChange={handleChange} className={inputCls}>
                                    <option value="SCHEDULED">Scheduled</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </Field>
                        </div>
                    </SectionCard>

                    {/* ── Production Settings ── */}
                    <SectionCard icon={Settings2} title="Production Settings">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                            {/* Item Name (searchable) */}
                            <div className="sm:col-span-2 lg:col-span-2 relative">
                                <Field label="Item Name" required>
                                    <div className="relative">
                                        <input
                                            type="text" name="searchInput"
                                            value={formData.searchInput} onChange={handleChange}
                                            placeholder="Search Product, Raw Material, Finished Good..."
                                            className={`${inputCls} pr-8`} autoComplete="off" required
                                        />
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </Field>
                                {filteredItems.length > 0 && (
                                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                                        {filteredItems.map((item, i) => (
                                            <div key={i}
                                                className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0"
                                                onClick={() => handleChange({ target: { name: 'searchInput', value: item.label } })}
                                            >
                                                <span className="font-medium">{item.label.split(' - ')[0]}</span>
                                                <span className="text-xs text-gray-400 ml-2">— {item.label.split(' - ')[1]}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Field label="Category">
                                <select name="categoryId" value={formData.categoryId} onChange={handleChange} className={inputCls}>
                                    <option value="">Select Category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name || cat.categoryName}</option>)}
                                </select>
                            </Field>

                            <Field label="Subcategory">
                                <select name="subCategoryId" value={formData.subCategoryId} onChange={handleChange} className={inputCls} disabled={!formData.categoryId}>
                                    <option value="">Select Subcategory</option>
                                    {availableSubcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name || sub.subCategoryName}</option>)}
                                </select>
                            </Field>

                            <Field label="BOM (Bill of Materials)">
                                <select
                                    name={formData.finishedGoodId ? 'bomFinishedGoodId' : 'bomId'}
                                    value={formData.finishedGoodId ? (formData.bomFinishedGoodId || '') : (formData.bomId || '')}
                                    onChange={handleChange} className={inputCls}
                                    disabled={!formData.itemId && !formData.finishedGoodId}
                                >
                                    <option value="">Select BOM</option>
                                    {(formData.finishedGoodId ? fgBoms : boms).map(bom =>
                                        <option key={bom.id} value={bom.id}>{bom.bomName || bom.name}</option>
                                    )}
                                </select>
                            </Field>

                            <Field label="Quantity" required>
                                <input type="number" name="quantity" required step="0.01" value={formData.quantity} onChange={handleChange} className={inputCls} placeholder="0" />
                            </Field>

                            <Field label="Wastage %">
                                <input type="number" name="wastage" step="0.01" value={formData.wastage} onChange={handleChange} className={inputCls} placeholder="0.00" />
                            </Field>

                            <Field label="Batch No">
                                <input type="text" name="batchNo" value={formData.batchNo} onChange={handleChange} className={inputCls} placeholder="B-XXXX-XXX" />
                            </Field>

                            <Field label="Assign To">
                                <select name="assignToId" value={formData.assignToId} onChange={handleChange} className={inputCls}>
                                    <option value="">Select Employee</option>
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                                </select>
                            </Field>

                            {/* Hanger Specific */}
                            {isHangerTenant && (
                                <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-blue-50/60 rounded-xl border border-blue-100 mt-1">
                                    <Field label="Hanger Type (Wire Calc)">
                                        <select name="hangerTypeId" value={formData.hangerTypeId} onChange={handleChange} className={`${inputCls} border-blue-200`}>
                                            <option value="">Select Hanger Type</option>
                                            {hangerTypes.map(ht => <option key={ht.id} value={ht.id}>{ht.typeName} ({ht.standardWireGaugeMm}mm)</option>)}
                                        </select>
                                    </Field>
                                    {formData.hangerTypeId && (
                                        <>
                                            <Field label="Wire Gauge Required (mm)">
                                                <div className={readonlyCls}>{formData.wireGaugeRequired || '—'}</div>
                                            </Field>
                                            <Field label="Required Wire (Kg)">
                                                <div className="relative">
                                                    <div className={`${readonlyCls} font-bold text-blue-800`}>{formData.requiredWireKg || '—'}</div>
                                                    <Calculator size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400" />
                                                </div>
                                                <p className="text-[10px] text-blue-500 italic mt-0.5">Auto: (Qty × Unit Weight) / 1000</p>
                                            </Field>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Inline BOM preview */}
                        {selectedBom && (
                            <div className="mt-4 border-t border-gray-100 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Selected BOM</h4>
                                    <button type="button" onClick={() => { setSelectedBOMData(selectedBom); setShowBOMModal(true); }}
                                        className="text-xs text-[#112255] font-bold hover:underline">View BOM Details →</button>
                                </div>
                                <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700 border border-gray-100">
                                    <span className="font-semibold">{selectedBom.bomName || selectedBom.name}</span>
                                    {selectedBom.approximateCost && <span className="text-gray-400 ml-3 text-xs">Approx. Cost: <strong className="text-gray-600">{selectedBom.approximateCost}</strong></span>}
                                </div>
                            </div>
                        )}
                    </SectionCard>

                    {/* ── Schedule & Timeline ── */}
                    <SectionCard icon={Clock} title="Schedule & Timeline">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Field label="Schedule Start">
                                <input type="datetime-local" name="scheduleStart" value={formData.scheduleStart} onChange={handleChange} className={inputCls} />
                            </Field>
                            <Field label="Schedule Finish">
                                <input type="datetime-local" name="scheduleFinish" value={formData.scheduleFinish} onChange={handleChange} className={inputCls} />
                            </Field>
                            <Field label="Due Date">
                                <input type="datetime-local" name="dueDate" value={formData.dueDate} onChange={handleChange} className={inputCls} />
                            </Field>
                            <Field label="Actual Start">
                                <input type="datetime-local" name="actualStart" value={formData.actualStart} onChange={handleChange} className={inputCls} />
                            </Field>
                            <Field label="Actual Finish">
                                <input type="datetime-local" name="actualFinish" value={formData.actualFinish} onChange={handleChange} className={inputCls} />
                            </Field>
                        </div>
                    </SectionCard>

                    {/* ── Attachments ── */}
                    <SectionCard icon={FileText} title="Attachments">
                        <div className="space-y-3">
                            <input type="file" onChange={handleFileChange}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                            {existingFiles?.length > 0 && (
                                <div className="space-y-2 mt-3">
                                    {existingFiles.map((f, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <FileText size={16} className="text-blue-500" />
                                                <button type="button" onClick={() => handleViewFile(f.id)}
                                                    className="text-blue-600 text-sm font-medium hover:underline">{f.fileName}</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </SectionCard>

                    {/* ── Production Batches (Hanger) ── */}
                    {isEditing && isHangerTenant && (
                        <SectionCard icon={Layers} title="Production Batches">
                            <div className="flex justify-end mb-3">
                                <button type="button" onClick={() => navigate(`/production-dashboard/hanger/batches/new?moId=${id}`)}
                                    className="text-sm font-semibold text-[#112255] hover:underline flex items-center gap-1">
                                    + Add New Batch
                                </button>
                            </div>
                            {moBatches.length > 0 ? (
                                <div className="overflow-x-auto rounded-lg border border-gray-100">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-[11px] uppercase text-gray-400 font-bold border-b border-gray-100">
                                            <tr>
                                                <th className="px-4 py-2.5">Batch No</th>
                                                <th className="px-4 py-2.5">Stage</th>
                                                <th className="px-4 py-2.5">Status</th>
                                                <th className="px-4 py-2.5 text-right">Qty</th>
                                                <th className="px-4 py-2.5 w-8"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {moBatches.map(batch => (
                                                <tr key={batch.id} className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                                                    onClick={() => navigate(`/production-dashboard/hanger/batches/${batch.id}`)}>
                                                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 group-hover:text-primary">{batch.batchNo}</td>
                                                    <td className="px-4 py-3 text-xs">
                                                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 uppercase tracking-tight font-medium">
                                                            {batch.currentStage?.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs font-semibold">{batch.status}</td>
                                                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-700">{batch.plannedQty}</td>
                                                    <td className="px-4 py-3 text-right text-gray-300 group-hover:text-primary">
                                                        <ChevronRight size={15} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                    <Layers size={28} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-400">No batches for this order yet.</p>
                                    <button type="button" onClick={() => navigate(`/production-dashboard/hanger/batches/new?moId=${id}`)}
                                        className="mt-2 text-xs font-bold text-[#112255] uppercase hover:underline">
                                        Start Batch Production
                                    </button>
                                </div>
                            )}
                        </SectionCard>
                    )}

                    {/* ── Help Banner ── */}
                    {!isEditing && (
                        <div className="flex items-start gap-3 p-4 bg-[#112255]/[0.04] rounded-xl border border-[#112255]/10">
                            <Info size={16} className="text-[#112255] mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-[#112255]/80">
                                <p className="font-semibold mb-0.5 text-[#112255]">Need assistance with your Bill of Materials?</p>
                                <p>You can import existing BOM configurations or create new ones in the Production Settings. Changes to quantities will automatically update requirement estimates.</p>
                            </div>
                        </div>
                    )}
                </form>
            </main>

            {/* ── BOM Slideout ── */}
            <AnimatePresence>
                {showBOMModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setShowBOMModal(false)} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-5xl bg-white shadow-2xl z-50 flex flex-col">
                            <ViewBomInformation
                                bomId={selectedBOMData?.id}
                                bomType={formData.finishedGoodId ? 'FINISHED_GOOD' : 'SEMI_FINISHED'}
                                onClose={() => setShowBOMModal(false)}
                                quantity={formData.quantity || 1}
                                startDate={formData.actualStart}
                                endDate={formData.actualFinish}
                            />
                        </motion.div>
                    </>
                )}

                {/* ── Sales Order Modal ── */}
                {showSOModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setShowSOModal(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="text-base font-bold text-gray-800">Select Sales Order</h3>
                                    <button onClick={() => setShowSOModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="p-4 overflow-y-auto flex-grow space-y-2">
                                    {salesOrders.length === 0 ? (
                                        <p className="text-center text-gray-400 py-8 text-sm">No Sales Orders found.</p>
                                    ) : salesOrders.map(so => (
                                        <div key={so.id} onClick={() => selectSalesOrder(so)}
                                            className="p-3.5 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 cursor-pointer flex justify-between items-center transition-all group">
                                            <div>
                                                <div className="font-semibold text-gray-800 text-sm">{so.salesOrderNumber}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">{so.customerName} · {so.salesOrderDate}</div>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManufacturingOrderForm;
