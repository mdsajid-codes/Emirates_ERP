import React from 'react';
import {
    Search, ScanLine, Tag, Store, User, UserPlus, Eye, EyeOff
} from 'lucide-react';

const SalesHeader = ({
    searchTerm, onSearchTermChange,
    barcode, onBarcodeChange, onBarcodeScan,
    selectedCategory, onCategoryChange, categories,
    selectedStore, onStoreChange, stores,
    selectedCustomer, onCustomerChange, customers,
    onAddCustomer, onAddProduct,
    showInactive, onToggleInactive,
    posTheme
}) => {
    return (
        <div className="flex items-center gap-2 flex-wrap font-sans">
            {/* Search products bar */}
            <div
                className="flex items-center gap-2 px-3 w-[220px] shrink-0"
                style={{ height: 36, background: '#FFFFFF', border: '1px solid #D7E1E9', borderRadius: 8 }}
            >
                <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#667085' }} />
                <input
                    type="text"
                    placeholder="Search products by name or SKU..."
                    value={searchTerm}
                    onChange={e => onSearchTermChange(e.target.value)}
                    className="w-full text-[10px] leading-[15px] outline-none placeholder:text-[#667085] text-[#18233B] bg-transparent"
                />
            </div>

            {/* Scan Barcode chip */}
            <button
                className="flex items-center gap-1.5 px-3 font-semibold transition-colors shrink-0"
                style={{
                    height: 36, borderRadius: 8,
                    background: '#FFFFFF', border: '1px solid #E3EAF0', color: '#172033',
                    fontSize: 10
                }}
                title="Scan Barcode"
            >
                <ScanLine className="w-3.5 h-3.5" style={{ color: '#00719B' }} />
                <span>Scan barcode</span>
            </button>

            {/* All Categories chip */}
            <button
                className="flex items-center gap-1.5 px-3 font-semibold transition-colors shrink-0"
                style={{
                    height: 36, borderRadius: 8,
                    background: '#E9F8FF', border: '1px solid #00719B', color: '#00719B',
                    fontSize: 10
                }}
            >
                <Tag className="w-3.5 h-3.5" style={{ color: '#00719B' }} />
                <span>All Categories</span>
            </button>

            {/* Main Store chip */}
            <button
                className="flex items-center gap-1.5 px-3 font-semibold transition-colors shrink-0"
                style={{
                    height: 36, borderRadius: 8,
                    background: '#FFFFFF', border: '1px solid #E3EAF0', color: '#172033',
                    fontSize: 10
                }}
            >
                <Store className="w-3.5 h-3.5" style={{ color: '#00719B' }} />
                <span>Main Store</span>
            </button>

            {/* Active Only chip */}
            <button
                onClick={onToggleInactive}
                className="flex items-center gap-1.5 px-3 font-semibold transition-colors shrink-0"
                style={{
                    height: 36, borderRadius: 8,
                    background: showInactive ? '#FFF8E7' : '#FFFFFF',
                    border: showInactive ? '1px solid #FFA713' : '1px solid #E3EAF0',
                    color: showInactive ? '#B45309' : '#172033',
                    fontSize: 10
                }}
            >
                {showInactive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" style={{ color: '#667085' }} />}
                <span>{showInactive ? 'Inactive' : 'Active Only'}</span>
            </button>

            {/* Customer selector + Add Customer in the same line */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
                <div
                    className="flex items-center gap-2 px-3"
                    style={{ height: 36, background: '#FFFFFF', border: '1px solid #E3EAF0', borderRadius: 8 }}
                >
                    <User className="w-3.5 h-3.5" style={{ color: '#00719B' }} />
                    <select
                        value={selectedCustomer}
                        onChange={e => onCustomerChange(e.target.value)}
                        className="text-[10px] font-semibold outline-none cursor-pointer bg-transparent appearance-none"
                        style={{ color: '#172033' }}
                    >
                        <option value="">Walk-in Customer</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={onAddCustomer}
                    title="Add New Customer"
                    className="flex items-center justify-center rounded-full hover:opacity-80 transition-all cursor-pointer flex-shrink-0"
                    style={{ width: 28, height: 28, background: '#00A9A8' }}
                >
                    <UserPlus className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
};

export default SalesHeader;