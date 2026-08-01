import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Search, PlusCircle, Edit, Trash2, Loader, X, Package, Save, ArrowLeft, UploadCloud, Image, Download, Barcode, Eye, EyeOff, Printer } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import BulkAddProductsModal from '../components/BulkAddProductsModal';
import ProductForm from '../components/ProductForm';
import BulkImageUploadModal from '../components/BulkImageUploadModal';
import { POS_FALLBACK_THEME } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Auth Hook for POS Roles ---
const usePosAuth = () => {
    const roles = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('roles') || '[]');
        } catch { return []; }
    }, []);

    const isSuperAdmin = roles.includes('SUPER_ADMIN');
    const isPosAdmin = roles.includes('POS_ADMIN') || isSuperAdmin;
    const canManage = roles.includes('POS_MANAGER') || isPosAdmin;

    return { isPosAdmin, canManage };
};

const formatPrice = (cents) => `AED ${(cents / 100).toFixed(2)}`;

const constructImageUrl = (relativeUrl) => {
    if (!relativeUrl) return '';
    if (relativeUrl.startsWith('data:') || relativeUrl.startsWith('http')) {
        return relativeUrl;
    }

    const cleanPath = relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl;

    if (cleanPath.startsWith('uploads/')) {
        return `${API_URL}/pos/uploads/view/${cleanPath.replace('uploads/', '')}`;
    }

    return `${API_URL}/pos/uploads/view/${cleanPath}`;
};

// --- Barcode Modal ---
const BarcodeModal = ({ isOpen, onClose, product }) => {
    const [selectedVariant, setSelectedVariant] = useState(null);

    useEffect(() => {
        if (isOpen && product?.variants?.length > 0) {
            setSelectedVariant(product.variants[0]);
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const variants = product.variants || [];
    const variant = selectedVariant;

    if (!variant) return null;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = constructImageUrl(variant.barcodeImageUrl);
        link.download = `qr-${variant.sku}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.info(`Downloading QR Code for SKU: ${variant.sku}`);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center border border-slate-100" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-slate-800">Barcode: {product.name}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {variants.length > 1 && (
                    <div className="mb-4 text-left">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Select Variant</label>
                        <select
                            className="w-full p-2 border-0 bg-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                            value={variants.indexOf(variant)}
                            onChange={(e) => setSelectedVariant(variants[e.target.value])}
                        >
                            {variants.map((v, idx) => (
                                <option key={v.id || idx} value={idx}>
                                    {v.sku} {v.attributes && Object.keys(v.attributes).length > 0 ? `(${Object.values(v.attributes).join(', ')})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="mb-3">
                    <p className="text-xs text-slate-400 font-medium">SKU: {variant.sku}</p>
                    <p className="font-mono text-base font-bold text-slate-800 tracking-wider my-0.5">{variant.barcode || 'No Barcode'}</p>
                </div>

                {variant.barcodeImageUrl ? (
                    <img src={constructImageUrl(variant.barcodeImageUrl)} alt={`Barcode for ${variant.sku}`} className="mx-auto border border-slate-100 rounded-2xl w-44 h-44 object-contain bg-white p-2 shadow-xs" />
                ) : (
                    <div className="h-44 w-44 mx-auto border rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
                        <span>No Barcode Image</span>
                    </div>
                )}

                <div className="flex flex-col gap-2 mt-5">
                    <button onClick={() => {
                        const imgUrl = constructImageUrl(variant.barcodeImageUrl);
                        const win = window.open('', '_blank');
                        win.document.write(`
                            <html>
                                <head><style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;} @media print { body { height: auto; } }</style></head>
                                <body>
                                    <h2 style="margin-bottom:10px;">${product.name}</h2>
                                    <img src="${imgUrl}" style="max-width:300px;" onload="window.print();" />
                                    <div style="margin-top:10px;font-family:monospace;font-size:24px;font-weight:bold;">${variant.barcode || variant.sku}</div>
                                    <div style="margin-top:5px;font-size:14px;">${variant.sku}</div>
                                </body>
                            </html>
                        `);
                        win.document.close();
                    }} disabled={!variant.barcodeImageUrl} className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                        <Printer size={16} /> Print Barcode
                    </button>
                    <button onClick={handleDownload} disabled={!variant.barcodeImageUrl} className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Download size={16} /> Download
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProductsView = ({ posTheme: propPosTheme, isExpanded = true }) => {
    const posTheme = propPosTheme || POS_FALLBACK_THEME;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isBulkImageModalOpen, setIsBulkImageModalOpen] = useState(false);
    const [barcodeModalProduct, setBarcodeModalProduct] = useState(null);
    const [showInactive, setShowInactive] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { product, isHardDelete }

    const { isPosAdmin, canManage } = usePosAuth();

    const fetchProducts = useCallback(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/pos/products`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => setProducts(res.data))
            .catch(() => {
                setError('Failed to fetch products.');
                toast.error('Failed to fetch products list.');
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleAdd = () => { setSelectedProduct(null); setIsPanelOpen(true); };
    const handleEdit = (product) => { setSelectedProduct(product); setIsPanelOpen(true); };
    const handleClosePanel = () => { setIsPanelOpen(false); setSelectedProduct(null); };

    const handleSave = async (productData) => {
        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        const method = productData.id ? 'put' : 'post';
        const url = productData.id ? `${API_URL}/pos/products/${productData.id}` : `${API_URL}/pos/products`;

        try {
            const payload = {
                ...productData,
                variants: productData.variants.map(({ imageFile, ...variant }) => variant),
            };

            await axios[method](url, payload, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            toast.success(`Product ${productData.id ? 'updated' : 'saved'} successfully!`);
            handleClosePanel();
            fetchProducts();
        } catch (err) {
            toast.error(`Error: ${err.response?.data?.message || 'Could not save product.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const { product, isHardDelete } = deleteTarget;
        const token = localStorage.getItem('token');
        try {
            if (isHardDelete) {
                await axios.delete(`${API_URL}/pos/products/${product.id}/hard`, { headers: { "Authorization": `Bearer ${token}` } });
                toast.error('Product permanently deleted.');
            } else {
                await axios.delete(`${API_URL}/pos/products/${product.id}`, { headers: { "Authorization": `Bearer ${token}` } });
                toast.warning('Product deactivated.');
            }
            fetchProducts();
        } catch (err) {
            toast.error(`Failed to delete product: ${err.response?.data?.message || err.message}`);
        } finally {
            setDeleteTarget(null);
        }
    };

    const filteredProducts = useMemo(() =>
        products.filter(p =>
            (showInactive || p.active) &&
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase()))
        ), [products, searchTerm, showInactive]);

    const handleViewBarcodes = (product) => {
        setBarcodeModalProduct(product);
    };

    return (
        <div className="p-4 sm:p-5 h-full flex flex-col font-sans space-y-3.5">
            {/* Header section with compact actions */}
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Product Management</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Catalog overview and quick stock controls.</p>
                </div>
                {canManage && (
                    <div className="flex flex-wrap items-center gap-2">
                        <button 
                            onClick={() => setIsBulkModalOpen(true)} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition-all"
                        >
                            <UploadCloud size={15} /> Bulk Add
                        </button>
                        <button 
                            onClick={() => setIsBulkImageModalOpen(true)} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition-all"
                        >
                            <UploadCloud size={15} /> Bulk Images
                        </button>
                        <button 
                            onClick={handleAdd} 
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer"
                            style={{ backgroundColor: posTheme.primary || '#0f172a' }}
                        >
                            <PlusCircle size={15} /> Add Product
                        </button>
                    </div>
                )}
            </div>

            {/* Filter & Search Bar */}
            <div className="flex items-center gap-2.5">
                <div className="relative flex-grow">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by product name or SKU..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white rounded-full text-xs border-0 shadow-xs outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                </div>
                <button
                    onClick={() => setShowInactive(!showInactive)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border shadow-xs transition-all ${
                        showInactive
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    {showInactive ? <Eye size={15} /> : <EyeOff size={15} />}
                    <span>{showInactive ? 'Showing Inactive' : 'Active Only'}</span>
                </button>
            </div>

            {/* Compact Table Card Sheet */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex-grow flex flex-col">
                <div className="overflow-x-auto flex-grow">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 sticky top-0 border-b border-slate-200/60 z-10">
                            <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="py-2.5 px-4">Product Name</th>
                                <th className="py-2.5 px-4">SKU</th>
                                <th className="py-2.5 px-4">Barcode</th>
                                <th className="py-2.5 px-4">Price Range</th>
                                <th className="py-2.5 px-4">Status</th>
                                <th className="py-2.5 px-4 text-center">Variants</th>
                                {canManage && <th className="py-2.5 px-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={canManage ? 7 : 6} className="text-center py-12">
                                        <Loader className="h-6 w-6 animate-spin text-slate-900 mx-auto" />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={canManage ? 7 : 6} className="text-center py-12 text-rose-500 font-medium">{error}</td>
                                </tr>
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map(product => {
                                    const minPrice = product.variants?.length ? Math.min(...product.variants.map(v => v.priceCents || 0)) : 0;
                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-2.5 px-4 font-bold text-slate-900">{product.name}</td>
                                            <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{product.sku || '-'}</td>
                                            <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{product.variants?.[0]?.barcode || '-'}</td>
                                            <td className="py-2.5 px-4 font-extrabold text-slate-900">{formatPrice(minPrice)}</td>
                                            <td className="py-2.5 px-4">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    product.active 
                                                        ? 'bg-emerald-100 text-emerald-800' 
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {product.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-4 text-center font-bold">{product.variants?.length || 0}</td>
                                            {canManage && (
                                                <td className="py-2.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button 
                                                            onClick={() => handleEdit(product)} 
                                                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" 
                                                            title="Edit"
                                                        >
                                                            <Edit size={15} />
                                                        </button>
                                                        {product.variants?.length > 0 && (
                                                            <button 
                                                                onClick={() => handleViewBarcodes(product)} 
                                                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" 
                                                                title="View Barcode"
                                                            >
                                                                <Printer size={15} />
                                                            </button>
                                                        )}
                                                        {isPosAdmin && (
                                                            <>
                                                                {product.active ? (
                                                                    <button 
                                                                        onClick={() => setDeleteTarget({ product, isHardDelete: false })} 
                                                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                                                                        title="Deactivate"
                                                                    >
                                                                        <Trash2 size={15} />
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        onClick={() => setDeleteTarget({ product, isHardDelete: true })} 
                                                                        className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors" 
                                                                        title="Permanent Delete"
                                                                    >
                                                                        <Trash2 size={15} />
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={canManage ? 7 : 6} className="text-center py-12 text-slate-400">
                                        <Package className="mx-auto h-10 w-10 opacity-40 mb-2" />
                                        <h3 className="text-xs font-bold text-slate-700">No products found</h3>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Try searching or adding a new product.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Full-Width Side Panel for Add/Edit Form */}
            <AnimatePresence>
                {isPanelOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-xs"
                            onClick={handleClosePanel}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                            className="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col rounded-l-3xl overflow-hidden"
                            style={{
                                left: typeof window !== 'undefined' && window.innerWidth >= 1024 ? (isExpanded ? '288px' : '92px') : '0px',
                                right: 0
                            }}
                        >
                            <div className="px-5 py-4 border-b flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button onClick={handleClosePanel} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
                                        <ArrowLeft size={18} />
                                    </button>
                                    <h2 className="text-base font-bold text-slate-900">
                                        {selectedProduct ? 'Edit Product' : 'Add New Product'}
                                    </h2>
                                </div>
                                <button onClick={handleClosePanel} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                                    <X size={18} />
                                </button>
                            </div>
                            <ProductForm
                                product={selectedProduct}
                                onSave={handleSave}
                                onCancel={handleClosePanel}
                                isSubmitting={isSubmitting}
                                onGenerateBarcode={() => handleViewBarcodes(selectedProduct)}
                                posTheme={posTheme}
                            />
                            <div className="p-4 border-t bg-slate-50 flex justify-end gap-2 sticky bottom-0 z-50">
                                <button type="button" onClick={handleClosePanel} className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all" disabled={isSubmitting}>Cancel</button>
                                <button 
                                    id="product-form-submit-button" 
                                    type="submit" 
                                    form="product-form" 
                                    className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 min-w-[120px] shadow-sm hover:opacity-90 cursor-pointer" 
                                    style={{ backgroundColor: posTheme.primary || '#0f172a' }}
                                    disabled={isSubmitting}
                                > 
                                    {isSubmitting ? <Loader className="animate-spin h-4 w-4" /> : <Save size={15} />} 
                                    Save Product 
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <BulkAddProductsModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onUploadSuccess={() => fetchProducts()}
            />

            <BulkImageUploadModal
                isOpen={isBulkImageModalOpen}
                onClose={() => setIsBulkImageModalOpen(false)}
            />

            <BarcodeModal
                isOpen={!!barcodeModalProduct}
                onClose={() => setBarcodeModalProduct(null)}
                product={barcodeModalProduct}
            />

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4" onClick={() => setDeleteTarget(null)}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center border border-slate-100" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                                <Trash2 size={22} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">
                                {deleteTarget.isHardDelete ? 'Permanently Delete Product?' : 'Deactivate Product?'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                {deleteTarget.isHardDelete 
                                    ? `Are you sure you want to permanently delete "${deleteTarget.product.name}"? This action cannot be undone and will erase all transaction history.`
                                    : `Are you sure you want to deactivate "${deleteTarget.product.name}"? It will no longer appear in POS sales.`}
                            </p>
                            <div className="flex gap-2.5 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setDeleteTarget(null)}
                                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-all cursor-pointer"
                                >
                                    {deleteTarget.isHardDelete ? 'Delete Forever' : 'Deactivate'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductsView;
