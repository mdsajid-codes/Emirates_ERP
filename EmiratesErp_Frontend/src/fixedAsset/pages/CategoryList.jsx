import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    PieChart, 
    Loader,
    Calendar,
    TrendingUp
} from 'lucide-react';
import CategoryModal from './CategoryModal';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/fixed-assets/categories`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setCategories(response.data);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? Deleting a category might affect assets linked to it.")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/fixed-assets/categories/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchCategories();
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete category.");
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Asset Categories</h1>
                    <p className="text-foreground-muted">Define groups for your assets with default depreciation rules.</p>
                </div>
                <button 
                    onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
                    className="btn btn-primary bg-purple-600 hover:bg-purple-700 border-none flex items-center gap-2"
                >
                    <Plus size={20} />
                    New Category
                </button>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-background-muted/50 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search categories..."
                            className="input pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background-muted text-foreground-muted text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Category Name</th>
                                <th className="px-6 py-4 font-semibold">Description</th>
                                <th className="px-6 py-4 font-semibold text-center">Life (Years)</th>
                                <th className="px-6 py-4 font-semibold">Default Method</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <Loader className="animate-spin inline-block text-purple-500 mr-2" size={24} />
                                        <span className="text-foreground-muted">Loading categories...</span>
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-foreground-muted">
                                        <PieChart className="mx-auto h-12 w-12 mb-4 opacity-20" />
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((cat) => (
                                    <tr key={cat.categoryId} className="hover:bg-background-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded bg-purple-500/10 text-purple-500">
                                                    <PieChart size={16} />
                                                </div>
                                                <span className="font-bold text-foreground">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-foreground-muted truncate max-w-[250px]" title={cat.description}>
                                                {cat.description || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background-muted text-xs font-medium">
                                                <Calendar size={12} />
                                                {cat.usefulLifeDefault || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <TrendingUp size={14} className="text-foreground-muted" />
                                                {cat.depreciationMethodDefault?.replace(/_/g, ' ') || 'STRAIGHT LINE'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleEdit(cat)}
                                                    className="p-2 hover:bg-purple-500/10 text-purple-500 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(cat.categoryId)}
                                                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CategoryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={fetchCategories}
                editingCategory={editingCategory}
            />
        </div>
    );
};

export default CategoryList;
