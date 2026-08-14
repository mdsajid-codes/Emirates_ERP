import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader2, Search, Eye } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CreditNotes = () => {
    const navigate = useNavigate();
    const { isRTL, t } = useLanguage();
    const [creditNotes, setCreditNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        locationId: ''
    });

    const [locations, setLocations] = useState([]);

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get(`${API_URL}/locations`, authHeaders);
                setLocations(response.data || []);
            } catch (err) {
                console.warn("Failed to fetch locations");
                setLocations([{ id: 1, name: 'HO' }]);
            }
        };
        fetchLocations();
    }, [authHeaders]);

    const fetchCreditNotes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/credit-notes`, authHeaders);
            let data = response.data || [];

            if (filters.fromDate) {
                data = data.filter(item => new Date(item.creditNoteDate) >= new Date(filters.fromDate));
            }
            if (filters.toDate) {
                data = data.filter(item => new Date(item.creditNoteDate) <= new Date(filters.toDate));
            }
            if (filters.locationId) {
                data = data.filter(item => item.locationId === Number(filters.locationId));
            }

            setTotalPages(Math.ceil(data.length / pageSize));
            const startIndex = currentPage * pageSize;
            const paginatedData = data.slice(startIndex, startIndex + pageSize);

            setCreditNotes(paginatedData);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch credit notes", err);
            setError('Failed to fetch data');
            setCreditNotes([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters, authHeaders]);

    useEffect(() => {
        fetchCreditNotes();
    }, [fetchCreditNotes]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(0);
    };

    const handleDelete = async (id) => {
        if (window.confirm(isRTL ? 'هل أنت تأكد من حذف الإشعار الدائن؟' : 'Are you sure you want to delete this credit note?')) {
            try {
                await axios.delete(`${API_URL}/credit-notes/${id}`, authHeaders);
                fetchCreditNotes();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete record.'}`);
            }
        }
    };

    return (
        <div className="bg-background text-foreground font-sans space-y-2 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Top Action Bar Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div>
                    <h1 className="text-sm font-bold text-foreground leading-tight">
                        {isRTL ? 'إدارة الإشعارات الدائنة' : 'Manage Credit Notes'}
                    </h1>
                    <p className="text-[10px] text-foreground-muted leading-none mt-0.5">
                        {isRTL ? 'الرئيسية > لوحة المبيعات > إدارة الإشعارات الدائنة' : 'Home > Sales Dashboard > Manage Credit Notes'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/sales-dashboard/credit-notes/new')}
                    className="px-3.5 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs self-end sm:self-auto"
                >
                    <Plus size={13} /> {isRTL ? 'إشعار دائن جديد' : 'New Credit Note'}
                </button>
            </div>

            {/* Filter Section Card */}
            <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 items-end">
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'من' : 'From'}</label>
                        <input
                            type="date"
                            name="fromDate"
                            value={filters.fromDate}
                            onChange={handleFilterChange}
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'إلى' : 'To'}</label>
                        <input
                            type="date"
                            name="toDate"
                            value={filters.toDate}
                            onChange={handleFilterChange}
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'الموقع' : 'Location'}</label>
                        <select
                            name="locationId"
                            value={filters.locationId}
                            onChange={handleFilterChange}
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        >
                            <option value="">{isRTL ? 'جميع المواقع' : 'All Locations'}</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button
                            onClick={fetchCreditNotes}
                            className="w-full h-7 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                        >
                            <Search size={12} /> {t('quotation.search')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Container Card */}
            <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                <div className="rounded border border-border overflow-x-auto">
                    <table className="w-full text-[11px] text-start border-collapse">
                        <thead>
                            <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                <th className="px-2 py-1.5 border-r border-border w-8 text-center">{isRTL ? 'م' : 'S.No.'}</th>
                                <th className="px-2 py-1.5 border-r border-border min-w-[90px]">{t('qform.quotationDate')}</th>
                                <th className="px-2 py-1.5 border-r border-border min-w-[110px]">{isRTL ? 'رقم الإشعار' : 'Credit Note#'}</th>
                                <th className="px-2 py-1.5 border-r border-border min-w-[110px]">{isRTL ? 'رقم الفاتورة' : 'Invoice No#'}</th>
                                <th className="px-2 py-1.5 border-r border-border min-w-[150px]">{t('qform.customer')}</th>
                                <th className="px-2 py-1.5 border-r border-border w-20 text-center">{t('qform.status')}</th>
                                <th className="px-2 py-1.5 border-r border-border w-24 text-end">{isRTL ? 'المبلغ' : 'Amount'} (AED)</th>
                                <th className="px-2 py-1.5 border-r border-border w-24 text-end">{isRTL ? 'الرصيد المستحق' : 'Balance Due'} (AED)</th>
                                <th className="px-2 py-1.5 text-center w-24">{t('quotation.action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-6">
                                        <Loader2 className="animate-spin h-5 w-5 text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : creditNotes.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-6 text-foreground-muted">
                                        {t('quotation.noRecord')}
                                    </td>
                                </tr>
                            ) : (
                                creditNotes.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-hover transition-colors">
                                        <td className="px-2 py-1.5 border-r border-border text-center text-foreground-muted">{currentPage * pageSize + index + 1}</td>
                                        <td className="px-2 py-1.5 border-r border-border text-foreground-muted">{item.creditNoteDate ? new Date(item.creditNoteDate).toLocaleDateString() : '-'}</td>
                                        <td
                                            className="px-2 py-1.5 border-r border-border font-medium text-primary cursor-pointer hover:underline"
                                            onClick={() => navigate(`/sales-dashboard/credit-notes/${item.id}`)}
                                        >
                                            {item.creditNoteNumber || item.id}
                                        </td>
                                        <td className="px-2 py-1.5 border-r border-border text-foreground-muted">{item.invoiceNumber || '-'}</td>
                                        <td className="px-2 py-1.5 border-r border-border font-semibold text-foreground">{item.customerName}</td>
                                        <td className="px-2 py-1.5 border-r border-border text-center">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                                item.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                                item.status === 'CLOSED' ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                                                'bg-rose-50 text-rose-600 border border-rose-200'
                                            }`}>
                                                {item.status || 'OPEN'}
                                            </span>
                                        </td>
                                        <td className="px-2 py-1.5 border-r border-border text-end font-mono font-bold text-foreground">AED {Number(item.amount || 0).toFixed(2)}</td>
                                        <td className="px-2 py-1.5 border-r border-border text-end font-mono text-foreground-muted">AED {Number(item.balanceDue || 0).toFixed(2)}</td>
                                        <td className="px-2 py-1.5 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => navigate(`/sales-dashboard/credit-notes/${item.id}`)}
                                                    className="w-5 h-5 rounded border border-border flex items-center justify-center text-foreground-muted hover:bg-hover transition-colors"
                                                    title="View"
                                                >
                                                    <Eye size={11} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/sales-dashboard/credit-notes/edit/${item.id}`)}
                                                    className="w-5 h-5 rounded border border-border flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={11} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="w-5 h-5 rounded border border-border flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
                                                    title="Delete"
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
                {totalPages > 1 && (
                    <div className="flex justify-between items-center text-[10px] text-foreground-muted pt-1">
                        <span>
                            Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, creditNotes.length + currentPage * pageSize)} entries
                        </span>
                        <div className="flex gap-1">
                            <button
                                disabled={currentPage === 0}
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                className="px-2 py-0.5 border border-border bg-card hover:bg-hover rounded text-foreground disabled:opacity-50"
                            >
                                {isRTL ? 'السابق' : 'Previous'}
                            </button>
                            <button
                                disabled={currentPage >= totalPages - 1}
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                className="px-2 py-0.5 border border-border bg-card hover:bg-hover rounded text-foreground disabled:opacity-50"
                            >
                                {isRTL ? 'التالي' : 'Next'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreditNotes;
