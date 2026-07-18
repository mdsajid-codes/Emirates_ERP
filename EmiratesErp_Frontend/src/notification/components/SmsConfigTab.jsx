import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getSmsConfig, saveSmsConfig } from '../api/notificationApi';
import { Toggle, Input } from './NotificationShared';

const SmsConfigTab = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await getSmsConfig();
            setConfig(res.data);
        } catch (error) {
            toast.error("Failed to load SMS configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveSmsConfig(config);
            toast.success("Configuration saved successfully");
        } catch (error) {
            toast.error("Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="animate-fade-in-up">
            <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-background-muted/50">
                    <h3 className="font-bold text-foreground">SMS Gateway Configuration</h3>
                    <p className="text-sm text-foreground-muted mt-1">Configure your SMS provider and credentials.</p>
                </div>
                <div className="p-6 space-y-6">
                    <Toggle 
                        label="Enable SMS Notifications" 
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
                                <option value="TWILIO">Twilio</option>
                                <option value="MSG91">MSG91</option>
                                <option value="AWS_SNS">AWS SNS</option>
                                <option value="VONAGE">Vonage</option>
                            </select>
                        </div>
                        <Input label="API Key / SID" value={config?.apiKey} onChange={(val) => setConfig({...config, apiKey: val})} placeholder="Enter API Key" />
                        <Input label="API Secret / Token" value={config?.apiSecret} onChange={(val) => setConfig({...config, apiSecret: val})} placeholder="Enter Secret" type="password" />
                        <Input label="Sender ID / Phone Number" value={config?.senderId} onChange={(val) => setConfig({...config, senderId: val})} placeholder="e.g. COMPANY" />
                    </div>
                </div>
                <div className="p-6 bg-background-muted/30 border-t border-border flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
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

export default SmsConfigTab;
