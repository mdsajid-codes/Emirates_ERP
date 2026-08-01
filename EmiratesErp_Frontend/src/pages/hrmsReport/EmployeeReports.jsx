import React from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { UserCog, Users, PieChart, Briefcase, FileText } from 'lucide-react';

const tabs = [
    { name: 'Master Employee', href: 'master', icon: UserCog },
    { name: 'Headcount', href: 'count', icon: Users },
    { name: 'Demographics', href: 'demographics', icon: PieChart },
    { name: 'Employment Status', href: 'employment-status', icon: Briefcase },
    { name: 'Employee Documents', href: 'documents', icon: FileText },
];

const EmployeeReports = () => {
    const location = useLocation();

    if (location.pathname === '/reports/employee' || location.pathname === '/reports/employee/') {
        return <Navigate to="master" replace />;
    }

    return (
        <div className="space-y-3">
            {/* Top Sub-Tabs Navigation */}
            <div className="border-b border-border pb-0.5">
                <nav className="-mb-px flex space-x-3 overflow-x-auto" aria-label="Sub-tabs">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.name}
                            to={tab.href}
                            className={({ isActive }) =>
                                `whitespace-nowrap flex items-center gap-1.5 py-1.5 px-0.5 border-b-2 font-medium text-[11px] transition-colors ${
                                    isActive
                                        ? 'border-primary text-primary font-bold'
                                        : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
                                }`
                            }
                        >
                            <tab.icon className="h-3.5 w-3.5" />
                            <span>{tab.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Report View Content */}
            <div>
                <Outlet />
            </div>
        </div>
    );
};

export default EmployeeReports;
