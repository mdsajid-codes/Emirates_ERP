import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, ArrowLeft } from 'lucide-react';
import MyCompanyInfoForm from '../components/MyCompanyInfoForm';
import CompanyProfileView from '../components/CompanyProfileView';

const MyCompanyInfo = () => {
    const [companyInfo, setCompanyInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchCompanyInfo = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/master/company-info`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.data) {
                const processUrl = (url) => {
                    if (!url) return null;
                    if (url.startsWith('http')) return url;
                    const filename = url.split(/[/\\]/).pop();
                    return `${API_URL}/master/company-info/images/${filename}`;
                };

                const data = {
                    ...response.data,
                    logoUrl: processUrl(response.data.logoUrl),
                    signatureUrl: processUrl(response.data.signatureUrl),
                    stampUrl: processUrl(response.data.stampUrl),
                    invoiceHeaderUrl: processUrl(response.data.invoiceHeaderUrl),
                    invoiceFooterUrl: processUrl(response.data.invoiceFooterUrl),
                    watermarkUrl: processUrl(response.data.watermarkUrl),
                };
                setCompanyInfo(data);

                setIsEditing(false); // Always default to view mode, as profile view handles empty state now
            } else {
                setCompanyInfo(null);
                setIsEditing(false);
            }
        } catch (err) {
            console.error(err);
            if (err.response && (err.response.status === 404 || err.response.status === 403)) {
                setCompanyInfo(null);
                setIsEditing(false);
            } else {
                setError('Failed to fetch company info.');
                setIsEditing(false);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanyInfo();
    }, [API_URL]);

    const handleSave = async (formData) => {
        setSaving(true);
        setError('');
        setSuccessMessage('');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/master/company-info`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            setSuccessMessage('Company information saved successfully!');
            await fetchCompanyInfo();
            setIsEditing(false); // Switch back to view mode on success
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save company info.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-foreground">My Company Configuration</h1>
                {isEditing && companyInfo && companyInfo.id && (
                    <button onClick={() => setIsEditing(false)} className="btn-secondary flex items-center gap-2">
                        <ArrowLeft size={16} /> Cancel
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded relative mb-4">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-3 rounded relative mb-4">
                    <strong className="font-bold">Success: </strong>
                    <span className="block sm:inline">{successMessage}</span>
                </div>
            )}

            {isEditing ? (
                <MyCompanyInfoForm initialData={companyInfo} onSave={handleSave} isLoading={saving} />
            ) : (
                <CompanyProfileView data={companyInfo} onEdit={() => setIsEditing(true)} />
            )}
        </div>
    );
};

export default MyCompanyInfo;
