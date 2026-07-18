import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Save, Layers, Box,
    Trash2, AlertCircle, CheckCircle2,
    Info, Cpu, Palette, Calendar
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const BatchForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const moIdFromQuery = queryParams.get('moId');

    const [loading, setLoading] = useState(false);
    const [mos, setMos] = useState([]);
    const [coils, setCoils] = useState([]);
    const [workStations, setWorkStations] = useState([]);
    const [formData, setFormData] = useState({
        moId: moIdFromQuery || '',
        coilRefId: '',
        hangerTypeId: '',
        color: '',
        plannedQty: '',
        shift: 'Day Shift',
        workStationId: '',
        remarks: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [moResponse, wsResponse] = await Promise.all([
                axios.get(`${API_URL}/production/manufacturing-orders`, { headers, params: { size: 200 } }),
                axios.get(`${API_URL}/production/work-stations`, { headers })
            ]);

            const activeMos = (moResponse.data.content || []).filter(mo =>
                mo.status === 'SCHEDULED' || mo.status === 'IN_PROGRESS' || mo.id === parseInt(moIdFromQuery)
            );
            setMos(Array.isArray(activeMos) ? activeMos : []);
            setWorkStations(Array.isArray(wsResponse.data) ? wsResponse.data : []);

            if (moIdFromQuery) {
                handleMoChange(moIdFromQuery, activeMos);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('Failed to load initial data');
        }
    };

    const handleMoChange = async (moId, moList = mos) => {
        const selectedMo = moList.find(m => m.id === parseInt(moId));
        setFormData(prev => ({
            ...prev,
            moId: moId,
            hangerTypeId: selectedMo?.hangerTypeId || '',
            coilRefId: '' // Reset coil when MO changes
        }));

        if (moId) {
            try {
                const token = localStorage.getItem('token');
                const coilResponse = await axios.get(`${API_URL}/hanger/coil-stock/by-mo/${moId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCoils(coilResponse.data || []);
            } catch (error) {
                console.error('Error fetching coils for MO:', error);
                setCoils([]);
            }
        } else {
            setCoils([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/hanger/batches`, {
                ...formData,
                moId: parseInt(formData.moId),
                coilRefId: formData.coilRefId ? parseInt(formData.coilRefId) : null,
                hangerTypeId: formData.hangerTypeId ? parseInt(formData.hangerTypeId) : null,
                plannedQty: parseInt(formData.plannedQty)
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Production Batch created successfully');
            navigate('/production-dashboard/hanger/batches');
        } catch (error) {
            console.error('Error creating batch:', error);
            toast.error(error.response?.data?.message || 'Failed to create batch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Batches
            </button>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Layers className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">New Production Batch</h1>
                            <p className="text-sm text-slate-500">Initialize a new production run</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Select Order Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Box className="w-4 h-4 text-slate-400" />
                                Manufacturing Order
                            </label>
                            <select
                                required
                                value={formData.moId}
                                onChange={(e) => handleMoChange(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                            >
                                <option value="">Select MO</option>
                                {Array.isArray(mos) && mos.map(mo => (
                                    <option key={mo.id} value={mo.id}>{mo.moNumber} ({mo.status})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-slate-400" />
                                Raw Material (Coil)
                            </label>
                            <select
                                value={formData.coilRefId}
                                onChange={(e) => setFormData({ ...formData, coilRefId: e.target.value })}
                                disabled={!formData.moId}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Select Coil</option>
                                {Array.isArray(coils) && coils.map(coil => (
                                    <option key={coil.id} value={coil.id}>{coil.coilNo} ({coil.remainingWeightKg} Kg left)</option>
                                ))}
                            </select>
                            {!formData.moId ? (
                                <p className="text-[10px] text-slate-400">Select an MO first to see issued coils</p>
                            ) : coils.length === 0 && (
                                <p className="text-[10px] text-orange-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    No coils issued to this MO yet
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Specifications Section */}
                    <div className="pt-6 border-t border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Batch Specifications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Planned Quantity</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="e.g. 1000"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                                    value={formData.plannedQty}
                                    onChange={(e) => setFormData({ ...formData, plannedQty: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-slate-400" />
                                    Color / Variety
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Gloss Black"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    Production Shift
                                </label>
                                <select
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                    value={formData.shift}
                                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                                >
                                    <option value="Day Shift">Day Shift</option>
                                    <option value="Night Shift">Night Shift</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-slate-400" />
                                Work Station
                            </label>
                            <select
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                value={formData.workStationId}
                                onChange={(e) => setFormData({ ...formData, workStationId: e.target.value })}
                            >
                                <option value="">Select Work Station</option>
                                {Array.isArray(workStations) && workStations.map(ws => (
                                    <option key={ws.id} value={ws.id}>
                                        {ws.workstationName} ({ws.workstationNumber})
                                    </option>
                                ))}
                            </select>
                            {workStations.length === 0 && (
                                <p className="text-[10px] text-slate-400">No work stations configured yet</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Remarks</label>
                            <textarea
                                rows="1"
                                placeholder="Additional notes..."
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none"
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Form Footer */}
                    <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Info className="w-4 h-4" />
                            <p className="text-xs">Batch status will be initialized as PENDING and stage as WIRE CUTTING</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? 'Saving...' : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Initialize Batch
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BatchForm;
