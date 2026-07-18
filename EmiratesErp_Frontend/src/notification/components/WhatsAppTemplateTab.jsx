import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
    getWhatsAppTemplates, 
    createWhatsAppTemplate, 
    updateWhatsAppTemplate, 
    deleteWhatsAppTemplate,
    testWhatsAppConnection
} from '../api/notificationApi';
import { Input, Badge } from './NotificationShared';

const WhatsAppTemplateTab = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [testing, setTesting] = useState(false);
    const [testRecipient, setTestRecipient] = useState('');
    const [previewBody, setPreviewBody] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (editingTemplate) {
            setPreviewBody(editingTemplate.body || '');
        } else if (isModalOpen) {
            setPreviewBody('');
        }
    }, [editingTemplate, isModalOpen]);

    const fetchTemplates = async () => {
        try {
            const res = await getWhatsAppTemplates();
            setTemplates(res.data);
        } catch (error) {
            toast.error("Failed to load WhatsApp templates");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            await deleteWhatsAppTemplate(id);
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
                await updateWhatsAppTemplate(editingTemplate.id, data);
            } else {
                await createWhatsAppTemplate(data);
            }
            toast.success("Template saved");
            setIsModalOpen(false);
            fetchTemplates();
        } catch (error) {
            toast.error("Save failed");
        }
    };

    const handleTestTemplate = async () => {
        if (!testRecipient) {
            toast.warn("Please enter a recipient number");
            return;
        }
        if (!editingTemplate?.templateId) {
            toast.warn("Save the template first before testing");
            return;
        }

        setTesting(true);
        try {
            await testWhatsAppConnection(testRecipient, editingTemplate.templateId);
            toast.success("Test message sent!");
        } catch (error) {
            toast.error(error.response?.data || "Test failed");
        } finally {
            setTesting(false);
        }
    };

    // Helper to format WhatsApp preview text
    const formatPreview = (text) => {
        if (!text) return <span className="text-foreground-muted italic text-xs">Your message will appear here...</span>;
        
        const parts = text.split(/({{.*?}})/g);
        return parts.map((part, i) => {
            if (part.startsWith('{{') && part.endsWith('}}')) {
                return <span key={i} className="text-primary font-bold">{part}</span>;
            }
            return part.split('\n').map((line, j) => (
                <React.Fragment key={`${i}-${j}`}>
                    {line}
                    {j < part.split('\n').length - 1 && <br />}
                </React.Fragment>
            ));
        });
    };

    return (
        <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg text-foreground">WhatsApp Templates</h3>
                    <p className="text-sm text-foreground-muted">Manage your approved WhatsApp message templates.</p>
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
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-background-muted text-foreground-muted text-xs uppercase tracking-wider">
                            <th className="p-4 font-bold">Template ID</th>
                            <th className="p-4 font-bold">Name</th>
                            <th className="p-4 font-bold">Provider ID</th>
                            <th className="p-4 font-bold">Status</th>
                            <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 text-sm">
                        {templates.map(tpl => (
                            <tr key={tpl.id} className="hover:bg-background-muted/30 transition-colors">
                                <td className="p-4 font-mono text-xs text-primary font-bold">{tpl.templateId}</td>
                                <td className="p-4 font-medium text-foreground">{tpl.name}</td>
                                <td className="p-4 text-foreground-muted">{tpl.providerTemplateId}</td>
                                <td className="p-4">
                                    <Badge status={tpl.active ? 'success' : 'neutral'}>
                                        {tpl.active ? 'ACTIVE' : 'INACTIVE'}
                                    </Badge>
                                </td>
                                <td className="p-4 text-right">
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
                            className="bg-card w-full max-w-5xl rounded-theme shadow-2xl border border-border relative overflow-hidden flex flex-col md:flex-row"
                        >
                            {/* Left Side: Form */}
                            <div className="flex-1 flex flex-col border-r border-border min-w-0">
                                <form onSubmit={handleSaveTemplate} className="flex flex-col h-full">
                                    <div className="p-6 border-b border-border bg-background-muted flex justify-between items-center">
                                        <h3 className="font-bold text-xl text-foreground">
                                            {editingTemplate ? 'Edit WhatsApp Template' : 'New WhatsApp Template'}
                                        </h3>
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-foreground-muted hover:text-foreground">
                                            <Plus className="rotate-45" size={24} />
                                        </button>
                                    </div>
                                    
                                    <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[75vh]">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Template ID" name="templateId" defaultValue={editingTemplate?.templateId} placeholder="e.g. welcome_msg" required />
                                            <Input label="Name" name="name" defaultValue={editingTemplate?.name} placeholder="e.g. Welcome Message" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Provider Template ID / Name" name="providerTemplateId" defaultValue={editingTemplate?.providerTemplateId} placeholder="The exact name in Meta Dashboard" required />
                                            <Input label="Language Code" name="languageCode" defaultValue={editingTemplate?.languageCode || 'en_US'} placeholder="e.g. en_US" required />
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Message Body</label>
                                            <textarea 
                                                name="body"
                                                value={previewBody}
                                                onChange={(e) => setPreviewBody(e.target.value)}
                                                rows={6}
                                                required
                                                className="w-full bg-background border border-border rounded-theme px-4 py-3 text-foreground font-sans text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                                placeholder="Hello {{1}}, welcome to our service!"
                                            />
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] text-foreground-muted">Use {"{{1}}, {{2}}"} etc. for variables.</p>
                                                <p className="text-[10px] text-foreground-muted font-mono">{previewBody.length} characters</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-2">
                                            <input type="checkbox" name="active" defaultChecked={editingTemplate ? editingTemplate.active : true} className="w-4 h-4 accent-primary" />
                                            <span className="text-sm font-medium">Active</span>
                                        </div>

                                        {editingTemplate && (
                                            <div className="mt-4 pt-4 border-t border-border/50">
                                                <div className="bg-background-muted/50 p-4 rounded-theme border border-border/50">
                                                    <h4 className="text-xs font-bold mb-3 flex items-center gap-2 text-foreground uppercase tracking-tighter">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                                        Test this Template
                                                    </h4>
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            value={testRecipient}
                                                            onChange={(e) => setTestRecipient(e.target.value)}
                                                            placeholder="Recipient (e.g. 919876543210)"
                                                            className="flex-1 bg-background border border-border rounded-theme px-3 py-2 text-sm outline-none focus:border-primary text-foreground"
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={handleTestTemplate}
                                                            disabled={testing}
                                                            className="btn-secondary px-4 py-2 text-xs flex items-center gap-2 whitespace-nowrap"
                                                        >
                                                            {testing ? <Loader2 size={14} className="animate-spin" /> : null}
                                                            Send Test
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 border-t border-border flex justify-end gap-3 bg-background-muted/30">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary px-6 py-2">Cancel</button>
                                        <button type="submit" className="btn-primary px-10 py-2 flex items-center gap-2">
                                            <Save size={18} />
                                            Save Template
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Right Side: WhatsApp Preview */}
                            <div className="hidden md:flex w-[380px] bg-background-muted items-center justify-center p-8 relative">
                                <div className="absolute top-4 left-4">
                                    <Badge status="primary">MOBILE PREVIEW</Badge>
                                </div>
                                
                                {/* Phone Mockup */}
                                <div className="w-[280px] h-[520px] bg-[#000] rounded-[40px] border-[8px] border-[#222] shadow-2xl relative overflow-hidden flex flex-col">
                                    {/* Phone Header */}
                                    <div className="h-14 bg-[#075e54] flex items-center px-4 gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                                            <div className="w-8 h-8 bg-[#eee]"></div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-2 w-20 bg-white/30 rounded mb-1"></div>
                                            <div className="h-1.5 w-12 bg-white/20 rounded"></div>
                                        </div>
                                    </div>

                                    {/* Chat Background */}
                                    <div className="flex-1 bg-[#e5ddd5] p-3 overflow-y-auto relative" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain' }}>
                                        <div className="bg-white rounded-lg p-3 shadow-sm max-w-[95%] relative">
                                            {/* Triangle tip */}
                                            <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent"></div>
                                            
                                            <div className="text-[13px] text-[#303030] leading-relaxed break-words whitespace-pre-wrap">
                                                {formatPreview(previewBody)}
                                            </div>
                                            
                                            <div className="text-[10px] text-foreground-muted text-right mt-1">
                                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Input bar mockup */}
                                    <div className="h-12 bg-[#f0f0f0] p-2 flex items-center gap-2">
                                        <div className="flex-1 bg-white rounded-full h-full"></div>
                                        <div className="w-8 h-8 rounded-full bg-[#128c7e] flex items-center justify-center">
                                            <div className="w-3 h-3 bg-white rounded-sm rotate-45 ml-0.5"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WhatsAppTemplateTab;
