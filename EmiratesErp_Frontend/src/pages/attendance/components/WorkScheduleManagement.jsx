import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit, Trash2, Loader, AlertCircle, Save, Clock, Calendar } from 'lucide-react';
import * as workScheduleApi from './workScheduleApi';
import * as workCalendarApi from './workCalendarApi';
import axios from 'axios';
import Modal from '../../../pages/Modal';
import { toast } from 'react-toastify';

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const WorkScheduleManagement = ({ embedded = false }) => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSchedule, setCurrentSchedule] = useState(null);
    const [holidayPolicies, setHolidayPolicies] = useState([]);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const schResp = await workScheduleApi.getAllWorkSchedules();
            setSchedules(schResp.data);
        } catch (err) {
            console.error("Failed to fetch schedules:", err);
            setError('Could not load work schedules.');
        }

        try {
            const hpResp = await workCalendarApi.getAllHolidayPolicies();
            setHolidayPolicies(hpResp.data);
        } catch (err) {
            console.error("Failed to fetch holiday policies:", err);
            // We don't block the whole page if just holiday policies fail
            toast.warning("Could not load holiday policies. Some features may be limited.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (sch = null) => {
        setCurrentSchedule(sch);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await workScheduleApi.deleteWorkSchedule(id);
                toast.success('Schedule deleted');
                fetchData();
            } catch (err) {
                toast.error('Failed to delete');
            }
        }
    };

    const handleSave = async (formData) => {
        try {
            if (currentSchedule?.id) {
                await workScheduleApi.updateWorkSchedule(currentSchedule.id, formData);
                toast.success('Schedule updated');
            } else {
                await workScheduleApi.createWorkSchedule(formData);
                toast.success('Schedule created');
            }
            fetchData();
            setIsModalOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Save failed');
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin" /></div>;

    const content = (
        <div className={embedded ? '' : 'p-6 bg-background'}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Work Schedules</h1>
                        <p className="text-sm text-foreground-muted">Define weekly working hours and link to holiday calendars</p>
                    </div>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add New Schedule
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schedules.map((sch) => (
                    <div key={sch.id} className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-foreground text-lg">{sch.name}</h3>
                                <p className="text-xs font-mono text-foreground-muted opacity-60">{sch.code}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${sch.active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-background-muted text-foreground-muted border-border'}`}>
                                {sch.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-foreground-muted">
                                <Calendar size={14} className="opacity-50" />
                                <span>{sch.holidayPolicy?.name || 'No Holiday Policy Linked'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground-muted">
                                <Clock size={14} className="opacity-50" />
                                <span>{sch.totalWeeklyHours} Hours / Week</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-4">
                            {DAYS_OF_WEEK.map((day, idx) => {
                                const dayData = sch.days?.find(d => d.dayOfWeek === day);
                                return (
                                    <div key={day} title={`${day}: ${dayData?.workingHours || 0}h`} className={`h-8 rounded-sm flex flex-col items-center justify-center text-[8px] font-bold border transition-colors ${dayData?.isWorkingDay ? 'bg-primary/10 text-primary border-primary/20' : 'bg-background-muted text-foreground-muted border-border opacity-50'}`}>
                                        {day.substring(0, 1)}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-end gap-2 border-t border-border pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(sch)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(sch.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <WorkScheduleModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    schedule={currentSchedule}
                    holidayPolicies={holidayPolicies}
                />
            )}
        </div>
    );

    return content;
};

const WorkScheduleModal = ({ isOpen, onClose, onSave, schedule, holidayPolicies }) => {
    const [formData, setFormData] = useState({
        name: schedule?.name || '',
        code: schedule?.code || '',
        holidayPolicyId: schedule?.holidayPolicy?.id || '',
        active: schedule !== null ? schedule.active : true,
        days: DAYS_OF_WEEK.map(day => {
            const existing = schedule?.days?.find(d => d.dayOfWeek === day);
            return {
                dayOfWeek: day,
                workingHours: existing?.workingHours || 8,
                isWorkingDay: existing !== undefined ? existing.isWorkingDay : (day !== 'SATURDAY' && day !== 'SUNDAY')
            };
        })
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleDayChange = (index, field, value) => {
        const newDays = [...formData.days];
        newDays[index][field] = field === 'isWorkingDay' ? value : parseFloat(value);
        setFormData(prev => ({ ...prev, days: newDays }));
    };

    const totalHours = useMemo(() => {
        return formData.days.reduce((sum, day) => sum + (day.isWorkingDay ? day.workingHours : 0), 0);
    }, [formData.days]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={schedule ? 'Edit Work Schedule' : 'Create Work Schedule'}>
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[85vh] overflow-y-auto px-1">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-foreground-muted mb-1">Schedule Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input bg-background border-border rounded-theme text-foreground focus:ring-primary focus:border-primary" placeholder="e.g. Standard 40h Week" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1">Code</label>
                        <input type="text" name="code" value={formData.code} onChange={handleChange} required className="input bg-background border-border rounded-theme text-foreground focus:ring-primary focus:border-primary uppercase" placeholder="SCH-001" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1">Holiday Policy</label>
                        <select name="holidayPolicyId" value={formData.holidayPolicyId} onChange={handleChange} className="input bg-background border-border rounded-theme text-foreground focus:ring-primary focus:border-primary">
                            <option value="">None (Global Holidays Only)</option>
                            {holidayPolicies.map(hp => <option key={hp.id} value={hp.id}>{hp.name} ({hp.year})</option>)}
                        </select>
                        {holidayPolicies.length === 0 && (
                            <p className="text-[10px] text-warning mt-1 font-medium">No holiday policies found. Create one in 'Work Calendar' first.</p>
                        )}
                    </div>
                    <div className="col-span-2">
                        <label className="inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="h-4 w-4 rounded-theme border-border text-primary focus:ring-primary" />
                            <span className="ml-2 text-sm text-foreground font-medium">Set as Active</span>
                        </label>
                    </div>
                </div>

                <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-foreground">Weekly Working Days</h3>
                        <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                            Total: {totalHours} Hours
                        </div>
                    </div>
                    <div className="space-y-2">
                        {formData.days.map((day, idx) => (
                            <div key={day.dayOfWeek} className={`flex items-center gap-4 p-3 rounded-theme border transition-all ${day.isWorkingDay ? 'bg-background-muted border-primary/20' : 'bg-card border-border opacity-40'}`}>
                                <div className="w-24 shrink-0 font-bold text-foreground text-xs">{day.dayOfWeek}</div>
                                <div className="flex-1">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={day.isWorkingDay} onChange={(e) => handleDayChange(idx, 'isWorkingDay', e.target.checked)} className="sr-only peer" />
                                        <div className="relative w-10 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                        <span className={`ml-3 text-xs font-black uppercase tracking-wider ${day.isWorkingDay ? 'text-primary' : 'text-foreground-muted'}`}>
                                            {day.isWorkingDay ? 'Working' : 'Off'}
                                        </span>
                                    </label>
                                </div>
                                <div className={`flex items-center gap-2 ${!day.isWorkingDay && 'invisible'}`}>
                                    <input type="number" step="0.5" value={day.workingHours} onChange={(e) => handleDayChange(idx, 'workingHours', e.target.value)} className="w-16 px-2 py-1 border border-border bg-card rounded-theme text-sm text-center text-foreground font-mono" />
                                    <span className="text-xs text-foreground-muted font-medium">hrs</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-foreground-muted hover:bg-background-muted rounded-theme transition-colors">Cancel</button>
                    <button type="submit" className="btn-primary px-6 py-2 rounded-theme shadow-lg shadow-primary/20 flex items-center gap-2">
                        <Save size={18} /> Save Schedule
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default WorkScheduleManagement;
