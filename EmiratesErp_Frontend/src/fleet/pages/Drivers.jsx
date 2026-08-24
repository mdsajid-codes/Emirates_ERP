import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Eye, 
  Users, 
  CheckCircle2, 
  Navigation, 
  Clock, 
  ShieldCheck,
  Download,
  LayoutGrid,
  List,
  Columns
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DriverForm from './DriverForm';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const Drivers = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
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
    totalPersonnel: pagination.totalElements || drivers.length || 0,
    available: drivers.filter(d => d.status === 'AVAILABLE' || d.status === 'ACTIVE').length,
    onTrip: drivers.filter(d => d.status === 'ON_TRIP' || d.status === 'ON TRIP').length,
    offDuty: drivers.filter(d => d.status === 'OFF_DUTY' || d.status === 'ON_LEAVE' || d.status === 'OFF DUTY').length,
    licenseExpiring: drivers.filter(d => d.licenseExpiringSoon || (d.licenseExpiry && d.licenseExpiry !== '–')).length
  };

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
      const token = localStorage.getItem("token");
      if (!token) {
        setDrivers([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/fleet/drivers`, {
        params: { page, size, status: status || undefined, search: searchVal || undefined },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.content) {
        const mappedData = response.data.content.map(d => ({
          ...d,
          driverName: d.name || d.fullName || "–",
          vehiclePlate: d.assignedVehiclePlateNumber || (isRTL ? "غير مخصص" : "Unassigned"),
          licenseInfo: d.licenseNumber ? `${d.licenseNumber} (${d.licenseType || 'Heavy'})` : "–"
        }));
        setDrivers(mappedData);
        setPagination({
          page: response.data.number || 0,
          size: response.data.size || 10,
          totalElements: response.data.totalElements || mappedData.length
        });
      } else if (Array.isArray(response.data)) {
        const mappedData = response.data.map(d => ({
          ...d,
          driverName: d.name || d.fullName || "–",
          vehiclePlate: d.assignedVehiclePlateNumber || (isRTL ? "غير مخصص" : "Unassigned"),
          licenseInfo: d.licenseNumber ? `${d.licenseNumber} (${d.licenseType || 'Heavy'})` : "–"
        }));
        setDrivers(mappedData);
        setPagination({ page: 0, size: 10, totalElements: mappedData.length });
      } else {
        setDrivers([]);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setDrivers([]);
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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(drivers.map(d => d.id));
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
      case 'AVAILABLE':
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-1 rounded-md font-semibold text-xs bg-[#E3F8EE] text-[#01A958] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#01A958]"></span>
            {isRTL ? 'متاح' : 'AVAILABLE'}
          </span>
        );
      case 'ON_TRIP':
      case 'ON TRIP':
        return (
          <span className="px-2.5 py-1 rounded-md font-semibold text-xs bg-[#EEF4FF] text-[#2563EB] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
            {isRTL ? 'في رحلة' : 'ON TRIP'}
          </span>
        );
      case 'OFF_DUTY':
      case 'OFF DUTY':
      case 'ON_LEAVE':
        return (
          <span className="px-2.5 py-1 rounded-md font-semibold text-xs bg-[#FFF4E5] text-[#FF9800] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></span>
            {isRTL ? 'خارج الخدمة' : 'OFF DUTY'}
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="px-2.5 py-1 rounded-md font-semibold text-xs bg-[#FDEBEC] text-[#D6282F] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D6282F]"></span>
            {isRTL ? 'موقوف' : 'SUSPENDED'}
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
            <Users className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#0F172A)] tracking-tight leading-tight">
              {t('fleet.drivers.title') || 'Drivers Directory'}
            </h1>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-0.5">
              {t('fleet.drivers.subtitle') || 'Manage transport personnel, licenses and availability'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/fleet-dashboard/drivers/driver-form')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary,#2563EB)] text-white text-xs font-semibold hover:opacity-90 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('fleet.drivers.addDriver') || 'Add Driver'}</span>
        </button>
      </div>

      {/* 5 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        
        {/* Total Personnel */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[var(--color-primary,#2563EB)] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.drivers.totalPersonnel') || 'Total Personnel'}</p>
            <p className="text-xl font-extrabold text-[var(--color-primary,#2563EB)] leading-none my-0.5">{stats.totalPersonnel}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">{t('fleet.drivers.allPersonnel') || 'All Transport Personnel'}</p>
          </div>
        </div>

        {/* Available */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.drivers.available') || 'Available'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{stats.available}</p>
            <p className="text-[10px] font-semibold text-emerald-600 truncate">{stats.totalPersonnel ? Math.round((stats.available / stats.totalPersonnel) * 100) : 0}% of total</p>
          </div>
        </div>

        {/* On Trip */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.drivers.onTrip') || 'On Trip'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{stats.onTrip}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">{stats.totalPersonnel ? Math.round((stats.onTrip / stats.totalPersonnel) * 100) : 0}% of total</p>
          </div>
        </div>

        {/* Off Duty */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.drivers.offDuty') || 'Off Duty'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{stats.offDuty}</p>
            <p className="text-[10px] text-amber-600 font-semibold truncate">{stats.totalPersonnel ? Math.round((stats.offDuty / stats.totalPersonnel) * 100) : 0}% of total</p>
          </div>
        </div>

        {/* License Expiring */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[var(--color-primary,#2563EB)] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.drivers.licenseExpiring') || 'License Expiring'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{stats.licenseExpiring}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">{t('fleet.drivers.next30Days') || 'Next 30 days'}</p>
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
                placeholder={t('fleet.drivers.searchPlaceholder') || "Search by name, employee code or phone..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] rounded-xl text-xs text-[var(--color-foreground,#0F172A)] outline-none focus:border-[var(--color-primary,#2563EB)] transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-[var(--color-border,#D9DADD)] rounded-xl text-xs font-semibold text-[var(--color-foreground,#0F172A)] bg-[var(--color-card,#ffffff)] outline-none cursor-pointer"
            >
              <option value="">{t('fleet.drivers.allStatuses') || 'All Statuses'}</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="ON_TRIP">ON TRIP</option>
              <option value="OFF_DUTY">OFF DUTY</option>
              <option value="ON_LEAVE">ON LEAVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
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
              {isRTL ? 'جاري تحميل قائمة السائقين...' : 'Loading drivers directory...'}
            </div>
          ) : drivers.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'لا يوجد سائقون متاحون حالياً.' : 'No drivers found in database.'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-[var(--color-border,#D9DADD)]">
                <tr>
                  <th className="p-3.5 w-12 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedRows.length === drivers.length && drivers.length > 0}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary,#2563EB)] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.drivers.driverName') || 'DRIVER NAME'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.drivers.empCode') || 'EMP. CODE'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.drivers.contact') || 'CONTACT'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.drivers.license') || 'LICENSE'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.drivers.licExpiry') || 'LIC. EXPIRY'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.drivers.status') || 'STATUS'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.drivers.assignedVehicle') || 'ASSIGNED VEHICLE'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)] text-center">{t('fleet.drivers.actions') || 'ACTIONS'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border,#D9DADD)] text-xs text-[var(--color-foreground,#0F172A)]">
                {drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(d.id)}
                        onChange={() => handleSelectRow(d.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary,#2563EB)] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td 
                      onClick={() => navigate(`/fleet-dashboard/driver-details/${d.id}`)}
                      className="p-3.5 font-bold text-[var(--color-primary,#2563EB)] cursor-pointer hover:underline"
                    >
                      {d.driverName || d.name}
                    </td>
                    <td className="p-3.5 font-medium text-[var(--color-foreground-muted,#656873)]">{d.employeeCode || '–'}</td>
                    <td className="p-3.5 font-medium">{d.phone || '–'}</td>
                    <td className="p-3.5 font-medium">{d.licenseInfo || '–'}</td>
                    <td className="p-3.5 text-[var(--color-foreground-muted,#656873)]">{d.licenseExpiry || '–'}</td>
                    <td className="p-3.5">
                      {getStatusBadge(d.status)}
                    </td>
                    <td className="p-3.5 font-semibold text-[#0178BC]">{d.vehiclePlate || d.assignedVehiclePlateNumber || 'Unassigned'}</td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/fleet-dashboard/driver-details/${d.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#2563EB)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="View Driver"
                        >
                          <Eye className="w-4 h-4 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => navigate(`/fleet-dashboard/drivers/driver-form/${d.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#2563EB)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Edit Driver"
                        >
                          <Edit className="w-4 h-4 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[#D6282F] hover:bg-rose-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Delete Driver"
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
            {t('fleet.vehicles.showing') || 'Showing'} {drivers.length > 0 ? (pagination.page * pagination.size) + 1 : 0} {t('fleet.vehicles.of') || 'of'} {pagination.totalElements || drivers.length} {t('fleet.vehicles.records') || 'records'}
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={pagination.page === 0}
              onClick={() => fetchDrivers(pagination.page - 1, pagination.size)}
              className="px-2.5 py-1.5 border border-[var(--color-border,#D9DADD)] rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              &lt;
            </button>
            <button className="px-3 py-1.5 bg-[var(--color-primary,#2563EB)] text-white font-bold rounded-lg cursor-pointer">
              {pagination.page + 1}
            </button>
            <button 
              disabled={(pagination.page + 1) * pagination.size >= pagination.totalElements}
              onClick={() => fetchDrivers(pagination.page + 1, pagination.size)}
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

export default Drivers;
