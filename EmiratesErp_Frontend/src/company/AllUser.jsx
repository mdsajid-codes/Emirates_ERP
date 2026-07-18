import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    Search, Plus, Filter, Shield, Mail, UserCheck, UserX, 
    Lock, Edit, Trash2, ShieldCheck, X, Save, Key, User as UserIcon
} from 'lucide-react';
import CompanyHubLayout from '../components/CompanyHubLayout';
import DataTable from '../fleet/tripManagement/components/table/DataTable';
import { toast } from 'react-toastify';
import { loadThemeFromStorage, DEFAULT_THEME } from '../utils/themeUtils';

const AllUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Merge loaded theme with defaults to ensure all keys exist
    const getInitialTheme = () => {
        const saved = loadThemeFromStorage();
        return saved ? { ...DEFAULT_THEME, ...saved } : DEFAULT_THEME;
    };
    
    const [theme, setTheme] = useState(getInitialTheme());
    
    const [formData, setFormData] = useState({
        name: '',
        roles: [],
        isActive: true,
        password: ''
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    // Helper to get hex with opacity
    const getAlphaColor = (hex, opacity) => {
        if (!hex) return 'transparent';
        const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
        return `${hex}${alpha}`;
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/users`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // Refresh theme data in case it changed
        const savedTheme = loadThemeFromStorage();
        if (savedTheme) {
            setTheme({ ...DEFAULT_THEME, ...savedTheme });
        }
    }, []);

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            roles: user.roles || [],
            isActive: user.isActive !== undefined ? user.isActive : true,
            password: ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/users/${userId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (err) {
                console.error('Failed to delete user:', err);
                toast.error('Failed to delete user');
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                name: formData.name,
                roles: formData.roles,
                isActive: formData.isActive
            };
            if (formData.password) {
                payload.password = formData.password;
            }

            await axios.put(`${API_URL}/users/${editingUser.id}`, payload, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            toast.success('User updated successfully');
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            console.error('Failed to update user:', err);
            toast.error('Failed to update user');
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => 
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.roles?.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [users, searchTerm]);

    const columns = [
        {
            header: "Full Name",
            key: "name",
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold border shadow-inner"
                        style={{ 
                            backgroundColor: getAlphaColor(theme.primaryColor, 0.1),
                            color: theme.primaryColor,
                            borderColor: getAlphaColor(theme.primaryColor, 0.2)
                        }}
                    >
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-foreground tracking-tight">{user.name}</span>
                </div>
            )
        },
        {
            header: "Email",
            key: "email",
            render: (user) => (
                <div className="flex items-center gap-2 text-foreground-muted">
                    <div 
                        className="p-1.5 rounded-theme border border-opacity-50"
                        style={{ 
                            backgroundColor: getAlphaColor(theme.backgroundColor, 0.5),
                            borderColor: theme.borderColor 
                        }}
                    >
                        <Mail size={14} style={{ color: theme.primaryColor, opacity: 0.7 }} />
                    </div>
                    <span className="text-sm font-medium">{user.email}</span>
                </div>
            )
        },
        {
            header: "Security Roles",
            key: "roles",
            render: (user) => (
                <div className="flex flex-wrap gap-1.5">
                    {user.roles?.map(role => (
                        <span 
                            key={role} 
                            style={{
                                backgroundColor: getAlphaColor(role === 'SUPER_ADMIN' ? theme.errorColor : (role === 'DRIVER' ? theme.warningColor : theme.primaryColor), 0.1),
                                color: role === 'SUPER_ADMIN' ? theme.errorColor : (role === 'DRIVER' ? theme.warningColor : theme.primaryColor),
                                borderColor: getAlphaColor(role === 'SUPER_ADMIN' ? theme.errorColor : (role === 'DRIVER' ? theme.warningColor : theme.primaryColor), 0.2)
                            }}
                            className="px-2.5 py-1 rounded-theme text-[10px] font-bold tracking-wider uppercase border shadow-sm"
                        >
                            {role.replace('_', ' ')}
                        </span>
                    ))}
                </div>
            )
        },
        {
            header: "Account Status",
            key: "isActive",
            render: (user) => (
                user.isActive ? (
                    <span 
                        style={{
                            backgroundColor: getAlphaColor(theme.successColor, 0.1),
                            color: theme.successColor,
                            borderColor: getAlphaColor(theme.successColor, 0.2)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest"
                    >
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.successColor }} />
                        Active
                    </span>
                ) : (
                    <span 
                        style={{
                            backgroundColor: getAlphaColor(theme.textColor, 0.1),
                            color: theme.textColor,
                            borderColor: getAlphaColor(theme.textColor, 0.2)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest opacity-60"
                    >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.textColor }} />
                        Inactive
                    </span>
                )
            )
        },
        {
            header: "Access",
            key: "isLocked",
            render: (user) => (
                user.isLocked ? (
                    <span 
                        style={{
                            backgroundColor: getAlphaColor(theme.errorColor, 0.1),
                            color: theme.errorColor,
                            borderColor: getAlphaColor(theme.errorColor, 0.2)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest"
                    >
                        <Lock size={12} /> Locked
                    </span>
                ) : (
                    <span 
                        style={{
                            backgroundColor: getAlphaColor(theme.primaryColor, 0.1),
                            color: theme.primaryColor,
                            borderColor: getAlphaColor(theme.primaryColor, 0.2)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest"
                    >
                        <Shield size={12} /> Secure
                    </span>
                )
            )
        },
        {
            header: "Actions",
            key: "actions",
            render: (user) => (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleEdit(user)}
                        style={{ color: theme.primaryColor }}
                        className="p-2 hover:bg-opacity-10 rounded-theme transition-all border border-transparent shadow-sm active:scale-95"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getAlphaColor(theme.primaryColor, 0.1)}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Edit User"
                    >
                        <Edit className="h-4 w-4 pointer-events-none" />
                    </button>
                    <button 
                        onClick={() => handleDelete(user.id)}
                        style={{ color: theme.errorColor }}
                        className="p-2 hover:bg-opacity-10 rounded-theme transition-all border border-transparent shadow-sm active:scale-95"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getAlphaColor(theme.errorColor, 0.1)}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Delete User"
                    >
                        <Trash2 className="h-4 w-4 pointer-events-none" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <CompanyHubLayout>
            <div className="flex flex-col h-full bg-background animate-fade-in" style={{ fontFamily: theme.fontFamily }}>
                {/* Header Section */}
                <div className="flex flex-col gap-2 mb-10">
                    <div className="flex items-center gap-3">
                        <div 
                            className="p-2.5 rounded-theme border shadow-md"
                            style={{ 
                                backgroundColor: getAlphaColor(theme.primaryColor, 0.1),
                                borderColor: getAlphaColor(theme.primaryColor, 0.2)
                            }}
                        >
                            <ShieldCheck size={24} style={{ color: theme.primaryColor }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-foreground">User Management</h1>
                            <p className="text-sm text-foreground-muted opacity-70 font-medium">
                                Configure system access, roles, and security permissions for all users.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-5 items-center justify-between mb-8">
                    <div className="relative w-full md:w-[450px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted opacity-40 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by identity, role, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-5 py-3.5 bg-card border rounded-theme text-sm focus:ring-4 outline-none transition-all shadow-sm font-bold"
                            style={{ 
                                borderColor: getAlphaColor(theme.borderColor, 0.6),
                                '--tw-ring-color': getAlphaColor(theme.primaryColor, 0.1)
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-card border border-border text-sm font-bold text-foreground-muted rounded-theme hover:bg-background-muted transition-all shadow-sm active:scale-95">
                            <Filter size={20} />
                            Refine
                        </button>
                        <button 
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-extrabold rounded-theme hover:opacity-95 transition-all shadow-xl active:scale-95"
                            style={{ 
                                backgroundColor: theme.primaryColor,
                                color: theme.primaryForegroundColor || '#ffffff',
                                boxShadow: `0 10px 15px -3px ${getAlphaColor(theme.primaryColor, 0.3)}`
                            }}
                        >
                            <Plus size={20} />
                            Provision User
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div 
                    className="flex-1 overflow-hidden bg-card border rounded-theme shadow-2xl"
                    style={{ 
                        borderColor: getAlphaColor(theme.borderColor, 0.5),
                        boxShadow: `0 25px 50px -12px ${getAlphaColor(theme.primaryColor, 0.08)}`
                    }}
                >
                    <DataTable 
                        columns={columns}
                        data={filteredUsers}
                        loading={loading}
                        totalRecords={filteredUsers.length}
                    />
                </div>

                {/* Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-md animate-fade-in">
                        <div className="bg-card w-full max-w-lg rounded-theme shadow-2xl border border-border overflow-hidden animate-fade-in-up">
                            <div 
                                className="p-8 border-b border-opacity-50"
                                style={{ 
                                    backgroundColor: getAlphaColor(theme.primaryColor, 0.05),
                                    borderColor: getAlphaColor(theme.borderColor, 0.5)
                                }}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="p-3 rounded-theme"
                                            style={{ backgroundColor: theme.primaryColor, color: theme.primaryForegroundColor || '#ffffff' }}
                                        >
                                            <Edit size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-foreground">Edit Profile</h2>
                                            <p className="text-xs font-bold text-foreground-muted opacity-60 uppercase tracking-widest">{editingUser?.email}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 hover:bg-opacity-10 text-foreground-muted rounded-theme transition-colors"
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getAlphaColor(theme.errorColor, 0.1)}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleUpdate} className="p-8 space-y-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] ml-1">Full Identity Name</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={18} style={{ color: theme.primaryColor }} />
                                            <input 
                                                type="text" 
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-theme text-sm focus:ring-4 outline-none transition-all font-bold"
                                                style={{ '--tw-ring-color': getAlphaColor(theme.primaryColor, 0.1) }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] ml-1">Security Credentials (Optional)</label>
                                        <div className="relative">
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={18} style={{ color: theme.primaryColor }} />
                                            <input 
                                                type="password" 
                                                placeholder="Leave blank to keep current"
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-theme text-sm focus:ring-4 outline-none transition-all font-bold"
                                                style={{ '--tw-ring-color': getAlphaColor(theme.primaryColor, 0.1) }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] ml-1">Account State</label>
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-theme border font-black text-xs transition-all"
                                                style={{ 
                                                    backgroundColor: getAlphaColor(formData.isActive ? theme.successColor : theme.textColor, 0.1),
                                                    color: formData.isActive ? theme.successColor : theme.textColor,
                                                    borderColor: getAlphaColor(formData.isActive ? theme.successColor : theme.textColor, 0.2)
                                                }}
                                            >
                                                {formData.isActive ? <UserCheck size={18} /> : <UserX size={18} />}
                                                {formData.isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] ml-1">Privilege Level</label>
                                            <select 
                                                className="w-full px-4 py-3.5 bg-background border border-border rounded-theme text-xs font-black focus:ring-4 outline-none appearance-none cursor-pointer"
                                                value={formData.roles[0] || ''}
                                                onChange={(e) => setFormData({...formData, roles: [e.target.value]})}
                                                style={{ '--tw-ring-color': getAlphaColor(theme.primaryColor, 0.1) }}
                                            >
                                                <option value="EMPLOYEE">EMPLOYEE</option>
                                                <option value="DRIVER">DRIVER</option>
                                                <option value="HRMS_ADMIN">HRMS ADMIN</option>
                                                <option value="POS_ADMIN">POS ADMIN</option>
                                                <option value="SUPER_ADMIN">SUPER ADMIN</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-4 bg-background border border-border text-sm font-black text-foreground-muted rounded-theme hover:bg-background-muted transition-all active:scale-95"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 px-6 py-4 text-sm font-black rounded-theme hover:opacity-90 shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                                        style={{ 
                                            backgroundColor: theme.primaryColor, 
                                            color: theme.primaryForegroundColor || '#ffffff',
                                            boxShadow: `0 10px 15px -3px ${getAlphaColor(theme.primaryColor, 0.3)}`
                                        }}
                                    >
                                        <Save size={18} />
                                        Commit Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </CompanyHubLayout>
    );
};

export default AllUser;
