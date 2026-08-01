import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, Loader, AlertCircle, Save, X, HeartPulse, ArrowLeft, ChevronDown, Check } from 'lucide-react';
import * as sickLeaveApi from './sickLeaveApi';
import axios from 'axios';
import { toast } from 'react-toastify';

const CustomDropdown = ({ label, value, onChange, options, placeholder = "Select..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            {label && <label className="block text-xs font-medium text-foreground-muted mb-1">{label}</label>}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs bg-background border rounded-lg text-left transition-all ${
                    isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-border/80'
                }`}
            >
                <span className={selectedOption && selectedOption.value !== '' ? 'text-foreground font-medium' : 'text-foreground-muted'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-foreground-muted transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 custom-scrollbar">
                    {options.map((opt) => {
                        const isSelected = String(opt.value) === String(value);
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                                    isSelected
                                        ? 'bg-primary/10 text-primary font-bold'
                                        : 'text-foreground hover:bg-background-muted'
                                }`}
                            >
                                <span className="truncate">{opt.label}</span>
                                {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                            </button>
                        );
                    })}
                    {options.length === 0 && (
                        <div className="px-3 py-2 text-xs text-foreground-muted text-center">No options available</div>
                    )}
                </div>
            )}
        </div>
    );
};

const SickLeaveFormView = ({ onClose, onSave, type, timeTypes, earningsComponents }) => {
    const [formData, setFormData] = useState({
        name: type?.name || '',
        description: type?.description || '',
        workTimeTypeId: type?.workTimeType?.id || '',
        earningsTypeId: type?.earningsType?.id || '',
        calculationMethod: type?.calculationMethod || 'PLANNED_EARNINGS',
        dailyEarningBase: type?.dailyEarningBase || 'FIXED_30_DAYS',
        averagingPeriodMonths: type?.averagingPeriodMonths || 1,
        active: type !== null ? type.active : true,
        intervals: type?.intervals?.map(i => ({ fromDay: i.fromDay, toDay: i.toDay, paymentPercent: i.paymentPercent })) || [
            { fromDay: 1, toDay: 15, paymentPercent: 100 },
            { fromDay: 16, toDay: 365, paymentPercent: 0 }
        ]
    });

    const [validationMsg, setValidationMsg] = useState('');

    const handleChange = (e) => {
        const { name, value, type: fieldType, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: fieldType === 'checkbox' ? checked : value }));
    };

    const handleIntervalChange = (index, field, value) => {
        const newIntervals = [...formData.intervals];
        newIntervals[index][field] = field === 'paymentPercent' ? parseFloat(value) || 0 : parseInt(value) || 0;
        setFormData(prev => ({ ...prev, intervals: newIntervals }));
    };

    const addInterval = () => {
        const lastTo = formData.intervals[formData.intervals.length - 1]?.toDay || 0;
        setFormData(prev => ({
            ...prev,
            intervals: [...prev.intervals, { fromDay: lastTo + 1, toDay: 365, paymentPercent: 0 }]
        }));
    };

    const removeInterval = (index) => {
        setFormData(prev => ({ ...prev, intervals: prev.intervals.filter((_, i) => i !== index) }));
    };

    const validate = () => {
        const { intervals } = formData;
        if (!intervals.length) return "At least one interval is required";

        const sorted = [...intervals].sort((a, b) => a.fromDay - b.fromDay);
        if (sorted[0].fromDay !== 1) return "First interval must start at 1";

        for (let i = 0; i < sorted.length; i++) {
            if (sorted[i].toDay < sorted[i].fromDay) return `Interval ${i+1}: To Day must be >= From Day`;
            if (i > 0 && sorted[i].fromDay !== sorted[i-1].toDay + 1) {
                return `Gap/Overlap between interval ${i} and ${i+1}`;
            }
        }
        if (sorted[sorted.length-1].toDay !== 365) return "Last interval must end at 365";
        return "";
    };

    useEffect(() => {
        setValidationMsg(validate());
    }, [formData.intervals]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const msg = validate();
        if (msg) {
            toast.error(msg);
            return;
        }
        onSave(formData);
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header with Back button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-background-muted transition-colors flex items-center gap-1.5 text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Sick Leave Types
                    </button>
                    <div>
                        <h2 className="text-sm font-bold text-foreground">
                            {type ? 'Edit Sick Leave Type' : 'Add Sick Leave Type'}
                        </h2>
                        <p className="text-[11px] text-foreground-muted">Configure calculation methods and payment intervals</p>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="bg-card text-foreground rounded-xl border border-border p-4 shadow-2xs space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-foreground-muted mb-1">Type Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="e.g. Standard Sick Leave"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-foreground-muted mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            rows="2"
                        />
                    </div>

                    <CustomDropdown
                        label="Work Time Type"
                        value={formData.workTimeTypeId}
                        onChange={(val) => setFormData(prev => ({ ...prev, workTimeTypeId: val }))}
                        options={[
                            { value: '', label: 'Select...' },
                            ...timeTypes.map(tt => ({ value: tt.id, label: tt.name }))
                        ]}
                    />

                    <CustomDropdown
                        label="Salary Component (Earnings)"
                        value={formData.earningsTypeId}
                        onChange={(val) => setFormData(prev => ({ ...prev, earningsTypeId: val }))}
                        options={[
                            { value: '', label: 'Select...' },
                            ...earningsComponents.map(ec => ({ value: ec.id, label: ec.name }))
                        ]}
                    />

                    <CustomDropdown
                        label="Calculation Method"
                        value={formData.calculationMethod}
                        onChange={(val) => setFormData(prev => ({ ...prev, calculationMethod: val }))}
                        options={[
                            { value: 'PLANNED_EARNINGS', label: 'Planned Earnings' },
                            { value: 'ACTUAL_EARNINGS', label: 'Actual Earnings' }
                        ]}
                    />

                    <CustomDropdown
                        label="Daily Earning Base"
                        value={formData.dailyEarningBase}
                        onChange={(val) => setFormData(prev => ({ ...prev, dailyEarningBase: val }))}
                        options={[
                            { value: 'FIXED_30_DAYS', label: 'Fixed 30 Days' },
                            { value: 'CALENDAR_DAYS', label: 'Calendar Days' },
                            { value: 'WORKING_DAYS', label: 'Working Days Only' }
                        ]}
                    />
                </div>

                <div className="border-t border-border pt-3">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-foreground">Payment Intervals</h3>
                        <button
                            type="button"
                            onClick={addInterval}
                            className="text-primary hover:underline text-xs font-semibold flex items-center gap-1"
                        >
                            <Plus size={14} /> Add Row
                        </button>
                    </div>
                    <div className="space-y-2">
                        {formData.intervals.map((interval, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-background-muted/40 p-2 rounded-lg border border-border">
                                <div className="flex-1">
                                    <label className="text-[10px] text-foreground-muted uppercase font-bold">From Day</label>
                                    <input
                                        type="number"
                                        value={interval.fromDay}
                                        onChange={(e) => handleIntervalChange(idx, 'fromDay', e.target.value)}
                                        className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-foreground-muted uppercase font-bold">To Day</label>
                                    <input
                                        type="number"
                                        value={interval.toDay}
                                        onChange={(e) => handleIntervalChange(idx, 'toDay', e.target.value)}
                                        className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-foreground-muted uppercase font-bold">Payment %</label>
                                    <input
                                        type="number"
                                        value={interval.paymentPercent}
                                        onChange={(e) => handleIntervalChange(idx, 'paymentPercent', e.target.value)}
                                        className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeInterval(idx)}
                                    className="text-foreground-muted hover:text-rose-600 transition-colors p-1 mt-3"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    {validationMsg && <p className="mt-2 text-xs text-rose-500 flex items-center gap-1"><AlertCircle size={12} /> {validationMsg}</p>}
                    {!validationMsg && <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1">✓ Complete coverage (1-365 days)</p>}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-1.5 text-xs font-semibold text-foreground-muted hover:bg-background-muted rounded-lg transition-colors border border-border"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                        <Save size={14} /> Save Policy
                    </button>
                </div>
            </form>
        </div>
    );
};

const SickLeaveManagement = ({ embedded = false }) => {
    const [sickLeaveTypes, setSickLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentType, setCurrentType] = useState(null);

    const [timeTypes, setTimeTypes] = useState([]);
    const [earningsComponents, setEarningsComponents] = useState([]);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [slResponse, ttResponse, scResponse] = await Promise.all([
                sickLeaveApi.getAllSickLeaveTypes(),
                axios.get(`${API_URL}/time-types`, { headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` } }),
                axios.get(`${API_URL}/salary-components`, { headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` } })
            ]);
            setSickLeaveTypes(slResponse.data);
            setTimeTypes(ttResponse.data);
            setEarningsComponents(scResponse.data.filter(comp => comp.type === 'EARNING'));
        } catch (err) {
            setError('Failed to fetch data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenForm = (type = null) => {
        setCurrentType(type);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setCurrentType(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this sick leave type?')) {
            try {
                await sickLeaveApi.deleteSickLeaveType(id);
                toast.success('Sick leave type deleted');
                fetchData();
            } catch (err) {
                toast.error('Failed to delete.');
            }
        }
    };

    const handleSave = async (formData) => {
        try {
            if (currentType?.id) {
                await sickLeaveApi.updateSickLeaveType(currentType.id, formData);
                toast.success('Sick leave type updated');
            } else {
                await sickLeaveApi.createSickLeaveType(formData);
                toast.success('Sick leave type created');
            }
            fetchData();
            handleCloseForm();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save.');
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader className="animate-spin h-6 w-6 text-primary" /></div>;

    if (isFormOpen) {
        return (
            <SickLeaveFormView
                onClose={handleCloseForm}
                onSave={handleSave}
                type={currentType}
                timeTypes={timeTypes}
                earningsComponents={earningsComponents}
            />
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <HeartPulse className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-foreground">Sick Leave Types</h2>
                        <p className="text-[11px] text-foreground-muted">Manage specialized sick leave policies and payment intervals</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                    <Plus size={14} /> Add New Type
                </button>
            </div>

            {error && (
                <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-lg flex items-center gap-2 border border-rose-500/20">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full bg-card text-foreground divide-y divide-border">
                    <thead className="bg-background-muted/60">
                        <tr>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Name</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Calculation</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Earning Base</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Intervals</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                            <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {sickLeaveTypes.map((type) => (
                            <tr key={type.id} className="hover:bg-background-muted/40 transition-colors">
                                <td className="px-3 py-2 text-xs font-semibold text-foreground">{type.name}</td>
                                <td className="px-3 py-2 text-xs text-foreground-muted">{type.calculationMethod ? type.calculationMethod.replace('_', ' ') : '-'}</td>
                                <td className="px-3 py-2 text-xs text-foreground-muted">{type.dailyEarningBase ? type.dailyEarningBase.replace('_', ' ') : '-'}</td>
                                <td className="px-3 py-2 text-xs text-foreground-muted">
                                    <span className="bg-background-muted px-2 py-0.5 rounded-md border border-border text-[11px] font-medium">{type.intervals?.length || 0} intervals</span>
                                </td>
                                <td className="px-3 py-2 text-xs">
                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${type.active ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-foreground-muted/10 text-foreground-muted border-border'}`}>
                                        {type.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-xs text-right">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => handleOpenForm(type)} className="p-1 text-primary hover:bg-primary/10 rounded-md transition-colors" title="Edit"><Edit size={14} /></button>
                                        <button onClick={() => handleDelete(type.id)} className="p-1 text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors" title="Delete"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sickLeaveTypes.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-foreground-muted">
                                    <HeartPulse className="mx-auto h-8 w-8 text-foreground-muted/40 mb-1.5" />
                                    <h3 className="text-xs font-semibold text-foreground">No Sick Leave Types Configured</h3>
                                    <p className="mt-0.5 text-[11px] text-foreground-muted">Click "Add New Type" to create your first sick leave policy.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SickLeaveManagement;
