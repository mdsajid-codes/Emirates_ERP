import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Truck, 
  Users, 
  Navigation, 
  Wrench, 
  ClipboardList, 
  Fuel, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Sun,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const FleetDashboard = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const [stats, setStats] = useState({
    totalRevenueMTD: 24500,
    totalExpensesMTD: 18750,
    totalVehiclesCount: 45,
    activeVehiclesCount: 32,
    activeDriversCount: 28,
    tripsTodayCount: 18,
    fleetUtilizationPercentage: 72,
    avgFuelEfficiency: 3.42,
    pendingComplaintsCount: 3,
  });

  const [recentVehicles, setRecentVehicles] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const headers = { Authorization: `Bearer ${token}` };
          const statsRes = await axios.get(`${API_URL}/fleet/dashboard/stats`, { headers });
          if (statsRes.data) {
            setStats(prev => ({
              ...prev,
              ...statsRes.data,
              totalRevenueMTD: statsRes.data.totalRevenueMTD || 24500,
              totalExpensesMTD: statsRes.data.totalExpensesMTD || 18750,
              activeVehiclesCount: statsRes.data.activeVehiclesCount || 32,
              totalVehiclesCount: statsRes.data.totalVehiclesCount || 45,
              activeDriversCount: statsRes.data.activeDriversCount || 28,
              tripsTodayCount: statsRes.data.tripsTodayCount || 18,
              avgFuelEfficiency: statsRes.data.avgFuelEfficiency || 3.42,
              fleetUtilizationPercentage: statsRes.data.fleetUtilizationPercentage || 72,
              pendingComplaintsCount: statsRes.data.pendingComplaintsCount !== undefined ? statsRes.data.pendingComplaintsCount : 3,
            }));
          }

          const vRes = await axios.get(`${API_URL}/fleet/vehicles`, { params: { size: 5 }, headers });
          if (vRes.data?.content?.length > 0) {
            setRecentVehicles(vRes.data.content);
          } else {
            setRecentVehicles(fallbackVehicles);
          }
        } else {
          setRecentVehicles(fallbackVehicles);
        }
      } catch (error) {
        console.error("Error fetching fleet dashboard data:", error);
        setRecentVehicles(fallbackVehicles);
      }
    };

    fetchDashboardData();
  }, [API_URL]);

  const fallbackVehicles = [
    {
      plateNumber: "AUH-4521",
      vehicleType: isRTL ? "شاحنة" : "Truck",
      make: "Volvo",
      model: "FH 500",
      driver: isRTL ? "أحمد خان" : "Ahmed Khan",
      status: isRTL ? "في الخدمة" : "On-Duty",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      location: isRTL ? "جبل علي، دبي" : "Jebel Ali, Dubai",
      lastRefuel: "17 Aug 2025 09:15 AM"
    },
    {
      plateNumber: "DXB-7789",
      vehicleType: isRTL ? "شاحنة" : "Truck",
      make: "Mercedes",
      model: "Actros 1845",
      driver: isRTL ? "جيمس ويلسون" : "James Wilson",
      status: isRTL ? "في الرحلة" : "On-Trip",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
      location: isRTL ? "القوز، دبي" : "Al Quoz, Dubai",
      lastRefuel: "17 Aug 2025 08:40 AM"
    },
    {
      plateNumber: "SHJ-3344",
      vehicleType: isRTL ? "فان" : "Van",
      make: "Toyota",
      model: "Hiace",
      driver: isRTL ? "رافي كومار" : "Ravi Kumar",
      status: isRTL ? "في الطريق" : "En Route",
      statusColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
      location: isRTL ? "الشارقة الصناعية" : "Sharjah Industrial",
      lastRefuel: "17 Aug 2025 07:55 AM"
    },
    {
      plateNumber: "RAK-9801",
      vehicleType: isRTL ? "شاحنة" : "Truck",
      make: "Scania",
      model: "R450",
      driver: isRTL ? "علي حسان" : "Ali Hassan",
      status: isRTL ? "متوقف" : "Idle",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
      location: isRTL ? "رأس الخيمة" : "Ras Al Khaimah",
      lastRefuel: "16 Aug 2025 06:30 PM"
    },
    {
      plateNumber: "AJM-2211",
      vehicleType: isRTL ? "بيك أب" : "Pickup",
      make: "Nissan",
      model: "Navara",
      driver: isRTL ? "سوريش ناير" : "Suresh Nair",
      status: isRTL ? "صيانة" : "Maintenance",
      statusColor: "bg-rose-50 text-rose-700 border-rose-200",
      location: isRTL ? "المنطقة حرة عجمان" : "Ajman Free Zone",
      lastRefuel: "16 Aug 2025 05:10 PM"
    }
  ];

  const displayVehicles = recentVehicles.length > 0 ? recentVehicles : fallbackVehicles;

  return (
    <div className="w-full h-full p-3 sm:p-4 space-y-3 font-sans select-none pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102047)] tracking-tight leading-tight">
            {t('fleet.dash.title') || 'Fleet Dashboard'}
          </h1>
          <p className="text-xs text-[var(--color-foreground-muted,#637290)] mt-0.5">
            {t('fleet.dash.subtitle') || 'Real-time overview of your fleet performance and operations'}
          </p>
        </div>

        <button
          onClick={() => navigate('/fleet-dashboard/vehicles')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary,#00A9A8)] text-[var(--color-primary-foreground,#ffffff)] text-xs font-semibold hover:opacity-90 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('fleet.dash.manageFleet') || 'Manage Fleet'}</span>
        </button>
      </div>

      {/* Main Content 2-Column Grid (8:4 ratio) - Right column aligns top-to-bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        
        {/* Left Main Content Column (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-3">

          {/* Section 1: Major KPI Row 1 (4 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Total Revenue */}
            <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#E4EAF4)] shadow-2xs flex items-center gap-3 h-[84px] transition-transform hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[var(--color-foreground-muted,#637290)] truncate">{t('fleet.dash.totalRevenue') || 'Total Revenue'}</p>
                <p className="text-base font-extrabold text-[var(--color-foreground,#102047)] leading-tight mt-0.5 truncate">
                  AED {stats.totalRevenueMTD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[9.5px] text-[var(--color-foreground-muted,#637290)] mt-0.5 flex items-center gap-1">
                  <span className="text-emerald-600 font-bold">↑ 12.5%</span> {isRTL ? 'مقارنة بالـ 30 يوماً الماضية' : 'vs last 30 days'}
                </p>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#E4EAF4)] shadow-2xs flex items-center gap-3 h-[84px] transition-transform hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[var(--color-foreground-muted,#637290)] truncate">{t('fleet.dash.totalExpenses') || 'Total Expenses'}</p>
                <p className="text-base font-extrabold text-[var(--color-foreground,#102047)] leading-tight mt-0.5 truncate">
                  AED {stats.totalExpensesMTD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[9.5px] text-[var(--color-foreground-muted,#637290)] mt-0.5 flex items-center gap-1">
                  <span className="text-emerald-600 font-bold">↓ 4.3%</span> {isRTL ? 'مقارنة بالـ 30 يوماً الماضية' : 'vs last 30 days'}
                </p>
              </div>
            </div>

            {/* Active Vehicles */}
            <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#E4EAF4)] shadow-2xs flex items-center gap-3 h-[84px] transition-transform hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[var(--color-foreground-muted,#637290)] truncate">{t('fleet.dash.activeVehicles') || 'Active Vehicles'}</p>
                <p className="text-base font-extrabold text-[var(--color-foreground,#102047)] leading-tight mt-0.5 truncate">
                  {stats.activeVehiclesCount}
                </p>
                <p className="text-[9.5px] text-[var(--color-foreground-muted,#637290)] mt-0.5 truncate">
                  {isRTL ? `من أصل ${stats.totalVehiclesCount} إجمالي الأصول` : `of ${stats.totalVehiclesCount} Total Assets`}
                </p>
              </div>
            </div>

            {/* Active Drivers */}
            <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#E4EAF4)] shadow-2xs flex items-center gap-3 h-[84px] transition-transform hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[var(--color-foreground-muted,#637290)] truncate">{t('fleet.dash.activeDrivers') || 'Active Drivers'}</p>
                <p className="text-base font-extrabold text-[var(--color-foreground,#102047)] leading-tight mt-0.5 truncate">
                  {stats.activeDriversCount}
                </p>
                <p className="text-[9.5px] text-[var(--color-foreground-muted,#637290)] mt-0.5 truncate">
                  {t('fleet.dash.onDuty') || 'On-Duty'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Secondary Operational KPI Row 2 (5 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* Trips Today */}
            <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#E4EAF4)] shadow-2xs flex items-center gap-3 h-[80px]">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[var(--color-foreground-muted,#637290)] truncate">{t('fleet.dash.tripsToday') || 'Trips Today'}</p>
                <p className="text-base font-extrabold text-[var(--color-foreground,#102047)] mt-0.5 truncate">{stats.tripsTodayCount}</p>
                <p className="text-[9.5px] text-[var(--color-foreground-muted,#637290)] truncate">{t('fleet.dash.scheduledOps') || 'Scheduled Ops'}</p>
              </div>
            </div>

            {/* Fuel Efficiency */}
            <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#E4EAF4)] shadow-2xs flex items-center gap-3 h-[80px]">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Fuel className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[var(--color-foreground-muted,#637290)] truncate">{t('fleet.dash.fuelEfficiency') || 'Fuel Efficiency'}</p>
                <p className="text-base font-extrabold text-[var(--color-foreground,#102047)] mt-0.5 truncate">{stats.avgFuelEfficiency}</p>
                <p className="text-[9.5px] text-[var(--color-foreground-muted,#637290)] truncate">{t('fleet.dash.kmPerLiter') || 'KM / Liter'}</p>
              </div>
            </div>

            {/* Fleet Utilization */}
            <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#E4EAF4)] shadow-2xs flex items-center gap-3 h-[80px]">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[var(--color-foreground-muted,#637290)] truncate">{t('fleet.dash.fleetUtilization') || 'Fleet Utilization'}</p>
                <p className="text-base font-extrabold text-[var(--color-foreground,#102047)] mt-0.5 truncate">{stats.fleetUtilizationPercentage}%</p>
                <p className="text-[9.5px] text-[var(--color-foreground-muted,#637290)] truncate">{t('fleet.dash.capacityUsed') || 'Capacity Used'}</p>
              </div>
            </div>

            {/* Fuel Consumed */}
            <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#E4EAF4)] shadow-2xs flex items-center gap-3 h-[80px]">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Fuel className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[var(--color-foreground-muted,#637290)] truncate">{t('fleet.dash.fuelConsumed') || 'Fuel Consumed'}</p>
                <p className="text-base font-extrabold text-[var(--color-foreground,#102047)] mt-0.5 truncate">1,254 L</p>
                <p className="text-[9.5px] text-[var(--color-foreground-muted,#637290)] truncate">{t('fleet.dash.today') || 'Today'}</p>
              </div>
            </div>

            {/* Pending Complaints */}
            <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#E4EAF4)] shadow-2xs flex items-center gap-3 h-[80px]">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[var(--color-foreground-muted,#637290)] truncate">{t('fleet.dash.pendingComplaints') || 'Pending Complaints'}</p>
                <p className="text-base font-extrabold text-[var(--color-foreground,#102047)] mt-0.5 truncate">{stats.pendingComplaintsCount}</p>
                <p className="text-[9.5px] text-[var(--color-foreground-muted,#637290)] truncate">{t('fleet.dash.actionRequired') || 'Action Required'}</p>
              </div>
            </div>
          </div>

          {/* Fleet Overview Chart Card */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-4 border border-[var(--color-border,#E4EAF4)] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--color-foreground,#102047)]">{t('fleet.dash.fleetOverview') || 'Fleet Overview'}</h2>
              <button 
                onClick={() => navigate('/fleet-dashboard/trip-reports')}
                className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
              >
                {t('fleet.dash.viewAnalytics') || 'View Analytics'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Utilization Trend Chart */}
              <div className="border border-[var(--color-border,#E4EAF4)] rounded-lg p-3 flex flex-col gap-2 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-foreground,#102047)]">{t('fleet.dash.utilizationTrend') || 'Fleet Utilization Trend'}</span>
                  <span className="text-[9px] text-[var(--color-foreground-muted,#637290)] px-1.5 py-0.5 border border-gray-200 rounded-md bg-white">7 {isRTL ? 'أيام' : 'Days'}</span>
                </div>
                <div className="h-[100px] flex items-end justify-between gap-1.5 pt-2 px-1">
                  {[60, 68, 62, 74, 58, 72, 68].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <div 
                        className="w-full bg-[var(--color-primary,#00A9A8)] rounded-t-xs transition-all duration-300 group-hover:opacity-80" 
                        style={{ height: `${val}%` }} 
                      />
                      <span className="text-[8.5px] text-[var(--color-foreground-muted,#637290)]">{['11 Aug','12 Aug','13 Aug','14 Aug','15 Aug','16 Aug','17 Aug'][idx]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fuel Trend Chart */}
              <div className="border border-[var(--color-border,#E4EAF4)] rounded-lg p-3 flex flex-col gap-2 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-foreground,#102047)]">{t('fleet.dash.fuelTrend') || 'Fuel Efficiency Trend'}</span>
                  <span className="text-[9px] text-[var(--color-foreground-muted,#637290)] px-1.5 py-0.5 border border-gray-200 rounded-md bg-white">7 {isRTL ? 'أيام' : 'Days'}</span>
                </div>
                <div className="h-[100px] flex items-end justify-between gap-1.5 pt-2 px-1">
                  {[3.8, 3.2, 3.4, 3.9, 3.1, 3.6, 3.42].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <div 
                        className="w-full bg-emerald-600 rounded-t-xs transition-all duration-300 group-hover:opacity-80" 
                        style={{ height: `${(val / 4.5) * 100}%` }} 
                      />
                      <span className="text-[8.5px] text-[var(--color-foreground-muted,#637290)]">{['11 Aug','12 Aug','13 Aug','14 Aug','15 Aug','16 Aug','17 Aug'][idx]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Vehicles Table Card */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-4 border border-[var(--color-border,#E4EAF4)] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--color-foreground,#102047)]">{t('fleet.dash.recentVehicles') || 'Recent Vehicles'}</h2>
              <button
                onClick={() => navigate('/fleet-dashboard/vehicles')}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                {t('fleet.dash.viewAllVehicles') || 'View All Vehicles'}
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[var(--color-border,#E4EAF4)]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 text-[var(--color-foreground,#102047)] font-bold border-b border-[var(--color-border,#E4EAF4)]">
                  <tr>
                    <th className="p-3">{t('fleet.dash.plateNo') || 'PLATE NO'}</th>
                    <th className="p-3">{t('fleet.dash.type') || 'TYPE'}</th>
                    <th className="p-3">{t('fleet.dash.makeModel') || 'MAKE / MODEL'}</th>
                    <th className="p-3">{t('fleet.dash.driver') || 'DRIVER'}</th>
                    <th className="p-3">{t('fleet.dash.status') || 'STATUS'}</th>
                    <th className="p-3">{t('fleet.dash.location') || 'LOCATION'}</th>
                    <th className="p-3 text-right">{t('fleet.dash.lastRefuel') || 'LAST REFUEL'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border,#E4EAF4)] text-[var(--color-foreground,#102047)]">
                  {displayVehicles.map((v, i) => (
                    <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3 font-bold text-blue-600 cursor-pointer" onClick={() => navigate('/fleet-dashboard/vehicles')}>
                        {v.plateNumber || v.plateNo}
                      </td>
                      <td className="p-3">{v.vehicleType || v.type}</td>
                      <td className="p-3 font-medium">{v.make} {v.model}</td>
                      <td className="p-3">{v.driver || v.assignedDriverName || (isRTL ? "أحمد خان" : "Ahmed Khan")}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] border ${v.statusColor || 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {v.status || (isRTL ? "في الخدمة" : "On-Duty")}
                        </span>
                      </td>
                      <td className="p-3 text-[var(--color-foreground-muted,#637290)]">{v.location || (isRTL ? "جبل علي، دبي" : "Jebel Ali, Dubai")}</td>
                      <td className="p-3 text-right text-[var(--color-foreground-muted,#637290)]">{v.lastRefuel || "17 Aug 2025 09:15 AM"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Sidebar Column (Span 4) matching Screenshot Layout */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          
          {/* Top Date & Weather Widget */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3.5 border border-[var(--color-border,#E4EAF4)] shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--color-foreground,#102047)]">{isRTL ? 'الأحد، 17 أغسطس 2025' : 'Sunday, 17 Aug 2025'}</p>
              <p className="text-[10px] text-[var(--color-foreground-muted,#637290)] mt-0.5">11:30 AM (GST)</p>
            </div>
            <div className="flex items-center gap-2 text-right">
              <Sun className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-sm font-bold text-[var(--color-foreground,#102047)]">34°C</p>
                <p className="text-[9.5px] text-[var(--color-foreground-muted,#637290)]">{isRTL ? 'دبي، الإمارات' : 'Dubai, UAE'}</p>
              </div>
            </div>
          </div>

          {/* Quick Access Card */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-4 border border-[var(--color-border,#E4EAF4)] shadow-2xs space-y-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-foreground,#102047)] tracking-tight">{t('fleet.dash.quickAccess') || 'Quick Access'}</h3>
              <p className="text-[11px] text-[var(--color-foreground-muted,#637290)] mt-0.5">Shortcuts to common actions</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => navigate('/fleet-dashboard/maintenance')}
                className="h-[68px] bg-[#F8FAFC] rounded-xl text-xs font-semibold text-[var(--color-foreground,#102047)] hover:bg-slate-100 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-slate-100 shadow-2xs"
              >
                <Wrench className="w-4.5 h-4.5 text-slate-700 stroke-[1.6]" />
                <span className="text-[11px] font-medium text-slate-800">{t('fleet.dash.maintenance') || 'Maintenance'}</span>
              </button>
              <button 
                onClick={() => navigate('/fleet-dashboard/dispatch')}
                className="h-[68px] bg-[#F8FAFC] rounded-xl text-xs font-semibold text-[var(--color-foreground,#102047)] hover:bg-slate-100 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-slate-100 shadow-2xs"
              >
                <Truck className="w-4.5 h-4.5 text-slate-700 stroke-[1.6]" />
                <span className="text-[11px] font-medium text-slate-800">{t('fleet.nav.dispatch') || 'Dispatch'}</span>
              </button>
              <button 
                onClick={() => navigate('/fleet-dashboard/fuel')}
                className="h-[68px] bg-[#F8FAFC] rounded-xl text-xs font-semibold text-[var(--color-foreground,#102047)] hover:bg-slate-100 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-slate-100 shadow-2xs"
              >
                <Fuel className="w-4.5 h-4.5 text-slate-700 stroke-[1.6]" />
                <span className="text-[11px] font-medium text-slate-800">{t('fleet.nav.fuel') || 'Fuel'}</span>
              </button>
              <button 
                onClick={() => navigate('/fleet-dashboard/trips')}
                className="h-[68px] bg-[#F8FAFC] rounded-xl text-xs font-semibold text-[var(--color-foreground,#102047)] hover:bg-slate-100 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-slate-100 shadow-2xs"
              >
                <Navigation className="w-4.5 h-4.5 text-slate-700 stroke-[1.6]" />
                <span className="text-[11px] font-medium text-slate-800">{t('fleet.dash.newTrip') || 'New Trip'}</span>
              </button>
              <button 
                onClick={() => navigate('/fleet-dashboard/vehicles')}
                className="h-[68px] bg-[#F8FAFC] rounded-xl text-xs font-semibold text-[var(--color-foreground,#102047)] hover:bg-slate-100 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-slate-100 shadow-2xs"
              >
                <Plus className="w-4.5 h-4.5 text-slate-700 stroke-[1.6]" />
                <span className="text-[11px] font-medium text-slate-800">{t('fleet.dash.addVehicle') || 'Add Vehicle'}</span>
              </button>
              <button 
                onClick={() => navigate('/fleet-dashboard/drivers')}
                className="h-[68px] bg-[#F8FAFC] rounded-xl text-xs font-semibold text-[var(--color-foreground,#102047)] hover:bg-slate-100 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-slate-100 shadow-2xs"
              >
                <Users className="w-4.5 h-4.5 text-slate-700 stroke-[1.6]" />
                <span className="text-[11px] font-medium text-slate-800">{t('fleet.dash.addDriver') || 'Add Driver'}</span>
              </button>
            </div>
          </div>

          {/* Operational Alerts Card */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-4 border border-[var(--color-border,#E4EAF4)] shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-foreground,#102047)] tracking-tight">{t('fleet.dash.operationalAlerts') || 'Operational Alerts'}</h3>
                <p className="text-[11px] text-[var(--color-foreground-muted,#637290)] mt-0.5">Real-time notifications</p>
              </div>
              <button 
                onClick={() => navigate('/fleet-dashboard/compliance')}
                className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
              >
                {t('fleet.dash.viewAll') || 'View All'}
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Wrench className="w-3.5 h-3.5 stroke-[1.8]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#102047]">
                      {isRTL ? 'المركبة AUH-4521' : 'Vehicle AUH-4521'}
                    </p>
                    <p className="text-[10.5px] text-[#637290]">
                      {isRTL ? 'موعد الصيانة خلال 3 أيام' : 'Maintenance due in 3 days'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-[#637290] shrink-0">{isRTL ? 'منذ 10 د' : '10 min ago'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                    <Fuel className="w-3.5 h-3.5 stroke-[1.8]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#102047]">
                      {isRTL ? 'تنبيه انخفاض الوقود' : 'Low Fuel Alert'}
                    </p>
                    <p className="text-[10.5px] text-[#637290]">
                      {isRTL ? 'مستوى وقود المركبة DXB-7789 أقل من 15%' : 'Vehicle DXB-7789 fuel below 15%'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-[#637290] shrink-0">{isRTL ? 'منذ 25 د' : '25 min ago'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5 stroke-[1.8]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#102047]">
                      {isRTL ? 'تذكير استراحة السائق' : 'Driver Break Reminder'}
                    </p>
                    <p className="text-[10.5px] text-[#637290]">
                      {isRTL ? 'السائق جيمس ويلسون تجاوز وقت الاستراحة' : 'Driver James Wilson overdue break'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-[#637290] shrink-0">{isRTL ? 'منذ 45 د' : '45 min ago'}</span>
              </div>
            </div>
          </div>

          {/* Health Score Card */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-4 border border-[var(--color-border,#E4EAF4)] shadow-2xs space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--color-foreground,#102047)] tracking-tight">{t('fleet.dash.healthScore') || 'Fleet Health Score'}</h3>
                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Beta</span>
              </div>
              <p className="text-[11px] text-[var(--color-foreground-muted,#637290)] mt-0.5">{t('fleet.dash.healthDesc') || 'Overall fleet performance rating'}</p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-sky-500"
                    strokeDasharray="78, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-extrabold text-[#102047]">78</span>
                  <span className="text-[9px] text-[#637290]">/100</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-semibold text-[#102047]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#637290] font-normal flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-slate-500" />
                    {t('fleet.dash.maintenance') || 'Maintenance'}
                  </span>
                  <span>82 / 100</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#637290] font-normal flex items-center gap-1.5">
                    <Fuel className="w-3.5 h-3.5 text-slate-500" />
                    {t('fleet.dash.fuelEfficiency') || 'Fuel Efficiency'}
                  </span>
                  <span>74 / 100</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#637290] font-normal flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-slate-500" />
                    {t('fleet.dash.fleetUtilization') || 'Utilization'}
                  </span>
                  <span>79 / 100</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#637290] font-normal flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-500" />
                    {t('fleet.dash.safety') || 'Safety'}
                  </span>
                  <span>76 / 100</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2 text-[10.5px] text-[#637290]">
              Improve your score by completing pending actions ℹ️
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FleetDashboard;
