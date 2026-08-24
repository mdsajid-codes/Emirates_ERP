import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Wrench, 
  AlertOctagon, 
  Calendar,
  Download,
  LayoutGrid,
  List,
  Columns
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VehicleForm from './VehicleForm';
import AssignDriverModal from './AssignDriverModal';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const Vehicles = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [assignVehicleData, setAssignVehicleData] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Stats calculation dynamically computed from real API vehicle list
  const stats = {
    totalAssets: pagination.totalElements || vehicles.length || 0,
    active: vehicles.filter(v => v.status === 'ACTIVE' || v.vehicleStatus === 'ACTIVE' || v.isActive).length,
    underMaintenance: vehicles.filter(v => v.status === 'MAINTENANCE' || v.status === 'UNDER MAINTENANCE' || v.vehicleStatus === 'MAINTENANCE').length,
    inactive: vehicles.filter(v => v.status === 'INACTIVE' || v.vehicleStatus === 'INACTIVE' || (!v.isActive && v.status !== 'MAINTENANCE')).length,
    insuranceExpiring: vehicles.filter(v => v.insuranceExpiringSoon || (v.insuranceExpiry && v.insuranceExpiry !== '–')).length,
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchVehicles = async (page = 0, size = 10, searchVal = debouncedSearch) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setVehicles([]);
        setLoading(false);
        return;
      }
      const response = await axios.get(`${API_URL}/fleet/vehicles`, {
        params: { page, size, search: searchVal },
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data && response.data.content) {
        const mappedData = response.data.content.map(v => ({
          ...v,
          plateNumber: v.plateNumber || v.plateNo || "–",
          vehicleType: v.vehicleType || v.type || "TRUCK",
          make: v.make || "–",
          model: v.model || "–",
          year: v.year || "–",
          driverName: v.assignedDriverName || (isRTL ? "غير مخصص" : "Unassigned"),
          insuranceExpiry: v.insuranceExpiryDate || v.insuranceExpiry || "–",
          status: v.vehicleStatus ? v.vehicleStatus : (v.isActive ? "ACTIVE" : "INACTIVE")
        }));
        setVehicles(mappedData);
        setPagination({
          page: response.data.number || 0,
          size: response.data.size || 10,
          totalElements: response.data.totalElements || mappedData.length
        });
      } else if (Array.isArray(response.data)) {
        const mappedData = response.data.map(v => ({
          ...v,
          plateNumber: v.plateNumber || v.plateNo || "–",
          vehicleType: v.vehicleType || v.type || "TRUCK",
          make: v.make || "–",
          model: v.model || "–",
          year: v.year || "–",
          driverName: v.assignedDriverName || (isRTL ? "غير مخصص" : "Unassigned"),
          insuranceExpiry: v.insuranceExpiryDate || v.insuranceExpiry || "–",
          status: v.vehicleStatus ? v.vehicleStatus : (v.isActive ? "ACTIVE" : "INACTIVE")
        }));
        setVehicles(mappedData);
        setPagination({ page: 0, size: 10, totalElements: mappedData.length });
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error(t('fleet.vehicles.fetchError') || "Failed to fetch vehicles from server");
      setVehicles([]);
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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(vehicles.map(v => v.id));
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
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-1 rounded-md font-semibold text-xs bg-[#E3F8EE] text-[#01A958] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#01A958]"></span>
            {isRTL ? 'نشط' : 'ACTIVE'}
          </span>
        );
      case 'UNDER MAINTENANCE':
      case 'MAINTENANCE':
        return (
          <span className="px-2.5 py-1 rounded-md font-semibold text-xs bg-[#FFF4E5] text-[#FF9800] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></span>
            {isRTL ? 'قيد الصيانة' : 'UNDER MAINTENANCE'}
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="px-2.5 py-1 rounded-md font-semibold text-xs bg-[#FDEBEC] text-[#D6282F] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D6282F]"></span>
            {isRTL ? 'غير نشط' : 'INACTIVE'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md font-semibold text-xs bg-slate-100 text-slate-700 inline-flex items-center gap-1.5">
            {status || (isRTL ? 'غير معروف' : 'UNKNOWN')}
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center justify-center text-[var(--color-primary,#2563EB)]">
            <Truck className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#0F172A)] tracking-tight leading-tight">
              {t('fleet.vehicles.title') || 'Fleet Inventory'}
            </h1>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-0.5">
              {t('fleet.vehicles.subtitle') || 'Manage and track all company vehicles and assets'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/fleet-dashboard/vehicles/vehicle-form')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary,#2563EB)] text-white text-xs font-semibold hover:opacity-90 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('fleet.vehicles.addVehicle') || 'Add Vehicle'}</span>
        </button>
      </div>

      {/* KPI Cards Row (Compact Gap Sizes matching Dashboard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        
        {/* Total Assets */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[var(--color-primary,#2563EB)] flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.vehicles.totalAssets') || 'Total Assets'}</p>
            <p className="text-xl font-extrabold text-[var(--color-primary,#2563EB)] leading-none my-0.5">{stats.totalAssets}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">{t('fleet.vehicles.allAssets') || 'All Company Assets'}</p>
          </div>
        </div>

        {/* Active */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[var(--color-primary,#2563EB)] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.vehicles.active') || 'Active'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{stats.active}</p>
            <p className="text-[10px] font-semibold text-[var(--color-primary,#2563EB)] truncate">{stats.totalAssets ? Math.round((stats.active / stats.totalAssets) * 100) : 0}% {t('fleet.vehicles.ofTotal') || 'of total'}</p>
          </div>
        </div>

        {/* Under Maintenance */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[var(--color-primary,#2563EB)] flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.vehicles.underMaintenance') || 'Under Maintenance'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{stats.underMaintenance}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">{stats.totalAssets ? Math.round((stats.underMaintenance / stats.totalAssets) * 100) : 0}% {t('fleet.vehicles.ofTotal') || 'of total'}</p>
          </div>
        </div>

        {/* Inactive */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-[#D6282F] flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.vehicles.inactive') || 'Inactive'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{stats.inactive}</p>
            <p className="text-[10px] font-semibold text-[#D6282F] truncate">{stats.totalAssets ? Math.round((stats.inactive / stats.totalAssets) * 100) : 0}% {t('fleet.vehicles.ofTotal') || 'of total'}</p>
          </div>
        </div>

        {/* Insurance Expiring */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[var(--color-primary,#2563EB)] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.vehicles.insuranceExpiring') || 'Insurance Expiring'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{stats.insuranceExpiring}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">{t('fleet.vehicles.next30Days') || 'Next 30 days'}</p>
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
                placeholder={t('fleet.vehicles.searchPlaceholder') || "Search by plate, make or model..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] rounded-xl text-xs text-[var(--color-foreground,#0F172A)] outline-none focus:border-[var(--color-primary,#2563EB)] transition-colors"
              />
            </div>

            {/* Filters Button */}
            <button className="inline-flex items-center gap-2 px-3.5 py-2 border border-[var(--color-border,#D9DADD)] rounded-xl text-xs font-semibold text-[var(--color-foreground,#0F172A)] hover:bg-slate-50 transition-colors cursor-pointer shrink-0">
              <Filter className="w-4 h-4 text-[var(--color-foreground,#0F172A)]" />
              <span>{t('fleet.vehicles.filters') || 'Filters'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Export Button */}
            <button className="inline-flex items-center gap-2 px-3.5 py-2 border border-[var(--color-border,#D9DADD)] rounded-xl text-xs font-semibold text-[var(--color-foreground,#0F172A)] hover:bg-slate-50 transition-colors cursor-pointer">
              <Download className="w-4 h-4 text-[var(--color-foreground,#0F172A)]" />
              <span>{t('fleet.vehicles.export') || 'Export'}</span>
            </button>

            {/* View Mode Toggle Buttons */}
            <div className="flex items-center gap-1">
              <button className="w-9 h-9 bg-[var(--color-primary,#2563EB)] text-white rounded-xl flex items-center justify-center shadow-xs cursor-pointer">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 border border-[var(--color-border,#D9DADD)] text-[var(--color-foreground,#0F172A)] rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer">
                <List className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 border border-[var(--color-border,#D9DADD)] text-[var(--color-foreground,#0F172A)] rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer">
                <Columns className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Data Table Container */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'جاري تحميل معلومات المركبات...' : 'Loading vehicle inventory...'}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'لا توجد مركبات متاحة حالياً.' : 'No vehicles found in database.'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-[var(--color-border,#D9DADD)]">
                <tr>
                  <th className="p-3.5 w-12 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedRows.length === vehicles.length && vehicles.length > 0}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary,#2563EB)] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.vehicles.plateNo') || 'PLATE NO'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.vehicles.type') || 'TYPE'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.vehicles.make') || 'MAKE'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.vehicles.model') || 'MODEL'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.vehicles.year') || 'YEAR'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.vehicles.assignedDriver') || 'ASSIGNED DRIVER'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.vehicles.insExpiry') || 'INS. EXPIRY'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.vehicles.status') || 'STATUS'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)] text-center">{t('fleet.vehicles.actions') || 'ACTIONS'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border,#D9DADD)] text-xs text-[var(--color-foreground,#0F172A)]">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(v.id)}
                        onChange={() => handleSelectRow(v.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary,#2563EB)] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td 
                      onClick={() => navigate(`/fleet-dashboard/vehicle-details/${v.id}`)}
                      className="p-3.5 font-bold text-[var(--color-primary,#2563EB)] cursor-pointer hover:underline"
                    >
                      {v.plateNumber || v.plateNo}
                    </td>
                    <td className="p-3.5 uppercase font-medium">{v.vehicleType || v.type}</td>
                    <td className="p-3.5">{v.make}</td>
                    <td className="p-3.5">{v.model || '–'}</td>
                    <td className="p-3.5">{v.year || '–'}</td>
                    <td className="p-3.5 font-medium">{v.driverName || v.assignedDriverName || (isRTL ? "غير مخصص" : "Unassigned")}</td>
                    <td className="p-3.5 text-[var(--color-foreground-muted,#656873)]">{v.insuranceExpiry || '–'}</td>
                    <td className="p-3.5">
                      {getStatusBadge(v.status)}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/fleet-dashboard/vehicle-details/${v.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#2563EB)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="View Vehicle"
                        >
                          <Eye className="w-4 h-4 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => navigate(`/fleet-dashboard/vehicles/vehicle-form/${v.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#2563EB)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Edit Vehicle"
                        >
                          <Edit className="w-4 h-4 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[#D6282F] hover:bg-rose-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Delete Vehicle"
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
            {t('fleet.vehicles.showing') || 'Showing'} {vehicles.length > 0 ? (pagination.page * pagination.size) + 1 : 0} {t('fleet.vehicles.of') || 'of'} {pagination.totalElements || vehicles.length} {t('fleet.vehicles.records') || 'records'}
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={pagination.page === 0}
              onClick={() => fetchVehicles(pagination.page - 1, pagination.size)}
              className="px-2.5 py-1.5 border border-[var(--color-border,#D9DADD)] rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              &lt;
            </button>
            <button className="px-3 py-1.5 bg-[var(--color-primary,#2563EB)] text-white font-bold rounded-lg cursor-pointer">
              {pagination.page + 1}
            </button>
            <button 
              disabled={(pagination.page + 1) * pagination.size >= pagination.totalElements}
              onClick={() => fetchVehicles(pagination.page + 1, pagination.size)}
              className="px-2.5 py-1.5 border border-[var(--color-border,#D9DADD)] rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              &gt;
            </button>
          </div>
        </div>

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
