import React, { useState } from 'react';
import { Building, Landmark } from 'lucide-react';
import CompanyInfoDetails from '../../manageCompany/CompanyInfo';
import BankDetails from '../../manageCompany/BankDetails';

const CompanyInfo = () => {
    const [activeSubTab, setActiveSubTab] = useState('Company Details');

    const subTabs = [
        { name: 'Company Details', icon: Building, component: CompanyInfoDetails },
        { name: 'Bank Accounts', icon: Landmark, component: BankDetails },
    ];

    const ActiveComponent = subTabs.find(tab => tab.name === activeSubTab)?.component;

    return (
        <div className="space-y-3">
            <div className="border-b border-border pb-0.5 mb-3">
                <nav className="-mb-px flex space-x-3" aria-label="Sub-tabs">
                    {subTabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveSubTab(tab.name)}
                            className={`whitespace-nowrap flex items-center gap-1.5 py-1 px-0.5 border-b-2 font-medium text-[11px] transition-colors ${
                                activeSubTab === tab.name
                                    ? 'border-primary text-primary font-bold'
                                    : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
                            }`}
                        >
                            <tab.icon className="h-3.5 w-3.5" />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            {ActiveComponent && <ActiveComponent />}
        </div>
    );
};

export default CompanyInfo;
