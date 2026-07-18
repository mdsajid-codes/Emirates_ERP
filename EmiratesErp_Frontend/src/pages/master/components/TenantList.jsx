import React from 'react';
import { Search } from 'lucide-react';
import TenantCard from './TenantCard';

const TenantList = ({ tenants, onDelete, onEdit, onViewDetails }) => {
    if (tenants.length === 0) {
        return (
            <div className="text-center py-16 text-foreground-muted">
                <Search className="mx-auto h-12 w-12 text-foreground-muted/50" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No Tenants Found</h3>
                <p className="mt-1 text-sm">No tenants match your search criteria.</p>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tenants.map(tenant => (
                <TenantCard key={tenant.id} tenant={tenant} onDelete={onDelete} onEdit={onEdit} onViewDetails={onViewDetails} />
            ))}
        </div>
    );
};

export default TenantList;
