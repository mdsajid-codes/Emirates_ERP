import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Plus, Edit2, Trash2, Search, Calendar, RefreshCw, CreditCard,
  FileText, ChevronLeft, ChevronRight, AlertCircle, Eye, DollarSign,
  TrendingUp, CheckCircle, Clock, ShieldCheck, ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { loadThemeFromStorage, applyTheme } from '../../utils/themeUtils';
import Pagination from '../../components/Pagination';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const PurchasePaymentPage = () => {
  const { isRTL, t } = useLanguage();
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('May 20, 2025');

  // Pagination State
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const theme = loadThemeFromStorage();
    if (theme) applyTheme(theme);
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPayments([]);
        setTotalPages(1);
        setTotalElements(0);
        return;
      }
      const res = await axios.get(`${API_URL}/purchases/payments`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, size, sort: 'createdAt,desc' }
      });

      if (res.data?.content) {
        setPayments(res.data.content);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || res.data.content.length);
      } else {
        const data = Array.isArray(res.data) ? res.data : [];
        setPayments(data);
        setTotalPages(1);
        setTotalElements(data.length);
      }
    } catch (err) {
      console.error('Failed to fetch purchase payments:', err);
      setError(isRTL ? 'فشل تحميل بيانات المدفوعات' : 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, size]);

  const handleDelete = async (id) => {
    const msg = isRTL ? 'هل أنت تأكد من رغبتك في حذف سند الدفع هذا؟' : 'Are you sure you want to delete this payment record?';
    if (!window.confirm(msg)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/purchases/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPayments();
    } catch (err) {
      console.error('Failed to delete payment', err);
      setError(isRTL ? 'تعذر حذف سند الدفع' : 'Failed to delete payment.');
    }
  };

  const filtered = payments.filter(p =>
    (p.supplierName && p.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.reference && p.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.paymentMode && p.paymentMode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalAmountPaid = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalAmountExcess = payments.reduce((acc, p) => acc + (Number(p.amountInExcess) || 0), 0);

  return (
    <div className="p-3 lg:p-4 space-y-3 font-sans select-none text-[#18233B]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Section matching PurchaseOrderPage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-[22px] sm:text-[24px] font-bold text-[#172033] tracking-tight leading-none mb-1">
            {t('payment.title') || (isRTL ? 'سندات الدفع للمشتريات' : 'Purchase Payments')}
          </h1>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-medium text-[var(--color-primary,#00A9A8)] cursor-pointer hover:underline">
              {isRTL ? 'الرئيسية' : 'Home'}
            </span>
            <span className="text-[#617198]">/</span>
            <span className="font-medium text-[#617198]">{isRTL ? 'المشتريات' : 'Purchase'}</span>
            <span className="text-[#617198]">/</span>
            <span className="font-medium text-[#617198]">{isRTL ? 'المدفوعات' : 'Payments'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Button */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E4EAF0] rounded-[11px] text-xs font-semibold text-[#18233B] hover:bg-slate-50 transition-colors shadow-xs cursor-pointer">
            <Calendar size={14} className="text-[#18233B]" />
            <span>{dateFilter}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchPayments}
            className="w-8 h-8 bg-white border border-[#E7EAF0] rounded-[10px] flex items-center justify-center text-[#657186] hover:bg-slate-50 shadow-xs cursor-pointer transition-all active:scale-95"
            title={isRTL ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[var(--color-primary,#00A9A8)]' : ''} />
          </button>

          {/* New Payment Button matching PO button */}
          <Link
            to="/purchase-dashboard/payments/new"
            className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-[var(--color-primary,#00A9A8)] text-[var(--color-primary-foreground,#ffffff)] rounded-[var(--theme-border-radius,11px)] text-xs font-bold hover:opacity-95 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={16} className="text-white stroke-[2.5]" />
            <span>{t('payment.newPayment') || (isRTL ? 'سند جديد' : 'New Payment')}</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Stat Cards matching PurchaseOrderPage structure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Total Payments Count */}
        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[var(--color-primary,#00A9A8)]/10 flex items-center justify-center text-[var(--color-primary,#00A9A8)] shrink-0">
            <CreditCard size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-[var(--color-primary,#00A9A8)] block truncate">
              {isRTL ? 'إجمالي الدفعات' : 'Total Payments'}
            </span>
            <span className="text-[20px] font-bold text-[#172033] block leading-tight">
              {totalElements}
            </span>
          </div>
        </div>

        {/* Total Amount Paid */}
        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#F3F5F9] flex items-center justify-center text-[var(--color-primary,#00A9A8)] shrink-0">
            <DollarSign size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-[var(--color-primary,#00A9A8)] block truncate">
              {isRTL ? 'المبالغ المسددة' : 'Page Total Paid'}
            </span>
            <span className="text-[18px] sm:text-[20px] font-bold text-[#172033] block leading-tight truncate">
              AED {totalAmountPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total Excess */}
        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-[var(--color-primary,#00A9A8)] block truncate">
              {isRTL ? 'المبالغ الفائضة' : 'Page Excess Amount'}
            </span>
            <span className="text-[18px] sm:text-[20px] font-bold text-[#172033] block leading-tight truncate">
              AED {totalAmountExcess.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Sync Status */}
        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#EEF4FF] flex items-center justify-center text-[var(--color-primary,#00A9A8)] shrink-0">
            <RefreshCw size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-[var(--color-primary,#00A9A8)] block truncate">
              {isRTL ? 'حالة المزامنة' : 'Sync Status'}
            </span>
            <span className="text-[20px] font-bold text-[#172033] block leading-tight">
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Container matching PO table style */}
      <div className="bg-white border border-[#DBE5F3] rounded-[11.09px] overflow-hidden shadow-xs">
        {/* Search Bar matching PO header */}
        <div className="p-3 border-b border-[#DBE5F3] flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} size={15} />
            <input
              type="text"
              placeholder={t('payment.searchPlaceholder') || (isRTL ? 'البحث حسب المورد، المرجع، طريقة الدفع...' : 'Search by supplier, reference, mode...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-1.5 bg-[#F8FAFC] border border-[#DCE5F3] rounded-[8px] text-xs font-medium text-[#172033] outline-none focus:border-[var(--color-primary,#00A9A8)] focus:bg-white transition-all`}
            />
          </div>
          <div className="text-[11px] font-semibold text-[#617198]">
            {isRTL ? `عرض ${filtered.length} من أصل ${totalElements}` : `Showing ${filtered.length} of ${totalElements}`}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-2">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-[var(--color-primary,#00A9A8)] rounded-full animate-spin" />
            <p className="text-xs font-semibold text-[#617198]">{isRTL ? 'جاري التحميل...' : 'Loading Payments...'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EEF5FF] border-b border-[#DBE5F3] text-[#102A5B] font-semibold text-[12px] h-[38.39px]">
                    <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'التاريخ' : 'Date'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'المورد' : 'Supplier'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'المرجع' : 'Reference'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'طريقة الدفع' : 'Mode'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'المبلغ (AED)' : 'Amount (AED)'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'المستخدم (AED)' : 'Used (AED)'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'الفائض (AED)' : 'Excess (AED)'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">{isRTL ? 'الإجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DBE5F3]">
                  {filtered.length > 0 ? (
                    filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors h-[42.39px] text-xs">
                        <td className="py-2 px-3 text-[#5F6F91] whitespace-nowrap">
                          {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="py-2 px-3 font-semibold text-[#102A5B] whitespace-nowrap">
                          {p.supplierName || '—'}
                        </td>
                        <td className="py-2 px-3 font-semibold text-[var(--color-primary,#00A9A8)] whitespace-nowrap">
                          <Link to={`/purchase-dashboard/payments/view/${p.id}`} className="hover:underline flex items-center gap-1">
                            <FileText size={13} className="text-slate-400 shrink-0" />
                            <span>{p.reference || `PAY-${p.id}`}</span>
                          </Link>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-[#F3F5F9] text-[#102A5B] rounded-[6px] text-[11px] font-semibold border border-[#DCE5F3]">
                            {p.paymentMode || 'Cash'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-[#172033] whitespace-nowrap">
                          AED {(Number(p.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-[#5F6F91] whitespace-nowrap">
                          AED {(Number(p.amountPaid) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                          AED {(Number(p.amountInExcess) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => navigate(`/purchase-dashboard/payments/view/${p.id}`)}
                              className="p-1 text-slate-400 hover:text-[var(--color-primary,#00A9A8)] hover:bg-slate-100 rounded transition-colors"
                              title={isRTL ? 'عرض' : 'View'}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => navigate(`/purchase-dashboard/payments/edit/${p.id}`)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title={isRTL ? 'تعديل' : 'Edit'}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title={isRTL ? 'حذف' : 'Delete'}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-10 text-center text-slate-400">
                        <AlertCircle className="mx-auto h-8 w-8 text-slate-300 mb-1" />
                        <p className="text-xs font-semibold text-slate-600">
                          {isRTL ? 'لا توجد سجلات دفع مطابقة' : 'No payments found matching your criteria'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-[#DBE5F3]">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                pageSize={size}
                onPageSizeChange={(newSize) => { setSize(newSize); setPage(0); }}
                totalElements={totalElements}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PurchasePaymentPage;


