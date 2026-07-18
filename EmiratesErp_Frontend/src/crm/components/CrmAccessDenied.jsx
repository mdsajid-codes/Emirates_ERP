import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const CrmAccessDenied = ({ module }) => {
  const navigate = useNavigate();

  // Format module name to human readable format (e.g. CALL_LOG -> Call Log)
  const formatModuleName = (mod) => {
    if (!mod) return 'this section';
    return mod
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-full mb-6 text-red-500 animate-pulse">
        <ShieldAlert size={48} className="stroke-[1.5]" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        Access Restricted
      </h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        You do not have permission to view <span className="font-semibold text-slate-700 dark:text-slate-300">{formatModuleName(module)}</span>. Contact your CRM Administrator to request access.
      </p>
      <button
        onClick={() => navigate('/crm-dashboard/home')}
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm duration-200"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default CrmAccessDenied;
