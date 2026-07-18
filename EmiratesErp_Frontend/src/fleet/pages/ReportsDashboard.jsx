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
  AlertCircle
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

const ReportsDashboard = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
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

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground-muted font-medium animate-pulse">Generating Reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="text-primary" size={32} />
            Fleet Analytics & Reports
          </h1>
          <p className="text-foreground-muted mt-1">Financial performance and operational efficiency metrics</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="bg-card border border-border rounded-theme p-1 flex items-center shadow-sm">
            {['WEEK', 'MONTH', 'YEAR'].map((filter) => (
              <button
                key={filter}
                disabled={customRange}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  !customRange && timeFilter === filter 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-foreground-muted hover:text-foreground hover:bg-background-muted disabled:opacity-50'
                }`}
              >
                {filter === 'WEEK' ? 'This Week' : filter === 'MONTH' ? 'This Month' : 'This Year'}
              </button>
            ))}
            <button
              onClick={() => setCustomRange(!customRange)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                customRange 
                  ? 'bg-amber-500 text-white shadow-md' 
                  : 'text-foreground-muted hover:text-foreground hover:bg-background-muted'
              }`}
            >
              Custom Dates
            </button>
          </div>
          
          {customRange && (
            <form onSubmit={handleCustomRangeSubmit} className="flex items-center gap-2 animate-fade-in bg-card border border-border rounded-theme p-1.5 shadow-sm">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-foreground border-none focus:ring-0 focus:outline-none p-1 cursor-pointer"
                required
              />
              <span className="text-foreground-muted text-xs font-black px-1">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-foreground border-none focus:ring-0 focus:outline-none p-1 cursor-pointer"
                required
              />
              <button type="submit" className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg transition-all shadow-md">
                Apply
              </button>
            </form>
          )}
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-background border border-border text-foreground font-bold text-sm rounded-theme hover:bg-muted transition-colors shadow-sm"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-theme border border-border shadow-sm hover:border-primary/50 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-success/10 text-success rounded-xl group-hover:bg-success group-hover:text-white transition-all">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Total Revenue</p>
          <h3 className="text-2xl font-black text-foreground">{formatCurrency(data?.totalRevenue)}</h3>
        </div>

        <div className="bg-card p-5 rounded-theme border border-border shadow-sm hover:border-primary/50 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-error/10 text-error rounded-xl group-hover:bg-error group-hover:text-white transition-all">
              <TrendingDown size={24} />
            </div>
          </div>
          <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Total Expenses</p>
          <h3 className="text-2xl font-black text-foreground">{formatCurrency(data?.totalExpenses)}</h3>
        </div>

        <div className="bg-card p-5 rounded-theme border border-border shadow-sm hover:border-primary/50 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Net Profit</p>
          <h3 className="text-2xl font-black text-foreground">{formatCurrency(data?.netProfit)}</h3>
        </div>

        <div className="bg-card p-5 rounded-theme border border-border shadow-sm hover:border-primary/50 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <Truck size={24} />
            </div>
          </div>
          <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Fleet Utilization</p>
          <h3 className="text-2xl font-black text-foreground">{data?.fleetUtilizationRate}%</h3>
        </div>
      </div>

      {/* Middle Section Charts (Placeholders for now) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card p-6 rounded-theme border border-border shadow-sm flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-6">Revenue vs Operational Cost</h3>
          <div className="flex-1 min-h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.financialTrends || []}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 'bold' }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 'bold' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '8px', 
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#1F2937' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar name="Revenue" dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar name="Operational Cost" dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-primary p-6 rounded-theme border border-primary/20 shadow-lg text-primary-foreground flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp size={120} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2 opacity-90">Efficiency Score</h3>
            <div className="text-5xl font-black mb-8">{data?.onTimeDeliveryPercentage}%</div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Active Incidents</p>
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className={data?.activeIncidents > 0 ? "text-amber-300" : "text-green-300"} />
                  <span className="font-bold">{data?.activeIncidents} Complaints Pending</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Fuel Expenditure</p>
                <div className="font-bold">{formatCurrency(data?.totalFuelCost)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tabs Section */}
      <div className="bg-card rounded-theme border border-border shadow-sm overflow-hidden">
        <div className="flex border-b border-border bg-muted/30">
          {[
            { id: 'driver-performance', label: 'Driver Performance' },
            { id: 'customer-billing', label: 'Customer Billing' },
            { id: 'vendor-liabilities', label: 'Vendor Liabilities' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'text-primary border-b-2 border-primary bg-background' 
                  : 'text-foreground-muted hover:text-foreground hover:bg-background/50 border-b-2 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6 min-h-[300px]">
          {activeTab === 'driver-performance' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                    <th className="pb-3 pl-4">Name</th>
                    <th className="pb-3 text-center">Total Trips</th>
                    <th className="pb-3 text-right">Total Amount</th>
                    <th className="pb-3 text-right pr-4">Total Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {(!data?.driverPerformance || data.driverPerformance.length === 0) ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-foreground-muted italic">No data available</td>
                    </tr>
                  ) : (
                    data.driverPerformance.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 pl-4 font-bold text-foreground">{row.name}</td>
                        <td className="py-3.5 text-center font-semibold text-foreground-muted">{row.totalTrips}</td>
                        <td className="py-3.5 text-right font-semibold text-foreground">{formatCurrency(row.totalAmount)}</td>
                        <td className="py-3.5 text-right font-black text-primary pr-4">{formatCurrency(row.totalCommission)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'customer-billing' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                    <th className="pb-3 pl-4">Customer Name</th>
                    <th className="pb-3 text-center">Total Trips</th>
                    <th className="pb-3 text-right pr-4">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {(!data?.customerBilling || data.customerBilling.length === 0) ? (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-foreground-muted italic">No data available</td>
                    </tr>
                  ) : (
                    data.customerBilling.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 pl-4 font-bold text-foreground">{row.name}</td>
                        <td className="py-3.5 text-center font-semibold text-foreground-muted">{row.totalTrips}</td>
                        <td className="py-3.5 text-right font-bold text-foreground pr-4">{formatCurrency(row.totalAmount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'vendor-liabilities' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                    <th className="pb-3 pl-4">Vendor Name</th>
                    <th className="pb-3 text-center">Total Trips</th>
                    <th className="pb-3 text-right pr-4">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {(!data?.vendorLiabilities || data.vendorLiabilities.length === 0) ? (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-foreground-muted italic">No data available</td>
                    </tr>
                  ) : (
                    data.vendorLiabilities.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 pl-4 font-bold text-foreground">{row.name}</td>
                        <td className="py-3.5 text-center font-semibold text-foreground-muted">{row.totalTrips}</td>
                        <td className="py-3.5 text-right font-bold text-error pr-4">{formatCurrency(row.totalAmount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
