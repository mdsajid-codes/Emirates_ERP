import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { vatApi } from '../api/vatApi';
import { toast } from 'react-toastify';

const VatRateSetup = () => {
    const [groups, setGroups] = useState([]);
    const [types, setTypes] = useState([]);
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [activeTab, setActiveTab] = useState('rates');
    
    // Modal states
    const [isRateModalVisible, setIsRateModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        rate: '',
        vatType: 'STANDARD'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [groupsRes, typesRes, ratesRes] = await Promise.all([
                vatApi.getGroups(),
                vatApi.getTypes(),
                vatApi.getRates()
            ]);
            setGroups(groupsRes.data);
            setTypes(typesRes.data);
            setRates(ratesRes.data);
        } catch (error) {
            toast.error('Failed to load VAT setup data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRateSubmit = async (e) => {
        e.preventDefault();
        try {
            await vatApi.createRate(formData);
            toast.success('VAT Rate created successfully');
            setIsRateModalVisible(false);
            setFormData({ name: '', rate: '', vatType: 'STANDARD' });
            fetchData();
        } catch (error) {
            toast.error('Failed to create VAT Rate');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col overflow-hidden p-6 bg-background text-foreground"
        >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
                        <Link to="/account-dashboard" className="hover:text-primary">Accounting</Link>
                        <span>&gt;</span>
                        <span className="text-foreground-muted font-medium">VAT Configuration</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">VAT Configuration</h1>
                </div>

                {activeTab === 'rates' && (
                    <button
                        onClick={() => setIsRateModalVisible(true)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-theme text-sm font-semibold shadow transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Add VAT Rate
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-border mb-6">
                {['rates', 'types', 'groups'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
                            activeTab === tab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-foreground-muted hover:text-foreground'
                        }`}
                    >
                        {tab === 'rates' ? 'VAT Rates' : tab === 'types' ? 'VAT Types' : 'VAT Groups'}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-card border border-border rounded-theme shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'rates' && (
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="bg-background-muted text-foreground-muted border-b border-border text-xs uppercase font-semibold">
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Rate (%)</th>
                                        <th className="p-3">VAT Type</th>
                                        <th className="p-3">Out of Scope Reason</th>
                                        <th className="p-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {rates.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-6 text-center text-foreground-muted">No VAT rates found.</td>
                                        </tr>
                                    ) : (
                                        rates.map((rate) => (
                                            <tr key={rate.id} className="hover:bg-background-muted/40 transition-colors">
                                                <td className="p-3 font-semibold">{rate.name}</td>
                                                <td className="p-3">{rate.rate}</td>
                                                <td className="p-3">{rate.vatType}</td>
                                                <td className="p-3">{rate.outOfScopeReason || '-'}</td>
                                                <td className="p-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button className="p-1.5 text-foreground-muted hover:text-primary hover:bg-background-muted rounded transition-colors" title="Edit">
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button className="p-1.5 text-foreground-muted hover:text-error hover:bg-background-muted rounded transition-colors" title="Delete">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                        
                        {activeTab === 'types' && (
                            <div className="p-6 text-foreground-muted">VAT Types configuration (Coming soon)</div>
                        )}
                        
                        {activeTab === 'groups' && (
                            <div className="p-6 text-foreground-muted">VAT Groups configuration (Coming soon)</div>
                        )}
                    </>
                )}
            </div>

            {/* Modal */}
            {isRateModalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border rounded-theme shadow-lg w-full max-w-md overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background-muted">
                            <h3 className="font-bold text-lg text-foreground">Add VAT Rate</h3>
                            <button onClick={() => setIsRateModalVisible(false)} className="text-foreground-muted hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleRateSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1 uppercase">Rate Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Standard 5%"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1 uppercase">Rate Percentage</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={formData.rate}
                                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1 uppercase">VAT Type</label>
                                    <select
                                        required
                                        value={formData.vatType}
                                        onChange={(e) => setFormData({ ...formData, vatType: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="STANDARD">Standard</option>
                                        <option value="ZERO_RATED">Zero Rated</option>
                                        <option value="EXEMPT">Exempt</option>
                                        <option value="OUT_OF_SCOPE">Out of Scope</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsRateModalVisible(false)}
                                        className="px-4 py-2 rounded-theme text-sm font-semibold border border-border hover:bg-background-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-theme text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                    >
                                        Create Rate
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default VatRateSetup;
