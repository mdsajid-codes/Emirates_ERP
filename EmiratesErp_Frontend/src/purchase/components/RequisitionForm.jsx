import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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

const RequisitionForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [form, setForm] = useState({
        requisitionNumber: '',
        requisitionDate: new Date().toISOString().split('T')[0],
        status: 'DRAFT',
        requestedBy: '',
        recipient: '',
        requiredDate: '',
        entity: '',
        basis: '',
        comment: '',
        items: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [masterItems, setMasterItems] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch tenant info for default entity name
                const tenantRes = await axios.get(`${API_URL}/pos/tenant/current`, { headers });
                const tenantName = tenantRes.data?.name || '';

                // Fetch master items from multiple sources
                const [rawRes, semiRes, fgRes, prodRes] = await Promise.allSettled([
                    axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/production/semi-finished`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/production/finished-goods`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/crm/products`, { headers, params: { page: 0, size: 1000 } })
                ]);

                const combinedItems = [];
                if (rawRes.status === 'fulfilled') combinedItems.push(...(rawRes.value.data.content || rawRes.value.data || []).map(m => ({ ...m, uniqueKey: `RAW-${m.id}`, categoryLabel: 'Raw Material' })));
                if (semiRes.status === 'fulfilled') combinedItems.push(...(semiRes.value.data.content || semiRes.value.data || []).map(m => ({ ...m, uniqueKey: `SEMI-${m.id}`, categoryLabel: 'Semi-Finished' })));
                if (fgRes.status === 'fulfilled') combinedItems.push(...(fgRes.value.data.content || fgRes.value.data || []).map(m => ({ ...m, uniqueKey: `FG-${m.id}`, categoryLabel: 'Finished Good' })));
                if (prodRes.status === 'fulfilled') combinedItems.push(...(prodRes.value.data.content || prodRes.value.data || []).map(m => ({ ...m, uniqueKey: `PROD-${m.id}`, categoryLabel: 'Product' })));
                
                setMasterItems(combinedItems);

                if (isEditing) {
                    const res = await axios.get(`${API_URL}/purchases/requisitions/${id}`, { headers });
                    const data = res.data;
                    setForm({
                        ...data,
                        requisitionDate: data.requisitionDate ? new Date(data.requisitionDate).toISOString().split('T')[0] : '',
                        requiredDate: data.requiredDate ? new Date(data.requiredDate).toISOString().split('T')[0] : '',
                        items: data.items || []
                    });
                } else {
                    setForm(prev => ({ ...prev, entity: tenantName }));
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load required data.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const addItem = () => {
        setForm(prev => ({
            ...prev,
            items: [...prev.items, { resourceType: '', itemId: '', itemName: '', characteristic: '', content: '', uom: '', quantity: 1, comment: '' }]
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            if (isEditing) {
                await axios.put(`${API_URL}/purchases/requisitions/${id}`, form, { headers });
            } else {
                await axios.post(`${API_URL}/purchases/requisitions`, form, { headers });
            }
            navigate('/purchase-dashboard/requisitions');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save requisition.');
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isEditing) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" size={32} /></div>;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow min-h-screen">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-slate-800">{isEditing ? `Edit Requisition` : 'New Purchase Requisition'}</h1>
                <Link to="/purchase-dashboard/requisitions" className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                    <ArrowLeft size={18} /> Back to List
                </Link>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-6 border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-4 rounded-md border">
                    <Input label="Requisition Number" name="requisitionNumber" value={form.requisitionNumber} onChange={handleChange} placeholder="Auto Generate" />

                    <Input label="Requisition Date" name="requisitionDate" type="date" value={form.requisitionDate} onChange={handleChange} required />
                    <Select label="Status" name="status" value={form.status} onChange={handleChange}>
                        <option value="DRAFT">Draft</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CANCELLED">Cancelled</option>
                    </Select>
                    <Input label="Requested By" name="requestedBy" value={form.requestedBy} onChange={handleChange} required />
                    <Input label="Recipient" name="recipient" value={form.recipient} onChange={handleChange} />
                    <Input label="Required Date" name="requiredDate" type="date" value={form.requiredDate} onChange={handleChange} />
                    <Input label="Entity" name="entity" value={form.entity} onChange={handleChange} />
                    <Input label="Basis" name="basis" value={form.basis} onChange={handleChange} />
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Comment</label>
                        <textarea name="comment" value={form.comment} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows="2" />
                    </div>
                </div>

                {/* Items */}
                <div className="border rounded-md">
                    <div className="bg-slate-100 p-3 flex justify-between items-center font-semibold text-slate-700">
                        <span>Requisition Items</span>
                        <button type="button" onClick={addItem} className="text-sm bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 active:scale-95 transition-transform"><Plus size={14} /> Add Item</button>
                    </div>
                    <div className="p-4 space-y-3 bg-white overflow-x-auto">
                        <div className="min-w-[1000px]">
                            {form.items.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 border-2 border-dashed rounded-md">No items added yet. Click 'Add Item' to start.</div>
                            ) : (
                                form.items.map((it, idx) => (
                                    <div key={idx} className="flex gap-4 items-end border-b pb-3 mb-3 last:border-0 last:mb-0">
                                        <div className="w-40">
                                            <label className="block text-xs text-slate-500 mb-1">Resource Type</label>
                                            <input type="text" value={it.resourceType || ''} onChange={e => handleItemChange(idx, 'resourceType', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" placeholder="e.g. Raw Material" />
                                        </div>
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-xs text-slate-500 mb-1">Item</label>
                                            <select 
                                                value={it.itemId || ''} 
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    const found = masterItems.find(m => String(m.id) === String(val));
                                                    handleItemChange(idx, 'itemId', val);
                                                    if (found) {
                                                        handleItemChange(idx, 'itemName', found.name);
                                                        handleItemChange(idx, 'uom', found.uom || '');
                                                        handleItemChange(idx, 'resourceType', found.categoryLabel || '');
                                                    }
                                                }} 
                                                className="w-full p-2 border rounded text-sm bg-white"
                                            >
                                                <option value="">Select Item</option>
                                                {masterItems.map(m => <option key={m.uniqueKey} value={m.id}>{m.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-slate-500 mb-1">Specification/Content</label>
                                            <input type="text" value={it.content || ''} onChange={e => handleItemChange(idx, 'content', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" placeholder="Details..." />
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs text-slate-500 mb-1">Quantity</label>
                                            <input type="number" min="1" value={it.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" />
                                        </div>
                                        <div className="w-20">
                                            <label className="block text-xs text-slate-500 mb-1">UOM</label>
                                            <input type="text" value={it.uom || ''} onChange={e => handleItemChange(idx, 'uom', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-slate-500 mb-1">Item Comment</label>
                                            <input type="text" value={it.comment || ''} onChange={e => handleItemChange(idx, 'comment', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" />
                                        </div>
                                        <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded mb-1 active:scale-90 transition-transform"><Trash2 size={16} /></button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => navigate('/purchase-dashboard/requisitions')} className="px-6 py-2 border rounded-md hover:bg-slate-50 text-slate-600 active:scale-95 transition-transform">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 active:scale-95 transition-transform" disabled={loading}>
                        {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                        {isEditing ? 'Update Requisition' : 'Save Requisition'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RequisitionForm;
