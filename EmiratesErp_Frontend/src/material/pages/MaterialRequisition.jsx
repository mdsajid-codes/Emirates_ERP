import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Search,
    Filter,
    Calendar,
    MapPin,
    MoreVertical,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Check,
    X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const MaterialRequisition = ({ filterPreset = {} }) => {
    const navigate = useNavigate();
    const [requisitions, setRequisitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        fromDate: '',
        toDate: '',
        status: '',
        indentStatus: '',
        reserveStatus: '',
        ...filterPreset // Apply preset filters
    });
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
    });

    // Reset filters when filterPreset changes (route change)
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            search: '',
            fromDate: '',
            toDate: '',
            status: '',
            indentStatus: '',
            reserveStatus: '',
            ...filterPreset
        }));
        setPagination(prev => ({ ...prev, page: 0 }));
    }, [JSON.stringify(filterPreset)]);

    const [locations, setLocations] = useState([]); // To be fetched or hardcoded for now
    const [moDetailsCache, setMoDetailsCache] = useState({});

    const fetchRequisitions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Construct params, handling potentially empty preset values if not strictly undefined
            const params = {
                page: pagination.page,
                size: pagination.size,
                search: filters.search,
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                status: filters.status,
                indentStatus: filters.indentStatus,
                reserveStatus: filters.reserveStatus,
            };

            const response = await axios.get(`${API_URL}/materials/requisition`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            setRequisitions(response.data.content);
            setPagination(prev => ({
                ...prev,
                totalElements: response.data.totalElements,
                totalPages: response.data.totalPages
            }));
        } catch (err) {
            setError('Failed to fetch requisitions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLocations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/locations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLocations(response.data);
        } catch (err) {
            console.error('Failed to fetch locations', err);
        }
    };

    useEffect(() => {
        fetchRequisitions();
        fetchLocations();
    }, [pagination.page, pagination.size, filters]);

    // Fetch details for missing MOs
    useEffect(() => {
        const fetchMissingMoDetails = async () => {
            const missingMoIds = requisitions
                .filter(req => (!req.productDetails || !req.employeeName) && req.manufacturingOrderId && !moDetailsCache[req.manufacturingOrderId])
                .map(req => req.manufacturingOrderId);

            const uniqueIds = [...new Set(missingMoIds)];

            if (uniqueIds.length === 0) return;

            try {
                const token = localStorage.getItem('token');
                const responses = await Promise.all(uniqueIds.map(id =>
                    axios.get(`${API_URL}/production/manufacturing-orders/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then(res => ({ id, data: res.data })).catch(err => ({ id, error: err }))
                ));

                setMoDetailsCache(prev => {
                    const newCache = { ...prev };
                    responses.forEach(res => {
                        if (res.data) {
                            newCache[res.id] = res.data;
                        }
                    });
                    return newCache;
                });
            } catch (err) {
                console.error("Failed to fetch MO details", err);
            }
        };

        if (requisitions.length > 0) {
            fetchMissingMoDetails();
        }
    }, [requisitions]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page on filter change
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleAction = async (id, actionType) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            let url = '';
            let params = {};

            switch (actionType) {
                case 'RESERVE':
                    url = (`${API_URL}/materials/requisition/${id}/reserve-status`);
                    params = { status: 'RESERVED' };
                    break;
                case 'INDENT':
                    url = (`${API_URL}/materials/requisition/${id}/indent-status`);
                    params = { status: 'DONE' };
                    break;
                case 'ISSUE':
                    url = (`${API_URL}/materials/requisition/${id}/status`);
                    // Logic to determine if partially issued or fully issued can be complex, 
                    // for now defaulting to ISSUED as per simplified requirement
                    params = { status: 'ISSUED' };
                    break;
                default:
                    return;
            }

            await axios.put(url, null, { headers, params });
            fetchRequisitions(); // Refresh list
        } catch (err) {
            console.error(`Failed to perform ${actionType}`, err);
            alert(`Failed to perform action: ${err.message}`);
        }
    };

    const handleMaterialStatusUpdate = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            await axios.patch(
                `${API_URL}/materials/requisition/${id}/material-status`,
                null,
                {
                    headers,
                    params: { status }
                }
            );

            fetchRequisitions();
        } catch (err) {
            console.error("Failed to update material status", err);
            alert("Failed to update status");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'text-green-600 bg-green-100';
            case 'REJECTED': return 'text-red-600 bg-red-100';
            case 'ISSUED': return 'text-blue-600 bg-blue-100';
            case 'PARTIALLY_ISSUED': return 'text-amber-600 bg-amber-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-6 py-4 rounded-t-lg flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold">Approved Material Requisition</h1>
                    <p className="text-sm text-primary-foreground/80">Manage and track material requests</p>
                </div>
                <button className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                    Manage Disassemble Items
                </button>
            </div>

            {/* Filters */}
            {/* Filters */}
            <div className="bg-white p-4 rounded-b-lg shadow-sm border border-gray-200 border-t-0 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                    <div className="relative">
                        <input
                            type="date"
                            name="fromDate"
                            value={filters.fromDate}
                            onChange={handleFilterChange}
                            className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                    <div className="relative">
                        <input
                            type="date"
                            name="toDate"
                            value={filters.toDate}
                            onChange={handleFilterChange}
                            className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                    <select
                        name="location"
                        value={filters.location || ''}
                        onChange={handleFilterChange}
                        className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="">All Locations</option>
                        {locations.map((loc) => (
                            <option key={loc.id} value={loc.name}>
                                {loc.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search by Request No..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-primary text-primary-foreground font-medium border-b border-primary/10">
                                    <tr>
                                        <th className="px-3 py-2 uppercase text-xs">S.No.</th>
                                        <th className="px-3 py-2 uppercase text-xs whitespace-nowrap">Date</th>
                                        <th className="px-3 py-2 uppercase text-xs whitespace-nowrap">SO No.</th>
                                        <th className="px-3 py-2 uppercase text-xs whitespace-nowrap">Mo No.</th>
                                        <th className="px-3 py-2 uppercase text-xs">Product Details</th>
                                        <th className="px-3 py-2 uppercase text-xs whitespace-nowrap">Req No.</th>
                                        <th className="px-3 py-2 uppercase text-xs whitespace-nowrap">Employee</th>
                                        <th className="px-3 py-2 uppercase text-xs">Status</th>
                                        <th className="px-3 py-2 uppercase text-xs text-center">Material Status</th>
                                        <th className="px-3 py-2 uppercase text-xs">Location</th>
                                        <th className="px-3 py-2 uppercase text-xs">Indent</th>
                                        <th className="px-3 py-2 uppercase text-xs">Reserve</th>
                                        <th className="px-3 py-2 uppercase text-xs whitespace-nowrap">Req For</th>
                                        <th className="px-3 py-2 uppercase text-xs">Operation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {requisitions.length > 0 ? (
                                        requisitions.map((req, index) => {
                                            const mo = moDetailsCache[req.manufacturingOrderId];
                                            const resolvedProduct = req.productDetails || (mo ? (mo.itemName || mo.finishedGoodName || mo.finishedGood?.name) : '-');
                                            const resolvedEmployee = req.employeeName || (mo ? mo.assignToName : '-');

                                            return (
                                                <tr key={req.id} className="hover:bg-gray-50 transition-colors text-xs border-b border-gray-100 last:border-0">
                                                    <td className="px-3 py-2 text-gray-500">{index + 1 + (pagination.page * pagination.size)}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap">{req.requestDate}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap">{req.salesOrderNo || '-'}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap">{req.manufacturingOrderNo || '-'}</td>
                                                    <td className="px-3 py-2">
                                                        <div className="max-w-[200px] truncate" title={resolvedProduct}>{resolvedProduct}</div>
                                                    </td>
                                                    <td className="px-3 py-2 font-medium text-primary whitespace-nowrap">{req.requestNo}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap">{resolvedEmployee}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(req.status)}`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {(!req.materialStatus || req.materialStatus === 'PENDING') ? (
                                                            <div className="flex justify-center gap-1">
                                                                <button
                                                                    onClick={() => handleMaterialStatusUpdate(req.id, 'APPROVED')}
                                                                    className="p-1 hover:bg-green-100 text-green-600 rounded"
                                                                    title="Approve"
                                                                >
                                                                    <Check size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMaterialStatusUpdate(req.id, 'REJECTED')}
                                                                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                                                                    title="Reject"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${req.materialStatus === 'APPROVED' ? 'text-green-600 bg-green-100' :
                                                                req.materialStatus === 'REJECTED' ? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100'
                                                                }`}>
                                                                {req.materialStatus}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">{req.locationName}</td>
                                                    <td className="px-3 py-2">
                                                        {req.indentStatus === 'DONE' ? (
                                                            <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Done</span>
                                                        ) : (
                                                            <span className="text-gray-400">Pending</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {req.reserveStatus === 'RESERVED' ? (
                                                            <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Reserved</span>
                                                        ) : (
                                                            <span className="text-gray-400">Pending</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap">{req.requisitionFor?.replace('_', ' ')}</td>
                                                    <td className="px-3 py-2">
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => navigate(`/material-dashboard/reserve-raw-material/${req.id}`)}
                                                                className="px-2 py-1 bg-primary text-primary-foreground text-[10px] rounded hover:bg-primary/90 transition shadow-sm whitespace-nowrap"
                                                            >
                                                                Reserve
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/material-dashboard/indent-reception/${req.id}`)}
                                                                className="px-2 py-1 bg-primary text-primary-foreground text-[10px] rounded hover:bg-primary/90 transition shadow-sm whitespace-nowrap"
                                                            >
                                                                Indent
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/material-dashboard/issue-raw-material/${req.id}`)}
                                                                className="px-2 py-1 bg-primary text-primary-foreground text-[10px] rounded hover:bg-primary/90 transition shadow-sm whitespace-nowrap"
                                                            >
                                                                Issue
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="14" className="px-4 py-10 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <AlertCircle className="h-10 w-10 text-gray-300 mb-2" />
                                                    <p>No requisitions found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Showing {requisitions.length > 0 ? pagination.page * pagination.size + 1 : 0} to {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of {pagination.totalElements} entries
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 0}
                                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages - 1}
                                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MaterialRequisition;
