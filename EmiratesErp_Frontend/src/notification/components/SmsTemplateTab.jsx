import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
    getSmsTemplates, 
    createSmsTemplate, 
    updateSmsTemplate, 
    deleteSmsTemplate 
} from '../api/notificationApi';
import { Input, Badge } from './NotificationShared';

const SmsTemplateTab = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await getSmsTemplates();
            setTemplates(res.data);
        } catch (error) {
            toast.error("Failed to load SMS templates");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            await deleteSmsTemplate(id);
            toast.success("Template deleted");
            fetchTemplates();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleSaveTemplate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.active = formData.get('active') === 'on';

        try {
            if (editingTemplate?.id) {
                await updateSmsTemplate(editingTemplate.id, data);
            } else {
                await createSmsTemplate(data);
            }
            toast.success("Template saved");
            setIsModalOpen(false);
            fetchTemplates();
        } catch (error) {
            toast.error("Save failed");
        }
    };

    return (
        <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg text-foreground">SMS Templates</h3>
                    <p className="text-sm text-foreground-muted">Manage your short message service templates.</p>
                </div>
                <button 
                    onClick={() => { setEditingTemplate(null); setIsModalOpen(true); }}
                    className="btn-primary flex items-center gap-2 px-4 py-2"
                >
                    <Plus size={18} />
                    New Template
                </button>
            </div>

            <div className="bg-card border border-border rounded-theme overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="bg-background-muted text-foreground-muted text-xs uppercase tracking-wider">
                            <th className="th-cell">Template ID</th>
                            <th className="th-cell">Name</th>
                            <th className="th-cell">Message Preview</th>
                            <th className="th-cell">Status</th>
                            <th className="th-cell text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {templates.map(tpl => (
                            <tr key={tpl.id} className="hover:bg-background-muted/30 transition-colors">
                                <td className="td-cell font-mono text-xs text-primary font-bold">{tpl.templateId}</td>
                                <td className="td-cell font-medium text-foreground">{tpl.name}</td>
                                <td className="td-cell text-foreground-muted text-sm truncate max-w-[300px]">
                                    {tpl.body}
                                </td>
                                <td className="td-cell">
                                    <Badge status={tpl.active ? 'success' : 'neutral'}>
                                        {tpl.active ? 'ACTIVE' : 'INACTIVE'}
                                    </Badge>
                                </td>
                                <td className="td-cell text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => { setEditingTemplate(tpl); setIsModalOpen(true); }}
                                            className="p-2 rounded-theme hover:bg-primary/10 text-primary transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(tpl.id)}
                                            className="p-2 rounded-theme hover:bg-error/10 text-error transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {templates.length === 0 && !loading && (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-foreground-muted italic">No templates found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Template Modal */}
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
                            className="bg-card w-full max-w-2xl rounded-theme shadow-2xl border border-border relative overflow-hidden"
                        >
                            <form onSubmit={handleSaveTemplate}>
                                <div className="p-6 border-b border-border bg-background-muted">
                                    <h3 className="font-bold text-xl text-foreground">{editingTemplate ? 'Edit SMS Template' : 'New SMS Template'}</h3>
                                </div>
                                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Template ID" name="templateId" defaultValue={editingTemplate?.templateId} placeholder="e.g. otp_msg" required />
                                        <Input label="Name" name="name" defaultValue={editingTemplate?.name} placeholder="e.g. OTP Message" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">SMS Body</label>
                                        <textarea 
                                            name="body"
                                            defaultValue={editingTemplate?.body}
                                            rows={4}
                                            required
                                            className="w-full bg-background border border-border rounded-theme px-4 py-3 text-foreground font-sans text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                            placeholder="Your OTP is {{otp}}. Do not share it."
                                        />
                                        <p className="text-[10px] text-foreground-muted">Use {"{{variable}}"} for placeholders.</p>
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        <input type="checkbox" name="active" defaultChecked={editingTemplate ? editingTemplate.active : true} className="w-4 h-4 accent-primary" />
                                        <span className="text-sm font-medium">Active</span>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-border flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary px-6">Cancel</button>
                                    <button type="submit" className="btn-primary px-8">Save Template</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SmsTemplateTab;
