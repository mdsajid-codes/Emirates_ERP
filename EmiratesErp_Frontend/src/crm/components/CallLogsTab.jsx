import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader, AlertCircle, PlusCircle, Edit, Trash2, Calendar, User, Phone, Clock, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CallLogItem = ({ log, onEdit, onDelete }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative bg-card border border-border p-5 rounded-theme shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all"
    >
        {/* Call Accent Bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-theme shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
        
        <div className="flex justify-between items-start pl-2">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded bg-blue-500/10 text-blue-500">
                        <Phone size={14} />
                    </div>
                    <h4 className="text-sm font-bold text-foreground truncate uppercase tracking-tight">
                        Interaction with {log.contactName || log.leadName}
                    </h4>
                </div>
                <div className="flex items-start gap-2 text-xs text-foreground-muted leading-relaxed italic">
                    <MessageSquare size={14} className="mt-0.5 flex-shrink-0 opacity-40" />
                    <p className="line-clamp-2">{log.comments || 'Direct telephonic interaction established to discuss strategic lead objectives.'}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                <button onClick={() => onEdit(log)} className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-full transition-all">
                    <Edit size={16} />
                </button>
                <button onClick={() => onDelete(log.id)} className="p-2 text-foreground-muted hover:text-error hover:bg-error/10 rounded-full transition-all">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
        
        <div className="mt-5 pt-4 border-t border-border/50 flex flex-wrap items-center gap-6 pl-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">
                <div className="p-1 rounded bg-slate-100"><Calendar size={12} className="text-blue-500" /></div>
                <span>Timeline: <span className="text-foreground">{log.callDate || 'N/A'} at {log.callTime || 'N/A'}</span></span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">
                <div className="p-1 rounded bg-slate-100"><User size={12} className="text-purple-500" /></div>
                <span>Initiated By: <span className="text-foreground">{log.employeeName || 'System'}</span></span>
            </div>
        </div>
    </motion.div>
);

const CallLogsTab = ({ leadId, onAddCallLog, onEditCallLog }) => {
    const [callLogs, setCallLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchCallLogs = useCallback(async () => {
        if (!leadId) return;
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/crm/call-logs/by-lead/${leadId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setCallLogs(response.data);
        } catch (err) {
            setError('Failed to fetch call log registry.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [leadId]);

    useEffect(() => {
        fetchCallLogs();
    }, [fetchCallLogs]);

    const handleDelete = async (logId) => {
        if (window.confirm('Delete this interaction record? This action is irreversible.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/crm/call-logs/${logId}`, { headers: { "Authorization": `Bearer ${token}` } });
                fetchCallLogs();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to purge call log.'}`);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500 animate-pulse">Syncing Communication Log...</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-blue-500 rounded-full"></div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">Communication Logs</h3>
                        <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest opacity-60">Historical Telephonic Interaction Registry</p>
                    </div>
                </div>
                <button 
                    onClick={onAddCallLog} 
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-theme font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                >
                    <PlusCircle size={14} /> Log New Interaction
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {callLogs.length > 0 ? (
                    callLogs.map(log => (
                        <CallLogItem key={log.id} log={log} onEdit={onEditCallLog} onDelete={handleDelete} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-theme bg-slate-50/50 text-foreground-muted group hover:border-blue-500/30 transition-colors">
                        <div className="p-4 rounded-full bg-background border border-border mb-4 group-hover:scale-110 transition-transform">
                            <Phone size={40} className="opacity-20" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">No Interactions Recorded</h3>
                        <p className="text-xs mt-1 max-w-[200px] text-center opacity-60">The interaction registry is currently clear. Log a call to begin historical tracking.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CallLogsTab;