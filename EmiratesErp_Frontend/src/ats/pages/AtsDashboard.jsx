import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, 
    UserPlus, 
    TrendingUp, 
    CheckCircle2, 
    AlertOctagon, 
    Briefcase,
    Loader2,
    Calendar,
    ArrowRight,
    LayoutGrid
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { Link, useOutletContext } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsDashboard = () => {
    const { setShowQuickLinks } = useOutletContext() || {};
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        newLeads: 0,
        active: 0,
        placed: 0,
        blacklisted: 0,
        onHold: 0
    });
    const [statusData, setStatusData] = useState([]);
    const [sourceData, setSourceData] = useState([]);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/ats/applicants?size=1000`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                const applicants = response.data.content || response.data || [];
                
                // Calculate Stats
                const computedStats = {
                    total: applicants.length,
                    newLeads: applicants.filter(a => a.applicantStatus === 'NEW_LEAD').length,
                    active: applicants.filter(a => a.applicantStatus === 'ACTIVE').length,
                    placed: applicants.filter(a => a.applicantStatus === 'PLACED').length,
                    blacklisted: applicants.filter(a => a.isBlacklisted || a.applicantStatus === 'BLACKLISTED').length,
                    onHold: applicants.filter(a => a.applicantStatus === 'ON_HOLD').length
                };
                setStats(computedStats);

                // Group by status
                const statusCounts = applicants.reduce((acc, curr) => {
                    const status = curr.applicantStatus || 'NEW_LEAD';
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                }, {});

                const formattedStatus = Object.keys(statusCounts).map(key => ({
                    name: key.replace('_', ' '),
                    value: statusCounts[key]
                }));
                setStatusData(formattedStatus);

                // Group by source
                const sourceCounts = applicants.reduce((acc, curr) => {
                    const src = curr.source || 'MANUAL';
                    acc[src] = (acc[src] || 0) + 1;
                    return acc;
                }, {});

                const formattedSource = Object.keys(sourceCounts).map(key => ({
                    name: key,
                    value: sourceCounts[key]
                }));
                setSourceData(formattedSource);

            } catch (err) {
                console.error("Error loading dashboard metrics:", err);
                setError("Failed to load recruitment metrics. Please make sure the backend is active.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        { title: 'Total Applicants', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
        { title: 'New Leads', value: stats.newLeads, icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
        { title: 'Active Pipelines', value: stats.active, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
        { title: 'Placed Candidates', value: stats.placed, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
        { title: 'Blacklisted', value: stats.blacklisted, icon: AlertOctagon, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin h-10 w-10 text-primary" />
                    <p className="text-sm text-foreground-muted font-medium">Analyzing applicant pipelines...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">ATS Dashboard</h1>
                    <p className="text-sm text-foreground-muted">Track your talent acquisition pipelines and candidate stages.</p>
                </div>
                <div className="flex items-center gap-3">
                    {setShowQuickLinks && (
                        <button
                            onClick={() => setShowQuickLinks(true)}
                            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-theme shadow-sm transition-all duration-200"
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            Quick Links
                        </button>
                    )}
                    <span className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Live Metrics
                    </span>
                </div>
            </header>

            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-theme flex items-center gap-3">
                    <AlertOctagon className="h-5 w-5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((card, idx) => (
                    <div key={idx} className={`p-5 rounded-theme border bg-card text-card-foreground shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5`}>
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-semibold text-foreground-muted">{card.title}</span>
                            <div className={`p-2 rounded-theme ${card.bg}`}>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mt-4">{card.value}</h2>
                    </div>
                ))}
            </div>

            {/* Recharts Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status breakdown bar chart */}
                <div className="lg:col-span-2 bg-card border border-border p-6 rounded-theme shadow-sm">
                    <h3 className="text-lg font-bold text-foreground mb-4">Applicant Status Pipeline</h3>
                    <div className="h-[300px]">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-card-foreground)', borderRadius: 'var(--theme-border-radius)', borderColor: 'var(--color-border)' }}
                                    />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-foreground-muted">
                                No applicant status data available. Add applicants to view trends!
                            </div>
                        )}
                    </div>
                </div>

                {/* Candidate Source pie chart */}
                <div className="bg-card border border-border p-6 rounded-theme shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-foreground mb-4">Applicant Sources</h3>
                    </div>
                    <div className="h-[200px] flex items-center justify-center">
                        {sourceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sourceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {sourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-card-foreground)', borderRadius: 'var(--theme-border-radius)', borderColor: 'var(--color-border)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-foreground-muted text-sm text-center">No source distribution data.</div>
                        )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        {sourceData.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                <span className="font-medium truncate text-foreground-muted">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions / Shortcuts */}
            <div className="bg-card border border-border rounded-theme p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-4 font-sans">Recruiter Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link to="/ats-dashboard/applicants" className="flex items-center justify-between p-4 rounded-theme bg-background-muted border border-border hover:border-primary transition-all group">
                        <div>
                            <h4 className="font-bold text-foreground group-hover:text-primary">Manage Applicants</h4>
                            <p className="text-xs text-foreground-muted mt-1">Add, update, or screen candidate profiles</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-foreground-muted group-hover:text-primary transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link to="/ats-dashboard/applicants" className="flex items-center justify-between p-4 rounded-theme bg-background-muted border border-border hover:border-primary transition-all group">
                        <div>
                            <h4 className="font-bold text-foreground group-hover:text-primary">Screen Pipeline</h4>
                            <p className="text-xs text-foreground-muted mt-1">Review education, work history, and certificates</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-foreground-muted group-hover:text-primary transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link to="/ats-settings" className="flex items-center justify-between p-4 rounded-theme bg-background-muted border border-border hover:border-primary transition-all group">
                        <div>
                            <h4 className="font-bold text-foreground group-hover:text-primary">ATS Configurations</h4>
                            <p className="text-xs text-foreground-muted mt-1">Configure degrees, states, and document types</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-foreground-muted group-hover:text-primary transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AtsDashboard;
