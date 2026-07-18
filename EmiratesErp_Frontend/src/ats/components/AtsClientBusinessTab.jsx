import React from 'react';

const AtsClientBusinessTab = ({
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

                {/* Row 1: Primary Business Unit | Client Visibility | Business Units */}
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
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Client Visibility</label>
                    <div className="flex items-center gap-4 h-9">
                        <label className="flex items-center gap-1.5 cursor-pointer text-sm text-foreground">
                            <input
                                type="radio"
                                name="clientVisibility"
                                value="PUBLIC"
                                checked={formData.clientVisibility === 'PUBLIC'}
                                onChange={handleInputChange}
                                className="text-primary focus:ring-primary/30"
                            />
                            Organization Level
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-sm text-foreground">
                            <input
                                type="radio"
                                name="clientVisibility"
                                value="BUSINESS_UNIT"
                                checked={formData.clientVisibility === 'BUSINESS_UNIT'}
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

                {/* Row 2: Client Name | VMS Client Name | Federal ID */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Client Name *</label>
                    <input
                        type="text"
                        name="clientName"
                        required
                        value={formData.clientName}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">VMS Client Name</label>
                    <input
                        type="text"
                        name="vmsClientName"
                        value={formData.vmsClientName}
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

                {/* Row 3: Contact Number | Fax | Email ID */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Contact Number</label>
                    <input
                        type="text"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Fax</label>
                    <input
                        type="text"
                        name="fax"
                        value={formData.fax}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Email ID</label>
                    <input
                        type="email"
                        name="emailId"
                        value={formData.emailId}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Row 4: Website | Industry | Category */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Website *</label>
                    <input
                        type="text"
                        name="website"
                        required
                        value={formData.website}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Industry</label>
                    <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        placeholder="e.g. Technology, Healthcare"
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Category</label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        placeholder="e.g. Enterprise, SMB"
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Row 5: Address */}
                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Row 6: Country | State | City */}
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

                {/* Row 7: Postal Code | Status */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Postal Code</label>
                    <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Status *</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none"
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="PROSPECT">Prospect</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Practice</label>
                    <input
                        type="text"
                        name="practice"
                        value={formData.practice}
                        onChange={handleInputChange}
                        placeholder="e.g. IT Staffing, Finance"
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Row 8: Primary Owner | Ownership | Client Lead */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Primary Owner</label>
                    <select
                        name="primaryOwnerId"
                        value={formData.primaryOwnerId}
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
                    <input
                        type="text"
                        name="ownership"
                        value={formData.ownership}
                        onChange={handleInputChange}
                        placeholder="e.g. Private, Public"
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Client Lead</label>
                    <select
                        name="clientLeadId"
                        value={formData.clientLeadId}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none"
                    >
                        <option value="">Select Employee</option>
                        {employees.map(e => (
                            <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.email || e.emailId || ''})</option>
                        ))}
                    </select>
                </div>

                {/* Row 9: Client Short Name */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Client Short Name</label>
                    <input
                        type="text"
                        name="clientShortName"
                        value={formData.clientShortName}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Checkboxes */}
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

                <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                        <input
                            type="checkbox"
                            name="allowAccessToAllUsers"
                            checked={formData.allowAccessToAllUsers}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary/30"
                        />
                        Allow Access to All Users
                    </label>
                </div>

                <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                        <input
                            type="checkbox"
                            name="displayOnJob"
                            checked={formData.displayOnJob}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary/30"
                        />
                        Display on Job
                    </label>
                </div>

                <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                        <input
                            type="checkbox"
                            name="stopSubmitEmailNotification"
                            checked={formData.stopSubmitEmailNotification}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary/30"
                        />
                        Stop Submit Email Notification
                    </label>
                </div>

                <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                        <input
                            type="checkbox"
                            name="defaultAddressForJobs"
                            checked={formData.defaultAddressForJobs}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary/30"
                        />
                        Default Address for Jobs
                    </label>
                </div>

                {/* About Company */}
                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-foreground-muted mb-1">About Company</label>
                    <textarea
                        name="aboutCompany"
                        rows={4}
                        value={formData.aboutCompany}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none resize-y"
                        placeholder="Describe the client company..."
                    />
                </div>

                {/* Client Facilities */}
                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Client Facilities</label>
                    <textarea
                        name="clientFacilities"
                        rows={3}
                        value={formData.clientFacilities}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none resize-y"
                        placeholder="e.g. Gym, Cafeteria, Remote Work..."
                    />
                </div>
            </div>
        </div>
    );
};

export default AtsClientBusinessTab;
