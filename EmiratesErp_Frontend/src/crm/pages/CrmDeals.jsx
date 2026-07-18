import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { 
    Handshake, Plus, Search, Filter, 
    MoreVertical, ArrowUpRight, Banknote, 
    Clock, CheckCircle2, XCircle, ChevronRight,
    TrendingUp, Target, BarChart3, Download, Activity, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCrmPermissions } from '../context/CrmPermissionsContext';
import CrmDealForm from '../components/CrmDealForm';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const DealCard = ({ deal, onStatusUpdate }) => {
    const { hasPermission } = useCrmPermissions();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    const statusColors = {
        DRAFT: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        SENT: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        ACCEPTED: 'bg-success/10 text-success border-success/20',
        REJECTED: 'bg-error/10 text-error border-error/20',
        ORDERED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
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

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border p-4 rounded-theme shadow-sm hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer relative"
        >
            <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[deal.status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                    {deal.status}
                </span>
                {(hasPermission('DEAL', 'update') || hasPermission('DEAL', 'delete')) && (
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                            className="p-1 hover:bg-background rounded-full transition-all"
                        >
                            <MoreVertical size={14} className="text-foreground-muted" />
                        </button>
                        <AnimatePresence>
                            {showMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-1 w-36 bg-card border border-border shadow-lg rounded-theme z-50 py-1"
                                >
                                    <div className="px-3 py-1 text-[10px] font-bold text-foreground-muted uppercase">Move to...</div>
                                    <button onClick={(e) => handleStatusUpdate(e, 'DRAFT')} className="w-full text-left px-3 py-1.5 text-sm hover:bg-background transition-colors text-slate-600">Draft</button>
                                    <button onClick={(e) => handleStatusUpdate(e, 'SENT')} className="w-full text-left px-3 py-1.5 text-sm hover:bg-background transition-colors text-blue-600">Negotiation</button>
                                    <button onClick={(e) => handleStatusUpdate(e, 'ACCEPTED')} className="w-full text-left px-3 py-1.5 text-sm hover:bg-background transition-colors text-emerald-600">Won</button>
                                    <button onClick={(e) => handleStatusUpdate(e, 'REJECTED')} className="w-full text-left px-3 py-1.5 text-sm hover:bg-background transition-colors text-error">Lost</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
            
            <h4 className="text-sm font-bold text-foreground mb-1 transition-colors truncate">
                {deal.customerName || 'Untitled Opportunity'}
            </h4>
            <p className="text-xs text-foreground-muted mb-4 truncate">
                {deal.quotationNumber}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                <div className="flex flex-col">
                    <span className="text-[10px] text-foreground-muted font-medium">Value</span>
                    <span className="text-sm font-bold text-foreground">
                        AED {deal.netTotal?.toLocaleString() || '0.00'}
                    </span>
                </div>
                <div className="h-7 w-7 rounded-full bg-primary/10 border border-background flex items-center justify-center text-xs font-bold text-primary">
                    {deal.salespersonName?.charAt(0) || 'S'}
                </div>
            </div>
        </motion.div>
    );
};

const PipelineColumn = ({ title, deals, status, icon: Icon, colorClass, colorText, onAddClick, onStatusUpdate }) => {
    const { hasPermission } = useCrmPermissions();
    return (
        <div className="flex flex-col min-w-[300px] h-full bg-slate-50/50 rounded-theme border border-border/50">
            <div className="p-4 border-b border-border flex items-center justify-between bg-white shadow-sm sticky top-0 z-10 rounded-t-theme">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${colorClass} ${colorText} bg-opacity-10`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{title}</h3>
                    <span className="text-xs font-bold text-foreground-muted bg-slate-100 px-2 py-0.5 rounded-full ml-2">
                        {deals.length}
                    </span>
                </div>
                {hasPermission('DEAL', 'create') && (
                    <button 
                        onClick={() => onAddClick(status)}
                        className="p-1.5 hover:bg-slate-100 rounded-full text-foreground-muted transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                )}
            </div>
        
        <div className="p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar min-h-[500px]">
            {deals.length > 0 ? (
                deals.map(deal => <DealCard key={deal.id} deal={deal} onStatusUpdate={onStatusUpdate} />)
            ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 opacity-30 grayscale">
                    <Handshake size={48} className="mb-2" />
                    <p className="text-sm font-medium">No deals yet</p>
                </div>
            )}
        </div>
        
        <div className="p-4 border-t border-border bg-white rounded-b-theme flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-muted">Total Value</span>
            <span className="text-sm font-bold text-foreground">
                AED {deals.reduce((acc, d) => acc + (d.netTotal || 0), 0).toLocaleString()}
            </span>
        </div>
    </div>
    );
};

const CrmDeals = () => {
    const { hasPermission } = useCrmPermissions();
    const [loading, setLoading] = useState(true);
    const [quotations, setQuotations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formStatus, setFormStatus] = useState('DRAFT');

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchDeals = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/crm/deals?size=1000`, { headers: authHeaders });
            setQuotations(response.data.content || []);
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
            fetchDeals(); // Refresh pipeline
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update deal status.");
        }
    };

    const handleAddDealClick = (status = 'DRAFT') => {
        setFormStatus(status);
        setIsFormOpen(true);
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
        <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500">
            {/* Welcome Banner Style Header */}
            <div className="bg-gradient-to-r from-primary to-accent rounded-theme p-6 md:p-8 text-primary-foreground shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Deal Pipeline</h1>
                        <p className="opacity-90 max-w-xl text-sm">
                            Manage your sales opportunities and track negotiation progress. You have <strong>{metrics.totalCount}</strong> active opportunities in the matrix.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/60 group-focus-within:text-white transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search deals..." 
                                className="pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-theme text-sm focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all w-48 md:w-64 placeholder:text-white/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {hasPermission('DEAL', 'create') && (
                            <button 
                                onClick={() => handleAddDealClick('DRAFT')}
                                className="bg-white text-primary px-5 py-2.5 rounded-theme font-bold text-xs flex items-center gap-2 shadow-lg hover:bg-slate-50 transition-all"
                            >
                                <Plus size={16} /> New Deal
                            </button>
                        )}
                    </div>
                </div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-24 right-12 w-48 h-48 bg-white opacity-10 rounded-full blur-xl"></div>
            </div>

            {/* Quick Stats Summary (matching CrmHome style) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Value', value: `AED ${metrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Revenue (Won)', value: `AED ${metrics.wonValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Conversion', value: `${metrics.conversionRate}%`, icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Total Deals', value: metrics.totalCount, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-500/10' }
                ].map((m, i) => (
                    <div key={i} className="bg-card border border-border p-4 rounded-theme text-center">
                        <div className={`inline-flex p-2 rounded-full ${m.bg} ${m.color} mb-2`}>
                            <m.icon className="h-4 w-4" />
                        </div>
                        <h4 className="text-xl font-bold text-foreground">{m.value}</h4>
                        <p className="text-xs text-foreground-muted uppercase tracking-wider font-medium">{m.label}</p>
                    </div>
                ))}
            </div>

            {/* Pipeline Grid */}
            <div className="flex-1 overflow-x-auto custom-scrollbar pb-6">
                <div className="flex gap-6 h-full min-h-[600px]">
                    <PipelineColumn title="Draft Proposals" icon={Clock} deals={pipelineData.DRAFT} status="DRAFT" colorClass="bg-slate-500" colorText="text-slate-500" onAddClick={handleAddDealClick} onStatusUpdate={handleStatusUpdate} />
                    <PipelineColumn title="Negotiation" icon={Handshake} deals={pipelineData.SENT} status="SENT" colorClass="bg-blue-500" colorText="text-blue-500" onAddClick={handleAddDealClick} onStatusUpdate={handleStatusUpdate} />
                    <PipelineColumn title="Won Matrix" icon={CheckCircle2} deals={pipelineData.WON} status="ACCEPTED" colorClass="bg-emerald-500" colorText="text-emerald-500" onAddClick={handleAddDealClick} onStatusUpdate={handleStatusUpdate} />
                    <PipelineColumn title="Lost Protocol" icon={XCircle} deals={pipelineData.LOST} status="REJECTED" colorClass="bg-red-500" colorText="text-red-500" onAddClick={handleAddDealClick} onStatusUpdate={handleStatusUpdate} />
                </div>
            </div>
            
            {loading && !isFormOpen && (
                <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-primary animate-pulse">Syncing Pipeline...</p>
                    </div>
                </div>
            )}

            <CrmDealForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                onSaved={fetchDeals} 
                initialStatus={formStatus} 
            />
        </div>
    );
};

export default CrmDeals;
