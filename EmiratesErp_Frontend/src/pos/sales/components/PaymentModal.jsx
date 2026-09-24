import React, { useState } from 'react';
import { CreditCard, DollarSign, Loader, Plus, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import { formatPrice } from '../utils';

const PaymentModal = ({ subtotal, tax, total, onProcessSale, onClose, loading }) => {
    const [paymentLegs, setPaymentLegs] = useState([
        { method: 'CASH', amount: (total / 100).toFixed(2), reference: '', cardTerminalId: '' }
    ]);

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

    const handleProcess = () => {
        const formattedLegs = paymentLegs.map(leg => ({
            method: leg.method.toLowerCase(),
            amountCents: Math.round((parseFloat(leg.amount) || 0) * 100),
            reference: leg.reference || null,
            cardTerminalId: leg.cardTerminalId || null
        }));
        onProcessSale(formattedLegs);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Process Payment (Split)">
            <div className="space-y-4">
                <div className="text-center">
                    <p className="text-slate-500 text-xs">Total Amount Due</p>
                    <p className="text-3xl font-bold text-slate-800">{formatPrice(total)}</p>
                </div>
                <div className="border-t border-dashed pt-2 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatPrice(tax)}</span>
                    </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                        <span>Payment Methods</span>
                        <div className="flex gap-1 text-[11px]">
                            <button type="button" onClick={() => setPaymentLegs([{ method: 'CASH', amount: (total / 100).toFixed(2), reference: '', cardTerminalId: '' }])} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded">Full Cash</button>
                            <button type="button" onClick={() => setPaymentLegs([{ method: 'CARD', amount: (total / 100).toFixed(2), reference: 'CARD_TX', cardTerminalId: 'POS-TERM-1' }])} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded">Full Card</button>
                        </div>
                    </div>
                    {paymentLegs.map((leg, index) => (
                        <div key={index} className="p-2.5 bg-slate-50 border rounded-md space-y-2 text-xs">
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
                                <div className="flex items-center gap-1 w-28">
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
                                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                                    <input
                                        type="text"
                                        placeholder="Terminal ID"
                                        value={leg.cardTerminalId || ''}
                                        onChange={e => handleUpdateLeg(index, 'cardTerminalId', e.target.value)}
                                        className="border rounded p-1 text-[11px] bg-white"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Tx Reference"
                                        value={leg.reference || ''}
                                        onChange={e => handleUpdateLeg(index, 'reference', e.target.value)}
                                        className="border rounded p-1 text-[11px] bg-white"
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

                {changeCents > 0 && (
                    <div className="text-center bg-green-50 border border-green-200 p-2 rounded-lg text-xs">
                        <p className="text-slate-500">Change Due</p>
                        <p className="text-xl font-bold text-green-600">{formatPrice(changeCents)}</p>
                    </div>
                )}
                {remainingDueCents > 0 && (
                    <div className="text-center bg-amber-50 border border-amber-200 p-2 rounded-lg text-xs">
                        <p className="text-slate-500">Remaining Due</p>
                        <p className="text-lg font-bold text-amber-600">{formatPrice(remainingDueCents)}</p>
                    </div>
                )}

                <button onClick={handleProcess} disabled={loading} className="w-full btn-primary flex items-center justify-center text-sm py-2">
                    {loading && <Loader className="animate-spin h-5 w-5 mr-2" />}
                    Confirm Sale ({formatPrice(totalPaidCents)})
                </button>
            </div>
        </Modal>
    );
};

export default PaymentModal;