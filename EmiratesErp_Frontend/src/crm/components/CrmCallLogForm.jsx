import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, Save, X, Phone, Calendar, Clock, User, Users, FileText, MessageSquare } from 'lucide-react';
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

const CrmCallLogForm = ({ item, onSave, onCancel, loading: isSubmitting, leadId }) => {
    const [formData, setFormData] = useState({
        comments: '',
        callDate: new Date().toISOString().split('T')[0],
        callTime: new Date().toTimeString().slice(0, 5),
        remindMeBefore: false,
        reminderTime: '',
        employeeId: '',
        contactId: '',
        leadId: leadId || null
    });

    const [selectData, setSelectData] = useState({ employees: [], contacts: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };
                const [employeesRes, contactsRes] = await Promise.all([
                    axios.get(`${API_URL}/employees/all`, { headers }),
                    axios.get(`${API_URL}/contacts?size=200`, { headers }),
                ]);
                setSelectData({
                    employees: employeesRes.data,
                    contacts: contactsRes.data.content || contactsRes.data,
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
                comments: item.comments || '',
                callDate: item.callDate || new Date().toISOString().split('T')[0],
                callTime: item.callTime || new Date().toTimeString().slice(0, 5),
                remindMeBefore: item.remindMeBefore || false,
                reminderTime: item.reminderTime || '',
                employeeId: item.employeeId || '',
                contactId: item.contactId || '',
                leadId: item.leadId || leadId,
            });
        } else {
            setFormData(prev => ({ ...prev, leadId }));
        }
    }, [item, leadId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, leadId });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse">Initializing Communication Matrix...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-card animate-in slide-in-from-right duration-500">
            <header className="p-6 border-b border-border bg-white flex-shrink-0 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-theme bg-primary/10 text-primary">
                        <Phone size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground tracking-tight">{item ? 'Edit Interaction Record' : 'Log Strategic Call'}</h3>
                        <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest opacity-60">Communication Registry & History Tracking</p>
                    </div>
                </div>
                <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-slate-100 text-foreground-muted transition-colors"><X size={20} /></button>
            </header>

            <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
                {/* Temporal Context */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Interaction Date" required icon={Calendar}>
                        <input type="date" name="callDate" value={formData.callDate} onChange={handleChange} required className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
                    </FormField>
                    <FormField label="Interaction Time" icon={Clock}>
                        <input type="time" name="callTime" value={formData.callTime} onChange={handleChange} className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
                    </FormField>
                </div>

                {/* Stakeholder Alignment */}
                <div className="space-y-6 pt-4 border-t border-border/50">
                    <FormField label="Primary Caller (Employee)" required icon={User}>
                        <select name="employeeId" value={formData.employeeId} onChange={handleChange} required className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer">
                            <option value="">Select Internal Stakeholder</option>
                            {selectData.employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                        </select>
                    </FormField>

                    <FormField label="Target Contact (Optional)" icon={Users}>
                        <select name="contactId" value={formData.contactId} onChange={handleChange} className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer">
                            <option value="">Select External Stakeholder</option>
                            {selectData.contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                        </select>
                    </FormField>
                </div>

                {/* Qualitative Feedback */}
                <div className="space-y-6 pt-4 border-t border-border/50">
                    <FormField label="Interaction Qualitative Notes" icon={MessageSquare}>
                        <textarea 
                            name="comments" 
                            value={formData.comments} 
                            onChange={handleChange} 
                            rows="5" 
                            placeholder="Detailed summary of telephonic interaction, key takeaways, and next strategic steps..."
                            className="w-full p-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all resize-none"
                        ></textarea>
                    </FormField>
                </div>
            </div>

            <footer className="p-6 bg-white border-t border-border flex justify-end gap-3 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
                <button type="button" onClick={onCancel} className="px-6 py-2.5 bg-white border border-border text-foreground-muted rounded-theme font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all" disabled={isSubmitting}>Abort Logging</button>
                <button type="submit" className="bg-primary text-primary-foreground px-8 py-2.5 rounded-theme font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all" disabled={isSubmitting}>
                    {isSubmitting ? <Loader className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                    Confirm Interaction Log
                </button>
            </footer>
        </form>
    );
};

export default CrmCallLogForm;