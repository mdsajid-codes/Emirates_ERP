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
    const mainAction = () => onAddToCart(product, variant, variant.quantity);
    const isOutOfStock = variant.quantity <= 0;

    // Pick icon color or style
    const iconColors = ['text-[#007F8F]', 'text-[#172033]', 'text-[#D92D20]', 'text-[#00719B]'];
    const colorIndex = (variant.id || 0) % 4;
    const iconColorClass = iconColors[colorIndex];

    return (
        <div
            className="group relative flex flex-col justify-between p-[6px] bg-white border border-[#E3EAF0] rounded-[8px] hover:border-[#00A9A8] transition-all"
            style={{ width: '100%', height: '104px' }}
        >
            {/* Title / Name */}
            <div className="flex items-start justify-between gap-1">
                <span className="text-[8px] font-semibold leading-[12px] text-[#172033] truncate flex-1" title={product.name}>
                    {product.name}
                </span>
                <button
                    onClick={(e) => onDownloadBarcode(e, variant.id, variant.sku)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition-opacity"
                    title="Download QR"
                >
                    <Download size={10} />
                </button>
            </div>

            {/* Middle Image / Icon Display Box */}
            <div
                onClick={mainAction}
                className="w-full h-[48px] bg-[#F3F6F9] rounded-[6px] flex items-center justify-center cursor-pointer overflow-hidden my-1 relative"
            >
                {variant.imageUrl && !isOutOfStock ? (
                    <img
                        src={constructImageUrl(variant.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-contain p-1"
                    />
                ) : (
                    <div className="flex items-center justify-center">
                        <Shirt className={`w-[30px] h-[30px] ${iconColorClass}`} strokeWidth={1.5} />
                    </div>
                )}

                {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <span className="text-[7px] font-bold text-[#D92D20] uppercase">Out of Stock</span>
                    </div>
                )}
            </div>

            {/* Bottom Row: Price & + Button */}
            <div className="flex items-center justify-between mt-auto">
                <span className="text-[8px] font-bold leading-[12px] text-[#172033]">
                    {formatPrice(variant.priceCents)}
                </span>
                {!isOutOfStock && (
                    <button
                        onClick={mainAction}
                        className="w-[16px] h-[16px] rounded-full border border-[#00719B] flex items-center justify-center text-[#00719B] hover:bg-[#00719B] hover:text-white transition-colors cursor-pointer"
                        title="Add to Cart"
                    >
                        <Plus className="w-[10px] h-[10px]" strokeWidth={2} />
                    </button>
                )}
            </div>
        </div>
    );
};

const ProductGrid = ({ products, categories = [], selectedCategory = 'All', onSelectCategory, onAddToCart, onDownloadBarcode }) => {
    // Combine 'All' with real categories fetched from database, plus 'Uncategorized' if applicable
    const categoryTabs = useMemo(() => {
        const list = [{ id: 'All', name: 'All' }];
        (categories || []).forEach(cat => {
            if (cat && cat.name) {
                list.push({ id: cat.name, name: cat.name });
            }
        });
        return list;
    }, [categories]);

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
                            className={`text-[9px] font-semibold leading-[14px] pb-1 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                                isActive
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
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {products.flatMap(product =>
                        (product.variants || []).map(variant => (
                            <ProductCard
                                key={variant.id}
                                product={product}
                                variant={variant}
                                onAddToCart={onAddToCart}
                                onDownloadBarcode={onDownloadBarcode}
                            />
                        ))
                    )}
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