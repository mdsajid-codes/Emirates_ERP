import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { formatPrice, formatVariantAttributes } from '../utils';

const Cart = ({ cart, onUpdateQuantity, onRemoveItem, onClearCart, onDiscountChange, discountCents, onOpenLookup, onOpenDiscountModal, onOpenBillModal, posTheme }) => {
    const subtotal = cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
    const tax = cart.reduce((sum, item) => {
        const itemTotal = item.priceCents * item.quantity;
        return sum + (item.taxRate ? Math.round(itemTotal * (item.taxRate.percent / 100)) : 0);
    }, 0);

    return (
        <div className="bg-white h-full flex flex-col font-sans rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingCart size={18} /> Current Cart
                </h2>
                <span
                    className="text-[10px] font-black text-white px-2.5 py-0.5 rounded-full shadow-2xs"
                    style={{ backgroundColor: posTheme?.primary || '#0f172a' }}
                >
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                </span>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-3 space-y-2 text-xs">
                {cart.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 space-y-2">
                        <ShoppingCart size={32} className="mx-auto opacity-30" />
                        <p className="text-xs font-semibold text-slate-600">Cart is empty</p>
                        <p className="text-[11px] text-slate-400">Click products to start adding items.</p>
                    </div>
                ) : (
                    cart.map(item => {
                        return (
                            <div key={item.productVariantId} className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center gap-2.5 justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-900 text-xs leading-tight truncate">{item.productName}</p>
                                    {item.attributes && Object.keys(item.attributes).length > 0 && (
                                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{formatVariantAttributes(item.attributes)}</p>
                                    )}
                                    <div className="flex items-baseline gap-1.5 mt-1 text-[11px]">
                                        <span className="font-extrabold text-slate-900">{formatPrice(item.priceCents * item.quantity)}</span>
                                        <span className="text-[10px] text-slate-400">({formatPrice(item.priceCents)} ea)</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                                    <button onClick={() => onUpdateQuantity(item.productVariantId, -1)} className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                                        <Minus size={12} />
                                    </button>
                                    <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.productVariantId, 1)} className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                                        <Plus size={12} />
                                    </button>
                                </div>

                                <button onClick={() => onRemoveItem(item.productVariantId)} className="p-1 text-slate-400 hover:text-rose-600 transition-colors">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Summary Breakdown & Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                    <span>Tax (Est.)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                {discountCents > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-200/60">
                        <span>Discount</span>
                        <span>-{formatPrice(discountCents)}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                    <button onClick={onOpenLookup} className="py-2 px-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 shadow-2xs transition-all cursor-pointer">
                        Lookup
                    </button>
                    <button onClick={onOpenDiscountModal} className="py-2 px-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 shadow-2xs transition-all cursor-pointer">
                        Discount
                    </button>
                    <button
                        onClick={onOpenBillModal}
                        disabled={cart.length === 0}
                        className="col-span-2 py-2.5 px-4 text-white rounded-xl font-bold hover:opacity-90 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        style={{ backgroundColor: posTheme?.primary || '#0f172a' }}
                    >
                        Proceed to Bill
                    </button>
                    {cart.length > 0 && (
                        <button onClick={onClearCart} className="col-span-2 py-1.5 text-xs text-rose-600 hover:text-rose-800 font-semibold text-center transition-colors cursor-pointer">
                            Clear Cart
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cart;