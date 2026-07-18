import React from 'react';

const AtsVendorBusinessTab = ({
    formData,
    handleInputChange,
    handleMultiSelectChange,
    countries = [],
    states = [],
    businessUnits = [],
    employees = []
}) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Row 1: Primary Business Unit | Vendor Visibility | Business Units */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Primary Business Unit</label>
                    <select
                        name="primaryBusinessUnitId"
                        value={formData.primaryBusinessUnitId}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="">Select Business Unit</option>
                        {businessUnits.map(b => (
                            <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Vendor Visibility</label>
                    <div className="flex items-center gap-4 h-9">
                        <label className="flex items-center gap-1.5 cursor-pointer text-sm text-foreground">
                            <input
                                type="radio"
                                name="vendorVisibility"
                                value="PUBLIC"
                                checked={formData.vendorVisibility === 'PUBLIC'}
                                onChange={handleInputChange}
                                className="text-primary focus:ring-primary/30"
                            />
                            Organization Level
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-sm text-foreground">
                            <input
                                type="radio"
                                name="vendorVisibility"
                                value="BUSINESS_UNIT"
                                checked={formData.vendorVisibility === 'BUSINESS_UNIT'}
                                onChange={handleInputChange}
                                className="text-primary focus:ring-primary/30"
                            />
                            Business Unit
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Business Units</label>
                    <select
                        multiple
                        value={formData.businessUnitIds}
                        onChange={handleMultiSelectChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none h-9"
                    >
                        {businessUnits.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                {/* Row 2: Vendor Name | Federal ID | Website */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Vendor Name *</label>
                    <input
                        type="text"
                        name="companyName"
                        required
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Federal ID</label>
                    <input
                        type="text"
                        name="federalId"
                        value={formData.federalId}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Website</label>
                    <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Row 3: Contact Number | Fax | Address */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Contact Number</label>
                    <input
                        type="text"
                        name="primaryPhone"
                        value={formData.primaryPhone}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Fax</label>
                    <input
                        type="text"
                        name="faxNumber"
                        value={formData.faxNumber}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Row 4: Country | State | City */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Country</label>
                    <select
                        name="countryId"
                        value={formData.countryId}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none"
                    >
                        <option value="">Select Country</option>
                        {countries.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">State</label>
                    <select
                        name="stateId"
                        value={formData.stateId}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none"
                    >
                        <option value="">Select</option>
                        {states.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">City</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none"
                    />
                </div>

                {/* Row 5: Zip Code (only first column) */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Zip Code</label>
                    <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Row 5 continued: Send Requirement + Send Hotlist checkboxes */}
                <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                        <input
                            type="checkbox"
                            name="sendRequirement"
                            checked={formData.sendRequirement}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary/30"
                        />
                        Send Requirement
                    </label>
                </div>

                <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                        <input
                            type="checkbox"
                            name="sendHotlist"
                            checked={formData.sendHotlist}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary/30"
                        />
                        Send Hotlist
                    </label>
                </div>

                {/* Row 6: Primary Owner | Ownership | Vendor Lead */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Primary Owner</label>
                    <select
                        name="ownerId"
                        value={formData.ownerId}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none"
                    >
                        <option value="">Select Employee</option>
                        {employees.map(e => (
                            <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.email || e.emailId || ''})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Ownership</label>
                    <select
                        name="ownership"
                        value={formData.ownership}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none"
                    >
                        <option value="">Select Ownership</option>
                        {employees.map(e => (
                            <option key={e.id} value={`${e.firstName} ${e.lastName}`}>{e.firstName} {e.lastName} ({e.email || e.emailId || ''})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Vendor Lead</label>
                    <select
                        name="vendorLeadId"
                        value={formData.vendorLeadId}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none"
                    >
                        <option value="">Select Employee</option>
                        {employees.map(e => (
                            <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.email || e.emailId || ''})</option>
                        ))}
                    </select>
                </div>

                {/* Row 7: Allow Access to All Users checkbox (spans first col) */}
                <div className="md:col-span-1 flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                        <input
                            type="checkbox"
                            name="allowAccessToAllUsers"
                            checked={formData.allowAccessToAllUsers}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary/30"
                        />
                        Allow Access to All users
                    </label>
                </div>

                {/* Row 8: Technologies (col 1-2) | (empty col 3) */}
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Technologies</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            name="technologies"
                            placeholder="Comma-separated technologies..."
                            value={formData.technologies}
                            onChange={handleInputChange}
                            className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                {/* About Vendor spans remaining cols */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-foreground-muted mb-1">About Vendor</label>
                    <textarea
                        name="aboutVendor"
                        rows={4}
                        value={formData.aboutVendor}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none resize-y"
                    />
                </div>

                {/* Row 9: Vendor Type */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Vendor Type</label>
                    <select
                        name="vendorType"
                        value={formData.vendorType}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none"
                    >
                        <option value="">Select</option>
                        <option value="STAFFING">Staffing Agency</option>
                        <option value="CONSULTING">Consulting Firm</option>
                        <option value="INDEPENDENT_CONTRACTOR">Contractor</option>
                        <option value="RPO">RPO</option>
                        <option value="MSP">MSP</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

            </div>
        </div>
    );
};

export default AtsVendorBusinessTab;
