import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Edit, Trash2, Loader, AlertCircle, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const SalAdditionalExpensePage = () => {
    const { isRTL, t } = useLanguage();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Pagination State
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchExpenses = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/sales/additional-expenses`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, size, sort: 'date,desc' }
            });

            if (res.data.content) {
                setExpenses(res.data.content);
                setTotalPages(res.data.totalPages);
                setTotalElements(res.data.totalElements);
            } else {
                const data = res.data || [];
                setExpenses(data);
                setTotalPages(1);
                setTotalElements(data.length);
            }
        } catch (err) {
            console.error('Failed to fetch additional expenses:', err);
            setError('Failed to fetch additional expenses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [page, size]);

    const handleDelete = async (id) => {
        if (!window.confirm(isRTL ? 'هل أنت تأكد من حذف المصروف الإضافي؟' : 'Are you sure you want to delete this additional expense?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/sales/additional-expenses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchExpenses();
        } catch (err) {
            console.error('Failed to delete additional expense', err);
            setError('Failed to delete additional expense.');
        }
    };

    const filtered = expenses.filter(exp =>
        (exp.number && exp.number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exp.companyName && exp.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exp.transactionType && exp.transactionType.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="bg-background text-foreground font-sans space-y-2 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Top Action Header Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div>
                    <h1 className="text-sm font-bold text-foreground leading-tight">
                        {isRTL ? 'المصاريف الإضافية' : 'Additional Expenses'}
                    </h1>
                    <p className="text-[10px] text-foreground-muted leading-none mt-0.5">
                        {isRTL ? 'تتبع وتوزيع التكاليف الإضافية على مبيعاتك' : 'Track and allocate additional costs to your sales.'}
                    </p>
                </div>
                <Link
                    to="/sales-dashboard/additional-expenses/new"
                    className="px-3.5 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs self-end sm:self-auto"
                >
                    <PlusCircle size={13} /> {isRTL ? 'مصروف جديد' : 'New Additional Expense'}
                </Link>
            </div>

            {/* Filter & Search Section Card */}
            <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="relative w-full sm:w-80">
                        <input
                            type="text"
                            placeholder={isRTL ? 'البحث بالرقم / العميل...' : 'Search by Number / Customer...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2.5 pr-8 text-foreground focus:outline-none focus:border-primary"
                        />
                        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-2.5 rounded text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                </div>
            )}

            {/* Data Table Card */}
            <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                <div className="rounded border border-border overflow-x-auto">
                    <table className="w-full text-[11px] text-start border-collapse">
                        <thead>
                            <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                <th className="px-2 py-1.5 border-r border-border min-w-[90px]">{t('qform.quotationDate')}</th>
                                <th className="px-2 py-1.5 border-r border-border min-w-[110px]">{isRTL ? 'الرقم' : 'Number'}</th>
                                <th className="px-2 py-1.5 border-r border-border min-w-[150px]">{isRTL ? 'العميل / الشركة' : 'Customer / Company'}</th>
                                <th className="px-2 py-1.5 border-r border-border w-28 text-end">{isRTL ? 'إجمالي المصروف' : 'Total Expense'} (AED)</th>
                                <th className="px-2 py-1.5 border-r border-border min-w-[120px]">{isRTL ? 'نوع المعاملة' : 'Transaction Type'}</th>
                                <th className="px-2 py-1.5 border-r border-border w-20 text-center">{t('qform.status')}</th>
                                <th className="px-2 py-1.5 text-center w-24">{t('quotation.action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-6">
                                        <Loader className="animate-spin h-5 w-5 text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-6 text-foreground-muted">
                                        {t('quotation.noRecord')}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(exp => (
                                    <tr key={exp.id} className="hover:bg-hover transition-colors">
                                        <td className="px-2 py-1.5 border-r border-border text-foreground-muted">{exp.date ? new Date(exp.date).toLocaleDateString() : '-'}</td>
                                        <td
                                            className="px-2 py-1.5 border-r border-border font-medium text-primary cursor-pointer hover:underline"
                                            onClick={() => navigate(`/sales-dashboard/additional-expenses/view/${exp.id}`)}
                                        >
                                            {exp.number || `EXP-${exp.id}`}
                                        </td>
                                        <td className="px-2 py-1.5 border-r border-border font-semibold text-foreground">{exp.companyName || '-'}</td>
                                        <td className="px-2 py-1.5 border-r border-border text-end font-mono font-bold text-foreground">
                                            AED {Number(exp.totalExpenseAmount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-2 py-1.5 border-r border-border text-foreground-muted">{exp.transactionType || '-'}</td>
                                        <td className="px-2 py-1.5 border-r border-border text-center">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                                exp.status === 'Posted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                                'bg-amber-50 text-amber-600 border border-amber-200'
                                            }`}>
                                                {exp.status || 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-2 py-1.5 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => navigate(`/sales-dashboard/additional-expenses/view/${exp.id}`)}
                                                    className="w-5 h-5 rounded border border-border flex items-center justify-center text-foreground-muted hover:bg-hover transition-colors"
                                                    title="View"
                                                >
                                                    <Eye size={11} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/sales-dashboard/additional-expenses/edit/${exp.id}`)}
                                                    className="w-5 h-5 rounded border border-border flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={11} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(exp.id)}
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

                {/* Pagination Controls */}
                {!loading && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-1 text-xs">
                        <div className="text-[10px] text-foreground-muted">
                            {t('quotation.showing')} {filtered.length === 0 ? 0 : page * size + 1} {t('quotation.to')} {Math.min((page + 1) * size, totalElements || filtered.length)} {t('quotation.of')} {totalElements || filtered.length} {t('quotation.entries')}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="w-7 h-7 rounded border border-border bg-card flex items-center justify-center text-foreground-muted hover:text-foreground disabled:opacity-40"
                            >
                                <ChevronLeft size={14} className={isRTL ? 'rotate-180' : ''} />
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`w-7 h-7 rounded font-semibold text-[11px] ${page === i ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-hover'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="w-7 h-7 rounded border border-border bg-card flex items-center justify-center text-foreground-muted hover:text-foreground disabled:opacity-40"
                            >
                                <ChevronRight size={14} className={isRTL ? 'rotate-180' : ''} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalAdditionalExpensePage;
