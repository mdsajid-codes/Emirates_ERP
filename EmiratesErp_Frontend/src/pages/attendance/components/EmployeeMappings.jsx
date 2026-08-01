import React, { useState, useEffect, useRef } from 'react';
import { 
    Link2, Plus, Edit, Trash2, Search, Loader, AlertCircle, 
    Fingerprint, User, Database, ArrowLeft, Save, ShieldCheck, ChevronDown, Check 
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Custom sleek dropdown container component
const CustomDropdown = ({ options, value, onChange, placeholder, icon: Icon, searchPlaceholder = "Search..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(o => String(o.value) === String(value));
    const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground hover:border-primary/50 focus:outline-none focus:border-primary transition-all text-left cursor-pointer shadow-2xs"
            >
                {Icon && <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted pointer-events-none" />}
                <span className={`truncate ${selectedOption ? 'text-foreground font-medium' : 'text-foreground-muted'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-foreground-muted shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl z-50 p-1.5 space-y-1 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    {options.length > 5 && (
                        <div className="px-1 pb-1 border-b border-border/60">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full px-2 py-1 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-primary"
                                autoFocus
                            />
                        </div>
                    )}
                    <div className="space-y-0.5">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => {
                                const isSelected = String(opt.value) === String(value);
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                                            isSelected 
                                                ? 'bg-primary/10 text-primary font-bold' 
                                                : 'text-foreground hover:bg-background-muted'
                                        }`}
                                    >
                                        <span className="truncate">{opt.label}</span>
                                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-3 py-2 text-center text-xs text-foreground-muted">No options found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const EmployeeMappings = () => {
    const [mappings, setMappings] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
    const [editingMapping, setEditingMapping] = useState(null);

    const initialFormState = {
        employeeId: '',
        deviceId: '',
        biometricId: '',
        biometricTemplate: '',
        identifierType: 'FINGERPRINT',
        active: true
    };
    const [formData, setFormData] = useState(initialFormState);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            
            const [mappingsRes, employeesRes, devicesRes] = await Promise.all([
                axios.get(`${API_URL}/employee-biometric-mappings`, { headers }),
                axios.get(`${API_URL}/employees/all`, { headers }),
                axios.get(`${API_URL}/biometric-devices`, { headers })
            ]);
            
            setMappings(mappingsRes.data || []);
            setEmployees(employeesRes.data || []);
            setDevices(devicesRes.data || []);
        } catch (err) {
            setError('Failed to fetch mapping data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setEditingMapping(null);
        setFormData({
            ...initialFormState,
            deviceId: devices.length > 0 ? devices[0].id : ''
        });
        setViewMode('form');
    };

    const handleEdit = (mapping) => {
        setEditingMapping(mapping);
        setFormData({
            employeeId: mapping.employeeId || '',
            deviceId: mapping.deviceId || '',
            biometricId: mapping.biometricId || '',
            biometricTemplate: mapping.biometricTemplate || '',
            identifierType: mapping.identifierType || 'FINGERPRINT',
            active: mapping.active ?? true
        });
        setViewMode('form');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!editingMapping && (!formData.employeeId || !formData.deviceId)) {
            setError('Please select an Employee and a Target Device.');
            return;
        }
        if (!formData.biometricId.trim()) {
            setError('Biometric User ID is required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            
            if (editingMapping) {
                await axios.put(`${API_URL}/employee-biometric-mappings/${editingMapping.id}`, formData, { headers });
            } else {
                await axios.post(`${API_URL}/employee-biometric-mappings`, formData, { headers });
            }
            
            setViewMode('list');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving biometric mapping');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete the mapping for ${name}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/employee-biometric-mappings/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            console.error('Error deleting mapping:', err);
        }
    };

    const filteredMappings = mappings.filter(m => 
        m.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.biometricId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const employeeOptions = employees.map(emp => ({
        value: emp.id,
        label: `${emp.fullName || emp.firstName + ' ' + (emp.lastName || '')} (${emp.employeeCode || emp.id})`
    }));

    const deviceOptions = devices.map(d => ({
        value: d.id,
        label: `${d.name} (${d.deviceIdentifier})`
    }));

    const identifierTypeOptions = [
        { value: 'FINGERPRINT', label: 'Fingerprint' },
        { value: 'FACE', label: 'Face ID' },
        { value: 'CARD', label: 'RFID Card' },
        { value: 'PIN', label: 'Pincode' },
    ];

    return (
        <div className="space-y-4 text-foreground bg-background min-h-full w-full pb-8">
            {viewMode === 'list' ? (
                <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-border/60">
                        <h2 className="text-xs font-bold text-foreground">Employee Biometric Mappings</h2>
                        <button 
                            onClick={handleAdd}
                            className="px-3 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="h-3.5 w-3.5" /> New Mapping
                        </button>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
                            <input 
                                type="text" 
                                placeholder="Search by employee name or biometric ID..." 
                                className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-error/10 border border-error/20 text-error px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 font-medium">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="bg-card rounded-2xl shadow-xs border border-border overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center h-48">
                                <Loader className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-background-muted/70 border-b border-border text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                                        <tr>
                                            <th className="px-4 py-2.5">Employee</th>
                                            <th className="px-4 py-2.5">Biometric ID (Device SN)</th>
                                            <th className="px-4 py-2.5">Template Status</th>
                                            <th className="px-4 py-2.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {filteredMappings.length > 0 ? (
                                            filteredMappings.map(m => (
                                                <tr key={m.id} className="hover:bg-background-muted/50 transition-colors">
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[11px] shrink-0 border border-primary/20">
                                                                {m.employeeName?.charAt(0) || 'E'}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-foreground">{m.employeeName}</div>
                                                                <div className="text-[10px] text-foreground-muted font-mono">ID: {m.employeeId}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-mono text-xs font-bold text-primary">
                                                                {m.biometricId}
                                                            </span>
                                                            <span className="text-[10px] text-foreground-muted flex items-center gap-1">
                                                                <Database className="h-3 w-3" />
                                                                {m.deviceName || 'Universal Device'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${m.biometricTemplate ? 'bg-primary/10 text-primary border-primary/20' : 'bg-background-muted text-foreground-muted border-border'}`}>
                                                            <Database className="h-3 w-3" />
                                                            {m.biometricTemplate ? 'Stored (Ready to Sync)' : 'No Template'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right">
                                                        <div className="flex justify-end items-center gap-1">
                                                            <button 
                                                                onClick={() => handleEdit(m)}
                                                                className="p-1 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-lg transition-colors cursor-pointer"
                                                                title="Edit Mapping"
                                                            >
                                                                <Edit className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(m.id, m.employeeName)}
                                                                className="p-1 text-foreground-muted hover:text-red-600 hover:bg-background-muted rounded-lg transition-colors cursor-pointer"
                                                                title="Delete Mapping"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-10 text-foreground-muted">
                                                    <Link2 className="mx-auto h-8 w-8 text-foreground-muted/40 mb-2" />
                                                    <h3 className="text-xs font-bold text-foreground">No mappings found</h3>
                                                    <p className="mt-1 text-[11px] text-foreground-muted max-w-xs mx-auto">Start linking your employees to biometric IDs.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* In-Page Form View */
                <form onSubmit={handleSave} className="w-full space-y-4">
                    {/* Header bar with Back button */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                        <div className="flex items-center gap-2.5">
                            <button 
                                type="button"
                                onClick={() => setViewMode('list')} 
                                className="p-1.5 hover:bg-background-muted rounded-lg border border-border flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Back to Mappings</span>
                            </button>
                            <h2 className="text-xs font-bold text-foreground">
                                {editingMapping ? 'Edit Biometric Mapping' : 'Create Biometric Mapping'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                type="button" 
                                onClick={() => setViewMode('list')} 
                                className="px-3 py-1 text-xs font-semibold text-foreground-muted hover:bg-background-muted border border-border rounded-lg transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="px-3.5 py-1 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                            >
                                {saving ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                                {saving ? 'Saving...' : editingMapping ? 'Update Mapping' : 'Link Employee'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-error/10 border border-error/20 text-error px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 font-medium">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Mapping Details Card */}
                    <div className="bg-card p-3.5 rounded-xl shadow-xs border border-border space-y-3">
                        <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5">Biometric Linkage Settings</h3>
                        
                        {!editingMapping && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Select HRMS Employee</label>
                                    <CustomDropdown
                                        options={employeeOptions}
                                        value={formData.employeeId}
                                        onChange={(val) => setFormData(p => ({ ...p, employeeId: val }))}
                                        placeholder="Choose Employee..."
                                        icon={User}
                                        searchPlaceholder="Filter employee by name..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Target Biometric Device</label>
                                    <CustomDropdown
                                        options={deviceOptions}
                                        value={formData.deviceId}
                                        onChange={(val) => setFormData(p => ({ ...p, deviceId: val }))}
                                        placeholder="Select Device..."
                                        icon={Database}
                                        searchPlaceholder="Filter device by serial..."
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Biometric Hardware User ID</label>
                                <div className="relative flex items-center">
                                    <Fingerprint className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted pointer-events-none z-10" />
                                    <input 
                                        className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all font-mono"
                                        placeholder="e.g. 101 or SN-883"
                                        value={formData.biometricId}
                                        onChange={(e) => setFormData({...formData, biometricId: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Identifier Type</label>
                                <CustomDropdown
                                    options={identifierTypeOptions}
                                    value={formData.identifierType}
                                    onChange={(val) => setFormData(p => ({ ...p, identifierType: val }))}
                                    placeholder="Select Type..."
                                    icon={Fingerprint}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Raw Biometric Template (Optional Base64)</label>
                            <textarea 
                                className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all font-mono h-24"
                                placeholder="Paste Base64 biometric fingerprint/face template payload here..."
                                value={formData.biometricTemplate}
                                onChange={(e) => setFormData({...formData, biometricTemplate: e.target.value})}
                            />
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default EmployeeMappings;
