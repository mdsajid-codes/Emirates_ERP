import React, { useState, useEffect } from 'react';
import { X, Save, Package, Hash, MapPin, Calendar, DollarSign, Activity, Folder, Layers, Type, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const AssetModal = ({ isOpen, onClose, onSave, editingAsset }) => {
    const [formData, setFormData] = useState({
        assetNumber: '',
        description: '',
        serialNumber: '',
        categoryId: '',
        classId: '',
        groupId: '',
        assetType: 'Property, Plant and Equipment',
        hiredResource: false,
        useScheduling: false,
        location: '',
        purchaseDate: '',
        purchasePrice: '',
        salvageValue: '',
        usefulLifeYears: '',
        depreciationMethod: 'STRAIGHT_LINE',
        assetStatus: 'NEW'
    });

    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            fetchClasses();
            fetchGroups();
        }
        if (editingAsset) {
            setFormData({
                assetNumber: editingAsset.assetNumber || '',
                description: editingAsset.description || '',
                serialNumber: editingAsset.serialNumber || '',
                categoryId: editingAsset.categoryId || '',
                classId: editingAsset.classId || '',
                groupId: editingAsset.groupId || '',
                assetType: editingAsset.assetType || 'Property, Plant and Equipment',
                hiredResource: editingAsset.hiredResource || false,
                useScheduling: editingAsset.useScheduling || false,
                location: editingAsset.location || '',
                purchaseDate: editingAsset.purchaseDate || '',
                purchasePrice: editingAsset.purchasePrice || '',
                salvageValue: editingAsset.salvageValue || '',
                usefulLifeYears: editingAsset.usefulLifeYears || '',
                depreciationMethod: editingAsset.depreciationMethod || 'STRAIGHT_LINE',
                assetStatus: editingAsset.assetStatus || 'NEW'
            });
        } else {
            setFormData({
                assetNumber: '',
                description: '',
                serialNumber: '',
                categoryId: '',
                classId: '',
                groupId: '',
                assetType: 'Property, Plant and Equipment',
                hiredResource: false,
                useScheduling: false,
                location: '',
                purchaseDate: '',
                purchasePrice: '',
                salvageValue: '',
                usefulLifeYears: '',
                depreciationMethod: 'STRAIGHT_LINE',
                assetStatus: 'NEW'
            });
        }
    }, [editingAsset, isOpen]);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/fixed-assets/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(res.data || []);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/fixed-assets/classes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(res.data || []);
        } catch (err) {
            console.error("Failed to fetch classes", err);
        }
    };

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/fixed-assets/groups`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroups(res.data || []);
        } catch (err) {
            console.error("Failed to fetch groups", err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            
            if (editingAsset) {
                await axios.put(`${API_URL}/fixed-assets/${editingAsset.fixedAssetId}`, formData, { headers });
            } else {
                await axios.post(`${API_URL}/fixed-assets`, formData, { headers });
            }
            onSave();
            onClose();
        } catch (err) {
            console.error("Error saving asset:", err);
            alert("Failed to save asset. Check if Asset Number is unique.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card text-card-foreground w-full max-w-4xl rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border bg-background-muted">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                            <Package size={24} />
                        </div>
                        <h2 className="text-xl font-bold">{editingAsset ? 'Edit Fixed Asset' : 'Fixed Assets (create)'}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
                    {/* Header Controls (Matching Screenshot 1) */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <button type="submit" className="px-4 py-2 bg-[#f4b400] hover:bg-[#e5a900] text-black font-bold rounded shadow-sm transition-colors flex items-center gap-2">
                            <Save size={18} />
                            Save and close
                        </button>
                        <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-white hover:bg-gray-100 text-black border border-gray-300 rounded shadow-sm transition-colors">
                            Save
                        </button>
                        <button type="button" className="px-4 py-2 bg-white hover:bg-gray-100 text-black border border-gray-300 rounded shadow-sm transition-colors flex items-center gap-2">
                            <Layers size={18} />
                            Edit GL Accounts
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Folder Row */}
                        <div className="md:col-span-2 grid grid-cols-[120px_1fr_auto] items-center gap-4">
                            <label className="text-sm text-muted-foreground">Folder:</label>
                            <select
                                name="groupId"
                                value={formData.groupId}
                                onChange={handleChange}
                                className="input w-full"
                            >
                                <option value="">(None)</option>
                                {groups.map(g => (
                                    <option key={g.groupId} value={g.groupId}>{g.name}</option>
                                ))}
                            </select>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">Status:</span>
                                <span className="text-sm font-bold text-green-600">{formData.assetStatus}</span>
                                <button type="button" className="text-sm text-blue-600 hover:underline ml-2">Change Status</button>
                            </div>
                        </div>

                        {/* Description & ID Row */}
                        <div className="md:col-span-2 grid grid-cols-[120px_1fr_60px_200px] items-center gap-4">
                            <label className="text-sm text-muted-foreground">Description:</label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                className="input w-full"
                                placeholder="van"
                            />
                            <label className="text-sm text-muted-foreground text-right">ID:</label>
                            <input
                                type="text"
                                name="assetNumber"
                                value={formData.assetNumber}
                                onChange={handleChange}
                                required
                                className="input w-full"
                                placeholder="234567"
                            />
                        </div>

                        {/* Type Row */}
                        <div className="md:col-span-2 grid grid-cols-[120px_1fr] items-center gap-4">
                            <label className="text-sm text-muted-foreground">Type:</label>
                            <select
                                name="assetType"
                                value={formData.assetType}
                                onChange={handleChange}
                                className="input w-full"
                            >
                                <option value="Property, Plant and Equipment">Property, Plant and Equipment</option>
                                <option value="Intangible Asset">Intangible Asset</option>
                            </select>
                        </div>

                        {/* Class Row */}
                        <div className="md:col-span-2 grid grid-cols-[120px_1fr] items-center gap-4">
                            <label className="text-sm text-muted-foreground">Class:</label>
                            <select
                                name="classId"
                                value={formData.classId}
                                onChange={handleChange}
                                className="input w-full"
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => (
                                    <option key={c.classId} value={c.classId}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category Row */}
                        <div className="md:col-span-2 grid grid-cols-[120px_1fr] items-center gap-4">
                            <label className="text-sm text-muted-foreground">Category:</label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="input w-full"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Flags */}
                        <div className="md:col-span-2 grid grid-cols-[120px_auto] items-center gap-4">
                            <label className="text-sm text-muted-foreground">Hired Resource:</label>
                            <input
                                type="checkbox"
                                name="hiredResource"
                                checked={formData.hiredResource}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                        </div>

                        <div className="md:col-span-2 grid grid-cols-[120px_auto] items-center gap-4">
                            <label className="text-sm text-muted-foreground">Use Scheduling:</label>
                            <input
                                type="checkbox"
                                name="useScheduling"
                                checked={formData.useScheduling}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                        </div>

                        {/* Additional Fields (Standard in existing system) */}
                        <div className="md:col-span-2 border-t border-border pt-4 mt-4">
                            <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground">Additional Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Hash size={16} className="text-green-500" />
                                        Serial Number
                                    </label>
                                    <input
                                        type="text"
                                        name="serialNumber"
                                        value={formData.serialNumber}
                                        onChange={handleChange}
                                        className="input w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <MapPin size={16} className="text-green-500" />
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="input w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Calendar size={16} className="text-green-500" />
                                        Purchase Date
                                    </label>
                                    <input
                                        type="date"
                                        name="purchaseDate"
                                        value={formData.purchaseDate}
                                        onChange={handleChange}
                                        className="input w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <DollarSign size={16} className="text-green-500" />
                                        Purchase Price
                                    </label>
                                    <input
                                        type="number"
                                        name="purchasePrice"
                                        value={formData.purchasePrice}
                                        onChange={handleChange}
                                        className="input w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssetModal;
