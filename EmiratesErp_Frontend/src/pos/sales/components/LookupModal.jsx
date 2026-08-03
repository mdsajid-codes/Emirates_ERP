import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { X, Loader, AlertCircle, Printer, Edit, Search, CreditCard, Trash2 } from 'lucide-react';
import { formatPrice } from '../utils';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const TABS = ['All Sales', 'On Delivery', 'Pending', 'Completed'];

const LookupModal = ({ isOpen, onClose, onResumeSale, onRemoveSale }) => {
    const [activeTab, setActiveTab] = useState(TABS[0]);
    const [isPrinting, setIsPrinting] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            axios.get(`${API_URL}/pos/sales`, { headers: { "Authorization": `Bearer ${token}` } })
                .then(res => {
                    setSales(res.data.sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)));
                })
                .catch(err => {
                    console.error("Error fetching sales:", err);
                    setError('Failed to load sales data.');
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    const filteredSales = useMemo(() => {
        let salesToFilter = sales;

        if (activeTab === 'On Delivery') {
            salesToFilter = sales.filter(s => s.status === 'delivering');
        } else if (activeTab === 'Pending') {
            salesToFilter = sales.filter(s => s.paymentStatus !== 'paid');
        } else if (activeTab === 'Completed') {
            salesToFilter = sales.filter(s => s.status === 'completed' && s.paymentStatus === 'paid');
        }

        if (!searchTerm.trim()) {
            return salesToFilter;
        }

        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return salesToFilter.filter(sale =>
            (sale.invoiceNo && sale.invoiceNo.toLowerCase().includes(lowercasedSearchTerm)) ||
            (sale.customerName && sale.customerName.toLowerCase().includes(lowercasedSearchTerm))
        );
    }, [sales, activeTab, searchTerm]);

    const handlePrint = async (saleId) => {
        setIsPrinting(saleId);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/pos/sales/${saleId}/invoice/pdf`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
        } catch (err) {
            console.error("Error fetching invoice PDF:", err);
            alert("Could not load the invoice. Please try again.");
        } finally {
            setIsPrinting(null);
        }
    };

    const handleAction = async (id, action) => {
        if (processingId) return;
        setProcessingId(id);
        try {
            await action(id);
        } catch (error) {
            console.error("Action failed", error);
        } finally {
            setProcessingId(null);
        }
    };


    if (!isOpen) return null;

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center py-16"><Loader className="animate-spin h-8 w-8 text-slate-900" /></div>;
        }
        if (error) {
            return <div className="text-center text-rose-500 py-16 font-semibold"><AlertCircle className="mx-auto h-8 w-8 mb-2" /><p>{error}</p></div>;
        }
        if (filteredSales.length === 0) {
            return <div className="text-center text-slate-400 py-16 text-xs font-medium"><p>No sales records found for '{activeTab}'.</p></div>;
        }

        return (
            <div className="overflow-x-auto h-full">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 sticky top-0 border-b border-slate-200/60 z-10 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <tr>
                            <th className="py-3 px-4">Invoice #</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Total</th>
                            {(activeTab === 'Completed' || activeTab === 'Pending') && <th className="py-3 px-4 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {filteredSales.map(sale => (
                            <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-slate-900">{sale.invoiceNo}</td>
                                <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{new Date(sale.invoiceDate).toLocaleString()}</td>
                                <td className="py-3 px-4 font-semibold text-slate-800">{sale.customerName || 'Walk-in Customer'}</td>
                                <td className="py-3 px-4">
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${sale.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                        {sale.status} ({sale.paymentStatus})
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right font-extrabold text-slate-900">{formatPrice(sale.totalCents)}</td>
                                {activeTab === 'Completed' && (
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button onClick={() => handlePrint(sale.id)} className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Print Invoice" disabled={isPrinting === sale.id}>
                                                {isPrinting === sale.id ? <Loader className="animate-spin h-4 w-4" /> : <Printer size={15} />}
                                            </button>
                                        </div>
                                    </td>
                                )}
                                {activeTab === 'Pending' && (
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button onClick={() => handleAction(sale.id, onResumeSale)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" title="Resume and Pay" disabled={!!processingId}>
                                                {processingId === sale.id ? <Loader className="animate-spin h-4 w-4" /> : <CreditCard size={15} />}
                                            </button>
                                            <button onClick={() => handleAction(sale.id, onRemoveSale)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Remove Sale" disabled={!!processingId}>
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-3 sm:p-5" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full h-full flex flex-col overflow-hidden border border-slate-100" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Lookup Sales Orders</h3>
                        <p className="text-xs text-slate-500">View transaction history, print receipts, and resume parked sales.</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 py-2 border-b border-slate-100 bg-slate-50/30 flex gap-2 flex-shrink-0 overflow-x-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${activeTab === tab
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="px-6 py-3 border-b border-slate-100 flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Invoice # or Customer Name..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-medium shadow-xs outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 transition-all"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">{renderContent()}</div>
            </div>
        </div>
    );
};

export default LookupModal;