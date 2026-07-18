import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader, Printer, ArrowLeft, MoreHorizontal,
  Box, Calendar, Hash, Truck, Package,
  ShieldCheck, BadgeCheck, ExternalLink,
  FileText, Download, User, Info, MapPin,
  ChevronDown
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const PurchaseGrnView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grn, setGrn] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tenantInfo, setTenantInfo] = useState({ name: 'Transcold Air conditioner spare parts trading llc', address: 'Abu Dhabi', logo: '/logo.png' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${API_URL}/purchases/grns/${id}`, { headers });
        setGrn(res.data);

        const tenantId = localStorage.getItem('tenantId');
        if (tenantId) {
          try {
            const tRes = await axios.get(`${API_URL}/tenants/${tenantId}`, { headers });
            setTenantInfo(tRes.data);
          } catch (terr) { console.warn('Tenant load fail', terr); }
        }
      } catch (err) {
        console.error('Failed to load GRN', err);
        alert('System failure: Unable to synchronize with logistics database.');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 gap-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <Truck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={32} />
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-slate-800 tracking-tight">Synchronizing Logistics Data</p>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Downloading Secure Receipt Token</p>
        </div>
      </div>
    );
  }

  if (!grn) return <div className="p-12 text-center text-rose-500 font-black uppercase tracking-widest text-sm">Logistics Manifest Not Found</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-24 print:bg-white print:pb-0 font-sans">
      {/* Navigation & Status - Hidden in Print */}
      <div className="print:hidden sticky top-0 z-50">
        <div className="bg-white/80 backdrop-blur-xl border-b border-white px-8 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Inventory</span>
              <ChevronDown size={10} />
              <span className="text-emerald-600">GRN-{grn.grnNumber || grn.id}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Received & Logged</span>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-white border-b border-slate-100 flex flex-wrap gap-3 items-center shadow-sm">
          <button onClick={handlePrint} className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95">
            <Printer size={16} className="group-hover:rotate-12 transition-transform" /> Quick Print
          </button>
          <button className="group flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm">
            <Download size={16} className="group-hover:translate-y-0.5 transition-transform" /> PDF Export
          </button>
          <Link to={`/purchase-dashboard/purchase-orders/view/${grn.purchaseOrderId}`} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
            View Master PO
          </Link>
        </div>
      </div>

      {/* DOCUMENT AREA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[210mm] mx-auto mt-12 bg-white shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] print:shadow-none print:mt-0 print:w-full print:max-w-none border border-slate-100 p-16 min-h-[297mm] text-slate-800 relative rounded-[2.5rem] print:rounded-none"
      >
        {/* Visual Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-emerald-500 rounded-b-xl print:hidden" />

        {/* Header */}
        <div className="flex justify-between items-start mb-16 pb-12 border-b-2 border-slate-100">
          <div className="flex gap-8 items-center">
            {tenantInfo.logo ? (
              <div className="w-24 h-24 bg-slate-50 border border-slate-100 p-4 flex items-center justify-center rounded-3xl shadow-inner">
                <img src={tenantInfo.logo.startsWith('/') ? tenantInfo.logo : `${API_URL}/uploads/${tenantInfo.logo}`} alt="Logo" className="max-w-full max-h-full transition-all" onError={(e) => e.target.style.display = 'none'} />
              </div>
            ) : (
              <div className="w-24 h-24 bg-emerald-600 flex items-center justify-center rounded-3xl shadow-xl shadow-emerald-200">
                <Truck size={40} className="text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">{tenantInfo.companyName || tenantInfo.name}</h1>
              <p className="mt-3 text-xs font-bold text-slate-400 leading-relaxed max-w-sm lowercase">
                {tenantInfo.address || tenantInfo.location || 'Global Logistics Base'}<br />
                {tenantInfo.email && <span className="text-indigo-500 font-black">{tenantInfo.email}</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Title & Meta Grid */}
        <div className="grid grid-cols-2 gap-16 mb-16">
          <div>
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-8 leading-none">
              Goods Receipt<br /><span className="text-emerald-500">Manifest</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                  <Hash size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Receipt Sequence</p>
                  <p className="text-sm font-black text-slate-700">GRN-{grn.grnNumber || grn.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Arrival Timestamp</p>
                  <p className="text-sm font-black text-slate-700">{grn.grnDate ? new Date(grn.grnDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 shadow-inner">
            <div className="flex items-center gap-2 mb-6 text-emerald-600">
              <ShieldCheck size={14} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Inventory Authorized</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-400">Master Order</span>
                <Link to={`/purchase-dashboard/purchase-orders/view/${grn.purchaseOrderId}`} className="font-black text-indigo-600 underline">
                  PO-{grn.purchaseOrderId}
                </Link>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-400">Receiving Agent</span>
                <span className="font-black text-slate-700">{grn.createdBy || 'Unknown User'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-400">Status Protocol</span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-black uppercase tracking-widest">
                  <BadgeCheck size={10} /> Logged
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-16 border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-400">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest w-12 text-center">#</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Asset Description</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Receipt Qty</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Standard Rate</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Total (Base)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(grn.items || []).map((it, i) => (
                <tr key={it.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-8 text-xs font-black text-slate-300 text-center">{i + 1}</td>
                  <td className="px-8 py-8">
                    <div className="text-sm font-black text-slate-800 mb-1">{it.itemName}</div>
                    {it.isHangerCoil ? (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-1">
                          <Box size={8} /> Coil Manifest
                        </div>
                        {it.heatNo && <span className="text-[9px] font-bold text-slate-400">HEAT: {it.heatNo}</span>}
                        {it.lotNo && <span className="text-[9px] font-bold text-slate-400">LOT: {it.lotNo}</span>}
                      </div>
                    ) : (
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">General Inventory</div>
                    )}
                  </td>
                  <td className="px-6 py-8 text-center">
                    <span className="text-base font-black text-slate-800">{it.receivedQuantity}</span>
                    <span className="ml-2 text-[10px] font-black text-slate-400 uppercase">{it.unitName || 'Units'}</span>
                  </td>
                  <td className="px-6 py-8 text-right font-bold text-slate-500">
                    {(it.rate ?? 0).toFixed(2)}
                  </td>
                  <td className="px-8 py-8 text-right font-black text-slate-900 tabular-nums">
                    {(it.receivedQuantity * (it.rate ?? 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="grid grid-cols-2 gap-16">
          <div>
            <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex items-start gap-4 mb-8">
              <div className="p-3 bg-white rounded-2xl text-blue-500 shadow-sm shadow-blue-100"><Info size={24} /></div>
              <div>
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Receipt Protocol</h4>
                <p className="text-xs font-bold text-blue-700/60 leading-relaxed italic">
                  "Inventory listed above has been physically verified and synchronized with the warehouse management system. Total items: <span className="font-black text-blue-800">{grn.items?.length || 0}</span>."
                </p>
              </div>
            </div>

            {grn.remark && (
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Observation Notes</p>
                <p className="text-xs font-bold text-slate-500 leading-relaxed whitespace-pre-wrap">{grn.remark}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end items-center">
            <div className="w-56 h-px bg-slate-200 mb-4" />
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 text-center">Receiving Authorization</p>
            <p className="text-xs font-black text-slate-900 uppercase tracking-widest text-center">{tenantInfo.companyName || tenantInfo.name}</p>
            <div className="mt-4 flex gap-1 opacity-20">
              <BadgeCheck size={16} />
              <ShieldCheck size={16} />
            </div>
          </div>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block absolute bottom-12 right-12 text-[10px] font-black text-slate-300 uppercase tracking-widest">
          Logistics Node: v1.0.42
        </div>
      </motion.div>

      {/* Float Actions - Hidden in Print */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 print:hidden">
        <button onClick={handlePrint} className="p-4 bg-emerald-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group">
          <Printer size={24} className="group-hover:-rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default PurchaseGrnView;
