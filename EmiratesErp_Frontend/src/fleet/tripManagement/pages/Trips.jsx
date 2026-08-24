import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  Eye, 
  Navigation, 
  CheckCircle2, 
  Truck, 
  Clock, 
  TrendingUp,
  Download,
  LayoutGrid,
  List,
  Columns,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../../context/LanguageContext';

const Trips = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const stats = {
    totalTrips: pagination.totalElements || trips.length || 0,
    inTransit: trips.filter(t => t.tripStatus === 'IN_TRANSIT').length,
    scheduledTrips: trips.filter(t => t.tripStatus === 'SCHEDULED').length,
    totalRevenue: trips.reduce((acc, t) => acc + (Number(t.amount) || 0), 0),
    completedTrips: trips.filter(t => t.tripStatus === 'DELIVERED' || t.tripStatus === 'COMPLETED').length
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/trips/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      const allTrips = response.data || [];
      if (allTrips.length === 0) {
        toast.info("No trip records to export");
        return;
      }

      const headers = ["Trip No", "Date", "Driver", "Container Number", "Customer", "From", "To", "Amount (AED)", "Token Amount (AED)", "Status"];
      const csvRows = [];
      csvRows.push(headers.join(","));

      allTrips.forEach(t => {
        const row = [
          `"${(t.tripNo || '').replace(/"/g, '""')}"`,
          `"${(t.tripDate || '').replace(/"/g, '""')}"`,
          `"${(t.driverName || t.driver?.name || '').replace(/"/g, '""')}"`,
          `"${(t.containerNumber || '').replace(/"/g, '""')}"`,
          `"${(t.customerName || t.customer?.companyName || '').replace(/"/g, '""')}"`,
          `"${(t.fromLocation || '').replace(/"/g, '""')}"`,
          `"${(t.toLocation || '').replace(/"/g, '""')}"`,
          `"${t.amount || 0}"`,
          `"${t.tokenAmount || 0}"`,
          `"${(t.tripStatus || 'SCHEDULED').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "Trips_Directory_Report.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Trips exported successfully");
    } catch (error) {
      console.error("Error exporting trips:", error);
      toast.error("Failed to export trips");
    }
  };

  const fetchTrips = async (page = 0, size = 10, searchVal = debouncedSearch) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setTrips([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/fleet/trips`, {
        params: { page, size, search: searchVal || undefined, status: statusFilter || undefined },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.content) {
        setTrips(response.data.content);
        setPagination({
          page: response.data.number || 0,
          size: response.data.size || 10,
          totalElements: response.data.totalElements || response.data.content.length
        });
      } else if (Array.isArray(response.data)) {
        setTrips(response.data);
        setPagination({ page: 0, size: 10, totalElements: response.data.length });
      } else {
        setTrips([]);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(0, pagination.size, debouncedSearch);
  }, [statusFilter, debouncedSearch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this trip manifest?")) return;
    try {
      await axios.delete(`${API_URL}/fleet/trips/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Trip deleted successfully");
      fetchTrips(pagination.page, pagination.size);
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast.error("Failed to delete trip");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(trips.map(t => t.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rId => rId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-md font-semibold text-xs bg-[#E3F8EE] text-[#01A958] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#01A958]"></span>
            {isRTL ? 'مكتمل' : 'DELIVERED'}
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="px-2.5 py-1 rounded-md font-semibold text-xs bg-blue-50 text-[#0178BC] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0178BC]"></span>
            {isRTL ? 'قيد العبور' : 'IN TRANSIT'}
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="px-2.5 py-1 rounded-md font-semibold text-xs bg-[#FFF4E5] text-[#FF9800] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></span>
            {isRTL ? 'مجدول' : 'SCHEDULED'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md font-semibold text-xs bg-slate-100 text-slate-700 inline-flex items-center gap-1.5">
            {status || 'SCHEDULED'}
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center justify-center text-[var(--color-primary,#0178BC)]">
            <Navigation className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#0F172A)] tracking-tight leading-tight">
              {t('fleet.trips.title') || 'Trips Management'}
            </h1>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-0.5">
              {t('fleet.trips.subtitle') || 'Manage and monitor active cargo movements across the UAE'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/fleet-dashboard/trips/trip-form')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary,#0178BC)] text-white text-xs font-semibold hover:opacity-90 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('fleet.trips.createTrip') || 'Create New Trip'}</span>
        </button>
      </div>

      {/* 5 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        
        {/* Total Trips */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.trips.totalTrips') || 'Total Trips'}</p>
            <p className="text-xl font-extrabold text-[var(--color-primary,#0178BC)] leading-none my-0.5">{stats.totalTrips}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">Cargo Operations</p>
          </div>
        </div>

        {/* In Transit */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.trips.inTransit') || 'In Transit'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{stats.inTransit}</p>
            <p className="text-[10px] font-semibold text-emerald-600 truncate">Active Movements</p>
          </div>
        </div>

        {/* Scheduled Trips */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.trips.scheduledTrips') || 'Scheduled Trips'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{stats.scheduledTrips}</p>
            <p className="text-[10px] text-amber-600 font-semibold truncate">Pending Dispatch</p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.trips.totalRevenue') || 'Total Revenue'}</p>
            <p className="text-base font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5 truncate">AED {stats.totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">Freight Earnings</p>
          </div>
        </div>

        {/* Completed Trips */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-teal-50 text-[#00A9A8] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.trips.completedTrips') || 'Completed Trips'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{stats.completedTrips}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">Successful Deliveries</p>
          </div>
        </div>

      </div>

      {/* Main Table Section Card */}
      <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] shadow-xs overflow-hidden">
        
        {/* Table Controls Top Bar */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[var(--color-border,#D9DADD)]">
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-foreground-muted,#656873)] w-4 h-4" />
              <input
                type="text"
                placeholder={t('fleet.trips.searchPlaceholder') || "Search by trip number, customer or driver..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] rounded-xl text-xs text-[var(--color-foreground,#0F172A)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-[var(--color-border,#D9DADD)] rounded-xl text-xs font-semibold text-[var(--color-foreground,#0F172A)] bg-[var(--color-card,#ffffff)] outline-none cursor-pointer"
            >
              <option value="">{t('fleet.drivers.allStatuses') || 'All Statuses'}</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="IN_TRANSIT">IN TRANSIT</option>
              <option value="DELIVERED">DELIVERED</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Export Button */}
            <button 
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-[var(--color-border,#D9DADD)] rounded-xl text-xs font-semibold text-[var(--color-foreground,#0F172A)] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[var(--color-foreground,#0F172A)]" />
              <span>{t('fleet.drivers.export') || 'Export'}</span>
            </button>

            {/* View Mode Toggle Buttons */}
            <div className="flex items-center gap-1">
              <button className="w-9 h-9 bg-[var(--color-primary,#0178BC)] text-white rounded-xl flex items-center justify-center shadow-xs cursor-pointer">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 border border-[var(--color-border,#D9DADD)] text-[var(--color-foreground,#0F172A)] rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer">
                <List className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 border border-[var(--color-border,#D9DADD)] text-[var(--color-border,#D9DADD)] rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer">
                <Columns className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Data Table Container */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'جاري تحميل قائمة الرحلات...' : 'Loading trips directory...'}
            </div>
          ) : trips.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'لا توجد بيانات متاحة للمعايير المحددة' : 'No data found for the selected criteria'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-[var(--color-border,#D9DADD)]">
                <tr>
                  <th className="p-3.5 w-12 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedRows.length === trips.length && trips.length > 0}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary,#0178BC)] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">TRIP NO</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">DATE</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">DRIVER</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">CONTAINER NUMBER</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">CUSTOMER</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">FROM → TO</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">AMOUNT (AED)</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">TOKEN AMOUNT (AED)</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">STATUS</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)] text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border,#D9DADD)] text-xs text-[var(--color-foreground,#0F172A)]">
                {trips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(t.id)}
                        onChange={() => handleSelectRow(t.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary,#0178BC)] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td 
                      onClick={() => navigate(`/fleet-dashboard/trips/trip-details/${t.id}`)}
                      className="p-3.5 font-bold text-[var(--color-primary,#0178BC)] cursor-pointer hover:underline font-mono"
                    >
                      {t.tripNo || `TRIP-${t.id}`}
                    </td>
                    <td className="p-3.5 font-medium">{t.tripDate || '–'}</td>
                    <td className="p-3.5 font-bold text-[var(--color-foreground,#0F172A)]">{t.driverName || t.driver?.name || '–'}</td>
                    <td className="p-3.5 font-mono text-[var(--color-foreground-muted,#656873)]">{t.containerNumber || '–'}</td>
                    <td className="p-3.5 font-semibold text-purple-600">{t.customerName || t.customer?.companyName || '–'}</td>
                    <td className="p-3.5 font-medium truncate max-w-[200px]">{t.fromLocation} → {t.toLocation}</td>
                    <td className="p-3.5 font-extrabold text-[var(--color-foreground,#0F172A)]">AED {Number(t.amount || 0).toLocaleString()}</td>
                    <td className="p-3.5 font-bold text-slate-600">AED {Number(t.tokenAmount || 0).toLocaleString()}</td>
                    <td className="p-3.5">
                      {getStatusBadge(t.tripStatus)}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/fleet-dashboard/trips/trip-details/${t.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#0178BC)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="View Trip"
                        >
                          <Eye className="w-4 h-4 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => navigate(`/fleet-dashboard/trips/dispatch/${t.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Dispatch Trip"
                        >
                          <Truck className="w-4 h-4 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => navigate(`/fleet-dashboard/trips/trip-tracker/${t.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Track Trip"
                        >
                          <Activity className="w-4 h-4 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => navigate(`/fleet-dashboard/trips/trip-form/${t.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#0178BC)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Edit Trip"
                        >
                          <Edit2 className="w-4 h-4 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[#D6282F] hover:bg-rose-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Delete Trip"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.8]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Pagination Bar */}
        <div className="p-4 flex items-center justify-between border-t border-[var(--color-border,#D9DADD)] text-xs text-[var(--color-foreground-muted,#656873)]">
          <div>
            {t('fleet.vehicles.showing') || 'Showing'} {trips.length > 0 ? (pagination.page * pagination.size) + 1 : 0} {t('fleet.vehicles.of') || 'of'} {pagination.totalElements || trips.length} {t('fleet.vehicles.records') || 'records'}
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={pagination.page === 0}
              onClick={() => fetchTrips(pagination.page - 1, pagination.size)}
              className="px-2.5 py-1.5 border border-[var(--color-border,#D9DADD)] rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              &lt;
            </button>
            <button className="px-3 py-1.5 bg-[var(--color-primary,#0178BC)] text-white font-bold rounded-lg cursor-pointer">
              {pagination.page + 1}
            </button>
            <button 
              disabled={(pagination.page + 1) * pagination.size >= pagination.totalElements}
              onClick={() => fetchTrips(pagination.page + 1, pagination.size)}
              className="px-2.5 py-1.5 border border-[var(--color-border,#D9DADD)] rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              &gt;
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Trips;