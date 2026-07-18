import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings, Save, ArrowLeft, RefreshCw,
    Zap, Users, Percent, HelpCircle, Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CostRateSettings = () => {
    const navigate = useNavigate();
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/hanger/cost-rates`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Ensure we have the basic 3 rates
            const currentRates = res.data;
            const requiredKeys = [
                { key: 'LABOR_HOUR', label: 'Labor Rate per Hour', unit: 'AED / Hr', default: 200 },
                { key: 'MACHINE_HOUR', label: 'Machine Rate per Hour', unit: 'AED / Hr', default: 500 },
                { key: 'OVERHEAD_PCT', label: 'Factory Overhead %', unit: '%', default: 15 }
            ];

            const initialized = requiredKeys.map(req => {
                const existing = currentRates.find(r => r.rateKey === req.key);
                return existing || {
                    rateKey: req.key,
                    rateLabel: req.label,
                    rateValue: req.default,
                    unit: req.unit,
                    isActive: true,
                    effectiveFrom: new Date().toISOString().split('T')[0]
                };
            });
            setRates(initialized);
        } catch (error) {
            console.error('Error fetching rates:', error);
            toast.error('Failed to load cost configurations');
        } finally {
            setLoading(false);
        }
    };

    const handleRateChange = (key, value) => {
        setRates(prev => prev.map(r =>
            r.rateKey === key ? { ...r, rateValue: parseFloat(value) || 0 } : r
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            for (const rate of rates) {
                if (rate.id) {
                    await axios.put(`${API_URL}/hanger/cost-rates/${rate.id}`, rate, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } else {
                    await axios.post(`${API_URL}/hanger/cost-rates`, rate, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            }
            toast.success('Production rates updated successfully');
            fetchRates();
        } catch (error) {
            console.error('Error saving rates:', error);
            toast.error('Failed to update rates');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Configurations...</p>
        </div>
    );

    return (
        <div className="p-6 w-full space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </button>
                        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            Cost Rate Settings
                        </h1>
                    </div>
                    <p className="text-slate-500 text-xs font-bold mt-1 ml-12 uppercase tracking-widest">
                        Configure production benchmarks for automated costing
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-black hover:bg-primary-dark transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Configurations
                </button>
            </div>

            {/* Config Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Direct Production Rates
                    </h3>

                    {rates.filter(r => r.rateKey !== 'OVERHEAD_PCT').map(rate => (
                        <div key={rate.rateKey} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-primary/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-black text-slate-700">{rate.rateLabel}</label>
                                <HelpCircle className="w-4 h-4 text-slate-300 cursor-help" />
                            </div>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">AED</span>
                                <input
                                    type="number"
                                    value={rate.rateValue}
                                    onChange={(e) => handleRateChange(rate.rateKey, e.target.value)}
                                    className="w-full pl-16 pr-16 py-3 bg-slate-50 border-none rounded-xl text-lg font-black text-slate-900 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">{rate.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Percent className="w-4 h-4 text-indigo-500" />
                        Overhead & Policy
                    </h3>

                    {rates.filter(r => r.rateKey === 'OVERHEAD_PCT').map(rate => (
                        <div key={rate.rateKey} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-indigo-200 transition-colors">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-black text-slate-700">{rate.rateLabel}</label>
                                <Zap className="w-4 h-4 text-indigo-300" />
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={rate.rateValue}
                                    onChange={(e) => handleRateChange(rate.rateKey, e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-lg font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">{rate.unit}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold leading-relaxed px-1">
                                Applied on the sum of Direct Material and Labor costs to cover factory rent, utility bills, and indirect staff salaries.
                            </p>
                        </div>
                    ))}

                    <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
                        <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-2">Notice</h4>
                        <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                            Changes to these rates will update cost estimations for all existing batches retroactively. Ensure data accuracy before saving.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CostRateSettings;
