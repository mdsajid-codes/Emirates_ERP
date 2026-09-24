import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Search, Edit, Trash2, Loader, UserPlus, Building, Phone, Mail, FileText, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import CustomerForm from '../components/CustomerForm';
import { POS_FALLBACK_THEME } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Helper getters for unified Party data ---
const getDisplayName = (c) => c?.companyName || c?.name || c?.primaryContactPerson || [c?.primaryFirstName, c?.primaryLastName].filter(Boolean).join(' ') || 'Unnamed Customer';
const getContactEmail = (c) => c?.contactEmail || c?.email || '';
const getContactPhone = (c) => c?.contactPhone || c?.mobile || c?.phone || '';
const getVatTrn = (c) => c?.vatTrnNumber || c?.vatNumber || '';
const getCreditLimit = (c) => c?.creditLimitAllowed !== undefined && c?.creditLimitAllowed !== null ? Number(c.creditLimitAllowed) : 0;

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

const CustomersView = ({ posTheme: propPosTheme }) => {
    const posTheme = propPosTheme || POS_FALLBACK_THEME;
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
        setError('');
        const token = localStorage.getItem('token');
        const tenantId = localStorage.getItem('tenantId') || 'default';
        axios.get(`${API_URL}/parties?type=CUSTOMER`, {
            headers: { Authorization: `Bearer ${token}`, 'X-Tenant-ID': tenantId }
        })
            .then(res => {
                const data = res.data?.content || res.data || [];
                setCustomers(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error("Error fetching customers:", err);
                setError('Failed to fetch customers.');
                toast.error('Failed to fetch customer parties.');
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
        const tenantId = localStorage.getItem('tenantId') || 'default';
        const isEdit = Boolean(customerData.id);
        const method = isEdit ? 'put' : 'post';
        const url = isEdit ? `${API_URL}/parties/${customerData.id}` : `${API_URL}/parties`;

        const payload = {
            ...customerData,
            partyType: 'CUSTOMER'
        };

        try {
            await axios[method](url, payload, {
                headers: { Authorization: `Bearer ${token}`, 'X-Tenant-ID': tenantId }
            });
            toast.success(`Customer ${isEdit ? 'updated' : 'created'} successfully!`);
            fetchCustomers();
            handleCloseModal();
        } catch (err) {
            console.error("Error saving customer party:", err);
            toast.error(`Error: ${err.response?.data?.message || err.response?.data?.error || 'Could not save customer.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (customerId) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            const token = localStorage.getItem('token');
            const tenantId = localStorage.getItem('tenantId') || 'default';
            try {
                await axios.delete(`${API_URL}/parties/${customerId}`, {
                    headers: { Authorization: `Bearer ${token}`, 'X-Tenant-ID': tenantId }
                });
                toast.info('Customer deleted.');
                fetchCustomers();
            } catch (err) {
                console.error("Error deleting customer:", err);
                toast.error('Failed to delete customer.');
            }
        }
    };

    const filteredCustomers = useMemo(() =>
        customers.filter(c => {
            const nameStr = getDisplayName(c).toLowerCase();
            const emailStr = getContactEmail(c).toLowerCase();
            const phoneStr = getContactPhone(c).toLowerCase();
            const trnStr = getVatTrn(c).toLowerCase();
            const query = searchTerm.toLowerCase().trim();
            if (!query) return true;
            return nameStr.includes(query) || emailStr.includes(query) || phoneStr.includes(query) || trnStr.includes(query);
        }), [customers, searchTerm]);

    const primaryColor = posTheme?.primary || posTheme?.sidebarActive || '#00A9A8';

    return (
        <div className="p-4 sm:p-5 font-sans space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Customer Management</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Manage registered ERP Customer Parties for POS transactions.</p>
                </div>
                {canManage && (
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <UserPlus size={15} /> Add Customer Party
                    </button>
                )}
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by company name, TRN, email, or phone..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-full text-xs border border-slate-200 shadow-xs outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 transition-all"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th className="py-3 px-4">Company / Customer Name</th>
                                <th className="py-3 px-4">Contact Person</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Phone / Mobile</th>
                                <th className="py-3 px-4">VAT TRN</th>
                                <th className="py-3 px-4 text-right">Credit Limit</th>
                                {canManage && <th className="py-3 px-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={canManage ? 7 : 6} className="text-center py-10">
                                        <Loader className="h-6 w-6 animate-spin text-[#00A9A8] mx-auto" />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={canManage ? 7 : 6} className="text-center py-10 text-rose-500 font-medium">{error}</td>
                                </tr>
                            ) : filteredCustomers.length > 0 ? (
                                filteredCustomers.map(customer => {
                                    const displayName = getDisplayName(customer);
                                    const contactPerson = customer.primaryContactPerson || [customer.primaryFirstName, customer.primaryLastName].filter(Boolean).join(' ') || '-';
                                    const email = getContactEmail(customer) || '-';
                                    const phone = getContactPhone(customer) || '-';
                                    const trn = getVatTrn(customer) || '-';
                                    const creditLimit = getCreditLimit(customer);

                                    return (
                                        <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                <div className="flex items-center gap-2">
                                                    <Building className="h-4 w-4 text-[#00A9A8] shrink-0" />
                                                    <span>{displayName}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">{contactPerson}</td>
                                            <td className="py-3 px-4 text-slate-600">{email}</td>
                                            <td className="py-3 px-4 font-mono text-slate-600">{phone}</td>
                                            <td className="py-3 px-4 font-mono text-slate-600">{trn}</td>
                                            <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                                                AED {creditLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            {canManage && (
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleEdit(customer)}
                                                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                                            title="Edit Party"
                                                        >
                                                            <Edit size={15} />
                                                        </button>
                                                        {isPosAdmin && (
                                                            <button
                                                                onClick={() => handleDelete(customer.id)}
                                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                                title="Delete Party"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={canManage ? 7 : 6} className="text-center py-10 text-slate-400">
                                        No customer parties found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCustomer ? 'Edit Customer Party' : 'Add New Customer Party'}>
                <CustomerForm customer={editingCustomer} onSave={handleSave} onCancel={handleCloseModal} isSubmitting={isSubmitting} posTheme={posTheme} />
            </Modal>
        </div>
    );
};

export default CustomersView;

