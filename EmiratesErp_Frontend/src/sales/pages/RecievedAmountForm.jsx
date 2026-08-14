import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, FileText, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RecievedAmountForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isRTL, t } = useLanguage();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);

    const [formData, setFormData] = useState({
        entryType: 'Domestic',
        locationId: '',
        customerId: '',
        piNumber: '',
        manualPiNumber: '',
        amount: '',
        isReceivedFullAmount: false,
        isTaxDeducted: false,
        depositDate: new Date().toISOString().split('T')[0],
        depositMode: 'Bank Transfer',
        reference: '',
        chequeNumber: '',
        receivingDate: new Date().toISOString().split('T')[0],
        receivedNumber: '',
        invoiceNumber: '',
        tds: '',
        advanceAmount: '',
        totalPiAmount: '',
        fbc: '',
        expectedInFc: '',
        bankCharges: '',
        fineAndPenalty: '',
        rebateAndDiscount: ''
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
                    const response = await axios.get(`${API_URL}/recieved/${id}`, { headers });
                    const data = response.data;
                    setFormData({
                        entryType: data.entryType || 'Domestic',
                        locationId: data.locationId || '',
                        customerId: data.customerId || '',
                        piNumber: data.piNumber || '',
                        manualPiNumber: data.manualPiNumber || '',
                        amount: data.amount || '',
                        isReceivedFullAmount: data.isReceivedFullAmount || false,
                        isTaxDeducted: data.isTaxDeducted || false,
                        depositDate: data.depositDate || new Date().toISOString().split('T')[0],
                        depositMode: data.depositMode || '',
                        reference: data.reference || '',
                        chequeNumber: data.chequeNumber || '',
                        receivingDate: data.receivingDate || new Date().toISOString().split('T')[0],
                        receivedNumber: data.receivedNumber || '',
                        invoiceNumber: data.invoiceNumber || '',
                        tds: data.tds || '',
                        advanceAmount: data.advanceAmount || '',
                        totalPiAmount: data.totalPiAmount || '',
                        fbc: data.fbc || '',
                        expectedInFc: data.expectedInFc || '',
                        bankCharges: data.bankCharges || '',
                        fineAndPenalty: data.fineAndPenalty || '',
                        rebateAndDiscount: data.rebateAndDiscount || ''
                    });
                }
            } catch (err) {
                console.error("Failed to load data", err);
                alert("Failed to load dependency data or record.");
            } finally {
                setFetchingData(false);
            }
        };

        loadDependencies();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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
                tds: formData.tds ? Number(formData.tds) : null,
                advanceAmount: formData.advanceAmount ? Number(formData.advanceAmount) : null,
                totalPiAmount: formData.totalPiAmount ? Number(formData.totalPiAmount) : null,
                fbc: formData.fbc ? Number(formData.fbc) : null,
                expectedInFc: formData.expectedInFc ? Number(formData.expectedInFc) : null,
                bankCharges: formData.bankCharges ? Number(formData.bankCharges) : null,
                fineAndPenalty: formData.fineAndPenalty ? Number(formData.fineAndPenalty) : null,
                rebateAndDiscount: formData.rebateAndDiscount ? Number(formData.rebateAndDiscount) : null,
                locationId: formData.locationId ? Number(formData.locationId) : null,
                customerId: formData.customerId ? Number(formData.customerId) : null,
            };

            if (isEditMode) {
                await axios.put(`${API_URL}/recieved/${id}`, payload, { headers });
            } else {
                await axios.post(`${API_URL}/recieved`, payload, { headers });
            }
            navigate('/sales-dashboard/recieved-amounts');
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
            {/* Action Header Card */}
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
                                ? (isRTL ? 'تعديل المبلغ المستلم' : 'Edit Amount Received')
                                : (isRTL ? 'مبلغ مستلم جديد' : 'New Amount Received')}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none mt-0.5">
                            {isRTL ? 'الرئيسية > المبيعات > إيصالات الاستلام > نموذج' : 'Home > Sales > Amount Received > Form'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                        type="button"
                        onClick={() => navigate('/sales-dashboard/recieved-amounts')}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold border border-border bg-card hover:bg-hover text-foreground transition-colors"
                    >
                        {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        form="recieved-amount-form"
                        disabled={loading}
                        className="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        {isEditMode ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'حفظ' : 'Save')}
                    </button>
                </div>
            </div>

            {/* Main Form Card */}
            <form id="recieved-amount-form" onSubmit={handleSubmit} className="space-y-2">
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-border">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <FileText size={13} />
                        </div>
                        <h2 className="text-xs font-bold text-foreground">
                            {isRTL ? 'تفاصيل الاستلام الأساسية' : 'Receipt Details'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'نوع الإدخال' : 'Entry Type'} *
                            </label>
                            <select
                                name="entryType"
                                value={formData.entryType}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                required
                            >
                                <option value="Domestic">{isRTL ? 'محلي' : 'Domestic'}</option>
                                <option value="International">{isRTL ? 'دولي' : 'International'}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'الموقع' : 'Location'}
                            </label>
                            <select
                                name="locationId"
                                value={formData.locationId}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
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
                                {isRTL ? 'تاريخ الاستلام' : 'Receiving Date'} *
                            </label>
                            <input
                                type="date"
                                name="receivingDate"
                                value={formData.receivingDate}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'تاريخ الإيداع' : 'Deposit Date'} *
                            </label>
                            <input
                                type="date"
                                name="depositDate"
                                value={formData.depositDate}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'طريقة الإيداع' : 'Deposit Mode'}
                            </label>
                            <select
                                name="depositMode"
                                value={formData.depositMode}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            >
                                <option value="Bank Transfer">{isRTL ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                                <option value="Cheque">{isRTL ? 'شيك' : 'Cheque'}</option>
                                <option value="Cash">{isRTL ? 'نقداً' : 'Cash'}</option>
                                <option value="Credit Card">{isRTL ? 'بطاقة ائتمان' : 'Credit Card'}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {t('qform.reference')}
                            </label>
                            <input
                                type="text"
                                name="reference"
                                value={formData.reference}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                                placeholder={t('qform.refPlaceholder')}
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'رقم الشيك' : 'Cheque Number'}
                            </label>
                            <input
                                type="text"
                                name="chequeNumber"
                                value={formData.chequeNumber}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* Amount Details Card */}
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-border">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <FileText size={13} />
                        </div>
                        <h2 className="text-xs font-bold text-foreground">
                            {isRTL ? 'تفاصيل المبالغ والتسويات' : 'Amount & Breakdown'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'المبلغ المستلم (AED)' : 'Amount (AED)'} *
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
                                TDS (AED)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="tds"
                                value={formData.tds}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'المبلغ المقدم (AED)' : 'Advance Amount (AED)'}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="advanceAmount"
                                value={formData.advanceAmount}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'رسوم البنك (AED)' : 'Bank Charges (AED)'}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="bankCharges"
                                value={formData.bankCharges}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'الغرامات والجزاءات (AED)' : 'Fine & Penalty (AED)'}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="fineAndPenalty"
                                value={formData.fineAndPenalty}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                                {isRTL ? 'الخصوم والتسويات (AED)' : 'Rebate & Discount (AED)'}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="rebateAndDiscount"
                                value={formData.rebateAndDiscount}
                                onChange={handleChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary font-mono"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-4">
                            <input
                                type="checkbox"
                                id="isReceivedFullAmount"
                                name="isReceivedFullAmount"
                                checked={formData.isReceivedFullAmount}
                                onChange={handleChange}
                                className="rounded border-border text-primary focus:ring-primary"
                            />
                            <label htmlFor="isReceivedFullAmount" className="text-[11px] font-semibold text-foreground cursor-pointer">
                                {isRTL ? 'تم استلام المبلغ بالكامل' : 'Received Full Amount'}
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RecievedAmountForm;
