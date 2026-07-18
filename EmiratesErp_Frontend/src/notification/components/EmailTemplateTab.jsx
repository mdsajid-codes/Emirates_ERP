import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
    getEmailTemplates, 
    createEmailTemplate, 
    updateEmailTemplate, 
    deleteEmailTemplate,
    testEmailTemplate
} from '../api/notificationApi';
import { Input, Badge } from './NotificationShared';

const EmailTemplateTab = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [testEmail, setTestEmail] = useState('');
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await getEmailTemplates();
            setTemplates(res.data);
        } catch (error) {
            toast.error("Failed to load templates");
        } finally {
            setLoading(false);
        }
    };

    const handleTestTemplate = async (e) => {
        e.preventDefault();
        if (!testEmail) {
            toast.error("Please enter a recipient email");
            return;
        }

        const form = e.target.closest('form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.active = formData.get('active') === 'on';

        setTesting(true);
        try {
            await testEmailTemplate({
                template: data,
                recipient: testEmail
            });
            toast.success("Test email sent!");
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data || "Failed to send test email";
            toast.error(errorMsg);
        } finally {
            setTesting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            await deleteEmailTemplate(id);
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
                await updateEmailTemplate(editingTemplate.id, data);
            } else {
                await createEmailTemplate(data);
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
                    <h3 className="font-bold text-lg text-foreground">Email Templates</h3>
                    <p className="text-sm text-foreground-muted">Define the content and structure of your emails.</p>
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
                            <th className="th-cell">Subject</th>
                            <th className="th-cell">Status</th>
                            <th className="th-cell text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {templates.map(tpl => (
                            <tr key={tpl.id} className="hover:bg-background-muted/30 transition-colors">
                                <td className="td-cell font-mono text-xs text-primary font-bold">{tpl.templateId}</td>
                                <td className="td-cell font-medium text-foreground">{tpl.name}</td>
                                <td className="td-cell text-foreground-muted text-sm italic">"{tpl.subject}"</td>
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
                                <td colSpan="5" className="p-12 text-center text-foreground-muted italic">No templates found. Create your first one!</td>
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
                                    <h3 className="font-bold text-xl text-foreground">{editingTemplate ? 'Edit Template' : 'New Email Template'}</h3>
                                </div>
                                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Template ID" name="templateId" defaultValue={editingTemplate?.templateId} placeholder="e.g. welcome_email" required />
                                        <Input label="Name" name="name" defaultValue={editingTemplate?.name} placeholder="e.g. Welcome Customer" required />
                                    </div>
                                    <Input label="Subject" name="subject" defaultValue={editingTemplate?.subject} placeholder="Email Subject Line" required />
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Email Body (HTML/Text)</label>
                                        <textarea 
                                            name="body"
                                            defaultValue={editingTemplate?.body}
                                            rows={8}
                                            required
                                            className="w-full bg-background border border-border rounded-theme px-4 py-3 text-foreground font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                            placeholder="Hello {{name}}, welcome to our platform!"
                                        />
                                    </div>
                                    <div className="flex gap-6 pt-2">
                                        <div className="flex items-center gap-3">
                                            <input type="checkbox" name="active" defaultChecked={editingTemplate ? editingTemplate.active : true} className="w-4 h-4 accent-primary" />
                                            <span className="text-sm font-medium">Active Template</span>
                                        </div>
                                        <div className="flex-1">
                                            <Input label="Language" name="languageCode" defaultValue={editingTemplate?.languageCode || 'en'} placeholder="en" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Test Template Section */}
                                {editingTemplate && (
                                    <div className="mx-6 mb-6 p-4 bg-primary/5 border border-primary/10 rounded-theme flex flex-col md:flex-row items-end gap-4">
                                        <div className="flex-1 w-full">
                                            <Input 
                                                label="Test Recipient Email" 
                                                value={testEmail} 
                                                onChange={(val) => setTestEmail(val)} 
                                                placeholder="Enter email to test this template" 
                                            />
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={handleTestTemplate}
                                            disabled={testing}
                                            className="px-6 py-2.5 rounded-theme bg-primary text-white font-bold hover:bg-primary-dark transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                                        >
                                            {testing ? <Loader2 size={18} className="animate-spin" /> : 'Test Template'}
                                        </button>
                                    </div>
                                )}

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

export default EmailTemplateTab;
