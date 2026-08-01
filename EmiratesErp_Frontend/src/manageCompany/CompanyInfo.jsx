import React, { useState, useEffect, useCallback } from 'react';
import { Building, Edit, PlusCircle, Loader, Save } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const constructImageUrl = (relativeUrl) => {
    if (!relativeUrl) return '';
    if (relativeUrl.startsWith('data:') || relativeUrl.startsWith('http')) return relativeUrl;

    // Backend returns paths relative to the uploads root (e.g., "tenantId/folder/file.ext")
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
        // The backend uses POST for both create and update.
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
        <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
        <input id={id} {...props} className="w-full px-3 py-2 bg-slate-50 border-0 rounded-xl font-medium text-xs focus:ring-2 focus:ring-slate-900 outline-none transition-all" />
    </div>
);

const InfoDisplay = ({ label, value }) => (
    <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="font-bold text-slate-900 text-xs">
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
        return <div className="flex justify-center items-center p-12"><Loader className="animate-spin h-6 w-6 text-slate-900" /></div>;
    }

    if (isEditing) {
        return (
            <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200/60 space-y-6 font-sans text-xs">
                {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">{error}</div>}

                {/* Top Banner: Title on Left, Logo & Upload on Top-Right */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Edit Company Profile</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Update organization details, statutory IDs, and logo branding.</p>
                    </div>

                    {/* Top-Right Logo & Upload Button */}
                    <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60 flex-shrink-0">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="h-14 w-14 object-contain rounded-xl border bg-white p-1" />
                        ) : (
                            <div className="h-14 w-14 flex items-center justify-center bg-slate-200/60 rounded-xl text-slate-400 font-bold text-[10px]">No Logo</div>
                        )}
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Company Logo</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-slate-900 file:text-white hover:file:opacity-90 cursor-pointer" 
                            />
                        </div>
                    </div>
                </div>

                {/* Top Section: Exactly 5 Fields per Row */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">General Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                        <InputField label="Company Name *" id="companyName" name="companyName" value={formData.companyName || ''} onChange={handleChange} required />
                        <InputField label="Contact Email" id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
                        <InputField label="Contact Phone" id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
                        <InputField label="Website" id="website" name="website" value={formData.website || ''} onChange={handleChange} />
                        <InputField label="Address" id="address" name="address" value={formData.address || ''} onChange={handleChange} />
                        <InputField label="City" id="city" name="city" value={formData.city || ''} onChange={handleChange} />
                        <InputField label="Emirate" id="emirate" name="emirate" value={formData.emirate || ''} onChange={handleChange} />
                        <InputField label="P.O. Box" id="poBox" name="poBox" value={formData.poBox || ''} onChange={handleChange} />
                        <InputField label="Country" id="country" name="country" value={formData.country || ''} onChange={handleChange} />
                        <InputField label="ESI Registration No." id="esiRegistrationNumber" name="esiRegistrationNumber" value={formData.esiRegistrationNumber || ''} onChange={handleChange} />
                    </div>
                </div>

                {/* Bottom Section: 3 Fields per Row */}
                <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">UAE WPS & Compliance Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                        <InputField label="MOHRE Establishment ID" id="mohreEstablishmentId" name="mohreEstablishmentId" value={formData.mohreEstablishmentId || ''} onChange={handleChange} />
                        <InputField label="Employer Bank Routing Code (Agent ID)" id="employerBankRoutingCode" name="employerBankRoutingCode" value={formData.employerBankRoutingCode || ''} onChange={handleChange} />
                        <InputField label="Total Visa Quota" id="visaQuotaTotal" name="visaQuotaTotal" type="number" value={formData.visaQuotaTotal ?? ''} onChange={handleChange} />
                        <InputField label="Trade License Number" id="tradeLicenseNumber" name="tradeLicenseNumber" value={formData.tradeLicenseNumber || ''} onChange={handleChange} />
                        <InputField label="Trade License Expiry" id="tradeLicenseExpiry" name="tradeLicenseExpiry" type="date" value={formData.tradeLicenseExpiry || ''} onChange={handleChange} />
                        <InputField label="TRN (Tax Registration No.)" id="trn" name="trn" value={formData.trn || ''} onChange={handleChange} />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                    <button type="button" onClick={handleCancel} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer" disabled={saving}>Cancel</button>
                    <button 
                        type="submit" 
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 flex items-center gap-2 cursor-pointer" 
                        style={{ backgroundColor: posTheme?.primary || '#0f172a' }}
                        disabled={saving}
                    >
                        {saving ? <Loader className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                        {saving ? 'Saving...' : 'Save Company Details'}
                    </button>
                </div>
            </form>
        );
    }

    if (!companyInfo) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-200 p-8 space-y-3 font-sans">
                <Building className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="text-base font-bold text-slate-900">No Company Information</h3>
                <p className="text-xs text-slate-500">Get started by setting up your enterprise profile and statutory details.</p>
                <div className="pt-2">
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer"
                        style={{ backgroundColor: posTheme?.primary || '#0f172a' }}
                    >
                        <PlusCircle size={16} /> Add Company Details
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200/60 space-y-6 font-sans">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Company Profile</h3>
                    <p className="text-xs text-slate-500">Registered organization credentials and compliance records.</p>
                </div>
                <button 
                    onClick={() => setIsEditing(true)} 
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
                >
                    <Edit size={15} /> Edit Profile
                </button>
            </div>

            <div className="space-y-6">
                {companyInfo.logoUrl && (
                    <Section title="Company Logo" cols="grid-cols-1">
                        <img src={fetchedLogoUrl || constructImageUrl(companyInfo.logoUrl)} alt="Company Logo" className="h-20 w-auto object-contain rounded-xl border bg-white p-2" />
                    </Section>
                )}
                
                {/* 5 Columns for General Information */}
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
                    <InfoDisplay label="ESI Registration No." value={companyInfo.esiRegistrationNumber} />
                </Section>

                {/* 3 Columns for UAE WPS & Compliance */}
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

const Section = ({ title, children, cols = "grid-cols-1 md:grid-cols-3" }) => (
    <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200/60 pb-1.5">{title}</h4>
        <div className={`grid ${cols} gap-3.5`}>
            {children}
        </div>
    </div>
);

export default CompanyInfo;
