import React, { useState, useEffect } from 'react';
import {
    Activity, Plus, User, Timer, BarChart3,
    AlertCircle, CheckCircle2, History, X, Settings2, Ruler, Printer
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const BendingSection = ({ batch, onActionSuccess }) => {
    const [jobCards, setJobCards] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [workstations, setWorkstations] = useState([]);

    const [formData, setFormData] = useState({
        workstationId: '',
        toolDieNo: '',
        operatorId: '',
        shift: 'Day Shift',
        targetQty: '',
        producedQty: '',
        rejectedQty: '0',
        reworkQty: '0',
        laborHours: '',
        workstationRunHours: '',
        breakdownTime: '0',
        actualShoulderWidthMm: '',
        actualHookSizeMm: '',
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
            const res = await axios.get(`${API_URL}/hanger/job-cards/by-batch/${batch.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobCards(res.data || []);
        } catch (error) {
            console.error('Error fetching job cards:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch Employees
            const empRes = await axios.get(`${API_URL}/employees/all`, { headers });
            setEmployees(Array.isArray(empRes.data) ? empRes.data : []);

            // Fetch Workstations
            const wsRes = await axios.get(`${API_URL}/production/work-stations`, { headers });
            setWorkstations(Array.isArray(wsRes.data) ? wsRes.data : []);

            // Auto-fill from batch if possible
            if (batch.shift) {
                setFormData(prev => ({ ...prev, shift: batch.shift }));
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    // Convert datetime-local → OffsetDateTime with seconds + timezone
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
            await axios.post(`${API_URL}/hanger/job-cards`, {
                ...formData,
                batchId: batch.id,
                startTime: toOffsetDateTime(formData.startTime),
                endTime: toOffsetDateTime(formData.endTime)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Job Card logged successfully');
            setShowForm(false);
            fetchData();
            if (onActionSuccess) onActionSuccess();
        } catch (error) {
            console.error('Error logging job card:', error);
            toast.error(error.response?.data?.message || 'Failed to log job card');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadPdf = async (jcId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/hanger/job-cards/${jcId}/pdf`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `JobCard_${jcId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading Job Card PDF:', error);
            toast.error('Failed to download Job Card PDF');
        }
    };

    // Derived Stats
    const activeCards = Array.isArray(jobCards) ? jobCards : [];
    const totalProduced = activeCards.reduce((sum, jc) => sum + (jc.producedQty || 0), 0);
    const totalRejected = activeCards.reduce((sum, jc) => sum + (jc.rejectedQty || 0), 0);
    const avgOEE = activeCards.length > 0
        ? activeCards.reduce((sum, jc) => sum + (jc.oeePct || 0), 0) / activeCards.length
        : 0;

    const passRate = totalProduced > 0
        ? ((totalProduced - totalRejected) / totalProduced) * 100
        : 0;

    // Live OEE Preview Logic (Simplified)
    const calculateLiveOEE = () => {
        const { producedQty, rejectedQty, workstationRunHours, breakdownTime } = formData;
        const ht = batch.hangerType;
        if (!producedQty || !workstationRunHours || !ht) return null;

        const produced = parseFloat(producedQty);
        const rejected = parseFloat(rejectedQty || 0);
        const runHrs = parseFloat(workstationRunHours);
        const breakdown = parseFloat(breakdownTime || 0);
        const uptime = runHrs - breakdown;

        if (runHrs <= 0 || uptime <= 0) return 0;

        const availability = (uptime / runHrs) * 100;
        const theoreticalMax = (uptime * 3600) / (ht.standardCycleTimeSec || 2.5);
        const performance = theoreticalMax > 0 ? (produced / theoreticalMax) * 100 : 0;
        const quality = ((produced - rejected) / produced) * 100;

        const oee = (availability * performance * quality) / 10000;
        return oee.toFixed(1);
    };

    const liveOEE = calculateLiveOEE();

    return (
        <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    label="Good Pieces"
                    value={(totalProduced - totalRejected).toLocaleString()}
                    subValue={`Total Produced: ${totalProduced}`}
                    icon={<CheckCircle2 className="text-green-500" />}
                />
                <StatCard
                    label="OEE Average"
                    value={`${avgOEE.toFixed(1)}%`}
                    subValue="Overall Efficiency"
                    icon={<Activity className="text-primary" />}
                    status={avgOEE >= 85 ? 'success' : avgOEE >= 65 ? 'warning' : 'danger'}
                />
                <StatCard
                    label="Quality Rate"
                    value={`${passRate.toFixed(1)}%`}
                    subValue={`${totalRejected} Rejections`}
                    icon={<AlertCircle className="text-orange-500" />}
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
                        <History className="w-4 h-4 text-primary" />
                        Job Card History
                    </h3>
                    {!showForm && batch.status !== 'COMPLETED' && batch.status !== 'CANCELLED' && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Log New Job Card
                        </button>
                    )}
                </div>

                {showForm ? (
                    <form onSubmit={handleSubmit} className="p-6 bg-slate-50/30 space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-slate-700">Record Bending Job Card</h4>
                            <div className="flex items-center gap-4">
                                {liveOEE !== null && (
                                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-primary/20 shadow-sm">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Projected OEE:</span>
                                        <span className={`text-sm font-black ${liveOEE >= 85 ? 'text-green-600' : liveOEE >= 65 ? 'text-orange-600' : 'text-red-600'}`}>
                                            {liveOEE}%
                                        </span>
                                    </div>
                                )}
                                <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

                            <FormGroup label="Tool/Die No">
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.toolDieNo}
                                    onChange={(e) => setFormData({ ...formData, toolDieNo: e.target.value })}
                                    placeholder="e.g. TD-42"
                                />
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

                            <FormGroup label="Produced Qty">
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.producedQty}
                                    onChange={(e) => setFormData({ ...formData, producedQty: e.target.value })}
                                    required
                                />
                            </FormGroup>

                            <FormGroup label="Rejected Qty">
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.rejectedQty}
                                    onChange={(e) => setFormData({ ...formData, rejectedQty: e.target.value })}
                                />
                            </FormGroup>

                            <FormGroup label="Rework Qty">
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.reworkQty}
                                    onChange={(e) => setFormData({ ...formData, reworkQty: e.target.value })}
                                />
                            </FormGroup>

                            <FormGroup label="Target Qty">
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.targetQty}
                                    onChange={(e) => setFormData({ ...formData, targetQty: e.target.value })}
                                    placeholder={`Copied from Batch: ${batch.plannedQty}`}
                                />
                            </FormGroup>

                            <FormGroup label="Workstation Run Hours">
                                <input
                                    type="number" step="0.1"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.workstationRunHours}
                                    onChange={(e) => setFormData({ ...formData, workstationRunHours: e.target.value })}
                                    required
                                />
                            </FormGroup>

                            <FormGroup label="Breakdown Time (Hrs)">
                                <input
                                    type="number" step="0.1"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.breakdownTime}
                                    onChange={(e) => setFormData({ ...formData, breakdownTime: e.target.value })}
                                />
                            </FormGroup>

                            <FormGroup label="Labour Hours">
                                <input
                                    type="number" step="0.1"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.laborHours}
                                    onChange={(e) => setFormData({ ...formData, laborHours: e.target.value })}
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

                            <FormGroup label="Actual Shoulder Width (mm)">
                                <input
                                    type="number" step="0.01"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.actualShoulderWidthMm}
                                    onChange={(e) => setFormData({ ...formData, actualShoulderWidthMm: e.target.value })}
                                    placeholder={`Standard: ${batch.hangerType?.standardWidthCm * 10}mm`}
                                />
                            </FormGroup>

                            <FormGroup label="Actual Hook Size (mm)">
                                <input
                                    type="number" step="0.01"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.actualHookSizeMm}
                                    onChange={(e) => setFormData({ ...formData, actualHookSizeMm: e.target.value })}
                                    placeholder={`Standard: ${batch.hangerType?.standardHookCm * 10}mm`}
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
                                {submitting ? 'Saving...' : 'Save Job Card'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-3">JC No / Workstation</th>
                                    <th className="px-6 py-3">Operator</th>
                                    <th className="px-6 py-3">Production Qty</th>
                                    <th className="px-6 py-3">OEE %</th>
                                    <th className="px-6 py-3">Dimensions</th>
                                    <th className="px-6 py-3">Created</th>
                                    <th className="px-6 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading history...</td></tr>
                                ) : activeCards.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">No job cards recorded for this batch</td></tr>
                                ) : activeCards.map(jc => (
                                    <tr key={jc.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700">{jc.jobCardNo}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{jc.workstationName || 'Unknown WS'} • {jc.shift}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <User className="w-3 h-3 text-slate-400" />
                                                </div>
                                                <span className="font-medium text-slate-700">{jc.operatorName || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900">{jc.producedQty.toLocaleString()}</span>
                                                <div className="flex flex-col gap-0.5">
                                                    {jc.rejectedQty > 0 && <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1 py-0.5 rounded leading-none">-{jc.rejectedQty} rej</span>}
                                                    {jc.reworkQty > 0 && <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-1 py-0.5 rounded leading-none">-{jc.reworkQty} rew</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`font-black ${jc.oeePct >= 85 ? 'text-green-600' : jc.oeePct >= 65 ? 'text-orange-600' : 'text-red-600'}`}>
                                                {jc.oeePct}%
                                            </div>
                                            <div className="flex gap-1 mt-0.5">
                                                <span className="text-[8px] text-slate-400 uppercase font-bold">A:{Math.round(jc.availabilityPct)}%</span>
                                                <span className="text-[8px] text-slate-400 uppercase font-bold">P:{Math.round(jc.performancePct)}%</span>
                                                <span className="text-[8px] text-slate-400 uppercase font-bold">Q:{Math.round(jc.qualityPct)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit ${jc.dimensionPass ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {jc.dimensionPass ? <Settings2 className="w-3.5 h-3.5" /> : <Ruler className="w-3.5 h-3.5" />}
                                                <span className="text-[10px] font-bold uppercase">{jc.dimensionPass ? 'Pass' : 'Fail'}</span>
                                            </div>
                                            <div className="text-[9px] text-slate-400 mt-1">
                                                W: {jc.actualShoulderWidthMm}mm / H: {jc.actualHookSizeMm}mm
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {new Date(jc.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDownloadPdf(jc.id)}
                                                className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                title="Print Job Card"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </button>
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

export default BendingSection;
