import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, X, Upload, Save, Trash2, Loader, Paperclip, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { loadThemeFromStorage, applyTheme } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const InputGroup = ({ label, required, children }) => (
  <div className="space-y-1">
    <label className="text-[12px] font-medium text-[#102A5B] flex items-center gap-1">
      <span>{label}</span>
      {required && <span className="text-rose-500 font-bold">*</span>}
    </label>
    {children}
  </div>
);

const PurchaseDebitNoteForm = () => {
  const { isRTL, t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Master Data
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [units, setUnits] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    locationId: '',
    billLedger: 'Purchase',
    supplierId: '',
    debitNoteNumber: '',
    billNumber: '',
    debitNoteDate: new Date().toISOString().slice(0, 10),
    debitNoteDueDate: new Date().toISOString().slice(0, 10),
    otherReferences: '',
    billOfLading: '',
    motorVehicleNo: '',
    termsAndConditions: '',
    notes: '',
    status: 'OPEN',
    amount: 0,
    balanceDue: 0,
    taxPercentage: 0,
    template: 'Standard',
    emailTo: ''
  });

  const [lines, setLines] = useState([
    {
      itemId: '',
      locationId: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      discountType: 'Flat',
      amount: 0,
      taxId: '',
      taxValue: 0,
      taxAmount: 0
    }
  ]);

  const [attachments, setAttachments] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);

  useEffect(() => {
    const theme = loadThemeFromStorage();
    if (theme) applyTheme(theme);
  }, []);

  useEffect(() => {
    fetchMasterData();
    if (isEdit) {
      loadDebitNote();
    }
  }, [id]);

  useEffect(() => {
    calculateTotals();
  }, [lines]);

  const fetchMasterData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [locRes, suppRes, itemRes, taxRes, unitRes] = await Promise.all([
        axios.get(`${API_URL}/locations`, { headers }),
        axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } }),
        axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 1000 } }),
        axios.get(`${API_URL}/production/taxes`, { headers, params: { page: 0, size: 100 } }),
        axios.get(`${API_URL}/production/units`, { headers, params: { page: 0, size: 500 } })
      ]);

      setLocations(Array.isArray(locRes.data) ? locRes.data : (locRes.data.content || []));
      setSuppliers(suppRes.data.content || suppRes.data || []);
      setItems(itemRes.data.content || itemRes.data || []);
      setTaxes(taxRes.data.content || taxRes.data || []);
      setUnits(unitRes.data.content || unitRes.data || []);
    } catch (err) {
      console.error('Failed to load master data', err);
      setError(isRTL ? 'فشل تحميل البيانات الأساسية' : 'Failed to load master data. Please refresh.');
    }
  };

  const loadDebitNote = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/purchases/debit-notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;

      setFormData({
        locationId: data.locationId || '',
        billLedger: data.billLedger || 'Purchase',
        supplierId: data.supplierId || '',
        debitNoteNumber: data.debitNoteNumber || '',
        billNumber: data.billNumber || '',
        debitNoteDate: data.debitNoteDate,
        debitNoteDueDate: data.debitNoteDueDate,
        otherReferences: data.otherReferences || '',
        billOfLading: data.billOfLading || '',
        motorVehicleNo: data.motorVehicleNo || '',
        termsAndConditions: data.termsAndConditions || '',
        notes: data.notes || '',
        status: data.status || 'OPEN',
        amount: data.amount || 0,
        balanceDue: data.balanceDue || 0,
        taxPercentage: data.taxPercentage || 0,
        template: data.template || 'Standard',
        emailTo: data.emailTo || ''
      });

      if (data.items) {
        setLines(data.items.map(i => ({
          itemId: i.itemId || '',
          locationId: i.locationId || '',
          quantity: i.quantity || 1,
          rate: i.rate || 0,
          discount: i.discount || 0,
          discountType: 'Flat',
          amount: i.amount || 0,
          taxId: i.taxId || '',
          taxValue: i.taxValue || 0,
          taxAmount: i.taxAmount || 0
        })));
      }

      if (data.attachments) {
        setExistingAttachments(data.attachments.map((path, idx) => ({
          id: idx,
          path: path,
          fileName: path.split('/').pop() || `File ${idx + 1}`
        })));
      }
    } catch (err) {
      console.error('Failed to load Debit Note', err);
      setError(isRTL ? 'فشل تحميل بيانات الإشعار المدين' : 'Failed to load debit note details.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    let grandTotal = 0;

    const updatedLines = lines.map(line => {
      const qty = parseFloat(line.quantity) || 0;
      const rate = parseFloat(line.rate) || 0;
      const discount = parseFloat(line.discount) || 0;

      let baseAmount = (qty * rate) - discount;
      if (baseAmount < 0) baseAmount = 0;

      let taxRate = 0;
      if (line.taxId) {
        const taxObj = taxes.find(t => String(t.id) === String(line.taxId));
        if (taxObj) taxRate = taxObj.rate;
      }
      const taxAmount = baseAmount * (taxRate / 100);

      grandTotal += (baseAmount + taxAmount);

      return {
        ...line,
        amount: baseAmount,
        taxValue: taxRate,
        taxAmount: taxAmount
      };
    });

    setFormData(prev => ({
      ...prev,
      amount: grandTotal,
      balanceDue: grandTotal
    }));
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;

    if (field === 'itemId') {
      const selectedItem = items.find(i => String(i.id) === String(value));
      if (selectedItem) {
        newLines[index].rate = selectedItem.purchasePrice || selectedItem.price || 0;
      }
    }

    if (field === 'taxId') {
      const selectedTax = taxes.find(t => String(t.id) === String(value));
      if (selectedTax) {
        newLines[index].taxValue = selectedTax.rate;
      } else {
        newLines[index].taxValue = 0;
      }
    }

    setLines(newLines);
  };

  const addLine = () => {
    setLines([
      ...lines,
      {
        itemId: '',
        locationId: formData.locationId || '',
        quantity: 1,
        rate: 0,
        discount: 0,
        discountType: 'Flat',
        amount: 0,
        taxId: '',
        taxValue: 0,
        taxAmount: 0
      }
    ]);
  };

  const removeLine = (index) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (index) => {
    setExistingAttachments(existingAttachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.locationId) {
      setError(isRTL ? 'الرجاء اختيار موقع التشغيل' : 'Location is required');
      window.scrollTo(0, 0);
      return;
    }
    if (!formData.supplierId) {
      setError(isRTL ? 'الرجاء اختيار المورد' : 'Supplier is required');
      window.scrollTo(0, 0);
      return;
    }
    if (!formData.billNumber) {
      setError(isRTL ? 'الرجاء إدخال رقم الفاتورة' : 'Bill Number is required');
      window.scrollTo(0, 0);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        items: lines.map(l => ({
          itemId: l.itemId ? Number(l.itemId) : null,
          locationId: l.locationId ? Number(l.locationId) : (formData.locationId ? Number(formData.locationId) : null),
          quantity: Number(l.quantity),
          rate: Number(l.rate),
          discount: Number(l.discount),
          amount: Number(l.amount),
          taxId: l.taxId ? Number(l.taxId) : null,
          taxValue: Number(l.taxValue),
          taxAmount: Number(l.taxAmount)
        })),
        existingAttachments: existingAttachments.map(a => a.path)
      };

      const data = new FormData();
      data.append('debitNote', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

      attachments.forEach(file => {
        data.append('files', file);
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (isEdit) {
        await axios.put(`${API_URL}/purchases/debit-notes/${id}`, data, config);
      } else {
        await axios.post(`${API_URL}/purchases/debit-notes`, data, config);
      }

      navigate('/purchase-dashboard/debit-notes');
    } catch (err) {
      console.error('Failed to save Debit Note', err);
      setError(err.response?.data?.message || err.message || (isRTL ? 'فشل حفظ الإشعار المدين' : 'Failed to save Debit Note'));
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  const subTotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const totalTax = lines.reduce((sum, l) => sum + l.taxAmount, 0);
  const totalPayable = subTotal + totalTax;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center">
        <Loader className="h-10 w-10 animate-spin text-[var(--color-primary,#00A9A8)]" />
        <p className="mt-3 text-xs font-bold text-[#102A5B] uppercase tracking-wider">
          {isRTL ? 'جاري تحميل سند الإشعار المدين...' : 'Initializing Debit Note Workspace...'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-2 sm:p-3 lg:p-4 font-sans text-[#18233B]" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full space-y-3">
        {/* Header Area based on PurchaseOrderForm Spec */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-bold text-[#102A5B] leading-tight tracking-tight">
              {isEdit
                ? (t('debitNote.editDebitNote') || (isRTL ? 'تعديل الإشعار المدين' : 'Edit Debit Note'))
                : (t('debitNote.newDebitNote') || (isRTL ? 'إنشاء إشعار مدين جديد' : 'Create Debit Note'))}
            </h1>
            <p className="text-[12px] font-normal text-[#5F6F91]">
              {isRTL ? 'إدارة وتوثيق إشعارات الخصم الصادرة للموردين' : 'Create and manage debit note vouchers & bill adjustments'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-primary,#00A9A8)] text-[var(--color-primary-foreground,#ffffff)] rounded-[var(--theme-border-radius,11px)] text-xs font-bold hover:opacity-95 shadow-xs cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <Save size={16} className="text-white" />
              <span>{isEdit ? (isRTL ? 'تحديث الإشعار' : 'Update Debit Note') : (isRTL ? 'حفظ الإشعار' : 'Save Debit Note')}</span>
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
          {/* SECTION 1: PRIMARY DEBIT NOTE DETAILS */}
          <div className="bg-white border border-[#DCE5F3] rounded-[11.86px] p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-[22px] h-[22px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[11px] font-bold flex items-center justify-center">
                  1
                </div>
                <h2 className="text-[14px] font-bold text-[#102A5B]">
                  {isRTL ? 'تفاصيل الإشعار المدين الأساسية' : 'Primary Debit Note Details'}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Location */}
              <InputGroup label={t('debitNote.location') || (isRTL ? 'الموقع' : 'Location')} required>
                <select
                  value={formData.locationId}
                  onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                  required
                  className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                >
                  <option value="">{isRTL ? 'اختر الموقع...' : 'Select Location...'}</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </InputGroup>

              {/* Bill Ledgers */}
              <InputGroup label={t('debitNote.billLedger') || (isRTL ? 'دفتر الفواتير' : 'Bill Ledgers')}>
                <select
                  value={formData.billLedger}
                  onChange={e => setFormData({ ...formData, billLedger: e.target.value })}
                  className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                >
                  <option value="Purchase">{isRTL ? 'المشتريات (Purchase)' : 'Purchase'}</option>
                  <option value="General">{isRTL ? 'عام (General)' : 'General'}</option>
                </select>
              </InputGroup>

              {/* Supplier */}
              <InputGroup label={t('debitNote.supplier') || (isRTL ? 'اسم المورد' : 'Supplier Name')} required>
                <select
                  value={formData.supplierId}
                  onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
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

              {/* Debit Note # */}
              <InputGroup label={t('debitNote.debitNoteNumber') || (isRTL ? 'رقم إشعار الخصم' : 'Debit Note #')}>
                <input
                  type="text"
                  value={formData.debitNoteNumber}
                  onChange={e => setFormData({ ...formData, debitNoteNumber: e.target.value })}
                  placeholder="DN-XXXX"
                  className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs font-semibold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                />
              </InputGroup>

              {/* Bill Number */}
              <InputGroup label={t('debitNote.billNumber') || (isRTL ? 'رقم الفاتورة' : 'Bill Number')} required>
                <input
                  type="text"
                  value={formData.billNumber}
                  onChange={e => setFormData({ ...formData, billNumber: e.target.value })}
                  required
                  placeholder="BILL-1002"
                  className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                />
              </InputGroup>

              {/* Debit Note Date */}
              <InputGroup label={t('debitNote.date') || (isRTL ? 'تاريخ الإشعار المدين' : 'Debit Note Date')} required>
                <input
                  type="date"
                  value={formData.debitNoteDate}
                  onChange={e => setFormData({ ...formData, debitNoteDate: e.target.value })}
                  required
                  className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                />
              </InputGroup>

              {/* Due Date */}
              <InputGroup label={t('debitNote.dueDate') || (isRTL ? 'تاريخ الاستحقاق' : 'Debit Note Due Date')}>
                <input
                  type="date"
                  value={formData.debitNoteDueDate}
                  onChange={e => setFormData({ ...formData, debitNoteDueDate: e.target.value })}
                  className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                />
              </InputGroup>

              {/* Other References */}
              <InputGroup label={t('debitNote.otherRef') || (isRTL ? 'مراجع أخرى' : 'Other References')}>
                <input
                  type="text"
                  value={formData.otherReferences}
                  onChange={e => setFormData({ ...formData, otherReferences: e.target.value })}
                  placeholder="e.g. REF-209"
                  className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                />
              </InputGroup>

              {/* Bill of Lading */}
              <InputGroup label={t('debitNote.billOfLading') || (isRTL ? 'رقم بوليسة الشحن' : 'Bill of Lading / LR-RR No.')}>
                <input
                  type="text"
                  value={formData.billOfLading}
                  onChange={e => setFormData({ ...formData, billOfLading: e.target.value })}
                  placeholder="LR-770"
                  className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                />
              </InputGroup>

              {/* Motor Vehicle No */}
              <InputGroup label={t('debitNote.motorVehicle') || (isRTL ? 'رقم المركبة' : 'Motor Vehicle No.')}>
                <input
                  type="text"
                  value={formData.motorVehicleNo}
                  onChange={e => setFormData({ ...formData, motorVehicleNo: e.target.value })}
                  placeholder="DXB-9012"
                  className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                />
              </InputGroup>
            </div>
          </div>

          {/* SECTION 2: ITEMS SPECIFICATION TABLE */}
          <div className="bg-white border border-[#DCE5F3] rounded-[11.86px] p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-[22px] h-[22px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[11px] font-bold flex items-center justify-center">
                  2
                </div>
                <h2 className="text-[14px] font-bold text-[#102A5B]">
                  {t('debitNote.items') || (isRTL ? 'جدول الأصناف للإشعار المدين' : 'Line Items Specification')}
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#DBE5F3] rounded-[11.09px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EEF5FF] border-b border-[#DBE5F3] text-[#102A5B] font-semibold text-[12px] h-[38.39px]">
                    <th className="py-2.5 px-3 min-w-[200px]">{isRTL ? 'تفاصيل الصنف' : 'Item Details'}</th>
                    <th className="py-2.5 px-3 min-w-[160px]">{isRTL ? 'الموقع والكمية' : 'Location & Qty'}</th>
                    <th className="py-2.5 px-3 text-right min-w-[100px]">{isRTL ? 'السعر (AED)' : 'Rate (AED)'}</th>
                    <th className="py-2.5 px-3 text-right min-w-[100px]">{isRTL ? 'الخصم (AED)' : 'Discount'}</th>
                    <th className="py-2.5 px-3 text-right min-w-[110px]">{isRTL ? 'المبلغ (AED)' : 'Amount (AED)'}</th>
                    <th className="py-2.5 px-3 text-center min-w-[120px]">{isRTL ? 'نسبة الضريبة' : 'Tax Value'}</th>
                    <th className="py-2.5 px-3 text-right min-w-[100px]">{isRTL ? 'مبلغ الضريبة' : 'Tax Amount'}</th>
                    <th className="py-2.5 px-3 text-center w-12">{isRTL ? 'حذف' : 'Delete'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DBE5F3]">
                  {lines.map((l, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors text-xs">
                      <td className="p-2">
                        <select
                          className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                          value={l.itemId}
                          onChange={e => handleLineChange(idx, 'itemId', e.target.value)}
                        >
                          <option value="">{isRTL ? 'اختر الصنف...' : 'Select Item...'}</option>
                          {items.map(it => <option key={it.id} value={it.id}>{it.name || it.materialName}</option>)}
                        </select>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <select
                            className="w-full bg-white border border-[#D8E2F1] rounded px-1 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                            value={l.locationId}
                            onChange={e => handleLineChange(idx, 'locationId', e.target.value)}
                          >
                            <option value="">Loc</option>
                            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                          </select>
                          <input
                            type="number"
                            className="w-16 bg-white border border-[#D8E2F1] rounded px-1 py-1 text-right text-xs font-bold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                            value={l.quantity}
                            onChange={e => handleLineChange(idx, 'quantity', e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-right text-xs font-bold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                          value={l.rate}
                          onChange={e => handleLineChange(idx, 'rate', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-right text-xs font-medium text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                          value={l.discount}
                          onChange={e => handleLineChange(idx, 'discount', e.target.value)}
                        />
                      </td>
                      <td className="p-2 text-right font-bold text-[#102A5B]">
                        AED {Number(l.amount).toFixed(2)}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <span className="text-[11px] font-semibold text-[#617198]">VAT</span>
                          <select
                            className="w-16 bg-white border border-[#D8E2F1] rounded px-1 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                            value={l.taxId}
                            onChange={e => handleLineChange(idx, 'taxId', e.target.value)}
                          >
                            <option value="">0</option>
                            {taxes.map(t => <option key={t.id} value={t.id}>{t.rate}</option>)}
                          </select>
                          <span className="text-[11px] font-semibold text-[#617198]">%</span>
                        </div>
                      </td>
                      <td className="p-2 text-right font-semibold text-[#5F6F91]">
                        AED {Number(l.taxAmount).toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <button type="button" onClick={() => removeLine(idx)} className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-2 bg-[#F8FAFC] border-t border-[#DBE5F3]">
                <button type="button" onClick={addLine} className="text-[var(--color-primary,#00A9A8)] text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer">
                  <Plus size={14} /> {isRTL ? 'إضافة سطر' : 'Add Line'}
                </button>
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="flex justify-end pt-2">
              <div className="w-full sm:w-80 bg-[#F8FAFC] border border-[#DFE7F4] rounded-xl p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#5F6F91]">
                  <span>{isRTL ? 'المجموع الفرعي:' : 'Sub Total:'}</span>
                  <span className="font-bold text-[#102A5B]">AED {subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[#5F6F91]">
                  <span>{isRTL ? 'إجمالي الضريبة:' : 'Total Tax:'}</span>
                  <span className="font-bold text-[#102A5B]">AED {totalTax.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#DFE7F4] pt-2 flex justify-between items-center font-bold text-sm text-[var(--color-primary,#00A9A8)]">
                  <span>{isRTL ? 'الإجمالي النهائي:' : 'Net Total (AED):'}</span>
                  <span>AED {totalPayable.toFixed(2)}</span>
                </div>
              </div>
            </div>
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
                  {isRTL ? 'ملاحظات وتفاصيل الإشعار' : 'Internal Notes & Terms'}
                </label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={isRTL ? 'أدخل ملاحظات الإشعار المدين...' : 'Enter debit note remarks...'}
                  className="w-full bg-white border border-[#D8E2F1] rounded px-3 py-2 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#102A5B] block mb-1">
                  {isRTL ? 'إرفاق المستندات' : 'Upload Attachments'}
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

                <div className="mt-2 space-y-1">
                  {existingAttachments.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-[#102A5B] bg-[#F3F5F9] px-2 py-1 rounded">
                      <div className="flex items-center gap-1 truncate">
                        <Paperclip size={13} className="text-slate-400" />
                        <span className="truncate">{a.fileName}</span>
                      </div>
                      <button type="button" onClick={() => removeExistingAttachment(i)} className="text-rose-500 hover:text-rose-700">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {attachments.map((f, i) => (
                    <div key={`new-${i}`} className="flex items-center justify-between text-xs text-[#102A5B] bg-[#F3F5F9] px-2 py-1 rounded">
                      <div className="flex items-center gap-1 truncate">
                        <Paperclip size={13} className="text-slate-400" />
                        <span className="truncate">{f.name}</span>
                      </div>
                      <button type="button" onClick={() => removeAttachment(i)} className="text-rose-500 hover:text-rose-700">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons matching PurchaseOrderForm */}
          <div className="flex justify-end items-center gap-2 pt-2 border-t border-[#DCE5F3]">
            <Link
              to="/purchase-dashboard/debit-notes"
              className="px-4 py-1.5 bg-white border border-[#DCE5F3] text-[#102A5B] hover:bg-slate-50 text-xs font-semibold rounded-[5.29px] transition-all"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-1.5 bg-[var(--color-primary,#00A9A8)] text-[var(--color-primary-foreground,#ffffff)] text-xs font-bold rounded-[var(--theme-border-radius,11px)] shadow-xs flex items-center gap-1.5 transition-all hover:opacity-95 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isEdit ? (isRTL ? 'تحديث الإشعار' : 'Update Debit Note') : (isRTL ? 'حفظ الإشعار' : 'Save Debit Note')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseDebitNoteForm;
