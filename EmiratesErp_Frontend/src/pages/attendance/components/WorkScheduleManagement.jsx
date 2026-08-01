import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Plus, Edit, Trash2, Loader, AlertCircle, Save, Clock, Calendar, ArrowLeft, ChevronDown, Check, RefreshCw, Sparkles } from 'lucide-react';
import * as workScheduleApi from './workScheduleApi';
import * as workCalendarApi from './workCalendarApi';
import { toast } from 'react-toastify';

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const CustomSelect = ({ value, onChange, options, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between pl-2.5 pr-2 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all cursor-pointer shadow-2xs hover:bg-background-muted/50"
            >
                <span className={`truncate ${selectedOption ? 'text-foreground font-medium' : 'text-foreground-muted'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-foreground-muted transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 p-1 space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                    <div
                        onClick={() => {
                            onChange('');
                            setIsOpen(false);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            !value ? 'bg-primary/10 text-primary font-bold' : 'text-foreground-muted hover:bg-background-muted'
                        }`}
                    >
                        {placeholder}
                    </div>
                    {options.map(opt => {
                        const isSelected = String(opt.value) === String(value);
                        return (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                                    isSelected 
                                        ? 'bg-primary text-primary-foreground font-bold' 
                                        : 'text-foreground hover:bg-primary/10 hover:text-primary'
                                }`}
                            >
                                <span className="truncate">{opt.label}</span>
                                {isSelected && <Check className="h-3 w-3 shrink-0 ml-1" />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const WorkScheduleManagement = ({ embedded = false }) => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
    const [currentSchedule, setCurrentSchedule] = useState(null);
    const [holidayPolicies, setHolidayPolicies] = useState([]);
    const [saving, setSaving] = useState(false);

    const generateRandomCode = () => {
        const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit random number (100 - 999)
        return `SCH-${randomNum}`;
    };

    // Form State for create/edit
    const [formData, setFormData] = useState({
        name: '',
        code: generateRandomCode(),
        holidayPolicyId: '',
        active: true,
        days: DAYS_OF_WEEK.map(day => ({
            dayOfWeek: day,
            workingHours: 8,
            isWorkingDay: day !== 'SATURDAY' && day !== 'SUNDAY'
        }))
    });

    const handleGenerateCode = () => {
        setFormData(prev => ({ ...prev, code: generateRandomCode() }));
    };

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
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenForm = (sch = null) => {
        setCurrentSchedule(sch);
        if (sch) {
            setFormData({
                name: sch.name || '',
                code: sch.code || '',
                holidayPolicyId: sch.holidayPolicy?.id || '',
                active: sch.active !== undefined ? sch.active : true,
                days: DAYS_OF_WEEK.map(day => {
                    const existing = sch.days?.find(d => d.dayOfWeek === day);
                    return {
                        dayOfWeek: day,
                        workingHours: existing?.workingHours || 8,
                        isWorkingDay: existing !== undefined ? existing.isWorkingDay : (day !== 'SATURDAY' && day !== 'SUNDAY')
                    };
                })
            });
        } else {
            setFormData({
                name: '',
                code: generateRandomCode(),
                holidayPolicyId: '',
                active: true,
                days: DAYS_OF_WEEK.map(day => ({
                    dayOfWeek: day,
                    workingHours: 8,
                    isWorkingDay: day !== 'SATURDAY' && day !== 'SUNDAY'
                }))
            });
        }
        setViewMode('form');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            try {
                await workScheduleApi.deleteWorkSchedule(id);
                fetchData();
            } catch (err) {
                console.error('Failed to delete schedule:', err);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (currentSchedule?.id) {
                await workScheduleApi.updateWorkSchedule(currentSchedule.id, formData);
            } else {
                await workScheduleApi.createWorkSchedule(formData);
            }
            fetchData();
            setViewMode('list');
        } catch (err) {
            console.error('Failed to save schedule:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDayChange = (index, field, value) => {
        const newDays = [...formData.days];
        newDays[index][field] = field === 'isWorkingDay' ? value : parseFloat(value || 0);
        setFormData(prev => ({ ...prev, days: newDays }));
    };

    const totalHours = useMemo(() => {
        return formData.days.reduce((sum, day) => sum + (day.isWorkingDay ? (day.workingHours || 0) : 0), 0);
    }, [formData.days]);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <Loader className="animate-spin text-primary h-6 w-6" />
            </div>
        );
    }

    return (
        <div className={`${embedded ? '' : 'p-4 md:p-6'} space-y-4 text-foreground bg-background min-h-full flex-1 w-full pb-8`}>
            {viewMode === 'list' ? (
                <>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                        <div>
                            <h2 className="text-xs font-bold text-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                Work Schedules
                            </h2>
                            <p className="text-[11px] text-foreground-muted">Define weekly working hours and link to holiday calendars.</p>
                        </div>
                        <button 
                            onClick={() => handleOpenForm(null)} 
                            className="px-3 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-all shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
                        >
                            <Plus className="h-3.5 w-3.5" /> Add New Schedule
                        </button>
                    </div>

                    {/* Schedules Grid */}
                    {schedules.length === 0 ? (
                        <div className="bg-card p-12 rounded-2xl border border-border text-center flex flex-col items-center gap-2">
                            <Clock className="h-8 w-8 text-foreground-muted/30" />
                            <p className="text-xs font-semibold text-foreground-muted">No work schedules found.</p>
                            <button 
                                onClick={() => handleOpenForm(null)} 
                                className="mt-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all"
                            >
                                Create First Schedule
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                            {schedules.map((sch) => (
                                <div key={sch.id} className="bg-card rounded-2xl shadow-xs border border-border p-4 hover:border-primary/40 transition-all relative group flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-foreground text-xs">{sch.name}</h3>
                                                <p className="text-[10px] font-mono text-foreground-muted">{sch.code}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold border ${sch.active ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-background-muted text-foreground-muted border-border'}`}>
                                                {sch.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5 mb-4">
                                            <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                                                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                                                <span className="truncate">{sch.holidayPolicy?.name || 'No Holiday Policy Linked'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                                                <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                                                <span className="font-semibold text-foreground">{sch.totalWeeklyHours} Hours / Week</span>
                                            </div>
                                        </div>

                                        {/* Day Pills */}
                                        <div className="grid grid-cols-7 gap-1 mb-4">
                                            {DAYS_OF_WEEK.map((day) => {
                                                const dayData = sch.days?.find(d => d.dayOfWeek === day);
                                                return (
                                                    <div 
                                                        key={day} 
                                                        title={`${day}: ${dayData?.workingHours || 0}h`} 
                                                        className={`h-7 rounded-lg flex flex-col items-center justify-center text-[9px] font-bold border transition-colors ${
                                                            dayData?.isWorkingDay 
                                                                ? 'bg-primary/10 text-primary border-primary/20' 
                                                                : 'bg-background/40 text-foreground-muted border-border/40 opacity-40'
                                                        }`}
                                                    >
                                                        {day.substring(0, 1)}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-1.5 border-t border-border pt-3">
                                        <button 
                                            onClick={() => handleOpenForm(sch)} 
                                            className="p-1.5 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-lg transition-colors" 
                                            title="Edit Schedule"
                                        >
                                            <Edit className="h-3.5 w-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(sch.id)} 
                                            className="p-1.5 text-foreground-muted hover:text-red-600 hover:bg-background-muted rounded-lg transition-colors" 
                                            title="Delete Schedule"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                /* In-Page Full Page Form View */
                <form onSubmit={handleSave} className="w-full space-y-4">
                    {/* Header bar with Back button */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                        <div className="flex items-center gap-2.5">
                            <button 
                                type="button"
                                onClick={() => setViewMode('list')} 
                                className="p-1.5 hover:bg-background-muted rounded-lg border border-border flex items-center gap-1.5 text-xs font-semibold transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Back to Schedules</span>
                            </button>
                            <h2 className="text-xs font-bold text-foreground">
                                {currentSchedule ? 'Edit Work Schedule' : 'Create Work Schedule'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                type="button" 
                                onClick={() => setViewMode('list')} 
                                className="px-3 py-1 text-xs font-semibold text-foreground-muted hover:bg-background-muted border border-border rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="px-3.5 py-1 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {saving ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                                {saving ? 'Saving...' : 'Save Schedule'}
                            </button>
                        </div>
                    </div>

                    {/* Schedule Configuration Card */}
                    <div className="bg-card p-3.5 rounded-xl shadow-xs border border-border space-y-3">
                        <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5">Schedule Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Schedule Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
                                    required 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all" 
                                    placeholder="e.g. Standard 40h Week" 
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Code</label>
                                <div className="relative w-full">
                                    <input 
                                        type="text" 
                                        name="code" 
                                        value={formData.code} 
                                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))} 
                                        required 
                                        className="w-full pl-2.5 pr-8 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all uppercase font-mono" 
                                        placeholder="SCH-001" 
                                    />
                                    <button
                                        type="button"
                                        onClick={handleGenerateCode}
                                        title="Generate random code (SCH-XXX)"
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Holiday Policy</label>
                                <CustomSelect 
                                    value={formData.holidayPolicyId}
                                    onChange={(val) => setFormData(prev => ({ ...prev, holidayPolicyId: val }))}
                                    options={holidayPolicies.map(hp => ({ value: hp.id, label: `${hp.name} (${hp.year})` }))}
                                    placeholder="None (Global Holidays Only)"
                                />
                                {holidayPolicies.length === 0 && (
                                    <p className="text-[10px] text-amber-500 mt-1 font-medium">No holiday policies found. Create one in 'Work Calendar' first.</p>
                                )}
                            </div>

                            <div className="sm:col-span-2 lg:col-span-3 pt-0.5">
                                <label className="inline-flex items-center cursor-pointer gap-2">
                                    <input 
                                        type="checkbox" 
                                        name="active" 
                                        checked={formData.active} 
                                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))} 
                                        className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary accent-primary" 
                                    />
                                    <span className="text-xs text-foreground font-semibold">Set as Active Schedule</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Working Days Card */}
                    <div className="bg-card p-3.5 rounded-xl shadow-xs border border-border space-y-3">
                        <div className="flex justify-between items-center border-b border-border pb-1.5">
                            <h3 className="text-xs font-bold text-foreground">Weekly Working Days</h3>
                            <div className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                Total: {totalHours} Hours / Week
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            {formData.days.map((day, idx) => (
                                <div 
                                    key={day.dayOfWeek} 
                                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg border transition-all ${
                                        day.isWorkingDay ? 'bg-background border-primary/20' : 'bg-background/40 border-border/40 opacity-50'
                                    }`}
                                >
                                    <div className="w-24 shrink-0 font-bold text-foreground text-xs">{day.dayOfWeek}</div>

                                    <div className="flex-1 flex items-center gap-3">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={day.isWorkingDay} 
                                                onChange={(e) => handleDayChange(idx, 'isWorkingDay', e.target.checked)} 
                                                className="sr-only peer" 
                                            />
                                            <div className="relative w-8 h-4 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                                            <span className={`ml-2 text-[11px] font-bold uppercase tracking-wider ${day.isWorkingDay ? 'text-primary' : 'text-foreground-muted'}`}>
                                                {day.isWorkingDay ? 'Working' : 'Off'}
                                            </span>
                                        </label>
                                    </div>

                                    <div className={`flex items-center gap-1.5 ${!day.isWorkingDay ? 'invisible' : ''}`}>
                                        <input 
                                            type="number" 
                                            step="0.5" 
                                            min="0"
                                            max="24"
                                            value={day.workingHours} 
                                            onChange={(e) => handleDayChange(idx, 'workingHours', e.target.value)} 
                                            className="w-14 px-1.5 py-0.5 border border-border bg-card rounded-md text-xs text-center text-foreground font-mono focus:outline-none focus:border-primary" 
                                        />
                                        <span className="text-[11px] text-foreground-muted font-medium">hrs</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default WorkScheduleManagement;
