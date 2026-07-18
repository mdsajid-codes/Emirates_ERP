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

  if (!po) return <div className="p-12 text-center text-rose-500 font-black uppercase tracking-widest">{error || 'Manifest Authorization Denied'}</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                <span>Warehousing</span>
                <ChevronDown size={10} />
                <span className="text-indigo-600">Inventory Receipt</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Authorize GRN for PO-{po.poNumber}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              Abort
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-95">
              {submitting ? <Loader className="animate-spin" size={16} /> : <Save size={16} />} Finalize Receipt
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-8 mt-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-50 border border-rose-100 p-4 rounded-[2rem] flex items-center gap-4 text-rose-600">
              <div className="p-3 bg-white rounded-2xl shadow-sm"><Info size={20} /></div>
              <p className="text-sm font-black uppercase tracking-wider">{error}</p>
            </motion.div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
              <Input label="Receipt Number" icon={Hash} value={grnNumber} onChange={(e) => setGrnNumber(e.target.value)} placeholder="Auto-generated if empty" />
              <Input label="Receipt Date" icon={Calendar} type="date" value={grnDate} onChange={(e) => setGrnDate(e.target.value)} />
              <Input label="Authorizing Agent" icon={User} value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} />
            </div>
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 opacity-60">
                <BadgeCheck size={12} /> Live Sync
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Source Partner</p>
                <p className="text-lg font-black tracking-tight leading-tight">{po.supplierName || 'Protocol Loading...'}</p>
              </div>
              <div className="mt-6 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Items in Queue</p>
                  <p className="text-2xl font-black">{items.length}</p>
                </div>
                <Truck size={32} className="opacity-20 translate-x-4 translate-y-4" />
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-100 bg-white/40 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm"><Package size={20} /></div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Inventory Manifest</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Define Quantities for Entry</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400">
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-left">Item Specification</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center">Authorization</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center">Pending Status</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-left">Warehouse</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-right w-48">Quantity Received</th>
                    {isHangerTenant && <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-center">Phase 2 Coil</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => (
                    <React.Fragment key={it.purchaseOrderItemId}>
                      <tr className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-10 py-8">
                          <div className="text-sm font-black text-slate-800 mb-1">{it.itemName}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Enterprise Standard Unit</div>
                        </td>
                        <td className="px-6 py-8 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                          {it.orderedQuantity} Total
                        </td>
                        <td className="px-6 py-8 text-center">
                          <div className={`px-4 py-1.5 rounded-full inline-block text-[10px] font-black uppercase tracking-widest ${it.pendingQuantity > 0 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            {it.pendingQuantity} Remaining
                          </div>
                        </td>
                        <td className="px-6 py-8">
                          <select
                            className="w-full px-4 py-2 bg-white/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                            value={it.warehouseId || ''}
                            onChange={(e) => updateItemField(idx, 'warehouseId', e.target.value)}
                          >
                            <option value="">Default Warehouse</option>
                            {warehouses.map(w => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-8">
                          <div className="relative group/input">
                            <input
                              type="number"
                              step="0.01"
                              className={`w-full text-right px-4 py-3 bg-white/80 border border-slate-200 rounded-2xl text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${it.isHangerCoil ? 'ring-2 ring-indigo-100 border-indigo-200' : ''}`}
                              value={it.receiveNow}
                              onChange={(e) => updateReceiveNow(idx, e.target.value)}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest pointer-events-none group-focus-within/input:text-indigo-500 transition-colors">QTY</div>
                          </div>
                        </td>
                        {isHangerTenant && (
                          <td className="px-10 py-8 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                type="button"
                                onClick={() => updateItemField(idx, 'isHangerCoil', !it.isHangerCoil)}
                                className={`p-2 rounded-xl border transition-all ${it.isHangerCoil ? 'bg-indigo-600 text-white border-indigo-600 scale-110' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}
                              >
                                <Beaker size={18} />
                              </button>
                              {it.isHangerCoil && (
                                <button
                                  type="button"
                                  onClick={() => updateItemField(idx, 'showCoilDetails', !it.showCoilDetails)}
                                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                                >
                                  {it.showCoilDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>

                      {/* Coil Detail Expansion */}
                      <AnimatePresence>
                        {it.isHangerCoil && it.showCoilDetails && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-indigo-50/30"
                          >
                            <td colSpan={isHangerTenant ? 5 : 4} className="p-10 border-b border-indigo-100">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <Select label="Core Material" icon={Beaker} value={it.materialType} onChange={(e) => updateItemField(idx, 'materialType', e.target.value)}>
                                  <option value="MS">Mild Steel (MS)</option>
                                  <option value="GALVANIZED">Galvanized (GI)</option>
                                  <option value="STAINLESS_STEEL">Stainless Steel (SS)</option>
                                </Select>
                                <Input label="Gauge (mm)" icon={Globe} type="number" step="0.01" value={it.wireGaugeMm} onChange={(e) => updateItemField(idx, 'wireGaugeMm', e.target.value)} placeholder="0.00" />
                                <Input label="Heat Trace ID" icon={Hash} value={it.heatNo} onChange={(e) => updateItemField(idx, 'heatNo', e.target.value)} placeholder="X-000" />
                                <Input label="Lot Protocol" icon={FileText} value={it.lotNo} onChange={(e) => updateItemField(idx, 'lotNo', e.target.value)} />

                                <Input label="Gross Wt (kg)" icon={Package} type="number" step="0.01" value={it.grossWeightKg} onChange={(e) => updateItemField(idx, 'grossWeightKg', e.target.value)} />
                                <Input label="Tare Wt (kg)" icon={Package} type="number" step="0.01" value={it.tareWeightKg} onChange={(e) => updateItemField(idx, 'tareWeightKg', e.target.value)} />

                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-1">Net Weight Calculated</label>
                                  <div className="w-full px-4 py-3 bg-white border-2 border-indigo-100 rounded-2xl text-sm font-black text-indigo-600 shadow-sm flex items-center justify-between">
                                    {it.netWeightKg.toFixed(4)} <span className="text-[10px] text-indigo-300">KG</span>
                                  </div>
                                </div>

                                <Input label="Rate Per KG" icon={Hash} type="number" step="0.01" value={it.ratePerKg} onChange={(e) => updateItemField(idx, 'ratePerKg', e.target.value)} />

                                <div className="md:col-span-2">
                                  <Input label="Warehouse Protocol (Location)" icon={Warehouse} value={it.warehouseLocation} onChange={(e) => updateItemField(idx, 'warehouseLocation', e.target.value)} placeholder="Bin / Rack / Aisle" />
                                </div>
                                <div className="md:col-span-2">
                                  <Input label="Digital Certificate URL" icon={ExternalLink} value={it.millCertificateUrl} onChange={(e) => updateItemField(idx, 'millCertificateUrl', e.target.value)} placeholder="https://..." />
                                </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <TextArea label="Operational Remark" icon={FileText} value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Define additional notes relative to this receipt protocol..." />
            </div>
            <div className="lg:col-span-4 bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm"><ShieldCheck size={20} /></div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Authorization Check</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pending validation...</p>
                </div>
              </div>
              <div className="h-px bg-slate-100 w-full mb-4" />
              <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                "Proceeding with receipt will update warehouse inventory and manifest status for PO-{po.poNumber}. This action is logged under {createdBy}."
              </p>
            </div>
          </div>
        </form>
      </main>

      {/* Float Actions */}
      <div className="fixed bottom-8 right-8 flex gap-3">
        <button onClick={() => navigate(-1)} className="p-4 bg-white text-slate-400 rounded-full shadow-2xl border border-white hover:text-slate-600 hover:scale-110 active:scale-95 transition-all">
          <ArrowLeft size={24} />
        </button>
        <button onClick={handleSubmit} disabled={submitting} className="p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all group">
          {submitting ? <Loader className="animate-spin" size={24} /> : <Save size={24} className="group-hover:rotate-12 transition-transform" />}
        </button>
      </div>
    </div>
  );
};

export default PurchaseGrnForm;
