import React, { useState, useEffect, useMemo } from 'react';
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
    Edit
} from 'lucide-react';
import CrmTaskForm from '../components/CrmTaskForm';
import { useCrmPermissions } from '../context/CrmPermissionsContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CrmTasks = () => {
    const { hasPermission } = useCrmPermissions();
    const [tasks, setTasks] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchTasksAndLeads = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const headers = { "Authorization": `Bearer ${token}` };

                // Fetch tasks and leads in parallel
                const [tasksRes, leadsRes] = await Promise.all([
                    axios.get(`${API_URL}/crm/tasks`, { headers }),
                    axios.get(`${API_URL}/crm/leads?size=1000`, { headers })
                ]);

                setTasks(tasksRes.data || []);
                setLeads(leadsRes.data.content || []);
            } catch (err) {
                console.error("Failed to fetch tasks or leads", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTasksAndLeads();
    }, []);

    const leadMap = useMemo(() => {
        const map = {};
        leads.forEach(lead => {
            map[lead.id] = `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || lead.name || 'Unknown Lead';
        });
        return map;
    }, [leads]);

    const handleSaveTask = async (taskData) => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            
            if (taskToEdit) {
                await axios.put(`${API_URL}/crm/tasks/${taskToEdit.id}`, taskData, { headers });
            } else {
                await axios.post(`${API_URL}/crm/tasks`, taskData, { headers });
            }
            
            // Refresh tasks
            const tasksRes = await axios.get(`${API_URL}/crm/tasks`, { headers });
            setTasks(tasksRes.data || []);
            setIsModalOpen(false);
            setTaskToEdit(null);
        } catch (err) {
            console.error("Failed to save task", err);
            alert("Failed to save task. Please check your inputs.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditTask = (task) => {
        setTaskToEdit(task);
        setIsModalOpen(true);
    };

    const handleCreateTask = () => {
        setTaskToEdit(null);
        setIsModalOpen(true);
    };

    const getSubjectIcon = (subject) => {
        switch (subject) {
            case 'CALL': return <PhoneCall className="h-4 w-4" />;
            case 'EMAIL': return <Mail className="h-4 w-4" />;
            case 'MEETING': return <Users className="h-4 w-4" />;
            default: return <MessageSquare className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (status) => {
        if (!status) return <span className="px-2 py-1 bg-background-muted text-foreground-muted rounded-theme text-xs font-medium">PENDING</span>;
        
        switch (status.toUpperCase()) {
            case 'COMPLETED':
                return <span className="px-2 py-1 bg-success/10 text-success rounded-theme text-xs font-medium flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</span>;
            case 'IN_PROGRESS':
                return <span className="px-2 py-1 bg-warning/10 text-warning rounded-theme text-xs font-medium">In Progress</span>;
            case 'OVERDUE':
                return <span className="px-2 py-1 bg-error/10 text-error rounded-theme text-xs font-medium flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Overdue</span>;
            default:
                return <span className="px-2 py-1 bg-background-muted text-foreground-muted rounded-theme text-xs font-medium">{status}</span>;
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = 
            (task.comments || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
            (leadMap[task.leadId] || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
                    <p className="text-sm text-foreground-muted">Track and manage all your CRM tasks and follow-ups</p>
                </div>
                {hasPermission('TASK', 'create') && (
                    <button onClick={handleCreateTask} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-theme shadow-sm hover:bg-primary/90 transition-colors">
                        <Plus className="h-4 w-4" />
                        <span>Create Task</span>
                    </button>
                )}
            </div>

            {/* Filters & Search */}
            <div className="bg-card p-4 rounded-theme border border-border flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                    <input 
                        type="text" 
                        placeholder="Search tasks by comments or lead name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-theme focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-9 pr-8 py-2 bg-background border border-border rounded-theme focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-sm font-medium"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
                <div className="bg-card rounded-theme border border-border p-12 text-center">
                    <div className="w-16 h-16 bg-background-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="h-8 w-8 text-foreground-muted" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">No tasks found</h3>
                    <p className="text-foreground-muted text-sm mt-1">You don't have any tasks matching your current filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTasks.map((task) => (
                        <div key={task.id} className="bg-card rounded-theme border border-border shadow-sm p-5 hover:shadow-md transition-all group flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 text-primary rounded-theme">
                                        {getSubjectIcon(task.subject)}
                                    </div>
                                    <span className="font-semibold text-sm text-foreground">{task.subject || 'Task'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(task.status)}
                                    {hasPermission('TASK', 'update') && (
                                        <button onClick={() => handleEditTask(task)} className="p-1 text-foreground-muted hover:text-primary rounded-theme hover:bg-background-muted transition-colors opacity-0 group-hover:opacity-100">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <p className="text-sm text-foreground mb-4 flex-1 line-clamp-3">
                                {task.comments || 'No description provided.'}
                            </p>
                            
                            <div className="pt-4 border-t border-border mt-auto space-y-2">
                                {task.leadId && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4 text-foreground-muted" />
                                        <span className="text-foreground-muted">Lead:</span>
                                        <span className="font-medium text-foreground truncate">{leadMap[task.leadId] || `Lead #${task.leadId}`}</span>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-4 text-sm text-foreground-muted">
                                    {task.dueDate && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{task.dueDate}</span>
                                        </div>
                                    )}
                                    {task.callTime && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>{task.callTime}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Task Sidebar Drawer */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setIsModalOpen(false)}
                    ></div>
                    
                    {/* Sidebar Content */}
                    <div className="relative w-full max-w-lg bg-card h-full shadow-2xl animate-in slide-in-from-right duration-300 border-l border-border flex flex-col">
                        <CrmTaskForm 
                            item={taskToEdit} 
                            onSave={handleSaveTask} 
                            onCancel={() => setIsModalOpen(false)} 
                            loading={submitting} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrmTasks;
