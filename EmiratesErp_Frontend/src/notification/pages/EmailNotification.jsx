import React, { useState } from 'react';
import { Settings, FileText, History } from 'lucide-react';
import { motion } from 'framer-motion';
import EmailConfigTab from '../components/EmailConfigTab';
import EmailTemplateTab from '../components/EmailTemplateTab';
import EmailLogTab from '../components/EmailLogTab';

const EmailNotification = () => {
    const [activeTab, setActiveTab] = useState('config');

    const tabs = [
        { id: 'config', label: 'Email Config', icon: Settings },
        { id: 'templates', label: 'Templates', icon: FileText },
        { id: 'logs', label: 'Delivery Logs', icon: History }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Email Notifications</h1>
                    <p className="text-foreground-muted mt-1">SMTP settings, message templates, and transmission history.</p>
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
                                layoutId="activeTab" 
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_-2px_8px_rgba(var(--color-primary-rgb),0.4)]"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-8">
                {activeTab === 'config' && <EmailConfigTab />}
                {activeTab === 'templates' && <EmailTemplateTab />}
                {activeTab === 'logs' && <EmailLogTab />}
            </div>
        </div>
    );
};

export default EmailNotification;
