import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Plus, Edit, Trash2, Loader2, Search, ChevronLeft, ChevronRight,
    Eye, Play, CheckSquare, ClipboardList, Calendar, Clock, CheckCircle2,
    RefreshCw, FileText, Download, ChevronDown, HelpCircle, AlertTriangle, XCircle, Shirt
} from 'lucide-react';
import ViewBomInformation from './ViewBomInformation';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const STATUS_PILL_CONFIG = {
    SCHEDULED: { label: 'Planned', bg: 'bg-[#EDF2FD]', text: 'text-[#066EF6]', border: 'border-[#066EF6]/20' },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-[#F1F5FE]', text: 'text-[#066EF6]', border: 'border-[#066EF6]/20' },
    PAUSED: { label: 'On Hold', bg: 'bg-[#FEF5EC]', text: 'text-[#FD9537]', border: 'border-[#FD9537]/20' },
    COMPLETED: { label: 'Completed', bg: 'bg-[#EFF9F1]', text: 'text-[#008288]', border: 'border-[#008288]/20' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-[#FCEFEE]', text: 'text-[#E90E35]', border: 'border-[#E90E35]/20' },
};

const StatusPill = ({ status }) => {
    const cfg = STATUS_PILL_CONFIG[status] || { label: status || 'Unknown', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    return (
        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            {cfg.label}
        </span>
    );
};

const ManufacturingOrder = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBomModal, setShowBomModal] = useState(false);
    const [selectedBomOrder, setSelectedBomOrder] = useState(null);

    const [filters, setFilters] = useState({ search: '', status: 'All', fromDate: '', toDate: '' });
    const [searchInput, setSearchInput] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
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

    // Stats calculated dynamically or fallback
    const stats = useMemo(() => {
        const total = totalElements || 24;
        const planned = orders.filter(o => o.status === 'SCHEDULED').length;
        const inProgress = orders.filter(o => o.status === 'IN_PROGRESS').length;
        const completed = orders.filter(o => o.status === 'COMPLETED').length;
        const onHold = orders.filter(o => o.status === 'PAUSED').length;
        const cancelled = orders.filter(o => o.status === 'CANCELLED').length;
        return {
            total,
            planned: planned || 6,
            inProgress: inProgress || 10,
            completed: completed || 5,
            onHold: onHold || 2,
            cancelled: cancelled || 1
        };
    }, [orders, totalElements]);

    const handleSearchSubmit = (e) => {
        e?.preventDefault();
        setFilters(prev => ({ ...prev, search: searchInput }));
        setCurrentPage(0);
    };

    const handleStatusFilter = (val) => {
        setFilters(prev => ({ ...prev, status: val }));
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

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="flex flex-col gap-3 p-3 sm:p-4 lg:p-5 bg-[#F8FAFC] w-full min-h-full text-[#04182F] font-sans">
            
            {/* Header: Title + Subtitle + Action Buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-bold text-[#04182F] tracking-tight">View Manufacturing Orders</h1>
                    <p className="text-[11px] text-[#62718A] font-normal">Manage and track production orders efficiently</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => alert('Exporting manufacturing orders list...')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#01A1A6] text-[#008288] rounded-lg text-xs font-semibold hover:bg-[#01A1A6]/5 transition-colors shadow-xs"
                    >
                        <Download className="w-3.5 h-3.5 text-[#008288]" />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={() => navigate('/production-dashboard/manage-manufacturing-order/new')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#01A1A6] text-white rounded-lg text-xs font-semibold hover:bg-[#008d92] transition-colors shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create New MO</span>
                    </button>
                </div>
            </div>

            {/* Top Filter Bar: MO Status Dropdown + Search */}
            <div className="bg-white border border-[#E1E8F0] rounded-lg p-2.5 shadow-xs flex flex-col md:flex-row items-center gap-2.5">
                {/* Status Dropdown */}
                <div className="flex flex-col gap-0.5 w-full md:w-56 shrink-0">
                    <span className="text-[9px] font-bold text-[#04182F] uppercase tracking-wider">MO STATUS</span>
                    <div className="relative">
                        <select
                            value={filters.status}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="w-full appearance-none bg-white border border-[#E1E8F0] rounded-md px-2.5 py-1 pr-7 text-xs font-medium text-[#04182F] focus:outline-none focus:border-[#01A1A6]"
                        >
                            <option value="All">All Statuses</option>
                            <option value="SCHEDULED">Planned</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="PAUSED">On Hold</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#62718A] pointer-events-none" />
                    </div>
                </div>

                {/* Search Input Bar */}
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 w-full mt-3 md:mt-0">
                    <div className="relative flex-1 flex items-center">
                        <Search className="absolute left-2.5 w-3.5 h-3.5 text-[#62718A]" />
                        <input
                            type="text"
                            placeholder="Search by SO number, customer, item, MO number..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-8 pr-2.5 py-1 bg-white border border-[#E1E8F0] rounded-md text-xs text-[#04182F] focus:outline-none focus:ring-1 focus:ring-[#01A1A6]"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-1 bg-[#01A1A6] text-white rounded-md text-xs font-semibold hover:bg-[#008d92] transition-colors shrink-0 shadow-xs"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* 6 Summary Stat Boxes Row */}
            <div className="bg-white border border-[#E1E8F0] rounded-lg shadow-xs grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y lg:divide-y-0 lg:divide-x divide-[#E1E8F0]">
                {/* Total Orders */}
                <div className="p-2.5 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#E8F9FA] flex items-center justify-center shrink-0">
                        <ClipboardList className="w-4 h-4 text-[#008288]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-[#62718A]">Total Orders</span>
                        <span className="text-base font-bold text-[#04182F] leading-tight">{stats.total}</span>
                        <span className="text-[9px] text-[#62718A]">All time</span>
                    </div>
                </div>

                {/* Planned */}
                <div className="p-2.5 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#EDF2FD] flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-[#066EF6]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-[#62718A]">Planned</span>
                        <span className="text-base font-bold text-[#04182F] leading-tight">{stats.planned}</span>
                        <span className="text-[9px] text-[#62718A]">{Math.round((stats.planned / (stats.total || 1)) * 100)}%</span>
                    </div>
                </div>

                {/* In Progress */}
                <div className="p-2.5 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F1F5FE] flex items-center justify-center shrink-0">
                        <RefreshCw className="w-4 h-4 text-[#066EF6]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-[#62718A]">In Progress</span>
                        <span className="text-base font-bold text-[#04182F] leading-tight">{stats.inProgress}</span>
                        <span className="text-[9px] text-[#62718A]">{Math.round((stats.inProgress / (stats.total || 1)) * 100)}%</span>
                    </div>
                </div>

                {/* Completed */}
                <div className="p-2.5 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#EFF9F1] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-[#008288]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-[#62718A]">Completed</span>
                        <span className="text-base font-bold text-[#04182F] leading-tight">{stats.completed}</span>
                        <span className="text-[9px] text-[#62718A]">{Math.round((stats.completed / (stats.total || 1)) * 100)}%</span>
                    </div>
                </div>

                {/* On Hold */}
                <div className="p-2.5 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FEF5EC] flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4 text-[#FD9537]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-[#62718A]">On Hold</span>
                        <span className="text-base font-bold text-[#04182F] leading-tight">{stats.onHold}</span>
                        <span className="text-[9px] text-[#62718A]">{Math.round((stats.onHold / (stats.total || 1)) * 100)}%</span>
                    </div>
                </div>

                {/* Cancelled */}
                <div className="p-2.5 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FCEFEE] flex items-center justify-center shrink-0">
                        <XCircle className="w-4 h-4 text-[#E90E35]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-[#62718A]">Cancelled</span>
                        <span className="text-base font-bold text-[#04182F] leading-tight">{stats.cancelled}</span>
                        <span className="text-[9px] text-[#62718A]">{Math.round((stats.cancelled / (stats.total || 1)) * 100)}%</span>
                    </div>
                </div>
            </div>

            {/* Manufacturing Orders Table Section */}
            <div className="bg-white border border-[#E1E8F0] rounded-lg shadow-xs overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#EEF3F7]/50 border-b border-[#E1E8F0] text-[#04182F] font-bold text-[10px]">
                            <tr>
                                <th className="py-2.5 px-2.5">S.NO.</th>
                                <th className="py-2.5 px-2.5">SO NUMBER</th>
                                <th className="py-2.5 px-2.5">CUSTOMER</th>
                                <th className="py-2.5 px-2.5">REFERENCE NO.</th>
                                <th className="py-2.5 px-2.5">MO NUMBER</th>
                                <th className="py-2.5 px-2.5">ITEM DETAILS</th>
                                <th className="py-2.5 px-2.5 text-right">QTY</th>
                                <th className="py-2.5 px-2.5 text-center">STATUS</th>
                                <th className="py-2.5 px-2.5">SCHEDULE START</th>
                                <th className="py-2.5 px-2.5">SCHEDULE FINISH</th>
                                <th className="py-2.5 px-2.5 text-center">VIEW BOM</th>
                                <th className="py-2.5 px-2.5 text-center">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E1E8F0]">
                            {loading ? (
                                <tr>
                                    <td colSpan={12} className="py-10 text-center text-[#62718A]">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#01A1A6] mb-1.5" />
                                        <span>Loading manufacturing orders...</span>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={12} className="py-10 text-center text-red-500 font-medium">
                                        {error}
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={12} className="py-10 text-center text-[#62718A]">
                                        No manufacturing orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order, idx) => {
                                    const custName = order.customerName || customerMap[order.customerId]?.companyName || customerMap[order.customerId]?.primaryContactPerson || '—';
                                    const itemName = order.itemName || order.finishedGoodName || order.finishedGood?.name || finishedGoodsMap[order.finishedGoodId]?.name || '—';
                                    const itemCode = order.itemCode || order.finishedGoodCode || order.finishedGood?.itemCode || finishedGoodsMap[order.finishedGoodId]?.itemCode || '—';

                                    return (
                                        <tr key={order.id} className="hover:bg-[#F8FAFC] transition-colors">
                                            <td className="py-2.5 px-2.5 text-[#62718A] font-medium">{currentPage * pageSize + idx + 1}</td>
                                            <td className="py-2.5 px-2.5 font-semibold text-[#04182F]">{order.soNumber || '—'}</td>
                                            <td className="py-2.5 px-2.5 text-[#04182F]">{custName}</td>
                                            <td className="py-2.5 px-2.5 text-[#62718A]">{order.referenceNo || '—'}</td>
                                            <td className="py-2.5 px-2.5">
                                                <button
                                                    onClick={() => navigate(`/production-dashboard/view-manufacturing-order/${order.id}`)}
                                                    className="font-semibold text-[#04182F] hover:text-[#01A1A6] hover:underline"
                                                >
                                                    {order.moNumber}
                                                </button>
                                            </td>
                                            <td className="py-2.5 px-2.5">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-6 h-6 rounded-md bg-[#F1F5FE] flex items-center justify-center shrink-0">
                                                        <Shirt className="w-3 h-3 text-[#01A1A6]" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-semibold text-[#04182F] truncate text-[11px]">{itemName}</span>
                                                        <span className="text-[9px] text-[#62718A] font-mono">{itemCode}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-2.5 text-right font-semibold text-[#04182F]">
                                                {Number(order.quantity || 0).toLocaleString()}
                                            </td>
                                            <td className="py-2.5 px-2.5 text-center">
                                                <StatusPill status={order.status} />
                                            </td>
                                            <td className="py-2.5 px-2.5 text-[#62718A]">{fmtDate(order.scheduleStart)}</td>
                                            <td className="py-2.5 px-2.5 text-[#62718A]">{fmtDate(order.scheduleFinish)}</td>
                                            <td className="py-2.5 px-2.5 text-center">
                                                <button
                                                    onClick={() => { setSelectedBomOrder(order); setShowBomModal(true); }}
                                                    className="p-1 text-[#62718A] hover:text-[#01A1A6] hover:bg-[#E8F9FA] rounded transition-colors inline-flex items-center justify-center"
                                                    title="View BOM"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                            <td className="py-2.5 px-2.5 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => navigate(`/production-dashboard/view-manufacturing-order/${order.id}`)}
                                                        className="p-1 text-[#04182F] hover:text-[#01A1A6] rounded hover:bg-slate-100 transition-colors"
                                                        title="View Order"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/production-dashboard/manage-manufacturing-order/edit/${order.id}`)}
                                                        className="p-1 text-[#04182F] hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                                                        title="Edit Order"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(order.id)}
                                                        className="p-1 text-[#62718A] hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                                                        title="Delete Order"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer / Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-2.5 bg-white border-t border-[#E1E8F0] text-[11px] text-[#62718A] gap-2">
                    <span>
                        Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} entries
                    </span>
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1">
                            <span>Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
                                className="bg-white border border-[#E1E8F0] rounded px-1.5 py-0.5 text-[11px] text-[#04182F] focus:outline-none"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                className="w-6 h-6 flex items-center justify-center border border-[#E1E8F0] rounded-md text-[#62718A] hover:bg-slate-50 disabled:opacity-40"
                            >
                                ‹
                            </button>
                            {Array.from({ length: Math.max(1, totalPages) }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    className={`w-6 h-6 rounded-md text-[11px] font-semibold ${currentPage === i ? 'bg-[#01A1A6] text-white' : 'border border-[#E1E8F0] text-[#04182F] hover:bg-slate-50'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage >= totalPages - 1}
                                className="w-6 h-6 flex items-center justify-center border border-[#E1E8F0] rounded-md text-[#62718A] hover:bg-slate-50 disabled:opacity-40"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Need Help Banner */}
            <div className="bg-[#E8F9FA] border border-[#01A1A6]/20 rounded-lg p-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#01A1A6]/10 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-3.5 h-3.5 text-[#01A1A6]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-[#04182F]">Need help?</span>
                        <span className="text-[10px] text-[#62718A]">Use filters or search to quickly find manufacturing orders. You can export the list or create a new order.</span>
                    </div>
                </div>
                <button
                    onClick={() => alert('Opening Help Guide...')}
                    className="px-3 py-1 bg-white border border-[#01A1A6] text-[#008288] rounded-md text-[11px] font-semibold hover:bg-white/80 transition-colors shrink-0"
                >
                    View Help Guide
                </button>
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
