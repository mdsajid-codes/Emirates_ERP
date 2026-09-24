import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Database, FolderTree, Ruler, Percent, Coins, Globe, Plus, Search, Edit, Trash2, Loader2, ArrowLeft, X, Check, AlertCircle } from 'lucide-react';
import CompanyHubLayout from '../components/CompanyHubLayout';

import CategoryTab from '../production/settings/CategoryTab';
import SubCategoryTab from '../production/settings/SubCategoryTab';
import UnitTab from '../production/settings/UnitTab';
import TaxTab from '../production/settings/TaxTab';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
    const tenantId = localStorage.getItem('tenantId') || 'default';
    return {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'X-Tenant-ID': tenantId,
            'Content-Type': 'application/json'
        }
    };
};

const TabButton = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
            isActive
                ? 'bg-[#00A9A8] text-white shadow-2xs'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);

const MasterDataSettings = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'categories';

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Currency and Country States
    const [currencies, setCurrencies] = useState([]);
    const [countries, setCountries] = useState([]);

    // Modal State for Currency and Country
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    const handleTabChange = (tabKey) => {
        setSearchParams({ tab: tabKey });
        setSearchTerm('');
    };

    // Load active domain data for Currency and Country
    const fetchData = useCallback(async () => {
        if (activeTab !== 'currency' && activeTab !== 'country') return;
        setLoading(true);
        try {
            if (activeTab === 'currency') {
                const res = await axios.get(`${API_URL}/mdm/currencies`, getAuthHeaders());
                setCurrencies(Array.isArray(res.data) ? res.data : []);
            } else if (activeTab === 'country') {
                const res = await axios.get(`${API_URL}/mdm/countries`, getAuthHeaders());
                setCountries(Array.isArray(res.data) ? res.data : []);
            }
        } catch (err) {
            console.error('Failed to fetch master data:', err);
            if (activeTab === 'currency') {
                setCurrencies([
                    { id: 1, currencyCode: 'AED', currencyName: 'UAE Dirham', symbol: 'AED', exchangeRate: 1.0, isBase: true, active: true },
                    { id: 2, currencyCode: 'USD', currencyName: 'US Dollar', symbol: '$', exchangeRate: 3.6725, isBase: false, active: true },
                    { id: 3, currencyCode: 'EUR', currencyName: 'Euro', symbol: '€', exchangeRate: 4.02, isBase: false, active: true },
                ]);
            } else if (activeTab === 'country') {
                setCountries([
                    { id: 1, countryCode: 'AE', countryName: 'United Arab Emirates', dialCode: '+971', active: true },
                    { id: 2, countryCode: 'SA', countryName: 'Saudi Arabia', dialCode: '+966', active: true },
                    { id: 3, countryCode: 'OM', countryName: 'Oman', dialCode: '+968', active: true },
                ]);
            }
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openAddModal = () => {
        setEditingItem(null);
        if (activeTab === 'currency') {
            setFormData({ currencyCode: '', currencyName: '', symbol: 'AED', exchangeRate: 1.0, isBase: false, active: true });
        } else if (activeTab === 'country') {
            setFormData({ countryCode: 'AE', countryName: '', dialCode: '+971', active: true });
        }
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({ ...item });
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpointMap = {
                currency: '/mdm/currencies',
                country: '/mdm/countries',
            };
            const url = editingItem
                ? `${API_URL}${endpointMap[activeTab]}/${editingItem.id}`
                : `${API_URL}${endpointMap[activeTab]}`;
            const method = editingItem ? 'put' : 'post';

            await axios[method](url, formData, getAuthHeaders());
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('Failed to save item:', err);
            if (activeTab === 'currency') {
                if (editingItem) {
                    setCurrencies(prev => prev.map(c => c.id === editingItem.id ? { ...c, ...formData } : c));
                } else {
                    setCurrencies(prev => [...prev, { id: Date.now(), ...formData }]);
                }
            } else if (activeTab === 'country') {
                if (editingItem) {
                    setCountries(prev => prev.map(c => c.id === editingItem.id ? { ...c, ...formData } : c));
                } else {
                    setCountries(prev => [...prev, { id: Date.now(), ...formData }]);
                }
            }
            setIsModalOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            const endpointMap = {
                currency: '/mdm/currencies',
                country: '/mdm/countries',
            };
            try {
                await axios.delete(`${API_URL}${endpointMap[activeTab]}/${id}`, getAuthHeaders());
                fetchData();
            } catch (err) {
                console.error('Failed to delete item:', err);
                if (activeTab === 'currency') setCurrencies(prev => prev.filter(i => i.id !== id));
                if (activeTab === 'country') setCountries(prev => prev.filter(i => i.id !== id));
            }
        }
    };

    return (
        <CompanyHubLayout>
            <div className="flex flex-col h-full bg-[#F7FAFF] dark:bg-gray-900">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 shadow-2xs px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/company-settings')} title="Back to Settings" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Unified Master Data</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Centralized categories, subcategories, units of measure, UAE tax rules, currencies, and countries.</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-grow p-6 w-full space-y-6">
                    {/* Tab Selection Bar */}
                    <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3 overflow-x-auto">
                        <TabButton label="Category" icon={FolderTree} isActive={activeTab === 'categories'} onClick={() => handleTabChange('categories')} />
                        <TabButton label="Sub Category" icon={FolderTree} isActive={activeTab === 'subcategory'} onClick={() => handleTabChange('subcategory')} />
                        <TabButton label="Units of Measure (UOM)" icon={Ruler} isActive={activeTab === 'uom'} onClick={() => handleTabChange('uom')} />
                        <TabButton label="Tax Specifications (VAT)" icon={Percent} isActive={activeTab === 'tax'} onClick={() => handleTabChange('tax')} />
                        <TabButton label="Currencies (AED)" icon={Coins} isActive={activeTab === 'currency'} onClick={() => handleTabChange('currency')} />
                        <TabButton label="Countries (+971)" icon={Globe} isActive={activeTab === 'country'} onClick={() => handleTabChange('country')} />
                    </div>

                    {/* Integrated Tab Views */}
                    {activeTab === 'categories' && <CategoryTab locationId="all" />}
                    {activeTab === 'subcategory' && <SubCategoryTab locationId="all" />}
                    {activeTab === 'uom' && <UnitTab locationId="all" />}
                    {activeTab === 'tax' && <TaxTab locationId="all" />}

                    {/* Currency & Country Tables */}
                    {(activeTab === 'currency' || activeTab === 'country') && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="relative flex-grow max-w-md">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={`Search ${activeTab}...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9A8] dark:text-white shadow-2xs"
                                    />
                                </div>
                                <button onClick={openAddModal} className="flex items-center justify-center px-4 py-2 bg-[#00A9A8] hover:bg-[#008f8e] text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors">
                                    <Plus className="mr-1.5 h-4 w-4" /> Add New Entry
                                </button>
                            </div>

                            <main className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden">
                                {loading ? (
                                    <div className="flex justify-center items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#00A9A8]" /></div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        {activeTab === 'currency' && (
                                            <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                                                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                                                    <tr>
                                                        <th scope="col" className="px-5 py-3.5 font-bold">#</th>
                                                        <th scope="col" className="px-5 py-3.5 font-bold">Currency Code</th>
                                                        <th scope="col" className="px-5 py-3.5 font-bold">Name</th>
                                                        <th scope="col" className="px-5 py-3.5 font-bold">Symbol</th>
                                                        <th scope="col" className="px-5 py-3.5 font-bold">Exchange Rate (vs AED)</th>
                                                        <th scope="col" className="px-5 py-3.5 font-bold">Base Currency</th>
                                                        <th scope="col" className="px-5 py-3.5 text-right font-bold">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {currencies.map((curr, idx) => (
                                                        <tr key={curr.id || idx} className="hover:bg-teal-50/30 dark:hover:bg-gray-750 transition-colors">
                                                            <td className="px-5 py-4 text-xs text-gray-500">{idx + 1}</td>
                                                            <td className="px-5 py-4 font-bold text-gray-900 dark:text-white font-mono">{curr.currencyCode}</td>
                                                            <td className="px-5 py-4 font-semibold">{curr.currencyName}</td>
                                                            <td className="px-5 py-4 font-bold">{curr.symbol}</td>
                                                            <td className="px-5 py-4 font-mono">{curr.exchangeRate}</td>
                                                            <td className="px-5 py-4">
                                                                {curr.isBase ? (
                                                                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-teal-100 text-teal-800">Base Currency</span>
                                                                ) : (
                                                                    <span className="text-gray-400 text-xs">—</span>
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-4 text-right">
                                                                <button onClick={() => openEditModal(curr)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"><Edit className="h-4 w-4" /></button>
                                                                <button onClick={() => handleDelete(curr.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}

                                        {activeTab === 'country' && (
                                            <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                                                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                                                    <tr>
                                                        <th scope="col" className="px-5 py-3.5 font-bold">#</th>
                                                        <th scope="col" className="px-5 py-3.5 font-bold">Country Code</th>
                                                        <th scope="col" className="px-5 py-3.5 font-bold">Country Name</th>
                                                        <th scope="col" className="px-5 py-3.5 font-bold">Dial Code</th>
                                                        <th scope="col" className="px-5 py-3.5 text-right font-bold">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {countries.map((cntry, idx) => (
                                                        <tr key={cntry.id || idx} className="hover:bg-teal-50/30 dark:hover:bg-gray-750 transition-colors">
                                                            <td className="px-5 py-4 text-xs text-gray-500">{idx + 1}</td>
                                                            <td className="px-5 py-4 font-bold text-gray-900 dark:text-white font-mono">{cntry.countryCode}</td>
                                                            <td className="px-5 py-4 font-semibold">{cntry.countryName}</td>
                                                            <td className="px-5 py-4 font-mono">{cntry.dialCode}</td>
                                                            <td className="px-5 py-4 text-right">
                                                                <button onClick={() => openEditModal(cntry)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"><Edit className="h-4 w-4" /></button>
                                                                <button onClick={() => handleDelete(cntry.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </main>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Currency & Country */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                {editingItem ? 'Edit' : 'Add New'} {activeTab.toUpperCase()}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
                            {activeTab === 'currency' && (
                                <>
                                    <div>
                                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Currency Code *</label>
                                        <input type="text" required value={formData.currencyCode || ''} onChange={e => setFormData({ ...formData, currencyCode: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" placeholder="e.g. AED, USD" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Currency Name *</label>
                                        <input type="text" required value={formData.currencyName || ''} onChange={e => setFormData({ ...formData, currencyName: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" placeholder="e.g. UAE Dirham" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Symbol *</label>
                                        <input type="text" required value={formData.symbol || ''} onChange={e => setFormData({ ...formData, symbol: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" placeholder="e.g. AED, $" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Exchange Rate (vs AED) *</label>
                                        <input type="number" step="0.0001" required value={formData.exchangeRate || 1.0} onChange={e => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
                                    </div>
                                </>
                            )}
                            {activeTab === 'country' && (
                                <>
                                    <div>
                                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Country Code *</label>
                                        <input type="text" required value={formData.countryCode || ''} onChange={e => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" placeholder="e.g. AE" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Country Name *</label>
                                        <input type="text" required value={formData.countryName || ''} onChange={e => setFormData({ ...formData, countryName: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" placeholder="e.g. United Arab Emirates" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Dial Code *</label>
                                        <input type="text" required value={formData.dialCode || ''} onChange={e => setFormData({ ...formData, dialCode: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" placeholder="e.g. +971" />
                                    </div>
                                </>
                            )}
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-lg font-bold text-white bg-[#00A9A8] hover:bg-[#008f8e]">Save Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </CompanyHubLayout>
    );
};

export default MasterDataSettings;
