import React from 'react';
import { ExternalLink } from 'lucide-react';

const AtsVendorOverviewTab = ({ vendor }) => {
    if (!vendor) return null;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-base font-bold text-foreground border-b border-border pb-2">Business Snapshot</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div>
                        <span className="text-xs text-foreground-muted block font-semibold uppercase">Email</span>
                        <span className="text-sm text-foreground font-semibold mt-1 block">{vendor.primaryEmail}</span>
                        <span className="text-xs text-foreground-muted mt-0.5 block">{vendor.alternateEmail || 'No alternate email'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-foreground-muted block font-semibold uppercase">Phones & Comm</span>
                        <span className="text-sm text-foreground font-semibold mt-1 block">{vendor.primaryPhone || 'No Phone'}</span>
                        <span className="text-xs text-foreground-muted mt-0.5 block">Fax: {vendor.faxNumber || '-'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-foreground-muted block font-semibold uppercase">Website</span>
                        {vendor.website ? (
                            <a 
                                href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-sm text-primary font-semibold mt-1 flex items-center gap-1 hover:underline"
                            >
                                {vendor.website}
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        ) : (
                            <span className="text-sm text-foreground-muted mt-1 block">No URL</span>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-base font-bold text-foreground border-b border-border pb-2">Address details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="md:col-span-2">
                        <span className="text-xs text-foreground-muted block font-semibold uppercase">Street Address</span>
                        <span className="text-sm text-foreground font-semibold mt-1 block">{vendor.address || 'No street address logged'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-foreground-muted block font-semibold uppercase">City / Zip</span>
                        <span className="text-sm text-foreground font-semibold mt-1 block">{vendor.city || '-'} {vendor.zipCode ? `, ${vendor.zipCode}` : ''}</span>
                    </div>
                    <div>
                        <span className="text-xs text-foreground-muted block font-semibold uppercase">State / Province</span>
                        <span className="text-sm text-foreground font-semibold mt-1 block">{vendor.stateName || 'No State'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-foreground-muted block font-semibold uppercase">Country</span>
                        <span className="text-sm text-foreground font-semibold mt-1 block">{vendor.countryName || 'No Country'}</span>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-base font-bold text-foreground border-b border-border pb-2">Compliance & Capabilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div>
                        <span className="text-xs text-foreground-muted block font-semibold uppercase">Tax ID (Decrypted)</span>
                        <span className="text-sm font-mono text-foreground font-bold mt-1 block">{vendor.taxId || 'No TAX ID logged'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-foreground-muted block font-semibold uppercase">Federal ID</span>
                        <span className="text-sm text-foreground font-semibold mt-1 block">{vendor.federalId || '-'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-foreground-muted block font-semibold uppercase">Strategic BU</span>
                        <span className="text-sm text-foreground font-semibold mt-1 block">{vendor.primaryBusinessUnitName || '-'}</span>
                    </div>
                    <div className="md:col-span-3">
                        <span className="text-xs text-foreground-muted block font-semibold uppercase">Core Technologies</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {vendor.technologies ? vendor.technologies.split(',').map((t, idx) => (
                                <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs px-2 py-0.5 rounded-theme font-semibold">
                                    {t.trim()}
                                </span>
                            )) : <span className="text-foreground-muted text-sm">No capabilities listed</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AtsVendorOverviewTab;
