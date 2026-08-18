import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Plus, Edit2, Trash2, Search, Calendar, RefreshCw, ShoppingCart,
  FileText, ChevronLeft, ChevronRight, X, History, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { loadThemeFromStorage, applyTheme } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const PurchaseOrderPage = () => {
  const { isRTL, t } = useLanguage();
  const navigate = useNavigate();

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('May 20, 2025');

  // Pagination State
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(38);

  const [showGrnHistory, setShowGrnHistory] = useState(false);
  const [grnHistoryData, setGrnHistoryData] = useState([]);
  const [grnHistoryLoading, setGrnHistoryLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPurchaseOrders([]);
        setTotalPages(1);
        setTotalElements(0);
        return;
      }
      const res = await axios.get(`${API_URL}/purchases/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, size, sort: 'createdAt,desc' }
      });

      const listData = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      if (listData.length > 0) {
        const mapped = listData.map((item, index) => {
          const itemNames = (item.items || [])
            .map(it => it.itemName || it.description)
            .filter(Boolean);
          const itemSummary = itemNames.length > 0
            ? itemNames.slice(0, 2).join(', ') + (itemNames.length > 2 ? ` (+${itemNames.length - 2} more)` : '')
            : 'N/A';

          return {
            id: item.id,
            sNo: page * size + index + 1,
            date: item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'),
            poNumber: item.poNumber || `PO-${item.id}`,
            supplierName: item.supplierName || item.supplier?.name || 'N/A',
            itemsSummary: itemSummary,
            reference: item.reference || 'N/A',
            details: item.createdBy || item.notes || 'N/A',
            status: (item.status || 'DRAFT').toUpperCase(),
            amount: item.totalAmount || item.netAmount || 0,
            grnId: item.grnId || item.latestGrnId || null
          };
        });
        setPurchaseOrders(mapped);
        setTotalPages(res.data?.totalPages || 1);
        setTotalElements(res.data?.totalElements || mapped.length);
      } else {
        setPurchaseOrders([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (err) {
      console.error('Failed to fetch purchase orders:', err);
      setPurchaseOrders([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const theme = loadThemeFromStorage();
    if (theme) applyTheme(theme);
    fetchPurchaseOrders();
  }, [page, size]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Purchase Order?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/purchases/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchPurchaseOrders();
    } catch (err) {
      console.error('Failed to delete PO', err);
      setError('Failed to delete purchase order.');
    }
  };

  const filtered = purchaseOrders.filter(order =>
    (order.poNumber && order.poNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.supplierName && order.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.reference && order.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate real metric sums from loaded orders
  const totalValueSum = purchaseOrders.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const pendingGrnCount = purchaseOrders.filter(item => item.status !== 'CONFIRMED' && item.status !== 'RECEIVED').length;

  return (
    <div className="p-3 lg:p-4 space-y-3 font-sans select-none text-[#18233B]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-[22px] sm:text-[24px] font-bold text-[#172033] tracking-tight leading-none mb-1">
            {isRTL ? 'أوامر الشراء' : 'Purchase Order'}
          </h1>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-medium text-[var(--color-primary,#00A9A8)] cursor-pointer hover:underline">{isRTL ? 'الرئيسية' : 'Home'}</span>
            <span className="text-[#617198]">/</span>
            <span className="font-medium text-[#617198]">{isRTL ? 'المشتريات' : 'Purchase'}</span>
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
            onClick={fetchPurchaseOrders}
            className="w-8 h-8 bg-white border border-[#E7EAF0] rounded-[10px] flex items-center justify-center text-[#657186] hover:bg-slate-50 shadow-xs cursor-pointer transition-all active:scale-95"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-[var(--color-primary,#003E5B)]" : ""} />
          </button>

          {/* New Order Button */}
          <Link
            to="/purchase-dashboard/purchase-orders/new"
            className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-[var(--color-primary,#00A9A8)] text-[var(--color-primary-foreground,#ffffff)] rounded-[var(--theme-border-radius,11px)] text-xs font-bold hover:opacity-95 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={16} className="text-white stroke-[2.5]" />
            <span>{isRTL ? 'أمر جديد' : 'New Order'}</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Total Orders */}
        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[var(--color-primary,#00A9A8)]/10 flex items-center justify-center text-[var(--color-primary,#00A9A8)] shrink-0">
            <ShoppingCart size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-[var(--color-primary,#00A9A8)] block truncate">
              {isRTL ? 'إجمالي الطلبات' : 'Total Orders'}
            </span>
            <span className="text-[20px] font-bold text-[#172033] block leading-tight">
              {totalElements}
            </span>
          </div>
        </div>

        {/* Pending GRN */}
        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[var(--color-primary,#00A9A8)]/10 flex items-center justify-center text-[var(--color-primary,#00A9A8)] shrink-0">
            <FileText size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-[var(--color-primary,#00A9A8)] block truncate">
              {isRTL ? 'في انتظار GRN' : 'Pending GRN'}
            </span>
            <span className="text-[20px] font-bold text-[#172033] block leading-tight">
              {pendingGrnCount}
            </span>
          </div>
        </div>

        {/* Total Value */}
        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#F3F5F9] flex items-center justify-center text-[var(--color-primary,#00A9A8)] shrink-0">
            <svg width="22" height="26" viewBox="0 0 25 31" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.0853 28.781C2.57085 28.781 1.34131 27.5515 1.34131 26.037V4.08506C1.34131 2.57061 2.57085 1.34107 4.0853 1.34107H15.0613C15.9385 1.33965 16.78 1.6883 17.3992 2.3097L22.3219 7.23243C22.945 7.85181 23.2933 8.6945 23.2933 9.57305V26.037C23.2933 27.5515 22.0637 28.781 20.5493 28.781H4.0853Z" stroke="currentColor" strokeWidth="2.55556" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.3096 2.41296V9.27295C14.3096 10.0302 14.9244 10.6449 15.6816 10.6449H22.5416M8.82163 12.0169H6.07764M17.0536 17.5049H6.07764M17.0536 22.9929H6.07764" stroke="currentColor" strokeWidth="2.55556" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-[var(--color-primary,#00A9A8)] block truncate">
              {isRTL ? 'القيمة الإجمالية' : 'Total Value'}
            </span>
            <span className="text-[18px] sm:text-[20px] font-bold text-[#172033] block leading-tight truncate">
              AED {totalValueSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

      {/* Main Table Container */}
      <div className="bg-white border border-[#DBE5F3] rounded-[11.09px] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EEF5FF] border-b border-[#DBE5F3] text-[#102A5B] font-semibold text-[12px] h-[38.39px]">
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'ت' : 'S.No.'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'التاريخ' : 'Date'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'رقم الأمر' : 'Order No.'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'المورد' : 'Supplier'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'الأصناف' : 'Items'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'المرجع' : 'Reference'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'التفاصيل' : 'Details'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'المبلغ (AED)' : 'Amount (AED)'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'استلام سريع' : 'Quick GRN'}</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">{isRTL ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DBE5F3]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors h-[42.39px]">
                  <td className="py-2 px-3 text-[11.09px] text-[#102A5B] font-normal">{item.sNo}</td>
                  <td className="py-2 px-3 text-[11.09px] text-[#102A5B] font-normal whitespace-nowrap">{item.date}</td>
                  <td className="py-2 px-3 text-[11.09px] text-[#102A5B] font-bold whitespace-nowrap">
                    <Link to={`/purchase-dashboard/purchase-orders/view/${item.id}`} className="hover:underline">{item.poNumber}</Link>
                  </td>
                  <td className="py-2 px-3 text-[11.09px] text-[#102A5B] font-bold whitespace-nowrap">{item.supplierName}</td>
                  <td className="py-2 px-3 text-[11.09px] text-[#102A5B] font-semibold whitespace-nowrap">
                    <span className="inline-block max-w-[180px] truncate" title={item.itemsSummary}>
                      {item.itemsSummary}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[11.09px] text-[#102A5B] font-normal whitespace-nowrap">{item.reference}</td>
                  <td className="py-2 px-3 text-[11.09px] text-[#102A5B] font-normal whitespace-nowrap">{item.details}</td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-[6.68px] bg-[#F4F7FC] text-[#617198] text-[11px] font-semibold">{item.status}</span>
                  </td>
                  <td className="py-2 px-3 text-[11.09px] text-[#102A5B] font-bold whitespace-nowrap">AED {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {item.grnId ? (
                      <Link to={`/purchase-dashboard/grns/${item.grnId}`} className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-[6.68px] bg-[#EEF4FF] text-[#102A5B] text-[11.5px] font-bold hover:bg-[#dce7fd] transition-colors cursor-pointer">
                        <FileText size={12} className="text-[#00A9A8]" />
                        <span>{isRTL ? 'عرض GRN' : 'VIEW GRN'}</span>
                      </Link>
                    ) : (
                      <Link to={`/purchase-dashboard/purchase-orders/${item.id}/grn/new`} className="inline-flex items-center justify-center px-3 py-1 rounded-[6.68px] bg-[#E8FFF5] text-[#008366] text-[11.5px] font-semibold hover:bg-[#d5fbe9] transition-colors cursor-pointer">
                        {isRTL ? 'استلام' : 'RECEIVE'}
                      </Link>
                    )}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => navigate(`/purchase-dashboard/purchase-orders/view/${item.id}`)} className="w-[24.95px] h-[27.72px] border border-[#DBE5F3] rounded-[5.54px] flex items-center justify-center text-[#00A9A8] hover:bg-teal-50 transition-colors cursor-pointer" title={isRTL ? 'عرض أمر الشراء' : 'View Order'}><Eye size={12} /></button>
                      <button onClick={() => navigate(`/purchase-dashboard/purchase-orders/edit/${item.id}`)} className="w-[24.95px] h-[27.72px] border border-[#DBE5F3] rounded-[5.54px] flex items-center justify-center text-[#06275C] hover:bg-slate-100 transition-colors cursor-pointer" title={isRTL ? 'تعديل أمر الشراء' : 'Edit Order'}><Edit2 size={12} /></button>
                      <button onClick={() => handleDelete(item.id)} className="w-[24.95px] h-[27.72px] border border-[#DBE5F3] rounded-[5.54px] flex items-center justify-center text-[#D03D4E] hover:bg-rose-50 transition-colors cursor-pointer" title={isRTL ? 'حذف أمر الشراء' : 'Delete Order'}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Pagination Bar Outside Table Card */}
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

            {Array.from({ length: totalPages }, (_, i) => i).slice(Math.max(0, page - 2), Math.min(totalPages, page + 3)).map((pIndex) => (
              <button
                key={pIndex}
                onClick={() => setPage(pIndex)}
                className={`w-7 h-7 rounded font-semibold text-xs transition-colors cursor-pointer ${
                  page === pIndex
                    ? 'bg-[var(--color-sidebar-bg,#06275C)] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs'
                }`}
              >
                {pIndex + 1}
              </button>
            ))}

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

export default PurchaseOrderPage;
