import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLayout';
import { Plus, Edit, Trash2, Loader, AlertCircle, ArrowLeft, BookCopy } from 'lucide-react';
import axios from 'axios';

// Inline screen form for adding/editing leave types
const LeaveTypeFormView = ({ onClose, onSave, leaveType, loading }) => {
    const [formData, setFormData] = useState({
        leaveType: leaveType?.leaveType || '',
        description: leaveType?.description || '',
        isPaid: leaveType ? (leaveType.isPaid || false) : true,
        maxDaysPerYear: leaveType?.maxDaysPerYear ?? ''
    });
    const [formError, setFormError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.leaveType.trim()) {
            setFormError('Leave Type name is required.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-200">
            {/* Sub-header with Back Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-background-muted transition-colors flex items-center gap-1.5 text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Leave Types
                    </button>
                    <div>
                        <h2 className="text-sm font-bold text-foreground">
                            {leaveType ? 'Edit Leave Type' : 'Add New Leave Type'}
                        </h2>
                        <p className="text-[11px] text-foreground-muted">Configure leave type name, yearly allowance, and paid status</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-card text-foreground rounded-xl border border-border p-4 shadow-2xs space-y-4 max-w-2xl">
                {formError && <div className="p-2.5 bg-rose-500/10 text-rose-500 text-xs rounded-md">{formError}</div>}

                <div className="space-y-3">
                    <div>
                        <label htmlFor="leaveType" className="block text-xs font-medium text-foreground-muted mb-1">Leave Type Name</label>
                        <input
                            id="leaveType"
                            name="leaveType"
                            value={formData.leaveType}
                            onChange={handleChange}
                            required
                            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="e.g. Annual Leave, Casual Leave"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-xs font-medium text-foreground-muted mb-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Provide details or guidelines for this leave type..."
                        />
                    </div>
                    <div>
                        <label htmlFor="maxDaysPerYear" className="block text-xs font-medium text-foreground-muted mb-1">Max Days Per Year</label>
                        <input
                            id="maxDaysPerYear"
                            name="maxDaysPerYear"
                            type="number"
                            value={formData.maxDaysPerYear}
                            onChange={handleChange}
                            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="e.g., 12"
                        />
                    </div>
                    <div>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isPaid"
                                checked={formData.isPaid}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary"
                            />
                            <span className="text-xs font-medium text-foreground">Is Paid Leave</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-1.5 text-xs font-semibold text-foreground-muted hover:bg-background-muted rounded-lg transition-colors border border-border"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading && <Loader className="animate-spin h-3.5 w-3.5" />}
                        Save Leave Type
                    </button>
                </div>
            </form>
        </div>
    );
};

const LeaveType = ({ embedded = false }) => {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLeaveType, setEditingLeaveType] = useState(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchLeaveTypes = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/leave-types`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setLeaveTypes(response.data);
        } catch (err) {
            setError('Failed to fetch leave types. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveTypes();
    }, [API_URL]);

    const handleAdd = () => {
        setEditingLeaveType(null);
        setIsFormOpen(true);
    };

    const handleEdit = (leaveType) => {
        setEditingLeaveType(leaveType);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingLeaveType(null);
    };

    const handleDelete = async (leaveTypeId, leaveTypeName) => {
        if (window.confirm(`Are you sure you want to delete the leave type "${leaveTypeName}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/leave-types/${leaveTypeId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setLeaveTypes(leaveTypes.filter(lt => lt.id !== leaveTypeId));
            } catch (err) {
                setError('Failed to delete leave type.');
                console.error(err);
            }
        }
    };

    const handleSave = async (leaveTypeData) => {
        setFormLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (editingLeaveType) {
                await axios.put(`${API_URL}/leave-types/${editingLeaveType.id}`, leaveTypeData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/leave-types`, leaveTypeData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            }
            handleCloseForm();
            fetchLeaveTypes();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save leave type. The name might already exist.');
            console.error(err);
        } finally {
            setFormLoading(false);
        }
    };

    if (isFormOpen) {
        return (
            <LeaveTypeFormView
                onClose={handleCloseForm}
                onSave={handleSave}
                leaveType={editingLeaveType}
                loading={formLoading}
            />
        );
    }

    const content = (
        <div className={embedded ? 'space-y-3' : 'p-4 md:p-6 space-y-3 bg-background'}>
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <BookCopy className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-foreground">Leave Types</h2>
                        <p className="text-[11px] text-foreground-muted">Define and manage company leave categories and yearly limits</p>
                    </div>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                    <Plus size={14} /> Add Leave Type
                </button>
            </div>

            {error && (
                <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-lg flex items-center gap-2 border border-rose-500/20">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-border">
                {loading ? (
                    <div className="flex justify-center items-center h-48 bg-card"><Loader className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (
                    <table className="min-w-full bg-card text-foreground divide-y divide-border">
                        <thead className="bg-background-muted/60">
                            <tr>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Leave Type</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Description</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Paid</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Max Days/Year</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {leaveTypes.length > 0 ? (
                                leaveTypes.map(lt => (
                                    <tr key={lt.id} className="hover:bg-background-muted/40 transition-colors">
                                        <td className="px-3 py-2 text-xs font-semibold text-foreground">{lt.leaveType}</td>
                                        <td className="px-3 py-2 text-xs text-foreground-muted max-w-xs truncate" title={lt.description}>{lt.description || '-'}</td>
                                        <td className="px-3 py-2 text-xs">
                                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${lt.isPaid ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                                                {lt.isPaid ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-foreground-muted font-medium">{lt.maxDaysPerYear ?? 'N/A'}</td>
                                        <td className="px-3 py-2 text-xs text-right">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => handleEdit(lt)} className="p-1 text-primary hover:bg-primary/10 rounded-md transition-colors" title="Edit">
                                                    <Edit size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(lt.id, lt.leaveType)} className="p-1 text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors" title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-foreground-muted">
                                        <BookCopy className="mx-auto h-8 w-8 text-foreground-muted/40 mb-1.5" />
                                        <h3 className="text-xs font-semibold text-foreground">No leave types found</h3>
                                        <p className="mt-0.5 text-[11px] text-foreground-muted">Get started by creating a new leave type.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );

    if (embedded) {
        return content;
    }

    return (
        <DashboardLayout>{content}</DashboardLayout>
    );
};

export default LeaveType;
