import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  ArrowRight,
  Trophy, 
  Edit2, 
  Calculator, 
  Calendar, 
  User, 
  Zap, 
  Target, 
  AlertCircle,
  Fuel,
  CheckCircle2
} from 'lucide-react';
import { driverPerformanceApi } from '../services/driverPerformanceApi';
import { useLanguage } from '../../context/LanguageContext';

const DriverPerformanceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [perf, setPerf] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPerformanceDetails = async () => {
    setLoading(true);
    try {
      const res = await driverPerformanceApi.getPerformanceById(id);
      setPerf(res);
    } catch (err) {
      console.error(err);
      toast.error('Error fetching driver performance details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceDetails();
  }, [id]);

  const handleRecalculate = async () => {
    if (!perf?.driverId || !perf?.evaluationPeriod) return;
    try {
      const data = await driverPerformanceApi.calculateMetrics(perf.driverId, perf.evaluationPeriod);
      toast.success('Metrics recalculated');
      fetchPerformanceDetails();
    } catch (err) {
      console.error(err);
      toast.error('Failed to recalculate metrics');
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(val || 0);

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل تفاصيل تقييم الأداء...' : 'Loading performance assessment details...'}
      </div>
    );
  }

  if (!perf) {
    return (
      <div className="w-full p-8 text-center text-xs text-rose-500 font-bold">
        Performance evaluation record not found.
      </div>
    );
  }

  const netIncentive = (perf.incentiveAmount || 0) - (perf.penaltyAmount || 0);

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-card,#ffffff)] p-3 sm:p-4 rounded-xl border border-[var(--color-border,#D7E3EE)] shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/fleet-dashboard/performance')}
            className="w-8 h-8 rounded-lg border border-[var(--color-border,#D7E3EE)] flex items-center justify-center text-[var(--color-foreground,#102A43)] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 stroke-[2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-none">
                {perf.driverName || 'DRIVER ASSESSMENT'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-sky-50 text-[var(--color-primary,#0178BC)] border border-sky-200 font-mono">
                {perf.evaluationPeriod}
              </span>
            </div>
            <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-1">
              Driver ID: <span className="font-semibold text-[var(--color-foreground,#102A43)] font-mono">{perf.driverId}</span> • Rating: <span className="font-bold text-emerald-600 font-mono">{perf.fuelEfficiencyScore || 4.2} / 5.0</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRecalculate}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 text-[var(--color-primary,#0178BC)] border border-sky-200 text-xs font-bold hover:bg-[var(--color-primary,#0178BC)] hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{t('fleet.performanceDetails.calculateMetrics') || 'Recalculate Metrics'}</span>
          </button>

          <button
            onClick={() => navigate(`/fleet-dashboard/performance/performance-form/${id}`)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{t('fleet.performanceDetails.editEvaluation') || 'Edit Assessment'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Trips Completed */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">TRIPS COMPLETED</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 font-mono truncate">{perf.tripsCompleted || 0} Trips</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">Monthly Dispatch Volume</p>
          </div>
        </div>

        {/* On-Time Delivery % */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">ON-TIME DELIVERY</p>
            <p className="text-xs font-extrabold text-emerald-600 leading-tight my-0.5 font-mono truncate">{perf.onTimeDeliveryPercent || 100}%</p>
            <p className="text-[10px] text-emerald-600 font-semibold truncate">Schedule Accuracy</p>
          </div>
        </div>

        {/* Fuel Efficiency */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Fuel className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">FUEL EFFICIENCY</p>
            <p className="text-xs font-extrabold text-purple-600 leading-tight my-0.5 font-mono truncate">{perf.fuelEfficiencyScore || 0} / 5.0</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">Eco Score Rating</p>
          </div>
        </div>

        {/* Net Incentive */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">NET INCENTIVE</p>
            <p className="text-xs font-extrabold text-amber-600 leading-tight my-0.5 font-mono truncate">{formatCurrency(netIncentive)}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">Bonus - Penalties</p>
          </div>
        </div>

      </div>

      {/* Detailed Evaluation Log Box */}
      <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-4 shadow-2xs space-y-4">
        <div className="border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
          <h2 className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] tracking-wider uppercase">FINANCIAL BONUS & MANAGER FEEDBACK</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Bonus Incentive Amount</p>
            <p className="font-bold text-emerald-600 mt-1 text-sm">+{formatCurrency(perf.incentiveAmount)}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Penalty Deductions</p>
            <p className="font-bold text-rose-600 mt-1 text-sm">-{formatCurrency(perf.penaltyAmount)}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Incidents Logged</p>
            <p className="font-bold text-[var(--color-foreground,#102A43)] mt-1 text-sm">{perf.incidentsCount || 0} Incidents</p>
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--color-border,#E4EAF4)]">
          <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Manager Evaluation Remarks</p>
          <p className="text-xs font-semibold text-[var(--color-foreground,#102A43)] mt-1 bg-slate-50 p-3 rounded-lg border border-slate-200">{perf.remarks || 'No evaluation remarks entered.'}</p>
        </div>
      </div>

    </div>
  );
};

export default DriverPerformanceDetailsPage;
