import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader, Layers, Edit, Trash2, Plus, Save } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ViewBomInformation = ({ bomId, bomType = 'SEMI_FINISHED', onClose, quantity = 1, startDate, endDate }) => {
    const [bom, setBom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [employees, setEmployees] = useState([]);
    const [localOperations, setLocalOperations] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!bomId) return;
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const authHeaders = { headers: { "Authorization": `Bearer ${token}` } };

                const endpoint = bomType === 'FINISHED_GOOD'
                    ? `${API_URL}/production/bom-finished-goods/${bomId}`
                    : `${API_URL}/production/bom-semi-finished/${bomId}`;

                const [bomRes, empRes] = await Promise.all([
                    axios.get(endpoint, authHeaders),
                    axios.get(`${API_URL}/employees/all`, authHeaders).catch(() => ({ data: [] }))
                ]);

                const bomData = bomRes.data;

                // Fetch live stock details for each component
                const detailsWithStock = await Promise.all(bomData.details.map(async (detail) => {
                    try {
                        let stock = 0;
                        if (detail.rawMaterial?.id) {
                            const res = await axios.get(`${API_URL}/production/raw-materials/${detail.rawMaterial.id}`, authHeaders);
                            stock = res.data.stockQuantity || res.data.stock || 0;
                            // Update the rawMaterial object with latest data
                            detail.rawMaterial = { ...detail.rawMaterial, ...res.data };
                        } else if (detail.childSemiFinished?.id) {
                            const res = await axios.get(`${API_URL}/production/semi-finished/${detail.childSemiFinished.id}`, authHeaders);
                            stock = res.data.stockQuantity || res.data.stock || 0;
                            // Update the childSemiFinished object with latest data
                            detail.childSemiFinished = { ...detail.childSemiFinished, ...res.data };
                        }
                        return { ...detail, liveStock: stock };
                    } catch (e) {
                        console.error("Failed to fetch stock for item", e);
                        return { ...detail, liveStock: 0 };
                    }
                }));

                setBom({ ...bomData, details: detailsWithStock });
                setEmployees(empRes.data || []);

                // Initialize local operations state
                const components = detailsWithStock || [];
                // Group by process name to create unique operations
                const uniqueProcessNames = Array.from(new Set(components.filter(c => c.process).map(c => c.process.name)));

                const initialOps = uniqueProcessNames.map((procName, idx) => {
                    const relevantComp = components.find(c => c.process?.name === procName);
                    return {
                        id: `temp-${idx}`, // temporary ID
                        processName: procName,
                        notes: relevantComp.notes || 'None',
                        qty: quantity,
                        totalCost: 0,
                        workstations: `WCT-00${idx + 1}-1 ${procName}(1)`,
                        shift: 'Day Shift',
                        manufacturingOverhead: 0,
                        start: new Date(),
                        finish: new Date(),
                        assignTo: '',
                        labourCost: 0
                    };
                });
                setLocalOperations(initialOps);

            } catch (err) {
                console.error("Failed to fetch BOM details", err);
                setError('Failed to load BOM information.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [bomId, bomType, quantity]);

    if (loading) return <div className="h-full flex items-center justify-center p-10"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
    if (error) return <div className="h-full flex items-center justify-center text-red-500 p-10">{error}</div>;
    if (!bom) return null;

    // Helper to format dates
    const formatDate = (date) => date ? new Date(date).toLocaleString() : '-';

    // Calculate time duration
    const calculateDuration = (start, end) => {
        if (!start || !end) return '-';
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();

        if (isNaN(startTime) || isNaN(endTime)) return '-';

        // Calculate absolute difference
        let diff = Math.abs(endTime - startTime);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        diff -= days * (1000 * 60 * 60 * 24);

        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);

        const minutes = Math.floor(diff / (1000 * 60));

        const parts = [];
        if (days > 0) parts.push(`${days} days`);
        if (hours > 0) parts.push(`${hours} hours`);
        if (minutes > 0) parts.push(`${minutes} minutes`);

        return parts.length > 0 ? parts.join(', ') : '0 minutes';
    };

    const components = bom.details || [];

    const handleOperationChange = (index, field, value) => {
        const updatedOps = [...localOperations];
        updatedOps[index] = { ...updatedOps[index], [field]: value };
        setLocalOperations(updatedOps);
    };

    const handleDeleteOperation = (index) => {
        if (window.confirm('Remove this operation?')) {
            const updatedOps = localOperations.filter((_, i) => i !== index);
            setLocalOperations(updatedOps);
        }
    };

    const handleAddOperation = () => {
        const newOp = {
            id: `new-${Date.now()}`,
            processName: 'New Process',
            notes: '',
            qty: quantity,
            totalCost: 0,
            workstations: 'Default',
            shift: 'Day Shift',
            manufacturingOverhead: 0,
            start: new Date(),
            finish: new Date(),
            assignTo: '',
            labourCost: 0
        };
        setLocalOperations([...localOperations, newOp]);
    };

    return (
        <div className="flex flex-col h-full bg-white text-gray-800 font-sans shadow-xl rounded-lg overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="py-3 px-6 bg-primary text-white flex justify-between items-center shadow-md">
                <h2 className="text-lg font-bold tracking-wide uppercase">BOM Information</h2>
                <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">

                <h3 className="text-2xl font-normal text-gray-700 mb-6">BOM Information</h3>

                {/* Info Grid */}
                <div className="bg-white p-4 rounded-sm border border-gray-200 mb-8 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
                        <div className="flex border-b border-gray-100 pb-1">
                            <span className="w-40 font-semibold text-gray-600">Item</span>
                            <span className="flex-1 font-medium">{bom.item?.name}</span>
                        </div>
                        <div className="flex border-b border-gray-100 pb-1">
                            <span className="w-40 font-semibold text-gray-600">Approximate Cost</span>
                            <span className="flex-1 font-medium">{bom.approximateCost || '0.26'}</span>
                        </div>
                        <div className="flex border-b border-gray-100 pb-1">
                            <span className="w-40 font-semibold text-gray-600">Quantity</span>
                            <span className="flex-1 font-medium">{quantity}</span>
                        </div>
                        <div className="flex border-b border-gray-100 pb-1">
                            <span className="w-40 font-semibold text-gray-600">Earliest Start Date</span>
                            <span className="flex-1 font-medium">{formatDate(startDate)}</span>
                        </div>
                        <div className="flex border-b border-gray-100 pb-1">
                            <span className="w-40 font-semibold text-gray-600">BOM</span>
                            <span className="flex-1 font-medium text-purple-700">{bom.bomName}</span>
                        </div>
                        <div className="flex border-b border-gray-100 pb-1">
                            <span className="w-40 font-semibold text-gray-600">Earliest End Date</span>
                            <span className="flex-1 font-medium">{formatDate(endDate)}</span>
                        </div>
                        <div className="flex border-b border-gray-100 pb-1">
                            <span className="w-40 font-semibold text-gray-600">Routing</span>
                            <span className="flex-1 font-medium text-gray-500">78765 {bom.item?.name} Routing</span>
                        </div>
                        <div className="flex border-b border-gray-100 pb-1">
                            <span className="w-40 font-semibold text-gray-600">Time</span>
                            <span className="flex-1 font-medium">{calculateDuration(startDate, endDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Components Table */}
                <div className="mb-8 overflow-x-auto bg-white rounded shadow-sm">
                    <table className="w-full text-xs text-left">
                        <thead>
                            <tr className="bg-[#e9d8e9] text-gray-700 font-bold border-b border-gray-300">
                                <th className="p-3 border-r border-gray-200 w-16">Sr.No</th>
                                <th className="p-3 border-r border-gray-200">Process Name</th>
                                <th className="p-3 border-r border-gray-200">Component Name</th>
                                <th className="p-3 border-r border-gray-200">Quantity Required</th>
                                <th className="p-3 border-r border-gray-200">Available Quantity</th>
                                <th className="p-3 border-r border-gray-200">For Production Quantity Required</th>
                                <th className="p-3 border-r border-gray-200">UOM</th>
                                <th className="p-3 border-r border-gray-200">Rate/Unit</th>
                                <th className="p-3 border-r border-gray-200">Total Amount</th>
                                <th className="p-3">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {components.map((comp, idx) => {
                                const availQty = comp.liveStock !== undefined ? comp.liveStock : (comp.rawMaterial?.stockQuantity || comp.rawMaterial?.stock || comp.childSemiFinished?.stockQuantity || comp.childSemiFinished?.stock || 0);
                                // Check issueUnitName/purchaseUnitName first (from Raw Material View), then legacy fields
                                const uom = comp.rawMaterial?.issueUnitName || comp.rawMaterial?.purchaseUnitName || comp.rawMaterial?.unit?.name || comp.rawMaterial?.uom?.name ||
                                    comp.childSemiFinished?.unit?.name || comp.childSemiFinished?.uom?.name || 'Units';
                                return (
                                    <tr key={idx} className="border-b hover:bg-gray-50 text-gray-600">
                                        <td className="p-2 border-r">{idx + 1}</td>
                                        <td className="p-2 border-r">{comp.process?.name || '-'}</td>
                                        <td className="p-2 border-r font-medium text-gray-800">
                                            {comp.rawMaterial?.name || comp.childSemiFinished?.name || '-'}
                                        </td>
                                        <td className="p-2 border-r">{comp.quantity || '-'}</td>
                                        <td className="p-2 border-r">{availQty}</td>
                                        <td className="p-2 border-r">{comp.quantity * quantity}</td>
                                        <td className="p-2 border-r">{uom}</td>
                                        <td className="p-2 border-r">0</td>
                                        <td className="p-2 border-r">0</td>
                                        <td className="p-2 italic">{comp.notes || '-'}</td>
                                    </tr>
                                );
                            })}
                            {components.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="p-4 text-center text-gray-400">No components found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Operations Header */}
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{bom.item?.name} {quantity}</h3>

                {/* Operations Table */}
                <div className="overflow-x-auto bg-white rounded shadow-sm pb-10">
                    <table className="w-full text-xs text-left">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300">
                                <th className="p-3 border-r border-gray-200">Process Name</th>
                                <th className="p-3 border-r border-gray-200 w-12">Qty</th>
                                <th className="p-3 border-r border-gray-200 w-20">Total Cost</th>
                                <th className="p-3 border-r border-gray-200">Workstations</th>
                                <th className="p-3 border-r border-gray-200 w-24">Shifts</th>
                                <th className="p-3 border-r border-gray-200 w-24">Manufacturing Overhead</th>
                                <th className="p-3 border-r border-gray-200 w-32">Start</th>
                                <th className="p-3 border-r border-gray-200 w-32">Finish</th>
                                <th className="p-3 border-r border-gray-200 w-32">Assign To</th>
                                <th className="p-3 border-r border-gray-200 w-20">Labour Cost</th>
                                <th className="p-3 w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {localOperations.map((op, idx) => (
                                <tr key={op.id || idx} className="border-b hover:bg-gray-50 text-gray-600 align-top">
                                    <td className="p-2 border-r">
                                        <div className="font-semibold text-gray-800">{op.processName}</div>
                                        <div className="text-[10px] text-gray-400 mt-1">Notes: {op.notes}</div>
                                    </td>
                                    <td className="p-2 border-r text-center">{op.qty}</td>
                                    <td className="p-2 border-r text-right">{op.totalCost}</td>
                                    <td className="p-2 border-r">{op.workstations}</td>
                                    <td className="p-2 border-r">
                                        <select
                                            value={op.shift}
                                            onChange={(e) => handleOperationChange(idx, 'shift', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded px-1 py-0.5"
                                        >
                                            <option value="Day Shift">Day Shift</option>
                                            <option value="Night Shift">Night Shift</option>
                                        </select>
                                    </td>
                                    <td className="p-2 border-r text-right">{op.manufacturingOverhead}</td>
                                    <td className="p-2 border-r text-[10px]">{formatDate(op.start)}</td>
                                    <td className="p-2 border-r text-[10px]">{formatDate(op.finish)}</td>
                                    <td className="p-2 border-r">
                                        <select
                                            value={op.assignTo}
                                            onChange={(e) => handleOperationChange(idx, 'assignTo', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded px-1 py-0.5"
                                        >
                                            <option value="">Select</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-2 border-r text-right">{op.labourCost}</td>
                                    <td className="p-2 flex gap-1 justify-center">
                                        <button onClick={() => console.log('Edit', op)} className="p-1 bg-purple-700 text-white rounded hover:bg-purple-800"><Edit size={12} /></button>
                                        <button onClick={() => handleDeleteOperation(idx)} className="p-1 bg-red-500 text-white rounded hover:bg-red-600"><Trash2 size={12} /></button>
                                        <button onClick={handleAddOperation} className="p-1 bg-purple-900 text-white rounded hover:bg-black"><Plus size={12} /></button>
                                    </td>
                                </tr>
                            ))}
                            {localOperations.length === 0 && (
                                <tr><td colSpan={11} className="p-4 text-center text-gray-400">No operations found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default ViewBomInformation;
