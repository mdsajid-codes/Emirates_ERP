import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    Plus, Trash2, Save, Loader, ArrowLeft, X, AlertTriangle, ClipboardCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
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

const PurCustomDeclarationForm = () => {
    const { isRTL, t } = useLanguage();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [activeTab, setActiveTab] = useState('main');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showInvoicePicker, setShowInvoicePicker] = useState(false);

    const [form, setForm] = useState({
        declarationNumber: '',
        isThirdPartyClearance: false,
        companyName: '',
        taxIsDue: 'USE_IN_TAX_RETURN',
        serviceCharge: 0,
        isApplyCustomPenalty: false,
        customPenaltyAmount: 0,
        expenseAccountId: '',
        departmentId: '',
        expenseItemId: '',
        businessActivity: '',
        entityName: '',
        isGroupByHSCode: false,
        isIncludeServiceCharge: false,
        responsiblePersonId: '',
        status: 'Draft',
        lines: []
    });

    // Masters
    const [accounts, setAccounts] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [expenseItems, setExpenseItems] = useState([]);
    const [users, setUsers] = useState([]);
    const [items, setItems] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);

    useEffect(() => {
        const theme = loadThemeFromStorage();
        if (theme) applyTheme(theme);
    }, []);

    useEffect(() => {
        const loadMasters = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                
                const results = await Promise.allSettled([
                    axios.get(`${API_URL}/accounts/chart-of-accounts`, { headers }),
                    axios.get(`${API_URL}/departments`, { headers }),
                    axios.get(`${API_URL}/accounts/expense-items`, { headers }),
                    axios.get(`${API_URL}/users`, { headers }),
                    axios.get(`${API_URL}/production/raw-materials`, { headers }),
                    axios.get(`${API_URL}/purchases/invoices`, { headers, params: { size: 1000 } })
                ]);
                
                const [accRes, deptRes, expRes, userRes, itemRes, invRes] = results.map(r => r.status === 'fulfilled' ? r.value : { data: [] });

                setAccounts(accRes.data || []);
                setDepartments(deptRes.data || []);
                setExpenseItems(expRes.data || []);
                setUsers(userRes.data || []);
                setItems(itemRes.data.content || itemRes.data || []);
                setInvoices(invRes.data.content || invRes.data || []);

                if (isEditing) {
                    const res = await axios.get(`${API_URL}/purchases/custom-declarations/${id}`, { headers });
                    setForm(res.data);
                }
            } catch (err) {
                console.error('Failed to load masters', err);
                setError(isRTL ? 'فشل تحميل البيانات الأساسية' : 'Failed to load required data.');
            } finally {
                setLoading(false);
            }
        };
        loadMasters();
    }, [id, isEditing]);

    const addLine = () => {
        setForm(prev => ({
            ...prev,
            lines: [
                ...prev.lines,
                { itemId: '', description: '', hsCode: '', cifForeign: 0, cifNational: 0, dutyRate: 5, dutyAmount: 0, vatRate: 5, vatAmount: 0 }
            ]
        }));
    };

    const handleLineChange = (idx, field, value) => {
        setForm(prev => {
            const lines = [...prev.lines];
            lines[idx] = { ...lines[idx], [field]: value };
            
            const foreign = Number(lines[idx].cifForeign) || 0;
            const national = Number(lines[idx].cifNational) || foreign; // fallback
            lines[idx].cifNational = national;

            const dRate = Number(lines[idx].dutyRate) || 0;
            lines[idx].dutyAmount = (national * dRate) / 100;

            const vRate = Number(lines[idx].vatRate) || 0;
            lines[idx].vatAmount = ((national + lines[idx].dutyAmount) * vRate) / 100;

            return { ...prev, lines };
        });
    };

    const removeLine = (idx) => {
        setForm(prev => ({
            ...prev,
            lines: prev.lines.filter((_, i) => i !== idx)
        }));
    };

    const handlePickInvoices = () => {
        const selectedInvs = invoices.filter(inv => selectedInvoiceIds.includes(inv.id));
        const newLines = [];

        selectedInvs.forEach(inv => {
            if (inv.items && inv.items.length > 0) {
                inv.items.forEach(poItem => {
                    const amount = Number(poItem.amount) || ((Number(poItem.quantity) || 1) * (Number(poItem.rate) || 0));
                    newLines.push({
                        itemId: poItem.item?.id || poItem.itemId || '',
                        description: poItem.item?.name || poItem.materialName || '',
                        hsCode: poItem.item?.hsCode || '8415.1000',
                        cifForeign: amount,
                        cifNational: amount,
                        dutyRate: 5,
                        dutyAmount: (amount * 5) / 100,
                        vatRate: 5,
                        vatAmount: ((amount + ((amount * 5) / 100)) * 5) / 100
                    });
                });
            }
        });

        setForm(prev => ({
            ...prev,
            lines: [...prev.lines, ...newLines]
        }));
        setShowInvoicePicker(false);
    };

    const totals = useMemo(() => {
        let cifForeign = 0;
        let cifNational = 0;
        let dutyTotal = 0;
        let vatTotal = 0;

        form.lines.forEach(l => {
            cifForeign += Number(l.cifForeign) || 0;
            cifNational += Number(l.cifNational) || 0;
            dutyTotal += Number(l.dutyAmount) || 0;
            vatTotal += Number(l.vatAmount) || 0;
        });

        const service = Number(form.serviceCharge) || 0;
        const penalty = form.isApplyCustomPenalty ? (Number(form.customPenaltyAmount) || 0) : 0;
        const totalDue = dutyTotal + service + penalty;

        return { cifForeign, cifNational, dutyTotal, vatTotal, totalDue };
    }, [form]);

    const handleSubmit = async (statusOverride) => {
        setSubmitting(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const payload = {
                ...form,
                status: statusOverride || form.status,
                totalDue: totals.totalDue,
                vatRcmTotal: totals.vatTotal
            };

            if (isEditing) {
                await axios.put(`${API_URL}/purchases/custom-declarations/${id}`, payload, { headers });
            } else {
                await axios.post(`${API_URL}/purchases/custom-declarations`, payload, { headers });
            }

            navigate('/purchase-dashboard/custom-declarations');
        } catch (err) {
            console.error('Failed to save custom declaration', err);
            setError(err.response?.data?.message || err.message || (isRTL ? 'فشل حفظ البيان الجمركي' : 'Failed to save custom declaration.'));
            window.scrollTo(0, 0);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center">
                <Loader className="h-10 w-10 animate-spin text-[var(--color-primary,#00A9A8)]" />
                <p className="mt-3 text-xs font-bold text-[#102A5B] uppercase tracking-wider">
                    {isRTL ? 'جاري تحميل البيان الجمركي...' : 'Initializing Custom Declaration Workspace...'}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] p-2 sm:p-3 lg:p-4 font-sans text-[#18233B]" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-full space-y-3">
                {/* Header Area matching PurchaseOrderForm Spec */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                        <h1 className="text-[24px] sm:text-[28px] font-bold text-[#102A5B] leading-tight tracking-tight">
                            {isEditing
                                ? (t('customDeclaration.editDeclaration') || (isRTL ? 'تعديل البيان الجمركي' : 'Edit Custom Declaration'))
                                : (t('customDeclaration.newDeclaration') || (isRTL ? 'إنشاء بيان جمركي جديد' : 'Create Custom Declaration'))}
                        </h1>
                        <p className="text-[12px] font-normal text-[#5F6F91]">
                            {isRTL ? 'توثيق واحتساب الرسوم الجمركية وضريبة القيمة المضافة للاستيراد' : 'Record and manage customs duties & Reverse Charge VAT for imports'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowInvoicePicker(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DCE5F3] text-[#102A5B] text-xs font-semibold rounded-[5.29px] hover:bg-slate-50 transition-all cursor-pointer"
                        >
                            <ClipboardCheck size={15} className="text-[var(--color-primary,#00A9A8)]" />
                            <span>{isRTL ? 'استيراد من الفواتير' : 'Pick Invoices'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSubmit('Posted')}
                            disabled={submitting}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-primary,#00A9A8)] text-[var(--color-primary-foreground,#ffffff)] rounded-[var(--theme-border-radius,11px)] text-xs font-bold hover:opacity-95 shadow-xs cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                        >
                            <Save size={16} className="text-white" />
                            <span>{isEditing ? (isRTL ? 'تحديث وتطبيق' : 'Update Declaration') : (isRTL ? 'حفظ واعتمد' : 'Save Declaration')}</span>
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

                <div className="space-y-3 pb-16">
                    {/* SECTION 1: PRIMARY DECLARATION DETAILS */}
                    <div className="bg-white border border-[#DCE5F3] rounded-[11.86px] p-3 space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-[22px] h-[22px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[11px] font-bold flex items-center justify-center">
                                    1
                                </div>
                                <h2 className="text-[14px] font-bold text-[#102A5B]">
                                    {isRTL ? 'بيانات البيان الجمركي الأساسية' : 'Primary Customs Declaration Details'}
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Declaration Number */}
                            <InputGroup label={t('customDeclaration.declarationNumber') || (isRTL ? 'رقم البيان الجمركي' : 'Declaration Number')} required>
                                <input
                                    type="text"
                                    value={form.declarationNumber}
                                    onChange={e => setForm({ ...form, declarationNumber: e.target.value })}
                                    required
                                    placeholder="e.g. DEC-90182"
                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs font-semibold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                                />
                            </InputGroup>

                            {/* Service Charge */}
                            <InputGroup label={isRTL ? 'رسوم الخدمة (AED)' : 'Service Charge (AED)'}>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={form.serviceCharge}
                                    onChange={e => setForm({ ...form, serviceCharge: Number(e.target.value) })}
                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs font-bold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                                />
                            </InputGroup>

                            {/* Department */}
                            <InputGroup label={t('customDeclaration.department') || (isRTL ? 'القسم' : 'Department')}>
                                <select
                                    value={form.departmentId}
                                    onChange={e => setForm({ ...form, departmentId: e.target.value })}
                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                                >
                                    <option value="">{isRTL ? 'اختر القسم...' : 'Select Department...'}</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </InputGroup>

                            {/* Expense Item */}
                            <InputGroup label={t('customDeclaration.expenseItem') || (isRTL ? 'بند المصروف' : 'Expense Item')}>
                                <select
                                    value={form.expenseItemId}
                                    onChange={e => setForm({ ...form, expenseItemId: e.target.value })}
                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                                >
                                    <option value="">{isRTL ? 'اختر بند المصروف...' : 'Select Expense Item...'}</option>
                                    {expenseItems.map(ei => (
                                        <option key={ei.id} value={ei.id}>{ei.name}</option>
                                    ))}
                                </select>
                            </InputGroup>

                            {/* Company Name */}
                            <InputGroup label={t('customDeclaration.agent') || (isRTL ? 'الشركة / مخلص الجمارك' : 'Company / Customs Agent')}>
                                <input
                                    type="text"
                                    value={form.companyName}
                                    onChange={e => setForm({ ...form, companyName: e.target.value })}
                                    placeholder="e.g. Dubai Customs Clearing Agent"
                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                                />
                            </InputGroup>

                            {/* Business Activity */}
                            <InputGroup label={isRTL ? 'نشاط العمل' : 'Business Activity'}>
                                <input
                                    type="text"
                                    value={form.businessActivity}
                                    onChange={e => setForm({ ...form, businessActivity: e.target.value })}
                                    placeholder="Trading / General Import"
                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                                />
                            </InputGroup>

                            {/* Entity Name */}
                            <InputGroup label={isRTL ? 'اسم الجهة' : 'Entity Name'}>
                                <input
                                    type="text"
                                    value={form.entityName}
                                    onChange={e => setForm({ ...form, entityName: e.target.value })}
                                    placeholder="Federal Tax Authority"
                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                                />
                            </InputGroup>

                            {/* Tax Payment Mode */}
                            <InputGroup label={isRTL ? 'وضع الدفع الضريبي' : 'Tax Payment Mode'}>
                                <select
                                    value={form.taxIsDue}
                                    onChange={e => setForm({ ...form, taxIsDue: e.target.value })}
                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)] min-h-[30px]"
                                >
                                    <option value="USE_IN_TAX_RETURN">{isRTL ? 'الاستخدام في الإقرار الضريبي (Reverse Charge)' : 'Use in Tax Return (RCM)'}</option>
                                    <option value="PAY_DIRECTLY">{isRTL ? 'دفع مباشر للجمارك' : 'Pay Directly at Customs'}</option>
                                </select>
                            </InputGroup>
                        </div>
                    </div>

                    {/* SECTION 2: DECLARATION LINES TABLE */}
                    <div className="bg-white border border-[#DCE5F3] rounded-[11.86px] p-3 space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-[22px] h-[22px] rounded-full bg-[var(--color-primary,#00A9A8)] text-white text-[11px] font-bold flex items-center justify-center">
                                    2
                                </div>
                                <h2 className="text-[14px] font-bold text-[#102A5B]">
                                    {isRTL ? 'سطور البضائع المستوردة والرسوم الجمركية' : 'Imported Goods & Customs Duty Lines'}
                                </h2>
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-[#DBE5F3] rounded-[11.09px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#EEF5FF] border-b border-[#DBE5F3] text-[#102A5B] font-semibold text-[12px] h-[38.39px]">
                                        <th className="py-2.5 px-3 min-w-[180px]">{isRTL ? 'الصنف / المنتج' : 'Item / Product'}</th>
                                        <th className="py-2.5 px-3 min-w-[110px]">{isRTL ? 'رمز HS' : 'HS Code'}</th>
                                        <th className="py-2.5 px-3 text-right min-w-[110px]">{isRTL ? 'قيمة CIF الأجنبية' : 'CIF Foreign'}</th>
                                        <th className="py-2.5 px-3 text-right min-w-[110px]">{isRTL ? 'قيمة CIF الوطنية (AED)' : 'CIF National (AED)'}</th>
                                        <th className="py-2.5 px-3 text-center min-w-[90px]">{isRTL ? 'نسبة الجمرك' : 'Duty %'}</th>
                                        <th className="py-2.5 px-3 text-right min-w-[110px]">{isRTL ? 'رسوم الجمرك (AED)' : 'Duty Amt'}</th>
                                        <th className="py-2.5 px-3 text-center min-w-[90px]">{isRTL ? 'نسبة الضريبة' : 'VAT %'}</th>
                                        <th className="py-2.5 px-3 text-right min-w-[110px]">{isRTL ? 'ضريبة RCM (AED)' : 'VAT RCM Amt'}</th>
                                        <th className="py-2.5 px-3 text-center w-12">{isRTL ? 'حذف' : 'Delete'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#DBE5F3]">
                                    {form.lines.map((l, idx) => (
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
                                                <input
                                                    type="text"
                                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-xs font-mono text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                    value={l.hsCode}
                                                    onChange={e => handleLineChange(idx, 'hsCode', e.target.value)}
                                                    placeholder="8415.1000"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-right text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                    value={l.cifForeign}
                                                    onChange={e => handleLineChange(idx, 'cifForeign', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full bg-white border border-[#D8E2F1] rounded px-2 py-1 text-right text-xs font-bold text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                    value={l.cifNational}
                                                    onChange={e => handleLineChange(idx, 'cifNational', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    className="w-full bg-white border border-[#D8E2F1] rounded px-1 py-1 text-center text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                    value={l.dutyRate}
                                                    onChange={e => handleLineChange(idx, 'dutyRate', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2 text-right font-bold text-[var(--color-primary,#00A9A8)]">
                                                AED {Number(l.dutyAmount).toFixed(2)}
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    className="w-full bg-white border border-[#D8E2F1] rounded px-1 py-1 text-center text-xs text-[#102A5B] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                                    value={l.vatRate}
                                                    onChange={e => handleLineChange(idx, 'vatRate', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2 text-right font-bold text-indigo-600">
                                                AED {Number(l.vatAmount).toFixed(2)}
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
                                    <Plus size={14} /> {isRTL ? 'إضافة سطر بيان' : 'Add Goods Line'}
                                </button>
                            </div>
                        </div>

                        {/* Financial Summary Box */}
                        <div className="flex justify-end pt-2">
                            <div className="w-full sm:w-80 bg-[#F8FAFC] border border-[#DFE7F4] rounded-xl p-3 space-y-2 text-xs">
                                <div className="flex justify-between items-center text-[#5F6F91]">
                                    <span>{isRTL ? 'إجمالي رسوم الجمرك:' : 'Customs Duty Total:'}</span>
                                    <span className="font-bold text-[#102A5B]">AED {totals.dutyTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[#5F6F91]">
                                    <span>{isRTL ? 'رسوم الخدمة:' : 'Service Charges:'}</span>
                                    <span className="font-bold text-[#102A5B]">AED {Number(form.serviceCharge).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[#5F6F91]">
                                    <span>{isRTL ? 'ضريبة الاحتساب العكسي (VAT RCM):' : 'VAT RCM Total:'}</span>
                                    <span className="font-bold text-indigo-600">AED {totals.vatTotal.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-[#DFE7F4] pt-2 flex justify-between items-center font-bold text-sm text-[var(--color-primary,#00A9A8)]">
                                    <span>{isRTL ? 'إجمالي المستحق للجمارك:' : 'Total Due (Customs):'}</span>
                                    <span>AED {totals.totalDue.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Submit Buttons matching PurchaseOrderForm */}
                    <div className="flex justify-end items-center gap-2 pt-2 border-t border-[#DCE5F3]">
                        <Link
                            to="/purchase-dashboard/custom-declarations"
                            className="px-4 py-1.5 bg-white border border-[#DCE5F3] text-[#102A5B] hover:bg-slate-50 text-xs font-semibold rounded-[5.29px] transition-all"
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </Link>
                        <button
                            type="button"
                            onClick={() => handleSubmit('Draft')}
                            disabled={submitting}
                            className="px-4 py-1.5 bg-white border border-[var(--color-primary,#00A9A8)] text-[var(--color-primary,#00A9A8)] hover:bg-teal-50 text-xs font-semibold rounded-[5.29px] transition-all"
                        >
                            {isRTL ? 'حفظ كمسودة' : 'Save as Draft'}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSubmit('Posted')}
                            disabled={submitting}
                            className="px-5 py-1.5 bg-[var(--color-primary,#00A9A8)] text-[var(--color-primary-foreground,#ffffff)] text-xs font-bold rounded-[var(--theme-border-radius,11px)] shadow-xs flex items-center gap-1.5 transition-all hover:opacity-95 disabled:opacity-50 cursor-pointer"
                        >
                            <Save size={16} />
                            <span>{isEditing ? (isRTL ? 'تحديث البيان' : 'Update Declaration') : (isRTL ? 'حفظ واعتمد' : 'Save Declaration')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoice Picker Modal */}
            {showInvoicePicker && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#DCE5F3] overflow-hidden text-xs">
                        <div className="p-4 border-b border-[#DCE5F3] flex justify-between items-center bg-[#F8FAFC]">
                            <div>
                                <h3 className="text-sm font-bold text-[#102A5B]">{isRTL ? 'اختيار فواتير الشراء' : 'Pick Purchase Invoices'}</h3>
                                <p className="text-[11px] text-[#5F6F91]">{isRTL ? 'حدد الفواتير لإدراج الأصناف في البيان الجمركي' : 'Select invoices to populate declaration items.'}</p>
                            </div>
                            <button onClick={() => setShowInvoicePicker(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X size={18} /></button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#EEF5FF] border-b border-[#DBE5F3] text-[#102A5B] font-semibold text-[11px]">
                                        <th className="p-2 w-10"></th>
                                        <th className="p-2">{isRTL ? 'رقم الفاتورة' : 'Invoice No.'}</th>
                                        <th className="p-2">{isRTL ? 'التاريخ' : 'Date'}</th>
                                        <th className="p-2">{isRTL ? 'المورد' : 'Supplier'}</th>
                                        <th className="p-2 text-right">{isRTL ? 'المبلغ (AED)' : 'Amount (AED)'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#DBE5F3]">
                                    {invoices.map(inv => (
                                        <tr key={inv.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => {
                                            setSelectedInvoiceIds(prev => prev.includes(inv.id) ? prev.filter(id => id !== inv.id) : [...prev, inv.id]);
                                        }}>
                                            <td className="p-2">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedInvoiceIds.includes(inv.id)} 
                                                    onChange={() => {}}
                                                    className="rounded border-[#D8E2F1] text-[var(--color-primary,#00A9A8)]" 
                                                />
                                            </td>
                                            <td className="p-2 font-bold text-[var(--color-primary,#00A9A8)]">{inv.billNumber || `INV-${inv.id}`}</td>
                                            <td className="p-2 text-[#5F6F91]">{inv.billDate ? new Date(inv.billDate).toLocaleDateString() : '—'}</td>
                                            <td className="p-2 font-medium text-[#102A5B]">{inv.supplierName || '—'}</td>
                                            <td className="p-2 text-right font-bold text-[#102A5B]">AED {(inv.netTotal || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-[#F8FAFC] border-t border-[#DCE5F3] flex justify-end gap-2">
                            <button onClick={() => setShowInvoicePicker(false)} className="px-4 py-1.5 border rounded font-semibold text-[#5F6F91] hover:bg-slate-100">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                            <button onClick={handlePickInvoices} className="px-5 py-1.5 bg-[var(--color-primary,#00A9A8)] text-white rounded font-bold hover:opacity-95 flex items-center gap-1.5">
                                <ClipboardCheck size={15} />
                                {isRTL ? `إضافة الفواتير المحددة (${selectedInvoiceIds.length})` : `Add Selected (${selectedInvoiceIds.length})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurCustomDeclarationForm;
