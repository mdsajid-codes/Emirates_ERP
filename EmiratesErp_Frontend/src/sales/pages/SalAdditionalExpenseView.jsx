import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
    ArrowLeft, 
    Edit, 
    Loader, 
    Printer, 
    Trash2,
    FileText,
    TrendingUp,
    Package,
    ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const InfoCard = ({ title, value, icon: Icon, color = "text-primary" }) => (
    <div className="bg-card p-3 rounded-lg border border-border shadow-2xs flex items-center gap-3">
        <div className={`p-2 rounded bg-primary/10 ${color}`}>
            <Icon size={18} />
        </div>
        <div>
            <p className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">{title}</p>
            <p className="text-xs font-bold text-foreground">{value || '---'}</p>
        </div>
    </div>
);

const SalAdditionalExpenseView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isRTL, t } = useLanguage();
    const [expense, setExpense] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExpense = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/sales/additional-expenses/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setExpense(res.data);
            } catch (err) {
                console.error('Failed to fetch expense', err);
                setError('Failed to load expense details.');
            } finally {
                setLoading(false);
            }
        };
        fetchExpense();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleDelete = async () => {
        if (window.confirm(isRTL ? 'هل أنت تأكد من حذف هذا السجل؟' : 'Are you sure you want to delete this record?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/sales/additional-expenses/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                navigate('/sales-dashboard/additional-expenses');
            } catch (err) {
                alert("Failed to delete record");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-background">
                <Loader className="animate-spin text-primary h-8 w-8" />
            </div>
        );
    }

    if (error || !expense) {
        return (
            <div className="p-8 text-center text-foreground-muted bg-background">
                {error || (isRTL ? 'السجل غير موجود' : 'Record not found')}
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground font-sans space-y-2 w-full print:bg-white print:p-0" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Top Action Bar - Hidden on Print */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs print:hidden">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-6 h-6 rounded border border-border flex items-center justify-center text-foreground hover:bg-hover transition-colors"
                    >
                        <ArrowLeft size={13} />
                    </button>
                    <div>
                        <h1 className="text-xs font-bold text-foreground leading-tight flex items-center gap-2">
                            {isRTL ? 'مصروف إضافي' : 'Additional Expense'} #{expense.number || `EXP-${expense.id}`}
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                expense.status === 'Posted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}>
                                {expense.status || 'Draft'}
                            </span>
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none mt-0.5">
                            {isRTL ? 'الرئيسية > المبيعات > المصاريف الإضافية > عرض' : 'Home > Sales > Additional Expenses > View'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                        onClick={handlePrint}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold border border-border bg-card hover:bg-hover text-foreground flex items-center gap-1 transition-colors"
                    >
                        <Printer size={12} /> {t('quotation.print')}
                    </button>
                    <button
                        onClick={() => navigate(`/sales-dashboard/additional-expenses/edit/${id}`)}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold border border-border bg-card hover:bg-hover text-blue-500 flex items-center gap-1 transition-colors"
                    >
                        <Edit size={12} /> {t('quotation.edit')}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold border border-border bg-card hover:bg-hover text-rose-500 flex items-center gap-1 transition-colors"
                    >
                        <Trash2 size={12} /> {t('quotation.delete')}
                    </button>
                </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 print:hidden">
                <InfoCard title={isRTL ? 'إجمالي المصروف' : 'Total Expense'} value={`AED ${Number(expense.totalExpenseAmount || 0).toFixed(2)}`} icon={TrendingUp} color="text-emerald-500" />
                <InfoCard title={isRTL ? 'العميل' : 'Customer'} value={expense.companyName} icon={ShieldCheck} color="text-blue-500" />
                <InfoCard title={isRTL ? 'التاريخ' : 'Date'} value={expense.date ? new Date(expense.date).toLocaleDateString() : '-'} icon={FileText} color="text-amber-500" />
                <InfoCard title={isRTL ? 'أمر المبيعات المرجعي' : 'SO Reference'} value={expense.salesOrderNumber || '-'} icon={Package} color="text-indigo-500" />
            </div>

            {/* Document Printable Details */}
            <div className="bg-card border border-border rounded-lg p-4 shadow-2xs space-y-4 print:border-none print:shadow-none print:p-0">
                {/* Service Items Table */}
                <div className="space-y-1.5">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-1 border-b border-border">
                        <FileText size={13} className="text-primary" />
                        {isRTL ? 'بنود الخدمات' : 'Service Items'}
                    </h3>
                    <div className="rounded border border-border overflow-hidden">
                        <table className="w-full text-[11px] border-collapse">
                            <thead>
                                <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                    <th className="px-3 py-1.5 text-start border-r border-border">{isRTL ? 'عنصر الخدمة' : 'Service Item'}</th>
                                    <th className="px-3 py-1.5 text-end w-28 border-r border-border">{isRTL ? 'المبلغ' : 'Amount'} (AED)</th>
                                    <th className="px-3 py-1.5 text-start border-r border-border">{isRTL ? 'الضريبة' : 'Tax'}</th>
                                    <th className="px-3 py-1.5 text-end w-28">{isRTL ? 'الإجمالي' : 'Total'} (AED)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {(expense.expenseLines || []).length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-foreground-muted">
                                            {isRTL ? 'لا توجد خدمات مضافة' : 'No service lines.'}
                                        </td>
                                    </tr>
                                ) : (
                                    (expense.expenseLines || []).map((line, i) => (
                                        <tr key={i} className="hover:bg-hover">
                                            <td className="px-3 py-1.5 font-semibold text-foreground border-r border-border">{line.productName || `Product ID: ${line.productId}`}</td>
                                            <td className="px-3 py-1.5 text-end font-mono border-r border-border">{(line.amount || 0).toFixed(2)}</td>
                                            <td className="px-3 py-1.5 text-foreground-muted border-r border-border">{line.taxCode || 'No Tax'} ({(line.taxAmount || 0).toFixed(2)})</td>
                                            <td className="px-3 py-1.5 text-end font-mono font-bold text-primary">{(line.totalAmount || 0).toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Inventory Allocation Table */}
                <div className="space-y-1.5">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-1 border-b border-border">
                        <Package size={13} className="text-emerald-500" />
                        {isRTL ? 'توزيع تكلفة المخزون' : 'Inventory Allocation'}
                    </h3>
                    <div className="rounded border border-border overflow-hidden">
                        <table className="w-full text-[11px] border-collapse">
                            <thead>
                                <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                    <th className="px-3 py-1.5 text-start border-r border-border">{isRTL ? 'الصنف' : 'Item'}</th>
                                    <th className="px-3 py-1.5 text-start border-r border-border w-24">{isRTL ? 'الدفعة' : 'Batch'}</th>
                                    <th className="px-3 py-1.5 text-end border-r border-border w-20">{isRTL ? 'الكمية' : 'Qty'}</th>
                                    <th className="px-3 py-1.5 text-end w-32">{isRTL ? 'المصروف الموزع' : 'Allocated Expense'} (AED)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {(expense.inventoryItems || []).length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-foreground-muted">
                                            {isRTL ? 'لا توجد أصناف موزعة' : 'No inventory items allocated.'}
                                        </td>
                                    </tr>
                                ) : (
                                    (expense.inventoryItems || []).map((item, i) => (
                                        <tr key={i} className="hover:bg-hover">
                                            <td className="px-3 py-1.5 font-semibold text-foreground border-r border-border">{item.productName || `Product ID: ${item.productId}`}</td>
                                            <td className="px-3 py-1.5 text-foreground-muted border-r border-border font-mono">{item.batch || '-'}</td>
                                            <td className="px-3 py-1.5 text-end font-mono border-r border-border">{item.quantity}</td>
                                            <td className="px-3 py-1.5 text-end font-mono font-bold text-emerald-600">{(item.expenseAmount || 0).toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Comments & Meta */}
                {expense.comment && (
                    <div className="pt-2 border-t border-border text-[11px]">
                        <h4 className="font-semibold text-foreground mb-0.5">{t('qform.notes')}</h4>
                        <p className="text-foreground-muted whitespace-pre-wrap leading-relaxed">{expense.comment}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalAdditionalExpenseView;
