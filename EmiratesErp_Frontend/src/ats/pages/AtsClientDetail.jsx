import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Building2,
    Loader2,
    Users,
    FileText,
    StickyNote,
    CheckSquare,
    DollarSign,
    Mail,
    Send,
    AlertCircle,
    Plus,
    Tag,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Calendar,
    User,
    Shield,
    Sliders,
    Cpu,
    CreditCard,
    Hash
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import Modular Tabs
import AtsClientContactsTab from './detail/AtsClientContactsTab';
import AtsClientNotesTab from './detail/AtsClientNotesTab';
import AtsClientDocumentsTab from './detail/AtsClientDocumentsTab';
import AtsClientTasksTab from './detail/AtsClientTasksTab';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsClientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('snapshot');
    const [contacts, setContacts] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [notes, setNotes] = useState([]);
    const [assignment, setAssignment] = useState(null);
    const [guidelines, setGuidelines] = useState(null);
    const [guidelineDocuments, setGuidelineDocuments] = useState([]);
    
    // Collapsible states for Snapshot view
    const [collapsedSections, setCollapsedSections] = useState({
        notes: false,
        contacts: false,
        documents: false
    });

    const toggleSection = (section) => {
        setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const fetchClientDetail = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            const [clientRes, contactsRes, documentsRes, notesRes, assignmentRes, guidelinesRes, gdDocsRes] = await Promise.all([
                axios.get(`${API_URL}/ats/clients/${id}`, { headers }),
                axios.get(`${API_URL}/ats/clients/${id}/contacts`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/ats/clients/${id}/documents`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/ats/client-notes/client/${id}`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/ats/clients/${id}/assignment`, { headers }).catch(() => ({ data: null })),
                axios.get(`${API_URL}/ats/clients/${id}/guideline`, { headers }).catch(() => ({ data: null })),
                axios.get(`${API_URL}/ats/clients/${id}/guideline/documents`, { headers }).catch(() => ({ data: [] }))
            ]);

            setClient(clientRes.data);
            setContacts(contactsRes.data || []);
            setDocuments(documentsRes.data || []);
            setNotes(notesRes.data || []);
            setAssignment(assignmentRes.data || null);
            setGuidelines(guidelinesRes.data || null);
            setGuidelineDocuments(gdDocsRes.data || []);
        } catch (err) {
            console.error("Error loading client details:", err);
            toast.error("Failed to load client details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchClientDetail();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 bg-background text-foreground">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="text-sm font-semibold text-foreground-muted mt-2">Retrieving client parameters...</span>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="text-center py-20 bg-background text-foreground">
                <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-foreground">Client Profile Not Found</h2>
                <button onClick={() => navigate('/ats-dashboard/clients')} className="mt-4 text-sm text-primary hover:underline">
                    Back to directory
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'snapshot', name: 'Snapshot', icon: Building2 },
        { id: 'contacts', name: 'Contacts', icon: Users, badge: contacts.length },
        { id: 'assignment', name: 'Assignment', icon: Sliders },
        { id: 'notes', name: 'Notes', icon: StickyNote, badge: notes.length },
        { id: 'guidelines', name: 'Guidelines', icon: Mail, badge: guidelineDocuments.length },
        { id: 'documents', name: 'Documents', icon: FileText, badge: documents.length },
        { id: 'tasks', name: 'Tasks', icon: CheckSquare }
    ];

    const renderAssignmentTab = () => {
        if (!assignment) {
            return <div className="text-center py-6 text-foreground-muted italic text-sm">No assignment profile configured for this client.</div>;
        }

        const yesNo = (val) => val ? 'Yes' : 'No';

        return (
            <div className="space-y-6 text-foreground font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 bg-background-muted/20 border border-border rounded-theme space-y-1">
                        <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">Sales Manager</span>
                        <span className="text-sm font-semibold">{assignment.salesManager ? `${assignment.salesManager.firstName} ${assignment.salesManager.lastName}` : '-'}</span>
                    </div>

                    <div className="p-4 bg-background-muted/20 border border-border rounded-theme space-y-1">
                        <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">Account Manager</span>
                        <span className="text-sm font-semibold">{assignment.accountManager ? `${assignment.accountManager.firstName} ${assignment.accountManager.lastName}` : '-'}</span>
                    </div>

                    <div className="p-4 bg-background-muted/20 border border-border rounded-theme space-y-1">
                        <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">Recruitment Manager</span>
                        <span className="text-sm font-semibold">{assignment.recruitmentManager ? `${assignment.recruitmentManager.firstName} ${assignment.recruitmentManager.lastName}` : '-'}</span>
                    </div>

                    <div className="p-4 bg-background-muted/20 border border-border rounded-theme space-y-1">
                        <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">Secondary Sales Manager</span>
                        <span className="text-sm font-semibold">{assignment.secondarySalesManager ? `${assignment.secondarySalesManager.firstName} ${assignment.secondarySalesManager.lastName}` : '-'}</span>
                    </div>

                    <div className="p-4 bg-background-muted/20 border border-border rounded-theme space-y-1">
                        <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">Secondary Recruitment Manager</span>
                        <span className="text-sm font-semibold">{assignment.secondaryRecruitmentManager ? `${assignment.secondaryRecruitmentManager.firstName} ${assignment.secondaryRecruitmentManager.lastName}` : '-'}</span>
                    </div>

                    <div className="p-4 bg-background-muted/20 border border-border rounded-theme space-y-1">
                        <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">Default TAT (Days)</span>
                        <span className="text-sm font-semibold">{assignment.defaultTatDays || '-'}</span>
                    </div>

                    <div className="p-4 bg-background-muted/20 border border-border rounded-theme space-y-1">
                        <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">Default Tax Term</span>
                        <span className="text-sm font-semibold">{assignment.defaultTaxTerm || '-'}</span>
                    </div>

                    <div className="p-4 bg-background-muted/20 border border-border rounded-theme space-y-1">
                        <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">Default Work Authorization</span>
                        <span className="text-sm font-semibold">{assignment.defaultWorkAuthorization || '-'}</span>
                    </div>

                    <div className="p-4 bg-background-muted/20 border border-border rounded-theme space-y-1">
                        <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">Max Submissions</span>
                        <span className="text-sm font-semibold">{assignment.maxSubmissions || '-'}</span>
                    </div>

                    <div className="p-4 bg-background-muted/20 border border-border rounded-theme space-y-1">
                        <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">Number of Positions</span>
                        <span className="text-sm font-semibold">{assignment.numberOfPositions || '-'}</span>
                    </div>

                    <div className="p-4 bg-background-muted/20 border border-border rounded-theme space-y-1">
                        <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">Post Job In Career Portal</span>
                        <span className="text-sm font-semibold">{yesNo(assignment.postJobInCareerPortal)}</span>
                    </div>

                    <div className="p-4 bg-background-muted/20 border border-border rounded-theme space-y-1">
                        <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">Make References Mandatory</span>
                        <span className="text-sm font-semibold">{yesNo(assignment.makeReferencesMandatory)}</span>
                    </div>
                </div>

                {/* Assigned Users list */}
                <div className="bg-background-muted/20 border border-border rounded-theme p-4 space-y-3">
                    <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">Assigned Users</span>
                    {assignment.assignedToUsers && assignment.assignedToUsers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {assignment.assignedToUsers.map(u => (
                                <span key={u.id} className="px-3 py-1.5 bg-background border border-border rounded text-xs font-semibold">
                                    {u.firstName} {u.lastName}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-xs font-medium text-foreground-muted italic">No specific users assigned.</span>
                    )}
                </div>

                {/* TAT Notification Recipients */}
                <div className="bg-background-muted/20 border border-border rounded-theme p-4 space-y-3">
                    <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">TAT Notification Recipients</span>
                    {assignment.tatNotificationRecipients && assignment.tatNotificationRecipients.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {assignment.tatNotificationRecipients.map(u => (
                                <span key={u.id} className="px-3 py-1.5 bg-background border border-border rounded text-xs font-semibold">
                                    {u.firstName} {u.lastName}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-xs font-medium text-foreground-muted italic">No TAT notification recipients assigned.</span>
                    )}
                </div>
            </div>
        );
    };

    const renderGuidelinesTab = () => {
        return (
            <div className="space-y-6 text-foreground font-sans">
                <div className="bg-background-muted/20 border border-border rounded-theme p-4 space-y-2">
                    <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">Guidelines & Terms</span>
                    {guidelines && guidelines.submissionGuidelines ? (
                        <div className="text-sm leading-relaxed ck-content" dangerouslySetInnerHTML={{ __html: guidelines.submissionGuidelines }} />
                    ) : (
                        <div className="text-sm text-foreground-muted italic">No specific submission guidelines defined.</div>
                    )}
                </div>

                <div className="space-y-3">
                    <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">Guideline Documents</span>
                    {guidelineDocuments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {guidelineDocuments.map(d => (
                                <a
                                    key={d.id}
                                    href={d.filePath ? `${API_URL.replace('/api', '')}${d.filePath}` : '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-3 p-4 rounded-theme border border-border bg-background/40 hover:border-primary/50 transition-all cursor-pointer group"
                                >
                                    <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                                    <div className="min-w-0 flex-1">
                                        <span className="text-sm font-bold truncate block group-hover:text-primary transition-colors">{d.documentTitle}</span>
                                        <p className="text-xs text-foreground-muted mt-1 leading-relaxed">{d.description || 'No description provided.'}</p>
                                        <span className="text-[10px] text-foreground-muted block mt-2 font-mono truncate">{d.fileName}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 border border-dashed border-border rounded-theme text-foreground-muted italic text-xs">
                            No guideline documents uploaded.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'snapshot':
                return renderSnapshotView();
            case 'contacts':
                return (
                    <AtsClientContactsTab 
                        clientId={id} 
                        contacts={contacts} 
                        onRefresh={fetchClientDetail} 
                    />
                );
            case 'assignment':
                return renderAssignmentTab();
            case 'guidelines':
                return renderGuidelinesTab();
            case 'notes':
                return <AtsClientNotesTab clientId={id} />;
            case 'tasks':
                return <AtsClientTasksTab clientId={id} />;
            case 'documents':
                return <AtsClientDocumentsTab clientId={id} />;
            default:
                return renderSnapshotView();
        }
    };

    const renderSnapshotView = () => {
        return (
            <div className="space-y-6">
                {/* 1. Notes Collapsible Card */}
                <div className="bg-card rounded-theme border border-border overflow-hidden shadow-xs">
                    <div 
                        onClick={() => toggleSection('notes')}
                        className="flex items-center justify-between p-4 bg-background-muted/20 border-b border-border cursor-pointer select-none"
                    >
                        <div className="flex items-center gap-2">
                            <StickyNote className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Notes</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveTab('notes'); }}
                                className="inline-flex items-center gap-1 border border-border bg-card text-foreground-muted hover:text-foreground text-xs font-bold px-2.5 py-1 rounded-theme transition-all"
                            >
                                <Plus size={12} /> Add
                            </button>
                            {collapsedSections.notes ? <ChevronDown size={18} className="text-foreground-muted" /> : <ChevronUp size={18} className="text-foreground-muted" />}
                        </div>
                    </div>
                    {!collapsedSections.notes && (
                        <div className="p-4 overflow-x-auto">
                            {notes.length > 0 ? (
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="text-foreground-muted border-b border-border font-semibold text-xs">
                                            <th className="pb-2">Action</th>
                                            <th className="pb-2">Note Details</th>
                                            <th className="pb-2">Priority</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60 text-foreground">
                                        {notes.slice(0, 5).map(n => (
                                            <tr key={n.id} className="hover:bg-background-muted/10 font-semibold">
                                                <td className="py-2.5 text-primary">{n.noteTitle || 'General'}</td>
                                                <td className="py-2.5" dangerouslySetInnerHTML={{ __html: n.noteBody || '-' }} />
                                                <td className="py-2.5">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                        n.notesPriority === 'HIGH' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-background border border-border text-foreground-muted'
                                                    }`}>
                                                        {n.notesPriority}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-6 text-foreground-muted text-sm">No notes available.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. Contacts Collapsible Card */}
                <div className="bg-card rounded-theme border border-border overflow-hidden shadow-xs">
                    <div 
                        onClick={() => toggleSection('contacts')}
                        className="flex items-center justify-between p-4 bg-background-muted/20 border-b border-border cursor-pointer select-none"
                    >
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Contacts</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveTab('contacts'); }}
                                className="inline-flex items-center gap-1 border border-border bg-card text-foreground-muted hover:text-foreground text-xs font-bold px-2.5 py-1 rounded-theme transition-all"
                            >
                                <Plus size={12} /> Add
                            </button>
                            {collapsedSections.contacts ? <ChevronDown size={18} className="text-foreground-muted" /> : <ChevronUp size={18} className="text-foreground-muted" />}
                        </div>
                    </div>
                    {!collapsedSections.contacts && (
                        <div className="p-4 overflow-x-auto">
                            {contacts.length > 0 ? (
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="text-foreground-muted border-b border-border font-semibold text-xs">
                                            <th className="pb-2">Name</th>
                                            <th className="pb-2">Designation</th>
                                            <th className="pb-2">Email</th>
                                            <th className="pb-2">Phone</th>
                                            <th className="pb-2">Primary</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60 text-foreground font-semibold">
                                        {contacts.map(c => (
                                            <tr key={c.id} className="hover:bg-background-muted/10">
                                                <td className="py-2.5 text-foreground">{c.firstName} {c.lastName}</td>
                                                <td className="py-2.5 text-foreground-muted">{c.designation || '-'}</td>
                                                <td className="py-2.5">{c.email || '-'}</td>
                                                <td className="py-2.5">{c.phone || c.mobile || '-'}</td>
                                                <td className="py-2.5">
                                                    {c.isPrimary ? (
                                                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded">Primary</span>
                                                    ) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-6 text-foreground-muted text-sm">No client contacts added.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* 3. Documents Collapsible Card */}
                <div className="bg-card rounded-theme border border-border overflow-hidden shadow-xs">
                    <div 
                        onClick={() => toggleSection('documents')}
                        className="flex items-center justify-between p-4 bg-background-muted/20 border-b border-border cursor-pointer select-none"
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Documents</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveTab('documents'); }}
                                className="inline-flex items-center gap-1 border border-border bg-card text-foreground-muted hover:text-foreground text-xs font-bold px-2.5 py-1 rounded-theme transition-all"
                            >
                                <Plus size={12} /> Add
                            </button>
                            {collapsedSections.documents ? <ChevronDown size={18} className="text-foreground-muted" /> : <ChevronUp size={18} className="text-foreground-muted" />}
                        </div>
                    </div>
                    {!collapsedSections.documents && (
                        <div className="p-4">
                            {documents.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {documents.slice(0, 4).map(d => (
                                        <a 
                                            key={d.id} 
                                            href={d.filePath ? `${API_URL.replace('/api', '')}${d.filePath}` : '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-2 rounded border border-border/80 bg-background/40 hover:border-primary/50 transition-all cursor-pointer"
                                        >
                                            <FileText className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                                            <span className="text-sm font-semibold truncate flex-1 hover:text-primary transition-colors">{d.fileName}</span>
                                            <span className="text-xs text-foreground-muted uppercase font-bold">{d.documentTypeName || 'Other'}</span>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-foreground-muted text-sm">No uploaded documents.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 text-foreground font-sans max-w-[1600px] mx-auto">
            <div className="bg-card rounded-theme border border-border shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-4 bg-primary/10 text-primary rounded-theme border border-primary/20 shadow-xs flex items-center justify-center font-black text-xl w-14 h-14">
                        {client.clientName ? client.clientName.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-black text-foreground tracking-tight">{client.clientName}</h1>
                            {client.clientShortName && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-background border border-border text-foreground-muted rounded-theme">
                                    {client.clientShortName}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-foreground-muted mt-1 font-semibold flex items-center gap-2">
                            <span>{client.vmsClientName || 'Client Profile'}</span>
                            <span>•</span>
                            <span className="text-primary font-bold">{client.industry || 'General'}</span>
                            <span>•</span>
                            <span className="text-xs text-foreground-muted font-medium">Practice: {client.practice || '-'}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/ats-dashboard/clients')}
                        className="px-4 py-2 border border-border text-sm font-bold text-foreground-muted bg-background rounded-theme hover:bg-background-muted transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => navigate(`/ats-dashboard/clients/${client.id}/edit`)}
                        className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-theme hover:bg-primary/90 shadow shadow-primary/10 transition-all"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                <div className="lg:col-span-3 min-w-0 space-y-6">
                    <div className="border-b border-border bg-card rounded-theme shadow-xs flex items-center overflow-x-auto gap-2 px-4 scrollbar-thin">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                                        isActive
                                            ? 'border-primary text-primary font-bold'
                                            : 'border-transparent text-foreground-muted hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.name}</span>
                                    {tab.badge !== undefined && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                            isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-background-muted text-foreground-muted border border-border'
                                        }`}>
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="bg-card rounded-theme border border-border shadow-xs p-6">
                        {renderActiveTabContent()}
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-5 sticky top-16">
                    <div className="bg-card rounded-theme border border-border shadow-xs p-5 space-y-6">
                        <div>
                            <h3 className="text-xs font-black uppercase text-foreground-muted tracking-wider mb-4 pb-2 border-b border-border">
                                Client Details
                            </h3>
                        </div>
                        
                        <div className="space-y-3.5 font-semibold text-sm">
                            <div className="flex gap-3 p-3 bg-background-muted/30 hover:bg-background-muted/50 rounded-theme border border-border/40 transition-all">
                                <div className="p-2 bg-primary/10 text-primary rounded-theme h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <User size={16} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] text-foreground-muted font-bold block uppercase tracking-wider">Primary Owner</span>
                                    <span className="text-sm font-semibold text-foreground truncate block mt-0.5">{client.primaryOwnerName || 'Unassigned'}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 p-3 bg-background-muted/30 hover:bg-background-muted/50 rounded-theme border border-border/40 transition-all">
                                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-theme h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <Shield size={16} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] text-foreground-muted font-bold block uppercase tracking-wider">Ownership</span>
                                    <span className="text-sm font-semibold text-foreground truncate block mt-0.5">{client.ownership || 'Private'}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 p-3 bg-background-muted/30 hover:bg-background-muted/50 rounded-theme border border-border/40 transition-all">
                                <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-theme h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <Building2 size={16} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] text-foreground-muted font-bold block uppercase tracking-wider">Primary BU</span>
                                    <span className="text-sm font-semibold text-foreground truncate block mt-0.5">{client.primaryBusinessUnitName || 'Global'}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 p-3 bg-background-muted/30 hover:bg-background-muted/50 rounded-theme border border-border/40 transition-all">
                                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-theme h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <Hash size={16} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] text-foreground-muted font-bold block uppercase tracking-wider">Federal ID</span>
                                    <span className="text-sm font-mono font-bold text-foreground truncate block mt-0.5">{client.federalId || '-'}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 p-3 bg-background-muted/30 hover:bg-background-muted/50 rounded-theme border border-border/40 transition-all">
                                <div className="p-2 bg-rose-500/10 text-rose-600 rounded-theme h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <CreditCard size={16} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] text-foreground-muted font-bold block uppercase tracking-wider">Payment Terms</span>
                                    <span className="text-sm font-bold text-primary block mt-0.5">{client.paymentTermsName || 'Net 30'}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-background-muted/30 hover:bg-background-muted/50 rounded-theme border border-border/40 transition-all">
                                <span className="text-[10px] text-foreground-muted font-bold block uppercase tracking-wider mb-1.5">About Client</span>
                                <p className="text-xs text-foreground-muted leading-relaxed font-semibold">
                                    {client.aboutCompany || 'No description logged.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AtsClientDetail;
