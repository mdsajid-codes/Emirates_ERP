import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, Send, X, Mail, User, FileText, Globe, ArrowRight } from 'lucide-react';
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
                setEmployees(res.data);
            } catch (error) {
                console.error("Failed to fetch employees", error);
            }
        };
        fetchEmployees();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.sentByEmployeeId) {
            alert("Please select the strategic sender.");
            return;
        }
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-card animate-in slide-in-from-right duration-500">
            <header className="p-6 border-b border-border bg-white flex-shrink-0 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-theme bg-primary/10 text-primary">
                        <Mail size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground tracking-tight">Compose Strategic Outreach</h3>
                        <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest opacity-60">Digital Communication Intelligence</p>
                    </div>
                </div>
                <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-slate-100 text-foreground-muted transition-colors"><X size={20} /></button>
            </header>

            <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
                {/* Routing Context */}
                <div className="p-4 bg-white border border-border rounded-theme shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-slate-100 text-slate-500">
                            <User size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-foreground-muted uppercase tracking-widest">Primary Recipient</p>
                            <p className="text-sm font-bold text-foreground truncate max-w-[200px]">{lead?.email || 'No recipient email detected'}</p>
                        </div>
                    </div>
                    <ArrowRight size={20} className="text-slate-300 mx-4" />
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-foreground-muted uppercase tracking-widest">Target Entity</p>
                        <p className="text-sm font-bold text-primary truncate max-w-[150px]">{lead?.firstName} {lead?.lastName}</p>
                    </div>
                </div>

                {/* Communication Metadata */}
                <div className="grid grid-cols-1 gap-6">
                    <FormField label="Carbon Copy (CC)" icon={Globe}>
                        <input 
                            type="email" 
                            name="ccAddress" 
                            value={formData.ccAddress} 
                            onChange={handleChange} 
                            placeholder="collaborator@enterprise.com" 
                            className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" 
                        />
                    </FormField>

                    <FormField label="Strategic Subject Line" required icon={FileText}>
                        <input 
                            type="text" 
                            name="subject" 
                            value={formData.subject} 
                            onChange={handleChange} 
                            required 
                            placeholder="Ref: Strategic Partnership Discussion..."
                            className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" 
                        />
                    </FormField>
                </div>

                {/* Content Area */}
                <FormField label="Intelligence Body" required icon={Mail}>
                    <textarea 
                        name="body" 
                        value={formData.body} 
                        onChange={handleChange} 
                        required 
                        rows="12" 
                        placeholder="Compose your strategic communication here..."
                        className="w-full p-6 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all resize-none custom-scrollbar leading-relaxed"
                    ></textarea>
                </FormField>

                {/* Dispatch Context */}
                <div className="pt-4 border-t border-border/50">
                    <FormField label="Dispatch As (Internal Tracker)" required icon={User}>
                        <select 
                            name="sentByEmployeeId" 
                            value={formData.sentByEmployeeId} 
                            onChange={handleChange} 
                            required 
                            className="w-full h-11 px-4 bg-white border border-border rounded-theme text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Verify Sender Identity</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                        </select>
                    </FormField>
                </div>
            </div>

            <footer className="p-6 bg-white border-t border-border flex justify-end gap-3 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
                <button type="button" onClick={onCancel} className="px-6 py-2.5 bg-white border border-border text-foreground-muted rounded-theme font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all" disabled={isSubmitting}>Abort Dispatch</button>
                <button 
                    type="submit" 
                    className="bg-primary text-primary-foreground px-8 py-2.5 rounded-theme font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50" 
                    disabled={isSubmitting || !lead?.email}
                >
                    {isSubmitting ? <Loader className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                    Confirm & Send Strategic Email
                </button>
            </footer>
        </form>
    );
};

export default CrmEmailForm;