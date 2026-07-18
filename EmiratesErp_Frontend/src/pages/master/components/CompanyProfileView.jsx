import React from 'react';
import { Building, Phone, Mail, Globe, MapPin, FileText, CreditCard, Image as ImageIcon } from 'lucide-react';
import SecureImage from './SecureImage';

const CompanyProfileView = ({ data, onEdit }) => {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="text-center py-10 bg-card rounded-xl border border-border shadow-sm">
                <div className="bg-background-muted inline-flex p-4 rounded-full mb-4">
                    <Building className="h-8 w-8 text-foreground-muted" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Company Information Set</h3>
                <p className="text-foreground-muted mb-6 max-w-sm mx-auto">
                    Please configure your company details, banking information, and branding assets to get started.
                </p>
                <button onClick={onEdit} className="btn-primary">
                    Configure Company Info
                </button>
            </div>
        );
    }

    const Section = ({ title, icon: Icon, children }) => (
        <div className="bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden mb-6 border border-border">
            <div className="bg-background-muted/50 p-4 border-b border-border flex items-center gap-2">
                {Icon && <Icon className="h-5 w-5 text-primary" />}
                <h3 className="font-semibold text-lg">{title}</h3>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );

    const DetailItem = ({ label, value }) => (
        <div className="mb-4">
            <p className="text-sm text-foreground-muted mb-1">{label}</p>
            <p className="font-medium text-foreground">{value || '-'}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button onClick={onEdit} className="btn-primary">Update Company Info</button>
            </div>

            <Section title="Basic Details" icon={Building}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DetailItem label="Company Name" value={data.companyName} />
                    <DetailItem label="Phone" value={data.phone} />
                    <DetailItem label="Email" value={data.email} />
                    <DetailItem label="Website" value={data.website} />
                </div>
            </Section>

            <Section title="Address" icon={MapPin}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DetailItem label="Street Address" value={data.address} />
                    <DetailItem label="City" value={data.city} />
                    <DetailItem label="Emirate" value={data.emirate} />
                    <DetailItem label="PO Box" value={data.poBox} />
                    <DetailItem label="Country" value={data.country} />
                </div>
            </Section>

            <Section title="Statutory (UAE)" icon={FileText}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DetailItem label="Trade License No." value={data.tradeLicenseNumber} />
                    <DetailItem label="License Expiry" value={data.tradeLicenseExpiry} />
                    <DetailItem label="TRN" value={data.trn} />
                    <DetailItem label="MOHRE Est. ID" value={data.mohreEstablishmentId} />
                    <DetailItem label="Visa Quota Total" value={data.visaQuotaTotal} />
                    <DetailItem label="Employer Bank Routing Code" value={data.employerBankRoutingCode} />
                </div>
            </Section>

            <Section title="Bank Accounts" icon={CreditCard}>
                {data.bankDetails && data.bankDetails.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.bankDetails.map((bank, index) => (
                            <div key={index} className="bg-background-muted p-4 rounded-lg border border-border">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-primary">{bank.bankName}</h4>
                                    {bank.isPrimary && <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Primary</span>}
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p><span className="text-foreground-muted">A/C:</span> {bank.accountNumber}</p>
                                    <p><span className="text-foreground-muted">IFSC:</span> {bank.ifscCode}</p>
                                    <p><span className="text-foreground-muted">IBAN:</span> {bank.iban}</p>
                                    <p><span className="text-foreground-muted">Swift:</span> {bank.swiftCode}</p>
                                    <p><span className="text-foreground-muted">Branch:</span> {bank.branchName}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-foreground-muted italic">No bank accounts added.</p>
                )}
            </Section>

            <Section title="Branding Assets" icon={ImageIcon}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { key: 'logoUrl', label: 'Logo' },
                        { key: 'signatureUrl', label: 'Signature' },
                        { key: 'stampUrl', label: 'Stamp' },
                        { key: 'invoiceHeaderUrl', label: 'Invoice Header' },
                        { key: 'invoiceFooterUrl', label: 'Invoice Footer' },
                        { key: 'watermarkUrl', label: 'Watermark' },
                    ].map(({ key, label }) => (
                        <div key={key} className="bg-background-muted p-3 rounded-lg text-center">
                            <p className="text-xs font-medium mb-2 text-foreground-muted">{label}</p>
                            <div className="aspect-square bg-card rounded border border-border flex items-center justify-center overflow-hidden">
                                {data[key] ? (
                                    <SecureImage src={data[key]} alt={label} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-xs text-foreground-muted">Not set</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {data.customFields && data.customFields.length > 0 && (
                <Section title="Custom Fields" icon={FileText}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.customFields.map((field, index) => (
                            <div key={index} className="bg-background-muted p-3 rounded-lg border border-border">
                                <p className="text-xs text-foreground-muted font-medium uppercase">{field.fieldName}</p>
                                <p className="text-foreground mt-1">{field.fieldValue}</p>
                            </div>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
};

export default CompanyProfileView;
