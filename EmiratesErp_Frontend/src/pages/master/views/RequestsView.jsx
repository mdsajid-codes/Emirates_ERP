import React from 'react';
import { Loader } from 'lucide-react';
import TenantRequestList from '../components/TenantRequestList';

const RequestsView = ({ requests, loading, error, onApprove, onReject }) => (
    <>
        <h1 className="text-3xl font-bold text-foreground">Pending Tenant Requests</h1>
        <div className="mt-6 bg-card text-card-foreground p-6 rounded-xl shadow-sm">
            {loading ? <div className="flex justify-center items-center h-40"><Loader className="h-8 w-8 animate-spin text-primary" /></div> : error ? <p className="text-red-500 text-center">{error}</p> : <TenantRequestList requests={requests} onApprove={onApprove} onReject={onReject} />}
        </div>
    </>
);

export default RequestsView;
