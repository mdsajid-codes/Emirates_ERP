import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { 
    Edit, Trash2, Plus, Loader, Search, X, AlertCircle, 
    Building, Eye, Download, Upload, Filter, LayoutGrid,
    ChevronLeft, ChevronRight, Globe, Phone, Mail, User,
    Shield, BarChart3
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;
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
            const rawCompanies = Array.isArray(companiesRes.data) ? companiesRes.data : [];
            const sortedCompanies = [...rawCompanies].sort((a, b) => (b.id || 0) - (a.id || 0));
            setCompanies(sortedCompanies);
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

    const navigate = useNavigate();

    const handleAdd = () => { navigate('/crm-dashboard/companies/new'); };
    const handleEdit = (item) => { navigate(`/crm-dashboard/companies/edit/${item.id}`); };

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
            item.name?.toLowerCase().includes(q) ||
            item.email?.toLowerCase().includes(q) ||
            item.companyOwner?.toLowerCase().includes(q)
        );
    }, [companies, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

    const paginatedData = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    return (
        <div className="w-full px-3 py-2 space-y-2 bg-slate-50/50 min-h-screen">
            {/* Header & Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 bg-white p-2.5 rounded-lg border border-[#E8EEF7] shadow-2xs">
                <div className="flex items-center gap-2.5">
                    <div className="h-6 w-1 bg-[#00A3A6] rounded-full"></div>
                    <h3 className="text-base font-extrabold text-[#0F2342] uppercase tracking-wide">COMPANIES</h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-64">
                        <Search className="w-4 h-4 text-[#62708A] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search entities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] rounded-lg text-xs text-[#111111] placeholder-[#62708A] outline-none border border-[#E8EEF7] focus:border-[#00A3A6] focus:bg-white transition-all"
                        />
                    </div>

                    {hasPermission('COMPANY', 'import') && (
                        <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 border border-[#E8EEF7] rounded-lg">
                            <button onClick={handleDownloadTemplate} className="p-1.5 text-[#62708A] hover:text-[#00A3A6] hover:bg-slate-100 rounded transition-colors" title="Download Template">
                                <Download size={15} />
                            </button>
                            <button onClick={() => fileInputRef.current.click()} className="p-1.5 text-[#62708A] hover:text-[#00A3A6] hover:bg-slate-100 rounded transition-colors" title="Bulk Upload">
                                <Upload size={15} />
                            </button>
                        </div>
                    )}

                    {hasPermission('COMPANY', 'create') && (
                        <button
                            onClick={handleAdd}
                            className="bg-[#00A3A6] hover:bg-[#008286] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ml-auto sm:ml-0"
                        >
                            <Plus className="h-4 w-4" /> Add Company
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Table Section */}
            <div className="bg-white border border-[#E8EEF7] rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-[#F8FAFC] border-b border-[#E8EEF7] text-[11px] font-bold text-[#486581] uppercase tracking-wider">
                                <th className="py-3.5 px-5">ENTITY NAME</th>
                                <th className="py-3.5 px-5">OWNER</th>
                                <th className="py-3.5 px-5">PHONE</th>
                                <th className="py-3.5 px-5">EMAIL TERMINAL</th>
                                <th className="py-3.5 px-5">INDUSTRY</th>
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
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((item) => {
                                    return (
                                        <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors group">
                                            {/* Entity Name */}
                                            <td className="py-3 px-5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-[#E6F0F8] text-[#0178BC] font-bold text-xs flex items-center justify-center shrink-0">
                                                        <Building size={14} />
                                                    </div>
                                                    <span className="font-bold text-[#111111] group-hover:text-[#00A3A6] transition-colors">{item.name}</span>
                                                </div>
                                            </td>

                                            {/* Owner */}
                                            <td className="py-3 px-5">
                                                <div className="font-medium text-[#111111]">{item.companyOwner || 'N/A'}</div>
                                            </td>

                                            {/* Phone */}
                                            <td className="py-3 px-5 font-mono text-[#62708A]">
                                                {item.phone || 'N/A'}
                                            </td>

                                            {/* Email */}
                                            <td className="py-3 px-5 text-[#62708A] font-medium">
                                                {item.email || 'N/A'}
                                            </td>

                                            {/* Industry */}
                                            <td className="py-3 px-5">
                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E6F0F8] text-[#0178BC] uppercase">
                                                    {item.industryName || 'Unclassified'}
                                                </span>
                                            </td>

                                            {/* Actions / Protocol */}
                                            <td className="py-3 px-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => { setViewingItem(item); setIsViewModalOpen(true); }} className="p-1.5 text-[#62708A] hover:text-[#00A3A6] hover:bg-slate-100 rounded-md transition-colors" title="View Profile">
                                                        <Eye size={15} />
                                                    </button>
                                                    {hasPermission('COMPANY', 'update') && (
                                                        <button onClick={() => handleEdit(item)} className="p-1.5 text-[#62708A] hover:text-[#0178BC] hover:bg-slate-100 rounded-md transition-colors" title="Edit Company">
                                                            <Edit size={15} />
                                                        </button>
                                                    )}
                                                    {hasPermission('COMPANY', 'delete') && (
                                                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-[#62708A] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete Entity">
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
                                    <td colSpan="6" className="py-16 text-center text-[#62708A]">No entities detected in current sector.</td>
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

            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls" />

            <ContactDetailsModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} company={viewingItem} />
        </div>
    );
};

export default CrmCompanies;