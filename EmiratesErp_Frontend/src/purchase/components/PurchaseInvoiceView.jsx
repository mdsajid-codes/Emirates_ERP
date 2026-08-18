import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader, Printer, ArrowLeft, ArrowRight, FileText, Edit2, CheckCircle, Box, BadgeCheck, Paperclip, DollarSign, Calendar, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

// Basic number to words converter
const numberToWords = (num) => {
    if (!num) return 'Zero';
    const a = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['', '', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return ''; 
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim();
};

const PurchaseInvoiceView = () => {
  const { isRTL } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [supplierInfo, setSupplierInfo] = useState(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const res = await axios.get(`${API_URL}/purchases/invoices/${id}`, { headers });
        const data = res.data;
        setInvoice(data);

        if (data.supplierId) {
             try {
                const sRes = await axios.get(`${API_URL}/parties/${data.supplierId}`, { headers });
                setSupplierInfo(sRes.data);
             } catch (e) { console.warn(e); }
        }

      } catch (err) {
        console.error('Failed to load Invoice', err);
        setError(isRTL ? 'تعذر تحميل بيانات الفاتورة.' : 'Unable to load purchase invoice.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isRTL]);

  const handlePrint = () => {
    window.print();
  };

  const handleConvertToPayment = async () => {
    if(!window.confirm(isRTL ? 'تحويل هذه الفاتورة إلى سند دفع؟' : 'Are you sure you want to convert this bill to a payment?')) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/purchases/invoices/${id}/convert-to-payment`, {}, {
         headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/purchase-dashboard/payments/edit/${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert(isRTL ? 'فشل التحويل إلى سند دفع: ' + (err.response?.data?.message || err.message) : 'Failed to convert to payment: ' + (err.response?.data?.message || err.message));
      setLoading(false); 
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#00A9A8] rounded-full animate-spin mb-3" />
        <p className="text-sm font-bold text-[#0A2551]">{isRTL ? 'جاري تحميل تفاصيل الفاتورة...' : 'Loading Invoice Details...'}</p>
      </div>
    );
  }

  if (error || !invoice) {
    return <div className="p-12 text-center text-rose-600 font-bold">{error || (isRTL ? 'لم يتم العثور على الفاتورة.' : 'Invoice not found')}</div>;
  }

  const totalAmountWords = numberToWords(Math.floor(invoice.netTotal || 0));

  return (
    <div className="bg-[#F7F9FD] min-h-screen text-[#0A2551] font-sans pb-10 -mt-3 lg:-mt-4 -mx-3 lg:-mx-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Action Header Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#DFE7F4] px-6 py-2.5 flex items-center justify-between shadow-xs">
        <button onClick={() => navigate('/purchase-dashboard/bills')} className="flex items-center gap-2 text-xs font-bold text-[#102A5B] hover:text-[#00A9A8] transition-colors cursor-pointer">
          {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          <span>{isRTL ? 'الرجوع للقائمة' : 'Back to Bills List'}</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handlePrint} className="px-3 py-1.5 border border-[#DFE7F4] rounded-lg text-xs font-semibold text-[#102A5B] hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer">
            <Printer size={14} />
            <span>{isRTL ? 'طباعة' : 'Print'}</span>
          </button>

          <button onClick={() => navigate(`/purchase-dashboard/bills/edit/${id}`)} className="px-3 py-1.5 border border-[#DFE7F4] rounded-lg text-xs font-semibold text-[#102A5B] hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer">
            <Edit2 size={14} />
            <span>{isRTL ? 'تعديل' : 'Edit'}</span>
          </button>

          <button onClick={handleConvertToPayment} className="px-4 py-1.5 bg-[var(--color-primary,#00A9A8)] text-white rounded-lg text-xs font-bold hover:bg-[#008f8e] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs">
            <FileText size={14} />
            <span>{isRTL ? 'تحويل إلى سند دفع' : 'Convert to Payment'}</span>
          </button>
        </div>
      </div>

      <div className="w-full px-4 lg:px-6 space-y-4">
        {/* Hero Header Banner */}
        <div className="bg-white border border-[#DFE7F4] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#00A9A8] rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
              <Box size={30} strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#617191] uppercase tracking-wider block">{isRTL ? 'فاتورة مشتريات' : 'PURCHASE BILL INVOICE'}</span>
              <h1 className="text-2xl font-black text-[#0A2551] tracking-tight leading-none mt-0.5">{invoice.billNumber || `BILL-${invoice.id}`}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-0.5 bg-[#DCFAEE] text-[#138764] rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <BadgeCheck size={12} /> {isRTL ? 'فاتورة شراء معتمدة' : 'AUTHENTICATED BILL'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs border-l rtl:border-l-0 rtl:border-r border-[#DFE7F4] pl-6 rtl:pr-6">
            <div>
              <span className="text-[#617191] font-medium block">{isRTL ? 'المورد' : 'Supplier'}</span>
              <span className="font-bold text-[#0A2551]">{invoice.supplierName || '-'}</span>
            </div>
            <div>
              <span className="text-[#617191] font-medium block">{isRTL ? 'تاريخ الفاتورة' : 'Bill Date'}</span>
              <span className="font-bold text-[#0A2551]">{invoice.billDate ? new Date(invoice.billDate).toLocaleDateString() : '-'}</span>
            </div>
            <div>
              <span className="text-[#617191] font-medium block">{isRTL ? 'إجمالي الفاتورة (AED)' : 'Net Total (AED)'}</span>
              <span className="font-black text-[#00A9A8] text-base font-mono">{(invoice.netTotal ?? 0).toFixed(2)} AED</span>
            </div>
          </div>
        </div>

        {/* Details Meta Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white border border-[#DFE7F4] rounded-xl p-3.5 shadow-xs">
            <span className="text-[10px] font-bold text-[#617191] uppercase block mb-1">{isRTL ? 'رقم أمر الشراء' : 'Order Number'}</span>
            <span className="text-xs font-bold text-[#0A2551]">{invoice.orderNumber || '-'}</span>
          </div>
          <div className="bg-white border border-[#DFE7F4] rounded-xl p-3.5 shadow-xs">
            <span className="text-[10px] font-bold text-[#617191] uppercase block mb-1">{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}</span>
            <span className="text-xs font-bold text-[#0A2551]">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</span>
          </div>
          <div className="bg-white border border-[#DFE7F4] rounded-xl p-3.5 shadow-xs">
            <span className="text-[10px] font-bold text-[#617191] uppercase block mb-1">{isRTL ? 'نوع الفاتورة' : 'Bill Type'}</span>
            <span className="text-xs font-bold text-[#0A2551]">{invoice.billType || 'Standard'}</span>
          </div>
          <div className="bg-white border border-[#DFE7F4] rounded-xl p-3.5 shadow-xs">
            <span className="text-[10px] font-bold text-[#617191] uppercase block mb-1">{isRTL ? 'دفتر الفاتورة' : 'Bill Ledger'}</span>
            <span className="text-xs font-bold text-[#00A9A8]">{invoice.billLedger || 'Purchase'}</span>
          </div>
        </div>

        {/* Items Specification Table Card */}
        <div className="bg-white border border-[#DFE7F4] rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#DFE7F4] bg-[#F8FAFC] flex justify-between items-center">
            <h3 className="text-xs font-bold text-[#0A2551] uppercase tracking-wider">{isRTL ? 'جدول أصناف الفاتورة' : 'Invoice Line Items Specification'}</h3>
            <span className="text-[11px] font-semibold text-[#617191]">{isRTL ? `${invoice.lines?.length || 0} أصناف` : `${invoice.lines?.length || 0} Lines`}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#F2F6FC] border-b border-[#DFE7F4] text-[#617191] uppercase text-[10.5px] font-bold">
                  <th className="p-3 text-left rtl:text-right">#</th>
                  <th className="p-3 text-left rtl:text-right">{isRTL ? 'تفاصيل الصنف والبيان' : 'Item & Description'}</th>
                  <th className="p-3 text-center">{isRTL ? 'الكمية' : 'Qty'}</th>
                  <th className="p-3 text-center">{isRTL ? 'السعر (AED)' : 'Rate (AED)'}</th>
                  <th className="p-3 text-center">{isRTL ? 'الخصم' : 'Discount'}</th>
                  <th className="p-3 text-center">{isRTL ? 'الضريبة %' : 'Tax %'}</th>
                  <th className="p-3 text-right rtl:text-left">{isRTL ? 'المبلغ (AED)' : 'Amount (AED)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE7F4]">
                {(invoice.lines || []).map((line, idx) => (
                  <tr key={line.id || idx} className="hover:bg-slate-50/60">
                    <td className="p-3 font-bold text-[#0A2551]">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-[#0A2551]">{line.description || line.itemName || '-'}</div>
                    </td>
                    <td className="p-3 text-center font-bold text-[#0A2551]">
                      {invoice.grossNetEnabled && line.quantityNet > 0 ? line.quantityNet : line.quantityGross}
                    </td>
                    <td className="p-3 text-center font-bold text-[#0A2551] font-mono">{(line.rate || 0).toFixed(2)}</td>
                    <td className="p-3 text-center font-semibold text-rose-600 font-mono">{(line.lineDiscount || 0).toFixed(2)}</td>
                    <td className="p-3 text-center font-semibold text-[#617191]">{line.taxPercent || 0}%</td>
                    <td className="p-3 text-right rtl:text-left font-bold text-[#0A2551] font-mono">{(line.amount || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals Summary Bar */}
          <div className="p-5 bg-[#F8FAFC] border-t border-[#DFE7F4] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#617191] uppercase block">{isRTL ? 'المبلغ بالأحرف (درهم إماراتي)' : 'Amount in Words (AED)'}</span>
              <p className="text-xs font-bold text-[#0A2551] italic">{totalAmountWords} Dirhams Only</p>
            </div>

            <div className="w-full md:w-80 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#617191]">
                <span>{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="font-bold text-[#0A2551] font-mono">{(invoice.subTotal || 0).toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between text-[#617191]">
                <span>{isRTL ? 'إجمالي الخصم' : 'Total Discount'}</span>
                <span className="font-bold text-rose-600 font-mono">-{(invoice.totalDiscount || 0).toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between text-[#617191]">
                <span>{isRTL ? 'إجمالي الضريبة' : 'Total Tax'}</span>
                <span className="font-bold text-[#0A2551] font-mono">+{(invoice.totalTax || 0).toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between text-[#617191]">
                <span>{isRTL ? 'رسوم إضافية' : 'Other Charges'}</span>
                <span className="font-bold text-[#0A2551] font-mono">+{(invoice.otherCharges || 0).toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#0A2551] pt-2 border-t border-[#DFE7F4]">
                <span>{isRTL ? 'صافي الفاتورة النهائي' : 'Net Total (AED)'}</span>
                <span className="text-[#00A9A8] font-mono">{(invoice.netTotal || 0).toFixed(2)} AED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Remarks & Attachments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#DFE7F4] rounded-2xl p-4 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-[#0A2551] uppercase tracking-wider">{isRTL ? 'ملاحظات وتعليقات الفاتورة' : 'Operational Remarks & Notes'}</h4>
            <p className="text-xs text-[#617191] bg-[#F8FAFC] p-3 rounded-xl border border-[#DFE7F4] font-medium">
              {invoice.notes || (isRTL ? 'لا توجد ملاحظات إضافية مسجلة.' : 'No operational remarks recorded.')}
            </p>
          </div>

          {invoice.attachments && invoice.attachments.length > 0 && (
            <div className="bg-white border border-[#DFE7F4] rounded-2xl p-4 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-[#0A2551] uppercase tracking-wider">{isRTL ? 'المرفقات المسجلة' : 'Attached Documents'}</h4>
              <div className="space-y-1.5">
                {invoice.attachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between bg-[#F8FAFC] p-2 rounded-xl border border-[#DFE7F4] text-xs">
                    <span className="font-semibold text-[#0A2551] truncate">{att.fileName}</span>
                    <a href={`${API_URL}/${att.filePath}`} target="_blank" rel="noreferrer" className="text-[#00A9A8] font-bold hover:underline">
                      {isRTL ? 'عرض' : 'View'}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseInvoiceView;
