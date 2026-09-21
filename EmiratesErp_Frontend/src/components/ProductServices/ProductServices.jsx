import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader2, Search, ArrowLeft, ChevronLeft, ChevronRight, ImageOff, List, LayoutGrid, Printer, X, Download, Upload, FileSpreadsheet, HelpCircle, Eye, Package, Tag, DollarSign, Percent, ShieldCheck, Box } from 'lucide-react';
import CompanyHubLayout from '../CompanyHubLayout';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AuthenticatedImage = ({ url, alt, className, fallback }) => {
    const [src, setSrc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let active = true;
        if (!url) {
            setLoading(false);
            return;
        }

        const fetchImage = async () => {
            setLoading(true);
            setError(false);
            try {
                const response = await axios.get(url, {
                    responseType: 'blob',
                    headers: { 
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'X-Tenant-ID': localStorage.getItem('tenantId') || 'default'
                    }
                });
                if (active) {
                    const objectUrl = URL.createObjectURL(response.data);
                    setSrc(objectUrl);
                }
            } catch (err) {
                console.error("Failed to load product image", err);
                if (active) setError(true);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchImage();

        return () => {
            active = false;
            if (src) URL.revokeObjectURL(src);
        };
    }, [url]);

    if (!url || error) return fallback || <div className={`bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 ${className}`}><ImageOff size={18} /></div>;
    if (loading) return <div className={`bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 ${className}`}><Loader2 size={18} className="animate-spin text-[#00A9A8]" /></div>;

    return <img src={src} alt={alt} className={className} />;
};

const getItemTypeBadge = (type) => {
    switch (type) {
        case 'FINISHED_GOODS':
        case 'GOODS':
            return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">Finished Goods</span>;
        case 'RAW_MATERIAL':
            return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Raw Material</span>;
        case 'MERCHANDISE':
            return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">Merchandise</span>;
        case 'SERVICE':
            return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">Service</span>;
        default:
            return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">{type || 'Goods'}</span>;
    }
};

const ProductServices = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [itemTypeFilter, setItemTypeFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [viewMode, setViewMode] = useState('table');
    const [barcodeProduct, setBarcodeProduct] = useState(null);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [isImportGuideOpen, setIsImportGuideOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const fileInputRef = useRef(null);

    const getAuthHeaders = useCallback(() => {
        const tenantId = localStorage.getItem('tenantId') || 'default';
        return {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'X-Tenant-ID': tenantId
            }
        };
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                size: pageSize,
            });
            if (searchTerm) params.append('search', searchTerm);
            if (itemTypeFilter !== 'ALL') params.append('type', itemTypeFilter);

            const response = await axios.get(`${API_URL}/crm/sales-products?${params.toString()}`, getAuthHeaders());
            const content = response.data.content || response.data || [];
            setProducts(Array.isArray(content) ? content : []);
            setTotalPages(response.data.totalPages || 1);
            setTotalElements(response.data.totalElements || (Array.isArray(content) ? content.length : 0));
            setError(null);
        } catch (err) {
            setError('Failed to load Product & Services catalog.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm, itemTypeFilter, getAuthHeaders]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product/service?')) {
            try {
                await axios.delete(`${API_URL}/crm/sales-products/${id}`, getAuthHeaders());
                setViewingProduct(null);
                fetchProducts();
            } catch (err) {
                setError('Failed to delete item.');
                console.error(err);
            }
        }
    };

    const getImageUrl = (productId) => productId ? `${API_URL}/crm/sales-products/${productId}/image` : null;
    const getBarcodeUrl = (productId) => productId ? `${API_URL}/crm/sales-products/${productId}/barcode` : null;

    const handlePrintBarcode = async () => {
        if (!barcodeProduct) return;
        try {
            const url = getBarcodeUrl(barcodeProduct.id);
            const response = await axios.get(url, {
                responseType: 'blob',
                ...getAuthHeaders()
            });
            const blobUrl = URL.createObjectURL(response.data);

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Print Barcode - ${barcodeProduct.name}</title>
                            <style>
                                body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; }
                                .container { text-align: center; }
                                img { max-width: 100%; height: auto; }
                            </style>
                        </head>
                        <body>
                            <div className="container">
                                <h3>${barcodeProduct.name} (${barcodeProduct.itemCode || ''})</h3>
                                <img src="${blobUrl}" onload="window.print();window.close()" />
                                <p>Price: AED ${barcodeProduct.salesPrice || '0.00'}</p>
                            </div>
                        </body>
                    </html>
                `);
                printWindow.document.close();
            }
        } catch (e) {
            alert("Failed to load barcode for printing.");
        }
    };

    const filteredProducts = products.filter(p => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            (p.name && p.name.toLowerCase().includes(term)) ||
            (p.itemCode && p.itemCode.toLowerCase().includes(term)) ||
            (p.barcode && p.barcode.toLowerCase().includes(term))
        );
    });

    return (
        <CompanyHubLayout>
            <div className="flex flex-col h-full bg-[#F7FAFF] dark:bg-gray-900">
                {/* Header Bar */}
                <header className="bg-white dark:bg-gray-800 shadow-2xs px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/company-settings')} title="Back to Settings" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Product & Services Catalog</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Manage items, raw materials, merchandise, inventory, and billable services.</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-grow p-6 flex flex-col w-full">
                    {/* Action Toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <button onClick={() => setIsImportGuideOpen(true)} className="flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-2xs transition-colors">
                                <HelpCircle className="mr-1.5 h-4 w-4 text-gray-500" />
                                Guide
                            </button>
                            <div className="h-6 w-[1px] bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block"></div>
                            <div className="flex items-center p-0.5 bg-gray-200 dark:bg-gray-700 rounded-lg">
                                <button onClick={() => setViewMode('table')} title="List View" className={`p-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs' : 'text-gray-500 dark:text-gray-400'}`}>
                                    <List className="h-4 w-4" />
                                </button>
                                <button onClick={() => setViewMode('card')} title="Grid View" className={`p-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'card' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs' : 'text-gray-500 dark:text-gray-400'}`}>
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <button onClick={() => navigate('/company-settings/product-services/new')} className="flex items-center justify-center px-4 py-2 bg-[#00A9A8] hover:bg-[#008f8e] text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors">
                                <Plus className="mr-1.5 h-4 w-4" /> Add Product / Service
                            </button>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, SKU, item code, barcode..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9A8] dark:text-white shadow-2xs"
                            />
                        </div>
                        <select
                            value={itemTypeFilter}
                            onChange={(e) => { setItemTypeFilter(e.target.value); setCurrentPage(0); }}
                            className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9A8] dark:text-white shadow-2xs"
                        >
                            <option value="ALL">All Item Types</option>
                            <option value="FINISHED_GOODS">Finished Goods</option>
                            <option value="RAW_MATERIAL">Raw Material</option>
                            <option value="MERCHANDISE">Merchandise</option>
                            <option value="SERVICE">Service</option>
                        </select>
                    </div>

                    {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs mb-4" role="alert">{error}</div>}

                    {/* Catalog Content Area */}
                    <main className="flex-grow">
                        {loading ? (
                            <div className="flex justify-center items-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#00A9A8]" /></div>
                        ) : filteredProducts.length > 0 ? (
                            viewMode === 'card' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {filteredProducts.map(product => (
                                        <div key={product.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
                                            <div>
                                                <div className="h-40 bg-gray-50 dark:bg-gray-750 flex items-center justify-center relative p-3 border-b border-gray-100 dark:border-gray-700">
                                                    <AuthenticatedImage
                                                        url={getImageUrl(product.id)}
                                                        alt={product.name}
                                                        className="h-full w-full object-contain rounded-lg"
                                                    />
                                                    <div className="absolute top-2 right-2">
                                                        {getItemTypeBadge(product.productType || 'FINISHED_GOODS')}
                                                    </div>
                                                </div>
                                                <div className="p-4 space-y-2">
                                                    <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">{product.name}</h3>
                                                    <p className="text-xs font-mono text-gray-500">Code: {product.itemCode || product.sku || 'N/A'}</p>
                                                    <div className="flex justify-between items-center pt-2">
                                                        <span className="text-xs text-gray-500">Sales Price</span>
                                                        <span className="text-sm font-bold text-[#00A9A8]">AED {product.salesPrice || '0.00'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-gray-50/60 dark:bg-gray-750/60 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                                <button onClick={() => setBarcodeProduct(product)} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="Print Barcode">
                                                    <Printer className="h-4 w-4" />
                                                </button>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => navigate(`/company-settings/product-services/edit/${product.id}`)} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 text-red-500" title="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                                            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                                                <tr>
                                                    <th scope="col" className="px-5 py-3.5 font-bold">#</th>
                                                    <th scope="col" className="px-5 py-3.5 font-bold">Item Image</th>
                                                    <th scope="col" className="px-5 py-3.5 font-bold">Product / Service Name</th>
                                                    <th scope="col" className="px-5 py-3.5 font-bold">SKU / Code</th>
                                                    <th scope="col" className="px-5 py-3.5 font-bold">Type</th>
                                                    <th scope="col" className="px-5 py-3.5 font-bold">Cost Price (AED)</th>
                                                    <th scope="col" className="px-5 py-3.5 font-bold">Sales Price (AED)</th>
                                                    <th scope="col" className="px-5 py-3.5 font-bold">UOM</th>
                                                    <th scope="col" className="px-5 py-3.5 text-right font-bold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {filteredProducts.map((product, index) => (
                                                    <tr key={product.id} className="hover:bg-teal-50/30 dark:hover:bg-gray-750 transition-colors">
                                                        <td className="px-5 py-4 text-xs text-gray-500">{currentPage * pageSize + index + 1}</td>
                                                        <td className="px-5 py-4">
                                                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                                                                <AuthenticatedImage url={getImageUrl(product.id)} alt={product.name} className="w-full h-full object-cover" />
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{product.name}</td>
                                                        <td className="px-5 py-4 text-xs font-mono text-gray-500">{product.itemCode || product.sku || 'N/A'}</td>
                                                        <td className="px-5 py-4">{getItemTypeBadge(product.productType || 'FINISHED_GOODS')}</td>
                                                        <td className="px-5 py-4 text-xs">AED {product.purchasePrice || '0.00'}</td>
                                                        <td className="px-5 py-4 font-bold text-[#00A9A8]">AED {product.salesPrice || '0.00'}</td>
                                                        <td className="px-5 py-4 text-xs">{product.unitOfMeasure || 'Pcs'}</td>
                                                        <td className="px-5 py-4 text-right whitespace-nowrap">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button onClick={() => setBarcodeProduct(product)} title="Print Barcode" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                                                                    <Printer className="h-4 w-4" />
                                                                </button>
                                                                <button onClick={() => navigate(`/company-settings/product-services/edit/${product.id}`)} title="Edit" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                                                                    <Edit className="h-4 w-4" />
                                                                </button>
                                                                <button onClick={() => handleDelete(product.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 text-red-500">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-16 text-center shadow-2xs">
                                <Package className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                                <h3 className="text-base font-bold text-gray-800 dark:text-white">No Product / Service Found</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">Get started by creating a new product, raw material, or service entry.</p>
                                <button onClick={() => navigate('/company-settings/product-services/new')} className="mt-4 inline-flex items-center px-4 py-2 bg-[#00A9A8] text-white text-xs font-semibold rounded-lg hover:bg-[#008f8e] transition-colors">
                                    <Plus className="mr-1.5 h-4 w-4" /> Add First Product
                                </button>
                            </div>
                        )}
                    </main>

                    {/* Pagination Footer */}
                    {!loading && filteredProducts.length > 0 && (
                        <footer className="flex flex-col sm:flex-row justify-between items-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 gap-4">
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <span>Rows per page:</span>
                                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }} className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00A9A8]">
                                    {[10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                                </select>
                                <span className="ml-2">
                                    Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements || filteredProducts.length)} of {totalElements || filteredProducts.length} entries
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </footer>
                    )}
                </div>

                {/* Barcode Print Modal */}
                {barcodeProduct && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-xs" onClick={() => setBarcodeProduct(null)}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6 text-center" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-base text-gray-900 dark:text-white">Barcode - {barcodeProduct.name}</h3>
                                <button onClick={() => setBarcodeProduct(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="my-6 p-4 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col items-center">
                                <AuthenticatedImage url={getBarcodeUrl(barcodeProduct.id)} alt={barcodeProduct.name} className="h-24 object-contain mb-2" />
                                <p className="text-xs font-mono text-gray-600 dark:text-gray-300">{barcodeProduct.barcode || barcodeProduct.itemCode}</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setBarcodeProduct(null)} className="flex-1 py-2 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                <button onClick={handlePrintBarcode} className="flex-1 py-2 text-xs font-semibold bg-[#00A9A8] text-white rounded-lg hover:bg-[#008f8e] flex items-center justify-center gap-1.5">
                                    <Printer className="h-4 w-4" /> Print Barcode
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CompanyHubLayout>
    );
};

export default ProductServices;
