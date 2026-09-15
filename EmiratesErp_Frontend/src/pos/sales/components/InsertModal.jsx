import React from 'react';
import { X, PackagePlus, PenLine } from 'lucide-react';

const InsertModal = ({ isOpen, onClose, onInsertManually, posTheme }) => {
    if (!isOpen) return null;

    const primary = posTheme?.primary || '#0078BC';
    const sidebarBg = posTheme?.sidebarBg || '#013E5B';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(1, 42, 74, 0.55)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <div
                className="relative flex flex-col rounded-2xl shadow-2xl overflow-hidden"
                style={{
                    width: 460,
                    background: 'linear-gradient(145deg, #FFFFFF 0%, #F0F6FF 100%)',
                    border: '1.5px solid #DCE6F5',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Top accent bar */}
                <div
                    className="w-full h-1.5"
                    style={{ background: `linear-gradient(90deg, ${sidebarBg}, ${primary})` }}
                />

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-2">
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: `${primary}18` }}
                        >
                            <PackagePlus size={18} style={{ color: primary }} strokeWidth={2} />
                        </div>
                        <div>
                            <h2
                                className="text-[17px] font-bold leading-tight"
                                style={{ color: sidebarBg }}
                            >
                                Insert Items
                            </h2>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-none">
                                Choose how you'd like to add items to the cart
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Divider */}
                <div className="mx-6 mt-3 border-t border-[#E8EEF8]" />

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-3">
                    {/* Insert Manually Option */}
                    <button
                        onClick={onInsertManually}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all group cursor-pointer hover:shadow-md text-left"
                        style={{
                            background: `linear-gradient(135deg, ${primary}0A, ${primary}18)`,
                            borderColor: primary,
                        }}
                    >
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                            style={{ background: primary }}
                        >
                            <PackagePlus size={20} className="text-white" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p
                                className="text-[14px] font-bold leading-tight"
                                style={{ color: sidebarBg }}
                            >
                                Insert Manually
                            </p>
                            <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
                                Instantly load all <span className="font-semibold text-slate-700">50 demo items</span> into the cart with real Dubai-market prices in AED
                            </p>
                        </div>
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: primary }}
                        >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </button>

                    {/* Continue Manually Option */}
                    <button
                        onClick={onClose}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[#DCE6F5] bg-white hover:bg-[#F7FAFF] hover:border-[#B8CDE8] transition-all group cursor-pointer text-left"
                    >
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100 group-hover:bg-slate-200 transition-colors">
                            <PenLine size={20} className="text-slate-600" strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold text-slate-800 leading-tight">
                                Continue Manually
                            </p>
                            <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
                                Close this modal and add products yourself by browsing the catalogue
                            </p>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </button>
                </div>

                {/* Footer */}
                <div className="px-6 pb-5">
                    <p className="text-[10.5px] text-slate-400 text-center leading-snug">
                        Demo data includes Traditional, Men, Women, Kids, Footwear, Sports & Accessories
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InsertModal;
