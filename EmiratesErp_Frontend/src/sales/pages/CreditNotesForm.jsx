import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, FileText, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CreditNotesForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isRTL, t } = useLanguage();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);

    const [formData, setFormData] = useState({
        locationId: '',
        customerId: '',
        creditNoteNumber: '',
        invoiceNumber: '',
        creditNoteDate: new Date().toISOString().split('T')[0],
        amount: '',
        taxPercentage: '',
        termsAndConditions: 'Mention your company\'s Terms and Conditions.',
        notes: '',
        template: 'Standard',
        emailTo: '',
        attachments: []
    });

    const [customers, setCustomers] = useState([]);
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        const loadDependencies = async () => {
            setFetchingData(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const custRes = await axios.get(`${API_URL}/parties`, { headers });
                setCustomers(custRes.data.content || custRes.data || []);

                try {
                    const locRes = await axios.get(`${API_URL}/locations`, { headers });
                    setLocations(locRes.data || []);
                } catch (e) {
                    setLocations([{ id: 1, name: 'HO' }]);
                }

                if (isEditMode) {
                    const response = await axios.get(`${API_URL}/credit-notes/${id}`, { headers });
                    const data = response.data;
                    setFormData({
                        locationId: data.locationId || '',
                        customerId: data.customerId || '',
                        creditNoteNumber: data.creditNoteNumber || '',
                        invoiceNumber: data.invoiceNumber || '',
                        creditNoteDate: data.creditNoteDate || new Date().toISOString().split('T')[0],
                        amount: data.amount || '',
                        taxPercentage: data.taxPercentage || '',
                        termsAndConditions: data.termsAndConditions || '',
                        notes: data.notes || '',
                        template: data.template || 'Standard',
                        emailTo: data.emailTo || '',
                        attachments: data.attachments || []
                    });
                }
            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setFetchingData(false);
            }
        };

        loadDependencies();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const payload = {
                ...formData,
                amount: formData.amount ? Number(formData.amount) : null,
                taxPercentage: formData.taxPercentage ? Number(formData.taxPercentage) : null,
                locationId: formData.locationId ? Number(formData.locationId) : null,
                customerId: formData.customerId ? Number(formData.customerId) : null,
            };

            if (isEditMode) {
                await axios.put(`${API_URL}/credit-notes/${id}`, payload, { headers });
            } else {
                await axios.post(`${API_URL}/credit-notes`, payload, { headers });
            }
            navigate('/sales-dashboard/credit-notes');
        } catch (err) {
            console.error("Submit error", err);
            alert(`Failed to save: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div className="flex justify-center items-center h-64 bg-background">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground font-sans space-y-2 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Top Action Header Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-6 h-6 rounded border border-border flex items-center justify-center text-foreground hover:bg-hover transition-colors"
                    >
                        <ArrowLeft size={13} />
                    </button>
                    <div>
                        <h1 className="text-xs font-bold text-foreground leading-tight">
                            {isEditMode
                                ? (isRTL ? 'تعديل الإشعار الدائن' : 'Edit Credit Note')
                                : (isRTL ? 'إشعار دائن جديد' : 'New Credit Note')}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none mt-0.5">
                            {isRTL ? 'الرئيسية > المبيعات > الإشعارات الدائنة > نموذج' : 'Home > Sales > Credit Notes > Form'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                        type="button"
                        onClick={() => navigate('/sales-dashboard/credit-notes')}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold border border-border bg-card hover:bg-hover text-foreground transition-colors"
                    >
                        {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        form="credit-note-form"
                        disabled={loading}
                        className="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        {isEditMode ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'حفظ' : 'Save')}
                    </button>
                </div>
            </div>

            {/* Main Credit Note Form */}
            <form id="credit-note-form" onSubmit={handleSubmit} className="space-y-2">
                {/* Header Information Card */}
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-border">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <FileText size={13} />
                        </div>
                        <h2 className="text-xs font-bold text-foreground">
                            {isRTL ? 'معلومات الإشعار الدائن' : 'Credit Note Information'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'الموقع' : 'Location'} *
                            </label>
                            <select
                                name="locationId"
                                value={formData.locationId}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                required
                            >
                                <option value="">{isRTL ? 'اختر الموقع' : 'Select Location'}</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {t('qform.customer')} *
                            </label>
                            <select
                                name="customerId"
                                value={formData.customerId}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                required
                            >
                                <option value="">{t('qform.selectCustomer')}</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.companyName || c.primaryContactPerson}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {t('qform.quotationDate')} *
                            </label>
                            <input
                                type="date"
                                name="creditNoteDate"
                                value={formData.creditNoteDate}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'رقم الفاتورة المرجعية' : 'Invoice Number'}
                            </label>
                            <input
                                type="text"
                                name="invoiceNumber"
                                value={formData.invoiceNumber}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                placeholder={isRTL ? 'مثال: INV-2025-001' : 'e.g. INV-2025-001'}
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'رقم الإشعار الدائن' : 'Credit Note Number'}
                            </label>
                            <input
                                type="text"
                                name="creditNoteNumber"
                                value={formData.creditNoteNumber}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary font-mono"
                                placeholder="CN-0001 (Auto)"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'البريد الإلكتروني' : 'Email To'}
                            </label>
                            <input
                                type="email"
                                name="emailTo"
                                value={formData.emailTo}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                placeholder="client@company.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Amount & Terms Card */}
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-border">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <FileText size={13} />
                        </div>
                        <h2 className="text-xs font-bold text-foreground">
                            {isRTL ? 'المبالغ والشروط' : 'Financials & Terms'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'مبلغ الإشعار (AED)' : 'Credit Amount (AED)'} *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary font-mono font-bold text-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'نسبة الضريبة (%)' : 'Tax Percentage (%)'}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="taxPercentage"
                                value={formData.taxPercentage}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary font-mono"
                                placeholder="5%"
                            />
                        </div>

                        <div className="sm:col-span-2 md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                    {t('qform.terms')}
                                </label>
                                <textarea
                                    name="termsAndConditions"
                                    rows="3"
                                    value={formData.termsAndConditions}
                                    onChange={handleChange}
                                    className="w-full text-[11px] border border-border bg-background rounded p-2 text-foreground focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                    {t('qform.notes')}
                                </label>
                                <textarea
                                    name="notes"
                                    rows="3"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="w-full text-[11px] border border-border bg-background rounded p-2 text-foreground focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreditNotesForm;
