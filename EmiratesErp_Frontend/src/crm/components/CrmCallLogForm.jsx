import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, Save, X, Phone, Calendar, Clock, User, Users, MessageSquare } from 'lucide-react';

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
    const [errors, setErrors] = useState({});

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
                    employees: employeesRes.data || [],
                    contacts: contactsRes.data?.content || contactsRes.data || [],
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
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.employeeId) {
            newErrors.employeeId = "Primary Caller selection is required.";
        }

        if (!formData.callDate) {
            newErrors.callDate = "Interaction Date is required.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        onSave({ ...formData, leadId });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
                <div className="w-8 h-8 border-3 border-[#00A3A6] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-[#00A3A6] tracking-wider uppercase">Initializing Communication Log...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
            {/* Header */}
            <header className="p-4 px-6 border-b border-[#D7E3EE] bg-[#F8FAFC] flex-shrink-0 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00A3A6]/10 text-[#00A3A6]">
                        <Phone size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-[#102A43]">{item ? 'Edit Interaction Record' : 'Log Strategic Call'}</h3>
                        <p className="text-[10px] text-[#62708A] font-bold uppercase tracking-wider">Communication Registry & History Tracking</p>
                    </div>
                </div>
                <button type="button" onClick={onCancel} className="p-1.5 rounded-full hover:bg-slate-200 text-[#62708A] transition-colors"><X size={18} /></button>
            </header>

            {/* Form Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Temporal Context */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Interaction Date" required icon={Calendar}>
                        <input 
                            type="date" 
                            name="callDate" 
                            value={formData.callDate} 
                            onChange={handleChange} 
                            required 
                            className={`w-full h-10 px-3 bg-white border rounded-lg text-xs font-medium text-[#102A43] outline-none transition-all ${errors.callDate ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6]'}`} 
                        />
                        {errors.callDate && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.callDate}</p>}
                    </FormField>
                    <FormField label="Interaction Time" icon={Clock}>
                        <input 
                            type="time" 
                            name="callTime" 
                            value={formData.callTime} 
                            onChange={handleChange} 
                            className="w-full h-10 px-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all" 
                        />
                    </FormField>
                </div>

                {/* Stakeholder Alignment */}
                <div className="space-y-4 pt-4 border-t border-[#D7E3EE]">
                    <FormField label="Primary Caller (Employee)" required icon={User}>
                        <select 
                            name="employeeId" 
                            value={formData.employeeId} 
                            onChange={handleChange} 
                            required 
                            className={`w-full h-10 px-3 bg-white border rounded-lg text-xs font-medium text-[#102A43] outline-none transition-all cursor-pointer ${errors.employeeId ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6]'}`}
                        >
                            <option value="">Select Internal Stakeholder</option>
                            {selectData.employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                        </select>
                        {errors.employeeId && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.employeeId}</p>}
                    </FormField>

                    <FormField label="Target Contact (Optional)" icon={Users}>
                        <select 
                            name="contactId" 
                            value={formData.contactId} 
                            onChange={handleChange} 
                            className="w-full h-10 px-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all cursor-pointer"
                        >
                            <option value="">Select External Stakeholder</option>
                            {selectData.contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                        </select>
                    </FormField>
                </div>

                {/* Qualitative Feedback */}
                <div className="space-y-4 pt-4 border-t border-[#D7E3EE]">
                    <FormField label="Interaction Qualitative Notes" icon={MessageSquare}>
                        <textarea 
                            name="comments" 
                            value={formData.comments} 
                            onChange={handleChange} 
                            rows="5" 
                            placeholder="Detailed summary of telephonic interaction, key takeaways, and next strategic steps..."
                            className="w-full p-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all resize-none"
                        ></textarea>
                    </FormField>
                </div>
            </div>

            {/* Footer */}
            <footer className="p-4 px-6 bg-[#F8FAFC] border-t border-[#D7E3EE] flex justify-end gap-3 shadow-2xs">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-white border border-[#C9D8E5] text-[#62708A] rounded-lg font-bold text-xs hover:bg-slate-100 transition-all" disabled={isSubmitting}>
                    Cancel Log
                </button>
                <button type="submit" className="bg-[#00A3A6] hover:bg-[#0178BC] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50" disabled={isSubmitting}>
                    {isSubmitting ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                    Save Interaction Log
                </button>
            </footer>
        </form>
    );
};

export default CrmCallLogForm;