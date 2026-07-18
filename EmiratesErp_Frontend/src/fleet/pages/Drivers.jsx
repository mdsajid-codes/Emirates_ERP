import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, Filter, Phone, Mail, Award, Eye, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../tripManagement/components/table/DataTable';
import AppButton from '../tripManagement/components/dashboard/AppButton';
import DriverForm from './DriverForm';
import { toast } from 'react-toastify';

const Drivers = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
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

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/drivers/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      const allDrivers = response.data || [];
      if (allDrivers.length === 0) {
        toast.info("No driver records to export");
        return;
      }

      // Define columns to export
      const headers = ["Employee Code", "Name", "Phone", "Email", "License Number", "License Type", "License Expiry", "Status", "Assigned Vehicle"];
      
      const csvRows = [];
      csvRows.push(headers.join(","));

      allDrivers.forEach(d => {
        const row = [
          `"${(d.employeeCode || '').replace(/"/g, '""')}"`,
          `"${(d.name || '').replace(/"/g, '""')}"`,
          `"${(d.phone || '').replace(/"/g, '""')}"`,
          `"${(d.email || '').replace(/"/g, '""')}"`,
          `"${(d.licenseNumber || '').replace(/"/g, '""')}"`,
          `"${(d.licenseType || '').replace(/"/g, '""')}"`,
          `"${(d.licenseExpiry || '').replace(/"/g, '""')}"`,
          `"${(d.status || '').replace(/"/g, '""')}"`,
          `"${(d.assignedVehiclePlateNumber || 'None').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "Drivers_Directory_Report.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Drivers exported successfully");
    } catch (error) {
      console.error("Error exporting drivers:", error);
      toast.error("Failed to export drivers");
    }
  };

  const fetchDrivers = async (page = 0, size = 10, status = statusFilter, searchVal = debouncedSearch) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fleet/drivers`, {
        params: { page, size, status: status || undefined, search: searchVal || undefined },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const mappedData = (response.data.content || []).map(d => ({
        ...d,
        vehiclePlate: d.assignedVehiclePlateNumber || "None",
        avatar: d.profileImageUrl ? `${API_URL}/fleet/drivers/${d.id}/profile-image?t=${new Date().getTime()}` : null,
        licenseInfo: `${d.licenseNumber} (${d.licenseType || 'N/A'})`
      }));

      setDrivers(mappedData);
      setPagination({
        page: response.data.number,
        size: response.data.size,
        totalElements: response.data.totalElements
      });
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers(0, pagination.size, statusFilter, debouncedSearch);
  }, [statusFilter, debouncedSearch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;
    try {
      await axios.delete(`${API_URL}/fleet/drivers/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Driver deleted successfully");
      fetchDrivers(pagination.page, pagination.size);
    } catch (error) {
      console.error("Error deleting driver:", error);
      toast.error("Failed to delete driver");
    }
  };

  const columns = [
    { key: "name", header: "Driver Name", type: "avatarTitle" },
    { key: "employeeCode", header: "Emp. Code" },
    { key: "phone", header: "Contact", type: "phone" },
    { key: "licenseInfo", header: "License" },
    { key: "licenseExpiry", header: "Lic. Expiry", type: "date" },
    { key: "status", header: "Status", type: "chip" },
    { key: "vehiclePlate", header: "Assigned Vehicle" },
    {
      key: "actions",
      header: "Actions",
      type: "actions",
      actions: [
        {
          label: <Eye size={16} />,
          title: "View Details",
          onClick: (row) => navigate(`/fleet-dashboard/driver-details/${row.id}`)
        },
        {
          label: <Edit size={16} />,
          title: "Edit",
          onClick: (row) => {
            setEditData(row);
            setIsFormOpen(true);
          }
        },
        {
          label: <Trash2 size={16} className="text-error" />,
          title: "Delete",
          onClick: (row) => handleDelete(row.id)
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-theme shadow-sm border border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Drivers Directory</h1>
          <p className="text-sm text-foreground-muted mt-1">Manage transport personnel, licenses and availability</p>
        </div>
        <div className="flex gap-3">
          <select
            className="px-4 py-2 bg-background border border-border rounded-theme text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="OFF_DUTY">Off Duty</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <AppButton
            variant="outline"
            icon={<Download size={18} />}
            className="border-border hover:bg-background-muted text-foreground transition-colors"
            onClick={handleExport}
          >
            Export
          </AppButton>
          <AppButton
            variant="primary"
            icon={<Plus size={18} />}
            className="bg-primary hover:opacity-90 text-primary-foreground border-none shadow-md shadow-primary/20"
            onClick={() => {
              setEditData(null);
              setIsFormOpen(true);
            }}
          >
            Add Driver
          </AppButton>
        </div>
      </div>

      <div className="bg-card rounded-theme shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-background-muted/50">
          <div className="flex items-center gap-3 w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={18} />
              <input
                placeholder="Search by name, employee code or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <button 
              onClick={() => setStatusFilter(statusFilter === 'AVAILABLE' ? '' : 'AVAILABLE')}
              className={`p-2 border rounded-theme transition-all duration-200 ${
                statusFilter === 'AVAILABLE' 
                  ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                  : 'border-border hover:bg-background text-foreground-muted'
              }`}
              title="Toggle Available Status Only"
            >
              <Filter size={18} />
            </button>
          </div>
          <div className="text-xs font-bold text-foreground-muted uppercase tracking-widest">
            {pagination.totalElements} Total Drivers
          </div>
        </div>

        <DataTable
          columns={columns}
          data={drivers}
          loading={loading}
          page={pagination.page + 1}
          totalPages={Math.ceil(pagination.totalElements / pagination.size) || 1}
          totalRecords={pagination.totalElements}
          pageSize={pagination.size}
          onPageChange={(page) => fetchDrivers(page - 1, pagination.size)}
        />
      </div>

      <DriverForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        isEditing={!!editData}
        initialData={editData}
        onSave={() => fetchDrivers(pagination.page, pagination.size)}
      />

    </div>
  );
};

export default Drivers;
