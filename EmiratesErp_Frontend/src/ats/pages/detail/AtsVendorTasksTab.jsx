import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Check, X, Calendar, User, Clock, AlertTriangle, Filter, Phone, Users, ShieldAlert, Award } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsVendorTasksTab = ({ vendorId }) => {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    
    // Filters state
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');

    const [taskForm, setTaskForm] = useState({
        taskTitle: '',
        taskDescription: '',
        taskStatus: 'PENDING', // PENDING = Not Started, IN_PROGRESS = Progress, COMPLETED = Completed
        priority: 'MEDIUM',
        dueDate: '',
        assignedToId: '',
        taskType: 'To do',
        taskCategory: 'General',
        escalateToId: '',
        ownershipId: '',
        reminder: 'None',
        meetingLink: ''
    });

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`${API_URL}/ats/vendors/${vendorId}/tasks`, { headers });
            setTasks(res.data || []);
        } catch (err) {
            console.error("Error fetching tasks:", err);
            toast.error("Failed to load tasks.");
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`${API_URL}/employees/all`, { headers });
            setEmployees(res.data || []);
        } catch (err) {
            console.error("Error fetching employees:", err);
        }
    };

    useEffect(() => {
        if (vendorId) {
            fetchTasks();
            fetchEmployees();
        }
    }, [vendorId]);

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Formatting payload
        const payload = {
            ...taskForm,
            assignedToId: taskForm.assignedToId ? Number(taskForm.assignedToId) : null,
            escalateToId: taskForm.escalateToId ? Number(taskForm.escalateToId) : null,
            ownershipId: taskForm.ownershipId ? Number(taskForm.ownershipId) : null
        };

        try {
            if (editingTask) {
                await axios.put(`${API_URL}/ats/vendors/${vendorId}/tasks/${editingTask.id}`, payload, { headers });
                toast.success("Task updated successfully.");
            } else {
                await axios.post(`${API_URL}/ats/vendors/${vendorId}/tasks`, payload, { headers });
                toast.success("Task created successfully.");
            }
            setShowTaskForm(false);
            setEditingTask(null);
            fetchTasks();
        } catch (err) {
            console.error("Error saving task:", err);
            toast.error("Failed to save task.");
        }
    };

    const handleCompleteTask = async (tId) => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            await axios.patch(`${API_URL}/ats/vendors/${vendorId}/tasks/${tId}/complete`, {}, { headers });
            toast.success("Task status updated.");
            fetchTasks();
        } catch (err) {
            console.error("Error updating status:", err);
            toast.error("Failed to update status.");
        }
    };

    const handleDeleteTask = async (tId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            await axios.delete(`${API_URL}/ats/vendors/${vendorId}/tasks/${tId}`, { headers });
            toast.success("Task deleted successfully.");
            fetchTasks();
        } catch (err) {
            console.error("Error deleting task:", err);
            toast.error("Failed to delete task.");
        }
    };

    // Filter tasks
    const filteredTasks = tasks.filter(t => {
        const statusMatch = statusFilter === 'ALL' || t.taskStatus === statusFilter;
        const priorityMatch = priorityFilter === 'ALL' || t.priority === priorityFilter;
        return statusMatch && priorityMatch;
    });

    const isOverdue = (dateString, status) => {
        if (!dateString || status === 'COMPLETED' || status === 'CANCELLED') return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(dateString);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    const getPriorityStyles = (prio) => {
        switch (prio) {
            case 'URGENT':
                return 'bg-rose-500/10 text-rose-600 border border-rose-500/25';
            case 'HIGH':
                return 'bg-amber-500/10 text-amber-600 border border-amber-500/25';
            case 'MEDIUM':
                return 'bg-blue-500/10 text-blue-600 border border-blue-500/25';
            case 'LOW':
            default:
                return 'bg-slate-500/10 text-slate-600 border border-slate-500/25';
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'COMPLETED':
                return { dot: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' };
            case 'IN_PROGRESS':
                return { dot: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-500/5', border: 'border-blue-500/20' };
            case 'CANCELLED':
                return { dot: 'bg-slate-500', text: 'text-slate-500', bg: 'bg-slate-500/5', border: 'border-slate-500/20' };
            case 'PENDING':
            default:
                return { dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-500/5', border: 'border-amber-500/20' };
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'COMPLETED': return 'Completed';
            case 'IN_PROGRESS': return 'Progress';
            case 'CANCELLED': return 'Cancelled';
            case 'PENDING':
            default: return 'Not Started';
        }
    };

    const getTaskTypeIcon = (type) => {
        switch (type) {
            case 'Call': return <Phone size={14} className="text-blue-500" />;
            case 'Meeting': return <Users size={14} className="text-emerald-500" />;
            case 'To do':
            default: return <Check size={14} className="text-amber-500" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Quick Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                    <h3 className="text-base font-bold text-foreground">Task Tracker</h3>
                    <p className="text-xs text-foreground-muted">Assign, schedule, and track action items</p>
                </div>
                {!showTaskForm && (
                    <button
                        onClick={() => {
                            setTaskForm({
                                taskTitle: '',
                                taskDescription: '',
                                taskStatus: 'PENDING',
                                priority: 'MEDIUM',
                                dueDate: '',
                                assignedToId: '',
                                taskType: 'To do',
                                taskCategory: 'General',
                                escalateToId: '',
                                ownershipId: '',
                                reminder: 'None',
                                meetingLink: ''
                            });
                            setEditingTask(null);
                            setShowTaskForm(true);
                        }}
                        className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-theme hover:bg-primary/90 shadow-sm transition-all"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Task
                    </button>
                )}
            </div>

            {/* Inline Add/Edit Form */}
            {showTaskForm && (
                <div className="bg-background-muted/40 border border-border rounded-theme p-6 space-y-5 transition-all">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-foreground">
                            {editingTask ? "Edit Action Item" : "Create Action Item"}
                        </h4>
                        <button 
                            onClick={() => {
                                setShowTaskForm(false);
                                setEditingTask(null);
                            }}
                            className="p-1 hover:bg-background rounded-theme text-foreground-muted animate-hover"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <form onSubmit={handleTaskSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Title & Priority */}
                            <div className="grid grid-cols-4 gap-2 md:col-span-2">
                                <div className="col-span-3">
                                    <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={taskForm.taskTitle}
                                        onChange={(e) => setTaskForm({ ...taskForm, taskTitle: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Enter Title"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Priority</label>
                                    <select
                                        value={taskForm.priority}
                                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                                        className="px-2 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-bold"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="URGENT">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Description</label>
                                <textarea
                                    rows={2}
                                    value={taskForm.taskDescription || ''}
                                    onChange={(e) => setTaskForm({ ...taskForm, taskDescription: e.target.value })}
                                    className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Enter a brief description of the task"
                                />
                            </div>

                            {/* Task Type */}
                            <div>
                                <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Task Type</label>
                                <select
                                    value={taskForm.taskType}
                                    onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value })}
                                    className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-semibold"
                                >
                                    <option value="Call">Call</option>
                                    <option value="Meeting">Meeting</option>
                                    <option value="To do">To do</option>
                                </select>
                            </div>

                            {/* Meeting Link Conditional Field */}
                            {taskForm.taskType === 'Meeting' && (
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1 text-primary">Meeting Link</label>
                                    <input
                                        type="url"
                                        value={taskForm.meetingLink || ''}
                                        onChange={(e) => setTaskForm({ ...taskForm, meetingLink: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-primary/30 bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="https://meet.google.com/..."
                                    />
                                </div>
                            )}

                            {/* Task Category */}
                            <div>
                                <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Task Category</label>
                                <select
                                    value={taskForm.taskCategory}
                                    onChange={(e) => setTaskForm({ ...taskForm, taskCategory: e.target.value })}
                                    className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    <option value="General">General</option>
                                    <option value="Follow-up">Follow-up</option>
                                    <option value="Contract Review">Contract Review</option>
                                    <option value="Billing">Billing</option>
                                    <option value="Sourcing">Sourcing</option>
                                </select>
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={taskForm.dueDate || ''}
                                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                                    className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Status</label>
                                <select
                                    value={taskForm.taskStatus}
                                    onChange={(e) => setTaskForm({ ...taskForm, taskStatus: e.target.value })}
                                    className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-semibold"
                                >
                                    <option value="PENDING">Not Started</option>
                                    <option value="IN_PROGRESS">Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>

                            {/* Assign To */}
                            <div>
                                <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Assign To</label>
                                <select
                                    value={taskForm.assignedToId || ''}
                                    onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}
                                    className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    <option value="">Unassigned</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.firstName} {emp.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Escalate To */}
                            <div>
                                <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Escalate To</label>
                                <select
                                    value={taskForm.escalateToId || ''}
                                    onChange={(e) => setTaskForm({ ...taskForm, escalateToId: e.target.value })}
                                    className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    <option value="">None</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.firstName} {emp.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Ownership */}
                            <div>
                                <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Ownership</label>
                                <select
                                    value={taskForm.ownershipId || ''}
                                    onChange={(e) => setTaskForm({ ...taskForm, ownershipId: e.target.value })}
                                    className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    <option value="">None</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.firstName} {emp.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Reminder */}
                            <div>
                                <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Reminder</label>
                                <select
                                    value={taskForm.reminder}
                                    onChange={(e) => setTaskForm({ ...taskForm, reminder: e.target.value })}
                                    className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    <option value="None">None</option>
                                    <option value="15 minutes before">15 minutes before</option>
                                    <option value="30 minutes before">30 minutes before</option>
                                    <option value="1 hour before">1 hour before</option>
                                    <option value="1 day before">1 day before</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-border">
                            <button 
                                type="button" 
                                onClick={() => {
                                    setShowTaskForm(false);
                                    setEditingTask(null);
                                }} 
                                className="px-4 py-2 bg-background-muted rounded-theme text-sm font-semibold border border-border text-foreground-muted hover:bg-background-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-theme text-sm font-bold shadow-xs hover:bg-primary/90 transition-colors"
                            >
                                {editingTask ? "Save Changes" : "Create Task"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Dynamic Filter Controls */}
            {!showTaskForm && (
                <div className="flex flex-wrap items-center gap-3 bg-background-muted/20 border border-border/80 p-3 rounded-theme text-sm">
                    <div className="flex items-center gap-1.5 text-foreground-muted font-bold text-xs uppercase tracking-wider mr-2">
                        <Filter size={14} />
                        <span>Filter:</span>
                    </div>
                    
                    {/* Status Tabs */}
                    <div className="flex bg-background border border-border rounded-theme p-0.5 overflow-x-auto">
                        {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`px-2.5 py-1 text-xs font-bold rounded-theme transition-all whitespace-nowrap ${
                                    statusFilter === st
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-foreground-muted hover:text-foreground'
                                }`}
                            >
                                {getStatusLabel(st)}
                            </button>
                        ))}
                    </div>

                    {/* Priority Dropdown */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-foreground-muted font-semibold">Priority:</span>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="bg-background border border-border text-xs font-bold rounded-theme px-2 py-1 outline-none cursor-pointer text-foreground"
                        >
                            <option value="ALL">All Priorities</option>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Task Checklist & Cards */}
            {loading && (
                <div className="text-center py-12 text-foreground-muted text-sm font-semibold">
                    Retrieving tasks...
                </div>
            )}

            {!loading && filteredTasks.length === 0 && (
                <div className="text-center py-14 border border-dashed border-border rounded-theme bg-background/50">
                    <p className="text-sm text-foreground-muted font-medium">
                        No tasks found matching your filters.
                    </p>
                </div>
            )}

            {!loading && filteredTasks.length > 0 && (
                <div className="space-y-3">
                    {filteredTasks.map(t => {
                        const statusStyles = getStatusStyles(t.taskStatus);
                        const isOver = isOverdue(t.dueDate, t.taskStatus);
                        return (
                            <div 
                                key={t.id} 
                                className={`p-4 rounded-theme border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${statusStyles.bg} ${statusStyles.border} hover:shadow-xs`}
                            >
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    {/* Action Toggle Button */}
                                    <button
                                        onClick={() => handleCompleteTask(t.id)}
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${
                                            t.taskStatus === 'COMPLETED'
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : 'border-border bg-background text-transparent hover:text-emerald-500 hover:border-emerald-500'
                                        }`}
                                    >
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </button>

                                    <div className="min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                {getTaskTypeIcon(t.taskType)}
                                                <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider">
                                                    {t.taskType || 'To do'}
                                                </span>
                                            </span>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-background border border-border text-foreground-muted">
                                                {t.taskCategory || 'General'}
                                            </span>
                                            {t.reminder && t.reminder !== 'None' && (
                                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <Clock size={10} />
                                                    Remind: {t.reminder}
                                                </span>
                                            )}
                                            {t.taskType === 'Meeting' && t.meetingLink && (
                                                <a 
                                                    href={t.meetingLink.startsWith('http') ? t.meetingLink : `https://${t.meetingLink}`}
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded transition-all flex items-center gap-1 cursor-pointer border border-emerald-500/20"
                                                >
                                                    Join Meeting
                                                </a>
                                            )}
                                        </div>

                                        <span className={`font-semibold text-sm block ${
                                            t.taskStatus === 'COMPLETED' ? 'line-through text-foreground-muted' : 'text-foreground'
                                        }`}>
                                            {t.taskTitle}
                                        </span>
                                        {t.taskDescription && (
                                            <p className="text-xs text-foreground-muted leading-relaxed line-clamp-2">
                                                {t.taskDescription}
                                            </p>
                                        )}
                                        
                                        {/* Task Metadata Row */}
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-bold text-foreground-muted uppercase tracking-wider pt-1">
                                            {t.dueDate && (
                                                <span className={`flex items-center gap-1 ${isOver ? 'text-rose-600 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded' : ''}`}>
                                                    <Calendar size={11} />
                                                    Due: {t.dueDate} {isOver && "(OVERDUE)"}
                                                </span>
                                            )}
                                            {t.assignedToName && (
                                                <span className="flex items-center gap-1">
                                                    <User size={11} />
                                                    Assignee: {t.assignedToName}
                                                </span>
                                            )}
                                            {t.escalateToName && (
                                                <span className="flex items-center gap-1 text-rose-500">
                                                    <ShieldAlert size={11} />
                                                    Escalate: {t.escalateToName}
                                                </span>
                                            )}
                                            {t.ownershipName && (
                                                <span className="flex items-center gap-1 text-indigo-500">
                                                    <Award size={11} />
                                                    Owner: {t.ownershipName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center">
                                    {/* Priority Badge */}
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase ${getPriorityStyles(t.priority)}`}>
                                        {t.priority}
                                    </span>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1 border-l border-border/80 pl-2">
                                        <button
                                            onClick={() => {
                                                setEditingTask(t);
                                                setTaskForm({
                                                    taskTitle: t.taskTitle || '',
                                                    taskDescription: t.taskDescription || '',
                                                    taskStatus: t.taskStatus || 'PENDING',
                                                    priority: t.priority || 'MEDIUM',
                                                    dueDate: t.dueDate || '',
                                                    assignedToId: t.assignedToId || '',
                                                    taskType: t.taskType || 'To do',
                                                    taskCategory: t.taskCategory || 'General',
                                                    escalateToId: t.escalateToId || '',
                                                    ownershipId: t.ownershipId || '',
                                                    reminder: t.reminder || 'None',
                                                    meetingLink: t.meetingLink || ''
                                                });
                                                setShowTaskForm(true);
                                            }}
                                            className="p-1.5 hover:bg-background border border-border/40 text-foreground-muted hover:text-primary rounded-theme transition-all"
                                        >
                                            <Edit className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTask(t.id)}
                                            className="p-1.5 hover:bg-background border border-border/40 text-foreground-muted hover:text-rose-600 rounded-theme transition-all"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AtsVendorTasksTab;
