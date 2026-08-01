import React from 'react';
import { ShoppingCart, Download, Plus, Package, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, constructImageUrl, formatVariantAttributes } from '../utils';

const ProductCard = ({ product, variant, onAddToCart, onDownloadBarcode, posTheme }) => {
    const mainAction = () => onAddToCart(product, variant, variant.quantity);
    const isOutOfStock = variant.quantity <= 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="group relative rounded-2xl shadow-sm hover:shadow-md border border-slate-200/60 overflow-hidden h-full flex flex-col will-change-transform transition-all"
            style={{ backgroundColor: posTheme?.cardBg || '#ffffff' }}
        >
            {/* Quick Download QR Overlay */}
            <div className="absolute top-3 right-3 z-20 flex gap-1.5">
                <button
                    onClick={(e) => onDownloadBarcode(e, variant.id, variant.sku)}
                    className="p-2 bg-white/90 backdrop-blur-xs text-slate-400 hover:text-slate-900 hover:bg-white rounded-full shadow-xs border border-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    title="Download QR Code"
                >
                    <Download size={14} />
                </button>
            </div>

            {/* Main Click Area */}
            <button
                onClick={mainAction}
                className="flex-grow flex flex-col text-left focus:outline-none w-full"
                disabled={isOutOfStock}
            >
                {/* Product Image Container */}
                <div className="relative w-full aspect-[4/3] bg-slate-50/80 overflow-hidden p-4 sm:p-5 flex items-center justify-center border-b border-slate-100">
                    {variant.imageUrl && !isOutOfStock ? (
                        <motion.img
                            whileHover={{ scale: 1.06 }}
                            transition={{ duration: 0.3 }}
                            src={constructImageUrl(variant.imageUrl)}
                            alt={product.name}
                            className="w-full h-full object-contain relative z-10"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-300 gap-2 relative z-10">
                            <div className="p-3.5 bg-white rounded-full shadow-xs">
                                <ShoppingCart size={20} />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400">No Image</span>
                        </div>
                    )}

                    {/* Stock Badges */}
                    {isOutOfStock ? (
                        <div className="absolute inset-0 z-20 bg-slate-50/70 backdrop-blur-xs flex items-center justify-center">
                            <span className="bg-rose-100 text-rose-700 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                                Out of Stock
                            </span>
                        </div>
                    ) : (
                        <div className="absolute bottom-2.5 left-2.5 z-10">
                            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                                <Package size={10} />
                                {variant.quantity} left
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Details */}
                <div className="p-4 sm:p-5 flex flex-col flex-grow relative space-y-2">
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors" title={product.name}>
                            {product.name}
                        </h3>

                        {formatVariantAttributes(variant.attributes) && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <Tag size={11} className="text-slate-400" />
                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                    {formatVariantAttributes(variant.attributes)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Price & Add Button Footer */}
                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                            <span className="text-base font-black text-slate-900 tracking-tight">
                                {formatPrice(variant.priceCents)}
                            </span>
                            {variant.sku && (
                                <p className="text-[10px] text-slate-400 font-mono">
                                    #{variant.sku}
                                </p>
                            )}
                        </div>

                        {!isOutOfStock && (
                            <div 
                                className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-all shadow-xs group-hover:scale-110"
                                style={{ backgroundColor: posTheme?.primary || '#0f172a' }}
                            >
                                <Plus size={16} strokeWidth={2.5} />
                            </div>
                        )}
                    </div>
                </div>
            </button>
        </motion.div>
    );
};

const ProductGrid = ({ products, onAddToCart, onDownloadBarcode, posTheme }) => (
    <div className="flex-grow overflow-y-auto p-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 pb-16">
            <AnimatePresence>
                {products.flatMap(product => product.variants.map(variant => (
                    <ProductCard
                        key={variant.id}
                        product={product}
                        variant={variant}
                        onAddToCart={onAddToCart}
                        onDownloadBarcode={onDownloadBarcode}
                        posTheme={posTheme}
                    />
                )))}
            </AnimatePresence>
        </div>
    </div>
);

export default ProductGrid;