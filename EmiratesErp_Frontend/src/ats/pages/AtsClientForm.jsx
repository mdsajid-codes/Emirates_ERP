import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Save,
    Building2,
    Loader2,
    Info,
    Mail,
    StickyNote,
    Users,
    FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import AtsClientBusinessTab from '../components/AtsClientBusinessTab';
import AtsClientNotesTab from '../components/AtsClientNotesTab';
import AtsClientFormContactsTab from '../components/AtsClientFormContactsTab';
import AtsClientGuidelinesTab from '../components/AtsClientGuidelinesTab';
import AtsClientFormDocumentsTab from '../components/AtsClientFormDocumentsTab';
import AtsClientFormAssignmentTab from '../components/AtsClientFormAssignmentTab';
import { useAtsGeo } from '../hooks/useAtsGeo';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsClientForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeFormTab, setActiveFormTab] = useState('business_info');
    const [deletedContactIds, setDeletedContactIds] = useState([]);
    const [deletedDocumentIds, setDeletedDocumentIds] = useState([]);
    const [deletedGuidelineDocumentIds, setDeletedGuidelineDocumentIds] = useState([]);

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
        clientName: '',
        vmsClientName: '',
        federalId: '',
        contactNumber: '',
        fax: '',
        emailId: '',
        website: '',
        industry: '',
        category: '',
        address: '',
        city: '',
        stateId: '',
        countryId: '',
        postalCode: '',
        status: 'ACTIVE',
        practice: '',
        primaryOwnerId: '',
        ownership: '',
        clientLeadId: '',
        clientShortName: '',
        sendRequirement: false,
        sendHotlist: false,
        allowAccessToAllUsers: false,
        displayOnJob: true,
        stopSubmitEmailNotification: false,
        defaultAddressForJobs: false,
        aboutCompany: '',
        clientFacilities: '',
        clientVisibility: 'PUBLIC',
        businessUnitIds: [],
        contacts: [],
        documents: [],
        guidelineDocuments: [],
        assignment: {
            assignedToUserIds: [],
            salesManagerId: '',
            accountManagerId: '',
            recruitmentManagerId: '',
            secondarySalesManagerId: '',
            secondaryRecruitmentManagerId: '',
            defaultTatDays: '',
            tatNotificationRecipientIds: [],
            defaultTaxTerm: '',
            defaultWorkAuthorization: '',
            defaultPayRateTaxTerm: '',
            defaultBillRateTaxTerm: '',
            postJobInCareerPortal: false,
            makeReferencesMandatory: false,
            maxSubmissions: '',
            numberOfPositions: ''
        },

        guidelines: {
            submissionGuidelines: ''
        },
        note: {
            noteTitle: 'New Client Onboarding Note',
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

    const fetchClientForEdit = async () => {
        if (!isEditMode) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [clientRes, contactsRes, documentsRes, guidelinesRes, assignmentRes, gdDocsRes] = await Promise.all([
                axios.get(`${API_URL}/ats/clients/${id}`, { headers }),
                axios.get(`${API_URL}/ats/clients/${id}/contacts`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/ats/clients/${id}/documents`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/ats/clients/${id}/guideline`, { headers }).catch(() => ({ data: null })),
                axios.get(`${API_URL}/ats/clients/${id}/assignment`, { headers }).catch(() => ({ data: {} })),
                axios.get(`${API_URL}/ats/clients/${id}/guideline/documents`, { headers }).catch(() => ({ data: [] }))
            ]);

            const data = clientRes.data;
            const contactsData = contactsRes.data || [];
            const documentsData = documentsRes.data || [];
            const guidelinesData = guidelinesRes.data || { submissionGuidelines: '' };
            const assignmentData = assignmentRes.data || {};
            const gdDocsData = gdDocsRes.data || [];

            const assignedToUserIds = assignmentData.assignedToUsers ? assignmentData.assignedToUsers.map(u => u.id) : (assignmentData.assignedToUserIds || []);
            const tatNotificationRecipientIds = assignmentData.tatNotificationRecipients ? assignmentData.tatNotificationRecipients.map(u => u.id) : (assignmentData.tatNotificationRecipientIds || []);

            setFormData({
                clientName: data.clientName || '',
                vmsClientName: data.vmsClientName || '',
                federalId: data.federalId || '',
                contactNumber: data.contactNumber || '',
                fax: data.fax || '',
                emailId: data.emailId || '',
                website: data.website || '',
                industry: data.industry || '',
                category: data.category || '',
                address: data.address || '',
                city: data.city || '',
                stateId: data.state ? data.state.id : (data.stateId || ''),
                countryId: data.country ? data.country.id : (data.countryId || ''),
                postalCode: data.postalCode || '',
                status: data.status || 'ACTIVE',
                practice: data.practice || '',
                primaryOwnerId: data.primaryOwner ? data.primaryOwner.id : (data.primaryOwnerId || ''),
                ownership: data.ownership || '',
                clientLeadId: data.clientLead ? data.clientLead.id : (data.clientLeadId || ''),
                clientShortName: data.clientShortName || '',
                sendRequirement: data.sendRequirement || false,
                sendHotlist: data.sendHotlist || false,
                allowAccessToAllUsers: data.allowAccessToAllUsers || false,
                displayOnJob: data.displayOnJob !== undefined ? data.displayOnJob : true,
                stopSubmitEmailNotification: data.stopSubmitEmailNotification || false,
                defaultAddressForJobs: data.defaultAddressForJobs || false,
                aboutCompany: data.aboutCompany || '',
                clientFacilities: data.clientFacilities || '',
                clientVisibility: data.clientVisibility || 'PUBLIC',
                businessUnitIds: data.businessUnits ? data.businessUnits.map(b => b.id) : [],
                contacts: contactsData,
                documents: documentsData,
                guidelineDocuments: gdDocsData,
                assignment: {
                    assignedToUserIds: assignedToUserIds,
                    salesManagerId: assignmentData.salesManager ? assignmentData.salesManager.id : (assignmentData.salesManagerId || ''),
                    accountManagerId: assignmentData.accountManager ? assignmentData.accountManager.id : (assignmentData.accountManagerId || ''),
                    recruitmentManagerId: assignmentData.recruitmentManager ? assignmentData.recruitmentManager.id : (assignmentData.recruitmentManagerId || ''),
                    secondarySalesManagerId: assignmentData.secondarySalesManager ? assignmentData.secondarySalesManager.id : (assignmentData.secondarySalesManagerId || ''),
                    secondaryRecruitmentManagerId: assignmentData.secondaryRecruitmentManager ? assignmentData.secondaryRecruitmentManager.id : (assignmentData.secondaryRecruitmentManagerId || ''),
                    defaultTatDays: assignmentData.defaultTatDays || '',
                    tatNotificationRecipientIds: tatNotificationRecipientIds,
                    defaultTaxTerm: assignmentData.defaultTaxTerm || '',
                    defaultWorkAuthorization: assignmentData.defaultWorkAuthorization || '',
                    defaultPayRateTaxTerm: assignmentData.defaultPayRateTaxTerm || '',
                    defaultBillRateTaxTerm: assignmentData.defaultBillRateTaxTerm || '',
                    postJobInCareerPortal: assignmentData.postJobInCareerPortal || false,
                    makeReferencesMandatory: assignmentData.makeReferencesMandatory || false,
                    maxSubmissions: assignmentData.maxSubmissions || '',
                    numberOfPositions: assignmentData.numberOfPositions || ''
                },

                guidelines: {
                    submissionGuidelines: guidelinesData.submissionGuidelines || ''
                },
                note: {
                    noteTitle: 'New Client Onboarding Note',
                    notes: '',
                    actionId: '',
                    notesPriority: 'MEDIUM',
                    remindMe: false,
                    notifyPeopleIds: []
                }
            });
        } catch (err) {
            console.error("Error loading client detail:", err);
            toast.error("Failed to retrieve client profile.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            await fetchDropdownData();
            await fetchClientForEdit();
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

    const handleGuidelineDocumentsChange = (updatedDocs) => {
        const currentIds = updatedDocs.map(d => d.id).filter(Boolean);
        const deleted = formData.guidelineDocuments
            .filter(d => d.id && !currentIds.includes(d.id))
            .map(d => d.id);

        if (deleted.length > 0) {
            setDeletedGuidelineDocumentIds(prev => [...new Set([...prev, ...deleted])]);
        }

        setFormData(prev => ({
            ...prev,
            guidelineDocuments: updatedDocs
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const payload = {
                clientName: formData.clientName,
                vmsClientName: formData.vmsClientName,
                federalId: formData.federalId,
                contactNumber: formData.contactNumber,
                fax: formData.fax,
                emailId: formData.emailId,
                website: formData.website,
                industry: formData.industry,
                category: formData.category,
                address: formData.address,
                city: formData.city,
                stateId: formData.stateId ? parseInt(formData.stateId) : null,
                countryId: formData.countryId ? parseInt(formData.countryId) : null,
                postalCode: formData.postalCode,
                status: formData.status,
                practice: formData.practice,
                primaryOwnerId: formData.primaryOwnerId ? parseInt(formData.primaryOwnerId) : null,
                ownership: formData.ownership,
                clientLeadId: formData.clientLeadId ? parseInt(formData.clientLeadId) : null,
                clientShortName: formData.clientShortName,
                sendRequirement: formData.sendRequirement,
                sendHotlist: formData.sendHotlist,
                allowAccessToAllUsers: formData.allowAccessToAllUsers,
                displayOnJob: formData.displayOnJob,
                stopSubmitEmailNotification: formData.stopSubmitEmailNotification,
                defaultAddressForJobs: formData.defaultAddressForJobs,
                aboutCompany: formData.aboutCompany,
                clientFacilities: formData.clientFacilities,
                clientVisibility: formData.clientVisibility,
                businessUnitIds: formData.businessUnitIds
            };

            let clientId = id;
            if (isEditMode) {
                await axios.put(`${API_URL}/ats/clients/${id}`, payload, { headers });
            } else {
                const res = await axios.post(`${API_URL}/ats/clients`, payload, { headers });
                clientId = res.data.id;
            }

            // Save Guidelines details if filled
            const gd = formData.guidelines;
            if (gd.submissionGuidelines) {
                await axios.put(`${API_URL}/ats/clients/${clientId}/guideline`, {
                    submissionGuidelines: gd.submissionGuidelines
                }, { headers });
            }

            // Save Client Assignment details
            const asn = formData.assignment;
            const asnPayload = {
                assignedToUserIds: asn.assignedToUserIds,
                salesManagerId: asn.salesManagerId ? parseInt(asn.salesManagerId) : null,
                accountManagerId: asn.accountManagerId ? parseInt(asn.accountManagerId) : null,
                recruitmentManagerId: asn.recruitmentManagerId ? parseInt(asn.recruitmentManagerId) : null,
                secondarySalesManagerId: asn.secondarySalesManagerId ? parseInt(asn.secondarySalesManagerId) : null,
                secondaryRecruitmentManagerId: asn.secondaryRecruitmentManagerId ? parseInt(asn.secondaryRecruitmentManagerId) : null,
                defaultTatDays: asn.defaultTatDays ? parseInt(asn.defaultTatDays) : null,
                tatNotificationRecipientIds: asn.tatNotificationRecipientIds,
                defaultTaxTerm: asn.defaultTaxTerm || null,
                defaultWorkAuthorization: asn.defaultWorkAuthorization || null,
                defaultPayRateTaxTerm: asn.defaultPayRateTaxTerm || null,
                defaultBillRateTaxTerm: asn.defaultBillRateTaxTerm || null,
                postJobInCareerPortal: asn.postJobInCareerPortal || false,
                makeReferencesMandatory: asn.makeReferencesMandatory || false,
                maxSubmissions: asn.maxSubmissions ? parseInt(asn.maxSubmissions) : null,
                numberOfPositions: asn.numberOfPositions ? parseInt(asn.numberOfPositions) : null
            };
            await axios.put(`${API_URL}/ats/clients/${clientId}/assignment`, asnPayload, { headers });

            // Save Note details if filled
            const nt = formData.note;
            if (nt.notes) {
                await axios.post(`${API_URL}/ats/client-notes`, {
                    clientId: parseInt(clientId),
                    noteTitle: nt.noteTitle || "Client Onboarding Note",
                    noteBody: nt.notes,
                    actionId: nt.actionId ? parseInt(nt.actionId) : null,
                    notesPriority: nt.notesPriority || "MEDIUM",
                    remindMe: nt.remindMe || false,
                    notifyPeopleIds: nt.notifyPeopleIds ? nt.notifyPeopleIds.map(i => parseInt(i)) : []
                }, { headers });
            }

            // Save Contacts list
            if (formData.contacts && formData.contacts.length > 0) {
                for (const c of formData.contacts) {
                    // Skip completely empty contact rows
                    if (!c.firstName && !c.lastName && !c.email && !c.ownerId) {
                        continue;
                    }

                    if (!c.firstName) {
                        toast.error("Contact First Name is required");
                        setSubmitting(false);
                        return;
                    }

                    const contactEmail = (c.email || c.emailId || '').trim();
                    if (!contactEmail || contactEmail === 'null' || contactEmail === 'undefined') {
                        toast.error(`Email ID is required for contact: ${c.firstName}`);
                        setSubmitting(false);
                        return;
                    }

                    const contactOwnerId = c.ownerId || c.primaryOwnerId;
                    if (!contactOwnerId || String(contactOwnerId) === 'null' || String(contactOwnerId) === 'undefined' || isNaN(parseInt(contactOwnerId))) {
                        toast.error(`Primary Owner is required for contact: ${c.firstName}`);
                        setSubmitting(false);
                        return;
                    }

                    const cPayload = {
                        isPrimary: c.isPrimary,
                        salutation: c.salutation,
                        firstName: c.firstName,
                        lastName: c.lastName,
                        title: c.title,
                        designation: c.designation,
                        emailId: contactEmail,
                        officeNumber: c.officeNumber || c.phone,
                        officeExtension: c.officeExtension || c.phoneExtension,
                        mobileNumber: c.mobileNumber || c.mobile,
                        address1: c.address1,
                        address2: c.address2,
                        countryId: c.countryId ? parseInt(c.countryId) : null,
                        stateId: c.stateId ? parseInt(c.stateId) : null,
                        city: c.city,
                        zipCode: c.zipCode,
                        linkedinProfileUrl: c.linkedinProfileUrl || c.linkedinUrl,
                        facebookProfileUrl: c.facebookProfileUrl || c.facebookUrl,
                        twitterProfileUrl: c.twitterProfileUrl || c.twitterUrl,
                        googlePlusProfileUrl: c.googlePlusProfileUrl || c.googlePlusUrl,
                        status: c.status || 'Active',
                        technologies: c.technologies,
                        primaryOwnerId: parseInt(contactOwnerId),
                        allowAccessToAllUsers: c.allowAccessToAllUsers,
                        aboutTheContact: c.aboutTheContact || c.comment,
                        sendRequirement: c.sendRequirement,
                        sendHotlist: c.sendHotlist,
                        clientContactType: c.clientContactType,
                        clientGroup: c.clientGroup
                    };

                    if (c.id) {
                        await axios.put(`${API_URL}/ats/clients/${clientId}/contacts/${c.id}`, cPayload, { headers });
                    } else {
                        await axios.post(`${API_URL}/ats/clients/${clientId}/contacts`, cPayload, { headers });
                    }
                }
            }

            // Handle deleted contacts
            if (deletedContactIds.length > 0) {
                for (const cid of deletedContactIds) {
                    await axios.delete(`${API_URL}/ats/clients/${clientId}/contacts/${cid}`, { headers });
                }
            }

            // Save / Upload Documents
            if (formData.documents && formData.documents.length > 0) {
                for (const doc of formData.documents) {
                    if (doc.isNew) {
                        // Skip if the document is completely empty/blank
                        if (!doc.title && !doc.fileName && !doc.rawFile && !doc.documentTypeId) {
                            continue;
                        }
                        let finalFilePath = '';
                        if (doc.rawFile) {
                            const fileFormData = new FormData();
                            fileFormData.append("file", doc.rawFile);
                            const uploadRes = await axios.post(`${API_URL}/ats/clients/${clientId}/documents/upload`, fileFormData, {
                                headers: {
                                    ...headers,
                                    'Content-Type': 'multipart/form-data'
                                }
                            });
                            finalFilePath = uploadRes.data.filePath;
                        }
                        await axios.post(`${API_URL}/ats/clients/${clientId}/documents`, {
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
                    await axios.delete(`${API_URL}/ats/clients/${clientId}/documents/${docId}`, { headers });
                }
            }

            // Save / Upload Guideline Documents
            if (formData.guidelineDocuments && formData.guidelineDocuments.length > 0) {
                for (const doc of formData.guidelineDocuments) {
                    if (doc.isNew) {
                        if (!doc.documentTitle && !doc.fileName && !doc.rawFile) {
                            continue;
                        }
                        let finalFilePath = '';
                        if (doc.rawFile) {
                            const fileFormData = new FormData();
                            fileFormData.append("file", doc.rawFile);
                            const uploadRes = await axios.post(`${API_URL}/ats/clients/${clientId}/guideline/documents/upload`, fileFormData, {
                                headers: {
                                    ...headers,
                                    'Content-Type': 'multipart/form-data'
                                }
                            });
                            finalFilePath = uploadRes.data.filePath;
                        }
                        await axios.post(`${API_URL}/ats/clients/${clientId}/guideline/documents`, {
                            documentTitle: doc.documentTitle,
                            documentSource: doc.documentSource || 'CLIENT_GUIDELINE',
                            description: doc.description,
                            fileName: doc.fileName,
                            filePath: finalFilePath
                        }, { headers });
                    }
                }
            }

            // Handle deleted guideline documents
            if (deletedGuidelineDocumentIds.length > 0) {
                for (const docId of deletedGuidelineDocumentIds) {
                    await axios.delete(`${API_URL}/ats/clients/${clientId}/guideline/documents/${docId}`, { headers });
                }
            }

            toast.success(isEditMode ? "Client updated successfully!" : "Client registered successfully!");
            navigate('/ats-dashboard/clients');
        } catch (err) {
            console.error("Error saving client:", err);
            toast.error(err.response?.data?.message || "An error occurred while saving the client profile.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 bg-background text-foreground">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="text-sm font-semibold text-foreground-muted">Loading client records...</span>
            </div>
        );
    }

    const formTabs = [
        { id: 'business_info', name: 'Business Information', icon: Info },
        { id: 'assignment', name: 'Assignment', icon: Users },
        { id: 'notes', name: 'Notes', icon: StickyNote },
        { id: 'contacts', name: 'Contacts', icon: Users },
        { id: 'guidelines', name: 'Guidelines', icon: Mail },
        { id: 'documents', name: 'Documents', icon: FileText }
    ];

    return (
        <div className="fixed inset-0 bg-background flex flex-col z-50 text-foreground font-sans overflow-hidden">
            <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h1 className="text-xl font-bold text-foreground tracking-tight">
                        {isEditMode ? "Modify Client" : "Add Client"}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/ats-dashboard/clients')}
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

            <div className="flex-grow flex overflow-hidden">
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

                <main className="flex-1 bg-background overflow-y-auto p-6 flex flex-col">
                    <div className="w-full bg-card rounded-theme shadow-sm border border-border flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 py-4 bg-background-muted border-b border-border flex justify-between items-center shrink-0">
                            <h2 className="text-lg font-bold text-foreground capitalize">
                                {formTabs.find(t => t.id === activeFormTab)?.name}
                            </h2>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto bg-card">
                            {activeFormTab === 'business_info' && (
                                <AtsClientBusinessTab
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    handleMultiSelectChange={handleMultiSelectChange}
                                    countries={geoCountries}
                                    states={geoStates}
                                    businessUnits={businessUnits}
                                    employees={employees}
                                />
                            )}

                            {activeFormTab === 'assignment' && (
                                <AtsClientFormAssignmentTab
                                    assignment={formData.assignment}
                                    onChange={(asnData) => setFormData(prev => ({ ...prev, assignment: asnData }))}
                                    employees={employees}
                                />
                            )}

                            {activeFormTab === 'notes' && (
                                <AtsClientNotesTab
                                    note={formData.note}
                                    onChange={(noteData) => setFormData(prev => ({ ...prev, note: noteData }))}
                                    actions={actions}
                                    employees={employees}
                                />
                            )}

                            {activeFormTab === 'contacts' && (
                                <AtsClientFormContactsTab
                                    contacts={formData.contacts}
                                    onChange={handleContactsChange}
                                    employees={employees}
                                />
                            )}

                            {activeFormTab === 'guidelines' && (
                                <AtsClientGuidelinesTab
                                    guidelines={formData.guidelines}
                                    onChange={(gdData) => setFormData(prev => ({ ...prev, guidelines: gdData }))}
                                    guidelineDocuments={formData.guidelineDocuments}
                                    onGuidelineDocumentsChange={handleGuidelineDocumentsChange}
                                />
                            )}

                            {activeFormTab === 'documents' && (
                                <AtsClientFormDocumentsTab
                                    documents={formData.documents}
                                    onChange={handleDocumentsChange}
                                />
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AtsClientForm;
