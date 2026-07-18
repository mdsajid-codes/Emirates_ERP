import React from 'react';
import { Building, MapPin, Globe, Phone, Mail, FileText, Calendar, CreditCard, Edit, Briefcase } from 'lucide-react';
import SecureImage from './SecureImage';

const TenantCompanyProfileView = ({ companyInfo, onEdit }) => {
    if (!companyInfo) return null;

    const SectionHeader = ({ icon: Icon, title }) => (
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border text-primary">
            <Icon className="h-5 w-5" />
            <h3 className="text-lg font-semibold">{title}</h3>
        </div>
    );

    const InfoItem = ({ label, value, fullWidth = false }) => (
        <div className={`space-y-1 ${fullWidth ? 'col-span-full' : ''}`}>
            <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">{label}</p>
            <p className="text-sm font-medium text-foreground bg-background-muted/50 p-2 rounded border border-border/50 min-h-[38px] flex items-center">
                {value || '-'}
            </p>
        </div>
    );

    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const processLogoUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const filename = url.split(/[/\\]/).pop();
        return `${API_URL}/master/tenant-company-info/images/${filename}`;
    };

    const logoSrc = processLogoUrl(companyInfo.logoUrl);

    return (
        <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden animate-in fade-in duration-300">
            {/* Header / Branding */}
            <div className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden shadow-sm">
                        {logoSrc ? (
                            <SecureImage src={logoSrc} alt="Logo" className="h-full w-full object-contain" />
                        ) : (
                            <Building className="h-8 w-8 text-foreground-muted" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">{companyInfo.companyName}</h2>
                        <div className="flex items-center gap-4 mt-1 text-sm text-foreground-muted">
                            {companyInfo.email && <div className="flex items-center gap-1"><Mail size={14} /> {companyInfo.email}</div>}
                            {companyInfo.phone && <div className="flex items-center gap-1"><Phone size={14} /> {companyInfo.phone}</div>}
                        </div>
                    </div>
                </div>
                <button onClick={onEdit} className="btn-primary flex items-center gap-2 shadow-md">
                    <Edit size={16} /> Edit Details
                </button>
            </div>

            <div className="p-6 grid gap-8">
                {/* Address Section */}
                <section>
                    <SectionHeader icon={MapPin} title="Address Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <InfoItem label="Street Address" value={companyInfo.address} fullWidth className="md:col-span-2" />
                        <InfoItem label="City" value={companyInfo.city} />
                        <InfoItem label="State" value={companyInfo.state} />
                        <InfoItem label="Country" value={companyInfo.country} />
                        <InfoItem label="Zip Code" value={companyInfo.zipCode} />
                        <InfoItem label="Website" value={companyInfo.website} fullWidth className="md:col-span-2" />
                    </div>
                </section>

                {/* Statutory Section */}
                <section>
                    <SectionHeader icon={FileText} title="Statutory & Legal" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoItem label="Tax ID" value={companyInfo.taxId} />
                        <InfoItem label="Registration Number" value={companyInfo.registrationNumber} />
                        <InfoItem label="MOHRE Est. ID" value={companyInfo.mohreEstablishmentId} />
                        <InfoItem label="TRN" value={companyInfo.trn} />
                    </div>
                </section>

                {/* UAE Specifics */}
                <section>
                    <SectionHeader icon={Briefcase} title="Trade License & Quota" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <InfoItem label="Trade License No." value={companyInfo.tradeLicenseNumber} />
                        <InfoItem label="License Expiry" value={companyInfo.tradeLicenseExpiry} />
                        <InfoItem label="Emirate" value={companyInfo.emirate} />
                        <InfoItem label="PO Box" value={companyInfo.poBox} />
                        <InfoItem label="Visa Quota Total" value={companyInfo.visaQuotaTotal} />
                        <InfoItem label="Bank Routing Code" value={companyInfo.employerBankRoutingCode} />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TenantCompanyProfileView;
