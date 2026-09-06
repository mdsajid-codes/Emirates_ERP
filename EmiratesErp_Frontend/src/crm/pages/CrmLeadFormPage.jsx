import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader, X, Plus, Save, Calendar, ChevronDown, Check, Search, AlertTriangle, RefreshCw } from 'lucide-react';
import CrmLeadStage from '../components/CrmLeadStage';
import LeadSource from '../components/LeadSource';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const forecastCategoryOptions = [
    { value: 'PIPELINE', label: 'Pipeline' },
    { value: 'BEST_CASE_FORECAST', label: 'Best Case Forecast' },
    { value: 'COMMIT_FORECAST', label: 'Commit Forecast' },
    { value: 'CLOSED_ONLY', label: 'Closed Only' },
    { value: 'QUOTA', label: 'Quota' },
    { value: 'OPEN_PIPELINE', label: 'Open Pipeline' },
];

const crmLeadStatusOptions = [
    { value: 'NEW', label: 'New' },
    { value: 'DUPLICATE', label: 'Duplicate' },
    { value: 'TRANSFERRED', label: 'Transferred' },
    { value: 'NOT_RESPONDING', label: 'Not Responding' },
    { value: 'JUNK', label: 'Junk' },
    { value: 'LOST', label: 'Lost' },
    { value: 'UNASSIGNED', label: 'Unassigned' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACTIVE', label: 'Active' },
];

const ManagementModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white text-[#102A43] rounded-lg shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-[#D7E3EE] flex justify-between items-center bg-[#F8FAFC]">
                    <h3 className="text-xl font-bold text-[#102A43]">{title}</h3>
                    <button onClick={onClose} className="p-2 rounded-full text-[#60738E] hover:bg-slate-200 transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-grow overflow-y-auto p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

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
                            className="px-3 py-1.5 bg-white border border-[#D7E3EE] rounded-md text-xs font-bold text-[#102A43] hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-1 px-4 py-1.5 bg-[#0178BC] hover:bg-[#005A8C] text-white rounded-md text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                            {submitting && <Loader className="animate-spin h-3 w-3" />}
                            <span>Save</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ValidationAlertModal = ({ isOpen, onClose, errors }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[80] p-4" onClick={onClose}>
            <div className="bg-white text-[#102A43] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-[#D7E3EE]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-[#D7E3EE] flex justify-between items-center bg-[#FFF5F5]">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle size={20} className="shrink-0" />
                        <h3 className="text-base font-bold">Validation Error</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[#60738E] hover:bg-slate-200 transition-colors"><X size={18} /></button>
                </div>
                <div className="p-5 flex flex-col gap-3">
                    <p className="text-xs text-[#60738E]">
                        Please resolve the following issue{errors.length > 1 ? 's' : ''} before saving the lead:
                    </p>
                    <ul className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                        {errors.map((err, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded border border-red-100">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1 shrink-0" />
                                <span>{err}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-end pt-3 mt-2 border-t border-[#D7E3EE]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 bg-[#0178BC] hover:bg-[#005A8C] text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
                        >
                            Got It
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductCheckboxDropdown = ({ products, selectedIds, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (id) => {
        const numId = Number(id);
        const exists = selectedIds.some(item => Number(item) === numId);
        if (exists) {
            onChange(selectedIds.filter(item => Number(item) !== numId));
        } else {
            onChange([...selectedIds, numId]);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedProducts = products.filter(p => selectedIds.some(id => Number(id) === Number(p.id)));

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full min-h-[32px] px-3 py-1 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all flex items-center justify-between gap-2 cursor-pointer"
            >
                <div className="flex flex-wrap gap-1 items-center flex-1 overflow-hidden">
                    {selectedProducts.length === 0 ? (
                        <span className="text-[#102A43]/40">Select Products</span>
                    ) : (
                        selectedProducts.map(p => (
                            <span
                                key={p.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E6F0F8] text-[#0178BC] font-semibold text-[11px] rounded"
                            >
                                {p.name}
                                <X
                                    size={12}
                                    className="hover:text-red-500 cursor-pointer shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleOption(p.id);
                                    }}
                                />
                            </span>
                        ))
                    )}
                </div>
                <ChevronDown size={14} className={`text-[#60738E] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#D7E3EE] rounded-md shadow-lg z-50 overflow-hidden flex flex-col max-h-56">
                    <div className="p-2 border-b border-[#D7E3EE] bg-[#F8FAFC]">
                        <div className="relative flex items-center">
                            <Search size={13} className="absolute left-2 text-[#60738E]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full pl-7 pr-2 py-1 bg-white border border-[#C9D8E5] rounded text-xs text-[#102A43] focus:outline-none focus:border-[#0178BC]"
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto p-1 flex flex-col gap-0.5">
                        {filteredProducts.length === 0 ? (
                            <div className="p-2.5 text-center text-xs text-[#60738E]">No products found</div>
                        ) : (
                            filteredProducts.map(p => {
                                const isChecked = selectedIds.some(id => Number(id) === Number(p.id));
                                return (
                                    <label
                                        key={p.id}
                                        onClick={() => toggleOption(p.id)}
                                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded cursor-pointer text-xs transition-colors ${
                                            isChecked ? 'bg-[#E6F0F8]/60 text-[#0178BC] font-medium' : 'hover:bg-slate-50 text-[#102A43]'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {}} // handled by parent container click
                                            className="w-3.5 h-3.5 rounded border-[#C9D8E5] text-[#0178BC] focus:ring-[#0178BC] cursor-pointer"
                                        />
                                        <span className="flex-1 truncate">{p.name}</span>
                                        {isChecked && <Check size={13} className="text-[#0178BC] shrink-0" />}
                                    </label>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const CrmLeadFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', companyId: '', email: '', phone: '',
        leadNo: '', industryId: '', designation: '', website: '', productIds: [], requirements: '',
        leadSourceId: '', notes: '', ownerId: '',
        currentStageId: '', locationId: '', forecastCategory: 'PIPELINE',
        expectedCloseDate: '', amount: '', status: 'NEW',
        address: { street: '', city: '', state: '', zip: '', country: '' },
    });

    const [selectData, setSelectData] = useState({
        companies: [], industries: [], products: [], employees: [], leadStages: [],
        locations: [], leadSources: [],
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isStageModalOpen, setIsStageModalOpen] = useState(false);
    const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [isIndustryModalOpen, setIsIndustryModalOpen] = useState(false);
    const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    const [fieldErrors, setFieldErrors] = useState({});
    const [validationErrorList, setValidationErrorList] = useState([]);
    const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);

    const authHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [companiesRes, industriesRes, productsRes, employeesRes, stagesRes, locationsRes, sourcesRes] = await Promise.all([
                axios.get(`${API_URL}/crm/companies`, { headers: authHeaders }),
                axios.get(`${API_URL}/settings/industries`, { headers: authHeaders }),
                axios.get(`${API_URL}/crm/products`, { headers: authHeaders }),
                axios.get(`${API_URL}/employees/all`, { headers: authHeaders }),
                axios.get(`${API_URL}/crm/lead-stages`, { headers: authHeaders }),
                axios.get(`${API_URL}/locations`, { headers: authHeaders }),
                axios.get(`${API_URL}/crm/lead-sources`, { headers: authHeaders }),
            ]);
            setSelectData({
                companies: companiesRes.data.content || companiesRes.data || [],
                industries: industriesRes.data || [],
                products: productsRes.data || [],
                employees: employeesRes.data || [],
                leadStages: stagesRes.data || [],
                locations: locationsRes.data || [],
                leadSources: sourcesRes.data || [],
            });

            if (isEdit) {
                const leadRes = await axios.get(`${API_URL}/crm/leads/${id}`, { headers: authHeaders });
                const item = leadRes.data;
                setFormData({
                    firstName: item.firstName || '',
                    lastName: item.lastName || '',
                    companyId: item.companyId || '',
                    email: item.email || '',
                    phone: item.phone || '',
                    leadNo: item.leadNo || '',
                    industryId: item.industryId || '',
                    designation: item.designation || '',
                    website: item.website || '',
                    productIds: item.products?.map(p => p.id) || [],
                    requirements: item.requirements || '',
                    leadSourceId: item.leadSourceId || '',
                    notes: item.notes || '',
                    ownerId: item.ownerId || '',
                    currentStageId: item.currentStageId || '',
                    locationId: item.locationId || '',
                    forecastCategory: item.forecastCategory || 'PIPELINE',
                    expectedCloseDate: item.expectedCloseDate ? item.expectedCloseDate.split('T')[0] : '',
                    amount: item.amount || '',
                    status: item.status || 'NEW',
                    address: item.address || { street: '', city: '', state: '', zip: '', country: '' },
                });
            }
        } catch (error) {
            console.error("Failed to fetch form data", error);
            alert("Failed to load required data. Please try again.");
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
            if (!value?.trim()) {
                err = 'First Name is required.';
            } else if (/[0-[#^$%&*()_+=[\]{};:"\\|<>,/?~`!@#]]/.test(value) && /\d/.test(value)) {
                err = 'First Name should only contain letters and spaces.';
            }
        }
        if (name === 'lastName') {
            if (!value?.trim()) {
                err = 'Last Name is required.';
            } else if (/\d/.test(value)) {
                err = 'Last Name should only contain letters and spaces.';
            }
        }
        if (name === 'leadNo' && !value?.trim()) err = 'Lead No. is required.';
        if (name === 'companyId' && !value) err = 'Company selection is required.';
        if (name === 'email') {
            if (!value?.trim()) {
                err = 'Email address is required.';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
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
        if (name === 'amount' && value && parseFloat(value) < 0) {
            err = 'Amount cannot be negative.';
        }
        return err;
    };

    const validateForm = () => {
        const errorsObj = {};
        const errorList = [];

        const fnErr = validateField('firstName', formData.firstName);
        if (fnErr) { errorsObj.firstName = fnErr; errorList.push(fnErr); }

        const lnErr = validateField('lastName', formData.lastName);
        if (lnErr) { errorsObj.lastName = lnErr; errorList.push(lnErr); }

        const leadNoErr = validateField('leadNo', formData.leadNo);
        if (leadNoErr) { errorsObj.leadNo = leadNoErr; errorList.push(leadNoErr); }

        const emailErr = validateField('email', formData.email);
        if (emailErr) { errorsObj.email = emailErr; errorList.push(emailErr); }

        const compErr = validateField('companyId', formData.companyId);
        if (compErr) { errorsObj.companyId = compErr; errorList.push(compErr); }

        const phoneErr = validateField('phone', formData.phone);
        if (phoneErr) { errorsObj.phone = phoneErr; errorList.push(phoneErr); }

        const webErr = validateField('website', formData.website);
        if (webErr) { errorsObj.website = webErr; errorList.push(webErr); }

        const amtErr = validateField('amount', formData.amount);
        if (amtErr) { errorsObj.amount = amtErr; errorList.push(amtErr); }

        setFieldErrors(errorsObj);
        setValidationErrorList(errorList);
        return errorList.length === 0;
    };

    const generateRandomLeadNo = () => {
        const randomDigits = Math.floor(100000 + Math.random() * 900000);
        const generated = `LEAD-${randomDigits}`;
        setFormData(prev => ({ ...prev, leadNo: generated }));
        setFieldErrors(prev => ({ ...prev, leadNo: '' }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Input Sanity restrictions
        if (name === 'firstName' || name === 'lastName') {
            // Disallow typing numbers directly into name fields
            if (/\d/.test(value)) return;
        }

        if (name === 'phone') {
            // Disallow typing alphabetic letters into phone number field
            if (/[a-zA-Z]/.test(value)) return;
        }

        if (name.startsWith("address.")) {
            const field = name.split('.')[1];
            setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
            const err = validateField(name, value);
            setFieldErrors(prev => ({ ...prev, [name]: err }));
        }
    };

    const handleMultiSelectChange = (e) => {
        const { name, options } = e.target;
        const value = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setIsValidationModalOpen(true);
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                amount: formData.amount ? parseFloat(formData.amount) : null,
                companyId: formData.companyId ? parseInt(formData.companyId) : null,
                productIds: formData.productIds.map(pid => parseInt(pid)),
            };

            if (isEdit) {
                await axios.put(`${API_URL}/crm/leads/${id}`, payload, { headers: authHeaders });
            } else {
                await axios.post(`${API_URL}/crm/leads`, payload, { headers: authHeaders });
            }
            navigate('/crm-dashboard/leads/all');
        } catch (err) {
            console.error("Save lead error", err);
            const apiMsg = err.response?.data?.message || 'Failed to save lead.';
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
            {/* Unified Form Container (Full Width & Edge-to-Edge) */}
            <form onSubmit={handleSubmit} className="bg-white border-none rounded-none shadow-none overflow-hidden flex flex-col h-full min-h-0 w-full">
                {/* Header / Title Bar */}
                <div className="bg-white border-b border-[#D7E3EE] px-4 py-3 shrink-0">
                    <h1 className="text-lg font-bold text-[#102A43] tracking-tight">
                        {isEdit ? 'Edit Lead' : 'Create New Lead'}
                    </h1>
                    <p className="text-xs text-[#60738E] mt-0.5">
                        Fill in the details below to {isEdit ? 'update the' : 'add a'} lead to your pipeline
                    </p>
                </div>

                {/* Form Sections Grid Container (Scrollable Full Width) */}
                <div className="p-2 sm:p-3 flex flex-col gap-2.5 sm:gap-3 bg-[#F8FAFC] flex-1 overflow-y-auto w-full">
                {/* Row 1: Section 1 (Basic Specifications) & Section 2 (Lead Classification) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    {/* Section 1: Basic Specifications */}
                    <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                1
                            </div>
                            <h2 className="text-sm font-bold text-[#102A43]">Basic Specifications</h2>
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
                                    placeholder="Types Here"
                                    required
                                    className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.firstName ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] placeholder-[#102A43]/40 focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
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
                                    placeholder="Types Here"
                                    required
                                    className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.lastName ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] placeholder-[#102A43]/40 focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                />
                                {fieldErrors.lastName && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.lastName}</p>}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-[#102A43]">
                                        Lead No. <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={generateRandomLeadNo}
                                        className="text-[11px] font-medium text-[#0178BC] hover:underline flex items-center gap-1 cursor-pointer"
                                        title="Auto-generate random Lead No."
                                    >
                                        <RefreshCw size={11} className="hover:rotate-180 transition-transform duration-300" /> generate
                                    </button>
                                </div>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        name="leadNo"
                                        value={formData.leadNo}
                                        onChange={handleChange}
                                        placeholder="Types Here"
                                        required
                                        className={`w-full pl-3 pr-8 py-1.5 bg-white border ${fieldErrors.leadNo ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] placeholder-[#102A43]/40 focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 font-mono`}
                                    />
                                    <button
                                        type="button"
                                        onClick={generateRandomLeadNo}
                                        className="absolute right-2 p-1 text-[#60738E] hover:text-[#0178BC] transition-colors rounded cursor-pointer"
                                        title="Auto-generate random Lead No."
                                    >
                                        <RefreshCw size={13} />
                                    </button>
                                </div>
                                {fieldErrors.leadNo && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.leadNo}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Types Here"
                                    required
                                    className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] placeholder-[#102A43]/40 focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                />
                                {fieldErrors.email && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Types Here"
                                    className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] placeholder-[#102A43]/40 focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                />
                                {fieldErrors.phone && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.phone}</p>}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-[#102A43]">
                                        Company <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCompanyModalOpen(true)}
                                        className="text-[11px] font-medium text-[#0178BC] hover:underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                        <Plus size={11} /> add
                                    </button>
                                </div>
                                <select
                                    name="companyId"
                                    value={formData.companyId}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-3 py-1.5 bg-white border ${fieldErrors.companyId ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer`}
                                >
                                    <option value="">Select Company</option>
                                    {selectData.companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {fieldErrors.companyId && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.companyId}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Lead Classification */}
                    <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                2
                            </div>
                            <h2 className="text-sm font-bold text-[#102A43]">Lead Classification</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-[#102A43]">Industry</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsIndustryModalOpen(true)}
                                        className="text-[11px] font-medium text-[#0178BC] hover:underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                        <Plus size={11} /> add
                                    </button>
                                </div>
                                <select
                                    name="industryId"
                                    value={formData.industryId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                >
                                    <option value="">Select Industry</option>
                                    {selectData.industries.map(i => (
                                        <option key={i.id} value={i.id}>{i.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-[#102A43]">Lead Stage</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsStageModalOpen(true)}
                                        className="text-[11px] font-medium text-[#0178BC] hover:underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                        <Plus size={11} /> add
                                    </button>
                                </div>
                                <select
                                    name="currentStageId"
                                    value={formData.currentStageId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                >
                                    <option value="">Select Stage</option>
                                    {selectData.leadStages.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-[#102A43]">Lead Owner</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsOwnerModalOpen(true)}
                                        className="text-[11px] font-medium text-[#0178BC] hover:underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                        <Plus size={11} /> add
                                    </button>
                                </div>
                                <select
                                    name="ownerId"
                                    value={formData.ownerId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                >
                                    <option value="">Select Owner</option>
                                    {selectData.employees.map(e => (
                                        <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                >
                                    {crmLeadStatusOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-[#102A43]">Location</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsLocationModalOpen(true)}
                                        className="text-[11px] font-medium text-[#0178BC] hover:underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                        <Plus size={11} /> add
                                    </button>
                                </div>
                                <select
                                    name="locationId"
                                    value={formData.locationId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                >
                                    <option value="">Select Location</option>
                                    {selectData.locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-[#102A43]">Lead Source</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsSourceModalOpen(true)}
                                        className="text-[11px] font-medium text-[#0178BC] hover:underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                        <Plus size={11} /> add
                                    </button>
                                </div>
                                <select
                                    name="leadSourceId"
                                    value={formData.leadSourceId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                >
                                    <option value="">Select Source</option>
                                    {selectData.leadSources.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Section 3 (Financials & Forecast), Section 4 (Products & Addresses), Section 5 (Additional Remarks) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                    {/* Section 3: Financials & Forecast */}
                    <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                3
                            </div>
                            <h2 className="text-sm font-bold text-[#102A43]">Financials & Forecast</h2>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#102A43]">AED</span>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className={`w-full pl-12 pr-3 py-1.5 bg-white border ${fieldErrors.amount ? 'border-red-500 ring-1 ring-red-500' : 'border-[#C9D8E5]'} rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8`}
                                    />
                                </div>
                                {fieldErrors.amount && <p className="text-[10px] text-red-500 font-medium mt-0.5">{fieldErrors.amount}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">Expected Close Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="expectedCloseDate"
                                        value={formData.expectedCloseDate}
                                        onChange={handleChange}
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">Forecast Category</label>
                                <select
                                    name="forecastCategory"
                                    value={formData.forecastCategory}
                                    onChange={handleChange}
                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8 cursor-pointer"
                                >
                                    {forecastCategoryOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Products & Addresses */}
                    <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-[#0178BC] text-white rounded font-bold text-[11px] flex items-center justify-center">
                                4
                            </div>
                            <h2 className="text-sm font-bold text-[#102A43]">Products & Addresses</h2>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-[#102A43]">Interested Products</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsProductModalOpen(true)}
                                        className="text-[11px] font-medium text-[#0178BC] hover:underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                        <Plus size={11} /> add
                                    </button>
                                </div>

                                <ProductCheckboxDropdown
                                    products={selectData.products}
                                    selectedIds={formData.productIds}
                                    onChange={(newIds) => setFormData(prev => ({ ...prev, productIds: newIds }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">Street</label>
                                    <input
                                        type="text"
                                        name="address.street"
                                        value={formData.address.street}
                                        onChange={handleChange}
                                        placeholder="Type Here"
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] placeholder-[#102A43]/40 focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">City</label>
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        placeholder="Type Here"
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] placeholder-[#102A43]/40 focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">State/ Province</label>
                                    <input
                                        type="text"
                                        name="address.state"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        placeholder="Type Here"
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] placeholder-[#102A43]/40 focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#102A43] mb-1">Zip/ Postal Code</label>
                                    <input
                                        type="text"
                                        name="address.zip"
                                        value={formData.address.zip}
                                        onChange={handleChange}
                                        placeholder="Type Here"
                                        className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] placeholder-[#102A43]/40 focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#102A43] mb-1">Country</label>
                                <input
                                    type="text"
                                    name="address.country"
                                    value={formData.address.country}
                                    onChange={handleChange}
                                    placeholder="Type Here"
                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] placeholder-[#102A43]/40 focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all h-8"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Additional Remarks */}
                    <div className="bg-white border border-[#D7E3EE] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-[#0178BC] text-[#102A43] rounded font-bold text-[11px] flex items-center justify-center">
                                5
                            </div>
                            <h2 className="text-sm font-bold text-[#102A43]">Additional Remarks</h2>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-[#102A43]">Requirements</label>
                                    <span className="text-[10px] text-[#60738E]">{formData.requirements.length}/500</span>
                                </div>
                                <textarea
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleChange}
                                    maxLength={500}
                                    rows={2}
                                    placeholder="Specific customer needs..."
                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] placeholder-[#102A43]/40 focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all resize-none"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-[#102A43]">Internal Notes</label>
                                    <span className="text-[10px] text-[#60738E]">{formData.notes.length}/500</span>
                                </div>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    maxLength={500}
                                    rows={2}
                                    placeholder="Private notes for team..."
                                    className="w-full px-3 py-1.5 bg-white border border-[#C9D8E5] rounded-md text-xs text-[#102A43] placeholder-[#102A43]/40 focus:border-[#0178BC] focus:ring-1 focus:ring-[#0178BC] outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                </div>
                {/* Form Footer Action Buttons */}
                <div className="flex justify-end items-center gap-2 p-3 sm:px-4 bg-white border-t border-[#D7E3EE] shrink-0">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-1.5 bg-white border border-[#D7E3EE] rounded-lg text-xs font-bold text-[#102A43] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                        disabled={submitting}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-1.5 px-5 py-1.5 bg-[#009BA1] hover:bg-[#00868C] text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                        {submitting ? (
                            <Loader className="animate-spin h-3.5 w-3.5" />
                        ) : (
                            <Save className="h-3.5 w-3.5" />
                        )}
                        <span>{isEdit ? 'Update Lead' : 'Create Lead'}</span>
                    </button>
                </div>
            </form>

            <ManagementModal isOpen={isStageModalOpen} onClose={() => { setIsStageModalOpen(false); fetchData(); }} title="Manage Lead Stages">
                <CrmLeadStage />
            </ManagementModal>

            <ManagementModal isOpen={isSourceModalOpen} onClose={() => { setIsSourceModalOpen(false); fetchData(); }} title="Manage Lead Sources">
                <LeadSource />
            </ManagementModal>

            <QuickAddModal
                isOpen={isCompanyModalOpen}
                onClose={() => setIsCompanyModalOpen(false)}
                title="Add New Company"
                fields={[{ name: 'name', label: 'Company Name', required: true }]}
                onSubmit={async (data) => {
                    await axios.post(`${API_URL}/crm/companies`, data, { headers: authHeaders });
                    await fetchData();
                }}
            />

            <QuickAddModal
                isOpen={isIndustryModalOpen}
                onClose={() => setIsIndustryModalOpen(false)}
                title="Add New Industry"
                fields={[{ name: 'name', label: 'Industry Name', required: true }]}
                onSubmit={async (data) => {
                    await axios.post(`${API_URL}/settings/industries`, data, { headers: authHeaders });
                    await fetchData();
                }}
            />

            <QuickAddModal
                isOpen={isOwnerModalOpen}
                onClose={() => setIsOwnerModalOpen(false)}
                title="Add New Lead Owner / Employee"
                fields={[
                    { name: 'firstName', label: 'First Name', required: true },
                    { name: 'lastName', label: 'Last Name', required: true },
                    { name: 'email', label: 'Email', type: 'email', required: true },
                ]}
                onSubmit={async (data) => {
                    await axios.post(`${API_URL}/employees`, data, { headers: authHeaders });
                    await fetchData();
                }}
            />

            <QuickAddModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                title="Add New Location"
                fields={[{ name: 'name', label: 'Location Name', required: true }]}
                onSubmit={async (data) => {
                    await axios.post(`${API_URL}/locations`, data, { headers: authHeaders });
                    await fetchData();
                }}
            />

            <QuickAddModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                title="Add New Product"
                fields={[
                    { name: 'name', label: 'Product Name', required: true },
                    { name: 'price', label: 'Price (AED)', type: 'number' },
                ]}
                onSubmit={async (data) => {
                    await axios.post(`${API_URL}/crm/products`, data, { headers: authHeaders });
                    await fetchData();
                }}
            />

            <ValidationAlertModal
                isOpen={isValidationModalOpen}
                onClose={() => setIsValidationModalOpen(false)}
                errors={validationErrorList}
            />
        </div>
    );
};

export default CrmLeadFormPage;
