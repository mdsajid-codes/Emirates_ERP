import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader, X, Plus, Save, Building, MapPin, Globe, Phone, Mail, User, AlertTriangle, ArrowLeft, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

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
                        Please resolve the following required fields before saving the company:
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

const CrmCompanyFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        companyOwner: '',
        phone: '',
        email: '',
        website: '',
        locationId: '',
        companyTypeId: '',
        industryId: '',
        parentCompanyId: '',
        billingStreet: '',
        billingCity: '',
        billingZip: '',
        billingState: '',
        billingCountry: 'United Arab Emirates',
        shippingStreet: '',
        shippingCity: '',
        shippingZip: '',
        shippingState: '',
        shippingCountry: 'United Arab Emirates',
    });

    const [selectData, setSelectData] = useState({
        companies: [],
        companyTypes: [],
        industries: [],
        locations: []
    });

    const [isSameAddress, setIsSameAddress] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [validationErrorList, setValidationErrorList] = useState([]);
    const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);

    const [isIndustryModalOpen, setIsIndustryModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    const authHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [companiesRes, typesRes, industriesRes, locationsRes] = await Promise.all([
                axios.get(`${API_URL}/crm/companies`, { headers: authHeaders }),
                axios.get(`${API_URL}/crm/company-types`, { headers: authHeaders }),
                axios.get(`${API_URL}/settings/industries`, { headers: authHeaders }),
                axios.get(`${API_URL}/locations`, { headers: authHeaders }),
            ]);

            setSelectData({
                companies: Array.isArray(companiesRes.data) ? companiesRes.data : [],
                companyTypes: Array.isArray(typesRes.data) ? typesRes.data : [],
                industries: Array.isArray(industriesRes.data) ? industriesRes.data : [],
                locations: Array.isArray(locationsRes.data) ? locationsRes.data : [],
            });

            if (isEdit) {
                const companyRes = await axios.get(`${API_URL}/crm/companies/${id}`, { headers: authHeaders });
                const item = companyRes.data;
                setFormData({
                    name: item.name || '',
                    companyOwner: item.companyOwner || '',
                    phone: item.phone || '',
                    email: item.email || '',
                    website: item.website || '',
                    locationId: item.locationId || '',
                    companyTypeId: item.companyTypeId || '',
                    industryId: item.industryId || '',
                    parentCompanyId: item.parentCompanyId || '',
                    billingStreet: item.billingStreet || '',
                    billingCity: item.billingCity || '',
                    billingZip: item.billingZip || '',
                    billingState: item.billingState || '',
                    billingCountry: item.billingCountry || 'United Arab Emirates',
                    shippingStreet: item.shippingStreet || '',
                    shippingCity: item.shippingCity || '',
                    shippingZip: item.shippingZip || '',
                    shippingState: item.shippingState || '',
                    shippingCountry: item.shippingCountry || 'United Arab Emirates',
                });
            }
        } catch (error) {
            console.error("Failed to load company form data", error);
            alert("Failed to load required company options.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const validateField = (name, value) => {
        let err = '';
        if (name === 'name' && !value?.trim()) err = 'Company Name is required.';
        if (name === 'email' && value) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                err = 'Please enter a valid email address.';
            }
        }
        if (name === 'phone' && value) {
            if (/[a-zA-Z]/.test(value)) {
                err = 'Phone number cannot contain letters.';
            } else if (!/^[0-9+\-\s()]{7,20}$/.test(value)) {
                err = 'Please enter a valid phone number (digits only, min 7 digits).';
            }
        }
        if (name === 'website' && value) {
            if (!/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/.test(value)) {
                err = 'Please enter a valid website URL.';
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
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (isSameAddress && name.startsWith('billing')) {
                const targetKey = name.replace('billing', 'shipping');
                updated[targetKey] = value;
            }
            return updated;
        });
        validateField(name, value);
    };

    const handleSameAddressToggle = (e) => {
        const checked = e.target.checked;
        setIsSameAddress(checked);
        if (checked) {
            setFormData(prev => ({
                ...prev,
                shippingStreet: prev.billingStreet,
                shippingCity: prev.billingCity,
                shippingState: prev.billingState,
                shippingZip: prev.billingZip,
                shippingCountry: prev.billingCountry,
            }));
        }
    };

    const handleQuickAddIndustry = async (data) => {
        const res = await axios.post(`${API_URL}/settings/industries`, { name: data.name }, { headers: authHeaders });
        const newIndustry = res.data;
        setSelectData(prev => ({ ...prev, industries: [...prev.industries, newIndustry] }));
        setFormData(prev => ({ ...prev, industryId: newIndustry.id }));
    };

    const handleQuickAddLocation = async (data) => {
        const res = await axios.post(`${API_URL}/locations`, { name: data.name }, { headers: authHeaders });
        const newLocation = res.data;
        setSelectData(prev => ({ ...prev, locations: [...prev.locations, newLocation] }));
        setFormData(prev => ({ ...prev, locationId: newLocation.id }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = [];

        const nameErr = validateField('name', formData.name);
        if (nameErr) errors.push(nameErr);
        const emailErr = validateField('email', formData.email);
        if (emailErr) errors.push(emailErr);
        const phoneErr = validateField('phone', formData.phone);
        if (phoneErr) errors.push(phoneErr);
        const webErr = validateField('website', formData.website);
        if (webErr) errors.push(webErr);

        if (errors.length > 0) {
            setValidationErrorList(errors);
            setIsValidationModalOpen(true);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                locationId: formData.locationId ? parseInt(formData.locationId) : null,
                companyTypeId: formData.companyTypeId ? parseInt(formData.companyTypeId) : null,
                industryId: formData.industryId ? parseInt(formData.industryId) : null,
                parentCompanyId: formData.parentCompanyId ? parseInt(formData.parentCompanyId) : null,
            };

            if (isEdit) {
                await axios.put(`${API_URL}/crm/companies/${id}`, payload, { headers: authHeaders });
            } else {
                await axios.post(`${API_URL}/crm/companies`, payload, { headers: authHeaders });
            }

            navigate('/crm-dashboard/companies');
        } catch (err) {
            console.error("Save company error", err);
            const apiMsg = err.response?.data?.message || 'Failed to save company entity.';
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
                            onClick={() => navigate('/crm-dashboard/companies')}
                            className="p-1.5 rounded-lg text-[#60738E] hover:bg-[#F8FAFC] hover:text-[#102A43] border border-[#D7E3EE] transition-all cursor-pointer"
                            title="Back to Companies"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-[#102A43] tracking-tight">
                                {isEdit ? 'Edit Corporate Entity' : 'Add New Corporate Entity'}
                            </h1>
                            <p className="text-xs text-[#60738E] mt-0.5">
                                Register company profile, addresses, industry, and contact details
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/crm-dashboard/companies')}
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
                            {isEdit ? 'Update Company' : 'Save Company Record'}
                        </button>
                    </div>
                </div>

                {/* Main Scrollable Grid Content */}
                <div className="p-2 sm:p-3 flex flex-col gap-2.5 sm:gap-3 bg-[#F8FAFC] flex-1 overflow-y-auto w-full">
                    {Object.keys(fieldErrors).length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600 font-medium shrink-0">
                            <AlertTriangle size={16} className="shrink-0" />
                            <span>Some fields contain invalid data. Please correct the highlighted errors.</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                        {/* Section 1: Basic Corporate Specifications */}
                        <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5 border-t-2 border-t-[#0178BC]">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                    1
                                </div>
                                <h2 className="text-sm font-bold text-[#102A43]">Basic Corporate Specifications</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Company Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Emirates Trading LLC"
                                        required
                                        className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                    />
                                    {fieldErrors.name && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Company Owner / Account Manager
                                    </label>
                                    <input
                                        type="text"
                                        name="companyOwner"
                                        value={formData.companyOwner}
                                        onChange={handleChange}
                                        placeholder="Account Owner Name"
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Company Type
                                    </label>
                                    <select
                                        name="companyTypeId"
                                        value={formData.companyTypeId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                    >
                                        <option value="">-- Select Type --</option>
                                        {selectData.companyTypes.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-bold text-[#102A43]">
                                            Industry Sector
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsIndustryModalOpen(true)}
                                            className="text-[11px] font-medium text-[#0178BC] hover:underline flex items-center gap-0.5 cursor-pointer"
                                        >
                                            <Plus size={12} /> Add Industry
                                        </button>
                                    </div>
                                    <select
                                        name="industryId"
                                        value={formData.industryId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                    >
                                        <option value="">-- Select Industry --</option>
                                        {selectData.industries.map(ind => (
                                            <option key={ind.id} value={ind.id}>{ind.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-bold text-[#102A43]">
                                            Location Hub
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsLocationModalOpen(true)}
                                            className="text-[11px] font-medium text-[#0178BC] hover:underline flex items-center gap-0.5 cursor-pointer"
                                        >
                                            <Plus size={12} /> Add Location
                                        </button>
                                    </div>
                                    <select
                                        name="locationId"
                                        value={formData.locationId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                    >
                                        <option value="">-- Select Location --</option>
                                        {selectData.locations.map(loc => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Parent Holding Company
                                    </label>
                                    <select
                                        name="parentCompanyId"
                                        value={formData.parentCompanyId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                    >
                                        <option value="">-- None (Standalone Entity) --</option>
                                        {selectData.companies
                                            .filter(c => c.id !== Number(id))
                                            .map(comp => (
                                                <option key={comp.id} value={comp.id}>{comp.name}</option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contact & Communication Hub */}
                        <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5 border-t-2 border-t-[#0178BC]">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                    2
                                </div>
                                <h2 className="text-sm font-bold text-[#102A43]">Contact & Digital Terminal</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Corporate Phone
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="e.g. +971 4 314 1409"
                                        className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                    />
                                    {fieldErrors.phone && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Corporate Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="e.g. info@company.ae"
                                        className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                    />
                                    {fieldErrors.email && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.email}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                                        Website / Portal URL
                                    </label>
                                    <input
                                        type="text"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="e.g. https://www.company.ae"
                                        className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.website ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                    />
                                    {fieldErrors.website && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.website}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Billing & Shipping Address */}
                        <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5 lg:col-span-2 border-t-2 border-t-[#0178BC]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                        3
                                    </div>
                                    <h2 className="text-sm font-bold text-[#102A43]">Address Information</h2>
                                </div>
                                <label className="flex items-center gap-2 text-xs font-bold text-[#102A43] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isSameAddress}
                                        onChange={handleSameAddressToggle}
                                        className="h-4 w-4 text-[#0178BC] rounded border-[#C9D8E5] focus:ring-[#0178BC]"
                                    />
                                    Shipping same as Billing
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                {/* Billing Address */}
                                <div className="p-3 bg-[#F8FAFC] border border-[#E8EEF7] rounded-lg space-y-2.5">
                                    <h3 className="text-xs font-extrabold text-[#102A43] uppercase tracking-wider">Billing Address</h3>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#60738E] mb-1">Street</label>
                                        <input
                                            type="text"
                                            name="billingStreet"
                                            value={formData.billingStreet}
                                            onChange={handleChange}
                                            placeholder="Street details"
                                            className="w-full px-3 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-[#102A43] focus:border-[#0178BC] outline-none h-7"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[11px] font-bold text-[#60738E] mb-1">City</label>
                                            <input
                                                type="text"
                                                name="billingCity"
                                                value={formData.billingCity}
                                                onChange={handleChange}
                                                placeholder="Dubai"
                                                className="w-full px-3 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-[#102A43] focus:border-[#0178BC] outline-none h-7"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-[#60738E] mb-1">State / Emirate</label>
                                            <input
                                                type="text"
                                                name="billingState"
                                                value={formData.billingState}
                                                onChange={handleChange}
                                                placeholder="Dubai"
                                                className="w-full px-3 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-[#102A43] focus:border-[#0178BC] outline-none h-7"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[11px] font-bold text-[#60738E] mb-1">Zip / PO Box</label>
                                            <input
                                                type="text"
                                                name="billingZip"
                                                value={formData.billingZip}
                                                onChange={handleChange}
                                                placeholder="PO Box 12345"
                                                className="w-full px-3 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-[#102A43] focus:border-[#0178BC] outline-none h-7"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-[#60738E] mb-1">Country</label>
                                            <input
                                                type="text"
                                                name="billingCountry"
                                                value={formData.billingCountry}
                                                onChange={handleChange}
                                                placeholder="United Arab Emirates"
                                                className="w-full px-3 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-[#102A43] focus:border-[#0178BC] outline-none h-7"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="p-3 bg-[#F8FAFC] border border-[#E8EEF7] rounded-lg space-y-2.5">
                                    <h3 className="text-xs font-extrabold text-[#102A43] uppercase tracking-wider">Shipping Address</h3>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#60738E] mb-1">Street</label>
                                        <input
                                            type="text"
                                            name="shippingStreet"
                                            value={formData.shippingStreet}
                                            onChange={handleChange}
                                            disabled={isSameAddress}
                                            placeholder="Street details"
                                            className="w-full px-3 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-[#102A43] focus:border-[#0178BC] outline-none h-7 disabled:bg-slate-100"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[11px] font-bold text-[#60738E] mb-1">City</label>
                                            <input
                                                type="text"
                                                name="shippingCity"
                                                value={formData.shippingCity}
                                                onChange={handleChange}
                                                disabled={isSameAddress}
                                                placeholder="Dubai"
                                                className="w-full px-3 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-[#102A43] focus:border-[#0178BC] outline-none h-7 disabled:bg-slate-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-[#60738E] mb-1">State / Emirate</label>
                                            <input
                                                type="text"
                                                name="shippingState"
                                                value={formData.shippingState}
                                                onChange={handleChange}
                                                disabled={isSameAddress}
                                                placeholder="Dubai"
                                                className="w-full px-3 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-[#102A43] focus:border-[#0178BC] outline-none h-7 disabled:bg-slate-100"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[11px] font-bold text-[#60738E] mb-1">Zip / PO Box</label>
                                            <input
                                                type="text"
                                                name="shippingZip"
                                                value={formData.shippingZip}
                                                onChange={handleChange}
                                                disabled={isSameAddress}
                                                placeholder="PO Box 12345"
                                                className="w-full px-3 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-[#102A43] focus:border-[#0178BC] outline-none h-7 disabled:bg-slate-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-[#60738E] mb-1">Country</label>
                                            <input
                                                type="text"
                                                name="shippingCountry"
                                                value={formData.shippingCountry}
                                                onChange={handleChange}
                                                disabled={isSameAddress}
                                                placeholder="United Arab Emirates"
                                                className="w-full px-3 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-[#102A43] focus:border-[#0178BC] outline-none h-7 disabled:bg-slate-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Quick Add Modals */}
            <QuickAddModal
                isOpen={isIndustryModalOpen}
                onClose={() => setIsIndustryModalOpen(false)}
                title="Quick Add Industry Sector"
                fields={[{ name: 'name', label: 'Industry Sector Name', required: true }]}
                onSubmit={handleQuickAddIndustry}
            />

            <QuickAddModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                title="Quick Add Location Hub"
                fields={[{ name: 'name', label: 'Location Hub Name', required: true }]}
                onSubmit={handleQuickAddLocation}
            />

            <ValidationModal
                isOpen={isValidationModalOpen}
                onClose={() => setIsValidationModalOpen(false)}
                errors={validationErrorList}
            />
        </div>
    );
};

export default CrmCompanyFormPage;
