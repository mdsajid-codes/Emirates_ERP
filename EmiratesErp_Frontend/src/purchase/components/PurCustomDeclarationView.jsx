import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Printer, ArrowLeft, ArrowRight, Edit, FileText, BadgeCheck, Info
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { loadThemeFromStorage, applyTheme } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const PurCustomDeclarationView = () => {
  const { isRTL } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  const [declaration, setDeclaration] = useState(null);
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

        const res = await axios.get(`${API_URL}/purchases/custom-declarations/${id}`, { headers });
        setDeclaration(res.data);

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
        console.error('Error loading Custom Declaration:', err);
        setError(isRTL ? 'تعذر استخراج بيانات البيان الجمركي' : 'Failed to load declaration manifest.');
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
        <p className="text-xs font-semibold text-[#0A2551]">{isRTL ? 'جاري تحميل البيان الجمركي...' : 'Loading Custom Declaration...'}</p>
      </div>
    );
  }

  if (!declaration) {
    return (
      <div className="p-8 text-center text-rose-500 font-bold bg-white m-4 rounded-xl border border-rose-200">
        {error || (isRTL ? 'البيان الجمركي غير موجود' : 'Custom Declaration Record Not Found')}
      </div>
    );
  }

  const lines = declaration.lines || [];
  const dutyTotal = lines.reduce((sum, l) => sum + (Number(l.dutyAmount) || 0), 0);
  const vatTotal = lines.reduce((sum, l) => sum + (Number(l.vatAmount) || 0), 0);
  const totalDue = Number(declaration.totalDue) || (dutyTotal + (Number(declaration.serviceCharge) || 0));

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
                {isRTL ? 'بيان جمركي رسمي (استيراد)' : 'OFFICIAL CUSTOM DECLARATION'}
              </span>
              <h1 className="text-2xl font-black text-[#0A2551] tracking-tight leading-none mt-0.5">
                {declaration.declarationNumber || `DEC-${declaration.id}`}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-0.5 bg-[#DCFAEE] text-[#138764] rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <BadgeCheck size={12} /> {declaration.status || 'Draft'}
                </span>
                <span className="px-2.5 py-0.5 bg-[#F2F6FC] text-[#617191] rounded-md text-[11px] font-semibold flex items-center gap-1">
                  <Info size={11} /> {isRTL ? `المخلص/الشركة: ${declaration.companyName || '—'}` : `Agent: ${declaration.companyName || '—'}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(`/purchase-dashboard/custom-declarations/edit/${declaration.id}`)}
              className="flex items-center gap-2 h-[38px] px-4 bg-white border border-[#DFE7F4] rounded-xl text-xs font-bold hover:border-[var(--color-primary,#00A9A8)] hover:text-[var(--color-primary,#00A9A8)] transition-all cursor-pointer"
            >
              <Edit size={14} /> {isRTL ? 'تعديل البيان' : 'Edit Declaration'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 h-[38px] px-4 bg-[var(--color-primary,#00A9A8)] text-white rounded-xl text-xs font-bold hover:opacity-95 transition-all cursor-pointer shadow-xs"
            >
              <Printer size={14} /> {isRTL ? 'طباعة البيان' : 'Print Manifest'}
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
                {isRTL ? 'سند بيان جمركي' : 'CUSTOMS MANIFEST'}
              </div>
              <p className="text-xs font-semibold text-[#102A5B]">
                {isRTL ? 'رقم البيان:' : 'Declaration #:'} <span className="font-bold">{declaration.declarationNumber || `DEC-${declaration.id}`}</span>
              </p>
              <p className="text-xs text-[#5F6F91]">
                {isRTL ? 'التاريخ:' : 'Date:'} {declaration.createdAt ? new Date(declaration.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

          {/* Declaration Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E4EAF0]">
            <div>
              <span className="text-[11px] font-bold text-[#617198] uppercase block mb-0.5">
                {isRTL ? 'مخلص الجمارك / الشركة' : 'CUSTOMS AGENT'}
              </span>
              <p className="text-sm font-bold text-[#102A5B]">{declaration.companyName || '—'}</p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#617198] uppercase block mb-0.5">
                {isRTL ? 'وضع دفع الضريبة' : 'TAX PAYMENT MODE'}
              </span>
              <p className="text-xs font-bold text-[#102A5B]">{declaration.taxIsDue === 'USE_IN_TAX_RETURN' ? 'Reverse Charge (RCM)' : 'Pay Directly'}</p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#617198] uppercase block mb-0.5">
                {isRTL ? 'رسوم الخدمة' : 'SERVICE CHARGES'}
              </span>
              <p className="text-xs font-bold text-[#102A5B]">AED {(Number(declaration.serviceCharge) || 0).toFixed(2)}</p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#617198] uppercase block mb-0.5">
                {isRTL ? 'إجمالي المستحق الجمركي (AED)' : 'TOTAL CUSTOMS DUE'}
              </span>
              <p className="text-lg font-black text-[var(--color-primary,#00A9A8)]">
                AED {totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Declaration Items Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#102A5B]">
              {isRTL ? 'تفاصيل البضائع المستوردة والرسوم الجمركية' : 'Imported Goods Customs Line Items'}
            </h3>

            <div className="border border-[#DBE5F3] rounded-[11.09px] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EEF5FF] border-b border-[#DBE5F3] text-[#102A5B] font-semibold text-[12px] h-[38.39px]">
                    <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'ت' : 'S.No.'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'الصنف / المنتج' : 'Item / Description'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'رمز HS' : 'HS Code'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'CIF الوطنية (AED)' : 'CIF National'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">{isRTL ? 'نسبة الجمرك' : 'Duty %'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'رسوم الجمرك (AED)' : 'Duty Amt'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'ضريبة RCM (AED)' : 'VAT RCM Amt'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DBE5F3]">
                  {lines.length > 0 ? (
                    lines.map((l, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors h-[42.39px] text-xs">
                        <td className="py-2 px-3 text-[#5F6F91] whitespace-nowrap">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-[#102A5B] whitespace-nowrap">
                          {l.description || l.itemName || `Item #${l.itemId}`}
                        </td>
                        <td className="py-2 px-3 font-mono text-[#5F6F91] whitespace-nowrap">{l.hsCode || '—'}</td>
                        <td className="py-2 px-3 text-right font-medium text-[#102A5B] whitespace-nowrap">
                          AED {(Number(l.cifNational) || 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-center text-[#5F6F91] whitespace-nowrap">{l.dutyRate}%</td>
                        <td className="py-2 px-3 text-right font-bold text-[var(--color-primary,#00A9A8)] whitespace-nowrap">
                          AED {(Number(l.dutyAmount) || 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-indigo-600 whitespace-nowrap">
                          AED {(Number(l.vatAmount) || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-xs text-[#5F6F91]">
                        {isRTL ? 'لا تتوفر بنود بضائع مسجلة' : 'No line items recorded.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Declaration Financial Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-80 bg-[#F8FAFC] border border-[#DFE7F4] rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs text-[#5F6F91]">
                <span>{isRTL ? 'إجمالي رسوم الجمرك:' : 'Customs Duty Total:'}</span>
                <span className="font-bold text-[#102A5B]">AED {dutyTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#5F6F91]">
                <span>{isRTL ? 'إجمالي ضريبة RCM:' : 'VAT Reverse Charge:'}</span>
                <span className="font-bold text-indigo-600">AED {vatTotal.toFixed(2)}</span>
              </div>
              <div className="border-t border-[#DFE7F4] pt-2 flex justify-between items-center text-xs font-bold text-[var(--color-primary,#00A9A8)]">
                <span>{isRTL ? 'إجمالي المستحق الجمركي:' : 'Total Customs Due:'}</span>
                <span>AED {totalDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-[#E4EAF0] grid grid-cols-2 gap-8 text-center text-xs font-semibold text-[#5F6F91]">
            <div>
              <div className="border-b border-[#DCE5F3] h-12 mb-1" />
              <span>{isRTL ? 'توقيع مخلص الجمارك / إعداد' : 'Customs Broker Signatory'}</span>
            </div>
            <div>
              <div className="border-b border-[#DCE5F3] h-12 mb-1" />
              <span>{isRTL ? 'توقيع المعتمد / الاعتماد' : 'Authorized Officer Signatory'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurCustomDeclarationView;
