import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader, Save, AlertCircle, Settings, ChevronDown, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Custom sleek dropdown component
const CustomDropdown = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
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

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground hover:border-primary/50 focus:outline-none focus:border-primary transition-all text-left cursor-pointer shadow-2xs"
            >
                <span className={`truncate ${selectedOption ? 'text-foreground font-semibold' : 'text-foreground-muted'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-foreground-muted shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl z-50 p-1 space-y-0.5 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    {options.map(opt => {
                        const isSelected = String(opt.value) === String(value);
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
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
                    })}
                </div>
            )}
        </div>
    );
};

const AttendanceSettings = () => {
    const methodOptions = [
        { value: 'MANUAL', label: 'Manual Entry' },
        { value: 'BIOMETRIC', label: 'Biometric Hardware' },
        { value: 'APP', label: 'Mobile Application' },
        { value: 'GPS', label: 'GPS Geofencing' },
        { value: 'RFID', label: 'RFID Smart Card' },
    ];

    const [setting, setSetting] = useState(null);
    const [formData, setFormData] = useState({
        method: 'MANUAL',
        defaultGraceMinutes: 0,
        autoMarkAbsentAfter: false,
        absentAfterMinutes: 0,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/attendance-settings`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.data && response.data.length > 0) {
                    const fetchedSetting = response.data[0];
                    setSetting(fetchedSetting);
                    setFormData({
                        method: fetchedSetting.method || 'MANUAL',
                        defaultGraceMinutes: fetchedSetting.defaultGraceMinutes || 0,
                        autoMarkAbsentAfter: fetchedSetting.autoMarkAbsentAfter || false,
                        absentAfterMinutes: fetchedSetting.absentAfterMinutes || 0,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch attendance settings:", err);
                setError('Could not load attendance settings.');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccessMsg('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            let response;
            if (setting && setting.id) {
                response = await axios.put(`${API_URL}/attendance-settings/${setting.id}`, formData, { headers });
            } else {
                response = await axios.post(`${API_URL}/attendance-settings`, formData, { headers });
            }
            const savedSetting = response.data;
            setSetting(savedSetting);
            setFormData({
                method: savedSetting.method || 'MANUAL',
                defaultGraceMinutes: savedSetting.defaultGraceMinutes || 0,
                autoMarkAbsentAfter: savedSetting.autoMarkAbsentAfter || false,
                absentAfterMinutes: savedSetting.absentAfterMinutes || 0,
            });
            setSuccessMsg('Settings saved successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error("Failed to save settings:", err);
            setError(err.response?.data?.message || 'Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-16">
                <Loader className="animate-spin h-6 w-6 text-primary" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="space-y-4 text-foreground bg-background min-h-full w-full pb-8">
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <h2 className="text-xs font-bold text-foreground">Attendance Settings</h2>
                <button 
                    type="submit" 
                    disabled={saving}
                    className="px-3.5 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                    {saving ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                    {saving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>

            {error && (
                <div className="bg-error/10 border border-error/20 text-error px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {successMsg && (
                <div className="bg-primary/10 border border-primary/20 text-primary px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 font-medium">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            <div className="bg-card p-3.5 rounded-xl shadow-xs border border-border space-y-4 max-w-xl">
                <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5 flex items-center gap-1.5">
                    <Settings className="h-3.5 w-3.5 text-primary" />
                    <span>General Engine Parameters</span>
                </h3>

                <div className="space-y-3.5">
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground-muted mb-1">Attendance Method</label>
                        <CustomDropdown
                            options={methodOptions}
                            value={formData.method}
                            onChange={(val) => setFormData(p => ({ ...p, method: val }))}
                            placeholder="Select Method"
                        />
                    </div>

                    <div>
                        <label htmlFor="defaultGraceMinutes" className="block text-[11px] font-semibold text-foreground-muted mb-1">Default Grace Period (minutes)</label>
                        <input 
                            type="number" 
                            id="defaultGraceMinutes" 
                            name="defaultGraceMinutes" 
                            value={formData.defaultGraceMinutes} 
                            onChange={handleChange} 
                            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all" 
                            placeholder="0"
                        />
                    </div>

                    <div className="pt-1 border-t border-border/60">
                        <label className="inline-flex items-center cursor-pointer gap-2">
                            <input 
                                type="checkbox" 
                                id="autoMarkAbsentAfter" 
                                name="autoMarkAbsentAfter" 
                                checked={formData.autoMarkAbsentAfter} 
                                onChange={handleChange} 
                                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary accent-primary" 
                            />
                            <span className="text-xs text-foreground font-semibold">Automatically mark absent</span>
                        </label>
                    </div>

                    {formData.autoMarkAbsentAfter && (
                        <div className="animate-in fade-in slide-in-from-top-1 duration-200 pl-5 border-l-2 border-primary/30 pt-1">
                            <label htmlFor="absentAfterMinutes" className="block text-[11px] font-semibold text-foreground-muted mb-1">Mark Absent After (minutes past shift start)</label>
                            <input 
                                type="number" 
                                id="absentAfterMinutes" 
                                name="absentAfterMinutes" 
                                value={formData.absentAfterMinutes} 
                                onChange={handleChange} 
                                className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all" 
                                placeholder="e.g. 60"
                            />
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
};

export default AttendanceSettings;
