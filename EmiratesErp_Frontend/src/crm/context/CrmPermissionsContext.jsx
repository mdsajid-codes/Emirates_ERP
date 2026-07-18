import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CrmPermissionsContext = createContext(null);

export const CrmPermissionsProvider = ({ children }) => {
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchPermissions = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`${API_URL}/crm/roles/my-permissions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPermissions(res.data.permissions);
        } catch (err) {
            console.error("Failed to fetch CRM permissions:", err);
            setPermissions({});
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    // Helper to check permission
    const hasPermission = (module, action) => {
        if (!permissions) return false;
        const modPerms = permissions[module];
        if (!modPerms) return false;
        
        if (!modPerms.canView && action !== 'view') return false; // If can't view, can't do anything else
        
        switch (action.toLowerCase()) {
            case 'view': return modPerms.canView;
            case 'create': return modPerms.canCreate;
            case 'update': return modPerms.canUpdate;
            case 'delete': return modPerms.canDelete;
            case 'export': return modPerms.canExport;
            case 'import': return modPerms.canImport;
            case 'changeowner': return modPerms.canChangeOwner;
            case 'sendemail': return modPerms.canSendEmail;
            default: return false;
        }
    };

    const value = {
        permissions,
        loading,
        hasPermission,
        refreshPermissions: fetchPermissions
    };

    return (
        <CrmPermissionsContext.Provider value={value}>
            {children}
        </CrmPermissionsContext.Provider>
    );
};

export const useCrmPermissions = () => {
    const context = useContext(CrmPermissionsContext);
    if (!context) {
        throw new Error('useCrmPermissions must be used within a CrmPermissionsProvider');
    }
    return context;
};
