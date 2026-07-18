import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader, Printer, Edit, Trash2, CheckCircle, XCircle, FileText, Target } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const RequisitionView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [requisition, setRequisition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchRequisition = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/purchases/requisitions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequisition(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load requisition details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequisition();
    }, [id]);

    const handleUpdateStatus = async (newStatus) => {
        if (!window.confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/purchases/requisitions/${id}/status`, null, {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: newStatus }
            });
            fetchRequisition(); // Refresh
        } catch (err) {
            console.error(err);
            alert('Failed to update status.');
        }
    };

    const handleConvertToPO = () => {
        if (!window.confirm('Are you sure you want to convert this Requisition to a Purchase Order?')) return;
        navigate(`/purchase-dashboard/purchase-orders/new`, { 
            state: { requisitionData: requisition } 
        });
    };


    const handleConvertToTendering = () => {
        if (!window.confirm('Are you sure you want to convert this Requisition to a Supplier Tendering?')) return;
        navigate(`/purchase-dashboard/supplier-tendering/new`, { 
            state: { requisitionData: requisition } 
        });
    };


    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this requisition?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/purchases/requisitions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/purchase-dashboard/requisitions');
        } catch (err) {
            console.error(err);
            alert('Failed to delete requisition.');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" size={32} /></div>;
    if (error) return <div className="p-12 text-center text-red-600 font-semibold">{error}</div>;
    if (!requisition) return <div className="p-12 text-center">Requisition not found.</div>;

    const getStatusClass = (status) => {
        if (!status) return 'bg-slate-100 text-slate-800';
        switch (status.toUpperCase()) {
            case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
            case 'DRAFT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'PENDING': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'COMPLETED': return 'bg-teal-100 text-teal-800 border-teal-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow min-h-screen">
            <div className="flex justify-between items-center mb-6 border-b pb-4 print:hidden">
                <div className="flex items-center gap-4">
                    <Link to="/purchase-dashboard/requisitions" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-800">Requisition #{requisition.requisitionNumber}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="px-4 py-2 border rounded-md flex items-center gap-2 hover:bg-slate-50 transition-colors">
                        <Printer size={18} /> Print
                    </button>
                    <Link to={`/purchase-dashboard/requisitions/edit/${id}`} className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors">
                        <Edit size={18} /> Edit
                    </Link>
                    <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center gap-2 hover:bg-red-700 transition-colors">
                        <Trash2 size={18} /> Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border rounded-lg p-6 bg-slate-50">
                <div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Requisition Number</div>
                    <div className="font-semibold text-slate-800 text-lg">{requisition.requisitionNumber}</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Date</div>
                    <div className="font-semibold text-slate-800 text-lg">{requisition.requisitionDate ? new Date(requisition.requisitionDate).toLocaleDateString() : '-'}</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Status</div>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full border ${getStatusClass(requisition.status)}`}>
                        {requisition.status || 'N/A'}
                    </span>
                </div>
                <div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Requested By</div>
                    <div className="font-medium text-slate-700">{requisition.requestedBy || '-'}</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Recipient</div>
                    <div className="font-medium text-slate-700">{requisition.recipient || '-'}</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Required Date</div>
                    <div className="font-medium text-slate-700">{requisition.requiredDate ? new Date(requisition.requiredDate).toLocaleDateString() : '-'}</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Entity</div>
                    <div className="font-medium text-slate-700">{requisition.entity || '-'}</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Basis</div>
                    <div className="font-medium text-slate-700">{requisition.basis || '-'}</div>
                </div>
                <div className="md:col-span-3">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Comment</div>
                    <div className="p-3 bg-white border rounded text-slate-700 italic">{requisition.comment || 'No comments'}</div>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden mb-8">
                <table className="min-w-full">
                    <thead className="bg-slate-100 text-slate-700 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider w-16 text-center">#</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Resource Type</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Item Details</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Spec/Content</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-right">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">UOM</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {(requisition.items || []).map((item, idx) => (
                            <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">{idx + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">{item.resourceType || '-'}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">
                                    <div className="font-bold">{item.itemName || '-'}</div>
                                    <div className="text-xs text-slate-400">ID: {item.itemId || 'N/A'}</div>
                                    {item.comment && <div className="mt-1 text-xs text-blue-600 flex items-center gap-1"><span className="font-bold underline">Note:</span> {item.comment}</div>}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 italic">{item.content || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold text-right">{item.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.uom || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center bg-blue-50 p-6 rounded-lg border border-blue-100 print:hidden gap-4">
                <div className="flex flex-col gap-1">
                    <div className="text-slate-700 font-bold">Actions & Status</div>
                    <div className="text-xs text-slate-500">Manage the lifecycle of this requisition</div>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center">
                    {/* Status Management */}
                    <div className="flex gap-2 border-r pr-3 border-blue-200">
                        <button 
                            onClick={() => handleUpdateStatus('APPROVED')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2 hover:bg-green-700 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={requisition.status === 'APPROVED' || requisition.status === 'COMPLETED' || actionLoading}
                        >
                            <CheckCircle size={16} /> Approve
                        </button>
                        <button 
                            onClick={() => handleUpdateStatus('REJECTED')}
                            className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center gap-2 hover:bg-red-700 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={requisition.status === 'REJECTED' || requisition.status === 'COMPLETED' || actionLoading}
                        >
                            <XCircle size={16} /> Reject
                        </button>
                    </div>

                    {/* Conversion Actions */}
                    <div className="flex gap-2">
                        <button 
                            onClick={handleConvertToPO}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={(requisition.status !== 'APPROVED' && requisition.status !== 'COMPLETED') || actionLoading}
                            title={!(requisition.status === 'APPROVED' || requisition.status === 'COMPLETED') ? "Only available for approved or completed requisitions" : ""}
                        >
                            {actionLoading ? <Loader size={16} className="animate-spin" /> : <FileText size={16} />}
                            Convert to PO
                        </button>
                        <button 
                            onClick={handleConvertToTendering}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={(requisition.status !== 'APPROVED' && requisition.status !== 'COMPLETED') || actionLoading}
                            title={!(requisition.status === 'APPROVED' || requisition.status === 'COMPLETED') ? "Only available for approved or completed requisitions" : ""}
                        >
                            {actionLoading ? <Loader size={16} className="animate-spin" /> : <Target size={16} />}
                            Convert to Tendering
                        </button>
                    </div>


                    <button 
                        onClick={() => handleUpdateStatus('CANCELLED')}
                        className="px-4 py-2 bg-slate-600 text-white rounded-md flex items-center gap-2 hover:bg-slate-700 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={requisition.status === 'CANCELLED' || requisition.status === 'COMPLETED' || actionLoading}
                    >
                        <ArrowLeft size={16} /> Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequisitionView;
