import React, { useState, useEffect } from 'react';
import { Loader, ArrowLeft, Building, MapPin, Globe, Shield, Save, X } from 'lucide-react';

const FormSection = ({ title, icon: Icon, children }) => (
    <div className="pt-6 first:pt-2">
        <div className="flex items-center gap-2 mb-5">
            <div className="h-0.5 w-6 bg-primary rounded-full"></div>
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                {Icon && <Icon size={12} className="text-primary" />}
                {title}
            </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">{children}</div>
    </div>
);

const InputField = ({ label, name, value, onChange, type = "text", required = false, disabled = false }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest ml-1">{label}</label>
        <input 
            type={type}
            name={name} 
            value={value} 
            onChange={onChange} 
            required={required} 
            disabled={disabled}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-theme outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm disabled:opacity-50 disabled:bg-background-muted/50" 
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, options, placeholder }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest ml-1">{label}</label>
        <select 
            name={name} 
            value={value} 
            onChange={onChange} 
            className="w-full px-4 py-2.5 bg-background border border-border rounded-theme outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm appearance-none cursor-pointer"
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
        </select>
    </div>
);

const CrmCompanyForm = ({ item, onSave, onCancel, loading, companies, companyTypes, industries, locations }) => {
    const [formData, setFormData] = useState({
        name: '', companyOwner: '', phone: '', email: '', website: '',
        locationId: '', companyTypeId: '', industryId: '', parentCompanyId: '',
        billingStreet: '', billingCity: '', billingZip: '', billingState: '', billingCountry: '',
        shippingStreet: '', shippingCity: '', shippingZip: '', shippingState: '', shippingCountry: '',
    });
    const [isSameAddress, setIsSameAddress] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '', companyOwner: item.companyOwner || '', phone: item.phone || '', email: item.email || '', website: item.website || '',
                locationId: item.locationId || '', companyTypeId: item.companyTypeId || '', industryId: item.industryId || '', parentCompanyId: item.parentCompanyId || '',
                billingStreet: item.billingStreet || '', billingCity: item.billingCity || '', billingZip: item.billingZip || '', billingState: item.billingState || '', billingCountry: item.billingCountry || '',
                shippingStreet: item.shippingStreet || '', shippingCity: item.shippingCity || '', shippingZip: item.shippingZip || '', shippingState: item.shippingState || '', shippingCountry: item.shippingCountry || '',
            });
        }
    }, [item]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    useEffect(() => {
        if (isSameAddress) {
            setFormData(prev => ({
                ...prev,
                shippingStreet: prev.billingStreet,
                shippingCity: prev.billingCity,
                shippingState: prev.billingState,
                shippingZip: prev.billingZip,
                shippingCountry: prev.billingCountry,
            }));
        }
    }, [isSameAddress, formData.billingStreet, formData.billingCity, formData.billingState, formData.billingZip, formData.billingCountry]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ id: item?.id, ...formData });
    };

    return (
        <div className="flex flex-col h-full bg-card">
            <header className="p-5 border-b border-border flex-shrink-0 flex items-center justify-between bg-background-muted/30">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-2 rounded-full hover:bg-background-muted text-foreground-muted transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-foreground tracking-tighter uppercase italic">
                            {item ? 'Update Company' : 'Add New Company'}
                        </h2>
                        <p className="text-[10px] text-foreground-muted font-black mt-1 uppercase tracking-widest opacity-60">Record Management Protocol</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-theme text-[10px] font-black uppercase tracking-widest text-foreground-muted hover:bg-background-muted transition-all" disabled={loading}>Cancel</button>
                    <button 
                        type="submit" 
                        form="company-form" 
                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-theme font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 active:scale-95" 
                        disabled={loading}
                    >
                        {loading ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Save size={14} />} 
                        Save Record
                    </button>
                </div>
            </header>
            
            <form id="company-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <FormSection title="Corporate Profile" icon={Building}>
                    <InputField label="Entity Name" name="name" value={formData.name} onChange={handleChange} required />
                    <InputField label="Account Owner" name="companyOwner" value={formData.companyOwner} onChange={handleChange} />
                    <InputField label="Phone Terminal" name="phone" value={formData.phone} onChange={handleChange} />
                    <InputField label="Email Address" name="email" value={formData.email} onChange={handleChange} type="email" />
                    <InputField label="Digital Hub" name="website" value={formData.website} onChange={handleChange} />
                    <SelectField label="Parent Hierarchy" name="parentCompanyId" value={formData.parentCompanyId} onChange={handleChange} placeholder="Standalone Entity" options={companies.filter(c => c.id !== item?.id).map(c => ({ id: c.id, name: c.name }))} />
                    <SelectField label="Market Sector" name="industryId" value={formData.industryId} onChange={handleChange} placeholder="Select Sector" options={industries} />
                    <SelectField label="Classification" name="companyTypeId" value={formData.companyTypeId} onChange={handleChange} placeholder="Select Type" options={companyTypes} />
                    <SelectField label="Geographical Location" name="locationId" value={formData.locationId} onChange={handleChange} placeholder="Select Region" options={locations} />
                </FormSection>

                <FormSection title="Billing Protocol" icon={Shield}>
                    <InputField label="Street Address" name="billingStreet" value={formData.billingStreet} onChange={handleChange} />
                    <InputField label="City" name="billingCity" value={formData.billingCity} onChange={handleChange} />
                    <InputField label="State / Province" name="billingState" value={formData.billingState} onChange={handleChange} />
                    <InputField label="Zip / Postal Code" name="billingZip" value={formData.billingZip} onChange={handleChange} />
                    <InputField label="Country" name="billingCountry" value={formData.billingCountry} onChange={handleChange} />
                </FormSection>

                <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                checked={isSameAddress} 
                                onChange={(e) => setIsSameAddress(e.target.checked)} 
                                className="sr-only" 
                            />
                            <div className={`h-5 w-5 border-2 rounded-theme transition-all flex items-center justify-center ${isSameAddress ? 'bg-primary border-primary' : 'border-border bg-background'}`}>
                                {isSameAddress && <Shield size={12} className="text-primary-foreground" />}
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-foreground-muted uppercase tracking-widest group-hover:text-foreground transition-colors">Clone Billing to Shipping Profile</span>
                    </label>
                </div>

                <FormSection title="Logistics Routing" icon={MapPin}>
                    <InputField label="Street Address" name="shippingStreet" value={formData.shippingStreet} onChange={handleChange} disabled={isSameAddress} />
                    <InputField label="City" name="shippingCity" value={formData.shippingCity} onChange={handleChange} disabled={isSameAddress} />
                    <InputField label="State / Province" name="shippingState" value={formData.shippingState} onChange={handleChange} disabled={isSameAddress} />
                    <InputField label="Zip / Postal Code" name="shippingZip" value={formData.shippingZip} onChange={handleChange} disabled={isSameAddress} />
                    <InputField label="Country" name="shippingCountry" value={formData.shippingCountry} onChange={handleChange} disabled={isSameAddress} />
                </FormSection>
            </form>
        </div>
    );
};

export default CrmCompanyForm;