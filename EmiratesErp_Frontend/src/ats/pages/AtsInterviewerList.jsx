import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    UserPlus,
    Search,
    Edit,
    Trash2,
    Calendar,
    Clock,
    Loader2,
    AlertTriangle,
    X,
    Plus,
    Check
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsInterviewerList = () => {
    // List & Pagination state
    const [interviewers, setInterviewers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Business Units dropdown state
    const [businessUnits, setBusinessUnits] = useState([]);

    // Form panel visibility & toggle
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form state
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        jobTitle: '',
        mobileNumber: '',
        technology: '',
        businessUnitId: '',
        calendarSyncNotification: true,
        workingHoursStart: '',
        workingHoursEnd: '',
        workingHoursApplyWeekends: false,
        isActive: true
    });

    const [isOrganizationChecked, setIsOrganizationChecked] = useState(false);

    // Load active business units
    const fetchBusinessUnits = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/ats/business-units/active`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setBusinessUnits(response.data || []);
        } catch (err) {
            console.error("Failed to load business units", err);
        }
    };

    // Load interviewers list
    const fetchInterviewers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/ats/interviewers`, {
                params: { search, page, size },
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = response.data;
            setInterviewers(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            console.error("Failed to load interviewers", err);
            toast.error("Failed to load interviewers list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusinessUnits();
    }, []);

    useEffect(() => {
        fetchInterviewers();
    }, [search, page, size]);

    // Handle Input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Save/Update
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Front-end Validations
        if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
            toast.warning("First Name, Last Name and Email are required.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email.trim())) {
            toast.warning("Please enter a valid email address.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...form,
                businessUnitId: isOrganizationChecked && form.businessUnitId ? form.businessUnitId : null
            };

            if (editingId) {
                await axios.put(`${API_URL}/ats/interviewers/${editingId}`, payload, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                toast.success("Interviewer updated successfully!");
            } else {
                await axios.post(`${API_URL}/ats/interviewers`, payload, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                toast.success("Interviewer added successfully!");
            }

            resetForm();
            fetchInterviewers();
        } catch (err) {
            console.error("Failed to save interviewer", err);
            toast.error(err.response?.data?.message || "Failed to save interviewer.");
        }
    };

    // Edit Click
    const handleEdit = (interviewer) => {
        setEditingId(interviewer.id);
        setForm({
            firstName: interviewer.firstName,
            lastName: interviewer.lastName,
            email: interviewer.email,
            jobTitle: interviewer.jobTitle || '',
            mobileNumber: interviewer.mobileNumber || '',
            technology: interviewer.technology || '',
            businessUnitId: interviewer.businessUnitId || '',
            calendarSyncNotification: interviewer.calendarSyncNotification ?? true,
            workingHoursStart: interviewer.workingHoursStart || '',
            workingHoursEnd: interviewer.workingHoursEnd || '',
            workingHoursApplyWeekends: interviewer.workingHoursApplyWeekends ?? false,
            isActive: interviewer.isActive ?? true
        });
        setIsOrganizationChecked(!!interviewer.businessUnitId);
        setShowForm(true);
    };

    // Toggle status (Active / Inactive)
    const handleToggleActive = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/ats/interviewers/${id}/toggle-active`, {}, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchInterviewers();
            toast.success("Status updated successfully.");
        } catch (err) {
            console.error("Failed to toggle interviewer status", err);
            toast.error("Failed to toggle status.");
        }
    };

    // Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this interviewer?")) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/ats/interviewers/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            toast.success("Interviewer deleted successfully.");
            fetchInterviewers();
        } catch (err) {
            console.error("Failed to delete interviewer", err);
            toast.error("Failed to delete interviewer.");
        }
    };

    // Reset Form
    const resetForm = () => {
        setForm({
            firstName: '',
            lastName: '',
            email: '',
            jobTitle: '',
            mobileNumber: '',
            technology: '',
            businessUnitId: '',
            calendarSyncNotification: true,
            workingHoursStart: '',
            workingHoursEnd: '',
            workingHoursApplyWeekends: false,
            isActive: true
        });
        setEditingId(null);
        setIsOrganizationChecked(false);
        setShowForm(false);
    };

    // Generate times
    const times = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const label = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            times.push(label);
        }
    }

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Interviewer List</h1>
                    <p className="text-xs text-foreground-muted">Manage system interviewers, technologies, organization units, and schedules.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-theme shadow transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        New
                    </button>
                )}
            </header>

            {/* Form Section */}
            {showForm && (
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-foreground">
                            {editingId ? 'Edit Interviewer Details' : 'Add New Interviewer'}
                        </h2>
                        <button onClick={resetForm} className="p-1 rounded-full hover:bg-background-muted transition-colors">
                            <X className="h-5 w-5 text-foreground-muted" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Organization Group */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isOrganization"
                                    checked={isOrganizationChecked}
                                    onChange={(e) => setIsOrganizationChecked(e.target.checked)}
                                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                />
                                <label htmlFor="isOrganization" className="text-sm font-semibold text-foreground select-none cursor-pointer">
                                    Organization
                                </label>
                            </div>

                            {isOrganizationChecked && (
                                <div className="max-w-md space-y-1">
                                    <label className="text-xs font-semibold text-foreground-muted">Business Unit</label>
                                    <select
                                        name="businessUnitId"
                                        value={form.businessUnitId}
                                        onChange={handleInputChange}
                                        className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                    >
                                        <option value="">Select Business Unit</option>
                                        {businessUnits.map(bu => (
                                            <option key={bu.id} value={bu.id}>{bu.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Interviewer Info Group */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-foreground border-b border-border pb-1">Interviewer Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground-muted">First Name <span className="text-destructive">*</span></label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleInputChange}
                                        className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground-muted">Last Name <span className="text-destructive">*</span></label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleInputChange}
                                        className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground-muted">Email <span className="text-destructive">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleInputChange}
                                        className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground-muted">Job Title</label>
                                    <input
                                        type="text"
                                        name="jobTitle"
                                        value={form.jobTitle}
                                        onChange={handleInputChange}
                                        className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground-muted">Mobile Number</label>
                                    <input
                                        type="text"
                                        name="mobileNumber"
                                        value={form.mobileNumber}
                                        onChange={handleInputChange}
                                        className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground-muted">Technology</label>
                                    <input
                                        type="text"
                                        name="technology"
                                        value={form.technology}
                                        onChange={handleInputChange}
                                        className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Calendar Sync Notification */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-bold text-foreground">Calendar Sync Notification</label>
                                <input
                                    type="checkbox"
                                    name="calendarSyncNotification"
                                    checked={form.calendarSyncNotification}
                                    onChange={handleInputChange}
                                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                />
                            </div>
                            <p className="text-xs text-foreground-muted">Send setup instructions to the interviewer</p>
                            <p className="text-[11px] text-amber-600 font-semibold">
                                Note - An email notification will be sent to the interviewer with instructions to sync their calendar with the system.
                            </p>
                        </div>

                        {/* Working Hours Group */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-foreground border-b border-border pb-1">Working Hours</h3>
                            <p className="text-xs font-semibold text-foreground-muted">Mon - Fri</p>
                            <div className="flex items-center gap-4 max-w-lg">
                                <select
                                    name="workingHoursStart"
                                    value={form.workingHoursStart}
                                    onChange={handleInputChange}
                                    className="flex-1 bg-background border border-border rounded-theme px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                >
                                    <option value="">Select Start Time</option>
                                    {times.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <span className="text-sm font-semibold text-foreground-muted">To</span>
                                <select
                                    name="workingHoursEnd"
                                    value={form.workingHoursEnd}
                                    onChange={handleInputChange}
                                    className="flex-1 bg-background border border-border rounded-theme px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                >
                                    <option value="">Select End Time</option>
                                    {times.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="pt-2">
                                <button type="button" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    (UTC-05:00) Eastern Time (US & Canada) Time Zone
                                </button>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    name="workingHoursApplyWeekends"
                                    id="applyWeekends"
                                    checked={form.workingHoursApplyWeekends}
                                    onChange={handleInputChange}
                                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                />
                                <label htmlFor="applyWeekends" className="text-xs font-semibold text-foreground-muted select-none cursor-pointer">
                                    Working Hours Apply on Weekends
                                </label>
                            </div>
                        </div>

                        {/* Form Buttons */}
                        <div className="flex items-center gap-3 pt-4 border-t border-border">
                            <button
                                type="submit"
                                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-black px-5 py-2.5 rounded-theme shadow transition-all"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-background border border-border hover:bg-background-muted text-foreground text-xs font-black px-5 py-2.5 rounded-theme transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Table Section */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
                        <input
                            type="text"
                            placeholder="Search by Name, Email, BU..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                            className="pl-9 pr-4 py-2 w-full bg-background border border-border rounded-theme text-sm focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-foreground-muted/50 font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground-muted">Show</span>
                        <select
                            value={size}
                            onChange={(e) => {
                                setSize(Number(e.target.value));
                                setPage(0);
                            }}
                            className="bg-background border border-border rounded-theme px-2 py-1 text-xs focus:ring-1 focus:ring-primary font-bold"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="text-xs font-semibold text-foreground-muted">entries</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="animate-spin h-8 w-8 text-primary" />
                            <span className="text-xs text-foreground-muted font-bold">Fetching interviewers...</span>
                        </div>
                    ) : interviewers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-foreground-muted gap-2">
                            <AlertTriangle className="h-8 w-8 text-amber-500" />
                            <span className="text-sm font-bold">No interviewers found.</span>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-background-muted/50 text-[11px] font-black text-foreground-muted tracking-wider uppercase">
                                    <th className="px-5 py-3.5 w-10">
                                        <input type="checkbox" className="rounded border-border text-primary focus:ring-primary h-4 w-4" />
                                    </th>
                                    <th className="px-5 py-3.5 font-black">Name</th>
                                    <th className="px-5 py-3.5 font-black">Business Unit</th>
                                    <th className="px-5 py-3.5 font-black">Email</th>
                                    <th className="px-5 py-3.5 font-black">Mobile Number</th>
                                    <th className="px-5 py-3.5 font-black">Technology</th>
                                    <th className="px-5 py-3.5 font-black">Job Title</th>
                                    <th className="px-5 py-3.5 font-black">Created By</th>
                                    <th className="px-5 py-3.5 font-black text-center">Status</th>
                                    <th className="px-5 py-3.5 font-black text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-xs">
                                {interviewers.map(item => (
                                    <tr key={item.id} className="hover:bg-background-muted/20 transition-colors">
                                        <td className="px-5 py-4">
                                            <input type="checkbox" className="rounded border-border text-primary focus:ring-primary h-4 w-4" />
                                        </td>
                                        <td className="px-5 py-4 font-bold text-foreground">
                                            {item.firstName} {item.lastName}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-foreground-muted">
                                            {item.businessUnitName}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-foreground-muted">
                                            {item.email}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-foreground-muted">
                                            {item.mobileNumber || 'N/A'}
                                        </td>
                                        <td className="px-5 py-4 font-medium">
                                            {item.technology ? (
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold">
                                                    {item.technology}
                                                </span>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-foreground-muted">
                                            {item.jobTitle || 'N/A'}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-foreground-muted">
                                            {item.createdBy}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleActive(item.id)}
                                                className={`px-3 py-1 rounded text-[10px] font-black uppercase transition-all shadow-sm ${item.isActive
                                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                        : 'bg-rose-500 text-white hover:bg-rose-600'
                                                    }`}
                                            >
                                                {item.isActive ? 'ON' : 'OFF'}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination footer */}
                {!loading && totalPages > 0 && (
                    <div className="p-4 border-t border-border flex flex-wrap items-center justify-between gap-4 bg-background-muted/30">
                        <span className="text-xs text-foreground-muted font-medium">
                            Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} entries
                        </span>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-2.5 py-1.5 border border-border rounded-theme text-xs font-semibold bg-card text-foreground-muted hover:bg-background-muted disabled:opacity-50 transition-all"
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`px-3 py-1.5 rounded-theme text-xs font-bold transition-all ${page === i
                                            ? 'bg-primary text-primary-foreground shadow'
                                            : 'border border-border bg-card text-foreground-muted hover:bg-background-muted'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="px-2.5 py-1.5 border border-border rounded-theme text-xs font-semibold bg-card text-foreground-muted hover:bg-background-muted disabled:opacity-50 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AtsInterviewerList;
