import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Handshake, Plus, Search, Filter, 
    MoreVertical, ArrowUpRight, Banknote, 
    Clock, CheckCircle2, XCircle, ChevronRight,
    TrendingUp, Target, BarChart3, Download, Activity, Briefcase, Edit, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCrmPermissions } from '../context/CrmPermissionsContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const DealCard = ({ deal, onStatusUpdate }) => {
    const navigate = useNavigate();
    const { hasPermission } = useCrmPermissions();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    const statusColors = {
        DRAFT: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
        SENT: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        ACCEPTED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        REJECTED: 'bg-red-500/10 text-red-600 border-red-500/20',
        ORDERED: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStatusUpdate = (e, newStatus) => {
        e.stopPropagation();
        setShowMenu(false);
        if (onStatusUpdate) onStatusUpdate(deal.id, newStatus);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        setShowMenu(false);
        navigate(`/crm-dashboard/deals/edit/${deal.id}`);
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(`/crm-dashboard/deals/edit/${deal.id}`)}
            className="bg-white border border-[#D7E3EE] p-3.5 rounded-lg shadow-2xs hover:shadow-md hover:border-[#0178BC]/50 transition-all group cursor-pointer relative"
        >
            <div className="flex justify-between items-start mb-2.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[deal.status] || 'bg-slate-500/10 text-slate-600 border-slate-500/20'}`}>
                    {deal.status}
                </span>
                {(hasPermission('DEAL', 'update') || hasPermission('DEAL', 'delete')) && (
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                            className="p-1 hover:bg-slate-100 rounded-full transition-all text-[#60738E]"
                        >
                            <MoreVertical size={14} />
                        </button>
                        <AnimatePresence>
                            {showMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-1 w-40 bg-white border border-[#D7E3EE] shadow-xl rounded-md z-50 py-1"
                                >
                                    <button onClick={handleEdit} className="w-full text-left px-3 py-1.5 text-xs font-bold text-[#102A43] hover:bg-[#F8FAFC] transition-colors flex items-center gap-1.5">
                                        <Edit size={13} className="text-[#0178BC]" /> Edit Opportunity
                                    </button>
                                    <div className="px-3 py-1 text-[10px] font-bold text-[#60738E] uppercase border-t border-[#E8EEF7] mt-1">Move to status...</div>
                                    <button onClick={(e) => handleStatusUpdate(e, 'DRAFT')} className="w-full text-left px-3 py-1 text-xs hover:bg-[#F8FAFC] transition-colors text-slate-600">Draft Proposal</button>
                                    <button onClick={(e) => handleStatusUpdate(e, 'SENT')} className="w-full text-left px-3 py-1 text-xs hover:bg-[#F8FAFC] transition-colors text-blue-600">Negotiation</button>
                                    <button onClick={(e) => handleStatusUpdate(e, 'ACCEPTED')} className="w-full text-left px-3 py-1 text-xs hover:bg-[#F8FAFC] transition-colors text-emerald-600">Won Matrix</button>
                                    <button onClick={(e) => handleStatusUpdate(e, 'REJECTED')} className="w-full text-left px-3 py-1 text-xs hover:bg-[#F8FAFC] transition-colors text-red-600">Lost Protocol</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
            
            <h4 className="text-xs font-bold text-[#102A43] mb-0.5 transition-colors truncate">
                {deal.customerName || 'Untitled Opportunity'}
            </h4>
            <p className="text-[11px] font-medium text-[#60738E] mb-3 truncate">
                {deal.quotationNumber || `REF-${deal.id}`}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-[#E8EEF7]">
                <div className="flex flex-col">
                    <span className="text-[10px] text-[#60738E] font-bold uppercase">Estimated Value</span>
                    <span className="text-xs font-bold text-[#0178BC]">
                        AED {deal.netTotal ? deal.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </span>
                </div>
                <div className="h-6 w-6 rounded-full bg-[#0178BC]/10 border border-[#0178BC]/20 flex items-center justify-center text-[10px] font-bold text-[#0178BC]">
                    {deal.salespersonName?.charAt(0) || 'S'}
                </div>
            </div>
        </motion.div>
    );
};

const PipelineColumn = ({ title, deals, status, icon: Icon, colorClass, colorText, onAddClick, onStatusUpdate }) => {
    const navigate = useNavigate();
    const { hasPermission } = useCrmPermissions();
    
    return (
        <div className="flex flex-col min-w-[280px] sm:min-w-[310px] h-full bg-[#F8FAFC] rounded-lg border border-[#D7E3EE]">
            <div className="p-3 border-b border-[#D7E3EE] flex items-center justify-between bg-white shadow-2xs sticky top-0 z-10 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-full ${colorClass} ${colorText} bg-opacity-15`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-xs font-bold text-[#102A43] tracking-tight">{title}</h3>
                    <span className="text-[11px] font-bold text-[#60738E] bg-[#F8FAFC] border border-[#D7E3EE] px-2 py-0.5 rounded-full ml-1">
                        {deals.length}
                    </span>
                </div>
                {hasPermission('DEAL', 'create') && (
                    <button 
                        onClick={() => navigate('/crm-dashboard/deals/new')}
                        className="p-1 hover:bg-[#F8FAFC] rounded text-[#60738E] hover:text-[#0178BC] transition-colors cursor-pointer"
                        title="Add Deal"
                    >
                        <Plus size={16} />
                    </button>
                )}
            </div>
        
            <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto custom-scrollbar min-h-[480px]">
                {deals.length > 0 ? (
                    deals.map(deal => <DealCard key={deal.id} deal={deal} onStatusUpdate={onStatusUpdate} />)
                ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-[#60738E]/50">
                        <Handshake size={40} className="mb-2 stroke-1" />
                        <p className="text-xs font-semibold">No deals in stage</p>
                    </div>
                )}
            </div>
            
            <div className="p-3 border-t border-[#D7E3EE] bg-white rounded-b-lg flex items-center justify-between text-xs">
                <span className="font-bold text-[#60738E] uppercase text-[10px]">Total Stage Value</span>
                <span className="font-bold text-[#102A43]">
                    AED {deals.reduce((acc, d) => acc + (d.netTotal || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>
        </div>
    );
};

const CrmDeals = () => {
    const navigate = useNavigate();
    const { hasPermission } = useCrmPermissions();
    const [loading, setLoading] = useState(true);
    const [quotations, setQuotations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchDeals = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/crm/deals?size=1000`, { headers: authHeaders });
            setQuotations(response.data.content || response.data || []);
        } catch (err) {
            console.error("Failed to fetch deals", err);
            setError("Could not establish connection to Sales Registry.");
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchDeals();
    }, [fetchDeals]);

    const handleStatusUpdate = async (dealId, newStatus) => {
        try {
            await axios.patch(`${API_URL}/sales/quotations/${dealId}/status?status=${newStatus}`, null, { headers: authHeaders });
            fetchDeals();
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update deal status.");
        }
    };

    const filteredDeals = useMemo(() => {
        return quotations.filter(q => 
            q.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [quotations, searchTerm]);

    const pipelineData = useMemo(() => {
        return {
            DRAFT: filteredDeals.filter(q => q.status === 'DRAFT'),
            SENT: filteredDeals.filter(q => q.status === 'SENT'),
            WON: filteredDeals.filter(q => q.status === 'ACCEPTED' || q.status === 'ORDERED'),
            LOST: filteredDeals.filter(q => q.status === 'REJECTED' || q.status === 'CANCELLED')
        };
    }, [filteredDeals]);

    const metrics = useMemo(() => {
        const totalValue = quotations.reduce((acc, q) => acc + (q.netTotal || 0), 0);
        const wonValue = quotations.filter(q => q.status === 'ACCEPTED' || q.status === 'ORDERED').reduce((acc, q) => acc + (q.netTotal || 0), 0);
        const conversionRate = quotations.length ? ((quotations.filter(q => q.status === 'ACCEPTED' || q.status === 'ORDERED').length / quotations.length) * 100).toFixed(1) : 0;
        
        return { totalValue, wonValue, conversionRate, totalCount: quotations.length };
    }, [quotations]);

    return (
        <div className="flex flex-col h-full w-full bg-[#F8FAFC] text-[#102A43] p-0 overflow-hidden font-sans">
            {/* Main Section Header */}
            <div className="p-3 sm:p-4 bg-[#F8FAFC] flex flex-col gap-3 flex-1 overflow-y-auto">
                {/* Standard Action Bar Header (Matching Companies & Calling Data Header) */}
                <div className="bg-white p-2.5 sm:p-3 border border-[#D7E3EE] rounded-lg shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex bg-[#F8FAFC] p-1 rounded-lg border border-[#D7E3EE]">
                            <button
                                className="px-3 py-1 text-xs font-bold text-[#00A3A6] bg-white rounded shadow-xs"
                            >
                                DEAL PIPELINE
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#60738E]" size={14} />
                            <input
                                type="text"
                                placeholder="Search deals or customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#C9D8E5] rounded-md text-xs text-[#102A43] focus:border-[#00A3A6] focus:bg-white outline-none transition-all"
                            />
                        </div>

                        {hasPermission('DEAL', 'create') && (
                            <button
                                onClick={() => navigate('/crm-dashboard/deals/new')}
                                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#00A3A6] rounded-md hover:bg-[#008B8E] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                            >
                                <Plus size={14} /> New Deal
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Stats Cards Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
                    {[
                        { label: 'Total Value', value: `AED ${metrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Briefcase, color: 'text-[#00A3A6]', bg: 'bg-[#00A3A6]/10' },
                        { label: 'Revenue (Won)', value: `AED ${metrics.wonValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-600/10' },
                        { label: 'Conversion Rate', value: `${metrics.conversionRate}%`, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-600/10' },
                        { label: 'Total Opportunities', value: metrics.totalCount, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-500/10' }
                    ].map((m, i) => (
                        <div key={i} className="bg-white border border-[#D7E3EE] p-3 rounded-lg flex items-center gap-3 shadow-2xs">
                            <div className={`p-2.5 rounded-lg ${m.bg} ${m.color} shrink-0`}>
                                <m.icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold text-[#60738E] uppercase tracking-wide truncate">{m.label}</p>
                                <h4 className="text-base font-bold text-[#102A43] truncate">{m.value}</h4>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pipeline Board */}
                <div className="flex-1 overflow-x-auto custom-scrollbar pb-2">
                    <div className="flex gap-4 h-full min-h-[550px]">
                        <PipelineColumn title="Draft Proposals" icon={Clock} deals={pipelineData.DRAFT} status="DRAFT" colorClass="bg-slate-500" colorText="text-slate-600" onStatusUpdate={handleStatusUpdate} />
                        <PipelineColumn title="Negotiation" icon={Handshake} deals={pipelineData.SENT} status="SENT" colorClass="bg-blue-500" colorText="text-blue-600" onStatusUpdate={handleStatusUpdate} />
                        <PipelineColumn title="Won Matrix" icon={CheckCircle2} deals={pipelineData.WON} status="ACCEPTED" colorClass="bg-emerald-500" colorText="text-emerald-600" onStatusUpdate={handleStatusUpdate} />
                        <PipelineColumn title="Lost Protocol" icon={XCircle} deals={pipelineData.LOST} status="REJECTED" colorClass="bg-red-500" colorText="text-red-600" onStatusUpdate={handleStatusUpdate} />
                    </div>
                </div>
            </div>
            
            {loading && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-xs z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-[#00A3A6] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-[#00A3A6]">Updating deal matrix...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrmDeals;
