import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Check, X, FileClock, Loader, Activity } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const statusStyles = {
    SUBMITTED: { style: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: FileClock },
    APPROVED: { style: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: Check },
    REJECTED: { style: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: X },
    ACTIVE: { style: 'bg-primary/10 text-primary border-primary/20', icon: Activity },
    COMPLETED: { style: 'bg-foreground-muted/10 text-foreground-muted border-border', icon: Check },
};

const formatCurrency = (amount, currency = 'AED') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
    }).format(amount || 0);
};

const AllLoanRequests = ({ searchTerm = "" }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('SUBMITTED');

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/employee-loans`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setRequests(response.data.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)));
        } catch (err) {
            setError('Failed to fetch loan requests.');
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAction = async (loanId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this loan request?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/employee-loans/${loanId}/${action}`, {}, { headers: { "Authorization": `Bearer ${token}` } });
            fetchRequests();
        } catch (err) {
            alert(`Failed to ${action} loan request.`);
        }
    };

    const filteredRequests = useMemo(() => {
        let filtered = requests.filter(req => req.status === activeTab);
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(req =>
                (req.employeeName?.toLowerCase() || '').includes(lowercasedFilter) ||
                (req.employeeCode?.toLowerCase() || '').includes(lowercasedFilter)
            );
        }
        return filtered;
    }, [requests, activeTab, searchTerm]);

    const TABS = ['SUBMITTED', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED'];

    return (
        <div className="space-y-3">
            <div className="border-b border-border pb-0.5">
                <nav className="-mb-px flex space-x-3 overflow-x-auto" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap py-1.5 px-0.5 border-b-2 font-medium text-[11px] transition-colors ${
                                activeTab === tab
                                    ? 'border-primary text-primary font-bold'
                                    : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
                            }`}
                        >
                            {tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </button>
                    ))}
                </nav>
            </div>

            {error && <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-md border border-rose-500/20">{error}</div>}

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full bg-card text-foreground divide-y divide-border">
                    <thead className="bg-background-muted/60">
                        <tr>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Employee</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Loan Product</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Amount</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Installments</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                            <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-8"><Loader className="h-6 w-6 animate-spin text-primary mx-auto" /></td></tr>
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map(req => (
                                <tr key={req.id} className="hover:bg-background-muted/40 transition-colors">
                                    <td className="px-3 py-2 text-xs">
                                        <div className="font-semibold text-foreground">{req.employeeName || 'N/A'}</div>
                                        <div className="text-[10px] text-foreground-muted">{req.employeeCode || 'N/A'}</div>
                                    </td>
                                    <td className="px-3 py-2 text-xs font-medium text-foreground">{req.loanProductName}</td>
                                    <td className="px-3 py-2 text-xs font-medium text-foreground">{formatCurrency(req.loanAmount)}</td>
                                    <td className="px-3 py-2 text-xs text-foreground-muted">{req.totalInstallments}</td>
                                    <td className="px-3 py-2 text-xs">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border capitalize ${statusStyles[req.status]?.style || 'bg-background-muted text-foreground-muted border-border'}`}>
                                            {statusStyles[req.status]?.icon && React.createElement(statusStyles[req.status].icon, { className: "h-3 w-3" })}
                                            {req.status?.toLowerCase()}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-xs text-right whitespace-nowrap">
                                        {req.status === 'SUBMITTED' && (
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleAction(req.id, 'approve')} className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded-md transition-colors border border-border bg-background" title="Approve"><Check className="h-3.5 w-3.5" /></button>
                                                <button onClick={() => handleAction(req.id, 'reject')} className="p-1 text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors border border-border bg-background" title="Reject"><X className="h-3.5 w-3.5" /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-foreground-muted text-xs">
                                    <FileClock className="mx-auto h-7 w-7 text-foreground-muted/40 mb-1" />
                                    <h3 className="text-xs font-bold text-foreground">No requests found</h3>
                                    <p className="text-[11px] text-foreground-muted">There are no loan requests matching your criteria.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllLoanRequests;