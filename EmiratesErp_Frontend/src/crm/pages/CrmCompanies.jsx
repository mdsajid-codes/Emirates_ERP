import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { 
    Edit, Trash2, Plus, Loader, Search, X, AlertCircle, 
    Building, Eye, Download, Upload, Filter, LayoutGrid,
    ChevronLeft, ChevronRight, Globe, Phone, Mail, User,
    Shield, BarChart3
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import CrmCompanyForm from '../components/CrmCompanyForm';
import { useCrmPermissions } from '../context/CrmPermissionsContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ContactDetailsModal = ({ isOpen, onClose, company }) => {
    if (!isOpen || !company) return null;

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
                className="bg-card text-card-foreground rounded-theme shadow-2xl w-full max-w-2xl overflow-hidden relative border border-border" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 border-b border-border flex justify-between items-center bg-background-muted/30">
                    <div>
                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic">Corporate Intelligence</h3>
                        <p className="text-[10px] text-foreground-muted font-black mt-1 uppercase tracking-widest opacity-60">Entity ID: {company.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-foreground-muted hover:bg-background-muted transition-all"><X size={20} /></button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Entity Name" icon={Building} value={company.name} />
                    <DetailItem label="Industry Sector" icon={BarChart3} value={company.industryName} />
                    <DetailItem label="Account Owner" icon={User} value={company.companyOwner} />
                    <DetailItem label="Phone Terminal" icon={Phone} value={company.phone} />
                    <DetailItem label="Email Identity" icon={Mail} value={company.email} />
                    <DetailItem label="Digital Hub" icon={Globe} value={company.website} />
                </div>
                <div className="p-5 bg-background-muted/30 border-t border-border flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-theme bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all">Close Terminal</button>
                </div>
            </motion.div>
        </div>
    );
};

const CrmCompanies = () => {
    const { hasPermission } = useCrmPermissions();
    const [companies, setCompanies] = useState([]);
    const [selectData, setSelectData] = useState({ companyTypes: [], industries: [], locations: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewingItem, setViewingItem] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [companiesRes, typesRes, industriesRes, locationsRes] = await Promise.all([
                axios.get(`${API_URL}/crm/companies`, { headers: authHeaders }),
                axios.get(`${API_URL}/crm/company-types`, { headers: authHeaders }),
                axios.get(`${API_URL}/settings/industries`, { headers: authHeaders }),
                axios.get(`${API_URL}/locations`, { headers: authHeaders }),
            ]);
            setCompanies(Array.isArray(companiesRes.data) ? companiesRes.data : []);
            setSelectData({
                companyTypes: Array.isArray(typesRes.data) ? typesRes.data : [],
                industries: Array.isArray(industriesRes.data) ? industriesRes.data : [],
                locations: Array.isArray(locationsRes.data) ? locationsRes.data : [],
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = () => { setEditingItem(null); setIsDrawerOpen(true); };
    const handleEdit = (item) => { setEditingItem(item); setIsDrawerOpen(true); };

    const handleSave = async (itemData) => {
        setIsSubmitting(true);
        const isUpdating = Boolean(itemData.id);
        const url = isUpdating ? `${API_URL}/crm/companies/${itemData.id}` : `${API_URL}/crm/companies`;
        const method = isUpdating ? 'put' : 'post';

        try {
            await axios[method](url, itemData, { headers: authHeaders });
            await fetchData();
            setIsDrawerOpen(false);
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to sync entity.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Terminate this corporate entity record?')) return;
        try {
            await axios.delete(`${API_URL}/crm/companies/${id}`, { headers: authHeaders });
            await fetchData();
        } catch (err) {
            alert('Termination failed.');
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(`${API_URL}/crm/companies/bulk-template`, {
                headers: authHeaders,
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'crm_companies_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Failed to download matrix template.');
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            await axios.post(`${API_URL}/crm/companies/bulk`, formData, { headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' } });
            fetchData();
        } catch (err) {
            alert('Bulk upload protocol failed.');
        } finally {
            setIsUploading(false);
            event.target.value = null;
        }
    };

    const filteredData = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return companies;
        return companies.filter(item =>
            item.name.toLowerCase().includes(q) ||
            item.email?.toLowerCase().includes(q) ||
            item.companyOwner?.toLowerCase().includes(q)
        );
    }, [companies, searchTerm]);

    return (
        <div className="p-6 bg-card rounded-theme border border-border shadow-sm h-full flex flex-col min-h-[600px] animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-wrap justify-between items-center gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.4)]"></div>
                    <h3 className="text-2xl font-bold text-foreground tracking-tighter uppercase">Companies</h3>
                </div>
                
                <div className="flex items-center gap-3 flex-grow sm:flex-grow-0 justify-end">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search entities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-4 pr-10 py-2.5 bg-background-muted/50 border border-border rounded-theme outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted group-focus-within:text-primary transition-colors" />
                    </div>
                    {hasPermission('COMPANY', 'import') && (
                        <div className="flex bg-background-muted/50 rounded-theme border border-border p-1">
                            <button onClick={handleDownloadTemplate} className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-theme transition-all" title="Template"><Download size={16} /></button>
                            <button onClick={() => fileInputRef.current.click()} className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-theme transition-all" title="Bulk Upload"><Upload size={16} /></button>
                        </div>
                    )}
                    {hasPermission('COMPANY', 'create') && (
                        <button 
                            onClick={handleAdd} 
                            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-theme font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 active:scale-95"
                        >
                            <Plus size={14} /> Add Company
                        </button>
                    )}
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-grow overflow-x-auto custom-scrollbar">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-background-muted/50 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] text-left">
                            <th className="px-6 py-4 border-b border-border">Entity Name</th>
                            <th className="px-6 py-4 border-b border-border">Owner</th>
                            <th className="px-6 py-4 border-b border-border">Phone</th>
                            <th className="px-6 py-4 border-b border-border">Email Terminal</th>
                            <th className="px-6 py-4 border-b border-border">Industry</th>
                            <th className="px-6 py-4 border-b border-border w-32 text-center">Protocol</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-bold text-foreground">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader className="animate-spin h-8 w-8 text-primary" />
                                        <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest animate-pulse">Syncing Matrix...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-background-muted/50 transition-colors group">
                                    <td className="px-6 py-4 border-b border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-theme bg-primary/5 text-primary flex items-center justify-center text-xs font-black border border-primary/10">
                                                <Building size={14} />
                                            </div>
                                            <span className="group-hover:text-primary transition-colors italic truncate max-w-[200px]">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-b border-border text-foreground-muted font-medium italic">{item.companyOwner || 'N/A'}</td>
                                    <td className="px-6 py-4 border-b border-border text-foreground-muted font-medium">{item.phone || 'N/A'}</td>
                                    <td className="px-6 py-4 border-b border-border text-foreground-muted font-medium lowercase tracking-tight">{item.email || 'N/A'}</td>
                                    <td className="px-6 py-4 border-b border-border">
                                        <span className="px-2 py-1 bg-primary/5 text-primary text-[9px] font-black uppercase rounded-full border border-primary/10">
                                            {item.industryName || 'Unclassified'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 border-b border-border">
                                        <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setViewingItem(item); setIsViewModalOpen(true); }} className="p-2 hover:bg-primary/10 text-primary rounded-theme transition-all"><Eye size={16} /></button>
                                            {hasPermission('COMPANY', 'update') && (
                                                <button onClick={() => handleEdit(item)} className="p-2 hover:bg-foreground/5 text-foreground rounded-theme transition-all"><Edit size={16} /></button>
                                            )}
                                            {hasPermission('COMPANY', 'delete') && (
                                                <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-error/10 text-error rounded-theme transition-all"><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="py-20 text-center text-foreground-muted">No entities detected in current sector.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls" />

            {/* Side Drawer for Form */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" onClick={() => setIsDrawerOpen(false)} />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-card shadow-2xl z-[9999] border-l border-border flex flex-col"
                        >
                            <div className="p-5 border-b border-border flex items-center justify-between bg-card">
                                <div>
                                    <h3 className="text-lg font-black text-foreground tracking-tight uppercase leading-none">{editingItem ? 'Edit Entity' : 'New Entity'}</h3>
                                    <p className="text-[10px] text-foreground-muted font-bold mt-1.5 uppercase tracking-widest opacity-60">Corporate Registry Details</p>
                                </div>
                                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-background-muted rounded-full transition-colors text-foreground-muted hover:text-foreground"><X size={20} /></button>
                            </div>
                            
                            <div className="flex-1 overflow-hidden relative">
                                {isSubmitting && (
                                    <div className="absolute inset-0 bg-card/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                        <Loader className="h-8 w-8 text-primary animate-spin" />
                                    </div>
                                )}
                                <div className="h-full overflow-y-auto">
                                    <CrmCompanyForm 
                                        item={editingItem} 
                                        onSave={handleSave} 
                                        onCancel={() => setIsDrawerOpen(false)} 
                                        loading={isSubmitting}
                                        companies={companies}
                                        companyTypes={selectData.companyTypes}
                                        industries={selectData.industries}
                                        locations={selectData.locations}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ContactDetailsModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} company={viewingItem} />
        </div>
    );
};

export default CrmCompanies;