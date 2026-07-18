import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader2, Search, ArrowLeft, ChevronLeft, ChevronRight, ImageOff, List, Grid, Printer, X } from 'lucide-react';
import { useCrmPermissions } from '../context/CrmPermissionsContext.jsx';

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

const CrmSalesProduct = () => {
    const navigate = useNavigate();
    const { hasPermission } = useCrmPermissions();
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
            setProducts(response.data.content || []);
            setTotalPages(response.data.totalPages);
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

        // Fetch blob explicitly to print
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
            <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="h-40 bg-background-muted flex items-center justify-center relative">
                    <AuthenticatedImage
                        url={getImageUrl(product.id)}
                        alt={product.name}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="p-4 flex-grow">
                    <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                    <p className="text-sm text-foreground-muted">{product.itemCode || 'No Code'}</p>
                    <p className="text-lg font-bold text-foreground mt-2">AED {product.salesPrice}</p>
                </div>
                <div className="p-2 bg-background-muted border-t border-border flex justify-end gap-2">
                    <button onClick={() => setBarcodeProduct(product)} className="p-2 rounded-theme hover:bg-black/5" title="Print Barcode"><Printer className="h-4 w-4 text-foreground-muted" /></button>
                    {hasPermission('PRODUCT', 'update') && (
                        <button onClick={() => navigate(`/crm-dashboard/products/edit/${product.id}`)} className="p-2 rounded-theme hover:bg-black/5"><Edit className="h-4 w-4 text-primary" /></button>
                    )}
                    {hasPermission('PRODUCT', 'delete') && (
                        <button onClick={() => handleDelete(product.id)} className="p-2 rounded-theme hover:bg-black/5"><Trash2 className="h-4 w-4 text-error" /></button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-background relative">
            <header className="bg-card shadow-sm p-4 border-b border-border">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-background-muted">
                            <ArrowLeft className="h-5 w-5 text-foreground-muted" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">CRM Products</h1>
                            <p className="text-sm text-foreground-muted">Manage your sales products and services.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-theme border border-border bg-background-muted p-0.5">
                            <button onClick={() => setView('table')} className={`p-1.5 rounded-theme ${view === 'table' ? 'bg-card shadow-sm text-foreground' : 'text-foreground-muted'}`}><List size={18} /></button>
                            <button onClick={() => setView('card')} className={`p-1.5 rounded-theme ${view === 'card' ? 'bg-card shadow-sm text-foreground' : 'text-foreground-muted'}`}><Grid size={18} /></button>
                        </div>
                        {hasPermission('PRODUCT', 'create') && (
                            <button
                                onClick={() => navigate('/crm-dashboard/products/new')}
                                className="flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-theme shadow-md hover:bg-primary/90 transition-colors"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Product
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex-grow p-4 sm:p-6 flex flex-col">
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                        <input
                            type="text"
                            placeholder="Search by name or item code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-card border border-border text-foreground rounded-theme focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                </div>

                {error && <div className="bg-error/10 border border-error/50 text-error px-4 py-3 rounded-theme mb-4">{error}</div>}

                <main className="flex-grow overflow-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : products.length > 0 ? (view === 'table' ? (
                        <div className="overflow-x-auto rounded-theme border border-border bg-card">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-foreground-muted uppercase bg-background-muted">
                                    <tr>
                                        <th className="px-6 py-3">Image</th>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Item Code</th>
                                        <th className="px-6 py-3">Barcode</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Sales Price</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.id} className="border-b border-border hover:bg-background-muted/50 transition-colors text-foreground">
                                            <td className="px-6 py-4">
                                                <div className="h-10 w-10">
                                                    <AuthenticatedImage
                                                        url={product.imageUrl ? getImageUrl(product.id) : null}
                                                        alt={product.name}
                                                        className="h-10 w-10 rounded-theme object-cover"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium">{product.name}</td>
                                            <td className="px-6 py-4 text-foreground-muted">{product.itemCode}</td>
                                            <td className="px-6 py-4 text-xs font-mono text-foreground-muted">{product.barcode || '-'}</td>
                                            <td className="px-6 py-4 text-foreground-muted">{product.itemType}</td>
                                            <td className="px-6 py-4 font-medium">AED {product.salesPrice}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => setBarcodeProduct(product)} className="p-2 rounded-theme hover:bg-black/5 text-foreground-muted mr-2" title="Print Barcode">
                                                    <Printer className="h-4 w-4" />
                                                </button>
                                                {hasPermission('PRODUCT', 'update') && (
                                                    <button onClick={() => navigate(`/crm-dashboard/products/edit/${product.id}`)} className="p-2 rounded-theme hover:bg-black/5"><Edit className="h-4 w-4 text-primary" /></button>
                                                )}
                                                {hasPermission('PRODUCT', 'delete') && (
                                                    <button onClick={() => handleDelete(product.id)} className="p-2 rounded-theme hover:bg-black/5"><Trash2 className="h-4 w-4 text-error" /></button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {products.map(product => <ProductCard key={product.id} product={product} />)}
                        </div>
                    )
                    ) : (
                        <div className="text-center py-16"><h3 className="text-lg font-semibold text-foreground">No Products Found</h3></div>
                    )}
                </main>

                {!loading && totalPages > 1 && (
                    <footer className="flex justify-between items-center pt-4 mt-4 border-t border-border">
                        <span className="text-sm text-foreground-muted">Page {currentPage + 1} of {totalPages}</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="p-2 rounded-theme border border-border text-foreground hover:bg-background-muted disabled:opacity-50 transition-colors">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} className="p-2 rounded-theme border border-border text-foreground hover:bg-background-muted disabled:opacity-50 transition-colors">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </footer>
                )}
            </div>

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
};

export default CrmSalesProduct;
