import React, { useState, useEffect } from 'react';
import { 
    Plus, Edit, Trash2, Loader, AlertCircle, Save, 
    Settings, Power, Clock, Database, ChevronDown, ArrowLeft, HelpCircle,
    Wifi, Key, Cpu, CheckCircle2, Server, Globe, ShieldCheck, BookOpen, RefreshCw
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const BiometricDevices = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'form' | 'guide'
    const [editingDevice, setEditingDevice] = useState(null);
    const [actionMenu, setActionMenu] = useState(null);

    const generateDefaultApiKey = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = 'ak_';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const initialFormState = {
        name: '',
        machineNumber: '',
        deviceIdentifier: '',
        location: '',
        apiKey: '',
        vendorFormat: 'GENERIC',
        active: true,
    };
    const [formData, setFormData] = useState(initialFormState);

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

    const handleAdd = () => {
        setEditingDevice(null);
        setFormData({
            ...initialFormState,
            apiKey: generateDefaultApiKey()
        });
        setViewMode('form');
    };

    const handleEdit = (device) => {
        setEditingDevice(device);
        setFormData({
            name: device.name || '',
            machineNumber: device.machineNumber || '',
            deviceIdentifier: device.deviceIdentifier || '',
            location: device.location || '',
            apiKey: device.apiKey || generateDefaultApiKey(),
            vendorFormat: device.vendorFormat || 'GENERIC',
            active: device.active ?? true,
        });
        setViewMode('form');
    };

    const handleDelete = async (deviceId, deviceName) => {
        if (window.confirm(`Are you sure you want to delete the device "${deviceName}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/biometric-devices/${deviceId}`, { headers: { "Authorization": `Bearer ${token}` } });
                setDevices(devices.filter(d => d.id !== deviceId));
            } catch (err) {
                console.error('Failed to delete device:', err);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.deviceIdentifier.trim()) {
            setError('Device Name and Serial Number are required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            if (editingDevice) {
                await axios.put(`${API_URL}/biometric-devices/${editingDevice.id}`, formData, { headers });
            } else {
                await axios.post(`${API_URL}/biometric-devices`, formData, { headers });
            }
            setViewMode('list');
            fetchDevices();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save device.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4 text-foreground bg-background min-h-full w-full pb-8">
            {viewMode === 'list' ? (
                <>
                    <div className="flex justify-between items-center pb-2 border-b border-border/60">
                        <h2 className="text-xs font-bold text-foreground">Biometric Device Fleet</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setViewMode('guide')}
                                className="px-3 py-1.5 bg-background border border-border text-foreground hover:bg-background-muted font-semibold text-xs rounded-lg transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                title="Setup & Integration Guide"
                            >
                                <HelpCircle className="h-3.5 w-3.5 text-primary" />
                                <span className="hidden sm:inline">Setup Guide</span>
                            </button>
                            <button 
                                onClick={handleAdd} 
                                className="px-3 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Terminal
                            </button>
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
                                            <th className="px-4 py-2.5">Device & Location</th>
                                            <th className="px-4 py-2.5">Serial (SN)</th>
                                            <th className="px-4 py-2.5">Machine No</th>
                                            <th className="px-4 py-2.5">Protocol</th>
                                            <th className="px-4 py-2.5 text-center">Status</th>
                                            <th className="px-4 py-2.5 text-right">Control Center</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {devices.length > 0 ? (
                                            devices.map(d => (
                                                <tr key={d.id} className="hover:bg-background-muted/50 transition-colors">
                                                    <td className="px-4 py-2.5">
                                                        <div className="font-bold text-foreground">{d.name}</div>
                                                        <div className="text-[10px] text-foreground-muted">{d.location || 'No Location'}</div>
                                                    </td>
                                                    <td className="px-4 py-2.5 font-mono text-[11px] text-primary font-bold">{d.deviceIdentifier}</td>
                                                    <td className="px-4 py-2.5 font-mono text-[11px] text-foreground-muted">{d.machineNumber || '-'}</td>
                                                    <td className="px-4 py-2.5">
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground">
                                                            <Database className="h-3 w-3 text-foreground-muted" />
                                                            {d.vendorFormat || 'GENERIC'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${d.active ? 'bg-primary/10 text-primary border-primary/20' : 'bg-background-muted text-foreground-muted border-border'}`}>
                                                            {d.active ? 'Linked' : 'Offline'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="relative">
                                                                <button 
                                                                    onClick={() => setActionMenu(actionMenu === d.id ? null : d.id)}
                                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all border border-primary/20"
                                                                >
                                                                    Remote Control <ChevronDown className="h-3 w-3" />
                                                                </button>
                                                                {actionMenu === d.id && (
                                                                    <div className="absolute right-0 mt-1 w-44 bg-card border border-border rounded-xl shadow-lg z-30 overflow-hidden text-xs space-y-0.5 p-1 animate-in fade-in zoom-in-95 duration-100">
                                                                        <button onClick={() => handleIssueCommand(d.id, 'REBOOT')} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-background-muted transition-colors"><Power className="h-3.5 w-3.5 text-red-500" /> Reboot Device</button>
                                                                        <button onClick={() => handleIssueCommand(d.id, 'SYNC_TIME')} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-background-muted transition-colors"><Clock className="h-3.5 w-3.5 text-primary" /> Sync Server Time</button>
                                                                        <button onClick={() => handleIssueCommand(d.id, 'CLEAR_LOGS')} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-background-muted transition-colors"><Database className="h-3.5 w-3.5 text-amber-500" /> Flush Device Logs</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1 border-l border-border/60 pl-2">
                                                                <button onClick={() => handleEdit(d)} className="p-1 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-lg transition-colors" title="Edit Device"><Edit className="h-3.5 w-3.5" /></button>
                                                                <button onClick={() => handleDelete(d.id, d.name)} className="p-1 text-foreground-muted hover:text-red-600 hover:bg-background-muted rounded-lg transition-colors" title="Delete Device"><Trash2 className="h-3.5 w-3.5" /></button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center py-10 text-foreground-muted">
                                                    <AlertCircle className="mx-auto h-8 w-8 text-foreground-muted/40 mb-2" />
                                                    <h3 className="text-xs font-bold text-foreground">No terminals registered</h3>
                                                    <p className="mt-1 text-[11px] text-foreground-muted max-w-xs mx-auto">Connect your biometric fleet to the universal cloud engine to begin active management.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            ) : viewMode === 'form' ? (
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
                                <span>Back to Biometric Fleet</span>
                            </button>
                            <h2 className="text-xs font-bold text-foreground">
                                {editingDevice ? 'Edit Biometric Device' : 'Add Biometric Device'}
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
                                {saving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-error/10 border border-error/20 text-error px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 font-medium">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Device Details Card */}
                    <div className="bg-card p-3.5 rounded-xl shadow-xs border border-border space-y-3">
                        <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5">Terminal Parameters</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            <div className="sm:col-span-2 lg:col-span-1">
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Device Name</label>
                                <input 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} 
                                    required 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all" 
                                    placeholder="e.g. Main Gate Terminal" 
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Device Serial (SN)</label>
                                <input 
                                    name="deviceIdentifier" 
                                    value={formData.deviceIdentifier} 
                                    onChange={e => setFormData(p => ({ ...p, deviceIdentifier: e.target.value }))} 
                                    required 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all font-mono" 
                                    placeholder="e.g. ZK9500-8832" 
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Machine Number</label>
                                <input 
                                    name="machineNumber" 
                                    value={formData.machineNumber} 
                                    onChange={e => setFormData(p => ({ ...p, machineNumber: e.target.value }))} 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all font-mono" 
                                    placeholder="e.g. 1" 
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Vendor Protocol</label>
                                <div className="relative flex items-center">
                                    <select 
                                        name="vendorFormat" 
                                        value={formData.vendorFormat} 
                                        onChange={e => setFormData(p => ({ ...p, vendorFormat: e.target.value }))} 
                                        className="w-full pl-2.5 pr-8 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="GENERIC" className="bg-card text-foreground">Generic (Standard)</option>
                                        <option value="ZKTECO" className="bg-card text-foreground">ZKTeco (ADMS/Push)</option>
                                        <option value="ESSL" className="bg-card text-foreground">eSSL (Legacy)</option>
                                        <option value="HIKVISION" className="bg-card text-foreground">HikVision</option>
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Physical Location</label>
                                <input 
                                    name="location" 
                                    value={formData.location} 
                                    onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} 
                                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all" 
                                    placeholder="e.g. Dubai Main Entrance" 
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">X-API-KEY (For Secure Comm)</label>
                                <div className="relative flex items-center">
                                    <input 
                                        name="apiKey" 
                                        value={formData.apiKey} 
                                        onChange={e => setFormData(p => ({ ...p, apiKey: e.target.value }))} 
                                        className="w-full pl-2.5 pr-8 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all font-mono" 
                                        placeholder="Unique security token" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, apiKey: generateDefaultApiKey() }))}
                                        className="absolute right-1.5 p-1 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-md transition-colors cursor-pointer"
                                        title="Generate New API Key"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3 pt-1">
                                <label className="inline-flex items-center cursor-pointer gap-2">
                                    <input 
                                        type="checkbox" 
                                        name="active" 
                                        checked={formData.active} 
                                        onChange={e => setFormData(p => ({ ...p, active: e.target.checked }))} 
                                        className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary accent-primary" 
                                    />
                                    <span className="text-xs text-foreground font-semibold">Device is Active</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                /* Step-by-Step Biometric Setup Guide View */
                <div className="w-full space-y-4">
                    {/* Header bar with Back button */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                        <div className="flex items-center gap-2.5">
                            <button 
                                type="button"
                                onClick={() => setViewMode('list')} 
                                className="p-1.5 hover:bg-background-muted rounded-lg border border-border flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Back to Biometric Fleet</span>
                            </button>
                            <h2 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5 text-primary" />
                                <span>Biometric Hardware & Connection Setup Guide</span>
                            </h2>
                        </div>
                        <button
                            onClick={() => setViewMode('form')}
                            className="px-3 py-1 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="h-3.5 w-3.5" /> Register New Terminal
                        </button>
                    </div>

                    {/* Step-by-Step Walkthrough Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {/* Step 1 */}
                        <div className="bg-card p-4 rounded-xl shadow-xs border border-border space-y-2.5 relative overflow-hidden">
                            <div className="flex items-center gap-2 border-b border-border pb-2">
                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                                    1
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <Wifi className="h-3.5 w-3.5 text-primary" /> Network & ADMS Cloud Server Setup
                                    </h3>
                                    <p className="text-[10px] text-foreground-muted">Configure cloud endpoint on physical terminal</p>
                                </div>
                            </div>
                            <ul className="text-xs text-foreground space-y-1.5 list-disc list-inside text-[11px] text-foreground-muted">
                                <li>Open the physical device menu: <strong className="text-foreground">Menu &gt; System &gt; ADMS / Cloud Server Settings</strong>.</li>
                                <li>Enable <strong className="text-foreground">Enable Domain Name / ADMS</strong>.</li>
                                <li>Set Server Address: <code className="bg-background-muted px-1.5 py-0.5 rounded text-primary font-mono text-[10px]">api.emirateserp.ae</code> (Port: <code className="bg-background-muted px-1.5 py-0.5 rounded text-primary font-mono text-[10px]">8080</code>).</li>
                                <li>Ensure network gateway and DNS are configured for outbound internet access.</li>
                            </ul>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-card p-4 rounded-xl shadow-xs border border-border space-y-2.5 relative overflow-hidden">
                            <div className="flex items-center gap-2 border-b border-border pb-2">
                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                                    2
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <Key className="h-3.5 w-3.5 text-primary" /> Serial Number & Security Token
                                    </h3>
                                    <p className="text-[10px] text-foreground-muted">Register terminal details in Emirates ERP</p>
                                </div>
                            </div>
                            <ul className="text-xs text-foreground space-y-1.5 list-disc list-inside text-[11px] text-foreground-muted">
                                <li>Locate the <strong>Serial Number (SN)</strong> sticker on the back or bottom of the terminal (e.g. <code className="bg-background-muted px-1 py-0.5 rounded text-foreground font-mono text-[10px]">ZK9500-8832</code>).</li>
                                <li>Click <strong>+ Add Terminal</strong> and enter the exact SN in the <strong>Device Serial</strong> field.</li>
                                <li>Set an optional <code className="bg-background-muted px-1 py-0.5 rounded text-foreground font-mono text-[10px]">X-API-KEY</code> token if required for encrypted ADMS handshake validation.</li>
                            </ul>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-card p-4 rounded-xl shadow-xs border border-border space-y-2.5 relative overflow-hidden">
                            <div className="flex items-center gap-2 border-b border-border pb-2">
                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                                    3
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <Cpu className="h-3.5 w-3.5 text-primary" /> Vendor Protocol Selection
                                    </h3>
                                    <p className="text-[10px] text-foreground-muted">Match protocol format for auto log parsing</p>
                                </div>
                            </div>
                            <ul className="text-xs text-foreground space-y-1.5 list-disc list-inside text-[11px] text-foreground-muted">
                                <li><strong className="text-foreground">ZKTeco (ADMS/Push):</strong> Standard HTTP POST push protocol used by ZK SpeedFace / uFace series.</li>
                                <li><strong className="text-foreground">HikVision (ISAPI):</strong> Push XML/JSON event notifications for HikVision terminals.</li>
                                <li><strong className="text-foreground">eSSL (Legacy):</strong> TCP/IP socket polling protocol for older eSSL biometric devices.</li>
                                <li><strong className="text-foreground">Generic (Standard):</strong> Custom JSON REST Webhook integration for standard scanners.</li>
                            </ul>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-card p-4 rounded-xl shadow-xs border border-border space-y-2.5 relative overflow-hidden">
                            <div className="flex items-center gap-2 border-b border-border pb-2">
                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                                    4
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Verification & Remote Diagnostics
                                    </h3>
                                    <p className="text-[10px] text-foreground-muted">Test live punches and control options</p>
                                </div>
                            </div>
                            <ul className="text-xs text-foreground space-y-1.5 list-disc list-inside text-[11px] text-foreground-muted">
                                <li>Once connected, the status badge will update from <span className="bg-background-muted text-foreground-muted px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Offline</span> to <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Linked</span>.</li>
                                <li>Perform a test fingerprint / face scan on the physical device to confirm instant entry in <strong>Attendance Logs</strong>.</li>
                                <li>Use the <strong className="text-foreground">Remote Control</strong> dropdown menu to issue <em>Reboot Terminal</em>, <em>Sync Server Time</em>, or <em>Flush Device Logs</em> commands.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BiometricDevices;