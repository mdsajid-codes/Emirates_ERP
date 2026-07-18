import React from 'react';
import { X, Building, Hash, MapPin, Users, Store, Calendar, Activity, Server, Edit } from 'lucide-react';

const TenantDetailsModal = ({ isOpen, onClose, tenant, onEditClick }) => {
    if (!isOpen || !tenant) return null;

    const DetailItem = ({ icon: Icon, label, value, isDate = false }) => (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-foreground-muted mt-0.5" />
            <div>
                <p className="text-sm text-foreground-muted">{label}</p>
                <p className="font-medium text-foreground">
                    {isDate && value ? new Date(value).toLocaleDateString() : (value ?? 'N/A')}
                </p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold">{tenant.companyName}</h3>
                        <p className="text-sm text-foreground-muted">{tenant.tenantId}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-background-muted"><X size={20} /></button>
                </div>
                <div className="p-6 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailItem icon={Building} label="Company Name" value={tenant.companyName} />
                        <DetailItem icon={Hash} label="Tenant ID" value={tenant.tenantId} />
                        <DetailItem icon={MapPin} label="Locations Allowed" value={tenant.numberOfLocations} />
                        <DetailItem icon={Users} label="Users Allowed" value={tenant.numberOfUsers} />
                        <DetailItem icon={Store} label="Stores Allowed" value={tenant.numberOfStore} />
                        <DetailItem icon={Users} label="HRMS Access Count" value={tenant.hrmsAccessCount} />
                        <DetailItem icon={Calendar} label="Subscription Start" value={tenant.subscriptionStartDate} isDate />
                        <DetailItem icon={Calendar} label="Subscription End" value={tenant.subscriptionEndDate} isDate />
                        <div className="md:col-span-2">
                            <DetailItem icon={Activity} label="Status" value={tenant.status} />
                        </div>
                        <div className="md:col-span-2">
                            <DetailItem icon={Server} label="JDBC URL" value={tenant.jdbcUrl} />
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-border bg-background-muted flex justify-end">
                    <button onClick={() => onEditClick(tenant)} className="btn-secondary flex items-center gap-2">
                        <Edit size={16} />
                        Edit Tenant
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TenantDetailsModal;
