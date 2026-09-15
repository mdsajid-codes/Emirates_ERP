import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader, X, Plus, Save, User, Mail, Phone, Briefcase, Building, AlertTriangle, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

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
            <div className="bg-white text-[#102A43] rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-[#D7E3EE] flex justify-between items-center bg-[#F8FAFC]">
                    <h3 className="text-base font-bold text-[#102A43]">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full text-[#60738E] hover:bg-slate-200 transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
                    {error && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-600 font-medium">
                            {error}
                        </div>
                    )}
                    {fields.map(field => (
                        <div key={field.name}>
                            <label className="block text-xs font-bold text-[#102A43] mb-1">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type={field.type || 'text'}
                                required={field.required}
                                value={modalData[field.name] || ''}
                                onChange={e => setModalData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                placeholder="Type here..."
                                className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8"
                            />
                        </div>
                    ))}
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
                            {submitting && <Loader className="animate-spin h-3 w-3" />} Save
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
                        Please resolve the following required fields before saving the contact:
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

const CrmContactFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyId: '',
        designation: '',
        leadId: ''
    });

    const [selectData, setSelectData] = useState({
        companies: [],
        leads: []
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [validationErrorList, setValidationErrorList] = useState([]);
    const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);

    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

    const authHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [companiesRes, leadsRes] = await Promise.all([
                axios.get(`${API_URL}/crm/companies`, { headers: authHeaders }),
                axios.get(`${API_URL}/crm/leads`, { headers: authHeaders })
            ]);

            setSelectData({
                companies: Array.isArray(companiesRes.data) ? companiesRes.data : companiesRes.data?.content || [],
                leads: Array.isArray(leadsRes.data) ? leadsRes.data : leadsRes.data?.content || []
            });

            if (isEdit) {
                const contactRes = await axios.get(`${API_URL}/contacts/${id}`, { headers: authHeaders });
                const item = contactRes.data;
                setFormData({
                    firstName: item.firstName || '',
                    lastName: item.lastName || '',
                    email: item.email || '',
                    phone: item.phone || '',
                    companyId: item.companyId || '',
                    designation: item.designation || '',
                    leadId: item.leadId || ''
                });
            }
        } catch (error) {
            console.error("Failed to load contact form options", error);
            alert("Failed to load required contact options.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const validateField = (name, value) => {
        let err = '';
        if (name === 'firstName') {
            if (!value?.trim()) err = 'First Name is required.';
            else if (/^\d+$/.test(value.trim())) err = 'First Name cannot be numeric-only.';
        }
        if (name === 'lastName') {
            if (!value?.trim()) err = 'Last Name is required.';
            else if (/^\d+$/.test(value.trim())) err = 'Last Name cannot be numeric-only.';
        }
        if (name === 'email' && value?.trim()) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                err = 'Please enter a valid email address.';
            }
        }
        if (name === 'phone' && value?.trim()) {
            if (/[a-zA-Z]/.test(value)) {
                err = 'Phone number cannot contain letters.';
            } else if (!/^[0-9+\-\s()]{7,20}$/.test(value.trim())) {
                err = 'Please enter a valid phone number (digits only, 7-20 chars).';
            }
        }

        setFieldErrors(prev => {
            const next = { ...prev };
            if (err) next[name] = err;
            else delete next[name];
            return next;
        });

        return err;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleQuickAddCompany = async (data) => {
        const res = await axios.post(`${API_URL}/crm/companies`, { name: data.name }, { headers: authHeaders });
        const newCompany = res.data;
        setSelectData(prev => ({ ...prev, companies: [newCompany, ...prev.companies] }));
        setFormData(prev => ({ ...prev, companyId: newCompany.id }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = [];

        const fnErr = validateField('firstName', formData.firstName);
        if (fnErr) errors.push(fnErr);
        const lnErr = validateField('lastName', formData.lastName);
        if (lnErr) errors.push(lnErr);
        const emailErr = validateField('email', formData.email);
        if (emailErr) errors.push(emailErr);
        const phoneErr = validateField('phone', formData.phone);
        if (phoneErr) errors.push(phoneErr);

        if (errors.length > 0) {
            setValidationErrorList(errors);
            setIsValidationModalOpen(true);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                companyId: formData.companyId ? parseInt(formData.companyId) : null,
                leadId: formData.leadId ? parseInt(formData.leadId) : null
            };

            if (isEdit) {
                await axios.put(`${API_URL}/contacts/${id}`, payload, { headers: authHeaders });
            } else {
                await axios.post(`${API_URL}/contacts`, payload, { headers: authHeaders });
            }

            navigate('/crm-dashboard/contacts');
        } catch (err) {
            console.error("Save contact error", err);
            const apiMsg = err.response?.data?.message || 'Failed to save contact profile.';
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
            <form onSubmit={handleSubmit} className="bg-white border-none rounded-none shadow-none overflow-hidden flex flex-col h-full min-h-0 w-full">
                {/* Header Bar */}
                <div className="bg-white border-b border-[#D7E3EE] px-4 py-3 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/crm-dashboard/contacts')}
                            className="p-1.5 rounded-lg text-[#60738E] hover:bg-[#F8FAFC] hover:text-[#102A43] border border-[#D7E3EE] transition-all cursor-pointer"
                            title="Back to Contacts"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-[#102A43] tracking-tight">
                                {isEdit ? 'Edit Contact Dossier' : 'Register New Contact'}
                            </h1>
                            <p className="text-xs text-[#60738E] mt-0.5">
                                Save professional profile, organization affiliation, and communication channels
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/crm-dashboard/contacts')}
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
                            {isEdit ? 'Update Contact' : 'Save Contact Record'}
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="p-2 sm:p-3 flex flex-col gap-2.5 sm:gap-3 bg-[#F8FAFC] flex-1 overflow-y-auto w-full">
                    {Object.keys(fieldErrors).length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600 font-medium shrink-0">
                            <AlertTriangle size={16} className="shrink-0" />
                            <span>Some fields contain invalid data. Please correct the highlighted errors.</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                        {/* Section 1: Personal & Professional Specifications */}
                        <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5 border-t-2 border-t-[#0178BC]">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                    1
                                </div>
                                <h2 className="text-sm font-bold text-[#102A43]">Personal & Professional Details</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="e.g. Ahmad"
                                        required
                                        className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.firstName ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                    />
                                    {fieldErrors.firstName && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.firstName}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="e.g. Khan"
                                        required
                                        className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.lastName ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                    />
                                    {fieldErrors.lastName && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.lastName}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Designation / Job Title
                                    </label>
                                    <input
                                        type="text"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        placeholder="e.g. Senior Procurement Manager"
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-bold text-[#102A43]">
                                            Associated Company
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsCompanyModalOpen(true)}
                                            className="text-[11px] font-medium text-[#0178BC] hover:underline flex items-center gap-0.5 cursor-pointer"
                                        >
                                            <Plus size={12} /> Add Company
                                        </button>
                                    </div>
                                    <select
                                        name="companyId"
                                        value={formData.companyId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                    >
                                        <option value="">-- Select Company --</option>
                                        {selectData.companies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Communication Channels & Lead Association */}
                        <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5 border-t-2 border-t-[#0178BC]">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                    2
                                </div>
                                <h2 className="text-sm font-bold text-[#102A43]">Communication Channels & CRM Context</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="e.g. ahmad@gmail.com"
                                        className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                    />
                                    {fieldErrors.email && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Phone / Mobile Line
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="e.g. +971 52 532 4006"
                                        className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                    />
                                    {fieldErrors.phone && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.phone}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Affiliated CRM Lead
                                    </label>
                                    <select
                                        name="leadId"
                                        value={formData.leadId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                    >
                                        <option value="">-- None (Standalone Contact) --</option>
                                        {selectData.leads.map(l => (
                                            <option key={l.id} value={l.id}>
                                                {l.firstName} {l.lastName} {l.companyName ? `(${l.companyName})` : ''} - {l.leadNo || `#${l.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <QuickAddModal
                isOpen={isCompanyModalOpen}
                onClose={() => setIsCompanyModalOpen(false)}
                title="Quick Add Company Entity"
                fields={[{ name: 'name', label: 'Company Name', required: true }]}
                onSubmit={handleQuickAddCompany}
            />

            <ValidationModal
                isOpen={isValidationModalOpen}
                onClose={() => setIsValidationModalOpen(false)}
                errors={validationErrorList}
            />
        </div>
    );
};

export default CrmContactFormPage;
