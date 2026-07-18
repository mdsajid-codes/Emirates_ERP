import React from 'react';

const AtsClientFormAssignmentTab = ({
    assignment = {
        assignedToUserIds: [],
        salesManagerId: '',
        accountManagerId: '',
        recruitmentManagerId: '',
        secondarySalesManagerId: '',
        secondaryRecruitmentManagerId: '',
        defaultTatDays: '',
        tatNotificationRecipientIds: [],
        defaultTaxTerm: '',
        defaultWorkAuthorization: '',
        defaultPayRateTaxTerm: '',
        defaultBillRateTaxTerm: '',
        postJobInCareerPortal: false,
        makeReferencesMandatory: false,
        maxSubmissions: '',
        numberOfPositions: ''
    },
    employees = [],
    onChange
}) => {
    const handleFieldChange = (e) => {
        const { name, value, type, checked } = e.target;
        onChange({
            ...assignment,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleMultiSelectChange = (name, e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(parseInt(options[i].value));
            }
        }
        onChange({
            ...assignment,
            [name]: selected
        });
    };

    return (
        <div className="space-y-6 text-foreground font-sans">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Sales Manager */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Sales Manager</label>
                    <select
                        name="salesManagerId"
                        value={assignment.salesManagerId || ''}
                        onChange={handleFieldChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                        <option value="">Select Sales Manager</option>
                        {employees.map(e => (
                            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                        ))}
                    </select>
                </div>

                {/* Account Manager */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Account Manager</label>
                    <select
                        name="accountManagerId"
                        value={assignment.accountManagerId || ''}
                        onChange={handleFieldChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                        <option value="">Select Account Manager</option>
                        {employees.map(e => (
                            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                        ))}
                    </select>
                </div>

                {/* Recruitment Manager */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Recruitment Manager</label>
                    <select
                        name="recruitmentManagerId"
                        value={assignment.recruitmentManagerId || ''}
                        onChange={handleFieldChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                        <option value="">Select Recruitment Manager</option>
                        {employees.map(e => (
                            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                        ))}
                    </select>
                </div>

                {/* Secondary Sales Manager */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Secondary Sales Manager</label>
                    <select
                        name="secondarySalesManagerId"
                        value={assignment.secondarySalesManagerId || ''}
                        onChange={handleFieldChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                        <option value="">Select Secondary Sales Manager</option>
                        {employees.map(e => (
                            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                        ))}
                    </select>
                </div>

                {/* Secondary Recruitment Manager */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Secondary Recruitment Manager</label>
                    <select
                        name="secondaryRecruitmentManagerId"
                        value={assignment.secondaryRecruitmentManagerId || ''}
                        onChange={handleFieldChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                        <option value="">Select Secondary Recruitment Manager</option>
                        {employees.map(e => (
                            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                        ))}
                    </select>
                </div>

                {/* Default TAT (Days) */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Default TAT (Days)</label>
                    <input
                        type="number"
                        name="defaultTatDays"
                        value={assignment.defaultTatDays || ''}
                        onChange={handleFieldChange}
                        placeholder="e.g. 5"
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Default Tax Term */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Default Tax Term</label>
                    <input
                        type="text"
                        name="defaultTaxTerm"
                        value={assignment.defaultTaxTerm || ''}
                        onChange={handleFieldChange}
                        placeholder="e.g. W2, C2C"
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Default Work Authorization */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Default Work Authorization</label>
                    <input
                        type="text"
                        name="defaultWorkAuthorization"
                        value={assignment.defaultWorkAuthorization || ''}
                        onChange={handleFieldChange}
                        placeholder="e.g. US Citizen, GC"
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Max Submissions */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Max Submissions</label>
                    <input
                        type="number"
                        name="maxSubmissions"
                        value={assignment.maxSubmissions || ''}
                        onChange={handleFieldChange}
                        placeholder="e.g. 3"
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Number of Positions */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Number of Positions</label>
                    <input
                        type="number"
                        name="numberOfPositions"
                        value={assignment.numberOfPositions || ''}
                        onChange={handleFieldChange}
                        placeholder="e.g. 10"
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Default Pay Rate Tax Term */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Default Pay Rate Tax Term</label>
                    <input
                        type="text"
                        name="defaultPayRateTaxTerm"
                        value={assignment.defaultPayRateTaxTerm || ''}
                        onChange={handleFieldChange}
                        placeholder="e.g. hourly, monthly"
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Default Bill Rate Tax Term */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Default Bill Rate Tax Term</label>
                    <input
                        type="text"
                        name="defaultBillRateTaxTerm"
                        value={assignment.defaultBillRateTaxTerm || ''}
                        onChange={handleFieldChange}
                        placeholder="e.g. hourly, monthly"
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Assigned Users (Multi-select) */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">Assigned Users (Multi-select)</label>
                    <select
                        multiple
                        value={assignment.assignedToUserIds || []}
                        onChange={(e) => handleMultiSelectChange('assignedToUserIds', e)}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none h-24"
                    >
                        {employees.map(e => (
                            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                        ))}
                    </select>
                </div>

                {/* TAT Notification Recipients (Multi-select) */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1">TAT Notification Recipients</label>
                    <select
                        multiple
                        value={assignment.tatNotificationRecipientIds || []}
                        onChange={(e) => handleMultiSelectChange('tatNotificationRecipientIds', e)}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none h-24"
                    >
                        {employees.map(e => (
                            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                        ))}
                    </select>
                </div>

                {/* Toggles */}
                <div className="flex flex-col gap-4 justify-center">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-foreground select-none">
                        <input
                            type="checkbox"
                            name="postJobInCareerPortal"
                            checked={assignment.postJobInCareerPortal || false}
                            onChange={handleFieldChange}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary/30"
                        />
                        Post Job in Career Portal
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-foreground select-none">
                        <input
                            type="checkbox"
                            name="makeReferencesMandatory"
                            checked={assignment.makeReferencesMandatory || false}
                            onChange={handleFieldChange}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary/30"
                        />
                        Make References Mandatory
                    </label>
                </div>

            </div>
        </div>
    );
};

export default AtsClientFormAssignmentTab;
