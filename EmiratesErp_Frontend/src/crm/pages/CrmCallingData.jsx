import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Phone,
    Search,
    Plus,
    Calendar,
    Clock,
    User,
    MoreHorizontal,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader,
    PhoneIncoming,
    PhoneOutgoing,
    PhoneMissed,
    CheckCircle2,
    AlertCircle,
    Edit,
    Trash2,
    ExternalLink,
    X,
    Save,
    UserPlus,
    Bell,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCrmPermissions } from '../context/CrmPermissionsContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CallingDataCard = ({ log, onEdit, onDelete, onViewLead, hasPermission }) => {
    return (
        <div className="bg-card rounded-theme border border-border hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-theme flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                            <PhoneOutgoing className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-black text-foreground text-base leading-tight group-hover:text-primary transition-colors">{log.leadName || log.contactName || 'Anonymous Call'}</h4>
                            <div className="flex items-center gap-2 text-[10px] text-foreground-muted mt-1 font-bold uppercase tracking-wider">
                                <User className="h-3 w-3" />
                                <span>{log.employeeName || 'Unassigned'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {hasPermission && hasPermission('CALL_LOG', 'update') && (
                            <button onClick={() => onEdit(log)} className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-full transition-all">
                                <Edit className="h-4 w-4" />
                            </button>
                        )}
                        {hasPermission && hasPermission('CALL_LOG', 'delete') && (
                            <button onClick={() => onDelete(log.id)} className="p-2 text-foreground-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 bg-background border border-border rounded-theme text-[10px] font-black text-foreground-muted uppercase flex items-center gap-1.5 shadow-sm">
                            <Calendar className="h-3 w-3 text-primary" />
                            {log.callDate}
                        </span>
                        <span className="px-3 py-1 bg-background border border-border rounded-theme text-[10px] font-black text-foreground-muted uppercase flex items-center gap-1.5 shadow-sm">
                            <Clock className="h-3 w-3 text-primary" />
                            {log.callTime?.substring(0, 5)}
                        </span>
                    </div>

                    <p className="text-sm text-foreground leading-relaxed line-clamp-3 italic opacity-90">
                        "{log.comments || 'No details captured for this interaction.'}"
                    </p>
                </div>
            </div>

            <div className="px-5 py-3.5 bg-background-muted/50 border-t border-border flex items-center justify-between group-hover:bg-primary/[0.01] transition-colors">
                {log.leadId ? (
                    <button
                        onClick={() => onViewLead(log.leadId)}
                        className="text-[10px] font-black text-primary flex items-center gap-2 hover:gap-3 transition-all uppercase tracking-widest"
                    >
                        View Profile <ArrowRight className="h-3 w-3" />
                    </button>
                ) : (
                    <span className="text-[10px] text-foreground-muted font-black uppercase tracking-tighter">No CRM Link</span>
                )}

                {log.remindMeBefore && (
                    <div className="flex items-center gap-1.5 text-[10px] bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full font-black uppercase tracking-tighter ring-1 ring-amber-500/20">
                        <Bell className="h-3 w-3" /> Reminder
                    </div>
                )}
            </div>
        </div>
    );
};

const CrmCallLogForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        callDate: new Date().toISOString().split('T')[0],
        callTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
        comments: '',
        remindMeBefore: false,
        reminderTime: '',
        leadId: '',
        contactId: '',
        employeeId: ''
    });

    const [leads, setLeads] = useState([]);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                callDate: initialData.callDate || new Date().toISOString().split('T')[0],
                callTime: initialData.callTime ? initialData.callTime.substring(0, 5) : '',
                reminderTime: initialData.reminderTime ? initialData.reminderTime.substring(0, 5) : '',
                leadId: initialData.leadId || '',
                employeeId: initialData.employeeId || '',
            });
        }

        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            try {
                const [leadsRes, empsRes] = await Promise.all([
                    axios.get(`${API_URL}/crm/leads?size=1000`, { headers }),
                    axios.get(`${API_URL}/employees/all`, { headers })
                ]);
                setLeads(leadsRes.data.content || []);
                setEmployees(empsRes.data || []);
            } catch (err) {
                console.error("Failed to fetch form data", err);
            }
        };
        fetchData();
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-card">
            <div className="flex-1 p-8 space-y-8 overflow-y-auto">
                <div className="space-y-8">
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-1 w-8 bg-primary rounded-full"></div>
                            <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Call Schedule</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground-muted ml-1">Date *</label>
                                <div className="relative group">
                                    <input
                                        type="date"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm group-hover:border-primary/50"
                                        value={formData.callDate}
                                        onChange={e => setFormData({ ...formData, callDate: e.target.value })}
                                    />
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground-muted ml-1">Time</label>
                                <div className="relative group">
                                    <input
                                        type="time"
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm group-hover:border-primary/50"
                                        value={formData.callTime}
                                        onChange={e => setFormData({ ...formData, callTime: e.target.value })}
                                    />
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-1 w-8 bg-primary rounded-full"></div>
                            <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Ownership</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground-muted ml-1">Related Lead</label>
                                <div className="relative group">
                                    <select
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm appearance-none group-hover:border-primary/50"
                                        value={formData.leadId}
                                        onChange={e => setFormData({ ...formData, leadId: e.target.value })}
                                    >
                                        <option value="">Select a Lead</option>
                                        {leads.map(lead => (
                                            <option key={lead.id} value={lead.id}>{lead.firstName} {lead.lastName}</option>
                                        ))}
                                    </select>
                                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted group-focus-within:text-primary transition-colors pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground-muted ml-1">Assignee</label>
                                <div className="relative group">
                                    <select
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm appearance-none group-hover:border-primary/50"
                                        value={formData.employeeId}
                                        onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                        ))}
                                    </select>
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted group-focus-within:text-primary transition-colors pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-1 w-8 bg-primary rounded-full"></div>
                            <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Engagement</h4>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground-muted ml-1">Interaction Notes</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm min-h-[140px] resize-none hover:border-primary/50"
                                    placeholder="Summarize the discussion points..."
                                    value={formData.comments}
                                    onChange={e => setFormData({ ...formData, comments: e.target.value })}
                                />
                            </div>

                            <div className={`flex flex-col gap-3 p-4 rounded-theme border transition-all ${formData.remindMeBefore ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-background-muted border-border'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${formData.remindMeBefore ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground-muted'}`}>
                                            <Bell className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">Follow-up Reminder</p>
                                            <p className="text-[10px] text-foreground-muted uppercase font-black">Enable notification</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, remindMeBefore: !formData.remindMeBefore })}
                                        className={`w-12 h-6 rounded-full transition-all relative ${formData.remindMeBefore ? 'bg-primary' : 'bg-foreground-muted/30'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.remindMeBefore ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                {formData.remindMeBefore && (
                                    <div className="pt-3 mt-3 border-t border-primary/10 flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
                                        <label className="text-xs font-bold text-primary">Alert Time</label>
                                        <input
                                            type="time"
                                            className="px-3 py-1.5 bg-background border border-primary/20 rounded-theme text-xs outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                                            value={formData.reminderTime}
                                            onChange={e => setFormData({ ...formData, reminderTime: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <div className="p-6 bg-background border-t border-border flex gap-4">
                <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-theme border border-border text-foreground-muted hover:bg-background-muted hover:text-foreground transition-all font-bold text-sm">
                    Discard
                </button>
                <button type="submit" className="flex-[1.5] py-3 rounded-theme bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-95">
                    <Save className="h-5 w-5" /> Confirm Log
                </button>
            </div>
        </form>
    );
};

const CrmCallingData = () => {
    const { hasPermission } = useCrmPermissions();
    const navigate = useNavigate();
    const [callLogs, setCallLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, today: 0, scheduled: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Form & Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCallLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/crm/call-logs`, {
                params: { page: currentPage, size: 12, sort: 'callDate,desc' },
                headers: { "Authorization": `Bearer ${token}` }
            });
            setCallLogs(response.data.content);
            setTotalPages(response.data.totalPages);

            const today = new Date().toISOString().split('T')[0];
            setStats({
                total: response.data.totalElements,
                today: response.data.content.filter(l => l.callDate === today).length,
                scheduled: response.data.content.filter(l => new Date(l.callDate) > new Date()).length
            });
        } catch (error) {
            console.error("Failed to fetch call logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCallLogs();
    }, [currentPage]);

    const filteredLogs = useMemo(() => {
        if (!searchTerm) return callLogs;
        const lower = searchTerm.toLowerCase();
        return callLogs.filter(log =>
            (log.leadName?.toLowerCase().includes(lower)) ||
            (log.employeeName?.toLowerCase().includes(lower)) ||
            (log.comments?.toLowerCase().includes(lower))
        );
    }, [callLogs, searchTerm]);

    const handleSave = async (formData) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };

            // Format time fields for backend (expected HH:mm:ss)
            const payload = {
                ...formData,
                callTime: formData.callTime ? formData.callTime + ":00" : null,
                reminderTime: formData.reminderTime ? formData.reminderTime + ":00" : null,
                leadId: formData.leadId ? parseInt(formData.leadId) : null,
                employeeId: formData.employeeId ? parseInt(formData.employeeId) : null,
            };

            if (editingLog) {
                await axios.put(`${API_URL}/crm/call-logs/${editingLog.id}`, payload, { headers });
            } else {
                await axios.post(`${API_URL}/crm/call-logs`, payload, { headers });
            }

            setIsDrawerOpen(false);
            setEditingLog(null);
            fetchCallLogs();
        } catch (error) {
            console.error("Failed to save call log", error);
            alert("Failed to save call log. Please check your inputs.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this call log?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/crm/call-logs/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchCallLogs();
        } catch (error) {
            alert('Failed to delete call log.');
        }
    };

    const handleEdit = (log) => {
        setEditingLog(log);
        setIsDrawerOpen(true);
    };

    return (
        <>
            <div className="min-h-screen space-y-6">
                {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary rounded-full shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.5)]"></div>
                    <h1 className="text-2xl font-black text-foreground tracking-tighter uppercase">Calling <span className="text-primary">Data</span></h1>
                    <p className="text-xs text-foreground-muted mt-1 font-bold uppercase tracking-widest opacity-70">Engagement & Interaction Logs</p>
                </div>
                <div className="flex items-center gap-3">
                    {hasPermission('CALL_LOG', 'create') && (
                        <button
                            onClick={() => { setEditingLog(null); setIsDrawerOpen(true); }}
                            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-theme font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 active:scale-95 group text-xs"
                        >
                            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" /> Log Interaction
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                    { label: 'Total Logs', value: stats.total, icon: Phone, color: 'blue', desc: 'All Interactions' },
                    { label: "Today", value: stats.today, icon: PhoneIncoming, color: 'green', desc: 'Active Records' },
                    { label: 'Scheduled', value: stats.scheduled, icon: Calendar, color: 'purple', desc: 'Future Tasks' }
                ].map((stat, i) => (
                    <div key={i} className="bg-card rounded-theme border border-border p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-xl hover:-translate-y-1 group overflow-hidden relative">
                        {/* Background Decor */}
                        <div className={`absolute -right-3 -bottom-3 opacity-[0.04] group-hover:scale-125 transition-transform duration-500 text-foreground`}>
                            <stat.icon className="h-20 w-20" />
                        </div>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`p-3.5 rounded-theme shadow-lg group-hover:rotate-6 transition-transform duration-300 ${stat.color === 'blue' ? 'bg-blue-500 text-white shadow-blue-500/20' :
                                    stat.color === 'green' ? 'bg-green-500 text-white shadow-green-500/20' :
                                        'bg-purple-500 text-white shadow-purple-500/20'
                                }`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.1em]">{stat.label}</p>
                                <p className="text-2xl font-black text-foreground mt-0.5 tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                        <div className="text-right hidden xl:block relative z-10">
                            <span className="text-[9px] font-bold text-foreground-muted bg-background px-2 py-1 rounded-full border border-border uppercase tracking-tighter">
                                {stat.desc}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="bg-card/50 backdrop-blur-md rounded-theme border border-border p-3 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-4 z-20">
                <div className="relative w-full sm:w-80 group">
                    <input
                        type="text"
                        placeholder="Search interaction logs..."
                        className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-theme outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold group-hover:border-primary/30"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted group-focus-within:text-primary transition-colors" />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-background border border-border rounded-theme text-foreground font-black uppercase tracking-tighter hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all text-[10px]">
                        <Filter className="h-4 w-4" /> Advance Filters
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-background border border-border rounded-theme text-foreground font-black uppercase tracking-tighter hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all text-[10px]">
                        <Calendar className="h-4 w-4" /> Timeline
                    </button>
                </div>
            </div>

            {/* Call Logs Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card rounded-theme border border-border shadow-sm">
                    <div className="relative">
                        <Loader className="h-8 w-8 text-primary animate-spin" />
                        <Phone className="h-3.5 w-3.5 text-primary absolute inset-0 m-auto" />
                    </div>
                    <p className="mt-3 text-[10px] font-black text-foreground-muted uppercase tracking-widest animate-pulse">Syncing Records...</p>
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card rounded-theme border border-border shadow-sm text-center px-4">
                    <div className="w-16 h-16 bg-background-muted rounded-full flex items-center justify-center mb-6 ring-4 ring-background">
                        <PhoneMissed className="h-8 w-8 text-foreground-muted/30" />
                    </div>
                    <h3 className="text-lg font-black text-foreground tracking-tight uppercase">No logs found</h3>
                    <p className="text-[10px] text-foreground-muted mt-2 max-w-xs mx-auto leading-relaxed font-bold uppercase opacity-60">
                        Try adjusting filters to see more results.
                    </p>
                    <button
                        onClick={() => { setSearchTerm(''); fetchCallLogs(); }}
                        className="mt-6 text-[10px] text-primary font-black hover:underline underline-offset-4 flex items-center gap-1.5 mx-auto uppercase tracking-widest"
                    >
                        <X className="h-3 w-3" /> Clear filters
                    </button>
                </div>
            ) : (
                <div className="space-y-8 pb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredLogs.map(log => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={log.id}
                            >
                                <CallingDataCard
                                    log={log}
                                    onDelete={handleDelete}
                                    onEdit={handleEdit}
                                    onViewLead={(id) => navigate(`/crm-dashboard/leads/${id}`)}
                                    hasPermission={hasPermission}
                                />
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between py-6 border-t border-border mt-8">
                            <p className="text-sm font-bold text-foreground-muted">Showing page {currentPage + 1} of {totalPages}</p>
                            <div className="flex items-center gap-3">
                                <button
                                    disabled={currentPage === 0}
                                    onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 0); }}
                                    className="p-3 bg-card border border-border rounded-theme text-foreground-muted hover:bg-background-muted hover:text-foreground disabled:opacity-30 transition-all active:scale-90"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    disabled={currentPage === totalPages - 1}
                                    onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 0); }}
                                    className="p-3 bg-card border border-border rounded-theme text-foreground-muted hover:bg-background-muted hover:text-foreground disabled:opacity-30 transition-all active:scale-90"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Right Side Drawer for Form */}
        <AnimatePresence>
            {isDrawerOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                        onClick={() => setIsDrawerOpen(false)}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-screen w-[480px] bg-card shadow-2xl z-[9999] border-l border-border flex flex-col"
                    >
                        <div className="p-5 border-b border-border flex items-center justify-between bg-card">
                            <div>
                                <h3 className="text-lg font-black text-foreground tracking-tight uppercase leading-none">Log Interaction</h3>
                                <p className="text-[10px] text-foreground-muted font-bold mt-1.5 uppercase tracking-widest opacity-60">Interaction Details</p>
                            </div>
                            <button 
                                onClick={() => setIsDrawerOpen(false)}
                                className="p-2 hover:bg-background-muted rounded-full transition-colors text-foreground-muted hover:text-foreground"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-hidden relative">
                            {isSubmitting && (
                                <div className="absolute inset-0 bg-card/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                    <Loader className="h-8 w-8 text-primary animate-spin" />
                                </div>
                            )}
                            <CrmCallLogForm 
                                initialData={editingLog} 
                                onSave={handleSave} 
                                onCancel={() => setIsDrawerOpen(false)} 
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
        </>
    );
};

export default CrmCallingData;
