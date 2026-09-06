import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
    Edit, Trash2, Plus, Loader, Search, X, 
    AlertCircle, Contact as ContactIcon, Eye, 
    ChevronLeft, ChevronRight, User, Mail, Phone,
    Briefcase, Shield, Calendar
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCrmPermissions } from '../context/CrmPermissionsContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

// A placeholder for the Add/Edit Contact Form. 
// In a real scenario, this would be a separate component like CrmContactForm.jsx
const CrmContactForm = ({ item, onSave, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', leadId: ''
    });

    useEffect(() => {
        if (item) {
            setFormData({
                firstName: item.firstName || '',
                lastName: item.lastName || '',
                email: item.email || '',
                phone: item.phone || '',
                leadId: item.leadId || ''
            });
        }
    }, [item]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex flex-col h-full bg-card">
            <div className="p-5 border-b border-border flex justify-between items-center bg-background-muted/30">
                <div>
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tight leading-none">
                        {item ? 'Edit Connection' : 'New Connection'}
                    </h3>
                    <p className="text-[10px] text-foreground-muted font-black mt-1.5 uppercase tracking-widest opacity-60">
                        Contact Protocol Details
                    </p>
                </div>
                <button onClick={onCancel} className="p-2 rounded-full text-foreground-muted hover:bg-background-muted hover:text-foreground transition-all">
                    <X size={20} />
                </button>
            </div>
            
            <form className="p-6 flex-grow overflow-y-auto space-y-5" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, id: item?.id }); }}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest ml-1">First Name</label>
                        <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-4 py-2.5 bg-background border border-border rounded-theme outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest ml-1">Last Name</label>
                        <input name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-4 py-2.5 bg-background border border-border rounded-theme outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest ml-1">Email Address</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 bg-background border border-border rounded-theme outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest ml-1">Phone Number</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 bg-background border border-border rounded-theme outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest ml-1">Associate Lead ID</label>
                    <input name="leadId" value={formData.leadId} onChange={handleChange} className="w-full px-4 py-2.5 bg-background border border-border rounded-theme outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" />
                </div>
            </form>

            <div className="p-5 bg-background-muted/30 border-t border-border flex justify-end gap-3">
                <button onClick={onCancel} className="px-5 py-2.5 rounded-theme text-[10px] font-black uppercase tracking-widest text-foreground-muted hover:bg-background-muted transition-all">Cancel</button>
                <button 
                    onClick={() => onSave({ ...formData, id: item?.id })} 
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-theme text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center gap-2"
                    disabled={loading}
                >
                    {loading && <Loader className="animate-spin h-3.5 w-3.5" />}
                    {item ? 'Update Record' : 'Commit Record'}
                </button>
            </div>
        </div>
    );
};

// Reusable Modal for Viewing Contact Details
const ContactDetailsModal = ({ isOpen, onClose, contact }) => {
    if (!isOpen || !contact) return null;

    const DetailItem = ({ label, icon: Icon, value }) => (
        <div className="p-4 rounded-theme bg-background border border-border flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon size={16} />
            </div>
            <div>
                <p className="text-[10px] text-foreground-muted font-black uppercase tracking-widest leading-none mb-1.5">{label}</p>
                <p className="text-sm font-bold text-foreground">{value || 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[10000] p-4" onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-card text-card-foreground rounded-theme shadow-2xl w-full max-w-lg overflow-hidden relative border border-border" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 border-b border-border flex justify-between items-center bg-background-muted/30">
                    <div>
                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic">Contact Dossier</h3>
                        <p className="text-[10px] text-foreground-muted font-black mt-1 uppercase tracking-widest opacity-60">Stored Identifier: {contact.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-foreground-muted hover:bg-background-muted transition-all"><X size={20} /></button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Full Name" icon={User} value={`${contact.firstName} ${contact.lastName}`} />
                    <DetailItem label="Email Identity" icon={Mail} value={contact.email} />
                    <DetailItem label="Secure Line" icon={Phone} value={contact.phone} />
                    <DetailItem label="Affiliated Lead" icon={Briefcase} value={contact.leadId} />
                    <DetailItem label="Registration" icon={Calendar} value={new Date(contact.createdAt).toLocaleDateString()} />
                    <DetailItem label="Verification" icon={Shield} value="Verified Active" />
                </div>
                <div className="p-5 bg-background-muted/30 border-t border-border flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-theme bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all">Close Terminal</button>
                </div>
            </motion.div>
        </div>
    );
};

const CrmContacts = () => {
    const { hasPermission } = useCrmPermissions();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [viewingItem, setViewingItem] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { page: currentPage, size: pageSize, sort: 'firstName,asc' };
            const response = await axios.get(`${API_URL}/contacts`, { params, headers: authHeaders });
            setContacts(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
        } catch (err) {
            setError('Failed to fetch contact directory.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, authHeaders]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const navigate = useNavigate();

    const handleAdd = () => { navigate('/crm-dashboard/contacts/new'); };
    const handleEdit = (item) => { navigate(`/crm-dashboard/contacts/edit/${item.id}`); };

    const handleViewDetails = (item) => { setViewingItem(item); setIsViewModalOpen(true); };
    const handleCloseViewModal = () => { setIsViewModalOpen(false); setViewingItem(null); };

    const handleDelete = async (id) => {
        if (window.confirm('Erase this professional connection record?')) {
            try {
                await axios.delete(`${API_URL}/contacts/${id}`, { headers: authHeaders });
                await fetchData();
            } catch (err) {
                alert('Deletion protocol failed.');
            }
        }
    };

    const filteredData = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return contacts;
        return contacts.filter(item =>
            item.firstName?.toLowerCase().includes(q) ||
            item.lastName?.toLowerCase().includes(q) ||
            item.email?.toLowerCase().includes(q)
        );
    }, [contacts, searchTerm]);

    return (
        <div className="w-full px-3 py-2 space-y-2 bg-slate-50/50 min-h-screen">
            {/* Header & Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 bg-white p-2.5 rounded-lg border border-[#E8EEF7] shadow-2xs">
                <div className="flex items-center gap-2.5">
                    <div className="h-6 w-1 bg-[#00A3A6] rounded-full"></div>
                    <h3 className="text-base font-extrabold text-[#0F2342] uppercase tracking-wide">CONTACTS</h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-64">
                        <Search className="w-4 h-4 text-[#62708A] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] rounded-lg text-xs text-[#111111] placeholder-[#62708A] outline-none border border-[#E8EEF7] focus:border-[#00A3A6] focus:bg-white transition-all"
                        />
                    </div>

                    {hasPermission('CONTACT', 'create') && (
                        <button
                            onClick={handleAdd}
                            className="bg-[#00A3A6] hover:bg-[#008286] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ml-auto sm:ml-0"
                        >
                            <Plus className="h-4 w-4" /> Add Contact
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={15} /> {error}
                </div>
            )}

            {/* Main Content Table Section */}
            <div className="bg-white border border-[#E8EEF7] rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-[#F8FAFC] border-b border-[#E8EEF7] text-[11px] font-bold text-[#486581] uppercase tracking-wider">
                                <th className="py-3.5 px-5 w-16">S.NO.</th>
                                <th className="py-3.5 px-5">IDENTITY</th>
                                <th className="py-3.5 px-5">EMAIL TERMINAL</th>
                                <th className="py-3.5 px-5">SECURE LINE</th>
                                <th className="py-3.5 px-5">REGISTRATION</th>
                                <th className="py-3.5 px-5 text-center">PROTOCOL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8EEF7] text-xs text-[#102A43]">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-16">
                                        <Loader className="animate-spin h-7 w-7 text-[#00A3A6] mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredData.length > 0 ? (
                                filteredData.map((item, index) => {
                                    const initialsStr = item.firstName ? item.firstName.substring(0, 1).toUpperCase() : 'A';
                                    return (
                                        <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors group">
                                            {/* S.No. */}
                                            <td className="py-3 px-5 text-[#62708A] font-semibold">
                                                {currentPage * pageSize + index + 1}
                                            </td>

                                            {/* Identity */}
                                            <td className="py-3 px-5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full bg-[#E6F0F8] text-[#0178BC] font-bold text-xs flex items-center justify-center shrink-0">
                                                        {initialsStr}
                                                    </div>
                                                    <span className="font-bold text-[#111111] group-hover:text-[#00A3A6] transition-colors">
                                                        {item.firstName} {item.lastName}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="py-3 px-5 text-[#62708A] font-medium">
                                                {item.email || 'N/A'}
                                            </td>

                                            {/* Phone */}
                                            <td className="py-3 px-5 font-mono text-[#62708A]">
                                                {item.phone || 'N/A'}
                                            </td>

                                            {/* Registration Date */}
                                            <td className="py-3 px-5 text-[#62708A] font-medium">
                                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>

                                            {/* Protocol Actions */}
                                            <td className="py-3 px-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleViewDetails(item)} className="p-1.5 text-[#62708A] hover:text-[#00A3A6] hover:bg-slate-100 rounded-md transition-colors" title="View Dossier">
                                                        <Eye size={15} />
                                                    </button>
                                                    {hasPermission('CONTACT', 'update') && (
                                                        <button onClick={() => handleEdit(item)} className="p-1.5 text-[#62708A] hover:text-[#0178BC] hover:bg-slate-100 rounded-md transition-colors" title="Edit Record">
                                                            <Edit size={15} />
                                                        </button>
                                                    )}
                                                    {hasPermission('CONTACT', 'delete') && (
                                                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-[#62708A] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Erase Record">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center text-[#62708A]">No connections detected in current directory.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Bottom Pagination Bar */}
                <div className="p-4 bg-white border-t border-[#E8EEF7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#62708A]">
                    <div>
                        Showing {filteredData.length > 0 ? currentPage * pageSize + 1 : 0} to {Math.min((currentPage + 1) * pageSize, filteredData.length)} of {filteredData.length} results
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            className="px-2.5 py-1.5 bg-white border border-[#E8EEF7] rounded-lg hover:bg-slate-50 font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i).map(pageIdx => (
                            <button
                                key={pageIdx}
                                onClick={() => setCurrentPage(pageIdx)}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                    currentPage === pageIdx
                                        ? 'bg-[#00A3A6] text-white shadow-xs'
                                        : 'bg-white border border-[#E8EEF7] text-[#111111] hover:bg-slate-50'
                                }`}
                            >
                                {pageIdx + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={currentPage >= totalPages - 1}
                            className="px-2.5 py-1.5 bg-white border border-[#E8EEF7] rounded-lg hover:bg-slate-50 font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>

            <ContactDetailsModal isOpen={isViewModalOpen} onClose={handleCloseViewModal} contact={viewingItem} />
        </div>
    );
};

export default CrmContacts;
