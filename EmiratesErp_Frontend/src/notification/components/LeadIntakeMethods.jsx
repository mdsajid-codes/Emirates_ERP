import React, { useState } from 'react';
import { 
    Globe, 
    Facebook, 
    Zap, 
    Code,
    Layout
} from 'lucide-react';
import WebsiteIntake from './lead-intake/WebsiteIntake';
import FacebookIntake from './lead-intake/FacebookIntake';
import ZapierIntake from './lead-intake/ZapierIntake';
import EmbeddedFormIntake from './lead-intake/EmbeddedFormIntake';
import { motion, AnimatePresence } from 'framer-motion';

const LeadIntakeMethods = ({ apiKey, publicBaseUrl }) => {
    const [activeSubTab, setActiveSubTab] = useState('website');

    const subTabs = [
        { id: 'website', name: 'Website Integration', icon: Globe },
        { id: 'facebook', name: 'Facebook & Instagram Ads', icon: Facebook },
        { id: 'zapier', name: 'Zapier & Make.com', icon: Zap },
        { id: 'embedded', name: 'Embedded Form', icon: Code },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sub-tab Content */}
            <div className="flex-1 min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSubTab}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeSubTab === 'website' && (
                            <WebsiteIntake apiKey={apiKey} publicBaseUrl={publicBaseUrl} />
                        )}
                        {activeSubTab === 'facebook' && (
                            <FacebookIntake apiKey={apiKey} publicBaseUrl={publicBaseUrl} />
                        )}
                        {activeSubTab === 'zapier' && (
                            <ZapierIntake publicBaseUrl={publicBaseUrl} />
                        )}
                        {activeSubTab === 'embedded' && (
                            <EmbeddedFormIntake apiKey={apiKey} publicBaseUrl={publicBaseUrl} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Sub-tab Navigation (Now on the Right) */}
            <div className="lg:w-72 shrink-0 space-y-1">
                {subTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-theme transition-all ${
                            activeSubTab === tab.id 
                            ? 'bg-primary text-white shadow-md' 
                            : 'text-foreground-muted hover:bg-background-muted'
                        }`}
                    >
                        <tab.icon size={18} />
                        <span>{tab.name}</span>
                    </button>
                ))}
                
                <div className="mt-8 p-4 bg-primary/5 rounded-theme border border-primary/10">
                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-2">
                        <Layout size={14} /> System Status
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        API Intake Active
                    </div>
                    <p className="text-[10px] text-foreground-muted mt-2 leading-relaxed">
                        Our intake endpoints are optimized for high-volume lead capture.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LeadIntakeMethods;
