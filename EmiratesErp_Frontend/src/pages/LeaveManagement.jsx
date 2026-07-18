import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LeaveBalancesSection, AllLeaveRequests } from '../components/leaveComponents/AllLeaveRequests';
import DashboardLayout from '../components/DashboardLayout';
import SickLeaveManagement from './hrms/SickLeaveManagement';
import LeaveType from '../components/base/LeaveType';
import { SlidersHorizontal, BookCopy, UserCheck, FileClock, HeartPulse } from 'lucide-react';

const tabs = [
    { name: 'Leave Requests', icon: FileClock, component: AllLeaveRequests, color: 'text-amber-500' },
    { name: 'Leave Balances', icon: UserCheck, component: LeaveBalancesSection, color: 'text-green-500' },
    { name: 'Sick Leave', icon: HeartPulse, component: () => <SickLeaveManagement embedded />, color: 'text-rose-500' },
    { name: 'Leave Types', icon: BookCopy, component: () => <LeaveType embedded />, color: 'text-purple-500' },
];

const LeaveManagement = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'Leave Requests';

    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const tab = queryParams.get('tab');
        if (tab && tabs.some(t => t.name === tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component;

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 bg-background min-h-full text-foreground">
                <div className="max-w-full mx-auto">
                    <h1 className="text-3xl font-bold text-foreground mb-6">Leave Management</h1>

                    <div className="border-b border-border bg-card rounded-t-xl shadow-sm">
                        <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.name ?
                                    'border-primary text-primary' :
                                    'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
                                    }`}
                                > 
                                <tab.icon className={`mr-2 h-5 w-5 ${tab.color}`} />
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-6 bg-card p-6 rounded-b-xl shadow-sm border border-border">
                        {ActiveComponent && <ActiveComponent />}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LeaveManagement;