import AppButton from '../components/dashboard/AppButton'
import { Activity, Edit2, Plus, Truck, Download, Search, Filter } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import DataTable from '../components/table/DataTable'
import { toast } from 'react-toastify'

const Trips = () => {

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Expandable filters state
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [toDateFilter, setToDateFilter] = useState('');

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const tripColumns = [
    { key: "tripNo", header: "Trip No" },
    { key: "tripDate", header: "Date" },
    { key: "driverName", header: "Driver", type: "avatarTitle" },
    { key: "containerNumber", header: "Container Number"},
    { key: "customerName", header: "Customer" },
    { key1: "fromLocation", key2: "toLocation", header: "From → To", type: "route" },
    { key: "amount", header: "Amount (AED)" },
    { key: "tokenAmount", header: "Token Amount (AED)" },
    { key: "tripStatus", header: "Status", type: "chip" },
    { key : "actions", header: "Actions", type: "actions", actions: [
        // View button — commented out until Trip Details page is finalized
        // {
        //   label: <View size={18} />,
        //   title: "View",
        //   onClick: (row) => navigate(`trip-details/${row.id}`)
        // },
        {
          label: <Truck size={18} />,
          title: "Dispatch",
          onClick: (row) => navigate(`dispatch/${row.id}`)
        },
        {
          label: <Activity size={18} />,
          title: "Track",
          onClick: (row) => navigate(`trip-tracker/${row.id}`)
        },
        {
          label: <Edit2 size={18}/>,
          title: "Edit",
          onClick: (row) => {
            navigate(`trip-form?id=${row.id}`)
          }
        }
      ]}
    ];

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchTrips = async (
    p = page, 
    s = size, 
    searchVal = debouncedSearch,
    status = statusFilter,
    fromDate = fromDateFilter,
    toDate = toDateFilter
  ) => {
    setLoading(true);
    try {
      const params = {
        page: p - 1, // backend is 0-indexed
        size: s,
        search: searchVal || undefined,
        status: status || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined
      };
      const response = await axios.get(`${API_URL}/fleet/trips`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTrips(response.data.content || []);
      setTotalElements(response.data.totalElements || 0);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchTrips(1, size, debouncedSearch, statusFilter, fromDateFilter, toDateFilter);
  }, [debouncedSearch, statusFilter, fromDateFilter, toDateFilter]);

  useEffect(() => {
    fetchTrips(page, size, debouncedSearch, statusFilter, fromDateFilter, toDateFilter);
  }, [page, size]);

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

      // Define columns to export
      const headers = ["Trip No", "Date", "Driver", "Container Number", "Customer", "From", "To", "Amount (AED)", "Token Amount (AED)", "Status"];
      
      const csvRows = [];
      csvRows.push(headers.join(","));

      allTrips.forEach(t => {
        const row = [
          `"${t.tripNo}"`,
          `"${(t.tripDate || '').replace(/"/g, '""')}"`,
          `"${(t.driverName || '').replace(/"/g, '""')}"`,
          `"${(t.containerNumber || '').replace(/"/g, '""')}"`,
          `"${(t.customerName || '').replace(/"/g, '""')}"`,
          `"${(t.fromLocation || '').replace(/"/g, '""')}"`,
          `"${(t.toLocation || '').replace(/"/g, '""')}"`,
          `"${t.amount || 0}"`,
          `"${t.tokenAmount || 0}"`,
          `"${(t.tripStatus || '').replace(/"/g, '""')}"`
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-theme shadow-sm border border-border">   
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Trips Management</h1>
          <p className="text-sm font-bold text-foreground-muted mt-2 opacity-80">Manage and monitor active cargo movements across the UAE</p>
        </div>
        <div className="flex gap-3">
          <AppButton
            variant="outline"
            icon={<Download size={18} />}
            className="border-border hover:bg-background-muted text-foreground transition-colors"
            onClick={handleExport}
          >
            Export
          </AppButton>
          <AppButton 
            icon={<Plus size={18} />}
            className="bg-primary hover:opacity-90 text-primary-foreground border-none shadow-md shadow-primary/20"
            onClick={()=>navigate('trip-form')}
          >
            Create New Trip
          </AppButton>
        </div>
      </div>

      <div className="bg-card rounded-theme shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-background-muted/50">
          <div className="flex items-center gap-3 w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={18} />
              <input
                placeholder="Search by trip number, customer or driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 border rounded-theme transition-all duration-200 ${
                showFilters || statusFilter || fromDateFilter || toDateFilter
                  ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                  : 'border-border hover:bg-background text-foreground-muted'
              }`}
              title="Filter by status and date"
            >
              <Filter size={18} />
            </button>
          </div>
          <div className="text-xs font-bold text-foreground-muted uppercase tracking-widest">
            {totalElements} Total Trips
          </div>
        </div>

        {/* Expandable Filter Drawer/Panel */}
        {showFilters && (
          <div className="p-4 border-b border-border bg-background-muted/20 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-down">
            <div>
              <label className="block text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
              >
                <option value="">All Statuses</option>
                <option value="CREATED">Created</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DELIVERED">Delivered</option>
                <option value="COMPLETED">Completed</option>
                <option value="INVOICED">Invoiced</option>
                <option value="PAID">Paid</option>
                <option value="CLOSED">Closed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2">From Date</label>
              <input
                type="date"
                value={fromDateFilter}
                onChange={(e) => setFromDateFilter(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2">To Date</label>
              <input
                type="date"
                value={toDateFilter}
                onChange={(e) => setToDateFilter(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
        )}

        <DataTable
          columns={tripColumns}
          data={trips}
          loading={loading}
          page={page}
          pageSize={size}
          totalPages={totalPages}
          totalRecords={totalElements}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => setSize(s)}
        />
      </div>
    </div>
  );
}

export default Trips