import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Globe, 
    Map, 
    GraduationCap, 
    FileText, 
    ArrowLeft, 
    Cpu,
    Building2,
    CreditCard
} from 'lucide-react';
import AiSettingsPage from './AiSettingsPage';
import AtsCountriesSettingsTab from './components/AtsCountriesSettingsTab';
import AtsStatesSettingsTab from './components/AtsStatesSettingsTab';
import AtsDegreesSettingsTab from './components/AtsDegreesSettingsTab';
import AtsDocTypesSettingsTab from './components/AtsDocTypesSettingsTab';
import AtsBusinessUnitsSettingsTab from './components/AtsBusinessUnitsSettingsTab';
import AtsPaymentTermsSettingsTab from './components/AtsPaymentTermsSettingsTab';

const AtsSettings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Countries');

    const navTabs = [
        { name: 'Countries', icon: Globe, color: 'text-blue-500' },
        { name: 'States', icon: Map, color: 'text-emerald-500' },
        { name: 'Degrees', icon: GraduationCap, color: 'text-purple-500' },
        { name: 'Document Types', icon: FileText, color: 'text-cyan-500' },
        { name: 'Business Units', icon: Building2, color: 'text-orange-500' },
        { name: 'Payment Terms', icon: CreditCard, color: 'text-indigo-500' },
        { name: 'AI Providers', icon: Cpu, color: 'text-rose-500' }
    ];

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'Countries':
                return <AtsCountriesSettingsTab />;
            case 'States':
                return <AtsStatesSettingsTab />;
            case 'Degrees':
                return <AtsDegreesSettingsTab />;
            case 'Document Types':
                return <AtsDocTypesSettingsTab />;
            case 'Business Units':
                return <AtsBusinessUnitsSettingsTab />;
            case 'Payment Terms':
                return <AtsPaymentTermsSettingsTab />;
            case 'AI Providers':
                return (
                    <div className="bg-card border border-border rounded-theme p-6 shadow-sm">
                        <AiSettingsPage />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="bg-card shadow-sm p-4 border-b border-border flex items-center justify-between z-20 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-background-muted transition-colors">
                        <ArrowLeft className="h-5 w-5 text-foreground-muted" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">ATS Configurations</h1>
                        <p className="text-sm text-foreground-muted">Manage global settings, dropdowns, and master references for ATS.</p>
                    </div>
                </div>
            </header>

            {/* Sidebar + Main layout */}
            <div className="flex-grow flex overflow-hidden">
                <aside className="w-64 bg-card border-r border-border p-4 space-y-1 flex-shrink-0 hidden md:block">
                    {navTabs.map(tab => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-theme text-sm font-semibold transition-all ${
                                activeTab === tab.name 
                                    ? 'bg-primary/10 border-l-4 border-primary text-primary font-bold shadow-sm' 
                                    : 'border-l-4 border-transparent text-foreground-muted hover:bg-background-muted hover:text-foreground'
                            }`}
                        >
                            <tab.icon className={`h-5 w-5 ${tab.color}`} />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </aside>

                <main className="flex-grow p-6 overflow-y-auto bg-background-muted">
                    {/* Tab Navigation for Mobile */}
                    <div className="md:hidden flex overflow-x-auto border-b border-border bg-card p-2 rounded-theme mb-4 gap-1">
                        {navTabs.map(tab => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-colors whitespace-nowrap ${
                                    activeTab === tab.name ? 'bg-primary text-primary-foreground' : 'text-foreground-muted hover:bg-background-muted'
                                }`}
                            >
                                <tab.icon className="h-3.5 w-3.5" />
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </div>

                    {renderActiveTab()}
                </main>
            </div>
        </div>
    );
};

export default AtsSettings;
