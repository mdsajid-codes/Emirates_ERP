import React, { useState } from 'react';
import { Settings, History, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import TelegramConfigTab from '../components/TelegramConfigTab';
import TelegramLogTab from '../components/TelegramLogTab';

const TelegramNotification = () => {
    const [activeTab, setActiveTab] = useState('config');

    const tabs = [
        { id: 'config', label: 'Telegram Config', icon: Settings },
        { id: 'logs', label: 'Delivery Logs', icon: History }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Telegram Notifications</h1>
                    <p className="text-foreground-muted mt-1">Setup Telegram bots for instant system alerts.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-sky-500/10 text-sky-600 rounded-full text-sm font-bold border border-sky-500/20">
                    <Send size={16} />
                    Bot API
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
                                layoutId="activeTabTelegram" 
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_-2px_8px_rgba(var(--color-primary-rgb),0.4)]"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-8">
                {activeTab === 'config' && <TelegramConfigTab />}
                {activeTab === 'logs' && <TelegramLogTab />}
            </div>
        </div>
    );
};

export default TelegramNotification;
