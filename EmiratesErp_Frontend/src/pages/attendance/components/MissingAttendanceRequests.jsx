import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Check, X, FileClock, Loader, AlertCircle, Search, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const statusStyles = {
    PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', icon: FileClock },
    APPROVED: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', icon: Check },
    REJECTED: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20', icon: X },
    CANCELLED: { bg: 'bg-background-muted', text: 'text-foreground-muted', border: 'border-border', icon: X },
};

const MissingAttendanceRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('PENDING');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingAttachment, setViewingAttachment] = useState(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/missing-attendance/requests`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setRequests(response.data.sort((a, b) => new Date(b.requestDate || b.attendanceDate) - new Date(a.requestDate || a.attendanceDate)));
        } catch (err) {
            setError('Failed to fetch missing attendance requests.');
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAction = async (requestId, status) => {
        let approverRemarks = '';
        if (status === 'REJECTED') {
            approverRemarks = prompt("Please provide a reason for rejection (optional):");
            if (approverRemarks === null) return;
        }

        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/missing-attendance/requests/${requestId}/approval`, { status, approverRemarks }, { headers: { "Authorization": `Bearer ${token}` } });
            fetchRequests();
        } catch (err) {
            alert(`Failed to ${status.toLowerCase()} request.`);
        }
    };

    const handleViewAttachment = async (request) => {
        if (!request.attachmentPath) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/missing-attendance/requests/${request.id}/attachment`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob'
            });
            const fileURL = URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
            setViewingAttachment(fileURL);
        } catch (err) {
            alert("Could not load the attachment.");
        }
    };

    const counts = useMemo(() => {
        const res = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
        requests.forEach(r => {
            if (res[r.status] !== undefined) res[r.status]++;
        });
        return res;
    }, [requests]);

    const filteredRequests = useMemo(() => {
        let filtered = requests.filter(req => req.status === activeTab);
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = filtered.filter(req =>
                (req.employee?.firstName?.toLowerCase() || '').includes(lowercasedFilter) ||
                (req.employee?.lastName?.toLowerCase() || '').includes(lowercasedFilter) ||
                (req.employee?.employeeCode?.toLowerCase() || '').includes(lowercasedFilter)
            );
        }
        return filtered;
    }, [requests, activeTab, searchTerm]);

    const TABS = ['PENDING', 'APPROVED', 'REJECTED'];

    return (
        <div className="space-y-4 text-foreground bg-background min-h-full w-full pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-border/60">
                <div className="flex items-center gap-1 border-b border-border sm:border-b-0 w-full sm:w-auto">
                    {TABS.map(tab => {
                        const count = counts[tab] || 0;
                        const label = tab.charAt(0) + tab.slice(1).toLowerCase();
                        return (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)} 
                                className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-foreground-muted hover:text-foreground'}`}
                            >
                                <span>{label}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === tab ? 'bg-primary/10 text-primary' : 'bg-background-muted text-foreground-muted'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
                    <input 
                        type="text" 
                        placeholder="Search by employee..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all" 
                    />
                </div>
            </div>

            {error && (
                <div className="bg-error/10 border border-error/20 text-error px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-card rounded-2xl shadow-xs border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-background-muted/70 border-b border-border text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                            <tr>
                                <th className="px-4 py-2.5">Employee</th>
                                <th className="px-4 py-2.5">Date</th>
                                <th className="px-4 py-2.5">Requested Times</th>
                                <th className="px-4 py-2.5">Reason</th>
                                <th className="px-4 py-2.5">Status</th>
                                <th className="px-4 py-2.5">Attachment</th>
                                <th className="px-4 py-2.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12">
                                        <Loader className="h-6 w-6 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredRequests.length > 0 ? (
                                filteredRequests.map(req => {
                                    const style = statusStyles[req.status] || statusStyles.PENDING;
                                    const IconComp = style.icon;
                                    return (
                                        <tr key={req.id} className="hover:bg-background-muted/50 transition-colors">
                                            <td className="px-4 py-2.5">
                                                <div className="font-bold text-foreground">{req.employee?.firstName} {req.employee?.lastName}</div>
                                                <div className="text-[10px] text-foreground-muted font-mono">{req.employee?.employeeCode}</div>
                                            </td>
                                            <td className="px-4 py-2.5 text-foreground font-semibold text-xs">
                                                {new Date(req.attendanceDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2.5 font-mono text-[11px] text-foreground">
                                                {req.requestedCheckIn || '-'} to {req.requestedCheckOut || '-'}
                                            </td>
                                            <td className="px-4 py-2.5 text-[11px] text-foreground-muted max-w-xs truncate" title={req.reason}>
                                                {req.reason || '-'}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${style.bg} ${style.text} ${style.border}`}>
                                                    <IconComp className="h-3 w-3" />
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                {req.attachmentPath && (
                                                    <button 
                                                        onClick={() => handleViewAttachment(req)} 
                                                        className="text-primary hover:bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Eye size={13} /> View
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                {req.status === 'PENDING' && (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button 
                                                            onClick={() => handleAction(req.id, 'REJECTED')} 
                                                            className="p-1 text-foreground-muted hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" 
                                                            title="Reject Request"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAction(req.id, 'APPROVED')} 
                                                            className="p-1 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer" 
                                                            title="Approve Request"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-foreground-muted">
                                        <FileClock className="mx-auto h-8 w-8 text-foreground-muted/40 mb-2" />
                                        <h3 className="text-xs font-bold text-foreground">No requests found</h3>
                                        <p className="mt-1 text-[11px] max-w-xs mx-auto text-foreground-muted">
                                            There are no missing attendance requests currently awaiting your review for this category.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {viewingAttachment && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex justify-center items-center p-4" onClick={() => setViewingAttachment(null)}>
                    <div className="bg-card p-4 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] border border-border flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center pb-3 border-b border-border">
                            <h3 className="text-xs font-bold text-foreground">View Attendance Attachment</h3>
                            <button onClick={() => setViewingAttachment(null)} className="p-1 rounded-lg text-foreground-muted hover:bg-background-muted transition-colors cursor-pointer">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto bg-background rounded-xl p-4 flex justify-center items-center mt-3">
                            <img src={viewingAttachment} alt="Attachment" className="max-w-full max-h-[65vh] shadow-md rounded-xl object-contain" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MissingAttendanceRequests;
