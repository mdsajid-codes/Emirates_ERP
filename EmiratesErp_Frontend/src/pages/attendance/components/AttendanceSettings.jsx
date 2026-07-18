import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, Save, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AttendanceSettings = () => {
    const attendanceMethods = ['MANUAL', 'BIOMETRIC', 'APP', 'GPS', 'RFID'];

    const [setting, setSetting] = useState(null);
    const [formData, setFormData] = useState({
        method: '',
        defaultGraceMinutes: 0,
        autoMarkAbsentAfter: false,
        absentAfterMinutes: 0,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

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
                        method: fetchedSetting.method || '',
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
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            let response;
            if (setting && setting.id) {
                // Update existing setting
                response = await axios.put(`${API_URL}/attendance-settings/${setting.id}`, formData, { headers });
            } else {
                // Create new setting
                response = await axios.post(`${API_URL}/attendance-settings`, formData, { headers });
            }
            const savedSetting = response.data;
            setSetting(savedSetting);
            setFormData({
                method: savedSetting.method || '',
                defaultGraceMinutes: savedSetting.defaultGraceMinutes || 0,
                autoMarkAbsentAfter: savedSetting.autoMarkAbsentAfter || false,
                absentAfterMinutes: savedSetting.absentAfterMinutes || 0,
            });
            alert('Settings saved successfully!');
        } catch (err) {
            console.error("Failed to save settings:", err);
            setError(err.response?.data?.message || 'Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (error) {
        return <div className="p-8 text-center text-error"><AlertCircle className="mx-auto h-12 w-12" /><p className="mt-2 font-medium">{error}</p></div>;
    }

    return (
        <div className="bg-card p-6 rounded-theme shadow-sm border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Attendance Settings</h2>
            <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
                <div>
                    <label htmlFor="method" className="block text-sm font-medium text-foreground-muted mb-1">Attendance Method</label>
                    <select id="method" name="method" value={formData.method} onChange={handleChange} className="input bg-background-muted border-border rounded-theme text-foreground focus:ring-primary">
                        <option value="">Select Method</option>
                        {attendanceMethods.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="defaultGraceMinutes" className="block text-sm font-medium text-foreground-muted mb-1">Default Grace Period (minutes)</label>
                    <input type="number" id="defaultGraceMinutes" name="defaultGraceMinutes" value={formData.defaultGraceMinutes} onChange={handleChange} className="input bg-background-muted border-border rounded-theme text-foreground focus:ring-primary" />
                </div>
                <div className="flex items-center gap-3">
                    <input type="checkbox" id="autoMarkAbsentAfter" name="autoMarkAbsentAfter" checked={formData.autoMarkAbsentAfter} onChange={handleChange} className="h-4 w-4 rounded-theme border-border text-primary focus:ring-primary" />
                    <label htmlFor="autoMarkAbsentAfter" className="text-sm font-medium text-foreground">Automatically mark absent</label>
                </div>
                {formData.autoMarkAbsentAfter && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                        <label htmlFor="absentAfterMinutes" className="block text-sm font-medium text-foreground-muted mb-1">Mark Absent After (minutes past shift start)</label>
                        <input type="number" id="absentAfterMinutes" name="absentAfterMinutes" value={formData.absentAfterMinutes} onChange={handleChange} className="input bg-background-muted border-border rounded-theme text-foreground focus:ring-primary" />
                    </div>
                )}
                <div className="flex justify-end pt-4 border-t border-border">
                    <button type="submit" className="btn-primary rounded-theme flex items-center shadow-lg shadow-primary/20 px-6" disabled={saving}>
                        {saving ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AttendanceSettings;
