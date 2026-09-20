import React from 'react';
import { Check, X, Send, Monitor } from 'lucide-react';
import axios from 'axios';

// ── Status badge config ─────────────────────────────────────────────────────
const STATUS_BADGE = {
    PENDING:   { cls: 'bg-yellow-100 text-yellow-800', label: 'Pending'    },
    APPROVED:  { cls: 'bg-green-100  text-green-800',  label: 'Approved'   },
    REJECTED:  { cls: 'bg-red-100    text-red-800',    label: 'Rejected'   },
    DEMO_SENT: { cls: 'bg-blue-100   text-blue-800',   label: 'Demo Sent'  },
};

// ── Module badge (colour-coded by module name) ──────────────────────────────
const MODULE_BADGE_CLS = {
    POS:   'bg-teal-100   text-teal-800',
    HRMS:  'bg-purple-100 text-purple-800',
    CRM:   'bg-indigo-100 text-indigo-800',
    SALES: 'bg-orange-100 text-orange-800',
};
const getModuleCls = (mod) => MODULE_BADGE_CLS[mod?.toUpperCase()] ?? 'bg-slate-100 text-slate-700';

// ── Component ───────────────────────────────────────────────────────────────
const DemoRequestList = ({ requests, onRefresh }) => {
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const updateStatus = async (id, status) => {
        try {
            await axios.patch(
                `${API_URL}/master/demo-requests/${id}/status?status=${status}`,
                {},
                { headers }
            );
            onRefresh();
        } catch (err) {
            console.error('Failed to update demo request status:', err);
            alert(err?.response?.data?.message || 'Failed to update status. Please try again.');
        }
    };

    const deleteRequest = async (id) => {
        if (!window.confirm('Permanently delete this demo request? This cannot be undone.')) return;
        try {
            await axios.delete(`${API_URL}/master/demo-requests/${id}`, { headers });
            onRefresh();
        } catch (err) {
            console.error('Failed to delete demo request:', err);
        }
    };

    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-foreground-muted">
                <Monitor className="h-14 w-14 mb-3 opacity-20" />
                <p className="font-medium text-lg">No demo requests found.</p>
                <p className="text-sm opacity-70 mt-1">New requests from the website will appear here.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead className="bg-background-muted">
                    <tr>
                        {[
                            'Module', 'Name', 'Email', 'Company', 'Phone',
                            'Terminals', 'Business Type', 'Message',
                            'Status', 'Submitted', 'Actions'
                        ].map(h => (
                            <th key={h} className="th-cell whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-foreground-muted">
                    {requests.map(req => {
                        const badge  = STATUS_BADGE[req.status] ?? STATUS_BADGE.PENDING;
                        const modCls = getModuleCls(req.module);

                        return (
                            <tr
                                key={req.id}
                                className="border-b border-border hover:bg-background-muted transition-colors"
                            >
                                {/* Module */}
                                <td className="td-cell">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${modCls}`}>
                                        {req.module || 'POS'}
                                    </span>
                                </td>

                                {/* Basic info */}
                                <td className="td-cell font-semibold text-foreground whitespace-nowrap">{req.fullName}</td>
                                <td className="td-cell">{req.email}</td>
                                <td className="td-cell">{req.company || '—'}</td>
                                <td className="td-cell whitespace-nowrap">{req.phone || '—'}</td>
                                <td className="td-cell whitespace-nowrap">{req.terminals || '—'}</td>
                                <td className="td-cell whitespace-nowrap">{req.businessType || '—'}</td>

                                {/* Message — truncated */}
                                <td className="td-cell max-w-[180px]">
                                    <p
                                        className="truncate cursor-default"
                                        title={req.message || ''}
                                    >
                                        {req.message || '—'}
                                    </p>
                                </td>

                                {/* Status */}
                                <td className="td-cell">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                                        {badge.label}
                                    </span>
                                </td>

                                {/* Submitted date */}
                                <td className="td-cell text-xs whitespace-nowrap">
                                    {req.createdAt
                                        ? new Date(req.createdAt).toLocaleDateString('en-AE', {
                                              day: '2-digit',
                                              month: 'short',
                                              year: 'numeric',
                                          })
                                        : '—'}
                                </td>

                                {/* Actions */}
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {req.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(req.id, 'APPROVED')}
                                                    className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800
                                                               text-xs font-semibold rounded-full hover:bg-green-200 transition-colors"
                                                    title="Approve this demo request"
                                                >
                                                    <Check className="h-3 w-3" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(req.id, 'REJECTED')}
                                                    className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800
                                                               text-xs font-semibold rounded-full hover:bg-red-200 transition-colors"
                                                    title="Reject this demo request"
                                                >
                                                    <X className="h-3 w-3" /> Reject
                                                </button>
                                            </>
                                        )}
                                        {req.status === 'APPROVED' && (
                                            <button
                                                onClick={() => updateStatus(req.id, 'DEMO_SENT')}
                                                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800
                                                           text-xs font-semibold rounded-full hover:bg-blue-200 transition-colors"
                                                title="Mark demo credentials as sent"
                                            >
                                                <Send className="h-3 w-3" /> Mark Demo Sent
                                            </button>
                                        )}
                                        {/* Delete — always visible */}
                                        <button
                                            onClick={() => deleteRequest(req.id)}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50
                                                       rounded-full transition-colors"
                                            title="Permanently delete"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default DemoRequestList;
