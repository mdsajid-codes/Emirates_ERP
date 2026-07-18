import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { 
    Plus, 
    Search, 
    Filter, 
    Loader2, 
    MoreVertical, 
    Eye, 
    Edit, 
    Trash2, 
    ShieldAlert, 
    ChevronLeft, 
    ChevronRight,
    AlertCircle,
    UserCheck,
    UploadCloud,
    UserPlus,
    Cloud,
    Files,
    Archive,
    ArrowLeft
} from 'lucide-react';
import AtsApplicantForm from '../components/AtsApplicantForm';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsApplicants = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('list');
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    // Filter states
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');

    // Pagination states
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const fetchApplicants = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            
            // Build URL with params
            let url = `${API_URL}/ats/applicants?page=${page}&size=${pageSize}&sort=createdAt,desc`;
            
            const response = await axios.get(url, { headers });
            
            let dataList = response.data.content || response.data || [];
            
            // Apply client side search/filters if they exist
            if (search) {
                const term = search.toLowerCase();
                dataList = dataList.filter(a => 
                    (a.firstName && a.firstName.toLowerCase().includes(term)) ||
                    (a.lastName && a.lastName.toLowerCase().includes(term)) ||
                    (a.email && a.email.toLowerCase().includes(term)) ||
                    (a.jobTitle && a.jobTitle.toLowerCase().includes(term))
                );
            }
            if (statusFilter) {
                dataList = dataList.filter(a => a.applicantStatus === statusFilter);
            }
            if (sourceFilter) {
                dataList = dataList.filter(a => a.source === sourceFilter);
            }

            setApplicants(dataList);
            setTotalPages(response.data.totalPages || 1);
        } catch (err) {
            console.error("Error fetching applicants:", err);
            setError("Failed to fetch applicant profiles.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplicants();
    }, [page, statusFilter, sourceFilter, pageSize]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchApplicants();
    };

    const handleSaveApplicant = async (payload) => {
        setFormLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            
            if (selectedApplicant) {
                // Update
                await axios.put(`${API_URL}/ats/applicants/${selectedApplicant.id}`, payload, { headers });
                toast.success("Applicant updated successfully!");
            } else {
                // Create
                await axios.post(`${API_URL}/ats/applicants`, payload, { headers });
                toast.success("Applicant created successfully!");
            }
            setSidebarOpen(false);
            fetchApplicants();
        } catch (err) {
            console.error("Error saving applicant:", err);
            toast.error(err.response?.data?.message || "Failed to save applicant.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this applicant? This action cannot be undone.")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/ats/applicants/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            toast.success("Applicant deleted.");
            fetchApplicants();
        } catch (err) {
            console.error("Failed to delete", err);
            toast.error("Failed to delete applicant.");
        }
    };

    const handleBlacklist = async (id) => {
        const reason = window.prompt("Please enter the reason for blacklisting this applicant:");
        if (reason === null) return; // cancelled
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/ats/applicants/${id}/blacklist?reason=${encodeURIComponent(reason)}`, {}, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            toast.warn("Applicant has been blacklisted.");
            fetchApplicants();
        } catch (err) {
            console.error("Failed to blacklist", err);
            toast.error("Failed to blacklist applicant.");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'NEW_LEAD': return 'bg-blue-100 text-blue-800';
            case 'ACTIVE': return 'bg-emerald-100 text-emerald-800';
            case 'ON_HOLD': return 'bg-amber-100 text-amber-800';
            case 'PLACED': return 'bg-purple-100 text-purple-800';
            case 'BLACKLISTED': return 'bg-rose-100 text-rose-800';
            case 'ARCHIVED': return 'bg-slate-100 text-slate-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (viewMode === 'onboarding') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[75vh] p-4 bg-background">
                <div className="max-w-4xl w-full text-center space-y-8 py-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">Add New Candidate</h1>
                        <p className="text-sm text-foreground-muted mt-2 max-w-lg mx-auto">
                            Import resumes automatically from your files, connect cloud storage, or enter candidate profiles manually.
                        </p>
                    </div>

                    {/* Onboarding grid matching exact specifications */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 1. Parse Resume (Bright Blue) */}
                        <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/ats-dashboard/applicants/add?parse=true')}
                            className="flex flex-col items-center justify-center p-6 bg-[#0284c7] hover:bg-[#0284c7]/95 text-white rounded-xl shadow-md transition-all h-36 border border-sky-400/20"
                        >
                            <UploadCloud className="h-10 w-10 mb-3" />
                            <span className="font-bold text-sm">Parse Resume</span>
                        </motion.button>

                        {/* 2. Manual Creation (Bright Green) */}
                        <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/ats-dashboard/applicants/add')}
                            className="flex flex-col items-center justify-center p-6 bg-[#22c55e] hover:bg-[#22c55e]/95 text-white rounded-xl shadow-md transition-all h-36 border border-green-400/20"
                        >
                            <UserPlus className="h-10 w-10 mb-3" />
                            <span className="font-bold text-sm">Manual Creation</span>
                        </motion.button>

                        {/* 3. Drop Box (Slate Gray) */}
                        <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toast.info("Dropbox storage sync is coming soon.")}
                            className="flex flex-col items-center justify-center p-6 bg-[#64748b] hover:bg-[#64748b]/95 text-white rounded-xl shadow-md transition-all h-36 border border-slate-400/20"
                        >
                            <Archive className="h-10 w-10 mb-3" />
                            <span className="font-bold text-sm">Drop Box</span>
                        </motion.button>

                        {/* 4. Box (Purple) */}
                        <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toast.info("Box storage integration is coming soon.")}
                            className="flex flex-col items-center justify-center p-6 bg-[#a855f7] hover:bg-[#a855f7]/95 text-white rounded-xl shadow-md transition-all h-36 border border-purple-400/20"
                        >
                            <Archive className="h-10 w-10 mb-3" />
                            <span className="font-bold text-sm">Box</span>
                        </motion.button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
                        {/* 5. OneDrive (Dark Blue) */}
                        <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toast.info("OneDrive cloud storage sync is coming soon.")}
                            className="flex-1 flex flex-col items-center justify-center p-6 bg-[#1e40af] hover:bg-[#1e40af]/95 text-white rounded-xl shadow-md transition-all h-36 border border-blue-600/20"
                        >
                            <Cloud className="h-10 w-10 mb-3" />
                            <span className="font-bold text-sm">OneDrive</span>
                        </motion.button>

                        {/* 6. Bulk Parsing (Pink) */}
                        <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toast.info("Bulk folder resume parsing is coming soon.")}
                            className="flex-1 flex flex-col items-center justify-center p-6 bg-[#ec4899] hover:bg-[#ec4899]/95 text-white rounded-xl shadow-md transition-all h-36 border border-pink-400/20"
                        >
                            <Files className="h-10 w-10 mb-3" />
                            <span className="font-bold text-sm">Bulk Parsing</span>
                        </motion.button>
                    </div>

                    <div className="pt-6 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 text-xs text-foreground-muted bg-background-muted px-4 py-2.5 rounded-full border border-border">
                            <span className="text-blue-500 font-bold">ℹ️</span>
                            <span>Save time by importing your information into our system automatically</span>
                        </div>

                        <button
                            onClick={() => setViewMode('list')}
                            className="text-xs sm:text-sm font-bold text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-full border border-primary/10 tracking-wide"
                        >
                            Skip & View Candidates Directory &rarr;
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setViewMode('onboarding')}
                        className="p-2 border border-border rounded-full hover:bg-background-muted transition-colors bg-card shadow-sm"
                        title="Back to Selection"
                    >
                        <ArrowLeft className="h-4 w-4 text-foreground" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Applicants Directory</h1>
                        <p className="text-sm text-foreground-muted">Manage recruitment candidates, evaluate submissions, and screen details.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setViewMode('onboarding')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-theme shadow hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Applicant</span>
                </button>
            </header>

            {/* Filter Bar */}
            <div className="bg-card border border-border p-4 rounded-theme shadow-sm">
                <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[240px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or job title..." 
                            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-foreground"
                        />
                    </div>
                    <div className="w-full sm:w-auto flex items-center gap-3">
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-foreground min-w-[140px]"
                        >
                            <option value="">All Statuses</option>
                            <option value="NEW_LEAD">New Lead</option>
                            <option value="ACTIVE">Active</option>
                            <option value="ON_HOLD">On Hold</option>
                            <option value="PLACED">Placed</option>
                            <option value="BLACKLISTED">Blacklisted</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>

                        <select 
                            value={sourceFilter} 
                            onChange={(e) => setSourceFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-foreground min-w-[140px]"
                        >
                            <option value="">All Sources</option>
                            <option value="MANUAL">Manual</option>
                            <option value="RESUME_IMPORT">Resume Import</option>
                            <option value="REFERRAL">Referral</option>
                            <option value="JOB_BOARD">Job Board</option>
                            <option value="LINKEDIN">LinkedIn</option>
                            <option value="VENDOR">Vendor</option>
                            <option value="OTHER">Other</option>
                        </select>

                        <button 
                            type="button" 
                            onClick={fetchApplicants}
                            className="px-4 py-2 bg-background border border-border hover:bg-background-muted text-sm font-semibold rounded-theme transition-colors flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filter</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* List/Table */}
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
            ) : error ? (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-theme flex items-center gap-3">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            ) : applicants.length === 0 ? (
                <div className="bg-card border border-border p-12 text-center rounded-theme shadow-sm">
                    <AlertCircle className="h-12 w-12 text-foreground-muted mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-foreground">No applicants found</h3>
                    <p className="text-sm text-foreground-muted mt-1">Try resetting your filters or add a new candidate profile.</p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-theme overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead className="bg-background-muted border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-foreground">SN</th>
                                    <th className="px-6 py-4 font-bold text-foreground">Name</th>
                                    <th className="px-6 py-4 font-bold text-foreground">Job Title</th>
                                    <th className="px-6 py-4 font-bold text-foreground">Email</th>
                                    <th className="px-6 py-4 font-bold text-foreground">Mobile</th>
                                    <th className="px-6 py-4 font-bold text-foreground">Source</th>
                                    <th className="px-6 py-4 font-bold text-foreground">Status</th>
                                    <th className="px-6 py-4 font-bold text-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {applicants.map((app, index) => (
                                    <tr key={app.id} className="hover:bg-background-muted/40 transition-colors">
                                        <td className="px-6 py-4 text-foreground-muted font-medium">
                                            {page * pageSize + index + 1}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-foreground cursor-pointer" onClick={() => navigate(`/ats-dashboard/applicants/${app.id}`)}>
                                            {app.fullName || `${app.firstName} ${app.lastName}`}
                                        </td>
                                        <td className="px-6 py-4 text-foreground-muted">{app.jobTitle}</td>
                                        <td className="px-6 py-4 text-foreground-muted">{app.email}</td>
                                        <td className="px-6 py-4 text-foreground-muted">{app.mobileNumber || 'N/A'}</td>
                                        <td className="px-6 py-4 text-foreground-muted font-medium">{app.source}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getStatusStyle(app.applicantStatus)}`}>
                                                {app.applicantStatus.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => navigate(`/ats-dashboard/applicants/${app.id}`)}
                                                    className="p-1.5 hover:bg-background border border-border text-foreground-muted hover:text-primary rounded-theme transition-all"
                                                    title="View Profile Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/ats-dashboard/applicants/add?id=${app.id}`)}
                                                    className="p-1.5 hover:bg-background border border-border text-foreground-muted hover:text-primary rounded-theme transition-all"
                                                    title="Edit Basic Details"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleBlacklist(app.id)}
                                                    className="p-1.5 hover:bg-background border border-border text-foreground-muted hover:text-warning rounded-theme transition-all"
                                                    title="Blacklist Candidate"
                                                >
                                                    <ShieldAlert className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(app.id)}
                                                    className="p-1.5 hover:bg-background border border-border text-foreground-muted hover:text-destructive rounded-theme transition-all"
                                                    title="Delete Profile"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-border bg-background-muted flex items-center justify-between">
                        <span className="text-xs text-foreground-muted font-medium">
                            Page {page + 1} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-2 border border-border rounded-theme bg-background hover:bg-background-muted text-foreground disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="p-2 border border-border rounded-theme bg-background hover:bg-background-muted text-foreground disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Slide-over Form Container */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            transition={{ duration: 0.2 }} 
                            className="fixed inset-0 bg-black/50 z-40" 
                            onClick={() => setSidebarOpen(false)} 
                        />
                        <motion.div
                            initial={{ x: '100%' }} 
                            animate={{ x: 0 }} 
                            exit={{ x: '100%' }} 
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-4xl bg-card text-card-foreground shadow-2xl z-50 overflow-hidden"
                        >
                            <AtsApplicantForm 
                                item={selectedApplicant} 
                                onSave={handleSaveApplicant} 
                                onCancel={() => setSidebarOpen(false)} 
                                loading={formLoading} 
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AtsApplicants;
