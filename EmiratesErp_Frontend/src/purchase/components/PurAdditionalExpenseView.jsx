import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Printer, ArrowLeft, ArrowRight, Edit, FileText, BadgeCheck, Info
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { loadThemeFromStorage, applyTheme } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const PurAdditionalExpenseView = () => {
  const { isRTL } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tenantInfo, setTenantInfo] = useState({ name: 'Emirates ERP Trading LLC', address: 'Dubai, UAE', trn: '100293848100003' });

  useEffect(() => {
    const theme = loadThemeFromStorage();
    if (theme) applyTheme(theme);
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(`${API_URL}/purchases/additional-expenses/${id}`, { headers });
        setExpense(res.data);

        const tenantId = localStorage.getItem('tenantId');
        if (tenantId) {
          try {
            const tRes = await axios.get(`${API_URL}/tenants/${tenantId}`, { headers });
            setTenantInfo(tRes.data);
          } catch (e) {
            console.warn('Failed to load tenant info', e);
          }
        }
      } catch (err) {
        console.error('Error loading Additional Expense:', err);
        setError(isRTL ? 'تعذر استخراج بيانات المصروف الإضافي' : 'Failed to load expense manifest.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, isRTL]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#F7F9FD] gap-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--color-primary,#00A9A8)] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#0A2551]">{isRTL ? 'جاري تحميل المصروف...' : 'Loading Expense Details...'}</p>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="p-8 text-center text-rose-500 font-bold bg-white m-4 rounded-xl border border-rose-200">
        {error || (isRTL ? 'المصروف غير موجود' : 'Expense Record Not Found')}
      </div>
    );
  }

  const expenseLines = expense.expenseLines || [];
  const inventoryItems = expense.inventoryItems || [];
  const netAmount = Number(expense.totalAmount) || expenseLines.reduce((sum, l) => sum + (Number(l.totalAmount) || 0), 0);

  return (
    <div className="bg-[#F7F9FD] min-h-screen text-[#0A2551] font-sans pb-10 -mt-3 lg:-mt-4 -mx-3 lg:-mx-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Printable Area Wrapper */}
      <div className="w-full px-4 pt-3 pb-4 space-y-3 print:px-0 print:pt-0">
        {/* Top Header Card matching PurchaseOrderView */}
        <div className="bg-white border border-[#DFE7F4] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-[#0A2551]"
            >
              {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
            </button>
            <div className="w-14 h-14 bg-[var(--color-primary,#00A9A8)] rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
              <FileText size={30} strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#617191] uppercase tracking-wider block">
                {isRTL ? 'سند المصاريف الإضافية' : 'PURCHASE ADDITIONAL EXPENSE'}
              </span>
              <h1 className="text-2xl font-black text-[#0A2551] tracking-tight leading-none mt-0.5">
                {expense.number || `EXP-${expense.id}`}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-0.5 bg-[#DCFAEE] text-[#138764] rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <BadgeCheck size={12} /> {expense.status || 'Draft'}
                </span>
                <span className="px-2.5 py-0.5 bg-[#F2F6FC] text-[#617191] rounded-md text-[11px] font-semibold flex items-center gap-1">
                  <Info size={11} /> {isRTL ? `نوع المعاملة: ${expense.transactionType || 'For Purchase'}` : `Type: ${expense.transactionType || 'For Purchase'}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(`/purchase-dashboard/additional-expenses/edit/${expense.id}`)}
              className="flex items-center gap-2 h-[38px] px-4 bg-white border border-[#DFE7F4] rounded-xl text-xs font-bold hover:border-[var(--color-primary,#00A9A8)] hover:text-[var(--color-primary,#00A9A8)] transition-all cursor-pointer"
            >
              <Edit size={14} /> {isRTL ? 'تعديل السند' : 'Edit Expense'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 h-[38px] px-4 bg-[var(--color-primary,#00A9A8)] text-white rounded-xl text-xs font-bold hover:opacity-95 transition-all cursor-pointer shadow-xs"
            >
              <Printer size={14} /> {isRTL ? 'طباعة السند' : 'Print Voucher'}
            </button>
          </div>
        </div>

        {/* Executive Voucher Card */}
        <div className="bg-white border border-[#DFE7F4] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs print:shadow-none print:border-none print:p-0">
          <div className="border-b border-[#E4EAF0] pb-6 flex flex-wrap justify-between items-start gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#102A5B]">
                {tenantInfo.name || 'Emirates ERP Trading LLC'}
              </h2>
              <p className="text-xs text-[#5F6F91] mt-1 max-w-sm">
                {tenantInfo.address || 'Dubai Business Bay, United Arab Emirates'}
              </p>
              <p className="text-xs text-[#5F6F91]">TRN: {tenantInfo.trn || '100293848100003'}</p>
            </div>

            <div className={`text-${isRTL ? 'left' : 'right'}`}>
              <div className="inline-block px-3 py-1 bg-[var(--color-primary,#00A9A8)]/10 text-[var(--color-primary,#00A9A8)] rounded-lg text-xs font-extrabold uppercase tracking-wider mb-2">
                {isRTL ? 'سند مصاريف إضافية رسمي' : 'OFFICIAL EXPENSE VOUCHER'}
              </div>
              <p className="text-xs font-semibold text-[#102A5B]">
                {isRTL ? 'رقم السند:' : 'Expense #:'} <span className="font-bold">{expense.number || `EXP-${expense.id}`}</span>
              </p>
              <p className="text-xs text-[#5F6F91]">
                {isRTL ? 'التاريخ:' : 'Date:'} {expense.date ? new Date(expense.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

          {/* Supplier & Expense Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E4EAF0]">
            <div>
              <span className="text-[11px] font-bold text-[#617198] uppercase block mb-0.5">
                {isRTL ? 'المورد / الشركة' : 'SUPPLIER NAME'}
              </span>
              <p className="text-sm font-bold text-[#102A5B]">{expense.supplierName || '—'}</p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#617198] uppercase block mb-0.5">
                {isRTL ? 'أمر الشراء المرتبط' : 'PURCHASE ORDER'}
              </span>
              <p className="text-sm font-bold text-[#102A5B]">{expense.purchaseOrderNumber || (expense.purchaseOrderId ? `PO-${expense.purchaseOrderId}` : 'N/A')}</p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#617198] uppercase block mb-0.5">
                {isRTL ? 'العملة والمعامل' : 'CURRENCY & EXCHANGE'}
              </span>
              <p className="text-xs font-bold text-[#102A5B]">{expense.currency || 'AED'} (Rate: {expense.exchangeRate || 1})</p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#617198] uppercase block mb-0.5">
                {isRTL ? 'إجمالي المصاريف (AED)' : 'TOTAL EXPENSE (AED)'}
              </span>
              <p className="text-lg font-black text-[var(--color-primary,#00A9A8)]">
                AED {netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Expense Lines Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#102A5B]">
              {isRTL ? 'تفاصيل بنود المصاريف الإضافية' : 'Additional Expense Lines'}
            </h3>

            <div className="border border-[#DBE5F3] rounded-[11.09px] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EEF5FF] border-b border-[#DBE5F3] text-[#102A5B] font-semibold text-[12px] h-[38.39px]">
                    <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'ت' : 'S.No.'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'نوع التكلفة / الخدمة' : 'Expense / Cost Type'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'المبلغ (AED)' : 'Amount (AED)'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'الضريبة (AED)' : 'VAT Amount'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'الإجمالي (AED)' : 'Total (AED)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DBE5F3]">
                  {expenseLines.length > 0 ? (
                    expenseLines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors h-[42.39px] text-xs">
                        <td className="py-2 px-3 text-[#5F6F91] whitespace-nowrap">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-[#102A5B] whitespace-nowrap">
                          {line.costType || line.productName || `Expense Line #${idx + 1}`}
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-[#102A5B] whitespace-nowrap">
                          AED {(Number(line.amount) || 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right text-[#5F6F91] whitespace-nowrap">
                          AED {(Number(line.taxValue) || 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-[#172033] whitespace-nowrap">
                          AED {(Number(line.totalAmount) || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-xs text-[#5F6F91]">
                        {isRTL ? 'لا تتوفر بنود مصاريف إضافية مسجلة' : 'No expense lines recorded.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Allocated Inventory Items Table if available */}
          {inventoryItems.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-[#102A5B]">
                {isRTL ? 'توزيع التكلفة على أصناف المخزون' : 'Allocated Inventory Items Breakdown'}
              </h3>

              <div className="border border-[#DBE5F3] rounded-[11.09px] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EEF5FF] border-b border-[#DBE5F3] text-[#102A5B] font-semibold text-[12px] h-[38.39px]">
                      <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'نوع المستند' : 'Document'}</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'الصنف / المنتج' : 'Product Name'}</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'الكمية' : 'Qty'}</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'المبلغ الموزع (AED)' : 'Allocated Expense'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DBE5F3]">
                    {inventoryItems.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors h-[42.39px] text-xs">
                        <td className="py-2 px-3 text-[#5F6F91] whitespace-nowrap">{inv.documentType} ({inv.documentId})</td>
                        <td className="py-2 px-3 font-semibold text-[#102A5B] whitespace-nowrap">{inv.productName || `Product #${inv.productId}`}</td>
                        <td className="py-2 px-3 text-right font-medium text-[#102A5B] whitespace-nowrap">{inv.quantity}</td>
                        <td className="py-2 px-3 text-right font-bold text-[var(--color-primary,#00A9A8)] whitespace-nowrap">
                          AED {(Number(inv.expenseAmount) || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes & Signatures */}
          {expense.comment && (
            <div className="pt-2 border-t border-[#E4EAF0]">
              <span className="text-[11px] font-bold text-[#617198] uppercase block mb-1">
                {isRTL ? 'البيان والملاحظات:' : 'Remarks / Comments:'}
              </span>
              <p className="text-xs text-[#5F6F91] italic bg-[#F8FAFC] p-3 rounded-lg border border-[#E4EAF0]">
                {expense.comment}
              </p>
            </div>
          )}

          <div className="pt-10 border-t border-[#E4EAF0] grid grid-cols-2 gap-8 text-center text-xs font-semibold text-[#5F6F91]">
            <div>
              <div className="border-b border-[#DCE5F3] h-12 mb-1" />
              <span>{isRTL ? 'توقيع المحاسب / إعداد' : 'Prepared By (Accountant)'}</span>
            </div>
            <div>
              <div className="border-b border-[#DCE5F3] h-12 mb-1" />
              <span>{isRTL ? 'توقيع المعتمد / الاعتماد' : 'Authorized Signatory'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurAdditionalExpenseView;
