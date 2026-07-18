
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Sparkles, Building, Users, Activity, Server, LogOut } from 'lucide-react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';

import ProvisionTenant from './ProvisionTenant';
import MasterHeader from './master/components/MasterHeader';
import MasterSidebar from './master/components/MasterSidebar';
import TenantCompany from './master/views/TenantCompany';
import TenantInvoiceView from './master/views/TenantInvoiceView';
import UpdateTenantModal from './master/modals/UpdateTenantModal';
import TenantDetailsModal from './master/modals/TenantDetailsModal';
import DashboardView from './master/views/DashboardView';
import TenantsView from './master/views/TenantsView';
import RequestsView from './master/views/RequestsView';
import MasterUsers from './master/views/MasterUsers';
import MyCompanyInfo from './master/views/MyCompanyInfo';

const MasterAdmin = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tenants, setTenants] = useState([]);
    const [tenantRequests, setTenantRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);

    // Provisioning state
    const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
    const [provisionFormData, setProvisionFormData] = useState(null);

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [viewingTenant, setViewingTenant] = useState(null);
    const [editingTenant, setEditingTenant] = useState(null);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const themes = ['light', 'dark', 'greenish', 'blueish'];
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const root = document.documentElement;
        themes.forEach(t => root.classList.remove(t));
        if (theme !== 'light') {
            root.classList.add(theme);
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const cycleTheme = () => {
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    // Stats data
    const stats = useMemo(() => [
        { title: 'Active Tenants', value: tenants.length, icon: Building, change: '+2 this month', changeType: 'increase' },
        { title: 'Total Users', value: '1,420', icon: Users, change: '+5.1%', changeType: 'increase' },
        { title: 'Pending Requests', value: tenantRequests.length, icon: Activity, change: 'Needs review', changeType: 'decrease' },
        { title: 'System Status', value: 'Operational', icon: Server, change: 'All systems normal', changeType: 'increase' },
    ], [tenants.length, tenantRequests.length]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };

            const [tenantsRes, requestsRes] = await Promise.all([
                axios.get(`${API_URL}/master/tenants`, { headers }),
                axios.get(`${API_URL}/master/tenant-requests`, { headers })
            ]);

            setTenants(tenantsRes.data);
            setTenantRequests(requestsRes.data);
        } catch (err) {
            setError('Failed to fetch data. Please try again later.');
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [API_URL]);

    const handleDelete = async (tenantId) => {
        if (!window.confirm(`Are you sure you want to delete tenant "${tenantId}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/master/tenants/${tenantId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setTenants(prevTenants => prevTenants.filter(tenant => tenant.tenantId !== tenantId));
        } catch (err) {
            setError(`Failed to delete tenant "${tenantId}". Please try again.`);
            console.error("Error deleting tenant:", err);
        }
    };

    const setFormDataForProvision = (request) => {
        setProvisionFormData({
            tenantId: request.tenantId,
            companyName: request.companyName,
            adminEmail: request.adminEmail,
            adminPassword: request.adminPassword,
            numberOfLocations: 1,
            numberOfUsers: 5,
            numberOfStore: 1,
            hrmsAccessCount: 5,
            subscriptionStartDate: new Date().toISOString().split('T')[0],
            subscriptionEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        });
    };

    const handleApprove = async (request) => {
        if (!window.confirm(`Are you sure you want to approve and create tenant "${request.tenantId}"?`)) {
            return;
        }
        setFormDataForProvision(request);
        // Assuming we want to switch to provision view with this data
        setActiveView('provision');
    };

    const handleReject = async (requestId, tenantId) => {
        if (!window.confirm(`Are you sure you want to reject the request for tenant "${tenantId}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/master/tenant-requests/${requestId}`, { headers: { "Authorization": `Bearer ${token}` } });
            setTenantRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (err) {
            setError(`Failed to reject tenant request for "${tenantId}". Please try again.`);
            console.error("Error rejecting tenant request:", err);
        }
    };

    const handleProvision = async (payload) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/master/tenants/provision`, payload, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            alert(`Tenant "${payload.tenantId}" has been provisioned successfully!`);
            // If this provision came from a request, find and delete the request
            const approvedRequest = tenantRequests.find(r => r.tenantId === payload.tenantId);
            if (approvedRequest) {
                await axios.delete(`${API_URL}/master/tenant-requests/${approvedRequest.id}`, { headers: { "Authorization": `Bearer ${token}` } });
            }
            fetchData(); // Refresh data after provisioning
            setActiveView('tenants');
            setProvisionFormData(null);
        } catch (err) {
            console.error('Tenant provisioning failed:', err);
            const errorMessage = err.response?.data?.message || `Failed to provision tenant. The ID "${payload.tenantId}" might already be taken.`;
            throw new Error(errorMessage);
        }
    };

    const handleUpdate = async (tenantId, detailsPayload, servicesPayload) => {
        setModalLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };

            const updatePromises = [];
            // 2. Update service modules and admin roles
            updatePromises.push(axios.put(`${API_URL}/master/tenants/${tenantId}/services`, servicesPayload, { headers }));

            await Promise.all(updatePromises);
            fetchData(); // Refresh to show updates
        } catch (err) {
            console.error('Tenant update failed:', err);
            const errorMessage = err.response?.data?.message || `Failed to update tenant.`;
            throw new Error(errorMessage);
        } finally {
            setModalLoading(false);
        }
    };

    const handleOpenUpdateModal = (tenant) => {
        setEditingTenant(tenant);
        setActiveView('edit-tenant');
        // setIsUpdateModalOpen(true); // Deprecated for modal
    };

    const handleViewDetails = (tenant) => {
        setViewingTenant(tenant);
        setIsDetailsModalOpen(true);
    };

    const handleEditFromDetails = (tenant) => {
        setIsDetailsModalOpen(false);
        handleOpenUpdateModal(tenant);
    };

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardView stats={stats} loading={loading} error={error} />;
            case 'tenants':
                return <TenantsView tenants={tenants} loading={loading} error={error} onDelete={handleDelete} onEdit={handleOpenUpdateModal} onProvisionClick={() => { setProvisionFormData(null); setActiveView('provision'); }} onViewDetails={handleViewDetails} />;
            case 'requests':
                return <RequestsView requests={tenantRequests} loading={loading} error={error} onApprove={handleApprove} onReject={handleReject} />;
            case 'users':
                return <MasterUsers />;
            case 'provision':
                // Passing provisionFormData as initialData if ProvisionTenant supports it, or we might need to modify ProvisionTenant
                // Since I cannot modify ProvisionTenant easily without reading it, I will assume it might not support it yet.
                // However, I've created the state.
                return <ProvisionTenant initialData={provisionFormData} onProvision={handleProvision} onCancel={() => setActiveView('tenants')} />;
            case 'edit-tenant':
                return (
                    <UpdateTenantModal
                        isOpen={true}
                        tenant={editingTenant}
                        onClose={() => setActiveView('tenants')}
                        onUpdate={handleUpdate}
                        isLoading={modalLoading}
                        inline={true}
                    />
                );
            case 'company-info':
                return <MyCompanyInfo />;
            case 'tenant-company':
                return <TenantCompany tenants={tenants} loadingTenants={loading} />;
            case 'tenant-invoice':
                return <TenantInvoiceView tenants={tenants} loadingTenants={loading} />;
            default:
                return <DashboardView stats={stats} loading={loading} error={error} />;
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const username = localStorage.getItem('username') || 'Master Admin';

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden h-screen">
            {/* Global Header */}
            <MasterHeader
                onMenuClick={() => setSidebarOpen(true)}
                onLogout={handleLogout}
                username={username}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Static sidebar for desktop */}
                <div className="hidden lg:flex lg:flex-shrink-0">
                    <div className="flex flex-col w-64 border-r border-border">
                        <MasterSidebar activeView={activeView} setActiveView={setActiveView} theme={theme} cycleTheme={cycleTheme} />
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Main content */}
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
                        <div className="w-full">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile menu overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed top-0 left-0 h-full w-64 z-30"
                        >
                            <MasterSidebar activeView={activeView} setActiveView={setActiveView} onLinkClick={() => setSidebarOpen(false)} theme={theme} cycleTheme={cycleTheme} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <UpdateTenantModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} onUpdate={handleUpdate} tenant={editingTenant} isLoading={modalLoading} />
            <TenantDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} tenant={viewingTenant} onEditClick={handleEditFromDetails} />
        </div>

    );
}

export default MasterAdmin;
