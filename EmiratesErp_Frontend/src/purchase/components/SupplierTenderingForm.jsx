import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Save, Loader, ArrowLeft, ArrowRight, ShieldCheck, Package, FileText, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white border border-[#DFE7F4] rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#DFE7F4] pb-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary,#00A9A8)]/10 text-[var(--color-primary,#00A9A8)] flex items-center justify-center font-bold">
                <Icon size={18} />
            </div>
            <h3 className="text-xs font-bold text-[#0A2551] uppercase tracking-wider">{title}</h3>
        </div>
        {children}
    </div>
);

const SupplierTenderingForm = () => {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const isEditing = !!id;

    const [form, setForm] = useState({
        transactionType: 'RFQ',
        initiatedBy: '',
        requiredDate: new Date().toISOString().split('T')[0],
        project: '',
        entity: '',
        tenderingCurrency: 'AED',
        basisType: 'Manual',
        basisId: '',
        warehouseId: '',
        status: 'DRAFT',
        items: [],
        suppliers: [],
        questions: []
    });

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [masterSuppliers, setMasterSuppliers] = useState([]);
    const [masterItems, setMasterItems] = useState([]);
    const [masterQuestions, setMasterQuestions] = useState([]);
    const [sourceRequisitionId, setSourceRequisitionId] = useState(null);

    useEffect(() => {
        if (location.state?.requisitionData && !isEditing) {
            const req = location.state.requisitionData;
            if (req.id) setSourceRequisitionId(req.id);

            const mappedItems = (req.items || []).map((item, index) => {
                const found = masterItems.find(m => String(m.id) === String(item.itemId));
                return {
                    lineNumber: index + 1,
                    itemId: item.itemId || '',
                    itemName: item.itemName || '',
                    itemKey: found ? found.uniqueKey : '',
                    content: item.content || '',
                    quantity: item.quantity || 1,
                    uom: item.uom || ''
                };
            });

            setForm(prev => ({
                ...prev,
                basisId: req.requisitionNumber || prev.basisId,
                basisType: 'Requisition',
                project: [req.basis, req.comment].filter(Boolean).join(' - ') || prev.project,
                items: mappedItems
            }));
        }
    }, [location.state, isEditing, masterItems]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [supRes, rawRes, semiRes, fgRes, prodRes, qRes, tenantRes] = await Promise.allSettled([
                    axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } }),
                    axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/production/semi-finished`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/production/finished-goods`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/crm/products`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/purchases/rfq-questions`, { headers, params: { page: 0, size: 500 } }),
                    axios.get(`${API_URL}/pos/tenant/current`, { headers })
                ]);

                setMasterSuppliers(supRes.status === 'fulfilled' ? (supRes.value.data.content || supRes.value.data || []) : []);
                setMasterQuestions(qRes.status === 'fulfilled' ? (qRes.value.data?.content || []) : []);

                const tenantName = (tenantRes.status === 'fulfilled' && tenantRes.value.data) ? tenantRes.value.data.name : '';

                const combinedItems = [];
                if (rawRes.status === 'fulfilled') combinedItems.push(...(rawRes.value.data.content || rawRes.value.data || []).map(m => ({ ...m, uniqueKey: `RAW-${m.id}`, categoryLabel: 'Raw Material' })));
                if (semiRes.status === 'fulfilled') combinedItems.push(...(semiRes.value.data.content || semiRes.value.data || []).map(m => ({ ...m, uniqueKey: `SEMI-${m.id}`, categoryLabel: 'Semi-Finished' })));
                if (fgRes.status === 'fulfilled') combinedItems.push(...(fgRes.value.data.content || fgRes.value.data || []).map(m => ({ ...m, uniqueKey: `FG-${m.id}`, categoryLabel: 'Finished Good' })));
                if (prodRes.status === 'fulfilled') combinedItems.push(...(prodRes.value.data.content || prodRes.value.data || []).map(m => ({ ...m, uniqueKey: `PROD-${m.id}`, categoryLabel: 'Product' })));
                setMasterItems(combinedItems);

                if (isEditing) {
                    const res = await axios.get(`${API_URL}/purchases/supplier-tendering/${id}`, { headers });
                    const data = res.data;
                    const mappedItems = (data.items || []).map(it => {
                        const found = combinedItems.find(m => String(m.id) === String(it.itemId) && m.name === it.itemName) || combinedItems.find(m => String(m.id) === String(it.itemId));
                        return { ...it, itemKey: found ? found.uniqueKey : '' };
                    });

                    setForm({
                        ...data,
                        requiredDate: data.requiredDate ? new Date(data.requiredDate).toISOString().split('T')[0] : '',
                        items: mappedItems,
                        suppliers: data.suppliers || [],
                        questions: data.questions || []
                    });
                } else if (tenantName) {
                    setForm(prev => ({ ...prev, entity: tenantName }));
                }
            } catch (err) {
                console.error(err);
                setError(isRTL ? 'فشل في تحميل البيانات الأساسية.' : 'Failed to load master data.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, isEditing, isRTL]);

    const handleFieldChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    const addItem = () => {
        setForm(prev => ({
            ...prev,
            items: [...prev.items, { lineNumber: prev.items.length + 1, itemId: '', itemName: '', itemKey: '', content: '', quantity: 1, uom: 'PCS' }]
        }));
    };

    const removeItem = (index) => {
        setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index).map((item, i) => ({ ...item, lineNumber: i + 1 })) }));
    };

    const handleItemChange = (index, field, val) => {
        setForm(prev => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: val };
            if (field === 'itemKey') {
                const found = masterItems.find(m => m.uniqueKey === val);
                if (found) {
                    newItems[index].itemId = found.id;
                    newItems[index].itemName = found.name;
                    newItems[index].uom = found.unitOfMeasure || found.uom || 'PCS';
                }
            }
            return { ...prev, items: newItems };
        });
    };

    const addSupplier = () => {
        setForm(prev => ({
            ...prev,
            suppliers: [...prev.suppliers, { supplierId: '', supplierName: '', contractType: 'Standard', contactPerson: '', email: '', supplierItems: prev.items.map(() => ({ selected: true })) }]
        }));
    };

    const removeSupplier = (idx) => setForm(prev => ({ ...prev, suppliers: prev.suppliers.filter((_, i) => i !== idx) }));

    const handleSupplierChange = (idx, field, val) => {
        setForm(prev => {
            const newSups = [...prev.suppliers];
            newSups[idx] = { ...newSups[idx], [field]: val };
            return { ...prev, suppliers: newSups };
        });
    };

    const addQuestion = () => setForm(prev => ({ ...prev, questions: [...prev.questions, { questionId: '', questionText: '' }] }));
    const removeQuestion = (idx) => setForm(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== idx) }));
    const handleQuestionChange = (idx, field, val) => {
        setForm(prev => {
            const newQ = [...prev.questions];
            newQ[idx] = { ...newQ[idx], [field]: val };
            return { ...prev, questions: newQ };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const payload = { ...form, sourceRequisitionId };

            if (isEditing) {
                await axios.put(`${API_URL}/purchases/supplier-tendering/${id}`, payload, { headers });
            } else {
                await axios.post(`${API_URL}/purchases/supplier-tendering`, payload, { headers });
            }
            navigate('/purchase-dashboard/supplier-tendering');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || (isRTL ? 'فشل في حفظ المناقصة.' : 'Failed to save supply tendering.'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-[#F8FAFC]">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-[#00A9A8] rounded-full animate-spin mb-3" />
                <p className="text-sm font-bold text-[#0A2551]">{isRTL ? 'جاري تحميل بيانات مناقصة التوريد...' : 'Loading Supply Tendering Form...'}</p>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#F8FAFC] font-sans pb-10" dir={isRTL ? 'rtl' : 'ltr'}>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} type="button" className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-[#102A5B]">
                            {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                        </button>
                        <div>
                            <h1 className="text-[22px] sm:text-[26px] font-bold text-[#102A5B] leading-tight tracking-tight">
                                {isEditing ? (isRTL ? 'تعديل مناقصة توريد' : 'Edit Supply Tendering') : (isRTL ? 'مناقصة توريد جديدة' : 'New Supply Tendering')}
                            </h1>
                            <p className="text-[12px] font-medium text-[#617191]">
                                {isRTL ? 'المشتريات' : 'Purchase'} / <strong className="text-[#102A5B]">{isRTL ? 'مناقصة التوريد' : 'Supply Tendering'}</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/purchase-dashboard/supplier-tendering')} type="button" className="px-4 py-2 bg-white border border-[#DFE7F4] rounded-[5.29px] text-xs font-semibold text-[#102A5B] hover:bg-slate-50 transition-colors shadow-xs cursor-pointer">
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button type="submit" disabled={submitting} className="flex items-center gap-1.5 px-5 py-2 bg-[var(--color-primary,#00A9A8)] text-white rounded-[5.29px] text-xs font-bold hover:bg-[#008f8e] transition-all shadow-xs cursor-pointer disabled:opacity-50">
                            {submitting ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                            <span>{isEditing ? (isRTL ? 'تحديث المناقصة' : 'Update Tendering') : (isRTL ? 'حفظ المناقصة' : 'Save Tendering')}</span>
                        </button>
                    </div>
                </div>

                {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-semibold">{error}</div>}

                <SectionCard title={isRTL ? 'معلومات المناقصة العامة' : 'General Tendering Info'} icon={FileText}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        <div className="space-y-1">
                            <label className="font-bold text-[#617191]">{isRTL ? 'نوع المعاملة' : 'Transaction Type'}</label>
                            <input type="text" value={form.transactionType} onChange={e => handleFieldChange('transactionType', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-[#DFE7F4] rounded-xl font-semibold text-[#0A2551]" readOnly />
                        </div>
                        <div className="space-y-1">
                            <label className="font-bold text-[#617191]">{isRTL ? 'البادئ بواسطة' : 'Initiated By'}</label>
                            <input type="text" value={form.initiatedBy} onChange={e => handleFieldChange('initiatedBy', e.target.value)} placeholder={isRTL ? 'اسم المسؤول' : 'Responsible Person'} className="w-full px-3 py-2 bg-white border border-[#DFE7F4] rounded-xl font-semibold text-[#0A2551] outline-none focus:border-[#00A9A8]" />
                        </div>
                        <div className="space-y-1">
                            <label className="font-bold text-[#617191]">{isRTL ? 'التاريخ المطلوب' : 'Required Date'}</label>
                            <input type="date" value={form.requiredDate} onChange={e => handleFieldChange('requiredDate', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#DFE7F4] rounded-xl font-semibold text-[#0A2551] outline-none focus:border-[#00A9A8]" />
                        </div>
                        <div className="space-y-1">
                            <label className="font-bold text-[#617191]">{isRTL ? 'المشروع' : 'Project'}</label>
                            <input type="text" value={form.project} onChange={e => handleFieldChange('project', e.target.value)} placeholder={isRTL ? 'اسم المشروع' : 'Project Name / Reference'} className="w-full px-3 py-2 bg-white border border-[#DFE7F4] rounded-xl font-semibold text-[#0A2551] outline-none focus:border-[#00A9A8]" />
                        </div>
                        <div className="space-y-1">
                            <label className="font-bold text-[#617191]">{isRTL ? 'الكيان' : 'Entity'}</label>
                            <input type="text" value={form.entity} onChange={e => handleFieldChange('entity', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#DFE7F4] rounded-xl font-semibold text-[#0A2551] outline-none focus:border-[#00A9A8]" />
                        </div>
                        <div className="space-y-1">
                            <label className="font-bold text-[#617191]">{isRTL ? 'العملة' : 'Currency'}</label>
                            <input type="text" value="AED" readOnly className="w-full px-3 py-2 bg-slate-50 border border-[#DFE7F4] rounded-xl font-bold text-[#0A2551]" />
                        </div>
                        <div className="space-y-1">
                            <label className="font-bold text-[#617191]">{isRTL ? 'نوع الأساس' : 'Basis Type'}</label>
                            <input type="text" value={form.basisType} onChange={e => handleFieldChange('basisType', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#DFE7F4] rounded-xl font-semibold text-[#0A2551] outline-none focus:border-[#00A9A8]" />
                        </div>
                        <div className="space-y-1">
                            <label className="font-bold text-[#617191]">{isRTL ? 'الحالة' : 'Status'}</label>
                            <select value={form.status} onChange={e => handleFieldChange('status', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#DFE7F4] rounded-xl font-semibold text-[#0A2551] outline-none focus:border-[#00A9A8]">
                                <option value="DRAFT">{isRTL ? 'مسودة' : 'DRAFT'}</option>
                                <option value="REQUESTS_FOR_QUOTATION">{isRTL ? 'طلب عروض أسعار' : 'REQUEST FOR QUOTATION'}</option>
                                <option value="RFQ_RESPONSES">{isRTL ? 'ردود الأسعار' : 'RFQ RESPONSES'}</option>
                                <option value="COMPARISON">{isRTL ? 'قيد المقارنة' : 'COMPARISON'}</option>
                                <option value="COMPLETED">{isRTL ? 'مكتمل' : 'COMPLETED'}</option>
                            </select>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title={isRTL ? 'أصناف المناقصة المطلوبة' : 'Items Needed Grid'} icon={Package}>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr className="bg-[#F2F6FC] border-b border-[#DFE7F4] text-[#617191] uppercase font-bold text-[11px]">
                                    <th className="p-2.5 text-left rtl:text-right w-12">#</th>
                                    <th className="p-2.5 text-left rtl:text-right">{isRTL ? 'اختيار الصنف' : 'Item Selection'}</th>
                                    <th className="p-2.5 text-left rtl:text-right">{isRTL ? 'المواصفات / تفاصيل' : 'Specs / Content'}</th>
                                    <th className="p-2.5 text-center w-28">{isRTL ? 'الكمية' : 'Quantity'}</th>
                                    <th className="p-2.5 text-center w-24">{isRTL ? 'الوحدة' : 'UOM'}</th>
                                    <th className="p-2.5 text-center w-12">{isRTL ? 'حذف' : 'Remove'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DFE7F4]">
                                {form.items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/60">
                                        <td className="p-2.5 text-center font-bold text-[#0A2551]">{idx + 1}</td>
                                        <td className="p-2.5">
                                            <select value={item.itemKey || ''} onChange={e => handleItemChange(idx, 'itemKey', e.target.value)} className="w-full px-3 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-semibold text-[#0A2551] outline-none focus:border-[#00A9A8]">
                                                <option value="">{isRTL ? 'اختر صنف المشتريات' : 'Select Item'}</option>
                                                {masterItems.map(m => <option key={m.uniqueKey} value={m.uniqueKey}>[{m.categoryLabel}] {m.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-2.5">
                                            <input type="text" value={item.content || ''} onChange={e => handleItemChange(idx, 'content', e.target.value)} placeholder={isRTL ? 'ملاحظات المواصفات...' : 'Additional specs notes...'} className="w-full px-3 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-medium text-[#0A2551] outline-none focus:border-[#00A9A8]" />
                                        </td>
                                        <td className="p-2.5">
                                            <input type="number" step="0.01" min="0.01" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="w-full text-center px-3 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-bold text-[#0A2551] outline-none focus:border-[#00A9A8]" />
                                        </td>
                                        <td className="p-2.5">
                                            <input type="text" value={item.uom || ''} onChange={e => handleItemChange(idx, 'uom', e.target.value)} className="w-full text-center px-2 py-1.5 bg-slate-50 border border-[#DFE7F4] rounded-lg font-bold text-[#0A2551]" />
                                        </td>
                                        <td className="p-2.5 text-center">
                                            <button type="button" onClick={() => removeItem(idx)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00A9A8]/10 text-[#00A9A8] rounded-lg text-xs font-bold hover:bg-[#00A9A8]/20 transition-all cursor-pointer">
                        <Plus size={14} /> <span>{isRTL ? 'إضافة صنف آخر' : 'Add Item Line'}</span>
                    </button>
                </SectionCard>

                <SectionCard title={isRTL ? 'الموردون المدعوون' : 'Invited Suppliers'} icon={User}>
                    <div className="space-y-3">
                        {form.suppliers.map((sup, idx) => (
                            <div key={idx} className="p-3.5 bg-[#F8FAFC] border border-[#DFE7F4] rounded-xl space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                                    <div>
                                        <label className="font-bold text-[#617191] block mb-1">{isRTL ? 'المورد' : 'Supplier'}</label>
                                        <select value={sup.supplierId || ''} onChange={e => {
                                            const val = e.target.value;
                                            handleSupplierChange(idx, 'supplierId', val);
                                            const found = masterSuppliers.find(m => String(m.id) === String(val));
                                            if (found) {
                                                handleSupplierChange(idx, 'supplierName', found.companyName || found.name);
                                                handleSupplierChange(idx, 'email', found.email || '');
                                                handleSupplierChange(idx, 'contactPerson', found.contactPerson || '');
                                            }
                                        }} className="w-full px-3 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-semibold text-[#0A2551]">
                                            <option value="">{isRTL ? 'اختر المورد' : 'Select Supplier'}</option>
                                            {masterSuppliers.map(m => <option key={m.id} value={m.id}>{m.companyName || m.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-bold text-[#617191] block mb-1">{isRTL ? 'نوع العقد' : 'Contract Type'}</label>
                                        <input type="text" value={sup.contractType || ''} onChange={e => handleSupplierChange(idx, 'contractType', e.target.value)} className="w-full px-3 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-semibold text-[#0A2551]" />
                                    </div>
                                    <div>
                                        <label className="font-bold text-[#617191] block mb-1">{isRTL ? 'الشخص المسؤول' : 'Contact Person'}</label>
                                        <input type="text" value={sup.contactPerson || ''} onChange={e => handleSupplierChange(idx, 'contactPerson', e.target.value)} className="w-full px-3 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-semibold text-[#0A2551]" />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1">
                                            <label className="font-bold text-[#617191] block mb-1">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                                            <input type="email" value={sup.email || ''} onChange={e => handleSupplierChange(idx, 'email', e.target.value)} className="w-full px-3 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-semibold text-[#0A2551]" />
                                        </div>
                                        <button type="button" onClick={() => removeSupplier(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addSupplier} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00A9A8]/10 text-[#00A9A8] rounded-lg text-xs font-bold hover:bg-[#00A9A8]/20 transition-all cursor-pointer">
                            <Plus size={14} /> <span>{isRTL ? 'دعوة مورد آخر' : 'Invite Additional Supplier'}</span>
                        </button>
                    </div>
                </SectionCard>

                <SectionCard title={isRTL ? 'أسئلة التقييم والتأهيل المسبق' : 'Pre-Qualification Questions'} icon={ShieldCheck}>
                    <div className="space-y-3">
                        {form.questions.map((q, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-3 items-end p-3 bg-[#F8FAFC] border border-[#DFE7F4] rounded-xl text-xs">
                                <div className="md:w-1/3">
                                    <label className="font-bold text-[#617191] block mb-1">{isRTL ? 'سؤال رئيسي' : 'Master Question'}</label>
                                    <select value={q.questionId || ''} onChange={e => {
                                        const val = e.target.value;
                                        handleQuestionChange(idx, 'questionId', val);
                                        const found = masterQuestions.find(m => String(m.id) === String(val));
                                        if (found) handleQuestionChange(idx, 'questionText', found.questionText);
                                    }} className="w-full px-3 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-semibold text-[#0A2551]">
                                        <option value="">{isRTL ? 'سؤال مخصص' : 'Custom Question'}</option>
                                        {masterQuestions.map(m => <option key={m.id} value={m.id}>{m.questionText}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="font-bold text-[#617191] block mb-1">{isRTL ? 'نص السؤال' : 'Question Text'}</label>
                                    <input type="text" value={q.questionText || ''} onChange={e => handleQuestionChange(idx, 'questionText', e.target.value)} className="w-full px-3 py-1.5 bg-white border border-[#DFE7F4] rounded-lg font-semibold text-[#0A2551]" />
                                </div>
                                <button type="button" onClick={() => removeQuestion(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                            </div>
                        ))}
                        <button type="button" onClick={addQuestion} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00A9A8]/10 text-[#00A9A8] rounded-lg text-xs font-bold hover:bg-[#00A9A8]/20 transition-all cursor-pointer">
                            <Plus size={14} /> <span>{isRTL ? 'إضافة سؤال آخر' : 'Add Question'}</span>
                        </button>
                    </div>
                </SectionCard>
            </form>
        </div>
    );
};

export default SupplierTenderingForm;
