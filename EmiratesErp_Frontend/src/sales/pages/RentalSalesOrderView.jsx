import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit, FileText, Printer, Mail, Paperclip, ChevronDown, ArrowLeft, Loader2, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RentalSalesOrderView = () => {
    const { t, isRTL } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConvertMenu, setShowConvertMenu] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const convertMenuRef = useRef(null);
    const moreMenuRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [orderRes, companyRes] = await Promise.all([
                    axios.get(`${API_URL}/sales/rental-sales-orders/${id}`, { headers }),
                    axios.get(`${API_URL}/company-info`, { headers }).catch(() => ({ data: null }))
                ]);

                let orderData = orderRes.data;
                let partyData = null;

                if (orderData.customerId) {
                    try {
                        const partyRes = await axios.get(`${API_URL}/parties/${orderData.customerId}`, { headers });
                        partyData = partyRes.data;
                    } catch (error) {
                        console.error("Failed to fetch party details", error);
                    }
                }

                setOrder({ ...orderData, customerParty: partyData });
                setCompany(companyRes.data);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load rental sales order details.");
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
        // Placeholder for number to words conversion
        return `${amount} Dirhams`;
    };

    const handleDownloadPdf = async () => {
        try {
            const response = await axios.get(`${API_URL}/sales/rental-sales-orders/${id}/pdf`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Rental_Sales_Order_${order.orderNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Failed to download PDF", err);
            alert("Failed to download PDF. Please try again.");
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this order as ${newStatus}?`)) return;
        try {
            const token = localStorage.getItem('token');
            // Assuming the backend accepts status as a request param
            await axios.patch(`${API_URL}/sales/rental-sales-orders/${id}/status`, null, {
                params: { status: newStatus },
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrder(prev => ({ ...prev, status: newStatus }));
            setShowMoreMenu(false);
            alert(`Order status updated to ${newStatus}`);
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update status");
        }
    };

    const handleWhatsApp = () => {
        const message = `Rental Sales Order #${order.orderNumber} for ${order.customerName}. Total: ${order.netTotal}`;
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleEmail = () => {
        const subject = `Rental Sales Order #${order.orderNumber}`;
        const body = `Dear Customer,\n\nPlease find attached the Rental Sales Order #${order.orderNumber}.\n\nTotal Amount: ${order.netTotal}\n\nRegards,\n${company?.companyName || 'Company Name'}`;
        const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
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

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary h-7 w-7" /></div>;
    if (error) return <div className="p-4 text-center text-rose-500 text-xs font-semibold">{error}</div>;
    if (!order) return <div className="p-4 text-center text-foreground-muted text-xs font-semibold">Rental Sales Order not found.</div>;

    return (
        <div className="bg-background text-foreground font-sans space-y-2 w-full print:bg-white print:p-0" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs print:hidden">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <ShoppingCart size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">
                            {t('rentalOrder.viewTitle')}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none">
                            Home &gt; Sales &gt; {t('rentalOrder.viewTitle')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                        onClick={() => navigate('/sales-dashboard/rental-sales-orders')}
                        className="px-2.5 py-1 bg-card border border-border text-foreground hover:bg-hover rounded text-xs font-semibold transition-colors"
                    >
                        {t('rentalOrder.allOrders')}
                    </button>
                    <button
                        onClick={() => navigate('/sales-dashboard/rental-sales-orders/new')}
                        className="px-3 py-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded text-xs font-semibold transition-colors shadow-2xs"
                    >
                        + {t('rentalOrder.newBtn')}
                    </button>
                </div>
            </div>

            {/* Action Toolbar */}
            <div className="px-2.5 py-1.5 flex flex-wrap gap-1.5 items-center bg-card border border-border rounded-lg shadow-2xs print:hidden">
                <button
                    onClick={() => navigate(`/sales-dashboard/rental-sales-orders/edit/${id}`)}
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

                <button
                    onClick={() => alert("Attachments feature coming soon!")}
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
                                onClick={() => navigate(`/sales-dashboard/rental-invoices/new?orderId=${id}`)}
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
                        <div className="absolute top-full left-0 z-50 mt-1 w-44 bg-card border border-border rounded-md shadow-xl text-[11px] py-1">
                            <button
                                className="block w-full text-left px-3 py-1.5 hover:bg-hover text-foreground"
                                onClick={() => navigate(`/sales-dashboard/rental-sales-orders/new?cloneId=${id}`)}
                            >
                                Clone
                            </button>
                            {order.status !== 'SENT' && order.status !== 'ACCEPTED' && order.status !== 'CANCELLED' && (
                                <button className="block w-full text-left px-3 py-1.5 hover:bg-hover text-blue-600" onClick={() => handleStatusUpdate('SENT')}>Mark as Sent</button>
                            )}
                            {order.status !== 'ACCEPTED' && order.status !== 'CANCELLED' && (
                                <button className="block w-full text-left px-3 py-1.5 hover:bg-hover text-emerald-600" onClick={() => handleStatusUpdate('ACCEPTED')}>Mark as Accepted</button>
                            )}
                            {order.status !== 'REJECTED' && order.status !== 'CANCELLED' && (
                                <button className="block w-full text-left px-3 py-1.5 hover:bg-hover text-rose-600" onClick={() => handleStatusUpdate('REJECTED')}>Mark as Rejected</button>
                            )}
                            {order.status !== 'CANCELLED' && (
                                <button className="block w-full text-left px-3 py-1.5 hover:bg-hover text-amber-600" onClick={() => handleStatusUpdate('CANCELLED')}>Mark as Canceled</button>
                            )}
                            <div className="border-t border-border my-1"></div>
                            <button
                                className="block w-full text-left px-3 py-1.5 hover:bg-rose-500/10 text-rose-600 font-medium"
                                onClick={() => {
                                    if (window.confirm('Delete this order?')) {
                                        axios.delete(`${API_URL}/sales/rental-sales-orders/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                                            .then(() => navigate('/sales-dashboard/rental-sales-orders'))
                                            .catch(() => alert("Failed to delete"));
                                    }
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Status & Audit Bar */}
            <div className="px-3 py-1.5 bg-card border border-border rounded-lg shadow-2xs text-[11px] text-foreground-muted flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 print:hidden">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${order.status === 'SENT' ? 'bg-blue-500' : order.status === 'ACCEPTED' ? 'bg-emerald-600' : (order.status === 'RENTAL_INVOICED' || order.status === 'INVOICED') ? 'bg-purple-600' : order.status === 'CANCELLED' ? 'bg-amber-600' : order.status === 'REJECTED' ? 'bg-rose-600' : 'bg-slate-400'}`}>{order.status}</span>
                    <span>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'} {t('qview.created')} {order.createdBy || 'System'}</span>
                </div>
                {order.updatedAt && (
                    <span>{new Date(order.updatedAt).toLocaleString()} {t('qview.updated')} {order.updatedBy || 'System'}</span>
                )}
            </div>

            {/* Document View */}
            <div className="flex-grow overflow-y-auto p-6 bg-slate-50 print:p-0 print:bg-white print:overflow-visible">
                <div className="w-full bg-white border shadow-sm p-8 relative text-sm print:w-full print:border-none print:shadow-none print:p-0">

                    {/* Company Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold text-gray-800">{company?.companyName || 'Your Company Name'}</h2>
                        <p className="text-gray-600">{company?.address || 'Address Line 1'}, {company?.city || 'City'} {company?.country || 'Country'} {company?.email || 'email@example.com'}</p>
                    </div>

                    {/* Order Info Header */}
                    <div className="flex justify-between items-start border-t border-b border-gray-300 py-4 mb-6">
                        <div className="space-y-1">
                            <div className="flex"><span className="w-32 font-semibold">Order No.</span><span>: {order.orderNumber}</span></div>
                            <div className="flex"><span className="w-32 font-semibold">Order Date</span><span>: {new Date(order.orderDate).toLocaleDateString()}</span></div>
                            <div className="flex"><span className="w-32 font-semibold">Shipment Date</span><span>: {order.shipmentDate ? new Date(order.shipmentDate).toLocaleDateString() : '-'}</span></div>
                            <div className="flex"><span className="w-32 font-semibold">Reference No.</span><span>: {order.reference || '-'}</span></div>
                            {order.salespersonName && (
                                <div className="flex"><span className="w-32 font-semibold">Salesperson</span><span>: {order.salespersonName}</span></div>
                            )}
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-gray-800">Rental Sales Order</h2>
                            <p className="text-xs font-semibold mt-1">TRN : {company?.pan || '104349488700003'}</p>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="mb-6 bg-gray-100 p-2">
                        <h3 className="font-bold mb-1">Bill To</h3>
                        <div className="text-gray-700">
                            <p className="font-semibold">{order.customerParty?.companyName || order.customerName}</p>
                            <p>{formatAddress(order.customerParty?.billingAddress)}</p>
                            <p className="font-semibold mt-1">TRN : {order.customerParty?.vatTrnNumber || 'N/A'}</p>
                            {order.dearSir && <p className="mt-1">Attn: {order.dearSir}</p>}
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-t border-b border-gray-300 bg-gray-50 text-xs">
                                <th className="py-2 text-center w-12">S.N</th>
                                <th className="py-2 text-left">Item & Description</th>
                                <th className="py-2 text-center w-24">Qty (Unit)</th>
                                <th className="py-2 text-right w-24">Rent/Unit</th>
                                <th className="py-2 text-center w-20">Days</th>
                                <th className="py-2 text-center w-20">VAT (%)</th>
                                <th className="py-2 text-right w-24">VAT Amount</th>
                                <th className="py-2 text-right w-24">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs">
                            {order.items.map((item, index) => {
                                const qty = Number(item.quantity) || 0;
                                const rent = Number(item.rentalValue) || 0;
                                const duration = Number(order.rentalDurationDays) || 1;
                                const amount = qty * rent * duration;
                                const vat = item.taxValue || ((amount * (item.taxPercentage || 0)) / 100);

                                return (
                                    <tr key={item.id || index} className="border-b border-gray-200">
                                        <td className="py-3 text-center">{index + 1}</td>
                                        <td className="py-3">
                                            <p className="font-semibold">{item.itemName}</p>
                                            <p className="text-gray-500">{item.itemCode}</p>
                                            {item.description && <p className="text-gray-400 italic text-[10px]">{item.description}</p>}
                                        </td>
                                        <td className="py-3 text-center">{qty}</td>
                                        <td className="py-3 text-right">{rent.toFixed(2)}</td>
                                        <td className="py-3 text-center">{duration}</td>
                                        <td className="py-3 text-center">{item.taxPercentage || '0'}%</td>
                                        <td className="py-3 text-right">{vat.toFixed(2)}</td>
                                        <td className="py-3 text-right">{amount.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Footer Section */}
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-6">
                            <div>
                                <h4 className="font-bold text-sm mb-1">Amount in Words :</h4>
                                <p className="text-sm text-gray-600">{numberToWords(order.netTotal)}</p>
                            </div>
                            {order.notes && (
                                <div>
                                    <h4 className="font-bold text-sm mb-1">Notes</h4>
                                    <p className="text-xs text-gray-600 whitespace-pre-wrap">{order.notes}</p>
                                </div>
                            )}
                            {order.termsAndConditions && (
                                <div>
                                    <h4 className="font-bold text-sm mb-1">Terms & Conditions</h4>
                                    <p className="text-xs text-gray-600 whitespace-pre-wrap">{order.termsAndConditions}</p>
                                </div>
                            )}
                        </div>

                        <div className="w-full md:w-80">
                            <div className="flex justify-between py-1 text-sm border-b border-gray-100">
                                <span>Total Net Rental / Day</span>
                                <span>{order.subTotalPerDay?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1 text-sm border-b border-gray-100">
                                <span>Rental Duration</span>
                                <span>{order.rentalDurationDays} Days</span>
                            </div>
                            <div className="flex justify-between py-1 text-sm border-b border-gray-100 font-medium">
                                <span>Total Rental Price</span>
                                <span>{order.totalRentalPrice?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1 text-sm border-b border-gray-100">
                                <span>Total Discount</span>
                                <span>{order.totalDiscount?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1 text-sm border-b border-gray-100">
                                <span>Gross Total</span>
                                <span>{order.grossTotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1 text-sm border-b border-gray-100">
                                <span>Total VAT</span>
                                <span>{order.totalTax?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1 text-sm border-b border-gray-100">
                                <span>Other Charges</span>
                                <span>{order.otherCharges?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 text-base font-bold border-t border-gray-300 mt-2">
                                <span>Net Total</span>
                                <span>AED {order.netTotal?.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RentalSalesOrderView;
