import React, { useState } from 'react';
import { Settings, FileText, History, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import SmsConfigTab from '../components/SmsConfigTab';
import SmsTemplateTab from '../components/SmsTemplateTab';
import SmsLogTab from '../components/SmsLogTab';

const SmsNotification = () => {
    const [activeTab, setActiveTab] = useState('config');

    const tabs = [
        { id: 'config', label: 'SMS Config', icon: Settings },
        { id: 'templates', label: 'Templates', icon: FileText },
        { id: 'logs', label: 'Delivery Logs', icon: History }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">SMS Notifications</h1>
                    <p className="text-foreground-muted mt-1">Configure SMS gateways and track delivery status.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-sm font-bold border border-yellow-500/20">
                    <Smartphone size={16} />
                    SMS Gateway
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
                                layoutId="activeTabSms" 
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_-2px_8px_rgba(var(--color-primary-rgb),0.4)]"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-8">
                {activeTab === 'config' && <SmsConfigTab />}
                {activeTab === 'templates' && <SmsTemplateTab />}
                {activeTab === 'logs' && <SmsLogTab />}
            </div>
        </div>
    );
};

export default SmsNotification;
