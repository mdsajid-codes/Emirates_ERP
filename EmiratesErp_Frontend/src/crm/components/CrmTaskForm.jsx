import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, Save, X, ClipboardList, Calendar, Users, FileText, CheckCircle2, Tag, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const FormField = ({ label, children, required, icon: Icon }) => (
    <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-[10px] font-bold text-foreground-muted uppercase tracking-widest pl-1">
            {Icon && <Icon size={12} className="text-primary/70" />}
            {label} {required && <span className="text-error">*</span>}
        </label>
        <div className="relative group">
            {children}
            <div className="absolute inset-0 rounded-theme border border-primary/0 group-focus-within:border-primary/30 pointer-events-none transition-all"></div>
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
                    employees: employeesRes.data,
                    contacts: contactsRes.data.content || contactsRes.data,
                    leads: leadsRes.data.content || leadsRes.data || [],
                });
            } catch (error) {
                console.error("Failed to fetch form select data", error);
                alert("Failed to load required data for the form.");
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (e) => {
        const { name, options } = e.target;
        const value = Array.from(options).filter(option => option.selected).map(option => option.value);
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse">Initializing Protocol...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-card animate-in slide-in-from-right duration-500">
            <header className="p-6 border-b border-border bg-white flex-shrink-0 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-theme bg-primary/10 text-primary">
                        <ClipboardList size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground tracking-tight">{item ? 'Edit Tasking Protocol' : 'Initiate New Task'}</h3>
                        <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest opacity-60">Lead Lifecycle Management System</p>
                    </div>
                </div>
                <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-slate-100 text-foreground-muted transition-colors"><X size={20} /></button>
            </header>

            <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
                {/* Core Context */}
                <div className="grid grid-cols-1 gap-6">
                    <FormField label="Subject Class" required icon={Tag}>
                        <select 
                            name="subject" 
                            value={formData.subject} 
                            onChange={handleChange} 
                            required 
                            className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="TASK">General Task</option>
                            <option value="CALL">Strategic Call</option>
                            <option value="EVENT">Site Event</option>
                            <option value="MEETING">Stakeholder Meeting</option>
                            <option value="OTHER">Other Intelligence</option>
                        </select>
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Execution Date" icon={Calendar}>
                            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
                        </FormField>
                        <FormField label="Protocol Time" icon={Loader}>
                            <input type="time" name="callTime" value={formData.callTime} onChange={handleChange} className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
                        </FormField>
                    </div>
                </div>

                {/* Assignments */}
                <div className="space-y-6 pt-4 border-t border-border/50">
                    <FormField label="Primary Assignee" required icon={Users}>
                        <select name="assignedToEmployeeId" value={formData.assignedToEmployeeId} onChange={handleChange} required className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer">
                            <option value="">Select Primary Stakeholder</option>
                            {selectData.employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                        </select>
                    </FormField>

                    <FormField label="Collaborators" icon={Users}>
                        <select name="employeeIds" value={formData.employeeIds} onChange={handleMultiSelectChange} multiple className="w-full h-32 p-2 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all custom-scrollbar">
                            {selectData.employees.map(e => <option key={e.id} value={e.id} className="p-2 rounded hover:bg-primary/10 transition-colors">{e.firstName} {e.lastName}</option>)}
                        </select>
                    </FormField>
                </div>

                {/* Intelligence Links */}
                <div className="space-y-6 pt-4 border-t border-border/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Operational Status" icon={CheckCircle2}>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer">
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
                                className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
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
                            className="w-full p-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all resize-none"
                        ></textarea>
                    </FormField>
                </div>
            </div>

            <footer className="p-6 bg-white border-t border-border flex justify-end gap-3 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
                <button type="button" onClick={onCancel} className="px-6 py-2.5 bg-white border border-border text-foreground-muted rounded-theme font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all" disabled={isSubmitting}>Abort Changes</button>
                <button type="submit" className="bg-primary text-primary-foreground px-8 py-2.5 rounded-theme font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all" disabled={isSubmitting}>
                    {isSubmitting ? <Loader className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                    Save Protocol
                </button>
            </footer>
        </form>
    );
};

export default CrmTaskForm;