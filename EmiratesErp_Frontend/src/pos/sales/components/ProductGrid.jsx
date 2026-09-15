import React, { useState, useMemo } from 'react';
import { Plus, Download, Shirt, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, constructImageUrl, formatVariantAttributes } from '../utils';

const CATEGORIES_TABS = [
    { id: 'All', label: 'All' },
    { id: 'Men', label: 'Men' },
    { id: 'Women', label: 'Women' },
    { id: 'Traditional', label: 'Traditional' },
    { id: 'Kids', label: 'Kids' },
    { id: 'Winter', label: 'Winter' },
    { id: 'Sports', label: 'Sports' },
    { id: 'Footwear', label: 'Footwear' },
    { id: 'Accessories', label: 'Accessories' },
    { id: 'Others', label: 'Others' },
    { id: 'Special Price', label: 'Special Price' },
];

const ProductCard = ({ product, variant, onAddToCart, onDownloadBarcode }) => {
    // Only mark out of stock if quantity is explicitly provided and <= 0
    const isOutOfStock = variant.quantity !== undefined && variant.quantity !== null ? variant.quantity <= 0 : false;
    const mainAction = () => {
        if (!isOutOfStock) {
            onAddToCart(product, variant, variant.quantity);
        }
    };

    return (
        <div
            onClick={mainAction}
            className={`group relative flex flex-col justify-end overflow-hidden select-none bg-white rounded-[6.09px] transition-all hover:scale-[1.02] shadow-[0px_6.09px_9.14px_-1.52px_rgba(0,0,0,0.1),0px_3.05px_6.09px_-3.05px_rgba(0,0,0,0.1)] ${
                isOutOfStock ? 'cursor-not-allowed border-2 border-red-500' : 'cursor-pointer'
            }`}
            style={{ width: '210px', height: '150px' }}
        >
            {/* Top Red Bar for Out of Stock */}
            {isOutOfStock && (
                <div className="absolute top-0 left-0 right-0 h-[5px] bg-red-600 z-30" />
            )}

            {/* Background Product Image Container */}
            <div className="absolute inset-0 w-full h-full bg-[#E5E9EE]">
                {variant.imageUrl ? (
                    <img
                        src={constructImageUrl(variant.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-slate-400">
                        <Shirt className="w-[42px] h-[42px] opacity-40 text-white" strokeWidth={1.5} />
                    </div>
                )}
            </div>

            {/* Top Badge: Red Badge when Out of Stock, White square otherwise */}
            {isOutOfStock ? (
                <div className="absolute top-[8px] right-[8px] z-30 px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold uppercase rounded-[4px] shadow-md flex items-center gap-1 border border-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Out of Stock
                </div>
            ) : (
                <div className="absolute top-[6.09px] right-[6.09px] z-10 w-[18.28px] h-[18.28px] bg-white rounded-[6.09px] shadow-xs pointer-events-none" />
            )}

            {/* Out of Stock Subtle Overlay */}
            {isOutOfStock && (
                <div className="absolute inset-0 z-20 bg-black/35 backdrop-blur-[0.5px] pointer-events-none" />
            )}

            {/* Bottom Dark Blue Gradient Overlay Bar */}
            <div className="relative z-10 w-full p-[9.14px] bg-gradient-to-t from-[#102A5C] via-[#102A5C]/80 to-transparent flex items-end justify-between min-h-[55.28px]">
                {/* Left Text: Product Name & AED Price */}
                <div className="flex flex-col justify-end text-white max-w-[140px] pr-1">
                    <span className="text-[12.18px] font-bold leading-[18px] text-white truncate drop-shadow-xs" title={product.name}>
                        {product.name}
                    </span>
                    <span className="text-[12.18px] font-bold leading-[18px] text-white/90 font-mono tracking-tight drop-shadow-xs">
                        {formatPrice(variant.priceCents)}
                    </span>
                </div>

                {/* Right Circular Plus Button */}
                {!isOutOfStock && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            mainAction();
                        }}
                        className="w-[30.47px] h-[30.47px] rounded-full bg-[#0078BC] hover:bg-[#006096] text-white flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95 cursor-pointer"
                        title="Add to Cart"
                    >
                        <Plus className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
                    </button>
                )}
            </div>
        </div>
    );
};

const ProductGrid = ({ products, categories = [], selectedCategory = 'All', onSelectCategory, onAddToCart, onDownloadBarcode }) => {
    // Combine 'All' with real categories fetched from database
    const categoryTabs = useMemo(() => {
        const list = [{ id: 'All', name: 'All' }];
        (categories || []).forEach(cat => {
            if (cat && cat.name) {
                list.push({ id: cat.name, name: cat.name });
            }
        });
        return list;
    }, [categories]);

    // Flatten product variants
    const productVariantsList = useMemo(() => {
        return (products || []).flatMap(product =>
            (product.variants || []).map(variant => {
                const isOutOfStock = variant.quantity !== undefined && variant.quantity !== null ? variant.quantity <= 0 : false;
                return {
                    product,
                    variant,
                    isOutOfStock
                };
            })
        );
    }, [products]);

    const activeCategory = selectedCategory || 'All';

    const handleTabClick = (catName) => {
        if (onSelectCategory) {
            onSelectCategory(catName);
        }
    };

    return (
        <div className="flex flex-col h-full font-sans">
            {/* Header: Categories Title & View All */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-[12px] font-semibold leading-[16px] text-[#172033]">
                    Categories
                </h2>
                <button
                    onClick={() => handleTabClick('All')}
                    className="text-[10px] font-semibold leading-[15px] text-[#00719B] hover:underline cursor-pointer"
                >
                    View All
                </button>
            </div>

            {/* Tabs Row (Real Category Data) */}
            <div className="flex items-center gap-4 border-b border-[#E3EAF0] pb-1 mb-3 overflow-x-auto no-scrollbar shrink-0">
                {categoryTabs.map(tab => {
                    const isActive = activeCategory.toLowerCase() === tab.id.toLowerCase();
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`text-[9px] font-semibold leading-[14px] pb-1 border-b-2 transition-all whitespace-nowrap cursor-pointer ${isActive
                                    ? 'border-[#087E8B] text-[#087E8B]'
                                    : 'border-transparent text-[#172033] opacity-75 hover:opacity-100'
                                }`}
                        >
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            {/* Grid of Product Cards */}
            <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
                <div className="flex flex-wrap gap-3.5">
                    {productVariantsList.map(({ product, variant }) => (
                        <ProductCard
                            key={variant.id}
                            product={product}
                            variant={variant}
                            onAddToCart={onAddToCart}
                            onDownloadBarcode={onDownloadBarcode}
                        />
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-[#617198]">
                        <p className="text-xs font-semibold">No products found for this selection.</p>
                    </div>
                )}
            </div>

            {/* Bottom Pagination Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E3EAF0] text-[9px] text-[#617198] shrink-0 mt-2">
                <span>Showing 1 to {products.length} items</span>
                <div className="flex items-center gap-1.5 font-medium">
                    <button className="px-1 text-[#617198] hover:text-[#172033]">&lt;</button>
                    <button className="w-5 h-5 rounded bg-[#00719B] text-white flex items-center justify-center font-bold">1</button>
                    <button className="w-5 h-5 rounded text-[#172033] hover:bg-slate-100 flex items-center justify-center">2</button>
                    <button className="w-5 h-5 rounded text-[#172033] hover:bg-slate-100 flex items-center justify-center">3</button>
                    <span>...</span>
                    <button className="px-1 text-[#617198] hover:text-[#172033]">&gt;</button>
                </div>
            </div>
        </div>
    );
};

export default ProductGrid;