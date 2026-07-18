import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Search, 
    Unlock, 
    Loader2, 
    AlertTriangle,
    CheckSquare,
    Square
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const tabs = [
    { id: 'applicants', label: 'Applicants' },
    { id: 'clients', label: 'Clients' },
    { id: 'client_contacts', label: 'Client Contacts' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'vendor_contacts', label: 'Vendor Contacts' }
];

const AtsBlacklist = () => {
    const [activeTab, setActiveTab] = useState('applicants');
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Checked item state for bulk action
    const [checkedIds, setCheckedIds] = useState(new Set());

    const fetchBlacklist = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/ats/blacklist`, {
                params: {
                    type: activeTab,
                    search,
                    page,
                    size
                },
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = response.data;
            setItems(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
            setCheckedIds(new Set()); // reset checkboxes on page/tab change
        } catch (err) {
            console.error("Failed to load blacklist details", err);
            toast.error("Failed to load blacklist data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(0);
        setCheckedIds(new Set());
    }, [activeTab]);

    useEffect(() => {
        fetchBlacklist();
    }, [activeTab, search, page, size]);

    // Handle single row checkbox toggle
    const handleCheckboxToggle = (id) => {
        const next = new Set(checkedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setCheckedIds(next);
    };

    // Handle check all toggle
    const handleCheckAllToggle = () => {
        if (checkedIds.size === items.length) {
            setCheckedIds(new Set());
        } else {
            setCheckedIds(new Set(items.map(item => item.id)));
        }
    };

    // Unblock bulk action
    const handleUnblock = async () => {
        if (checkedIds.size === 0) {
            toast.warning("Please select at least one record to unblock.");
            return;
        }

        if (!window.confirm(`Are you sure you want to unblock ${checkedIds.size} selected record(s)?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/ats/blacklist/unblock`, {
                type: activeTab,
                ids: Array.from(checkedIds)
            }, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            toast.success(`Successfully unblocked ${response.data} record(s).`);
            fetchBlacklist();
        } catch (err) {
            console.error("Unblock action failed", err);
            toast.error("Failed to unblock selected items.");
        }
    };

    // Helper to format date
    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            const d = new Date(isoString);
            return d.toLocaleString();
        } catch (e) {
            return isoString;
        }
    };

    const getEntityIdLabel = () => {
        switch (activeTab) {
            case 'applicants': return 'Applicant ID';
            case 'clients': return 'Client ID';
            case 'client_contacts': return 'Contact ID';
            case 'vendors': return 'Vendor ID';
            case 'vendor_contacts': return 'Contact ID';
            default: return 'ID';
        }
    };

    const getEntityNameLabel = () => {
        switch (activeTab) {
            case 'applicants': return 'Applicant Name';
            case 'clients': return 'Client Name';
            case 'client_contacts': return 'Contact Name';
            case 'vendors': return 'Vendor Name';
            case 'vendor_contacts': return 'Contact Name';
            default: return 'Name';
        }
    };

    const getEntityStatusLabel = () => {
        switch (activeTab) {
            case 'applicants': return 'Applicant Status';
            case 'clients': return 'Client Status';
            case 'client_contacts': return 'Contact Status';
            case 'vendors': return 'Vendor Status';
            case 'vendor_contacts': return 'Contact Status';
            default: return 'Status';
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Blacklist</h1>
                    <p className="text-xs text-foreground-muted">Manage blacklisted applicants, clients, vendors, and contacts.</p>
                </div>
                <button 
                    onClick={handleUnblock}
                    disabled={checkedIds.size === 0}
                    className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-theme shadow disabled:opacity-50 transition-all"
                >
                    <Unlock className="h-4 w-4" />
                    Unblock
                </button>
            </header>

            {/* Tabs Navigation */}
            <div className="border-b border-border">
                <nav className="flex gap-6 -mb-px">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-xs font-bold uppercase transition-all relative ${
                                activeTab === tab.id 
                                    ? 'text-primary' 
                                    : 'text-foreground-muted hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* List Table Section */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
                        <input 
                            type="text"
                            placeholder="Search blacklisted items..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                            className="pl-9 pr-4 py-2 w-full bg-background border border-border rounded-theme text-sm focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-foreground-muted/50 font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground-muted">Show</span>
                        <select 
                            value={size} 
                            onChange={(e) => {
                                setSize(Number(e.target.value));
                                setPage(0);
                            }}
                            className="bg-background border border-border rounded-theme px-2 py-1 text-xs focus:ring-1 focus:ring-primary font-bold"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="text-xs font-semibold text-foreground-muted">entries</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="animate-spin h-8 w-8 text-primary" />
                            <span className="text-xs text-foreground-muted font-bold">Fetching records...</span>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-foreground-muted gap-2">
                            <AlertTriangle className="h-8 w-8 text-amber-500" />
                            <span className="text-sm font-bold">No blacklisted records found.</span>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-background-muted/50 text-[11px] font-black text-foreground-muted tracking-wider uppercase">
                                    <th className="px-5 py-3.5 w-10">
                                        <button onClick={handleCheckAllToggle} className="p-0.5 rounded hover:bg-black/5 transition-colors">
                                            {checkedIds.size === items.length ? (
                                                <CheckSquare className="h-4 w-4 text-primary" />
                                            ) : (
                                                <Square className="h-4 w-4 text-foreground-muted" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-5 py-3.5 font-black">{getEntityIdLabel()}</th>
                                    <th className="px-5 py-3.5 font-black">{getEntityNameLabel()}</th>
                                    <th className="px-5 py-3.5 font-black">{getEntityStatusLabel()}</th>
                                    <th className="px-5 py-3.5 font-black">Reason</th>
                                    <th className="px-5 py-3.5 font-black">Mobile Number</th>
                                    <th className="px-5 py-3.5 font-black">Email Address</th>
                                    <th className="px-5 py-3.5 font-black">Ownership</th>
                                    <th className="px-5 py-3.5 font-black">Blacklisted By</th>
                                    <th className="px-5 py-3.5 font-black">Blacklisted Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-xs">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-background-muted/20 transition-colors">
                                        <td className="px-5 py-4">
                                            <button 
                                                onClick={() => handleCheckboxToggle(item.id)}
                                                className="p-0.5 rounded hover:bg-black/5 transition-colors"
                                            >
                                                {checkedIds.has(item.id) ? (
                                                    <CheckSquare className="h-4 w-4 text-primary" />
                                                ) : (
                                                    <Square className="h-4 w-4 text-foreground-muted" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-primary">
                                            {item.id}
                                        </td>
                                        <td className="px-5 py-4 font-bold text-foreground">
                                            {item.name}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-foreground-muted uppercase">
                                            {item.status}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-foreground">
                                            {item.reason || 'N/A'}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-foreground-muted">
                                            {item.mobileNumber || 'N/A'}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-foreground-muted">
                                            {item.emailAddress || 'N/A'}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-foreground-muted">
                                            {item.ownership || 'N/A'}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-foreground-muted">
                                            {item.blacklistedBy || 'N/A'}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-foreground-muted">
                                            {formatDate(item.blacklistedDate)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination footer */}
                {!loading && totalPages > 0 && (
                    <div className="p-4 border-t border-border flex flex-wrap items-center justify-between gap-4 bg-background-muted/30">
                        <span className="text-xs text-foreground-muted font-medium">
                            Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} entries
                        </span>
                        
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-2.5 py-1.5 border border-border rounded-theme text-xs font-semibold bg-card text-foreground-muted hover:bg-background-muted disabled:opacity-50 transition-all"
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`px-3 py-1.5 rounded-theme text-xs font-bold transition-all ${
                                        page === i 
                                            ? 'bg-primary text-primary-foreground shadow' 
                                            : 'border border-border bg-card text-foreground-muted hover:bg-background-muted'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="px-2.5 py-1.5 border border-border rounded-theme text-xs font-semibold bg-card text-foreground-muted hover:bg-background-muted disabled:opacity-50 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AtsBlacklist;
