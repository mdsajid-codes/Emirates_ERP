import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Search, Edit } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getStatusColor = (status) => {
    switch (status) {
        case 'SCHEDULED': return 'text-blue-600 bg-blue-100';
        case 'IN_PROGRESS': return 'text-amber-600 bg-amber-100';
        case 'PAUSED': return 'text-orange-600 bg-orange-100';
        case 'COMPLETED': return 'text-green-600 bg-green-100';
        case 'CANCELLED': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
    }
};

const MyProductionPlan = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'All'
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                search: filters.search || undefined,
                status: filters.status !== 'All' ? filters.status : undefined,
                sort: 'id,desc'
            };

            const response = await axios.get(`${API_URL}/production/manufacturing-orders`, {
                params,
                ...authHeaders
            });

            setOrders(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            setError(null);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError('Failed to fetch manufacturing orders.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters, authHeaders]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(0);
    };

    const [finishedGoodsMap, setFinishedGoodsMap] = useState({});
    const [customerMap, setCustomerMap] = useState({});
    const [salesOrderMap, setSalesOrderMap] = useState({});
    const [materialStatusCache, setMaterialStatusCache] = useState({});

    // Fetch material status for orders
    useEffect(() => {
        const fetchMaterialStatuses = async () => {
            if (!orders.length) return;

            const newCache = { ...materialStatusCache };
            const idsToFetch = orders.filter(o => !newCache[o.id]).map(o => o.id);

            if (idsToFetch.length === 0) return;

            try {
                await Promise.all(idsToFetch.map(async (id) => {
                    try {
                        const res = await axios.get(`${API_URL}/materials/requisition/by-mo/${id}`, authHeaders);
                        if (res.data) {
                            newCache[id] = res.data.materialStatus || 'PENDING';
                        }
                    } catch (err) {
                        // If 404 or other error, possibly no requisition exists yet
                        newCache[id] = 'PENDING';
                    }
                }));
                setMaterialStatusCache(newCache);
            } catch (err) {
                console.error("Error fetching material statuses", err);
            }
        };

        fetchMaterialStatuses();
    }, [orders, authHeaders]);

    const getMaterialStatusColor = (status) => {
        if (!status) return 'text-gray-400';
        switch (status.toUpperCase()) {
            case 'APPROVED': return 'text-green-600 bg-green-50';
            case 'REJECTED': return 'text-red-600 bg-red-50';
            case 'PENDING': return 'text-amber-600 bg-amber-50';
            default: return 'text-gray-600';
        }
    };

    // Fetch properties for lookup
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [fgRes, custRes, soRes] = await Promise.all([
                    axios.get(`${API_URL}/production/finished-goods`, authHeaders),
                    axios.get(`${API_URL}/parties`, { ...authHeaders, params: { type: 'CUSTOMER', size: 1000 } }),
                    axios.get(`${API_URL}/sales/orders`, { ...authHeaders, params: { size: 1000 } })
                ]);

                // Process Finished Goods
                const goods = Array.isArray(fgRes.data) ? fgRes.data : (fgRes.data.content || []);
                const fgMap = {};
                goods.forEach(g => { fgMap[g.id] = g; });
                setFinishedGoodsMap(fgMap);

                // Process Customers
                const customers = Array.isArray(custRes.data) ? custRes.data : (custRes.data.content || []);
                const custMap = {};
                customers.forEach(c => { custMap[c.id] = c; });
                setCustomerMap(custMap);

                // Process Sales Orders
                const sos = Array.isArray(soRes.data) ? soRes.data : (soRes.data.content || []);
                const soMap = {};
                sos.forEach(s => { soMap[s.id] = s; });
                setSalesOrderMap(soMap);

            } catch (err) {
                console.error("Failed to fetch lookup data", err);
            }
        };
        fetchData();
    }, [authHeaders]);

    const formatDate = (dateString, time = true) => {
        if (!dateString) return '-';
        const opts = { year: 'numeric', month: '2-digit', day: '2-digit' };
        if (time) { opts.hour = '2-digit'; opts.minute = '2-digit'; opts.hour12 = true; }
        return new Date(dateString).toLocaleString('en-GB', opts);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="bg-primary p-4 flex justify-between items-center text-white shadow-sm">
                <div>
                    <h1 className="text-xl font-bold">My Production Plan</h1>
                    <div className="text-sm opacity-80">Home &gt; Production &gt; My Production Plan</div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Filters Section */}
                <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
                        <div className="w-full md:w-64">
                            <label className="block text-xs font-bold text-gray-700 mb-1">MO Status</label>
                            <select
                                name="status"
                                className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-primary bg-gray-50"
                                value={filters.status}
                                onChange={handleFilterChange}
                            >
                                <option value="All">In Progress/Paused/Scheduled</option>
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="PAUSED">Paused</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                        <div className="w-full md:w-64">
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"><Search className="w-4 h-4 text-gray-400" /></div>
                                <input
                                    type="text"
                                    name="search"
                                    className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-primary"
                                    placeholder="Search..."
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-2 border-b flex items-center gap-2 bg-gray-50">
                        <select
                            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary"
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-primary text-white font-bold border-b text-[10px] uppercase">
                                <tr>
                                    <th className="px-2 py-3 border-r border-blue-400 w-10 text-center">S.No.</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">SO Number</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">Customer</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">Reference No.</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">MO Number</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap w-48">Item Details</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">Item Code</th>
                                    <th className="px-2 py-3 border-r border-blue-400 text-center whitespace-nowrap">MO Qty</th>
                                    <th className="px-2 py-3 border-r border-blue-400 text-center whitespace-nowrap">Done Qty</th>
                                    <th className="px-2 py-3 border-r border-blue-400 text-center whitespace-nowrap">Pending Qty</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">Status</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">Material Status</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap w-32">Schedule Start</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap w-32">Schedule Finish</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap w-32">Actual Start</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap w-32">Actual Finish</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">Assign Employee</th>
                                    <th className="px-2 py-3 text-center w-16">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="18" className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
                                ) : error ? (
                                    <tr><td colSpan="18" className="text-center py-10 text-red-500">{error}</td></tr>
                                ) : orders.length === 0 ? (
                                    <tr><td colSpan="18" className="text-center py-10 font-medium text-gray-500">No manufacturing orders found</td></tr>
                                ) : (
                                    orders.map((order, index) => (
                                        <tr key={order.id} className="border-b hover:bg-gray-50 text-gray-700 transition-colors text-[11px]">
                                            <td className="px-2 py-2 border-r text-center">{currentPage * pageSize + index + 1}</td>
                                            <td className="px-2 py-2 border-r font-medium text-gray-800">
                                                {order.soNumber || order.salesOrder?.soNumber || salesOrderMap[order.salesOrderId]?.soNumber || '-'}
                                            </td>
                                            <td className="px-2 py-2 border-r truncate max-w-[120px]" title={order.customerName || (customerMap[order.customerId]?.companyName)}>
                                                {order.customerName || (customerMap[order.customerId]?.companyName || customerMap[order.customerId]?.primaryContactPerson) || '-'}
                                            </td>
                                            <td className="px-2 py-2 border-r">{order.referenceNo || '-'}</td>
                                            <td className="px-2 py-2 border-r font-medium text-gray-800">{order.moNumber}</td>
                                            <td className="px-2 py-2 border-r truncate max-w-[180px]" title={order.itemName || order.finishedGoodName || order.finishedGood?.name || (finishedGoodsMap[order.finishedGoodId]?.name)}>
                                                {order.itemName || order.finishedGoodName || order.finishedGood?.name || (finishedGoodsMap[order.finishedGoodId]?.name) || '-'}
                                            </td>
                                            <td className="px-2 py-2 border-r font-mono">
                                                {order.itemCode || order.finishedGoodCode || order.finishedGood?.code || order.finishedGood?.itemCode || (finishedGoodsMap[order.finishedGoodId]?.itemCode) || '-'}
                                            </td>
                                            <td className="px-2 py-2 border-r text-center font-bold">{order.quantity}</td>
                                            <td className="px-2 py-2 border-r text-center">{order.finishedQuantity || 0}</td>
                                            <td className="px-2 py-2 border-r text-center font-medium">{(order.quantity || 0) - (order.finishedQuantity || 0)}</td>
                                            <td className="px-2 py-2 border-r">
                                                <span className={getStatusColor(order.status).replace('uppercase', '').replace('font-bold', '') + " px-1 py-0.5 rounded text-[10px]"}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2 border-r text-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap font-medium ${getMaterialStatusColor(materialStatusCache[order.id])}`}>
                                                    {materialStatusCache[order.id] || '-'}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2 border-r whitespace-normal break-words leading-tight">{formatDate(order.scheduleStart)}</td>
                                            <td className="px-2 py-2 border-r whitespace-normal break-words leading-tight">{formatDate(order.scheduleFinish)}</td>
                                            <td className="px-2 py-2 border-r whitespace-normal break-words leading-tight">{formatDate(order.actualStart)}</td>
                                            <td className="px-2 py-2 border-r whitespace-normal break-words leading-tight">{formatDate(order.actualFinish)}</td>
                                            <td className="px-2 py-2 border-r whitespace-nowrap">
                                                {order.assignToName || (order.assignTo ? `${order.assignTo.firstName} ${order.assignTo.lastName}` : '')}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                <button
                                                    onClick={() => navigate(`/production-dashboard/manage-manufacturing-order/edit/${order.id}`)}
                                                    className="p-1.5 bg-[#0088CC] text-white rounded hover:bg-[#0077B5] transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 0 && (
                        <div className="p-3 border-t flex justify-between items-center text-xs text-gray-500 bg-gray-50">
                            <span>Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, orders.length + currentPage * pageSize)} of {orders.length} entries</span>
                            <div className="flex gap-1">
                                <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="px-3 py-1 border bg-white rounded hover:bg-gray-100 disabled:opacity-50">Previous</button>
                                <button className="px-3 py-1 border bg-[#2C3E50] text-white rounded">{currentPage + 1}</button>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} className="px-3 py-1 border bg-white rounded hover:bg-gray-100 disabled:opacity-50">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyProductionPlan;
