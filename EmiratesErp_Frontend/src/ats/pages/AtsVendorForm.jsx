import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Save,
    Building2,
    Loader2,
    Info,
    Mail,
    DollarSign,
    StickyNote,
    Users,
    FileText,
    Landmark
} from 'lucide-react';
import { toast } from 'react-toastify';
import AtsVendorBusinessTab from '../components/AtsVendorBusinessTab';
import AtsVendorAccountsTab from '../components/AtsVendorAccountsTab';
import AtsVendorNotesTab from '../components/AtsVendorNotesTab';
import AtsVendorFormContactsTab from '../components/AtsVendorFormContactsTab';
import AtsVendorSubmissionTab from '../components/AtsVendorSubmissionTab';
import AtsVendorFormDocumentsTab from '../components/AtsVendorFormDocumentsTab';
import AtsVendorFormBankAccountTab from '../components/AtsVendorFormBankAccountTab';
import { useAtsGeo } from '../hooks/useAtsGeo';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsVendorForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeFormTab, setActiveFormTab] = useState('business_info');
    const [deletedContactIds, setDeletedContactIds] = useState([]);
    const [deletedDocumentIds, setDeletedDocumentIds] = useState([]);
    const [deletedBankAccountIds, setDeletedBankAccountIds] = useState([]);

    const {
        countries: geoCountries,
        states: geoStates,
        setSelectedCountryName,
    } = useAtsGeo();

    // Dropdown Data
    const [businessUnits, setBusinessUnits] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [actions, setActions] = useState([]);

    // Form Fields
    const [formData, setFormData] = useState({
        companyName: '',
        vendorCode: '',
        displayName: '',
        vendorType: 'STAFFING',
        vendorStatus: 'ACTIVE',
        primaryEmail: '',
        alternateEmail: '',
        primaryPhone: '',
        faxNumber: '',
        website: '',
        taxId: '',
        federalId: '',
        address: '',
        city: '',
        stateId: '',
        countryId: '',
        zipCode: '',
        primaryBusinessUnitId: '',
        businessUnitIds: [],
        vendorLeadId: '',
        ownerId: '',
        technologies: '',
        aboutVendor: '',
        ownership: '',
        vendorVisibility: 'PUBLIC',
        sendRequirement: false,
        sendHotlist: false,
        allowAccessToAllUsers: false,
        contacts: [],
        documents: [],
        bankAccounts: [],

        // Grouped tab configurations mirroring applicant layout
        account: {
            contactPerson: '',
            mobileNumber: '',
            officeNumber: '',
            officeExtension: '',
            emailId: '',
            designation: '',
            paymentTerms: '',
            paymentTermId: ''
        },
        submission: {
            submissionDescription: '',
            mailDescription: '',
            mailingSubject: '',
            body: ''
        },
        note: {
            noteTitle: 'New Vendor Onboarding Note',
            notes: '',
            actionId: '',
            notesPriority: 'MEDIUM',
            remindMe: false,
            notifyPeopleIds: []
        }
    });

    const fetchDropdownData = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [buRes, employeesRes, actionsRes] = await Promise.all([
                axios.get(`${API_URL}/ats/business-units/active`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/employees/all`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/ats/actions/active`, { headers }).catch(() => ({ data: [] }))
            ]);

            setBusinessUnits(buRes.data || []);
            setEmployees(employeesRes.data || []);
            setActions(actionsRes.data || []);
        } catch (err) {
            console.error("Error fetching form metadata:", err);
            toast.error("Failed to load drop-down metadata.");
        }
    };

    const fetchVendorForEdit = async () => {
        if (!isEditMode) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [vendorRes, contactsRes, documentsRes, bankAccountsRes] = await Promise.all([
                axios.get(`${API_URL}/ats/vendors/${id}`, { headers }),
                axios.get(`${API_URL}/ats/vendors/${id}/contacts`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/ats/vendors/${id}/documents`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/ats/vendors/${id}/bank-accounts`, { headers }).catch(() => ({ data: [] }))
            ]);

            const data = vendorRes.data;
            const contactsData = contactsRes.data || [];
            const documentsData = documentsRes.data || [];
            const bankAccountsData = bankAccountsRes.data || [];

            setFormData({
                companyName: data.companyName || '',
                vendorCode: data.vendorCode || '',
                displayName: data.displayName || '',
                vendorType: data.vendorType || 'STAFFING',
                vendorStatus: data.vendorStatus || 'ACTIVE',
                primaryEmail: data.primaryEmail || '',
                alternateEmail: data.alternateEmail || '',
                primaryPhone: data.primaryPhone || '',
                faxNumber: data.faxNumber || '',
                website: data.website || '',
                taxId: data.taxId || '',
                federalId: data.federalId || '',
                address: data.address || '',
                city: data.city || '',
                stateId: data.stateId || '',
                countryId: data.countryId || '',
                zipCode: data.zipCode || '',
                primaryBusinessUnitId: data.primaryBusinessUnitId || '',
                businessUnitIds: data.businessUnits ? data.businessUnits.map(b => b.id) : [],
                vendorLeadId: data.vendorLeadId || '',
                ownerId: data.ownerId || '',
                technologies: data.technologies || '',
                aboutVendor: data.aboutVendor || '',
                notes: data.notes || '',
                ownership: data.ownership || '',
                vendorVisibility: data.vendorVisibility || 'PUBLIC',
                sendRequirement: data.sendRequirement || false,
                sendHotlist: data.sendHotlist || false,
                allowAccessToAllUsers: data.allowAccessToAllUsers || false,
                contacts: contactsData,
                documents: documentsData,
                bankAccounts: bankAccountsData,

                account: {
                    contactPerson: data.account?.contactPerson || '',
                    mobileNumber: data.account?.mobileNumber || '',
                    officeNumber: data.account?.officeNumber || '',
                    officeExtension: data.account?.officeExtension || '',
                    emailId: data.account?.emailId || '',
                    designation: data.account?.designation || '',
                    paymentTerms: data.account?.paymentTerms || '',
                    paymentTermId: data.account?.paymentTerm ? data.account.paymentTerm.id : (data.account?.paymentTermId || '')
                },
                submission: {
                    submissionDescription: data.submissionFormat?.submissionDescription || '',
                    mailDescription: data.submissionFormat?.mailDescription || '',
                    mailingSubject: data.submissionFormat?.mailingSubject || '',
                    body: data.submissionFormat?.body || ''
                },
                note: {
                    noteTitle: 'New Vendor Onboarding Note',
                    notes: '',
                    actionId: '',
                    notesPriority: 'MEDIUM',
                    remindMe: false,
                    notifyPeopleIds: []
                }
            });
        } catch (err) {
            console.error("Error loading vendor detail:", err);
            toast.error("Failed to retrieve vendor profile.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            await fetchDropdownData();
            await fetchVendorForEdit();
        };
        init();
    }, [id]);

    useEffect(() => {
        if (formData.countryId && geoCountries.length > 0) {
            const matched = geoCountries.find(c => String(c.id) === String(formData.countryId));
            if (matched) {
                setSelectedCountryName(matched.name);
            }
        }
    }, [formData.countryId, geoCountries]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'countryId') {
            const matched = geoCountries.find(c => String(c.id) === String(value));
            setSelectedCountryName(matched ? matched.name : '');
            setFormData(prev => ({
                ...prev,
                countryId: value,
                stateId: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleMultiSelectChange = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(parseInt(options[i].value));
            }
        }
        setFormData(prev => ({
            ...prev,
            businessUnitIds: selected
        }));
    };

    const handleContactsChange = (updatedContacts) => {
        // Track deleted contacts (if they have an id, they are in database, so we must delete them on save)
        const currentIds = updatedContacts.map(c => c.id).filter(Boolean);
        const deleted = formData.contacts
            .filter(c => c.id && !currentIds.includes(c.id))
            .map(c => c.id);

        if (deleted.length > 0) {
            setDeletedContactIds(prev => [...new Set([...prev, ...deleted])]);
        }

        setFormData(prev => ({
            ...prev,
            contacts: updatedContacts
        }));
    };

    const handleDocumentsChange = (updatedDocuments) => {
        const currentIds = updatedDocuments.map(d => d.id).filter(Boolean);
        const deleted = formData.documents
            .filter(d => d.id && !currentIds.includes(d.id))
            .map(d => d.id);

        if (deleted.length > 0) {
            setDeletedDocumentIds(prev => [...new Set([...prev, ...deleted])]);
        }

        setFormData(prev => ({
            ...prev,
            documents: updatedDocuments
        }));
    };

    const handleBankAccountsChange = (updatedBankAccounts) => {
        const currentIds = updatedBankAccounts.map(b => b.id).filter(Boolean);
        const deleted = formData.bankAccounts
            .filter(b => b.id && !currentIds.includes(b.id))
            .map(b => b.id);

        if (deleted.length > 0) {
            setDeletedBankAccountIds(prev => [...new Set([...prev, ...deleted])]);
        }

        setFormData(prev => ({
            ...prev,
            bankAccounts: updatedBankAccounts
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Clean main vendor payload
            const payload = {
                companyName: formData.companyName,
                vendorCode: formData.vendorCode,
                displayName: formData.displayName,
                vendorType: formData.vendorType,
                vendorStatus: formData.vendorStatus,
                primaryEmail: formData.primaryEmail,
                alternateEmail: formData.alternateEmail,
                primaryPhone: formData.primaryPhone,
                faxNumber: formData.faxNumber,
                website: formData.website,
                taxId: formData.taxId,
                federalId: formData.federalId,
                address: formData.address,
                city: formData.city,
                stateId: formData.stateId ? parseInt(formData.stateId) : null,
                countryId: formData.countryId ? parseInt(formData.countryId) : null,
                zipCode: formData.zipCode,
                primaryBusinessUnitId: formData.primaryBusinessUnitId ? parseInt(formData.primaryBusinessUnitId) : null,
                businessUnitIds: formData.businessUnitIds,
                vendorLeadId: formData.vendorLeadId ? parseInt(formData.vendorLeadId) : null,
                ownerId: formData.ownerId ? parseInt(formData.ownerId) : null,
                technologies: formData.technologies,
                aboutVendor: formData.aboutVendor,
                ownership: formData.ownership,
                vendorVisibility: formData.vendorVisibility,
                sendRequirement: formData.sendRequirement,
                sendHotlist: formData.sendHotlist,
                allowAccessToAllUsers: formData.allowAccessToAllUsers
            };

            let vendorId = id;
            if (isEditMode) {
                await axios.put(`${API_URL}/ats/vendors/${id}`, payload, { headers });
            } else {
                const res = await axios.post(`${API_URL}/ats/vendors`, payload, { headers });
                vendorId = res.data.id;
            }

            // Save Account details if filled
            const acc = formData.account;
            if (acc.contactPerson || acc.emailId || acc.mobileNumber) {
                await axios.put(`${API_URL}/ats/vendors/${vendorId}/account`, {
                    contactPerson: acc.contactPerson,
                    mobileNumber: acc.mobileNumber,
                    officeNumber: acc.officeNumber,
                    officeExtension: acc.officeExtension,
                    emailId: acc.emailId,
                    designation: acc.designation,
                    paymentTerms: acc.paymentTerms,
                    paymentTermId: acc.paymentTermId ? parseInt(acc.paymentTermId) : null
                }, { headers });
            }

            // Save Submission Format details if filled
            const sub = formData.submission;
            if (sub.submissionDescription || sub.mailingSubject || sub.body) {
                await axios.put(`${API_URL}/ats/vendors/${vendorId}/submission-format`, {
                    submissionDescription: sub.submissionDescription,
                    mailDescription: sub.mailDescription,
                    mailingSubject: sub.mailingSubject,
                    body: sub.body
                }, { headers });
            }

            // Save Note details if filled
            const nt = formData.note;
            if (nt.notes) {
                await axios.post(`${API_URL}/ats/vendors/${vendorId}/notes`, {
                    noteTitle: nt.noteTitle || "Vendor Onboarding Note",
                    noteBody: nt.notes,
                    actionId: nt.actionId ? parseInt(nt.actionId) : null,
                    notesPriority: nt.notesPriority || "MEDIUM",
                    remindMe: nt.remindMe || false,
                    notifyPeopleIds: nt.notifyPeopleIds ? nt.notifyPeopleIds.map(i => parseInt(i)) : [],
                    isPinned: false
                }, { headers });
            }

            // Save Contacts list
            if (formData.contacts && formData.contacts.length > 0) {
                for (const c of formData.contacts) {
                    const cPayload = {
                        isPrimary: c.isPrimary,
                        salutation: c.salutation,
                        firstName: c.firstName,
                        lastName: c.lastName,
                        title: c.title,
                        designation: c.designation,
                        email: c.email,
                        phone: c.phone,
                        phoneExtension: c.phoneExtension,
                        mobile: c.mobile,
                        address1: c.address1,
                        address2: c.address2,
                        countryId: c.countryId ? parseInt(c.countryId) : null,
                        stateId: c.stateId ? parseInt(c.stateId) : null,
                        city: c.city,
                        zipCode: c.zipCode,
                        linkedinUrl: c.linkedinUrl,
                        facebookUrl: c.facebookUrl,
                        twitterUrl: c.twitterUrl,
                        googlePlusUrl: c.googlePlusUrl,
                        status: c.status || 'Active',
                        technologies: c.technologies,
                        ownerId: c.ownerId ? parseInt(c.ownerId) : null,
                        allowAccessToAllUsers: c.allowAccessToAllUsers,
                        comment: c.comment,
                        sendRequirement: c.sendRequirement,
                        sendHotlist: c.sendHotlist,
                        vendorContactType: c.vendorContactType,
                        vendorGroup: c.vendorGroup
                    };

                    if (c.id) {
                        await axios.put(`${API_URL}/ats/vendors/${vendorId}/contacts/${c.id}`, cPayload, { headers });
                    } else {
                        await axios.post(`${API_URL}/ats/vendors/${vendorId}/contacts`, cPayload, { headers });
                    }
                }
            }

            // Handle deleted contacts
            if (deletedContactIds.length > 0) {
                for (const cid of deletedContactIds) {
                    await axios.delete(`${API_URL}/ats/vendors/${vendorId}/contacts/${cid}`, { headers });
                }
            }

            // Save / Upload Documents
            if (formData.documents && formData.documents.length > 0) {
                for (const doc of formData.documents) {
                    if (doc.isNew) {
                        let finalFilePath = '';
                        if (doc.rawFile) {
                            const fileFormData = new FormData();
                            fileFormData.append("file", doc.rawFile);
                            const uploadRes = await axios.post(`${API_URL}/ats/vendors/${vendorId}/documents/upload`, fileFormData, {
                                headers: {
                                    ...headers,
                                    'Content-Type': 'multipart/form-data'
                                }
                            });
                            finalFilePath = uploadRes.data.filePath;
                        }
                        await axios.post(`${API_URL}/ats/vendors/${vendorId}/documents`, {
                            title: doc.title,
                            fileName: doc.fileName,
                            filePath: finalFilePath,
                            documentTypeId: parseInt(doc.documentTypeId),
                            comments: doc.comments
                        }, { headers });
                    }
                }
            }

            // Handle deleted documents
            if (deletedDocumentIds.length > 0) {
                for (const docId of deletedDocumentIds) {
                    await axios.delete(`${API_URL}/ats/vendors/${vendorId}/documents/${docId}`, { headers });
                }
            }

            // Save / Upload Bank Accounts
            if (formData.bankAccounts && formData.bankAccounts.length > 0) {
                for (const acc of formData.bankAccounts) {
                    let cancelledChequePath = acc.cancelledChequePath;
                    let cancelledChequeName = acc.cancelledChequeName;
                    if (acc.rawCancelledChequeFile) {
                        const fileFormData = new FormData();
                        fileFormData.append("file", acc.rawCancelledChequeFile);
                        const uploadRes = await axios.post(`${API_URL}/ats/vendors/${vendorId}/bank-accounts/upload`, fileFormData, {
                            headers: {
                                ...headers,
                                'Content-Type': 'multipart/form-data'
                            }
                        });
                        cancelledChequePath = uploadRes.data.filePath;
                        cancelledChequeName = acc.rawCancelledChequeFile.name;
                    }

                    let attachmentPath = acc.attachmentPath;
                    let attachmentName = acc.attachmentName;
                    if (acc.rawAttachmentFile) {
                        const fileFormData = new FormData();
                        fileFormData.append("file", acc.rawAttachmentFile);
                        const uploadRes = await axios.post(`${API_URL}/ats/vendors/${vendorId}/bank-accounts/upload`, fileFormData, {
                            headers: {
                                ...headers,
                                'Content-Type': 'multipart/form-data'
                            }
                        });
                        attachmentPath = uploadRes.data.filePath;
                        attachmentName = acc.rawAttachmentFile.name;
                    }

                    const baPayload = {
                        beneficiaryName: acc.beneficiaryName,
                        bankName: acc.bankName,
                        accountType: acc.accountType,
                        ifscRouting: acc.ifscRouting,
                        accountNumber: acc.accountNumber,
                        depositAmount: acc.depositAmount,
                        priority: acc.priority,
                        comments: acc.comments,
                        addressLine1: acc.addressLine1,
                        addressLine2: acc.addressLine2,
                        countryId: acc.countryId ? parseInt(acc.countryId) : null,
                        stateId: acc.stateId ? parseInt(acc.stateId) : null,
                        city: acc.city,
                        zipCode: acc.zipCode,
                        cancelledChequePath: cancelledChequePath,
                        cancelledChequeName: cancelledChequeName,
                        recordStatus: acc.recordStatus,
                        attachmentPath: attachmentPath,
                        attachmentName: attachmentName
                    };

                    if (acc.id) {
                        await axios.put(`${API_URL}/ats/vendors/${vendorId}/bank-accounts/${acc.id}`, baPayload, { headers });
                    } else {
                        await axios.post(`${API_URL}/ats/vendors/${vendorId}/bank-accounts`, baPayload, { headers });
                    }
                }
            }

            // Handle deleted bank accounts
            if (deletedBankAccountIds.length > 0) {
                for (const baId of deletedBankAccountIds) {
                    await axios.delete(`${API_URL}/ats/vendors/${vendorId}/bank-accounts/${baId}`, { headers });
                }
            }

            toast.success(isEditMode ? "Vendor updated successfully!" : "Vendor registered successfully!");
            navigate('/ats-dashboard/vendors');
        } catch (err) {
            console.error("Error saving vendor:", err);
            toast.error(err.response?.data?.message || "An error occurred while saving the vendor profile.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 bg-background text-foreground">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="text-sm font-semibold text-foreground-muted">Loading vendor records...</span>
            </div>
        );
    }

    const formTabs = [
        { id: 'business_info', name: 'Business Information', icon: Info },
        { id: 'accounts', name: 'Accounts / Finance', icon: DollarSign },
        { id: 'notes', name: 'Notes', icon: StickyNote },
        { id: 'contacts', name: 'Contacts', icon: Users },
        { id: 'submission', name: 'Submission Format', icon: Mail },
        { id: 'documents', name: 'Documents', icon: FileText },
        { id: 'bank_accounts', name: 'Bank Account Details', icon: Landmark }
    ];

    return (
        <div className="fixed inset-0 bg-background flex flex-col z-50 text-foreground font-sans overflow-hidden">
            {/* Fixed Top Header */}
            <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h1 className="text-xl font-bold text-foreground tracking-tight">
                        {isEditMode ? "Modify Vendor" : "Add Vendor"}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/ats-dashboard/vendors')}
                        className="px-4 py-2 border border-border rounded-theme text-sm font-semibold text-foreground-muted hover:bg-background-muted transition-colors shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-theme shadow hover:bg-primary/90 transition-all gap-1.5"
                    >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                    </button>
                </div>
            </header>

            {/* Sidebar + Main Content Layout */}
            <div className="flex-grow flex overflow-hidden">
                {/* Left Sidebar */}
                <aside className="w-64 bg-background-muted border-r border-border py-6 flex flex-col shrink-0 overflow-y-auto">
                    <nav className="px-3 space-y-1">
                        {formTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeFormTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveFormTab(tab.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-theme text-sm font-semibold tracking-wide transition-all relative outline-none ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-md font-bold'
                                            : 'text-foreground-muted hover:bg-hover hover:text-foreground'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                                        <span>{tab.name}</span>
                                    </div>
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
                                {formTabs.find(t => t.id === activeFormTab)?.name}
                            </h2>
                        </div>

                        {/* Form Body Container */}
                        <div className="flex-1 p-6 overflow-y-auto bg-card">
                            {/* TAB: Business Information */}
                            {activeFormTab === 'business_info' && (
                                <AtsVendorBusinessTab
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    handleMultiSelectChange={handleMultiSelectChange}
                                    countries={geoCountries}
                                    states={geoStates}
                                    businessUnits={businessUnits}
                                    employees={employees}
                                />
                            )}

                            {activeFormTab === 'accounts' && (
                                <AtsVendorAccountsTab
                                    account={formData.account}
                                    onChange={(accountData) => setFormData(prev => ({ ...prev, account: accountData }))}
                                />
                            )}

                            {/* TAB: Notes */}
                            {activeFormTab === 'notes' && (
                                <AtsVendorNotesTab
                                    note={formData.note}
                                    onChange={(noteData) => setFormData(prev => ({ ...prev, note: noteData }))}
                                    actions={actions}
                                    employees={employees}
                                />
                            )}

                            {/* TAB: Contacts */}
                            {activeFormTab === 'contacts' && (
                                <AtsVendorFormContactsTab
                                    contacts={formData.contacts}
                                    onChange={handleContactsChange}
                                    employees={employees}
                                />
                            )}

                            {/* TAB: Submission */}
                            {activeFormTab === 'submission' && (
                                <AtsVendorSubmissionTab
                                    submission={formData.submission}
                                    onChange={(subData) => setFormData(prev => ({ ...prev, submission: subData }))}
                                />
                            )}

                            {/* TAB: Documents */}
                            {activeFormTab === 'documents' && (
                                <AtsVendorFormDocumentsTab
                                    documents={formData.documents}
                                    onChange={handleDocumentsChange}
                                />
                            )}



                            {/* TAB: Bank Account Details */}
                            {activeFormTab === 'bank_accounts' && (
                                <AtsVendorFormBankAccountTab
                                    bankAccounts={formData.bankAccounts}
                                    onChange={handleBankAccountsChange}
                                />
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AtsVendorForm;
