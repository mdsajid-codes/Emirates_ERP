import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, change, changeType }) => (
    <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-foreground-muted">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            {change && (
                <div className={`mt-2 flex items-center text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {changeType === 'increase' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    <span>{change}</span>
                </div>
            )}
        </div>
        <div className="bg-primary/10 text-primary p-3 rounded-lg">
            <Icon className="h-6 w-6" />
        </div>
    </div>
);

export default StatCard;
