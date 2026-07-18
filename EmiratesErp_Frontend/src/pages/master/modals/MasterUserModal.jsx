import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import InputField from '../components/InputField';
import { masterRoleOptions } from '../constants';

const MasterUserModal = ({ isOpen, onClose, onSave, user, loading }) => {
    const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '', roles: new Set(['MASTER_ADMIN']) });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({ username: user.username, password: '', confirmPassword: '', roles: new Set(user.roles || ['MASTER_ADMIN']) });
        } else {
            setFormData({ username: '', password: '', confirmPassword: '', roles: new Set(['MASTER_ADMIN']) });
        }
        setModalError('');
    }, [user, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (role) => {
        setFormData(prev => {
            const newRoles = new Set(prev.roles);
            if (newRoles.has(role)) newRoles.delete(role);
            else newRoles.add(role);
            return { ...prev, roles: newRoles };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setModalError('Passwords do not match.');
            return;
        }
        if (!user && !formData.password) {
            setModalError('Password is required for new users.');
            return;
        }
        onSave({ ...formData, roles: Array.from(formData.roles) });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{user ? 'Edit' : 'Add'} Master User</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-background-muted"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2"><InputField label="Username" name="username" value={formData.username} onChange={handleChange} required /></div>
                        <div><InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required={!user} placeholder={user ? 'Leave blank to keep current' : ''} /></div>
                        <div><InputField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required={!user || !!formData.password} /></div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground-muted">Roles</label>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                                {masterRoleOptions.map(role => (
                                    <label key={role.value} className="inline-flex items-center">
                                        <input type="checkbox" checked={formData.roles.has(role.value)} onChange={() => handleRoleChange(role.value)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                                        <span className="ml-2 text-sm text-foreground-muted">{role.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        {modalError && <p className="md:col-span-2 text-red-500">{modalError}</p>}
                    </div>
                    <div className="p-4 border-t border-border bg-background-muted flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={loading}>{loading && <Loader className="animate-spin h-4 w-4 mr-2" />} Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MasterUserModal;
