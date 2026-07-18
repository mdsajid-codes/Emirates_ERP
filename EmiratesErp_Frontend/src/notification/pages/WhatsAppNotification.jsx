import React, { useState } from 'react';
import { Settings, FileText, History, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import WhatsAppConfigTab from '../components/WhatsAppConfigTab';
import WhatsAppTemplateTab from '../components/WhatsAppTemplateTab';
import WhatsAppLogTab from '../components/WhatsAppLogTab';

const WhatsAppNotification = () => {
    const [activeTab, setActiveTab] = useState('config');

    const tabs = [
        { id: 'config', label: 'WhatsApp Config', icon: Settings },
        { id: 'templates', label: 'Templates', icon: FileText },
        { id: 'logs', label: 'Delivery Logs', icon: History }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">WhatsApp Notifications</h1>
                    <p className="text-foreground-muted mt-1">Manage Meta WhatsApp Cloud API settings and templates.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-bold border border-green-500/20">
                    <MessageCircle size={16} />
                    Official API
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
                                layoutId="activeTabWhatsApp" 
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_-2px_8px_rgba(var(--color-primary-rgb),0.4)]"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-8">
                {activeTab === 'config' && <WhatsAppConfigTab />}
                {activeTab === 'templates' && <WhatsAppTemplateTab />}
                {activeTab === 'logs' && <WhatsAppLogTab />}
            </div>
        </div>
    );
};

export default WhatsAppNotification;
