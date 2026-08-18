import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Save, Loader, ArrowLeft, ArrowRight, ShieldCheck, Box, Package, User, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const RequisitionForm = () => {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [form, setForm] = useState({
        requisitionNumber: '',
        requisitionDate: new Date().toISOString().split('T')[0],
        status: 'DRAFT',
        requestedBy: '',
        recipient: '',
        requiredDate: '',
        entity: '',
        basis: '',
        comment: '',
        items: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [masterItems, setMasterItems] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const tenantRes = await axios.get(`${API_URL}/pos/tenant/current`, { headers });
                const tenantName = tenantRes.data?.name || '';

                const [rawRes, semiRes, fgRes, prodRes] = await Promise.allSettled([
                    axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/production/semi-finished`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/production/finished-goods`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/crm/products`, { headers, params: { page: 0, size: 1000 } })
                ]);

                const combinedItems = [];
                if (rawRes.status === 'fulfilled') combinedItems.push(...(rawRes.value.data.content || rawRes.value.data || []).map(m => ({ ...m, uniqueKey: `RAW-${m.id}`, categoryLabel: 'Raw Material' })));
                if (semiRes.status === 'fulfilled') combinedItems.push(...(semiRes.value.data.content || semiRes.value.data || []).map(m => ({ ...m, uniqueKey: `SEMI-${m.id}`, categoryLabel: 'Semi-Finished' })));
                if (fgRes.status === 'fulfilled') combinedItems.push(...(fgRes.value.data.content || fgRes.value.data || []).map(m => ({ ...m, uniqueKey: `FG-${m.id}`, categoryLabel: 'Finished Good' })));
                if (prodRes.status === 'fulfilled') combinedItems.push(...(prodRes.value.data.content || prodRes.value.data || []).map(m => ({ ...m, uniqueKey: `PROD-${m.id}`, categoryLabel: 'Product' })));
                
                setMasterItems(combinedItems);

                if (isEditing) {
                    const res = await axios.get(`${API_URL}/purchases/requisitions/${id}`, { headers });
                    const data = res.data;
                    setForm({
                        ...data,
                        requisitionDate: data.requisitionDate ? new Date(data.requisitionDate).toISOString().split('T')[0] : '',
                        requiredDate: data.requiredDate ? new Date(data.requiredDate).toISOString().split('T')[0] : '',
                        items: data.items || []
                    });
                } else {
                    setForm(prev => ({ ...prev, entity: tenantName }));
                }
            } catch (err) {
                console.error(err);
                setError(isRTL ? 'فشل في تحميل بيانات طلب الشراء' : 'Failed to load required data.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, isEditing, isRTL]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const addItem = () => {
        setForm(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    resourceType: 'Raw Material',
                    itemId: '',
                    itemName: '',
                    content: '',
                    quantity: 1,
                    uom: 'PCS',
                    comment: ''
                }
            ]
        }));
    };

    const removeItem = (index) => {
        setForm(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        setForm(prev => {
            const updated = [...prev.items];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, items: updated };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            if (isEditing) {
                await axios.put(`${API_URL}/purchases/requisitions/${id}`, form, { headers });
            } else {
                await axios.post(`${API_URL}/purchases/requisitions`, form, { headers });
            }
            navigate('/purchase-dashboard/requisitions');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || (isRTL ? 'فشل في حفظ طلب الشراء' : 'Failed to save requisition.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen text-[#0A2551] font-sans pb-12 -mt-3 lg:-mt-4 -mx-3 lg:-mx-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="sticky top-0 z-40 bg-white border-b border-[#DFE7F4] px-6 py-3 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                    <button 
                        type="button" 
                        onClick={() => navigate('/purchase-dashboard/requisitions')}
                        className="p-1.5 rounded-lg border border-[#DFE7F4] hover:bg-slate-50 text-[#102A5B] transition-colors cursor-pointer"
                    >
                        {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-[#0A2551] leading-tight">
                            {isEditing ? (isRTL ? `تعديل طلب الشراء #${form.requisitionNumber || id}` : `Edit Purchase Requisition #${form.requisitionNumber || id}`) : (isRTL ? 'إنشاء طلب شراء جديد' : 'Create New Purchase Requisition')}
                        </h1>
                        <p className="text-[11px] text-[#617191]">{isRTL ? 'المشتريات / طلبات الشراء / نموذج الطلب' : 'Purchase / Requisitions / Order Manifest Form'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/purchase-dashboard/requisitions')}
                        className="px-4 py-2 border border-[#DFE7F4] rounded-lg text-xs font-semibold text-[#102A5B] hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        form="requisitionForm"
                        disabled={loading}
                        className="px-5 py-2 bg-[var(--color-primary,#00A9A8)] text-white rounded-lg text-xs font-bold hover:bg-[#008f8e] transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {loading ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                        <span>{isEditing ? (isRTL ? 'تحديث الطلب' : 'Update Requisition') : (isRTL ? 'حفظ الطلب' : 'Save Requisition')}</span>
                    </button>
                </div>
            </div>

            <div className="w-full px-4 lg:px-6 space-y-5">
                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="text-rose-500 font-bold">×</button>
                    </div>
                )}

                <form id="requisitionForm" onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-white border border-[#DFE7F4] rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 border-b border-[#DFE7F4] pb-3">
                            <Box size={18} className="text-[var(--color-primary,#00A9A8)]" />
                            <h2 className="text-xs font-bold text-[#0A2551] uppercase tracking-wider">
                                {isRTL ? 'البيانات الأساسية لطلب الشراء' : 'Requisition Protocol & General Details'}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'رقم طلب الشراء' : 'Requisition Number'}</label>
                                <input
                                    type="text"
                                    name="requisitionNumber"
                                    value={form.requisitionNumber}
                                    onChange={handleChange}
                                    placeholder={isRTL ? 'توليد تلقائي' : 'Auto Generate'}
                                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DFE7F4] rounded-lg text-xs font-bold text-[#0A2551] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'تاريخ الطلب *' : 'Requisition Date *'}</label>
                                <input
                                    type="date"
                                    name="requisitionDate"
                                    value={form.requisitionDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 bg-white border border-[#DFE7F4] rounded-lg text-xs font-semibold text-[#0A2551] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'الحالة' : 'Status'}</label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-[#DFE7F4] rounded-lg text-xs font-semibold text-[#0A2551] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                >
                                    <option value="DRAFT">{isRTL ? 'مسودة' : 'Draft'}</option>
                                    <option value="PENDING">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
                                    <option value="APPROVED">{isRTL ? 'معتمد' : 'Approved'}</option>
                                    <option value="REJECTED">{isRTL ? 'مرفوض' : 'Rejected'}</option>
                                    <option value="CANCELLED">{isRTL ? 'ملغى' : 'Cancelled'}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'المطلوب بواسطة *' : 'Requested By *'}</label>
                                <input
                                    type="text"
                                    name="requestedBy"
                                    value={form.requestedBy}
                                    onChange={handleChange}
                                    required
                                    placeholder={isRTL ? 'اسم طالب الشراء' : 'Requested By Name'}
                                    className="w-full px-3 py-2 bg-white border border-[#DFE7F4] rounded-lg text-xs font-semibold text-[#0A2551] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'المستلم' : 'Recipient'}</label>
                                <input
                                    type="text"
                                    name="recipient"
                                    value={form.recipient}
                                    onChange={handleChange}
                                    placeholder={isRTL ? 'جهة / شخص الاستلام' : 'Recipient / Dept'}
                                    className="w-full px-3 py-2 bg-white border border-[#DFE7F4] rounded-lg text-xs font-semibold text-[#0A2551] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'التاريخ المطلوب للتسليم' : 'Required Date'}</label>
                                <input
                                    type="date"
                                    name="requiredDate"
                                    value={form.requiredDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-[#DFE7F4] rounded-lg text-xs font-semibold text-[#0A2551] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'الكيان المؤسسي' : 'Entity'}</label>
                                <input
                                    type="text"
                                    name="entity"
                                    value={form.entity}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-[#DFE7F4] rounded-lg text-xs font-semibold text-[#0A2551] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'الأساس المعتمد' : 'Basis'}</label>
                                <input
                                    type="text"
                                    name="basis"
                                    value={form.basis}
                                    onChange={handleChange}
                                    placeholder={isRTL ? 'المشروع / القسم' : 'Project / Dept Basis'}
                                    className="w-full px-3 py-2 bg-white border border-[#DFE7F4] rounded-lg text-xs font-semibold text-[#0A2551] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'ملاحظات وتشغيلات الطلب' : 'Requisition Remarks & Notes'}</label>
                            <textarea
                                name="comment"
                                rows="2"
                                value={form.comment}
                                onChange={handleChange}
                                placeholder={isRTL ? 'إدخال أي تعليمات أو ملاحظات إضافية...' : 'Additional notes...'}
                                className="w-full px-3 py-2 bg-white border border-[#DFE7F4] rounded-lg text-xs font-semibold text-[#0A2551] outline-none focus:border-[var(--color-primary,#00A9A8)]"
                            />
                        </div>
                    </div>

                    <div className="bg-white border border-[#DFE7F4] rounded-2xl shadow-xs overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-[#DFE7F4] bg-[#F8FAFC] flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Package size={18} className="text-[var(--color-primary,#00A9A8)]" />
                                <h2 className="text-xs font-bold text-[#0A2551] uppercase tracking-wider">{isRTL ? 'جدول الأصناف المطلوبة' : 'Requisition Items Specification'}</h2>
                            </div>
                            <button
                                type="button"
                                onClick={addItem}
                                className="px-3 py-1.5 bg-[#00A9A8]/10 text-[#00A9A8] hover:bg-[#00A9A8]/20 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                                <Plus size={14} />
                                <span>{isRTL ? 'إضافة صنف' : 'Add Line Item'}</span>
                            </button>
                        </div>

                        <div className="p-4 space-y-3">
                            {form.items.length === 0 ? (
                                <div className="text-center py-8 text-[#617191] border-2 border-dashed border-[#DFE7F4] rounded-xl text-xs font-medium">
                                    {isRTL ? 'لم يتم إضافة أصناف بعد. انقر فوق "إضافة صنف" لبدء الإدخال.' : 'No items added yet. Click "Add Line Item" to start.'}
                                </div>
                            ) : (
                                form.items.map((it, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-[#F8FAFC] p-3 rounded-xl border border-[#DFE7F4] text-xs">
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'نوع المورد' : 'Resource Type'}</label>
                                            <input
                                                type="text"
                                                value={it.resourceType || ''}
                                                onChange={e => handleItemChange(idx, 'resourceType', e.target.value)}
                                                className="w-full px-2.5 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-semibold text-[#0A2551]"
                                                placeholder="Raw Material"
                                            />
                                        </div>

                                        <div className="md:col-span-3">
                                            <label className="block text-[10px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'اختر الصنف *' : 'Select Item *'}</label>
                                            <select
                                                value={it.itemId || ''}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    const found = masterItems.find(m => String(m.id) === String(val));
                                                    handleItemChange(idx, 'itemId', val);
                                                    if (found) {
                                                        handleItemChange(idx, 'itemName', found.name);
                                                        handleItemChange(idx, 'uom', found.uom || 'PCS');
                                                        handleItemChange(idx, 'resourceType', found.categoryLabel || 'Item');
                                                    }
                                                }}
                                                className="w-full px-2.5 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-bold text-[#0A2551]"
                                            >
                                                <option value="">{isRTL ? '-- اختر من المستودع --' : '-- Select Item --'}</option>
                                                {masterItems.map(m => (
                                                    <option key={m.uniqueKey} value={m.id}>{m.name} ({m.categoryLabel})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="md:col-span-3">
                                            <label className="block text-[10px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'المواصفات' : 'Content / Specs'}</label>
                                            <input
                                                type="text"
                                                value={it.content || ''}
                                                onChange={e => handleItemChange(idx, 'content', e.target.value)}
                                                className="w-full px-2.5 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-medium text-[#0A2551]"
                                                placeholder="Specification details..."
                                            />
                                        </div>

                                        <div className="md:col-span-1">
                                            <label className="block text-[10px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'الكمية' : 'Qty'}</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={it.quantity}
                                                onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                                                className="w-full px-2 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-bold text-[#0A2551] text-center"
                                            />
                                        </div>

                                        <div className="md:col-span-1">
                                            <label className="block text-[10px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'الوحدة' : 'UOM'}</label>
                                            <input
                                                type="text"
                                                value={it.uom || ''}
                                                onChange={e => handleItemChange(idx, 'uom', e.target.value)}
                                                className="w-full px-2 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-semibold text-[#0A2551] text-center"
                                            />
                                        </div>

                                        <div className="md:col-span-2 flex items-center justify-between gap-2">
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-bold text-[#617191] uppercase mb-1">{isRTL ? 'ملاحظة الصنف' : 'Item Note'}</label>
                                                <input
                                                    type="text"
                                                    value={it.comment || ''}
                                                    onChange={e => handleItemChange(idx, 'comment', e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-medium text-[#0A2551]"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(idx)}
                                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer mt-4"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-[#F8FAFC] border border-[#DFE7F4] rounded-2xl p-4 flex items-center gap-3 text-xs text-[#617191]">
                        <ShieldCheck size={18} className="text-[#00A9A8]" />
                        <span>{isRTL ? 'سيتم حفظ طلب الشراء في حالة المسودة وإتاحته للتحويل إلى أمر شراء أو مناقصة توريد' : 'Requisition manifest will be recorded & available for Purchase Order or Supply Tendering conversion.'}</span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequisitionForm;
