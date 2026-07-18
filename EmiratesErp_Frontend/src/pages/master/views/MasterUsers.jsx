import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Loader, AlertCircle, Edit, Trash2 } from 'lucide-react';
import MasterUserModal from '../modals/MasterUserModal';

const MasterUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/master/users`, { headers: { "Authorization": `Bearer ${token}` } });
            setUsers(response.data);
        } catch (err) {
            setError('Failed to fetch master users.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, [API_URL]);

    const handleAdd = () => { setEditingUser(null); setIsModalOpen(true); };
    const handleEdit = (user) => { setEditingUser(user); setIsModalOpen(true); };

    const handleSave = async (userData) => {
        setModalLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const { confirmPassword, ...payload } = userData;
            if (editingUser) {
                await axios.put(`${API_URL}/master/users/${editingUser.id}`, payload, { headers: { "Authorization": `Bearer ${token}` } });
            } else {
                await axios.post(`${API_URL}/master/users`, payload, { headers: { "Authorization": `Bearer ${token}` } });
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data || 'Failed to save user.');
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this master user?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/master/users/${userId}`, { headers: { "Authorization": `Bearer ${token}` } });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data || 'Failed to delete user.');
            console.error(err);
        }
    };

    return (
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-foreground">Master Users</h1>
                <button onClick={handleAdd} className="btn-primary flex items-center"><PlusCircle className="h-5 w-5 mr-2" /> Add Master User</button>
            </div>

            {error && (<div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded relative mb-4" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span></div>)}

            <div className="bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-background-muted">
                                <tr>
                                    <th className="th-cell">Username</th>
                                    <th className="th-cell">Roles</th>
                                    <th className="th-cell">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-foreground-muted">
                                {users.length > 0 ? (
                                    users.map(user => (
                                        <tr key={user.id} className="border-b border-border hover:bg-background-muted">
                                            <td className="td-cell font-medium text-foreground">{user.username}</td>
                                            <td className="td-cell"><div className="flex flex-wrap gap-1">{user.roles.map(role => (<span key={role} className="px-2 py-0.5 text-xs font-semibold rounded-full bg-background-muted text-foreground-muted">{role}</span>))}</div></td>
                                            <td className="td-cell">
                                                <button onClick={() => handleEdit(user)} className="p-2 hover:text-primary hover:bg-background-muted rounded-full transition-colors" title="Edit"><Edit className="h-4 w-4" /></button>
                                                <button onClick={() => handleDelete(user.id)} className="p-2 hover:text-red-600 hover:bg-background-muted rounded-full transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="3" className="text-center py-10 text-foreground-muted"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No master users found</h3><p className="mt-1 text-sm">Get started by creating a new master user.</p></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <MasterUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} user={editingUser} loading={modalLoading} />
        </div>
    );
};

export default MasterUsers;
