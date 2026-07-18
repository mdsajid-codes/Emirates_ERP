import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Loader, AlertCircle, Save, Calendar, Globe, MapPin, X, Info } from 'lucide-react';
import * as workCalendarApi from './workCalendarApi';
import Modal from '../../../pages/Modal';
import { toast } from 'react-toastify';

const WorkCalendarManagement = ({ embedded = false }) => {
    const [activeTab, setActiveTab] = useState('policies');
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
    const [currentPolicy, setCurrentPolicy] = useState(null);
    const [currentException, setCurrentException] = useState(null);
    const [exceptions, setExceptions] = useState([]);
    const [selectedPolicyId, setSelectedPolicyId] = useState('');

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
            toast.error('Failed to fetch exceptions');
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

    const handleSavePolicy = async (formData) => {
        try {
            if (currentPolicy?.id) {
                await workCalendarApi.updateHolidayPolicy(currentPolicy.id, formData);
                toast.success('Policy updated');
            } else {
                await workCalendarApi.createHolidayPolicy(formData);
                toast.success('Policy created');
            }
            fetchData();
            setIsPolicyModalOpen(false);
        } catch (err) {
            toast.error('Save failed');
        }
    };

    const handleSaveException = async (formData) => {
        try {
            if (currentException?.id) {
                await workCalendarApi.updateException(currentException.id, formData);
                toast.success('Exception updated');
            } else {
                await workCalendarApi.createException(formData);
                toast.success('Exception created');
            }
            fetchExceptions(selectedPolicyId);
            setIsExceptionModalOpen(false);
        } catch (err) {
            toast.error('Save failed');
        }
    };

    const handleDeletePolicy = async (id) => {
        if (window.confirm('Delete policy?')) {
            try {
                await workCalendarApi.deleteHolidayPolicy(id);
                toast.success('Deleted');
                fetchData();
            } catch (err) { toast.error('Failed'); }
        }
    };

    const handleDeleteException = async (id) => {
        if (window.confirm('Delete exception?')) {
            try {
                await workCalendarApi.deleteException(id);
                toast.success('Deleted');
                fetchExceptions(selectedPolicyId);
            } catch (err) { toast.error('Failed'); }
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin" /></div>;

    const content = (
        <div className={embedded ? '' : 'p-6 bg-background min-h-full'}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Work Calendar</h1>
                        <p className="text-sm text-foreground-muted">Manage yearly holiday policies and calendar date overrides</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-1 bg-background-muted p-1 rounded-xl w-fit mb-6 border border-border">
                <button onClick={() => setActiveTab('policies')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'policies' ? 'bg-card text-primary shadow-sm border border-border' : 'text-foreground-muted hover:text-foreground'}`}>Holiday Policies</button>
                <button onClick={() => setActiveTab('exceptions')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'exceptions' ? 'bg-card text-primary shadow-sm border border-border' : 'text-foreground-muted hover:text-foreground'}`}>Calendar Exceptions</button>
            </div>

            {activeTab === 'policies' ? (
                <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="p-4 bg-background-muted border-b border-border flex justify-between items-center">
                        <h2 className="font-semibold text-foreground opacity-80">Yearly Holiday Policies</h2>
                        <button onClick={() => { setCurrentPolicy(null); setIsPolicyModalOpen(true); }} className="btn-primary text-sm flex items-center gap-1">
                            <Plus size={16} /> New Policy
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-background-muted">
                                <tr>
                                    <th className="th-cell">Policy Name</th>
                                    <th className="th-cell">Year</th>
                                    <th className="th-cell">Region</th>
                                    <th className="th-cell">Holidays</th>
                                    <th className="th-cell text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card">
                                {policies.map(p => (
                                    <tr key={p.id} className="hover:bg-background-muted transition-colors">
                                        <td className="td-cell font-medium text-foreground">{p.name}</td>
                                        <td className="td-cell text-sm text-foreground-muted opacity-80">{p.year}</td>
                                        <td className="td-cell">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit border border-primary/20">
                                                <Globe size={10} /> {p.regionCode || 'GLOBAL'}
                                            </div>
                                        </td>
                                        <td className="td-cell text-sm text-foreground-muted opacity-80">{p.holidays?.length || 0} dates</td>
                                        <td className="td-cell text-right text-sm">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => { setCurrentPolicy(p); setIsPolicyModalOpen(true); }} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"><Edit size={16} /></button>
                                                <button onClick={() => handleDeletePolicy(p.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {policies.length === 0 && (
                                    <tr><td colSpan="5" className="td-cell text-center py-10 text-foreground-muted opacity-60">No policies created yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                        <Info className="text-primary shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm text-primary font-semibold">About Exceptions</p>
                            <p className="text-xs text-foreground-muted">Exceptions allow you to override specific dates on a policy (e.g. making a Saturday a working day or a Monday a holiday). These take priority over the Work Schedule.</p>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl shadow-sm border border-border p-4 flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-foreground-muted uppercase mb-1 block opacity-60">Selected Policy</label>
                            <select value={selectedPolicyId} onChange={(e) => setSelectedPolicyId(e.target.value)} className="input bg-background-muted border-border text-foreground">
                                {policies.map(p => <option key={p.id} value={p.id}>{p.name} ({p.year})</option>)}
                            </select>
                        </div>
                        <button onClick={() => { setCurrentException(null); setIsExceptionModalOpen(true); }} className="btn-primary flex items-center gap-2 mt-5">
                            <Plus size={18} /> Add Date Override
                        </button>
                    </div>

                    <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-background-muted">
                                    <tr>
                                        <th className="th-cell">Override Date</th>
                                        <th className="th-cell">Resulting Type</th>
                                        <th className="th-cell">Reason</th>
                                        <th className="th-cell text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {exceptions.length === 0 ? (
                                        <tr><td colSpan="4" className="td-cell text-center py-10 text-foreground-muted italic opacity-60">No overrides found for this policy.</td></tr>
                                    ) : (
                                        exceptions.map(ex => (
                                            <tr key={ex.id} className="hover:bg-background-muted transition-colors">
                                                <td className="td-cell font-medium text-foreground">{ex.exceptionDate}</td>
                                                <td className="td-cell">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${ex.workingDay ? 'bg-primary/10 text-primary border-primary/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                                                        {ex.workingDay ? 'Working Day' : 'Holiday / Off'}
                                                    </span>
                                                </td>
                                                <td className="td-cell text-sm text-foreground-muted">{ex.reason || '-'}</td>
                                                <td className="td-cell text-right text-sm">
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => { setCurrentException(ex); setIsExceptionModalOpen(true); }} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"><Edit size={16} /></button>
                                                        <button onClick={() => handleDeleteException(ex.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-colors"><Trash2 size={16} /></button>
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

            {isPolicyModalOpen && (
                <PolicyModal isOpen={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)} onSave={handleSavePolicy} policy={currentPolicy} />
            )}
            {isExceptionModalOpen && (
                <ExceptionModal isOpen={isExceptionModalOpen} onClose={() => setIsExceptionModalOpen(false)} onSave={handleSaveException} exception={currentException} policyId={selectedPolicyId} />
            )}
        </div>
    );

    return content;
};

const PolicyModal = ({ isOpen, onClose, onSave, policy }) => {
    const [formData, setFormData] = useState({
        name: policy?.name || '',
        year: policy?.year || new Date().getFullYear(),
        regionCode: policy?.regionCode || 'GLOBAL',
        holidays: policy?.holidays?.map(h => ({ date: h.date, name: h.name, isPaid: h.isPaid, isOptional: h.isOptional })) || []
    });

    const addHoliday = () => setFormData(p => ({ ...p, holidays: [...p.holidays, { date: '', name: '', isPaid: true, isOptional: false }] }));
    const removeHoliday = (idx) => setFormData(p => ({ ...p, holidays: p.holidays.filter((_, i) => i !== idx) }));
    const handleHolidayChange = (idx, field, val) => {
        const h = [...formData.holidays];
        h[idx][field] = val;
        setFormData(p => ({ ...p, holidays: h }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={policy ? 'Edit Holiday Policy' : 'Create Holiday Policy'}>
            <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-foreground-muted mb-1">Policy Name</label>
                        <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required className="input bg-background border-border rounded-theme text-foreground" placeholder="e.g. UAE Labor Law 2026" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1">Calendar Year</label>
                        <input type="number" value={formData.year} onChange={e => setFormData(p => ({ ...p, year: parseInt(e.target.value) }))} required className="input bg-background border-border rounded-theme text-foreground" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1">Region Code</label>
                        <input type="text" value={formData.regionCode} onChange={e => setFormData(p => ({ ...p, regionCode: e.target.value.toUpperCase() }))} className="input bg-background border-border rounded-theme text-foreground uppercase" placeholder="e.g. UAE" />
                    </div>
                </div>

                <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-foreground">Holidays List</h3>
                        <button type="button" onClick={addHoliday} className="text-success text-sm font-bold flex items-center gap-1 hover:underline"><Plus size={16} /> Add Holiday</button>
                    </div>
                    <div className="space-y-2">
                        {formData.holidays.map((h, idx) => (
                            <div key={idx} className="flex flex-wrap items-center gap-2 p-3 bg-background-muted rounded-theme border border-border">
                                <input type="date" value={h.date} onChange={e => handleHolidayChange(idx, 'date', e.target.value)} required className="text-xs px-2 py-1 border border-border bg-card rounded-theme text-foreground" />
                                <input type="text" value={h.name} onChange={e => handleHolidayChange(idx, 'name', e.target.value)} required placeholder="Holiday Name" className="flex-1 text-xs px-2 py-1 border border-border bg-card rounded-theme text-foreground" />
                                <div className="flex gap-2">
                                     <label className="flex items-center gap-1 text-[10px] font-bold text-foreground-muted"><input type="checkbox" checked={h.isPaid} onChange={e => handleHolidayChange(idx, 'isPaid', e.target.checked)} className="rounded-theme border-border text-primary" /> PAID</label>
                                     <label className="flex items-center gap-1 text-[10px] font-bold text-foreground-muted"><input type="checkbox" checked={h.isOptional} onChange={e => handleHolidayChange(idx, 'isOptional', e.target.checked)} className="rounded-theme border-border text-primary" /> OPTIONAL</label>
                                </div>
                                <button type="button" onClick={() => removeHoliday(idx)} className="text-foreground-muted hover:text-error transition-colors"><X size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-foreground-muted hover:text-foreground transition-colors">Cancel</button>
                    <button type="submit" className="btn-primary px-6 py-2 rounded-theme shadow-lg shadow-primary/20">Save Policy</button>
                </div>
            </form>
        </Modal>
    );
};

const ExceptionModal = ({ isOpen, onClose, onSave, exception, policyId }) => {
    const [formData, setFormData] = useState({
        holidayPolicyId: policyId,
        exceptionDate: exception?.exceptionDate || '',
        workingDay: exception !== null ? exception.workingDay : true,
        reason: exception?.reason || ''
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Date Override">
            <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-1">Date to Override</label>
                    <input type="date" value={formData.exceptionDate} onChange={e => setFormData(p => ({ ...p, exceptionDate: e.target.value }))} required className="input bg-background border-border rounded-theme text-foreground" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Resulting Type</label>
                    <div className="flex gap-4">
                        <label className={`flex-1 p-3 rounded-theme border-2 cursor-pointer transition-all ${formData.workingDay ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                            <input type="radio" checked={formData.workingDay} onChange={() => setFormData(p => ({ ...p, workingDay: true }))} className="sr-only" />
                            <div className={`text-sm font-bold ${formData.workingDay ? 'text-primary' : 'text-foreground-muted'}`}>Working Day</div>
                            <div className={`text-[10px] uppercase ${formData.workingDay ? 'text-primary/70' : 'text-foreground-muted/50'}`}>Override to normal hours</div>
                        </label>
                        <label className={`flex-1 p-3 rounded-theme border-2 cursor-pointer transition-all ${!formData.workingDay ? 'border-warning bg-warning/10' : 'border-border bg-card'}`}>
                            <input type="radio" checked={!formData.workingDay} onChange={() => setFormData(p => ({ ...p, workingDay: false }))} className="sr-only" />
                            <div className={`text-sm font-bold ${!formData.workingDay ? 'text-warning' : 'text-foreground-muted'}`}>Holiday / Off</div>
                            <div className={`text-[10px] uppercase ${!formData.workingDay ? 'text-warning/70' : 'text-foreground-muted/50'}`}>Mark as non-working</div>
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-1">Reason / Notes</label>
                    <input type="text" value={formData.reason} onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))} className="input bg-background border-border rounded-theme text-foreground" placeholder="e.g. Special Project Day" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-foreground-muted hover:text-foreground transition-colors">Cancel</button>
                    <button type="submit" className="btn-primary px-6 py-2 rounded-theme shadow-lg shadow-primary/20">Apply Override</button>
                </div>
            </form>
        </Modal>
    );
};

export default WorkCalendarManagement;
