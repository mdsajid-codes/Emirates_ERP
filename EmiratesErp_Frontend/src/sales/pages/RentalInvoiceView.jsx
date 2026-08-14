import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Printer, FileText, Mail, Edit, Trash2, ChevronDown, Paperclip, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RentalInvoiceView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isRTL, t } = useLanguage();
    const [invoice, setInvoice] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const moreMenuRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [invoiceRes, companyRes] = await Promise.all([
                    axios.get(`${API_URL}/sales/rental-invoices/${id}`, { headers }),
                    axios.get(`${API_URL}/company-info`, { headers }).catch(() => ({ data: null }))
                ]);

                setInvoice(invoiceRes.data);
                setCompany(companyRes.data);
            } catch (err) {
                console.error("Error fetching data", err);
                setError("Failed to load rental invoice details.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
                setShowMoreMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const numberToWords = (amount) => {
        if (!amount) return 'Zero Dirhams';
        const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const convertChunk = (num) => {
            let str = '';
            if (num >= 100) {
                str += units[Math.floor(num / 100)] + ' Hundred ';
                num %= 100;
            }
            if (num >= 20) {
                str += tens[Math.floor(num / 10)] + ' ';
                num %= 10;
            }
            if (num >= 10) {
                str += teens[num - 10] + ' ';
                num = 0;
            }
            if (num > 0) {
                str += units[num] + ' ';
            }
            return str;
        };

        if (amount === 0) return 'Zero Dirhams';

        let num = Math.floor(amount);
        let words = convertChunk(num);
        return words.trim() + ' Dirhams';
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/sales/rental-invoices/pdf/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `RentalInvoice_${invoice.invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("PDF Download failed", err);
            alert("Failed to download PDF.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this rental invoice?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/sales/rental-invoices/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                navigate('/sales-dashboard/rental-invoices');
            } catch (err) {
                alert("Failed to delete rental invoice");
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (error) return <div className="p-8 text-center text-rose-500 font-semibold">{error}</div>;
    if (!invoice) return <div className="p-8 text-center text-foreground-muted">Rental Invoice not found</div>;

    return (
        <div className="space-y-2.5 bg-background min-h-screen text-foreground font-sans w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Action Bar matching ViewQuotation.jsx */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs print:hidden">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/sales-dashboard/rental-invoices')}
                        className="p-1 rounded-md hover:bg-hover text-foreground-muted hover:text-foreground transition-colors"
                        title={isRTL ? 'رجوع' : 'Back'}
                    >
                        <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
                    </button>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight flex items-center gap-1.5">
                            {typeof invoice.invoiceNumber === 'string' ? invoice.invoiceNumber : `RI-${invoice.id}`}
                            <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded uppercase ${invoice.status === 'PAID' ? 'bg-emerald-600 text-white' : invoice.status === 'PARTIAL' ? 'bg-amber-600 text-white' : 'bg-slate-500 text-white'}`}>
                                {typeof invoice.status === 'string' ? invoice.status : 'DRAFT'}
                            </span>
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none">
                            {isRTL ? 'الرئيسية > المبيعات > فواتير الإيجار > ' : 'Home > Sales > Rental Invoices > '}{invoice.invoiceNumber}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-1 self-end sm:self-auto text-[11px]">
                    <button
                        onClick={() => navigate(`/sales-dashboard/rental-invoices/edit/${id}`)}
                        className="h-7 px-2.5 bg-card border border-border hover:bg-hover text-foreground rounded font-medium flex items-center gap-1 transition-colors"
                    >
                        <Edit size={12} /> {isRTL ? 'تعديل' : 'Edit'}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="h-7 px-2.5 bg-card border border-border hover:bg-hover text-foreground rounded font-medium flex items-center gap-1 transition-colors"
                    >
                        <Printer size={12} /> {isRTL ? 'طباعة' : 'Print'}
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        className="h-7 px-2.5 bg-card border border-border hover:bg-hover text-foreground rounded font-medium flex items-center gap-1 transition-colors"
                    >
                        <FileText size={12} /> PDF
                    </button>

                    <div className="relative" ref={moreMenuRef}>
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className="h-7 px-2 bg-card border border-border hover:bg-hover text-foreground rounded font-medium flex items-center gap-1"
                        >
                            {isRTL ? 'المزيد' : 'More'} <ChevronDown size={11} />
                        </button>
                        {showMoreMenu && (
                            <div className={`absolute top-8 ${isRTL ? 'left-0' : 'right-0'} w-40 bg-card border border-border rounded-md shadow-lg z-50 py-1 text-xs`}>
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-start px-3 py-1.5 text-rose-500 hover:bg-hover flex items-center gap-1.5"
                                >
                                    <Trash2 size={13} /> {isRTL ? 'حذف' : 'Delete'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Printable Document Container */}
            <div className="bg-card border border-border rounded-lg p-4 shadow-2xs print:border-none print:shadow-none w-full space-y-4">
                {/* Header Information Grid */}
                <div className="flex justify-between items-start border-b border-border pb-3">
                    <div className="text-start">
                        <h2 className="text-lg font-bold text-primary tracking-tight">{company?.companyName || 'Your Company Name'}</h2>
                        <p className="text-[10px] text-foreground-muted max-w-xs">{company?.address || 'Dubai, UAE'}</p>
                        <p className="text-[10px] text-foreground-muted">TRN: {company?.pan || '104349488700003'}</p>
                    </div>
                    <div className="text-end">
                        <h2 className="text-base font-bold text-foreground uppercase">{isRTL ? 'فاتورة إيجار' : 'RENTAL INVOICE'}</h2>
                        <p className="text-xs font-mono font-bold text-primary">{typeof invoice.invoiceNumber === 'string' ? invoice.invoiceNumber : `RI-${invoice.id}`}</p>
                        <p className="text-[10px] text-foreground-muted mt-1">{isRTL ? 'التاريخ' : 'Date'}: {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : '-'}</p>
                        <p className="text-[10px] text-foreground-muted">{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-GB') : '-'}</p>
                    </div>
                </div>

                {/* Bill To Card */}
                <div className="grid grid-cols-2 gap-4 bg-primary/5 p-3 rounded-lg border border-border text-[11px]">
                    <div className="text-start">
                        <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block mb-0.5">{isRTL ? 'الفاتورة إلى:' : 'Billed To:'}</span>
                        <h3 className="font-bold text-foreground text-xs">{typeof invoice.customerName === 'string' ? invoice.customerName : 'N/A'}</h3>
                        <p className="text-foreground-muted">TRN: {invoice.customerTrn || 'N/A'}</p>
                    </div>
                    <div className="space-y-0.5 text-end">
                        <p><span className="text-foreground-muted">{isRTL ? 'رقم أمر الشراء:' : 'Order No.:'}</span> <span className="font-semibold">{typeof invoice.poNumber === 'string' ? invoice.poNumber : '-'}</span></p>
                        <p><span className="text-foreground-muted">{isRTL ? 'رقم أمر التسليم:' : 'DO No.:'}</span> <span className="font-semibold">{typeof invoice.doNumber === 'string' ? invoice.doNumber : '-'}</span></p>
                        {invoice.salespersonName && <p><span className="text-foreground-muted">{isRTL ? 'مندوب المبيعات:' : 'Salesperson:'}</span> <span className="font-semibold">{invoice.salespersonName}</span></p>}
                    </div>
                </div>

                {/* Items Table */}
                <div className="rounded border border-border overflow-x-auto">
                    <table className="w-full text-[10px] text-start border-collapse">
                        <thead>
                            <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                <th className="px-2 py-1.5 border-r border-border w-8 text-center">{isRTL ? 'م' : 'S.No.'}</th>
                                <th className="px-2 py-1.5 border-r border-border text-start">{isRTL ? 'الصنف' : 'Item & Description'}</th>
                                <th className="px-2 py-1.5 border-r border-border text-center w-16">{isRTL ? 'الكمية' : 'Qty'}</th>
                                <th className="px-2 py-1.5 border-r border-border text-center w-20">{isRTL ? 'المدة' : 'Duration'}</th>
                                <th className="px-2 py-1.5 border-r border-border text-end w-24">{isRTL ? 'قيمة الإيجار' : 'Rental Value'}</th>
                                <th className="px-2 py-1.5 border-r border-border text-center w-16">{isRTL ? 'نسبة الضريبة' : 'Tax %'}</th>
                                <th className="px-2 py-1.5 border-r border-border text-end w-24">{isRTL ? 'قيمة الضريبة' : 'Tax Amt'}</th>
                                <th className="px-2 py-1.5 text-end w-28">{isRTL ? 'المبلغ (درهم)' : 'Amount (AED)'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {(invoice.items || []).map((item, idx) => (
                                <tr key={idx} className="hover:bg-hover transition-colors text-foreground">
                                    <td className="px-2 py-1 border-r border-border text-center text-foreground-muted">{idx + 1}</td>
                                    <td className="px-2 py-1 border-r border-border text-start">
                                        <div className="font-semibold">{item.itemName}</div>
                                        {item.itemCode && <div className="text-[9px] text-foreground-muted">{item.itemCode}</div>}
                                        {item.description && <div className="text-[9px] text-foreground-muted italic">{item.description}</div>}
                                    </td>
                                    <td className="px-2 py-1 border-r border-border text-center font-mono">{item.quantity}</td>
                                    <td className="px-2 py-1 border-r border-border text-center font-mono">{item.duration}</td>
                                    <td className="px-2 py-1 border-r border-border text-end font-mono">AED {Number(item.rentalValue || 0).toFixed(2)}</td>
                                    <td className="px-2 py-1 border-r border-border text-center font-mono">{item.taxPercentage || 0}%</td>
                                    <td className="px-2 py-1 border-r border-border text-end font-mono">AED {Number(item.taxValue || 0).toFixed(2)}</td>
                                    <td className="px-2 py-1 text-end font-mono font-semibold">AED {Number(item.amount || 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Section */}
                <div className="grid grid-cols-2 gap-4 text-[11px]">
                    <div className="space-y-2 text-start">
                        <div>
                            <span className="font-bold text-foreground block mb-0.5">{isRTL ? 'المبلغ بالكلمات:' : 'Amount in Words:'}</span>
                            <p className="text-foreground-muted text-[10px] font-medium">{numberToWords(invoice.netTotal || 0)}</p>
                        </div>
                        {invoice.termsAndConditions && (
                            <div className="bg-background border border-border p-2 rounded">
                                <span className="font-bold text-foreground block mb-0.5">{isRTL ? 'الشروط والأحكام' : 'Terms & Conditions'}</span>
                                <p className="text-foreground-muted whitespace-pre-wrap text-[10px]">{invoice.termsAndConditions}</p>
                            </div>
                        )}
                        {invoice.notes && (
                            <div className="bg-background border border-border p-2 rounded">
                                <span className="font-bold text-foreground block mb-0.5">{isRTL ? 'الملاحظات' : 'Notes'}</span>
                                <p className="text-foreground-muted whitespace-pre-wrap text-[10px]">{invoice.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-card border border-border rounded p-2.5 space-y-1 self-start">
                        <div className="flex justify-between text-foreground-muted"><span>{isRTL ? 'المجموع الفرعي' : 'Sub Total'}</span><span className="font-mono text-foreground font-semibold">AED {Number(invoice.subTotal || 0).toFixed(2)}</span></div>
                        {invoice.totalDiscount > 0 && <div className="flex justify-between text-foreground-muted"><span>{isRTL ? 'الخصم' : 'Discount'}</span><span className="font-mono text-foreground">- AED {Number(invoice.totalDiscount || 0).toFixed(2)}</span></div>}
                        <div className="flex justify-between text-foreground-muted"><span>{isRTL ? 'إجمالي الضريبة' : 'Total Tax'}</span><span className="font-mono text-foreground">AED {Number(invoice.totalTax || 0).toFixed(2)}</span></div>
                        {invoice.otherCharges > 0 && <div className="flex justify-between text-foreground-muted"><span>{isRTL ? 'رسوم أخرى' : 'Other Charges'}</span><span className="font-mono text-foreground">AED {Number(invoice.otherCharges || 0).toFixed(2)}</span></div>}
                        <div className="flex justify-between font-bold border-t border-border pt-1 text-xs text-foreground"><span>{isRTL ? 'صافي الإجمالي' : 'Net Total'}</span><span className="text-primary font-mono">AED {Number(invoice.netTotal || 0).toFixed(2)}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RentalInvoiceView;
