import React from 'react';

const AtsVendorPreferencesTab = ({
    formData,
    handleInputChange
}) => {
    return (
        <div className="space-y-6">
            <p className="text-xs text-foreground-muted">
                Vendor visibility, send preferences, and access control are managed under the <strong>Business Information</strong> tab.
            </p>
        </div>
    );
};

export default AtsVendorPreferencesTab;
