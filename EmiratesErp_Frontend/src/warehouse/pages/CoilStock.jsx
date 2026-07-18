import React, { useState, useEffect } from 'react';
import { Cylinder, CheckCircle, XCircle, AlertCircle, Info, Filter, Search, Plus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CoilStock = () => {
    const [coils, setCoils] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalWeight, setTotalWeight] = useState(0);
    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const [selectedCoil, setSelectedCoil] = useState(null);
    const [inspectionData, setInspectionData] = useState({ status: 'APPROVED', remarks: '' });

    const fetchCoils = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const response = await axios.get(`${API_URL}/hanger/coil-stock`, config);
            setCoils(response.data);

            const weightResp = await axios.get(`${API_URL}/hanger/coil-stock/total-remaining-weight`, config);
            setTotalWeight(weightResp.data);
        } catch (error) {
            console.error("Error fetching coils", error);
            toast.error("Failed to load coil stock");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoils();
    }, []);

    const handleOpenInspection = (coil) => {
        setSelectedCoil(coil);
        setInspectionData({ status: coil.inspectionStatus === 'PENDING' ? 'APPROVED' : coil.inspectionStatus, remarks: '' });
        setShowInspectionModal(true);
    };

    const handleInspectionSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/hanger/coil-stock/${selectedCoil.id}/inspection`, null, {
                params: {
                    status: inspectionData.status,
                    remarks: inspectionData.remarks
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Inspection status updated");
            setShowInspectionModal(false);
            fetchCoils();
        } catch (error) {
            console.error("Error updating inspection", error);
            toast.error("Failed to update inspection");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-green-100 text-green-800';
            case 'PARTIAL': return 'bg-blue-100 text-blue-800';
            case 'EXHAUSTED': return 'bg-gray-100 text-gray-800';
            case 'QUARANTINE': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getInspectionBadge = (status) => {
        switch (status) {
            case 'APPROVED': return <span className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle className="h-4 w-4" /> Approved</span>;
            case 'REJECTED': return <span className="flex items-center gap-1 text-red-600 font-medium"><XCircle className="h-4 w-4" /> Rejected</span>;
            case 'PENDING': return <span className="flex items-center gap-1 text-amber-600 font-medium"><AlertCircle className="h-4 w-4" /> Pending</span>;
            default: return status;
        }
    };

    return (
        <div className="p-6 h-full bg-gray-50 flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Coil Stock Management</h1>
                    <p className="text-gray-500">Track and manage raw wire material inventory</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-lg">
                        <Cylinder className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Remaining Stock</p>
                        <p className="text-xl font-bold text-gray-900">
                            {typeof totalWeight === 'object'
                                ? (totalWeight?.totalRemainingWeightKg ?? totalWeight?.total ?? 0).toLocaleString()
                                : (totalWeight || 0).toLocaleString()
                            } <span className="text-sm font-medium">kg</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Coil No, Heat No..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600">
                            <Filter className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Coil Details</th>
                                <th className="px-6 py-4 font-semibold">Specification</th>
                                <th className="px-6 py-4 font-semibold text-right">Weight (kg)</th>
                                <th className="px-6 py-4 font-semibold">QC Status</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Location</th>
                                <th className="px-6 py-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">Loading coil data...</td>
                                </tr>
                            ) : coils.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">No coils found in stock</td>
                                </tr>
                            ) : (
                                coils.map((coil) => (
                                    <tr key={coil.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{coil.coilNo}</div>
                                            <div className="text-xs text-gray-500">Heat: {coil.heatNo} | Lot: {coil.lotNo}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-700">{coil.materialType}</div>
                                            <div className="text-xs text-gray-500">{coil.wireGaugeMm} mm Gauge</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-sm font-bold text-gray-900">{coil.remainingWeightKg.toFixed(2)}</div>
                                            <div className="text-xs text-gray-400">Total: {coil.totalWeightKg.toFixed(1)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {getInspectionBadge(coil.inspectionStatus)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(coil.status)}`}>
                                                {coil.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {coil.warehouseLocation || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleOpenInspection(coil)}
                                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                title="Update Inspection"
                                            >
                                                <Info className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inspection Modal */}
            {showInspectionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowInspectionModal(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold">Update Coil Inspection</h3>
                            <button onClick={() => setShowInspectionModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Coil Number</label>
                                <input type="text" disabled value={selectedCoil?.coilNo} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">QC Result</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setInspectionData({ ...inspectionData, status: 'APPROVED' })}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${inspectionData.status === 'APPROVED' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-100 hover:bg-gray-50 text-gray-400'}`}
                                    >
                                        <CheckCircle className="h-8 w-8" />
                                        <span className="font-bold">Approve</span>
                                    </button>
                                    <button
                                        onClick={() => setInspectionData({ ...inspectionData, status: 'REJECTED' })}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${inspectionData.status === 'REJECTED' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-100 hover:bg-gray-50 text-gray-400'}`}
                                    >
                                        <XCircle className="h-8 w-8" />
                                        <span className="font-bold">Reject</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                <textarea
                                    rows="3"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    placeholder="Add QC notes..."
                                    value={inspectionData.remarks}
                                    onChange={(e) => setInspectionData({ ...inspectionData, remarks: e.target.value })}
                                ></textarea>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
                            <button onClick={() => setShowInspectionModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
                            <button onClick={handleInspectionSubmit} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-lg transition-all">
                                Save Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoilStock;
