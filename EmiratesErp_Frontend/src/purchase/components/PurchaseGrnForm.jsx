import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader, Save, ArrowLeft, ChevronDown, ChevronUp,
  Box, Calendar, User, FileText, CheckCircle2,
  Info, Package, Warehouse, Hash, Truck, Beaker,
  Globe, ShieldCheck, BadgeCheck, ExternalLink
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

// Reusable Pure UI Components
const Input = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">{label}</label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-900 group-focus-within:text-indigo-500 transition-colors">
          <Icon size={16} />
        </div>
      )}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'px-4'} py-3 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:font-medium shadow-sm`}
      />
    </div>
  </div>
);

const Select = ({ label, icon: Icon, children, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">{label}</label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-900 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
          <Icon size={16} />
        </div>
      )}
      <select
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'px-4'} py-3 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none shadow-sm`}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-900 pointer-events-none">
        <ChevronDown size={16} />
      </div>
    </div>
  </div>
);

const TextArea = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">{label}</label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-3 top-4 text-slate-900 group-focus-within:text-indigo-500 transition-colors">
          <Icon size={16} />
        </div>
      )}
      <textarea
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'px-4'} py-3 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:font-medium shadow-sm min-h-[100px]`}
      />
    </div>
  </div>
);

const PurchaseGrnForm = () => {
  const { isRTL } = useLanguage();
  const { id: purchaseOrderId } = useParams();
  const navigate = useNavigate();
  const { hasModule } = useTenant();
  const isHangerTenant = hasModule('HANGER_MANUFACTURING');

  const [po, setPo] = useState(null);
  const [items, setItems] = useState([]);
  const [grnNumber, setGrnNumber] = useState('');
  const [grnDate, setGrnDate] = useState(new Date().toISOString().split('T')[0]);
  const [remark, setRemark] = useState('');
  const [createdBy, setCreatedBy] = useState(localStorage.getItem('username') || '');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/warehouse/warehouses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWarehouses(res.data || []);
      } catch (err) {
        console.error("Failed to fetch warehouses", err);
      }
    };
    fetchWarehouses();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${API_URL}/purchases/orders/${purchaseOrderId}`, { headers });
        setPo(res.data);

        const lines = (res.data.items || []).map(it => {
          const received = Number(it.receivedQuantity ?? 0);
          const ordered = Number(it.quantity ?? 0);
          const pending = Math.max(0, ordered - received);
          const line = {
            purchaseOrderItemId: it.id,
            itemName: it.itemName ?? it.description ?? '',
            orderedQuantity: ordered,
            receivedQuantity: received,
            pendingQuantity: pending,
            receiveNow: pending > 0 ? pending : 0,
            rate: it.rate ?? 0,
            unitId: it.unitId ?? null,
            isHangerCoil: false,
            showCoilDetails: false,
            heatNo: '',
            lotNo: '',
            materialType: 'MS',
            wireGaugeMm: '',
            grossWeightKg: '',
            tareWeightKg: '',
            netWeightKg: 0,
            ratePerKg: it.rate ?? 0,
            totalValue: 0,
            warehouseLocation: '',
            warehouseId: null,
            millCertificateUrl: ''
          };
          if (isHangerTenant && (line.itemName.toLowerCase().includes('coil'))) {
            line.isHangerCoil = true;
            line.showCoilDetails = true;
          }
          return line;
        });
        setItems(lines);
      } catch (err) {
        console.error('Failed to load PO for GRN', err);
        setError('System failed to synchronize with master manifest. Check connectivity.');
      } finally {
        setLoading(false);
      }
    };
    if (purchaseOrderId) load();
  }, [purchaseOrderId, isHangerTenant]);

  const updateItemField = (idx, field, value) => {
    setItems(prev => {
      const arr = [...prev];
      const item = { ...arr[idx], [field]: value };
      if (field === 'grossWeightKg' || field === 'tareWeightKg') {
        const gross = Number(item.grossWeightKg || 0);
        const tare = Number(item.tareWeightKg || 0);
        item.netWeightKg = Math.max(0, gross - tare);
      }
      if (field === 'ratePerKg' || field === 'netWeightKg') {
        item.totalValue = Number(item.netWeightKg || 0) * Number(item.ratePerKg || 0);
      }
      if (field === 'isHangerCoil' && value === true) {
        item.showCoilDetails = true;
      }
      arr[idx] = item;
      return arr;
    });
  };

  const updateReceiveNow = (idx, value) => {
    setItems(prev => {
      const arr = [...prev];
      let v = Number(value || 0);
      if (v < 0) v = 0;
      if (v > arr[idx].pendingQuantity) v = arr[idx].pendingQuantity;
      arr[idx] = { ...arr[idx], receiveNow: v };
      return arr;
    });
  };

  const validate = () => {
    if (!purchaseOrderId) return 'Invalid authorization context.';
    if (!grnDate) return 'Receiving timestamp required.';
    const any = items.some(i => Number(i.receiveNow) > 0);
    if (!any) return 'No items designated for receiving.';
    for (const it of items) {
      if (Number(it.receiveNow) > Number(it.pendingQuantity)) return `Operational violation: Receipt for ${it.itemName} exceeds pending manifest.`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const v = validate();
    if (v) { setError(v); return; }

    const payload = {
      purchaseOrderId: Number(purchaseOrderId),
      grnNumber: grnNumber || null,
      grnDate,
      remark: remark || null,
      createdBy: createdBy || null,
      items: items
        .filter(i => Number(i.receiveNow) > 0)
        .map(i => ({
          purchaseOrderItemId: i.purchaseOrderItemId,
          receivedQuantity: Number(i.receiveNow),
          rate: Number(i.rate) || 0,
          unitId: i.unitId || null,
          isHangerCoil: i.isHangerCoil,
          heatNo: i.heatNo,
          lotNo: i.lotNo,
          materialType: i.materialType,
          wireGaugeMm: i.wireGaugeMm ? Number(i.wireGaugeMm) : null,
          grossWeightKg: i.grossWeightKg ? Number(i.grossWeightKg) : null,
          tareWeightKg: i.tareWeightKg ? Number(i.tareWeightKg) : null,
          ratePerKg: i.ratePerKg ? Number(i.ratePerKg) : null,
          millCertificateUrl: i.millCertificateUrl,
          warehouseLocation: i.warehouseLocation,
          warehouseId: i.warehouseId || null
        }))
    };

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_URL}/purchases/grns`, payload, { headers });
      navigate(`/purchase-dashboard/purchase-orders/view/${purchaseOrderId}`);
    } catch (err) {
      console.error('Failed to save GRN', err);
      setError(err?.response?.data?.message || 'Transaction failed. Check server status.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 gap-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={32} />
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-slate-800 tracking-tight">Accessing Logistics Manifest</p>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Preparing Warehouse Inventory Grid</p>
        </div>
      </div>
    );
  }

  if (!po) return <div className="p-12 text-center text-rose-500 font-black uppercase tracking-widest">{error || (isRTL ? 'تم رفض إذن البيان' : 'Manifest Authorization Denied')}</div>;

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] font-sans pb-10" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full space-y-3">
        {/* Header Area based on PurchaseOrderForm Spec */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-[#102A5B]">
              <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
            </button>
            <div>
              <h1 className="text-[24px] sm:text-[28px] font-bold text-[#102A5B] leading-tight tracking-tight">
                {isRTL ? `اعتماد استلام البضائع لأمر الشراء PO-${po.poNumber}` : `Authorize GRN for PO-${po.poNumber}`}
              </h1>
              <p className="text-[12px] font-normal text-[#5F6F91]">
                {isRTL ? 'أمر الشراء' : 'Purchase Order'} / <strong className="text-[#102A5B]">PO-{po.poNumber}</strong> / {isRTL ? 'استلام المخزون' : 'Receive Inventory'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} type="button" className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DCE5F3] rounded-[5.29px] text-[12px] font-semibold text-[#102A5B] hover:bg-slate-50 transition-all cursor-pointer shadow-xs">
              {isRTL ? 'إلغاء' : 'Abort'}
            </button>
            <button onClick={handleSubmit} disabled={submitting} type="button" className="flex items-center gap-1.5 px-4 py-1.5 bg-[#00A9A8] text-white rounded-[5.29px] text-[12px] font-semibold hover:bg-[#008f8e] transition-all cursor-pointer shadow-xs disabled:opacity-50">
              {submitting ? <Loader className="animate-spin" size={15} /> : <Save size={15} />}
              <span>{isRTL ? 'إنهاء الاستلام' : 'Finalize Receipt'}</span>
            </button>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-3 text-rose-700 text-xs font-semibold">
            <Info size={18} />
            <p>{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
            <div className="lg:col-span-8 bg-white border border-[#DCE5F3] rounded-[11.86px] p-4 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label={isRTL ? 'رقم الإيصال' : 'Receipt Number'} icon={Hash} value={grnNumber} onChange={(e) => setGrnNumber(e.target.value)} placeholder={isRTL ? 'توليد تلقائي إذا كان فارغاً' : 'Auto-generated if empty'} />
              <Input label={isRTL ? 'تاريخ الإيصال' : 'Receipt Date'} icon={Calendar} type="date" value={grnDate} onChange={(e) => setGrnDate(e.target.value)} />
              <Input label={isRTL ? 'المعتمد المسؤول' : 'Authorizing Agent'} icon={User} value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} />
            </div>

            <div className="lg:col-span-4 bg-[#006A78] text-white rounded-[11.86px] p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#A3E5EC] uppercase tracking-wider flex items-center gap-1.5">
                  <BadgeCheck size={13} /> {isRTL ? 'المزامنة المباشرة نشطة' : 'Live Sync Active'}
                </span>
                <Truck size={20} className="text-[#A3E5EC]/60" />
              </div>
              <div className="my-1">
                <span className="text-[10.5px] font-semibold text-[#A3E5EC] block">{isRTL ? 'المورد المصدر' : 'Source Supplier'}</span>
                <h3 className="text-base font-bold tracking-tight text-white mt-0.5">{po.supplierName || (isRTL ? 'بيان المورد' : 'Supplier Manifest')}</h3>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs">
                <span className="text-[#A3E5EC]">{isRTL ? 'الأصناف في الانتظار' : 'Items in Queue'}</span>
                <span className="font-bold text-white">{isRTL ? `${items.length} أسطر` : `${items.length} Lines`}</span>
              </div>
            </div>
          </div>

          {/* Items Grid Table */}
          <div className="bg-white border border-[#DFE7F4] rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#DFE7F4] bg-[#F8FAFC] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00A9A8]/10 text-[#00A9A8] flex items-center justify-center font-bold">
                  <Package size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0A2551] uppercase tracking-wider">{isRTL ? 'بيان المخزون' : 'INVENTORY MANIFEST'}</h3>
                  <p className="text-[10.5px] font-medium text-[#617191]">{isRTL ? 'تحديد الكميات المستلمة لإدخال المخزون' : 'Define received quantities for inventory entry'}</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs" dir={isRTL ? 'rtl' : 'ltr'}>
                <thead>
                  <tr className="bg-[#F2F6FC] border-b border-[#DFE7F4] text-[#617191] uppercase text-[10.5px] font-bold">
                    <th className="px-4 py-3 text-left rtl:text-right">{isRTL ? 'وصف الصنف' : 'Item Specification'}</th>
                    <th className="px-4 py-3 text-center">{isRTL ? 'المطلوب' : 'Ordered'}</th>
                    <th className="px-4 py-3 text-center">{isRTL ? 'المتبقي' : 'Pending'}</th>
                    <th className="px-4 py-3 text-left rtl:text-right">{isRTL ? 'المستودع المستهدف' : 'Target Warehouse'}</th>
                    <th className="px-4 py-3 text-right rtl:text-left w-44">{isRTL ? 'الكمية المستلمة' : 'Quantity Received'}</th>
                    {isHangerTenant && <th className="px-4 py-3 text-center">{isRTL ? 'المرحلة 2 للملف' : 'Coil Phase 2'}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE7F4]">
                  {items.map((it, idx) => (
                    <React.Fragment key={it.purchaseOrderItemId}>
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-bold text-[#0A2551] block">{it.itemName}</span>
                          <span className="text-[10px] font-medium text-[#617191]">{isRTL ? 'إدخال الوحدة القياسية' : 'Standard Unit Entry'}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-[#0A2551]">
                          {it.orderedQuantity}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10.5px] font-bold ${it.pendingQuantity > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            {isRTL ? `المتبقي ${it.pendingQuantity}` : `${it.pendingQuantity} Remaining`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            className="w-full px-3 py-1.5 bg-white border border-[#DFE7F4] rounded-lg text-xs font-semibold text-[#0A2551] outline-none focus:border-[#00A9A8] transition-all"
                            value={it.warehouseId || ''}
                            onChange={(e) => updateItemField(idx, 'warehouseId', e.target.value)}
                          >
                            <option value="">{isRTL ? 'المستودع الافتراضي' : 'Default Warehouse'}</option>
                            {warehouses.map(w => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            className="w-full text-right rtl:text-left px-3 py-1.5 bg-white border border-[#DFE7F4] rounded-lg text-xs font-bold text-[#0A2551] outline-none focus:border-[#00A9A8] transition-all"
                            value={it.receiveNow}
                            onChange={(e) => updateReceiveNow(idx, e.target.value)}
                          />
                        </td>
                        {isHangerTenant && (
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => updateItemField(idx, 'isHangerCoil', !it.isHangerCoil)}
                              className={`p-1.5 rounded-lg border transition-all ${it.isHangerCoil ? 'bg-[#00A9A8] text-white border-[#00A9A8]' : 'bg-white text-slate-400 border-[#DFE7F4] hover:border-[#00A9A8]'}`}
                            >
                              <Beaker size={15} />
                            </button>
                          </td>
                        )}
                      </tr>

                      {/* Coil Detail Expansion */}
                      <AnimatePresence>
                        {it.isHangerCoil && it.showCoilDetails && (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-[#F7FAFF]"
                          >
                            <td colSpan={isHangerTenant ? 6 : 5} className="p-4 border-b border-[#DFE7F4]">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 border border-[#DFE7F4] rounded-xl">
                                <Select label={isRTL ? 'المادة الأساسية' : 'Core Material'} icon={Beaker} value={it.materialType} onChange={(e) => updateItemField(idx, 'materialType', e.target.value)}>
                                  <option value="MS">Mild Steel (MS)</option>
                                  <option value="GALVANIZED">Galvanized (GI)</option>
                                  <option value="STAINLESS_STEEL">Stainless Steel (SS)</option>
                                </Select>
                                <Input label={isRTL ? 'المقياس (مم)' : 'Gauge (mm)'} icon={Globe} type="number" step="0.01" value={it.wireGaugeMm} onChange={(e) => updateItemField(idx, 'wireGaugeMm', e.target.value)} placeholder="0.00" />
                                <Input label={isRTL ? 'معرف تتبع الحرارة' : 'Heat Trace ID'} icon={Hash} value={it.heatNo} onChange={(e) => updateItemField(idx, 'heatNo', e.target.value)} placeholder="X-000" />
                                <Input label={isRTL ? 'بروتوكول الدفعة' : 'Lot Protocol'} icon={FileText} value={it.lotNo} onChange={(e) => updateItemField(idx, 'lotNo', e.target.value)} />
                                <Input label={isRTL ? 'الوزن الإجمالي (كجم)' : 'Gross Wt (kg)'} icon={Package} type="number" step="0.01" value={it.grossWeightKg} onChange={(e) => updateItemField(idx, 'grossWeightKg', e.target.value)} />
                                <Input label={isRTL ? 'وزن التعبئة (كجم)' : 'Tare Wt (kg)'} icon={Package} type="number" step="0.01" value={it.tareWeightKg} onChange={(e) => updateItemField(idx, 'tareWeightKg', e.target.value)} />
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold uppercase text-[#617191]">{isRTL ? 'الوزن الصافي المحسوب' : 'Calculated Net Wt'}</label>
                                  <div className="w-full px-3 py-2 bg-[#F2F6FC] border border-[#DFE7F4] rounded-xl text-xs font-bold text-[#0A2551]">
                                    {it.netWeightKg.toFixed(4)} KG
                                  </div>
                                </div>
                                <Input label={isRTL ? 'السعر لكل كجم' : 'Rate Per KG'} icon={Hash} type="number" step="0.01" value={it.ratePerKg} onChange={(e) => updateItemField(idx, 'ratePerKg', e.target.value)} />
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-8 bg-white border border-[#DFE7F4] rounded-2xl p-4 shadow-xs">
              <TextArea label={isRTL ? 'ملاحظات وتشغيلات إضافية' : 'Operational Remarks & Notes'} icon={FileText} value={remark} onChange={(e) => setRemark(e.target.value)} placeholder={isRTL ? 'أدخل ملاحظات أو ملاحظات إضافية متعلقة بهذا الاستلام...' : 'Define additional notes or observations relative to this receipt...'} />
            </div>
            <div className="lg:col-span-4 bg-white border border-[#DFE7F4] rounded-2xl p-5 shadow-xs flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-[#00A9A8]/10 text-[#00A9A8] rounded-xl"><ShieldCheck size={18} /></div>
                <div>
                  <h4 className="text-xs font-bold text-[#0A2551] uppercase">{isRTL ? 'سجل الاعتماد' : 'Authorization Log'}</h4>
                  <p className="text-[10.5px] font-medium text-[#617191]">{isRTL ? 'إدخال WMS تم التحقق منه' : 'Verified WMS Entry'}</p>
                </div>
              </div>
              <div className="h-px bg-[#DFE7F4] w-full mb-3" />
              <p className="text-xs font-medium text-[#617191] leading-relaxed">
                {isRTL
                  ? `"متابعة الاستلام ستحدث مخزون المستودع وحالة البيان لأمر الشراء PO-${po.poNumber}. هذه المعاملة مسجلة باسم ${createdBy}."`
                  : `"Proceeding with receipt will update warehouse inventory and manifest status for PO-${po.poNumber}. This transaction is logged under ${createdBy}."`}
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseGrnForm;
