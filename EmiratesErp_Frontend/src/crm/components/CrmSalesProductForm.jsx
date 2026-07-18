import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Simple authenticated image component for Barcode
const AuthenticatedImage = ({ url, alt, className }) => {
    const [src, setSrc] = useState(null);
    useEffect(() => {
        let active = true;
        if (!url) return;
        const fetchImage = async () => {
            try {
                const res = await axios.get(url, {
                    responseType: 'blob',
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (active) setSrc(URL.createObjectURL(res.data));
            } catch (e) {
                console.error("Failed to load image", e);
            }
        };
        fetchImage();
        return () => { active = false; if (src) URL.revokeObjectURL(src); };
    }, [url]);

    if (!src) return <Loader2 className="animate-spin text-primary" />;
    return <img src={src} alt={alt} className={className} />;
};

const CrmSalesProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [product, setProduct] = useState({
        itemType: 'PRODUCT',
        isPurchase: false,
        isSales: true,
        itemCode: '',
        name: '',
        description: '',
        unitOfMeasure: '',
        reorderLimit: '',
        vatClassificationCode: '',
        purchasePrice: '',
        salesPrice: '',
        tax: '',
        taxRate: '',
        barcodeUrl: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getImageUrl = (path) => path ? `${API_URL}/crm/sales-products/${id}/image` : null;
    const getBarcodeUrl = (path) => path ? `${API_URL}/crm/sales-products/${id}/barcode` : null;

    const fetchProduct = useCallback(async () => {
        if (!isEditing) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/crm/sales-products/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = response.data;
            setProduct({
                itemType: data.itemType || 'PRODUCT',
                isPurchase: data.purchase || false,
                isSales: data.sales || true,
                itemCode: data.itemCode || '',
                name: data.name || '',
                description: data.description || '',
                unitOfMeasure: data.unitOfMeasure || '',
                reorderLimit: data.reorderLimit || '',
                vatClassificationCode: data.vatClassificationCode || '',
                purchasePrice: data.purchasePrice || '',
                salesPrice: data.salesPrice || '',
                tax: data.tax || '',
                taxRate: data.taxRate || '',
                barcodeUrl: data.barcodeUrl || '',
            });

            // Fetch Image Blob for Preview
            if (data.imageUrl) {
                try {
                    const imgRes = await axios.get(`${API_URL}/crm/sales-products/${id}/image`, {
                        responseType: 'blob',
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setImagePreview(URL.createObjectURL(imgRes.data));
                } catch (imgErr) {
                    console.error("Failed to fetch product image blob", imgErr);
                }
            }
        } catch (err) {
            setError('Failed to fetch product details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id, isEditing]);

    useEffect(() => {
        fetchProduct();
        // Cleanup function for blob URLs
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [fetchProduct]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCancel = () => {
        navigate('/crm-dashboard/products');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        const productData = { ...product };
        if (productData.purchasePrice === '') productData.purchasePrice = null;
        if (productData.salesPrice === '') productData.salesPrice = null;

        formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            };

            if (isEditing) {
                await axios.put(`${API_URL}/crm/sales-products/${id}`, formData, config);
            } else {
                await axios.post(`${API_URL}/crm/sales-products`, formData, config);
            }
            navigate('/crm-dashboard/products');
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} product.`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="bg-card shadow-sm p-4 border-b border-border flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={handleCancel} className="p-2 rounded-full hover:bg-background-muted">
                        <ArrowLeft className="h-5 w-5 text-foreground-muted" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            {isEditing ? 'Edit Product' : 'Add New Product'}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-theme shadow-sm hover:bg-background-muted transition-colors">
                        Cancel
                    </button>
                    <button type="submit" form="product-form" disabled={loading} className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-theme shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isEditing ? 'Save Changes' : 'Create Product'}
                    </button>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto">
                <form id="product-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                    {loading && !product.name && isEditing && (
                        <div className="flex justify-center items-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    )}

                    {error && <div className="bg-error/10 border border-error/50 text-error px-4 py-3 rounded-theme">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Image Upload */}
                        <div className="md:col-span-1 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Product Image</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-theme bg-card">
                                    <div className="space-y-1 text-center">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Product Preview" className="mx-auto h-32 w-32 object-contain rounded-theme" />
                                        ) : (
                                            <ImageIcon className="mx-auto h-12 w-12 text-foreground-muted" />
                                        )}
                                        <div className="flex text-sm text-foreground-muted justify-center mt-2">
                                            <label htmlFor="image-upload" className="relative cursor-pointer bg-card rounded-theme font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                                                <span>Upload a file</span>
                                                <input id="image-upload" name="image" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                            </label>
                                        </div>
                                        <p className="text-xs text-foreground-muted">PNG, JPG up to 10MB</p>
                                    </div>
                                </div>
                            </div>

                            {isEditing && product.barcodeUrl && (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Barcode</label>
                                    <div className="p-4 border border-border rounded-theme bg-card flex justify-center">
                                        <AuthenticatedImage
                                            url={getBarcodeUrl(product.barcodeUrl)}
                                            alt="Barcode"
                                            className="h-16 object-contain"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-foreground">Product Name *</label>
                                <input type="text" name="name" id="name" value={product.name} onChange={handleChange} required className="mt-1 block w-full rounded-theme border border-border bg-background py-2 px-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                            </div>
                            <div>
                                <label htmlFor="itemCode" className="block text-sm font-medium text-foreground">Item Code</label>
                                <input type="text" name="itemCode" id="itemCode" value={product.itemCode} onChange={handleChange} className="mt-1 block w-full rounded-theme border border-border bg-background py-2 px-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                            </div>
                            <div>
                                <label htmlFor="itemType" className="block text-sm font-medium text-foreground">Item Type</label>
                                <select id="itemType" name="itemType" value={product.itemType} onChange={handleChange} className="mt-1 block w-full rounded-theme border border-border bg-background py-2 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                                    <option value="PRODUCT">Product</option>
                                    <option value="SERVICE">Service</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-foreground">Description</label>
                        <textarea id="description" name="description" rows="3" value={product.description} onChange={handleChange} className="mt-1 block w-full rounded-theme border border-border bg-background py-2 px-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"></textarea>
                    </div>

                    <div className="flex items-center space-x-8">
                        <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                                <input id="isPurchase" name="isPurchase" type="checkbox" checked={product.isPurchase} onChange={handleChange} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="isPurchase" className="font-medium text-foreground">Purchase Item</label>
                            </div>
                        </div>
                        <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                                <input id="isSales" name="isSales" type="checkbox" checked={product.isSales} onChange={handleChange} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="isSales" className="font-medium text-foreground">Sales Item</label>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="purchasePrice" className="block text-sm font-medium text-foreground">Purchase Price (AED)</label>
                            <input type="number" name="purchasePrice" id="purchasePrice" value={product.purchasePrice} onChange={handleChange} className="mt-1 block w-full rounded-theme border border-border bg-background py-2 px-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                        </div>
                        <div>
                            <label htmlFor="salesPrice" className="block text-sm font-medium text-foreground">Sales Price (AED)</label>
                            <input type="number" name="salesPrice" id="salesPrice" value={product.salesPrice} onChange={handleChange} className="mt-1 block w-full rounded-theme border border-border bg-background py-2 px-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                        </div>
                    </div>

                    {/* Inventory & Other Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-foreground">Unit of Measure</label>
                            <input type="text" name="unitOfMeasure" id="unitOfMeasure" value={product.unitOfMeasure} onChange={handleChange} className="mt-1 block w-full rounded-theme border border-border bg-background py-2 px-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g., pcs, kg, ltr" />
                        </div>
                        <div>
                            <label htmlFor="reorderLimit" className="block text-sm font-medium text-foreground">Reorder Limit</label>
                            <input type="number" name="reorderLimit" id="reorderLimit" value={product.reorderLimit} onChange={handleChange} className="mt-1 block w-full rounded-theme border border-border bg-background py-2 px-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                        </div>
                    </div>

                    {/* Tax Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="tax" className="block text-sm font-medium text-foreground">Tax</label>
                            <input type="text" name="tax" id="tax" value={product.tax} onChange={handleChange} className="mt-1 block w-full rounded-theme border border-border bg-background py-2 px-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g., GST, VAT" />
                        </div>
                        <div>
                            <label htmlFor="taxRate" className="block text-sm font-medium text-foreground">Tax Rate (%)</label>
                            <input type="number" name="taxRate" id="taxRate" value={product.taxRate} onChange={handleChange} className="mt-1 block w-full rounded-theme border border-border bg-background py-2 px-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g., 18" />
                        </div>
                        <div>
                            <label htmlFor="vatClassificationCode" className="block text-sm font-medium text-foreground">VAT/GST Code</label>
                            <input type="text" name="vatClassificationCode" id="vatClassificationCode" value={product.vatClassificationCode} onChange={handleChange} className="mt-1 block w-full rounded-theme border border-border bg-background py-2 px-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="HSN/SAC Code" />
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CrmSalesProductForm;