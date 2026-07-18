import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const IssueRawMaterialTab = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [issues, setIssues] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const pageSize = 10;

    // Environment variable for API URL
    const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

    useEffect(() => {
        fetchIssues();
    }, [page, searchTerm, fromDate, toDate]);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const authHeaders = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            // Construct query params
            let query = `${API_URL}/material-issues/all?page=${page}&size=${pageSize}`;

            const response = await axios.get(query, authHeaders);
            const data = response.data;

            let fetchedIssues = data.content || [];

            // Enhance issues with missing MO details
            const enhancedIssuesFn = fetchedIssues.map(async (issue) => {
                let req = issue.materialRequisition || {};
                let reqId = req.id || issue.materialRequisitionId;

                let moId = req.manufacturingOrderId || req.manufacturingOrder?.id;

                // 1. If MO ID is missing, fetch full Requisition details using Requisition ID
                if (!moId && reqId) {
                    try {
                        const fullReqRes = await axios.get(`${API_URL}/materials/requisition/${reqId}`, authHeaders);
                        const fullReq = fullReqRes.data;
                        moId = fullReq.manufacturingOrderId || fullReq.manufacturingOrder?.id;
                        // Update local req variable with potentially more recent data
                        req = { ...req, ...fullReq };
                    } catch (err) {
                        console.error(`Failed to fetch Requisition details for ID ${reqId}`, err);
                    }
                }

                // 2. If we have MO ID, fetch MO details
                if (moId) {
                    try {
                        const moRes = await axios.get(`${API_URL}/production/manufacturing-orders/${moId}`, authHeaders);
                        const fetchedMo = moRes.data;

                        // Attach the fetched MO number and potential SO number to the requisition object
                        return {
                            ...issue,
                            materialRequisition: {
                                ...req,
                                manufacturingOrderNo: fetchedMo.moNumber || fetchedMo.manufacturingOrderNumber,
                                // Try to get SO from MO if Requisition doesn't have it. Check plural and singular Sale(s)Order
                                salesOrderNo: req.salesOrderNo ||
                                    fetchedMo.saleOrder?.orderNumber || fetchedMo.saleOrder?.saleOrderNumber ||
                                    fetchedMo.salesOrder?.orderNumber || fetchedMo.salesOrder?.saleOrderNumber ||
                                    fetchedMo.saleOrderNo || fetchedMo.salesOrderNo ||
                                    req.saleOrder?.orderNumber || req.saleOrder?.saleOrderNumber
                            }
                        };
                    } catch (err) {
                        console.error(`Failed to fetch MO for ID ${moId}`, err);
                        // Return updated req even if MO fetch failed
                        return { ...issue, materialRequisition: req };
                    }
                }

                // Return updated req if we fetched Full Req but didn't have MO ID
                return { ...issue, materialRequisition: req };
            });

            const enhancedIssues = await Promise.all(enhancedIssuesFn);

            setIssues(enhancedIssues);
            setTotalPages(data.totalPages || 0);
            setTotalRecords(data.totalElements || 0);

        } catch (error) {
            console.error("Error fetching material issues:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        // Implement debouncing logic if needed or just set search term
    };

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-primary">
                    <h2 className="text-lg font-semibold text-white">Issued Raw Material</h2>
                </div>

                {/* Filters */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-200 bg-gray-50">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-sky-500"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-sky-500"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full p-2 pl-8 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
                                value={searchTerm}
                                onChange={handleSearch}
                                placeholder="Search..."
                            />
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <button
                        className="bg-primary hover:opacity-90 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                        onClick={fetchIssues}
                    >
                        Search
                    </button>
                </div>

                {/* Pagination Info */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                        <span>Page Size</span>
                        <select className="border border-gray-300 rounded p-1">
                            <option>10</option>
                            <option>20</option>
                            <option>50</option>
                        </select>
                    </div>
                    <span>Total Records : {totalRecords}</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-200 text-xs text-gray-700 uppercase">
                                <th className="p-3 font-semibold border-r border-gray-200">S.No.</th>
                                <th className="p-3 font-semibold border-r border-gray-200">Date</th>
                                <th className="p-3 font-semibold border-r border-gray-200">SO No.</th>
                                <th className="p-3 font-semibold border-r border-gray-200">MO No.</th>
                                <th className="p-3 font-semibold border-r border-gray-200">Issue no</th>
                                <th className="p-3 font-semibold border-r border-gray-200">Request No.</th>
                                <th className="p-3 font-semibold border-r border-gray-200">Remarks</th>
                                <th className="p-3 font-semibold border-r border-gray-200">Delivery Order</th>
                                <th className="p-3 font-semibold">Operation</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-600">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="p-4 text-center">Loading...</td>
                                </tr>
                            ) : issues.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="p-4 text-center">No record available</td>
                                </tr>
                            ) : (
                                issues.map((issue, index) => (
                                    <tr key={issue.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3 border-r border-gray-200 text-center">{index + 1 + (page * pageSize)}</td>
                                        <td className="p-3 border-r border-gray-200">{formatDate(issue.issueDate)}</td>
                                        <td className="p-3 border-r border-gray-200">
                                            {/* Accessing potentially nested saleOrder or placeholders */}
                                            {issue.materialRequisition?.salesOrderNo ||
                                                issue.salesOrderNo ||
                                                issue.materialRequisition?.saleOrderNo || '-'}
                                        </td>
                                        <td className="p-3 border-r border-gray-200">
                                            {issue.materialRequisition?.manufacturingOrderNo ||
                                                issue.manufacturingOrderNo ||
                                                issue.materialRequisition?.moNumber || '-'}
                                        </td>
                                        <td className="p-3 border-r border-gray-200">{issue.issueNo}</td>
                                        <td className="p-3 border-r border-gray-200">{issue.materialRequisitionNo || (issue.materialRequisition && issue.materialRequisition.requestNo) || '-'}</td>
                                        <td className="p-3 border-r border-gray-200">{issue.remarks || '-'}</td>
                                        <td className="p-3 border-r border-gray-200">{'-'}</td>
                                        <td className="p-3 flex gap-2 justify-center">
                                            <button className="text-primary hover:text-primary-dark" title="View">
                                                <Eye size={16} />
                                            </button>
                                            {/* 
                                            <button className="text-green-500 hover:text-green-700" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button className="text-red-500 hover:text-red-700" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                            */}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default IssueRawMaterialTab;
