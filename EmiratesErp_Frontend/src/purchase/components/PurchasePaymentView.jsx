import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Printer, ArrowLeft, ArrowRight, Edit, CreditCard,
  BadgeCheck, Info
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { loadThemeFromStorage, applyTheme } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const PurchasePaymentView = () => {
  const { isRTL } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tenantInfo, setTenantInfo] = useState({ name: '', address: '', logo: '' });
  const [supplierInfo, setSupplierInfo] = useState(null);

  useEffect(() => {
    const theme = loadThemeFromStorage();
    if (theme) applyTheme(theme);
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchPaymentDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${API_URL}/purchases/payments/${id}`, { headers });
        const data = res.data;
        setPayment(data);

        const tenantId = localStorage.getItem('tenantId');
        if (tenantId) {
          try {
            const tRes = await axios.get(`${API_URL}/tenants/${tenantId}`, { headers });
            setTenantInfo(tRes.data);
          } catch (e) {
            console.warn('Failed to load tenant info', e);
          }
        }

        if (data.supplierId) {
          try {
            const sRes = await axios.get(`${API_URL}/parties/${data.supplierId}`, { headers });
            setSupplierInfo(sRes.data);
          } catch (e) {
            console.warn('Failed to load supplier details', e);
          }
        }
      } catch (err) {
        console.error('Error loading payment voucher:', err);
        setError(isRTL ? 'تعذر استخراج بيانات سند الدفع' : 'Failed to load purchase payment voucher details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [id, isRTL]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#F7F9FD] gap-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--color-primary,#00A9A8)] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#0A2551]">{isRTL ? 'جاري تحميل سند الدفع...' : 'Loading Payment Voucher...'}</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-8 text-center text-rose-500 font-bold bg-white m-4 rounded-xl border border-rose-200">
        {error || (isRTL ? 'سند الدفع غير موجود' : 'Payment Voucher Not Found')}
      </div>
    );
  }

  const amountVal = Number(payment.amount) || 0;
  const usedVal = Number(payment.amountPaid) || 0;
  const excessVal = Number(payment.amountInExcess) || 0;

  return (
    <div className="bg-[#F7F9FD] min-h-screen text-[#0A2551] font-sans pb-10 -mt-3 lg:-mt-4 -mx-3 lg:-mx-4" dir={isRTL ? 'rtl' : 'ltr'}>
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
              <CreditCard size={30} strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#617191] uppercase tracking-wider block">
                {isRTL ? 'سند دفع المشتريات' : 'PURCHASE PAYMENT VOUCHER'}
              </span>
              <h1 className="text-2xl font-black text-[#0A2551] tracking-tight leading-none mt-0.5">
                {payment.reference || `PAY-${payment.id}`}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-0.5 bg-[#DCFAEE] text-[#138764] rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <BadgeCheck size={12} /> {isRTL ? 'مدفوع وموثق' : 'POSTED & VERIFIED'}
                </span>
                <span className="px-2.5 py-0.5 bg-[#F2F6FC] text-[#617191] rounded-md text-[11px] font-semibold flex items-center gap-1">
                  <Info size={11} /> {payment.paymentMode || 'Cash'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(`/purchase-dashboard/payments/edit/${payment.id}`)}
              className="flex items-center gap-2 h-[38px] px-4 bg-white border border-[#DFE7F4] rounded-xl text-xs font-bold hover:border-[var(--color-primary,#00A9A8)] hover:text-[var(--color-primary,#00A9A8)] transition-all cursor-pointer"
            >
              <Edit size={14} /> {isRTL ? 'تعديل السند' : 'Edit Voucher'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 h-[38px] px-4 bg-[var(--color-primary,#00A9A8)] text-white rounded-xl text-xs font-bold hover:opacity-95 transition-all cursor-pointer shadow-xs"
            >
              <Printer size={14} /> {isRTL ? 'طباعة سند الدفع' : 'Print Voucher'}
            </button>
          </div>
        </div>

        {/* Executive Payment Voucher Card */}
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
                {isRTL ? 'إيصال دفع رسمي' : 'OFFICIAL PAYMENT RECEIPT'}
              </div>
              <p className="text-xs font-semibold text-[#102A5B]">
                {isRTL ? 'المرجع:' : 'Reference:'} <span className="font-bold">{payment.reference || `PAY-${payment.id}`}</span>
              </p>
              <p className="text-xs text-[#5F6F91]">
                {isRTL ? 'التاريخ:' : 'Date:'} {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E4EAF0]">
            <div>
              <span className="text-[11px] font-bold text-[#617198] uppercase block mb-0.5">
                {isRTL ? 'المورد / الطرف' : 'PAID TO (SUPPLIER)'}
              </span>
              <p className="text-sm font-bold text-[#102A5B]">{payment.supplierName || '—'}</p>
              {supplierInfo?.code && <p className="text-xs text-[#5F6F91]">{isRTL ? 'رمز المورد:' : 'Code:'} {supplierInfo.code}</p>}
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#617198] uppercase block mb-0.5">
                {isRTL ? 'طريقة الدفع' : 'PAYMENT METHOD'}
              </span>
              <p className="text-sm font-bold text-[#102A5B]">{payment.paymentMode || 'Cash'}</p>
              {payment.chequeNumber && <p className="text-xs text-[#5F6F91]">{isRTL ? 'رقم الشيك:' : 'Cheque:'} {payment.chequeNumber}</p>}
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#617198] uppercase block mb-0.5">
                {isRTL ? 'الحساب المدفوع منه' : 'PAID THROUGH'}
              </span>
              <p className="text-sm font-bold text-[#102A5B]">{payment.paidThrough || 'Petty Cash'}</p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#617198] uppercase block mb-0.5">
                {isRTL ? 'المبلغ الإجمالي (AED)' : 'TOTAL PAID (AED)'}
              </span>
              <p className="text-lg font-black text-[var(--color-primary,#00A9A8)]">
                AED {amountVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#102A5B]">
              {isRTL ? 'تسوية فواتير المشتريات المخصصة' : 'Settled Invoices Breakdown'}
            </h3>

            <div className="border border-[#DBE5F3] rounded-[11.09px] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EEF5FF] border-b border-[#DBE5F3] text-[#102A5B] font-semibold text-[12px] h-[38.39px]">
                    <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'رقم المستند' : 'Invoice / Expense #'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'المبلغ المخصص (AED)' : 'Allocated Amount (AED)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DBE5F3]">
                  {payment.allocations && payment.allocations.length > 0 ? (
                    payment.allocations.map((alloc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors h-[42.39px] text-xs">
                        <td className="py-2 px-3 font-semibold text-[#102A5B] whitespace-nowrap">
                          {alloc.invoiceNumber || alloc.invoiceId ? `INV-${alloc.invoiceId}` : `EXP-${alloc.additionalExpenseId}`}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-[#172033] whitespace-nowrap">
                          AED {(Number(alloc.allocatedAmount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="py-6 text-center text-xs text-[#5F6F91]">
                        {isRTL ? 'لم يتم تخصيص هذا المبلغ لفواتير محددة (مسجل كمبلغ على الحساب).' : 'Payment received on-account without specific bill allocations.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-80 bg-[#F8FAFC] border border-[#DFE7F4] rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs text-[#5F6F91]">
                <span>{isRTL ? 'المبلغ المدفوع:' : 'Total Amount Received:'}</span>
                <span className="font-bold text-[#102A5B]">AED {amountVal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#5F6F91]">
                <span>{isRTL ? 'المبلغ المستغل للفواتير:' : 'Amount Applied:'}</span>
                <span className="font-bold text-[#102A5B]">AED {usedVal.toFixed(2)}</span>
              </div>
              <div className="border-t border-[#DFE7F4] pt-2 flex justify-between items-center text-xs font-bold text-emerald-600">
                <span>{isRTL ? 'المبلغ الفائض على الحساب:' : 'Excess / On Account:'}</span>
                <span>AED {excessVal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {payment.notes && (
            <div className="pt-2 border-t border-[#E4EAF0]">
              <span className="text-[11px] font-bold text-[#617198] uppercase block mb-1">
                {isRTL ? 'الملاحظات:' : 'Notes / Remarks:'}
              </span>
              <p className="text-xs text-[#5F6F91] italic bg-[#F8FAFC] p-3 rounded-lg border border-[#E4EAF0]">
                {payment.notes}
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

export default PurchasePaymentView;
