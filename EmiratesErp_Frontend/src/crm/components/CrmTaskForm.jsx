import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Loader, Save, X, ClipboardList, Calendar, Users, FileText, CheckCircle2, Tag, Target } from 'lucide-react';
import CustomMultiSelect from './CustomMultiSelect';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const FormField = ({ label, children, required, icon: Icon }) => (
    <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-bold text-[#102A43] uppercase tracking-wider">
            {Icon && <Icon size={14} className="text-[#00A3A6]" />}
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            {children}
        </div>
    </div>
);

const CrmTaskForm = ({ item, onSave, onCancel, loading: isSubmitting, leadId }) => {
    const [formData, setFormData] = useState({
        subject: 'TASK', comments: '', dueDate: '', callTime: '',
        assignedToEmployeeId: '', employeeIds: [], contactIds: [], status: 'OPEN', leadId: leadId || null
    });

    const [selectData, setSelectData] = useState({ employees: [], contacts: [], leads: [] });
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };
                const [employeesRes, contactsRes, leadsRes] = await Promise.all([
                    axios.get(`${API_URL}/employees/all`, { headers }),
                    axios.get(`${API_URL}/contacts`, { headers }),
                    axios.get(`${API_URL}/crm/leads?size=1000`, { headers })
                ]);
                setSelectData({
                    employees: employeesRes.data || [],
                    contacts: contactsRes.data?.content || contactsRes.data || [],
                    leads: leadsRes.data?.content || leadsRes.data || [],
                });
            } catch (error) {
                console.error("Failed to fetch form select data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (item) {
            setFormData({
                subject: item.subject || 'TASK',
                comments: item.comments || '',
                dueDate: item.dueDate || '',
                callTime: item.callTime || '',
                assignedToEmployeeId: item.assignedToId || '',
                employeeIds: item.employees?.map(e => e.id) || [],
                contactIds: item.contacts?.map(c => c.id) || [],
                status: item.status || 'OPEN',
                leadId: item.leadId || leadId,
            });
        } else {
            setFormData(prev => ({ ...prev, leadId }));
        }
    }, [item, leadId]);

    const employeeOptions = useMemo(() => selectData.employees.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName}` })), [selectData.employees]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const todayStr = new Date().toISOString().split('T')[0];
        const newErrors = {};

        if (!formData.assignedToEmployeeId) {
            newErrors.assignedToEmployeeId = "Primary Assignee is required.";
        }

        if (formData.dueDate && formData.dueDate < todayStr) {
            newErrors.dueDate = "Execution date cannot be in the past.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        onSave(formData);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
                <div className="w-8 h-8 border-3 border-[#00A3A6] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-[#00A3A6] tracking-wider uppercase">Initializing Task Details...</p>
            </div>
        );
    }

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
            {/* Header */}
            <header className="p-4 px-6 border-b border-[#D7E3EE] bg-[#F8FAFC] flex-shrink-0 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00A3A6]/10 text-[#00A3A6]">
                        <ClipboardList size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-[#102A43]">{item ? 'Edit Task Protocol' : 'Initiate New Task'}</h3>
                        <p className="text-[10px] text-[#62708A] font-bold uppercase tracking-wider">Lead Lifecycle Management System</p>
                    </div>
                </div>
                <button type="button" onClick={onCancel} className="p-1.5 rounded-full hover:bg-slate-200 text-[#62708A] transition-colors"><X size={18} /></button>
            </header>

            {/* Form Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Core Context */}
                <div className="space-y-4">
                    <FormField label="Subject Classification" required icon={Tag}>
                        <select 
                            name="subject" 
                            value={formData.subject} 
                            onChange={handleChange} 
                            required 
                            className="w-full h-10 px-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all cursor-pointer"
                        >
                            <option value="TASK">General Task</option>
                            <option value="CALL">Strategic Call</option>
                            <option value="EVENT">Site Event</option>
                            <option value="MEETING">Stakeholder Meeting</option>
                            <option value="OTHER">Other Intelligence</option>
                        </select>
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Execution Date" icon={Calendar}>
                            <input 
                                type="date" 
                                name="dueDate" 
                                min={todayStr}
                                value={formData.dueDate} 
                                onChange={handleChange} 
                                className={`w-full h-10 px-3 bg-white border rounded-lg text-xs font-medium text-[#102A43] outline-none transition-all ${errors.dueDate ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6]'}`} 
                            />
                            {errors.dueDate && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.dueDate}</p>}
                        </FormField>
                        <FormField label="Protocol Time" icon={Loader}>
                            <input 
                                type="time" 
                                name="callTime" 
                                value={formData.callTime} 
                                onChange={handleChange} 
                                className="w-full h-10 px-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all" 
                            />
                        </FormField>
                    </div>
                </div>

                {/* Assignments */}
                <div className="space-y-4 pt-4 border-t border-[#D7E3EE]">
                    <FormField label="Primary Assignee" required icon={Users}>
                        <select 
                            name="assignedToEmployeeId" 
                            value={formData.assignedToEmployeeId} 
                            onChange={handleChange} 
                            required 
                            className={`w-full h-10 px-3 bg-white border rounded-lg text-xs font-medium text-[#102A43] outline-none transition-all cursor-pointer ${errors.assignedToEmployeeId ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6]'}`}
                        >
                            <option value="">Select Primary Stakeholder</option>
                            {selectData.employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                        </select>
                        {errors.assignedToEmployeeId && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.assignedToEmployeeId}</p>}
                    </FormField>

                    <FormField label="Collaborators" icon={Users}>
                        <CustomMultiSelect 
                            options={employeeOptions} 
                            value={formData.employeeIds} 
                            onChange={(newVals) => setFormData(prev => ({ ...prev, employeeIds: newVals }))} 
                            placeholder="Search collaborators..." 
                        />
                    </FormField>
                </div>

                {/* Intelligence Links */}
                <div className="space-y-4 pt-4 border-t border-[#D7E3EE]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Operational Status" icon={CheckCircle2}>
                            <select 
                                name="status" 
                                value={formData.status} 
                                onChange={handleChange} 
                                className="w-full h-10 px-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-bold text-[#00A3A6] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all cursor-pointer"
                            >
                                <option value="OPEN">Open Protocol</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Execution Finished</option>
                                <option value="CANCELLED">Aborted</option>
                            </select>
                        </FormField>

                        <FormField label="Strategic Lead" icon={Target}>
                            <select 
                                name="leadId" 
                                value={formData.leadId || ''} 
                                onChange={handleChange} 
                                className="w-full h-10 px-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all cursor-pointer disabled:opacity-50"
                                disabled={!!leadId}
                            >
                                <option value="">Global Assignment</option>
                                {selectData.leads.map(l => <option key={l.id} value={l.id}>{l.firstName} {l.lastName}</option>)}
                            </select>
                        </FormField>
                    </div>

                    <FormField label="Internal Protocol Notes" icon={FileText}>
                        <textarea 
                            name="comments" 
                            value={formData.comments} 
                            onChange={handleChange} 
                            rows="4" 
                            placeholder="Detailed comments on task objectives and expected outcomes..."
                            className="w-full p-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all resize-none"
                        ></textarea>
                    </FormField>
                </div>
            </div>

            {/* Footer */}
            <footer className="p-4 px-6 bg-[#F8FAFC] border-t border-[#D7E3EE] flex justify-end gap-3 shadow-2xs">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-white border border-[#C9D8E5] text-[#62708A] rounded-lg font-bold text-xs hover:bg-slate-100 transition-all" disabled={isSubmitting}>
                    Cancel Task
                </button>
                <button type="submit" className="bg-[#00A3A6] hover:bg-[#0178BC] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50" disabled={isSubmitting}>
                    {isSubmitting ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                    Save Task Protocol
                </button>
            </footer>
        </form>
    );
};

export default CrmTaskForm;