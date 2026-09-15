import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, X, Trash2, Barcode } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const constructImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('data:') || relativeUrl.startsWith('http')) {
        return relativeUrl;
    }
    const pathParts = relativeUrl.split('/').filter(p => p);
    if (pathParts[0] === 'uploads' && pathParts.length >= 4) {
        return `${API_URL}/pos/uploads/view/${pathParts.slice(1).join('/')}`;
    }
    return `${API_URL}${relativeUrl}`;
};

const ProductForm = ({ product, onSave, onCancel, isSubmitting, onGenerateBarcode, posTheme }) => {
    const [formData, setFormData] = useState(product || { name: '', sku: '', description: '', categoryId: null, active: true, variants: [{ sku: '', barcode: '', price: 0, cost: 0, attributes: {}, imageUrl: null, imageFile: null, taxRateId: null, active: true }] });
    const [taxRates, setTaxRates] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const initialVariants = [{ sku: '', barcode: '', price: 0, cost: 0, attributes: {}, imageUrl: null, imageFile: null, taxRateId: null, active: true }];
        if (product) {
            setFormData({
                ...product,
                variants: product.variants.map(v => ({
                    ...v,
                    imageFile: null,
                    price: v.priceCents ? v.priceCents / 100 : 0,
                    cost: v.costCents ? v.costCents / 100 : 0
                }))
            });
        } else {
            setFormData({ name: '', sku: '', description: '', categoryId: null, active: true, variants: initialVariants });
        }
    }, [product]);

    useEffect(() => {
        const fetchTaxRates = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/pos/tax-rates`, { headers: { "Authorization": `Bearer ${token}` } });
                setTaxRates(response.data);
            } catch (err) { console.error("Failed to fetch tax rates:", err); }
        };
        fetchTaxRates();

        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/pos/categories`, { headers: { "Authorization": `Bearer ${token}` } });
                setCategories(response.data);
            } catch (err) { console.error("Failed to fetch categories:", err); }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleVariantChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const newVariants = [...formData.variants];
        newVariants[index][name] = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const handleAttributeChange = (variantIndex, attrIndex, field, value) => {
        const newVariants = [...formData.variants];
        let newAttributes = { ...newVariants[variantIndex].attributes };
        const oldKey = Object.keys(newAttributes)[attrIndex];

        if (field === 'key') {
            const oldValue = newAttributes[oldKey];
            const { [oldKey]: _, ...rest } = newAttributes;
            newAttributes = { ...rest, [value]: oldValue };
        } else {
            newAttributes[oldKey] = value;
        }
        newVariants[variantIndex].attributes = newAttributes;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const addAttribute = (variantIndex) => {
        const newVariants = [...formData.variants];
        newVariants[variantIndex].attributes[`new_attribute_${Object.keys(newVariants[variantIndex].attributes).length + 1}`] = '';
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const removeAttribute = (variantIndex, keyToRemove) => {
        const newVariants = [...formData.variants];
        const newAttributes = { ...newVariants[variantIndex].attributes };
        delete newAttributes[keyToRemove];
        newVariants[variantIndex].attributes = newAttributes;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    }

    const handleVariantImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const newVariants = [...formData.variants];
            newVariants[index].imageFile = file;
            const reader = new FileReader();
            reader.onloadend = () => {
                newVariants[index].imageUrl = reader.result;
                setFormData(prev => ({ ...prev, variants: newVariants }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (imageFile) => {
        try {
            const formData = new FormData();
            formData.append("file", imageFile);
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/pos/uploads/product-image`, formData, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            });
            return response.data.imageUrl;
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Failed to upload image.");
            return null;
        }
    };

    const addVariant = () => {
        setFormData(prev => ({ ...prev, variants: [...prev.variants, { sku: '', barcode: '', price: 0, cost: 0, attributes: {}, imageUrl: '', taxRateId: null, active: true }] }));
    };

    const removeVariant = (index) => {
        setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (/^\d+$/.test(formData.name?.trim() || '')) {
            toast.error("Product Name cannot be numeric-only.");
            return;
        }
        const submitProduct = async () => {
            const uploadedVariants = await Promise.all(
                (formData.variants || []).map(async (variant) => {
                    let updatedVariant = { ...variant };
                    if (updatedVariant.imageFile) {
                        const imageUrl = await handleUpload(updatedVariant.imageFile);
                        updatedVariant.imageUrl = imageUrl;
                    }
                    updatedVariant.priceCents = Math.round((parseFloat(updatedVariant.price) || 0) * 100);
                    updatedVariant.costCents = Math.round((parseFloat(updatedVariant.cost) || 0) * 100);
                    return updatedVariant;
                })
            );
            const productData = { ...formData, categoryId: formData.categoryId === '' ? null : formData.categoryId, variants: uploadedVariants };
            onSave(productData);
        };
        submitProduct().catch(error => {
            console.error("Error during product save:", error);
            toast.error("Could not complete product save.");
        });
    };

    return (
        <form id="product-form" onSubmit={handleSubmit} className="p-5 flex-grow overflow-y-auto overflow-x-hidden space-y-5 text-xs">
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">General Information</h3>

                {/* 1st Row: 3 Fields (Product Name, Base SKU, Category) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label htmlFor="name" className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                        <input id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="sku" className="block font-semibold text-slate-700 mb-1">Base SKU</label>
                        <input id="sku" name="sku" value={formData.sku} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-slate-900 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="categoryId" className="block font-semibold text-slate-700 mb-1">Category</label>
                        <select id="categoryId" name="categoryId" value={formData.categoryId || ''} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none">
                            <option value="">Uncategorized</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Below 1st Row: Full Width Description */}
                <div>
                    <label htmlFor="description" className="block font-semibold text-slate-700 mb-1">Description</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="h-4 w-4 rounded-md text-slate-900 focus:ring-slate-900 border-slate-300" />
                    <span className="font-semibold text-slate-800">Active Status</span>
                </label>
            </div>

            <div className="pt-2">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-800">Variants ({formData.variants.length})</h3>
                    <button
                        type="button"
                        onClick={addVariant}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-xs transition-all hover:opacity-90 cursor-pointer flex items-center gap-1.5"
                        style={{ backgroundColor: posTheme?.primary || '#0f172a' }}
                    >
                        <PlusCircle size={15} /> Add Variant
                    </button>
                </div>

                {/* Variants Grid Layout: 2 Variants Per Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {formData.variants.map((variant, index) => (
                        <div key={index} className="p-3.5 border border-slate-200/80 rounded-2xl bg-slate-50/50 relative space-y-3 flex flex-col justify-between">
                            {formData.variants.length > 1 && (
                                <button type="button" onClick={() => removeVariant(index)} className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-rose-600 transition-colors">
                                    <X size={15} />
                                </button>
                            )}
                            {onGenerateBarcode && variant.barcodeImageUrl && (
                                <button type="button" onClick={() => onGenerateBarcode(variant)} className="absolute top-2.5 right-8 p-1 text-slate-500 hover:text-slate-900 transition-colors" title="View Barcode">
                                    <Barcode size={15} />
                                </button>
                            )}

                            {/* Attributes */}
                            <div className="space-y-1.5">
                                <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider">Variant Attributes</span>
                                {Object.entries(variant.attributes).map(([key, value], attrIndex) => (
                                    <div key={attrIndex} className="flex items-center gap-1.5">
                                        <input type="text" value={key} onChange={(e) => handleAttributeChange(index, attrIndex, 'key', e.target.value)} className="w-1/2 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs" placeholder="Attr (e.g. Size)" />
                                        <input type="text" value={value} onChange={(e) => handleAttributeChange(index, attrIndex, 'value', e.target.value)} className="w-1/2 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs" placeholder="Val (e.g. XL)" />
                                        <button type="button" onClick={() => removeAttribute(index, key)} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 size={13} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addAttribute(index)} className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline mt-1">
                                    + Add Attribute
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 pt-1">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">SKU</label>
                                    <input name="sku" value={variant.sku} onChange={(e) => handleVariantChange(index, e)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Barcode</label>
                                    <input name="barcode" value={variant.barcode || ''} onChange={(e) => handleVariantChange(index, e)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Price (AED)</label>
                                    <input name="price" type="number" step="0.01" value={variant.price} onChange={(e) => handleVariantChange(index, e)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Cost (AED)</label>
                                    <input name="cost" type="number" step="0.01" value={variant.cost} onChange={(e) => handleVariantChange(index, e)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Tax Rate</label>
                                    <select name="taxRateId" value={variant.taxRateId || ''} onChange={(e) => handleVariantChange(index, e)} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs">
                                        <option value="">No Tax</option>
                                        {taxRates.map(rate => <option key={rate.id} value={rate.id}>{rate.name} ({rate.percent}%)</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Variant Image</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleVariantImageChange(index, e)} className="text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-slate-200 file:font-semibold" />
                                </div>
                                {variant.imageUrl && (
                                    <div className="col-span-2 flex items-center gap-2 pt-1">
                                        <img src={constructImageUrl(variant.imageUrl)} alt="Preview" className="w-10 h-10 object-contain rounded-lg border bg-white p-0.5" />
                                        <span className="text-[10px] text-slate-400">Image attached</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </form>
    );
};

export default ProductForm;