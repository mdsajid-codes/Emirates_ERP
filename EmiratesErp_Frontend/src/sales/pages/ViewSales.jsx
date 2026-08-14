import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { X, Edit, FileText, Loader2, ArrowLeft, Printer, Mail, Paperclip, ChevronDown, List, Plus, Copy, Trash2, ShoppingCart } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ViewSales = () => {
    const { id: orderId } = useParams();
    const navigate = useNavigate();
    const { isRTL, t } = useLanguage();
    const [viewingOrder, setViewingOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showConvertDropdown, setShowConvertDropdown] = useState(false);
    const [showMoreDropdown, setShowMoreDropdown] = useState(false);

    const [company, setCompany] = useState(null);
    const attachmentRef = React.useRef(null);

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

        if (orderId) {
            const fetchOrderDetails = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`${API_URL}/sales/orders/${orderId}`, authHeaders);
                    let orderData = response.data;
                    let partyData = null;
                    if (orderData.customerId) {
                        try {
                            const partyRes = await axios.get(`${API_URL}/parties/${orderData.customerId}`, authHeaders);
                            partyData = partyRes.data;
                        } catch (pErr) {
                            console.error("Failed to fetch party details for sales order", pErr);
                        }
                    }
                    setViewingOrder({ ...orderData, customerParty: partyData });
                } catch (err) {
                    console.error("Failed to fetch order details", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchOrderDetails();
        }
    }, [orderId, authHeaders]);

    const handleWhatsApp = () => {
        const phoneNumber = viewingOrder?.customerParty?.phone || '';
        const text = `Hi, here is the Sales Order ${viewingOrder?.salesOrderNumber}.`;
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleEmail = () => {
        const email = viewingOrder?.customerParty?.email || '';
        const subject = `Sales Order ${viewingOrder?.salesOrderNumber}`;
        const body = `Dear Customer,\n\nPlease find attached the Sales Order ${viewingOrder?.salesOrderNumber}.\n\nRegards,\n${company?.companyName || ''}`;
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to mark this order as CANCELLED (Void)?')) return;
        try {
            await axios.patch(`${API_URL}/sales/orders/${orderId}/status`, null, {
                params: { status: 'CANCELLED' },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setViewingOrder(prev => ({ ...prev, status: 'CANCELLED' }));
            setShowMoreDropdown(false);
        } catch (err) {
            console.error("Failed to cancel order", err);
            alert("Failed to update status. Please try again.");
        }
    };

    const handleDeleteOrder = async () => {
        if (window.confirm('Are you sure you want to delete this sales order?')) {
            try {
                await axios.delete(`${API_URL}/sales/orders/${orderId}`, authHeaders);
                navigate('/sales-dashboard/orders');
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete sales order.'}`);
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans space-y-2 w-full print:bg-white print:p-0 print:text-black" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header section matching ViewQuotation.jsx */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs print:hidden">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <ShoppingCart size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">
                            {t('so.viewTitle')}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none">
                            Sales Order #{viewingOrder?.salesOrderNumber || ''}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                        onClick={() => navigate('/sales-dashboard/orders')}
                        className="px-3 py-1 border border-border bg-card hover:bg-hover text-foreground rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                        <List size={12} /> {t('so.allOrders')}
                    </button>
                    <button
                        onClick={() => navigate('/sales-dashboard/orders/new')}
                        className="px-3.5 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                    >
                        <Plus size={12} /> {t('so.newBtn')}
                    </button>
                </div>
            </div>

            {/* Action Toolbar matching ViewQuotation.jsx */}
            <div className="px-2.5 py-1.5 flex flex-wrap gap-1.5 items-center bg-card border border-border rounded-lg shadow-2xs print:hidden">
                <button
                    onClick={() => navigate(`/sales-dashboard/orders/edit/${orderId}`)}
                    className="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                    title={t('qview.edit')}
                >
                    <Edit size={12} /> {t('qview.edit')}
                </button>

                <button
                    onClick={() => window.print()}
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
                    onClick={() => window.print()}
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

                <div className="relative">
                    <button
                        onClick={() => { setShowConvertDropdown(!showConvertDropdown); setShowMoreDropdown(false); }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                        {t('qview.convert')} <ChevronDown size={12} />
                    </button>
                    {showConvertDropdown && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-48 bg-card border border-border rounded-md shadow-xl text-[11px] py-1">
                            <button
                                className="block w-full text-left px-3 py-1.5 hover:bg-primary/10 text-primary font-medium"
                                onClick={() => navigate(`/sales-dashboard/invoices/new?salesOrderId=${orderId}`)}
                            >
                                {t('qview.convertToInvoice')}
                            </button>
                            <button
                                className="block w-full text-left px-3 py-1.5 hover:bg-primary/10 text-primary font-medium"
                                onClick={() => navigate(`/sales-dashboard/proforma-invoices/new?salesOrderId=${orderId}`)}
                            >
                                {t('qview.convertToProforma')}
                            </button>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <button
                        onClick={() => { setShowMoreDropdown(!showMoreDropdown); setShowConvertDropdown(false); }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                        {t('qview.more')} <ChevronDown size={12} />
                    </button>
                    {showMoreDropdown && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-44 bg-card border border-border rounded-md shadow-xl text-[11px] py-1">
                            <button
                                className="block w-full text-left px-3 py-1.5 hover:bg-hover text-foreground flex items-center gap-1.5"
                                onClick={() => navigate(`/sales-dashboard/orders/new?cloneId=${orderId}`)}
                            >
                                <Copy size={11} /> {t('qview.clone')}
                            </button>
                            <button
                                className="block w-full text-left px-3 py-1.5 hover:bg-hover text-amber-600 flex items-center gap-1.5"
                                onClick={handleCancelOrder}
                            >
                                {t('qview.markCancelled')}
                            </button>
                            <div className="border-t border-border my-1"></div>
                            <button
                                className="block w-full text-left px-3 py-1.5 hover:bg-rose-500/10 text-rose-600 flex items-center gap-1.5 font-medium"
                                onClick={handleDeleteOrder}
                            >
                                <Trash2 size={11} /> {t('qview.delete')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Status & Audit Bar */}
            {viewingOrder && (
                <div className="px-3 py-1.5 bg-card border border-border rounded-lg shadow-2xs text-[11px] text-foreground-muted flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 print:hidden">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${viewingOrder.status === 'OPEN' ? 'bg-blue-500' : viewingOrder.status === 'PARTIALLY_INVOICED' ? 'bg-amber-600' : viewingOrder.status === 'INVOICED' ? 'bg-emerald-600' : viewingOrder.status === 'CANCELLED' ? 'bg-rose-600' : 'bg-slate-400'}`}>
                            {typeof viewingOrder.status === 'string' ? viewingOrder.status : 'DRAFT'}
                        </span>
                        <span>{viewingOrder.createdAt ? new Date(viewingOrder.createdAt).toLocaleString() : '-'} {t('qview.created')} {typeof viewingOrder.createdBy === 'string' ? viewingOrder.createdBy : 'System'}</span>
                    </div>
                    {viewingOrder.updatedAt && (
                        <span>{new Date(viewingOrder.updatedAt).toLocaleString()} {t('qview.updated')} {typeof viewingOrder.updatedBy === 'string' ? viewingOrder.updatedBy : 'System'}</span>
                    )}
                </div>
            )}

            {/* Invoice Document Container */}
            <div className="flex-grow overflow-y-auto p-4 bg-background print:p-0 print:bg-white print:overflow-visible">
                <div id="printable-invoice" className="w-full bg-white border border-border shadow-2xs p-8 relative text-xs text-foreground print:w-full print:border-none print:shadow-none print:p-0">
                    {/* Company Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800">{typeof company?.companyName === 'string' ? company.companyName : 'Your Company Name'}</h2>
                        <p className="text-gray-600 text-[11px]">{typeof company?.address === 'string' ? company.address : 'Address Line 1'}, {typeof company?.city === 'string' ? company.city : 'City'} {typeof company?.country === 'string' ? company.country : 'Country'} {typeof company?.email === 'string' ? company.email : 'email@example.com'}</p>
                    </div>

                    {/* Order Info Header */}
                    <div className="flex justify-between items-start border-t border-b border-gray-300 py-3 mb-6">
                        <div className="space-y-1 text-xs">
                            <div className="flex"><span className="w-32 font-semibold">Order No.</span><span>: {typeof viewingOrder?.salesOrderNumber === 'string' || typeof viewingOrder?.salesOrderNumber === 'number' ? viewingOrder.salesOrderNumber : ''}</span></div>
                            <div className="flex"><span className="w-32 font-semibold">Order Date</span><span>: {viewingOrder?.salesOrderDate ? new Date(viewingOrder.salesOrderDate).toLocaleDateString() : '-'}</span></div>
                            <div className="flex"><span className="w-32 font-semibold">Shipment Date</span><span>: {viewingOrder?.shipmentDate ? new Date(viewingOrder.shipmentDate).toLocaleDateString() : '-'}</span></div>
                            <div className="flex"><span className="w-32 font-semibold">Reference No.</span><span>: {typeof viewingOrder?.reference === 'string' ? viewingOrder.reference : '-'}</span></div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-gray-800">Sales Order</h2>
                            <p className="text-[11px] font-semibold mt-1">TRN : {typeof company?.pan === 'string' ? company.pan : '104349488700003'}</p>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="mb-6 bg-gray-50 p-2.5 rounded border border-gray-200">
                        <h3 className="font-bold mb-1 text-xs">Bill To</h3>
                        <div className="text-gray-700 text-xs">
                            <p className="font-semibold">{typeof viewingOrder?.customerParty?.companyName === 'string' ? viewingOrder.customerParty.companyName : (typeof viewingOrder?.customerName === 'string' ? viewingOrder.customerName : 'Customer')}</p>
                            <p>{viewingOrder?.customerParty?.billingAddress ? (typeof viewingOrder.customerParty.billingAddress === 'string' ? viewingOrder.customerParty.billingAddress : (typeof viewingOrder.customerParty.billingAddress === 'object' ? [viewingOrder.customerParty.billingAddress.addressLine, viewingOrder.customerParty.billingAddress.city, viewingOrder.customerParty.billingAddress.country].filter(Boolean).join(', ') : 'Address not available')) : 'Address not available'}</p>
                            <p className="font-semibold mt-1">TRN : {typeof viewingOrder?.customerParty?.vatTrnNumber === 'string' || typeof viewingOrder?.customerParty?.vatTrnNumber === 'number' ? viewingOrder.customerParty.vatTrnNumber : 'N/A'}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-6 text-xs">
                        <thead>
                            <tr className="border-t border-b border-gray-300 bg-gray-50 text-[11px]">
                                <th className="py-2 text-center w-10">S.N</th>
                                <th className="py-2 text-left">Item & Description</th>
                                <th className="py-2 text-center w-20">Qty</th>
                                <th className="py-2 text-right w-24">Rate</th>
                                <th className="py-2 text-center w-20">VAT (%)</th>
                                <th className="py-2 text-right w-24">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-xs">
                            {viewingOrder?.items?.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td className="py-2 text-center">{index + 1}</td>
                                    <td className="py-2">
                                        <p className="font-semibold">{typeof item.itemName === 'string' ? item.itemName : (typeof item.name === 'string' ? item.name : 'Item')}</p>
                                        {item.itemCode && <p className="text-gray-500 text-[10px]">{typeof item.itemCode === 'string' ? item.itemCode : ''}</p>}
                                    </td>
                                    <td className="py-2 text-center">{item.quantity || 0}</td>
                                    <td className="py-2 text-right font-mono">AED {Number(item.rate || 0).toFixed(2)}</td>
                                    <td className="py-2 text-center">{item.taxPercentage || 0}%</td>
                                    <td className="py-2 text-right font-mono font-semibold">AED {(Number(item.quantity || 0) * Number(item.rate || 0)).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Summary Footer */}
                    <div className="flex flex-col md:flex-row justify-between gap-6 border-t border-gray-200 pt-4">
                        <div className="flex-1 space-y-3">
                            {viewingOrder?.notes && (
                                <div>
                                    <h4 className="font-bold text-xs mb-1">Notes</h4>
                                    <p className="text-xs text-gray-600">{typeof viewingOrder.notes === 'string' ? viewingOrder.notes : ''}</p>
                                </div>
                            )}
                            {viewingOrder?.termsAndConditions && (
                                <div>
                                    <h4 className="font-bold text-xs mb-1">Terms & Conditions</h4>
                                    <p className="text-xs text-gray-600">{typeof viewingOrder.termsAndConditions === 'string' ? viewingOrder.termsAndConditions : ''}</p>
                                </div>
                            )}
                        </div>

                        <div className="w-full md:w-64 space-y-1.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Sub Total</span>
                                <span className="font-mono font-semibold">AED {Number(viewingOrder?.subTotal || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Tax</span>
                                <span className="font-mono font-semibold">AED {Number(viewingOrder?.totalTax || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-300 pt-2 text-sm font-bold">
                                <span>Net Total</span>
                                <span className="text-primary font-mono">AED {Number(viewingOrder?.netTotal || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewSales;