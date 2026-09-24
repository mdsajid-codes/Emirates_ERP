import React, { useState, useEffect } from 'react';
import { Loader, User, Building, Phone, Mail, FileText, CreditCard, MapPin } from 'lucide-react';

const CustomerForm = ({ customer, onSave, onCancel, isSubmitting, posTheme }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        primaryFirstName: '',
        primaryLastName: '',
        contactEmail: '',
        contactPhone: '',
        mobile: '',
        vatTrnNumber: '',
        city: 'Dubai',
        currency: 'AED',
        creditLimitAllowed: 0,
        partyType: 'CUSTOMER',
        active: true
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                id: customer.id,
                companyName: customer.companyName || customer.name || '',
                primaryFirstName: customer.primaryFirstName || '',
                primaryLastName: customer.primaryLastName || '',
                contactEmail: customer.contactEmail || customer.email || '',
                contactPhone: customer.contactPhone || customer.phone || '',
                mobile: customer.mobile || customer.phone || '',
                vatTrnNumber: customer.vatTrnNumber || customer.vatNumber || '',
                city: customer.city || 'Dubai',
                currency: customer.currency || 'AED',
                creditLimitAllowed: customer.creditLimitAllowed || 0,
                partyType: 'CUSTOMER',
                active: customer.active !== undefined ? customer.active : true
            });
        } else {
            setFormData({
                companyName: '',
                primaryFirstName: '',
                primaryLastName: '',
                contactEmail: '',
                contactPhone: '',
                mobile: '',
                vatTrnNumber: '',
                city: 'Dubai',
                currency: 'AED',
                creditLimitAllowed: 0,
                partyType: 'CUSTOMER',
                active: true
            });
        }
    }, [customer]);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        // Prepare payload for /api/parties
        const payload = {
            ...formData,
            // Fallbacks for legacy/unified field compatibility
            name: formData.companyName,
            primaryContactPerson: [formData.primaryFirstName, formData.primaryLastName].filter(Boolean).join(' '),
            email: formData.contactEmail,
            phone: formData.contactPhone || formData.mobile,
            partyType: 'CUSTOMER'
        };
        onSave(payload);
    };

    const primaryColor = posTheme?.primary || posTheme?.sidebarActive || '#00A9A8';

    return (
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
            {/* Company / Customer Name */}
            <div>
                <label htmlFor="companyName" className="block font-bold text-slate-700 mb-1">
                    Company / Customer Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Al Habtoor Trading LLC or John Doe"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                </div>
            </div>

            {/* Contact Person Names */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="primaryFirstName" className="block font-bold text-slate-700 mb-1">
                        First Name
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            id="primaryFirstName"
                            name="primaryFirstName"
                            value={formData.primaryFirstName}
                            onChange={handleChange}
                            placeholder="First Name"
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="primaryLastName" className="block font-bold text-slate-700 mb-1">
                        Last Name
                    </label>
                    <input
                        id="primaryLastName"
                        name="primaryLastName"
                        value={formData.primaryLastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="contactEmail" className="block font-bold text-slate-700 mb-1">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            id="contactEmail"
                            name="contactEmail"
                            type="email"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            placeholder="customer@domain.ae"
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="contactPhone" className="block font-bold text-slate-700 mb-1">
                        Mobile / Phone (+971)
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            id="contactPhone"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            placeholder="+971 50 123 4567"
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* VAT TRN Number & Emirate */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="vatTrnNumber" className="block font-bold text-slate-700 mb-1">
                        VAT TRN Number (15 digits)
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            id="vatTrnNumber"
                            name="vatTrnNumber"
                            value={formData.vatTrnNumber}
                            onChange={handleChange}
                            placeholder="100234567800003"
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none font-mono"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="city" className="block font-bold text-slate-700 mb-1">
                        Emirate / City
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                        >
                            <option value="Dubai">Dubai</option>
                            <option value="Abu Dhabi">Abu Dhabi</option>
                            <option value="Sharjah">Sharjah</option>
                            <option value="Ajman">Ajman</option>
                            <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                            <option value="Fujairah">Fujairah</option>
                            <option value="Umm Al Quwain">Umm Al Quwain</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Credit Limit (AED) */}
            <div>
                <label htmlFor="creditLimitAllowed" className="block font-bold text-slate-700 mb-1">
                    Credit Limit (AED)
                </label>
                <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        id="creditLimitAllowed"
                        name="creditLimitAllowed"
                        type="number"
                        min="0"
                        value={formData.creditLimitAllowed}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 flex items-center justify-center min-w-[120px] cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader className="animate-spin h-4 w-4" />
                    ) : (
                        customer ? 'Update Customer' : 'Save Customer'
                    )}
                </button>
            </div>
        </form>
    );
};

export default CustomerForm;