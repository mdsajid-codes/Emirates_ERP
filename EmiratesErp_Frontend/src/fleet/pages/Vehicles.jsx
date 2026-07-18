import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, Filter, UserPlus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../tripManagement/components/table/DataTable';
import AppButton from '../tripManagement/components/dashboard/AppButton';
import VehicleForm from './VehicleForm';
import AssignDriverModal from './AssignDriverModal';
import { toast } from 'react-toastify';

const Vehicles = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [assignVehicleData, setAssignVehicleData] = useState(null);
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

  const fetchVehicles = async (page = 0, size = 10, searchVal = debouncedSearch) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fleet/vehicles`, {
        params: { page, size, search: searchVal },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      const mappedData = (response.data.content || []).map(v => ({
        ...v,
        driverName: v.assignedDriverName || "Unassigned",
        status: v.vehicleStatus ? v.vehicleStatus : (v.isActive ? "ACTIVE" : "INACTIVE")
      }));

      setVehicles(mappedData);
      setPagination({
        page: response.data.number,
        size: response.data.size,
        totalElements: response.data.totalElements
      });
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(0, pagination.size, debouncedSearch);
  }, [debouncedSearch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await axios.delete(`${API_URL}/fleet/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Vehicle deleted successfully");
      fetchVehicles(pagination.page, pagination.size);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Failed to delete vehicle");
    }
  };

  const columns = [
    { key: "plateNumber", header: "Plate No", type: "avatarTitle" },
    { key: "vehicleType", header: "Type", type: "chip" },
    { key: "make", header: "Make" },
    { key: "model", header: "Model" },
    { key: "year", header: "Year" },
    { 
      key: "driverName", 
      header: "Assigned Driver",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className={`text-sm ${row.assignedDriverId ? 'text-foreground font-medium' : 'text-foreground-muted italic'}`}>
            {row.driverName}
          </span>
          <button
            onClick={() => {
              setAssignVehicleData(row);
              setIsAssignModalOpen(true);
            }}
            className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all group shadow-sm"
            title={row.assignedDriverId ? "Change Driver" : "Assign Driver"}
          >
            <UserPlus size={14} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )
    },
    { key: "insuranceExpiry", header: "Ins. Expiry", type: "date" },
    { key: "status", header: "Status", type: "chip" },
    {
      key: "actions",
      header: "Actions",
      type: "actions",
      actions: [
        {
          label: <Eye size={16} className="text-primary" />,
          title: "View Details",
          onClick: (row) => navigate(`/fleet-dashboard/vehicle-details/${row.id}`)
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
          <h1 className="text-2xl font-bold text-foreground">Fleet Inventory</h1>
          <p className="text-sm text-foreground-muted mt-1">Manage and track all company vehicles and assets</p>
        </div>
        <AppButton
          variant="primary"
          icon={<Plus size={18} />}
          className="bg-primary hover:opacity-90 text-primary-foreground border-none shadow-md shadow-primary/20"
          onClick={() => {
            setEditData(null);
            setIsFormOpen(true);
          }}
        >
          Add Vehicle
        </AppButton>
      </div>

      <div className="bg-card rounded-theme shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-background-muted/50">
          <div className="flex items-center gap-3 w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={18} />
              <input 
                placeholder="Search by plate, make or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <button className="p-2 border border-border rounded-theme hover:bg-background transition-colors text-foreground-muted">
              <Filter size={18} />
            </button>
          </div>
          <div className="text-xs font-bold text-foreground-muted uppercase tracking-widest">
            {pagination.totalElements} Total Assets
          </div>
        </div>

        <DataTable
          columns={columns}
          data={vehicles}
          loading={loading}
          page={pagination.page + 1}
          totalPages={Math.ceil(pagination.totalElements / pagination.size) || 1}
          totalRecords={pagination.totalElements}
          pageSize={pagination.size}
          onPageChange={(page) => fetchVehicles(page - 1, pagination.size)}
        />
      </div>

      <VehicleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        isEditing={!!editData}
        initialData={editData}
        onSave={() => fetchVehicles(pagination.page, pagination.size)}
      />

      <AssignDriverModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        vehicle={assignVehicleData}
        onSave={() => fetchVehicles(pagination.page, pagination.size)}
      />

    </div>
  );
};

export default Vehicles;
