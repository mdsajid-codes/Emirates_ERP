import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    Plus, Search, Filter, Download, Upload, MoreVertical,
    FileText, Settings, Layers, Trash2, Edit, ChevronLeft, ChevronRight,
    Loader, Barcode, Eye, FileSpreadsheet, Printer, X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AuthenticatedImage = ({ itemId, alt, className }) => {
    const [src, setSrc] = useState(null);
    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    useEffect(() => {
        if (!itemId) return;
        let isMounted = true;

        axios.get(`${API_URL}/production/semi-finished/${itemId}/image`, { headers: authHeaders, responseType: 'blob' })
            .then(res => {
                if (isMounted && res.data.size > 0) {
                    setSrc(URL.createObjectURL(res.data));
                }
            })
            .catch(err => {
                // Silent fail
            });

        return () => {
            isMounted = false;
            if (src) URL.revokeObjectURL(src);
        };
    }, [itemId, authHeaders]);

    if (!src) return <div className={`bg-gray-100 dark:bg-gray-700 animate-pulse rounded ${className}`} />;
    return <img src={src} alt={alt} className={className} onError={(e) => { e.target.style.display = 'none'; }} />;
};

const ProSemiFinished = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Data States
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filters & Pagination
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [subCategoryId, setSubCategoryId] = useState('');

    // Master Data for Filters
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);

    // File Upload (Hidden Input)
    const fileInputRef = React.useRef(null);

    // Barcode Modal State
    const [barcodeModalData, setBarcodeModalData] = useState(null);

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    // Fetch Master Data
    useEffect(() => {
        const fetchMasters = async () => {
            try {
                const res = await axios.get(`${API_URL}/production/categories`, { headers: authHeaders });
                setCategories(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchMasters();
    }, [authHeaders]);

    // Fetch SubCategories when Category changes
    useEffect(() => {
        if (categoryId) {
            const fetchSubs = async () => {
                try {
                    const res = await axios.get(`${API_URL}/production/sub-categories?categoryId=${categoryId}`, { headers: authHeaders });
                    setSubCategories(res.data);
                } catch (err) { console.error(err); }
            };
            fetchSubs();
        } else {
            setSubCategories([]);
        }
    }, [categoryId, authHeaders]);

    // Fetch Items
    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size, search };
            if (categoryId) params.categoryId = categoryId;
            if (subCategoryId) params.subCategoryId = subCategoryId;

            const response = await axios.get(`${API_URL}/production/semi-finished`, { headers: authHeaders, params });

            setItems(response.data.content || []);
            setTotalItems(response.data.totalElements || 0);
            setTotalPages(response.data.totalPages || 0);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    }, [authHeaders, page, size, search, categoryId, subCategoryId]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Handlers
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await axios.delete(`${API_URL}/production/semi-finished/${id}`, { headers: authHeaders });
                fetchItems();
            } catch (err) {
                console.error("Delete failed:", err);
                alert("Failed to delete item. It may be used in other transactions.");
            }
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get(`${API_URL}/production/semi-finished/export`, {
                headers: authHeaders,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `semi_finished_export_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export failed:", err);
            alert("Export failed.");
        }
    };

    const handleTemplateDownload = async () => {
        try {
            const response = await axios.get(`${API_URL}/production/semi-finished/bulk-template`, {
                headers: authHeaders,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'semi_finished_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Template download failed:", err);
            alert("Download failed.");
        }
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            await axios.post(`${API_URL}/production/semi-finished/bulk`, formData, {
                headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' }
            });
            alert("Import successful! Data is being refreshed.");
            fetchItems();
        } catch (err) {
            console.error("Import failed:", err);
            alert(`Import failed: ${err.response?.data ? JSON.stringify(err.response.data) : err.message}`);
        } finally {
            setLoading(false);
            e.target.value = null; // Reset input
        }
    };

    // Barcode Modal Handlers
    const handleOpenBarcodeModal = async (item) => {
        try {
            const response = await axios.get(`${API_URL}/production/semi-finished/${item.id}/barcode-image`, {
                headers: authHeaders,
                responseType: 'blob'
            });

            if (response.data.size === 0) {
                alert("No barcode image content found.");
                return;
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            setBarcodeModalData({ item, url });
        } catch (err) {
            console.error("Failed to fetch barcode:", err);
            alert("Could not load barcode image.");
        }
    };

    const handleCloseBarcodeModal = () => {
        if (barcodeModalData?.url) {
            window.URL.revokeObjectURL(barcodeModalData.url);
        }
        setBarcodeModalData(null);
    };

    const handlePrintFromModal = () => {
        if (!barcodeModalData) return;
        const { item, url } = barcodeModalData;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print Barcode - ${item.name}</title>
                        <style>
                            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                            img { max-width: 100%; height: auto; }
                            .label { text-align: center; font-family: sans-serif; margin-top: 10px; }
                        </style>
                    </head>
                    <body>
                        <img src="${url}" onload="window.print(); window.close();" />
                        <div className="label">${item.itemCode || ''} - ${item.name}</div>
                    </body>
                </html>
            `);
            printWindow.document.close();
        } else {
            alert("Popup blocked. Please allow popups to print.");
        }
    };

    // Render
    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 w-full md:w-auto space-y-2">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Semi Finished Goods</h2>
                    <p className="text-sm text-gray-500">Manage your production semi-finished items</p>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                    <button
                        onClick={handleTemplateDownload}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm shadow-sm"
                    >
                        <FileSpreadsheet size={16} className="text-green-600" />
                        <span>Template</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm shadow-sm"
                    >
                        <Download size={16} className="text-blue-600" />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={handleImportClick}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-100 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-200 text-sm shadow-sm"
                    >
                        <Upload size={16} />
                        <span>Import</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls" />

                    <button
                        onClick={() => navigate('/production/semi-finished/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors shadow-lg shadow-purple-900/20 text-sm font-medium"
                    >
                        <Plus size={18} />
                        <span>New Item</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full md:w-1/4">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Category</label>
                    <select
                        value={categoryId}
                        onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(''); }}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="w-full md:w-1/4">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Sub Category</label>
                    <select
                        value={subCategoryId}
                        onChange={(e) => setSubCategoryId(e.target.value)}
                        disabled={!categoryId}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                        <option value="">All Sub Categories</option>
                        {subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="w-full md:flex-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Search</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by Item Code or Name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-purple-700 text-white px-3 py-1 rounded text-xs hover:bg-purple-800">Search</button>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-purple-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-16">S.No.</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Sub Category</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Inv. Type</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Picture</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Item Code</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Barcode</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                                {/* <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">HSN/SAC</th> */}
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Rate</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Print Barcode</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="12" className="px-6 py-10 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader className="animate-spin text-purple-600" size={24} />
                                            <p className="text-sm text-gray-500">Loading items...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : items.length > 0 ? (
                                items.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors group">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{page * size + index + 1}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{item.categoryName || '-'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{item.subCategoryName || '-'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">{item.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{item.inventoryTypeName || '-'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-center">
                                            <div className="h-10 w-10 mx-auto rounded-md bg-gray-100 dark:bg-slate-700 overflow-hidden border border-gray-200 dark:border-gray-600">
                                                <AuthenticatedImage itemId={item.id} alt="Item" className="h-full w-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{item.itemCode}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.barcode}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">{item.stockQuantity || 0}</td>
                                        {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">-</td> */}
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{item.itemType}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-100 text-right">{item.salesPrice?.toFixed(2) || '0.00'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/production/semi-finished/${item.id}/process`)}
                                                    className="p-1.5 bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                                                    title="Manage Process"
                                                >
                                                    <Settings size={16} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/production/semi-finished/${item.id}/bom`)}
                                                    className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                                    title="Manage BOM"
                                                >
                                                    <Layers size={16} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/production/semi-finished/edit/${item.id}`)}
                                                    className="p-1.5 bg-amber-100 text-amber-600 rounded hover:bg-amber-200"
                                                    title="Edit Item"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                    title="Delete Item"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => handleOpenBarcodeModal(item)}
                                                className="text-purple-600 hover:text-purple-800 hover:underline text-xs font-semibold flex items-center justify-center gap-1 mx-auto"
                                            >
                                                <Printer size={12} /> Print Barcode
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="12" className="px-6 py-10 text-center text-gray-500">
                                        No items found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-gray-50 dark:bg-slate-700/50 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        Showing <span className="font-medium">{page * size + 1}</span> to <span className="font-medium">{Math.min((page + 1) * size, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
                    </span>
                    <div className="flex items-center gap-2">
                        <select
                            value={size}
                            onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                            className="p-1 border border-gray-300 dark:border-gray-600 rounded bg-white text-sm"
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Barcode Print Modal */}
            {barcodeModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Print Barcode</h3>
                            <button onClick={handleCloseBarcodeModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 flex flex-col items-center justify-center space-y-4 bg-gray-50 dark:bg-slate-900/50">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <img src={barcodeModalData.url} alt="Barcode Preview" className="max-w-full h-auto" />
                            </div>
                            <div className="text-center">
                                <p className="font-mono font-medium text-lg text-gray-800 dark:text-gray-200">{barcodeModalData.item.itemCode}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{barcodeModalData.item.name}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-900">
                            <button
                                onClick={handleCloseBarcodeModal}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePrintFromModal}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 shadow-md hover:shadow-lg transition-all"
                            >
                                <Printer size={18} />
                                <span>Print</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProSemiFinished;