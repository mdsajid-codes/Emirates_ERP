import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    Users, 
    Plus, 
    X, 
    Edit, 
    Trash2, 
    UserCheck,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';
import { useAtsGeo } from '../../hooks/useAtsGeo';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsClientContactsTab = ({ clientId, contacts, onRefresh }) => {
    const {
        countries,
        states,
        setSelectedCountryName
    } = useAtsGeo();

    const [showContactForm, setShowContactForm] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [employees, setEmployees] = useState([]);
    
    const emptyContactForm = {
        isPrimary: false,
        salutation: '',
        firstName: '', lastName: '',
        title: '', designation: '',
        email: '', phone: '', phoneExtension: '', mobile: '',
        address1: '', address2: '',
        countryId: '', stateId: '', city: '', zipCode: '',
        linkedinUrl: '', facebookUrl: '', twitterUrl: '', googlePlusUrl: '',
        status: 'Active',
        technologies: '',
        ownerId: '',
        allowAccessToAllUsers: false,
        comment: '',
        sendRequirement: false,
        sendHotlist: false,
        clientContactType: '',
        clientGroup: ''
    };
    const [contactForm, setContactForm] = useState(emptyContactForm);

    const openContactForm = async (contactToEdit = null) => {
        if (employees.length === 0) {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const eRes = await axios.get(`${API_URL}/employees/all`, { headers });
                setEmployees(eRes.data || []);
            } catch (e) { 
                console.error('Failed to load employees for dropdown', e); 
            }
        }
        if (contactToEdit) {
            setEditingContact(contactToEdit);
            setContactForm({
                isPrimary: contactToEdit.isPrimary || false,
                salutation: contactToEdit.salutation || '',
                firstName: contactToEdit.firstName || '',
                lastName: contactToEdit.lastName || '',
                title: contactToEdit.title || '',
                designation: contactToEdit.designation || '',
                email: contactToEdit.email || contactToEdit.emailId || '',
                phone: contactToEdit.phone || contactToEdit.officeNumber || '',
                phoneExtension: contactToEdit.phoneExtension || contactToEdit.officeExtension || '',
                mobile: contactToEdit.mobile || contactToEdit.mobileNumber || '',
                address1: contactToEdit.address1 || '',
                address2: contactToEdit.address2 || '',
                countryId: contactToEdit.countryId || contactToEdit.country?.id || '',
                stateId: contactToEdit.stateId || contactToEdit.state?.id || '',
                city: contactToEdit.city || '',
                zipCode: contactToEdit.zipCode || '',
                linkedinUrl: contactToEdit.linkedinUrl || contactToEdit.linkedinProfileUrl || '',
                facebookUrl: contactToEdit.facebookUrl || contactToEdit.facebookProfileUrl || '',
                twitterUrl: contactToEdit.twitterUrl || contactToEdit.twitterProfileUrl || '',
                googlePlusUrl: contactToEdit.googlePlusUrl || contactToEdit.googlePlusProfileUrl || '',
                status: contactToEdit.status || 'Active',
                technologies: contactToEdit.technologies || '',
                ownerId: contactToEdit.ownerId || contactToEdit.primaryOwnerId || contactToEdit.owner?.id || '',
                allowAccessToAllUsers: contactToEdit.allowAccessToAllUsers || false,
                comment: contactToEdit.comment || contactToEdit.aboutTheContact || '',
                sendRequirement: contactToEdit.sendRequirement || false,
                sendHotlist: contactToEdit.sendHotlist || false,
                clientContactType: contactToEdit.clientContactType || '',
                clientGroup: contactToEdit.clientGroup || ''
            });
            const cName = contactToEdit.countryName || contactToEdit.country?.name || '';
            setSelectedCountryName(cName);
        } else {
            setEditingContact(null);
            setContactForm(emptyContactForm);
            setSelectedCountryName('');
        }
        setShowContactForm(true);
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        if (!contactForm.ownerId) {
            toast.error("Primary Owner is required.");
            return;
        }
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const payload = {
                firstName: contactForm.firstName,
                lastName: contactForm.lastName,
                designation: contactForm.designation,
                officeNumber: contactForm.phone,
                officeExtension: contactForm.phoneExtension,
                mobileNumber: contactForm.mobile,
                emailId: contactForm.email,
                primaryOwnerId: parseInt(contactForm.ownerId),
                allowAccessToAllUsers: contactForm.allowAccessToAllUsers,
                address1: contactForm.address1,
                address2: contactForm.address2,
                countryId: contactForm.countryId ? parseInt(contactForm.countryId) : null,
                stateId: contactForm.stateId ? parseInt(contactForm.stateId) : null,
                city: contactForm.city,
                zipCode: contactForm.zipCode,
                linkedinProfileUrl: contactForm.linkedinUrl,
                facebookProfileUrl: contactForm.facebookUrl,
                twitterProfileUrl: contactForm.twitterUrl,
                googlePlusProfileUrl: contactForm.googlePlusUrl,
                status: contactForm.status,
                clientGroup: contactForm.clientGroup,
                aboutTheContact: contactForm.comment
            };
            if (editingContact) {
                await axios.put(`${API_URL}/ats/clients/${clientId}/contacts/${editingContact.id}`, payload, { headers });
                toast.success("Contact updated.");
            } else {
                await axios.post(`${API_URL}/ats/clients/${clientId}/contacts`, payload, { headers });
                toast.success("Contact created.");
            }
            setShowContactForm(false);
            setEditingContact(null);
            onRefresh();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save contact.");
        }
    };

    const handleSetPrimaryContact = async (cId) => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            await axios.patch(`${API_URL}/ats/clients/${clientId}/contacts/${cId}/set-primary`, {}, { headers });
            toast.success("Primary contact updated.");
            onRefresh();
        } catch (err) {
            toast.error("Failed to update primary contact.");
        }
    };

    const handleDeleteContact = async (cId) => {
        if (!window.confirm("Delete this contact permanently?")) return;
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            await axios.delete(`${API_URL}/ats/clients/${clientId}/contacts/${cId}`, { headers });
            toast.success("Contact deleted.");
            onRefresh();
        } catch (err) {
            toast.error("Failed to delete contact.");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">Client Contacts</h3>
                {!showContactForm && (
                    <button
                        onClick={() => openContactForm(null)}
                        className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-theme hover:bg-primary/90 shadow-sm"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Contact
                    </button>
                )}
            </div>

            {showContactForm && (
                <div className="bg-background-muted/50 border border-border rounded-theme p-5 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-foreground">
                            {editingContact ? 'Edit Contact' : 'Add New Contact'}
                        </h4>
                        <button
                            type="button"
                            onClick={() => { setShowContactForm(false); setEditingContact(null); }}
                            className="p-1.5 rounded-full hover:bg-background-muted text-foreground-muted hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <form onSubmit={handleContactSubmit} className="space-y-5">
                        <div>
                            <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-3">Personal Information</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Salutation</label>
                                    <select value={contactForm.salutation} onChange={(e) => setContactForm({ ...contactForm, salutation: e.target.value })} className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary">
                                        <option value="">None</option>
                                        {['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">First Name *</label>
                                    <input required type="text" value={contactForm.firstName} onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })} placeholder="John" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Last Name *</label>
                                    <input required type="text" value={contactForm.lastName} onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })} placeholder="Smith" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div className="flex items-end gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={contactForm.isPrimary} onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary" />
                                        <span className="text-xs font-bold text-foreground-muted">Set as Primary</span>
                                    </label>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Title</label>
                                    <input type="text" value={contactForm.title} onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })} placeholder="e.g. VP of IT" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Designation</label>
                                    <input type="text" value={contactForm.designation} onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })} placeholder="e.g. Manager" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border" />

                        <div>
                            <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-3">Contact Details</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Email *</label>
                                    <input required type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} placeholder="john.smith@client.com" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Status</label>
                                    <select value={contactForm.status} onChange={(e) => setContactForm({ ...contactForm, status: e.target.value })} className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary">
                                        {['Active', 'Inactive', 'Do Not Contact'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Phone</label>
                                    <input type="text" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="+1 555-100-2000" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Phone Extension</label>
                                    <input type="text" value={contactForm.phoneExtension} onChange={(e) => setContactForm({ ...contactForm, phoneExtension: e.target.value })} placeholder="e.g. 204" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Mobile</label>
                                    <input type="text" value={contactForm.mobile} onChange={(e) => setContactForm({ ...contactForm, mobile: e.target.value })} placeholder="+1 555-000-1234" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border" />

                        <div>
                            <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-3">Address</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Address Line 1</label>
                                    <input type="text" value={contactForm.address1} onChange={(e) => setContactForm({ ...contactForm, address1: e.target.value })} placeholder="Street address" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Address Line 2</label>
                                    <input type="text" value={contactForm.address2} onChange={(e) => setContactForm({ ...contactForm, address2: e.target.value })} placeholder="Suite, Floor, etc." className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Country</label>
                                    <select
                                        value={contactForm.countryId}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const matched = countries.find(c => String(c.id) === String(val));
                                            setSelectedCountryName(matched ? matched.name : '');
                                            setContactForm({ ...contactForm, countryId: val, stateId: '' });
                                        }}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary"
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">State / Province</label>
                                    <select
                                        value={contactForm.stateId}
                                        onChange={(e) => setContactForm({ ...contactForm, stateId: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary"
                                    >
                                        <option value="">Select State</option>
                                        {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">City</label>
                                    <input type="text" value={contactForm.city} onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })} placeholder="e.g. Austin" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Zip Code</label>
                                    <input type="text" value={contactForm.zipCode} onChange={(e) => setContactForm({ ...contactForm, zipCode: e.target.value })} placeholder="e.g. 78701" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border" />

                        <div>
                            <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-3">Online Profiles & Notes</p>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">LinkedIn URL</label>
                                    <input type="text" value={contactForm.linkedinUrl} onChange={(e) => setContactForm({ ...contactForm, linkedinUrl: e.target.value })} placeholder="LinkedIn URL" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Facebook URL</label>
                                    <input type="text" value={contactForm.facebookUrl} onChange={(e) => setContactForm({ ...contactForm, facebookUrl: e.target.value })} placeholder="Facebook URL" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Twitter URL</label>
                                    <input type="text" value={contactForm.twitterUrl} onChange={(e) => setContactForm({ ...contactForm, twitterUrl: e.target.value })} placeholder="Twitter URL" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Google+ URL</label>
                                    <input type="text" value={contactForm.googlePlusUrl} onChange={(e) => setContactForm({ ...contactForm, googlePlusUrl: e.target.value })} placeholder="Google+ URL" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                                <div className="sm:col-span-1">
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Technologies / Skills</label>
                                    <input type="text" value={contactForm.technologies} onChange={(e) => setContactForm({ ...contactForm, technologies: e.target.value })} placeholder="e.g. Java, React, AWS" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Owner / Assigned To *</label>
                                    <select required value={contactForm.ownerId} onChange={(e) => setContactForm({ ...contactForm, ownerId: e.target.value })} className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary">
                                        <option value="">Select Owner</option>
                                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Client Contact Type</label>
                                    <select
                                        value={contactForm.clientContactType}
                                        onChange={(e) => setContactForm({ ...contactForm, clientContactType: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary cursor-pointer"
                                    >
                                        <option value="">Select Contact Type</option>
                                        <option value="Primary">Primary Contact</option>
                                        <option value="Billing">Billing Contact</option>
                                        <option value="Operations">Operations Contact</option>
                                        <option value="Sales">Sales Representative</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Client Group</label>
                                    <select
                                        value={contactForm.clientGroup}
                                        onChange={(e) => setContactForm({ ...contactForm, clientGroup: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary cursor-pointer"
                                    >
                                        <option value="">Select Group</option>
                                        <option value="Group A">Group A</option>
                                        <option value="Group B">Group B</option>
                                        <option value="Group C">Group C</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-xs font-bold text-foreground-muted mb-1">Comments / Notes</label>
                                <textarea rows={3} value={contactForm.comment} onChange={(e) => setContactForm({ ...contactForm, comment: e.target.value })} placeholder="Internal notes about this contact..." className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary resize-none" />
                            </div>
                            <div className="mt-3 flex items-center gap-6 flex-wrap">
                                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" checked={contactForm.allowAccessToAllUsers} onChange={(e) => setContactForm({ ...contactForm, allowAccessToAllUsers: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary" />
                                    <span className="text-xs font-bold text-foreground-muted">Allow access to all users</span>
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" checked={contactForm.sendRequirement} onChange={(e) => setContactForm({ ...contactForm, sendRequirement: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary" />
                                    <span className="text-xs font-bold text-foreground-muted">Send Requirement</span>
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" checked={contactForm.sendHotlist} onChange={(e) => setContactForm({ ...contactForm, sendHotlist: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary" />
                                    <span className="text-xs font-bold text-foreground-muted">Send Hotlist</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-border">
                            <button
                                type="button"
                                onClick={() => { setShowContactForm(false); setEditingContact(null); }}
                                className="px-4 py-2 border border-border rounded-theme text-sm font-semibold text-foreground-muted hover:bg-background-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-theme hover:bg-primary/90 transition-colors shadow shadow-primary/10"
                            >
                                {editingContact ? 'Update Contact' : 'Save Contact'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {contacts.length === 0 && !showContactForm ? (
                <div className="text-center py-10 text-foreground-muted text-sm">
                    No contacts added yet. Click <span className="font-bold text-foreground">+ Add Contact</span> to get started.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contacts.map(c => (
                        <div key={c.id} className="p-4 rounded-theme border border-border hover:border-border/80 bg-background/50 shadow-xs relative flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-foreground text-sm">
                                        {c.salutation ? `${c.salutation} ` : ''}{c.firstName} {c.lastName}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {c.isPrimary && (
                                            <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-theme">
                                                Primary
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs text-foreground-muted mt-1 capitalize font-medium">
                                    {c.designation || c.title || 'Agent'}
                                </div>

                                <div className="text-xs text-foreground mt-3 space-y-1 font-semibold">
                                    <div>Email: {c.email || c.emailId}</div>
                                    <div>Phone: {c.phone || c.officeNumber || '-'} {(c.phoneExtension || c.officeExtension) ? `x${c.phoneExtension || c.officeExtension}` : ''}</div>
                                    <div>Mobile: {c.mobile || c.mobileNumber || '-'}</div>
                                    {c.city && <div>Location: {c.city}{c.countryName ? `, ${c.countryName}` : ''}</div>}
                                    {c.clientContactType && <div>Type: {c.clientContactType}</div>}
                                    {c.clientGroup && <div>Group: {c.clientGroup}</div>}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-1.5 mt-4 pt-2 border-t border-border">
                                <button
                                    onClick={() => openContactForm(c)}
                                    className="p-1.5 hover:bg-background border border-border text-foreground-muted hover:text-primary rounded-theme transition-all"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteContact(c.id)}
                                    className="p-1.5 hover:bg-background border border-border text-foreground-muted hover:text-destructive rounded-theme transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AtsClientContactsTab;
