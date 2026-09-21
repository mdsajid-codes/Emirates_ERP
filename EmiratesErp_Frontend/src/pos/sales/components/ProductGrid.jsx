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
            className={`group relative flex flex-col justify-end overflow-hidden select-none bg-white rounded-lg transition-all hover:scale-[1.02] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1)] w-full h-[126px] ${
                isOutOfStock ? 'cursor-not-allowed border-2 border-red-500' : 'cursor-pointer'
            }`}
        >
            {/* Top Red Bar for Out of Stock */}
            {isOutOfStock && (
                <div className="absolute top-0 left-0 right-0 h-[4px] bg-red-600 z-30" />
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
                        <Shirt className="w-8 h-8 opacity-40 text-white" strokeWidth={1.5} />
                    </div>
                )}
            </div>

            {/* Top Badge: Red Badge when Out of Stock, White square otherwise */}
            {isOutOfStock ? (
                <div className="absolute top-1.5 right-1.5 z-30 px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-bold uppercase rounded shadow-md flex items-center gap-1 border border-red-400">
                    <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                    Out of Stock
                </div>
            ) : (
                <div className="absolute top-1.5 right-1.5 z-10 w-4 h-4 bg-white/95 backdrop-blur-xs rounded-md shadow-xs pointer-events-none flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400/50" />
                </div>
            )}

            {/* Out of Stock Subtle Overlay */}
            {isOutOfStock && (
                <div className="absolute inset-0 z-20 bg-black/35 backdrop-blur-[0.5px] pointer-events-none" />
            )}

            {/* Bottom Dark Blue Gradient Overlay Bar */}
            <div className="relative z-10 w-full p-2 bg-gradient-to-t from-[#102A5C] via-[#102A5C]/85 to-transparent flex items-end justify-between min-h-[46px]">
                {/* Left Text: Product Name & AED Price */}
                <div className="flex flex-col justify-end text-white max-w-[calc(100%-28px)] pr-1">
                    <span className="text-[10.5px] font-bold leading-[14px] text-white truncate drop-shadow-xs" title={product.name}>
                        {product.name}
                    </span>
                    <span className="text-[10.5px] font-bold leading-[14px] text-white/90 font-mono tracking-tight drop-shadow-xs">
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
                        className="w-6 h-6 rounded-full bg-[#0078BC] hover:bg-[#006096] text-white flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95 cursor-pointer"
                        title="Add to Cart"
                    >
                        <Plus className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-2.5">
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