import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  PlusCircle, Edit, Trash2, Loader, AlertCircle, Search, X,
  Filter, Download, ChevronRight, FileText, Calendar,
  User, Database, MapPin, RefreshCcw, History, ShoppingCart,
  Receipt
} from 'lucide-react';
import Pagination from '../../components/Pagination';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const PurchaseOrderPage = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Pagination State
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [showGrnHistory, setShowGrnHistory] = useState(false);
  const [grnHistoryData, setGrnHistoryData] = useState([]);
  const [grnHistoryLoading, setGrnHistoryLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/purchases/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, size, sort: 'createdAt,desc' }
      });

      if (res.data.content) {
        setPurchaseOrders(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      } else {
        const data = res.data || [];
        setPurchaseOrders(data);
        setTotalPages(1);
        setTotalElements(data.length);
      }
    } catch (err) {
      console.error('Failed to fetch purchase orders:', err);
      setError('Failed to fetch purchase orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, [page, size]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Purchase Order? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/purchases/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchPurchaseOrders();
    } catch (err) {
      console.error('Failed to delete PO', err);
      setError('Failed to delete purchase order.');
    }
  };

  const handleViewGrnHistory = async (order) => {
    setSelectedOrder(order);
    setShowGrnHistory(true);
    setGrnHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/purchases/grns/by-order/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGrnHistoryData(res.data || []);
    } catch (err) {
      console.error('Failed to load GRN history', err);
      setError('Failed to load GRN history for the selected order.');
    } finally {
      setGrnHistoryLoading(false);
    }
  };

  const filtered = purchaseOrders.filter(order =>
    (order.poNumber && order.poNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.supplierName && order.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.reference && order.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusStyles = (status) => {
    const s = (status || 'draft').toLowerCase();
    switch (s) {
      case 'confirmed':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
      case 'draft':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans transition-all duration-500">
      {/* Search Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <ShoppingCart className="text-white h-7 w-7" />
              </div>
              Purchase Orders
            </h1>
            <p className="text-slate-500 font-medium">Manage and track your procurement inventory</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group overflow-hidden rounded-2xl shadow-sm border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-300">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-3 w-full sm:w-80 bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-400"
              />
            </div>

            <Link
              to="/purchase-dashboard/purchase-orders/new"
              className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl shadow-indigo-200 shadow-lg font-bold transition-all duration-300 hover:-translate-y-0.5"
            >
              <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              New Order
            </Link>
          </div>
        </div>

        {/* Stats Strip (Optional visual enhancement) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2">
          {[
            { label: 'Total Orders', value: totalElements, icon: Database, color: 'indigo' },
            { label: 'Pending GRN', value: purchaseOrders.filter(o => o.status !== 'CONFIRMED').length, icon: History, color: 'amber' },
            { label: 'Total Value', value: 'AED ' + purchaseOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString(), icon: Receipt, color: 'emerald' },
            { label: 'Sync Status', value: 'Live', icon: RefreshCcw, color: 'blue' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`p-3 bg-${stat.color}-500/10 rounded-xl`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 leading-none mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-600 px-5 py-3 rounded-2xl shadow-sm"
          >
            <AlertCircle size={20} />
            <span className="font-semibold">{error}</span>
          </motion.div>
        )}

        {/* Main Table Container - Glassmorphism */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-2xl shadow-indigo-900/5 min-h-[500px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col justify-center items-center backdrop-blur-sm z-10">
              <Loader className="h-12 w-12 animate-[spin_2s_linear_infinite] text-indigo-600" />
              <p className="mt-4 font-bold text-indigo-900/40 uppercase tracking-widest text-xs animate-pulse">Loading Database...</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Date & Order</th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Supplier</th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Details</th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</th>
                      <th className="px-6 py-5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                      <th className="px-6 py-5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Quick GRN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50">
                    <AnimatePresence mode="popLayout">
                      {filtered.length > 0 ? filtered.map((order, idx) => (
                        <motion.tr
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          key={order.id}
                          className="group hover:bg-slate-50/30 transition-all duration-300 select-none"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
                                <Calendar className="h-4 w-4 text-slate-500" />
                              </div>
                              <div>
                                <Link
                                  to={`/purchase-dashboard/purchase-orders/view/${order.id}`}
                                  className="text-indigo-600 font-black text-sm hover:text-indigo-800 transition-colors flex items-center gap-1"
                                >
                                  {order.poNumber || `PO-${order.id}`}
                                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                                </Link>
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mt-1">
                                  {order.date ? new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No Date'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 border border-white">
                                {order.supplierName?.substring(0, 2).toUpperCase() || '??'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-700">{order.supplierName || 'Anonymous Supplier'}</p>
                                <p className="text-[10px] text-slate-400 font-medium">Ref: {order.reference || 'N/A'}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                <MapPin size={12} className="text-emerald-500" />
                                <span>{order.locationName || 'General Location'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                <FileText size={12} className="text-blue-500" />
                                <span>{order.projectNumber || 'Standard Project'}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full border ${getStatusStyles(order.status)} uppercase tracking-tighter`}>
                              <div className={`w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse`} />
                              {order.status || 'DRAFT'}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-right">
                            <p className="text-sm font-black text-slate-900 tabular-nums">
                              {(order.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{order.currency || 'AED'}</p>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => navigate(`/purchase-dashboard/purchase-orders/edit/${order.id}`)}
                                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                                title="Edit Order"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(order.id)}
                                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                                title="Delete Order"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-2">
                              <Link
                                to={`/purchase-dashboard/purchase-orders/${order.id}/grn/new`}
                                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-lg shadow-emerald-200 active:translate-y-0.5"
                              >
                                <PlusCircle size={14} /> Receive
                              </Link>
                              <button
                                onClick={() => handleViewGrnHistory(order)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                title="Operation History"
                              >
                                <History size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      )) : (
                        <tr>
                          <td colSpan="7" className="py-24">
                            <div className="flex flex-col items-center justify-center text-slate-300">
                              <div className="p-6 bg-slate-50 rounded-full mb-4">
                                <ShoppingCart className="h-16 w-16 opacity-20" />
                              </div>
                              <h3 className="text-xl font-black text-slate-500">Warehouse Empty</h3>
                              <p className="text-sm font-medium text-slate-400 mt-1 max-w-xs text-center">There are no purchase orders in the records. Start with 'New Order'.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination Section */}
              <div className="mt-auto border-t border-slate-100 bg-slate-50/50 p-6">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  pageSize={size}
                  onPageSizeChange={(newSize) => { setSize(newSize); setPage(0); }}
                  totalElements={totalElements}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modernized GRN History Modal */}
      <AnimatePresence>
        {showGrnHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGrnHistory(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-white/40 overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-200">
                    <History className="text-white h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">Goods Receipt History</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-0.5">Order Ref: {selectedOrder?.poNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGrnHistory(false)}
                  className="p-3 rounded-2xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                {grnHistoryLoading ? (
                  <div className="flex flex-col justify-center items-center h-60">
                    <Loader className="animate-spin h-10 w-10 text-emerald-500" />
                    <p className="mt-4 text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning History...</p>
                  </div>
                ) : grnHistoryData.length === 0 ? (
                  <div className="text-center py-20">
                    <History className="mx-auto h-20 w-20 text-slate-100 mb-4" />
                    <h3 className="text-xl font-black text-slate-700 uppercase tracking-tight">No receipts found</h3>
                    <p className="text-sm font-bold text-slate-400 mt-2 max-w-xs mx-auto">No Goods Receipt Notes have been issued against this purchase order yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {grnHistoryData.map((grn, gIdx) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: gIdx * 0.1 }}
                        key={grn.id}
                        className="bg-slate-50 border border-slate-100 rounded-3xl p-6 hover:border-emerald-200 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center font-black text-emerald-600 text-xs shadow-sm">
                              #{gIdx + 1}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{grn.grnNumber}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{grn.grnDate ? new Date(grn.grnDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Unknown Date'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/purchase-dashboard/grns/${grn.id}`)}
                            className="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-100 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                          >
                            Inspection View
                          </button>
                        </div>

                        <div className="bg-white/50 border border-slate-100 rounded-2xl p-4 overflow-x-auto">
                          <table className="w-full text-left">
                            <thead className="border-b border-slate-100">
                              <tr>
                                <th className="pb-2 text-[10px] font-black text-slate-400 uppercase">Item Description</th>
                                <th className="pb-2 text-[10px] font-black text-slate-400 uppercase text-right w-32">Received Qty</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {(grn.items || []).map((item, iIdx) => (
                                <tr key={iIdx}>
                                  <td className="py-2.5 text-xs font-bold text-slate-700">{item.itemName || item.description || '--'}</td>
                                  <td className="py-2.5 text-xs font-black text-emerald-600 text-right tabular-nums">{item.receivedQuantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-slate-100/50 bg-slate-50/30">
                <button
                  onClick={() => setShowGrnHistory(false)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:translate-y-0.5"
                >
                  Dismiss Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
};

export default PurchaseOrderPage;
