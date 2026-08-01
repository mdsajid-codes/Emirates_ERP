import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Check, X, FileClock, Loader, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const statusStyles = {
    SUBMITTED: { style: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: FileClock },
    APPROVED: { style: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: Check },
    REJECTED: { style: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: X },
};

const formatCurrency = (amount, currency = 'AED') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
    }).format(amount || 0);
};

const AllExpenseRequests = ({ searchTerm = "" }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('SUBMITTED');
    const [viewingReceipt, setViewingReceipt] = useState(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/expenses`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setRequests(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            setError('Failed to fetch expense requests.');
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAction = async (expenseId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this expense?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/expenses/${expenseId}/${action}`, {}, { headers: { "Authorization": `Bearer ${token}` } });
            fetchRequests();
        } catch (err) {
            alert(`Failed to ${action} expense.`);
        }
    };

    const handleViewAttachment = (attachmentUrl) => {
        setViewingReceipt(attachmentUrl);
    };

    const filteredRequests = useMemo(() => {
        let filtered = requests.filter(req => req.status === activeTab);
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(req =>
                (req.employeeName?.toLowerCase() || '').includes(lowercasedFilter) ||
                (req.employeeCode?.toLowerCase() || '').includes(lowercasedFilter) ||
                (req.category?.toLowerCase() || '').includes(lowercasedFilter)
            );
        }
        return filtered;
    }, [requests, activeTab, searchTerm]);

    const TABS = ['SUBMITTED', 'APPROVED', 'REJECTED'];

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
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Category</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Amount</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Date</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Receipt</th>
                            <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-8"><Loader className="h-6 w-6 animate-spin text-primary mx-auto" /></td></tr>
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map(req => (
                                <tr key={req.id} className="hover:bg-background-muted/40 transition-colors">
                                    <td className="px-3 py-2 text-xs">
                                        <div className="font-semibold text-foreground">{req.employeeName || 'N/A'}</div>
                                        <div className="text-[10px] text-foreground-muted">{req.employeeCode || 'N/A'}</div>
                                    </td>
                                    <td className="px-3 py-2 text-xs font-medium text-foreground">{req.category}</td>
                                    <td className="px-3 py-2 text-xs font-medium text-foreground">{formatCurrency(req.amount)}</td>
                                    <td className="px-3 py-2 text-xs text-foreground-muted">{new Date(req.expenseDate).toLocaleDateString()}</td>
                                    <td className="px-3 py-2 text-xs">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border capitalize ${statusStyles[req.status]?.style || 'bg-background-muted text-foreground-muted border-border'}`}>
                                            {statusStyles[req.status]?.icon && React.createElement(statusStyles[req.status].icon, { className: "h-3 w-3" })}
                                            {req.status?.toLowerCase()}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-xs text-foreground-muted">
                                        {req.attachments && req.attachments.length > 0 ? (
                                            <div className="flex flex-col space-y-0.5">
                                                {req.attachments.map((attachment) => (
                                                    <button
                                                        key={attachment.id}
                                                        onClick={() => handleViewAttachment(attachment.viewUrl)}
                                                        className="text-primary hover:underline text-[11px] flex items-center gap-1"
                                                    ><Eye size={12} /><span className="truncate max-w-[120px]">{attachment.originalFilename}</span></button>
                                                ))}
                                            </div>
                                        ) : <span className="text-foreground-muted/60 text-[11px]">No attachments</span>}
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
                                <td colSpan="7" className="text-center py-8 text-foreground-muted text-xs">
                                    <FileClock className="mx-auto h-7 w-7 text-foreground-muted/40 mb-1" />
                                    <h3 className="text-xs font-bold text-foreground">No requests found</h3>
                                    <p className="text-[11px] text-foreground-muted">There are no expense requests matching your criteria.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {viewingReceipt && (
                <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4" onClick={() => setViewingReceipt(null)}>
                    <div className="bg-card p-2 rounded-lg max-w-4xl max-h-[90vh] border border-border" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end">
                            <button onClick={() => setViewingReceipt(null)} className="p-1.5 rounded-md hover:bg-background-muted text-foreground transition-colors mb-1">
                                <X size={16} />
                            </button>
                        </div>
                        <img src={viewingReceipt} alt="Expense Receipt" className="max-w-full max-h-[80vh] object-contain rounded-md" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllExpenseRequests;