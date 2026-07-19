import React, { useState } from 'react';
import { Eye, Edit, Trash2, Copy, Check } from 'lucide-react';

const TenantCard = ({ tenant, onDelete, onEdit, onViewDetails }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        let host = window.location.host;
        if (host.startsWith('master.')) {
            host = host.replace('master.', '');
        }
        const loginUrl = `${window.location.protocol}//${tenant.tenantId}.${host}/login`;
        navigator.clipboard.writeText(loginUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <div className="bg-background-muted rounded-lg p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-foreground">{tenant.companyName}</h3>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${tenant.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {tenant.status.toLowerCase()}
                    </span>
                </div>
                <p className="text-sm text-foreground-muted font-mono">{tenant.tenantId}</p>
                <div className="mt-3 text-xs space-y-1 text-foreground-muted">
                    <p><span className="font-semibold">DB User:</span> {tenant.username}</p>
                    <p className="truncate"><span className="font-semibold">DB URL:</span> {tenant.jdbcUrl}</p>
                </div>
            </div>
            <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-border">
                <button onClick={handleCopyLink} className="p-2 text-foreground-muted hover:text-[#2AA2A5] hover:bg-background rounded-full transition-colors" title={`Copy Login Link for ${tenant.tenantId}`}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <button onClick={() => onViewDetails(tenant)} className="p-2 text-foreground-muted hover:text-green-500 hover:bg-background rounded-full transition-colors" title={`View ${tenant.tenantId}`}>
                    <Eye className="h-4 w-4" />
                </button>
                <button onClick={() => onEdit(tenant)} className="p-2 text-foreground-muted hover:text-blue-500 hover:bg-background rounded-full transition-colors" title={`Edit ${tenant.tenantId}`}>
                    <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => onDelete(tenant.tenantId)} className="p-2 text-foreground-muted hover:text-red-500 hover:bg-background rounded-full transition-colors" title={`Delete ${tenant.tenantId}`}>
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default TenantCard;
