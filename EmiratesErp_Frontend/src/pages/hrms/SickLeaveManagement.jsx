import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Loader, AlertCircle, Save, X, HeartPulse } from 'lucide-react';
import * as sickLeaveApi from './sickLeaveApi';
import * as leaveApi from '../leaveApi'; // For TimeTypes
import * as payrollApi from '../PayrollManagement'; // I'll check if payrollApi exists or use axios
import axios from 'axios';
import Modal from '../Modal';
import { toast } from 'react-toastify';

const SickLeaveManagement = ({ embedded = false }) => {
    const [sickLeaveTypes, setSickLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
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
            // Filter earnings only
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

    const handleOpenModal = (type = null) => {
        setCurrentType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
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
            handleCloseModal();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save.');
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin" /></div>;

    const content = (
        <div className={embedded ? '' : 'p-6 bg-background'}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <HeartPulse size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Sick Leave Types</h1>
                        <p className="text-sm text-foreground-muted">Manage specialized sick leave policies and payment intervals</p>
                    </div>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add New Type
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-lg flex items-center gap-2 border border-red-500/20">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-background-muted">
                            <tr>
                                <th className="th-cell">Name</th>
                                <th className="th-cell">Calculation</th>
                                <th className="th-cell">Earning Base</th>
                                <th className="th-cell">Intervals</th>
                                <th className="th-cell">Status</th>
                                <th className="th-cell text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {sickLeaveTypes.map((type) => (
                                <tr key={type.id} className="hover:bg-background-muted transition-colors">
                                    <td className="td-cell font-medium text-foreground">{type.name}</td>
                                    <td className="td-cell text-sm text-foreground-muted">{type.calculationMethod.replace('_', ' ')}</td>
                                    <td className="td-cell text-sm text-foreground-muted">{type.dailyEarningBase.replace('_', ' ')}</td>
                                    <td className="td-cell text-sm text-foreground-muted">
                                        <span className="bg-background-muted px-2 py-1 rounded-md border border-border">{type.intervals?.length || 0} intervals</span>
                                    </td>
                                    <td className="td-cell">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${type.active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-foreground-muted/10 text-foreground-muted border-border'}`}>
                                            {type.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="td-cell text-right text-sm">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => handleOpenModal(type)} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(type.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sickLeaveTypes.length === 0 && (
                                <tr><td colSpan="6" className="td-cell text-center py-10 text-foreground-muted opacity-60">No sick leave types configured.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <SickLeaveTypeModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    type={currentType}
                    timeTypes={timeTypes}
                    earningsComponents={earningsComponents}
                />
            )}
        </div>
    );

    return content;
};

const SickLeaveTypeModal = ({ isOpen, onClose, onSave, type, timeTypes, earningsComponents }) => {
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
        newIntervals[index][field] = field === 'paymentPercent' ? parseFloat(value) : parseInt(value);
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
        <Modal isOpen={isOpen} onClose={onClose} title={type ? 'Edit Sick Leave Type' : 'Add Sick Leave Type'}>
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500" placeholder="e.g. Standard Sick Leave" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500" rows="2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Work Time Type</label>
                        <select name="workTimeTypeId" value={formData.workTimeTypeId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500">
                            <option value="">Select...</option>
                            {timeTypes.map(tt => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Salary Component (Earnings)</label>
                        <select name="earningsTypeId" value={formData.earningsTypeId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500">
                            <option value="">Select...</option>
                            {earningsComponents.map(ec => <option key={ec.id} value={ec.id}>{ec.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Calculation Method</label>
                        <select name="calculationMethod" value={formData.calculationMethod} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                            <option value="PLANNED_EARNINGS">Planned Earnings</option>
                            <option value="ACTUAL_EARNINGS">Actual Earnings</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Daily Earning Base</label>
                        <select name="dailyEarningBase" value={formData.dailyEarningBase} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                            <option value="FIXED_30_DAYS">Fixed 30 Days</option>
                            <option value="CALENDAR_DAYS">Calendar Days</option>
                            <option value="WORKING_DAYS">Working Days Only</option>
                        </select>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-slate-800">Payment Intervals</h3>
                        <button type="button" onClick={addInterval} className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center gap-1">
                            <Plus size={16} /> Add Row
                        </button>
                    </div>
                    <div className="space-y-2">
                        {formData.intervals.map((interval, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <div className="flex-1">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold">From Day</label>
                                    <input type="number" value={interval.fromDay} onChange={(e) => handleIntervalChange(idx, 'fromDay', e.target.value)} className="w-full bg-transparent border-0 border-b border-slate-200 focus:ring-0 text-sm" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold">To Day</label>
                                    <input type="number" value={interval.toDay} onChange={(e) => handleIntervalChange(idx, 'toDay', e.target.value)} className="w-full bg-transparent border-0 border-b border-slate-200 focus:ring-0 text-sm" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold">Payment %</label>
                                    <input type="number" value={interval.paymentPercent} onChange={(e) => handleIntervalChange(idx, 'paymentPercent', e.target.value)} className="w-full bg-transparent border-0 border-b border-slate-200 focus:ring-0 text-sm" />
                                </div>
                                <button type="button" onClick={() => removeInterval(idx)} className="text-slate-400 hover:text-red-500 transition-colors pt-4"><X size={18} /></button>
                            </div>
                        ))}
                    </div>
                    {validationMsg && <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {validationMsg}</p>}
                    {!validationMsg && <p className="mt-2 text-xs text-green-600 flex items-center gap-1">✓ Complete coverage (1-365 days)</p>}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2">
                        <Save size={18} /> Save Policy
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SickLeaveManagement;
