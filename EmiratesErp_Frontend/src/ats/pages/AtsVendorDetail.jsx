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
    Landmark,
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
import AtsVendorOverviewTab from './detail/AtsVendorOverviewTab';
import AtsVendorContactsTab from './detail/AtsVendorContactsTab';
import AtsVendorContractsTab from './detail/AtsVendorContractsTab';
import AtsVendorNotesTab from './detail/AtsVendorNotesTab';
import AtsVendorTasksTab from './detail/AtsVendorTasksTab';
import AtsVendorAccountTab from './detail/AtsVendorAccountTab';
import AtsVendorSubmissionTab from './detail/AtsVendorSubmissionTab';
import AtsVendorEmailsTab from './detail/AtsVendorEmailsTab';
import AtsVendorDocumentsTab from './detail/AtsVendorDocumentsTab';
import AtsVendorBankAccountsDetailTab from './detail/AtsVendorBankAccountsDetailTab';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsVendorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('snapshot');
    const [contacts, setContacts] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [notes, setNotes] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    
    // Collapsible states for Snapshot view
    const [collapsedSections, setCollapsedSections] = useState({
        accounts: false,
        notes: false,
        contacts: false,
        documents: false,
        bankAccounts: false
    });

    const toggleSection = (section) => {
        setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const fetchVendorDetail = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            const [vendorRes, contactsRes, documentsRes, notesRes, bankAccountsRes] = await Promise.all([
                axios.get(`${API_URL}/ats/vendors/${id}`, { headers }),
                axios.get(`${API_URL}/ats/vendors/${id}/contacts`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/ats/vendors/${id}/documents`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/ats/vendors/${id}/notes`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/ats/vendors/${id}/bank-accounts`, { headers }).catch(() => ({ data: [] }))
            ]);

            setVendor(vendorRes.data);
            setContacts(contactsRes.data || []);
            setDocuments(documentsRes.data || []);
            setNotes(notesRes.data || []);
            setBankAccounts(bankAccountsRes.data || []);
        } catch (err) {
            console.error("Error loading vendor details:", err);
            toast.error("Failed to load vendor details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchVendorDetail();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 bg-background text-foreground">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="text-sm font-semibold text-foreground-muted mt-2">Retrieving strategic sourcing parameters...</span>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="text-center py-20 bg-background text-foreground">
                <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-foreground">Vendor Profile Not Found</h2>
                <button onClick={() => navigate('/ats-dashboard/vendors')} className="mt-4 text-sm text-primary hover:underline">
                    Back to directory
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'snapshot', name: 'Snapshot', icon: Building2 },
        { id: 'contacts', name: 'Contacts', icon: Users, badge: contacts.length },
        { id: 'notes', name: 'Notes', icon: StickyNote, badge: notes.length },
        { id: 'documents', name: 'Documents', icon: FileText, badge: documents.length },
        { id: 'accounts', name: 'Accounts', icon: DollarSign },
        { id: 'bank_accounts', name: 'Bank Accounts', icon: Landmark, badge: bankAccounts.length },
        { id: 'tasks', name: 'Tasks', icon: CheckSquare },
        { id: 'emails', name: 'Emails', icon: Send }
    ];

    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'snapshot':
                return renderSnapshotView();
            case 'contacts':
                return (
                    <AtsVendorContactsTab 
                        vendorId={id} 
                        contacts={contacts} 
                        onRefresh={fetchVendorDetail} 
                    />
                );
            case 'contracts':
                return <AtsVendorContractsTab vendorId={id} />;
            case 'notes':
                return <AtsVendorNotesTab vendorId={id} />;
            case 'tasks':
                return <AtsVendorTasksTab vendorId={id} />;
            case 'accounts':
                return <AtsVendorAccountTab vendorId={id} />;
            case 'emails':
                return <AtsVendorEmailsTab vendorId={id} />;
            case 'documents':
                return <AtsVendorDocumentsTab vendorId={id} />;
            case 'bank_accounts':
                return <AtsVendorBankAccountsDetailTab vendorId={id} />;
            default:
                return renderSnapshotView();
        }
    };

    const renderSnapshotView = () => {
        return (
            <div className="space-y-6">
                {/* 1. Accounts Collapsible Card */}
                <div className="bg-card rounded-theme border border-border overflow-hidden shadow-xs">
                    <div 
                        onClick={() => toggleSection('accounts')}
                        className="flex items-center justify-between p-4 bg-background-muted/20 border-b border-border cursor-pointer select-none"
                    >
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Accounts</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveTab('accounts'); }}
                                className="inline-flex items-center gap-1 border border-border bg-card text-foreground-muted hover:text-foreground text-xs font-bold px-2.5 py-1 rounded-theme transition-all"
                            >
                                <Plus size={12} /> Add
                            </button>
                            {collapsedSections.accounts ? <ChevronDown size={18} className="text-foreground-muted" /> : <ChevronUp size={18} className="text-foreground-muted" />}
                        </div>
                    </div>
                    {!collapsedSections.accounts && (
                        <div className="p-4 overflow-x-auto">
                            {vendor.account ? (
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="text-foreground-muted border-b border-border font-semibold text-xs">
                                            <th className="pb-2">Contact Person</th>
                                            <th className="pb-2">Email ID</th>
                                            <th className="pb-2">Designation</th>
                                            <th className="pb-2">Office Number</th>
                                            <th className="pb-2">Mobile Number</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60 text-foreground font-medium">
                                        <tr className="hover:bg-background-muted/10">
                                            <td className="py-2.5">{vendor.account.contactPerson || '-'}</td>
                                            <td className="py-2.5">{vendor.account.emailId || '-'}</td>
                                            <td className="py-2.5">{vendor.account.designation || '-'}</td>
                                            <td className="py-2.5">{vendor.account.officeNumber || '-'}</td>
                                            <td className="py-2.5">{vendor.account.mobileNumber || '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-6 text-foreground-muted text-sm">No accounts data available.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. Notes Collapsible Card */}
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
                                            <tr key={n.id} className="hover:bg-background-muted/10">
                                                <td className="py-2.5 font-bold text-primary">{n.noteTitle || 'General'}</td>
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

                {/* 3. Contacts Collapsible Card */}
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
                                    <tbody className="divide-y divide-border/60 text-foreground">
                                        {contacts.map(c => (
                                            <tr key={c.id} className="hover:bg-background-muted/10 font-medium">
                                                <td className="py-2.5 font-bold text-foreground">{c.firstName} {c.lastName}</td>
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
                                <div className="text-center py-6 text-foreground-muted text-sm">No agency contacts added.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* 4. Documents Collapsible Card */}
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

                {/* 5. Bank Accounts Collapsible Card */}
                <div className="bg-card rounded-theme border border-border overflow-hidden shadow-xs">
                    <div 
                        onClick={() => toggleSection('bankAccounts')}
                        className="flex items-center justify-between p-4 bg-background-muted/20 border-b border-border cursor-pointer select-none"
                    >
                        <div className="flex items-center gap-2">
                            <Landmark className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Bank Accounts</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveTab('bank_accounts'); }}
                                className="inline-flex items-center gap-1 border border-border bg-card text-foreground-muted hover:text-foreground text-xs font-bold px-2.5 py-1 rounded-theme transition-all"
                            >
                                <Plus size={12} /> Add
                            </button>
                            {collapsedSections.bankAccounts ? <ChevronDown size={18} className="text-foreground-muted" /> : <ChevronUp size={18} className="text-foreground-muted" />}
                        </div>
                    </div>
                    {!collapsedSections.bankAccounts && (
                        <div className="p-4 overflow-x-auto">
                            {bankAccounts.length > 0 ? (
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="text-foreground-muted border-b border-border font-semibold text-xs">
                                            <th className="pb-2">Beneficiary Name</th>
                                            <th className="pb-2">Bank Name</th>
                                            <th className="pb-2">Account Number</th>
                                            <th className="pb-2">Priority</th>
                                            <th className="pb-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60 text-foreground font-medium">
                                        {bankAccounts.map(ba => (
                                            <tr key={ba.id} className="hover:bg-background-muted/10">
                                                <td className="py-2.5">{ba.beneficiaryName || '-'}</td>
                                                <td className="py-2.5">{ba.bankName || '-'}</td>
                                                <td className="py-2.5 font-mono">{ba.accountNumber || '-'}</td>
                                                <td className="py-2.5">{ba.priority || '-'}</td>
                                                <td className="py-2.5">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                        ba.recordStatus === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-background border border-border text-foreground-muted'
                                                    }`}>
                                                        {ba.recordStatus || 'Active'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-6 text-foreground-muted text-sm">No bank accounts registered.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 text-foreground font-sans max-w-[1600px] mx-auto">
            {/* Header & Quick Actions Bar */}
            <div className="bg-card rounded-theme border border-border shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-4 bg-primary/10 text-primary rounded-theme border border-primary/20 shadow-xs flex items-center justify-center font-black text-xl w-14 h-14">
                        {vendor.companyName ? vendor.companyName.charAt(0).toUpperCase() : 'V'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-black text-foreground tracking-tight">{vendor.companyName}</h1>
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-background border border-border text-foreground-muted rounded-theme">
                                {vendor.vendorCode}
                            </span>
                            {vendor.isBlacklisted && (
                                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-theme uppercase tracking-wider">
                                    Blacklisted
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-foreground-muted mt-1 font-semibold flex items-center gap-2">
                            <span>{vendor.displayName || 'Strategic Vendor'}</span>
                            <span>•</span>
                            <span className="text-primary font-bold">{vendor.vendorType?.replace('_', ' ')}</span>
                            <span>•</span>
                            <span className="text-xs text-foreground-muted font-medium">Strategic BU: {vendor.primaryBusinessUnitName || '-'}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex border border-border rounded-theme overflow-hidden bg-background">
                        <button className="p-2 text-foreground-muted hover:bg-background-muted border-r border-border transition-all">
                            <ChevronLeft size={16} />
                        </button>
                        <button className="p-2 text-foreground-muted hover:bg-background-muted transition-all">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    <button
                        onClick={() => navigate('/ats-dashboard/vendors')}
                        className="px-4 py-2 border border-border text-sm font-bold text-foreground-muted bg-background rounded-theme hover:bg-background-muted transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => navigate(`/ats-dashboard/vendors/${vendor.id}/edit`)}
                        className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-theme hover:bg-primary/90 shadow shadow-primary/10 transition-all"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* TWO COLUMN GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* Main Content Area (3 Cols) */}
                <div className="lg:col-span-3 min-w-0 space-y-6">
                    {/* HORIZONTAL TAB BAR */}
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

                    {/* TAB PANEL CARD */}
                    <div className="bg-card rounded-theme border border-border shadow-xs p-6">
                        {renderActiveTabContent()}
                    </div>
                </div>

                {/* Right Fixed Sidebar (1 Col) */}
                <div className="lg:col-span-1 space-y-5 sticky top-16">
                    <div className="bg-card rounded-theme border border-border shadow-xs p-5 space-y-6">
                        <div>
                            <h3 className="text-xs font-black uppercase text-foreground-muted tracking-wider mb-4 pb-2 border-b border-border">
                                Vendor Profile Details
                            </h3>
                        </div>
                        
                        <div className="space-y-3.5">
                            {/* Primary Owner */}
                            <div className="flex gap-3 p-3 bg-background-muted/30 hover:bg-background-muted/50 rounded-theme border border-border/40 transition-all">
                                <div className="p-2 bg-primary/10 text-primary rounded-theme h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <User size={16} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] text-foreground-muted font-bold block uppercase tracking-wider">Primary Owner</span>
                                    <span className="text-sm font-semibold text-foreground truncate block mt-0.5">{vendor.ownerName || 'Unassigned'}</span>
                                </div>
                            </div>

                            {/* Ownership */}
                            <div className="flex gap-3 p-3 bg-background-muted/30 hover:bg-background-muted/50 rounded-theme border border-border/40 transition-all">
                                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-theme h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <Shield size={16} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] text-foreground-muted font-bold block uppercase tracking-wider">Ownership</span>
                                    <span className="text-sm font-semibold text-foreground truncate block mt-0.5">{vendor.ownership || 'Private'}</span>
                                </div>
                            </div>

                            {/* Business Unit */}
                            <div className="flex gap-3 p-3 bg-background-muted/30 hover:bg-background-muted/50 rounded-theme border border-border/40 transition-all">
                                <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-theme h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <Building2 size={16} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] text-foreground-muted font-bold block uppercase tracking-wider">Business Unit</span>
                                    <span className="text-sm font-semibold text-foreground truncate block mt-0.5">{vendor.primaryBusinessUnitName || 'Global'}</span>
                                </div>
                            </div>

                            {/* Federal ID */}
                            <div className="flex gap-3 p-3 bg-background-muted/30 hover:bg-background-muted/50 rounded-theme border border-border/40 transition-all">
                                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-theme h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <Hash size={16} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] text-foreground-muted font-bold block uppercase tracking-wider">Federal ID</span>
                                    <span className="text-sm font-mono font-bold text-foreground truncate block mt-0.5">{vendor.federalId || '-'}</span>
                                </div>
                            </div>

                            {/* Payment Terms */}
                            <div className="flex gap-3 p-3 bg-background-muted/30 hover:bg-background-muted/50 rounded-theme border border-border/40 transition-all">
                                <div className="p-2 bg-rose-500/10 text-rose-600 rounded-theme h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <CreditCard size={16} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] text-foreground-muted font-bold block uppercase tracking-wider">Payment Terms</span>
                                    <span className="text-sm font-bold text-primary block mt-0.5">{vendor.account?.paymentTerms || 'Net 30'}</span>
                                </div>
                            </div>

                            {/* Vendor Type */}
                            <div className="flex gap-3 p-3 bg-background-muted/30 hover:bg-background-muted/50 rounded-theme border border-border/40 transition-all">
                                <div className="p-2 bg-cyan-500/10 text-cyan-600 rounded-theme h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <Tag size={16} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] text-foreground-muted font-bold block uppercase tracking-wider">Vendor Type</span>
                                    <span className="text-xs font-bold text-foreground bg-background border border-border px-2 py-0.5 rounded-theme block mt-1 inline-block uppercase tracking-wider">
                                        {vendor.vendorType || 'Regular'}
                                    </span>
                                </div>
                            </div>

                            {/* Technologies */}
                            <div className="p-3 bg-background-muted/30 hover:bg-background-muted/50 rounded-theme border border-border/40 transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                    <Cpu size={14} className="text-purple-500" />
                                    <span className="text-[10px] text-foreground-muted font-bold uppercase tracking-wider">Technologies</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {vendor.technologies ? vendor.technologies.split(',').map((t, idx) => (
                                        <span key={idx} className="bg-primary/5 text-primary text-[10px] px-2.5 py-0.5 rounded-theme font-bold border border-primary/10">
                                            {t.trim()}
                                        </span>
                                    )) : <span className="text-foreground-muted text-xs font-semibold">None listed</span>}
                                </div>
                            </div>

                            {/* About Vendor */}
                            <div className="p-3 bg-background-muted/30 hover:bg-background-muted/50 rounded-theme border border-border/40 transition-all">
                                <span className="text-[10px] text-foreground-muted font-bold block uppercase tracking-wider mb-1.5">About Vendor</span>
                                <p className="text-xs text-foreground-muted leading-relaxed font-semibold">
                                    {vendor.aboutVendor || 'No description logged.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AtsVendorDetail;
