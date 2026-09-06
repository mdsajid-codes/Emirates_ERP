import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader, X, Plus, Save, Calendar, Clock, ArrowLeft, AlertTriangle, Users, Globe, MapPin, Tag } from 'lucide-react';
import InfiniteLeadSelect from '../components/InfiniteLeadSelect';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const subjectOptions = [
    { value: 'MEETING', label: 'Strategic Meeting' },
    { value: 'CALL', label: 'Conference Call' },
    { value: 'EVENT', label: 'Site Visit / Event' },
    { value: 'TASK', label: 'Task Review' },
    { value: 'OTHER', label: 'Other Engagement' }
];

const priorityOptions = [
    { value: 'NORMAL', label: 'Normal Priority' },
    { value: 'LOW', label: 'Low Latency' },
    { value: 'HIGH', label: 'Critical / High' }
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
                                <input
                                    type={field.type || 'text'}
                                    required={field.required}
                                    value={modalData[field.name] || ''}
                                    onChange={e => setModalData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                    placeholder="Type here..."
                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] outline-none transition-all h-8"
                                />
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
                        Please resolve the following required fields before submitting the event:
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

const CrmEventFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        subject: 'MEETING',
        description: '',
        date: new Date().toISOString().split('T')[0],
        fromTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
        toTime: '',
        primaryContactId: '',
        employeeIds: [],
        contactIds: [],
        status: 'OPEN',
        priority: 'NORMAL',
        meetingType: 'ONLINE',
        meetingWith: '',
        leadId: ''
    });

    const [selectData, setSelectData] = useState({
        employees: [],
        contacts: []
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [validationErrorList, setValidationErrorList] = useState([]);
    const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

    const authHeaders = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empRes, contactsRes] = await Promise.all([
                axios.get(`${API_URL}/employees/all`, { headers: authHeaders }),
                axios.get(`${API_URL}/crm/contacts`, { headers: authHeaders })
            ]);

            setSelectData({
                employees: empRes.data || [],
                contacts: contactsRes.data?.content || contactsRes.data || []
            });

            if (isEdit) {
                const eventRes = await axios.get(`${API_URL}/crm/events/${id}`, { headers: authHeaders });
                const item = eventRes.data;
                setFormData({
                    subject: item.subject || 'MEETING',
                    description: item.description || '',
                    date: item.date || new Date().toISOString().split('T')[0],
                    fromTime: item.fromTime ? item.fromTime.substring(0, 5) : '',
                    toTime: item.toTime ? item.toTime.substring(0, 5) : '',
                    primaryContactId: item.primaryContactId || '',
                    employeeIds: item.employeeIds || [],
                    contactIds: item.contactIds || [],
                    status: item.status || 'OPEN',
                    priority: item.priority || 'NORMAL',
                    meetingType: item.meetingType || 'ONLINE',
                    meetingWith: item.meetingWith || '',
                    leadId: item.leadId || ''
                });
            }
        } catch (error) {
            console.error("Failed to load event form data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const validateField = (name, value) => {
        let err = '';
        if (name === 'subject' && !value) err = 'Subject / Event type is required.';
        if (name === 'date' && !value) err = 'Execution Date is required.';
        if (name === 'fromTime' && !value) err = 'Start Time is required.';

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

    const handleMultiSelectChange = (e) => {
        const { name, options } = e.target;
        const value = Array.from(options).filter(option => option.selected).map(option => option.value);
        setFormData(prev => ({ ...prev, [name]: value }));
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
            status: 'NEW'
        }, { headers: authHeaders });

        const newLead = res.data;
        setFormData(prev => ({ ...prev, leadId: newLead.id }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = [];

        const sErr = validateField('subject', formData.subject);
        if (sErr) errors.push(sErr);
        const dErr = validateField('date', formData.date);
        if (dErr) errors.push(dErr);
        const tErr = validateField('fromTime', formData.fromTime);
        if (tErr) errors.push(tErr);

        if (errors.length > 0) {
            setValidationErrorList(errors);
            setIsValidationModalOpen(true);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                fromTime: formData.fromTime ? (formData.fromTime.length === 5 ? `${formData.fromTime}:00` : formData.fromTime) : null,
                toTime: formData.toTime ? (formData.toTime.length === 5 ? `${formData.toTime}:00` : formData.toTime) : null,
                leadId: formData.leadId ? parseInt(formData.leadId) : null,
                primaryContactId: formData.primaryContactId ? parseInt(formData.primaryContactId) : null
            };

            if (isEdit) {
                await axios.put(`${API_URL}/crm/events/${id}`, payload, { headers: authHeaders });
            } else {
                await axios.post(`${API_URL}/crm/events`, payload, { headers: authHeaders });
            }

            navigate('/crm-dashboard/calendar');
        } catch (err) {
            console.error("Save event error", err);
            const apiMsg = err.response?.data?.message || 'Failed to save event.';
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
            {/* Form Container */}
            <form onSubmit={handleSubmit} className="bg-white border-none rounded-none shadow-none overflow-hidden flex flex-col h-full min-h-0 w-full">
                {/* Header Bar */}
                <div className="bg-white border-b border-[#D7E3EE] px-4 py-3 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/crm-dashboard/calendar')}
                            className="p-1.5 rounded-lg text-[#60738E] hover:bg-[#F8FAFC] hover:text-[#102A43] border border-[#D7E3EE] transition-all cursor-pointer"
                            title="Back to Strategic Calendar"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-[#102A43] tracking-tight">
                                {isEdit ? 'Edit Event / Meeting' : 'Schedule New Event'}
                            </h1>
                            <p className="text-xs text-[#60738E] mt-0.5">
                                Schedule strategic client meetings, site visits, and coordinate team participation
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/crm-dashboard/calendar')}
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
                            {isEdit ? 'Update Event' : 'Confirm & Schedule Event'}
                        </button>
                    </div>
                </div>

                {/* Form Content Sections */}
                <div className="p-2 sm:p-3 flex flex-col gap-2.5 sm:gap-3 bg-[#F8FAFC] flex-1 overflow-y-auto w-full">
                    {Object.keys(fieldErrors).length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600 font-medium shrink-0">
                            <AlertTriangle size={16} className="shrink-0" />
                            <span>Some fields require your attention before saving. Please fix the highlighted errors.</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                        {/* Section 1: Classification & Lead Association */}
                        <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5 border-t-2 border-t-[#0178BC]">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                    1
                                </div>
                                <h2 className="text-sm font-bold text-[#102A43]">Event Classification & Association</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Subject / Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                    >
                                        {subjectOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-bold text-[#102A43]">
                                            Related Lead
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsLeadModalOpen(true)}
                                            className="text-[11px] font-medium text-[#0178BC] hover:underline flex items-center gap-0.5 cursor-pointer"
                                        >
                                            <Plus size={12} /> Add Lead
                                        </button>
                                    </div>
                                    <InfiniteLeadSelect
                                        value={formData.leadId}
                                        onChange={(newLeadId) => setFormData(prev => ({ ...prev, leadId: newLeadId }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Priority Level
                                    </label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs font-bold text-[#0178BC] focus:border-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                    >
                                        {priorityOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Primary Contact
                                    </label>
                                    <select
                                        name="primaryContactId"
                                        value={formData.primaryContactId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                    >
                                        <option value="">-- Select Stakeholder Contact --</option>
                                        {selectData.contacts.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.firstName} {c.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Date & Time Schedule */}
                        <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5 border-t-2 border-t-[#0178BC]">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                    2
                                </div>
                                <h2 className="text-sm font-bold text-[#102A43]">Schedule & Location</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Execution Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.date ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] outline-none transition-all h-8`}
                                    />
                                    {fieldErrors.date && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.date}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="fromTime"
                                        value={formData.fromTime}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.fromTime ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] outline-none transition-all h-8`}
                                    />
                                    {fieldErrors.fromTime && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.fromTime}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        name="toTime"
                                        value={formData.toTime}
                                        onChange={handleChange}
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] outline-none transition-all h-8"
                                    />
                                </div>

                                {formData.subject === 'MEETING' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-[#102A43] mb-1">
                                                Meeting Modality
                                            </label>
                                            <select
                                                name="meetingType"
                                                value={formData.meetingType}
                                                onChange={handleChange}
                                                className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                            >
                                                <option value="ONLINE">Digital / Online</option>
                                                <option value="ONSITE">Physical / On-site</option>
                                            </select>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold text-[#102A43] mb-1">
                                                Location / Link
                                            </label>
                                            <input
                                                type="text"
                                                name="meetingWith"
                                                value={formData.meetingWith}
                                                onChange={handleChange}
                                                placeholder="e.g. Google Meet link or Dubai Marina Office"
                                                className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] outline-none transition-all h-8"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Section 3: Delegates & Brief */}
                        <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5 lg:col-span-2 border-t-2 border-t-[#0178BC]">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                    3
                                </div>
                                <h2 className="text-sm font-bold text-[#102A43]">Strategic Brief & Description</h2>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">
                                    Event Description / Objectives
                                </label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Detailed objectives and strategic context for this engagement..."
                                    className="w-full p-3 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] placeholder-[#102A43]/40 focus:border-[#0178BC] outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>

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
                    { name: 'designation', label: 'Designation / Job Title' }
                ]}
                onSubmit={handleQuickAddLead}
            />

            <ValidationModal
                isOpen={isValidationModalOpen}
                onClose={() => setIsValidationModalOpen(false)}
                errors={validationErrorList}
            />
        </div>
    );
};

export default CrmEventFormPage;
