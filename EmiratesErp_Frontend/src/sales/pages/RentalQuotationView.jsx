import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit, FileText, Printer, Mail, Paperclip, ChevronDown, Loader2, Copy, XCircle, Trash2, Plus, List } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RentalQuotationView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isRTL, t } = useLanguage();
    const [quotation, setQuotation] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConvertMenu, setShowConvertMenu] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showAuditInfo, setShowAuditInfo] = useState(true);

    const convertMenuRef = useRef(null);
    const moreMenuRef = useRef(null);
    const attachmentRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [quotationRes, companyRes] = await Promise.all([
                    axios.get(`${API_URL}/sales/rental-quotations/${id}`, { headers }),
                    axios.get(`${API_URL}/company-info`, { headers }).catch(() => ({ data: null }))
                ]);

                let quotationData = quotationRes.data;
                let partyData = null;

                if (quotationData.customerId) {
                    try {
                        const partyRes = await axios.get(`${API_URL}/parties/${quotationData.customerId}`, { headers });
                        partyData = partyRes.data;
                    } catch (err) {
                        console.error("Failed to fetch party details", err);
                    }
                }

                setQuotation({ ...quotationData, customerParty: partyData });
                setCompany(companyRes.data);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load rental quotation details.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (convertMenuRef.current && !convertMenuRef.current.contains(event.target)) {
                setShowConvertMenu(false);
            }
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
                setShowMoreMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const numberToWords = (amount) => {
        return `${amount} Dirhams`;
    };

    const handleDownloadPdf = async () => {
        try {
            const response = await axios.get(`${API_URL}/sales/rental-quotations/${id}/pdf`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Rental_Quotation_${quotation.quotationNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Failed to download PDF", err);
            alert("Failed to download PDF. Please try again.");
        }
    };

    const handleCancelQuotation = async () => {
        if (!window.confirm('Are you sure you want to mark this rental quotation as CANCELLED?')) return;
        try {
            await axios.patch(`${API_URL}/sales/rental-quotations/${id}/status`, null, {
                params: { status: 'CANCELLED' },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setQuotation(prev => ({ ...prev, status: 'CANCELLED' }));
            setShowMoreMenu(false);
        } catch (err) {
            console.error("Failed to cancel quotation", err);
            alert("Failed to update status");
        }
    };

    const handleWhatsApp = () => {
        const phoneNumber = quotation.customerParty?.phone || '';
        const text = `Hi, here is your Rental Quotation ${quotation.quotationNumber}.`;
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleEmail = () => {
        const email = quotation.customerParty?.email || '';
        const subject = `Rental Quotation ${quotation.quotationNumber}`;
        const body = `Dear Customer,\n\nPlease find attached Rental Quotation ${quotation.quotationNumber}.\n\nRegards,\n${company?.companyName || ''}`;
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const scrollToAttachments = () => {
        if (attachmentRef.current) {
            attachmentRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (!quotation.attachments || quotation.attachments.length === 0) {
            alert("No attachments found.");
        }
    };

    const handlePrintLetterhead = () => {
        window.print();
    };

    const formatAddress = (address) => {
        if (!address) return 'Address not available';
        if (typeof address === 'string') return address;
        const parts = [
            address.addressLine,
            address.city,
            address.state,
            address.country,
            address.zipCode
        ].filter(Boolean);
        return parts.join(', ');
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (error) return <div className="p-8 text-center text-red-600 bg-background">{error}</div>;
    if (!quotation) return <div className="p-8 text-center text-foreground bg-background">Quotation not found.</div>;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans space-y-2 w-full print:bg-white print:p-0 print:text-black" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs print:hidden">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <FileText size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">
                            {t('rental.viewTitle')}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none">
                            Rental Quotation #{quotation.quotationNumber}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                        onClick={() => navigate('/sales-dashboard/rental-quotations')}
                        className="px-3 py-1 border border-border bg-card hover:bg-hover text-foreground rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                        <List size={12} /> {t('rental.allQuotations')}
                    </button>
                    <button
                        onClick={() => navigate('/sales-dashboard/rental-quotations/new')}
                        className="px-3.5 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                    >
                        <Plus size={12} /> {t('rental.newBtn')}
                    </button>
                </div>
            </div>

            <div className="px-2.5 py-1.5 flex flex-wrap gap-1.5 items-center bg-card border border-border rounded-lg shadow-2xs print:hidden">
                <button
                    onClick={() => navigate(`/sales-dashboard/rental-quotations/edit/${id}`)}
                    className="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                    title={t('qview.edit')}
                >
                    <Edit size={12} /> {t('qview.edit')}
                </button>

                <button
                    onClick={handleDownloadPdf}
                    className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                    title={t('qview.pdf')}
                >
                    <FileText size={12} /> {t('qview.pdf')}
                </button>

                <button
                    onClick={handleWhatsApp}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                    title={t('qview.wa')}
                >
                    <span className="font-bold text-[10px]">WA</span>
                </button>

                <button
                    onClick={() => window.print()}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                    title={t('qview.print')}
                >
                    <Printer size={12} /> {t('qview.print')}
                </button>

                <button
                    onClick={handlePrintLetterhead}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                    <Printer size={12} /> {t('qview.printLetterhead')}
                </button>

                <button
                    onClick={handleEmail}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                    title={t('qview.email')}
                >
                    <Mail size={12} /> {t('qview.email')}
                </button>

                <button
                    onClick={scrollToAttachments}
                    className="px-2.5 py-1 bg-slate-500 hover:bg-slate-600 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                    title={t('qview.attachments')}
                >
                    <Paperclip size={12} /> {t('qview.attachments')}
                </button>

                <div className="relative" ref={convertMenuRef}>
                    <button
                        onClick={() => setShowConvertMenu(!showConvertMenu)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                        {t('qview.convert')} <ChevronDown size={12} />
                    </button>
                    {showConvertMenu && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-48 bg-card border border-border rounded-md shadow-xl text-[11px] py-1">
                            <button
                                className="block w-full text-left px-3 py-1.5 hover:bg-primary/10 text-primary font-medium"
                                onClick={() => navigate(`/sales-dashboard/rental-sales-orders/new?quotationId=${id}`)}
                            >
                                Convert to Rental Order
                            </button>
                            <button
                                className="block w-full text-left px-3 py-1.5 hover:bg-primary/10 text-primary font-medium"
                                onClick={() => navigate(`/sales-dashboard/rental-invoices/new?quotationId=${id}`)}
                            >
                                Convert to Rental Invoice
                            </button>
                        </div>
                    )}
                </div>

                <div className="relative" ref={moreMenuRef}>
                    <button
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                        {t('qview.more')} <ChevronDown size={12} />
                    </button>
                    {showMoreMenu && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-36 bg-card border border-border rounded-md shadow-xl text-[11px] py-1">
                            <button
                                className="block w-full text-left px-3 py-1.5 hover:bg-hover text-foreground flex items-center gap-1.5"
                                onClick={() => navigate(`/sales-dashboard/rental-quotations/new?cloneId=${id}`)}
                            >
                                <Copy size={11} /> {t('qview.clone')}
                            </button>
                            <button
                                className="block w-full text-left px-3 py-1.5 hover:bg-hover text-foreground flex items-center gap-1.5"
                                onClick={handleCancelQuotation}
                            >
                                <XCircle size={11} /> {t('qview.markCancelled')}
                            </button>
                            <div className="border-t border-border my-1"></div>
                            <button
                                className="block w-full text-left px-3 py-1.5 hover:bg-red-500/10 text-red-600 flex items-center gap-1.5 font-medium"
                                onClick={() => {
                                    if (window.confirm('Delete this rental quotation?')) {
                                        axios.delete(`${API_URL}/sales/rental-quotations/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                                            .then(() => navigate('/sales-dashboard/rental-quotations'))
                                            .catch(() => alert("Failed to delete"));
                                    }
                                }}
                            >
                                <Trash2 size={11} /> {t('qview.delete')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-3 py-1.5 bg-card border border-border rounded-lg text-[10px] text-foreground-muted flex flex-col gap-0.5 shadow-2xs print:hidden">
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => setShowAuditInfo(!showAuditInfo)}
                        className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold uppercase transition-colors"
                    >
                        {showAuditInfo ? t('qview.viewLess') : t('qview.viewMore')}
                    </button>
                </div>
                {showAuditInfo && (
                    <div className="space-y-0.5 pt-0.5 border-t border-border">
                        {quotation.updatedAt && (
                            <div>
                                {new Date(quotation.updatedAt).toLocaleString()} — {t('qview.updated')} {quotation.updatedBy || 'System'}
                            </div>
                        )}
                        <div>
                            {quotation.createdAt ? new Date(quotation.createdAt).toLocaleString() : '-'} — {t('qview.created')} {quotation.createdBy || 'System'}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-grow bg-card border border-border rounded-lg p-6 shadow-2xs print:border-none print:shadow-none print:p-0 print:bg-white text-foreground">
                <div className="text-center mb-6 border-b border-border pb-4">
                    <h2 className="text-lg font-bold text-foreground">{company?.companyName || 'Your Company Name'}</h2>
                    <p className="text-xs text-foreground-muted">{company?.address || 'Address Line 1'}, {company?.city || 'City'} {company?.country || 'Country'} {company?.email || 'email@example.com'}</p>
                </div>

                <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
                    <div className="space-y-1 text-xs">
                        <div className="flex"><span className="w-28 font-semibold text-foreground">{t('qview.quotationNo')}</span><span className="text-foreground">: {quotation.quotationNumber}</span></div>
                        <div className="flex"><span className="w-28 font-semibold text-foreground">{t('qview.quotationDate')}</span><span className="text-foreground">: {new Date(quotation.quotationDate).toLocaleDateString()}</span></div>
                        <div className="flex"><span className="w-28 font-semibold text-foreground">{t('qview.expiryDate')}</span><span className="text-foreground">: {quotation.expiryDate ? new Date(quotation.expiryDate).toLocaleDateString() : '-'}</span></div>
                        <div className="flex"><span className="w-28 font-semibold text-foreground">{t('rental.durationDays')}</span><span className="text-foreground">: {quotation.rentalDurationDays || 1}</span></div>
                        <div className="flex"><span className="w-28 font-semibold text-foreground">{t('qview.refNo')}</span><span className="text-foreground">: {quotation.reference || '-'}</span></div>
                        {quotation.salespersonName && (
                            <div className="flex"><span className="w-28 font-semibold text-foreground">{t('qview.salesperson')}</span><span className="text-foreground">: {quotation.salespersonName}</span></div>
                        )}
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-foreground">{t('rental.viewTitle')}</h2>
                        <p className="text-[11px] font-semibold text-foreground-muted mt-0.5">{t('qview.trn')} : {company?.pan || '104349488700003'}</p>
                    </div>
                </div>

                <div className="mb-4 bg-background border border-border rounded-lg p-2.5 text-xs">
                    <h3 className="font-bold text-foreground mb-1">{t('qview.billTo')}</h3>
                    <div className="text-foreground-muted">
                        <p className="font-semibold text-foreground">{quotation.customerParty?.companyName || quotation.customerName}</p>
                        <p>{formatAddress(quotation.customerParty?.billingAddress)}</p>
                        <p className="font-semibold text-foreground mt-0.5">{t('qview.trn')} : {quotation.customerParty?.vatTrnNumber || 'N/A'}</p>
                    </div>
                </div>

                <div className="rounded border border-border overflow-hidden mb-6">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead>
                            <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                <th className="py-1.5 px-2 text-center border-r border-border w-10">{t('qview.sn')}</th>
                                <th className="py-1.5 px-2 border-r border-border">{t('qview.itemDesc')}</th>
                                <th className="py-1.5 px-2 text-center border-r border-border w-24">{t('qview.qtyUnit')}</th>
                                <th className="py-1.5 px-2 text-right border-r border-border w-24">{t('rental.ratePerDay')}</th>
                                <th className="py-1.5 px-2 text-center border-r border-border w-20">{t('qview.vatPct')}</th>
                                <th className="py-1.5 px-2 text-right border-r border-border w-24">{t('qview.vatAmount')}</th>
                                <th className="py-1.5 px-2 text-right w-24">{t('qview.amount')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-foreground">
                            {quotation.items.map((item, index) => {
                                const qty = Number(item.quantity) || 0;
                                const rent = Number(item.rentalValue) || 0;
                                const duration = Number(quotation.rentalDurationDays) || 1;
                                const amount = qty * rent * duration;
                                const vat = item.taxValue || ((amount * (item.taxPercentage || 0)) / 100);

                                return (
                                    <tr key={item.id || index} className="hover:bg-hover">
                                        <td className="py-2 px-2 text-center border-r border-border">{index + 1}</td>
                                        <td className="py-2 px-2 border-r border-border">
                                            <p className="font-semibold text-foreground">{item.itemName}</p>
                                            <p className="text-[10px] text-foreground-muted">{item.itemCode}</p>
                                        </td>
                                        <td className="py-2 px-2 text-center border-r border-border">{qty}</td>
                                        <td className="py-2 px-2 text-right border-r border-border">{rent.toFixed(2)}</td>
                                        <td className="py-2 px-2 text-center border-r border-border">{item.taxPercentage || '0'}%</td>
                                        <td className="py-2 px-2 text-right border-r border-border">{vat.toFixed(2)}</td>
                                        <td className="py-2 px-2 text-right font-semibold">{amount.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4 text-xs">
                        <div>
                            <h4 className="font-bold text-foreground mb-0.5">{t('qview.amountInWords')}</h4>
                            <p className="text-foreground-muted">{numberToWords(quotation.netTotal)}</p>
                        </div>
                        {quotation.notes && (
                            <div>
                                <h4 className="font-bold text-foreground mb-0.5">{t('qview.notes')}</h4>
                                <p className="text-foreground-muted whitespace-pre-wrap">{quotation.notes}</p>
                            </div>
                        )}
                        {quotation.termsAndConditions && (
                            <div>
                                <h4 className="font-bold text-foreground mb-0.5">{t('qview.terms')}</h4>
                                <p className="text-foreground-muted whitespace-pre-wrap">{quotation.termsAndConditions}</p>
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-72 bg-background border border-border rounded-lg p-3 text-xs space-y-1.5 self-start">
                        <div className="flex justify-between text-foreground-muted">
                            <span>{t('rental.subTotalPerDay')}</span>
                            <span className="font-semibold text-foreground">AED {quotation.subTotalPerDay?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-foreground-muted">
                            <span>{t('rental.durationDays')}</span>
                            <span className="font-semibold text-foreground">{quotation.rentalDurationDays || 1} Days</span>
                        </div>
                        <div className="flex justify-between text-foreground-muted">
                            <span>{t('rental.totalRentalPrice')}</span>
                            <span className="font-semibold text-foreground">AED {quotation.totalRentalPrice?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-foreground-muted">
                            <span>{t('qview.totalDiscount')}</span>
                            <span className="font-semibold text-foreground">AED {quotation.totalDiscount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-foreground-muted">
                            <span>{t('qview.totalVat')}</span>
                            <span className="font-semibold text-foreground">AED {quotation.totalTax?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-foreground-muted">
                            <span>{t('qview.otherCharges')}</span>
                            <span className="font-semibold text-foreground">AED {quotation.otherCharges?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t border-border pt-1.5 mt-1 text-foreground">
                            <span>{t('qview.total')}</span>
                            <span className="text-primary">AED {quotation.netTotal?.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {quotation.attachments && quotation.attachments.length > 0 && (
                    <div className="mt-6 border-t border-border pt-3" ref={attachmentRef}>
                        <h3 className="font-bold text-xs text-foreground mb-1.5">{t('qview.attachments')}</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {quotation.attachments.map((file, index) => (
                                <a
                                    key={index}
                                    href={`${API_URL}/sales/rental-quotations/attachments/view?fileName=${encodeURIComponent(file)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 bg-background hover:bg-hover rounded text-primary hover:underline text-[11px] flex items-center gap-1 border border-border"
                                >
                                    <Paperclip size={12} /> {file.split('/').pop()}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RentalQuotationView;
