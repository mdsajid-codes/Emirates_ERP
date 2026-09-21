import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, X, AlertTriangle, Package, Tag, DollarSign, Percent, Barcode } from 'lucide-react';
import CompanyHubLayout from '../../components/CompanyHubLayout.jsx';

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

    if (!src) return <Loader2 className="animate-spin h-5 w-5 text-[#0178BC]" />;
    return <img src={src} alt={alt} className={className} />;
};

const ValidationModal = ({ isOpen, onClose, error }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[80] p-4" onClick={onClose}>
            <div className="bg-white text-[#102A43] rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-[#D7E3EE] flex justify-between items-center bg-red-50">
                    <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                        <AlertTriangle size={18} />
                        <span>Form Validation Error</span>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[#60738E] hover:bg-red-100 transition-colors"><X size={18} /></button>
                </div>
                <div className="p-4 flex flex-col gap-3">
                    <p className="text-xs text-[#60738E]">
                        Please resolve the error before saving the product:
                    </p>
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-600 font-medium">
                        {error}
                    </div>
                    <div className="flex justify-end mt-2 pt-3 border-t border-[#D7E3EE]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                        >
                            Review Form
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CrmSalesProductForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const isEditing = !!id;
    const isCompanySettings = location.pathname.includes('/company-settings');
    const redirectPath = isCompanySettings ? '/company-settings/product-services' : '/crm-dashboard/products';

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
    const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);

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
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [fetchProduct]);

    const [fieldErrors, setFieldErrors] = useState({});

    const validateField = (name, value) => {
        let err = '';
        if (name === 'name') {
            if (!value?.trim()) err = 'Product Name is required.';
            else if (/^\d+$/.test(value.trim())) err = 'Product Name cannot be numeric-only.';
        }
        if (name === 'itemCode' && value?.trim()) {
            if (value.trim().length > 30) err = 'Item Code / SKU cannot exceed 30 characters.';
        }
        if (name === 'description' && value?.trim()) {
            if (value.trim().length > 500) err = 'Description cannot exceed 500 characters.';
        }
        if (name === 'purchasePrice' && value !== '' && value !== null && value !== undefined) {
            const num = parseFloat(value);
            if (isNaN(num)) err = 'Purchase Price must be a valid number.';
            else if (num < 0) err = 'Purchase Price cannot be negative.';
        }
        if (name === 'salesPrice' && value !== '' && value !== null && value !== undefined) {
            const num = parseFloat(value);
            if (isNaN(num)) err = 'Sales Price must be a valid number.';
            else if (num < 0) err = 'Sales Price cannot be negative.';
        }
        if (name === 'unitOfMeasure' && value?.trim()) {
            if (/^\d+$/.test(value.trim())) err = 'Unit of Measure cannot be numeric-only.';
            else if (value.trim().length > 15) err = 'Unit of Measure cannot exceed 15 characters.';
        }
        if (name === 'reorderLimit' && value !== '' && value !== null && value !== undefined) {
            const num = parseInt(value, 10);
            if (isNaN(num) || num < 0 || num > 100000) err = 'Reorder Limit must be a non-negative number between 0 and 100,000.';
        }
        if (name === 'tax' && value?.trim()) {
            if (value.trim().length > 15) err = 'Tax type cannot exceed 15 characters.';
        }
        if (name === 'taxRate' && value !== '' && value !== null && value !== undefined) {
            const num = parseFloat(value);
            if (isNaN(num) || num < 0 || num > 100) err = 'Tax Rate (%) must be between 0% and 100%.';
        }
        if (name === 'vatClassificationCode' && value?.trim()) {
            if (value.trim().length > 15) err = 'VAT/GST Code cannot exceed 15 characters.';
            else if (!/^[a-zA-Z0-9\s\-]+$/.test(value.trim())) err = 'VAT/GST Code can only contain letters, digits, and hyphens.';
        }

        setFieldErrors(prev => {
            const next = { ...prev };
            if (err) next[name] = err;
            else delete next[name];
            return next;
        });

        return err;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setProduct(prev => ({
            ...prev,
            [name]: val,
        }));
        if (type !== 'checkbox') {
            validateField(name, val);
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCancel = () => {
        navigate(redirectPath);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = [];
        const fields = ['name', 'itemCode', 'description', 'purchasePrice', 'salesPrice', 'unitOfMeasure', 'reorderLimit', 'tax', 'taxRate', 'vatClassificationCode'];
        fields.forEach(field => {
            const err = validateField(field, product[field]);
            if (err) errors.push(err);
        });

        if (errors.length > 0) {
            setError(errors.join(' | '));
            setIsValidationModalOpen(true);
            return;
        }

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
            navigate(redirectPath);
        } catch (err) {
            const msg = err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} product.`;
            setError(msg);
            setIsValidationModalOpen(true);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <div className="flex flex-col h-full w-full bg-[#F8FAFC] text-[#102A43] p-0 overflow-hidden font-sans">
            <form onSubmit={handleSubmit} className="bg-white border-none rounded-none shadow-none overflow-hidden flex flex-col h-full min-h-0 w-full">
                {/* Header Bar */}
                <div className="bg-white border-b border-[#D7E3EE] px-4 py-3 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="p-1.5 rounded-lg text-[#60738E] hover:bg-[#F8FAFC] hover:text-[#102A43] border border-[#D7E3EE] transition-all cursor-pointer"
                            title="Back to Products"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-[#102A43] tracking-tight">
                                {isEditing ? 'Edit Sales Product' : 'Add New Sales Product'}
                            </h1>
                            <p className="text-xs text-[#60738E] mt-0.5">
                                Register product catalog specifications, pricing, inventory parameters, and tax rules
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-3.5 py-1.5 text-xs font-bold text-[#60738E] bg-[#F8FAFC] border border-[#C9D8E5] rounded-md hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-[#0178BC] rounded-md hover:bg-[#005A8C] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <Save size={14} />}
                            {isEditing ? 'Update Product' : 'Save Product Record'}
                        </button>
                    </div>
                </div>

                {/* Main Scrollable Grid Content */}
                <div className="p-2 sm:p-3 flex flex-col gap-2.5 sm:gap-3 bg-[#F8FAFC] flex-1 overflow-y-auto w-full">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600 font-medium shrink-0">
                            <AlertTriangle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                        {/* Column 1: Image & Media (1 Col) */}
                        <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-3 border-t-2 border-t-[#0178BC]">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                    1
                                </div>
                                <h2 className="text-sm font-bold text-[#102A43]">Product Media & Barcode</h2>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">Product Image</label>
                                    <div className="mt-1 flex justify-center px-4 py-5 border-2 border-[#C9D8E5] border-dashed rounded-lg bg-[#F8FAFC] hover:bg-slate-50 transition-colors">
                                        <div className="space-y-2 text-center">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Product Preview" className="mx-auto h-36 w-36 object-contain rounded-md border border-[#D7E3EE] bg-white p-1" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-[#60738E]">
                                                    <ImageIcon size={28} />
                                                </div>
                                            )}
                                            <div className="flex text-xs text-[#60738E] justify-center mt-2">
                                                <label htmlFor="image-upload" className="relative cursor-pointer bg-white px-2.5 py-1 border border-[#C9D8E5] rounded-md font-bold text-[#0178BC] hover:bg-slate-50 focus-within:outline-none transition-colors shadow-2xs">
                                                    <span>Upload Image</span>
                                                    <input id="image-upload" name="image" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                                </label>
                                            </div>
                                            <p className="text-[10px] text-[#60738E]">PNG, JPG up to 10MB</p>
                                        </div>
                                    </div>
                                </div>

                                {isEditing && product.barcodeUrl && (
                                    <div className="pt-2 border-t border-[#E8EEF7]">
                                        <label className="block text-xs font-bold text-[#102A43] mb-1 flex items-center gap-1">
                                            <Barcode size={14} className="text-[#0178BC]" /> Generated Barcode
                                        </label>
                                        <div className="p-3 bg-[#F8FAFC] border border-[#C9D8E5] rounded-lg flex justify-center items-center min-h-[70px]">
                                            <AuthenticatedImage
                                                url={getBarcodeUrl(product.barcodeUrl)}
                                                alt="Barcode"
                                                className="h-14 object-contain"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Column 2 & 3: Specifications & Attributes (2 Cols) */}
                        <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4">
                            {/* Section 2: General Specifications */}
                            <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-3 border-t-2 border-t-[#0178BC]">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                        2
                                    </div>
                                    <h2 className="text-sm font-bold text-[#102A43]">General Specifications</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-[#102A43] mb-1">
                                            Product Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={product.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Industrial Aluminum Profile"
                                            required
                                            className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                        />
                                        {fieldErrors.name && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#102A43] mb-1">
                                            Item Code / SKU
                                        </label>
                                        <input
                                            type="text"
                                            name="itemCode"
                                            maxLength={30}
                                            value={product.itemCode}
                                            onChange={handleChange}
                                            placeholder="e.g. PRD-1002"
                                            className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.itemCode ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                        />
                                        {fieldErrors.itemCode && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.itemCode}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#102A43] mb-1">
                                            Item Type
                                        </label>
                                        <select
                                            name="itemType"
                                            value={product.itemType}
                                            onChange={handleChange}
                                            className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                        >
                                            <option value="PRODUCT">Product</option>
                                            <option value="SERVICE">Service</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-[#102A43] mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            rows="2"
                                            maxLength={500}
                                            value={product.description}
                                            onChange={handleChange}
                                            placeholder="Enter item specification details (max 500 chars)..."
                                            className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.description ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all`}
                                        ></textarea>
                                        {fieldErrors.description && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.description}</p>}
                                    </div>

                                    <div className="sm:col-span-2 flex items-center gap-6 pt-1">
                                        <label className="flex items-center gap-2 text-xs font-bold text-[#102A43] cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isPurchase"
                                                checked={product.isPurchase}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-[#0178BC] rounded border-[#C9D8E5] focus:ring-[#0178BC]"
                                            />
                                            Purchase Item
                                        </label>
                                        <label className="flex items-center gap-2 text-xs font-bold text-[#102A43] cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isSales"
                                                checked={product.isSales}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-[#0178BC] rounded border-[#C9D8E5] focus:ring-[#0178BC]"
                                            />
                                            Sales Item
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Financials, Stock & Tax Parameters */}
                            <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-3 border-t-2 border-t-[#0178BC]">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                        3
                                    </div>
                                    <h2 className="text-sm font-bold text-[#102A43]">Pricing, Inventory & Tax Protocol</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-[#102A43] mb-1">
                                            Purchase Price (AED)
                                        </label>
                                        <input
                                            type="number"
                                            name="purchasePrice"
                                            min="0"
                                            step="0.01"
                                            value={product.purchasePrice}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.purchasePrice ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                        />
                                        {fieldErrors.purchasePrice && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.purchasePrice}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#102A43] mb-1">
                                            Sales Price (AED)
                                        </label>
                                        <input
                                            type="number"
                                            name="salesPrice"
                                            min="0"
                                            step="0.01"
                                            value={product.salesPrice}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.salesPrice ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                        />
                                        {fieldErrors.salesPrice && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.salesPrice}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#102A43] mb-1">
                                            Unit of Measure
                                        </label>
                                        <input
                                            type="text"
                                            name="unitOfMeasure"
                                            maxLength={15}
                                            value={product.unitOfMeasure}
                                            onChange={handleChange}
                                            placeholder="e.g. pcs, kg, ltr"
                                            className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.unitOfMeasure ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                        />
                                        {fieldErrors.unitOfMeasure && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.unitOfMeasure}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#102A43] mb-1">
                                            Reorder Limit
                                        </label>
                                        <input
                                            type="number"
                                            name="reorderLimit"
                                            min="0"
                                            max="100000"
                                            value={product.reorderLimit}
                                            onChange={handleChange}
                                            placeholder="e.g. 10"
                                            className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.reorderLimit ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                        />
                                        {fieldErrors.reorderLimit && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.reorderLimit}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#102A43] mb-1">
                                            Tax Type
                                        </label>
                                        <input
                                            type="text"
                                            name="tax"
                                            maxLength={15}
                                            value={product.tax}
                                            onChange={handleChange}
                                            placeholder="e.g. VAT"
                                            className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.tax ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                        />
                                        {fieldErrors.tax && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.tax}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#102A43] mb-1">
                                            Tax Rate (%)
                                        </label>
                                        <input
                                            type="number"
                                            name="taxRate"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={product.taxRate}
                                            onChange={handleChange}
                                            placeholder="e.g. 5"
                                            className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.taxRate ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                        />
                                        {fieldErrors.taxRate && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.taxRate}</p>}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-[#102A43] mb-1">
                                            VAT / GST Classification Code
                                        </label>
                                        <input
                                            type="text"
                                            name="vatClassificationCode"
                                            maxLength={15}
                                            value={product.vatClassificationCode}
                                            onChange={handleChange}
                                            placeholder="e.g. HSN/SAC Code"
                                            className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.vatClassificationCode ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                        />
                                        {fieldErrors.vatClassificationCode && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.vatClassificationCode}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <ValidationModal
                isOpen={isValidationModalOpen}
                onClose={() => setIsValidationModalOpen(false)}
                error={error}
            />
        </div>
    );

    return isCompanySettings ? <CompanyHubLayout>{content}</CompanyHubLayout> : content;
};

export default CrmSalesProductForm;