import React, { useState, useEffect } from 'react';
import {
    Package,
    ArrowLeft,
    Search,
    Filter,
    Download,
    RefreshCw,
    TrendingUp,
    AlertCircle,
    Loader2,
    Boxes,
    Tag,
    Scale,
    CircleDollarSign
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const FgStockPage = () => {
    const navigate = useNavigate();
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/hanger/packing/fg-stock`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStock(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching FG stock:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStock = stock.filter(item =>
        item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.hangerType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">Auditing Inventory Vault...</p>
        </div>
    );

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <button
                        onClick={() => navigate('/warehouse-dashboard/dashboard')}
                        className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4 hover:gap-3 transition-all"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to Control Center
                    </button>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                        <Package className="w-10 h-10 text-blue-600" />
                        Finished Goods Stock
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-2 max-w-lg">
                        Comprehensive inventory tracking across all hanger models and categories with real-time stock levels.
                    </p>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Stock Value</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 tracking-tighter">
                                {filteredStock.reduce((acc, curr) => acc + (curr.stockQuantity * curr.salesPrice), 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase">Valuation</span>
                        </div>
                    </div>
                    <button
                        onClick={fetchStock}
                        className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
                        title="Refresh Stock"
                    >
                        <RefreshCw className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
                    <Boxes className="w-48 h-48" />
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by code, model, or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-slate-900 shadow-sm"
                    />
                </div>
                <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-3">
                    <Filter className="w-4 h-4" />
                    Category Filter
                </button>
                <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm border-b-4 border-b-slate-100">
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Stock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredStock.length > 0 ? filteredStock.map((item) => (
                    <div key={item.finishedGoodId} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group flex flex-col">
                        <div className="p-8 space-y-6 flex-1">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-3 h-3 text-blue-500" />
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.itemCode}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{item.itemName}</h3>
                                </div>
                                <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-[10px] font-black text-slate-500 uppercase">
                                    {item.hangerType}
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center py-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                <div className="text-4xl font-black text-slate-900 tracking-tighter mb-1">
                                    {item.stockQuantity.toLocaleString()}
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pieces Available</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                                        <Scale className="w-3 h-3" />
                                        Unit Weight
                                    </div>
                                    <div className="font-bold text-slate-700">{item.unitWeightGrams}g</div>
                                </div>
                                <div className="space-y-1 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                                        <CircleDollarSign className="w-3 h-3" />
                                        Base Rate
                                    </div>
                                    <div className="font-bold text-slate-700">AED {item.salesPrice}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">In Stock</span>
                            </div>
                            <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                                <TrendingUp className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-24 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
                        <div className="p-6 bg-slate-50 rounded-full w-fit mx-auto border border-slate-100">
                            <AlertCircle className="w-12 h-12 text-slate-300" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">No Finished Goods Found</h3>
                            <p className="text-slate-500 text-sm font-medium mt-1">Adjust your search or check if items are registered in FG stock master.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FgStockPage;
