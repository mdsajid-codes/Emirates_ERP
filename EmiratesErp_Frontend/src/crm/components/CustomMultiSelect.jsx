import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check, ChevronDown } from 'lucide-react';

const CustomMultiSelect = ({ options = [], value = [], onChange, placeholder = "Select items..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleOption = (optValue) => {
        const selectedSet = new Set(value.map(v => String(v)));
        const targetVal = String(optValue);

        if (selectedSet.has(targetVal)) {
            selectedSet.delete(targetVal);
        } else {
            selectedSet.add(targetVal);
        }

        // Preserve original type if values were numbers
        const newSelected = Array.from(selectedSet).map(valStr => {
            const match = options.find(o => String(o.value) === valStr);
            return match ? match.value : valStr;
        });

        onChange(newSelected);
    };

    const handleRemoveTag = (optValue, e) => {
        e.stopPropagation();
        onChange(value.filter(v => String(v) !== String(optValue)));
    };

    const selectedOptions = options.filter(opt => value.some(v => String(v) === String(opt.value)));

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full min-h-[38px] px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus-within:border-[#0178BC] focus-within:ring-1 focus-within:ring-[#0178BC] outline-none transition-all flex items-center justify-between gap-2 cursor-pointer"
            >
                <div className="flex flex-wrap gap-1.5 items-center flex-1 max-h-20 overflow-y-auto pr-1">
                    {selectedOptions.length === 0 ? (
                        <span className="text-[#102A43]/40">{placeholder}</span>
                    ) : (
                        selectedOptions.map(opt => (
                            <span
                                key={opt.value}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E6F0F8] text-[#0178BC] font-semibold text-[11px] rounded shrink-0 border border-[#BCE0FD]"
                            >
                                {opt.label}
                                <X
                                    size={12}
                                    className="hover:text-red-500 cursor-pointer shrink-0"
                                    onClick={(e) => handleRemoveTag(opt.value, e)}
                                />
                            </span>
                        ))
                    )}
                </div>
                <ChevronDown size={14} className={`text-[#60738A] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#D7E3EE] rounded-md shadow-lg z-50 overflow-hidden flex flex-col max-h-56">
                    <div className="p-2 border-b border-[#D7E3EE] bg-[#F8FAFC]">
                        <div className="relative flex items-center">
                            <Search size={13} className="absolute left-2.5 text-[#60738A]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-full pl-8 pr-2 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-[#102A43] focus:outline-none focus:border-[#0178BC]"
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto p-1 flex flex-col gap-0.5 max-h-40">
                        {filteredOptions.length === 0 ? (
                            <div className="p-2.5 text-center text-xs text-[#60738A]">No options found</div>
                        ) : (
                            filteredOptions.map(opt => {
                                const isChecked = value.some(v => String(v) === String(opt.value));
                                return (
                                    <div
                                        key={opt.value}
                                        onClick={() => toggleOption(opt.value)}
                                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded cursor-pointer text-xs transition-colors ${
                                            isChecked ? 'bg-[#E6F0F8]/70 text-[#0178BC] font-semibold' : 'hover:bg-slate-50 text-[#102A43]'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                            isChecked ? 'bg-[#0178BC] border-[#0178BC] text-white' : 'border-[#C9D8E5] bg-white'
                                        }`}>
                                            {isChecked && <Check size={11} strokeWidth={3} />}
                                        </div>
                                        <span className="truncate">{opt.label}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomMultiSelect;
