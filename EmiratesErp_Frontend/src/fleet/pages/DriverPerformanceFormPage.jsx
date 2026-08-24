import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
import { useLanguage } from '../../context/LanguageContext';

const DriverPerformanceFormPage = () => {
  const navigate = useNavigate();
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const id = pathId || searchParams.get('id');
  const isEditing = Boolean(id);

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [drivers, setDrivers] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    const fetchDrivers = async () => {
      try {
        const response = await axios.get(`${API_URL}/fleet/drivers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setDrivers(response.data.content || []);

        if (id) {
          const perf = await driverPerformanceApi.getPerformanceById(id);
          if (perf) {
            setFormData({
              ...perf,
              incentiveAmount: perf.incentiveAmount || 0,
              penaltyAmount: perf.penaltyAmount || 0,
              remarks: perf.remarks || ''
            });
          }
        }
      } catch (error) {
        console.error('Error fetching performance form data:', error);
      }
    };
    fetchDrivers();
  }, [id, API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculate = async () => {
    if (!formData.driverId || !formData.evaluationPeriod) {
      toast.warning('Please select a driver and evaluation period first');
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
    if (!formData.driverId || !formData.evaluationPeriod) {
      toast.error('Please select Driver and Evaluation Period');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await driverPerformanceApi.updatePerformance(id, formData);
        toast.success('Performance evaluation updated successfully');
      } else {
        await driverPerformanceApi.createPerformance(formData);
        toast.success('Performance evaluation saved successfully');
      }
      navigate('/fleet-dashboard/performance');
    } catch (error) {
      console.error('Error saving performance:', error);
      toast.error(error.response?.data?.message || 'Failed to save evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-tight">
            {isEditing ? (t('fleet.performanceForm.editTitle') || 'Edit Performance Evaluation') : (t('fleet.performanceForm.addTitle') || 'Evaluate Driver Performance')}
          </h1>
          <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-0.5">
            {t('fleet.performanceForm.subtitle') || 'Calculate trip delivery metrics, fuel efficiency scores, and monthly incentives'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/fleet-dashboard/performance')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <X className="w-4 h-4 text-[var(--color-foreground,#102A43)]" />
          <span>{t('fleet.driverForm.cancel') || 'Cancel'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Row 1: Section 1 & Section 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          {/* Section 1: Driver & Period Selection */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Target Driver & Assessment Period</h2>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Target Driver *</label>
                <select
                  name="driverId"
                  value={formData.driverId}
                  onChange={handleChange}
                  required
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="">Select Driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.employeeId || 'ID'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Evaluation Period (YYYY-MM) *</label>
                <input
                  type="month"
                  name="evaluationPeriod"
                  value={formData.evaluationPeriod}
                  onChange={handleChange}
                  required
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-[var(--color-primary,#0178BC)] border border-sky-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  <span>{isCalculating ? 'Calculating System Metrics...' : 'Auto-Calculate System Metrics'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Calculated Performance Metrics */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Operational Performance Metrics</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Trips Completed</label>
                <input
                  type="number"
                  name="tripsCompleted"
                  value={formData.tripsCompleted}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold font-mono text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">On-Time Delivery %</label>
                <input
                  type="number"
                  step="0.1"
                  name="onTimeDeliveryPercent"
                  value={formData.onTimeDeliveryPercent}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold font-mono text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Incidents / Violations</label>
                <input
                  type="number"
                  name="incidentsCount"
                  value={formData.incidentsCount}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold font-mono text-rose-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Fuel Efficiency Score</label>
                <input
                  type="number"
                  step="0.1"
                  name="fuelEfficiencyScore"
                  value={formData.fuelEfficiencyScore}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold font-mono text-[var(--color-primary,#0178BC)] outline-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Section 3: Financial Incentives & Penalties */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
            <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Financial Bonus & Deductions</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Bonus Incentive Amount (AED)</label>
              <input
                type="number"
                name="incentiveAmount"
                value={formData.incentiveAmount}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold font-mono text-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Penalty Deduction Amount (AED)</label>
              <input
                type="number"
                name="penaltyAmount"
                value={formData.penaltyAmount}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold font-mono text-rose-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Evaluation Remarks / Feedback</label>
            <textarea
              rows={2}
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Manager evaluation feedback or performance notes..."
              className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => navigate('/fleet-dashboard/performance')}
            className="px-5 py-2 border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] rounded-xl text-xs font-bold text-[var(--color-foreground,#102A43)] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            {t('fleet.driverForm.cancel') || 'Cancel'}
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#00A9A8] hover:bg-[#009190] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{submitting ? 'Saving...' : 'Save Assessment'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default DriverPerformanceFormPage;
