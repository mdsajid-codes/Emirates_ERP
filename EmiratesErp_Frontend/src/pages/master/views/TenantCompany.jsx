import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building, Search, Loader } from 'lucide-react';
import TenantCompanyForm from '../components/TenantCompanyForm';
import TenantCompanyProfileView from '../components/TenantCompanyProfileView';

const TenantCompany = ({ tenants, loadingTenants }) => {
    const [selectedTenantId, setSelectedTenantId] = useState('');
    const [companyInfo, setCompanyInfo] = useState(null);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    // Filter tenants for the dropdown/search
    const filteredTenants = tenants?.filter(t =>
        t.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tenantId.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    useEffect(() => {
        if (selectedTenantId) {
            fetchCompanyInfo(selectedTenantId);
        } else {
            setCompanyInfo(null);
        }
    }, [selectedTenantId]);

    const fetchCompanyInfo = async (masterTenantId) => {
        setLoadingInfo(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/master/tenant-company-info/${masterTenantId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setCompanyInfo(response.data);
            setIsEditing(false);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                // No info found, which is fine, we'll show empty form to create
                setCompanyInfo(null);
                setIsEditing(true); // Default to edit mode if no info to show profile
            } else {
                console.error("Failed to fetch tenant company info", err);
            }
        } finally {
            setLoadingInfo(false);
        }
    };

    const handleSaveSuccess = (data) => {
        setCompanyInfo(data);
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Tenant Company Information</h1>
                    <p className="text-foreground-muted">Manage detailed company profiles for your tenants.</p>
                </div>

                {/* Tenant Selection */}
                <div className="w-full md:w-80 relative">
                    <label className="block text-xs font-medium text-foreground-muted mb-1">Select Tenant</label>
                    <div className="relative">
                        <select
                            className="input w-full pr-8 appearance-none bg-background-muted border-border"
                            value={selectedTenantId}
                            onChange={(e) => setSelectedTenantId(e.target.value)}
                            disabled={loadingTenants}
                        >
                            <option value="">-- Select a Tenant --</option>
                            {tenants.map(tenant => (
                                <option key={tenant.id} value={tenant.id}>
                                    {tenant.companyName} ({tenant.tenantId})
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-muted">
                            <Building size={16} />
                        </div>
                    </div>
                </div>
            </div>

            {loadingTenants ? (
                <div className="flex justify-center py-20">
                    <Loader className="animate-spin text-primary h-8 w-8" />
                </div>
            ) : !selectedTenantId ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed border-border text-foreground-muted">
                    <Building className="h-16 w-16 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No Tenant Selected</h3>
                    <p>Please select a tenant from the dropdown above to manage their company information.</p>
                </div>
            ) : loadingInfo ? (
                <div className="flex justify-center py-20">
                    <Loader className="animate-spin text-primary h-8 w-8" />
                </div>
            ) : companyInfo && !isEditing ? (
                <TenantCompanyProfileView
                    companyInfo={companyInfo}
                    onEdit={() => setIsEditing(true)}
                />
            ) : (
                <TenantCompanyForm
                    masterTenantId={selectedTenantId}
                    initialData={companyInfo}
                    onSave={handleSaveSuccess}
                    onCancel={() => {
                        if (companyInfo) setIsEditing(false);
                    }}
                />
            )}
        </div>
    );
};

export default TenantCompany;
