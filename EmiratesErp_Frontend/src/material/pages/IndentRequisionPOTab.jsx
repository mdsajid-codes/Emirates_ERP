import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Search,
    Calendar,
    Eye,
    XCircle,
    Loader2,
    Monitor
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const IndentRequisionPOTab = () => {
    const navigate = useNavigate();
    const [indents, setIndents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
    });
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        indentNo: '',
        search: ''
    });

    const [employees, setEmployees] = useState([]);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/employees/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(response.data || []);
        } catch (error) {
            console.error("Failed to fetch employees", error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Helper to get employee name from ID
    const getEmployeeName = (id) => {
        const emp = employees.find(e => e.id === id);
        return emp ? `${emp.firstName} ${emp.lastName}` : '-';
    };

    const fetchIndents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
            const params = {
                page: pagination.page,
                size: pagination.size,
                search: filters.search
            };

            // Fetch all indents and filter manually for now if backend doesn't support status filter in params
            // Ideally backend should have /material-indents/status/APPROVED or similar
            const response = await axios.get(`${API_URL}/material-indents/all`, {
                ...authHeaders,
                params
            });

            let fetchedIndents = response.data.content || [];

            // Filter for APPROVED status (Mocking this filter if backend returns all)
            // Assuming 'APPROVED' is the status for PO Pending.
            // Also checking if PO is NOT created (maybe check existing PO relation?)
            // For now, let's just show all or filter by 'APPROVED'

            // fetchedIndents = fetchedIndents.filter(i => i.status === 'APPROVED'); 

            // Enhance indents with missing details (MO, SO, Request No) like in ViewIndentMaterialTab
            const enhancedIndentsFn = fetchedIndents.map(async (indent) => {
                let req = indent.materialRequisition || {};
                let reqId = req.id || indent.materialRequisitionId;
                let moId = req.manufacturingOrderId || req.manufacturingOrder?.id;

                if ((!moId || !req.requestNo) && reqId) {
                    try {
                        const fullReqRes = await axios.get(`${API_URL}/materials/requisition/${reqId}`, authHeaders);
                        const fullReq = fullReqRes.data;
                        moId = fullReq.manufacturingOrderId || fullReq.manufacturingOrder?.id;
                        req = { ...req, ...fullReq };
                    } catch (err) { }
                }

                let moData = {};
                if (moId) {
                    try {
                        const moRes = await axios.get(`${API_URL}/production/manufacturing-orders/${moId}`, authHeaders);
                        moData = moRes.data;
                    } catch (err) { }
                }

                // Fetch UOMs and Pricing
                const detailsWithUOM = await Promise.all(indent.details.map(async (detail) => {
                    let unitName = detail.rawMaterial?.unit?.name || detail.unit;
                    let purchasePrice = 0;
                    let unitId = detail.unitId;
                    let taxId = '';

                    if (detail.rawMaterialId) {
                        try {
                            const rmRes = await axios.get(`${API_URL}/production/raw-materials/${detail.rawMaterialId}`, authHeaders);
                            const rm = rmRes.data;
                            unitName = rm.unit?.name || rm.issueUnitName || 'Units';
                            purchasePrice = rm.purchasePrice || 0;
                            // Prefer purchase unit, fallback to issue unit
                            unitId = rm.purchaseUnitId || rm.issueUnitId;
                            taxId = rm.taxId;
                        } catch (e) { }
                    }
                    return { ...detail, unit: unitName, purchasePrice, unitId, taxId };
                }));

                return {
                    ...indent,
                    details: detailsWithUOM,
                    materialRequisition: {
                        ...req,
                        manufacturingOrderNo: moData.moNumber || moData.manufacturingOrderNumber || req.manufacturingOrderNo,
                        salesOrderNo: req.salesOrderNo || moData.saleOrder?.orderNumber
                    }
                };
            });

            const enhancedIndents = await Promise.all(enhancedIndentsFn);

            setIndents(enhancedIndents);
            setPagination(prev => ({
                ...prev,
                totalElements: response.data.totalElements,
                totalPages: response.data.totalPages
            }));
        } catch (error) {
            console.error("Error fetching indents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIndents();
    }, [pagination.page, pagination.size, filters.search]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleCreatePO = (indent) => {
        navigate('/purchase-dashboard/purchase-orders/new', {
            state: {
                indentData: {
                    indentId: indent.id,
                    items: indent.details.map(d => ({
                        itemId: d.rawMaterialId,
                        description: d.rawMaterialName,
                        quantity: d.indentQuantity,
                        unitId: d.unitId,
                        unit: d.unit,
                        rate: d.purchasePrice, // Pass purchase price as rate
                        taxId: d.taxId // Pass taxId
                    })),
                    reference: indent.indentNo,
                    remark: `Generated from Indent: ${indent.indentNo}`
                }
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-primary px-6 py-4 rounded-t-lg flex justify-between items-center text-white mb-6 shadow-sm">
                <h1 className="text-xl font-semibold">Indent Requisition PO Pending</h1>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                    <input
                        type="date"
                        name="fromDate"
                        value={filters.fromDate}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                    <input
                        type="date"
                        name="toDate"
                        value={filters.toDate}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Indent No.</label>
                    <input
                        type="text"
                        name="indentNo"
                        value={filters.indentNo}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchIndents} className="bg-[#0284c7] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                        Search
                    </button>
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-blue-50 text-blue-900 font-medium border-b border-blue-100">
                                <tr>
                                    <th className="px-4 py-3 w-16">S.No.</th>
                                    <th className="px-4 py-3">Indent Date</th>
                                    <th className="px-4 py-3">Indent No.</th>
                                    <th className="px-4 py-3">Employee Name</th>
                                    <th className="px-4 py-3">Indent Approved Date</th>
                                    <th className="px-4 py-3">Indent Approved By</th>
                                    <th className="px-4 py-3">SO No.</th>
                                    <th className="px-4 py-3">Mo No.</th>
                                    <th className="px-4 py-3 w-1/4">Items Details</th>
                                    <th className="px-4 py-3">Create PO</th>
                                    <th className="px-4 py-3">View</th>
                                    <th className="px-4 py-3">Indent Approval Status</th>
                                    <th className="px-4 py-3">Close</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {indents.length > 0 ? (
                                    indents.map((indent, index) => (
                                        <tr key={indent.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 align-top">{index + 1 + (pagination.page * pagination.size)}</td>
                                            <td className="px-4 py-3 align-top">{formatDate(indent.indentDate)}</td>
                                            <td className="px-4 py-3 align-top font-medium">{indent.indentNo || `IND-${indent.id}`}</td>
                                            <td className="px-4 py-3 align-top">{indent.employeeName || indent.materialRequisition?.employeeName || '-'}</td>
                                            <td className="px-4 py-3 align-top">{formatDate(indent.approvedDate)}</td>
                                            <td className="px-4 py-3 align-top">{indent.approvedBy?.firstName ? `${indent.approvedBy.firstName} ${indent.approvedBy.lastName}` : (indent.approvedById ? getEmployeeName(indent.approvedById) : '-')}</td>
                                            <td className="px-4 py-3 align-top">{indent.materialRequisition?.salesOrderNo || '-'}</td>
                                            <td className="px-4 py-3 align-top">{indent.materialRequisition?.manufacturingOrderNo || '-'}</td>
                                            <td className="px-4 py-3 align-top">
                                                <div className="space-y-1">
                                                    {indent.details && indent.details.slice(0, 3).map((detail, idx) => (
                                                        <div key={idx} className="flex justify-between text-xs">
                                                            <span>{detail.rawMaterialName}</span>
                                                            <span className="font-semibold">{detail.indentQuantity} {detail.unit}</span>
                                                        </div>
                                                    ))}
                                                    {indent.details && indent.details.length > 3 && (
                                                        <div className="text-xs text-blue-500 cursor-pointer">+ {indent.details.length - 3} more</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 align-top text-center">
                                                <button
                                                    onClick={() => handleCreatePO(indent)}
                                                    className="text-blue-600 hover:underline text-xs font-semibold"
                                                >
                                                    Create PO
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 align-top text-center">
                                                <button className="bg-[#0ea5e9] text-white p-1 rounded hover:bg-blue-600">
                                                    <Monitor size={14} />
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <span className={`text-xs font-semibold ${indent.approvalStatus === 'APPROVED' ? 'text-green-600' : 'text-amber-600'}`}>
                                                    {indent.approvalStatus || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 align-top text-center">
                                                <button className="text-blue-600 hover:text-blue-800">
                                                    Close
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="13" className="px-4 py-10 text-center text-gray-500">
                                            No pending indents found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IndentRequisionPOTab;
