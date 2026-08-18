import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Plus, Edit2, Trash2, Search, Calendar, RefreshCw, FileText,
  AlertCircle, Eye, ShieldCheck, DollarSign, FileCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { loadThemeFromStorage, applyTheme } from '../../utils/themeUtils';
import Pagination from '../../components/Pagination';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const PurCustomDeclarationPage = () => {
  const { isRTL, t } = useLanguage();
  const navigate = useNavigate();

  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('May 20, 2025');

  // Pagination State
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const theme = loadThemeFromStorage();
    if (theme) applyTheme(theme);
  }, []);

  const fetchDeclarations = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/purchases/custom-declarations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = res.data || [];
      setDeclarations(data);
      setTotalPages(1);
      setTotalElements(data.length);
    } catch (err) {
      console.error('Failed to fetch custom declarations:', err);
      setError(isRTL ? 'فشل تحميل البيانات الجمركية' : 'Failed to fetch custom declarations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeclarations();
  }, [page, size]);

  const handleDelete = async (id) => {
    const msg = isRTL ? 'هل أنت متأكد من حذف هذا البيان الجمركي؟' : 'Are you sure you want to delete this custom declaration?';
    if (!window.confirm(msg)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/purchases/custom-declarations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDeclarations();
    } catch (err) {
      console.error('Failed to delete custom declaration', err);
      setError(isRTL ? 'تعذر حذف البيان الجمركي' : 'Failed to delete custom declaration.');
    }
  };

  const filtered = declarations.filter(decl =>
    (decl.declarationNumber && decl.declarationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (decl.companyName && decl.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalCustomsDue = filtered.reduce((sum, item) => sum + (Number(item.totalDue) || 0), 0);
  const totalVatRcm = filtered.reduce((sum, item) => sum + (Number(item.vatRcmTotal) || 0), 0);

  return (
    <div className="p-3 lg:p-4 space-y-3 font-sans select-none text-[#18233B]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Section matching PurchaseOrderPage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-[22px] sm:text-[24px] font-bold text-[#172033] tracking-tight leading-none mb-1">
            {t('customDeclaration.title') || (isRTL ? 'البيانات الجمركية' : 'Custom Declarations')}
          </h1>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-medium text-[var(--color-primary,#00A9A8)] cursor-pointer hover:underline">
              {isRTL ? 'الرئيسية' : 'Home'}
            </span>
            <span className="text-[#617198]">/</span>
            <span className="font-medium text-[#617198]">{isRTL ? 'المشتريات' : 'Purchase'}</span>
            <span className="text-[#617198]">/</span>
            <span className="font-medium text-[#617198]">{isRTL ? 'البيانات الجمركية' : 'Custom Declarations'}</span>
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
            onClick={fetchDeclarations}
            className="w-8 h-8 bg-white border border-[#E7EAF0] rounded-[10px] flex items-center justify-center text-[#657186] hover:bg-slate-50 shadow-xs cursor-pointer transition-all active:scale-95"
            title={isRTL ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[var(--color-primary,#00A9A8)]' : ''} />
          </button>

          {/* New Custom Declaration Button matching PO button */}
          <Link
            to="/purchase-dashboard/custom-declarations/new"
            className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-[var(--color-primary,#00A9A8)] text-[var(--color-primary-foreground,#ffffff)] rounded-[var(--theme-border-radius,11px)] text-xs font-bold hover:opacity-95 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={16} className="text-white stroke-[2.5]" />
            <span>{t('customDeclaration.newDeclaration') || (isRTL ? 'بيان جمركي جديد' : 'New Custom Declaration')}</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Stat Cards matching PurchaseOrderPage structure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Total Declarations */}
        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[var(--color-primary,#00A9A8)]/10 flex items-center justify-center text-[var(--color-primary,#00A9A8)] shrink-0">
            <FileCheck size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-[var(--color-primary,#00A9A8)] block truncate">
              {isRTL ? 'إجمالي البيانات' : 'Total Declarations'}
            </span>
            <span className="text-[20px] font-bold text-[#172033] block leading-tight">
              {totalElements}
            </span>
          </div>
        </div>

        {/* Total Customs Due Amount */}
        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#F3F5F9] flex items-center justify-center text-[var(--color-primary,#00A9A8)] shrink-0">
            <DollarSign size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-[var(--color-primary,#00A9A8)] block truncate">
              {isRTL ? 'مستحقات الجمارك' : 'Total Customs Due'}
            </span>
            <span className="text-[18px] sm:text-[20px] font-bold text-[#172033] block leading-tight truncate">
              AED {totalCustomsDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total VAT Reverse Charge */}
        <div className="bg-white border border-[#E4EAF0] rounded-[11.86px] p-3 shadow-[0px_0.988px_2.965px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <ShieldCheck size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-[var(--color-primary,#00A9A8)] block truncate">
              {isRTL ? 'ضريبة الاحتساب العكسي' : 'VAT (Reverse Charge)'}
            </span>
            <span className="text-[18px] sm:text-[20px] font-bold text-[#172033] block leading-tight truncate">
              AED {totalVatRcm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              placeholder={t('customDeclaration.searchPlaceholder') || (isRTL ? 'البحث برقم البيان أو الشركة...' : 'Search by Number / Company...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-1.5 bg-[#F8FAFC] border border-[#DCE5F3] rounded-[8px] text-xs font-medium text-[#172033] outline-none focus:border-[var(--color-primary,#00A9A8)] focus:bg-white transition-all`}
            />
          </div>
          <div className="text-[11px] font-semibold text-[#617198]">
            {isRTL ? `عرض ${filtered.length} من أصل ${totalElements}` : `Showing ${filtered.length} of ${totalElements}`}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold m-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-2">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-[var(--color-primary,#00A9A8)] rounded-full animate-spin" />
            <p className="text-xs font-semibold text-[#617198]">{isRTL ? 'جاري التحميل...' : 'Loading Declarations...'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EEF5FF] border-b border-[#DBE5F3] text-[#102A5B] font-semibold text-[12px] h-[38.39px]">
                    <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'التاريخ' : 'Date'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'رقم البيان' : 'Declaration No.'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'الشركة / مخلص الجمارك' : 'Company / Agent'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'إجمالي المستحق الجمركي (AED)' : 'Total Due (AED)'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'ضريبة الاحتساب العكسي (AED)' : 'VAT (RCM) (AED)'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'الحالة' : 'Status'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">{isRTL ? 'الإجراء' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DBE5F3]">
                  {filtered.length > 0 ? (
                    filtered.map((decl) => (
                      <tr key={decl.id} className="hover:bg-slate-50/80 transition-colors h-[42.39px] text-xs">
                        <td className="py-2 px-3 text-[#5F6F91] whitespace-nowrap">
                          {decl.date ? new Date(decl.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="py-2 px-3 font-semibold text-[var(--color-primary,#00A9A8)] whitespace-nowrap">
                          <Link to={`/purchase-dashboard/custom-declarations/view/${decl.id}`} className="hover:underline flex items-center gap-1">
                            <FileText size={13} className="text-slate-400 shrink-0" />
                            <span>{decl.declarationNumber || `DEC-${decl.id}`}</span>
                          </Link>
                        </td>
                        <td className="py-2 px-3 font-semibold text-[#102A5B] whitespace-nowrap">{decl.companyName || '—'}</td>
                        <td className="py-2 px-3 text-right font-bold text-[#172033] whitespace-nowrap">
                          AED {(Number(decl.totalDue) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-[#5F6F91] whitespace-nowrap">
                          AED {(Number(decl.vatRcmTotal) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-[6px] text-[11px] font-semibold border ${decl.status === 'POSTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              decl.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                            {decl.status || 'Draft'}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => navigate(`/purchase-dashboard/custom-declarations/view/${decl.id}`)}
                              className="p-1 text-slate-400 hover:text-[var(--color-primary,#00A9A8)] hover:bg-slate-100 rounded transition-colors"
                              title={isRTL ? 'عرض' : 'View'}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => navigate(`/purchase-dashboard/custom-declarations/edit/${decl.id}`)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title={isRTL ? 'تعديل' : 'Edit'}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(decl.id)}
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
                      <td colSpan="7" className="py-10 text-center text-slate-400">
                        <AlertCircle className="mx-auto h-8 w-8 text-slate-300 mb-1" />
                        <p className="text-xs font-semibold text-slate-600">
                          {isRTL ? 'لا توجد بيانات جمركية مطابقة' : 'No custom declarations found'}
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

export default PurCustomDeclarationPage;
