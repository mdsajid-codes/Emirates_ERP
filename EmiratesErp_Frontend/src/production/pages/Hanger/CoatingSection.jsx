import React, { useState, useEffect } from 'react';
import {
    Activity, Plus, User, Timer, BarChart3,
    AlertCircle, CheckCircle2, History, X, Paintbrush
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CoatingSection = ({ batch, onActionSuccess }) => {
    const [coatingLogs, setCoatingLogs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [workstations, setWorkstations] = useState([]);

    const [formData, setFormData] = useState({
        coatingType: 'POWDER',
        colorCode: batch.color || '',
        workstationId: '',
        operatorId: '',
        shift: 'Day Shift',
        inputQty: '',
        producedQty: '',
        rejectedQty: '0',
        reworkQty: '0',
        paintConsumedKg: '',
        chemicalBatch: '',
        temperatureC: '',
        coatingThicknessMm: '',
        durationMin: '',
        startTime: '',
        endTime: '',
        remarks: ''
    });

    useEffect(() => {
        fetchData();
        fetchInitialData();
    }, [batch.id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/hanger/coating-logs/by-batch/${batch.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoatingLogs(res.data || []);
        } catch (error) {
            console.error('Error fetching coating logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const empRes = await axios.get(`${API_URL}/employees/all`, { headers });
            setEmployees(Array.isArray(empRes.data) ? empRes.data : []);

            const wsRes = await axios.get(`${API_URL}/production/work-stations`, { headers });
            setWorkstations(Array.isArray(wsRes.data) ? wsRes.data : []);

            if (batch.shift) {
                setFormData(prev => ({ ...prev, shift: batch.shift }));
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
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
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/hanger/coating-logs`, {
                ...formData,
                batchId: batch.id,
                startTime: toOffsetDateTime(formData.startTime),
                endTime: toOffsetDateTime(formData.endTime)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Coating Log saved successfully');
            setShowForm(false);
            fetchData();
            if (onActionSuccess) onActionSuccess();
        } catch (error) {
            console.error('Error saving coating log:', error);
            toast.error(error.response?.data?.message || 'Failed to save coating log');
        } finally {
            setSubmitting(false);
        }
    };

    // Derived Stats
    const activeLogs = Array.isArray(coatingLogs) ? coatingLogs : [];
    const totalInput = activeLogs.reduce((sum, cl) => sum + (cl.inputQty || 0), 0);
    const totalProduced = activeLogs.reduce((sum, cl) => sum + (cl.producedQty || 0), 0);
    const totalRejected = activeLogs.reduce((sum, cl) => sum + (cl.rejectedQty || 0), 0);
    const avgRejectionPct = activeLogs.length > 0
        ? activeLogs.reduce((sum, cl) => sum + (cl.rejectionPct || 0), 0) / activeLogs.length
        : 0;

    const passRate = totalProduced > 0 && (totalProduced + totalRejected) > 0
        ? (totalProduced / (totalProduced + totalRejected)) * 100
        : 100;

    // Live Quality Preview
    const calculateLiveQuality = () => {
        const { inputQty, rejectedQty } = formData;
        if (!inputQty || inputQty <= 0) return null;

        const input = parseFloat(inputQty);
        const rejected = parseFloat(rejectedQty || 0);

        const rejectionPct = (rejected / input) * 100;
        return rejectionPct.toFixed(1);
    };

    const liveRejection = calculateLiveQuality();
    const maxDefect = batch.hangerType?.maxDefectPct || 2.0;

    return (
        <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    label="Coated Pieces"
                    value={totalProduced.toLocaleString()}
                    subValue={`Input: ${totalInput}`}
                    icon={<CheckCircle2 className="text-green-500" />}
                />
                <StatCard
                    label="Defect Rate"
                    value={`${avgRejectionPct.toFixed(1)}%`}
                    subValue={`Target: < ${maxDefect}%`}
                    icon={<AlertCircle className="text-orange-500" />}
                    status={avgRejectionPct <= maxDefect ? 'success' : 'danger'}
                />
                <StatCard
                    label="Quality Pass"
                    value={`${passRate.toFixed(1)}%`}
                    subValue={`${totalRejected} Rejections`}
                    icon={<Activity className="text-primary" />}
                    status={passRate >= 98 ? 'success' : 'warning'}
                />
                <StatCard
                    label="Batch Progress"
                    value={`${Math.round((totalProduced / batch.plannedQty) * 100)}%`}
                    subValue={`${totalProduced}/${batch.plannedQty}`}
                    icon={<BarChart3 className="text-blue-500" />}
                />
            </div>

            {/* Actions & List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Paintbrush className="w-4 h-4 text-primary" />
                        Coating / Painting Logs
                    </h3>
                    {!showForm && batch.status !== 'COMPLETED' && batch.status !== 'CANCELLED' &&
                        (batch.currentStage === 'BENDING' || batch.currentStage === 'COATING') && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Log New Coating Run
                            </button>
                        )}
                </div>

                {showForm ? (
                    <form onSubmit={handleSubmit} className="p-6 bg-slate-50/30 space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-slate-700">Record Coating Log</h4>
                            <div className="flex items-center gap-4">
                                {liveRejection !== null && (
                                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-primary/20 shadow-sm">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Projected Defect Rate:</span>
                                        <span className={`text-sm font-black ${parseFloat(liveRejection) <= maxDefect ? 'text-green-600' : 'text-red-600'}`}>
                                            {liveRejection}%
                                        </span>
                                    </div>
                                )}
                                <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <FormGroup label="Coating Type">
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-indigo-50/50 font-bold"
                                    value={formData.coatingType}
                                    onChange={(e) => setFormData({ ...formData, coatingType: e.target.value })}
                                >
                                    <option value="POWDER">Powder Coating</option>
                                    <option value="ELECTROPLATE">Electroplating</option>
                                    <option value="LACQUER">Lacquer/Dip</option>
                                </select>
                            </FormGroup>

                            <FormGroup label="Color / Finish">
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.colorCode}
                                    onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                                    placeholder="e.g. RAL 9005"
                                    required
                                />
                            </FormGroup>

                            <FormGroup label="Workstation">
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.workstationId}
                                    onChange={(e) => setFormData({ ...formData, workstationId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Workstation</option>
                                    {Array.isArray(workstations) && workstations.map(ws => (
                                        <option key={ws.id} value={ws.id}>
                                            {ws.workstationName} ({ws.workstationNumber})
                                        </option>
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

                            <FormGroup label="Input Qty (Into Line)">
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.inputQty}
                                    onChange={(e) => setFormData({ ...formData, inputQty: e.target.value })}
                                    required
                                    placeholder="Total hung on hooks"
                                />
                            </FormGroup>

                            <FormGroup label="Produced Qty (Good)">
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none border-green-200 bg-green-50/20"
                                    value={formData.producedQty}
                                    onChange={(e) => setFormData({ ...formData, producedQty: e.target.value })}
                                    required
                                />
                            </FormGroup>

                            <FormGroup label="Rejected Qty (Paint Defect)">
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none border-red-200 bg-red-50/20"
                                    value={formData.rejectedQty}
                                    onChange={(e) => setFormData({ ...formData, rejectedQty: e.target.value })}
                                />
                            </FormGroup>

                            <FormGroup label="Rework Qty (Needs Re-coat)">
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none border-orange-200 bg-orange-50/20"
                                    value={formData.reworkQty}
                                    onChange={(e) => setFormData({ ...formData, reworkQty: e.target.value })}
                                />
                            </FormGroup>

                            <FormGroup label="Paint Consumed (Kg)">
                                <input
                                    type="number" step="0.001"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none bg-indigo-50/30 font-bold"
                                    value={formData.paintConsumedKg}
                                    onChange={(e) => setFormData({ ...formData, paintConsumedKg: e.target.value })}
                                    placeholder="e.g. 15.5"
                                />
                            </FormGroup>

                            <FormGroup label="Chemical/Paint Batch">
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.chemicalBatch}
                                    onChange={(e) => setFormData({ ...formData, chemicalBatch: e.target.value })}
                                    placeholder="Batch reference"
                                />
                            </FormGroup>

                            <FormGroup label="Temperature (°C)">
                                <input
                                    type="number" step="0.1"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.temperatureC}
                                    onChange={(e) => setFormData({ ...formData, temperatureC: e.target.value })}
                                    placeholder="Oven Temp"
                                />
                            </FormGroup>

                            <FormGroup label="Coating Thickness (mm)">
                                <input
                                    type="number" step="0.001"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-blue-50/20"
                                    value={formData.coatingThicknessMm}
                                    onChange={(e) => setFormData({ ...formData, coatingThicknessMm: e.target.value })}
                                    placeholder="Measurement"
                                />
                            </FormGroup>

                            <FormGroup label="Duration (Mins)">
                                <input
                                    type="number" step="0.1"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.durationMin}
                                    onChange={(e) => setFormData({ ...formData, durationMin: e.target.value })}
                                    placeholder="Process time"
                                />
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

                            <FormGroup label="Remarks">
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none md:col-span-2"
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    placeholder="Visual defects, color matching notes..."
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
                                {submitting ? 'Saving...' : 'Save Coating Log'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-3">Log No / WS</th>
                                    <th className="px-6 py-3">Type & Color</th>
                                    <th className="px-6 py-3">Qty Data</th>
                                    <th className="px-6 py-3">Quality Pass</th>
                                    <th className="px-6 py-3">Paint (Kg)</th>
                                    <th className="px-6 py-3">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading history...</td></tr>
                                ) : activeLogs.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">No coating logs recorded for this batch</td></tr>
                                ) : activeLogs.map(cl => (
                                    <tr key={cl.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700">{cl.coatingLogNo}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{cl.workstationName || 'Unknown WS'} • {cl.shift}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Paintbrush className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="font-bold text-slate-700">{cl.coatingType}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-0.5 ml-5.5 font-medium">{cl.colorCode || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-green-600">{cl.producedQty?.toLocaleString()}</span>
                                                <span className="text-slate-300">/</span>
                                                <span className="font-medium text-slate-500 text-xs">{cl.inputQty?.toLocaleString()}</span>
                                                <div className="flex flex-col gap-0.5 ml-2">
                                                    {cl.rejectedQty > 0 && <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1 py-0.5 rounded leading-none">-{cl.rejectedQty} rej</span>}
                                                    {cl.reworkQty > 0 && <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-1 py-0.5 rounded leading-none">-{cl.reworkQty} rew</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit ${cl.colorPass ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {cl.colorPass ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                                <span className="text-[10px] font-bold uppercase">{cl.colorPass ? 'Pass' : 'Fail'}</span>
                                            </div>
                                            <div className="text-[9px] text-slate-400 mt-1 font-bold">
                                                {cl.rejectionPct}% Rej
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-700">{cl.paintConsumedKg ? `${cl.paintConsumedKg} kg` : '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {new Date(cl.createdAt).toLocaleDateString()}
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
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${status === 'success' ? 'bg-green-100 text-green-600' :
                    status === 'warning' ? 'bg-orange-100 text-orange-600' :
                        'bg-red-100 text-red-600'
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

export default CoatingSection;
