import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader, ArrowLeft, ArrowRight, Send, CheckCircle, Target, FileText, Plus, X, Box, BadgeCheck, User, Calendar, ShieldCheck, Printer, Edit2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const RfqResponseModal = ({ rfq, tendering, onClose, onSuccess }) => {
    const { isRTL } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [prices, setPrices] = useState({});
    const [comments, setComments] = useState({});
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const itemsPayload = rfq.items.map(it => ({
                tenderingItemId: it.tenderingItemId,
                price: prices[it.tenderingItemId] || 0,
                comment: comments[it.tenderingItemId] || ''
            }));
            
            const answersPayload = (tendering.questions || []).map(q => ({
                questionId: q.id,
                answer: answers[q.id] || ''
            }));

            const payload = {
                validTill: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
                items: itemsPayload,
                answers: answersPayload
            };

            await axios.post(`${API_URL}/purchases/rfq-response/rfq/${rfq.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || (isRTL ? 'فشل في إرسال استجابة عرض السعر' : 'Failed to submit response'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-[#DFE7F4]">
                <div className="flex justify-between items-center p-4 border-b border-[#DFE7F4] bg-[#F8FAFC]">
                    <h2 className="text-base font-bold text-[#0A2551]">
                        {isRTL ? `إدخال عرض السعر للمورد: ${rfq.supplierName}` : `Enter Response for ${rfq.supplierName}`}
                    </h2>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"><X size={18}/></button>
                </div>
                
                <div className="p-5 overflow-y-auto flex-1 space-y-4">
                    {error && <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs font-semibold">{error}</div>}
                    <form id="responseForm" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <h3 className="font-bold text-xs text-[#0A2551] uppercase tracking-wider mb-3 border-b border-[#DFE7F4] pb-2">{isRTL ? 'تسعير أصناف المناقصة' : 'Item Pricing'}</h3>
                            <div className="space-y-3">
                                {rfq.items?.map(it => (
                                    <div key={it.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center bg-[#F8FAFC] p-3 rounded-xl border border-[#DFE7F4] text-xs">
                                        <div className="md:col-span-1 border-r rtl:border-r-0 rtl:border-l border-[#DFE7F4] pr-2 rtl:pl-2">
                                            <div className="font-bold text-[#0A2551]">{it.itemName}</div>
                                            <div className="text-[10px] font-medium text-[#617191]">{isRTL ? `الكمية المطلوب: ${it.quantity} ${it.uom}` : `Req Qty: ${it.quantity} ${it.uom}`}</div>
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="block text-[10px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'سعر الوحدة (AED)' : 'Unit Price (AED)'}</label>
                                            <input 
                                                type="number" step="0.01" min="0" required
                                                value={prices[it.tenderingItemId] || ''} 
                                                onChange={e => setPrices(p => ({...p, [it.tenderingItemId]: e.target.value}))}
                                                className="w-full px-3 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-bold text-[#0A2551]" 
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'ملاحظات / مواصفات المورد' : 'Comments / Specs'}</label>
                                            <input 
                                                type="text" 
                                                value={comments[it.tenderingItemId] || ''} 
                                                onChange={e => setComments(c => ({...c, [it.tenderingItemId]: e.target.value}))}
                                                className="w-full px-3 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-medium text-[#0A2551]" 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>
                
                <div className="p-4 border-t border-[#DFE7F4] bg-[#F8FAFC] flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-[#DFE7F4] rounded-lg text-xs font-semibold text-[#102A5B] bg-white hover:bg-slate-50 cursor-pointer">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                    <button type="submit" form="responseForm" disabled={loading} className="px-5 py-2 bg-[var(--color-primary,#00A9A8)] text-white rounded-lg text-xs font-bold hover:bg-[#008f8e] cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
                        {loading ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14}/>}
                        <span>{isRTL ? 'إرسال العرض' : 'Submit Response'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const SupplierTenderingView = () => {
    const { id } = useParams();
    const [tendering, setTendering] = useState(null);
    const [rfqs, setRfqs] = useState([]);
    const [responses, setResponses] = useState({});
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [comparisonData, setComparisonData] = useState(null);

    const [modalRfq, setModalRfq] = useState(null); // The RFQ to show the response modal for
    
    const statusClass = (s) => {
        if (!s) return 'bg-slate-100 text-slate-800';
        switch (s.toUpperCase()) {
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'REQUESTS_FOR_QUOTATION': return 'bg-blue-100 text-blue-800';
            case 'RFQ_RESPONSES': return 'bg-indigo-100 text-indigo-800';
            case 'COMPARISON': return 'bg-purple-100 text-purple-800';
            case 'COMPARISON_COMPLETED': return 'bg-emerald-100 text-emerald-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const formatStatus = (s) => {
        if (!s) return 'N/A';
        return s.replace(/_/g, ' ');
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const tenderingRes = await axios.get(`${API_URL}/purchases/supplier-tendering/${id}`, { headers });
            setTendering(tenderingRes.data);

            const comparisonRes = await axios.get(`${API_URL}/purchases/supplier-tendering/${id}/comparison`, { headers }).catch(() => ({data: null}));
            if(comparisonRes.data) {
                setComparisonData(comparisonRes.data);
                // The backend comparison endpoint side-effects the status to COMPARISON
                // We update the local state to stay in sync without another fetch
                setTendering(prev => ({...prev, status: 'COMPARISON'}));
            }

            // Fetch RFQs for this tendering
            const rfqsRes = await axios.get(`${API_URL}/purchases/rfq/tendering/${id}`, { headers }).catch(() => ({data: []}));
            const rfqsData = rfqsRes.data || [];
            setRfqs(rfqsData);

            // Fetch Responses for existing RFQs
            const respMap = {};
            for (const rfq of rfqsData) {
                try {
                    const respRes = await axios.get(`${API_URL}/purchases/rfq-response/rfq/${rfq.id}`, { headers });
                    if (respRes.data) {
                        respMap[rfq.supplierId] = respRes.data;
                    }
                } catch(e) {
                    // 404 means no response yet, ignore
                }
            }
            setResponses(respMap);

        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load tendering details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const sendRfqToSupplier = async (supplierId) => {
        if (!supplierId) {
            alert('Supplier ID is missing. Please edit the tendering and select a supplier.');
            return;
        }
        if (!window.confirm('Send RFQ to this supplier?')) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Build the RFQ payload matching the new DTO structure. No items needed in payload if the backend generates them from tendering
            // Looking at the controller, we only need to pass a potentially empty request body if it pulls items from tendering. 
            // We'll pass an empty object or whatever PurRequestForQuotationRequest expects.
            await axios.post(`${API_URL}/purchases/rfq/tendering/${id}/supplier/${supplierId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('RFQ Sent Successfully');
            loadData(); // Refresh everything
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to send RFQ');
        } finally {
            setActionLoading(false);
        }
    };

    const handleConvertToPO = async () => {
        if (!window.confirm('Generate Purchase Orders for all suppliers with responses?')) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/purchase/orders/convert-from-tendering/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const poNumbers = (res.data || []).map(po => po.poNumber).join(', ');
            alert(`${res.data.length} Purchase Order(s) created successfully: ${poNumbers}`);
            loadData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to convert to PO');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" size={32} /></div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!tendering) return <div className="p-6">Not Found</div>;

    const { tenderNumber, status, requiredDate, project, entity, transactionType, initiatedBy } = tendering;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        Tendering: {tenderNumber}
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass(status)}`}>
                            {formatStatus(status)}
                        </span>
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Link to="/purchase-dashboard/supplier-tendering" className="btn-secondary-sm flex items-center gap-1"><ArrowLeft size={16}/> Back</Link>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded shadow">
                <div><span className="text-xs text-slate-500 block">Type</span><span className="font-semibold">{tendering.transactionType || '-'}</span></div>
                <div><span className="text-xs text-slate-500 block">Required Date</span><span className="font-semibold">{tendering.requiredDate ? new Date(tendering.requiredDate).toLocaleDateString() : '-'}</span></div>
                <div><span className="text-xs text-slate-500 block">Initiated By</span><span className="font-semibold">{tendering.initiatedBy || '-'}</span></div>
                <div><span className="text-xs text-slate-500 block">Project</span><span className="font-semibold">{tendering.project || '-'}</span></div>
                <div><span className="text-xs text-slate-500 block">Entity</span><span className="font-semibold">{tendering.entity || '-'}</span></div>
                <div><span className="text-xs text-slate-500 block">Currency</span><span className="font-semibold">{tendering.tenderingCurrency || '-'}</span></div>
                <div><span className="text-xs text-slate-500 block">Basis (Type / ID)</span><span className="font-semibold">{tendering.basisType || '-'} / {tendering.basisId || '-'}</span></div>
                <div><span className="text-xs text-slate-500 block">Warehouse ID</span><span className="font-semibold">{tendering.warehouseId || '-'}</span></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {/* Items */}
                    <div className="bg-white rounded shadow flex flex-col">
                        <div className="bg-slate-50 p-3 font-semibold border-b">Items Required</div>
                        <ul className="divide-y p-3">
                            {tendering.items?.map(it => (
                                <li key={it.id} className="py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                    <div>
                                        <div className="font-medium text-slate-800">
                                            {it.lineNumber && <span className="text-slate-400 mr-2">#{it.lineNumber}</span>}
                                            {it.itemName}
                                        </div>
                                        {it.content && <div className="text-xs text-slate-500 mt-0.5">{it.content}</div>}
                                    </div>
                                    <span className="text-slate-600 font-medium whitespace-nowrap mt-1 sm:mt-0 bg-slate-100 px-2 py-1 rounded text-sm">
                                        Qty: {it.quantity} {it.uom}
                                    </span>
                                </li>
                            ))}
                            {!tendering.items?.length && <p className="text-slate-400 py-2">No items</p>}
                        </ul>
                    </div>

                    {/* Questions */}
                    {tendering.questions?.length > 0 && (
                        <div className="bg-white rounded shadow flex flex-col">
                            <div className="bg-slate-50 p-3 font-semibold border-b">Pre-Qualification Questions</div>
                            <ul className="divide-y p-3">
                                {tendering.questions.map((q, i) => (
                                    <li key={q.id || i} className="py-2 text-sm text-slate-700">
                                        Q{i+1}: {q.questionText}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Suppliers & RFQs */}
                <div className="bg-white rounded shadow flex flex-col">
                    <div className="bg-slate-50 p-3 font-semibold border-b">Invited Suppliers & RFQs</div>
                    <ul className="divide-y p-3">
                        {tendering.suppliers?.map(sup => {
                            const rfq = rfqs.find(r => r.supplierId === sup.supplierId);
                            const response = responses[sup.supplierId];

                            return (
                                <li key={sup.id} className="py-3 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium">{sup.supplierName} {sup.contractType && <span className="font-normal text-xs text-slate-400 ml-1">({sup.contractType})</span>}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">Contact: {sup.contactPerson || '-'} | Email: {sup.email || '-'}</div>
                                            {rfq && <div className="text-xs text-blue-600 mt-1 flex items-center gap-1"><FileText size={12}/> RFQ: {rfq.rfqNumber}</div>}
                                            {response && <div className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12}/> Resp: {response.responseNumber}</div>}
                                        </div>
                                        <div>
                                            {!rfq && (
                                                <button 
                                                    onClick={() => sendRfqToSupplier(sup.supplierId)}
                                                    disabled={actionLoading}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm flex items-center gap-1 whitespace-nowrap"
                                                >
                                                    <Send size={14}/> Send RFQ
                                                </button>
                                            )}
                                            {rfq && !response && (
                                                <button 
                                                    onClick={() => setModalRfq(rfq)}
                                                    className="px-3 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded text-sm flex items-center gap-1 whitespace-nowrap"
                                                >
                                                    <Plus size={14}/> Enter Response
                                                </button>
                                            )}
                                            {response && (
                                                <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-sm font-medium">Response Received</span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                        {!tendering.suppliers?.length && <p className="text-slate-400 py-2">No suppliers</p>}
                    </ul>
                </div>
            </div>

            {/* Comparison Table */}
            {comparisonData && (comparisonData.itemComparisons?.length > 0) && (
                <div className="bg-white rounded shadow mt-6">
                    <div className="bg-slate-50 p-3 font-semibold border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target size={18}/> Comparison Report
                        </div>
                        <button 
                            onClick={handleConvertToPO}
                            disabled={actionLoading || !rfqs.some(r => responses[r.supplierId]) || status === 'COMPLETED'}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {actionLoading ? <Loader size={14} className="animate-spin"/> : <FileText size={14}/>}
                            Convert to PO
                        </button>
                    </div>
                    <div className="overflow-x-auto p-4">
                        <table className="w-full text-sm text-left border">
                            <thead className="bg-slate-100 uppercase text-xs text-slate-600">
                                <tr>
                                    <th className="p-3 border">Item</th>
                                    <th className="p-3 border">Required Qty</th>
                                    {tendering.suppliers?.map(s => (
                                        <th key={s.supplierId} className="p-3 border">{s.supplierName} (Price)</th>
                                    ))}
                                    <th className="p-3 border font-bold text-green-700">Best Assessed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonData.itemComparisons.map(ic => (
                                    <tr key={ic.tenderingItemId} className="border-b">
                                        <td className="p-3 border font-medium">{ic.itemName}</td>
                                        <td className="p-3 border">{ic.requiredQuantity}</td>
                                        {tendering.suppliers?.map(s => {
                                            const price = ic.supplierPrices?.[s.supplierId] ?? '-';
                                            const isBest = ic.bestSupplierId === s.supplierId;
                                            return (
                                                <td key={s.supplierId} className={`p-3 border ${isBest ? 'bg-green-50 text-green-700 font-bold' : ''}`}>
                                                    {price} {isBest && <CheckCircle size={14} className="inline ml-1" />}
                                                </td>
                                            );
                                        })}
                                        <td className="p-3 border font-bold text-green-700">
                                            {ic.bestSupplierId 
                                                ? tendering.suppliers.find(s=>s.supplierId===ic.bestSupplierId)?.supplierName 
                                                : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modalRfq && (
                <RfqResponseModal 
                    rfq={modalRfq} 
                    tendering={tendering} 
                    onClose={() => setModalRfq(null)} 
                    onSuccess={() => {
                        setModalRfq(null);
                        loadData();
                    }} 
                />
            )}
        </div>
    );
};

export default SupplierTenderingView;

