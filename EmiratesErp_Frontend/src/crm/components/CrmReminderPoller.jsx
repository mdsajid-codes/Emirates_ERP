import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, X, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CrmReminderPoller = () => {
    const [reminders, setReminders] = useState([]);

    const fetchReminders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`${API_URL}/crm/calendar/due-reminders`, { headers });
            
            // Only show undismissed ones we don't already have
            setReminders(res.data || []);
        } catch (err) {
            console.error("Failed to fetch reminders", err);
        }
    };

    useEffect(() => {
        fetchReminders();
        const interval = setInterval(fetchReminders, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const handleDismiss = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`${API_URL}/crm/calendar/reminders/${id}/dismiss`, {}, { headers });
            setReminders(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error("Failed to dismiss reminder", err);
        }
    };

    if (reminders.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-80">
            <AnimatePresence>
                {reminders.map((reminder) => (
                    <motion.div
                        key={reminder.id}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className="bg-card border border-primary/20 shadow-2xl rounded-theme p-4 relative overflow-hidden group"
                    >
                        {/* Animated accent */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary animate-pulse"></div>
                        
                        <div className="flex gap-3">
                            <div className="bg-primary/10 text-primary p-2 rounded-full h-fit mt-1 animate-bounce">
                                <Bell className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-bold text-sm text-foreground truncate">
                                        {reminder.entityTitle}
                                    </h4>
                                    <button 
                                        onClick={() => handleDismiss(reminder.id)}
                                        className="text-foreground-muted hover:text-foreground p-1 rounded-full hover:bg-background transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <p className="text-xs text-foreground-muted mt-1">
                                    Strategic engagement alert due soon.
                                </p>
                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-tighter">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(reminder.remindAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-accent uppercase tracking-tighter">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(reminder.remindAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="mt-3 flex justify-end">
                            <button 
                                onClick={() => handleDismiss(reminder.id)}
                                className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted hover:text-primary transition-colors"
                            >
                                Dismiss Alert
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default CrmReminderPoller;
