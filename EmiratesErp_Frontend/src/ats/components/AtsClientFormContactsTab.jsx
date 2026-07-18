import React, { useState } from 'react';
import { Plus, X, Edit, Trash2, UserCheck } from 'lucide-react';
import { useAtsGeo } from '../hooks/useAtsGeo';

const AtsClientFormContactsTab = ({ contacts = [], onChange, employees = [] }) => {
    const { countries, states, setSelectedCountryName } = useAtsGeo();
    const [showContactForm, setShowContactForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

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
        ownerId: '',
        allowAccessToAllUsers: false,
        comment: '',
        sendRequirement: false,
        sendHotlist: false,
        clientContactType: '',
        clientGroup: ''
    };
    const [contactForm, setContactForm] = useState(emptyContactForm);

    const openNewContact = () => {
        setEditingIndex(null);
        setContactForm(emptyContactForm);
        setSelectedCountryName('');
        setShowContactForm(true);
    };

    const openEditContact = (index) => {
        const c = contacts[index];
        setEditingIndex(index);
        setContactForm({
            ...emptyContactForm,
            ...c,
            email: c.email || c.emailId || '',
            ownerId: c.ownerId || c.primaryOwnerId || '',
            phone: c.phone || c.officeNumber || '',
            phoneExtension: c.phoneExtension || c.officeExtension || '',
            mobile: c.mobile || c.mobileNumber || '',
            linkedinUrl: c.linkedinUrl || c.linkedinProfileUrl || '',
            facebookUrl: c.facebookUrl || c.facebookProfileUrl || '',
            twitterUrl: c.twitterUrl || c.twitterProfileUrl || '',
            googlePlusUrl: c.googlePlusUrl || c.googlePlusProfileUrl || '',
            comment: c.comment || c.aboutTheContact || ''
        });
        setSelectedCountryName('');
        setShowContactForm(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editingIndex !== null) {
            const updated = contacts.map((c, i) => i === editingIndex ? { ...contactForm } : c);
            onChange(updated);
        } else {
            onChange([...contacts, { ...contactForm }]);
        }
        setShowContactForm(false);
        setEditingIndex(null);
        setContactForm(emptyContactForm);
    };

    const handleRemove = (index) => {
        const updated = contacts.filter((_, i) => i !== index);
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">Client Contacts</h3>
                {!showContactForm && (
                    <button
                        type="button"
                        onClick={openNewContact}
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
                            {editingIndex !== null ? 'Edit Contact' : 'Add New Contact'}
                        </h4>
                        <button
                            type="button"
                            onClick={() => { setShowContactForm(false); setEditingIndex(null); }}
                            className="p-1.5 rounded-full hover:bg-background-muted text-foreground-muted hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <form onSubmit={handleSave} className="space-y-5">
                        {/* Personal Info */}
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
                                    <input type="text" value={contactForm.title} onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })} placeholder="e.g. VP of Operations" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Designation</label>
                                    <input type="text" value={contactForm.designation} onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })} placeholder="e.g. Hiring Manager" className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border" />

                        {/* Contact Details */}
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

                        {/* Address */}
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
                                    <input type="text" value={contactForm.city} onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })} className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Zip Code</label>
                                    <input type="text" value={contactForm.zipCode} onChange={(e) => setContactForm({ ...contactForm, zipCode: e.target.value })} className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border" />

                        {/* Online Profiles & Notes */}
                        <div>
                            <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-3">Online Profiles & Notes</p>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">LinkedIn URL</label>
                                    <input type="text" value={contactForm.linkedinUrl} onChange={(e) => setContactForm({ ...contactForm, linkedinUrl: e.target.value })} className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Facebook URL</label>
                                    <input type="text" value={contactForm.facebookUrl} onChange={(e) => setContactForm({ ...contactForm, facebookUrl: e.target.value })} className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Twitter URL</label>
                                    <input type="text" value={contactForm.twitterUrl} onChange={(e) => setContactForm({ ...contactForm, twitterUrl: e.target.value })} className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Google+ URL</label>
                                    <input type="text" value={contactForm.googlePlusUrl} onChange={(e) => setContactForm({ ...contactForm, googlePlusUrl: e.target.value })} className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Owner / Assigned To *</label>
                                    <select required value={contactForm.ownerId} onChange={(e) => setContactForm({ ...contactForm, ownerId: e.target.value })} className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary">
                                        <option value="">Select Owner</option>
                                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Client Contact Type</label>
                                    <select value={contactForm.clientContactType} onChange={(e) => setContactForm({ ...contactForm, clientContactType: e.target.value })} className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary">
                                        <option value="">Select Contact Type</option>
                                        <option value="Primary">Primary Contact</option>
                                        <option value="Billing">Billing Contact</option>
                                        <option value="Operations">Operations Contact</option>
                                        <option value="HR">HR Contact</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted mb-1">Client Group</label>
                                    <select value={contactForm.clientGroup} onChange={(e) => setContactForm({ ...contactForm, clientGroup: e.target.value })} className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary">
                                        <option value="">Select Group</option>
                                        <option value="Group A">Group A</option>
                                        <option value="Group B">Group B</option>
                                        <option value="Group C">Group C</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-xs font-bold text-foreground-muted mb-1">Comments / Notes</label>
                                <textarea rows={3} value={contactForm.comment} onChange={(e) => setContactForm({ ...contactForm, comment: e.target.value })} className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:border-primary resize-none" placeholder="Internal notes about this contact..." />
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

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2 border-t border-border">
                            <button
                                type="button"
                                onClick={() => { setShowContactForm(false); setEditingIndex(null); }}
                                className="px-4 py-2 border border-border rounded-theme text-sm font-semibold text-foreground-muted hover:bg-background-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-theme hover:bg-primary/90 transition-colors shadow shadow-primary/10"
                            >
                                {editingIndex !== null ? 'Update Contact' : 'Save Contact'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Contacts List */}
            {contacts.length === 0 && !showContactForm ? (
                <div className="text-center py-10 text-foreground-muted text-sm">
                    No contacts added yet. Click <span className="font-bold text-foreground">+ Add Contact</span> to get started.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contacts.map((c, index) => (
                        <div key={index} className="p-4 rounded-theme border border-border hover:border-border/80 bg-background/50 shadow-xs relative flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-foreground text-sm">
                                        {c.salutation ? `${c.salutation} ` : ''}{c.firstName} {c.lastName}
                                    </span>
                                    {c.isPrimary && (
                                        <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-theme">
                                            Primary
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-foreground-muted mt-1 capitalize font-medium">
                                    {c.designation || c.title || 'Contact'}
                                </div>

                                <div className="text-xs text-foreground mt-3 space-y-1 font-semibold">
                                    <div>Email: {c.email || c.emailId}</div>
                                    <div>Phone: {c.phone || c.officeNumber || '-'} {(c.phoneExtension || c.officeExtension) ? `x${c.phoneExtension || c.officeExtension}` : ''}</div>
                                    <div>Mobile: {c.mobile || c.mobileNumber || '-'}</div>
                                    {c.city && <div>Location: {c.city}</div>}
                                    {c.clientContactType && <div>Type: {c.clientContactType}</div>}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-1.5 mt-4 pt-2 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => openEditContact(index)}
                                    className="p-1.5 hover:bg-background border border-border text-foreground-muted hover:text-primary rounded-theme transition-all"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
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

export default AtsClientFormContactsTab;
