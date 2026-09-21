import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, X, Package, Tag, Percent, Barcode, ChevronDown, Check } from 'lucide-react';
import CompanyHubLayout from '../CompanyHubLayout';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AuthenticatedImage = ({ url, alt, className }) => {
    const [src, setSrc] = useState(null);
    useEffect(() => {
        let active = true;
        if (!url) return;
        const fetchImage = async () => {
            try {
                const res = await axios.get(url, {
                    responseType: 'blob',
                    headers: { 
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'X-Tenant-ID': localStorage.getItem('tenantId') || 'default'
                    }
                });
                if (active) setSrc(URL.createObjectURL(res.data));
            } catch (e) {
                console.error("Failed to load image", e);
            }
        };
        fetchImage();
        return () => { active = false; if (src) URL.revokeObjectURL(src); };
    }, [url]);

    if (!src) return <Loader2 className="animate-spin h-5 w-5 text-[#00A9A8]" />;
    return <img src={src} alt={alt} className={className} />;
};

const ProductServicesForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [product, setProduct] = useState({
        name: '',
        itemCode: '',
        barcode: '',
        description: '',
        productType: 'FINISHED_GOODS',
        purchasePrice: 0,
        salesPrice: 0,
        currency: 'AED',
        unitOfMeasure: 'Pcs',
        reorderLimit: 10,
        tax: 'UAE VAT 5%',
        taxRate: 5.0,
        vatClassificationCode: 'STANDARD',
        active: true,
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getAuthHeaders = useCallback(() => {
        const tenantId = localStorage.getItem('tenantId') || 'default';
        return {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'X-Tenant-ID': tenantId
            }
        };
    }, []);

    useEffect(() => {
        if (!isEditing) return;

        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/crm/sales-products/${id}`, getAuthHeaders());
                const data = res.data || {};
                setProduct({
                    name: data.name || '',
                    itemCode: data.itemCode || data.sku || '',
                    barcode: data.barcode || '',
                    description: data.description || '',
                    productType: data.productType || 'FINISHED_GOODS',
                    purchasePrice: data.purchasePrice !== undefined ? data.purchasePrice : 0,
                    salesPrice: data.salesPrice !== undefined ? data.salesPrice : 0,
                    currency: data.currency || 'AED',
                    unitOfMeasure: data.unitOfMeasure || 'Pcs',
                    reorderLimit: data.reorderLimit !== undefined ? data.reorderLimit : 10,
                    tax: data.tax || 'UAE VAT 5%',
                    taxRate: data.taxRate !== undefined ? data.taxRate : 5.0,
                    vatClassificationCode: data.vatClassificationCode || 'STANDARD',
                    active: typeof data.active === 'boolean' ? data.active : true,
                });
            } catch (err) {
                setError('Failed to fetch product details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, isEditing, getAuthHeaders]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let val = type === 'checkbox' ? checked : value;
        if (type === 'number') {
            val = value === '' ? '' : Number(value);
        }
        setProduct(prev => ({ ...prev, [name]: val }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!product.name.trim()) {
            setError('Product / Service Name is required.');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        const payload = {
            ...product,
            currency: product.currency || 'AED',
            purchasePrice: product.purchasePrice === '' ? 0 : Number(product.purchasePrice),
            salesPrice: product.salesPrice === '' ? 0 : Number(product.salesPrice),
            reorderLimit: product.reorderLimit === '' ? 0 : Number(product.reorderLimit),
            taxRate: product.taxRate === '' ? 0 : Number(product.taxRate),
        };

        formData.append('product', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const tenantId = localStorage.getItem('tenantId') || 'default';
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'X-Tenant-ID': tenantId
                },
            };

            if (isEditing) {
                await axios.put(`${API_URL}/crm/sales-products/${id}`, formData, config);
            } else {
                await axios.post(`${API_URL}/crm/sales-products`, formData, config);
            }

            navigate('/company-settings/product-services');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save product details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) {
        return (
            <CompanyHubLayout>
                <div className="flex justify-center items-center h-full py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-[#00A9A8]" />
                </div>
            </CompanyHubLayout>
        );
    }

    return (
        <CompanyHubLayout>
            <form onSubmit={handleSubmit} className="flex flex-col h-full bg-[#F7FAFF] dark:bg-gray-900">
                {/* Header Bar */}
                <header className="bg-white dark:bg-gray-800 shadow-2xs px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/company-settings/product-services')}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Back to Catalog"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                    {isEditing ? 'Edit Product / Service' : 'Add New Product / Service'}
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Settings &gt; Product & Services &gt; {isEditing ? 'Edit' : 'New Entry'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/company-settings/product-services')}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                <X className="inline mr-1.5 h-4 w-4" /> Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2 text-xs font-semibold bg-[#00A9A8] hover:bg-[#008f8e] text-white rounded-lg shadow-2xs transition-colors disabled:opacity-50 flex items-center"
                            >
                                {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                                {isEditing ? 'Update Entry' : 'Save Item'}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-grow p-6 w-full space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Details Panel (2 Cols) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Section 1: Basic Profile */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center">
                                    <Package className="w-4 h-4 mr-2 text-[#00A9A8]" /> Basic Item Profile
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Product / Service Name *</label>
                                        <input
                                            name="name"
                                            value={product.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Stainless Steel Fastener / IT Consulting Service"
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#00A9A8]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">SKU / Item Code</label>
                                        <input
                                            name="itemCode"
                                            value={product.itemCode}
                                            onChange={handleInputChange}
                                            placeholder="e.g. SKU-9021"
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Item Type</label>
                                        <select
                                            name="productType"
                                            value={product.productType}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="FINISHED_GOODS">Finished Goods</option>
                                            <option value="RAW_MATERIAL">Raw Material</option>
                                            <option value="MERCHANDISE">Merchandise</option>
                                            <option value="SERVICE">Service / Non-Inventory</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Unit of Measure (UOM)</label>
                                        <select
                                            name="unitOfMeasure"
                                            value={product.unitOfMeasure}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="Pcs">Pcs (Pieces)</option>
                                            <option value="Box">Box</option>
                                            <option value="Kg">Kg (Kilograms)</option>
                                            <option value="Mtr">Mtr (Meters)</option>
                                            <option value="Ltr">Ltr (Liters)</option>
                                            <option value="Hours">Hours (Service)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Barcode Code</label>
                                        <input
                                            name="barcode"
                                            value={product.barcode}
                                            onChange={handleInputChange}
                                            placeholder="Auto-generated if empty"
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Description / Specification</label>
                                        <textarea
                                            name="description"
                                            value={product.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            placeholder="Detailed specifications, dimensions, features..."
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Pricing & UAE Tax Specs */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center">
                                    <Tag className="w-4 h-4 mr-2 text-[#00A9A8]" /> Pricing & Tax Setup (AED)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Cost / Purchase Price (AED)</label>
                                        <input
                                            type="number"
                                            name="purchasePrice"
                                            value={product.purchasePrice}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Selling / Sales Price (AED)</label>
                                        <input
                                            type="number"
                                            name="salesPrice"
                                            value={product.salesPrice}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                                        <input
                                            name="currency"
                                            value={product.currency || 'AED'}
                                            readOnly
                                            className="w-full px-3 py-2 text-xs border border-gray-200 bg-gray-100 rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Tax Specification</label>
                                        <select
                                            name="tax"
                                            value={product.tax}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="UAE VAT 5%">UAE VAT 5% (Standard Rate)</option>
                                            <option value="UAE VAT 0%">UAE VAT 0% (Zero-Rated)</option>
                                            <option value="EXEMPT">Exempt from Tax</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Tax Rate (%)</label>
                                        <input
                                            type="number"
                                            name="taxRate"
                                            value={product.taxRate}
                                            onChange={handleInputChange}
                                            placeholder="5.0"
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Reorder Limit Quantity</label>
                                        <input
                                            type="number"
                                            name="reorderLimit"
                                            value={product.reorderLimit}
                                            onChange={handleInputChange}
                                            placeholder="10"
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Side Panel: Image Upload & Status */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center">
                                    <ImageIcon className="w-4 h-4 mr-2 text-[#00A9A8]" /> Product Image
                                </h3>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-750">
                                    {imagePreview ? (
                                        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : isEditing && product.id ? (
                                        <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                                            <AuthenticatedImage url={`${API_URL}/crm/sales-products/${id}/image`} alt={product.name} className="w-full h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className="py-8">
                                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                                        </div>
                                    )}
                                    <label className="mt-4 px-4 py-2 bg-[#00A9A8] text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-[#008f8e] transition-colors inline-block">
                                        Browse Image
                                        <input type="file" onChange={handleImageChange} accept="image/*" className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </CompanyHubLayout>
    );
};

export default ProductServicesForm;
