import React from 'react';
import { 
    LayoutDashboard, 
    Box, 
    TrendingUp, 
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Package,
    Shield
} from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, trend, trendValue }) => (
    <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border flex flex-col justify-between group hover:border-primary transition-all duration-300">
        <div className="flex justify-between items-start">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {trendValue}
                </div>
            )}
        </div>
        <div className="mt-4">
            <p className="text-sm font-medium text-foreground-muted uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold text-foreground mt-1">{value}</h3>
            <p className="text-xs text-foreground-muted mt-2">{subtext}</p>
        </div>
    </div>
);

const FixedAssetDashboard = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Fixed Assets Dashboard</h1>
                <p className="text-foreground-muted mt-1">Manage and track your company's long-term assets and their depreciation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Assets" 
                    value="124" 
                    subtext="Registered in system" 
                    icon={Package} 
                    trend="up" 
                    trendValue="+4 this month"
                />
                <StatCard 
                    title="Total Value" 
                    value="$1,245,000" 
                    subtext="Gross book value" 
                    icon={DollarSign} 
                />
                <StatCard 
                    title="Accumulated Dep." 
                    value="$342,000" 
                    subtext="Total depreciation to date" 
                    icon={TrendingUp} 
                />
                <StatCard 
                    title="Expiring Soon" 
                    value="12" 
                    subtext="Insurance/Certificates" 
                    icon={AlertCircle} 
                    trend="down" 
                    trendValue="Needs attention"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Asset Distribution by Category</h3>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg text-foreground-muted">
                        Chart: Asset Categories Distribution
                    </div>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Asset Value Trend</h3>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg text-foreground-muted">
                        Chart: NBV vs. Original Cost
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FixedAssetDashboard;
