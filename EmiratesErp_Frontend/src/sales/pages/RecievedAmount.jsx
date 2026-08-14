import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader2, Search, Eye } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RecievedAmount = () => {
    const navigate = useNavigate();
    const { isRTL, t } = useLanguage();
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        customerName: '',
        fromDate: '',
        toDate: '',
        searchBy: 'depositDate'
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

    const fetchReceipts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/recieved`, authHeaders);
            let data = response.data || [];

            if (filters.customerName) {
                data = data.filter(item => item.customerName?.toLowerCase().includes(filters.customerName.toLowerCase()));
            }
            if (filters.fromDate) {
                data = data.filter(item => new Date(item[filters.searchBy]) >= new Date(filters.fromDate));
            }
            if (filters.toDate) {
                data = data.filter(item => new Date(item[filters.searchBy]) <= new Date(filters.toDate));
            }

            setTotalPages(Math.ceil(data.length / pageSize));
            const startIndex = currentPage * pageSize;
            const paginatedData = data.slice(startIndex, startIndex + pageSize);

            setReceipts(paginatedData);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch received amounts", err);
            setError('Failed to fetch data');
            setReceipts([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters, authHeaders]);

    useEffect(() => {
        fetchReceipts();
    }, [fetchReceipts]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(0);
    };

    const handleDelete = async (id) => {
        if (window.confirm(isRTL ? 'هل أنت تأكد من حذف هذا السجل؟' : 'Are you sure you want to delete this received amount?')) {
            try {
                await axios.delete(`${API_URL}/recieved/${id}`, authHeaders);
                fetchReceipts();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete record.'}`);
            }
        }
    };

    return (
        <div className="bg-background text-foreground font-sans space-y-2 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Top Bar Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div>
                    <h1 className="text-sm font-bold text-foreground leading-tight">
                        {isRTL ? 'إدارة المبالغ المستلمة' : 'Manage Amount Received'}
                    </h1>
                    <p className="text-[10px] text-foreground-muted leading-none mt-0.5">
                        {isRTL ? 'الرئيسية > المبيعات > إدارة المبالغ المستلمة' : 'Home > Sales > Manage Amount Received'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/sales-dashboard/recieved-amounts/new')}
                    className="px-3.5 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs self-end sm:self-auto"
                >
                    <Plus size={13} /> {isRTL ? 'مبلغ مستلم جديد' : 'New Amount Received'}
                </button>
            </div>

            {/* Filter Section Card */}
            <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 items-end">
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.customer')}</label>
                        <input
                            type="text"
                            name="customerName"
                            value={filters.customerName}
                            onChange={handleFilterChange}
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                            placeholder={isRTL ? 'البحث عن عميل...' : 'Search Customer...'}
                        />
                    </div>
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
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{isRTL ? 'البحث حسب' : 'Search By'}</label>
                        <select
                            name="searchBy"
                            value={filters.searchBy}
                            onChange={handleFilterChange}
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        >
                            <option value="depositDate">{isRTL ? 'تاريخ الإيداع' : 'Deposit Date'}</option>
                            <option value="receivingDate">{isRTL ? 'تاريخ الاستلام' : 'Receiving Date'}</option>
                        </select>
                    </div>
                    <div>
                        <button
                            onClick={fetchReceipts}
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
                                <th className="px-2 py-1.5 border-r border-border min-w-[90px]">{isRTL ? 'تاريخ الاستلام' : 'Receiving Date'}</th>
                                <th className="px-2 py-1.5 border-r border-border min-w-[90px]">{isRTL ? 'تاريخ الإيداع' : 'Deposit Date'}</th>
                                <th className="px-2 py-1.5 border-r border-border min-w-[100px]">{isRTL ? 'رقم الاستلام' : 'Received#'}</th>
                                <th className="px-2 py-1.5 border-r border-border min-w-[100px]">{t('qform.reference')}</th>
                                <th className="px-2 py-1.5 border-r border-border min-w-[140px]">{t('qform.customer')}</th>
                                <th className="px-2 py-1.5 border-r border-border min-w-[100px]">{isRTL ? 'رقم الفاتورة' : 'Invoice#'}</th>
                                <th className="px-2 py-1.5 border-r border-border min-w-[90px]">{isRTL ? 'الطريقة' : 'Mode'}</th>
                                <th className="px-2 py-1.5 border-r border-border w-24 text-end">{isRTL ? 'المبلغ' : 'Amount'} (AED)</th>
                                <th className="px-2 py-1.5 border-r border-border w-20 text-end">TDS (AED)</th>
                                <th className="px-2 py-1.5 border-r border-border w-24 text-end">{isRTL ? 'المبلغ المقدم' : 'Advance'} (AED)</th>
                                <th className="px-2 py-1.5 text-center w-24">{isRTL ? 'إجراء' : 'Operation'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="12" className="text-center py-6">
                                        <Loader2 className="animate-spin h-5 w-5 text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : receipts.length === 0 ? (
                                <tr>
                                    <td colSpan="12" className="text-center py-6 text-foreground-muted">
                                        {t('quotation.noRecord')}
                                    </td>
                                </tr>
                            ) : (
                                receipts.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-hover transition-colors">
                                        <td className="px-2 py-1.5 border-r border-border text-center text-foreground-muted">{currentPage * pageSize + index + 1}</td>
                                        <td className="px-2 py-1.5 border-r border-border text-foreground-muted">{item.receivingDate ? new Date(item.receivingDate).toLocaleDateString() : '-'}</td>
                                        <td className="px-2 py-1.5 border-r border-border text-foreground-muted">{item.depositDate ? new Date(item.depositDate).toLocaleDateString() : '-'}</td>
                                        <td
                                            className="px-2 py-1.5 border-r border-border font-medium text-primary cursor-pointer hover:underline"
                                            onClick={() => navigate(`/sales-dashboard/recieved-amounts/${item.id}`)}
                                        >
                                            {item.receivedNumber || item.id}
                                        </td>
                                        <td className="px-2 py-1.5 border-r border-border text-foreground-muted">{item.reference || '-'}</td>
                                        <td className="px-2 py-1.5 border-r border-border font-semibold text-foreground">{item.customerName}</td>
                                        <td className="px-2 py-1.5 border-r border-border text-foreground-muted">{item.invoiceNumber || '-'}</td>
                                        <td className="px-2 py-1.5 border-r border-border text-foreground-muted">{item.depositMode || '-'}</td>
                                        <td className="px-2 py-1.5 border-r border-border text-end font-mono font-bold text-foreground">AED {Number(item.amount || 0).toFixed(2)}</td>
                                        <td className="px-2 py-1.5 border-r border-border text-end font-mono text-foreground-muted">AED {Number(item.tds || 0).toFixed(2)}</td>
                                        <td className="px-2 py-1.5 border-r border-border text-end font-mono text-foreground-muted">AED {Number(item.advanceAmount || 0).toFixed(2)}</td>
                                        <td className="px-2 py-1.5 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => navigate(`/sales-dashboard/recieved-amounts/${item.id}`)}
                                                    className="w-5 h-5 rounded border border-border flex items-center justify-center text-foreground-muted hover:bg-hover transition-colors"
                                                    title="View"
                                                >
                                                    <Eye size={11} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/sales-dashboard/recieved-amounts/edit/${item.id}`)}
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
                            Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, receipts.length + currentPage * pageSize)} entries
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

export default RecievedAmount;
