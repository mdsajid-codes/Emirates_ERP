import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { X, Edit, FileText, Loader2, ArrowLeft, Printer, Mail, Paperclip, ChevronDown, List, Copy, Trash2, Package } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const DeliveryOrderView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isRTL, t } = useLanguage();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [company, setCompany] = useState(null);
    const [showMoreDropdown, setShowMoreDropdown] = useState(false);

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await axios.get(`${API_URL}/company-info`, authHeaders);
                setCompany(res.data);
            } catch (e) {
                console.error("Failed to fetch company info", e);
            }
        };
        fetchCompany();

        const fetchOrder = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/sales/delivery-orders/${id}`, authHeaders);
                let orderData = response.data;
                let partyData = null;
                if (orderData.customerId) {
                    try {
                        const partyRes = await axios.get(`${API_URL}/parties/${orderData.customerId}`, authHeaders);
                        partyData = partyRes.data;
                    } catch (pErr) {
                        console.error("Failed to fetch party details for delivery order", pErr);
                    }
                }
                setOrder({ ...orderData, customerParty: partyData });
            } catch (err) {
                setError('Failed to fetch delivery order details.');
                console.error("Error fetching delivery order", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchOrder();
    }, [id, authHeaders]);

    const handleWhatsApp = () => {
        const phoneNumber = order?.customerParty?.phone || '';
        const text = `Hi, here is Delivery Order ${order?.deliveryOrderNumber}.`;
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleEmail = () => {
        const email = order?.customerParty?.email || '';
        const subject = `Delivery Order ${order?.deliveryOrderNumber}`;
        const body = `Dear Customer,\n\nPlease find attached Delivery Order ${order?.deliveryOrderNumber}.\n\nRegards,\n${company?.companyName || ''}`;
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this delivery order?')) {
            try {
                await axios.delete(`${API_URL}/sales/delivery-orders/${id}`, authHeaders);
                navigate('/sales-dashboard/delivery-orders');
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete delivery order.'}`);
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (error) return <div className="p-6 text-rose-500 font-semibold">{error}</div>;
    if (!order) return <div className="p-6 text-foreground-muted">Delivery Order not found.</div>;

    const companyNameStr = typeof company?.companyName === 'string' ? company.companyName : (typeof company?.name === 'string' ? company.name : 'EMIRATES ERP');
    const companyAddressStr = typeof company?.address === 'string' ? company.address : 'Dubai, United Arab Emirates';
    const companyTrnStr = typeof company?.vatTrnNumber === 'string' ? company.vatTrnNumber : (typeof company?.trn === 'string' ? company.trn : '-');
    const customerCompanyStr = typeof order?.customerParty?.companyName === 'string' ? order.customerParty.companyName : (typeof order?.customerName === 'string' ? order.customerName : 'N/A');
    const customerAddressStr = typeof order?.customerParty?.billingAddress === 'string' ? order.customerParty.billingAddress : (typeof order?.customerParty?.address === 'string' ? order.customerParty.address : '-');
    const customerTrnStr = typeof order?.customerParty?.vatTrnNumber === 'string' ? order.customerParty.vatTrnNumber : (typeof order?.customerParty?.trn === 'string' ? order.customerParty.trn : '-');

    return (
        <div className="space-y-2.5 bg-background min-h-screen text-foreground font-sans w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Action Bar matching ViewQuotation.jsx */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs print:hidden">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/sales-dashboard/delivery-orders')}
                        className="p-1 rounded-md hover:bg-hover text-foreground-muted hover:text-foreground transition-colors"
                        title="Back"
                    >
                        <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
                    </button>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight flex items-center gap-1.5">
                            {typeof order.deliveryOrderNumber === 'string' ? order.deliveryOrderNumber : `DO-${order.id}`}
                            <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded uppercase ${order.status === 'DELIVERED' ? 'bg-emerald-600 text-white' : order.status === 'OPEN' ? 'bg-blue-500 text-white' : 'bg-slate-500 text-white'}`}>
                                {typeof order.status === 'string' ? order.status : 'DRAFT'}
                            </span>
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none">
                            {isRTL ? 'الرئيسية > المبيعات > أوامر التسليم > ' : 'Home > Sales > Delivery Orders > '}{order.deliveryOrderNumber}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-1 self-end sm:self-auto text-[11px]">
                    <button
                        onClick={() => navigate(`/sales-dashboard/delivery-orders/edit/${id}`)}
                        className="h-7 px-2.5 bg-card border border-border hover:bg-hover text-foreground rounded font-medium flex items-center gap-1 transition-colors"
                    >
                        <Edit size={12} /> {isRTL ? 'تعديل' : 'Edit'}
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="h-7 px-2.5 bg-card border border-border hover:bg-hover text-foreground rounded font-medium flex items-center gap-1 transition-colors"
                    >
                        <Printer size={12} /> {isRTL ? 'طباعة' : 'Print'}
                    </button>
                    <button
                        onClick={handleWhatsApp}
                        className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium flex items-center gap-1 transition-colors"
                    >
                        WhatsApp
                    </button>
                    <button
                        onClick={handleEmail}
                        className="h-7 px-2.5 bg-card border border-border hover:bg-hover text-foreground rounded font-medium flex items-center gap-1 transition-colors"
                    >
                        <Mail size={12} /> {isRTL ? 'البريد الإلكتروني' : 'Email'}
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                            className="h-7 px-2 bg-card border border-border hover:bg-hover text-foreground rounded font-medium flex items-center gap-1"
                        >
                            {isRTL ? 'المزيد' : 'More'} <ChevronDown size={11} />
                        </button>
                        {showMoreDropdown && (
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
                        <h2 className="text-lg font-bold text-primary tracking-tight">{companyNameStr}</h2>
                        <p className="text-[10px] text-foreground-muted max-w-xs">{companyAddressStr}</p>
                        <p className="text-[10px] text-foreground-muted">TRN: {companyTrnStr}</p>
                    </div>
                    <div className="text-end">
                        <h2 className="text-base font-bold text-foreground uppercase">{isRTL ? 'أوامر التسليم' : 'DELIVERY ORDERS'}</h2>
                        <p className="text-xs font-mono font-bold text-primary">{typeof order.deliveryOrderNumber === 'string' ? order.deliveryOrderNumber : `DO-${order.id}`}</p>
                        <p className="text-[10px] text-foreground-muted mt-1">{isRTL ? 'التاريخ' : 'Date'}: {order.deliveryOrderDate ? new Date(order.deliveryOrderDate).toLocaleDateString('en-GB') : '-'}</p>
                        <p className="text-[10px] text-foreground-muted">{isRTL ? 'تاريخ الشحن' : 'Shipment Date'}: {order.shipmentDate ? new Date(order.shipmentDate).toLocaleDateString('en-GB') : '-'}</p>
                    </div>
                </div>

                {/* Bill To Card */}
                <div className="grid grid-cols-2 gap-4 bg-primary/5 p-3 rounded-lg border border-border text-[11px]">
                    <div className="text-start">
                        <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block mb-0.5">{isRTL ? 'الفاتورة إلى:' : 'Billed To:'}</span>
                        <h3 className="font-bold text-foreground text-xs">{customerCompanyStr}</h3>
                        <p className="text-foreground-muted mt-0.5">{customerAddressStr}</p>
                        <p className="text-foreground-muted">TRN: {customerTrnStr}</p>
                    </div>
                    <div className="space-y-0.5 text-end">
                        <p><span className="text-foreground-muted">{isRTL ? 'أمر المبيعات:' : 'Sales Order:'}</span> <span className="font-semibold">{typeof order.salesOrderNumber === 'string' ? order.salesOrderNumber : '-'}</span></p>
                        <p><span className="text-foreground-muted">{isRTL ? 'رقم المرجع:' : 'Reference No.:'}</span> <span className="font-semibold">{typeof order.reference === 'string' ? order.reference : '-'}</span></p>
                        <p><span className="text-foreground-muted">{isRTL ? 'رقم أمر الشراء:' : 'Customer PO No.:'}</span> <span className="font-semibold">{typeof order.poNumber === 'string' ? order.poNumber : '-'}</span></p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="rounded border border-border overflow-x-auto">
                    <table className="w-full text-[10px] text-start border-collapse">
                        <thead>
                            <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                <th className="px-2 py-1.5 border-r border-border w-8 text-center">{isRTL ? 'م' : 'S.No.'}</th>
                                <th className="px-2 py-1.5 border-r border-border text-start">{isRTL ? 'الصنف' : 'Item'}</th>
                                <th className="px-2 py-1.5 border-r border-border text-center w-16">{isRTL ? 'الكمية' : 'Quantity'}</th>
                                <th className="px-2 py-1.5 border-r border-border text-end w-24">{isRTL ? 'السعر (درهم)' : 'Rate (AED)'}</th>
                                <th className="px-2 py-1.5 text-end w-28">{isRTL ? 'المبلغ (درهم)' : 'Amount (AED)'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {(order.items || []).map((item, idx) => (
                                <tr key={item.id || idx} className="hover:bg-hover transition-colors text-foreground">
                                    <td className="px-2 py-1 border-r border-border text-center text-foreground-muted">{idx + 1}</td>
                                    <td className="px-2 py-1 border-r border-border text-start">
                                        <div className="font-semibold">{typeof item.itemName === 'string' ? item.itemName : 'Item'}</div>
                                        {item.itemCode && <div className="text-[9px] text-foreground-muted">{item.itemCode}</div>}
                                    </td>
                                    <td className="px-2 py-1 border-r border-border text-center font-mono">{item.quantity}</td>
                                    <td className="px-2 py-1 border-r border-border text-end font-mono">AED {Number(item.rate || 0).toFixed(2)}</td>
                                    <td className="px-2 py-1 text-end font-mono font-semibold">AED {Number(item.amount || ((item.quantity || 0) * (item.rate || 0))).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary & Notes */}
                <div className="grid grid-cols-2 gap-4 text-[11px]">
                    <div className="space-y-2 text-start">
                        {order.termsAndConditions && (
                            <div className="bg-background border border-border p-2 rounded">
                                <span className="font-bold text-foreground block mb-0.5">{isRTL ? 'الشروط والأحكام' : 'Terms & Conditions'}</span>
                                <p className="text-foreground-muted whitespace-pre-wrap text-[10px]">{order.termsAndConditions}</p>
                            </div>
                        )}
                        {order.notes && (
                            <div className="bg-background border border-border p-2 rounded">
                                <span className="font-bold text-foreground block mb-0.5">{isRTL ? 'الملاحظات' : 'Notes'}</span>
                                <p className="text-foreground-muted whitespace-pre-wrap text-[10px]">{order.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-card border border-border rounded p-2.5 space-y-1 self-start">
                        <div className="flex justify-between text-foreground-muted"><span>{isRTL ? 'المجموع الفرعي' : 'Sub Total'}</span><span className="font-mono text-foreground font-semibold">AED {Number(order.subTotal || 0).toFixed(2)}</span></div>
                        {order.totalDiscount > 0 && <div className="flex justify-between text-foreground-muted"><span>{isRTL ? 'الخصم' : 'Discount'}</span><span className="font-mono text-foreground">- AED {Number(order.totalDiscount || 0).toFixed(2)}</span></div>}
                        <div className="flex justify-between text-foreground-muted"><span>{isRTL ? 'إجمالي الضريبة' : 'Total Tax'}</span><span className="font-mono text-foreground">AED {Number(order.totalTax || 0).toFixed(2)}</span></div>
                        {order.otherCharges > 0 && <div className="flex justify-between text-foreground-muted"><span>{isRTL ? 'رسوم أخرى' : 'Other Charges'}</span><span className="font-mono text-foreground">AED {Number(order.otherCharges || 0).toFixed(2)}</span></div>}
                        <div className="flex justify-between font-bold border-t border-border pt-1 text-xs text-foreground"><span>{isRTL ? 'صافي الإجمالي' : 'Net Total'}</span><span className="text-primary font-mono">AED {Number(order.netTotal || 0).toFixed(2)}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryOrderView;
