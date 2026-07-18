import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
    User, 
    FileText, 
    GraduationCap, 
    Award, 
    Languages, 
    Briefcase, 
    Building2,
    Save, 
    RotateCcw,
    Lock,
    Loader2,
    Sparkles,
    Upload,
    X
} from 'lucide-react';
import { toast } from 'react-toastify';
import AtsApplicantForm from '../components/AtsApplicantForm';
import AtsDocumentTab from '../components/AtsDocumentTab';
import AtsEducationTab from '../components/AtsEducationTab';
import AtsCertificationTab from '../components/AtsCertificationTab';
import AtsLanguageTab from '../components/AtsLanguageTab';
import AtsWorkExpTab from '../components/AtsWorkExpTab';
import AtsEmployerTab from '../components/AtsEmployerTab';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AddApplicantPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryId = searchParams.get('id');

    const [activeTab, setActiveTab] = useState('personal');
    const [applicantId, setApplicantId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [applicantData, setApplicantData] = useState(null);

    // Initial draft form data state to support reset/refilling
    const [personalFormKey, setPersonalFormKey] = useState(0);

    // AI Resume Parser States
    const [parserModalOpen, setParserModalOpen] = useState(false);
    const [parserFile, setParserFile] = useState(null);
    const [parsing, setParsing] = useState(false);

    const handleResumeParse = async () => {
        if (!parserFile) {
            toast.error("Please choose a valid resume file first.");
            return;
        }
        setParsing(true);
        const formData = new FormData();
        formData.append("file", parserFile);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/ats/resume/parse`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            // Parse successfully completed! Map the response onto the edit object form
            const parsed = res.data;
            
            // Format address mappings safely
            const address = parsed.address || {};
            const mappedApplicant = {
                firstName: parsed.firstName || '',
                lastName: parsed.lastName || '',
                middleName: parsed.middleName || '',
                email: parsed.email || '',
                mobileNumber: parsed.mobileNumber || '',
                linkedinUrl: parsed.linkedinUrl || '',
                jobTitle: parsed.jobTitle || '',
                experienceYears: parsed.experienceYears || 0,
                primarySkills: parsed.primarySkills || '',
                nationality: parsed.nationality || '',
                address: {
                    street: address.street || '',
                    city: address.city || '',
                    state: address.state || '',
                    zip: address.zipCode || '',
                    country: address.country || ''
                }
            };

            setApplicantData(mappedApplicant);
            // Trigger state form key update to reload child input forms
            setPersonalFormKey(prev => prev + 1);
            setParserModalOpen(false);
            setParserFile(null);
            toast.success("Resume parsed successfully! Please review the pre-filled fields below.");
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Resume parsing failed. Check if an active AI Provider is configured under ATS configurations.";
            toast.error(msg);
        } finally {
            setParsing(false);
        }
    };

    const tabs = [
        { id: 'personal', name: 'Personal Details', icon: User, requiresId: false },
        { id: 'documents', name: 'Documents', icon: FileText, requiresId: true },
        { id: 'education', name: 'Education Details', icon: GraduationCap, requiresId: true },
        { id: 'certifications', name: 'Certifications', icon: Award, requiresId: true },
        { id: 'languages', name: 'Languages', icon: Languages, requiresId: true },
        { id: 'work', name: 'Work Experience', icon: Briefcase, requiresId: true },
        { id: 'employer', name: 'Employer Details', icon: Building2, requiresId: true }
    ];

    useEffect(() => {
        if (queryId) {
            setApplicantId(parseInt(queryId));
            const fetchProfile = async () => {
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const headers = { "Authorization": `Bearer ${token}` };
                    const res = await axios.get(`${API_URL}/ats/applicants/${queryId}`, { headers });
                    setApplicantData(res.data);
                } catch (e) {
                    console.error("Failed to load profile details", e);
                    toast.error("Failed to load profile details for editing.");
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        }
    }, [queryId]);

    useEffect(() => {
        if (searchParams.get('parse') === 'true') {
            setParserModalOpen(true);
        }
    }, [searchParams]);

    const handleSavePersonal = async (payload) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            
            let response;
            if (applicantId) {
                // Update if already created
                response = await axios.put(`${API_URL}/ats/applicants/${applicantId}`, payload, { headers });
                toast.success("Personal Details updated successfully!");
            } else {
                // Create
                response = await axios.post(`${API_URL}/ats/applicants`, payload, { headers });
                setApplicantId(response.data.id);
                toast.success("Applicant created! You can now fill additional details.");
            }
            setApplicantData(response.data);
            
            // Advance to next tab
            setActiveTab('documents');
        } catch (err) {
            console.error("Error saving applicant:", err);
            toast.error(err.response?.data?.message || "Failed to save Personal Details.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPersonal = () => {
        if (window.confirm("Are you sure you want to reset all Personal Details fields?")) {
            setPersonalFormKey(prev => prev + 1);
        }
    };

    const handleTabClick = (tab) => {
        if (tab.requiresId && !applicantId) {
            toast.warning("Please save Personal Details first to unlock other tabs.");
            return;
        }
        setActiveTab(tab.id);
    };

    return (
        <div className="fixed inset-0 bg-background flex flex-col z-50 text-foreground font-sans overflow-hidden">
            {/* Fixed Top Header */}
            <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shrink-0 shadow-sm">
                <h1 className="text-xl font-bold text-foreground tracking-tight">{queryId ? 'Edit Applicant Profile' : 'Add Applicant'}</h1>
                <button 
                    onClick={() => navigate('/ats-dashboard/applicants')}
                    className="px-4 py-2 border border-border rounded-theme text-sm font-semibold text-foreground-muted hover:bg-background-muted transition-colors shadow-sm"
                >
                    Cancel
                </button>
            </header>

            {/* Sidebar + Main Content Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <aside className="w-64 bg-background-muted border-r border-border py-6 flex flex-col shrink-0 overflow-y-auto">
                    <nav className="px-3 space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const isLocked = tab.requiresId && !applicantId;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab)}
                                    disabled={false} // Click is handled to show friendly warning toast
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-theme text-sm font-semibold tracking-wide transition-all relative outline-none ${
                                        isActive 
                                            ? 'bg-primary text-primary-foreground shadow-md' 
                                            : isLocked
                                            ? 'text-foreground-muted/50 cursor-not-allowed hover:bg-hover/20'
                                            : 'text-foreground-muted hover:bg-hover hover:text-foreground'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} className={isActive ? 'text-primary-foreground' : isLocked ? 'text-foreground-muted/40' : 'text-foreground-muted'} />
                                        <span>{tab.name}</span>
                                    </div>
                                    {isLocked && <Lock size={14} className="text-foreground-muted/40" />}
                                    
                                    {/* Chevron/Notch pointing right for the active tab like reference image */}
                                    {isActive && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-background translate-x-[4px]" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content Pane */}
                <main className="flex-1 bg-background overflow-y-auto p-6 flex flex-col">
                    <div className="w-full bg-card rounded-theme shadow-sm border border-border flex-1 flex flex-col overflow-hidden">
                        
                        {/* Action Bar (Top of form container) */}
                        <div className="px-6 py-4 bg-background-muted border-b border-border flex justify-between items-center shrink-0">
                            <h2 className="text-lg font-bold text-foreground capitalize">
                                {tabs.find(t => t.id === activeTab)?.name}
                            </h2>
                            {activeTab === 'personal' && (
                                <div className="flex items-center gap-3">
                                    {!applicantId && (
                                        <button 
                                            type="button"
                                            onClick={() => setParserModalOpen(true)}
                                            className="flex items-center gap-1.5 px-4 py-2 border border-rose-500 rounded-theme text-sm font-semibold text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                        >
                                            <Sparkles size={16} />
                                            <span>Parse Resume with AI</span>
                                        </button>
                                    )}
                                    <button 
                                        type="button"
                                        onClick={handleResetPersonal}
                                        className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-theme text-sm font-semibold text-foreground bg-card hover:bg-background-muted transition-colors shadow-sm"
                                    >
                                        <RotateCcw size={16} />
                                        <span>Reset</span>
                                    </button>
                                    <button 
                                        onClick={() => document.getElementById('personal-details-submit-btn')?.click()}
                                        disabled={loading}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-theme text-sm font-bold hover:bg-primary/95 transition-colors shadow disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        <span>Save and Continue &rarr;</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Form Body Container */}
                        <div className="flex-1 p-6 overflow-y-auto bg-card">
                            {activeTab === 'personal' && (
                                <div key={personalFormKey} className="h-full">
                                    <AtsApplicantForm 
                                        item={applicantData}
                                        onSave={handleSavePersonal}
                                        onCancel={() => navigate('/ats-dashboard/applicants')}
                                        loading={loading}
                                        hideActions={true} // We will hide normal actions inside form to use top-right header action bar
                                    />
                                </div>
                            )}

                            {activeTab === 'documents' && applicantId && (
                                <AtsDocumentTab applicantId={applicantId} />
                            )}

                            {activeTab === 'education' && applicantId && (
                                <AtsEducationTab applicantId={applicantId} />
                            )}

                            {activeTab === 'certifications' && applicantId && (
                                <AtsCertificationTab applicantId={applicantId} />
                            )}

                            {activeTab === 'languages' && applicantId && (
                                <AtsLanguageTab applicantId={applicantId} />
                            )}

                            {activeTab === 'work' && applicantId && (
                                <AtsWorkExpTab applicantId={applicantId} />
                            )}

                            {activeTab === 'employer' && applicantId && (
                                <AtsEmployerTab applicantId={applicantId} />
                            )}
                        </div>

                    </div>
                </main>
            </div>
            {/* AI Resume Parser Dialog Modal */}
            {parserModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
                    <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-background-muted border-b border-border flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-base flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-rose-500 animate-pulse" /> AI Resume Parser
                                </h3>
                                <p className="text-[11px] text-foreground-muted">Extract profile, education & work history details instantly.</p>
                            </div>
                            <button 
                                onClick={() => { if (!parsing) { setParserModalOpen(false); setParserFile(null); } }}
                                className="text-foreground-muted hover:text-foreground p-1 rounded-lg hover:bg-hover/20 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Upload Area */}
                            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center flex flex-col items-center justify-center bg-card-hover/20 hover:bg-card-hover/40 hover:border-primary/50 transition-all cursor-pointer relative">
                                <input 
                                    type="file" 
                                    accept=".pdf,.docx"
                                    onChange={(e) => setParserFile(e.target.files[0])}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    disabled={parsing}
                                />
                                <Upload className="h-10 w-10 text-rose-500 mb-3" />
                                {parserFile ? (
                                    <div>
                                        <p className="font-bold text-xs text-foreground max-w-[300px] truncate">{parserFile.name}</p>
                                        <p className="text-[10px] text-foreground-muted mt-1">{(parserFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-bold text-xs text-foreground">Drag & Drop Resume Here</p>
                                        <p className="text-[10px] text-foreground-muted mt-1">Supports PDF, DOCX up to 10MB</p>
                                    </div>
                                )}
                            </div>

                            {parsing && (
                                <div className="space-y-2 text-center py-2">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                                        <span className="text-xs font-bold text-foreground">AI is reading resume...</span>
                                    </div>
                                    <p className="text-[10px] text-foreground-muted">Extracting personal details, schools, companies and skills.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-background-muted border-t border-border flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={parsing}
                                onClick={() => { setParserModalOpen(false); setParserFile(null); }}
                                className="px-4 py-2 border border-border text-xs font-bold rounded-theme text-foreground hover:bg-card transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={parsing || !parserFile}
                                onClick={handleResumeParse}
                                className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-theme hover:bg-rose-600 transition-colors shadow disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {parsing && <Loader2 className="h-3 w-3 animate-spin" />}
                                Start Parse
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddApplicantPage;
