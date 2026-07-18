import React, { useState, useEffect } from 'react';
import { X, Loader, Check } from 'lucide-react';
import InputField from '../components/InputField';
import { serviceModulesOptions, adminRoleOptions } from '../constants';

const UpdateTenantModal = ({ isOpen, onClose, onUpdate, tenant, isLoading, inline = false }) => {
    const [selectedModules, setSelectedModules] = useState([]);
    const [formData, setFormData] = useState({});
    const [adminRoles, setAdminRoles] = useState(new Set());
    const [error, setError] = useState('');

    useEffect(() => {
        if (tenant) {
            setSelectedModules(tenant.serviceModules || []);
            setFormData({
                companyName: tenant.companyName || '',
                numberOfLocations: tenant.numberOfLocations || 1,
                numberOfUsers: tenant.numberOfUsers || 5,
                numberOfStore: tenant.numberOfStore || 1,
                hrmsAccessCount: tenant.hrmsAccessCount || 5,
                subscriptionStartDate: tenant.subscriptionStartDate ? new Date(tenant.subscriptionStartDate).toISOString().split('T')[0] : '',
                subscriptionEndDate: tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toISOString().split('T')[0] : '',
            });
            // Assuming we fetch or know the current admin roles. For now, we'll default based on modules.
            setAdminRoles(new Set(tenant.adminRoles || []));
        }
    }, [tenant]);

    const handleModuleChange = (e) => {
        const { value, checked } = e.target;
        setSelectedModules(prev => checked ? [...prev, value] : prev.filter(m => m !== value));
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAdminRoleChange = (e) => {
        const { value, checked } = e.target;
        setAdminRoles(prev => {
            const newRoles = new Set(prev);
            if (checked) newRoles.add(value);
            else newRoles.delete(value);
            return newRoles;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const payload = {
            details: formData,
            serviceModules: selectedModules,
            adminRoles: Array.from(adminRoles),
        };

        try {
            await onUpdate(tenant.tenantId, payload.details, { serviceModules: payload.serviceModules, adminRoles: payload.adminRoles });
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred during the update.');
        }
    };

    if (!isOpen && !inline) return null;
    if (!tenant) return null;

    const Container = inline ? 'div' : 'div';
    const containerClass = inline
        ? "w-full h-full flex flex-col bg-card text-card-foreground rounded-xl border border-border overflow-hidden"
        : "fixed inset-0 bg-background z-50 flex justify-center items-center";

    const InnerClass = inline
        ? "w-full h-full flex flex-col"
        : "bg-card text-card-foreground w-full h-full flex flex-col";

    return (
        <Container className={containerClass}>
            <div className={InnerClass}>
                <div className="p-4 border-b border-border flex justify-between items-center bg-card shadow-sm shrink-0">
                    <h3 className="text-xl font-semibold text-foreground">Update Tenant: {tenant.tenantId}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-background-muted transition-colors"><X className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 space-y-6 overflow-y-auto flex-1 max-w-7xl mx-auto w-full">
                        <h4 className="text-md font-semibold text-foreground-muted border-b border-border pb-2">Tenant Details</h4>
                        <InputField label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} required />

                        <h4 className="text-md font-semibold text-foreground-muted border-b border-border pb-2 pt-4">Subscription Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Number of Locations" name="numberOfLocations" type="number" value={formData.numberOfLocations} onChange={handleChange} required min="1" />
                            <InputField label="Number of Users" name="numberOfUsers" type="number" value={formData.numberOfUsers} onChange={handleChange} required min="1" />
                            <InputField label="Number of Stores" name="numberOfStore" type="number" value={formData.numberOfStore} onChange={handleChange} required min="1" />
                            <InputField label="HRMS Access Count" name="hrmsAccessCount" type="number" value={formData.hrmsAccessCount} onChange={handleChange} required min="1" />
                            <InputField label="Subscription Start Date" name="subscriptionStartDate" type="date" value={formData.subscriptionStartDate} onChange={handleChange} required />
                            <InputField label="Subscription End Date" name="subscriptionEndDate" type="date" value={formData.subscriptionEndDate} onChange={handleChange} required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                            <div>
                                <h4 className="text-md font-semibold text-foreground-muted pb-2">Service Modules</h4>
                                <div className="mt-2 space-y-2">
                                    {serviceModulesOptions.map(module => (
                                        <label key={module.value} className="flex items-center gap-2 cursor-pointer hover:bg-background-muted p-1 rounded">
                                            <input
                                                type="checkbox"
                                                value={module.value}
                                                checked={selectedModules.includes(module.value)}
                                                onChange={handleModuleChange}
                                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                            />
                                            <span>{module.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-md font-semibold text-foreground-muted pb-2">Admin Roles</h4>
                                <div className="mt-2 space-y-2">
                                    {adminRoleOptions.map(role => (
                                        <label key={role.value} className="flex items-center gap-2 cursor-pointer hover:bg-background-muted p-1 rounded">
                                            <input
                                                type="checkbox"
                                                value={role.value}
                                                checked={adminRoles.has(role.value)}
                                                onChange={handleAdminRoleChange}
                                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                            />
                                            <span>{role.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    </div>

                    <div className="p-4 bg-background border-t border-border flex justify-end gap-3 shrink-0">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={isLoading}>
                            {isLoading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Check className="h-4 w-4 mr-2" />} Update Tenant
                        </button>
                    </div>

                </form>
            </div>
        </Container>
    );
};

export default UpdateTenantModal;
