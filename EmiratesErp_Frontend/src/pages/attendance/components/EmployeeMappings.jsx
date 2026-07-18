import React, { useState, useEffect } from 'react';
import { Link2, Plus, Edit, Trash2, Search, Loader, AlertCircle, Fingerprint, User, Database, X } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const EmployeeMappings = () => {
    const [mappings, setMappings] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMapping, setEditingMapping] = useState(null);

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
            
            setMappings(mappingsRes.data);
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

    const handleSave = async (formData) => {
        setModalLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            
            if (editingMapping) {
                await axios.put(`${API_URL}/employee-biometric-mappings/${editingMapping.id}`, formData, { headers });
            } else {
                await axios.post(`${API_URL}/employee-biometric-mappings`, formData, { headers });
            }
            
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving mapping');
        } finally {
            setModalLoading(false);
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
            alert('Error deleting mapping');
        }
    };

    const filteredMappings = mappings.filter(m => 
        m.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.biometricId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Employee Biometric Mappings</h2>
                    <p className="text-sm text-foreground-muted">Link HRMS employees to their hardware biometric IDs.</p>
                </div>
                <button 
                    onClick={() => { setEditingMapping(null); setIsModalOpen(true); }}
                    className="btn-primary rounded-theme flex items-center shadow-lg shadow-primary/20"
                >
                    <Plus className="h-5 w-5 mr-2" /> New Mapping
                </button>
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                <input 
                    type="text" 
                    placeholder="Search by employee name or biometric ID..." 
                    className="input pl-10 bg-card border-border rounded-xl w-full max-w-md shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {error && (
                <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-80">
                        <Loader className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-background-muted">
                                <tr>
                                    <th className="th-cell text-xs uppercase tracking-wider">Employee</th>
                                    <th className="th-cell text-xs uppercase tracking-wider">Biometric ID (Device SN)</th>
                                    <th className="th-cell text-xs uppercase tracking-wider">Template Status</th>
                                    <th className="th-cell text-xs uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredMappings.length > 0 ? (
                                    filteredMappings.map(m => (
                                        <tr key={m.id} className="hover:bg-background-muted/50 transition-colors">
                                            <td className="td-cell">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {m.employeeName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground">{m.employeeName}</div>
                                                        <div className="text-[10px] text-foreground-muted">ID: {m.employeeId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="td-cell">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-mono text-sm bg-primary/5 text-primary px-2 py-0.5 rounded border border-primary/10 w-fit">
                                                        {m.biometricId}
                                                    </span>
                                                    <span className="text-[10px] text-foreground-muted flex items-center gap-1">
                                                        <Database className="h-3 w-3" />
                                                        {m.deviceName || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="td-cell">
                                                <div className="flex items-center gap-1.5">
                                                    <Database className={`h-3.5 w-3.5 ${m.biometricTemplate ? 'text-success' : 'text-foreground-muted'}`} />
                                                    <span className={`text-xs font-medium ${m.biometricTemplate ? 'text-success' : 'text-foreground-muted'}`}>
                                                        {m.biometricTemplate ? 'Stored (Ready to Sync)' : 'No Template'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="td-cell text-right">
                                                <div className="flex justify-end items-center gap-1">
                                                    <button 
                                                        onClick={() => { setEditingMapping(m); setIsModalOpen(true); }}
                                                        className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(m.id, m.employeeName)}
                                                        className="p-2 text-foreground-muted hover:text-error hover:bg-error/10 rounded-full transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-20 text-foreground-muted">
                                            <Link2 className="mx-auto h-12 w-12 opacity-20 mb-4" />
                                            <p className="text-lg font-bold text-foreground">No mappings found</p>
                                            <p className="text-sm mt-1">Start linking your employees to biometric IDs.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <MappingModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                employees={employees}
                devices={devices}
                mapping={editingMapping}
                loading={modalLoading}
            />
        </div>
    );
};

const MappingModal = ({ isOpen, onClose, onSave, employees, devices, mapping, loading }) => {
    const [formData, setFormData] = useState({
        employeeId: '',
        deviceId: '',
        biometricId: '',
        biometricTemplate: '',
        identifierType: 'FINGERPRINT',
        active: true
    });

    useEffect(() => {
        if (mapping) {
            setFormData({
                employeeId: mapping.employeeId || '',
                deviceId: mapping.deviceId || '',
                biometricId: mapping.biometricId || '',
                biometricTemplate: mapping.biometricTemplate || '',
                identifierType: mapping.identifierType || 'FINGERPRINT',
                active: mapping.active ?? true
            });
        } else {
            setFormData({ 
                employeeId: '', 
                deviceId: devices.length > 0 ? devices[0].id : '', 
                biometricId: '', 
                biometricTemplate: '',
                identifierType: 'FINGERPRINT',
                active: true
            });
        }
    }, [mapping, isOpen, devices]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border animate-in zoom-in duration-200">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-foreground">{mapping ? 'Edit' : 'Create'} Mapping</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-background-muted transition-colors">
                        <X className="h-5 w-5 text-foreground-muted" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {!mapping && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground-muted mb-1.5">Select Employee</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                                        <select 
                                            className="input pl-10 bg-background border-border w-full rounded-xl"
                                            value={formData.employeeId}
                                            onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                                            required
                                        >
                                            <option value="">Choose...</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.fullName || emp.firstName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground-muted mb-1.5">Target Device</label>
                                    <div className="relative">
                                        <Database className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                                        <select 
                                            className="input pl-10 bg-background border-border w-full rounded-xl"
                                            value={formData.deviceId}
                                            onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                                            required
                                        >
                                            <option value="">Select Device...</option>
                                            {devices.map(d => (
                                                <option key={d.id} value={d.id}>{d.name} ({d.deviceIdentifier})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-1.5">Biometric ID (e.g. 101)</label>
                                <div className="relative">
                                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                                    <input 
                                        className="input pl-10 bg-background border-border w-full rounded-xl font-mono"
                                        placeholder="User ID"
                                        value={formData.biometricId}
                                        onChange={(e) => setFormData({...formData, biometricId: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-1.5">Identifier Type</label>
                                <select 
                                    className="input bg-background border-border w-full rounded-xl"
                                    value={formData.identifierType}
                                    onChange={(e) => setFormData({...formData, identifierType: e.target.value})}
                                >
                                    <option value="FINGERPRINT">Fingerprint</option>
                                    <option value="FACE">Face ID</option>
                                    <option value="CARD">RFID Card</option>
                                    <option value="PIN">Pincode</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-1.5">Raw Template (Optional)</label>
                            <textarea 
                                className="input bg-background border-border w-full rounded-xl font-mono text-xs h-24"
                                placeholder="Paste Base64 biometric template here if available..."
                                value={formData.biometricTemplate}
                                onChange={(e) => setFormData({...formData, biometricTemplate: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="p-4 border-t border-border bg-background-muted/30 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary rounded-xl text-sm" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary rounded-xl text-sm flex items-center shadow-lg shadow-primary/20" disabled={loading}>
                            {loading && <Loader className="animate-spin h-4 w-4 mr-2" />}
                            {mapping ? 'Update Mapping' : 'Link Employee'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeMappings;
