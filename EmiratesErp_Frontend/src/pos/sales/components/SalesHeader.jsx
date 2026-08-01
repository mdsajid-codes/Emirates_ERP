import React from 'react';
import { Search, ScanLine, Tag, Store, User, UserPlus, Eye, EyeOff } from 'lucide-react';

const SalesHeader = ({
    searchTerm, onSearchTermChange,
    barcode, onBarcodeChange, onBarcodeScan,
    selectedCategory, onCategoryChange, categories,
    selectedStore, onStoreChange, stores,
    selectedCustomer, onCustomerChange, customers,
    onAddCustomer, onAddProduct,
    showInactive, onToggleInactive
}) => {
    return (
        <div className="mb-3 flex flex-wrap gap-2.5 items-center font-sans text-xs">
            {/* Search Input */}
            <div className="relative flex-grow min-w-[180px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search products by name or SKU..."
                    value={searchTerm}
                    onChange={e => onSearchTermChange(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-white rounded-full text-xs border-0 shadow-xs outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 transition-all"
                />
            </div>

            {/* Barcode Scanner Input */}
            <div className="relative">
                <ScanLine className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Scan barcode..."
                    value={barcode}
                    onChange={e => onBarcodeChange(e.target.value)}
                    onKeyDown={onBarcodeScan}
                    className="w-40 sm:w-44 pl-9 pr-3 py-2 bg-white rounded-full text-xs border-0 shadow-xs outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 transition-all font-mono"
                />
            </div>

            {/* Category Dropdown */}
            <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <select
                    value={selectedCategory}
                    onChange={e => onCategoryChange(e.target.value)}
                    className="pl-9 pr-7 py-2 bg-white rounded-full text-xs font-semibold text-slate-700 border-0 shadow-xs outline-none cursor-pointer focus:ring-2 focus:ring-slate-900 appearance-none"
                >
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    <option value="Uncategorized">Uncategorized</option>
                </select>
            </div>

            {/* Store Dropdown */}
            <div className="relative">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <select
                    value={selectedStore}
                    onChange={e => onStoreChange(e.target.value)}
                    className="pl-9 pr-7 py-2 bg-white rounded-full text-xs font-semibold text-slate-700 border-0 shadow-xs outline-none cursor-pointer focus:ring-2 focus:ring-slate-900 appearance-none"
                    required
                >
                    <option value="" disabled>Select Store</option>
                    {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            {/* Inactive Toggle */}
            <button
                onClick={onToggleInactive}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-semibold shadow-xs border transition-all ${
                    showInactive
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title={showInactive ? "Hide Inactive Products" : "Show Inactive Products"}
            >
                {showInactive ? <Eye size={14} /> : <EyeOff size={14} />}
                <span className="hidden xl:inline">{showInactive ? 'Inactive' : 'Active Only'}</span>
            </button>

            {/* Customer Dropdown + Quick Add */}
            <div className="relative flex items-center gap-1.5">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <select
                    value={selectedCustomer}
                    onChange={e => onCustomerChange(e.target.value)}
                    className="pl-9 pr-7 py-2 bg-white rounded-full text-xs font-semibold text-slate-700 border-0 shadow-xs outline-none cursor-pointer focus:ring-2 focus:ring-slate-900 appearance-none w-44"
                >
                    <option value="">Walk-in Customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button
                    onClick={onAddCustomer}
                    className="p-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors"
                    title="Add New Customer"
                >
                    <UserPlus size={14} />
                </button>
            </div>
        </div>
    );
};

export default SalesHeader;