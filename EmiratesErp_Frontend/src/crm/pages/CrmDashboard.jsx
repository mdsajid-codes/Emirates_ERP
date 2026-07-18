import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Users, Building, Handshake, ListTodo, TrendingUp,
    Banknote, Activity, Clock, CheckCircle2, XCircle,
    Target, BarChart3, Briefcase
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
};

const KpiCard = ({ title, value, icon, colorClass }) => (
    <div className="bg-card p-4 rounded-theme shadow-sm border border-border flex items-center space-x-4 transition-all hover:-translate-y-1 hover:shadow-md">
        <div className={`flex-shrink-0 p-3 rounded-theme bg-opacity-10 ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-foreground-muted font-medium">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
    </div>
);

const ChartCard = ({ title, children }) => (
    <div className="bg-card p-6 rounded-theme shadow-sm border border-border flex flex-col">
        <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
        <div className="flex-1 flex items-center justify-center bg-background-muted/50 rounded-theme border border-dashed border-border/60 min-h-[250px]">
            {children || <span className="text-foreground-muted text-sm">Chart Placeholder</span>}
        </div>
    </div>
);

const RecentActivityList = ({ activities }) => {
    const getIcon = (type, action) => {
        if (type === 'LEAD') return <Target className="h-4 w-4 text-primary" />;
        if (type === 'DEAL') {
            if (action.includes('Won')) return <CheckCircle2 className="h-4 w-4 text-success" />;
            if (action.includes('Lost')) return <XCircle className="h-4 w-4 text-error" />;
            return <Handshake className="h-4 w-4 text-info" />;
        }
        if (type === 'TASK') {
            if (action.includes('Completed')) return <CheckCircle2 className="h-4 w-4 text-success" />;
            return <ListTodo className="h-4 w-4 text-warning" />;
        }
        return <Activity className="h-4 w-4 text-slate-400" />;
    };

    if (!activities || activities.length === 0) {
        return (
            <div className="py-10 text-center opacity-40">
                <Activity className="h-10 w-10 mx-auto mb-2" />
                <p className="text-xs font-medium">No recent activity detected</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activities.map((item, idx) => (
                <div key={`${item.type}-${item.id}-${idx}`} className="flex items-start gap-3 p-3 hover:bg-background-muted rounded-theme transition-colors border border-transparent hover:border-border/50">
                    <div className="mt-0.5 p-2 bg-background rounded-full border border-border shadow-sm">
                        {getIcon(item.type, item.action)}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.action}</p>
                        <p className="text-xs text-primary/80 truncate max-w-[180px]">{item.target}</p>
                    </div>
                    <span className="text-xs text-foreground-muted whitespace-nowrap">{formatTimeAgo(item.timestamp)}</span>
                </div>
            ))}
        </div>
    );
};

const CrmDashboard = () => {
    const [data, setData] = useState({
        stats: {
            totalCompanies: 0,
            totalContacts: 0,
            openDeals: 0,
            totalRevenue: 0,
            pendingTasks: 0
        },
        recentActivities: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const authHeaders = useMemo(() => ({
        "Authorization": `Bearer ${localStorage.getItem('token')}`
    }), []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/crm/dashboard/summary`, {
                    headers: authHeaders
                });
                setData(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setError("Failed to synchronize with CRM cloud.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [authHeaders]);

    const formatRevenue = (value) => {
        if (value >= 1000000) return `AED ${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `AED ${(value / 1000).toFixed(1)}k`;
        return `AED ${value.toFixed(2)}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent shadow-sm"></div>
                <p className="text-xs font-bold text-primary animate-pulse tracking-widest uppercase">Initializing CRM Engine...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-error">
                <XCircle className="h-12 w-12" />
                <p className="font-bold">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary text-white rounded-theme text-sm font-bold"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    const { stats, recentActivities } = data;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">CRM Overview</h2>
                    <p className="text-foreground-muted text-sm mt-1">Real-time performance metrics and pipeline activity.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full border border-success/20">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Live System Sync</span>
                </div>
            </header>

            <main className="space-y-8">
                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <KpiCard
                        title="Revenue (Won)"
                        value={formatRevenue(stats.totalRevenue)}
                        icon={<Banknote className="h-6 w-6 text-success" />}
                        colorClass="bg-success text-success"
                    />
                    <KpiCard
                        title="Companies"
                        value={stats.totalCompanies}
                        icon={<Building className="h-6 w-6 text-info" />}
                        colorClass="bg-info text-info"
                    />
                    <KpiCard
                        title="Contacts"
                        value={stats.totalContacts}
                        icon={<Users className="h-6 w-6 text-primary" />}
                        colorClass="bg-primary text-primary"
                    />
                    <KpiCard
                        title="Open Deals"
                        value={stats.openDeals}
                        icon={<Handshake className="h-6 w-6 text-warning" />}
                        colorClass="bg-warning text-warning"
                    />
                    <KpiCard
                        title="Pending Tasks"
                        value={stats.pendingTasks}
                        icon={<ListTodo className="h-6 w-6 text-error" />}
                        colorClass="bg-error text-error"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Charts Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <ChartCard title="Revenue Performance">
                            <div className="flex flex-col items-center opacity-60">
                                <Activity className="h-12 w-12 text-primary mb-2 animate-pulse" />
                                <span className="text-foreground-muted text-xs font-medium">Aggregating historical trends...</span>
                            </div>
                        </ChartCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ChartCard title="Lead Distribution" />
                            <ChartCard title="Sales Velocity" />
                        </div>
                    </div>

                    {/* Activity & Quick Actions */}
                    <div className="space-y-6">
                        <div className="bg-card p-6 rounded-theme shadow-sm border border-border flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-foreground">Live Feed</h3>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold">
                                    <Clock size={10} /> RECENT
                                </div>
                            </div>
                            <RecentActivityList activities={recentActivities} />
                            <button className="mt-6 w-full py-2.5 border border-border rounded-theme text-xs font-bold text-foreground-muted hover:bg-background transition-all">
                                View Full Audit Log
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-theme border border-primary/20 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-lg font-semibold text-primary mb-2">Deal Acceleration</h3>
                                <p className="text-xs text-foreground-muted mb-5 leading-relaxed">System identified <strong>{stats.openDeals}</strong> open deals that could benefit from automated follow-ups.</p>
                                <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-theme text-xs font-bold hover:bg-primary/90 transition-all shadow-md group-hover:shadow-primary/20">
                                    Launch Follow-up Campaign
                                </button>
                            </div>
                            <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                <Target size={120} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CrmDashboard;
