import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Users, Loader2, Search, X, Check, MoreHorizontal, UserPlus } from 'lucide-react';
import axios from 'axios';
import CrmRoleEditorModal from '../components/CrmRoleEditorModal';
import CrmRoleAssignUserModal from '../components/CrmRoleAssignUserModal';
import { useCrmPermissions } from '../context/CrmPermissionsContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CrmRolesPage = () => {
    const { hasPermission } = useCrmPermissions();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedAssignRole, setSelectedAssignRole] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const authHeaders = { "Authorization": `Bearer ${localStorage.getItem('token')}` };

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/crm/roles`, { headers: authHeaders });
            setRoles(res.data);
        } catch (err) {
            console.error("Failed to fetch roles:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleCreate = () => {
        setSelectedRole(null);
        setIsModalOpen(true);
    };

    const handleEdit = (role) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const handleOpenAssign = (role) => {
        setSelectedAssignRole(role);
        setIsAssignModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this role?")) return;
        try {
            await axios.delete(`${API_URL}/crm/roles/${id}`, { headers: authHeaders });
            setRoles(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            alert("Failed to delete role.");
        }
    };

    const filteredRoles = roles.filter(role => 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Roles & Responsibilities</h1>
                    <p className="text-foreground-muted text-sm mt-1 uppercase tracking-widest font-bold">Manage team access and module permissions</p>
                </div>
                {hasPermission('SETTINGS', 'create') && (
                    <button 
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-theme shadow-lg hover:bg-primary/90 transition-all font-bold text-sm"
                    >
                        <Plus size={18} /> New Role
                    </button>
                )}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={18} />
                <input 
                    type="text" 
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm"
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoles.map((role) => (
                        <div key={role.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                {hasPermission('SETTINGS', 'update') && (
                                    <button 
                                        onClick={() => handleOpenAssign(role)}
                                        className="p-2 bg-background-muted text-foreground-muted hover:text-primary rounded-lg transition-colors"
                                        title="Assign Users"
                                    >
                                        <UserPlus size={16} />
                                    </button>
                                )}
                                {hasPermission('SETTINGS', 'update') && (
                                    <button 
                                        onClick={() => handleEdit(role)}
                                        className="p-2 bg-background-muted text-foreground-muted hover:text-primary rounded-lg transition-colors"
                                        title="Edit Role"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                )}
                                {hasPermission('SETTINGS', 'delete') && (
                                    <button 
                                        onClick={() => handleDelete(role.id)}
                                        className="p-2 bg-background-muted text-foreground-muted hover:text-destructive rounded-lg transition-colors"
                                        title="Delete Role"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground">{role.name}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Users size={14} className="text-foreground-muted" />
                                        <span className="text-[10px] font-bold uppercase tracking-tighter text-foreground-muted">{role.userCount || 0} assigned users</span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-sm text-foreground-muted line-clamp-2 min-h-[40px] mb-6">
                                {role.description || "No description provided for this role."}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                                <div className="flex -space-x-2">
                                    {/* Mock avatars for visual flair */}
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-7 h-7 rounded-full border-2 border-card bg-background-muted flex items-center justify-center text-[10px] font-bold">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                    {role.userCount > 3 && (
                                        <div className="w-7 h-7 rounded-full border-2 border-card bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                                            +{role.userCount - 3}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline cursor-pointer">View Permissions</span>
                            </div>
                        </div>
                    ))}

                    {filteredRoles.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center bg-card/50 border border-dashed border-border rounded-2xl">
                            <Shield className="mx-auto mb-4 text-foreground-muted opacity-20" size={48} />
                            <h3 className="font-bold text-foreground opacity-50">No roles found matching your search.</h3>
                        </div>
                    )}
                </div>
            )}

            <CrmRoleEditorModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                role={selectedRole}
                allRoles={roles}
                onSuccess={fetchRoles}
            />

            <CrmRoleAssignUserModal 
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                role={selectedAssignRole}
                onSuccess={fetchRoles}
            />
        </div>
    );
};

export default CrmRolesPage;
