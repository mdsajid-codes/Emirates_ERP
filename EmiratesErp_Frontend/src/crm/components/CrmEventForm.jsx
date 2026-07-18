import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, Save, X, Calendar, Clock, Users, MapPin, Tag, AlertCircle, FileText, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const FormField = ({ label, children, required, icon: Icon }) => (
    <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-[10px] font-bold text-foreground-muted uppercase tracking-widest pl-1">
            {Icon && <Icon size={12} className="text-accent/70" />}
            {label} {required && <span className="text-error">*</span>}
        </label>
        <div className="relative group">
            {children}
            <div className="absolute inset-0 rounded-theme border border-accent/0 group-focus-within:border-accent/30 pointer-events-none transition-all"></div>
        </div>
    </div>
);

const CrmEventForm = ({ item, onSave, onCancel, loading: isSubmitting, leadId }) => {
    const [formData, setFormData] = useState({
        subject: 'MEETING', description: '', sameStartEnd: false, date: '', fromTime: '', toTime: '',
        primaryContactId: '', employeeIds: [], contactIds: [],
        status: 'OPEN', priority: 'NORMAL', meetingType: 'ONLINE', meetingWith: '', leadId: leadId || null
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
                    axios.get(`${API_URL}/crm/contacts`, { headers }),
                ]);
                setSelectData({
                    employees: employeesRes.data,
                    contacts: contactsRes.data.content || contactsRes.data,
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
                subject: item.subject || 'MEETING',
                description: item.description || '',
                sameStartEnd: item.sameStartEnd || false,
                date: item.date || '',
                fromTime: item.fromTime || '',
                toTime: item.toTime || '',
                primaryContactId: item.primaryContactId || '',
                employeeIds: item.employeeIds || [],
                contactIds: item.contactIds || [],
                status: item.status || 'OPEN',
                priority: item.priority || 'NORMAL',
                meetingType: item.meetingType || 'ONLINE',
                meetingWith: item.meetingWith || '',
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

    const handleMultiSelectChange = (e) => {
        const { name, options } = e.target;
        const value = Array.from(options).filter(option => option.selected).map(option => option.value);
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, leadId });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent animate-pulse">Initializing Event Matrix...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-card animate-in slide-in-from-right duration-500">
            <header className="p-6 border-b border-border bg-white flex-shrink-0 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-theme bg-accent/10 text-accent">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground tracking-tight">{item ? 'Edit Engagement Protocol' : 'Schedule New Event'}</h3>
                        <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest opacity-60">Strategic Calendar & Appointment Tracking</p>
                    </div>
                </div>
                <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-slate-100 text-foreground-muted transition-colors"><X size={20} /></button>
            </header>

            <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
                {/* Core Parameters */}
                <div className="grid grid-cols-1 gap-6">
                    <FormField label="Subject Classification" required icon={Tag}>
                        <select 
                            name="subject" 
                            value={formData.subject} 
                            onChange={handleChange} 
                            required 
                            className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent/50 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="MEETING">Strategic Meeting</option>
                            <option value="CALL">Conference Call</option>
                            <option value="EVENT">Site Visit / Event</option>
                            <option value="TASK">Task Review</option>
                            <option value="OTHER">Other Engagement</option>
                        </select>
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Execution Date" required icon={Calendar}>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent/50 outline-none transition-all" />
                        </FormField>
                        <FormField label="Priority Level" icon={AlertCircle}>
                            <select name="priority" value={formData.priority} onChange={handleChange} className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-bold text-accent focus:ring-2 focus:ring-accent/20 focus:border-accent/50 outline-none transition-all appearance-none cursor-pointer">
                                <option value="NORMAL">Normal Priority</option>
                                <option value="LOW">Low Latency</option>
                                <option value="HIGH">Critical / High</option>
                            </select>
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Start Time" required icon={Clock}>
                            <input type="time" name="fromTime" value={formData.fromTime} onChange={handleChange} required className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent/50 outline-none transition-all" />
                        </FormField>
                        <FormField label="End Time" icon={Clock}>
                            <input type="time" name="toTime" value={formData.toTime} onChange={handleChange} className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent/50 outline-none transition-all" />
                        </FormField>
                    </div>
                </div>

                {/* Logistics & Participation */}
                <div className="space-y-6 pt-4 border-t border-border/50">
                    {formData.subject === 'MEETING' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Meeting Modality" icon={Globe}>
                                <select name="meetingType" value={formData.meetingType} onChange={handleChange} className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent/50 outline-none transition-all appearance-none cursor-pointer">
                                    <option value="ONLINE">Digital / Online</option>
                                    <option value="ONSITE">Physical / On-site</option>
                                </select>
                            </FormField>
                            <FormField label="Modality Target / Link" icon={MapPin}>
                                <input name="meetingWith" value={formData.meetingWith} onChange={handleChange} className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent/50 outline-none transition-all" placeholder="Meeting Link or Address" />
                            </FormField>
                        </div>
                    )}

                    <FormField label="Primary Engagement Contact" icon={Users}>
                        <select name="primaryContactId" value={formData.primaryContactId} onChange={handleChange} className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent/50 outline-none transition-all appearance-none cursor-pointer">
                            <option value="">Select Stakeholder</option>
                            {selectData.contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                        </select>
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Internal Delegates" icon={Users}>
                            <select name="employeeIds" value={formData.employeeIds} onChange={handleMultiSelectChange} multiple className="w-full h-32 p-2 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent/50 outline-none transition-all custom-scrollbar">
                                {selectData.employees.map(e => <option key={e.id} value={e.id} className="p-2 rounded hover:bg-accent/10 transition-colors">{e.firstName} {e.lastName}</option>)}
                            </select>
                        </FormField>
                        <FormField label="External Delegates" icon={Users}>
                            <select name="contactIds" value={formData.contactIds} onChange={handleMultiSelectChange} multiple className="w-full h-32 p-2 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent/50 outline-none transition-all custom-scrollbar">
                                {selectData.contacts.map(c => <option key={c.id} value={c.id} className="p-2 rounded hover:bg-accent/10 transition-colors">{c.firstName} {c.lastName}</option>)}
                            </select>
                        </FormField>
                    </div>
                </div>

                {/* Event Intelligence */}
                <div className="space-y-6 pt-4 border-t border-border/50">
                    <FormField label="Strategic Event Brief" icon={FileText}>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            rows="4" 
                            placeholder="Detailed objectives and strategic context for this engagement..."
                            className="w-full p-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent/50 outline-none transition-all resize-none"
                        ></textarea>
                    </FormField>
                </div>
            </div>

            <footer className="p-6 bg-white border-t border-border flex justify-end gap-3 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
                <button type="button" onClick={onCancel} className="px-6 py-2.5 bg-white border border-border text-foreground-muted rounded-theme font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all" disabled={isSubmitting}>Cancel Protocol</button>
                <button type="submit" className="bg-primary text-primary-foreground px-8 py-2.5 rounded-theme font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all" disabled={isSubmitting}>
                    {isSubmitting ? <Loader className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                    Save Event Protocol
                </button>
            </footer>
        </form>
    );
};

export default CrmEventForm;