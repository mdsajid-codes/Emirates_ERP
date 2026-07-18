import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
    Edit, Trash2, PlusCircle, Loader, Search, X, 
    AlertCircle, Contact as ContactIcon, Eye, 
    ChevronLeft, ChevronRight, User, Mail, Phone,
    Briefcase, Shield, Calendar
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
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

    const handleAdd = () => { setEditingItem(null); setIsModalOpen(true); };
    const handleEdit = (item) => { setEditingItem(item); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingItem(null); };

    const handleViewDetails = (item) => { setViewingItem(item); setIsViewModalOpen(true); };
    const handleCloseViewModal = () => { setIsViewModalOpen(false); setViewingItem(null); };

    const handleSave = async (itemData) => {
        setModalLoading(true);
        const isUpdating = Boolean(itemData.id);
        const url = isUpdating ? `${API_URL}/contacts/${itemData.id}` : `${API_URL}/contacts`;
        const method = isUpdating ? 'put' : 'post';

        try {
            await axios[method](url, itemData, { headers: authHeaders });
            await fetchData();
            handleCloseModal();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to sync record.'}`);
        } finally {
            setModalLoading(false);
        }
    };

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
            item.firstName.toLowerCase().includes(q) ||
            item.lastName?.toLowerCase().includes(q) ||
            item.email?.toLowerCase().includes(q)
        );
    }, [contacts, searchTerm]);

    return (
        <div className="p-6 bg-card rounded-theme border border-border shadow-sm h-full flex flex-col min-h-[600px] animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-wrap justify-between items-center gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.4)]"></div>
                    <h3 className="text-2xl font-bold text-foreground tracking-tighter uppercase">Contacts</h3>
                </div>
                
                <div className="flex items-center gap-3 flex-grow sm:flex-grow-0 justify-end">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-4 pr-10 py-2.5 bg-background-muted/50 border border-border rounded-theme outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted group-focus-within:text-primary transition-colors" />
                    </div>
                    {hasPermission('CONTACT', 'create') && (
                        <button 
                            onClick={handleAdd} 
                            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-theme font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 active:scale-95"
                        >
                            <PlusCircle size={14} /> Add Contact
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-theme text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-3">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Table Area */}
            <div className="flex-grow overflow-x-auto custom-scrollbar">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-background-muted/50 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] text-left">
                            <th className="px-6 py-4 border-b border-border w-16">S.No.</th>
                            <th className="px-6 py-4 border-b border-border">Identity</th>
                            <th className="px-6 py-4 border-b border-border">Email Terminal</th>
                            <th className="px-6 py-4 border-b border-border">Secure Line</th>
                            <th className="px-6 py-4 border-b border-border">Registration</th>
                            <th className="px-6 py-4 border-b border-border w-32 text-center">Protocol</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-bold text-foreground">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader className="animate-spin h-8 w-8 text-primary" />
                                        <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest animate-pulse">Syncing Directory...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-background-muted/50 transition-colors group">
                                    <td className="px-6 py-4 border-b border-border text-[10px] text-foreground-muted font-black">{currentPage * pageSize + index + 1}</td>
                                    <td className="px-6 py-4 border-b border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-theme bg-primary/5 text-primary flex items-center justify-center text-xs font-black border border-primary/10">
                                                {item.firstName.charAt(0)}
                                            </div>
                                            <span className="group-hover:text-primary transition-colors italic">{item.firstName} {item.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-b border-border text-foreground-muted font-medium lowercase tracking-tight">{item.email || 'N/A'}</td>
                                    <td className="px-6 py-4 border-b border-border text-foreground-muted font-medium">{item.phone || 'N/A'}</td>
                                    <td className="px-6 py-4 border-b border-border text-[10px] text-foreground-muted uppercase tracking-tighter">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 border-b border-border">
                                        <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleViewDetails(item)} className="p-2 hover:bg-primary/10 text-primary rounded-theme transition-all" title="View Dossier"><Eye size={16} /></button>
                                            {hasPermission('CONTACT', 'update') && (
                                                <button onClick={() => handleEdit(item)} className="p-2 hover:bg-foreground/5 text-foreground rounded-theme transition-all" title="Edit Record"><Edit size={16} /></button>
                                            )}
                                            {hasPermission('CONTACT', 'delete') && (
                                                <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-error/10 text-error rounded-theme transition-all" title="Erase Record"><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="h-16 w-16 bg-background-muted rounded-full flex items-center justify-center ring-4 ring-background">
                                            <ContactIcon className="h-8 w-8 text-foreground-muted/30" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-black text-foreground uppercase tracking-widest italic">No connections detected</h3>
                                            <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-tighter">Initiate a new connection record to populate this matrix.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {!loading && totalPages > 1 && (
                <footer className="flex flex-col sm:flex-row justify-between items-center pt-6 mt-4 border-t border-border">
                    <div className="flex items-center gap-3 text-[10px] font-black text-foreground-muted uppercase tracking-widest mb-4 sm:mb-0">
                        <span>Matrix Density:</span>
                        <select 
                            value={pageSize} 
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }} 
                            className="bg-background-muted border border-border rounded-theme px-2 py-1 outline-none focus:ring-1 focus:ring-primary/20"
                        >
                            {[10, 20, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">
                            Sector {currentPage + 1} / {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0} className="p-2.5 rounded-theme border border-border bg-background hover:bg-background-muted disabled:opacity-30 transition-all"><ChevronLeft className="h-4 w-4" /></button>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1} className="p-2.5 rounded-theme border border-border bg-background hover:bg-background-muted disabled:opacity-30 transition-all"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                    </div>
                </footer>
            )}

            {/* Side Panel for Add/Edit */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" onClick={handleCloseModal} />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-card shadow-2xl z-[9999] border-l border-border flex flex-col"
                        >
                            <CrmContactForm item={editingItem} onSave={handleSave} onCancel={handleCloseModal} loading={modalLoading} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ContactDetailsModal isOpen={isViewModalOpen} onClose={handleCloseViewModal} contact={viewingItem} />
        </div>
    );
};

export default CrmContacts;
