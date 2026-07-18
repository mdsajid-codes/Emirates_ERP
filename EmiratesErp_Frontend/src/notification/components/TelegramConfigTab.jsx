import React, { useState, useEffect } from 'react';
import { Save, Loader2, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { getTelegramConfig, saveTelegramConfig } from '../api/notificationApi';
import { Toggle, Input } from './NotificationShared';

const TelegramConfigTab = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await getTelegramConfig();
            setConfig(res.data);
        } catch (error) {
            toast.error("Failed to load Telegram configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveTelegramConfig(config);
            toast.success("Telegram settings saved");
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
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <Send size={18} className="text-sky-500" />
                        Telegram Bot Configuration
                    </h3>
                    <p className="text-sm text-foreground-muted mt-1">Configure your Telegram bot token and default delivery settings.</p>
                </div>
                <div className="p-6 space-y-6">
                    <Toggle 
                        label="Enable Telegram Notifications" 
                        enabled={config?.enabled} 
                        onChange={(val) => setConfig({...config, enabled: val})} 
                    />
                    
                    <div className="grid grid-cols-1 gap-6 pt-4 border-t border-border/50">
                        <Input 
                            label="Bot API Token" 
                            value={config?.botToken} 
                            onChange={(val) => setConfig({...config, botToken: val})} 
                            placeholder="123456789:ABCDefghIJKLmnopQRSTuvwxYZ..." 
                            type="password"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input 
                                label="Default Chat ID" 
                                value={config?.defaultChatId} 
                                onChange={(val) => setConfig({...config, defaultChatId: val})} 
                                placeholder="e.g. -100123456789" 
                            />
                            <div className="bg-sky-500/5 border border-sky-500/10 p-4 rounded-theme flex flex-col justify-center">
                                <p className="text-[11px] text-sky-600 font-medium">Tip: Use @userinfobot or @GetIDsBot on Telegram to find your Chat ID.</p>
                            </div>
                        </div>
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

export default TelegramConfigTab;
