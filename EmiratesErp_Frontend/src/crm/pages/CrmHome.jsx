import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, ChevronRight, CheckCircle2, AlertCircle, PhoneCall, Mail, Users, ArrowRight, Activity } from 'lucide-react';
import { useCrmPermissions } from '../context/CrmPermissionsContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CrmHome = () => {
    const { hasPermission } = useCrmPermissions();
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'User';
    const [currentTime, setCurrentTime] = useState(new Date());
    const [recentLeads, setRecentLeads] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, new: 0, converted: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await axios.get(`${API_URL}/crm/leads?size=1000`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const leads = response.data.content || [];

                // Sort by ID or creation date (assuming newer leads have higher IDs or appear last)
                const sortedLeads = [...leads].reverse();
                setRecentLeads(sortedLeads.slice(0, 5));

                const statusCounts = leads.reduce((acc, lead) => {
                    const status = lead.status || 'UNKNOWN';
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                }, {});

                setStats({
                    total: leads.length,
                    active: statusCounts['ACTIVE'] || 0,
                    new: statusCounts['NEW'] || 0,
                    converted: statusCounts['CONVERTED'] || 0
                });

            } catch (err) {
                console.error("Failed to fetch CRM Home data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 60);
        return () => clearInterval(timer);
    }, []);

    const greeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Placeholder for tasks until backend API is ready
    const upcomingTasks = [
        { id: 1, title: 'Follow up with recent leads', time: 'Today', type: 'call', priority: 'medium', status: 'pending' }
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-theme p-6 md:p-8 text-[var(--color-primary-foreground)] shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">{greeting()}, {username}!</h1>
                    <p className="opacity-90 max-w-xl text-sm md:text-base">
                        You have <strong>{stats.new}</strong> new leads and <strong>{stats.active}</strong> active leads to work on. Let's make it a productive day!
                    </p>
                </div>

                {/* Decorative background circles */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-24 right-12 w-48 h-48 bg-white opacity-10 rounded-full blur-xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column - Today's Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card rounded-theme shadow-sm border border-border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    Today's Agenda
                                </h2>
                                <p className="text-sm text-foreground-muted">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                            </div>
                            {hasPermission('EVENT', 'view') && (
                                <button onClick={() => navigate('/crm-dashboard/calendar')} className="text-sm text-primary hover:underline font-medium flex items-center">
                                    View Calendar <ChevronRight className="h-4 w-4 ml-1" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {upcomingTasks.map((task) => (
                                <div key={task.id} className="group flex items-start gap-4 p-4 rounded-theme border border-border bg-background hover:border-primary/50 transition-colors">
                                    <div className="mt-1 flex-shrink-0">
                                        {task.type === 'call' && <div className="p-2 bg-yellow-500/10 text-yellow-600 rounded-full"><PhoneCall className="h-4 w-4" /></div>}
                                        {task.type === 'email' && <div className="p-2 bg-blue-500/10 text-blue-600 rounded-full"><Mail className="h-4 w-4" /></div>}
                                        {task.type === 'meeting' && <div className="p-2 bg-purple-500/10 text-purple-600 rounded-full"><Users className="h-4 w-4" /></div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-semibold text-foreground truncate">{task.title}</p>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-foreground-muted">
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {task.time}</span>
                                            {task.priority === 'high' && <span className="flex items-center gap-1 text-error"><AlertCircle className="h-3 w-3" /> High Priority</span>}
                                        </div>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-foreground-muted hover:text-success rounded-full hover:bg-success/10">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                            {hasPermission('TASK', 'create') && (
                                <button onClick={() => navigate('/crm-dashboard/tasks')} className="w-full py-3 border-2 border-dashed border-border rounded-theme text-foreground-muted hover:text-primary hover:border-primary/50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                                    <Clock className="h-4 w-4" /> Add New Task
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Leads', value: stats.total, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                            { label: 'New Leads', value: stats.new, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                            { label: 'Active Leads', value: stats.active, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                            { label: 'Converted', value: stats.converted, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-card border border-border p-4 rounded-theme text-center">
                                <div className={`inline-flex p-2 rounded-full ${stat.bg} ${stat.color} mb-2`}>
                                    <Activity className="h-4 w-4" />
                                </div>
                                <h4 className="text-xl font-bold text-foreground">{stat.value}</h4>
                                <p className="text-xs text-foreground-muted">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Sidebars */}
                <div className="space-y-6">
                    {/* Recent Leads Widget */}
                    <div className="bg-card rounded-theme shadow-sm border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-foreground">Recent Leads</h3>
                            <button onClick={() => navigate('/crm-dashboard/leads')} className="text-primary hover:text-primary/80"><ArrowRight className="h-5 w-5" /></button>
                        </div>
                        <div className="space-y-4">
                            {loading ? (
                                <p className="text-sm text-foreground-muted">Loading leads...</p>
                            ) : recentLeads.length > 0 ? (
                                recentLeads.map((lead) => (
                                    <div key={lead.id} className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                                            {(lead.firstName || lead.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">{lead.firstName} {lead.lastName}</p>
                                            <p className="text-xs text-foreground-muted truncate">{lead.email || lead.phone || 'No contact info'}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-2 py-1 bg-background-muted text-xs font-medium rounded-theme mb-1">
                                                {lead.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-foreground-muted">No recent leads found.</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Action Widget */}
                    <div className="bg-card rounded-theme shadow-sm border border-border p-6">
                        <h3 className="font-bold text-foreground mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {hasPermission('LEAD', 'create') && (
                                <button onClick={() => navigate('/crm-dashboard/leads')} className="flex flex-col items-center justify-center p-4 rounded-theme bg-background hover:bg-background-muted border border-border transition-colors gap-2 group">
                                    <Users className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-medium text-foreground">Add Lead</span>
                                </button>
                            )}
                            {hasPermission('CALL_LOG', 'create') && (
                                <button onClick={() => navigate('/crm-dashboard/calling-data')} className="flex flex-col items-center justify-center p-4 rounded-theme bg-background hover:bg-background-muted border border-border transition-colors gap-2 group">
                                    <PhoneCall className="h-5 w-5 text-success group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-medium text-foreground">Log Call</span>
                                </button>
                            )}
                            {hasPermission('EMAIL', 'create') && (
                                <button onClick={() => navigate('/crm-dashboard/leads')} className="flex flex-col items-center justify-center p-4 rounded-theme bg-background hover:bg-background-muted border border-border transition-colors gap-2 group">
                                    <Mail className="h-5 w-5 text-info group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-medium text-foreground">Send Email</span>
                                </button>
                            )}
                            {hasPermission('TASK', 'create') && (
                                <button onClick={() => navigate('/crm-dashboard/tasks')} className="flex flex-col items-center justify-center p-4 rounded-theme bg-background hover:bg-background-muted border border-border transition-colors gap-2 group">
                                    <Calendar className="h-5 w-5 text-warning group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-medium text-foreground">Meeting</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrmHome;
