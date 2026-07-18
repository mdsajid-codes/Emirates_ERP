import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader, AlertCircle, PlusCircle, Edit, Trash2, Calendar, User, Tag, CheckCircle2, Clock, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const TaskItem = ({ task, onEdit, onDelete }) => {
    const isCompleted = task.status === 'COMPLETED' || task.status === 'DONE';
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-card border border-border p-5 rounded-theme shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
        >
            {/* Status Accent Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-theme ${isCompleted ? 'bg-success shadow-[0_0_8px_rgba(var(--color-success-rgb),0.4)]' : 'bg-primary shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.4)]'}`}></div>
            
            <div className="flex justify-between items-start pl-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isCompleted ? 'bg-success/10 text-success border-success/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                            {task.status || 'OPEN'}
                        </span>
                        <h4 className={`text-sm font-bold text-foreground truncate uppercase tracking-tight ${isCompleted ? 'line-through opacity-50' : ''}`}>
                            {task.subject}
                        </h4>
                    </div>
                    <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                        {task.comments || 'No descriptive details provided for this task.'}
                    </p>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                    <button onClick={() => onEdit(task)} className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-full transition-all">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => onDelete(task.id)} className="p-2 text-foreground-muted hover:text-error hover:bg-error/10 rounded-full transition-all">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap items-center gap-6 pl-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">
                    <div className="p-1 rounded bg-slate-100"><Calendar size={12} className="text-primary" /></div>
                    <span>Due: <span className="text-foreground">{task.dueDate || 'N/A'}</span></span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">
                    <div className="p-1 rounded bg-slate-100"><User size={12} className="text-blue-500" /></div>
                    <span>Assignee: <span className="text-foreground">{task.assignedToName || 'Unassigned'}</span></span>
                </div>
            </div>
        </motion.div>
    );
};

const TasksTab = ({ leadId, onAddTask, onEditTask }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTasks = useCallback(async () => {
        if (!leadId) return;
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/crm/tasks/lead/${leadId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setTasks(response.data);
        } catch (err) {
            setError('Failed to fetch tasks registry.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [leadId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleDelete = async (taskId) => {
        if (window.confirm('Delete this task protocol? This action is irreversible.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/crm/tasks/${taskId}`, { headers: { "Authorization": `Bearer ${token}` } });
                fetchTasks();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to terminate task.'}`);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary animate-pulse">Syncing Task Matrix...</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-primary rounded-full"></div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">Active Tasking Protocols</h3>
                        <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest opacity-60">Lead Lifecycle Task Management</p>
                    </div>
                </div>
                <button 
                    onClick={onAddTask} 
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-theme font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                >
                    <PlusCircle size={14} /> New Task Protocol
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <TaskItem key={task.id} task={task} onEdit={onEditTask} onDelete={handleDelete} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-theme bg-slate-50/50 text-foreground-muted group hover:border-primary/30 transition-colors">
                        <div className="p-4 rounded-full bg-background border border-border mb-4 group-hover:scale-110 transition-transform">
                            <Clock size={40} className="opacity-20" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">No Active Tasks</h3>
                        <p className="text-xs mt-1 max-w-[200px] text-center opacity-60">The task matrix is currently empty. Initiate a new protocol to begin tracking.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TasksTab;