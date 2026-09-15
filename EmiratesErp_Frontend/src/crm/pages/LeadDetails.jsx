import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Loader, Search, Edit, Trash2, PlusCircle, X, ChevronLeft, ChevronRight, AlertCircle,
    Plus, Download, CheckSquare, User, Share2, RotateCcw, Settings, Grid, Users, LayoutGrid, Table,
    Square, CheckSquare as CheckSquareIcon, Upload, FileSpreadsheet, UserCog, Mail, Phone, Building, Calendar, Eye
} from 'lucide-react';
import CrmLeadForm from '../components/CrmLeadForm';
import CrmLeadBulkUploadModal from '../components/CrmLeadBulkUploadModal';
import BulkAssignOwnerModal from '../components/BulkAssignOwnerModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCrmPermissions } from '../context/CrmPermissionsContext';


const API_URL = import.meta.env.VITE_API_BASE_URL;

const LeadDetails = ({ onClose }) => {
    const { hasPermission } = useCrmPermissions();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0); // 0-indexed for Spring Pageable
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
    const [ownerFilter, setOwnerFilter] = useState(searchParams.get('unassigned') === 'true' ? 'UNASSIGNED' : (searchParams.get('ownerId') || ''));

    // Sync state if URL searchParams change
    useEffect(() => {
        const s = searchParams.get('status') || '';
        const u = searchParams.get('unassigned') === 'true';
        const o = searchParams.get('ownerId') || '';
        setStatusFilter(s);
        setOwnerFilter(u ? 'UNASSIGNED' : o);
    }, [searchParams]);
    const [periodFilter, setPeriodFilter] = useState('YEAR');
    const [employees, setEmployees] = useState([]);
    const [isFormSidebarOpen, setIsFormSidebarOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState(new Set());
    const [filterType, setFilterType] = useState('Team');
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
    const [bulkAssignLoading, setBulkAssignLoading] = useState(false);

    // New Toolbar & View State
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        leadNo: true,
        company: true,
        email: true,
        phone: true,
        source: true,
        owner: true,
        status: true,
    });
    const [shareNotification, setShareNotification] = useState('');

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(`${API_URL}/crm/leads/bulk-template`, {
                headers: authHeaders,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'leads_bulk_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Failed to download template. Please check connection.");
        }
    };

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(0); // Reset to first page on search change
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch employees for owner filter
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get(`${API_URL}/employees/all`, { headers: authHeaders });
                setEmployees(response.data || []);
            } catch (err) {
                console.error("Failed to fetch employees for filter", err);
            }
        };
        fetchEmployees();
    }, [authHeaders]);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_URL}/crm/leads`, {
                headers: authHeaders,
                params: {
                    page: currentPage,
                    size: pageSize,
                    sort: 'id,desc',
                    q: debouncedSearch || undefined,
                    status: statusFilter || undefined,
                    ownerId: ownerFilter || undefined,
                    period: periodFilter || undefined
                }
            });
            const fetchedLeads = response.data.content || [];
            fetchedLeads.sort((a, b) => (b.id || 0) - (a.id || 0));
            setLeads(fetchedLeads);
            setTotalPages(response.data.totalPages || 0);
            setTotalElements(response.data.totalElements || 0);
        } catch (err) {
            setError('Failed to fetch leads. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, authHeaders, debouncedSearch, statusFilter, ownerFilter, periodFilter]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const toggleSelectAll = () => {
        if (selectedLeads.size === leads.length && leads.length > 0) {
            setSelectedLeads(new Set());
        } else {
            setSelectedLeads(new Set(leads.map(l => l.id)));
        }
    };

    const toggleSelectLead = (id) => {
        const newSelected = new Set(selectedLeads);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedLeads(newSelected);
    };

    const handleExportSelected = () => {
        const leadsToExport = selectedLeads.size > 0
            ? leads.filter(l => selectedLeads.has(l.id))
            : leads;

        if (leadsToExport.length === 0) {
            alert("No leads available to export.");
            return;
        }

        const exportData = leadsToExport.map(l => ({
            'Lead No': l.leadNo || 'N/A',
            'First Name': l.firstName || '',
            'Last Name': l.lastName || '',
            'Company': l.companyName || 'N/A',
            'Email': l.email || '',
            'Phone': l.phone || 'N/A',
            'Source': l.leadSourceName || 'N/A',
            'Owner': l.ownerName || 'Unassigned',
            'Status': l.status || 'NEW',
            'Amount (AED)': l.amount || 0,
            'Created Date': l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ''
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        ws['!cols'] = [
            { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 },
            { wch: 25 }, { wch: 18 }, { wch: 20 }, { wch: 20 },
            { wch: 15 }, { wch: 15 }, { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Leads Export');
        XLSX.writeFile(wb, `CRM_Leads_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleShare = () => {
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl);
        setShareNotification('Link copied to clipboard!');
        setTimeout(() => setShareNotification(''), 3000);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (e) => {
        setPageSize(parseInt(e.target.value, 10));
        setCurrentPage(0); // Reset to first page when page size changes
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setOwnerFilter('');
        setPeriodFilter('YEAR');
        setCurrentPage(0);
    };

    const handleEditLead = (lead) => {
        navigate(`/crm-dashboard/leads/edit/${lead.id}`);
    };

    const handleDeleteLead = async (id) => {
        if (!window.confirm('Are you sure you want to delete this lead?')) {
            return;
        }
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/crm/leads/${id}`, { headers: authHeaders });
            fetchLeads(); // Refresh the list
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to delete lead.'}`);
            setError('Failed to delete lead.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLead = async (leadData) => {
        setFormLoading(true);
        try {
            if (editingLead) {
                await axios.put(`${API_URL}/crm/leads/${editingLead.id}`, leadData, { headers: authHeaders });
            } else {
                await axios.post(`${API_URL}/crm/leads`, leadData, { headers: authHeaders });
            }
            setIsFormSidebarOpen(false);
            setEditingLead(null);
            fetchLeads(); // Refresh data
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save lead.'}`);
        } finally {
            setFormLoading(false);
        }
    };

    const handleViewLead = (lead) => {
        navigate(`/crm-dashboard/leads/${lead.id}`);
    };

    const handleBulkAssignOwner = async (ownerId) => {
        if (selectedLeads.size === 0) return;
        setBulkAssignLoading(true);
        try {
            const leadIds = Array.from(selectedLeads);
            const response = await axios.put(`${API_URL}/crm/leads/bulk-assign-owner`, {
                leadIds,
                ownerId
            }, { headers: authHeaders });

            alert(`Successfully assigned ${response.data.updatedCount} leads to new owner.`);
            setIsBulkAssignOpen(false);
            setSelectedLeads(new Set());
            fetchLeads(); // Refresh table
        } catch (err) {
            console.error("Bulk assign failed", err);
            alert(`Error: ${err.response?.data?.message || 'Failed to assign owner.'}`);
        } finally {
            setBulkAssignLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedLeads.size === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedLeads.size} selected leads? This action cannot be undone.`)) {
            return;
        }
        setLoading(true);
        try {
            const ids = Array.from(selectedLeads).join(',');
            await axios.delete(`${API_URL}/crm/leads/bulk?ids=${ids}`, { headers: authHeaders });
            alert(`Successfully deleted ${selectedLeads.size} leads.`);
            setSelectedLeads(new Set());
            fetchLeads();
        } catch (err) {
            console.error("Bulk delete failed", err);
            alert(`Error: ${err.response?.data?.message || 'Failed to delete leads.'}`);
            setLoading(false);
        }
    };

    const hasActiveFilters = searchTerm || statusFilter || ownerFilter || periodFilter !== 'YEAR';

    return (
        <div className="flex flex-col h-screen bg-background text-foreground relative overflow-hidden">
            {/* Share Notification Alert */}
            {shareNotification && (
                <div className="fixed top-4 right-4 bg-[#009BA1] text-white px-4 py-2 rounded-lg shadow-xl text-xs font-bold z-50 animate-bounce">
                    {shareNotification}
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-0">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader className="animate-spin h-8 w-8 text-[#009BA1]" />
                    </div>
                ) : error ? (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 flex items-center gap-2 text-xs m-3">
                        <AlertCircle className="h-4 w-4" />
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="bg-white border-b border-[#E3EAF2] shadow-2xs overflow-hidden flex flex-col w-full">
                        {/* Table Header Controls Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 bg-white border-b border-[#E3EAF2]">
                            {/* Search & Select Filters */}
                            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
                                <div className="relative flex-1 sm:flex-none sm:w-64">
                                    <input
                                        type="text"
                                        placeholder="Search leads..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#DFE6EF] rounded-lg text-xs font-medium placeholder-[#8F9CAE] focus:bg-white focus:ring-1 focus:ring-[#009BA1] focus:border-[#009BA1] transition-all outline-none h-8"
                                    />
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8F9CAE]" />
                                </div>

                                <select
                                    value={periodFilter}
                                    onChange={(e) => { setPeriodFilter(e.target.value); setCurrentPage(0); }}
                                    className="bg-[#F8FAFC] border border-[#DFE6EF] rounded-lg text-xs font-medium py-1.5 px-2.5 text-[#0A1929] hover:bg-white focus:ring-1 focus:ring-[#009BA1] outline-none cursor-pointer transition-all max-w-[130px] h-8"
                                >
                                    <option value="YEAR">This Year</option>
                                    <option value="MONTH">This Month</option>
                                    <option value="QUARTER">This Quarter</option>
                                    <option value="ALL">All Time</option>
                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
                                    className="bg-[#F8FAFC] border border-[#DFE6EF] rounded-lg text-xs font-medium py-1.5 px-2.5 text-[#0A1929] hover:bg-white focus:ring-1 focus:ring-[#009BA1] outline-none cursor-pointer transition-all max-w-[140px] h-8"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="NEW">New</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="CONVERTED">Converted</option>
                                    <option value="LOST">Lost</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="DUPLICATE">Duplicate</option>
                                    <option value="JUNK">Junk</option>
                                </select>

                                <select
                                    value={ownerFilter}
                                    onChange={(e) => { setOwnerFilter(e.target.value); setCurrentPage(0); }}
                                    className="bg-[#F8FAFC] border border-[#DFE6EF] rounded-lg text-xs font-medium py-1.5 px-2.5 text-[#0A1929] hover:bg-white focus:ring-1 focus:ring-[#009BA1] outline-none cursor-pointer transition-all max-w-[160px] h-8"
                                >
                                    <option value="">All Owners</option>
                                    <option value="UNASSIGNED">Unassigned</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.firstName} {emp.lastName}
                                        </option>
                                    ))}
                                </select>

                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-[11px] font-bold text-[#009BA1] hover:text-[#00868C] transition-colors px-2 py-1 bg-cyan-50 rounded border border-cyan-200/60 cursor-pointer h-8"
                                    >
                                        CLEAR FILTERS
                                    </button>
                                )}
                            </div>

                            {/* Team/Self Toggle & Action Buttons Toolbar */}
                            <div className="flex items-center gap-2">
                                {/* Team / Self Segmented Toggle */}
                                <div className="flex bg-[#F4F7FA] p-0.5 rounded-lg border border-[#DFE6EF] h-8 items-center">
                                    <button
                                        onClick={() => setFilterType('Team')}
                                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${filterType === 'Team' ? 'bg-[#009BA1] text-white shadow-2xs' : 'text-[#60738A] hover:text-[#0A1929]'}`}
                                    >
                                        Team
                                    </button>
                                    <button
                                        onClick={() => setFilterType('Self')}
                                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${filterType === 'Self' ? 'bg-[#009BA1] text-white shadow-2xs' : 'text-[#60738A] hover:text-[#0A1929]'}`}
                                    >
                                        Self
                                    </button>
                                </div>

                                {/* Action Buttons Toolbar */}
                                <div className="flex items-center bg-white border border-[#DFE6EF] rounded-lg p-0.5 shadow-2xs gap-0.5 h-8">
                                    {hasPermission('LEAD', 'create') && (
                                        <button
                                            onClick={() => navigate('/crm-dashboard/leads/new')}
                                            className="p-1.5 bg-[#009BA1] hover:bg-[#00868C] text-white rounded transition-all cursor-pointer group relative flex items-center justify-center"
                                            title="Add Lead"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    )}

                                    {hasPermission('LEAD', 'export') && (
                                        <button
                                            onClick={handleExportSelected}
                                            className="p-1.5 text-[#60738A] hover:text-[#0A1929] hover:bg-slate-50 rounded transition-all cursor-pointer relative group"
                                            title="Download Excel Report"
                                        >
                                            <Download size={14} />
                                            {selectedLeads.size > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-[#009BA1] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                                                    {selectedLeads.size}
                                                </span>
                                            )}
                                        </button>
                                    )}

                                    {hasPermission('LEAD', 'changeOwner') && (
                                        <button
                                            onClick={() => {
                                                if (selectedLeads.size > 0) {
                                                    setIsBulkAssignOpen(true);
                                                } else {
                                                    alert("Please select leads using the checkboxes first to assign an owner.");
                                                }
                                            }}
                                            className={`p-1.5 text-[#60738A] hover:text-[#0A1929] hover:bg-slate-50 rounded transition-all cursor-pointer relative group`}
                                            title="Assign Owner to Selected"
                                        >
                                            <UserCog size={14} />
                                        </button>
                                    )}

                                    {hasPermission('LEAD', 'delete') && (
                                        <button
                                            onClick={handleBulkDelete}
                                            className={`p-1.5 text-[#60738A] hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer relative group ${selectedLeads.size === 0 ? 'opacity-50' : ''}`}
                                            title="Delete Selected"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}

                                    {hasPermission('LEAD', 'import') && (
                                        <>
                                            <button
                                                onClick={handleDownloadTemplate}
                                                className="p-1.5 text-[#60738A] hover:text-[#0A1929] hover:bg-slate-50 rounded transition-all cursor-pointer group relative"
                                                title="Download Excel Import Template"
                                            >
                                                <FileSpreadsheet size={14} />
                                            </button>

                                            <button
                                                onClick={() => setIsBulkUploadOpen(true)}
                                                className="p-1.5 text-[#60738A] hover:text-[#0A1929] hover:bg-slate-50 rounded transition-all cursor-pointer group relative"
                                                title="Bulk Upload Leads"
                                            >
                                                <Upload size={14} />
                                            </button>
                                        </>
                                    )}

                                    <button
                                        onClick={handleShare}
                                        className="p-1.5 text-[#60738A] hover:text-[#0A1929] hover:bg-slate-50 rounded transition-all cursor-pointer group relative"
                                        title="Share Page Link"
                                    >
                                        <Share2 size={14} />
                                    </button>

                                    <button onClick={() => fetchLeads()} className="p-1.5 text-[#60738A] hover:text-[#0A1929] hover:bg-slate-50 rounded transition-all cursor-pointer group relative" title="Refresh Table">
                                        <RotateCcw size={14} />
                                    </button>

                                    <div className="w-px h-4 bg-[#DFE6EF] mx-0.5" />

                                    <button
                                        onClick={() => setViewMode(prev => prev === 'table' ? 'grid' : 'table')}
                                        className={`p-1.5 rounded transition-all cursor-pointer group relative ${viewMode === 'grid' ? 'bg-[#009BA1] text-white' : 'text-[#60738A] hover:text-[#0A1929] hover:bg-slate-50'}`}
                                        title={viewMode === 'table' ? 'Switch to Card Grid View' : 'Switch to Table View'}
                                    >
                                        {viewMode === 'table' ? <Grid size={14} /> : <Table size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* VIEW MODE: TABLE vs GRID */}
                        {viewMode === 'table' ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead className="sticky top-0 z-10 bg-[#F6F8FB]">
                                        <tr className="bg-[#F6F8FB] border-b border-[#E3EAF2]">
                                            <th className="py-2.5 px-3 text-center w-10">
                                                <button onClick={toggleSelectAll} className="p-0.5 rounded hover:bg-black/5 transition-colors">
                                                    {selectedLeads.size === leads.length && leads.length > 0 ? (
                                                        <CheckSquareIcon className="h-3.5 w-3.5 text-[#009BA1]" />
                                                    ) : (
                                                        <Square className="h-3.5 w-3.5 text-slate-400" />
                                                    )}
                                                </button>
                                            </th>
                                            <th className="py-2.5 px-2.5 text-[11px] font-bold text-[#092036] uppercase tracking-wider">NAME</th>
                                            {visibleColumns.leadNo && <th className="py-2.5 px-2.5 text-[11px] font-bold text-[#092036] uppercase tracking-wider">LEAD NO.</th>}
                                            {visibleColumns.company && <th className="py-2.5 px-2.5 text-[11px] font-bold text-[#092036] uppercase tracking-wider">COMPANY</th>}
                                            {visibleColumns.email && <th className="py-2.5 px-2.5 text-[11px] font-bold text-[#092036] uppercase tracking-wider">EMAIL</th>}
                                            {visibleColumns.phone && <th className="py-2.5 px-2.5 text-[11px] font-bold text-[#092036] uppercase tracking-wider">PHONE</th>}
                                            {visibleColumns.source && <th className="py-2.5 px-2.5 text-[11px] font-bold text-[#092036] uppercase tracking-wider">SOURCE</th>}
                                            {visibleColumns.owner && <th className="py-2.5 px-2.5 text-[11px] font-bold text-[#092036] uppercase tracking-wider">OWNER</th>}
                                            {visibleColumns.status && <th className="py-2.5 px-2.5 text-[11px] font-bold text-[#092036] uppercase tracking-wider">STATUS</th>}
                                            <th className="py-2.5 px-2.5 text-[11px] font-bold text-[#092036] uppercase tracking-wider text-center">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E3EAF2]">
                                        {leads.length > 0 ? (
                                            leads.map((lead) => (
                                                <tr key={lead.id} className="hover:bg-[#F8FAFC] transition-colors group">
                                                    <td className="py-2.5 px-3 text-center">
                                                        <button onClick={() => toggleSelectLead(lead.id)} className="p-0.5 rounded hover:bg-black/5 transition-colors">
                                                            {selectedLeads.has(lead.id) ? (
                                                                <CheckSquareIcon className="h-3.5 w-3.5 text-[#009BA1]" />
                                                            ) : (
                                                                <Square className="h-3.5 w-3.5 text-slate-400" />
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="py-2.5 px-2.5 text-xs font-medium">
                                                        <button
                                                            onClick={() => handleViewLead(lead)}
                                                            className="text-[#008288] font-medium hover:underline cursor-pointer"
                                                        >
                                                            {lead.firstName} {lead.lastName}
                                                        </button>
                                                    </td>
                                                    {visibleColumns.leadNo && (
                                                        <td className="py-2.5 px-2.5 text-xs">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#EDF4FF] text-[#071B62] text-[11px] font-semibold tracking-tight">
                                                                {lead.leadNo || 'N/A'}
                                                            </span>
                                                        </td>
                                                    )}
                                                    {visibleColumns.company && (
                                                        <td className="py-2.5 px-2.5 text-xs text-[#092036] font-normal truncate max-w-[150px]">
                                                            {lead.companyName || 'N/A'}
                                                        </td>
                                                    )}
                                                    {visibleColumns.email && (
                                                        <td className="py-2.5 px-2.5 text-xs text-[#092036] font-normal truncate max-w-[170px]">
                                                            {lead.email}
                                                        </td>
                                                    )}
                                                    {visibleColumns.phone && (
                                                        <td className="py-2.5 px-2.5 text-xs text-[#092036] font-normal">
                                                            {lead.phone || 'N/A'}
                                                        </td>
                                                    )}
                                                    {visibleColumns.source && (
                                                        <td className="py-2.5 px-2.5 text-xs text-[#092036] font-normal">
                                                            {lead.leadSourceName || 'Direct / Organic'}
                                                        </td>
                                                    )}
                                                    {visibleColumns.owner && (
                                                        <td className="py-2.5 px-2.5 text-xs text-[#092036]">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-5 h-5 rounded-full bg-[#F3F8FA] border border-slate-100 flex items-center justify-center text-[10px] font-medium text-[#092036]">
                                                                    {lead.ownerName ? lead.ownerName.charAt(0) : 'U'}
                                                                </div>
                                                                <span className="truncate max-w-[100px] text-[11px] text-[#092036]">
                                                                    {lead.ownerName || 'Unassigned'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    )}
                                                    {visibleColumns.status && (
                                                        <td className="py-2.5 px-2.5 text-xs">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                                                                lead.status === 'NEW' ? 'bg-[#E4F5F5] text-[#0F8E9A]' :
                                                                lead.status === 'ACTIVE' || lead.status === 'IN PROGRESS' ? 'bg-[#EAF3FE] text-[#197BDD]' :
                                                                lead.status === 'WON' || lead.status === 'CONVERTED' ? 'bg-[#EBF9E1] text-[#097F1E]' :
                                                                lead.status === 'LOST' ? 'bg-rose-100 text-rose-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }`}>
                                                                {lead.status || 'NEW'}
                                                            </span>
                                                        </td>
                                                    )}
                                                    <td className="py-2.5 px-2.5 text-xs text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button onClick={() => handleViewLead(lead)} className="p-1 text-slate-500 hover:text-[#009BA1] hover:bg-slate-100 rounded transition-colors cursor-pointer" title="View Details">
                                                                <Eye size={14} />
                                                            </button>
                                                            {hasPermission('LEAD', 'update') && (
                                                                <button onClick={() => handleEditLead(lead)} className="p-1 text-slate-500 hover:text-[#009BA1] hover:bg-slate-100 rounded transition-colors cursor-pointer" title="Edit">
                                                                    <Edit size={14} />
                                                                </button>
                                                            )}
                                                            {hasPermission('LEAD', 'delete') && (
                                                                <button onClick={() => handleDeleteLead(lead.id)} className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer" title="Delete">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="10" className="text-center py-12 bg-white">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-12 h-12 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-3">
                                                            <Search className="h-6 w-6 text-slate-400" />
                                                        </div>
                                                        <h3 className="text-base font-bold text-[#092036]">No leads found</h3>
                                                        <p className="text-slate-500 text-xs mt-0.5">Try adjusting your filters or search term.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* GRID CARD VIEW */
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-[#F8FAFC]">
                                {leads.length > 0 ? (
                                    leads.map(lead => (
                                        <div key={lead.id} className="bg-white border border-[#DFE6EF] rounded-xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#EDF4FF] text-[#071B62]">
                                                        {lead.leadNo || 'N/A'}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                        lead.status === 'NEW' ? 'bg-[#E4F5F5] text-[#0F8E9A]' :
                                                        lead.status === 'ACTIVE' ? 'bg-[#EAF3FE] text-[#197BDD]' :
                                                        lead.status === 'CONVERTED' ? 'bg-[#EBF9E1] text-[#097F1E]' :
                                                        lead.status === 'LOST' ? 'bg-rose-100 text-rose-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {lead.status || 'NEW'}
                                                    </span>
                                                </div>

                                                <h3
                                                    onClick={() => handleViewLead(lead)}
                                                    className="text-sm font-bold text-[#092036] hover:text-[#009BA1] cursor-pointer transition-colors truncate"
                                                >
                                                    {lead.firstName} {lead.lastName}
                                                </h3>
                                                <p className="text-xs text-[#60738A] font-medium mt-0.5 truncate">
                                                    {lead.companyName || 'No Company'}
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <Mail size={12} className="text-slate-400 shrink-0" />
                                                    <span className="truncate">{lead.email || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Phone size={12} className="text-slate-400 shrink-0" />
                                                    <span>{lead.phone || 'N/A'}</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                                    <User size={12} className="text-slate-400" />
                                                    <span className="truncate max-w-[100px]">{lead.ownerName || 'Unassigned'}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleViewLead(lead)} className="p-1 text-slate-400 hover:text-[#009BA1] rounded transition-colors" title="View">
                                                        <Eye size={14} />
                                                    </button>
                                                    {hasPermission('LEAD', 'update') && (
                                                        <button onClick={() => handleEditLead(lead)} className="p-1 text-slate-400 hover:text-[#009BA1] rounded transition-colors" title="Edit">
                                                            <Edit size={14} />
                                                        </button>
                                                    )}
                                                    {hasPermission('LEAD', 'delete') && (
                                                        <button onClick={() => handleDeleteLead(lead.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors" title="Delete">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center text-slate-500 text-xs">
                                        No leads found.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination Bar */}
                        {!loading && !error && (
                            <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-white border-t border-[#E3EAF2] gap-3">
                                <div className="flex items-center gap-3">
                                    <p className="text-xs text-[#667085] font-normal">
                                        Showing <span className="font-normal text-[#667085]">{totalElements > 0 ? currentPage * pageSize + 1 : 0}</span> to <span className="font-normal text-[#667085]">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> of <span className="font-normal text-[#667085]">{totalElements}</span> leads
                                    </p>

                                    {/* Page Size Select attached to table */}
                                    <div className="relative">
                                        <select
                                            value={pageSize}
                                            onChange={handlePageSizeChange}
                                            className="appearance-none bg-white border border-[#E3EAF2] rounded-lg text-xs font-semibold py-1 pl-2.5 pr-6 text-[#092036] hover:border-slate-300 focus:outline-none cursor-pointer transition-all h-7"
                                        >
                                            <option value={10}>10 / Page</option>
                                            <option value={20}>20 / Page</option>
                                            <option value={50}>50 / Page</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Previous Button ‹ */}
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E3EAF2] bg-white text-[#667085] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer text-base font-normal"
                                    >
                                        ‹
                                    </button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1.5">
                                        {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
                                            let pageNum = i;
                                            if (totalPages > 5 && currentPage > 2) {
                                                pageNum = currentPage - 2 + i;
                                                if (pageNum >= totalPages) pageNum = totalPages - 5 + i;
                                            }
                                            if (pageNum < 0) pageNum = i;

                                            const isActive = currentPage === pageNum;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all cursor-pointer font-normal ${
                                                        isActive
                                                            ? 'bg-[#009BA1] text-white'
                                                            : 'bg-white text-[#092036] border border-[#E3EAF2] hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {pageNum + 1}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Next Button › */}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === (totalPages - 1) || totalPages === 0}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E3EAF2] bg-white text-[#092036] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer text-base font-normal"
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* CrmLeadForm Sidebar for Add/Edit */}
            <AnimatePresence>
                {isFormSidebarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsFormSidebarOpen(false)} />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-card border-l border-border shadow-2xl z-50 overflow-hidden"
                        >
                            <CrmLeadForm item={editingLead} onSave={handleSaveLead} onCancel={() => setIsFormSidebarOpen(false)} loading={formLoading} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isBulkUploadOpen && (
                    <CrmLeadBulkUploadModal
                        isOpen={isBulkUploadOpen}
                        onClose={() => setIsBulkUploadOpen(false)}
                        onUploadSuccess={() => fetchLeads()}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isBulkAssignOpen && (
                    <BulkAssignOwnerModal
                        isOpen={isBulkAssignOpen}
                        onClose={() => setIsBulkAssignOpen(false)}
                        selectedCount={selectedLeads.size}
                        employees={employees}
                        onConfirm={handleBulkAssignOwner}
                        loading={bulkAssignLoading}
                    />
                )}
            </AnimatePresence>

        </div>
    );
};

export default LeadDetails;