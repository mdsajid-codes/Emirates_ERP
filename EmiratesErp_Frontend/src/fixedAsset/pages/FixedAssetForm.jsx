import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    X, 
    Save, 
    Package, 
    Hash, 
    MapPin, 
    Calendar, 
    DollarSign, 
    Activity, 
    Folder, 
    Layers, 
    Type, 
    CheckCircle2,
    ArrowLeft,
    Plus,
    Search,
    FileText,
    History,
    FileCode,
    Locate,
    Calculator,
    Users,
    Settings
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const FixedAssetForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        assetNumber: '',
        description: '',
        serialNumber: '',
        categoryId: '',
        classId: '',
        groupId: '',
        assetType: 'Property, Plant and Equipment',
        hiredResource: false,
        hiredCompany: '',
        useScheduling: false,
        location: '',
        purchaseDate: '',
        purchasePrice: '',
        salvageValue: '',
        usefulLifeYears: '',
        depreciationMethod: 'STRAIGHT_LINE',
        assetStatus: 'NEW'
    });

    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [fixedAssetProducts, setFixedAssetProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('main');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        fetchLookups();
        if (isEdit) {
            fetchAsset();
        }
    }, [id]);

    const fetchLookups = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const [catRes, classRes, groupRes, prodRes, suppRes] = await Promise.all([
                axios.get(`${API_URL}/fixed-assets/categories`, { headers }),
                axios.get(`${API_URL}/fixed-assets/classes`, { headers }),
                axios.get(`${API_URL}/fixed-assets/groups`, { headers }),
                axios.get(`${API_URL}/production/finished-goods?type=FIXED_ASSET`, { headers }),
                axios.get(`${API_URL}/parties?type=SUPPLIER&page=0&size=500`, { headers })
            ]);
            setCategories(catRes.data || []);
            setClasses(classRes.data || []);
            setGroups(groupRes.data || []);
            setFixedAssetProducts(prodRes.data || []);
            setSuppliers(suppRes.data.content || suppRes.data || []);
        } catch (err) {
            console.error("Failed to fetch lookups", err);
        }
    };

    const fetchAsset = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/fixed-assets/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data;
            setFormData({
                assetNumber: data.assetNumber || '',
                description: data.description || '',
                serialNumber: data.serialNumber || '',
                categoryId: data.categoryId || '',
                classId: data.classId || '',
                groupId: data.groupId || '',
                assetType: data.assetType || 'Property, Plant and Equipment',
                hiredResource: data.hiredResource || false,
                hiredCompany: data.hiredCompany || '',
                useScheduling: data.useScheduling || false,
                location: data.location || '',
                purchaseDate: data.purchaseDate || '',
                purchasePrice: data.purchasePrice || '',
                salvageValue: data.salvageValue || '',
                usefulLifeYears: data.usefulLifeYears || '',
                depreciationMethod: data.depreciationMethod || 'STRAIGHT_LINE',
                assetStatus: data.assetStatus || 'NEW'
            });
        } catch (err) {
            console.error("Failed to fetch asset", err);
            toast.error("Failed to load asset details");
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = async (e, close = true) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            
            if (isEdit) {
                await axios.put(`${API_URL}/fixed-assets/${id}`, formData, { headers });
                toast.success("Asset updated successfully");
            } else {
                await axios.post(`${API_URL}/fixed-assets`, formData, { headers });
                toast.success("Asset registered successfully");
            }
            if (close) navigate('/fixed-asset-dashboard/assets');
        } catch (err) {
            console.error("Error saving asset:", err);
            toast.error(err.response?.data?.message || "Failed to save asset. Check if Asset Number is unique.");
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'main', name: 'Main', icon: Package },
        { id: 'documents', name: 'Documents of Fixed Asset', icon: FileText },
        { id: 'locations', name: 'Fixed Asset Locations', icon: MapPin },
        { id: 'history', name: 'Fixed Asset History', icon: History },
        { id: 'codes', name: 'Additional Codes', icon: FileCode },
        { id: 'notes', name: 'Notes', icon: FileText },
    ];

    return (
        <div className="flex flex-col h-full bg-background animate-in fade-in duration-500">
            {/* Header / Toolbar (Premium Look) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-card border-b border-border shadow-sm sticky top-0 z-20 gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/fixed-asset-dashboard/assets')}
                        className="p-2 hover:bg-background-muted rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            {isEdit ? 'Edit Fixed Asset' : 'Fixed Assets (create)'}
                            <span className="text-xs font-normal px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded border border-blue-500/20 uppercase tracking-wider">Draft</span>
                        </h1>
                        <p className="text-xs text-foreground-muted">Register and categorize company assets for tracking and depreciation.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button 
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={loading}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-[#f4b400] hover:bg-[#e5a900] text-black font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Save size={18} />
                        Save and close
                    </button>
                    <button 
                        onClick={(e) => handleSubmit(e, false)}
                        disabled={loading}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-card hover:bg-background-muted text-foreground border border-border rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Save size={18} />
                        Save
                    </button>
                    <button 
                        type="button" 
                        className="px-4 py-2.5 bg-card hover:bg-background-muted text-foreground border border-border rounded-lg shadow-sm transition-all hidden lg:flex items-center gap-2"
                    >
                        <Layers size={18} />
                        Edit GL Accounts
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-card border-b border-border overflow-x-auto no-scrollbar">
                <div className="flex px-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                                activeTab === tab.id 
                                ? 'border-primary text-primary bg-primary/5' 
                                : 'border-transparent text-foreground-muted hover:text-foreground hover:bg-background-muted'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {activeTab === 'main' ? (
                    <div className="max-w-5xl mx-auto space-y-8">
                        <form className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            
                            {/* Left Column - Classification */}
                            <div className="md:col-span-7 space-y-6">
                                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                                        <Folder size={16} />
                                        Classification
                                    </h3>
                                    
                                    <div className="grid grid-cols-[120px_1fr_auto] items-center gap-4 group">
                                        <label className="text-sm font-medium text-foreground-muted">Folder:</label>
                                        <select
                                            name="groupId"
                                            value={formData.groupId}
                                            onChange={handleChange}
                                            className="input w-full bg-background"
                                        >
                                            <option value="">(None)</option>
                                            {groups.map(g => (
                                                <option key={g.groupId} value={g.groupId}>{g.name}</option>
                                            ))}
                                        </select>
                                        <button type="button" className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                                            <Plus size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                        <label className="text-sm font-medium text-foreground-muted">Type:</label>
                                        <select
                                            name="assetType"
                                            value={formData.assetType}
                                            onChange={handleChange}
                                            className="input w-full bg-background"
                                        >
                                            <option value="Property, Plant and Equipment">Property, Plant and Equipment</option>
                                            <option value="Intangible Asset">Intangible Asset</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-[120px_1fr_auto] items-center gap-4">
                                        <label className="text-sm font-medium text-foreground-muted">Class:</label>
                                        <select
                                            name="classId"
                                            value={formData.classId}
                                            onChange={handleChange}
                                            className="input w-full bg-background"
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(c => (
                                                <option key={c.classId} value={c.classId}>{c.name}</option>
                                            ))}
                                        </select>
                                        <button type="button" className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                                            <Plus size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-[120px_1fr_auto] items-center gap-4">
                                        <label className="text-sm font-medium text-foreground-muted">Category:</label>
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            className="input w-full bg-background"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <button type="button" className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                                        <FileText size={16} />
                                        Basic Information
                                    </h3>

                                    <div className="grid grid-cols-[120px_1fr] items-center gap-4 relative">
                                        <label className="text-sm font-medium text-foreground-muted">Description:</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                onFocus={() => setShowSuggestions(true)}
                                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                required
                                                className="input w-full bg-background"
                                                placeholder="Asset description (e.g. Delivery Van)"
                                            />
                                            {showSuggestions && fixedAssetProducts.length > 0 && (
                                                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                                                    {fixedAssetProducts
                                                        .filter(p => p.name.toLowerCase().includes(formData.description.toLowerCase()))
                                                        .map(product => (
                                                        <button
                                                            key={product.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, description: product.name }));
                                                                setShowSuggestions(false);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 hover:bg-primary/5 hover:text-primary transition-colors border-b border-border last:border-0 flex items-center gap-3"
                                                        >
                                                            <Package size={16} className="text-foreground-muted" />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">{product.name}</span>
                                                                <span className="text-[10px] text-foreground-muted uppercase tracking-wider">{product.itemCode}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                    {fixedAssetProducts.filter(p => p.name.toLowerCase().includes(formData.description.toLowerCase())).length === 0 && (
                                                        <div className="p-4 text-center text-sm text-foreground-muted">
                                                            No matching products found
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                        <label className="text-sm font-medium text-foreground-muted">Asset ID:</label>
                                        <input
                                            type="text"
                                            name="assetNumber"
                                            value={formData.assetNumber}
                                            onChange={handleChange}
                                            required
                                            className="input w-full bg-background font-mono text-primary font-bold"
                                            placeholder="AST-XXXX"
                                        />
                                    </div>

                                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                        <label className="text-sm font-medium text-foreground-muted">Serial No:</label>
                                        <input
                                            type="text"
                                            name="serialNumber"
                                            value={formData.serialNumber}
                                            onChange={handleChange}
                                            className="input w-full bg-background"
                                            placeholder="Manufacturer Serial Number"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Status & Settings */}
                            <div className="md:col-span-5 space-y-6">
                                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
                                    <div className="flex items-center justify-between border-b border-border pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                                                <Activity size={20} />
                                            </div>
                                            <span className="font-bold">Current Status</span>
                                        </div>
                                        <select
                                            name="assetStatus"
                                            value={formData.assetStatus}
                                            onChange={handleChange}
                                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer outline-none border transition-all ${
                                                formData.assetStatus === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                formData.assetStatus === 'NEW' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                formData.assetStatus === 'CONSTRUCTION_IN_PROGRESS' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                formData.assetStatus === 'DISPOSED' || formData.assetStatus === 'WRITTEN_OFF' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                'bg-foreground-muted/10 text-foreground-muted border-border'
                                            }`}
                                        >
                                            <option value="NEW" className="bg-card text-foreground">New</option>
                                            <option value="ACTIVE" className="bg-card text-foreground">Active</option>
                                            <option value="CONSTRUCTION_IN_PROGRESS" className="bg-card text-foreground">In Progress</option>
                                            <option value="CONSTRUCTION_COMPLETED" className="bg-card text-foreground">Completed</option>
                                            <option value="FULLY_DEPRECIATED" className="bg-card text-foreground">Depreciated</option>
                                            <option value="IN_CONSERVATION" className="bg-card text-foreground">In Conservation</option>
                                            <option value="HELD_FOR_SALE" className="bg-card text-foreground">Held For Sale</option>
                                            <option value="DISPOSED" className="bg-card text-foreground">Disposed</option>
                                            <option value="WRITTEN_OFF" className="bg-card text-foreground">Written Off</option>
                                        </select>
                                    </div>
                                    <button type="button" className="w-full py-2 text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors hover:bg-blue-500/5 rounded-lg border border-dashed border-blue-500/30">
                                        Change Status History
                                    </button>
                                </div>

                                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                                        <Settings size={16} />
                                        Operational Flags
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <label className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-background-muted transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg transition-colors ${formData.hiredResource ? 'bg-blue-500/10 text-blue-500' : 'bg-foreground-muted/10 text-foreground-muted'}`}>
                                                    <Users size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">Hired Resource</p>
                                                    <p className="text-xs text-foreground-muted">Mark if this is a rented asset</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="hiredResource"
                                                checked={formData.hiredResource}
                                                onChange={handleChange}
                                                className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary"
                                            />
                                        </label>

                                        {formData.hiredResource && (
                                            <div className="p-4 bg-background-muted rounded-xl border border-border animate-in slide-in-from-top-2 duration-300">
                                                <label className="text-xs font-bold text-foreground-muted uppercase mb-2 block tracking-wider">Hired Company / Provider</label>
                                                <div className="flex gap-2">
                                                    <select
                                                        name="hiredCompany"
                                                        value={formData.hiredCompany}
                                                        onChange={handleChange}
                                                        className="input w-full bg-card"
                                                    >
                                                        <option value="">Select Company</option>
                                                        {suppliers.map(s => (
                                                            <option key={s.id} value={s.companyName || s.name}>{s.companyName || s.name}</option>
                                                        ))}
                                                    </select>
                                                    <button type="button" className="p-2 bg-card border border-border text-foreground-muted rounded-lg hover:text-primary transition-colors">
                                                        <Search size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <label className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-background-muted transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg transition-colors ${formData.useScheduling ? 'bg-orange-500/10 text-orange-500' : 'bg-foreground-muted/10 text-foreground-muted'}`}>
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">Use Scheduling</p>
                                                    <p className="text-xs text-foreground-muted">Enable resource allocation calendar</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="useScheduling"
                                                checked={formData.useScheduling}
                                                onChange={handleChange}
                                                className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                                        <Calculator size={16} />
                                        Financial Info
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs text-foreground-muted font-bold uppercase">Purchase Date</label>
                                            <input
                                                type="date"
                                                name="purchaseDate"
                                                value={formData.purchaseDate}
                                                onChange={handleChange}
                                                className="input w-full bg-background"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-foreground-muted font-bold uppercase">Price</label>
                                            <div className="relative">
                                                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
                                                <input
                                                    type="number"
                                                    name="purchasePrice"
                                                    value={formData.purchasePrice}
                                                    onChange={handleChange}
                                                    className="input w-full pl-9 bg-background"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-foreground-muted">
                        <tab.icon size={48} className="mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">Under Construction</h3>
                        <p className="text-sm">The "{tabs.find(t => t.id === activeTab)?.name}" module will be available in a future update.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FixedAssetForm;
