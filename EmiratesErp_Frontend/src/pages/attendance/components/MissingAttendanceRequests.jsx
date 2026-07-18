import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Check, X, FileClock, Loader, AlertCircle, Search, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const statusStyles = {
    PENDING: { bg: 'bg-warning/10', text: 'text-warning', icon: FileClock },
    APPROVED: { bg: 'bg-success/10', text: 'text-success', icon: Check },
    REJECTED: { bg: 'bg-error/10', text: 'text-error', icon: X },
    CANCELLED: { bg: 'bg-background-muted', text: 'text-foreground-muted', icon: X },
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
            setRequests(response.data.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)));
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
            if (approverRemarks === null) return; // User cancelled prompt
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
        <>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex border-b border-border">
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-foreground-muted hover:text-foreground'}`}>
                            {tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-64">
                    <input type="text" placeholder="Search by employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input w-full pr-10 bg-card border-border rounded-theme text-foreground" />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                </div>
            </div>

            {error && <div className="text-center text-error p-4 bg-error/10 border border-error/20 rounded-theme mb-4 font-medium flex items-center justify-center gap-2"><AlertCircle className="h-5 w-5" />{error}</div>}

            <div className="overflow-x-auto bg-card rounded-theme border border-border shadow-sm">
                <table className="min-w-full">
                    <thead className="bg-background-muted">
                        <tr>
                            <th className="th-cell text-foreground-muted uppercase text-[10px] tracking-wider">Employee</th>
                            <th className="th-cell text-foreground-muted uppercase text-[10px] tracking-wider">Date</th>
                            <th className="th-cell text-foreground-muted uppercase text-[10px] tracking-wider">Requested Times</th>
                            <th className="th-cell text-foreground-muted uppercase text-[10px] tracking-wider">Reason</th>
                            <th className="th-cell text-foreground-muted uppercase text-[10px] tracking-wider">Status</th>
                            <th className="th-cell text-foreground-muted uppercase text-[10px] tracking-wider">Attachment</th>
                            <th className="th-cell text-foreground-muted uppercase text-[10px] tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-10"><Loader className="h-8 w-8 animate-spin text-primary mx-auto" /></td></tr>
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map(req => (
                                <tr key={req.id} className="hover:bg-background-muted transition-colors">
                                    <td className="td-cell"><div className="font-bold text-foreground">{req.employee?.firstName} {req.employee?.lastName}</div><div className="text-xs text-foreground-muted">{req.employee?.employeeCode}</div></td>
                                    <td className="td-cell text-foreground font-medium">{new Date(req.attendanceDate).toLocaleDateString()}</td>
                                    <td className="td-cell text-sm font-mono text-foreground">{req.requestedCheckIn || '-'} to {req.requestedCheckOut || '-'}</td>
                                    <td className="td-cell text-sm text-foreground-muted max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                    <td className="td-cell">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase rounded-full border ${statusStyles[req.status]?.bg} ${statusStyles[req.status]?.text} border-current/20`}>
                                            {React.createElement(statusStyles[req.status].icon, { className: "h-3 w-3" })}
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="td-cell">{req.attachmentPath && <button onClick={() => handleViewAttachment(req)} className="text-primary hover:text-primary-foreground hover:bg-primary px-2 py-1 rounded-theme transition-all text-xs flex items-center gap-1"><Eye size={14} /> View</button>}</td>
                                    <td className="td-cell text-right">{req.status === 'PENDING' && <div className="flex items-center justify-end gap-1"><button onClick={() => handleAction(req.id, 'REJECTED')} className="p-2 text-foreground-muted hover:text-error hover:bg-error/10 rounded-full transition-colors" title="Reject"><X className="h-4 w-4" /></button><button onClick={() => handleAction(req.id, 'APPROVED')} className="p-2 text-foreground-muted hover:text-success hover:bg-success/10 rounded-full transition-colors" title="Approve"><Check className="h-4 w-4" /></button></div>}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" className="text-center py-20 text-foreground-muted"><FileClock className="mx-auto h-16 w-16 opacity-10 mb-4" /><h3 className="text-lg font-bold text-foreground">No requests found</h3><p className="mt-1 text-sm max-w-xs mx-auto">There are no missing attendance requests currently awaiting your review for this category.</p></td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {viewingAttachment && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center items-center p-4 transition-all" onClick={() => setViewingAttachment(null)}>
                    <div className="bg-card p-4 rounded-theme shadow-2xl max-w-4xl w-full max-h-[90vh] border border-border flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
                            <h3 className="font-bold text-foreground">View Attachment</h3>
                            <button onClick={() => setViewingAttachment(null)} className="p-2 rounded-full text-foreground-muted hover:bg-background-muted transition-colors"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-auto bg-background rounded-theme p-4 flex justify-center items-center">
                            <img src={viewingAttachment} alt="Attachment" className="max-w-full max-h-[70vh] shadow-lg rounded-theme object-contain" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default MissingAttendanceRequests;
