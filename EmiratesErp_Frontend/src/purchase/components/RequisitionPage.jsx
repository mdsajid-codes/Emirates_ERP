import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Edit, Trash2, Loader, AlertCircle, Search, Eye } from 'lucide-react';
import Pagination from '../../components/Pagination';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const RequisitionPage = () => {
    const [requisitions, setRequisitions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Pagination State
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchRequisitions = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/purchases/requisitions`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, size, sort: 'createdAt,desc' }
            });
            
            if (res.data.content) {
                setRequisitions(res.data.content);
                setTotalPages(res.data.totalPages);
                setTotalElements(res.data.totalElements);
            } else {
                const data = res.data || [];
                setRequisitions(data);
                setTotalPages(1);
                setTotalElements(data.length);
            }
        } catch (err) {
            console.error('Failed to fetch requisitions:', err);
            setError('Failed to fetch requisitions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequisitions();
    }, [page, size]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this requisition?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/purchases/requisitions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRequisitions();
        } catch (err) {
            console.error('Failed to delete requisition:', err);
            setError('Failed to delete requisition.');
        }
    };

    const filtered = requisitions.filter(req =>
        (req.requisitionNumber && req.requisitionNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (req.requestedBy && req.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (req.entity && req.entity.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusClass = (status) => {
        if (!status) return 'bg-slate-100 text-slate-800';
        switch (status.toUpperCase()) {
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
            case 'PENDING': return 'bg-blue-100 text-blue-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800';
            case 'COMPLETED': return 'bg-teal-100 text-teal-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="p-6 md:p-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold">Purchase Requisitions</h1>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by Req# / Requested By / Entity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input w-full sm:w-72 pr-10 bg-background-muted border-border"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    </div>
                    <Link to="/purchase-dashboard/requisitions/new" className="btn-primary flex items-center gap-2">
                        <PlusCircle size={18} /> New Requisition
                    </Link>
                </div>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <div className="bg-card rounded-xl shadow-sm overflow-hidden border">
                {loading ? (
                    <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-background-muted">
                                    <tr>
                                        <th className="th-cell">Date</th>
                                        <th className="th-cell">Req Number</th>
                                        <th className="th-cell">Requested By</th>
                                        <th className="th-cell">Recipient</th>
                                        <th className="th-cell">Required Date</th>
                                        <th className="th-cell">Entity</th>
                                        <th className="th-cell">Status</th>
                                        <th className="th-cell">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-foreground-muted">
                                    {filtered.length > 0 ? filtered.map(req => (
                                        <tr key={req.id} className="border-b hover:bg-background-muted">
                                            <td className="td-cell">{req.requisitionDate ? new Date(req.requisitionDate).toLocaleDateString() : ''}</td>
                                            <td className="td-cell font-medium text-foreground">
                                                <button
                                                    onClick={() => navigate(`/purchase-dashboard/requisitions/view/${req.id}`)}
                                                    className="text-primary underline hover:text-primary/80 font-semibold"
                                                >
                                                    {req.requisitionNumber || `REQ-${req.id}`}
                                                </button>
                                            </td>
                                            <td className="td-cell">{req.requestedBy || '-'}</td>
                                            <td className="td-cell">{req.recipient || '-'}</td>
                                            <td className="td-cell">{req.requiredDate ? new Date(req.requiredDate).toLocaleDateString() : '-'}</td>
                                            <td className="td-cell">{req.entity || '-'}</td>
                                            <td className="td-cell">
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusClass(req.status)}`}>
                                                    {req.status || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="td-cell">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => navigate(`/purchase-dashboard/requisitions/view/${req.id}`)} className="p-2 hover:text-primary hover:bg-background-muted rounded-full" title="View"><Eye className="h-4 w-4" /></button>
                                                    <button onClick={() => navigate(`/purchase-dashboard/requisitions/edit/${req.id}`)} className="p-2 hover:text-primary hover:bg-background-muted rounded-full" title="Edit"><Edit className="h-4 w-4" /></button>
                                                    <button onClick={() => handleDelete(req.id)} className="p-2 hover:text-red-600 hover:bg-background-muted rounded-full" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-10 text-foreground-muted">
                                                <AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" />
                                                <h3 className="mt-2 text-sm font-medium">No requisitions found</h3>
                                                <p className="mt-1 text-sm">Create a new requisition to get started.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination 
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            pageSize={size}
                            onPageSizeChange={(newSize) => { setSize(newSize); setPage(0); }}
                            totalElements={totalElements}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default RequisitionPage;
