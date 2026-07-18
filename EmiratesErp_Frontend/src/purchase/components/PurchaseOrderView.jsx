import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader, Printer, ArrowLeft, Mail, Paperclip,
    FileText, Edit, ChevronDown, Check, Download,
    Send, Box, MapPin, Calendar, Hash, ShieldCheck,
    Info, ExternalLink, BadgeCheck, FileDigit, Truck,
    Calculator
} from 'lucide-react';

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
    const { id } = useParams();
    const navigate = useNavigate();
    const [po, setPo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [showMore, setShowMore] = useState(false);
    const [isLetterHead, setIsLetterHead] = useState(false);
    const [tenantInfo, setTenantInfo] = useState({ name: 'Transcold Air conditioner spare parts trading llc', address: 'Abu Dhabi', logo: '/logo.png' });
    const [supplierInfo, setSupplierInfo] = useState(null);

    useEffect(() => {
        if (!id) return;
        const load = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get(`${API_URL}/purchases/orders/${id}`, { headers });
                const data = res.data;
                setPo(data);

                const tenantId = localStorage.getItem('tenantId');
                if (tenantId) {
                    try {
                        const tRes = await axios.get(`${API_URL}/tenants/${tenantId}`, { headers });
                        setTenantInfo(tRes.data);
                    } catch (terr) { console.warn('Tenant load fail', terr); }
                }

                if (data.supplierId) {
                    try {
                        const sRes = await axios.get(`${API_URL}/parties/${data.supplierId}`, { headers });
                        setSupplierInfo(sRes.data);
                    } catch (serr) { console.warn('Supplier load fail', serr); }
                }
            } catch (err) {
                console.error('Failed to load PO', err);
                setError('System failed to extract manifest. Please verify connectivity.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-slate-50 gap-6">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={32} />
                </div>
                <div className="text-center">
                    <p className="text-lg font-black text-slate-800 tracking-tight">Synchronizing Manifest</p>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Connecting to Secure Vault</p>
                </div>
            </div>
        );
    }

    if (!po) return <div className="p-12 text-center text-rose-500 font-black uppercase tracking-widest">{error || 'Manifest Not Found'}</div>;

    const totalAmountWords = numberToWords(Math.floor(po.totalAmount || 0));

    return (
        <div className="bg-slate-50 min-h-screen pb-24 print:bg-white print:pb-0 font-sans">
            {/* Top Navigation & Status Bar - Hidden in Print */}
            <div className="print:hidden sticky top-0 z-50">
                <div className="bg-white/80 backdrop-blur-xl border-b border-white px-8 py-3 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Manifest</span>
                            <ChevronDown size={10} />
                            <span className="text-indigo-600">PO-{po.poNumber}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Authorized</span>
                        </div>
                        <Link to="/purchase-dashboard/purchase-orders/new" className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
                            Create New
                        </Link>
                    </div>
                </div>

                <div className="px-8 py-6 bg-white border-b border-slate-100 flex flex-wrap gap-3 items-center shadow-sm">
                    <Link to={`/purchase-dashboard/purchase-orders/edit/${po.id}`} className="group flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm">
                        <Edit size={16} className="group-hover:scale-110 transition-transform" /> Edit Manifest
                    </Link>

                    <button className="group flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:border-rose-200 hover:text-rose-600 transition-all shadow-sm">
                        <Download size={16} className="group-hover:translate-y-0.5 transition-transform" /> PDF Export
                    </button>

                    <button onClick={() => { setIsLetterHead(false); setTimeout(handlePrint, 100); }} className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95">
                        <Printer size={16} className="group-hover:rotate-12 transition-transform" /> Quick Print
                    </button>

                    <button onClick={() => { setIsLetterHead(true); setTimeout(handlePrint, 100); }} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                        <ShieldCheck size={16} /> Letterhead Print
                    </button>

                    <div className="relative">
                        <button onClick={() => setShowMore(!showMore)} className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm">
                            Workflows <ChevronDown size={14} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {showMore && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 mt-3 w-64 bg-white/95 backdrop-blur-xl border border-white shadow-2xl rounded-3xl py-4 z-50"
                                >
                                    <button onClick={() => navigate(`/purchase-dashboard/purchase-orders/${id}/grn/new`)} className="flex items-center gap-3 w-full text-left px-6 py-3 hover:bg-slate-50 text-sm font-bold text-slate-700 transition-colors">
                                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Check size={14} /></div> Receive Inventory (GRN)
                                    </button>
                                    <div className="h-px bg-slate-100 mx-4 my-2" />
                                    <button onClick={() => navigate('/purchase-dashboard/bills/new', { state: { fromPo: po } })} className="flex items-center gap-3 w-full text-left px-6 py-3 hover:bg-blue-50 text-sm font-bold text-blue-600 transition-colors">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileDigit size={14} /></div> Finalize Bill
                                    </button>
                                    <button onClick={() => navigate('/purchase-dashboard/payments/new', { state: { fromPo: po } })} className="flex items-center gap-3 w-full text-left px-6 py-3 hover:bg-amber-50 text-sm font-bold text-amber-600 transition-colors">
                                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Send size={14} /></div> Initiate Payment
                                    </button>
                                    <button onClick={() => navigate('/purchase-dashboard/additional-expenses/new', { state: { fromPo: po } })} className="flex items-center gap-3 w-full text-left px-6 py-3 hover:bg-purple-50 text-sm font-bold text-purple-600 transition-colors">
                                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Calculator size={14} /></div> Additional Expenses
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* DOCUMENT AREA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[210mm] mx-auto mt-12 bg-white shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] print:shadow-none print:mt-0 print:w-full print:max-w-none border border-slate-100 p-16 min-h-[297mm] text-slate-800 relative rounded-[2.5rem] print:rounded-none"
            >
                {/* Visual Accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-indigo-600 rounded-b-xl print:hidden" />

                {/* Ribbon Status - Hidden in Print */}
                <div className="absolute top-12 right-12 flex flex-col items-end print:hidden">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 text-[10px] font-black uppercase tracking-widest mb-2">
                        <BadgeCheck size={12} /> Authenticated
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Procurement v2.4</p>
                </div>

                {/* Header Section */}
                {!isLetterHead && (
                    <div className="flex justify-between items-start mb-16 pb-12 border-b-2 border-slate-100">
                        <div className="flex gap-8 items-center">
                            {tenantInfo.logo ? (
                                <div className="w-24 h-24 bg-slate-50 border border-slate-100 p-4 flex items-center justify-center rounded-3xl shadow-inner">
                                    <img src={tenantInfo.logo.startsWith('/') ? tenantInfo.logo : `${API_URL}/uploads/${tenantInfo.logo}`} alt="Logo" className="max-w-full max-h-full transition-all" onError={(e) => e.target.style.display = 'none'} />
                                </div>
                            ) : (
                                <div className="w-24 h-24 bg-indigo-600 flex items-center justify-center rounded-3xl shadow-xl shadow-indigo-200">
                                    <Box size={40} className="text-white" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">{tenantInfo.companyName || tenantInfo.name}</h1>
                                <p className="mt-3 text-xs font-bold text-slate-400 leading-relaxed max-w-sm">
                                    {tenantInfo.address || tenantInfo.location || 'Global Headquarters'}<br />
                                    {tenantInfo.email && <span className="lowercase text-indigo-500">{tenantInfo.email}</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Manifest Metadata */}
                <div className="grid grid-cols-2 gap-16 mb-16">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-8 leading-none">
                            Purchase<br /><span className="text-indigo-600">Manifest</span>
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                    <Hash size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Master Order ID</p>
                                    <p className="text-sm font-black text-slate-700">PO-{po.poNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Authorization Date</p>
                                    <p className="text-sm font-black text-slate-700">{po.date ? new Date(po.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 shadow-inner">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization Index</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-400">Enterprise TRN</span>
                                <span className="font-black text-slate-700">{tenantInfo.trnNumber || tenantInfo.taxId || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-400">Reference Protocol</span>
                                <span className="font-black text-slate-700">{po.reference || 'DIRECT-PROC'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-400">Origin Node</span>
                                <span className="font-black text-slate-700">{po.branchName || 'Central Hub'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-2 gap-16 mb-16">
                    <div>
                        <div className="flex items-center gap-2 mb-4 border-b border-indigo-50 pb-2">
                            <Truck size={14} className="text-indigo-400" />
                            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Supply Partner</h4>
                        </div>
                        <div className="bg-white p-2 rounded-2xl">
                            <h5 className="text-lg font-black text-slate-800 mb-2">{supplierInfo ? (supplierInfo.companyName || supplierInfo.name) : po.supplierName}</h5>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed whitespace-pre-wrap">
                                {supplierInfo ? (
                                    <>
                                        {supplierInfo.addressLine1} {supplierInfo.addressLine2}<br />
                                        {supplierInfo.city}, {supplierInfo.state} {supplierInfo.country}<br />
                                        {supplierInfo.phone && <span className="text-slate-400 mt-1 block">Contact: {supplierInfo.phone}</span>}
                                    </>
                                ) : (po.supplierAddress || 'Verified Address Undefined')}
                            </p>
                            <div className="mt-4 px-3 py-1 bg-slate-50 rounded-lg inline-block text-[10px] font-black text-slate-400 uppercase border border-slate-100">
                                TRN: {supplierInfo ? (supplierInfo.trnNumber || supplierInfo.taxId) : (po.supplierTrn || '-')}
                            </div>
                        </div>
                    </div>

                    {po.deliverToAddress && (
                        <div>
                            <div className="flex items-center gap-2 mb-4 border-b border-rose-50 pb-2">
                                <MapPin size={14} className="text-rose-400" />
                                <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Fulfillment Endpoint</h4>
                            </div>
                            <div className="bg-rose-50 flex items-start gap-4 p-6 rounded-[1.5rem] border border-rose-100">
                                <div className="p-3 bg-white rounded-xl shadow-sm"><MapPin size={24} className="text-rose-500" /></div>
                                <p className="text-xs font-bold text-rose-800 leading-relaxed whitespace-pre-wrap">{po.deliverToAddress}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Items Table */}
                <div className="mb-16 border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-400">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest w-12 text-center">#</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Item Specification</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Protocol</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Unit Rate</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Tax</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Net Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(po.items || []).map((it, i) => {
                                const qty = Number(it.quantity) || 0;
                                const rate = Number(it.rate) || 0;
                                const disc = Number(it.lineDiscount) || 0;
                                const taxPct = Number(it.taxPercent) || 0;
                                const netAmount = (qty * rate) - disc;
                                const taxAmt = netAmount * (taxPct / 100);
                                const total = netAmount + taxAmt;

                                return (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-8 text-xs font-black text-slate-300 text-center">{it.lineNumber || i + 1}</td>
                                        <td className="px-8 py-8">
                                            <div className="text-sm font-black text-slate-800 mb-1">{it.itemName}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-relaxed">{it.description || 'Enterprise Standard Logistics'}</div>
                                        </td>
                                        <td className="px-6 py-8 text-center">
                                            <span className="text-xs font-black text-slate-700">{qty}</span>
                                            <span className="ml-1.5 text-[10px] font-black text-slate-400 uppercase">{it.unitName || 'UNITS'}</span>
                                        </td>
                                        <td className="px-6 py-8 text-right font-bold text-sm text-slate-700 tabular-nums">{rate.toFixed(2)}</td>
                                        <td className="px-6 py-8 text-center">
                                            <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded inline-block">{taxPct}%</div>
                                        </td>
                                        <td className="px-8 py-8 text-right font-black text-sm text-slate-900 tabular-nums">{total.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer Analysis Section */}
                <div className="grid grid-cols-12 gap-16">
                    {/* Legal & Intelligence (8 cols) */}
                    <div className="col-span-12 lg:col-span-7 flex flex-col justify-between space-y-8">
                        <div className="p-8 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-indigo-500 shadow-sm shadow-indigo-100"><Info size={24} /></div>
                            <div>
                                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Procurement Intelligence</h4>
                                <p className="text-xs font-bold text-indigo-700/60 italic leading-relaxed">
                                    "Total manifest value of <span className="font-black text-indigo-800">{(po.totalAmount || 0).toFixed(2)} {po.currency}</span> is validated against enterprise tax protocols. This document serves as a binding procurement authorization."
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {(po.notes || po.termsAndConditions) && (
                                <div className="grid grid-cols-2 gap-8">
                                    {po.notes && (
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Operational Notes</p>
                                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed whitespace-pre-wrap">{po.notes}</p>
                                        </div>
                                    )}
                                    {po.termsAndConditions && (
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Compliance Terms</p>
                                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed whitespace-pre-wrap">{po.termsAndConditions}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Authenticated Total In Words</p>
                                <p className="text-xs font-black text-slate-700 uppercase tracking-tight italic bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-center">
                                    {totalAmountWords} {po.currency} Only
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary & Auth (5 cols) */}
                    <div className="col-span-12 lg:col-span-5 flex flex-col">
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200">
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Gross Manifest</span>
                                    <span className="text-white">{(Number(po.subTotal || 0) + Number(po.totalDiscount || 0)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                                    <span>Consolidated Savings</span>
                                    <span>- {Number(po.totalDiscount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Fiscal Levies (VAT)</span>
                                    <span className="text-white">+ {Number(po.totalTax || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Logistics Surcharge</span>
                                    <span className="text-white">{(Number(po.otherCharges || 0)).toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Net Payable</span>
                                    <span className="text-3xl font-black text-white tracking-tighter tabular-nums leading-none mt-1">
                                        {Number(po.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="px-3 py-1 bg-white/10 rounded-lg text-white text-[10px] font-black uppercase border border-white/20">
                                    {po.currency}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 text-center">
                            <div className="w-48 h-px bg-slate-200 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Authorized Protocol</p>
                            <p className="text-xs font-black text-slate-900 mt-2 uppercase tracking-widest">{tenantInfo.companyName || tenantInfo.name}</p>
                            <div className="mt-4 flex justify-center gap-1 opacity-20">
                                <ShieldCheck size={16} />
                                <BadgeCheck size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Footer Page Numbering Placeholder */}
                <div className="hidden print:block absolute bottom-12 right-12 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Page 1 of 1
                </div>
            </motion.div>

            {/* Float Actions - Hidden in Print */}
            <div className="fixed bottom-8 right-8 flex flex-col gap-3 print:hidden">
                <button onClick={() => navigate(`/purchase-dashboard/purchase-orders/edit/${po.id}`)} className="p-4 bg-white text-indigo-600 rounded-full shadow-2xl border border-indigo-50 hover:scale-110 active:scale-95 transition-all group">
                    <Edit size={24} className="group-hover:rotate-12 transition-transform" />
                </button>
                <button onClick={handlePrint} className="p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group">
                    <Printer size={24} className="group-hover:-rotate-12 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default PurchaseOrderView;
