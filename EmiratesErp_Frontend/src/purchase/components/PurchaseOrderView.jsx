import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // standard import
import axiosInstance from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Printer, ArrowLeft, ArrowRight, Edit, ChevronDown, Check, Download,
    Send, Box, MapPin, Calendar, Hash, ShieldCheck,
    Info, BadgeCheck, FileDigit, Truck, Clock, Paperclip, Plus
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { loadThemeFromStorage, applyTheme } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const numberToWords = (num) => {
    if (!num) return 'Zero';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim();
};

const PurchaseOrderView = () => {
    const { isRTL } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();
    const [po, setPo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showMore, setShowMore] = useState(false);
    const [isLetterHead, setIsLetterHead] = useState(false);
    const [tenantInfo, setTenantInfo] = useState({ name: '', address: '', logo: '' });
    const [supplierInfo, setSupplierInfo] = useState(null);

    useEffect(() => {
        const theme = loadThemeFromStorage();
        if (theme) applyTheme(theme);
    }, []);

    useEffect(() => {
        if (!id) return;
        const load = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const res = await axiosInstance.get(`${API_URL}/purchases/orders/${id}`, { headers });
                const data = res.data;
                setPo(data);

                const tenantId = localStorage.getItem('tenantId');
                if (tenantId) {
                    try {
                        const tRes = await axiosInstance.get(`${API_URL}/tenants/${tenantId}`, { headers });
                        setTenantInfo(tRes.data);
                    } catch (terr) { console.warn('Tenant load fail', terr); }
                }

                if (data.supplierId) {
                    try {
                        const sRes = await axiosInstance.get(`${API_URL}/parties/${data.supplierId}`, { headers });
                        setSupplierInfo(sRes.data);
                    } catch (serr) { console.warn('Supplier load fail', serr); }
                }
            } catch (err) {
                console.error('Failed to load PO', err);
                setError(isRTL ? 'تعذر استخراج أمر الشراء' : 'Failed to load purchase order manifest.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, isRTL]);

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-[#F7F9FD] gap-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-[#00A9A8] rounded-full animate-spin" />
                <p className="text-sm font-semibold text-[#0A2551]">{isRTL ? 'جاري التحميل...' : 'Loading Purchase Order...'}</p>
            </div>
        );
    }

    if (!po) return <div className="p-8 text-center text-rose-500 font-bold">{error || 'Order Manifest Not Found'}</div>;

    const totalQty = (po.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const subTotal = (Number(po.subTotal) || 0) + (Number(po.totalDiscount) || 0);
    const totalSavings = Number(po.totalDiscount) || 0;
    const vatAmount = Number(po.totalTax) || 0;
    const shipping = Number(po.otherCharges) || 0;
    const netPayable = Number(po.totalAmount) || 0;

    // Check availability of real data for bottom widgets
    const hasAttachments = Array.isArray(po.attachments) && po.attachments.length > 0;
    const hasNotes = Boolean(po.notes || po.termsAndConditions);
    const hasActivityTimeline = Array.isArray(po.history) && po.history.length > 0;
    const hasApprovalInfo = Boolean(po.approvedBy || po.authorizedBy || po.approvalDate);
    const hasIntelligence = Boolean(po.validatedBy || po.validatedAt || po.intelligenceNotes);

    return (
        <div className="bg-[#F7F9FD] min-h-screen text-[#0A2551] font-sans pb-10 -mt-3 lg:-mt-4 -mx-3 lg:-mx-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* FULL SCREEN DASHBOARD CONTENT */}
            <div className="w-full px-4 pt-3 pb-4 space-y-3">
                {/* TOP SECTION: PO Banner & Order Summary Card */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
                    {/* Left Column (8 cols): PO Header + Specs Meta */}
                    <div className="lg:col-span-8 space-y-3 flex flex-col justify-between">
                        {/* Main PO Info Card */}
                        <div className="bg-white border border-[#DFE7F4] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                            <div className="flex items-center gap-4">
                                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-[#0A2551]">
                                    {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                                </button>
                                <div className="w-14 h-14 bg-[#00A9A8] rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
                                    <Box size={30} strokeWidth={2.2} />
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-[#617191] uppercase tracking-wider block">{isRTL ? 'أمر الشراء' : 'PURCHASE ORDER'}</span>
                                    <h1 className="text-2xl font-black text-[#0A2551] tracking-tight leading-none mt-0.5">
                                        {po.poNumber ? (po.poNumber.startsWith('PO-') ? po.poNumber : `PO-${po.poNumber}`) : ''}
                                    </h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-3 py-0.5 bg-[#DCFAEE] text-[#138764] rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                                            <BadgeCheck size={12} /> {po.status || (isRTL ? 'معتمد' : 'AUTHENTICATED')}
                                        </span>
                                        {po.version && (
                                            <span className="px-2.5 py-0.5 bg-[#F2F6FC] text-[#617191] rounded-md text-[11px] font-semibold flex items-center gap-1">
                                                <Info size={11} /> {isRTL ? `الإصدار ${po.version}` : `Version ${po.version}`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <button onClick={() => navigate(`/purchase-dashboard/purchase-orders/edit/${po.id}`)} className="flex items-center gap-2 h-[38px] px-4 bg-white border border-[#DFE7F4] rounded-xl text-xs font-bold hover:border-[#00A9A8] hover:text-[#00A9A8] transition-all cursor-pointer">
                                    <Edit size={14} /> {isRTL ? 'تعديل البيان' : 'Edit Manifest'}
                                </button>
                                <button className="flex items-center gap-2 h-[38px] px-4 bg-white border border-[#DFE7F4] rounded-xl text-xs font-bold hover:border-[#00A9A8] hover:text-[#00A9A8] transition-all cursor-pointer">
                                    <Download size={14} /> {isRTL ? 'تصدير PDF' : 'PDF Export'}
                                </button>
                                <button onClick={() => { setIsLetterHead(false); setTimeout(handlePrint, 100); }} className="flex items-center gap-2 h-[38px] px-5 bg-[#00A9A8] text-white rounded-xl text-xs font-bold hover:bg-[#008f8e] transition-all cursor-pointer shadow-xs">
                                    <Printer size={14} /> {isRTL ? 'طباعة سريعة' : 'Quick Print'}
                                </button>
                                <button onClick={() => { setIsLetterHead(true); setTimeout(handlePrint, 100); }} className="flex items-center gap-2 h-[38px] px-4 bg-white border border-[#DFE7F4] rounded-xl text-xs font-bold hover:border-[#00A9A8] transition-all cursor-pointer">
                                    <ShieldCheck size={14} /> {isRTL ? 'طباعة بالورق الرسمي' : 'Letterhead Print'}
                                </button>
                            </div>
                        </div>

                        {/* Organization Index & Metrics */}
                        <div className="bg-white border border-[#DFE7F4] rounded-2xl p-4 shadow-xs space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs divide-x divide-[#DFE7F4] rtl:divide-x-reverse">
                                {tenantInfo.trnNumber && (
                                    <div className="px-2">
                                        <span className="text-[10.5px] font-semibold text-[#617191] block">{isRTL ? 'الرقم الضريبي للمؤسسة' : 'Enterprise TRN'}</span>
                                        <strong className="text-xs font-bold text-[#0A2551] truncate block mt-0.5">{tenantInfo.trnNumber}</strong>
                                    </div>
                                )}
                                {po.reference && (
                                    <div className="px-2">
                                        <span className="text-[10.5px] font-semibold text-[#617191] block">{isRTL ? 'بروتوكول المرجع' : 'Reference Protocol'}</span>
                                        <strong className="text-xs font-bold text-[#0A2551] truncate block mt-0.5">{po.reference}</strong>
                                    </div>
                                )}
                                {po.branchName && (
                                    <div className="px-2">
                                        <span className="text-[10.5px] font-semibold text-[#617191] block">{isRTL ? 'فرع المصدر' : 'Origin Node'}</span>
                                        <strong className="text-xs font-bold text-[#0A2551] truncate block mt-0.5">{po.branchName}</strong>
                                    </div>
                                )}
                                <div className="px-2">
                                    <span className="text-[10.5px] font-semibold text-[#617191] block">{isRTL ? 'رقم الطلب الرئيسي' : 'Master Order ID'}</span>
                                    <strong className="text-xs font-bold text-[#0A2551] truncate block mt-0.5">
                                        {po.poNumber ? (po.poNumber.startsWith('PO-') ? po.poNumber : `PO-${po.poNumber}`) : ''}
                                    </strong>
                                </div>
                                <div className="px-2">
                                    <span className="text-[10.5px] font-semibold text-[#617191] block">{isRTL ? 'المورد / شريك التوريد' : 'Supply Partner'}</span>
                                    <strong className="text-xs font-bold text-[#0A2551] truncate block mt-0.5">{supplierInfo ? (supplierInfo.companyName || supplierInfo.name) : po.supplierName}</strong>
                                </div>
                            </div>

                            {(po.paymentTerms || po.currency || po.incoterms || po.deliverToAddress) && (
                                <>
                                    <div className="h-px bg-[#DFE7F4]" />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs divide-x divide-[#DFE7F4] rtl:divide-x-reverse">
                                        {po.paymentTerms && (
                                            <div className="px-2">
                                                <span className="text-[10.5px] font-semibold text-[#617191] block">{isRTL ? 'شروط الدفع' : 'Payment Terms'}</span>
                                                <strong className="text-xs font-bold text-[#0A2551] block mt-0.5">{po.paymentTerms}</strong>
                                            </div>
                                        )}
                                        <div className="px-2">
                                            <span className="text-[10.5px] font-semibold text-[#617191] block">{isRTL ? 'العملة' : 'Currency'}</span>
                                            <strong className="text-xs font-bold text-[#0A2551] block mt-0.5">{po.currency || 'AED'}</strong>
                                        </div>
                                        {po.incoterms && (
                                            <div className="px-2">
                                                <span className="text-[10.5px] font-semibold text-[#617191] block">{isRTL ? 'الشروط التجارية' : 'Incoterms'}</span>
                                                <strong className="text-xs font-bold text-[#0A2551] block mt-0.5">{po.incoterms}</strong>
                                            </div>
                                        )}
                                        {po.deliverToAddress && (
                                            <div className="px-2">
                                                <span className="text-[10.5px] font-semibold text-[#617191] block">{isRTL ? 'موقع التسليم' : 'Incoterms Location'}</span>
                                                <strong className="text-xs font-bold text-[#0A2551] block mt-0.5">{po.deliverToAddress}</strong>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column (4 cols): Real Order Summary Card */}
                    <div className="lg:col-span-4 bg-[#006A78] text-white rounded-2xl p-5 flex flex-col justify-between shadow-md">
                        <div className="flex justify-between items-center border-b border-white/20 pb-3">
                            <h3 className="text-base font-bold tracking-tight">{isRTL ? 'ملخص الطلب' : 'Order Summary'}</h3>
                            <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold border border-white/20">{po.currency || 'AED'}</span>
                        </div>

                        <div className="space-y-3 py-3 text-xs">
                            <div className="flex justify-between items-center opacity-90">
                                <span>{isRTL ? 'إجمالي البيان' : 'Gross Manifest'}</span>
                                <span className="font-bold">{subTotal.toFixed(2)}</span>
                            </div>
                            {totalSavings > 0 && (
                                <div className="flex justify-between items-center opacity-90">
                                    <span>{isRTL ? 'الوفورات المجمعة' : 'Consolidated Savings'}</span>
                                    <span className="font-bold">- {totalSavings.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center opacity-90">
                                <span>{isRTL ? 'الرسوم المالية (الضريبة)' : 'Fiscal Levies (VAT)'}</span>
                                <span className="font-bold">+ {vatAmount.toFixed(2)}</span>
                            </div>
                            {shipping > 0 && (
                                <div className="flex justify-between items-center opacity-90">
                                    <span>{isRTL ? 'رسوم الشحن اللوجستي' : 'Logistics Surcharge'}</span>
                                    <span className="font-bold">+ {shipping.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-3 border-t border-white/20 flex justify-between items-end">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-white/70 block tracking-widest">{isRTL ? 'الصافي المستحق' : 'NET PAYABLE'}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black tracking-tight leading-none block">{netPayable.toFixed(2)} <span className="text-xs font-normal">AED</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MIDDLE SECTION: Delivery Details & Item Specifications */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
                    {/* Delivery Details (4 cols) - Rendered only if deliverToAddress or dates exist */}
                    {po.deliverToAddress ? (
                        <div className="lg:col-span-4 bg-white border border-[#DFE7F4] rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xs">
                            <div className="flex items-center gap-2 border-b border-[#DFE7F4] pb-3">
                                <Truck size={18} className="text-[#00A9A8]" />
                                <h3 className="text-sm font-bold text-[#0A2551]">{isRTL ? 'تفاصيل التسليم' : 'Delivery Details'}</h3>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <span className="text-[10.5px] font-semibold text-[#617191] block">{isRTL ? 'التسليم إلى' : 'Deliver To'}</span>
                                    <p className="font-bold text-[#0A2551] leading-relaxed mt-0.5">
                                        {po.deliverToAddress}
                                    </p>
                                </div>

                                {(po.deliveryDate || po.shipVia) && (
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#DFE7F4]">
                                        {po.deliveryDate && (
                                            <div>
                                                <span className="text-[10.5px] font-semibold text-[#617191] block">{isRTL ? 'تاريخ التسليم المطلوب' : 'Requested Delivery Date'}</span>
                                                <p className="font-bold text-[#0A2551] flex items-center gap-1 mt-0.5">
                                                    <Calendar size={13} className="text-[#00A9A8]" /> {new Date(po.deliveryDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                        {po.shipVia && (
                                            <div>
                                                <span className="text-[10.5px] font-semibold text-[#617191] block">{isRTL ? 'طريقة التسليم' : 'Deliver Via'}</span>
                                                <p className="font-bold text-[#0A2551] flex items-center gap-1 mt-0.5">
                                                    <Truck size={13} className="text-[#00A9A8]" /> {po.shipVia}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {/* Item Specifications (Spans 12 cols if no delivery details, else 8 cols) */}
                    <div className={`${po.deliverToAddress ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white border border-[#DFE7F4] rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-xs`}>
                        <div className="flex items-center gap-2 border-b border-[#DFE7F4] pb-3">
                            <Box size={18} className="text-[#00A9A8]" />
                            <h3 className="text-sm font-bold text-[#0A2551]">{isRTL ? 'مواصفات الأصناف' : 'Item Specifications'}</h3>
                        </div>

                        {/* Items Table */}
                        <div className="border border-[#DFE7F4] rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse text-xs" dir={isRTL ? 'rtl' : 'ltr'}>
                                <thead>
                                    <tr className="bg-[#F2F6FC] text-[#617191] font-bold text-[11px] h-9 border-b border-[#DFE7F4]">
                                        <th className="py-1.5 px-3 text-center w-8">#</th>
                                        <th className="py-1.5 px-3">{isRTL ? 'وصف الصنف' : 'Item Specification'}</th>
                                        <th className="py-1.5 px-3 text-center">{isRTL ? 'الكمية' : 'Qty'}</th>
                                        <th className="py-1.5 px-3 text-center">{isRTL ? 'الوحدة' : 'Unit'}</th>
                                        <th className="py-1.5 px-3 text-center">{isRTL ? 'السعر (AED)' : 'Unit Rate (AED)'}</th>
                                        <th className="py-1.5 px-3 text-center">{isRTL ? 'الضريبة' : 'Tax'}</th>
                                        <th className="py-1.5 px-3 text-right">{isRTL ? 'المبلغ (AED)' : 'Net Value (AED)'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#DFE7F4] text-[#0A2551] text-xs">
                                    {(po.items || []).map((it, i) => {
                                        const qty = Number(it.quantity) || 0;
                                        const rate = Number(it.rate) || 0;
                                        const disc = Number(it.lineDiscount) || 0;
                                        const taxPct = Number(it.taxPercent) || 0;
                                        const netAmount = Math.max(0, (qty * rate) - disc);
                                        const taxAmt = netAmount * (taxPct / 100);
                                        const total = netAmount + taxAmt;

                                        return (
                                            <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-2.5 px-3 text-center text-[#617191]">{it.lineNumber || i + 1}</td>
                                                <td className="py-2.5 px-3">
                                                    <div className="font-bold text-[#0A2551] text-[12px]">{it.itemName || it.description || `Item #${i+1}`}</div>
                                                    {it.description && <div className="text-[10px] text-[#617191]">{it.description}</div>}
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-bold">{qty}</td>
                                                <td className="py-2.5 px-3 text-center font-bold">{it.unitName || 'Units'}</td>
                                                <td className="py-2.5 px-3 text-center font-bold">{rate.toFixed(2)}</td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className="inline-block px-2 py-0.5 bg-[#DCFAEE] text-[#138764] rounded font-bold text-[10.5px]">{taxPct}%</span>
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-bold">{total.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Items Footer Summary */}
                        <div className="flex justify-end gap-6 pt-1 text-xs">
                            <div className="text-right">
                                <span className="text-[10px] font-semibold text-[#617191] block">{isRTL ? 'إجمالي الأصناف' : 'Total Items'}</span>
                                <strong className="text-sm font-black text-[#0A2551]">{totalQty || (po.items || []).length}</strong>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-semibold text-[#617191] block">{isRTL ? 'إجمالي القيمة الصافية (AED)' : 'Total Net Value (AED)'}</span>
                                <strong className="text-sm font-black text-[#0A2551]">{netPayable.toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: Dynamically render bottom widgets ONLY IF REAL DATA EXISTS */}
                {(hasIntelligence || hasApprovalInfo || hasActivityTimeline || hasAttachments || hasNotes) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
                        {/* Procurement Intelligence */}
                        {hasIntelligence && (
                            <div className="bg-white border border-[#DFE7F4] rounded-2xl p-4 space-y-3 shadow-xs">
                                <div className="flex items-center gap-2 border-b border-[#DFE7F4] pb-2">
                                    <Info size={16} className="text-[#00A9A8]" />
                                    <h4 className="text-xs font-bold text-[#0A2551]">{isRTL ? 'معلومات التوريد' : 'Procurement Intelligence'}</h4>
                                </div>
                                <p className="text-[11px] text-[#617191] leading-relaxed">
                                    {po.intelligenceNotes || `Total manifest value of ${netPayable.toFixed(2)} AED is validated.`}
                                </p>
                                {(po.validatedAt || po.validatedBy) && (
                                    <div className="pt-2 border-t border-[#DFE7F4] text-[10px] text-[#617191] space-y-0.5">
                                        {po.validatedAt && <div>Validated At: {new Date(po.validatedAt).toLocaleString()}</div>}
                                        {po.validatedBy && <div>Validated By: {po.validatedBy}</div>}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Authorized Protocol */}
                        {hasApprovalInfo && (
                            <div className="bg-white border border-[#DFE7F4] rounded-2xl p-4 space-y-3 relative shadow-xs">
                                <div className="flex items-center gap-2 border-b border-[#DFE7F4] pb-2">
                                    <ShieldCheck size={16} className="text-[#00A9A8]" />
                                    <h4 className="text-xs font-bold text-[#0A2551]">{isRTL ? 'البروتوكول المعتمد' : 'Authorized Protocol'}</h4>
                                </div>
                                <p className="text-[11px] text-[#617191] leading-relaxed">
                                    This purchase order has been authenticated in accordance with enterprise protocols.
                                </p>
                                <div className="flex justify-between items-end pt-2 text-[10px]">
                                    <div>
                                        <strong className="text-xs font-bold text-[#0A2551] block">{po.approvedBy || po.authorizedBy || 'Authorized Officer'}</strong>
                                        <span className="text-[#617191]">Procurement Officer</span>
                                    </div>
                                    {po.approvalDate && <span className="text-[#617191]">{new Date(po.approvalDate).toLocaleDateString()}</span>}
                                </div>
                                <div className="absolute bottom-3 right-3 w-14 h-14 rounded-full border-2 border-blue-600 flex items-center justify-center rotate-[-12deg] opacity-80 pointer-events-none">
                                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter">AUTHORIZED</span>
                                </div>
                            </div>
                        )}

                        {/* Activity Timeline */}
                        {hasActivityTimeline && (
                            <div className="bg-white border border-[#DFE7F4] rounded-2xl p-4 space-y-3 shadow-xs">
                                <div className="flex items-center gap-2 border-b border-[#DFE7F4] pb-2">
                                    <Clock size={16} className="text-[#00A9A8]" />
                                    <h4 className="text-xs font-bold text-[#0A2551]">{isRTL ? 'جدول النشاط' : 'Activity Timeline'}</h4>
                                </div>
                                <div className="space-y-2 text-[10.5px]">
                                    {(po.history || []).map((h, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                                            <div>
                                                <strong className="block text-[#0A2551] font-bold">{h.action || h.status}</strong>
                                                <span className="text-[9.5px] text-[#617191]">{h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Attachments */}
                        {hasAttachments && (
                            <div className="bg-white border border-[#DFE7F4] rounded-2xl p-4 space-y-3 shadow-xs flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-1.5 border-b border-[#DFE7F4] pb-2">
                                        <Paperclip size={14} className="text-[#00A9A8]" />
                                        <h4 className="text-xs font-bold text-[#0A2551]">{isRTL ? 'المرفقات' : `Attachments (${po.attachments.length})`}</h4>
                                    </div>
                                    <div className="space-y-1.5 mt-2">
                                        {po.attachments.map((att, idx) => (
                                            <a key={idx} href={`${API_URL}/uploads/${att.fileName || att}`} target="_blank" rel="noreferrer" className="p-2 border border-[#DFE7F4] rounded-xl flex items-center justify-between text-[10px] hover:border-[#00A9A8] transition-colors">
                                                <span className="font-bold truncate max-w-[120px]">{att.fileName || att}</span>
                                                <Download size={12} className="text-[#00A9A8] shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {hasNotes && (
                            <div className="bg-white border border-[#DFE7F4] rounded-2xl p-4 space-y-3 shadow-xs flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-1.5 border-b border-[#DFE7F4] pb-2">
                                        <FileDigit size={14} className="text-[#00A9A8]" />
                                        <h4 className="text-xs font-bold text-[#0A2551]">{isRTL ? 'الملاحظات' : 'Notes & Terms'}</h4>
                                    </div>
                                    {po.notes && (
                                        <p className="text-[11px] text-[#0A2551] mt-2 font-medium">
                                            {po.notes}
                                        </p>
                                    )}
                                    {po.termsAndConditions && (
                                        <p className="text-[10px] text-[#617191] mt-1 italic">
                                            {po.termsAndConditions}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseOrderView;
