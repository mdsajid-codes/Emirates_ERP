import React, { useState, useEffect } from 'react';
import { X, Save, PieChart, FileText, Calendar, TrendingUp } from 'lucide-react';
import axios from 'axios';

const CategoryModal = ({ isOpen, onClose, onSave, editingCategory }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        usefulLifeDefault: '',
        depreciationMethodDefault: 'STRAIGHT_LINE'
    });
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (editingCategory) {
            setFormData({
                name: editingCategory.name || '',
                description: editingCategory.description || '',
                usefulLifeDefault: editingCategory.usefulLifeDefault || '',
                depreciationMethodDefault: editingCategory.depreciationMethodDefault || 'STRAIGHT_LINE'
            });
        } else {
            setFormData({
                name: '',
                description: '',
                usefulLifeDefault: '',
                depreciationMethodDefault: 'STRAIGHT_LINE'
            });
        }
    }, [editingCategory, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            
            if (editingCategory) {
                await axios.put(`${API_URL}/fixed-assets/categories/${editingCategory.categoryId}`, formData, { headers });
            } else {
                await axios.post(`${API_URL}/fixed-assets/categories`, formData, { headers });
            }
            onSave();
            onClose();
        } catch (err) {
            console.error("Error saving category:", err);
            alert("Failed to save category.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card text-card-foreground w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border bg-background-muted">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                            <PieChart size={24} />
                        </div>
                        <h2 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'Create Category'}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center gap-2">
                            <FileText size={16} className="text-purple-500" />
                            Category Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="input w-full"
                            placeholder="e.g. Vehicles, Office Equipment"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center gap-2">
                            <FileText size={16} className="text-purple-500" />
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="input w-full resize-none"
                            placeholder="Optional category description"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <Calendar size={16} className="text-purple-500" />
                                Useful Life (Years)
                            </label>
                            <input
                                type="number"
                                name="usefulLifeDefault"
                                value={formData.usefulLifeDefault}
                                onChange={handleChange}
                                className="input w-full"
                                placeholder="Default years"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <TrendingUp size={16} className="text-purple-500" />
                                Dep. Method
                            </label>
                            <select
                                name="depreciationMethodDefault"
                                value={formData.depreciationMethodDefault}
                                onChange={handleChange}
                                className="input w-full"
                            >
                                <option value="STRAIGHT_LINE">Straight Line</option>
                                <option value="DECLINING_BALANCE">Declining Balance</option>
                                <option value="SYD">Sum of Years Digits</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary bg-purple-600 hover:bg-purple-700 border-none flex items-center gap-2">
                            {loading ? 'Saving...' : (
                                <>
                                    <Save size={18} />
                                    {editingCategory ? 'Update Category' : 'Save Category'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;
