import React from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { Calculator, Banknote, UserMinus } from 'lucide-react';

const tabs = [
    { name: 'EOSB Calculation', href: 'eosb', icon: Calculator },
    { name: 'Final Settlement', href: 'final-settlement', icon: Banknote },
    { name: 'Termination Reasons', href: 'termination-reason', icon: UserMinus },
];

const EndOfServiceReports = () => {
    const location = useLocation();

    if (location.pathname === '/reports/eos' || location.pathname === '/reports/eos/') {
        return <Navigate to="eosb" replace />;
    }

    return (
        <div className="space-y-3">
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

            <div>
                <Outlet />
            </div>
        </div>
    );
};

export default EndOfServiceReports;
