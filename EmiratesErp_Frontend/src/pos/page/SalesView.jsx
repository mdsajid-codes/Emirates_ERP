import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Loader } from 'lucide-react';
import CustomerForm from '../components/CustomerForm';
import Modal from '../components/Modal';
import SalesHeader from '../sales/components/SalesHeader';
import ProductGrid from '../sales/components/ProductGrid';
import Cart from '../sales/components/Cart';
import PaymentModal from '../sales/components/PaymentModal';
import LookupModal from '../sales/components/LookupModal';
import DiscountModal from '../sales/components/DiscountModal';
import SaleSuccessModal from '../sales/components/SaleSuccessModal';
import BillModal from '../sales/components/BillModal';
import ProductPanel from '../sales/components/ProductPanel';
import InsertModal from '../sales/components/InsertModal';
import { formatPrice } from '../sales/utils';
import { POS_FALLBACK_THEME } from '../../utils/themeUtils';
import posData from '../data/posData.json';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const SalesView = ({ posTheme: propPosTheme }) => {
    const posTheme = propPosTheme || POS_FALLBACK_THEME;
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stores, setStores] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStore, setSelectedStore] = useState('');
    const [loading, setLoading] = useState({ products: true, customers: true, stores: true, sale: false });
    const [discountCents, setDiscountCents] = useState(0);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isBillModalOpen, setBillModalOpen] = useState(false);
    const [completedSale, setCompletedSale] = useState(null);
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [isProductPanelOpen, setProductPanelOpen] = useState(false);
    const [isLookupModalOpen, setLookupModalOpen] = useState(false);
    const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
    const [isInsertModalOpen, setInsertModalOpen] = useState(false);
    const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
    const [showInactive, setShowInactive] = useState(false);
    const [pendingSaleId, setPendingSaleId] = useState(null);
    const [resumedSaleDetails, setResumedSaleDetails] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = { "Authorization": `Bearer ${token}` };

        const fetchInitialData = async () => {
            try {
                const [customersRes, storesRes, categoriesRes] = await Promise.all([
                    axios.get(`${API_URL}/pos/customers`, { headers }),
                    axios.get(`${API_URL}/pos/stores`, { headers }),
                    axios.get(`${API_URL}/pos/categories`, { headers }),
                ]);
                setCustomers(customersRes.data);
                setStores(storesRes.data);
                setCategories(categoriesRes.data);
                
                let storeId = null;
                if (storesRes.data.length > 0) {
                    storeId = storesRes.data[0].id;
                    setSelectedStore(storeId);
                }

                const productsRes = await axios.get(`${API_URL}/pos/products`, {
                    headers,
                    params: storeId ? { storeId } : {}
                });
                setProducts(productsRes.data);
            } catch (err) {
                console.error("Error fetching initial POS data:", err);
            } finally {
                setLoading({ products: false, customers: false, stores: false, sale: false });
            }
        };

        fetchInitialData();
    }, []);

    const fetchProducts = useCallback(async (storeId = selectedStore) => {
        setLoading(prev => ({ ...prev, products: true }));
        try {
            const token = localStorage.getItem('token');
            const params = storeId ? { storeId } : {};
            const productsRes = await axios.get(`${API_URL}/pos/products`, {
                headers: { "Authorization": `Bearer ${token}` },
                params
            });
            setProducts(productsRes.data);
        } catch (err) {
            console.error("Error refetching products:", err);
        } finally {
            setLoading(prev => ({ ...prev, products: false }));
        }
    }, [selectedStore]);

    const isInitialMount = React.useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (selectedStore) {
            fetchProducts(selectedStore);
        }
    }, [selectedStore, fetchProducts]);

    const handleSaveProduct = async (productData) => {
        setIsSubmittingProduct(true);
        const token = localStorage.getItem('token');
        try {
            const payload = { ...productData, variants: productData.variants.map(({ imageFile, ...v }) => v) };
            await axios.post(`${API_URL}/pos/products`, payload, { headers: { "Authorization": `Bearer ${token}` } });
            setProductPanelOpen(false);
            fetchProducts();
        } catch (err) {
            console.error("Error saving product:", err);
        } finally {
            setIsSubmittingProduct(false);
        }
    };

    const handleAddToCart = (product, variant, quantityAvailable) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productVariantId === variant.id);

            if (quantityAvailable <= 0 && !existingItem) {
                return prevCart;
            }

            const taxRateObj = variant.taxRateId
                ? {
                    id: variant.taxRateId,
                    name: variant.taxRateName || 'Tax',
                    percent: Number(variant.taxRatePercent || 0),
                }
                : null;

            if (existingItem) {
                if (existingItem.quantity >= quantityAvailable) {
                    return prevCart;
                }
                return prevCart.map(item =>
                    item.productVariantId === variant.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prevCart, {
                productVariantId: variant.id,
                productName: product.name,
                priceCents: Number(variant.priceCents || 0),
                taxRate: taxRateObj,
                attributes: variant.attributes,
                quantity: 1,
                availableQuantity: quantityAvailable,
            }];
        });
    };

    const handleUpdateQuantity = (variantId, change) => {
        setCart(prevCart => prevCart.map(item => {
            if (item.productVariantId === variantId) {
                const newQuantity = item.quantity + change;
                if (change > 0 && newQuantity > item.availableQuantity) {
                    return item;
                }
                return { ...item, quantity: Math.max(1, newQuantity) };
            }
            return item;
        }));
    };

    const handleRemoveItem = (variantId) => {
        setCart(prevCart => prevCart.filter(item => item.productVariantId !== variantId));
    };

    const handleClearCart = () => {
        setCart([]);
        setDiscountCents(0);
        setResumedSaleDetails(null);
    };

    const handleInsertManually = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = selectedStore ? { storeId: selectedStore } : {};
            const response = await axios.post(`${API_URL}/pos/seed-data`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params
            });
            const data = response.data;
            setInsertModalOpen(false);
            fetchProducts(selectedStore);
        } catch (err) {
            console.error('Error seeding POS data:', err);
        }
    };

    const handleProcessSale = async (orderId, payment, saleDetails = {}) => {
        setLoading(prev => ({ ...prev, sale: true }));
        const saleRequest = {
            discountCents,
            storeId: selectedStore,
            customerId: selectedCustomer || null,
            orderId: orderId,
            items: cart.map(item => ({ productVariantId: item.productVariantId, quantity: item.quantity })),
            payments: [payment],
            orderType: saleDetails.orderType || 'DINE_IN',
            adultsCount: saleDetails.adultsCount || 0,
            kidsCount: saleDetails.kidsCount || 0,
            salesSource: saleDetails.salesSource || 'POS',
        };

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/pos/sales`, saleRequest, { headers: { "Authorization": `Bearer ${token}` } });
            setCart([]);
            setSelectedCustomer('');
            setDiscountCents(0);
            setBillModalOpen(false);
            setPaymentModalOpen(false);
            setResumedSaleDetails(null);
            setCompletedSale(response.data);
        } catch (err) {
            console.error("Sale creation failed:", err);
        } finally {
            setLoading(prev => ({ ...prev, sale: false }));
        }
    };

    const handleParkSale = async (orderId, saleDetails = {}) => {
        if (cart.length === 0) {
            return;
        }
        setLoading(prev => ({ ...prev, sale: true }));
        const saleRequest = {
            discountCents,
            storeId: selectedStore,
            customerId: selectedCustomer || null,
            orderId: orderId,
            items: cart.map(item => ({ productVariantId: item.productVariantId, quantity: item.quantity })),
            status: 'pending',
            payments: [],
            orderType: saleDetails.orderType || 'DINE_IN',
            adultsCount: saleDetails.adultsCount || 0,
            kidsCount: saleDetails.kidsCount || 0,
            salesSource: saleDetails.salesSource || 'POS',
        };

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/pos/sales`, saleRequest, { headers: { "Authorization": `Bearer ${token}` } });
            handleClearCart();
            setBillModalOpen(false);
        } catch (err) {
            console.error("Parking sale failed:", err);
        } finally {
            setLoading(prev => ({ ...prev, sale: false }));
        }
    };

    const handleResumeSale = async (saleId) => {
        if (cart.length > 0 && !window.confirm('This will clear your current cart. Resume sale?')) {
            return;
        }
        handleClearCart();
        setLoading(prev => ({ ...prev, sale: true }));

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/pos/sales/${saleId}`, { headers: { "Authorization": `Bearer ${token}` } });
            const saleToResume = response.data;

            const newCart = saleToResume.items.map(item => {
                if (!item.productVariant) return null;
                return {
                    productVariantId: item.productVariant.id,
                    productName: item.productVariant.product.name,
                    priceCents: Number(item.priceCents || 0),
                    taxRate: item.productVariant.taxRate ? {
                        id: item.productVariant.taxRate.id,
                        name: item.productVariant.taxRate.name,
                        percent: Number(item.productVariant.taxRate.percent || 0),
                    } : null,
                    attributes: item.productVariant.attributes,
                    quantity: item.quantity,
                    availableQuantity: item.productVariant.quantity,
                };
            }).filter(Boolean);

            if (newCart.length === 0) {
                setLoading(prev => ({ ...prev, sale: false }));
                return;
            }

            setCart(newCart);
            setSelectedCustomer(saleToResume.customerId || '');
            setDiscountCents(saleToResume.discountCents || 0);
            setPendingSaleId(saleToResume.orderId || saleToResume.invoiceNo);
            setResumedSaleDetails({
                orderType: saleToResume.orderType,
                adultsCount: saleToResume.adultsCount,
                kidsCount: saleToResume.kidsCount,
                salesSource: saleToResume.salesSource
            });

            setLookupModalOpen(false);
            setBillModalOpen(true);

        } catch (err) {
            console.error("Resuming sale failed:", err);
        } finally {
            setLoading(prev => ({ ...prev, sale: false }));
        }
    };

    const handleRemoveSale = async (saleId) => {
        if (!window.confirm('Are you sure you want to remove this parked sale?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/pos/sales/${saleId}`, { headers: { "Authorization": `Bearer ${token}` } });
            setLookupModalOpen(false);
        } catch (err) {
            console.error("Removing sale failed:", err);
        }
    };

    const handleSaveCustomer = async (customerData) => {
        setLoading(prev => ({ ...prev, customers: true }));
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/pos/customers`, customerData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newCustomer = response.data;
            setCustomers(prev => [...prev, newCustomer].sort((a, b) => a.name.localeCompare(b.name)));
            setSelectedCustomer(newCustomer.id);
            setCustomerModalOpen(false);
        } catch (err) {
            console.error("Failed to save customer:", err);
        } finally {
            setLoading(prev => ({ ...prev, customers: false }));
        }
    };

    const filteredProducts = useMemo(() =>
        products.filter(p =>
            p && p.name &&
            (showInactive || p.active) &&
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
            (selectedCategory === 'All' ||
                (selectedCategory === 'Uncategorized' && !p.categoryName) ||
                (p.categoryName === selectedCategory))
        )
        , [products, searchTerm, selectedCategory, showInactive]);

    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0), [cart]);
    const tax = useMemo(() => cart.reduce((sum, item) => {
        const itemTotal = item.priceCents * item.quantity;
        return sum + (item.taxRate ? Math.round(itemTotal * (item.taxRate.percent / 100)) : 0);
    }, 0), [cart]);
    const total = subtotal + tax - discountCents;

    const handleOpenBillModal = () => {
        if (cart.length === 0) {
            return;
        }
        if (!selectedStore) {
            return;
        }
        setBillModalOpen(true);
    };

    const handleDownloadBarcode = async (e, variantId, sku) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/pos/barcodes/qr/variant/${variantId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `qr-${sku}.png`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to download barcode", err);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-[#F7FAFF] font-sans overflow-hidden">
            {/* Left: Main Section (Header + Product Card) */}
            <div className="flex-1 flex flex-col min-w-0 overflow-visible relative z-30 p-3 gap-3">
                {/* Sales Header (Title, Breadcrumb, Date, Search, Filters, Customer) */}
                <SalesHeader
                    searchTerm={searchTerm} onSearchTermChange={setSearchTerm}
                    selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} categories={categories}
                    selectedStore={selectedStore} onStoreChange={setSelectedStore} stores={stores}
                    selectedCustomer={selectedCustomer} onCustomerChange={setSelectedCustomer} customers={customers}
                    onAddCustomer={() => setCustomerModalOpen(true)}
                    onAddProduct={() => setProductPanelOpen(true)}
                    showInactive={showInactive}
                    onToggleInactive={() => setShowInactive(!showInactive)}
                    onInsert={() => setInsertModalOpen(true)}
                    posTheme={posTheme}
                />

                {/* White Product Card */}
                <div
                    className="relative z-10 flex-1 min-h-0 overflow-hidden flex flex-col"
                    style={{ background: '#FFFFFF', border: '1px solid #E3EAF0', borderRadius: 12, padding: 12 }}
                >
                    {loading.products || loading.stores ? (
                        <div className="flex-grow flex justify-center items-center">
                            <Loader className="animate-spin h-8 w-8 text-[#00A9A8]" />
                        </div>
                    ) : (
                        <ProductGrid
                            products={filteredProducts}
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                            onAddToCart={handleAddToCart}
                            onDownloadBarcode={handleDownloadBarcode}
                            posTheme={posTheme}
                        />
                    )}
                </div>
            </div>

            {/* Right Cart Sidebar */}
            <div className="w-full md:w-96 lg:w-[420px] flex-shrink-0 flex flex-col h-full border-l border-[#E3EAF0] bg-white">
                <Cart
                    cart={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onClearCart={handleClearCart}
                    discountCents={discountCents}
                    onOpenLookup={() => setLookupModalOpen(true)} onOpenDiscountModal={() => setDiscountModalOpen(true)} onOpenBillModal={handleOpenBillModal}
                    onDiscountChange={setDiscountCents}
                    posTheme={posTheme}
                />
            </div>


            {isPaymentModalOpen && (
                <PaymentModal
                    subtotal={subtotal}
                    total={total}
                    tax={tax}
                    onProcessSale={handleProcessSale}
                    onClose={() => setPaymentModalOpen(false)}
                    loading={loading.sale}
                />
            )}

            {isBillModalOpen && (
                <BillModal
                    isOpen={isBillModalOpen}
                    onClose={() => { setBillModalOpen(false); setPendingSaleId(null); }}
                    cart={cart}
                    customer={customers.find(c => c.id === selectedCustomer)}
                    subtotal={subtotal}
                    initialOrderId={pendingSaleId}
                    tax={tax}
                    discountCents={discountCents}
                    total={total}
                    onProcessSale={handleProcessSale}
                    onOpenDiscountModal={() => setDiscountModalOpen(true)}
                    onParkSale={handleParkSale}
                    loading={loading.sale}
                    initialDetails={resumedSaleDetails}
                />
            )}

            {completedSale && (
                <SaleSuccessModal sale={completedSale} onClose={() => setCompletedSale(null)} />
            )}

            {isInsertModalOpen && (
                <InsertModal
                    isOpen={isInsertModalOpen}
                    onClose={() => setInsertModalOpen(false)}
                    onInsertManually={handleInsertManually}
                    posTheme={posTheme}
                />
            )}

            {isLookupModalOpen && (
                <LookupModal
                    isOpen={isLookupModalOpen}
                    onClose={() => setLookupModalOpen(false)}
                    onResumeSale={handleResumeSale}
                    onRemoveSale={handleRemoveSale}
                />
            )}

            {isDiscountModalOpen && (
                <DiscountModal
                    isOpen={isDiscountModalOpen}
                    onClose={() => setDiscountModalOpen(false)}
                    onApplyDiscount={setDiscountCents}
                    subtotal={subtotal}
                    posTheme={posTheme}
                />
            )}

            {isCustomerModalOpen && (
                <Modal isOpen={isCustomerModalOpen} onClose={() => setCustomerModalOpen(false)} title="Add New Customer">
                    <CustomerForm
                        onSave={handleSaveCustomer}
                        onCancel={() => setCustomerModalOpen(false)}
                        isSubmitting={loading.customers}
                    />
                </Modal>
            )}

            <ProductPanel
                isOpen={isProductPanelOpen}
                onClose={() => setProductPanelOpen(false)}
                onSave={handleSaveProduct}
                isSubmitting={isSubmittingProduct}
            />
        </div>
    );
}

export default SalesView;
