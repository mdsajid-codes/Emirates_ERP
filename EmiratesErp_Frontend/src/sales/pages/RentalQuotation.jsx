import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit2, Trash2, Loader2, Search, ChevronLeft, ChevronRight, Eye, Calendar, RefreshCw, Filter, List, Monitor } from 'lucide-react';
import FollowUpModal from '../components/FollowUpModal';
import FollowUpHistoryModal from '../components/FollowUpHistoryModal';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getStatusBadge = (status) => {
    const s = (status || 'DRAFT').toUpperCase();
    switch (s) {
        case 'DRAFT':
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400">DRAFT</span>;
        case 'SENT':
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">SENT</span>;
        case 'ACCEPTED':
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">ACCEPTED</span>;
        case 'REJECTED':
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">REJECTED</span>;
        default:
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/10 text-slate-600">{s}</span>;
    }
};

const RentalQuotation = () => {
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

    const fetchQuotations = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const authConfig = { headers: { Authorization: `Bearer ${token}` } };

            const params = {
                page: currentPage,
                size: pageSize,
                customerName: filters.customerName || undefined,
                fromDate: filters.fromDate || undefined,
                toDate: filters.toDate || undefined,
                status: filters.status === 'All' ? undefined : filters.status,
                type: filters.type === 'All' ? undefined : filters.type,
                salespersonId: filters.teamMember || undefined
            };

            const response = await axios.get(`${API_URL}/sales/rental-quotations`, { params, ...authConfig });

            let fetchedQuotations = response.data.content || (Array.isArray(response.data) ? response.data : []);
            const totalPagesInfo = response.data.totalPages || 1;
            const totalElementsInfo = response.data.totalElements || fetchedQuotations.length;

            const customerIds = [...new Set(fetchedQuotations.map(q => q.customerId).filter(Boolean))];

            if (customerIds.length > 0) {
                const partyPromises = customerIds.map(id =>
                    axios.get(`${API_URL}/parties/${id}`, authConfig)
                        .then(res => ({ id, data: res.data }))
                        .catch(() => ({ id, data: null }))
                );

                const parties = await Promise.all(partyPromises);
                const partyMap = parties.reduce((acc, curr) => {
                    if (curr.data) acc[curr.id] = curr.data;
                    return acc;
                }, {});

                fetchedQuotations = fetchedQuotations.map(q => ({
                    ...q,
                    customerParty: partyMap[q.customerId] || q.customerParty
                }));
            }

            setQuotations(fetchedQuotations);
            setTotalPages(totalPagesInfo);
            setTotalElements(totalElementsInfo);
            setError(null);
        } catch (err) {
            console.error('Error fetching rental quotations:', err);
            setError(t('quotation.noData'));
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters, t]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/employees/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEmployees(res.data || []);
            } catch (err) {
                console.error("Failed to fetch employees", err);
            }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchQuotations();
    }, [fetchQuotations]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleReset = () => {
        setFilters({
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
        if (!window.confirm('Delete this rental quotation?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/sales/rental-quotations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchQuotations();
        } catch (err) {
            console.error('Error deleting rental quotation:', err);
            alert('Failed to delete rental quotation');
        }
    };

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
                    <h1 className="text-lg font-bold text-foreground leading-tight">{t('rental.title')}</h1>
                    <div className="text-[11px] text-foreground-muted flex items-center gap-1 mt-0.5">
                        <span>{t('dashboard.breadcrumb.home')}</span> &gt; <span>{t('nav.sales')}</span> &gt; <span className="text-foreground font-medium">{t('rental.title')}</span>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/sales-dashboard/rental-quotations/new')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                    <Plus size={14} /> {t('rental.newBtn')}
                </button>
            </div>

            {/* Filter Section Card */}
            <div className="bg-card border border-border rounded-lg p-3 shadow-2xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 items-end">
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
                            className="w-full h-7 text-[10px] bg-background border border-border rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        >
                            <option value="All">All</option>
                            <option value="WITHOUT_DISCOUNT">{t('qform.withoutDiscount')}</option>
                            <option value="WITH_DISCOUNT_AT_ITEM_LEVEL">{t('qform.discountItem')}</option>
                            <option value="WITH_DISCOUNT_AT_ORDER_LEVEL">{t('qform.discountOrder')}</option>
                        </select>
                    </div>

                    {/* Quotation Status */}
                    <div className="lg:col-span-1">
                        <label className="block text-[10px] font-semibold text-foreground mb-1 truncate">{t('quotation.status')}</label>
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="w-full h-7 text-[10px] bg-background border border-border rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        >
                            <option value="All">All</option>
                            <option value="DRAFT">{t('qform.draft')}</option>
                            <option value="SENT">{t('qform.sent')}</option>
                            <option value="ACCEPTED">{t('qform.accepted')}</option>
                            <option value="REJECTED">{t('qform.rejected')}</option>
                        </select>
                    </div>

                    {/* Team Members */}
                    <div className="lg:col-span-1">
                        <label className="block text-[10px] font-semibold text-foreground mb-1 truncate">{t('quotation.teamMembers')}</label>
                        <select
                            name="teamMember"
                            value={filters.teamMember}
                            onChange={handleFilterChange}
                            className="w-full h-7 text-[10px] bg-background border border-border rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        >
                            <option value="">{t('quotation.selectTeamMember')}</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search & Reset Buttons */}
                    <div className="lg:col-span-2 flex items-center gap-1.5">
                        <button
                            onClick={() => { setCurrentPage(0); fetchQuotations(); }}
                            className="h-7 px-3 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-semibold rounded flex items-center gap-1 transition-colors"
                        >
                            <Search size={11} /> {t('quotation.search')}
                        </button>
                        <button
                            onClick={handleReset}
                            className="h-7 px-3 bg-background hover:bg-hover text-foreground border border-border text-[10px] font-semibold rounded flex items-center gap-1 transition-colors"
                        >
                            <RefreshCw size={11} /> {t('quotation.reset')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Container Card */}
            <div className="bg-card border border-border rounded-lg p-3 shadow-2xs space-y-2">
                {/* Table Header Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-foreground">
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
                            className="h-7 border border-border bg-background rounded px-1.5 text-foreground focus:outline-none focus:border-primary"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="text-foreground-muted">{t('quotation.entriesPerPage')}</span>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder={t('quotation.searchInTable')}
                            value={tableSearch}
                            onChange={(e) => setTableSearch(e.target.value)}
                            className={`w-full h-7 text-[11px] bg-background border border-border rounded px-2 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary ${isRTL ? 'pl-7' : 'pr-7'}`}
                        />
                        <Search size={12} className={`absolute top-2 text-foreground-muted ${isRTL ? 'left-2' : 'right-2'}`} />
                    </div>
                </div>

                {/* Table Data */}
                <div className="rounded border border-border overflow-hidden">
                    <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                            <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                <th className="px-2 py-2 border-r border-border w-10 text-center">{t('quotation.sno')}</th>
                                <th className="px-2 py-2 border-r border-border w-20">{t('quotation.date')}</th>
                                <th className="px-2 py-2 border-r border-border w-24">{t('quotation.status')}</th>
                                <th className="px-2 py-2 border-r border-border w-24 text-center">{t('quotation.followUp')}</th>
                                <th className="px-2 py-2 border-r border-border w-28">{t('quotation.nextFollowupDate')}</th>
                                <th className="px-2 py-2 border-r border-border w-28">{t('quotation.quotationNo')}</th>
                                <th className="px-2 py-2 border-r border-border">{t('quotation.customerName')}</th>
                                <th className="px-2 py-2 border-r border-border w-28">{t('quotation.contactPersonName')}</th>
                                <th className="px-2 py-2 border-r border-border w-28">{t('quotation.contactPersonNumber')}</th>
                                <th className="px-2 py-2 border-r border-border w-20">{t('quotation.status')}</th>
                                <th className="px-2 py-2 border-r border-border w-24 text-right">{t('quotation.amount')}</th>
                                <th className="px-2 py-2 text-center w-20">{t('quotation.action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="12" className="text-center py-8">
                                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                                    </td>
                                </tr>
                            ) : filteredQuotations.length === 0 ? (
                                <tr>
                                    <td colSpan="12" className="text-center py-8 text-foreground-muted font-medium">
                                        {t('quotation.noData')}
                                    </td>
                                </tr>
                            ) : (
                                filteredQuotations.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-hover text-foreground">
                                        <td className="px-2 py-1.5 border-r border-border font-medium text-center">{currentPage * pageSize + index + 1}</td>
                                        <td className="px-2 py-1.5 border-r border-border">{item.quotationDate ? new Date(item.quotationDate).toLocaleDateString() : '-'}</td>
                                        <td className="px-2 py-1.5 border-r border-border">{getStatusBadge(item.status)}</td>
                                        <td className="px-2 py-1.5 border-r border-border text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => { setSelectedQuotationId(item.id); setShowFollowUp(true); }}
                                                    className="px-1.5 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded text-[9px] font-medium transition-colors"
                                                >
                                                    {t('quotation.followUp')}
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedQuotationId(item.id); setShowHistory(true); }}
                                                    className="px-1.5 py-0.5 bg-primary/10 hover:bg-primary/20 text-primary rounded text-[9px] font-medium transition-colors"
                                                >
                                                    {t('quotation.viewHistory')}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1.5 border-r border-border text-foreground-muted">{item.nextFollowupDate ? new Date(item.nextFollowupDate).toLocaleDateString() : '-'}</td>
                                        <td className="px-2 py-1.5 border-r border-border font-medium text-primary hover:underline cursor-pointer" onClick={() => navigate(`/sales-dashboard/rental-quotations/${item.id}`)}>
                                            {item.quotationNumber}
                                        </td>
                                        <td className="px-2 py-1.5 border-r border-border font-medium">{item.customerParty?.companyName || item.customerName || 'N/A'}</td>
                                        <td className="px-2 py-1.5 border-r border-border">{item.customerParty?.primaryContactPerson || '-'}</td>
                                        <td className="px-2 py-1.5 border-r border-border">{item.customerParty?.mobile || '-'}</td>
                                        <td className="px-2 py-1.5 border-r border-border">{getStatusBadge(item.status)}</td>
                                        <td className="px-2 py-1.5 border-r border-border font-bold text-right">AED {item.netTotal?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-2 py-1.5 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => navigate(`/sales-dashboard/rental-quotations/${item.id}`)}
                                                    className="p-1 hover:bg-primary/10 text-primary rounded transition-colors"
                                                    title={t('qview.title')}
                                                >
                                                    <Eye size={13} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/sales-dashboard/rental-quotations/edit/${item.id}`)}
                                                    className="p-1 hover:bg-sky-500/10 text-sky-600 rounded transition-colors"
                                                    title={t('qview.edit')}
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                                <button
                                                    onClick={() => navigate('/sales-dashboard/rental-sales-orders/new', { state: { quotationId: item.id } })}
                                                    className="p-1 hover:bg-emerald-500/10 text-emerald-600 rounded transition-colors"
                                                    title={t('qview.convertToSale')}
                                                >
                                                    <Monitor size={13} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1 hover:bg-rose-500/10 text-rose-600 rounded transition-colors"
                                                    title={t('qview.delete')}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-1 text-[11px] text-foreground-muted">
                    <div>
                        {t('quotation.showing')} {totalElements === 0 ? 0 : currentPage * pageSize + 1} {t('quotation.to')} {Math.min((currentPage + 1) * pageSize, totalElements)} {t('quotation.of')} {totalElements} {t('quotation.entries')}
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                            disabled={currentPage === 0}
                            className="p-1 border border-border rounded bg-background hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed text-foreground"
                        >
                            <ChevronLeft size={13} />
                        </button>
                        <span className="px-2 py-0.5 font-medium text-foreground">{currentPage + 1} / {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                            disabled={currentPage >= totalPages - 1}
                            className="p-1 border border-border rounded bg-background hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed text-foreground"
                        >
                            <ChevronRight size={13} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <FollowUpModal
                isOpen={showFollowUp}
                onClose={() => setShowFollowUp(false)}
                rentalQuotationId={selectedQuotationId}
                onSuccess={fetchQuotations}
            />

            <FollowUpHistoryModal
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                rentalQuotationId={selectedQuotationId}
            />
        </div>
    );
};

export default RentalQuotation;
