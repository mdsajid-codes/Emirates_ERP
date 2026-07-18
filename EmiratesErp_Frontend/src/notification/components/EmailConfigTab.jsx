import React, { useState, useEffect } from 'react';
import { Save, Loader2, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { getEmailConfig, saveEmailConfig, testEmailConnection } from '../api/notificationApi';
import { Toggle, Input } from './NotificationShared';

const EmailConfigTab = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await getEmailConfig();
            setConfig(res.data);
        } catch (error) {
            toast.error("Failed to load email configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveEmailConfig(config);
            toast.success("Configuration saved successfully");
        } catch (error) {
            toast.error("Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        try {
            await testEmailConnection(config);
            toast.success("SMTP Connection Successful!");
        } catch (error) {
            toast.error(error.response?.data || "SMTP Connection Failed");
        } finally {
            setTesting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="animate-fade-in-up">
            <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-background-muted/50">
                    <h3 className="font-bold text-foreground">SMTP Configuration</h3>
                    <p className="text-sm text-foreground-muted mt-1">Configure your outgoing mail server settings.</p>
                </div>
                <div className="p-6 space-y-6">
                    <Toggle 
                        label="Enable Email Notifications" 
                        enabled={config?.enabled} 
                        onChange={(val) => setConfig({...config, enabled: val})} 
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                        <Input label="SMTP Host" value={config?.host} onChange={(val) => setConfig({...config, host: val})} placeholder="smtp.gmail.com" />
                        <Input label="SMTP Port" type="number" value={config?.port} onChange={(val) => setConfig({...config, port: val})} placeholder="587" />
                        <Input label="Username" value={config?.username} onChange={(val) => setConfig({...config, username: val})} placeholder="user@example.com" />
                        <Input label="Password" type="password" value={config?.password} onChange={(val) => setConfig({...config, password: val})} placeholder="••••••••" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                        <Input label="From Email" value={config?.fromEmail} onChange={(val) => setConfig({...config, fromEmail: val})} placeholder="no-reply@company.com" />
                        <Input label="From Name" value={config?.fromName} onChange={(val) => setConfig({...config, fromName: val})} placeholder="Company Notifications" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                        <Toggle label="Use SSL" enabled={config?.sslEnabled} onChange={(val) => setConfig({...config, sslEnabled: val})} />
                        <Toggle label="Use STARTTLS" enabled={config?.starttlsEnabled} onChange={(val) => setConfig({...config, starttlsEnabled: val})} />
                    </div>
                </div>
                <div className="p-6 bg-background-muted/30 border-t border-border flex justify-end gap-4">
                    <button 
                        onClick={handleTestConnection}
                        disabled={testing || saving}
                        className="px-6 py-2.5 rounded-theme border border-primary text-primary font-bold hover:bg-primary/5 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {testing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
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

export default EmailConfigTab;
