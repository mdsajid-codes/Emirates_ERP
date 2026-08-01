import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, Loader, AlertCircle, Save, Calendar, Globe, MapPin, X, Info, ChevronDown, Check, ArrowLeft, HelpCircle } from 'lucide-react';
import * as workCalendarApi from './workCalendarApi';
import { toast } from 'react-toastify';

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

const WorkCalendarManagement = ({ embedded = false }) => {
    const [activeTab, setActiveTab] = useState('policies');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'policyForm' | 'exceptionForm'
    const [showHelp, setShowHelp] = useState(false);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPolicy, setCurrentPolicy] = useState(null);
    const [currentException, setCurrentException] = useState(null);
    const [exceptions, setExceptions] = useState([]);
    const [selectedPolicyId, setSelectedPolicyId] = useState('');
    const [saving, setSaving] = useState(false);

    // Form States
    const [policyFormData, setPolicyFormData] = useState({
        name: '',
        year: new Date().getFullYear(),
        regionCode: 'GLOBAL',
        holidays: []
    });

    const [exceptionFormData, setExceptionFormData] = useState({
        holidayPolicyId: '',
        exceptionDate: '',
        workingDay: true,
        reason: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const resp = await workCalendarApi.getAllHolidayPolicies();
            setPolicies(resp.data);
            if (resp.data.length > 0 && !selectedPolicyId) {
                setSelectedPolicyId(resp.data[0].id.toString());
            }
        } catch (err) {
            setError('Failed to fetch policies.');
        } finally {
            setLoading(false);
        }
    }, [selectedPolicyId]);

    const fetchExceptions = useCallback(async (policyId) => {
        if (!policyId) return;
        try {
            const resp = await workCalendarApi.getExceptionsByPolicy(policyId);
            setExceptions(resp.data);
        } catch (err) {
            console.error('Failed to fetch exceptions:', err);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (activeTab === 'exceptions' && selectedPolicyId) {
            fetchExceptions(selectedPolicyId);
        }
    }, [activeTab, selectedPolicyId, fetchExceptions]);

    const handleOpenPolicyForm = (policy = null) => {
        setCurrentPolicy(policy);
        setPolicyFormData({
            name: policy?.name || '',
            year: policy?.year || new Date().getFullYear(),
            regionCode: policy?.regionCode || 'GLOBAL',
            holidays: policy?.holidays?.map(h => ({ date: h.date, name: h.name, isPaid: h.isPaid, isOptional: h.isOptional })) || []
        });
        setViewMode('policyForm');
    };

    const handleOpenExceptionForm = (exception = null) => {
        setCurrentException(exception);
        setExceptionFormData({
            holidayPolicyId: selectedPolicyId,
            exceptionDate: exception?.exceptionDate || '',
            workingDay: exception !== null ? exception.workingDay : true,
            reason: exception?.reason || ''
        });
        setViewMode('exceptionForm');
    };

    const handleSavePolicy = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (currentPolicy?.id) {
                await workCalendarApi.updateHolidayPolicy(currentPolicy.id, policyFormData);
            } else {
                await workCalendarApi.createHolidayPolicy(policyFormData);
            }
            fetchData();
            setViewMode('list');
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveException = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (currentException?.id) {
                await workCalendarApi.updateException(currentException.id, exceptionFormData);
            } else {
                await workCalendarApi.createException(exceptionFormData);
            }
            fetchExceptions(selectedPolicyId);
            setViewMode('list');
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePolicy = async (id) => {
        if (window.confirm('Are you sure you want to delete this policy?')) {
            try {
                await workCalendarApi.deleteHolidayPolicy(id);
                fetchData();
            } catch (err) { console.error('Delete failed:', err); }
        }
    };

    const handleDeleteException = async (id) => {
        if (window.confirm('Are you sure you want to delete this exception?')) {
            try {
                await workCalendarApi.deleteException(id);
                fetchExceptions(selectedPolicyId);
            } catch (err) { console.error('Delete failed:', err); }
        }
    };

    const addHoliday = () => setPolicyFormData(p => ({ ...p, holidays: [...p.holidays, { date: '', name: '', isPaid: true, isOptional: false }] }));
    const removeHoliday = (idx) => setPolicyFormData(p => ({ ...p, holidays: p.holidays.filter((_, i) => i !== idx) }));
    const handleHolidayChange = (idx, field, val) => {
        const h = [...policyFormData.holidays];
        h[idx][field] = val;
        setPolicyFormData(p => ({ ...p, holidays: h }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <Loader className="animate-spin text-primary h-6 w-6" />
            </div>
        );
    }

    return (
        <div className={`${embedded ? '' : 'p-4 md:p-6'} space-y-4 text-foreground bg-background min-h-full w-full pb-8`}>
            {viewMode === 'list' ? (
                <>
                    {/* Tab Navigation */}
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-1.5">
                            <button 
                                onClick={() => setActiveTab('policies')} 
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    activeTab === 'policies' 
                                        ? 'bg-primary text-primary-foreground font-bold shadow-2xs' 
                                        : 'text-foreground-muted hover:bg-background-muted'
                                }`}
                            >
                                Holiday Policies
                            </button>
                            <button 
                                onClick={() => setActiveTab('exceptions')} 
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    activeTab === 'exceptions' 
                                        ? 'bg-primary text-primary-foreground font-bold shadow-2xs' 
                                        : 'text-foreground-muted hover:bg-background-muted'
                                }`}
                            >
                                Calendar Exceptions
                            </button>
                        </div>

                        <button
                            onClick={() => setShowHelp(!showHelp)}
                            className={`p-1.5 rounded-lg border border-border flex items-center gap-1 text-xs font-semibold transition-colors ${
                                showHelp ? 'bg-primary/10 text-primary border-primary/30' : 'text-foreground-muted hover:bg-background-muted'
                            }`}
                            title="Toggle Help Info"
                        >
                            <HelpCircle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Help</span>
                        </button>
                    </div>

                    {/* Context Help Banner */}
                    {showHelp && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-150">
                            <Info className="text-primary shrink-0 mt-0.5 h-4 w-4" />
                            <div className="flex-1 text-xs">
                                {activeTab === 'policies' ? (
                                    <>
                                        <p className="font-bold text-primary">About Holiday Policies</p>
                                        <p className="text-[11px] text-foreground-muted mt-0.5">
                                            Holiday Policies define official public holidays and statutory non-working days for a given calendar year and region (e.g. UAE Labor Law 2026).
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-bold text-primary">About Calendar Exceptions</p>
                                        <p className="text-[11px] text-foreground-muted mt-0.5">
                                            Exceptions allow you to override specific dates on a policy (e.g. making a Saturday a working day or a Monday a holiday). These take priority over the Work Schedule.
                                        </p>
                                    </>
                                )}
                            </div>
                            <button onClick={() => setShowHelp(false)} className="text-foreground-muted hover:text-foreground p-0.5 rounded transition-colors">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}

                    {activeTab === 'policies' ? (
                        <div className="bg-card rounded-2xl shadow-xs border border-border overflow-hidden">
                            <div className="px-4 py-3 bg-background-muted/40 border-b border-border flex justify-between items-center">
                                <h2 className="text-xs font-bold text-foreground">Yearly Holiday Policies</h2>
                                <button 
                                    onClick={() => handleOpenPolicyForm(null)} 
                                    className="px-3 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-all shadow-2xs flex items-center gap-1.5"
                                >
                                    <Plus className="h-3.5 w-3.5" /> New Policy
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-background-muted/70 border-b border-border text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                                        <tr>
                                            <th className="px-4 py-2.5">Policy Name</th>
                                            <th className="px-4 py-2.5">Year</th>
                                            <th className="px-4 py-2.5">Region</th>
                                            <th className="px-4 py-2.5">Holidays</th>
                                            <th className="px-4 py-2.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {policies.map(p => (
                                            <tr key={p.id} className="hover:bg-background-muted/50 transition-colors">
                                                <td className="px-4 py-2.5 font-bold text-foreground">{p.name}</td>
                                                <td className="px-4 py-2.5 text-foreground-muted font-mono">{p.year}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold border bg-primary/10 text-primary border-primary/20">
                                                        <Globe className="h-3 w-3" /> {p.regionCode || 'GLOBAL'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-foreground-muted font-medium">{p.holidays?.length || 0} dates</td>
                                                <td className="px-4 py-2.5 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button 
                                                            onClick={() => handleOpenPolicyForm(p)} 
                                                            className="p-1 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-lg transition-colors" 
                                                            title="Edit Policy"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeletePolicy(p.id)} 
                                                            className="p-1 text-foreground-muted hover:text-red-600 hover:bg-background-muted rounded-lg transition-colors" 
                                                            title="Delete Policy"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {policies.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-8 text-center text-foreground-muted font-medium text-xs">
                                                    No policies created yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-card rounded-2xl shadow-xs border border-border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex-1 max-w-md">
                                    <label className="text-[11px] font-semibold text-foreground-muted mb-1 block">Selected Policy</label>
                                    <CustomSelect 
                                        value={selectedPolicyId}
                                        onChange={(val) => setSelectedPolicyId(val)}
                                        options={policies.map(p => ({ value: p.id.toString(), label: `${p.name} (${p.year})` }))}
                                        placeholder="Select a Policy..."
                                    />
                                </div>
                                <button 
                                    onClick={() => handleOpenExceptionForm(null)} 
                                    className="px-3 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-all shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Add Date Override
                                </button>
                            </div>

                            <div className="bg-card text-card-foreground rounded-2xl shadow-xs border border-border overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead className="bg-background-muted/70 border-b border-border text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                                            <tr>
                                                <th className="px-4 py-2.5">Override Date</th>
                                                <th className="px-4 py-2.5">Resulting Type</th>
                                                <th className="px-4 py-2.5">Reason</th>
                                                <th className="px-4 py-2.5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60">
                                            {exceptions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-4 py-8 text-center text-foreground-muted font-medium text-xs">
                                                        No overrides found for this policy.
                                                    </td>
                                                </tr>
                                            ) : (
                                                exceptions.map(ex => (
                                                    <tr key={ex.id} className="hover:bg-background-muted/50 transition-colors">
                                                        <td className="px-4 py-2.5 font-bold text-foreground font-mono">{ex.exceptionDate}</td>
                                                        <td className="px-4 py-2.5">
                                                            <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold border ${ex.workingDay ? 'bg-primary/10 text-primary border-primary/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                                                                {ex.workingDay ? 'Working Day' : 'Holiday / Off'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-foreground-muted">{ex.reason || '-'}</td>
                                                        <td className="px-4 py-2.5 text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <button 
                                                                    onClick={() => handleOpenExceptionForm(ex)} 
                                                                    className="p-1 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-lg transition-colors" 
                                                                    title="Edit Override"
                                                                >
                                                                    <Edit className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteException(ex.id)} 
                                                                    className="p-1 text-foreground-muted hover:text-red-600 hover:bg-background-muted rounded-lg transition-colors" 
                                                                    title="Delete Override"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : viewMode === 'policyForm' ? (
                /* In-Page Holiday Policy Form View */
                <form onSubmit={handleSavePolicy} className="w-full space-y-4">
                    {/* Header bar with Back button */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                        <div className="flex items-center gap-2.5">
                            <button 
                                type="button"
                                onClick={() => setViewMode('list')} 
                                className="p-1.5 hover:bg-background-muted rounded-lg border border-border flex items-center gap-1.5 text-xs font-semibold transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Back to Holiday Policies</span>
                            </button>
                            <h2 className="text-xs font-bold text-foreground">
                                {currentPolicy ? 'Edit Holiday Policy' : 'Create Holiday Policy'}
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
                                {saving ? 'Saving...' : 'Save Policy'}
                            </button>
                        </div>
                    </div>

                    {/* Policy Details Card */}
                    <div className="bg-card p-3.5 rounded-xl shadow-xs border border-border space-y-3">
                        <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5">Policy Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            <div className="sm:col-span-2 lg:col-span-1">
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Policy Name</label>
                                <input 
                                    type="text" 
                                    value={policyFormData.name} 
                                    onChange={e => setPolicyFormData(p => ({ ...p, name: e.target.value }))} 
                                    required 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all" 
                                    placeholder="e.g. UAE Labor Law 2026" 
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Calendar Year</label>
                                <input 
                                    type="number" 
                                    value={policyFormData.year} 
                                    onChange={e => setPolicyFormData(p => ({ ...p, year: parseInt(e.target.value || 0) }))} 
                                    required 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all font-mono" 
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Region Code</label>
                                <input 
                                    type="text" 
                                    value={policyFormData.regionCode} 
                                    onChange={e => setPolicyFormData(p => ({ ...p, regionCode: e.target.value.toUpperCase() }))} 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all uppercase" 
                                    placeholder="e.g. UAE" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Holidays List Card */}
                    <div className="bg-card p-3.5 rounded-xl shadow-xs border border-border space-y-3">
                        <div className="flex justify-between items-center border-b border-border pb-1.5">
                            <h3 className="text-xs font-bold text-foreground">Holidays List</h3>
                            <button type="button" onClick={addHoliday} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                                <Plus className="h-3.5 w-3.5" /> Add Holiday
                            </button>
                        </div>
                        <div className="space-y-2">
                            {policyFormData.holidays.length === 0 ? (
                                <p className="text-xs text-foreground-muted py-4 text-center font-medium">No holidays added yet. Click "+ Add Holiday" to add dates.</p>
                            ) : (
                                policyFormData.holidays.map((h, idx) => (
                                    <div key={idx} className="flex flex-wrap items-center gap-2.5 p-2.5 bg-background rounded-xl border border-border">
                                        <input 
                                            type="date" 
                                            value={h.date} 
                                            onChange={e => handleHolidayChange(idx, 'date', e.target.value)} 
                                            required 
                                            className="text-xs px-2.5 py-1.5 border border-border bg-card rounded-lg text-foreground focus:outline-none focus:border-primary font-mono" 
                                        />
                                        <input 
                                            type="text" 
                                            value={h.name} 
                                            onChange={e => handleHolidayChange(idx, 'name', e.target.value)} 
                                            required 
                                            placeholder="Holiday Name (e.g. National Day)" 
                                            className="flex-1 text-xs px-2.5 py-1.5 border border-border bg-card rounded-lg text-foreground focus:outline-none focus:border-primary" 
                                        />
                                        <div className="flex gap-3">
                                             <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground-muted cursor-pointer">
                                                 <input type="checkbox" checked={h.isPaid} onChange={e => handleHolidayChange(idx, 'isPaid', e.target.checked)} className="rounded border-border text-primary focus:ring-primary accent-primary h-3.5 w-3.5" /> Paid
                                             </label>
                                             <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground-muted cursor-pointer">
                                                 <input type="checkbox" checked={h.isOptional} onChange={e => handleHolidayChange(idx, 'isOptional', e.target.checked)} className="rounded border-border text-primary focus:ring-primary accent-primary h-3.5 w-3.5" /> Optional
                                             </label>
                                        </div>
                                        <button type="button" onClick={() => removeHoliday(idx)} className="p-1 text-foreground-muted hover:text-red-600 transition-colors">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </form>
            ) : (
                /* In-Page Date Exception Form View */
                <form onSubmit={handleSaveException} className="w-full space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                        <div className="flex items-center gap-2.5">
                            <button 
                                type="button"
                                onClick={() => setViewMode('list')} 
                                className="p-1.5 hover:bg-background-muted rounded-lg border border-border flex items-center gap-1.5 text-xs font-semibold transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Back to Exceptions</span>
                            </button>
                            <h2 className="text-xs font-bold text-foreground">
                                {currentException ? 'Edit Date Override' : 'Create Date Override'}
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
                                {saving ? 'Saving...' : 'Apply Override'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-card p-3.5 rounded-xl shadow-xs border border-border space-y-3">
                        <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5">Override Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Date to Override</label>
                                <input 
                                    type="date" 
                                    value={exceptionFormData.exceptionDate} 
                                    onChange={e => setExceptionFormData(p => ({ ...p, exceptionDate: e.target.value }))} 
                                    required 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all font-mono" 
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Reason / Notes</label>
                                <input 
                                    type="text" 
                                    value={exceptionFormData.reason} 
                                    onChange={e => setExceptionFormData(p => ({ ...p, reason: e.target.value }))} 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all" 
                                    placeholder="e.g. Special Project Working Day" 
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-[11px] font-semibold text-foreground mb-1.5">Resulting Type</label>
                                <div className="flex gap-3">
                                    <label className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all ${exceptionFormData.workingDay ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                                        <input type="radio" checked={exceptionFormData.workingDay} onChange={() => setExceptionFormData(p => ({ ...p, workingDay: true }))} className="sr-only" />
                                        <div className={`text-xs font-bold ${exceptionFormData.workingDay ? 'text-primary' : 'text-foreground-muted'}`}>Working Day</div>
                                        <div className={`text-[10px] ${exceptionFormData.workingDay ? 'text-primary/80' : 'text-foreground-muted/60'}`}>Override to normal working hours</div>
                                    </label>
                                    <label className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all ${!exceptionFormData.workingDay ? 'border-amber-500 bg-amber-500/10' : 'border-border bg-card'}`}>
                                        <input type="radio" checked={!exceptionFormData.workingDay} onChange={() => setExceptionFormData(p => ({ ...p, workingDay: false }))} className="sr-only" />
                                        <div className={`text-xs font-bold ${!exceptionFormData.workingDay ? 'text-amber-600' : 'text-foreground-muted'}`}>Holiday / Off</div>
                                        <div className={`text-[10px] ${!exceptionFormData.workingDay ? 'text-amber-600/80' : 'text-foreground-muted/60'}`}>Mark as non-working day</div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default WorkCalendarManagement;
