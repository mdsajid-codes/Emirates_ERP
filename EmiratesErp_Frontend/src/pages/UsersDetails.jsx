import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Edit, Loader, AlertCircle, X, UploadCloud, MapPin, ArrowLeft, Search, Save, ShieldCheck } from 'lucide-react';
import axios from 'axios';

// Roles relevant to the HRMS module that can be assigned or viewed.
const HRMS_ROLES = [
    'HRMS_ADMIN',
    'HR',
    'MANAGER',
    'EMPLOYEE',
];

const InputField = ({ label, id, type = 'text', className = '', ...props }) => (
    <div className={className}>
        {label && <label htmlFor={id} className="block text-[11px] font-medium text-foreground-muted mb-0.5">{label}</label>}
        <input
            id={id}
            type={type}
            {...props}
            className="w-full px-2.5 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors h-7"
        />
    </div>
);

const UserFormView = ({ user, onSave, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        roles: new Set(['EMPLOYEE']), isActive: true, isLocked: false, locationId: null
    });
    const [formError, setFormError] = useState('');
    const [locations, setLocations] = useState([]);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                confirmPassword: '',
                roles: new Set(user.roles || ['EMPLOYEE']),
                isActive: user.isActive ?? true,
                isLocked: user.isLocked ?? false,
                locationId: user.locationId || null
            });
        } else {
            setFormData({
                name: '', email: '', password: '', confirmPassword: '',
                roles: new Set(['EMPLOYEE']), isActive: true, isLocked: false, locationId: null
            });
        }
        setFormError('');

        const fetchLocations = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };
                const res = await axios.get(`${API_URL}/locations`, { headers }).catch(() => ({ data: [] }));
                setLocations(res.data || []);
            } catch (err) {
                setFormError('Failed to load locations.');
            }
        };

        fetchLocations();
    }, [user, API_URL]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleRoleChange = (role) => {
        setFormData(prev => {
            const newRoles = new Set(prev.roles);
            if (newRoles.has(role)) {
                newRoles.delete(role);
            } else {
                newRoles.add(role);
            }
            return { ...prev, roles: newRoles };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setFormError('Passwords do not match.');
            return;
        }
        if (!user && !formData.password) {
            setFormError('Password is required for new users.');
            return;
        }
        const payload = { ...formData, roles: Array.from(formData.roles) };
        if (payload.locationId === '') payload.locationId = null;
        onSave(payload);
    };

    return (
        <div className="p-3.5 bg-card border border-border rounded-lg text-foreground space-y-3 max-w-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-xs font-bold text-foreground">
                    {user ? 'Edit User Details' : 'Create New User'}
                </h3>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-2 py-1 text-xs font-semibold rounded-md border border-border bg-background hover:bg-background-muted text-foreground transition-colors flex items-center gap-1"
                >
                    <ArrowLeft size={13} /> Back to User List
                </button>
            </div>

            {formError && (
                <div className="p-2.5 bg-rose-500/10 text-rose-500 text-xs rounded-md border border-rose-500/20">
                    {formError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InputField label="Full Name" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    <InputField label="Email Address" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    <InputField
                        label="Password"
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!user}
                        placeholder={user ? 'Leave blank to keep current' : 'Enter password'}
                    />
                    <InputField
                        label="Confirm Password"
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required={!user || !!formData.password}
                        placeholder={user ? 'Leave blank to keep current' : 'Confirm password'}
                    />
                </div>

                <div className="pt-2 border-t border-border">
                    <label className="block text-[11px] font-medium text-foreground-muted mb-1.5">User Roles</label>
                    <div className="flex flex-wrap gap-2">
                        {HRMS_ROLES.map(role => (
                            <label
                                key={role}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border cursor-pointer transition-colors ${
                                    formData.roles.has(role)
                                        ? 'bg-primary/10 text-primary border-primary/30 font-semibold'
                                        : 'bg-background hover:bg-background-muted text-foreground-muted border-border'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.roles.has(role)}
                                    onChange={() => handleRoleChange(role)}
                                    className="h-3.5 w-3.5 rounded border-border text-primary"
                                />
                                {role}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border">
                    <div>
                        <label htmlFor="locationId" className="block text-[11px] font-medium text-foreground-muted mb-0.5">Assign Location (Optional)</label>
                        <select
                            id="locationId"
                            name="locationId"
                            value={formData.locationId || ''}
                            onChange={handleChange}
                            className="w-full px-2.5 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors h-7"
                        >
                            <option value="">No specific location</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="h-3.5 w-3.5 rounded border-border text-primary"
                            />
                            <span className="text-xs font-medium text-foreground">Is Active</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isLocked"
                                checked={formData.isLocked}
                                onChange={handleChange}
                                className="h-3.5 w-3.5 rounded border-border text-primary"
                            />
                            <span className="text-xs font-medium text-foreground">Is Locked</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-3 py-1 text-xs font-semibold text-foreground-muted hover:bg-background-muted rounded-md transition-colors border border-border"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-3.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs h-7"
                        disabled={loading}
                    >
                        {loading ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Save size={13} />} Save User
                    </button>
                </div>
            </form>
        </div>
    );
};

const BulkUploadView = ({ onUpload, onCancel, loading }) => {
    const [file, setFile] = useState(null);
    const [uploadError, setUploadError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setUploadError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file) {
            setUploadError('Please select an Excel file to upload.');
            return;
        }
        onUpload(file);
    };

    return (
        <div className="p-3.5 bg-card border border-border rounded-lg text-foreground space-y-3 max-w-lg">
            <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-xs font-bold text-foreground">Bulk Add Users</h3>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-2 py-1 text-xs font-semibold rounded-md border border-border bg-background hover:bg-background-muted text-foreground transition-colors flex items-center gap-1"
                >
                    <ArrowLeft size={13} /> Back to User List
                </button>
            </div>

            {uploadError && (
                <div className="p-2.5 bg-rose-500/10 text-rose-500 text-xs rounded-md border border-rose-500/20">
                    {uploadError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-xs text-foreground-muted">
                    Upload an Excel file (.xlsx, .xls) containing user data.<br />
                    Required columns: <span className="font-semibold text-foreground">Name, Email, Password, Roles (comma-separated), IsActive, IsLocked</span>.
                </p>

                <div className="p-4 border border-dashed border-border rounded-lg bg-background-muted/40 text-center space-y-2">
                    <UploadCloud className="mx-auto h-8 w-8 text-foreground-muted/50" />
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".xlsx, .xls"
                        className="block w-full text-xs text-foreground-muted file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-3 py-1 text-xs font-semibold text-foreground-muted hover:bg-background-muted rounded-md transition-colors border border-border"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-3.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs h-7"
                        disabled={loading}
                    >
                        {loading ? <Loader className="animate-spin h-3.5 w-3.5" /> : <UploadCloud size={13} />} Upload Users
                    </button>
                </div>
            </form>
        </div>
    );
};

const UsersDetails = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'add' | 'edit' | 'bulk'
    const [editingUser, setEditingUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [locations, setLocations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/users`, { headers: { "Authorization": `Bearer ${token}` } });
            const [locationsRes] = await Promise.all([
                axios.get(`${API_URL}/locations`, { headers: { "Authorization": `Bearer ${token}` } }).catch(() => ({ data: [] }))
            ]);
            setUsers(response.data || []);
            setLocations(locationsRes.data || []);
        } catch (err) {
            setError('Failed to fetch users. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleAdd = () => { setEditingUser(null); setViewMode('add'); };
    const handleEdit = (user) => { setEditingUser(user); setViewMode('edit'); };
    const handleBulk = () => { setViewMode('bulk'); };
    const handleBackToList = () => { setViewMode('list'); setEditingUser(null); };

    const handleSave = async (userData) => {
        setActionLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const { confirmPassword, ...payload } = userData;
            if (editingUser) {
                await axios.put(`${API_URL}/users/${editingUser.id}`, payload, { headers: { "Authorization": `Bearer ${token}` } });
            } else {
                await axios.post(`${API_URL}/users/register`, payload, { headers: { "Authorization": `Bearer ${token}` } });
            }
            setViewMode('list');
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save user. The email might already exist.');
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleBulkUpload = async (file) => {
        setActionLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/users/bulkUsers`, formData, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
            alert(response.data);
            setViewMode('list');
            fetchUsers();
        } catch (err) {
            const errorMessage = err.response?.data || 'Failed to upload file.';
            setError(errorMessage);
            alert(`Upload failed:\n${errorMessage}`);
        } finally {
            setActionLoading(false);
        }
    };

    // Filter users to show only those with roles relevant to HRMS, and by top search term.
    const filteredUsers = useMemo(() => {
        const relevantRoles = new Set(['HRMS_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']);
        let list = users.filter(user => user.roles && user.roles.some(role => relevantRoles.has(role)));
        if (searchTerm) {
            const term = searchTerm.toLowerCase().trim();
            list = list.filter(user =>
                (user.name && user.name.toLowerCase().includes(term)) ||
                (user.email && user.email.toLowerCase().includes(term)) ||
                (user.roles && user.roles.some(r => r.toLowerCase().includes(term)))
            );
        }
        return list;
    }, [users, searchTerm]);

    const locationMap = useMemo(() => new Map(locations.map(loc => [loc.id, loc.name])), [locations]);

    const headerSearchElement = (
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
            <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
            />
        </div>
    );

    return (
        <DashboardLayout headerSearch={headerSearchElement}>
            <div className="p-3 lg:p-4 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-foreground leading-none">User Management</h1>
                            <p className="text-[11px] text-foreground-muted mt-0.5">Manage system access roles, user accounts, and permissions</p>
                        </div>
                    </div>

                    {viewMode === 'list' && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleBulk}
                                className="px-2.5 py-1 text-xs font-semibold border border-border bg-background hover:bg-background-muted text-foreground rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                            >
                                <UploadCloud size={13} /> Bulk Upload
                            </button>
                            <button
                                onClick={handleAdd}
                                className="px-2.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs"
                            >
                                <Plus size={13} /> Add User
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-lg border border-rose-500/20">
                        <strong className="font-bold">Error: </strong>
                        <span className="whitespace-pre-wrap">{error}</span>
                    </div>
                )}

                {viewMode === 'add' || viewMode === 'edit' ? (
                    <UserFormView
                        user={editingUser}
                        onSave={handleSave}
                        onCancel={handleBackToList}
                        loading={actionLoading}
                    />
                ) : viewMode === 'bulk' ? (
                    <BulkUploadView
                        onUpload={handleBulkUpload}
                        onCancel={handleBackToList}
                        loading={actionLoading}
                    />
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-border">
                        {loading ? (
                            <div className="flex justify-center items-center p-8 bg-card rounded-lg">
                                <Loader className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <table className="min-w-full bg-card text-foreground divide-y divide-border">
                                <thead className="bg-background-muted/60">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Name</th>
                                        <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Email</th>
                                        <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Roles</th>
                                        <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Location</th>
                                        <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                                        <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-background-muted/40 transition-colors">
                                                <td className="px-3 py-2 text-xs font-semibold text-foreground">{user.name}</td>
                                                <td className="px-3 py-2 text-xs text-foreground-muted">{user.email}</td>
                                                <td className="px-3 py-2 text-xs">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.map(role => (
                                                            <span key={role} className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                                                                {role}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-xs text-foreground-muted">
                                                    {user.locationId ? (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin size={12} className="text-foreground-muted/70" />
                                                            <span>{locationMap.get(user.locationId) || 'N/A'}</span>
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-3 py-2 text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                            user.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-background-muted text-foreground-muted border-border'
                                                        }`}>
                                                            {user.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                        {user.isLocked && (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-rose-500/10 text-rose-600 border-rose-500/20">
                                                                Locked
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-xs text-right whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-1 text-primary hover:bg-primary/10 rounded-md transition-colors border border-border bg-background"
                                                        title="Edit User"
                                                    >
                                                        <Edit size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-foreground-muted text-xs">
                                                <AlertCircle className="mx-auto h-7 w-7 text-foreground-muted/40 mb-1" />
                                                <h3 className="text-xs font-bold text-foreground">No users found</h3>
                                                <p className="text-[11px] text-foreground-muted mt-0.5">Get started by creating a new user.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UsersDetails;
