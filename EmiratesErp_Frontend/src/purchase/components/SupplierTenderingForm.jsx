import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';

import axios from 'axios';
import { Plus, Trash2, Save, Loader, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const Input = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
);

const Select = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
        <select {...props} className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {children}
        </select>
    </div>
);

const SupplierTenderingForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const isEditing = !!id;

    const [form, setForm] = useState({
        transactionType: 'RFQ',
        initiatedBy: '',
        requiredDate: new Date().toISOString().split('T')[0],
        project: '',
        entity: '',
        tenderingCurrency: 'AED',
        basisType: 'Manual',
        basisId: '',
        warehouseId: '',
        status: 'DRAFT',
        items: [],
        suppliers: [],
        questions: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [masterSuppliers, setMasterSuppliers] = useState([]);
    const [masterItems, setMasterItems] = useState([]);
    const [masterQuestions, setMasterQuestions] = useState([]);

    const [sourceRequisitionId, setSourceRequisitionId] = useState(null);

    useEffect(() => {
        if (location.state?.requisitionData && !isEditing) {
            const req = location.state.requisitionData;
            
            if (req.id) {
                setSourceRequisitionId(req.id);
            }

            const mappedItems = (req.items || []).map((item, index) => {
                // Try to match with masterItems to get itemKey
                const found = masterItems.find(m => String(m.id) === String(item.itemId));
                
                return {
                    lineNumber: index + 1,
                    itemId: item.itemId || '',
                    itemName: item.itemName || '',
                    itemKey: found ? found.uniqueKey : '',
                    content: item.content || '',
                    quantity: item.quantity || 1,
                    uom: item.uom || ''
                };
            });

            setForm(prev => ({
                ...prev,
                basisId: req.requisitionNumber || prev.basisId,
                basisType: 'Requisition',
                project: [req.basis, req.comment].filter(Boolean).join(' - ') || prev.project,
                items: mappedItems
            }));
        }
    }, [location.state, isEditing, masterItems]);


    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [supRes, rawRes, semiRes, fgRes, prodRes, qRes, tenantRes] = await Promise.allSettled([
                    axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } }),
                    axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/production/semi-finished`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/production/finished-goods`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/crm/products`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/purchases/rfq-questions`, { headers, params: { page: 0, size: 500 } }),
                    axios.get(`${API_URL}/pos/tenant/current`, { headers })
                ]);

                setMasterSuppliers(supRes.status === 'fulfilled' ? (supRes.value.data.content || supRes.value.data || []) : []);
                setMasterQuestions(qRes.status === 'fulfilled' ? (qRes.value.data?.content || []) : []);

                const tenantName = (tenantRes.status === 'fulfilled' && tenantRes.value.data) ? tenantRes.value.data.name : '';

                const combinedItems = [];
                if (rawRes.status === 'fulfilled') {
                    const data = rawRes.value.data.content || rawRes.value.data || [];
                    combinedItems.push(...data.map(m => ({ ...m, uniqueKey: `RAW-${m.id}`, categoryLabel: 'Raw Material' })));
                }
                if (semiRes.status === 'fulfilled') {
                    const data = semiRes.value.data.content || semiRes.value.data || [];
                    combinedItems.push(...data.map(m => ({ ...m, uniqueKey: `SEMI-${m.id}`, categoryLabel: 'Semi-Finished' })));
                }
                if (fgRes.status === 'fulfilled') {
                    const data = fgRes.value.data.content || fgRes.value.data || [];
                    combinedItems.push(...data.map(m => ({ ...m, uniqueKey: `FG-${m.id}`, categoryLabel: 'Finished Good' })));
                }
                if (prodRes.status === 'fulfilled') {
                    const data = prodRes.value.data.content || prodRes.value.data || [];
                    combinedItems.push(...data.map(m => ({ ...m, uniqueKey: `PROD-${m.id}`, categoryLabel: 'Product' })));
                }
                setMasterItems(combinedItems);

                if (isEditing) {
                    const res = await axios.get(`${API_URL}/purchases/supplier-tendering/${id}`, { headers });
                    const data = res.data;
                    
                    // Pre-map itemKey for existing items to ensure they show up in dropdowns
                    const mappedItems = (data.items || []).map(it => {
                        const found = combinedItems.find(m => String(m.id) === String(it.itemId) && m.name === it.itemName) 
                                      || combinedItems.find(m => String(m.id) === String(it.itemId));
                        return { ...it, itemKey: found ? found.uniqueKey : '' };
                    });

                    setForm({
                        ...data,
                        requiredDate: data.requiredDate ? new Date(data.requiredDate).toISOString().split('T')[0] : '',
                        items: mappedItems,
                        suppliers: data.suppliers || [],
                        questions: data.questions || []
                    });
                } else if (tenantName) {
                    setForm(prev => ({ ...prev, entity: tenantName }));
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load required data.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // --- Items ---
    const addItem = () => {
        setForm(prev => ({
            ...prev,
            items: [...prev.items, { lineNumber: '', itemId: '', itemName: '', content: '', quantity: 1, uom: '' }]
        }));
    };
    const handleItemChange = (idx, field, value) => {
        const newItems = [...form.items];
        newItems[idx][field] = value;
        setForm(prev => ({ ...prev, items: newItems }));
    };
    const removeItem = (idx) => {
        setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
    };

    // --- Suppliers ---
    const addSupplier = () => {
        setForm(prev => ({
            ...prev,
            suppliers: [...prev.suppliers, { supplierId: '', supplierName: '', contractType: '', contactPerson: '', email: '' }]
        }));
    };
    const handleSupplierChange = (idx, field, value) => {
        const newSups = [...form.suppliers];
        newSups[idx][field] = value;
        setForm(prev => ({ ...prev, suppliers: newSups }));
    };
    const removeSupplier = (idx) => {
        setForm(prev => ({ ...prev, suppliers: prev.suppliers.filter((_, i) => i !== idx) }));
    };

    // --- Questions ---
    const addQuestion = () => {
        setForm(prev => ({
            ...prev,
            questions: [...prev.questions, { questionId: '', questionText: '' }]
        }));
    };
    const handleQuestionChange = (idx, field, value) => {
        const newQs = [...form.questions];
        newQs[idx][field] = value;
        setForm(prev => ({ ...prev, questions: newQs }));
    };
    const removeQuestion = (idx) => {
        setForm(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== idx) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation: Ensure all suppliers have an ID selected
        const invalidSupplier = form.suppliers.find(s => !s.supplierId);
        if (invalidSupplier) {
            setError('Please select a supplier for all supplier entries or remove empty ones.');
            window.scrollTo(0,0);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            if (isEditing) {
                await axios.put(`${API_URL}/purchases/supplier-tendering/${id}`, form, { headers });
            } else {
                await axios.post(`${API_URL}/purchases/supplier-tendering`, form, { headers });
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

            navigate('/purchase-dashboard/supplier-tendering');

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save tendering.');
            window.scrollTo(0,0);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isEditing) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" size={32} /></div>;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow min-h-screen">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-slate-800">{isEditing ? `Edit Tendering` : 'New Supply Tendering'}</h1>
                <Link to="/purchase-dashboard/supplier-tendering" className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                    <ArrowLeft size={18} /> Back to List
                </Link>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-6 border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-4 rounded-md border">
                    {isEditing && (
                        <div className="md:col-span-3 mb-2">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Tender Number</label>
                            <input 
                                type="text" 
                                value={form.tenderNumber || ''} 
                                readOnly 
                                className="w-full px-3 py-2 border rounded-md text-sm bg-slate-100 text-slate-700 font-bold" 
                            />
                        </div>
                    )}
                    <Input label="Transaction Type" name="transactionType" value={form.transactionType} onChange={handleChange} />
                    <Input label="Initiated By" name="initiatedBy" value={form.initiatedBy} onChange={handleChange} />
                    <Input label="Required Date" name="requiredDate" type="date" value={form.requiredDate} onChange={handleChange} required />
                    <Input label="Project" name="project" value={form.project} onChange={handleChange} />
                    <Input label="Entity" name="entity" value={form.entity} onChange={handleChange} />
                    <Input label="Currency" name="tenderingCurrency" value={form.tenderingCurrency} onChange={handleChange} />
                    <Input label="Basis Type" name="basisType" value={form.basisType} onChange={handleChange} />
                    <Input label="Basis ID" name="basisId" value={form.basisId} onChange={handleChange} />
                    <Input label="Warehouse ID" name="warehouseId" value={form.warehouseId} onChange={handleChange} />
                    <Select label="Status" name="status" value={form.status} onChange={handleChange}>
                        <option value="DRAFT">Draft</option>
                        <option value="REQUESTS_FOR_QUOTATION">Requests for Quotation</option>
                        <option value="RFQ_RESPONSES">RFQ Responses</option>
                        <option value="COMPARISON">Comparison</option>
                        <option value="COMPARISON_COMPLETED">Comparison Completed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </Select>
                </div>

                {/* Items */}
                <div className="border rounded-md">
                    <div className="bg-slate-100 p-3 flex justify-between items-center font-semibold">
                        <span>Items Needed</span>
                        <button type="button" onClick={addItem} className="text-sm bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"><Plus size={14}/> Add Item</button>
                    </div>
                    <div className="p-4 space-y-3 bg-white">
                        {form.items.map((it, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-4 items-end border-b pb-3">
                                <div className="w-full md:w-20">
                                    <label className="block text-xs text-slate-500 mb-1">Line #</label>
                                    <input type="number" min="1" value={it.lineNumber || ''} onChange={e => handleItemChange(idx, 'lineNumber', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" />
                                </div>
                                <div className="w-full md:flex-1">
                                    <label className="block text-xs text-slate-500 mb-1">Item</label>
                                    <select value={it.itemKey || masterItems.find(m => String(m.id) === String(it.itemId) && m.name === it.itemName)?.uniqueKey || masterItems.find(m => String(m.id) === String(it.itemId))?.uniqueKey || ''} onChange={e => {
                                        const val = e.target.value;
                                        handleItemChange(idx, 'itemKey', val);
                                        const found = masterItems.find(m => m.uniqueKey === val);
                                        if (found) {
                                            handleItemChange(idx, 'itemId', found.id);
                                            handleItemChange(idx, 'itemName', found.name);
                                        } else {
                                            handleItemChange(idx, 'itemId', '');
                                            handleItemChange(idx, 'itemName', '');
                                        }
                                    }} className="w-full p-2 border rounded text-sm bg-white">
                                        <option value="">Select Item</option>
                                        {masterItems.map(m => <option key={m.uniqueKey} value={m.uniqueKey}>[{m.categoryLabel}] {m.name}</option>)}
                                    </select>
                                </div>
                                <div className="w-full md:flex-1">
                                    <label className="block text-xs text-slate-500 mb-1">Content / Specs</label>
                                    <input type="text" value={it.content || ''} onChange={e => handleItemChange(idx, 'content', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" placeholder="Details..." />
                                </div>
                                <div className="w-full md:w-24">
                                    <label className="block text-xs text-slate-500 mb-1">Quantity</label>
                                    <input type="number" min="1" value={it.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" />
                                </div>
                                <div className="w-full md:w-20">
                                    <label className="block text-xs text-slate-500 mb-1">UOM</label>
                                    <input type="text" value={it.uom || ''} onChange={e => handleItemChange(idx, 'uom', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" />
                                </div>
                                <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded mb-1"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Suppliers */}
                <div className="border rounded-md">
                    <div className="bg-slate-100 p-3 flex justify-between items-center font-semibold">
                        <span>Suppliers</span>
                        <button type="button" onClick={addSupplier} className="text-sm bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"><Plus size={14}/> Add Supplier</button>
                    </div>
                    <div className="p-4 space-y-3 bg-white">
                        {form.suppliers.map((sup, idx) => (
                            <div key={idx} className="flex flex-col gap-3 border-b pb-4">
                                <div className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs text-slate-500 mb-1">Supplier</label>
                                        <select value={sup.supplierId || ''} onChange={e => {
                                            const val = e.target.value;
                                            handleSupplierChange(idx, 'supplierId', val);
                                            const found = masterSuppliers.find(m => String(m.id) === String(val));
                                            if (found) {
                                                handleSupplierChange(idx, 'supplierName', found.companyName || found.name);
                                                handleSupplierChange(idx, 'email', found.email || '');
                                                handleSupplierChange(idx, 'contactPerson', found.contactPerson || '');
                                            }
                                        }} className="w-full p-2 border rounded text-sm bg-white">
                                            <option value="">Select Supplier</option>
                                            {masterSuppliers.map(m => <option key={m.id} value={m.id}>{m.companyName || m.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="w-full md:w-32">
                                        <label className="block text-xs text-slate-500 mb-1">Contract Type</label>
                                        <input type="text" value={sup.contractType || ''} onChange={e => handleSupplierChange(idx, 'contractType', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" placeholder="e.g. Contract" />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs text-slate-500 mb-1">Contact Person</label>
                                        <input type="text" value={sup.contactPerson || ''} onChange={e => handleSupplierChange(idx, 'contactPerson', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs text-slate-500 mb-1">Email</label>
                                        <input type="email" value={sup.email || ''} onChange={e => handleSupplierChange(idx, 'email', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" />
                                    </div>
                                    <button type="button" onClick={() => removeSupplier(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded mb-1"><Trash2 size={16}/></button>
                                </div>
                                {form.items.length > 0 && (
                                    <div className="w-full p-3 bg-slate-50 border rounded border-slate-200 text-sm">
                                        <div className="font-semibold text-slate-700 mb-2">Items Supplied:</div>
                                        <div className="flex flex-wrap gap-4">
                                            {form.items.map((item, itemIdx) => {
                                                const sItems = sup.supplierItems || [];
                                                const isSelected = sItems.length > itemIdx ? sItems[itemIdx].selected !== false : true;
                                                
                                                return (
                                                    <label key={itemIdx} className="flex items-center gap-2 cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                const newSups = [...form.suppliers];
                                                                let currentSItems = newSups[idx].supplierItems || [];
                                                                if (currentSItems.length === 0) {
                                                                    currentSItems = form.items.map(() => ({ selected: true }));
                                                                } else {
                                                                    currentSItems = [...currentSItems];
                                                                }
                                                                // Ensure we have enough items if items were added after supplier
                                                                while (currentSItems.length < form.items.length) {
                                                                    currentSItems.push({ selected: true });
                                                                }
                                                                currentSItems[itemIdx] = { ...currentSItems[itemIdx], selected: e.target.checked };
                                                                newSups[idx].supplierItems = currentSItems;
                                                                setForm(prev => ({ ...prev, suppliers: newSups }));
                                                            }}
                                                            className="rounded text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-slate-600">{item.itemName || `Line ${item.lineNumber || itemIdx + 1}`}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Questions */}
                <div className="border rounded-md">
                    <div className="bg-slate-100 p-3 flex justify-between items-center font-semibold">
                        <span>Pre-Qualification Questions</span>
                        <button type="button" onClick={addQuestion} className="text-sm bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"><Plus size={14}/> Add Question</button>
                    </div>
                    <div className="p-4 space-y-3 bg-white">
                        {form.questions.map((q, idx) => (
                            <div key={idx} className="flex gap-4 items-end border-b pb-3">
                                <div className="flex-1">
                                    <label className="block text-xs text-slate-500 mb-1">Master Question</label>
                                    <select value={q.questionId || ''} onChange={e => {
                                        const val = e.target.value;
                                        handleQuestionChange(idx, 'questionId', val);
                                        const found = masterQuestions.find(m => String(m.id) === String(val));
                                        if (found) handleQuestionChange(idx, 'questionText', found.questionText);
                                    }} className="w-full p-2 border rounded text-sm bg-white">
                                        <option value="">Custom Question</option>
                                        {masterQuestions.map(m => <option key={m.id} value={m.id}>{m.questionText}</option>)}
                                    </select>
                                </div>
                                <div className="flex-[2]">
                                    <label className="block text-xs text-slate-500 mb-1">Question Text</label>
                                    <input type="text" value={q.questionText || ''} onChange={e => handleQuestionChange(idx, 'questionText', e.target.value)} className="w-full p-2 border rounded text-sm" />
                                </div>
                                <button type="button" onClick={() => removeQuestion(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => navigate('/purchase-dashboard/supplier-tendering')} className="px-6 py-2 border rounded-md hover:bg-slate-50 text-slate-600">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2" disabled={loading}>
                        {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                        {isEditing ? 'Update Tendering' : 'Save Tendering'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SupplierTenderingForm;
