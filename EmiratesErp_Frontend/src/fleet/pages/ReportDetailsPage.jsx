import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  ArrowRight,
  Download, 
  Printer, 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Truck, 
  Calendar,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const ReportDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReportDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fleet/reports/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { timeFilter: 'MONTH' }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error('Failed to load report analytical details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const handleExportCsv = () => {
    if (!data) return;
    const headers = ['Driver ID', 'Name', 'Total Trips', 'Total Amount (AED)', 'Total Commission (AED)'];
    const rows = (data.driverPerformance || []).map(r => [r.driverId, r.name, r.totalTrips, r.totalAmount, r.totalCommission]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Report_Analytics_${id || 'Month'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(val || 0);

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل تفاصيل التقرير...' : 'Loading report details...'}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-card,#ffffff)] p-3 sm:p-4 rounded-xl border border-[var(--color-border,#D7E3EE)] shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/fleet-dashboard/trip-reports')}
            className="w-8 h-8 rounded-lg border border-[var(--color-border,#D7E3EE)] flex items-center justify-center text-[var(--color-foreground,#102A43)] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 stroke-[2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-none">
                {id ? `ANALYTICS REPORT #${id}` : 'MONTHLY FLEET ANALYTICS'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-sky-50 text-[var(--color-primary,#0178BC)] border border-sky-200">
                THIS MONTH
              </span>
            </div>
            <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-1">
              Financial performance & driver commission metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#00A9A8] text-white text-xs font-bold hover:bg-[#009190] transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('fleet.reportDetails.exportCsv') || 'Export CSV'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('fleet.reportDetails.print') || 'Print Report'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Total Revenue */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">TOTAL REVENUE</p>
            <p className="text-xs font-extrabold text-emerald-600 leading-tight my-0.5 font-mono truncate">{formatCurrency(data?.totalRevenue)}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">Trip Billing Sum</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">TOTAL EXPENSES</p>
            <p className="text-xs font-extrabold text-rose-600 leading-tight my-0.5 font-mono truncate">{formatCurrency(data?.totalExpenses)}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">Fuel & Maintenance</p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">NET PROFIT (AED)</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 font-mono truncate">{formatCurrency(data?.netProfit)}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">Net Income</p>
          </div>
        </div>

        {/* Utilization */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">FLEET UTILIZATION</p>
            <p className="text-xs font-extrabold text-purple-600 leading-tight my-0.5 font-mono truncate">{data?.fleetUtilizationRate}%</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">Active Fleet Ratio</p>
          </div>
        </div>

      </div>

      {/* Driver Performance Table Details */}
      <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-4 shadow-2xs space-y-4">
        <div className="border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
          <h2 className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] tracking-wider uppercase">DRIVER PERFORMANCE & COMMISSION BREAKDOWN</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-50 border-b border-[var(--color-border,#D7E3EE)] text-xs text-[var(--color-foreground,#102A43)] font-bold">
              <tr>
                <th className="p-3">DRIVER NAME</th>
                <th className="p-3">TOTAL TRIPS</th>
                <th className="p-3">TOTAL REVENUE</th>
                <th className="p-3">COMMISSION (AED)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border,#D7E3EE)] text-xs text-[var(--color-foreground,#102A43)]">
              {(data?.driverPerformance || []).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold">{row.name}</td>
                  <td className="p-3 font-semibold">{row.totalTrips} Trips</td>
                  <td className="p-3 font-mono font-bold text-emerald-600">{formatCurrency(row.totalAmount)}</td>
                  <td className="p-3 font-mono font-bold text-purple-600">{formatCurrency(row.totalCommission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ReportDetailsPage;
