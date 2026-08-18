import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ArrowRight, Loader, Printer, Edit2, Trash2, CheckCircle, XCircle, FileText, Target, Box, BadgeCheck, User, Calendar, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const RequisitionView = () => {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const { id } = useParams();
    const [requisition, setRequisition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRequisition = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/purchases/requisitions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequisition(res.data);
        } catch (err) {
            console.error(err);
            setError(isRTL ? 'فشل في تحميل تفاصيل طلب الشراء.' : 'Failed to load requisition details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequisition();
    }, [id]);

    const handleUpdateStatus = async (newStatus) => {
        if (!window.confirm(isRTL ? `هل تريد تغيير الحالة إلى ${newStatus}؟` : `Are you sure you want to change the status to ${newStatus}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/purchases/requisitions/${id}/status`, null, {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: newStatus }
            });
            fetchRequisition();
        } catch (err) {
            console.error(err);
            alert(isRTL ? 'فشل تحديث الحالة.' : 'Failed to update status.');
        }
    };

    const handleConvertToPO = () => {
        if (!window.confirm(isRTL ? 'تحويل طلب الشراء إلى أمر شراء مباشر؟' : 'Convert this Requisition to a Purchase Order?')) return;
        navigate(`/purchase-dashboard/purchase-orders/new`, { 
            state: { requisitionData: requisition } 
        });
    };

    const handleConvertToTendering = () => {
        if (!window.confirm(isRTL ? 'تحويل طلب الشراء إلى مناقصة توريد؟' : 'Convert this Requisition to a Supplier Tendering?')) return;
        navigate(`/purchase-dashboard/supplier-tendering/new`, { 
            state: { requisitionData: requisition } 
        });
    };

    const handleDelete = async () => {
        if (!window.confirm(isRTL ? 'هل أنت تأكد من حذف طلب الشراء؟' : 'Are you sure you want to delete this requisition?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/purchases/requisitions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/purchase-dashboard/requisitions');
        } catch (err) {
            console.error(err);
            alert(isRTL ? 'فشل في حذف الطلب.' : 'Failed to delete requisition.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-[#F8FAFC]">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-[#00A9A8] rounded-full animate-spin mb-3" />
                <p className="text-sm font-bold text-[#0A2551]">{isRTL ? 'جاري تحميل تفاصيل طلب الشراء...' : 'Loading Requisition Details...'}</p>
            </div>
        );
    }

    if (error || !requisition) {
        return <div className="p-12 text-center text-rose-600 font-bold">{error || (isRTL ? 'لم يتم العثور على طلب الشراء.' : 'Requisition not found.')}</div>;
    }

    const status = requisition.status || 'DRAFT';

    return (
        <div className="bg-[#F7F9FD] min-h-screen text-[#0A2551] font-sans pb-10 -mt-3 lg:-mt-4 -mx-3 lg:-mx-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Top Action Header Bar */}
            <div className="sticky top-0 z-50 bg-white border-b border-[#DFE7F4] px-6 py-2.5 flex items-center justify-between shadow-xs">
                <button onClick={() => navigate('/purchase-dashboard/requisitions')} className="flex items-center gap-2 text-xs font-bold text-[#102A5B] hover:text-[#00A9A8] transition-colors cursor-pointer">
                    {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                    <span>{isRTL ? 'الرجوع للقائمة' : 'Back to Requisitions List'}</span>
                </button>

                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => window.print()} className="px-3 py-1.5 border border-[#DFE7F4] rounded-lg text-xs font-semibold text-[#102A5B] hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer">
                        <Printer size={14} />
                        <span>{isRTL ? 'طباعة' : 'Print'}</span>
                    </button>

                    <button onClick={() => navigate(`/purchase-dashboard/requisitions/edit/${id}`)} className="px-3 py-1.5 border border-[#DFE7F4] rounded-lg text-xs font-semibold text-[#102A5B] hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer">
                        <Edit2 size={14} />
                        <span>{isRTL ? 'تعديل' : 'Edit'}</span>
                    </button>

                    {status !== 'APPROVED' && status !== 'COMPLETED' && (
                        <button onClick={() => handleUpdateStatus('APPROVED')} className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer">
                            <CheckCircle size={14} />
                            <span>{isRTL ? 'اعتماد الطلب' : 'Approve'}</span>
                        </button>
                    )}

                    {status !== 'REJECTED' && status !== 'COMPLETED' && (
                        <button onClick={() => handleUpdateStatus('REJECTED')} className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer">
                            <XCircle size={14} />
                            <span>{isRTL ? 'رفض الطلب' : 'Reject'}</span>
                        </button>
                    )}

                    {(status === 'APPROVED' || status === 'COMPLETED') && (
                        <>
                            <button onClick={handleConvertToPO} className="px-4 py-1.5 bg-[#00A9A8] text-white rounded-lg text-xs font-bold hover:bg-[#008f8e] transition-colors flex items-center gap-1.5 cursor-pointer">
                                <FileText size={14} />
                                <span>{isRTL ? 'تحويل إلى أمر شراء' : 'Convert to PO'}</span>
                            </button>
                            <button onClick={handleConvertToTendering} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer">
                                <Target size={14} />
                                <span>{isRTL ? 'تحويل إلى مناقصة' : 'Convert to Tendering'}</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="w-full px-4 lg:px-6 space-y-4">
                {/* Hero Header Banner */}
                <div className="bg-white border border-[#DFE7F4] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#00A9A8] rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
                            <Box size={30} strokeWidth={2.2} />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-[#617191] uppercase tracking-wider block">{isRTL ? 'طلب شراء مواد' : 'PURCHASE REQUISITION'}</span>
                            <h1 className="text-2xl font-black text-[#0A2551] tracking-tight leading-none mt-0.5">{requisition.requisitionNumber || `REQ-${requisition.id}`}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-3 py-0.5 bg-[#DCFAEE] text-[#138764] rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    <BadgeCheck size={12} /> {status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs border-l rtl:border-l-0 rtl:border-r border-[#DFE7F4] pl-6 rtl:pr-6">
                        <div>
                            <span className="text-[#617191] font-medium block">{isRTL ? 'المطلوب بواسطة' : 'Requested By'}</span>
                            <span className="font-bold text-[#0A2551]">{requisition.requestedBy || '-'}</span>
                        </div>
                        <div>
                            <span className="text-[#617191] font-medium block">{isRTL ? 'تاريخ الطلب' : 'Requisition Date'}</span>
                            <span className="font-bold text-[#0A2551]">{requisition.requisitionDate ? new Date(requisition.requisitionDate).toLocaleDateString() : '-'}</span>
                        </div>
                        <div>
                            <span className="text-[#617191] font-medium block">{isRTL ? 'التاريخ المطلوب' : 'Required Date'}</span>
                            <span className="font-bold text-[#0A2551]">{requisition.requiredDate ? new Date(requisition.requiredDate).toLocaleDateString() : '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Details Meta Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-white border border-[#DFE7F4] rounded-xl p-3.5 shadow-xs">
                        <span className="text-[10px] font-bold text-[#617191] uppercase block mb-1">{isRTL ? 'الكيان المؤسسي' : 'Entity'}</span>
                        <span className="text-xs font-bold text-[#0A2551]">{requisition.entity || '-'}</span>
                    </div>
                    <div className="bg-white border border-[#DFE7F4] rounded-xl p-3.5 shadow-xs">
                        <span className="text-[10px] font-bold text-[#617191] uppercase block mb-1">{isRTL ? 'المستلم' : 'Recipient'}</span>
                        <span className="text-xs font-bold text-[#0A2551]">{requisition.recipient || '-'}</span>
                    </div>
                    <div className="bg-white border border-[#DFE7F4] rounded-xl p-3.5 shadow-xs">
                        <span className="text-[10px] font-bold text-[#617191] uppercase block mb-1">{isRTL ? 'الأساس' : 'Basis'}</span>
                        <span className="text-xs font-bold text-[#0A2551]">{requisition.basis || '-'}</span>
                    </div>
                    <div className="bg-white border border-[#DFE7F4] rounded-xl p-3.5 shadow-xs">
                        <span className="text-[10px] font-bold text-[#617191] uppercase block mb-1">{isRTL ? 'إجمالي الأصناف' : 'Total Items'}</span>
                        <span className="text-xs font-bold text-[#00A9A8]">{requisition.items?.length || 0}</span>
                    </div>
                </div>

                {/* Items Specification Table Card */}
                <div className="bg-white border border-[#DFE7F4] rounded-2xl shadow-xs overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-[#DFE7F4] bg-[#F8FAFC] flex justify-between items-center">
                        <h3 className="text-xs font-bold text-[#0A2551] uppercase tracking-wider">{isRTL ? 'جدول الأصناف المطلوبة' : 'Requisition Items Specification'}</h3>
                        <span className="text-[11px] font-semibold text-[#617191]">{isRTL ? `${requisition.items?.length || 0} أصناف` : `${requisition.items?.length || 0} Items`}</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr className="bg-[#F2F6FC] border-b border-[#DFE7F4] text-[#617191] uppercase text-[10.5px] font-bold">
                                    <th className="p-3 text-left rtl:text-right">#</th>
                                    <th className="p-3 text-left rtl:text-right">{isRTL ? 'نوع المورد' : 'Resource Type'}</th>
                                    <th className="p-3 text-left rtl:text-right">{isRTL ? 'تفاصيل الصنف' : 'Item Details'}</th>
                                    <th className="p-3 text-left rtl:text-right">{isRTL ? 'المواصفات' : 'Specification / Content'}</th>
                                    <th className="p-3 text-center">{isRTL ? 'الكمية' : 'Qty'}</th>
                                    <th className="p-3 text-center">{isRTL ? 'الوحدة' : 'UOM'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DFE7F4]">
                                {(requisition.items || []).map((item, idx) => (
                                    <tr key={item.id || idx} className="hover:bg-slate-50/60">
                                        <td className="p-3 font-bold text-[#0A2551]">{idx + 1}</td>
                                        <td className="p-3 font-semibold text-[#617191]">{item.resourceType || '-'}</td>
                                        <td className="p-3">
                                            <div className="font-bold text-[#0A2551]">{item.itemName || '-'}</div>
                                            {item.comment && <div className="text-[11px] text-[#00A9A8] font-medium mt-0.5">{item.comment}</div>}
                                        </td>
                                        <td className="p-3 font-medium text-[#617191]">{item.content || '-'}</td>
                                        <td className="p-3 text-center font-bold text-[#0A2551]">{item.quantity}</td>
                                        <td className="p-3 text-center font-semibold text-[#617191]">{item.uom || 'PCS'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Remarks & Logs */}
                <div className="bg-white border border-[#DFE7F4] rounded-2xl p-4 shadow-xs space-y-2">
                    <h4 className="text-xs font-bold text-[#0A2551] uppercase tracking-wider">{isRTL ? 'ملاحظات وتعليقات الطلب' : 'Operational Remarks & Notes'}</h4>
                    <p className="text-xs text-[#617191] bg-[#F8FAFC] p-3 rounded-xl border border-[#DFE7F4] font-medium">
                        {requisition.comment || (isRTL ? 'لا توجد ملاحظات إضافية مسجلة.' : 'No operational remarks recorded.')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RequisitionView;
