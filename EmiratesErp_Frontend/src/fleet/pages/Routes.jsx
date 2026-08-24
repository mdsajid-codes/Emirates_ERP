import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Clock, 
  ChevronRight,
  Navigation,
  Truck,
  User,
  Eye,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  Columns
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const Routes = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination & Debouncing states
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchRoutes = async (p = page, s = size, searchVal = debouncedSearch, status = statusFilter) => {
    setLoading(true);
    try {
      const params = {
        page: p - 1, // backend is 0-indexed
        size: s,
        search: searchVal || undefined,
        status: status || undefined
      };
      const response = await axios.get(`${API_URL}/fleet/routes/paginated`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      const contentList = response.data.content || [];
      const mappedData = contentList.map(r => ({
        ...r,
        driverName: r.driverName && r.driverName !== "N/A" ? r.driverName : (r.driver?.name || "Unassigned"),
        vehiclePlate: r.vehiclePlateNumber && r.vehiclePlateNumber !== "N/A" ? r.vehiclePlateNumber : (r.vehicle?.plateNumber || "Unassigned"),
        stopsCount: r.stops ? r.stops.length : 0,
        distance: r.totalDistanceKm ? `${r.totalDistanceKm} KM` : "N/A"
      }));

      setRoutes(mappedData);
      setTotalElements(response.data.totalElements || 0);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast.error("Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchRoutes(1, size, debouncedSearch, statusFilter);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchRoutes(page, size, debouncedSearch, statusFilter);
  }, [page, size]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    try {
      await axios.delete(`${API_URL}/fleet/routes/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success("Route deleted successfully");
      fetchRoutes(page, size);
    } catch (error) {
      console.error("Error deleting route:", error);
      toast.error("Failed to delete route");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-[#E3F8EE] text-[#01A958] border-[#A3EBC7]';
      case 'IN_PROGRESS': return 'bg-amber-50 text-amber-600 border-amber-200';
      default: return 'bg-sky-50 text-[var(--color-primary,#0178BC)] border-sky-200';
    }
  };

  const totalDistanceSum = routes.reduce((acc, curr) => acc + (curr.totalDistanceKm || 0), 0);

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
              {t('fleet.routes.title') || 'Operational Routes'}
            </h1>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-0.5">
              {t('fleet.routes.subtitle') || 'Plan and monitor multi-stop logistics journeys'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/fleet-dashboard/routes/route-form')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00A9A8] text-white text-xs font-semibold hover:opacity-90 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('fleet.routes.planRoute') || 'Plan New Route'}</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Total Routes */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.routes.totalRoutes') || 'Total Routes'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{totalElements}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">Logistics Journeys</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.routes.inProgress') || 'In Progress'}</p>
            <p className="text-xl font-extrabold text-amber-600 leading-none my-0.5">{routes.filter(r => r.status === 'IN_PROGRESS').length}</p>
            <p className="text-[10px] text-amber-600 font-semibold truncate">Active En-Route</p>
          </div>
        </div>

        {/* Scheduled */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.routes.scheduled') || 'Scheduled'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{routes.filter(r => r.status !== 'IN_PROGRESS' && r.status !== 'COMPLETED').length}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">Upcoming Routes</p>
          </div>
        </div>

        {/* Total Distance (KM) */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.routes.totalDistance') || 'Total Distance (KM)'}</p>
            <p className="text-xl font-extrabold text-emerald-600 leading-none my-0.5 font-mono">{totalDistanceSum} KM</p>
            <p className="text-[10px] text-emerald-600 font-semibold truncate">Page Distance Sum</p>
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
                placeholder={t('fleet.routes.searchPlaceholder') || "Search by route name, driver, or vehicle..."}
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
              <option value="PLANNED">PLANNED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 justify-end w-full sm:w-auto">
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

        {/* Data Table Container */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'جاري تحميل المسارات...' : 'Loading operational routes...'}
            </div>
          ) : routes.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'لا توجد مسارات متاحة' : 'No operational routes found'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead className="bg-slate-50 border-b border-[var(--color-border,#D9DADD)]">
                <tr>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">ROUTE NAME</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">DATE</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">DRIVER</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">VEHICLE</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">STOPS</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">DISTANCE</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">STATUS</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)] text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border,#D9DADD)] text-xs text-[var(--color-foreground,#0F172A)]">
                {routes.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td 
                      onClick={() => navigate(`/fleet-dashboard/routes/route-details/${row.id}`)}
                      className="p-3.5 cursor-pointer font-bold text-[var(--color-primary,#0178BC)] hover:underline"
                    >
                      {row.routeName}
                    </td>

                    <td className="p-3.5 text-[var(--color-foreground-muted,#656873)] font-sans">{row.routeDate}</td>

                    <td className="p-3.5 font-semibold flex items-center gap-1.5">
                      <User size={13} className="text-slate-400" />
                      {row.driverName}
                    </td>

                    <td className="p-3.5 font-bold font-mono">
                      <span className="flex items-center gap-1.5">
                        <Truck size={13} className="text-[var(--color-primary,#0178BC)]" />
                        {row.vehiclePlate}
                      </span>
                    </td>

                    <td className="p-3.5 font-bold">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {row.stopsCount} Stops
                      </span>
                    </td>

                    <td className="p-3.5 font-bold font-mono text-emerald-600">{row.distance}</td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(row.status)}`}>
                        {row.status || 'PLANNED'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/fleet-dashboard/routes/route-details/${row.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#0178BC)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 stroke-[1.8]" />
                        </button>

                        <button
                          onClick={() => navigate(`/fleet-dashboard/routes/route-form/${row.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#0178BC)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Edit Route"
                        >
                          <Edit2 className="w-4 h-4 stroke-[1.8]" />
                        </button>

                        <button
                          onClick={() => handleDelete(row.id)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[#D6282F] hover:bg-rose-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Delete Route"
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
            Showing page <span className="font-bold text-[var(--color-foreground,#0F172A)]">{page}</span> of <span className="font-bold text-[var(--color-foreground,#0F172A)]">{totalPages || 1}</span> ({totalElements} records)
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              className="px-2.5 py-1.5 border border-[var(--color-border,#D9DADD)] rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              &lt;
            </button>
            <button className="px-3 py-1.5 bg-[var(--color-primary,#0178BC)] text-white font-bold rounded-lg cursor-pointer">
              {page}
            </button>
            <button 
              disabled={page >= totalPages}
              onClick={() => setPage(prev => prev + 1)}
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

export default Routes;
