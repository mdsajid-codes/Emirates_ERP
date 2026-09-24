import React, { useState, useEffect, useCallback } from 'react';
import { Building, Edit, PlusCircle, Loader, Save, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const constructImageUrl = (relativeUrl) => {
    if (!relativeUrl) return '';
    if (relativeUrl.startsWith('data:') || relativeUrl.startsWith('http')) return relativeUrl;

    const cleanPath = relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl;

    if (cleanPath.startsWith('uploads/')) {
        return `${API_URL}/pos/uploads/view/${cleanPath.replace('uploads/', '')}`;
    }
    return `${API_URL}/pos/uploads/view/${cleanPath}`;
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No authentication token found.");
    return { "Authorization": `Bearer ${token}` };
};

const api = {
    getCompanyInfo: async () => {
        const response = await axios.get(`${API_URL}/company-info`, { headers: getAuthHeaders() });
        return response.data;
    },
    saveCompanyInfo: async (data) => {
        const response = await axios.post(`${API_URL}/company-info`, data, { headers: getAuthHeaders() });
        return response.data;
    },
    uploadLogo: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API_URL}/company-info/logo`, formData, {
            headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    getLogo: async () => {
        const response = await axios.get(`${API_URL}/company-info/logo`, {
            headers: getAuthHeaders(),
            responseType: 'blob'
        });
        return URL.createObjectURL(response.data);
    }
};

// --- Reusable Components ---
const InputField = ({ label, id, className = '', ...props }) => (
    <div className={className}>
        {label && <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1">{label}</label>}
        <input
            id={id}
            {...props}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
        />
    </div>
);

const InfoDisplay = ({ label, value }) => (
    <div>
        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-xs font-bold text-slate-900">
            {value !== null && value !== undefined && value !== '' ? value : <span className="text-slate-400 font-normal">N/A</span>}
        </p>
    </div>
);

const CompanyInfo = ({ posTheme }) => {
    const [companyInfo, setCompanyInfo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [logoFile, setLogoFile] = useState(null);

    const [logoPreview, setLogoPreview] = useState(null);
    const [fetchedLogoUrl, setFetchedLogoUrl] = useState(null);

    const initialFormData = {
        companyName: '', address: '', city: '', emirate: '', poBox: '', country: '',
        phone: '', email: '', website: '', pan: '', tan: '', gstIn: '',
        pfRegistrationNumber: '', esiRegistrationNumber: '',
        tradeLicenseNumber: '', tradeLicenseExpiry: '', trn: '', mohreEstablishmentId: '', employerBankRoutingCode: '', visaQuotaTotal: ''
    };
    const [formData, setFormData] = useState(initialFormData);

    const fetchCompanyInfo = useCallback(() => {
        setLoading(true);
        setError('');
        api.getCompanyInfo()
            .then(data => {
                if (data && data.companyName) {
                    setCompanyInfo(data);
                    setFormData(data);
                    if (data.logoUrl) {
                        api.getLogo()
                            .then(url => {
                                setFetchedLogoUrl(url);
                                setLogoPreview(url);
                            })
                            .catch(e => console.error("Failed to fetch logo image", e));
                    }
                } else {
                    setCompanyInfo(null);
                    setFormData(initialFormData);
                }
            })
            .catch(err => {
                console.error("Error fetching company info:", err);
                setError('Failed to load company information.');
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchCompanyInfo();
    }, [fetchCompanyInfo]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            let savedData = await api.saveCompanyInfo(formData);

            if (logoFile) {
                savedData = await api.uploadLogo(logoFile);
                try {
                    const url = await api.getLogo();
                    setFetchedLogoUrl(url);
                    setLogoPreview(url);
                } catch (e) {
                    console.error("Failed to fetch newly uploaded logo", e);
                }
            }

            setCompanyInfo(savedData);
            setFormData(savedData);
            setLogoFile(null);
            setIsEditing(false);
            toast.success('Company information saved successfully!');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to save company information.';
            setError(errorMessage);
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(companyInfo || initialFormData);
        setLogoPreview(fetchedLogoUrl);
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-5 w-5 text-slate-900" /></div>;
    }

    if (isEditing) {
        return (
            <form onSubmit={handleSubmit} className="p-5 bg-white border border-slate-200 rounded-2xl text-slate-800 space-y-4 shadow-sm font-sans">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900">Edit Company Details</h3>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                        <ArrowLeft size={14} /> Back
                    </button>
                </div>

                {error && <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-xl border border-rose-200 font-semibold">{error}</div>}

                {/* Top Row: General Details Left, Compact Logo Card Top-Right */}
                <div className="flex flex-col md:flex-row gap-5 items-start justify-between">
                    <div className="flex-1 w-full space-y-3">
                        <InputField label="Company Name *" id="companyName" name="companyName" value={formData.companyName || ''} onChange={handleChange} required />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <InputField label="Email" id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
                            <InputField label="Phone" id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
                            <InputField label="Website" id="website" name="website" value={formData.website || ''} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Top Right Corner Logo Box */}
                    <div className="w-full md:w-64 p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 flex-shrink-0">
                        <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Company Logo</span>
                        <div className="flex items-center gap-3">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="h-12 w-12 object-contain rounded-xl border border-slate-200 p-1 bg-white flex-shrink-0 shadow-2xs" />
                            ) : (
                                <div className="h-12 w-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 text-[10px] font-bold flex-shrink-0">No Logo</div>
                            )}
                            <div className="flex-1 min-w-0">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full text-[10px] text-slate-500 file:mr-1.5 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <InputField label="Address" id="address" name="address" value={formData.address || ''} onChange={handleChange} className="md:col-span-3" />
                    <InputField label="City" id="city" name="city" value={formData.city || ''} onChange={handleChange} />
                    <InputField label="Emirate" id="emirate" name="emirate" value={formData.emirate || ''} onChange={handleChange} />
                    <InputField label="P.O. Box" id="poBox" name="poBox" value={formData.poBox || ''} onChange={handleChange} />
                    <InputField label="Country" id="country" name="country" value={formData.country || ''} onChange={handleChange} />
                    <InputField label="ESI Registration No." id="esiRegistrationNumber" name="esiRegistrationNumber" value={formData.esiRegistrationNumber || ''} onChange={handleChange} />

                    <div className="md:col-span-3 border-t border-slate-100 mt-2 pt-3">
                        <h4 className="text-xs font-bold text-slate-900 mb-3">UAE WPS & Statutory Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <InputField label="Trade License Number" id="tradeLicenseNumber" name="tradeLicenseNumber" value={formData.tradeLicenseNumber || ''} onChange={handleChange} />
                            <InputField label="Trade License Expiry" id="tradeLicenseExpiry" name="tradeLicenseExpiry" type="date" value={formData.tradeLicenseExpiry || ''} onChange={handleChange} />
                            <InputField label="TRN" id="trn" name="trn" value={formData.trn || ''} onChange={handleChange} />
                            <InputField label="MOHRE Establishment ID" id="mohreEstablishmentId" name="mohreEstablishmentId" value={formData.mohreEstablishmentId || ''} onChange={handleChange} />
                            <InputField label="Employer Bank Routing Code" id="employerBankRoutingCode" name="employerBankRoutingCode" value={formData.employerBankRoutingCode || ''} onChange={handleChange} />
                            <InputField label="Total Visa Quota" id="visaQuotaTotal" name="visaQuotaTotal" type="number" value={formData.visaQuotaTotal || ''} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button type="button" onClick={handleCancel} className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer" disabled={saving}>Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 flex items-center gap-1.5 cursor-pointer" style={{ backgroundColor: posTheme?.primary || '#0f172a' }} disabled={saving}>
                        {saving ? <Loader className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </button>
                </div>
            </form>
        );
    }

    if (!companyInfo) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-800 space-y-3 font-sans">
                <Building className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-900">No Company Information</h3>
                <p className="text-[11px] text-slate-500">Get started by adding your company's details.</p>
                <div className="pt-2">
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all hover:opacity-90 flex items-center mx-auto gap-1.5 cursor-pointer" style={{ backgroundColor: posTheme?.primary || '#0f172a' }}>
                        <PlusCircle size={15} /> Add Company Details
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 bg-white border border-slate-200 rounded-2xl text-slate-800 space-y-4 shadow-sm font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Company Profile</h3>
                <button onClick={() => setIsEditing(true)} className="px-3.5 py-1.5 text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer">
                    <Edit size={14} /> Edit
                </button>
            </div>
            <div className="space-y-4">
                {companyInfo.logoUrl && (
                    <Section title="Company Logo">
                        <img src={fetchedLogoUrl || constructImageUrl(companyInfo.logoUrl)} alt="Company Logo" className="h-16 w-auto object-contain rounded-xl border border-slate-200 p-1 bg-white shadow-2xs" />
                    </Section>
                )}

                <Section title="General Information" cols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    <InfoDisplay label="Company Name" value={companyInfo.companyName} />
                    <InfoDisplay label="Email" value={companyInfo.email} />
                    <InfoDisplay label="Phone" value={companyInfo.phone} />
                    <InfoDisplay label="Website" value={companyInfo.website} />
                    <InfoDisplay label="Address" value={companyInfo.address} />
                    <InfoDisplay label="City" value={companyInfo.city} />
                    <InfoDisplay label="Emirate" value={companyInfo.emirate} />
                    <InfoDisplay label="P.O. Box" value={companyInfo.poBox} />
                    <InfoDisplay label="Country" value={companyInfo.country} />
                </Section>
                <Section title="Statutory Details">
                    <InfoDisplay label="ESI Registration No." value={companyInfo.esiRegistrationNumber} />
                </Section>

                <Section title="UAE WPS & Compliance" cols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <InfoDisplay label="MOHRE Establishment ID" value={companyInfo.mohreEstablishmentId} />
                    <InfoDisplay label="Total Visa Quota" value={companyInfo.visaQuotaTotal} />
                    <InfoDisplay label="Employer Bank Routing Code" value={companyInfo.employerBankRoutingCode} />
                    <InfoDisplay label="Trade License Number" value={companyInfo.tradeLicenseNumber} />
                    <InfoDisplay label="Trade License Expiry" value={companyInfo.tradeLicenseExpiry} />
                    <InfoDisplay label="TRN" value={companyInfo.trn} />
                </Section>
            </div>
        </div>
    );
};

const Section = ({ title, children, cols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" }) => (
    <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
        <h4 className="text-[11px] font-bold mb-3 text-slate-700 uppercase tracking-wider">{title}</h4>
        <div className={`grid ${cols} gap-3.5`}>
            {children}
        </div>
    </div>
);

export default CompanyInfo;
