import React, { useState, useMemo } from 'react';
import { Search, PlusCircle, Loader } from 'lucide-react';
import TenantList from '../components/TenantList';

const TenantsView = ({ tenants, loading, error, onDelete, onEdit, onProvisionClick, onViewDetails }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTenants = useMemo(() => {
        if (!searchTerm) return tenants;
        const lowercasedFilter = searchTerm.toLowerCase();
        return tenants.filter(tenant =>
            tenant.companyName.toLowerCase().includes(lowercasedFilter) ||
            tenant.tenantId.toLowerCase().includes(lowercasedFilter)
        );
    }, [tenants, searchTerm]);

    return (
        <>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-foreground">Registered Tenants</h1>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input w-full sm:w-64 pr-10 bg-background-muted border-border" />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    </div>
                    <button onClick={onProvisionClick} className="btn-primary flex items-center gap-2"><PlusCircle size={18} /> New Tenant</button>
                </div>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm">
                {loading ? <div className="flex justify-center items-center h-40"><Loader className="h-8 w-8 animate-spin text-primary" /></div> : error ? <p className="text-red-500 text-center">{error}</p> : <TenantList tenants={filteredTenants} onDelete={onDelete} onEdit={onEdit} onViewDetails={onViewDetails} />}
            </div>
        </>
    );
};

export default TenantsView;
