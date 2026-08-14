import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader2, Search, FileText, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ProformaInvoice = () => {
    const navigate = useNavigate();
    const { isRTL, t } = useLanguage();
    const [invoices, setInvoices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        customerName: '',
        fromDate: '',
        toDate: '',
        status: 'All',
        teamMember: ''
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/employees/all`, authHeaders);
            setEmployees(response.data || []);
        } catch (err) {
            console.error("Failed to fetch employees", err);
        }
    }, [authHeaders]);

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                search: filters.customerName || undefined,
                fromDate: filters.fromDate || undefined,
                toDate: filters.toDate || undefined,
                salespersonId: filters.teamMember || undefined
            };
            const response = await axios.get(`${API_URL}/sales/proforma-invoices`, { params, ...authHeaders });
            setInvoices(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            setError(null);
        } catch (err) {
            setError('Failed to fetch proforma invoices. Please try again.');
            console.error("Error fetching proforma invoices:", err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters, authHeaders]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this proforma invoice?')) {
            try {
                await axios.delete(`${API_URL}/sales/proforma-invoices/${id}`, authHeaders);
                fetchInvoices();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete invoice.'}`);
            }
        }
    };

    const handleView = (id) => {
        navigate(`/sales-dashboard/proforma-invoices/${id}`);
    };

    return (
        <div className="space-y-2 bg-background min-h-screen text-foreground font-sans w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Section matching Quotation.jsx */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <FileText size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">
                            {isRTL ? 'الفواتير الأولية' : 'Proforma Invoices'}
                        </h1>
                        <div className="text-[10px] text-foreground-muted flex items-center gap-1 leading-none mt-0.5">
                            <span>{t('dashboard.breadcrumb.home')}</span> &gt; <span>{t('nav.sales')}</span> &gt; <span className="text-foreground font-medium">{isRTL ? 'الفواتير الأولية' : 'Proforma Invoices'}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/sales-dashboard/proforma-invoices/new')}
                    className="px-3.5 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs self-end sm:self-auto"
                >
                    <Plus size={12} /> {isRTL ? '+ فاتورة أولية جديدة' : '+ New Proforma Invoice'}
                </button>
            </div>

            {/* Filter Section Card */}
            <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 items-end">
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('rentalReceived.customerName')}</label>
                        <input
                            type="text"
                            name="customerName"
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                            placeholder={t('quotation.searchCustomer')}
                            value={filters.customerName}
                            onChange={(e) => setFilters(prev => ({ ...prev, customerName: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('quotation.fromDate')}</label>
                        <input
                            type="date"
                            name="fromDate"
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            value={filters.fromDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('quotation.toDate')}</label>
                        <input
                            type="date"
                            name="toDate"
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            value={filters.toDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.salesperson')}</label>
                        <select
                            name="teamMember"
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            value={filters.teamMember}
                            onChange={(e) => setFilters(prev => ({ ...prev, teamMember: e.target.value }))}
                        >
                            <option value="">{t('qform.selectSalesperson')}</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button
                            onClick={fetchInvoices}
                            className="w-full h-7 bg-primary text-primary-foreground hover:bg-primary/90 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                        >
                            <Search size={12} /> {t('quotation.search')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                <div className="flex justify-between items-center text-[11px] text-foreground-muted pb-1 border-b border-border">
                    <div className="flex items-center gap-1.5">
                        <span>Show</span>
                        <select
                            className="h-6 text-[10px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary"
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                    </div>
                </div>

                <div className="rounded border border-border overflow-x-auto">
                    <table className="w-full text-[10px] text-start border-collapse">
                        <thead>
                            <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                <th className="px-2 py-1.5 border-r border-border w-8 text-center">{isRTL ? 'م' : 'S.No.'}</th>
                                <th className="px-2 py-1.5 border-r border-border">{isRTL ? 'التاريخ' : 'Date'}</th>
                                <th className="px-2 py-1.5 border-r border-border">{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                                <th className="px-2 py-1.5 border-r border-border">{isRTL ? 'رقم الفاتورة' : 'Invoice Number'}</th>
                                <th className="px-2 py-1.5 border-r border-border">{isRTL ? 'المرجع' : 'Reference'}</th>
                                <th className="px-2 py-1.5 border-r border-border">{isRTL ? 'اسم العميل' : 'Customer Name'}</th>
                                <th className="px-2 py-1.5 border-r border-border text-center">{isRTL ? 'الحالة' : 'Status'}</th>
                                <th className="px-2 py-1.5 border-r border-border text-end">{isRTL ? 'المبلغ' : 'Amount'}</th>
                                <th className="px-2 py-1.5 text-center w-16">{isRTL ? 'الإجراء' : 'Action'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="py-8 text-center text-foreground-muted">
                                        <Loader2 className="animate-spin h-5 w-5 mx-auto text-primary" />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="9" className="py-8 text-center text-rose-500 font-medium">{error}</td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-8 text-center text-foreground-muted font-medium">
                                        {t('quotation.noRecord')}
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((inv, index) => (
                                    <tr key={inv.id} className="hover:bg-hover transition-colors text-foreground">
                                        <td className="px-2 py-1 border-r border-border text-center text-foreground-muted">
                                            {currentPage * pageSize + index + 1}
                                        </td>
                                        <td className="px-2 py-1 border-r border-border whitespace-nowrap">
                                            {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-2 py-1 border-r border-border whitespace-nowrap">
                                            {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-2 py-1 border-r border-border font-bold">
                                            <button
                                                onClick={() => handleView(inv.id)}
                                                className="text-primary hover:underline"
                                            >
                                                {typeof inv.invoiceNumber === 'string' ? inv.invoiceNumber : `PI-${inv.id}`}
                                            </button>
                                        </td>
                                        <td className="px-2 py-1 border-r border-border">
                                            {typeof inv.reference === 'string' ? inv.reference : '-'}
                                        </td>
                                        <td className="px-2 py-1 border-r border-border font-medium">
                                            {typeof inv.customerName === 'string' ? inv.customerName : 'N/A'}
                                        </td>
                                        <td className="px-2 py-1 border-r border-border text-center">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold text-white ${inv.status === 'ACCEPTED' || inv.status === 'PAID' ? 'bg-emerald-600' : inv.status === 'SENT' || inv.status === 'OPEN' ? 'bg-blue-500' : inv.status === 'REJECTED' ? 'bg-rose-600' : 'bg-slate-400'}`}>
                                                {typeof inv.status === 'string' ? inv.status : 'DRAFT'}
                                            </span>
                                        </td>
                                        <td className="px-2 py-1 border-r border-border text-end font-mono font-semibold">
                                            AED {Number(inv.netTotal || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => navigate(`/sales-dashboard/proforma-invoices/edit/${inv.id}`)}
                                                    className="w-5 h-5 rounded border border-border flex items-center justify-center text-foreground-muted hover:bg-hover hover:text-primary transition-colors"
                                                    title={isRTL ? 'تعديل' : 'Edit'}
                                                >
                                                    <Edit size={11} />
                                                </button>
                                                <button
                                                    onClick={() => handleView(inv.id)}
                                                    className="w-5 h-5 rounded border border-border flex items-center justify-center text-foreground-muted hover:bg-hover hover:text-primary transition-colors"
                                                    title={isRTL ? 'عرض' : 'View'}
                                                >
                                                    <Eye size={11} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(inv.id)}
                                                    className="w-5 h-5 rounded border border-border flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
                                                    title={isRTL ? 'حذف' : 'Delete'}
                                                >
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center pt-1 text-[11px] text-foreground-muted">
                    <div>
                        Showing page <span className="font-semibold text-foreground">{currentPage + 1}</span> of <span className="font-semibold text-foreground">{totalPages || 1}</span>
                    </div>
                    <div className="flex gap-1">
                        <button
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            className="px-2 py-0.5 border border-border bg-card hover:bg-hover rounded disabled:opacity-40 text-foreground"
                        >
                            <ChevronLeft size={12} className={isRTL ? 'rotate-180' : ''} />
                        </button>
                        <button
                            disabled={currentPage >= totalPages - 1}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-2 py-0.5 border border-border bg-card hover:bg-hover rounded disabled:opacity-40 text-foreground"
                        >
                            <ChevronRight size={12} className={isRTL ? 'rotate-180' : ''} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProformaInvoice;
