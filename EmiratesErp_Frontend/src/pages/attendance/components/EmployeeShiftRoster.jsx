import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, Loader, AlertCircle, Calendar, User, Clock, FileText, Search, CheckCircle2, ChevronDown, Check } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CustomSelect = ({ value, onChange, options, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between pl-2.5 pr-2 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all cursor-pointer shadow-2xs hover:bg-background-muted/50"
            >
                <span className={`truncate ${selectedOption ? 'text-foreground font-medium' : 'text-foreground-muted'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-foreground-muted transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 p-1 space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                    <div
                        onClick={() => {
                            onChange('');
                            setIsOpen(false);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            !value ? 'bg-primary/10 text-primary font-bold' : 'text-foreground-muted hover:bg-background-muted'
                        }`}
                    >
                        {placeholder}
                    </div>
                    {options.map(opt => {
                        const isSelected = String(opt.value) === String(value);
                        return (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                                    isSelected 
                                        ? 'bg-primary text-primary-foreground font-bold' 
                                        : 'text-foreground hover:bg-primary/10 hover:text-primary'
                                }`}
                            >
                                <span className="truncate">{opt.label}</span>
                                {isSelected && <Check className="h-3 w-3 shrink-0 ml-1" />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const EmployeeShiftRoster = ({ embedded = false }) => {
    const [assignments, setAssignments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [shiftTypes, setShiftTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
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
            setError(err.response?.data?.message || err.response?.data || 'Failed to assign shift.');
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

    const filteredAssignments = useMemo(() => {
        return assignments.filter(row => {
            const name = (row.employeeName || '').toLowerCase();
            const code = (row.employeeCode || '').toLowerCase();
            const shift = (row.shiftTypeName || '').toLowerCase();
            const search = searchTerm.toLowerCase();
            return name.includes(search) || code.includes(search) || shift.includes(search);
        });
    }, [assignments, searchTerm]);

    const content = (
        <div className={`${embedded ? '' : 'p-4 md:p-6'} space-y-4 text-foreground bg-background min-h-full`}>
            {/* Quick Assign Form Card */}
            <div className="bg-card p-3.5 md:p-4 rounded-2xl shadow-xs border border-border">
                <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <PlusCircle className="h-4 w-4 text-primary" />
                    Assign New Shift
                </h3>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground-muted mb-1 flex items-center gap-1">
                            <User className="h-3 w-3 text-primary" /> Employee
                        </label>
                        <CustomSelect 
                            value={formData.employeeId}
                            onChange={(val) => setFormData(prev => ({ ...prev, employeeId: val }))}
                            options={employees.map(emp => ({ value: emp.id, label: `${emp.firstName} ${emp.lastName} (${emp.employeeCode})` }))}
                            placeholder="Select Employee..."
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-foreground-muted mb-1 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary" /> Shift Type
                        </label>
                        <CustomSelect 
                            value={formData.shiftTypeId}
                            onChange={(val) => setFormData(prev => ({ ...prev, shiftTypeId: val }))}
                            options={shiftTypes.map(st => ({ value: st.id, label: `${st.name} (${st.startTime}-${st.endTime})` }))}
                            placeholder="Select Shift..."
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-foreground-muted mb-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-primary" /> Date
                        </label>
                        <input 
                            type="date" 
                            name="assignedDate" 
                            value={formData.assignedDate} 
                            onChange={handleChange} 
                            required 
                            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-foreground-muted mb-1 flex items-center gap-1">
                            <FileText className="h-3 w-3 text-primary" /> Notes
                        </label>
                        <input 
                            type="text" 
                            name="notes" 
                            value={formData.notes} 
                            onChange={handleChange} 
                            placeholder="Optional notes"
                            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                    </div>

                    <div>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full px-3 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-all shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            {submitting ? <Loader className="animate-spin h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
                            {submitting ? 'Assigning...' : 'Assign Shift'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-2.5 p-2 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-xs flex items-center gap-1.5 font-medium">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div className="mt-2.5 p-2 bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg text-xs flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>{success}</span>
                    </div>
                )}
            </div>

            {/* Assignments Table Card */}
            <div className="bg-card rounded-2xl shadow-xs border border-border overflow-hidden">
                <div className="p-3 border-b border-border flex flex-wrap justify-between items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
                        <input 
                            type="text" 
                            placeholder="Search employee or shift..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-2.5 py-1 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all w-48 sm:w-64"
                        />
                    </div>
                    <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                        Roster Assignments ({filteredAssignments.length})
                    </div>
                </div>
                
                {loading ? (
                    <div className="p-12 flex justify-center items-center"><Loader className="animate-spin text-primary h-6 w-6" /></div>
                ) : (
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-background-muted/70 border-b border-border text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                                <tr>
                                    <th scope="col" className="px-3.5 py-2">Employee</th>
                                    <th scope="col" className="px-3.5 py-2">Date</th>
                                    <th scope="col" className="px-3.5 py-2">Shift Type</th>
                                    <th scope="col" className="px-3.5 py-2">Notes</th>
                                    <th scope="col" className="px-3.5 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50 text-xs text-foreground">
                                {filteredAssignments.length > 0 ? (
                                    filteredAssignments.map(row => (
                                        <tr key={row.id} className="hover:bg-background-muted/50 transition-colors">
                                            <td className="px-3.5 py-2 whitespace-nowrap">
                                                <div className="font-bold text-foreground">{row.employeeName}</div>
                                                <div className="text-[10px] text-foreground-muted">{row.employeeCode}</div>
                                            </td>
                                            <td className="px-3.5 py-2 text-xs font-mono text-foreground">
                                                {row.assignedDate}
                                            </td>
                                            <td className="px-3.5 py-2">
                                                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 inline-block">
                                                    {row.shiftTypeName}
                                                </span>
                                                <div className="text-[10px] text-foreground-muted mt-0.5 font-mono">
                                                    {row.startTime} - {row.endTime}
                                                </div>
                                            </td>
                                            <td className="px-3.5 py-2 text-xs text-foreground-muted max-w-xs truncate" title={row.notes}>
                                                {row.notes || '-'}
                                            </td>
                                            <td className="px-3.5 py-2 text-right">
                                                <button 
                                                    onClick={() => handleDelete(row.id)}
                                                    className="p-1 text-foreground-muted hover:text-red-600 hover:bg-background-muted rounded-lg transition-colors"
                                                    title="Delete Assignment"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12 text-foreground-muted text-xs">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <Calendar className="h-8 w-8 text-foreground-muted/30" />
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
