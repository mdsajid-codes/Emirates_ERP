import React, { createContext, useContext, useState, useCallback } from 'react';

const TenantContext = createContext(null);

/**
 * Reads the subscribed modules string from localStorage and parses it into an array.
 */
const readModulesFromStorage = () => {
    try {
        const modulesString = localStorage.getItem('modules');
        return modulesString ? modulesString.split(',') : [];
    } catch (e) {
        console.error('Failed to read tenant modules from localStorage', e);
        return [];
    }
};

/**
 * Provides information about the current tenant's subscribed modules.
 *
 * Uses useState (not useMemo) so the context can be refreshed after login
 * without requiring a full page reload. Call `refreshModules()` after writing
 * new module data to localStorage (e.g. right after a successful login).
 */
export const TenantProvider = ({ children }) => {
    const [subscribedModules, setSubscribedModules] = useState(() => readModulesFromStorage());

    /**
     * Refreshes the subscribed modules list from localStorage.
     * Call this immediately after login writes new module data to localStorage.
     */
    const refreshModules = useCallback(() => {
        setSubscribedModules(readModulesFromStorage());
    }, []);

    /**
     * Checks if the tenant has a specific module subscribed.
     * @param {string} moduleName - e.g. 'HRMS_PAYROLL'
     * @returns {boolean}
     */
    const hasModule = useCallback((moduleName) => {
        return subscribedModules.includes(moduleName);
    }, [subscribedModules]);

    const value = { subscribedModules, hasModule, refreshModules };

    return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

/**
 * Custom hook to access tenant module information.
 * Also exposes `refreshModules()` to re-read from localStorage after login.
 */
export const useTenant = () => {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
};