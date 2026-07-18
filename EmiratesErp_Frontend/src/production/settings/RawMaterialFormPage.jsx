import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Save, Upload, Loader, ImageIcon, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RawMaterialFormPage = ({ item, onSave, onCancel, loading: isSubmitting }) => {
  const isEditMode = Boolean(item?.id);
  const [formData, setFormData] = useState({
    itemCode: '',
    name: '',
    description: '',
    barcode: '',
    categoryId: '',
    subCategoryId: '',
    issueUnitId: '',
    purchaseUnitId: '',
    taxId: '',
    locationId: '',
    inventoryTypeId: '',
    itemType: 'PRODUCT',
    forPurchase: true,
    forSales: false,
    discontinued: false,
    purchasePrice: 0,
    salesPrice: 0,
    reorderLimit: 0,
    unitRelation: 1,
    stockQuantity: 0,
    picturePath: '',
    imageFile: null
  });

  const [selectData, setSelectData] = useState({
    categories: [],
    subCategories: [],
    units: [],
    taxes: [],
    locations: [],
    inventoryTypes: []
  });

  // Image & Barcode Previews
  const [imagePreview, setImagePreview] = useState(null);
  const [barcodePreview, setBarcodePreview] = useState(null);

  const [loading, setLoading] = useState(true);

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { "Authorization": `Bearer ${token}` };
        const [catRes, unitRes, taxRes, locRes, invRes] = await Promise.all([
          axios.get(`${API_URL}/production/categories`, { headers }),
          axios.get(`${API_URL}/production/units`, { headers }),
          axios.get(`${API_URL}/production/taxes`, { headers }),
          axios.get(`${API_URL}/locations`, { headers }),
          axios.get(`${API_URL}/production/inventory-types`, { headers }),
        ]);

        setSelectData(prev => ({
          ...prev,
          categories: catRes.data || [],
          units: unitRes.data || [],
          taxes: taxRes.data || [],
          locations: locRes.data || [],
          inventoryTypes: invRes.data || [],
          subCategories: prev.subCategories || []
        }));
      } catch (err) {
        console.error("Failed to fetch form dependencies", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch SubCategories when Category Changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!formData.categoryId) {
        setSelectData(prev => ({ ...prev, subCategories: [] }));
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const headers = { "Authorization": `Bearer ${token}` };
        const response = await axios.get(`${API_URL}/production/sub-categories?categoryId=${formData.categoryId}`, { headers });
        setSelectData(prev => ({ ...prev, subCategories: response.data || [] }));
      } catch (err) {
        console.error("Failed to fetch sub-categories", err);
        setSelectData(prev => ({ ...prev, subCategories: [] }));
      }
    };
    fetchSubCategories();
  }, [formData.categoryId]);

  // Populate Form Data on Edit
  useEffect(() => {
    if (!item) return;

    setFormData({
      itemCode: item.itemCode ?? '',
      name: item.name ?? '',
      description: item.description ?? '',
      barcode: item.barcode ?? '',
      categoryId: item.categoryId != null ? String(item.categoryId) : '',
      subCategoryId: item.subCategoryId != null ? String(item.subCategoryId) : '',
      issueUnitId: item.issueUnitId != null ? String(item.issueUnitId) : '',
      purchaseUnitId: item.purchaseUnitId != null ? String(item.purchaseUnitId) : '',
      taxId: item.taxId != null ? String(item.taxId) : '',
      locationId: item.locationId != null ? String(item.locationId) : '',
      inventoryTypeId: item.inventoryTypeId != null ? String(item.inventoryTypeId) : '',
      itemType: item.itemType ?? 'PRODUCT',
      forPurchase: !!item.forPurchase,
      forSales: !!item.forSales,
      discontinued: !!item.discontinued,
      salesPrice: item.salesPrice ?? 0,
      stockQuantity: item.stockQuantity ?? 0,
      reorderLimit: item.reorderLimit ?? 0,
      unitRelation: item.unitRelation ?? 1,
      picturePath: item.picturePath ?? '',
      imageFile: null
    });

    const fetchImage = async (url, setter) => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(url, {
          headers: { "Authorization": `Bearer ${token}` },
          responseType: 'blob'
        });
        if (response.data.size > 0) {
          setter(URL.createObjectURL(response.data));
        }
      } catch (err) {
        console.error("Failed to load image", url, err);
        setter(null);
      }
    };

    if (item.id) {
      if (item.picturePath) {
        fetchImage(`${API_URL}/production/raw-materials/${item.id}/image`, setImagePreview);
      }

      // Always try to fetch barcode if ID exists, as it's auto-generated
      fetchImage(`${API_URL}/production/raw-materials/${item.id}/barcode-image`, setBarcodePreview);
    } else if (item.barcodeImgUrl) {
      setBarcodePreview(item.barcodeImgUrl);
    }

  }, [item]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'imageFile' && formData[key] !== null && formData[key] !== undefined) {
        payload.append(key, formData[key]);
      }
    });

    if (formData.imageFile) {
      payload.append('image', formData.imageFile);
    }

    onSave(payload);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-purple-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {isEditMode ? 'Edit Raw Material' : 'New Raw Material'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEditMode ? `Updating ${formData.itemCode}` : 'Create a new material entry'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-purple-700 hover:bg-purple-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader className="animate-spin h-5 w-5" /> : <Save size={20} />}
            <span>{isEditMode ? 'Update Material' : 'Save Material'}</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-grow overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-6">

          {/* Top Section: Basic Info & Classification */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
              Classification & Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Inventory Type</label>
                <select
                  name="inventoryTypeId"
                  value={formData.inventoryTypeId}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Type</option>
                  {selectData.inventoryTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Item Type</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 w-full">
                    <input
                      type="radio"
                      name="itemType"
                      value="PRODUCT"
                      checked={formData.itemType === 'PRODUCT'}
                      onChange={handleChange}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium">Product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 w-full">
                    <input
                      type="radio"
                      name="itemType"
                      value="SERVICE"
                      checked={formData.itemType === 'SERVICE'}
                      onChange={handleChange}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium">Service</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 w-full">
                    <input
                      type="radio"
                      name="itemType"
                      value="FIXED_ASSET"
                      checked={formData.itemType === 'FIXED_ASSET'}
                      onChange={handleChange}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium">Fixed Asset</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 w-full">
                    <input
                      type="radio"
                      name="itemType"
                      value="MANPOWER"
                      checked={formData.itemType === 'MANPOWER'}
                      onChange={handleChange}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium">Manpower</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Flags</label>
                <div className="flex flex-col gap-2 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="forPurchase" checked={formData.forPurchase} onChange={handleChange} className="rounded text-purple-600 focus:ring-purple-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Available for Purchase</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="forSales" checked={formData.forSales} onChange={handleChange} className="rounded text-purple-600 focus:ring-purple-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Available for Sales</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="discontinued" checked={formData.discontinued} onChange={handleChange} className="rounded text-red-600 focus:ring-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400 font-medium">Discontinued</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Category</option>
                  {selectData.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Sub Category</label>
                <select
                  name="subCategoryId"
                  value={formData.subCategoryId}
                  onChange={handleChange}
                  disabled={!formData.categoryId}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
                >
                  <option value="">Select Sub Category</option>
                  {selectData.subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Item Code *</label>
                <input
                  type="text"
                  name="itemCode"
                  value={formData.itemCode}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Item Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Barcode</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    placeholder="Auto-generated if empty"
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  {barcodePreview && (
                    <div className="p-2 bg-white rounded border border-gray-200 flex justify-center">
                      <img src={barcodePreview} alt="Barcode" className="h-10 object-contain" />
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Image Upload Area */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
              <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Material Image</label>
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 bg-gray-100 dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center overflow-hidden relative group">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setImagePreview(null); setFormData(p => ({ ...p, imageFile: null })); }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <ImageIcon className="text-gray-400 h-10 w-10" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200">
                    <Upload size={16} />
                    <span>Choose Image</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    Supported formats: JPG, PNG, WEBP. Max size: 2MB.<br />
                    Upload a clear image of the raw material for easier identification.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Units & Pricing Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
              Units, Pricing & Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Issue Unit</label>
                <select
                  name="issueUnitId"
                  value={formData.issueUnitId}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Unit</option>
                  {selectData.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Purchase Unit</label>
                <select
                  name="purchaseUnitId"
                  value={formData.purchaseUnitId}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Unit</option>
                  {selectData.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Unit Relation</label>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">1 Purchase Unit =</span>
                  <input
                    type="number"
                    name="unitRelation"
                    value={formData.unitRelation}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-24 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center"
                  />
                  <span className="text-sm text-gray-500">Issue Unit(s)</span>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Stock Quantity</label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Reorder Limit</label>
                <input
                  type="number"
                  name="reorderLimit"
                  value={formData.reorderLimit}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Tax</label>
                <select
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">No Tax</option>
                  {selectData.taxes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>)}
                </select>
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Purchase Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full pl-8 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Sales Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="salesPrice"
                    value={formData.salesPrice}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full pl-8 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                <select
                  name="locationId"
                  value={formData.locationId}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">All Locations</option>
                  {selectData.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RawMaterialFormPage;
