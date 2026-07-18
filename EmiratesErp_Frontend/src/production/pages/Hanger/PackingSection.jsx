import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Package,
    Plus,
    Trash2,
    Save,
    CheckCircle,
    FileText,
    Weight,
    Layers,
    Info,
    ChevronRight,
    Printer
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const PackingSection = ({ batchId, batchData, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [packingLogs, setPackingLogs] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [salesOrders, setSalesOrders] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        operatorId: '',
        salesOrderId: '',
        bundleSize: batchData?.hangerType?.defaultBundleSize || 100,
        totalBundles: 0,
        remainderDisposition: 'INCLUDE',
        grossWeightKg: '',
        netWeightKg: '',
        cartonSize: '',
        remarks: '',
        cartons: [
            { cartonNo: 'CTN-001', bundlesInCarton: 0, qtyInCarton: 0, grossWeightKg: '', sealStatus: 'OPEN' }
        ]
    });

    const [packedQty, setPackedQty] = useState(0);

    useEffect(() => {
        fetchPackingLogs();
        fetchEmployees();
        fetchSalesOrders();
    }, [batchId]);

    useEffect(() => {
        const qty = formData.bundleSize * formData.totalBundles;
        setPackedQty(qty);
    }, [formData.bundleSize, formData.totalBundles]);

    const fetchPackingLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/hanger/packing/by-batch/${batchId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPackingLogs(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching packing logs:', error);
            setPackingLogs([]);
        }
    };

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/employees/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setEmployees([]);
        }
    };

    const fetchSalesOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/sales/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            }); // assuming this endpoint exists
            const data = response.data.content || response.data;
            setSalesOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching sales orders:', error);
            setSalesOrders([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCartonChange = (index, field, value) => {
        const updatedCartons = [...formData.cartons];
        updatedCartons[index][field] = value;

        // Auto-calc qty in carton if bundles changed
        if (field === 'bundlesInCarton') {
            updatedCartons[index].qtyInCarton = value * formData.bundleSize;
        }

        setFormData(prev => ({ ...prev, cartons: updatedCartons }));
    };

    const addCarton = () => {
        const nextNum = formData.cartons.length + 1;
        setFormData(prev => ({
            ...prev,
            cartons: [
                ...prev.cartons,
                {
                    cartonNo: `CTN-${String(nextNum).padStart(3, '0')}`,
                    bundlesInCarton: 0,
                    qtyInCarton: 0,
                    grossWeightKg: '',
                    sealStatus: 'OPEN'
                }
            ]
        }));
    };

    const removeCarton = (index) => {
        if (formData.cartons.length === 1) return;
        setFormData(prev => ({
            ...prev,
            cartons: prev.cartons.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (isConfirm = false) => {
        if (!formData.operatorId) {
            toast.error('Please select an operator');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.post(`${API_BASE_URL}/hanger/packing`, {
                ...formData,
                batchId: Number(batchId)
            }, { headers });
            const packingId = response.data.id;

            if (isConfirm) {
                await axios.post(`${API_BASE_URL}/hanger/packing/${packingId}/confirm`, {}, { headers });
                toast.success('Packing confirmed! Finished goods stock updated and DO raised.');
            } else {
                toast.success('Packing record saved as draft');
            }

            fetchPackingLogs();
            onRefresh(); // Refresh batch details
            // Reset form if confirmed
            if (isConfirm) {
                setFormData({
                    operatorId: '',
                    salesOrderId: '',
                    bundleSize: batchData?.hangerType?.defaultBundleSize || 100,
                    totalBundles: 0,
                    remainderDisposition: 'INCLUDE',
                    grossWeightKg: '',
                    netWeightKg: '',
                    cartonSize: '',
                    remarks: '',
                    cartons: [{ cartonNo: 'CTN-001', bundlesInCarton: 0, qtyInCarton: 0, grossWeightKg: '', sealStatus: 'OPEN' }]
                });
            }
        } catch (error) {
            console.error('Error saving packing:', error);
            toast.error(error.response?.data?.message || 'Error saving packing record');
        } finally {
            setLoading(false);
        }
    };

    const downloadPackingList = async (id, packingNo) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/hanger/packing/${id}/packing-list`, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `PackingList-${packingNo}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Error downloading packing list');
        }
    };

    const activeLogs = Array.isArray(packingLogs) ? packingLogs : [];

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <Layers size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Planned Qty</p>
                        <p className="text-xl font-bold">{batchData?.plannedQty || 0} pcs</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Bundle Size</p>
                        <p className="text-xl font-bold">{formData.bundleSize} pcs</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-green-50 rounded-lg text-green-600">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Packed Total</p>
                        <p className="text-xl font-bold">{packedQty} pcs</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                        <Weight size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Gross Weight</p>
                        <p className="text-xl font-bold">{formData.grossWeightKg || '0.00'} kg</p>
                    </div>
                </div>
            </div>

            {/* Main Form */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-600 text-white rounded-lg">
                            <Package size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">New Packing Record</h3>
                            <p className="text-sm text-gray-500">Log bundles and cartons for finished goods</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Operator</label>
                            <select
                                name="operatorId"
                                value={formData.operatorId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Operator</option>
                                {Array.isArray(employees) && employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeCode})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Sales Order (Optional)</label>
                            <select
                                name="salesOrderId"
                                value={formData.salesOrderId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">None / Specific SO</option>
                                {Array.isArray(salesOrders) && salesOrders.map(so => (
                                    <option key={so.id} value={so.id}>{so.orderNumber} - {so.customer?.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Total Bundles</label>
                            <input
                                type="number"
                                name="totalBundles"
                                value={formData.totalBundles}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
                                placeholder="Number of bundles"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Bundle Size (pcs)</label>
                            <input
                                type="number"
                                name="bundleSize"
                                value={formData.bundleSize}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Gross Weight (kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="grossWeightKg"
                                value={formData.grossWeightKg}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
                                placeholder="Total packed weight"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Remainder Disposition</label>
                            <select
                                name="remainderDisposition"
                                value={formData.remainderDisposition}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="INCLUDE">Include in Last Carton</option>
                                <option value="HOLD">Hold for Next Batch</option>
                                <option value="SCRAP">Scrap</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Net Weight (kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="netWeightKg"
                                value={formData.netWeightKg}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
                                placeholder="Net weight without tare"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Carton Size</label>
                            <input
                                type="text"
                                name="cartonSize"
                                value={formData.cartonSize}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
                                placeholder="L x W x H cm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Remarks</label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
                            rows="2"
                            placeholder="Any packing notes..."
                        />
                    </div>

                    {/* Cartons Table */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-md font-bold text-gray-900 flex items-center space-x-2">
                                <Package size={18} />
                                <span>Carton Breakdown</span>
                            </h4>
                            <button
                                type="button"
                                onClick={addCarton}
                                className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Plus size={16} />
                                <span>Add Carton</span>
                            </button>
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Carton No</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700 text-center">Bundles</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700 text-center">Qty (pcs)</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700 text-center">Weight (kg)</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700 text-center">Seal Status</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {formData.cartons.map((carton, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={carton.cartonNo}
                                                    onChange={(e) => handleCartonChange(index, 'cartonNo', e.target.value)}
                                                    className="w-full px-2 py-1 border-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={carton.bundlesInCarton}
                                                    onChange={(e) => handleCartonChange(index, 'bundlesInCarton', parseInt(e.target.value) || 0)}
                                                    className="w-32 mx-auto px-2 py-1 border-gray-200 rounded text-center focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-center font-medium text-gray-600">
                                                {carton.qtyInCarton}
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={carton.grossWeightKg}
                                                    onChange={(e) => handleCartonChange(index, 'grossWeightKg', e.target.value)}
                                                    className="w-32 mx-auto px-2 py-1 border-gray-200 rounded text-center focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <select
                                                    value={carton.sealStatus}
                                                    onChange={(e) => handleCartonChange(index, 'sealStatus', e.target.value)}
                                                    className="px-2 py-1 border-gray-200 rounded text-xs"
                                                >
                                                    <option value="OPEN">OPEN</option>
                                                    <option value="SEALED">SEALED</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => removeCarton(index)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={loading}
                            className="px-6 py-2 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <Save size={18} />
                            <span>{loading ? 'Saving...' : 'Save Draft'}</span>
                        </button>
                        <button
                            onClick={() => handleSubmit(true)}
                            disabled={loading}
                            className="px-8 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center space-x-2"
                        >
                            <CheckCircle size={18} />
                            <span>{loading ? 'Confirming...' : 'Confirm Packing'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                        <FileText size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Packing History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Batch No</th>
                                <th className="px-6 py-4">Operator</th>
                                <th className="px-6 py-4">Qty</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {activeLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No packing records found for this batch
                                    </td>
                                </tr>
                            ) : (
                                activeLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-bold text-gray-900">{log.packingBatchNo}</td>
                                        <td className="px-6 py-4 text-gray-600">{log.operatorName}</td>
                                        <td className="px-6 py-4 text-gray-600">{log.packedQty} pcs ({log.totalCartons} cartons)</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.status === 'PACKED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(log.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => downloadPackingList(log.id, log.packingBatchNo)}
                                                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    <Printer size={14} />
                                                    <span>Packing List</span>
                                                </button>
                                                {log.deliveryOrderNo && (
                                                    <div className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold">
                                                        <CheckCircle size={14} />
                                                        <span>DO Raised</span>
                                                    </div>
                                                )}
                                            </div>
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

export default PackingSection;
