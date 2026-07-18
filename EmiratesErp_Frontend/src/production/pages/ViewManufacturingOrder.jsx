import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Eye, Search, Filter, ChevronLeft, ChevronRight, Loader2, Edit, Printer, Paperclip, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ViewBomInformation from './ViewBomInformation';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ViewManufacturingOrder = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Check if ID is present

    // State for LIST view
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // State for DETAIL view
    const [order, setOrder] = useState(null);
    const [company, setCompany] = useState(null);
    const [bom, setBom] = useState(null);
    const [error, setError] = useState(null);
    const attachmentRef = useRef(null);

    // State for BOM Modal
    const [selectedBomOrder, setSelectedBomOrder] = useState(null);

    const [loading, setLoading] = useState(true);
    const pageSize = 10;

    // State for Reference Maps
    const [finishedGoodsMap, setFinishedGoodsMap] = useState({});
    const [customerMap, setCustomerMap] = useState({});
    const [salesOrderMap, setSalesOrderMap] = useState({});

    useEffect(() => {
        const fetchLookupData = async () => {
            try {
                const token = localStorage.getItem('token');
                const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

                const [fgRes, custRes, soRes] = await Promise.all([
                    axios.get(`${API_URL}/production/finished-goods`, authHeaders),
                    axios.get(`${API_URL}/parties`, { ...authHeaders, params: { type: 'CUSTOMER', size: 1000 } }),
                    axios.get(`${API_URL}/sales/orders`, { ...authHeaders, params: { size: 1000 } })
                ]);

                // Maps
                const fgMap = {};
                (fgRes.data.content || fgRes.data || []).forEach(g => fgMap[g.id] = g);
                setFinishedGoodsMap(fgMap);

                const custMap = {};
                (custRes.data.content || custRes.data || []).forEach(c => custMap[c.id] = c);
                setCustomerMap(custMap);

                const soMap = {};
                (soRes.data.content || soRes.data || []).forEach(s => soMap[s.id] = s);
                setSalesOrderMap(soMap);

            } catch (e) {
                console.error("Failed to load lookup data", e);
            }
        };
        fetchLookupData();
    }, []);

    useEffect(() => {
        if (id) {
            fetchOrderDetail(id);
        } else {
            fetchOrdersList();
        }
    }, [id, page, statusFilter, searchQuery]); // Dependencies for List view re-fetching

    // --- LIST VIEW LOGIC ---
    const fetchOrdersList = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const params = {
                page: page,
                size: pageSize,
                sort: 'createdAt,desc'
            };

            if (statusFilter) params.status = statusFilter;
            if (searchQuery) params.search = searchQuery;

            const response = await axios.get(`${API_URL}/production/manufacturing-orders`, { headers, params });

            if (response.data && response.data.content) {
                setOrders(response.data.content);
                setTotalPages(response.data.totalPages);
                setTotalElements(response.data.totalElements);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching (view) manufacturing orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setPage(0);
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(0);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) setPage(newPage);
    };

    const handleViewBom = (order) => {
        if (order.bomId || order.bomFinishedGoodId) {
            setSelectedBomOrder(order);
        } else {
            alert("No BOM associated with this order.");
        }
    };

    // --- DETAIL VIEW LOGIC ---
    const fetchOrderDetail = async (orderId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [orderRes, companyRes] = await Promise.all([
                axios.get(`${API_URL}/production/manufacturing-orders/${orderId}`, { headers }),
                axios.get(`${API_URL}/company-info`, { headers }).catch(() => ({ data: null }))
            ]);

            const orderData = orderRes.data;
            setOrder(orderData);
            setCompany(companyRes.data);

            if (orderData.bomId || orderData.bomFinishedGoodId) {
                try {
                    const isFinishedGoodBom = !!orderData.bomFinishedGoodId;
                    const endpoint = isFinishedGoodBom
                        ? `${API_URL}/production/bom-finished-goods/${orderData.bomFinishedGoodId}`
                        : `${API_URL}/production/bom-semi-finished/${orderData.bomId}`;

                    const bomRes = await axios.get(endpoint, { headers });
                    setBom(bomRes.data);
                } catch (e) { console.error("Failed to load BOM", e); }
            }

            // Fetch Finished Goods for lookup if needed
            if (!orderData.itemCode && orderData.finishedGoodId) {
                try {
                    const fgRes = await axios.get(`${API_URL}/production/finished-goods/${orderData.finishedGoodId}`, { headers });
                    if (fgRes.data) {
                        setOrder(prev => ({
                            ...prev,
                            itemName: prev.itemName || fgRes.data.name,
                            itemCode: prev.itemCode || fgRes.data.itemCode || fgRes.data.code
                        }));
                    }
                } catch (e) { console.error("Failed to load Finished Good details", e); }
            }

        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load manufacturing order details.");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => window.print();

    const scrollToAttachments = () => {
        if (attachmentRef.current) attachmentRef.current.scrollIntoView({ behavior: 'smooth' });
        else if (!order?.files?.length) alert("No attachments found.");
    };

    const handleViewFile = async (fileId, fileName) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/production/manufacturing-orders/files/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const file = new Blob([response.data], { type: response.headers['content-type'] });
            window.open(URL.createObjectURL(file), '_blank');
        } catch (error) {
            console.error("Error viewing file:", error);
            alert("Failed to view file.");
        }
    };

    const formatDate = (dateString, time = true) => {
        if (!dateString) return '-';
        const opts = { year: 'numeric', month: '2-digit', day: '2-digit' };
        if (time) { opts.hour = '2-digit'; opts.minute = '2-digit'; }
        return new Date(dateString).toLocaleString([], opts);
    };

    // --- RENDER ---

    if (loading && !orders.length && !order) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    // DETAIL VIEW RENDER
    if (id) {
        if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
        if (!order) return <div className="p-8 text-center">Manufacturing Order not found.</div>;

        return (
            <div className="flex flex-col h-screen bg-slate-50 print:bg-white print:h-auto">
                {/* Detail View Header */}
                <div className="bg-white border-b shadow-sm print:hidden">
                    <div className="px-6 py-2 text-xs text-gray-500 flex items-center gap-1">
                        <span className="cursor-pointer hover:text-primary" onClick={() => navigate('/production-dashboard')}>Production</span> &gt;
                        <span className="cursor-pointer hover:text-primary" onClick={() => navigate('/production-dashboard/view-manufacturing-order')}>Manufacturing Orders</span> &gt;
                        <span className="font-medium text-gray-700">View #{order.moNumber}</span>
                    </div>
                    <div className="px-6 py-3 bg-primary text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <button onClick={() => navigate('/production-dashboard/view-manufacturing-order')}><ArrowLeft size={20} /></button>
                            <h1 className="text-xl font-semibold">Order Details: {order.moNumber}</h1>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="px-6 py-3 flex flex-wrap gap-2 items-center bg-white border-b print:hidden">
                    <button onClick={() => navigate(`/production-dashboard/manage-manufacturing-order/edit/${id}`)} className="p-2 bg-[#5bc0de] text-white rounded hover:bg-[#46b8da]" title="Edit"><Edit size={16} /></button>
                    <button onClick={handlePrint} className="p-2 bg-[#0275d8] text-white rounded hover:bg-[#025aa5]" title="Print"><Printer size={16} /></button>
                    <button onClick={scrollToAttachments} className="p-2 bg-[#aeb6bf] text-white rounded hover:bg-[#8e99a4]" title="Attachments"><Paperclip size={16} /></button>
                </div>

                {/* Detail Content (Merged from previous implementation) */}
                <div className="flex-grow overflow-y-auto p-6 bg-slate-50 print:p-0 print:bg-white print:overflow-visible">
                    <div className="w-full bg-white border shadow-sm p-8 relative text-sm print:w-full print:border-none print:shadow-none print:p-0">
                        {/* Company Header */}
                        <div className="text-center mb-8 border-b pb-6">
                            <h2 className="text-xl font-bold text-gray-800">{company?.companyName || 'Factory Operations'}</h2>
                            <p className="text-gray-600">{company?.address || 'Production Facility'}, {company?.city || ''}</p>
                        </div>

                        {/* Status Grid */}
                        <div className="mb-6 bg-gray-50 p-4 rounded text-xs border">
                            <div className="flex justify-between items-center">
                                <div><span className="font-bold">Status:</span>
                                    <span className={`ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white 
                                        ${order.status === 'SCHEDULED' ? 'bg-blue-500' :
                                            order.status === 'IN_PROGRESS' ? 'bg-amber-500' :
                                                order.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-500'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div><span className="font-bold">Source:</span> Sales Order #{order.soNumber || order.salesOrder?.soNumber || salesOrderMap[order.salesOrderId]?.soNumber || 'N/A'}</div>
                            </div>
                        </div>

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
                            <div>
                                <h3 className="font-bold text-primary border-b border-gray-200 pb-1 mb-3">Order Details</h3>
                                <table className="w-full text-xs">
                                    <tbody>
                                        <tr><td className="py-1 font-medium text-gray-500 w-32">MO Number</td><td className="font-bold">{order.moNumber}</td></tr>
                                        <tr><td className="py-1 font-medium text-gray-500">Ref Number</td><td>{order.referenceNo || '-'}</td></tr>
                                        <tr><td className="py-1 font-medium text-gray-500">Created Date</td><td>{formatDate(order.createdDate, false)}</td></tr>
                                        <tr><td className="py-1 font-medium text-gray-500">Scheduled Start</td><td>{formatDate(order.scheduleStart)}</td></tr>
                                        <tr><td className="py-1 font-medium text-gray-500">Scheduled Finish</td><td>{formatDate(order.scheduleFinish)}</td></tr>
                                        <tr><td className="py-1 font-medium text-gray-500">Assigned To</td><td>{order.assignToName || '-'}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div>
                                <h3 className="font-bold text-primary border-b border-gray-200 pb-1 mb-3">Item & Production</h3>
                                <table className="w-full text-xs">
                                    <tbody>
                                        <tr><td className="py-1 font-medium text-gray-500 w-32">Item Name</td><td className="font-bold">{order.itemName || order.finishedGoodName || order.finishedGood?.name || (finishedGoodsMap[order.finishedGoodId]?.name)}</td></tr>
                                        <tr><td className="py-1 font-medium text-gray-500">Item Code</td><td className="font-mono">{order.itemCode || order.finishedGoodCode || order.finishedGood?.code || order.finishedGood?.itemCode || (finishedGoodsMap[order.finishedGoodId]?.itemCode)}</td></tr>
                                        <tr><td className="py-1 font-medium text-gray-500">Batch No</td><td>{order.batchNo || '-'}</td></tr>
                                        <tr><td className="py-1 font-medium text-gray-500">Quantity</td><td className="font-bold text-lg">{order.quantity}</td></tr>
                                        <tr><td className="py-1 font-medium text-gray-500">Production House</td><td>{order.productionHouseName}</td></tr>
                                        <tr><td className="py-1 font-medium text-gray-500">BOM Used</td><td>{order.bomName || '-'}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Customer Info */}
                        {(order.customerName || customerMap[order.customerId]) && (
                            <div className="mb-8">
                                <h3 className="font-bold text-primary border-b border-gray-200 pb-1 mb-3">For Customer</h3>
                                <div className="text-sm">
                                    <span className="font-bold">{order.customerName || (customerMap[order.customerId]?.companyName || customerMap[order.customerId]?.primaryContactPerson)}</span>
                                    {(order.soNumber || order.salesOrder?.soNumber || salesOrderMap[order.salesOrderId]?.soNumber) && <span className="text-gray-500 ml-2">(Ref: SO #{order.soNumber || order.salesOrder?.soNumber || salesOrderMap[order.salesOrderId]?.soNumber})</span>}
                                </div>
                            </div>
                        )}

                        {/* BOM Table */}
                        {bom && (
                            <div className="mb-8">
                                <h3 className="font-bold text-primary border-b border-gray-200 pb-1 mb-3">Bill of Materials / Components</h3>
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-gray-100 text-gray-700 font-bold border-b border-t border-gray-300">
                                        <tr>
                                            <th className="py-2 px-2 text-center w-12">Seq</th>
                                            <th className="py-2 px-2">Component</th>
                                            <th className="py-2 px-2">Type</th>
                                            <th className="py-2 px-2">Process</th>
                                            <th className="py-2 px-2 text-right">Qty/Unit</th>
                                            <th className="py-2 px-2 text-right">Total Req</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bom.details && bom.details.map((detail, index) => (
                                            <tr key={index} className="border-b border-gray-200">
                                                <td className="py-2 px-2 text-center">{detail.sequence}</td>
                                                <td className="py-2 px-2 font-medium">{detail.rawMaterial ? detail.rawMaterial.name : detail.childSemiFinished?.name}</td>
                                                <td className="py-2 px-2 text-gray-500">{detail.rawMaterial ? 'Raw Material' : 'Sub-Assembly'}</td>
                                                <td className="py-2 px-2">{detail.process?.name || '-'}</td>
                                                <td className="py-2 px-2 text-right">{detail.quantity}</td>
                                                <td className="py-2 px-2 text-right font-bold">{(detail.quantity * order.quantity).toFixed(4)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Attachments */}
                        {order.files && order.files.length > 0 && (
                            <div className="mt-8 border-t pt-4" ref={attachmentRef}>
                                <h3 className="font-bold text-sm mb-2">Attachments</h3>
                                <div className="flex flex-wrap gap-2">
                                    {order.files.map((file, index) => (
                                        <button key={index} onClick={() => handleViewFile(file.id, file.fileName)} className="px-3 py-1 bg-gray-100 rounded text-blue-600 hover:underline text-xs flex items-center gap-1 border">
                                            <Paperclip size={12} /> {file.fileName}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // LIST VIEW RENDER
    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-screen relative">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">View Manufacturing Orders</h1>
                    <p className="text-sm text-gray-500">Manage and track production orders</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                <div className="flex flex-col gap-1 w-full md:w-auto">
                    <label className="text-xs font-semibold text-gray-600 uppercase">MO Status</label>
                    <select value={statusFilter} onChange={handleStatusChange} className="bg-yellow-100 border border-yellow-300 text-gray-800 text-sm rounded-md focus:ring-yellow-500 focus:border-yellow-500 block w-full md:w-64 p-2 font-medium">
                        <option value="">All Statuses</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="PAUSED">Paused</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
                <div className="w-full md:w-auto">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Search className="w-4 h-4 text-gray-500" /></div>
                        <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2" placeholder="Search..." value={searchQuery} onChange={handleSearch} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-blue-50 border-b">
                            <tr>
                                <th className="px-4 py-3">S.No.</th>
                                <th className="px-4 py-3">SO Number</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Reference No.</th>
                                <th className="px-4 py-3">MO Number</th>
                                <th className="px-4 py-3 w-64">Item Details</th>
                                <th className="px-4 py-3 text-center">Qty</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Schedule Start</th>
                                <th className="px-4 py-3">Schedule Finish</th>
                                <th className="px-4 py-3 text-center">View BOM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr><td colSpan="11" className="text-center py-8 text-gray-500">No manufacturing orders found.</td></tr>
                            ) : (
                                orders.map((order, index) => (
                                    <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{(page * pageSize) + index + 1}</td>
                                        <td className="px-4 py-3">{order.soNumber || order.salesOrder?.soNumber || salesOrderMap[order.salesOrderId]?.soNumber || salesOrderMap[order.salesOrder?.id]?.soNumber || '-'}</td>
                                        <td className="px-4 py-3 truncate max-w-[150px]" title={order.customerName || (customerMap[order.customerId]?.companyName || customerMap[order.customerId]?.primaryContactPerson) || ''}>{order.customerName || (customerMap[order.customerId]?.companyName || customerMap[order.customerId]?.primaryContactPerson) || '-'}</td>
                                        <td className="px-4 py-3">{order.referenceNo || '-'}</td>
                                        <td className="px-4 py-3 font-bold text-gray-800 cursor-pointer hover:underline text-blue-600" onClick={() => navigate(`/production-dashboard/view-manufacturing-order/${order.id}`)}>{order.moNumber}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{order.itemName || order.finishedGoodName || order.finishedGood?.name || (finishedGoodsMap[order.finishedGoodId]?.name)}</span>
                                                <span className="text-xs text-gray-500">Code: {order.itemCode || order.finishedGoodCode || order.finishedGood?.code || order.finishedGood?.itemCode || (finishedGoodsMap[order.finishedGoodId]?.itemCode)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center font-semibold">{order.quantity}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                                ${order.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                                                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'PAUSED' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs">{formatDate(order.scheduleStart)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs">{formatDate(order.scheduleFinish)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button className="text-primary hover:text-blue-700 transition" title="View BOM Details" onClick={() => handleViewBom(order)}>
                                                <Eye className="w-5 h-5 bg-[#008CBA] p-1 rounded text-white" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                    <span className="text-sm text-gray-700">
                        Showing <span className="font-semibold">{orders.length > 0 ? (page * pageSize) + 1 : 0}</span> to <span className="font-semibold">{Math.min((page + 1) * pageSize, totalElements)}</span> of <span className="font-semibold">{totalElements}</span> entries
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => handlePageChange(page - 1)} disabled={page === 0} className="px-3 py-1 border rounded bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 text-sm">Previous</button>
                        <span className="px-3 py-1 border bg-primary text-white text-sm rounded">{page + 1}</span>
                        <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1} className="px-3 py-1 border rounded bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 text-sm">Next</button>
                    </div>
                </div>
            </div>

            {/* BOM Information Modal */}
            {selectedBomOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-5xl h-[90vh] bg-white rounded-lg shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
                        <ViewBomInformation
                            bomId={selectedBomOrder.bomFinishedGoodId || selectedBomOrder.bomId}
                            bomType={selectedBomOrder.bomFinishedGoodId ? 'FINISHED_GOOD' : 'SEMI_FINISHED'}
                            quantity={selectedBomOrder.quantity}
                            startDate={selectedBomOrder.scheduleStart}
                            endDate={selectedBomOrder.scheduleFinish}
                            onClose={() => setSelectedBomOrder(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewManufacturingOrder;
