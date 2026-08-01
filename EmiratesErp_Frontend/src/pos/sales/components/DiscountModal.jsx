import React, { useState } from 'react';
import { X, Percent, CircleDollarSign } from 'lucide-react';

const TABS = ['Percentage', 'Fixed Amount'];

const DiscountModal = ({ isOpen, onClose, onApplyDiscount, subtotal, posTheme }) => {
    const [activeTab, setActiveTab] = useState(TABS[0]);
    const [percentage, setPercentage] = useState('');
    const [fixedAmount, setFixedAmount] = useState('');

    if (!isOpen) return null;

    const handleApply = () => {
        let discountInCents = 0;
        if (activeTab === 'Percentage' && percentage) {
            discountInCents = Math.round(subtotal * (parseFloat(percentage) / 100));
        } else if (activeTab === 'Fixed Amount' && fixedAmount) {
            discountInCents = Math.round(parseFloat(fixedAmount) * 100);
        }
        onApplyDiscount(discountInCents);
        onClose();
    };

    const handleRemove = () => {
        onApplyDiscount(0);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4 font-sans text-xs" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden border border-slate-100" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-base font-bold text-slate-900">Apply Cart Discount</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="p-1 bg-slate-100 rounded-full mx-5 mt-4 flex text-xs font-bold">
                    {TABS.map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)} 
                            className={`flex-1 py-1.5 rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === tab ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            {tab === 'Percentage' ? <Percent size={13} /> : <CircleDollarSign size={13} />}
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Body Input */}
                <div className="p-5 space-y-3">
                    {activeTab === 'Percentage' ? (
                        <div>
                            <label htmlFor="percentage" className="block font-semibold text-slate-700 mb-1">Discount Percentage (%)</label>
                            <input
                                id="percentage"
                                type="number"
                                min="0"
                                max="100"
                                value={percentage}
                                onChange={(e) => setPercentage(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border-0 rounded-xl font-bold text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                placeholder="e.g., 10"
                                autoFocus
                            />
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="fixedAmount" className="block font-semibold text-slate-700 mb-1">Discount Amount (AED)</label>
                            <input
                                id="fixedAmount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={fixedAmount}
                                onChange={(e) => setFixedAmount(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border-0 rounded-xl font-bold text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                placeholder="e.g., 25.00"
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2">
                    <button 
                        type="button" 
                        onClick={handleRemove} 
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                    >
                        Remove Discount
                    </button>
                    <button 
                        type="button" 
                        onClick={handleApply} 
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer"
                        style={{ backgroundColor: posTheme?.primary || '#0f172a' }}
                    >
                        Apply Discount
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiscountModal;