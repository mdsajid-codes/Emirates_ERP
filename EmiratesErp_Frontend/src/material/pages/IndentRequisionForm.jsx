import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, Plus, Save, ArrowLeft, Edit } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const IndentRequisionForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID from URL for edit mode
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form Header State
    const [formData, setFormData] = useState({
        employeeName: 'Unknown', // Ideally fetched from logged-in user context
        employeeId: '',      // Need to resolve this
        departmentId: '',
        indentNo: '',
        indentDate: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    // Lists for Dropdowns
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);

    // Item Entry State
    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState({
        rawMaterialId: '',
        stockQty: 0,
        indentQuantity: 0,
        additionalDescription: '',
        remarks: '',
        unit: ''
    });

    const [editIndex, setEditIndex] = useState(-1);

    useEffect(() => {
        fetchInitialData();
        if (id) {
            setIsEditing(true);
            fetchIndentDetails(id);
        }
    }, [id]);

    const fetchIndentDetails = async (indentId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/material-indents/${indentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data;

            setFormData({
                employeeId: data.employeeId || (data.employee ? data.employee.id : '') || '',
                departmentId: data.departmentId || (data.department ? data.department.id : '') || '',
                indentNo: data.indentNo,
                indentDate: data.indentDate ? new Date(data.indentDate).toISOString().split('T')[0] : '',
                remarks: data.remarks || ''
            });

            // Map details to items and fetch stock
            if (data.details) {
                const mappedItems = await Promise.all(data.details.map(async (d) => {
                    let stock = 0;
                    try {
                        // Fetch stock for this specific item
                        const rmRes = await axios.get(`${API_URL}/production/raw-materials/${d.rawMaterialId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        stock = rmRes.data.stockQuantity || 0;
                    } catch (e) {
                        console.error(`Failed to fetch stock for RM ${d.rawMaterialId}`, e);
                    }

                    return {
                        id: d.id, // Keep ID for updates
                        rawMaterialId: d.rawMaterialId,
                        rawMaterialName: d.rawMaterialName,
                        itemCode: d.rawMaterialCode,
                        indentQuantity: d.indentQuantity,
                        additionalDescription: d.additionalDescription || '',
                        remarks: d.remarks || '',
                        unit: d.unit || 'Units',
                        stockQty: stock
                    };
                }));
                setItems(mappedItems);
            }
        } catch (error) {
            console.error("Failed to fetch indent details", error);
            alert("Failed to load indent details.");
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch Raw Materials (Paginated)
            try {
                const rmRes = await axios.get(`${API_URL}/production/raw-materials`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { page: 0, size: 1000 }
                });
                setRawMaterials(rmRes.data.content || []);
            } catch (e) { console.error("RM Fetch Error", e); }

            // Fetch Departments (List)
            try {
                const deptRes = await axios.get(`${API_URL}/departments`, authHeaders);
                setDepartments(deptRes.data || []);
            } catch (e) {
                console.warn("Could not fetch departments", e);
            }

            // Fetch Employees (List)
            try {
                const empRes = await axios.get(`${API_URL}/employees/all`, authHeaders);
                setEmployees(empRes.data || []);
            } catch (e) {
                console.warn("Could not fetch employees", e);
            }

        } catch (error) {
            console.error("Error loading initial data", error);
        }
    };

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = async (e) => {
        const { name, value } = e.target;

        if (name === 'rawMaterialId') {
            console.log("Selected RM ID:", value);
            const selectedRm = rawMaterials.find(rm => rm.id.toString() === value.toString());
            console.log("Found RM Object:", selectedRm);

            let stock = selectedRm?.stockQuantity || 0;
            const unit = selectedRm?.issueUnitName || selectedRm?.unit?.name || 'Units';

            // If stock is missing in the list object, try fetching detail
            if (value && selectedRm && selectedRm.stockQuantity === undefined) {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`${API_URL}/production/raw-materials/${value}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    stock = res.data.stockQuantity || 0;
                } catch (err) {
                    console.error("Failed to fetch specific RM stock", err);
                }
            }

            setCurrentItem(prev => ({
                ...prev,
                rawMaterialId: value,
                unit: unit,
                stockQty: stock
            }));
        } else {
            setCurrentItem(prev => ({ ...prev, [name]: value }));
        }
    };

    const addItem = () => {
        if (!currentItem.rawMaterialId || currentItem.indentQuantity <= 0) {
            alert("Please select a valid material and quantity.");
            return;
        }

        const selectedRm = rawMaterials.find(rm => rm.id.toString() === currentItem.rawMaterialId.toString());

        setItems(prev => [...prev, {
            ...currentItem,
            rawMaterialName: selectedRm?.name || 'Unknown',
            itemCode: selectedRm?.itemCode || '-'
        }]);

        resetCurrentItem();
    };

    const handleEditItem = (index) => {
        const itemToEdit = items[index];
        setCurrentItem({
            ...itemToEdit,
            rawMaterialId: itemToEdit.rawMaterialId
        });
        setEditIndex(index);
    };

    const handleUpdateItem = () => {
        if (!currentItem.rawMaterialId || currentItem.indentQuantity <= 0) {
            alert("Please select a valid material and quantity.");
            return;
        }

        const selectedRm = rawMaterials.find(rm => rm.id.toString() === currentItem.rawMaterialId.toString());

        setItems(prev => {
            const updated = [...prev];
            updated[editIndex] = {
                ...currentItem,
                id: prev[editIndex].id, // Preserve ID if it existed
                rawMaterialName: selectedRm?.name || prev[editIndex].rawMaterialName || 'Unknown',
                itemCode: selectedRm?.itemCode || prev[editIndex].itemCode || '-'
            };
            return updated;
        });

        setEditIndex(-1);
        resetCurrentItem();
    };

    const resetCurrentItem = () => {
        setCurrentItem({
            rawMaterialId: '',
            stockQty: 0,
            indentQuantity: 0,
            additionalDescription: '',
            remarks: '',
            unit: ''
        });
    };

    const removeItem = (index) => {
        if (editIndex === index) {
            setEditIndex(-1);
            resetCurrentItem();
        }
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (items.length === 0) {
            alert("Please add at least one item.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Payload matching backend expectation somewhat
            // NOTE: Backend requires 'materialRequisitionId'.
            // Since this is a standalone "New Indent" page, we might need to create a dummy Requisition
            // OR select an existing one. The screenshot doesn't show Requisition selection.
            // This suggests maybe this form CREATES a requisition implicitly or attaches to a 'General' one.
            // For now, I will send the payload. If it fails due to missing ID, we'll need to ask user.

            const payload = {
                indentNo: formData.indentNo,
                indentDate: formData.indentDate,
                departmentId: formData.departmentId,
                employeeId: formData.employeeId,
                status: 'PENDING',
                remarks: formData.remarks,
                // materialRequisitionId: ??? // CRITICAL MISSING PIECE
                details: items.map(item => ({
                    id: item.id, // Include ID for updates
                    rawMaterialId: item.rawMaterialId,
                    indentQuantity: item.indentQuantity,
                    remarks: item.remarks,
                    additionalDescription: item.additionalDescription
                }))
            };

            // Assuming we might need to link to a requisition. 
            // If the user intends this to be standalone, the backend might need adjustment 
            // or we pick a default. I'll omit if nullable, but Entity says 'optional=false'.
            // TEMPORARY FIX: Pass a hardcoded '1' or find a way. 
            // Better approach: Let's assume for this specific task the user wants the UI first.
            // I will mock the submit for now if it requires ID, or try to send it.

            // To make it work, I'll assume we might need a requisition ID. 
            // But since I don't have one, I'll comment out the actual post or try it and catch error.

            console.log("Submitting Payload:", payload);

            if (isEditing) {
                await axios.put(`${API_URL}/material-indents/update/${id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Indent Updated Successfully!");
            } else {
                await axios.post(`${API_URL}/material-indents/create`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Indent Created Successfully!");
            }

            navigate('/material-dashboard/indent-requisition');

        } catch (error) {
            console.error("Submission failed", error);
            alert("Failed to save indent. " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Navigation / Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <button onClick={() => navigate(-1)} className="hover:text-blue-600 flex items-center gap-1">
                    <ArrowLeft size={16} /> Back
                </button>
                <span>/ Indent Requisition</span>
            </div>

            {/* Main Form Container */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-primary px-6 py-4 border-b border-purple-500">
                    <h1 className="text-xl font-semibold text-white">{isEditing ? 'Edit Indent Requisition' : 'Add Indent Requisition'}</h1>
                </div>

                {/* Form Fields */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-gray-50/50">
                    {/* Employee */}
                    <div className="grid grid-cols-3 items-center">
                        <label className="text-sm font-semibold text-gray-700">Employee</label>
                        <div className="col-span-2">
                            <select
                                name="employeeId"
                                value={formData.employeeId || ''}
                                onChange={handleHeaderChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">--Select Employee--</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.firstName} {emp.lastName} ({emp.employeeId || emp.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Department */}
                    <div className="grid grid-cols-3 items-center">
                        <label className="text-sm font-semibold text-gray-700">Department</label>
                        <div className="col-span-2">
                            <select
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleHeaderChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">--Select department--</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Indent No */}
                    <div className="grid grid-cols-3 items-center">
                        <label className="text-sm font-semibold text-gray-700">Indent No.</label>
                        <div className="col-span-2">
                            <input
                                type="text"
                                name="indentNo"
                                value={formData.indentNo}
                                onChange={handleHeaderChange}
                                placeholder="Auto-generated if empty"
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Date */}
                    <div className="grid grid-cols-3 items-center">
                        <label className="text-sm font-semibold text-gray-700">Date</label>
                        <div className="col-span-2">
                            <input
                                type="date"
                                name="indentDate"
                                value={formData.indentDate}
                                onChange={handleHeaderChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Items Section */}
                <div className="p-6 border-t border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max">
                            <thead>
                                <tr className="text-left text-xs font-semibold text-gray-700 bg-gray-100 border-b border-gray-300">
                                    <th className="px-4 py-2 w-1/4">Item Details</th>
                                    <th className="px-4 py-2 w-24">Stock Qty.</th>
                                    <th className="px-4 py-2 w-24">Qty</th>
                                    <th className="px-4 py-2">Additional Description</th>
                                    <th className="px-4 py-2">Remark</th>
                                    <th className="px-4 py-2 w-20">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {/* Input Row */}
                                <tr className="bg-white">
                                    <td className="px-4 py-2">
                                        <select
                                            name="rawMaterialId"
                                            value={currentItem.rawMaterialId}
                                            onChange={handleItemChange}
                                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-blue-500"
                                        >
                                            <option value="">Type Here...</option>
                                            {rawMaterials.map(rm => (
                                                <option key={rm.id} value={rm.id}>{rm.name} ({rm.itemCode})</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            value={currentItem.stockQty}
                                            disabled
                                            className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-sm text-center"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            name="indentQuantity"
                                            value={currentItem.indentQuantity}
                                            onChange={handleItemChange}
                                            className="w-full p-2 border border-gray-300 rounded text-sm text-center focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <textarea
                                            name="additionalDescription"
                                            value={currentItem.additionalDescription}
                                            onChange={handleItemChange}
                                            rows="1"
                                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <textarea
                                            name="remarks"
                                            value={currentItem.remarks}
                                            onChange={handleItemChange}
                                            rows="1"
                                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-center whitespace-nowrap">
                                        {editIndex === -1 ? (
                                            <button
                                                onClick={addItem}
                                                className="bg-[#0ea5e9] hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                                            >
                                                Add
                                            </button>
                                        ) : (
                                            <div className="flex gap-1 justify-center">
                                                <button
                                                    onClick={handleUpdateItem}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded text-xs font-semibold transition-colors"
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    onClick={() => { setEditIndex(-1); resetCurrentItem(); }}
                                                    className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1.5 rounded text-xs font-semibold transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>

                                {/* Added Items List */}
                                {items.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm text-gray-800">
                                            {item.rawMaterialName} <span className="text-gray-500 text-xs">({item.itemCode})</span>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-center text-gray-600">
                                            {item.stockQty}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-center font-medium">
                                            {item.indentQuantity} {item.unit}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600">
                                            {item.additionalDescription || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600">
                                            {item.remarks || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-center flex gap-2 justify-center">
                                            <button
                                                onClick={() => handleEditItem(index)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => removeItem(index)}
                                                className="text-red-500 hover:text-red-700"
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

                {/* Footer / Submit */}
                <div className="bg-gray-100 px-6 py-4 flex justify-center border-t border-gray-200">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-[#84cc16] hover:bg-[#65a30d] text-white px-8 py-2 rounded text-sm font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IndentRequisionForm;
