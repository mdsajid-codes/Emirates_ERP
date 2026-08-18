import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Save, ArrowLeft, Paperclip, Upload, DollarSign, Calendar,
  CreditCard, User, FileText, CheckCircle, AlertTriangle, X,
  Building, ChevronRight, Info, ShieldCheck, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { loadThemeFromStorage, applyTheme } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const InputGroup = ({ label, required, children }) => (
  <div className="space-y-1">
    <label className="text-[12px] font-medium text-[#102A5B] flex items-center gap-1">
      <span>{label}</span>
      {required && <span className="text-rose-500 font-bold">*</span>}
    </label>
    {children}
  </div>
);

const PurchasePaymentForm = () => {
  const { isRTL, t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    supplierId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash',
    reference: '',
    notes: '',
    payFullAmount: false,
    taxDeducted: false,
    tdsAmount: '',
    tdsSection: '',
    paidThrough: '',
    chequeNumber: '',
    allocations: []
  });

  const [suppliers, setSuppliers] = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Derived states
  const [totalUnpaid, setTotalUnpaid] = useState(0);

  useEffect(() => {
    const theme = loadThemeFromStorage();
    if (theme) applyTheme(theme);
  }, []);

  useEffect(() => {
    fetchSuppliers();
    if (isEditing) {
      fetchPayment();
    }
  }, [id]);

  useEffect(() => {
    if (!isEditing && location.state) {
      const { supplierId, amount, reference, notes, basis, isAdditionalExpense, aeId } = location.state;
      if (supplierId) {
        setForm(prev => ({
          ...prev,
          supplierId,
          amount: amount || '',
          reference: reference || `Payment for ${basis || ''}`,
          notes: notes || ''
        }));
        fetchUnpaidInvoices(supplierId, [], { isAdditionalExpense, aeId });
      }
    }
  }, [location.state, isEditing]);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/parties`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 0, size: 1000 }
      });
      setSuppliers(res.data.content || []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    }
  };

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/purchases/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      setForm({
        supplierId: data.supplierId,
        amount: data.amount,
        paymentDate: data.paymentDate,
        paymentMode: data.paymentMode || 'Cash',
        reference: data.reference || '',
        notes: data.notes || '',
        payFullAmount: data.payFullAmount || false,
        taxDeducted: data.taxDeducted || false,
        tdsAmount: data.tdsAmount || '',
        tdsSection: data.tdsSection || '',
        paidThrough: data.paidThrough || '',
        chequeNumber: data.chequeNumber || '',
        allocations: data.allocations || []
      });

      if (data.attachments) {
        setAttachments(data.attachments);
      }

      if (data.supplierId) {
        await fetchUnpaidInvoices(data.supplierId, data.allocations);
      }
    } catch (err) {
      console.error(err);
      setError(isRTL ? 'تعذر تحميل بيانات الدفع' : 'Failed to load payment details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnpaidInvoices = async (supplierId, existingAllocations = [], options = null) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/purchases/payments/unpaid-invoices`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { supplierId }
      });

      let invoices = res.data.map(inv => ({
        ...inv,
        thisAllocation: 0
      }));

      if (options && options.isAdditionalExpense && options.aeId) {
        invoices = invoices.map(inv => {
          if (inv.id === Number(options.aeId) && inv.isAdditionalExpense) {
            return { ...inv, thisAllocation: inv.balance };
          }
          return inv;
        });
      }

      if (existingAllocations.length > 0) {
        invoices = invoices.map(inv => {
          const alloc = existingAllocations.find(a =>
            (inv.isAdditionalExpense ? a.additionalExpenseId === inv.id : a.invoiceId === inv.id)
          );
          if (alloc) {
            return {
              ...inv,
              thisAllocation: alloc.allocatedAmount,
            };
          }
          return inv;
        });
      }

      setUnpaidInvoices(invoices);
      const total = invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0);
      setTotalUnpaid(total);
    } catch (err) {
      console.error('Failed to fetch unpaid invoices', err);
    }
  };

  const handleSupplierChange = (e) => {
    const sid = e.target.value;
    setForm(prev => ({ ...prev, supplierId: sid, allocations: [] }));
    setUnpaidInvoices([]);
    if (sid) fetchUnpaidInvoices(sid);
  };

  const handleAllocationChange = (id, value, isAE) => {
    const val = parseFloat(value) || 0;
    setUnpaidInvoices(prev => prev.map(inv => {
      if (inv.id === id && inv.isAdditionalExpense === isAE) {
        return { ...inv, thisAllocation: val };
      }
      return inv;
    }));
  };

  const handleFileChange = (e) => {
    setNewFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplierId || !form.amount || !form.paymentDate || !form.paidThrough) {
      setError(isRTL ? 'الرجاء تعبئة جميع الحقول المطلوبة' : 'Please fill in all required fields.');
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const allocations = unpaidInvoices
        .filter(inv => inv.thisAllocation > 0)
        .map(inv => ({
          invoiceId: inv.isAdditionalExpense ? null : inv.id,
          additionalExpenseId: inv.isAdditionalExpense ? inv.id : null,
          allocatedAmount: inv.thisAllocation
        }));

      const formData = new FormData();

      if (isEditing) {
        const payload = {
          ...form,
          allocations,
          attachments: attachments
        };
        formData.append('request', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        newFiles.forEach(f => {
          formData.append('attachments', f);
        });

        await axios.put(`${API_URL}/purchases/payments/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        formData.append('supplierId', form.supplierId || '');
        formData.append('amount', form.amount || '0');
        formData.append('payFullAmount', form.payFullAmount || false);
        formData.append('taxDeducted', form.taxDeducted || false);
        formData.append('tdsAmount', form.tdsAmount || '0');
        formData.append('tdsSection', form.tdsSection || '');
        formData.append('paymentDate', form.paymentDate || '');
        formData.append('paymentMode', form.paymentMode || '');
        formData.append('paidThrough', form.paidThrough || '');
        formData.append('reference', form.reference || '');
        formData.append('chequeNumber', form.chequeNumber || '');
        formData.append('notes', form.notes || '');
        formData.append('createdBy', form.createdBy || 'Admin');

        allocations.forEach((alloc, index) => {
          formData.append(`allocations[${index}].invoiceId`, alloc.invoiceId || '');
          formData.append(`allocations[${index}].additionalExpenseId`, alloc.additionalExpenseId || '');
          formData.append(`allocations[${index}].allocatedAmount`, alloc.allocatedAmount);
        });

        newFiles.forEach(f => {
          formData.append('files', f);
        });

        await axios.post(`${API_URL}/purchases/payments`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      navigate('/purchase-dashboard/payments');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || (isRTL ? 'خطأ في حفظ سند الدفع' : 'Error saving payment'));
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const totalAllocated = unpaidInvoices.reduce((sum, inv) => sum + (parseFloat(inv.thisAllocation) || 0), 0);
  const amountVal = parseFloat(form.amount) || 0;
  const excess = Math.max(0, amountVal - totalAllocated);

  useEffect(() => {
    if (form.payFullAmount && totalUnpaid > 0) {
      setForm(prev => ({ ...prev, amount: totalUnpaid.toFixed(2) }));
    }
  }, [form.payFullAmount, totalUnpaid]);

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-2 sm:p-3 lg:p-4 font-sans text-[#18233B]" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full space-y-3">
        {/* Header Area based on PurchaseOrderForm Spec */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-bold text-[#102A5B] leading-tight tracking-tight">
              {isEditing
                ? (t('payment.editPayment') || (isRTL ? 'تعديل سند الدفع' : 'Edit Purchase Payment'))
                : (t('payment.newPayment') || (isRTL ? 'إنشاء سند دفع' : 'Create Purchase Payment'))}
            </h1>
            <p className="text-[12px] font-normal text-[#5F6F91]">
              {isRTL ? 'إدارة وتتبع المدفوعات وتسوية فواتير المشتريات' : 'Create and manage payment vouchers & bill settlements'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-primary,#00A9A8)] text-[var(--color-primary-foreground,#ffffff)] rounded-[var(--theme-border-radius,11px)] text-xs font-bold hover:opacity-95 shadow-xs cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <Save size={16} className="text-white" />
              <span>{isEditing ? (isRTL ? 'تحديث سند الدفع' : 'Update Payment') : (isRTL ? 'حفظ سند الدفع' : 'Save Payment')}</span>
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-3 text-rose-600 shadow-xs text-xs font-semibold"
          >
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-rose-100 rounded-full transition-colors">
              <X size={14} />
            </button>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 pb-16">
          {/* SECTION 1: PRIMARY PAYMENT DETAILS */}
          <div className="bg-white border border-[#DCE5F3] rounded-[11.86px] p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-[22px] h-[22px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[11px] font-bold flex items-center justify-center">
                  1
                </div>
                <h2 className="text-[14px] font-bold text-[#102A5B]">
                  {isRTL ? 'تفاصيل سند الدفع الرئيسية' : 'Primary Payment Details'}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Supplier */}
              <InputGroup label={t('payment.supplier') || (isRTL ? 'المورد' : 'Supplier')} required>
                <select
                  value={form.supplierId}
                  onChange={handleSupplierChange}
                  required
                  className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                >
                  <option value="">{isRTL ? 'اختر المورد...' : 'Select Supplier...'}</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.companyName || s.name} {s.code ? `(${s.code})` : ''}
                    </option>
                  ))}
                </select>
              </InputGroup>

              {/* Payment Date */}
              <InputGroup label={t('payment.date') || (isRTL ? 'تاريخ الدفع' : 'Payment Date')} required>
                <input
                  type="date"
                  value={form.paymentDate}
                  onChange={e => setForm({ ...form, paymentDate: e.target.value })}
                  required
                  className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                />
              </InputGroup>

              {/* Payment Amount */}
              <InputGroup label={t('payment.amount') || (isRTL ? 'المبلغ المدفوع (AED)' : 'Amount (AED)')} required>
                <div className="flex gap-1">
                  <span className="bg-[#F3F5F9] border border-[#D8E2F1] rounded px-2 py-1 text-[11px] font-bold text-[#102A5B] flex items-center shrink-0 min-h-[30px]">
                    AED
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    required
                    placeholder="0.00"
                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs font-bold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                  />
                </div>
              </InputGroup>

              {/* Payment Mode */}
              <InputGroup label={t('payment.mode') || (isRTL ? 'طريقة الدفع' : 'Payment Mode')} required>
                <select
                  value={form.paymentMode}
                  onChange={e => setForm({ ...form, paymentMode: e.target.value })}
                  className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                >
                  <option value="Cash">{isRTL ? 'نقداً (Cash)' : 'Cash'}</option>
                  <option value="Bank Transfer">{isRTL ? 'تحويل بنكي (Bank Transfer)' : 'Bank Transfer'}</option>
                  <option value="Cheque">{isRTL ? 'شيك (Cheque)' : 'Cheque'}</option>
                  <option value="Credit Card">{isRTL ? 'بطاقة ائتمان (Credit Card)' : 'Credit Card'}</option>
                </select>
              </InputGroup>

              {/* Paid Through Account */}
              <InputGroup label={t('payment.paidThrough') || (isRTL ? 'الحساب المدفوع منه' : 'Paid Through Account')} required>
                <select
                  value={form.paidThrough}
                  onChange={e => setForm({ ...form, paidThrough: e.target.value })}
                  required
                  className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                >
                  <option value="">{isRTL ? 'اختر الحساب...' : 'Select Account...'}</option>
                  <option value="Petty Cash">{isRTL ? 'الصندوق الصغير (Petty Cash)' : 'Petty Cash'}</option>
                  <option value="Main Bank Account">{isRTL ? 'الحساب البنكي الرئيسي (Main Bank)' : 'Main Bank Account'}</option>
                  <option value="Dubai Islamic Bank">{isRTL ? 'بنك دبي الإسلامي (Dubai Islamic Bank)' : 'Dubai Islamic Bank'}</option>
                  <option value="Emirates NBD">{isRTL ? 'بنك الإمارات دبي الوطني (Emirates NBD)' : 'Emirates NBD'}</option>
                </select>
              </InputGroup>

              {/* Reference */}
              <InputGroup label={t('payment.reference') || (isRTL ? 'المرجع / البيان' : 'Reference')}>
                <input
                  type="text"
                  value={form.reference}
                  onChange={e => setForm({ ...form, reference: e.target.value })}
                  placeholder="e.g. Ref-9012"
                  className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                />
              </InputGroup>

              {/* Cheque Number (If Cheque) */}
              {form.paymentMode === 'Cheque' && (
                <InputGroup label={t('payment.chequeNumber') || (isRTL ? 'رقم الشيك' : 'Cheque Number')}>
                  <input
                    type="text"
                    value={form.chequeNumber}
                    onChange={e => setForm({ ...form, chequeNumber: e.target.value })}
                    placeholder="CHQ-1002"
                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                  />
                </InputGroup>
              )}
            </div>

            {totalUnpaid > 0 && (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="payFull"
                  checked={form.payFullAmount}
                  onChange={e => setForm({ ...form, payFullAmount: e.target.checked })}
                  className="accent-[var(--color-primary,#00A9A8)] h-3.5 w-3.5 rounded cursor-pointer"
                />
                <label htmlFor="payFull" className="text-xs text-[#102A5B] font-semibold cursor-pointer">
                  {isRTL ? `تسوية إجمالي المبلغ المستحق (AED ${totalUnpaid.toFixed(2)})` : `Pay full outstanding balance (AED ${totalUnpaid.toFixed(2)})`}
                </label>
              </div>
            )}
          </div>

          {/* SECTION 2: UNPAID BILLS ALLOCATION */}
          <div className="bg-white border border-[#DCE5F3] rounded-[11.86px] p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-[22px] h-[22px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[11px] font-bold flex items-center justify-center">
                  2
                </div>
                <h2 className="text-[14px] font-bold text-[#102A5B]">
                  {t('payment.unpaidBills') || (isRTL ? 'تسوية فواتير المشتريات' : 'Unpaid Bills Allocation')}
                </h2>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="text-[#617198]">
                  {isRTL ? 'المخصص:' : 'Allocated:'} <strong className="text-[#102A5B]">AED {totalAllocated.toFixed(2)}</strong>
                </span>
                <span className="text-emerald-600">
                  {isRTL ? 'الفائض:' : 'Excess:'} <strong>AED {excess.toFixed(2)}</strong>
                </span>
              </div>
            </div>

            {unpaidInvoices.length > 0 ? (
              <div className="overflow-x-auto border border-[#DBE5F3] rounded-[11.09px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EEF5FF] border-b border-[#DBE5F3] text-[#102A5B] font-semibold text-[12px] h-[38.39px]">
                      <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'المستند' : 'Document #'}</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">{isRTL ? 'التاريخ' : 'Date'}</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'مبلغ الفاتورة (AED)' : 'Bill Amount (AED)'}</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">{isRTL ? 'المبلغ المتبقي (AED)' : 'Due Balance (AED)'}</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right w-44">{isRTL ? 'التخصيص (AED)' : 'Allocation (AED)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DBE5F3]">
                    {unpaidInvoices.map((inv) => (
                      <tr key={`${inv.isAdditionalExpense ? 'ae' : 'inv'}-${inv.id}`} className="hover:bg-slate-50/80 transition-colors h-[42.39px] text-xs">
                        <td className="py-2 px-3 font-semibold text-[#102A5B] whitespace-nowrap">
                          {inv.invoiceNumber || inv.reference || `INV-${inv.id}`}
                          {inv.isAdditionalExpense && <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-normal">Expense</span>}
                        </td>
                        <td className="py-2 px-3 text-[#5F6F91] whitespace-nowrap">
                          {inv.date ? new Date(inv.date).toLocaleDateString('en-GB') : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-[#102A5B] whitespace-nowrap">
                          AED {(Number(inv.totalAmount || inv.amount) || 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-rose-600 whitespace-nowrap">
                          AED {(Number(inv.balance) || 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            max={inv.balance}
                            value={inv.thisAllocation || ''}
                            onChange={e => handleAllocationChange(inv.id, e.target.value, inv.isAdditionalExpense)}
                            placeholder="0.00"
                            className="w-full text-right bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs font-bold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#DCE5F3]">
                <p className="text-xs font-semibold text-[#617198]">
                  {form.supplierId
                    ? (isRTL ? 'لا تتوفر فواتير مستحقة لهذا المورد.' : 'No unpaid invoices found for this supplier. Payment will be recorded on-account.')
                    : (isRTL ? 'الرجاء اختيار مورد لعرض الفواتير غير المدفوعة' : 'Select a supplier above to view unpaid bills.')}
                </p>
              </div>
            )}
          </div>

          {/* SECTION 3: NOTES & ATTACHMENTS */}
          <div className="bg-white border border-[#DCE5F3] rounded-[11.86px] p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-[22px] h-[22px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[11px] font-bold flex items-center justify-center">
                  3
                </div>
                <h2 className="text-[14px] font-bold text-[#102A5B]">
                  {isRTL ? 'الملاحظات والمرفقات' : 'Notes & Attachments'}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-[#102A5B] block mb-1">
                  {isRTL ? 'ملاحظات إضافية' : 'Internal Notes / Remarks'}
                </label>
                <textarea
                  rows="3"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder={isRTL ? 'أدخل أي ملاحظات إضافية...' : 'Enter payment notes...'}
                  className="w-full bg-white border border-[#D8E2F1] rounded px-3 py-2 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#102A5B] block mb-1">
                  {isRTL ? 'إرفاق المستندات والإيصالات' : 'Upload Attachments'}
                </label>
                <div className="border border-dashed border-[#D8E2F1] bg-[#F8FAFC] hover:bg-slate-100/50 rounded-xl p-3 text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-1">
                    <Upload size={20} className="text-[var(--color-primary,#00A9A8)]" />
                    <span className="text-xs font-semibold text-[#102A5B]">
                      {isRTL ? 'انقر لاختيار الملفات' : 'Click to select files'}
                    </span>
                    <span className="text-[10px] text-[#617198]">PDF, PNG, JPG (Max 5MB)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons matching PurchaseOrderForm */}
          <div className="flex justify-end items-center gap-2 pt-2 border-t border-[#DCE5F3]">
            <Link
              to="/purchase-dashboard/payments"
              className="px-4 py-1.5 bg-white border border-[#DCE5F3] text-[#102A5B] hover:bg-slate-50 text-xs font-semibold rounded-[5.29px] transition-all"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-1.5 bg-[var(--color-primary,#00A9A8)] text-[var(--color-primary-foreground,#ffffff)] text-xs font-bold rounded-[var(--theme-border-radius,11px)] shadow-xs flex items-center gap-1.5 transition-all hover:opacity-95 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isEditing ? (isRTL ? 'تحديث سند الدفع' : 'Update Payment') : (isRTL ? 'حفظ سند الدفع' : 'Save Payment')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchasePaymentForm;

