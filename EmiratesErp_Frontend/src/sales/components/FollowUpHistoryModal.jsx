import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader2, Calendar, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const FollowUpHistoryModal = ({ isOpen, onClose, quotationId, rentalQuotationId }) => {
    const { isRTL, t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (isOpen && (quotationId || rentalQuotationId)) {
            fetchHistory();
        }
    }, [isOpen, quotationId, rentalQuotationId]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            let url = '';
            if (quotationId) {
                url = `${API_URL}/sales/followups/by-quotation/${quotationId}`;
            } else if (rentalQuotationId) {
                url = `${API_URL}/sales/followups/by-rental-quotation/${rentalQuotationId}`;
            }

            if (url) {
                const res = await axios.get(url, { headers });
                setHistory(res.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col font-sans">
                {/* Header */}
                <div className="bg-[#003E5B] text-white px-4 py-3 flex justify-between items-center shrink-0 border-b border-[#00A9A8]/20 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-[#00A9A8] shadow-xs shrink-0">
                            <Calendar size={18} strokeWidth={2.2} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white tracking-wide">
                                {isRTL ? 'سجل المتابعات' : 'FOLLOW UP HISTORY'}
                            </h2>
                            <p className="text-[10px] text-white/80 leading-none mt-0.5">
                                {isRTL ? 'عرض جميع المتابعات المكتملة' : 'View all recorded quotation follow ups'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-background">
                    <div className="border border-border rounded-lg p-3 sm:p-4 bg-card shadow-2xs space-y-2">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#064DB9] border-b border-border pb-1.5">
                            {t('followup.previousSection')}
                        </h3>

                        {loading ? (
                            <div className="flex flex-col justify-center items-center p-12 gap-2">
                                <Loader2 className="animate-spin text-[#00A9A8] w-7 h-7" />
                                <span className="text-xs text-foreground-muted">Loading history...</span>
                            </div>
                        ) : (
                            <div className="rounded border border-border overflow-x-auto">
                                <table className="w-full text-[11px] border-collapse">
                                    <thead>
                                        <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                            <th className="px-3 py-1.5 text-center border-r border-border w-14">S.No.</th>
                                            <th className="px-3 py-1.5 text-center border-r border-border w-28">Follow Up Date</th>
                                            <th className="px-3 py-1.5 text-start border-r border-border min-w-[150px]">Remarks</th>
                                            <th className="px-3 py-1.5 text-center border-r border-border w-32">Next Follow Date</th>
                                            <th className="px-3 py-1.5 text-start w-28">Followed By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {history.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-1.5">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                                                            <Info size={16} />
                                                        </div>
                                                        <span className="text-xs font-bold text-foreground">{t('followup.noRecords')}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            history.map((h, index) => (
                                                <tr key={h.id || index} className="hover:bg-hover">
                                                    <td className="px-3 py-1.5 text-center border-r border-border">{index + 1}</td>
                                                    <td className="px-3 py-1.5 text-center border-r border-border">{new Date(h.createdAt || h.createdDate).toLocaleDateString()}</td>
                                                    <td className="px-3 py-1.5 border-r border-border">{h.comment || '-'}</td>
                                                    <td className="px-3 py-1.5 text-center font-semibold text-primary border-r border-border">{h.nextFollowupDate || '-'}</td>
                                                    <td className="px-3 py-1.5">{h.employeeName || 'Admin'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-3 bg-card border-t border-border flex justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 rounded text-[11px] font-bold border border-border bg-card hover:bg-hover text-foreground transition-colors cursor-pointer"
                    >
                        {t('followup.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FollowUpHistoryModal;
