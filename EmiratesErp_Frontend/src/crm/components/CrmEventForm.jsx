import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, Save, X, Calendar, Clock, Users, MapPin, Tag, AlertCircle, FileText, Globe } from 'lucide-react';

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
                    employees: employeesRes.data || [],
                    contacts: contactsRes.data.content || contactsRes.data || [],
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
            <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
                <div className="w-8 h-8 border-3 border-[#00A3A6] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-[#00A3A6] tracking-wider uppercase">Loading Protocol Details...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
            {/* Header */}
            <header className="p-4 px-6 border-b border-[#D7E3EE] bg-[#F8FAFC] flex-shrink-0 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00A3A6]/10 text-[#00A3A6]">
                        <Calendar size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-[#102A43]">{item ? 'Edit Engagement Protocol' : 'Schedule New Event'}</h3>
                        <p className="text-[10px] text-[#62708A] font-bold uppercase tracking-wider">Strategic Calendar & Appointment Tracking</p>
                    </div>
                </div>
                <button type="button" onClick={onCancel} className="p-1.5 rounded-full hover:bg-slate-200 text-[#62708A] transition-colors"><X size={18} /></button>
            </header>

            {/* Form Content */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Core Parameters */}
                <div className="space-y-4">
                    <FormField label="Subject Classification" required icon={Tag}>
                        <select 
                            name="subject" 
                            value={formData.subject} 
                            onChange={handleChange} 
                            required 
                            className="w-full h-10 px-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all cursor-pointer"
                        >
                            <option value="MEETING">Strategic Meeting</option>
                            <option value="CALL">Conference Call</option>
                            <option value="EVENT">Site Visit / Event</option>
                            <option value="TASK">Task Review</option>
                            <option value="OTHER">Other Engagement</option>
                        </select>
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Execution Date" required icon={Calendar}>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full h-10 px-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all" />
                        </FormField>
                        <FormField label="Priority Level" icon={AlertCircle}>
                            <select name="priority" value={formData.priority} onChange={handleChange} className="w-full h-10 px-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-bold text-[#00A3A6] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all cursor-pointer">
                                <option value="NORMAL">Normal Priority</option>
                                <option value="LOW">Low Latency</option>
                                <option value="HIGH">Critical / High</option>
                            </select>
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Start Time" required icon={Clock}>
                            <input type="time" name="fromTime" value={formData.fromTime} onChange={handleChange} required className="w-full h-10 px-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all" />
                        </FormField>
                        <FormField label="End Time" icon={Clock}>
                            <input type="time" name="toTime" value={formData.toTime} onChange={handleChange} className="w-full h-10 px-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all" />
                        </FormField>
                    </div>
                </div>

                {/* Logistics & Participation */}
                <div className="space-y-4 pt-4 border-t border-[#D7E3EE]">
                    {formData.subject === 'MEETING' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Meeting Modality" icon={Globe}>
                                <select name="meetingType" value={formData.meetingType} onChange={handleChange} className="w-full h-10 px-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all cursor-pointer">
                                    <option value="ONLINE">Digital / Online</option>
                                    <option value="ONSITE">Physical / On-site</option>
                                </select>
                            </FormField>
                            <FormField label="Modality Target / Link" icon={MapPin}>
                                <input name="meetingWith" value={formData.meetingWith} onChange={handleChange} className="w-full h-10 px-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all" placeholder="Meeting Link or Address" />
                            </FormField>
                        </div>
                    )}

                    <FormField label="Primary Engagement Contact" icon={Users}>
                        <select name="primaryContactId" value={formData.primaryContactId} onChange={handleChange} className="w-full h-10 px-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all cursor-pointer">
                            <option value="">Select Stakeholder</option>
                            {selectData.contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                        </select>
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Internal Delegates" icon={Users}>
                            <select name="employeeIds" value={formData.employeeIds} onChange={handleMultiSelectChange} multiple className="w-full h-28 p-2 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all custom-scrollbar">
                                {selectData.employees.map(e => <option key={e.id} value={e.id} className="p-1.5 rounded hover:bg-[#00A3A6]/10 transition-colors">{e.firstName} {e.lastName}</option>)}
                            </select>
                        </FormField>
                        <FormField label="External Delegates" icon={Users}>
                            <select name="contactIds" value={formData.contactIds} onChange={handleMultiSelectChange} multiple className="w-full h-28 p-2 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all custom-scrollbar">
                                {selectData.contacts.map(c => <option key={c.id} value={c.id} className="p-1.5 rounded hover:bg-[#00A3A6]/10 transition-colors">{c.firstName} {c.lastName}</option>)}
                            </select>
                        </FormField>
                    </div>
                </div>

                {/* Event Intelligence */}
                <div className="space-y-4 pt-4 border-t border-[#D7E3EE]">
                    <FormField label="Strategic Event Brief" icon={FileText}>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            rows="3" 
                            placeholder="Detailed objectives and strategic context for this engagement..."
                            className="w-full p-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all resize-none"
                        ></textarea>
                    </FormField>
                </div>
            </div>

            {/* Footer */}
            <footer className="p-4 px-6 bg-[#F8FAFC] border-t border-[#D7E3EE] flex justify-end gap-3 shadow-2xs">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-white border border-[#C9D8E5] text-[#62708A] rounded-lg font-bold text-xs hover:bg-slate-100 transition-all" disabled={isSubmitting}>
                    Cancel Protocol
                </button>
                <button type="submit" className="bg-[#00A3A6] hover:bg-[#0178BC] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50" disabled={isSubmitting}>
                    {isSubmitting ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                    Save Event Protocol
                </button>
            </footer>
        </form>
    );
};

export default CrmEventForm;