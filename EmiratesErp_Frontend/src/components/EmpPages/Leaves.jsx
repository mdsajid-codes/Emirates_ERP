import React, { useState } from 'react';
import LeavesView from './LeavesView';
import LeaveBalanceView from './LeaveBalanceView';
import LeavePolicyView from './LeavePolicyView';
import { FileClock, Wallet, BookOpen } from 'lucide-react';

const Leaves = () => {
    const [activeTab, setActiveTab] = useState('Leave Requests');

    const tabs = [
        { name: 'Leave Requests', icon: FileClock, component: <LeavesView />, color: 'text-amber-500' },
        { name: 'Leave Balances', icon: Wallet, component: <LeaveBalanceView />, color: 'text-emerald-500' },
        { name: 'Leave Policy', icon: BookOpen, component: <LeavePolicyView />, color: 'text-purple-500' },
    ];

    return (
        <div className="flex flex-col h-full bg-background-muted">
            {/* Header Module Sub-Nav */}
            <div className="border-b border-border px-4 sm:px-6 bg-card shadow-xs">
                <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`whitespace-nowrap flex items-center gap-2 py-3 px-1 border-b-2 font-bold text-xs transition-all group ${
                                activeTab === tab.name 
                                    ? 'border-primary text-primary font-bold' 
                                    : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
                            }`}
                        >
                            <tab.icon className={`h-4 w-4 ${tab.color} ${activeTab !== tab.name && 'opacity-70 group-hover:opacity-100'}`} />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {tabs.find(tab => tab.name === activeTab)?.component}
            </div>
        </div>
    );
}

export default Leaves;
