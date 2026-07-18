import React, { useState, useEffect } from 'react';
import {
    Layers, Plus, User, Timer, BarChart3,
    AlertCircle, CheckCircle2, History, X
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const WireCuttingSection = ({ batch, onActionSuccess }) => {
    const [runs, setRuns] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [workStations, setWorkStations] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [formData, setFormData] = useState({
        workStationId: '',
        operatorId: '',
        shift: 'Day Shift',
        costCenter: '',
        cuttingLengthCm: '',
        producedQty: '',
        scrapQty: '',
        startTime: '',
        endTime: '',
        remarks: '',
        scrapType: 'NON_RETURNABLE',
        scrapRatePerKg: ''
    });

    useEffect(() => {
        fetchData();
        fetchInitialData();
    }, [batch.id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/hanger/wire-processing/by-batch/${batch.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRuns(res.data || []);
        } catch (error) {
            console.error('Error fetching wire processing runs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const wsRes = await axios.get(`${API_URL}/production/work-stations`, { headers });
            setWorkStations(Array.isArray(wsRes.data) ? wsRes.data : []);

            const empRes = await axios.get(`${API_URL}/employees/all`, { headers });
            setEmployees(Array.isArray(empRes.data) ? empRes.data : []);

            // Auto-fill from batch if possible
            if (batch.workStationId) {
                setFormData(prev => ({ ...prev, workStationId: batch.workStationId }));
            }
            if (batch.shift) {
                setFormData(prev => ({ ...prev, shift: batch.shift }));
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    // Convert datetime-local (2026-02-25T08:00) → OffsetDateTime (2026-02-25T08:00:00+05:30)
    const toOffsetDateTime = (val) => {
        if (!val) return null;
        const withSeconds = val.length === 16 ? val + ':00' : val;
        return withSeconds.includes('+') || withSeconds.endsWith('Z')
            ? withSeconds
            : withSeconds + '+05:30';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/hanger/wire-processing`, {
                ...formData,
                batchId: batch.id,
                startTime: toOffsetDateTime(formData.startTime),
                endTime: toOffsetDateTime(formData.endTime)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Wire cutting run logged successfully');
            setShowForm(false);
            fetchData();
            if (onActionSuccess) onActionSuccess();
        } catch (error) {
            console.error('Error logging run:', error);
            toast.error(error.response?.data?.message || 'Failed to log wire cutting run');
        } finally {
            setSubmitting(false);
        }
    };

    // Derived Stats
    const activeRuns = Array.isArray(runs) ? runs : [];
    const totalProduced = activeRuns.reduce((sum, run) => sum + (run.producedQty || 0), 0);
    const totalScrap = activeRuns.reduce((sum, run) => sum + (run.scrapQty || 0), 0);
    const avgProductivity = activeRuns.length > 0
        ? activeRuns.reduce((sum, run) => sum + (run.productivityPcsPerHour || 0), 0) / activeRuns.length
        : 0;

    const scrapPct = totalProduced + totalScrap > 0
        ? (totalScrap / (totalProduced + totalScrap)) * 100
        : 0;

    return (
        <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    label="Total Cut"
                    value={totalProduced.toLocaleString()}
                    subValue={`Target: ${batch.plannedQty}`}
                    icon={<Layers className="text-blue-500" />}
                />
                <StatCard
                    label="Scrap Quantity"
                    value={totalScrap.toLocaleString()}
                    subValue={`${scrapPct.toFixed(1)}% Scrap Rate`}
                    icon={<AlertCircle className="text-orange-500" />}
                    status={scrapPct > 5 ? 'warning' : 'success'}
                />
                <StatCard
                    label="Avg Productivity"
                    value={Math.round(avgProductivity).toLocaleString()}
                    subValue="pcs per hour"
                    icon={<Timer className="text-purple-500" />}
                />
                <StatCard
                    label="Completion"
                    value={`${Math.round((totalProduced / batch.plannedQty) * 100)}%`}
                    subValue={`${totalProduced}/${batch.plannedQty}`}
                    icon={<BarChart3 className="text-green-500" />}
                />
            </div>

            {/* Actions & List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" />
                        Cutting History
                    </h3>
                    {!showForm && batch.status !== 'COMPLETED' && batch.status !== 'CANCELLED' && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Log New Run
                        </button>
                    )}
                </div>

                {showForm ? (
                    <form onSubmit={handleSubmit} className="p-6 bg-slate-50/30 space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-slate-700">Record New Cutting Operation</h4>
                            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormGroup label="Work Station">
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.workStationId}
                                    onChange={(e) => setFormData({ ...formData, workStationId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Station</option>
                                    {Array.isArray(workStations) && workStations.map(ws => (
                                        <option key={ws.id} value={ws.id}>{ws.workstationName} ({ws.workstationNumber})</option>
                                    ))}
                                </select>
                            </FormGroup>

                            <FormGroup label="Operator">
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.operatorId}
                                    onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Operator</option>
                                    {Array.isArray(employees) && employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                    ))}
                                </select>
                            </FormGroup>

                            <FormGroup label="Shift">
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.shift}
                                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                                >
                                    <option value="Day Shift">Day Shift</option>
                                    <option value="Night Shift">Night Shift</option>
                                </select>
                            </FormGroup>

                            <FormGroup label="Cost Center">
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.costCenter}
                                    onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                                    placeholder="Branch/Dept reference"
                                />
                            </FormGroup>

                            <FormGroup label="Cutting Length (cm)">
                                <input
                                    type="number" step="0.01"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.cuttingLengthCm}
                                    onChange={(e) => setFormData({ ...formData, cuttingLengthCm: e.target.value })}
                                    required
                                />
                            </FormGroup>

                            <FormGroup label="Produced Quantity">
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.producedQty}
                                    onChange={(e) => setFormData({ ...formData, producedQty: e.target.value })}
                                    required
                                />
                            </FormGroup>

                            <FormGroup label="Scrap Quantity">
                                <div className="space-y-1">
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={formData.scrapQty}
                                        onChange={(e) => setFormData({ ...formData, scrapQty: e.target.value })}
                                        required
                                    />
                                    {formData.scrapQty && formData.producedQty && (
                                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-tight">
                                            Calculated Scrap: {((formData.scrapQty / (parseInt(formData.producedQty) + parseInt(formData.scrapQty))) * 100).toFixed(1)}%
                                        </p>
                                    )}
                                </div>
                            </FormGroup>

                            <FormGroup label="Start Time">
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    required
                                />
                            </FormGroup>

                            <FormGroup label="End Time">
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    required
                                />
                            </FormGroup>

                            <FormGroup label="Scrap Type">
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.scrapType}
                                    onChange={(e) => setFormData({ ...formData, scrapType: e.target.value })}
                                >
                                    <option value="NON_RETURNABLE">Non-Returnable</option>
                                    <option value="RETURNABLE">Returnable</option>
                                </select>
                            </FormGroup>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormGroup label="Scrap Rate (per Kg)">
                                <input
                                    type="number" step="0.01"
                                    placeholder="Optional"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.scrapRatePerKg}
                                    onChange={(e) => setFormData({ ...formData, scrapRatePerKg: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup label="Remarks">
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                />
                            </FormGroup>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-primary text-white px-8 py-2 rounded-lg font-bold hover:bg-primary-dark transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                {submitting ? 'Saving...' : 'Save Run Details'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-3">Operator / Station</th>
                                    <th className="px-6 py-3">Quantities</th>
                                    <th className="px-6 py-3">Efficiency</th>
                                    <th className="px-6 py-3">Time</th>
                                    <th className="px-6 py-3">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Loading history...</td></tr>
                                ) : activeRuns.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No cutting runs recorded yet</td></tr>
                                ) : activeRuns.map(run => (
                                    <tr key={run.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700">{run.operatorName || 'N/A'}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{run.workStationName || 'Unknown Station'} • {run.shift}</div>
                                            {run.costCenter && <div className="text-[9px] font-bold text-indigo-500 uppercase">{run.costCenter}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 border-r border-slate-100 pr-2">{run.producedQty.toLocaleString()}</span>
                                                <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded leading-none">-{run.scrapQty}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1">Length: {run.cuttingLengthCm} cm</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700">{Math.round(run.productivityPcsPerHour || 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">pcs/hr</span></div>
                                            <div className={`text-[10px] font-bold ${run.scrapPct > 5 ? 'text-red-500' : 'text-green-600'}`}>
                                                {run.scrapPct}% scrap
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-slate-600 font-medium">
                                                {new Date(run.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                {new Date(run.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                {Math.round(Duration.between(OffsetDateTime.parse(run.startTime), OffsetDateTime.parse(run.endTime)).toMinutes())} mins
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {new Date(run.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ label, value, subValue, icon, status }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-start">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                {React.cloneElement(icon, { className: 'w-5 h-5 ' + icon.props.className })}
            </div>
            {status && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${status === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                    }`}>
                    {status}
                </span>
            )}
        </div>
        <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest leading-none mb-1">{label}</p>
            <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">{subValue}</p>
        </div>
    </div>
);

const FormGroup = ({ label, children }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest px-0.5">{label}</label>
        {children}
    </div>
);

// Utility for duration calculation in table (approximate)
const Duration = {
    between: (start, end) => {
        const diff = new Date(end) - new Date(start);
        return {
            toMinutes: () => Math.floor(diff / 60000)
        };
    }
};

const OffsetDateTime = {
    parse: (str) => new Date(str).toISOString()
};

export default WireCuttingSection;
