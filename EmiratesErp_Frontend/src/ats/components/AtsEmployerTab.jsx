import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2, Plus, Edit2, Trash2, Save, Users, Search } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsEmployerTab = ({ applicantId }) => {
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Vendor search state
    const [vendorSearch, setVendorSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const [form, setForm] = useState({
        mode: 'NEW', // 'NEW' or 'EXISTING'
        vendorId: null,
        firstName: '',
        lastName: '',
        employerName: '',
        officeNumber: '',
        officeExtension: '',
        email: '',
        mobileNumber: '',
        status: ''
    });

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchEmployers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/ats/applicants/${applicantId}/employers`, { headers });
            setEmployers(res.data || []);
        } catch (e) {
            console.error("Failed to fetch applicant employers", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (applicantId) {
            fetchEmployers();
        }
    }, [applicantId]);

    // Handle clicks outside of dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Vendor Contact search fetch
    useEffect(() => {
        if (form.mode !== 'EXISTING' || !vendorSearch.trim()) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await axios.get(`${API_URL}/ats/vendor-contacts/search?q=${encodeURIComponent(vendorSearch)}`, { headers });
                setSearchResults(res.data || []);
                setShowDropdown(true);
            } catch (err) {
                console.error("Search error", err);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [vendorSearch, form.mode]);

    const resetForm = () => {
        setForm({
            mode: 'NEW',
            vendorId: null,
            firstName: '',
            lastName: '',
            employerName: '',
            officeNumber: '',
            officeExtension: '',
            email: '',
            mobileNumber: '',
            status: ''
        });
        setVendorSearch('');
        setSearchResults([]);
        setIsEditing(false);
        setEditId(null);
    };

    const handleEditClick = (emp) => {
        setIsEditing(true);
        setEditId(emp.id);
        setForm({
            mode: emp.mode || 'NEW',
            vendorId: emp.vendorId || null,
            firstName: emp.firstName || '',
            lastName: emp.lastName || '',
            employerName: emp.employerName || '',
            officeNumber: emp.officeNumber || '',
            officeExtension: emp.officeExtension || '',
            email: emp.email || '',
            mobileNumber: emp.mobileNumber || '',
            status: emp.status || ''
        });
        if (emp.mode === 'EXISTING' && emp.vendorName) {
            setVendorSearch(`${emp.firstName} ${emp.lastName} (${emp.vendorName})`);
        } else {
            setVendorSearch('');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this employer entry?")) return;
        try {
            await axios.delete(`${API_URL}/ats/applicants/${applicantId}/employers/${id}`, { headers });
            toast.success("Employer entry deleted.");
            fetchEmployers();
        } catch (err) {
            toast.error("Failed to delete employer.");
        }
    };

    const handleSelectVendorContact = (contact) => {
        setForm({
            ...form,
            vendorId: contact.vendorId || null,
            firstName: contact.firstName || '',
            lastName: contact.lastName || '',
            employerName: contact.vendorName || '',
            officeNumber: contact.phone || '',
            officeExtension: contact.phoneExtension || '',
            email: contact.email || '',
            mobileNumber: contact.mobile || '',
            status: contact.status || ''
        });
        setVendorSearch(`${contact.firstName} ${contact.lastName} (${contact.vendorName || 'No Vendor Name'})`);
        setShowDropdown(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.mode === 'EXISTING' && !form.vendorId) {
            toast.error("Vendor selection is required for Existing mode.");
            return;
        }
        setSubmitting(true);
        try {
            if (editId) {
                await axios.put(`${API_URL}/ats/applicants/${applicantId}/employers/${editId}`, form, { headers });
                toast.success("Employer details updated.");
            } else {
                await axios.post(`${API_URL}/ats/applicants/${applicantId}/employers`, form, { headers });
                toast.success("Employer details added.");
            }
            resetForm();
            fetchEmployers();
        } catch (err) {
            console.error("Save error", err);
            toast.error(err.response?.data?.message || "Failed to save employer details.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-32"><Loader2 className="animate-spin text-primary h-6 w-6" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Employer Details</span>
                </h3>
                {!isEditing && (
                    <button 
                        onClick={() => { resetForm(); setIsEditing(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-theme shadow-sm hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Employer</span>
                    </button>
                )}
            </div>

            {isEditing && (
                <form onSubmit={handleSubmit} className="p-4 bg-background-muted border border-border rounded-theme space-y-4">
                    <h4 className="text-sm font-bold text-foreground">{editId ? 'Edit Employer Details' : 'Add Employer Details'}</h4>
                    
                    {/* Mode Toggle */}
                    <div className="flex items-center gap-4 py-2 border-b border-border/50">
                        <span className="text-xs font-bold text-foreground-muted">Type:</span>
                        <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                            <input 
                                type="radio" 
                                name="mode" 
                                value="NEW" 
                                checked={form.mode === 'NEW'} 
                                onChange={() => setForm({ ...form, mode: 'NEW', vendorId: null })}
                                className="text-primary focus:ring-primary/20"
                            />
                            <span>New</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                            <input 
                                type="radio" 
                                name="mode" 
                                value="EXISTING" 
                                checked={form.mode === 'EXISTING'} 
                                onChange={() => setForm({ ...form, mode: 'EXISTING' })}
                                className="text-primary focus:ring-primary/20"
                            />
                            <span>Existing (Vendor Contact)</span>
                        </label>
                    </div>

                    {/* Search Field for Existing Mode */}
                    {form.mode === 'EXISTING' && (
                        <div className="relative" ref={dropdownRef}>
                            <label className="text-xs font-bold text-foreground-muted flex items-center gap-1">
                                <span>Search Vendor Contact *</span>
                                {searching && <Loader2 className="animate-spin h-3 w-3 text-primary" />}
                            </label>
                            <div className="relative mt-1">
                                <input 
                                    type="text"
                                    placeholder="Search by contact name or email..."
                                    value={vendorSearch}
                                    onChange={(e) => setVendorSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                    onClick={() => vendorSearch && setShowDropdown(true)}
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
                            </div>

                            {showDropdown && searchResults.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-card border border-border rounded-theme shadow-lg max-h-60 overflow-y-auto divide-y divide-border/50 text-xs">
                                    {searchResults.map((contact) => (
                                        <li 
                                            key={contact.id}
                                            onClick={() => handleSelectVendorContact(contact)}
                                            className="px-3 py-2 hover:bg-background-muted cursor-pointer transition-colors"
                                        >
                                            <div className="font-bold text-foreground">{contact.firstName} {contact.lastName}</div>
                                            <div className="text-foreground-muted text-[10px]">
                                                {contact.email} | Vendor: {contact.vendorName || 'N/A'}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {showDropdown && searchResults.length === 0 && vendorSearch.trim() !== '' && !searching && (
                                <div className="absolute z-10 w-full mt-1 p-3 bg-card border border-border rounded-theme shadow-lg text-center text-xs text-foreground-muted">
                                    No contacts found
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">First Name *</label>
                            <input 
                                required
                                value={form.firstName}
                                onChange={(e) => setForm({...form, firstName: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Last Name *</label>
                            <input 
                                required
                                value={form.lastName}
                                onChange={(e) => setForm({...form, lastName: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Employer Name</label>
                            <input 
                                value={form.employerName}
                                onChange={(e) => setForm({...form, employerName: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Email</label>
                            <input 
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({...form, email: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Office Number</label>
                            <input 
                                value={form.officeNumber}
                                onChange={(e) => setForm({...form, officeNumber: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Office Extension</label>
                            <input 
                                value={form.officeExtension}
                                onChange={(e) => setForm({...form, officeExtension: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Mobile Number</label>
                            <input 
                                value={form.mobileNumber}
                                onChange={(e) => setForm({...form, mobileNumber: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Status</label>
                            <input 
                                value={form.status}
                                onChange={(e) => setForm({...form, status: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button 
                            type="button" 
                            onClick={resetForm}
                            className="px-4 py-2 border border-border rounded-theme text-xs font-semibold hover:bg-background-muted bg-background text-foreground transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-theme text-xs flex items-center gap-1.5 shadow"
                        >
                            {submitting && <Loader2 className="animate-spin h-3 w-3" />}
                            <Save className="h-3.5 w-3.5" />
                            <span>Save Employer</span>
                        </button>
                    </div>
                </form>
            )}

            {employers.length === 0 ? (
                <p className="text-sm text-foreground-muted italic">No employer details recorded.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {employers.map((emp) => (
                        <div key={emp.id} className="p-4 bg-card border border-border rounded-theme flex justify-between items-start hover:border-primary/40 transition-colors">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-foreground">{emp.firstName} {emp.lastName}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        emp.mode === 'EXISTING' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
                                    }`}>
                                        {emp.mode === 'EXISTING' ? 'Existing (Vendor)' : 'New'}
                                    </span>
                                </div>
                                <p className="text-sm text-foreground-muted">
                                    Employer: {emp.employerName || 'N/A'} {emp.vendorName && `(Vendor: ${emp.vendorName})`}
                                </p>
                                <div className="text-xs text-foreground-muted grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 pt-1">
                                    {emp.email && <div>Email: {emp.email}</div>}
                                    {emp.mobileNumber && <div>Mobile: {emp.mobileNumber}</div>}
                                    {emp.officeNumber && <div>Office: {emp.officeNumber} {emp.officeExtension && `Ext: ${emp.officeExtension}`}</div>}
                                    {emp.status && <div>Status: {emp.status}</div>}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => handleEditClick(emp)}
                                    className="p-1.5 hover:bg-background-muted border border-border text-foreground-muted hover:text-primary rounded-theme transition-colors"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(emp.id)}
                                    className="p-1.5 hover:bg-background-muted border border-border text-foreground-muted hover:text-destructive rounded-theme transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AtsEmployerTab;
