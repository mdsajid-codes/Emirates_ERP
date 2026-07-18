import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar as CalendarIcon, 
    Clock, 
    Plus, 
    Bell,
    CheckCircle2,
    Users,
    Tag,
    X,
    Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CrmTaskForm from '../components/CrmTaskForm';
import CrmEventForm from '../components/CrmEventForm';
import { useCrmPermissions } from '../context/CrmPermissionsContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CrmCalendarPage = () => {
    const { hasPermission } = useCrmPermissions();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
    const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [reminderTime, setReminderTime] = useState('');
    const [settingReminder, setSettingReminder] = useState(false);
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [selectedChannels, setSelectedChannels] = useState(['WHATSAPP']);
    const [recipient, setRecipient] = useState('');

    const fetchCalendarItems = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`${API_URL}/crm/calendar/events`, { headers });
            setItems(res.data || []);
        } catch (err) {
            console.error("Failed to fetch calendar items", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendarItems();
    }, []);

    useEffect(() => {
        setIsRescheduling(false);
        setReminderTime('');
        setSelectedChannels(['WHATSAPP']);
        setRecipient('');
    }, [selectedItem]);

    // Calendar generation logic
    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const calendarGrid = useMemo(() => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const totalDays = daysInMonth(month, year);
        const startDay = firstDayOfMonth(month, year);
        
        const grid = [];
        // Previous month padding
        const prevMonthTotalDays = daysInMonth(month === 0 ? 11 : month - 1, month === 0 ? year - 1 : year);
        for (let i = startDay - 1; i >= 0; i--) {
            grid.push({ day: prevMonthTotalDays - i, currentMonth: false, month: month === 0 ? 11 : month - 1, year: month === 0 ? year - 1 : year });
        }
        // Current month
        for (let i = 1; i <= totalDays; i++) {
            grid.push({ day: i, currentMonth: true, month, year });
        }
        // Next month padding
        const remaining = 42 - grid.length;
        for (let i = 1; i <= remaining; i++) {
            grid.push({ day: i, currentMonth: false, month: month === 11 ? 0 : month + 1, year: month === 11 ? year + 1 : year });
        }
        return grid;
    }, [currentDate]);

    const handlePrevMonth = () => setCurrentDate(new Date(new Date(currentDate).setMonth(currentDate.getMonth() - 1)));
    const handleNextMonth = () => setCurrentDate(new Date(new Date(currentDate).setMonth(currentDate.getMonth() + 1)));
    const handleToday = () => setCurrentDate(new Date());

    const getItemsForDate = (day, month, year) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return items.filter(item => item.date === dateStr);
    };

    const handleSetReminder = async () => {
        if (!reminderTime || !selectedItem || selectedChannels.length === 0) return;
        try {
            setSettingReminder(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            // selectedItem.date is "YYYY-MM-DD", reminderTime is "HH:mm"
            const remindAt = `${selectedItem.date}T${reminderTime}:00`;
            
            await axios.post(`${API_URL}/crm/calendar/reminders`, {
                entityType: selectedItem.type,
                entityId: selectedItem.id,
                remindAt,
                channels: selectedChannels,
                recipient
            }, { headers });
            
            alert("Reminder set successfully!");
            fetchCalendarItems();
            setSelectedItem(null);
        } catch (err) {
            console.error("Failed to set reminder", err);
            alert("Failed to set reminder.");
        } finally {
            setSettingReminder(false);
        }
    };

    const handleDeleteReminder = async () => {
        if (!selectedItem || !selectedItem.reminderId) return;
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${API_URL}/crm/calendar/reminders/${selectedItem.reminderId}`, { headers });
            alert("Reminder cancelled.");
            fetchCalendarItems();
            setSelectedItem(null);
        } catch (err) {
            console.error("Failed to delete reminder", err);
        }
    };

    const handleSaveTask = async (taskData) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            if (itemToEdit) {
                await axios.put(`${API_URL}/crm/tasks/${itemToEdit.id}`, taskData, { headers });
            } else {
                await axios.post(`${API_URL}/crm/tasks`, taskData, { headers });
            }
            setIsTaskDrawerOpen(false);
            fetchCalendarItems();
        } catch (err) {
            console.error("Failed to save task", err);
        }
    };

    const handleSaveEvent = async (eventData) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            if (itemToEdit) {
                await axios.put(`${API_URL}/crm/events/${itemToEdit.id}`, eventData, { headers });
            } else {
                await axios.post(`${API_URL}/crm/events`, eventData, { headers });
            }
            setIsEventDrawerOpen(false);
            fetchCalendarItems();
        } catch (err) {
            console.error("Failed to save event", err);
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">CRM Strategic Calendar</h1>
                    <p className="text-sm text-foreground-muted uppercase tracking-widest font-bold opacity-70">Timeline & Engagement Intelligence</p>
                </div>
                <div className="flex items-center gap-3">
                    {hasPermission('TASK', 'create') && (
                        <button 
                            onClick={() => { setItemToEdit(null); setIsTaskDrawerOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-theme transition-all font-bold text-xs uppercase tracking-widest"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Task</span>
                        </button>
                    )}
                    {hasPermission('EVENT', 'create') && (
                        <button 
                            onClick={() => { setItemToEdit(null); setIsEventDrawerOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground rounded-theme transition-all font-bold text-xs uppercase tracking-widest"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Event</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden flex flex-col flex-1">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-foreground min-w-[200px]">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex items-center bg-background rounded-theme border border-border p-1">
                            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white rounded-theme transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                            <button onClick={handleToday} className="px-3 text-xs font-bold uppercase tracking-widest hover:bg-white rounded-theme transition-colors">Today</button>
                            <button onClick={handleNextMonth} className="p-1.5 hover:bg-white rounded-theme transition-colors"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                    </div>
                </div>

                {/* Grid Header */}
                <div className="grid grid-cols-7 border-b border-border bg-slate-50/50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-2 text-center text-[10px] font-bold text-foreground-muted uppercase tracking-widest border-r border-border last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid Body */}
                <div className="grid grid-cols-7 flex-1 overflow-y-auto">
                    {calendarGrid.map((cell, idx) => {
                        const dateItems = getItemsForDate(cell.day, cell.month, cell.year);
                        const isToday = new Date().toDateString() === new Date(cell.year, cell.month, cell.day).toDateString();
                        
                        return (
                            <div 
                                key={idx} 
                                className={`min-h-[120px] p-2 border-r border-b border-border flex flex-col gap-1 transition-all hover:bg-slate-50/30 group ${!cell.currentMonth ? 'opacity-30' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white' : 'text-foreground-muted'}`}>
                                        {cell.day}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                                    {dateItems.map(item => (
                                        <button 
                                            key={`${item.type}-${item.id}`}
                                            onClick={() => setSelectedItem(item)}
                                            className={`text-[9px] font-bold px-1.5 py-1 rounded-theme text-left truncate transition-all hover:scale-[1.02] active:scale-[0.98] ${
                                                item.type === 'TASK' 
                                                ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                                                : 'bg-accent/10 text-accent border-l-2 border-accent'
                                            }`}
                                        >
                                            {item.startTime && <span className="opacity-70 mr-1">{item.startTime.substring(0,5)}</span>}
                                            {item.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Item Details Sidebar */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setSelectedItem(null)}
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="relative w-full max-w-md bg-card h-full shadow-2xl border-l border-border flex flex-col"
                        >
                            <header className="p-6 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-theme ${selectedItem.type === 'TASK' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                                        <CalendarIcon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">{selectedItem.title}</h3>
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{selectedItem.type} Details</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                            </header>

                            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-foreground-muted">
                                        <Clock size={16} />
                                        <span className="font-medium">{selectedItem.date} {selectedItem.startTime ? `@ ${selectedItem.startTime.substring(0,5)}` : ''}</span>
                                    </div>
                                    {selectedItem.leadName && (
                                        <div className="flex items-center gap-3 text-sm text-foreground-muted">
                                            <Users size={16} />
                                            <span className="font-medium">Lead: {selectedItem.leadName}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-sm text-foreground-muted">
                                        <Tag size={16} />
                                        <div className="flex gap-2">
                                            {selectedItem.status && <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold uppercase">{selectedItem.status}</span>}
                                            {selectedItem.priority && <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold uppercase">{selectedItem.priority}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted">Description / Intelligence</h4>
                                    <p className="text-sm text-foreground leading-relaxed italic border-l-4 border-border pl-4">
                                        {selectedItem.description || "No strategic brief provided for this engagement."}
                                    </p>
                                </div>

                                {/* Reminder Section */}
                                <div className="pt-6 border-t border-border mt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Bell className="h-4 w-4 text-primary" />
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Strategic Reminder Matrix</h4>
                                    </div>
                                    
                                    {selectedItem.reminderId && !isRescheduling ? (
                                        <div className="bg-primary/5 border border-primary/10 rounded-theme p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs font-medium text-primary">
                                                        Active alert scheduled for:
                                                    </p>
                                                    <p className="text-lg font-bold text-primary mt-1">
                                                        {new Date(selectedItem.remindAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                    </p>
                                                    {selectedItem.channels && selectedItem.channels.length > 0 && (
                                                        <div className="flex gap-1 mt-2">
                                                            {selectedItem.channels.map(ch => (
                                                                <span key={ch} className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                                                    ch === 'WHATSAPP' ? 'bg-green-500 text-white' : 
                                                                    ch === 'EMAIL' ? 'bg-blue-500 text-white' : 
                                                                    'bg-orange-500 text-white'
                                                                }`}>
                                                                    {ch}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <button 
                                                        onClick={() => setIsRescheduling(true)}
                                                        className="text-[9px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-3 py-1.5 rounded-theme shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                                                    >
                                                        Reschedule
                                                    </button>
                                                    <button 
                                                        onClick={handleDeleteReminder}
                                                        className="text-[9px] font-bold uppercase tracking-widest bg-white border border-border text-error px-3 py-1.5 rounded-theme hover:bg-error/5 transition-all"
                                                    >
                                                        Cancel Alert
                                                    </button>
                                                </div>
                                            </div>
                                            {selectedItem.reminderDismissed && <span className="inline-block mt-3 px-2 py-0.5 bg-success/10 text-success text-[8px] font-bold rounded uppercase tracking-widest">Protocol Executed</span>}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Channel Selector */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-foreground-muted uppercase pl-1">Delivery Channels</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        { id: 'SYSTEM', label: 'Pop-up', color: 'bg-primary' },
                                                        { id: 'WHATSAPP', label: 'WhatsApp', color: 'bg-green-500' },
                                                        { id: 'EMAIL', label: 'Email', color: 'bg-blue-500' },
                                                        { id: 'SMS', label: 'SMS', color: 'bg-orange-500' }
                                                    ].map(ch => {
                                                        const active = selectedChannels.includes(ch.id);
                                                        return (
                                                            <button
                                                                key={ch.id}
                                                                onClick={() => setSelectedChannels(prev => 
                                                                    active ? prev.filter(p => p !== ch.id) : [...prev, ch.id]
                                                                )}
                                                                className={`px-4 py-2 rounded-theme text-[9px] font-bold uppercase tracking-widest transition-all border ${
                                                                    active 
                                                                    ? `${ch.color} text-white border-transparent shadow-md` 
                                                                    : 'bg-white text-foreground-muted border-border'
                                                                }`}
                                                            >
                                                                {ch.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Recipient Input - Only show if external channels are selected */}
                                            {(selectedChannels.includes('WHATSAPP') || selectedChannels.includes('EMAIL') || selectedChannels.includes('SMS')) && (
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-foreground-muted uppercase pl-1">Recipient (Phone or Email)</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder={selectedChannels.includes('EMAIL') ? 'email@example.com' : '+971...'}
                                                        value={recipient}
                                                        onChange={(e) => setRecipient(e.target.value)}
                                                        className="w-full h-11 px-4 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    />
                                                </div>
                                            )}

                                            {/* Time Picker */}
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-foreground-muted uppercase pl-1">
                                                    {isRescheduling ? 'New Alert Time' : 'Target Alert Time'}
                                                </label>
                                                <input 
                                                    type="time" 
                                                    value={reminderTime}
                                                    onChange={(e) => setReminderTime(e.target.value)}
                                                    className="w-full h-11 px-4 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                {isRescheduling && (
                                                    <button 
                                                        onClick={() => setIsRescheduling(false)}
                                                        className="flex-1 h-11 bg-white border border-border text-foreground-muted rounded-theme font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                                                    >
                                                        Abort
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={handleSetReminder}
                                                    disabled={
                                                        !reminderTime || 
                                                        selectedChannels.length === 0 || 
                                                        ((selectedChannels.includes('WHATSAPP') || selectedChannels.includes('EMAIL') || selectedChannels.includes('SMS')) && !recipient) ||
                                                        settingReminder
                                                    }
                                                    className="flex-[2] h-11 bg-primary text-primary-foreground rounded-theme font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {settingReminder ? <Loader className="animate-spin h-4 w-4" /> : <Bell className="h-4 w-4" />}
                                                    {isRescheduling ? 'Confirm Reschedule' : 'Configure Alert Protocol'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Task Drawer */}
            <AnimatePresence>
                {isTaskDrawerOpen && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsTaskDrawerOpen(false)} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-full max-w-lg bg-card h-full shadow-2xl border-l border-border flex flex-col">
                            <CrmTaskForm 
                                item={itemToEdit} 
                                onSave={handleSaveTask} 
                                onCancel={() => setIsTaskDrawerOpen(false)} 
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Event Drawer */}
            <AnimatePresence>
                {isEventDrawerOpen && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEventDrawerOpen(false)} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-full max-w-lg bg-card h-full shadow-2xl border-l border-border flex flex-col">
                            <CrmEventForm 
                                item={itemToEdit} 
                                onSave={handleSaveEvent} 
                                onCancel={() => setIsEventDrawerOpen(false)} 
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CrmCalendarPage;
