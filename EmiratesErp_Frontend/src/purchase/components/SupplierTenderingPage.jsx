import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Plus, Edit2, Trash2, Search, Calendar, RefreshCw,
  FileText, ChevronLeft, ChevronRight, Eye, AlertCircle, Loader,
  ClipboardList, CheckCircle2, Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { loadThemeFromStorage, applyTheme } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const SupplierTenderingPage = () => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const [tenderings, setTenderings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('May 20, 2025');

  // Pagination State
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchTenderings = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/purchases/supplier-tendering`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, size, sort: 'createdAt,desc' }
      });
      if (res.data && res.data.content) {
        setTenderings(res.data.content);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || res.data.content.length);
      } else {
        const data = res.data || [];
        setTenderings(data);
        setTotalPages(1);
        setTotalElements(data.length);
      }
    } catch (err) {
      console.error('Failed to fetch supply tenderings:', err);
      setError(isRTL ? 'فشل في استخراج بيانات المناقصات' : 'Failed to fetch supply tenderings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const theme = loadThemeFromStorage();
    if (theme) applyTheme(theme);
    fetchTenderings();
  }, [page, size]);

  const handleDelete = async (id) => {
    if (!window.confirm(isRTL ? 'هل أنت تأكد من حذف مناقصة التوريد هذه؟' : 'Are you sure you want to delete this Supply Tendering?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/purchases/supplier-tendering/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchTenderings();
    } catch (err) {
      console.error('Failed to delete tendering', err);
      setError(isRTL ? 'فشل في حذف المناقصة.' : 'Failed to delete supply tendering.');
    }
  };

  const filtered = tenderings.filter(item =>
    (item.tenderNumber && item.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.project && item.project.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.entity && item.entity.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeRfqCount = tenderings.filter(t => t.status && t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
  const completedCount = tenderings.filter(t => t.status === 'COMPLETED' || t.status === 'COMPARISON_COMPLETED').length;

  const formatStatus = (s) => {
    if (!s) return 'N/A';
    const statusMap = {
      'DRAFT': isRTL ? 'مسودة' : 'DRAFT',
      'REQUESTS_FOR_QUOTATION': isRTL ? 'طلب عروض الأسعار' : 'RFQ ACTIVE',
      'RFQ_RESPONSES': isRTL ? 'ردود الأسعار' : 'RFQ RESPONSES',
      'COMPARISON': isRTL ? 'قيد المقارنة' : 'COMPARISON',
      'COMPARISON_COMPLETED': isRTL ? 'اكتملت المقارنة' : 'COMPLETED',
      'COMPLETED': isRTL ? 'مكتمل' : 'COMPLETED',
      'CANCELLED': isRTL ? 'ملغى' : 'CANCELLED'
    };
    return statusMap[s] || s.replace(/_/g, ' ');
  };

  return (
    <div className="p-3 lg:p-4 space-y-3 font-sans select-none text-[#18233B]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-[22px] sm:text-[24px] font-bold text-[#172033] tracking-tight leading-none mb-1">
            {isRTL ? 'مناقصات التوريد' : 'Supply Tendering'}
          </h1>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-medium text-[var(--color-primary,#00A9A8)] cursor-pointer hover:underline">{isRTL ? 'الرئيسية' : 'Home'}</span>
            <span className="text-[#617198]">/</span>
            <span className="font-medium text-[#617198]">{isRTL ? 'المشتريات' : 'Purchase'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E4EAF0] rounded-[11px] text-xs font-semibold text-[#18233B] hover:bg-slate-50 transition-colors shadow-xs cursor-pointer">
            <Calendar size={14} className="text-[#18233B]" />
            <span>{dateFilter}</span>
          </button>

          <button
            onClick={fetchTenderings}
            className="w-8 h-8 bg-white border border-[#E7EAF0] rounded-[10px] flex items-center justify-center text-[#657186] hover:bg-slate-50 shadow-xs cursor-pointer transition-all active:scale-95"
            title={isRTL ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          <Link
            to="/purchase-dashboard/supplier-tendering/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--color-primary,#00A9A8)] text-white rounded-[10px] text-xs font-bold hover:bg-[#008f8e] transition-all shadow-xs cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>{isRTL ? '+ مناقصة جديدة' : 'New Tendering'}</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Summary Cards (Exact PurchaseOrderPage Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Total Tenderings */}
        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[var(--color-primary,#00A9A8)]/10 flex items-center justify-center text-[var(--color-primary,#00A9A8)] shrink-0">
            <ClipboardList size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-[var(--color-primary,#00A9A8)] block truncate">
              {isRTL ? 'إجمالي المناقصات' : 'Total Tenderings'}
            </span>
            <span className="text-[20px] font-bold text-[#172033] block leading-tight">
              {totalElements}
            </span>
          </div>
        </div>

        {/* Active RFQs */}
        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
            <Layers size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-[var(--color-primary,#00A9A8)] block truncate">
              {isRTL ? 'المناقصات النشطة' : 'Active RFQs'}
            </span>
            <span className="text-[20px] font-bold text-[#172033] block leading-tight">
              {activeRfqCount}
            </span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-[var(--color-primary,#00A9A8)] block truncate">
              {isRTL ? 'المقاولات المكتملة' : 'Completed RFQs'}
            </span>
            <span className="text-[20px] font-bold text-[#172033] block leading-tight">
              {completedCount}
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

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white border border-[#DBE5F3] rounded-[11.09px] overflow-hidden shadow-xs">
        {/* Search Header Bar inside Table */}
        <div className="p-3 border-b border-[#DBE5F3] bg-[#F8FAFC] flex justify-between items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder={isRTL ? 'بحث برقم المناقصة / المشروع / الكيان...' : 'Search by Tender # / Project / Entity...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 rtl:pr-9 rtl:pl-3 pr-3 py-1.5 bg-white border border-[#DFE7F4] rounded-lg text-xs font-semibold text-[#0A2551] outline-none focus:border-[var(--color-primary,#00A9A8)] transition-all"
            />
          </div>
          <span className="text-[11px] font-semibold text-[#617198]">
            {isRTL ? `عرض ${filtered.length} مناقصة` : `Showing ${filtered.length} tenders`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="bg-[#EEF5FF] border-b border-[#DBE5F3] text-[#102A5B] font-semibold text-[12px] h-[38.39px]">
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'ت' : 'S.No.'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'رقم المناقصة' : 'Tender Number'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'التاريخ المطلوب' : 'Required Date'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'المشروع' : 'Project'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'الكيان' : 'Entity'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'بواسطة' : 'Initiated By'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">{isRTL ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DBE5F3]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Loader className="w-6 h-6 animate-spin mx-auto text-[var(--color-primary,#00A9A8)]" />
                    <p className="text-xs font-semibold mt-2">{isRTL ? 'جاري التحميل...' : 'Loading Supply Tenderings...'}</p>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors h-[42.39px]">
                    <td className="py-2 px-3 text-[11.09px] text-[#102A5B] font-normal">{page * size + idx + 1}</td>
                    <td className="py-2 px-3 text-[11.09px] text-[#102A5B] font-bold whitespace-nowrap">
                      <Link to={`/purchase-dashboard/supplier-tendering/view/${item.id}`} className="hover:underline text-[var(--color-primary,#00A9A8)]">
                        {item.tenderNumber}
                      </Link>
                    </td>
                    <td className="py-2 px-3 text-[11.09px] text-[#102A5B] font-normal whitespace-nowrap">
                      {item.requiredDate ? new Date(item.requiredDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="py-2 px-3 text-[11.09px] text-[#102A5B] font-bold whitespace-nowrap">{item.project || '-'}</td>
                    <td className="py-2 px-3 text-[11.09px] text-[#102A5B] font-semibold whitespace-nowrap">{item.entity || '-'}</td>
                    <td className="py-2 px-3 text-[11.09px] text-[#102A5B] font-normal whitespace-nowrap">{item.initiatedBy || '-'}</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-[6.68px] bg-[#F4F7FC] text-[#617198] text-[11px] font-semibold uppercase tracking-wider">
                        {formatStatus(item.status)}
                      </span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/purchase-dashboard/supplier-tendering/view/${item.id}`)}
                          className="w-[24.95px] h-[27.72px] border border-[#DBE5F3] rounded-[5.54px] flex items-center justify-center text-[#00A9A8] hover:bg-teal-50 transition-colors cursor-pointer"
                          title={isRTL ? 'عرض المناقصة' : 'View Tendering'}
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => navigate(`/purchase-dashboard/supplier-tendering/edit/${item.id}`)}
                          className="w-[24.95px] h-[27.72px] border border-[#DBE5F3] rounded-[5.54px] flex items-center justify-center text-[#06275C] hover:bg-slate-100 transition-colors cursor-pointer"
                          title={isRTL ? 'تعديل' : 'Edit'}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-[24.95px] h-[27.72px] border border-[#DBE5F3] rounded-[5.54px] flex items-center justify-center text-[#D03D4E] hover:bg-rose-50 transition-colors cursor-pointer"
                          title={isRTL ? 'حذف' : 'Delete'}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto opacity-40 mb-1" />
                    <p className="text-xs font-semibold">{isRTL ? 'لم يتم العثور على مناقصات توريد' : 'No supply tenderings found'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#62708E] pt-1">
        <span>
          {totalElements === 0
            ? (isRTL ? 'عرض 0 إلى 0 من أصل 0 مدخلات' : 'Showing 0 to 0 of 0 entries')
            : (isRTL
                ? `عرض ${page * size + 1} إلى ${Math.min((page + 1) * size, totalElements)} من أصل ${totalElements} مدخلات`
                : `Showing ${page * size + 1} to ${Math.min((page + 1) * size, totalElements)} of ${totalElements} entries`)}
        </span>

        {totalPages > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-7 h-7 bg-white rounded border border-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer shadow-xs"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-3 py-1 bg-[#00A9A8] text-white rounded font-bold">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-7 h-7 bg-white rounded border border-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer shadow-xs"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierTenderingPage;
