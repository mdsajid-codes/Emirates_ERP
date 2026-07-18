import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { 
    Loader, Search, Edit, Trash2, PlusCircle, X, ChevronLeft, ChevronRight, AlertCircle, 
    Plus, Download, CheckSquare, User, Share2, RotateCcw, Settings, Grid, Users, LayoutGrid, Table,
    Square, CheckSquare as CheckSquareIcon, Upload, FileSpreadsheet, UserCog
} from 'lucide-react';
import CrmLeadForm from '../components/CrmLeadForm';
import CrmLeadBulkUploadModal from '../components/CrmLeadBulkUploadModal';
import BulkAssignOwnerModal from '../components/BulkAssignOwnerModal';
import { useNavigate } from 'react-router-dom';
import { useCrmPermissions } from '../context/CrmPermissionsContext';


const API_URL = import.meta.env.VITE_API_BASE_URL;

const LeadDetails = ({ onClose }) => {
    const { hasPermission } = useCrmPermissions();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0); // 0-indexed for Spring Pageable
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [ownerFilter, setOwnerFilter] = useState('');
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
    const navigate = useNavigate();

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
                    sort: 'createdAt,desc',
                    q: debouncedSearch || undefined,
                    status: statusFilter || undefined,
                    ownerId: ownerFilter || undefined,
                    period: periodFilter || undefined
                }
            });
            setLeads(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
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

    const handleExportSelected = async () => {
        if (selectedLeads.size === 0) {
            alert("Please select at least one lead to export.");
            return;
        }
        try {
            const ids = Array.from(selectedLeads).join(',');
            const response = await axios.get(`${API_URL}/crm/leads/export?ids=${ids}`, {
                headers: authHeaders,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'leads_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to export leads.");
        }
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
        setEditingLead(lead);
        setIsFormSidebarOpen(true);
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
        <div className="flex flex-col h-screen bg-background text-foreground relative">
            {/* Header */}
            <header className="flex flex-col p-6 border-b border-border bg-card sticky top-0 z-20 gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/crm-dashboard/leads')} className="p-2 rounded-full hover:bg-background-muted transition-colors">
                            <ChevronLeft className="h-5 w-5 text-foreground-muted" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">All Leads</h2>
                            <p className="text-xs text-foreground-muted">Manage and track your lead pipeline</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="bg-background border border-border rounded-theme text-sm py-2 px-3 focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                            <option value={10}>10 / Page</option>
                            <option value={20}>20 / Page</option>
                            <option value={50}>50 / Page</option>
                        </select>
                        
                        {/* Team/Self Toggle & Integrated Horizontal Toolbar */}
                        <div className="flex items-center gap-3">
                            <div className="flex bg-background border border-border rounded-lg p-1 shadow-sm">
                                <button
                                    onClick={() => setFilterType('Team')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === 'Team' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:bg-background-muted'}`}
                                >
                                    Team
                                </button>
                                <button
                                    onClick={() => setFilterType('Self')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === 'Self' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:bg-background-muted'}`}
                                >
                                    Self
                                </button>
                            </div>

                            <div className="flex items-center bg-background border border-border rounded-lg p-1 shadow-sm gap-0.5">
                                {hasPermission('LEAD', 'create') && (
                                    <button 
                                        onClick={() => { setEditingLead(null); setIsFormSidebarOpen(true); }}
                                        className="p-2 bg-primary text-primary-foreground rounded-md shadow-sm hover:scale-105 transition-all group relative"
                                        title="Add Lead"
                                    >
                                        <Plus size={18} />
                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Add Lead</span>
                                    </button>
                                )}
                                
                                {hasPermission('LEAD', 'export') && (
                                    <button 
                                        onClick={handleExportSelected}
                                        className={`p-2 rounded-md transition-all group relative ${selectedLeads.size > 0 ? 'bg-success text-white shadow-sm' : 'hover:bg-background-muted text-foreground-muted opacity-50'}`}
                                        title="Download Selected"
                                    >
                                        <Download size={18} />
                                        {selectedLeads.size > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-error text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                                {selectedLeads.size}
                                            </span>
                                        )}
                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Download CSV</span>
                                    </button>
                                )}

                                {hasPermission('LEAD', 'changeOwner') && (
                                    <button 
                                        onClick={() => {
                                            if (selectedLeads.size > 0) setIsBulkAssignOpen(true);
                                        }}
                                        className={`p-2 rounded-md transition-all group relative ${selectedLeads.size > 0 ? 'bg-primary text-white shadow-sm' : 'hover:bg-background-muted text-foreground-muted opacity-50'}`}
                                        title={selectedLeads.size > 0 ? "Assign Owner" : "Select leads to assign owner"}
                                    >
                                        <UserCog size={18} />
                                        {selectedLeads.size > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-error text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                                {selectedLeads.size}
                                            </span>
                                        )}
                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Assign Owner</span>
                                    </button>
                                )}

                                {hasPermission('LEAD', 'delete') && (
                                    <button 
                                        onClick={handleBulkDelete}
                                        className={`p-2 rounded-md transition-all group relative ${selectedLeads.size > 0 ? 'bg-error text-white shadow-sm' : 'hover:bg-background-muted text-foreground-muted opacity-50'}`}
                                        title={selectedLeads.size > 0 ? "Delete Selected" : "Select leads to delete"}
                                    >
                                        <Trash2 size={18} />
                                        {selectedLeads.size > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                                {selectedLeads.size}
                                            </span>
                                        )}
                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Delete Selected</span>
                                    </button>
                                )}

                                {hasPermission('LEAD', 'import') && (
                                    <>
                                        <button 
                                            onClick={handleDownloadTemplate}
                                            className="p-2 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-md transition-all group relative"
                                            title="Download Excel Template"
                                        >
                                            <FileSpreadsheet size={18} />
                                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Download Excel Template</span>
                                        </button>

                                        <button 
                                            onClick={() => setIsBulkUploadOpen(true)}
                                            className="p-2 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-md transition-all group relative"
                                            title="Bulk Upload Leads"
                                        >
                                            <Upload size={18} />
                                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Bulk Upload Leads</span>
                                        </button>
                                    </>
                                )}

                                <div className="w-px h-6 bg-border mx-1" />

                                <button className="p-2 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-md transition-all group relative">
                                    <User size={18} />
                                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Owner</span>
                                </button>

                                <button className="p-2 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-md transition-all group relative">
                                    <Share2 size={18} />
                                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Share</span>
                                </button>

                                <button onClick={() => fetchLeads()} className="p-2 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-md transition-all group relative">
                                    <RotateCcw size={18} />
                                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Refresh</span>
                                </button>

                                <button className="p-2 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-md transition-all group relative">
                                    <Settings size={18} />
                                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Settings</span>
                                </button>

                                <div className="w-px h-6 bg-border mx-1" />

                                <button className="p-2 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-md transition-all group relative">
                                    <Grid size={18} />
                                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Layout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 sm:flex-none sm:w-64">
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                    </div>

                    <select
                        value={periodFilter}
                        onChange={(e) => { setPeriodFilter(e.target.value); setCurrentPage(0); }}
                        className="bg-background border border-border rounded-theme text-sm py-2 px-3 focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                        <option value="ALL">All Time</option>
                        <option value="TODAY">Today</option>
                        <option value="WEEK">This Week</option>
                        <option value="MONTH">This Month</option>
                        <option value="YEAR">This Year</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
                        className="bg-background border border-border rounded-theme text-sm py-2 px-3 focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="NEW">New</option>
                        <option value="ACTIVE">Active</option>
                        <option value="LOST">Lost</option>
                        <option value="PENDING">Pending</option>
                        <option value="DUPLICATE">Duplicate</option>
                        <option value="JUNK">Junk</option>
                    </select>

                    <select
                        value={ownerFilter}
                        onChange={(e) => { setOwnerFilter(e.target.value); setCurrentPage(0); }}
                        className="bg-background border border-border rounded-theme text-sm py-2 px-3 focus:ring-2 focus:ring-primary/20 outline-none max-w-[200px]"
                    >
                        <option value="">All Owners</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                                {emp.firstName} {emp.lastName}
                            </option>
                        ))}
                    </select>

                    {hasActiveFilters && (
                        <button 
                            onClick={clearFilters}
                            className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors px-2"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader className="animate-spin h-10 w-10 text-primary" />
                    </div>
                ) : error ? (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-background-muted/50 border-b border-border">
                                        <th className="px-4 py-4 text-center">
                                            <button onClick={toggleSelectAll} className="p-1 rounded hover:bg-black/5 transition-colors">
                                                {selectedLeads.size === leads.length && leads.length > 0 ? (
                                                    <CheckSquareIcon className="h-4 w-4 text-primary" />
                                                ) : (
                                                    <Square className="h-4 w-4 text-foreground-muted" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-4 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">S.No.</th>
                                        <th className="px-4 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Lead No.</th>
                                        <th className="px-4 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Company</th>
                                        <th className="px-4 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Email</th>
                                        <th className="px-4 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Phone</th>
                                        <th className="px-4 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Stage</th>
                                        <th className="px-4 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Source</th>
                                        <th className="px-4 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Owner</th>
                                        <th className="px-4 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {leads.length > 0 ? (
                                        leads.map((lead, index) => (
                                            <tr key={lead.id} className="hover:bg-background-muted/30 transition-colors group">
                                                <td className="px-4 py-4 text-center">
                                                    <button onClick={() => toggleSelectLead(lead.id)} className="p-1 rounded hover:bg-black/5 transition-colors">
                                                        {selectedLeads.has(lead.id) ? (
                                                            <CheckSquareIcon className="h-4 w-4 text-primary" />
                                                        ) : (
                                                            <Square className="h-4 w-4 text-foreground-muted" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-foreground-muted">{currentPage * pageSize + index + 1}</td>
                                                <td className="px-4 py-4 text-sm font-medium">
                                                    <button onClick={() => handleViewLead(lead)} className="text-primary hover:underline decoration-primary/30 underline-offset-4">{lead.firstName} {lead.lastName}</button>
                                                </td>
                                                <td className="px-4 py-4 text-sm">
                                                    <span className="bg-background-muted px-2 py-1 rounded-theme text-xs font-mono text-foreground-muted border border-border">
                                                        {lead.leadNo || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-foreground truncate max-w-[150px]">{lead.companyName || 'N/A'}</td>
                                                <td className="px-4 py-4 text-sm text-foreground-muted">{lead.email}</td>
                                                <td className="px-4 py-4 text-sm text-foreground-muted">{lead.phone || 'N/A'}</td>
                                                <td className="px-4 py-4 text-sm">
                                                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-theme text-xs font-medium">
                                                        {lead.currentStageName || 'New'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-foreground-muted">{lead.leadSourceName || 'N/A'}</td>
                                                <td className="px-4 py-4 text-sm text-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-background-muted flex items-center justify-center text-[10px] font-bold text-primary">
                                                            {lead.ownerName ? lead.ownerName.charAt(0) : 'U'}
                                                        </div>
                                                        <span className="truncate max-w-[100px]">{lead.ownerName || 'Unassigned'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm">
                                                    <span className={`px-2 py-1 rounded-theme text-xs font-medium ${
                                                        lead.status === 'ACTIVE' ? 'bg-success/10 text-success' : 
                                                        lead.status === 'LOST' ? 'bg-error/10 text-error' : 'bg-background-muted text-foreground-muted'
                                                    }`}>
                                                        {lead.status || 'NEW'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm">
                                                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {hasPermission('LEAD', 'update') && (
                                                            <button onClick={() => handleEditLead(lead)} className="p-2 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-theme transition-colors"><Edit size={16} /></button>
                                                        )}
                                                        {hasPermission('LEAD', 'delete') && (
                                                            <button onClick={() => handleDeleteLead(lead.id)} className="p-2 text-foreground-muted hover:text-error hover:bg-error/10 rounded-theme transition-colors"><Trash2 size={16} /></button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="11" className="text-center py-20 bg-card">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-background-muted rounded-full flex items-center justify-center mb-4">
                                                        <Search className="h-8 w-8 text-foreground-muted/50" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-foreground">No leads found</h3>
                                                    <p className="text-foreground-muted text-sm mt-1">Try adjusting your filters or search term.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Pagination */}
            {!loading && !error && totalPages > 0 && (
                <footer className="flex flex-col sm:flex-row justify-between items-center p-6 bg-card border-t border-border gap-4">
                    <p className="text-sm text-foreground-muted font-medium">
                        Showing <span className="text-foreground">{Math.min(currentPage * pageSize + 1, totalElements)}</span> - <span className="text-foreground">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> of <span className="text-foreground">{totalElements}</span> leads
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="p-2 rounded-theme border border-border bg-background text-foreground-muted hover:bg-background-muted disabled:opacity-50 transition-all mr-2"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Simple pagination logic to show current + neighbors if many pages
                                let pageNum = i;
                                if (totalPages > 5 && currentPage > 2) {
                                    pageNum = currentPage - 2 + i;
                                    if (pageNum >= totalPages) pageNum = totalPages - 5 + i;
                                }
                                if (pageNum < 0) pageNum = i;
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`w-9 h-9 rounded-theme text-sm font-bold transition-all ${
                                            currentPage === pageNum ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'bg-background hover:bg-background-muted text-foreground-muted'
                                        }`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages - 1}
                            className="p-2 rounded-theme border border-border bg-background text-foreground-muted hover:bg-background-muted disabled:opacity-50 transition-all ml-2"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </footer>
            )}

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