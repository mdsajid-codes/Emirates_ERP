import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Search, PlusCircle, Edit, Trash2, Loader, AlertCircle, X, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Customer Form Component ---
const CustomerForm = ({ customer, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(customer || { name: '', email: '', phone: '' });

    useEffect(() => {
        setFormData(customer || { name: '', email: '', phone: '' });
    }, [customer]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
                <label htmlFor="name" className="block font-bold text-slate-700 mb-1">Name *</label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 bg-slate-50 border-0 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none" />
            </div>
            <div>
                <label htmlFor="email" className="block font-bold text-slate-700 mb-1">Email</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border-0 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none" />
            </div>
            <div>
                <label htmlFor="phone" className="block font-bold text-slate-700 mb-1">Phone</label>
                <input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border-0 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none" />
            </div>
            <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center min-w-[100px]" disabled={isSubmitting}>
                    {isSubmitting ? <Loader className="animate-spin h-4 w-4" /> : 'Save Customer'}
                </button>
            </div>
        </form>
    );
};

// --- Auth Hook for POS Roles ---
const usePosAuth = () => {
    const roles = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('roles') || '[]');
        } catch { return []; }
    }, []);

    const isSuperAdmin = roles.includes('SUPER_ADMIN');
    const isPosAdmin = roles.includes('POS_ADMIN') || isSuperAdmin;
    const canManage = roles.includes('POS_MANAGER') || roles.includes('POS_CASHIER') || isPosAdmin;

    return { isPosAdmin, canManage };
};

const CustomersView = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { isPosAdmin, canManage } = usePosAuth();

    const fetchCustomers = useCallback(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/pos/customers`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => setCustomers(res.data))
            .catch(() => {
                setError('Failed to fetch customers.');
                toast.error('Failed to fetch customers.');
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const handleAdd = () => { setEditingCustomer(null); setIsModalOpen(true); };
    const handleEdit = (customer) => { setEditingCustomer(customer); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingCustomer(null); };

    const handleSave = async (customerData) => {
        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        const method = customerData.id ? 'put' : 'post';
        const url = customerData.id ? `${API_URL}/pos/customers/${customerData.id}` : `${API_URL}/pos/customers`;

        try {
            await axios[method](url, customerData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Customer ${customerData.id ? 'updated' : 'created'} successfully!`);
            fetchCustomers();
            handleCloseModal();
        } catch (err) {
            toast.error(`Error: ${err.response?.data?.message || 'Could not save customer.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (customerId) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            const token = localStorage.getItem('token');
            try {
                await axios.delete(`${API_URL}/pos/customers/${customerId}`, { headers: { "Authorization": `Bearer ${token}` } });
                toast.info('Customer deleted.');
                fetchCustomers();
            } catch (err) {
                toast.error('Failed to delete customer.');
            }
        }
    };

    const filteredCustomers = useMemo(() =>
        customers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone || '').includes(searchTerm)
        ), [customers, searchTerm]);

    return (
        <div className="p-4 sm:p-5 font-sans space-y-3.5">
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Customer Management</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Manage registered POS customer details.</p>
                </div>
                {canManage && (
                    <button onClick={handleAdd} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all">
                        <UserPlus size={15} /> Add Customer
                    </button>
                )}
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by name, email, or phone..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-full text-xs border-0 shadow-xs outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 transition-all"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th className="py-2.5 px-4">Name</th>
                                <th className="py-2.5 px-4">Email</th>
                                <th className="py-2.5 px-4">Phone</th>
                                <th className="py-2.5 px-4 text-right">Loyalty Points</th>
                                {canManage && <th className="py-2.5 px-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {loading ? (
                                <tr><td colSpan={canManage ? 5 : 4} className="text-center py-10"><Loader className="h-6 w-6 animate-spin text-slate-900 mx-auto" /></td></tr>
                            ) : error ? (
                                <tr><td colSpan={canManage ? 5 : 4} className="text-center py-10 text-rose-500 font-medium">{error}</td></tr>
                            ) : filteredCustomers.length > 0 ? (
                                filteredCustomers.map(customer => (
                                    <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-2.5 px-4 font-bold text-slate-900">{customer.name}</td>
                                        <td className="py-2.5 px-4 text-slate-600">{customer.email || '-'}</td>
                                        <td className="py-2.5 px-4 font-mono text-slate-600">{customer.phone || '-'}</td>
                                        <td className="py-2.5 px-4 text-right font-extrabold text-slate-900">{customer.loyaltyPoints || 0}</td>
                                        {canManage && (
                                            <td className="py-2.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => handleEdit(customer)} className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="Edit"><Edit size={15} /></button>
                                                    {isPosAdmin && <button onClick={() => handleDelete(customer.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete"><Trash2 size={15} /></button>}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={canManage ? 5 : 4} className="text-center py-10 text-slate-400">No customers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}>
                <CustomerForm customer={editingCustomer} onSave={handleSave} onCancel={handleCloseModal} isSubmitting={isSubmitting} />
            </Modal>
        </div>
    );
}

export default CustomersView;
