import React, { useState, useEffect } from 'react';
import { 
    Key, 
    RefreshCw, 
    Copy, 
    CheckCircle, 
    Zap,
    LayoutGrid,
    BookOpen,
    Settings as SettingsIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getLeadApiKey, regenerateLeadApiKey } from '../api/notificationApi';
import LeadIntakeMethods from '../components/LeadIntakeMethods';
import LeadApiReference from '../components/LeadApiReference';

const LeadCapture = () => {
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(null);
    const [activeTab, setActiveTab] = useState('integrations');

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    const publicBaseUrl = apiBaseUrl.replace('/api', '/api/public/leads');

    useEffect(() => {
        fetchApiKey();
    }, []);

    const fetchApiKey = async () => {
        try {
            const res = await getLeadApiKey();
            setApiKey(res.data.apiKey);
        } catch (error) {
            toast.error("Failed to fetch API Key");
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        if (!window.confirm("Are you sure? Old integrations using this key will stop working immediately.")) return;
        try {
            const res = await regenerateLeadApiKey();
            setApiKey(res.data.apiKey);
            toast.success("New API Key generated");
        } catch (error) {
            toast.error("Regeneration failed");
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
        toast.info("Copied to clipboard");
    };

    const tabs = [
        { id: 'integrations', name: 'Integration Methods', icon: LayoutGrid },
        { id: 'api', name: 'API Reference', icon: BookOpen },
        { id: 'settings', name: 'Key Management', icon: SettingsIcon },
    ];

    return (
        <div className="w-full space-y-8 pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-8 rounded-theme border border-border shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Lead Intake Center</h1>
                    <p className="text-foreground-muted mt-2 max-w-2xl leading-relaxed">
                        Capture and funnel leads from any external source directly into your CRM.
                    </p>
                </div>
                <div className="flex flex-col items-end gap-3 min-w-[280px]">
                    <div className="w-full">
                        <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest mb-1.5 block">Active API Key</label>
                        <div className="flex items-center gap-2 bg-background p-1 pr-3 rounded-theme border border-border shadow-inner group">
                            <input 
                                type="password" 
                                readOnly 
                                value={loading ? 'Loading...' : apiKey} 
                                className="flex-1 bg-transparent border-none outline-none px-3 py-2 font-mono text-sm text-primary font-bold" 
                            />
                            <button onClick={() => copyToClipboard(apiKey, 'main-key')} className="p-2 hover:bg-primary/10 rounded-theme text-foreground-muted hover:text-primary transition-all">
                                {copied === 'main-key' ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-background-muted p-1 rounded-theme border border-border w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-theme transition-all ${
                            activeTab === tab.id 
                            ? 'bg-card text-primary shadow-sm' 
                            : 'text-foreground-muted hover:bg-card/50'
                        }`}
                    >
                        <tab.icon size={18} />
                        <span>{tab.name}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'integrations' && (
                        <LeadIntakeMethods apiKey={apiKey} publicBaseUrl={publicBaseUrl} />
                    )}
                    
                    {activeTab === 'api' && (
                        <LeadApiReference />
                    )}

                    {activeTab === 'settings' && (
                        <div className="bg-card rounded-theme border border-border p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-rose-500/10 rounded-theme text-rose-500">
                                    <Key size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">API Key Management</h3>
                                    <p className="text-sm text-foreground-muted">Securely manage your lead intake authentication keys.</p>
                                </div>
                            </div>

                            <div className="space-y-6 max-w-2xl">
                                <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-theme">
                                    <h4 className="text-amber-700 font-bold mb-2 flex items-center gap-2 text-sm">
                                        <Zap size={16} /> Danger Zone: Regenerating Keys
                                    </h4>
                                    <p className="text-xs text-amber-600 leading-relaxed mb-4">
                                        If you regenerate your API key, all existing integrations using the old key will stop working immediately. 
                                        You will need to update your website forms and webhooks with the new key.
                                    </p>
                                    <button 
                                        onClick={handleRegenerate}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white font-bold rounded-theme hover:bg-rose-600 transition-all text-sm shadow-sm"
                                    >
                                        <RefreshCw size={16} /> Regenerate API Key
                                    </button>
                                </div>

                                <div className="p-6 bg-background-muted rounded-theme border border-border">
                                    <h4 className="text-sm font-bold text-foreground mb-4">Security Best Practices</h4>
                                    <ul className="space-y-3 text-xs text-foreground-muted">
                                        <li className="flex items-start gap-3">
                                            <div className="mt-0.5 p-1 bg-green-500/20 rounded-full text-green-600"><CheckCircle size={10} /></div>
                                            <span>Never expose this API key in client-side Javascript code.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="mt-0.5 p-1 bg-green-500/20 rounded-full text-green-600"><CheckCircle size={10} /></div>
                                            <span>Use server-side relay or secure webhook configuration.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="mt-0.5 p-1 bg-green-500/20 rounded-full text-green-600"><CheckCircle size={10} /></div>
                                            <span>Regenerate your key immediately if you suspect it has been compromised.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default LeadCapture;
