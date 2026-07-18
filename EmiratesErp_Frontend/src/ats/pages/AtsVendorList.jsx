import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    Loader2,
    Eye,
    Edit,
    Trash2,
    ShieldAlert,
    ShieldAlert as BlacklistIcon,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Building2,
    CheckCircle,
    XCircle,
    ArrowUpDown
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsVendorList = () => {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [countries, setCountries] = useState([]);
    const [countryFilter, setCountryFilter] = useState('');

    // Pagination
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    // Sorting
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('DESC');

    const fetchDropdowns = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const res = await axios.get(`${API_URL}/ats/geo/countries`, { headers });
            setCountries(res.data || []);
        } catch (err) {
            console.error("Error fetching country filters:", err);
        }
    };

    const fetchVendors = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };

            const params = new URLSearchParams();
            params.append('page', page);
            params.append('size', pageSize);
            params.append('sortBy', sortBy);
            params.append('sortDir', sortDir);

            if (search) params.append('search', search);
            if (statusFilter) params.append('vendorStatus', statusFilter);
            if (typeFilter) params.append('vendorType', typeFilter);
            if (countryFilter) params.append('countryId', countryFilter);

            const res = await axios.get(`${API_URL}/ats/vendors?${params.toString()}`, { headers });
            setVendors(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
            setTotalElements(res.data.totalElements || 0);
        } catch (err) {
            console.error("Error fetching vendors:", err);
            setError("Failed to fetch vendor list. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDropdowns();
    }, []);

    useEffect(() => {
        fetchVendors();
    }, [page, pageSize, statusFilter, typeFilter, countryFilter, sortBy, sortDir]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(0);
        fetchVendors();
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortDir('ASC');
        }
        setPage(0);
    };

    const handleDelete = async (id, companyName) => {
        if (!window.confirm(`Are you sure you want to delete ${companyName}? All associated contacts, contracts, notes, and tasks will be permanently removed.`)) return;

        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            await axios.delete(`${API_URL}/ats/vendors/${id}`, { headers });
            toast.success("Vendor deleted successfully.");
            fetchVendors();
        } catch (err) {
            console.error("Error deleting vendor:", err);
            toast.error(err.response?.data?.message || "Failed to delete vendor.");
        }
    };

    const handleBlacklist = async (id, isCurrentlyBlacklisted) => {
        const token = localStorage.getItem('token');
        const headers = { "Authorization": `Bearer ${token}` };

        if (isCurrentlyBlacklisted) {
            if (!window.confirm("Remove this vendor from the blacklist?")) return;
            try {
                await axios.patch(`${API_URL}/ats/vendors/${id}/unblacklist`, {}, { headers });
                toast.success("Vendor removed from blacklist.");
                fetchVendors();
            } catch (err) {
                console.error("Error removing blacklist:", err);
                toast.error("Failed to un-blacklist vendor.");
            }
        } else {
            const reason = window.prompt("Enter blacklist reason:");
            if (reason === null) return;
            if (!reason.trim()) {
                toast.error("Reason is required to blacklist a vendor.");
                return;
            }
            try {
                await axios.patch(`${API_URL}/ats/vendors/${id}/blacklist?reason=${encodeURIComponent(reason)}`, {}, { headers });
                toast.warn("Vendor has been blacklisted.");
                fetchVendors();
            } catch (err) {
                console.error("Error blacklisting vendor:", err);
                toast.error("Failed to blacklist vendor.");
            }
        }
    };

    const getStatusBadge = (status, isBlacklisted) => {
        if (isBlacklisted) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-theme bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    Blacklisted
                </span>
            );
        }

        switch (status) {
            case 'ACTIVE':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-theme bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                    </span>
                );
            case 'PENDING_APPROVAL':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-theme bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Pending
                    </span>
                );
            case 'INACTIVE':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-theme bg-orange-50 text-orange-700 border border-orange-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                        Inactive
                    </span>
                );
            case 'ARCHIVED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-theme bg-slate-50 text-slate-700 border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                        Archived
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-theme bg-gray-50 text-gray-700 border border-gray-200">
                        Unknown
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 text-foreground">
            {/* Header section with HSL tailored glassmorphic design */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-card rounded-theme shadow-sm border border-border">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-primary" />
                        Vendor Directory
                    </h1>
                    <p className="text-sm text-foreground-muted mt-1">
                        Manage strategic sourcing partners, staff agencies, independent contractors, and child contacts.
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/ats-dashboard/vendors/new')}
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-theme shadow shadow-primary/20 hover:bg-primary/90 transition-all gap-2 self-start md:self-auto"
                >
                    <Plus className="h-4 w-4" />
                    Add Vendor
                </motion.button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-card rounded-theme border border-border shadow-sm space-y-4">
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="relative col-span-1 lg:col-span-2">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground-muted">
                            <Search className="h-4 w-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by Company, Email or Code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2.5 w-full text-sm border border-border rounded-theme focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background text-foreground"
                        />
                    </div>

                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2.5 w-full text-sm border border-border rounded-theme focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background text-foreground"
                        >
                            <option value="">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING_APPROVAL">Pending Approval</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>

                    <div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2.5 w-full text-sm border border-border rounded-theme focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background text-foreground"
                        >
                            <option value="">All Types</option>
                            <option value="STAFFING">Staffing Agency</option>
                            <option value="CONSULTING">Consulting Firm</option>
                            <option value="INDEPENDENT_CONTRACTOR">Contractor</option>
                            <option value="RPO">RPO</option>
                            <option value="MSP">MSP</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div>
                        <select
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                            className="px-3 py-2.5 w-full text-sm border border-border rounded-theme focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background text-foreground"
                        >
                            <option value="">All Countries</option>
                            {countries.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </form>
            </div>

            {/* Table Area */}
            <div className="bg-card rounded-theme border border-border shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <span className="text-sm font-medium text-foreground-muted">Loading strategic vendors...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
                        <p className="font-semibold text-foreground">{error}</p>
                        <button onClick={fetchVendors} className="mt-4 text-sm font-semibold text-primary hover:underline">
                            Try Again
                        </button>
                    </div>
                ) : vendors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <Building2 className="h-12 w-12 text-foreground-muted mb-3" />
                        <p className="font-semibold text-foreground text-base">No Vendors Found</p>
                        <p className="text-sm text-foreground-muted mt-1 max-w-sm">
                            Try adjusting your filters or search term, or register a new vendor.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-background/50 text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                                    <th onClick={() => handleSort('companyName')} className="px-6 py-4 cursor-pointer hover:bg-background-muted transition-all select-none">
                                        <span className="flex items-center gap-1.5">
                                            Company Name
                                            <ArrowUpDown className="h-3 w-3" />
                                        </span>
                                    </th>
                                    <th className="px-6 py-4">Code / Type</th>
                                    <th className="px-6 py-4">Primary Contact</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th onClick={() => handleSort('vendorStatus')} className="px-6 py-4 cursor-pointer hover:bg-background-muted transition-all select-none">
                                        <span className="flex items-center gap-1.5">
                                            Status
                                            <ArrowUpDown className="h-3 w-3" />
                                        </span>
                                    </th>
                                    <th onClick={() => handleSort('createdAt')} className="px-6 py-4 cursor-pointer hover:bg-background-muted transition-all select-none text-right">
                                        <span className="flex items-center justify-end gap-1.5">
                                            Created
                                            <ArrowUpDown className="h-3 w-3" />
                                        </span>
                                    </th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-sm text-foreground">
                                {vendors.map((vendor) => (
                                    <tr key={vendor.id} className="hover:bg-background-muted/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/ats-dashboard/vendors/${vendor.id}`)}>
                                                {vendor.companyName}
                                            </div>
                                            <div className="text-xs text-foreground-muted mt-0.5">{vendor.displayName || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs bg-background-muted px-1.5 py-0.5 rounded text-foreground font-bold">
                                                {vendor.vendorCode || 'NO-CODE'}
                                            </span>
                                            <div className="text-xs text-foreground-muted mt-1 capitalize font-medium">
                                                {vendor.vendorType?.toLowerCase().replace('_', ' ') || 'Other'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{vendor.primaryEmail}</div>
                                            <div className="text-xs text-foreground-muted mt-0.5">{vendor.primaryPhone || 'No Phone'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>{vendor.city || '-'}</div>
                                            <div className="text-xs text-foreground-muted mt-0.5">{vendor.countryName || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(vendor.vendorStatus, vendor.isBlacklisted)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-foreground-muted text-xs font-mono">
                                            {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/ats-dashboard/vendors/${vendor.id}`)}
                                                    className="p-1.5 text-foreground-muted hover:text-primary hover:bg-background rounded-theme border border-border transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/ats-dashboard/vendors/${vendor.id}/edit`)}
                                                    className="p-1.5 text-foreground-muted hover:text-warning hover:bg-background rounded-theme border border-border transition-all"
                                                    title="Edit Vendor"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleBlacklist(vendor.id, vendor.isBlacklisted)}
                                                    className={`p-1.5 rounded-theme border border-border transition-all ${vendor.isBlacklisted ? 'text-rose-600 bg-rose-50 hover:bg-rose-100' : 'text-foreground-muted hover:text-rose-600 hover:bg-background'}`}
                                                    title={vendor.isBlacklisted ? "Un-blacklist Vendor" : "Blacklist Vendor"}
                                                >
                                                    <BlacklistIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(vendor.id, vendor.companyName)}
                                                    className="p-1.5 text-foreground-muted hover:text-destructive hover:bg-background rounded-theme border border-border transition-all"
                                                    title="Delete Permanent"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                {vendors.length > 0 && !loading && (
                    <div className="px-6 py-4 bg-background/50 border-t border-border flex items-center justify-between gap-4 flex-col sm:flex-row">
                        <div className="text-xs font-semibold text-foreground-muted">
                            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalElements)} of {totalElements} vendors
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-foreground-muted font-medium">Rows per page:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(0); }}
                                    className="px-2 py-1 text-xs border border-border rounded-theme focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-card font-semibold text-foreground"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="p-1.5 border border-border rounded-theme bg-background hover:bg-background-muted text-foreground disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-xs font-bold text-foreground px-2.5 py-1 bg-card rounded-theme border border-border shadow-xs">
                                    {page + 1} / {totalPages || 1}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="p-1.5 border border-border rounded-theme bg-background hover:bg-background-muted text-foreground disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AtsVendorList;
