import React from 'react';
import { useCrmPermissions } from '../context/CrmPermissionsContext.jsx';
import CrmAccessDenied from './CrmAccessDenied.jsx';

const CrmLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const PermissionRoute = ({ module, children }) => {
  const { hasPermission, loading } = useCrmPermissions();

  if (loading) {
    return <CrmLoadingSpinner />;
  }

  if (!hasPermission(module, 'view')) {
    return <CrmAccessDenied module={module} />;
  }

  return children;
};

export default PermissionRoute;
export { CrmLoadingSpinner };
