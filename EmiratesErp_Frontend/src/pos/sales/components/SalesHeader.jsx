import React from 'react';
import {
    Search, PackagePlus, Tag, Store, User, UserPlus, Eye, EyeOff, ChevronDown, Check
} from 'lucide-react';

const SalesHeader = ({
    searchTerm, onSearchTermChange,
    selectedCategory, onCategoryChange, categories,
    selectedStore, onStoreChange, stores,
    selectedCustomer, onCustomerChange, customers,
    onAddCustomer, onAddProduct,
    showInactive, onToggleInactive,
    onInsert,
    posTheme
}) => {
    const primaryBg = posTheme?.sidebarBg || '#013E5B';

    return (
        <div className="relative z-50 flex items-center gap-3 overflow-visible py-1 shrink-0 font-sans min-w-0">
            {/* Search products bar - Figma styled */}
            <div
                className="flex items-center gap-2 px-4 h-[48.9px] min-w-[240px] flex-1 max-w-[340px] shrink-0 bg-white border-[1.5px] border-[#DCE6F5] rounded-[6px]"
            >
                <Search className="w-4 h-4 flex-shrink-0 text-[#013E5B]" />
                <input
                    type="text"
                    placeholder="Search products by name or SKU..."
                    value={searchTerm}
                    onChange={e => onSearchTermChange(e.target.value)}
                    className="w-full text-[14px] leading-[23px] font-[500] outline-none placeholder:text-slate-400 text-[#102A5C] bg-transparent"
                />
            </div>

            {/* Insert Button - Figma styled */}
            <button
                onClick={onInsert}
                className="flex items-center justify-center gap-2 px-5 h-[48.9px] rounded-[6px] text-[15.23px] font-[500] bg-white border-[1.5px] border-[#DCE6F5] text-[#102A5C] hover:border-[#00A9A8] hover:text-[#00A9A8] transition-all shrink-0 cursor-pointer"
                title="Insert Items"
            >
                <PackagePlus className="w-4 h-4 text-[#013E5B]" />
                <span>Insert</span>
            </button>

            {/* All Categories chip - Figma styled */}
            <button
                onClick={() => onCategoryChange && onCategoryChange('All')}
                className="flex items-center justify-center gap-2 px-5 h-[48.9px] rounded-[6px] text-[15.23px] font-[600] transition-all shrink-0 cursor-pointer"
                style={{
                    backgroundColor: selectedCategory === 'All' ? primaryBg : '#FFFFFF',
                    color: selectedCategory === 'All' ? '#FFFFFF' : '#102A5C',
                    border: selectedCategory === 'All' ? 'none' : '1.5px solid #DCE6F5',
                }}
            >
                <Tag className="w-4 h-4" style={{ color: selectedCategory === 'All' ? '#FFFFFF' : '#013E5B' }} />
                <span>All Categories</span>
            </button>

            {/* Store Selection Dropdown */}
            <StoreDropdown
                selectedStore={selectedStore}
                onStoreChange={onStoreChange}
                stores={stores}
            />

            {/* Active Only chip - Figma styled */}
            <button
                onClick={onToggleInactive}
                className="flex items-center justify-center gap-2 px-5 h-[48.9px] rounded-[6px] text-[15.23px] font-[500] transition-all shrink-0 cursor-pointer"
                style={{
                    background: showInactive ? '#FFF8E7' : '#FFFFFF',
                    border: showInactive ? '1.5px solid #FFA713' : '1.5px solid #DCE6F5',
                    color: showInactive ? '#B45309' : '#102A5C',
                }}
            >
                {showInactive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-[#013E5B]" />}
                <span>{showInactive ? 'Inactive' : 'Active Only'}</span>
            </button>

            {/* Customer Selector Chip with Search Input - Figma styled */}
            <CustomerSearchDropdown
                selectedCustomer={selectedCustomer}
                onCustomerChange={onCustomerChange}
                customers={customers}
                onAddCustomer={onAddCustomer}
            />
        </div>
    );
};

/* --- Custom Searchable Customer Dropdown Component --- */
const CustomerSearchDropdown = ({ selectedCustomer, onCustomerChange, customers, onAddCustomer }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const dropdownRef = React.useRef(null);

    const selectedCustObj = React.useMemo(() => {
        return customers.find(c => String(c.id) === String(selectedCustomer));
    }, [customers, selectedCustomer]);

    const filteredCustomers = React.useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return customers;
        return customers.filter(c =>
            (c.name || '').toLowerCase().includes(query) ||
            (c.phone || '').toLowerCase().includes(query) ||
            (c.email || '').toLowerCase().includes(query)
        );
    }, [customers, searchQuery]);

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative flex items-center gap-2 shrink-0 ml-auto z-40" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-2.5 px-4 h-[48.9px] min-w-[200px] bg-white border-[1.5px] border-[#DCE6F5] hover:border-[#00A9A8] rounded-[6px] cursor-pointer transition-all shadow-xs select-none"
            >
                <div className="flex items-center gap-2 truncate">
                    <User className="w-4 h-4 text-[#013E5B] shrink-0" />
                    <span className="text-[14px] font-[500] text-[#102A5C] truncate">
                        {selectedCustObj ? selectedCustObj.name : 'Select Customer'}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#013E5B] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <button
                onClick={onAddCustomer}
                title="Add New Customer"
                className="flex items-center justify-center rounded-full hover:opacity-80 transition-all cursor-pointer flex-shrink-0 shadow-xs"
                style={{ width: 36, height: 36, background: '#00A9A8' }}
            >
                <UserPlus className="w-4 h-4 text-white" strokeWidth={2} />
            </button>

            {/* Custom Dropdown Menu with Search Field */}
            {isOpen && (
                <div className="absolute top-[54px] right-0 w-[280px] bg-white border border-[#DCE6F5] rounded-[8px] shadow-2xl z-50 overflow-hidden flex flex-col font-sans">
                    {/* Search Field Input */}
                    <div className="p-2 border-b border-[#E2E8F0] bg-slate-50/50 flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                        <input
                            type="text"
                            placeholder="Search customer name or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            className="w-full text-xs font-medium text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
                        />
                    </div>

                    {/* Customer List Container */}
                    <div className="max-h-[240px] overflow-y-auto divide-y divide-slate-100">
                        {/* Walk-in Customer Option */}
                        <div
                            onClick={() => {
                                onCustomerChange('');
                                setIsOpen(false);
                                setSearchQuery('');
                            }}
                            className={`px-3 py-2.5 text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between ${
                                !selectedCustomer ? 'bg-[#00A9A8]/10 text-[#00A9A8]' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <span>Walk-in Customer</span>
                            {!selectedCustomer && <Check className="w-3.5 h-3.5 text-[#00A9A8]" />}
                        </div>

                        {/* Filtered Customer Options */}
                        {filteredCustomers.map(c => {
                            const isSelected = String(c.id) === String(selectedCustomer);
                            return (
                                <div
                                    key={c.id}
                                    onClick={() => {
                                        onCustomerChange(c.id);
                                        setIsOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className={`px-3 py-2 text-xs cursor-pointer transition-colors flex flex-col gap-0.5 ${
                                        isSelected ? 'bg-[#00A9A8]/10 text-[#00A9A8] font-bold' : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold truncate">{c.name}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-[#00A9A8] shrink-0" />}
                                    </div>
                                    {c.phone && <span className="text-[10px] text-slate-400 font-mono">{c.phone}</span>}
                                </div>
                            );
                        })}

                        {filteredCustomers.length === 0 && (
                            <div className="p-3 text-center text-xs text-slate-400">
                                No customer found matching &quot;{searchQuery}&quot;
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/* --- Store Selector Dropdown Component --- */
const StoreDropdown = ({ selectedStore, onStoreChange, stores }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    const selectedStoreObj = React.useMemo(() => {
        return stores?.find(s => String(s.id) === String(selectedStore));
    }, [stores, selectedStore]);

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const storeDisplayName = selectedStoreObj ? selectedStoreObj.name : (stores && stores.length > 0 ? stores[0].name : 'Main Store');

    return (
        <div className="relative shrink-0 z-40" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center gap-2 px-5 h-[48.9px] rounded-[6px] text-[15.23px] font-[500] bg-white border-[1.5px] border-[#DCE6F5] text-[#102A5C] hover:border-[#00A9A8] transition-all shrink-0 cursor-pointer select-none"
            >
                <Store className="w-4 h-4 text-[#013E5B]" />
                <span>{storeDisplayName}</span>
                <ChevronDown className={`w-4 h-4 text-[#013E5B] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-[54px] left-0 min-w-[240px] w-max max-w-[320px] bg-white border border-[#DCE6F5] rounded-[8px] shadow-2xl z-50 overflow-hidden flex flex-col font-sans">
                    <div className="px-3 py-2 border-b border-[#E2E8F0] bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Select Store
                    </div>
                    <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-100">
                        {stores && stores.length > 0 ? (
                            stores.map(s => {
                                const isSelected = String(s.id) === String(selectedStore);
                                return (
                                    <div
                                        key={s.id}
                                        onClick={() => {
                                            if (onStoreChange) onStoreChange(s.id);
                                            setIsOpen(false);
                                        }}
                                        className={`px-3 py-2.5 text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between ${
                                            isSelected ? 'bg-[#00A9A8]/10 text-[#00A9A8]' : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className="truncate">{s.name}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-[#00A9A8] shrink-0" />}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-3 text-center text-xs text-slate-400">
                                No stores available
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesHeader;