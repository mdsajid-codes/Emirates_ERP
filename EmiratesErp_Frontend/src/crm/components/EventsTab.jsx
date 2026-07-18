import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader, AlertCircle, PlusCircle, Edit, Trash2, Calendar, Clock, Users, MapPin, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const EventItem = ({ event, onEdit, onDelete }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-card border border-border p-5 rounded-theme shadow-sm hover:shadow-md hover:border-accent/30 transition-all"
        >
            {/* Event Accent Bar (Using Accent Color) */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent rounded-l-theme shadow-[0_0_8px_rgba(var(--color-accent-rgb),0.4)]"></div>
            
            <div className="flex justify-between items-start pl-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded bg-accent/10 text-accent">
                            <Calendar size={14} />
                        </div>
                        <h4 className="text-sm font-bold text-foreground truncate uppercase tracking-tight">
                            {event.subject}
                        </h4>
                    </div>
                    <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed italic">
                        {event.description || 'Strategic meeting to discuss lead progression and pipeline alignment.'}
                    </p>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                    <button onClick={() => onEdit(event)} className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-full transition-all">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => onDelete(event.id)} className="p-2 text-foreground-muted hover:text-error hover:bg-error/10 rounded-full transition-all">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-border/50 flex flex-wrap items-center gap-6 pl-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">
                    <div className="p-1 rounded bg-slate-100"><Clock size={12} className="text-orange-500" /></div>
                    <span>Schedule: <span className="text-foreground">{event.date} | {event.fromTime} - {event.toTime || 'End'}</span></span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">
                    <div className="p-1 rounded bg-slate-100"><Users size={12} className="text-blue-500" /></div>
                    <span>Delegates: <span className="text-foreground">{event.employeeNames?.join(', ') || 'Internal Only'}</span></span>
                </div>
            </div>
        </motion.div>
    );
};

const EventsTab = ({ leadId, onAddEvent, onEditEvent }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchEvents = useCallback(async () => {
        if (!leadId) return;
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/crm/events/lead/${leadId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setEvents(response.data);
        } catch (err) {
            setError('Failed to fetch event registry.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [leadId]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleDelete = async (eventId) => {
        if (window.confirm('Terminate this event record? This action is irreversible.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/crm/events/${eventId}`, { headers: { "Authorization": `Bearer ${token}` } });
                fetchEvents();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete event.'}`);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent animate-pulse">Syncing Event Matrix...</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-accent rounded-full"></div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">Lead Engagement Events</h3>
                        <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest opacity-60">Strategic Calendar & Appointment Tracking</p>
                    </div>
                </div>
                <button 
                    onClick={onAddEvent} 
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-theme font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/25 hover:scale-105 transition-all"
                >
                    <PlusCircle size={14} /> Schedule Event
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {events.length > 0 ? (
                    events.map(event => (
                        <EventItem key={event.id} event={event} onEdit={onEditEvent} onDelete={handleDelete} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-theme bg-slate-50/50 text-foreground-muted group hover:border-accent/30 transition-colors">
                        <div className="p-4 rounded-full bg-background border border-border mb-4 group-hover:scale-110 transition-transform">
                            <Calendar size={40} className="opacity-20" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">No Events Scheduled</h3>
                        <p className="text-xs mt-1 max-w-[200px] text-center opacity-60">Your event calendar is currently clear. Schedule a meeting to begin tracking.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsTab;