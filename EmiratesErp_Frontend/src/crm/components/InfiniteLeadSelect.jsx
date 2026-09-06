import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Search, ChevronDown, Loader, Check, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const InfiniteLeadSelect = ({ value, onChange, error, onAddLeadClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [leads, setLeads] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedLeadObj, setSelectedLeadObj] = useState(null);

    const dropdownRef = useRef(null);
    const listRef = useRef(null);
    const searchInputRef = useRef(null);

    const authHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    // Fetch initial selected lead if value exists and not in list
    useEffect(() => {
        if (value && (!selectedLeadObj || selectedLeadObj.id !== value)) {
            axios.get(`${API_URL}/crm/leads/${value}`, { headers: authHeaders })
                .then(res => setSelectedLeadObj(res.data))
                .catch(() => setSelectedLeadObj(null));
        } else if (!value) {
            setSelectedLeadObj(null);
        }
    }, [value]);

    const fetchLeads = useCallback(async (pageNum = 0, searchQuery = '', append = false) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/crm/leads`, {
                headers: authHeaders,
                params: {
                    page: pageNum,
                    size: 10,
                    search: searchQuery || undefined
                }
            });

            const content = response.data?.content || response.data || [];
            const isLast = response.data?.last ?? (content.length < 10);

            setLeads(prev => append ? [...prev, ...content] : content);
            setHasMore(!isLast);
            setPage(pageNum);
        } catch (err) {
            console.error("Failed to fetch leads", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch on mount or search change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLeads(0, search, false);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, fetchLeads]);

    // Handle Click Outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle Infinite Scroll
    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 20 && hasMore && !loading) {
            fetchLeads(page + 1, search, true);
        }
    };

    const handleSelect = (lead) => {
        setSelectedLeadObj(lead);
        onChange(lead.id);
        setIsOpen(false);
    };

    const displayLabel = selectedLeadObj ? (
        `${selectedLeadObj.firstName || ''} ${selectedLeadObj.lastName || ''} ${selectedLeadObj.companyName ? `(${selectedLeadObj.companyName})` : ''} - ${selectedLeadObj.leadNo || `#${selectedLeadObj.id}`}`
    ) : '-- Select Lead --';

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) {
                        setTimeout(() => searchInputRef.current?.focus(), 100);
                    }
                }}
                className={`w-full px-3 py-1.5 bg-white border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] outline-none flex items-center justify-between h-8 cursor-pointer shadow-2xs select-none`}
            >
                <span className={`truncate ${!selectedLeadObj ? 'text-[#60738E]' : 'font-medium'}`}>
                    {displayLabel}
                </span>
                <ChevronDown size={14} className="text-[#60738E] shrink-0 ml-1" />
            </div>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#C9D8E5] rounded-md shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* Search Input Box */}
                    <div className="p-2 border-b border-[#D7E3EE] bg-[#F8FAFC]">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#60738E]" size={13} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, company, or lead no..."
                                className="w-full pl-8 pr-3 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-[#102A43] focus:border-[#0178BC] outline-none"
                            />
                        </div>
                    </div>

                    {/* Scrollable List */}
                    <div
                        ref={listRef}
                        onScroll={handleScroll}
                        className="max-h-48 overflow-y-auto divide-y divide-[#E8EEF7] text-xs custom-scrollbar"
                    >
                        {leads.map((lead) => {
                            const isSelected = value === lead.id;
                            const label = `${lead.firstName || ''} ${lead.lastName || ''} ${lead.companyName ? `(${lead.companyName})` : ''} - ${lead.leadNo || `#${lead.id}`}`;

                            return (
                                <div
                                    key={lead.id}
                                    onClick={() => handleSelect(lead)}
                                    className={`p-2 hover:bg-[#F8FAFC] cursor-pointer flex items-center justify-between transition-colors ${isSelected ? 'bg-blue-50/70 font-bold text-[#0178BC]' : 'text-[#102A43]'}`}
                                >
                                    <span className="truncate pr-2">{label}</span>
                                    {isSelected && <Check size={14} className="text-[#0178BC] shrink-0" />}
                                </div>
                            );
                        })}

                        {leads.length === 0 && !loading && (
                            <div className="p-3 text-center text-xs text-[#60738E]">
                                No leads found matching search.
                            </div>
                        )}

                        {loading && (
                            <div className="p-2.5 text-center text-xs text-[#0178BC] flex items-center justify-center gap-1.5 font-medium bg-[#F8FAFC]">
                                <Loader size={12} className="animate-spin" /> Loading more leads...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InfiniteLeadSelect;
