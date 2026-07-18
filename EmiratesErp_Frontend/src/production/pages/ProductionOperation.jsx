import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Play, Square, Loader2, Filter, X, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ProductionOperation = () => {
    console.log('ProductionOperation loaded');
    const navigate = useNavigate();

    // State for List Data
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [processFilter, setProcessFilter] = useState('');
    const [workstationFilter, setWorkstationFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('HO');

    // Pagination
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(20);

    // Lookup Maps
    const [finishedGoodsMap, setFinishedGoodsMap] = useState({});
    const [customerMap, setCustomerMap] = useState({});
    const [salesOrderMap, setSalesOrderMap] = useState({});
    const [itemProcessMap, setItemProcessMap] = useState({}); // itemId -> { processName, workstationName }

    // Dropdown Data
    const [processes, setProcesses] = useState([]);
    const [workstations, setWorkstations] = useState([]);
    const [employees, setEmployees] = useState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMo, setSelectedMo] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Modal Form Data
    const [productionData, setProductionData] = useState({
        productionDate: '',
        assignToId: '',
        shift: '',
        startHour: '08',
        startMinute: '00',
        startAmPm: 'AM',
        endHour: '05',
        endMinute: '00',
        endAmPm: 'PM',
        quantity: '',
        remarks: ''
    });

    useEffect(() => {
        fetchLookupData();
        fetchDropdowns();
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchOperations();
    }, [page, searchQuery, processFilter, workstationFilter, itemProcessMap]); // Add map as dependency

    const fetchLookupData = async () => {
        try {
            const token = localStorage.getItem('token');
            const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

            const [fgRes, custRes, soRes, procFgRes, procSfRes] = await Promise.all([
                axios.get(`${API_URL}/production/finished-goods`, authHeaders),
                axios.get(`${API_URL}/parties`, { ...authHeaders, params: { type: 'CUSTOMER', size: 1000 } }),
                axios.get(`${API_URL}/sales/orders`, { ...authHeaders, params: { size: 1000 } }),
                axios.get(`${API_URL}/production/process-finished-goods`, { ...authHeaders, params: { size: 1000 } }),
                axios.get(`${API_URL}/production/process-semi-finished`, { ...authHeaders, params: { size: 1000 } })
            ]);

            const fgMap = {};
            (fgRes.data.content || fgRes.data || []).forEach(g => fgMap[g.id] = g);
            setFinishedGoodsMap(fgMap);

            const custMap = {};
            (custRes.data.content || custRes.data || []).forEach(c => custMap[c.id] = c);
            setCustomerMap(custMap);

            const soMap = {};
            (soRes.data.content || soRes.data || []).forEach(s => soMap[s.id] = s);
            setSalesOrderMap(soMap);

            // Build Process Map with composite keys to avoid ID collision
            const iMap = {};

            // Finished Goods Processes
            (procFgRes.data.content || procFgRes.data || []).forEach(p => {
                const itemId = p.itemId || p.finishedGoodId;
                if (itemId) {
                    iMap[`FG-${itemId}`] = {
                        processName: p.processFlowName || p.processName,
                        workstationName: p.details?.[0]?.workGroupName || p.workstationName
                    };
                }
            });

            // Semi-Finished Goods Processes
            (procSfRes.data.content || procSfRes.data || []).forEach(p => {
                const itemId = p.itemId || p.semiFinishedId || p.finishedGoodId;
                if (itemId) {
                    iMap[`SF-${itemId}`] = {
                        processName: p.processFlowName || p.processName,
                        workstationName: p.details?.[0]?.workGroupName || p.workstationName
                    };
                }
            });

            setItemProcessMap(iMap);

            // Populate Process Dropdown with unique flow names
            const allProcessFlows = [
                ...(procFgRes.data.content || procFgRes.data || []),
                ...(procSfRes.data.content || procSfRes.data || [])
            ];

            const uniqueFlowNames = [...new Set(allProcessFlows.map(p => p.processFlowName || p.processName).filter(Boolean))];
            setProcesses(uniqueFlowNames.map(name => ({ id: name, name: name })));

        } catch (e) {
            console.error("Failed to load lookup data", e);
        }
    };

    const fetchDropdowns = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const workRes = await axios.get(`${API_URL}/production/work-groups`, { headers }).catch(() => ({ data: [] }));

            setWorkstations(workRes.data.content || workRes.data || []);

        } catch (error) {
            console.error("Error fetching dropdowns:", error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/employees/all`, { headers });
            setEmployees(response.data || []);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const fetchOperations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const params = {
                page: page,
                size: pageSize,
                sort: 'createdAt,desc'
            };

            if (searchQuery) params.search = searchQuery;

            const response = await axios.get(`${API_URL}/production/manufacturing-orders`, { headers, params });

            let content = response.data.content;
            if (!content && Array.isArray(response.data)) {
                content = response.data;
            } else if (!content) {
                content = [];
            }

            // Merge resolved Process/Workstation data into orders
            const resolvedOrders = content.map(order => {
                let processInfo = null;

                // Try to find in Finished Goods Map
                if (order.finishedGoodId) {
                    processInfo = itemProcessMap[`FG-${order.finishedGoodId}`];
                }

                // If not found, try Semi-Finished Goods Map (using semiFinishedId or itemId)
                if (!processInfo && (order.semiFinishedId || order.itemId)) {
                    const sfId = order.semiFinishedId || order.itemId;
                    processInfo = itemProcessMap[`SF-${sfId}`];
                }

                processInfo = processInfo || {};

                return {
                    ...order,
                    processName: order.processName || processInfo.processName || '-',
                    workstationName: order.workstationName || processInfo.workstationName || '-'
                };
            });

            // Client-side filtering
            let finalOrders = resolvedOrders;
            if (processFilter) {
                finalOrders = finalOrders.filter(o => o.processName === processFilter);
            }
            if (workstationFilter) {
                finalOrders = finalOrders.filter(o => o.workstationName === workstations.find(w => w.id == workstationFilter)?.name);
            }

            setOrders(finalOrders);
            setTotalPages(response.data.totalPages || 0);
            setTotalElements(response.data.totalElements || 0);

        } catch (error) {
            console.error("Error fetching operations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) setPage(newPage);
    };

    const formatDate = (dateString, time = true) => {
        if (!dateString) return '-';
        const opts = { year: 'numeric', month: 'short', day: '2-digit' };
        if (time) { opts.hour = '2-digit'; opts.minute = '2-digit'; }
        return new Date(dateString).toLocaleDateString('en-GB', opts);
    };

    const openProductionModal = (mo) => {
        setSelectedMo(mo);
        setProductionData({
            productionDate: new Date().toISOString().split('T')[0],
            assignToId: mo.assignTo?.id || '',
            shift: mo.shift || 'Day Shift',
            startHour: '08',
            startMinute: '00',
            startAmPm: 'AM',
            endHour: '05',
            endMinute: '00',
            endAmPm: 'PM',
            quantity: '',
            remarks: ''
        });
        setIsModalOpen(true);
    };

    const closeProductionModal = () => {
        setIsModalOpen(false);
        setSelectedMo(null);
    };

    const handleProductionDataChange = (e) => {
        const { name, value } = e.target;
        setProductionData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const convertTo24Hour = (hour, minute, amPm) => {
        let h = parseInt(hour, 10);
        if (amPm === 'PM' && h < 12) h += 12;
        if (amPm === 'AM' && h === 12) h = 0;
        return `${h.toString().padStart(2, '0')}:${minute}:00`;
    };

    const saveProductionDetails = async () => {
        if (!selectedMo) return;
        setModalLoading(true);

        const startTime = convertTo24Hour(productionData.startHour, productionData.startMinute, productionData.startAmPm);
        const endTime = convertTo24Hour(productionData.endHour, productionData.endMinute, productionData.endAmPm);

        const payload = {
            productionDate: productionData.productionDate,
            shift: productionData.shift,
            startTime: startTime,
            endTime: endTime,
            finishedQuantity: productionData.quantity,
            remarks: productionData.remarks,
            assignToId: productionData.assignToId || null
        };

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`${API_URL}/production/manufacturing-orders/${selectedMo.id}/production-details`, payload, { headers });

            closeProductionModal();
            fetchOperations(); // Refresh list
            alert("Production details saved successfully!");
        } catch (error) {
            console.error("Error saving production details:", error);
            alert("Failed to save production details.");
        } finally {
            setModalLoading(false);
        }
    };

    const handlePauseOrder = async (order) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`${API_URL}/production/manufacturing-orders/${order.id}/status`, null, {
                params: { status: 'PAUSED' },
                headers
            });
            fetchOperations();
        } catch (error) {
            console.error("Error pausing order:", error);
            alert("Failed to pause order");
        }
    };

    const handleStopOrder = async (order) => {
        if (window.confirm("Are You sure to Finish Production")) {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // Update actual end time
                const currentTime = new Date().toISOString();
                await axios.patch(`${API_URL}/production/manufacturing-orders/${order.id}/actual-time`, {
                    actualStartTime: order.actualStart,
                    actualEndTime: currentTime
                }, { headers });

                // Update status to COMPLETED
                await axios.put(`${API_URL}/production/manufacturing-orders/${order.id}/status`, null, {
                    params: { status: 'COMPLETED' },
                    headers
                });

                fetchOperations();
            } catch (error) {
                console.error("Error finishing order:", error);
                alert("Failed to finish order");
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="bg-primary p-4 flex justify-between items-center text-white shadow-sm">
                <div>
                    <h1 className="text-xl font-bold">Production Operations</h1>
                    <div className="text-sm opacity-80">Home &gt; Production &gt; Production Operations</div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Filters Section */}
                <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
                        <div className="flex flex-col md:flex-row gap-4 w-full">
                            <div className="w-full md:w-64">
                                <label className="block text-xs font-bold text-gray-700 mb-1">PROCESS</label>
                                <select
                                    value={processFilter}
                                    onChange={(e) => setProcessFilter(e.target.value)}
                                    className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-primary bg-gray-50"
                                >
                                    <option value="">All Processes</option>
                                    {processes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="w-full md:w-64">
                                <label className="block text-xs font-bold text-gray-700 mb-1">WORKSTATION</label>
                                <select
                                    value={workstationFilter}
                                    onChange={(e) => setWorkstationFilter(e.target.value)}
                                    className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-primary bg-gray-50"
                                >
                                    <option value="">All Workstations</option>
                                    {workstations.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="w-full md:w-64">
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"><Search className="w-4 h-4 text-gray-400" /></div>
                                <input
                                    type="text"
                                    className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-primary"
                                    placeholder="Search MO..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-primary text-white font-bold border-b text-[10px] uppercase">
                                <tr>
                                    <th className="px-2 py-3 border-r border-blue-400 text-center w-24">Action</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">MO Number</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap w-48">Item Details</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">Customer</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">SO Number</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">Process</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">Workstation</th>
                                    <th className="px-2 py-3 border-r border-blue-400 text-center whitespace-nowrap">Qty</th>
                                    <th className="px-2 py-3 border-r border-blue-400 text-center whitespace-nowrap">Done</th>
                                    <th className="px-2 py-3 border-r border-blue-400 text-center whitespace-nowrap">Pending</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">Shift</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">Assigned To</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">Status</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">Start/Finish</th>
                                    <th className="px-2 py-3 border-r border-blue-400 whitespace-nowrap">Actual S/F</th>
                                    <th className="px-2 py-3 whitespace-nowrap">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="16" className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
                                ) : orders.length === 0 ? (
                                    <tr><td colSpan="16" className="text-center py-10 font-medium text-gray-500">No operations found</td></tr>
                                ) : (
                                    orders.map((order, index) => (
                                        <tr key={order.id} className="border-b hover:bg-gray-50 text-gray-700 transition-colors text-[11px]">
                                            <td className="px-2 py-2 border-r text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => openProductionModal(order)}
                                                        className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                                        title="Log Production"
                                                    >
                                                        <Play size={12} className="fill-current" />
                                                    </button>
                                                    <button
                                                        onClick={() => handlePauseOrder(order)}
                                                        className="p-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
                                                        title="Pause"
                                                    >
                                                        <Pause size={12} className="fill-current" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStopOrder(order)}
                                                        className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                                        title="Stop / Finish"
                                                    >
                                                        <Square size={12} className="fill-current" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 border-r font-medium text-gray-800">{order.moNumber}</td>
                                            <td className="px-2 py-2 border-r">
                                                <div className="flex flex-col">
                                                    <span className="font-medium truncate max-w-[150px]" title={order.itemName || order.finishedGoodName || order.finishedGood?.name || (finishedGoodsMap[order.finishedGoodId]?.name)}>
                                                        {order.itemName || order.finishedGoodName || order.finishedGood?.name || (finishedGoodsMap[order.finishedGoodId]?.name) || 'Unknown Item'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-mono">
                                                        {order.itemCode || order.finishedGoodCode || order.finishedGood?.code || (finishedGoodsMap[order.finishedGoodId]?.itemCode)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 border-r truncate max-w-[100px]" title={order.customerName || (customerMap[order.customerId]?.companyName)}>
                                                {order.customerName || (customerMap[order.customerId]?.companyName || customerMap[order.customerId]?.primaryContactPerson) || '-'}
                                            </td>
                                            <td className="px-2 py-2 border-r font-medium text-gray-800">
                                                {order.soNumber || order.salesOrder?.soNumber || salesOrderMap[order.salesOrderId]?.soNumber || salesOrderMap[order.salesOrder?.id]?.soNumber || '-'}
                                            </td>
                                            <td className="px-2 py-2 border-r">{order.processName || '-'}</td>
                                            <td className="px-2 py-2 border-r">{order.workstationName || '-'}</td>
                                            <td className="px-2 py-2 border-r text-center font-bold">{order.quantity}</td>
                                            <td className="px-2 py-2 border-r text-center text-green-600 font-semibold">{order.finishedQuantity || 0}</td>
                                            <td className="px-2 py-2 border-r text-center text-orange-500 font-semibold">{(order.quantity || 0) - (order.finishedQuantity || 0)}</td>
                                            <td className="px-2 py-2 border-r capitalize">{order.shift ? order.shift.toLowerCase() : '-'}</td>
                                            <td className="px-2 py-2 border-r whitespace-nowrap">
                                                {order.assignToName || (order.assignTo ? `${order.assignTo.firstName} ${order.assignTo.lastName}` : '-')}
                                            </td>
                                            <td className="px-2 py-2 border-r">
                                                <span className={`px-1 py-0.5 rounded text-[10px] uppercase
                                                    ${order.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                                                            order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                                order.status === 'PAUSED' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2 border-r whitespace-nowrap text-[10px]">
                                                <div><span className="text-gray-400">S:</span> {formatDate(order.scheduleStart, false)}</div>
                                                <div><span className="text-gray-400">F:</span> {formatDate(order.scheduleFinish, false)}</div>
                                            </td>
                                            <td className="px-2 py-2 border-r whitespace-nowrap text-[10px]">
                                                <div><span className="text-gray-400">S:</span> {formatDate(order.actualStart, false)}</div>
                                                <div><span className="text-gray-400">F:</span> {formatDate(order.actualFinish, false)}</div>
                                            </td>
                                            <td className="px-2 py-2 truncate max-w-[100px]" title={order.remarks}>{order.remarks || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 0 && (
                        <div className="p-3 border-t flex justify-between items-center text-xs text-gray-500 bg-gray-50">
                            <span>Showing {orders.length > 0 ? (page * pageSize) + 1 : 0} to {Math.min((page + 1) * pageSize, totalElements)} of {totalElements} entries</span>
                            <div className="flex gap-1">
                                <button onClick={() => handlePageChange(page - 1)} disabled={page === 0} className="px-3 py-1 border bg-white rounded hover:bg-gray-100 disabled:opacity-50">Previous</button>
                                <button className="px-3 py-1 border bg-[#2C3E50] text-white rounded">{page + 1}</button>
                                <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1} className="px-3 py-1 border bg-white rounded hover:bg-gray-100 disabled:opacity-50">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Production Data Modal */}
            {isModalOpen && selectedMo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-300">
                    <div className="bg-white rounded shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-4 py-3 bg-primary text-white flex justify-between items-center">
                            <h3 className="font-bold text-sm uppercase tracking-wide">ADD PRODUCTION</h3>
                            <button onClick={closeProductionModal} className="text-white/80 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Sub-Header Info */}
                        <div className="px-4 py-3 border-b border-gray-200 bg-white">
                            <p className="text-sm font-semibold text-gray-800">
                                Add Production OF - {selectedMo.processName || '-'}, {selectedMo.workstationName || '-'} - {selectedMo.itemName || (finishedGoodsMap[selectedMo.finishedGoodId]?.name) || 'Unknown Item'}
                            </p>
                        </div>

                        <div className="p-6 overflow-y-auto bg-white flex-1">
                            <fieldset className="border border-gray-300 rounded p-4">
                                <legend className="text-xs font-bold text-gray-700 px-2">How many have you Done?</legend>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    {/* Row 1: Date & Employee */}
                                    <div className="grid grid-cols-3 gap-4 items-center">
                                        <label className="text-xs font-semibold text-gray-600">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={productionData.productionDate}
                                            onChange={handleProductionDataChange}
                                            name="productionDate"
                                            className="col-span-2 w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 items-center">
                                        <label className="text-xs font-semibold text-gray-600">Employee</label>
                                        <select
                                            name="assignToId"
                                            value={productionData.assignToId}
                                            onChange={handleProductionDataChange}
                                            className="col-span-2 w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                                        >
                                            <option value="">None selected</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Row 2: Shift */}
                                    <div className="col-span-1 md:col-span-2 grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] gap-4 items-center">
                                        <label className="text-xs font-semibold text-gray-600">Shift</label>
                                        <select
                                            name="shift"
                                            value={productionData.shift}
                                            onChange={handleProductionDataChange}
                                            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                                        >
                                            <option value="">--Select Shift--</option>
                                            <option value="Day Shift">Day Shift</option>
                                            <option value="Night Shift">Night Shift</option>
                                        </select>
                                    </div>

                                    {/* Row 3: Start Time */}
                                    <div className="col-span-1 md:col-span-2 grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] gap-4 items-center">
                                        <label className="text-xs font-semibold text-gray-600">Start Time</label>
                                        <div className="flex gap-4 w-full">
                                            <div className="flex-1 flex flex-col">
                                                <label className="text-[10px] text-gray-500 mb-0.5">Hour</label>
                                                <select name="startHour" value={productionData.startHour} onChange={handleProductionDataChange} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h.toString().padStart(2, '0')}>{h}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <label className="text-[10px] text-gray-500 mb-0.5">Minute</label>
                                                <select name="startMinute" value={productionData.startMinute} onChange={handleProductionDataChange} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                                                    {Array.from({ length: 60 }, (_, i) => i).map(m => <option key={m} value={m.toString().padStart(2, '0')}>{m}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <label className="text-[10px] text-gray-500 mb-0.5">AM/PM</label>
                                                <select name="startAmPm" value={productionData.startAmPm} onChange={handleProductionDataChange} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                                                    <option value="AM">AM</option>
                                                    <option value="PM">PM</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 4: End Time */}
                                    <div className="col-span-1 md:col-span-2 grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] gap-4 items-center">
                                        <label className="text-xs font-semibold text-gray-600">End Time</label>
                                        <div className="flex gap-4 w-full">
                                            <div className="flex-1 flex flex-col">
                                                <label className="text-[10px] text-gray-500 mb-0.5">Hour</label>
                                                <select name="endHour" value={productionData.endHour} onChange={handleProductionDataChange} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h.toString().padStart(2, '0')}>{h}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <label className="text-[10px] text-gray-500 mb-0.5">Minute</label>
                                                <select name="endMinute" value={productionData.endMinute} onChange={handleProductionDataChange} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                                                    {Array.from({ length: 60 }, (_, i) => i).map(m => <option key={m} value={m.toString().padStart(2, '0')}>{m}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <label className="text-[10px] text-gray-500 mb-0.5">AM/PM</label>
                                                <select name="endAmPm" value={productionData.endAmPm} onChange={handleProductionDataChange} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                                                    <option value="AM">AM</option>
                                                    <option value="PM">PM</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 5: Quantity */}
                                    <div className="col-span-1 md:col-span-2 grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] gap-4 items-center">
                                        <label className="text-xs font-semibold text-gray-600">Quantity</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            name="quantity"
                                            value={productionData.quantity}
                                            onChange={handleProductionDataChange}
                                            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                                        />
                                    </div>

                                    {/* Row 6: Remarks */}
                                    <div className="col-span-1 md:col-span-2 grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] gap-4 items-start">
                                        <label className="text-xs font-semibold text-gray-600 mt-2">Remarks</label>
                                        <textarea
                                            rows="2"
                                            name="remarks"
                                            value={productionData.remarks}
                                            onChange={handleProductionDataChange}
                                            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                                        ></textarea>
                                    </div>
                                </div>
                            </fieldset>
                        </div>

                        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-center gap-4">
                            <button type="button" onClick={saveProductionDetails} disabled={modalLoading} className="px-6 py-1.5 bg-[#8BC34A] text-white rounded text-sm font-medium hover:bg-[#7CB342] transition-colors disabled:opacity-50 min-w-[80px]">
                                {modalLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button type="button" onClick={closeProductionModal} className="px-6 py-1.5 bg-[#0088CC] text-white rounded text-sm font-medium hover:bg-[#0077B5] transition-colors min-w-[80px]">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductionOperation;
