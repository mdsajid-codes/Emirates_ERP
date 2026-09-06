import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Loader,
    PhoneCall,
    Mail,
    Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCrmPermissions } from '../context/CrmPermissionsContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CrmCalendarPage = () => {
    const navigate = useNavigate();
    const { hasPermission } = useCrmPermissions();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedCellDate, setSelectedCellDate] = useState('');
    const [isCellModalOpen, setIsCellModalOpen] = useState(false);
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
            
            // Fetch calendar events AND raw tasks to ensure tasks display accurately
            const [eventsRes, tasksRes] = await Promise.all([
                axios.get(`${API_URL}/crm/calendar/events`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/crm/tasks`, { headers }).catch(() => ({ data: [] }))
            ]);

            const calendarEvents = eventsRes.data || [];
            const rawTasks = tasksRes.data || [];

            // Map raw tasks into calendar item format if not already in calendar response
            const existingTaskIds = new Set(calendarEvents.filter(i => i.type === 'TASK').map(i => i.id));

            const compiledTasks = rawTasks.filter(t => !existingTaskIds.has(t.id)).map(t => ({
                id: t.id,
                type: 'TASK',
                title: t.comments || `${t.subject || 'Task'} Follow-up`,
                date: t.dueDate || new Date().toISOString().split('T')[0],
                startTime: t.callTime || '09:00:00',
                status: t.status || 'PENDING',
                subject: t.subject,
                leadId: t.leadId,
                leadName: t.leadName
            }));

            setItems([...calendarEvents, ...compiledTasks]);
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

    const getItemBadgeStyle = (item) => {
        if (item.type === 'TASK') {
            return 'bg-blue-50 text-blue-700 border-l-2 border-blue-500 hover:bg-blue-100';
        }
        return 'bg-teal-50 text-teal-700 border-l-2 border-teal-500 hover:bg-teal-100';
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#F8FAFC] text-[#102A43] p-0 overflow-hidden font-sans">
            <div className="p-3 sm:p-4 bg-[#F8FAFC] flex flex-col gap-3 flex-1 overflow-y-auto">
                {/* Standard Top Header Bar */}
                <div className="bg-white p-2.5 sm:p-3 border border-[#D7E3EE] rounded-lg shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex bg-[#F8FAFC] p-1 rounded-lg border border-[#D7E3EE]">
                            <button
                                className="px-3 py-1 text-xs font-bold text-[#00A3A6] bg-white rounded shadow-xs"
                            >
                                STRATEGIC CALENDAR
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {hasPermission('TASK', 'create') && (
                            <button 
                                onClick={() => navigate('/crm-dashboard/tasks/new')}
                                className="px-3 py-1.5 text-xs font-bold text-[#0178BC] bg-[#0178BC]/10 rounded-md hover:bg-[#0178BC] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                                <Plus size={14} /> Add Task
                            </button>
                        )}
                        {hasPermission('EVENT', 'create') && (
                            <button 
                                onClick={() => navigate('/crm-dashboard/calendar/events/new')}
                                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#00A3A6] rounded-md hover:bg-[#008B8E] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                            >
                                <Plus size={14} /> Add Event
                            </button>
                        )}
                    </div>
                </div>

                {/* Calendar Board Container */}
                <div className="bg-white border border-[#D7E3EE] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1 min-h-[580px]">
                    {/* Month Navigator Header */}
                    <div className="p-3 border-b border-[#D7E3EE] flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <h2 className="text-base font-bold text-[#102A43] min-w-[180px]">
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            <div className="flex items-center bg-[#F8FAFC] rounded-md border border-[#D7E3EE] p-0.5">
                                <button onClick={handlePrevMonth} className="p-1 text-[#60738E] hover:bg-white rounded transition-colors"><ChevronLeft size={16} /></button>
                                <button onClick={handleToday} className="px-2.5 text-xs font-bold text-[#102A43] hover:bg-white rounded transition-colors">Today</button>
                                <button onClick={handleNextMonth} className="p-1 text-[#60738E] hover:bg-white rounded transition-colors"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-[#60738E]">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Tasks</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Events / Meetings</span>
                        </div>
                    </div>

                    {/* Grid Days Header */}
                    <div className="grid grid-cols-7 border-b border-[#D7E3EE] bg-[#F8FAFC]">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-2 text-center text-[11px] font-bold text-[#60738E] uppercase tracking-wider border-r border-[#D7E3EE] last:border-r-0">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grid Month Cells */}
                    <div className="grid grid-cols-7 flex-1 overflow-y-auto custom-scrollbar">
                        {calendarGrid.map((cell, idx) => {
                            const dateItems = getItemsForDate(cell.day, cell.month, cell.year);
                            const isToday = new Date().toDateString() === new Date(cell.year, cell.month, cell.day).toDateString();
                            
                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => {
                                        const dateStr = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                                        setSelectedCellDate(dateStr);
                                        setIsCellModalOpen(true);
                                    }}
                                    className={`min-h-[145px] p-1.5 border-r border-b border-[#D7E3EE] flex flex-col gap-1 transition-all hover:bg-blue-50/40 cursor-pointer group ${!cell.currentMonth ? 'bg-slate-50/40 opacity-40' : 'bg-white'}`}
                                >
                                    <div className="flex justify-between items-start mb-0.5 shrink-0">
                                        <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${isToday ? 'bg-[#00A3A6] text-white shadow-xs' : 'text-[#60738E]'}`}>
                                            {cell.day}
                                        </span>
                                        {dateItems.length > 0 && (
                                            <span className="text-[10px] font-bold text-[#60738E] bg-[#F8FAFC] border border-[#D7E3EE] px-1.5 py-0.2 rounded-full">
                                                {dateItems.length}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[110px] custom-scrollbar pr-0.5">
                                        {dateItems.map(item => (
                                            <button 
                                                key={`${item.type}-${item.id}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedItem(item);
                                                }}
                                                className={`text-[10px] font-semibold px-2 py-0.5 rounded text-left truncate transition-all cursor-pointer shadow-2xs shrink-0 ${getItemBadgeStyle(item)}`}
                                            >
                                                {item.startTime && <span className="font-bold mr-1 opacity-80">{item.startTime.substring(0,5)}</span>}
                                                <span>{item.type === 'TASK' ? `[Task] ${item.title}` : item.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Item Details Sidebar Drawer */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                            onClick={() => setSelectedItem(null)}
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-[#D7E3EE] flex flex-col z-50"
                        >
                            <header className="p-4 border-b border-[#D7E3EE] flex items-center justify-between bg-[#F8FAFC]">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${selectedItem.type === 'TASK' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>
                                        <CalendarIcon size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#102A43]">{selectedItem.title}</h3>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#60738E]">{selectedItem.type} Details</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedItem(null)} className="p-1.5 hover:bg-slate-200 rounded-full text-[#60738E] transition-colors"><X size={18} /></button>
                            </header>

                            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                                <div className="flex items-center justify-between bg-[#F8FAFC] p-3 border border-[#D7E3EE] rounded-lg">
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#102A43]">
                                        <Clock size={14} className="text-[#0178BC]" />
                                        <span>{selectedItem.date} {selectedItem.startTime ? `@ ${selectedItem.startTime.substring(0,5)}` : ''}</span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (selectedItem.type === 'TASK') {
                                                navigate(`/crm-dashboard/tasks/edit/${selectedItem.id}`);
                                            } else {
                                                navigate(`/crm-dashboard/calendar/events/edit/${selectedItem.id}`);
                                            }
                                        }}
                                        className="px-2.5 py-1 bg-white border border-[#C9D8E5] text-[#0178BC] rounded text-xs font-bold hover:bg-blue-50 flex items-center gap-1 cursor-pointer"
                                    >
                                        <Edit3 size={12} /> Edit {selectedItem.type === 'TASK' ? 'Task' : 'Event'}
                                    </button>
                                </div>

                                {selectedItem.leadName && (
                                    <div className="flex items-center gap-2 text-xs text-[#102A43] font-medium">
                                        <Users size={14} className="text-[#60738E]" />
                                        <span>Related Lead: <strong>{selectedItem.leadName}</strong></span>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#60738E]">Description / Remarks</h4>
                                    <p className="text-xs text-[#102A43] leading-relaxed bg-[#F8FAFC] p-3 rounded-md border border-[#D7E3EE] italic">
                                        {selectedItem.description || selectedItem.comments || "No strategic brief provided for this engagement."}
                                    </p>
                                </div>

                                {/* Reminder Section */}
                                <div className="pt-4 border-t border-[#D7E3EE]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Bell size={15} className="text-[#0178BC]" />
                                        <h4 className="text-xs font-bold uppercase text-[#102A43]">Reminder Settings</h4>
                                    </div>
                                    
                                    {selectedItem.reminderId && !isRescheduling ? (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs font-medium text-blue-900">
                                                        Active alert scheduled for:
                                                    </p>
                                                    <p className="text-sm font-bold text-blue-900 mt-0.5">
                                                        {new Date(selectedItem.remindAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <button 
                                                        onClick={() => setIsRescheduling(true)}
                                                        className="text-[10px] font-bold bg-[#0178BC] text-white px-2.5 py-1 rounded hover:bg-[#005A8C] transition-all"
                                                    >
                                                        Reschedule
                                                    </button>
                                                    <button 
                                                        onClick={handleDeleteReminder}
                                                        className="text-[10px] font-bold bg-white border border-red-200 text-red-600 px-2.5 py-1 rounded hover:bg-red-50 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-[#60738E] uppercase">Delivery Channels</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {[
                                                        { id: 'SYSTEM', label: 'Pop-up', color: 'bg-[#0178BC]' },
                                                        { id: 'WHATSAPP', label: 'WhatsApp', color: 'bg-emerald-600' },
                                                        { id: 'EMAIL', label: 'Email', color: 'bg-blue-600' },
                                                        { id: 'SMS', label: 'SMS', color: 'bg-orange-500' }
                                                    ].map(ch => {
                                                        const active = selectedChannels.includes(ch.id);
                                                        return (
                                                            <button
                                                                key={ch.id}
                                                                onClick={() => setSelectedChannels(prev => 
                                                                    active ? prev.filter(p => p !== ch.id) : [...prev, ch.id]
                                                                )}
                                                                className={`px-3 py-1 rounded text-[10px] font-bold transition-all border ${
                                                                    active 
                                                                    ? `${ch.color} text-white border-transparent shadow-xs` 
                                                                    : 'bg-white text-[#60738E] border-[#C9D8E5]'
                                                                }`}
                                                            >
                                                                {ch.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {(selectedChannels.includes('WHATSAPP') || selectedChannels.includes('EMAIL') || selectedChannels.includes('SMS')) && (
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-[#60738E] uppercase">Recipient (Phone or Email)</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder={selectedChannels.includes('EMAIL') ? 'email@example.com' : '+971...'}
                                                        value={recipient}
                                                        onChange={(e) => setRecipient(e.target.value)}
                                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] outline-none h-8"
                                                    />
                                                </div>
                                            )}

                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-[#60738E] uppercase">Target Alert Time</label>
                                                <input 
                                                    type="time" 
                                                    value={reminderTime}
                                                    onChange={(e) => setReminderTime(e.target.value)}
                                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] outline-none h-8"
                                                />
                                            </div>

                                            <button 
                                                onClick={handleSetReminder}
                                                disabled={!reminderTime || selectedChannels.length === 0 || settingReminder}
                                                className="w-full py-1.5 bg-[#0178BC] text-white rounded-md font-bold text-xs hover:bg-[#005A8C] transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
                                            >
                                                {settingReminder ? <Loader size={14} className="animate-spin" /> : <Bell size={14} />}
                                                Configure Reminder
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Grid Date Cell Schedule Summary Modal */}
            <AnimatePresence>
                {isCellModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                            onClick={() => setIsCellModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-md bg-white rounded-lg shadow-2xl border border-[#D7E3EE] z-50 overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="p-4 border-b border-[#D7E3EE] flex justify-between items-center bg-[#F8FAFC]">
                                <div>
                                    <h3 className="text-sm font-bold text-[#102A43]">Assigned Schedule Summary</h3>
                                    <p className="text-xs text-[#60738E] mt-0.5">Date: <strong>{selectedCellDate}</strong></p>
                                </div>
                                <button onClick={() => setIsCellModalOpen(false)} className="p-1 rounded-full text-[#60738E] hover:bg-slate-200 transition-colors"><X size={18} /></button>
                            </div>
                            
                            <div className="p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
                                {(() => {
                                    const cellItems = items.filter(i => i.date === selectedCellDate);
                                    const taskCount = cellItems.filter(i => i.type === 'TASK').length;
                                    const eventCount = cellItems.filter(i => i.type === 'EVENT' || i.type !== 'TASK').length;

                                    if (cellItems.length === 0) {
                                        return (
                                            <div className="py-8 text-center text-xs text-[#60738E]">
                                                No tasks or events assigned on <strong>{selectedCellDate}</strong>.
                                            </div>
                                        );
                                    }

                                    return (
                                        <>
                                            <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-2.5 border border-[#D7E3EE] rounded-lg text-xs">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-[#60738E] uppercase">Total Tasks</span>
                                                    <span className="text-sm font-bold text-blue-600">{taskCount}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-[#60738E] uppercase">Total Events / Meetings</span>
                                                    <span className="text-sm font-bold text-teal-600">{eventCount}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mt-1">
                                                <h4 className="text-xs font-bold text-[#102A43]">Schedule List ({cellItems.length})</h4>
                                                <div className="flex flex-col gap-2">
                                                    {cellItems.map(item => (
                                                        <div 
                                                            key={`${item.type}-${item.id}`}
                                                            onClick={() => {
                                                                setIsCellModalOpen(false);
                                                                setSelectedItem(item);
                                                            }}
                                                            className={`p-3 rounded-lg border text-xs cursor-pointer transition-all hover:shadow-xs flex items-start justify-between gap-2 ${
                                                                item.type === 'TASK' 
                                                                ? 'bg-blue-50/50 border-blue-200 hover:bg-blue-100/50' 
                                                                : 'bg-teal-50/50 border-teal-200 hover:bg-teal-100/50'
                                                            }`}
                                                        >
                                                            <div className="flex flex-col gap-1 min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                                                                        item.type === 'TASK' ? 'bg-blue-600 text-white' : 'bg-[#00A3A6] text-white'
                                                                    }`}>
                                                                        {item.type}
                                                                    </span>
                                                                    {item.startTime && (
                                                                        <span className="text-[11px] font-bold text-[#60738E]">
                                                                            {item.startTime.substring(0, 5)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <h5 className="font-bold text-[#102A43] truncate">{item.title}</h5>
                                                                {item.leadName && (
                                                                    <p className="text-[11px] text-[#60738E]">Lead: {item.leadName}</p>
                                                                )}
                                                            </div>

                                                            <span className="text-[10px] font-bold text-[#0178BC] shrink-0 hover:underline">
                                                                View Details →
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {loading && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-xs z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-[#00A3A6] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-[#00A3A6]">Loading strategic calendar...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrmCalendarPage;
