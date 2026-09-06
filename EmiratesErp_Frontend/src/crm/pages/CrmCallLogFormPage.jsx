import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader, X, Plus, Save, Calendar, Clock, ChevronDown, Check, Search, AlertTriangle, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const interactionTypeOptions = [
    { value: 'OUTBOUND', label: 'Outbound Call' },
    { value: 'INBOUND', label: 'Inbound Call' },
    { value: 'MISSED', label: 'Missed Call' },
    { value: 'VOICEMAIL', label: 'Voicemail' },
    { value: 'MEETING', label: 'Meeting / Discussion' },
    { value: 'EMAIL', label: 'Email Follow-up' }
];

const callOutcomeOptions = [
    { value: 'CONNECTED', label: 'Connected / Answered' },
    { value: 'NO_ANSWER', label: 'No Answer' },
    { value: 'BUSY', label: 'Busy' },
    { value: 'WRONG_NUMBER', label: 'Wrong Number' },
    { value: 'INTERESTED', label: 'Interested - High Potential' },
    { value: 'NOT_INTERESTED', label: 'Not Interested' },
    { value: 'CALLBACK_REQUESTED', label: 'Callback Requested' }
];

const QuickAddModal = ({ isOpen, onClose, title, fields, onSubmit }) => {
    const [modalData, setModalData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await onSubmit(modalData);
            setModalData({});
            onClose();
        } catch (err) {
            console.error("Quick add submit error", err);
            setError(err.response?.data?.message || 'Failed to save record.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[70] p-4" onClick={onClose}>
            <div className="bg-white text-[#102A43] rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-[#D7E3EE] flex justify-between items-center bg-[#F8FAFC]">
                    <h3 className="text-base font-bold text-[#102A43]">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full text-[#60738E] hover:bg-slate-200 transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3 max-h-[75vh] overflow-y-auto">
                    {error && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-600 font-medium">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {fields.map(field => (
                            <div key={field.name} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                {field.type === 'select' ? (
                                    <select
                                        required={field.required}
                                        value={modalData[field.name] || ''}
                                        onChange={e => setModalData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                    >
                                        <option value="">-- Select {field.label} --</option>
                                        {field.options?.map(opt => (
                                            <option key={opt.value || opt.id} value={opt.value || opt.id}>
                                                {opt.label || opt.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type || 'text'}
                                        required={field.required}
                                        value={modalData[field.name] || ''}
                                        onChange={e => setModalData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                        placeholder="Type here..."
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-[#D7E3EE]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 text-xs font-bold text-[#60738E] bg-[#F8FAFC] border border-[#C9D8E5] rounded hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0178BC] rounded hover:bg-[#005A8C] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                            {submitting && <Loader className="animate-spin h-3 w-3" />} Save Lead
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ValidationModal = ({ isOpen, onClose, errors }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[80] p-4" onClick={onClose}>
            <div className="bg-white text-[#102A43] rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-[#D7E3EE] flex justify-between items-center bg-red-50">
                    <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                        <AlertTriangle size={18} />
                        <span>Form Validation Error</span>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[#60738E] hover:bg-red-100 transition-colors"><X size={18} /></button>
                </div>
                <div className="p-4 flex flex-col gap-3">
                    <p className="text-xs text-[#60738E]">
                        Please resolve the following required fields before submitting the call log:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-red-600 font-medium max-h-48 overflow-y-auto">
                        {errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                        ))}
                    </ul>
                    <div className="flex justify-end mt-2 pt-3 border-t border-[#D7E3EE]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                        >
                            Review Form
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CrmCallLogFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        callDate: new Date().toISOString().split('T')[0],
        callTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
        leadId: '',
        employeeId: '',
        interactionType: 'OUTBOUND',
        callOutcome: 'CONNECTED',
        comments: '',
        remindMeBefore: false,
        reminderDate: '',
        reminderTime: ''
    });

    const [selectData, setSelectData] = useState({
        leads: [],
        employees: []
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [validationErrorList, setValidationErrorList] = useState([]);
    const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);

    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

    const authHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leadsRes, employeesRes] = await Promise.all([
                axios.get(`${API_URL}/crm/leads`, { headers: authHeaders }),
                axios.get(`${API_URL}/employees/all`, { headers: authHeaders })
            ]);

            const leadsList = leadsRes.data?.content || leadsRes.data || [];
            const employeesList = employeesRes.data || [];

            setSelectData({
                leads: leadsList,
                employees: employeesList
            });

            if (isEdit) {
                const logRes = await axios.get(`${API_URL}/crm/call-logs/${id}`, { headers: authHeaders });
                const item = logRes.data;
                setFormData({
                    callDate: item.callDate || new Date().toISOString().split('T')[0],
                    callTime: item.callTime ? item.callTime.substring(0, 5) : '',
                    leadId: item.leadId || '',
                    employeeId: item.employeeId || '',
                    interactionType: item.interactionType || 'OUTBOUND',
                    callOutcome: item.callOutcome || 'CONNECTED',
                    comments: item.comments || '',
                    remindMeBefore: item.remindMeBefore || false,
                    reminderDate: item.reminderDate || '',
                    reminderTime: item.reminderTime ? item.reminderTime.substring(0, 5) : ''
                });
            }
        } catch (error) {
            console.error("Failed to load call log form data", error);
            setSelectData(prev => ({
                leads: prev.leads || [],
                employees: prev.employees || []
            }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const validateField = (name, value) => {
        let err = '';
        if (name === 'callDate' && !value) err = 'Call date is required.';
        if (name === 'callTime' && !value) err = 'Call time is required.';
        if (name === 'leadId' && !value) err = 'Related Lead is required.';
        if (name === 'employeeId' && !value) err = 'Assignee Employee is required.';
        if (name === 'comments' && !value?.trim()) err = 'Interaction Notes / Comments are required.';
        if (name === 'reminderDate' && formData.remindMeBefore && !value) err = 'Reminder date is required when reminder is enabled.';
        if (name === 'reminderTime' && formData.remindMeBefore && !value) err = 'Reminder time is required when reminder is enabled.';

        setFieldErrors(prev => {
            const next = { ...prev };
            if (err) next[name] = err;
            else delete next[name];
            return next;
        });

        return err;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
        validateField(name, val);
    };

    const handleQuickAddLead = async (data) => {
        const generatedLeadNo = data.leadNo?.trim() || `LD-${Math.floor(100000 + Math.random() * 900000)}`;
        const res = await axios.post(`${API_URL}/crm/leads`, {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email || `${data.firstName.toLowerCase()}@example.com`,
            phone: data.phone || '',
            leadNo: generatedLeadNo,
            designation: data.designation || '',
            companyId: data.companyId ? parseInt(data.companyId) : null,
            leadSourceId: data.leadSourceId ? parseInt(data.leadSourceId) : null,
            status: data.status || 'NEW'
        }, { headers: authHeaders });

        const newLead = res.data;
        setSelectData(prev => ({ ...prev, leads: [newLead, ...prev.leads] }));
        setFormData(prev => ({ ...prev, leadId: newLead.id }));
        validateField('leadId', newLead.id);
    };

    const handleQuickAddEmployee = async (data) => {
        const res = await axios.post(`${API_URL}/employees`, {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email
        }, { headers: authHeaders });

        const newEmployee = res.data;
        setSelectData(prev => ({ ...prev, employees: [newEmployee, ...prev.employees] }));
        setFormData(prev => ({ ...prev, employeeId: newEmployee.id }));
        validateField('employeeId', newEmployee.id);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = [];

        const dErr = validateField('callDate', formData.callDate);
        if (dErr) errors.push(dErr);
        const tErr = validateField('callTime', formData.callTime);
        if (tErr) errors.push(tErr);
        const lErr = validateField('leadId', formData.leadId);
        if (lErr) errors.push(lErr);
        const eErr = validateField('employeeId', formData.employeeId);
        if (eErr) errors.push(eErr);
        const cErr = validateField('comments', formData.comments);
        if (cErr) errors.push(cErr);

        if (formData.remindMeBefore) {
            const rdErr = validateField('reminderDate', formData.reminderDate);
            if (rdErr) errors.push(rdErr);
            const rtErr = validateField('reminderTime', formData.reminderTime);
            if (rtErr) errors.push(rtErr);
        }

        if (errors.length > 0) {
            setValidationErrorList(errors);
            setIsValidationModalOpen(true);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                callTime: formData.callTime ? (formData.callTime.length === 5 ? `${formData.callTime}:00` : formData.callTime) : null,
                reminderTime: formData.reminderTime ? (formData.reminderTime.length === 5 ? `${formData.reminderTime}:00` : formData.reminderTime) : null,
                leadId: formData.leadId ? parseInt(formData.leadId) : null,
                employeeId: formData.employeeId ? parseInt(formData.employeeId) : null
            };

            if (isEdit) {
                await axios.put(`${API_URL}/crm/call-logs/${id}`, payload, { headers: authHeaders });
            } else {
                await axios.post(`${API_URL}/crm/call-logs`, payload, { headers: authHeaders });
            }

            navigate('/crm-dashboard/calling-data');
        } catch (err) {
            console.error("Save call log error", err);
            const apiMsg = err.response?.data?.message || 'Failed to save interaction log.';
            setValidationErrorList([apiMsg]);
            setIsValidationModalOpen(true);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#F8FAFC]">
                <Loader className="animate-spin h-8 w-8 text-[#0178BC]" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full bg-[#F8FAFC] text-[#102A43] p-0 overflow-hidden font-sans">
            {/* Unified Form Container */}
            <form onSubmit={handleSubmit} className="bg-white border-none rounded-none shadow-none overflow-hidden flex flex-col h-full min-h-0 w-full">
                {/* Header Bar */}
                <div className="bg-white border-b border-[#D7E3EE] px-4 py-3 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/crm-dashboard/calling-data')}
                            className="p-1.5 rounded-lg text-[#60738E] hover:bg-[#F8FAFC] hover:text-[#102A43] border border-[#D7E3EE] transition-all cursor-pointer"
                            title="Back to Calling Data"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-[#102A43] tracking-tight">
                                {isEdit ? 'Edit Interaction Log' : 'Log New Interaction'}
                            </h1>
                            <p className="text-xs text-[#60738E] mt-0.5">
                                Capture details, schedule follow-ups, and update lead engagement records
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/crm-dashboard/calling-data')}
                            className="px-3.5 py-1.5 text-xs font-bold text-[#60738E] bg-[#F8FAFC] border border-[#C9D8E5] rounded-md hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-[#0178BC] rounded-md hover:bg-[#005A8C] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            {submitting ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Save size={14} />}
                            {isEdit ? 'Update Log' : 'Confirm & Save Log'}
                        </button>
                    </div>
                </div>

                {/* Form Sections Grid Container */}
                <div className="p-2 sm:p-3 flex flex-col gap-2.5 sm:gap-3 bg-[#F8FAFC] flex-1 overflow-y-auto w-full">
                    {Object.keys(fieldErrors).length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600 font-medium shrink-0">
                            <AlertTriangle size={16} className="shrink-0" />
                            <span>Some fields require your attention before saving. Please fix the highlighted errors.</span>
                        </div>
                    )}

                    {/* Grid Section Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                        {/* Section 1: Call Schedule & Timing */}
                        <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5 border-t-2 border-t-[#0178BC]">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                    1
                                </div>
                                <h2 className="text-sm font-bold text-[#102A43]">Call Schedule & Details</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Call Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="callDate"
                                        value={formData.callDate}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.callDate ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                    />
                                    {fieldErrors.callDate && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.callDate}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Call Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="callTime"
                                        value={formData.callTime}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.callTime ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                    />
                                    {fieldErrors.callTime && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.callTime}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Interaction Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="interactionType"
                                        value={formData.interactionType}
                                        onChange={handleChange}
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                    >
                                        {interactionTypeOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Call Outcome <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="callOutcome"
                                        value={formData.callOutcome}
                                        onChange={handleChange}
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                    >
                                        {callOutcomeOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Ownership & Lead Relation */}
                        <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5 border-t-2 border-t-[#0178BC]">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                    2
                                </div>
                                <h2 className="text-sm font-bold text-[#102A43]">Ownership & Lead Association</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-bold text-[#102A43]">
                                            Related Lead <span className="text-red-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsLeadModalOpen(true)}
                                            className="text-[11px] font-medium text-[#0178BC] hover:underline flex items-center gap-0.5 cursor-pointer"
                                        >
                                            <Plus size={12} /> Add Lead
                                        </button>
                                    </div>
                                    <select
                                        name="leadId"
                                        value={formData.leadId}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.leadId ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer`}
                                    >
                                        <option value="">-- Select Lead --</option>
                                        {selectData.leads.map(l => (
                                            <option key={l.id} value={l.id}>
                                                {l.firstName} {l.lastName} {l.companyName ? `(${l.companyName})` : ''} - {l.leadNo || `#${l.id}`}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.leadId && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.leadId}</p>}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-bold text-[#102A43]">
                                            Assignee / Representative <span className="text-red-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsEmployeeModalOpen(true)}
                                            className="text-[11px] font-medium text-[#0178BC] hover:underline flex items-center gap-0.5 cursor-pointer"
                                        >
                                            <Plus size={12} /> Add Employee
                                        </button>
                                    </div>
                                    <select
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.employeeId ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer`}
                                    >
                                        <option value="">-- Select Representative --</option>
                                        {selectData.employees.map(e => (
                                            <option key={e.id} value={e.id}>
                                                {e.firstName} {e.lastName} ({e.email || e.department || 'Employee'})
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.employeeId && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.employeeId}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Engagement Notes & Detailed Summary */}
                        <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5 lg:col-span-2 border-t-2 border-t-[#0178BC]">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                    3
                                </div>
                                <h2 className="text-sm font-bold text-[#102A43]">Engagement & Discussion Notes</h2>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">
                                    Interaction Notes <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="comments"
                                    rows={4}
                                    value={formData.comments}
                                    onChange={handleChange}
                                    placeholder="Type comprehensive notes regarding the call discussion, requirements, questions, or next steps..."
                                    required
                                    className={`w-full p-3 bg-white border ${fieldErrors.comments ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] placeholder-[#102A43]/40 focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all resize-none`}
                                />
                                {fieldErrors.comments && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.comments}</p>}
                            </div>
                        </div>

                        {/* Section 4: Follow-up & Reminder Settings */}
                        <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5 lg:col-span-2 border-t-2 border-t-[#0178BC]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                        4
                                    </div>
                                    <h2 className="text-sm font-bold text-[#102A43]">Follow-up & Task Reminder</h2>
                                </div>
                                <label className="flex items-center gap-2 text-xs font-bold text-[#102A43] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="remindMeBefore"
                                        checked={formData.remindMeBefore}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-[#0178BC] rounded border-[#C9D8E5] focus:ring-[#0178BC]"
                                    />
                                    Enable Follow-up Reminder
                                </label>
                            </div>

                            {formData.remindMeBefore && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E8EEF7] animate-in fade-in duration-200">
                                    <div>
                                        <label className="block text-xs font-bold text-[#102A43] mb-1">
                                            Reminder Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="reminderDate"
                                            value={formData.reminderDate}
                                            onChange={handleChange}
                                            required={formData.remindMeBefore}
                                            className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.reminderDate ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                        />
                                        {fieldErrors.reminderDate && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.reminderDate}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#102A43] mb-1">
                                            Reminder Time <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            name="reminderTime"
                                            value={formData.reminderTime}
                                            onChange={handleChange}
                                            required={formData.remindMeBefore}
                                            className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.reminderTime ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                        />
                                        {fieldErrors.reminderTime && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.reminderTime}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            {/* Quick Add Modals */}
            <QuickAddModal
                isOpen={isLeadModalOpen}
                onClose={() => setIsLeadModalOpen(false)}
                title="Quick Add Lead"
                fields={[
                    { name: 'firstName', label: 'First Name', required: true },
                    { name: 'lastName', label: 'Last Name', required: true },
                    { name: 'email', label: 'Email Address', type: 'email' },
                    { name: 'phone', label: 'Phone Number', type: 'tel' },
                    { name: 'leadNo', label: 'Lead No.' },
                    { name: 'designation', label: 'Designation / Job Title' },
                    {
                        name: 'status',
                        label: 'Status',
                        type: 'select',
                        options: [
                            { value: 'NEW', label: 'New' },
                            { value: 'ACTIVE', label: 'Active' },
                            { value: 'PENDING', label: 'Pending' },
                            { value: 'UNASSIGNED', label: 'Unassigned' }
                        ]
                    }
                ]}
                onSubmit={handleQuickAddLead}
            />

            <QuickAddModal
                isOpen={isEmployeeModalOpen}
                onClose={() => setIsEmployeeModalOpen(false)}
                title="Quick Add Employee Representative"
                fields={[
                    { name: 'firstName', label: 'First Name', required: true },
                    { name: 'lastName', label: 'Last Name', required: true },
                    { name: 'email', label: 'Work Email', type: 'email', required: true }
                ]}
                onSubmit={handleQuickAddEmployee}
            />

            <ValidationModal
                isOpen={isValidationModalOpen}
                onClose={() => setIsValidationModalOpen(false)}
                errors={validationErrorList}
            />
        </div>
    );
};

export default CrmCallLogFormPage;
