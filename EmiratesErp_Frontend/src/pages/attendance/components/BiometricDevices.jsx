import React, { useState, useEffect } from 'react';
import { 
    Plus, Edit, Trash2, Loader, AlertCircle, X, 
    Settings, Power, Clock, Database, ChevronDown 
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Modal for adding/editing devices
const DeviceModal = ({ isOpen, onClose, onSave, device, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        machineNumber: '',
        deviceIdentifier: '',
        location: '',
        apiKey: '',
        vendorFormat: 'GENERIC',
        active: true,
    });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (device) {
            setFormData({
                name: device.name || '',
                machineNumber: device.machineNumber || '',
                deviceIdentifier: device.deviceIdentifier || '',
                location: device.location || '',
                apiKey: device.apiKey || '',
                vendorFormat: device.vendorFormat || 'GENERIC',
                active: device.active ?? true,
            });
        } else {
            setFormData({ 
                name: '', machineNumber: '', deviceIdentifier: '', location: '', 
                apiKey: '', vendorFormat: 'GENERIC', active: true 
            });
        }
        setModalError('');
    }, [device, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.deviceIdentifier.trim()) {
            setModalError('Device Name and Identifier are required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-theme shadow-2xl w-full max-w-lg border border-border">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-foreground">{device ? 'Edit' : 'Add'} Biometric Device</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-background-muted text-foreground-muted transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground-muted mb-1">Device Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} required className="input bg-background border-border rounded-theme text-foreground w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-1">Device Serial (SN)</label>
                            <input name="deviceIdentifier" value={formData.deviceIdentifier} onChange={handleChange} required className="input bg-background border-border rounded-theme text-foreground w-full font-mono" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-1">Machine Number</label>
                            <input name="machineNumber" value={formData.machineNumber} onChange={handleChange} className="input bg-background border-border rounded-theme text-foreground w-full font-mono" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-1">Vendor Protocol</label>
                            <select name="vendorFormat" value={formData.vendorFormat} onChange={handleChange} className="input bg-background border-border rounded-theme text-foreground w-full">
                                <option value="GENERIC">Generic (Standard)</option>
                                <option value="ZKTECO">ZKTeco (ADMS/Push)</option>
                                <option value="ESSL">eSSL (Legacy)</option>
                                <option value="HIKVISION">HikVision</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground-muted mb-1">X-API-KEY (For Secure Comm)</label>
                            <input name="apiKey" value={formData.apiKey} onChange={handleChange} placeholder="Generate a unique key for this device" className="input bg-background border-border rounded-theme text-foreground w-full font-mono" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-1">Physical Location</label>
                            <input name="location" value={formData.location} onChange={handleChange} className="input bg-background border-border rounded-theme text-foreground w-full" />
                        </div>
                        <div className="flex items-center gap-3 pt-6">
                            <input type="checkbox" id="active" name="active" checked={formData.active} onChange={handleChange} className="h-4 w-4 rounded-theme border-border text-primary focus:ring-primary" />
                            <label htmlFor="active" className="text-sm font-medium text-foreground">Device is Active</label>
                        </div>
                        {modalError && <p className="md:col-span-2 text-error text-sm font-medium">{modalError}</p>}
                    </div>
                    <div className="p-4 border-t border-border bg-background-muted flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary rounded-theme" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary rounded-theme flex items-center shadow-lg shadow-primary/20" disabled={loading}>
                            {loading && <Loader className="animate-spin h-4 w-4 mr-2" />}
                            Save Device Configuration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const BiometricDevices = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);
    const [actionMenu, setActionMenu] = useState(null); // Track which device has the action menu open

    const fetchDevices = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/biometric-devices`, { headers: { "Authorization": `Bearer ${token}` } });
            setDevices(response.data);
        } catch (err) {
            setError('Failed to fetch biometric devices.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const handleIssueCommand = async (deviceId, commandType) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/biometric-devices/${deviceId}/commands`, 
                { commandType, payload: "{}" }, 
                { headers: { "Authorization": `Bearer ${token}` } }
            );
            alert(`Command '${commandType}' queued successfully! It will be executed on the next device check-in.`);
            setActionMenu(null);
        } catch (err) {
            alert('Failed to issue command: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleAdd = () => { setEditingDevice(null); setIsModalOpen(true); };
    const handleEdit = (device) => { setEditingDevice(device); setIsModalOpen(true); };

    const handleDelete = async (deviceId, deviceName) => {
        if (window.confirm(`Are you sure you want to delete the device "${deviceName}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/biometric-devices/${deviceId}`, { headers: { "Authorization": `Bearer ${token}` } });
                setDevices(devices.filter(d => d.id !== deviceId));
            } catch (err) {
                setError('Failed to delete device.');
                console.error(err);
            }
        }
    };

    const handleSave = async (deviceData) => {
        setModalLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            if (editingDevice) {
                await axios.put(`${API_URL}/biometric-devices/${editingDevice.id}`, deviceData, { headers });
            } else {
                await axios.post(`${API_URL}/biometric-devices`, deviceData, { headers });
            }
            setIsModalOpen(false);
            fetchDevices();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save device.');
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <>
            <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-foreground">Biometric Device Fleet</h2>
                    <button onClick={handleAdd} className="btn-primary rounded-theme flex items-center shadow-lg shadow-primary/20"><Plus className="h-5 w-5 mr-2" /> Add Terminal</button>
                </div>
                {error && <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-theme mb-6 font-medium flex items-center gap-2" role="alert"><AlertCircle className="h-5 w-5" />{error}</div>}
                <div className="bg-card rounded-theme shadow-sm border border-border/50 overflow-visible">
                    {loading ? (
                        <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : (
                        <div className="overflow-x-auto min-h-[400px]">
                            <table className="min-w-full bg-card">
                                <thead className="bg-background-muted">
                                    <tr>
                                        <th className="th-cell text-foreground-muted text-xs uppercase tracking-wider">Device & Location</th>
                                        <th className="th-cell text-foreground-muted text-xs uppercase tracking-wider">Serial (SN)</th>
                                        <th className="th-cell text-foreground-muted text-xs uppercase tracking-wider">Machine No</th>
                                        <th className="th-cell text-foreground-muted text-xs uppercase tracking-wider">Protocol</th>
                                        <th className="th-cell text-foreground-muted text-xs uppercase tracking-wider">Status</th>
                                        <th className="th-cell text-foreground-muted text-xs uppercase tracking-wider">Control Center</th>
                                    </tr>
                                </thead>
                                <tbody className="text-foreground">
                                    {devices.length > 0 ? (
                                        devices.map(d => (
                                            <tr key={d.id} className="border-b border-border hover:bg-background-muted/50 transition-colors">
                                                <td className="td-cell">
                                                    <div className="font-bold">{d.name}</div>
                                                    <div className="text-[10px] text-foreground-muted">{d.location || 'No Location'}</div>
                                                </td>
                                                <td className="td-cell font-mono text-xs text-primary">{d.deviceIdentifier}</td>
                                                <td className="td-cell font-mono text-xs text-foreground-muted">{d.machineNumber || '-'}</td>
                                                <td className="td-cell">
                                                    <span className="flex items-center gap-1.5 text-xs font-medium">
                                                        <Database className="h-3.5 w-3.5 text-foreground-muted" />
                                                        {d.vendorFormat || 'GENERIC'}
                                                    </span>
                                                </td>
                                                <td className="td-cell">
                                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${d.active ? 'bg-success/10 text-success border-success/20' : 'bg-background-muted text-foreground-muted border-border'}`}>
                                                        {d.active ? 'Linked' : 'Offline'}
                                                    </span>
                                                </td>
                                                <td className="td-cell">
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative">
                                                            <button 
                                                                onClick={() => setActionMenu(actionMenu === d.id ? null : d.id)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-theme bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all border border-primary/20"
                                                            >
                                                                Remote Control <ChevronDown className="h-3 w-3" />
                                                            </button>
                                                            {actionMenu === d.id && (
                                                                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                                    <button onClick={() => handleIssueCommand(d.id, 'REBOOT')} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground hover:bg-background-muted transition-colors"><Power className="h-4 w-4 text-error" /> Reboot Device</button>
                                                                    <button onClick={() => handleIssueCommand(d.id, 'SYNC_TIME')} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground hover:bg-background-muted transition-colors"><Clock className="h-4 w-4 text-primary" /> Sync Server Time</button>
                                                                    <button onClick={() => handleIssueCommand(d.id, 'CLEAR_LOGS')} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground hover:bg-background-muted transition-colors"><Database className="h-4 w-4 text-orange-500" /> Flush Device Logs</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center border-l border-border ml-2 pl-2">
                                                            <button onClick={() => handleEdit(d)} className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors" title="Edit"><Edit className="h-4 w-4" /></button>
                                                            <button onClick={() => handleDelete(d.id, d.name)} className="p-2 text-foreground-muted hover:text-error hover:bg-error/10 rounded-full transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="text-center py-12 text-foreground-muted"><AlertCircle className="mx-auto h-12 w-12 opacity-20 mb-4" /><h3 className="text-lg font-bold text-foreground">No terminals registered</h3><p className="max-w-xs mx-auto text-sm mt-1">Connect your biometric fleet to the universal cloud engine to begin active management.</p></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <DeviceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} device={editingDevice} loading={modalLoading} />
        </>
    );
}

export default BiometricDevices;