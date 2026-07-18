import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, Loader, AlertCircle, Calendar, User, Clock, FileText } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const EmployeeShiftRoster = ({ embedded = false }) => {
    const [assignments, setAssignments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [shiftTypes, setShiftTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        employeeId: '',
        shiftTypeId: '',
        assignedDate: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            
            const [rosterRes, empRes, shiftRes] = await Promise.all([
                axios.get(`${API_URL}/employee-shifts`, { headers }),
                axios.get(`${API_URL}/employees/all`, { headers }),
                axios.get(`${API_URL}/shift-types`, { headers })
            ]);
            
            setAssignments(rosterRes.data);
            setEmployees(empRes.data);
            setShiftTypes(shiftRes.data);
        } catch (err) {
            setError('Failed to fetch roster data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/employee-shifts`, formData, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setSuccess('Shift assigned successfully!');
            setFormData(prev => ({ ...prev, notes: '' }));
            fetchData();
        } catch (err) {
            setError(err.response?.data || 'Failed to assign shift. The employee might already have a shift for this date.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this roster assignment?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/employee-shifts/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert('Failed to delete assignment.');
        }
    };

    const content = (
        <div className={`${embedded ? '' : 'p-6 md:p-8'} space-y-8 text-foreground bg-background min-h-full`}>
            <div>
                <h2 className="text-2xl font-bold mb-4">Employee Shift Roster</h2>
                <p className="text-foreground-muted opacity-80">Manage date-specific shift assignments for employees.</p>
            </div>

            {/* Quick Assign Form */}
            <div className="bg-card text-card-foreground p-6 rounded-theme shadow-sm border border-border">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <PlusCircle size={20} className="text-primary" />
                    Assign New Shift
                </h3>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1 flex items-center gap-1">
                            <User size={14} /> Employee
                        </label>
                        <select 
                            name="employeeId" 
                            value={formData.employeeId} 
                            onChange={handleChange} 
                            required 
                            className="input bg-background-muted border-border text-foreground"
                        >
                            <option value="">Select Employee...</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeCode})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1 flex items-center gap-1">
                            <Clock size={14} /> Shift Type
                        </label>
                        <select 
                            name="shiftTypeId" 
                            value={formData.shiftTypeId} 
                            onChange={handleChange} 
                            required 
                            className="input bg-background-muted border-border text-foreground"
                        >
                            <option value="">Select Shift...</option>
                            {shiftTypes.map(st => (
                                <option key={st.id} value={st.id}>{st.name} ({st.startTime}-{st.endTime})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1 flex items-center gap-1">
                            <Calendar size={14} /> Date
                        </label>
                        <input 
                            type="date" 
                            name="assignedDate" 
                            value={formData.assignedDate} 
                            onChange={handleChange} 
                            required 
                            className="input bg-background-muted border-border text-foreground"
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-foreground-muted mb-1 flex items-center gap-1">
                                <FileText size={14} /> Notes
                            </label>
                            <input 
                                type="text" 
                                name="notes" 
                                value={formData.notes} 
                                onChange={handleChange} 
                                placeholder="Optional notes"
                                className="input bg-background-muted border-border text-foreground"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="btn-primary flex items-center justify-center min-w-[100px]"
                        >
                            {submitting ? <Loader className="animate-spin h-5 w-5" /> : 'Assign'}
                        </button>
                    </div>
                </form>

                {error && <p className="mt-3 text-sm text-error flex items-center gap-1 font-medium"><AlertCircle size={14} /> {error}</p>}
                {success && <p className="mt-3 text-sm text-success font-medium">{success}</p>}
            </div>

            {/* Assignments Table */}
            <div className="bg-card text-card-foreground rounded-theme shadow-sm overflow-hidden border border-border">
                <div className="p-4 border-b border-border bg-background-muted flex justify-between items-center">
                    <h3 className="font-bold text-foreground">Recent Assignments</h3>
                    <div className="text-[10px] text-foreground-muted uppercase tracking-widest font-black opacity-40">Roster List</div>
                </div>
                
                {loading ? (
                    <div className="p-20 flex justify-center"><Loader className="animate-spin text-primary h-8 w-8" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-background-muted">
                                <tr>
                                    <th className="th-cell">Employee</th>
                                    <th className="th-cell">Date</th>
                                    <th className="th-cell">Shift</th>
                                    <th className="th-cell">Notes</th>
                                    <th className="th-cell text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-card divide-y divide-border">
                                {assignments.length > 0 ? (
                                    assignments.map(row => (
                                        <tr key={row.id} className="hover:bg-background-muted transition-colors">
                                            <td className="td-cell">
                                                <div className="font-medium text-foreground">{row.employeeName}</div>
                                                <div className="text-xs text-foreground-muted">{row.employeeCode}</div>
                                            </td>
                                            <td className="td-cell text-sm font-mono opacity-80">
                                                {row.assignedDate}
                                            </td>
                                            <td className="td-cell">
                                                <div className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block border border-primary/20">
                                                    {row.shiftTypeName}
                                                </div>
                                                <div className="text-xs text-foreground-muted mt-1 opacity-70">
                                                    {row.startTime} - {row.endTime}
                                                </div>
                                            </td>
                                            <td className="td-cell text-sm text-foreground-muted max-w-xs truncate" title={row.notes}>
                                                {row.notes || '-'}
                                            </td>
                                            <td className="td-cell text-right">
                                                <button 
                                                    onClick={() => handleDelete(row.id)}
                                                    className="text-error hover:text-error/80 p-2 hover:bg-error/10 rounded-full transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="td-cell text-center py-20 text-foreground-muted opacity-60">
                                            <div className="flex flex-col items-center">
                                                <Calendar size={40} className="text-foreground-muted mb-2 opacity-20" />
                                                <p>No shift assignments found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    if (embedded) return content;

    return (
        <DashboardLayout>
            {content}
        </DashboardLayout>
    );
};

export default EmployeeShiftRoster;
