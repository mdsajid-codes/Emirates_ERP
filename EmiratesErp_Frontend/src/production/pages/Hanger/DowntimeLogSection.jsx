import React, { useState, useEffect } from 'react';
import {
    Clock, AlertTriangle, Play, CheckCircle2,
    History, MessageSquare, Plus, Trash2,
    Calendar, Settings, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CATEGORIES = [
    { value: 'MECHANICAL', label: 'Mechanical Failure' },
    { value: 'TOOLING', label: 'Tooling / Mold Issue' },
    { value: 'NO_MATERIAL', label: 'No Material' },
    { value: 'POWER_OUTAGE', label: 'Power Outage' },
    { value: 'PLANNED_MAINTENANCE', label: 'Planned Maintenance' },
    { value: 'CHANGEOVER', label: 'Product Changeover' },
    { value: 'OTHER', label: 'Other' }
];

const DowntimeLogSection = ({ batch, onUpdate }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [workStations, setWorkStations] = useState([]);

    const [formData, setFormData] = useState({
        workstationId: batch.workStationId || '',
        startTime: '',
        endTime: '',
        downtimeCategory: 'MECHANICAL',
        notes: ''
    });

    useEffect(() => {
        fetchLogs();
        fetchWorkStations();
    }, [batch.id]);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/hanger/downtime-logs/by-batch/${batch.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(response.data);
        } catch (error) {
            console.error('Error fetching downtime logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkStations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/production/work-stations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkStations(response.data);
        } catch (error) {
            console.error('Error fetching workstations:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Convert datetime-local (2026-02-25T13:30) → OffsetDateTime (2026-02-25T13:30:00+05:30)
    const toOffsetDateTime = (val) => {
        if (!val) return null;
        const withSeconds = val.length === 16 ? val + ':00' : val;
        return withSeconds.includes('+') || withSeconds.endsWith('Z')
            ? withSeconds
            : withSeconds + '+05:30';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.workstationId || !formData.startTime || !formData.downtimeCategory) {
            toast.warning('Please fill in required fields (Workstation, Start Time, Category)');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/hanger/downtime-logs`, {
                ...formData,
                batchId: batch.id,
                startTime: toOffsetDateTime(formData.startTime),
                endTime: toOffsetDateTime(formData.endTime)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Downtime logged successfully');
            setFormData({
                workstationId: batch.workStationId || '',
                startTime: '',
                endTime: '',
                downtimeCategory: 'MECHANICAL',
                notes: ''
            });
            fetchLogs();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error logging downtime:', error);
            toast.error('Failed to log downtime');
        } finally {
            setSubmitting(false);
        }
    };

    const stats = {
        totalIncidents: logs.length,
        totalDuration: logs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0)
    };

    return (
        <div className="space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2 text-rose-500">
                        <AlertTriangle size={18} />
                        <span className="text-sm font-medium text-slate-500">Total Incidents</span>
                    </div>
                    <div className="text-2xl font-bold text-rose-600">{stats.totalIncidents}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2 text-amber-500">
                        <Clock size={18} />
                        <span className="text-sm font-medium text-slate-500">Total Downtime</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-600">{stats.totalDuration} <span className="text-xs font-normal">mins</span></div>
                </div>
            </div>

            {/* Log Form */}
            <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all ${batch.status === 'COMPLETED' || batch.status === 'CANCELLED' ? 'opacity-60 pointer-events-none' : ''}`}>
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Plus size={18} className="text-primary" />
                        Log Machine Downtime
                    </h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Workstation / Machine *</label>
                            <select
                                name="workstationId"
                                value={formData.workstationId}
                                onChange={handleInputChange}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                required
                            >
                                <option value="">Select Workstation</option>
                                {workStations.map(ws => (
                                    <option key={ws.id} value={ws.id}>
                                        {ws.workstationName} {ws.machineId ? `(${ws.machineId})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Downtime Category *</label>
                            <select
                                name="downtimeCategory"
                                value={formData.downtimeCategory}
                                onChange={handleInputChange}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                required
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time *</label>
                            <input
                                type="datetime-local"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleInputChange}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Time (Optional)</label>
                            <input
                                type="datetime-local"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleInputChange}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows="1"
                                placeholder="Details about the breakdown or maintenance..."
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={18} />}
                                Log Incident
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <History size={18} className="text-slate-400" />
                        Downtime History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Machine / WS</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Start</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">End</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400">Loading logs...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400">No downtime incidents recorded for this batch.</td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            {log.workstationName}
                                            {log.machineId && <div className="text-[10px] text-slate-400">{log.machineId}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">
                                            {new Date(log.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">
                                            {log.endTime ? new Date(log.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Ongoing'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-amber-600">
                                                {log.durationMinutes ? `${log.durationMinutes}m` : '--'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600">
                                                {log.downtimeCategory}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 italic max-w-xs truncate">
                                            {log.notes || '--'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DowntimeLogSection;
