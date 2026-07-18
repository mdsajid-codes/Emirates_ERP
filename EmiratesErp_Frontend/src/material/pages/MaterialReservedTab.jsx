import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MaterialReservedTab = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [requisitions, setRequisitions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const pageSize = 10;

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        fetchRequisitions();
    }, [page, searchTerm, fromDate, toDate]);

    const fetchRequisitions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch only Reserved Requisitions
            const params = {
                page: page,
                size: pageSize,
                search: searchTerm,
                fromDate: fromDate,
                toDate: toDate,
                reserveStatus: 'RESERVED' // Filter by Reserved status
            };

            const response = await axios.get(`${API_URL}/materials/requisition`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            setRequisitions(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalRecords(response.data.totalElements || 0);

        } catch (error) {
            console.error("Error fetching reserved requisitions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(0);
    };

    const handleUnreserve = (id) => {
        navigate(`/material-dashboard/unreserve-raw-material/${id}`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="px-6 py-3 border-b border-primary/10 bg-primary rounded-t-lg">
                    <h2 className="text-lg font-semibold text-primary-foreground">Reserve Material</h2>
                </div>

                {/* Filters */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-gray-200 bg-gray-50 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                        <input
                            type="text"
                            className="w-full p-2 pl-8 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search..."
                        />
                        <Search className="absolute left-2.5 top-8 h-4 w-4 text-gray-400" />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-primary text-primary-foreground text-xs uppercase">
                                <th className="px-6 py-3 font-semibold text-left">S.No.</th>
                                <th className="px-6 py-3 font-semibold text-left">Date</th>
                                <th className="px-6 py-3 font-semibold text-left">Request No.</th>
                                <th className="px-6 py-3 font-semibold text-left">MO No.</th>
                                <th className="px-6 py-3 font-semibold text-left">Employee Name</th>
                                <th className="px-6 py-3 font-semibold text-left">Status</th>
                                <th className="px-6 py-3 font-semibold text-left">Indent Status</th>
                                <th className="px-6 py-3 font-semibold text-left">Reserve Status</th>
                                <th className="px-6 py-3 font-semibold text-left">Operation</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-600">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="p-8 text-center">
                                        <div className="flex justify-center"><Loader2 className="animate-spin text-purple-600" /></div>
                                    </td>
                                </tr>
                            ) : requisitions.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="p-4 text-center">No reserved materials found</td>
                                </tr>
                            ) : (
                                requisitions.map((req, index) => (
                                    <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-6 py-3 text-xs text-gray-600">{index + 1 + (page * pageSize)}</td>
                                        <td className="px-6 py-3 text-xs text-gray-600">{formatDate(req.requestDate)}</td>
                                        <td className="px-6 py-3 text-xs font-medium text-primary">{req.requestNo}</td>
                                        <td className="px-6 py-3 text-xs text-gray-600">{req.manufacturingOrderNo || '-'}</td>
                                        <td className="px-6 py-3 text-xs text-gray-600">{req.employeeName || '-'}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${req.status === 'ISSUED' ? 'bg-green-100 text-green-700' :
                                                    req.status === 'PARTIALLY_ISSUED' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {req.status?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-xs">
                                            {req.indentStatus === 'DONE' ? (
                                                <span className="text-green-600 font-medium">Done</span>
                                            ) : (
                                                <span className="text-gray-400">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-xs font-medium text-gray-800">
                                            {req.reserveStatus}
                                        </td>
                                        <td className="px-6 py-3">
                                            <button
                                                onClick={() => handleUnreserve(req.id)}
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] px-3 py-1.5 rounded transition-colors whitespace-nowrap uppercase"
                                            >
                                                Unreserve Raw Material
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                        <span>Page Size</span>
                        <select className="border border-gray-300 rounded p-1">
                            <option>10</option>
                        </select>
                    </div>
                    <span>Total Records: {totalRecords}</span>
                </div>
            </div>
        </div>
    );
};

export default MaterialReservedTab;
