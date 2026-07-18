import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { getWhatsAppLogs } from '../api/notificationApi';
import { Badge } from './NotificationShared';

const WhatsAppLogTab = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await getWhatsAppLogs(page, 10);
            setLogs(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
        } catch (error) {
            toast.error("Failed to load WhatsApp logs");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in-up">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="font-bold text-lg text-foreground">WhatsApp Logs</h3>
                    <p className="text-sm text-foreground-muted">Transmission history for WhatsApp messages.</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-theme overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="bg-background-muted text-foreground-muted text-xs uppercase tracking-wider">
                            <th className="th-cell w-16">ID</th>
                            <th className="th-cell">Recipient</th>
                            <th className="th-cell">Template</th>
                            <th className="th-cell">Status</th>
                            <th className="th-cell">Sent At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-background-muted/30 transition-colors">
                                <td className="td-cell text-xs text-foreground-muted">#{log.id}</td>
                                <td className="td-cell text-foreground font-medium">{log.recipient}</td>
                                <td className="td-cell text-foreground-muted text-sm">{log.templateId}</td>
                                <td className="td-cell">
                                    <Badge status={log.status === 'SENT' ? 'success' : log.status === 'FAILED' ? 'error' : 'warning'}>
                                        {log.status}
                                    </Badge>
                                </td>
                                <td className="td-cell text-xs text-foreground-muted">
                                    {log.sentAt ? new Date(log.sentAt).toLocaleString() : 'N/A'}
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && !loading && (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-foreground-muted italic">No logs found.</td>
                            </tr>
                        )}
                        {loading && (
                             <tr>
                                <td colSpan="5" className="p-12 text-center"><Loader2 className="animate-spin inline-block text-primary" /></td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
                {/* Pagination */}
                <div className="p-4 border-t border-border bg-background-muted/30 flex items-center justify-between">
                    <span className="text-xs text-foreground-muted">Page {page + 1} of {totalPages || 1}</span>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 0 || loading}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 rounded-theme border border-border hover:bg-background-muted disabled:opacity-50 transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            disabled={page >= totalPages - 1 || loading}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-theme border border-border hover:bg-background-muted disabled:opacity-50 transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppLogTab;
