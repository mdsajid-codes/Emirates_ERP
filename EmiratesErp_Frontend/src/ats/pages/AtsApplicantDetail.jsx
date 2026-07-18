import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Loader2, 
    ArrowLeft, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar,
    Briefcase,
    GraduationCap,
    Award,
    Languages,
    FileText,
    ShieldAlert,
    Edit3,
    Trash2,
    CheckCircle,
    UserCheck,
    AlertCircle
} from 'lucide-react';
import AtsEducationTab from '../components/AtsEducationTab';
import AtsWorkExpTab from '../components/AtsWorkExpTab';
import AtsCertificationTab from '../components/AtsCertificationTab';
import AtsLanguageTab from '../components/AtsLanguageTab';
import AtsDocumentTab from '../components/AtsDocumentTab';
import AtsApplicantForm from '../components/AtsApplicantForm';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsApplicantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [applicant, setApplicant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('Overview');
    
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchApplicantDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${API_URL}/ats/applicants/${id}`, { headers });
            setApplicant(res.data);
        } catch (err) {
            console.error("Error loading applicant profile:", err);
            setError("Failed to load candidate profile details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchApplicantDetails();
        }
    }, [id]);

    const handleSaveApplicant = async (payload) => {
        setFormLoading(true);
        try {
            await axios.put(`${API_URL}/ats/applicants/${id}`, payload, { headers });
            toast.success("Profile details updated.");
            setSidebarOpen(false);
            fetchApplicantDetails();
        } catch (err) {
            console.error("Save error", err);
            toast.error(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this applicant?")) return;
        try {
            await axios.delete(`${API_URL}/ats/applicants/${id}`, { headers });
            toast.success("Applicant deleted.");
            navigate('/ats-dashboard/applicants');
        } catch (err) {
            toast.error("Failed to delete applicant.");
        }
    };

    const handleBlacklist = async () => {
        const reason = window.prompt("Reason for blacklisting this applicant:");
        if (reason === null) return;
        try {
            await axios.post(`${API_URL}/ats/applicants/${id}/blacklist?reason=${encodeURIComponent(reason)}`, {}, { headers });
            toast.warn("Applicant has been blacklisted.");
            fetchApplicantDetails();
        } catch (err) {
            toast.error("Failed to blacklist applicant.");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'NEW_LEAD': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'ON_HOLD': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'PLACED': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'BLACKLISTED': return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'ARCHIVED': return 'bg-slate-100 text-slate-800 border-slate-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
        );
    }

    if (error || !applicant) {
        return (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-theme flex items-center gap-3">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">{error || "Candidate not found."}</p>
            </div>
        );
    }

    const tabs = [
        { name: 'Overview', icon: Briefcase },
        { name: 'Education', icon: GraduationCap },
        { name: 'Work History', icon: Briefcase },
        { name: 'Certifications', icon: Award },
        { name: 'Languages', icon: Languages },
        { name: 'Documents', icon: FileText }
    ];

    return (
        <div className="space-y-6">
            {/* Header / Back Action */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/ats-dashboard/applicants')} className="p-2 bg-card border border-border hover:bg-background-muted rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5 text-foreground-muted" />
                </button>
                <div>
                    <span className="text-xs text-foreground-muted font-semibold tracking-wider uppercase">Applicant Profile</span>
                    <h2 className="text-xl font-bold text-foreground">
                        {applicant.firstName} {applicant.lastName}
                    </h2>
                </div>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-card border border-border rounded-theme p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    {applicant.photoUrl ? (
                        <img 
                            src={applicant.photoUrl} 
                            alt={applicant.firstName} 
                            className="h-20 w-20 rounded-full object-cover border border-border"
                        />
                    ) : (
                        <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-3xl text-primary">
                            {applicant.firstName.charAt(0)}{applicant.lastName.charAt(0)}
                        </div>
                    )}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-2xl font-bold text-foreground">{applicant.firstName} {applicant.lastName}</h3>
                            <span className={`px-2.5 py-0.5 text-xs font-bold border rounded-full ${getStatusStyle(applicant.applicantStatus)}`}>
                                {applicant.applicantStatus.replace('_', ' ')}
                            </span>
                            {applicant.isBlacklisted && (
                                <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 rounded-full flex items-center gap-1">
                                    <ShieldAlert className="h-3 w-3" />
                                    Blacklisted
                                </span>
                            )}
                        </div>
                        <p className="text-sm font-semibold text-foreground-muted">{applicant.jobTitle}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted mt-2 pt-2 border-t border-border/60">
                            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-primary" /> {applicant.email}</span>
                            <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-primary" /> {applicant.mobileNumber || 'N/A'}</span>
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-primary" /> 
                                {applicant.address?.city && `${applicant.address.city}, `}
                                {applicant.address?.state && `${applicant.address.state}, `}
                                {applicant.address?.country}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Core Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-theme hover:bg-primary/90 flex items-center gap-1.5 shadow transition-all"
                    >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit Profile</span>
                    </button>
                    {!applicant.isBlacklisted && (
                        <button 
                            onClick={handleBlacklist}
                            className="px-4 py-2 text-xs font-semibold bg-warning/10 hover:bg-warning/20 border border-warning/30 text-warning-foreground rounded-theme flex items-center gap-1.5 transition-all"
                        >
                            <ShieldAlert className="h-4 w-4" />
                            <span>Blacklist</span>
                        </button>
                    )}
                    <button 
                        onClick={handleDelete}
                        className="px-4 py-2 text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 text-destructive rounded-theme flex items-center gap-1.5 transition-all"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                    </button>
                </div>
            </div>

            {/* Content Tabs Navigation */}
            <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden">
                <nav className="flex border-b border-border overflow-x-auto bg-background/50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold border-b-2 outline-none transition-all whitespace-nowrap ${
                                activeTab === tab.name 
                                    ? 'border-primary text-primary bg-background/80 font-extrabold' 
                                    : 'border-transparent text-foreground-muted hover:text-foreground hover:bg-background/20'
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 bg-card">
                    {/* Overview Tab */}
                    {activeTab === 'Overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
                            {/* Left Column: Bio Details */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-foreground">Personal Details</h3>
                                <div className="grid grid-cols-2 gap-y-4 text-sm">
                                    <div>
                                        <p className="text-xs text-foreground-muted font-semibold">Salutation</p>
                                        <p className="font-medium text-foreground mt-0.5">{applicant.salutation || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground-muted font-semibold">Full Name</p>
                                        <p className="font-medium text-foreground mt-0.5">{applicant.firstName} {applicant.middleName} {applicant.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground-muted font-semibold">Nick Name</p>
                                        <p className="font-medium text-foreground mt-0.5">{applicant.nickName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground-muted font-semibold">Aadhaar / National ID</p>
                                        <p className="font-medium text-foreground mt-0.5">{applicant.aadharNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground-muted font-semibold">Gender</p>
                                        <p className="font-medium text-foreground mt-0.5">{applicant.gender || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground-muted font-semibold">Nationality</p>
                                        <p className="font-medium text-foreground mt-0.5">{applicant.nationality || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border">
                                    <h3 className="text-lg font-bold text-foreground">Contact details</h3>
                                    <div className="grid grid-cols-2 gap-y-4 text-sm mt-4">
                                        <div>
                                            <p className="text-xs text-foreground-muted font-semibold">Alternate Email</p>
                                            <p className="font-medium text-foreground mt-0.5">{applicant.alternateEmail || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-foreground-muted font-semibold">Home Phone</p>
                                            <p className="font-medium text-foreground mt-0.5">{applicant.homePhone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-foreground-muted font-semibold">Work Phone</p>
                                            <p className="font-medium text-foreground mt-0.5">{applicant.workPhone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-foreground-muted font-semibold">Skype ID</p>
                                            <p className="font-medium text-foreground mt-0.5">{applicant.skypeId || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Experience/Work Auth/EEO details */}
                            <div className="space-y-6 md:pl-8 pt-6 md:pt-0">
                                <h3 className="text-lg font-bold text-foreground">Recruitment & Auth</h3>
                                <div className="grid grid-cols-2 gap-y-4 text-sm">
                                    <div>
                                        <p className="text-xs text-foreground-muted font-semibold">Notice Period</p>
                                        <p className="font-medium text-foreground mt-0.5">{applicant.noticePeriod}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground-muted font-semibold">Source</p>
                                        <p className="font-medium text-foreground mt-0.5">{applicant.source}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground-muted font-semibold">Total Experience</p>
                                        <p className="font-medium text-foreground mt-0.5">{applicant.experienceYears} Years {applicant.experienceMonths} Months</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground-muted font-semibold">Willing to Relocate?</p>
                                        <p className="font-medium text-foreground mt-0.5">{applicant.willingToRelocate ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground-muted font-semibold">Expected Pay</p>
                                        <p className="font-medium text-foreground mt-0.5">
                                            {applicant.expectedPayAmount ? `${applicant.expectedPayAmount} ${applicant.expectedPayCurrency} (${applicant.expectedPayPeriod})` : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground-muted font-semibold">Tax Terms</p>
                                        <p className="font-medium text-foreground mt-0.5">{applicant.taxTerms || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border">
                                    <h3 className="text-lg font-bold text-foreground">Work Authorization</h3>
                                    <div className="grid grid-cols-2 gap-y-4 text-sm mt-4">
                                        <div>
                                            <p className="text-xs text-foreground-muted font-semibold">Authorization Type</p>
                                            <p className="font-medium text-foreground mt-0.5">{applicant.workAuthorization}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-foreground-muted font-semibold">Expiry Date</p>
                                            <p className="font-medium text-foreground mt-0.5">{applicant.workAuthExpiry || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-foreground-muted font-semibold">Security Clearance</p>
                                            <p className="font-medium text-foreground mt-0.5">{applicant.hasClearance ? 'Yes' : 'No'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border">
                                    <h3 className="text-lg font-bold text-foreground">Skills & Comments</h3>
                                    <div className="space-y-3 mt-4 text-sm">
                                        <div>
                                            <p className="text-xs text-foreground-muted font-semibold">Primary Skills</p>
                                            <p className="font-medium text-foreground mt-0.5">{applicant.primarySkills || 'None listed'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-foreground-muted font-semibold">Technology Stack</p>
                                            <p className="font-medium text-foreground mt-0.5">{applicant.technology || 'None listed'}</p>
                                        </div>
                                        {applicant.additionalComments && (
                                            <div>
                                                <p className="text-xs text-foreground-muted font-semibold">Comments</p>
                                                <p className="font-medium text-foreground-muted mt-1 bg-background-muted p-3 border border-border rounded whitespace-pre-wrap">{applicant.additionalComments}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Education Tab */}
                    {activeTab === 'Education' && <AtsEducationTab applicantId={id} />}

                    {/* Work History Tab */}
                    {activeTab === 'Work History' && <AtsWorkExpTab applicantId={id} />}

                    {/* Certifications Tab */}
                    {activeTab === 'Certifications' && <AtsCertificationTab applicantId={id} />}

                    {/* Languages Tab */}
                    {activeTab === 'Languages' && <AtsLanguageTab applicantId={id} />}

                    {/* Documents Tab */}
                    {activeTab === 'Documents' && <AtsDocumentTab applicantId={id} />}
                </div>
            </div>

            {/* Slide-over Profile Editor */}
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
                                item={applicant} 
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

export default AtsApplicantDetail;
