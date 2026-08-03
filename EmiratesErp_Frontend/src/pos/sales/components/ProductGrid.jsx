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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="group relative rounded-xl shadow-2xs hover:shadow-md border border-slate-200/60 overflow-hidden flex flex-col justify-between bg-white h-full"
            style={{ backgroundColor: posTheme?.cardBg || '#ffffff' }}
        >
            {/* Quick Download QR Overlay */}
            <div className="absolute top-1 right-1 z-20">
                <button
                    onClick={(e) => onDownloadBarcode(e, variant.id, variant.sku)}
                    className="p-0.5 bg-white/90 backdrop-blur-xs text-slate-400 hover:text-slate-900 rounded-full shadow-2xs border border-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                    title="Download QR Code"
                >
                    <Download size={10} />
                </button>
            </div>

            {/* Product Image Container */}
            <div
                onClick={mainAction}
                className="relative w-full h-18 sm:h-20 bg-slate-50/80 p-1 flex items-center justify-center border-b border-slate-100 cursor-pointer overflow-hidden"
            >
                {variant.imageUrl && !isOutOfStock ? (
                    <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        src={constructImageUrl(variant.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-contain relative z-10"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300 gap-0.5 relative z-10">
                        <ShoppingCart size={13} />
                        <span className="text-[8px] font-semibold text-slate-400">No Image</span>
                    </div>
                )}

                {/* Highlighted Price Badge ON Image (Top Left) */}
                <div className="absolute top-1 left-1 z-20">
                    <span className="text-[10px] font-black text-white bg-rose-600 px-1.5 py-0.5 rounded-md shadow-xs tracking-tight block border border-white/20">
                        {formatPrice(variant.priceCents)}
                    </span>
                </div>

                {/* Stock Badges (Bottom Left) */}
                {isOutOfStock ? (
                    <div className="absolute inset-0 z-30 bg-slate-50/85 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-rose-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                            Out of Stock
                        </span>
                    </div>
                ) : (
                    <div className="absolute bottom-1 left-1 z-20">
                        <span className="bg-slate-900/80 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full shadow-xs flex items-center gap-0.5">
                            <Package size={8} />
                            {variant.quantity}
                        </span>
                    </div>
                )}
            </div>

            {/* Content Details: Name on left, + icon button on right */}
            <div className="p-1.5 flex items-center justify-between gap-1 text-xs">
                <div className="min-w-0 flex-1">
                    <h3
                        className="font-bold text-slate-900 text-[10px] leading-tight truncate group-hover:text-blue-600 transition-colors cursor-pointer"
                        title={product.name}
                        onClick={mainAction}
                    >
                        {product.name}
                    </h3>
                    {formatVariantAttributes(variant.attributes) && (
                        <p className="text-[8px] text-slate-500 truncate -mt-0.5">
                            {formatVariantAttributes(variant.attributes)}
                        </p>
                    )}
                </div>

                {/* + Icon Button on the Right Side of Name */}
                {!isOutOfStock && (
                    <button
                        onClick={mainAction}
                        className="w-5 h-5 rounded-full text-white flex items-center justify-center flex-shrink-0 shadow-2xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        style={{ backgroundColor: posTheme?.primary || '#0f172a' }}
                        title="Add to Cart"
                    >
                        <Plus size={12} strokeWidth={3} />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

const ProductGrid = ({ products, onAddToCart, onDownloadBarcode, posTheme }) => (
    <div
        className="flex-grow overflow-y-auto p-1 rounded-xl"
        style={{ backgroundColor: posTheme?.accent || '#b9d9d5' }}
    >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 pb-4">
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