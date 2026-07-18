import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    ClipboardCheck,
    History,
    Plus,
    Save,
    FileText,
    TrendingUp,
    ShieldCheck,
    Truck
} from 'lucide-react';
import { toast } from 'react-toastify';
const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const QcInspectionSection = ({ batch, onUpdate }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [completing, setCompleting] = useState(false);

    const [formData, setFormData] = useState({
        inspectorId: '',
        sampleSize: batch.hangerType?.minQcSampleSize || 300,
        inspectedQty: '',
        passedQty: '',
        rejectedQty: 0,
        reworkQty: 0,
        defectType: '',
        qcResult: 'PASS',
        loadTestPassed: true,
        remarks: '',
        scrapReasonCode: '',
        materialWeightLost: '',
        testType: '',
        measuredValue: ''
    });

    useEffect(() => {
        fetchLogs();
        fetchEmployees();
    }, [batch.id]);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/hanger/qc-logs/by-batch/${batch.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching QC logs:', error);
            setLogs([]);
        }
    };

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/employees/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setEmployees([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const newData = { ...prev, [name]: val };

            // Auto-calculate rejected if inspected and passed are provided
            if (name === 'inspectedQty' || name === 'passedQty') {
                const inspected = parseInt(name === 'inspectedQty' ? value : prev.inspectedQty) || 0;
                const passed = parseInt(name === 'passedQty' ? value : prev.passedQty) || 0;
                if (inspected > 0) {
                    newData.rejectedQty = Math.max(0, inspected - passed - (parseInt(prev.reworkQty) || 0));
                }
            }

            // Auto-set Result based on rejectedQty and tolerances
            if (name === 'inspectedQty' || name === 'passedQty' || name === 'rejectedQty') {
                const inspected = parseInt(name === 'inspectedQty' ? value : newData.inspectedQty) || 0;
                const rejected = parseInt(name === 'rejectedQty' ? value : newData.rejectedQty) || 0;

                if (inspected > 0) {
                    const defectRate = (rejected / inspected) * 100;
                    const maxAllowed = batch.hangerType?.maxDefectPct || 2.0;

                    if (defectRate === 0) newData.qcResult = 'PASS';
                    else if (defectRate <= maxAllowed) newData.qcResult = 'CONDITIONAL_PASS';
                    else newData.qcResult = 'FAIL';
                }
            }

            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/hanger/qc-logs`, {
                ...formData,
                batchId: batch.id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('QC Inspection logged successfully');
            setShowForm(false);
            fetchLogs();
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error logging QC data');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCompleteBatch = async () => {
        if (!window.confirm('Are you sure you want to complete this batch? This will move it to DONE status.')) return;

        setCompleting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/hanger/qc-logs/complete-batch/${batch.id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Batch marked as COMPLETE');
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error completing batch. Ensure at least one PASS/CONDITIONAL_PASS QC log exists.');
        } finally {
            setCompleting(false);
        }
    };

    const activeLogs = Array.isArray(logs) ? logs : [];

    const stats = {
        totalInspected: activeLogs.reduce((sum, log) => sum + (log.inspectedQty || 0), 0),
        totalPassed: activeLogs.reduce((sum, log) => sum + (log.passedQty || 0), 0),
        totalRejected: activeLogs.reduce((sum, log) => sum + (log.rejectedQty || 0), 0),
        avgDefectRate: activeLogs.length > 0
            ? (activeLogs.reduce((sum, log) => sum + (log.defectPct || 0), 0) / activeLogs.length).toFixed(2)
            : 0,
        totalMaterialLost: activeLogs.reduce((sum, log) => sum + (log.materialWeightLost || 0), 0).toFixed(3)
    };

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2 text-slate-500">
                        <ClipboardCheck size={18} />
                        <span className="text-sm font-medium">Total Inspected</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{stats.totalInspected}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2 text-emerald-500">
                        <CheckCircle size={18} />
                        <span className="text-sm font-medium text-slate-500">Total Passed</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">{stats.totalPassed}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2 text-rose-500">
                        <XCircle size={18} />
                        <span className="text-sm font-medium text-slate-500">Total Rejected</span>
                    </div>
                    <div className="text-2xl font-bold text-rose-600">{stats.totalRejected}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2 text-blue-500">
                        <TrendingUp size={18} />
                        <span className="text-sm font-medium text-slate-500">Avg Defect Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{stats.avgDefectRate}%</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2 text-amber-500">
                        <AlertTriangle size={18} />
                        <span className="text-sm font-medium text-slate-500">Material Lost (kg)</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-600">{stats.totalMaterialLost} kg</div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="text-indigo-500" />
                    Quality Control Logs
                </h3>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        {showForm ? <XCircle size={18} /> : <Plus size={18} />}
                        {showForm ? 'Cancel' : 'New QC Inspection'}
                    </button>
                    {batch.status !== 'COMPLETED' && (
                        <button
                            onClick={handleCompleteBatch}
                            disabled={completing}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {completing ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Truck size={18} />}
                            Complete Batch & Finish
                        </button>
                    )}
                </div>
            </div>

            {/* Inspection Form */}
            {showForm && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Inspector</label>
                            <select
                                name="inspectorId"
                                value={formData.inspectorId}
                                onChange={handleInputChange}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            >
                                <option value="">Select Inspector</option>
                                {Array.isArray(employees) && employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.firstName} {emp.lastName} ({emp.employeeCode})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sample Size</label>
                            <input
                                type="number"
                                name="sampleSize"
                                value={formData.sampleSize}
                                onChange={handleInputChange}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Inspected</label>
                            <input
                                type="number"
                                name="inspectedQty"
                                value={formData.inspectedQty}
                                onChange={handleInputChange}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 text-emerald-600">Quantity Passed</label>
                            <input
                                type="number"
                                name="passedQty"
                                value={formData.passedQty}
                                onChange={handleInputChange}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-emerald-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 text-rose-600">Quantity Rejected</label>
                            <input
                                type="number"
                                name="rejectedQty"
                                value={formData.rejectedQty}
                                onChange={handleInputChange}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-rose-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity for Rework</label>
                            <input
                                type="number"
                                name="reworkQty"
                                value={formData.reworkQty}
                                onChange={handleInputChange}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">QC Result</label>
                            <select
                                name="qcResult"
                                value={formData.qcResult}
                                onChange={handleInputChange}
                                className={`w-full p-2.5 bg-white border rounded-lg focus:ring-2 outline-none ${formData.qcResult === 'PASS' ? 'border-emerald-300 text-emerald-700 focus:ring-emerald-500' :
                                    formData.qcResult === 'FAIL' ? 'border-rose-300 text-rose-700 focus:ring-rose-500' :
                                        'border-amber-300 text-amber-700 focus:ring-amber-500'
                                    }`}
                                required
                            >
                                <option value="PASS">PASS (Zero Defects)</option>
                                <option value="CONDITIONAL_PASS">CONDITIONAL PASS (Within Tolerance)</option>
                                <option value="FAIL">FAIL (Above Tolerance)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Defect Type</label>
                            <input
                                type="text"
                                name="defectType"
                                value={formData.defectType}
                                onChange={handleInputChange}
                                placeholder="e.g. Coating peeling, Bent hook"
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Scrap Reason Code</label>
                            <select
                                name="scrapReasonCode"
                                value={formData.scrapReasonCode}
                                onChange={handleInputChange}
                                className="w-full p-2.5 bg-white border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">Select Reason</option>
                                <option value="FLASH">FLASH (Excess material)</option>
                                <option value="SHORT_SHOT">SHORT SHOT (Incomplete fill)</option>
                                <option value="COLOR_BLEED">COLOR BLEED (Inconsistency)</option>
                                <option value="HOOK_TENSION">HOOK TENSION (Fail)</option>
                                <option value="WEIGHT_FAIL">WEIGHT FAIL</option>
                                <option value="SURFACE_SCRATCH">SURFACE SCRATCH</option>
                                <option value="WARPING">WARPING</option>
                                <option value="OTHER">OTHER</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Material Weight Lost (kg)</label>
                            <input
                                type="number"
                                step="0.001"
                                name="materialWeightLost"
                                value={formData.materialWeightLost}
                                onChange={handleInputChange}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Audit Test Type</label>
                            <select
                                name="testType"
                                value={formData.testType}
                                onChange={handleInputChange}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">Select Test</option>
                                <option value="Hook Pull Test">Hook Pull Test</option>
                                <option value="Weight Capacity">Weight Capacity</option>
                                <option value="Dimensional Check">Dimensional Check</option>
                                <option value="Visual Inspection">Visual Inspection</option>
                                <option value="Load Test">Load Test</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Measured Value</label>
                            <input
                                type="number"
                                step="0.001"
                                name="measuredValue"
                                value={formData.measuredValue}
                                onChange={handleInputChange}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="flex items-center pt-8">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="loadTestPassed"
                                        checked={formData.loadTestPassed}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.loadTestPassed ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.loadTestPassed ? 'translate-x-4' : ''}`}></div>
                                </div>
                                <span className="text-sm font-medium text-slate-700">Load Test Passed?</span>
                            </label>
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                rows="2"
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            ></textarea>
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50"
                            >
                                {submitting ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save size={18} />}
                                Save Inspection Log
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Logs History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Log No</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Inspector</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Results (P/R/T)</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Scrap Reason</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Defect %</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Load Test</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {activeLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-slate-400 italic">No QC inspection logs found for this batch.</td>
                                </tr>
                            ) : (
                                activeLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700">{log.qcLogNo}</td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">
                                            {log.passedQty} / {log.rejectedQty} / {log.reworkQty}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-600 font-medium">
                                                {log.scrapReasonCode ? log.scrapReasonCode.replace('_', ' ') : (log.defectType || '--')}
                                            </span>
                                            {log.materialWeightLost > 0 && (
                                                <div className="text-[10px] text-rose-500 font-bold">{log.materialWeightLost} kg lost</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">{log.inspectorName}</td>
                                        <td className="px-6 py-4">
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-semibold ${log.defectPct > (batch.hangerType?.maxDefectPct || 2.0) ? 'text-rose-600' : 'text-slate-700'
                                                }`}>
                                                {log.defectPct}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${log.qcResult === 'PASS' ? 'bg-emerald-100 text-emerald-700' :
                                                log.qcResult === 'FAIL' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {log.qcResult === 'PASS' && <CheckCircle size={12} />}
                                                {log.qcResult === 'FAIL' && <XCircle size={12} />}
                                                {log.qcResult === 'CONDITIONAL_PASS' && <AlertTriangle size={12} />}
                                                {log.qcResult.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {log.loadTestPassed ? (
                                                <div className="text-emerald-500 flex justify-center"><CheckCircle size={18} /></div>
                                            ) : (
                                                <div className="text-rose-500 flex justify-center"><XCircle size={18} /></div>
                                            )}
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

export default QcInspectionSection;
