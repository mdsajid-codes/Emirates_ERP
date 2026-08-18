import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Plus, Edit2, Trash2, Search, Calendar, RefreshCw, FileText,
  AlertCircle, Eye, DollarSign, TrendingUp, ShoppingCart
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { loadThemeFromStorage, applyTheme } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const PurchaseDebitNotePage = () => {
  const { isRTL, t } = useLanguage();
  const navigate = useNavigate();

  const [debitNotes, setDebitNotes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('May 20, 2025');

  // Search Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    const theme = loadThemeFromStorage();
    if (theme) applyTheme(theme);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [dnRes, locRes] = await Promise.all([
        axios.get(`${API_URL}/purchases/debit-notes`, {
          headers,
          params: { page: 0, size: 200, sort: 'createdAt,desc' }
        }),
        axios.get(`${API_URL}/locations`, { headers })
      ]);

      setDebitNotes(dnRes.data.content || dnRes.data || []);
      setLocations(Array.isArray(locRes.data) ? locRes.data : (locRes.data.content || []));
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(isRTL ? 'فشل تحميل بيانات إشعارات الخصم' : 'Failed to load debit notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const msg = isRTL ? 'هل أنت متأكد من رغبتك في حذف هذا الإشعار المدين؟' : 'Are you sure you want to delete this debit note?';
    if (!window.confirm(msg)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/purchases/debit-notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Failed to delete debit note', err);
      setError(isRTL ? 'تعذر حذف الإشعار المدين' : 'Failed to delete debit note.');
    }
  };

  // Filter Logic
  const filtered = debitNotes.filter(dn => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchNum = dn.debitNoteNumber && dn.debitNoteNumber.toLowerCase().includes(q);
      const matchBill = dn.billNumber && dn.billNumber.toLowerCase().includes(q);
      const matchSup = dn.supplierName && dn.supplierName.toLowerCase().includes(q);
      if (!matchNum && !matchBill && !matchSup) return false;
    }
    if (fromDate) {
      const dnDate = new Date(dn.debitNoteDate);
      const from = new Date(fromDate);
      if (dnDate < from) return false;
    }
    if (toDate) {
      const dnDate = new Date(dn.debitNoteDate);
      const to = new Date(toDate);
      if (dnDate > to) return false;
    }
    if (selectedLocation && String(dn.locationId) !== String(selectedLocation)) {
      return false;
    }
    return true;
  });

  const totalAmountSum = filtered.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalBalanceDueSum = filtered.reduce((sum, item) => sum + (Number(item.balanceDue) || 0), 0);

  return (
    <div className="p-3 lg:p-4 space-y-3 font-sans select-none text-[#18233B]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Section matching PurchaseOrderPage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-[22px] sm:text-[24px] font-bold text-[#172033] tracking-tight leading-none mb-1">
            {t('debitNote.title') || (isRTL ? 'إشعارات الخصم (إشعار مدين)' : 'Debit Notes')}
          </h1>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-medium text-[var(--color-primary,#00A9A8)] cursor-pointer hover:underline">
              {isRTL ? 'الرئيسية' : 'Home'}
            </span>
            <span className="text-[#617198]">/</span>
            <span className="font-medium text-[#617198]">{isRTL ? 'المشتريات' : 'Purchase'}</span>
            <span className="text-[#617198]">/</span>
            <span className="font-medium text-[#617198]">{isRTL ? 'إشعارات الخصم' : 'Debit Notes'}</span>
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
            onClick={fetchData}
            className="w-8 h-8 bg-white border border-[#E7EAF0] rounded-[10px] flex items-center justify-center text-[#657186] hover:bg-slate-50 shadow-xs cursor-pointer transition-all active:scale-95"
            title={isRTL ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[var(--color-primary,#00A9A8)]' : ''} />
          </button>

          {/* New Debit Note Button matching PO button */}
          <Link
            to="/purchase-dashboard/debit-notes/new"
            className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-[var(--color-primary,#00A9A8)] text-[var(--color-primary-foreground,#ffffff)] rounded-[var(--theme-border-radius,11px)] text-xs font-bold hover:opacity-95 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={16} className="text-white stroke-[2.5]" />
            <span>{t('debitNote.newDebitNote') || (isRTL ? 'إشعار جديد' : 'New Debit Note')}</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Stat Cards matching PurchaseOrderPage structure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Total Count */}
        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[var(--color-primary,#00A9A8)]/10 flex items-center justify-center text-[var(--color-primary,#00A9A8)] shrink-0">
            <FileText size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-[var(--color-primary,#00A9A8)] block truncate">
              {isRTL ? 'إجمالي الإشعارات' : 'Total Debit Notes'}
            </span>
            <span className="text-[20px] font-bold text-[#172033] block leading-tight">
              {filtered.length}
            </span>
          </div>
        </div>

        {/* Total Value */}
        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#F3F5F9] flex items-center justify-center text-[var(--color-primary,#00A9A8)] shrink-0">
            <DollarSign size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-[var(--color-primary,#00A9A8)] block truncate">
              {isRTL ? 'إجمالي القيمة' : 'Total Amount'}
            </span>
            <span className="text-[18px] sm:text-[20px] font-bold text-[#172033] block leading-tight truncate">
              AED {totalAmountSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total Balance Due */}
        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <TrendingUp size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-[var(--color-primary,#00A9A8)] block truncate">
              {isRTL ? 'المبلغ المستحق' : 'Total Balance Due'}
            </span>
            <span className="text-[18px] sm:text-[20px] font-bold text-rose-600 block leading-tight truncate">
              AED {totalBalanceDueSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
      <div className="bg-white border border-[#DBE5F3] rounded-[11.09px] overflow-hidden shadow-xs space-y-2 p-3">
        {/* Filter Section */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#DBE5F3]">
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} size={15} />
              <input
                type="text"
                placeholder={t('debitNote.searchPlaceholder') || (isRTL ? 'البحث برقم الإشعار، الفاتورة، المورد...' : 'Search by debit note #, bill #, supplier...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-1.5 bg-[#F8FAFC] border border-[#DCE5F3] rounded-[8px] text-xs font-medium text-[#172033] outline-none focus:border-[var(--color-primary,#00A9A8)] focus:bg-white transition-all`}
              />
            </div>

            {/* Date Range Inputs */}
            <div className="flex items-center gap-1 text-xs text-[#5F6F91]">
              <span>{isRTL ? 'من:' : 'From:'}</span>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="bg-[#F8FAFC] border border-[#DCE5F3] rounded px-2 py-1 text-xs text-[#172033] outline-none"
              />
              <span>{isRTL ? 'إلى:' : 'To:'}</span>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="bg-[#F8FAFC] border border-[#DCE5F3] rounded px-2 py-1 text-xs text-[#172033] outline-none"
              />
            </div>

            {/* Location Select */}
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="bg-[#F8FAFC] border border-[#DCE5F3] rounded px-2 py-1 text-xs text-[#172033] outline-none"
            >
              <option value="">{isRTL ? 'جميع المواقع' : 'All Locations'}</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div className="text-[11px] font-semibold text-[#617198]">
            {isRTL ? `عرض ${filtered.length} إشعار` : `Showing ${filtered.length} debit notes`}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2 text-xs font-semibold">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-2">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-[var(--color-primary,#00A9A8)] rounded-full animate-spin" />
            <p className="text-xs font-semibold text-[#617198]">{isRTL ? 'جاري التحميل...' : 'Loading Debit Notes...'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EEF5FF] border-b border-[#DBE5F3] text-[#102A5B] font-semibold text-[12px] h-[38.39px]">
                  <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'ت' : 'S.No.'}</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'التاريخ' : 'Date'}</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'رقم الإشعار' : 'Debit Notes#'}</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'رقم الفاتورة' : 'Bill No#'}</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'المورد' : 'Supplier Name'}</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'المبلغ (AED)' : 'Amount (AED)'}</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'المستحق (AED)' : 'Balance Due (AED)'}</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-center">{isRTL ? 'الإجراء' : 'Operation'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DBE5F3]">
                {filtered.length > 0 ? (
                  filtered.map((dn, index) => (
                    <tr key={dn.id} className="hover:bg-slate-50/80 transition-colors h-[42.39px] text-xs">
                      <td className="py-2 px-3 text-[#5F6F91] whitespace-nowrap">{index + 1}</td>
                      <td className="py-2 px-3 text-[#5F6F91] whitespace-nowrap">
                        {dn.debitNoteDate ? new Date(dn.debitNoteDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td
                        onClick={() => navigate(`/purchase-dashboard/debit-notes/view/${dn.id}`)}
                        className="py-2 px-3 font-semibold text-[var(--color-primary,#00A9A8)] hover:underline cursor-pointer whitespace-nowrap"
                      >
                        {dn.debitNoteNumber || '—'}
                      </td>
                      <td className="py-2 px-3 font-medium text-[#102A5B] whitespace-nowrap">{dn.billNumber || '—'}</td>
                      <td className="py-2 px-3 font-semibold text-[#102A5B] whitespace-nowrap">{dn.supplierName || '—'}</td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-[6px] text-[11px] font-semibold border ${dn.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            dn.status === 'CLOSED' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                              dn.status === 'VOID' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                'bg-sky-50 text-sky-700 border-sky-200'
                          }`}>
                          {dn.status || 'OPEN'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-[#172033] whitespace-nowrap">
                        AED {(Number(dn.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-rose-600 whitespace-nowrap">
                        AED {(Number(dn.balanceDue) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/purchase-dashboard/debit-notes/view/${dn.id}`)}
                            className="p-1 text-slate-400 hover:text-[var(--color-primary,#00A9A8)] hover:bg-slate-100 rounded transition-colors"
                            title={isRTL ? 'عرض' : 'View'}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => navigate(`/purchase-dashboard/debit-notes/edit/${dn.id}`)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title={isRTL ? 'تعديل' : 'Edit'}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(dn.id)}
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
                    <td colSpan="9" className="py-10 text-center text-slate-400">
                      <AlertCircle className="mx-auto h-8 w-8 text-slate-300 mb-1" />
                      <p className="text-xs font-semibold text-slate-600">
                        {isRTL ? 'لا توجد إشعارات خصم مطابقة' : 'No record available'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseDebitNotePage;

