import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { 
    Search, 
    Send, 
    Trash2, 
    Loader2, 
    AlertTriangle,
    FileCheck,
    Mail
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const tabs = [
    { id: 'pending', label: 'Pending Consents' },
    { id: 'rejected', label: 'Rejected Consents' },
    { id: 'docs_pending', label: 'Documents Verification Pending' }
];

const AtsConsentDetails = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchConsents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/ats/consent`, {
                params: {
                    tab: activeTab,
                    search,
                    page,
                    size
                },
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = response.data;
            setItems(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            console.error("Failed to load consent details", err);
            toast.error("Failed to load consent data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(0);
    }, [activeTab]);

    useEffect(() => {
        fetchConsents();
    }, [activeTab, search, page, size]);

    const handleResendConsent = async (applicantId) => {
        if (!window.confirm("Are you sure you want to re-send the privacy consent email to this applicant?")) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/ats/consent/send/${applicantId}`, {}, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            toast.success("Consent email sent successfully!");
            fetchConsents();
        } catch (err) {
            console.error("Failed to send consent email", err);
            toast.error("Failed to send consent email.");
        }
    };

    const handleDeleteConsent = async (consentId) => {
        if (!window.confirm("Are you sure you want to delete this consent log entry?")) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/ats/consent/${consentId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            toast.success("Consent log entry deleted successfully.");
            fetchConsents();
        } catch (err) {
            console.error("Failed to delete consent entry", err);
            toast.error("Failed to delete consent entry.");
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            const d = new Date(isoString);
            return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return isoString;
        }
    };

    const getEmailStatusBadge = (status) => {
        switch (status) {
            case 'SENT':
                return <span className="px-2 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">SENT</span>;
            case 'FAILED':
                return <span className="px-2 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-100">FAILED</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100">PENDING</span>;
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Consent Details</h1>
                    <p className="text-xs text-foreground-muted">Track applicant GDPR privacy consent requests, delivery states, and verification logs.</p>
                </div>
            </header>

            {/* Tabs Navigation */}
            <div className="border-b border-border">
                <nav className="flex gap-6 -mb-px">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-xs font-bold uppercase transition-all relative ${
                                activeTab === tab.id 
                                    ? 'text-primary' 
                                    : 'text-foreground-muted hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* List Table Section */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
                        <input 
                            type="text"
                            placeholder="Search by name, email..."
                            value={search}
                            onChange={(e) => {
                                      setSearch(e.target.value);
                                      setPage(0);
                            }}
                            className="pl-9 pr-4 py-2 w-full bg-background border border-border rounded-theme text-sm focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-foreground-muted/50 font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground-muted">Show</span>
                        <select 
                            value={size} 
                            onChange={(e) => {
                                      setSize(Number(e.target.value));
                                      setPage(0);
                            }}
                            className="bg-background border border-border rounded-theme px-2 py-1 text-xs focus:ring-1 focus:ring-primary font-bold"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="text-xs font-semibold text-foreground-muted">entries</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="animate-spin h-8 w-8 text-primary" />
                            <span className="text-xs text-foreground-muted font-bold">Fetching records...</span>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-foreground-muted gap-2">
                            <AlertTriangle className="h-8 w-8 text-amber-500" />
                            <span className="text-sm font-bold">No consent records found.</span>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-background-muted/50 text-[11px] font-black text-foreground-muted tracking-wider uppercase">
                                    <th className="px-5 py-3.5 font-black">Applicant ID</th>
                                    <th className="px-5 py-3.5 font-black">Applicant Name</th>
                                    <th className="px-5 py-3.5 font-black">Source</th>
                                    <th className="px-5 py-3.5 font-black">Created By</th>
                                    <th className="px-5 py-3.5 font-black">Created On</th>
                                    {activeTab !== 'docs_pending' && <th className="px-5 py-3.5 font-black">Consent Sent On</th>}
                                    <th className="px-5 py-3.5 font-black">Email Address</th>
                                    {activeTab !== 'docs_pending' && <th className="px-5 py-3.5 font-black">Email Status</th>}
                                    {activeTab === 'rejected' && <th className="px-5 py-3.5 font-black">Rejection Reason</th>}
                                    {activeTab === 'docs_pending' && <th className="px-5 py-3.5 font-black">Doc Status</th>}
                                    {activeTab !== 'docs_pending' && <th className="px-5 py-3.5 font-black w-24">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-xs">
                                {items.map(item => (
                                    <tr key={item.consentId || item.applicantId} className="hover:bg-background-muted/20 transition-colors">
                                        <td className="px-5 py-4 font-bold text-primary">
                                            <NavLink to={`/ats-dashboard/applicants/${item.applicantId}`} className="hover:underline">
                                                {item.applicantId}
                                            </NavLink>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-foreground">
                                            {item.applicantName}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-foreground-muted uppercase">
                                            {item.source}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-foreground-muted">
                                            {item.createdBy}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-foreground-muted">
                                            {formatDate(item.createdOn)}
                                        </td>
                                        {activeTab !== 'docs_pending' && (
                                            <td className="px-5 py-4 font-medium text-foreground-muted">
                                                {formatDate(item.consentSentOn)}
                                            </td>
                                        )}
                                        <td className="px-5 py-4 font-medium text-foreground-muted">
                                            {item.email}
                                        </td>
                                        {activeTab !== 'docs_pending' && (
                                            <td className="px-5 py-4">
                                                {getEmailStatusBadge(item.emailStatus)}
                                            </td>
                                        )}
                                        {activeTab === 'rejected' && (
                                            <td className="px-5 py-4 font-medium text-foreground max-w-xs truncate">
                                                {item.rejectionReason || 'N/A'}
                                            </td>
                                        )}
                                        {activeTab === 'docs_pending' && (
                                            <td className="px-5 py-4">
                                                <span className="px-2 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100">DOCS PENDING</span>
                                            </td>
                                        )}
                                        {activeTab !== 'docs_pending' && (
                                            <td className="px-5 py-4 flex items-center gap-3">
                                                <button
                                                    onClick={() => handleResendConsent(item.applicantId)}
                                                    title="Re-send Email"
                                                    className="p-1 hover:bg-background rounded text-foreground-muted hover:text-primary transition-all"
                                                >
                                                    <Send className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteConsent(item.consentId)}
                                                    title="Delete Entry"
                                                    className="p-1 hover:bg-background rounded text-foreground-muted hover:text-rose-600 transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination footer */}
                {!loading && totalPages > 0 && (
                    <div className="p-4 border-t border-border flex flex-wrap items-center justify-between gap-4 bg-background-muted/30">
                        <span className="text-xs text-foreground-muted font-medium">
                            Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} entries
                        </span>
                        
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-2.5 py-1.5 border border-border rounded-theme text-xs font-semibold bg-card text-foreground-muted hover:bg-background-muted disabled:opacity-50 transition-all"
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`px-3 py-1.5 rounded-theme text-xs font-bold transition-all ${
                                        page === i 
                                            ? 'bg-primary text-primary-foreground shadow' 
                                            : 'border border-border bg-card text-foreground-muted hover:bg-background-muted'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="px-2.5 py-1.5 border border-border rounded-theme text-xs font-semibold bg-card text-foreground-muted hover:bg-background-muted disabled:opacity-50 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AtsConsentDetails;
