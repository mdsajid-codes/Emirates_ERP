import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    BarChart3, Users, PieChart, ShieldAlert, 
    Calendar, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, FileText
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CrmReports = () => {
    const [activeTab, setActiveTab] = useState('leads'); // 'leads', 'activities', 'audit'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Report data states
    const [leadsByStage, setLeadsByStage] = useState([]);
    const [leadsByOwner, setLeadsByOwner] = useState([]);
    const [leadsByStatus, setLeadsByStatus] = useState([]);
    const [activitySummary, setActivitySummary] = useState([]);

    // Audit logs states
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditPage, setAuditPage] = useState(0);
    const [auditTotalPages, setAuditTotalPages] = useState(0);
    const [auditFilter, setAuditFilter] = useState({ action: '', entityType: '', fromDate: '', toDate: '' });

    const token = localStorage.getItem('token');
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const isAdmin = roles.includes('SUPER_ADMIN') || roles.includes('CRM_ADMIN');

    const headers = { Authorization: `Bearer ${token}` };

    const fetchReportData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [stageRes, ownerRes, statusRes, activityRes] = await Promise.all([
                axios.get(`${API_URL}/crm/reports/leads-by-stage`, { headers }),
                axios.get(`${API_URL}/crm/reports/leads-by-owner`, { headers }),
                axios.get(`${API_URL}/crm/reports/leads-by-status`, { headers }),
                axios.get(`${API_URL}/crm/reports/activity-summary`, { headers })
            ]);

            setLeadsByStage(stageRes.data);
            setLeadsByOwner(ownerRes.data);
            setLeadsByStatus(statusRes.data);
            setActivitySummary(activityRes.data);
        } catch (err) {
            console.error("Failed to fetch reports", err);
            setError("Could not load reports data. Please ensure you have sufficient permissions.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAuditLogs = async () => {
        if (!isAdmin) return;
        try {
            const params = {
                page: auditPage,
                size: 15,
                action: auditFilter.action,
                entityType: auditFilter.entityType,
                fromDate: auditFilter.fromDate,
                toDate: auditFilter.toDate
            };
            const res = await axios.get(`${API_URL}/crm/reports/audit-log`, { headers, params });
            setAuditLogs(res.data.content || []);
            setAuditTotalPages(res.data.totalPages || 0);
        } catch (err) {
            console.error("Failed to fetch audit logs", err);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, []);

    useEffect(() => {
        if (activeTab === 'audit') {
            fetchAuditLogs();
        }
    }, [activeTab, auditPage, auditFilter]);

    const maxStageCount = Math.max(...leadsByStage.map(d => d.count), 1);
    const maxOwnerCount = Math.max(...leadsByOwner.map(d => d.count), 1);

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <BarChart3 className="text-primary h-7 w-7" /> CRM Analytics & Reports
                    </h1>
                    <p className="text-sm text-foreground-muted">Track lead statistics, employee productivity, and security trails.</p>
                </div>
                <button 
                    onClick={() => { fetchReportData(); if (activeTab === 'audit') fetchAuditLogs(); }} 
                    className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-theme bg-card hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
                >
                    <RefreshCw size={14} /> Refresh Data
                </button>
            </div>

            {/* Navigation tabs */}
            <div className="flex border-b border-border gap-2">
                <button 
                    onClick={() => setActiveTab('leads')} 
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${activeTab === 'leads' ? 'border-primary text-primary' : 'border-transparent text-foreground-muted hover:text-foreground'}`}
                >
                    Leads Analysis
                </button>
                <button 
                    onClick={() => setActiveTab('activities')} 
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${activeTab === 'activities' ? 'border-primary text-primary' : 'border-transparent text-foreground-muted hover:text-foreground'}`}
                >
                    Activity Summary
                </button>
                {isAdmin && (
                    <button 
                        onClick={() => setActiveTab('audit')} 
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${activeTab === 'audit' ? 'border-primary text-primary' : 'border-transparent text-foreground-muted hover:text-foreground'}`}
                    >
                        Security Audit Log
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-theme border border-red-200 text-sm flex items-center gap-2">
                    <ShieldAlert size={16} /> {error}
                </div>
            )}

            {/* Leads Analysis Tab */}
            {!loading && activeTab === 'leads' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Leads by Stage */}
                    <div className="bg-card border border-border p-6 rounded-theme shadow-sm">
                        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-500" /> Leads by Pipeline Stage
                        </h3>
                        <div className="space-y-4">
                            {leadsByStage.length > 0 ? leadsByStage.map((item, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span>{item.label}</span>
                                        <span>{item.count} leads</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${(item.count / maxStageCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )) : (
                                <div className="text-sm text-foreground-muted py-8 text-center">No lead stage data found.</div>
                            )}
                        </div>
                    </div>

                    {/* Leads by Status */}
                    <div className="bg-card border border-border p-6 rounded-theme shadow-sm">
                        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-rose-500" /> Leads by Status
                        </h3>
                        <div className="space-y-4">
                            {leadsByStatus.length > 0 ? leadsByStatus.map((item, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span>{item.label}</span>
                                        <span>{item.count} leads</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${(item.count / Math.max(...leadsByStatus.map(d => d.count), 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )) : (
                                <div className="text-sm text-foreground-muted py-8 text-center">No status data found.</div>
                            )}
                        </div>
                    </div>

                    {/* Leads by Owner */}
                    <div className="bg-card border border-border p-6 rounded-theme shadow-sm lg:col-span-2">
                        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" /> Leads Distribution by Owner
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {leadsByOwner.length > 0 ? leadsByOwner.map((item, idx) => (
                                <div key={idx} className="space-y-1 bg-slate-50/50 p-3 rounded-theme border border-border/30">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="truncate">{item.label}</span>
                                        <span>{item.count} leads</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${(item.count / maxOwnerCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )) : (
                                <div className="text-sm text-foreground-muted py-8 text-center col-span-2">No owner distribution data found.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Activity Summary Tab */}
            {!loading && activeTab === 'activities' && (
                <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                            <Users className="h-5 w-5 text-emerald-500" /> Employee CRM Activities Summary
                        </h3>
                        <p className="text-xs text-foreground-muted mt-1">A consolidated overview of calls logged, tasks completed, and work emails sent by employee.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-border text-foreground-muted font-bold text-xs uppercase">
                                    <th className="p-4">Employee Name</th>
                                    <th className="p-4 text-center">Calls Logged</th>
                                    <th className="p-4 text-center">Assigned Tasks</th>
                                    <th className="p-4 text-center">Emails Sent</th>
                                    <th className="p-4 text-center">Productivity Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {activitySummary.length > 0 ? activitySummary.map((item, idx) => {
                                    const totalAct = item.calls + item.tasks + item.emailsSent;
                                    let level = 'Low';
                                    let color = 'text-slate-500 bg-slate-100';
                                    if (totalAct > 15) { level = 'High'; color = 'text-success bg-success/15'; }
                                    else if (totalAct > 5) { level = 'Medium'; color = 'text-orange-500 bg-orange-100'; }

                                    return (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="p-4 font-semibold text-foreground">{item.employeeName}</td>
                                            <td className="p-4 text-center font-medium">{item.calls}</td>
                                            <td className="p-4 text-center font-medium">{item.tasks}</td>
                                            <td className="p-4 text-center font-medium">{item.emailsSent}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${color}`}>
                                                    {level} ({totalAct})
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-foreground-muted">No activity summary recorded for employees.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Audit Log Tab */}
            {!loading && activeTab === 'audit' && isAdmin && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="bg-card border border-border p-4 rounded-theme shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-foreground-muted uppercase mb-1">Search Action</label>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-3 text-foreground-muted" />
                                <input 
                                    type="text" 
                                    placeholder="e.g. LEAD_CREATED"
                                    value={auditFilter.action}
                                    onChange={e => setAuditFilter({ ...auditFilter, action: e.target.value })}
                                    className="pl-8 pr-3 py-1.5 w-full text-xs rounded-theme border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-foreground-muted uppercase mb-1">Entity Type</label>
                            <input 
                                type="text" 
                                placeholder="e.g. LEAD or ROLE"
                                value={auditFilter.entityType}
                                onChange={e => setAuditFilter({ ...auditFilter, entityType: e.target.value })}
                                className="px-3 py-1.5 w-full text-xs rounded-theme border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-foreground-muted uppercase mb-1">From Date</label>
                            <input 
                                type="date" 
                                value={auditFilter.fromDate}
                                onChange={e => setAuditFilter({ ...auditFilter, fromDate: e.target.value })}
                                className="px-3 py-1.5 w-full text-xs rounded-theme border border-border bg-slate-50 focus:bg-white focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-foreground-muted uppercase mb-1">To Date</label>
                            <input 
                                type="date" 
                                value={auditFilter.toDate}
                                onChange={e => setAuditFilter({ ...auditFilter, toDate: e.target.value })}
                                className="px-3 py-1.5 w-full text-xs rounded-theme border border-border bg-slate-50 focus:bg-white focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-border text-foreground-muted font-bold text-xs uppercase">
                                        <th className="p-4">Timestamp</th>
                                        <th className="p-4">Action</th>
                                        <th className="p-4">Entity</th>
                                        <th className="p-4">Performed By</th>
                                        <th className="p-4">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {auditLogs.length > 0 ? auditLogs.map((entry, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="p-4 font-mono text-xs text-foreground-muted whitespace-nowrap">
                                                {new Date(entry.performedAt).toLocaleString()}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-bold text-[10px]">
                                                    {entry.action}
                                                </span>
                                            </td>
                                            <td className="p-4 font-semibold text-foreground text-xs whitespace-nowrap">{entry.entityType} ({entry.entityId})</td>
                                            <td className="p-4 text-xs font-medium text-foreground truncate max-w-[150px]">{entry.performedBy}</td>
                                            <td className="p-4 text-xs text-foreground-muted truncate max-w-[300px]" title={entry.description}>{entry.description}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-foreground-muted">No audit trails matched the filters.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {auditTotalPages > 1 && (
                            <div className="p-4 border-t border-border bg-slate-50 flex items-center justify-between">
                                <span className="text-xs text-foreground-muted">Page {auditPage + 1} of {auditTotalPages}</span>
                                <div className="flex gap-2">
                                    <button 
                                        disabled={auditPage === 0} 
                                        onClick={() => setAuditPage(prev => Math.max(0, prev - 1))}
                                        className="p-1 hover:bg-slate-200 disabled:opacity-30 rounded transition-all"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button 
                                        disabled={auditPage >= auditTotalPages - 1} 
                                        onClick={() => setAuditPage(prev => prev + 1)}
                                        className="p-1 hover:bg-slate-200 disabled:opacity-30 rounded transition-all"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            )}
        </div>
    );
};

export default CrmReports;
