import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, Send, X, Mail, User, FileText, Globe, ArrowRight } from 'lucide-react';

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

const CrmEmailForm = ({ lead, onSave, onCancel, loading: isSubmitting }) => {
    const [formData, setFormData] = useState({
        subject: '',
        body: '',
        ccAddress: '',
        leadId: lead?.id || null,
        sentByEmployeeId: '',
    });
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/employees/all`, { headers: { Authorization: `Bearer ${token}` } });
                setEmployees(res.data || []);
            } catch (error) {
                console.error("Failed to fetch employees", error);
            }
        };
        fetchEmployees();
    }, []);

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.sentByEmployeeId) {
            newErrors.sentByEmployeeId = "Please select sender identity.";
        }

        if (!formData.subject || !formData.subject.trim()) {
            newErrors.subject = "Strategic Subject Line is required.";
        } else if (/^\d+$/.test(formData.subject.trim())) {
            newErrors.subject = "Subject Line cannot be numeric-only. Please enter a valid subject title.";
        }

        if (formData.ccAddress && formData.ccAddress.trim()) {
            const ccVal = formData.ccAddress.trim();
            if (/^\d+$/.test(ccVal)) {
                newErrors.ccAddress = "Carbon Copy (CC) cannot be numeric-only. Enter a valid email address.";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ccVal)) {
                newErrors.ccAddress = "Invalid CC email address format.";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
            {/* Header */}
            <header className="p-4 px-6 border-b border-[#D7E3EE] bg-[#F8FAFC] flex-shrink-0 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00A3A6]/10 text-[#00A3A6]">
                        <Mail size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-[#102A43]">Compose Strategic Outreach</h3>
                        <p className="text-[10px] text-[#62708A] font-bold uppercase tracking-wider">Digital Communication Intelligence</p>
                    </div>
                </div>
                <button type="button" onClick={onCancel} className="p-1.5 rounded-full hover:bg-slate-200 text-[#62708A] transition-colors"><X size={18} /></button>
            </header>

            {/* Form Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Routing Context */}
                <div className="p-3.5 bg-[#F8FAFC] border border-[#D7E3EE] rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-full bg-slate-200 text-[#62708A]">
                            <User size={14} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-[#62708A] uppercase tracking-wider">Primary Recipient</p>
                            <p className="text-xs font-bold text-[#102A43] truncate max-w-[200px]">{lead?.email || 'No recipient email detected'}</p>
                        </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-400 mx-2" />
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-[#62708A] uppercase tracking-wider">Target Entity</p>
                        <p className="text-xs font-bold text-[#00A3A6] truncate max-w-[150px]">{lead?.firstName} {lead?.lastName}</p>
                    </div>
                </div>

                {/* Communication Metadata */}
                <div className="space-y-4">
                    <FormField label="Carbon Copy (CC)" icon={Globe}>
                        <input 
                            type="email" 
                            name="ccAddress" 
                            value={formData.ccAddress} 
                            onChange={handleChange} 
                            placeholder="collaborator@enterprise.com" 
                            className={`w-full h-10 px-3 bg-white border rounded-lg text-xs font-medium text-[#102A43] outline-none transition-all ${errors.ccAddress ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6]'}`} 
                        />
                        {errors.ccAddress && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.ccAddress}</p>}
                    </FormField>

                    <FormField label="Strategic Subject Line" required icon={FileText}>
                        <input 
                            type="text" 
                            name="subject" 
                            value={formData.subject} 
                            onChange={handleChange} 
                            required 
                            placeholder="Ref: Strategic Partnership Discussion..."
                            className={`w-full h-10 px-3 bg-white border rounded-lg text-xs font-bold text-[#102A43] outline-none transition-all ${errors.subject ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6]'}`} 
                        />
                        {errors.subject && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.subject}</p>}
                    </FormField>
                </div>

                {/* Content Area */}
                <FormField label="Intelligence Body" required icon={Mail}>
                    <textarea 
                        name="body" 
                        value={formData.body} 
                        onChange={handleChange} 
                        required 
                        rows="8" 
                        placeholder="Compose your strategic communication here..."
                        className="w-full p-3 bg-white border border-[#C9D8E5] rounded-lg text-xs font-medium text-[#102A43] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6] outline-none transition-all resize-none custom-scrollbar leading-relaxed"
                    ></textarea>
                </FormField>

                {/* Dispatch Context */}
                <div className="pt-4 border-t border-[#D7E3EE]">
                    <FormField label="Dispatch As (Internal Tracker)" required icon={User}>
                        <select 
                            name="sentByEmployeeId" 
                            value={formData.sentByEmployeeId} 
                            onChange={handleChange} 
                            required 
                            className={`w-full h-10 px-3 bg-white border rounded-lg text-xs font-medium text-[#102A43] outline-none transition-all cursor-pointer ${errors.sentByEmployeeId ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5] focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6]'}`} 
                        >
                            <option value="">Verify Sender Identity</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                        </select>
                        {errors.sentByEmployeeId && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.sentByEmployeeId}</p>}
                    </FormField>
                </div>
            </div>

            {/* Footer */}
            <footer className="p-4 px-6 bg-[#F8FAFC] border-t border-[#D7E3EE] flex justify-end gap-3 shadow-2xs">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-white border border-[#C9D8E5] text-[#62708A] rounded-lg font-bold text-xs hover:bg-slate-100 transition-all" disabled={isSubmitting}>
                    Cancel Outreach
                </button>
                <button 
                    type="submit" 
                    className="bg-[#00A3A6] hover:bg-[#0178BC] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50" 
                    disabled={isSubmitting || !lead?.email}
                >
                    {isSubmitting ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                    Send Email Protocol
                </button>
            </footer>
        </form>
    );
};

export default CrmEmailForm;