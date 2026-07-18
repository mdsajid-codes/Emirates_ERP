import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';
import DataTable from '../tripManagement/components/table/DataTable';
import AppButton from '../tripManagement/components/dashboard/AppButton';
import RouteForm from './RouteForm';
import RouteDetails from './RouteDetails';
import { toast } from 'react-toastify';

const Routes = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(false);

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

  const fetchRoutes = async (p = page, s = size, searchVal = debouncedSearch) => {
    setLoading(true);
    try {
      const params = {
        page: p - 1, // backend is 0-indexed
        size: s,
        search: searchVal || undefined
      };
      const response = await axios.get(`${API_URL}/fleet/routes/paginated`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      const contentList = response.data.content || [];
      const mappedData = contentList.map(r => ({
        ...r,
        driverName: r.driverName && r.driverName !== "N/A" ? r.driverName : "Unassigned",
        vehiclePlate: r.vehiclePlateNumber && r.vehiclePlateNumber !== "N/A" ? r.vehiclePlateNumber : "Unassigned",
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
    fetchRoutes(1, size, debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchRoutes(page, size, debouncedSearch);
  }, [page, size]);

  const columns = [
    { key: "routeName", header: "Route Name", type: "avatarTitle" },
    { key: "routeDate", header: "Date", type: "date" },
    { key: "driverName", header: "Driver" },
    { key: "vehiclePlate", header: "Vehicle" },
    { key: "stopsCount", header: "Stops" },
    { key: "distance", header: "Distance" },
    { key: "status", header: "Status", type: "chip" },
    {
      key: "actions",
      header: "Actions",
      type: "actions",
      actions: [
        {
          label: <ChevronRight size={16} />,
          title: "Details",
          onClick: (row) => {
            setSelectedRoute(row);
            setViewingDetails(true);
          }
        }
      ]
    }
  ];

  if (viewingDetails && selectedRoute) {
    return (
      <RouteDetails 
        route={selectedRoute} 
        onBack={() => {
          setViewingDetails(false);
          setSelectedRoute(null);
        }} 
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-theme shadow-sm border border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Operational Routes</h1>
          <p className="text-sm text-foreground-muted mt-1">Plan and monitor multi-stop logistics journeys</p>
        </div>
        <AppButton
          variant="primary"
          icon={<Plus size={18} />}
          className="bg-primary hover:opacity-90 text-primary-foreground border-none shadow-md shadow-primary/20"
          onClick={() => {
            setSelectedRoute(null);
            setIsFormOpen(true);
          }}
        >
          Plan New Route
        </AppButton>
      </div>

      <div className="bg-card rounded-theme shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-background-muted/50">
          <div className="flex items-center gap-3 w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={18} />
              <input 
                placeholder="Search by route name, driver, or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
              />
            </div>
            <button className="p-2 border border-border rounded-theme hover:bg-background transition-colors text-foreground-muted">
              <Filter size={18} />
            </button>
          </div>
          <div className="text-xs font-bold text-foreground-muted uppercase tracking-widest">
            {totalElements} Active Routes
          </div>
        </div>

        <DataTable
          columns={columns}
          data={routes}
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalRecords={totalElements}
          pageSize={size}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => {
            setSize(s);
            setPage(1);
          }}
        />
      </div>

      <RouteForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        isEditing={!!selectedRoute}
        initialData={selectedRoute}
        onSave={fetchRoutes}
      />

    </div>
  );
};

export default Routes;
