
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit2, Trash2, Loader2, Search, ChevronLeft, ChevronRight, Eye, Calendar, RefreshCw, Filter, List } from 'lucide-react';
import FollowUpModal from '../components/FollowUpModal';
import FollowUpHistoryModal from '../components/FollowUpHistoryModal';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getStatusBadge = (status) => {
    const s = (status || 'DRAFT').toUpperCase();
    switch (s) {
        case 'DRAFT':
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F4F7FC] text-[#617198]">DRAFT</span>;
        case 'SENT':
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E7F1FF] text-[#1263E9]">SENT</span>;
        case 'APPROVED':
        case 'ACCEPTED':
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E0F5EB] text-[#00862E]">APPROVED</span>;
        case 'PENDING':
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFF3E5] text-[#FF8800]">PENDING</span>;
        case 'REJECTED':
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FDE8E8] text-[#D03D4E]">REJECTED</span>;
        default:
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F4F7FC] text-[#617198]">{s}</span>;
    }
};

const Quotation = () => {
    const navigate = useNavigate();
    const { t, isRTL } = useLanguage();
    const [quotations, setQuotations] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Follow Up Modals State
    const [showFollowUp, setShowFollowUp] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedQuotationId, setSelectedQuotationId] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        companyName: '',
        customerName: '',
        fromDate: '',
        toDate: '',
        type: 'All',
        status: 'All',
        teamMember: ''
    });

    const [tableSearch, setTableSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/employees/all`, authHeaders);
            setEmployees(response.data || []);
        } catch (err) {
            console.error("Failed to fetch employees", err);
        }
    }, [authHeaders]);

    const fetchQuotations = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                customerName: filters.customerName || undefined,
                startDate: filters.fromDate || undefined,
                endDate: filters.toDate || undefined,
                status: filters.status !== 'All' ? filters.status : undefined,
                quotationType: filters.type !== 'All' ? filters.type : undefined,
                salespersonId: filters.teamMember || undefined
            };
            const response = await axios.get(`${API_URL}/sales/quotations`, { params, ...authHeaders });
            let fetchedQuotations = response.data.content || response.data || [];

            // Extract unique customer IDs
            const customerIds = [...new Set(fetchedQuotations.map(q => q.customerId).filter(Boolean))];

            // Fetch party details for each customer ID
            let partyMap = {};
            if (customerIds.length > 0) {
                const partyPromises = customerIds.map(id =>
                    axios.get(`${API_URL}/parties/${id}`, authHeaders)
                        .then(res => ({ id, data: res.data }))
                        .catch(() => ({ id, data: null }))
                );

                const parties = await Promise.all(partyPromises);
                partyMap = parties.reduce((acc, curr) => {
                    if (curr.data) acc[curr.id] = curr.data;
                    return acc;
                }, {});
            }

            // Fetch Follow Ups for each quotation to get the latest date
            const followUpPromises = fetchedQuotations.map(q =>
                axios.get(`${API_URL}/sales/followups/by-quotation/${q.id}`, authHeaders)
                    .then(res => {
                        const history = res.data || [];
                        if (history.length > 0) {
                            const latest = history.sort((a, b) => b.id - a.id)[0];
                            return { id: q.id, nextFollowupDate: latest.nextFollowupDate, hasHistory: true };
                        }
                        return { id: q.id, nextFollowupDate: null, hasHistory: false };
                    })
                    .catch(() => ({ id: q.id, nextFollowupDate: null, hasHistory: false }))
            );

            const followUpResults = await Promise.all(followUpPromises);
            const followUpMap = followUpResults.reduce((acc, curr) => {
                acc[curr.id] = curr;
                return acc;
            }, {});

            // Merge details into quotations
            fetchedQuotations = fetchedQuotations.map(q => ({
                ...q,
                customerParty: partyMap[q.customerId] || q.customerParty,
                nextFollowupDate: followUpMap[q.id]?.nextFollowupDate || null,
                hasHistory: followUpMap[q.id]?.hasHistory || false
            }));

            setQuotations(fetchedQuotations);
            setTotalPages(response.data.totalPages || 1);
            setTotalElements(response.data.totalElements || fetchedQuotations.length);
            setError(null);
        } catch (err) {
            setError('Failed to fetch quotations. Please try again.');
            console.error('Error fetching quotations:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters, authHeaders]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchQuotations();
        }, 300);
        return () => clearTimeout(handler);
    }, [fetchQuotations]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(0);
    };

    const handleReset = () => {
        setFilters({
            companyName: '',
            customerName: '',
            fromDate: '',
            toDate: '',
            type: 'All',
            status: 'All',
            teamMember: ''
        });
        setTableSearch('');
        setCurrentPage(0);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this quotation?')) {
            try {
                await axios.delete(`${API_URL}/sales/quotations/${id}`, authHeaders);
                fetchQuotations();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete quotation.'}`);
            }
        }
    };

    const handleView = (id) => {
        navigate(`/sales-dashboard/quotations/${id}`);
    };

    const openFollowUp = (id) => {
        setSelectedQuotationId(id);
        setShowFollowUp(true);
    };

    const openHistory = (id) => {
        setSelectedQuotationId(id);
        setShowHistory(true);
    };

    // Client-side quick table filter
    const filteredQuotations = useMemo(() => {
        if (!tableSearch) return quotations;
        const q = tableSearch.toLowerCase();
        return quotations.filter(item =>
            (item.quotationNumber && item.quotationNumber.toLowerCase().includes(q)) ||
            (item.customerParty?.companyName && item.customerParty.companyName.toLowerCase().includes(q)) ||
            (item.customerParty?.primaryContactPerson && item.customerParty.primaryContactPerson.toLowerCase().includes(q)) ||
            (item.customerName && item.customerName.toLowerCase().includes(q))
        );
    }, [quotations, tableSearch]);

    return (
        <div className="space-y-2 bg-background min-h-screen text-foreground font-sans w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex justify-between items-center mb-1">
                <div>
                    <h1 className="text-lg font-bold text-foreground leading-tight">{t('quotation.title')}</h1>
                    <div className="text-[11px] text-foreground-muted flex items-center gap-1 mt-0.5">
                        <span>{t('dashboard.breadcrumb.home')}</span> &gt; <span>{t('nav.sales')}</span> &gt; <span className="text-foreground font-medium">{t('quotation.title')}</span>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/sales-dashboard/quotations/new')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                    <Plus size={14} /> {t('quotation.newBtn')}
                </button>
            </div>

            {/* Filter Section Card */}
            <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
                {/* Filter Inputs Grid + Buttons Inline */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2 items-end">
                    {/* Company Name */}
                    <div className="lg:col-span-1">
                        <label className="block text-[10px] font-semibold text-foreground mb-1 truncate">{t('quotation.companyName')}</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="companyName"
                                placeholder={t('quotation.searchCompany')}
                                value={filters.companyName}
                                onChange={handleFilterChange}
                                className={`w-full h-7 text-[10px] bg-background border border-border rounded px-2 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary ${isRTL ? 'pl-6' : 'pr-6'}`}
                            />
                            <Search size={11} className={`absolute top-2 text-foreground-muted ${isRTL ? 'left-2' : 'right-2'}`} />
                        </div>
                    </div>

                    {/* Customer Name */}
                    <div className="lg:col-span-1">
                        <label className="block text-[10px] font-semibold text-foreground mb-1 truncate">{t('quotation.customerName')}</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="customerName"
                                placeholder={t('quotation.searchCustomer')}
                                value={filters.customerName}
                                onChange={handleFilterChange}
                                className={`w-full h-7 text-[10px] bg-background border border-border rounded px-2 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary ${isRTL ? 'pl-6' : 'pr-6'}`}
                            />
                            <Search size={11} className={`absolute top-2 text-foreground-muted ${isRTL ? 'left-2' : 'right-2'}`} />
                        </div>
                    </div>

                    {/* From Date */}
                    <div className="lg:col-span-1">
                        <label className="block text-[10px] font-semibold text-foreground mb-1 truncate">{t('quotation.fromDate')}</label>
                        <div className="relative">
                            <input
                                type="date"
                                name="fromDate"
                                value={filters.fromDate}
                                onChange={handleFilterChange}
                                className={`w-full h-7 text-[10px] bg-background border border-border rounded px-2 text-foreground focus:outline-none focus:border-primary ${isRTL ? 'pl-6' : 'pr-6'}`}
                            />
                            <Calendar size={11} className={`absolute top-2 text-foreground-muted pointer-events-none ${isRTL ? 'left-2' : 'right-2'}`} />
                        </div>
                    </div>

                    {/* To Date */}
                    <div className="lg:col-span-1">
                        <label className="block text-[10px] font-semibold text-foreground mb-1 truncate">{t('quotation.toDate')}</label>
                        <div className="relative">
                            <input
                                type="date"
                                name="toDate"
                                value={filters.toDate}
                                onChange={handleFilterChange}
                                className={`w-full h-7 text-[10px] bg-background border border-border rounded px-2 text-foreground focus:outline-none focus:border-primary ${isRTL ? 'pl-6' : 'pr-6'}`}
                            />
                            <Calendar size={11} className={`absolute top-2 text-foreground-muted pointer-events-none ${isRTL ? 'left-2' : 'right-2'}`} />
                        </div>
                    </div>

                    {/* Type */}
                    <div className="lg:col-span-1">
                        <label className="block text-[10px] font-semibold text-foreground mb-1 truncate">{t('quotation.type')}</label>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="w-full h-7 text-[10px] bg-card border border-border rounded px-1.5 text-foreground focus:outline-none focus:border-primary"
                        >
                            <option value="All">All</option>
                            <option value="WITHOUT_DISCOUNT">WITHOUT_DISCOUNT</option>
                            <option value="WITH_DISCOUNT">WITH_DISCOUNT</option>
                            <option value="WITH_DISCOUNT_AT_ITEM_LEVEL">WITH_DISCOUNT_ITEM</option>
                            <option value="WITH_DISCOUNT_AT_ORDER_LEVEL">WITH_DISCOUNT_ORDER</option>
                        </select>
                    </div>

                    {/* Quotation Status */}
                    <div className="lg:col-span-1">
                        <label className="block text-[10px] font-semibold text-foreground mb-1 truncate">{t('quotation.status')}</label>
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="w-full h-7 text-[10px] bg-card border border-border rounded px-1.5 text-foreground focus:outline-none focus:border-primary"
                        >
                            <option value="All">All</option>
                            <option value="DRAFT">Draft</option>
                            <option value="SENT">Sent</option>
                            <option value="APPROVED">Approved</option>
                            <option value="PENDING">Pending</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    {/* Team Members */}
                    <div className="lg:col-span-1">
                        <label className="block text-[10px] font-semibold text-foreground mb-1 truncate">{t('quotation.teamMembers')}</label>
                        <select
                            name="teamMember"
                            value={filters.teamMember}
                            onChange={handleFilterChange}
                            className="w-full h-7 text-[10px] bg-card border border-border rounded px-1.5 text-foreground focus:outline-none focus:border-primary"
                        >
                            <option value="">{t('quotation.selectTeamMember')}</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search and Reset Buttons Inline */}
                    <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-2 flex items-center justify-end gap-1.5">
                        <button
                            onClick={fetchQuotations}
                            className="h-7 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-[10px] font-semibold flex items-center gap-1 transition-colors shadow-sm whitespace-nowrap"
                        >
                            <Search size={11} /> {t('quotation.search')}
                        </button>
                        <button
                            onClick={handleReset}
                            className="h-7 px-3 bg-card border border-border hover:bg-hover text-foreground rounded text-[10px] font-semibold flex items-center gap-1 transition-colors whitespace-nowrap"
                        >
                            <RefreshCw size={10} /> {t('quotation.reset')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Controls (Entries + Search) */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(0);
                        }}
                        className="h-7 text-xs border border-border rounded px-2 bg-card text-foreground font-semibold focus:outline-none"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="text-[10px] text-foreground-muted">{t('quotation.entriesPerPage')}</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('quotation.searchInTable')}
                            value={tableSearch}
                            onChange={(e) => setTableSearch(e.target.value)}
                            className={`w-40 sm:w-48 h-7 text-[10px] border border-border rounded px-3 bg-card text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary ${isRTL ? 'pr-7' : 'pl-7'}`}
                        />
                        <Search size={12} className={`absolute top-2 text-foreground-muted ${isRTL ? 'right-2' : 'left-2'}`} />
                    </div>
                    <button className="w-7 h-7 bg-card border border-border rounded flex items-center justify-center text-foreground-muted hover:text-foreground">
                        <List size={13} />
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-[10px] text-left border-collapse">
                        <thead>
                            <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                <th className="px-3 py-2 border-r border-border w-10">{t('quotation.sno')}</th>
                                <th className="px-3 py-2 border-r border-border">{t('quotation.date')}</th>
                                <th className="px-3 py-2 border-r border-border">{t('quotation.quotationType')}</th>
                                <th className="px-3 py-2 border-r border-border">{t('quotation.followUp')}</th>
                                <th className="px-3 py-2 border-r border-border">{t('quotation.nextFollowupDate')}</th>
                                <th className="px-3 py-2 border-r border-border">{t('quotation.quotationNo')}</th>
                                <th className="px-3 py-2 border-r border-border">{t('quotation.companyName')}</th>
                                <th className="px-3 py-2 border-r border-border">{t('quotation.customerName')}</th>
                                <th className="px-3 py-2 border-r border-border">{t('quotation.contactPersonName')}</th>
                                <th className="px-3 py-2 border-r border-border">{t('quotation.contactPersonNumber')}</th>
                                <th className="px-3 py-2 border-r border-border">{t('quotation.status')}</th>
                                <th className="px-3 py-2 border-r border-border">{t('quotation.amount')}</th>
                                <th className="px-3 py-2 text-center w-24">{t('quotation.action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="13" className="text-center py-10">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="13" className="text-center py-10 text-red-500 font-medium">
                                        {error}
                                    </td>
                                </tr>
                            ) : filteredQuotations.length === 0 ? (
                                <tr>
                                    <td colSpan="13" className="text-center py-10 font-medium text-foreground-muted">
                                        {t('quotation.noData')}
                                    </td>
                                </tr>
                            ) : (
                                filteredQuotations.map((q, index) => (
                                    <tr key={q.id} className="hover:bg-hover text-foreground">
                                        <td className="px-3 py-2 border-r border-border font-normal">{currentPage * pageSize + index + 1}</td>
                                        <td className="px-3 py-2 border-r border-border font-normal">
                                            {q.quotationDate ? new Date(q.quotationDate).toLocaleDateString('en-GB') : '-'}
                                        </td>
                                        <td className="px-3 py-2 border-r border-border font-semibold">
                                            {q.quotationType || 'WITHOUT_DISCOUNT'}
                                        </td>
                                        <td className="px-3 py-2 border-r border-border">
                                            {q.hasHistory ? (
                                                <button
                                                    onClick={() => openHistory(q.id)}
                                                    className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold flex items-center gap-1 text-[9px] hover:bg-primary/20 transition-colors"
                                                >
                                                    <RefreshCw size={9} /> {t('quotation.viewHistory')}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => openFollowUp(q.id)}
                                                    className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 font-semibold flex items-center gap-1 text-[9px] hover:bg-green-500/20 transition-colors"
                                                >
                                                    <RefreshCw size={9} /> {t('quotation.followUp')}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 border-r border-border font-normal">
                                            {q.nextFollowupDate ? new Date(q.nextFollowupDate).toLocaleDateString('en-GB') : '-'}
                                        </td>
                                        <td className="px-3 py-2 border-r border-border">
                                            <span
                                                onClick={() => handleView(q.id)}
                                                className="text-primary font-semibold cursor-pointer hover:underline"
                                            >
                                                {q.quotationNumber || `QT-${q.id}`}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 border-r border-border font-normal">
                                            {q.customerParty?.companyName || q.companyName || 'Aaryan'}
                                        </td>
                                        <td className="px-3 py-2 border-r border-border font-normal">
                                            {q.customerParty?.primaryContactPerson || q.customerName || 'Aaryan'}
                                        </td>
                                        <td className="px-3 py-2 border-r border-border font-normal">
                                            {q.customerParty?.primaryContactPerson || 'N/A'}
                                        </td>
                                        <td className="px-3 py-2 border-r border-border font-normal">
                                            {q.customerParty?.mobile || q.customerParty?.contactPhone || 'N/A'}
                                        </td>
                                        <td className="px-3 py-2 border-r border-border">
                                            {getStatusBadge(q.status)}
                                        </td>
                                        <td className="px-3 py-2 border-r border-border font-bold">
                                            AED {Number(q.netTotal || q.grandTotal || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleView(q.id)}
                                                    className="w-5 h-5 rounded border border-border flex items-center justify-center text-green-600 hover:bg-green-500/10"
                                                    title="View"
                                                >
                                                    <Eye size={10} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/sales-dashboard/quotations/edit/${q.id}`)}
                                                    className="w-5 h-5 rounded border border-border flex items-center justify-center text-primary hover:bg-primary/10"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={10} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(q.id)}
                                                    className="w-5 h-5 rounded border border-border flex items-center justify-center text-red-600 hover:bg-red-500/10"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {!loading && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-1 text-xs">
                    <div className="text-[10px] text-foreground-muted">
                        {t('quotation.showing')} {filteredQuotations.length === 0 ? 0 : currentPage * pageSize + 1} {t('quotation.to')} {Math.min((currentPage + 1) * pageSize, totalElements || filteredQuotations.length)} {t('quotation.of')} {totalElements || filteredQuotations.length} {t('quotation.entries')}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                            className="w-7 h-7 rounded border border-border bg-card flex items-center justify-center text-foreground-muted hover:text-foreground disabled:opacity-40"
                        >
                            <ChevronLeft size={14} className={isRTL ? 'rotate-180' : ''} />
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i)}
                                className={`w-7 h-7 rounded font-semibold text-[11px] ${currentPage === i ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-hover'}`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={currentPage >= totalPages - 1}
                            className="w-7 h-7 rounded border border-border bg-card flex items-center justify-center text-foreground-muted hover:text-foreground disabled:opacity-40"
                        >
                            <ChevronRight size={14} className={isRTL ? 'rotate-180' : ''} />
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <FollowUpModal
                isOpen={showFollowUp}
                onClose={() => setShowFollowUp(false)}
                quotationId={selectedQuotationId}
                onSuccess={fetchQuotations}
            />
            <FollowUpHistoryModal
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                quotationId={selectedQuotationId}
            />
        </div>
    );
};

export default Quotation;


