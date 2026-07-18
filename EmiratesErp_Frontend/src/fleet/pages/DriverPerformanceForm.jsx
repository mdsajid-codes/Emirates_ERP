import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  X,
  Save,
  Trophy,
  Calendar,
  User,
  Zap,
  Target,
  BarChart3,
  Calculator,
  AlertCircle,
  FileText,
  TrendingUp,
  History,
  Info,
  Fuel
} from 'lucide-react';
import { toast } from 'react-toastify';
import { driverPerformanceApi } from '../services/driverPerformanceApi';

export default function DriverPerformanceForm({ isOpen, onClose, onSave, initialData, driverId }) {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [drivers, setDrivers] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [formData, setFormData] = useState({
    driverId: '',
    evaluationPeriod: new Date().toISOString().slice(0, 7), // YYYY-MM
    tripsCompleted: 0,
    onTimeDeliveryPercent: 100,
    incidentsCount: 0,
    fuelEfficiencyScore: 0,
    incentiveAmount: 0,
    penaltyAmount: 0,
    remarks: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        incentiveAmount: initialData.incentiveAmount || 0,
        penaltyAmount: initialData.penaltyAmount || 0,
        remarks: initialData.remarks || ''
      });
    } else {
      setFormData({
        driverId: driverId || '',
        evaluationPeriod: new Date().toISOString().slice(0, 7),
        tripsCompleted: 0,
        onTimeDeliveryPercent: 100,
        incidentsCount: 0,
        fuelEfficiencyScore: 0,
        incentiveAmount: 0,
        penaltyAmount: 0,
        remarks: ''
      });
    }
  }, [initialData, isOpen, driverId]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await axios.get(`${API_URL}/fleet/drivers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setDrivers(response.data.content || []);
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };
    if (isOpen) fetchDrivers();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculate = async () => {
    if (!formData.driverId || !formData.evaluationPeriod) {
      toast.warning('Please select a driver and period first');
      return;
    }

    try {
      setIsCalculating(true);
      const data = await driverPerformanceApi.calculateMetrics(formData.driverId, formData.evaluationPeriod);
      setFormData(prev => ({
        ...prev,
        ...data,
        incentiveAmount: prev.incentiveAmount || data.incentiveAmount || 0,
        penaltyAmount: prev.penaltyAmount || data.penaltyAmount || 0,
        remarks: prev.remarks || data.remarks || ''
      }));
      toast.success('Metrics calculated successfully');
    } catch (error) {
      console.error('Error calculating metrics:', error);
      toast.error('Failed to calculate metrics');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        driverId: Number(formData.driverId),
        tripsCompleted: Number(formData.tripsCompleted),
        onTimeDeliveryPercent: Number(formData.onTimeDeliveryPercent),
        incidentsCount: Number(formData.incidentsCount),
        fuelEfficiencyScore: Number(formData.fuelEfficiencyScore),
        incentiveAmount: Number(formData.incentiveAmount),
        penaltyAmount: Number(formData.penaltyAmount)
      };

      await driverPerformanceApi.savePerformance(payload);
      toast.success('Performance record saved');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving performance:', error);
      toast.error('Failed to save performance record');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-theme shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-theme text-primary">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {initialData ? 'Update Evaluation' : 'New Performance Evaluation'}
              </h2>
              <p className="text-xs text-foreground-muted">Assess driver performance and determine incentives</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-theme transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Driver Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <User size={12} /> Driver
              </label>
              <select
                name="driverId"
                value={formData.driverId}
                onChange={handleChange}
                required
                disabled={!!initialData}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
              >
                <option value="">Select Driver</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Evaluation Period */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Calendar size={12} /> Evaluation Month
              </label>
              <div className="flex gap-2">
                <input
                  type="month"
                  name="evaluationPeriod"
                  value={formData.evaluationPeriod}
                  onChange={handleChange}
                  required
                  disabled={!!initialData}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
                />
                {!initialData && (
                  <button
                    type="button"
                    onClick={handleCalculate}
                    disabled={isCalculating || !formData.driverId}
                    className="px-3 py-2 bg-primary/10 text-primary rounded-theme font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCalculating ? <TrendingUp size={16} className="animate-spin" /> : <Calculator size={16} />}
                    <span className="hidden sm:inline">Calc</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Trips', name: 'tripsCompleted', icon: Target, suffix: '', color: 'text-blue-600' },
              { label: 'Incidents', name: 'incidentsCount', icon: AlertCircle, suffix: '', color: formData.incidentsCount > 0 ? 'text-red-500' : 'text-green-500' },
              { label: 'Fuel Score', name: 'fuelEfficiencyScore', icon: Fuel, suffix: '', color: 'text-orange-500' },
              { label: 'On-Time %', name: 'onTimeDeliveryPercent', icon: History, suffix: '%', color: 'text-primary' },
            ].map((metric, i) => (
              <div key={i} className="bg-muted/30 border border-border rounded-theme p-3 text-center">
                <div className={`flex justify-center mb-1 ${metric.color}`}>
                  <metric.icon size={16} />
                </div>
                <p className="text-[10px] font-bold text-foreground-muted uppercase mb-1">{metric.label}</p>
                <input
                  type="number"
                  step="0.01"
                  name={metric.name}
                  value={formData[metric.name]}
                  onChange={handleChange}
                  className="w-full bg-transparent text-center font-black text-lg focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* Incentives & Penalties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Zap size={12} className="text-yellow-500" /> Incentive Amount (AED)
              </label>
              <input
                type="number"
                name="incentiveAmount"
                value={formData.incentiveAmount}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none font-black text-primary text-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <AlertCircle size={12} className="text-red-500" /> Penalty Amount (AED)
              </label>
              <input
                type="number"
                name="penaltyAmount"
                value={formData.penaltyAmount}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none font-black text-red-500 text-lg"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
              <FileText size={12} /> Supervisor Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="3"
              placeholder="Comments on driver behavior, efficiency, or reasons for penalties/incentives..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm"
            ></textarea>
          </div>

          {/* Warning for High Incidents */}
          {formData.incidentsCount > 0 && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-theme flex gap-3 text-red-600">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                <span className="font-bold">Attention:</span> This driver has <span className="underline">{formData.incidentsCount} reported incident(s)</span> for this period. Evaluation of penalties is highly recommended.
              </p>
            </div>
          )}
        </form>

        <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-theme transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-theme font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            <Save size={18} />
            {initialData ? 'Update Record' : 'Save Performance'}
          </button>
        </div>
      </div>
    </div>
  );
}
