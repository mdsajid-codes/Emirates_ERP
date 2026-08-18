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
    <div className="bg-[#F7F9FD] min-h-screen text-[#0A2551] font-sans pb-10 -mt-3 lg:-mt-4 -mx-3 lg:-mx-4">
      {/* Top Action Bar */}
      <div className="print:hidden sticky top-0 z-50 bg-white border-b border-[#DFE7F4] px-6 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-[#0A2551]">
            <ArrowLeft size={18} />
          </button>
          <span className="text-xs font-semibold text-[#617191]">
            Inventory / Goods Receipt / <strong className="text-[#0A2551]">GRN-{grn.grnNumber || grn.id}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/purchase-dashboard/purchase-orders/view/${grn.purchaseOrderId}`} className="flex items-center gap-2 h-[38px] px-4 bg-white border border-[#DFE7F4] rounded-xl text-xs font-bold hover:border-[#00A9A8] hover:text-[#00A9A8] transition-all cursor-pointer">
            View Master PO
          </Link>
          <button onClick={handlePrint} className="flex items-center gap-2 h-[38px] px-5 bg-[#00A9A8] text-white rounded-xl text-xs font-bold hover:bg-[#008f8e] transition-all cursor-pointer shadow-xs">
            <Printer size={14} /> Quick Print
          </button>
        </div>
      </div>

      {/* FULL SCREEN DASHBOARD CONTENT */}
      <div className="w-full px-4 pt-3 pb-4 space-y-3">
        {/* Main Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          <div className="lg:col-span-8 bg-white border border-[#DFE7F4] rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#00A9A8] rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
                <Truck size={28} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#617191] uppercase tracking-wider block">GOODS RECEIPT MANIFEST</span>
                <h1 className="text-2xl font-black text-[#0A2551] tracking-tight leading-none mt-0.5">GRN-{grn.grnNumber || grn.id}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-0.5 bg-[#DCFAEE] text-[#138764] rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <BadgeCheck size={12} /> Received & Synchronized
                  </span>
                </div>
              </div>
            </div>

            {(tenantInfo.companyName || tenantInfo.name) && (
              <div className="border-l-2 border-[#DFE7F4] pl-6 py-1 max-w-md">
                <h2 className="text-base font-black text-[#0A2551] leading-snug">{tenantInfo.companyName || tenantInfo.name}</h2>
                {(tenantInfo.address || tenantInfo.location) && (
                  <p className="text-xs font-medium text-[#617191] mt-1 flex items-center gap-1">
                    <MapPin size={13} className="text-[#00A9A8]" /> {tenantInfo.address || tenantInfo.location}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 bg-[#006A78] text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold text-[#A3E5EC]">Master Order</span>
              <Link to={`/purchase-dashboard/purchase-orders/view/${grn.purchaseOrderId}`} className="text-xs font-bold text-white underline">
                PO-{grn.purchaseOrderId}
              </Link>
            </div>
            <div className="my-2">
              <span className="text-[10.5px] font-semibold text-[#A3E5EC] block">Arrival Date</span>
              <strong className="text-base font-black text-white block mt-0.5">
                {grn.grnDate ? new Date(grn.grnDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
              </strong>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs">
              <span className="text-[#A3E5EC]">Logged By</span>
              <span className="font-bold text-white">{grn.createdBy || 'Authorized Agent'}</span>
            </div>
          </div>
        </div>

        {/* Received Items Table */}
        <div className="bg-white border border-[#DFE7F4] rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#DFE7F4] bg-[#F8FAFC] flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#00A9A8]/10 text-[#00A9A8] flex items-center justify-center font-bold">
                <Package size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#0A2551] uppercase tracking-wider">RECEIVED INVENTORY LINES</h3>
                <p className="text-[10.5px] font-medium text-[#617191]">Verified physical items added to warehouse stock</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#F2F6FC] border-b border-[#DFE7F4] text-[#617191] uppercase text-[10.5px] font-bold">
                  <th className="px-4 py-3 text-left">Line Item Specification</th>
                  <th className="px-4 py-3 text-[#0A2551] text-right font-bold">Received Quantity</th>
                  <th className="px-4 py-3 text-[#0A2551] text-right font-bold">Unit Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE7F4]">
                {(grn.items || []).map((it, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-[#0A2551] block">{it.itemName || `Item #${it.purchaseOrderItemId}`}</span>
                      {it.warehouseLocation && (
                        <span className="text-[10px] font-medium text-[#617191] flex items-center gap-1 mt-0.5">
                          <Warehouse size={11} className="text-[#00A9A8]" /> Loc: {it.warehouseLocation}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-[#0A2551]">
                      {it.receivedQuantity} Units
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#0A2551]">
                      AED {Number(it.rate || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {grn.remark && (
          <div className="bg-white border border-[#DFE7F4] rounded-2xl p-4 shadow-xs">
            <span className="text-[10.5px] font-bold text-[#617191] uppercase block mb-1">Operational Remarks</span>
            <p className="text-xs font-semibold text-[#0A2551] whitespace-pre-wrap">{grn.remark}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseGrnView;
