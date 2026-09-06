import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Trash2, PlusCircle, Loader, Search, X, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-foreground-muted hover:bg-background-muted"><X size={20} /></button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

const LeadStageForm = ({ item, onSave, onCancel, loading, locations }) => {
    const [formData, setFormData] = useState({
        name: '',
        isDefault: false,
        locationId: '',
        moveTo: '',
        isConverted: false,
        isWon: false,
        isMql: false,
        isSql: false,
        probability: '',
        assignTo: false
    });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                isDefault: item.isDefault || false,
                locationId: item.locationId || '',
                moveTo: item.moveTo || '',
                isConverted: item.isConverted || false,
                isWon: item.isWon || false,
                isMql: item.isMql || false,
                isSql: item.isSql || false,
                probability: item.probability || '',
                assignTo: item.assignTo || false
            });
        } else {
            setFormData({
                name: '', isDefault: false, locationId: '', moveTo: '',
                isConverted: false, isWon: false, isMql: false, isSql: false,
                probability: '', assignTo: false
            });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ id: item?.id, ...formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-foreground-muted">Stage Name</label>
                    <input id="name" name="name" value={formData.name} onChange={handleChange} required className="input mt-1 bg-background-muted border-border text-foreground w-full" placeholder="e.g., New, Qualified, Proposal" />
                </div>

                <div>
                    <label htmlFor="locationId" className="block text-sm font-medium text-foreground-muted">Location (Optional)</label>
                    <select id="locationId" name="locationId" value={formData.locationId} onChange={handleChange} className="input mt-1 bg-background-muted border-border text-foreground w-full">
                        <option value="">Select Location</option>
                        {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="moveTo" className="block text-sm font-medium text-foreground-muted">Move To (Action)</label>
                    <select id="moveTo" name="moveTo" value={formData.moveTo} onChange={handleChange} className="input mt-1 bg-background-muted border-border text-foreground w-full">
                        <option value="">Select Action</option>
                        <option value="QUOTATION">Quotation</option>
                        <option value="SALES_ORDER">Sales Order</option>
                        <option value="INVOICE">Invoice</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="probability" className="block text-sm font-medium text-foreground-muted">Probability (%)</label>
                    <input type="number" id="probability" name="probability" value={formData.probability} onChange={handleChange} className="input mt-1 bg-background-muted border-border text-foreground w-full" placeholder="0-100" min="0" max="100" step="0.1" />
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} className="h-4 w-4 rounded" /> Default</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" name="isConverted" checked={formData.isConverted} onChange={handleChange} className="h-4 w-4 rounded" /> Converted</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" name="isWon" checked={formData.isWon} onChange={handleChange} className="h-4 w-4 rounded" /> Won</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" name="isMql" checked={formData.isMql} onChange={handleChange} className="h-4 w-4 rounded" /> MQL</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" name="isSql" checked={formData.isSql} onChange={handleChange} className="h-4 w-4 rounded" /> SQL</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" name="assignTo" checked={formData.assignTo} onChange={handleChange} className="h-4 w-4 rounded" /> Assign To</label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>Cancel</button>
                <button type="submit" className="btn-primary flex items-center" disabled={loading}>
                    {loading && <Loader className="animate-spin h-4 w-4 mr-2" />} Save
                </button>
            </div>
        </form>
    );
};

const CrmLeadStage = ({ locationId }) => {
    const [stages, setStages] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [stagesRes, locationsRes] = await Promise.all([
                axios.get(`${API_URL}/crm/lead-stages`, { headers: authHeaders }),
                axios.get(`${API_URL}/locations`, { headers: authHeaders }),
            ]);
            setStages(Array.isArray(stagesRes.data) ? stagesRes.data : []);
            setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
        } catch (err) {
            setError('Failed to fetch data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = () => {
        setEditingItem({ locationId: locationId !== 'all' ? locationId : '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => { setIsModalOpen(false); setEditingItem(null); };

    const handleSave = async (itemData) => {
        setModalLoading(true);
        const payload = { ...itemData, locationId: itemData.locationId || null };
        const isUpdating = Boolean(itemData.id);
        const url = isUpdating ? `${API_URL}/crm/lead-stages/${itemData.id}` : `${API_URL}/crm/lead-stages`;
        const method = isUpdating ? 'put' : 'post';

        try {
            await axios[method](url, itemData, { headers: authHeaders });
            await fetchData();
            handleCloseModal();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save lead stage.'}`);
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdateField = async (id, field, value) => {
        // Find current item to get name (required) and other fields
        const item = stages.find(s => s.id === id);
        if (!item) return;

        const payload = {
            name: item.name,
            sortOrder: item.sortOrder,
            isDefault: item.isDefault,
            locationId: item.locationId,
            moveTo: item.moveTo,
            isConverted: item.isConverted,
            isWon: item.isWon,
            isMql: item.isMql,
            isSql: item.isSql,
            probability: item.probability,
            assignTo: item.assignTo,
            [field]: value
        };

        try {
            await axios.put(`${API_URL}/crm/lead-stages/${id}`, payload, { headers: authHeaders });
            await fetchData();
        } catch (err) {
            console.error(err);
            alert(`Error updating stage: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this lead stage?')) {
            try {
                await axios.delete(`${API_URL}/crm/lead-stages/${id}`, { headers: authHeaders });
                await fetchData();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete lead stage.'}`);
            }
        }
    };

    const handleMove = async (id, direction) => {
        try {
            await axios.post(`${API_URL}/crm/lead-stages/${id}/move-${direction}`, {}, { headers: authHeaders });
            await fetchData();
        } catch (err) {
            alert(`Error moving stage: ${err.response?.data?.message || 'Operation failed.'}`);
        }
    };

    const filteredData = useMemo(() => {
        let filtered = stages;
        if (locationId === 'none') {
            filtered = stages.filter(item => !item.locationId);
        } else if (locationId && locationId !== 'all') {
            filtered = stages.filter(item => String(item.locationId) === String(locationId));
        }
        return filtered.filter(item => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => a.sortOrder - b.sortOrder);
    }, [stages, searchTerm, locationId]);

    return (
        <div className="p-4 sm:p-5 bg-white text-[#102A43]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-bold text-[#102A43]">Manage Lead Stages</h3>
                <div className="flex items-center gap-2.5">
                    <div className="relative flex-1 sm:w-64">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-3 pr-9 py-1.5 bg-[#F8FAFC] border border-[#D7E3EE] rounded-lg text-xs text-[#102A43] placeholder-[#60738E] focus:outline-none focus:border-[#0178BC] focus:bg-white transition-all h-9"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#60738E]" />
                    </div>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#D7E3EE] hover:bg-slate-50 text-[#102A43] rounded-lg text-xs font-semibold shadow-2xs transition-colors shrink-0 h-9 cursor-pointer"
                    >
                        <PlusCircle size={15} className="text-[#0178BC]" /> Add Stage
                    </button>
                </div>
            </div>

            {error && <p className="text-xs text-red-500 mb-3 bg-red-50 p-2.5 rounded border border-red-200">{error}</p>}

            <div className="overflow-x-auto border border-[#E1E9F0] rounded-xl shadow-2xs bg-white">
                <table className="w-full text-left border-collapse min-w-full">
                    <thead>
                        <tr className="bg-[#F4F8FB] border-b border-[#E1E9F0] text-[10px] font-bold text-[#486581] uppercase tracking-tight">
                            <th className="py-2.5 px-2 text-center font-bold">S.NO.</th>
                            <th className="py-2.5 px-2 font-bold min-w-[140px]">STATUS NAME</th>
                            <th className="py-2.5 px-1.5 text-center font-bold">DEFAULT</th>
                            <th className="py-2.5 px-1.5 text-center font-bold">CONVERTED</th>
                            <th className="py-2.5 px-1.5 text-center font-bold">WON</th>
                            <th className="py-2.5 px-1.5 text-center font-bold">MQL</th>
                            <th className="py-2.5 px-1.5 text-center font-bold">SQL</th>
                            <th className="py-2.5 px-2 font-bold min-w-[120px]">MOVE TO</th>
                            <th className="py-2.5 px-2 font-bold text-center">PROBABILITY</th>
                            <th className="py-2.5 px-1.5 text-center font-bold">ASSIGN TO</th>
                            <th className="py-2.5 px-2 text-center font-bold">ACTION</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E9F0] text-xs text-[#102A43]">
                        {loading ? (
                            <tr>
                                <td colSpan="11" className="text-center py-12">
                                    <Loader className="animate-spin h-7 w-7 text-[#0178BC] mx-auto" />
                                </td>
                            </tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item, index, arr) => (
                                <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                                    <td className="py-2.5 px-3 text-center font-semibold text-[#486581]">{index + 1}</td>
                                    <td className="py-2.5 px-3">
                                        <input
                                            type="text"
                                            onBlur={(e) => {
                                                if (e.target.value !== item.name) handleUpdateField(item.id, 'name', e.target.value);
                                            }}
                                            defaultValue={item.name}
                                            className="w-full px-2.5 py-1 bg-white border border-[#C9D8E5] rounded-md text-xs font-medium text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none h-8"
                                        />
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                        <input
                                            type="radio"
                                            checked={item.isDefault}
                                            onChange={() => handleUpdateField(item.id, 'isDefault', true)}
                                            className="w-4 h-4 text-[#0178BC] accent-[#0178BC] cursor-pointer"
                                        />
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                        <input
                                            type="radio"
                                            checked={item.isConverted}
                                            onChange={() => handleUpdateField(item.id, 'isConverted', true)}
                                            className="w-4 h-4 text-[#0178BC] accent-[#0178BC] cursor-pointer"
                                        />
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                        <input
                                            type="radio"
                                            checked={item.isWon}
                                            onChange={() => handleUpdateField(item.id, 'isWon', true)}
                                            className="w-4 h-4 text-[#0178BC] accent-[#0178BC] cursor-pointer"
                                        />
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                        <input
                                            type="radio"
                                            checked={item.isMql}
                                            onChange={() => handleUpdateField(item.id, 'isMql', true)}
                                            className="w-4 h-4 text-[#0178BC] accent-[#0178BC] cursor-pointer"
                                        />
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                        <input
                                            type="radio"
                                            checked={item.isSql}
                                            onChange={() => handleUpdateField(item.id, 'isSql', true)}
                                            className="w-4 h-4 text-[#0178BC] accent-[#0178BC] cursor-pointer"
                                        />
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <select
                                            value={item.moveTo || ''}
                                            onChange={(e) => handleUpdateField(item.id, 'moveTo', e.target.value)}
                                            className="w-full px-2.5 py-1 bg-white border border-[#C9D8E5] rounded-md text-xs font-medium text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none h-8 cursor-pointer"
                                        >
                                            <option value="">Select</option>
                                            <option value="QUOTATION">Quotation</option>
                                            <option value="SALES_ORDER">Sales Order</option>
                                            <option value="INVOICE">Invoice</option>
                                        </select>
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                defaultValue={item.probability}
                                                onBlur={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (!isNaN(val) && val !== item.probability) handleUpdateField(item.id, 'probability', val);
                                                }}
                                                className="w-full px-2.5 py-1 bg-white border border-[#C9D8E5] rounded-md text-xs font-medium text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none h-8 pr-5"
                                                min="0" max="100"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#60738E]">%</span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={item.assignTo}
                                            onChange={(e) => handleUpdateField(item.id, 'assignTo', e.target.checked)}
                                            className="w-4 h-4 rounded border-[#C9D8E5] text-[#0178BC] accent-[#0178BC] cursor-pointer"
                                        />
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => handleMove(item.id, 'up')}
                                                disabled={index === 0}
                                                className="p-1 text-[#0178BC] hover:bg-[#E6F0F8] rounded transition-colors disabled:opacity-20 cursor-pointer"
                                                title="Move Up"
                                            >
                                                <ArrowUp size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleMove(item.id, 'down')}
                                                disabled={index === arr.length - 1}
                                                className="p-1 text-[#0178BC] hover:bg-[#E6F0F8] rounded transition-colors disabled:opacity-20 cursor-pointer"
                                                title="Move Down"
                                            >
                                                <ArrowDown size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors ml-1 cursor-pointer"
                                                title="Delete"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="11" className="text-center py-10">
                                    <AlertCircle className="mx-auto h-10 w-10 text-[#60738E]/40" />
                                    <h3 className="mt-2 text-xs font-bold text-[#102A43]">No lead stages found</h3>
                                    <p className="mt-0.5 text-xs text-[#60738E]">Get started by adding a new lead stage.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem?.id ? 'Edit Lead Stage' : 'Add Lead Stage'}>
                <LeadStageForm item={editingItem} onSave={handleSave} onCancel={handleCloseModal} loading={modalLoading} locations={locations} />
            </Modal>
        </div>
    );
}

export default CrmLeadStage;