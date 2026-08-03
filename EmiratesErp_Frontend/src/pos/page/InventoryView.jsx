import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { ShoppingCart, Package, PlusCircle, Loader, X, Eye, Edit, Trash2, SlidersHorizontal, History, Store, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import { POS_FALLBACK_THEME } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Auth Hook ---
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
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : 'N/A';

// --- Modal Component ---
const Modal = ({ isOpen, onClose, title, children, size = 'max-w-2xl' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className={`bg-white rounded-3xl shadow-2xl w-full ${size} flex flex-col max-h-[90vh] overflow-hidden border border-slate-100`} onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-base font-bold text-slate-900">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"><X size={18} /></button>
                </div>
                <div className="p-6 overflow-y-auto font-sans text-xs">{children}</div>
            </div>
        </div>
    );
};

// --- Purchase Order Form ---
const PurchaseOrderForm = ({ onSave, onCancel, stores, products, posTheme }) => {
    const [formData, setFormData] = useState({
        storeId: stores[0]?.id || '',
        supplierName: '',
        status: 'open',
        items: [{ productVariantId: '', quantityOrdered: 1, unitCostCents: 0 }]
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        newItems[index][name] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { productVariantId: '', quantityOrdered: 1, unitCostCents: 0 }]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave(formData);
        } catch (error) {
            // Handled by parent
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                    <label className="block font-bold text-slate-700 mb-1">Store *</label>
                    <select name="storeId" value={formData.storeId} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none" required>
                        {stores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block font-bold text-slate-700 mb-1">Supplier Name *</label>
                    <input name="supplierName" value={formData.supplierName} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none" required />
                </div>
            </div>
            <h4 className="font-bold text-slate-900 pt-3 border-t border-slate-100">Order Items</h4>
            <div className="space-y-2.5">
                {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                        <div className="col-span-5">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Product</label>
                            <select name="productVariantId" value={item.productVariantId} onChange={e => handleItemChange(index, e)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none" required>
                                <option value="">Select Product</option>
                                {products.flatMap(p => p.variants.map(v => (
                                    <option key={v.id} value={v.id}>{p.name} ({v.sku})</option>
                                )))}
                            </select>
                        </div>
                        <div className="col-span-3">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Quantity</label>
                            <input name="quantityOrdered" type="number" min="1" value={item.quantityOrdered} onChange={e => handleItemChange(index, e)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none" />
                        </div>
                        <div className="col-span-3">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Unit Cost (Cents)</label>
                            <input name="unitCostCents" type="number" min="0" value={item.unitCostCents} onChange={e => handleItemChange(index, e)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none" />
                        </div>
                        <div className="col-span-1">
                            <button type="button" onClick={() => removeItem(index)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addItem} className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-all inline-flex items-center gap-1.5">
                <PlusCircle size={14} /> Add Line Item
            </button>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 flex items-center gap-2" style={{ backgroundColor: posTheme?.primary || '#0f172a' }} disabled={isLoading}>
                    {isLoading && <Loader className="animate-spin h-4 w-4" />} Create Purchase Order
                </button>
            </div>
        </form>
    );
};

const StockAdjustmentForm = ({ onSave, onCancel, item, stores, products, posTheme }) => {
    const [formData, setFormData] = useState({
        storeId: item?.storeId || stores[0]?.id || '',
        productVariantId: item?.productVariantId || '',
        changeQuantity: 1,
        reason: 'Manual Adjustment',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave(formData);
        } catch (error) {
            // Handled by parent
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <p className="text-xs text-slate-600">Adjusting stock for: <span className="font-bold text-slate-900">{item?.productName} ({item?.productVariantSku || item?.variantSku})</span></p>
            <input type="hidden" name="productVariantId" value={formData.productVariantId} />
            <div>
                <label className="block font-bold text-slate-700 mb-1">Store *</label>
                <select name="storeId" value={formData.storeId} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none" required>
                    {stores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity Change (+ to add, - to reduce) *</label>
                <input name="changeQuantity" type="number" value={formData.changeQuantity} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-slate-900 outline-none" required />
            </div>
            <div>
                <label className="block font-bold text-slate-700 mb-1">Reason *</label>
                <input name="reason" value={formData.reason} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none" required />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 flex items-center gap-2" style={{ backgroundColor: posTheme?.primary || '#0f172a' }} disabled={isLoading}>
                    {isLoading && <Loader className="animate-spin h-4 w-4" />} Adjust Stock
                </button>
            </div>
        </form>
    );
};

const AddStockItemForm = ({ onSave, onCancel, stores, products, existingVariantIds, selectedStoreId, posTheme }) => {
    const [formData, setFormData] = useState({
        storeId: selectedStoreId || stores[0]?.id || '',
        productVariantId: '',
        changeQuantity: 1,
        reason: 'Initial Stock',
    });
    const [isLoading, setIsLoading] = useState(false);

    const availableVariants = useMemo(() => {
        return products.flatMap(p => p.variants.filter(v => !existingVariantIds.has(v.id)));
    }, [products, existingVariantIds]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave(formData);
        } catch (error) {
            // Handled by parent
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
                <label className="block font-bold text-slate-700 mb-1">Product Variant *</label>
                <select name="productVariantId" value={formData.productVariantId} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none" required>
                    <option value="">Select a product variant...</option>
                    {availableVariants.map(v => <option key={v.id} value={v.id}>{v.productName} ({v.sku})</option>)}
                </select>
            </div>
            <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Quantity *</label>
                <input name="changeQuantity" type="number" min="0" value={formData.changeQuantity} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-slate-900 outline-none" required />
            </div>
            <div>
                <label className="block font-bold text-slate-700 mb-1">Reason *</label>
                <input name="reason" value={formData.reason} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none" required />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 flex items-center gap-2" style={{ backgroundColor: posTheme?.primary || '#0f172a' }} disabled={isLoading}>
                    {isLoading && <Loader className="animate-spin h-4 w-4" />} Add to Stock
                </button>
            </div>
        </form>
    );
};

const StockLevelsTab = ({ posTheme }) => {
    const { canManage } = usePosAuth();
    const [stockLevels, setStockLevels] = useState([]);
    const [loading, setLoading] = useState({ stores: true, stock: false });
    const [error, setError] = useState('');
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
    const [adjustmentItem, setAdjustmentItem] = useState(null);
    const [stores, setStores] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedStore, setSelectedStore] = useState('');

    const fetchData = useCallback(async () => {
        setLoading({ stores: true, stock: false });
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const [productsRes, storesRes] = await Promise.all([
                axios.get(`${API_URL}/pos/products`, { headers }),
                axios.get(`${API_URL}/pos/stores`, { headers }),
            ]);
            const processedProducts = productsRes.data.map(p => ({
                ...p, variants: p.variants.map(v => ({ ...v, productName: p.name }))
            }));
            setProducts(processedProducts);
            setStores(storesRes.data);
            if (storesRes.data.length > 0) {
                setSelectedStore(storesRes.data[0].id);
            }
        } catch (err) {
            setError('Failed to load stock levels.');
            toast.error("Failed to load stock levels.");
        } finally {
            setLoading(prev => ({ ...prev, stores: false }));
        }
    }, []);

    const fetchStockForStore = useCallback(async (storeId) => {
        if (!storeId) {
            setStockLevels([]);
            return;
        }
        setLoading(prev => ({ ...prev, stock: true }));
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/pos/inventory/store/${storeId}`, { headers });
            setStockLevels(response.data);
        } catch (err) {
            setError(`Failed to load stock levels for the selected store.`);
            toast.error("Failed to load store stock levels.");
        } finally {
            setLoading(prev => ({ ...prev, stock: false }));
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenAdjustModal = (item) => {
        setAdjustmentItem(item);
        setIsAdjustModalOpen(true);
    };

    useEffect(() => {
        if (selectedStore) fetchStockForStore(selectedStore);
    }, [selectedStore, fetchStockForStore]);

    const handleSaveAdjustment = async (adjustmentData) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/pos/stock-movements`, adjustmentData, { headers: { "Authorization": `Bearer ${token}` } });
            toast.success("Stock adjusted successfully!");
            setIsAdjustModalOpen(false);
            fetchStockForStore(selectedStore);
        } catch (error) {
            toast.error(`Error: ${error.response?.data?.message || 'Could not adjust stock.'}`);
            throw error;
        }
    };

    const handleSaveNewStockItem = async (stockData) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/pos/stock-movements`, stockData, { headers: { "Authorization": `Bearer ${token}` } });
            toast.success("Product added to stock!");
            setIsAddStockModalOpen(false);
            fetchStockForStore(selectedStore);
        } catch (error) {
            toast.error(`Error: ${error.response?.data?.message || 'Could not add product to stock.'}`);
            throw error;
        }
    };

    const groupedStock = useMemo(() => {
        if (!stockLevels.length || !products.length) return {};
        const variantMap = new Map(products.flatMap(p => p.variants.map(v => [v.id, p])));
        return stockLevels.reduce((acc, item) => {
            const product = variantMap.get(item.productVariantId);
            const categoryName = product?.category?.name || 'Uncategorized';
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(item);
            return acc;
        }, {});
    }, [stockLevels, products]);

    const existingVariantIdsInStore = useMemo(() =>
        new Set(stockLevels.map(item => item.productVariantId))
        , [stockLevels]);

    if (loading.stores) return <div className="flex justify-center items-center p-10"><Loader className="animate-spin h-6 w-6 text-slate-900" /></div>;
    if (error) return <div className="text-center text-rose-600 font-semibold p-6 bg-rose-50 rounded-2xl text-xs">{error}</div>;

    return (
        <div className="space-y-3.5">
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                    <Store size={15} className="text-slate-400" />
                    <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="pl-3 pr-7 py-2 bg-white rounded-full text-xs font-bold text-slate-700 border-0 shadow-xs outline-none cursor-pointer focus:ring-2 focus:ring-slate-900">
                        <option value="">-- Select Store --</option>
                        {stores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
                    </select>
                </div>
                {canManage && selectedStore && (
                    <button onClick={() => setIsAddStockModalOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer" style={{ backgroundColor: posTheme?.primary || '#0f172a' }}>
                        <PlusCircle size={15} /> Add Product to Stock
                    </button>
                )}
            </div>

            {loading.stock ? (
                <div className="flex justify-center items-center p-12"><Loader className="animate-spin h-6 w-6 text-slate-900" /></div>
            ) : Object.keys(groupedStock).length === 0 && selectedStore ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/60 shadow-xs">
                    <Package className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-700">No stock records found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Add products to this store to begin tracking inventory.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(groupedStock).map(([category, items]) => (
                        <div key={category} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                            <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/60 flex items-center gap-2 font-bold text-xs text-slate-800">
                                <Tag size={13} className="text-slate-400" /> {category}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="py-2.5 px-4">Product</th>
                                            <th className="py-2.5 px-4">SKU</th>
                                            <th className="py-2.5 px-4 text-right">Quantity</th>
                                            {canManage && <th className="py-2.5 px-4 text-right">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                        {items.map(item => (
                                            <tr key={item.inventoryId} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-2.5 px-4 font-bold text-slate-900">{item.productName}</td>
                                                <td className="py-2.5 px-4 font-mono text-slate-500">{item.productVariantSku}</td>
                                                <td className="py-2.5 px-4 text-right font-extrabold text-slate-900">{item.quantity}</td>
                                                {canManage && (
                                                    <td className="py-2.5 px-4 text-right">
                                                        <button onClick={() => handleOpenAdjustModal(item)} className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="Adjust Stock">
                                                            <SlidersHorizontal size={15} />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title="Adjust Stock" size="max-w-xl">
                <StockAdjustmentForm onSave={handleSaveAdjustment} onCancel={() => setIsAdjustModalOpen(false)} item={adjustmentItem} stores={stores} products={products} posTheme={posTheme} />
            </Modal>
            <Modal isOpen={isAddStockModalOpen} onClose={() => setIsAddStockModalOpen(false)} title="Add Product to Stock" size="max-w-2xl">
                <AddStockItemForm onSave={handleSaveNewStockItem} onCancel={() => setIsAddStockModalOpen(false)} stores={stores} products={products} existingVariantIds={existingVariantIdsInStore} selectedStoreId={selectedStore} posTheme={posTheme} />
            </Modal>
        </div>
    );
};

const StockMovementsTab = () => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/pos/stock-movements`, { headers });
            setMovements(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            setError('Failed to load stock movements.');
            toast.error("Failed to load stock movements.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return <div className="flex justify-center items-center p-12"><Loader className="animate-spin h-6 w-6 text-slate-900" /></div>;
    if (error) return <div className="text-center text-rose-600 font-semibold p-6 bg-rose-50 rounded-2xl text-xs">{error}</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <tr>
                            <th className="py-2.5 px-4">Date</th>
                            <th className="py-2.5 px-4">Product</th>
                            <th className="py-2.5 px-4">SKU</th>
                            <th className="py-2.5 px-4">Store</th>
                            <th className="py-2.5 px-4 text-right">Quantity Change</th>
                            <th className="py-2.5 px-4">Reason</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {movements.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{formatDate(item.createdAt)}</td>
                                <td className="py-2.5 px-4 font-bold text-slate-900">{item.productName}</td>
                                <td className="py-2.5 px-4 font-mono text-slate-500">{item.variantSku}</td>
                                <td className="py-2.5 px-4 text-slate-600">{item.storeName}</td>
                                <td className={`py-2.5 px-4 text-right font-black ${item.changeQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {item.changeQuantity > 0 ? `+${item.changeQuantity}` : item.changeQuantity}
                                </td>
                                <td className="py-2.5 px-4 text-slate-600">{item.reason}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const InventoryView = ({ posTheme: propPosTheme }) => {
    const posTheme = propPosTheme || POS_FALLBACK_THEME;
    const [activeTab, setActiveTab] = useState('stock');

    const tabs = [
        { id: 'stock', name: 'Stock Levels', icon: Package },
        { id: 'movements', name: 'Stock Movements', icon: History },
    ];

    return (
        <div className="p-4 sm:p-5 font-sans space-y-3.5">
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Inventory & Stock</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Track real-time store stock levels and inventory movement history.</p>
                </div>
            </div>

            {/* Rounded Tab Navigation Bar */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-full w-fit text-xs font-bold">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all cursor-pointer ${isActive ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <Icon size={14} />
                            <span>{tab.name}</span>
                        </button>
                    );
                })}
            </div>

            <div className="pt-1">
                {activeTab === 'stock' && <StockLevelsTab posTheme={posTheme} />}
                {activeTab === 'movements' && <StockMovementsTab />}
            </div>
        </div>
    );
}

export default InventoryView;
