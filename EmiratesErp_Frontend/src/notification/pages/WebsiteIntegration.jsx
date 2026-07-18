import React, { useState } from 'react';
import { Settings, History, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import WebhookConfigTab from '../components/WebhookConfigTab';

const WebsiteIntegration = () => {
    const [activeTab, setActiveTab] = useState('config');

    const tabs = [
        { id: 'config', label: 'Webhook Config', icon: Settings },
        { id: 'logs', label: 'Delivery Logs', icon: History }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Website Integration (Webhooks)</h1>
                    <p className="text-foreground-muted mt-1">Connect your external websites or systems via webhooks.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-600 rounded-full text-sm font-bold border border-rose-500/20">
                    <Globe size={16} />
                    Webhooks
                </div>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-border gap-8">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === tab.id ? 'text-primary' : 'text-foreground-muted hover:text-foreground'}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div 
                                layoutId="activeTabWebhook" 
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_-2px_8px_rgba(var(--color-primary-rgb),0.4)]"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-8">
                {activeTab === 'config' && <WebhookConfigTab />}
                {activeTab === 'logs' && (
                    <div className="bg-card border border-border rounded-theme p-12 text-center">
                        <History size={48} className="mx-auto text-foreground-muted mb-4 opacity-20" />
                        <h3 className="text-lg font-bold text-foreground">Webhook Logs Coming Soon</h3>
                        <p className="text-foreground-muted max-w-md mx-auto mt-2">We are currently working on a detailed log view for webhook delivery attempts and response codes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WebsiteIntegration;
