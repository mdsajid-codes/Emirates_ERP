import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Building, Store, Users, Percent, Edit, Trash2, PlusCircle, Loader, Save, X, ClipboardList, Eye, Tag, UploadCloud, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { constructImageUrl } from '../sales/utils';
import CompanyInfo from '../../manageCompany/CompanyInfo';
import { POS_FALLBACK_THEME } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Reusable Components ---

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-base font-bold text-slate-900">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"><X size={18} /></button>
                </div>
                <div className="p-6 font-sans text-xs">
                    {children}
                </div>
            </div>
        </div>
    );
};

const FormField = ({ label, name, value, onChange, type = 'text', required = false, ...props }) => (
    <div>
        <label htmlFor={name} className="block font-bold text-slate-700 mb-1">{label} {required && '*'}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none"
            {...props}
        />
    </div>
);

const StoreForm = ({ item, onSave, onCancel, posTheme }) => {
    const [formData, setFormData] = useState(item || { name: '', address: '', currency: 'AED', timezone: 'Asia/Dubai', vatNumber: '' });
    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };
    return (
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <FormField label="Store Name" name="name" value={formData.name} onChange={handleChange} required />
            <FormField label="Address" name="address" value={formData.address} onChange={handleChange} />
            <FormField label="Currency" name="currency" value={formData.currency} onChange={handleChange} />
            <FormField label="Timezone" name="timezone" value={formData.timezone} onChange={handleChange} />
            <FormField label="VAT Number" name="vatNumber" value={formData.vatNumber} onChange={handleChange} />
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl font-bold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer" style={{ backgroundColor: posTheme?.primary || '#0f172a' }}>Save Store</button>
            </div>
        </form>
    );
};

const TaxRateForm = ({ item, onSave, onCancel, posTheme }) => {
    const [formData, setFormData] = useState(item || { name: '', percent: 0, compound: false });
    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };
    return (
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <FormField label="Tax Name" name="name" value={formData.name} onChange={handleChange} required />
            <FormField label="Percent (%)" name="percent" type="number" step="0.01" value={formData.percent} onChange={handleChange} required />
            <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer pt-1">
                <input type="checkbox" name="compound" checked={formData.compound} onChange={handleChange} className="h-4 w-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900" /> Compound Tax
            </label>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl font-bold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer" style={{ backgroundColor: posTheme?.primary || '#0f172a' }}>Save Tax Rate</button>
            </div>
        </form>
    );
};

const CategoryForm = ({ item, onSave, onCancel, posTheme }) => {
    const [formData, setFormData] = useState(item || { name: '', description: '' });
    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };
    return (
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <FormField label="Category Name" name="name" value={formData.name} onChange={handleChange} required />
            <FormField label="Description" name="description" value={formData.description} onChange={handleChange} />
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl font-bold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer" style={{ backgroundColor: posTheme?.primary || '#0f172a' }}>Save Category</button>
            </div>
        </form>
    );
};

const UserForm = ({ item, onSave, onCancel, posTheme }) => {
    const [formData, setFormData] = useState(item || {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'POS_CASHIER',
        storeId: null,
    });
    const [formError, setFormError] = useState('');
    const [stores, setStores] = useState([]);
    const [storesLoading, setStoresLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchStores = async () => {
            setStoresLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/pos/stores`, { headers: { "Authorization": `Bearer ${token}` } });
                setStores(res.data);
            } catch (err) {
                console.error("Error fetching stores:", err);
                setFormError("Failed to load stores for selection.");
            } finally {
                setStoresLoading(false);
            }
        };
        fetchStores();
    }, [API_URL]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormError('');
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setFormError("Passwords do not match.");
            return;
        }
        if (!item && !formData.password) {
            setFormError("Password is required for new users.");
            return;
        }
        if (formData.password && formData.password.length < 6) {
            setFormError("Password must be at least 6 characters long.");
            return;
        }

        const payload = { ...formData };
        if (payload.storeId === '') payload.storeId = null;
        onSave(item ? { ...payload, id: item.id } : payload);
    };

    const posRoles = ['POS_ADMIN', 'POS_MANAGER', 'POS_CASHIER'];

    return (
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <FormField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <FormField label="Display Name" name="name" value={formData.name} onChange={handleChange} required />
            <FormField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required={!item} placeholder={item ? 'Leave blank to keep current' : ''} />
            <FormField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required={!item || !!formData.password} />

            <div>
                <label htmlFor="role" className="block font-bold text-slate-700 mb-1">Role *</label>
                <select id="role" name="role" value={formData.role} onChange={handleChange} required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none">
                    {posRoles.map(role => (
                        <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="storeId" className="block font-bold text-slate-700 mb-1">Assign to Store (Optional)</label>
                {storesLoading ? (
                    <Loader className="animate-spin h-4 w-4 text-slate-900 mt-1" />
                ) : (
                    <select id="storeId" name="storeId" value={formData.storeId || ''} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none">
                        <option value="">No specific store</option>
                        {stores.map(store => (
                            <option key={store.id} value={store.id}>{store.name}</option>
                        ))}
                    </select>
                )}
            </div>

            {formError && <p className="text-rose-600 font-bold">{formError}</p>}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl font-bold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer" style={{ backgroundColor: posTheme?.primary || '#0f172a' }}>Save User</button>
            </div>
        </form>
    );
};

const InfoDisplay = ({ label, value }) => (
    <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="font-bold text-slate-900 text-xs">{value || <span className="text-slate-400 font-normal">N/A</span>}</p>
    </div>
);

const CrudTable = ({ title, columns, data, onAdd, onEdit, onDelete, addLabel, canManage, posTheme }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center gap-3">
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            {canManage && (
                <button onClick={onAdd} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer" style={{ backgroundColor: posTheme?.primary || '#0f172a' }}>
                    <PlusCircle size={15} /> {addLabel}
                </button>
            )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <tr>
                            {columns.map(col => <th key={col.key} className="py-2.5 px-4">{col.header}</th>)}
                            {canManage && <th className="py-2.5 px-4 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {data.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                {columns.map(col => <td key={col.key} className="py-2.5 px-4 font-semibold text-slate-900">{typeof item[col.key] === 'boolean' ? (item[col.key] ? 'Yes' : 'No') : item[col.key]}</td>)}
                                {canManage && (
                                    <td className="py-2.5 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => onEdit(item)} className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="Edit"><Edit size={15} /></button>
                                            <button onClick={() => onDelete(item.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete"><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

// --- Auth Hook ---
const usePosAuth = () => {
    const roles = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('roles') || '[]');
        } catch {
            return [];
        }
    }, []);

    const isSuperAdmin = roles.includes('SUPER_ADMIN');
    const isPosAdmin = roles.includes('POS_ADMIN') || isSuperAdmin;
    const isPosManager = roles.includes('POS_MANAGER');

    return { isPosAdmin, isPosManager, isSuperAdmin };
};

// --- General Settings Tab ---
const GeneralSettingsTab = ({ posTheme }) => {
    const [tenant, setTenant] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', contactEmail: '', contactPhone: '', address: '' });
    const [logoFile, setLogoFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [logoUrl, setLogoUrl] = useState(null);
    const { isPosAdmin } = usePosAuth();

    const fetchTenant = useCallback(() => {
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/pos/tenant/current`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                setTenant(res.data);
                setFormData({
                    name: res.data.name || '',
                    contactEmail: res.data.contactEmail || '',
                    contactPhone: res.data.contactPhone || '',
                    address: res.data.address || '',
                });

                if (res.data.logoImgUrl) {
                    setLogoUrl(constructImageUrl(res.data.logoImgUrl));
                }
            })
            .catch(err => console.error("Error fetching tenant info:", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchTenant(); }, [fetchTenant]);

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        setIsUploading(true);

        try {
            if (logoFile) {
                const logoFormData = new FormData();
                logoFormData.append('file', logoFile);
                await axios.post(`${API_URL}/pos/tenant/current/logo`, logoFormData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
            }

            await axios.put(`${API_URL}/pos/tenant/current`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setIsEditing(false);
            setLogoFile(null);
            toast.success('Tenant information updated successfully.');
            fetchTenant();
        } catch (err) {
            console.error("Failed to update tenant:", err);
            toast.error(`Failed to update tenant: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader className="animate-spin h-6 w-6 text-slate-900" /></div>;

    return (
        <div className="max-w-2xl space-y-3.5">
            <div className="flex justify-between items-center gap-3">
                <h3 className="text-sm font-bold text-slate-900">Tenant / Store Info</h3>
                {isPosAdmin && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-2xs">
                        <Edit size={14} /> Edit Information
                    </button>
                )}
            </div>
            <div className="p-5 border border-slate-200/60 rounded-2xl bg-white shadow-sm space-y-4">
                {isEditing ? (
                    <div className="space-y-3.5 text-xs">
                        <FormField label="Contact Email" name="contactEmail" type="email" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
                        <FormField label="Contact Phone" name="contactPhone" value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} />
                        <FormField label="Address" name="address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                            <button onClick={() => { setIsEditing(false); setLogoFile(null); }} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all" disabled={isUploading}>Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 flex items-center gap-2" style={{ backgroundColor: posTheme?.primary || '#0f172a' }} disabled={isUploading}>
                                {isUploading ? <Loader className="animate-spin h-4 w-4" /> : <Save size={15} />}
                                {isUploading ? 'Saving...' : 'Save Info'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoDisplay label="Tenant ID" value={tenant?.tenantId} />
                        <InfoDisplay label="Contact Email" value={tenant?.contactEmail} />
                        <InfoDisplay label="Contact Phone" value={tenant?.contactPhone} />
                        <div className="md:col-span-2"><InfoDisplay label="Address" value={tenant?.address} /></div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- CRUD Factory ---
const createCrudTab = (config) => ({ posTheme }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isPosAdmin } = usePosAuth();

    const fetchItems = useCallback(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}${config.endpoints.getAll}`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => {
                let fetchedData = res.data;
                if (config.name === 'pos users') {
                    const relevantRoles = new Set(['POS_ADMIN', 'POS_MANAGER', 'POS_CASHIER']);
                    fetchedData = res.data.filter(user =>
                        user.roles && user.roles.some(role => relevantRoles.has(role))
                    ).map(user => ({
                        ...user,
                        role: user.roles.find(r => relevantRoles.has(r))
                    }));
                }
                setData(fetchedData);
            }).catch(err => console.error(`Error fetching ${config.name}:`, err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const handleAdd = () => { setCurrentItem(null); setIsModalOpen(true); };
    const handleEdit = (item) => { setCurrentItem(item); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setCurrentItem(null); };

    const handleSave = (itemData) => {
        const token = localStorage.getItem('token');
        const isUpdating = itemData.id;
        const url = isUpdating ? `${API_URL}${config.endpoints.update}/${itemData.id}` : `${API_URL}${config.endpoints.create}`;
        const method = isUpdating ? 'put' : 'post';

        const dataToSend = { ...itemData };
        if (config.name === 'pos users') {
            dataToSend.roles = [itemData.role];
            delete dataToSend.role;
            if ('confirmPassword' in dataToSend) delete dataToSend.confirmPassword;
            if (isUpdating && dataToSend.password === '') delete dataToSend.password;
            if (!isUpdating) {
                dataToSend.isActive = true;
                dataToSend.isLocked = false;
            }
        }

        axios[method](url, dataToSend, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(() => {
                toast.success(`${config.singularName} saved!`);
                fetchItems();
                handleCloseModal();
            })
            .catch(err => toast.error(`Error saving ${config.singularName}: ${err.response?.data?.message || err.message}`));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete this ${config.singularName}?`)) {
            const token = localStorage.getItem('token');
            axios.delete(`${API_URL}${config.endpoints.delete}/${id}`, { headers: { "Authorization": `Bearer ${token}` } })
                .then(() => {
                    toast.info(`${config.singularName} deleted.`);
                    fetchItems();
                })
                .catch(err => toast.error(`Error deleting ${config.singularName}: ${err.response?.data?.message || err.message}`));
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader className="animate-spin h-6 w-6 text-slate-900" /></div>;

    return (
        <>
            <CrudTable
                title={config.title}
                columns={config.columns}
                data={data}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                addLabel={`Add ${config.singularName}`}
                canManage={isPosAdmin}
                posTheme={posTheme}
            />
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem ? `Edit ${config.singularName}` : `Add ${config.singularName}`}>
                <config.FormComponent item={currentItem} onSave={handleSave} onCancel={handleCloseModal} posTheme={posTheme} />
            </Modal>
        </>
    );
};

const StoreSettingsTab = createCrudTab({
    name: 'stores', singularName: 'Store', title: 'Store Locations', addLabel: 'Add Store',
    columns: [
        { header: 'Name', key: 'name' },
        { header: 'Address', key: 'address' },
        { header: 'Currency', key: 'currency' },
        { header: 'Timezone', key: 'timezone' },
        { header: 'VAT Number', key: 'vatNumber' },
    ],
    endpoints: { getAll: '/pos/stores', create: '/pos/stores', update: '/pos/stores', delete: '/pos/stores' },
    FormComponent: StoreForm,
});

const UserSettingsTab = createCrudTab({
    name: 'pos users', singularName: 'User', title: 'POS Operator Accounts', addLabel: 'Add User',
    columns: [
        { header: 'Display Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Role', key: 'role' },
        { header: 'Store ID', key: 'storeId' },
    ],
    endpoints: {
        getAll: '/users',
        create: '/users/register',
        update: '/users',
        delete: '/users',
    },
    FormComponent: UserForm,
});

const TaxSettingsTab = createCrudTab({
    name: 'tax rates', singularName: 'Tax Rate', title: 'Tax Rates & VAT', addLabel: 'Add Tax Rate',
    columns: [
        { header: 'Name', key: 'name' },
        { header: 'Percent (%)', key: 'percent' },
        { header: 'Compound', key: 'compound' },
    ],
    endpoints: { getAll: '/pos/tax-rates', create: '/pos/tax-rates', update: '/pos/tax-rates', delete: '/pos/tax-rates' },
    FormComponent: TaxRateForm,
});

const CategorySettingsTab = createCrudTab({
    name: 'categories', singularName: 'Category', title: 'Product Categories', addLabel: 'Add Category',
    columns: [
        { header: 'Name', key: 'name' },
        { header: 'Description', key: 'description' },
    ],
    endpoints: { getAll: '/pos/categories', create: '/pos/categories', update: '/pos/categories', delete: '/pos/categories' },
    FormComponent: CategoryForm,
});

// --- Audit Log Tab ---
const AuditEventLogTab = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewingPayload, setViewingPayload] = useState(null);

    const fetchEvents = useCallback(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/pos/audit-events`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => setEvents(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
            .catch(err => {
                setError('Failed to load audit events.');
                toast.error("Failed to load audit log.");
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const formatTimestamp = (ts) => new Date(ts).toLocaleString();

    if (loading) return <div className="flex justify-center p-8"><Loader className="animate-spin h-6 w-6 text-slate-900" /></div>;
    if (error) return <p className="text-rose-600 font-bold text-xs">{error}</p>;

    return (
        <div className="space-y-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th className="py-2.5 px-4">Timestamp</th>
                                <th className="py-2.5 px-4">Actor</th>
                                <th className="py-2.5 px-4">Entity</th>
                                <th className="py-2.5 px-4">Action</th>
                                <th className="py-2.5 px-4 text-right">Payload</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {events.map(event => (
                                <tr key={event.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{formatTimestamp(event.createdAt)}</td>
                                    <td className="py-2.5 px-4 font-semibold text-slate-900">{event.actorId || 'System'}</td>
                                    <td className="py-2.5 px-4 text-slate-600">{event.entityType} ({event.entityId})</td>
                                    <td className="py-2.5 px-4 font-bold text-slate-900">{event.action}</td>
                                    <td className="py-2.5 px-4 text-right">
                                        <button onClick={() => setViewingPayload(event.payload)} className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="View Payload">
                                            <Eye size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={!!viewingPayload} onClose={() => setViewingPayload(null)} title="Audit Event Payload">
                <pre className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs font-mono overflow-x-auto max-h-96 text-slate-800">
                    {JSON.stringify(JSON.parse(viewingPayload || '{}'), null, 2)}
                </pre>
            </Modal>
        </div>
    );
};

// --- Main Component ---
const tabs = [
    { name: 'Tenant', icon: Building, component: GeneralSettingsTab },
    { name: 'Company Info', icon: FileText, component: CompanyInfo, requiredRoles: ['POS_ADMIN'] },
    { name: 'Stores', icon: Store, component: StoreSettingsTab },
    { name: 'Users', icon: Users, component: UserSettingsTab },
    { name: 'Taxes', icon: Percent, component: TaxSettingsTab },
    { name: 'Categories', icon: Tag, component: CategorySettingsTab },
    { name: 'Audit Log', icon: ClipboardList, component: AuditEventLogTab, requiredRoles: ['POS_ADMIN', 'POS_MANAGER'] },
];

const PosSettingsView = ({ posTheme: propPosTheme }) => {
    const posTheme = propPosTheme || POS_FALLBACK_THEME;
    const [activeTab, setActiveTab] = useState(tabs[0].name);
    const { isPosAdmin, isPosManager, isSuperAdmin } = usePosAuth();

    const accessibleTabs = useMemo(() =>
        tabs.filter(tab => {
            if (isSuperAdmin) return true;
            return !tab.requiredRoles || (isPosAdmin && tab.requiredRoles.includes('POS_ADMIN')) || (isPosManager && tab.requiredRoles.includes('POS_MANAGER'));
        }), [isPosAdmin, isPosManager, isSuperAdmin]);

    const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component;

    return (
        <div className="p-4 sm:p-5 font-sans space-y-3.5">
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">POS Settings & System Config</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Manage store locations, tax rates, categories, and POS operators.</p>
                </div>
            </div>

            {/* Rounded Tab Pill Selection Bar */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-full overflow-x-auto w-fit text-xs font-bold">
                {accessibleTabs.map((tab) => {
                    const isActive = activeTab === tab.name;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${isActive ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <Icon size={14} />
                            <span>{tab.name}</span>
                        </button>
                    );
                })}
            </div>

            <div className="pt-1">
                {ActiveComponent ? <ActiveComponent posTheme={posTheme} /> : <p className="text-xs text-slate-500">Select a setting to view.</p>}
            </div>
        </div>
    );
}

export default PosSettingsView;
