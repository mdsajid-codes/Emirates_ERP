import React, { useState, useEffect } from 'react';
import { X, Check, Shield, Info, MoreHorizontal, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import PermissionPickerPopover from './PermissionPickerPopover';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const OWNER_ONLY_MODULES = ['LEAD', 'TASK', 'CALL_LOG'];

const MODULES = [
    { id: 'LEAD', name: 'Lead', actions: ['view', 'create', 'update', 'delete', 'changeowner', 'export'] },
    { id: 'COMPANY', name: 'Company', actions: ['view', 'create', 'update', 'delete'] },
    { id: 'CONTACT', name: 'Contact', actions: ['view', 'create', 'update', 'delete'] },
    { id: 'TASK', name: 'Task', actions: ['view', 'create', 'update', 'delete'] },
    { id: 'EVENT', name: 'Event', actions: ['view', 'create', 'update', 'delete'] },
    { id: 'CALL_LOG', name: 'Call Log', actions: ['view', 'create', 'update', 'delete'] },
    { id: 'EMAIL', name: 'Email', actions: ['view', 'create', 'update', 'delete'] },
    { id: 'REMINDER', name: 'Reminder', actions: ['view', 'create', 'update'] },
    { id: 'TODO', name: 'To-Do List', actions: ['view', 'create', 'update', 'delete'] },
    { id: 'KPI', name: 'KPI (Pending & Done)', actions: ['view', 'create', 'update', 'delete', 'import'] },
    { id: 'ATTACHMENT', name: 'Attachment', actions: ['view', 'create', 'delete'] },
    { id: 'DASHBOARD', name: 'Dashboard', actions: ['view'] },
    { id: 'PRODUCT', name: 'Product', actions: ['view', 'create', 'update', 'delete'] },
    { id: 'LEAD_STAGE', name: 'Lead Stage', actions: ['view', 'update'] },
    { id: 'REPORT', name: 'Report', actions: ['view', 'export'] }
];

const CrmRoleEditorModal = ({ isOpen, onClose, role, allRoles, onSuccess }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [cloneRoleId, setCloneRoleId] = useState('');
    const [permissions, setPermissions] = useState({}); // { MODULE: { canView: true, ... } }
    const [saving, setSaving] = useState(false);
    const [activePopover, setActivePopover] = useState(null);

    const authHeaders = { "Authorization": `Bearer ${localStorage.getItem('token')}` };

    useEffect(() => {
        if (role) {
            setName(role.name);
            setDescription(role.description || '');
            setCloneRoleId('');
            
            const permMap = {};
            role.permissions?.forEach(p => {
                permMap[p.module] = p;
            });
            setPermissions(permMap);
        } else {
            setName('');
            setDescription('');
            setCloneRoleId('');
            setPermissions({});
        }
    }, [role, isOpen]);

    const handleToggleModule = (moduleId, enabled) => {
        setPermissions(prev => {
            const next = { ...prev };
            if (enabled) {
                // Default enabled state for all actions when toggled ON
                const moduleDef = MODULES.find(m => m.id === moduleId);
                const modPerms = { module: moduleId };
                moduleDef.actions.forEach(action => {
                    const field = `can${action.charAt(0).toUpperCase()}${action.slice(1)}`;
                    modPerms[field] = true;
                });
                next[moduleId] = modPerms;
            } else {
                delete next[moduleId];
            }
            return next;
        });
    };

    const handleUpdatePermission = (moduleId, action, value) => {
        setPermissions(prev => ({
            ...prev,
            [moduleId]: {
                ...prev[moduleId],
                [`can${action.charAt(0).toUpperCase()}${action.slice(1)}`]: value
            }
        }));
    };

    const handleSave = async () => {
        if (!name.trim()) return alert("Role name is required");
        
        const payload = {
            name,
            description,
            cloneRoleId: cloneRoleId || null,
            permissions: Object.values(permissions)
        };

        try {
            setSaving(true);
            if (role) {
                await axios.put(`${API_URL}/crm/roles/${role.id}`, payload, { headers: authHeaders });
            } else {
                await axios.post(`${API_URL}/crm/roles`, payload, { headers: authHeaders });
            }
            onSuccess();
            onClose();
        } catch (err) {
            alert(`Failed to save role: ${err.response?.data?.message || err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border bg-card/50 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">
                                    {role ? 'Edit Role' : 'Create New Role'}
                                </h2>
                                <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest mt-0.5">Define access rules for CRM modules</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="p-2.5 bg-success/10 text-success hover:bg-success/20 rounded-xl transition-all shadow-sm disabled:opacity-50"
                                title="Save"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                            </button>
                            <button 
                                onClick={onClose}
                                className="p-2.5 bg-background-muted text-foreground-muted hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                                title="Cancel"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest ml-1">Role Name</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Sales Executive"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                />
                            </div>
                            {!role && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest ml-1">Clone from existing</label>
                                    <select 
                                        value={cloneRoleId}
                                        onChange={(e) => setCloneRoleId(e.target.value)}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none"
                                    >
                                        <option value="">Start from scratch</option>
                                        {allRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="col-span-full space-y-1.5">
                                <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest ml-1">Description</label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Briefly describe what users in this role do..."
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium min-h-[80px]"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-border">
                                <h3 className="text-xs font-bold text-foreground-muted uppercase tracking-widest flex items-center gap-2">
                                    Module Access Controls
                                </h3>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-foreground-muted uppercase tracking-widest bg-background-muted px-2 py-1 rounded">
                                    <Info size={12} /> Toggles enable/disable entire module
                                </div>
                            </div>

                            <div className="divide-y divide-border border border-border rounded-2xl bg-card/30 overflow-hidden">
                                {MODULES.map((module) => {
                                    const isEnabled = !!permissions[module.id];
                                    const modPerms = permissions[module.id] || {};
                                    
                                    // Get active labels
                                    const activeActions = module.actions.filter(action => 
                                        modPerms[`can${action.charAt(0).toUpperCase()}${action.slice(1)}`]
                                    );

                                    return (
                                        <div key={module.id} className="p-4 flex items-center justify-between group hover:bg-background-muted/20 transition-all">
                                            <div className="flex items-center gap-6 flex-1 min-w-0">
                                                <div className="flex items-center gap-4 w-40">
                                                    <button 
                                                        onClick={() => handleToggleModule(module.id, !isEnabled)}
                                                        className={`relative w-10 h-5 rounded-full transition-colors ${isEnabled ? 'bg-success' : 'bg-border'}`}
                                                    >
                                                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-5' : ''}`} />
                                                    </button>
                                                    <span className={`text-sm font-bold truncate transition-colors ${isEnabled ? 'text-foreground' : 'text-foreground-muted opacity-50'}`}>
                                                        {module.name}
                                                    </span>
                                                </div>

                                                {isEnabled ? (
                                                    <div className="flex flex-wrap items-center gap-4 flex-1 min-w-0 animate-in slide-in-from-left-2 duration-300">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {activeActions.length > 0 ? (
                                                                activeActions.map(action => (
                                                                    <span key={action} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded-md border border-primary/10 capitalize tracking-tight">
                                                                        {action}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-destructive uppercase tracking-widest px-2 py-0.5 bg-destructive/5 rounded-md">No Actions Selected</span>
                                                            )}
                                                        </div>
                                                        {OWNER_ONLY_MODULES.includes(module.id) && (
                                                            <label className="flex items-center gap-2 text-[10px] font-bold text-foreground-muted uppercase tracking-widest cursor-pointer bg-background px-2.5 py-1 rounded-lg border border-border hover:bg-background-muted transition-all">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!modPerms.ownerOnly}
                                                                    onChange={(e) => {
                                                                        setPermissions(prev => ({
                                                                            ...prev,
                                                                            [module.id]: {
                                                                                ...prev[module.id],
                                                                                ownerOnly: e.target.checked
                                                                            }
                                                                        }));
                                                                    }}
                                                                    className="rounded border-border text-primary focus:ring-primary/50"
                                                                />
                                                                <span>Own records only</span>
                                                            </label>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-foreground-muted/30 uppercase tracking-widest">Access Disabled</span>
                                                )}
                                            </div>

                                            {isEnabled && (
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => setActivePopover(activePopover === module.id ? null : module.id)}
                                                        className="p-2 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-lg transition-all"
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                    
                                                    {activePopover === module.id && (
                                                        <PermissionPickerPopover 
                                                            module={module}
                                                            permissions={modPerms}
                                                            onUpdate={(action, val) => handleUpdatePermission(module.id, action, val)}
                                                            onClose={() => setActivePopover(null)}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CrmRoleEditorModal;
