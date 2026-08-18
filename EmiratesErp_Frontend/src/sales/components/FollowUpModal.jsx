import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader2, Calendar, Clock, Bell, Send, Bookmark, Info, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const FollowUpModal = ({ isOpen, onClose, quotationId, rentalQuotationId, onSuccess }) => {
    const { isRTL, t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [quotation, setQuotation] = useState(null);
    const [history, setHistory] = useState([]);
    const [enableReminder, setEnableReminder] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        quotationStatus: '',
        nextFollowupDate: '',
        nextFollowupTime: '',
        comment: ''
    });

    useEffect(() => {
        if (isOpen && (quotationId || rentalQuotationId)) {
            fetchData();
            setFormData({
                quotationStatus: '',
                nextFollowupDate: '',
                nextFollowupTime: '',
                comment: ''
            });
            setEnableReminder(false);
        }
    }, [isOpen, quotationId, rentalQuotationId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            if (quotationId) {
                const quoteRes = await axios.get(`${API_URL}/sales/quotations/${quotationId}`, { headers });
                setQuotation(quoteRes.data);
                setFormData(prev => ({ ...prev, quotationStatus: quoteRes.data.status }));

                const historyRes = await axios.get(`${API_URL}/sales/followups/by-quotation/${quotationId}`, { headers });
                setHistory(historyRes.data || []);
            } else if (rentalQuotationId) {
                const quoteRes = await axios.get(`${API_URL}/sales/rental-quotations/${rentalQuotationId}`, { headers });
                setQuotation(quoteRes.data);
                setFormData(prev => ({ ...prev, quotationStatus: quoteRes.data.status }));

                const historyRes = await axios.get(`${API_URL}/sales/followups/by-rental-quotation/${rentalQuotationId}`, { headers });
                setHistory(historyRes.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch details", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (statusOverride = null) => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            const finalStatus = statusOverride || formData.quotationStatus;

            const payload = {
                quotationId: quotationId || null,
                rentalQuotationId: rentalQuotationId || null,
                ...formData,
                quotationStatus: finalStatus,
                enableReminder,
                employeeId: user?.employeeId
            };

            await axios.post(`${API_URL}/sales/followups`, payload, { headers });

            if (finalStatus) {
                try {
                    if (rentalQuotationId) {
                        await axios.patch(`${API_URL}/sales/rental-quotations/${rentalQuotationId}/status?status=${finalStatus}`, null, { headers });
                    } else if (quotationId) {
                        await axios.patch(`${API_URL}/sales/quotations/${quotationId}/status?status=${finalStatus}`, null, { headers });
                    }
                } catch (statusErr) {
                    console.error("Failed to update parent status", statusErr);
                }
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to save follow up", err);
            alert("Failed to save follow up");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSave();
    };

    if (!isOpen) return null;

    // Calculate total amount for items
    const itemsList = quotation?.items || [];
    const totalAmount = itemsList.reduce((sum, item) => {
        const rate = item.rentalValue || item.unitPrice || item.rate || 0;
        const qty = item.quantity || item.qty || 1;
        return sum + (rate * qty);
    }, 0);

    const lastHistoryItem = history && history.length > 0 ? history[0] : null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col font-sans">
                {/* Header (Matching Figma Specs: #003E5B background, icon badge #00A9A8 border/accent) */}
                <div className="bg-[#003E5B] text-white px-4 py-3 flex justify-between items-center shrink-0 border-b border-[#00A9A8]/20 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center text-[#00A9A8] shadow-xs shrink-0">
                            <Calendar size={20} strokeWidth={2.2} />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold leading-tight tracking-wide text-white">
                                {t('followup.title')}
                            </h2>
                            <p className="text-[10px] sm:text-[11px] text-white/80 leading-none mt-0.5">
                                {t('followup.subtitle')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col justify-center items-center p-16 gap-3">
                        <Loader2 className="animate-spin text-[#00A9A8] w-8 h-8" />
                        <span className="text-xs text-foreground-muted">Loading follow up details...</span>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-background">
                        {/* Section 1: Follow Up Information */}
                        <div className="border border-border rounded-lg p-3 sm:p-4 bg-card shadow-2xs space-y-3">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border pb-2">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#064DB9]">
                                    {t('followup.infoSection')}
                                </h3>
                                <div className="flex items-center gap-2 bg-[#EAF2FF] border border-[#064DB9]/20 px-2.5 py-1 rounded text-[10px] text-[#123D7D] font-medium">
                                    <Clock size={12} className="text-[#064DB9]" />
                                    <span>{t('followup.lastUpdated')} {lastHistoryItem ? new Date(lastHistoryItem.createdAt || lastHistoryItem.createdDate).toLocaleDateString() : '--'}</span>
                                    <span className="opacity-40">|</span>
                                    <span>{t('followup.createdBy')} {lastHistoryItem?.employeeName || '--'}</span>
                                </div>
                            </div>

                            <form id="followup-form" onSubmit={handleSubmit} className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* Quotation Status */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-foreground mb-1">
                                            {t('followup.quotationStatus')} <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.quotationStatus}
                                                onChange={e => setFormData({ ...formData, quotationStatus: e.target.value })}
                                                className="w-full h-8 text-[11px] bg-background border border-border rounded px-2.5 text-foreground font-medium focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                                            >
                                                <option value="">Select Status</option>
                                                <option value="DRAFT">Draft</option>
                                                <option value="SENT">Sent</option>
                                                <option value="ACCEPTED">Accepted</option>
                                                <option value="REJECTED">Rejected</option>
                                                <option value="RENTAL_ORDER">Rental Order</option>
                                                <option value="RENTAL_INVOICE">Rental Invoice</option>
                                            </select>
                                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-muted">
                                                ▼
                                            </span>
                                        </div>
                                    </div>

                                    {/* Next Follow Up Date */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-foreground mb-1">
                                            {t('followup.nextDate')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.nextFollowupDate}
                                            onChange={e => setFormData({ ...formData, nextFollowupDate: e.target.value })}
                                            className="w-full h-8 text-[11px] bg-background border border-border rounded px-2.5 text-foreground font-medium focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>

                                    {/* Next Follow Up Time */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-foreground mb-1">
                                            {t('followup.nextTime')}
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.nextFollowupTime}
                                            onChange={e => setFormData({ ...formData, nextFollowupTime: e.target.value })}
                                            className="w-full h-8 text-[11px] bg-background border border-border rounded px-2.5 text-foreground font-medium focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Comment / Remarks */}
                                <div>
                                    <label className="block text-[10px] font-bold text-foreground mb-1">
                                        {t('followup.comments')}
                                    </label>
                                    <textarea
                                        rows="2.5"
                                        required
                                        value={formData.comment}
                                        onChange={e => setFormData({ ...formData, comment: e.target.value })}
                                        className="w-full text-[11px] bg-background border border-border rounded p-2.5 text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:border-primary transition-colors resize-y"
                                        placeholder={t('followup.enterComments')}
                                    ></textarea>
                                    <p className="text-[9px] text-foreground-muted mt-0.5">
                                        {t('followup.commentsHint')}
                                    </p>
                                </div>
                            </form>

                            {/* Reminder Strip Banner */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2.5 rounded-md bg-[#EAF5F5] border border-[#00A9A8]/30 gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-[#00A9A8]/10 flex items-center justify-center text-[#00A9A8] shrink-0">
                                        <Bell size={14} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-[#00A9A8] tracking-wide block">
                                            {t('followup.reminderTitle')}
                                        </span>
                                        <span className="text-[9px] text-foreground-muted">
                                            {t('followup.reminderSub')}
                                        </span>
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer self-end sm:self-auto select-none">
                                    <input
                                        type="checkbox"
                                        checked={enableReminder}
                                        onChange={e => setEnableReminder(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#00A9A8] relative"></div>
                                    <span className="text-[10px] font-bold text-foreground">
                                        {t('followup.enableReminder')}
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Section 2: Items Details */}
                        <div className="border border-border rounded-lg p-3 sm:p-4 bg-card shadow-2xs space-y-2">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#064DB9] border-b border-border pb-1.5">
                                {t('followup.itemsSection')}
                            </h3>

                            <div className="rounded border border-border overflow-x-auto">
                                <table className="w-full text-[11px] border-collapse">
                                    <thead>
                                        <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                            <th className="px-3 py-1.5 text-center border-r border-border w-12">#</th>
                                            <th className="px-3 py-1.5 text-start border-r border-border min-w-[100px]">Item Code</th>
                                            <th className="px-3 py-1.5 text-start border-r border-border min-w-[160px]">Item Description</th>
                                            <th className="px-3 py-1.5 text-center border-r border-border w-24">Quantity</th>
                                            <th className="px-3 py-1.5 text-center border-r border-border w-20">Unit</th>
                                            <th className="px-3 py-1.5 text-end border-r border-border w-28">Rate (AED)</th>
                                            <th className="px-3 py-1.5 text-end w-28">Amount (AED)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {itemsList.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-3 text-foreground-muted">
                                                    No item details available.
                                                </td>
                                            </tr>
                                        ) : (
                                            <>
                                                {itemsList.map((item, index) => {
                                                    const rate = item.rentalValue || item.unitPrice || item.rate || 0;
                                                    const qty = item.quantity || item.qty || 1;
                                                    const amount = rate * qty;
                                                    return (
                                                        <tr key={index} className="hover:bg-hover">
                                                            <td className="px-3 py-1.5 text-center border-r border-border">{index + 1}</td>
                                                            <td className="px-3 py-1.5 font-mono text-primary font-semibold border-r border-border">
                                                                {item.itemCode || item.code || `ITM-00${index + 1}`}
                                                            </td>
                                                            <td className="px-3 py-1.5 border-r border-border">
                                                                <div className="font-semibold text-foreground">{item.itemName || item.name}</div>
                                                                {item.description && <div className="text-[10px] text-foreground-muted">{item.description}</div>}
                                                            </td>
                                                            <td className="px-3 py-1.5 text-center font-mono border-r border-border">{qty}</td>
                                                            <td className="px-3 py-1.5 text-center uppercase border-r border-border">{item.unit || item.uom || 'NOS'}</td>
                                                            <td className="px-3 py-1.5 text-end font-mono border-r border-border">{rate.toFixed(2)}</td>
                                                            <td className="px-3 py-1.5 text-end font-mono font-bold text-foreground">{amount.toFixed(2)}</td>
                                                        </tr>
                                                    );
                                                })}
                                                <tr className="bg-primary/5 font-bold border-t-2 border-border">
                                                    <td colSpan="5" className="px-3 py-1.5"></td>
                                                    <td className="px-3 py-1.5 text-end font-semibold text-foreground border-r border-border">Total Amount (AED)</td>
                                                    <td className="px-3 py-1.5 text-end font-mono text-primary text-xs">{totalAmount.toFixed(2)}</td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Section 3: Previous Follow Ups */}
                        <div className="border border-border rounded-lg p-3 sm:p-4 bg-card shadow-2xs space-y-2">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#064DB9] border-b border-border pb-1.5">
                                {t('followup.previousSection')}
                            </h3>

                            <div className="rounded border border-border overflow-x-auto">
                                <table className="w-full text-[11px] border-collapse">
                                    <thead>
                                        <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                            <th className="px-3 py-1.5 text-center border-r border-border w-14">S.No.</th>
                                            <th className="px-3 py-1.5 text-center border-r border-border w-28">Follow Up Date</th>
                                            <th className="px-3 py-1.5 text-center border-r border-border w-24">Follow Up Time</th>
                                            <th className="px-3 py-1.5 text-start border-r border-border min-w-[150px]">Remarks</th>
                                            <th className="px-3 py-1.5 text-center border-r border-border w-32">Next Follow Up Date</th>
                                            <th className="px-3 py-1.5 text-start border-r border-border min-w-[120px]">Followed By</th>
                                            <th className="px-3 py-1.5 text-center w-24">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {history.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="py-8 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-1.5">
                                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                                                            <Info size={18} />
                                                        </div>
                                                        <span className="text-xs font-bold text-foreground">{t('followup.noRecords')}</span>
                                                        <span className="text-[10px] text-foreground-muted">{t('followup.noRecordsSub')}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            history.map((h, index) => (
                                                <tr key={h.id || index} className="hover:bg-hover">
                                                    <td className="px-3 py-1.5 text-center border-r border-border">{index + 1}</td>
                                                    <td className="px-3 py-1.5 text-center border-r border-border">{new Date(h.createdAt || h.createdDate).toLocaleDateString()}</td>
                                                    <td className="px-3 py-1.5 text-center font-mono border-r border-border">{h.nextFollowupTime || '--:--'}</td>
                                                    <td className="px-3 py-1.5 border-r border-border">{h.comment || '-'}</td>
                                                    <td className="px-3 py-1.5 text-center font-semibold text-primary border-r border-border">{h.nextFollowupDate || '-'}</td>
                                                    <td className="px-3 py-1.5 border-r border-border">{h.employeeName || 'Admin'}</td>
                                                    <td className="px-3 py-1.5 text-center font-semibold text-[10px]">
                                                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                                            {h.quotationStatus || 'DRAFT'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Controls */}
                <div className="p-3 sm:p-4 bg-card border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-1.5 rounded text-[11px] font-bold border border-border bg-card hover:bg-hover text-foreground transition-colors cursor-pointer"
                    >
                        {t('followup.cancel')}
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => handleSave('DRAFT')}
                            disabled={submitting}
                            className="w-full sm:w-auto px-4 py-1.5 rounded text-[11px] font-bold border border-[#00A9A8] text-[#00A9A8] bg-card hover:bg-[#00A9A8]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            <Bookmark size={13} />
                            {t('followup.saveDraft')}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSave()}
                            disabled={submitting}
                            className="w-full sm:w-auto px-4 py-1.5 rounded text-[11px] font-bold bg-[#00A9A8] hover:bg-[#009493] text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                            {t('followup.submit')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FollowUpModal;
