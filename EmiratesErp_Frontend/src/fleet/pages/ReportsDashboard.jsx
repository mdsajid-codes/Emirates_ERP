import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Truck, 
  AlertTriangle, 
  Download,
  Calendar,
  Filter,
  AlertCircle,
  Plus,
  Eye,
  CircleDollarSign,
  User,
  Building
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const ReportsDashboard = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('MONTH');
  const [activeTab, setActiveTab] = useState('driver-performance');
  
  // Custom Date Range Filters
  const [customRange, setCustomRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExport = () => {
    if (!data) return;
    let headers = [];
    let rows = [];
    let filename = '';

    if (activeTab === 'driver-performance') {
      headers = ['Driver ID', 'Name', 'Total Trips', 'Total Amount (AED)', 'Total Commission (AED)'];
      rows = (data.driverPerformance || []).map(r => [r.driverId, r.name, r.totalTrips, r.totalAmount, r.totalCommission]);
      filename = 'Driver_Performance_Report.csv';
    } else if (activeTab === 'customer-billing') {
      headers = ['Customer ID', 'Customer Name', 'Total Trips', 'Total Amount (AED)'];
      rows = (data.customerBilling || []).map(r => [r.customerId, r.name, r.totalTrips, r.totalAmount]);
      filename = 'Customer_Billing_Report.csv';
    } else if (activeTab === 'vendor-liabilities') {
      headers = ['Vendor ID', 'Vendor Name', 'Total Trips', 'Total Amount (AED)'];
      rows = (data.vendorLiabilities || []).map(r => [r.vendorId, r.name, r.totalTrips, r.totalAmount]);
      filename = 'Vendor_Liabilities_Report.csv';
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (customRange && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      } else {
        params.timeFilter = timeFilter;
      }

      const response = await axios.get(`${API_URL}/fleet/reports/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to load report analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!customRange) {
      fetchReportData();
    }
  }, [timeFilter, customRange]);

  const handleCustomRangeSubmit = (e) => {
    e?.preventDefault();
    if (startDate && endDate) {
      fetchReportData();
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(val || 0);

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center justify-center text-[var(--color-primary,#0178BC)]">
            <BarChart3 className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#0F172A)] tracking-tight leading-tight">
              {t('fleet.reports.title') || 'Fleet Analytics & Reports'}
            </h1>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-0.5">
              {t('fleet.reports.subtitle') || 'Financial performance and operational efficiency metrics'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Filter Pills */}
          <div className="bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] rounded-xl p-1 flex items-center shadow-xs">
            {['WEEK', 'MONTH', 'YEAR'].map((filter) => (
              <button
                key={filter}
                disabled={customRange}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !customRange && timeFilter === filter 
                    ? 'bg-[var(--color-primary,#0178BC)] text-white shadow-2xs' 
                    : 'text-[var(--color-foreground-muted,#656873)] hover:bg-slate-50'
                }`}
              >
                {filter === 'WEEK' ? 'This Week' : filter === 'MONTH' ? 'This Month' : 'This Year'}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/fleet-dashboard/trip-reports/report-form')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00A9A8] text-white text-xs font-semibold hover:opacity-90 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t('fleet.reports.customReport') || 'Custom Report'}</span>
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-[var(--color-border,#D9DADD)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#0F172A)] rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('fleet.reports.export') || 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Total Revenue */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CircleDollarSign className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.reports.totalRevenue') || 'Total Revenue'}</p>
            <p className="text-xl font-extrabold text-emerald-600 leading-none my-0.5 font-mono truncate">{formatCurrency(data?.totalRevenue)}</p>
            <p className="text-[10px] text-emerald-600 font-semibold truncate">Trip Invoices Sum</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.reports.totalExpenses') || 'Total Expenses'}</p>
            <p className="text-xl font-extrabold text-rose-600 leading-none my-0.5 font-mono truncate">{formatCurrency(data?.totalExpenses)}</p>
            <p className="text-[10px] text-rose-600 font-semibold truncate">Fuel & Workshop Costs</p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.reports.netProfit') || 'Net Profit'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5 font-mono truncate">{formatCurrency(data?.netProfit)}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">Net Income Margin</p>
          </div>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.reports.fleetUtilization') || 'Fleet Utilization'}</p>
            <p className="text-xl font-extrabold text-purple-600 leading-none my-0.5 font-mono">{data?.fleetUtilizationRate || 85.5}%</p>
            <p className="text-[10px] text-purple-600 font-semibold truncate">Active Fleet Ratio</p>
          </div>
        </div>

      </div>

      {/* Middle Section: Financial Chart & Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
        
        {/* Revenue vs Operational Cost Bar Chart */}
        <div className="lg:col-span-2 bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[var(--color-border,#E4EAF4)] pb-2.5 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-foreground,#0F172A)]">REVENUE VS OPERATIONAL COST</h3>
            <span className="text-[10px] font-bold text-[var(--color-primary,#0178BC)] bg-sky-50 px-2 py-0.5 rounded-md font-mono">
              MONTHLY TRENDS
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.financialTrends || [
                  { month: 'Jan', revenue: 12000, cost: 4500 },
                  { month: 'Feb', revenue: 15500, cost: 6000 },
                  { month: 'Mar', revenue: 18000, cost: 7200 }
                ]}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4EAF4" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#656873', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#656873', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Revenue (AED)" fill="#00A9A8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Operational Cost (AED)" fill="#E11D48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Efficiency Card */}
        <div className="bg-[#00A9A8] text-white rounded-xl p-4 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-2">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-sky-100">EFFICIENCY SCORE</p>
            <h2 className="text-4xl sm:text-5xl font-black leading-none tracking-tight font-mono">95%</h2>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-teal-400/40 text-xs">
            <div>
              <p className="text-[10px] text-teal-100 uppercase font-bold">Active Incidents</p>
              <p className="font-bold text-white mt-0.5">0 Complaints Pending</p>
            </div>

            <div>
              <p className="text-[10px] text-teal-100 uppercase font-bold">Fuel Expenditure</p>
              <p className="font-bold text-white font-mono mt-0.5">{formatCurrency(data?.totalExpenses ? data.totalExpenses * 0.6 : 0)}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs Data Table Section */}
      <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] shadow-xs overflow-hidden">
        
        {/* Table Tabs Header */}
        <div className="p-3 border-b border-[var(--color-border,#D9DADD)] flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('driver-performance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'driver-performance' 
                  ? 'bg-[var(--color-primary,#0178BC)] text-white shadow-2xs' 
                  : 'text-[var(--color-foreground-muted,#656873)] hover:bg-slate-100'
              }`}
            >
              Driver Performance
            </button>

            <button
              onClick={() => setActiveTab('customer-billing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'customer-billing' 
                  ? 'bg-[var(--color-primary,#0178BC)] text-white shadow-2xs' 
                  : 'text-[var(--color-foreground-muted,#656873)] hover:bg-slate-100'
              }`}
            >
              Customer Billing
            </button>

            <button
              onClick={() => setActiveTab('vendor-liabilities')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'vendor-liabilities' 
                  ? 'bg-[var(--color-primary,#0178BC)] text-white shadow-2xs' 
                  : 'text-[var(--color-foreground-muted,#656873)] hover:bg-slate-100'
              }`}
            >
              Vendor Liabilities
            </button>
          </div>

          <button
            onClick={() => navigate('/fleet-dashboard/trip-reports/report-details/1')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary,#0178BC)] hover:underline cursor-pointer"
          >
            <Eye size={14} /> View Analytical Breakdown
          </button>
        </div>

        {/* Tab Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'جاري تحميل جدول التقرير...' : 'Loading report breakdown...'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead className="bg-slate-50 border-b border-[var(--color-border,#D9DADD)] text-xs text-[var(--color-foreground,#0F172A)] font-bold">
                {activeTab === 'driver-performance' && (
                  <tr>
                    <th className="p-3.5">DRIVER ID</th>
                    <th className="p-3.5">NAME</th>
                    <th className="p-3.5">TOTAL TRIPS</th>
                    <th className="p-3.5">TOTAL AMOUNT (AED)</th>
                    <th className="p-3.5">COMMISSION (AED)</th>
                  </tr>
                )}

                {activeTab === 'customer-billing' && (
                  <tr>
                    <th className="p-3.5">CUSTOMER ID</th>
                    <th className="p-3.5">CUSTOMER NAME</th>
                    <th className="p-3.5">TOTAL TRIPS</th>
                    <th className="p-3.5">TOTAL AMOUNT (AED)</th>
                  </tr>
                )}

                {activeTab === 'vendor-liabilities' && (
                  <tr>
                    <th className="p-3.5">VENDOR ID</th>
                    <th className="p-3.5">VENDOR NAME</th>
                    <th className="p-3.5">TOTAL TRIPS</th>
                    <th className="p-3.5">TOTAL AMOUNT (AED)</th>
                  </tr>
                )}
              </thead>

              <tbody className="divide-y divide-[var(--color-border,#D9DADD)] text-xs text-[var(--color-foreground,#0F172A)]">
                {activeTab === 'driver-performance' && (data?.driverPerformance || []).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold font-mono">DRV-{row.driverId}</td>
                    <td className="p-3.5 font-bold">{row.name}</td>
                    <td className="p-3.5 font-semibold">{row.totalTrips} Trips</td>
                    <td className="p-3.5 font-bold font-mono text-emerald-600">{formatCurrency(row.totalAmount)}</td>
                    <td className="p-3.5 font-bold font-mono text-purple-600">{formatCurrency(row.totalCommission)}</td>
                  </tr>
                ))}

                {activeTab === 'customer-billing' && (data?.customerBilling || []).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold font-mono">CUST-{row.customerId}</td>
                    <td className="p-3.5 font-bold">{row.name}</td>
                    <td className="p-3.5 font-semibold">{row.totalTrips} Trips</td>
                    <td className="p-3.5 font-bold font-mono text-emerald-600">{formatCurrency(row.totalAmount)}</td>
                  </tr>
                ))}

                {activeTab === 'vendor-liabilities' && (data?.vendorLiabilities || []).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold font-mono">VND-{row.vendorId}</td>
                    <td className="p-3.5 font-bold">{row.name}</td>
                    <td className="p-3.5 font-semibold">{row.totalTrips} Trips</td>
                    <td className="p-3.5 font-bold font-mono text-rose-600">{formatCurrency(row.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
};

export default ReportsDashboard;
