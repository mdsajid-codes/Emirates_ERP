import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Calendar, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    PhoneCall, 
    Mail, 
    Users, 
    MessageSquare,
    Search,
    Filter,
    Plus,
    Loader,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    User,
    ArrowRight
} from 'lucide-react';
import { useCrmPermissions } from '../context/CrmPermissionsContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CrmTasks = () => {
    const navigate = useNavigate();
    const { hasPermission } = useCrmPermissions();
    const [tasks, setTasks] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const authHeaders = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchTasksAndLeads = async () => {
        setLoading(true);
        try {
            const [tasksRes, leadsRes] = await Promise.all([
                axios.get(`${API_URL}/crm/tasks`, { headers: authHeaders }),
                axios.get(`${API_URL}/crm/leads?size=1000`, { headers: authHeaders })
            ]);

            setTasks(tasksRes.data || []);
            setLeads(leadsRes.data?.content || leadsRes.data || []);
        } catch (err) {
            console.error("Failed to fetch tasks or leads", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasksAndLeads();
    }, []);

    const leadMap = useMemo(() => {
        const map = {};
        leads.forEach(lead => {
            map[lead.id] = {
                name: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || lead.name || 'Unknown Lead',
                company: lead.companyName || ''
            };
        });
        return map;
    }, [leads]);

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await axios.delete(`${API_URL}/crm/tasks/${taskId}`, { headers: authHeaders });
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (err) {
            console.error("Failed to delete task", err);
            alert("Failed to delete task.");
        }
    };

    const getSubjectBadge = (subject) => {
        switch (subject?.toUpperCase()) {
            case 'CALL':
                return <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1"><PhoneCall size={12} /> Call Follow-up</span>;
            case 'EMAIL':
                return <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1"><Mail size={12} /> Email Outreach</span>;
            case 'MEETING':
                return <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1"><Users size={12} /> Client Meeting</span>;
            default:
                return <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1"><MessageSquare size={12} /> {subject || 'Task'}</span>;
        }
    };

    const getStatusBadge = (status) => {
        if (!status) return <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold text-[10px]">PENDING</span>;

        switch (status.toUpperCase()) {
            case 'COMPLETED':
                return <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1"><CheckCircle2 size={12} /> Completed</span>;
            case 'IN_PROGRESS':
                return <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold text-[10px]">In Progress</span>;
            case 'OVERDUE':
                return <span className="px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1"><AlertCircle size={12} /> Overdue</span>;
            default:
                return <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold text-[10px]">{status}</span>;
        }
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const leadInfo = leadMap[task.leadId]?.name || '';
            const matchesSearch = 
                (task.comments || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                (task.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                leadInfo.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [tasks, searchTerm, filterStatus, leadMap]);

    // Pagination Calculations
    const totalItems = filteredTasks.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, itemsPerPage]);

    const paginatedTasks = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredTasks.slice(start, start + itemsPerPage);
    }, [filteredTasks, currentPage, itemsPerPage]);

    const getPageNumbers = () => {
        const pages = [];
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + 4);

        if (end - start < 4) {
            start = Math.max(1, end - 4);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#F8FAFC] text-[#102A43] p-0 overflow-hidden font-sans">
            <div className="p-3 sm:p-4 bg-[#F8FAFC] flex flex-col gap-3 flex-1 overflow-y-auto">
                {/* Standard Header Bar */}
                <div className="bg-white p-2.5 sm:p-3 border border-[#D7E3EE] rounded-lg shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex bg-[#F8FAFC] p-1 rounded-lg border border-[#D7E3EE]">
                            <button
                                className="px-3 py-1 text-xs font-bold text-[#00A3A6] bg-white rounded shadow-xs"
                            >
                                TASK MANAGEMENT
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#60738E]" size={14} />
                            <input
                                type="text"
                                placeholder="Search tasks or lead name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#00A3A6] focus:bg-white outline-none transition-all"
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-2.5 py-1.5 bg-[#F8FAFC] border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#00A3A6] outline-none h-8 cursor-pointer font-bold shrink-0"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="OVERDUE">Overdue</option>
                        </select>

                        {hasPermission('TASK', 'create') && (
                            <button
                                onClick={() => navigate('/crm-dashboard/tasks/new')}
                                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#00A3A6] rounded-md hover:bg-[#008B8E] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                            >
                                <Plus size={14} /> New Task
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabular Data View Container */}
                <div className="bg-white border border-[#D7E3EE] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1 min-h-0">
                    <div className="overflow-x-auto custom-scrollbar flex-1">
                        <table className="w-full text-left border-collapse text-xs text-[#102A43]">
                            <thead className="bg-[#F8FAFC] border-b border-[#D7E3EE] font-bold text-[#60738E] sticky top-0 z-10 uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="p-3 w-12 text-center">#</th>
                                    <th className="p-3 w-36">Task Type</th>
                                    <th className="p-3">Related Lead & Company</th>
                                    <th className="p-3">Comments / Requirements</th>
                                    <th className="p-3 w-32">Due Date & Time</th>
                                    <th className="p-3 w-28 text-center">Status</th>
                                    <th className="p-3 w-24 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8EEF7]">
                                {paginatedTasks.length > 0 ? (
                                    paginatedTasks.map((task, idx) => {
                                        const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                                        const leadInfo = leadMap[task.leadId];

                                        return (
                                            <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-3 text-center font-bold text-[#60738E]">{globalIndex}</td>
                                                <td className="p-3 font-semibold">
                                                    {getSubjectBadge(task.subject)}
                                                </td>
                                                <td className="p-3">
                                                    {task.leadId ? (
                                                        <div className="flex flex-col">
                                                            <button
                                                                onClick={() => navigate(`/crm-dashboard/leads/${task.leadId}`)}
                                                                className="font-bold text-[#0178BC] hover:underline text-left inline-flex items-center gap-1"
                                                            >
                                                                <User size={12} className="text-[#0178BC] shrink-0" />
                                                                <span>{leadInfo?.name || `Lead #${task.leadId}`}</span>
                                                            </button>
                                                            {leadInfo?.company && (
                                                                <span className="text-[11px] text-[#60738E] font-medium">{leadInfo.company}</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#60738E] italic">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="p-3 max-w-xs sm:max-w-md">
                                                    <p className="line-clamp-2 text-[#102A43] font-medium leading-relaxed">
                                                        {task.comments || 'No details specified.'}
                                                    </p>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-0.5 text-[#102A43] font-medium">
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <Calendar size={12} className="text-[#0178BC]" />
                                                            <span>{task.dueDate || 'N/A'}</span>
                                                        </div>
                                                        {task.callTime && (
                                                            <div className="flex items-center gap-1 text-[11px] text-[#60738E]">
                                                                <Clock size={11} />
                                                                <span>{task.callTime?.substring(0, 5)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center">
                                                    {getStatusBadge(task.status)}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {hasPermission('TASK', 'update') && (
                                                            <button
                                                                onClick={() => navigate(`/crm-dashboard/tasks/edit/${task.id}`)}
                                                                className="p-1.5 text-[#60738E] hover:text-[#0178BC] hover:bg-slate-100 rounded transition-colors"
                                                                title="Edit Task"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                        )}
                                                        {hasPermission('TASK', 'delete') && (
                                                            <button
                                                                onClick={() => handleDeleteTask(task.id)}
                                                                className="p-1.5 text-[#60738E] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Delete Task"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center text-xs text-[#60738E]">
                                            No tasks found matching your search or filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls Footer */}
                    <div className="p-2.5 sm:p-3 border-t border-[#D7E3EE] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
                        <div className="flex items-center gap-2 text-[#60738E]">
                            <span>Show:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="px-2 py-1 bg-white border border-[#C9D8E5] rounded text-xs font-bold text-[#102A43] focus:border-[#00A3A6] outline-none"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span>entries | Total <strong>{totalItems}</strong> records</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 border border-[#C9D8E5] rounded bg-white text-[#102A43] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>

                            {getPageNumbers().map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                                        currentPage === pageNum
                                            ? 'bg-[#00A3A6] text-white shadow-xs'
                                            : 'border border-[#C9D8E5] bg-white text-[#102A43] hover:bg-slate-100'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-1.5 border border-[#C9D8E5] rounded bg-white text-[#102A43] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-xs z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-[#00A3A6] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-[#00A3A6]">Loading tasks...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrmTasks;
