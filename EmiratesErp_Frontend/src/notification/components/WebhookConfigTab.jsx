import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Globe, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
    getWebhooks, 
    createWebhook, 
    updateWebhook, 
    deleteWebhook 
} from '../api/notificationApi';
import { Input, Badge } from './NotificationShared';

const WebhookConfigTab = () => {
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState(null);

    useEffect(() => {
        fetchWebhooks();
    }, []);

    const fetchWebhooks = async () => {
        try {
            const res = await getWebhooks();
            setWebhooks(res.data);
        } catch (error) {
            toast.error("Failed to load webhooks");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this webhook?")) return;
        try {
            await deleteWebhook(id);
            toast.success("Webhook deleted");
            fetchWebhooks();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleSaveWebhook = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.active = formData.get('active') === 'on';
        if (editingWebhook?.id) data.id = editingWebhook.id;

        try {
            // The backend uses a single POST for both create/update in WebhookNotificationController
            await createWebhook(data);
            toast.success("Webhook saved");
            setIsModalOpen(false);
            fetchWebhooks();
        } catch (error) {
            toast.error("Save failed");
        }
    };

    return (
        <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg text-foreground">Webhook Endpoints</h3>
                    <p className="text-sm text-foreground-muted">Register URLs to receive system notifications.</p>
                </div>
                <button 
                    onClick={() => { setEditingWebhook(null); setIsModalOpen(true); }}
                    className="btn-primary flex items-center gap-2 px-4 py-2"
                >
                    <Plus size={18} />
                    Add Webhook
                </button>
            </div>

            <div className="bg-card border border-border rounded-theme overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="bg-background-muted text-foreground-muted text-xs uppercase tracking-wider">
                            <th className="th-cell">Name</th>
                            <th className="th-cell">URL</th>
                            <th className="th-cell">Method</th>
                            <th className="th-cell">Status</th>
                            <th className="th-cell text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {webhooks.map(wh => (
                            <tr key={wh.id} className="hover:bg-background-muted/30 transition-colors">
                                <td className="td-cell font-medium text-foreground">{wh.name}</td>
                                <td className="td-cell text-foreground-muted text-sm truncate max-w-[300px]">
                                    {wh.url}
                                </td>
                                <td className="td-cell">
                                    <span className="px-2 py-1 bg-background border border-border rounded text-[10px] font-bold text-primary">
                                        {wh.httpMethod || 'POST'}
                                    </span>
                                </td>
                                <td className="td-cell">
                                    <Badge status={wh.active ? 'success' : 'neutral'}>
                                        {wh.active ? 'ACTIVE' : 'INACTIVE'}
                                    </Badge>
                                </td>
                                <td className="td-cell text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => { setEditingWebhook(wh); setIsModalOpen(true); }}
                                            className="p-2 rounded-theme hover:bg-primary/10 text-primary transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(wh.id)}
                                            className="p-2 rounded-theme hover:bg-error/10 text-error transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {webhooks.length === 0 && !loading && (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-foreground-muted italic">No webhooks registered.</td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan="5" className="p-12 text-center"><Loader2 className="animate-spin inline-block text-primary" /></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Webhook Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card w-full max-w-2xl rounded-theme shadow-2xl border border-border relative flex flex-col max-h-[90vh]"
                        >
                            <form onSubmit={handleSaveWebhook} className="flex flex-col h-full">
                                <div className="p-6 border-b border-border bg-background-muted flex justify-between items-center shrink-0">
                                    <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                                        <Globe size={20} className="text-primary" />
                                        {editingWebhook ? 'Edit Webhook' : 'New Webhook Endpoint'}
                                    </h3>
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 hover:bg-background rounded-full transition-colors text-foreground-muted hover:text-foreground"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-6 space-y-5 overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <Input label="Friendly Name" name="name" defaultValue={editingWebhook?.name} placeholder="e.g. My Website Hook" required />
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">HTTP Method</label>
                                            <select 
                                                name="httpMethod"
                                                defaultValue={editingWebhook?.httpMethod || 'POST'}
                                                className="w-full bg-background border border-border rounded-theme py-2 px-4 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-[42px]"
                                            >
                                                <option value="POST">POST</option>
                                                <option value="GET">GET</option>
                                                <option value="PUT">PUT</option>
                                            </select>
                                        </div>
                                    </div>
                                    <Input label="Target URL" name="url" defaultValue={editingWebhook?.url} placeholder="https://example.com/webhook" required />
                                    <Input label="Signing Secret (Optional)" name="secret" defaultValue={editingWebhook?.secret} placeholder="Used to verify request authenticity" type="password" />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <Input label="Associated Template ID" name="templateId" defaultValue={editingWebhook?.templateId} placeholder="e.g. sales_alert" />
                                        <div className="flex items-center gap-3 pt-6 md:pt-8">
                                            <input type="checkbox" name="active" defaultChecked={editingWebhook ? editingWebhook.active : true} className="w-5 h-5 accent-primary rounded cursor-pointer" />
                                            <span className="text-sm font-bold text-foreground">Active Endpoint</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 pt-2">
                                        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Custom Headers (JSON)</label>
                                        <textarea 
                                            name="customHeaders"
                                            defaultValue={editingWebhook?.customHeaders}
                                            rows={4}
                                            className="w-full bg-background border border-border rounded-theme px-4 py-3 text-foreground font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                                            placeholder='{ "X-Custom-Header": "Value" }'
                                        />
                                    </div>
                                </div>
                                <div className="p-6 border-t border-border flex justify-end gap-3 shrink-0">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-theme border border-border text-foreground font-bold hover:bg-background-muted transition-all">Cancel</button>
                                    <button type="submit" className="btn-primary px-8 py-2">Save Webhook</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WebhookConfigTab;
