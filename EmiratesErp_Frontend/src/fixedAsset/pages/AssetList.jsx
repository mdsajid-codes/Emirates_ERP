import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Eye, 
    Edit, 
    Trash2,
    Download,
    FolderTree
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AssetList = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/fixed-assets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssets(res.data || []);
        } catch (err) {
            console.error("Failed to fetch assets", err);
            toast.error("Failed to load assets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, [API_URL]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this asset?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/fixed-assets/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Asset deleted successfully");
            fetchAssets();
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error("Failed to delete asset");
        }
    };

    const filteredAssets = assets.filter(asset => 
        asset.assetNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Fixed Assets</h1>
                    <p className="text-foreground-muted">View and manage your registered company assets.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        className="btn btn-outline border-border flex items-center gap-2"
                    >
                        <FolderTree size={18} />
                        Create Group
                    </button>
                    <button 
                        onClick={() => navigate('/fixed-asset-dashboard/assets/new')}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Create Asset
                    </button>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between items-center gap-4 bg-background-muted/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by asset # or description..." 
                            className="input pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background-muted/30 text-xs uppercase tracking-wider font-semibold text-foreground-muted border-b border-border">
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Class</th>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Purchase Price</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array.from({ length: 7 }).map((_, j) => (
                                            <td key={j} className="px-6 py-4"><div className="h-4 bg-background-muted rounded w-full"></div></td>
                                        ))}
                                    </tr>
                                ))
                            ) : filteredAssets.length > 0 ? (
                                filteredAssets.map((asset) => (
                                    <tr key={asset.fixedAssetId} className="hover:bg-background-muted/20 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-foreground">
                                            <div className="flex items-center gap-2">
                                                {asset.groupName && <FolderTree size={14} className="text-blue-500" />}
                                                {asset.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-foreground-muted">{asset.className || '—'}</td>
                                        <td className="px-6 py-4 text-foreground-muted">{asset.assetNumber}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                                                {asset.categoryName || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                asset.assetStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                asset.assetStatus === 'NEW' ? 'bg-blue-100 text-blue-700' :
                                                asset.assetStatus === 'IN_CONSERVATION' ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {asset.assetStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-foreground font-bold text-sm">
                                            ${asset.purchasePrice?.toLocaleString() || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => navigate(`/fixed-asset-dashboard/assets/edit/${asset.fixedAssetId}`)}
                                                    className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(asset.fixedAssetId)}
                                                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-foreground-muted">
                                        No assets found. Click "Create Asset" to register one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AssetList;
