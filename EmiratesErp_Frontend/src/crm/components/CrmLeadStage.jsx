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
        <div className="p-6 bg-card rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Manage Lead Stages</h3>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-full sm:w-64 pr-10 bg-background-muted border-border" />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    </div>
                    <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary">
                        <PlusCircle size={16} /> Add Stage
                    </button>
                </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-muted">
                        <tr>
                            <th className="th-cell w-12 text-center">S.No.</th>
                            <th className="th-cell min-w-[150px]">Status Name</th>
                            <th className="th-cell text-center w-20">Default</th>
                            <th className="th-cell text-center w-20">Converted</th>
                            <th className="th-cell text-center w-20">Won</th>
                            <th className="th-cell text-center w-20">MQL</th>
                            <th className="th-cell text-center w-20">SQL</th>
                            <th className="th-cell min-w-[140px]">Move To</th>
                            <th className="th-cell w-24">Probability</th>
                            <th className="th-cell text-center w-20">Assign To</th>
                            <th className="th-cell w-32 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border text-foreground-muted">
                        {loading ? (
                            <tr><td colSpan="11" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item, index, arr) => (
                                <tr key={item.id} className="hover:bg-background-muted transition-colors">
                                    <td className="td-cell text-center">{index + 1}</td>
                                    <td className="td-cell p-2">
                                        <input
                                            type="text"
                                            onBlur={(e) => {
                                                if (e.target.value !== item.name) handleUpdateField(item.id, 'name', e.target.value);
                                            }}
                                            defaultValue={item.name}
                                            className="input w-full bg-background border-border h-8 text-sm"
                                        />
                                    </td>
                                    <td className="td-cell text-center">
                                        <input type="radio" checked={item.isDefault} onChange={() => handleUpdateField(item.id, 'isDefault', true)} className="h-4 w-4 text-primary focus:ring-primary cursor-pointer" />
                                    </td>
                                    <td className="td-cell text-center">
                                        <input type="radio" checked={item.isConverted} onChange={() => handleUpdateField(item.id, 'isConverted', true)} className="h-4 w-4 text-primary focus:ring-primary cursor-pointer" />
                                    </td>
                                    <td className="td-cell text-center">
                                        <input type="radio" checked={item.isWon} onChange={() => handleUpdateField(item.id, 'isWon', true)} className="h-4 w-4 text-primary focus:ring-primary cursor-pointer" />
                                    </td>
                                    <td className="td-cell text-center">
                                        <input type="radio" checked={item.isMql} onChange={() => handleUpdateField(item.id, 'isMql', true)} className="h-4 w-4 text-primary focus:ring-primary cursor-pointer" />
                                    </td>
                                    <td className="td-cell text-center">
                                        <input type="radio" checked={item.isSql} onChange={() => handleUpdateField(item.id, 'isSql', true)} className="h-4 w-4 text-primary focus:ring-primary cursor-pointer" />
                                    </td>
                                    <td className="td-cell p-2">
                                        <select
                                            value={item.moveTo || ''}
                                            onChange={(e) => handleUpdateField(item.id, 'moveTo', e.target.value)}
                                            className="input w-full bg-background border-border h-8 text-xs p-1"
                                        >
                                            <option value="">Select</option>
                                            <option value="QUOTATION">Quotation</option>
                                            <option value="SALES_ORDER">Sales Order</option>
                                            <option value="INVOICE">Invoice</option>
                                        </select>
                                    </td>
                                    <td className="td-cell p-2">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                defaultValue={item.probability}
                                                onBlur={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (!isNaN(val) && val !== item.probability) handleUpdateField(item.id, 'probability', val);
                                                }}
                                                className="input w-full bg-background border-border h-8 text-sm pr-6"
                                                min="0" max="100"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-foreground-muted">%</span>
                                        </div>
                                    </td>
                                    <td className="td-cell text-center">
                                        <input type="checkbox" checked={item.assignTo} onChange={(e) => handleUpdateField(item.id, 'assignTo', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
                                    </td>
                                    <td className="td-cell">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => handleMove(item.id, 'up')} disabled={index === 0} className="p-1 disabled:opacity-30 hover:bg-background-muted rounded text-blue-500"><ArrowUp size={16} /></button>
                                            <button onClick={() => handleMove(item.id, 'down')} disabled={index === arr.length - 1} className="p-1 disabled:opacity-30 hover:bg-background-muted rounded text-blue-500"><ArrowDown size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-1 bg-red-500 text-white rounded hover:bg-red-600 ml-2" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="11" className="text-center py-10"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No lead stages found</h3><p className="mt-1 text-sm">Get started by adding a new lead stage.</p></td></tr>
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