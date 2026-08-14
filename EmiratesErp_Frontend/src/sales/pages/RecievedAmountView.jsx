import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Printer, Edit, Trash2, Loader2, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RecievedAmountView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isRTL, t } = useLanguage();
    const [data, setData] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [dataRes, companyRes] = await Promise.all([
                    axios.get(`${API_URL}/recieved/${id}`, { headers }),
                    axios.get(`${API_URL}/company-info`, { headers }).catch(() => ({ data: null }))
                ]);

                setData(dataRes.data);
                setCompany(companyRes.data);
            } catch (err) {
                console.error("Error loading data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleDelete = async () => {
        if (window.confirm(isRTL ? 'هل أنت تأكد من حذف هذا السجل؟' : 'Are you sure you want to delete this record?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/recieved/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                navigate('/sales-dashboard/recieved-amounts');
            } catch (err) {
                alert("Failed to delete record");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-background">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-8 text-center text-foreground-muted bg-background">
                {isRTL ? 'السجل غير موجود' : 'Record not found'}
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground font-sans space-y-2 w-full print:bg-white print:p-0" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Action Bar - Hidden on Print */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs print:hidden">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-6 h-6 rounded border border-border flex items-center justify-center text-foreground hover:bg-hover transition-colors"
                    >
                        <ArrowLeft size={13} />
                    </button>
                    <div>
                        <h1 className="text-xs font-bold text-foreground leading-tight">
                            {isRTL ? 'إيصال مبلغ مستلم' : 'Amount Received Voucher'} #{data.receivedNumber || data.id}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none mt-0.5">
                            {isRTL ? 'الرئيسية > المبيعات > إيصالات الاستلام > عرض' : 'Home > Sales > Amount Received > View'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                        onClick={handlePrint}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold border border-border bg-card hover:bg-hover text-foreground flex items-center gap-1 transition-colors"
                    >
                        <Printer size={12} /> {t('quotation.print')}
                    </button>
                    <button
                        onClick={() => navigate(`/sales-dashboard/recieved-amounts/edit/${id}`)}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold border border-border bg-card hover:bg-hover text-blue-500 flex items-center gap-1 transition-colors"
                    >
                        <Edit size={12} /> {t('quotation.edit')}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold border border-border bg-card hover:bg-hover text-rose-500 flex items-center gap-1 transition-colors"
                    >
                        <Trash2 size={12} /> {t('quotation.delete')}
                    </button>
                </div>
            </div>

            {/* Document Printable Card */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-2xs print:border-none print:shadow-none print:p-0">
                {/* Header Info */}
                <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
                    <div>
                        <h2 className="text-base font-bold text-foreground">{company?.companyName || 'Emirates ERP Trading'}</h2>
                        <p className="text-[11px] text-foreground-muted">{company?.address || 'Dubai, United Arab Emirates'}</p>
                        <p className="text-[11px] text-foreground-muted">TRN: {company?.trn || '100023456700003'}</p>
                    </div>
                    <div className="text-end">
                        <div className="inline-block bg-primary/10 text-primary font-bold text-xs px-2.5 py-1 rounded border border-primary/20 mb-1">
                            {isRTL ? 'إيصال استلام نقد' : 'OFFICIAL RECEIPT VOUCHER'}
                        </div>
                        <p className="text-[11px] text-foreground-muted font-mono">{isRTL ? 'رقم:' : 'Voucher:'} #{data.receivedNumber || data.id}</p>
                        <p className="text-[11px] text-foreground-muted font-mono">{isRTL ? 'التاريخ:' : 'Date:'} {data.receivingDate}</p>
                    </div>
                </div>

                {/* Received From Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background p-3 rounded-lg border border-border mb-4 text-[11px]">
                    <div>
                        <h3 className="font-bold text-foreground border-b border-border pb-1 mb-1.5">
                            {isRTL ? 'استلمنا من' : 'RECEIVED FROM'}
                        </h3>
                        <p className="font-bold text-xs text-foreground">{data.customerName}</p>
                        <p className="text-foreground-muted">{isRTL ? 'معرف العميل:' : 'Customer ID:'} #{data.customerId}</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-foreground border-b border-border pb-1 mb-1.5">
                            {isRTL ? 'تفاصيل الدفع' : 'PAYMENT METHOD'}
                        </h3>
                        <div className="space-y-0.5 text-foreground-muted">
                            <p><span className="font-semibold text-foreground">{isRTL ? 'طريقة الإيداع:' : 'Mode:'}</span> {data.depositMode || 'Bank Transfer'}</p>
                            <p><span className="font-semibold text-foreground">{isRTL ? 'تاريخ الإيداع:' : 'Deposit Date:'}</span> {data.depositDate}</p>
                            {data.chequeNumber && <p><span className="font-semibold text-foreground">{isRTL ? 'رقم الشيك:' : 'Cheque No:'}</span> {data.chequeNumber}</p>}
                            {data.reference && <p><span className="font-semibold text-foreground">{t('qform.reference')}:</span> {data.reference}</p>}
                        </div>
                    </div>
                </div>

                {/* Breakdown Table */}
                <div className="rounded border border-border overflow-hidden mb-6">
                    <table className="w-full text-[11px] border-collapse">
                        <thead>
                            <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                <th className="px-3 py-1.5 text-start border-r border-border">{isRTL ? 'البيان' : 'Description'}</th>
                                <th className="px-3 py-1.5 text-end w-36">{isRTL ? 'المبلغ' : 'Amount'} (AED)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <tr>
                                <td className="px-3 py-2 text-foreground font-medium border-r border-border">{isRTL ? 'إجمالي المبلغ المستلم' : 'Total Amount Received'}</td>
                                <td className="px-3 py-2 text-end font-mono font-bold text-foreground">AED {Number(data.amount || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2 text-foreground-muted border-r border-border">TDS Amount</td>
                                <td className="px-3 py-2 text-end font-mono text-foreground-muted">AED {Number(data.tds || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2 text-foreground-muted border-r border-border">{isRTL ? 'المبلغ المقدم' : 'Advance Amount'}</td>
                                <td className="px-3 py-2 text-end font-mono text-foreground-muted">AED {Number(data.advanceAmount || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2 text-foreground-muted border-r border-border">{isRTL ? 'الغرامات والجزاءات' : 'Fine & Penalty'}</td>
                                <td className="px-3 py-2 text-end font-mono text-foreground-muted">AED {Number(data.fineAndPenalty || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2 text-foreground-muted border-r border-border">{isRTL ? 'الخصومات والتسويات' : 'Rebate & Discount'}</td>
                                <td className="px-3 py-2 text-end font-mono text-foreground-muted">AED {Number(data.rebateAndDiscount || 0).toFixed(2)}</td>
                            </tr>
                            <tr className="bg-primary/5 font-bold">
                                <td className="px-3 py-2 text-foreground border-r border-border">{isRTL ? 'الصافي المقيد' : 'Net Credited Amount'}</td>
                                <td className="px-3 py-2 text-end font-mono text-primary text-xs">AED {Number(data.amount || 0).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-12 mt-8 border-t border-border text-[10px] text-foreground-muted">
                    <div>
                        <p className="mb-8">{isRTL ? 'المستلم بواسطة:' : 'Received By:'}</p>
                        <div className="border-b border-foreground-muted w-44"></div>
                    </div>
                    <div className="text-end">
                        <p className="mb-8">{isRTL ? 'التوقيع المعتمد:' : 'Authorized Signature:'}</p>
                        <div className="border-b border-foreground-muted w-44 ms-auto"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecievedAmountView;
