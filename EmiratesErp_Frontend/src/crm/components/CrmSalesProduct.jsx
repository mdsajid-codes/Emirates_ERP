import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader2, Search, ArrowLeft, ChevronLeft, ChevronRight, ImageOff, List, Grid, Printer, X } from 'lucide-react';
import { useCrmPermissions } from '../context/CrmPermissionsContext.jsx';
import CompanyHubLayout from '../../components/CompanyHubLayout.jsx';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Helper Component for Authenticated Images ---
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
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (active) {
                    const objectUrl = URL.createObjectURL(response.data);
                    setSrc(objectUrl);
                }
            } catch (err) {
                console.error("Failed to load image", err);
                if (active) setError(true);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchImage();

        return () => {
            active = false;
            // Clean up the object URL to avoid memory leaks
            if (src) URL.revokeObjectURL(src);
        };
    }, [url]); // Re-run if URL changes

    if (!url || error) return fallback || <div className={`bg-background-muted flex items-center justify-center text-foreground-muted ${className}`}><ImageOff size={20} /></div>;
    if (loading) return <div className={`bg-background-muted flex items-center justify-center text-foreground-muted ${className}`}><Loader2 size={20} className="animate-spin" /></div>;

    return <img src={src} alt={alt} className={className} />;
};

const CrmSalesProduct = ({ pageName }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { hasPermission } = useCrmPermissions();
    const isCompanySettings = location.pathname.includes('/company-settings');
    const getAddPath = () => isCompanySettings ? '/company-settings/product-services/new' : '/crm-dashboard/products/new';
    const getEditPath = (id) => isCompanySettings ? `/company-settings/product-services/edit/${id}` : `/crm-dashboard/products/edit/${id}`;
    const getBasePath = () => isCompanySettings ? '/company-settings/product-services' : '/crm-dashboard/products';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [view, setView] = useState('table');

    // Barcode Modal State
    const [barcodeProduct, setBarcodeProduct] = useState(null);

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                search: searchTerm,
            };
            const response = await axios.get(`${API_URL}/crm/sales-products`, { params, ...authHeaders });
            const raw = response.data.content || response.data || [];
            const sorted = Array.isArray(raw) ? [...raw].sort((a, b) => (b.id || 0) - (a.id || 0)) : [];
            setProducts(sorted);
            setTotalPages(response.data.totalPages || 1);
            setError(null);
        } catch (err) {
            setError('Failed to fetch products. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm, authHeaders]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(handler);
    }, [fetchProducts]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${API_URL}/crm/sales-products/${id}`, authHeaders);
                fetchProducts();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete product.'}`);
            }
        }
    };

    const getImageUrl = (productId) => productId ? `${API_URL}/crm/sales-products/${productId}/image` : null;
    const getBarcodeUrl = (productId) => productId ? `${API_URL}/crm/sales-products/${productId}/barcode` : null;

    const handlePrintBarcode = async () => {
        if (!barcodeProduct?.barcodeUrl) return;

        try {
            const url = getBarcodeUrl(barcodeProduct.id);
            const response = await axios.get(url, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const blobUrl = URL.createObjectURL(response.data);

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Print Barcode - ${barcodeProduct.name}</title>
                            <style>
                                body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                                img { max-width: 100%; height: auto; }
                            </style>
                        </head>
                        <body>
                            <img src="${blobUrl}" onload="window.print();window.close()" />
                        </body>
                    </html>
                `);
                printWindow.document.close();
            }
        } catch (e) {
            alert("Failed to load barcode for printing");
        }
    };

    const ProductCard = ({ product }) => {
        return (
            <div className="bg-white border border-[#E8EEF7] rounded-xl shadow-2xs overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="h-44 bg-[#F8FAFC] flex items-center justify-center relative p-3 border-b border-[#E8EEF7]">
                    <AuthenticatedImage
                        url={getImageUrl(product.id)}
                        alt={product.name}
                        className="h-full w-full object-contain rounded-lg"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#E6F0F8] text-[#0178BC] text-[10px] font-bold rounded-full uppercase">
                        {product.itemType || 'PRODUCT'}
                    </span>
                </div>
                <div className="p-3.5 flex-grow flex flex-col justify-between gap-1.5">
                    <div>
                        <h3 className="font-extrabold text-[#0F2342] text-sm truncate">{product.name}</h3>
                        <p className="text-xs font-mono text-[#62708A]">{product.itemCode || 'No Code'}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#F8FAFC]">
                        <span className="text-xs font-bold text-[#62708A]">Sales Price</span>
                        <span className="text-sm font-extrabold text-[#0178BC]">AED {product.salesPrice || '0.00'}</span>
                    </div>
                </div>
                <div className="p-2 bg-[#F8FAFC] border-t border-[#E8EEF7] flex justify-end gap-1.5">
                    <button onClick={() => setBarcodeProduct(product)} className="p-1.5 rounded-md hover:bg-slate-200 text-[#62708A] transition-colors" title="Print Barcode">
                        <Printer size={15} />
                    </button>
                    {hasPermission('PRODUCT', 'update') && (
                        <button onClick={() => navigate(getEditPath(product.id))} className="p-1.5 rounded-md hover:bg-slate-200 text-[#00A3A6] transition-colors" title="Edit">
                            <Edit size={15} />
                        </button>
                    )}
                    {hasPermission('PRODUCT', 'delete') && (
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-md hover:bg-slate-200 text-red-500 transition-colors" title="Delete">
                            <Trash2 size={15} />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const content = (
        <div className="w-full px-4 py-4 space-y-4 bg-slate-50/50 min-h-screen">
            {/* Header & Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 bg-white p-2.5 rounded-lg border border-[#E8EEF7] shadow-2xs">
                <div className="flex items-center gap-2.5">
                    <button onClick={() => navigate(-1)} className="p-1 rounded-md text-[#62708A] hover:bg-[#F8FAFC] hover:text-[#0F2342] transition-colors">
                        <ArrowLeft size={16} />
                    </button>
                    <div className="h-6 w-1 bg-[#00A3A6] rounded-full"></div>
                    <div>
                        <h3 className="text-base font-extrabold text-[#0F2342] uppercase tracking-wide">{pageName || (isCompanySettings ? 'PRODUCT & SERVICES' : 'CRM PRODUCTS')}</h3>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex items-center rounded-lg border border-[#E8EEF7] bg-[#F8FAFC] p-0.5">
                        <button onClick={() => setView('table')} className={`p-1 rounded-md transition-all ${view === 'table' ? 'bg-white shadow-2xs text-[#00A3A6] font-bold' : 'text-[#62708A]'}`}>
                            <List size={15} />
                        </button>
                        <button onClick={() => setView('card')} className={`p-1 rounded-md transition-all ${view === 'card' ? 'bg-white shadow-2xs text-[#00A3A6] font-bold' : 'text-[#62708A]'}`}>
                            <Grid size={15} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative flex-1 sm:w-64">
                        <Search className="w-4 h-4 text-[#62708A] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by name or item code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] rounded-lg text-xs text-[#111111] placeholder-[#62708A] outline-none border border-[#E8EEF7] focus:border-[#00A3A6] focus:bg-white transition-all"
                        />
                    </div>

                    {hasPermission('PRODUCT', 'create') && (
                        <button
                            onClick={() => navigate(getAddPath())}
                            className="bg-[#00A3A6] hover:bg-[#008286] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ml-auto sm:ml-0"
                        >
                            <Plus className="h-4 w-4" /> Add Product
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                    {error}
                </div>
            )}

            {/* Main Content Area */}
            {loading ? (
                <div className="bg-white border border-[#E8EEF7] rounded-xl p-16 flex justify-center items-center">
                    <Loader2 className="h-7 w-7 animate-spin text-[#00A3A6]" />
                </div>
            ) : products.length > 0 ? (
                view === 'table' ? (
                    <div className="bg-white border border-[#E8EEF7] rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-[#F8FAFC] border-b border-[#E8EEF7] text-[11px] font-bold text-[#486581] uppercase tracking-wider">
                                        <th className="py-3.5 px-5 w-16">IMAGE</th>
                                        <th className="py-3.5 px-5">NAME</th>
                                        <th className="py-3.5 px-5">ITEM CODE</th>
                                        <th className="py-3.5 px-5">BARCODE</th>
                                        <th className="py-3.5 px-5">TYPE</th>
                                        <th className="py-3.5 px-5">SALES PRICE</th>
                                        <th className="py-3.5 px-5 text-center">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E8EEF7] text-xs text-[#102A43]">
                                    {products.map(product => (
                                        <tr key={product.id} className="hover:bg-[#F8FAFC] transition-colors group">
                                            <td className="py-2.5 px-5">
                                                <div className="h-9 w-9 rounded-lg bg-[#F8FAFC] border border-[#E8EEF7] flex items-center justify-center overflow-hidden">
                                                    <AuthenticatedImage
                                                        url={product.imageUrl ? getImageUrl(product.id) : null}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-3 px-5 font-bold text-[#111111] group-hover:text-[#00A3A6] transition-colors">{product.name}</td>
                                            <td className="py-3 px-5 font-mono text-[#62708A]">{product.itemCode || '-'}</td>
                                            <td className="py-3 px-5 text-xs font-mono text-[#62708A]">{product.barcode || '-'}</td>
                                            <td className="py-3 px-5">
                                                <span className="px-2 py-0.5 bg-[#E6F0F8] text-[#0178BC] font-bold text-[10px] rounded-full uppercase">
                                                    {product.itemType || 'PRODUCT'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5 font-extrabold text-[#111111]">AED {product.salesPrice || '0.00'}</td>
                                            <td className="py-3 px-5">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button onClick={() => setBarcodeProduct(product)} className="p-1.5 rounded-md text-[#62708A] hover:bg-slate-100 hover:text-[#00A3A6] transition-colors" title="Print Barcode">
                                                        <Printer size={15} />
                                                    </button>
                                                    {hasPermission('PRODUCT', 'update') && (
                                                        <button onClick={() => navigate(getEditPath(product.id))} className="p-1.5 rounded-md text-[#62708A] hover:bg-slate-100 hover:text-[#00A3A6] transition-colors" title="Edit Product">
                                                            <Edit size={15} />
                                                        </button>
                                                    )}
                                                    {hasPermission('PRODUCT', 'delete') && (
                                                        <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-md text-[#62708A] hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete Product">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Footer / Pagination */}
                        <div className="bg-white px-5 py-3 border-t border-[#E8EEF7] flex flex-col sm:flex-row justify-between items-center gap-3">
                            <span className="text-xs font-medium text-[#62708A]">
                                Page {currentPage + 1} of {totalPages || 1}
                            </span>

                            {totalPages > 1 && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                        disabled={currentPage === 0}
                                        className="p-1.5 rounded-md border border-[#C9D8E5] text-[#62708A] hover:bg-slate-100 disabled:opacity-40 transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={currentPage >= totalPages - 1}
                                        className="p-1.5 rounded-md border border-[#C9D8E5] text-[#62708A] hover:bg-slate-100 disabled:opacity-40 transition-colors"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {products.map(product => <ProductCard key={product.id} product={product} />)}
                        </div>
                        {totalPages > 1 && (
                            <div className="bg-white p-3 rounded-lg border border-[#E8EEF7] flex justify-between items-center">
                                <span className="text-xs font-medium text-[#62708A]">Page {currentPage + 1} of {totalPages}</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="p-1.5 rounded-md border border-[#C9D8E5] text-[#62708A] hover:bg-slate-100 disabled:opacity-40"><ChevronLeft size={16} /></button>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} className="p-1.5 rounded-md border border-[#C9D8E5] text-[#62708A] hover:bg-slate-100 disabled:opacity-40"><ChevronRight size={16} /></button>
                                </div>
                            </div>
                        )}
                    </div>
                )
            ) : (
                <div className="bg-white border border-[#E8EEF7] rounded-xl p-16 text-center text-xs text-[#62708A]">
                    No Products Found
                </div>
            )}

            {/* Barcode Print Modal */}
            {barcodeProduct && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-theme shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-border">
                        <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-background-muted">
                            <h3 className="font-semibold text-foreground">Print Barcode</h3>
                            <button onClick={() => setBarcodeProduct(null)} className="p-1 rounded-full hover:bg-black/10 text-foreground-muted"><X size={18} /></button>
                        </div>
                        <div className="p-6 flex flex-col items-center bg-card">
                            <h4 className="font-medium text-foreground mb-4 text-center">{barcodeProduct.name}</h4>
                            <div className="p-4 border border-border rounded-theme mb-4 bg-white shadow-sm">
                                <AuthenticatedImage
                                    url={getBarcodeUrl(barcodeProduct.id)}
                                    alt="Barcode"
                                    className="h-24 object-contain"
                                    fallback={<span className="text-error text-sm">No Barcode</span>}
                                />
                            </div>
                            <p className="text-xs text-foreground-muted font-mono">{barcodeProduct.barcode}</p>
                        </div>
                        <div className="bg-background-muted px-4 py-3 flex gap-3 border-t border-border">
                            <button onClick={() => setBarcodeProduct(null)} className="flex-1 px-4 py-2 bg-card border border-border rounded-theme text-sm font-medium text-foreground hover:bg-background transition-colors">
                                Cancel
                            </button>
                            <button onClick={handlePrintBarcode} className="flex-1 px-4 py-2 bg-primary rounded-theme text-sm font-medium text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors">
                                <Printer size={16} /> Print
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return isCompanySettings ? <CompanyHubLayout>{content}</CompanyHubLayout> : content;
};

export default CrmSalesProduct;
