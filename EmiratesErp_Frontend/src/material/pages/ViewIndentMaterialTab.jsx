import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Search,
    Filter,
    Calendar,
    MapPin,
    MoreVertical,
    Eye,
    Trash2,
    XCircle,
    Loader2,
    Plus,
    Edit
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ViewIndentMaterialTab = () => {
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
        location: '',
        search: ''
    });

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
            const response = await axios.get(`${API_URL}/material-indents/all`, {
                ...authHeaders,
                params
            });

            const fetchedIndents = response.data.content || [];

            // Enhance indents with missing details (MO, SO, Request No)
            const enhancedIndentsFn = fetchedIndents.map(async (indent) => {
                let req = indent.materialRequisition || {};
                let reqId = req.id || indent.materialRequisitionId;

                let moId = req.manufacturingOrderId || req.manufacturingOrder?.id;

                // 1. If MO ID is missing or Request details incomplete, fetch full Requisition
                if ((!moId || !req.requestNo) && reqId) {
                    try {
                        const fullReqRes = await axios.get(`${API_URL}/materials/requisition/${reqId}`, authHeaders);
                        const fullReq = fullReqRes.data;
                        moId = fullReq.manufacturingOrderId || fullReq.manufacturingOrder?.id;
                        req = { ...req, ...fullReq };
                    } catch (err) {
                        console.error(`Failed to fetch Requisition details for ID ${reqId}`, err);
                    }
                }

                // 2. If we have MO ID, fetch MO details to get SO No and MO No
                let moData = {};
                if (moId) {
                    try {
                        const moRes = await axios.get(`${API_URL}/production/manufacturing-orders/${moId}`, authHeaders);
                        moData = moRes.data;
                    } catch (err) {
                        console.error(`Failed to fetch MO for ID ${moId}`, err);
                    }
                }

                return {
                    ...indent,
                    materialRequisition: {
                        ...req,
                        manufacturingOrderNo: moData.moNumber || moData.manufacturingOrderNumber || req.manufacturingOrderNo,
                        salesOrderNo: req.salesOrderNo ||
                            moData.saleOrder?.orderNumber || moData.saleOrder?.saleOrderNumber ||
                            moData.salesOrder?.orderNumber || moData.salesOrder?.saleOrderNumber ||
                            moData.saleOrderNo || moData.salesOrderNo
                    }
                };
            });

            const enhancedIndents = await Promise.all(enhancedIndentsFn);

            // 3. Fetch UOM for all items (Robustly)
            const indentsWithUOM = await Promise.all(enhancedIndents.map(async (indent) => {
                if (!indent.details) return indent;

                const detailsWithUOM = await Promise.all(indent.details.map(async (detail) => {
                    let unitName = detail.rawMaterial?.unit?.name || detail.unit;

                    if (!unitName && detail.rawMaterialId) {
                        try {
                            const rmRes = await axios.get(`${API_URL}/production/raw-materials/${detail.rawMaterialId}`, authHeaders);
                            const rmData = rmRes.data;
                            unitName = rmData.issueUnitName || rmData.unit?.name || rmData.uom?.name || 'Units';
                        } catch (e) {
                            console.error(`Failed to fetch RM ${detail.rawMaterialId}`, e);
                        }
                    }
                    return { ...detail, unit: unitName };
                }));

                return { ...indent, details: detailsWithUOM };
            }));

            setIndents(indentsWithUOM);
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
    }, [pagination.page, pagination.size, filters.search]); // Add other filters if API supports

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this indent?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/material-indents/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchIndents();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete indent");
        }
    };

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    const [employees, setEmployees] = useState([]);
    const [approvalModal, setApprovalModal] = useState({
        isOpen: false,
        indentId: null,
        data: {
            approvedDate: new Date().toISOString().split('T')[0],
            approvalStatus: 'APPROVED',
            approvedById: ''
        }
    });

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

    const handleOpenApprovalModal = (indent) => {
        setApprovalModal({
            isOpen: true,
            indentId: indent.id,
            data: {
                approvedDate: new Date().toISOString().split('T')[0],
                approvalStatus: indent.approvalStatus || 'APPROVED',
                approvedById: indent.approvedById || '' // Pre-fill if already approved
            }
        });
    };

    const handleApprovalSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            // Convert simple date to OffsetDateTime format if backend expects it, or ISO string.
            // Backend expects OffsetDateTime per Request DTO. 
            // We'll send standard ISO string, Spring usually parses it if it's broadly compatible, 
            // but explicitly appending time/zone might be safer: 'YYYY-MM-DDTHH:mm:ssZ'
            const date = new Date(approvalModal.data.approvedDate);
            const isoDate = date.toISOString(); // 2023-12-30T00:00:00.000Z

            const payload = {
                approvedDate: isoDate,
                approvalStatus: approvalModal.data.approvalStatus,
                approvedById: approvalModal.data.approvedById
            };

            await axios.patch(`${API_URL}/material-indents/approval-status/${approvalModal.indentId}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setApprovalModal(prev => ({ ...prev, isOpen: false }));
            fetchIndents(); // Refresh list
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-[#9333ea] px-6 py-4 rounded-t-lg flex justify-between items-center text-white mb-6 shadow-sm">
                <h1 className="text-xl font-semibold">View Indent Requisition</h1>
                <button
                    onClick={() => navigate('/material-dashboard/indent-requisition/new')}
                    className="bg-[#be185d] hover:bg-[#9d174d] text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus size={16} /> New Indent Requisition
                </button>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                    <input
                        type="date"
                        name="toDate"
                        value={filters.toDate}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                    <select
                        name="location"
                        value={filters.location}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">Head Office</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchIndents} className="bg-[#6b21a8] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-purple-900 transition-colors">
                        Search
                    </button>
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                        <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-purple-50 text-purple-900 font-medium border-b border-purple-100">
                                <tr>
                                    <th className="px-4 py-3 w-16">S.No.</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Sales Order No.</th>
                                    <th className="px-4 py-3">Mo No.</th>
                                    <th className="px-4 py-3">Request No</th>
                                    <th className="px-4 py-3">Employee Name</th>
                                    <th className="px-4 py-3">Department</th>
                                    <th className="px-4 py-3">Indent No.</th>
                                    <th className="px-4 py-3 w-1/4">Items Details</th>
                                    <th className="px-4 py-3">Indent Approved Date</th>
                                    <th className="px-4 py-3">Indent Approved By</th>
                                    <th className="px-4 py-3">Edit</th>
                                    <th className="px-4 py-3">View</th>
                                    <th className="px-4 py-3">Indent Approval Status</th>
                                    <th className="px-4 py-3">Remove</th>
                                    <th className="px-4 py-3">Close</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {indents.length > 0 ? (
                                    indents.map((indent, index) => (
                                        <tr key={indent.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 align-top">{index + 1 + (pagination.page * pagination.size)}</td>
                                            <td className="px-4 py-3 align-top">{formatDate(indent.indentDate)}</td>
                                            <td className="px-4 py-3 align-top">{indent.materialRequisition?.salesOrderNo || '-'}</td>
                                            <td className="px-4 py-3 align-top">{indent.materialRequisition?.manufacturingOrderNo || '-'}</td>
                                            <td className="px-4 py-3 align-top text-purple-600 font-medium">{indent.materialRequisition?.requestNo || '-'}</td>
                                            <td className="px-4 py-3 align-top">{indent.employeeName || indent.materialRequisition?.employeeName || '-'}</td>
                                            <td className="px-4 py-3 align-top">{indent.departmentName || '-'}</td>
                                            <td className="px-4 py-3 align-top font-medium">{indent.indentNo || `IND-${indent.id}`}</td>
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
                                            <td className="px-4 py-3 align-top">{formatDate(indent.approvedDate)}</td>
                                            <td className="px-4 py-3 align-top">{indent.approvedBy?.firstName ? `${indent.approvedBy.firstName} ${indent.approvedBy.lastName}` : (indent.approvedById ? getEmployeeName(indent.approvedById) : '-')}</td>
                                            <td className="px-4 py-3 align-top text-center">
                                                {indent.status !== 'APPROVED' && (
                                                    <button
                                                        onClick={() => navigate(`/material-dashboard/indent-requisition/edit/${indent.id}`)}
                                                        className="text-purple-600 hover:text-purple-800"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 align-top text-center">
                                                <button className="bg-purple-800 text-white p-1 rounded hover:bg-purple-900">
                                                    <Eye size={14} />
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`text-xs font-semibold ${indent.approvalStatus === 'APPROVED' ? 'text-green-600' : 'text-amber-600'}`}>
                                                        {indent.approvalStatus || 'PENDING'}
                                                    </span>
                                                    <button
                                                        onClick={() => handleOpenApprovalModal(indent)}
                                                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 border border-purple-200"
                                                    >
                                                        Update Status
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 align-top text-center">
                                                <button onClick={() => handleDelete(indent.id)} className="bg-red-500 text-white p-1 rounded hover:bg-red-600">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 align-top text-center">
                                                <button className="bg-purple-900 text-white px-2 py-0.5 rounded text-xs hover:bg-black">
                                                    Close
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="16" className="px-4 py-10 text-center text-gray-500">
                                            No indents found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Approval Modal */}
            {approvalModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Update Indent Status</h3>
                            <button onClick={() => setApprovalModal(prev => ({ ...prev, isOpen: false }))} className="text-gray-500 hover:text-gray-700">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Approved Date</label>
                                <input
                                    type="date"
                                    value={approvalModal.data.approvedDate}
                                    onChange={e => setApprovalModal(prev => ({ ...prev, data: { ...prev.data, approvedDate: e.target.value } }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
                                <select
                                    value={approvalModal.data.approvalStatus}
                                    onChange={e => setApprovalModal(prev => ({ ...prev, data: { ...prev.data, approvalStatus: e.target.value } }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="APPROVED">APPROVED</option>
                                    <option value="REJECTED">REJECTED</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
                                <select
                                    value={approvalModal.data.approvedById}
                                    onChange={e => setApprovalModal(prev => ({ ...prev, data: { ...prev.data, approvedById: e.target.value } }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setApprovalModal(prev => ({ ...prev, isOpen: false }))}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprovalSubmit}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ViewIndentMaterialTab;
