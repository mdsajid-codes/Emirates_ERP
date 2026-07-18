import React, { useState, useEffect } from 'react';
import { Upload, X, Save, Loader, AlertCircle } from 'lucide-react';
import SecureImage from './SecureImage';
import InputField from './InputField';
import axios from 'axios';

const TenantCompanyForm = ({ masterTenantId, initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        phone: '',
        email: '',
        website: '',
        taxId: '',
        registrationNumber: '',
        emirate: '',
        poBox: '',
        tradeLicenseNumber: '',
        tradeLicenseExpiry: '',
        trn: '',
        mohreEstablishmentId: '',
        visaQuotaTotal: '',
        employerBankRoutingCode: ''
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (initialData) {
            setFormData({
                companyName: initialData.companyName || '',
                address: initialData.address || '',
                city: initialData.city || '',
                state: initialData.state || '',
                country: initialData.country || '',
                zipCode: initialData.zipCode || '',
                phone: initialData.phone || '',
                email: initialData.email || '',
                website: initialData.website || '',
                taxId: initialData.taxId || '',
                registrationNumber: initialData.registrationNumber || '',
                emirate: initialData.emirate || '',
                poBox: initialData.poBox || '',
                tradeLicenseNumber: initialData.tradeLicenseNumber || '',
                tradeLicenseExpiry: initialData.tradeLicenseExpiry || '',
                trn: initialData.trn || '',
                mohreEstablishmentId: initialData.mohreEstablishmentId || '',
                visaQuotaTotal: initialData.visaQuotaTotal || '',
                employerBankRoutingCode: initialData.employerBankRoutingCode || ''
            });

            if (initialData.logoUrl) {
                // If it's a full URL (external), display it. If it's a filename, construct the secure endpoint path helper
                // Helper to construct the securely loadable URL is needed if SecureImage expects a full URL or just a filename.
                // Looking at SecureImage usage, it takes 'src' which can be an endpoint.
                // In CompanyProfileView it was: `${API_URL}/master/company-info/images/${filename}`
                // Here the endpoint is different: `/api/master/tenant-company-info/images/{fileName}`

                const url = initialData.logoUrl.startsWith('http')
                    ? initialData.logoUrl
                    : `${API_URL}/master/tenant-company-info/images/${initialData.logoUrl.split(/[/\\]/).pop()}`;
                setLogoPreview(url);
            } else {
                setLogoPreview(null);
            }
        } else {
            // Reset if no data
            setFormData({
                companyName: '', address: '', city: '', state: '', country: '', zipCode: '', phone: '', email: '',
                website: '', taxId: '', registrationNumber: '', emirate: '', poBox: '', tradeLicenseNumber: '',
                tradeLicenseExpiry: '', trn: '', mohreEstablishmentId: '', visaQuotaTotal: '', employerBankRoutingCode: ''
            });
            setLogoPreview(null);
            setLogoFile(null);
        }
    }, [initialData, API_URL]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key] || '');
            });
            if (logoFile) {
                data.append('logoImage', logoFile);
            }

            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/master/tenant-company-info/${masterTenantId}`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setSuccess('Company information saved successfully!');
            if (onSave) onSave(response.data);

            // Update initialData-like state behavior if needed, or just rely on parent re-fetch.
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save company information.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">

            {/* Header & Logo */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="space-y-3">
                    <span className="block text-sm font-medium text-foreground-muted">Company Logo</span>
                    <div className="relative h-32 w-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-background-muted group hover:border-primary transition-colors">
                        {logoPreview ? (
                            <div className="relative w-full h-full">
                                {logoFile ? (
                                    <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-contain" />
                                ) : (
                                    <SecureImage src={logoPreview} alt="Logo" className="h-full w-full object-contain" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button type="button" onClick={handleRemoveLogo} className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-foreground-muted hover:text-primary">
                                <Upload size={24} className="mb-1" />
                                <span className="text-xs">Upload</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>
                </div>

                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} required className="md:col-span-2" />
                    <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} type="tel" />
                    <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
                    <InputField label="Website" name="website" value={formData.website} onChange={handleChange} className="md:col-span-2" />
                </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
                    Address Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InputField label="Street Address" name="address" value={formData.address} onChange={handleChange} className="md:col-span-2" />
                    <InputField label="City" name="city" value={formData.city} onChange={handleChange} />
                    <InputField label="State" name="state" value={formData.state} onChange={handleChange} />
                    <InputField label="Country" name="country" value={formData.country} onChange={handleChange} />
                    <InputField label="Zip Code" name="zipCode" value={formData.zipCode} onChange={handleChange} />
                </div>
            </div>

            {/* Statutory */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
                    Statutory & Legal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Tax ID" name="taxId" value={formData.taxId} onChange={handleChange} />
                    <InputField label="Registration Number" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} />
                </div>
            </div>

            {/* UAE Specifics */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2 text-primary">
                    UAE Specific Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Emirate" name="emirate" value={formData.emirate} onChange={handleChange} />
                    <InputField label="PO Box" name="poBox" value={formData.poBox} onChange={handleChange} />
                    <InputField label="TRN" name="trn" value={formData.trn} onChange={handleChange} />
                    <InputField label="Trade License No." name="tradeLicenseNumber" value={formData.tradeLicenseNumber} onChange={handleChange} />
                    <InputField label="License Expiry" name="tradeLicenseExpiry" type="date" value={formData.tradeLicenseExpiry} onChange={handleChange} />
                    <InputField label="MOHRE Est. ID" name="mohreEstablishmentId" value={formData.mohreEstablishmentId} onChange={handleChange} />
                    <InputField label="Visa Quota Total" name="visaQuotaTotal" type="number" value={formData.visaQuotaTotal} onChange={handleChange} />
                    <InputField label="Bank Routing Code" name="employerBankRoutingCode" value={formData.employerBankRoutingCode} onChange={handleChange} />
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded flex items-center gap-2">
                    <Save size={18} />
                    <span>{success}</span>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                {/* <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button> */}
                <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
                    {loading ? <Loader className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                    Save Company Info
                </button>
            </div>
        </form>
    );
};

export default TenantCompanyForm;
