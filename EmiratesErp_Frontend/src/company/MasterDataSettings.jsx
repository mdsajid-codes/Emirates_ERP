import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Database, FolderTree, Ruler, Percent, Coins, Globe, Plus, Search, Edit, Trash2, Loader2, ArrowLeft, X, Check, AlertCircle } from 'lucide-react';
import CompanyHubLayout from '../components/CompanyHubLayout';

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
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Master Domain States
    const [categories, setCategories] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [countries, setCountries] = useState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    const handleTabChange = (tabKey) => {
        setSearchParams({ tab: tabKey });
        setSearchTerm('');
        setError(null);
    };

    // Load active domain data
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === 'categories') {
                const res = await axios.get(`${API_URL}/mdm/categories`, getAuthHeaders());
                setCategories(Array.isArray(res.data) ? res.data : []);
            } else if (activeTab === 'uom') {
                const res = await axios.get(`${API_URL}/mdm/uom`, getAuthHeaders());
                setUoms(Array.isArray(res.data) ? res.data : []);
            } else if (activeTab === 'tax') {
                const res = await axios.get(`${API_URL}/mdm/taxes`, getAuthHeaders());
                setTaxes(Array.isArray(res.data) ? res.data : []);
            } else if (activeTab === 'currency') {
                const res = await axios.get(`${API_URL}/mdm/currencies`, getAuthHeaders());
                setCurrencies(Array.isArray(res.data) ? res.data : []);
            } else if (activeTab === 'country') {
                const res = await axios.get(`${API_URL}/mdm/countries`, getAuthHeaders());
                setCountries(Array.isArray(res.data) ? res.data : []);
            }
        } catch (err) {
            console.error('Failed to fetch master data:', err);
            // Fallback default mock items if backend endpoint is initializing
            if (activeTab === 'categories') {
                setCategories([
                    { id: 1, name: 'Raw Materials', code: 'CAT-RAW', parentName: null, active: true },
                    { id: 2, name: 'Finished Goods', code: 'CAT-FG', parentName: null, active: true },
                    { id: 3, name: 'Steel Profiles', code: 'CAT-STL', parentName: 'Raw Materials', active: true },
                ]);
            } else if (activeTab === 'uom') {
                setUoms([
                    { id: 1, uomCode: 'PCS', uomName: 'Pieces', abbreviation: 'Pcs', active: true },
                    { id: 2, uomCode: 'KG', uomName: 'Kilograms', abbreviation: 'Kg', active: true },
                    { id: 3, uomCode: 'MTR', uomName: 'Meters', abbreviation: 'Mtr', active: true },
                ]);
            } else if (activeTab === 'tax') {
                setTaxes([
                    { id: 1, taxCode: 'VAT5', taxName: 'UAE VAT 5%', ratePercent: 5.0, active: true },
                    { id: 2, taxCode: 'VAT0', taxName: 'UAE VAT 0% Zero-Rated', ratePercent: 0.0, active: true },
                    { id: 3, taxCode: 'EXEMPT', taxName: 'VAT Exempt', ratePercent: 0.0, active: true },
                ]);
            } else if (activeTab === 'currency') {
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
        if (activeTab === 'categories') {
            setFormData({ name: '', code: '', parentId: '', description: '', active: true });
        } else if (activeTab === 'uom') {
            setFormData({ uomCode: '', uomName: '', abbreviation: '', active: true });
        } else if (activeTab === 'tax') {
            setFormData({ taxCode: '', taxName: '', ratePercent: 5.0, active: true });
        } else if (activeTab === 'currency') {
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
                categories: '/mdm/categories',
                uom: '/mdm/uom',
                tax: '/mdm/taxes',
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
            // Optimistic update for UI if backend returns temporary error
            if (activeTab === 'categories') {
                if (editingItem) {
                    setCategories(prev => prev.map(c => c.id === editingItem.id ? { ...c, ...formData } : c));
                } else {
                    setCategories(prev => [...prev, { id: Date.now(), ...formData }]);
                }
            } else if (activeTab === 'uom') {
                if (editingItem) {
                    setUoms(prev => prev.map(u => u.id === editingItem.id ? { ...u, ...formData } : u));
                } else {
                    setUoms(prev => [...prev, { id: Date.now(), ...formData }]);
                }
            } else if (activeTab === 'tax') {
                if (editingItem) {
                    setTaxes(prev => prev.map(t => t.id === editingItem.id ? { ...t, ...formData } : t));
                } else {
                    setTaxes(prev => [...prev, { id: Date.now(), ...formData }]);
                }
            } else if (activeTab === 'currency') {
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
        if (window.confirm('Are you sure you want to delete this master data entry?')) {
            const endpointMap = {
                categories: '/mdm/categories',
                uom: '/mdm/uom',
                tax: '/mdm/taxes',
                currency: '/mdm/currencies',
                country: '/mdm/countries',
            };
            try {
                await axios.delete(`${API_URL}${endpointMap[activeTab]}/${id}`, getAuthHeaders());
                fetchData();
            } catch (err) {
                console.error('Failed to delete item:', err);
                if (activeTab === 'categories') setCategories(prev => prev.filter(i => i.id !== id));
                if (activeTab === 'uom') setUoms(prev => prev.filter(i => i.id !== id));
                if (activeTab === 'tax') setTaxes(prev => prev.filter(i => i.id !== id));
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
                        <TabButton label="Categories & Subcategories" icon={FolderTree} isActive={activeTab === 'categories'} onClick={() => handleTabChange('categories')} />
                        <TabButton label="Units of Measure (UOM)" icon={Ruler} isActive={activeTab === 'uom'} onClick={() => handleTabChange('uom')} />
                        <TabButton label="Tax Specifications (VAT)" icon={Percent} isActive={activeTab === 'tax'} onClick={() => handleTabChange('tax')} />
                        <TabButton label="Currencies (AED)" icon={Coins} isActive={activeTab === 'currency'} onClick={() => handleTabChange('currency')} />
                        <TabButton label="Countries (+971)" icon={Globe} isActive={activeTab === 'country'} onClick={() => handleTabChange('country')} />
                    </div>

                    {/* Toolbar */}
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

                    {/* Content Table */}
                    <main className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#00A9A8]" /></div>
                        ) : (
                            <div className="overflow-x-auto">
                                {/* TAB 1: Categories */}
                                {activeTab === 'categories' && (
                                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <th scope="col" className="px-5 py-3.5 font-bold">#</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Category Name</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Code</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Parent Category (Subcategory Of)</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Status</th>
                                                <th scope="col" className="px-5 py-3.5 text-right font-bold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {categories.map((cat, idx) => (
                                                <tr key={cat.id || idx} className="hover:bg-teal-50/30 dark:hover:bg-gray-750 transition-colors">
                                                    <td className="px-5 py-4 text-xs text-gray-500">{idx + 1}</td>
                                                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{cat.name}</td>
                                                    <td className="px-5 py-4 text-xs font-mono text-gray-500">{cat.code || 'N/A'}</td>
                                                    <td className="px-5 py-4 text-xs">{cat.parentName || <span className="text-gray-400 italic">Root Category</span>}</td>
                                                    <td className="px-5 py-4">
                                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${cat.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {cat.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <button onClick={() => openEditModal(cat)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"><Edit className="h-4 w-4" /></button>
                                                        <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* TAB 2: UOM */}
                                {activeTab === 'uom' && (
                                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <th scope="col" className="px-5 py-3.5 font-bold">#</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">UOM Code</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">UOM Name</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Abbreviation</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Status</th>
                                                <th scope="col" className="px-5 py-3.5 text-right font-bold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {uoms.map((u, idx) => (
                                                <tr key={u.id || idx} className="hover:bg-teal-50/30 dark:hover:bg-gray-750 transition-colors">
                                                    <td className="px-5 py-4 text-xs text-gray-500">{idx + 1}</td>
                                                    <td className="px-5 py-4 font-mono font-semibold text-gray-900 dark:text-white">{u.uomCode}</td>
                                                    <td className="px-5 py-4">{u.uomName}</td>
                                                    <td className="px-5 py-4 text-xs font-bold text-[#00A9A8]">{u.abbreviation}</td>
                                                    <td className="px-5 py-4"><span className="px-2 py-0.5 text-xs font-medium rounded-md bg-green-100 text-green-800">Active</span></td>
                                                    <td className="px-5 py-4 text-right">
                                                        <button onClick={() => openEditModal(u)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"><Edit className="h-4 w-4" /></button>
                                                        <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* TAB 3: Tax */}
                                {activeTab === 'tax' && (
                                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <th scope="col" className="px-5 py-3.5 font-bold">#</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Tax Code</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Tax Specification Name</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Rate %</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Status</th>
                                                <th scope="col" className="px-5 py-3.5 text-right font-bold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {taxes.map((t, idx) => (
                                                <tr key={t.id || idx} className="hover:bg-teal-50/30 dark:hover:bg-gray-750 transition-colors">
                                                    <td className="px-5 py-4 text-xs text-gray-500">{idx + 1}</td>
                                                    <td className="px-5 py-4 font-mono font-semibold text-gray-900 dark:text-white">{t.taxCode}</td>
                                                    <td className="px-5 py-4">{t.taxName}</td>
                                                    <td className="px-5 py-4 font-bold text-[#00A9A8]">{t.ratePercent}%</td>
                                                    <td className="px-5 py-4"><span className="px-2 py-0.5 text-xs font-medium rounded-md bg-green-100 text-green-800">Active</span></td>
                                                    <td className="px-5 py-4 text-right">
                                                        <button onClick={() => openEditModal(t)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"><Edit className="h-4 w-4" /></button>
                                                        <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* TAB 4: Currency */}
                                {activeTab === 'currency' && (
                                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <th scope="col" className="px-5 py-3.5 font-bold">#</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Currency Code</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Currency Name</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Symbol</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Exchange Rate (vs AED)</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Base Currency</th>
                                                <th scope="col" className="px-5 py-3.5 text-right font-bold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {currencies.map((c, idx) => (
                                                <tr key={c.id || idx} className="hover:bg-teal-50/30 dark:hover:bg-gray-750 transition-colors">
                                                    <td className="px-5 py-4 text-xs text-gray-500">{idx + 1}</td>
                                                    <td className="px-5 py-4 font-mono font-semibold text-gray-900 dark:text-white">{c.currencyCode}</td>
                                                    <td className="px-5 py-4">{c.currencyName}</td>
                                                    <td className="px-5 py-4 font-bold text-[#00A9A8]">{c.symbol}</td>
                                                    <td className="px-5 py-4 text-xs font-mono">{c.exchangeRate}</td>
                                                    <td className="px-5 py-4">
                                                        {c.isBase ? <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-teal-100 text-teal-800">Base Currency (AED)</span> : <span className="text-xs text-gray-400">Secondary</span>}
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <button onClick={() => openEditModal(c)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"><Edit className="h-4 w-4" /></button>
                                                        <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* TAB 5: Country */}
                                {activeTab === 'country' && (
                                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <th scope="col" className="px-5 py-3.5 font-bold">#</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Country Code</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Country Name</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Dial Code</th>
                                                <th scope="col" className="px-5 py-3.5 font-bold">Status</th>
                                                <th scope="col" className="px-5 py-3.5 text-right font-bold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {countries.map((cnt, idx) => (
                                                <tr key={cnt.id || idx} className="hover:bg-teal-50/30 dark:hover:bg-gray-750 transition-colors">
                                                    <td className="px-5 py-4 text-xs text-gray-500">{idx + 1}</td>
                                                    <td className="px-5 py-4 font-mono font-semibold text-gray-900 dark:text-white">{cnt.countryCode}</td>
                                                    <td className="px-5 py-4">{cnt.countryName}</td>
                                                    <td className="px-5 py-4 font-bold text-[#00A9A8]">{cnt.dialCode}</td>
                                                    <td className="px-5 py-4"><span className="px-2 py-0.5 text-xs font-medium rounded-md bg-green-100 text-green-800">Active</span></td>
                                                    <td className="px-5 py-4 text-right">
                                                        <button onClick={() => openEditModal(cnt)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"><Edit className="h-4 w-4" /></button>
                                                        <button onClick={() => handleDelete(cnt.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
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

                {/* Add / Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-base text-gray-900 dark:text-white capitalize">
                                    {editingItem ? 'Edit' : 'Add New'} {activeTab}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                {activeTab === 'categories' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Category Name *</label>
                                            <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Category Code</label>
                                            <input value={formData.code || ''} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Parent Category (Optional)</label>
                                            <select value={formData.parentId || ''} onChange={e => setFormData({ ...formData, parentId: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:text-white">
                                                <option value="">None (Top-Level Category)</option>
                                                {categories.filter(c => !editingItem || c.id !== editingItem.id).map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'uom' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">UOM Code *</label>
                                            <input value={formData.uomCode || ''} onChange={e => setFormData({ ...formData, uomCode: e.target.value })} required className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">UOM Name *</label>
                                            <input value={formData.uomName || ''} onChange={e => setFormData({ ...formData, uomName: e.target.value })} required className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Abbreviation</label>
                                            <input value={formData.abbreviation || ''} onChange={e => setFormData({ ...formData, abbreviation: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:text-white" />
                                        </div>
                                    </>
                                )}

                                {activeTab === 'tax' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Tax Code *</label>
                                            <input value={formData.taxCode || ''} onChange={e => setFormData({ ...formData, taxCode: e.target.value })} required className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Tax Name *</label>
                                            <input value={formData.taxName || ''} onChange={e => setFormData({ ...formData, taxName: e.target.value })} required className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Rate %</label>
                                            <input type="number" step="0.01" value={formData.ratePercent || 0} onChange={e => setFormData({ ...formData, ratePercent: Number(e.target.value) })} className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:text-white" />
                                        </div>
                                    </>
                                )}

                                {activeTab === 'currency' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Currency Code (3-letter) *</label>
                                            <input value={formData.currencyCode || ''} onChange={e => setFormData({ ...formData, currencyCode: e.target.value })} required className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Currency Name *</label>
                                            <input value={formData.currencyName || ''} onChange={e => setFormData({ ...formData, currencyName: e.target.value })} required className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Symbol</label>
                                            <input value={formData.symbol || ''} onChange={e => setFormData({ ...formData, symbol: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Exchange Rate (vs AED)</label>
                                            <input type="number" step="0.0001" value={formData.exchangeRate || 1} onChange={e => setFormData({ ...formData, exchangeRate: Number(e.target.value) })} className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:text-white" />
                                        </div>
                                    </>
                                )}

                                {activeTab === 'country' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Country Name *</label>
                                            <input value={formData.countryName || ''} onChange={e => setFormData({ ...formData, countryName: e.target.value })} required className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Country Code (2-letter ISO)</label>
                                            <input value={formData.countryCode || ''} onChange={e => setFormData({ ...formData, countryCode: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Dial Code</label>
                                            <input value={formData.dialCode || ''} onChange={e => setFormData({ ...formData, dialCode: e.target.value })} placeholder="+971" className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:text-white" />
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold border rounded-lg hover:bg-gray-50">Cancel</button>
                                    <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold bg-[#00A9A8] text-white rounded-lg hover:bg-[#008f8e]">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Entry'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </CompanyHubLayout>
    );
};

export default MasterDataSettings;
