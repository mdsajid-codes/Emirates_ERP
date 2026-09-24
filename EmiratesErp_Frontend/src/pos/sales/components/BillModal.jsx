import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, User, Printer, CreditCard, DollarSign, Loader, ParkingSquare, Plus, Trash2 } from 'lucide-react';
import { formatPrice, formatVariantAttributes, constructImageUrl } from '../utils';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getCustomerDisplayName = (c) => {
    if (!c) return 'Walk-in Customer';
    if (typeof c === 'string') return c;
    return c.companyName || c.name || c.displayName || c.primaryContactPersonFull || c.primaryContactPerson || [c.primaryFirstName, c.primaryLastName].filter(Boolean).join(' ') || 'Walk-in Customer';
};

const BillModal = ({
    isOpen,
    onClose,
    cart,
    customer,
    subtotal,
    tax,
    discountCents,
    total,
    onProcessSale,
    onOpenDiscountModal,
    onParkSale,
    loading,
    initialOrderId,
    initialDetails
}) => {
    const [orderId, setOrderId] = useState('');
    const [companyInfo, setCompanyInfo] = useState(null);

    // Split Payment Legs State
    const [paymentLegs, setPaymentLegs] = useState([
        { method: 'CASH', amount: (total / 100).toFixed(2), reference: '', cardTerminalId: '' }
    ]);

    // Order Details Fields
    const [orderType, setOrderType] = useState('DINE_IN');
    const [adultsCount, setAdultsCount] = useState(0);
    const [kidsCount, setKidsCount] = useState(0);
    const [salesSource, setSalesSource] = useState('POS');

    useEffect(() => {
        const fetchCompanyInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/company-info`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setCompanyInfo(response.data);
            } catch (error) {
                console.error("Error fetching company info for receipt:", error);
            }
        };

        fetchCompanyInfo();
    }, []);

    useEffect(() => {
        if (isOpen) {
            setOrderId(initialOrderId || `ORD-${Date.now().toString().slice(-6)}`);
            setPaymentLegs([
                { method: 'CASH', amount: (total / 100).toFixed(2), reference: '', cardTerminalId: '' }
            ]);
            setOrderType(initialDetails?.orderType || 'DINE_IN');
            setAdultsCount(initialDetails?.adultsCount || 0);
            setKidsCount(initialDetails?.kidsCount || 0);
            setSalesSource(initialDetails?.salesSource || 'POS');
        }
    }, [isOpen, initialOrderId, initialDetails, total]);

    const totalPaidCents = paymentLegs.reduce((sum, leg) => sum + Math.round((parseFloat(leg.amount) || 0) * 100), 0);
    const remainingDueCents = Math.max(0, total - totalPaidCents);
    const changeCents = Math.max(0, totalPaidCents - total);

    const handleAddLeg = () => {
        const rem = (remainingDueCents / 100).toFixed(2);
        setPaymentLegs([...paymentLegs, { method: 'CARD', amount: parseFloat(rem) > 0 ? rem : '0.00', reference: '', cardTerminalId: '' }]);
    };

    const handleUpdateLeg = (index, field, value) => {
        const updated = [...paymentLegs];
        updated[index] = { ...updated[index], [field]: value };
        setPaymentLegs(updated);
    };

    const handleRemoveLeg = (index) => {
        if (paymentLegs.length > 1) {
            setPaymentLegs(paymentLegs.filter((_, i) => i !== index));
        }
    };

    const handlePay = () => {
        if (loading) return;
        const formattedLegs = paymentLegs.map(leg => ({
            method: leg.method.toLowerCase(),
            amountCents: Math.round((parseFloat(leg.amount) || 0) * 100),
            reference: leg.reference || null,
            cardTerminalId: leg.cardTerminalId || null
        }));
        onProcessSale(orderId, formattedLegs, {
            orderType, adultsCount, kidsCount, salesSource
        });
    };

    const handlePrintOrder = () => {
        window.print();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 print:hidden" onClick={onClose}>
                <div id="bill-modal-content" className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    {/* Left Side: Sale Summary */}
                    <div className="w-3/5 flex flex-col border-r border-slate-200">
                        <div className="p-4 border-b">
                            <h3 className="text-xl font-semibold">Sale Summary</h3>
                            <div className="flex justify-between items-center text-sm text-slate-500 mt-1">
                                <span>Order ID: <span className="font-medium text-slate-700">{orderId}</span></span>
                                <div className="flex items-center gap-2">
                                    <User size={14} />
                                    <span>{getCustomerDisplayName(customer)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4 space-y-2">


                            {cart.map(item => (
                                <div key={item.productVariantId} className="flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-medium">{item.productName}</p>
                                        <p className="text-xs text-slate-500">{formatVariantAttributes(item.attributes)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p>{item.quantity} x {formatPrice(item.priceCents)}</p>
                                        <p className="font-semibold">{formatPrice(item.quantity * item.priceCents)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t bg-slate-50 space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
                            {discountCents > 0 && <div className="flex justify-between text-green-600"><span className="font-medium">Discount</span><span className="font-medium">-{formatPrice(discountCents)}</span></div>}
                            <div className="flex justify-between"><span className="text-slate-600">Delivery Charge</span><span>AED 0.00</span></div>
                            <div className="flex justify-between"><span className="text-slate-600">Tax (estimated)</span><span>{formatPrice(tax)}</span></div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2"><span>Total</span><span>{formatPrice(total)}</span></div>
                        </div>
                        <div className="p-4 border-t grid grid-cols-4 gap-2">
                            <button className="btn-secondary text-sm" onClick={onClose}>Close</button>
                            <button className="btn-secondary text-sm" onClick={onOpenDiscountModal}>Discount</button>
                            <button onClick={handlePrintOrder} className="btn-secondary text-sm flex items-center justify-center gap-2">
                                <Printer size={14} /> Print Order
                            </button>
                            <button onClick={() => onParkSale(orderId, { orderType, adultsCount, kidsCount, salesSource })} className="btn-primary text-sm flex items-center justify-center gap-2" disabled={loading}>
                                <ParkingSquare size={14} /> Park Sale
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Split Payment */}
                    <div className="w-2/5 flex flex-col bg-slate-50">
                        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-white">
                            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wide">Split Payment</h4>
                            <div className="flex gap-1">
                                <button type="button" onClick={() => setPaymentLegs([{ method: 'CASH', amount: (total / 100).toFixed(2), reference: '', cardTerminalId: '' }])} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[11px] font-medium rounded text-slate-700">Cash</button>
                                <button type="button" onClick={() => setPaymentLegs([{ method: 'CARD', amount: (total / 100).toFixed(2), reference: 'CARD_TX', cardTerminalId: 'POS-TERM-1' }])} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[11px] font-medium rounded text-slate-700">Card</button>
                                <button type="button" onClick={() => setPaymentLegs([
                                    { method: 'CASH', amount: ((total / 100) / 2).toFixed(2), reference: '', cardTerminalId: '' },
                                    { method: 'CARD', amount: ((total / 100) / 2).toFixed(2), reference: 'CARD_TX', cardTerminalId: 'POS-TERM-1' }
                                ])} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[11px] font-medium rounded text-slate-700">50/50</button>
                            </div>
                        </div>
                        <div className="p-4 space-y-3 flex-grow overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border">
                                <div>
                                    <label className="label text-xs">Total Due</label>
                                    <p className="font-bold text-slate-800 text-base">{formatPrice(total)}</p>
                                </div>
                                <div>
                                    <label className="label text-xs">Total Tendered</label>
                                    <p className={`font-bold text-base ${totalPaidCents >= total ? 'text-green-600' : 'text-amber-600'}`}>{formatPrice(totalPaidCents)}</p>
                                </div>
                            </div>

                            {remainingDueCents > 0 ? (
                                <div className="text-xs bg-amber-50 border border-amber-200 p-2 rounded text-amber-800 flex justify-between font-medium">
                                    <span>Remaining Due:</span>
                                    <span>{formatPrice(remainingDueCents)}</span>
                                </div>
                            ) : changeCents > 0 ? (
                                <div className="text-xs bg-green-50 border border-green-200 p-2 rounded text-green-800 flex justify-between font-medium">
                                    <span>Change Due:</span>
                                    <span>{formatPrice(changeCents)}</span>
                                </div>
                            ) : null}

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="label text-xs">Payment Legs</label>
                                </div>
                                {paymentLegs.map((leg, index) => (
                                    <div key={index} className="p-2.5 bg-white border rounded-md space-y-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={leg.method}
                                                onChange={e => handleUpdateLeg(index, 'method', e.target.value)}
                                                className="border rounded p-1 bg-white font-medium text-slate-700 focus:outline-none flex-1 text-xs"
                                            >
                                                <option value="CASH">Cash</option>
                                                <option value="CARD">Card</option>
                                                <option value="WALLET">Wallet / Bank</option>
                                                <option value="CREDIT">On Account (Credit)</option>
                                            </select>
                                            <div className="flex items-center gap-1 w-32">
                                                <span className="text-slate-400 font-medium">AED</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={leg.amount}
                                                    onChange={e => handleUpdateLeg(index, 'amount', e.target.value)}
                                                    className="w-full border rounded p-1 text-right font-bold focus:outline-none text-xs"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            {paymentLegs.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveLeg(index)} className="text-red-500 hover:text-red-700 p-1">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        {leg.method === 'CARD' && (
                                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                                                <input
                                                    type="text"
                                                    placeholder="Terminal ID (e.g. POS-TERM-1)"
                                                    value={leg.cardTerminalId || ''}
                                                    onChange={e => handleUpdateLeg(index, 'cardTerminalId', e.target.value)}
                                                    className="border rounded p-1 text-[11px]"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Tx Ref / Auth Code"
                                                    value={leg.reference || ''}
                                                    onChange={e => handleUpdateLeg(index, 'reference', e.target.value)}
                                                    className="border rounded p-1 text-[11px]"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddLeg}
                                    className="w-full py-1.5 border border-dashed border-slate-300 hover:border-blue-500 text-blue-600 rounded text-xs flex items-center justify-center gap-1 font-medium transition-colors"
                                >
                                    <Plus size={14} /> Add Payment Method
                                </button>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-white">
                            <button onClick={handlePay} className="w-full btn-primary text-base py-2.5" disabled={loading}>
                                {loading ? <Loader className="animate-spin h-5 w-5 mr-2 inline" /> : null}
                                Complete Sale ({formatPrice(totalPaidCents)})
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Thermal Receipt Print View */}
            <div id="thermal-receipt" className="hidden print:block font-mono text-black bg-white p-2 w-[80mm] mx-auto leading-tight">
                <style>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #thermal-receipt, #thermal-receipt * {
                            visibility: visible;
                        }
                        #thermal-receipt {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 0;
                            margin: 0;
                            font-family: 'Courier New', Courier, monospace !important;
                            font-size: 10px !important;
                            color: #000000 !important;
                            background: #ffffff !important;
                        }
                    }
                `}</style>

                {/* Header */}
                <div className="text-center pb-2 border-b border-black border-dashed">
                    {companyInfo?.logoUrl && (
                        <img
                            src={constructImageUrl(companyInfo.logoUrl)}
                            alt="Logo"
                            className="h-10 mx-auto mb-1 object-contain grayscale"
                        />
                    )}
                    <h1 className="text-base font-bold uppercase tracking-wide mb-0.5">{companyInfo?.companyName || 'EMIRATES ERP POS'}</h1>
                    {companyInfo?.address && <p className="text-[10px] leading-tight">{companyInfo.address}</p>}
                    {[companyInfo?.city, companyInfo?.state, companyInfo?.country].filter(Boolean).join(', ') && (
                        <p className="text-[10px] leading-tight">{[companyInfo?.city, companyInfo?.state, companyInfo?.country].filter(Boolean).join(', ')}</p>
                    )}
                    {(companyInfo?.phone || companyInfo?.email) && (
                        <p className="text-[10px] leading-tight mt-0.5">
                            {[companyInfo?.phone && `Tel: ${companyInfo.phone}`, companyInfo?.email && `Email: ${companyInfo.email}`].filter(Boolean).join(' | ')}
                        </p>
                    )}
                    {companyInfo?.pan && <p className="text-[10px] font-semibold mt-0.5">TRN: {companyInfo.pan}</p>}
                </div>

                {/* Receipt Title */}
                <div className="text-center my-1.5 font-bold text-xs uppercase tracking-wider">
                    *** TAX INVOICE ***
                </div>

                {/* Metadata */}
                <div className="py-1.5 border-y border-black border-dashed text-[10px] space-y-0.5">
                    <div className="flex justify-between">
                        <span>Order ID: <strong className="text-xs">{orderId}</strong></span>
                        <span>Type: <strong>{orderType.replace('_', ' ')}</strong></span>
                    </div>
                    <div className="flex justify-between">
                        <span>Date: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Customer: <strong>{getCustomerDisplayName(customer)}</strong></span>

                        <span>Cashier: <strong>Admin</strong></span>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-[9px] my-2 border-collapse table-fixed">
                    <thead>
                        <tr className="border-b border-black border-dashed font-bold">
                            <th className="text-left py-1 w-[38%]">ITEM</th>
                            <th className="text-center py-1 w-[12%]">QTY</th>
                            <th className="text-right py-1 w-[25%]">PRICE</th>
                            <th className="text-right py-1 w-[25%]">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="py-1 align-top pr-1">
                                    <div className="font-semibold text-[9px] leading-tight break-words">{item.productName}</div>
                                    {item.attributes && Object.keys(item.attributes).length > 0 && (
                                        <div className="text-[8px] text-gray-700 leading-tight">{formatVariantAttributes(item.attributes)}</div>
                                    )}
                                </td>
                                <td className="text-center py-1 align-top">{item.quantity}</td>
                                <td className="text-right py-1 align-top whitespace-nowrap px-0.5">{formatPrice(item.priceCents)}</td>
                                <td className="text-right py-1 align-top font-semibold whitespace-nowrap pl-0.5">{formatPrice(item.quantity * item.priceCents)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Financials */}
                <div className="pt-1 border-t border-black border-dashed space-y-0.5 text-[10px]">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discountCents > 0 && (
                        <div className="flex justify-between font-medium">
                            <span>Discount:</span>
                            <span>-{formatPrice(discountCents)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-gray-800">
                        <span>Tax (Included):</span>
                        <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xs border-t border-b border-black border-double py-1 my-1">
                        <span>TOTAL:</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                    <div className="border-t border-dashed pt-1 mt-1 space-y-0.5">
                        <span className="font-semibold block text-[10px]">Payment Breakdown:</span>
                        {paymentLegs.map((leg, i) => (
                            <div key={i} className="flex justify-between text-[10px]">
                                <span>{leg.method}:</span>
                                <span>{formatPrice(Math.round((parseFloat(leg.amount) || 0) * 100))}</span>
                            </div>
                        ))}
                        {changeCents > 0 && (
                            <div className="flex justify-between text-[10px] font-medium">
                                <span>Change:</span>
                                <span>{formatPrice(changeCents)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-[10px] mt-3 border-t border-black border-dashed pt-2 space-y-0.5">
                    <p className="font-bold">Thank you for your business!</p>
                    <p className="text-[9px] text-gray-700">Please keep this receipt for warranty purposes.</p>
                </div>
            </div>
        </>
    );
};

export default BillModal;