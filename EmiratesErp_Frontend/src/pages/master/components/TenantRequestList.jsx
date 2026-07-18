import React from 'react';
import { Check, X } from 'lucide-react';

const TenantRequestList = ({ requests, onApprove, onReject }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full">
            <thead className="bg-background-muted">
                <tr>
                    <th className="th-cell">Requested ID</th>
                    <th className="th-cell">Company Name</th>
                    <th className="th-cell">Admin Email</th>
                    <th className="th-cell">Admin Password</th>
                    <th className="th-cell">Actions</th>
                </tr>
            </thead>
            <tbody className="text-foreground-muted">
                {requests.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="text-center py-10">No pending tenant requests.</td>
                    </tr>
                ) : (
                    requests.map(request => (
                        <tr key={request.id} className="border-b border-border hover:bg-background-muted">
                            <td className="td-cell font-medium text-foreground">{request.tenantId}</td>
                            <td className="td-cell">{request.companyName}</td>
                            <td className="td-cell">{request.adminEmail}</td>
                            <td className="td-cell">{request.adminPassword}</td>
                            <td className="py-3 px-4 flex items-center gap-2">
                                <button
                                    onClick={() => onApprove(request)}
                                    className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full hover:bg-green-200 transition-colors"
                                    title={`Approve ${request.tenantId}`}
                                >
                                    <Check className="h-3 w-3" /> Approve
                                </button>
                                <button
                                    onClick={() => onReject(request.id, request.tenantId)}
                                    className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full hover:bg-red-200 transition-colors"
                                    title={`Reject ${request.tenantId}`}
                                >
                                    <X className="h-3 w-3" /> Reject
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

export default TenantRequestList;
