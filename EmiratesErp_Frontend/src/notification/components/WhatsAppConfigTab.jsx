import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getWhatsAppConfig, saveWhatsAppConfig, testWhatsAppConnection } from '../api/notificationApi';
import { Toggle, Input } from './NotificationShared';

const WhatsAppConfigTab = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await getWhatsAppConfig();
            setConfig(res.data);
        } catch (error) {
            toast.error("Failed to load WhatsApp configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveWhatsAppConfig(config);
            toast.success("Configuration saved successfully");
        } catch (error) {
            toast.error("Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        const recipient = window.prompt("Enter recipient phone number (with country code, e.g., 919876543210):");
        if (!recipient) return;

        setTesting(true);
        try {
            await testWhatsAppConnection(recipient);
            toast.success("Test message initiated. Check your device!");
        } catch (error) {
            toast.error(error.response?.data || "Failed to initiate test message");
        } finally {
            setTesting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="animate-fade-in-up">
            <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-background-muted/50">
                    <h3 className="font-bold text-foreground">WhatsApp API Configuration</h3>
                    <p className="text-sm text-foreground-muted mt-1">Configure your WhatsApp Cloud API or Provider settings.</p>
                </div>
                <div className="p-6 space-y-6">
                    <Toggle 
                        label="Enable WhatsApp Notifications" 
                        enabled={config?.enabled} 
                        onChange={(val) => setConfig({...config, enabled: val})} 
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Provider</label>
                            <select 
                                value={config?.provider} 
                                onChange={(e) => setConfig({...config, provider: e.target.value})}
                                className="w-full bg-background border border-border rounded-theme py-2 px-4 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            >
                                <option value="META">Meta (Cloud API)</option>
                                <option value="TWILIO">Twilio</option>
                                <option value="WATI">WATI</option>
                                <option value="AISENSY">AiSensy</option>
                            </select>
                        </div>
                        <Input label="API Key / Token" value={config?.apiKey} onChange={(val) => setConfig({...config, apiKey: val})} placeholder="Access Token" type="password" />
                        <Input label="Phone Number ID" value={config?.phoneNumberId} onChange={(val) => setConfig({...config, phoneNumberId: val})} placeholder="1029384756..." />
                        <Input label="WhatsApp Business Account ID" value={config?.wabaId} onChange={(val) => setConfig({...config, wabaId: val})} placeholder="WAB ID..." />
                    </div>
                </div>
                <div className="p-6 bg-background-muted/30 border-t border-border flex justify-end gap-3">
                    <button 
                        onClick={handleTest}
                        disabled={testing || saving}
                        className="btn-secondary px-6 py-2.5 flex items-center gap-2"
                    >
                        {testing ? <Loader2 size={18} className="animate-spin" /> : null}
                        Test Connection
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving || testing}
                        className="btn-primary px-8 py-2.5 flex items-center gap-2"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppConfigTab;
