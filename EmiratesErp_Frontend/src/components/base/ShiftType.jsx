import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLayout';
import { Plus, Edit, Trash2, Loader, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

// Modal for adding/editing shift types
const ShiftTypeModal = ({ isOpen, onClose, onSave, shiftType, loading }) => {
    const [shiftPolicies, setShiftPolicies] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        startTime: '',
        endTime: '',
        breakMinutes: 0,
        isNightShift: false,
        shiftPolicyId: ''
    });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (shiftType) {
            setFormData({
                name: shiftType.name || '',
                code: shiftType.code || '',
                startTime: shiftType.startTime || '',
                endTime: shiftType.endTime || '',
                breakMinutes: shiftType.breakMinutes || 0,
                isNightShift: shiftType.isNightShift || false,
                shiftPolicyId: ''
            });
        } else {
            setFormData({ 
                name: '', 
                code: '', 
                startTime: '', 
                endTime: '', 
                breakMinutes: 0, 
                isNightShift: false, 
                shiftPolicyId: '' 
            });
        }
        setModalError('');

        const fetchShiftPolicies = async () => {
            if (isOpen) {
                try {
                    const token = localStorage.getItem('token');
                    const API_URL = import.meta.env.VITE_API_BASE_URL;
                    const response = await axios.get(`${API_URL}/shift-policies`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    setShiftPolicies(response.data);
                } catch (err) {
                    console.error("Failed to fetch shift policies", err);
                    setModalError("Could not load shift policies.");
                }
            }
        };
        fetchShiftPolicies();
    }, [shiftType, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'shiftPolicyId') {
            const selectedPolicy = shiftPolicies.find(p => p.id === parseInt(value));
            if (selectedPolicy) {
                setFormData(prev => ({
                    ...prev,
                    startTime: selectedPolicy.shiftStartTime,
                    endTime: selectedPolicy.shiftEndTime,
                    breakMinutes: selectedPolicy.breakMinutes || 0,
                    isNightShift: selectedPolicy.isNightShift || false,
                    [name]: value
                }));
            }
        } else {
            setFormData(prev => ({ 
                ...prev, 
                [name]: type === 'checkbox' ? checked : value 
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.code.trim() || !formData.startTime || !formData.endTime) {
            setModalError('All core fields are required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{shiftType ? 'Edit' : 'Add'} Shift Type</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name*</label>
                            <input id="name" name="name" value={formData.name} onChange={handleChange} required className="input" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="code" className="block text-sm font-medium text-slate-700">Code*</label>
                            <input id="code" name="code" value={formData.code} onChange={handleChange} required className="input" />
                        </div>
                        {!shiftType && ( // Only show dropdown for new shift types
                            <div className="md:col-span-2">
                                <label htmlFor="shiftPolicyId" className="block text-sm font-medium text-slate-700">Select Settings from Shift Policy</label>
                                <select id="shiftPolicyId" name="shiftPolicyId" value={formData.shiftPolicyId} onChange={handleChange} className="input">
                                    <option value="">Select a policy...</option>
                                    {shiftPolicies.map(policy => (
                                        <option key={policy.id} value={policy.id}>{policy.policyName} ({policy.shiftStartTime} - {policy.shiftEndTime})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-slate-700">Start Time*</label>
                            <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleChange} required className="input" />
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-slate-700">End Time*</label>
                            <input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={handleChange} required className="input" />
                        </div>

                        <div>
                            <label htmlFor="breakMinutes" className="block text-sm font-medium text-slate-700">Break (mins)</label>
                            <input type="number" id="breakMinutes" name="breakMinutes" value={formData.breakMinutes} onChange={handleChange} className="input" />
                        </div>

                        <div className="flex items-center mt-6">
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    name="isNightShift" 
                                    checked={formData.isNightShift} 
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                                />
                                <span className="ml-2 text-sm text-slate-700 font-medium">Is Night Shift</span>
                            </label>
                        </div>

                        {modalError && <p className="md:col-span-2 text-red-500 text-sm">{modalError}</p>}
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={loading}>
                            {loading && <Loader className="animate-spin h-4 w-4 mr-2" />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ShiftType = ({ embedded = false }) => {
    const [shiftTypes, setShiftTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShiftType, setEditingShiftType] = useState(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchShiftTypes = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/shift-types`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setShiftTypes(response.data);
        } catch (err) {
            setError('Failed to fetch shift types. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShiftTypes();
    }, [API_URL]);

    const handleAdd = () => {
        setEditingShiftType(null);
        setIsModalOpen(true);
    };

    const handleEdit = (shiftType) => {
        setEditingShiftType(shiftType);
        setIsModalOpen(true);
    };

    const handleDelete = async (shiftTypeId, shiftTypeName) => {
        if (window.confirm(`Are you sure you want to delete the shift type "${shiftTypeName}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/shift-types/${shiftTypeId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setShiftTypes(shiftTypes.filter(st => st.id !== shiftTypeId));
            } catch (err) {
                setError('Failed to delete shift type.');
                console.error(err);
            }
        }
    };

    const handleSave = async (shiftTypeData) => {
        setModalLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (editingShiftType) {
                await axios.put(`${API_URL}/shift-types/${editingShiftType.id}`, shiftTypeData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/shift-types`, shiftTypeData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            }
            setIsModalOpen(false);
            fetchShiftTypes();
        } catch (err) {
            setError(err.response?.data || 'Failed to save shift type. The name or code might already exist.');
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const content = (
        <>
            <div className="p-6 md:p-8 bg-background min-h-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-foreground">Shift Types</h1>
                    <button
                        onClick={handleAdd}
                        className="btn-primary flex items-center">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Shift Type
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-theme relative mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden border border-border">
                    {loading ? (
                        <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-card">
                                <thead className="bg-background-muted">
                                    <tr>
                                        <th className="th-cell">Name</th>
                                        <th className="th-cell">Code</th>
                                        <th className="th-cell">Start Time</th>
                                        <th className="th-cell">End Time</th>
                                        <th className="th-cell">Break</th>
                                        <th className="th-cell">Status</th>
                                        <th className="th-cell">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-foreground/80">
                                    {shiftTypes.length > 0 ? (
                                        shiftTypes.map(st => (
                                            <tr key={st.id} className="border-b border-border hover:bg-background-muted transition-colors">
                                                <td className="td-cell font-medium">{st.name}</td>
                                                <td className="td-cell text-sm opacity-70">{st.code}</td>
                                                <td className="td-cell text-sm opacity-70">{st.startTime}</td>
                                                <td className="td-cell text-sm opacity-70">{st.endTime}</td>
                                                <td className="td-cell text-sm opacity-70">{st.breakMinutes} mins</td>
                                                <td className="td-cell text-sm">
                                                    {st.nightShift ? (
                                                        <span className="px-2 py-1 bg-indigo-100/20 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-semibold uppercase">Night</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-amber-100/20 text-amber-500 border border-amber-500/20 rounded-full text-xs font-semibold uppercase">Day</span>
                                                    )}
                                                </td>
                                                <td className="td-cell">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleEdit(st)} className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors" title="Edit">
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(st.id, st.name)} className="p-2 text-foreground-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" title="Delete">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-10 text-foreground-muted italic opacity-60">
                                                <AlertCircle className="mx-auto h-12 w-12 opacity-30" />
                                                <h3 className="mt-2 text-sm font-medium">No shift types found</h3>
                                                <p className="mt-1 text-sm">Get started by creating a new shift type.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <ShiftTypeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                shiftType={editingShiftType}
                loading={modalLoading}
            />
        </>
    );

    if (embedded) {
        return content;
    }

    return (
        <DashboardLayout>{content}</DashboardLayout>
    );
}

export default ShiftType;