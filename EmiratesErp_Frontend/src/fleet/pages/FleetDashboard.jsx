import { useEffect, useState } from 'react';
import axios from 'axios';
import { Truck, Users, Navigation, AlertCircle, ChevronRight, Wrench, ClipboardList, Fuel } from 'lucide-react';
import DataTable from '../tripManagement/components/table/DataTable';
import AppButton from '../tripManagement/components/dashboard/AppButton';
import { useNavigate } from 'react-router-dom';

const FleetDashboard = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenueMTD: 0,
    totalRevenueYTD: 0,
    totalExpensesMTD: 0,
    totalExpensesYTD: 0,
    totalVehiclesCount: 0,
    activeVehiclesCount: 0,
    activeDriversCount: 0,
    maintenanceVehiclesCount: 0,
    tripsTodayCount: 0,
    onTimeDeliveryPercentage: 0,
    fleetUtilizationPercentage: 0,
    avgFuelEfficiency: 0,
    pendingComplaintsCount: 0,
    expiringDocumentsCount: 0
  });
  const [recentVehicles, setRecentVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  const vehicleColumns = [
    { key: "plateNumber", header: "Plate No", type: "avatarTitle" },
    { key: "vehicleType", header: "Type" },
    { key: "make", header: "Make" },
    { key: "model", header: "Model" },
    { key: "assignedDriverName", header: "Driver" },
    { key: "isActive", header: "Status", type: "active" },
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      
      // Fetch consolidated stats
      const statsRes = await axios.get(`${API_URL}/fleet/dashboard/stats`, { headers });
      setStats(statsRes.data);

      // Fetch recent vehicles for the table
      const vRes = await axios.get(`${API_URL}/fleet/vehicles`, { params: { size: 5 }, headers });
      const vehicles = (vRes.data.content || []).map(v => ({
        ...v,
        assignedDriverName: v.assignedDriverName || "Unassigned"
      }));
      setRecentVehicles(vehicles);

    } catch (error) {
      console.error("Error fetching fleet dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(val);

  const statCards = [
    { 
      title: "Total Revenue", 
      value: formatCurrency(stats.totalRevenueMTD), 
      subValue: `YTD: ${formatCurrency(stats.totalRevenueYTD)}`,
      icon: ClipboardList, 
      color: "text-primary", 
      bg: "bg-primary/10" 
    },
    { 
      title: "Total Expenses", 
      value: formatCurrency(stats.totalExpensesMTD), 
      subValue: `YTD: ${formatCurrency(stats.totalExpensesYTD)}`,
      icon: Fuel, 
      color: "text-error", 
      bg: "bg-error/10" 
    },
    { title: "Active Vehicles", value: stats.activeVehiclesCount, subValue: `${stats.totalVehiclesCount} Total Assets`, icon: Truck, color: "text-success", bg: "bg-success/10" },
    { title: "Active Drivers", value: stats.activeDriversCount, subValue: "On-Duty", icon: Users, color: "text-info", bg: "bg-info/10" },
    { title: "Trips Today", value: stats.tripsTodayCount, subValue: "Scheduled Ops", icon: Navigation, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Fuel Efficiency", value: `${stats.avgFuelEfficiency.toFixed(1)}`, subValue: "km / Liter", icon: Fuel, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Fleet Utilization", value: `${stats.fleetUtilizationPercentage}%`, subValue: "Capacity Used", icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Pending Complaints", value: stats.pendingComplaintsCount, subValue: "Action Required", icon: AlertCircle, color: stats.pendingComplaintsCount > 0 ? "text-error" : "text-success", bg: stats.pendingComplaintsCount > 0 ? "bg-error/10" : "bg-success/10" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fleet Dashboard</h1>
          <p className="text-foreground-muted mt-1">Overview of your logistics assets and active operations</p>
        </div>
        <AppButton 
          variant="primary" 
          className="bg-primary hover:opacity-90 text-primary-foreground border-none shadow-md shadow-primary/20"
          onClick={() => navigate('/fleet-dashboard/vehicles')}
        >
          Manage Fleet
        </AppButton>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card p-6 rounded-theme border border-border shadow-sm flex flex-col gap-4 transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-theme ${stat.bg} ${stat.color}`}>
                  <Icon size={20} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest">{stat.title}</p>
                  <h3 className="text-xl font-black text-foreground mt-0.5">{stat.value}</h3>
                </div>
              </div>
              <div className="pt-3 border-t border-border/50">
                <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-tighter opacity-70">
                  {stat.subValue}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Vehicles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Recent Vehicles</h2>
            <button 
              onClick={() => navigate('/fleet-dashboard/vehicles')}
              className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>
          <DataTable 
            columns={vehicleColumns} 
            data={recentVehicles} 
            loading={loading}
          />
        </div>

        {/* Quick Actions / Alerts */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Operational Alerts</h2>
          
          <div className="space-y-4">
            {stats.pendingComplaintsCount > 0 && (
              <div className="bg-error/10 border border-error/20 p-4 rounded-theme flex gap-3">
                <AlertCircle className="text-error flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-error">Unresolved Incidents</p>
                  <p className="text-xs text-error/80 mt-1">{stats.pendingComplaintsCount} complaints are currently pending investigation or resolution.</p>
                  <button 
                    onClick={() => navigate('/fleet-dashboard/complaints')}
                    className="text-xs font-bold text-error mt-3 hover:underline"
                  >
                    Take Action
                  </button>
                </div>
              </div>
            )}

            {stats.maintenanceVehiclesCount > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-theme flex gap-3">
                <Wrench className="text-amber-500 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-amber-500">Fleet Maintenance</p>
                  <p className="text-xs text-amber-500/80 mt-1">{stats.maintenanceVehiclesCount} vehicles are currently in the garage.</p>
                  <button 
                    onClick={() => navigate('/fleet-dashboard/maintenance')}
                    className="text-xs font-bold text-amber-500 mt-3 hover:underline"
                  >
                    View Status
                  </button>
                </div>
              </div>
            )}

            <div className="bg-card border border-border p-5 rounded-theme shadow-sm space-y-4">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border pb-2">Quick Access</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate('/fleet-dashboard/maintenance')}
                  className="p-3 bg-background-muted rounded-theme text-xs font-bold text-foreground-muted hover:bg-primary/10 hover:text-primary transition-colors flex flex-col items-center gap-2"
                >
                  <Wrench size={20} />
                  Maintenance
                </button>
                <button 
                  onClick={() => navigate('/fleet-dashboard/dispatch')}
                  className="p-3 bg-background-muted rounded-theme text-xs font-bold text-foreground-muted hover:bg-primary/10 hover:text-primary transition-colors flex flex-col items-center gap-2"
                >
                  <ClipboardList size={20} />
                  Dispatch
                </button>
                <button 
                  onClick={() => navigate('/fleet-dashboard/fuel')}
                  className="p-3 bg-background-muted rounded-theme text-xs font-bold text-foreground-muted hover:bg-primary/10 hover:text-primary transition-colors flex flex-col items-center gap-2"
                >
                  <Fuel size={20} />
                  Fuel Logs
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default FleetDashboard;
