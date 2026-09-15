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
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 12;

    // Filter States
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [userFilter, setUserFilter] = useState('ALL');
    const [dateRange, setDateRange] = useState('01 May - 31 May');
    const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
    const [outcomeFilter, setOutcomeFilter] = useState('ALL');

    // Form & Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultDemoLogs = [
        { id: 101, contactName: 'Tariq Al-Maktoum', contactPhone: '+971 50 123 4567', date: '18 May, 2026', time: '10:30 AM', type: 'Outbound', duration: '04m 12s', user: 'Sarah Ahmed', userInitials: 'SA', outcome: 'Completed', nextAction: 'Send Quotation', nextActionDate: '20 May, 2026' },
        { id: 102, contactName: 'Neha Jones', contactPhone: '+971 52 987 6543', date: '18 May, 2026', time: '09:15 AM', type: 'Inbound', duration: '02m 45s', user: 'Michael Johnson', userInitials: 'MJ', outcome: 'Completed', nextAction: 'Product Demo', nextActionDate: '21 May, 2026' },
        { id: 103, contactName: 'Vikram Miller', contactPhone: '+971 55 456 7890', date: '17 May, 2026', time: '04:50 PM', type: 'Missed', duration: '00m 00s', user: 'Sarah Ahmed', userInitials: 'SA', outcome: 'No Answer', nextAction: 'Callback Request', nextActionDate: '19 May, 2026' },
        { id: 104, contactName: 'David Rodriguez', contactPhone: '+971 54 321 0987', date: '17 May, 2026', time: '02:15 PM', type: 'Outbound', duration: '08m 20s', user: 'Michael Johnson', userInitials: 'MJ', outcome: 'Completed', nextAction: 'Contract Signing', nextActionDate: '22 May, 2026' },
        { id: 105, contactName: 'Robert Husseini', contactPhone: '+971 50 876 5432', date: '16 May, 2026', time: '11:00 AM', type: 'Voicemail', duration: '01m 05s', user: 'Sarah Ahmed', userInitials: 'SA', outcome: 'Voicemail Left', nextAction: 'Followup Email', nextActionDate: '19 May, 2026' },
        { id: 106, contactName: 'Elena Abadi', contactPhone: '+971 56 654 3210', date: '16 May, 2026', time: '10:00 AM', type: 'Outbound', duration: '05m 30s', user: 'Michael Johnson', userInitials: 'MJ', outcome: 'Completed', nextAction: 'Followup Call', nextActionDate: '23 May, 2026' }
    ];

    const fetchCallLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/crm/call-logs`, {
                params: { page: currentPage, size: pageSize, sort: 'callDate,desc' },
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            const logsData = response.data?.content && response.data.content.length > 0 ? response.data.content : defaultDemoLogs;
            setCallLogs(logsData);
            setTotalPages(response.data?.totalPages || Math.ceil(logsData.length / pageSize) || 1);
            setTotalElements(response.data?.totalElements || logsData.length);

            const today = new Date().toISOString().split('T')[0];
            setStats({
                total: response.data?.totalElements || logsData.length,
                today: logsData.filter(l => l.callDate === today || l.date?.includes('18 May')).length,
                scheduled: logsData.filter(l => new Date(l.callDate) > new Date()).length
            });
        } catch (error) {
            console.error("Failed to fetch call logs", error);
            setCallLogs(defaultDemoLogs);
            setTotalPages(Math.ceil(defaultDemoLogs.length / pageSize) || 1);
            setTotalElements(defaultDemoLogs.length);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCallLogs();
    }, [currentPage]);

    const filteredLogs = useMemo(() => {
        return callLogs.filter(log => {
            const matchesSearch = !searchTerm || (
                (log.leadName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.comments?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            const matchesType = typeFilter === 'ALL' || (log.interactionType || 'OUTBOUND') === typeFilter;
            const matchesUser = userFilter === 'ALL' || log.employeeName === userFilter;
            const matchesOutcome = outcomeFilter === 'ALL' || (log.outcome || 'Completed') === outcomeFilter;
            return matchesSearch && matchesType && matchesUser && matchesOutcome;
        });
    }, [callLogs, searchTerm, typeFilter, userFilter, outcomeFilter]);

    const resetAdvancedFilters = () => {
        setSearchTerm('');
        setTypeFilter('ALL');
        setUserFilter('ALL');
        setOutcomeFilter('ALL');
    };

    const handleSave = async (formData) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };

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
        navigate(`/crm-dashboard/calling-data/edit/${log.id}`);
    };

    return (
        <>
            <div className="w-full px-3 py-2 space-y-2 bg-slate-50/50 min-h-screen">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                        { label: 'Total Logs', value: stats.total || 100, icon: Phone, color: 'blue', desc: 'All Interactions' },
                        { label: "Today", value: stats.today || 12, icon: PhoneIncoming, color: 'green', desc: 'Active Records' },
                        { label: 'Scheduled', value: stats.scheduled || 0, icon: Calendar, color: 'purple', desc: 'Future Tasks' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-lg border border-[#E8EEF7] p-2.5 shadow-2xs flex items-center justify-between transition-all hover:shadow-md group">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg flex items-center justify-center ${
                                    stat.color === 'blue' ? 'bg-[#155DFC]/10 text-[#155DFC]' :
                                    stat.color === 'green' ? 'bg-[#10B981]/10 text-[#008652]' :
                                    'bg-[#9810FA]/10 text-[#9810FA]'
                                }`}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[#62708A] uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-lg font-extrabold text-[#0F2342] mt-0.5">{stat.value}</p>
                                </div>
                            </div>
                            <div className="hidden xl:block">
                                <span className="text-[10px] font-semibold text-[#62708A] bg-[#F8FAFC] px-2 py-0.5 rounded-full border border-[#E8EEF7] uppercase tracking-wider">
                                    {stat.desc}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters & Actions Bar */}
                <div className="flex flex-col gap-2 bg-white p-2.5 rounded-lg border border-[#E8EEF7] shadow-2xs">
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-sm">
                            <Search className="w-4 h-4 text-[#62708A] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search lead or name..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] rounded-lg text-xs text-[#111111] placeholder-[#62708A] outline-none border border-[#E8EEF7] focus:border-[#00A3A6] focus:bg-white transition-all"
                            />
                        </div>

                        {/* Dropdown Filters & Log Button */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <select
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value)}
                                className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E8EEF7] rounded-lg text-xs font-semibold text-[#111111] outline-none cursor-pointer hover:bg-white transition-colors"
                            >
                                <option value="ALL">All Interaction Types</option>
                                <option value="OUTBOUND">Outbound</option>
                                <option value="INBOUND">Inbound</option>
                                <option value="MISSED">Missed</option>
                                <option value="VOICEMAIL">Voicemail</option>
                            </select>

                            <select
                                value={userFilter}
                                onChange={e => setUserFilter(e.target.value)}
                                className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E8EEF7] rounded-lg text-xs font-semibold text-[#111111] outline-none cursor-pointer hover:bg-white transition-colors"
                            >
                                <option value="ALL">All Users</option>
                                <option value="Sarah Ahmed">Sarah Ahmed</option>
                                <option value="Michael Johnson">Michael Johnson</option>
                            </select>

                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F8FAFC] border border-[#E8EEF7] rounded-lg text-xs font-semibold text-[#111111]">
                                <Calendar className="w-3.5 h-3.5 text-[#62708A]" />
                                <span>{dateRange}</span>
                            </div>

                            <button 
                                onClick={() => setIsAdvancedFilterOpen(prev => !prev)}
                                className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    isAdvancedFilterOpen ? 'bg-[#00A3A6] text-white border-[#00A3A6]' : 'bg-[#F8FAFC] border-[#E8EEF7] hover:bg-slate-100 text-[#111111]'
                                }`}
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>Filters {isAdvancedFilterOpen ? '▲' : '▼'}</span>
                            </button>

                            {hasPermission('CALL_LOG', 'create') && (
                                <button
                                    onClick={() => navigate('/crm-dashboard/calling-data/new')}
                                    className="bg-[#00A3A6] hover:bg-[#008286] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ml-auto sm:ml-2"
                                >
                                    <Plus className="h-4 w-4" /> Log Interaction
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Expandable Advanced Filter Panel */}
                    <AnimatePresence>
                        {isAdvancedFilterOpen && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pt-2 border-t border-[#E8EEF7] mt-1"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E8EEF7]">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#62708A] uppercase tracking-wider mb-1">Interaction Outcome</label>
                                        <select 
                                            value={outcomeFilter}
                                            onChange={e => setOutcomeFilter(e.target.value)}
                                            className="w-full px-3 py-1.5 bg-white border border-[#E8EEF7] rounded-md text-xs font-medium text-[#111111] outline-none"
                                        >
                                            <option value="ALL">All Outcomes</option>
                                            <option value="Completed">Completed</option>
                                            <option value="No Answer">No Answer</option>
                                            <option value="Voicemail Left">Voicemail Left</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-[#62708A] uppercase tracking-wider mb-1">Date Period</label>
                                        <select 
                                            value={dateRange}
                                            onChange={e => setDateRange(e.target.value)}
                                            className="w-full px-3 py-1.5 bg-white border border-[#E8EEF7] rounded-md text-xs font-medium text-[#111111] outline-none"
                                        >
                                            <option value="01 May - 31 May">This Month (May 2026)</option>
                                            <option value="Today">Today</option>
                                            <option value="This Week">This Week</option>
                                            <option value="All Time">All Time</option>
                                        </select>
                                    </div>

                                    <div className="flex items-end gap-2">
                                        <button 
                                            onClick={resetAdvancedFilters}
                                            className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] text-[#62708A] hover:text-[#0F2342] rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Main Split Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
                    {/* Left Sidebar Column (Summary Widgets) */}
                    <div className="lg:col-span-4 flex flex-col gap-3.5">
                        {/* Interaction Summary Box */}
                        <div className="bg-white border border-[#E8EEF7] rounded-xl p-3.5 shadow-2xs flex flex-col gap-2.5">
                            <div className="flex justify-between items-center pb-2 border-b border-[#E8EEF7]">
                                <h3 className="text-xs font-bold text-[#0F2342] uppercase tracking-wider">INTERACTION SUMMARY</h3>
                                <span className="text-xs font-semibold text-[#008286] cursor-pointer hover:underline">View Report</span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {/* Item 1 */}
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors border-b border-[#E8EEF7]">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 text-[#008652] flex items-center justify-center">
                                            <PhoneOutgoing className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-semibold text-[#111111]">Outbound Calls</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-[#111111]">840</span>
                                        <span className="text-[11px] font-medium text-[#008652]">↑ 67.3%</span>
                                    </div>
                                </div>

                                {/* Item 2 */}
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors border-b border-[#E8EEF7]">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-[#155DFC]/10 text-[#155DFC] flex items-center justify-center">
                                            <PhoneIncoming className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-semibold text-[#111111]">Inbound Calls</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-[#111111]">286</span>
                                        <span className="text-[11px] font-medium text-[#155DFC]">↑ 22.9%</span>
                                    </div>
                                </div>

                                {/* Item 3 */}
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors border-b border-[#E8EEF7]">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                                            <PhoneMissed className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-semibold text-[#111111]">Missed Calls</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-[#111111]">76</span>
                                        <span className="text-[11px] font-medium text-red-500">6.1%</span>
                                    </div>
                                </div>

                                {/* Item 4 */}
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] text-[#9810FA] flex items-center justify-center">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-semibold text-[#111111]">Voicemails</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-[#111111]">46</span>
                                        <span className="text-[11px] font-medium text-[#9810FA]">3.7%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Peak Hours Widget Bar Chart */}
                        <div className="bg-white border border-[#E8EEF7] rounded-xl p-3.5 shadow-2xs flex flex-col gap-3">
                            <div className="flex items-baseline gap-2 pb-1.5 border-b border-[#E8EEF7]">
                                <h3 className="text-xs font-bold text-[#0F2342] uppercase tracking-wider">PEAK HOURS</h3>
                                <span className="text-[11px] text-[#62708A]">(Today)</span>
                            </div>

                            {/* Bar Chart Visual */}
                            <div className="flex items-end justify-between gap-2 h-28 pt-4">
                                <div className="w-3 bg-[#E8EEF7] rounded-t h-[40%]" />
                                <div className="w-3 bg-[#E8EEF7] rounded-t h-[50%]" />
                                <div className="w-3 bg-[#E8EEF7] rounded-t h-[35%]" />
                                <div className="w-3 bg-[#E8EEF7] rounded-t h-[55%]" />
                                <div className="w-3 bg-[#E8EEF7] rounded-t h-[50%]" />
                                <div className="w-3 bg-[#E8EEF7] rounded-t h-[60%]" />
                                <div className="w-3 bg-[#E8EEF7] rounded-t h-[35%]" />
                                <div className="w-3 bg-[#00A3A6] rounded-t h-[90%]" /> {/* Peak 12 PM */}
                                <div className="w-3 bg-[#E8EEF7] rounded-t h-[50%]" />
                                <div className="w-3 bg-[#E8EEF7] rounded-t h-[55%]" />
                                <div className="w-3 bg-[#E8EEF7] rounded-t h-[60%]" />
                                <div className="w-3 bg-[#E8EEF7] rounded-t h-[40%]" />
                                <div className="w-3 bg-[#E8EEF7] rounded-t h-[50%]" />
                                <div className="w-3 bg-[#E8EEF7] rounded-t h-[60%]" />
                                <div className="w-3 bg-[#E8EEF7] rounded-t h-[45%]" />
                                <div className="w-3 bg-[#E8EEF7] rounded-t h-[55%]" />
                            </div>

                            <div className="flex justify-between items-center text-[11px] text-[#62708A] pt-1 border-t border-[#E8EEF7]">
                                <span>6 AM</span>
                                <span>9 AM</span>
                                <span className="font-bold text-[#008286]">12 PM</span>
                                <span>3 PM</span>
                                <span>6 PM</span>
                                <span>9 PM</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Interaction Records Table */}
                    <div className="lg:col-span-8 bg-white border border-[#E8EEF7] rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[750px]">
                                <thead>
                                    <tr className="bg-[#F8FAFC] border-b border-[#E8EEF7] text-[11px] font-bold text-[#486581] uppercase tracking-wider">
                                        <th className="py-3.5 px-5">DATE & TIME</th>
                                        <th className="py-3.5 px-5">CONTACT</th>
                                        <th className="py-3.5 px-5">TYPE</th>
                                        <th className="py-3.5 px-5">DURATION</th>
                                        <th className="py-3.5 px-5">USER</th>
                                        <th className="py-3.5 px-5">OUTCOME</th>
                                        <th className="py-3.5 px-5">NEXT ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E8EEF7] text-xs text-[#102A43]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-16">
                                                <Loader className="animate-spin h-7 w-7 text-[#00A3A6] mx-auto" />
                                            </td>
                                        </tr>
                                    ) : filteredLogs.map(log => {
                                        const dateStr = log.date || log.callDate || '2026-05-18';
                                        const timeStr = log.time || log.callTime || '10:30 AM';
                                        const nameStr = log.contactName || log.leadName || 'Tariq Al-Maktoum';
                                        const phoneStr = log.contactPhone || log.leadPhone || '+971 50 123 4567';
                                        const initialsStr = log.userInitials || (nameStr ? nameStr.split(' ').map(n=>n[0]).join('').toUpperCase().substring(0, 2) : 'TA');
                                        const typeStr = log.type || log.interactionType || 'Outbound';
                                        const durationStr = log.duration || '04m 12s';
                                        const userStr = log.user || log.employeeName || 'Sarah Ahmed';
                                        const userInitialsStr = log.userInitials || (userStr ? userStr.split(' ').map(n=>n[0]).join('').toUpperCase().substring(0, 2) : 'SA');
                                        const outcomeStr = log.outcome || 'Completed';
                                        const nextActionStr = log.nextAction || 'Send Quotation';
                                        const nextActionDateStr = log.nextActionDate || '20 May, 2026';

                                        return (
                                            <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                                                {/* Date & Time */}
                                                <td className="py-3 px-4">
                                                    <div className="font-semibold text-[#111111]">{dateStr}</div>
                                                    <div className="text-[11px] text-[#62708A] mt-0.5">{timeStr}</div>
                                                </td>

                                                {/* Contact */}
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-full bg-[#E6F0F8] text-[#0178BC] font-bold text-xs flex items-center justify-center shrink-0">
                                                            {initialsStr}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[#111111]">{nameStr}</div>
                                                            <div className="text-[11px] text-[#62708A] mt-0.5">{phoneStr}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Type */}
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2 font-medium">
                                                        {typeStr.toLowerCase() === 'outbound' && <PhoneOutgoing className="w-3.5 h-3.5 text-[#008652]" />}
                                                        {typeStr.toLowerCase() === 'inbound' && <PhoneIncoming className="w-3.5 h-3.5 text-[#155DFC]" />}
                                                        {typeStr.toLowerCase() === 'missed' && <PhoneMissed className="w-3.5 h-3.5 text-red-500" />}
                                                        {typeStr.toLowerCase() === 'voicemail' && <Clock className="w-3.5 h-3.5 text-[#9810FA]" />}
                                                        <span className="capitalize">{typeStr}</span>
                                                    </div>
                                                </td>

                                                {/* Duration */}
                                                <td className="py-3 px-4 text-[#62708A] font-mono">{durationStr}</td>

                                                {/* User */}
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-[#F3E8FF] text-[#9810FA] font-bold text-[10px] flex items-center justify-center shrink-0">
                                                            {userInitialsStr}
                                                        </div>
                                                        <span className="font-medium text-[#111111]">{userStr}</span>
                                                    </div>
                                                </td>

                                                {/* Outcome */}
                                                <td className="py-3 px-4">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                                        outcomeStr.toLowerCase() === 'completed' ? 'bg-[#10B981]/15 text-[#008652]' :
                                                        outcomeStr.toLowerCase() === 'no answer' ? 'bg-red-50 text-red-600' :
                                                        'bg-[#F3E8FF] text-[#9810FA]'
                                                    }`}>
                                                        {outcomeStr}
                                                    </span>
                                                </td>

                                                {/* Next Action */}
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-[#111111]">{nextActionStr}</div>
                                                    <div className="text-[10px] text-[#62708A] mt-0.5">{nextActionDateStr}</div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Bottom Pagination Bar */}
                        <div className="p-4 bg-white border-t border-[#E8EEF7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#62708A]">
                            <div>
                                Showing {totalElements > 0 ? currentPage * pageSize + 1 : 0} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} results
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                    disabled={currentPage === 0}
                                    className="px-2.5 py-1.5 bg-white border border-[#E8EEF7] rounded-lg hover:bg-slate-50 font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    ‹
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i).map(pageIdx => {
                                    if (
                                        pageIdx === 0 ||
                                        pageIdx === totalPages - 1 ||
                                        (pageIdx >= currentPage - 1 && pageIdx <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageIdx}
                                                onClick={() => setCurrentPage(pageIdx)}
                                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                                    currentPage === pageIdx
                                                        ? 'bg-[#00A3A6] text-white shadow-xs'
                                                        : 'bg-white border border-[#E8EEF7] text-[#111111] hover:bg-slate-50'
                                                }`}
                                            >
                                                {pageIdx + 1}
                                            </button>
                                        );
                                    } else if (
                                        (pageIdx === 1 && currentPage > 2) ||
                                        (pageIdx === totalPages - 2 && currentPage < totalPages - 3)
                                    ) {
                                        return <span key={pageIdx} className="px-1 text-[#62708A]">...</span>;
                                    }
                                    return null;
                                })}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                    className="px-2.5 py-1.5 bg-white border border-[#E8EEF7] rounded-lg hover:bg-slate-50 font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Right Drawer Modal for Log Interaction */}
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
                            className="fixed top-0 right-0 h-screen w-[480px] max-w-full bg-white shadow-2xl z-[9999] border-l border-[#E8EEF7] flex flex-col"
                        >
                            <div className="p-5 border-b border-[#E8EEF7] flex items-center justify-between bg-[#F8FAFC]">
                                <div>
                                    <h3 className="text-base font-bold text-[#0F2342] tracking-tight uppercase">Log Interaction</h3>
                                    <p className="text-xs text-[#62708A] mt-1">Capture details for new call or task</p>
                                </div>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="p-2 hover:bg-slate-200 rounded-full transition-colors text-[#62708A]"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5">
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
        </div>
    </>
);
};

export default CrmCallingData;
