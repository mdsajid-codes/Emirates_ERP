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
    MapPin,
    Lock,
    Unlock,
    MessageSquare,
    Link2,
    Users2
} from 'lucide-react';
import { useAtsGeo } from '../hooks/useAtsGeo';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsVendorFormContactsTab = ({
    contacts = [],
    onChange,
    employees = []
}) => {
    const {
        countries,
        states,
        setSelectedCountryName
    } = useAtsGeo();

    const [showContactForm, setShowContactForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    
    const emptyContactForm = {
        isPrimary: false,
        salutation: '',
        firstName: '',
        lastName: '',
        title: '',
        designation: '',
        email: '',
        phone: '',
        phoneExtension: '',
        mobile: '',
        address1: '',
        address2: '',
        countryId: '',
        stateId: '',
        city: '',
        zipCode: '',
        linkedinUrl: '',
        facebookUrl: '',
        twitterUrl: '',
        googlePlusUrl: '',
        status: 'Active',
        technologies: '',
        ownerId: '',
        allowAccessToAllUsers: false,
        comment: '',
        sendRequirement: false,
        sendHotlist: false,
        vendorContactType: '',
        vendorGroup: ''
    };

    const [contactForm, setContactForm] = useState(emptyContactForm);

    const openContactForm = (index = null) => {
        if (index !== null) {
            setEditingIndex(index);
            const contactToEdit = contacts[index];
            setContactForm({
                isPrimary: contactToEdit.isPrimary || false,
                salutation: contactToEdit.salutation || '',
                firstName: contactToEdit.firstName || '',
                lastName: contactToEdit.lastName || '',
                title: contactToEdit.title || '',
                designation: contactToEdit.designation || '',
                email: contactToEdit.email || '',
                phone: contactToEdit.phone || '',
                phoneExtension: contactToEdit.phoneExtension || '',
                mobile: contactToEdit.mobile || '',
                address1: contactToEdit.address1 || '',
                address2: contactToEdit.address2 || '',
                countryId: contactToEdit.countryId || '',
                stateId: contactToEdit.stateId || '',
                city: contactToEdit.city || '',
                zipCode: contactToEdit.zipCode || '',
                linkedinUrl: contactToEdit.linkedinUrl || '',
                facebookUrl: contactToEdit.facebookUrl || '',
                twitterUrl: contactToEdit.twitterUrl || '',
                googlePlusUrl: contactToEdit.googlePlusUrl || '',
                status: contactToEdit.status || 'Active',
                technologies: contactToEdit.technologies || '',
                ownerId: contactToEdit.ownerId || '',
                allowAccessToAllUsers: contactToEdit.allowAccessToAllUsers || false,
                comment: contactToEdit.comment || '',
                sendRequirement: contactToEdit.sendRequirement || false,
                sendHotlist: contactToEdit.sendHotlist || false,
                vendorContactType: contactToEdit.vendorContactType || '',
                vendorGroup: contactToEdit.vendorGroup || ''
            });
            const cName = countries.find(c => String(c.id) === String(contactToEdit.countryId))?.name || '';
            setSelectedCountryName(cName);
        } else {
            setEditingIndex(null);
            setContactForm(emptyContactForm);
            setSelectedCountryName('');
        }
        setShowContactForm(true);
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        
        let updatedContacts = [...contacts];
        const contactData = {
            ...contactForm,
            countryId: contactForm.countryId ? parseInt(contactForm.countryId) : null,
            stateId: contactForm.stateId ? parseInt(contactForm.stateId) : null,
            ownerId: contactForm.ownerId ? parseInt(contactForm.ownerId) : null,
        };

        // If setting this one as primary, reset other primaries in list
        if (contactData.isPrimary) {
            updatedContacts = updatedContacts.map(c => ({ ...c, isPrimary: false }));
        }

        if (editingIndex !== null) {
            updatedContacts[editingIndex] = contactData;
            toast.success("Contact updated in list.");
        } else {
            updatedContacts.push(contactData);
            toast.success("Contact added to list.");
        }

        onChange(updatedContacts);
        setShowContactForm(false);
        setEditingIndex(null);
    };

    const handleDeleteContact = (index) => {
        if (!window.confirm("Remove this contact from the list?")) return;
        const updated = contacts.filter((_, i) => i !== index);
        onChange(updated);
        toast.info("Contact removed.");
    };

    const handleSetPrimaryContact = (index) => {
        const updated = contacts.map((c, i) => ({
            ...c,
            isPrimary: i === index
        }));
        onChange(updated);
        toast.success("Primary contact updated.");
    };

    return (
        <div className="space-y-6 text-foreground font-sans">
            <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold flex items-center gap-2">
                    <Users className="h-4.5 w-4.5 text-primary" />
                    Vendor Contacts
                </h3>
                {!showContactForm && (
                    <button
                        type="button"
                        onClick={() => openContactForm(null)}
                        className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-theme hover:bg-primary/90 shadow-sm"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Contact
                    </button>
                )}
            </div>

            {/* INLINE CONTACT FORM */}
            {showContactForm && (
                <div className="border border-border rounded-xl bg-card p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <h4 className="text-sm font-bold text-foreground">
                            {editingIndex !== null ? 'Modify Contact Details' : 'Register New Contact'}
                        </h4>
                        <button
                            type="button"
                            onClick={() => { setShowContactForm(false); setEditingIndex(null); }}
                            className="p-1.5 rounded-full hover:bg-background-muted text-foreground-muted hover:text-foreground transition-colors"
                        >
                            <X className="h-4.5 w-4.5" />
                        </button>
                    </div>

                    <form onSubmit={handleContactSubmit} className="space-y-6">
                        {/* Section: Standard Fields */}
                        <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Standard Fields</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">First Name *</label>
                                    <input
                                        required
                                        type="text"
                                        value={contactForm.firstName}
                                        onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. John"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">Last Name *</label>
                                    <input
                                        required
                                        type="text"
                                        value={contactForm.lastName}
                                        onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. Smith"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">Email ID *</label>
                                    <input
                                        required
                                        type="email"
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. john.smith@company.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">Designation</label>
                                    <input
                                        type="text"
                                        value={contactForm.designation}
                                        onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. Talent Acquisition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">Work Phone</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={contactForm.phone}
                                            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                            className="px-3 py-2 flex-grow text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="Phone Number"
                                        />
                                        <input
                                            type="text"
                                            value={contactForm.phoneExtension}
                                            onChange={(e) => setContactForm({ ...contactForm, phoneExtension: e.target.value })}
                                            className="px-2 py-2 w-20 text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="Ext"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">Mobile Number</label>
                                    <input
                                        type="text"
                                        value={contactForm.mobile}
                                        onChange={(e) => setContactForm({ ...contactForm, mobile: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Mobile Number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">Address 1</label>
                                    <input
                                        type="text"
                                        value={contactForm.address1}
                                        onChange={(e) => setContactForm({ ...contactForm, address1: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Street Address Line 1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">Address 2</label>
                                    <input
                                        type="text"
                                        value={contactForm.address2}
                                        onChange={(e) => setContactForm({ ...contactForm, address2: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Street Address Line 2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">Country</label>
                                    <select
                                        value={contactForm.countryId}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const matched = countries.find(c => String(c.id) === String(val));
                                            setSelectedCountryName(matched ? matched.name : '');
                                            setContactForm({ ...contactForm, countryId: val, stateId: '' });
                                        }}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">State</label>
                                    <select
                                        value={contactForm.stateId}
                                        onChange={(e) => setContactForm({ ...contactForm, stateId: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                    >
                                        <option value="">Select State</option>
                                        {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">City</label>
                                    <input
                                        type="text"
                                        value={contactForm.city}
                                        onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="City"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">Zip Code</label>
                                    <input
                                        type="text"
                                        value={contactForm.zipCode}
                                        onChange={(e) => setContactForm({ ...contactForm, zipCode: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Zip Code"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">LinkedIn Profile URL</label>
                                    <input
                                        type="text"
                                        value={contactForm.linkedinUrl}
                                        onChange={(e) => setContactForm({ ...contactForm, linkedinUrl: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="LinkedIn URL"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">Facebook Profile URL</label>
                                    <input
                                        type="text"
                                        value={contactForm.facebookUrl}
                                        onChange={(e) => setContactForm({ ...contactForm, facebookUrl: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Facebook URL"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">Twitter Profile URL</label>
                                    <input
                                        type="text"
                                        value={contactForm.twitterUrl}
                                        onChange={(e) => setContactForm({ ...contactForm, twitterUrl: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Twitter URL"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">Google+ Profile URL</label>
                                    <input
                                        type="text"
                                        value={contactForm.googlePlusUrl}
                                        onChange={(e) => setContactForm({ ...contactForm, googlePlusUrl: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Google+ URL"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">Status</label>
                                    <select
                                        value={contactForm.status}
                                        onChange={(e) => setContactForm({ ...contactForm, status: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Do Not Contact">Do Not Contact</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">Technologies</label>
                                    <input
                                        type="text"
                                        value={contactForm.technologies}
                                        onChange={(e) => setContactForm({ ...contactForm, technologies: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. Java, React"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5">Owner</label>
                                    <select
                                        value={contactForm.ownerId}
                                        onChange={(e) => setContactForm({ ...contactForm, ownerId: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                    >
                                        <option value="">Unassigned</option>
                                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5 font-sans">Vendor Contact Type</label>
                                    <select
                                        value={contactForm.vendorContactType}
                                        onChange={(e) => setContactForm({ ...contactForm, vendorContactType: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
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
                                    <label className="block text-xs font-bold text-foreground-muted mb-1.5 font-sans">Vendor Group</label>
                                    <select
                                        value={contactForm.vendorGroup}
                                        onChange={(e) => setContactForm({ ...contactForm, vendorGroup: e.target.value })}
                                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                    >
                                        <option value="">Select Group</option>
                                        <option value="Group A">Group A</option>
                                        <option value="Group B">Group B</option>
                                        <option value="Group C">Group C</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-3 justify-end pb-1">
                                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={contactForm.allowAccessToAllUsers}
                                            onChange={(e) => setContactForm({ ...contactForm, allowAccessToAllUsers: e.target.checked })}
                                            className="w-4.5 h-4.5 text-primary border-border rounded focus:ring-primary/30"
                                        />
                                        <span className="text-xs font-semibold text-foreground">Allow Access to All Users</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Textarea comment */}
                        <div>
                            <label className="block text-xs font-bold text-foreground-muted mb-1.5">Comment</label>
                            <textarea
                                rows={3}
                                value={contactForm.comment}
                                onChange={(e) => setContactForm({ ...contactForm, comment: e.target.value })}
                                className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                placeholder="Internal comments about this contact..."
                            />
                        </div>

                        {/* Checkboxes: Send Requirement / Send Hotlist / Primary */}
                        <div className="flex gap-6 items-center flex-wrap">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={contactForm.isPrimary}
                                    onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })}
                                    className="w-4.5 h-4.5 text-primary border-border rounded focus:ring-primary/30"
                                />
                                <span className="text-xs font-bold text-foreground">Primary Contact</span>
                            </label>

                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={contactForm.sendRequirement}
                                    onChange={(e) => setContactForm({ ...contactForm, sendRequirement: e.target.checked })}
                                    className="w-4.5 h-4.5 text-primary border-border rounded focus:ring-primary/30"
                                />
                                <span className="text-xs font-bold text-foreground">Send Requirement</span>
                            </label>

                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={contactForm.sendHotlist}
                                    onChange={(e) => setContactForm({ ...contactForm, sendHotlist: e.target.checked })}
                                    className="w-4.5 h-4.5 text-primary border-border rounded focus:ring-primary/30"
                                />
                                <span className="text-xs font-bold text-foreground">Send Hotlist</span>
                            </label>
                        </div>

                        {/* Submission Buttons */}
                        <div className="flex justify-end gap-3 pt-3 border-t border-border">
                            <button
                                type="button"
                                onClick={() => { setShowContactForm(false); setEditingIndex(null); }}
                                className="px-4 py-2 border border-border rounded-theme text-sm font-semibold text-foreground-muted hover:bg-background-muted transition-colors shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-theme text-sm font-bold shadow shadow-primary/10 hover:bg-primary/90 transition-colors"
                            >
                                {editingIndex !== null ? 'Save Changes' : 'Register Contact'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* CONTACTS LIST CARDS */}
            {!showContactForm && contacts.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-xl text-foreground-muted text-sm select-none">
                    No contacts created. Click <span className="font-bold text-foreground">+ Add Contact</span> to register a new contact.
                </div>
            )}

            {!showContactForm && contacts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contacts.map((c, i) => (
                        <div key={i} className="p-4 rounded-xl border border-border bg-card/60 shadow-xs relative flex flex-col justify-between hover:border-primary/30 transition-all">
                            <div>
                                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                                    <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                                        {c.firstName} {c.lastName}
                                        {c.isPrimary && (
                                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-1.5 py-0.5 rounded-theme">
                                                Primary
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-foreground-muted">
                                        {c.vendorContactType || 'General'}
                                    </span>
                                </div>

                                <div className="text-xs text-foreground mt-3 space-y-2">
                                    <div className="flex items-center gap-2"><Mail size={13} className="text-primary/75" /> <span className="truncate">{c.email}</span></div>
                                    {(c.phone || c.mobile) && (
                                        <div className="flex items-center gap-2"><Phone size={13} className="text-primary/75" /> <span>{c.mobile || c.phone}</span></div>
                                    )}
                                    {c.city && (
                                        <div className="flex items-center gap-2"><MapPin size={13} className="text-primary/75" /> <span>{c.city}</span></div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-2 border-t border-border/40 text-xs">
                                <div className="flex gap-2">
                                    {!c.isPrimary && (
                                        <button
                                            type="button"
                                            onClick={() => handleSetPrimaryContact(i)}
                                            className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                                        >
                                            <UserCheck size={12} /> Set Primary
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => openContactForm(i)}
                                        className="p-1 hover:bg-background border border-border text-foreground-muted hover:text-primary rounded transition-all"
                                    >
                                        <Edit size={13} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteContact(i)}
                                        className="p-1 hover:bg-background border border-border text-foreground-muted hover:text-destructive rounded transition-all"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AtsVendorFormContactsTab;
