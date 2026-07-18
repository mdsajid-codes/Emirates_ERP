import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Plus, Edit, Trash2, Loader2, Search, ChevronLeft, ChevronRight,
    Eye, Play, CheckSquare, ClipboardList, Calendar, Clock, CheckCircle2,
    RefreshCw, FileText
} from 'lucide-react';
import ViewBomInformation from './ViewBomInformation';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Navy blue theme palette
const NAVY = 'rgb(17,34,85)'; // deep navy

const STATUS_CONFIG = {
    SCHEDULED: { label: 'Scheduled', bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-600' },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    PAUSED: { label: 'Paused', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
    COMPLETED: { label: 'Completed', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

const StatCard = ({ icon: Icon, label, value, accent = false }) => (
    <div className={`rounded-xl p-5 flex items-center gap-4 shadow-sm border ${accent
            ? 'bg-[#112255] border-[#1a307a] text-white'
            : 'bg-white border-gray-100 text-gray-800'
        }`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${accent ? 'bg-white/10' : 'bg-[#112255]/10'
            }`}>
            <Icon size={22} className={accent ? 'text-white' : 'text-[#112255]'} />
        </div>
        <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${accent ? 'text-blue-200' : 'text-gray-400'
                }`}>{label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${accent ? 'text-white' : 'text-[#112255]'}`}>
                {value ?? <span className="opacity-30">—</span>}
            </p>
        </div>
    </div>
);

const ManufacturingOrder = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBomModal, setShowBomModal] = useState(false);
    const [selectedBomOrder, setSelectedBomOrder] = useState(null);

    const [filters, setFilters] = useState({ search: '', status: 'All', fromDate: '', toDate: '' });
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage, size: pageSize, sort: 'id,desc',
                search: filters.search || undefined,
                status: filters.status !== 'All' ? filters.status : undefined,
                fromDate: filters.fromDate || undefined,
                toDate: filters.toDate || undefined,
            };
            const response = await axios.get(`${API_URL}/production/manufacturing-orders`, { params, ...authHeaders });
            setOrders(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalElements(response.data.totalElements || 0);
            setError(null);
        } catch (err) {
            setError('Failed to fetch manufacturing orders.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters, authHeaders]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const [finishedGoodsMap, setFinishedGoodsMap] = useState({});
    const [customerMap, setCustomerMap] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [fgRes, custRes] = await Promise.all([
                    axios.get(`${API_URL}/production/finished-goods`, authHeaders),
                    axios.get(`${API_URL}/parties`, { ...authHeaders, params: { type: 'CUSTOMER', size: 1000 } }),
                ]);
                const goods = Array.isArray(fgRes.data) ? fgRes.data : (fgRes.data.content || []);
                const fgMap = {}; goods.forEach(g => { fgMap[g.id] = g; });
                setFinishedGoodsMap(fgMap);
                const customers = Array.isArray(custRes.data) ? custRes.data : (custRes.data.content || []);
                const custMap = {}; customers.forEach(c => { custMap[c.id] = c; });
                setCustomerMap(custMap);
            } catch (err) { console.error('Failed to fetch lookup data', err); }
        };
        fetchData();
    }, [authHeaders]);

    // Stats derived from orders (best-effort from current page; ideally backend provides totals)
    const stats = useMemo(() => {
        const total = totalElements;
        const scheduled = orders.filter(o => o.status === 'SCHEDULED').length;
        const inProgress = orders.filter(o => o.status === 'IN_PROGRESS').length;
        const completed = orders.filter(o => o.status === 'COMPLETED').length;
        return { total, scheduled, inProgress, completed };
    }, [orders, totalElements]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(0);
    };

    const resetFilters = () => {
        setFilters({ search: '', status: 'All', fromDate: '', toDate: '' });
        setCurrentPage(0);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this manufacturing order?')) {
            try {
                await axios.delete(`${API_URL}/production/manufacturing-orders/${id}`, authHeaders);
                fetchOrders();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete order.'}`);
            }
        }
    };

    const handleStartOrder = async (order) => {
        try {
            const currentTime = new Date().toISOString();
            await axios.patch(`${API_URL}/production/manufacturing-orders/${order.id}/actual-time`, { actualStartTime: currentTime, actualEndTime: order.actualFinish }, authHeaders);
            await axios.put(`${API_URL}/production/manufacturing-orders/${order.id}/status`, null, { params: { status: 'IN_PROGRESS' }, ...authHeaders });
            fetchOrders();
        } catch (err) { alert('Failed to start order'); }
    };

    const handleFinishOrder = async (order) => {
        try {
            const currentTime = new Date().toISOString();
            await axios.patch(`${API_URL}/production/manufacturing-orders/${order.id}/actual-time`, { actualStartTime: order.actualStart, actualEndTime: currentTime }, authHeaders);
            await axios.put(`${API_URL}/production/manufacturing-orders/${order.id}/status`, null, { params: { status: 'COMPLETED' }, ...authHeaders });
            fetchOrders();
        } catch (err) { alert('Failed to finish order'); }
    };

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

    return (
        <div className="flex flex-col min-h-full bg-gray-50">

            {/* ── Page Header ── */}
            <div className="bg-[#112255] px-6 py-4 flex items-center justify-between shadow-md">
                <div>
                    <h1 className="text-xl font-bold text-white">Manage Manufacturing Order</h1>
                    <p className="text-xs text-blue-300 mt-0.5">Real-time production oversight and management</p>
                </div>
                <button
                    onClick={() => navigate('/production-dashboard/manage-manufacturing-order/new')}
                    className="flex items-center gap-2 bg-white text-[#112255] text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                >
                    <Plus size={16} />
                    New Manufacturing Order
                </button>
            </div>

            <div className="p-6 space-y-5">

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={ClipboardList} label="Total Orders" value={stats.total} accent={true} />
                    <StatCard icon={Calendar} label="Scheduled" value={stats.scheduled} />
                    <StatCard icon={Clock} label="In Progress" value={stats.inProgress} />
                    <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} />
                </div>

                {/* ── Filters ── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Search</label>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text" name="search"
                                    className="w-full text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                    placeholder="MO Number, Item..."
                                    value={filters.search} onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Status</label>
                            <select
                                name="status"
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                                value={filters.status} onChange={handleFilterChange}
                            >
                                <option value="All">All Statuses</option>
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="PAUSED">Paused</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">From Date</label>
                            <input type="date" name="fromDate"
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                value={filters.fromDate} onChange={handleFilterChange}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">To Date</label>
                            <div className="flex gap-2">
                                <input type="date" name="toDate"
                                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                    value={filters.toDate} onChange={handleFilterChange}
                                />
                                <button onClick={resetFilters} title="Reset filters"
                                    className="px-3 py-2 bg-[#112255]/10 text-[#112255] rounded-lg hover:bg-[#112255]/20 transition-colors text-sm"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-[#112255] text-[11px] uppercase tracking-wider text-blue-200 font-semibold">
                                    <th className="px-4 py-3 w-10 text-center border-r border-[#1e3a8a]/40">S.No</th>
                                    <th className="px-4 py-3 border-r border-[#1e3a8a]/40">SO Number</th>
                                    <th className="px-4 py-3 border-r border-[#1e3a8a]/40">Customer</th>
                                    <th className="px-4 py-3 border-r border-[#1e3a8a]/40">Reference No</th>
                                    <th className="px-4 py-3 border-r border-[#1e3a8a]/40">MO Number</th>
                                    <th className="px-4 py-3 border-r border-[#1e3a8a]/40">Item Name</th>
                                    <th className="px-4 py-3 border-r border-[#1e3a8a]/40">Item Code</th>
                                    <th className="px-4 py-3 border-r border-[#1e3a8a]/40 text-right">Qty</th>
                                    <th className="px-4 py-3 border-r border-[#1e3a8a]/40 text-center">Status</th>
                                    <th className="px-4 py-3 border-r border-[#1e3a8a]/40">Schedule Start</th>
                                    <th className="px-4 py-3 border-r border-[#1e3a8a]/40">Schedule Finish</th>
                                    <th className="px-4 py-3 border-r border-[#1e3a8a]/40">Due Date</th>
                                    <th className="px-4 py-3 border-r border-[#1e3a8a]/40">Actual Start</th>
                                    <th className="px-4 py-3 border-r border-[#1e3a8a]/40">Actual Finish</th>
                                    <th className="px-4 py-3 border-r border-[#1e3a8a]/40 text-center">BOM</th>
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={16} className="text-center py-16">
                                        <Loader2 className="h-7 w-7 animate-spin mx-auto text-primary" />
                                        <p className="text-sm text-gray-400 mt-2">Loading orders...</p>
                                    </td></tr>
                                ) : error ? (
                                    <tr><td colSpan={16} className="text-center py-16 text-red-500 text-sm">{error}</td></tr>
                                ) : orders.length === 0 ? (
                                    <tr><td colSpan={16} className="text-center py-16 text-gray-400 text-sm">
                                        <ClipboardList size={32} className="mx-auto mb-2 text-gray-300" />
                                        No manufacturing orders found
                                    </td></tr>
                                ) : (
                                    orders.map((order, index) => (
                                        <tr key={order.id} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="px-4 py-3 text-center text-xs text-gray-500">{currentPage * pageSize + index + 1}</td>
                                            <td className="px-4 py-3 font-medium text-gray-800 text-xs">{order.soNumber || '—'}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 max-w-[120px] truncate" title={order.customerName || customerMap[order.customerId]?.companyName || ''}>
                                                {order.customerName || customerMap[order.customerId]?.companyName || customerMap[order.customerId]?.primaryContactPerson || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">{order.referenceNo || '—'}</td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => navigate(`/production-dashboard/view-manufacturing-order/${order.id}`)}
                                                    className="text-[#112255] font-bold text-xs hover:underline whitespace-nowrap"
                                                >
                                                    {order.moNumber}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-medium text-gray-700 max-w-[160px] truncate" title={order.itemName || order.finishedGood?.name || finishedGoodsMap[order.finishedGoodId]?.name || ''}>
                                                {order.itemName || order.finishedGoodName || order.finishedGood?.name || finishedGoodsMap[order.finishedGoodId]?.name || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono text-gray-500">
                                                {order.itemCode || order.finishedGoodCode || order.finishedGood?.itemCode || finishedGoodsMap[order.finishedGoodId]?.itemCode || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-xs font-bold text-gray-800">{order.quantity}</td>
                                            <td className="px-4 py-3 text-center"><StatusBadge status={order.status} /></td>
                                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(order.scheduleStart)}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(order.scheduleFinish)}</td>
                                            <td className="px-4 py-3 text-xs font-medium text-red-600 whitespace-nowrap">{fmtDate(order.dueDate)}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <span>{order.actualStart ? new Date(order.actualStart).toLocaleString([], { month: '2-digit', day: '2-digit', year: 'numeric' }) : '—'}</span>
                                                    <button onClick={() => handleStartOrder(order)} title="Mark Started" className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-blue-100 text-blue-600 transition-all">
                                                        <Play size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <span>{order.actualFinish ? new Date(order.actualFinish).toLocaleString([], { month: '2-digit', day: '2-digit', year: 'numeric' }) : '—'}</span>
                                                    <button onClick={() => handleFinishOrder(order)} title="Mark Finished" className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-green-100 text-green-600 transition-all">
                                                        <CheckSquare size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => { setSelectedBomOrder(order); setShowBomModal(true); }}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#112255] hover:underline"
                                                >
                                                    <FileText size={12} /> View
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center gap-1.5">
                                                    <button onClick={() => navigate(`/production-dashboard/view-manufacturing-order/${order.id}`)}
                                                        className="p-1.5 bg-[#112255]/10 text-[#112255] rounded-lg hover:bg-[#112255]/20 transition-colors" title="View">
                                                        <Eye size={13} />
                                                    </button>
                                                    <button onClick={() => navigate(`/production-dashboard/manage-manufacturing-order/edit/${order.id}`)}
                                                        className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors" title="Edit">
                                                        <Edit size={13} />
                                                    </button>
                                                    <button onClick={() => handleDelete(order.id)}
                                                        className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors" title="Delete">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 0 && (
                        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/80 text-xs text-gray-500">
                            <span>
                                Showing {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, totalElements)} of <strong>{totalElements}</strong> results
                            </span>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                                    className="p-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40">
                                    <ChevronLeft size={14} />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    const page = currentPage < 3 ? i : currentPage - 2 + i;
                                    if (page >= totalPages) return null;
                                    return (
                                        <button key={page} onClick={() => setCurrentPage(page)}
                                            className={`w-7 h-7 rounded-lg border text-xs font-medium transition-colors ${page === currentPage ? 'bg-[#112255] text-white border-[#112255]' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                                            {page + 1}
                                        </button>
                                    );
                                })}
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
                                    className="p-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40">
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* BOM Modal */}
            {showBomModal && selectedBomOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-[92%] h-[90%] rounded-2xl shadow-2xl overflow-hidden">
                        <ViewBomInformation
                            bomId={selectedBomOrder.bomFinishedGoodId || selectedBomOrder.bom?.id || selectedBomOrder.bomId}
                            bomType={selectedBomOrder.bomFinishedGoodId ? 'FINISHED_GOOD' : 'SEMI_FINISHED'}
                            onClose={() => { setShowBomModal(false); setSelectedBomOrder(null); }}
                            quantity={selectedBomOrder.quantity}
                            startDate={selectedBomOrder.scheduleStart}
                            endDate={selectedBomOrder.scheduleFinish}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManufacturingOrder;
