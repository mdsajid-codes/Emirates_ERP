import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader, AlertCircle, PlusCircle, Mail, Send, AlertTriangle, CheckCircle, Clock, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const EmailStatusIcon = ({ status }) => {
    switch (status) {
        case 'SENT':
            return (
                <div className="flex items-center gap-1.5 text-success">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Delivered</span>
                </div>
            );
        case 'FAILED':
            return (
                <div className="flex items-center gap-1.5 text-error">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Failed</span>
                </div>
            );
        default:
            return (
                <div className="flex items-center gap-1.5 text-foreground-muted animate-pulse">
                    <Send className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">In Transit</span>
                </div>
            );
    }
};

const EmailItem = ({ email }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative bg-card border border-border p-6 rounded-theme shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all"
    >
        {/* Email Accent Bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-l-theme shadow-[0_0_8px_rgba(99,102,241,0.4)]"></div>
        
        <div className="flex justify-between items-start pl-2">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-600">
                        <Mail size={14} />
                    </div>
                    <h4 className="text-sm font-bold text-foreground truncate uppercase tracking-tight">
                        {email.subject || 'Strategic Outreach Intelligence'}
                    </h4>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] font-bold text-foreground-muted uppercase tracking-[0.1em] mb-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500">Recipient</span>
                    <ArrowRight size={12} className="text-slate-300" />
                    <span className="text-foreground">{email.toAddress}</span>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-theme border border-border/50">
                    <p className="text-xs text-foreground-muted line-clamp-3 leading-relaxed italic whitespace-pre-wrap">
                        {email.body}
                    </p>
                </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 ml-4">
                <EmailStatusIcon status={email.status} />
                <div className="flex items-center gap-1 text-[9px] font-bold text-foreground-muted uppercase tracking-tighter opacity-60">
                    <Clock size={10} />
                    {new Date(email.createdAt).toLocaleString()}
                </div>
            </div>
        </div>
        
        <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between pl-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">
                <div className="p-1 rounded bg-slate-100"><User size={12} className="text-indigo-500" /></div>
                <span>Dispatched By: <span className="text-foreground">{email.sentByEmployeeName || 'Automated Service'}</span></span>
            </div>
            <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">View Full Log</button>
        </div>
    </motion.div>
);

const EmailsTab = ({ leadId, onComposeEmail }) => {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchEmails = useCallback(async () => {
        if (!leadId) return;
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/crm/emails/by-lead/${leadId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setEmails(response.data);
        } catch (err) {
            setError('Failed to fetch communication registry.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [leadId]);

    useEffect(() => {
        fetchEmails();
    }, [fetchEmails]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 animate-pulse">Syncing Communication Log...</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-indigo-500 rounded-full"></div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">Email Intelligence Hub</h3>
                        <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest opacity-60">Historical Digital Outreach Registry</p>
                    </div>
                </div>
                <button 
                    onClick={onComposeEmail} 
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-theme font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                >
                    <PlusCircle size={14} /> Compose Strategic Email
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {emails.length > 0 ? (
                    emails.map(email => (
                        <EmailItem key={email.id} email={email} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-theme bg-slate-50/50 text-foreground-muted group hover:border-indigo-500/30 transition-colors">
                        <div className="p-4 rounded-full bg-background border border-border mb-4 group-hover:scale-110 transition-transform">
                            <Mail size={40} className="opacity-20" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">No Digital Correspondence</h3>
                        <p className="text-xs mt-1 max-w-[200px] text-center opacity-60">The digital communication hub is currently clear. Initiate outreach to begin tracking.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailsTab;